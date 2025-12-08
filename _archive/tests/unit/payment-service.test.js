/**
 * Unit Tests for PaymentService
 * Quiz Cristiano - Tests para el servicio principal de pagos
 */

// Mock de dependencias
const mockPayPalProvider = {
  initializePayment: jest.fn(),
  capturePayment: jest.fn(),
  createSubscription: jest.fn(),
  cancelSubscription: jest.fn(),
};

const mockConfigurationManager = {
  getProviderConfig: jest.fn(),
  getProduct: jest.fn(),
  getSubscriptionPlan: jest.fn(),
};

const mockCurrencyService = {
  getProductPrice: jest.fn(),
  detectUserCurrency: jest.fn(),
  formatPrice: jest.fn(),
};

const mockTransactionManager = {
  createTransaction: jest.fn(),
  updateTransactionStatus: jest.fn(),
  creditUserAccount: jest.fn(),
  getTransactionHistory: jest.fn(),
};

// Mock del PaymentService
class PaymentService {
  constructor(provider = "paypal") {
    this.provider = mockPayPalProvider;
    this.config = mockConfigurationManager;
    this.currency = mockCurrencyService;
    this.transactionManager = mockTransactionManager;
  }

  async createPayment(productId, userId, currency) {
    const product = this.config.getProduct(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const price = this.currency.getProductPrice(product, currency);

    const transaction = await this.transactionManager.createTransaction({
      userId,
      productId,
      price,
      currency,
      status: "pending",
    });

    return await this.provider.initializePayment({
      transactionId: transaction.id,
      amount: price,
      currency,
      productName: product.name,
      returnUrl: `${window.location.origin}/payment/success`,
      cancelUrl: `${window.location.origin}/payment/cancel`,
    });
  }

  async verifyPayment(paymentId) {
    return await this.provider.capturePayment(paymentId);
  }

  async createSubscription(planId, userId, currency) {
    const plan = this.config.getSubscriptionPlan(planId);
    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    return await this.provider.createSubscription({
      planId,
      userId,
      currency,
      amount: this.currency.getProductPrice(plan, currency),
    });
  }
}

describe("PaymentService", () => {
  let paymentService;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock returns
    mockConfigurationManager.getProduct.mockReturnValue({
      id: "coins_100",
      name: "100 Monedas",
      amount: 100,
      priceUSD: 0.99,
      priceARS: 150,
    });

    mockConfigurationManager.getSubscriptionPlan.mockReturnValue({
      id: "premium_monthly",
      name: "Premium Mensual",
      priceUSD: 4.99,
      priceARS: 750,
    });

    mockCurrencyService.getProductPrice.mockReturnValue(0.99);

    mockTransactionManager.createTransaction.mockResolvedValue({
      id: "txn_123456789",
      userId: "user_123",
      productId: "coins_100",
      status: "pending",
    });

    mockPayPalProvider.initializePayment.mockResolvedValue({
      success: true,
      orderId: "paypal_order_123",
      paymentUrl: "https://paypal.com/checkout/123",
    });

    paymentService = new PaymentService();
  });

