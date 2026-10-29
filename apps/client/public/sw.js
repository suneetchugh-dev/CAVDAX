// CAVDAX Background Push Service Worker
// Handles OS-level background Web Push notifications for architectural divergence alerts

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'CAVDAX Alert', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'CAVDAX: Architectural Divergence';
  const options = {
    body: data.body || 'A superseding change has broken an active architectural decision.',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'cavdax-divergence-alert',
    renotify: true,
    data: data.data || { url: '/console' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/console';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/console') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
