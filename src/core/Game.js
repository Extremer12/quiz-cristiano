/**
 * Módulo para manejar la lógica del juego
 */

import QuestionManager from './QuestionManager.js';
import UI from '../components/UI.js';
import GameDataService from '../services/GameDataService.js';
import UIEffects from '../components/UIEffects.js';
import { showNotification } from '../utils/Utils.js';

class Game {
    constructor() {
        this.questionManager = new QuestionManager();
        this.currentQuestion = null;
        this.timer = null;
        this.timeLeft = 0;
        this.gameMode = 'individual';
        this.isGameActive = false;

        // Estado del juego
        this.state = {
            phase: 'welcome', // welcome, initial, category, repechage, victory, gameover
            currentQuestionIndex: 0,
            initialCorrectAnswers: 0,
            completedCategories: [],
            currentCategory: null,
            categoryQuestions: [],
            categoryQuestionIndex: 0,
            categoryCorrectAnswers: 0,
            categoryIncorrectAnswers: 0,
            score: 0,
            perfectGame: true,
            powerupsUsed: {
                eliminate: 0,
                timeExtender: 0,
                secondChance: 0
            },
            hasSecondChance: false
        };

        this.config = {
            questionsPerCategory: 3,
            minCorrectToWin: 3,
            correctForRepechage: 2,
            maxIncorrectBeforeGameOver: 2,
            initialQuestionsCount: 3
        };

        this.rewards = {
            categoryCorrect: 4,
            categoryComplete: 15,
            gameComplete: 70,
            perfectGame: 100,
            speedBonus: 8,
            wrongAnswer: -8
        };
    }

    async init() {
        console.log('🎮 Inicializando Game Core...');
        await this.questionManager.init();
        this.bindEvents();

        // Verificar si hay juego guardado o iniciar nuevo
        // Por ahora siempre nuevo
        this.showScreen('welcome-screen');
    }

    bindEvents() {
        // Eventos de botones de UI que llaman a métodos del juego
        // Estos se pueden vincular desde main.js o aquí si tenemos acceso al DOM

        // Powerups
        document.getElementById('eliminate-btn')?.addEventListener('click', () => this.usePowerup('eliminate'));
        document.getElementById('time-btn')?.addEventListener('click', () => this.usePowerup('timeExtender'));
        document.getElementById('rescue-btn')?.addEventListener('click', () => this.usePowerup('secondChance'));
    }

    startGame() {
        console.log('🚀 Iniciando nuevo juego...');
        this.resetState();
        this.isGameActive = true;

        // Cargar preguntas iniciales
        this.initialQuestions = this.questionManager.getRandomQuestionsByCategory('antiguo-testamento', 1)
            .concat(this.questionManager.getRandomQuestionsByCategory('nuevo-testamento', 1))
            .concat(this.questionManager.getRandomQuestionsByCategory('personajes-biblicos', 1));

        // Si no hay suficientes, usar fallback
        if (this.initialQuestions.length < 3) {
            this.initialQuestions = this.questionManager.getFallbackQuestions().slice(0, 3);
        }

        this.showScreen('question-screen');
        this.loadInitialQuestion(0);
    }

    resetState() {
        this.state = {
            phase: 'initial',
            currentQuestionIndex: 0,
            initialCorrectAnswers: 0,
            completedCategories: [],
            currentCategory: null,
            categoryQuestions: [],
            categoryQuestionIndex: 0,
            categoryCorrectAnswers: 0,
            categoryIncorrectAnswers: 0,
            score: 0,
            perfectGame: true,
            powerupsUsed: { eliminate: 0, timeExtender: 0, secondChance: 0 },
            hasSecondChance: false
        };
        this.updatePowerupsUI();
    }

    loadInitialQuestion(index) {
        if (index >= this.initialQuestions.length) {
            this.evaluateInitialPhase();
            return;
        }

        this.state.currentQuestionIndex = index;
        this.currentQuestion = this.initialQuestions[index];
        this.state.phase = 'initial';

        this.displayQuestion(this.currentQuestion, 'Preguntas Iniciales', index + 1);
        this.startTimer(20);
    }

    loadCategoryQuestion(index) {
        if (index >= this.state.categoryQuestions.length) {
            this.evaluateCategoryPhase();
            return;
        }

        this.state.categoryQuestionIndex = index;
        this.currentQuestion = this.state.categoryQuestions[index];
        this.state.phase = 'category';

        this.displayQuestion(this.currentQuestion, `Categoría: ${this.state.currentCategory.name}`, index + 1);
        this.startTimer(20);
    }

