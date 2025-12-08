# Guía del Sistema de Packs

## Introducción

El sistema de packs es una funcionalidad avanzada de la tienda que permite agrupar múltiples productos en ofertas especiales con descuentos dinámicos. Los packs se adaptan automáticamente al inventario del usuario, calculando precios justos basados en los items que ya posee.

## Características Principales

### 1. Precios Dinámicos

- Los packs ajustan su precio automáticamente según los items que el usuario ya posee
- Si un usuario ya tiene algunos items del pack, solo paga por los items restantes
- Se mantiene el descuento proporcional del pack original

### 2. Descuentos Inteligentes

- Cada pack tiene un porcentaje de descuento base
- El sistema calcula el descuento real considerando items ya poseídos
- Precio mínimo configurable para evitar precios demasiado bajos

### 3. Sugerencias Automáticas

- El sistema sugiere packs cuando el usuario selecciona items individuales
- Compara precios y muestra ahorros potenciales
- Prioriza las mejores ofertas disponibles

## Estructura de un Pack

```javascript
{
  id: "pack_avatares_clasicos",
  name: "Pack Avatares Clásicos",
  description: "3 avatares clásicos con 25% de descuento",
  category: "avatares",
  type: "pack",
  price: { coins: 337, usd: 6.99, ars: 700 },
  items: ["avatar_biblical_1", "avatar_biblical_2", "avatar_biblical_3"],
  discountPercentage: 25,
  images: ["avatar_pack1.png"],
  metadata: {
    minimumPrice: 50,
    tags: ["popular", "beginner"]
  },
  dynamicPricing: true,
  availability: {
    enabled: true,
    startDate: null,
    endDate: null
  }
}
```

## Componentes del Sistema

### 1. PackPricingEngine

Motor principal que calcula precios dinámicos y descuentos.

**Funciones principales:**

- `calculatePackPrice(packId, userId)`: Calcula el precio final del pack
- `calculatePackDiscount(packId, userOwnedItems)`: Calcula descuentos aplicables
- `suggestBetterDeals(selectedItems, userId)`: Sugiere packs mejores que compras individuales

### 2. ProductService

Gestiona la carga y acceso a packs.

**Funciones relacionadas con packs:**

- `getPacksByCategory(category)`: Obtiene packs por categoría
- `suggestBetterDeals(selectedItems, userId)`: Integración con PackPricingEngine
- `loadProductsByCategory(categoryId)`: Incluye packs en la carga de productos

### 3. PackCard

Componente UI para mostrar packs en la tienda.

**Características:**

- Muestra precio original y precio con descuento
- Indica items ya poseídos por el usuario
- Badges informativos (descuento, popularidad, etc.)
- Botones de compra adaptados al estado del pack

## Tipos de Packs

### 1. Packs de Avatares

```javascript
{
  category: "avatares",
  items: ["avatar_1", "avatar_2", "avatar_3"],
  discountPercentage: 25
}
```

### 2. Packs de Monedas

```javascript
{
  category: "monedas",
  type: "pack",
  price: { coins: 0, usd: 4.99, ars: 500 },
  bonusPercentage: 10 // Monedas extra incluidas
}
```

### 3. Packs de Power-ups

```javascript
{
  category: "powerups",
  items: ["pista_x2", "tiempo_extra_x2", "saltar_x1"],
  discountPercentage: 20
}
```

## Algoritmo de Precios Dinámicos

### Paso 1: Análisis de Items

```javascript
// Separar items ya poseídos de items nuevos
const itemsToInclude = pack.items.filter(
  (item) => !userOwnedItems.includes(item)
);
const itemsAlreadyOwned = pack.items.filter((item) =>
  userOwnedItems.includes(item)
);
```

### Paso 2: Cálculo Base

```javascript
// Precio individual total de items nuevos
const totalIndividualPrice = itemsToInclude.reduce((sum, item) => {
  return sum + item.price.coins;
}, 0);

// Aplicar descuento del pack
const baseDiscountedPrice =
  totalIndividualPrice * (1 - pack.discountPercentage / 100);
```

### Paso 3: Ajuste Proporcional

