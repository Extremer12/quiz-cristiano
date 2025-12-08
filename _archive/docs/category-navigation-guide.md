# Guía de Navegación de Categorías

## Introducción

El sistema de navegación de categorías proporciona una interfaz intuitiva y fluida para navegar entre las diferentes secciones de la tienda mejorada. Incluye transiciones suaves, indicadores visuales, accesibilidad completa y soporte para dispositivos móviles.

## Componentes Principales

### 1. CategoryNavigation (Componente Principal)

- **Archivo**: `js/modules/store/category-navigation.js`
- **Propósito**: Componente reutilizable para la navegación
- **Características**: Transiciones, accesibilidad, eventos

### 2. CategoryNavigationIntegration (Integración)

- **Archivo**: `js/modules/store/category-navigation-integration.js`
- **Propósito**: Integra el componente con la tienda existente
- **Características**: Gestión de estado, callbacks, URL handling

### 3. CategoryConfig (Configuración)

- **Archivo**: `js/modules/store/category-config.js`
- **Propósito**: Define las categorías disponibles
- **Características**: Configuración centralizada, iconos, colores

## Instalación y Configuración

### Paso 1: Incluir Archivos CSS

```html
<!-- En el <head> de tu HTML -->
<link rel="stylesheet" href="css/pages/store.css" />
<link rel="stylesheet" href="css/components/category-navigation.css" />
```

### Paso 2: Incluir Archivos JavaScript

```html
<!-- Antes del cierre de </body> -->
<script src="js/modules/store/category-config.js"></script>
<script src="js/modules/store/category-navigation.js"></script>
<script src="js/modules/store/category-navigation-integration.js"></script>
```

### Paso 3: Crear Contenedor HTML

```html
<div id="category-navigation" class="categories-nav enhanced">
  <!-- El componente se renderizará aquí automáticamente -->
</div>
```

## Uso Básico

### Inicialización Simple

```javascript
// Crear instancia básica
const categoryNav = new CategoryNavigation({
  container: "#category-navigation",
  activeCategory: "avatares",
  showDescriptions: true,
  showBadges: true,
});

// Configurar callback para cambios
categoryNav.onCategoryChange((newCategory, oldCategory) => {
  console.log(`Cambiando de ${oldCategory} a ${newCategory}`);
  loadProductsByCategory(newCategory);
});
```

### Integración Completa

```javascript
// Usar la clase de integración completa
const storeNavigation = new CategoryNavigationIntegration();

// Configurar callback personalizado
storeNavigation.onCategoryChange(async (newCategory, oldCategory) => {
  // Mostrar loading
  showLoadingState();

  // Cargar productos
  const products = await fetchProducts(newCategory);

  // Actualizar UI
  updateProductGrid(products);
  updateURL(newCategory);

  // Ocultar loading
  hideLoadingState();
});
```

## Configuración de Categorías

### Estructura de Configuración

```javascript
const CategoryConfig = {
  avatares: {
    name: "Avatares",
    icon: "fas fa-user-circle",
    description: "Personaliza tu perfil",
    products: ["individual", "pack"],
    sortBy: "popularity",
    color: "#4CAF50",
  },
  // ... más categorías
};
```

### Añadir Nueva Categoría

```javascript
// En category-config.js
CategoryConfig.nueva_categoria = {
  name: "Nueva Categoría",
  icon: "fas fa-star",
  description: "Descripción de la categoría",
  products: ["individual"],
  sortBy: "name",
  color: "#FF5722",
};
```

## API del Componente

### Métodos Principales

#### `setActiveCategory(categoryId, options)`

Cambia la categoría activa.

```javascript
categoryNav.setActiveCategory("monedas", {
  animate: true,
  silent: false,
});
```

#### `updateBadge(categoryId, count, options)`

Actualiza el badge de una categoría.

```javascript
categoryNav.updateBadge("powerups", 5, { animate: true });
```

#### `setCategoryEnabled(categoryId, enabled)`

Habilita o deshabilita una categoría.

```javascript
categoryNav.setCategoryEnabled("premium", false);
```

#### `onCategoryChange(callback)`

Establece callback para cambios de categoría.

```javascript
categoryNav.onCategoryChange((newCat, oldCat) => {
  // Manejar cambio
});
```

#### `onCategoryHover(callback)`

Establece callback para hover de categorías.

```javascript
categoryNav.onCategoryHover((categoryId, action) => {
  if (action === "enter") {
    preloadData(categoryId);
  }
});
```

### Propiedades

#### `getActiveCategory()`

Obtiene la categoría activa actual.

```javascript
const current = categoryNav.getActiveCategory();
```

#### `getCategories()`

Obtiene todas las categorías disponibles.

```javascript
const categories = categoryNav.getCategories();
```

## Personalización

### Opciones de Configuración

```javascript
const categoryNav = new CategoryNavigation({
  container: "#navigation", // Contenedor
  activeCategory: "avatares", // Categoría inicial
  showDescriptions: true, // Mostrar descripciones
  showBadges: true, // Mostrar badges
  enableKeyboardNav: true, // Navegación por teclado
  animationDuration: 300, // Duración de animaciones
});
```

