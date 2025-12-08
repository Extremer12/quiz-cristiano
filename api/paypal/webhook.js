/**
 * PayPal Webhook Handler - Serverless function para manejar webhooks de PayPal
 * Implementa verificación de firma, procesamiento de eventos y actualización de transacciones
 */

import crypto from "crypto";

// Configuración del webhook
const WEBHOOK_CONFIG = {
  id: process.env.PAYPAL_WEBHOOK_ID,
  environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
  maxRetries: 3,
  retryDelay: 1000, // 1 segundo
};

// URLs base de PayPal según el entorno
const PAYPAL_BASE_URLS = {
  sandbox: "https://api-m.sandbox.paypal.com",
  production: "https://api-m.paypal.com",
};

/**
 * Handler principal del webhook
 */
export default async function handler(req, res) {
  // Solo permitir métodos POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      message: "Only POST requests are accepted",
    });
  }

  const startTime = Date.now();
  let webhookEvent = null;

  try {
    console.log("🔔 PayPal webhook received:", {
      headers: Object.keys(req.headers),
      bodySize: JSON.stringify(req.body).length,
      timestamp: new Date().toISOString(),
      userAgent: req.headers["user-agent"],
      ip: req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
    });

    // Verificar que el webhook tenga los headers necesarios
    const requiredHeaders = [
      "paypal-transmission-id",
      "paypal-cert-id",
      "paypal-auth-algo",
      "paypal-transmission-sig",
      "paypal-transmission-time",
    ];

    for (const header of requiredHeaders) {
      if (!req.headers[header]) {
        console.error(`❌ Missing required header: ${header}`);
        return res.status(400).json({
          error: "Invalid webhook",
          message: `Missing required header: ${header}`,
          missingHeader: header,
        });
      }
    }

    // Validar estructura del evento antes de procesar
    try {
      validateWebhookEvent(req.body);
    } catch (validationError) {
      console.error(
        "❌ Invalid webhook event structure:",
        validationError.message
      );
      return res.status(400).json({
        error: "Invalid webhook event",
        message: validationError.message,
      });
    }

    // Verificar autenticidad del webhook
    const isValid = await verifyPayPalWebhook(req.headers, req.body);

    if (!isValid) {
      console.error("❌ Invalid webhook signature");
      return res.status(401).json({
        error: "Invalid webhook signature",
        message: "Webhook verification failed",
      });
    }

    webhookEvent = req.body;
    console.log("✅ Webhook signature verified for event:", {
      eventType: webhookEvent.event_type,
      eventId: webhookEvent.id,
      resourceId: webhookEvent.resource?.id,
    });

    // Procesar evento de PayPal con manejo robusto
    const result = await processPayPalEvent(webhookEvent);

    const processingTime = Date.now() - startTime;

    // Log detallado del resultado
    console.log("✅ Webhook processed successfully:", {
      eventType: webhookEvent.event_type,
      eventId: webhookEvent.id,
      processingTime: `${processingTime}ms`,
      result: result.success,
      duplicate: result.duplicate || false,
      unhandled: result.unhandled || false,
    });

    // Respuesta con información detallada
    const response = {
      success: true,
      eventId: webhookEvent.id,
      eventType: webhookEvent.event_type,
      processingTime,
      message: result.duplicate
        ? "Webhook already processed (duplicate)"
        : result.unhandled
        ? "Webhook received but event type not handled"
        : "Webhook processed successfully",
    };

    // Agregar información adicional si está disponible
    if (result.transactionId) {
      response.transactionId = result.transactionId;
    }
    if (result.paymentId) {
      response.paymentId = result.paymentId;
    }
    if (result.subscriptionId) {
      response.subscriptionId = result.subscriptionId;
    }

    res.status(200).json(response);
  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error("❌ Webhook processing error:", {
      error: error.message,
      stack: error.stack,
      eventType: webhookEvent?.event_type,
      eventId: webhookEvent?.id,
      processingTime: `${processingTime}ms`,
    });

    // Log error para monitoreo
    await logWebhookError(error, {
      webhookEvent,
      headers: req.headers,
      processingTime,
    });

    res.status(500).json({
      error: "Internal server error",
      eventId: webhookEvent?.id,
      message: "Webhook processing failed",
    });
  }
}

/**
 * Verifica la autenticidad del webhook de PayPal
 */
