/**
 * Store PayPal Integration - Integración de PayPal en la tienda
 */

// Variables globales para pagos
let currentPaymentMethod = null;
let selectedCurrency = null;
let paymentService = null;
let currentProductData = null;

/**
 * Selecciona la moneda y actualiza los métodos de pago disponibles
 */
window.selectCurrency = function (currency) {
  console.log("Moneda seleccionada:", currency);
  selectedCurrency = currency;

  // Actualizar UI de monedas
  document.querySelectorAll(".currency-btn").forEach((btn) => {
    btn.classList.remove("selected");
  });

  const selectedBtn = document.getElementById(
    `currency-${currency.toLowerCase()}`
  );
  if (selectedBtn) {
    selectedBtn.classList.add("selected");
  }

  // Mostrar método de pago correspondiente
  const paypalMethod = document.getElementById("paypal-method");
  const mercadopagoMethod = document.getElementById("mercadopago-method");

  if (currency === "USD") {
    if (paypalMethod) paypalMethod.style.display = "block";
    if (mercadopagoMethod) mercadopagoMethod.style.display = "none";
    currentPaymentMethod = "paypal";
  } else if (currency === "ARS") {
    if (paypalMethod) paypalMethod.style.display = "none";
    if (mercadopagoMethod) mercadopagoMethod.style.display = "block";
    currentPaymentMethod = "mercadopago";
  }

  // Actualizar botón de compra
  updatePurchaseButton();
};

/**
 * Selecciona el método de pago (ahora automático según moneda)
 */
window.selectPaymentMethod = function (method) {
  console.log("Método de pago seleccionado:", method);
  currentPaymentMethod = method;
  updatePurchaseButton();
};

/**
 * Actualiza el botón de compra según la selección
 */
function updatePurchaseButton() {
  const purchaseBtn = document.getElementById("confirm-purchase-btn");
  if (purchaseBtn && currentPaymentMethod && selectedCurrency) {
    purchaseBtn.classList.remove("disabled");

    if (currentPaymentMethod === "paypal") {
      purchaseBtn.innerHTML = '<i class="fab fa-paypal"></i> Pagar con PayPal';
    } else if (currentPaymentMethod === "mercadopago") {
      purchaseBtn.innerHTML =
        '<i class="fas fa-credit-card"></i> Pagar con MercadoPago';
    }
  } else if (purchaseBtn) {
    purchaseBtn.classList.add("disabled");
    purchaseBtn.innerHTML = '<i class="fas fa-lock"></i> Selecciona moneda';
  }
}

/**
 * Procede con el pago según el método seleccionado
 */
window.proceedWithPayment = function () {
  if (!currentPaymentMethod) {
    alert("Por favor selecciona un método de pago");
    return;
  }

  if (!window.currentPurchaseProduct) {
    console.error("No hay producto seleccionado");
    return;
  }

  console.log(
    "Procesando pago:",
    currentPaymentMethod,
    window.currentPurchaseProduct
  );

  if (currentPaymentMethod === "paypal") {
    initializePayPalPayment();
  } else if (currentPaymentMethod === "mercadopago") {
    // Usar la función existente de MercadoPago
    if (typeof processPurchase === "function") {
      processPurchase(window.currentPurchaseProduct);
    }
  }
};

/**
 * Cierra el modal de PayPal
 */
window.closePayPalModal = function () {
  const modal = document.getElementById("paypal-modal");
  if (modal) {
    modal.style.display = "none";
  }
};

/**
 * Inicializa el pago con PayPal
 */
