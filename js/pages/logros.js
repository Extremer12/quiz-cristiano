/**
 * ================================================
 * LOGROS SYSTEM - GAMIFICACIÓN COMPLETA
 * Quiz Cristiano - Sistema de Logros Automáticos
 * ================================================
 */

// ============================================
// CONFIGURACIÓN DE LOGROS
// ============================================

const ACHIEVEMENTS = {
    // 🎯 LOGROS DE PROGRESO
    progreso: [
        {
            id: 'primera_partida',
            name: 'Primer Paso',
            description: 'Juega tu primera partida',
            icon: 'fa-play',
            points: 50,
            condition: (stats) => stats.gamesPlayed >= 1,
            rarity: 'common'
        },
        {
            id: 'veterano',
            name: 'Veterano',
            description: 'Juega 10 partidas',
            icon: 'fa-trophy',
            points: 100,
            condition: (stats) => stats.gamesPlayed >= 10,
            rarity: 'uncommon'
        },
        {
            id: 'maestro',
            name: 'Maestro Bíblico',
            description: 'Juega 50 partidas',
            icon: 'fa-crown',
            points: 250,
            condition: (stats) => stats.gamesPlayed >= 50,
            rarity: 'rare'
        },
        {
            id: 'leyenda',
            name: 'Leyenda Viviente',
            description: 'Juega 100 partidas',
            icon: 'fa-star',
            points: 500,
            condition: (stats) => stats.gamesPlayed >= 100,
            rarity: 'legendary'
        }
    ],

    // 🎯 LOGROS DE MAESTRÍA
    maestria: [
        {
            id: 'primera_victoria',
            name: 'Primera Victoria',
            description: 'Gana tu primera partida completa',
            icon: 'fa-medal',
            points: 100,
            condition: (stats) => stats.victories >= 1,
            rarity: 'common'
        },
        {
            id: 'invencible',
            name: 'Invencible',
            description: 'Gana 5 partidas',
            icon: 'fa-shield-alt',
            points: 200,
            condition: (stats) => stats.victories >= 5,
            rarity: 'uncommon'
        },
        {
            id: 'perfeccionista',
            name: 'Perfeccionista',
            description: 'Completa una partida sin errores',
            icon: 'fa-gem',
            points: 300,
            condition: (stats) => stats.perfectGames >= 1,
            rarity: 'rare'
        },
        {
            id: 'experto_categorias',
            name: 'Experto en Categorías',
            description: 'Completa las 4 categorías en una partida',
            icon: 'fa-graduation-cap',
            points: 200,
            condition: (stats) => stats.victories >= 1,
            rarity: 'uncommon'
        }
    ],

    // 🎯 LOGROS DE RACHAS
    rachas: [
        {
            id: 'racha_3',
            name: 'Constancia',
            description: 'Juega 3 días consecutivos',
            icon: 'fa-fire',
            points: 150,
            condition: (stats) => stats.currentStreak >= 3,
            rarity: 'uncommon'
        },
        {
            id: 'racha_7',
            name: 'Dedicación',
            description: 'Juega 7 días consecutivos',
            icon: 'fa-calendar-check',
            points: 300,
            condition: (stats) => stats.currentStreak >= 7,
            rarity: 'rare'
        },
        {
            id: 'racha_30',
            name: 'Discípulo Fiel',
            description: 'Juega 30 días consecutivos',
            icon: 'fa-praying-hands',
            points: 1000,
            condition: (stats) => stats.currentStreak >= 30,
            rarity: 'legendary'
        },
        {
            id: 'respuestas_perfectas',
            name: 'Racha Perfecta',
            description: 'Responde 10 preguntas correctas seguidas',
            icon: 'fa-bullseye',
            points: 200,
            condition: (stats) => stats.maxCorrectStreak >= 10,
            rarity: 'rare'
        }
    ],

    // 🎯 LOGROS ESPECIALES
    especiales: [
        {
            id: 'coleccionista',
            name: 'Coleccionista',
            description: 'Alcanza 1000 monedas',
            icon: 'fa-coins',
            points: 200,
            condition: (stats) => stats.totalCoins >= 1000,
            rarity: 'uncommon'
        },
        {
            id: 'millonario',
            name: 'Millonario Bíblico',
            description: 'Alcanza 10000 monedas',
            icon: 'fa-treasure-chest',
            points: 1000,
            condition: (stats) => stats.totalCoins >= 10000,
            rarity: 'legendary'
        },
        {
            id: 'explorador',
            name: 'Explorador',
            description: 'Visita todas las secciones de la app',
            icon: 'fa-compass',
            points: 100,
            condition: (stats) => stats.sectionsVisited >= 5,
            rarity: 'common'
        },
        {
            id: 'rescatista',
            name: 'Rescatista',
            description: 'Salva 5 partidas con preguntas de rescate',
            icon: 'fa-life-ring',
            points: 250,
            condition: (stats) => stats.rescueSaves >= 5,
            rarity: 'rare'
        }
    ]
};

