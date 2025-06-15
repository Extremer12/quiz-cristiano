/**
 * ================================================
 * SINGLE-PLAYER GAME - MECÁNICA PREGUNTADOS CORREGIDA
 * Quiz Cristiano - 4 Categorías + Sistema Justo de Monedas
 * ================================================
 */

// ============================================
// CONFIGURACIÓN Y CONSTANTES CORREGIDAS
// ============================================

const CATEGORIES = [
    { id: 'antiguo-testamento', name: 'Antiguo Testamento', icon: 'fa-book' },
    { id: 'nuevo-testamento', name: 'Nuevo Testamento', icon: 'fa-cross' },
    { id: 'personajes-biblicos', name: 'Personajes Bíblicos', icon: 'fa-user' },
    { id: 'doctrina-cristiana', name: 'Doctrina Cristiana', icon: 'fa-pray' }
];

const PENALTY_SYSTEM = {
    initial: 50,
    category1: 30,
    category2: 20,
    category3: 10,
    category4: 5
};

const REWARD_SYSTEM = {
    category1: 30,
    category2: 40,
    category3: 50,
    category4: 60
};

// Pool de preguntas iniciales aleatorias
const INITIAL_QUESTIONS_POOL = [
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
    },
    {
        text: "¿Qué significa 'Emanuel'?",
        options: ["Rey de reyes", "Dios con nosotros", "Príncipe de paz", "Salvador"],
        correctIndex: 1,
        reference: "Mateo 1:23"
    },
    {
        text: "¿Cuántos días llovió durante el diluvio?",
        options: ["30", "40", "50", "60"],
        correctIndex: 1,
        reference: "Génesis 7:12"
    },
    {
        text: "¿Cómo se llamaba la madre de Jesús?",
        options: ["María", "Marta", "Magdalena", "Elisabeth"],
        correctIndex: 0,
        reference: "Lucas 1:27"
    },
    {
        text: "¿Cuántas plagas envió Dios a Egipto?",
        options: ["7", "10", "12", "15"],
        correctIndex: 1,
        reference: "Éxodo 7-12"
    }
];

// ============================================
// VARIABLES GLOBALES DEL JUEGO
// ============================================

let gameState = {
    phase: 'initial',
    currentQuestionIndex: 0,
    initialCorrectAnswers: 0,
    categoryCorrectAnswers: 0,
    coins: 0,
    completedCategories: [],
    pendingCategories: [...CATEGORIES],
    currentCategory: '',
    categoryQuestions: [],
    timer: 20,
    timerInterval: null,
    eliminationPhase: null,
    isRandomCategory: false,
    currentQuestion: null,
    isProcessingAnswer: false
};

let initialQuestions = [];
let elements = {};

// ============================================
// FUNCIONES GLOBALES PARA EVENTOS INLINE
// ============================================

window.handleInitialAnswer = function(selectedIndex, correctIndex) {
    if (gameState.isProcessingAnswer) return;
    gameState.isProcessingAnswer = true;
    
    console.log(`✋ Respuesta inicial: ${selectedIndex}, Correcta: ${correctIndex}`);
    
    stopTimer();
    
    const optionButtons = document.querySelectorAll('#initial-options-container .option-btn');
    const isCorrect = selectedIndex === correctIndex;
    const isTimeout = selectedIndex === -1;

    // Marcar respuestas
    optionButtons[correctIndex].classList.add('correct');

    if (!isCorrect && !isTimeout) {
        optionButtons[selectedIndex].classList.add('incorrect');
    }

    // Actualizar estadísticas
    if (isCorrect) {
        gameState.initialCorrectAnswers++;
        gameState.coins += 10;
        elements.progressItems[gameState.currentQuestionIndex].classList.add('completed');
    } else {
        elements.progressItems[gameState.currentQuestionIndex].classList.add('incorrect');
    }

    // Deshabilitar botones
    optionButtons.forEach(button => {
        button.disabled = true;
        button.style.pointerEvents = 'none';
    });

    updateDisplay();

    // Pasar a la siguiente pregunta
    setTimeout(() => {
        gameState.currentQuestionIndex++;
        gameState.isProcessingAnswer = false;

        if (gameState.currentQuestionIndex < 3) {
            loadInitialQuestion(gameState.currentQuestionIndex);
        } else {
            evaluateInitialPhase();
        }
    }, 1500);
};

