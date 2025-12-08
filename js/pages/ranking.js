/**
 * ================================================
 * RANKING POR DIVISIONES - SISTEMA COMPLETO CON TABLAS
 * Quiz Cristiano - Sistema de competencia por divisiones con ascensos/descensos
 * ================================================
 */

// ============================================
// CONFIGURACIÓN DE DIVISIONES ACTUALIZADA
// ============================================

const DIVISION_SYSTEM = {
    divisions: [
        {
            id: 'corona-divina',
            name: 'Corona Divina',
            minLevel: 100,
            maxLevel: Infinity,
            color: '#ffd700',
            gradient: 'linear-gradient(135deg, #ffd700, #ffed4e)',
            icon: 'fa-crown',
            trophyImage: 'assets/images/Trofeos/corona-divina.png',
            description: 'Para leyendas del conocimiento bíblico',
            maxPlayers: 30,
            promotionZone: { start: 1, end: 0 }, // No hay ascenso desde la división más alta
            relegationZone: { start: 26, end: 30 }, // Últimos 5 descienden
            rewards: {
                monthly: { coins: 10000, title: 'Leyenda Bíblica' },
                seasonal: { coins: 25000, avatar: 'legendary_crown' }
            }
        },
        {
            id: 'diamante',
            name: 'División Diamante',
            minLevel: 76,
            maxLevel: 100,
            color: '#b9f2ff',
            gradient: 'linear-gradient(135deg, #b9f2ff, #66d9ef)',
            icon: 'fa-gem',
            trophyImage: 'assets/images/Trofeos/Diamante.png',
            description: 'Para maestros de las Escrituras',
            maxPlayers: 30,
            promotionZone: { start: 1, end: 5 }, // Primeros 5 ascienden
            relegationZone: { start: 26, end: 30 }, // Últimos 5 descienden
            rewards: {
                monthly: { coins: 5000, title: 'Maestro Bíblico' },
                seasonal: { coins: 12000, avatar: 'diamond_scholar' }
            }
        },
        {
            id: 'platino',
            name: 'División Platino',
            minLevel: 51,
            maxLevel: 75,
            color: '#e5e4e2',
            gradient: 'linear-gradient(135deg, #e5e4e2, #c0c0c0)',
            icon: 'fa-medal',
            trophyImage: 'assets/images/Trofeos/Platino.png',
            description: 'Para expertos en conocimiento bíblico',
            maxPlayers: 30,
            promotionZone: { start: 1, end: 5 }, // Primeros 5 ascienden
            relegationZone: { start: 26, end: 30 }, // Últimos 5 descienden (a una división inferior que agregaremos)
            rewards: {
                monthly: { coins: 2500, title: 'Experto Bíblico' },
                seasonal: { coins: 6000, avatar: 'platinum_student' }
            }
        }
    ],
    
    // Configuración del puntaje integral
    scoring: {
        weights: {
            activity: 0.40,      // 40% - Partidas jugadas en el mes
            victories: 0.30,     // 30% - Ratio de victorias
            achievements: 0.20,  // 20% - Logros desbloqueados
            level: 0.10         // 10% - Nivel del jugador
        },
        
        // Factores de normalización
        maxValues: {
            monthlyGames: 100,
            winRate: 1.0,
            maxAchievements: 50,
            maxLevel: 100
        }
    },
    
    // Sistema de temporadas
    season: {
        duration: 30, // días
        resetDay: 1,  // día del mes para reset
        currentSeason: getCurrentSeason()
    }
};

// ============================================
// NOMBRES BÍBLICOS PARA BOTS
// ============================================

