# Documento de Diseño - Corrección de Conflicto de StoreController

## Visión General

Este documento describe el diseño técnico para resolver el conflicto entre dos implementaciones de StoreController que están causando que la tienda muestre "PRÓXIMAMENTE" en lugar de los productos reales. El problema principal es que `js/pages/store-controller.js` está sobrescribiendo la implementación corregida de `js/modules/store/StoreController.js`.

## Arquitectura

### Problema Actual

```
store.html
├── js/modules/store/StoreController.js (CORREGIDO ✅)
│   └── window.StoreController = new StoreController()
├── js/pages/store-controller.js (CONFLICTIVO ❌)
│   └── window.StoreController = StoreController (clase)
│   └── window.storeController = new StoreController()
└── Resultado: Conflicto de implementaciones
```

### Solución Propuesta

```
store.html
├── js/modules/store/StoreController.js (ÚNICO ✅)
│   └── window.StoreController = new StoreController()
├── js/pages/store-controller.js (REMOVIDO/RENOMBRADO)
└── Resultado: Una sola implementación funcional
```

## Componentes y Interfaces

### 1. Análisis de Conflicto

**Archivo Correcto:** `js/modules/store/StoreController.js`

- Implementación corregida según el spec `store-bug-fixes`
- Manejo robusto de errores
- Compatibilidad con navegadores antiguos
- Integración correcta con ProductService

**Archivo Conflictivo:** `js/pages/store-controller.js`

- Implementación más compleja pero no corregida
- Sobrescribe la implementación corregida
- Causa que `showFallbackContent()` se ejecute

### 2. Estrategia de Resolución

```javascript
// ANTES (Conflictivo)
// js/modules/store/StoreController.js
window.StoreController = new StoreController(); // ✅ Instancia corregida

// js/pages/store-controller.js
window.StoreController = StoreController; // ❌ Sobrescribe con clase
window.storeController = new StoreController(); // ❌ Instancia diferente

// DESPUÉS (Resuelto)
// Solo js/modules/store/StoreController.js
window.StoreController = new StoreController(); // ✅ Única implementación
```

### 3. Modificaciones en store.html

**Problema Actual:**

```html
<!-- Scripts que causan conflicto -->
<script src="js/modules/store/StoreController.js"></script>
<!-- ... otros scripts ... -->
<script src="js/pages/store-controller.js"></script>
<!-- CONFLICTO -->
```

**Solución:**

```html
<!-- Solo el script corregido -->
<script src="js/modules/store/StoreController.js"></script>
<!-- js/pages/store-controller.js REMOVIDO -->
```

## Modelos de Datos

### Estado de Inicialización

```javascript
{
  storeControllerLoaded: boolean,
  productServiceAvailable: boolean,
  initializationSuccess: boolean,
  conflictDetected: boolean,
  fallbackMode: boolean
}
```

### Configuración de Scripts

```javascript
{
  requiredScripts: [
    "js/modules/store/StoreConfig.js",
    "js/modules/store/ProductService.js",
    "js/modules/store/StoreController.js" // ÚNICO
  ],
  conflictingScripts: [
    "js/pages/store-controller.js" // REMOVER
  ]
}
```

## Manejo de Errores

### 1. Detección de Conflictos

```javascript
// Verificar si hay múltiples implementaciones
function detectStoreControllerConflict() {
  const hasModuleImplementation = window.StoreController instanceof Object;
  const hasPageImplementation = typeof window.storeController !== "undefined";

  if (hasModuleImplementation && hasPageImplementation) {
    console.warn("⚠️ Conflicto detectado: múltiples StoreController");
    return true;
  }
  return false;
}
```

### 2. Resolución Automática

```javascript
// Priorizar implementación corregida
function resolveStoreControllerConflict() {
  if (
    window.StoreController &&
    typeof window.StoreController.initialize === "function"
  ) {
    // Usar implementación de módulos (corregida)
    console.log("✅ Usando StoreController de módulos");
    return window.StoreController;
  }

  throw new Error("StoreController corregido no disponible");
}
```

### 3. Fallback Mejorado