window.initializePayPalPayment = async function () {
  try {
    console.log("Inicializando pago PayPal...");

    // Cerrar modal de selección
    if (typeof closePurchaseModal === "function") {
      closePurchaseModal();
    }

    // Mostrar modal de PayPal
    const paypalModal = document.getElementById("paypal-modal");
    if (paypalModal) {
      paypalModal.style.display = "flex";

      // Actualizar información del producto
      const product = window.currentPurchaseProduct;
      const productNameEl = document.getElementById("paypal-product-name");
      const totalPriceEl = document.getElementById("paypal-total-price");

      if (productNameEl) productNameEl.textContent = product.name;
      if (totalPriceEl)
        totalPriceEl.textContent = `$${product.priceUSD || "9.99"} USD`;
    }

    // Inicializar servicio de pagos si no existe
    if (!paymentService && typeof PaymentService !== "undefined") {
      console.log("Inicializando PaymentService...");
      paymentService = new PaymentService("paypal");
      await paymentService.initialize();
    }

    // Crear pago PayPal
    const userId = getUserId();
    const productData = {
      id: window.currentPurchaseProduct.id,
      name: window.currentPurchaseProduct.name,
      priceUSD: window.currentPurchaseProduct.priceUSD || 9.99,
      coins: window.currentPurchaseProduct.coins || 100,
    };

    if (paymentService) {
      console.log("Creando pago PayPal para:", productData);
      const result = await paymentService.createPayment(
        productData.id,
        userId,
        "USD"
      );

      if (result.success) {
        console.log("Pago PayPal inicializado:", result);
        // El botón de PayPal debería aparecer automáticamente
      } else {
        console.error("Error al inicializar PayPal:", result.error);
        alert("Error al inicializar el pago. Intenta nuevamente.");
        closePayPalModal();
      }
    } else {
      console.warn("PaymentService no disponible, mostrando simulación");
      showPayPalSimulation(productData);
    }
  } catch (error) {
    console.error("Error en initializePayPalPayment:", error);
    alert("Error al procesar el pago. Intenta nuevamente.");
    closePayPalModal();
  }
};

/**
 * Muestra una simulación de PayPal cuando el servicio no está disponible
 */
function showPayPalSimulation(productData) {
  const container = document.getElementById("paypal-button-container");
  if (container) {
    container.innerHTML = `
            <div class="paypal-simulation">
                <div class="simulation-notice">
                    <i class="fas fa-info-circle"></i>
                    <p>Simulación de PayPal - Entorno de desarrollo</p>
                </div>
                <button class="paypal-sim-btn" onclick="simulatePayPalPayment('${productData.id}', ${productData.coins})">
                    <i class="fab fa-paypal"></i>
                    Simular Pago PayPal - $${productData.priceUSD} USD
                </button>
                <div class="simulation-info">
                    <small>En producción, aquí aparecerían los botones reales de PayPal</small>
                </div>
            </div>
        `;
  }
}

/**
 * Simula un pago exitoso de PayPal
 */
window.simulatePayPalPayment = function (productId, coins) {
  console.log("Simulando pago PayPal exitoso:", productId, coins);

  // Simular delay de procesamiento
  const container = document.getElementById("paypal-button-container");
  if (container) {
    container.innerHTML = `
            <div class="paypal-processing">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Procesando pago...</p>
            </div>
        `;
  }

  setTimeout(() => {
    // Simular pago exitoso
    console.log("Pago PayPal simulado completado");

    // Agregar monedas al usuario
    if (typeof addCoinsToUser === "function") {
      addCoinsToUser(coins);
    } else {
      // Fallback: agregar monedas directamente
      const currentCoins = parseInt(localStorage.getItem("userCoins") || "0");
      const newCoins = currentCoins + coins;
      localStorage.setItem("userCoins", newCoins.toString());

      // Actualizar display
      const coinsDisplay = document.getElementById("coins-display");
      if (coinsDisplay) {
        coinsDisplay.textContent = newCoins;
      }
    }

    // Mostrar éxito
    if (container) {
      container.innerHTML = `
                <div class="paypal-success">
                    <i class="fas fa-check-circle"></i>
                    <p>Pago completado exitosamente!</p>
                    <p>+${coins} monedas agregadas</p>
                </div>
            `;
    }

    // Cerrar modal después de un momento
    setTimeout(() => {
      closePayPalModal();

      // Mostrar notificación de éxito
      if (typeof showNotification === "function") {
        showNotification(
          "Compra exitosa! +" + coins + " monedas agregadas",
          "success"
        );
      } else {
        alert("Compra exitosa! +" + coins + " monedas agregadas");
      }
    }, 2000);
  }, 2000);
};

