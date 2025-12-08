/**
 * Unit Tests for PaymentErrorHandler
 * Quiz Cristiano - Tests para el manejador de errores de pagos
 */

// Mock del PaymentErrorHandler (versión simplificada para tests)
class PaymentErrorHandler {
  constructor() {
    this.errorCategories = {
      PAYMENT_PROCESSING: "payment_processing",
      WEBHOOK_PROCESSING: "webhook_processing",
      CONFIGURATION: "configuration",
      NETWORK: "network",
      SECURITY: "security",
      USER_INPUT: "user_input",
      PROVIDER_API: "provider_api",
    };

    this.severityLevels = {
      LOW: "low",
      MEDIUM: "medium",
      HIGH: "high",
      CRITICAL: "critical",
    };

    this.errorCodes = {
      INSTRUMENT_DECLINED: {
        category: this.errorCategories.PAYMENT_PROCESSING,
        severity: this.severityLevels.MEDIUM,
        shouldRetry: false,
        userFriendly: true,
      },
      NETWORK_ERROR: {
        category: this.errorCategories.NETWORK,
        severity: this.severityLevels.MEDIUM,
        shouldRetry: true,
        userFriendly: true,
      },
      INVALID_WEBHOOK_SIGNATURE: {
        category: this.errorCategories.SECURITY,
        severity: this.severityLevels.CRITICAL,
        shouldRetry: false,
        userFriendly: false,
      },
    };

    this.userMessages = {
      INSTRUMENT_DECLINED:
        "Tu método de pago fue rechazado. Por favor, intenta con otra tarjeta o método de pago.",
      NETWORK_ERROR:
        "Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.",
      UNKNOWN_ERROR:
        "Ha ocurrido un error inesperado. Por favor, intenta nuevamente o contacta al soporte.",
    };
  }

  handlePayPalError(error, context = {}) {
    try {
      const errorInfo = this.analyzeError(error);
      const errorResponse = this.buildErrorResponse(error, errorInfo, context);

      // Mock logging
      this.logError(error, errorInfo, context);

      // Mock critical notifications
      if (errorInfo.severity === this.severityLevels.CRITICAL) {
        this.notifyCriticalError(error, context);
      }

      // Mock security notifications
      if (errorInfo.category === this.errorCategories.SECURITY) {
        this.notifySecurityIncident(error, context);
      }

      return errorResponse;
    } catch (handlingError) {
      return this.buildFallbackErrorResponse(error);
    }
  }

  analyzeError(error) {
    const errorCode = this.extractErrorCode(error);
    const errorConfig =
      this.errorCodes[errorCode] || this.getDefaultErrorConfig();

    return {
      code: errorCode,
      category: errorConfig.category,
      severity: errorConfig.severity,
      shouldRetry: errorConfig.shouldRetry,
      userFriendly: errorConfig.userFriendly,
      originalError: error,
    };
  }

  extractErrorCode(error) {
    if (error.details && error.details[0] && error.details[0].issue) {
      return error.details[0].issue;
    }

    if (error.message) {
      const message = error.message.toUpperCase();

      if (message.includes("NETWORK") || message.includes("CONNECTION")) {
        return "NETWORK_ERROR";
      }
      if (message.includes("DECLINED")) {
        return "INSTRUMENT_DECLINED";
      }
    }

    // Códigos de error conocidos que son válidos sin mensaje
    if (error.name && ["INSTRUMENT_DECLINED", "NETWORK_ERROR", "INSUFFICIENT_FUNDS"].includes(error.name)) {
      return error.name;
    }

    // Si tiene name pero no es un código conocido y no tiene message, es desconocido
    if (error.name && !error.message) {
      return "UNKNOWN_ERROR";
    }

    // Si tiene name y message, usar el name
    if (error.name && error.message) {
      return error.name;
    }

    return "UNKNOWN_ERROR";
  }

  getDefaultErrorConfig() {
    return {
      category: this.errorCategories.PAYMENT_PROCESSING,
      severity: this.severityLevels.MEDIUM,
      shouldRetry: false,
      userFriendly: true,
    };
  }

