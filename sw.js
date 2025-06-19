const VERSION = '1.3.0'; // ✅ INCREMENTAR CUANDO HAGAS CAMBIOS
const CACHE_NAME = `quiz-cristiano-v${VERSION}`;
const STATIC_CACHE = `quiz-cristiano-static-v${VERSION}`;
const DYNAMIC_CACHE = `quiz-cristiano-dynamic-v${VERSION}`;

// ✅ CONFIGURACIÓN DE ACTUALIZACIÓN AGRESIVA
const FORCE_UPDATE_INTERVAL = 60000; // 1 minuto para desarrollo, 1 hora para producción
const SKIP_WAITING_ON_UPDATE = true;

// Archivos críticos para cache inmediato
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/single-player-new.html',
  '/store.html',
  '/logros.html',
  '/ranking.html',
  '/perfil.html',
  '/login.html',
  
  // CSS crítico
  '/css/pages/dark-mode.css',
  '/css/pages/safari-fixes.css',
  
  // JavaScript crítico  
  '/js/modules/gamedatamanager.js',
  '/js/modules/dark-mode.js',
  '/js/config/firebase-config.js',
  
  // Datos críticos
  '/data/questions.json',
  
  // Assets principales
  '/assets/images/mascota.png',
  '/assets/images/joy-trofeo.png',
  '/assets/images/fondo.png',
  '/assets/images/fondo-black.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  
  // Manifest
  '/manifest.json'
];

// ============================================
// INSTALACIÓN CON ACTUALIZACIÓN FORZADA
// ============================================

self.addEventListener('install', event => {
  console.log(`🔧 SW v${VERSION}: Installing...`);
  
  event.waitUntil(
    Promise.all([
      // Cache estático
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 SW: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // ✅ SKIP WAITING INMEDIATO PARA DESARROLLO
      SKIP_WAITING_ON_UPDATE ? self.skipWaiting() : Promise.resolve()
    ])
  );
});

// ============================================
// ACTIVACIÓN CON LIMPIEZA AGRESIVA
// ============================================

self.addEventListener('activate', event => {
  console.log(`✅ SW v${VERSION}: Activating...`);
  
  event.waitUntil(
    Promise.all([
      // ✅ LIMPIAR TODOS LOS CACHES ANTIGUOS
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('quiz-cristiano-') && 
              !cacheName.includes(VERSION) // Eliminar cualquier versión diferente
            )
            .map(cacheName => {
              console.log('🗑️ SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // ✅ TOMAR CONTROL INMEDIATO
      self.clients.claim(),
      
      // ✅ NOTIFICAR A LOS CLIENTES SOBRE LA ACTUALIZACIÓN
      notifyClientsOfUpdate()
    ])
  );
});

// ============================================
// FETCH CON ESTRATEGIA DE ACTUALIZACIÓN
// ============================================

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Solo manejar requests GET
  if (request.method !== 'GET') return;
  
  // Ignorar requests de Firebase
  if (url.hostname.includes('firebase') || 
      url.hostname.includes('google-analytics') ||
      url.hostname.includes('googletagmanager') ||
      url.hostname.includes('gstatic')) {
    return;
  }
  
  event.respondWith(handleRequest(request, url));
});

async function handleRequest(request, url) {
  try {
    // ✅ PÁGINAS HTML - NETWORK FIRST CON TIMEOUT
    if (isHTMLRequest(request)) {
      return await networkFirstWithTimeout(request, DYNAMIC_CACHE, 3000);
    }
    
    // ✅ ARCHIVOS ESTÁTICOS - STALE WHILE REVALIDATE
    if (isStaticAsset(url)) {
      return await staleWhileRevalidate(request, STATIC_CACHE);
    }
    
    // ✅ CDN ASSETS - Cache First con revalidación
    if (isCDNAsset(url)) {
      return await cacheFirstWithRevalidate(request, DYNAMIC_CACHE);
    }
    
    // ✅ DATOS JSON - Network First
    if (isDataRequest(url)) {
      return await networkFirstWithTimeout(request, DYNAMIC_CACHE, 2000);
    }
    
    // ✅ OTROS - Network First
    return await networkFirstWithTimeout(request, DYNAMIC_CACHE, 5000);
    
  } catch (error) {
    console.error('❌ SW: Error handling request:', error);
    return await getOfflineFallback(request);
  }
}

// ============================================
// ESTRATEGIAS DE CACHE MEJORADAS
// ============================================

async function networkFirstWithTimeout(request, cacheName, timeout = 3000) {
  const cache = await caches.open(cacheName);
  
  try {
    // ✅ USAR TIMEOUT PARA EVITAR ESPERAS LARGAS
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(request, { 
      signal: controller.signal,
      cache: 'no-cache' // ✅ FORZAR DESCARGA FRESCA
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      cache.put(request, response.clone());
      console.log('🌐 SW: Fresh content fetched:', request.url);
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
  
  // ✅ SIEMPRE INTENTAR REVALIDAR EN BACKGROUND
  const fetchPromise = fetch(request, { cache: 'no-cache' }).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
      console.log('🔄 SW: Background update completed:', request.url);
    }
    return response;
  }).catch(error => {
    console.log('⚠️ SW: Background update failed:', error);
    return cached;
  });
  
  // Devolver cache inmediatamente si existe, sino esperar network
  return cached || fetchPromise;
}

async function cacheFirstWithRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // ✅ REVALIDAR EN BACKGROUND DESPUÉS DE 5 MINUTOS
    const cacheDate = new Date(cached.headers.get('date') || 0);
    const isStale = Date.now() - cacheDate.getTime() > 300000; // 5 minutos
    
    if (isStale) {
      fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      }).catch(() => {});
    }
    
    return cached;
  }
  
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// ============================================
// SISTEMA DE NOTIFICACIÓN DE ACTUALIZACIONES
// ============================================

async function notifyClientsOfUpdate() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SW_UPDATED',
      version: VERSION,
      message: 'Nueva versión disponible'
    });
  });
}

// ✅ LISTENER PARA FORZAR ACTUALIZACIÓN DESDE LA APP
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('🔄 SW: Force update requested by client');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    console.log('🔍 SW: Update check requested');
    // Responder con la versión actual
    event.ports[0].postMessage({
      type: 'VERSION_INFO',
      version: VERSION
    });
  }
});

// ============================================
// HELPERS
// ============================================

function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => 
    url.pathname === asset || 
    url.href === asset ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.ico')
  );
}

function isCDNAsset(url) {
  return url.hostname.includes('cdnjs.cloudflare.com') ||
         url.hostname.includes('fonts.googleapis.com') ||
         url.hostname.includes('fonts.gstatic.com');
}

function isHTMLRequest(request) {
  return request.headers.get('accept')?.includes('text/html') ||
         request.url.endsWith('.html') ||
         (!request.url.includes('.') && !request.url.includes('api'));
}

function isDataRequest(url) {
  return url.pathname.endsWith('.json') || 
         url.pathname.includes('/data/') ||
         url.pathname.includes('/api/');
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
// VERIFICACIÓN PERIÓDICA DE ACTUALIZACIONES
// ============================================

setInterval(() => {
  console.log(`🔍 SW v${VERSION}: Checking for updates...`);
  // Notificar a los clientes que verifiquen actualizaciones
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'CHECK_FOR_UPDATES',
        version: VERSION
      });
    });
  });
}, FORCE_UPDATE_INTERVAL);

console.log(`✅ SW v${VERSION} loaded with aggressive update strategy`);