const RARITY_CONFIG = {
    common: { color: '#95a5a6', bgColor: 'rgba(149, 165, 166, 0.1)', name: 'Común' },
    uncommon: { color: '#27ae60', bgColor: 'rgba(39, 174, 96, 0.1)', name: 'Poco Común' },
    rare: { color: '#3498db', bgColor: 'rgba(52, 152, 219, 0.1)', name: 'Raro' },
    legendary: { color: '#f39c12', bgColor: 'rgba(243, 156, 18, 0.1)', name: 'Legendario' }
};

// ============================================
// VARIABLES GLOBALES
// ============================================

let achievementsData = {
    unlocked: [],
    stats: {
        gamesPlayed: 0,
        victories: 0,
        perfectGames: 0,
        currentStreak: 0,
        maxStreak: 0,
        maxCorrectStreak: 0,
        totalCoins: 0,
        sectionsVisited: 0,
        rescueSaves: 0,
        lastPlayDate: null,
        achievementPoints: 0
    }
};

let elements = {};

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

function init() {
    console.log('🏆 Inicializando sistema de logros...');
    bindElements();
    loadAchievementsData();
    renderAchievements();
    updateStats();
    console.log('✅ Sistema de logros inicializado');
}

function bindElements() {
    elements.achievementsGrid = document.getElementById('achievements-grid');
    elements.totalAchievements = document.getElementById('total-achievements');
    elements.achievementPoints = document.getElementById('achievement-points');
    elements.progressBar = document.getElementById('progress-bar');
    elements.progressPercentage = document.getElementById('progress-percentage');
    elements.filterButtons = document.querySelectorAll('.filter-btn');
    elements.achievementModal = document.getElementById('achievement-modal');
    elements.modalContent = document.querySelector('.achievement-modal-content');
}

function renderAchievements(filter = 'all') {
    if (!elements.achievementsGrid) return;

    console.log(`🔍 Renderizando logros con filtro: ${filter}`);
    
    elements.achievementsGrid.innerHTML = '';
    
    // Obtener todos los logros en una lista plana
    const allAchievements = [];
    Object.keys(ACHIEVEMENTS).forEach(category => {
        ACHIEVEMENTS[category].forEach(achievement => {
            achievement.category = category;
            allAchievements.push(achievement);
        });
    });

    // Filtrar logros
    const filteredAchievements = allAchievements.filter(achievement => {
        if (filter === 'all') return true;
        if (filter === 'unlocked') return achievementsData.unlocked.includes(achievement.id);
        if (filter === 'locked') return !achievementsData.unlocked.includes(achievement.id);
        return achievement.category === filter;
    });

    // Ordenar: desbloqueados primero, luego por puntos
    filteredAchievements.sort((a, b) => {
        const aUnlocked = achievementsData.unlocked.includes(a.id);
        const bUnlocked = achievementsData.unlocked.includes(b.id);
        
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return b.points - a.points;
    });

    // Renderizar logros
    filteredAchievements.forEach(achievement => {
        const achievementCard = createAchievementCard(achievement);
        elements.achievementsGrid.appendChild(achievementCard);
    });

    console.log(`✅ ${filteredAchievements.length} logros renderizados`);
}

