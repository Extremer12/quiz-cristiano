/**
 * API Endpoint para actividad sospechosa
 * Quiz Cristiano - Sistema de detección de fraude
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
    const suspiciousActivity = req.body;

    // Validar que la actividad sospechosa tenga los campos requeridos
    if (
      !suspiciousActivity.type ||
      !suspiciousActivity.userId ||
      !suspiciousActivity.patterns
    ) {
      return res.status(400).json({
        error: "Invalid suspicious activity report",
        message: "Missing required fields: type, userId, patterns",
      });
    }

    // Log inmediato de la actividad sospechosa
    console.warn("🚨 SUSPICIOUS ACTIVITY DETECTED:", {
      type: suspiciousActivity.type,
      userId: suspiciousActivity.userId,
      patterns: suspiciousActivity.patterns,
      severity: suspiciousActivity.severity,
      timestamp: suspiciousActivity.timestamp,
    });

    // En producción, aquí se tomarían acciones automáticas:
    // - Bloqueo temporal del usuario
    // - Notificación al equipo de fraude
    // - Escalación según la severidad
    // - Análisis adicional de patrones

    // Ejemplo de acciones automáticas (comentado para desarrollo):
    /*
    if (process.env.NODE_ENV === 'production') {
      // Notificar al equipo de fraude
      await notifyFraudTeam({
        userId: suspiciousActivity.userId,
        patterns: suspiciousActivity.patterns,
        severity: suspiciousActivity.severity,
        timestamp: suspiciousActivity.timestamp
      });

      // Si es severidad alta, considerar bloqueo inmediato
      if (suspiciousActivity.severity === 'HIGH') {
        await blockUserTemporarily(suspiciousActivity.userId, '30 minutes');
      }

      // Registrar en sistema de fraude
      await logToFraudDetectionSystem(suspiciousActivity);
    }
    */

    // Determinar acciones recomendadas basadas en los patrones
    const recommendedActions = determineRecommendedActions(
      suspiciousActivity.patterns
    );

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      message: "Suspicious activity logged successfully",
      activityId: generateActivityId(),
      severity: suspiciousActivity.severity,
      recommendedActions: recommendedActions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing suspicious activity:", error);

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to process suspicious activity report",
    });
  }
}

/**
 * Determine recommended actions based on suspicious patterns
 */
function determineRecommendedActions(patterns) {
  const actions = [];

  patterns.forEach((pattern) => {
    switch (pattern.type) {
      case "EXCESSIVE_FAILED_ATTEMPTS":
        actions.push({
          action: "TEMPORARY_BLOCK",
          duration: "30 minutes",
          reason: "Too many failed payment attempts",
        });
        break;

      case "EXCESSIVE_TRANSACTION_FREQUENCY":
        actions.push({
          action: "RATE_LIMIT",
          duration: "1 hour",
          reason: "Unusual transaction frequency",
        });
        break;

      case "EXCESSIVE_TRANSACTION_AMOUNT":
        actions.push({
          action: "MANUAL_REVIEW",
          priority: "HIGH",
          reason: "Large transaction amounts detected",
        });
        break;

      case "RAPID_IP_CHANGE":
        actions.push({
          action: "ADDITIONAL_VERIFICATION",
          method: "EMAIL_CONFIRMATION",
          reason: "Rapid IP address changes",
        });
        break;

      case "UNUSUAL_HOURS":
        actions.push({
          action: "MONITOR",
          duration: "24 hours",
          reason: "Transaction during unusual hours",
        });
        break;

      default:
        actions.push({
          action: "LOG_AND_MONITOR",
          reason: "Unknown suspicious pattern",
        });
    }
  });

  return actions;
}

/**
 * Generate unique activity ID
 */
function generateActivityId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `SUSP-${timestamp}-${random}`.toUpperCase();
}