### Personalización de Estilos

```css
/* Personalizar colores de categoría */
.category-btn[data-category="avatares"] {
  --category-color: #4caf50;
}

/* Personalizar hover effects */
.category-btn:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* Personalizar indicador */
.category-indicator {
  height: 6px;
  background: linear-gradient(90deg, #ffd700, #ff6b35);
}
```

## Accesibilidad

### Características Incluidas

- **Navegación por teclado**: Flechas, Home, End
- **ARIA labels**: Roles y estados apropiados
- **Focus management**: Indicadores visuales claros
- **Screen reader support**: Anuncios de cambios

### Navegación por Teclado

- `←/→`: Navegar entre categorías
- `Home`: Primera categoría
- `End`: Última categoría
- `Enter/Space`: Activar categoría

### Personalizar Accesibilidad

```javascript
// Configurar labels personalizados
categoryNav.updateOptions({
  ariaLabel: "Navegación de productos de la tienda",
  announceChanges: true,
});
```

## Responsive Design

### Breakpoints Incluidos

- **Desktop**: > 1024px - Navegación completa
- **Tablet**: 768px - 1024px - Navegación compacta
- **Mobile**: < 768px - Navegación simplificada
- **Small Mobile**: < 480px - Solo iconos y nombres

### Personalizar Responsive

```css
@media (max-width: 600px) {
  .category-desc {
    display: none;
  }

  .category-btn {
    min-width: 50px;
    padding: 8px 4px;
  }
}
```

## Integración con Analytics

### Tracking de Eventos

```javascript
categoryNav.onCategoryChange((newCategory, oldCategory) => {
  // Google Analytics
  gtag("event", "category_switch", {
    event_category: "store_navigation",
    event_label: `${oldCategory}_to_${newCategory}`,
    value: 1,
  });

  // Custom analytics
  trackEvent("store_category_change", {
    from: oldCategory,
    to: newCategory,
    timestamp: Date.now(),
  });
});
```

## Optimización de Performance

### Lazy Loading

```javascript
// Precargar datos en hover
categoryNav.onCategoryHover((categoryId, action) => {
  if (action === "enter") {
    // Precargar datos en background
    preloadCategoryData(categoryId);
  }
});
```

### Caching

```javascript
// Cache de productos por categoría
const productCache = new Map();

async function loadProducts(categoryId) {
  if (productCache.has(categoryId)) {
    return productCache.get(categoryId);
  }

  const products = await fetchProducts(categoryId);
  productCache.set(categoryId, products);
  return products;
}
```

## Troubleshooting

### Problemas Comunes

#### La navegación no se muestra

```javascript
// Verificar que el contenedor existe
const container = document.querySelector("#category-navigation");
if (!container) {
  console.error("Contenedor no encontrado");
}

// Verificar que los estilos están cargados
const styles = getComputedStyle(container);
console.log("Display:", styles.display);
```

#### Las transiciones no funcionan

```css
/* Verificar que las transiciones están habilitadas */
.category-btn {
  transition: all 0.3s ease !important;
}

/* Verificar prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .category-btn {
    transition: none;
  }
}
```

#### Los eventos no se disparan

```javascript
// Verificar que los callbacks están configurados
if (!categoryNav.onCategoryChangeCallback) {
  console.warn("Callback de cambio de categoría no configurado");
}

// Verificar que los elementos tienen event listeners
const buttons = document.querySelectorAll(".category-btn");
console.log("Botones encontrados:", buttons.length);
```

## Ejemplos Avanzados

### Integración con Router

```javascript
// Sincronizar con router de SPA
categoryNav.onCategoryChange((newCategory) => {
  router.navigate(`/store/${newCategory}`);
});

// Escuchar cambios de ruta
router.on("route:store", (category) => {
  categoryNav.setActiveCategory(category, { silent: true });
});
```

### Animaciones Personalizadas

```javascript
// Animación personalizada al cambiar categoría
categoryNav.onCategoryChange(async (newCategory, oldCategory) => {
  // Fade out contenido actual
  await fadeOut(".products-grid");

  // Cargar nuevo contenido
  const products = await loadProducts(newCategory);
  updateGrid(products);

  // Fade in nuevo contenido
  await fadeIn(".products-grid");
});
```

### Integración con Estado Global

```javascript
// Redux/Vuex integration
categoryNav.onCategoryChange((newCategory) => {
  store.dispatch("setActiveCategory", newCategory);
  store.dispatch("loadProducts", newCategory);
});

// Escuchar cambios de estado
store.subscribe((state) => {
  if (state.activeCategory !== categoryNav.getActiveCategory()) {
    categoryNav.setActiveCategory(state.activeCategory, { silent: true });
  }
});
```

## Conclusión

El sistema de navegación de categorías proporciona una base sólida y flexible para la navegación en la tienda mejorada. Con soporte completo para accesibilidad, responsive design y personalización, puede adaptarse a las necesidades específicas de cualquier implementación.

Para más información o soporte, consulta los archivos de ejemplo incluidos o revisa el código fuente de los componentes.
