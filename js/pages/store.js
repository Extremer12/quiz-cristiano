/* filepath: js/pages/store.js */
/**
 * ================================================
 * STORE TIENDA - SISTEMA DE COMPRAS FUNCIONAL
 * Quiz Cristiano - Solo power-ups y corona
 * ================================================
 */

// ============================================
// VARIABLE GLOBAL ÚNICA PARA COMPRAS
// ============================================

let currentPurchaseProduct = null; // ✅ DECLARACIÓN ÚNICA AQUÍ

// Exponer globalmente para acceso desde HTML
window.currentPurchaseProduct = null;

// ============================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================

let storeData = {
    isInitialized: false,
    isProcessingPurchase: false,
    mascotUnlocked: false
};

// ✅ PRODUCTOS SIMPLIFICADOS Y FUNCIONALES
const STORE_PRODUCTS = {
    // Power-ups (400 monedas cada uno)
    hint_eliminator: {
        id: 'hint_eliminator',
        gameId: 'eliminate',
        name: 'Eliminador de Opciones',
        description: 'Elimina 2 opciones incorrectas de cualquier pregunta',
        price: 400,
        icon: 'fa-eraser',
        color: '#e74c3c',
        category: 'powerups',
        effects: [
            'Elimina 2 opciones incorrectas',
            'Duplica tus posibilidades',
            'Úsalo estratégicamente'
        ]
    },
    time_extender: {
        id: 'time_extender',
        gameId: 'timeExtender',
        name: 'Tiempo Extra',
        description: 'Añade 15 segundos adicionales al timer',
        price: 400,
        icon: 'fa-clock',
        color: '#3498db',
        category: 'powerups',
        effects: [
            '+15 segundos al timer',
            'Perfecto para preguntas difíciles',
            'Te da tiempo para reflexionar'
        ]
    },
    second_chance: {
        id: 'second_chance',
        gameId: 'secondChance',
        name: 'Segunda Oportunidad',
        description: 'Te salva automáticamente si fallas',
        price: 400,
        icon: 'fa-heart',
        color: '#e67e22',
        category: 'powerups',
        effects: [
            'Rescate automático al fallar',
            'Evita el game over',
            'Perfecto para mantener rachas'
        ]
    },
    
    // Elemento Premium - Corona para Joy
    joy_corona: {
        id: 'joy_corona',
        gameId: 'mascotUpgrade',
        name: 'Corona para Joy',
        description: 'Dale a Joy una corona real que la haga lucir como la reina que es',
        price: 10000,
        icon: 'fa-crown',
        color: '#ffd700',
        category: 'premium',
        isPermanent: true,
        effects: [
            'Joy luce una corona permanente',
            'Cambio visual en toda la app',
            'Elemento de prestigio único'
        ]
    }
};

// Exponer productos globalmente para debug
window.STORE_PRODUCTS = STORE_PRODUCTS;

console.log('🏪 Store.js iniciando con productos:', Object.keys(STORE_PRODUCTS));

// ============================================
// INICIALIZACIÓN
// ============================================

async function init() {
    try {
        console.log('🏪 === INICIALIZANDO TIENDA ===');
        
        // 1. Esperar GameDataManager
        await waitForGameDataManager();
        console.log('✅ GameDataManager disponible');
        
        // 2. Configurar listeners
        setupGameDataListeners();
        console.log('✅ Listeners configurados');
        
        // 3. Actualizar displays primero
        updateAllDisplays();
        console.log('✅ Displays actualizados');
        
        // 4. Renderizar productos - ¡ESTO ES CRÍTICO!
        console.log('🎯 Iniciando renderizado de productos...');
        renderProducts();
        console.log('✅ Productos renderizados');
        
        storeData.isInitialized = true;
        console.log('🎉 Tienda inicializada completamente');
        
    } catch (error) {
        console.error('❌ Error inicializando tienda:', error);
        
        // Fallback: renderizar productos básicos
        console.log('🆘 Renderizando productos de emergencia...');
        renderEmergencyProducts();
    }
}

