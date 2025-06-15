const CACHE_NAME = 'quiz-cristiano-v1.2';
const STATIC_CACHE = 'quiz-cristiano-static-v1.2';
const DYNAMIC_CACHE = 'quiz-cristiano-dynamic-v1.2';

// Archivos críticos para cache inmediato
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/single-player.html',
  '/store.html',
  '/logros.html',
  '/login.html',
  
  // CSS crítico
  '/css/pages/store.css',
  '/css/pages/logros.css',
  
  // JavaScript crítico
  '/js/pages/single-player.js',
  '/js/pages/store.js',
  '/js/pages/logros.js',
  '/js/config/firebase-config.js',
  
  // Datos críticos
  '/data/questions.json',
  
  // Assets principales
  '/assets/images/mascota.png',
  '/assets/images/fondo.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  
  // CDN críticos
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Lato:wght@300;400;700&display=swap'
];

// URLs que se cachean dinámicamente
const DYNAMIC_ASSETS = [
  'https://www.gstatic.com/firebasejs/',
  'https://fonts.gstatic.com/',
  'https://cdnjs.cloudflare.com/'
];

// ============================================
// INSTALACIÓN
// ============================================

self.addEventListener('install', event => {
  console.log('🔧 SW: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache estático
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Skip waiting para activar inmediatamente
      self.skipWaiting()
    ])
  );
});

// ============================================
// ACTIVACIÓN
// ============================================

self.addEventListener('activate', event => {
  console.log('✅ SW: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('quiz-cristiano-') && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE
            )
            .map(cacheName => {
              console.log('🗑️ SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Tomar control de todas las pestañas
      self.clients.claim()
    ])
  );
});

// ============================================
// FETCH - ESTRATEGIAS DE CACHE
// ============================================

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Solo manejar requests GET
  if (request.method !== 'GET') return;
  
  // Ignorar requests de Firebase Auth/Analytics
  if (url.hostname.includes('firebase') || 
      url.hostname.includes('google-analytics') ||
      url.hostname.includes('googletagmanager')) {
    return;
  }
  
  event.respondWith(handleRequest(request, url));
});

async function handleRequest(request, url) {
  try {
    // 1. ARCHIVOS ESTÁTICOS - Cache First
    if (isStaticAsset(url)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // 2. CDN ASSETS - Stale While Revalidate
    if (isCDNAsset(url)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }
    
    // 3. PÁGINAS HTML - Network First
    if (isHTMLRequest(request)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // 4. DATOS JSON - Network First con fallback
    if (isDataRequest(url)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // 5. OTROS - Network First
    return await networkFirst(request, DYNAMIC_CACHE);
    
  } catch (error) {
    console.error('❌ SW: Error handling request:', error);
    return await getOfflineFallback(request);
  }
}

// ============================================
// ESTRATEGIAS DE CACHE
// ============================================

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('💾 SW: Cache hit:', request.url);
    return cached;
  }
  
  console.log('🌐 SW: Cache miss, fetching:', request.url);
  const response = await fetch(request);
  
  if (response.ok) {
    cache.put(request, response.clone());
  }
  
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    console.log('🌐 SW: Network first:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('💾 SW: Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// ============================================
// HELPERS
// ============================================

function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.pathname === asset || url.href === asset);
}

function isCDNAsset(url) {
  return DYNAMIC_ASSETS.some(pattern => url.href.includes(pattern));
}

function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html');
}

function isDataRequest(url) {
  return url.pathname.endsWith('.json') || url.pathname.includes('/data/');
}

async function getOfflineFallback(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  if (isHTMLRequest(request)) {
    return await cache.match('/index.html') || new Response(
      '<h1>Offline</h1><p>Esta página no está disponible offline.</p>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
  
  return new Response('Offline', { status: 503 });
}

// ============================================
// BACKGROUND SYNC (para futuro)
// ============================================

self.addEventListener('sync', event => {
  console.log('🔄 SW: Background sync:', event.tag);
  
  if (event.tag === 'sync-game-data') {
    event.waitUntil(syncGameData());
  }
});

async function syncGameData() {
  // Implementar sincronización de datos de juego
  console.log('📊 SW: Syncing game data...');
}

// ============================================
// NOTIFICACIONES PUSH (para futuro)
// ============================================

self.addEventListener('push', event => {
  console.log('🔔 SW: Push notification received');
  
  const options = {
    body: event.data?.text() || 'Nueva notificación de Quiz Cristiano',
    icon: '/assets/icons/icon-192.png',
    badge: '/assets/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Quiz Cristiano', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

console.log('✅ SW: Service Worker loaded');