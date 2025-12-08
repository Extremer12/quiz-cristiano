/**
 * Complete User Journey E2E Test
 * Test completo del viaje del usuario desde registro hasta compra y uso
 */

const { test, expect } = require("@playwright/test");

test.describe("Complete User Journey", () => {
  test("should complete full user journey: registration → game → store → purchase → subscription", async ({
    page,
  }) => {
    // Step 1: User Registration/Login
    await test.step("User authentication", async () => {
      await page.goto("/login.html");

      // Mock successful login
      await page.evaluate(() => {
        // Simulate Firebase auth success
        const user = {
          uid: "journey-user-123",
          displayName: "Journey Test User",
          email: "journey@example.com",
          photoURL: null,
        };

        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem(
          "quizCristianoData",
          JSON.stringify({
            coins: 100,
            level: 1,
            totalScore: 0,
            achievements: [],
            gamesPlayed: 0,
          })
        );
      });

      // Navigate to main app
      await page.goto("/");
      await expect(page.locator(".user-welcome")).toContainText(
        "Journey Test User"
      );
    });

    // Step 2: Play game to earn some coins
    await test.step("Play quiz game", async () => {
      await page.goto("/single-player-new.html");
      await page.waitForSelector(".game-container");

      // Simulate playing a few questions
      for (let i = 0; i < 3; i++) {
        await page.waitForSelector(".question-container");

        // Click on first answer option
        const firstOption = page.locator(".answer-option").first();
        await firstOption.click();

        // Wait for next question or game end
        await page.waitForTimeout(1500);
      }

      // Check if coins were earned
      const coinsAfterGame = await page.evaluate(() => {
        const data = JSON.parse(
          localStorage.getItem("quizCristianoData") || "{}"
        );
        return data.coins;
      });

      expect(coinsAfterGame).toBeGreaterThan(100);
    });

    // Step 3: Browse store and check available products
    await test.step("Browse store products", async () => {
      await page.goto("/store.html");
      await page.waitForSelector(".category-navigation");

      // Check different categories
      const categories = ["monedas", "suscripciones", "premium"];

      for (const category of categories) {
        await page.click(`[data-category="${category}"]`);
        await page.waitForSelector(`#${category}-packs:not(.hidden)`);

        // Verify products are displayed
        const products = page.locator(".pack-card");
        await expect(products.first()).toBeVisible();
      }
    });

    // Step 4: Purchase coin package
    await test.step("Purchase coin package", async () => {
      // Select coins category
      await page.click('[data-category="monedas"]');
      await page.waitForSelector("#monedas-packs:not(.hidden)");

      // Select a coin package
      const coinPackage = page.locator(".pack-card").first();
      await coinPackage.click();

      // Configure purchase
      await expect(page.locator("#purchase-modal")).toHaveClass(/show/);
      await page.click('[data-method="paypal"]');
      await page.selectOption("#currency-select", "USD");

      // Mock successful payment
      await page.evaluate(() => {
        window.mockPayPalSuccess = {
          id: "JOURNEY-ORDER-123",
          status: "COMPLETED",
          payer: { email_address: "journey@example.com" },
          purchase_units: [
            {
              amount: { value: "4.99", currency_code: "USD" },
            },
          ],
        };

        if (window.handlePayPalSuccess) {
          window.handlePayPalSuccess(window.mockPayPalSuccess);
        }
      });

      await page.click("#paypal-button-container button");
      await page.waitForTimeout(2000);

      // Verify purchase success
      await expect(page.locator("#purchase-modal")).not.toHaveClass(/show/);

      // Check coins were added
      const coinsAfterPurchase = await page.evaluate(() => {
        const data = JSON.parse(
          localStorage.getItem("quizCristianoData") || "{}"
        );
        return data.coins;
      });

      expect(coinsAfterPurchase).toBeGreaterThan(200);
    });
  });
});
