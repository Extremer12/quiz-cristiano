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
    currentAvatar: 'assets/images/mascota.png',
    isValidatingUsername: false,
    hasUnsavedChanges: false
};

// ✅ AVATARES DISPONIBLES (CON JOY-TROFEO)
const AVAILABLE_AVATARS = [
    { id: 'mascota', src: 'assets/images/mascota.png', name: 'Joy Original', unlocked: true },
    { id: 'joy-trofeo', src: 'assets/images/joy-trofeo.png', name: 'Joy Trofeo', unlocked: true },
    { id: 'joy-corona', src: 'assets/images/joy-corona.png', name: 'Joy Corona', unlocked: false, requiredPurchase: 'joy_corona' },
    { id: 'joy-festejo', src: 'assets/images/joy-festejo.png', name: 'Joy Festejo', unlocked: true },
    { id: 'joy-consolando', src: 'assets/images/joy-consolando.png', name: 'Joy Consolando', unlocked: true },
    { id: 'joy-explicando', src: 'assets/images/joy-explicando.png', name: 'Joy Explicando', unlocked: true }
];

// ✅ NIVELES DE USUARIO
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
        console.log('👤 Inicializando sistema de perfil...');
        
        // 1. Esperar GameDataManager
        if (!window.GameDataManager) {
            await waitForGameDataManager();
        }
        
        // 2. Configurar listeners
        setupGameDataListeners();
        setupFormListeners();
        
        // 3. Cargar datos del perfil
        loadProfileData();
        
        // 4. Actualizar displays
        updateAllDisplays();
        
        // 5. Configurar validación en tiempo real
        setupRealTimeValidation();
        
        profileData.isInitialized = true;
        console.log('✅ Sistema de perfil inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando perfil:', error);
        showNotification('Error cargando el perfil', 'error');
    }
}

