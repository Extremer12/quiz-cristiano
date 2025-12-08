#!/usr/bin/env node

/**
 * E2E Test Runner
 * Script para ejecutar tests end-to-end con diferentes configuraciones
 */

const { spawn } = require("child_process");
const path = require("path");

// Test configurations
const TEST_CONFIGS = {
  all: {
    description: "Run all E2E tests",
    command: "npx playwright test",
    args: [],
  },
  purchase: {
    description: "Run purchase flow tests only",
    command: "npx playwright test",
    args: ["complete-purchase-flow.test.js"],
  },
  subscription: {
    description: "Run subscription management tests only",
    command: "npx playwright test",
    args: ["subscription-management.test.js"],
  },
  webhook: {
    description: "Run webhook processing tests only",
    command: "npx playwright test",
    args: ["webhook-processing.test.js"],
  },
  journey: {
    description: "Run complete user journey test only",
    command: "npx playwright test",
    args: ["user-journey.test.js"],
  },
  headed: {
    description: "Run all tests in headed mode (visible browser)",
    command: "npx playwright test",
    args: ["--headed"],
  },
  debug: {
    description: "Run tests in debug mode",
    command: "npx playwright test",
    args: ["--debug"],
  },
  chromium: {
    description: "Run tests only in Chromium",
    command: "npx playwright test",
    args: ["--project=chromium"],
  },
  mobile: {
    description: "Run tests only on mobile devices",
    command: "npx playwright test",
    args: ['--project="Mobile Chrome"', '--project="Mobile Safari"'],
  },
};

function showHelp() {
  console.log("\n🎭 PayPal Integration E2E Test Runner\n");
  console.log("Usage: node run-e2e-tests.js [config]\n");
  console.log("Available configurations:\n");

  Object.entries(TEST_CONFIGS).forEach(([key, config]) => {
    console.log(`  ${key.padEnd(12)} - ${config.description}`);
  });

  console.log("\nExamples:");
  console.log("  node run-e2e-tests.js all        # Run all tests");
  console.log("  node run-e2e-tests.js purchase   # Run purchase flow tests");
  console.log("  node run-e2e-tests.js headed     # Run with visible browser");
  console.log("  node run-e2e-tests.js debug      # Run in debug mode");
  console.log("");
}

function runTests(configName) {
  const config = TEST_CONFIGS[configName];

  if (!config) {
    console.error(`❌ Unknown configuration: ${configName}`);
    showHelp();
    process.exit(1);
  }

  console.log(`🚀 Running E2E tests: ${config.description}\n`);

  const args = config.args.length > 0 ? config.args : [];
  const child = spawn("npx", ["playwright", "test", ...args], {
    stdio: "inherit",
    shell: true,
    cwd: path.resolve(__dirname, "../.."),
  });

  child.on("close", (code) => {
    if (code === 0) {
      console.log("\n✅ E2E tests completed successfully!");
    } else {
      console.log(`\n❌ E2E tests failed with exit code ${code}`);
      process.exit(code);
    }
  });

  child.on("error", (error) => {
    console.error("❌ Failed to start test runner:", error);
    process.exit(1);
  });
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
  showHelp();
  process.exit(0);
}

const configName = args[0];
runTests(configName);
