/**
 * Componente de UI de Tienda
 * Maneja la renderización y eventos de la tienda.
 */

import StoreService from '../services/StoreService.js';
import PaymentService from '../services/PaymentService.js';

class Store {
    constructor() {
        this.currentCategory = 'avatares';
    }

    init() {
        // Solo inicializar si estamos en la página de tienda
        if (!document.querySelector('.store-container')) return;

        console.log('🛒 Inicializando UI de Tienda...');

        this.bindEvents();
        this.loadCategory(this.currentCategory);

        // Inicializar PayPal si es necesario
        PaymentService.init();
    }

    bindEvents() {
        // Navegación de categorías
        const navButtons = document.querySelectorAll('.category-nav .nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.closest('.nav-btn').dataset.category;
                this.switchCategory(category);
            });
        });
    }

    switchCategory(category) {
        this.currentCategory = category;

        // Actualizar botones activos
        document.querySelectorAll('.category-nav .nav-btn').forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Ocultar todas las secciones
        document.querySelectorAll('.store-section').forEach(section => {
            section.style.display = 'none';
        });

        // Mostrar sección actual y cargar productos
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

        grid.innerHTML = ''; // Limpiar

        if (products.length === 0) {
            grid.innerHTML = '<div class="empty-state">No hay productos disponibles</div>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';

            // Renderizado diferente para monedas (dinero real) vs items (monedas virtuales)
            if (category === 'monedas') {
                this.renderRealMoneyProduct(card, product);
            } else {
                this.renderVirtualProduct(card, product, category);
            }

            grid.appendChild(card);
        });

        // Si es categoría de monedas, renderizar botones de PayPal
        if (category === 'monedas') {
            PaymentService.renderButtons();
        }
    }

    renderVirtualProduct(card, product, category) {
        card.innerHTML = `
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
                    Comprar
                </button>
            </div>
        `;

        card.querySelector('.btn-buy').addEventListener('click', () => {
            StoreService.purchaseItem(product.id, category);
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
                <!-- Contenedor para botón de PayPal -->
                <div class="paypal-button-container" data-product-id="${product.id}"></div>
            </div>
        `;
    }
}

export default new Store();