window.startCategoryGame = function(categoryId, isRandom = false) {
    startCategoryGameInternal(categoryId, isRandom);
};

window.handleCategoryAnswer = function(selectedIndex, correctIndex, questionIndex) {
    if (gameState.isProcessingAnswer) return;
    gameState.isProcessingAnswer = true;
    
    console.log(`✋ Respuesta categoría: ${selectedIndex}, Correcta: ${correctIndex}, Pregunta: ${questionIndex + 1}`);
    
    stopTimer();
    
    const optionButtons = document.querySelectorAll('#main-options-container .option-btn');
    const isCorrect = selectedIndex === correctIndex;
    const isTimeout = selectedIndex === -1;

    // Marcar respuestas
    optionButtons[correctIndex].classList.add('correct');

    if (!isCorrect && !isTimeout) {
        optionButtons[selectedIndex].classList.add('incorrect');
    }

    // Actualizar estadísticas
    if (isCorrect) {
        gameState.categoryCorrectAnswers++;
        gameState.coins += 20;
    }

    // Deshabilitar botones
    optionButtons.forEach(button => {
        button.disabled = true;
        button.style.pointerEvents = 'none';
    });

    updateDisplay();

    setTimeout(() => {
        gameState.isProcessingAnswer = false;
        evaluateCategoryProgress(isCorrect, questionIndex);
    }, 1500);
};

window.handleRescueAnswer = function(selectedIndex, correctIndex) {
    if (gameState.isProcessingAnswer) return;
    gameState.isProcessingAnswer = true;
    
    console.log(`🚨 Respuesta rescate: ${selectedIndex}, Correcta: ${correctIndex}`);
    
    stopTimer();
    
    const optionButtons = document.querySelectorAll('#main-options-container .option-btn');
    const isCorrect = selectedIndex === correctIndex;
    const isTimeout = selectedIndex === -1;

    // Marcar respuestas
    optionButtons[correctIndex].classList.add('correct');

    if (!isCorrect && !isTimeout) {
        optionButtons[selectedIndex].classList.add('incorrect');
    }

    // Deshabilitar botones
    optionButtons.forEach(button => {
        button.disabled = true;
        button.style.pointerEvents = 'none';
    });

    setTimeout(() => {
        gameState.isProcessingAnswer = false;
        if (isCorrect) {
            // Salvado - completar categoría
            gameState.coins += 30; // Bonus por rescate
            updateDisplay();
            completeCategory();
        } else {
            // Eliminado - SISTEMA JUSTO DE PENALIZACIÓN
            gameState.eliminationPhase = gameState.completedCategories.length + 1;
            const penaltyKey = `category${gameState.eliminationPhase}`;
            gameState.coins = Math.max(0, gameState.coins - PENALTY_SYSTEM[penaltyKey]);
            saveGameData();
            showGameOver();
        }
    }, 1500);
};

window.continueToNextCategory = function() {
    elements.categoryResultsModal.style.display = 'none';
    elements.mainGame.style.display = 'none';
    
    // Resetear estado de categoría
    gameState.phase = 'categories';
    gameState.currentCategory = '';
    gameState.categoryCorrectAnswers = 0;
    gameState.currentQuestionIndex = 0;
    
    // Volver a selección de categorías con categorías restantes
    showRemainingCategories();
};