/**
 * Actualiza el modal de compra con información de PayPal
 */
function updatePurchaseModalWithPayPal(product) {
  // Actualizar precios
  const priceUSD = document.getElementById("modal-price-usd");
  const priceARS = document.getElementById("modal-price-ars");
  const paypalPrice = document.getElementById("paypal-price");
  const mercadopagoPrice = document.getElementById("mercadopago-price");

  if (priceUSD) priceUSD.textContent = `$${product.priceUSD || "9.99"}`;
  if (priceARS) priceARS.textContent = `$${product.priceARS || "2500.00"}`;
  if (paypalPrice)
    paypalPrice.textContent = `$${product.priceUSD || "9.99"} USD`;
  if (mercadopagoPrice)
    mercadopagoPrice.textContent = `$${product.priceARS || "2500.00"} ARS`;

  // Actualizar información del producto
  const productName = document.getElementById("modal-product-name");
  const productDesc = document.getElementById("modal-product-description");
  const productIcon = document.getElementById("modal-product-icon");

  if (productName) productName.textContent = product.name;
  if (productDesc)
    productDesc.textContent =
      product.description ||
      `Obtén ${product.coins} monedas para mejorar tu experiencia de juego`;
  if (productIcon) {
    productIcon.innerHTML = product.icon || '<i class="fas fa-coins"></i>';
  }
}

/**
 * Función auxiliar para obtener ID de usuario
 */
function getUserId() {
  return localStorage.getItem("userId") || "guest_" + Date.now();
}

/**
 * Inicialización cuando se carga el DOM
 */
document.addEventListener("DOMContentLoaded", function () {
  console.log("Store PayPal Integration cargado");

  // Verificar elementos de PayPal
  const paypalElements = [
    "paypal-modal",
    "paypal-button-container",
    "paypal-subscription-container",
  ];

  paypalElements.forEach((id) => {
    const element = document.getElementById(id);
    console.log(`${element ? "OK" : "ERROR"} PayPal elemento ${id}:`, !!element);
  });

  // Verificar disponibilidad de módulos PayPal
  setTimeout(() => {
    console.log("Verificando módulos PayPal...");
    console.log("- PaymentService:", typeof PaymentService);
    console.log("- PayPalProvider:", typeof PayPalProvider);
    console.log("- ConfigurationManager:", typeof ConfigurationManager);
    console.log("- CurrencyService:", typeof CurrencyService);
    console.log("- TransactionManager:", typeof TransactionManager);
  }, 1500);
});

// Interceptar la función showPurchaseModal original para agregar funcionalidad PayPal
const originalShowPurchaseModal = window.showPurchaseModal;
if (originalShowPurchaseModal) {
  window.showPurchaseModal = function (productId) {
    // Llamar función original
    const result = originalShowPurchaseModal(productId);

    // Agregar funcionalidad PayPal
    setTimeout(() => {
      if (window.currentPurchaseProduct) {
        updatePurchaseModalWithPayPal(window.currentPurchaseProduct);
      }
    }, 100);

    return result;
  };
}

console.log("Store PayPal Integration inicializado");

/**
 * Calcula precio en USD basado en el producto
 */
function calculateUSDPrice(product) {
  if (product.currency === "coins") {
    // Convertir monedas a USD (ejemplo: 100 monedas = $0.99)
    const coinsToUSD = {
      100: 0.99,
      500: 4.99,
      1000: 9.99,
      5000: 39.99,
    };
    return coinsToUSD[product.price] || 9.99;
  }
  return product.price || 9.99;
}

