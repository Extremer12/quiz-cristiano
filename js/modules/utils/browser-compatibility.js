/**
 * BROWSER COMPATIBILITY UTILITIES
 * Utilidades para verificar y manejar compatibilidad de navegadores
 */

class BrowserCompatibility {
  constructor() {
    this.supportCache = new Map();
    this.polyfillsLoaded = new Set();
    this.initializeCompatibilityChecks();
  }

  /**
   * Inicializa verificaciones de compatibilidad
   */
  initializeCompatibilityChecks() {
    console.log("Inicializando verificaciones de compatibilidad...");

    // Verificar características críticas
    this.checkCriticalFeatures();

    // Cargar polyfills necesarios
    this.loadRequiredPolyfills();

    console.log("✅ Verificaciones de compatibilidad completadas");
  }

  /**
   * Verifica características críticas del navegador
   */
  checkCriticalFeatures() {
    const features = {
      closest: this.checkClosestSupport(),
      intersectionObserver: this.checkIntersectionObserverSupport(),
      fetch: this.checkFetchSupport(),
      promises: this.checkPromiseSupport(),
      classList: this.checkClassListSupport(),
      addEventListener: this.checkEventListenerSupport(),
    };

    // Guardar en cache
    Object.entries(features).forEach(([feature, supported]) => {
      this.supportCache.set(feature, supported);
      console.log(
        `${supported ? "✅" : "❌"} ${feature}: ${
          supported ? "Soportado" : "No soportado"
        }`
      );
    });

    return features;
  }

  /**
   * Verifica si el método closest() está disponible
   */
  checkClosestSupport() {
    try {
      return !!Element.prototype.closest;
    } catch (error) {
      console.warn("Error verificando soporte de closest():", error);
      return false;
    }
  }

