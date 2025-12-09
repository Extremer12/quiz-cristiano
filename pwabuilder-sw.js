// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const VERSION = '2.1.0';
const CACHE = `quiz-cristiano-pwa-v${VERSION}`;
const STATIC_CACHE = `quiz-cristiano-static-v${VERSION}`;
const DYNAMIC_CACHE = `quiz-cristiano-dynamic-v${VERSION}`;

// Lista de archivos para precache (nuevas rutas migradas en Fase 2)
const PRECACHE_URLS = [
  // Páginas HTML principales
  '/',
  '/index.html',
  '/offline.html',

  // Páginas migradas (Fase 2)
  '/ranking.html',
  '/logros.html',
  '/perfil.html',
  '/mini-juego.html',

  // Otras páginas importantes
  '/single-player-new.html',
  '/store.html',
  '/ajustes.html',

  // Archivo principal
  '/src/main.js',

  // Componentes migrados
  '/src/components/Ranking.js',
  '/src/components/Achievements.js',
  '/src/components/Profile.js',
  '/src/components/MiniGame.js',
  '/src/components/UI.js',
  '/src/components/UIEffects.js',

  // Servicios
  '/src/services/GameDataService.js',
  '/src/services/RankingService.js',
  '/src/services/AchievementService.js',
  '/src/services/MiniGameService.js',
  '/src/services/AuthService.js',
  '/src/services/FirebaseService.js',
  '/src/services/StoreService.js',

  // Core
  '/src/core/Game.js',
  '/src/core/QuestionManager.js',
  '/src/core/App.js',

  // Utils
  '/src/utils/Utils.js',

  // CSS principales
  '/css/styles.css',
  '/css/pages/dark-mode.css',

  // Assets críticos
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/manifest.json'
];

// ✅ INSTALL - Precachear archivos críticos
self.addEventListener('install', (event) => {
  console.log(`🔧 PWA Builder SW v${VERSION}: Installing...`);

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 PWA Builder SW: Precaching static files');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log(`✅ PWA Builder SW v${VERSION}: Installation complete`);
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ PWA Builder SW: Installation failed:', error);
      })
  );
});

// ✅ ACTIVATE - Limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  console.log(`🔄 PWA Builder SW v${VERSION}: Activating...`);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar cachés de versiones anteriores
            if (cacheName.startsWith('quiz-cristiano-') &&
              !cacheName.includes(VERSION)) {
              console.log(`🗑️ PWA Builder SW: Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log(`✅ PWA Builder SW v${VERSION}: Activation complete`);
        return self.clients.claim();
      })
  );
});

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

// ✅ MANEJO DE NAVEGACIÓN (Network First con fallback a offline)
async function handleNavigation(event) {
  try {
    // Intentar obtener de la red primero
    const networkResponse = await fetch(event.request);

    if (networkResponse.ok) {
      // Cachear la respuesta para uso futuro
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(event.request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    console.log('⚠️ PWA Builder SW: Network failed for navigation, trying cache');

    // Intentar obtener del cache
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(event.request);

    if (cachedResponse) {
      console.log('💾 PWA Builder SW: Serving navigation from cache');
      return cachedResponse;
    }

    // Si no está en cache, mostrar página offline
    console.log('📴 PWA Builder SW: Serving offline page');
    return cache.match('/offline.html');
  }
}

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