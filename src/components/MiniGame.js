/**
 * Componente Mini-Juego Joy
 * Maneja la interfaz de usuario del estudio bíblico
 */

import MiniGameService from '../services/MiniGameService.js';
import GameDataService from '../services/GameDataService.js';

class MiniGame {
    constructor() {
        this.currentVerse = null;
        this.timerInterval = null;
        this.remainingTime = 0;
    }

    init() {
        console.log('🎮 Inicializando MiniGame...');

        if (!document.querySelector('.mini-game-container')) {
            return;
        }

        MiniGameService.init();
        this.render();
        this.bindEvents();
        this.updateJoyMessage();

        console.log('✅ MiniGame inicializado');
    }

    render() {
        const container = document.querySelector('.mini-game-container');
        if (!container) return;

        container.innerHTML = this.getHTML();
        this.updateStats();
    }

    getHTML() {
        const currentOutfitSrc = MiniGameService.getCurrentOutfitSrc();

        return `
            <!-- Header -->
            <header class="mini-game-header">
                <button class="back-btn" onclick="window.location.href='index.html'">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <div class="game-title">
                    <h1>Estudio con Joy</h1>
                    <p>Aprende y crece</p>
                </div>
                <div class="player-progress">
                    <div class="joy-level">
                        <span class="joy-level-number" id="joy-level">${MiniGameService.state.joyLevel}</span>
                        <span class="joy-level-text">Nivel</span>
                    </div>
                </div>
            </header>

            <!-- Joy Section -->
            <section class="joy-section active" id="joy-section">
                <div class="joy-container">
                    <div class="joy-character" id="joy-character-container">
                         <!-- Level Indicator (Absolute) -->
                        <div class="joy-level-indicator">
                            Nvl <span id="joy-level-badge">${MiniGameService.state.joyLevel}</span>
                        </div>
                        <img src="${currentOutfitSrc}" alt="Joy" class="joy-avatar" id="joy-avatar">
                    </div>
                    
                    <div class="joy-speech" id="joy-message">
                        <p>¡Hola! ¿Listo para aprender?</p>
                    </div>

                    <div class="joy-actions">
                        <button class="study-btn" id="start-study-btn">
                            <i class="fas fa-book-open"></i> Estudiar Versículo
                        </button>
                        <button class="customization-btn" id="customize-btn">
                            <i class="fas fa-tshirt"></i> Personalizar Joy
                        </button>
                    </div>

                    <div class="stats-row" style="margin-top: 20px; display: flex; gap: 15px; justify-content: center;">
                        <div class="study-streak">
                            <span class="streak-fire"><i class="fas fa-fire"></i></span>
                            <span class="streak-number" id="study-streak">${MiniGameService.state.studyStreak}</span>
                        </div>
                        <div class="study-streak" style="background: rgba(52, 152, 219, 0.2); border-color: rgba(52, 152, 219, 0.3);">
                            <span class="streak-fire" style="color: #3498db;"><i class="fas fa-check-circle"></i></span>
                            <span class="streak-number" id="total-studies">${MiniGameService.state.totalStudies}</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Study Section -->
            <section class="study-section" id="study-section">
                <div class="verse-card">
                    <div class="verse-header">
                         <h3 class="verse-reference" id="verse-reference">Juan 3:16</h3>
                    </div>
                    <div class="verse-text" id="verse-text">...</div>
                    
                    <div class="study-timer">
                        <i class="fas fa-hourglass-half timer-icon"></i>
                        <span id="timer-display">00:30</span>
                    </div>

                    <div class="study-actions">
                        <button class="study-btn" id="complete-study-btn" disabled style="max-width: 250px;">
                            <i class="fas fa-clock"></i> Estudiando...
                        </button>
                    </div>
                </div>
            </section>

            <!-- Question Section -->
            <section class="question-section" id="question-section">
                <div class="question-card">
                    <div class="question-header">
                        <h3 class="question-title">Pregunta de Repaso</h3>
                    </div>
                    <p id="question-text" class="question-text">...</p>
                    <div class="answers-container" id="answers-container">
                        <!-- Opciones generadas dinámicamente -->
                    </div>
                </div>
            </section>

            <!-- Results Section -->
            <section class="results-section" id="results-section">
                <div class="results-card">
                    <div class="result-icon" id="result-icon"></div>
                    <h2 class="result-title" id="result-title">¡Excelente!</h2>
                    <p class="result-description" id="result-description">Has completado tu estudio diario.</p>
                    
                    <div class="rewards-info">
                        <h4>Recompensas</h4>
                        <div class="reward-item" style="justify-content: center;">
                            <i class="fas fa-coins"></i>
                            <span id="reward-coins">+0 Monedas</span>
                        </div>
                    </div>

                    <div class="result-actions">
                        <button class="result-btn" onclick="window.location.reload()">
                            <i class="fas fa-redo"></i> Volver a Joy
                        </button>
                    </div>
                </div>
            </section>

            <!-- Customization Modal -->
            <div class="customization-modal" id="customization-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">Armario de Joy</h3>
                        <button class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="outfits-grid" id="outfits-grid">
                        <!-- Outfits generados dinámicamente -->
                    </div>
                </div>
            </div>
        `;
    }

    updateStats() {
        const levelEl = document.getElementById('joy-level');
        const levelBadgeEl = document.getElementById('joy-level-badge');
        const streakEl = document.getElementById('study-streak');
        const totalEl = document.getElementById('total-studies');

        if (levelEl) levelEl.textContent = MiniGameService.state.joyLevel;
        if (levelBadgeEl) levelBadgeEl.textContent = MiniGameService.state.joyLevel;
        if (streakEl) streakEl.textContent = MiniGameService.state.studyStreak;
        if (totalEl) totalEl.textContent = MiniGameService.state.totalStudies;
    }

