/**
 * Security Configuration - Configuración de seguridad para pagos
 * Quiz Cristiano - Configuración centralizada de medidas de seguridad
 */

const SecurityConfig = {
  // Requirement 8.1: HTTPS Configuration
  https: {
    enforceInProduction: true,
    allowLocalhostHttp: true,
    redirectToHttps: true,
    requiredHeaders: [
      "x-forwarded-proto",
      "x-forwarded-ssl",
      "x-forwarded-scheme",
    ],
  },

  // Requirement 8.3: Encryption Configuration
  encryption: {
    algorithm: "AES-GCM",
    keyLength: 256,
    ivLength: 12,
    tagLength: 16,
    sensitiveFields: [
      "paypalOrderId",
      "paypalPaymentId",
      "paypalData",
      "userEmail",
      "billingAddress",
      "paymentMethodDetails",
    ],
    tokenExpiration: 15 * 60 * 1000, // 15 minutos
    keyRotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 días
  },

  // Requirement 8.5: Fraud Detection Configuration
  fraudDetection: {
    suspiciousActivityThreshold: {
      maxFailedAttempts: 5,
      timeWindow: 15 * 60 * 1000, // 15 minutos
      maxTransactionsPerHour: 10,
      maxAmountPerHour: 1000, // USD
      maxAmountPerDay: 5000, // USD
    },
    blockDuration: {
      temporary: 30 * 60 * 1000, // 30 minutos
      extended: 24 * 60 * 60 * 1000, // 24 horas
      permanent: -1, // Requiere intervención manual
    },
    riskFactors: {
      rapidIpChange: {
        enabled: true,
        timeWindow: 5 * 60 * 1000, // 5 minutos
        severity: "MEDIUM",
      },
      unusualHours: {
        enabled: true,
        startHour: 23, // 11 PM
        endHour: 6, // 6 AM
        severity: "LOW",
      },
      highValueTransaction: {
        enabled: true,
        threshold: 500, // USD
        severity: "MEDIUM",
      },
      newDevice: {
        enabled: true,
        severity: "LOW",
      },
    },
  },

  // Rate Limiting Configuration
  rateLimiting: {
    paymentCreation: {
      maxRequests: 5,
      windowSize: 60 * 1000, // 1 minuto
      blockDuration: 5 * 60 * 1000, // 5 minutos
    },
    paymentVerification: {
      maxRequests: 10,
      windowSize: 60 * 1000,
      blockDuration: 2 * 60 * 1000,
    },
    subscriptionManagement: {
      maxRequests: 3,
      windowSize: 60 * 1000,
      blockDuration: 10 * 60 * 1000,
    },
    webhookProcessing: {
      maxRequests: 100,
      windowSize: 60 * 1000,
      blockDuration: 1 * 60 * 1000,
    },
  },

  // Input Validation Rules
  validation: {
    userId: {
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/,
      required: true,
    },
    productId: {
      validValues: [
        "coins_100",
        "coins_500",
        "coins_1000",
        "coins_5000",
        "premium_monthly",
        "premium_yearly",
      ],
      required: true,
    },
    amount: {
      min: 0.01,
      max: 10000,
      decimals: 2,
      required: true,
    },
    currency: {
      validValues: ["USD", "ARS"],
      required: true,
    },
    email: {
      maxLength: 254,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      required: false,
    },
    transactionId: {
      minLength: 10,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9_-]+$/,
      required: true,
    },
  },

  // Webhook Security Configuration
  webhook: {
    paypal: {
      requiredHeaders: [
        "paypal-auth-algo",
        "paypal-transmission-id",
        "paypal-cert-id",
        "paypal-transmission-sig",
        "paypal-transmission-time",
      ],
      maxAge: 5 * 60 * 1000, // 5 minutos
      allowedAlgorithms: ["SHA256withRSA"],
      verifySignature: true,
    },
    rateLimiting: {
      maxWebhooksPerMinute: 100,
      maxWebhooksPerHour: 1000,
    },
  },

  // Security Headers Configuration
  securityHeaders: {
    contentSecurityPolicy: {
      enabled: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "'unsafe-inline'",
          "https://www.paypal.com",
          "https://www.sandbox.paypal.com",
        ],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": [
          "'self'",
          "https://api.paypal.com",
          "https://api.sandbox.paypal.com",
        ],
        "frame-src": [
          "https://www.paypal.com",
          "https://www.sandbox.paypal.com",
        ],
        "form-action": ["'self'"],
      },
    },
    strictTransportSecurity: {
      enabled: true,
      maxAge: 31536000, // 1 año
      includeSubDomains: true,
      preload: true,
    },
    xFrameOptions: "DENY",
    xContentTypeOptions: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
  },

  // Monitoring and Alerting Configuration
  monitoring: {
    securityEvents: {
      logLevel: "INFO",
      alertThresholds: {
        suspiciousActivity: 5, // por hora
        failedAuthentications: 10, // por hora
        rateLimitViolations: 20, // por hora
      },
    },
    healthChecks: {
      interval: 5 * 60 * 1000, // 5 minutos
      timeout: 30 * 1000, // 30 segundos
      retries: 3,
    },
  },

  // Environment-specific configurations
  environments: {
    development: {
      https: {
        enforceInProduction: false,
        allowLocalhostHttp: true,
      },
      encryption: {
        keyRotationInterval: 7 * 24 * 60 * 60 * 1000, // 7 días
      },
      fraudDetection: {
        suspiciousActivityThreshold: {
          maxFailedAttempts: 10, // Más permisivo en desarrollo
          maxTransactionsPerHour: 50,
        },
      },
    },
    production: {
      https: {
        enforceInProduction: true,
        allowLocalhostHttp: false,
      },
      encryption: {
        keyRotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 días
      },
      fraudDetection: {
        suspiciousActivityThreshold: {
          maxFailedAttempts: 3, // Más estricto en producción
          maxTransactionsPerHour: 5,
        },
      },
    },
  },

  // Emergency procedures
  emergency: {
    lockdownTriggers: [
      "MULTIPLE_SECURITY_BREACHES",
      "SUSPECTED_DATA_BREACH",
      "PAYMENT_SYSTEM_COMPROMISE",
      "EXCESSIVE_FRAUD_ACTIVITY",
    ],
    lockdownActions: [
      "DISABLE_PAYMENT_PROCESSING",
      "NOTIFY_SECURITY_TEAM",
      "ENABLE_ENHANCED_LOGGING",
      "ACTIVATE_INCIDENT_RESPONSE",
    ],
    contactInfo: {
      securityTeam:
        process.env.SECURITY_TEAM_EMAIL || "security@quizcristiano.com",
      emergencyPhone: process.env.EMERGENCY_PHONE || "+1-XXX-XXX-XXXX",
    },
  },
};

