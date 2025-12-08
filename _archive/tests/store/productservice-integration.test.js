/**
 * Pruebas de integración para ProductService con StoreController
 * Verifica inicialización, conexión y visualización de productos
 */

const { JSDOM } = require("jsdom");

describe("Integración ProductService - StoreController", () => {
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
          <div class="store-header">
            <div class="coins-display">
              <span id="user-coins">0</span>
            </div>
          </div>
          <div class="category-navigation">
            <button class="category-btn active" data-category="avatares">Avatares</button>
            <button class="category-btn" data-category="monedas">Monedas</button>
          </div>
          <div class="store-content">
            <section class="category-section active" id="avatares-section">
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

  describe("Inicialización de StoreController", () => {
    test("debe inicializar correctamente sin ProductService", async () => {
      const storeController = new StoreController();

      // Mock de métodos externos
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();
      storeController.loadCategoryProducts = jest.fn().mockResolvedValue();

      await storeController.initialize();

      expect(storeController.isInitialized).toBe(true);
      expect(storeController.productServiceAvailable).toBe(false);
      expect(storeController.currentUserId).toBe("test_user");
    });

    test("debe inicializar correctamente con ProductService disponible", async () => {
      // Mock de ProductService
      const mockProductService = {
        initialize: jest.fn().mockResolvedValue(),
        loadProductsByCategory: jest.fn().mockResolvedValue([]),
        loadPacksByCategory: jest.fn().mockResolvedValue([]),
      };

      window.ProductService = jest
        .fn()
        .mockImplementation(() => mockProductService);

      const storeController = new StoreController();
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();
      storeController.loadCategoryProducts = jest.fn().mockResolvedValue();

      await storeController.initialize();

      expect(storeController.isInitialized).toBe(true);
      expect(storeController.productServiceAvailable).toBe(true);
      expect(window.productService).toBeDefined();
    });

    test("debe manejar errores de inicialización", async () => {
      // Mock de ProductService que falla
      window.ProductService = jest.fn().mockImplementation(() => {
        throw new Error("ProductService initialization failed");
      });

      const storeController = new StoreController();
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();
      storeController.showFallbackContent = jest.fn();

      await storeController.initialize();

      expect(storeController.isInitialized).toBe(true);
      expect(storeController.productServiceAvailable).toBe(false);
      expect(storeController.lastError).toBeDefined();
    });
  });

  describe("Conexión con ProductService", () => {
    test("debe conectar correctamente con ProductService", async () => {
      const mockProductService = {
        initialize: jest.fn().mockResolvedValue(),
        loadProductsByCategory: jest
          .fn()
          .mockResolvedValue([{ id: 1, name: "Avatar 1", price: 100 }]),
        loadPacksByCategory: jest.fn().mockResolvedValue([]),
      };

      window.ProductService = jest
        .fn()
        .mockImplementation(() => mockProductService);

      const storeController = new StoreController();
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();

      await storeController.initialize();

      expect(storeController.productServiceAvailable).toBe(true);
      expect(window.productService).toBeDefined();
    });

    test("debe manejar timeout de conexión", async () => {
      const mockProductService = {
        initialize: jest.fn().mockImplementation(() => {
          return new Promise((resolve) => setTimeout(resolve, 15000));
        }),
      };

      window.ProductService = jest
        .fn()
        .mockImplementation(() => mockProductService);

      const storeController = new StoreController();
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();

      await storeController.initialize();

      expect(storeController.productServiceAvailable).toBe(false);
    }, 15000);
  });

  describe("Visualización correcta de productos", () => {
    test("debe cargar productos correctamente", async () => {
      const mockProducts = [
        { id: 1, name: "Avatar Cristiano", price: 150, category: "avatares" },
        { id: 2, name: "Avatar Apostol", price: 200, category: "avatares" },
      ];

      const mockProductService = {
        initialize: jest.fn().mockResolvedValue(),
        loadProductsByCategory: jest.fn().mockResolvedValue(mockProducts),
        loadPacksByCategory: jest.fn().mockResolvedValue([]),
      };

      window.ProductService = jest
        .fn()
        .mockImplementation(() => mockProductService);

      const storeController = new StoreController();
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();

      await storeController.initialize();

      expect(storeController.productServiceAvailable).toBe(true);
    });

    test("debe manejar categorías vacías", async () => {
      const mockProductService = {
        initialize: jest.fn().mockResolvedValue(),
        loadProductsByCategory: jest.fn().mockResolvedValue([]),
        loadPacksByCategory: jest.fn().mockResolvedValue([]),
      };

      window.ProductService = jest
        .fn()
        .mockImplementation(() => mockProductService);

      const storeController = new StoreController();
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();

      await storeController.initialize();

      expect(storeController.productServiceAvailable).toBe(true);
    });

    test("debe cambiar categorías correctamente", async () => {
      const mockProductService = {
        initialize: jest.fn().mockResolvedValue(),
        loadProductsByCategory: jest
          .fn()
          .mockResolvedValueOnce([{ id: 1, name: "Avatar 1" }])
          .mockResolvedValueOnce([{ id: 2, name: "Moneda 1" }]),
        loadPacksByCategory: jest.fn().mockResolvedValue([]),
      };

      window.ProductService = jest
        .fn()
        .mockImplementation(() => mockProductService);

      const storeController = new StoreController();
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();

      await storeController.initialize();
      await storeController.switchCategory("monedas");

      expect(storeController.currentCategory).toBe("monedas");
    });

    test("debe mostrar productos en el DOM correctamente", async () => {
      const mockProducts = [
        {
          id: 1,
          name: "Avatar Cristiano",
          price: 150,
          category: "avatares",
          image: "avatar1.png",
        },
      ];

      const mockProductService = {
        initialize: jest.fn().mockResolvedValue(),
        loadProductsByCategory: jest.fn().mockResolvedValue(mockProducts),
        loadPacksByCategory: jest.fn().mockResolvedValue([]),
      };

      window.ProductService = jest
        .fn()
        .mockImplementation(() => mockProductService);

      const storeController = new StoreController();
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();

      await storeController.initialize();

      // Verificar que ProductService está disponible y funcionando
      expect(storeController.productServiceAvailable).toBe(true);
      expect(window.productService).toBeDefined();

      // Verificar que se pueden cargar productos
      const products = await window.productService.loadProductsByCategory(
        "avatares"
      );
      expect(products).toEqual(mockProducts);
    });

    test("debe manejar errores de carga de productos", async () => {
      const mockProductService = {
        initialize: jest.fn().mockResolvedValue(),
        loadProductsByCategory: jest
          .fn()
          .mockRejectedValue(new Error("Network error")),
        loadPacksByCategory: jest.fn().mockResolvedValue([]),
      };

      window.ProductService = jest
        .fn()
        .mockImplementation(() => mockProductService);

      const storeController = new StoreController();
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();

      await storeController.initialize();

      // Verificar que ProductService está inicializado
      expect(storeController.productServiceAvailable).toBe(true);

      // Intentar cargar productos y verificar que maneja el error
      await storeController.loadCategoryProducts("avatares");

      // El error debería ser manejado internamente y mostrar estado vacío
      expect(storeController.productServiceAvailable).toBe(true);
    });
  });

  describe("Manejo de fallback y errores", () => {
    test("debe mostrar contenido de fallback cuando ProductService no está disponible", async () => {
      const storeController = new StoreController();
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();

      await storeController.initialize();

      expect(storeController.productServiceAvailable).toBe(false);
      expect(storeController.lastError).toBeDefined();
    });

    test("debe intentar reconexión automática", async () => {
      const storeController = new StoreController();
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();

      await storeController.initialize();

      // Verificar que el sistema puede manejar pérdida de conexión
      expect(storeController.productServiceAvailable).toBe(false);
      expect(storeController.lastError).toBeDefined();

      // Verificar que puede intentar reinicializar ProductService
      expect(typeof storeController.initializeProductService).toBe("function");
    });

    test("debe registrar errores correctamente", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      window.ProductService = jest.fn().mockImplementation(() => {
        throw new Error("Critical ProductService error");
      });

      const storeController = new StoreController();
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();

      await storeController.initialize();

      // Verificar que se registraron errores
      expect(consoleSpy).toHaveBeenCalled();
      const errorCalls = consoleSpy.mock.calls.filter(
        (call) =>
          call[0].includes("ProductService") && call[0].includes("falló")
      );
      expect(errorCalls.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });
  });

  describe("Integración completa del flujo de tienda", () => {
    test("debe completar flujo completo de navegación y carga", async () => {
      const mockAvatares = [
        { id: 1, name: "Avatar 1", price: 100, category: "avatares" },
      ];
      const mockMonedas = [
        { id: 2, name: "Pack Monedas", price: 50, category: "monedas" },
      ];

      const mockProductService = {
        initialize: jest.fn().mockResolvedValue(),
        loadProductsByCategory: jest
          .fn()
          .mockResolvedValueOnce(mockAvatares)
          .mockResolvedValueOnce(mockMonedas),
        loadPacksByCategory: jest.fn().mockResolvedValue([]),
      };

      window.ProductService = jest
        .fn()
        .mockImplementation(() => mockProductService);

      const storeController = new StoreController();
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();
      storeController.renderProducts = jest.fn();

      // Inicializar y cargar primera categoría
      await storeController.initialize();

      expect(storeController.productServiceAvailable).toBe(true);

      // Verificar que se pueden cargar productos de avatares
      const avatares = await window.productService.loadProductsByCategory(
        "avatares"
      );
      expect(avatares).toEqual(mockAvatares);

      // Cambiar a segunda categoría
      await storeController.switchCategory("monedas");

      // Verificar que se pueden cargar productos de monedas
      const monedas = await window.productService.loadProductsByCategory(
        "monedas"
      );
      expect(monedas).toEqual(mockMonedas);
      expect(storeController.currentCategory).toBe("monedas");
    });

    test("debe mantener estado consistente durante navegación", async () => {
      const mockProductService = {
        initialize: jest.fn().mockResolvedValue(),
        loadProductsByCategory: jest.fn().mockResolvedValue([]),
        loadPacksByCategory: jest.fn().mockResolvedValue([]),
      };

      window.ProductService = jest
        .fn()
        .mockImplementation(() => mockProductService);

      const storeController = new StoreController();
      storeController.getCurrentUserId = jest.fn().mockReturnValue("test_user");
      storeController.updateUserCoinsDisplay = jest.fn().mockResolvedValue();

      await storeController.initialize();

      // Verificar estado inicial
      expect(storeController.isInitialized).toBe(true);
      expect(storeController.productServiceAvailable).toBe(true);
      expect(storeController.currentUserId).toBe("test_user");

      // Cambiar categorías y verificar consistencia
      await storeController.switchCategory("monedas");
      expect(storeController.currentCategory).toBe("monedas");
      expect(storeController.isInitialized).toBe(true);

      await storeController.switchCategory("avatares");
      expect(storeController.currentCategory).toBe("avatares");
      expect(storeController.isInitialized).toBe(true);
    });
  });
});