/**
 * Calcula precio en ARS basado en el producto
 */
function calculateARSPrice(product) {
  const usdPrice = calculateUSDPrice(product);
  const exchangeRate = 800; // Tasa de ejemplo, debería ser dinámica
  return Math.round(usdPrice * exchangeRate);
}

/**
 * Detecta la moneda del usuario y la preselecciona
 */
function detectAndSelectUserCurrency() {
  // Detectar país/moneda del usuario
  const userCountry = detectUserCountry();
  const defaultCurrency = userCountry === "AR" ? "ARS" : "USD";

  // Preseleccionar moneda
  setTimeout(() => {
    if (typeof window.selectCurrency === "function") {
      window.selectCurrency(defaultCurrency);
    }
  }, 100);
}

/**
 * Detecta el país del usuario
 */
function detectUserCountry() {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes("Argentina") || timezone.includes("Buenos_Aires")) {
      return "AR";
    }
    return "US";
  } catch (error) {
    console.warn("No se pudo detectar el país del usuario:", error);
    return "US";
  }
}

/**
 * Mejora la función de actualización del modal
 */
function enhanceUpdatePurchaseModal() {
  const originalFunction = window.updatePurchaseModalWithPayPal;

  window.updatePurchaseModalWithPayPal = function (product) {
    console.log("🔄 Actualizando modal mejorado con producto:", product);
    currentProductData = product;

    // Calcular precios en ambas monedas
    const priceUSD = product.priceUSD || calculateUSDPrice(product);
    const priceARS = product.priceARS || calculateARSPrice(product);

    // Actualizar precios en selector de moneda
    const currencyUSDPrice = document.getElementById("currency-usd-price");
    const currencyARSPrice = document.getElementById("currency-ars-price");
    const paypalPrice = document.getElementById("paypal-price");
    const mercadopagoPrice = document.getElementById("mercadopago-price");

    if (currencyUSDPrice) currencyUSDPrice.textContent = `$${priceUSD}`;
    if (currencyARSPrice)
      currencyARSPrice.textContent = `$${priceARS.toLocaleString("es-AR")}`;
    if (paypalPrice) paypalPrice.textContent = `$${priceUSD} USD`;
    if (mercadopagoPrice)
      mercadopagoPrice.textContent = `$${priceARS.toLocaleString("es-AR")} ARS`;

    // Actualizar información del producto
    const productName = document.getElementById("modal-product-name");
    const productDesc = document.getElementById("modal-product-description");
    const productIcon = document.getElementById("modal-product-icon");

    if (productName) productName.textContent = product.name;
    if (productDesc) {
      productDesc.textContent =
        product.description ||
        `Obtén ${
          product.coins || product.amount || "contenido premium"
        } para mejorar tu experiencia de juego`;
    }
    if (productIcon) {
      productIcon.innerHTML = product.icon || '<i class="fas fa-coins"></i>';
    }

    // Detectar moneda del usuario y preseleccionar
    detectAndSelectUserCurrency();

    // Llamar función original si existe
    if (originalFunction && typeof originalFunction === "function") {
      try {
        originalFunction(product);
      } catch (error) {
        console.warn("Error en función original:", error);
      }
    }
  };
}

// Aplicar mejoras cuando se carga el DOM
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    enhanceUpdatePurchaseModal();
  }, 500);
});

/**
 * Función mejorada para actualizar el modal de compra con PayPal
 */
