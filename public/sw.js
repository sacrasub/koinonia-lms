// Koinonia LMS Service Worker (PWA & Web Push)
const CACHE_NAME = 'koinonia-lms-v1.0.3';
const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
  '/logo-koinonia-lms.png',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache parcial instalado:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Network-first para assets estáticos, ignorando chamadas de API e chunks dinâmicos do Next.js
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignorar chamadas Supabase, Google APIs ou chunks/assets internos do Next.js
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('googleapis.com') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/')
  ) {
    return;
  }

  // Apenas métodos GET
  if (event.request.method !== 'GET') return;

  // Para navegação entre páginas (HTML), sempre buscar da rede para garantir os hashes de chunk mais recentes
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Koinonia LMS - Modo Offline</title><style>body{font-family:sans-serif;background:#090d16;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;text-align:center;}h1{font-size:20px;}p{font-size:14px;color:#94a3b8;}</style></head><body><div><h1>Você está offline</h1><p>Conecte-se à internet e recarregue para acessar a plataforma.</p><button onclick="window.location.reload()" style="margin-top:16px;padding:10px 20px;background:#2563eb;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Tentar Novamente</button></div></body></html>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

// Suporte a Web Push Notifications (Item B1)
self.addEventListener('push', (event) => {
  let data = {
    title: 'Koinonia LMS • Nova Notificação',
    body: 'Há uma nova atividade acadêmica na plataforma.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    url: '/'
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    data: {
      url: data.url || '/'
    },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Abrir Plataforma' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
