/**
 * ================================================
 * STORE SYSTEM - TIENDA FUNCIONAL COMPLETA
 * Quiz Cristiano - Sistema de compras con monedas
 * ================================================
 */

// ============================================
// CONFIGURACIÓN DE PRODUCTOS
// ============================================

const STORE_PRODUCTS = {
    // 🎯 POWER-UPS DE JUEGO
    powerups: [
        {
            id: 'hint_eliminator',
            name: 'Eliminador de Opciones',
            description: 'Elimina 2 opciones incorrectas en cualquier pregunta',
            icon: 'fa-times-circle',
            price: 150,
            type: 'consumable',
            category: 'powerups',
            rarity: 'common',
            effects: {
                eliminateOptions: 2,
                duration: 'single_use'
            },
            available: true
        },
        {
            id: 'time_extender',
            name: 'Tiempo Extra',
            description: 'Añade 15 segundos adicionales al timer de la pregunta',
            icon: 'fa-clock',
            price: 100,
            type: 'consumable',
            category: 'powerups',
            rarity: 'common',
            effects: {
                extraTime: 15,
                duration: 'single_use'
            },
            available: true
        },
        {
            id: 'second_chance',
            name: 'Segunda Oportunidad',
            description: 'Revive automáticamente si fallas en una pregunta de rescate',
            icon: 'fa-heart',
            price: 300,
            type: 'consumable',
            category: 'powerups',
            rarity: 'rare',
            effects: {
                revive: true,
                duration: 'single_use'
            },
            available: true
        },
        {
            id: 'coin_multiplier',
            name: 'Multiplicador x2',
            description: 'Duplica las monedas ganadas durante una partida completa',
            icon: 'fa-coins',
            price: 500,
            type: 'consumable',
            category: 'powerups',
            rarity: 'rare',
            effects: {
                coinMultiplier: 2,
                duration: 'single_game'
            },
            available: true
        }
    ],

    // 🎨 PERSONALIZACIÓN DE JOY
    cosmetics: [
        {
            id: 'joy_crown',
            name: 'Corona Dorada para Joy',
            description: 'Una elegante corona que hace que Joy se vea majestuosa',
            icon: 'fa-crown',
            price: 800,
            type: 'permanent',
            category: 'cosmetics',
            rarity: 'epic',
            effects: {
                mascotAccessory: 'crown',
                prestigeBonus: 5
            },
            available: true,
            previewImage: 'joy_crown.png'
        },
        {
            id: 'joy_halo',
            name: 'Aureola Celestial',
            description: 'Una aureola brillante que muestra la santidad de Joy',
            icon: 'fa-circle',
            price: 1200,
            type: 'permanent',
            category: 'cosmetics',
            rarity: 'legendary',
            effects: {
                mascotAccessory: 'halo',
                prestigeBonus: 10,
                glowEffect: true
            },
            available: true,
            previewImage: 'joy_halo.png'
        },
        {
            id: 'joy_bible',
            name: 'Biblia Sagrada',
            description: 'Joy sostiene una pequeña biblia, símbolo de sabiduría',
            icon: 'fa-book',
            price: 600,
            type: 'permanent',
            category: 'cosmetics',
            rarity: 'uncommon',
            effects: {
                mascotAccessory: 'bible',
                wisdomBonus: 3
            },
            available: true,
            previewImage: 'joy_bible.png'
        }
    ],

    // 🔓 EXPANSIONES DE CONTENIDO
    expansions: [
        {
            id: 'premium_questions',
            name: 'Pack de Preguntas Premium',
            description: 'Desbloquea 100 preguntas adicionales de nivel avanzado',
            icon: 'fa-scroll',
            price: 2000,
            type: 'permanent',
            category: 'expansions',
            rarity: 'epic',
            effects: {
                extraQuestions: 100,
                difficultyUnlock: 'expert'
            },
            available: true
        },
        {
            id: 'daily_verse',
            name: 'Versículo Diario Premium',
            description: 'Accede a versículos exclusivos con comentarios explicativos',
            icon: 'fa-calendar-day',
            price: 1500,
            type: 'permanent',
            category: 'expansions',
            rarity: 'rare',
            effects: {
                premiumVerses: true,
                dailyBonus: 50
            },
            available: true
        }
    ],

    // 🎁 OFERTAS ESPECIALES
    bundles: [
        {
            id: 'starter_pack',
            name: 'Pack del Principiante',
            description: 'Todo lo que necesitas para empezar: 3 power-ups + corona para Joy',
            icon: 'fa-gift',
            price: 1000,
            originalPrice: 1350,
            type: 'bundle',
            category: 'bundles',
            rarity: 'special',
            contents: ['hint_eliminator', 'time_extender', 'second_chance', 'joy_crown'],
            savings: 350,
            available: true,
            limited: true,
            expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 días
        },
        {
            id: 'master_bundle',
            name: 'Pack del Maestro',
            description: 'El pack definitivo: todos los power-ups + accesorios premium',
            icon: 'fa-medal',
            price: 3500,
            originalPrice: 5000,
            type: 'bundle',
            category: 'bundles',
            rarity: 'legendary',
            contents: ['hint_eliminator', 'time_extender', 'second_chance', 'coin_multiplier', 'joy_crown', 'joy_halo', 'premium_questions'],
            savings: 1500,
            available: true
        }
    ]
};