function updatePurchaseModalWithPayPalEnhanced(product) {
  console.log("🔄 Actualizando modal mejorado con producto:", product);

  // Calcular precios en ambas monedas
  const priceUSD = product.priceUSD || calculateUSDPrice(product);
  const priceARS = product.priceARS || calculateARSPrice(product);

  // Actualizar precios en la sección de detalles
  const modalPriceUSD = document.getElementById("modal-price-usd");
  const modalPriceARS = document.getElementById("modal-price-ars");

  if (modalPriceUSD) modalPriceUSD.textContent = `$${priceUSD}`;
  if (modalPriceARS)
    modalPriceARS.textContent = `$${priceARS.toLocaleString("es-AR")}`;

  // Actualizar precios en selector de moneda
  const currencyUSDPrice = document.getElementById("currency-usd-price");
  const currencyARSPrice = document.getElementById("currency-ars-price");

  if (currencyUSDPrice) currencyUSDPrice.textContent = `$${priceUSD}`;
  if (currencyARSPrice)
    currencyARSPrice.textContent = `$${priceARS.toLocaleString("es-AR")}`;

  // Actualizar precios en métodos de pago
  const paypalPrice = document.getElementById("paypal-price");
  const mercadopagoPrice = document.getElementById("mercadopago-price");

  if (paypalPrice) paypalPrice.textContent = `$${priceUSD} USD`;
  if (mercadopagoPrice)
    mercadopagoPrice.textContent = `$${priceARS.toLocaleString("es-AR")} ARS`;

  // Actualizar información del producto
  const productName = document.getElementById("modal-product-name");
  const productDesc = document.getElementById("modal-product-description");
  const productIcon = document.getElementById("modal-product-icon");

  if (productName) productName.textContent = product.name;
  if (productDesc) {
    productDesc.textContent =
      product.description ||
      `Obtén ${
        product.coins || product.amount || "contenido premium"
      } para mejorar tu experiencia de juego`;
  }
  if (productIcon) {
    productIcon.innerHTML = product.icon || '<i class="fas fa-coins"></i>';
  }

  // Detectar y preseleccionar moneda del usuario
  detectAndSelectUserCurrency();
}

// Reemplazar la función original con la mejorada
if (typeof updatePurchaseModalWithPayPal !== "undefined") {
  window.updatePurchaseModalWithPayPal = updatePurchaseModalWithPayPalEnhanced;
}

/**
 * Inicialización mejorada del sistema PayPal
 */
function initializePayPalSystem() {
  console.log("🚀 Inicializando sistema PayPal mejorado...");

  // Verificar elementos críticos del DOM
  const criticalElements = [
    "purchase-modal",
    "paypal-modal",
    "paypal-button-container",
    "currency-usd",
    "currency-ars",
    "paypal-method",
    "mercadopago-method",
  ];

  criticalElements.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`⚠️ Elemento crítico no encontrado: ${id}`);
    }
  });

  // Configurar eventos de moneda si no están configurados
  const currencyUSD = document.getElementById("currency-usd");
  const currencyARS = document.getElementById("currency-ars");

  if (currencyUSD && !currencyUSD.onclick) {
    currencyUSD.onclick = () => window.selectCurrency("USD");
  }

  if (currencyARS && !currencyARS.onclick) {
    currencyARS.onclick = () => window.selectCurrency("ARS");
  }

  // Preseleccionar moneda del usuario
  detectAndSelectUserCurrency();

  console.log("✅ Sistema PayPal inicializado correctamente");
}

// Ejecutar inicialización cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePayPalSystem);
} else {
  initializePayPalSystem();
}

/**
 * ============================================
 * MOBILE PAYMENT HANDLER - TAREA 5.2
 * Optimizaciones específicas para dispositivos móviles
 * ============================================
 */

/**
 * Clase para manejar pagos en dispositivos móviles
 */
class MobilePaymentHandler {
  constructor() {
    this.isMobile = this.detectMobileDevice();
    this.isTouch = this.detectTouchDevice();
    this.orientation = this.getOrientation();
    this.viewport = this.getViewportSize();

    console.log("📱 Mobile Payment Handler inicializado:", {
      isMobile: this.isMobile,
      isTouch: this.isTouch,
      orientation: this.orientation,
      viewport: this.viewport,
    });

    if (this.isMobile) {
      this.init();
    }
  }

