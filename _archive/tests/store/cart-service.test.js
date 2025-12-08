/**
 * ================================================
 * TESTS UNITARIOS - CART SERVICE
 * Quiz Cristiano - Tests para CartService
 * ================================================
 */

// Importar CartService
const CartService = require('../../js/modules/store/CartService.js');

// Mock global para localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe("CartService", () => {
  let cartService;
  let mockProductService;
  let mockUserDataManager;

  beforeEach(() => {
    // Mock del ProductService
    mockProductService = {
      getProduct: jest.fn(),
      getAllPacks: jest.fn().mockResolvedValue([]),
      calculatePackPrice: jest.fn().mockResolvedValue(100),
    };

    // Mock del UserDataManager
    mockUserDataManager = {
      getCurrentUserId: jest.fn().mockReturnValue("user123"),
      getUserData: jest.fn().mockResolvedValue({ coins: 1000 }),
    };

    // Crear instancia del servicio
    cartService = new CartService();
    cartService.setDependencies(mockProductService, mockUserDataManager);

    // Limpiar mocks de localStorage
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("setDependencies", () => {
    test("debería configurar las dependencias correctamente", () => {
      const newCartService = new CartService();
      newCartService.setDependencies(mockProductService, mockUserDataManager);

      expect(newCartService.productService).toBe(mockProductService);
      expect(newCartService.userDataManager).toBe(mockUserDataManager);
    });
  });

  describe("addItem", () => {
    beforeEach(() => {
      mockProductService.getProduct.mockResolvedValue({
        id: "test_product",
        name: "Test Product",
        price: { coins: 100 },
        availability: { isActive: true },
      });
    });

    test("debería agregar un nuevo item al carrito", async () => {
      const result = await cartService.addItem("test_product", 2);

      expect(result).toBe(true);
      expect(cartService.items).toHaveLength(1);
      expect(cartService.items[0]).toEqual({
        productId: "test_product",
        product: expect.objectContaining({
          id: "test_product",
          name: "Test Product",
        }),
        quantity: 2,
        addedAt: expect.any(Date),
      });
    });

    test("debería actualizar la cantidad para un item existente", async () => {
      await cartService.addItem("test_product", 1);
      await cartService.addItem("test_product", 2);

      expect(cartService.items).toHaveLength(1);
      expect(cartService.items[0].quantity).toBe(3);
    });

    test("no debería agregar un producto inexistente", async () => {
      mockProductService.getProduct.mockResolvedValue(null);

      const result = await cartService.addItem("non_existent", 1);

      expect(result).toBe(false);
      expect(cartService.items).toHaveLength(0);
    });

    test("no debería agregar un producto inactivo", async () => {
      mockProductService.getProduct.mockResolvedValue({
        id: "inactive_product",
        name: "Inactive Product",
        availability: { isActive: false },
      });

      const result = await cartService.addItem("inactive_product", 1);

      expect(result).toBe(false);
      expect(cartService.items).toHaveLength(0);
    });

    test("debería notificar a los observadores cuando se agrega un item", async () => {
      const observer = jest.fn();
      cartService.subscribe(observer);

      await cartService.addItem("test_product", 1);

      expect(observer).toHaveBeenCalledWith("item_added", {
        productId: "test_product",
        quantity: 1,
        total: 1,
      });
    });

    test("debería manejar productos con disponibilidad por fecha", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      mockProductService.getProduct.mockResolvedValue({
        id: "future_product",
        name: "Future Product",
        availability: {
          isActive: true,
          startDate: futureDate,
        },
      });

      const result = await cartService.addItem("future_product", 1);

      expect(result).toBe(false);
      expect(cartService.items).toHaveLength(0);
    });
  });

  describe("removeItem", () => {
    beforeEach(async () => {
      mockProductService.getProduct.mockResolvedValue({
        id: "test_product",
        name: "Test Product",
        price: { coins: 100 },
      });

      await cartService.addItem("test_product", 3);
    });

    test("debería remover completamente un item del carrito", () => {
      const result = cartService.removeItem("test_product");

      expect(result).toBe(true);
      expect(cartService.items).toHaveLength(0);
    });

    test("debería reducir la cantidad cuando se especifica", () => {
      const result = cartService.removeItem("test_product", 1);

      expect(result).toBe(true);
      expect(cartService.items).toHaveLength(1);
      expect(cartService.items[0].quantity).toBe(2);
    });

    test("debería retornar false para un item inexistente", () => {
      const result = cartService.removeItem("non_existent");

      expect(result).toBe(false);
      expect(cartService.items).toHaveLength(1);
    });

    test("debería notificar a los observadores cuando se remueve un item", () => {
      const observer = jest.fn();
      cartService.subscribe(observer);

      cartService.removeItem("test_product");

      expect(observer).toHaveBeenCalledWith("item_removed", {
        productId: "test_product",
        removedCompletely: true,
      });
    });

    test("debería notificar a los observadores cuando se actualiza la cantidad", () => {
      const observer = jest.fn();
      cartService.subscribe(observer);

      cartService.removeItem("test_product", 1);

      expect(observer).toHaveBeenCalledWith("item_updated", {
        productId: "test_product",
        newQuantity: 2,
      });
    });
  });

  describe("clearCart", () => {
    beforeEach(async () => {
      mockProductService.getProduct.mockResolvedValue({
        id: "test_product",
        name: "Test Product",
        price: { coins: 100 },
      });

      await cartService.addItem("test_product", 1);
    });

    test("debería limpiar todos los items", () => {
      cartService.clearCart();

      expect(cartService.items).toHaveLength(0);
    });

    test("debería notificar a los observadores cuando se limpia el carrito", () => {
      const observer = jest.fn();
      cartService.subscribe(observer);

      cartService.clearCart();

      expect(observer).toHaveBeenCalledWith("cart_cleared", {
        previousItemCount: 1,
      });
    });
  });

  describe("calculateTotal", () => {
    test("debería calcular el total correcto para productos regulares", async () => {
      mockProductService.getProduct
        .mockResolvedValueOnce({
          id: "product1",
          name: "Product 1",
          price: { coins: 100, usd: 1, ars: 150 },
        })
        .mockResolvedValueOnce({
          id: "product2",
          name: "Product 2",
          price: { coins: 150, usd: 1.5, ars: 225 },
        });

      await cartService.addItem("product1", 2);
      await cartService.addItem("product2", 1);

      const total = await cartService.calculateTotal();

      expect(total).toEqual({
        coins: 350, // (100 * 2) + (150 * 1)
        usd: 3.5, // (1 * 2) + (1.5 * 1)
        ars: 525, // (150 * 2) + (225 * 1)
        itemCount: 2,
        totalQuantity: 3,
      });
    });

    test("debería calcular el precio de pack dinámicamente", async () => {
      mockProductService.getProduct.mockResolvedValue({
        id: "pack1",
        name: "Pack 1",
        type: "pack",
        price: { coins: 200 },
      });

      mockProductService.calculatePackPrice.mockResolvedValue(150);

      await cartService.addItem("pack1", 1);

      const total = await cartService.calculateTotal();

      expect(total.coins).toBe(150);
      expect(mockProductService.calculatePackPrice).toHaveBeenCalledWith(
        "pack1",
        "user123"
      );
    });

    test("debería retornar cero para un carrito vacío", async () => {
      const total = await cartService.calculateTotal();

      expect(total).toEqual({
        coins: 0,
        usd: 0,
        ars: 0,
        itemCount: 0,
        totalQuantity: 0,
      });
    });

    test("debería manejar productos sin precio", async () => {
      mockProductService.getProduct.mockResolvedValue({
        id: "free_product",
        name: "Free Product",
      });

      await cartService.addItem("free_product", 1);

      const total = await cartService.calculateTotal();

      expect(total.coins).toBe(0);
    });
  });

  describe("suggestPacks", () => {
    test("debería retornar array vacío cuando no hay servicio de productos", async () => {
      cartService.productService = null;
      const suggestions = await cartService.suggestPacks();

      expect(suggestions).toEqual([]);
    });

    test("debería retornar array vacío para carrito vacío", async () => {
      const suggestions = await cartService.suggestPacks();

      expect(suggestions).toEqual([]);
    });

    test("debería sugerir packs relevantes", async () => {
      // Configurar carrito con productos
      mockProductService.getProduct
        .mockResolvedValueOnce({
          id: "product1",
          name: "Product 1",
          price: { coins: 100 },
        })
        .mockResolvedValueOnce({
          id: "product2",
          name: "Product 2",
          price: { coins: 150 },
        });

      await cartService.addItem("product1", 1);
      await cartService.addItem("product2", 1);

      // Configurar sugerencia de pack
      const mockPack = {
        id: "suggested_pack",
        name: "Suggested Pack",
        items: ["product1", "product2", "product3"],
        discountPercentage: 25,
      };

      mockProductService.getAllPacks.mockResolvedValue([mockPack]);
      mockProductService.calculatePackPrice.mockResolvedValue(200);
      mockProductService.getProduct.mockResolvedValue({
        id: "product3",
        name: "Product 3",
        price: { coins: 100 },
      });

      const suggestions = await cartService.suggestPacks();

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].pack).toEqual(mockPack);
      expect(suggestions[0].analysis.isWorthwhile).toBe(true);
    });
  });

  describe("validateSufficientFunds", () => {
    test("debería validar fondos suficientes", async () => {
      const totals = { coins: 500, usd: 5, ars: 750 };
      mockUserDataManager.getUserData.mockResolvedValue({ coins: 1000 });

      const result = await cartService.validateSufficientFunds(totals);

      expect(result).toEqual({
        sufficient: true,
        userCoins: 1000,
        required: 500,
        missing: {},
        reason: "sufficient_funds",
      });
    });

    test("debería detectar fondos insuficientes", async () => {
      const totals = { coins: 1500, usd: 15, ars: 2250 };
      mockUserDataManager.getUserData.mockResolvedValue({ coins: 1000 });

      const result = await cartService.validateSufficientFunds(totals);

      expect(result).toEqual({
        sufficient: false,
        userCoins: 1000,
        required: 1500,
        missing: { coins: 500 },
        reason: "insufficient_coins",
      });
    });

    test("debería manejar la ausencia del gestor de datos de usuario", async () => {
      cartService.userDataManager = null;
      const totals = { coins: 500 };

      const result = await cartService.validateSufficientFunds(totals);

      expect(result.sufficient).toBe(false);
      expect(result.reason).toBe("user_data_unavailable");
    });
  });

  describe("getCartSummary", () => {
    test("debería retornar un resumen completo del carrito", async () => {
      mockProductService.getProduct.mockResolvedValue({
        id: "test_product",
        name: "Test Product",
        price: { coins: 100, usd: 1, ars: 150 },
      });

      await cartService.addItem("test_product", 2);

      const summary = await cartService.getCartSummary();

      expect(summary).toEqual({
        items: expect.arrayContaining([
          expect.objectContaining({
            productId: "test_product",
            quantity: 2,
            subtotal: { coins: 200, usd: 2, ars: 300 },
          }),
        ]),
        totals: expect.objectContaining({
          coins: 200,
          itemCount: 1,
          totalQuantity: 2,
        }),
        fundsValidation: expect.objectContaining({
          sufficient: true,
        }),
        suggestions: expect.any(Array),
        isEmpty: false,
        canProceedToPurchase: true,
      });
    });

    test("debería retornar resumen vacío para carrito vacío", async () => {
      const summary = await cartService.getCartSummary();

      expect(summary.isEmpty).toBe(true);
      expect(summary.canProceedToPurchase).toBe(false);
      expect(summary.items).toHaveLength(0);
    });
  });

  describe("patrón observer", () => {
    test("debería suscribir y desuscribir observadores", () => {
      const observer1 = jest.fn();
      const observer2 = jest.fn();

      cartService.subscribe(observer1);
      cartService.subscribe(observer2);

      cartService.notify("test_event", { data: "test" });

      expect(observer1).toHaveBeenCalledWith("test_event", { data: "test" });
      expect(observer2).toHaveBeenCalledWith("test_event", { data: "test" });

      cartService.unsubscribe(observer1);
      cartService.notify("test_event2", { data: "test2" });

      expect(observer1).not.toHaveBeenCalledWith("test_event2", {
        data: "test2",
      });
      expect(observer2).toHaveBeenCalledWith("test_event2", { data: "test2" });
    });

    test("debería manejar errores de observadores graciosamente", () => {
      const errorObserver = jest.fn().mockImplementation(() => {
        throw new Error("Observer error");
      });
      const normalObserver = jest.fn();

      cartService.subscribe(errorObserver);
      cartService.subscribe(normalObserver);

      // No debería lanzar error
      expect(() => {
        cartService.notify("test_event", { data: "test" });
      }).not.toThrow();

      expect(normalObserver).toHaveBeenCalled();
    });

    test("no debería suscribir observadores que no sean funciones", () => {
      cartService.subscribe("not a function");
      cartService.subscribe(null);
      cartService.subscribe(undefined);

      expect(cartService.observers).toHaveLength(0);
    });
  });

  describe("métodos utilitarios", () => {
    beforeEach(async () => {
      mockProductService.getProduct.mockResolvedValue({
        id: "test_product",
        name: "Test Product",
        price: { coins: 100 },
      });

      await cartService.addItem("test_product", 3);
    });

    test("hasItem debería retornar el booleano correcto", () => {
      expect(cartService.hasItem("test_product")).toBe(true);
      expect(cartService.hasItem("non_existent")).toBe(false);
    });

    test("getItemQuantity debería retornar la cantidad correcta", () => {
      expect(cartService.getItemQuantity("test_product")).toBe(3);
      expect(cartService.getItemQuantity("non_existent")).toBe(0);
    });

    test("getItem debería retornar el item correcto", () => {
      const item = cartService.getItem("test_product");
      expect(item).toEqual(
        expect.objectContaining({
          productId: "test_product",
          quantity: 3,
        })
      );

      expect(cartService.getItem("non_existent")).toBeNull();
    });

    test("updateItemQuantity debería actualizar la cantidad correctamente", () => {
      const observer = jest.fn();
      cartService.subscribe(observer);

      const result = cartService.updateItemQuantity("test_product", 5);

      expect(result).toBe(true);
      expect(cartService.getItemQuantity("test_product")).toBe(5);
      expect(observer).toHaveBeenCalledWith("item_quantity_updated", {
        productId: "test_product",
        oldQuantity: 3,
        newQuantity: 5,
        difference: 2,
      });
    });

    test("updateItemQuantity debería remover el item cuando la cantidad es 0", () => {
      const result = cartService.updateItemQuantity("test_product", 0);

      expect(result).toBe(true);
      expect(cartService.hasItem("test_product")).toBe(false);
    });

    test("getState debería retornar el estado actual", () => {
      const state = cartService.getState();

      expect(state).toEqual({
        items: expect.arrayContaining([
          expect.objectContaining({
            productId: "test_product",
            quantity: 3,
          }),
        ]),
        itemCount: 1,
        totalQuantity: 3,
        lastModified: expect.any(Date),
      });
    });
  });

  describe("validateCart", () => {
    test("debería validar carrito vacío como inválido", async () => {
      const result = await cartService.validateCart();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("El carrito está vacío");
    });

    test("debería validar carrito con productos no disponibles", async () => {
      mockProductService.getProduct.mockResolvedValue({
        id: "unavailable_product",
        name: "Unavailable Product",
        availability: { isActive: false },
      });

      await cartService.addItem("unavailable_product", 1);

      const result = await cartService.validateCart();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Unavailable Product ya no está disponible"
      );
    });

    test("debería validar carrito con fondos insuficientes", async () => {
      mockProductService.getProduct.mockResolvedValue({
        id: "expensive_product",
        name: "Expensive Product",
        price: { coins: 2000 },
      });

      mockUserDataManager.getUserData.mockResolvedValue({ coins: 500 });

      await cartService.addItem("expensive_product", 1);

      const result = await cartService.validateCart();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Fondos insuficientes para completar la compra"
      );
    });

    test("debería validar carrito válido", async () => {
      mockProductService.getProduct.mockResolvedValue({
        id: "valid_product",
        name: "Valid Product",
        price: { coins: 100 },
        availability: { isActive: true },
      });

      await cartService.addItem("valid_product", 1);

      const result = await cartService.validateCart();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("debería incluir advertencias para mejores ofertas de packs", async () => {
      mockProductService.getProduct.mockResolvedValue({
        id: "product1",
        name: "Product 1",
        price: { coins: 100 },
        availability: { isActive: true },
      });

      await cartService.addItem("product1", 1);

      // Mock sugerencia de pack con alto ahorro
      const mockPack = {
        id: "better_pack",
        name: "Better Pack",
        items: ["product1", "product2"],
      };

      mockProductService.getAllPacks.mockResolvedValue([mockPack]);
      mockProductService.calculatePackPrice.mockResolvedValue(150);

      // Mock del análisis para retornar alto ahorro
      jest.spyOn(cartService, "_analyzePackOpportunity").mockResolvedValue({
        isWorthwhile: true,
        savingsPercentage: 25,
        savingsAmount: 50,
      });

      const result = await cartService.validateCart();

      expect(result.warnings).toContain(
        'Podrías ahorrar 50 monedas comprando el pack "Better Pack"'
      );
    });
  });

  describe("persistencia en localStorage", () => {
    beforeEach(() => {
      mockProductService.getProduct.mockResolvedValue({
        id: "test_product",
        name: "Test Product",
        price: { coins: 100 },
      });
    });

    test("debería guardar el carrito en storage", async () => {
      await cartService.addItem("test_product", 2);

      cartService.saveToStorage();

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "quiz_cristiano_cart",
        expect.stringContaining("test_product")
      );
    });

    test("debería cargar el carrito desde storage", async () => {
      const savedCart = {
        items: [
          {
            productId: "test_product",
            quantity: 2,
            addedAt: new Date().toISOString(),
          },
        ],
        savedAt: new Date().toISOString(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedCart));

      const result = await cartService.loadFromStorage();

      expect(result).toBe(true);
      expect(cartService.hasItem("test_product")).toBe(true);
      expect(cartService.getItemQuantity("test_product")).toBe(2);
    });

    test("no debería cargar datos antiguos del carrito", async () => {
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25); // 25 horas atrás

      const oldCart = {
        items: [{ productId: "test_product", quantity: 1 }],
        savedAt: oldDate.toISOString(),
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(oldCart));

      const result = await cartService.loadFromStorage();

      expect(result).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "quiz_cristiano_cart"
      );
    });

    test("debería manejar datos corruptos del storage", async () => {
      localStorageMock.getItem.mockReturnValue("invalid json");

      const result = await cartService.loadFromStorage();

      expect(result).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "quiz_cristiano_cart"
      );
    });

    test("debería limpiar el storage", () => {
      cartService.clearStorage();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        "quiz_cristiano_cart"
      );
    });
  });

  describe("_analyzePackOpportunity", () => {
    test("debería analizar pack sin superposición", async () => {
      const pack = {
        id: "pack1",
        items: ["product1", "product2"],
      };

      const analysis = await cartService._analyzePackOpportunity(
        pack,
        ["product3", "product4"],
        "user123"
      );

      expect(analysis.isWorthwhile).toBe(false);
      expect(analysis.reason).toBe("no_overlap");
    });

    test("debería analizar oportunidad de pack que vale la pena", async () => {
      const pack = {
        id: "pack1",
        name: "Test Pack",
        items: ["product1", "product2", "product3"],
      };

      mockProductService.calculatePackPrice.mockResolvedValue(200);
      mockProductService.getProduct.mockResolvedValue({ 
        price: { coins: 100 },
        availability: { isActive: true }
      });

      // Agregar items al carrito primero
      await cartService.addItem("product1", 1);
      await cartService.addItem("product2", 1);

      const analysis = await cartService._analyzePackOpportunity(
        pack,
        ["product1", "product2"],
        "user123"
      );

      expect(analysis.isWorthwhile).toBe(true);
      expect(analysis.savingsPercentage).toBeGreaterThan(15);
      expect(analysis.packItemsInCart).toBe(2);
    });
  });

  describe("_calculateSuggestionPriority", () => {
    test("debería calcular la prioridad correctamente", () => {
      const analysis = {
        savingsPercentage: 30,
        overlapPercentage: 80,
        packItemsInCart: 3,
        additionalItems: ["item1", "item2", "item3"],
      };

      const priority = cartService._calculateSuggestionPriority(analysis);

      expect(priority).toBeGreaterThan(50); // Debería ser alta prioridad
    });

    test("debería dar bonus por muchos items adicionales", () => {
      const analysisWithBonus = {
        savingsPercentage: 20,
        overlapPercentage: 50,
        packItemsInCart: 2,
        additionalItems: ["item1", "item2", "item3", "item4"],
      };

      const analysisWithoutBonus = {
        savingsPercentage: 20,
        overlapPercentage: 50,
        packItemsInCart: 2,
        additionalItems: ["item1"],
      };

      const priorityWithBonus =
        cartService._calculateSuggestionPriority(analysisWithBonus);
      const priorityWithoutBonus =
        cartService._calculateSuggestionPriority(analysisWithoutBonus);

      expect(priorityWithBonus).toBeGreaterThan(priorityWithoutBonus);
    });
  });

  describe("_isProductAvailable", () => {
    test("debería retornar true para producto sin configuración de disponibilidad", () => {
      const product = { id: "test", name: "Test" };
      expect(cartService._isProductAvailable(product)).toBe(true);
    });

    test("debería retornar false para producto inactivo", () => {
      const product = {
        id: "test",
        availability: { isActive: false },
      };
      expect(cartService._isProductAvailable(product)).toBe(false);
    });

    test("debería verificar fechas de inicio y fin", () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Producto aún no disponible
      const futureProduct = {
        id: "future",
        availability: {
          isActive: true,
          startDate: tomorrow,
        },
      };
      expect(cartService._isProductAvailable(futureProduct)).toBe(false);

      // Producto expirado
      const expiredProduct = {
        id: "expired",
        availability: {
          isActive: true,
          endDate: yesterday,
        },
      };
      expect(cartService._isProductAvailable(expiredProduct)).toBe(false);

      // Producto actualmente disponible
      const availableProduct = {
        id: "available",
        availability: {
          isActive: true,
          startDate: yesterday,
          endDate: tomorrow,
        },
      };
      expect(cartService._isProductAvailable(availableProduct)).toBe(true);
    });
  });
});