  /**
   * Verifica soporte de IntersectionObserver
   */
  checkIntersectionObserverSupport() {
    try {
      return "IntersectionObserver" in window;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica soporte de fetch API
   */
  checkFetchSupport() {
    try {
      return "fetch" in window;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica soporte de Promises
   */
  checkPromiseSupport() {
    try {
      return "Promise" in window && typeof Promise.resolve === "function";
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica soporte de classList
   */
  checkClassListSupport() {
    try {
      return "classList" in document.createElement("div");
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica soporte de addEventListener
   */
  checkEventListenerSupport() {
    try {
      return "addEventListener" in window;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene información del navegador
   */
  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    const browserInfo = {
      userAgent,
      isIE: /MSIE|Trident/.test(userAgent),
      isEdge: /Edge/.test(userAgent),
      isChrome: /Chrome/.test(userAgent) && !/Edge/.test(userAgent),
      isFirefox: /Firefox/.test(userAgent),
      isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
      isOpera: /Opera|OPR/.test(userAgent),
      isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
      version: this.extractBrowserVersion(userAgent),
    };

    return browserInfo;
  }

  /**
   * Extrae versión del navegador
   */
  extractBrowserVersion(userAgent) {
    try {
      const matches = userAgent.match(
        /(Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident)[\s\/](\d+)/
      );
      return matches ? matches[2] : "unknown";
    } catch (error) {
      return "unknown";
    }
  }

  /**
   * Verifica si una característica está soportada
   */
  isSupported(feature) {
    if (this.supportCache.has(feature)) {
      return this.supportCache.get(feature);
    }

    // Verificaciones dinámicas
    switch (feature) {
      case "closest":
        return this.checkClosestSupport();
      case "intersectionObserver":
        return this.checkIntersectionObserverSupport();
      case "fetch":
        return this.checkFetchSupport();
      case "promises":
        return this.checkPromiseSupport();
      case "classList":
        return this.checkClassListSupport();
      case "addEventListener":
        return this.checkEventListenerSupport();
      default:
        console.warn(`Característica desconocida: ${feature}`);
        return false;
    }
  }

  /**
   * Carga polyfills necesarios
   */
  loadRequiredPolyfills() {
    const polyfillsNeeded = [];

    // Verificar qué polyfills se necesitan
    if (!this.isSupported("closest")) {
      polyfillsNeeded.push("closest");
    }

    if (!this.isSupported("fetch")) {
      polyfillsNeeded.push("fetch");
    }

    if (!this.isSupported("promises")) {
      polyfillsNeeded.push("promises");
    }

    // Cargar polyfills
    polyfillsNeeded.forEach((polyfill) => {
      this.loadPolyfill(polyfill);
    });

    if (polyfillsNeeded.length > 0) {
      console.log(`Polyfills cargados: ${polyfillsNeeded.join(", ")}`);
    }
  }

  /**
   * Carga un polyfill específico
   */
  loadPolyfill(polyfillName) {
    if (this.polyfillsLoaded.has(polyfillName)) {
      return;
    }

    try {
      switch (polyfillName) {
        case "closest":
          this.loadClosestPolyfill();
          break;
        case "fetch":
          this.loadFetchPolyfill();
          break;
        case "promises":
          this.loadPromisePolyfill();
          break;
        default:
          console.warn(`Polyfill desconocido: ${polyfillName}`);
          return;
      }

      this.polyfillsLoaded.add(polyfillName);
      console.log(`✅ Polyfill cargado: ${polyfillName}`);
    } catch (error) {
      console.error(`❌ Error cargando polyfill ${polyfillName}:`, error);
    }
  }

  /**
   * Carga polyfill para closest()
   */
  loadClosestPolyfill() {
    if (!Element.prototype.closest) {
      Element.prototype.closest = function (selector) {
        let element = this;

        while (element && element.nodeType === 1) {
          if (element.matches && element.matches(selector)) {
            return element;
          }

          // Fallback para matches()
          if (!element.matches) {
            if (element.webkitMatchesSelector) {
              element.matches = element.webkitMatchesSelector;
            } else if (element.mozMatchesSelector) {
              element.matches = element.mozMatchesSelector;
            } else if (element.msMatchesSelector) {
              element.matches = element.msMatchesSelector;
            } else {
              // Fallback manual usando querySelectorAll
              element.matches = function (sel) {
                const matches = (
                  this.document || this.ownerDocument
                ).querySelectorAll(sel);
                let i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {}
                return i > -1;
              };
            }
          }

          if (element.matches(selector)) {
            return element;
          }

          element = element.parentElement;
        }

        return null;
      };
    }
  }

  /**
   * Carga polyfill básico para fetch (simplificado)
   */
  loadFetchPolyfill() {
    if (!window.fetch) {
      // Polyfill muy básico usando XMLHttpRequest
      window.fetch = function (url, options = {}) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(options.method || "GET", url);

          if (options.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value);
            });
          }

          xhr.onload = () => {
            resolve({
              ok: xhr.status >= 200 && xhr.status < 300,
              status: xhr.status,
              json: () => Promise.resolve(JSON.parse(xhr.responseText)),
              text: () => Promise.resolve(xhr.responseText),
            });
          };

          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(options.body);
        });
      };
    }
  }

  /**
   * Carga polyfill básico para Promises
   */
  loadPromisePolyfill() {
    if (!window.Promise) {
      // Polyfill muy básico para Promise
      window.Promise = function (executor) {
        const self = this;
        self.state = "pending";
        self.value = undefined;
        self.handlers = [];

        function resolve(result) {
          if (self.state === "pending") {
            self.state = "fulfilled";
            self.value = result;
            self.handlers.forEach(handle);
            self.handlers = null;
          }
        }

        function reject(error) {
          if (self.state === "pending") {
            self.state = "rejected";
            self.value = error;
            self.handlers.forEach(handle);
            self.handlers = null;
          }
        }

        function handle(handler) {
          if (self.state === "pending") {
            self.handlers.push(handler);
          } else {
            if (
              self.state === "fulfilled" &&
              typeof handler.onFulfilled === "function"
            ) {
              handler.onFulfilled(self.value);
            }
            if (
              self.state === "rejected" &&
              typeof handler.onRejected === "function"
            ) {
              handler.onRejected(self.value);
            }
          }
        }

        this.then = function (onFulfilled, onRejected) {
          return new Promise((resolve, reject) => {
            handle({
              onFulfilled: function (result) {
                try {
                  resolve(onFulfilled ? onFulfilled(result) : result);
                } catch (ex) {
                  reject(ex);
                }
              },
              onRejected: function (error) {
                try {
                  resolve(onRejected ? onRejected(error) : error);
                } catch (ex) {
                  reject(ex);
                }
              },
            });
          });
        };

        executor(resolve, reject);
      };

      Promise.resolve = function (value) {
        return new Promise((resolve) => resolve(value));
      };

      Promise.reject = function (error) {
        return new Promise((resolve, reject) => reject(error));
      };
    }
  }

  /**
   * Método helper para encontrar el elemento más cercano (compatible)
   */
  findClosestElement(element, selector) {
    // Usar closest() nativo si está disponible
    if (element && element.closest) {
      return element.closest(selector);
    }

    // Usar polyfill si está cargado
    if (element && Element.prototype.closest) {
      return element.closest(selector);
    }

    // Fallback manual
    return this.closestFallback(element, selector);
  }

  /**
   * Fallback manual para closest()
   */
  closestFallback(element, selector) {
    if (!element || !selector) return null;

    let current = element;

    while (current && current.nodeType === 1) {
      try {
        // Intentar usar matches() o sus variantes
        if (current.matches && current.matches(selector)) {
          return current;
        } else if (
          current.webkitMatchesSelector &&
          current.webkitMatchesSelector(selector)
        ) {
          return current;
        } else if (
          current.mozMatchesSelector &&
          current.mozMatchesSelector(selector)
        ) {
          return current;
        } else if (
          current.msMatchesSelector &&
          current.msMatchesSelector(selector)
        ) {
          return current;
        } else {
          // Fallback usando querySelectorAll
          const matches = (
            current.document || current.ownerDocument
          ).querySelectorAll(selector);
          for (let i = 0; i < matches.length; i++) {
            if (matches[i] === current) {
              return current;
            }
          }
        }
      } catch (error) {
        console.warn("Error en closestFallback:", error);
      }

      current = current.parentElement;
    }

    return null;
  }

  /**
   * Obtiene métricas de compatibilidad
   */
  getCompatibilityReport() {
    const browserInfo = this.getBrowserInfo();
    const supportedFeatures = {};

    // Verificar todas las características en cache
    this.supportCache.forEach((supported, feature) => {
      supportedFeatures[feature] = supported;
    });

    return {
      browser: browserInfo,
      features: supportedFeatures,
      polyfillsLoaded: Array.from(this.polyfillsLoaded),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Limpia recursos
   */
  cleanup() {
    this.supportCache.clear();
    this.polyfillsLoaded.clear();
  }
}

// Crear instancia global
if (typeof window !== "undefined") {
  window.BrowserCompatibility = BrowserCompatibility;
  window.browserCompatibility = new BrowserCompatibility();
}

// Exportar para módulos
if (typeof module !== "undefined" && module.exports) {
  module.exports = BrowserCompatibility;
}
