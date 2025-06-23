/* filepath: js/pages/perfil.js */
/**
 * ================================================
 * PERFIL SISTEMA COMPLETO - USUARIOS REALES
 * Quiz Cristiano - Gestión de perfiles con validación
 * ================================================
 */

// ============================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================

let profileData = {
    isInitialized: false,
    username: '',
    displayName: '',
    favoriteVerse: '',
    currentAvatar: 'assets/images/fotos-perfil/niña.jpg', // ✅ NUEVA IMAGEN POR DEFECTO
    isValidatingUsername: false,
    hasUnsavedChanges: false,
    lastUpdated: null
};

// ✅ CONFIGURACIÓN CORREGIDA DE AVATARES CON LAS IMÁGENES QUE TIENES
const AVAILABLE_AVATARS = [
    // ✅ AVATARES GRATUITOS
    { 
        id: 'nina', 
        src: 'assets/images/fotos-perfil/niña.jpg', 
        name: 'Niña', 
        unlocked: true,
        category: 'free',
        type: 'profile_photo'
    },
    { 
        id: 'nino', 
        src: 'assets/images/fotos-perfil/niño.jpg', 
        name: 'Niño', 
        unlocked: true,
        category: 'free',
        type: 'profile_photo'
    },
    { 
        id: 'oveja', 
        src: 'assets/images/fotos-perfil/oveja.jpg', 
        name: 'Oveja', 
        unlocked: true,
        category: 'free',
        type: 'profile_photo'
    },
    { 
        id: 'paloma', 
        src: 'assets/images/fotos-perfil/paloma.jpg', 
        name: 'Paloma', 
        unlocked: true,
        category: 'free',
        type: 'profile_photo'
    },
    
    // ✅ AVATARES PREMIUM - CON LAS IMÁGENES QUE TIENES
    { 
        id: 'joy-guerrero', 
        src: 'assets/images/fotos-perfil-premium/joy-guerrero.jpg', 
        name: 'Joy Guerrero', 
        unlocked: false,
        category: 'premium',
        type: 'profile_photo',
        price: 0.80,
        requiredPurchase: 'avatar_joy_guerrero'
    },
    { 
        id: 'premium-1', 
        src: 'assets/images/fotos-perfil-premium/premium-1.jpg', 
        name: 'Avatar Premium 1', 
        unlocked: false,
        category: 'premium',
        type: 'profile_photo',
        price: 5.00,
        requiredPurchase: 'premium_avatars_pack'
    },
    { 
        id: 'premium-2', 
        src: 'assets/images/fotos-perfil-premium/premium-2.jpg', 
        name: 'Avatar Premium 2', 
        unlocked: false,
        category: 'premium',
        type: 'profile_photo',
        price: 5.00,
        requiredPurchase: 'premium_avatars_pack'
    },
    { 
        id: 'premium-3', 
        src: 'assets/images/fotos-perfil-premium/premium-3.jpg', 
        name: 'Avatar Premium 3', 
        unlocked: false,
        category: 'premium',
        type: 'profile_photo',
        price: 5.00,
        requiredPurchase: 'premium_avatars_pack'
    },
    
    // ✅ AVATARES DE JOY GRATUITOS
    { 
        id: 'joy-original', 
        src: 'assets/images/mascota.png', 
        name: 'Joy Original', 
        unlocked: true,
        category: 'free',
        type: 'mascot'
    },
    { 
        id: 'joy-trofeo', 
        src: 'assets/images/joy-trofeo.png', 
        name: 'Joy Trofeo', 
        unlocked: true,
        category: 'free',
        type: 'mascot'
    },
    { 
        id: 'joy-festejo', 
        src: 'assets/images/joy-festejo.png', 
        name: 'Joy Festejo', 
        unlocked: true,
        category: 'free',
        type: 'mascot'
    },
    { 
        id: 'joy-consolando', 
        src: 'assets/images/joy-consolando.png', 
        name: 'Joy Consolando', 
        unlocked: true,
        category: 'free',
        type: 'mascot'
    }
];