```javascript
// Reemplazar showFallbackContent genérico
function showImprovedFallback() {
  console.error(
    "❌ StoreController no disponible - mostrando error específico"
  );

  document.querySelectorAll(".loading-state").forEach((loading) => {
    loading.style.display = "none";
  });

  document.querySelectorAll(".category-section").forEach((section) => {
    const errorState = document.createElement("div");
    errorState.className = "error-state";
    errorState.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Error de Inicialización</h3>
      <p>No se pudo cargar el controlador de la tienda. Por favor, recarga la página.</p>
      <button onclick="location.reload()" class="btn-retry">
        <i class="fas fa-redo"></i> Recargar Página
      </button>
    `;
    section.appendChild(errorState);
  });
}
```

## Estrategia de Testing

### 1. Pruebas de Conflicto

```javascript
// Verificar que solo hay una implementación
function testSingleImplementation() {
  const implementations = [];

  if (window.StoreController) implementations.push("StoreController");
  if (window.storeController) implementations.push("storeController");

  console.log(`Implementaciones encontradas: ${implementations.length}`);
  return implementations.length === 1;
}
```

### 2. Pruebas de Funcionalidad

```javascript
// Verificar que la implementación funciona
async function testStoreControllerFunctionality() {
  if (!window.StoreController) {
    throw new Error("StoreController no disponible");
  }

  if (typeof window.StoreController.initialize !== "function") {
    throw new Error("StoreController.initialize no es función");
  }

  // Probar inicialización
  await window.StoreController.initialize();

  // Probar carga de productos
  await window.StoreController.switchCategory("avatares");

  console.log("✅ StoreController funcional");
  return true;
}
```

### 3. Pruebas de Integración

```javascript
// Verificar integración con ProductService
async function testProductServiceIntegration() {
  if (!window.ProductService) {
    throw new Error("ProductService no disponible");
  }

  const productService = new window.ProductService();
  await productService.initialize();

  const products = await productService.loadProductsByCategory("avatares");

  if (!products || products.length === 0) {
    throw new Error("No se cargaron productos");
  }

  console.log(`✅ ${products.length} productos cargados`);
  return true;
}
```

## Plan de Implementación

### Fase 1: Identificación y Análisis

1. **Identificar archivos conflictivos**

   - Localizar `js/pages/store-controller.js`
   - Verificar dependencias del archivo conflictivo
   - Documentar diferencias entre implementaciones

2. **Analizar impacto**
   - Verificar qué funcionalidades usa cada implementación
   - Identificar código que depende del archivo conflictivo
   - Planificar migración de funcionalidades únicas

### Fase 2: Resolución del Conflicto

1. **Remover script conflictivo**

   - Eliminar referencia en `store.html`
   - Renombrar o mover `js/pages/store-controller.js`
   - Verificar que no se carga el script conflictivo

2. **Validar implementación única**
   - Confirmar que solo `js/modules/store/StoreController.js` se carga
   - Verificar que `window.StoreController` está disponible
   - Probar inicialización exitosa

### Fase 3: Migración de Funcionalidades

1. **Identificar funcionalidades únicas**

   - Revisar código en `js/pages/store-controller.js`
   - Identificar métodos no presentes en la implementación corregida
   - Migrar funcionalidades necesarias

2. **Actualizar referencias**
   - Cambiar referencias de `window.storeController` a `window.StoreController`
   - Actualizar llamadas de métodos si es necesario
   - Verificar compatibilidad con HTML existente

### Fase 4: Testing y Validación

1. **Pruebas de funcionalidad**

   - Verificar que la tienda carga productos correctamente
   - Probar todas las categorías (avatares, monedas, powerups, premium)
   - Validar que no aparece "PRÓXIMAMENTE"

2. **Pruebas de integración**
   - Verificar integración con ProductService
   - Probar funcionalidades de compra
   - Validar manejo de errores

## Consideraciones de Rendimiento

### Carga de Scripts Optimizada

```html
<!-- Orden optimizado de carga -->
<script src="js/config/environment.js"></script>
<script src="js/config/product-pricing.js"></script>
<script src="js/modules/store/ProductService.js"></script>
<script src="js/modules/store/StoreController.js"></script>
<!-- NO cargar js/pages/store-controller.js -->
```

### Inicialización Eficiente

```javascript
// Inicialización única y eficiente
document.addEventListener("DOMContentLoaded", async function () {
  console.log("🏪 Inicializando tienda...");

  try {
    // Verificar disponibilidad
    if (!window.StoreController) {
      throw new Error("StoreController no disponible");
    }

    // Inicializar una sola vez
    await window.StoreController.initialize();
    console.log("✅ Tienda inicializada correctamente");
  } catch (error) {
    console.error("❌ Error inicializando tienda:", error);
    showImprovedFallback();
  }
});
```

## Consideraciones de Seguridad

### Validación de Implementación

```javascript
// Verificar que la implementación es la correcta
function validateStoreControllerImplementation() {
  if (!window.StoreController) {
    throw new Error("StoreController no disponible");
  }

  // Verificar métodos esperados de la implementación corregida
  const requiredMethods = [
    "initialize",
    "switchCategory",
    "loadCategoryProducts",
    "handleProductPurchase",
  ];

  for (const method of requiredMethods) {
    if (typeof window.StoreController[method] !== "function") {
      throw new Error(`Método requerido no encontrado: ${method}`);
    }
  }

  console.log("✅ Implementación de StoreController validada");
  return true;
}
```

### Prevención de Conflictos Futuros

```javascript
// Proteger contra sobrescritura accidental
Object.defineProperty(window, "StoreController", {
  writable: false,
  configurable: false,
});

console.log("🔒 StoreController protegido contra sobrescritura");
```

## Métricas de Éxito

### Indicadores de Resolución

1. **Carga Exitosa**

   - `window.StoreController` disponible: ✅
   - Solo una implementación activa: ✅
   - Inicialización sin errores: ✅

2. **Funcionalidad Restaurada**

   - Productos visibles en todas las categorías: ✅
   - No aparece "PRÓXIMAMENTE": ✅
   - Compras funcionando correctamente: ✅

3. **Rendimiento**
   - Tiempo de carga reducido: < 2 segundos
   - Memoria utilizada optimizada: < 50MB
   - Sin errores en consola: 0 errores

### Monitoreo Continuo

```javascript
// Sistema de monitoreo para detectar conflictos futuros
setInterval(() => {
  const hasConflict = detectStoreControllerConflict();
  if (hasConflict) {
    console.error("🚨 Conflicto de StoreController detectado");
    // Reportar o resolver automáticamente
  }
}, 30000); // Verificar cada 30 segundos
```
