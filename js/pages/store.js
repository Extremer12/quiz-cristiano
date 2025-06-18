/**
 * ================================================
 * STORE - TIENDA DEL JUEGO CORREGIDA
 * Quiz Cristiano - Sistema de compras integrado con GameDataManager
 * ================================================
 */

// ============================================
// VARIABLES GLOBALES
// ============================================

let storeData = {
    isInitialized: false,
    selectedCategory: 'all',
    cart: [],
    isProcessingPurchase: false
};

// ✅ CONFIGURACIÓN DE PRODUCTOS CORREGIDA
const STORE_PRODUCTS = {
    powerups: {
        hint_eliminator: {
            id: 'hint_eliminator',
            gameId: 'eliminate', // ✅ MAPEO CORRECTO
            name: 'Eliminador de Opciones',
            description: 'Elimina 2 opciones incorrectas',
            price: 25,
            icon: 'fa-eraser',
            color: '#e74c3c',
            category: 'powerups'
        },
        time_extender: {
            id: 'time_extender', 
            gameId: 'timeExtender', // ✅ CORREGIDO: debe coincidir con GameDataManager
            name: 'Tiempo Extra',
            description: 'Añade 15 segundos al timer',
            price: 20,
            icon: 'fa-clock',
            color: '#3498db',
            category: 'powerups'
        },
        second_chance: {
            id: 'second_chance',
            gameId: 'secondChance', // ✅ MAPEO CORRECTO
            name: 'Segunda Oportunidad',
            description: 'Revive automáticamente',
            price: 40,
            icon: 'fa-heart',
            color: '#e67e22',
            category: 'powerups'
        }
    }
};

// ============================================
// INICIALIZACIÓN CORREGIDA
// ============================================

async function initStore() {
    try {
        console.log('🛒 Inicializando Store...');
        
        // Esperar GameDataManager
        if (!window.GameDataManager) {
            console.log('⏳ Esperando GameDataManager...');
            await waitForGameDataManager();
        }
        
        // Configurar listeners
        setupGameDataListeners();
        
        // Renderizar productos
        renderProducts();
        
        // Actualizar displays
        updateCoinsDisplay();
        updateInventoryDisplay();
        
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
            if (window.GameDataManager && window.GameDataManager.gameData) {
                console.log('✅ GameDataManager encontrado');
                resolve();
            } else {
                console.log('⏳ Esperando GameDataManager...');
                setTimeout(checkGameDataManager, 100);
            }
        };
        checkGameDataManager();
    });
}

// ✅ CONFIGURAR LISTENERS PARA SINCRONIZACIÓN EN TIEMPO REAL
function setupGameDataListeners() {
    console.log('🔗 Configurando listeners de GameDataManager...');
    
    // Listener para cambios de monedas
    window.GameDataManager.onCoinsChanged((data) => {
        console.log('💰 Monedas cambiaron en tiempo real:', data);
        updateCoinsDisplay();
        
        // Mostrar animación si hay cambio
        if (data.difference !== 0) {
            showCoinAnimation(data.difference, data.difference > 0);
        }
    });
    
    // Listener para cambios de inventario
    window.GameDataManager.onInventoryChanged((data) => {
        console.log('🎒 Inventario cambió en tiempo real:', data);
        updateInventoryDisplay();
        updateProductCards();
    });
    
    // Listener para sincronización de datos
    window.GameDataManager.onDataChanged((data) => {
        console.log('🔄 Datos sincronizados:', data.action);
        if (data.action === 'synced') {
            updateCoinsDisplay();
            updateInventoryDisplay();
            showNotification('Datos sincronizados', 'info');
        }
    });
}

// ============================================
// RENDERIZADO DE PRODUCTOS CORREGIDO
// ============================================

function renderProducts() {
    const storeGrid = document.getElementById('store-grid');
    if (!storeGrid) {
        console.error('❌ Elemento store-grid no encontrado');
        return;
    }
    
    console.log('🏪 Renderizando productos en la tienda...');
    
    const allProducts = Object.values(STORE_PRODUCTS.powerups);
    
    storeGrid.innerHTML = allProducts.map(product => `
        <div class="product-card" data-category="${product.category}" data-product-id="${product.id}">
            <div class="product-header">
                <div class="product-icon" style="color: ${product.color}">
                    <i class="fas ${product.icon}"></i>
                </div>
                <div class="product-owned">
                    <span class="owned-count">${getOwnedCount(product.gameId)}</span>
                    <small>disponibles</small>
                </div>
            </div>
            
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
            </div>
            
            <div class="product-footer">
                <div class="product-price">
                    <i class="fas fa-coins"></i>
                    <span>${product.price}</span>
                </div>
                
                <div class="product-actions">
                    <button class="quantity-btn minus-btn" onclick="changeQuantity('${product.id}', -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    
                    <input type="number" 
                           class="quantity-input" 
                           id="qty-${product.id}"
                           value="1" 
                           min="1" 
                           max="99"
                           onchange="validateQuantity('${product.id}')">
                    
                    <button class="quantity-btn plus-btn" onclick="changeQuantity('${product.id}', 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <button class="buy-btn" onclick="buyProduct('${product.id}')">
                    <i class="fas fa-shopping-cart"></i>
                    Comprar
                </button>
            </div>
        </div>
    `).join('');
    
    console.log(`✅ ${allProducts.length} productos renderizados correctamente`);
}

