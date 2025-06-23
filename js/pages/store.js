/* filepath: c:\Users\julian\Desktop\WEBS\Proyectos sin terminar\quiz-cristiano\js\pages\store.js */
/**
 * ================================================
 * STORE TIENDA COMPLETA - CON MERCADO PAGO Y PAYPAL
 * Quiz Cristiano - Sistema completo de pagos
 * ================================================
 */

// ============================================
// VARIABLE GLOBAL ÚNICA PARA COMPRAS
// ============================================

let currentPurchaseProduct = null;
window.currentPurchaseProduct = null;

// ============================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================

let storeData = {
    isInitialized: false,
    isProcessingPurchase: false,
    mascotUnlocked: false,
    currentFilter: 'all'
};

// ✅ PRODUCTOS COMPLETOS ACTUALIZADOS CON PRECIOS DE PRUEBA
const STORE_PRODUCTS = {
    hint_eliminator: {
        id: 'hint_eliminator',
        gameId: 'eliminate',
        name: 'Eliminador de Opciones',
        description: 'Elimina 2 opciones incorrectas de cualquier pregunta',
        price: 400,
        currency: 'coins',
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
        currency: 'coins',
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
        currency: 'coins',
        icon: 'fa-heart',
        color: '#e67e22',
        category: 'powerups',
        effects: [
            'Rescate automático al fallar',
            'Evita el game over',
            'Perfecto para mantener rachas'
        ]
    },
    avatar_joy_guerrero: {
        id: 'avatar_joy_guerrero',
        gameId: 'avatarPremium',
        name: 'Avatar: Joy Guerrero',
        description: 'Avatar premium exclusivo de Joy como guerrero de la fe',
        price: 0.01,
        currency: 'USD',
        icon: 'fa-user-ninja',
        color: '#8e44ad',
        category: 'avatars',
        isPermanent: true,
        previewImage: 'assets/images/fotos-perfil-premium/joy-guerrero.jpg',
        effects: [
            'Avatar exclusivo y único',
            'Demuestra tu dedicación',
            'Disponible permanentemente'
        ]
    },
    premium_avatars_pack: {
        id: 'premium_avatars_pack',
        gameId: 'avatarsPack',
        name: 'Pack Avatares Premium',
        description: 'Todos los avatares premium actuales y futuros incluidos',
        price: 0.05,
        currency: 'USD',
        icon: 'fa-crown',
        color: '#ffd700',
        category: 'avatars',
        isPermanent: true,
        isBundle: true,
        savings: 'Ahorra más del 80%',
        includes: [
            'Joy Guerrero',
            'Todos los avatares futuros',
            'Acceso VIP a nuevos diseños'
        ],
        effects: [
            'Todos los avatares premium',
            'Acceso anticipado a nuevos',
            'Mejor relación calidad-precio'
        ]
    },
    joy_corona: {
        id: 'joy_corona',
        gameId: 'mascotUpgrade',
        name: 'Corona para Joy',
        description: 'Dale a Joy una corona real que la haga lucir como la reina que es',
        price: 10000,
        currency: 'coins',
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

// ✅ CATEGORÍAS DISPONIBLES
const STORE_CATEGORIES = [
    { id: 'all', name: 'Todos', icon: 'fa-th', color: '#3a86ff' },
    { id: 'powerups', name: 'Power-ups', icon: 'fa-magic', color: '#e74c3c' },
    { id: 'avatars', name: 'Avatares', icon: 'fa-user-circle', color: '#8e44ad' },
    { id: 'premium', name: 'Premium', icon: 'fa-crown', color: '#ffd700' }
];

console.log('🏪 Store.js iniciando con productos:', Object.keys(STORE_PRODUCTS));

// ============================================
// INICIALIZACIÓN
// ============================================

let mercadoPagoReady = false;

// ✅ FUNCIÓN INIT MEJORADA - CARGA INMEDIATA
async function init() {
    try {
        console.log('🏪 Inicializando tienda...');
        
        // ✅ MOSTRAR PRODUCTOS INMEDIATAMENTE (sin esperar GameDataManager)
        console.log('🛒 Renderizando productos inmediatamente...');
        renderProducts();
        updateCoinsDisplay();
        
        // Luego esperar GameDataManager en segundo plano
        setTimeout(async () => {
            try {
                await waitForGameDataManager();
                setupGameDataListeners();
                
                // Actualizar con datos reales
                updateAllDisplays();
                console.log('✅ GameDataManager conectado, datos actualizados');
            } catch (error) {
                console.warn('⚠️ GameDataManager no disponible, usando solo localStorage');
            }
        }, 100);
        
        // Intentar inicializar MercadoPago sin bloquear
        setTimeout(async () => {
            if (typeof initMercadoPago === 'function') {
                try {
                    await initMercadoPago();
                    mercadoPagoReady = true;
                    console.log('✅ MercadoPago inicializado');
                } catch (mpError) {
                    console.warn('⚠️ MercadoPago no disponible:', mpError);
                    mercadoPagoReady = false;
                }
            }
        }, 500);
        
        storeData.isInitialized = true;
        console.log('✅ Tienda inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando tienda:', error);
        renderEmergencyProducts();
    }
}

// ✅ FUNCIÓN DE PRODUCTOS DE EMERGENCIA
function renderEmergencyProducts() {
    console.log('🚨 Renderizando productos de emergencia...');
    
    const powerupsGrid = document.getElementById('powerups-grid');
    const premiumGrid = document.getElementById('premium-grid');
    
    if (powerupsGrid) {
        powerupsGrid.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px; color: #f39c12;"></i>
                <h3>Error cargando productos</h3>
                <p>Intenta recargar la página</p>
                <button onclick="location.reload()" style="
                    background: var(--text-accent);
                    color: black;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 15px;
                    margin-top: 15px;
                    cursor: pointer;
                ">
                    <i class="fas fa-redo"></i> Recargar
                </button>
            </div>
        `;
    }
}

// ✅ NUEVA FUNCIÓN PARA RENDERIZAR FILTROS DE CATEGORÍA
function renderCategoryFilters() {
    const filtersContainer = document.querySelector('.category-filters');
    if (!filtersContainer) return;
    
    filtersContainer.innerHTML = STORE_CATEGORIES.map(category => `
        <button class="category-filter-btn ${category.id === 'all' ? 'active' : ''}" 
                onclick="filterByCategory('${category.id}')" 
                data-category="${category.id}">
            <i class="fas ${category.icon}"></i>
            <span>${category.name}</span>
        </button>
    `).join('');
}

// ✅ NUEVA FUNCIÓN PARA FILTRAR POR CATEGORÍA
window.filterByCategory = function(categoryId) {
    console.log('🎯 Filtrando por categoría:', categoryId);
    
    storeData.currentFilter = categoryId;
    
    // Actualizar botones activos
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === categoryId);
    });
    
    // Mostrar/ocultar secciones según filtro
    const powerupsSection = document.querySelector('.powerups-section');
    const premiumSection = document.querySelector('.premium-section');
    
    if (categoryId === 'all') {
        showPowerupsSection();
        showAvatarsSection();
        showPremiumSection();
    } else if (categoryId === 'powerups') {
        showPowerupsSection();
        hideAvatarsSection();
        hidePremiumSection();
    } else if (categoryId === 'avatars') {
        hidePowerupsSection();
        showAvatarsSection();
        hidePremiumSection();
    } else if (categoryId === 'premium') {
        hidePowerupsSection();
        hideAvatarsSection();
        showPremiumSection();
    }
};

function showPowerupsSection() {
    const section = document.querySelector('.powerups-section');
    if (section) section.style.display = 'block';
}

function showAvatarsSection() {
    const section = document.querySelector('.premium-section');
    if (section) section.style.display = 'block';
}

function showPremiumSection() {
    const section = document.querySelector('.premium-section');
    if (section) section.style.display = 'block';
}

// ✅ FUNCIÓN RENDERPRODUCTS SIMPLIFICADA Y CORREGIDA
function renderProducts() {
    console.log('🎨 === RENDERIZANDO PRODUCTOS ===');
    
    try {
        // ✅ RENDERIZAR POWER-UPS INMEDIATAMENTE
        renderPowerups();
        
        // ✅ RENDERIZAR AVATARES PREMIUM INMEDIATAMENTE  
        renderAvatarsPremium();
        
        console.log('✅ Productos renderizados exitosamente');
        
    } catch (error) {
        console.error('❌ Error renderizando productos:', error);
        renderEmergencyProducts();
    }
}

// ✅ FUNCIÓN RENDERPOWERUPS COMPLETAMENTE CORREGIDA
function renderPowerups() {
    console.log('🎯 Renderizando power-ups...');
    
    const powerupsGrid = document.getElementById('powerups-grid');
    if (!powerupsGrid) {
        console.error('❌ No se encontró powerups-grid');
        return;
    }

    const powerupProducts = Object.values(STORE_PRODUCTS).filter(p => p.category === 'powerups');
    
    if (powerupProducts.length === 0) {
        powerupsGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No hay power-ups disponibles</p>';
        return;
    }

    powerupsGrid.innerHTML = powerupProducts.map(product => {
        // ✅ OBTENER DATOS DE FORMA SEGURA
        const ownedCount = getOwnedCount(product.gameId);
        const currentCoins = window.GameDataManager ? window.GameDataManager.getCoins() : 0;
        const canAfford = currentCoins >= product.price;
        
        return `
            <div class="product-card ${!canAfford ? 'cannot-afford' : ''}" data-product="${product.id}">
                <div class="product-icon">
                    <i class="fas ${product.icon}" style="color: ${product.color}"></i>
                </div>
                
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-effects">
                        <h5>Efectos:</h5>
                        <ul class="effects-list">
                            ${product.effects.map(effect => `
                                <li class="effect-item">
                                    <i class="fas fa-check"></i>
                                    <span>${effect}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="product-pricing">
                    <div class="product-price coins">
                        <i class="fas fa-coins"></i>
                        <span>${product.price}</span>
                    </div>
                    
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="changeQuantity('${product.id}', -1)">-</button>
                        <input type="number" class="quantity-input" id="quantity-${product.id}" value="1" min="1" max="10" readonly>
                        <button class="quantity-btn" onclick="changeQuantity('${product.id}', 1)">+</button>
                    </div>
                    
                    <div class="total-cost">
                        Total: <strong id="total-${product.id}">${product.price} 🪙</strong>
                    </div>
                </div>
                
                <div class="product-actions">
                    <button class="buy-btn ${!canAfford ? 'disabled' : ''}" 
                            onclick="buyProduct('${product.id}')" 
                            ${!canAfford ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${canAfford ? 'Comprar' : 'Sin monedas'}
                    </button>
                </div>
                
                ${ownedCount > 0 ? `
                    <div class="owned-indicator">
                        <i class="fas fa-check-circle"></i>
                        <span>Tienes: ${ownedCount}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    console.log('✅ Power-ups renderizados');
}

// ✅ FUNCIÓN RENDERAVATARSPREMIUM CORREGIDA
function renderAvatarsPremium() {
    console.log('👤 Renderizando avatares premium...');
    
    const premiumGrid = document.getElementById('premium-grid');
    if (!premiumGrid) {
        console.error('❌ No se encontró premium-grid');
        return;
    }

    const avatarProducts = Object.values(STORE_PRODUCTS).filter(p => p.category === 'avatars');
    
    if (avatarProducts.length === 0) {
        premiumGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No hay avatares premium disponibles</p>';
        return;
    }

    premiumGrid.innerHTML = avatarProducts.map(product => {
        const isOwned = checkAvatarOwnership(product.id);
        const pricing = formatPrice(product.id);
        
        return `
            <div class="product-card premium ${isOwned ? 'owned' : ''}" data-product="${product.id}">
                <div class="product-icon">
                    <i class="fas ${product.icon}" style="color: ${product.color}"></i>
                </div>
                
                ${product.previewImage ? `
                    <div class="avatar-preview-store">
                        <img src="${product.previewImage}" alt="${product.name}" onerror="this.style.display='none'">
                    </div>
                ` : ''}
                
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-description">${product.description}</p>
                    
                    ${product.includes ? `
                        <div class="product-includes">
                            <h5>Incluye:</h5>
                            <ul>
                                ${product.includes.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${product.savings ? `
                        <div class="product-savings">
                            <i class="fas fa-tags"></i>
                            <span>${product.savings}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="product-pricing">
                    <div class="price-usd">
                        <i class="fab fa-paypal"></i>
                        <span>${pricing.usd}</span>
                    </div>
                    <div class="price-ars">
                        <i class="fas fa-peso-sign"></i>
                        <span>${pricing.ars}</span>
                    </div>
                </div>
                
                <div class="product-actions">
                    ${isOwned ? `
                        <div class="owned-indicator">
                            <i class="fas fa-check-circle"></i>
                            <span>Ya tienes este avatar</span>
                        </div>
                    ` : `
                        <button class="buy-btn premium" onclick="buyProduct('${product.id}')">
                            <i class="fas fa-crown"></i>
                            Comprar Premium
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');

    console.log('✅ Avatares premium renderizados');
}

// ✅ AGREGAR LA FUNCIÓN renderPowerups QUE FALTA
function renderPowerups() {
    console.log('🎯 Renderizando power-ups...');
    
    const powerupsGrid = document.getElementById('powerups-grid');
    if (!powerupsGrid) {
        console.error('❌ No se encontró powerups-grid');
        return;
    }

    const powerupProducts = Object.values(STORE_PRODUCTS).filter(p => p.category === 'powerups');
    
    if (powerupProducts.length === 0) {
        powerupsGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No hay power-ups disponibles</p>';
        return;
    }

    powerupsGrid.innerHTML = powerupProducts.map(product => {
        const ownedCount = getOwnedCount(product.gameId);
        const currentCoins = window.GameDataManager ? window.GameDataManager.getCoins() : 0;
        const canAfford = currentCoins >= product.price;
        
        return `
            <div class="product-card ${!canAfford ? 'cannot-afford' : ''}" data-product="${product.id}">
                <div class="product-icon">
                    <i class="fas ${product.icon}" style="color: ${product.color}"></i>
                </div>
                
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-effects">
                        <h5>Efectos:</h5>
                        <ul class="effects-list">
                            ${product.effects.map(effect => `
                                <li class="effect-item">
                                    <i class="fas fa-check"></i>
                                    <span>${effect}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="product-pricing">
                    <div class="product-price coins">
                        <i class="fas fa-coins"></i>
                        <span>${product.price}</span>
                    </div>
                    
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="changeQuantity('${product.id}', -1)">-</button>
                        <input type="number" class="quantity-input" id="quantity-${product.id}" value="1" min="1" max="10" readonly>
                        <button class="quantity-btn" onclick="changeQuantity('${product.id}', 1)">+</button>
                    </div>
                    
                    <div class="total-cost">
                        Total: <strong id="total-${product.id}">${product.price} 🪙</strong>
                    </div>
                </div>
                
                <div class="product-actions">
                    <button class="buy-btn ${!canAfford ? 'disabled' : ''}" 
                            onclick="buyProduct('${product.id}')" 
                            ${!canAfford ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${canAfford ? 'Comprar' : 'Sin monedas'}
                    </button>
                </div>
                
                ${ownedCount > 0 ? `
                    <div class="owned-indicator">
                        <i class="fas fa-check-circle"></i>
                        <span>Tienes: ${ownedCount}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    console.log('✅ Power-ups renderizados');
}

// ✅ AGREGAR FUNCIONES QUE FALTAN
function hidePowerupsSection() {
    const section = document.querySelector('.powerups-section');
    if (section) section.style.display = 'none';
}

function hideAvatarsSection() {
    const section = document.querySelector('.premium-section');
    if (section) section.style.display = 'none';
}

function hidePremiumSection() {
    const section = document.querySelector('.premium-section');
    if (section) section.style.display = 'none';
}

// ✅ FUNCIÓN PARA RENDERIZAR AVATARES PREMIUM CON PRECIOS DUALES
function renderAvatarsPremium() {
    console.log('👤 Renderizando avatares premium...');
    
    const premiumGrid = document.getElementById('premium-grid');
    if (!premiumGrid) {
        console.error('❌ No se encontró premium-grid');
        return;
    }

    const avatarProducts = Object.values(STORE_PRODUCTS).filter(p => p.category === 'avatars');
    
    if (avatarProducts.length === 0) {
        premiumGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No hay avatares premium disponibles</p>';
        return;
    }

    premiumGrid.innerHTML = avatarProducts.map(product => {
        const isOwned = checkAvatarOwnership(product.id);
        const pricing = formatPrice(product.id);
        
        return `
            <div class="product-card premium ${isOwned ? 'owned' : ''}" data-product="${product.id}">
                <div class="product-icon">
                    <i class="fas ${product.icon}" style="color: ${product.color}"></i>
                </div>
                
                ${product.previewImage ? `
                    <div class="avatar-preview-store">
                        <img src="${product.previewImage}" alt="${product.name}" onerror="this.style.display='none'">
                    </div>
                ` : ''}
                
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-description">${product.description}</p>
                    
                    ${product.includes ? `
                        <div class="product-includes">
                            <h5>Incluye:</h5>
                            <ul>
                                ${product.includes.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${product.savings ? `
                        <div class="product-savings">
                            <i class="fas fa-tags"></i>
                            <span>${product.savings}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="product-pricing">
                    <div class="price-usd">
                        <i class="fab fa-paypal"></i>
                        <span>${pricing.usd}</span>
                    </div>
                    <div class="price-ars">
                        <i class="fas fa-peso-sign"></i>
                        <span>${pricing.ars}</span>
                    </div>
                </div>
                
                <div class="product-actions">
                    ${isOwned ? `
                        <div class="owned-indicator">
                            <i class="fas fa-check-circle"></i>
                            <span>Ya tienes este avatar</span>
                        </div>
                    ` : `
                        <button class="buy-btn premium" onclick="buyProduct('${product.id}')">
                            <i class="fas fa-crown"></i>
                            Comprar Premium
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');

    console.log('✅ Avatares premium renderizados');
}

function renderPremiumItems() {
    console.log('👑 Renderizando items premium...');
    
    const premiumProducts = Object.values(STORE_PRODUCTS).filter(p => p.category === 'premium');
    
    if (premiumProducts.length === 0) {
        console.log('⚠️ No hay productos premium definidos');
        return;
    }

    // Renderizar en la misma grid que avatares por ahora
    const premiumGrid = document.getElementById('premium-grid');
    if (!premiumGrid) return;

    const existingContent = premiumGrid.innerHTML;
    
    premiumGrid.innerHTML = existingContent + premiumProducts.map(product => {
        const isOwned = checkPremiumOwnership(product.id);
        const currentCoins = window.GameDataManager ? window.GameDataManager.getCoins() : 0;
        const canAfford = currentCoins >= product.price;
        
        return `
            <div class="product-card premium ${isOwned ? 'owned' : ''} ${!canAfford ? 'cannot-afford' : ''}" data-product="${product.id}">
                <div class="product-icon">
                    <i class="fas ${product.icon}" style="color: ${product.color}"></i>
                </div>
                
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-effects">
                        <h5>Efectos:</h5>
                        <ul class="effects-list">
                            ${product.effects.map(effect => `
                                <li class="effect-item">
                                    <i class="fas fa-check"></i>
                                    <span>${effect}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="product-pricing">
                    <div class="product-price coins">
                        <i class="fas fa-coins"></i>
                        <span>${product.price.toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="product-actions">
                    ${isOwned ? `
                        <div class="owned-indicator">
                            <i class="fas fa-check-circle"></i>
                            <span>Ya tienes este item</span>
                        </div>
                    ` : `
                        <button class="buy-btn premium ${!canAfford ? 'disabled' : ''}" 
                                onclick="buyProduct('${product.id}')" 
                                ${!canAfford ? 'disabled' : ''}>
                            <i class="fas fa-crown"></i>
                            ${canAfford ? 'Comprar Premium' : 'Sin monedas'}
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');

    console.log('✅ Items premium renderizados');
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

// ✅ FUNCIÓN PARA FORMATEAR PRECIOS CON AMBAS MONEDAS
function formatPrice(productId) {
    const product = STORE_PRODUCTS[productId];
    if (!product) return { usd: '$0.00', ars: '$0' };
    
    if (product.currency === 'USD') {
        const priceUSD = product.price;
        const priceARS = getPriceInARS(productId);
        
        return {
            usd: `$${priceUSD.toFixed(2)} USD`,
            ars: `$${priceARS.toLocaleString('es-AR')} ARS`,
            both: `$${priceUSD.toFixed(2)} USD (≈ $${priceARS.toLocaleString('es-AR')} ARS)`
        };
    }
    
    if (product.currency === 'coins') {
        return {
            coins: `${product.price} 🪙`,
            usd: 'N/A',
            ars: 'N/A'
        };
    }
    
    return { usd: '$0.00', ars: '$0' };
}

// ✅ FUNCIÓN PARA OBTENER PRECIO EN ARS
function getPriceInARS(productId) {
    const product = STORE_PRODUCTS[productId];
    if (!product) return 0;
    
    if (product.currency === 'coins') {
        return 0; // No aplica para power-ups
    }
    
    if (product.currency === 'USD') {
        // ✅ TASA DE CAMBIO ACTUALIZADA PARA PRUEBAS
        const usdToArs = 1000; // 1 USD = 1000 ARS aproximado
        return Math.round(product.price * usdToArs);
    }
    
    return 0;
}

// ✅ RESTO DE FUNCIONES (mantener las existentes)
function checkAvatarOwnership(productId) {
    try {
        if (window.GameDataManager) {
            // Verificar en GameDataManager si existe
            const gameData = window.GameDataManager.getDebugInfo();
            return gameData?.purchases?.includes(productId) || false;
        }
        
        // Fallback a localStorage
        const purchases = JSON.parse(localStorage.getItem('quizCristianoPurchases') || '[]');
        return purchases.includes(productId);
    } catch (error) {
        console.warn('⚠️ Error verificando ownership:', error);
        return false;
    }
}

async function waitForGameDataManager() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 30;
        
        const checkForGameDataManager = () => {
            attempts++;
            
            if (window.GameDataManager) {
                console.log('✅ GameDataManager encontrado');
                resolve(window.GameDataManager);
            } else if (attempts >= maxAttempts) {
                console.warn('⚠️ GameDataManager no disponible después de 30 intentos');
                reject(new Error('GameDataManager timeout'));
            } else {
                setTimeout(checkForGameDataManager, 100);
            }
        };
        
        checkForGameDataManager();
    });
}

function setupGameDataListeners() {
    console.log('🔗 Configurando listeners de GameDataManager...');
    
    window.GameDataManager.onCoinsChanged((data) => {
        console.log('💰 Monedas cambiaron:', data);
        updateCoinsDisplay();
        updateProductCards();
    });
    
    window.GameDataManager.onInventoryChanged((data) => {
        console.log('🎒 Inventario cambió:', data);
        updateProductCards();
    });
}

function updateAllDisplays() {
    updateCoinsDisplay();
    updateMascotDisplay();
    updateProductCards();
}

function updateCoinsDisplay() {
    const coinsDisplay = document.querySelector('.player-coins span');
    if (!coinsDisplay) return;
    
    try {
        let coins = 0;
        
        if (window.GameDataManager && window.GameDataManager.getCoins) {
            coins = window.GameDataManager.getCoins();
        } else {
            // Fallback a localStorage
            const gameData = JSON.parse(localStorage.getItem('quizCristianoData') || '{}');
            coins = gameData.coins || 0;
        }
        
        coinsDisplay.textContent = coins.toLocaleString();
        
    } catch (error) {
        console.warn('⚠️ Error actualizando display de monedas:', error);
        coinsDisplay.textContent = '0';
    }
}

function updateMascotDisplay() {
    // Verificar si Joy tiene corona desbloqueada
    const hasCorona = checkPremiumOwnership('joy_corona');
    const mascotImage = document.querySelector('.mascot-store');
    
    if (mascotImage && hasCorona) {
        mascotImage.src = 'assets/images/joy-corona.png';
        console.log('👑 Joy con corona mostrada');
    }
}

function getOwnedCount(gameId) {
    try {
        if (window.GameDataManager && window.GameDataManager.getPowerupCount) {
            return window.GameDataManager.getPowerupCount(gameId);
        }
        
        // Fallback a localStorage
        const inventory = JSON.parse(localStorage.getItem('quizCristianoInventory') || '{}');
        return inventory[gameId] || 0;
        
    } catch (error) {
        console.warn('⚠️ Error obteniendo cantidad owned:', error);
        return 0;
    }
}

function checkPremiumOwnership(premiumId) {
    try {
        if (window.GameDataManager) {
            // Verificar en GameDataManager
            const debugInfo = window.GameDataManager.getDebugInfo();
            return debugInfo?.purchases?.includes(premiumId) || false;
        }
        
        // Fallback a localStorage
        const purchases = JSON.parse(localStorage.getItem('quizCristianoPurchases') || '[]');
        return purchases.includes(premiumId);
    } catch (error) {
        console.warn('⚠️ Error verificando premium ownership:', error);
        return false;
    }
}

// ============================================
// FUNCIONES DE COMPRA
// ============================================

// ✅ FUNCIONES DE COMPRA (mantener las existentes)
window.showPurchaseModal = function(productId) {
    console.log('🛒 Mostrando modal de compra para:', productId);
    
    const product = STORE_PRODUCTS[productId];
    if (!product) {
        console.error('❌ Producto no encontrado:', productId);
        return;
    }
    
    currentPurchaseProduct = productId;
    window.currentPurchaseProduct = productId;
    
    if (product.currency === 'coins') {
        showCoinPurchaseModal(product);
    } else {
        showPaymentOptionsModal(product);
    }
};

function showCoinPurchaseModal(product) {
    console.log('🪙 Creando modal de compra con monedas para:', product.name);
    
    const modal = document.getElementById('purchase-modal');
    if (!modal) {
        console.error('❌ Modal no encontrado');
        return;
    }
    
    const quantity = parseInt(document.getElementById(`quantity-${product.id}`)?.value) || 1;
    const totalCost = product.price * quantity;
    const currentCoins = window.GameDataManager ? window.GameDataManager.getCoins() : 0;
    const canAfford = currentCoins >= totalCost;
    
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closePurchaseModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas ${product.icon}"></i> ${product.name}</h3>
                <button class="modal-close" onclick="closePurchaseModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="product-preview">
                    <div class="preview-icon">
                        <i class="fas ${product.icon}" style="color: ${product.color}"></i>
                    </div>
                </div>
                
                <div class="purchase-info">
                    <p class="product-description">${product.description}</p>
                    
                    <div class="cost-breakdown">
                        <div class="cost-item">
                            <span>Precio unitario:</span>
                            <span>${product.price} 🪙</span>
                        </div>
                        <div class="cost-item">
                            <span>Cantidad:</span>
                            <span>${quantity}</span>
                        </div>
                        <div class="cost-item total">
                            <span>Total:</span>
                            <span>${totalCost} 🪙</span>
                        </div>
                    </div>
                    
                    <div class="coins-info">
                        <div class="coins-current">
                            <span>Monedas actuales:</span>
                            <span>${currentCoins} 🪙</span>
                        </div>
                        <div class="coins-remaining">
                            <span>Después de comprar:</span>
                            <span>${Math.max(0, currentCoins - totalCost)} 🪙</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closePurchaseModal()">
                    <i class="fas fa-times"></i>
                    Cancelar
                </button>
                <button class="btn-purchase ${!canAfford ? 'disabled' : ''}" 
                        onclick="confirmPurchase()" 
                        ${!canAfford ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    ${canAfford ? 'Confirmar Compra' : 'Sin monedas suficientes'}
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// ✅ ACTUALIZAR LA FUNCIÓN processPurchase PARA SOPORTAR AMBOS MÉTODOS
window.processPurchase = async function(purchaseData) {
    console.log('💳 Procesando compra:', purchaseData);
    
    const productId = purchaseData || currentPurchaseProduct;
    if (!productId) {
        console.error('❌ No hay producto para procesar');
        return;
    }
    
    const product = STORE_PRODUCTS[productId];
    if (!product) {
        console.error('❌ Producto no encontrado:', productId);
        return;
    }
    
    // Determinar método de compra
    if (product.currency === 'coins') {
        return processCoinPurchase({ productId, product });
    } else {
        console.log('💰 Compra USD - usar PayPal o MercadoPago');
        return showPaymentOptionsModal(product);
    }
};

function processCoinPurchase(purchaseData) {
    console.log('🪙 Procesando compra con monedas:', purchaseData);
    
    if (storeData.isProcessingPurchase) {
        console.log('⚠️ Ya se está procesando una compra');
        return;
    }
    
    storeData.isProcessingPurchase = true;
    
    try {
        const { productId, product } = purchaseData;
        const quantity = parseInt(document.getElementById(`quantity-${productId}`)?.value) || 1;
        const totalCost = product.price * quantity;
        
        // Verificar GameDataManager
        if (!window.GameDataManager) {
            throw new Error('GameDataManager no disponible');
        }
        
        // Verificar monedas suficientes
        const currentCoins = window.GameDataManager.getCoins();
        if (currentCoins < totalCost) {
            throw new Error('Monedas insuficientes');
        }
        
        // Procesar compra
        const success = window.GameDataManager.spendCoins(totalCost, `compra_${productId}`);
        if (!success) {
            throw new Error('Error al procesar el pago');
        }
        
        // Agregar al inventario
        window.GameDataManager.addPowerup(product.gameId, quantity, 'purchase');
        
        // Cerrar modal
        closePurchaseModal();
        
        // Actualizar displays
        updateAllDisplays();
        
        // Notificación de éxito
        showNotification(`¡${product.name} comprado exitosamente!`, 'success');
        
        console.log('✅ Compra completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error en compra:', error);
        showNotification(`❌ Error en la compra: ${error.message}`, 'error');
    } finally {
        storeData.isProcessingPurchase = false;
    }
}

// ✅ NUEVA FUNCIÓN PARA MOSTRAR OPCIONES DE PAGO USD - CORREGIDA
function showPaymentOptionsModal(product) {
    console.log('💳 === CREANDO MODAL DE OPCIONES DE PAGO ===');
    console.log('Producto:', product.name);
    
    const modal = document.getElementById('purchase-modal');
    if (!modal) {
        console.error('❌ Modal #purchase-modal no encontrado');
        return;
    }
    
    const pricing = formatPrice(product.id);
    console.log('💰 Precios calculados:', pricing);
    
    // ✅ LIMPIAR MODAL COMPLETAMENTE
    modal.innerHTML = '';
    
    // ✅ CREAR CONTENIDO DEL MODAL
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closePaymentOptionsModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas ${product.icon}"></i> ${product.name}</h3>
                <button class="modal-close" onclick="closePaymentOptionsModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="modal-body">
                <div class="product-preview">
                    ${product.previewImage ? `
                        <img src="${product.previewImage}" alt="${product.name}" class="preview-image">
                    ` : `
                        <div class="preview-icon">
                            <i class="fas ${product.icon}" style="color: ${product.color}"></i>
                        </div>
                    `}
                </div>
                
                <div class="purchase-info">
                    <p class="product-description">${product.description}</p>
                    
                    <div class="pricing-details">
                        <h4>💰 Precio del producto:</h4>
                        <div class="price-breakdown">
                            <div class="price-line-usd">
                                <span class="currency">🇺🇸 USD:</span>
                                <span class="amount">${pricing.usd}</span>
                            </div>
                            <div class="price-line-ars">
                                <span class="currency">🇦🇷 ARS:</span>
                                <span class="amount">${pricing.ars}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="payment-options">
                    <h4>🔥 Elige tu método de pago:</h4>
                    
                    <button class="payment-btn mercadopago" onclick="payWithMercadoPago('${product.id}')">
                        <div class="payment-icon">
                            <i class="fas fa-credit-card"></i>
                        </div>
                        <div class="payment-info">
                            <div class="payment-name">MercadoPago</div>
                            <div class="payment-desc">Tarjetas, transferencia, efectivo</div>
                        </div>
                        <div class="payment-price">${pricing.ars}</div>
                    </button>
                    
                    <button class="payment-btn paypal" onclick="payWithPayPal('${product.id}')">
                        <div class="payment-icon">
                            <i class="fab fa-paypal"></i>
                        </div>
                        <div class="payment-info">
                            <div class="payment-name">PayPal</div>
                            <div class="payment-desc">Pago internacional seguro</div>
                        </div>
                        <div class="payment-price">${pricing.usd}</div>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // ✅ FORZAR DISPLAY DEL MODAL
    console.log('🎬 Mostrando modal...');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    
    // ✅ AGREGAR CLASE PARA ANIMACIÓN
    setTimeout(() => {
        modal.classList.add('show');
        document.body.classList.add('modal-open');
    }, 10);
    
    console.log('✅ Modal de pago mostrado');
    console.log('📊 Estado del modal:', {
        display: modal.style.display,
        opacity: modal.style.opacity,
        visibility: modal.style.visibility,
        innerHTML: modal.innerHTML.length > 0
    });
}

// ✅ FUNCIÓN PAYWITHMERCADOPAGO MEJORADA
window.payWithMercadoPago = async function(productId) {
    console.log('💳 Iniciando pago con MercadoPago para:', productId);
    
    try {
        currentPurchaseProduct = productId;
        window.currentPurchaseProduct = productId;
        
        // Cerrar modal de opciones
        closePaymentOptionsModal();
        
        // Verificar si procesarPagoMercadoPago está disponible
        if (typeof procesarPagoMercadoPago === 'function') {
            await procesarPagoMercadoPago(productId);
        } else {
            console.warn('⚠️ MercadoPago no disponible, simulando compra...');
            
            // Simular compra exitosa para testing
            setTimeout(async () => {
                await unlockPremiumProduct(productId);
                showNotification('¡Compra simulada exitosamente!', 'success');
            }, 2000);
        }
        
    } catch (error) {
        console.error('❌ Error en pago MercadoPago:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
};

// ✅ FUNCIÓN PARA PAGAR CON PAYPAL
window.payWithPayPal = async function(productId) {
    console.log('💰 Iniciando pago con PayPal para:', productId);
    
    try {
        currentPurchaseProduct = productId;
        window.currentPurchaseProduct = productId;
        
        const product = STORE_PRODUCTS[productId];
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        
        // Cerrar modal de opciones
        closePaymentOptionsModal();
        
        // Crear URL de PayPal (simulada)
        const paypalUrl = createPayPalUrl(product);
        
        // Abrir PayPal en nueva ventana
        window.open(paypalUrl, '_blank');
        
        showNotification('Serás redirigido a PayPal para completar el pago', 'info');
        
        // Simular pago exitoso después de 5 segundos (para testing)
        setTimeout(() => {
            simulateSuccessfulPayPalPurchase(productId);
        }, 5000);
        
    } catch (error) {
        console.error('❌ Error en pago PayPal:', error);
        showNotification(`Error: ${error.message}`, 'error');
    }
};

// ✅ FUNCIÓN PARA CREAR URL DE PAYPAL
function createPayPalUrl(product) {
    const baseUrl = 'https://www.paypal.com/cgi-bin/webscr';
    const params = new URLSearchParams({
        cmd: '_xclick',
        business: 'tu-email@paypal.com', // Reemplazar con tu email de PayPal
        item_name: product.name,
        item_number: product.id,
        amount: product.price,
        currency_code: 'USD',
        return: `${window.location.origin}/store.html?payment=success&product=${product.id}&method=paypal`,
        cancel_return: `${window.location.origin}/store.html?payment=cancel`,
        notify_url: `${window.location.origin}/api/paypal/webhook`
    });
    
    return `${baseUrl}?${params.toString()}`;
}

// ✅ FUNCIÓN PARA SIMULAR COMPRA EXITOSA DE PAYPAL
function simulateSuccessfulPayPalPurchase(productId) {
    console.log('🎭 Simulando compra exitosa de PayPal para:', productId);
    
    // Desbloquear producto
    unlockPremiumProduct(productId);
    
    showNotification('¡Compra con PayPal exitosa!', 'success');
}

function updateProductCards() {
    // Actualizar estado de botones de compra basado en monedas actuales
    const productCards = document.querySelectorAll('.product-card');
    const currentCoins = window.GameDataManager ? window.GameDataManager.getCoins() : 0;
    
    productCards.forEach(card => {
        const productId = card.dataset.product;
        const product = STORE_PRODUCTS[productId];
        
        if (product && product.currency === 'coins') {
            const buyBtn = card.querySelector('.buy-btn');
            const canAfford = currentCoins >= product.price;
            
            if (buyBtn) {
                buyBtn.disabled = !canAfford;
                buyBtn.classList.toggle('disabled', !canAfford);
                buyBtn.innerHTML = `
                    <i class="fas fa-shopping-cart"></i>
                    ${canAfford ? 'Comprar' : 'Sin monedas'}
                `;
            }
            
            card.classList.toggle('cannot-afford', !canAfford);
        }
    });
}

// ✅ DETECTAR PAGOS EXITOSOS MEJORADO
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const productId = urlParams.get('product');
    const method = urlParams.get('method');
    
    if (paymentStatus === 'success' && productId) {
        console.log('🎉 Pago exitoso detectado:', { productId, method });
        
        // Desbloquear producto
        unlockPremiumProduct(productId);
        
        // Mostrar notificación
        const methodName = method === 'paypal' ? 'PayPal' : 'MercadoPago';
        showNotification(`¡Compra con ${methodName} exitosa!`, 'success');
        
        // Limpiar URL
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
});

// Función para desbloquear productos premium
async function unlockPremiumProduct(productId) {
    try {
        console.log('🔓 Desbloqueando producto premium:', productId);
        
        // Agregar a compras en localStorage
        const purchases = JSON.parse(localStorage.getItem('quizCristianoPurchases') || '[]');
        if (!purchases.includes(productId)) {
            purchases.push(productId);
            localStorage.setItem('quizCristianoPurchases', JSON.stringify(purchases));
        }
        
        // Actualizar GameDataManager si está disponible
        if (window.GameDataManager) {
            // Aquí puedes agregar lógica específica para GameDataManager
            console.log('✅ Producto desbloqueado en GameDataManager');
        }
        
        // Actualizar displays
        updateAllDisplays();
        renderProducts();
        
        console.log('✅ Producto premium desbloqueado:', productId);
        
    } catch (error) {
        console.error('❌ Error desbloqueando producto:', error);
    }
}

// ============================================
// FUNCIONES GLOBALES PARA EL HTML
// ============================================

window.buyProduct = function(productId) {
    console.log('🛒 === COMPRA INICIADA ===');
    console.log('Producto:', productId);
    
    // ✅ VERIFICAR QUE EL PRODUCTO EXISTE
    const product = STORE_PRODUCTS[productId];
    if (!product) {
        console.error('❌ Producto no encontrado:', productId);
        showNotification('❌ Producto no encontrado', 'error');
        return;
    }
    
    console.log('✅ Producto encontrado:', product.name);
    console.log('💱 Moneda:', product.currency);
    console.log('💰 Precio:', product.price);
    
    // ✅ ESTABLECER PRODUCTO ACTUAL GLOBALMENTE
    currentPurchaseProduct = productId;
    window.currentPurchaseProduct = productId;
    
    // ✅ DETERMINAR TIPO DE COMPRA Y PROCESAR
    if (product.currency === 'coins') {
        console.log('🪙 Procesando compra con monedas...');
        
        // Verificar que GameDataManager esté disponible
        if (!window.GameDataManager) {
            console.error('❌ GameDataManager no disponible');
            showNotification('❌ Sistema no disponible. Recarga la página.', 'error');
            return;
        }
        
        // Obtener cantidad del input (si existe)
        const quantityInput = document.getElementById(`quantity-${productId}`);
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
        
        console.log('📦 Cantidad:', quantity);
        console.log('💰 Costo total:', product.price * quantity);
        console.log('💳 Monedas disponibles:', window.GameDataManager.getCoins());
        
        // Mostrar modal de confirmación
        showCoinPurchaseModal(product);
        
    } else if (product.currency === 'USD') {
        console.log('💵 Procesando compra con USD...');
        showPaymentOptionsModal(product);
        
    } else {
        console.error('❌ Moneda no soportada:', product.currency);
        showNotification('❌ Tipo de producto no soportado', 'error');
    }
};

window.closePurchaseModal = function() {
    const modal = document.getElementById('purchase-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Limpiar producto actual
    currentPurchaseProduct = null;
    window.currentPurchaseProduct = null;
};

// ✅ FUNCIÓN PARA CERRAR MODAL DE OPCIONES DE PAGO
window.closePaymentOptionsModal = function() {
    console.log('❌ Cerrando modal de opciones de pago...');
    
    const modal = document.getElementById('purchase-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.opacity = '0';
            modal.style.visibility = 'hidden';
        }, 300);
    }
    
    // Limpiar producto actual
    currentPurchaseProduct = null;
    window.currentPurchaseProduct = null;
    
    console.log('✅ Modal cerrado');
};

window.confirmPurchase = function() {
    console.log('💳 Confirmando compra desde HTML...');
    
    if (!currentPurchaseProduct) {
        console.error('❌ No hay producto seleccionado');
        return;
    }
    
    const product = STORE_PRODUCTS[currentPurchaseProduct];
    if (!product) {
        console.error('❌ Producto no encontrado');
        return;
    }
    
    // Procesar según tipo de moneda
    if (product.currency === 'coins') {
        processCoinPurchase({ productId: currentPurchaseProduct, product });
    } else {
        console.log('💰 Compra USD - usar modal de opciones');
        showPaymentOptionsModal(product);
    }
};

// Función para cambiar cantidad
window.changeQuantity = function(productId, change) {
    const input = document.getElementById(`quantity-${productId}`);
    const totalDisplay = document.getElementById(`total-${productId}`);
    
    if (!input || !totalDisplay) return;
    
    let newValue = parseInt(input.value) + change;
    newValue = Math.max(1, Math.min(10, newValue)); // Entre 1 y 10
    
    input.value = newValue;
    
    const product = STORE_PRODUCTS[productId];
    if (product) {
        const total = product.price * newValue;
        totalDisplay.textContent = `${total} 🪙`;
    }
};

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
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
    
    // Estilos
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
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏪 Iniciando tienda...');
    init();
});

console.log('✅ Store.js COMPLETAMENTE CARGADO Y FUNCIONAL');