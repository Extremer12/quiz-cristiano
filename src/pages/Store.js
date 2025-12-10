/**
 * Store Page Component
 */

import { BottomNav } from '../components/BottomNav.js';
import { AppBackground } from '../components/AppBackground.js';

export default class StorePage {
    constructor() {
        this.name = 'store';
    }

    render() {
        return `
      ${AppBackground()}
      <div class="store-container">
        <header class="store-header">
          <button type="button" class="back-btn" onclick="window.history.back()">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div class="store-title">
            <h1>Tienda</h1>
            <p>Mejora tu experiencia de juego</p>
          </div>
          <div class="coins-display">
            <i class="fas fa-coins"></i>
            <span class="user-coins" id="store-coins">0</span>
          </div>
        </header>

        <!-- Category Navigation -->
        <nav class="category-navigation">
          <button type="button" class="category-btn active nav-btn" data-category="avatares">
            <i class="fas fa-user-circle"></i>
            <span>Avatares</span>
          </button>
          <button type="button" class="category-btn nav-btn" data-category="monedas">
            <i class="fas fa-coins"></i>
            <span>Monedas</span>
          </button>
          <button type="button" class="category-btn nav-btn" data-category="powerups">
            <i class="fas fa-bolt"></i>
            <span>Power-ups</span>
          </button>
        </nav>

        <!-- Store Content -->
        <main class="store-content">
          <!-- Featured Section (injected by Store component) -->
          
          <!-- Avatares Section -->
          <section class="category-section store-section active" id="avatares-section">
            <div class="section-header">
              <h2>Avatares</h2>
              <p>Personaliza tu perfil con avatares únicos</p>
            </div>
            <div class="products-grid" id="avatares-products"></div>
          </section>

          <!-- Monedas Section -->
          <section class="category-section store-section" id="monedas-section" style="display: none;">
            <div class="section-header">
              <h2>Paquetes de Monedas</h2>
              <p>Obtén más monedas con bonificaciones por volumen</p>
            </div>
            <div class="products-grid" id="monedas-products"></div>
          </section>

          <!-- Power-ups Section -->
          <section class="category-section store-section" id="powerups-section" style="display: none;">
            <div class="section-header">
              <h2>Power-ups</h2>
              <p>Mejora tu estrategia de juego con herramientas especiales</p>
            </div>
            <div class="products-grid" id="powerups-products"></div>
          </section>
        </main>

        ${BottomNav('store')}
      </div>
    `;
    }

    async init() {
        // Dynamically import Store component
        const StoreModule = await import('../components/Store.js');
        const Store = StoreModule.default;
        Store.init();

        console.log('✅ Store page initialized');
    }

    destroy() {
        // Cleanup if needed
    }
}