// ✅ FUNCIÓN CORREGIDA PARA OBTENER CANTIDAD POSEÍDA
function getOwnedCount(gameId) {
    if (!window.GameDataManager) return 0;
    return window.GameDataManager.getPowerupCount(gameId) || 0;
}

function updateProductCards() {
    console.log('🔄 Actualizando tarjetas de productos...');
    
    Object.values(STORE_PRODUCTS.powerups).forEach(product => {
        const productCard = document.querySelector(`[data-product-id="${product.id}"]`);
        if (productCard) {
            const ownedCountElement = productCard.querySelector('.owned-count');
            if (ownedCountElement) {
                ownedCountElement.textContent = getOwnedCount(product.gameId);
            }
        }
    });
}

// ============================================
// SISTEMA DE COMPRAS INTEGRADO
// ============================================

window.buyProduct = async function(productId) {
    console.log(`🛒 Intentando comprar: ${productId}`);
    
    if (storeData.isProcessingPurchase) {
        console.log('⏳ Ya se está procesando una compra');
        return;
    }
    
    if (!window.GameDataManager) {
        showNotification('Sistema no disponible', 'error');
        return;
    }
    
    const product = STORE_PRODUCTS.powerups[productId];
    if (!product) {
        console.error('❌ Producto no encontrado:', productId);
        return;
    }
    
    const quantityInput = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(quantityInput?.value || 1);
    const totalCost = product.price * quantity;
    
    // Verificar fondos
    const currentCoins = window.GameDataManager.getCoins();
    if (currentCoins < totalCost) {
        showNotification(`Fondos insuficientes. Necesitas ${totalCost - currentCoins} monedas más`, 'error');
        return;
    }
    
    try {
        storeData.isProcessingPurchase = true;
        
        // Mostrar confirmación de compra
        const confirmed = await showPurchaseConfirmation(product, quantity, totalCost);
        if (!confirmed) {
            storeData.isProcessingPurchase = false;
            return;
        }
        
        // ✅ USAR GAMEDATAMANAGER PARA LA TRANSACCIÓN
        console.log(`💳 Procesando compra: ${quantity}x ${product.name} por ${totalCost} monedas`);
        
        // 1. Gastar monedas
        const coinsSpent = window.GameDataManager.spendCoins(totalCost, `purchase_${productId}`);
        if (!coinsSpent) {
            throw new Error('No se pudieron gastar las monedas');
        }
        
        // 2. Agregar power-ups al inventario
        const powerupAdded = window.GameDataManager.addPowerup(product.gameId, quantity, 'purchase');
        if (!powerupAdded) {
            // Revertir gasto de monedas
            window.GameDataManager.addCoins(totalCost, 'refund_failed_purchase');
            throw new Error('No se pudieron agregar los power-ups');
        }
        
        // 3. Mostrar confirmación exitosa
        showPurchaseSuccess(product, quantity, totalCost);
        
        // 4. Resetear cantidad a 1
        if (quantityInput) {
            quantityInput.value = 1;
        }
        
        console.log('✅ Compra completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error en la compra:', error);
        showNotification('Error procesando la compra', 'error');
    } finally {
        storeData.isProcessingPurchase = false;
    }
};

