/**
 * Servicio de Tienda
 * Maneja la lógica de productos, inventario y compras.
 */

import GameDataService from './GameDataService.js';
import PaymentService from './PaymentService.js';
import { showNotification } from '../utils/Utils.js';

class StoreService {
    constructor() {
        this.products = {
            avatares: [
                {
                    id: "avatar_1",
                    name: "Águila Majestuosa",
                    price: 100,
                    currency: 'coins',
                    image: "assets/images/productos/avatares/Aguila.jpg",
                    description: "Un símbolo de fuerza y visión."
                },
                {
                    id: "avatar_2",
                    name: "León Valiente",
                    price: 150,
                    currency: 'coins',
                    image: "assets/images/productos/avatares/Leon.jpg",
                    description: "Valentía y liderazgo."
                },
                {
                    id: "avatar_3",
                    name: "Ciervo Noble",
                    price: 120,
                    currency: 'coins',
                    image: "assets/images/productos/avatares/Ciervo.jpg",
                    description: "Agilidad y gracia."
                }
            ],
            powerups: [
                {
                    id: "eliminate",
                    name: "50/50",
                    price: 50,
                    currency: 'coins',
                    image: "assets/images/productos/powerups/50-50.png",
                    description: "Elimina 2 opciones incorrectas."
                },
                {
                    id: "timeExtender",
                    name: "Tiempo Extra",
                    price: 50,
                    currency: 'coins',
                    image: "assets/images/productos/powerups/tiempo-extra.png",
                    description: "Añade 15 segundos al reloj."
                },
                {
                    id: "secondChance",
                    name: "Segunda Oportunidad",
                    price: 100,
                    currency: 'coins',
                    image: "assets/images/productos/powerups/segunda-oportunidad.png",
                    description: "Revive si fallas una pregunta."
                }
            ],
            monedas: PaymentService.getProducts() // Productos de dinero real desde PaymentService
        };
    }

    getProductsByCategory(category) {
        return this.products[category] || [];
    }

    async purchaseItem(productId, category) {
        // Buscar producto
        let product = null;
        if (category === 'monedas') {
            product = this.products.monedas.find(p => p.id === productId);
        } else {
            product = this.products[category]?.find(p => p.id === productId);
        }

        if (!product) {
            console.error('Producto no encontrado:', productId);
            return false;
        }

        // Compra con dinero real
        if (category === 'monedas') {
            // Esto se maneja vía PaymentService (botones de PayPal)
            // Aquí solo podríamos iniciar un flujo alternativo si fuera necesario
            console.log('Iniciando compra de dinero real:', product.name);
            return true;
        }

        // Compra con monedas virtuales
        if (product.currency === 'coins') {
            const currentCoins = GameDataService.getCoins();

            if (currentCoins >= product.price) {
                // Descontar monedas
                const spent = GameDataService.spendCoins(product.price, `Compra: ${product.name}`);

                if (spent) {
                    // Entregar producto
                    this.deliverProduct(product, category);
                    showNotification(`¡Compraste ${product.name}!`, 'success');
                    return true;
                }
            } else {
                showNotification('No tienes suficientes monedas', 'warning');
                return false;
            }
        }

        return false;
    }

    deliverProduct(product, category) {
        if (category === 'powerups') {
            GameDataService.addPowerup(product.id, 1, 'purchase');
        } else if (category === 'avatares') {
            // Lógica para desbloquear avatar (guardar en GameDataService)
            // Por ahora simulado, idealmente GameDataService tendría unlockItem(id)
            console.log('Avatar desbloqueado:', product.name);
            // GameDataService.unlockAvatar(product.id);
        }
    }
}

export default new StoreService();