const RARITY_CONFIG = {
    common: { color: '#95a5a6', bgColor: 'rgba(149, 165, 166, 0.1)', name: 'Común' },
    uncommon: { color: '#27ae60', bgColor: 'rgba(39, 174, 96, 0.1)', name: 'Poco Común' },
    rare: { color: '#3498db', bgColor: 'rgba(52, 152, 219, 0.1)', name: 'Raro' },
    epic: { color: '#9b59b6', bgColor: 'rgba(155, 89, 182, 0.1)', name: 'Épico' },
    legendary: { color: '#f39c12', bgColor: 'rgba(243, 156, 18, 0.1)', name: 'Legendario' },
    special: { color: '#e74c3c', bgColor: 'rgba(231, 76, 60, 0.1)', name: 'Especial' }
};

// ============================================
// VARIABLES GLOBALES
// ============================================

let playerData = {
    coins: 0,
    inventory: {
        powerups: {},
        cosmetics: [],
        expansions: [],
        bundles: []
    },
    purchaseHistory: [],
    settings: {
        confirmPurchases: true,
        showAnimations: true
    }
};

let elements = {};
let currentFilter = 'all';

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

function init() {
    console.log('🛒 Inicializando tienda...');
    bindElements();
    loadPlayerData();
    renderStore();
    updatePlayerStats();
    startDynamicEffects();
    console.log('✅ Tienda inicializada correctamente');
}

function bindElements() {
    elements.coinsDisplay = document.getElementById('coins-display');
    elements.inventoryCount = document.getElementById('inventory-count');
    elements.storeGrid = document.getElementById('store-grid');
    elements.categoryFilters = document.querySelectorAll('.category-filter');
    elements.purchaseModal = document.getElementById('purchase-modal');
    elements.modalContent = document.querySelector('.purchase-modal-content');
    elements.inventoryModal = document.getElementById('inventory-modal');
    elements.inventoryGrid = document.getElementById('inventory-grid');
    elements.searchInput = document.getElementById('search-input');
}