// ✅ CONFIGURACIÓN DE AVATARES PREMIUM PARA LA TIENDA
const PREMIUM_AVATARS_CONFIG = {
    individual: {
        price: 0.80, // Precio individual en USD
        currency: 'USD'
    },
    bundle: {
        id: 'premium_avatars_pack',
        name: 'Pack de Avatares Premium',
        description: 'Todos los avatares premium actuales y futuros',
        price: 5.00, // Precio del pack en USD
        currency: 'USD',
        savings: 'Ahorra más del 50%'
    }
};

// ✅ NIVELES DE USUARIO (sin cambios)
const USER_LEVELS = [
    { level: 1, name: 'Principiante', minExp: 0, maxExp: 100, color: '#95a5a6', icon: 'fa-seedling' },
    { level: 2, name: 'Estudiante', minExp: 100, maxExp: 300, color: '#3498db', icon: 'fa-book' },
    { level: 3, name: 'Devoto', minExp: 300, maxExp: 600, color: '#9b59b6', icon: 'fa-pray' },
    { level: 4, name: 'Discípulo', minExp: 600, maxExp: 1000, color: '#e67e22', icon: 'fa-cross' },
    { level: 5, name: 'Maestro', minExp: 1000, maxExp: 1500, color: '#27ae60', icon: 'fa-graduation-cap' },
    { level: 6, name: 'Sabio', minExp: 1500, maxExp: 2200, color: '#f39c12', icon: 'fa-star' },
    { level: 7, name: 'Profeta', minExp: 2200, maxExp: 3000, color: '#e74c3c', icon: 'fa-fire' },
    { level: 8, name: 'Apóstol', minExp: 3000, maxExp: 4000, color: '#8e44ad', icon: 'fa-crown' },
    { level: 9, name: 'Patriarca', minExp: 4000, maxExp: 5500, color: '#2c3e50', icon: 'fa-mountain' },
    { level: 10, name: 'Leyenda', minExp: 5500, maxExp: Infinity, color: '#ffd700', icon: 'fa-star-of-life' }
];

// ============================================
// INICIALIZACIÓN
// ============================================

async function init() {
    try {
        console.log('👤 Inicializando sistema de perfiles...');
        
        // Esperar a que GameDataManager esté disponible
        await waitForGameDataManager();
        
        // Configurar listeners
        setupGameDataListeners();
        
        // Cargar datos
        loadProfileData();
        fillFormWithData();
        
        // Configurar formularios
        setupFormListeners();
        setupRealTimeValidation();
        
        // Actualizar displays
        updateAllDisplays();
        
        profileData.isInitialized = true;
        console.log('✅ Sistema de perfiles inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando perfil:', error);
    }
}