const BIBLICAL_NAMES = [
    // Hombres
    'Abraham', 'Isaac', 'Jacob', 'José', 'Moisés', 'Aarón', 'Josué', 'Caleb', 'Samuel', 'David',
    'Salomón', 'Daniel', 'Ezequiel', 'Isaías', 'Jeremías', 'Jonás', 'Elías', 'Eliseo', 'Nehemías', 'Esdras',
    'Pedro', 'Juan', 'Santiago', 'Andrés', 'Felipe', 'Mateo', 'Lucas', 'Marcos', 'Pablo', 'Timoteo',
    
    // Mujeres
    'Sara', 'Rebeca', 'Raquel', 'Lea', 'Miriam', 'Débora', 'Rut', 'Ana', 'Ester', 'Abigail',
    'María', 'Marta', 'María Magdalena', 'Lidia', 'Priscila', 'Dorcas', 'Eunice', 'Lois', 'Febe', 'Junia'
];

const VERSES_LIBRARY = [
    'Juan 3:16', 'Salmos 23:1', 'Filipenses 4:13', 'Proverbios 3:5-6', 'Romanos 8:28',
    'Mateo 11:28', 'Jeremías 29:11', 'Isaías 40:31', '1 Corintios 13:4-7', 'Gálatas 5:22-23',
    'Efesios 6:10-11', 'Hebreos 11:1', 'Santiago 1:2-3', '1 Pedro 5:7', 'Apocalipsis 21:4'
];

// ============================================
// VARIABLES GLOBALES
// ============================================

let rankingData = {
    isInitialized: false,
    currentDivision: null,
    playerScore: 0,
    playerRank: 0,
    currentType: 'integral',
    seasonPlayers: [],
    allDivisions: {},
    isLoading: false,
    selectedPlayer: null
};

// ============================================
// INICIALIZACIÓN
// ============================================

async function init() {
    console.log('Inicializando sistema de ranking por divisiones...');
    
    try {
        await waitForGameDataManager();
        calculatePlayerDivision();
        await loadAllDivisionsData();
        renderDivisionInterface();
        updateAllDisplays();
        
        rankingData.isInitialized = true;
        console.log('Sistema de ranking por divisiones inicializado');
        
    } catch (error) {
        console.error('Error inicializando ranking:', error);
        showFallbackInterface();
    }
}

// ============================================
// GENERACIÓN DE JUGADORES Y DATOS
// ============================================

function generatePlayer(isBot = true, division, position) {
    const baseScore = Math.max(10, 100 - (position * 2) + (Math.random() * 10 - 5));
    
    if (!isBot) {
        // Jugador real - usar datos del perfil
        const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        return {
            id: 'current_player',
            name: profileData.displayName || profileData.username || currentUser.displayName || 'Usuario',
            level: calculatePlayerLevel(window.GameDataManager.getStats()),
            score: rankingData.playerScore,
            avatar: profileData.currentAvatar || getCurrentPlayerAvatar(),
            monthlyGames: getMonthlyData(window.GameDataManager.getStats()).gamesPlayed,
            winRate: getMonthlyData(window.GameDataManager.getStats()).winRate,
            achievements: window.GameDataManager.getStats().achievements?.length || 0,
            favoriteVerse: profileData.favoriteVerse || 'Juan 3:16',
            isBot: false,
            isCurrentPlayer: true,
            joinDate: new Date(2024, 0, 1), // Fecha de registro
            palmares: [] // Se agregará después
        };
    }
    
    // Bot generado
    const name = BIBLICAL_NAMES[Math.floor(Math.random() * BIBLICAL_NAMES.length)];
    const verse = VERSES_LIBRARY[Math.floor(Math.random() * VERSES_LIBRARY.length)];
    const avatar = getRandomAvatar();
    
    // Generar fecha de registro aleatoria (último año)
    const joinDate = new Date();
    joinDate.setDate(joinDate.getDate() - Math.floor(Math.random() * 365));
    
    return {
        id: `bot_${division.id}_${position}_${Date.now()}`,
        name: name,
        level: Math.floor(Math.random() * (division.maxLevel - division.minLevel + 1)) + division.minLevel,
        score: Math.max(1, baseScore),
        avatar: avatar,
        monthlyGames: Math.floor(Math.random() * 80) + 20,
        winRate: Math.random() * 0.6 + 0.3, // 30% - 90%
        achievements: Math.floor(Math.random() * 25) + 5,
        favoriteVerse: verse,
        isBot: true,
        isCurrentPlayer: false,
        joinDate: joinDate,
        palmares: generateBotPalmares() // Historial de medallas del bot
    };
}

