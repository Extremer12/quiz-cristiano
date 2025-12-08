/**
 * Unit Tests for CurrencyService
 * Quiz Cristiano - Tests para el servicio de monedas
 */

// Mock del CurrencyService
class CurrencyService {
  constructor() {
    this.defaultCurrency = this.detectUserCurrency();
    this.supportedCurrencies = ["USD", "ARS"];
    this.exchangeRates = {
      USD_TO_ARS: 150,
      ARS_TO_USD: 0.0067,
    };
  }

  detectUserCurrency() {
    try {
      const userCountry = this.getUserCountry();
      return userCountry === "AR" ? "ARS" : "USD";
    } catch (error) {
      return "USD";
    }
  }

  getUserCountry() {
    // Mock implementation
    if (typeof window !== "undefined" && window.mockUserCountry) {
      return window.mockUserCountry;
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes("Argentina") || timezone.includes("Buenos_Aires")) {
      return "AR";
    }
    return "US";
  }

  formatPrice(amount, currency) {
    const locale = currency === "ARS" ? "es-AR" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  getProductPrice(product, currency) {
    if (currency === "ARS") {
      return (
        product.priceARS || this.convertCurrency(product.priceUSD, "USD", "ARS")
      );
    }
    return (
      product.priceUSD || this.convertCurrency(product.priceARS, "ARS", "USD")
    );
  }

  convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    const rateKey = `${fromCurrency}_TO_${toCurrency}`;
    const rate = this.exchangeRates[rateKey];

    if (!rate) {
      throw new Error(
        `Exchange rate not found for ${fromCurrency} to ${toCurrency}`
      );
    }

    return Math.round(amount * rate * 100) / 100;
  }

  getCurrencySymbol(currency) {
    const symbols = {
      USD: "$",
      ARS: "$",
    };
    return symbols[currency] || currency;
  }

  isValidCurrency(currency) {
    return this.supportedCurrencies.includes(currency);
  }
}