async function waitForGameDataManager() {
    return new Promise((resolve) => {
        if (window.GameDataManager) {
            resolve();
        } else {
            console.log('⏳ Esperando GameDataManager...');
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
    console.log('🔗 Configurando listeners para perfil...');
    
    window.GameDataManager.onCoinsChanged((data) => {
        updateCoinsDisplay();
    });
    
    window.GameDataManager.onDataChanged((data) => {
        updateStatsDisplay();
    });
}

// ============================================
// GESTIÓN DE AVATARES PREMIUM - COMPLETAMENTE ACTUALIZADA
// ============================================

window.openAvatarSelector = function() {
    console.log('🖼️ Abriendo selector de avatares...');
    
    const modal = document.getElementById('avatar-modal');
    const avatarsGrid = document.getElementById('avatars-grid');
    
    if (!modal || !avatarsGrid) {
        console.error('❌ Modal o grid de avatares no encontrado');
        return;
    }
    
    // ✅ VERIFICAR AVATARES DESBLOQUEADOS
    const unlockedAvatars = getUnlockedAvatars();
    console.log('🔓 Avatares desbloqueados:', unlockedAvatars);
    
    // ✅ ESTRUCTURA COMPLETA DEL MODAL CON TODAS LAS CATEGORÍAS
    avatarsGrid.innerHTML = `
        <div class="avatars-categories">
            <!-- Avatares Gratuitos -->
            <div class="avatar-category">
                <h4><i class="fas fa-user-friends"></i> Avatares Gratuitos</h4>
                <div class="avatars-grid-section">
                    ${renderAvatarsByCategory('free', unlockedAvatars, 'profile_photo')}
                </div>
            </div>
            
            <!-- Joy Collection -->
            <div class="avatar-category">
                <h4><i class="fas fa-heart"></i> Joy Collection</h4>
                <div class="avatars-grid-section">
                    ${renderAvatarsByCategory('free', unlockedAvatars, 'mascot')}
                </div>
            </div>
            
            <!-- ✅ AVATARES PREMIUM - ESTA SECCIÓN DEBE APARECER -->
            <div class="avatar-category">
                <h4><i class="fas fa-crown"></i> Avatares Premium</h4>
                <div class="avatars-grid-section">
                    ${renderAvatarsByCategory('premium', unlockedAvatars, 'profile_photo')}
                </div>
                ${renderPremiumInfo()}
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    console.log('✅ Modal de avatares abierto con todas las categorías');
};

// 🔧 FUNCIÓN COMPLETAMENTE ACTUALIZADA PARA VERIFICAR AVATARES DESBLOQUEADOS
function getUnlockedAvatars() {
    console.log('🔍 Verificando avatares desbloqueados...');
    
    // ✅ OBTENER COMPRAS PREMIUM DE MERCADO PAGO/PAYPAL
    const premiumPurchases = JSON.parse(localStorage.getItem('premium-purchases') || '[]');
    console.log('💰 Compras premium encontradas:', premiumPurchases);
    
    // ✅ VERIFICAR CADA AVATAR
    const unlockedAvatars = [];
    
    AVAILABLE_AVATARS.forEach(avatar => {
        let isUnlocked = false;
        
        if (avatar.category === 'free') {
            // ✅ AVATARES GRATUITOS SIEMPRE DESBLOQUEADOS
            isUnlocked = true;
        } else if (avatar.category === 'premium') {
            // ✅ VERIFICAR SI SE COMPRÓ EL AVATAR INDIVIDUAL O EL PACK
            if (avatar.requiredPurchase) {
                isUnlocked = premiumPurchases.includes(avatar.requiredPurchase) || 
                           premiumPurchases.includes('premium_avatars_pack');
            }
        }
        
        if (isUnlocked) {
            unlockedAvatars.push(avatar.id);
        }
        
        console.log(`🖼️ Avatar ${avatar.name}: ${isUnlocked ? '✅ Desbloqueado' : '🔒 Bloqueado'}`);
    });
    
    console.log('📋 Avatares desbloqueados totales:', unlockedAvatars);
    return unlockedAvatars;
}

// 🔧 FUNCIÓN COMPLETAMENTE ACTUALIZADA PARA RENDERIZAR AVATARES POR CATEGORÍA
function renderAvatarsByCategory(category, unlockedAvatars, type = 'profile_photo') {
    console.log(`🎨 Renderizando avatares de categoría: ${category}, tipo: ${type}`);
    console.log(`🔓 Avatares desbloqueados: ${unlockedAvatars}`);
    
    const categoryAvatars = AVAILABLE_AVATARS.filter(avatar => 
        avatar.category === category && avatar.type === type
    );
    
    console.log(`📋 Avatares encontrados en ${category}:`, categoryAvatars.map(a => a.name));
    
    if (categoryAvatars.length === 0) {
        return '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No hay avatares en esta categoría</p>';
    }
    
    return categoryAvatars.map(avatar => {
        const isUnlocked = unlockedAvatars.includes(avatar.id);
        const isSelected = profileData.currentAvatar === avatar.src;
        
        console.log(`🖼️ Renderizando ${avatar.name}: desbloqueado=${isUnlocked}, seleccionado=${isSelected}`);
        
        return `
            <div class="avatar-option ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}" 
                 onclick="selectAvatar('${avatar.id}', ${isUnlocked})"
                 data-avatar-id="${avatar.id}">
                <div class="avatar-preview-container">
                    <img src="${avatar.src}" alt="${avatar.name}" class="avatar-preview" 
                         onerror="this.src='assets/images/mascota.png'">
                    ${!isUnlocked ? '<div class="avatar-lock"><i class="fas fa-lock"></i></div>' : ''}
                    ${isSelected ? '<div class="avatar-selected"><i class="fas fa-check"></i></div>' : ''}
                </div>
                <div class="avatar-name">${avatar.name}</div>
                ${!isUnlocked && avatar.price ? `<div class="avatar-price">$${avatar.price}</div>` : ''}
            </div>
        `;
    }).join('');
}

// ✅ FUNCIÓN PARA RENDERIZAR INFORMACIÓN PREMIUM
function renderPremiumInfo() {
    const premiumPurchases = JSON.parse(localStorage.getItem('premium-purchases') || '[]');
    const hasAnyPremium = premiumPurchases.length > 0;
    
    if (hasAnyPremium) {
        return `
            <div class="premium-info">
                <p><i class="fas fa-check-circle" style="color: #27ae60;"></i> ¡Tienes avatares premium desbloqueados!</p>
            </div>
        `;
    } else {
        return `
            <div class="premium-info">
                <p><i class="fas fa-info-circle" style="color: #3498db;"></i> Los avatares premium se desbloquean comprándolos en la tienda.</p>
                <button class="shop-btn" onclick="goToShop()">
                    <i class="fas fa-store"></i> Ir a la Tienda
                </button>
            </div>
        `;
    }
}

// 🔧 FUNCIÓN COMPLETAMENTE ACTUALIZADA PARA SELECCIONAR AVATAR
function selectAvatar(avatarId, isUnlocked) {
    console.log('🖼️ Intentando seleccionar avatar:', avatarId, 'Desbloqueado:', isUnlocked);
    
    if (!isUnlocked) {
        showNotification('❌ Este avatar está bloqueado. Cómpralo en la tienda.', 'error');
        return;
    }
    
    const avatar = AVAILABLE_AVATARS.find(a => a.id === avatarId);
    if (!avatar) {
        console.error('❌ Avatar no encontrado:', avatarId);
        return;
    }
    
    // ✅ ACTUALIZAR AVATAR ACTUAL
    profileData.currentAvatar = avatar.src;
    profileData.hasUnsavedChanges = true;
    
    // ✅ ACTUALIZAR UI INMEDIATAMENTE
    updateAvatarDisplay();
    
    // ✅ GUARDAR AUTOMÁTICAMENTE
    saveProfileData();
    
    // ✅ ACTUALIZAR SELECCIÓN EN EL MODAL
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`[data-avatar-id="${avatarId}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    showNotification('✅ Avatar actualizado correctamente', 'success');
}

// 🔧 FUNCIONES DE TESTING Y DEBUG PARA AVATARES PREMIUM
window.unlockPremiumAvatars = function() {
    console.log('🧪 Desbloqueando avatares premium para testing...');
    
    // ✅ DESBLOQUEAR AVATARES PREMIUM PARA TESTING
    const premiumPurchases = ['avatar_joy_guerrero', 'premium_avatars_pack'];
    localStorage.setItem('premium-purchases', JSON.stringify(premiumPurchases));

    console.log('✅ Avatares premium desbloqueados para testing');

    // ✅ VERIFICAR LA CONFIGURACIÓN
    console.log('📋 Avatares disponibles:');
    AVAILABLE_AVATARS.forEach(avatar => {
        console.log(`- ${avatar.name} (${avatar.category}) - ${avatar.type}`);
    });

    // ✅ REABRIR EL MODAL PARA VER LOS CAMBIOS
    const modal = document.getElementById('avatar-modal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => {
            openAvatarSelector();
        }, 500);
    }
};

window.debugAvatars = function() {
    console.log('🔍 === DEBUG AVATARES ===');
    console.log('Current avatar:', profileData.currentAvatar);
    console.log('Premium purchases:', JSON.parse(localStorage.getItem('premium-purchases') || '[]'));
    console.log('Available avatars:', AVAILABLE_AVATARS);
    console.log('Unlocked avatars:', getUnlockedAvatars());
    
    // ✅ VERIFICAR ESPECÍFICAMENTE LOS AVATARES PREMIUM
    const premiumPurchases = JSON.parse(localStorage.getItem('premium-purchases') || '[]');
    console.log('');
    console.log('📦 Productos comprados:');
    premiumPurchases.forEach(purchase => {
        console.log(`- ${purchase}`);
    });
    
    console.log('');
    console.log('🖼️ Estado de cada avatar:');
    AVAILABLE_AVATARS.forEach(avatar => {
        if (avatar.category === 'premium') {
            const isUnlocked = avatar.requiredPurchase ? 
                (premiumPurchases.includes(avatar.requiredPurchase) || 
                 premiumPurchases.includes('premium_avatars_pack')) : false;
            console.log(`${avatar.name} (${avatar.id}): ${isUnlocked ? '✅ Desbloqueado' : '🔒 Bloqueado'} - requiere: ${avatar.requiredPurchase}`);
        } else {
            console.log(`${avatar.name} (${avatar.id}): ✅ Gratuito`);
        }
    });
};

// ============================================
// FUNCIONES DE PERFIL (SIN CAMBIOS PRINCIPALES)
// ============================================

function loadProfileData() {
    try {
        const savedData = localStorage.getItem('user-profile');
        if (savedData) {
            const data = JSON.parse(savedData);
            profileData = { ...profileData, ...data };
            console.log('✅ Datos del perfil cargados:', profileData);
        }
    } catch (error) {
        console.error('❌ Error cargando datos del perfil:', error);
    }
}

function fillFormWithData() {
    const usernameInput = document.getElementById('username');
    const displayNameInput = document.getElementById('display-name-input');
    const favoriteVerseInput = document.getElementById('favorite-verse');
    
    if (usernameInput && profileData.username) {
        usernameInput.value = profileData.username;
    }
    
    if (displayNameInput && profileData.displayName) {
        displayNameInput.value = profileData.displayName;
    }
    
    if (favoriteVerseInput && profileData.favoriteVerse) {
        favoriteVerseInput.value = profileData.favoriteVerse;
    }
}

async function validateUsername(username) {
    // Simulación de validación
    if (username.length < 3) {
        return { valid: false, message: 'Debe tener al menos 3 caracteres' };
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return { valid: false, message: 'Solo letras, números, guiones y guiones bajos' };
    }
    
    // Simular verificación en servidor
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { valid: true, message: 'Nombre de usuario válido' };
}

function setupRealTimeValidation() {
    const usernameInput = document.getElementById('username');
    const usernameStatus = document.getElementById('username-status');
    const usernameHelp = document.getElementById('username-help');
    
    if (!usernameInput) return;
    
    let validationTimeout = null;
    
    usernameInput.addEventListener('input', (e) => {
        const value = e.target.value;
        
        // Limpiar timeout anterior
        if (validationTimeout) {
            clearTimeout(validationTimeout);
        }
        
        if (value.length === 0) {
            updateValidationStatus('default', 'fa-circle', 'Solo letras, números y guiones. Mínimo 3 caracteres.');
            return;
        }
        
        if (value.length < 3) {
            updateValidationStatus('invalid', 'fa-times', 'Debe tener al menos 3 caracteres.');
            return;
        }
        
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
            updateValidationStatus('invalid', 'fa-times', 'Solo se permiten letras, números, guiones y guiones bajos.');
            return;
        }
        
        // Mostrar estado de verificación
        updateValidationStatus('checking', 'fa-spinner fa-spin', 'Verificando disponibilidad...');
        
        // Verificar después de 1 segundo sin cambios
        validationTimeout = setTimeout(async () => {
            try {
                const result = await validateUsername(value);
                if (result.valid) {
                    updateValidationStatus('valid', 'fa-check', result.message);
                } else {
                    updateValidationStatus('invalid', 'fa-times', result.message);
                }
            } catch (error) {
                updateValidationStatus('invalid', 'fa-times', 'Error verificando el nombre de usuario.');
            }
        }, 1000);
    });
}

function updateValidationStatus(status, icon, message) {
    const usernameStatus = document.getElementById('username-status');
    const usernameHelp = document.getElementById('username-help');
    
    if (usernameStatus) {
        usernameStatus.className = `validation-status ${status}`;
        usernameStatus.innerHTML = `<i class="fas ${icon}"></i>`;
    }
    
    if (usernameHelp) {
        usernameHelp.textContent = message;
        usernameHelp.className = `input-help ${status === 'valid' ? 'success' : status === 'invalid' ? 'error' : ''}`;
    }
}

function calculateUserLevel() {
    if (!window.GameDataManager) return USER_LEVELS[0];
    
    const stats = window.GameDataManager.getStats();
    
    // Calcular experiencia basada en actividad
    const exp = (stats.coins * 0.1) + 
                (stats.victories * 50) + 
                (stats.gamesPlayed * 10) +
                (stats.perfectGames * 100);
    
    // Encontrar nivel correspondiente
    for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
        if (exp >= USER_LEVELS[i].minExp) {
            return { ...USER_LEVELS[i], currentExp: Math.floor(exp) };
        }
    }
    
    return { ...USER_LEVELS[0], currentExp: Math.floor(exp) };
}

