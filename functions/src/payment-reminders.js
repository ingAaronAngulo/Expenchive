const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

const db = admin.firestore();
const HOUR_TO_SEND = 9;
const DAY_MS = 24 * 60 * 60 * 1000;

function localDateParts(timezone, date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(
      parts
          .filter((part) => part.type !== "literal")
          .map((part) => [part.type, Number(part.value)]),
  );
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function nextDueDate(today, paymentDueDay) {
  let year = today.year;
  let month = today.month;
  let day = Math.min(paymentDueDay, daysInMonth(year, month));

  if (today.day > day) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    day = Math.min(paymentDueDay, daysInMonth(year, month));
  }

  return {year, month, day};
}

function daysBetween(today, dueDate) {
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  const dueUtc = Date.UTC(dueDate.year, dueDate.month - 1, dueDate.day);
  return Math.round((dueUtc - todayUtc) / DAY_MS);
}

function dateKey(date) {
  return `${date.year}${String(date.month).padStart(2, "0")}${String(date.day).padStart(2, "0")}`;
}

function isInvalidToken(error) {
  return error?.code === "messaging/registration-token-not-registered" ||
    error?.code === "messaging/invalid-registration-token";
}

exports.sendCreditCardPaymentReminders = onSchedule(
    {schedule: "every 60 minutes", timeZone: "UTC"},
    async () => {
      const tokenSnapshot = await db.collectionGroup("pushTokens").get();
      const cardsByUser = new Map();
      let sentCount = 0;

      for (const tokenDoc of tokenSnapshot.docs) {
        const subscription = tokenDoc.data();
        if (!subscription.enabled || !subscription.token || !subscription.timezone) continue;

        let today;
        try {
          today = localDateParts(subscription.timezone);
        } catch (error) {
          console.warn(`Skipping invalid timezone ${subscription.timezone}`, error);
          continue;
        }
        if (today.hour !== HOUR_TO_SEND) continue;

        const userId = tokenDoc.ref.parent.parent?.id;
        if (!userId) continue;
        if (!cardsByUser.has(userId)) {
          const cardSnapshot = await db.collection("creditCards").where("userId", "==", userId).get();
          cardsByUser.set(userId, cardSnapshot.docs.map((cardDoc) => ({id: cardDoc.id, ...cardDoc.data()})));
        }

        for (const card of cardsByUser.get(userId)) {
          if (!card.paymentDueDay || Number(card.currentBalance) <= 0) continue;

          const dueDate = nextDueDate(today, Number(card.paymentDueDay));
          const daysUntilDue = daysBetween(today, dueDate);
          const leadDays = Number(subscription.leadDays) || 3;
          if (daysUntilDue !== leadDays && daysUntilDue !== 0) continue;

          const reminderId = `${card.id}_${dateKey(dueDate)}_${daysUntilDue}`;
          const sentRef = tokenDoc.ref.collection("sentReminders").doc(reminderId);
          if ((await sentRef.get()).exists) continue;

          const title = daysUntilDue === 0 ? "Credit card payment due today" : "Upcoming credit card payment";
          const body = daysUntilDue === 0 ?
            `${card.name} is due today.` :
            `${card.name} is due in ${leadDays} days.`;

          try {
            await admin.messaging().send({
              token: subscription.token,
              notification: {title, body},
              data: {title, body, url: "/accounts?tab=credit"},
            });
            await sentRef.set({sentAt: admin.firestore.FieldValue.serverTimestamp()});
            sentCount += 1;
          } catch (error) {
            console.error(`Failed reminder for card ${card.id}`, error);
            if (isInvalidToken(error)) await tokenDoc.ref.delete();
          }
        }
      }

      console.log(`Sent ${sentCount} credit card payment reminder(s)`);
    },
);
