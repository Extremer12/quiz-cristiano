# Tests - Quiz Cristiano PayPal Integration

## Descripción

Este directorio contiene todos los tests unitarios e integración para el sistema de pagos de PayPal en Quiz Cristiano.

## Estructura

```
tests/
├── unit/                     # Tests unitarios
│   ├── payment-service.test.js
│   ├── currency-service.test.js
│   ├── transaction-manager.test.js
│   └── error-handler.test.js
├── integration/              # Tests de integración
│   ├── paypal-webhook.test.js
│   └── store-integration.test.js
├── setup.js                  # Configuración global de tests
├── run-tests.js             # Script para ejecutar tests
└── README.md                # Este archivo
```

## Configuración

### Dependencias

```bash
npm install --save-dev jest jest-environment-jsdom jest-html-reporters @babel/core @babel/preset-env babel-jest
```

### Archivos de Configuración

- `jest.config.js` - Configuración principal de Jest
- `babel.config.js` - Configuración de Babel para transpilación
- `tests/setup.js` - Mocks globales y configuración de entorno

## Ejecutar Tests

### Comandos NPM

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar solo tests unitarios
npm run test:unit

# Ejecutar solo tests de integración
npm run test:integration

# Ejecutar tests para CI/CD
npm run test:ci
```

### Script Personalizado

```bash
# Ejecutar todos los tests
node tests/run-tests.js

# Ejecutar solo tests unitarios
node tests/run-tests.js unit

# Ejecutar con coverage
node tests/run-tests.js coverage

# Ejecutar en modo watch
node tests/run-tests.js watch

# Ver ayuda
node tests/run-tests.js help
```

## Tests Unitarios

### PaymentService (`payment-service.test.js`)

Tests para el servicio principal de pagos:

- ✅ Creación de pagos con datos válidos
- ✅ Manejo de errores de productos no encontrados
- ✅ Verificación de pagos
- ✅ Creación de suscripciones
- ✅ Manejo de errores de API de PayPal
- ✅ Soporte multi-moneda (USD/ARS)

### CurrencyService (`currency-service.test.js`)

Tests para el servicio de monedas:

- ✅ Detección automática de moneda por ubicación
- ✅ Formateo de precios en diferentes monedas
- ✅ Conversión de monedas
- ✅ Obtención de precios de productos
- ✅ Validación de monedas soportadas
- ✅ Manejo de casos edge

### TransactionManager (`transaction-manager.test.js`)

Tests para el gestor de transacciones:

- ✅ Creación de transacciones
- ✅ Actualización de estados
- ✅ Acreditación de cuentas de usuario
- ✅ Historial de transacciones
- ✅ Generación de IDs únicos
- ✅ Detección de tipos de dispositivo
- ✅ Manejo de errores de base de datos

### PaymentErrorHandler (`error-handler.test.js`)

Tests para el manejador de errores:

- ✅ Clasificación de errores por categoría y severidad
- ✅ Mensajes amigables para usuarios
- ✅ Opciones de fallback y reintento
- ✅ Notificaciones de errores críticos
- ✅ Manejo de incidentes de seguridad
- ✅ Sanitización de datos sensibles
- ✅ Generación de referencias de error

## Coverage

### Umbrales de Coverage

- **Global**: 70% (branches, functions, lines, statements)
- **Módulos críticos**: 80% (payment-service, transaction-manager)

### Reportes

Los reportes de coverage se generan en:

- `coverage/` - Reportes HTML y LCOV
- `coverage/html-report/report.html` - Reporte HTML detallado

## Mocks y Stubs

### Mocks Globales (setup.js)

- `firebase` - Mock de Firebase/Firestore
- `window.location` - Mock de location del navegador
- `navigator` - Mock de navigator para detección de dispositivos
- `sessionStorage` - Mock de session storage
- `fetch` - Mock de fetch API
- `paypal` - Mock del SDK de PayPal
- `Intl` - Mock de APIs de internacionalización

### Mocks Específicos

Cada test incluye mocks específicos para:

- Respuestas de API de PayPal
- Datos de configuración
- Respuestas de base de datos
- Servicios de terceros

## Mejores Prácticas

### Estructura de Tests

```javascript
describe("ComponentName", () => {
  let component;

  beforeEach(() => {
    // Setup antes de cada test
    jest.clearAllMocks();
    component = new ComponentName();
  });

  describe("methodName", () => {
    test("should do something when condition", () => {
      // Arrange
      const input = "test data";

      // Act
      const result = component.methodName(input);

      // Assert
      expect(result).toBe("expected");
    });
  });
});
```

### Naming Conventions

- **Archivos**: `component-name.test.js`
- **Describe blocks**: Nombre del componente/método
- **Test cases**: `should [expected behavior] when [condition]`

### Assertions

```javascript
// Valores exactos
expect(result).toBe("exact value");
expect(result).toEqual({ object: "comparison" });

// Tipos y estructura
expect(result).toBeInstanceOf(Date);
expect(result).toHaveProperty("propertyName");
expect(array).toContain("item");

// Strings y patterns
expect(string).toMatch(/regex pattern/);
expect(string).toContain("substring");

// Funciones
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith("arg1", "arg2");
```

## Debugging Tests

### Ejecutar Test Específico

```bash
# Ejecutar un archivo específico
npm test payment-service.test.js

# Ejecutar un test específico
npm test -- --testNamePattern="should create payment"
```

### Debug Mode

```bash
# Ejecutar con debug
node --inspect-brk node_modules/.bin/jest --runInBand

# Ejecutar con verbose output
npm test -- --verbose
```

### Logs en Tests

```javascript
// Habilitar logs de console en tests
beforeEach(() => {
  process.env.RESTORE_CONSOLE = "true";
});
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Tests
  run: npm run test:ci

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Vercel

```json
{
  "buildCommand": "npm run test:ci && npm run build"
}
```

## Troubleshooting

### Problemas Comunes

1. **Tests fallan por timeouts**

   - Aumentar timeout en `jest.config.js`
   - Usar `jest.setTimeout(10000)` en tests específicos

2. **Mocks no funcionan**

   - Verificar que `jest.clearAllMocks()` esté en `beforeEach`
   - Revisar orden de imports y mocks

3. **Coverage bajo**

   - Revisar archivos excluidos en `jest.config.js`
   - Agregar tests para casos edge

4. **Tests lentos**
   - Usar `--runInBand` para tests seriales
   - Optimizar mocks y setup

### Logs Útiles

```bash
# Ver qué archivos están siendo testeados
npm test -- --listTests

# Ver coverage detallado
npm test -- --coverage --verbose

# Ejecutar tests con debug
npm test -- --detectOpenHandles --forceExit
```

## Contribuir

### Agregar Nuevos Tests

1. Crear archivo en directorio apropiado (`unit/` o `integration/`)
2. Seguir convenciones de naming
3. Incluir setup y teardown apropiados
4. Mantener coverage arriba del umbral
5. Documentar casos edge importantes

### Actualizar Tests Existentes

1. Mantener compatibilidad con tests existentes
2. Actualizar mocks si cambian interfaces
3. Revisar que coverage no baje
4. Actualizar documentación si es necesario
