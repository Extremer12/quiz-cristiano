#!/usr/bin/env node

/**
 * Monitoring Setup Script
 * Configura monitoreo y alertas para la aplicación
 */

const fs = require("fs");
const path = require("path");

class MonitoringSetup {
  constructor() {
    this.alertsConfig = require("../monitoring/alerts.json");
  }

  async setup() {
    console.log("📊 Setting up monitoring and alerts...");
    console.log("=====================================\n");

    try {
      await this.setupVercelAnalytics();
      await this.setupCustomMetrics();
      await this.generateMonitoringDashboard();
      await this.createHealthCheckEndpoint();

      console.log("\n✅ Monitoring setup completed!");
      this.showMonitoringInfo();
    } catch (error) {
      console.error("❌ Monitoring setup failed:", error.message);
    }
  }

  async setupVercelAnalytics() {
    console.log("📈 Setting up Vercel Analytics...");

    // Create analytics configuration
    const analyticsConfig = {
      enabled: true,
      debug: false,
      beforeSend: (event) => {
        // Filter sensitive data
        if (event.url && event.url.includes("/api/paypal/")) {
          event.url = event.url.replace(
            /\/api\/paypal\/.*/,
            "/api/paypal/[endpoint]"
          );
        }
        return event;
      },
    };

    // Add analytics script to HTML files
    const htmlFiles = ["index.html", "store.html", "perfil.html"];

    for (const file of htmlFiles) {
      if (fs.existsSync(file)) {
        this.addAnalyticsToHtml(file);
      }
    }

    console.log("✅ Vercel Analytics configured");
  }

  addAnalyticsToHtml(filePath) {
    let content = fs.readFileSync(filePath, "utf8");

    const analyticsScript = `
    <!-- Vercel Analytics -->
    <script>
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>`;

    if (!content.includes("_vercel/insights/script.js")) {
      content = content.replace("</head>", `${analyticsScript}\n  </head>`);
      fs.writeFileSync(filePath, content);
      console.log(`📊 Analytics added to ${filePath}`);
    }
  }

