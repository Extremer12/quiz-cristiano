/**
 * Componente de UI de Tienda - REDESIGN PROFESIONAL
 * Estilo Supercell/Preguntados con productos destacados
 */

import StoreService from '../services/StoreService.js';
import PaymentService from '../services/PaymentService.js';
import GameDataService from '../services/GameDataService.js';

class Store {
    constructor() {
        this.currentCategory = 'avatares';
    }

    init() {
        if (!document.querySelector('.store-container')) return;

        console.log('🛒 Inicializando Tienda Profesional...');

        this.renderFeaturedSection();
        this.bindEvents();
        this.loadCategory(this.currentCategory);
        this.updateCoinsDisplay();

        PaymentService.init();
    }

    renderFeaturedSection() {
        const featured = StoreService.getFeaturedProducts();
        if (featured.length === 0) return;

        const container = document.querySelector('.store-content');
        if (!container) return;

        const heroSection = document.createElement('section');
        heroSection.className = 'featured-hero-section';
        heroSection.innerHTML = `
            <div class="hero-badge">⭐ DESTACADO DEL MES</div>
            <div class="hero-content">
                ${featured.map(product => `
                    <div class="hero-product-card" data-id="${product.id}" data-category="${product.category}">
                        <div class="hero-image">
                            <img src="${product.image}" alt="${product.name}">
                            ${product.badge ? `<span class="product-badge badge-${product.badge.toLowerCase()}">${product.badge}</span>` : ''}
                        </div>
                        <div class="hero-info">
                            <h2>${product.name}</h2>
                            <p>${product.description}</p>
                            <div class="hero-price">
                                <span class="price-value">${product.price}</span>
                                <i class="fas fa-coins"></i>
                            </div>
                            <button class="btn-buy-hero" data-id="${product.id}" data-category="${product.category}">
                                <i class="fas fa-shopping-cart"></i> COMPRAR AHORA
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.insertBefore(heroSection, container.firstChild);

        // Bind events for hero products
        heroSection.querySelectorAll('.btn-buy-hero').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('.btn-buy-hero').dataset.id;
                const category = e.target.closest('.btn-buy-hero').dataset.category;
                StoreService.purchaseItem(id, category);
                this.updateCoinsDisplay();
            });
        });
    }

    updateCoinsDisplay() {
        const coinsEl = document.querySelector('.user-coins');
        if (coinsEl) {
            coinsEl.textContent = GameDataService.getCoins();
        }
    }

    bindEvents() {
        const navButtons = document.querySelectorAll('.category-nav .nav-btn, .category-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.closest('button').dataset.category;
                if (category) {
                    this.switchCategory(category);
                }
            });
        });
    }

    switchCategory(category) {
        this.currentCategory = category;

        document.querySelectorAll('.category-btn').forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        document.querySelectorAll('.store-section').forEach(section => {
            section.style.display = 'none';
        });

        const activeSection = document.getElementById(`${category}-section`);
        if (activeSection) {
            activeSection.style.display = 'block';
            this.loadCategory(category);
        }
    }

    loadCategory(category) {
        const products = StoreService.getProductsByCategory(category);
        const section = document.getElementById(`${category}-section`);
        const grid = section.querySelector('.products-grid');

        if (!grid) return;

        grid.innerHTML = '';

        if (products.length === 0) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>No hay productos disponibles</p></div>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            if (product.featured) card.classList.add('featured');

            if (category === 'monedas') {
                this.renderRealMoneyProduct(card, product);
            } else {
                this.renderVirtualProduct(card, product, category);
            }

            grid.appendChild(card);
        });

        if (category === 'monedas') {
            PaymentService.renderButtons();
        }
    }

    renderVirtualProduct(card, product, category) {
        card.innerHTML = `
            ${product.badge ? `<span class="product-badge badge-${product.badge.toLowerCase()}">${product.badge}</span>` : ''}
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.description || ''}</p>
                <div class="product-price">
                    <span class="coins-price">${product.price} <i class="fas fa-coins"></i></span>
                </div>
                <button class="btn-buy" data-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Comprar
                </button>
            </div>
        `;

        card.querySelector('.btn-buy').addEventListener('click', () => {
            StoreService.purchaseItem(product.id, category);
            this.updateCoinsDisplay();
        });
    }

    renderRealMoneyProduct(card, product) {
        card.innerHTML = `
            <div class="product-image-container">
                <img src="assets/images/productos/monedas/pack-monedas-basico.png" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    <span class="usd-price">$${product.price}</span>
                </div>
                <div class="paypal-button-container" data-product-id="${product.id}"></div>
            </div>
        `;
    }
}

export default new Store();