function generateBotPalmares() {
    const palmares = [];
    const numMedals = Math.floor(Math.random() * 5); // 0-4 medallas
    
    for (let i = 0; i < numMedals; i++) {
        const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'];
        const positions = [1, 2, 3];
        const divisions = ['platino', 'diamante'];
        
        palmares.push({
            season: months[Math.floor(Math.random() * months.length)],
            division: divisions[Math.floor(Math.random() * divisions.length)],
            position: positions[Math.floor(Math.random() * positions.length)],
            date: new Date(2024, Math.floor(Math.random() * 12), 1)
        });
    }
    
    return palmares;
}

async function loadAllDivisionsData() {
    console.log('Cargando datos de todas las divisiones...');
    
    for (let division of DIVISION_SYSTEM.divisions) {
        rankingData.allDivisions[division.id] = generateDivisionPlayers(division);
    }
    
    // Insertar jugador real en su división correspondiente
    if (rankingData.currentDivision) {
        const divisionPlayers = rankingData.allDivisions[rankingData.currentDivision.id];
        
        // Buscar si ya existe el jugador
        const existingPlayerIndex = divisionPlayers.findIndex(p => p.isCurrentPlayer);
        
        if (existingPlayerIndex !== -1) {
            // Actualizar datos del jugador existente
            divisionPlayers[existingPlayerIndex] = generatePlayer(false, rankingData.currentDivision, existingPlayerIndex + 1);
        } else {
            // Agregar jugador y reemplazar un bot
            const realPlayer = generatePlayer(false, rankingData.currentDivision, 15); // Posición media inicial
            divisionPlayers[14] = realPlayer; // Reemplazar bot en posición 15
        }
        
        // Re-ordenar por puntaje
        divisionPlayers.sort((a, b) => b.score - a.score);
        
        // Actualizar ranking del jugador
        const playerIndex = divisionPlayers.findIndex(p => p.isCurrentPlayer);
        rankingData.playerRank = playerIndex + 1;
    }
    
    console.log('Datos de todas las divisiones cargados');
}

function generateDivisionPlayers(division) {
    const players = [];
    
    for (let i = 0; i < division.maxPlayers; i++) {
        players.push(generatePlayer(true, division, i + 1));
    }
    
    // Ordenar por puntaje
    players.sort((a, b) => b.score - a.score);
    
    return players;
}

// ============================================
// RENDERIZADO DE INTERFAZ ACTUALIZADA
// ============================================

