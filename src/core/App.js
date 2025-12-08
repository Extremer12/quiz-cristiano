import game from './Game.js';
import UI from '../components/UI.js';
import GameDataService from '../services/GameDataService.js';

class QuizCristianoApp {
    constructor() {
        this.game = game;
    }

    async init() {
        try {
            // 1. Aplicar tema inmediatamente
            await this.initDarkMode();

            // 2. Configurar eventos básicos
            this.bindEvents();

            // 3. Actualizar UI inicial
            this.updateUI();

            // 4. Inicializar el juego
            await this.game.init();

            console.log('✅ Quiz Cristiano App inicializado');

        } catch (error) {
            console.error('❌ Error inicializando la aplicación:', error);
        }
    }

    async initDarkMode() {
        const savedTheme = localStorage.getItem('quiz-cristiano-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    bindEvents() {
        // Eventos globales de la app
        window.addEventListener('storage', (e) => {
            if (e.key === 'quizCristianoData') {
                this.updateUI();
            }
        });
    }

    updateUI() {
        UI.updateCoins(GameDataService.getCoins());
    }
}

export default QuizCristianoApp;