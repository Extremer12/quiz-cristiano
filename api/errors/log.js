/**
 * API Endpoint para logging de errores de pagos
 * Quiz Cristiano - Sistema de logging centralizado
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
    const logEntry = req.body;

    // Validar que el log entry tenga los campos requeridos
    if (!logEntry.timestamp || !logEntry.errorCode || !logEntry.severity) {
      return res.status(400).json({
        error: "Invalid log entry",
        message: "Missing required fields: timestamp, errorCode, severity",
      });
    }

    // En producción, aquí se enviaría a un servicio de logging como:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - CloudWatch
    // - Firebase Analytics

    // Por ahora, solo loggeamos en la consola del servidor
    console.log("📝 Payment Error Log:", {
      timestamp: logEntry.timestamp,
      errorCode: logEntry.errorCode,
      category: logEntry.category,
      severity: logEntry.severity,
      userId: logEntry.userId,
      sessionId: logEntry.sessionId,
      errorReference: logEntry.errorReference,
      message: logEntry.message,
      context: logEntry.context,
    });

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: "Error logged successfully",
      errorReference: logEntry.errorReference,
    });
  } catch (error) {
    console.error("Error logging payment error:", error);

    // No queremos que el logging de errores falle la aplicación
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to log error",
    });
  }
}
