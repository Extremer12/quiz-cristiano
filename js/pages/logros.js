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
    // 🎯 LOGROS DE INICIACIÓN (8 logros)
    iniciacion: [
        {
            id: 'bienvenido',
            name: 'Bienvenido',
            description: 'Completa el tutorial del juego',
            icon: 'fa-hand-wave',
            points: 25,
            condition: (stats) => stats.tutorialCompleted,
            rarity: 'common'
        },
        {
            id: 'primera_partida',
            name: 'Primer Paso',
            description: 'Juega tu primera partida',
            icon: 'fa-baby-carriage',
            points: 50,
            condition: (stats) => stats.gamesPlayed >= 1,
            rarity: 'common'
        },
        {
            id: 'primera_respuesta_correcta',
            name: 'Luz en la Oscuridad',
            description: 'Responde tu primera pregunta correctamente',
            icon: 'fa-lightbulb',
            points: 25,
            condition: (stats) => stats.totalCorrectAnswers >= 1,
            rarity: 'common'
        },
        {
            id: 'primer_power_up',
            name: 'Poder Divino',
            description: 'Usa tu primer power-up',
            icon: 'fa-bolt',
            points: 50,
            condition: (stats) => stats.powerUpsUsed >= 1,
            rarity: 'common'
        },
        {
            id: 'primera_categoria',
            name: 'Especialista Novato',
            description: 'Completa tu primera categoría',
            icon: 'fa-bookmark',
            points: 75,
            condition: (stats) => stats.categoriesCompleted >= 1,
            rarity: 'common'
        },
        {
            id: 'primeras_monedas',
            name: 'Primer Tesoro',
            description: 'Gana tus primeras 100 monedas',
            icon: 'fa-coins',
            points: 50,
            condition: (stats) => stats.totalCoins >= 100,
            rarity: 'common'
        },
        {
            id: 'primer_avatar',
            name: 'Nueva Identidad',
            description: 'Cambia tu avatar por primera vez',
            icon: 'fa-user-circle',
            points: 50,
            condition: (stats) => stats.avatarChanges >= 1,
            rarity: 'common'
        },
        {
            id: 'explorador_principiante',
            name: 'Explorador Curioso',
            description: 'Visita todas las secciones de la app',
            icon: 'fa-map',
            points: 100,
            condition: (stats) => stats.sectionsVisited >= 5,
            rarity: 'common'
        }
    ],

    // 🎯 LOGROS DE PROGRESO (12 logros)
    progreso: [
        {
            id: 'aprendiz',
            name: 'Aprendiz Dedicado',
            description: 'Juega 5 partidas',
            icon: 'fa-graduation-cap',
            points: 75,
            condition: (stats) => stats.gamesPlayed >= 5,
            rarity: 'common'
        },
        {
            id: 'estudiante',
            name: 'Estudiante Aplicado',
            description: 'Juega 15 partidas',
            icon: 'fa-book-open',
            points: 150,
            condition: (stats) => stats.gamesPlayed >= 15,
            rarity: 'uncommon'
        },
        {
            id: 'veterano',
            name: 'Veterano Bíblico',
            description: 'Juega 50 partidas',
            icon: 'fa-medal',
            points: 300,
            condition: (stats) => stats.gamesPlayed >= 50,
            rarity: 'uncommon'
        },
        {
            id: 'maestro',
            name: 'Maestro de la Palabra',
            description: 'Juega 100 partidas',
            icon: 'fa-crown',
            points: 500,
            condition: (stats) => stats.gamesPlayed >= 100,
            rarity: 'rare'
        },
        {
            id: 'sabio',
            name: 'Sabio Milenario',
            description: 'Juega 250 partidas',
            icon: 'fa-scroll',
            points: 1000,
            condition: (stats) => stats.gamesPlayed >= 250,
            rarity: 'rare'
        },
        {
            id: 'leyenda',
            name: 'Leyenda Viviente',
            description: 'Juega 500 partidas',
            icon: 'fa-star',
            points: 2000,
            condition: (stats) => stats.gamesPlayed >= 500,
            rarity: 'legendary'
        },
        {
            id: 'respuestas_correctas_50',
            name: 'Conocedor',
            description: 'Responde 50 preguntas correctamente',
            icon: 'fa-check-circle',
            points: 150,
            condition: (stats) => stats.totalCorrectAnswers >= 50,
            rarity: 'uncommon'
        },
        {
            id: 'respuestas_correctas_200',
            name: 'Erudito',
            description: 'Responde 200 preguntas correctamente',
            icon: 'fa-brain',
            points: 400,
            condition: (stats) => stats.totalCorrectAnswers >= 200,
            rarity: 'rare'
        },
        {
            id: 'respuestas_correctas_500',
            name: 'Enciclopedia Viviente',
            description: 'Responde 500 preguntas correctamente',
            icon: 'fa-book',
            points: 800,
            condition: (stats) => stats.totalCorrectAnswers >= 500,
            rarity: 'rare'
        },
        {
            id: 'respuestas_correctas_1000',
            name: 'Oráculo Bíblico',
            description: 'Responde 1000 preguntas correctamente',
            icon: 'fa-eye',
            points: 1500,
            condition: (stats) => stats.totalCorrectAnswers >= 1000,
            rarity: 'legendary'
        },
        {
            id: 'tiempo_jugado_1h',
            name: 'Una Hora de Sabiduría',
            description: 'Juega durante 1 hora total',
            icon: 'fa-clock',
            points: 200,
            condition: (stats) => stats.totalPlayTime >= 3600,
            rarity: 'uncommon'
        },
        {
            id: 'tiempo_jugado_10h',
            name: 'Dedicación Completa',
            description: 'Juega durante 10 horas total',
            icon: 'fa-hourglass-half',
            points: 800,
            condition: (stats) => stats.totalPlayTime >= 36000,
            rarity: 'rare'
        }
    ],

    // 🎯 LOGROS DE MAESTRÍA (10 logros)
    maestria: [
        {
            id: 'primera_victoria',
            name: 'Primera Victoria',
            description: 'Gana tu primera partida completa',
            icon: 'fa-trophy',
            points: 100,
            condition: (stats) => stats.victories >= 1,
            rarity: 'common'
        },
        {
            id: 'cinco_victorias',
            name: 'Campeón Emergente',
            description: 'Gana 5 partidas',
            icon: 'fa-award',
            points: 250,
            condition: (stats) => stats.victories >= 5,
            rarity: 'uncommon'
        },
        {
            id: 'perfeccionista',
            name: 'Perfección Divina',
            description: 'Completa una partida sin errores',
            icon: 'fa-gem',
            points: 400,
            condition: (stats) => stats.perfectGames >= 1,
            rarity: 'rare'
        },
        {
            id: 'cinco_perfectas',
            name: 'Maestro Perfecto',
            description: 'Completa 5 partidas perfectas',
            icon: 'fa-diamond',
            points: 1000,
            condition: (stats) => stats.perfectGames >= 5,
            rarity: 'legendary'
        },
        {
            id: 'todas_categorias',
            name: 'Conocedor Universal',
            description: 'Completa las 4 categorías en una partida',
            icon: 'fa-puzzle-piece',
            points: 300,
            condition: (stats) => stats.allCategoriesInOneGame >= 1,
            rarity: 'uncommon'
        },
        {
            id: 'velocidad_record',
            name: 'Rayo de Conocimiento',
            description: 'Completa una partida en menos de 5 minutos',
            icon: 'fa-tachometer-alt',
            points: 350,
            condition: (stats) => stats.fastestGameTime <= 300,
            rarity: 'rare'
        },
        {
            id: 'sin_power_ups',
            name: 'Purista',
            description: 'Gana una partida sin usar power-ups',
            icon: 'fa-shield-alt',
            points: 400,
            condition: (stats) => stats.winsWithoutPowerUps >= 1,
            rarity: 'rare'
        },
        {
            id: 'rescate_maestro',
            name: 'Ángel Guardián',
            description: 'Salva 10 partidas con preguntas de rescate',
            icon: 'fa-angel',
            points: 500,
            condition: (stats) => stats.rescueSaves >= 10,
            rarity: 'rare'
        },
        {
            id: 'accuracy_95',
            name: 'Precisión Divina',
            description: 'Mantén 95% de precisión en 10 partidas',
            icon: 'fa-bullseye',
            points: 600,
            condition: (stats) => stats.highAccuracyGames >= 10,
            rarity: 'rare'
        },
        {
            id: 'categoria_master',
            name: 'Maestro de Categoría',
            description: 'Completa 50 preguntas de una misma categoría',
            icon: 'fa-chess-king',
            points: 400,
            condition: (stats) => stats.maxCategoryAnswers >= 50,
            rarity: 'uncommon'
        }
    ],

    // 🎯 LOGROS DE RACHAS (8 logros)
    rachas: [
        {
            id: 'racha_respuestas_5',
            name: 'Inspiración',
            description: 'Responde 5 preguntas correctas seguidas',
            icon: 'fa-fire',
            points: 100,
            condition: (stats) => stats.maxCorrectStreak >= 5,
            rarity: 'common'
        },
        {
            id: 'racha_respuestas_10',
            name: 'Momento Brillante',
            description: 'Responde 10 preguntas correctas seguidas',
            icon: 'fa-flame',
            points: 250,
            condition: (stats) => stats.maxCorrectStreak >= 10,
            rarity: 'uncommon'
        },
        {
            id: 'racha_respuestas_20',
            name: 'Racha Dorada',
            description: 'Responde 20 preguntas correctas seguidas',
            icon: 'fa-burn',
            points: 500,
            condition: (stats) => stats.maxCorrectStreak >= 20,
            rarity: 'rare'
        },
        {
            id: 'racha_diaria_3',
            name: 'Constancia',
            description: 'Juega 3 días consecutivos',
            icon: 'fa-calendar-day',
            points: 150,
            condition: (stats) => stats.currentStreak >= 3,
            rarity: 'uncommon'
        },
        {
            id: 'racha_diaria_7',
            name: 'Semana Sagrada',
            description: 'Juega 7 días consecutivos',
            icon: 'fa-calendar-week',
            points: 400,
            condition: (stats) => stats.currentStreak >= 7,
            rarity: 'rare'
        },
        {
            id: 'racha_diaria_30',
            name: 'Discípulo Fiel',
            description: 'Juega 30 días consecutivos',
            icon: 'fa-praying-hands',
            points: 1500,
            condition: (stats) => stats.currentStreak >= 30,
            rarity: 'legendary'
        },
        {
            id: 'victorias_seguidas_3',
            name: 'Tres en Raya',
            description: 'Gana 3 partidas seguidas',
            icon: 'fa-chevron-up',
            points: 300,
            condition: (stats) => stats.maxWinStreak >= 3,
            rarity: 'uncommon'
        },
        {
            id: 'victorias_seguidas_10',
            name: 'Imparable',
            description: 'Gana 10 partidas seguidas',
            icon: 'fa-rocket',
            points: 1000,
            condition: (stats) => stats.maxWinStreak >= 10,
            rarity: 'legendary'
        }
    ],

    // 🎯 LOGROS DE COLECCIÓN (7 logros)
    coleccion: [
        {
            id: 'collector_basic',
            name: 'Recolector',
            description: 'Acumula 500 monedas',
            icon: 'fa-piggy-bank',
            points: 100,
            condition: (stats) => stats.totalCoins >= 500,
            rarity: 'common'
        },
        {
            id: 'collector_advanced',
            name: 'Tesorero',
            description: 'Acumula 2,000 monedas',
            icon: 'fa-treasure-chest',
            points: 300,
            condition: (stats) => stats.totalCoins >= 2000,
            rarity: 'uncommon'
        },
        {
            id: 'millonario',
            name: 'Millonario Bíblico',
            description: 'Acumula 10,000 monedas',
            icon: 'fa-crown',
            points: 1500,
            condition: (stats) => stats.totalCoins >= 10000,
            rarity: 'legendary'
        },
        {
            id: 'avatar_collector',
            name: 'Coleccionista de Rostros',
            description: 'Desbloquea 5 avatares diferentes',
            icon: 'fa-masks-theater',
            points: 400,
            condition: (stats) => stats.avatarsUnlocked >= 5,
            rarity: 'uncommon'
        },
        {
            id: 'power_up_master',
            name: 'Maestro de Poderes',
            description: 'Usa 50 power-ups',
            icon: 'fa-magic',
            points: 350,
            condition: (stats) => stats.powerUpsUsed >= 50,
            rarity: 'uncommon'
        },
        {
            id: 'compras_premium',
            name: 'Benefactor',
            description: 'Realiza tu primera compra premium',
            icon: 'fa-shopping-cart',
            points: 500,
            condition: (stats) => stats.premiumPurchases >= 1,
            rarity: 'rare'
        },
        {
            id: 'consumidor_vip',
            name: 'Cliente VIP',
            description: 'Realiza 10 compras en la tienda',
            icon: 'fa-vip',
            points: 800,
            condition: (stats) => stats.storePurchases >= 10,
            rarity: 'rare'
        }
    ],

    // 🎯 LOGROS ESPECIALES/SECRETOS (5 logros)
    especiales: [
        {
            id: 'medianoche',
            name: 'Búho Nocturno',
            description: 'Juega una partida después de medianoche',
            icon: 'fa-moon',
            points: 200,
            condition: (stats) => stats.midnightGames >= 1,
            rarity: 'uncommon',
            secret: true
        },
        {
            id: 'madrugador',
            name: 'Madrugador Devoto',
            description: 'Juega una partida antes de las 6 AM',
            icon: 'fa-sun',
            points: 200,
            condition: (stats) => stats.earlyMorningGames >= 1,
            rarity: 'uncommon',
            secret: true
        },
        {
            id: 'dia_especial',
            name: 'Domingo de Gloria',
            description: 'Juega en domingo',
            icon: 'fa-church',
            points: 150,
            condition: (stats) => stats.sundayGames >= 1,
            rarity: 'uncommon'
        },
        {
            id: 'error_cero',
            name: 'Infalible',
            description: 'Logro secreto: Completa 100 preguntas sin error',
            icon: 'fa-shield-check',
            points: 1000,
            condition: (stats) => stats.maxCorrectStreak >= 100,
            rarity: 'legendary',
            secret: true
        },
        {
            id: 'velocista_extremo',
            name: 'Rayo Sagrado',
            description: 'Logro secreto: Completa una partida en menos de 2 minutos',
            icon: 'fa-bolt',
            points: 800,
            condition: (stats) => stats.fastestGameTime <= 120,
            rarity: 'legendary',
            secret: true
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

// 📊 TRACKING DE ESTADÍSTICAS EXPANDIDO
function updateExpandedGameStats(gameData) {
    const stats = achievementsData.stats;
    
    // Estadísticas básicas
    stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
    stats.totalCorrectAnswers = (stats.totalCorrectAnswers || 0) + gameData.correctAnswers;
    stats.totalPlayTime = (stats.totalPlayTime || 0) + gameData.playTime;
    
    // Nuevas estadísticas
    if (gameData.victory) stats.victories = (stats.victories || 0) + 1;
    if (gameData.perfect) stats.perfectGames = (stats.perfectGames || 0) + 1;
    if (gameData.allCategories) stats.allCategoriesInOneGame = (stats.allCategoriesInOneGame || 0) + 1;
    if (gameData.withoutPowerUps && gameData.victory) stats.winsWithoutPowerUps = (stats.winsWithoutPowerUps || 0) + 1;
    
    // Tiempo y velocidad
    if (!stats.fastestGameTime || gameData.playTime < stats.fastestGameTime) {
        stats.fastestGameTime = gameData.playTime;
    }
    
    // Precisión
    const accuracy = (gameData.correctAnswers / gameData.totalQuestions) * 100;
    if (accuracy >= 95) {
        stats.highAccuracyGames = (stats.highAccuracyGames || 0) + 1;
    }
    
    // Horas especiales
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) stats.earlyMorningGames = (stats.earlyMorningGames || 0) + 1;
    if (hour >= 23 || hour < 1) stats.midnightGames = (stats.midnightGames || 0) + 1;
    
    // Día especial
    const day = new Date().getDay();
    if (day === 0) stats.sundayGames = (stats.sundayGames || 0) + 1;
    
    // Rachas
    updateStreaks(gameData);
    
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