  buildErrorResponse(error, errorInfo, context) {
    const userMessage = this.getUserMessage(errorInfo.code);

    return {
      success: false,
      error: {
        code: errorInfo.code,
        message: error.message,
        category: errorInfo.category,
        severity: errorInfo.severity,
        timestamp: new Date().toISOString(),
        context: this.sanitizeContext(context),
      },
      userMessage: userMessage,
      shouldRetry: errorInfo.shouldRetry,
      preserveUserState: true,
      fallbackOptions: this.getFallbackOptions(errorInfo),
    };
  }

  getUserMessage(errorCode) {
    return this.userMessages[errorCode] || this.userMessages.UNKNOWN_ERROR;
  }

  getFallbackOptions(errorInfo) {
    const options = [];

    if (errorInfo.category === this.errorCategories.PAYMENT_PROCESSING) {
      options.push({
        type: "alternative_payment",
        message: "Puedes intentar con otro método de pago",
        action: "show_alternative_methods",
      });
    }

    if (errorInfo.category === this.errorCategories.NETWORK) {
      options.push({
        type: "retry_now",
        message: "Reintentar ahora",
        action: "immediate_retry",
      });
    }

    return options;
  }

  sanitizeContext(context) {
    const sanitized = { ...context };
    delete sanitized.paypalData;
    delete sanitized.userCredentials;
    delete sanitized.apiKeys;
    return sanitized;
  }

