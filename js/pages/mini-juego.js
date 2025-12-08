/**
 * ================================================
 * MINI-JUEGO JOY JAVASCRIPT - SISTEMA COMPLETO
 * Quiz Cristiano - Joy's Bible Study
 * ================================================
 */

// ============================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================

const MINI_GAME_CONFIG = {
    studyTimeMinimum: 30, // 30 segundos mínimo de estudio
    repechageTime: 30, // 30 segundos para pregunta de repechaje
    coinRewards: {
        studyComplete: 50,
        questionCorrect: 25,
        repechageSuccess: 75,
        levelUp: 100,
        streakBonus: 20
    },
    levelUpRequirement: 3, // Estudios necesarios para subir de nivel
    maxStreak: 365 // Máximo de días de racha
};

// ✅ VERSÍCULOS PARA ESTUDIO CON PREGUNTAS
const STUDY_VERSES = [
    {
        reference: "Juan 3:16",
        text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
        question: {
            text: "Según este versículo, ¿qué nos muestra el amor de Dios?",
            options: [
                "Su generosidad al dar a su Hijo",
                "Su poder sobre todas las cosas", 
                "Su sabiduría infinita",
                "Su justicia perfecta"
            ],
            correctIndex: 0
        }
    },
    {
        reference: "Salmos 23:1",
        text: "Jehová es mi pastor; nada me faltará.",
        question: {
            text: "¿Qué nos asegura este versículo cuando Dios es nuestro pastor?",
            options: [
                "Que seremos ricos",
                "Que nada nos faltará",
                "Que no tendremos problemas",
                "Que siempre estaremos felices"
            ],
            correctIndex: 1
        }
    },
    {
        reference: "Filipenses 4:13",
        text: "Todo lo puedo en Cristo que me fortalece.",
        question: {
            text: "¿Cuál es la fuente de nuestra fortaleza según Pablo?",
            options: [
                "Nuestro esfuerzo personal",
                "La ayuda de otros",
                "Cristo que nos fortalece",
                "Nuestra experiencia"
            ],
            correctIndex: 2
        }
    },
    {
        reference: "Proverbios 3:5-6",
        text: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.",
        question: {
            text: "¿En qué debemos apoyarnos según este proverbio?",
            options: [
                "En nuestra propia prudencia",
                "En Jehová de todo corazón",
                "En la experiencia de otros",
                "En nuestros conocimientos"
            ],
            correctIndex: 1
        }
    },
    {
        reference: "Romanos 8:28",
        text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.",
        question: {
            text: "¿A quiénes les ayudan todas las cosas a bien?",
            options: [
                "A todos sin excepción",
                "A los que aman a Dios",
                "A los que trabajan duro",
                "A los que son buenos"
            ],
            correctIndex: 1
        }
    },
    {
        reference: "Mateo 11:28",
        text: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.",
        question: {
            text: "¿A quiénes invita Jesús a venir a él?",
            options: [
                "Solo a los perfectos",
                "A los trabajados y cargados",
                "Solo a los pecadores",
                "A los que no tienen problemas"
            ],
            correctIndex: 1
        }
    }
];

// ✅ ATUENDOS PARA JOY
const JOY_OUTFITS = [
    {
        id: 'original',
        name: 'Joy Original',
        src: 'assets/images/mascota.png',
        unlocked: true,
        unlockCondition: null
    },
    {
        id: 'festejo',
        name: 'Joy Festejo',
        src: 'assets/images/joy-festejo.png',
        unlocked: true,
        unlockCondition: null
    },
    {
        id: 'consolando',
        name: 'Joy Consolando',
        src: 'assets/images/joy-consolando.png',
        unlocked: true,
        unlockCondition: null
    },
    {
        id: 'trofeo',
        name: 'Joy Trofeo',
        src: 'assets/images/joy-trofeo.png',
        unlocked: true,
        unlockCondition: null
    },
    {
        id: 'corona',
        name: 'Joy Corona',
        src: 'assets/images/joy-corona.png',
        unlocked: false,
        unlockCondition: 'Nivel 10'
    },
    {
        id: 'angel',
        name: 'Joy Ángel',
        src: 'assets/images/joy-angel.png',
        unlocked: false,
        unlockCondition: 'Racha de 30 días'
    }
];

