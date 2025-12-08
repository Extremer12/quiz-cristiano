/**
 * PRUEBAS UNITARIAS - Browser Compatibility
 * Pruebas para verificar la funcionalidad de compatibilidad del navegador
 */

class BrowserCompatibilityTests {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  /**
   * Ejecuta todas las pruebas
   */
  runAllTests() {
    console.log("Iniciando pruebas de compatibilidad del navegador...");

    // Pruebas de detección de características
    this.testFeatureDetection();

    // Pruebas de polyfills
    this.testPolyfills();

    // Pruebas de método findClosestElement
    this.testFindClosestElement();

    // Pruebas de información del navegador
    this.testBrowserInfo();

    // Mostrar resultados
    this.showResults();

    return this.getTestSummary();
  }

  /**
   * Pruebas de detección de características
   */
  testFeatureDetection() {
    console.log("Probando detección de características...");

    // Test: Verificar que checkClosestSupport devuelve un boolean
    this.runTest("checkClosestSupport devuelve boolean", () => {
      const result = window.browserCompatibility.checkClosestSupport();
      return typeof result === "boolean";
    });

    // Test: Verificar que isSupported funciona para características conocidas
    this.runTest("isSupported funciona para 'closest'", () => {
      const result = window.browserCompatibility.isSupported("closest");
      return typeof result === "boolean";
    });

    // Test: Verificar que isSupported devuelve false para características desconocidas
    this.runTest(
      "isSupported devuelve false para características desconocidas",
      () => {
        const result = window.browserCompatibility.isSupported(
          "caracteristica-inexistente"
        );
        return result === false;
      }
    );

    // Test: Verificar que getBrowserInfo devuelve información válida
    this.runTest("getBrowserInfo devuelve información válida", () => {
      const info = window.browserCompatibility.getBrowserInfo();
      return (
        info &&
        typeof info.userAgent === "string" &&
        typeof info.version === "string"
      );
    });
  }

  /**
   * Pruebas de polyfills
   */
  testPolyfills() {
    console.log("Probando polyfills...");

    // Test: Verificar que el polyfill de closest se carga correctamente
    this.runTest("Polyfill de closest se carga", () => {
      // Simular navegador sin closest
      const originalClosest = Element.prototype.closest;
      delete Element.prototype.closest;

      // Cargar polyfill
      window.browserCompatibility.loadClosestPolyfill();

      // Verificar que se cargó
      const loaded = typeof Element.prototype.closest === "function";

      // Restaurar original si existía
      if (originalClosest) {
        Element.prototype.closest = originalClosest;
      }

      return loaded;
    });

    // Test: Verificar que el polyfill de closest funciona
    this.runTest("Polyfill de closest funciona correctamente", () => {
      // Crear elementos de prueba
      const parent = document.createElement("div");
      parent.className = "test-parent";
      const child = document.createElement("span");
      child.className = "test-child";
      parent.appendChild(child);
      document.body.appendChild(parent);

      try {
        // Asegurar que el polyfill esté cargado
        window.browserCompatibility.loadClosestPolyfill();

        // Probar closest
        const result = child.closest(".test-parent");
        const success = result === parent;

        // Limpiar
        document.body.removeChild(parent);

        return success;
      } catch (error) {
        // Limpiar en caso de error
        if (parent.parentNode) {
          document.body.removeChild(parent);
        }
        return false;
      }
    });
  }

  /**
   * Pruebas del método findClosestElement
   */
  testFindClosestElement() {
    console.log("Probando método findClosestElement...");

    // Test: Verificar que findClosestElement funciona con elementos válidos
    this.runTest("findClosestElement funciona con elementos válidos", () => {
      // Crear elementos de prueba
      const parent = document.createElement("div");
      parent.className = "test-container";
      const child = document.createElement("button");
      child.className = "test-button";
      parent.appendChild(child);
      document.body.appendChild(parent);

      try {
        const result = window.browserCompatibility.findClosestElement(
          child,
          ".test-container"
        );
        const success = result === parent;

        // Limpiar
        document.body.removeChild(parent);

        return success;
      } catch (error) {
        // Limpiar en caso de error
        if (parent.parentNode) {
          document.body.removeChild(parent);
        }
        return false;
      }
    });

    // Test: Verificar que findClosestElement maneja elementos null
    this.runTest("findClosestElement maneja elementos null", () => {
      const result = window.browserCompatibility.findClosestElement(
        null,
        ".test"
      );
      return result === null;
    });

    // Test: Verificar que findClosestElement maneja selectores vacíos
    this.runTest("findClosestElement maneja selectores vacíos", () => {
      const div = document.createElement("div");
      const result = window.browserCompatibility.findClosestElement(div, "");
      return result === null;
    });

    // Test: Verificar que findClosestElement funciona con selectores complejos
    this.runTest("findClosestElement funciona con selectores complejos", () => {
      // Crear estructura compleja
      const container = document.createElement("div");
      container.className = "payment-container";
      container.setAttribute("data-payment", "true");

      const button = document.createElement("button");
      button.className = "payment-button";
      container.appendChild(button);

      document.body.appendChild(container);

      try {
        const result = window.browserCompatibility.findClosestElement(
          button,
          "[data-payment]"
        );
        const success = result === container;

        // Limpiar
        document.body.removeChild(container);

        return success;
      } catch (error) {
        // Limpiar en caso de error
        if (container.parentNode) {
          document.body.removeChild(container);
        }
        return false;
      }
    });
  }