window.restartGame = function() {
    console.log('🔄 Reiniciando juego...');
    
    // Obtener nuevas preguntas aleatorias para el reinicio
    initialQuestions = getRandomInitialQuestions();
    
    // Resetear estado del juego
    gameState = {
        phase: 'initial',
        currentQuestionIndex: 0,
        initialCorrectAnswers: 0,
        categoryCorrectAnswers: 0,
        coins: gameState.coins, // Mantener monedas
        completedCategories: [],
        pendingCategories: [...CATEGORIES],
        currentCategory: '',
        categoryQuestions: [],
        timer: 20,
        timerInterval: null,
        eliminationPhase: null,
        isRandomCategory: false,
        currentQuestion: null,
        isProcessingAnswer: false
    };
    
    // Ocultar modales
    elements.victoryModal.style.display = 'none';
    elements.gameOverModal.style.display = 'none';
    elements.categoryResultsModal.style.display = 'none';
    
    // Mostrar fase inicial
    elements.mainGame.style.display = 'none';
    elements.categorySelection.style.display = 'none';
    elements.initialPhase.style.display = 'flex';
    
    // Reiniciar
    updateDisplay();
    loadInitialQuestion(0);
};

// ============================================
// FUNCIONES PRINCIPALES DEL JUEGO
// ============================================

function init() {
    console.log('🚀 Inicializando Single Player Game...');
    bindElements();
    loadGameData();
    updateDisplay();
    initialQuestions = getRandomInitialQuestions();
    loadInitialQuestion(0);
    console.log('✅ Single Player Game inicializado correctamente');
}

function bindElements() {
    elements.coinsCount = document.getElementById('coins-count');
    elements.categoriesProgress = document.getElementById('categories-progress');
    elements.initialPhase = document.getElementById('initial-phase');
    elements.categorySelection = document.getElementById('category-selection');
    elements.mainGame = document.getElementById('main-game');
    elements.initialQuestionContainer = document.getElementById('initial-question-container');
    elements.mainQuestionContainer = document.getElementById('main-question-container');
    elements.categoriesGrid = document.getElementById('categories-grid');
    elements.rescueMode = document.getElementById('rescue-mode');
    elements.progressItems = document.querySelectorAll('.progress-item');
    elements.categoryResultsModal = document.getElementById('category-results-modal');
    elements.categoryResultsTitle = document.getElementById('category-results-title');
    elements.categoryResultsDescription = document.getElementById('category-results-description');
    elements.rewardInfo = document.getElementById('reward-info');
    elements.victoryModal = document.getElementById('victory-modal');
    elements.victoryStats = document.getElementById('victory-stats');
    elements.gameOverModal = document.getElementById('game-over-modal');
    elements.gameOverPhaseDescription = document.getElementById('game-over-phase-description');
    elements.penaltyInfo = document.getElementById('penalty-info');
    elements.finalStats = document.getElementById('final-stats');
}

function getRandomInitialQuestions() {
    const shuffled = [...INITIAL_QUESTIONS_POOL];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 3);
}

function loadInitialQuestion(index) {
    if (!initialQuestions[index]) {
        console.error('❌ No hay pregunta inicial para el índice:', index);
        return;
    }

    const question = initialQuestions[index];
    gameState.currentQuestion = question;
    console.log(`📝 Cargando pregunta inicial ${index + 1}:`, question.text);

    // Crear contenedor de pregunta con eventos inline
    elements.initialQuestionContainer.innerHTML = `
        <div class="timer-container" id="timer-display">20</div>
        ${question.reference ? `<div class="question-reference">${question.reference}</div>` : ''}
        <div class="question-text">${question.text}</div>
        <div class="options-container" id="initial-options-container">
            ${question.options.map((option, optionIndex) => 
                `<button class="option-btn" onclick="handleInitialAnswer(${optionIndex}, ${question.correctIndex})">${option}</button>`
            ).join('')}
        </div>
    `;

    // Actualizar progreso visual
    elements.progressItems.forEach((item, i) => {
        item.classList.remove('current', 'completed', 'incorrect');
        if (i < index) {
            item.classList.add('completed');
        } else if (i === index) {
            item.classList.add('current');
        }
    });

    // Iniciar timer
    startTimer(20, () => {
        handleInitialAnswer(-1, question.correctIndex);
    });
}

