self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { notification: { body: event.data.text() } };
  }

  const notification = payload.notification || {};
  const data = payload.data || {};
  event.waitUntil(self.registration.showNotification(
    notification.title || data.title || 'Payment reminder',
    {
      body: notification.body || data.body,
      icon: '/icon.png',
      badge: '/icon.png',
      data: { url: data.url || '/accounts?tab=credit' },
    },
  ));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    const existingClient = clientList.find((client) => client.url.startsWith(self.location.origin));
    if (existingClient) {
      existingClient.navigate(targetUrl);
      return existingClient.focus();
    }
    return clients.openWindow(targetUrl);
  }));
});
