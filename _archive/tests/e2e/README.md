# PayPal Integration E2E Tests

Este directorio contiene los tests end-to-end (E2E) para la integración de pagos con PayPal en la aplicación Quiz Cristiano.

## Estructura de Tests

### 1. `complete-purchase-flow.test.js`

Tests del flujo completo de compra:

- Navegación a la tienda
- Selección de productos
- Configuración de pago con PayPal
- Procesamiento de pagos
- Manejo de errores y cancelaciones

### 2. `subscription-management.test.js`

Tests de manejo de suscripciones:

- Visualización de suscripciones activas
- Creación de nuevas suscripciones
- Cancelación de suscripciones
- Historial de pagos de suscripciones

### 3. `webhook-processing.test.js`

Tests de procesamiento de webhooks:

- Procesamiento de eventos de pago completado
- Manejo de eventos de suscripción
- Validación de firmas de webhook
- Manejo de errores en webhooks

### 4. `user-journey.test.js`

Test del viaje completo del usuario:

- Registro/login de usuario
- Juego para ganar monedas
- Navegación por la tienda
- Compra de productos
- Suscripción a premium
- Verificación de beneficios premium

## Configuración

### Requisitos Previos

```bash
# Instalar dependencias
npm install

# Instalar navegadores de Playwright
npx playwright install
```

### Variables de Entorno

Los tests utilizan las siguientes variables de entorno:

- `NODE_ENV=test`
- `PAYPAL_ENVIRONMENT=sandbox`
- `ENABLE_TEST_MODE=true`

## Ejecución de Tests

### Usando el Script de Test Runner

```bash
# Ejecutar todos los tests
node tests/e2e/run-e2e-tests.js all

# Ejecutar solo tests de compra
node tests/e2e/run-e2e-tests.js purchase

# Ejecutar solo tests de suscripciones
node tests/e2e/run-e2e-tests.js subscription

# Ejecutar solo tests de webhooks
node tests/e2e/run-e2e-tests.js webhook

# Ejecutar test de viaje completo
node tests/e2e/run-e2e-tests.js journey

# Ejecutar con navegador visible
node tests/e2e/run-e2e-tests.js headed

# Ejecutar en modo debug
node tests/e2e/run-e2e-tests.js debug

# Ejecutar solo en Chromium
node tests/e2e/run-e2e-tests.js chromium

# Ejecutar solo en dispositivos móviles
node tests/e2e/run-e2e-tests.js mobile
```

### Usando Playwright Directamente

```bash
# Ejecutar todos los tests
npx playwright test

# Ejecutar un archivo específico
npx playwright test complete-purchase-flow.test.js

# Ejecutar con navegador visible
npx playwright test --headed

# Ejecutar en modo debug
npx playwright test --debug

# Ejecutar solo en un navegador específico
npx playwright test --project=chromium

# Generar reporte HTML
npx playwright show-report
```

## Mocking y Datos de Test

### PayPal SDK Mocking

Los tests utilizan mocking del SDK de PayPal para simular:

- Respuestas exitosas de pago
- Errores de procesamiento
- Cancelaciones de pago
- Creación de suscripciones
- Eventos de webhook

### Datos de Usuario de Test

Los tests configuran datos de usuario simulados:

```javascript
{
  uid: 'test-user-123',
  displayName: 'Test User',
  email: 'test@example.com',
  coins: 1000,
  level: 5,
  totalScore: 2500
}
```

### Webhooks de Test

Los tests simulan webhooks de PayPal con payloads realistas:

- `PAYMENT.CAPTURE.COMPLETED`
- `BILLING.SUBSCRIPTION.CREATED`
- `BILLING.SUBSCRIPTION.CANCELLED`

## Configuración de CI/CD

### GitHub Actions

```yaml
- name: Run E2E Tests
  run: |
    npm ci
    npx playwright install --with-deps
    npm run test:e2e
```

### Variables de Entorno para CI

```bash
CI=true
NODE_ENV=test
PAYPAL_ENVIRONMENT=sandbox
BASE_URL=http://localhost:3000
```

## Debugging

### Modo Debug

```bash
# Ejecutar en modo debug (pausa en cada paso)
npx playwright test --debug

# Ejecutar con navegador visible
npx playwright test --headed

# Generar traces para debugging
npx playwright test --trace on
```

### Screenshots y Videos

Los tests están configurados para:

- Tomar screenshots en fallos
- Grabar videos en fallos
- Generar traces en reintentos

### Logs de Test

```bash
# Ver logs detallados
npx playwright test --reporter=line

# Generar reporte HTML con detalles
npx playwright show-report
```

## Mejores Prácticas

### Estructura de Tests

1. **Setup**: Configurar datos de usuario y estado inicial
2. **Steps**: Usar `test.step()` para organizar acciones
3. **Assertions**: Verificar estado después de cada acción importante
4. **Cleanup**: Limpiar estado si es necesario

### Selectores

- Usar `data-testid` para elementos críticos
- Preferir selectores semánticos cuando sea posible
- Evitar selectores frágiles basados en CSS

### Timeouts

- Usar `waitForSelector()` para elementos dinámicos
- Configurar timeouts apropiados para operaciones lentas
- Usar `waitForTimeout()` solo cuando sea absolutamente necesario

### Mocking

- Mockear APIs externas (PayPal, Firebase)
- Simular diferentes escenarios (éxito, error, timeout)
- Mantener mocks realistas y actualizados

## Troubleshooting

### Problemas Comunes

#### Tests Fallan por Timeouts

```bash
# Aumentar timeout global
npx playwright test --timeout=90000

# O configurar en playwright.config.js
timeout: 90000
```

#### Elementos No Encontrados

```javascript
// Usar waitForSelector con timeout
await page.waitForSelector(".element", { timeout: 10000 });

// Verificar que el elemento existe antes de interactuar
const element = page.locator(".element");
await expect(element).toBeVisible();
```

#### Problemas de Navegación

```javascript
// Esperar a que la página cargue completamente
await page.waitForLoadState("networkidle");

// Verificar URL antes de continuar
await expect(page).toHaveURL(/store/);
```

### Logs de Debug

```javascript
// Agregar logs personalizados
console.log("Current URL:", page.url());
console.log("Local storage:", await page.evaluate(() => localStorage));
```

## Mantenimiento

### Actualización de Tests

1. Revisar tests cuando cambien las funcionalidades
2. Actualizar selectores si cambia la UI
3. Mantener mocks actualizados con APIs reales
4. Revisar timeouts y configuraciones periódicamente

### Monitoreo de Performance

- Revisar duración de tests regularmente
- Optimizar tests lentos
- Paralelizar cuando sea posible
- Usar `test.slow()` para tests conocidos como lentos

### Reportes

- Revisar reportes HTML después de cada ejecución
- Analizar screenshots y videos de fallos
- Mantener historial de resultados para tendencias