function evaluateInitialPhase() {
    const correct = gameState.initialCorrectAnswers;
    console.log(`🎯 Fase inicial completada: ${correct}/3 correctas`);

    if (correct <= 1) {
        // Game Over
        gameState.eliminationPhase = 'initial';
        gameState.coins = Math.max(0, gameState.coins - PENALTY_SYSTEM.initial);
        saveGameData();
        showGameOver();
    } else if (correct === 2) {
        // Categoría aleatoria
        const randomCategory = gameState.pendingCategories[
            Math.floor(Math.random() * gameState.pendingCategories.length)
        ];
        startCategoryGameInternal(randomCategory.id, true);
    } else {
        // Elegir categoría
        showCategorySelection();
    }
}

function showCategorySelection() {
    elements.initialPhase.style.display = 'none';
    elements.categorySelection.style.display = 'flex';

    elements.categoriesGrid.innerHTML = gameState.pendingCategories.map(category => `
        <div class="category-card" onclick="startCategoryGame('${category.id}', false)">
            <div class="category-icon">
                <i class="fas ${category.icon}"></i>
            </div>
            <div class="category-name">${category.name}</div>
            <div class="category-questions">2 preguntas + 1 rescate</div>
        </div>
    `).join('');
}

async function startCategoryGameInternal(categoryId, isRandom = false) {
    console.log(`🎮 Iniciando juego en categoría: ${categoryId} (${isRandom ? 'aleatoria' : 'elegida'})`);
    
    gameState.phase = 'playing';
    gameState.currentCategory = categoryId;
    gameState.currentQuestionIndex = 0;
    gameState.categoryCorrectAnswers = 0;
    gameState.isRandomCategory = isRandom;
    
    // Cambiar vista
    elements.categorySelection.style.display = 'none';
    elements.mainGame.style.display = 'flex';
    
    // Cargar preguntas CON FILTRO EXACTO SOLO PARA LAS 4 CATEGORÍAS
    const allQuestions = await loadQuestionsFromJSON();
    
    // FILTRO CORREGIDO - Solo las 4 categorías principales
    const categoryQuestions = allQuestions.filter(q => q.category === categoryId);
    
    console.log(`🔍 Buscando categoría: "${categoryId}"`);
    console.log(`📊 Preguntas encontradas: ${categoryQuestions.length}`);
    
    if (categoryQuestions.length === 0) {
        console.warn(`⚠️ No hay preguntas para la categoría: ${categoryId}`);
        
        // Usar preguntas de fallback para las 4 categorías principales
        const fallbackQuestions = getFallbackQuestionsForCategory(categoryId);
        gameState.categoryQuestions = fallbackQuestions.slice(0, 2);
        
        console.log(`⚡ Usando ${gameState.categoryQuestions.length} preguntas de fallback para "${categoryId}"`);
    } else {
        // Tomar exactamente 2 preguntas aleatorias de la categoría correcta
        const shuffledQuestions = categoryQuestions.sort(() => 0.5 - Math.random());
        gameState.categoryQuestions = shuffledQuestions.slice(0, 2);
        
        console.log(`✅ Seleccionadas ${gameState.categoryQuestions.length} preguntas de "${categoryId}"`);
    }
    
    // Actualizar header
    updateGameHeader(categoryId);
    
    // Cargar primera pregunta
    loadCategoryQuestion(0);
}

