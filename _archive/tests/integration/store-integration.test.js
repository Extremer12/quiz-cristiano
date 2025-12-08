/**
 * ================================================
 * TESTS DE INTEGRACIÓN - TIENDA MEJORADA
 * Quiz Cristiano - Pruebas E2E para flujos completos
 * ================================================
 */

describe("Store Integration Tests", () => {
  let productService;
  let cartService;
  let paymentService;
  let userStoreDataManager;
  let mockUserId;
  let mockFirestore;

  beforeEach(async () => {
    // Mock de Firestore
    mockFirestore = {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          coins: 1000,
          ownedProducts: [],
          statistics: { totalSpent: 0, purchaseCount: 0 },
        }),
      }),
      set: jest.fn().mockResolvedValue(),
      update: jest.fn().mockResolvedValue(),
    };

    // Mock global de Firebase
    global.db = mockFirestore;

    // Mock servicios
    productService = {
      getProduct: jest.fn(),
      getAllProducts: jest.fn(),
      isProductAvailable: jest.fn(),
    };

    cartService = {
      clearCart: jest.fn(),
      addProduct: jest.fn(),
      removeProduct: jest.fn(),
      getCartItems: jest.fn(),
      setDependencies: jest.fn(),
    };

    paymentService = {
      processPayment: jest.fn(),
      createOrder: jest.fn(),
      capturePayment: jest.fn(),
    };

    userStoreDataManager = {
      getUserData: jest.fn(),
      updateUserData: jest.fn(),
      creditUserAccount: jest.fn(),
    };

    // Configurar dependencias
    cartService.setDependencies(productService, userStoreDataManager);

    // Mock de usuario
    mockUserId = "test_user_123";

    // Inicializar servicios
    await productService.initialize();
    await paymentService.initialize();
    await userStoreDataManager.initialize(mockUserId);
  });

  afterEach(() => {
    // Limpiar mocks
    jest.clearAllMocks();

    // Limpiar carrito
    cartService.clearCart();
  });

  describe("Flujo completo de compra individual", () => {
    test("Debe completar compra de avatar con monedas exitosamente", async () => {
      // Arrange
      const productId = "avatar_basic_1";
      const mockProduct = {
        id: productId,
        name: "Avatar Básico",
        category: "avatares",
        type: "individual",
        price: { coins: 150, usd: 3, ars: 300 },
        availability: { isActive: true },
      };

      // Mock del producto en ProductService
      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Act - Agregar al carrito
      const addResult = await cartService.addItem(productId, 1);
      expect(addResult).toBe(true);

      // Verificar carrito
      const cartSummary = await cartService.getCartSummary();
      expect(cartSummary.items).toHaveLength(1);
      expect(cartSummary.totals.coins).toBe(150);
      expect(cartSummary.canProceedToPurchase).toBe(true);

      // Act - Procesar pago
      const paymentResult = await paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(true);
      expect(paymentResult.transactionId).toBeDefined();
      expect(paymentResult.message).toBe("Compra realizada exitosamente");

      // Verificar que se registró la transacción
      const history = await paymentService.getTransactionHistory(mockUserId);
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe("completed");
    });

    test("Debe fallar compra por fondos insuficientes", async () => {
      // Arrange
      const productId = "avatar_premium_1";
      const mockProduct = {
        id: productId,
        name: "Avatar Premium",
        category: "avatares",
        type: "individual",
        price: { coins: 2000, usd: 10, ars: 1000 }, // Más caro que las monedas disponibles
        availability: { isActive: true },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Act
      const addResult = await cartService.addItem(productId, 1);
      expect(addResult).toBe(true);

      const cartSummary = await cartService.getCartSummary();
      expect(cartSummary.canProceedToPurchase).toBe(false);
      expect(cartSummary.fundsValidation.sufficient).toBe(false);

      // Intentar pago
      const paymentResult = await paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(false);
      expect(paymentResult.error).toContain("insuficientes");
    });
  });

  describe("Flujo completo de compra de packs", () => {
    test("Debe calcular precio dinámico de pack correctamente", async () => {
      // Arrange
      const packId = "pack_avatars_basic";
      const mockPack = {
        id: packId,
        name: "Pack Avatares Básicos",
        category: "avatares",
        type: "pack",
        items: ["avatar_1", "avatar_2", "avatar_3"],
        price: { coins: 300, usd: 6, ars: 600 },
        discountPercentage: 25,
        dynamicPricing: true,
      };

      const mockItems = [
        { id: "avatar_1", price: { coins: 100 } },
        { id: "avatar_2", price: { coins: 100 } },
        { id: "avatar_3", price: { coins: 100 } },
      ];

      jest
        .spyOn(productService, "getProduct")
        .mockImplementation(async (id) => {
          if (id === packId) return mockPack;
          return mockItems.find((item) => item.id === id);
        });

      // Mock usuario sin productos
      jest
        .spyOn(userStoreDataManager, "getUserOwnedProducts")
        .mockResolvedValue([]);

      // Act
      const packPrice = await productService.calculatePackPrice(
        packId,
        mockUserId
      );
      const pricingInfo = await productService.getPackPricingInfo(
        packId,
        mockUserId
      );

      // Assert
      expect(packPrice).toBe(225); // 300 total - 25% descuento = 225
      expect(pricingInfo.discountPercentage).toBe(25);
      expect(pricingInfo.worthBuying).toBe(true);
      expect(pricingInfo.newItems).toBe(3);
    });

    test("Debe ajustar precio de pack cuando usuario ya posee algunos items", async () => {
      // Arrange
      const packId = "pack_avatars_basic";
      const mockPack = {
        id: packId,
        name: "Pack Avatares Básicos",
        category: "avatares",
        type: "pack",
        items: ["avatar_1", "avatar_2", "avatar_3"],
        price: { coins: 300, usd: 6, ars: 600 },
        discountPercentage: 25,
        dynamicPricing: true,
      };

      const mockItems = [
        { id: "avatar_1", price: { coins: 100 } },
        { id: "avatar_2", price: { coins: 100 } },
        { id: "avatar_3", price: { coins: 100 } },
      ];

      jest
        .spyOn(productService, "getProduct")
        .mockImplementation(async (id) => {
          if (id === packId) return mockPack;
          return mockItems.find((item) => item.id === id);
        });

      // Mock usuario que ya posee avatar_1
      jest
        .spyOn(userStoreDataManager, "getUserOwnedProducts")
        .mockResolvedValue(["avatar_1"]);

      // Act
      const packPrice = await productService.calculatePackPrice(
        packId,
        mockUserId
      );
      const pricingInfo = await productService.getPackPricingInfo(
        packId,
        mockUserId
      );

      // Assert
      // Solo 2 items nuevos: 200 total - 25% descuento = 150, proporcional = 100
      expect(packPrice).toBe(100);
      expect(pricingInfo.newItems).toBe(2);
      expect(pricingInfo.itemsAlreadyOwned).toHaveLength(1);
    });

    test("Debe completar compra de pack exitosamente", async () => {
      // Arrange
      const packId = "pack_powerups_combo";
      const mockPack = {
        id: packId,
        name: "Pack Power-ups Combo",
        category: "powerups",
        type: "pack",
        items: [
          "powerup_shield",
          "powerup_double_points",
          "powerup_time_freeze",
        ],
        price: { coins: 200, usd: 4, ars: 400 },
        discountPercentage: 30,
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockPack);
      jest
        .spyOn(userStoreDataManager, "getUserOwnedProducts")
        .mockResolvedValue([]);

      // Act
      const addResult = await cartService.addItem(packId, 1);
      expect(addResult).toBe(true);

      const paymentResult = await paymentService.processPayment(
        packId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(true);

      // Verificar que se procesaron todos los items del pack
      const userData = await userStoreDataManager.getUserData();
      expect(userData.addProduct).toHaveBeenCalledTimes(3); // 3 items del pack
    });
  });

  describe("Sugerencias inteligentes de packs", () => {
    test("Debe sugerir packs cuando hay items relacionados en carrito", async () => {
      // Arrange
      const individualItems = [
        { id: "powerup_shield", price: { coins: 50 } },
        { id: "powerup_double_points", price: { coins: 75 } },
      ];

      const suggestedPack = {
        id: "pack_powerups_combo",
        name: "Pack Power-ups Combo",
        type: "pack",
        items: [
          "powerup_shield",
          "powerup_double_points",
          "powerup_time_freeze",
        ],
        price: { coins: 150 },
        discountPercentage: 20,
      };

      jest
        .spyOn(productService, "getProduct")
        .mockImplementation(async (id) => {
          const item = individualItems.find((i) => i.id === id);
          return item || suggestedPack;
        });

      jest
        .spyOn(productService, "getAllPacks")
        .mockResolvedValue([suggestedPack]);

      // Act - Agregar items individuales al carrito
      await cartService.addItem("powerup_shield", 1);
      await cartService.addItem("powerup_double_points", 1);

      const suggestions = await cartService.suggestPacks();

      // Assert
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].pack.id).toBe("pack_powerups_combo");
      expect(suggestions[0].analysis.isWorthwhile).toBe(true);
      expect(suggestions[0].analysis.packItemsInCart).toBe(2);
      expect(suggestions[0].analysis.savingsPercentage).toBeGreaterThan(0);
    });

    test("Debe mostrar sugerencias en resumen de carrito", async () => {
      // Arrange
      const mockProduct = {
        id: "avatar_basic_1",
        price: { coins: 100 },
      };

      const mockSuggestion = {
        pack: { id: "pack_avatars", name: "Pack Avatares" },
        analysis: { isWorthwhile: true, savingsPercentage: 25 },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);
      jest
        .spyOn(cartService, "suggestPacks")
        .mockResolvedValue([mockSuggestion]);

      // Act
      await cartService.addItem("avatar_basic_1", 1);
      const cartSummary = await cartService.getCartSummary();

      // Assert
      expect(cartSummary.suggestions).toHaveLength(1);
      expect(cartSummary.suggestions[0].pack.id).toBe("pack_avatars");
    });
  });

  describe("Integración con proveedores de pago externos", () => {
    test("Debe manejar pago con PayPal correctamente", async () => {
      // Arrange
      const productId = "coins_500";
      const mockProduct = {
        id: productId,
        name: "500 Monedas + Bonus",
        category: "monedas",
        type: "individual",
        price: { coins: 0, usd: 5, ars: 500 },
        metadata: { coinAmount: 500, bonusCoins: 100 },
      };

      // Mock PayPal SDK
      global.window = {
        paypal: {
          orders: {
            create: jest.fn().mockResolvedValue({
              id: "PAYPAL_ORDER_123",
              links: [{ rel: "approve", href: "https://paypal.com/approve" }],
            }),
          },
        },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);
      jest
        .spyOn(paymentService, "checkPayPalAvailability")
        .mockReturnValue(true);

      // Act
      const paymentResult = await paymentService.processPayment(
        productId,
        "paypal",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(true);
      expect(paymentResult.data.orderId).toBe("PAYPAL_ORDER_123");
      expect(paymentResult.data.approvalUrl).toContain("paypal.com");
    });

    test("Debe manejar error de PayPal gracefully", async () => {
      // Arrange
      const productId = "coins_100";
      const mockProduct = {
        id: productId,
        price: { usd: 2 },
      };

      // Mock PayPal SDK que falla
      global.window = {
        paypal: {
          orders: {
            create: jest.fn().mockRejectedValue(new Error("PayPal API Error")),
          },
        },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);
      jest
        .spyOn(paymentService, "checkPayPalAvailability")
        .mockReturnValue(true);

      // Act
      const paymentResult = await paymentService.processPayment(
        productId,
        "paypal",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(false);
      expect(paymentResult.error).toContain("PayPal");
    });
  });

  describe("Sistema de reintentos y manejo de errores", () => {
    test("Debe reintentar pago fallido automáticamente", async () => {
      // Arrange
      const productId = "test_product";
      const mockProduct = {
        id: productId,
        price: { coins: 100 },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Mock que falla 2 veces y luego funciona
      let attemptCount = 0;
      jest
        .spyOn(paymentService, "processCoinsPayment")
        .mockImplementation(async () => {
          attemptCount++;
          if (attemptCount < 3) {
            const error = new Error("Temporary error");
            error.retryable = true;
            throw error;
          }
          return { success: true, method: "coins" };
        });

      // Act
      const paymentResult = await paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(true);
      expect(paymentResult.attempt).toBe(3);
      expect(attemptCount).toBe(3);
    });

    test("Debe fallar después de máximo número de reintentos", async () => {
      // Arrange
      const productId = "test_product";
      const mockProduct = {
        id: productId,
        price: { coins: 100 },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Mock que siempre falla
      jest
        .spyOn(paymentService, "processCoinsPayment")
        .mockImplementation(async () => {
          const error = new Error("Persistent error");
          error.retryable = true;
          throw error;
        });

      // Act
      const paymentResult = await paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(false);
      expect(paymentResult.attempts).toBe(3); // Máximo configurado
      expect(paymentResult.error).toContain("Persistent error");
    });
  });

  describe("Validaciones de integridad", () => {
    test("Debe prevenir compra duplicada del mismo producto", async () => {
      // Arrange
      const productId = "avatar_unique_1";
      const mockProduct = {
        id: productId,
        name: "Avatar Único",
        category: "avatares",
        type: "individual",
        price: { coins: 200 },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Mock usuario que ya posee el producto
      jest
        .spyOn(userStoreDataManager, "getUserOwnedProducts")
        .mockResolvedValue([productId]);

      // Act
      const paymentResult = await paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(false);
      expect(paymentResult.error).toContain("ya posee");
    });

    test("Debe validar disponibilidad de producto antes de compra", async () => {
      // Arrange
      const productId = "limited_offer_1";
      const mockProduct = {
        id: productId,
        name: "Oferta Limitada",
        price: { coins: 100 },
        availability: {
          isActive: false,
          endDate: new Date(Date.now() - 86400000), // Ayer
        },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Act
      const addResult = await cartService.addItem(productId, 1);

      // Assert
      expect(addResult).toBe(false);
    });

    test("Debe validar carrito completo antes de proceder al pago", async () => {
      // Arrange
      const validProduct = {
        id: "valid_product",
        price: { coins: 50 },
        availability: { isActive: true },
      };

      const expiredProduct = {
        id: "expired_product",
        price: { coins: 100 },
        availability: {
          isActive: false,
          endDate: new Date(Date.now() - 86400000),
        },
      };

      jest
        .spyOn(productService, "getProduct")
        .mockImplementation(async (id) => {
          return id === "valid_product" ? validProduct : expiredProduct;
        });

      // Act
      await cartService.addItem("valid_product", 1);
      // Simular que el producto expiró después de agregarlo
      await cartService.addItem("expired_product", 1);

      const validation = await cartService.validateCart();

      // Assert
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "expired_product ya no está disponible"
      );
    });
  });

  describe("Sincronización con Firestore", () => {
    test("Debe guardar transacción en Firestore correctamente", async () => {
      // Arrange
      const productId = "test_sync_product";
      const mockProduct = {
        id: productId,
        name: "Producto de Prueba",
        price: { coins: 100 },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Act
      const paymentResult = await paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(true);

      // Verificar que se llamó a Firestore para guardar la transacción
      expect(mockFirestore.collection).toHaveBeenCalledWith("transactions");
      expect(mockFirestore.set).toHaveBeenCalled();
    });

    test("Debe actualizar datos de usuario en Firestore después de compra", async () => {
      // Arrange
      const productId = "coins_package_100";
      const mockProduct = {
        id: productId,
        name: "100 Monedas",
        category: "monedas",
        price: { coins: 0, usd: 2 },
        metadata: { coinAmount: 100, bonusCoins: 20 },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Act
      const paymentResult = await paymentService.processPayment(
        productId,
        "paypal",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(true);

      // Verificar que se actualizaron los datos del usuario
      expect(mockFirestore.collection).toHaveBeenCalledWith("users");
      expect(mockFirestore.update).toHaveBeenCalled();
    });

    test("Debe manejar errores de Firestore gracefully", async () => {
      // Arrange
      const productId = "test_firestore_error";
      const mockProduct = {
        id: productId,
        price: { coins: 100 },
      };

      // Mock Firestore que falla
      mockFirestore.set.mockRejectedValue(
        new Error("Firestore connection error")
      );

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Act
      const paymentResult = await paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );

      // Assert - El pago debe fallar si no se puede guardar en Firestore
      expect(paymentResult.success).toBe(false);
      expect(paymentResult.error).toContain("Error completando compra");
    });
  });

  describe("Flujos de suscripciones premium", () => {
    test("Debe activar suscripción premium correctamente", async () => {
      // Arrange
      const subscriptionId = "premium_monthly";
      const mockSubscription = {
        id: subscriptionId,
        name: "Premium Mensual",
        category: "premium",
        type: "subscription",
        price: { coins: 0, usd: 9.99, ars: 999 },
        metadata: {
          duration: 30 * 24 * 60 * 60 * 1000, // 30 días
          benefits: ["no_ads", "double_coins", "exclusive_avatars"],
          autoRenew: true,
        },
      };

      jest
        .spyOn(productService, "getProduct")
        .mockResolvedValue(mockSubscription);

      // Mock PayPal para suscripción
      global.window.paypal.orders.create.mockResolvedValue({
        id: "SUBSCRIPTION_ORDER_123",
        links: [{ rel: "approve", href: "https://paypal.com/approve/sub" }],
      });

      // Act
      const paymentResult = await paymentService.processPayment(
        subscriptionId,
        "paypal",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(true);

      // Verificar que se activó la suscripción
      const userData = await userStoreDataManager.getUserData();
      expect(userData.activateSubscription).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: subscriptionId,
          benefits: ["no_ads", "double_coins", "exclusive_avatars"],
        })
      );
    });
  });

  describe("Analytics y métricas", () => {
    test("Debe registrar métricas de conversión correctamente", async () => {
      // Arrange
      const productId = "analytics_test_product";
      const mockProduct = {
        id: productId,
        name: "Producto Analytics",
        price: { coins: 150 },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Mock del sistema de analytics
      const mockAnalytics = {
        trackPurchaseFlow: jest.fn(),
        trackConversion: jest.fn(),
      };

      global.window.storeAnalytics = mockAnalytics;

      // Act
      await cartService.addItem(productId, 1);
      const paymentResult = await paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(true);
      expect(mockAnalytics.trackPurchaseFlow).toHaveBeenCalled();
      expect(mockAnalytics.trackConversion).toHaveBeenCalledWith(
        expect.objectContaining({
          productId,
          amount: 150,
          paymentMethod: "coins",
        })
      );
    });
  });

  describe("Flujos de obtención gratuita", () => {
    test("Debe procesar obtención gratuita por logros correctamente", async () => {
      // Arrange
      const productId = "avatar_free_achievement";
      const mockProduct = {
        id: productId,
        name: "Avatar por Logro",
        category: "avatares",
        type: "individual",
        price: { coins: 0 }, // Gratis por logro
        freeEarnMethod: {
          type: "achievement",
          requirement: "complete_10_games",
          description: "Completa 10 partidas",
        },
      };

      // Mock del servicio de obtención gratuita
      const mockFreeEarnService = {
        checkProgress: jest.fn().mockResolvedValue({
          canClaim: true,
          progress: 10,
          requirement: 10,
          completed: true,
        }),
        claimReward: jest.fn().mockResolvedValue({ success: true }),
      };

      global.window.freeEarnService = mockFreeEarnService;

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Act
      const paymentResult = await paymentService.processPayment(
        productId,
        "free_earn",
        mockUserId,
        { method: "achievement" }
      );

      // Assert
      expect(paymentResult.success).toBe(true);
      expect(mockFreeEarnService.checkProgress).toHaveBeenCalledWith(
        mockUserId,
        "complete_10_games"
      );
      expect(mockFreeEarnService.claimReward).toHaveBeenCalled();
    });

    test("Debe fallar obtención gratuita si no se cumplen requisitos", async () => {
      // Arrange
      const productId = "powerup_free_daily";
      const mockProduct = {
        id: productId,
        name: "Power-up Diario",
        price: { coins: 0 },
        freeEarnMethod: {
          type: "daily_reward",
          requirement: "daily_login",
          cooldown: 24 * 60 * 60 * 1000, // 24 horas
        },
      };

      const mockFreeEarnService = {
        checkProgress: jest.fn().mockResolvedValue({
          canClaim: false,
          progress: 0,
          requirement: 1,
          completed: false,
          nextAvailable: new Date(Date.now() + 3600000), // En 1 hora
        }),
      };

      global.window.freeEarnService = mockFreeEarnService;

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Act
      const paymentResult = await paymentService.processPayment(
        productId,
        "free_earn",
        mockUserId,
        { method: "daily_reward" }
      );

      // Assert
      expect(paymentResult.success).toBe(false);
      expect(paymentResult.error).toContain("requisitos");
    });
  });

  describe("Gestión de inventario y límites", () => {
    test("Debe respetar límites de compra por usuario", async () => {
      // Arrange
      const productId = "limited_edition_avatar";
      const mockProduct = {
        id: productId,
        name: "Avatar Edición Limitada",
        price: { coins: 500 },
        purchaseLimit: {
          perUser: 1,
          total: 100,
        },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Mock usuario que ya compró este producto
      jest
        .spyOn(userStoreDataManager, "getUserPurchaseCount")
        .mockResolvedValue(1);

      // Act
      const paymentResult = await paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(false);
      expect(paymentResult.error).toContain("límite de compra");
    });

    test("Debe manejar inventario de power-ups correctamente", async () => {
      // Arrange
      const powerUpId = "powerup_shield_5x";
      const mockPowerUp = {
        id: powerUpId,
        name: "Escudo x5",
        category: "powerups",
        type: "individual",
        price: { coins: 100 },
        metadata: {
          powerUpType: "shield",
          quantity: 5,
        },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockPowerUp);

      // Act
      const paymentResult = await paymentService.processPayment(
        powerUpId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(true);

      // Verificar que se agregaron los power-ups al inventario
      const userData = await userStoreDataManager.getUserData();
      expect(userData.addPowerUps).toHaveBeenCalledWith({
        shield: 5,
      });
    });
  });

  describe("Manejo de concurrencia y estados", () => {
    test("Debe manejar compras concurrentes del mismo producto", async () => {
      // Arrange
      const productId = "concurrent_test_product";
      const mockProduct = {
        id: productId,
        name: "Producto Concurrente",
        price: { coins: 200 },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Simular delay en el procesamiento
      jest
        .spyOn(paymentService, "processCoinsPayment")
        .mockImplementation(async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return { success: true, method: "coins" };
        });

      // Act - Iniciar dos compras simultáneas
      const promise1 = paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );
      const promise2 = paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Assert - Solo una debe ser exitosa
      const successCount = [result1, result2].filter((r) => r.success).length;
      expect(successCount).toBe(1);

      const failureCount = [result1, result2].filter((r) => !r.success).length;
      expect(failureCount).toBe(1);
    });

    test("Debe mantener consistencia durante fallos parciales", async () => {
      // Arrange
      const packId = "consistency_test_pack";
      const mockPack = {
        id: packId,
        name: "Pack Consistencia",
        type: "pack",
        items: ["item_1", "item_2", "item_3"],
        price: { coins: 300 },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockPack);

      // Mock que falla al procesar el segundo item
      let itemCount = 0;
      jest
        .spyOn(userStoreDataManager, "addProduct")
        .mockImplementation(async (productId) => {
          itemCount++;
          if (itemCount === 2) {
            throw new Error("Database error");
          }
          return true;
        });

      // Act
      const paymentResult = await paymentService.processPayment(
        packId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(false);

      // Verificar que se intentó rollback
      expect(paymentService.attemptRollback).toHaveBeenCalled();
    });
  });

  describe("Integración con sistema de notificaciones", () => {
    test("Debe enviar notificaciones de compra exitosa", async () => {
      // Arrange
      const productId = "notification_test_product";
      const mockProduct = {
        id: productId,
        name: "Producto Notificación",
        price: { coins: 100 },
      };

      const mockNotificationService = {
        sendPurchaseNotification: jest.fn(),
        sendEmailReceipt: jest.fn(),
      };

      global.window.notificationService = mockNotificationService;

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Act
      const paymentResult = await paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(true);
      expect(
        mockNotificationService.sendPurchaseNotification
      ).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          productName: "Producto Notificación",
          amount: 100,
        })
      );
    });

    test("Debe notificar sobre sugerencias de packs", async () => {
      // Arrange
      const mockNotificationService = {
        showPackSuggestion: jest.fn(),
      };

      global.window.notificationService = mockNotificationService;

      const mockProduct = {
        id: "individual_item",
        price: { coins: 50 },
      };

      const mockSuggestion = {
        pack: { id: "suggested_pack", name: "Pack Sugerido" },
        analysis: { savingsPercentage: 30, savingsAmount: 25 },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);
      jest
        .spyOn(cartService, "suggestPacks")
        .mockResolvedValue([mockSuggestion]);

      // Act
      await cartService.addItem("individual_item", 1);
      await cartService.getCartSummary();

      // Assert
      expect(mockNotificationService.showPackSuggestion).toHaveBeenCalledWith(
        expect.objectContaining({
          packName: "Pack Sugerido",
          savings: 25,
          savingsPercentage: 30,
        })
      );
    });
  });

  describe("Pruebas de rendimiento y carga", () => {
    test("Debe manejar múltiples productos en carrito eficientemente", async () => {
      // Arrange
      const productCount = 50;
      const mockProducts = Array.from({ length: productCount }, (_, i) => ({
        id: `product_${i}`,
        name: `Producto ${i}`,
        price: { coins: 10 + i },
        availability: { isActive: true },
      }));

      jest
        .spyOn(productService, "getProduct")
        .mockImplementation(async (id) => {
          const index = parseInt(id.split("_")[1]);
          return mockProducts[index];
        });

      const startTime = Date.now();

      // Act
      for (let i = 0; i < productCount; i++) {
        await cartService.addItem(`product_${i}`, 1);
      }

      const cartSummary = await cartService.getCartSummary();
      const endTime = Date.now();

      // Assert
      expect(cartSummary.items).toHaveLength(productCount);
      expect(endTime - startTime).toBeLessThan(5000); // Menos de 5 segundos
      expect(cartSummary.totals.coins).toBe(
        mockProducts.reduce((sum, p) => sum + p.price.coins, 0)
      );
    });

    test("Debe cachear resultados de cálculos de packs", async () => {
      // Arrange
      const packId = "cache_test_pack";
      const mockPack = {
        id: packId,
        name: "Pack Cache Test",
        type: "pack",
        items: ["item_1", "item_2", "item_3"],
        price: { coins: 200 },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockPack);

      const calculateSpy = jest.spyOn(productService, "calculatePackPrice");

      // Act - Calcular precio múltiples veces
      const price1 = await productService.calculatePackPrice(
        packId,
        mockUserId
      );
      const price2 = await productService.calculatePackPrice(
        packId,
        mockUserId
      );
      const price3 = await productService.calculatePackPrice(
        packId,
        mockUserId
      );

      // Assert
      expect(price1).toBe(price2);
      expect(price2).toBe(price3);

      // Verificar que se usó cache (menos llamadas de las esperadas)
      expect(calculateSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe("Casos edge y recuperación de errores", () => {
    test("Debe manejar productos eliminados durante el proceso de compra", async () => {
      // Arrange
      const productId = "deleted_product";

      // Primero el producto existe
      jest
        .spyOn(productService, "getProduct")
        .mockResolvedValueOnce({
          id: productId,
          name: "Producto Temporal",
          price: { coins: 100 },
        })
        // Luego es eliminado
        .mockResolvedValue(null);

      // Act
      const addResult = await cartService.addItem(productId, 1);
      expect(addResult).toBe(true);

      // Producto es eliminado antes del pago
      const paymentResult = await paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(false);
      expect(paymentResult.error).toContain("no encontrado");
    });

    test("Debe recuperarse de fallos de red durante sincronización", async () => {
      // Arrange
      const productId = "network_test_product";
      const mockProduct = {
        id: productId,
        price: { coins: 100 },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Mock Firestore que falla inicialmente
      let networkAttempts = 0;
      mockFirestore.set.mockImplementation(async () => {
        networkAttempts++;
        if (networkAttempts < 3) {
          throw new Error("Network timeout");
        }
        return Promise.resolve();
      });

      // Act
      const paymentResult = await paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(true);
      expect(networkAttempts).toBe(3); // Se reintentó hasta funcionar
    });

    test("Debe manejar datos corruptos en localStorage", async () => {
      // Arrange
      // Simular datos corruptos en localStorage
      const corruptedData =
        '{"items": [{"productId": "invalid", "quantity": "not_a_number"}]}';
      localStorage.setItem("quiz_cristiano_cart", corruptedData);

      // Act
      const loadResult = await cartService.loadFromStorage();

      // Assert
      expect(loadResult).toBe(false);
      expect(cartService.getState().items).toHaveLength(0);

      // Verificar que se limpió el localStorage corrupto
      expect(localStorage.getItem("quiz_cristiano_cart")).toBeNull();
    });
  });

  describe("Integración completa E2E", () => {
    test("Flujo completo: navegación → selección → carrito → pago → confirmación", async () => {
      // Arrange - Configurar productos de diferentes categorías
      const products = {
        avatar_premium: {
          id: "avatar_premium",
          name: "Avatar Premium",
          category: "avatares",
          price: { coins: 200 },
        },
        powerup_combo: {
          id: "powerup_combo",
          name: "Combo Power-ups",
          category: "powerups",
          price: { coins: 150 },
        },
        pack_starter: {
          id: "pack_starter",
          name: "Pack Iniciador",
          type: "pack",
          items: ["avatar_premium", "powerup_combo"],
          price: { coins: 280 },
          discountPercentage: 20,
        },
      };

      jest
        .spyOn(productService, "getProduct")
        .mockImplementation(async (id) => products[id]);

      jest
        .spyOn(productService, "loadProductsByCategory")
        .mockImplementation(async (category) => {
          return Object.values(products).filter((p) => p.category === category);
        });

      jest
        .spyOn(productService, "getAllPacks")
        .mockResolvedValue([products.pack_starter]);

      // Act - Simular flujo completo del usuario

      // 1. Usuario navega a categoría avatares
      const avatarProducts = await productService.loadProductsByCategory(
        "avatares"
      );
      expect(avatarProducts).toHaveLength(1);

      // 2. Usuario agrega avatar al carrito
      await cartService.addItem("avatar_premium", 1);

      // 3. Usuario navega a power-ups y agrega uno
      await cartService.addItem("powerup_combo", 1);

      // 4. Sistema sugiere pack más económico
      const suggestions = await cartService.suggestPacks();
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].pack.id).toBe("pack_starter");

      // 5. Usuario acepta sugerencia y cambia al pack
      cartService.clearCart();
      await cartService.addItem("pack_starter", 1);

      // 6. Usuario procede al pago
      const cartSummary = await cartService.getCartSummary();
      expect(cartSummary.canProceedToPurchase).toBe(true);
      expect(cartSummary.totals.coins).toBe(224); // 280 - 20% = 224

      // 7. Procesar pago
      const paymentResult = await paymentService.processPayment(
        "pack_starter",
        "coins",
        mockUserId
      );

      // Assert - Verificar resultado final
      expect(paymentResult.success).toBe(true);
      expect(paymentResult.transactionId).toBeDefined();

      // Verificar que se procesaron ambos items del pack
      const userData = await userStoreDataManager.getUserData();
      expect(userData.addProduct).toHaveBeenCalledTimes(2);
      expect(userData.addProduct).toHaveBeenCalledWith(
        "avatar_premium",
        expect.any(Object)
      );
      expect(userData.addProduct).toHaveBeenCalledWith(
        "powerup_combo",
        expect.any(Object)
      );

      // Verificar transacción registrada
      const history = await paymentService.getTransactionHistory(mockUserId);
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe("completed");
      expect(history[0].productId).toBe("pack_starter");
    });

    test("Flujo de recuperación: fallo de pago → reintento → éxito", async () => {
      // Arrange
      const productId = "recovery_test_product";
      const mockProduct = {
        id: productId,
        name: "Producto Recuperación",
        price: { coins: 100 },
      };

      jest.spyOn(productService, "getProduct").mockResolvedValue(mockProduct);

      // Mock que falla una vez y luego funciona
      let paymentAttempts = 0;
      jest
        .spyOn(paymentService, "processCoinsPayment")
        .mockImplementation(async () => {
          paymentAttempts++;
          if (paymentAttempts === 1) {
            const error = new Error("Temporary payment failure");
            error.retryable = true;
            throw error;
          }
          return { success: true, method: "coins" };
        });

      // Act
      await cartService.addItem(productId, 1);

      const paymentResult = await paymentService.processPayment(
        productId,
        "coins",
        mockUserId
      );

      // Assert
      expect(paymentResult.success).toBe(true);
      expect(paymentResult.attempt).toBe(2);
      expect(paymentAttempts).toBe(2);

      // Verificar que la transacción final fue exitosa
      const history = await paymentService.getTransactionHistory(mockUserId);
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe("completed");
    });
  });
});

// Utilidades de testing
class TestUtils {
  static createMockProduct(overrides = {}) {
    return {
      id: "test_product_" + Math.random().toString(36).substr(2, 9),
      name: "Producto de Prueba",
      category: "avatares",
      type: "individual",
      price: { coins: 100, usd: 2, ars: 200 },
      availability: { isActive: true },
      ...overrides,
    };
  }

  static createMockPack(items = [], overrides = {}) {
    return {
      id: "test_pack_" + Math.random().toString(36).substr(2, 9),
      name: "Pack de Prueba",
      type: "pack",
      items: items.length > 0 ? items : ["item_1", "item_2"],
      price: { coins: 200, usd: 4, ars: 400 },
      discountPercentage: 25,
      dynamicPricing: true,
      ...overrides,
    };
  }

  static createMockUser(overrides = {}) {
    return {
      id: "test_user_" + Math.random().toString(36).substr(2, 9),
      coins: 1000,
      ownedProducts: [],
      statistics: {
        totalSpent: 0,
        purchaseCount: 0,
        lastPurchase: null,
      },
      ...overrides,
    };
  }

  static async waitFor(condition, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error("Timeout waiting for condition");
  }

  static mockFirestore() {
    return {
      collection: jest.fn().mockReturnThis(),
      doc: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => TestUtils.createMockUser(),
      }),
      set: jest.fn().mockResolvedValue(),
      update: jest.fn().mockResolvedValue(),
      add: jest.fn().mockResolvedValue({ id: "mock_doc_id" }),
    };
  }
}

// Exportar utilidades para otros tests
if (typeof module !== "undefined" && module.exports) {
  module.exports = { TestUtils };
}