function createAchievementCard(achievement) {
    const isUnlocked = achievementsData.unlocked.includes(achievement.id);
    const rarity = RARITY_CONFIG[achievement.rarity];
    
    const card = document.createElement('div');
    card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'} rarity-${achievement.rarity}`;
    
    // Calcular progreso si está bloqueado
    let progressInfo = '';
    if (!isUnlocked) {
        const progress = getAchievementProgress(achievement);
        if (progress.current > 0) {
            const percentage = Math.min((progress.current / progress.total) * 100, 100);
            progressInfo = `
                <div class="achievement-progress">
                    <div class="progress-bar-small">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="progress-text">${progress.current}/${progress.total}</span>
                </div>
            `;
        }
    }

    card.innerHTML = `
        <div class="achievement-icon ${isUnlocked ? '' : 'locked-icon'}" style="color: ${rarity.color}">
            <i class="fas ${achievement.icon}"></i>
        </div>
        <div class="achievement-info">
            <h3 class="achievement-name">${achievement.name}</h3>
            <p class="achievement-description">${achievement.description}</p>
            <div class="achievement-meta">
                <span class="achievement-points">
                    <i class="fas fa-star"></i> ${achievement.points} pts
                </span>
                <span class="achievement-rarity" style="color: ${rarity.color}">
                    ${rarity.name}
                </span>
            </div>
            ${progressInfo}
        </div>
        ${isUnlocked ? '<div class="achievement-unlocked"><i class="fas fa-check"></i></div>' : ''}
    `;

    // Agregar evento click para mostrar detalles
    card.addEventListener('click', () => showAchievementModal(achievement));

    return card;
}

function getAchievementProgress(achievement) {
    const stats = achievementsData.stats;
    
    // Determinar progreso basado en el tipo de logro
    if (achievement.id.includes('partida')) {
        return { current: stats.gamesPlayed, total: getRequiredValue(achievement, 'gamesPlayed') };
    } else if (achievement.id.includes('victoria')) {
        return { current: stats.victories, total: getRequiredValue(achievement, 'victories') };
    } else if (achievement.id.includes('racha')) {
        return { current: stats.currentStreak, total: getRequiredValue(achievement, 'currentStreak') };
    } else if (achievement.id.includes('monedas') || achievement.id.includes('millonario')) {
        return { current: stats.totalCoins, total: getRequiredValue(achievement, 'totalCoins') };
    } else if (achievement.id.includes('rescate')) {
        return { current: stats.rescueSaves, total: getRequiredValue(achievement, 'rescueSaves') };
    } else if (achievement.id.includes('respuestas')) {
        return { current: stats.maxCorrectStreak, total: getRequiredValue(achievement, 'maxCorrectStreak') };
    }
    
    return { current: 0, total: 1 };
}

function getRequiredValue(achievement, statName) {
    // Extraer el valor requerido de la condición
    const conditionStr = achievement.condition.toString();
    const match = conditionStr.match(new RegExp(`${statName}\\s*>=\\s*(\\d+)`));
    return match ? parseInt(match[1]) : 1;
}