// ✅ FUNCIÓN DE EMERGENCIA PARA PRODUCTOS
function renderEmergencyProducts() {
    console.log('🆘 Renderizando productos de emergencia...');
    
    const powerupsGrid = document.getElementById('powerups-grid');
    const premiumGrid = document.getElementById('premium-grid');
    
    if (powerupsGrid) {
        powerupsGrid.innerHTML = `
            <div class="product-card" data-product="hint_eliminator">
                <div class="product-icon">
                    <i class="fas fa-eraser" style="color: #e74c3c"></i>
                </div>
                <div class="product-info">
                    <h3 class="product-name">Eliminador de Opciones</h3>
                    <p class="product-description">Elimina 2 opciones incorrectas</p>
                    <div class="product-pricing">
                        <div class="product-price">
                            <i class="fas fa-coins"></i>
                            <span>400</span>
                        </div>
                    </div>
                    <button class="buy-btn" onclick="buyProduct('hint_eliminator')">
                        <i class="fas fa-shopping-cart"></i>
                        Comprar
                    </button>
                </div>
            </div>
            
            <div class="product-card" data-product="time_extender">
                <div class="product-icon">
                    <i class="fas fa-clock" style="color: #3498db"></i>
                </div>
                <div class="product-info">
                    <h3 class="product-name">Tiempo Extra</h3>
                    <p class="product-description">Añade 15 segundos al timer</p>
                    <div class="product-pricing">
                        <div class="product-price">
                            <i class="fas fa-coins"></i>
                            <span>400</span>
                        </div>
                    </div>
                    <button class="buy-btn" onclick="buyProduct('time_extender')">
                        <i class="fas fa-shopping-cart"></i>
                        Comprar
                    </button>
                </div>
            </div>
            
            <div class="product-card" data-product="second_chance">
                <div class="product-icon">
                    <i class="fas fa-heart" style="color: #e67e22"></i>
                </div>
                <div class="product-info">
                    <h3 class="product-name">Segunda Oportunidad</h3>
                    <p class="product-description">Te salva automáticamente si fallas</p>
                    <div class="product-pricing">
                        <div class="product-price">
                            <i class="fas fa-coins"></i>
                            <span>400</span>
                        </div>
                    </div>
                    <button class="buy-btn" onclick="buyProduct('second_chance')">
                        <i class="fas fa-shopping-cart"></i>
                        Comprar
                    </button>
                </div>
            </div>
        `;
        console.log('✅ Power-ups de emergencia renderizados');
    }
    
    if (premiumGrid) {
        premiumGrid.innerHTML = `
            <div class="product-card premium" data-product="joy_corona">
                <div class="product-icon">
                    <i class="fas fa-crown" style="color: #ffd700"></i>
                </div>
                <div class="product-info">
                    <h3 class="product-name">Corona para Joy</h3>
                    <p class="product-description">Dale a Joy una corona real</p>
                    <div class="product-pricing">
                        <div class="product-price">
                            <i class="fas fa-coins"></i>
                            <span>10,000</span>
                        </div>
                    </div>
                    <button class="buy-btn premium" onclick="buyProduct('joy_corona')">
                        <i class="fas fa-crown"></i>
                        Comprar
                    </button>
                </div>
            </div>
        `;
        console.log('✅ Elementos premium de emergencia renderizados');
    }
}

// ✅ FUNCIÓN RENDERPRODUCTS CORREGIDA
function renderProducts() {
    console.log('🏪 === RENDERIZANDO PRODUCTOS ===');
    
    try {
        // Verificar que STORE_PRODUCTS esté disponible
        if (!STORE_PRODUCTS || Object.keys(STORE_PRODUCTS).length === 0) {
            console.error('❌ STORE_PRODUCTS no está disponible');
            renderEmergencyProducts();
            return;
        }
        
        console.log('📦 Productos disponibles:', Object.keys(STORE_PRODUCTS));
        
        // Renderizar Power-ups
        renderPowerups();
        
        // Renderizar Premium
        renderPremium();
        
        console.log('✅ Todos los productos renderizados exitosamente');
        
    } catch (error) {
        console.error('❌ Error renderizando productos:', error);
        renderEmergencyProducts();
    }
}

function renderPowerups() {
    const powerupsGrid = document.getElementById('powerups-grid');
    if (!powerupsGrid) {
        console.error('❌ powerups-grid no encontrado');
        return;
    }
    
    console.log('🎯 Renderizando power-ups...');
    
    const powerups = Object.values(STORE_PRODUCTS).filter(p => p.category === 'powerups');
    console.log(`📦 ${powerups.length} power-ups encontrados:`, powerups.map(p => p.name));
    
    if (powerups.length === 0) {
        powerupsGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No hay power-ups disponibles</p>';
        return;
    }
    
    powerupsGrid.innerHTML = powerups.map(product => {
        const ownedCount = getOwnedCount(product.gameId);
        return createProductCard(product, ownedCount);
    }).join('');
    
    console.log(`✅ ${powerups.length} power-ups renderizados en el grid`);
}

