# Documento de Diseño - Mejora de Tienda

## Introducción

Este documento define la arquitectura y diseño técnico para la mejora integral de la tienda del Quiz Cristiano. El diseño se basa en los requisitos establecidos y busca crear una experiencia de compra escalable, organizada por categorías y con múltiples opciones de productos incluyendo avatares, monedas, power-ups y suscripciones premium.

## Arquitectura

### Arquitectura General

La tienda mejorada seguirá una arquitectura modular basada en el patrón MVC existente del proyecto, con las siguientes capas principales:

```
┌─────────────────────────────────────────┐
│           Interfaz de Usuario           │
│  (store-new.html + CSS + Componentes)   │
├─────────────────────────────────────────┤
│          Controlador de Tienda          │
│     (store-controller.js)               │
├─────────────────────────────────────────┤
│         Servicios de Negocio            │
│  ┌─────────────┬─────────────────────┐   │
│  │ ProductService │ PaymentService   │   │
│  │ CartService    │ SubscriptionSvc  │   │
│  └─────────────┴─────────────────────┘   │
├─────────────────────────────────────────┤
│        Proveedores de Datos             │
│  ┌─────────────┬─────────────────────┐   │
│  │ FirestoreDB │ LocalStorage       │   │
│  │ PayPal API  │ MercadoPago API    │   │
│  └─────────────┴─────────────────────┘   │
└─────────────────────────────────────────┘
```

### Patrones de Diseño Utilizados

1. **Module Pattern**: Para encapsular funcionalidades específicas
2. **Observer Pattern**: Para notificaciones de cambios de estado
3. **Strategy Pattern**: Para diferentes métodos de pago
4. **Factory Pattern**: Para crear productos dinámicamente
5. **Singleton Pattern**: Para servicios compartidos

## Componentes y Interfaces

### 1. Controlador Principal de Tienda

**Archivo**: `js/pages/store-controller.js`

```javascript
class StoreController {
  constructor() {
    this.productService = new ProductService();
    this.cartService = new CartService();
    this.paymentService = new PaymentService();
    this.currentCategory = 'avatares';
    this.currentUser = null;
  }

  // Métodos principales
  async initialize()
  switchCategory(category)
  async loadProducts(category)
  handleProductPurchase(productId)
  updateUI()
}
```

### 2. Servicio de Productos

**Archivo**: `js/modules/store/product-service.js`

```javascript
class ProductService {
  constructor() {
    this.products = new Map();
    this.categories = new Map();
    this.packs = new Map();
  }

  // Gestión de productos
  async loadProductsByCategory(category)
  getProduct(productId)
  getPacksByCategory(category)
  calculatePackDiscount(packId, userOwnedItems)
  suggestBetterDeals(selectedItems)
  
  // Validaciones
  canUserAfford(productId, userId)
  hasUserPurchased(productId, userId)
}
```

### 3. Servicio de Carrito

**Archivo**: `js/modules/store/cart-service.js`

```javascript
class CartService {
  constructor() {
    this.items = [];
    this.observers = [];
  }

  // Gestión del carrito
  addItem(productId, quantity = 1)
  removeItem(productId)
  clearCart()
  calculateTotal()
  suggestPacks()
  
  // Notificaciones
  subscribe(observer)
  notify(event, data)
}
```

### 4. Componentes de UI

**Archivo**: `js/modules/store/ui-components.js`

```javascript
// Componentes reutilizables
class ProductCard {
  render(product, userContext)
  handlePurchaseClick()
  showPreview()
}

class PackCard {
  render(pack, userContext)
  calculateSavings()
  showPackContents()
}

class CategoryNavigation {
  render(categories, activeCategory)
  handleCategorySwitch()
}

class PurchaseModal {
  show(product, paymentOptions)
  handlePaymentSelection()
  processPayment()
}
```

## Modelos de Datos

### Estructura de Productos

```javascript
// Producto base
const ProductSchema = {
  id: String,
  name: String,
  description: String,
  category: String, // 'avatares', 'monedas', 'powerups', 'premium'
  type: String, // 'individual', 'pack', 'subscription'
  price: {
    coins: Number,
    usd: Number,
    ars: Number
  },
  images: [String],
  metadata: Object, // Datos específicos por tipo
  availability: {
    startDate: Date,
    endDate: Date,
    isActive: Boolean
  },
  freeEarnMethod: {
    enabled: Boolean,
    requirements: [Object],
    estimatedTime: String
  }
};

// Pack/Bundle
const PackSchema = {
  ...ProductSchema,
  items: [String], // IDs de productos incluidos
  discountPercentage: Number,
  dynamicPricing: Boolean // Ajusta precio si usuario ya tiene algunos items
};

// Suscripción
const SubscriptionSchema = {
  ...ProductSchema,
  duration: String, // 'monthly', 'yearly'
  benefits: [String],
  autoRenew: Boolean
};
```

### Estructura de Usuario

