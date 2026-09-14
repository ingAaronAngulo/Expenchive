import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { deleteToken, getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { app, db } from '@/config/firebase';

const TOKEN_DOC_KEY = 'expenchive-push-token-doc';
const REMINDERS_ENABLED_KEY = 'expenchive-payment-reminders-enabled';
export const PAYMENT_REMINDER_LEAD_DAYS = 3;

async function tokenDocumentId(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function canUsePaymentReminders(): Promise<boolean> {
  return 'Notification' in window && 'serviceWorker' in navigator && await isSupported();
}

export function paymentRemindersAreEnabled(): boolean {
  return 'Notification' in window
    && localStorage.getItem(REMINDERS_ENABLED_KEY) === 'true'
    && Notification.permission === 'granted';
}

export async function enablePaymentReminders(userId: string): Promise<void> {
  if (!await canUsePaymentReminders()) throw new Error('unsupported');
  if (await Notification.requestPermission() !== 'granted') throw new Error('permission-denied');

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) throw new Error('missing-vapid-key');

  const messaging = getMessaging(app);
  const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration });
  if (!token) throw new Error('missing-token');

  const tokenDocId = await tokenDocumentId(token);
  await setDoc(doc(db, 'users', userId, 'pushTokens', tokenDocId), {
    token,
    enabled: true,
    leadDays: PAYMENT_REMINDER_LEAD_DAYS,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    updatedAt: serverTimestamp(),
  });

  localStorage.setItem(TOKEN_DOC_KEY, tokenDocId);
  localStorage.setItem(REMINDERS_ENABLED_KEY, 'true');
}

export async function disablePaymentReminders(userId: string): Promise<void> {
  const storedTokenDocId = localStorage.getItem(TOKEN_DOC_KEY);
  if (storedTokenDocId) {
    await deleteDoc(doc(db, 'users', userId, 'pushTokens', storedTokenDocId));
  }

  if (await canUsePaymentReminders()) {
    await deleteToken(getMessaging(app));
  }

  localStorage.removeItem(TOKEN_DOC_KEY);
  localStorage.removeItem(REMINDERS_ENABLED_KEY);
}

export async function initializeForegroundNotifications(): Promise<() => void> {
  if (!await canUsePaymentReminders()) return () => undefined;

  return onMessage(getMessaging(app), (payload) => {
    if (Notification.permission !== 'granted') return;
    const title = payload.notification?.title ?? payload.data?.title ?? 'Payment reminder';
    const notification = new Notification(title, {
      body: payload.notification?.body ?? payload.data?.body,
      icon: '/icon.png',
      data: { url: payload.data?.url ?? '/accounts?tab=credit' },
    });
    notification.onclick = () => window.focus();
  });
}