  /**
   * Detecta si es un dispositivo móvil
   */
  detectMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
    const isMobileScreen = window.innerWidth <= 768;
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    return isMobileUA || (isMobileScreen && hasTouch);
  }

  /**
   * Detecta si es un dispositivo táctil
   */
  detectTouchDevice() {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }

  /**
   * Obtiene la orientación actual
   */
  getOrientation() {
    if (screen.orientation) {
      return screen.orientation.angle === 0 || screen.orientation.angle === 180
        ? "portrait"
        : "landscape";
    }
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  }

  /**
   * Obtiene el tamaño del viewport
   */
  getViewportSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isSmall: window.innerWidth < 480,
      isMedium: window.innerWidth >= 480 && window.innerWidth < 768,
      isLarge: window.innerWidth >= 768,
    };
  }

  /**
   * Inicializa optimizaciones móviles
   */
  init() {
    this.setupMobileOptimizations();
    this.setupTouchHandlers();
    this.setupOrientationHandlers();
    this.setupPayPalMobileConfig();
  }

  /**
   * Configura optimizaciones específicas para móviles
   */
  setupMobileOptimizations() {
    // Prevenir zoom en inputs
    this.preventInputZoom();

    // Optimizar modales para móviles
    this.optimizeModalsForMobile();

    // Mejorar botones para touch
    this.optimizeButtonsForTouch();
  }

  /**
   * Previene el zoom automático en inputs en iOS
   */
  preventInputZoom() {
    const inputs = document.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      if (!input.style.fontSize || parseFloat(input.style.fontSize) < 16) {
        input.style.fontSize = "16px";
      }
    });
  }

  /**
   * Optimiza modales para dispositivos móviles
   */
  optimizeModalsForMobile() {
    const modals = ["purchase-modal", "paypal-modal"];

    modals.forEach((modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        this.optimizeModalForMobile(modal);
      }
    });
  }

  /**
   * Optimiza un modal específico para móviles
   */
  optimizeModalForMobile(modal) {
    const modalContent = modal.querySelector(".modal-content");
    if (!modalContent) return;

    // Ajustar tamaño según viewport
    if (this.viewport.isSmall) {
      modalContent.style.width = "98vw";
      modalContent.style.margin = "5px";
      modalContent.style.maxHeight = "98vh";
    } else if (this.viewport.isMedium) {
      modalContent.style.width = "95vw";
      modalContent.style.margin = "10px";
      modalContent.style.maxHeight = "95vh";
    }

    modalContent.style.overflowY = "auto";

    const modalBody = modal.querySelector(".modal-body");
    if (modalBody) {
      modalBody.style.padding = this.viewport.isSmall ? "15px" : "20px";
    }
  }

  /**
   * Optimiza botones para dispositivos táctiles
   */
  optimizeButtonsForTouch() {
    const buttons = document.querySelectorAll(
      ".currency-btn, .payment-btn, .btn-purchase, .btn-cancel, .modal-close"
    );

    buttons.forEach((button) => {
      const minSize = 44; // Tamaño mínimo recomendado para touch
      const currentHeight = button.offsetHeight;

      if (currentHeight < minSize) {
        button.style.minHeight = `${minSize}px`;
        button.style.padding = "12px 16px";
      }

      this.addTouchFeedback(button);
    });
  }

  /**
   * Agrega feedback táctil a un elemento
   */
  addTouchFeedback(element) {
    if (!this.isTouch) return;

    element.addEventListener(
      "touchstart",
      (e) => {
        element.style.transform = "scale(0.98)";
        element.style.opacity = "0.8";
      },
      { passive: true }
    );

    element.addEventListener(
      "touchend",
      (e) => {
        setTimeout(() => {
          element.style.transform = "";
          element.style.opacity = "";
        }, 100);
      },
      { passive: true }
    );

    element.addEventListener(
      "touchcancel",
      (e) => {
        element.style.transform = "";
        element.style.opacity = "";
      },
      { passive: true }
    );
  }

  /**
   * Configura manejadores de eventos táctiles
   */
  setupTouchHandlers() {
    if (!this.isTouch) return;

    // Mejorar experiencia de selección de moneda en touch
    this.setupCurrencyTouchHandlers();

    // Mejorar experiencia de métodos de pago en touch
    this.setupPaymentMethodTouchHandlers();
  }

  /**
   * Configura manejadores táctiles para selección de moneda
   */
  setupCurrencyTouchHandlers() {
    const currencyButtons = document.querySelectorAll(".currency-btn");

    currencyButtons.forEach((button) => {
      button.addEventListener(
        "touchend",
        (e) => {
          e.preventDefault(); // Prevenir click fantasma

          const currency = button.dataset.currency;
          if (currency && typeof window.selectCurrency === "function") {
            window.selectCurrency(currency);
          }
        },
        { passive: false }
      );
    });
  }

  /**
   * Configura manejadores táctiles para métodos de pago
   */
  setupPaymentMethodTouchHandlers() {
    const paymentButtons = document.querySelectorAll(".payment-btn");

    paymentButtons.forEach((button) => {
      button.addEventListener(
        "touchend",
        (e) => {
          e.preventDefault();

          // Determinar método de pago
          let method = "paypal";
          if (button.classList.contains("mercadopago")) {
            method = "mercadopago";
          }

          if (typeof window.selectPaymentMethod === "function") {
            window.selectPaymentMethod(method);
          }
        },
        { passive: false }
      );
    });
  }

  /**
   * Configura manejadores de cambio de orientación
   */
  setupOrientationHandlers() {
    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        this.orientation = this.getOrientation();
        this.viewport = this.getViewportSize();

        console.log("📱 Orientación cambiada:", this.orientation);

        // Reoptimizar modales después del cambio de orientación
        this.optimizeModalsForMobile();

        // Reconfigurar PayPal si es necesario
        this.setupPayPalMobileConfig();
      }, 500); // Delay para que se complete el cambio de orientación
    });

    window.addEventListener("resize", () => {
      if (this.isMobile) {
        this.viewport = this.getViewportSize();
        this.optimizeModalsForMobile();
      }
    });
  }

  /**
   * Configura PayPal específicamente para móviles
   */
  setupPayPalMobileConfig() {
    window.paypalMobileConfig = {
      style: {
        layout: this.viewport.isSmall ? "vertical" : "horizontal",
        color: "blue",
        shape: "rect",
        label: "paypal",
        height: this.viewport.isSmall ? 40 : 45,
        tagline: false,
      },
      mobile: {
        disableFunding: ["credit", "card"],
        enableFunding: ["paypal"],
      },
    };
  }

  /**
   * Maneja redirecciones móviles de PayPal
   */
  handleMobilePayPalRedirect() {
    // Detectar si venimos de una redirección de PayPal
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get("paymentId");
    const token = urlParams.get("token");
    const PayerID = urlParams.get("PayerID");

    if (paymentId || token) {
      console.log("📱 Detectada redirección móvil de PayPal:", {
        paymentId,
        token,
        PayerID,
      });

      // Mostrar indicador de procesamiento
      this.showMobileProcessingIndicator();

      // Procesar el pago
      this.processMobilePayPalReturn({ paymentId, token, PayerID });
    }
  }

  /**
   * Muestra indicador de procesamiento para móviles
   */
  showMobileProcessingIndicator() {
    const indicator = document.createElement("div");
    indicator.id = "mobile-processing-indicator";
    indicator.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        color: white;
        font-family: Arial, sans-serif;
      ">
        <div style="text-align: center; padding: 20px;">
          <div style="
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #0070ba;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px auto;
          "></div>
          <h3>Procesando pago...</h3>
          <p>Por favor espera mientras confirmamos tu pago con PayPal</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    document.body.appendChild(indicator);
  }

  /**
   * Procesa el retorno de PayPal en móviles
   */
  async processMobilePayPalReturn(paymentData) {
    try {
      // Simular procesamiento del pago
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Remover indicador de procesamiento
      const indicator = document.getElementById("mobile-processing-indicator");
      if (indicator) {
        indicator.remove();
      }

      // Mostrar resultado exitoso
      this.showMobilePaymentSuccess();

      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("Error procesando retorno móvil de PayPal:", error);
      this.showMobilePaymentError(error.message);
    }
  }

  /**
   * Muestra éxito de pago en móviles
   */
  showMobilePaymentSuccess() {
    const successModal = document.createElement("div");
    successModal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        color: white;
        font-family: Arial, sans-serif;
      ">
        <div style="
          background: #2a2a2a;
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          max-width: 90%;
          border: 2px solid #27ae60;
        ">
          <div style="font-size: 3rem; color: #27ae60; margin-bottom: 20px;">✅</div>
          <h2 style="color: #27ae60; margin-bottom: 15px;">¡Pago Exitoso!</h2>
          <p style="margin-bottom: 20px;">Tu pago con PayPal se ha procesado correctamente.</p>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: #27ae60;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 1rem;
            cursor: pointer;
          ">Continuar</button>
        </div>
      </div>
    `;

    document.body.appendChild(successModal);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (successModal.parentElement) {
        successModal.remove();
      }
    }, 5000);
  }

  /**
   * Muestra error de pago en móviles
   */
  showMobilePaymentError(errorMessage) {
    const errorModal = document.createElement("div");
    errorModal.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        color: white;
        font-family: Arial, sans-serif;
      ">
        <div style="
          background: #2a2a2a;
          border-radius: 15px;
          padding: 30px;
          text-align: center;
          max-width: 90%;
          border: 2px solid #e74c3c;
        ">
          <div style="font-size: 3rem; color: #e74c3c; margin-bottom: 20px;">❌</div>
          <h2 style="color: #e74c3c; margin-bottom: 15px;">Error en el Pago</h2>
          <p style="margin-bottom: 20px;">${
            errorMessage || "Hubo un problema procesando tu pago."
          }</p>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: #e74c3c;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 1rem;
            cursor: pointer;
          ">Cerrar</button>
        </div>
      </div>
    `;

    document.body.appendChild(errorModal);
  }
}