// ============================================
// VARIABLES GLOBALES DEL ESTADO
// ============================================

let miniGameState = {
    // Estado de la sesión
    currentPhase: 'welcome', // welcome, study, question, results
    isActive: false,
    
    // Datos de Joy
    joyLevel: 1,
    joyExperience: 0,
    currentOutfit: 'original',
    
    // Progreso del jugador
    studyStreak: 0,
    totalStudies: 0,
    lastStudyDate: null,
    
    // Estudio actual
    currentVerse: null,
    studyStartTime: 0,
    studyCompleted: false,
    questionAnswered: false,
    
    // Timer
    studyTimer: null,
    remainingTime: 0,
    
    // Personalización
    customizationOpen: false
};

let gameElements = {};

// ============================================
// INICIALIZACIÓN
// ============================================

async function init() {
    console.log('🎮 Iniciando Mini-juego Joy...');
    
    try {
        // Esperar a que GameDataManager esté disponible
        await waitForGameDataManager();
        
        // Vincular elementos del DOM
        bindElements();
        
        // Cargar datos guardados
        loadSavedData();
        
        // Configurar listeners
        setupEventListeners();
        
        // Actualizar displays
        updateAllDisplays();
        
        // Configurar mensaje inicial de Joy
        setupInitialJoyMessage();
        
        console.log('✅ Mini-juego Joy inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando mini-juego:', error);
        showErrorMessage('Error al cargar el juego');
    }
}

async function waitForGameDataManager() {
    return new Promise((resolve) => {
        if (window.GameDataManager && window.GameDataManager.getCoins) {
            resolve();
        } else {
            setTimeout(() => waitForGameDataManager().then(resolve), 100);
        }
    });
}

function bindElements() {
    gameElements = {
        // Secciones principales
        joySection: document.getElementById('joy-section'),
        studySection: document.getElementById('study-section'),
        questionSection: document.getElementById('question-section'),
        resultsSection: document.getElementById('results-section'),
        
        // Joy y progreso
        joyLevel: document.getElementById('joy-level'),
        joyLevelIndicator: document.getElementById('joy-level-indicator'),
        studyStreak: document.getElementById('study-streak'),
        joyAvatar: document.getElementById('joy-avatar'),
        joyMessage: document.getElementById('joy-message'),
        
        // Estudio
        verseReference: document.getElementById('verse-reference'),
        verseText: document.getElementById('verse-text'),
        timerDisplay: document.getElementById('timer-display'),
        completeStudyBtn: document.getElementById('complete-study-btn'),
        
        // Preguntas
        questionText: document.getElementById('question-text'),
        answersContainer: document.getElementById('answers-container'),
        
        // Resultados
        resultIcon: document.getElementById('result-icon'),
        resultTitle: document.getElementById('result-title'),
        resultDescription: document.getElementById('result-description'),
        rewardsInfo: document.getElementById('rewards-info'),
        newLevel: document.getElementById('new-level'),
        newStreak: document.getElementById('new-streak'),
        
        // Personalización
        customizationModal: document.getElementById('customization-modal'),
        outfitsGrid: document.getElementById('outfits-grid')
    };
    
    console.log('🔗 Elementos del DOM vinculados');
}

function setupEventListeners() {
    // Listener para cambios de GameDataManager
    if (window.GameDataManager) {
        window.GameDataManager.onCoinsChanged(() => {
            updateAllDisplays();
        });
    }
    
    // Cerrar modal al hacer clic fuera
    if (gameElements.customizationModal) {
        gameElements.customizationModal.addEventListener('click', (e) => {
            if (e.target === gameElements.customizationModal) {
                closeCustomization();
            }
        });
    }
    
    console.log('👂 Event listeners configurados');
}

