/**
 * Complete Purchase Flow E2E Test
 * Test completo del flujo de compra desde navegación hasta confirmación
 */

const { test, expect } = require("@playwright/test");

test.describe("Complete Purchase Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Setup test user session
    await page.goto("/");

    // Mock user authentication if needed
    await page.evaluate(() => {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          uid: "test-user-123",
          displayName: "Test User",
          email: "test@example.com",
        })
      );

      localStorage.setItem(
        "quizCristianoData",
        JSON.stringify({
          coins: 1000,
          level: 5,
          totalScore: 2500,
        })
      );
    });
  });

  test("should complete full purchase flow: navigation → selection → cart → payment → confirmation", async ({
    page,
  }) => {
    // Step 1: Navigate to store
    await test.step("Navigate to store", async () => {
      await page.goto("/store.html");
      await expect(page).toHaveTitle(/Tienda/);
      await expect(page.locator(".store-header h1")).toContainText("Tienda");
    });

    // Step 2: Browse products and select category
    await test.step("Browse and select product category", async () => {
      // Wait for store to load
      await page.waitForSelector(".category-navigation");

      // Click on coins category
      await page.click('[data-category="monedas"]');
      await expect(page.locator('[data-category="monedas"]')).toHaveClass(
        /active/
      );

      // Wait for products to load
      await page.waitForSelector("#monedas-packs:not(.hidden)", {
        timeout: 10000,
      });
    });

    // Step 3: Select a product
    await test.step("Select a coin package", async () => {
      // Look for coin packages
      const coinPackage = page.locator(".pack-card").first();
      await expect(coinPackage).toBeVisible();

      // Click on the first coin package
      await coinPackage.click();

      // Verify purchase modal opens
      await expect(page.locator("#purchase-modal")).toHaveClass(/show/);
      await expect(page.locator(".modal-header h3")).toContainText(
        "Confirmar Compra"
      );
    });

    // Step 4: Select payment method
    await test.step("Select PayPal payment method", async () => {
      // Select PayPal payment method
      await page.click('[data-method="paypal"]');
      await expect(page.locator('[data-method="paypal"]')).toHaveClass(
        /selected/
      );

      // Verify PayPal container becomes visible
      await expect(page.locator("#paypal-button-container")).toBeVisible();
    });

    // Step 5: Currency selection
    await test.step("Select currency", async () => {
      // Select USD currency
      await page.selectOption("#currency-select", "USD");

      // Verify currency was selected
      const selectedCurrency = await page
        .locator("#currency-select")
        .inputValue();
      expect(selectedCurrency).toBe("USD");
    });

    // Step 6: Mock PayPal payment flow
    await test.step("Complete PayPal payment flow", async () => {
      // In a real test, this would interact with PayPal sandbox
      // For now, we'll mock the successful payment response

      // Mock PayPal SDK response
      await page.evaluate(() => {
        // Simulate successful PayPal payment
        window.mockPayPalSuccess = {
          id: "PAYPAL-ORDER-123",
          status: "COMPLETED",
          payer: {
            email_address: "test@example.com",
          },
          purchase_units: [
            {
              amount: {
                value: "9.99",
                currency_code: "USD",
              },
            },
          ],
        };

        // Trigger payment success callback
        if (window.handlePayPalSuccess) {
          window.handlePayPalSuccess(window.mockPayPalSuccess);
        }
      });

      // Simulate clicking PayPal button and successful payment
      // This would normally redirect to PayPal and back
      await page.click("#paypal-button-container button");
    });

    // Step 7: Verify payment confirmation
    await test.step("Verify payment confirmation", async () => {
      // Wait for success message or redirect
      await page.waitForTimeout(2000);

      // Check for success indicators
      const successElements = [
        ".payment-success",
        ".success-message",
        '[data-testid="payment-success"]',
      ];

      let successFound = false;
      for (const selector of successElements) {
        const element = page.locator(selector);
        if (await element.isVisible().catch(() => false)) {
          successFound = true;
          break;
        }
      }

      // If no specific success element, check for modal closure
      if (!successFound) {
        await expect(page.locator("#purchase-modal")).not.toHaveClass(/show/);
      }
    });

    // Step 8: Verify user data update
    await test.step("Verify user coins were updated", async () => {
      // Check if user coins were updated
      const updatedCoins = await page.evaluate(() => {
        const data = JSON.parse(
          localStorage.getItem("quizCristianoData") || "{}"
        );
        return data.coins;
      });

      // Verify coins were added (assuming the pack adds coins)
      expect(updatedCoins).toBeGreaterThan(1000);
    });
  });

  test("should handle payment cancellation gracefully", async ({ page }) => {
    // Navigate to store and select product
    await page.goto("/store.html");
    await page.waitForSelector(".category-navigation");
    await page.click('[data-category="monedas"]');
    await page.waitForSelector("#monedas-packs:not(.hidden)");

    const coinPackage = page.locator(".pack-card").first();
    await coinPackage.click();

    // Select PayPal payment method
    await page.click('[data-method="paypal"]');
    await page.selectOption("#currency-select", "USD");

    // Mock PayPal cancellation
    await page.evaluate(() => {
      window.mockPayPalCancel = true;
      if (window.handlePayPalCancel) {
        window.handlePayPalCancel();
      }
    });

    // Verify modal remains open and shows appropriate message
    await expect(page.locator("#purchase-modal")).toHaveClass(/show/);

    // Check for cancellation message or error state
    const errorElements = [
      ".payment-error",
      ".error-message",
      '[data-testid="payment-cancelled"]',
    ];

    let errorFound = false;
    for (const selector of errorElements) {
      const element = page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        errorFound = true;
        break;
      }
    }

    // At minimum, modal should still be visible
    expect(
      errorFound || (await page.locator("#purchase-modal").isVisible())
    ).toBeTruthy();
  });

  test("should handle payment errors appropriately", async ({ page }) => {
    // Navigate to store and select product
    await page.goto("/store.html");
    await page.waitForSelector(".category-navigation");
    await page.click('[data-category="monedas"]');
    await page.waitForSelector("#monedas-packs:not(.hidden)");

    const coinPackage = page.locator(".pack-card").first();
    await coinPackage.click();

    // Select PayPal payment method
    await page.click('[data-method="paypal"]');
    await page.selectOption("#currency-select", "USD");

    // Mock PayPal error
    await page.evaluate(() => {
      window.mockPayPalError = {
        name: "PAYMENT_ERROR",
        message: "Payment processing failed",
      };

      if (window.handlePayPalError) {
        window.handlePayPalError(window.mockPayPalError);
      }
    });

    // Verify error handling
    await page.waitForTimeout(1000);

    // Check for error message display
    const errorElements = [
      ".payment-error",
      ".error-message",
      '[data-testid="payment-error"]',
    ];

    let errorFound = false;
    for (const selector of errorElements) {
      const element = page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        errorFound = true;
        break;
      }
    }

    // Modal should remain open on error
    await expect(page.locator("#purchase-modal")).toHaveClass(/show/);
    expect(errorFound).toBeTruthy();
  });
});