```javascript
const UserStoreDataSchema = {
  userId: String,
  ownedProducts: [String],
  activeSubscriptions: [Object],
  purchaseHistory: [Object],
  coins: Number,
  statistics: {
    totalSpent: Number,
    totalPurchases: Number,
    lastPurchaseDate: Date,
    favoriteCategory: String
  },
  freeEarnProgress: Map // productId -> progress
};
```

### Estructura de Transacciones

```javascript
const TransactionSchema = {
  id: String,
  userId: String,
  productId: String,
  type: String, // 'purchase', 'subscription', 'free_earn'
  amount: {
    coins: Number,
    usd: Number,
    ars: Number
  },
  paymentMethod: String,
  status: String, // 'pending', 'completed', 'failed', 'refunded'
  timestamp: Date,
  metadata: Object
};
```

## Gestión de Categorías

### Sistema de Categorías Dinámico

```javascript
const CategoryConfig = {
  avatares: {
    name: 'Avatares',
    icon: 'fas fa-user-circle',
    description: 'Personaliza tu perfil',
    products: ['individual', 'pack'],
    sortBy: 'popularity'
  },
  monedas: {
    name: 'Monedas',
    icon: 'fas fa-coins',
    description: 'Paquetes con bonus',
    products: ['pack'],
    sortBy: 'value'
  },
  powerups: {
    name: 'Power-ups',
    icon: 'fas fa-bolt',
    description: 'Mejora tu juego',
    products: ['individual', 'combo'],
    sortBy: 'usage'
  },
  premium: {
    name: 'Premium',
    icon: 'fas fa-crown',
    description: 'Beneficios exclusivos',
    products: ['subscription'],
    sortBy: 'benefits'
  }
};
```

## Sistema de Packs y Descuentos

### Algoritmo de Cálculo de Descuentos

```javascript
class PackPricingEngine {
  calculatePackPrice(packId, userId) {
    const pack = this.productService.getPack(packId);
    const userOwnedItems = this.getUserOwnedItems(userId);
    
    let totalIndividualPrice = 0;
    let itemsToInclude = [];
    
    pack.items.forEach(itemId => {
      if (!userOwnedItems.includes(itemId)) {
        const item = this.productService.getProduct(itemId);
        totalIndividualPrice += item.price.coins;
        itemsToInclude.push(itemId);
      }
    });
    
    if (itemsToInclude.length === 0) return 0;
    
    const discountedPrice = totalIndividualPrice * (1 - pack.discountPercentage / 100);
    const proportionalDiscount = (itemsToInclude.length / pack.items.length);
    
    return Math.floor(discountedPrice * proportionalDiscount);
  }
  
  suggestBetterDeals(selectedItems) {
    // Lógica para sugerir packs más económicos
    const availablePacks = this.findPacksContaining(selectedItems);
    return availablePacks.filter(pack => 
      this.calculatePackPrice(pack.id) < this.calculateIndividualTotal(selectedItems)
    );
  }
}
```

## Sistema de Obtención Gratuita

### Configuración de Requisitos

```javascript
const FreeEarnConfig = {
  avatar_premium_1: {
    requirements: [
      {
        type: 'perfect_games',
        target: 500,
        description: 'Juega 500 partidas perfectas',
        estimatedTime: '2-3 meses de juego diario'
      },
      {
        type: 'consecutive_streaks',
        target: 50,
        streakLength: 20,
        description: 'Alcanza 50 rachas de 20 respuestas correctas',
        estimatedTime: '1-2 meses de juego intensivo'
      }
    ],
    totalEstimatedTime: '3-4 meses',
    difficultyMultiplier: 15 // 15x más tiempo que comprar
  }
};

class FreeEarnService {
  checkProgress(userId, productId) {
    const config = FreeEarnConfig[productId];
    const userProgress = this.getUserProgress(userId, productId);
    
    return config.requirements.map(req => ({
      ...req,
      current: userProgress[req.type] || 0,
      percentage: ((userProgress[req.type] || 0) / req.target) * 100,
      completed: (userProgress[req.type] || 0) >= req.target
    }));
  }
  
  updateProgress(userId, eventType, data) {
    // Actualiza progreso basado en eventos del juego
    const affectedProducts = this.getProductsWithFreeEarn(eventType);
    affectedProducts.forEach(productId => {
      this.incrementProgress(userId, productId, eventType, data);
    });
  }
}
```

## Integración de Pagos

### Servicio de Pagos Unificado