function renderPremium() {
    const premiumGrid = document.getElementById('premium-grid');
    if (!premiumGrid) {
        console.error('❌ premium-grid no encontrado');
        return;
    }
    
    console.log('👑 Renderizando elementos premium...');
    
    const premiumItems = Object.values(STORE_PRODUCTS).filter(p => p.category === 'premium');
    console.log(`👑 ${premiumItems.length} elementos premium encontrados:`, premiumItems.map(p => p.name));
    
    if (premiumItems.length === 0) {
        premiumGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No hay elementos premium disponibles</p>';
        return;
    }
    
    premiumGrid.innerHTML = premiumItems.map(product => {
        const isOwned = checkPremiumOwnership(product.id);
        return createPremiumCard(product, isOwned);
    }).join('');
    
    console.log(`✅ ${premiumItems.length} elementos premium renderizados`);
}

// ============================================
// INICIALIZACIÓN COMPLETA CORREGIDA
// ============================================

async function init() {
    try {
        console.log('🏪 === INICIALIZANDO TIENDA ===');
        
        // 1. Esperar GameDataManager
        await waitForGameDataManager();
        console.log('✅ GameDataManager disponible');
        
        // 2. Configurar listeners
        setupGameDataListeners();
        console.log('✅ Listeners configurados');
        
        // 3. Actualizar displays primero
        updateAllDisplays();
        console.log('✅ Displays actualizados');
        
        // 4. Renderizar productos - ¡ESTO ES CRÍTICO!
        console.log('🎯 Iniciando renderizado de productos...');
        renderProducts();
        console.log('✅ Productos renderizados');
        
        storeData.isInitialized = true;
        console.log('🎉 Tienda inicializada completamente');
        
    } catch (error) {
        console.error('❌ Error inicializando tienda:', error);
        
        // Fallback: renderizar productos básicos
        console.log('🆘 Renderizando productos de emergencia...');
        renderEmergencyProducts();
    }
}