function getFallbackQuestionsForCategory(categoryId) {
    const fallbackQuestions = {
        'antiguo-testamento': [
            {
                text: "¿Quién construyó el arca según el mandato de Dios?",
                options: ["Noé", "Abraham", "Moisés", "David"],
                correctIndex: 0,
                reference: "Génesis 6:14",
                category: "antiguo-testamento"
            },
            {
                text: "¿Cuántos días llovió durante el diluvio?",
                options: ["30", "40", "50", "60"],
                correctIndex: 1,
                reference: "Génesis 7:12",
                category: "antiguo-testamento"
            },
            {
                text: "¿Quién recibió las tablas de los Diez Mandamientos?",
                options: ["Abraham", "Moisés", "Josué", "David"],
                correctIndex: 1,
                reference: "Éxodo 31:18",
                category: "antiguo-testamento"
            }
        ],
        'nuevo-testamento': [
            {
                text: "¿Cuántos apóstoles tuvo Jesús?",
                options: ["10", "12", "7", "14"],
                correctIndex: 1,
                reference: "Mateo 10:1-4",
                category: "nuevo-testamento"
            },
            {
                text: "¿Quién negó a Jesús tres veces?",
                options: ["Juan", "Pedro", "Judas", "Tomás"],
                correctIndex: 1,
                reference: "Mateo 26:69-75",
                category: "nuevo-testamento"
            },
            {
                text: "¿Quién traicionó a Jesús por 30 piezas de plata?",
                options: ["Pedro", "Juan", "Judas Iscariote", "Tomás"],
                correctIndex: 2,
                reference: "Mateo 26:14-16",
                category: "nuevo-testamento"
            }
        ],
        'personajes-biblicos': [
            {
                text: "¿Quién fue el hombre más fuerte de la Biblia?",
                options: ["David", "Sansón", "Goliat", "Saúl"],
                correctIndex: 1,
                reference: "Jueces 13-16",
                category: "personajes-biblicos"
            },
            {
                text: "¿Quién fue arrojado al foso de los leones?",
                options: ["Daniel", "David", "Jonás", "José"],
                correctIndex: 0,
                reference: "Daniel 6:16",
                category: "personajes-biblicos"
            },
            {
                text: "¿Quién fue vendido como esclavo por sus hermanos?",
                options: ["Moisés", "José", "Benjamín", "Isaac"],
                correctIndex: 1,
                reference: "Génesis 37:28",
                category: "personajes-biblicos"
            }
        ],
        'doctrina-cristiana': [
            {
                text: "¿Cuántas personas componen la Trinidad?",
                options: ["Dos", "Tres", "Cuatro", "Una"],
                correctIndex: 1,
                reference: "Mateo 28:19",
                category: "doctrina-cristiana"
            },
            {
                text: "¿Cuál es el primer mandamiento?",
                options: ["No matarás", "Amarás a Dios sobre todas las cosas", "No robarás", "Honrarás padre y madre"],
                correctIndex: 1,
                reference: "Mateo 22:37-38",
                category: "doctrina-cristiana"
            },
            {
                text: "¿Qué significa la palabra 'Evangelio'?",
                options: ["Buenas nuevas", "Enseñanza", "Palabra sagrada", "Mandamiento"],
                correctIndex: 0,
                reference: "Marcos 1:1",
                category: "doctrina-cristiana"
            }
        ]
    };
    
    return fallbackQuestions[categoryId] || [];
}

function updateGameHeader(categoryId) {
    const gameHeader = document.querySelector('.game-header');
    if (gameHeader) {
        const categoryName = CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
        gameHeader.innerHTML = `
            <div class="current-category">${categoryName}</div>
            <div class="question-counter" id="question-counter">1/2</div>
        `;
    }
}

function loadCategoryQuestion(index) {
    if (!gameState.categoryQuestions[index]) {
        console.error('❌ No hay pregunta para el índice:', index);
        return;
    }

    const question = gameState.categoryQuestions[index];
    gameState.currentQuestion = question;
    console.log(`📝 Cargando pregunta ${index + 1}/2:`, question.text);

    // Actualizar contador
    const questionCounter = document.getElementById('question-counter');
    if (questionCounter) {
        questionCounter.textContent = `${index + 1}/2`;
    }

    // Ocultar modo rescate si estaba visible
    if (elements.rescueMode) {
        elements.rescueMode.style.display = 'none';
    }

    // Crear contenedor de pregunta con eventos inline
    elements.mainQuestionContainer.innerHTML = `
        <div class="timer-container" id="main-timer-display">20</div>
        ${question.reference ? `<div class="question-reference">${question.reference}</div>` : ''}
        <div class="question-text">${question.text}</div>
        <div class="options-container" id="main-options-container">
            ${question.options.map((option, optionIndex) => 
                `<button class="option-btn" onclick="handleCategoryAnswer(${optionIndex}, ${question.correctIndex}, ${index})">${option}</button>`
            ).join('')}
        </div>
    `;

    // Iniciar timer
    startTimer(20, () => {
        handleCategoryAnswer(-1, question.correctIndex, index);
    });
}