function updateLevelDisplay() {
    const userLevel = calculateUserLevel();
    
    // Actualizar badge de nivel
    const levelBadge = document.getElementById('level-badge');
    const currentLevel = document.getElementById('current-level');
    const levelName = document.getElementById('level-name');
    const levelDescription = document.getElementById('level-description');
    
    if (levelBadge) {
        levelBadge.style.backgroundColor = userLevel.color;
        levelBadge.innerHTML = `<i class="fas ${userLevel.icon}"></i><span>${userLevel.level}</span>`;
    }
    
    if (currentLevel) {
        currentLevel.textContent = userLevel.level;
    }
    
    if (levelName) {
        levelName.textContent = userLevel.name;
    }
    
    if (levelDescription) {
        levelDescription.textContent = `Nivel ${userLevel.level} - ${userLevel.name}`;
    }
    
    // Actualizar barra de experiencia
    const expFill = document.getElementById('exp-fill');
    const expText = document.getElementById('exp-text');
    
    if (expFill && expText) {
        const expRange = userLevel.maxExp - userLevel.minExp;
        const currentExp = userLevel.currentExp - userLevel.minExp;
        const percentage = Math.min((currentExp / expRange) * 100, 100);
        
        expFill.style.width = `${percentage}%`;
        expText.textContent = `${userLevel.currentExp}/${userLevel.maxExp} EXP`;
    }
}