// ============================================
// GESTIÓN DE DATOS
// ============================================

function loadSavedData() {
    try {
        const savedData = localStorage.getItem('joy-mini-game-data');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            miniGameState.joyLevel = data.joyLevel || 1;
            miniGameState.joyExperience = data.joyExperience || 0;
            miniGameState.currentOutfit = data.currentOutfit || 'original';
            miniGameState.studyStreak = data.studyStreak || 0;
            miniGameState.totalStudies = data.totalStudies || 0;
            miniGameState.lastStudyDate = data.lastStudyDate || null;
            
            // Verificar si se rompió la racha
            checkStreakContinuity();
        }
        
        console.log('💾 Datos cargados:', miniGameState);
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
    }
}

function saveGameData() {
    try {
        const dataToSave = {
            joyLevel: miniGameState.joyLevel,
            joyExperience: miniGameState.joyExperience,
            currentOutfit: miniGameState.currentOutfit,
            studyStreak: miniGameState.studyStreak,
            totalStudies: miniGameState.totalStudies,
            lastStudyDate: miniGameState.lastStudyDate,
            version: '1.0.0'
        };
        
        localStorage.setItem('joy-mini-game-data', JSON.stringify(dataToSave));
        console.log('💾 Datos guardados exitosamente');
    } catch (error) {
        console.error('❌ Error guardando datos:', error);
    }
}

function checkStreakContinuity() {
    if (!miniGameState.lastStudyDate) return;
    
    const lastStudy = new Date(miniGameState.lastStudyDate);
    const today = new Date();
    const daysDifference = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
    
    if (daysDifference > 1) {
        // Se rompió la racha
        miniGameState.studyStreak = 0;
        console.log('📅 Racha reiniciada por inactividad');
    }
}

// ============================================
// FUNCIONES PRINCIPALES DE JUEGO
// ============================================