function evaluateCategoryProgress(wasCorrect, questionIndex) {
    const correct = gameState.categoryCorrectAnswers;
    
    if (questionIndex === 0) {
        // Primera pregunta - siempre continúa a la segunda
        loadCategoryQuestion(1);
    } else {
        // Segunda pregunta - evaluar resultado
        if (correct === 2) {
            // 2/2 - Categoría completada
            completeCategory();
        } else if (correct === 1) {
            // 1/2 - Pregunta de rescate
            showRescueQuestion();
        } else {
            // 0/2 - Eliminado - SISTEMA JUSTO DE PENALIZACIÓN
            gameState.eliminationPhase = gameState.completedCategories.length + 1;
            const penaltyKey = `category${gameState.eliminationPhase}`;
            gameState.coins = Math.max(0, gameState.coins - PENALTY_SYSTEM[penaltyKey]);
            saveGameData();
            showGameOver();
        }
    }
}

async function showRescueQuestion() {
    console.log('⚡ Pregunta de rescate');
    
    // Mostrar modo rescate
    elements.rescueMode.style.display = 'block';
    elements.rescueMode.innerHTML = `
        <h3><i class="fas fa-life-ring"></i> PREGUNTA DE RESCATE</h3>
        <p>¡Última oportunidad! Responde correctamente para continuar a la siguiente categoría.</p>
    `;

    // Cargar pregunta de rescate
    const allQuestions = await loadQuestionsFromJSON();
    const categoryQuestions = allQuestions.filter(q => q.category === gameState.currentCategory);
    
    const usedQuestions = gameState.categoryQuestions.map(q => q.text);
    let rescueQuestion = categoryQuestions.find(q => !usedQuestions.includes(q.text));
    
    if (!rescueQuestion) {
        console.warn('No hay pregunta de rescate disponible, usando fallback');
        // Usar pregunta de fallback
        const fallbackQuestions = getFallbackQuestionsForCategory(gameState.currentCategory);
        rescueQuestion = fallbackQuestions.find(q => !usedQuestions.includes(q.text)) || fallbackQuestions[2];
    }
    
    console.log(`✅ Pregunta de rescate cargada para "${gameState.currentCategory}"`);
    loadRescueQuestion(rescueQuestion);
}

function loadRescueQuestion(question) {
    console.log('📝 Cargando pregunta de rescate:', question.text);
    gameState.currentQuestion = question;

    elements.mainQuestionContainer.innerHTML = `
        <div class="timer-container" id="main-timer-display">30</div>
        ${question.reference ? `<div class="question-reference">${question.reference}</div>` : ''}
        <div class="question-text">${question.text}</div>
        <div class="options-container" id="main-options-container">
            ${question.options.map((option, optionIndex) => 
                `<button class="option-btn" onclick="handleRescueAnswer(${optionIndex}, ${question.correctIndex})">${option}</button>`
            ).join('')}
        </div>
    `;

    // Timer más largo para pregunta de rescate
    startTimer(30, () => {
        handleRescueAnswer(-1, question.correctIndex);
    });
}

function completeCategory() {
    gameState.completedCategories.push(gameState.currentCategory);
    gameState.pendingCategories = gameState.pendingCategories.filter(c => c.id !== gameState.currentCategory);
    
    const rewardKey = `category${gameState.completedCategories.length}`;
    const reward = REWARD_SYSTEM[rewardKey];
    gameState.coins += reward;
    
    console.log(`✅ Categoría ${gameState.currentCategory} completada`);
    console.log(`📊 Categorías completadas: ${gameState.completedCategories.length}/${CATEGORIES.length}`);
    
    updateDisplay();
    saveGameData();
    
    if (gameState.completedCategories.length >= CATEGORIES.length) {
        // Victoria total
        showVictory();
    } else {
        // Continuar a siguiente categoría
        showCategoryResults();
    }
}