function updateAllDisplays() {
    updateCoinsDisplay();
    updateStatsDisplay();
    updateAvatarDisplay();
    updateNameDisplay();
    updateLevelDisplay();
}

function updateCoinsDisplay() {
    const coinsDisplay = document.getElementById('coins-display');
    if (coinsDisplay && window.GameDataManager) {
        coinsDisplay.textContent = window.GameDataManager.getCoins();
    }
}

function updateStatsDisplay() {
    if (!window.GameDataManager) return;
    
    const stats = window.GameDataManager.getStats();
    
    // Actualizar elementos de estadísticas
    const elements = {
        'games-played': stats.gamesPlayed,
        'victories': stats.victories,
        'total-coins': stats.coins,
        'perfect-games': stats.perfectGames,
        'win-rate': stats.winRate + '%',
        'current-streak': stats.currentStreak || 0
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// 🔧 FUNCIÓN updateAvatarDisplay ACTUALIZADA PARA VERIFICAR DESBLOQUEO
function updateAvatarDisplay() {
    const avatarImage = document.getElementById('avatar-image');
    if (avatarImage && profileData.currentAvatar) {
        console.log('🖼️ Actualizando avatar display a:', profileData.currentAvatar);
        avatarImage.src = profileData.currentAvatar;
        avatarImage.alt = 'Avatar actual';
        
        // ✅ VERIFICAR SI EL AVATAR ACTUAL ESTÁ DESBLOQUEADO
        const currentAvatarData = AVAILABLE_AVATARS.find(a => a.src === profileData.currentAvatar);
        const unlockedAvatars = getUnlockedAvatars();
        
        if (currentAvatarData && !unlockedAvatars.includes(currentAvatarData.id)) {
            console.warn('⚠️ Avatar actual está bloqueado, revirtiendo a avatar por defecto');
            profileData.currentAvatar = 'assets/images/fotos-perfil/niña.jpg';
            avatarImage.src = profileData.currentAvatar;
            saveProfileData();
        }
    }
}

function updateNameDisplay() {
    const displayNameElement = document.getElementById('display-name');
    if (displayNameElement) {
        displayNameElement.textContent = profileData.displayName || profileData.username || 'Jugador';
    }
    
    const userLevelElement = document.getElementById('user-level');
    if (userLevelElement) {
        const level = calculateUserLevel();
        userLevelElement.textContent = level.name;
    }
}

function setupFormListeners() {
    const usernameInput = document.getElementById('username');
    const displayNameInput = document.getElementById('display-name-input');
    const favoriteVerseInput = document.getElementById('favorite-verse');
    
    [usernameInput, displayNameInput, favoriteVerseInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                profileData.hasUnsavedChanges = true;
                updateSaveButtonState();
            });
        }
    });
    
    // Character counter para favorite verse
    if (favoriteVerseInput) {
        const charCounter = document.querySelector('.character-count');
        if (charCounter) {
            favoriteVerseInput.addEventListener('input', (e) => {
                const remaining = 200 - e.target.value.length;
                charCounter.textContent = `${remaining} caracteres restantes`;
            });
        }
    }
}

