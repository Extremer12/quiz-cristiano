/**
 * Unit Tests for TransactionManager
 * Quiz Cristiano - Tests para el gestor de transacciones
 */

// Importar la clase real
const TransactionManager = require('../../js/modules/payments/transaction-manager.js');

// Mock de Firebase
const mockFirestore = {
  collection: jest.fn(),
  runTransaction: jest.fn(),
};

const mockDoc = {
  set: jest.fn(),
  update: jest.fn(),
  get: jest.fn(),
};

const mockCollection = {
  doc: jest.fn(() => mockDoc),
  where: jest.fn(() => mockCollection),
  orderBy: jest.fn(() => mockCollection),
  limit: jest.fn(() => mockCollection),
  get: jest.fn(),
};

// Mock Firebase globalmente
global.firebase = {
  firestore: () => mockFirestore
};

// Configurar mocks de Firebase
mockFirestore.collection.mockReturnValue(mockCollection);
mockDoc.set.mockResolvedValue();
mockDoc.update.mockResolvedValue();
mockDoc.get.mockResolvedValue({ exists: true, data: () => ({}) });
mockCollection.get.mockResolvedValue({ docs: [] });

// Usar la clase real importada

describe("TransactionManager", () => {
  let transactionManager;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock returns
    mockFirestore.collection.mockReturnValue(mockCollection);
    mockDoc.set.mockResolvedValue();
    mockDoc.update.mockResolvedValue();
    mockDoc.get.mockResolvedValue({
      data: () => ({ coins: 100 }),
    });
    mockFirestore.runTransaction.mockImplementation(async (callback) => {
      const mockTransaction = {
        get: jest.fn().mockResolvedValue({
          data: () => ({ coins: 100 }),
        }),
        update: jest.fn(),
        set: jest.fn(),
      };
      return await callback(mockTransaction);
    });
    mockCollection.get.mockResolvedValue({
      docs: [
        {
          id: "txn_123",
          data: () => ({
            userId: "user_123",
            productId: "coins_100",
            amount: 100,
            status: "completed",
          }),
        },
      ],
    });

    transactionManager = new TransactionManager();
  });

  describe("createTransaction", () => {
    test("should create transaction with required fields", async () => {
      const transactionData = {
        userId: "user_123",
        productId: "coins_100",
        price: 0.99,
        currency: "USD",
      };

      const result = await transactionManager.createTransaction(
        transactionData
      );

      expect(result.id).toMatch(/^txn_\d+_[a-z0-9]+$/);
      expect(result.userId).toBe("user_123");
      expect(result.productId).toBe("coins_100");
      expect(result.price).toBe(0.99);
      expect(result.currency).toBe("USD");
      expect(result.status).toBe("pending");
      expect(result.productType).toBe("coins");
      expect(result.amount).toBe(0);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.deviceType).toBeDefined();

      expect(mockFirestore.collection).toHaveBeenCalledWith("transactions");
      expect(mockDoc.set).toHaveBeenCalledWith(result);
    });

    test("should create transaction with custom product type and amount", async () => {
      const transactionData = {
        userId: "user_123",
        productId: "premium_monthly",
        productType: "subscription",
        amount: 1,
        price: 4.99,
        currency: "USD",
      };

      const result = await transactionManager.createTransaction(
        transactionData
      );

      expect(result.productType).toBe("subscription");
      expect(result.amount).toBe(1);
    });

    test("should handle database errors", async () => {
      mockDoc.set.mockRejectedValue(new Error("Database connection failed"));

      const transactionData = {
        userId: "user_123",
        productId: "coins_100",
        price: 0.99,
        currency: "USD",
      };

      await expect(
        transactionManager.createTransaction(transactionData)
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("updateTransactionStatus", () => {
    test("should update transaction status successfully", async () => {
      const paypalData = {
        paymentId: "paypal_123",
        orderId: "order_456",
      };

      const result = await transactionManager.updateTransactionStatus(
        "txn_123",
        "completed",
        paypalData
      );

      expect(result.status).toBe("completed");
      expect(result.paypalData).toEqual(paypalData);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.completedAt).toBeInstanceOf(Date);

      expect(mockFirestore.collection).toHaveBeenCalledWith("transactions");
      expect(mockDoc.update).toHaveBeenCalledWith(result);
    });

    test("should update status without completion date for non-completed status", async () => {
      const result = await transactionManager.updateTransactionStatus(
        "txn_123",
        "failed"
      );

      expect(result.status).toBe("failed");
      expect(result.completedAt).toBeUndefined();
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    test("should handle update errors", async () => {
      mockDoc.update.mockRejectedValue(new Error("Update failed"));

      await expect(
        transactionManager.updateTransactionStatus("txn_123", "completed")
      ).rejects.toThrow("Update failed");
    });
  });

  describe("creditUserAccount", () => {
    test("should credit user account successfully", async () => {
      const result = await transactionManager.creditUserAccount(
        "user_123",
        100,
        "txn_123"
      );

      expect(result.success).toBe(true);
      expect(result.userId).toBe("user_123");
      expect(result.amount).toBe(100);

      expect(mockFirestore.runTransaction).toHaveBeenCalled();
    });

    test("should handle transaction errors", async () => {
      mockFirestore.runTransaction.mockRejectedValue(
        new Error("Transaction failed")
      );

      await expect(
        transactionManager.creditUserAccount("user_123", 100, "txn_123")
      ).rejects.toThrow("Transaction failed");
    });

    test("should handle user document not found", async () => {
      mockFirestore.runTransaction.mockImplementation(async (callback) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            data: () => null, // User not found
          }),
          update: jest.fn(),
          set: jest.fn(),
        };
        return await callback(mockTransaction);
      });

      // Should still work with 0 initial coins
      const result = await transactionManager.creditUserAccount(
        "user_123",
        100,
        "txn_123"
      );

      expect(result.success).toBe(true);
    });
  });

  describe("getTransactionHistory", () => {
    test("should get transaction history successfully", async () => {
      const result = await transactionManager.getTransactionHistory("user_123");

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("txn_123");
      expect(result[0].userId).toBe("user_123");

      expect(mockFirestore.collection).toHaveBeenCalledWith("transactions");
      expect(mockCollection.where).toHaveBeenCalledWith(
        "userId",
        "==",
        "user_123"
      );
      expect(mockCollection.orderBy).toHaveBeenCalledWith("createdAt", "desc");
      expect(mockCollection.limit).toHaveBeenCalledWith(50);
    });

    test("should handle empty transaction history", async () => {
      mockCollection.get.mockResolvedValue({ docs: [] });

      const result = await transactionManager.getTransactionHistory("user_123");

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    test("should handle query errors", async () => {
      mockCollection.get.mockRejectedValue(new Error("Query failed"));

      await expect(
        transactionManager.getTransactionHistory("user_123")
      ).rejects.toThrow("Query failed");
    });
  });

  describe("generateTransactionId", () => {
    test("should generate unique transaction IDs", () => {
      const id1 = transactionManager.generateTransactionId();
      const id2 = transactionManager.generateTransactionId();

      expect(id1).toMatch(/^txn_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^txn_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    test("should generate IDs with correct format", () => {
      const id = transactionManager.generateTransactionId();
      const parts = id.split("_");

      expect(parts[0]).toBe("txn");
      expect(parts[1]).toMatch(/^\d+$/); // Timestamp
      expect(parts[2]).toMatch(/^[a-z0-9]+$/); // Random string
    });
  });

  describe("getDeviceType", () => {
    test("should detect desktop by default", () => {
      const deviceType = transactionManager.getDeviceType();
      expect(["desktop", "server"]).toContain(deviceType);
    });

    test("should detect mobile devices", () => {
      // Mock navigator.userAgent
      const originalNavigator = global.navigator;
      global.navigator = {
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      };

      // Create new instance after mocking navigator
      const testManager = new TransactionManager();
      const deviceType = testManager.getDeviceType();
      expect(deviceType).toBe("mobile");

      // Restore original navigator
      global.navigator = originalNavigator;
    });

    test("should detect tablet devices", () => {
      const originalNavigator = global.navigator;
      global.navigator = {
        userAgent: "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)",
      };

      // Create new instance after mocking navigator
      const testManager = new TransactionManager();
      const deviceType = testManager.getDeviceType();
      expect(deviceType).toBe("tablet");

      global.navigator = originalNavigator;
    });
  });

  describe("integration scenarios", () => {
    test("should handle complete transaction lifecycle", async () => {
      // Create transaction
      const transactionData = {
        userId: "user_123",
        productId: "coins_100",
        price: 0.99,
        currency: "USD",
      };

      const transaction = await transactionManager.createTransaction(
        transactionData
      );
      expect(transaction.status).toBe("pending");

      // Update to completed
      await transactionManager.updateTransactionStatus(
        transaction.id,
        "completed",
        { paymentId: "paypal_123" }
      );

      // Credit user account
      const creditResult = await transactionManager.creditUserAccount(
        "user_123",
        100,
        transaction.id
      );
      expect(creditResult.success).toBe(true);

      // Get transaction history
      const history = await transactionManager.getTransactionHistory(
        "user_123"
      );
      expect(history.length).toBeGreaterThan(0);
    });

    test("should handle failed transaction scenario", async () => {
      const transactionData = {
        userId: "user_123",
        productId: "coins_100",
        price: 0.99,
        currency: "USD",
      };

      const transaction = await transactionManager.createTransaction(
        transactionData
      );

      // Update to failed
      await transactionManager.updateTransactionStatus(
        transaction.id,
        "failed",
        { error: "Payment declined" }
      );

      // Should not credit user account for failed transactions
      // This would be handled by the calling code
    });
  });

  describe("error handling", () => {
    test("should handle missing required fields", async () => {
      const incompleteData = {
        userId: "user_123",
        // Missing productId, price, currency
      };

      const result = await transactionManager.createTransaction(incompleteData);

      // Should still create transaction with defaults
      expect(result.productId).toBeUndefined();
      expect(result.price).toBeUndefined();
      expect(result.currency).toBeUndefined();
      expect(result.status).toBe("pending");
    });

    test("should handle null/undefined values gracefully", async () => {
      const result = await transactionManager.updateTransactionStatus(
        "txn_123",
        "completed",
        null
      );

      expect(result.paypalData).toBeNull();
      expect(result.status).toBe("completed");
    });
  });
});

module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};
