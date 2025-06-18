/**
 * ================================================
 * SINGLE PLAYER GAME - VERSIÓN COMPLETA Y FUNCIONAL
 * Quiz Cristiano - Código completo con todas las funciones
 * ================================================
 */

// ============================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================

const CATEGORIES = [
    { id: 'antiguo-testamento', name: 'Antiguo Testamento', icon: 'fa-book', color: '#8E44AD' },
    { id: 'nuevo-testamento', name: 'Nuevo Testamento', icon: 'fa-cross', color: '#3498DB' },
    { id: 'personajes-biblicos', name: 'Personajes Bíblicos', icon: 'fa-user', color: '#E67E22' },
    { id: 'doctrina-cristiana', name: 'Doctrina Cristiana', icon: 'fa-pray', color: '#9B59B6' }
];

const COIN_REWARDS = {
    categoryCorrect: 8,
    categoryComplete: 25,
    rescueSuccess: 15,
    gameComplete: 100,
    perfectGame: 150,
    speedBonus: 10,
    wrongAnswer: -2,
    timeoutPenalty: -1
};

const INITIAL_QUESTIONS = [
    {
        text: "¿Cuántos días estuvo Jesús en el desierto siendo tentado?",
        options: ["30 días", "40 días", "50 días", "60 días"],
        correctIndex: 1,
        reference: "Mateo 4:2"
    },
    {
        text: "¿Quién escribió el libro de Apocalipsis?",
        options: ["Pedro", "Pablo", "Juan", "Lucas"],
        correctIndex: 2,
        reference: "Apocalipsis 1:1"
    },
    {
        text: "¿Cuál fue el primer milagro de Jesús?",
        options: ["Multiplicar panes", "Caminar sobre agua", "Convertir agua en vino", "Sanar un ciego"],
        correctIndex: 2,
        reference: "Juan 2:11"
    },
    {
        text: "¿Cuántos apóstoles eligió Jesús?",
        options: ["10", "12", "14", "16"],
        correctIndex: 1,
        reference: "Mateo 10:1-4"
    },
    {
        text: "¿En qué ciudad nació Jesús?",
        options: ["Nazaret", "Jerusalén", "Belén", "Capernaum"],
        correctIndex: 2,
        reference: "Lucas 2:4"
    },
    {
        text: "¿Quién construyó el arca?",
        options: ["Noé", "Abraham", "Moisés", "David"],
        correctIndex: 0,
        reference: "Génesis 6:14"
    },
    {
        text: "¿Cuántos libros tiene el Nuevo Testamento?",
        options: ["25", "27", "29", "31"],
        correctIndex: 1,
        reference: "Canon bíblico"
    },
    {
        text: "¿Quién fue vendido por sus hermanos como esclavo?",
        options: ["José", "Benjamín", "Judá", "Rubén"],
        correctIndex: 0,
        reference: "Génesis 37:28"
    }
];

// ============================================
// VARIABLES GLOBALES DEL JUEGO
// ============================================

let gameState = {
    phase: 'welcome',
    currentQuestionIndex: 0,
    initialCorrectAnswers: 0,
    completedCategories: [],
    pendingCategories: [...CATEGORIES],
    currentCategory: '',
    categoryQuestions: [],
    categoryQuestionIndex: 0,
    categoryCorrectAnswers: 0,
    needsRescueQuestion: false,
    currentQuestion: null,
    isProcessingAnswer: false,
    timer: 20,
    timerInterval: null,
    questionStartTime: 0,
    perfectGame: true,
    hintsUsed: 0,
    totalCorrectAnswers: 0,
    totalQuestions: 0,
    selectedRandomCategory: null,
    hasSecondChance: false
};

let initialQuestions = [];
let allQuestions = [];
let elements = {};

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================

async function init() {
    console.log('🚀 Inicializando Single Player Game...');
    
    try {
        // 1. Configurar elementos del DOM PRIMERO
        bindElements();
        
        // 2. Verificar elementos críticos
        const criticalElements = ['timer-section', 'timer-number', 'timer-circle', 'answers-container'];
        const missingElements = criticalElements.filter(id => !document.getElementById(id));
        
        if (missingElements.length > 0) {
            console.error('❌ Elementos críticos faltantes:', missingElements);
            showNotification('Error: Elementos de interfaz faltantes', 'error');
        }
        
        // 3. Cargar preguntas
        await loadQuestions();
        
        // 4. Esperar a que GameDataManager esté listo
        if (!window.GameDataManager) {
            console.log('⏳ Esperando GameDataManager...');
            await waitForGameDataManager();
        }
        
        // 5. Configurar listeners
        setupGameDataListeners();
        
        // 6. Actualizar UI inicial
        updatePowerups();
        updateCoinsDisplay();
        
        console.log('✅ Single Player Game inicializado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando Single Player Game:', error);
        showNotification('Error inicializando el juego', 'error');
    }
}