window.interactWithJoy = function() {
    console.log('👋 Interactuando con Joy');
    
    const messages = [
        "¡Hola! ¿Listos para estudiar juntos?",
        "La Palabra de Dios es una lámpara para nuestros pies",
        "¡Cada día es una nueva oportunidad para crecer en fe!",
        "¿Sabías que estudiar la Biblia me hace muy feliz?",
        "¡Qué bueno verte de nuevo! ¿Empezamos?",
        "Recuerda: 'Lámpara es a mis pies tu palabra'",
        "¡Tu constancia en el estudio me llena de alegría!"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    if (gameElements.joyMessage) {
        gameElements.joyMessage.textContent = randomMessage;
        
        // Animación de Joy
        if (gameElements.joyAvatar) {
            gameElements.joyAvatar.style.transform = 'scale(1.1)';
            setTimeout(() => {
                gameElements.joyAvatar.style.transform = 'scale(1)';
            }, 200);
        }
    }
};

window.startDailyStudy = function() {
    console.log('📖 Iniciando estudio diario');
    
    // Verificar si ya estudió hoy
    const today = new Date().toDateString();
    const lastStudy = miniGameState.lastStudyDate ? new Date(miniGameState.lastStudyDate).toDateString() : null;
    
    if (today === lastStudy) {
        showNotification('¡Ya completaste tu estudio de hoy! Vuelve mañana para continuar tu racha.', 'info');
        return;
    }
    
    // Seleccionar versículo aleatorio
    miniGameState.currentVerse = STUDY_VERSES[Math.floor(Math.random() * STUDY_VERSES.length)];
    
    // Cambiar a fase de estudio
    miniGameState.currentPhase = 'study';
    miniGameState.studyCompleted = false;
    miniGameState.questionAnswered = false;
    
    // Actualizar UI
    showStudySection();
    loadCurrentVerse();
    startStudyTimer();
};

function showStudySection() {
    // Ocultar sección de Joy
    if (gameElements.joySection) {
        gameElements.joySection.style.display = 'none';
    }
    
    // Mostrar sección de estudio
    if (gameElements.studySection) {
        gameElements.studySection.classList.add('active');
    }
}

function loadCurrentVerse() {
    if (!miniGameState.currentVerse) return;
    
    // Actualizar referencia
    if (gameElements.verseReference) {
        gameElements.verseReference.textContent = miniGameState.currentVerse.reference;
    }
    
    // Actualizar texto del versículo
    if (gameElements.verseText) {
        gameElements.verseText.textContent = `"${miniGameState.currentVerse.text}"`;
    }
    
    console.log('📜 Versículo cargado:', miniGameState.currentVerse.reference);
}

function startStudyTimer() {
    miniGameState.remainingTime = MINI_GAME_CONFIG.studyTimeMinimum;
    miniGameState.studyStartTime = Date.now();
    
    // Deshabilitar botón de completar
    if (gameElements.completeStudyBtn) {
        gameElements.completeStudyBtn.disabled = true;
        gameElements.completeStudyBtn.innerHTML = '<i class="fas fa-clock"></i><span>Estudiando...</span>';
    }
    
    // Iniciar countdown
    miniGameState.studyTimer = setInterval(() => {
        miniGameState.remainingTime--;
        updateTimerDisplay();
        
        if (miniGameState.remainingTime <= 0) {
            completeStudyTimer();
        }
    }, 1000);
    
    console.log('⏰ Timer de estudio iniciado');
}

function updateTimerDisplay() {
    if (gameElements.timerDisplay) {
        const minutes = Math.floor(miniGameState.remainingTime / 60);
        const seconds = miniGameState.remainingTime % 60;
        gameElements.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function completeStudyTimer() {
    clearInterval(miniGameState.studyTimer);
    
    // Habilitar botón de completar
    if (gameElements.completeStudyBtn) {
        gameElements.completeStudyBtn.disabled = false;
        gameElements.completeStudyBtn.innerHTML = '<i class="fas fa-check"></i><span>Continuar con la Pregunta</span>';
    }
    
    // Mostrar mensaje de completado
    if (gameElements.timerDisplay) {
        gameElements.timerDisplay.textContent = '¡Listo!';
    }
    
    console.log('✅ Tiempo de estudio completado');
}

window.completeStudy = function() {
    console.log('✅ Estudio completado por el usuario');
    
    if (miniGameState.remainingTime > 0) {
        showNotification('Por favor, tómate el tiempo necesario para estudiar el versículo.', 'warning');
        return;
    }
    
    miniGameState.studyCompleted = true;
    
    // Cambiar a sección de pregunta
    showQuestionSection();
    loadQuestion();
};

function showQuestionSection() {
    // Ocultar sección de estudio
    if (gameElements.studySection) {
        gameElements.studySection.classList.remove('active');
    }
    
    // Mostrar sección de pregunta
    if (gameElements.questionSection) {
        gameElements.questionSection.classList.add('active');
    }
}

function loadQuestion() {
    if (!miniGameState.currentVerse || !miniGameState.currentVerse.question) return;
    
    const question = miniGameState.currentVerse.question;
    
    // Actualizar texto de pregunta
    if (gameElements.questionText) {
        gameElements.questionText.textContent = question.text;
    }
    
    // Generar opciones de respuesta
    if (gameElements.answersContainer) {
        gameElements.answersContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.onclick = () => selectAnswer(index);
            
            button.innerHTML = `
                <div class="answer-letter">${String.fromCharCode(65 + index)}</div>
                <div class="answer-text">${option}</div>
            `;
            
            gameElements.answersContainer.appendChild(button);
        });
    }
    
    console.log('❓ Pregunta cargada');
}

function selectAnswer(selectedIndex) {
    if (miniGameState.questionAnswered) return;
    
    miniGameState.questionAnswered = true;
    const question = miniGameState.currentVerse.question;
    const isCorrect = selectedIndex === question.correctIndex;
    
    // Marcar respuestas
    const buttons = gameElements.answersContainer.querySelectorAll('.answer-btn');
    buttons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === question.correctIndex) {
            btn.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });
    
    // Mostrar resultados después de un delay
    setTimeout(() => {
        showResults(isCorrect);
    }, 2000);
    
    console.log(`🎯 Respuesta ${isCorrect ? 'correcta' : 'incorrecta'}`);
}

