#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Valida que el deployment esté funcionando correctamente
 */

const https = require('https');
const http = require('http');

class DeploymentValidator {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || 'http://localhost:3000';
    this.results = [];
  }

  async validate() {
    console.log('🔍 Validating deployment...');
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log('================================\n');

    try {
      await this.validateHealthCheck();
      await this.validateApiEndpoints();
      await this.validateStaticFiles();
      
      this.showResults();
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  }

  async validateHealthCheck() {
    console.log('🏥 Checking health endpoint...');
    
    try {
      const response = await this.makeRequest('/api/health');
      const data = JSON.parse(response.body);
      
      if (response.statusCode === 200 && data.status === 'ok') {
        this.addResult('✅ Health check', 'PASS', 'Endpoint responding correctly');
      } else {
        this.addResult('❌ Health check', 'FAIL', `Health check failed with status ${response.statusCode}`);
      }
      }
    } catch (error) {
      this.addResult('❌ Health check', 'FAIL', `Health check failed: ${error.message}`);
    }
  }

  async validateApiEndpoints() {
    console.log('🔌 Checking API endpoints...');
    
    const endpoints = [
      { path: '/api/pay' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(endpoint.path);
        
        if (response.statusCode === 200) {
          this.addResult('✅ API Endpoint', 'PASS', `${endpoint.path} is accessible`);
        } else {
          this.addResult('❌ API Endpoint', 'FAIL', `${endpoint.path} returned ${response.statusCode}`);
        }
      } catch (error) {
        this.addResult('❌ API Endpoint', 'FAIL', `${endpoint.path} failed: ${error.message}`);
      }
    }
  }