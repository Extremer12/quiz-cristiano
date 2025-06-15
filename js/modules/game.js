/**
 * Módulo para manejar la lógica del juego
 */

import QuestionManager from './questions.js';

class Game {
    constructor() {
        this.questionManager = new QuestionManager();
        this.currentQuestion = null;
        this.timer = null;
        this.timeLeft = 0;
        this.gameMode = 'individual'; // individual o multijugador
        this.isGameActive = false;
        this.currentCategory = null;
        this.completedCategories = [];
        this.currentCategoryProgress = 0;
        this.currentQuestions = [];
        this.score = 0;
        
        // Elementos del DOM
        this.gameArea = null;
        this.questionText = null;
        this.optionsContainer = null;
        this.timerElement = null;
        this.resultModal = null;
        this.progressBar = null;
        this.questionCounter = null;
        this.categoryWheel = null;
        this.categoryTitle = null;
        this.mainMenu = null;
        this.questionContainer = null;
    }
    
    async init() {
        console.log('Inicializando módulo de juego...');
        
        // Inicializar elementos del DOM
        this.gameArea = document.querySelector('.game-area');
        this.mainMenu = document.querySelector('.main-menu');
        this.questionText = document.querySelector('.question-text');
        this.optionsContainer = document.querySelector('.options-container');
        this.timerElement = document.querySelector('.timer');
        this.progressBar = document.querySelector('.progress-bar');
        this.questionCounter = document.querySelector('.question-counter');
        this.questionContainer = document.querySelector('.question-container');
        
        // Asegurarse de que el área de juego esté oculta al inicio
        if (this.gameArea) {
            this.gameArea.classList.add('hidden');
            this.gameArea.style.display = 'none';
        }
        
        // Ocultar el contenedor de preguntas inicialmente
        if (this.questionContainer) {
            this.questionContainer.style.display = 'none';
        }
        
        // Limpiar cualquier texto de ejemplo
        if (this.questionText) {
            this.questionText.textContent = '';
        }
        
        // Limpiar opciones de ejemplo
        if (this.optionsContainer) {
            this.optionsContainer.innerHTML = '';
        }
        
        // Inicializar el gestor de preguntas
        await this.questionManager.init();
        
        // Inicializar eventos
        this.initEvents();
        
        console.log('Módulo de juego inicializado correctamente');
    }
    
