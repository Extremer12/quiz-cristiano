/**
 * Global Teardown for E2E Tests
 * Limpieza global después de tests end-to-end
 */

async function globalTeardown() {
  console.log("🧹 Cleaning up E2E test environment...");

  // Cleanup test data if needed
  // await cleanupTestDatabase();

  console.log("✅ E2E test cleanup completed");
}

module.exports = globalTeardown;
