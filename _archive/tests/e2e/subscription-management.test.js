/**
 * Subscription Management E2E Test
 * Test completo del manejo de suscripciones PayPal
 */

const { test, expect } = require("@playwright/test");

test.describe("Subscription Management", () => {
  test.beforeEach(async ({ page }) => {
    // Setup test user session with existing subscription
    await page.goto("/");

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
          subscription: {
            id: "SUB-123456789",
            status: "ACTIVE",
            plan: "premium-monthly",
            nextBilling: "2024-03-01T00:00:00Z",
          },
        })
      );
    });
  });

  test("should display active subscription in profile", async ({ page }) => {
    await test.step("Navigate to profile page", async () => {
      await page.goto("/perfil.html");
      await expect(page).toHaveTitle(/Perfil/);
    });

    await test.step("Verify subscription section is visible", async () => {
      await page.waitForSelector(".subscription-section");
      await expect(page.locator(".subscription-section")).toBeVisible();
    });

    await test.step("Verify subscription details are displayed", async () => {
      // Check subscription status
      await expect(
        page.locator('[data-testid="subscription-status"]')
      ).toContainText("ACTIVE");

      // Check subscription plan
      await expect(
        page.locator('[data-testid="subscription-plan"]')
      ).toContainText("premium-monthly");

      // Check next billing date
      await expect(page.locator('[data-testid="next-billing"]')).toBeVisible();
    });
  });

  test("should allow subscription cancellation", async ({ page }) => {
    await page.goto("/perfil.html");
    await page.waitForSelector(".subscription-section");

    await test.step("Click cancel subscription button", async () => {
      await page.click('[data-testid="cancel-subscription-btn"]');

      // Verify confirmation modal appears
      await expect(page.locator("#cancel-subscription-modal")).toHaveClass(
        /show/
      );
    });

    await test.step("Confirm cancellation", async () => {
      // Mock successful cancellation API response
      await page.route("**/api/paypal/cancel-subscription", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            subscription: {
              id: "SUB-123456789",
              status: "CANCELLED",
            },
          }),
        });
      });

      await page.click('[data-testid="confirm-cancel-btn"]');

      // Wait for API call and UI update
      await page.waitForTimeout(2000);
    });

    await test.step("Verify subscription status updated", async () => {
      // Check that status changed to cancelled
      await expect(
        page.locator('[data-testid="subscription-status"]')
      ).toContainText("CANCELLED");

      // Verify cancel button is no longer visible
      await expect(
        page.locator('[data-testid="cancel-subscription-btn"]')
      ).not.toBeVisible();

      // Check for cancellation confirmation message
      await expect(page.locator(".success-message")).toContainText(
        "Suscripción cancelada"
      );
    });
  });

  test("should create new subscription from store", async ({ page }) => {
    // Clear existing subscription
    await page.evaluate(() => {
      const data = JSON.parse(
        localStorage.getItem("quizCristianoData") || "{}"
      );
      delete data.subscription;
      localStorage.setItem("quizCristianoData", JSON.stringify(data));
    });

    await test.step("Navigate to store and select subscription", async () => {
      await page.goto("/store.html");
      await page.waitForSelector(".category-navigation");

      // Click on subscriptions category
      await page.click('[data-category="suscripciones"]');
      await page.waitForSelector("#suscripciones-packs:not(.hidden)");

      // Select premium monthly subscription
      const subscriptionPack = page.locator(
        '.pack-card[data-plan="premium-monthly"]'
      );
      await subscriptionPack.click();
    });

    await test.step("Configure subscription payment", async () => {
      // Verify subscription modal opens
      await expect(page.locator("#subscription-modal")).toHaveClass(/show/);

      // Select PayPal payment method
      await page.click('[data-method="paypal"]');
      await page.selectOption("#currency-select", "USD");

      // Verify subscription details
      await expect(page.locator(".subscription-details")).toContainText(
        "Premium Monthly"
      );
      await expect(page.locator(".subscription-price")).toContainText(
        "$9.99/month"
      );
    });

    await test.step("Complete subscription creation", async () => {
      // Mock PayPal subscription creation
      await page.evaluate(() => {
        window.mockPayPalSubscription = {
          id: "SUB-NEW-123456",
          status: "ACTIVE",
          plan_id: "premium-monthly",
          subscriber: {
            email_address: "test@example.com",
          },
        };

        if (window.handleSubscriptionSuccess) {
          window.handleSubscriptionSuccess(window.mockPayPalSubscription);
        }
      });

      await page.click("#paypal-subscription-button");
      await page.waitForTimeout(2000);
    });

    await test.step("Verify subscription was created", async () => {
      // Check that modal closed
      await expect(page.locator("#subscription-modal")).not.toHaveClass(/show/);

      // Verify success message
      await expect(page.locator(".success-message")).toContainText(
        "Suscripción activada"
      );

      // Check localStorage was updated
      const subscriptionData = await page.evaluate(() => {
        const data = JSON.parse(
          localStorage.getItem("quizCristianoData") || "{}"
        );
        return data.subscription;
      });

      expect(subscriptionData).toBeTruthy();
      expect(subscriptionData.status).toBe("ACTIVE");
    });
  });

  test("should handle subscription payment failures", async ({ page }) => {
    await page.goto("/store.html");
    await page.waitForSelector(".category-navigation");
    await page.click('[data-category="suscripciones"]');
    await page.waitForSelector("#suscripciones-packs:not(.hidden)");

    const subscriptionPack = page.locator(
      '.pack-card[data-plan="premium-monthly"]'
    );
    await subscriptionPack.click();

    await page.click('[data-method="paypal"]');
    await page.selectOption("#currency-select", "USD");

    await test.step("Simulate subscription creation failure", async () => {
      // Mock PayPal subscription error
      await page.evaluate(() => {
        window.mockPayPalSubscriptionError = {
          name: "SUBSCRIPTION_ERROR",
          message: "Failed to create subscription",
        };

        if (window.handleSubscriptionError) {
          window.handleSubscriptionError(window.mockPayPalSubscriptionError);
        }
      });

      await page.click("#paypal-subscription-button");
      await page.waitForTimeout(1000);
    });

    await test.step("Verify error handling", async () => {
      // Modal should remain open
      await expect(page.locator("#subscription-modal")).toHaveClass(/show/);

      // Error message should be displayed
      await expect(page.locator(".error-message")).toContainText(
        "Error al crear la suscripción"
      );

      // No subscription should be saved
      const subscriptionData = await page.evaluate(() => {
        const data = JSON.parse(
          localStorage.getItem("quizCristianoData") || "{}"
        );
        return data.subscription;
      });

      expect(subscriptionData).toBeFalsy();
    });
  });

  test("should display payment history for subscriptions", async ({ page }) => {
    // Add payment history to localStorage
    await page.evaluate(() => {
      localStorage.setItem(
        "paymentHistory",
        JSON.stringify([
          {
            id: "PAY-123",
            type: "subscription",
            amount: 9.99,
            currency: "USD",
            date: "2024-02-01T10:00:00Z",
            status: "completed",
            subscription_id: "SUB-123456789",
          },
          {
            id: "PAY-124",
            type: "subscription",
            amount: 9.99,
            currency: "USD",
            date: "2024-01-01T10:00:00Z",
            status: "completed",
            subscription_id: "SUB-123456789",
          },
        ])
      );
    });

    await test.step("Navigate to profile and view payment history", async () => {
      await page.goto("/perfil.html");
      await page.waitForSelector(".payment-history-section");

      // Click on payment history tab
      await page.click('[data-tab="payment-history"]');
    });

    await test.step("Verify subscription payments are displayed", async () => {
      // Check that subscription payments are shown
      const subscriptionPayments = page.locator(
        '.payment-item[data-type="subscription"]'
      );
      await expect(subscriptionPayments).toHaveCount(2);

      // Verify payment details
      await expect(subscriptionPayments.first()).toContainText("$9.99");
      await expect(subscriptionPayments.first()).toContainText("completed");
      await expect(subscriptionPayments.first()).toContainText("subscription");
    });

    await test.step("Filter by subscription payments", async () => {
      // Apply subscription filter
      await page.selectOption("#payment-type-filter", "subscription");

      // Verify only subscription payments are shown
      const visiblePayments = page.locator(".payment-item:visible");
      await expect(visiblePayments).toHaveCount(2);

      // All visible payments should be subscription type
      const paymentTypes = await visiblePayments.evaluateAll((elements) =>
        elements.map((el) => el.getAttribute("data-type"))
      );

      expect(
        paymentTypes.every((type) => type === "subscription")
      ).toBeTruthy();
    });
  });
});