```javascript
class PaymentService {
  constructor() {
    this.providers = {
      paypal: new PayPalProvider(),
      mercadopago: new MercadoPagoProvider(),
      coins: new CoinsProvider()
    };
  }
  
  async processPayment(productId, paymentMethod, userId) {
    const product = this.productService.getProduct(productId);
    const provider = this.providers[paymentMethod];
    
    try {
      const transaction = await provider.createTransaction(product, userId);
      const result = await provider.processPayment(transaction);
      
      if (result.success) {
        await this.fulfillPurchase(productId, userId, transaction);
        await this.recordTransaction(transaction, 'completed');
      }
      
      return result;
    } catch (error) {
      await this.recordTransaction(transaction, 'failed');
      throw error;
    }
  }
  
  async fulfillPurchase(productId, userId, transaction) {
    const product = this.productService.getProduct(productId);
    
    switch (product.category) {
      case 'avatares':
        await this.unlockAvatar(userId, productId);
        break;
      case 'monedas':
        await this.addCoins(userId, product.metadata.coinAmount);
        break;
      case 'powerups':
        await this.addPowerUps(userId, product.metadata.powerUps);
        break;
      case 'premium':
        await this.activateSubscription(userId, product);
        break;
    }
  }
}
```

## Gestión de Suscripciones

### Servicio de Suscripciones

```javascript
class SubscriptionService {
  async activateSubscription(userId, subscriptionProduct) {
    const subscription = {
      userId,
      productId: subscriptionProduct.id,
      startDate: new Date(),
      endDate: this.calculateEndDate(subscriptionProduct.duration),
      status: 'active',
      autoRenew: true,
      benefits: subscriptionProduct.benefits
    };
    
    await this.saveSubscription(subscription);
    await this.applyBenefits(userId, subscription.benefits);
    await this.scheduleRenewal(subscription);
  }
  
  async checkExpiredSubscriptions() {
    const expiredSubs = await this.getExpiredSubscriptions();
    
    for (const sub of expiredSubs) {
      if (sub.autoRenew) {
        await this.attemptRenewal(sub);
      } else {
        await this.deactivateSubscription(sub);
      }
    }
  }
  
  async deactivateSubscription(subscription) {
    await this.removeBenefits(subscription.userId, subscription.benefits);
    subscription.status = 'expired';
    await this.updateSubscription(subscription);
  }
}
```

## Manejo de Errores

### Estrategia de Manejo de Errores

```javascript
class StoreErrorHandler {
  static handlePaymentError(error, context) {
    const errorTypes = {
      'INSUFFICIENT_FUNDS': {
        message: 'No tienes suficientes monedas para esta compra',
        action: 'redirect_to_coins',
        severity: 'warning'
      },
      'PAYMENT_FAILED': {
        message: 'El pago no pudo procesarse. Intenta nuevamente.',
        action: 'retry_payment',
        severity: 'error'
      },
      'NETWORK_ERROR': {
        message: 'Error de conexión. Verifica tu internet.',
        action: 'retry_later',
        severity: 'error'
      },
      'PRODUCT_UNAVAILABLE': {
        message: 'Este producto ya no está disponible',
        action: 'refresh_store',
        severity: 'info'
      }
    };
    
    const errorInfo = errorTypes[error.code] || errorTypes['NETWORK_ERROR'];
    this.showErrorModal(errorInfo, context);
    this.logError(error, context);
  }
  
  static showErrorModal(errorInfo, context) {
    const modal = new ErrorModal();
    modal.show({
      message: errorInfo.message,
      severity: errorInfo.severity,
      actions: this.getErrorActions(errorInfo.action, context)
    });
  }
}
```

## Estrategia de Testing

### Tipos de Tests

1. **Tests Unitarios**
   - Servicios de productos y carrito
   - Cálculos de precios y descuentos
   - Validaciones de compra

2. **Tests de Integración**
   - Flujo completo de compra
   - Integración con proveedores de pago
   - Sincronización con Firestore

3. **Tests E2E**
   - Navegación entre categorías
   - Proceso de compra completo
   - Gestión de suscripciones

### Configuración de Tests

```javascript
// jest.config.js para tests unitarios
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
  collectCoverageFrom: [
    'js/modules/store/**/*.js',
    'js/pages/store-*.js'
  ]
};

// Ejemplo de test unitario
describe('ProductService', () => {
  test('should calculate pack discount correctly', () => {
    const productService = new ProductService();
    const packPrice = productService.calculatePackPrice('avatar_pack_1', 'user123');
    expect(packPrice).toBeLessThan(100); // Precio individual total
  });
});
```

## Optimización y Performance

### Estrategias de Optimización

1. **Lazy Loading**: Cargar productos por categoría bajo demanda
2. **Caching**: Cache de productos y configuraciones en localStorage
3. **Image Optimization**: Imágenes optimizadas y lazy loading
4. **Bundle Splitting**: Código de tienda separado del core de la app

### Métricas de Performance

```javascript
class StoreAnalytics {
  trackPageLoad(category) {
    const loadTime = performance.now() - this.startTime;
    this.sendMetric('store_page_load', {
      category,
      loadTime,
      timestamp: Date.now()
    });
  }
  
  trackPurchaseFlow(step, duration) {
    this.sendMetric('purchase_flow', {
      step, // 'product_view', 'add_to_cart', 'payment', 'completion'
      duration,
      timestamp: Date.now()
    });
  }
}
```

Este diseño proporciona una base sólida y escalable para la tienda mejorada, cumpliendo con todos los requisitos establecidos y permitiendo futuras expansiones de manera eficiente.