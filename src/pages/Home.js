/**
 * Home Page Component
 */

import { BottomNav } from '../components/BottomNav.js';
import { AppBackground } from '../components/AppBackground.js';

export default class HomePage {
    constructor() {
        this.name = 'home';
    }

    render() {
        return `
      ${AppBackground()}
      <div class="container">
        <!-- Header -->
        <header class="header">
          <button class="menu-toggle" aria-label="Abrir menú">
            <i class="fas fa-bars"></i>
          </button>
          <h1 class="logo-title">Quiz</h1>
          <div class="coins-display">
            <i class="fas fa-coins"></i>
            <span id="user-coins">0</span>
          </div>
        </header>

        <!-- Mascot Section -->
        <section class="mascot-section">
          <div class="mascot-container">
            <img src="/assets/images/mascota.png" alt="Joy" class="mascot-image">
          </div>
          <div class="speech-bubble show" id="speech-bubble">
            <p class="speech-text" id="mascot-text">¡Hola! ¿Listo para aprender hoy?</p>
          </div>
        </section>

        <!-- Main Buttons -->
        <main class="main-buttons">
          <a href="/single-player" data-link class="game-button single-player">
            <i class="fas fa-user"></i>
            <span>Modo Individual</span>
          </a>
          <a href="#" class="game-button multiplayer">
            <i class="fas fa-users"></i>
            <span>Multijugador</span>
          </a>
        </main>

        <!-- Player Stats -->
        <section class="player-stats">
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-star"></i></div>
            <div class="stat-value" id="user-level">1</div>
            <div class="stat-label">Nivel</div>
          </div>
          <div class="stat-item">
            <div class="stat-icon"><i class="fas fa-crown"></i></div>
            <div class="stat-value" id="user-division">Bronce</div>
            <div class="stat-label">División</div>
          </div>
        </section>

        ${BottomNav('home')}
      </div>
    `;
    }

    init() {
        // Initialize GameDataService
        import('../services/GameDataService.js').then(module => {
            const GameDataService = module.default;
            document.getElementById('user-coins').textContent = GameDataService.getCoins();
        });

        console.log('✅ Home page initialized');
    }

    destroy() {
        // Cleanup if needed
    }
}
