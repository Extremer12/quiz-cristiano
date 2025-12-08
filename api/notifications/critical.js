/**
 * API Endpoint para notificaciones críticas de pagos
 * Quiz Cristiano - Sistema de alertas para administradores
 */

export default async function handler(req, res) {
  // Solo permitir POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      message: "Only POST requests are allowed",
    });
  }

  try {
    const notification = req.body;

    // Validar que la notificación tenga los campos requeridos
    if (!notification.type || !notification.timestamp || !notification.error) {
      return res.status(400).json({
        error: "Invalid notification",
        message: "Missing required fields: type, timestamp, error",
      });
    }

    // Log de la notificación crítica
    console.error("🚨 CRITICAL PAYMENT ERROR NOTIFICATION:", {
      type: notification.type,
      timestamp: notification.timestamp,
      error: notification.error,
      errorReference: notification.errorReference,
      context: notification.context,
    });

    // En producción, aquí se enviarían notificaciones a:
    // - Email a administradores
    // - Slack/Discord webhook
    // - SMS a personal de soporte
    // - PagerDuty/OpsGenie para alertas
    // - Dashboard de monitoreo

    // Ejemplo de integración con email (comentado para desarrollo):
    /*
    if (process.env.NODE_ENV === 'production') {
      await sendEmailNotification({
        to: process.env.ADMIN_EMAIL,
        subject: `🚨 Critical Payment Error - ${notification.errorReference}`,
        body: `
          Critical payment error detected:
          
          Type: ${notification.type}
          Time: ${notification.timestamp}
          Error: ${notification.error}
          Reference: ${notification.errorReference}
          
          Please investigate immediately.
        `
      });
    }
    */

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: "Critical notification sent successfully",
      notificationId: notification.errorReference,
    });
  } catch (error) {
    console.error("Error sending critical notification:", error);

    // Las notificaciones críticas son importantes, pero no deben fallar la app
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to send critical notification",
    });
  }
}