    initEvents() {
        console.log('Inicializando eventos del juego...');
        
        // Botón de modo individual
        const singlePlayerBtn = document.querySelector('.single-player');
        if (singlePlayerBtn) {
            console.log('Botón de modo individual encontrado');
            singlePlayerBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevenir comportamiento por defecto
                console.log('Clic en modo individual');
                // Redirigir a la página de modo individual
                window.location.href = 'single-player.html';
            });
        } else {
            console.error('No se encontró el botón de modo individual');
        }
        
        // Botón de jugar
        const playButton = document.querySelector('.play-button');
        if (playButton) {
            console.log('Botón de jugar encontrado');
            playButton.addEventListener('click', (e) => {
                e.preventDefault(); // Prevenir comportamiento por defecto
                console.log('Clic en jugar');
                // Redirigir a la página de modo individual
                window.location.href = 'single-player.html';
            });
        } else {
            console.error('No se encontró el botón de jugar');
        }
        
        // Botón de volver al inicio
        const backToHomeBtn = document.querySelector('.back-to-home-btn');
        if (backToHomeBtn) {
            backToHomeBtn.addEventListener('click', () => {
                this.returnToMainMenu();
            });
        }
        
        // Botón de cerrar juego
        const closeGameBtn = document.querySelector('.close-game-btn');
        if (closeGameBtn) {
            closeGameBtn.addEventListener('click', () => {
                this.returnToMainMenu();
            });
        }
    }
    
    returnToMainMenu() {
        // Ocultar el área de juego
        if (this.gameArea) {
            this.gameArea.classList.add('hidden');
            this.gameArea.style.display = 'none';
        }
        
        // Mostrar el menú principal
        if (this.mainMenu) {
            this.mainMenu.classList.remove('hidden');
            this.mainMenu.style.display = 'flex';
        }
        
        // Reiniciar el juego
        this.resetGame();
    }
    
    showCategoryWheel() {
        console.log('Mostrando rueda de categorías...');
        
        // Ocultar el menú principal
        if (this.mainMenu) {
            console.log('Ocultando menú principal:', this.mainMenu);
            this.mainMenu.classList.add('hidden');
            this.mainMenu.style.display = 'none';
        } else {
            console.error('No se encontró el elemento mainMenu');
        }
        
        // Mostrar el área de juego
        if (this.gameArea) {
            console.log('Mostrando área de juego:', this.gameArea);
            this.gameArea.classList.remove('hidden');
            this.gameArea.style.display = 'flex';
        } else {
            console.error('No se encontró el elemento gameArea');
        }
        
        // Ocultar el contenedor de preguntas
        if (this.questionContainer) {
            this.questionContainer.style.display = 'none';
        }
        
        // Crear la rueda de categorías si no existe
        if (!this.categoryWheel) {
            console.log('Creando rueda de categorías...');
            this.createCategoryWheel();
        } else {
            // Si ya existe, solo mostrarla
            console.log('Mostrando rueda de categorías existente');
            this.categoryWheel.style.display = 'flex';
        }
        
        // Ocultar la barra de navegación inferior
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'none';
        }
    }
    
    createCategoryWheel() {
        console.log('Creando rueda de categorías...');
        
        // Crear el contenedor de la rueda si no existe
        this.categoryWheel = document.createElement('div');
        this.categoryWheel.className = 'category-wheel';
        
        // Título de la rueda
        const wheelTitle = document.createElement('h2');
        wheelTitle.className = 'wheel-title';
        wheelTitle.textContent = 'Elige una categoría';
        this.categoryWheel.appendChild(wheelTitle);
        
        // Contenedor de categorías
        const categoriesContainer = document.createElement('div');
        categoriesContainer.className = 'categories-wheel-container';
        
        // Definir las categorías disponibles
        const categories = [
            { id: 'antiguo-testamento', name: 'Antiguo Testamento', icon: 'fas fa-book' },
            { id: 'nuevo-testamento', name: 'Nuevo Testamento', icon: 'fas fa-cross' },
            { id: 'personajes-biblicos', name: 'Personajes Bíblicos', icon: 'fas fa-pray' },
            { id: 'historia-iglesia', name: 'Historia de la Iglesia', icon: 'fas fa-church' },
            { id: 'profecias-revelaciones', name: 'Profecías', icon: 'fas fa-scroll' },
            { id: 'vida-jesus', name: 'Vida de Jesús', icon: 'fas fa-dove' }
        ];
        
        // Crear elementos para cada categoría
        categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = 'category-item';
            categoryItem.dataset.category = category.id;
            
            const categoryIcon = document.createElement('div');
            categoryIcon.className = 'category-icon';
            const icon = document.createElement('i');
            icon.className = category.icon;
            categoryIcon.appendChild(icon);
            
            const categoryName = document.createElement('div');
            categoryName.className = 'category-name';
            categoryName.textContent = category.name;
            
            categoryItem.appendChild(categoryIcon);
            categoryItem.appendChild(categoryName);
            
            // Agregar evento de clic
            categoryItem.addEventListener('click', () => {
                console.log(`Categoría seleccionada: ${category.id}`);
                this.startGame(category.id);
            });
            
            categoriesContainer.appendChild(categoryItem);
        });
        
        this.categoryWheel.appendChild(categoriesContainer);
        
        // Agregar la rueda al área de juego
        if (this.gameArea) {
            this.gameArea.appendChild(this.categoryWheel);
        } else {
            console.error('No se encontró el área de juego para agregar la rueda de categorías');
        }
        
        console.log('Rueda de categorías creada correctamente');
    }
    
    selectCategory(categoryId) {
        console.log(`Categoría seleccionada: ${categoryId}`);
        
        // Guardar la categoría seleccionada
        this.currentCategory = categoryId;
        this.currentCategoryProgress = 0;
        
        // Ocultar la rueda de categorías
        if (this.categoryWheel) {
            this.categoryWheel.style.display = 'none';
        }
        
        // Cargar preguntas de la categoría seleccionada
        this.loadCategoryQuestions(categoryId);
        
        // Mostrar el contenedor de preguntas
        if (this.questionContainer) {
            this.questionContainer.style.display = 'block';
        }
        
        // Iniciar el juego con la primera pregunta
        this.startGame();
    }
    
    loadCategoryQuestions(categoryId) {
        console.log(`Cargando preguntas de la categoría: ${categoryId}`);
        
        // Obtener 5 preguntas aleatorias de la categoría seleccionada
        this.currentQuestions = this.questionManager.getRandomQuestionsByCategory(categoryId, 5);
        
        if (this.currentQuestions.length === 0) {
            console.error(`No se encontraron preguntas para la categoría: ${categoryId}`);
            // Mostrar mensaje de error en lugar de cargar preguntas de ejemplo
            alert('No hay preguntas disponibles para esta categoría. Por favor, selecciona otra categoría.');
            // Volver a mostrar la rueda de categorías
            this.showCategoryWheel();
        } else {
            console.log(`Cargadas ${this.currentQuestions.length} preguntas`);
        }
    }
    
    async startGame(category) {
        console.log(`Iniciando juego en categoría: ${category}`);
        
        // Ocultar la rueda de categorías
        if (this.categoryWheel) {
            this.categoryWheel.style.display = 'none';
        }
        
        // Mostrar el contenedor de preguntas
        if (this.questionContainer) {
            this.questionContainer.style.display = 'flex';
        }
        
        // Obtener preguntas para la categoría seleccionada
        this.currentQuestions = await this.questionManager.getRandomQuestionsByCategory(category, 5);
        
        if (!this.currentQuestions || this.currentQuestions.length === 0) {
            console.error('No se pudieron obtener preguntas para la categoría seleccionada');
            alert('No hay preguntas disponibles para esta categoría. Por favor, selecciona otra.');
            this.showCategoryWheel();
            return;
        }
        
        console.log(`Obtenidas ${this.currentQuestions.length} preguntas para la categoría ${category}`);
        
        // Inicializar variables del juego
        this.currentQuestionIndex = 0;
        this.currentCategoryProgress = 0;
        this.score = 0;
        this.timeLeft = 20;
        
        // Cargar la primera pregunta
        this.loadQuestion(0);
        
        // Iniciar el temporizador
        this.startTimer();
        
        // Actualizar la barra de progreso
        this.updateProgress(1, this.currentQuestions.length);
        
        console.log('Juego iniciado correctamente');
    }
    
    loadQuestion(index) {
        if (!this.currentQuestions || index >= this.currentQuestions.length) {
            console.error('No hay preguntas disponibles o índice fuera de rango');
            return;
        }
        
        const question = this.currentQuestions[index];
        console.log('Cargando pregunta:', question);
        
        // Asegurarse de que el contenedor de preguntas esté visible
        if (this.questionContainer) {
            this.questionContainer.style.display = 'block';
        }
        
        // Actualizar texto de la pregunta
        if (this.questionText) {
            this.questionText.textContent = question.text;
        }
        
        // Limpiar opciones anteriores
        if (this.optionsContainer) {
            this.optionsContainer.innerHTML = '';
            
            // Crear opciones
            question.options.forEach((option, i) => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.textContent = option;
                button.dataset.index = i;
                
                button.addEventListener('click', () => {
                    this.handleAnswer(button, i === question.correctIndex);
                });
                
                this.optionsContainer.appendChild(button);
            });
        }
        
        // Actualizar contador de preguntas
        if (this.questionCounter) {
            this.questionCounter.textContent = `Pregunta ${index + 1}/${this.currentQuestions.length}`;
        }
    }
    
    startTimer() {
        if (!this.timerElement) return;
        
        let timeLeft = 20;
        this.timerElement.textContent = timeLeft;
        this.timerElement.style.color = '';
        
        // Limpiar temporizador anterior si existe
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            timeLeft--;
            this.timerElement.textContent = timeLeft;
            
            if (timeLeft <= 5) {
                this.timerElement.style.color = 'red';
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.timer);
                // Tiempo agotado, pasar a la siguiente pregunta
                this.handleTimeOut();
            }
        }, 1000);
    }
    
    updateProgress(current, total) {
        if (!this.progressBar) return;
        
        const percentage = (current / total) * 100;
        this.progressBar.style.width = `${percentage}%`;
    }
    
    handleAnswer(button, isCorrect) {
        // Detener el temporizador
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Marcar respuesta como correcta o incorrecta
        if (isCorrect) {
            button.classList.add('correct');
            // Aumentar puntuación
            this.increaseScore(100);
            // Mostrar efecto de partículas
            this.showParticles();
        } else {
            button.classList.add('incorrect');
            // Mostrar la respuesta correcta
            const correctButton = this.optionsContainer.querySelector(`[data-index="${this.currentQuestions[this.currentCategoryProgress].correctIndex}"]`);
            if (correctButton) {
                correctButton.classList.add('correct');
            }
        }
        
        // Deshabilitar todos los botones
        const buttons = this.optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
        });
        
        // Esperar un momento y cargar la siguiente pregunta
        setTimeout(() => {
            this.currentCategoryProgress++;
            
            if (this.currentCategoryProgress < this.currentQuestions.length) {
                this.loadQuestion(this.currentCategoryProgress);
                this.startTimer();
                this.updateProgress(this.currentCategoryProgress + 1, this.currentQuestions.length);
            } else {
                // Fin del juego
                this.showGameResults();
            }
        }, 2000);
    }
    
    handleTimeOut() {
        // Mostrar la respuesta correcta
        const correctButton = this.optionsContainer.querySelector(`[data-index="${this.currentQuestions[this.currentCategoryProgress].correctIndex}"]`);
        if (correctButton) {
            correctButton.classList.add('correct');
        }
        
        // Deshabilitar todos los botones
        const buttons = this.optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
        });
        
        // Esperar un momento y cargar la siguiente pregunta
        setTimeout(() => {
            this.currentCategoryProgress++;
            
            if (this.currentCategoryProgress < this.currentQuestions.length) {
                this.loadQuestion(this.currentCategoryProgress);
                this.startTimer();
                this.updateProgress(this.currentCategoryProgress + 1, this.currentQuestions.length);
            } else {
                // Fin del juego
                this.showGameResults();
            }
        }, 2000);
    }
    
    increaseScore(points) {
        this.score += points;
        // Actualizar puntuación en la interfaz si existe un elemento para ello
    }
    
    showGameResults() {
        // Crear modal de resultados
        const modal = document.createElement('div');
        modal.className = 'results-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>¡Juego Terminado!</h2>
                <p>Tu puntuación final:</p>
                <div class="final-score">${this.score}</div>
                <p>Has ganado ${Math.floor(this.score / 10)} monedas bíblicas</p>
                <div class="modal-buttons">
                    <button class="play-again-btn">Jugar de nuevo</button>
                    <button class="home-btn">Volver al inicio</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Actualizar monedas del usuario
        this.updateCoins(Math.floor(this.score / 10));
        
        // Agregar eventos a los botones
        modal.querySelector('.play-again-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.resetGame();
            this.showCategoryWheel();
        });
        
        modal.querySelector('.home-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.returnToMainMenu();
        });
    }
    
    showParticles() {
        const particlesContainer = document.querySelector('.particles-effect');
        if (!particlesContainer) return;
        
        // Crear partículas
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Posición aleatoria
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            
            // Tamaño aleatorio
            const size = Math.random() * 10 + 5;
            
            // Color aleatorio
            const colors = ['#FFD700', '#3498db', '#2ecc71', '#9b59b6'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            // Aplicar estilos
            particle.style.left = `${x}%`;
            particle.style.top = `${y}%`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.backgroundColor = color;
            
            particlesContainer.appendChild(particle);
            
            // Animar y eliminar después
            setTimeout(() => {
                if (particlesContainer.contains(particle)) {
                    particlesContainer.removeChild(particle);
                }
            }, 1000);
        }
    }
    
    // Sistema de monedas
    userCoins = 0;
    
    updateCoins(amount) {
        this.userCoins = localStorage.getItem('userCoins') ? parseInt(localStorage.getItem('userCoins')) : 0;
        this.userCoins += amount;
        localStorage.setItem('userCoins', this.userCoins);
        
        // Actualizar monedas en la interfaz
        this.updateCoinsDisplay();
    }
    
    updateCoinsDisplay() {
        // Crear o actualizar el elemento de monedas si no existe
        let coinsDisplay = document.querySelector('.user-coins');
        
        if (!coinsDisplay) {
            // Crear el elemento de monedas
            coinsDisplay = document.createElement('div');
            coinsDisplay.className = 'user-coins';
            
            // Agregar al header
            const header = document.querySelector('.header');
            if (header) {
                header.appendChild(coinsDisplay);
            }
        }
        
        coinsDisplay.innerHTML = `
            <i class="fas fa-coins"></i>
            <span>${this.userCoins}</span>
        `;
    }
    
    resetGame() {
        // Reiniciar puntuación
        this.score = 0;
        
        // Reiniciar progreso de categoría
        this.currentCategoryProgress = 0;
        
        // Detener temporizador
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Reiniciar progreso
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
        }
        
        // Reiniciar contador de preguntas
        if (this.questionCounter) {
            this.questionCounter.textContent = 'Pregunta 1/5';
        }
        
        // Limpiar opciones
        if (this.optionsContainer) {
            this.optionsContainer.innerHTML = '';
        }
        
        // Reiniciar temporizador visual
        if (this.timerElement) {
            this.timerElement.textContent = '20';
            this.timerElement.style.color = '';
        }
        
        // Limpiar texto de pregunta
        if (this.questionText) {
            this.questionText.textContent = '';
        }
    }
}

export default Game;