function renderDivisionInterface() {
    const container = document.querySelector('.ranking-container');
    if (!container) return;
    
    container.innerHTML = `
        <!-- Header con división actual -->
        <header class="ranking-header">
            <button class="back-btn" onclick="window.location.href='index.html'">
                <i class="fas fa-arrow-left"></i>
            </button>
            
            <div class="ranking-title">
                <h1>Ranking por Divisiones</h1>
                <p>Temporada ${getCurrentSeason()}</p>
            </div>
            
            <div class="player-coins">
                <i class="fas fa-coins"></i>
                <span id="coins-display">${window.GameDataManager.getCoins()}</span>
            </div>
        </header>

        <!-- Mi División Actual -->
        <section class="my-division-section">
            <div class="division-card" data-division="${rankingData.currentDivision.id}">
                <div class="division-trophy">
                    <img src="${rankingData.currentDivision.trophyImage}" alt="${rankingData.currentDivision.name}">
                </div>
                <div class="division-info">
                    <h2>${rankingData.currentDivision.name}</h2>
                    <p>${rankingData.currentDivision.description}</p>
                    <div class="my-stats">
                        <div class="stat-item">
                            <span class="stat-value">${rankingData.playerScore}</span>
                            <span class="stat-label">Puntos</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">#${rankingData.playerRank || '?'}</span>
                            <span class="stat-label">Posición</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">${getDaysUntilSeasonEnd()}</span>
                            <span class="stat-label">Días restantes</span>
                        </div>
                    </div>
                    <div class="promotion-relegation-info">
                        ${renderPromotionRelegationInfo()}
                    </div>
                </div>
            </div>
        </section>

        <!-- Selector de División -->
        <section class="division-selector">
            <h2><i class="fas fa-layer-group"></i> Ver Division</h2>
            <div class="division-tabs">
                ${DIVISION_SYSTEM.divisions.map(division => `
                    <button class="division-tab ${division.id === rankingData.currentDivision.id ? 'active' : ''}" 
                            onclick="showDivisionTable('${division.id}')">
                        <img src="${division.trophyImage}" alt="${division.name}">
                        <span>${division.name}</span>
                    </button>
                `).join('')}
            </div>
        </section>

        <!-- Tabla de Ranking de División -->
        <section class="division-ranking">
            <div class="ranking-header-section">
                <h2 id="division-ranking-title">Ranking ${rankingData.currentDivision.name}</h2>
                <div class="season-info">
                    <i class="fas fa-calendar"></i>
                    <span>Termina en ${getDaysUntilSeasonEnd()} días</span>
                </div>
            </div>
            
            <!-- Información de Ascensos/Descensos -->
            <div class="promotion-relegation-legend">
                <div class="legend-item promotion">
                    <div class="legend-color"></div>
                    <span>Zona de Ascenso (Top 5)</span>
                </div>
                <div class="legend-item safe">
                    <div class="legend-color"></div>
                    <span>Zona Segura</span>
                </div>
                <div class="legend-item relegation">
                    <div class="legend-color"></div>
                    <span>Zona de Descenso (Últimos 5)</span>
                </div>
            </div>
            
            <!-- Top 3 Podio -->
            <div class="podium-section">
                <div class="podium" id="division-podium">
                    <!-- Se llena dinámicamente -->
                </div>
            </div>
            
            <!-- Tabla completa -->
            <div class="players-table" id="division-players-table">
                <div class="loading-players">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Cargando ranking...</p>
                </div>
            </div>
        </section>

        <!-- Modal de Perfil de Jugador -->
        <div class="player-modal" id="player-modal" style="display: none;">
            <div class="modal-overlay" onclick="closePlayerModal()"></div>
            <div class="player-modal-content">
                <!-- Se llena dinámicamente -->
            </div>
        </div>

        <!-- Bottom Navigation -->
        <nav class="bottom-nav">
            <a href="index.html" class="nav-item">
                <i class="fas fa-home"></i>
                <span>Inicio</span>
            </a>
            <a href="single-player-new.html" class="nav-item">
                <i class="fas fa-play"></i>
                <span>Jugar</span>
            </a>
            <a href="ranking.html" class="nav-item active">
                <i class="fas fa-trophy"></i>
                <span>Ranking</span>
            </a>
            <a href="logros.html" class="nav-item">
                <i class="fas fa-medal"></i>
                <span>Logros</span>
            </a>
            <a href="store.html" class="nav-item">
                <i class="fas fa-store"></i>
                <span>Tienda</span>
            </a>
        </nav>
    `;
    
    // Cargar la tabla de la división actual
    showDivisionTable(rankingData.currentDivision.id);
}

function renderPromotionRelegationInfo() {
    const currentRank = rankingData.playerRank;
    const division = rankingData.currentDivision;
    
    if (currentRank <= 5 && division.promotionZone.end > 0) {
        return `<div class="promotion-info">En zona de ascenso! Manten tu posicion para subir de division.</div>`;
    } else if (currentRank >= 26) {
        return `<div class="relegation-info">En zona de descenso. Mejora tu puntuacion para mantenerte en la division.</div>`;
    } else {
        const toPromotion = Math.max(0, 5 - currentRank + 1);
        const toRelegation = Math.max(0, currentRank - 25);
        return `<div class="safe-info">En zona segura. ${toPromotion > 0 ? `${toPromotion} posiciones para ascenso.` : `${toRelegation} posiciones del descenso.`}</div>`;
    }
}

