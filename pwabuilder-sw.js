// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const VERSION = '2.0.0';
const CACHE = `quiz-cristiano-pwa-v${VERSION}`;
const STATIC_CACHE = `quiz-cristiano-static-v${VERSION}`;
const DYNAMIC_CACHE = `quiz-cristiano-dynamic-v${VERSION}`;

// ... (lines 10-82 unchanged)

// ✅ FETCH MEJORADO
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Solo manejar requests GET y esquemas soportados
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // Ignorar requests externos críticos
  if (url.hostname.includes('firebase') ||
    url.hostname.includes('google-analytics') ||
    url.hostname.includes('mercadopago')) {
    return;
  }

  // ✅ ESTRATEGIA DE NAVEGACIÓN MEJORADA
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigation(event));
  } else {
    // ✅ ESTRATEGIA PARA ASSETS
    event.respondWith(handleAssets(event));
  }
});

// ... (lines 106-206 unchanged)

// ✅ MANEJO DE ASSETS CON CACHE FIRST
async function handleAssets(event) {
  // Ignorar esquemas no soportados (chrome-extension, etc)
  if (!event.request.url.startsWith('http')) return;

  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(event.request);

  if (cached) {
    console.log('💾 PWA Builder SW: Asset served from cache');
    return cached;
  }

  try {
    const response = await fetch(event.request);
    if (response.ok && response.type === 'basic') { // Solo cachear respuestas básicas (mismo origen)
      cache.put(event.request, response.clone());
      console.log('🌐 PWA Builder SW: Asset fetched and cached');
    }
    return response;
  } catch (error) {
    console.log('❌ PWA Builder SW: Asset fetch failed');
    // Intentar fallback para imágenes
    if (event.request.url.includes('.png') || event.request.url.includes('.jpg')) {
      return cache.match('/assets/icons/icon-192.png');
    }
    throw error;
  }
}

// ✅ BACKGROUND SYNC (para PWA Builder score)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('🔄 PWA Builder SW: Background sync executing');
  // Sincronizar datos críticos
  try {
    const response = await fetch('/data/questions.json');
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put('/data/questions.json', response.clone());
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// ✅ PUSH NOTIFICATIONS (para PWA Builder score)
self.addEventListener('push', event => {
  console.log('📱 PWA Builder SW: Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'Nueva actualización disponible',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-96.png',
    tag: 'quiz-cristiano-update',
    actions: [
      {
        action: 'open',
        title: 'Abrir App'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Quiz Cristiano', options)
  );
});

// ✅ NOTIFICATION CLICK
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log(`✅ PWA Builder SW v${VERSION} loaded successfully`);