    displayQuestion(question, phaseText, questionNumber) {
        // Actualizar UI
        const questionText = document.querySelector('.question-text');
        const answersContainer = document.getElementById('answers-container');
        const timerPhase = document.getElementById('timer-phase');
        const timerQuestion = document.getElementById('timer-question');
        const bibleReference = document.getElementById('bible-reference');

        if (questionText) questionText.textContent = question.text;
        if (timerPhase) timerPhase.textContent = phaseText;
        if (timerQuestion) timerQuestion.textContent = `Pregunta ${questionNumber}`;

        if (bibleReference) {
            bibleReference.textContent = question.reference || '';
            bibleReference.style.display = question.reference ? 'block' : 'none';
        }

        if (answersContainer) {
            answersContainer.innerHTML = '';
            question.options.forEach((option, index) => {
                const btn = document.createElement('button');
                btn.className = 'answer-btn';
                btn.innerHTML = `<span class="answer-letter">${String.fromCharCode(65 + index)}</span> <span class="answer-text">${option}</span>`;
                btn.onclick = () => this.handleAnswer(index);
                answersContainer.appendChild(btn);
            });
        }

        // Resetear estado de botones
        const powerupBtns = document.querySelectorAll('.powerup-btn');
        powerupBtns.forEach(btn => btn.disabled = false);
    }

    handleAnswer(selectedIndex) {
        if (!this.isGameActive) return;

        this.stopTimer();
        const isCorrect = selectedIndex === this.currentQuestion.correctIndex;
        const answersContainer = document.getElementById('answers-container');
        const buttons = answersContainer.querySelectorAll('.answer-btn');

        // Marcar visualmente
        buttons[selectedIndex].classList.add(isCorrect ? 'correct' : 'incorrect');
        if (!isCorrect) {
            buttons[this.currentQuestion.correctIndex].classList.add('correct');
        }

        // Deshabilitar botones
        buttons.forEach(btn => btn.disabled = true);

        // Procesar lógica
        setTimeout(() => {
            if (this.state.phase === 'initial') {
                this.processInitialAnswer(isCorrect);
            } else if (this.state.phase === 'category') {
                this.processCategoryAnswer(isCorrect);
            } else if (this.state.phase === 'repechage') {
                this.processRepechageAnswer(isCorrect);
            }
        }, 1500);
    }

    processInitialAnswer(isCorrect) {
        if (isCorrect) {
            this.state.initialCorrectAnswers++;
            this.state.score += 10;
            GameDataService.addCoins(this.rewards.categoryCorrect, 'initial_correct');
            showNotification('¡Correcto!', 'success');
        } else {
            this.state.perfectGame = false;
            // Segunda oportunidad
            if (this.state.hasSecondChance) {
                this.state.hasSecondChance = false;
                showNotification('¡Segunda oportunidad usada!', 'info');
                // No contar como incorrecta, permitir reintentar o pasar?
                // Simplificación: pasar pero no penalizar tanto
            } else {
                GameDataService.spendCoins(Math.abs(this.rewards.wrongAnswer), 'initial_wrong');
                showNotification('Incorrecto', 'error');
            }
        }

        // Verificar Game Over en fase inicial
        const incorrect = (this.state.currentQuestionIndex + 1) - this.state.initialCorrectAnswers;
        if (incorrect >= 2) {
            this.gameOver('Has fallado demasiadas preguntas iniciales.');
            return;
        }

        this.loadInitialQuestion(this.state.currentQuestionIndex + 1);
    }

    evaluateInitialPhase() {
        if (this.state.initialCorrectAnswers >= 3) {
            this.showCategorySelection();
        } else if (this.state.initialCorrectAnswers === 2) {
            // Asignar categoría aleatoria
            this.assignRandomCategory();
        } else {
            this.gameOver('No superaste la fase inicial.');
        }
    }

    showCategorySelection() {
        this.showScreen('categories-screen');
        const container = document.querySelector('.categories-content');
        if (!container) return;

        container.innerHTML = '<h2>Selecciona una Categoría</h2><div class="categories-grid"></div>';
        const grid = container.querySelector('.categories-grid');

        this.questionManager.categories.forEach(cat => {
            if (this.state.completedCategories.includes(cat.id)) return;

            const btn = document.createElement('div');
            btn.className = 'category-card';
            btn.innerHTML = `
                <i class="fas ${cat.icon}" style="color: ${cat.color}"></i>
                <h3>${cat.name}</h3>
            `;
            btn.onclick = () => this.startCategory(cat);
            grid.appendChild(btn);
        });
    }

    assignRandomCategory() {
        const available = this.questionManager.categories.filter(c => !this.state.completedCategories.includes(c.id));
        const random = available[Math.floor(Math.random() * available.length)];
        showNotification(`Categoría asignada: ${random.name}`, 'info');
        setTimeout(() => this.startCategory(random), 2000);
    }

    startCategory(category) {
        this.state.currentCategory = category;
        this.state.categoryQuestions = this.questionManager.getRandomQuestionsByCategory(category.id, 3);
        this.state.categoryCorrectAnswers = 0;
        this.state.categoryIncorrectAnswers = 0;

        this.showScreen('question-screen');
        this.loadCategoryQuestion(0);
    }

