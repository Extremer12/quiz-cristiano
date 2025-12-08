/**
 * SERVICE WORKER - TIENDA
 * Quiz Cristiano - Cache y optimizaciones offline para la tienda
 */

const CACHE_NAME = "quiz-cristiano-store-v1";
const STATIC_CACHE = "static-v1";
const DYNAMIC_CACHE = "dynamic-v1";

// Archivos estáticos para cachear
const STATIC_FILES = [
  "/store.html",
  "/js/modules/store/StoreController.js",
  "/js/modules/store/ProductService.js",
  "/js/modules/store/CartService.js",
  "/js/modules/store/PaymentService.js",
  "/js/modules/store/UserStoreDataManager.js",
  "/js/modules/store/StoreAnalytics.js",
  "/js/modules/store/StoreConfig.js",
  "/css/pages/dark-mode.css",
  "/css/pages/safari-fixes.css",
  "/assets/icons/icon-192.png",
  "/assets/images/placeholder-product.png",
  "/assets/images/placeholder-item.png",
];

// Instalar service worker
self.addEventListener("install", (event) => {
  console.log("Store SW: Instalando...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Store SW: Cacheando archivos estáticos");
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log("✅ Store SW: Instalación completa");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("❌ Store SW: Error en instalación:", error);
      })
  );
});

// Activar service worker
self.addEventListener("activate", (event) => {
  console.log("Store SW: Activando...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Store SW: Eliminando cache antiguo:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("✅ Store SW: Activación completa");
        return self.clients.claim();
      })
  );
});

// Interceptar requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Estrategia de cache
  if (isStaticFile(request.url)) {
    event.respondWith(cacheFirst(request));
  } else if (isApiRequest(request.url)) {
    event.respondWith(networkFirst(request));
  } else if (isImageRequest(request.url)) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(networkFirst(request));
  }
});

// Verificar si es archivo estático
function isStaticFile(url) {
  return STATIC_FILES.some((file) => url.includes(file));
}

// Verificar si es request de API
function isApiRequest(url) {
  return url.includes("/api/") || url.includes("firestore");
}

// Verificar si es imagen
function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
}

// Estrategia Cache First
async function cacheFirst(request, cacheName = STATIC_CACHE) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Actualizar cache en background si es necesario
      if (shouldUpdateCache(cachedResponse)) {
        updateCacheInBackground(request, cache);
      }
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("❌ Store SW: Error en cacheFirst:", error);
    return getOfflineFallback(request);
  }
}

// Estrategia Network First
async function networkFirst(request, cacheName = DYNAMIC_CACHE) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.warn("⚠️ Store SW: Network failed, trying cache:", error);

    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return getOfflineFallback(request);
  }
}

// Verificar si el cache necesita actualización
function shouldUpdateCache(response) {
  const cacheDate = new Date(response.headers.get("date"));
  const now = new Date();
  const maxAge = 5 * 60 * 1000; // 5 minutos

  return now - cacheDate > maxAge;
}

// Actualizar cache en background
async function updateCacheInBackground(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    console.warn("⚠️ Store SW: Error actualizando cache en background:", error);
  }
}

// Fallback offline
function getOfflineFallback(request) {
  const url = new URL(request.url);

  if (isImageRequest(request.url)) {
    return caches.match("/assets/images/placeholder-offline.png");
  }

  if (request.destination === "document") {
    return caches.match("/offline.html");
  }

  return new Response("Offline", {
    status: 503,
    statusText: "Service Unavailable",
  });
}

// Limpiar cache periódicamente
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAN_CACHE") {
    cleanOldCache();
  }
});

async function cleanOldCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();

    // Eliminar entradas más antiguas si hay demasiadas
    if (requests.length > 100) {
      const toDelete = requests.slice(0, 50);
      await Promise.all(toDelete.map((request) => cache.delete(request)));
      console.log("Store SW: Cache limpiado");
    }
  } catch (error) {
    console.error("❌ Store SW: Error limpiando cache:", error);
  }
}

// Limpiar cache automáticamente cada hora
setInterval(cleanOldCache, 60 * 60 * 1000);