window.saveUserProfile = async function() {
    console.log('💾 Guardando perfil de usuario...');
    
    const saveBtn = document.getElementById('save-profile-btn');
    if (!saveBtn) return;
    
    const originalText = saveBtn.innerHTML;
    
    try {
        // Mostrar estado de carga
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        saveBtn.disabled = true;
        
        // Obtener datos del formulario
        const usernameInput = document.getElementById('username');
        const displayNameInput = document.getElementById('display-name-input');
        const favoriteVerseInput = document.getElementById('favorite-verse');
        
        if (usernameInput?.value) {
            const validation = await validateUsername(usernameInput.value);
            if (!validation.valid) {
                throw new Error(validation.message);
            }
            profileData.username = usernameInput.value;
        }
        
        if (displayNameInput?.value) {
            profileData.displayName = displayNameInput.value;
        }
        
        if (favoriteVerseInput?.value) {
            profileData.favoriteVerse = favoriteVerseInput.value;
        }
        
        // Guardar datos
        saveProfileData();
        
        // Actualizar displays
        updateAllDisplays();
        
        // Mostrar éxito
        profileData.hasUnsavedChanges = false;
        updateSaveButtonState();
        
        showNotification('Perfil guardado correctamente', 'success');
        
        // Mostrar indicador de guardado
        const saveIndicator = document.getElementById('save-indicator');
        if (saveIndicator) {
            saveIndicator.style.display = 'flex';
            setTimeout(() => {
                saveIndicator.style.display = 'none';
            }, 3000);
        }
        
    } catch (error) {
        console.error('❌ Error guardando perfil:', error);
        showNotification(error.message || 'Error guardando perfil', 'error');
    } finally {
        // Restaurar botón
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
};

function updateSaveButtonState() {
    const saveBtn = document.getElementById('save-profile-btn');
    if (saveBtn) {
        if (profileData.hasUnsavedChanges) {
            saveBtn.disabled = false;
            saveBtn.classList.add('has-changes');
        } else {
            saveBtn.disabled = true;
            saveBtn.classList.remove('has-changes');
        }
    }
}

function saveProfileData() {
    console.log('💾 Guardando datos del perfil en localStorage...');
    
    try {
        profileData.lastUpdated = Date.now();
        localStorage.setItem('user-profile', JSON.stringify(profileData));
        console.log('✅ Perfil guardado exitosamente');
    } catch (error) {
        console.error('❌ Error guardando perfil:', error);
        throw error;
    }
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
    
    // Estilos inline para la notificación
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

function goToShop() {
    window.location.href = 'store.html';
}

// ============================================
// FUNCIONES GLOBALES PARA EL HTML
// ============================================

window.closeAvatarModal = function() {
    const modal = document.getElementById('avatar-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('👤 Perfil DOM cargado - Iniciando...');
    
    // Verificar elementos críticos
    const criticalElements = [
        'avatar-image', 'username', 'display-name-input',
        'games-played', 'victories', 'total-coins',
        'save-profile-btn', 'avatar-modal'
    ];
    
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${element ? '✅' : '❌'} Elemento ${id}:`, !!element);
    });
    
    // Inicializar sistema
    setTimeout(init, 100);
});

// Debug para desarrollo
window.ProfileDebug = {
    data: profileData,
    avatars: AVAILABLE_AVATARS,
    levels: USER_LEVELS,
    premiumConfig: PREMIUM_AVATARS_CONFIG,
    getGameDataManager: () => window.GameDataManager
};

console.log('✅ Perfil.js COMPLETO Y ACTUALIZADO cargado completamente');
console.log('🛠️ Debug funciones disponibles: unlockPremiumAvatars(), debugAvatars()');