function renderStore(filter = 'all', searchTerm = '') {
    if (!elements.storeGrid) return;

    console.log(`🔍 Renderizando tienda - Filtro: ${filter}, Búsqueda: "${searchTerm}"`);
    
    elements.storeGrid.innerHTML = '';
    
    // Obtener todos los productos
    const allProducts = [];
    Object.keys(STORE_PRODUCTS).forEach(category => {
        STORE_PRODUCTS[category].forEach(product => {
            if (product.available) {
                product.categoryName = category;
                allProducts.push(product);
            }
        });
    });

    // Filtrar productos
    let filteredProducts = allProducts.filter(product => {
        const matchesFilter = filter === 'all' || product.category === filter;
        const matchesSearch = searchTerm === '' || 
                             product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Ordenar por rareza y precio
    filteredProducts.sort((a, b) => {
        const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, special: 6 };
        const aRarity = rarityOrder[a.rarity] || 0;
        const bRarity = rarityOrder[b.rarity] || 0;
        
        if (aRarity !== bRarity) return bRarity - aRarity;
        return a.price - b.price;
    });

    // Renderizar productos
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        elements.storeGrid.appendChild(productCard);
    });

    // Mensaje si no hay productos
    if (filteredProducts.length === 0) {
        elements.storeGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <p>No se encontraron productos</p>
                <small>Intenta con otros filtros o términos de búsqueda</small>
            </div>
        `;
    }

    console.log(`✅ ${filteredProducts.length} productos renderizados`);
}

function createProductCard(product) {
    const rarity = RARITY_CONFIG[product.rarity];
    const isOwned = checkIfOwned(product);
    const canAfford = playerData.coins >= product.price;
    const isBundle = product.type === 'bundle';
    
    const card = document.createElement('div');
    card.className = `product-card rarity-${product.rarity} ${isOwned ? 'owned' : ''} ${!canAfford && !isOwned ? 'cannot-afford' : ''}`;
    
    // Precio con descuento si es bundle
    let priceDisplay = `<span class="price">${product.price} <i class="fas fa-coins"></i></span>`;
    if (isBundle && product.originalPrice) {
        priceDisplay = `
            <div class="bundle-pricing">
                <span class="original-price">${product.originalPrice} <i class="fas fa-coins"></i></span>
                <span class="discounted-price">${product.price} <i class="fas fa-coins"></i></span>
                <span class="savings">¡Ahorra ${product.savings}!</span>
            </div>
        `;
    }

    // Información de expiración para ofertas limitadas
    let limitedInfo = '';
    if (product.limited && product.expires) {
        const timeLeft = Math.max(0, product.expires - Date.now());
        const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000));
        limitedInfo = `
            <div class="limited-offer">
                <i class="fas fa-clock"></i>
                <span>Oferta limitada: ${daysLeft} días restantes</span>
            </div>
        `;
    }

    // Contenido del bundle
    let bundleContent = '';
    if (isBundle && product.contents) {
        bundleContent = `
            <div class="bundle-contents">
                <h5>Incluye:</h5>
                <div class="bundle-items">
                    ${product.contents.map(itemId => {
                        const item = findProductById(itemId);
                        return item ? `<span class="bundle-item"><i class="fas ${item.icon}"></i> ${item.name}</span>` : '';
                    }).join('')}
                </div>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="product-header" style="background: ${rarity.bgColor}">
            <div class="product-icon" style="color: ${rarity.color}">
                <i class="fas ${product.icon}"></i>
            </div>
            <div class="product-rarity" style="color: ${rarity.color}">${rarity.name}</div>
            ${limitedInfo}
        </div>
        
        <div class="product-body">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            ${bundleContent}
            
            <div class="product-effects">
                ${renderProductEffects(product)}
            </div>
        </div>
        
        <div class="product-footer">
            ${priceDisplay}
            ${renderActionButton(product, isOwned, canAfford)}
        </div>
        
        ${isOwned ? '<div class="owned-badge"><i class="fas fa-check"></i> Adquirido</div>' : ''}
    `;

    // Agregar evento click
    const actionButton = card.querySelector('.action-btn');
    if (actionButton && !isOwned) {
        actionButton.addEventListener('click', (e) => {
            e.stopPropagation();
            showPurchaseModal(product);
        });
    }

    // Click en la card para ver detalles
    card.addEventListener('click', () => {
        showProductDetails(product);
    });

    return card;
}

function renderProductEffects(product) {
    if (!product.effects) return '';
    
    const effects = [];
    
    // Mapear efectos a descripiones legibles
    if (product.effects.eliminateOptions) {
        effects.push(`<span class="effect"><i class="fas fa-times"></i> Elimina ${product.effects.eliminateOptions} opciones</span>`);
    }
    if (product.effects.extraTime) {
        effects.push(`<span class="effect"><i class="fas fa-clock"></i> +${product.effects.extraTime}s de tiempo</span>`);
    }
    if (product.effects.revive) {
        effects.push(`<span class="effect"><i class="fas fa-heart"></i> Segunda oportunidad</span>`);
    }
    if (product.effects.coinMultiplier) {
        effects.push(`<span class="effect"><i class="fas fa-coins"></i> x${product.effects.coinMultiplier} monedas</span>`);
    }
    if (product.effects.prestigeBonus) {
        effects.push(`<span class="effect"><i class="fas fa-star"></i> +${product.effects.prestigeBonus}% prestigio</span>`);
    }
    if (product.effects.extraQuestions) {
        effects.push(`<span class="effect"><i class="fas fa-scroll"></i> +${product.effects.extraQuestions} preguntas</span>`);
    }
    
    return effects.join('');
}

function renderActionButton(product, isOwned, canAfford) {
    if (isOwned) {
        if (product.type === 'consumable') {
            const quantity = playerData.inventory.powerups[product.id] || 0;
            return `<div class="quantity-display">Cantidad: ${quantity}</div>`;
        } else {
            return `<button class="action-btn equipped" disabled><i class="fas fa-check"></i> Adquirido</button>`;
        }
    }
    
    if (!canAfford) {
        return `<button class="action-btn insufficient-funds" disabled><i class="fas fa-coins"></i> Monedas insuficientes</button>`;
    }
    
    return `<button class="action-btn buy-btn"><i class="fas fa-shopping-cart"></i> Comprar</button>`;
}

function checkIfOwned(product) {
    switch (product.type) {
        case 'consumable':
            return playerData.inventory.powerups[product.id] > 0;
        case 'permanent':
            return playerData.inventory.cosmetics.includes(product.id) || 
                   playerData.inventory.expansions.includes(product.id);
        case 'bundle':
            return playerData.inventory.bundles.includes(product.id);
        default:
            return false;
    }
}

function findProductById(id) {
    for (const category of Object.values(STORE_PRODUCTS)) {
        const product = category.find(p => p.id === id);
        if (product) return product;
    }
    return null;
}

// ============================================
// SISTEMA DE COMPRAS
// ============================================

function showPurchaseModal(product) {
    if (!elements.purchaseModal) return;

    const rarity = RARITY_CONFIG[product.rarity];
    const canAfford = playerData.coins >= product.price;
    
    elements.modalContent.innerHTML = `
        <div class="modal-header" style="background: ${rarity.bgColor}">
            <div class="modal-icon" style="color: ${rarity.color}">
                <i class="fas ${product.icon}"></i>
            </div>
            <h2>${product.name}</h2>
            <span class="modal-rarity" style="color: ${rarity.color}">${rarity.name}</span>
        </div>
        
        <div class="modal-body">
            <p class="modal-description">${product.description}</p>
            
            ${product.type === 'bundle' ? renderBundlePreview(product) : ''}
            
            <div class="effects-preview">
                <h4>Efectos:</h4>
                ${renderProductEffects(product)}
            </div>
            
            <div class="purchase-info">
                <div class="price-breakdown">
                    <span class="total-price">${product.price} <i class="fas fa-coins"></i></span>
                    <span class="remaining-coins">Te quedarán: ${Math.max(0, playerData.coins - product.price)} monedas</span>
                </div>
                
                ${!canAfford ? '<div class="insufficient-warning"><i class="fas fa-exclamation-triangle"></i> No tienes suficientes monedas</div>' : ''}
            </div>
        </div>
        
        <div class="modal-footer">
            <button class="btn cancel-btn" onclick="closePurchaseModal()">Cancelar</button>
            <button class="btn purchase-btn ${!canAfford ? 'disabled' : ''}" 
                    onclick="confirmPurchase('${product.id}')" 
                    ${!canAfford ? 'disabled' : ''}>
                <i class="fas fa-shopping-cart"></i> Confirmar Compra
            </button>
        </div>
    `;

    elements.purchaseModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function renderBundlePreview(product) {
    if (!product.contents) return '';
    
    return `
        <div class="bundle-preview">
            <h4>Este pack incluye:</h4>
            <div class="bundle-items-preview">
                ${product.contents.map(itemId => {
                    const item = findProductById(itemId);
                    if (!item) return '';
                    
                    return `
                        <div class="bundle-item-preview">
                            <i class="fas ${item.icon}"></i>
                            <span>${item.name}</span>
                            <small>${item.price} <i class="fas fa-coins"></i></small>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="bundle-savings">
                <strong>Precio individual: ${product.originalPrice} <i class="fas fa-coins"></i></strong>
                <strong>Precio del pack: ${product.price} <i class="fas fa-coins"></i></strong>
                <strong class="savings-highlight">¡Ahorras ${product.savings} monedas!</strong>
            </div>
        </div>
    `;
}

function confirmPurchase(productId) {
    const product = findProductById(productId);
    if (!product) {
        console.error('❌ Producto no encontrado:', productId);
        return;
    }

    if (playerData.coins < product.price) {
        showNotification('No tienes suficientes monedas', 'error');
        return;
    }

    // Realizar compra
    playerData.coins -= product.price;
    
    // Agregar al inventario
    addToInventory(product);
    
    // Registrar compra
    playerData.purchaseHistory.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        timestamp: Date.now(),
        type: product.type
    });

    // Guardar datos
    savePlayerData();
    
    // Actualizar UI
    updatePlayerStats();
    renderStore(currentFilter);
    
    // Mostrar confirmación
    showPurchaseConfirmation(product);
    
    // Cerrar modal
    closePurchaseModal();

    console.log('✅ Compra realizada:', product.name);
}

function addToInventory(product) {
    switch (product.type) {
        case 'consumable':
            if (!playerData.inventory.powerups[product.id]) {
                playerData.inventory.powerups[product.id] = 0;
            }
            playerData.inventory.powerups[product.id]++;
            break;
            
        case 'permanent':
            if (product.category === 'cosmetics') {
                if (!playerData.inventory.cosmetics.includes(product.id)) {
                    playerData.inventory.cosmetics.push(product.id);
                }
            } else if (product.category === 'expansions') {
                if (!playerData.inventory.expansions.includes(product.id)) {
                    playerData.inventory.expansions.push(product.id);
                }
            }
            break;
            
        case 'bundle':
            if (!playerData.inventory.bundles.includes(product.id)) {
                playerData.inventory.bundles.push(product.id);
            }
            // Agregar contenido del bundle
            if (product.contents) {
                product.contents.forEach(itemId => {
                    const item = findProductById(itemId);
                    if (item) {
                        addToInventory(item);
                    }
                });
            }
            break;
    }
}

function showPurchaseConfirmation(product) {
    const notification = document.createElement('div');
    notification.className = 'purchase-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas ${product.icon}"></i>
            </div>
            <div class="notification-text">
                <h4>¡Compra exitosa!</h4>
                <p>${product.name}</p>
                <small>Agregado a tu inventario</small>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ============================================
// FUNCIONES GLOBALES PARA EVENTOS
// ============================================

window.filterStore = function(category) {
    currentFilter = category;
    
    // Actualizar botones activos
    elements.categoryFilters.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(category)) {
            btn.classList.add('active');
        }
    });
    
    renderStore(category);
};