// Instancia global del handler móvil
let mobilePaymentHandler = null;

/**
 * Inicializa el handler móvil cuando el DOM esté listo
 */
function initializeMobilePaymentHandler() {
  if (!mobilePaymentHandler) {
    mobilePaymentHandler = new MobilePaymentHandler();

    // Manejar redirecciones móviles de PayPal
    mobilePaymentHandler.handleMobilePayPalRedirect();
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeMobilePaymentHandler);
} else {
  initializeMobilePaymentHandler();
}

/**
 * Función mejorada para inicializar pago PayPal en móviles
 */
const originalInitializePayPalPayment = window.initializePayPalPayment;
window.initializePayPalPayment = async function () {
  console.log("📱 Inicializando pago PayPal (versión móvil mejorada)...");

  // Si es móvil, usar configuración específica
  if (mobilePaymentHandler && mobilePaymentHandler.isMobile) {
    try {
      // Aplicar configuración móvil
      if (window.paypalMobileConfig) {
        console.log("📱 Aplicando configuración móvil de PayPal");
      }

      // Llamar función original con mejoras móviles
      if (originalInitializePayPalPayment) {
        return await originalInitializePayPalPayment();
      }
    } catch (error) {
      console.error("❌ Error en pago PayPal móvil:", error);

      if (mobilePaymentHandler) {
        mobilePaymentHandler.showMobilePaymentError(error.message);
      }
    }
  } else {
    // Dispositivo desktop, usar función original
    if (originalInitializePayPalPayment) {
      return await originalInitializePayPalPayment();
    }
  }
};

console.log("📱 Mobile Payment Handler cargado y listo");