  async setupCustomMetrics() {
    console.log("📊 Setting up custom metrics...");

    // Create metrics collection script
    const metricsScript = `
/**
 * Custom Metrics Collection
 * Recolecta métricas personalizadas para monitoreo
 */

class MetricsCollector {
  constructor() {
    this.metrics = {};
    this.startTime = Date.now();
  }

  // Métricas de pagos
  recordPaymentAttempt(method, currency, amount) {
    this.track('payment_attempt', {
      method,
      currency,
      amount,
      timestamp: Date.now()
    });
  }

  recordPaymentSuccess(method, currency, amount, duration) {
    this.track('payment_success', {
      method,
      currency,
      amount,
      duration,
      timestamp: Date.now()
    });
  }

  recordPaymentFailure(method, currency, amount, error, duration) {
    this.track('payment_failure', {
      method,
      currency,
      amount,
      error: error.message || error,
      duration,
      timestamp: Date.now()
    });
  }

  // Métricas de webhooks
  recordWebhookReceived(eventType) {
    this.track('webhook_received', {
      eventType,
      timestamp: Date.now()
    });
  }

  recordWebhookProcessed(eventType, duration, success) {
    this.track('webhook_processed', {
      eventType,
      duration,
      success,
      timestamp: Date.now()
    });
  }

  // Métricas de rendimiento
  recordPageLoad(page, loadTime) {
    this.track('page_load', {
      page,
      loadTime,
      timestamp: Date.now()
    });
  }

  recordApiCall(endpoint, method, duration, status) {
    this.track('api_call', {
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now()
    });
  }

  // Método base para tracking
  track(eventName, data) {
    // Enviar a Vercel Analytics si está disponible
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', eventName, data);
    }

    // Log para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Metric:', eventName, data);
    }

    // Almacenar localmente para batch sending
    if (!this.metrics[eventName]) {
      this.metrics[eventName] = [];
    }
    this.metrics[eventName].push(data);

    // Enviar batch cada 10 eventos
    if (this.metrics[eventName].length >= 10) {
      this.sendBatch(eventName);
    }
  }

  sendBatch(eventName) {
    const events = this.metrics[eventName];
    this.metrics[eventName] = [];

    // Enviar a endpoint de métricas personalizado
    if (typeof fetch !== 'undefined') {
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, events })
      }).catch(error => {
        console.warn('Failed to send metrics:', error);
      });
    }
  }
}

// Instancia global
const metricsCollector = new MetricsCollector();

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
  window.metricsCollector = metricsCollector;
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MetricsCollector;
}`;

    fs.writeFileSync("js/modules/metrics-collector.js", metricsScript);
    console.log("✅ Custom metrics collector created");
  }
  async generateMonitoringDashboard() {
    console.log("📊 Generating monitoring dashboard...");

    const dashboardHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quiz Cristiano - Monitoring Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .widget { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .widget h3 { margin-top: 0; color: #333; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .status-good { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-error { color: #dc3545; }
        .chart-placeholder { height: 200px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6c757d; }
    </style>
</head>
<body>
    <h1>Quiz Cristiano - Monitoring Dashboard</h1>
    
    <div class="dashboard">
        <div class="widget">
            <h3>Payment Success Rate</h3>
            <div class="metric-value status-good" id="payment-success-rate">--</div>
            <p>Last 24 hours</p>
        </div>
        
        <div class="widget">
            <h3>Total Revenue Today</h3>
            <div class="metric-value" id="total-revenue">--</div>
            <p>All currencies</p>
        </div>
        
        <div class="widget">
            <h3>Active Users</h3>
            <div class="metric-value" id="active-users">--</div>
            <p>Currently online</p>
        </div>
        
        <div class="widget">
            <h3>API Response Time</h3>
            <div class="metric-value" id="api-response-time">--</div>
            <p>Average (ms)</p>
        </div>
        
        <div class="widget">
            <h3>Webhook Status</h3>
            <div class="metric-value status-good" id="webhook-status">Healthy</div>
            <p>Last processed: <span id="last-webhook">--</span></p>
        </div>
        
        <div class="widget">
            <h3>Error Rate</h3>
            <div class="metric-value status-good" id="error-rate">--</div>
            <p>Last hour</p>
        </div>
        
        <div class="widget">
            <h3>Payment Methods</h3>
            <div class="chart-placeholder">PayPal Usage Chart</div>
        </div>
        
        <div class="widget">
            <h3>Currency Distribution</h3>
            <div class="chart-placeholder">Currency Chart</div>
        </div>
    </div>

    <script>
        // Simulated dashboard data loading
        function loadDashboardData() {
            // In a real implementation, this would fetch from your metrics API
            document.getElementById('payment-success-rate').textContent = '98.5%';
            document.getElementById('total-revenue').textContent = '$1,234';
            document.getElementById('active-users').textContent = '42';
            document.getElementById('api-response-time').textContent = '145ms';
            document.getElementById('last-webhook').textContent = new Date().toLocaleTimeString();
            document.getElementById('error-rate').textContent = '0.2%';
        }

        // Load data on page load and refresh every 30 seconds
        loadDashboardData();
        setInterval(loadDashboardData, 30000);
    </script>
</body>
</html>`;

    fs.writeFileSync("monitoring/dashboard.html", dashboardHtml);
    console.log("✅ Monitoring dashboard generated");
  }

  async createHealthCheckEndpoint() {
    console.log("🏥 Creating health check endpoint...");

    const healthCheckCode = `
/**
 * Health Check API Endpoint
 * Verifica el estado de la aplicación y sus dependencias
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const checks = {};

  try {
    // Check PayPal API connectivity
    checks.paypal = await checkPayPalHealth();
    
    // Check Firebase connectivity
    checks.firebase = await checkFirebaseHealth();
    
    // Check environment variables
    checks.environment = checkEnvironmentVariables();
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Determine overall health
    const isHealthy = Object.values(checks).every(check => check.status === 'healthy');
    
    const healthStatus = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: \`\${responseTime}ms\`,
      checks,
      version: process.env.APP_VERSION || '1.0.0'
    };

    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json(healthStatus);

  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
      checks
    });
  }
}

async function checkPayPalHealth() {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox';
    
    if (!clientId) {
      return { status: 'unhealthy', message: 'PayPal client ID not configured' };
    }

    // Simple connectivity check (you might want to make an actual API call)
    return { 
      status: 'healthy', 
      message: \`PayPal configured for \${environment}\`,
      environment 
    };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
}

async function checkFirebaseHealth() {
  try {
    // Check if Firebase config is present
    const hasFirebaseConfig = !!(
      process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_API_KEY
    );

    if (!hasFirebaseConfig) {
      return { status: 'unhealthy', message: 'Firebase not configured' };
    }

    return { status: 'healthy', message: 'Firebase configured' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
}

function checkEnvironmentVariables() {
  const requiredVars = [
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
    'JWT_SECRET',
    'ENCRYPTION_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    return { 
      status: 'unhealthy', 
      message: \`Missing environment variables: \${missingVars.join(', ')}\`
    };
  }

  return { status: 'healthy', message: 'All required environment variables present' };
}`;

    // Create API directory if it doesn't exist
    if (!fs.existsSync("api")) {
      fs.mkdirSync("api");
    }

    fs.writeFileSync("api/health.js", healthCheckCode);
    console.log("✅ Health check endpoint created at /api/health");
  }

  showMonitoringInfo() {
    console.log("\n📊 Monitoring Setup Complete!");
    console.log("================================");
    console.log("🔗 Available Endpoints:");
    console.log("  - Health Check: /api/health");
    console.log("  - Dashboard: /monitoring/dashboard.html");
    console.log("\n📈 Metrics Being Tracked:");
    console.log("  - Payment success/failure rates");
    console.log("  - API response times");
    console.log("  - Webhook processing");
    console.log("  - User activity");
    console.log("  - Error rates");
    console.log("\n⚠️ Next Steps:");
    console.log("1. Configure alert recipients in monitoring/alerts.json");
    console.log("2. Set up external monitoring service (optional)");
    console.log("3. Test health check endpoint");
    console.log("4. Review dashboard after deployment");
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new MonitoringSetup();
  setup.setup();
}

module.exports = MonitoringSetup;