// ✅ INICIALIZACIÓN AUTOMÁTICA MEJORADA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏪 Store DOM cargado, iniciando secuencia...');
    
    // Verificar elementos críticos inmediatamente
    const criticalElements = [
        'powerups-grid', 'premium-grid', 'coins-display', 'mascot-store'
    ];
    
    let missingElements = [];
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✅ Elemento ${id} encontrado`);
        } else {
            console.error(`❌ Elemento ${id} NO encontrado`);
            missingElements.push(id);
        }
    });
    
    if (missingElements.length > 0) {
        console.error('❌ Elementos críticos faltantes:', missingElements);
    }
    
    // Inicializar después de un breve delay para asegurar que todo esté listo
    setTimeout(() => {
        console.log('🚀 Iniciando init() de la tienda...');
        init();
    }, 500);
    
    // Backup: renderizar productos de emergencia si no se hace en 3 segundos
    setTimeout(() => {
        const powerupsGrid = document.getElementById('powerups-grid');
        const premiumGrid = document.getElementById('premium-grid');
        
        if (powerupsGrid && powerupsGrid.innerHTML.trim() === '') {
            console.warn('⚠️ No se renderizaron productos, usando emergencia...');
            renderEmergencyProducts();
        }
    }, 3000);
});

console.log('✅ Store.js CORREGIDO cargado completamente');

// ============================================
// FUNCIONES AUXILIARES FALTANTES
// ============================================

async function waitForGameDataManager() {
    return new Promise((resolve) => {
        if (window.GameDataManager) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.GameDataManager) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}

function setupGameDataListeners() {
    console.log('🔗 Configurando listeners de GameDataManager...');
    
    // Listener para cambios de monedas
    window.GameDataManager.onCoinsChanged((data) => {
        updateCoinsDisplay();
    });
    
    // Listener para cambios de inventario
    window.GameDataManager.onInventoryChanged((data) => {
        updatePowerups();
    });
}

function updateAllDisplays() {
    updateCoinsDisplay();
    updateMascotDisplay();
}

function updateCoinsDisplay() {
    const coinsDisplay = document.getElementById('coins-display');
    if (coinsDisplay && window.GameDataManager) {
        coinsDisplay.textContent = window.GameDataManager.getCoins();
    }
}

function updateMascotDisplay() {
    const mascotImage = document.getElementById('mascot-store');
    if (mascotImage) {
        const hasCorona = localStorage.getItem('joy_corona-unlocked') === 'true';
        if (hasCorona) {
            mascotImage.src = 'assets/images/joy-corona.png';
        }
    }
}

function getOwnedCount(gameId) {
    if (!window.GameDataManager) return 0;
    return window.GameDataManager.getPowerupCount(gameId) || 0;
}

function checkPremiumOwnership(premiumId) {
    return localStorage.getItem(`${premiumId}-unlocked`) === 'true';
}

// ============================================
// FUNCIONES DE COMPRA MEJORADAS
// ============================================

window.showPurchaseModal = function(productId) {
    console.log(`🛒 Mostrando modal de compra para: ${productId}`);
    
    const product = STORE_PRODUCTS[productId];
    if (!product) {
        console.error(`❌ Producto no encontrado: ${productId}`);
        return;
    }
    
    if (!window.GameDataManager) {
        showNotification('Sistema no disponible', 'error');
        return;
    }
    
    // Verificar fondos
    const currentCoins = window.GameDataManager.getCoins();
    
    // Calcular cantidad y costo total
    let quantity = 1;
    let totalCost = product.price;
    
    if (product.category === 'powerups') {
        const quantityInput = document.getElementById(`qty-${productId}`);
        if (quantityInput) {
            quantity = parseInt(quantityInput.value) || 1;
            totalCost = product.price * quantity;
        }
    }
    
    // Verificar si puede permitirse la compra
    if (currentCoins < totalCost) {
        showNotification(`Necesitas ${totalCost - currentCoins} monedas más`, 'error');
        return;
    }
    
    // Configurar datos del producto para el modal
    currentPurchaseProduct = {
        product: product,
        quantity: quantity,
        totalCost: totalCost
    };
    
    // Exponer globalmente
    window.currentPurchaseProduct = currentPurchaseProduct;
    
    // Llenar modal con información
    const modal = document.getElementById('purchase-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalProduct = document.getElementById('modal-product');
    const modalPrice = document.getElementById('modal-price');
    const modalTotal = document.getElementById('modal-total');
    const modalCurrentCoins = document.getElementById('modal-current-coins');
    const modalRemainingCoins = document.getElementById('modal-remaining-coins');
    
    if (!modal) {
        console.error('❌ Modal de compra no encontrado');
        return;
    }
    
    // Actualizar contenido del modal
    if (modalTitle) modalTitle.textContent = `Confirmar compra de ${product.name}`;
    
    if (modalProduct) {
        modalProduct.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas ${product.icon}" style="color: ${product.color}; font-size: 1.5rem;"></i>
                </div>
                <div>
                    <h4 style="margin: 0; color: var(--text-primary);">${product.name}</h4>
                    <p style="margin: 5px 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">${product.description}</p>
                    ${quantity > 1 ? `<p style="margin: 5px 0 0 0; color: var(--text-accent); font-weight: 600;">Cantidad: ${quantity}</p>` : ''}
                </div>
            </div>
        `;
    }
    
    if (modalPrice) modalPrice.textContent = `${product.price} monedas`;
    if (modalTotal) modalTotal.textContent = `${totalCost} monedas`;
    if (modalCurrentCoins) modalCurrentCoins.textContent = `${currentCoins} monedas`;
    if (modalRemainingCoins) {
        const remaining = currentCoins - totalCost;
        modalRemainingCoins.textContent = `${remaining} monedas`;
        modalRemainingCoins.style.color = remaining >= 0 ? 'var(--text-accent)' : 'var(--profile-error)';
    }
    
    // Mostrar modal
    modal.style.display = 'flex';
    
    console.log('✅ Modal de compra mostrado');
};

