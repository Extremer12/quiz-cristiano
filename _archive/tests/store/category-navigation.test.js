/**
 * Pruebas para mejoras de navegación entre categorías
 * Verifica indicadores de carga, transiciones y manejo de errores
 */

// Mock del DOM para las pruebas
const { JSDOM } = require("jsdom");
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
  <div class="category-navigation">
    <button class="category-btn" data-category="avatares">Avatares</button>
    <button class="category-btn" data-category="monedas">Monedas</button>
    <button class="category-btn" data-category="powerups">Power-ups</button>
  </div>
  
  <div class="store-content">
    <div id="avatares-section" class="category-section">
      <div class="products-grid"></div>
    </div>
    <div id="monedas-section" class="category-section">
      <div class="products-grid"></div>
    </div>
    <div id="powerups-section" class="category-section">
      <div class="products-grid"></div>
    </div>
  </div>
</body>
</html>
`);

global.document = dom.window.document;
global.window = dom.window;

// Mock de ProductService
global.window.ProductService = {
  loadProductsByCategory: jest.fn(),
  loadPacksByCategory: jest.fn(),
};

const StoreController = require("../../js/modules/store/StoreController.js");

describe("Mejoras de Navegación entre Categorías", () => {
  let storeController;

  beforeEach(() => {
    // Limpiar DOM
    document.querySelectorAll(".category-btn").forEach((btn) => {
      btn.classList.remove("active", "loading");
      btn.innerHTML = btn.textContent;
    });

    document.querySelectorAll(".category-section").forEach((section) => {
      section.classList.remove("active", "fade-out", "fade-in");
      section.innerHTML = '<div class="products-grid"></div>';
    });

    // Crear nueva instancia
    storeController = new StoreController();
    storeController.productServiceAvailable = true;

    // Mock de métodos que dependen de servicios externos
    storeController.loadCategoryProducts = jest.fn().mockResolvedValue();
    storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
  });

  describe("Propiedades de control de navegación", () => {
    test("debe tener propiedades de control inicializadas", () => {
      expect(storeController.isSwitchingCategory).toBe(false);
      expect(storeController.forceReload).toBe(false);
    });
  });

  describe("switchCategory - Control de cambios redundantes", () => {
    test("debe evitar cambios redundantes a la misma categoría", async () => {
      storeController.currentCategory = "avatares";
      storeController.forceReload = false;

      await storeController.switchCategory("avatares");

      expect(storeController.loadCategoryProducts).not.toHaveBeenCalled();
    });

    test("debe permitir cambio forzado a la misma categoría", async () => {
      storeController.currentCategory = "avatares";
      storeController.forceReload = true;

      await storeController.switchCategory("avatares");

      expect(storeController.loadCategoryProducts).toHaveBeenCalledWith(
        "avatares"
      );
    });

    test("debe evitar cambios múltiples simultáneos", async () => {
      storeController.isSwitchingCategory = true;

      await storeController.switchCategory("monedas");

      expect(storeController.loadCategoryProducts).not.toHaveBeenCalled();
    });
  });

  describe("Indicadores de carga", () => {
    test("showCategoryLoadingIndicator debe mostrar spinner en botón", () => {
      const categoryBtn = document.querySelector('[data-category="avatares"]');
      const originalText = categoryBtn.textContent;

      storeController.showCategoryLoadingIndicator("avatares");

      expect(categoryBtn.classList.contains("loading")).toBe(true);
      expect(categoryBtn.dataset.originalText).toBe(originalText);
      expect(categoryBtn.innerHTML).toContain("fa-spinner fa-spin");
    });

    test("showCategoryLoadingIndicator debe crear overlay de carga", () => {
      const section = document.getElementById("avatares-section");

      storeController.showCategoryLoadingIndicator("avatares");

      const overlay = section.querySelector(".category-loading-overlay");
      expect(overlay).toBeTruthy();
      expect(overlay.innerHTML).toContain("Cargando avatares...");
    });

    test("hideCategoryLoadingIndicator debe remover spinner y overlay", () => {
      const categoryBtn = document.querySelector('[data-category="avatares"]');
      const section = document.getElementById("avatares-section");

      // Simular estado de carga
      storeController.showCategoryLoadingIndicator("avatares");

      // Verificar que está en estado de carga
      expect(categoryBtn.classList.contains("loading")).toBe(true);
      expect(section.querySelector(".category-loading-overlay")).toBeTruthy();

      // Ocultar indicadores
      storeController.hideCategoryLoadingIndicator();

      expect(categoryBtn.classList.contains("loading")).toBe(false);
      expect(section.querySelector(".category-loading-overlay")).toBeFalsy();
    });
  });

  describe("Actualización de navegación", () => {
    test("updateCategoryNavigation debe actualizar botones activos", async () => {
      const avatarBtn = document.querySelector('[data-category="avatares"]');
      const monedasBtn = document.querySelector('[data-category="monedas"]');

      // Establecer estado inicial
      avatarBtn.classList.add("active");

      await storeController.updateCategoryNavigation("monedas");

      expect(avatarBtn.classList.contains("active")).toBe(false);
      expect(monedasBtn.classList.contains("active")).toBe(true);
    });
  });

  describe("Transiciones de secciones", () => {
    test("switchCategorySection debe cambiar secciones con transición", async () => {
      const avatarSection = document.getElementById("avatares-section");
      const monedasSection = document.getElementById("monedas-section");

      // Estado inicial
      avatarSection.classList.add("active");

      await storeController.switchCategorySection("monedas");

      expect(avatarSection.classList.contains("active")).toBe(false);
      expect(monedasSection.classList.contains("active")).toBe(true);
    });
  });

  describe("Flujo completo de cambio de categoría", () => {
    test("debe ejecutar flujo completo de switchCategory", async () => {
      const avatarBtn = document.querySelector('[data-category="avatares"]');
      const monedasBtn = document.querySelector('[data-category="monedas"]');
      const avatarSection = document.getElementById("avatares-section");
      const monedasSection = document.getElementById("monedas-section");

      // Estado inicial
      avatarBtn.classList.add("active");
      avatarSection.classList.add("active");
      storeController.currentCategory = "avatares";

      // Ejecutar cambio
      await storeController.switchCategory("monedas");

      // Verificar resultado
      expect(storeController.currentCategory).toBe("monedas");
      expect(storeController.isSwitchingCategory).toBe(false);
      expect(storeController.loadCategoryProducts).toHaveBeenCalledWith(
        "monedas"
      );
      expect(avatarBtn.classList.contains("active")).toBe(false);
      expect(monedasBtn.classList.contains("active")).toBe(true);
      expect(avatarSection.classList.contains("active")).toBe(false);
      expect(monedasSection.classList.contains("active")).toBe(true);
    });
  });

  describe("Manejo de errores", () => {
    test("showCategoryError debe mostrar mensaje de error", () => {
      const section = document.getElementById("avatares-section");
      const error = new Error("Error de prueba");

      storeController.showCategoryError("avatares", error);

      const errorMessage = section.querySelector(".category-error-message");
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.innerHTML).toContain("Error cargando avatares");
      expect(errorMessage.innerHTML).toContain("Reintentar");
    });

    test("debe manejar errores correctamente en switchCategory", async () => {
      const error = new Error("Error de carga");
      storeController.loadCategoryProducts.mockRejectedValue(error);

      const section = document.getElementById("monedas-section");

      await storeController.switchCategory("monedas");

      expect(storeController.isSwitchingCategory).toBe(false);
      expect(storeController.lastError).toBe(error);
      expect(section.querySelector(".category-error-message")).toBeTruthy();
    });
  });

  describe("Limpieza de contenido", () => {
    test("clearCategoryContent debe limpiar contenido anterior", () => {
      const section = document.getElementById("avatares-section");

      // Agregar contenido de prueba
      section.innerHTML = `
        <div class="products-grid show-grid">Productos</div>
        <div class="packs-grid show-grid">Packs</div>
        <div class="loading-state">Cargando</div>
        <div class="empty-state">Vacío</div>
        <div class="error-state">Error</div>
      `;

      storeController.clearCategoryContent(section);

      expect(section.querySelector(".products-grid")).toBeTruthy();
      expect(section.querySelector(".packs-grid")).toBeTruthy();
      expect(section.querySelector(".loading-state")).toBeFalsy();
      expect(section.querySelector(".empty-state")).toBeFalsy();
      expect(section.querySelector(".error-state")).toBeFalsy();
    });
  });
});
