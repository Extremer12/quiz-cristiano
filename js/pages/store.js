/* filepath: js/pages/store.js */
/**
 * ================================================
 * STORE SIMPLIFICADA - SOLO POWER-UPS Y CORONA JOY
 * Quiz Cristiano - Tienda enfocada en elementos esenciales
 * ================================================
 */

// ============================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================

let storeData = {
    isInitialized: false,
    isProcessingPurchase: false,
    mascotUnlocked: false
};

// ✅ CONFIGURACIÓN SIMPLIFICADA - SOLO LO ESENCIAL
const STORE_PRODUCTS = {
    // Power-ups (400 monedas cada uno)
    hint_eliminator: {
        id: 'hint_eliminator',
        gameId: 'eliminate',
        name: 'Eliminador de Opciones',
        description: 'Elimina 2 opciones incorrectas de cualquier pregunta',
        longDescription: 'Este power-up te permite eliminar 2 respuestas incorrectas, duplicando tus posibilidades de acertar.',
        price: 400,
        icon: 'fa-eraser',
        color: '#e74c3c',
        category: 'powerups',
        rarity: 'common',
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
        longDescription: 'Perfecto para preguntas difíciles que requieren más reflexión.',
        price: 400,
        icon: 'fa-clock',
        color: '#3498db',
        category: 'powerups',
        rarity: 'common',
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
        longDescription: 'Tu salvavidas en momentos críticos. Si fallas una pregunta que terminaría el juego, este power-up te rescata.',
        price: 400,
        icon: 'fa-heart',
        color: '#e67e22',
        category: 'powerups',
        rarity: 'uncommon',
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
        longDescription: 'Transforma a Joy con esta hermosa corona dorada. Una vez comprada, Joy aparecerá con su corona en todas las pantallas.',
        price: 10000,
        icon: 'fa-crown',
        color: '#ffd700',
        category: 'premium',
        rarity: 'legendary',
        isPermanent: true,
        effects: [
            'Joy luce una corona permanente',
            'Cambio visual en toda la app',
            'Elemento de prestigio único'
        ]
    }
};

// ============================================
// INICIALIZACIÓN
// ============================================

async function init() {
    try {
        console.log('🛒 Inicializando Store Simplificada...');
        
        // Esperar GameDataManager
        if (!window.GameDataManager) {
            await waitForGameDataManager();
        }
        
        // Configurar listeners
        setupGameDataListeners();
        
        // Renderizar productos
        renderProducts();
        
        // Actualizar displays
        updateCoinsDisplay();
        updateMascotDisplay();
        
        storeData.isInitialized = true;
        console.log('✅ Store inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando Store:', error);
        showNotification('Error inicializando la tienda', 'error');
    }
}

async function waitForGameDataManager() {
    return new Promise((resolve) => {
        const checkGameDataManager = () => {
            if (window.GameDataManager) {
                console.log('✅ GameDataManager disponible');
                resolve();
            } else {
                console.log('⏳ Esperando GameDataManager...');
                setTimeout(checkGameDataManager, 100);
            }
        };
        checkGameDataManager();
    });
}

function setupGameDataListeners() {
    console.log('🔗 Configurando listeners de GameDataManager...');
    
    window.GameDataManager.onCoinsChanged((data) => {
        console.log('💰 Monedas cambiaron en tiempo real:', data);
        updateCoinsDisplay();
        
        if (data.difference !== 0) {
            showCoinAnimation(data.difference, data.difference > 0);
        }
    });
    
    window.GameDataManager.onInventoryChanged((data) => {
        console.log('🎒 Inventario cambió en tiempo real:', data);
        updateProductCards();
    });
}

// ============================================
// RENDERIZADO DE PRODUCTOS
// ============================================

function renderProducts() {
    console.log('🏪 Renderizando productos en la tienda...');
    
    // Renderizar Power-ups
    renderPowerups();
    
    // Renderizar Premium
    renderPremium();
    
    console.log('✅ Todos los productos renderizados');
}