window.processPurchase = function(purchaseData) {
    console.log('💳 Procesando compra...', purchaseData);
    
    if (!purchaseData || !purchaseData.product) {
        console.error('❌ Datos de compra inválidos');
        return;
    }
    
    const { product, quantity, totalCost } = purchaseData;
    
    if (!window.GameDataManager) {
        showNotification('Sistema no disponible', 'error');
        return;
    }
    
    // Verificar fondos nuevamente
    const currentCoins = window.GameDataManager.getCoins();
    if (currentCoins < totalCost) {
        showNotification('Fondos insuficientes', 'error');
        closePurchaseModal();
        return;
    }
    
    // Realizar la compra
    const success = window.GameDataManager.spendCoins(totalCost, 'store_purchase');
    
    if (success) {
        // Añadir al inventario
        if (product.category === 'powerups') {
            window.GameDataManager.addPowerup(product.gameId, quantity, 'store_purchase');
            showNotification(`¡${product.name} x${quantity} comprado!`, 'success');
        } else if (product.category === 'premium') {
            // Manejar compras premium
            savePremiumPurchase(product.id);
            showNotification(`¡${product.name} desbloqueado!`, 'success');
        }
        
        console.log(`✅ Compra exitosa: ${product.name} x${quantity}`);
        
        // Actualizar displays
        updateCoinsDisplay();
        updateProductCards();
        updateMascotDisplay();
        
        // Mostrar animación de monedas
        showCoinAnimation(totalCost, false);
        
    } else {
        showNotification('Error en la compra', 'error');
        console.error('❌ Error procesando compra');
    }
    
    // Cerrar modal
    closePurchaseModal();
};

function savePremiumPurchase(productId) {
    try {
        localStorage.setItem(`${productId}-unlocked`, 'true');
        console.log(`💾 Compra premium guardada: ${productId}`);
    } catch (error) {
        console.error('❌ Error guardando compra premium:', error);
    }
}

function updateProductCards() {
    console.log('🔄 Actualizando tarjetas de productos...');
    renderProducts();
}

function closePurchaseModal() {
    const modal = document.getElementById('purchase-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentPurchaseProduct = null;
    window.currentPurchaseProduct = null;
    console.log('❌ Modal de compra cerrado');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Estilos inline
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--surface-primary);
        backdrop-filter: var(--backdrop-blur);
        border: 1px solid var(--border-primary);
        border-radius: 15px;
        padding: 15px 20px;
        z-index: 2000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: var(--shadow-primary);
        max-width: 300px;
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text-primary);
        font-weight: 500;
    `;
    
    // Colores por tipo
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    if (colors[type]) {
        content.querySelector('i').style.color = colors[type];
    }
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function showCoinAnimation(amount, isPositive) {
    const animation = document.createElement('div');
    animation.className = `coin-animation ${isPositive ? 'positive' : 'negative'}`;
    animation.textContent = `${isPositive ? '+' : '-'}${amount}`;
    
    const coinsDisplay = document.getElementById('coins-display');
    if (coinsDisplay) {
        const rect = coinsDisplay.getBoundingClientRect();
        animation.style.left = rect.left + 'px';
        animation.style.top = rect.top + 'px';
    } else {
        animation.style.right = '20px';
        animation.style.top = '20px';
    }
    
    animation.style.position = 'fixed';
    animation.style.zIndex = '2000';
    animation.style.color = isPositive ? '#27ae60' : '#e74c3c';
    animation.style.fontSize = '1.5rem';
    animation.style.fontWeight = 'bold';
    animation.style.pointerEvents = 'none';
    animation.style.animation = isPositive ? 'coinFloatUp 2s ease-out forwards' : 'coinFloatDown 2s ease-out forwards';
    
    document.body.appendChild(animation);
    
    setTimeout(() => {
        animation.remove();
    }, 2000);
}

// ============================================
// FUNCIONES PARA CONTROLES DE CANTIDAD
// ============================================

window.changeQuantity = function(productId, delta) {
    const quantityInput = document.getElementById(`qty-${productId}`);
    const totalElement = document.getElementById(`total-${productId}`);
    
    if (!quantityInput || !totalElement) return;
    
    const product = STORE_PRODUCTS[productId];
    if (!product) return;
    
    let currentValue = parseInt(quantityInput.value) || 1;
    let newValue = Math.max(1, Math.min(99, currentValue + delta));
    
    quantityInput.value = newValue;
    
    const newTotal = product.price * newValue;
    totalElement.textContent = `${newTotal} monedas`;
};

window.validateQuantity = function(productId) {
    const quantityInput = document.getElementById(`qty-${productId}`);
    const totalElement = document.getElementById(`total-${productId}`);
    
    if (!quantityInput || !totalElement) return;
    
    const product = STORE_PRODUCTS[productId];
    if (!product) return;
    
    let value = parseInt(quantityInput.value) || 1;
    value = Math.max(1, Math.min(99, value));
    
    quantityInput.value = value;
    
    const newTotal = product.price * value;
    totalElement.textContent = `${newTotal} monedas`;
};

console.log('✅ Store.js funciones auxiliares cargadas');