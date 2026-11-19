const CACHE_NAME = 'kora-core-v3';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/kora-icon.svg'];
const REST_TIMER_TAG = 'kora-rest-timer';

let timerTimeoutId = null;
let timerResolve = null;

function clearScheduledTimer() {
  if (timerTimeoutId !== null) {
    clearTimeout(timerTimeoutId);
    timerTimeoutId = null;
  }
  if (timerResolve) {
    timerResolve();
    timerResolve = null;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (
    url.pathname.endsWith('personal-seed.local.json') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/node_modules/')
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'SCHEDULE_TIMER') {
    clearScheduledTimer();

    const targetEndTime = Number(data.targetEndTime);
    if (!Number.isFinite(targetEndTime)) return;

    const delay = Math.max(0, targetEndTime - Date.now());
    const waitPromise = new Promise((resolve) => {
      timerResolve = resolve;
      timerTimeoutId = setTimeout(async () => {
        timerTimeoutId = null;
        timerResolve = null;
        try {
          await self.registration.showNotification(
            data.title || 'Satzpause beendet 💪',
            {
              body: data.body || 'Zeit für den nächsten Satz!',
              icon: '/kora-icon.svg',
              badge: '/kora-icon.svg',
              tag: REST_TIMER_TAG,
              renotify: true,
              requireInteraction: false,
              vibrate: [250, 100, 250]
            }
          );
        } catch {
          // Ignore if notification permissions are missing or blocked
        } finally {
          resolve();
        }
      }, delay);
    });

    if (typeof event.waitUntil === 'function') {
      event.waitUntil(waitPromise);
    }
    return;
  }

  if (data.type === 'CANCEL_TIMER') {
    clearScheduledTimer();

    if (self.registration && typeof self.registration.getNotifications === 'function') {
      const closePromise = self.registration
        .getNotifications({ tag: REST_TIMER_TAG })
        .then((notifications) => notifications.forEach((n) => n.close()))
        .catch(() => undefined);

      if (typeof event.waitUntil === 'function') {
        event.waitUntil(closePromise);
      }
    }
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        const matching = clientList.find(
          (client) => client.url && client.url.startsWith(self.location.origin) && 'focus' in client
        );
        if (matching) {
          return matching.focus();
        }
        const anyFocusable = clientList.find((client) => 'focus' in client);
        if (anyFocusable) {
          return anyFocusable.focus();
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
        return undefined;
      })
      .catch(() => undefined)
  );
});
