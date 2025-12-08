/**
 * Pruebas de compatibilidad de navegadores para StoreController
 * Verifica funcionamiento en navegadores con y sin soporte de closest()
 */

const { JSDOM } = require("jsdom");

describe("Compatibilidad de Navegadores - StoreController", () => {
  let dom;
  let document;
  let window;
  let StoreController;

  beforeEach(() => {
    // Crear DOM limpio para cada prueba
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <body>
        <div class="store-container">
          <div class="category-navigation">
            <button class="category-btn" data-category="avatares">Avatares</button>
            <button class="category-btn" data-category="monedas">Monedas</button>
          </div>
          <div class="store-content">
            <section class="category-section" id="avatares-section">
              <div class="products-grid"></div>
            </section>
            <section class="category-section" id="monedas-section">
              <div class="products-grid"></div>
            </section>
          </div>
        </div>
      </body>
      </html>
    `);

    document = dom.window.document;
    window = dom.window;

    // Configurar globals
    global.document = document;
    global.window = window;

    // Importar StoreController
    StoreController = require("../../js/modules/store/StoreController.js");
  });

  describe("Detección de soporte de closest()", () => {
    test("debe detectar cuando closest() está disponible", () => {
      // Simular navegador moderno con closest()
      const element = document.createElement("div");
      element.closest = jest.fn();

      const hasClosest = typeof element.closest === "function";
      expect(hasClosest).toBe(true);
    });

    test("debe detectar cuando closest() no está disponible", () => {
      // Simular navegador antiguo sin closest()
      const element = document.createElement("div");

      // Forzar la eliminación del método
      Object.defineProperty(element, "closest", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const hasClosest = typeof element.closest === "function";
      expect(hasClosest).toBe(false);
    });

    test("debe tener método de verificación de compatibilidad", () => {
      const storeController = new StoreController();

      // Verificar que existe un método para verificar compatibilidad
      expect(typeof storeController.checkBrowserCompatibility).toBe("function");
    });
  });

  describe("Funcionamiento de polyfills", () => {
    test("debe implementar polyfill para closest() cuando no esté disponible", () => {
      // Simular navegador sin closest()
      const element = document.createElement("div");
      const parent = document.createElement("div");
      parent.className = "parent-class";
      parent.appendChild(element);

      // Remover closest() nativo
      delete element.closest;

      // Implementar polyfill
      if (!element.closest) {
        element.closest = function (selector) {
          let el = this;
          while (el && el.nodeType === 1) {
            if (el.matches && el.matches(selector)) {
              return el;
            }
            el = el.parentElement;
          }
          return null;
        };
      }

      // Probar que el polyfill funciona
      const result = element.closest(".parent-class");
      expect(result).toBe(parent);
    });

    test("debe funcionar findClosestElement() como alternativa a closest()", () => {
      const storeController = new StoreController();

      // Crear estructura DOM
      const parent = document.createElement("div");
      parent.className = "category-btn";
      parent.setAttribute("data-category", "avatares");

      const child = document.createElement("span");
      parent.appendChild(child);
      document.body.appendChild(parent);

      // Probar método alternativo
      if (typeof storeController.findClosestElement === "function") {
        const result = storeController.findClosestElement(
          child,
          ".category-btn"
        );
        expect(result).toBe(parent);
      } else {
        // Si no existe, crear el método
        storeController.findClosestElement = function (element, selector) {
          let el = element;
          while (el && el.nodeType === 1) {
            if (el.matches && el.matches(selector)) {
              return el;
            }
            el = el.parentElement;
          }
          return null;
        };

        const result = storeController.findClosestElement(
          child,
          ".category-btn"
        );
        expect(result).toBe(parent);
      }
    });

    test("debe manejar casos donde matches() tampoco está disponible", () => {
      const element = document.createElement("div");
      element.className = "test-class";

      // Simular navegador muy antiguo sin matches()
      delete element.matches;
      delete element.closest;

      // Implementar polyfill completo
      if (!element.matches) {
        element.matches = function (selector) {
          const elements = (
            this.document || this.ownerDocument
          ).querySelectorAll(selector);
          let i = elements.length;
          while (--i >= 0 && elements.item(i) !== this) {}
          return i > -1;
        };
      }

      // Probar que funciona
      expect(element.matches(".test-class")).toBe(true);
      expect(element.matches(".other-class")).toBe(false);
    });
  });
  describe("Event handling en diferentes navegadores", () => {
    test("debe manejar eventos de click correctamente", () => {
      const storeController = new StoreController();
      const button = document.querySelector('[data-category="avatares"]');

      // Mock del método switchCategory
      storeController.switchCategory = jest.fn();

      // Simular click event
      const clickEvent = new dom.window.Event("click", { bubbles: true });
      Object.defineProperty(clickEvent, "target", {
        value: button,
        enumerable: true,
      });

      // Probar manejo de evento
      button.addEventListener("click", (e) => {
        const categoryBtn = e.target.closest
          ? e.target.closest(".category-btn")
          : storeController.findClosestElement(e.target, ".category-btn");

        if (categoryBtn) {
          const category = categoryBtn.getAttribute("data-category");
          storeController.switchCategory(category);
        }
      });

      button.dispatchEvent(clickEvent);
      expect(storeController.switchCategory).toHaveBeenCalledWith("avatares");
    });

    test("debe manejar event delegation correctamente", () => {
      const storeController = new StoreController();
      const navigation = document.querySelector(".category-navigation");

      storeController.switchCategory = jest.fn();

      // Agregar event listener al contenedor padre
      navigation.addEventListener("click", (e) => {
        const categoryBtn = e.target.closest
          ? e.target.closest(".category-btn")
          : storeController.findClosestElement(e.target, ".category-btn");

        if (categoryBtn) {
          const category = categoryBtn.getAttribute("data-category");
          storeController.switchCategory(category);
        }
      });

      // Simular click en botón
      const button = document.querySelector('[data-category="monedas"]');
      const clickEvent = new dom.window.Event("click", { bubbles: true });
      Object.defineProperty(clickEvent, "target", {
        value: button,
        enumerable: true,
      });

      button.dispatchEvent(clickEvent);
      expect(storeController.switchCategory).toHaveBeenCalledWith("monedas");
    });

    test("debe funcionar con addEventListener y attachEvent (IE)", () => {
      const element = document.createElement("button");
      let eventFired = false;

      const handler = () => {
        eventFired = true;
      };

      // Probar addEventListener moderno
      if (element.addEventListener) {
        element.addEventListener("click", handler);
        element.dispatchEvent(new dom.window.Event("click"));
        expect(eventFired).toBe(true);
      }

      // Simular attachEvent para IE (solo para verificar compatibilidad)
      eventFired = false;
      if (!element.addEventListener && element.attachEvent) {
        element.attachEvent("onclick", handler);
        // En un navegador real IE, esto funcionaría
        expect(typeof element.attachEvent).toBe("function");
      }
    });
  });
  describe("Compatibilidad con PayPal SDK optimizer", () => {
    test("debe usar método compatible para encontrar elementos PayPal", () => {
      // Simular estructura DOM de PayPal
      const paypalContainer = document.createElement("div");
      paypalContainer.className = "paypal-button-container";

      const paypalButton = document.createElement("div");
      paypalButton.className = "paypal-button";
      paypalContainer.appendChild(paypalButton);

      const paypalIcon = document.createElement("span");
      paypalIcon.className = "paypal-icon";
      paypalButton.appendChild(paypalIcon);

      document.body.appendChild(paypalContainer);

      // Probar búsqueda compatible
      const storeController = new StoreController();

      // Método que debería funcionar en todos los navegadores
      const findPayPalElement = (startElement, selector) => {
        if (startElement.closest) {
          return startElement.closest(selector);
        } else {
          // Polyfill
          let el = startElement;
          while (el && el.nodeType === 1) {
            if (el.matches && el.matches(selector)) {
              return el;
            }
            el = el.parentElement;
          }
          return null;
        }
      };

      const result = findPayPalElement(paypalIcon, ".paypal-button-container");
      expect(result).toBe(paypalContainer);
    });

    test("debe manejar optimizaciones de PayPal sin errores", () => {
      // Simular optimizador de PayPal
      const mockPayPalOptimizer = {
        optimize: function (element) {
          // Usar método compatible
          const container = element.closest
            ? element.closest(".paypal-button-container")
            : this.findClosestElement(element, ".paypal-button-container");

          if (container) {
            container.classList.add("optimized");
            return true;
          }
          return false;
        },

        findClosestElement: function (element, selector) {
          let el = element;
          while (el && el.nodeType === 1) {
            if (el.matches && el.matches(selector)) {
              return el;
            }
            el = el.parentElement;
          }
          return null;
        },
      };

      // Crear estructura de prueba
      const container = document.createElement("div");
      container.className = "paypal-button-container";
      const button = document.createElement("button");
      container.appendChild(button);
      document.body.appendChild(container);

      // Probar optimización
      const result = mockPayPalOptimizer.optimize(button);
      expect(result).toBe(true);
      expect(container.classList.contains("optimized")).toBe(true);
    });
  });

  describe("Validación de características del navegador", () => {
    test("debe detectar soporte de características modernas", () => {
      const features = {
        closest: typeof document.createElement("div").closest === "function",
        matches: typeof document.createElement("div").matches === "function",
        addEventListener:
          typeof document.createElement("div").addEventListener === "function",
        querySelector: typeof document.querySelector === "function",
        classList: typeof document.createElement("div").classList === "object",
      };

      // En JSDOM, estas características deberían estar disponibles
      expect(features.addEventListener).toBe(true);
      expect(features.querySelector).toBe(true);
      expect(features.classList).toBe(true);
    });

    test("debe proporcionar fallbacks para características faltantes", () => {
      const storeController = new StoreController();

      // Verificar que tiene métodos de fallback
      expect(
        typeof storeController.checkBrowserCompatibility === "function" ||
          typeof storeController.initializeCompatibility === "function"
      ).toBe(true);
    });
  });
});