function showResults(isCorrect) {
    // Ocultar sección de pregunta
    if (gameElements.questionSection) {
        gameElements.questionSection.classList.remove('active');
    }
    
    // Mostrar sección de resultados
    if (gameElements.resultsSection) {
        gameElements.resultsSection.classList.add('active');
    }
    
    // Actualizar datos del juego
    updateGameProgress(isCorrect);
    
    // Configurar UI de resultados
    setupResultsUI(isCorrect);
}

function updateGameProgress(isCorrect) {
    // Actualizar racha y estadísticas
    const today = new Date().toDateString();
    const lastStudy = miniGameState.lastStudyDate ? new Date(miniGameState.lastStudyDate).toDateString() : null;
    
    if (today !== lastStudy) {
        // Es un nuevo día de estudio
        miniGameState.studyStreak++;
        miniGameState.totalStudies++;
        miniGameState.lastStudyDate = new Date().toISOString();
    }
    
    // Calcular recompensas
    let coinsEarned = MINI_GAME_CONFIG.coinRewards.studyComplete;
    
    if (isCorrect) {
        coinsEarned += MINI_GAME_CONFIG.coinRewards.questionCorrect;
    }
    
    // Bonus por racha
    if (miniGameState.studyStreak >= 7) {
        coinsEarned += MINI_GAME_CONFIG.coinRewards.streakBonus;
    }
    
    // Verificar subida de nivel
    const oldLevel = miniGameState.joyLevel;
    checkLevelUp();
    
    if (miniGameState.joyLevel > oldLevel) {
        coinsEarned += MINI_GAME_CONFIG.coinRewards.levelUp;
    }
    
    // Agregar monedas a GameDataManager
    if (window.GameDataManager) {
        window.GameDataManager.addCoins(coinsEarned, 'joy_study');
    }
    
    // Guardar datos
    saveGameData();
    
    console.log(`💰 Recompensas: ${coinsEarned} monedas`);
}

function checkLevelUp() {
    const requiredStudies = miniGameState.joyLevel * MINI_GAME_CONFIG.levelUpRequirement;
    
    if (miniGameState.totalStudies >= requiredStudies) {
        miniGameState.joyLevel++;
        miniGameState.joyExperience = 0;
        
        // Desbloquear atuendos por nivel
        unlockOutfitsByLevel();
        
        console.log(`🎉 ¡Joy subió al nivel ${miniGameState.joyLevel}!`);
    }
}

function unlockOutfitsByLevel() {
    // Lógica para desbloquear atuendos según el nivel
    if (miniGameState.joyLevel >= 10) {
        // Desbloquear corona
        const savedOutfits = JSON.parse(localStorage.getItem('joy-unlocked-outfits') || '[]');
        if (!savedOutfits.includes('corona')) {
            savedOutfits.push('corona');
            localStorage.setItem('joy-unlocked-outfits', JSON.stringify(savedOutfits));
            showNotification('¡Nuevo atuendo desbloqueado: Joy Corona!', 'achievement');
        }
    }
}