function showAchievementModal(achievement) {
    if (!elements.achievementModal) return;

    const isUnlocked = achievementsData.unlocked.includes(achievement.id);
    const rarity = RARITY_CONFIG[achievement.rarity];
    
    let progressContent = '';
    if (!isUnlocked) {
        const progress = getAchievementProgress(achievement);
        const percentage = Math.min((progress.current / progress.total) * 100, 100);
        progressContent = `
            <div class="modal-progress">
                <h4>Progreso</h4>
                <div class="progress-bar-large">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <p>${progress.current} / ${progress.total}</p>
            </div>
        `;
    }

    elements.modalContent.innerHTML = `
        <div class="achievement-modal-header" style="background: ${rarity.bgColor}">
            <div class="modal-icon" style="color: ${rarity.color}">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <h2>${achievement.name}</h2>
            <span class="modal-rarity" style="color: ${rarity.color}">${rarity.name}</span>
        </div>
        <div class="achievement-modal-body">
            <p class="modal-description">${achievement.description}</p>
            <div class="modal-points">
                <i class="fas fa-star"></i> ${achievement.points} puntos
            </div>
            ${progressContent}
            ${isUnlocked ? '<div class="modal-unlocked"><i class="fas fa-check"></i> Logro Desbloqueado</div>' : ''}
        </div>
        <div class="achievement-modal-footer">
            <button onclick="closeAchievementModal()" class="btn">Cerrar</button>
        </div>
    `;

    elements.achievementModal.style.display = 'flex';
}

function updateStats() {
    const totalAchievements = getTotalAchievements();
    const unlockedCount = achievementsData.unlocked.length;
    const percentage = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;
    
    if (elements.totalAchievements) {
        elements.totalAchievements.textContent = `${unlockedCount}/${totalAchievements}`;
    }
    
    if (elements.achievementPoints) {
        elements.achievementPoints.textContent = achievementsData.stats.achievementPoints;
    }
    
    if (elements.progressBar) {
        elements.progressBar.style.width = `${percentage}%`;
    }
    
    if (elements.progressPercentage) {
        elements.progressPercentage.textContent = `${percentage}%`;
    }
}

function getTotalAchievements() {
    let total = 0;
    Object.keys(ACHIEVEMENTS).forEach(category => {
        total += ACHIEVEMENTS[category].length;
    });
    return total;
}

// ============================================
// FUNCIONES GLOBALES PARA EVENTOS
// ============================================

window.filterAchievements = function(filter) {
    // Actualizar botones activos
    elements.filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(filter)) {
            btn.classList.add('active');
        }
    });
    
    renderAchievements(filter);
};

window.closeAchievementModal = function() {
    if (elements.achievementModal) {
        elements.achievementModal.style.display = 'none';
    }
};

// ============================================
// SISTEMA AUTOMÁTICO DE LOGROS
// ============================================

function checkAchievements() {
    console.log('🔍 Verificando logros...');
    
    const newAchievements = [];
    
    // Verificar todos los logros
    Object.keys(ACHIEVEMENTS).forEach(category => {
        ACHIEVEMENTS[category].forEach(achievement => {
            if (!achievementsData.unlocked.includes(achievement.id)) {
                if (achievement.condition(achievementsData.stats)) {
                    unlockAchievement(achievement);
                    newAchievements.push(achievement);
                }
            }
        });
    });
    
    if (newAchievements.length > 0) {
        console.log(`🏆 ${newAchievements.length} nuevos logros desbloqueados!`);
        showAchievementNotifications(newAchievements);
    }
}

function unlockAchievement(achievement) {
    console.log(`🎉 Logro desbloqueado: ${achievement.name}`);
    
    achievementsData.unlocked.push(achievement.id);
    achievementsData.stats.achievementPoints += achievement.points;
    
    saveAchievementsData();
}