    processCategoryAnswer(isCorrect) {
        if (isCorrect) {
            this.state.categoryCorrectAnswers++;
            GameDataService.addCoins(this.rewards.categoryCorrect, 'category_correct');
            showNotification('¡Correcto!', 'success');
        } else {
            this.state.categoryIncorrectAnswers++;
            this.state.perfectGame = false;
            GameDataService.spendCoins(Math.abs(this.rewards.wrongAnswer), 'category_wrong');
            showNotification('Incorrecto', 'error');
        }

        if (this.state.categoryIncorrectAnswers >= this.config.maxIncorrectBeforeGameOver) {
            this.gameOver('Demasiados errores en esta categoría.');
            return;
        }

        if (this.state.categoryCorrectAnswers >= this.config.minCorrectToWin) {
            this.completeCategory();
            return;
        }

        this.loadCategoryQuestion(this.state.categoryQuestionIndex + 1);
    }

    evaluateCategoryPhase() {
        if (this.state.categoryCorrectAnswers >= this.config.minCorrectToWin) {
            this.completeCategory();
        } else if (this.state.categoryCorrectAnswers === this.config.correctForRepechage) {
            this.startRepechage();
        } else {
            this.gameOver('No superaste la categoría.');
        }
    }

    startRepechage() {
        showNotification('¡Repechaje! Responde correctamente para salvarte.', 'warning');
        // Cargar una pregunta extra de la misma categoría
        const extraQuestion = this.questionManager.getRandomQuestionsByCategory(this.state.currentCategory.id, 1)[0];
        this.currentQuestion = extraQuestion;
        this.state.phase = 'repechage';
        this.displayQuestion(extraQuestion, 'Repechaje', 'Extra');
        this.startTimer(15);
    }

    processRepechageAnswer(isCorrect) {
        if (isCorrect) {
            showNotification('¡Salvado!', 'success');
            this.completeCategory();
        } else {
            this.gameOver('Fallaste el repechaje.');
        }
    }

    completeCategory() {
        this.state.completedCategories.push(this.state.currentCategory.id);
        GameDataService.addCoins(this.rewards.categoryComplete, 'category_complete');

        if (this.state.completedCategories.length === this.questionManager.categories.length) {
            this.victory();
        } else {
            showNotification('¡Categoría Completada!', 'success');
            setTimeout(() => this.showCategorySelection(), 1500);
        }
    }

    victory() {
        this.showScreen('victory-screen');
        GameDataService.addCoins(this.rewards.gameComplete, 'game_victory');
        if (this.state.perfectGame) {
            GameDataService.addCoins(this.rewards.perfectGame, 'perfect_game');
        }
    }

    gameOver(reason) {
        this.showScreen('gameover-screen');
        const msg = document.querySelector('.gameover-subtitle');
        if (msg) msg.textContent = reason;
    }

    usePowerup(type) {
        if (!this.isGameActive || this.state.phase === 'welcome') return;

        const cost = 50; // Costo base, podría venir de StoreService
        const userCoins = GameDataService.getCoins();

        if (userCoins < cost) {
            showNotification('No tienes suficientes monedas', 'warning');
            return;
        }

        if (type === 'eliminate') {
            // Eliminar 2 incorrectas
            const answers = document.querySelectorAll('.answer-btn');
            let eliminated = 0;
            answers.forEach((btn, idx) => {
                if (eliminated < 2 && idx !== this.currentQuestion.correctIndex) {
                    btn.style.visibility = 'hidden';
                    eliminated++;
                }
            });
            GameDataService.spendCoins(cost, 'powerup_eliminate');
        } else if (type === 'timeExtender') {
            this.timeLeft += 15;
            this.updateTimerDisplay();
            GameDataService.spendCoins(cost, 'powerup_time');
        } else if (type === 'secondChance') {
            this.state.hasSecondChance = true;
            GameDataService.spendCoins(cost, 'powerup_second_chance');
            showNotification('Segunda oportunidad activada', 'success');
        }

        this.updatePowerupsUI();
    }

    updatePowerupsUI() {
        // Actualizar contadores si los hubiera
    }

    startTimer(seconds) {
        this.stopTimer();
        this.timeLeft = seconds;
        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.handleTimeOut();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) clearInterval(this.timer);
    }

    updateTimerDisplay() {
        const el = document.getElementById('timer-number');
        if (el) el.textContent = this.timeLeft;

        const circle = document.getElementById('timer-circle');
        if (circle) {
            if (this.timeLeft <= 5) circle.classList.add('danger');
            else circle.classList.remove('danger');
        }
    }

    handleTimeOut() {
        showNotification('¡Tiempo agotado!', 'error');
        // Tratar como respuesta incorrecta
        if (this.state.phase === 'initial') this.processInitialAnswer(false);
        else if (this.state.phase === 'category') this.processCategoryAnswer(false);
        else if (this.state.phase === 'repechage') this.processRepechageAnswer(false);
    }

    showScreen(screenId) {
        document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.add('active');
    }
}

export default new Game();