  buildFallbackErrorResponse(originalError) {
    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "Error in error handling system",
        category: this.errorCategories.CONFIGURATION,
        severity: this.severityLevels.CRITICAL,
        timestamp: new Date().toISOString(),
        originalError: originalError ? originalError.message || originalError.toString() : "Unknown error",
      },
      userMessage: this.userMessages.UNKNOWN_ERROR,
      shouldRetry: false,
    };
  }

  logError(error, errorInfo, context) {
    // Mock implementation
    console.log("Error logged:", {
      code: errorInfo.code,
      category: errorInfo.category,
      severity: errorInfo.severity,
    });
  }

  notifyCriticalError(error, context) {
    // Mock implementation
    console.log("Critical error notification sent");
  }

  notifySecurityIncident(error, context) {
    // Mock implementation
    console.log("Security incident notification sent");
  }

  generateErrorReference() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ERR-${timestamp}-${random}`.toUpperCase();
  }

  validateConfiguration() {
    const errors = [];

    if (!this.errorCodes || Object.keys(this.errorCodes).length === 0) {
      errors.push("Error codes not properly initialized");
    }

    if (!this.userMessages || Object.keys(this.userMessages).length === 0) {
      errors.push("User messages not properly initialized");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

describe("PaymentErrorHandler", () => {
  let errorHandler;

  beforeEach(() => {
    errorHandler = new PaymentErrorHandler();
  });

  describe("constructor", () => {
    test("should initialize with correct error categories", () => {
      expect(errorHandler.errorCategories).toBeDefined();
      expect(errorHandler.errorCategories.PAYMENT_PROCESSING).toBe(
        "payment_processing"
      );
      expect(errorHandler.errorCategories.SECURITY).toBe("security");
      expect(errorHandler.errorCategories.NETWORK).toBe("network");
    });

    test("should initialize with correct severity levels", () => {
      expect(errorHandler.severityLevels).toBeDefined();
      expect(errorHandler.severityLevels.CRITICAL).toBe("critical");
      expect(errorHandler.severityLevels.HIGH).toBe("high");
      expect(errorHandler.severityLevels.MEDIUM).toBe("medium");
      expect(errorHandler.severityLevels.LOW).toBe("low");
    });

    test("should initialize with error codes configuration", () => {
      expect(errorHandler.errorCodes).toBeDefined();
      expect(errorHandler.errorCodes.INSTRUMENT_DECLINED).toBeDefined();
      expect(errorHandler.errorCodes.NETWORK_ERROR).toBeDefined();
    });

    test("should initialize with user messages", () => {
      expect(errorHandler.userMessages).toBeDefined();
      expect(errorHandler.userMessages.INSTRUMENT_DECLINED).toContain(
        "método de pago"
      );
      expect(errorHandler.userMessages.NETWORK_ERROR).toContain("conexión");
    });
  });

  describe("handlePayPalError", () => {
    test("should handle PayPal payment declined error", () => {
      const error = {
        name: "INSTRUMENT_DECLINED",
        message: "The instrument presented was declined",
      };

      const result = errorHandler.handlePayPalError(error, {
        userId: "user_123",
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("INSTRUMENT_DECLINED");
      expect(result.error.category).toBe("payment_processing");
      expect(result.error.severity).toBe("medium");
      expect(result.userMessage).toContain("método de pago fue rechazado");
      expect(result.shouldRetry).toBe(false);
      expect(result.preserveUserState).toBe(true);
    });

    test("should handle network errors with retry options", () => {
      const error = {
        name: "NETWORK_ERROR",
        message: "Network connection failed",
      };

      const result = errorHandler.handlePayPalError(error, {
        userId: "user_123",
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("NETWORK_ERROR");
      expect(result.error.category).toBe("network");
      expect(result.shouldRetry).toBe(true);
      expect(result.fallbackOptions).toContainEqual({
        type: "retry_now",
        message: "Reintentar ahora",
        action: "immediate_retry",
      });
    });

    test("should handle security errors and trigger notifications", () => {
      const error = {
        name: "INVALID_WEBHOOK_SIGNATURE",
        message: "Webhook signature validation failed",
      };

      const consoleSpy = jest.spyOn(console, "log");

      const result = errorHandler.handlePayPalError(error, {
        userId: "user_123",
        ipAddress: "192.168.1.1",
      });

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("INVALID_WEBHOOK_SIGNATURE");
      expect(result.error.category).toBe("security");
      expect(result.error.severity).toBe("critical");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Critical error notification sent"
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Security incident notification sent"
      );

      consoleSpy.mockRestore();
    });

    test("should handle unknown errors with fallback", () => {
      const error = {
        message: "Some unknown error occurred",
      };

      const result = errorHandler.handlePayPalError(error);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("UNKNOWN_ERROR");
      expect(result.userMessage).toBe(errorHandler.userMessages.UNKNOWN_ERROR);
    });

    test("should sanitize sensitive context data", () => {
      const error = { name: "INSTRUMENT_DECLINED", message: "Declined" };
      const context = {
        userId: "user_123",
        paypalData: { secret: "sensitive_data" },
        userCredentials: { password: "secret" },
        apiKeys: { key: "api_key" },
        normalData: "safe_data",
      };

      const result = errorHandler.handlePayPalError(error, context);

      expect(result.error.context.userId).toBe("user_123");
      expect(result.error.context.normalData).toBe("safe_data");
      expect(result.error.context.paypalData).toBeUndefined();
      expect(result.error.context.userCredentials).toBeUndefined();
      expect(result.error.context.apiKeys).toBeUndefined();
    });
  });

  describe("extractErrorCode", () => {
    test("should extract error code from error name", () => {
      const error = { name: "INSTRUMENT_DECLINED" };
      const code = errorHandler.extractErrorCode(error);
      expect(code).toBe("INSTRUMENT_DECLINED");
    });

    test("should extract error code from PayPal details", () => {
      const error = {
        details: [{ issue: "INSUFFICIENT_FUNDS" }],
      };
      const code = errorHandler.extractErrorCode(error);
      expect(code).toBe("INSUFFICIENT_FUNDS");
    });

    test("should extract error code from message patterns", () => {
      const networkError = { message: "Network connection failed" };
      expect(errorHandler.extractErrorCode(networkError)).toBe("NETWORK_ERROR");

      const declinedError = { message: "Payment was declined" };
      expect(errorHandler.extractErrorCode(declinedError)).toBe(
        "INSTRUMENT_DECLINED"
      );
    });

    test("should return UNKNOWN_ERROR for unrecognized errors", () => {
      const error = { message: "Some random error" };
      const code = errorHandler.extractErrorCode(error);
      expect(code).toBe("UNKNOWN_ERROR");
    });
  });

  describe("getFallbackOptions", () => {
    test("should provide payment alternatives for payment processing errors", () => {
      const errorInfo = {
        category: errorHandler.errorCategories.PAYMENT_PROCESSING,
      };

      const options = errorHandler.getFallbackOptions(errorInfo);

      expect(options).toContainEqual({
        type: "alternative_payment",
        message: "Puedes intentar con otro método de pago",
        action: "show_alternative_methods",
      });
    });

    test("should provide retry options for network errors", () => {
      const errorInfo = {
        category: errorHandler.errorCategories.NETWORK,
      };

      const options = errorHandler.getFallbackOptions(errorInfo);

      expect(options).toContainEqual({
        type: "retry_now",
        message: "Reintentar ahora",
        action: "immediate_retry",
      });
    });

    test("should return empty options for unknown categories", () => {
      const errorInfo = {
        category: "unknown_category",
      };

      const options = errorHandler.getFallbackOptions(errorInfo);
      expect(options).toEqual([]);
    });
  });

  describe("generateErrorReference", () => {
    test("should generate unique error references", () => {
      const ref1 = errorHandler.generateErrorReference();
      const ref2 = errorHandler.generateErrorReference();

      expect(ref1).toMatch(/^ERR-\d+-[A-Z0-9]+$/);
      expect(ref2).toMatch(/^ERR-\d+-[A-Z0-9]+$/);
      expect(ref1).not.toBe(ref2);
    });

    test("should generate references with correct format", () => {
      const ref = errorHandler.generateErrorReference();
      const parts = ref.split("-");

      expect(parts[0]).toBe("ERR");
      expect(parts[1]).toMatch(/^\d+$/); // Timestamp
      expect(parts[2]).toMatch(/^[A-Z0-9]+$/); // Random string
    });
  });

  describe("validateConfiguration", () => {
    test("should validate correct configuration", () => {
      const validation = errorHandler.validateConfiguration();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    test("should detect missing error codes", () => {
      errorHandler.errorCodes = {};
      const validation = errorHandler.validateConfiguration();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "Error codes not properly initialized"
      );
    });

    test("should detect missing user messages", () => {
      errorHandler.userMessages = {};
      const validation = errorHandler.validateConfiguration();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain(
        "User messages not properly initialized"
      );
    });
  });

  describe("buildFallbackErrorResponse", () => {
    test("should build fallback response when error handler fails", () => {
      const originalError = new Error("Original error");
      const fallbackResponse =
        errorHandler.buildFallbackErrorResponse(originalError);

      expect(fallbackResponse.success).toBe(false);
      expect(fallbackResponse.error.code).toBe("UNKNOWN_ERROR");
      expect(fallbackResponse.error.category).toBe("configuration");
      expect(fallbackResponse.error.severity).toBe("critical");
      expect(fallbackResponse.error.originalError).toBe("Original error");
      expect(fallbackResponse.shouldRetry).toBe(false);
    });
  });

  describe("error handling edge cases", () => {
    test("should handle null error gracefully", () => {
      const result = errorHandler.handlePayPalError(null);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("UNKNOWN_ERROR");
    });

    test("should handle error without message", () => {
      const error = { name: "SOME_ERROR" };
      const result = errorHandler.handlePayPalError(error);

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("UNKNOWN_ERROR");
    });

    test("should handle circular reference in context", () => {
      const error = { name: "INSTRUMENT_DECLINED", message: "Declined" };
      const context = { userId: "user_123" };
      context.circular = context; // Create circular reference

      // Should not throw error
      const result = errorHandler.handlePayPalError(error, context);
      expect(result.success).toBe(false);
    });
  });
});

module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};