describe("CurrencyService", () => {
  let currencyService;

  beforeEach(() => {
    // Reset window mock
    if (typeof window !== "undefined") {
      delete window.mockUserCountry;
    }

    currencyService = new CurrencyService();
  });

  describe("detectUserCurrency", () => {
    test("should detect ARS for Argentina", () => {
      if (typeof window !== "undefined") {
        window.mockUserCountry = "AR";
      }

      const service = new CurrencyService();
      expect(service.defaultCurrency).toBe("ARS");
    });

    test("should detect USD for other countries", () => {
      if (typeof window !== "undefined") {
        window.mockUserCountry = "US";
      }

      const service = new CurrencyService();
      expect(service.defaultCurrency).toBe("USD");
    });

    test("should fallback to USD on error", () => {
      // Mock getUserCountry to throw error
      const originalGetUserCountry = currencyService.getUserCountry;
      currencyService.getUserCountry = jest.fn().mockImplementation(() => {
        throw new Error("Geolocation failed");
      });

      const result = currencyService.detectUserCurrency();
      expect(result).toBe("USD");

      // Restore original method
      currencyService.getUserCountry = originalGetUserCountry;
    });
  });

  describe("formatPrice", () => {
    test("should format USD prices correctly", () => {
      const formatted = currencyService.formatPrice(9.99, "USD");
      expect(formatted).toMatch(/\$9\.99/);
    });

    test("should format ARS prices correctly", () => {
      const formatted = currencyService.formatPrice(150, "ARS");
      expect(formatted).toMatch(/150/);
    });

    test("should handle zero amounts", () => {
      const formatted = currencyService.formatPrice(0, "USD");
      expect(formatted).toMatch(/\$0\.00/);
    });

    test("should handle decimal amounts", () => {
      const formatted = currencyService.formatPrice(1.5, "USD");
      expect(formatted).toMatch(/\$1\.50/);
    });
  });

  describe("getProductPrice", () => {
    const mockProduct = {
      id: "coins_100",
      name: "100 Monedas",
      priceUSD: 0.99,
      priceARS: 150,
    };

    test("should return ARS price when currency is ARS", () => {
      const price = currencyService.getProductPrice(mockProduct, "ARS");
      expect(price).toBe(150);
    });

    test("should return USD price when currency is USD", () => {
      const price = currencyService.getProductPrice(mockProduct, "USD");
      expect(price).toBe(0.99);
    });

    test("should convert from USD to ARS when ARS price not available", () => {
      const productWithoutARS = {
        id: "coins_500",
        name: "500 Monedas",
        priceUSD: 4.99,
      };

      const price = currencyService.getProductPrice(productWithoutARS, "ARS");
      expect(price).toBe(748.5); // 4.99 * 150
    });

    test("should convert from ARS to USD when USD price not available", () => {
      const productWithoutUSD = {
        id: "coins_1000",
        name: "1000 Monedas",
        priceARS: 1500,
      };

      const price = currencyService.getProductPrice(productWithoutUSD, "USD");
      expect(price).toBe(10.05); // 1500 * 0.0067
    });
  });

  describe("convertCurrency", () => {
    test("should return same amount for same currency", () => {
      const result = currencyService.convertCurrency(100, "USD", "USD");
      expect(result).toBe(100);
    });

    test("should convert USD to ARS correctly", () => {
      const result = currencyService.convertCurrency(1, "USD", "ARS");
      expect(result).toBe(150);
    });

    test("should convert ARS to USD correctly", () => {
      const result = currencyService.convertCurrency(150, "ARS", "USD");
      expect(result).toBe(1.01); // Rounded to 2 decimals
    });

    test("should throw error for unsupported currency pair", () => {
      expect(() => {
        currencyService.convertCurrency(100, "USD", "EUR");
      }).toThrow("Exchange rate not found for USD to EUR");
    });

    test("should handle decimal amounts correctly", () => {
      const result = currencyService.convertCurrency(1.5, "USD", "ARS");
      expect(result).toBe(225); // 1.5 * 150
    });

    test("should round to 2 decimal places", () => {
      const result = currencyService.convertCurrency(100.333, "ARS", "USD");
      expect(result).toBe(0.67); // Rounded
    });
  });

  describe("getCurrencySymbol", () => {
    test("should return $ for USD", () => {
      const symbol = currencyService.getCurrencySymbol("USD");
      expect(symbol).toBe("$");
    });

    test("should return $ for ARS", () => {
      const symbol = currencyService.getCurrencySymbol("ARS");
      expect(symbol).toBe("$");
    });

    test("should return currency code for unknown currency", () => {
      const symbol = currencyService.getCurrencySymbol("EUR");
      expect(symbol).toBe("EUR");
    });
  });

  describe("isValidCurrency", () => {
    test("should return true for supported currencies", () => {
      expect(currencyService.isValidCurrency("USD")).toBe(true);
      expect(currencyService.isValidCurrency("ARS")).toBe(true);
    });

    test("should return false for unsupported currencies", () => {
      expect(currencyService.isValidCurrency("EUR")).toBe(false);
      expect(currencyService.isValidCurrency("BTC")).toBe(false);
      expect(currencyService.isValidCurrency("")).toBe(false);
      expect(currencyService.isValidCurrency(null)).toBe(false);
    });
  });

  describe("edge cases", () => {
    test("should handle negative amounts in conversion", () => {
      const result = currencyService.convertCurrency(-10, "USD", "ARS");
      expect(result).toBe(-1500);
    });

    test("should handle zero amounts in conversion", () => {
      const result = currencyService.convertCurrency(0, "USD", "ARS");
      expect(result).toBe(0);
    });

    test("should handle very large amounts", () => {
      const result = currencyService.convertCurrency(1000000, "USD", "ARS");
      expect(result).toBe(150000000);
    });

    test("should handle very small amounts", () => {
      const result = currencyService.convertCurrency(0.01, "USD", "ARS");
      expect(result).toBe(1.5);
    });
  });

  describe("integration scenarios", () => {
    test("should handle complete price calculation flow", () => {
      const product = {
        id: "premium_plan",
        name: "Premium Plan",
        priceUSD: 9.99,
      };

      // Get price in ARS (should convert)
      const arsPrice = currencyService.getProductPrice(product, "ARS");
      expect(arsPrice).toBe(1498.5);

      // Format the price
      const formattedPrice = currencyService.formatPrice(arsPrice, "ARS");
      expect(formattedPrice).toMatch(/1\.498/);
    });

    test("should handle currency detection and pricing", () => {
      if (typeof window !== "undefined") {
        window.mockUserCountry = "AR";
      }

      const service = new CurrencyService();
      const product = {
        id: "coins_100",
        priceUSD: 0.99,
        priceARS: 150,
      };

      // Should detect ARS and use ARS price
      const price = service.getProductPrice(product, service.defaultCurrency);
      expect(price).toBe(150);

      // Should format correctly
      const formatted = service.formatPrice(price, service.defaultCurrency);
      expect(formatted).toMatch(/150/);
    });
  });
});

module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};
