/**
 * ================================================
 * SINGLE PLAYER GAME - NUEVA LÓGICA DE CATEGORÍAS
 * Quiz Cristiano - Sistema corregido: 3 preguntas + repechaje
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

// ✅ NUEVA CONFIGURACIÓN PARA CATEGORÍAS (3 PREGUNTAS)
const CATEGORY_CONFIG = {
    questionsPerCategory: 3,        // ✅ CAMBIADO DE 5 A 3
    minCorrectToWin: 3,            // 3 correctas = victoria inmediata
    correctForRepechage: 2,        // 2 correctas = repechaje
    maxIncorrectBeforeGameOver: 2   // 2 incorrectas = game over
};

const COIN_REWARDS = {
    categoryCorrect: 4,
    categoryComplete: 15,
    rescueSuccess: 8,
    gameComplete: 70,
    perfectGame: 100,
    speedBonus: 8,
    wrongAnswer: -8,
    timeoutPenalty: -4
};

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
    categoryIncorrectAnswers: 0,           // ✅ CONTADOR DE INCORRECTAS
    needsRepechageQuestion: false,         // ✅ RENOMBRADO
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
        await waitForGameDataManager();
        bindElements();
        setupGameDataListeners();
        await loadQuestions();
        updateAllDisplays();
        
        console.log('✅ Single Player Game inicializado correctamente');
    } catch (error) {
        console.error('❌ Error durante la inicialización:', error);
        showNotification('Error al inicializar el juego', 'error');
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
    console.log('🔗 Configurando listeners de GameDataManager...');
    
    window.GameDataManager.onCoinsChanged((data) => {
        updateCoinsDisplay();
        if (data.difference > 0) {
            showCoinAnimation(data.difference, true);
        } else if (data.difference < 0) {
            showCoinAnimation(Math.abs(data.difference), false);
        }
    });
    
    window.GameDataManager.onInventoryChanged((data) => {
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
        console.log('📚 === CARGANDO PREGUNTAS ===');
        
        const response = await fetch('./data/questions.json?' + Date.now());
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('El JSON no contiene un array válido');
        }
        
        console.log(`📊 JSON cargado: ${data.length} elementos encontrados`);
        
        const validQuestions = data.filter(item => {
            const isValid = item && 
                           typeof item.text === 'string' && 
                           Array.isArray(item.options) && 
                           item.options.length === 4 &&
                           typeof item.correctIndex === 'number' &&
                           item.correctIndex >= 0 && 
                           item.correctIndex < 4 &&
                           typeof item.category === 'string';
            
            if (!isValid) {
                console.warn('❌ Pregunta inválida encontrada:', item);
            }
            
            return isValid;
        });
        
        console.log(`✅ Preguntas válidas: ${validQuestions.length} de ${data.length}`);
        
        const categoryCount = {};
        validQuestions.forEach(q => {
            categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
        });
        
        console.log('📋 Distribución por categorías:');
        Object.entries(categoryCount).forEach(([category, count]) => {
            console.log(`  - ${category}: ${count} preguntas`);
        });
        
        if (validQuestions.length < 20) {
            console.warn('⚠️ Muy pocas preguntas válidas, usando fallback');
            allQuestions = getFallbackQuestions();
        } else {
            allQuestions = validQuestions;
        }
        
        console.log(`📚 Total preguntas cargadas: ${allQuestions.length}`);
        
    } catch (error) {
        console.error('❌ Error cargando preguntas:', error);
        console.log('🆘 Usando preguntas de emergencia');
        allQuestions = getFallbackQuestions();
    }
    
    initialQuestions = getRandomInitialQuestions();
    console.log('📝 Preguntas iniciales preparadas:', initialQuestions.length);
}

function getFallbackQuestions() {
    return [
        {
            id: "fallback_at001",
            category: "antiguo-testamento",
            text: "¿Quién construyó el arca según el relato bíblico?",
            options: ["Noé", "Moisés", "Abraham", "David"],
            correctIndex: 0,
            difficulty: "fácil",
            reference: "Génesis 6:14"
        },
        {
            id: "fallback_nt001",
            category: "nuevo-testamento",
            text: "¿Cuántos apóstoles eligió Jesús?",
            options: ["10", "12", "14", "16"],
            correctIndex: 1,
            difficulty: "fácil",
            reference: "Mateo 10:1-4"
        },
        {
            id: "fallback_pb001",
            category: "personajes-biblicos",
            text: "¿Quién fue conocido como 'el padre de la fe'?",
            options: ["Noé", "Abraham", "Isaac", "Jacob"],
            correctIndex: 1,
            difficulty: "fácil",
            reference: "Romanos 4:16"
        },
        {
            id: "fallback_dc001",
            category: "doctrina-cristiana",
            text: "¿Cuáles son los dos grandes mandamientos según Jesús?",
            options: ["Amar a Dios y al prójimo", "No matar y no robar", "Orar y ayunar", "Bautizarse y comulgar"],
            correctIndex: 0,
            difficulty: "fácil",
            reference: "Mateo 22:37-39"
        }
    ];
}

// ✅ FUNCIÓN CORREGIDA PARA PREGUNTAS INICIALES ALEATORIAS
function getRandomInitialQuestions() {
    console.log('🎲 Generando preguntas iniciales aleatorias...');
    
    if (allQuestions && allQuestions.length >= 8) {
        console.log(`📚 Usando preguntas del JSON (${allQuestions.length} disponibles)`);
        
        const randomQuestions = [];
        const availableQuestions = [...allQuestions];
        
        for (let i = 0; i < 8 && availableQuestions.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableQuestions.length);
            const selectedQuestion = availableQuestions[randomIndex];
            
            if (selectedQuestion && 
                selectedQuestion.text && 
                selectedQuestion.options && 
                Array.isArray(selectedQuestion.options) && 
                selectedQuestion.options.length === 4 &&
                typeof selectedQuestion.correctIndex === 'number') {
                
                randomQuestions.push({
                    ...selectedQuestion,
                    id: selectedQuestion.id || `initial_${i + 1}`,
                    reference: selectedQuestion.reference || 'Escrituras'
                });
                
                availableQuestions.splice(randomIndex, 1);
                console.log(`✅ Pregunta inicial ${i + 1}: "${selectedQuestion.text}" (Categoría: ${selectedQuestion.category})`);
            }
        }
        
        if (randomQuestions.length >= 8) {
            console.log(`🎯 Se generaron ${randomQuestions.length} preguntas iniciales aleatorias`);
            return randomQuestions;
        }
    }
    
    console.log('⚠️ Usando preguntas de fallback aleatorias');
    
    const fallbackQuestions = [
        {
            text: "¿Cuántos días estuvo Jesús en el desierto siendo tentado?",
            options: ["30 días", "40 días", "50 días", "60 días"],
            correctIndex: 1,
            reference: "Mateo 4:2",
            category: "nuevo-testamento"
        },
        {
            text: "¿Quién construyó el arca según el relato bíblico?",
            options: ["Noé", "Moisés", "Abraham", "David"],
            correctIndex: 0,
            reference: "Génesis 6:14",
            category: "antiguo-testamento"
        },
        {
            text: "¿Quién fue el hombre más fuerte de la Biblia?",
            options: ["Sansón", "David", "Goliat", "Saúl"],
            correctIndex: 0,
            reference: "Jueces 13-16",
            category: "personajes-biblicos"
        },
        {
            text: "¿Cuáles son los dos grandes mandamientos según Jesús?",
            options: ["Amar a Dios y al prójimo", "No matar y no robar", "Orar y ayunar", "Bautizarse y comulgar"],
            correctIndex: 0,
            reference: "Mateo 22:37-39",
            category: "doctrina-cristiana"
        },
        {
            text: "¿Cuántos apóstoles eligió Jesús?",
            options: ["10", "12", "14", "16"],
            correctIndex: 1,
            reference: "Mateo 10:1-4",
            category: "nuevo-testamento"
        },
        {
            text: "¿En qué ciudad nació Jesús?",
            options: ["Nazaret", "Jerusalén", "Belén", "Capernaum"],
            correctIndex: 2,
            reference: "Lucas 2:4",
            category: "nuevo-testamento"
        },
        {
            text: "¿Quién interpretó los sueños del Faraón?",
            options: ["Moisés", "José", "Daniel", "Salomón"],
            correctIndex: 1,
            reference: "Génesis 41:25-32",
            category: "antiguo-testamento"
        },
        {
            text: "¿Quién fue conocido como 'el padre de la fe'?",
            options: ["Noé", "Abraham", "Isaac", "Jacob"],
            correctIndex: 1,
            reference: "Romanos 4:16",
            category: "personajes-biblicos"
        }
    ];
    
    const shuffledQuestions = [...fallbackQuestions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }
    
    const selectedQuestions = shuffledQuestions.slice(0, 8);
    
    selectedQuestions.forEach((q, index) => {
        q.id = `fallback_initial_${index + 1}`;
    });
    
    console.log('🎲 Preguntas iniciales aleatorias generadas de fallback');
    return selectedQuestions;
}

// ============================================
// CONTROL DE PANTALLAS
// ============================================

function showScreen(screenId) {
    const screens = ['welcome-screen', 'question-screen', 'categories-screen', 'victory-screen', 'gameover-screen'];
    
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) {
            screen.classList.remove('active');
        }
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log(`📺 Pantalla cambiada a: ${screenId}`);
    }
}

function updatePhaseIndicator(text) {
    if (elements.phaseIndicator) {
        elements.phaseIndicator.innerHTML = `<span>${text}</span>`;
    }
}

// ============================================
// SISTEMA DE TIMER
// ============================================

function startTimer(duration, callback) {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timer = duration;
    gameState.questionStartTime = Date.now();
    
    updateTimerDisplay(gameState.timer);
    
    if (elements.timerSection) {
        elements.timerSection.classList.add('show');
    }
    
    gameState.timerInterval = setInterval(() => {
        gameState.timer--;
        updateTimerDisplay(gameState.timer);
        
        if (gameState.timer <= 0) {
            clearInterval(gameState.timerInterval);
            if (callback) callback();
        }
    }, 1000);
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
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    if (elements.timerSection) {
        elements.timerSection.classList.remove('show');
    }
}

// ✅ FUNCIÓN TIMER PHASE TEXT ACTUALIZADA PARA REPECHAJE
function updateTimerPhaseText(phase, questionInfo) {
    const phaseTexts = {
        initial: 'Preguntas Iniciales',
        category: `Categoría: ${questionInfo}`,
        repechage: 'Pregunta de Repechaje'  // ✅ NUEVA FASE
    };
    
    if (elements.timerPhase) {
        elements.timerPhase.textContent = phaseTexts[phase] || phase;
    }
    
    if (elements.timerQuestion) {
        let questionNum;
        if (phase === 'repechage') {
            questionNum = 'Repechaje';  // ✅ MOSTRAR "REPECHAJE"
        } else if (phase === 'category') {
            questionNum = gameState.categoryQuestionIndex + 1;
        } else {
            questionNum = gameState.currentQuestionIndex + 1;
        }
        elements.timerQuestion.textContent = `Pregunta ${questionNum}`;
    }
}

// ============================================
// FUNCIONES PRINCIPALES DEL JUEGO
// ============================================

window.startGame = function() {
    console.log('🎮 Iniciando nuevo juego...');
    
    // Reiniciar estado del juego
    gameState = {
        phase: 'initial',
        currentQuestionIndex: 0,
        initialCorrectAnswers: 0,
        completedCategories: [],
        pendingCategories: [...CATEGORIES],
        currentCategory: '',
        categoryQuestions: [],
        categoryQuestionIndex: 0,
        categoryCorrectAnswers: 0,
        categoryIncorrectAnswers: 0,       // ✅ REINICIAR CONTADOR
        needsRepechageQuestion: false,
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
    
    updatePhaseIndicator('Preguntas Iniciales');
    updateAllDisplays();
    
    showScreen('question-screen');
    loadInitialQuestion(0);
};

function loadInitialQuestion(index) {
    if (index >= initialQuestions.length) {
        console.log('📊 Todas las preguntas iniciales completadas');
        evaluateInitialPhase();
        return;
    }
    
    gameState.currentQuestionIndex = index;
    gameState.currentQuestion = initialQuestions[index];
    gameState.isProcessingAnswer = false;
    
    console.log(`📝 Cargando pregunta inicial ${index + 1}/3: "${gameState.currentQuestion.text}"`);
    
    updateQuestionDisplay(gameState.currentQuestion);
    updateTimerPhaseText('initial', '');
    
    startTimer(20, () => {
        console.log('⏰ Tiempo agotado en pregunta inicial');
        handleInitialAnswer(false, -1, false);
    });
}

function updateQuestionDisplay(question) {
    if (!question) {
        console.error('❌ No hay pregunta para mostrar');
        return;
    }
    
    if (elements.questionText) {
        elements.questionText.textContent = question.text;
    }
    
    if (elements.bibleReference) {
        elements.bibleReference.textContent = question.reference || '';
        elements.bibleReference.style.display = question.reference ? 'block' : 'none';
    }
    
    if (elements.answersContainer) {
        elements.answersContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.innerHTML = `
                <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
                <span class="answer-text">${option}</span>
            `;
            button.onclick = () => selectAnswer(index);
            elements.answersContainer.appendChild(button);
        });
    }
    
    updatePowerups();
}

// ✅ FUNCIÓN SELECTANSWER CORREGIDA PARA REPECHAJE
window.selectAnswer = function(selectedIndex) {
    if (gameState.isProcessingAnswer) {
        console.log('⏸️ Ya se está procesando una respuesta');
        return;
    }
    
    if (!gameState.currentQuestion) {
        console.error('❌ No hay pregunta actual');
        return;
    }
    
    console.log(`👆 Respuesta seleccionada: ${selectedIndex} para pregunta "${gameState.currentQuestion.text}"`);
    
    gameState.isProcessingAnswer = true;
    stopTimer();
    
    const correctIndex = gameState.currentQuestion.correctIndex;
    const isCorrect = selectedIndex === correctIndex;
    
    // Calcular bonus de velocidad
    const timeElapsed = (Date.now() - gameState.questionStartTime) / 1000;
    const speedBonus = timeElapsed < 10;
    
    console.log(`✅ Respuesta ${isCorrect ? 'CORRECTA' : 'INCORRECTA'}. Tiempo: ${timeElapsed.toFixed(1)}s`);
    
    // Marcar respuestas visualmente
    markAnswers(selectedIndex, correctIndex);
    
    // ✅ PROCESAR SEGÚN LA FASE (INCLUYENDO REPECHAJE)
    setTimeout(() => {
        if (gameState.phase === 'initial') {
            handleInitialAnswer(isCorrect, selectedIndex, speedBonus);
        } else if (gameState.phase === 'category') {
            handleCategoryAnswer(isCorrect, selectedIndex, speedBonus);
        } else if (gameState.phase === 'repechage') {  // ✅ NUEVA FASE
            handleRepechageAnswer(isCorrect, selectedIndex, speedBonus);
        }
    }, 1500);
};

// ============================================
// MANEJO DE RESPUESTAS POR FASE
// ============================================

function handleInitialAnswer(isCorrect, selectedIndex, speedBonus) {
    console.log(`🎯 Procesando respuesta inicial: ${isCorrect ? 'CORRECTA' : 'INCORRECTA'}`);
    
    if (isCorrect) {
        gameState.initialCorrectAnswers++;
        gameState.totalCorrectAnswers++;
        
        const coinsEarned = COIN_REWARDS.categoryCorrect + (speedBonus ? COIN_REWARDS.speedBonus : 0);
        window.GameDataManager.addCoins(coinsEarned, 'initial_correct');
        
        showNotification(`¡Correcto! +${coinsEarned} monedas`, 'success');
    } else {
        gameState.perfectGame = false;
        
        const coinsPenalty = Math.abs(COIN_REWARDS.wrongAnswer);
        window.GameDataManager.spendCoins(coinsPenalty, 'initial_wrong');
        
        showNotification(`Incorrecto. -${coinsPenalty} monedas`, 'error');
    }
    
    gameState.totalQuestions++;
    
    // Verificar si perdió el juego (2 respuestas incorrectas)
    const incorrectAnswers = gameState.totalQuestions - gameState.initialCorrectAnswers;
    
    if (incorrectAnswers >= 2) {
        console.log('💀 Juego perdido: 2 respuestas incorrectas en fase inicial');
        showGameOver('Has fallado 2 preguntas iniciales');
        return;
    }
    
    // Continuar con la siguiente pregunta inicial
    const nextIndex = gameState.currentQuestionIndex + 1;
    
    if (nextIndex < 3) {
        setTimeout(() => {
            loadInitialQuestion(nextIndex);
        }, 1000);
    } else {
        setTimeout(() => {
            evaluateInitialPhase();
        }, 1000);
    }
}

function evaluateInitialPhase() {
    console.log(`📊 Evaluando fase inicial: ${gameState.initialCorrectAnswers}/3 correctas`);
    
    if (gameState.initialCorrectAnswers >= 3) {
        console.log('🎉 Fase inicial perfecta - puede elegir categorías');
        showCategorySelection();
    } else if (gameState.initialCorrectAnswers === 2) {
        console.log('🎲 2 correctas - categoría aleatoria');
        showRandomCategoryModal();
    } else {
        console.log('💀 Muy pocas respuestas correctas - Game Over');
        showGameOver('Necesitas al menos 2 respuestas correctas');
    }
}

function showRandomCategoryModal() {
    console.log('🎲 Mostrando modal de categoría aleatoria...');
    
    const availableCategories = gameState.pendingCategories.filter(cat => 
        !gameState.completedCategories.includes(cat.id)
    );
    
    if (availableCategories.length === 0) {
        console.error('❌ No hay categorías disponibles');
        showGameOver('No hay categorías disponibles');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableCategories.length);
    const selectedCategory = availableCategories[randomIndex];
    
    gameState.selectedRandomCategory = selectedCategory;
    
    console.log(`🎯 Categoría seleccionada aleatoriamente: ${selectedCategory.name}`);
    
    const modalHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        " id="random-category-modal">
            <div style="
                background: var(--surface-primary);
                backdrop-filter: var(--backdrop-blur);
                border: 1px solid var(--border-primary);
                border-radius: 20px;
                padding: 30px;
                text-align: center;
                max-width: 400px;
                margin: 20px;
                box-shadow: var(--shadow-primary);
            ">
                <h2 style="color: var(--text-accent); margin-bottom: 15px;">
                    <i class="fas fa-dice"></i> Categoría Asignada
                </h2>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">
                    Has respondido 2 preguntas correctas. Se te ha asignado aleatoriamente:
                </p>
                <div style="
                    background: var(--surface-secondary);
                    border: 1px solid var(--border-secondary);
                    border-radius: 15px;
                    padding: 20px;
                    margin: 20px 0;
                ">
                    <i class="fas ${selectedCategory.icon}" style="
                        font-size: 3rem;
                        color: ${selectedCategory.color};
                        margin-bottom: 10px;
                    "></i>
                    <h3 style="color: var(--text-primary); margin: 10px 0;">
                        ${selectedCategory.name}
                    </h3>
                </div>
                <button onclick="acceptRandomCategory()" style="
                    background: linear-gradient(135deg, var(--text-accent), #e6c200);
                    color: #000;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 25px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    <i class="fas fa-play"></i> Continuar
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.acceptRandomCategory = function() {
    console.log('✅ Aceptando categoría aleatoria...');
    
    const modal = document.getElementById('random-category-modal');
    if (modal) {
        modal.remove();
    }
    
    if (gameState.selectedRandomCategory) {
        startCategoryGame(gameState.selectedRandomCategory.id);
    } else {
        console.error('❌ No hay categoría seleccionada');
        showGameOver('Error al seleccionar categoría');
    }
};

function showCategorySelection() {
    console.log('📋 Mostrando selección de categorías...');
    
    updatePhaseIndicator('Selección de Categoría');
    showScreen('categories-screen');
    updateCategoriesSection();
}

function updateCategoriesSection() {
    const categoriesContent = document.querySelector('.categories-content');
    if (!categoriesContent) {
        console.error('❌ No se encontró el contenedor de categorías');
        return;
    }
    
    const availableCategories = CATEGORIES.filter(cat => 
        !gameState.completedCategories.includes(cat.id)
    );
    
    categoriesContent.innerHTML = `
        <div class="categories-header">
            <div class="mascot-celebration">
                <img src="assets/images/joy-festejo.png" alt="Joy celebrando" class="mascot-small">
            </div>
            <h2>¡Excelente trabajo!</h2>
            <p class="categories-subtitle">Elige tu próxima categoría</p>
            <div class="categories-progress">
                ${gameState.completedCategories.map(catId => {
                    const cat = CATEGORIES.find(c => c.id === catId);
                    return `<div class="category-progress-item completed">
                        <i class="fas ${cat.icon}"></i>
                    </div>`;
                }).join('')}
                ${availableCategories.map(() => 
                    '<div class="category-progress-item"><i class="fas fa-circle"></i></div>'
                ).join('')}
            </div>
        </div>
        
        <div class="categories-grid">
            ${availableCategories.map(category => `
                <div class="category-card" data-category="${category.id}" onclick="selectCategory('${category.id}')">
                    <div class="category-icon">
                        <i class="fas ${category.icon}"></i>
                    </div>
                    <div class="category-info">
                        <h3>${category.name}</h3>
                        <p class="category-description">Preguntas sobre ${category.name.toLowerCase()}</p>
                        <div class="category-stats">
                            <span><i class="fas fa-trophy"></i> +15 monedas</span>
                        </div>
                    </div>
                    <div class="category-select">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

window.selectCategory = function(categoryId) {
    console.log(`🎯 Categoría seleccionada: ${categoryId}`);
    startCategoryGame(categoryId);
};

// ✅ FUNCIÓN START CATEGORY GAME CORREGIDA
function startCategoryGame(categoryId) {
    console.log(`🎮 Iniciando juego de categoría: ${categoryId}`);
    
    gameState.phase = 'category';
    gameState.currentCategory = categoryId;
    gameState.categoryQuestionIndex = 0;
    gameState.categoryCorrectAnswers = 0;
    gameState.categoryIncorrectAnswers = 0;    // ✅ REINICIAR CONTADOR
    gameState.needsRepechageQuestion = false;
    
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    updatePhaseIndicator(`Categoría: ${category ? category.name : categoryId}`);
    
    loadCategoryQuestions(categoryId);
    showScreen('question-screen');
    loadCategoryQuestion(0);
}

// ✅ FUNCIÓN LOAD CATEGORY QUESTIONS CORREGIDA (3 PREGUNTAS)
function loadCategoryQuestions(categoryId) {
    console.log(`📚 Cargando preguntas para categoría: ${categoryId}`);
    
    const categoryQuestions = allQuestions.filter(q => q.category === categoryId);
    
    if (categoryQuestions.length === 0) {
        console.warn(`⚠️ No hay preguntas para la categoría ${categoryId}, usando fallback`);
        gameState.categoryQuestions = getFallbackQuestionsByCategory(categoryId);
    } else {
        // ✅ MEZCLAR Y TOMAR SOLO 3 PREGUNTAS
        const shuffled = [...categoryQuestions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        gameState.categoryQuestions = shuffled.slice(0, CATEGORY_CONFIG.questionsPerCategory);
    }
    
    console.log(`✅ ${gameState.categoryQuestions.length} preguntas cargadas para ${categoryId}`);
}

function getFallbackQuestionsByCategory(categoryId) {
    const fallbackQuestions = {
        'antiguo-testamento': [
            {
                text: "¿Quién construyó el arca según el relato bíblico?",
                options: ["Noé", "Moisés", "Abraham", "David"],
                correctIndex: 0,
                reference: "Génesis 6:14"
            },
            {
                text: "¿Cuántos días y noches llovió durante el diluvio?",
                options: ["30", "40", "7", "100"],
                correctIndex: 1,
                reference: "Génesis 7:12"
            },
            {
                text: "¿Quién recibió los Diez Mandamientos?",
                options: ["Abraham", "Moisés", "Josué", "David"],
                correctIndex: 1,
                reference: "Éxodo 31:18"
            }
        ],
        'nuevo-testamento': [
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
                text: "¿Cuál fue el primer milagro de Jesús?",
                options: ["Multiplicar panes", "Caminar sobre agua", "Convertir agua en vino", "Sanar un ciego"],
                correctIndex: 2,
                reference: "Juan 2:11"
            }
        ],
        'personajes-biblicos': [
            {
                text: "¿Quién fue el hombre más fuerte de la Biblia?",
                options: ["Sansón", "David", "Goliat", "Saúl"],
                correctIndex: 0,
                reference: "Jueces 13-16"
            },
            {
                text: "¿Quién fue vendido por sus hermanos?",
                options: ["José", "Benjamín", "Judá", "Rubén"],
                correctIndex: 0,
                reference: "Génesis 37:28"
            },
            {
                text: "¿Quién fue conocido como 'el padre de la fe'?",
                options: ["Noé", "Abraham", "Isaac", "Jacob"],
                correctIndex: 1,
                reference: "Romanos 4:16"
            }
        ],
        'doctrina-cristiana': [
            {
                text: "¿Cuáles son los dos grandes mandamientos según Jesús?",
                options: ["Amar a Dios y al prójimo", "No matar y no robar", "Orar y ayunar", "Bautizarse y comulgar"],
                correctIndex: 0,
                reference: "Mateo 22:37-39"
            },
            {
                text: "¿Cuál es el versículo más corto de la Biblia?",
                options: ["Jesús lloró", "Dios es amor", "Orad sin cesar", "Regocijaos siempre"],
                correctIndex: 0,
                reference: "Juan 11:35"
            },
            {
                text: "¿Cuántos frutos del Espíritu hay?",
                options: ["7", "9", "12", "10"],
                correctIndex: 1,
                reference: "Gálatas 5:22-23"
            }
        ]
    };
    
    return fallbackQuestions[categoryId] || fallbackQuestions['nuevo-testamento'];
}

// ✅ FUNCIÓN LOAD CATEGORY QUESTION CORREGIDA
function loadCategoryQuestion(index) {
    // ✅ VERIFICAR SI YA COMPLETAMOS LAS 3 PREGUNTAS PRINCIPALES
    if (index >= CATEGORY_CONFIG.questionsPerCategory) {
        console.log('📊 Completadas las 3 preguntas principales de categoría');
        evaluateCategoryPhase();
        return;
    }
    
    gameState.categoryQuestionIndex = index;
    gameState.currentQuestion = gameState.categoryQuestions[index];
    gameState.isProcessingAnswer = false;
    
    console.log(`📝 Cargando pregunta ${index + 1}/${CATEGORY_CONFIG.questionsPerCategory} de categoría`);
    
    updateQuestionDisplay(gameState.currentQuestion);
    
    const category = CATEGORIES.find(cat => cat.id === gameState.currentCategory);
    updateTimerPhaseText('category', category ? category.name : gameState.currentCategory);
    
    startTimer(20, () => {
        console.log('⏰ Tiempo agotado en pregunta de categoría');
        handleCategoryAnswer(false, -1, false);
    });
}

// ✅ FUNCIÓN HANDLE CATEGORY ANSWER COMPLETAMENTE CORREGIDA
function handleCategoryAnswer(isCorrect, selectedIndex, speedBonus) {
    console.log(`🎯 Procesando respuesta de categoría: ${isCorrect ? 'CORRECTA' : 'INCORRECTA'}`);
    
    if (isCorrect) {
        gameState.categoryCorrectAnswers++;
        gameState.totalCorrectAnswers++;
        
        const coinsEarned = COIN_REWARDS.categoryCorrect + (speedBonus ? COIN_REWARDS.speedBonus : 0);
        window.GameDataManager.addCoins(coinsEarned, 'category_correct');
        
        showNotification(`¡Correcto! +${coinsEarned} monedas`, 'success');
    } else {
        gameState.categoryIncorrectAnswers++;  // ✅ INCREMENTAR CONTADOR DE INCORRECTAS
        gameState.perfectGame = false;
        
        const coinsPenalty = Math.abs(COIN_REWARDS.wrongAnswer);
        window.GameDataManager.spendCoins(coinsPenalty, 'category_wrong');
        
        showNotification(`Incorrecto. -${coinsPenalty} monedas`, 'error');
        
        // ✅ VERIFICAR SI PERDIÓ EL JUEGO (2 INCORRECTAS)
        if (gameState.categoryIncorrectAnswers >= CATEGORY_CONFIG.maxIncorrectBeforeGameOver) {
            console.log('💀 Perdió el juego: 2 respuestas incorrectas en categoría');
            setTimeout(() => {
                showGameOver('Has fallado 2 preguntas en la categoría');
            }, 1500);
            return;
        }
    }
    
    gameState.totalQuestions++;
    
    const nextIndex = gameState.categoryQuestionIndex + 1;
    
    // ✅ CONTINUAR CON LA SIGUIENTE PREGUNTA SI NO COMPLETAMOS LAS 3
    if (nextIndex < CATEGORY_CONFIG.questionsPerCategory) {
        setTimeout(() => {
            loadCategoryQuestion(nextIndex);
        }, 1000);
    } else {
        // ✅ EVALUAR DESPUÉS DE LAS 3 PREGUNTAS
        setTimeout(() => {
            evaluateCategoryPhase();
        }, 1000);
    }
}

// ✅ FUNCIÓN EVALUATE CATEGORY PHASE COMPLETAMENTE CORREGIDA
function evaluateCategoryPhase() {
    const correctas = gameState.categoryCorrectAnswers;
    const incorrectas = gameState.categoryIncorrectAnswers;
    
    console.log(`📊 Evaluando categoría: ${correctas} correctas, ${incorrectas} incorrectas`);
    
    // ✅ APLICAR NUEVA LÓGICA
    if (correctas === 3) {
        // 3 correctas = Victoria directa
        console.log('🎉 3 respuestas correctas - Categoría ganada');
        setTimeout(() => {
            completeCategory();
        }, 1000);
    } else if (correctas === 2 && incorrectas === 1) {
        // 2 correctas + 1 incorrecta = Pregunta de repechaje
        console.log('🆘 2 correctas, 1 incorrecta - Activando pregunta de repechaje');
        gameState.needsRepechageQuestion = true;
        setTimeout(() => {
            loadRepechageQuestion();
        }, 1000);
    } else if (correctas === 1) {
        // Solo 1 correcta = Pierde categoría
        console.log('💀 Solo 1 respuesta correcta - Categoría perdida');
        setTimeout(() => {
            showGameOver('Necesitas al menos 2 respuestas correctas para continuar');
        }, 1000);
    } else {
        // 0 correctas = Pierde categoría y juego
        console.log('💀 0 respuestas correctas - Juego perdido');
        setTimeout(() => {
            showGameOver('No lograste responder correctamente ninguna pregunta');
        }, 1000);
    }
}

// ✅ FUNCIÓN LOAD REPECHAGE QUESTION CORREGIDA
function loadRepechageQuestion() {
    console.log('🆘 Cargando pregunta de repechaje...');
    
    gameState.phase = 'repechage';  // ✅ CAMBIAR FASE A REPECHAJE
    gameState.isProcessingAnswer = false;
    
    // Buscar una pregunta de repechaje de la misma categoría
    const repechageQuestions = allQuestions.filter(q => 
        q.category === gameState.currentCategory &&
        !gameState.categoryQuestions.some(cq => cq.id === q.id)
    );
    
    if (repechageQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * repechageQuestions.length);
        gameState.currentQuestion = repechageQuestions[randomIndex];
    } else {
        // Usar una pregunta de fallback
        const fallbackQuestions = getFallbackQuestionsByCategory(gameState.currentCategory);
        gameState.currentQuestion = fallbackQuestions[0];
    }
    
    updateQuestionDisplay(gameState.currentQuestion);
    updateTimerPhaseText('repechage', 'Pregunta de Repechaje');  // ✅ MOSTRAR "REPECHAJE"
    
    // ✅ MÁS TIEMPO PARA PREGUNTA DE REPECHAJE (30 SEGUNDOS)
    startTimer(30, () => {
        console.log('⏰ Tiempo agotado en pregunta de repechaje');
        handleRepechageAnswer(false, -1, false);
    });
}

// ✅ FUNCIÓN HANDLE REPECHAGE ANSWER CORREGIDA
function handleRepechageAnswer(isCorrect, selectedIndex, speedBonus) {
    console.log(`🆘 Procesando respuesta de repechaje: ${isCorrect ? 'CORRECTA' : 'INCORRECTA'}`);
    
    if (isCorrect) {
        gameState.categoryCorrectAnswers++;  // ✅ CONTAR COMO CORRECTA ADICIONAL
        gameState.totalCorrectAnswers++;
        
        const coinsEarned = COIN_REWARDS.rescueSuccess + (speedBonus ? COIN_REWARDS.speedBonus : 0);
        window.GameDataManager.addCoins(coinsEarned, 'repechage_success');
        
        showNotification(`¡Repechaje exitoso! +${coinsEarned} monedas`, 'success');
        
        setTimeout(() => {
            completeCategory();
        }, 1500);
    } else {
        gameState.perfectGame = false;
        
        const coinsPenalty = Math.abs(COIN_REWARDS.wrongAnswer);
        window.GameDataManager.spendCoins(coinsPenalty, 'repechage_failed');
        
        showNotification(`Repechaje fallido. -${coinsPenalty} monedas`, 'error');
        
        setTimeout(() => {
            showGameOver('No lograste aprobar el repechaje de la categoría');
        }, 1500);
    }
    
    gameState.totalQuestions++;
}

function completeCategory() {
    console.log(`✅ Categoría ${gameState.currentCategory} completada`);
    
    // Agregar categoría a completadas
    gameState.completedCategories.push(gameState.currentCategory);
    
    // Remover de pendientes
    gameState.pendingCategories = gameState.pendingCategories.filter(cat => 
        cat.id !== gameState.currentCategory
    );
    
    // Recompensa por completar categoría
    const categoryBonus = COIN_REWARDS.categoryComplete;
    window.GameDataManager.addCoins(categoryBonus, 'category_complete');
    
    showNotification(`¡Categoría completada! +${categoryBonus} monedas`, 'success');
    
    // Verificar si completó todas las categorías
    if (gameState.completedCategories.length >= CATEGORIES.length) {
        setTimeout(() => {
            showVictory();
        }, 2000);
    } else {
        // Volver a selección de categorías
        setTimeout(() => {
            showCategorySelection();
        }, 2000);
    }
}

// ============================================
// PANTALLAS DE FINALIZACIÓN
// ============================================

function showVictory() {
    console.log('🎉 ¡VICTORIA! Todas las categorías completadas');
    
    stopTimer();
    updatePhaseIndicator('¡Victoria!');
    
    // Recompensas finales
    const gameCompleteBonus = COIN_REWARDS.gameComplete;
    const perfectBonus = gameState.perfectGame ? COIN_REWARDS.perfectGame : 0;
    const totalBonus = gameCompleteBonus + perfectBonus;
    
    window.GameDataManager.addCoins(totalBonus, 'game_complete');
    
    // Actualizar estadísticas
    const gameResult = {
        victory: true,
        perfect: gameState.perfectGame,
        coinsEarned: totalBonus,
        totalCorrectAnswers: gameState.totalCorrectAnswers,
        totalQuestions: gameState.totalQuestions,
        categoriesCompleted: gameState.completedCategories.length
    };
    
    window.GameDataManager.updateGameStats(gameResult);
    
    showScreen('victory-screen');
    
    // Actualizar contenido de victoria
    const victoryDescription = document.querySelector('.victory-description');
    if (victoryDescription) {
        victoryDescription.innerHTML = `
            <p><strong>¡Felicitaciones!</strong> Has completado todas las categorías del Quiz Cristiano.</p>
            <div style="margin: 20px 0;">
                <p><i class="fas fa-coins"></i> Monedas ganadas: +${totalBonus}</p>
                <p><i class="fas fa-check-circle"></i> Respuestas correctas: ${gameState.totalCorrectAnswers}/${gameState.totalQuestions}</p>
                <p><i class="fas fa-trophy"></i> Categorías completadas: ${gameState.completedCategories.length}/4</p>
                ${gameState.perfectGame ? '<p><i class="fas fa-star"></i> ¡Juego perfecto!</p>' : ''}
            </div>
        `;
    }
    
    const victoryActions = document.querySelector('.victory-actions');
    if (victoryActions) {
        victoryActions.innerHTML = `
            <button class="victory-btn primary" onclick="restartGame()">
                <i class="fas fa-redo"></i> Jugar de Nuevo
            </button>
            <button class="victory-btn secondary" onclick="window.location.href='index.html'">
                <i class="fas fa-home"></i> Volver al Inicio
            </button>
        `;
    }
}

function showGameOver(reason = 'Juego terminado') {
    console.log(`💀 Game Over: ${reason}`);
    
    stopTimer();
    updatePhaseIndicator('Game Over');
    
    // Actualizar estadísticas
    const gameResult = {
        victory: false,
        perfect: false,
        coinsEarned: 0,
        totalCorrectAnswers: gameState.totalCorrectAnswers,
        totalQuestions: gameState.totalQuestions,
        categoriesCompleted: gameState.completedCategories.length
    };
    
    window.GameDataManager.updateGameStats(gameResult);
    
    showScreen('gameover-screen');
    
    // Actualizar contenido de game over
    const gameoverDescription = document.querySelector('.gameover-description');
    if (gameoverDescription) {
        gameoverDescription.innerHTML = `
            <p>${reason}</p>
            <div style="margin: 20px 0;">
                <p><i class="fas fa-check-circle"></i> Respuestas correctas: ${gameState.totalCorrectAnswers}/${gameState.totalQuestions}</p>
                <p><i class="fas fa-trophy"></i> Categorías completadas: ${gameState.completedCategories.length}/4</p>
            </div>
            <p>¡No te desanimes! Cada intento te acerca más a la maestría bíblica.</p>
        `;
    }
}

window.restartGame = function() {
    console.log('🔄 Reiniciando juego...');
    window.startGame();
};

// ============================================
// POWER-UPS SYSTEM
// ============================================

function updatePowerups() {
    if (!elements.powerupsSection || !window.GameDataManager) return;
    
    const inventory = window.GameDataManager.getInventory();
    
    elements.powerupsSection.innerHTML = `
        <button class="powerup-btn ${inventory.eliminate > 0 ? '' : 'disabled'}" 
                onclick="usePowerup('eliminate')" 
                title="Eliminar opciones (${inventory.eliminate})">
            <i class="fas fa-eraser"></i>
            <span class="powerup-count">${inventory.eliminate}</span>
        </button>
        <button class="powerup-btn ${inventory.timeExtender > 0 ? '' : 'disabled'}" 
                onclick="usePowerup('timeExtender')" 
                title="Tiempo extra (${inventory.timeExtender})">
            <i class="fas fa-clock"></i>
            <span class="powerup-count">${inventory.timeExtender}</span>
        </button>
        <button class="powerup-btn ${inventory.secondChance > 0 ? '' : 'disabled'}" 
                onclick="usePowerup('secondChance')" 
                title="Segunda oportunidad (${inventory.secondChance})">
            <i class="fas fa-heart"></i>
            <span class="powerup-count">${inventory.secondChance}</span>
        </button>
    `;
}

window.usePowerup = function(powerupType) {
    if (gameState.isProcessingAnswer) {
        console.log('⏸️ No se pueden usar power-ups mientras se procesa una respuesta');
        return;
    }
    
    if (!window.GameDataManager.getPowerupCount(powerupType)) {
        showNotification('No tienes este power-up', 'error');
        return;
    }
    
    switch (powerupType) {
        case 'eliminate':
            eliminateOptions();
            break;
        case 'timeExtender':
            extendTime();
            break;
        case 'secondChance':
            activateSecondChance();
            break;
        default:
            console.error('Power-up desconocido:', powerupType);
    }
};

function eliminateOptions() {
    if (!gameState.currentQuestion) return;
    
    const buttons = elements.answersContainer.querySelectorAll('.answer-btn:not(.eliminated)');
    const correctIndex = gameState.currentQuestion.correctIndex;
    
    // Encontrar opciones incorrectas
    const incorrectButtons = Array.from(buttons).filter((button, index) => 
        index !== correctIndex
    );
    
    // Eliminar 2 opciones incorrectas aleatoriamente
    for (let i = 0; i < 2 && incorrectButtons.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * incorrectButtons.length);
        const button = incorrectButtons[randomIndex];
        button.classList.add('eliminated');
        button.disabled = true;
        incorrectButtons.splice(randomIndex, 1);
    }
    
    window.GameDataManager.usePowerup('eliminate', 1, 'game_use');
    gameState.hintsUsed++;
    updatePowerups();
    
    showNotification('2 opciones eliminadas', 'info');
}

function extendTime() {
    gameState.timer += 15;
    updateTimerDisplay(gameState.timer);
    
    window.GameDataManager.usePowerup('timeExtender', 1, 'game_use');
    updatePowerups();
    
    showNotification('+15 segundos', 'info');
}

function activateSecondChance() {
    gameState.hasSecondChance = true;
    
    window.GameDataManager.usePowerup('secondChance', 1, 'game_use');
    updatePowerups();
    
    showNotification('Segunda oportunidad activada', 'info');
}

// ============================================
// UTILIDADES Y HELPERS
// ============================================

function markAnswers(selectedIndex, correctIndex) {
    const buttons = elements.answersContainer.querySelectorAll('.answer-btn');
    
    buttons.forEach((button, index) => {
        button.disabled = true;
        
        if (index === correctIndex) {
            button.classList.add('correct');
        } else if (index === selectedIndex) {
            button.classList.add('incorrect');
        }
    });
}

function showCoinAnimation(amount, isPositive) {
    const animation = document.createElement('div');
    animation.className = `coin-animation ${isPositive ? 'positive' : 'negative'}`;
    animation.innerHTML = `
        <i class="fas fa-coins"></i>
        <span>${isPositive ? '+' : '-'}${amount}</span>
    `;
    
    document.body.appendChild(animation);
    
    setTimeout(() => {
        if (animation.parentNode) {
            animation.parentNode.removeChild(animation);
        }
    }, 2000);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                        type === 'error' ? 'fa-exclamation-circle' : 
                        'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function updateCoinsDisplay() {
    const coinsElements = document.querySelectorAll('#player-coins, .coins-display span');
    coinsElements.forEach(element => {
        if (element && window.GameDataManager) {
            element.textContent = window.GameDataManager.getCoins();
        }
    });
}

function updateAllDisplays() {
    updateCoinsDisplay();
    updatePowerups();
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM cargado, inicializando juego...');
    init();
});

// Funciones globales adicionales para debugging
window.debugGame = function() {
    console.log('🔍 Estado actual del juego:', gameState);
    console.log('📚 Preguntas cargadas:', allQuestions.length);
    console.log('💰 Monedas:', window.GameDataManager ? window.GameDataManager.getCoins() : 'N/A');
};

window.forceStartGame = function() {
    console.log('🔧 Forzando inicio del juego...');
    window.startGame();
};

console.log('✅ Single-Player-New.js CORREGIDO CON NUEVA LÓGICA cargado');