async function waitForGameDataManager() {
    return new Promise((resolve) => {
        const checkGameDataManager = () => {
            if (window.GameDataManager && window.GameDataManager.gameData) {
                console.log('✅ GameDataManager encontrado');
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
    console.log('🔗 Configurando listeners de GameDataManager...');
    
    // Listener para cambios de monedas
    window.GameDataManager.onCoinsChanged((data) => {
        console.log('💰 Monedas cambiaron:', data);
        updateCoinsDisplay();
        
        if (data.difference !== 0) {
            showCoinAnimation(data.difference, data.difference > 0);
        }
    });
    
    // Listener para cambios de inventario
    window.GameDataManager.onInventoryChanged((data) => {
        console.log('🎒 Inventario cambió:', data);
        updatePowerups();
    });
}

function bindElements() {
    elements = {
        welcomeScreen: document.getElementById('welcome-screen'),
        questionScreen: document.getElementById('question-screen'),
        categoriesScreen: document.getElementById('categories-screen'),
        victoryScreen: document.getElementById('victory-screen'),
        gameoverScreen: document.getElementById('gameover-screen'),
        timerSection: document.getElementById('timer-section'),
        timerNumber: document.getElementById('timer-number'),
        timerCircle: document.getElementById('timer-circle'),
        timerPhase: document.getElementById('timer-phase'),
        timerQuestion: document.getElementById('timer-question'),
        questionText: document.querySelector('.question-text'),
        bibleReference: document.getElementById('bible-reference'),
        answersContainer: document.getElementById('answers-container'),
        powerupsSection: document.getElementById('powerups-section'),
        eliminateBtn: document.getElementById('eliminate-btn'),
        timeBtn: document.getElementById('time-btn'),
        rescueBtn: document.getElementById('rescue-btn'),
        phaseIndicator: document.getElementById('phase-indicator')
    };
    
    console.log('🔗 Elementos del DOM vinculados');
}

async function loadQuestions() {
    try {
        console.log('📚 Cargando preguntas...');
        
        const response = await fetch('./data/questions.json');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        allQuestions = await response.json();
        console.log(`✅ ${allQuestions.length} preguntas cargadas desde JSON`);
        
    } catch (error) {
        console.warn('⚠️ Error cargando questions.json, usando preguntas de fallback:', error);
        allQuestions = getFallbackQuestions();
    }
    
    // Generar preguntas iniciales
    initialQuestions = getRandomInitialQuestions();
    console.log('📝 Preguntas iniciales preparadas:', initialQuestions.length);
}

function getFallbackQuestions() {
    return [
        {
            category: "antiguo-testamento",
            text: "¿Quién construyó el arca según el mandato de Dios?",
            options: ["Noé", "Abraham", "Moisés", "David"],
            correctIndex: 0,
            reference: "Génesis 6:14"
        },
        {
            category: "nuevo-testamento",
            text: "¿En qué ciudad nació Jesús?",
            options: ["Nazaret", "Jerusalén", "Belén", "Capernaum"],
            correctIndex: 2,
            reference: "Lucas 2:4"
        },
        {
            category: "personajes-biblicos",
            text: "¿Quién fue vendido por sus hermanos como esclavo?",
            options: ["José", "Benjamín", "Judá", "Rubén"],
            correctIndex: 0,
            reference: "Génesis 37:28"
        },
        {
            category: "doctrina-cristiana",
            text: "¿Cuál es el primer mandamiento?",
            options: ["No matarás", "Amarás a Dios sobre todas las cosas", "No robarás", "Honrarás padre y madre"],
            correctIndex: 1,
            reference: "Mateo 22:37-38"
        }
    ];
}

function getRandomInitialQuestions() {
    // Verificar que INITIAL_QUESTIONS exista
    if (!INITIAL_QUESTIONS || INITIAL_QUESTIONS.length === 0) {
        console.warn('⚠️ INITIAL_QUESTIONS no está definido, usando fallback');
        return [
            {
                text: "¿Cuántos días estuvo Jesús en el desierto?",
                options: ["30 días", "40 días", "50 días", "60 días"],
                correctIndex: 1,
                reference: "Mateo 4:2"
            },
            {
                text: "¿Quién escribió el libro de Apocalipsis?",
                options: ["Pedro", "Pablo", "Juan", "Lucas"],
                correctIndex: 2,
                reference: "Apocalipsis 1:1"
            },
            {
                text: "¿En qué ciudad nació Jesús?",
                options: ["Nazaret", "Jerusalén", "Belén", "Capernaum"],
                correctIndex: 2,
                reference: "Lucas 2:4"
            }
        ];
    }
    
    const shuffled = [...INITIAL_QUESTIONS];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 3);
}

// ============================================
// CONTROL DE PANTALLAS
// ============================================

function showScreen(screenId) {
    console.log(`🖥️ Mostrando pantalla: ${screenId}`);
    
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    } else {
        console.error(`❌ Pantalla no encontrada: ${screenId}`);
    }
}

function updatePhaseIndicator(text) {
    if (elements.phaseIndicator) {
        const span = elements.phaseIndicator.querySelector('span');
        if (span) {
            span.textContent = text;
        }
    }
}

// ============================================
// SISTEMA DE TIMER
// ============================================

function startTimer(duration, callback) {
    stopTimer();
    gameState.timer = duration;
    gameState.questionStartTime = Date.now();
    
    // ✅ MOSTRAR EL TIMER CORRECTAMENTE
    if (elements.timerSection) {
        elements.timerSection.style.display = 'flex';
        elements.timerSection.classList.add('show');
    }
    
    updateTimerDisplay(gameState.timer);
    
    gameState.timerInterval = setInterval(() => {
        gameState.timer--;
        updateTimerDisplay(gameState.timer);
        
        if (gameState.timer <= 0) {
            stopTimer();
            if (callback) callback();
        }
    }, 1000);
    
    console.log(`⏰ Timer iniciado: ${duration} segundos`);
}

function updateTimerDisplay(time) {
    if (elements.timerNumber) {
        elements.timerNumber.textContent = time;
    }
    
    if (elements.timerCircle) {
        elements.timerCircle.classList.remove('warning', 'danger');
        if (time <= 5) {
            elements.timerCircle.classList.add('danger');
        } else if (time <= 10) {
            elements.timerCircle.classList.add('warning');
        }
    }
    
    console.log(`⏰ Timer actualizado: ${time} segundos`);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    if (elements.timerSection) {
        elements.timerSection.style.display = 'none';
        elements.timerSection.classList.remove('show');
    }
}

function updateTimerPhaseText(phase, questionInfo) {
    if (elements.timerPhase) elements.timerPhase.textContent = phase;
    if (elements.timerQuestion) elements.timerQuestion.textContent = questionInfo;
}

// ============================================
// FUNCIONES PRINCIPALES DEL JUEGO
// ============================================

window.startGame = function() {
    console.log('🎮 Iniciando juego...');
    
    // Reset game state
    Object.assign(gameState, {
        phase: 'initial',
        currentQuestionIndex: 0,
        initialCorrectAnswers: 0,
        completedCategories: [],
        pendingCategories: [...CATEGORIES],
        perfectGame: true,
        hintsUsed: 0,
        totalCorrectAnswers: 0,
        totalQuestions: 0,
        isProcessingAnswer: false,
        selectedRandomCategory: null,
        hasSecondChance: false
    });
    
    updatePhaseIndicator('Preguntas Iniciales');
    showScreen('question-screen');
    loadInitialQuestion(0);
};

function loadInitialQuestion(index) {
    console.log(`📝 Cargando pregunta inicial ${index + 1}/3`);
    
    // ✅ VERIFICACIÓN MEJORADA
    if (!initialQuestions || initialQuestions.length === 0) {
        console.error('❌ No hay preguntas iniciales disponibles');
        showNotification('Error: No hay preguntas disponibles', 'error');
        return;
    }
    
    if (!initialQuestions[index]) {
        console.error(`❌ Pregunta inicial ${index} no encontrada. Total: ${initialQuestions.length}`);
        showNotification('Error cargando pregunta', 'error');
        return;
    }
    
    const question = initialQuestions[index];
    gameState.currentQuestion = question;
    gameState.currentQuestionIndex = index;
    
    updateQuestionDisplay(question);
    updateTimerPhaseText('Preguntas Iniciales', `Pregunta ${index + 1} de 3`);
    startTimer(20, () => selectAnswer(-1));
    
    gameState.isProcessingAnswer = false;
}

function updateQuestionDisplay(question) {
    console.log('🔄 Actualizando display de pregunta:', question.text);
    
    // Actualizar referencia bíblica
    if (elements.bibleReference) {
        if (question.reference) {
            elements.bibleReference.textContent = question.reference;
            elements.bibleReference.style.display = 'block';
        } else {
            elements.bibleReference.style.display = 'none';
        }
    }
    
    // Actualizar texto de pregunta
    if (elements.questionText) {
        elements.questionText.textContent = question.text;
    }
    
    // Actualizar opciones de respuesta
    if (elements.answersContainer && question.options) {
        elements.answersContainer.innerHTML = question.options.map((option, index) => `
            <button class="answer-btn" onclick="selectAnswer(${index})" data-index="${index}">
                <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
                <span class="answer-text">${option}</span>
            </button>
        `).join('');
        
        console.log(`✅ ${question.options.length} opciones de respuesta creadas`);
    }
    
    // Mostrar power-ups
    if (elements.powerupsSection) {
        elements.powerupsSection.style.display = 'flex';
    }
}

window.selectAnswer = function(selectedIndex) {
    if (gameState.isProcessingAnswer) {
        console.log('⏳ Ya se está procesando una respuesta');
        return;
    }
    
    console.log(`👆 Respuesta seleccionada: ${selectedIndex}`);
    
    gameState.isProcessingAnswer = true;
    stopTimer();
    
    const question = gameState.currentQuestion;
    const isCorrect = selectedIndex === question.correctIndex;
    const isTimeout = selectedIndex === -1;
    
    markAnswers(selectedIndex, question.correctIndex);
    
    // Calcular bonus de velocidad
    let speedBonus = 0;
    if (isCorrect && !isTimeout) {
        const responseTime = Date.now() - gameState.questionStartTime;
        if (responseTime <= 5000) speedBonus = COIN_REWARDS.speedBonus;
    }
    
    // Procesar respuesta según la fase
    if (gameState.phase === 'initial') {
        handleInitialAnswer(isCorrect, selectedIndex, speedBonus);
    } else if (gameState.phase === 'category' && gameState.needsRescueQuestion) {
        handleRescueAnswer(isCorrect, selectedIndex, speedBonus);
    } else if (gameState.phase === 'category') {
        handleCategoryAnswer(isCorrect, selectedIndex, speedBonus);
    }
};

// ============================================
// MANEJO DE RESPUESTAS POR FASE
// ============================================

function handleInitialAnswer(isCorrect, selectedIndex, speedBonus) {
    console.log(`📊 Procesando respuesta inicial: ${isCorrect ? 'Correcta' : 'Incorrecta'}`);
    
    if (isCorrect) {
        gameState.initialCorrectAnswers++;
        gameState.totalCorrectAnswers++;
        
        if (speedBonus > 0 && window.GameDataManager) {
            window.GameDataManager.addCoins(speedBonus, 'speed_bonus');
            showCoinAnimation(speedBonus, true);
        }
    } else {
        gameState.perfectGame = false;
        
        // Aplicar penalizaciones
        if (window.GameDataManager) {
            const penalty = selectedIndex === -1 ? 
                Math.abs(COIN_REWARDS.timeoutPenalty) : 
                Math.abs(COIN_REWARDS.wrongAnswer);
            
            window.GameDataManager.spendCoins(penalty, 'penalty');
            showCoinAnimation(-penalty, false);
        }
    }
    
    gameState.totalQuestions++;
    
    setTimeout(() => {
        gameState.currentQuestionIndex++;
        gameState.isProcessingAnswer = false;
        
        if (gameState.currentQuestionIndex < 3) {
            loadInitialQuestion(gameState.currentQuestionIndex);
        } else {
            evaluateInitialPhase();
        }
    }, 2000);
}

function evaluateInitialPhase() {
    const correct = gameState.initialCorrectAnswers;
    console.log(`🎯 Evaluando fase inicial: ${correct}/3 correctas`);
    
    if (correct <= 1) {
        // Game over - eliminado
        if (window.GameDataManager) {
            window.GameDataManager.spendCoins(50, 'elimination');
            showCoinAnimation(-50, false);
        }
        setTimeout(() => showGameOver(`Eliminado: Solo ${correct} de 3 correctas`), 2000);
    } else if (correct === 2) {
        // Categoría aleatoria
        setTimeout(() => showRandomCategoryModal(), 2000);
    } else {
        // Selección libre de categoría
        setTimeout(() => showCategorySelection(), 2000);
    }
}

function showRandomCategoryModal() {
    const randomCategory = gameState.pendingCategories[
        Math.floor(Math.random() * gameState.pendingCategories.length)
    ];
    
    gameState.selectedRandomCategory = randomCategory;
    
    const modalHTML = `
        <div id="random-category-modal" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.8); display: flex; align-items: center;
            justify-content: center; z-index: 2000;
        ">
            <div style="
                background: rgba(30, 60, 138, 0.95); backdrop-filter: blur(25px);
                border-radius: 25px; padding: 50px; text-align: center;
                border: 2px solid rgba(255, 255, 255, 0.3); max-width: 500px;
                width: 90%; color: white;
            ">
                <h2 style="color: #ffd700; margin-bottom: 20px;">¡Categoría Aleatoria!</h2>
                <p style="margin-bottom: 30px;">
                    Respondiste 2 de 3 preguntas correctamente.<br>
                    La categoría será elegida automáticamente.
                </p>
                <div style="
                    background: rgba(255, 255, 255, 0.15); padding: 30px;
                    border-radius: 20px; margin: 30px 0;
                ">
                    <div style="font-size: 3rem; color: ${randomCategory.color}; margin-bottom: 20px;">
                        <i class="fas ${randomCategory.icon}"></i>
                    </div>
                    <h3 style="color: #ffd700; font-size: 1.6rem; margin-bottom: 12px;">
                        ${randomCategory.name}
                    </h3>
                </div>
                <button onclick="acceptRandomCategory()" style="
                    background: linear-gradient(135deg, #3a86ff, #2563eb);
                    color: white; border: none; padding: 18px 40px;
                    border-radius: 30px; font-size: 1.2rem; font-weight: 700;
                    cursor: pointer;
                ">Continuar</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.acceptRandomCategory = function() {
    const modal = document.getElementById('random-category-modal');
    if (modal) modal.remove();
    
    if (gameState.selectedRandomCategory) {
        startCategoryGame(gameState.selectedRandomCategory.id);
    }
};

function showCategorySelection() {
    gameState.phase = 'categories';
    showScreen('categories-screen');
    updatePhaseIndicator('Selección de Categoría');
    updateCategoriesSection();
}

function updateCategoriesSection() {
    const categoriesScreen = document.getElementById('categories-screen');
    if (!categoriesScreen) return;
    
    categoriesScreen.innerHTML = `
        <div class="categories-content">
            <div class="categories-header">
                <div class="mascot-celebration">
                    <img src="assets/images/mascota.png" alt="Joy celebrando" class="mascot-small">
                </div>
                <h2>¡Excelente! Selecciona una Categoría</h2>
                <p class="categories-subtitle">
                    Has superado las preguntas iniciales. Ahora elige tu categoría favorita 
                    para continuar tu aventura bíblica.
                </p>
                
                <div class="categories-progress">
                    <div class="category-progress-item">
                        <i class="fas fa-check-circle" style="color: #27ae60;"></i>
                        <span>Preguntas Iniciales Completadas</span>
                    </div>
                    <div class="category-progress-item">
                        <i class="fas fa-arrow-right" style="color: #3498db;"></i>
                        <span>Selecciona tu Categoría</span>
                    </div>
                    <div class="category-progress-item">
                        <i class="fas fa-trophy" style="color: #f39c12;"></i>
                        <span>Completa para Ganar</span>
                    </div>
                </div>
            </div>
            
            <div class="categories-grid">
                ${gameState.pendingCategories.map(category => {
                    const isCompleted = gameState.completedCategories.includes(category.id);
                    return `
                        <div class="category-card ${isCompleted ? 'completed' : ''}" 
                             onclick="${isCompleted ? '' : `selectCategory('${category.id}')`}"
                             style="${isCompleted ? 'opacity: 0.6; cursor: not-allowed;' : 'cursor: pointer;'}">
                            <div class="category-icon">
                                <i class="fas ${category.icon}" style="color: ${category.color}"></i>
                            </div>
                            <div class="category-info">
                                <h3>${category.name}</h3>
                                <p class="category-description">
                                    2 preguntas principales + 1 pregunta de rescate
                                </p>
                                
                                <div class="category-stats">
                                    <span><i class="fas fa-question-circle"></i> 2-3 preguntas</span>
                                    <span><i class="fas fa-coins"></i> 8-40 monedas</span>
                                </div>
                                
                                ${isCompleted ? 
                                    '<div class="category-completed"><i class="fas fa-check"></i> Completada</div>' : 
                                    '<div class="category-select">Seleccionar</div>'
                                }
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

window.selectCategory = function(categoryId) {
    console.log(`📂 Categoría seleccionada: ${categoryId}`);
    startCategoryGame(categoryId);
};

function startCategoryGame(categoryId) {
    gameState.currentCategory = categoryId;
    gameState.phase = 'category';
    gameState.categoryQuestionIndex = 0;
    gameState.categoryCorrectAnswers = 0;
    gameState.needsRescueQuestion = false;
    
    loadCategoryQuestions(categoryId);
    showScreen('question-screen');
    loadCategoryQuestion(0);
}

function loadCategoryQuestions(categoryId) {
    const categoryQuestions = allQuestions.filter(q => q.category === categoryId);
    
    if (categoryQuestions.length === 0) {
        console.error(`❌ No hay preguntas para la categoría: ${categoryId}`);
        
        // Usar preguntas de fallback específicas de la categoría
        const fallbackQuestions = getFallbackQuestionsByCategory(categoryId);
        gameState.categoryQuestions = fallbackQuestions.slice(0, 2);
        return;
    }
    
    // Mezclar y seleccionar 2 preguntas aleatorias
    const shuffled = [...categoryQuestions].sort(() => 0.5 - Math.random());
    gameState.categoryQuestions = shuffled.slice(0, 2);
    
    console.log(`✅ Cargadas ${gameState.categoryQuestions.length} preguntas para ${categoryId}`);
}

function getFallbackQuestionsByCategory(categoryId) {
    const fallbackMap = {
        'antiguo-testamento': [
            {
                text: "¿Quién construyó el arca?",
                options: ["Noé", "Abraham", "Moisés", "David"],
                correctIndex: 0,
                reference: "Génesis 6:14"
            },
            {
                text: "¿Cuántos días llovió durante el diluvio?",
                options: ["30 días", "40 días", "50 días", "60 días"],
                correctIndex: 1,
                reference: "Génesis 7:12"
            }
        ],
        'nuevo-testamento': [
            {
                text: "¿En qué ciudad nació Jesús?",
                options: ["Nazaret", "Jerusalén", "Belén", "Capernaum"],
                correctIndex: 2,
                reference: "Lucas 2:4"
            },
            {
                text: "¿Cuántos apóstoles eligió Jesús?",
                options: ["10", "12", "14", "16"],
                correctIndex: 1,
                reference: "Mateo 10:1-4"
            }
        ],
        'personajes-biblicos': [
            {
                text: "¿Quién fue vendido por sus hermanos?",
                options: ["José", "Benjamín", "Judá", "Rubén"],
                correctIndex: 0,
                reference: "Génesis 37:28"
            },
            {
                text: "¿Quién derrotó al gigante Goliat?",
                options: ["Saúl", "David", "Sansón", "Josué"],
                correctIndex: 1,
                reference: "1 Samuel 17:49-50"
            }
        ],
        'doctrina-cristiana': [
            {
                text: "¿Cuál es el primer mandamiento?",
                options: ["No matarás", "Amarás a Dios sobre todas las cosas", "No robarás", "Honrarás padre y madre"],
                correctIndex: 1,
                reference: "Mateo 22:37-38"
            },
            {
                text: "¿Qué significa 'Emanuel'?",
                options: ["Rey de reyes", "Dios con nosotros", "Príncipe de paz", "Salvador"],
                correctIndex: 1,
                reference: "Mateo 1:23"
            }
        ]
    };
    
    return fallbackMap[categoryId] || [
        {
            text: "Pregunta de fallback",
            options: ["Opción A", "Opción B", "Opción C", "Opción D"],
            correctIndex: 0,
            reference: "Referencia bíblica"
        }
    ];
}

function loadCategoryQuestion(index) {
    if (!gameState.categoryQuestions[index]) {
        console.error('❌ Pregunta de categoría no encontrada');
        return;
    }
    
    const question = gameState.categoryQuestions[index];
    gameState.currentQuestion = question;
    gameState.categoryQuestionIndex = index;
    
    updateQuestionDisplay(question);
    
    const categoryName = CATEGORIES.find(c => c.id === gameState.currentCategory)?.name;
    updateTimerPhaseText(`Categoría: ${categoryName}`, `Pregunta ${index + 1} de 2`);
    
    startTimer(25, () => selectAnswer(-1));
    gameState.isProcessingAnswer = false;
}

function handleCategoryAnswer(isCorrect, selectedIndex, speedBonus) {
    console.log(`📊 Procesando respuesta de categoría: ${isCorrect ? 'Correcta' : 'Incorrecta'}`);
    
    if (isCorrect) {
        gameState.categoryCorrectAnswers++;
        gameState.totalCorrectAnswers++;
        
        // Recompensa con GameDataManager
        let totalReward = COIN_REWARDS.categoryCorrect + speedBonus;
        if (window.GameDataManager) {
            window.GameDataManager.addCoins(totalReward, 'category_correct');
            showCoinAnimation(totalReward, true);
        }
    } else {
        gameState.perfectGame = false;
        
        // Aplicar penalizaciones
        if (window.GameDataManager) {
            const penalty = selectedIndex === -1 ? 
                Math.abs(COIN_REWARDS.timeoutPenalty) : 
                Math.abs(COIN_REWARDS.wrongAnswer);
            
            window.GameDataManager.spendCoins(penalty, 'penalty');
            showCoinAnimation(-penalty, false);
        }
    }
    
    gameState.totalQuestions++;
    
    setTimeout(() => {
        gameState.categoryQuestionIndex++;
        gameState.isProcessingAnswer = false;
        
        if (gameState.categoryQuestionIndex < gameState.categoryQuestions.length) {
            loadCategoryQuestion(gameState.categoryQuestionIndex);
        } else {
            evaluateCategoryPhase();
        }
    }, 2000);
}

function evaluateCategoryPhase() {
    const correct = gameState.categoryCorrectAnswers;
    console.log(`🎯 Evaluando fase de categoría: ${correct}/2 correctas`);
    
    if (correct === 2) {
        // Categoría completada exitosamente
        completeCategory();
    } else if (correct === 1) {
        // Necesita pregunta de rescate
        gameState.needsRescueQuestion = true;
        loadRescueQuestion();
    } else {
        // Game over - 0 correctas
        showGameOver('No lograste responder correctamente las preguntas de la categoría');
    }
}

function loadRescueQuestion() {
    console.log('🆘 Cargando pregunta de rescate...');
    
    // Buscar una pregunta diferente de la misma categoría
    const usedQuestions = gameState.categoryQuestions.map(q => q.text);
    const categoryQuestions = allQuestions.filter(q => 
        q.category === gameState.currentCategory &&
        !usedQuestions.includes(q.text)
    );
    
    let rescueQuestion;
    if (categoryQuestions.length > 0) {
        rescueQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
    } else {
        // Usar pregunta de fallback para rescate
        const fallbackQuestions = getFallbackQuestionsByCategory(gameState.currentCategory);
        rescueQuestion = fallbackQuestions.find(q => !usedQuestions.includes(q.text)) || {
            text: "¿Cuál es el libro más corto del Nuevo Testamento?",
            options: ["Filemón", "2 Juan", "3 Juan", "Judas"],
            correctIndex: 1,
            reference: "2 Juan"
        };
    }
    
    gameState.currentQuestion = rescueQuestion;
    
    updateQuestionDisplay(rescueQuestion);
    showScreen('question-screen');
    updatePhaseIndicator('¡Pregunta de Rescate!');
    updateTimerPhaseText('¡Pregunta de Rescate!', 'Tu última oportunidad');
    
    startTimer(30, () => selectAnswer(-1));
    gameState.isProcessingAnswer = false;
}

function handleRescueAnswer(isCorrect, selectedIndex, speedBonus) {
    console.log(`🆘 Procesando respuesta de rescate: ${isCorrect ? 'Correcta' : 'Incorrecta'}`);
    
    if (isCorrect) {
        gameState.totalCorrectAnswers++;
        
        // Recompensa especial por rescate
        let totalReward = COIN_REWARDS.rescueSuccess + speedBonus;
        if (window.GameDataManager) {
            window.GameDataManager.addCoins(totalReward, 'rescue_success');
            showCoinAnimation(totalReward, true);
        }
    } else {
        gameState.perfectGame = false;
        
        // Penalizaciones
        if (window.GameDataManager) {
            const penalty = selectedIndex === -1 ? 
                Math.abs(COIN_REWARDS.timeoutPenalty) : 
                Math.abs(COIN_REWARDS.wrongAnswer);
            
            window.GameDataManager.spendCoins(penalty, 'penalty');
            showCoinAnimation(-penalty, false);
        }
    }
    
    gameState.totalQuestions++;
    
    setTimeout(() => {
        gameState.isProcessingAnswer = false;
        gameState.needsRescueQuestion = false;
        
        if (isCorrect) {
            completeCategory();
        } else {
            showGameOver('No lograste superar la pregunta de rescate');
        }
    }, 2000);
}

function completeCategory() {
    console.log(`🎉 Categoría completada: ${gameState.currentCategory}`);
    
    // Agregar categoría a completadas
    if (!gameState.completedCategories.includes(gameState.currentCategory)) {
        gameState.completedCategories.push(gameState.currentCategory);
    }
    
    // Remover de pendientes
    gameState.pendingCategories = gameState.pendingCategories.filter(
        category => category.id !== gameState.currentCategory
    );
    
    // Bonificación por completar categoría
    if (window.GameDataManager) {
        window.GameDataManager.addCoins(COIN_REWARDS.categoryComplete, 'category_complete');
        showCoinAnimation(COIN_REWARDS.categoryComplete, true);
    }
    
    // Verificar si se completaron todas las categorías
    if (gameState.completedCategories.length >= CATEGORIES.length) {
        // Juego completado
        let finalBonus = COIN_REWARDS.gameComplete;
        
        if (gameState.perfectGame) {
            finalBonus += COIN_REWARDS.perfectGame;
        }
        
        if (gameState.hintsUsed === 0) {
            finalBonus += 30; // Bonus sin usar power-ups
        }
        
        if (window.GameDataManager) {
            window.GameDataManager.addCoins(finalBonus, 'game_complete');
            window.GameDataManager.updateGameStats({
                victory: true,
                perfect: gameState.perfectGame,
                totalQuestions: gameState.totalQuestions,
                totalCorrectAnswers: gameState.totalCorrectAnswers,
                hintsUsed: gameState.hintsUsed
            });
            showCoinAnimation(finalBonus, true);
        }
        
        setTimeout(() => showVictory(), 3000);
    } else {
        // Continuar con siguiente categoría
        setTimeout(() => {
            updateCategoriesSection();
            showCategorySelection();
        }, 3000);
    }
}

// ============================================
// PANTALLAS DE FINALIZACIÓN
// ============================================

function showVictory() {
    gameState.phase = 'victory';
    showScreen('victory-screen');
    updatePhaseIndicator('¡Victoria!');
    
    console.log('🏆 Juego completado exitosamente');
    
    // Mostrar estadísticas finales
    const finalStats = {
        totalQuestions: gameState.totalQuestions,
        correctAnswers: gameState.totalCorrectAnswers,
        perfectGame: gameState.perfectGame,
        hintsUsed: gameState.hintsUsed,
        categoriesCompleted: gameState.completedCategories.length
    };
    
    console.log('📊 Estadísticas finales:', finalStats);
}

function showGameOver(reason = 'Juego terminado') {
    gameState.phase = 'gameover';
    showScreen('gameover-screen');
    updatePhaseIndicator('Game Over');
    
    console.log('💀 Game Over:', reason);
    
    if (window.GameDataManager) {
        window.GameDataManager.updateGameStats({
            victory: false,
            perfect: false,
            totalQuestions: gameState.totalQuestions,
            totalCorrectAnswers: gameState.totalCorrectAnswers,
            hintsUsed: gameState.hintsUsed
        });
    }
}

window.restartGame = function() {
    console.log('🔄 Reiniciando juego...');
    
    // Reset completo del gameState
    Object.assign(gameState, {
        phase: 'welcome',
        currentQuestionIndex: 0,
        initialCorrectAnswers: 0,
        completedCategories: [],
        pendingCategories: [...CATEGORIES],
        currentCategory: '',
        categoryQuestions: [],
        categoryQuestionIndex: 0,
        categoryCorrectAnswers: 0,
        needsRescueQuestion: false,
        currentQuestion: null,
        isProcessingAnswer: false,
        perfectGame: true,
        hintsUsed: 0,
        totalCorrectAnswers: 0,
        totalQuestions: 0,
        selectedRandomCategory: null,
        hasSecondChance: false
    });
    
    stopTimer();
    showScreen('welcome-screen');
    updatePhaseIndicator('Bienvenido');
    
    // Recargar preguntas iniciales
    initialQuestions = getRandomInitialQuestions();
};

// ============================================
// POWER-UPS SYSTEM
// ============================================

function updatePowerups() {
    if (!window.GameDataManager) return;
    
    const powerups = ['eliminate', 'timeExtender', 'secondChance'];
    const buttons = [elements.eliminateBtn, elements.timeBtn, elements.rescueBtn];
    
    powerups.forEach((powerupId, index) => {
        const btn = buttons[index];
        if (!btn) return;
        
        const count = window.GameDataManager.getPowerupCount(powerupId);
        const countElement = btn.querySelector('.powerup-count');
        
        if (countElement) countElement.textContent = count;
        
        if (count <= 0) {
            btn.classList.add('disabled');
        } else {
            btn.classList.remove('disabled');
        }
    });
}

window.usePowerup = function(powerupType) {
    console.log(`🎯 Intentando usar power-up: ${powerupType}`);
    
    if (!window.GameDataManager) {
        console.error('❌ GameDataManager no disponible');
        return false;
    }
    
    // Verificar disponibilidad
    const currentCount = window.GameDataManager.getPowerupCount(powerupType);
    if (currentCount <= 0) {
        showNotification(`No tienes ${powerupType} disponibles`, 'error');
        return false;
    }
    
    // Usar power-up según el tipo
    let success = false;
    switch (powerupType) {
        case 'eliminate':
            success = eliminateOptions();
            break;
        case 'timeExtender':
            success = extendTime();
            break;
        case 'secondChance':
            success = activateSecondChance();
            break;
        default:
            console.error('❌ Tipo de power-up desconocido:', powerupType);
            return false;
    }
    
    if (success) {
        // Consumir power-up
        window.GameDataManager.usePowerup(powerupType, 1, 'game');
        updatePowerups();
        showNotification(`${powerupType} activado!`, 'success');
        gameState.hintsUsed++;
        return true;
    }
    
    return false;
};

function eliminateOptions() {
    const answerButtons = document.querySelectorAll('.answer-btn:not(.eliminated):not(.correct):not(.incorrect)');
    if (answerButtons.length <= 2) return false;
    
    const correctIndex = gameState.currentQuestion.correctIndex;
    const incorrectButtons = Array.from(answerButtons).filter((btn, index) => index !== correctIndex);
    
    // Eliminar 2 opciones incorrectas aleatoriamente
    for (let i = 0; i < 2 && incorrectButtons.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * incorrectButtons.length);
        const buttonToEliminate = incorrectButtons.splice(randomIndex, 1)[0];
        buttonToEliminate.classList.add('eliminated');
        buttonToEliminate.disabled = true;
    }
    
    return true;
}

function extendTime() {
    if (gameState.timerInterval) {
        gameState.timer += 15;
        updateTimerDisplay(gameState.timer);
        return true;
    }
    return false;
}

function activateSecondChance() {
    gameState.hasSecondChance = true;
    return true;
}

// ============================================
// UTILIDADES Y HELPERS
// ============================================

function markAnswers(selectedIndex, correctIndex) {
    const answerButtons = document.querySelectorAll('.answer-btn');
    
    answerButtons.forEach((button, index) => {
        button.disabled = true;
        
        if (index === correctIndex) {
            button.classList.add('correct');
        } else if (index === selectedIndex && selectedIndex !== correctIndex) {
            button.classList.add('incorrect');
        }
    });
}

function showCoinAnimation(amount, isPositive) {
    if (amount === 0) return;
    
    const coinElement = document.createElement('div');
    coinElement.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        font-size: 1.5rem; font-weight: bold; z-index: 2000; pointer-events: none;
        color: ${isPositive ? '#ffd700' : '#e74c3c'};
        animation: coinFloat 2s ease-out forwards;
    `;
    
    coinElement.innerHTML = `<i class="fas fa-coins"></i> ${amount > 0 ? '+' : ''}${amount}`;
    document.body.appendChild(coinElement);
    
    // Agregar estilos CSS para la animación
    if (!document.getElementById('coin-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'coin-animation-styles';
        style.textContent = `
            @keyframes coinFloat {
                0% { opacity: 1; transform: translate(-50%, -50%) scale(0.8); }
                50% { opacity: 1; transform: translate(-50%, -70px) scale(1.2); }
                100% { opacity: 0; transform: translate(-50%, -100px) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        coinElement.remove();
    }, 2000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="
            position: fixed; top: 90px; right: 25px; z-index: 2000;
            background: rgba(30, 60, 138, 0.95); border-radius: 15px;
            padding: 15px 20px; color: white; font-weight: 600;
            transform: translateX(100%); transition: transform 0.3s ease;
        ">
            <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-info'}"></i>
            <span style="margin-left: 10px;">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.firstElementChild.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.firstElementChild.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function updateCoinsDisplay() {
    if (!window.GameDataManager) return;
    
    const coinsElements = document.querySelectorAll('#player-coins');
    const currentCoins = window.GameDataManager.getCoins();
    
    coinsElements.forEach(element => {
        if (element) element.textContent = currentCoins;
    });
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 DOM cargado, inicializando...');
    
    // Verificar que estamos en la página correcta
    if (document.getElementById('welcome-screen')) {
        init();
    } else {
        console.warn('⚠️ Esta página no parece ser single-player-new.html');
    }
});

// Funciones globales adicionales para debugging
window.debugGame = function() {
    console.log('🔧 DEBUG MANUAL DEL JUEGO:');
    console.log('GameDataManager:', window.GameDataManager ? 'Disponible' : 'No disponible');
    console.log('GameState:', gameState);
    console.log('Elements:', Object.keys(elements).length, 'elementos vinculados');
    console.log('InitialQuestions:', initialQuestions.length);
    console.log('AllQuestions:', allQuestions.length);
};

window.forceStartGame = function() {
    console.log('🚀 Forzando inicio de juego para debugging...');
    startGame();
};

console.log('✅ Single-Player-New.js COMPLETO cargado');