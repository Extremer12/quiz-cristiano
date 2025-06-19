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
    currentAvatar: 'assets/images/mascota.png',
    isValidatingUsername: false,
    hasUnsavedChanges: false,
    lastUpdated: null
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
        console.log('👤 Inicializando perfil...');
        
        // Esperar a que GameDataManager esté disponible
        await waitForGameDataManager();
        
        // Configurar listeners de GameDataManager
        setupGameDataListeners();
        
        // Cargar datos del perfil
        loadProfileData();
        
        // Configurar listeners del formulario
        setupFormListeners();
        
        // Configurar validación en tiempo real
        setupRealTimeValidation();
        
        // Actualizar todas las pantallas
        updateAllDisplays();
        
        profileData.isInitialized = true;
        console.log('✅ Perfil inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando perfil:', error);
    }
}

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
    console.log('🔗 Configurando listeners para perfil...');
    
    window.GameDataManager.onCoinsChanged((data) => {
        updateCoinsDisplay();
    });
    
    window.GameDataManager.onDataChanged((data) => {
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
        // Cargar desde localStorage
        const savedProfile = localStorage.getItem('quiz-cristiano-profile');
        if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            
            profileData.username = parsed.username || '';
            profileData.displayName = parsed.displayName || '';
            profileData.favoriteVerse = parsed.favoriteVerse || '';
            profileData.currentAvatar = parsed.currentAvatar || 'assets/images/mascota.png';
            profileData.lastUpdated = parsed.lastUpdated || Date.now();
            
            console.log('✅ Datos del perfil cargados:', profileData);
        } else {
            console.log('📋 No hay datos de perfil guardados, usando valores por defecto');
        }
        
        // Llenar formulario con datos cargados
        fillFormWithData();
        
    } catch (error) {
        console.error('❌ Error cargando datos del perfil:', error);
    }
}

function fillFormWithData() {
    console.log('📝 Llenando formulario con datos cargados...');
    
    // Llenar inputs
    const usernameInput = document.getElementById('username');
    const displayNameInput = document.getElementById('display-name-input');
    const favoriteVerseInput = document.getElementById('favorite-verse');
    
    if (usernameInput) {
        usernameInput.value = profileData.username || '';
    }
    
    if (displayNameInput) {
        displayNameInput.value = profileData.displayName || '';
    }
    
    if (favoriteVerseInput) {
        favoriteVerseInput.value = profileData.favoriteVerse || '';
        
        // Actualizar contador de caracteres
        const verseCount = document.getElementById('verse-count');
        if (verseCount) {
            verseCount.textContent = favoriteVerseInput.value.length;
        }
    }
    
    console.log('✅ Formulario llenado con datos');
}

// ✅ FUNCIÓN SAVE PROFILE DATA CORREGIDA