function setupResultsUI(isCorrect) {
    if (isCorrect) {
        // Respuesta correcta
        if (gameElements.resultIcon) {
            gameElements.resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';
            gameElements.resultIcon.className = 'result-icon success';
        }
        
        if (gameElements.resultTitle) {
            gameElements.resultTitle.textContent = '¡Excelente trabajo!';
        }
        
        if (gameElements.resultDescription) {
            gameElements.resultDescription.textContent = 'Has completado tu estudio diario correctamente. Joy está muy orgullosa de ti.';
        }
    } else {
        // Respuesta incorrecta
        if (gameElements.resultIcon) {
            gameElements.resultIcon.innerHTML = '<i class="fas fa-heart"></i>';
            gameElements.resultIcon.className = 'result-icon failure';
        }
        
        if (gameElements.resultTitle) {
            gameElements.resultTitle.textContent = '¡Sigue estudiando!';
        }
        
        if (gameElements.resultDescription) {
            gameElements.resultDescription.textContent = 'Joy te anima a seguir estudiando la Palabra. ¡La próxima vez lo harás mejor!';
        }
    }
    
    // Actualizar información de recompensas
    updateRewardsInfo();
}

function updateRewardsInfo() {
    if (gameElements.newLevel) {
        gameElements.newLevel.textContent = miniGameState.joyLevel;
    }
    
    if (gameElements.newStreak) {
        gameElements.newStreak.textContent = miniGameState.studyStreak;
    }
}

// ============================================
// SISTEMA DE PERSONALIZACIÓN
// ============================================

window.openCustomization = function() {
    console.log('🎨 Abriendo personalización de Joy');
    
    miniGameState.customizationOpen = true;
    
    // Mostrar modal
    if (gameElements.customizationModal) {
        gameElements.customizationModal.classList.add('active');
    }
    
    // Cargar atuendos
    loadOutfits();
};

window.closeCustomization = function() {
    console.log('🎨 Cerrando personalización');
    
    miniGameState.customizationOpen = false;
    
    if (gameElements.customizationModal) {
        gameElements.customizationModal.classList.remove('active');
    }
};

