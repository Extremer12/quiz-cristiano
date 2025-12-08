/**
 * Servicio de Pagos
 * Maneja la integración con PayPal y la compra de monedas.
 */

import GameDataService from './GameDataService.js';
import FirebaseService from './FirebaseService.js';
import { showNotification } from '../utils/Utils.js';

class PaymentService {
    constructor() {
        this.initialized = false;
        this.paypalLoaded = false;

        // Configuración
        this.config = {
            clientId: 'sb', // 'sb' es para sandbox genérico si no hay ID real
            currency: 'USD',
            products: [
                { id: 'coins_100', name: '100 Monedas', amount: 100, price: 0.99 },
                { id: 'coins_500', name: '500 Monedas', amount: 500, price: 4.99 },
                { id: 'coins_1000', name: '1000 Monedas', amount: 1000, price: 9.99 },
                { id: 'coins_5000', name: '5000 Monedas', amount: 5000, price: 39.99 }
            ]
        };
    }

    init() {
        if (this.initialized) return;

        console.log('💳 Inicializando PaymentService...');
        this.loadPayPalSDK();
        this.initialized = true;
    }

    loadPayPalSDK() {
        if (document.getElementById('paypal-sdk')) {
            this.paypalLoaded = true;
            return;
        }

        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        script.src = `https://www.paypal.com/sdk/js?client-id=${this.config.clientId}&currency=${this.config.currency}&components=buttons`;

        script.onload = () => {
            console.log('✅ PayPal SDK cargado');
            this.paypalLoaded = true;
            this.renderButtons();
        };

        script.onerror = () => {
            console.warn('⚠️ Error cargando PayPal SDK (posiblemente offline o bloqueado)');
        };

        document.head.appendChild(script);
    }

    getProducts() {
        return this.config.products;
    }

    getProduct(id) {
        return this.config.products.find(p => p.id === id);
    }

    renderButtons() {
        // Buscar contenedores de botones de PayPal en la página actual
        const containers = document.querySelectorAll('.paypal-button-container');

        containers.forEach(container => {
            const productId = container.dataset.productId;
            const product = this.getProduct(productId);

            if (product && window.paypal) {
                container.innerHTML = ''; // Limpiar

                window.paypal.Buttons({
                    createOrder: (data, actions) => {
                        return actions.order.create({
                            purchase_units: [{
                                description: product.name,
                                amount: {
                                    value: product.price.toString()
                                }
                            }]
                        });
                    },
                    onApprove: async (data, actions) => {
                        try {
                            const order = await actions.order.capture();
                            this.handleSuccessfulPayment(product, order);
                        } catch (error) {
                            console.error('Error capturando pago:', error);
                            showNotification('Error procesando el pago', 'error');
                        }
                    },
                    onError: (err) => {
                        console.error('Error de PayPal:', err);
                        showNotification('Error en la conexión con PayPal', 'error');
                    }
                }).render(container);
            }
        });
    }

    async handleSuccessfulPayment(product, order) {
        console.log('✅ Pago exitoso:', order);

        // 1. Dar monedas al usuario
        const success = GameDataService.addCoins(product.amount, 'purchase');

        if (success) {
            showNotification(`¡Has comprado ${product.amount} monedas!`, 'success');

            // 2. Registrar transacción en Firebase
            try {
                const transactionData = {
                    transactionId: order.id,
                    productId: product.id,
                    amount: product.amount,
                    price: product.price,
                    currency: this.config.currency,
                    timestamp: new Date().toISOString(),
                    provider: 'paypal',
                    status: 'completed'
                };

                // Usar FirebaseService si tuviera un método específico, o guardar en colección genérica
                // Por ahora, confiamos en que GameDataService sincroniza el saldo
            } catch (error) {
                console.warn('Error registrando transacción:', error);
            }
        } else {
            showNotification('Error añadiendo monedas. Contacta soporte.', 'error');
        }
    }
}

export default new PaymentService();