// ============================================
// FUNCIONES DE TABLA Y NAVEGACIÓN
// ============================================

window.showDivisionTable = function(divisionId) {
    const division = DIVISION_SYSTEM.divisions.find(d => d.id === divisionId);
    const players = rankingData.allDivisions[divisionId];
    
    if (!division || !players) return;
    
    console.log(`Mostrando tabla de ${division.name}`);
    
    // Actualizar tabs activos
    document.querySelectorAll('.division-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[onclick="showDivisionTable('${divisionId}')"]`).classList.add('active');
    
    // Actualizar título
    document.getElementById('division-ranking-title').textContent = `Ranking ${division.name}`;
    
    // Renderizar podio
    renderDivisionPodium(players.slice(0, 3));
    
    // Renderizar tabla completa
    renderPlayersTable(players, division);
};

function renderPlayersTable(players, division) {
    const tableContainer = document.getElementById('division-players-table');
    
    const tableHTML = `
        <div class="players-table-header">
            <div class="pos">Pos</div>
            <div class="player">Jugador</div>
            <div class="stats">Estadísticas</div>
            <div class="points">Puntos</div>
        </div>
        <div class="players-table-body">
            ${players.map((player, index) => {
                const position = index + 1;
                let rowClass = 'player-row';
                
                // Determinar zona
                if (position <= 5 && division.promotionZone.end > 0) {
                    rowClass += ' promotion-zone';
                } else if (position >= 26) {
                    rowClass += ' relegation-zone';
                } else {
                    rowClass += ' safe-zone';
                }
                
                if (player.isCurrentPlayer) {
                    rowClass += ' current-player';
                }
                
                return `
                    <div class="${rowClass}" onclick="showPlayerProfile('${player.id}', '${division.id}')">
                        <div class="player-position">
                            <span class="position-number">${position}</span>
                            ${position <= 3 ? `<i class="fas fa-trophy position-trophy trophy-${position}"></i>` : ''}
                        </div>
                        <div class="player-info">
                            <div class="player-avatar">
                                <img src="${player.avatar}" alt="${player.name}" onerror="this.src='assets/images/fotos-perfil/niña.jpg'">
                                ${player.isBot ? '' : '<div class="real-player-badge"><i class="fas fa-user"></i></div>'}
                            </div>
                            <div class="player-details">
                                <div class="player-name">${player.name}</div>
                                <div class="player-level">Nivel ${player.level}</div>
                            </div>
                        </div>
                        <div class="player-stats">
                            <div class="stat-item">
                                <span class="stat-value">${player.monthlyGames}</span>
                                <span class="stat-label">Partidas</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${Math.round(player.winRate * 100)}%</span>
                                <span class="stat-label">Victorias</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${player.achievements}</span>
                                <span class="stat-label">Logros</span>
                            </div>
                        </div>
                        <div class="player-score">${player.score}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    tableContainer.innerHTML = tableHTML;
}

// ============================================
// MODAL DE PERFIL DE JUGADOR
// ============================================

window.showPlayerProfile = function(playerId, divisionId) {
    const players = rankingData.allDivisions[divisionId];
    const player = players.find(p => p.id === playerId);
    const position = players.findIndex(p => p.id === playerId) + 1;
    
    if (!player) return;
    
    console.log('Mostrando perfil de:', player.name);
    
    const modal = document.getElementById('player-modal');
    const modalContent = modal.querySelector('.player-modal-content');
    
    modalContent.innerHTML = `
        <div class="player-profile-header">
            <button class="modal-close" onclick="closePlayerModal()">
                <i class="fas fa-times"></i>
            </button>
            <div class="player-profile-avatar">
                <img src="${player.avatar}" alt="${player.name}" onerror="this.src='assets/images/fotos-perfil/niña.jpg'">
                ${player.isBot ? '<div class="bot-badge">BOT</div>' : '<div class="real-badge">REAL</div>'}
            </div>
            <div class="player-profile-info">
                <h2>${player.name}</h2>
                <div class="player-position-badge">
                    Posición #${position} en ${DIVISION_SYSTEM.divisions.find(d => d.id === divisionId).name}
                </div>
                <div class="player-level-badge">Nivel ${player.level}</div>
            </div>
        </div>
        
        <div class="player-profile-content">
            <div class="profile-section">
                <h3><i class="fas fa-heart"></i> Versiculo Favorito</h3>
                <div class="favorite-verse">
                    "${player.favoriteVerse}"
                </div>
            </div>
            
            <div class="profile-section">
                <h3><i class="fas fa-chart-bar"></i> Estadisticas</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-gamepad"></i></div>
                        <div class="stat-value">${player.monthlyGames}</div>
                        <div class="stat-label">Partidas este mes</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-trophy"></i></div>
                        <div class="stat-value">${Math.round(player.winRate * 100)}%</div>
                        <div class="stat-label">Tasa de victorias</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-medal"></i></div>
                        <div class="stat-value">${player.achievements}</div>
                        <div class="stat-label">Logros</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon"><i class="fas fa-star"></i></div>
                        <div class="stat-value">${player.score}</div>
                        <div class="stat-label">Puntos</div>
                    </div>
                </div>
            </div>
            
            <div class="profile-section">
                <h3><i class="fas fa-calendar"></i> Informacion General</h3>
                <div class="general-info">
                    <div class="info-item">
                        <span class="info-label">Miembro desde:</span>
                        <span class="info-value">${formatDate(player.joinDate)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Tipo de cuenta:</span>
                        <span class="info-value">${player.isBot ? 'Bot generado' : 'Jugador real'}</span>
                    </div>
                </div>
            </div>
            
            <div class="profile-section">
                <h3><i class="fas fa-crown"></i> Palmares</h3>
                <div class="palmares-section">
                    ${player.palmares && player.palmares.length > 0 ? 
                        player.palmares.map(medal => `
                            <div class="medal-item">
                                <div class="medal-icon position-${medal.position}">
                                    <i class="fas fa-medal"></i>
                                </div>
                                <div class="medal-info">
                                    <div class="medal-title">Puesto ${medal.position} - ${medal.division.charAt(0).toUpperCase() + medal.division.slice(1)}</div>
                                    <div class="medal-date">Temporada ${medal.season}</div>
                                </div>
                            </div>
                        `).join('') :
                        '<div class="no-palmares">Aun no tiene medallas en su palmares.</div>'
                    }
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
};

window.closePlayerModal = function() {
    const modal = document.getElementById('player-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
};

// ============================================
// FUNCIONES DE UTILIDAD ACTUALIZADAS
// ============================================

function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

function calculatePlayerDivision() {
    const gameData = window.GameDataManager.getStats();
    const playerLevel = calculatePlayerLevel(gameData);
    
    console.log('Calculando division para nivel:', playerLevel);
    
    for (let division of DIVISION_SYSTEM.divisions) {
        if (playerLevel >= division.minLevel && playerLevel <= division.maxLevel) {
            rankingData.currentDivision = division;
            break;
        }
    }
    
    if (!rankingData.currentDivision) {
        rankingData.currentDivision = DIVISION_SYSTEM.divisions[DIVISION_SYSTEM.divisions.length - 1];
    }
    
    rankingData.playerScore = calculateIntegralScore(gameData);
    
    console.log(`Jugador en ${rankingData.currentDivision.name} con ${rankingData.playerScore} puntos`);
}

function calculateIntegralScore(gameData) {
    const weights = DIVISION_SYSTEM.scoring.weights;
    const maxValues = DIVISION_SYSTEM.scoring.maxValues;
    
    const monthlyData = getMonthlyData(gameData);
    
    const activityScore = Math.min(monthlyData.gamesPlayed / maxValues.monthlyGames, 1) * 100;
    const victoryScore = monthlyData.winRate * 100;
    const achievementScore = (gameData.achievements?.length || 0) / maxValues.maxAchievements * 100;
    const levelScore = Math.min(calculatePlayerLevel(gameData) / maxValues.maxLevel, 1) * 100;
    
    const finalScore = (
        activityScore * weights.activity +
        victoryScore * weights.victories +
        achievementScore * weights.achievements +
        levelScore * weights.level
    );
    
    return Math.round(finalScore);
}

function getMonthlyData(gameData) {
    const totalGames = gameData.gamesPlayed || 0;
    const victories = gameData.victories || 0;
    
    const monthlyGames = Math.floor(totalGames * 0.3);
    const monthlyVictories = Math.floor(victories * 0.3);
    
    return {
        gamesPlayed: monthlyGames,
        victories: monthlyVictories,
        winRate: monthlyGames > 0 ? monthlyVictories / monthlyGames : 0
    };
}

function calculatePlayerLevel(gameData) {
    const experience = gameData.victories * 100 + gameData.gamesPlayed * 10;
    return Math.floor(experience / 1000) + 1;
}

function renderDivisionPodium(topPlayers) {
    const podium = document.getElementById('division-podium');
    if (!podium || topPlayers.length < 3) return;
    
    podium.innerHTML = `
        <div class="podium-place second">
            <div class="podium-avatar">
                <img src="${topPlayers[1]?.avatar || 'assets/images/fotos-perfil/niña.jpg'}" alt="${topPlayers[1]?.name}">
            </div>
            <div class="podium-info">
                <h3>${topPlayers[1]?.name || 'Usuario'}</h3>
                <p>${topPlayers[1]?.score || 0} pts</p>
            </div>
            <div class="podium-rank">2</div>
        </div>

        <div class="podium-place first">
            <div class="podium-crown">
                <i class="fas fa-crown"></i>
            </div>
            <div class="podium-avatar">
                <img src="${topPlayers[0]?.avatar || 'assets/images/fotos-perfil/niña.jpg'}" alt="${topPlayers[0]?.name}">
            </div>
            <div class="podium-info">
                <h3>${topPlayers[0]?.name || 'Usuario'}</h3>
                <p>${topPlayers[0]?.score || 0} pts</p>
            </div>
            <div class="podium-rank">1</div>
        </div>

        <div class="podium-place third">
            <div class="podium-avatar">
                <img src="${topPlayers[2]?.avatar || 'assets/images/fotos-perfil/niña.jpg'}" alt="${topPlayers[2]?.name}">
            </div>
            <div class="podium-info">
                <h3>${topPlayers[2]?.name || 'Usuario'}</h3>
                <p>${topPlayers[2]?.score || 0} pts</p>
            </div>
            <div class="podium-rank">3</div>
        </div>
    `;
}

function getCurrentSeason() {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
}

function getDaysUntilSeasonEnd() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return Math.ceil((nextMonth - now) / (1000 * 60 * 60 * 24));
}

function getRandomAvatar() {
    const avatars = [
        'assets/images/fotos-perfil/niña.jpg',
        'assets/images/fotos-perfil/niño.jpg',
        'assets/images/fotos-perfil/oveja.jpg',
        'assets/images/fotos-perfil/paloma.jpg'
    ];
    return avatars[Math.floor(Math.random() * avatars.length)];
}

function getCurrentPlayerAvatar() {
    const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
    return profileData.currentAvatar || 'assets/images/fotos-perfil/niña.jpg';
}

function updateAllDisplays() {
    const coinsDisplay = document.getElementById('coins-display');
    if (coinsDisplay && window.GameDataManager) {
        coinsDisplay.textContent = window.GameDataManager.getCoins();
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

function showFallbackInterface() {
    console.log('Mostrando interfaz de fallback...');
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Ranking por divisiones cargando...');
    init();
});

console.log('Ranking por divisiones con tablas cargado completamente');