function showCategoryResults() {
    const categoryName = CATEGORIES.find(c => c.id === gameState.currentCategory)?.name || gameState.currentCategory;
    const rewardKey = `category${gameState.completedCategories.length}`;
    const reward = REWARD_SYSTEM[rewardKey];
    
    elements.categoryResultsTitle.textContent = '¡Categoría Completada!';
    elements.categoryResultsDescription.textContent = `Has completado exitosamente: ${categoryName}`;
    
    elements.rewardInfo.innerHTML = `
        <div style="background: rgba(255, 215, 0, 0.2); padding: 15px; border-radius: 10px; margin: 20px 0;">
            <h4 style="color: #ffd700; margin-bottom: 10px;">Recompensas Obtenidas:</h4>
            <p><i class="fas fa-coins"></i> +${reward} monedas</p>
            <p><i class="fas fa-trophy"></i> Categoría desbloqueada</p>
        </div>
    `;
    
    elements.categoryResultsModal.style.display = 'flex';
}

function showRemainingCategories() {
    elements.categorySelection.style.display = 'flex';
    
    const categoryTitle = document.querySelector('.category-title');
    const categoryDescription = document.querySelector('.category-description');
    
    if (categoryTitle) {
        categoryTitle.textContent = 'Siguiente Categoría';
    }
    
    if (categoryDescription) {
        categoryDescription.textContent = `¡Excelente! Te quedan ${gameState.pendingCategories.length} categorías por completar.`;
    }
    
    elements.categoriesGrid.innerHTML = gameState.pendingCategories.map(category => `
        <div class="category-card" onclick="startCategoryGame('${category.id}', false)">
            <div class="category-icon">
                <i class="fas ${category.icon}"></i>
            </div>
            <div class="category-name">${category.name}</div>
            <div class="category-questions">2 preguntas + 1 rescate</div>
        </div>
    `).join('');
}

function showVictory() {
    const victoryBonus = 200;
    gameState.coins += victoryBonus;
    
    // Incrementar contador de victorias
    try {
        const savedData = localStorage.getItem('quizCristianoData');
        let data = savedData ? JSON.parse(savedData) : {};
        data.victories = (data.victories || 0) + 1;
        data.coins = gameState.coins;
        localStorage.setItem('quizCristianoData', JSON.stringify(data));
    } catch (error) {
        console.warn('⚠️ Error actualizando victorias:', error);
    }
    
    elements.victoryStats.innerHTML = `
        <div class="victory-stat">
            <span class="victory-stat-value">${CATEGORIES.length}</span>
            <span class="victory-stat-label">Categorías Completadas</span>
        </div>
        <div class="victory-stat">
            <span class="victory-stat-value">+${victoryBonus}</span>
            <span class="victory-stat-label">Bonus Victoria</span>
        </div>
        <div class="victory-stat">
            <span class="victory-stat-value">${gameState.coins}</span>
            <span class="victory-stat-label">Monedas Totales</span>
        </div>
        <div class="victory-stat">
            <span class="victory-stat-value">🏆</span>
            <span class="victory-stat-label">¡Campeón!</span>
        </div>
    `;
    
    saveGameData();
    elements.victoryModal.style.display = 'flex';
}

