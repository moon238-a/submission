import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import CONFIG from './config.js';

const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

registerRoute(
  ({ url }) => {
    return url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome');
  },
  new CacheFirst({
    cacheName: 'fontawesome',
  }),
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return request.method === 'GET' && baseUrl.origin === url.origin && request.destination !== 'image';
  },
  new NetworkFirst({
    cacheName: 'story-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      })
    ]
  }),
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'story-api-images',
  }),
);

registerRoute(
  ({ url }) => {
    return url.origin.includes('maptiler');
  },
  new CacheFirst({
    cacheName: 'maptiler-api',
  }),
);

self.addEventListener('push', (event) => {
    console.log('Service worker pushing...');
    console.log('Push event diterima oleh Service Worker!');

    event.waitUntil((async () => {
        if (!event.data) {
            console.warn('Push event tidak memiliki data.');
            return;
        }

        let data;

        try {
          data = event.data.json();
        } catch (error) {
          data = {
            title: 'Notifikasi Baru',
            body: event.data.text(),
          }
        }

        console.log('Payload push:', data);

        await self.registration.showNotification(
            data.title || 'Notifikasi',
            {
                body: data.body || data.options?.body || 'Ada notifikasi baru.',
                icon: './images/icons/maskable-icon-x192.png',
                badge: './images/icons/maskable-icon-x48.png',
                ...data.options,
                data: data.data || data.options?.data || {},
            },
        );
    })().catch((error) => {
        console.error('Push notification error:', error);
    }));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const notificationData = event.notification.data || {};

    const targetUrl = notificationData.id
        ? `/#/stories/${encodeURIComponent(notificationData.id)}`
        : '/#/';

    event.waitUntil(
        clients.openWindow(new URL(targetUrl, self.location.origin).href),
    );
});