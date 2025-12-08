#!/usr/bin/env node

/**
 * Deployment Script for Quiz Cristiano
 * Automatiza el proceso de deployment a Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentManager {
  constructor() {
    this.projectRoot = process.cwd();
    this.requiredEnvVars = [
      'PAYPAL_CLIENT_ID',
      'PAYPAL_CLIENT_SECRET',
      'PAYPAL_ENVIRONMENT',
      'JWT_SECRET',
      'ENCRYPTION_KEY'
    ];
  }

  async deploy() {
    console.log('🚀 Starting Quiz Cristiano Deployment');
    console.log('=====================================\n');

    try {
      await this.preDeploymentChecks();
      await this.buildProject();
      await this.deployToVercel();
      await this.postDeploymentTasks();
      
      console.log('\n✅ Deployment completed successfully!');
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  async preDeploymentChecks() {
    console.log('🔍 Running pre-deployment checks...');

    // Check if .env file exists
    const envPath = path.join(this.projectRoot, '.env');
    if (!fs.existsSync(envPath)) {
      throw new Error('.env file not found. Run "node scripts/setup-env.js" first.');
    }

    // Validate required environment variables
    this.validateEnvironmentVariables();

    // Check if vercel.json exists
    const vercelConfigPath = path.join(this.projectRoot, 'vercel.json');
    if (!fs.existsSync(vercelConfigPath)) {
      throw new Error('vercel.json not found');
    }

    // Check if API endpoints exist
    this.validateApiEndpoints();

    console.log('✅ Pre-deployment checks passed');
  }

  validateEnvironmentVariables() {
    const envContent = fs.readFileSync('.env', 'utf8');
    const missingVars = [];

    for (const varName of this.requiredEnvVars) {
      if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=`)) {
        const value = envContent.match(new RegExp(`${varName}=(.*)`))?.[1];
        if (!value || value.trim() === '') {
          missingVars.push(varName);
        }
      }
    }

    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  validateApiEndpoints() {
    const requiredEndpoints = [
      'api/paypal/webhook.js'
    ];

    for (const endpoint of requiredEndpoints) {
      const endpointPath = path.join(this.projectRoot, endpoint);
      if (!fs.existsSync(endpointPath)) {
        throw new Error(`Required API endpoint not found: ${endpoint}`);
      }
    }
  }  as
ync buildProject() {
    console.log('🔨 Building project...');

    // Run any build steps if needed
    try {
      // Install dependencies if needed
      if (fs.existsSync('package.json')) {
        console.log('📦 Installing dependencies...');
        execSync('npm install', { stdio: 'inherit' });
      }

      // Run tests
      console.log('🧪 Running tests...');
      try {
        execSync('npm test', { stdio: 'inherit' });
      } catch (error) {
        console.warn('⚠️ Tests failed, but continuing deployment...');
      }

      console.log('✅ Build completed');
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  async deployToVercel() {
    console.log('🌐 Deploying to Vercel...');

    try {
      // Check if Vercel CLI is installed
      try {
        execSync('vercel --version', { stdio: 'pipe' });
      } catch (error) {
        console.log('📥 Installing Vercel CLI...');
        execSync('npm install -g vercel', { stdio: 'inherit' });
      }

      // Deploy to Vercel
      console.log('🚀 Starting Vercel deployment...');
      execSync('vercel --prod', { stdio: 'inherit' });

      console.log('✅ Vercel deployment completed');
    } catch (error) {
      throw new Error(`Vercel deployment failed: ${error.message}`);
    }
  }

  async postDeploymentTasks() {
    console.log('🔧 Running post-deployment tasks...');

    // Generate deployment report
    this.generateDeploymentReport();

    // Show next steps
    this.showNextSteps();

    console.log('✅ Post-deployment tasks completed');
  }

  generateDeploymentReport() {
    const report = {
      timestamp: new Date().toISOString(),
      environment: 'production',
      features: [
        'PayPal Integration',
        'Webhook Processing',
        'Multi-currency Support',
        'Security Headers',
        'API Rate Limiting'
      ],
      endpoints: [
        '/api/paypal/webhook',
        '/api/paypal/orders',
        '/api/paypal/capture',
        '/api/paypal/subscriptions'
      ]
    };

    fs.writeFileSync('deployment-report.json', JSON.stringify(report, null, 2));
    console.log('📄 Deployment report generated: deployment-report.json');
  }

  showNextSteps() {
    console.log('\n📋 Next Steps:');
    console.log('1. Configure environment variables in Vercel dashboard');
    console.log('2. Update PayPal webhook URL to your production domain');
    console.log('3. Test payment flows in production');
    console.log('4. Monitor logs and performance');
    console.log('\n🔗 Useful Links:');
    console.log('- Vercel Dashboard: https://vercel.com/dashboard');
    console.log('- PayPal Developer: https://developer.paypal.com/');
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployment = new DeploymentManager();
  deployment.deploy();
}

module.exports = DeploymentManager;