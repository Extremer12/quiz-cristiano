# PayPal Webhook Setup Guide

## Descripción

El webhook de PayPal (`api/paypal/webhook.js`) es una función serverless que maneja automáticamente las notificaciones de PayPal cuando ocurren eventos de pago, suscripciones y disputas.

## Funcionalidades Implementadas

### ✅ Procesamiento de Eventos

- **PAYMENT.CAPTURE.COMPLETED**: Pago completado exitosamente
- **PAYMENT.CAPTURE.DENIED**: Pago rechazado
- **PAYMENT.CAPTURE.PENDING**: Pago pendiente
- **BILLING.SUBSCRIPTION.ACTIVATED**: Suscripción activada
- **BILLING.SUBSCRIPTION.CANCELLED**: Suscripción cancelada
- **BILLING.SUBSCRIPTION.PAYMENT.COMPLETED**: Pago de suscripción completado
- **BILLING.SUBSCRIPTION.PAYMENT.FAILED**: Pago de suscripción fallido
- **CUSTOMER.DISPUTE.CREATED**: Disputa creada

### ✅ Gestión de Transacciones

- Actualización automática del estado de transacciones
- Acreditación inmediata de monedas al usuario
- Registro de datos de PayPal para auditoría

### ✅ Manejo de Errores

- Logging detallado de errores
- Reintentos automáticos para errores temporales
- Respuestas HTTP apropiadas

## Configuración Requerida

### Variables de Entorno

```bash
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_WEBHOOK_ID=your_webhook_id_here
NODE_ENV=development|production
```

## URL del Webhook

En desarrollo, el webhook estará disponible en:

```
http://localhost:3000/api/paypal/webhook
```

En producción:

```
https://your-vercel-domain.vercel.app/api/paypal/webhook
```

## Configuración en PayPal Developer Dashboard

1. **Acceder al Dashboard**

   - Ir a https://developer.paypal.com/
   - Iniciar sesión con tu cuenta de PayPal

2. **Crear Aplicación**

   - Crear una nueva aplicación o usar una existente
   - Obtener el Client ID y Client Secret

3. **Configurar Webhook**

   - En la sección "Webhooks", crear un nuevo webhook
   - URL: `https://your-vercel-domain.vercel.app/api/paypal/webhook`
   - Eventos a suscribir:
     - Payment capture completed
     - Payment capture denied
     - Payment capture pending
     - Billing subscription activated
     - Billing subscription cancelled
     - Billing subscription payment completed
     - Billing subscription payment failed
     - Customer dispute created

4. **Obtener Webhook ID**
   - Copiar el Webhook ID generado
   - Agregarlo a las variables de entorno como `PAYPAL_WEBHOOK_ID`

## Webhook Testing

### Pruebas Locales

Para probar el webhook localmente, puedes usar herramientas como ngrok:

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto local
ngrok http 3000

# Usar la URL de ngrok en PayPal Dashboard
https://abc123.ngrok.io/api/paypal/webhook
```

### Eventos de Prueba

PayPal proporciona un simulador de eventos donde puedes enviar eventos de prueba a tu webhook en el PayPal Developer Dashboard.

## Monitoreo

### Logging

El webhook registra información detallada:

```javascript
// Webhook recibido
🔔 PayPal webhook received: { headers, bodySize, timestamp }

// Verificación
✅ Webhook signature verified for event: PAYMENT.CAPTURE.COMPLETED

// Procesamiento exitoso
✅ Webhook processed successfully: { eventType, eventId, processingTime }

// Error en procesamiento
❌ Webhook processing error: { error, stack, eventType }
```

### Métricas Importantes

- Tiempo de procesamiento del webhook
- Tasa de éxito/fallo
- Tipos de eventos más frecuentes
- Errores de verificación de firma

## Troubleshooting

### Errores Comunes

1. **405 Method Not Allowed**

   - El webhook solo acepta métodos POST
   - Verificar configuración en PayPal Dashboard

2. **400 Invalid Webhook**

   - Headers requeridos faltantes
   - Verificar configuración de PayPal

3. **401 Invalid Webhook Signature**

   - Problema con verificación de firma
   - Verificar PAYPAL_WEBHOOK_ID

4. **500 Internal Server Error**
   - Error en procesamiento interno
   - Revisar logs detallados

### Debugging

Para revisar logs de Vercel:

```bash
vercel logs
```

## Seguridad

### Verificación de Firma

El webhook implementa verificación básica de firma que incluye:

- Validación de headers requeridos
- Verificación de timestamp (ventana de 5 minutos)
- Validación de formato de firma

**Nota**: Para producción, se recomienda implementar verificación completa de firma RSA con certificados de PayPal.

### Mejoras de Seguridad Recomendadas

Para producción, se recomienda implementar:

- Verificación completa de firma RSA con certificados de PayPal
- Rate limiting para prevenir ataques
- Logging de seguridad avanzado
- Validación adicional de datos de entrada

## Próximos Pasos

Una vez configurado el webhook, se puede proceder con:

- Tarea 6.2: Implementar webhook event handlers
- Tarea 7: Agregar seguridad y manejo de errores
- Tarea 8: Crear testing infrastructure

**Importante**: Las funciones de base de datos están simuladas para desarrollo. En producción, se necesita implementar la integración real con Firebase/Firestore.