  describe("createPayment", () => {
    test("should create payment successfully with valid data", async () => {
      const result = await paymentService.createPayment(
        "coins_100",
        "user_123",
        "USD"
      );

      expect(mockConfigurationManager.getProduct).toHaveBeenCalledWith(
        "coins_100"
      );
      expect(mockCurrencyService.getProductPrice).toHaveBeenCalled();
      expect(mockTransactionManager.createTransaction).toHaveBeenCalledWith({
        userId: "user_123",
        productId: "coins_100",
        price: 0.99,
        currency: "USD",
        status: "pending",
      });
      expect(mockPayPalProvider.initializePayment).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.orderId).toBe("paypal_order_123");
    });

    test("should throw error when product not found", async () => {
      mockConfigurationManager.getProduct.mockReturnValue(null);

      await expect(
        paymentService.createPayment("invalid_product", "user_123", "USD")
      ).rejects.toThrow("Product not found");
    });

    test("should handle PayPal provider errors", async () => {
      mockPayPalProvider.initializePayment.mockRejectedValue(
        new Error("PayPal API Error")
      );

      await expect(
        paymentService.createPayment("coins_100", "user_123", "USD")
      ).rejects.toThrow("PayPal API Error");
    });

    test("should create payment with ARS currency", async () => {
      mockCurrencyService.getProductPrice.mockReturnValue(150);

      const result = await paymentService.createPayment(
        "coins_100",
        "user_123",
        "ARS"
      );

      expect(mockTransactionManager.createTransaction).toHaveBeenCalledWith({
        userId: "user_123",
        productId: "coins_100",
        price: 150,
        currency: "ARS",
        status: "pending",
      });
    });
  });

  describe("verifyPayment", () => {
    test("should verify payment successfully", async () => {
      mockPayPalProvider.capturePayment.mockResolvedValue({
        success: true,
        paymentId: "payment_123",
        status: "completed",
      });

      const result = await paymentService.verifyPayment("payment_123");

      expect(mockPayPalProvider.capturePayment).toHaveBeenCalledWith(
        "payment_123"
      );
      expect(result.success).toBe(true);
      expect(result.status).toBe("completed");
    });

    test("should handle payment verification failure", async () => {
      mockPayPalProvider.capturePayment.mockRejectedValue(
        new Error("Payment verification failed")
      );

      await expect(
        paymentService.verifyPayment("invalid_payment")
      ).rejects.toThrow("Payment verification failed");
    });
  });

  describe("createSubscription", () => {
    test("should create subscription successfully", async () => {
      mockPayPalProvider.createSubscription.mockResolvedValue({
        success: true,
        subscriptionId: "sub_123",
        status: "active",
      });

      const result = await paymentService.createSubscription(
        "premium_monthly",
        "user_123",
        "USD"
      );

      expect(mockConfigurationManager.getSubscriptionPlan).toHaveBeenCalledWith(
        "premium_monthly"
      );
      expect(mockPayPalProvider.createSubscription).toHaveBeenCalledWith({
        planId: "premium_monthly",
        userId: "user_123",
        currency: "USD",
        amount: 0.99,
      });
      expect(result.success).toBe(true);
      expect(result.subscriptionId).toBe("sub_123");
    });

    test("should throw error when subscription plan not found", async () => {
      mockConfigurationManager.getSubscriptionPlan.mockReturnValue(null);

      await expect(
        paymentService.createSubscription("invalid_plan", "user_123", "USD")
      ).rejects.toThrow("Subscription plan not found");
    });

    test("should handle subscription creation errors", async () => {
      mockPayPalProvider.createSubscription.mockRejectedValue(
        new Error("Subscription creation failed")
      );

      await expect(
        paymentService.createSubscription("premium_monthly", "user_123", "USD")
      ).rejects.toThrow("Subscription creation failed");
    });
  });

  describe("error handling", () => {
    test("should handle transaction creation failure", async () => {
      mockTransactionManager.createTransaction.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        paymentService.createPayment("coins_100", "user_123", "USD")
      ).rejects.toThrow("Database connection failed");
    });

    test("should handle currency service errors", async () => {
      mockCurrencyService.getProductPrice.mockImplementation(() => {
        throw new Error("Currency conversion failed");
      });

      await expect(
        paymentService.createPayment("coins_100", "user_123", "USD")
      ).rejects.toThrow("Currency conversion failed");
    });
  });

  describe("integration scenarios", () => {
    test("should handle complete payment flow", async () => {
      // Create payment
      const paymentResult = await paymentService.createPayment(
        "coins_100",
        "user_123",
        "USD"
      );
      expect(paymentResult.success).toBe(true);

      // Verify payment
      mockPayPalProvider.capturePayment.mockResolvedValue({
        success: true,
        paymentId: "payment_123",
        status: "completed",
      });

      const verificationResult = await paymentService.verifyPayment(
        "payment_123"
      );
      expect(verificationResult.success).toBe(true);
    });

    test("should handle subscription lifecycle", async () => {
      // Create subscription
      mockPayPalProvider.createSubscription.mockResolvedValue({
        success: true,
        subscriptionId: "sub_123",
        status: "active",
      });

      const subscriptionResult = await paymentService.createSubscription(
        "premium_monthly",
        "user_123",
        "USD"
      );
      expect(subscriptionResult.success).toBe(true);
      expect(subscriptionResult.subscriptionId).toBe("sub_123");
    });
  });
});

// Test configuration
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: [
    "js/modules/payments/**/*.js",
    "!js/modules/payments/**/*.test.js",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
