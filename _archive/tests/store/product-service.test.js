/**
 * ================================================
 * TESTS UNITARIOS - PRODUCT SERVICE
 * Quiz Cristiano - Tests para ProductService
 * ================================================
 */

// Importar ProductService
const ProductService = require('../../js/modules/store/ProductService.js');

describe("ProductService", () => {
  let productService;
  let mockFirestore;

  beforeEach(() => {
    // Mock de Firestore
    mockFirestore = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };

    // Mock global de Firebase
    global.firebase = {
      firestore: () => mockFirestore,
    };

    // Crear instancia del servicio
    productService = new ProductService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialize", () => {
    test("should initialize successfully", async () => {
      await expect(productService.initialize()).resolves.not.toThrow();
      expect(productService.initialized).toBe(true);
    });

    test("should not initialize twice", async () => {
      await productService.initialize();
      const consoleSpy = jest.spyOn(console, "log");

      await productService.initialize();

      expect(consoleSpy).toHaveBeenCalledWith(
        "🔄 ProductService ya inicializado"
      );
    });
  });

  describe("loadProductsByCategory", () => {
    beforeEach(async () => {
      await productService.initialize();
    });

    test("should load products for valid category", async () => {
      const mockProducts = [
        {
          id: "avatar1",
          name: "Avatar Premium",
          category: "avatares",
          price: { coins: 100 },
          availability: { isActive: true },
        },
      ];

      mockFirestore.get.mockResolvedValue({
        docs: mockProducts.map((product) => ({
          id: product.id,
          data: () => product,
        })),
      });

      const products = await productService.loadProductsByCategory("avatares");

      expect(products).toHaveLength(1);
      expect(products[0].id).toBe("avatar1");
      expect(products[0].category).toBe("avatares");
    });

    test("should throw error for invalid category", async () => {
      await expect(
        productService.loadProductsByCategory("invalid_category")
      ).rejects.toThrow("Categoría inválida: invalid_category");
    });

    test("should return empty array when no products found", async () => {
      mockFirestore.get.mockResolvedValue({ docs: [] });

      const products = await productService.loadProductsByCategory("avatares");

      expect(products).toEqual([]);
    });

    test("should filter out inactive products", async () => {
      const mockProducts = [
        {
          id: "active_product",
          name: "Active Product",
          category: "avatares",
          availability: { isActive: true },
        },
        {
          id: "inactive_product",
          name: "Inactive Product",
          category: "avatares",
          availability: { isActive: false },
        },
      ];

      mockFirestore.get.mockResolvedValue({
        docs: mockProducts.map((product) => ({
          id: product.id,
          data: () => product,
        })),
      });

      const products = await productService.loadProductsByCategory("avatares");

      expect(products).toHaveLength(1);
      expect(products[0].id).toBe("active_product");
    });
  });

  describe("getProduct", () => {
    beforeEach(async () => {
      await productService.initialize();

      // Cargar productos de prueba
      const mockProducts = [
        {
          id: "test_product",
          name: "Test Product",
          category: "avatares",
          price: { coins: 100 },
        },
      ];

      mockFirestore.get.mockResolvedValue({
        docs: mockProducts.map((product) => ({
          id: product.id,
          data: () => product,
        })),
      });

      await productService.loadProductsByCategory("avatares");
    });

    test("should return product by ID", () => {
      const product = productService.getProduct("test_product");

      expect(product).toBeDefined();
      expect(product.id).toBe("test_product");
      expect(product.name).toBe("Test Product");
    });

    test("should return null for non-existent product", () => {
      const product = productService.getProduct("non_existent");

      expect(product).toBeNull();
    });
  });

  describe("canUserAfford", () => {
    beforeEach(async () => {
      await productService.initialize();

      // Mock del UserStoreDataManager
      global.userStoreDataManager = {
        getUserCoins: jest.fn(),
      };
    });

    test("should return true when user has enough coins", async () => {
      global.userStoreDataManager.getUserCoins.mockReturnValue(200);

      const mockProduct = {
        id: "test_product",
        price: { coins: 100 },
      };
      productService.products.set("test_product", mockProduct);

      const canAfford = await productService.canUserAfford(
        "test_product",
        "user123"
      );

      expect(canAfford).toBe(true);
    });

    test("should return false when user has insufficient coins", async () => {
      global.userStoreDataManager.getUserCoins.mockReturnValue(50);

      const mockProduct = {
        id: "test_product",
        price: { coins: 100 },
      };
      productService.products.set("test_product", mockProduct);

      const canAfford = await productService.canUserAfford(
        "test_product",
        "user123"
      );

      expect(canAfford).toBe(false);
    });

    test("should return false for non-existent product", async () => {
      const canAfford = await productService.canUserAfford(
        "non_existent",
        "user123"
      );

      expect(canAfford).toBe(false);
    });
  });

  describe("hasUserPurchased", () => {
    beforeEach(async () => {
      await productService.initialize();

      // Mock del UserStoreDataManager
      global.userStoreDataManager = {
        getOwnedProducts: jest.fn(),
      };
    });

    test("should return true when user owns the product", async () => {
      global.userStoreDataManager.getOwnedProducts.mockReturnValue([
        "product1",
        "product2",
      ]);

      const hasPurchased = await productService.hasUserPurchased(
        "product1",
        "user123"
      );

      expect(hasPurchased).toBe(true);
    });

    test("should return false when user does not own the product", async () => {
      global.userStoreDataManager.getOwnedProducts.mockReturnValue([
        "product1",
        "product2",
      ]);

      const hasPurchased = await productService.hasUserPurchased(
        "product3",
        "user123"
      );

      expect(hasPurchased).toBe(false);
    });

    test("should return false when user has no products", async () => {
      global.userStoreDataManager.getOwnedProducts.mockReturnValue([]);

      const hasPurchased = await productService.hasUserPurchased(
        "product1",
        "user123"
      );

      expect(hasPurchased).toBe(false);
    });
  });

  describe("calculatePackDiscount", () => {
    beforeEach(async () => {
      await productService.initialize();

      // Mock del UserStoreDataManager
      global.userStoreDataManager = {
        getOwnedProducts: jest.fn().mockReturnValue([]),
      };

      // Configurar productos de prueba
      const mockProducts = [
        { id: "item1", price: { coins: 100 } },
        { id: "item2", price: { coins: 150 } },
        { id: "item3", price: { coins: 200 } },
      ];

      mockProducts.forEach((product) => {
        productService.products.set(product.id, product);
      });

      // Configurar pack de prueba
      const mockPack = {
        id: "test_pack",
        type: "pack",
        items: ["item1", "item2", "item3"],
        discountPercentage: 20,
        price: { coins: 360 }, // 20% descuento sobre 450
      };

      productService.products.set("test_pack", mockPack);
    });

    test("should calculate correct discount when user owns no items", async () => {
      const discount = await productService.calculatePackDiscount(
        "test_pack",
        "user123"
      );

      expect(discount.originalPrice).toBe(450); // 100 + 150 + 200
      expect(discount.discountedPrice).toBe(360);
      expect(discount.savings).toBe(90);
      expect(discount.discountPercentage).toBe(20);
    });

    test("should calculate proportional discount when user owns some items", async () => {
      global.userStoreDataManager.getOwnedProducts.mockReturnValue(["item1"]);

      const discount = await productService.calculatePackDiscount(
        "test_pack",
        "user123"
      );

      // Solo item2 e item3 (150 + 200 = 350)
      // Con 20% descuento = 280
      expect(discount.originalPrice).toBe(350);
      expect(discount.discountedPrice).toBe(280);
      expect(discount.savings).toBe(70);
    });

    test("should return zero discount when user owns all items", async () => {
      global.userStoreDataManager.getOwnedProducts.mockReturnValue([
        "item1",
        "item2",
        "item3",
      ]);

      const discount = await productService.calculatePackDiscount(
        "test_pack",
        "user123"
      );

      expect(discount.originalPrice).toBe(0);
      expect(discount.discountedPrice).toBe(0);
      expect(discount.savings).toBe(0);
    });
  });

  describe("suggestBetterDeals", () => {
    beforeEach(async () => {
      await productService.initialize();

      // Configurar productos y packs de prueba
      const mockProducts = [
        { id: "item1", price: { coins: 100 }, category: "avatares" },
        { id: "item2", price: { coins: 150 }, category: "avatares" },
        { id: "item3", price: { coins: 200 }, category: "avatares" },
      ];

      const mockPacks = [
        {
          id: "pack1",
          type: "pack",
          items: ["item1", "item2"],
          price: { coins: 200 }, // 20% descuento
          category: "avatares",
        },
        {
          id: "pack2",
          type: "pack",
          items: ["item1", "item2", "item3"],
          price: { coins: 360 }, // 20% descuento
          category: "avatares",
        },
      ];

      [...mockProducts, ...mockPacks].forEach((product) => {
        productService.products.set(product.id, product);
      });
    });

    test("should suggest better pack deals", async () => {
      const suggestions = await productService.suggestBetterDeals([
        "item1",
        "item2",
      ]);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].id).toBe("pack1");
      expect(suggestions[0].savings).toBeGreaterThan(0);
    });

    test("should return empty array when no better deals exist", async () => {
      const suggestions = await productService.suggestBetterDeals(["item1"]);

      expect(suggestions).toHaveLength(0);
    });
  });

  describe("clearCache", () => {
    test("should clear products cache", async () => {
      await productService.initialize();

      // Agregar productos al cache
      productService.products.set("test", { id: "test" });
      expect(productService.products.size).toBeGreaterThan(0);

      productService.clearCache();

      expect(productService.products.size).toBe(0);
    });
  });

  describe("getCategories", () => {
    test("should return available categories", () => {
      const categories = productService.getCategories();

      expect(categories).toBeInstanceOf(Map);
      expect(categories.has("avatares")).toBe(true);
      expect(categories.has("monedas")).toBe(true);
      expect(categories.has("powerups")).toBe(true);
      expect(categories.has("premium")).toBe(true);
    });
  });
});