/**
 * Get configuration for current environment
 */
function getSecurityConfig() {
  const environment = process.env.NODE_ENV || "development";
  const baseConfig = { ...SecurityConfig };

  // Merge environment-specific configuration
  if (SecurityConfig.environments[environment]) {
    const envConfig = SecurityConfig.environments[environment];

    // Deep merge configuration
    Object.keys(envConfig).forEach((key) => {
      if (
        typeof envConfig[key] === "object" &&
        !Array.isArray(envConfig[key])
      ) {
        baseConfig[key] = { ...baseConfig[key], ...envConfig[key] };
      } else {
        baseConfig[key] = envConfig[key];
      }
    });
  }

  return baseConfig;
}

/**
 * Validate security configuration
 */
function validateSecurityConfig() {
  const config = getSecurityConfig();
  const errors = [];

  // Validar configuración de HTTPS
  if (
    process.env.NODE_ENV === "production" &&
    !config.https.enforceInProduction
  ) {
    errors.push("HTTPS enforcement disabled in production");
  }

  // Validar configuración de encriptación
  if (!process.env.ENCRYPTION_KEY && process.env.NODE_ENV === "production") {
    errors.push("Encryption key not configured for production");
  }

  // Validar configuración de webhook
  if (!process.env.PAYPAL_WEBHOOK_ID) {
    errors.push("PayPal webhook ID not configured");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    config: config,
  };
}

// Exportar configuración
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SecurityConfig,
    getSecurityConfig,
    validateSecurityConfig,
  };
} else if (typeof window !== "undefined") {
  window.SecurityConfig = SecurityConfig;
  window.getSecurityConfig = getSecurityConfig;
  window.validateSecurityConfig = validateSecurityConfig;
}