function loadOutfits() {
    if (!gameElements.outfitsGrid) return;
    
    const unlockedOutfits = JSON.parse(localStorage.getItem('joy-unlocked-outfits') || '[]');
    
    gameElements.outfitsGrid.innerHTML = '';
    
    JOY_OUTFITS.forEach(outfit => {
        const isUnlocked = outfit.unlocked || unlockedOutfits.includes(outfit.id);
        const isSelected = outfit.id === miniGameState.currentOutfit;
        
        const div = document.createElement('div');
        div.className = `outfit-option ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
        
        if (isUnlocked) {
            div.onclick = () => selectOutfit(outfit);
        }
        
        div.innerHTML = `
            <img src="${outfit.src}" alt="${outfit.name}" class="outfit-preview">
            <div class="outfit-name">${outfit.name}</div>
            ${!isUnlocked ? `<div class="outfit-unlock">${outfit.unlockCondition}</div>` : ''}
        `;
        
        gameElements.outfitsGrid.appendChild(div);
    });
}

function selectOutfit(outfit) {
    console.log(`👗 Outfit seleccionado: ${outfit.name}`);
    
    // Actualizar outfit actual
    miniGameState.currentOutfit = outfit.id;
    
    // Actualizar avatar en la interfaz
    if (gameElements.joyAvatar) {
        gameElements.joyAvatar.src = outfit.src;
    }
    
    // Guardar cambios
    saveGameData();
    
    // Actualizar selección visual
    loadOutfits();
    
    showNotification(`¡Joy ahora lleva el atuendo ${outfit.name}!`, 'success');
}

window.saveCustomization = function() {
    console.log('💾 Guardando personalización');
    saveGameData();
    closeCustomization();
    showNotification('¡Personalización guardada!', 'success');
};

// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================

window.studyAgain = function() {
    console.log('🔄 Estudiando otro versículo');
    
    // Resetear estado
    miniGameState.currentPhase = 'welcome';
    miniGameState.studyCompleted = false;
    miniGameState.questionAnswered = false;
    miniGameState.currentVerse = null;
    
    // Ocultar resultados
    if (gameElements.resultsSection) {
        gameElements.resultsSection.classList.remove('active');
    }
    
    // Mostrar sección principal
    if (gameElements.joySection) {
        gameElements.joySection.style.display = 'block';
    }
    
    // Actualizar displays
    updateAllDisplays();
};

window.returnToMenu = function() {
    window.location.href = 'index.html';
};

// ============================================
// FUNCIONES DE ACTUALIZACIÓN DE UI
// ============================================

function updateAllDisplays() {
    updateJoyLevel();
    updateStudyStreak();
    updateJoyAvatar();
}

function updateJoyLevel() {
    if (gameElements.joyLevel) {
        gameElements.joyLevel.textContent = miniGameState.joyLevel;
    }
    
    if (gameElements.joyLevelIndicator) {
        gameElements.joyLevelIndicator.textContent = `Nivel ${miniGameState.joyLevel}`;
    }
}

function updateStudyStreak() {
    if (gameElements.studyStreak) {
        gameElements.studyStreak.textContent = miniGameState.studyStreak;
    }
}

function updateJoyAvatar() {
    const currentOutfit = JOY_OUTFITS.find(o => o.id === miniGameState.currentOutfit);
    if (currentOutfit && gameElements.joyAvatar) {
        gameElements.joyAvatar.src = currentOutfit.src;
    }
}

function setupInitialJoyMessage() {
    const welcomeMessages = [
        "¡Hola! Soy Joy y estoy aquí para ayudarte a estudiar la Biblia.",
        "¡Bienvenido a nuestro tiempo de estudio bíblico!",
        "¿Estás listo para crecer en sabiduría y conocimiento?",
        "¡Qué alegría tenerte aquí para estudiar la Palabra de Dios!"
    ];
    
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    if (gameElements.joyMessage) {
        gameElements.joyMessage.textContent = randomMessage;
    }
}

// ============================================
// UTILIDADES
// ============================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
        achievement: 'fa-trophy'
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
    
    // Colores por tipo
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db',
        achievement: '#ffd700'
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

function showErrorMessage(message) {
    console.error('Error en mini-juego:', message);
    showNotification(`Error: ${message}`, 'error');
}

// ============================================
// INICIALIZACIÓN DEL MÓDULO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Mini-juego Joy DOM cargado');
    
    // Verificar elementos críticos
    const criticalElements = [
        'joy-section', 'study-section', 'question-section', 'results-section',
        'joy-level', 'study-streak', 'joy-avatar', 'joy-message'
    ];
    
    let missingElements = [];
    criticalElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            missingElements.push(id);
        }
        console.log(`${element ? 'OK' : 'ERROR'} Elemento ${id}:`, !!element);
    });
    
    if (missingElements.length > 0) {
        console.warn('⚠️ Elementos faltantes:', missingElements);
    }
    
    // Inicializar después de un breve delay
    setTimeout(() => {
        init();
    }, 500);
});

// ============================================
// FUNCIONES DE DEBUG
// ============================================

window.debugMiniGame = function() {
    console.log('🔍 Estado del mini-juego:', miniGameState);
    console.log('🎮 Elementos:', gameElements);
    console.log('📖 Versículos disponibles:', STUDY_VERSES.length);
    console.log('👗 Atuendos disponibles:', JOY_OUTFITS.length);
};

window.resetMiniGame = function() {
    localStorage.removeItem('joy-mini-game-data');
    localStorage.removeItem('joy-unlocked-outfits');
    console.log('🗑️ Datos del mini-juego eliminados. Recarga la página.');
};

window.forceLevel = function(level) {
    miniGameState.joyLevel = level;
    saveGameData();
    updateAllDisplays();
    console.log(`🎮 Joy forzado al nivel ${level}`);
};

// Exponer funciones para debug
window.MiniGameDebug = {
    state: miniGameState,
    config: MINI_GAME_CONFIG,
    verses: STUDY_VERSES,
    outfits: JOY_OUTFITS,
    debugMiniGame,
    resetMiniGame,
    forceLevel
};

console.log('Mini-juego Joy JavaScript cargado completamente');