async function waitForGameDataManager() {
    return new Promise((resolve) => {
        const checkGameDataManager = () => {
            if (window.GameDataManager) {
                console.log('✅ GameDataManager disponible para perfil');
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
    console.log('🔗 Configurando listeners para perfil...');
    
    window.GameDataManager.onCoinsChanged((data) => {
        console.log('💰 Monedas cambiaron, actualizando perfil:', data);
        updateCoinsDisplay();
    });
    
    window.GameDataManager.onDataChanged((data) => {
        console.log('📊 Datos cambiaron, actualizando estadísticas:', data);
        updateStatsDisplay();
        updateLevelDisplay();
    });
}

// ============================================
// GESTIÓN DE DATOS DEL PERFIL
// ============================================

function loadProfileData() {
    console.log('📱 Cargando datos del perfil...');
    
    try {
        // Cargar datos básicos
        const savedProfile = localStorage.getItem('quiz-cristiano-profile');
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            
            // Aplicar datos del perfil
            const usernameInput = document.getElementById('username');
            const displayNameInput = document.getElementById('display-name-input');
            const favoriteVerseInput = document.getElementById('favorite-verse');
            
            if (usernameInput) usernameInput.value = profile.username || '';
            if (displayNameInput) displayNameInput.value = profile.displayName || '';
            if (favoriteVerseInput) favoriteVerseInput.value = profile.favoriteVerse || '';
            
            // Cargar avatar
            profileData.currentAvatar = profile.avatar || 'assets/images/mascota.png';
        }
        
        // Cargar datos del usuario actual
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const userData = JSON.parse(currentUser);
            const displayNameInput = document.getElementById('display-name-input');
            if (displayNameInput && !displayNameInput.value) {
                displayNameInput.value = userData.name || userData.displayName || '';
            }
        }
        
        console.log('✅ Datos del perfil cargados');
        
    } catch (error) {
        console.error('❌ Error cargando datos del perfil:', error);
    }
}

function saveProfileData() {
    console.log('💾 Guardando datos del perfil...');
    
    try {
        const usernameInput = document.getElementById('username');
        const displayNameInput = document.getElementById('display-name-input');
        const favoriteVerseInput = document.getElementById('favorite-verse');
        
        const profileData = {
            username: usernameInput?.value || '',
            displayName: displayNameInput?.value || '',
            favoriteVerse: favoriteVerseInput?.value || '',
            avatar: profileData.currentAvatar,
            lastUpdated: Date.now()
        };
        
        localStorage.setItem('quiz-cristiano-profile', JSON.stringify(profileData));
        
        // Actualizar también el usuario actual si es necesario
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser && displayNameInput?.value) {
            const userData = JSON.parse(currentUser);
            userData.name = displayNameInput.value;
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }
        
        console.log('✅ Datos del perfil guardados');
        return true;
        
    } catch (error) {
        console.error('❌ Error guardando datos del perfil:', error);
        return false;
    }
}

// ============================================
// VALIDACIÓN DE NOMBRE DE USUARIO
// ============================================

async function validateUsername(username) {
    console.log(`🔍 Validando nombre de usuario: ${username}`);
    
    // Validaciones locales
    if (!username || username.length < 3) {
        return { valid: false, message: 'Mínimo 3 caracteres', type: 'error' };
    }
    
    if (username.length > 20) {
        return { valid: false, message: 'Máximo 20 caracteres', type: 'error' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, message: 'Solo letras, números y guiones bajos', type: 'error' };
    }
    
    // Simular verificación de disponibilidad
    const unavailableNames = [
        'admin', 'moderator', 'jesus', 'dios', 'god', 'cristo', 'test', 'usuario', 'player'
    ];
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay de red
    
    if (unavailableNames.includes(username.toLowerCase())) {
        return { valid: false, message: 'Nombre no disponible', type: 'error' };
    }
    
    return { valid: true, message: 'Nombre disponible', type: 'success' };
}

function setupRealTimeValidation() {
    const usernameInput = document.getElementById('username');
    const usernameStatus = document.getElementById('username-status');
    const usernameHelp = document.getElementById('username-help');
    
    if (!usernameInput) return;
    
    let validationTimeout = null;
    
    usernameInput.addEventListener('input', (e) => {
        const username = e.target.value;
        
        // Mostrar estado de verificación
        if (usernameStatus) {
            usernameStatus.className = 'validation-status checking';
            usernameStatus.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
        }
        
        // Cancelar validación anterior
        if (validationTimeout) {
            clearTimeout(validationTimeout);
        }
        
        // Validar después de 800ms de inactividad
        validationTimeout = setTimeout(async () => {
            if (!username) {
                updateValidationStatus('', '', '');
                return;
            }
            
            profileData.isValidatingUsername = true;
            const result = await validateUsername(username);
            profileData.isValidatingUsername = false;
            
            updateValidationStatus(
                result.valid ? 'valid' : 'invalid',
                result.valid ? 'fa-check' : 'fa-times',
                result.message
            );
            
            // Marcar cambios no guardados
            profileData.hasUnsavedChanges = true;
            updateSaveButtonState();
            
        }, 800);
    });
}

function updateValidationStatus(status, icon, message) {
    const usernameStatus = document.getElementById('username-status');
    const usernameHelp = document.getElementById('username-help');
    
    if (usernameStatus) {
        usernameStatus.className = `validation-status ${status}`;
        usernameStatus.innerHTML = icon ? `<i class="fas ${icon}"></i>` : '';
    }
    
    if (usernameHelp) {
        usernameHelp.textContent = message || '3-20 caracteres, solo letras, números y guiones bajos';
        usernameHelp.className = `input-help ${status === 'invalid' ? 'error' : status === 'valid' ? 'success' : ''}`;
    }
}

// ============================================
// GESTIÓN DE AVATARES
// ============================================

window.openAvatarSelector = function() {
    console.log('🖼️ Abriendo selector de avatares...');
    
    const modal = document.getElementById('avatar-modal');
    const avatarsGrid = document.getElementById('avatars-grid');
    
    if (!modal || !avatarsGrid) return;
    
    // Verificar avatares desbloqueados
    const unlockedAvatars = getUnlockedAvatars();
    
    // Renderizar avatares
    avatarsGrid.innerHTML = '';
    AVAILABLE_AVATARS.forEach(avatar => {
        const isUnlocked = unlockedAvatars.includes(avatar.id);
        const isSelected = profileData.currentAvatar === avatar.src;
        
        const avatarElement = document.createElement('div');
        avatarElement.className = `avatar-option ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
        avatarElement.onclick = () => selectAvatar(avatar, isUnlocked);
        
        avatarElement.innerHTML = `
            <img src="${avatar.src}" alt="${avatar.name}">
            ${!isUnlocked ? '<div class="avatar-lock"><i class="fas fa-lock"></i></div>' : ''}
            ${isSelected ? '<div class="avatar-selected"><i class="fas fa-check"></i></div>' : ''}
        `;
        
        avatarElement.title = avatar.name;
        avatarsGrid.appendChild(avatarElement);
    });
    
    modal.style.display = 'flex';
};

function selectAvatar(avatar, isUnlocked) {
    if (!isUnlocked) {
        showNotification(`${avatar.name} no está desbloqueado`, 'warning');
        return;
    }
    
    console.log(`🖼️ Avatar seleccionado: ${avatar.name}`);
    
    // Actualizar avatar actual
    profileData.currentAvatar = avatar.src;
    
    // Actualizar imagen en la interfaz
    const avatarImage = document.getElementById('avatar-image');
    if (avatarImage) {
        avatarImage.src = avatar.src;
    }
    
    // Marcar cambios no guardados
    profileData.hasUnsavedChanges = true;
    updateSaveButtonState();
    
    // Cerrar modal
    const modal = document.getElementById('avatar-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Actualizar selector
    const avatarsGrid = document.getElementById('avatars-grid');
    if (avatarsGrid) {
        avatarsGrid.querySelectorAll('.avatar-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        const selectedOption = avatarsGrid.querySelector(`img[src="${avatar.src}"]`)?.parentElement;
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
    }
}

function getUnlockedAvatars() {
    const unlockedAvatars = ['mascota', 'joy-trofeo', 'joy-festejo', 'joy-consolando', 'joy-explicando'];
    
    // Verificar si tiene la corona desbloqueada
    const hasCorona = localStorage.getItem('joy-corona-unlocked') === 'true';
    if (hasCorona) {
        unlockedAvatars.push('joy-corona');
    }
    
    return unlockedAvatars;
}

// ============================================
// SISTEMA DE NIVELES Y EXPERIENCIA
// ============================================

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
        const level = USER_LEVELS[i];
        if (exp >= level.minExp) {
            return { ...level, currentExp: Math.floor(exp) };
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
        levelBadge.style.background = userLevel.color;
    }
    
    if (currentLevel) {
        currentLevel.textContent = userLevel.level;
    }
    
    if (levelName) {
        levelName.textContent = userLevel.name;
    }
    
    if (levelDescription) {
        if (userLevel.level >= 10) {
            levelDescription.textContent = '¡Has alcanzado el nivel máximo!';
        } else {
            const nextLevel = USER_LEVELS[userLevel.level];
            const expNeeded = nextLevel.minExp - userLevel.currentExp;
            levelDescription.textContent = `${expNeeded} XP para el siguiente nivel`;
        }
    }
    
    // Actualizar barra de experiencia
    const expFill = document.getElementById('exp-fill');
    const expText = document.getElementById('exp-text');
    
    if (expFill && expText) {
        if (userLevel.level >= 10) {
            expFill.style.width = '100%';
            expText.textContent = 'MÁXIMO';
        } else {
            const nextLevel = USER_LEVELS[userLevel.level];
            const currentLevelExp = userLevel.currentExp - userLevel.minExp;
            const levelExpRange = nextLevel.minExp - userLevel.minExp;
            const percentage = Math.min((currentLevelExp / levelExpRange) * 100, 100);
            
            expFill.style.width = `${percentage}%`;
            expText.textContent = `${currentLevelExp} / ${levelExpRange}`;
        }
    }
    
    // Actualizar nivel en el header del perfil
    const userLevelElement = document.getElementById('user-level');
    if (userLevelElement) {
        userLevelElement.textContent = userLevel.name;
        userLevelElement.style.color = userLevel.color;
    }
}

// ============================================
// ACTUALIZACIÓN DE DISPLAYS
// ============================================

function updateAllDisplays() {
    updateCoinsDisplay();
    updateStatsDisplay();
    updateLevelDisplay();
    updateAvatarDisplay();
    updateNameDisplay();
}

function updateCoinsDisplay() {
    if (!window.GameDataManager) return;
    
    const coinsDisplay = document.getElementById('coins-display');
    if (coinsDisplay) {
        coinsDisplay.textContent = window.GameDataManager.getCoins().toLocaleString();
    }
}

function updateStatsDisplay() {
    if (!window.GameDataManager) return;
    
    const stats = window.GameDataManager.getStats();
    
    // Actualizar estadísticas básicas
    const elements = {
        'games-played': stats.gamesPlayed || 0,
        'victories': stats.victories || 0,
        'total-coins': stats.coins || 0,
        'achievements-count': 0, // TODO: Integrar con sistema de logros
        'win-rate': stats.winRate || 0,
        'current-streak': 0 // TODO: Implementar sistema de rachas
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'win-rate') {
                element.textContent = `${value}%`;
            } else {
                element.textContent = value.toLocaleString();
            }
        }
    });
}

function updateAvatarDisplay() {
    const avatarImage = document.getElementById('avatar-image');
    if (avatarImage) {
        avatarImage.src = profileData.currentAvatar;
    }
}

function updateNameDisplay() {
    const displayNameElement = document.getElementById('display-name');
    const displayNameInput = document.getElementById('display-name-input');
    
    if (displayNameElement && displayNameInput) {
        displayNameElement.textContent = displayNameInput.value || 'Jugador';
    }
}

// ============================================
// FORMULARIO Y GUARDADO
// ============================================

function setupFormListeners() {
    console.log('📝 Configurando listeners del formulario...');
    
    // Contador de caracteres para versículo
    const favoriteVerseInput = document.getElementById('favorite-verse');
    const verseCount = document.getElementById('verse-count');
    
    if (favoriteVerseInput && verseCount) {
        favoriteVerseInput.addEventListener('input', () => {
            verseCount.textContent = favoriteVerseInput.value.length;
            profileData.hasUnsavedChanges = true;
            updateSaveButtonState();
        });
    }
    
    // Listener para nombre a mostrar
    const displayNameInput = document.getElementById('display-name-input');
    if (displayNameInput) {
        displayNameInput.addEventListener('input', () => {
            updateNameDisplay();
            profileData.hasUnsavedChanges = true;
            updateSaveButtonState();
        });
    }
    
    // Advertencia de cambios no guardados
    window.addEventListener('beforeunload', (e) => {
        if (profileData.hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

window.saveUserProfile = async function() {
    console.log('💾 Guardando perfil del usuario...');
    
    const saveBtn = document.getElementById('save-profile-btn');
    const saveIndicator = document.getElementById('save-indicator');
    
    // Mostrar estado de guardado
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Guardando...</span>';
    }
    
    try {
        // Validar datos antes de guardar
        const isValid = await validateFormData();
        if (!isValid) {
            throw new Error('Datos del formulario inválidos');
        }
        
        // Guardar datos
        const success = saveProfileData();
        if (!success) {
            throw new Error('Error guardando datos localmente');
        }
        
        // Mostrar indicador de éxito
        if (saveIndicator) {
            saveIndicator.style.display = 'block';
            setTimeout(() => {
                saveIndicator.style.display = 'none';
            }, 3000);
        }
        
        // Resetear estado de cambios
        profileData.hasUnsavedChanges = false;
        
        showNotification('Perfil guardado exitosamente', 'success');
        console.log('✅ Perfil guardado correctamente');
        
    } catch (error) {
        console.error('❌ Error guardando perfil:', error);
        showNotification('Error guardando el perfil', 'error');
    } finally {
        // Restaurar botón
        if (saveBtn) {
            updateSaveButtonState();
        }
    }
};

async function validateFormData() {
    const usernameInput = document.getElementById('username');
    const displayNameInput = document.getElementById('display-name-input');
    
    // Validar nombre de usuario si está presente
    if (usernameInput?.value) {
        const usernameValidation = await validateUsername(usernameInput.value);
        if (!usernameValidation.valid) {
            showNotification(`Nombre de usuario: ${usernameValidation.message}`, 'error');
            return false;
        }
    }
    
    // Validar nombre a mostrar
    if (displayNameInput?.value && displayNameInput.value.length > 30) {
        showNotification('El nombre a mostrar es demasiado largo', 'error');
        return false;
    }
    
    return true;
}

function updateSaveButtonState() {
    const saveBtn = document.getElementById('save-profile-btn');
    if (!saveBtn) return;
    
    if (profileData.isValidatingUsername) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> <span>Validando...</span>';
    } else if (profileData.hasUnsavedChanges) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> <span>Guardar Cambios</span>';
    } else {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> <span>Todo Guardado</span>';
    }
}

// ============================================
// NOTIFICACIONES
// ============================================

function showNotification(message, type = 'info') {
    console.log(`📢 Notificación: ${message} (${type})`);
    
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
    console.log('👤 Perfil HTML cargado, inicializando...');
    init();
});

// Debug para desarrollo
window.ProfileDebug = {
    data: profileData,
    avatars: AVAILABLE_AVATARS,
    levels: USER_LEVELS,
    getGameDataManager: () => window.GameDataManager
};

console.log('✅ Perfil.js cargado completamente');