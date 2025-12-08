/**
 * Environment Configuration Manager
 * Maneja todas las variables de entorno de forma centralizada
 */

class EnvironmentConfig {
  constructor() {
    this.env = this.detectEnvironment();
    this.config = this.loadConfiguration();
    this.validateConfiguration();
  }

  /**
   * Detecta el entorno actual
   */
  detectEnvironment() {
    if (typeof process !== "undefined" && process.env) {
      return process.env.NODE_ENV || "development";
    }

    // Detectar por URL en el navegador
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
        return "development";
      }
      if (hostname.includes("vercel.app") || hostname.includes("netlify.app")) {
        return "production";
      }
    }

    return "development";
  }

  /**
   * Obtiene variable de entorno con fallback
   */
  getEnvVar(name, fallback = "") {
    // Server-side (Node.js)
    if (typeof process !== "undefined" && process.env) {
      return process.env[name] || fallback;
    }

    // Client-side fallbacks para desarrollo
    const devFallbacks = {
      PAYPAL_CLIENT_ID: "demo_client_id",
      PAYPAL_ENVIRONMENT: "sandbox",
      DEFAULT_CURRENCY: "USD",
      SUPPORTED_CURRENCIES: "USD,ARS",
      ENABLE_PAYMENT_LOGGING: "true",
    };

    return devFallbacks[name] || fallback;
  }

  /**
   * Carga toda la configuración
   */
  loadConfiguration() {
    return {
      app: this.loadAppConfig(),
      paypal: this.loadPayPalConfig(),
      currency: this.loadCurrencyConfig(),
      security: this.loadSecurityConfig(),
      monitoring: this.loadMonitoringConfig(),
    };
  }
  /*
   *
   * Configuración de la aplicación
   */
  loadAppConfig() {
    return {
      name: this.getEnvVar("APP_NAME", "Quiz Cristiano"),
      version: this.getEnvVar("APP_VERSION", "1.0.0"),
      url: this.getEnvVar("APP_URL", "http://localhost:3000"),
      environment: this.env,
      isDevelopment: this.env === "development",
      isProduction: this.env === "production",
    };
  }

  /**
   * Configuración de PayPal
   */
  loadPayPalConfig() {
    return {
      clientId: this.getEnvVar("PAYPAL_CLIENT_ID"),
      clientSecret: this.getEnvVar("PAYPAL_CLIENT_SECRET"),
      environment: this.getEnvVar("PAYPAL_ENVIRONMENT", "sandbox"),
      webhookId: this.getEnvVar("PAYPAL_WEBHOOK_ID"),
      webhookUrl: this.getEnvVar("PAYPAL_WEBHOOK_URL"),
      isConfigured: Boolean(this.getEnvVar("PAYPAL_CLIENT_ID")),
    };
  }

  /**
   * Configuración de monedas
   */
  loadCurrencyConfig() {
    const supportedCurrencies = this.getEnvVar(
      "SUPPORTED_CURRENCIES",
      "USD,ARS"
    ).split(",");

    return {
      default: this.getEnvVar("DEFAULT_CURRENCY", "USD"),
      supported: supportedCurrencies,
      exchangeRates: {
        USD_TO_ARS: parseFloat(
          this.getEnvVar("EXCHANGE_RATE_USD_TO_ARS", "150.00")
        ),
      },
    };
  }

  /**
   * Configuración de seguridad
   */
  loadSecurityConfig() {
    return {
      jwtSecret: this.getEnvVar("JWT_SECRET"),
      encryptionKey: this.getEnvVar("ENCRYPTION_KEY"),
      forceHttps: this.getEnvVar("FORCE_HTTPS", "false") === "true",
      enableCorsRestrictions:
        this.getEnvVar("ENABLE_CORS_RESTRICTIONS", "false") === "true",
      allowedOrigins: this.getEnvVar("ALLOWED_ORIGINS", "")
        .split(",")
        .filter(Boolean),
      rateLimit: {
        windowMs: parseInt(this.getEnvVar("RATE_LIMIT_WINDOW_MS", "900000")),
        maxRequests: parseInt(this.getEnvVar("RATE_LIMIT_MAX_REQUESTS", "100")),
      },
    };
  }
  /**
   * Configuración de monitoreo
   */
  loadMonitoringConfig() {
    return {
      enablePaymentLogging:
        this.getEnvVar("ENABLE_PAYMENT_LOGGING", "true") === "true",
      enableErrorTracking:
        this.getEnvVar("ENABLE_ERROR_TRACKING", "true") === "true",
      enableDevTools: this.getEnvVar("ENABLE_DEV_TOOLS", "false") === "true",
      webhook: {
        maxRetries: parseInt(this.getEnvVar("WEBHOOK_MAX_RETRIES", "3")),
        retryDelay: parseInt(this.getEnvVar("WEBHOOK_RETRY_DELAY", "1000")),
      },
    };
  }

  /**
   * Valida la configuración
   */
  validateConfiguration() {
    const errors = [];
    const warnings = [];

    // Validar PayPal
    if (
      !this.config.paypal.clientId ||
      this.config.paypal.clientId === "demo_client_id"
    ) {
      if (this.env === "production") {
        errors.push("PayPal Client ID is required in production");
      } else {
        warnings.push("Using demo PayPal Client ID");
      }
    }

    // Validar seguridad en producción
    if (this.env === "production") {
      if (!this.config.security.jwtSecret) {
        errors.push("JWT Secret is required in production");
      }
      if (!this.config.security.encryptionKey) {
        errors.push("Encryption Key is required in production");
      }
    }

    // Log resultados
    if (errors.length > 0) {
      console.error("❌ Configuration errors:", errors);
      throw new Error(`Configuration validation failed: ${errors.join(", ")}`);
    }

    if (warnings.length > 0) {
      console.warn("⚠️ Configuration warnings:", warnings);
    }

    console.log("✅ Environment configuration loaded successfully");
  } /**

   * Obtiene configuración por sección
   */
  get(section, key = null) {
    if (key) {
      return this.config[section]?.[key];
    }
    return this.config[section];
  }

  /**
   * Verifica si estamos en desarrollo
   */
  isDevelopment() {
    return this.env === "development";
  }

  /**
   * Verifica si estamos en producción
   */
  isProduction() {
    return this.env === "production";
  }
}

// Crear instancia global
const environmentConfig = new EnvironmentConfig();

// Hacer disponible globalmente
if (typeof window !== "undefined") {
  window.EnvironmentConfig = EnvironmentConfig;
  window.environmentConfig = environmentConfig;
}

// Exportar para módulos
// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = { EnvironmentConfig, environmentConfig };
// }