function saveProfileData() {
    console.log('💾 Guardando datos del perfil en localStorage...');
    
    try {
        const dataToSave = {
            username: profileData.username || '',
            displayName: profileData.displayName || '',
            favoriteVerse: profileData.favoriteVerse || '',
            currentAvatar: profileData.currentAvatar || 'assets/images/mascota.png',
            lastUpdated: profileData.lastUpdated || Date.now(),
            version: '1.0.0'
        };
        
        localStorage.setItem('quiz-cristiano-profile', JSON.stringify(dataToSave));
        console.log('✅ Datos del perfil guardados en localStorage');
        
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
        return { valid: false, message: 'El nombre debe tener al menos 3 caracteres', type: 'error' };
    }
    
    if (username.length > 20) {
        return { valid: false, message: 'El nombre no puede tener más de 20 caracteres', type: 'error' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valid: false, message: 'Solo letras, números y guiones bajos permitidos', type: 'error' };
    }
    
    // Simular verificación de disponibilidad
    const unavailableNames = [
        'admin', 'moderator', 'jesus', 'dios', 'god', 'cristo', 'test', 'usuario', 'player'
    ];
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay de red
    
    if (unavailableNames.includes(username.toLowerCase())) {
        return { valid: false, message: 'Este nombre no está disponible', type: 'error' };
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
        const username = e.target.value.trim();
        
        // Marcar como cambios no guardados
        profileData.hasUnsavedChanges = true;
        updateSaveButtonState();
        
        // Limpiar timeout anterior
        clearTimeout(validationTimeout);
        
        if (username.length === 0) {
            updateValidationStatus('', '', 'Elige un nombre único');
            return;
        }
        
        // Mostrar estado de verificación
        updateValidationStatus('checking', 'fa-circle-notch fa-spin', 'Verificando disponibilidad...');
        
        // Validar después de 800ms de inactividad
        validationTimeout = setTimeout(async () => {
            try {
                profileData.isValidatingUsername = true;
                const result = await validateUsername(username);
                
                if (result.valid) {
                    updateValidationStatus('valid', 'fa-check', result.message);
                } else {
                    updateValidationStatus('invalid', 'fa-times', result.message);
                }
            } catch (error) {
                console.error('Error validando username:', error);
                updateValidationStatus('invalid', 'fa-exclamation-triangle', 'Error verificando disponibilidad');
            } finally {
                profileData.isValidatingUsername = false;
            }
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
        usernameHelp.textContent = message;
        usernameHelp.className = `input-help ${status === 'valid' ? 'success' : status === 'invalid' ? 'error' : ''}`;
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
        const isSelected = avatar.src === profileData.currentAvatar;
        
        const avatarElement = document.createElement('div');
        avatarElement.className = `avatar-option ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
        
        avatarElement.innerHTML = `
            <img src="${avatar.src}" alt="${avatar.name}">
            ${!isUnlocked ? '<div class="avatar-lock"><i class="fas fa-lock"></i></div>' : ''}
            ${isSelected ? '<div class="avatar-selected"><i class="fas fa-check"></i></div>' : ''}
            <div class="avatar-name">${avatar.name}</div>
        `;
        
        avatarElement.addEventListener('click', () => selectAvatar(avatar, isUnlocked));
        avatarsGrid.appendChild(avatarElement);
    });
    
    modal.style.display = 'flex';
};

function selectAvatar(avatar, isUnlocked) {
    if (!isUnlocked) {
        showNotification('Este avatar no está disponible', 'warning');
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
        const options = avatarsGrid.querySelectorAll('.avatar-option');
        options.forEach(option => option.classList.remove('selected'));
        
        const selectedOption = avatarsGrid.querySelector(`img[src="${avatar.src}"]`)?.parentElement;
        if (selectedOption) {
            selectedOption.classList.add('selected');
            selectedOption.innerHTML += '<div class="avatar-selected"><i class="fas fa-check"></i></div>';
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
        levelBadge.style.background = userLevel.color;
    }
    
    if (currentLevel) {
        currentLevel.textContent = userLevel.level;
    }
    
    if (levelName) {
        levelName.textContent = userLevel.name;
    }
    
    if (levelDescription) {
        const nextLevel = USER_LEVELS.find(l => l.level === userLevel.level + 1);
        if (nextLevel) {
            const expNeeded = nextLevel.minExp - userLevel.currentExp;
            levelDescription.textContent = `${expNeeded} EXP para ${nextLevel.name}`;
        } else {
            levelDescription.textContent = '¡Nivel máximo alcanzado!';
        }
    }
    
    // Actualizar barra de experiencia
    const expFill = document.getElementById('exp-fill');
    const expText = document.getElementById('exp-text');
    
    if (expFill && expText) {
        const progress = ((userLevel.currentExp - userLevel.minExp) / (userLevel.maxExp - userLevel.minExp)) * 100;
        expFill.style.width = `${Math.min(progress, 100)}%`;
        expText.textContent = `${userLevel.currentExp} / ${userLevel.maxExp === Infinity ? '∞' : userLevel.maxExp}`;
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
        coinsDisplay.textContent = window.GameDataManager.getCoins();
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
        'achievements-count': 0, // Implementar cuando esté el sistema de logros
        'win-rate': stats.winRate || 0,
        'current-streak': 0 // Implementar sistema de rachas
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = typeof value === 'number' && id === 'win-rate' ? `${value}%` : value;
        }
    });
}

function updateAvatarDisplay() {
    const avatarImage = document.getElementById('avatar-image');
    if (avatarImage) {
        avatarImage.src = profileData.currentAvatar;
    }
}

// ✅ FUNCIÓN UPDATE NAME DISPLAY CORREGIDA

function updateNameDisplay() {
    const displayNameElement = document.getElementById('display-name');
    
    if (displayNameElement) {
        const nameToShow = profileData.displayName || profileData.username || 'Jugador';
        displayNameElement.textContent = nameToShow;
        console.log(`📝 Nombre actualizado en interfaz: ${nameToShow}`);
    }
    
    // También actualizar en otras partes de la app si es necesario
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (profileData.displayName) {
        currentUser.displayName = profileData.displayName;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// ============================================
// FORMULARIO Y GUARDADO
// ============================================

function setupFormListeners() {
    console.log('📝 Configurando listeners del formulario...');
    
    // Listener para nombre de usuario
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('input', (e) => {
            const value = e.target.value;
            
            // Marcar cambios no guardados
            profileData.hasUnsavedChanges = true;
            updateSaveButtonState();
            
            // Validación visual básica
            if (value.length > 0 && value.length < 3) {
                usernameInput.style.borderColor = '#e74c3c';
            } else if (value.length >= 3) {
                usernameInput.style.borderColor = '#27ae60';
            } else {
                usernameInput.style.borderColor = '';
            }
        });
    }
    
    // Listener para nombre a mostrar
    const displayNameInput = document.getElementById('display-name-input');
    if (displayNameInput) {
        displayNameInput.addEventListener('input', (e) => {
            profileData.hasUnsavedChanges = true;
            updateSaveButtonState();
            
            // Validación de longitud
            if (e.target.value.length > 30) {
                displayNameInput.style.borderColor = '#e74c3c';
            } else {
                displayNameInput.style.borderColor = '';
            }
        });
    }
    
    // Contador de caracteres para versículo
    const favoriteVerseInput = document.getElementById('favorite-verse');
    const verseCount = document.getElementById('verse-count');
    
    if (favoriteVerseInput && verseCount) {
        favoriteVerseInput.addEventListener('input', (e) => {
            const length = e.target.value.length;
            verseCount.textContent = length;
            
            profileData.hasUnsavedChanges = true;
            updateSaveButtonState();
            
            // Cambiar color según longitud
            if (length > 200) {
                verseCount.style.color = '#e74c3c';
                favoriteVerseInput.style.borderColor = '#e74c3c';
            } else if (length > 180) {
                verseCount.style.color = '#f39c12';
                favoriteVerseInput.style.borderColor = '#f39c12';
            } else {
                verseCount.style.color = '';
                favoriteVerseInput.style.borderColor = '';
            }
        });
    }
}

// ✅ FUNCIÓN SAVE COMPLETAMENTE CORREGIDA

window.saveUserProfile = async function() {
    console.log('💾 === GUARDANDO PERFIL DEL USUARIO ===');
    
    const saveBtn = document.getElementById('save-profile-btn');
    const saveIndicator = document.getElementById('save-indicator');
    
    // Obtener valores del formulario
    const usernameInput = document.getElementById('username');
    const displayNameInput = document.getElementById('display-name-input');
    const favoriteVerseInput = document.getElementById('favorite-verse');
    
    const formData = {
        username: usernameInput?.value?.trim() || '',
        displayName: displayNameInput?.value?.trim() || '',
        favoriteVerse: favoriteVerseInput?.value?.trim() || ''
    };
    
    console.log('📝 Datos del formulario:', formData);
    
    // Validaciones básicas
    if (formData.username && formData.username.length < 3) {
        showNotification('El nombre de usuario debe tener al menos 3 caracteres', 'error');
        return;
    }
    
    if (formData.username && formData.username.length > 20) {
        showNotification('El nombre de usuario no puede tener más de 20 caracteres', 'error');
        return;
    }
    
    if (formData.displayName && formData.displayName.length > 30) {
        showNotification('El nombre a mostrar no puede tener más de 30 caracteres', 'error');
        return;
    }
    
    if (formData.favoriteVerse && formData.favoriteVerse.length > 200) {
        showNotification('El versículo favorito no puede tener más de 200 caracteres', 'error');
        return;
    }
    
    // Mostrar estado de guardado
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Guardando...</span>';
    }
    
    try {
        // 1. Validar nombre de usuario si cambió
        if (formData.username && formData.username !== profileData.username) {
            console.log('🔍 Validando nombre de usuario...');
            const validation = await validateUsername(formData.username);
            if (!validation.valid) {
                showNotification(validation.message, 'error');
                return;
            }
        }
        
        // 2. Actualizar datos del perfil
        profileData.username = formData.username;
        profileData.displayName = formData.displayName;
        profileData.favoriteVerse = formData.favoriteVerse;
        profileData.lastUpdated = Date.now();
        
        console.log('💾 Datos actualizados:', profileData);
        
        // 3. Guardar en localStorage
        saveProfileData();
        
        // 4. Intentar guardar en Firebase (si está disponible)
        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            if (currentUser.uid && window.firebase) {
                console.log('☁️ Guardando en Firebase...');
                // Aquí puedes agregar la lógica de Firebase cuando esté disponible
            }
        } catch (firebaseError) {
            console.warn('⚠️ Error guardando en Firebase (continuando sin sincronización):', firebaseError);
        }
        
        // 5. Actualizar interfaz
        updateNameDisplay();
        
        // 6. Mostrar éxito
        showNotification('Perfil guardado exitosamente', 'success');
        
        if (saveIndicator) {
            saveIndicator.style.display = 'inline-block';
            setTimeout(() => {
                saveIndicator.style.display = 'none';
            }, 3000);
        }
        
        // 7. Marcar como guardado
        profileData.hasUnsavedChanges = false;
        
        console.log('✅ Perfil guardado exitosamente');
        
    } catch (error) {
        console.error('❌ Error guardando perfil:', error);
        showNotification('Error al guardar el perfil', 'error');
    } finally {
        // Restaurar botón
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> <span>Guardar Cambios</span>';
        }
        
        updateSaveButtonState();
    }
};

function updateSaveButtonState() {
    const saveBtn = document.getElementById('save-profile-btn');
    if (!saveBtn) return;
    
    if (profileData.hasUnsavedChanges) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> <span>Guardar Cambios</span>';
        saveBtn.style.opacity = '1';
    } else {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> <span>Todo Guardado</span>';
        saveBtn.style.opacity = '0.6';
    }
}

// ============================================
// NOTIFICACIONES
// ============================================

function showNotification(message, type = 'info') {
    // Crear elemento de notificación
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
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
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

// ✅ FUNCIÓN DE DEBUG ADICIONAL
window.debugProfile = function() {
    console.log('🔍 === DEBUG PERFIL ===');
    console.log('profileData:', typeof profileData !== 'undefined' ? profileData : 'No definido');
    console.log('localStorage profile:', localStorage.getItem('quiz-cristiano-profile'));
    console.log('currentUser:', localStorage.getItem('currentUser'));
    
    // Verificar inputs
    const inputs = {
        username: document.getElementById('username')?.value,
        displayName: document.getElementById('display-name-input')?.value,
        favoriteVerse: document.getElementById('favorite-verse')?.value
    };
    console.log('Valores de inputs:', inputs);
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('👤 Perfil DOM cargado, inicializando...');
    
    // Verificar elementos críticos
    const criticalElements = [
        'username', 'display-name-input', 'favorite-verse',
        'save-profile-btn', 'avatar-image'
    ];
    
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${element ? '✅' : '❌'} Elemento ${id}:`, !!element);
    });
    
    // Inicializar perfil
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