    updateJoyMessage() {
        const messageEl = document.querySelector('#joy-message p');
        if (messageEl) {
            messageEl.textContent = MiniGameService.getRandomMessage();
        }
    }

    startStudy() {
        if (!MiniGameService.canStudyToday()) {
            this.showNotification('¡Ya completaste tu estudio de hoy! Vuelve mañana.', 'info');
            return;
        }

        this.currentVerse = MiniGameService.getRandomVerse();

        document.getElementById('joy-section').classList.remove('active');
        document.getElementById('study-section').classList.add('active');

        document.getElementById('verse-reference').textContent = this.currentVerse.reference;
        document.getElementById('verse-text').textContent = `"${this.currentVerse.text}"`;

        this.startTimer();
    }

    startTimer() {
        this.remainingTime = MiniGameService.config.studyTimeMinimum;
        const timerDisplay = document.getElementById('timer-display');
        const btn = document.getElementById('complete-study-btn');

        this.timerInterval = setInterval(() => {
            this.remainingTime--;
            const minutes = Math.floor(this.remainingTime / 60);
            const seconds = this.remainingTime % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (this.remainingTime <= 0) {
                clearInterval(this.timerInterval);
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-check"></i> Continuar';
                btn.onclick = () => this.showQuestion();
            }
        }, 1000);
    }

    showQuestion() {
        document.getElementById('study-section').classList.remove('active');
        document.getElementById('question-section').classList.add('active');

        document.getElementById('question-text').textContent = this.currentVerse.question.text;

        const container = document.getElementById('answers-container');
        container.innerHTML = this.currentVerse.question.options.map((option, index) => `
            <button class="answer-btn" data-index="${index}">
                <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
                <span class="answer-text">${option}</span>
            </button>
        `).join('');

        container.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAnswer(parseInt(e.currentTarget.dataset.index)));
        });
    }

    handleAnswer(selectedIndex) {
        const isCorrect = selectedIndex === this.currentVerse.question.correctIndex;
        const buttons = document.querySelectorAll('.answer-btn');

        buttons.forEach((btn, index) => {
            btn.disabled = true;
            if (index === this.currentVerse.question.correctIndex) {
                btn.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        setTimeout(() => this.showResults(isCorrect), 1500);
    }

    showResults(isCorrect) {
        const result = MiniGameService.completeStudy(isCorrect);

        document.getElementById('question-section').classList.remove('active');
        document.getElementById('results-section').classList.add('active');

        const icon = document.getElementById('result-icon');
        const title = document.getElementById('result-title');
        const desc = document.getElementById('result-description');
        const coins = document.getElementById('reward-coins');

        if (isCorrect) {
            icon.innerHTML = '<i class="fas fa-trophy"></i>';
            icon.className = 'result-icon success';
            title.textContent = '¡Excelente trabajo!';
            desc.textContent = 'Has completado tu estudio correctamente.';
        } else {
            icon.innerHTML = '<i class="fas fa-book-reader"></i>';
            icon.className = 'result-icon info';
            title.textContent = '¡Buen esfuerzo!';
            desc.textContent = 'Lo importante es meditar en la Palabra.';
        }

        coins.textContent = `+${result.coinsEarned} Monedas`;

        if (result.leveledUp) {
            this.showNotification(`¡Subiste al Nivel ${result.newLevel}!`, 'success');
        }
        if (result.newOutfit) {
            this.showNotification(`¡Nuevo atuendo desbloqueado: ${result.newOutfit}!`, 'achievement');
        }
    }

    openCustomization() {
        const modal = document.getElementById('customization-modal');
        const grid = document.getElementById('outfits-grid');
        const outfits = MiniGameService.getOutfits();
        const currentOutfit = MiniGameService.state.currentOutfit;

        grid.innerHTML = outfits.map(outfit => `
            <div class="outfit-option ${outfit.id === currentOutfit ? 'selected' : ''} ${!outfit.unlocked ? 'locked' : ''}" 
                 data-id="${outfit.id}">
                <img src="${outfit.src}" alt="${outfit.name}" class="outfit-preview">
                <div class="outfit-name">${outfit.name}</div>
                ${!outfit.unlocked ? `<div class="outfit-unlock"><i class="fas fa-lock"></i> ${outfit.unlockCondition}</div>` : ''}
            </div>
        `).join('');

        grid.querySelectorAll('.outfit-option').forEach(card => {
            if (!card.classList.contains('locked')) {
                card.addEventListener('click', () => {
                    MiniGameService.setOutfit(card.dataset.id);
                    this.updateAvatar();
                    this.closeCustomization();
                    this.showNotification('¡Atuendo actualizado!', 'success');
                });
            }
        });

        modal.classList.add('active');
    }

    closeCustomization() {
        document.getElementById('customization-modal').classList.remove('active');
    }

    updateAvatar() {
        const img = document.getElementById('joy-avatar');
        if (img) img.src = MiniGameService.getCurrentOutfitSrc();
    }

    showNotification(msg, type = 'info') {
        const div = document.createElement('div');
        div.className = `notification notification-${type}`;
        div.textContent = msg;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    bindEvents() {
        const startBtn = document.getElementById('start-study-btn');
        const customizeBtn = document.getElementById('customize-btn');
        const closeModalBtn = document.querySelector('.modal-close');
        const modalOverlay = document.querySelector('.modal-overlay');

        if (startBtn) startBtn.addEventListener('click', () => this.startStudy());
        if (customizeBtn) customizeBtn.addEventListener('click', () => this.openCustomization());
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeCustomization());
        if (modalOverlay) modalOverlay.addEventListener('click', () => this.closeCustomization());
    }
}

export default new MiniGame();