window.searchProducts = function(searchTerm) {
    renderStore(currentFilter, searchTerm);
};

window.closePurchaseModal = function() {
    if (elements.purchaseModal) {
        elements.purchaseModal.style.display = 'none';
        document.body.style.overflow = '';
    }
};

window.showInventory = function() {
    renderInventory();
    elements.inventoryModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.closeInventoryModal = function() {
    if (elements.inventoryModal) {
        elements.inventoryModal.style.display = 'none';
        document.body.style.overflow = '';
    }
};

window.confirmPurchase = confirmPurchase;

// ============================================
// INVENTARIO
// ============================================

function renderInventory() {
    if (!elements.inventoryGrid) return;

    elements.inventoryGrid.innerHTML = '';
    
    // Renderizar power-ups
    if (Object.keys(playerData.inventory.powerups).length > 0) {
        const powerupsSection = document.createElement('div');
        powerupsSection.className = 'inventory-section';
        powerupsSection.innerHTML = '<h3><i class="fas fa-magic"></i> Power-ups</h3>';
        
        Object.entries(playerData.inventory.powerups).forEach(([productId, quantity]) => {
            if (quantity > 0) {
                const product = findProductById(productId);
                if (product) {
                    const item = createInventoryItem(product, quantity);
                    powerupsSection.appendChild(item);
                }
            }
        });
        
        elements.inventoryGrid.appendChild(powerupsSection);
    }
    
    // Renderizar cosméticos
    if (playerData.inventory.cosmetics.length > 0) {
        const cosmeticsSection = document.createElement('div');
        cosmeticsSection.className = 'inventory-section';
        cosmeticsSection.innerHTML = '<h3><i class="fas fa-tshirt"></i> Cosméticos</h3>';
        
        playerData.inventory.cosmetics.forEach(productId => {
            const product = findProductById(productId);
            if (product) {
                const item = createInventoryItem(product);
                cosmeticsSection.appendChild(item);
            }
        });
        
        elements.inventoryGrid.appendChild(cosmeticsSection);
    }
    
    // Renderizar expansiones
    if (playerData.inventory.expansions.length > 0) {
        const expansionsSection = document.createElement('div');
        expansionsSection.className = 'inventory-section';
        expansionsSection.innerHTML = '<h3><i class="fas fa-expand"></i> Expansiones</h3>';
        
        playerData.inventory.expansions.forEach(productId => {
            const product = findProductById(productId);
            if (product) {
                const item = createInventoryItem(product);
                expansionsSection.appendChild(item);
            }
        });
        
        elements.inventoryGrid.appendChild(expansionsSection);
    }
    
    // Mensaje si inventario vacío
    if (elements.inventoryGrid.children.length === 0) {
        elements.inventoryGrid.innerHTML = `
            <div class="empty-inventory">
                <i class="fas fa-box-open"></i>
                <p>Tu inventario está vacío</p>
                <small>¡Compra algunos artículos en la tienda!</small>
            </div>
        `;
    }
}

function createInventoryItem(product, quantity = null) {
    const rarity = RARITY_CONFIG[product.rarity];
    
    const item = document.createElement('div');
    item.className = `inventory-item rarity-${product.rarity}`;
    
    item.innerHTML = `
        <div class="item-icon" style="color: ${rarity.color}">
            <i class="fas ${product.icon}"></i>
            ${quantity ? `<span class="quantity-badge">${quantity}</span>` : ''}
        </div>
        <div class="item-info">
            <h4>${product.name}</h4>
            <p>${product.description}</p>
        </div>
        ${product.type === 'consumable' && quantity ? 
            `<button class="use-btn" onclick="useItem('${product.id}')">Usar</button>` : 
            ''}
    `;
    
    return item;
}

// ============================================
// PERSISTENCIA Y UTILIDADES
// ============================================

function loadPlayerData() {
    try {
        // Cargar datos del juego principal
        const gameData = localStorage.getItem('quizCristianoData');
        if (gameData) {
            const data = JSON.parse(gameData);
            playerData.coins = data.coins || 0;
        }
        
        // Cargar datos específicos de la tienda
        const storeData = localStorage.getItem('quizCristianoStore');
        if (storeData) {
            const data = JSON.parse(storeData);
            playerData.inventory = { ...playerData.inventory, ...data.inventory };
            playerData.purchaseHistory = data.purchaseHistory || [];
            playerData.settings = { ...playerData.settings, ...data.settings };
        }
        
        console.log('📄 Datos del jugador cargados:', playerData);
    } catch (error) {
        console.warn('⚠️ Error cargando datos del jugador:', error);
    }
}

function savePlayerData() {
    try {
        // Guardar en localStorage del juego principal
        const gameData = {
            coins: playerData.coins,
            lastPlayed: Date.now()
        };
        localStorage.setItem('quizCristianoData', JSON.stringify(gameData));
        
        // Guardar datos específicos de la tienda
        const storeData = {
            inventory: playerData.inventory,
            purchaseHistory: playerData.purchaseHistory,
            settings: playerData.settings
        };
        localStorage.setItem('quizCristianoStore', JSON.stringify(storeData));
        
        console.log('💾 Datos del jugador guardados');
    } catch (error) {
        console.error('❌ Error guardando datos:', error);
    }
}

function updatePlayerStats() {
    if (elements.coinsDisplay) {
        elements.coinsDisplay.textContent = playerData.coins;
    }
    
    if (elements.inventoryCount) {
        const totalItems = Object.values(playerData.inventory.powerups).reduce((sum, qty) => sum + qty, 0) +
                          playerData.inventory.cosmetics.length +
                          playerData.inventory.expansions.length;
        elements.inventoryCount.textContent = totalItems;
    }
}

function startDynamicEffects() {
    // Efectos visuales dinámicos para productos especiales
    setInterval(() => {
        const legendaryCards = document.querySelectorAll('.product-card.rarity-legendary');
        legendaryCards.forEach(card => {
            card.style.boxShadow = `0 0 ${10 + Math.random() * 10}px rgba(243, 156, 18, 0.${Math.floor(Math.random() * 5) + 3})`;
        });
    }, 2000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ============================================
// INTEGRACIÓN CON OTRAS PÁGINAS
// ============================================

window.StoreSystem = {
    getInventory: () => playerData.inventory,
    hasItem: (itemId) => checkIfOwned(findProductById(itemId)),
    useItem: (itemId) => {
        if (playerData.inventory.powerups[itemId] > 0) {
            playerData.inventory.powerups[itemId]--;
            savePlayerData();
            return true;
        }
        return false;
    },
    getItemQuantity: (itemId) => playerData.inventory.powerups[itemId] || 0
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 DOM cargado, inicializando tienda...');
    setTimeout(() => {
        init();
    }, 100);
});

console.log('✅ Store.js cargado completamente');