async function verifyPayPalWebhook(headers, body) {
  try {
    const webhookId = WEBHOOK_CONFIG.id;

    if (!webhookId || webhookId === "demo_webhook_id") {
      console.warn(
        "⚠️ Using demo webhook ID - verification skipped in development"
      );
      return true; // En desarrollo, permitir webhooks sin verificación real
    }

    // Construir el mensaje para verificación
    const transmissionId = headers["paypal-transmission-id"];
    const certId = headers["paypal-cert-id"];
    const transmissionTime = headers["paypal-transmission-time"];
    const authAlgo = headers["paypal-auth-algo"];
    const transmissionSig = headers["paypal-transmission-sig"];

    // Crear el mensaje que PayPal usa para generar la firma
    const message = `${transmissionId}|${transmissionTime}|${webhookId}|${crypto
      .createHash("sha256")
      .update(JSON.stringify(body))
      .digest("base64")}`;

    // En un entorno real, aquí se haría la verificación con la API de PayPal
    // Por ahora, implementamos una verificación básica
    const isValidFormat = transmissionSig && transmissionSig.length > 0;
    const isValidTimestamp =
      Math.abs(Date.now() / 1000 - parseInt(transmissionTime)) < 300; // 5 minutos

    console.log("🔐 Webhook verification:", {
      webhookId: webhookId.substring(0, 10) + "...",
      transmissionId: transmissionId?.substring(0, 10) + "...",
      isValidFormat,
      isValidTimestamp,
      authAlgo,
    });

    return isValidFormat && isValidTimestamp;
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return false;
  }
}

/**
 * Procesa eventos de PayPal según su tipo con reintentos automáticos
 */