function showGameOver() {
    const phaseNames = {
        'initial': 'Fase Inicial',
        1: 'Primera Categoría',
        2: 'Segunda Categoría', 
        3: 'Tercera Categoría',
        4: 'Cuarta Categoría'
    };
    
    const phaseName = phaseNames[gameState.eliminationPhase] || 'Juego';
    const penaltyKey = gameState.eliminationPhase === 'initial' ? 'initial' : `category${gameState.eliminationPhase}`;
    const penalty = PENALTY_SYSTEM[penaltyKey];
    
    elements.gameOverPhaseDescription.textContent = `Eliminado en: ${phaseName}`;
    
    elements.penaltyInfo.innerHTML = `
        <p>Penalización:</p>
        <div class="penalty-amount" style="font-size: 1.5rem; color: #e74c3c; font-weight: bold; margin: 10px 0;">-${penalty} monedas</div>
        <p>Monedas restantes: <strong>${gameState.coins}</strong></p>
    `;
    
    elements.finalStats.innerHTML = `
        <div style="margin: 20px 0;">
            <p><strong>Categorías completadas:</strong> ${gameState.completedCategories.length}/${CATEGORIES.length}</p>
            <p><strong>Progreso:</strong> ${Math.round((gameState.completedCategories.length / CATEGORIES.length) * 100)}%</p>
            <p style="margin-top: 15px; font-size: 0.9rem; opacity: 0.8;">
                💡 <em>Consejo: A mayor progreso, menor penalización por eliminación</em>
            </p>
        </div>
    `;
    
    elements.gameOverModal.style.display = 'flex';
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function startTimer(duration, callback) {
    gameState.timer = duration;
    const timerElement = gameState.phase === 'initial' ? 
        document.getElementById('timer-display') : document.getElementById('main-timer-display');
    
    updateTimer(timerElement, gameState.timer);
    
    gameState.timerInterval = setInterval(() => {
        gameState.timer--;
        updateTimer(timerElement, gameState.timer);
        
        if (gameState.timer <= 0) {
            clearInterval(gameState.timerInterval);
            callback();
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimer(timerElement, timeLeft) {
    if (timerElement) {
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 5) {
            timerElement.classList.add('warning');
        } else {
            timerElement.classList.remove('warning');
        }
    }
}

function updateDisplay() {
    if (elements.coinsCount) {
        elements.coinsCount.textContent = gameState.coins;
    }
    updateCategoriesProgress();
}

function updateCategoriesProgress() {
    if (!elements.categoriesProgress) return;

    elements.categoriesProgress.innerHTML = '';

    CATEGORIES.forEach((category, index) => {
        const progressItem = document.createElement('div');
        progressItem.className = 'category-progress-item';
        
        if (gameState.completedCategories.includes(category.id)) {
            progressItem.classList.add('completed');
        } else if (index === gameState.completedCategories.length) {
            progressItem.classList.add('current');
        } else {
            progressItem.classList.add('locked');
        }

        progressItem.innerHTML = `<i class="fas ${category.icon}"></i>`;
        elements.categoriesProgress.appendChild(progressItem);
    });
}

function loadGameData() {
    try {
        const savedData = localStorage.getItem('quizCristianoData');
        if (savedData) {
            const data = JSON.parse(savedData);
            gameState.coins = data.coins || 0;
            console.log('📄 Monedas cargadas:', gameState.coins);
        }
    } catch (error) {
        console.warn('⚠️ Error cargando datos guardados:', error);
    }
}

function saveGameData() {
    try {
        const dataToSave = {
            coins: gameState.coins,
            lastPlayed: Date.now(),
            victories: getVictoryCount()
        };
        localStorage.setItem('quizCristianoData', JSON.stringify(dataToSave));
        console.log('💾 Datos guardados');
    } catch (error) {
        console.error('❌ Error guardando datos:', error);
    }
}

function getVictoryCount() {
    try {
        const savedData = localStorage.getItem('quizCristianoData');
        if (savedData) {
            const data = JSON.parse(savedData);
            return data.victories || 0;
        }
    } catch (error) {
        console.warn('⚠️ Error obteniendo victorias:', error);
    }
    return 0;
}

async function loadQuestionsFromJSON() {
    try {
        console.log('📥 Cargando preguntas desde JSON...');
        const response = await fetch('./data/questions.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const questions = await response.json();
        console.log(`✅ ${questions.length} preguntas cargadas desde JSON`);
        return questions;
    } catch (error) {
        console.warn('⚠️ Error cargando questions.json:', error);
        console.log('🔄 Usando preguntas de fallback...');
        
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
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 DOM cargado, inicializando Single Player Game...');
    
    // Esperar un poco para asegurar que el DOM esté completamente renderizado
    setTimeout(() => {
        init();
    }, 100);

    // Manejar cierre de página
    window.addEventListener('beforeunload', function() {
        stopTimer();
    });
});

console.log('✅ Single-Player.js CORREGIDO - 4 Categorías + Sistema Justo cargado completamente');