```javascript
// Factor proporcional basado en items incluidos
const proportionalFactor = itemsToInclude.length / pack.items.length;
let finalPrice = Math.floor(baseDiscountedPrice * proportionalFactor);

// Respetar precio mínimo si está configurado
if (pack.metadata?.minimumPrice) {
  finalPrice = Math.max(finalPrice, pack.metadata.minimumPrice);
}
```

## Casos de Uso

### Caso 1: Usuario sin Items del Pack

- **Situación**: Usuario no posee ningún item del pack
- **Resultado**: Precio completo con descuento del pack
- **Mensaje**: "Pack completo con X% de descuento"

### Caso 2: Usuario con Algunos Items

- **Situación**: Usuario posee 1-2 items de un pack de 3
- **Resultado**: Precio proporcional solo por items restantes
- **Mensaje**: "X items nuevos (ya tienes Y) con Z% de descuento"

### Caso 3: Usuario con Todos los Items

- **Situación**: Usuario ya posee todos los items del pack
- **Resultado**: Precio = 0, pack no disponible para compra
- **Mensaje**: "Ya posees todos los items de este pack"

## Integración con la UI

### Mostrar Packs en Categorías

```javascript
// En store-new.html
const packs = await productService.getPacksByCategory(categoryId);
packs.forEach((pack) => {
  const packCard = new PackCard(pack, userOwnedItems);
  container.appendChild(packCard.render());
});
```

### Sugerencias de Packs

```javascript
// Cuando usuario selecciona items individuales
const suggestions = await productService.suggestBetterDeals(
  selectedItems,
  userId
);
if (suggestions.length > 0) {
  showPackSuggestions(suggestions);
}
```

### Compra de Packs

```javascript
// Manejar compra de pack
document.addEventListener("pack-purchase-requested", async (event) => {
  const { pack, purchaseType } = event.detail;
  await transactionService.processPurchase(pack, purchaseType);
});
```

## Configuración y Personalización

### Crear Nuevo Pack

```javascript
const newPack = ProductSchema.createPack({
  name: "Mi Pack Personalizado",
  description: "Descripción del pack",
  category: "categoria",
  items: ["item1", "item2", "item3"],
  discountPercentage: 30,
  price: { coins: 500 },
  metadata: {
    minimumPrice: 100,
    tags: ["nuevo", "popular"],
  },
});
```

### Configurar Descuentos Especiales

```javascript
// En pack metadata
metadata: {
  minimumPrice: 50,
  maxDiscount: 50, // Descuento máximo permitido
  seasonalBonus: 10, // Bonus adicional por temporada
  tags: ["limited", "seasonal"]
}
```

## Testing

El sistema incluye tests comprehensivos en `tests/store/pack-pricing-engine.test.js`:

- Tests de cálculo de precios para diferentes escenarios
- Tests de manejo de casos edge
- Tests de validación de datos
- Tests de integración con otros servicios

### Ejecutar Tests

```bash
npm test -- pack-pricing-engine.test.js
```

## Mejores Prácticas

### 1. Configuración de Packs

- Siempre definir un precio mínimo razonable
- Usar descuentos atractivos pero sostenibles (15-30%)
- Agrupar items relacionados temáticamente

### 2. UX/UI

- Mostrar claramente el ahorro al usuario
- Indicar items ya poseídos de forma visual
- Proporcionar comparaciones de precio claras

### 3. Performance

- Cachear cálculos de precios cuando sea posible
- Usar lazy loading para packs no visibles
- Optimizar consultas de items poseídos por usuario

## Troubleshooting

### Problema: Precios Incorrectos

- Verificar que `PackPricingEngine` esté inicializado
- Comprobar que `userStoreDataService` esté disponible
- Revisar configuración de `minimumPrice` en metadata

### Problema: Packs No Aparecen

- Verificar que `type: "pack"` esté configurado
- Comprobar que la categoría del pack existe
- Revisar filtros de disponibilidad

### Problema: Descuentos No Se Aplican

- Verificar `discountPercentage` en configuración del pack
- Comprobar que items del pack existan en el sistema
- Revisar lógica de items ya poseídos

## Roadmap Futuro

### Funcionalidades Planificadas

- Packs temporales con fechas de expiración
- Packs dinámicos basados en comportamiento del usuario
- Sistema de recomendaciones ML para packs personalizados
- Packs con items de diferentes categorías
- Sistema de pre-orden para packs futuros
