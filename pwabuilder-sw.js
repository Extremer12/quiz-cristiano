// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const VERSION = '1.3.0';
const CACHE = `quiz-cristiano-pwa-v${VERSION}`;
const STATIC_CACHE = `quiz-cristiano-static-v${VERSION}`;
const DYNAMIC_CACHE = `quiz-cristiano-dynamic-v${VERSION}`;

// ✅ PÁGINA OFFLINE CORREGIDA
const offlineFallbackPage = "/index.html"; // ← CORREGIDO

// ✅ ARCHIVOS CRÍTICOS PARA CACHE
const criticalAssets = [
  '/',
  '/index.html',
  '/single-player-new.html',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/images/mascota.png',
  '/manifest.json',
  '/css/pages/dark-mode.css',
  '/js/modules/gamedatamanager.js'
];

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ✅ INSTALACIÓN MEJORADA
self.addEventListener('install', async (event) => {
  console.log(`🔧 PWA Builder SW v${VERSION}: Installing...`);
  
  event.waitUntil(
    Promise.all([
      // Cache de páginas offline
      caches.open(CACHE).then((cache) => cache.add(offlineFallbackPage)),
      
      // Cache de assets críticos
      caches.open(STATIC_CACHE).then(cache => cache.addAll(criticalAssets)),
      
      // Skip waiting para actualización inmediata
      self.skipWaiting()
    ])
  );
});

// ✅ ACTIVACIÓN CON LIMPIEZA
self.addEventListener('activate', event => {
  console.log(`✅ PWA Builder SW v${VERSION}: Activating...`);
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('quiz-cristiano-') && 
              !cacheName.includes(VERSION)
            )
            .map(cacheName => {
              console.log('🗑️ PWA Builder SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Tomar control inmediato
      self.clients.claim()
    ])
  );
});

// ✅ WORKBOX NAVIGATION PRELOAD
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// ✅ FETCH MEJORADO
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Solo manejar requests GET
  if (request.method !== 'GET') return;
  
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

// ✅ MANEJO DE NAVEGACIÓN INTELIGENTE - ANTI-BUCLE
async function handleNavigation(event) {
  const url = new URL(event.request.url);
  
  // ✅ PREVENIR BUCLES DE REDIRECCIÓN
  if (url.pathname === '/login.html' || url.pathname === '/index.html') {
    console.log('🛡️ PWA Builder SW: Navegación crítica detectada, permitiendo directo');
    
    try {
      // Para páginas críticas, intentar network directo sin timeout agresivo
      const networkResp = await fetch(event.request, {
        cache: 'no-cache'
      });
      
      if (networkResp.ok) {
        console.log('🌐 PWA Builder SW: Página crítica cargada desde network');
        return networkResp;
      }
    } catch (error) {
      console.log('⚠️ PWA Builder SW: Error en página crítica, usando cache');
    }
    
    // Si falla, buscar en cache sin fallback automático
    const dynamicCache = await caches.open(DYNAMIC_CACHE);
    const cached = await dynamicCache.match(event.request);
    
    if (cached) {
      console.log('💾 PWA Builder SW: Página crítica desde cache');
      return cached;
    }
    
    // Para login/index, NO usar fallback genérico
    console.log('❌ PWA Builder SW: Página crítica no disponible');
    return new Response(
      `<!DOCTYPE html>
      <html><head><title>Cargando...</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h2>🔄 Cargando...</h2>
        <p>Verificando conexión...</p>
        <script>
          setTimeout(() => {
            if (navigator.onLine) {
              window.location.reload();
            }
          }, 2000);
        </script>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  
  // ✅ PARA OTRAS PÁGINAS, LÓGICA NORMAL
  try {
    // Intentar preload response
    const preloadResp = await event.preloadResponse;
    if (preloadResp) {
      console.log('⚡ PWA Builder SW: Using preload response');
      return preloadResp;
    }

    // Intentar network con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const networkResp = await fetch(event.request, {
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    
    if (networkResp.ok) {
      // Cache la respuesta para futuro uso
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(event.request, networkResp.clone());
      console.log('🌐 PWA Builder SW: Network success and cached');
    }
    
    return networkResp;
    
  } catch (error) {
    console.log('💾 PWA Builder SW: Network failed, trying cache');
    
    // Intentar cache dinámico primero
    const dynamicCache = await caches.open(DYNAMIC_CACHE);
    const cached = await dynamicCache.match(event.request);
    
    if (cached) {
      return cached;
    }
    
    // Fallback a página offline SOLO para páginas no críticas
    const cache = await caches.open(CACHE);
    const cachedResp = await cache.match(offlineFallbackPage);
    return cachedResp || new Response(
      '<h1>🔌 Sin Conexión</h1><p>Esta página no está disponible offline.</p>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// ✅ MANEJO DE ASSETS CON CACHE FIRST
async function handleAssets(event) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(event.request);
  
  if (cached) {
    console.log('💾 PWA Builder SW: Asset served from cache');
    return cached;
  }
  
  try {
    const response = await fetch(event.request);
    if (response.ok) {
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