function showPurchaseConfirmation(product, quantity, totalCost) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); display: flex; align-items: center;
            justify-content: center; z-index: 2000;
        `;
        
        modal.innerHTML = `
            <div style="
                background: var(--surface-primary); backdrop-filter: blur(20px);
                border-radius: 20px; padding: 30px; text-align: center;
                max-width: 400px; width: 90%; border: 1px solid var(--border-primary);
            ">
                <div style="color: ${product.color}; font-size: 3rem; margin-bottom: 20px;">
                    <i class="fas ${product.icon}"></i>
                </div>
                <h3>Confirmar Compra</h3>
                <p>${quantity}x ${product.name}</p>
                <p style="color: var(--primary-color); font-size: 1.2rem; font-weight: bold;">
                    ${totalCost} monedas
                </p>
                <div style="display: flex; gap: 15px; margin-top: 25px;">
                    <button onclick="resolveModal(false)" style="
                        flex: 1; padding: 12px; border-radius: 15px; border: none;
                        background: var(--surface-secondary); color: white; cursor: pointer;
                    ">Cancelar</button>
                    <button onclick="resolveModal(true)" style="
                        flex: 1; padding: 12px; border-radius: 15px; border: none;
                        background: var(--success-color); color: white; cursor: pointer;
                    ">Comprar</button>
                </div>
            </div>
        `;
        
        window.resolveModal = function(confirmed) {
            modal.remove();
            delete window.resolveModal;
            resolve(confirmed);
        };
        
        document.body.appendChild(modal);
    });
}

function showPurchaseSuccess(product, quantity, totalCost) {
    // Mostrar notificación de éxito
    showNotification(`¡Compra exitosa! ${quantity}x ${product.name}`, 'success');
    
    // Mostrar animación de monedas gastadas
    showCoinAnimation(-totalCost, false);
    
    // Actualizar displays
    updateCoinsDisplay();
    updateInventoryDisplay();
    updateProductCards();
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
    const product = STORE_PRODUCTS.powerups[productId];
    const quantity = parseInt(document.getElementById(`qty-${productId}`)?.value || 1);
    const totalCost = product.price * quantity;
    
    // Actualizar precio mostrado si existe elemento
    const priceDisplay = document.querySelector(`[data-product-id="${productId}"] .product-price span`);
    if (priceDisplay && quantity > 1) {
        priceDisplay.textContent = `${totalCost} (${quantity}x${product.price})`;
    } else if (priceDisplay) {
        priceDisplay.textContent = product.price;
    }
}

// ============================================
// ACTUALIZACIÓN DE DISPLAYS
// ============================================

function updateCoinsDisplay() {
    if (!window.GameDataManager) return;
    
    const coinsElements = document.querySelectorAll('.coins-amount, .player-coins, #player-coins');
    const currentCoins = window.GameDataManager.getCoins();
    
    coinsElements.forEach(element => {
        if (element) {
            element.textContent = currentCoins.toLocaleString();
        }
    });
    
    console.log(`💰 Display de monedas actualizado: ${currentCoins}`);
}

function updateInventoryDisplay() {
    if (!window.GameDataManager) return;
    
    const inventory = window.GameDataManager.getInventory();
    console.log('🎒 Actualizando display de inventario:', inventory);
    
    // Actualizar contadores en tarjetas de productos
    Object.values(STORE_PRODUCTS.powerups).forEach(product => {
        const countElement = document.querySelector(`[data-product-id="${product.id}"] .owned-count`);
        if (countElement) {
            countElement.textContent = inventory[product.gameId] || 0;
        }
    });
    
    // Actualizar sección de inventario si existe
    const inventorySection = document.getElementById('inventory-section');
    if (inventorySection) {
        renderInventorySection(inventory);
    }
}

function renderInventorySection(inventory) {
    const inventorySection = document.getElementById('inventory-section');
    if (!inventorySection) return;
    
    const hasItems = Object.values(inventory).some(count => count > 0);
    
    if (!hasItems) {
        inventorySection.innerHTML = `
            <div class="inventory-empty">
                <i class="fas fa-box-open"></i>
                <p>No tienes power-ups disponibles</p>
                <small>Compra algunos para usar en el juego</small>
            </div>
        `;
        return;
    }
    
    inventorySection.innerHTML = `
        <h3>Tu Inventario</h3>
        <div class="inventory-grid">
            ${Object.entries(inventory).map(([gameId, count]) => {
                if (count <= 0) return '';
                
                const product = Object.values(STORE_PRODUCTS.powerups).find(p => p.gameId === gameId);
                if (!product) return '';
                
                return `
                    <div class="inventory-item">
                        <div class="item-icon" style="color: ${product.color}">
                            <i class="fas ${product.icon}"></i>
                        </div>
                        <div class="item-info">
                            <h4>${product.name}</h4>
                            <span class="item-count">${count}</span>
                        </div>
                    </div>
                `;
            }).filter(Boolean).join('')}
        </div>
    `;
}

// ============================================
// FILTRADO Y NAVEGACIÓN
// ============================================

function filterProducts(category) {
    console.log(`🔍 Filtrando por categoría: ${category}`);
    
    storeData.selectedCategory = category;
    
    // Actualizar botones de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    // Mostrar/ocultar productos
    document.querySelectorAll('.product-card').forEach(card => {
        const productCategory = card.dataset.category;
        const shouldShow = category === 'all' || productCategory === category;
        
        card.style.display = shouldShow ? 'block' : 'none';
    });
}

// ============================================
// UTILIDADES
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
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-info'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--surface-primary);
        border: 1px solid var(--border-primary);
        border-radius: 8px;
        padding: 15px 20px;
        z-index: 2000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    
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
    initStore();
});

// Exposición global para debugging
window.StoreDebug = {
    data: storeData,
    products: STORE_PRODUCTS,
    getGameDataManager: () => window.GameDataManager
};

console.log('✅ Store.js con GameDataManager cargado completamente');