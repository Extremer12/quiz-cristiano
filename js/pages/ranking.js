/* filepath: js/pages/ranking.js */
/**
 * ================================================
 * RANKING HÍBRIDO - USUARIOS BOT Y REALES
 * Quiz Cristiano - Sistema completo de competencia
 * ================================================
 */

// ============================================
// CONFIGURACIÓN Y VARIABLES GLOBALES
// ============================================

let rankingData = {
    isInitialized: false,
    currentType: 'monedas',
    currentPage: 0,
    maxPlayersPerPage: 20,
    totalPlayers: 0,
    isLoading: false
};

// ✅ USUARIOS BOT REALISTAS CON NOMBRES BÍBLICOS
const BOT_PLAYERS = [
    // Top performers (Posiciones 1-10)
    { name: 'Samuel_El_Profeta', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'master' },
    { name: 'David_Rey_Salmista', avatar: 'assets/images/mascota.png', isBot: true, level: 'master' },
    { name: 'María_De_Betania', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'master' },
    { name: 'Pablo_Apóstol', avatar: 'assets/images/mascota.png', isBot: true, level: 'master' },
    { name: 'Ester_La_Reina', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'master' },
    { name: 'Josué_Conquistador', avatar: 'assets/images/mascota.png', isBot: true, level: 'master' },
    { name: 'Débora_Jueza', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'master' },
    { name: 'Juan_El_Amado', avatar: 'assets/images/mascota.png', isBot: true, level: 'master' },
    { name: 'Rut_La_Fiel', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'master' },
    { name: 'Pedro_Pescador', avatar: 'assets/images/mascota.png', isBot: true, level: 'master' },

    // High performers (Posiciones 11-30)
    { name: 'Abraham_Patriarca', avatar: 'assets/images/mascota.png', isBot: true, level: 'expert' },
    { name: 'Sara_La_Madre', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'expert' },
    { name: 'Moisés_Libertador', avatar: 'assets/images/mascota.png', isBot: true, level: 'expert' },
    { name: 'Miriam_Profetisa', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'expert' },
    { name: 'Caleb_Valiente', avatar: 'assets/images/mascota.png', isBot: true, level: 'expert' },
    { name: 'Ana_Orante', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'expert' },
    { name: 'Elías_Profeta', avatar: 'assets/images/mascota.png', isBot: true, level: 'expert' },
    { name: 'Eliseo_Discípulo', avatar: 'assets/images/mascota.png', isBot: true, level: 'expert' },
    { name: 'Nehemías_Constructor', avatar: 'assets/images/mascota.png', isBot: true, level: 'expert' },
    { name: 'Esdras_Escriba', avatar: 'assets/images/mascota.png', isBot: true, level: 'expert' },
    { name: 'Daniel_Sabio', avatar: 'assets/images/mascota.png', isBot: true, level: 'expert' },
    { name: 'Jeremías_Llorones', avatar: 'assets/images/mascota.png', isBot: true, level: 'expert' },
    { name: 'Ezequiel_Visionario', avatar: 'assets/images/mascota.png', isBot: true, level: 'expert' },
    { name: 'Isaías_Consolador', avatar: 'assets/images/mascota.png', isBot: true, level: 'expert' },
    { name: 'Salomón_Sabio', avatar: 'assets/images/mascota.png', isBot: true, level: 'expert' },
    { name: 'Rebeca_Esposa', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'expert' },
    { name: 'Raquel_Amada', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'expert' },
    { name: 'Lea_Primera', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'expert' },
    { name: 'Tamar_Valiente', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'expert' },
    { name: 'Abigail_Sabia', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'expert' },

    // Mid performers (Posiciones 31-60)
    { name: 'Isaac_Bendecido', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Jacob_Luchador', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'José_Soñador', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Benjamín_Amado', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Judá_León', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Leví_Sacerdote', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Rubén_Primero', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Simeón_Segundo', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Zabulón_Puerto', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Isacar_Fuerte', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Aarón_Hermano', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Gedeón_Guerrero', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Sansón_Fuerte', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Samuel_Juez', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Saúl_Rey', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Jonatán_Amigo', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Absalón_Bello', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Adonías_Rival', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Jeroboam_Norte', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Roboam_Sur', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Asa_Bueno', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Josafat_Justo', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Ezequías_Fiel', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Josías_Reformador', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Zorobabel_Constructor', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Hageo_Profeta', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Zacarías_Vidente', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Malaquías_Último', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Mateo_Cobrador', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },
    { name: 'Marcos_Joven', avatar: 'assets/images/mascota.png', isBot: true, level: 'intermediate' },

    // Lower performers (Posiciones 61-100)
    { name: 'Lucas_Médico', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Santiago_Mayor', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Santiago_Menor', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Andrés_Hermano', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Felipe_Evangelista', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Bartolomé_Fiel', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Tomás_Dudoso', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Judas_Tadeo', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Simón_Zelote', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Matías_Sustituto', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Bernabé_Consolador', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Silas_Compañero', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Timoteo_Joven', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Tito_Colaborador', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Filemón_Amigo', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Onésimo_Esclavo', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Lidia_Comerciante', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'beginner' },
    { name: 'Priscila_Maestra', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'beginner' },
    { name: 'Aquila_Esposo', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Apolos_Elocuente', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Esteban_Mártir', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Felipe_Diácono', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Nicodemo_Fariseo', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'José_Arimatea', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Lázaro_Resucitado', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Marta_Trabajadora', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'beginner' },
    { name: 'Magdalena_Seguidora', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'beginner' },
    { name: 'Juana_Esposa', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'beginner' },
    { name: 'Susana_Discípula', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'beginner' },
    { name: 'Dorcas_Caritativa', avatar: 'assets/images/joy-trofeo.png', isBot: true, level: 'beginner' },
    { name: 'Cornelio_Centurión', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Jairo_Padre', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Zaqueo_Bajo', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Bartimeo_Ciego', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Eneas_Paralítico', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Eutico_Dormido', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Epafrodito_Mensajero', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Epafras_Intercesor', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Gayo_Hospitalario', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' },
    { name: 'Demetrio_Platero', avatar: 'assets/images/mascota.png', isBot: true, level: 'beginner' }
];

// ✅ CONFIGURACIÓN DE PUNTAJES POR NIVEL
const SCORE_RANGES = {
    master: { min: 8000, max: 15000 },
    expert: { min: 4000, max: 7999 },
    intermediate: { min: 1500, max: 3999 },
    beginner: { min: 100, max: 1499 }
};

// ============================================
// INICIALIZACIÓN
// ============================================

async function init() {
    try {
        console.log('🏆 Inicializando sistema de ranking...');
        
        // Esperar a GameDataManager
        await waitForGameDataManager();
        
        // Configurar listeners
        setupGameDataListeners();
        
        // ✅ AGREGAR SINCRONIZACIÓN DE PERFIL
        syncProfileData();
        
        // Cargar ranking por defecto
        await loadRanking('monedas');
        
        // Actualizar posición del usuario
        updateMyPosition();
        
        // Actualizar monedas
        updateCoinsDisplay();
        
        rankingData.isInitialized = true;
        console.log('✅ Sistema de ranking inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando ranking:', error);
    }
}

async function waitForGameDataManager() {
    return new Promise((resolve) => {
        const checkGameDataManager = () => {
            if (window.GameDataManager) {
                console.log('✅ GameDataManager disponible para ranking');
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
    console.log('🔗 Configurando listeners para ranking...');
    
    window.GameDataManager.onCoinsChanged((data) => {
        console.log('💰 Monedas cambiaron, actualizando ranking:', data);
        updateCoinsDisplay();
        updateMyPosition();
    });
    
    window.GameDataManager.onDataChanged((data) => {
        console.log('📊 Datos cambiaron, actualizando posición:', data);
        updateMyPosition();
    });
}

// ============================================
// FUNCIONES PRINCIPALES DE RANKING
// ============================================

async function loadRanking(type) {
    console.log(`📊 Cargando ranking: ${type}`);
    
    rankingData.isLoading = true;
    rankingData.currentType = type;
    rankingData.currentPage = 0;
    
    // Mostrar loading
    showLoadingState();
    
    try {
        // Generar datos híbridos
        const hybridData = generateHybridRanking(type);
        
        // Renderizar podio
        renderPodium(hybridData.slice(0, 3));
        
        // Renderizar lista inicial
        renderPlayersList(hybridData.slice(3, 23)); // Mostrar del 4 al 23
        
        // Actualizar título
        updateRankingTitle(type);
        
        // Actualizar tabs activos
        updateActiveTabs(type);
        
        console.log(`✅ Ranking ${type} cargado con ${hybridData.length} jugadores`);
        
    } catch (error) {
        console.error('❌ Error cargando ranking:', error);
        showErrorState();
    } finally {
        rankingData.isLoading = false;
    }
}

function generateHybridRanking(type) {
    console.log(`🔀 Generando ranking híbrido para: ${type}`);
    
    const allPlayers = [];
    
    // 1. Agregar usuario real (si existe)
    const realUser = generateRealUserData();
    if (realUser) {
        allPlayers.push(realUser);
    }
    
    // 2. Agregar usuarios bot con datos apropiados
    BOT_PLAYERS.forEach((bot, index) => {
        const playerData = generateBotPlayerData(bot, index, type);
        allPlayers.push(playerData);
    });
    
    // 3. Agregar variación aleatoria para realismo
    allPlayers.forEach(player => {
        addRandomVariation(player, type);
    });
    
    // 4. Ordenar por el tipo de ranking
    allPlayers.sort((a, b) => {
        switch (type) {
            case 'monedas':
                return b.coins - a.coins;
            case 'victorias':
                return b.victories - a.victories;
            case 'rachas':
                return b.maxStreak - a.maxStreak;
            case 'semanal':
                return b.weeklyScore - a.weeklyScore;
            default:
                return b.coins - a.coins;
        }
    });
    
    // 5. Asignar posiciones finales
    allPlayers.forEach((player, index) => {
        player.position = index + 1;
    });
    
    console.log(`✅ Ranking híbrido generado con ${allPlayers.length} jugadores`);
    return allPlayers;
}

function generateRealUserData() {
    console.log('👤 Generando datos del usuario real...');
    
    if (!window.GameDataManager) {
        console.warn('⚠️ GameDataManager no disponible');
        return null;
    }
    
    // Obtener datos del usuario actual
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // ✅ OBTENER DATOS DEL PERFIL GUARDADO
    const profileData = JSON.parse(localStorage.getItem('quiz-cristiano-profile') || '{}');
    
    console.log('📊 Datos del usuario:', currentUser);
    console.log('📊 Datos del perfil:', profileData);
    
    // Determinar el nombre a mostrar (prioridad: displayName > username > nombre del currentUser)
    let displayName = 'Jugador';
    
    if (profileData.displayName && profileData.displayName.trim()) {
        displayName = profileData.displayName.trim();
        console.log('✅ Usando displayName del perfil:', displayName);
    } else if (profileData.username && profileData.username.trim()) {
        displayName = profileData.username.trim();
        console.log('✅ Usando username del perfil:', displayName);
    } else if (currentUser.displayName) {
        displayName = currentUser.displayName;
        console.log('✅ Usando displayName del currentUser:', displayName);
    } else if (currentUser.name && currentUser.name !== 'Invitado') {
        displayName = currentUser.name;
        console.log('✅ Usando name del currentUser:', displayName);
    } else {
        displayName = 'Jugador Anónimo';
        console.log('⚠️ Usando nombre por defecto:', displayName);
    }
    
    const stats = window.GameDataManager.getStats();
    const userLevel = calculateUserLevel(stats);
    
    const userData = {
        name: displayName,
        avatar: profileData.currentAvatar || currentUser.photo || getMascotAvatar(),
        isBot: false,
        isCurrentUser: true,
        level: userLevel.name,
        lastActive: 'Ahora',
        
        // Datos según el tipo de ranking
        coins: stats.coins || 0,
        victories: stats.victories || 0,
        streakCount: stats.currentStreak || 0,
        weeklyScore: Math.floor((stats.coins || 0) * 0.1) + ((stats.victories || 0) * 10),
        
        // Metadatos adicionales
        gamesPlayed: stats.gamesPlayed || 0,
        winRate: stats.winRate || 0,
        perfectGames: stats.perfectGames || 0
    };
    
    console.log('✅ Datos del usuario generados:', userData);
    return userData;
}

function generateBotPlayerData(bot, index, type) {
    const level = bot.level;
    const scoreRange = SCORE_RANGES[level];
    
    // Generar puntajes base según el nivel
    const baseCoins = Math.floor(Math.random() * (scoreRange.max - scoreRange.min + 1)) + scoreRange.min;
    const baseVictories = Math.floor(baseCoins / 100) + Math.floor(Math.random() * 10);
    const maxStreak = Math.floor(Math.random() * (level === 'master' ? 20 : level === 'expert' ? 15 : level === 'intermediate' ? 10 : 5)) + 1;
    
    return {
        id: `bot_${index}`,
        name: bot.name,
        avatar: bot.avatar,
        coins: baseCoins,
        victories: baseVictories,
        gamesPlayed: baseVictories + Math.floor(Math.random() * 5),
        maxStreak: maxStreak,
        weeklyScore: baseCoins * 0.2 + baseVictories * 30 + Math.floor(Math.random() * 500),
        isReal: false,
        isBot: true,
        level: level,
        lastActive: generateRandomLastActive()
    };
}

function addRandomVariation(player, type) {
    // Agregar variación aleatoria del 5-15% para realismo
    const variation = 0.05 + Math.random() * 0.1; // 5-15%
    
    switch (type) {
        case 'monedas':
            player.coins += Math.floor(player.coins * (Math.random() > 0.5 ? variation : -variation));
            break;
        case 'victorias':
            player.victorias += Math.floor(Math.random() * 3) - 1; // -1, 0, +1
            break;
        case 'rachas':
            player.maxStreak += Math.floor(Math.random() * 3) - 1;
            break;
        case 'semanal':
            player.weeklyScore += Math.floor(player.weeklyScore * (Math.random() > 0.5 ? variation : -variation));
            break;
    }
    
    // Asegurar valores mínimos
    player.coins = Math.max(0, player.coins);
    player.victorias = Math.max(0, player.victorias);
    player.maxStreak = Math.max(1, player.maxStreak);
    player.weeklyScore = Math.max(0, player.weeklyScore);
}

// ============================================
// RENDERIZADO
// ============================================

function renderPodium(topThree) {
    console.log('🏆 Renderizando podio top 3');
    
    if (topThree.length >= 1) {
        renderPodiumPlace(1, topThree[0]);
    }
    if (topThree.length >= 2) {
        renderPodiumPlace(2, topThree[1]);
    }
    if (topThree.length >= 3) {
        renderPodiumPlace(3, topThree[2]);
    }
}

function renderPodiumPlace(position, player) {
    const podiumElement = document.getElementById(`podium-${position}`);
    if (!podiumElement) return;
    
    const avatarImg = podiumElement.querySelector('img');
    const nameElement = podiumElement.querySelector('h3');
    const scoreElement = podiumElement.querySelector('p');
    
    if (avatarImg) {
        avatarImg.src = player.avatar;
        avatarImg.alt = player.name;
    }
    
    if (nameElement) {
        nameElement.textContent = truncateName(player.name, 12);
    }
    
    if (scoreElement) {
        scoreElement.textContent = getScoreDisplay(player, rankingData.currentType);
    }
    
    // Agregar indicador de usuario real
    if (player.isReal) {
        podiumElement.classList.add('current-user');
    } else {
        podiumElement.classList.remove('current-user');
    }
}

function renderPlayersList(players) {
    const playersListElement = document.getElementById('players-list');
    if (!playersListElement) return;
    
    playersListElement.innerHTML = '';
    
    players.forEach(player => {
        const playerElement = createPlayerElement(player);
        playersListElement.appendChild(playerElement);
    });
    
    // Actualizar botón de cargar más
    updateLoadMoreButton(players.length);
}

function createPlayerElement(player) {
    const div = document.createElement('div');
    div.className = `player-item ${player.isReal ? 'current-user' : ''} ${player.isBot ? '' : 'verified'}`;
    div.onclick = () => showPlayerModal(player);
    
    div.innerHTML = `
        <div class="player-rank ${player.position <= 3 ? 'top3' : ''}">
            #${player.position}
        </div>
        
        <img src="${player.avatar}" alt="${player.name}" class="player-avatar-small">
        
        <div class="player-info">
            <div class="player-name">${truncateName(player.name, 15)}</div>
            <div class="player-stats-small">
                ${player.victorias} victorias • ${player.gamesPlayed} partidas
            </div>
        </div>
        
        <div class="player-score">
            ${getScoreDisplay(player, rankingData.currentType)}
        </div>
        
        <div class="player-badge">
            <i class="fas ${player.isReal ? 'fa-user' : player.level === 'master' ? 'fa-crown' : player.level === 'expert' ? 'fa-star' : 'fa-user-circle'}"></i>
        </div>
    `;
    
    return div;
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function getCurrentUserName() {
    // ✅ PRIORIDAD: perfil > currentUser > fallback
    
    // 1. Intentar obtener del perfil guardado
    try {
        const profileData = JSON.parse(localStorage.getItem('quiz-cristiano-profile') || '{}');
        if (profileData.displayName && profileData.displayName.trim()) {
            console.log('📝 Nombre obtenido del perfil (displayName):', profileData.displayName);
            return profileData.displayName.trim();
        }
        if (profileData.username && profileData.username.trim()) {
            console.log('📝 Nombre obtenido del perfil (username):', profileData.username);
            return profileData.username.trim();
        }
    } catch (error) {
        console.warn('⚠️ Error obteniendo nombre del perfil:', error);
    }
    
    // 2. Intentar obtener del currentUser
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.displayName && currentUser.displayName !== 'Invitado') {
            console.log('📝 Nombre obtenido del currentUser (displayName):', currentUser.displayName);
            return currentUser.displayName;
        }
        if (currentUser.name && currentUser.name !== 'Invitado') {
            console.log('📝 Nombre obtenido del currentUser (name):', currentUser.name);
            return currentUser.name;
        }
    } catch (error) {
        console.warn('⚠️ Error obteniendo nombre del currentUser:', error);
    }
    
    // 3. Fallback
    console.log('📝 Usando nombre por defecto');
    return 'Jugador Anónimo';
}

function getMascotAvatar() {
    // Verificar si tiene corona desbloqueada
    const hasCorona = localStorage.getItem('joy-corona-unlocked') === 'true';
    return hasCorona ? 'assets/images/joy-corona.png' : 'assets/images/joy-trofeo.png';
}

function calculateUserLevel(stats) {
    const totalScore = stats.coins + (stats.victories * 100);
    
    if (totalScore >= 8000) return 'master';
    if (totalScore >= 4000) return 'expert';
    if (totalScore >= 1500) return 'intermediate';
    return 'beginner';
}

function generateRandomLastActive() {
    const options = [
        'Hace 5 min', 'Hace 15 min', 'Hace 30 min', 'Hace 1 hora',
        'Hace 2 horas', 'Hace 1 día', 'Hace 2 días', 'Hace 1 semana'
    ];
    return options[Math.floor(Math.random() * options.length)];
}

function getScoreDisplay(player, type) {
    switch (type) {
        case 'monedas':
            return `${player.coins.toLocaleString()}`;
        case 'victorias':
            return `${player.victorias}`;
        case 'rachas':
            return `${player.maxStreak}`;
        case 'semanal':
            return `${Math.floor(player.weeklyScore).toLocaleString()}`;
        default:
            return `${player.coins.toLocaleString()}`;
    }
}

function truncateName(name, maxLength) {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength - 3) + '...';
}

// ============================================
// ACTUALIZACIONES DE UI
// ============================================

function updateMyPosition() {
    console.log('📍 Actualizando mi posición en el ranking...');
    
    // Obtener nombre actualizado
    const myName = getCurrentUserName();
    
    // Actualizar elementos de "Mi Posición"
    const myNameElement = document.getElementById('my-name');
    const myPositionElement = document.getElementById('my-position');
    const myScoreElement = document.getElementById('my-score');
    const myAvatarElement = document.getElementById('my-avatar');
    
    if (myNameElement) {
        myNameElement.textContent = myName;
        console.log('✅ Nombre actualizado en mi posición:', myName);
    }
    
    if (myPositionElement) {
        // Buscar la posición del usuario en el ranking actual
        const userPosition = findUserPositionInRanking(myName);
        myPositionElement.textContent = userPosition ? `#${userPosition}` : '#???';
    }
    
    if (myScoreElement && window.GameDataManager) {
        const stats = window.GameDataManager.getStats();
        const scoreText = getScoreDisplay({ 
            coins: stats.coins, 
            victories: stats.victories, 
            streakCount: stats.currentStreak 
        }, rankingData.currentType);
        myScoreElement.textContent = scoreText;
    }
    
    if (myAvatarElement) {
        const profileData = JSON.parse(localStorage.getItem('quiz-cristiano-profile') || '{}');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const avatarSrc = profileData.currentAvatar || currentUser.photo || getMascotAvatar();
        myAvatarElement.src = avatarSrc;
    }
}

function findUserPositionInRanking(userName) {
    // Buscar en el ranking actual la posición del usuario
    const playersList = document.querySelectorAll('.player-item');
    for (let i = 0; i < playersList.length; i++) {
        const playerName = playersList[i].querySelector('.player-name')?.textContent;
        if (playerName === userName) {
            return i + 4; // +4 porque los primeros 3 están en el podio
        }
    }
    return null;
}

function updateCoinsDisplay() {
    if (!window.GameDataManager) return;
    
    const coinsElements = document.querySelectorAll('#coins-display');
    const currentCoins = window.GameDataManager.getCoins();
    
    coinsElements.forEach(element => {
        if (element) {
            element.textContent = currentCoins.toLocaleString();
        }
    });
}

function updateRankingTitle(type) {
    const titleElement = document.getElementById('ranking-type-title');
    if (!titleElement) return;
    
    const titles = {
        monedas: 'Ranking de Monedas',
        victorias: 'Ranking de Victorias', 
        rachas: 'Ranking de Rachas',
        semanal: 'Ranking Semanal'
    };
    
    titleElement.textContent = titles[type] || 'Ranking';
}

function updateActiveTabs(type) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        if (tab.dataset.tab === type) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

function updateLoadMoreButton(playersShown) {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!loadMoreBtn) return;
    
    if (playersShown >= 20) {
        loadMoreBtn.style.display = 'inline-flex';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// ============================================
// ESTADOS DE CARGA Y ERROR
// ============================================

function showLoadingState() {
    const playersListElement = document.getElementById('players-list');
    if (!playersListElement) return;
    
    playersListElement.innerHTML = `
        <div class="loading-players">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Cargando ranking...</p>
        </div>
    `;
}

function showErrorState() {
    const playersListElement = document.getElementById('players-list');
    if (!playersListElement) return;
    
    playersListElement.innerHTML = `
        <div class="empty-ranking">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Error cargando ranking</h3>
            <p>No se pudo cargar el ranking. Intenta de nuevo.</p>
            <button onclick="loadRanking('${rankingData.currentType}')" class="btn-retry">
                <i class="fas fa-redo"></i> Reintentar
            </button>
        </div>
    `;
}

// ============================================
// MODAL DE JUGADOR
// ============================================

function showPlayerModal(player) {
    console.log('👤 Mostrando modal del jugador:', player.name);
    
    const modal = document.getElementById('player-modal');
    const modalPlayerName = document.getElementById('modal-player-name');
    const modalPlayerProfile = document.getElementById('modal-player-profile');
    
    if (!modal || !modalPlayerProfile) return;
    
    if (modalPlayerName) {
        modalPlayerName.textContent = player.name;
    }
    
    modalPlayerProfile.innerHTML = `
        <div class="player-profile-header">
            <img src="${player.avatar}" alt="${player.name}" class="profile-avatar">
            <div class="profile-info">
                <h3>${player.name}</h3>
                <span class="profile-level ${player.level}">${getLevelName(player.level)}</span>
                <span class="profile-status">${player.isReal ? 'Usuario Real' : 'Bot'}</span>
            </div>
        </div>
        
        <div class="player-stats-detailed">
            <div class="stat-row">
                <span class="stat-label">Posición:</span>
                <span class="stat-value">#${player.position}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Monedas:</span>
                <span class="stat-value">${player.coins.toLocaleString()}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Victorias:</span>
                <span class="stat-value">${player.victorias}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Partidas Jugadas:</span>
                <span class="stat-value">${player.gamesPlayed}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Mejor Racha:</span>
                <span class="stat-value">${player.maxStreak}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Última Actividad:</span>
                <span class="stat-value">${player.lastActive}</span>
            </div>
        </div>
        
        ${player.isReal ? '' : `
            <div class="bot-disclaimer">
                <i class="fas fa-robot"></i>
                <p>Este es un jugador generado automáticamente para poblar el ranking.</p>
            </div>
        `}
    `;
    
    modal.style.display = 'flex';
}

function getLevelName(level) {
    const levels = {
        master: 'Maestro',
        expert: 'Experto',
        intermediate: 'Intermedio',
        beginner: 'Principiante'
    };
    return levels[level] || 'Jugador';
}

// ============================================
// FUNCIONES GLOBALES PARA EL HTML
// ============================================

window.switchToRanking = function(type) {
    console.log(`🔄 Cambiando a ranking: ${type}`);
    loadRanking(type);
};

window.refreshCurrentRanking = function() {
    console.log('🔄 Refrescando ranking actual');
    
    // Animación del botón
    const refreshBtn = document.querySelector('.refresh-btn i');
    if (refreshBtn) {
        refreshBtn.style.animation = 'spin 1s linear';
        setTimeout(() => {
            refreshBtn.style.animation = '';
        }, 1000);
    }
    
    loadRanking(rankingData.currentType);
};

window.loadMorePlayersData = function() {
    console.log('📄 Cargando más jugadores...');
    
    // Generar más datos
    const moreData = generateHybridRanking(rankingData.currentType);
    const startIndex = 23 + (rankingData.currentPage * 20);
    const endIndex = startIndex + 20;
    const newPlayers = moreData.slice(startIndex, endIndex);
    
    if (newPlayers.length > 0) {
        const playersListElement = document.getElementById('players-list');
        newPlayers.forEach(player => {
            const playerElement = createPlayerElement(player);
            playersListElement.appendChild(playerElement);
        });
        
        rankingData.currentPage++;
        updateLoadMoreButton(newPlayers.length);
    } else {
        // No hay más jugadores
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<i class="fas fa-check"></i> <span>No hay más jugadores</span>';
            loadMoreBtn.disabled = true;
        }
    }
};

// ✅ FUNCIÓN PARA SINCRONIZAR DATOS DEL PERFIL
function syncProfileData() {
    console.log('🔄 Sincronizando datos del perfil con ranking...');
    
    // Escuchar cambios en el perfil
    window.addEventListener('storage', (e) => {
        if (e.key === 'quiz-cristiano-profile') {
            console.log('📝 Perfil actualizado, recargando ranking...');
            updateMyPosition();
            
            // Recargar ranking para reflejar el nuevo nombre
            setTimeout(() => {
                loadRanking(rankingData.currentType);
            }, 500);
        }
    });
    
    // También escuchar cambios desde la misma pestaña
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
        const result = originalSetItem.apply(this, arguments);
        if (key === 'quiz-cristiano-profile') {
            console.log('📝 Perfil actualizado en la misma pestaña');
            setTimeout(() => {
                updateMyPosition();
                loadRanking(rankingData.currentType);
            }, 100);
        }
        return result;
    };
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
    console.log('🏆 Ranking HTML cargado, inicializando...');
    init();
});

// Debug para desarrollo
window.RankingDebug = {
    data: rankingData,
    bots: BOT_PLAYERS,
    generateHybrid: generateHybridRanking,
    getGameDataManager: () => window.GameDataManager
};

console.log('✅ Ranking.js HÍBRIDO cargado completamente');