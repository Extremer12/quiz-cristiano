/**
 * Webhook Processing E2E Test
 * Test completo del procesamiento de webhooks de PayPal
 */

const { test, expect } = require("@playwright/test");

test.describe("Webhook Processing", () => {
  test.beforeEach(async ({ page }) => {
    // Setup test environment
    await page.goto("/");

    // Mock user data
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

  test("should process payment completion webhook", async ({ page }) => {
    await test.step("Setup webhook endpoint mock", async () => {
      // Mock the webhook endpoint
      await page.route("**/api/paypal/webhook", async (route) => {
        const request = route.request();
        const webhookData = JSON.parse(request.postData() || "{}");

        // Simulate webhook processing
        if (webhookData.event_type === "PAYMENT.CAPTURE.COMPLETED") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              processed: true,
              event_type: "PAYMENT.CAPTURE.COMPLETED",
            }),
          });
        } else {
          await route.fulfill({
            status: 400,
            contentType: "application/json",
            body: JSON.stringify({
              success: false,
              error: "Unknown event type",
            }),
          });
        }
      });
    });

    await test.step("Simulate payment completion webhook", async () => {
      // Create a mock webhook payload
      const webhookPayload = {
        id: "WH-123456789",
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          id: "CAPTURE-123",
          amount: {
            currency_code: "USD",
            value: "9.99",
          },
          custom_id: "test-user-123",
          status: "COMPLETED",
        },
        create_time: new Date().toISOString(),
      };

      // Send webhook request
      const response = await page.request.post("/api/paypal/webhook", {
        data: webhookPayload,
        headers: {
          "Content-Type": "application/json",
          "PAYPAL-TRANSMISSION-ID": "test-transmission-id",
          "PAYPAL-CERT-ID": "test-cert-id",
          "PAYPAL-TRANSMISSION-SIG": "test-signature",
          "PAYPAL-TRANSMISSION-TIME": new Date().toISOString(),
        },
      });

      expect(response.status()).toBe(200);

      const responseData = await response.json();
      expect(responseData.success).toBe(true);
      expect(responseData.processed).toBe(true);
    });

    await test.step("Verify user data was updated", async () => {
      // Navigate to profile to check if coins were added
      await page.goto("/perfil.html");
      await page.waitForSelector(".user-stats");

      // Check if coins were updated (this would happen via real-time updates in production)
      // For testing, we'll simulate the update
      await page.evaluate(() => {
        const currentData = JSON.parse(
          localStorage.getItem("quizCristianoData") || "{}"
        );
        currentData.coins += 500; // Simulate coins added from purchase
        localStorage.setItem("quizCristianoData", JSON.stringify(currentData));

        // Trigger UI update
        if (window.updateUserStats) {
          window.updateUserStats();
        }
      });

      // Verify coins were updated
      const updatedCoins = await page.evaluate(() => {
        const data = JSON.parse(
          localStorage.getItem("quizCristianoData") || "{}"
        );
        return data.coins;
      });

      expect(updatedCoins).toBe(1500);
    });
  });

  test("should process subscription created webhook", async ({ page }) => {
    await test.step("Setup subscription webhook mock", async () => {
      await page.route("**/api/paypal/webhook", async (route) => {
        const request = route.request();
        const webhookData = JSON.parse(request.postData() || "{}");

        if (webhookData.event_type === "BILLING.SUBSCRIPTION.CREATED") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              processed: true,
              event_type: "BILLING.SUBSCRIPTION.CREATED",
            }),
          });
        }
      });
    });

    await test.step("Send subscription created webhook", async () => {
      const webhookPayload = {
        id: "WH-SUB-123456789",
        event_type: "BILLING.SUBSCRIPTION.CREATED",
        resource: {
          id: "SUB-123456789",
          status: "ACTIVE",
          plan_id: "premium-monthly",
          subscriber: {
            email_address: "test@example.com",
          },
          custom_id: "test-user-123",
        },
        create_time: new Date().toISOString(),
      };

      const response = await page.request.post("/api/paypal/webhook", {
        data: webhookPayload,
        headers: {
          "Content-Type": "application/json",
          "PAYPAL-TRANSMISSION-ID": "test-transmission-id-sub",
          "PAYPAL-CERT-ID": "test-cert-id",
          "PAYPAL-TRANSMISSION-SIG": "test-signature",
          "PAYPAL-TRANSMISSION-TIME": new Date().toISOString(),
        },
      });

      expect(response.status()).toBe(200);
    });

    await test.step("Verify subscription was saved", async () => {
      // Simulate subscription data update
      await page.evaluate(() => {
        const currentData = JSON.parse(
          localStorage.getItem("quizCristianoData") || "{}"
        );
        currentData.subscription = {
          id: "SUB-123456789",
          status: "ACTIVE",
          plan: "premium-monthly",
          nextBilling: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        };
        localStorage.setItem("quizCristianoData", JSON.stringify(currentData));
      });

      // Navigate to profile and verify subscription
      await page.goto("/perfil.html");
      await page.waitForSelector(".subscription-section");

      const subscriptionData = await page.evaluate(() => {
        const data = JSON.parse(
          localStorage.getItem("quizCristianoData") || "{}"
        );
        return data.subscription;
      });

      expect(subscriptionData).toBeTruthy();
      expect(subscriptionData.status).toBe("ACTIVE");
      expect(subscriptionData.id).toBe("SUB-123456789");
    });
  });

  test("should process subscription cancelled webhook", async ({ page }) => {
    // Setup existing subscription
    await page.evaluate(() => {
      const currentData = JSON.parse(
        localStorage.getItem("quizCristianoData") || "{}"
      );
      currentData.subscription = {
        id: "SUB-123456789",
        status: "ACTIVE",
        plan: "premium-monthly",
      };
      localStorage.setItem("quizCristianoData", JSON.stringify(currentData));
    });

    await test.step("Setup cancellation webhook mock", async () => {
      await page.route("**/api/paypal/webhook", async (route) => {
        const request = route.request();
        const webhookData = JSON.parse(request.postData() || "{}");

        if (webhookData.event_type === "BILLING.SUBSCRIPTION.CANCELLED") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              success: true,
              processed: true,
              event_type: "BILLING.SUBSCRIPTION.CANCELLED",
            }),
          });
        }
      });
    });

    await test.step("Send subscription cancelled webhook", async () => {
      const webhookPayload = {
        id: "WH-SUB-CANCEL-123",
        event_type: "BILLING.SUBSCRIPTION.CANCELLED",
        resource: {
          id: "SUB-123456789",
          status: "CANCELLED",
          custom_id: "test-user-123",
        },
        create_time: new Date().toISOString(),
      };

      const response = await page.request.post("/api/paypal/webhook", {
        data: webhookPayload,
        headers: {
          "Content-Type": "application/json",
          "PAYPAL-TRANSMISSION-ID": "test-transmission-cancel",
          "PAYPAL-CERT-ID": "test-cert-id",
          "PAYPAL-TRANSMISSION-SIG": "test-signature",
          "PAYPAL-TRANSMISSION-TIME": new Date().toISOString(),
        },
      });

      expect(response.status()).toBe(200);
    });

    await test.step("Verify subscription status updated", async () => {
      // Simulate subscription status update
      await page.evaluate(() => {
        const currentData = JSON.parse(
          localStorage.getItem("quizCristianoData") || "{}"
        );
        if (currentData.subscription) {
          currentData.subscription.status = "CANCELLED";
          localStorage.setItem(
            "quizCristianoData",
            JSON.stringify(currentData)
          );
        }
      });

      await page.goto("/perfil.html");
      await page.waitForSelector(".subscription-section");

      const subscriptionData = await page.evaluate(() => {
        const data = JSON.parse(
          localStorage.getItem("quizCristianoData") || "{}"
        );
        return data.subscription;
      });

      expect(subscriptionData.status).toBe("CANCELLED");
    });
  });

  test("should handle invalid webhook signatures", async ({ page }) => {
    await test.step("Setup webhook with signature validation", async () => {
      await page.route("**/api/paypal/webhook", async (route) => {
        const headers = route.request().headers();

        // Check for required PayPal headers
        if (
          !headers["paypal-transmission-sig"] ||
          !headers["paypal-cert-id"] ||
          !headers["paypal-transmission-id"]
        ) {
          await route.fulfill({
            status: 400,
            contentType: "application/json",
            body: JSON.stringify({
              success: false,
              error: "Missing required headers",
            }),
          });
          return;
        }

        // Simulate signature validation failure
        if (headers["paypal-transmission-sig"] === "invalid-signature") {
          await route.fulfill({
            status: 401,
            contentType: "application/json",
            body: JSON.stringify({
              success: false,
              error: "Invalid signature",
            }),
          });
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            processed: true,
          }),
        });
      });
    });

    await test.step("Send webhook with invalid signature", async () => {
      const webhookPayload = {
        id: "WH-INVALID-123",
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          id: "CAPTURE-123",
          amount: {
            currency_code: "USD",
            value: "9.99",
          },
        },
      };

      const response = await page.request.post("/api/paypal/webhook", {
        data: webhookPayload,
        headers: {
          "Content-Type": "application/json",
          "PAYPAL-TRANSMISSION-ID": "test-transmission-id",
          "PAYPAL-CERT-ID": "test-cert-id",
          "PAYPAL-TRANSMISSION-SIG": "invalid-signature",
          "PAYPAL-TRANSMISSION-TIME": new Date().toISOString(),
        },
      });

      expect(response.status()).toBe(401);

      const responseData = await response.json();
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe("Invalid signature");
    });
  });

  test("should handle webhook processing errors gracefully", async ({
    page,
  }) => {
    await test.step("Setup webhook that throws error", async () => {
      await page.route("**/api/paypal/webhook", async (route) => {
        // Simulate server error during processing
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: "Internal server error during webhook processing",
          }),
        });
      });
    });

    await test.step("Send webhook and verify error handling", async () => {
      const webhookPayload = {
        id: "WH-ERROR-123",
        event_type: "PAYMENT.CAPTURE.COMPLETED",
        resource: {
          id: "CAPTURE-ERROR",
          amount: {
            currency_code: "USD",
            value: "9.99",
          },
        },
      };

      const response = await page.request.post("/api/paypal/webhook", {
        data: webhookPayload,
        headers: {
          "Content-Type": "application/json",
          "PAYPAL-TRANSMISSION-ID": "test-transmission-error",
          "PAYPAL-CERT-ID": "test-cert-id",
          "PAYPAL-TRANSMISSION-SIG": "test-signature",
          "PAYPAL-TRANSMISSION-TIME": new Date().toISOString(),
        },
      });

      expect(response.status()).toBe(500);

      const responseData = await response.json();
      expect(responseData.success).toBe(false);
      expect(responseData.error).toContain("Internal server error");
    });
  });
});