  /**
   * Pruebas de información del navegador
   */
  testBrowserInfo() {
    console.log("Probando información del navegador...");

    // Test: Verificar que getBrowserInfo devuelve propiedades requeridas
    this.runTest("getBrowserInfo contiene propiedades requeridas", () => {
      const info = window.browserCompatibility.getBrowserInfo();
      const requiredProps = [
        "userAgent",
        "isChrome",
        "isFirefox",
        "isSafari",
        "isEdge",
        "isMobile",
        "version",
      ];

      return requiredProps.every((prop) => info.hasOwnProperty(prop));
    });

    // Test: Verificar que getCompatibilityReport funciona
    this.runTest("getCompatibilityReport genera reporte válido", () => {
      const report = window.browserCompatibility.getCompatibilityReport();
      return (
        report &&
        report.browser &&
        report.features &&
        Array.isArray(report.polyfillsLoaded) &&
        report.timestamp
      );
    });
  }

  /**
   * Ejecuta una prueba individual
   */
  runTest(testName, testFunction) {
    try {
      const startTime = performance.now();
      const result = testFunction();
      const duration = performance.now() - startTime;

      if (result) {
        this.passedTests++;
        this.testResults.push({
          name: testName,
          status: "PASSED",
          duration: duration.toFixed(2),
          error: null,
        });
        console.log(`✅ ${testName} - PASSED (${duration.toFixed(2)}ms)`);
      } else {
        this.failedTests++;
        this.testResults.push({
          name: testName,
          status: "FAILED",
          duration: duration.toFixed(2),
          error: "Test returned false",
        });
        console.log(`❌ ${testName} - FAILED (${duration.toFixed(2)}ms)`);
      }
    } catch (error) {
      this.failedTests++;
      this.testResults.push({
        name: testName,
        status: "ERROR",
        duration: 0,
        error: error.message,
      });
      console.log(`ERROR ${testName} - ERROR: ${error.message}`);
    }
  }

  /**
   * Muestra resultados de las pruebas
   */
  showResults() {
    console.log("\nRESULTADOS DE PRUEBAS DE COMPATIBILIDAD:");
    console.log(`✅ Pruebas exitosas: ${this.passedTests}`);
    console.log(`❌ Pruebas fallidas: ${this.failedTests}`);
    console.log(
      `Tasa de éxito: ${(
        (this.passedTests / (this.passedTests + this.failedTests)) *
        100
      ).toFixed(1)}%`
    );

    if (this.failedTests > 0) {
      console.log("\n❌ PRUEBAS FALLIDAS:");
      this.testResults
        .filter((test) => test.status !== "PASSED")
        .forEach((test) => {
          console.log(`  • ${test.name}: ${test.error || "Test failed"}`);
        });
    }
  }

  /**
   * Obtiene resumen de pruebas
   */
  getTestSummary() {
    return {
      total: this.passedTests + this.failedTests,
      passed: this.passedTests,
      failed: this.failedTests,
      successRate:
        (this.passedTests / (this.passedTests + this.failedTests)) * 100,
      results: this.testResults,
    };
  }

  /**
   * Prueba específica para PayPal SDK compatibility
   */
  testPayPalCompatibility() {
    console.log("Probando compatibilidad específica de PayPal...");

    // Test: Simular evento de PayPal con closest()
    this.runTest("Simulación de evento PayPal funciona", () => {
      // Crear estructura similar a la del PayPal optimizer
      const container = document.createElement("div");
      container.setAttribute("data-payment", "true");
      container.className = "payment-button";

      const button = document.createElement("button");
      button.textContent = "Pay with PayPal";
      container.appendChild(button);

      document.body.appendChild(container);

      try {
        // Simular el código problemático del PayPal optimizer
        const paymentSelectors = [
          "[data-payment]",
          ".payment-button",
          ".paypal-button",
        ];

        // Crear evento simulado
        const mockEvent = {
          target: button,
        };

        // Usar nuestro método compatible
        const target = window.browserCompatibility.findClosestElement(
          mockEvent.target,
          paymentSelectors.join(",")
        );

        const success = target === container;

        // Limpiar
        document.body.removeChild(container);

        return success;
      } catch (error) {
        // Limpiar en caso de error
        if (container.parentNode) {
          document.body.removeChild(container);
        }
        console.error("Error en prueba PayPal:", error);
        return false;
      }
    });
  }

  /**
   * Ejecuta pruebas de rendimiento
   */
  runPerformanceTests() {
    console.log("⚡ Ejecutando pruebas de rendimiento...");

    const iterations = 1000;

    // Test de rendimiento: findClosestElement vs closest nativo
    this.runTest("Rendimiento de findClosestElement", () => {
      const parent = document.createElement("div");
      parent.className = "test-parent";
      const child = document.createElement("span");
      parent.appendChild(child);
      document.body.appendChild(parent);

      try {
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
          window.browserCompatibility.findClosestElement(child, ".test-parent");
        }

        const duration = performance.now() - startTime;
        const avgTime = duration / iterations;

        console.log(`⚡ Tiempo promedio por llamada: ${avgTime.toFixed(4)}ms`);

        // Limpiar
        document.body.removeChild(parent);

        // Considerar exitoso si el tiempo promedio es menor a 1ms
        return avgTime < 1;
      } catch (error) {
        if (parent.parentNode) {
          document.body.removeChild(parent);
        }
        return false;
      }
    });
  }
}

// Crear instancia global para pruebas
if (typeof window !== "undefined") {
  window.BrowserCompatibilityTests = BrowserCompatibilityTests;
}

// Exportar para módulos
if (typeof module !== "undefined" && module.exports) {
  module.exports = BrowserCompatibilityTests;
}
