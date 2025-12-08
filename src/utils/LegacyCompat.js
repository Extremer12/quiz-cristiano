/**
 * Wrapper de compatibilidad para código legacy
 * 
 * Este archivo proporciona una interfaz compatible con el antiguo gamedatamanager.js
 * pero usa GameDataService internamente.
 */

import GameDataService from '../services/GameDataService.js';

// Crear objeto global compatible con código legacy
window.GameDataManager = {
    // Métodos de monedas
    getCoins() {
        return GameDataService.getCoins();
    },

    addCoins(amount, reason) {
        return GameDataService.addCoins(amount, reason);
    },

    spendCoins(amount, reason) {
        return GameDataService.spendCoins(amount, reason);
    },

    // Métodos de inventario
    getInventory() {
        return GameDataService.getInventory();
    },

    getPowerupCount(powerupId) {
        return GameDataService.getPowerupCount(powerupId);
    },

    addPowerup(powerupId, quantity, reason) {
        return GameDataService.addPowerup(powerupId, quantity, reason);
    },

    usePowerup(powerupId, quantity, reason) {
        return GameDataService.usePowerup(powerupId, quantity, reason);
    },

    // Métodos de datos
    saveData() {
        GameDataService.saveAllData();
    },

    loadData() {
        GameDataService.loadAllData();
    },

    // Eventos
    onCoinsChanged(callback) {
        GameDataService.onCoinsChanged(callback);
    },

    onInventoryChanged(callback) {
        GameDataService.onInventoryChanged(callback);
    }
};

console.log('✅ GameDataManager (compatibility layer) cargado');

export default window.GameDataManager;