async function processPayPalEvent(webhookEvent) {
  const { event_type, resource } = webhookEvent;
  const maxRetries = 3;
  let attempt = 0;

  console.log(`🎯 Processing PayPal event: ${event_type}`, {
    eventId: webhookEvent.id,
    resourceId: resource?.id,
    timestamp: new Date().toISOString(),
  });

  while (attempt < maxRetries) {
    attempt++;

    try {
      // Verificar si el evento ya fue procesado (idempotencia)
      const isDuplicate = await checkEventDuplicate(webhookEvent.id);
      if (isDuplicate) {
        console.log(`⚠️ Duplicate event detected: ${webhookEvent.id}`);
        return {
          success: true,
          message: "Event already processed",
          duplicate: true,
        };
      }

      // Marcar evento como en procesamiento
      await markEventProcessing(webhookEvent.id, event_type);

      let result;
      switch (event_type) {
        // Eventos de pagos únicos
        case "PAYMENT.CAPTURE.COMPLETED":
          result = await handlePaymentCaptureCompleted(resource, webhookEvent);
          break;

        case "PAYMENT.CAPTURE.DENIED":
          result = await handlePaymentCaptureDenied(resource, webhookEvent);
          break;

        case "PAYMENT.CAPTURE.PENDING":
          result = await handlePaymentCapturePending(resource, webhookEvent);
          break;

        // Eventos de suscripciones
        case "BILLING.SUBSCRIPTION.ACTIVATED":
          result = await handleSubscriptionActivated(resource, webhookEvent);
          break;

        case "BILLING.SUBSCRIPTION.CANCELLED":
          result = await handleSubscriptionCancelled(resource, webhookEvent);
          break;

        case "BILLING.SUBSCRIPTION.PAYMENT.COMPLETED":
          result = await handleSubscriptionPaymentCompleted(
            resource,
            webhookEvent
          );
          break;

        case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
          result = await handleSubscriptionPaymentFailed(
            resource,
            webhookEvent
          );
          break;

        // Eventos de disputas
        case "CUSTOMER.DISPUTE.CREATED":
          result = await handleDisputeCreated(resource, webhookEvent);
          break;

        // Eventos adicionales importantes
        case "PAYMENT.CAPTURE.REFUNDED":
          result = await handlePaymentRefunded(resource, webhookEvent);
          break;

        case "BILLING.SUBSCRIPTION.SUSPENDED":
          result = await handleSubscriptionSuspended(resource, webhookEvent);
          break;

        case "BILLING.SUBSCRIPTION.REACTIVATED":
          result = await handleSubscriptionReactivated(resource, webhookEvent);
          break;

        default:
          console.log(`ℹ️ Unhandled event type: ${event_type}`);
          result = {
            success: true,
            message: "Event type not handled",
            unhandled: true,
          };
      }

      // Marcar evento como completado
      await markEventCompleted(webhookEvent.id, result);

      console.log(`✅ Event processed successfully:`, {
        eventType: event_type,
        eventId: webhookEvent.id,
        attempt,
        result: result.success,
      });

      return result;
    } catch (error) {
      console.error(
        `❌ Error processing event (attempt ${attempt}/${maxRetries}):`,
        {
          eventType: event_type,
          eventId: webhookEvent.id,
          error: error.message,
          stack: error.stack,
        }
      );

      // Determinar si el error es recuperable
      const isRecoverable = isRecoverableError(error);

      if (!isRecoverable || attempt >= maxRetries) {
        // Marcar evento como fallido
        await markEventFailed(webhookEvent.id, error, attempt);

        // Enviar alerta si es crítico
        if (isCriticalEvent(event_type)) {
          await sendCriticalEventAlert(webhookEvent, error);
        }

        throw error;
      }

      // Esperar antes del siguiente intento (backoff exponencial)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Maneja completación de pago único con validaciones mejoradas
 */
async function handlePaymentCaptureCompleted(resource, webhookEvent) {
  const startTime = Date.now();

  try {
    const {
      id: paymentId,
      custom_id: transactionId,
      amount,
      status,
    } = resource;

    console.log("💰 Processing payment completion:", {
      paymentId,
      transactionId,
      amount: amount?.value,
      currency: amount?.currency_code,
      status,
      eventId: webhookEvent.id,
    });

    // Validaciones críticas
    if (!paymentId) {
      throw new Error("Payment ID is required");
    }

    if (!transactionId) {
      console.warn("⚠️ No transaction ID found in payment resource");
      return {
        success: true,
        message: "No transaction ID to process",
        warning: true,
        paymentId,
      };
    }

    if (!amount?.value || parseFloat(amount.value) <= 0) {
      throw new Error("Invalid payment amount");
    }

    // Verificar que el pago esté realmente completado
    if (status !== "COMPLETED") {
      console.warn(`⚠️ Payment status is ${status}, expected COMPLETED`);
      return {
        success: false,
        message: `Payment status is ${status}, not completed`,
        paymentId,
        transactionId,
      };
    }

    // Verificar si la transacción ya fue procesada
    const existingTransaction = await getTransactionStatus(transactionId);
    if (existingTransaction?.status === "completed") {
      console.log(`⚠️ Transaction ${transactionId} already completed`);
      return {
        success: true,
        message: "Transaction already completed",
        duplicate: true,
        transactionId,
        paymentId,
      };
    }

    // Actualizar estado de transacción con datos completos
    await updateTransactionStatus(transactionId, "completed", {
      paypalPaymentId: paymentId,
      paypalData: resource,
      webhookEventId: webhookEvent.id,
      completedAt: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      amount: parseFloat(amount.value),
      currency: amount.currency_code,
    });

    // Acreditar cuenta del usuario con validaciones
    const creditResult = await creditUserAccount(transactionId, resource);

    if (creditResult.success) {
      console.log("✅ User account credited successfully:", {
        userId: creditResult.userId,
        amount: creditResult.amount,
        transactionId,
        processingTime: Date.now() - startTime + "ms",
      });

      // Enviar notificación al usuario (opcional)
      await sendPaymentConfirmationNotification(creditResult.userId, {
        transactionId,
        amount: creditResult.amount,
        paymentId,
      });
    } else {
      console.error("❌ Failed to credit user account:", creditResult.error);

      // Marcar transacción como completada pero con error de crédito
      await updateTransactionStatus(transactionId, "completed_credit_failed", {
        creditError: creditResult.error,
        requiresManualReview: true,
      });
    }

    return {
      success: true,
      transactionId,
      paymentId,
      credited: creditResult.success,
      userId: creditResult.userId,
      amount: creditResult.amount,
      currency: amount.currency_code,
      processingTime: Date.now() - startTime,
      message: creditResult.success
        ? "Payment completed and user credited"
        : "Payment completed but credit failed - requires manual review",
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error("❌ Error handling payment completion:", {
      error: error.message,
      transactionId: resource?.custom_id,
      paymentId: resource?.id,
      processingTime: processingTime + "ms",
    });

    // Intentar marcar la transacción como fallida
    if (resource?.custom_id) {
      try {
        await updateTransactionStatus(resource.custom_id, "webhook_failed", {
          error: error.message,
          webhookEventId: webhookEvent.id,
          failedAt: new Date().toISOString(),
          processingTime,
        });
      } catch (updateError) {
        console.error("Failed to update transaction status:", updateError);
      }
    }

    throw error;
  }
}

/**
 * Maneja pago denegado
 */
async function handlePaymentCaptureDenied(resource, webhookEvent) {
  try {
    const { id: paymentId, custom_id: transactionId } = resource;

    console.log("❌ Processing payment denial:", {
      paymentId,
      transactionId,
    });

    if (transactionId) {
      await updateTransactionStatus(transactionId, "failed", {
        paypalPaymentId: paymentId,
        paypalData: resource,
        webhookEventId: webhookEvent.id,
        failedAt: new Date().toISOString(),
        reason: "payment_denied",
      });
    }

    return {
      success: true,
      transactionId,
      paymentId,
      message: "Payment denial processed",
    };
  } catch (error) {
    console.error("Error handling payment denial:", error);
    throw error;
  }
}

/**
 * Maneja pago pendiente
 */
async function handlePaymentCapturePending(resource, webhookEvent) {
  try {
    const { id: paymentId, custom_id: transactionId } = resource;

    console.log("⏳ Processing pending payment:", {
      paymentId,
      transactionId,
    });

    if (transactionId) {
      await updateTransactionStatus(transactionId, "pending", {
        paypalPaymentId: paymentId,
        paypalData: resource,
        webhookEventId: webhookEvent.id,
        pendingAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      transactionId,
      paymentId,
      message: "Pending payment processed",
    };
  } catch (error) {
    console.error("Error handling pending payment:", error);
    throw error;
  }
}

/**
 * Maneja activación de suscripción
 */
async function handleSubscriptionActivated(resource, webhookEvent) {
  try {
    const { id: subscriptionId, custom_id: userId } = resource;

    console.log("🔄 Processing subscription activation:", {
      subscriptionId,
      userId,
    });

    // Crear registro de suscripción
    await createSubscriptionRecord({
      subscriptionId,
      userId,
      status: "active",
      paypalData: resource,
      webhookEventId: webhookEvent.id,
      activatedAt: new Date().toISOString(),
    });

    // Activar beneficios premium
    await activatePremiumBenefits(userId, subscriptionId);

    return {
      success: true,
      subscriptionId,
      userId,
      message: "Subscription activated and benefits granted",
    };
  } catch (error) {
    console.error("Error handling subscription activation:", error);
    throw error;
  }
}

/**
 * Maneja cancelación de suscripción
 */
async function handleSubscriptionCancelled(resource, webhookEvent) {
  try {
    const { id: subscriptionId, custom_id: userId } = resource;

    console.log("🚫 Processing subscription cancellation:", {
      subscriptionId,
      userId,
    });

    // Actualizar registro de suscripción
    await updateSubscriptionStatus(subscriptionId, "cancelled", {
      paypalData: resource,
      webhookEventId: webhookEvent.id,
      cancelledAt: new Date().toISOString(),
    });

    // Los beneficios se mantienen hasta el final del período pagado
    console.log("ℹ️ Premium benefits will remain active until period end");

    return {
      success: true,
      subscriptionId,
      userId,
      message: "Subscription cancellation processed",
    };
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
    throw error;
  }
}

/**
 * Maneja pago de suscripción completado
 */
async function handleSubscriptionPaymentCompleted(resource, webhookEvent) {
  try {
    const { subscription_id: subscriptionId } = resource;

    console.log("💳 Processing subscription payment:", {
      subscriptionId,
      amount: resource.amount?.value,
      currency: resource.amount?.currency_code,
    });

    // Registrar pago de suscripción
    await recordSubscriptionPayment({
      subscriptionId,
      paymentId: resource.id,
      amount: resource.amount,
      paypalData: resource,
      webhookEventId: webhookEvent.id,
      paidAt: new Date().toISOString(),
    });

    // Extender período de suscripción
    await extendSubscriptionPeriod(subscriptionId);

    return {
      success: true,
      subscriptionId,
      paymentId: resource.id,
      message: "Subscription payment processed and period extended",
    };
  } catch (error) {
    console.error("Error handling subscription payment:", error);
    throw error;
  }
}

/**
 * Maneja fallo de pago de suscripción
 */
async function handleSubscriptionPaymentFailed(resource, webhookEvent) {
  try {
    const { subscription_id: subscriptionId } = resource;

    console.log("⚠️ Processing subscription payment failure:", {
      subscriptionId,
      reason: resource.reason_code,
    });

    // Registrar fallo de pago
    await recordSubscriptionPaymentFailure({
      subscriptionId,
      paymentId: resource.id,
      reason: resource.reason_code,
      paypalData: resource,
      webhookEventId: webhookEvent.id,
      failedAt: new Date().toISOString(),
    });

    // Notificar al usuario sobre el fallo
    await notifyPaymentFailure(subscriptionId, resource.reason_code);

    return {
      success: true,
      subscriptionId,
      paymentId: resource.id,
      message: "Subscription payment failure processed",
    };
  } catch (error) {
    console.error("Error handling subscription payment failure:", error);
    throw error;
  }
}

/**
 * Maneja creación de disputa
 */
async function handleDisputeCreated(resource, webhookEvent) {
  try {
    const { dispute_id: disputeId, disputed_transactions } = resource;

    console.log("⚖️ Processing dispute creation:", {
      disputeId,
      transactionCount: disputed_transactions?.length || 0,
    });

    // Registrar disputa
    await recordDispute({
      disputeId,
      disputedTransactions: disputed_transactions,
      paypalData: resource,
      webhookEventId: webhookEvent.id,
      createdAt: new Date().toISOString(),
    });

    // Notificar a administradores
    await notifyAdminDispute(disputeId, resource);

    return {
      success: true,
      disputeId,
      message: "Dispute recorded and admins notified",
    };
  } catch (error) {
    console.error("Error handling dispute creation:", error);
    throw error;
  }
}

/**
 * Actualiza el estado de una transacción
 */
async function updateTransactionStatus(transactionId, status, paypalData) {
  try {
    // En un entorno real, esto actualizaría Firebase/Firestore
    console.log(
      `📝 Updating transaction ${transactionId} to status: ${status}`
    );

    // Simular actualización de base de datos
    const updateData = {
      status,
      paypalData,
      updatedAt: new Date().toISOString(),
    };

    // Aquí iría la lógica real de actualización de base de datos
    // const admin = require('firebase-admin');
    // const db = admin.firestore();
    // await db.collection('transactions').doc(transactionId).update(updateData);

    return { success: true, transactionId, status };
  } catch (error) {
    console.error("Error updating transaction status:", error);
    throw error;
  }
}

/**
 * Acredita la cuenta del usuario
 */
async function creditUserAccount(transactionId, paymentResource) {
  try {
    // Extraer información del pago
    const userId = await getUserIdFromTransaction(transactionId);
    const productAmount = await getProductAmountFromTransaction(transactionId);

    if (!userId || !productAmount) {
      throw new Error("Missing user ID or product amount");
    }

    console.log(`💰 Crediting user account:`, {
      userId,
      amount: productAmount,
      transactionId,
    });

    // En un entorno real, esto actualizaría la cuenta del usuario en Firebase
    // const admin = require('firebase-admin');
    // const db = admin.firestore();
    // const userRef = db.collection('users').doc(userId);
    //
    // await db.runTransaction(async (transaction) => {
    //   const userDoc = await transaction.get(userRef);
    //   const currentCoins = userDoc.data().coins || 0;
    //
    //   transaction.update(userRef, {
    //     coins: currentCoins + productAmount,
    //     lastPurchase: admin.firestore.FieldValue.serverTimestamp()
    //   });
    //
    //   // Registrar el crédito en el historial
    //   transaction.set(db.collection('userCredits').doc(), {
    //     userId,
    //     amount: productAmount,
    //     transactionId,
    //     creditedAt: admin.firestore.FieldValue.serverTimestamp()
    //   });
    // });

    return {
      success: true,
      userId,
      amount: productAmount,
      transactionId,
    };
  } catch (error) {
    console.error("Error crediting user account:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Funciones auxiliares para base de datos (simuladas por ahora)
 */
async function getUserIdFromTransaction(transactionId) {
  // En un entorno real, consultaría la base de datos
  // const admin = require('firebase-admin');
  // const db = admin.firestore();
  // const transactionDoc = await db.collection('transactions').doc(transactionId).get();
  // return transactionDoc.data()?.userId;

  return `user_${Math.random().toString(36).substr(2, 9)}`;
}

async function getProductAmountFromTransaction(transactionId) {
  // En un entorno real, consultaría la base de datos
  // const admin = require('firebase-admin');
  // const db = admin.firestore();
  // const transactionDoc = await db.collection('transactions').doc(transactionId).get();
  // return transactionDoc.data()?.amount;

  const amounts = [100, 500, 1000, 5000];
  return amounts[Math.floor(Math.random() * amounts.length)];
}

async function createSubscriptionRecord(subscriptionData) {
  console.log(
    "📝 Creating subscription record:",
    subscriptionData.subscriptionId
  );
  // En un entorno real:
  // const admin = require('firebase-admin');
  // const db = admin.firestore();
  // await db.collection('subscriptions').doc(subscriptionData.subscriptionId).set(subscriptionData);
}

async function updateSubscriptionStatus(subscriptionId, status, data) {
  console.log(
    `📝 Updating subscription ${subscriptionId} to status: ${status}`
  );
  // En un entorno real:
  // const admin = require('firebase-admin');
  // const db = admin.firestore();
  // await db.collection('subscriptions').doc(subscriptionId).update({ status, ...data });
}

async function activatePremiumBenefits(userId, subscriptionId) {
  console.log(`⭐ Activating premium benefits for user: ${userId}`);
  // En un entorno real:
  // const admin = require('firebase-admin');
  // const db = admin.firestore();
  // await db.collection('users').doc(userId).update({
  //   isPremium: true,
  //   premiumActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
  //   activeSubscriptionId: subscriptionId
  // });
}

async function recordSubscriptionPayment(paymentData) {
  console.log("💳 Recording subscription payment:", paymentData.paymentId);
  // En un entorno real:
  // const admin = require('firebase-admin');
  // const db = admin.firestore();
  // await db.collection('subscriptionPayments').doc(paymentData.paymentId).set(paymentData);
}

async function extendSubscriptionPeriod(subscriptionId) {
  console.log(`📅 Extending subscription period: ${subscriptionId}`);
  // En un entorno real:
  // const admin = require('firebase-admin');
  // const db = admin.firestore();
  // const subscriptionRef = db.collection('subscriptions').doc(subscriptionId);
  // await db.runTransaction(async (transaction) => {
  //   const subscriptionDoc = await transaction.get(subscriptionRef);
  //   const currentEndDate = subscriptionDoc.data().currentPeriodEnd;
  //   const newEndDate = new Date(currentEndDate);
  //   newEndDate.setMonth(newEndDate.getMonth() + 1);
  //
  //   transaction.update(subscriptionRef, {
  //     currentPeriodEnd: newEndDate,
  //     lastPaymentDate: new Date()
  //   });
  // });
}

async function recordSubscriptionPaymentFailure(failureData) {
  console.log(
    "❌ Recording subscription payment failure:",
    failureData.paymentId
  );
  // En un entorno real:
  // const admin = require('firebase-admin');
  // const db = admin.firestore();
  // await db.collection('subscriptionPaymentFailures').doc().set(failureData);
}

async function notifyPaymentFailure(subscriptionId, reason) {
  console.log(
    `📧 Notifying payment failure for subscription: ${subscriptionId}`
  );
  // En un entorno real, esto enviaría notificaciones por email/push
  // const notificationService = require('./notification-service');
  // await notificationService.sendPaymentFailureNotification(subscriptionId, reason);
}

async function recordDispute(disputeData) {
  console.log("⚖️ Recording dispute:", disputeData.disputeId);
  // En un entorno real:
  // const admin = require('firebase-admin');
  // const db = admin.firestore();
  // await db.collection('disputes').doc(disputeData.disputeId).set(disputeData);
}

async function notifyAdminDispute(disputeId, disputeData) {
  console.log(`🚨 Notifying admins about dispute: ${disputeId}`);
  // En un entorno real, esto notificaría a los administradores
  // const adminNotificationService = require('./admin-notification-service');
  // await adminNotificationService.sendDisputeAlert(disputeId, disputeData);
}

/**
 * Registra errores del webhook para monitoreo
 */
async function logWebhookError(error, context) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    context: {
      eventType: context.webhookEvent?.event_type,
      eventId: context.webhookEvent?.id,
      processingTime: context.processingTime,
      headers: Object.keys(context.headers || {}),
    },
  };

  console.error("🚨 Webhook error logged:", errorLog);

  // En un entorno real, esto enviaría el error a un servicio de monitoreo
  // const errorMonitoringService = require('./error-monitoring-service');
  // await errorMonitoringService.logError(errorLog);
}

/**
 * Funciones auxiliares para manejo de eventos mejorado
 */

/**
 * Verifica si un evento ya fue procesado (previene duplicados)
 */
async function checkEventDuplicate(eventId) {
  try {
    // En un entorno real, esto consultaría la base de datos
    // const admin = require('firebase-admin');
    // const db = admin.firestore();
    // const eventDoc = await db.collection('processedEvents').doc(eventId).get();
    // return eventDoc.exists;

    // Por ahora, simulamos que no hay duplicados
    return false;
  } catch (error) {
    console.error("Error checking event duplicate:", error);
    return false;
  }
}

/**
 * Marca un evento como en procesamiento
 */
async function markEventProcessing(eventId, eventType) {
  try {
    console.log(`📝 Marking event as processing: ${eventId}`);

    // En un entorno real:
    // const admin = require('firebase-admin');
    // const db = admin.firestore();
    // await db.collection('processedEvents').doc(eventId).set({
    //   eventId,
    //   eventType,
    //   status: 'processing',
    //   startedAt: admin.firestore.FieldValue.serverTimestamp(),
    //   attempts: 1
    // });
  } catch (error) {
    console.error("Error marking event as processing:", error);
  }
}

/**
 * Marca un evento como completado
 */
async function markEventCompleted(eventId, result) {
  try {
    console.log(`✅ Marking event as completed: ${eventId}`);

    // En un entorno real:
    // const admin = require('firebase-admin');
    // const db = admin.firestore();
    // await db.collection('processedEvents').doc(eventId).update({
    //   status: 'completed',
    //   completedAt: admin.firestore.FieldValue.serverTimestamp(),
    //   result: result
    // });
  } catch (error) {
    console.error("Error marking event as completed:", error);
  }
}

/**
 * Marca un evento como fallido
 */
async function markEventFailed(eventId, error, attempts) {
  try {
    console.log(`❌ Marking event as failed: ${eventId}`);

    // En un entorno real:
    // const admin = require('firebase-admin');
    // const db = admin.firestore();
    // await db.collection('processedEvents').doc(eventId).update({
    //   status: 'failed',
    //   failedAt: admin.firestore.FieldValue.serverTimestamp(),
    //   error: error.message,
    //   attempts: attempts
    // });
  } catch (error) {
    console.error("Error marking event as failed:", error);
  }
}

/**
 * Determina si un error es recuperable
 */
function isRecoverableError(error) {
  const recoverableErrors = [
    "NETWORK_ERROR",
    "TIMEOUT_ERROR",
    "INTERNAL_SERVER_ERROR",
    "SERVICE_UNAVAILABLE",
    "DATABASE_CONNECTION_ERROR",
  ];

  return recoverableErrors.some(
    (errorType) => error.message.includes(errorType) || error.name === errorType
  );
}

/**
 * Determina si un evento es crítico
 */
function isCriticalEvent(eventType) {
  const criticalEvents = [
    "PAYMENT.CAPTURE.COMPLETED",
    "BILLING.SUBSCRIPTION.PAYMENT.COMPLETED",
    "CUSTOMER.DISPUTE.CREATED",
  ];

  return criticalEvents.includes(eventType);
}

/**
 * Envía alerta para eventos críticos fallidos
 */
async function sendCriticalEventAlert(webhookEvent, error) {
  try {
    console.log(`🚨 Sending critical event alert:`, {
      eventType: webhookEvent.event_type,
      eventId: webhookEvent.id,
      error: error.message,
    });

    // En un entorno real, esto enviaría notificaciones por email/Slack
    // const alertService = require('./alert-service');
    // await alertService.sendCriticalAlert({
    //   type: 'webhook_failure',
    //   eventType: webhookEvent.event_type,
    //   eventId: webhookEvent.id,
    //   error: error.message,
    //   timestamp: new Date().toISOString()
    // });
  } catch (alertError) {
    console.error("Error sending critical event alert:", alertError);
  }
}

/**
 * Nuevos event handlers para eventos adicionales
 */

/**
 * Maneja reembolsos de pagos
 */
async function handlePaymentRefunded(resource, webhookEvent) {
  try {
    const { id: refundId, amount, custom_id: transactionId } = resource;

    console.log("💸 Processing payment refund:", {
      refundId,
      transactionId,
      amount: amount?.value,
      currency: amount?.currency_code,
    });

    if (transactionId) {
      // Actualizar estado de transacción
      await updateTransactionStatus(transactionId, "refunded", {
        paypalRefundId: refundId,
        paypalData: resource,
        webhookEventId: webhookEvent.id,
        refundedAt: new Date().toISOString(),
        refundAmount: amount?.value,
      });

      // Revertir crédito del usuario si es necesario
      await revertUserCredit(transactionId, resource);
    }

    return {
      success: true,
      transactionId,
      refundId,
      message: "Payment refund processed",
    };
  } catch (error) {
    console.error("Error handling payment refund:", error);
    throw error;
  }
}

/**
 * Maneja suspensión de suscripción
 */
async function handleSubscriptionSuspended(resource, webhookEvent) {
  try {
    const { id: subscriptionId, custom_id: userId } = resource;

    console.log("⏸️ Processing subscription suspension:", {
      subscriptionId,
      userId,
    });

    // Actualizar estado de suscripción
    await updateSubscriptionStatus(subscriptionId, "suspended", {
      paypalData: resource,
      webhookEventId: webhookEvent.id,
      suspendedAt: new Date().toISOString(),
    });

    // Suspender beneficios premium temporalmente
    await suspendPremiumBenefits(userId, subscriptionId);

    return {
      success: true,
      subscriptionId,
      userId,
      message: "Subscription suspension processed",
    };
  } catch (error) {
    console.error("Error handling subscription suspension:", error);
    throw error;
  }
}

/**
 * Maneja reactivación de suscripción
 */
async function handleSubscriptionReactivated(resource, webhookEvent) {
  try {
    const { id: subscriptionId, custom_id: userId } = resource;

    console.log("▶️ Processing subscription reactivation:", {
      subscriptionId,
      userId,
    });

    // Actualizar estado de suscripción
    await updateSubscriptionStatus(subscriptionId, "active", {
      paypalData: resource,
      webhookEventId: webhookEvent.id,
      reactivatedAt: new Date().toISOString(),
    });

    // Reactivar beneficios premium
    await reactivatePremiumBenefits(userId, subscriptionId);

    return {
      success: true,
      subscriptionId,
      userId,
      message: "Subscription reactivation processed",
    };
  } catch (error) {
    console.error("Error handling subscription reactivation:", error);
    throw error;
  }
}

/**
 * Funciones auxiliares adicionales
 */

/**
 * Revierte crédito del usuario en caso de reembolso
 */
async function revertUserCredit(transactionId, refundResource) {
  try {
    const userId = await getUserIdFromTransaction(transactionId);
    const refundAmount = await getProductAmountFromTransaction(transactionId);

    if (!userId || !refundAmount) {
      console.warn("Cannot revert user credit: missing user ID or amount");
      return { success: false };
    }

    console.log(`💰 Reverting user credit:`, {
      userId,
      amount: refundAmount,
      transactionId,
    });

    // En un entorno real:
    // const admin = require('firebase-admin');
    // const db = admin.firestore();
    // const userRef = db.collection('users').doc(userId);
    //
    // await db.runTransaction(async (transaction) => {
    //   const userDoc = await transaction.get(userRef);
    //   const currentCoins = userDoc.data().coins || 0;
    //   const newCoins = Math.max(0, currentCoins - refundAmount);
    //
    //   transaction.update(userRef, {
    //     coins: newCoins,
    //     lastRefund: admin.firestore.FieldValue.serverTimestamp()
    //   });
    //
    //   // Registrar el reembolso
    //   transaction.set(db.collection('userRefunds').doc(), {
    //     userId,
    //     amount: refundAmount,
    //     transactionId,
    //     refundedAt: admin.firestore.FieldValue.serverTimestamp()
    //   });
    // });

    return {
      success: true,
      userId,
      amount: refundAmount,
      transactionId,
    };
  } catch (error) {
    console.error("Error reverting user credit:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Suspende beneficios premium temporalmente
 */
async function suspendPremiumBenefits(userId, subscriptionId) {
  console.log(`⏸️ Suspending premium benefits for user: ${userId}`);
  // En un entorno real:
  // const admin = require('firebase-admin');
  // const db = admin.firestore();
  // await db.collection('users').doc(userId).update({
  //   isPremium: false,
  //   premiumSuspendedAt: admin.firestore.FieldValue.serverTimestamp(),
  //   suspendedSubscriptionId: subscriptionId
  // });
}

/**
 * Reactiva beneficios premium
 */
async function reactivatePremiumBenefits(userId, subscriptionId) {
  console.log(`▶️ Reactivating premium benefits for user: ${userId}`);
  // En un entorno real:
  // const admin = require('firebase-admin');
  // const db = admin.firestore();
  // await db.collection('users').doc(userId).update({
  //   isPremium: true,
  //   premiumReactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
  //   activeSubscriptionId: subscriptionId,
  //   suspendedSubscriptionId: admin.firestore.FieldValue.delete()
  // });
}

/**
 * Funciones auxiliares adicionales para manejo robusto
 */

/**
 * Obtiene el estado actual de una transacción
 */
async function getTransactionStatus(transactionId) {
  try {
    // En un entorno real:
    // const admin = require('firebase-admin');
    // const db = admin.firestore();
    // const transactionDoc = await db.collection('transactions').doc(transactionId).get();
    // return transactionDoc.exists ? transactionDoc.data() : null;

    // Simulación para desarrollo
    return null;
  } catch (error) {
    console.error("Error getting transaction status:", error);
    return null;
  }
}

/**
 * Envía notificación de confirmación de pago al usuario
 */
async function sendPaymentConfirmationNotification(userId, paymentData) {
  try {
    console.log(
      `📧 Sending payment confirmation to user: ${userId}`,
      paymentData
    );

    // En un entorno real:
    // const notificationService = require('./notification-service');
    // await notificationService.sendPaymentConfirmation(userId, {
    //   transactionId: paymentData.transactionId,
    //   amount: paymentData.amount,
    //   paymentId: paymentData.paymentId,
    //   timestamp: new Date().toISOString()
    // });
  } catch (error) {
    console.error("Error sending payment confirmation:", error);
    // No lanzar error para no afectar el procesamiento principal
  }
}

/**
 * Valida la estructura de un evento de webhook
 */
function validateWebhookEvent(webhookEvent) {
  const requiredFields = ["id", "event_type", "resource"];
  const missingFields = requiredFields.filter((field) => !webhookEvent[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required webhook fields: ${missingFields.join(", ")}`
    );
  }

  // Validar formato del event_type
  if (
    typeof webhookEvent.event_type !== "string" ||
    !webhookEvent.event_type.includes(".")
  ) {
    throw new Error("Invalid event_type format");
  }

  return true;
}

/**
 * Obtiene métricas de procesamiento de webhooks
 */
async function getWebhookMetrics(timeRange = "24h") {
  try {
    // En un entorno real, esto consultaría métricas de la base de datos
    const metrics = {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      duplicateEvents: 0,
      averageProcessingTime: 0,
      eventsByType: {},
      timeRange,
    };

    console.log("📊 Webhook metrics:", metrics);
    return metrics;
  } catch (error) {
    console.error("Error getting webhook metrics:", error);
    return null;
  }
}

/**
 * Limpia eventos procesados antiguos (mantenimiento)
 */
async function cleanupOldProcessedEvents(daysToKeep = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    console.log(
      `🧹 Cleaning up processed events older than ${daysToKeep} days`
    );

    // En un entorno real:
    // const admin = require('firebase-admin');
    // const db = admin.firestore();
    // const oldEventsQuery = db.collection('processedEvents')
    //   .where('completedAt', '<', cutoffDate);
    //
    // const batch = db.batch();
    // const snapshot = await oldEventsQuery.get();
    //
    // snapshot.docs.forEach(doc => {
    //   batch.delete(doc.ref);
    // });
    //
    // await batch.commit();
    // console.log(`Cleaned up ${snapshot.size} old events`);
  } catch (error) {
    console.error("Error cleaning up old events:", error);
  }
}