function showAchievementNotifications(achievements) {
    achievements.forEach((achievement, index) => {
        setTimeout(() => {
            showAchievementNotification(achievement);
        }, index * 1000);
    });
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notification-content">
            <div class="notification-icon">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <div class="notification-text">
                <h4>¡Logro Desbloqueado!</h4>
                <p>${achievement.name}</p>
                <span>+${achievement.points} puntos</span>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// ============================================
// INTEGRACIÓN CON OTRAS PÁGINAS
// ============================================

function updateGameStats(gameData) {
    console.log('📊 Actualizando estadísticas del juego...');
    
    achievementsData.stats.gamesPlayed++;
    
    if (gameData.victory) {
        achievementsData.stats.victories++;
    }
    
    if (gameData.perfect) {
        achievementsData.stats.perfectGames++;
    }
    
    if (gameData.rescued) {
        achievementsData.stats.rescueSaves++;
    }
    
    if (gameData.coins) {
        achievementsData.stats.totalCoins = Math.max(achievementsData.stats.totalCoins, gameData.coins);
    }
    
    if (gameData.correctStreak) {
        achievementsData.stats.maxCorrectStreak = Math.max(
            achievementsData.stats.maxCorrectStreak, 
            gameData.correctStreak
        );
    }
    
    // Actualizar racha diaria
    updateDailyStreak();
    
    saveAchievementsData();
    checkAchievements();
}

function updateDailyStreak() {
    const today = new Date().toDateString();
    const lastPlay = achievementsData.stats.lastPlayDate;
    
    if (!lastPlay) {
        // Primera vez jugando
        achievementsData.stats.currentStreak = 1;
        achievementsData.stats.maxStreak = 1;
    } else {
        const lastPlayDate = new Date(lastPlay);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastPlayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Jugó ayer, continúa la racha
            achievementsData.stats.currentStreak++;
            achievementsData.stats.maxStreak = Math.max(
                achievementsData.stats.maxStreak,
                achievementsData.stats.currentStreak
            );
        } else if (diffDays > 1) {
            // Se rompió la racha
            achievementsData.stats.currentStreak = 1;
        }
        // Si diffDays === 0, ya jugó hoy, no cambiar racha
    }
    
    achievementsData.stats.lastPlayDate = today;
}

function visitSection(sectionName) {
    const sections = ['home', 'single-player', 'ranking', 'store', 'achievements'];
    const visitedSections = achievementsData.stats.sectionsVisited || 0;
    
    // Incrementar solo si es una nueva sección visitada
    if (visitedSections < sections.length) {
        achievementsData.stats.sectionsVisited = Math.min(visitedSections + 1, sections.length);
        saveAchievementsData();
        checkAchievements();
    }
}

// ============================================
// PERSISTENCIA DE DATOS
// ============================================

function loadAchievementsData() {
    try {
        const savedData = localStorage.getItem('quizCristianoAchievements');
        if (savedData) {
            const loaded = JSON.parse(savedData);
            achievementsData = { ...achievementsData, ...loaded };
            console.log('📄 Datos de logros cargados:', achievementsData);
        }
        
        // También cargar datos del juego principal
        const gameData = localStorage.getItem('quizCristianoData');
        if (gameData) {
            const parsed = JSON.parse(gameData);
            if (parsed.coins) {
                achievementsData.stats.totalCoins = Math.max(
                    achievementsData.stats.totalCoins,
                    parsed.coins
                );
            }
        }
    } catch (error) {
        console.warn('⚠️ Error cargando datos de logros:', error);
    }
}

function saveAchievementsData() {
    try {
        localStorage.setItem('quizCristianoAchievements', JSON.stringify(achievementsData));
        console.log('💾 Datos de logros guardados');
    } catch (error) {
        console.error('❌ Error guardando datos de logros:', error);
    }
}

// ============================================
// FUNCIONES PÚBLICAS PARA INTEGRACIÓN
// ============================================

window.AchievementsSystem = {
    updateGameStats,
    visitSection,
    checkAchievements,
    getStats: () => achievementsData.stats,
    getUnlockedCount: () => achievementsData.unlocked.length,
    getTotalCount: getTotalAchievements
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 DOM cargado, inicializando logros...');
    setTimeout(() => {
        init();
        
        // Marcar que visitó la sección de logros
        visitSection('achievements');
    }, 100);
});

console.log('✅ Logros.js cargado completamente');