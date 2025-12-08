/**
 * Servicio de Datos del Juego
 * Maneja el estado local (monedas, inventario, estadísticas) y la sincronización con Firebase.
 */

import FirebaseService from './FirebaseService.js';

class GameDataService {
    constructor() {
        this.storageKey = 'quizCristianoData';
        this.inventoryKey = 'quizCristianoInventory';
        this.debugMode = true;

        // Estado centralizado de datos
        this.gameData = {
            coins: 0,
            gamesPlayed: 0,
            victories: 0,
            perfectGames: 0,
            lastPlayDate: null,
            achievements: [],
            stats: {},
            settings: {
                theme: 'light',
                soundEnabled: true,
                vibrationEnabled: true
            }
        };

        // Inventario centralizado
        this.inventory = {
            eliminate: 0,
            timeExtender: 0,
            secondChance: 0
        };

        // Listeners
        this.listeners = {
            coinsChanged: [],
            inventoryChanged: [],
            dataChanged: []
        };
    }

    init() {
        console.log('💾 Inicializando GameDataService...');
        this.loadAllData();
        this.setupCrossTabSync();
        this.validateData();

        // Configurar auto-sync
        this.setupAutoSync();

        console.log('✅ GameDataService listo');
    }

    // ============================================
    // GESTIÓN DE MONEDAS
    // ============================================

    getCoins() {
        return this.gameData.coins;
    }

    addCoins(amount, reason = 'game') {
        if (typeof amount !== 'number' || amount < 0) return false;

        const oldAmount = this.gameData.coins;
        this.gameData.coins += amount;

        this.log(`+${amount} monedas (${reason}). Total: ${this.gameData.coins}`);

        this.notifyCoinsChanged(oldAmount, this.gameData.coins, amount);
        this.saveAllData();

        if (amount > 0) {
            this.safeSyncWithFirebase();
        }

        return true;
    }

    spendCoins(amount, reason = 'purchase') {
        if (typeof amount !== 'number' || amount < 0) return false;
        if (this.gameData.coins < amount) {
            console.warn(`Monedas insuficientes. Necesitas: ${amount}, Tienes: ${this.gameData.coins}`);
            return false;
        }

        const oldAmount = this.gameData.coins;
        this.gameData.coins -= amount;

        this.log(`-${amount} monedas (${reason}). Restante: ${this.gameData.coins}`);

        this.notifyCoinsChanged(oldAmount, this.gameData.coins, -amount);
        this.saveAllData();

        return true;
    }

    // ============================================
    // GESTIÓN DE INVENTARIO
    // ============================================

    getInventory() {
        return { ...this.inventory };
    }

    getPowerupCount(gameId) {
        return this.inventory[gameId] || 0;
    }

    addPowerup(gameId, quantity = 1, reason = 'purchase') {
        if (!this.isValidPowerupId(gameId)) return false;
        if (typeof quantity !== 'number' || quantity < 0) return false;

        const oldCount = this.inventory[gameId] || 0;
        this.inventory[gameId] = oldCount + quantity;

        this.log(`+${quantity} ${gameId} (${reason}). Total: ${this.inventory[gameId]}`);

        this.notifyInventoryChanged(gameId, oldCount, this.inventory[gameId]);
        this.saveAllData();

        return true;
    }

    usePowerup(gameId, quantity = 1, reason = 'game') {
        if (!this.isValidPowerupId(gameId)) return false;

        const currentCount = this.inventory[gameId] || 0;
        if (currentCount < quantity) return false;

        const oldCount = currentCount;
        this.inventory[gameId] = currentCount - quantity;

        this.log(`-${quantity} ${gameId} (${reason}). Restante: ${this.inventory[gameId]}`);

        this.notifyInventoryChanged(gameId, oldCount, this.inventory[gameId]);
        this.saveAllData();

        return true;
    }

    isValidPowerupId(gameId) {
        return ['eliminate', 'timeExtender', 'secondChance'].includes(gameId);
    }

    // ============================================
    // PERSISTENCIA Y SYNC
    // ============================================

    saveAllData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.gameData));

            const inventoryData = {
                powerups: this.inventory,
                lastUpdated: Date.now()
            };
            localStorage.setItem(this.inventoryKey, JSON.stringify(inventoryData));
            localStorage.setItem('lastDataChange', Date.now().toString());

            this.notifyDataChanged('save');
        } catch (error) {
            console.error('❌ Error guardando datos:', error);
        }
    }

    loadAllData() {
        try {
            const gameData = localStorage.getItem(this.storageKey);
            if (gameData) {
                this.gameData = { ...this.gameData, ...JSON.parse(gameData) };
            }

            const inventoryData = localStorage.getItem(this.inventoryKey);
            if (inventoryData) {
                const inventory = JSON.parse(inventoryData);
                if (inventory.powerups) {
                    this.inventory = { ...this.inventory, ...inventory.powerups };
                }
            }
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
        }
    }

    setupAutoSync() {
        // Sync periódico si hay cambios
        setInterval(() => {
            const lastChange = localStorage.getItem('lastDataChange');
            const lastSync = localStorage.getItem('lastFirebaseSync');

            if (lastChange && (!lastSync || parseInt(lastChange) > parseInt(lastSync))) {
                this.safeSyncWithFirebase();
            }
        }, 30000);
    }

    safeSyncWithFirebase() {
        // Delegar a FirebaseService
        FirebaseService.syncUserDataToFirebase().then(success => {
            if (success) {
                localStorage.setItem('lastFirebaseSync', Date.now().toString());
            }
        });
    }

    setupCrossTabSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey || e.key === this.inventoryKey) {
                this.loadAllData();
                this.notifyDataChanged('synced');
            }
        });
    }

    validateData() {
        if (typeof this.gameData.coins !== 'number' || this.gameData.coins < 0) {
            this.gameData.coins = 0;
        }
        Object.keys(this.inventory).forEach(key => {
            if (typeof this.inventory[key] !== 'number' || this.inventory[key] < 0) {
                this.inventory[key] = 0;
            }
        });
    }

    // ============================================
    // EVENTOS
    // ============================================

    onCoinsChanged(callback) {
        this.listeners.coinsChanged.push(callback);
    }

    onInventoryChanged(callback) {
        this.listeners.inventoryChanged.push(callback);
    }

    onDataChanged(callback) {
        this.listeners.dataChanged.push(callback);
    }

    notifyCoinsChanged(oldAmount, newAmount, difference) {
        this.listeners.coinsChanged.forEach(cb => cb({ oldAmount, newAmount, difference }));
        // Actualizar UI globalmente si es necesario, o dejar que UI se suscriba
        const event = new CustomEvent('coinsUpdated', { detail: { coins: newAmount } });
        window.dispatchEvent(event);
    }

    notifyInventoryChanged(powerupId, oldCount, newCount) {
        this.listeners.inventoryChanged.forEach(cb => cb({ powerupId, oldCount, newCount }));
    }

    notifyDataChanged(action) {
        this.listeners.dataChanged.forEach(cb => cb({ action, timestamp: Date.now() }));
    }

    log(message) {
        if (this.debugMode) console.log(`[GameDataService] ${message}`);
    }
}

export default new GameDataService();