function renderPowerups() {
    const powerupsGrid = document.getElementById('powerups-grid');
    if (!powerupsGrid) {
        console.error('❌ Elemento powerups-grid no encontrado');
        return;
    }
    
    const powerups = Object.values(STORE_PRODUCTS).filter(p => p.category === 'powerups');
    
    powerupsGrid.innerHTML = powerups.map(product => {
        const ownedCount = getOwnedCount(product.gameId);
        return createProductCard(product, ownedCount);
    }).join('');
    
    console.log(`✅ ${powerups.length} power-ups renderizados`);
}

function renderPremium() {
    const premiumGrid = document.getElementById('premium-grid');
    if (!premiumGrid) {
        console.error('❌ Elemento premium-grid no encontrado');
        return;
    }
    
    const premiumItems = Object.values(STORE_PRODUCTS).filter(p => p.category === 'premium');
    
    premiumGrid.innerHTML = premiumItems.map(product => {
        const isOwned = checkPremiumOwnership(product.id);
        return createPremiumCard(product, isOwned);
    }).join('');
    
    console.log(`✅ ${premiumItems.length} elementos premium renderizados`);
}

function createProductCard(product, ownedCount) {
    const currentCoins = window.GameDataManager ? window.GameDataManager.getCoins() : 0;
    const canAfford = currentCoins >= product.price;
    
    return `
        <div class="product-card" data-product="${product.id}">
            <div class="product-icon">
                <i class="fas ${product.icon}" style="color: ${product.color}"></i>
            </div>
            
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                
                <div class="product-effects">
                    <h5>Efectos:</h5>
                    <div class="effects-list">
                        ${product.effects.map(effect => `
                            <div class="effect-item">
                                <i class="fas fa-check"></i>
                                <span>${effect}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="product-pricing">
                    <div class="product-price">
                        <i class="fas fa-coins"></i>
                        <span>${product.price}</span>
                    </div>
                    
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="changeQuantity('${product.id}', -1)">-</button>
                        <input type="number" class="quantity-input" id="qty-${product.id}" value="1" min="1" max="99" onchange="validateQuantity('${product.id}')">
                        <button class="quantity-btn" onclick="changeQuantity('${product.id}', 1)">+</button>
                    </div>
                    
                    <div class="total-cost">
                        Total: <strong id="total-${product.id}">${product.price} monedas</strong>
                    </div>
                </div>
                
                ${ownedCount > 0 ? `
                    <div class="owned-status">
                        <i class="fas fa-box"></i>
                        Tienes: ${ownedCount}
                    </div>
                ` : ''}
                
                <button class="buy-btn ${canAfford ? '' : 'disabled'}" 
                        onclick="buyProduct('${product.id}')" 
                        ${canAfford ? '' : 'disabled'}>
                    <i class="fas fa-shopping-cart"></i>
                    ${canAfford ? 'Comprar' : 'Sin fondos'}
                </button>
            </div>
        </div>
    `;
}

function createPremiumCard(product, isOwned) {
    const currentCoins = window.GameDataManager ? window.GameDataManager.getCoins() : 0;
    const canAfford = currentCoins >= product.price;
    
    return `
        <div class="product-card premium" data-product="${product.id}">
            <div class="product-icon">
                <i class="fas ${product.icon}" style="color: ${product.color}"></i>
            </div>
            
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                
                <div class="product-effects">
                    <h5>Incluye:</h5>
                    <div class="effects-list">
                        ${product.effects.map(effect => `
                            <div class="effect-item">
                                <i class="fas fa-star"></i>
                                <span>${effect}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="product-pricing">
                    <div class="product-price">
                        <i class="fas fa-coins"></i>
                        <span>${product.price.toLocaleString()}</span>
                    </div>
                </div>
                
                ${isOwned ? `
                    <div class="owned-indicator">
                        <i class="fas fa-check"></i>
                        ¡Ya lo tienes!
                    </div>
                ` : `
                    <button class="buy-btn premium ${canAfford ? '' : 'disabled'}" 
                            onclick="buyProduct('${product.id}')" 
                            ${canAfford ? '' : 'disabled'}>
                        <i class="fas fa-crown"></i>
                        ${canAfford ? 'Comprar' : 'Sin fondos'}
                    </button>
                `}
            </div>
        </div>
    `;
}

// ============================================
// SISTEMA DE COMPRAS
// ============================================

window.buyProduct = async function(productId) {
    console.log(`🛒 Intentando comprar: ${productId}`);
    
    if (storeData.isProcessingPurchase) {
        console.log('⏳ Ya hay una compra en proceso');
        return;
    }
    
    if (!window.GameDataManager) {
        showNotification('Sistema de datos no disponible', 'error');
        return;
    }
    
    const product = STORE_PRODUCTS[productId];
    if (!product) {
        console.error(`❌ Producto no encontrado: ${productId}`);
        return;
    }
    
    // Verificar si es premium y ya está comprado
    if (product.category === 'premium' && checkPremiumOwnership(productId)) {
        showNotification('Ya tienes este elemento', 'info');
        return;
    }
    
    let quantity = 1;
    let totalCost = product.price;
    
    // Para power-ups, obtener cantidad seleccionada
    if (product.category === 'powerups') {
        const quantityInput = document.getElementById(`qty-${productId}`);
        quantity = parseInt(quantityInput?.value || 1);
        totalCost = product.price * quantity;
    }
    
    // Verificar fondos
    const currentCoins = window.GameDataManager.getCoins();
    if (currentCoins < totalCost) {
        showNotification(`Necesitas ${totalCost - currentCoins} monedas más`, 'error');
        return;
    }
    
    // Confirmar compra para elementos caros
    if (totalCost > 1000) {
        const confirm = await showConfirmModal(product, quantity, totalCost);
        if (!confirm) return;
    }
    
    try {
        storeData.isProcessingPurchase = true;
        
        // Procesar compra
        const success = await processPurchase(product, quantity, totalCost);
        
        if (success) {
            showPurchaseSuccess(product, quantity, totalCost);
        }
        
    } catch (error) {
        console.error('❌ Error en compra:', error);
        showNotification('Error procesando la compra', 'error');
    } finally {
        storeData.isProcessingPurchase = false;
    }
};

async function processPurchase(product, quantity, totalCost) {
    console.log(`💳 Procesando compra: ${quantity}x ${product.name} por ${totalCost} monedas`);
    
    // Gastar monedas
    const spentSuccess = window.GameDataManager.spendCoins(totalCost, `purchase_${product.id}`);
    if (!spentSuccess) {
        throw new Error('No se pudieron gastar las monedas');
    }
    
    // Agregar producto al inventario
    if (product.category === 'powerups') {
        const addSuccess = window.GameDataManager.addPowerup(product.gameId, quantity, 'purchase');
        if (!addSuccess) {
            // Revertir gasto de monedas
            window.GameDataManager.addCoins(totalCost, 'purchase_revert');
            throw new Error('No se pudo agregar al inventario');
        }
    } else if (product.category === 'premium') {
        // Guardar compra premium
        savePremiumPurchase(product.id);
        
        // Si es la corona de Joy, actualizar mascota
        if (product.id === 'joy_corona') {
            storeData.mascotUnlocked = true;
            updateMascotDisplay();
            localStorage.setItem('joy-corona-unlocked', 'true');
        }
    }
    
    console.log('✅ Compra procesada exitosamente');
    return true;
}

function showPurchaseSuccess(product, quantity, totalCost) {
    // Mostrar notificación de éxito
    if (product.category === 'premium') {
        showNotification(`¡${product.name} desbloqueado!`, 'success');
    } else {
        showNotification(`¡Compra exitosa! ${quantity}x ${product.name}`, 'success');
    }
    
    // Mostrar animación de monedas gastadas
    showCoinAnimation(-totalCost, false);
    
    // Actualizar displays
    updateCoinsDisplay();
    updateProductCards();
    
    // Re-renderizar para actualizar estados
    setTimeout(() => {
        renderProducts();
    }, 500);
}

// ============================================
// GESTIÓN DE CANTIDAD
// ============================================

window.changeQuantity = function(productId, delta) {
    const quantityInput = document.getElementById(`qty-${productId}`);
    if (!quantityInput) return;
    
    const currentValue = parseInt(quantityInput.value) || 1;
    const newValue = Math.max(1, Math.min(99, currentValue + delta));
    
    quantityInput.value = newValue;
    updatePurchasePreview(productId);
};

window.validateQuantity = function(productId) {
    const quantityInput = document.getElementById(`qty-${productId}`);
    if (!quantityInput) return;
    
    let value = parseInt(quantityInput.value) || 1;
    value = Math.max(1, Math.min(99, value));
    
    quantityInput.value = value;
    updatePurchasePreview(productId);
};

function updatePurchasePreview(productId) {
    const product = STORE_PRODUCTS[productId];
    const quantity = parseInt(document.getElementById(`qty-${productId}`)?.value || 1);
    const totalCost = product.price * quantity;
    
    // Actualizar precio total
    const totalElement = document.getElementById(`total-${productId}`);
    if (totalElement) {
        totalElement.innerHTML = `<strong>${totalCost.toLocaleString()} monedas</strong>`;
    }
    
    // Actualizar estado del botón
    const buyBtn = document.querySelector(`[data-product="${productId}"] .buy-btn`);
    if (buyBtn) {
        const currentCoins = window.GameDataManager ? window.GameDataManager.getCoins() : 0;
        const canAfford = currentCoins >= totalCost;
        
        buyBtn.disabled = !canAfford;
        buyBtn.className = `buy-btn ${canAfford ? '' : 'disabled'}`;
        buyBtn.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            ${canAfford ? 'Comprar' : 'Sin fondos'}
        `;
    }
}

// ============================================
// UTILIDADES Y HELPERS
// ============================================

function getOwnedCount(gameId) {
    if (!window.GameDataManager) return 0;
    return window.GameDataManager.getPowerupCount(gameId) || 0;
}

function checkPremiumOwnership(productId) {
    if (productId === 'joy_corona') {
        return localStorage.getItem('joy-corona-unlocked') === 'true';
    }
    return false;
}

function savePremiumPurchase(productId) {
    if (productId === 'joy_corona') {
        localStorage.setItem('joy-corona-unlocked', 'true');
    }
}

function updateCoinsDisplay() {
    if (!window.GameDataManager) return;
    
    const coinsElements = document.querySelectorAll('#coins-display, .coins-amount, .player-coins, #player-coins');
    const currentCoins = window.GameDataManager.getCoins();
    
    coinsElements.forEach(element => {
        if (element) {
            element.textContent = currentCoins.toLocaleString();
        }
    });
    
    console.log(`💰 Display de monedas actualizado: ${currentCoins}`);
}

function updateMascotDisplay() {
    const mascotImage = document.getElementById('mascot-store');
    const mascotStatus = document.getElementById('mascot-status-text');
    
    if (localStorage.getItem('joy-corona-unlocked') === 'true') {
        if (mascotImage) {
            mascotImage.src = 'assets/images/joy-corona.png';
            mascotImage.alt = 'Joy con Corona';
        }
        
        if (mascotStatus) {
            mascotStatus.textContent = '¡Joy luce su corona real!';
        }
        
        console.log('👑 Mascota actualizada con corona');
    }
}

function updateProductCards() {
    console.log('🔄 Actualizando tarjetas de productos...');
    
    Object.values(STORE_PRODUCTS).forEach(product => {
        const card = document.querySelector(`[data-product="${product.id}"]`);
        if (!card) return;
        
        // Actualizar botón de compra
        const buyBtn = card.querySelector('.buy-btn');
        if (buyBtn) {
            const currentCoins = window.GameDataManager ? window.GameDataManager.getCoins() : 0;
            const canAfford = currentCoins >= product.price;
            
            buyBtn.disabled = !canAfford;
            buyBtn.className = `buy-btn ${product.category === 'premium' ? 'premium' : ''} ${canAfford ? '' : 'disabled'}`;
        }
        
        // Actualizar contador si es power-up
        if (product.category === 'powerups') {
            const ownedStatus = card.querySelector('.owned-status');
            const ownedCount = getOwnedCount(product.gameId);
            
            if (ownedCount > 0) {
                if (!ownedStatus) {
                    const newStatus = document.createElement('div');
                    newStatus.className = 'owned-status';
                    newStatus.innerHTML = `<i class="fas fa-box"></i> Tienes: ${ownedCount}`;
                    card.querySelector('.product-info').appendChild(newStatus);
                } else {
                    ownedStatus.innerHTML = `<i class="fas fa-box"></i> Tienes: ${ownedCount}`;
                }
            } else if (ownedStatus) {
                ownedStatus.remove();
            }
        }
    });
}

// ============================================
// MODAL DE CONFIRMACIÓN
// ============================================

function showConfirmModal(product, quantity, totalCost) {
    return new Promise((resolve) => {
        currentPurchaseProduct = { product, quantity, totalCost, resolve };
        
        const modal = document.getElementById('purchase-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalProduct = document.getElementById('modal-product');
        const modalPrice = document.getElementById('modal-price');
        const modalTotal = document.getElementById('modal-total');
        const modalCurrentCoins = document.getElementById('modal-current-coins');
        const modalRemainingCoins = document.getElementById('modal-remaining-coins');
        
        if (modalTitle) modalTitle.textContent = 'Confirmar Compra';
        
        if (modalProduct) {
            modalProduct.innerHTML = `
                <div style="text-align: center; margin-bottom: 15px;">
                    <div style="font-size: 3rem; color: ${product.color}; margin-bottom: 10px;">
                        <i class="fas ${product.icon}"></i>
                    </div>
                    <h3>${product.name}</h3>
                    ${quantity > 1 ? `<p>Cantidad: ${quantity}</p>` : ''}
                </div>
            `;
        }
        
        if (modalPrice) modalPrice.textContent = `${product.price.toLocaleString()} monedas`;
        if (modalTotal) modalTotal.textContent = `${totalCost.toLocaleString()} monedas`;
        
        const currentCoins = window.GameDataManager.getCoins();
        if (modalCurrentCoins) modalCurrentCoins.textContent = `${currentCoins.toLocaleString()} monedas`;
        if (modalRemainingCoins) modalRemainingCoins.textContent = `${(currentCoins - totalCost).toLocaleString()} monedas`;
        
        modal.style.display = 'flex';
    });
}

let currentPurchaseProduct = null;

window.showPurchaseModal = function(productId) {
    const product = STORE_PRODUCTS[productId];
    if (!product) return;
    
    showConfirmModal(product, 1, product.price);
};

window.processPurchase = function(purchaseData) {
    if (!purchaseData || !purchaseData.resolve) return;
    
    purchaseData.resolve(true);
    window.closePurchaseModal();
};

// ============================================
// EFECTOS VISUALES
// ============================================

function showCoinAnimation(amount, isPositive) {
    const coinElement = document.createElement('div');
    coinElement.className = 'coin-animation';
    coinElement.innerHTML = `
        <i class="fas fa-coins"></i>
        <span>${amount > 0 ? '+' : ''}${amount}</span>
    `;
    
    coinElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        font-weight: bold;
        color: ${isPositive ? '#27ae60' : '#e74c3c'};
        z-index: 2000;
        pointer-events: none;
        animation: coinFloat 2s ease-out forwards;
    `;
    
    document.body.appendChild(coinElement);
    
    setTimeout(() => coinElement.remove(), 2000);
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
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
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
    
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🛒 DOM cargado, inicializando Store...');
    init();
});

// Exposición global para debugging
window.StoreDebug = {
    data: storeData,
    products: STORE_PRODUCTS,
    getGameDataManager: () => window.GameDataManager
};

console.log('✅ Store.js SIMPLIFICADO cargado completamente');