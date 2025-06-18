/**
 * ================================================
 * GAME DATA MANAGER - SISTEMA CENTRALIZADO DE DATOS
 * Quiz Cristiano - Un solo punto de verdad para todos los datos
 * ================================================
 */

class GameDataManager {
    constructor() {
        this.version = '1.0.0';
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
        
        // Inventario centralizado con mapeo correcto
        this.inventory = {
            eliminate: 0,           // Mapea a hint_eliminator en store
            timeExtender: 0,        // Mapea a time_extender en store  
            secondChance: 0         // Mapea a second_chance en store
        };
        
        // Mapeo entre IDs de store y game
        this.powerupMapping = {
            // Store ID -> Game ID
            'hint_eliminator': 'eliminate',
            'time_extender': 'timeExtender',  // ✅ CORREGIDO
            'second_chance': 'secondChance',
            
            // Game ID -> Store ID (reverso)
            'eliminate': 'hint_eliminator',
            'timeExtender': 'time_extender',  // ✅ CORREGIDO
            'secondChance': 'second_chance'
        };
        
        // Listeners para sincronización en tiempo real
        this.listeners = {
            coinsChanged: [],
            inventoryChanged: [],
            dataChanged: []
        };
        
        console.log('🎮 GameDataManager inicializado');
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================

    async init() {
        try {
            console.log('🎮 Inicializando GameDataManager...');
            
            // 1. Cargar datos existentes
            this.loadAllData();
            
            // 2. Configurar sincronización entre pestañas
            this.setupCrossTabSync();
            
            // 3. Migrar datos antiguos si existen
            await this.migrateOldData();
            
            // 4. Validar integridad de datos
            this.validateData();
            
            console.log('✅ GameDataManager inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando GameDataManager:', error);
        }
    }

    // ============================================
    // GESTIÓN DE MONEDAS
    // ============================================

    getCoins() {
        return this.gameData.coins;
    }

    addCoins(amount, reason = 'game') {
        if (typeof amount !== 'number' || amount < 0) {
            console.error('❌ Cantidad de monedas inválida:', amount);
            return false;
        }

        const oldAmount = this.gameData.coins;
        this.gameData.coins += amount;
        
        this.log(`💰 +${amount} monedas (${reason}). Total: ${this.gameData.coins}`);
        
        // Disparar eventos
        this.notifyCoinsChanged(oldAmount, this.gameData.coins, amount);
        this.saveAllData();
        
        return true;
    }

    spendCoins(amount, reason = 'purchase') {
        if (typeof amount !== 'number' || amount < 0) {
            console.error('❌ Cantidad de monedas inválida:', amount);
            return false;
        }

        if (this.gameData.coins < amount) {
            console.warn(`💸 Monedas insuficientes. Necesitas: ${amount}, Tienes: ${this.gameData.coins}`);
            return false;
        }

        const oldAmount = this.gameData.coins;
        this.gameData.coins -= amount;
        
        this.log(`💸 -${amount} monedas (${reason}). Restante: ${this.gameData.coins}`);
        
        // Disparar eventos
        this.notifyCoinsChanged(oldAmount, this.gameData.coins, -amount);
        this.saveAllData();
        
        return true;
    }

    setCoins(amount, reason = 'admin') {
        if (typeof amount !== 'number' || amount < 0) {
            console.error('❌ Cantidad de monedas inválida:', amount);
            return false;
        }

        const oldAmount = this.gameData.coins;
        this.gameData.coins = amount;
        
        this.log(`🔧 Monedas establecidas en ${amount} (${reason})`);
        
        // Disparar eventos
        this.notifyCoinsChanged(oldAmount, this.gameData.coins, amount - oldAmount);
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
        if (!this.isValidPowerupId(gameId)) {
            console.error('❌ ID de power-up inválido:', gameId);
            return false;
        }

        if (typeof quantity !== 'number' || quantity < 0) {
            console.error('❌ Cantidad inválida:', quantity);
            return false;
        }

        const oldCount = this.inventory[gameId] || 0;
        this.inventory[gameId] = oldCount + quantity;
        
        this.log(`🎯 +${quantity} ${gameId} (${reason}). Total: ${this.inventory[gameId]}`);
        
        // Disparar eventos
        this.notifyInventoryChanged(gameId, oldCount, this.inventory[gameId]);
        this.saveAllData();
        
        return true;
    }

    usePowerup(gameId, quantity = 1, reason = 'game') {
        if (!this.isValidPowerupId(gameId)) {
            console.error('❌ ID de power-up inválido:', gameId);
            return false;
        }

        const currentCount = this.inventory[gameId] || 0;
        
        if (currentCount < quantity) {
            this.log(`❌ Power-up insuficiente. Necesita: ${quantity}, Tiene: ${currentCount}`);
            return false;
        }

        const oldCount = currentCount;
        this.inventory[gameId] = currentCount - quantity;
        
        this.log(`🎯 -${quantity} ${gameId} (${reason}). Restante: ${this.inventory[gameId]}`);
        
        // Disparar eventos
        this.notifyInventoryChanged(gameId, oldCount, this.inventory[gameId]);
        this.saveAllData();
        
        return true;
    }

    // ============================================
    // GESTIÓN DE ESTADÍSTICAS
    // ============================================

    updateGameStats(gameResult) {
        this.log('📊 Actualizando estadísticas del juego:', gameResult);
        
        // Incrementar partidas jugadas
        this.gameData.gamesPlayed = (this.gameData.gamesPlayed || 0) + 1;
        
        // Actualizar victorias
        if (gameResult.victory) {
            this.gameData.victories = (this.gameData.victories || 0) + 1;
        }
        
        // Actualizar juegos perfectos
        if (gameResult.perfect) {
            this.gameData.perfectGames = (this.gameData.perfectGames || 0) + 1;
        }
        
        // Actualizar monedas ganadas
        if (gameResult.coinsEarned) {
            this.addCoins(gameResult.coinsEarned, 'game_victory');
        }
        
        // Actualizar fecha de última partida
        this.gameData.lastPlayDate = Date.now();
        
        // Guardar cambios
        this.saveAllData();
        
        this.log('✅ Estadísticas actualizadas');
    }

    getStats() {
        return {
            coins: this.gameData.coins,
            gamesPlayed: this.gameData.gamesPlayed || 0,
            victories: this.gameData.victories || 0,
            perfectGames: this.gameData.perfectGames || 0,
            lastPlayDate: this.gameData.lastPlayDate,
            winRate: this.getWinRate()
        };
    }

    getWinRate() {
        const played = this.gameData.gamesPlayed || 0;
        const won = this.gameData.victories || 0;
        return played > 0 ? Math.round((won / played) * 100) : 0;
    }

    // ============================================
    // PERSISTENCIA DE DATOS
    // ============================================

    saveAllData() {
        try {
            // Guardar datos principales
            localStorage.setItem(this.storageKey, JSON.stringify(this.gameData));
            
            // Guardar inventario
            const inventoryData = {
                powerups: this.inventory,
                lastUpdated: Date.now()
            };
            localStorage.setItem(this.inventoryKey, JSON.stringify(inventoryData));
            
            this.log('💾 Datos guardados correctamente');
            this.notifyDataChanged('save');
        } catch (error) {
            console.error('❌ Error guardando datos:', error);
        }
    }

    loadAllData() {
        try {
            // Cargar datos principales
            const gameData = localStorage.getItem(this.storageKey);
            if (gameData) {
                this.gameData = { ...this.gameData, ...JSON.parse(gameData) };
            }
            
            // Cargar inventario
            const inventoryData = localStorage.getItem(this.inventoryKey);
            if (inventoryData) {
                const inventory = JSON.parse(inventoryData);
                if (inventory.powerups) {
                    this.inventory = { ...this.inventory, ...inventory.powerups };
                }
            }
            
            console.log('📦 Datos cargados:', this.gameData);
            console.log('🎒 Inventario cargado:', this.inventory);
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
        }
    }

    // ============================================
    // MIGRACIÓN DE DATOS ANTIGUOS
    // ============================================

    async migrateOldData() {
        this.log('🔄 Verificando migración de datos...');
        
        try {
            let migrated = false;
            
            // Migrar datos antiguos de monedas
            const oldGameData = localStorage.getItem('gameData');
            if (oldGameData && !localStorage.getItem(this.storageKey)) {
                const oldData = JSON.parse(oldGameData);
                if (oldData.coins) {
                    this.gameData.coins = oldData.coins;
                    migrated = true;
                    this.log('📦 Monedas migradas desde gameData');
                }
            }
            
            // Migrar inventario antiguo
            const oldInventory = localStorage.getItem('playerInventory');
            if (oldInventory && !localStorage.getItem(this.inventoryKey)) {
                const oldInv = JSON.parse(oldInventory);
                this.inventory = this.convertToGameFormat(oldInv);
                migrated = true;
                this.log('📦 Inventario migrado desde playerInventory');
            }
            
            if (migrated) {
                this.saveAllData();
                this.log('✅ Migración completada');
            }
            
        } catch (error) {
            console.error('❌ Error en migración:', error);
        }
    }

    // ============================================
    // CONVERSIÓN ENTRE FORMATOS
    // ============================================

    convertToStoreFormat(gameInventory) {
        const storeFormat = {};
        
        Object.keys(gameInventory).forEach(gameId => {
            const storeId = this.powerupMapping[gameId];
            if (storeId) {
                storeFormat[storeId] = gameInventory[gameId];
            }
        });
        
        return storeFormat;
    }

    convertToGameFormat(storeInventory) {
        const gameFormat = {
            eliminate: 0,
            timeExtender: 0,
            secondChance: 0
        };
        
        Object.keys(storeInventory).forEach(storeId => {
            const gameId = this.powerupMapping[storeId];
            if (gameId) {
                gameFormat[gameId] = storeInventory[storeId] || 0;
            }
        });
        
        return gameFormat;
    }

    // ============================================
    // SINCRONIZACIÓN ENTRE PESTAÑAS
    // ============================================

    setupCrossTabSync() {
        // Escuchar cambios de localStorage en otras pestañas
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey || e.key === this.inventoryKey) {
                this.log('🔄 Detectado cambio en otra pestaña, recargando...');
                this.loadAllData();
                this.notifyDataChanged('synced');
            }
        });
        
        this.log('🔗 Sincronización entre pestañas configurada');
    }

    // ============================================
    // SISTEMA DE EVENTOS
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
        this.listeners.coinsChanged.forEach(callback => {
            try {
                callback({ oldAmount, newAmount, difference });
            } catch (error) {
                console.error('❌ Error en callback de monedas:', error);
            }
        });
    }

    notifyInventoryChanged(powerupId, oldCount, newCount) {
        this.listeners.inventoryChanged.forEach(callback => {
            try {
                callback({ powerupId, oldCount, newCount });
            } catch (error) {
                console.error('❌ Error en callback de inventario:', error);
            }
        });
    }

    notifyDataChanged(action) {
        this.listeners.dataChanged.forEach(callback => {
            try {
                callback({ action, timestamp: Date.now() });
            } catch (error) {
                console.error('❌ Error en callback de datos:', error);
            }
        });
    }

    // ============================================
    // UTILIDADES Y VALIDACIÓN
    // ============================================

    isValidPowerupId(gameId) {
        return ['eliminate', 'timeExtender', 'secondChance'].includes(gameId);
    }

    validateData() {
        // Validar monedas
        if (typeof this.gameData.coins !== 'number' || this.gameData.coins < 0) {
            this.gameData.coins = 0;
            this.log('⚠️ Monedas corregidas a 0');
        }
        
        // Validar inventario
        Object.keys(this.inventory).forEach(key => {
            if (typeof this.inventory[key] !== 'number' || this.inventory[key] < 0) {
                this.inventory[key] = 0;
                this.log(`⚠️ ${key} corregido a 0`);
            }
        });
        
        this.log('✅ Datos validados');
    }

    // ============================================
    // DEBUG Y UTILIDADES
    // ============================================

    log(message, data = null) {
        if (this.debugMode) {
            console.log(`[GameDataManager] ${message}`, data || '');
        }
    }

    getDebugInfo() {
        return {
            version: this.version,
            gameData: this.gameData,
            inventory: this.inventory,
            listeners: {
                coins: this.listeners.coinsChanged.length,
                inventory: this.listeners.inventoryChanged.length,
                data: this.listeners.dataChanged.length
            }
        };
    }

    reset() {
        this.log('🔄 Reseteando todos los datos...');
        
        this.gameData = {
            coins: 0,
            gamesPlayed: 0,
            victories: 0,
            perfectGames: 0,
            lastPlayDate: null,
            achievements: [],
            stats: {}
        };
        
        this.inventory = {
            eliminate: 0,
            timeExtender: 0,
            secondChance: 0
        };
        
        this.saveAllData();
        this.log('✅ Datos reseteados');
    }
}

// ============================================
// CREAR INSTANCIA GLOBAL
// ============================================

// Crear instancia única
const gameDataManager = new GameDataManager();

// Exponer globalmente
window.GameDataManager = gameDataManager;

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        gameDataManager.init();
    });
} else {
    gameDataManager.init();
}

console.log('✅ GameDataManager.js cargado completamente');