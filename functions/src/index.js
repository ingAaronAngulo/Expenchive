const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();

// Import function modules
const { createRecurringExpenses } = require("./recurring-expenses");
const { reduceInstallmentDebt } = require("./credit-debt-reduction");
const { sendCreditCardPaymentReminders } = require("./payment-reminders");

// Export functions
exports.createRecurringExpenses = createRecurringExpenses;
exports.reduceInstallmentDebt = reduceInstallmentDebt;
exports.sendCreditCardPaymentReminders = sendCreditCardPaymentReminders;
