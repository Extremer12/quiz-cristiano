#!/usr/bin/env node

/**
 * Environment Setup Script
 * Script para configurar variables de entorno
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

class EnvironmentSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.envVars = {};
  }

  async run() {
    console.log("🚀 Quiz Cristiano - Environment Setup");
    console.log("=====================================\n");

    try {
      await this.collectEnvironmentVariables();
      await this.generateEnvFile();
      await this.showNextSteps();
    } catch (error) {
      console.error("❌ Error during setup:", error.message);
    } finally {
      this.rl.close();
    }
  }

  async collectEnvironmentVariables() {
    console.log("📝 Configurando variables de entorno...\n");

    // PayPal Configuration
    console.log("🔵 PayPal Configuration:");
    this.envVars.PAYPAL_CLIENT_ID = await this.ask("PayPal Client ID: ");
    this.envVars.PAYPAL_CLIENT_SECRET = await this.ask(
      "PayPal Client Secret: "
    );

    const environment = await this.ask(
      "Environment (sandbox/production) [sandbox]: "
    );
    this.envVars.PAYPAL_ENVIRONMENT = environment || "sandbox";

    this.envVars.PAYPAL_WEBHOOK_ID = await this.ask(
      "PayPal Webhook ID (optional): "
    );

    // Security Configuration
    console.log("\n🔒 Security Configuration:");
    this.envVars.JWT_SECRET = this.generateRandomString(32);
    this.envVars.ENCRYPTION_KEY = this.generateRandomString(32);
    console.log("✅ Generated JWT Secret and Encryption Key");

    // App Configuration
    console.log("\n⚙️ App Configuration:");
    const appUrl = await this.ask("App URL [http://localhost:3000]: ");
    this.envVars.APP_URL = appUrl || "http://localhost:3000";

    // Currency Configuration
    console.log("\n💱 Currency Configuration:");
    const defaultCurrency = await this.ask("Default Currency [USD]: ");
    this.envVars.DEFAULT_CURRENCY = defaultCurrency || "USD";

    const exchangeRate = await this.ask("USD to ARS Exchange Rate [150.00]: ");
    this.envVars.EXCHANGE_RATE_USD_TO_ARS = exchangeRate || "150.00";
  }

  async generateEnvFile() {
    const envContent = this.buildEnvFileContent();
    const envPath = path.join(process.cwd(), ".env");

    fs.writeFileSync(envPath, envContent);
    console.log("\n✅ Generated .env file successfully!");
  }
  buildE;
  nvFileContent() {
    const timestamp = new Date().toISOString();

    return `# ================================================
# QUIZ CRISTIANO - ENVIRONMENT VARIABLES
# Generated on: ${timestamp}
# ================================================

# General Configuration
NODE_ENV=development
APP_NAME=Quiz Cristiano
APP_VERSION=1.0.0
APP_URL=${this.envVars.APP_URL}

# PayPal Configuration
PAYPAL_CLIENT_ID=${this.envVars.PAYPAL_CLIENT_ID}
PAYPAL_CLIENT_SECRET=${this.envVars.PAYPAL_CLIENT_SECRET}
PAYPAL_ENVIRONMENT=${this.envVars.PAYPAL_ENVIRONMENT}
PAYPAL_WEBHOOK_ID=${this.envVars.PAYPAL_WEBHOOK_ID || ""}
PAYPAL_WEBHOOK_URL=${this.envVars.APP_URL}/api/paypal/webhook

# Currency Configuration
DEFAULT_CURRENCY=${this.envVars.DEFAULT_CURRENCY}
SUPPORTED_CURRENCIES=USD,ARS
EXCHANGE_RATE_USD_TO_ARS=${this.envVars.EXCHANGE_RATE_USD_TO_ARS}

# Security Configuration
JWT_SECRET=${this.envVars.JWT_SECRET}
ENCRYPTION_KEY=${this.envVars.ENCRYPTION_KEY}

# Product Pricing (USD)
COINS_100_PRICE_USD=0.99
COINS_500_PRICE_USD=4.99
COINS_1000_PRICE_USD=9.99
COINS_5000_PRICE_USD=39.99

# Product Pricing (ARS)
COINS_100_PRICE_ARS=150
COINS_500_PRICE_ARS=750
COINS_1000_PRICE_ARS=1500
COINS_5000_PRICE_ARS=6000

# Premium Subscription
PREMIUM_MONTHLY_PRICE_USD=4.99
PREMIUM_MONTHLY_PRICE_ARS=750

# Monitoring
ENABLE_PAYMENT_LOGGING=true
ENABLE_ERROR_TRACKING=true
WEBHOOK_MAX_RETRIES=3
WEBHOOK_RETRY_DELAY=1000

# Development
ENABLE_DEV_TOOLS=true
ENABLE_MOCK_PAYMENTS=false
`;
  }

  async showNextSteps() {
    console.log("\n🎉 Setup completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("1. Review the generated .env file");
    console.log("2. Add .env to your .gitignore file");
    console.log("3. Configure the same variables in Vercel dashboard");
    console.log("4. Test your PayPal integration");
    console.log("\n🔗 Useful Links:");
    console.log("- PayPal Developer: https://developer.paypal.com/");
    console.log(
      "- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables"
    );
  }

  ask(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  generateRandomString(length) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const setup = new EnvironmentSetup();
  setup.run();
}

module.exports = EnvironmentSetup;
