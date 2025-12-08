/**
 * Script de Migración de Datos Legacy
 * 
 * Este script se ejecuta una sola vez para migrar datos del formato antiguo
 * al nuevo formato de GameDataService.
 */

class DataMigration {
    constructor() {
        this.legacyKeys = [
            'userData',
            'userCoins',
            'userInventory',
            'gameStats',
            'playerData'
        ];
        this.newKey = 'quizCristianoData';
        this.newInventoryKey = 'quizCristianoInventory';
        this.migrationKey = 'dataMigrationCompleted';
    }

    /**
     * Ejecuta la migración si es necesaria
     */
    migrate() {
        // Verificar si ya se migró
        if (localStorage.getItem(this.migrationKey)) {
            console.log('✅ Migración ya completada anteriormente');
            return { success: true, migrated: false };
        }

        console.log('🔄 Iniciando migración de datos...');

        try {
            const migratedData = this.collectLegacyData();
            const migratedInventory = this.collectLegacyInventory();

            // Solo migrar si hay datos legacy
            if (Object.keys(migratedData).length > 0 || Object.keys(migratedInventory).length > 0) {
                this.saveNewFormat(migratedData, migratedInventory);
                this.cleanupLegacyData();

                localStorage.setItem(this.migrationKey, new Date().toISOString());

                console.log('✅ Migración completada exitosamente');
                console.log('📊 Datos migrados:', migratedData);
                console.log('🎒 Inventario migrado:', migratedInventory);

                return { success: true, migrated: true, data: migratedData };
            } else {
                console.log('ℹ️ No se encontraron datos legacy para migrar');
                localStorage.setItem(this.migrationKey, new Date().toISOString());
                return { success: true, migrated: false };
            }
        } catch (error) {
            console.error('❌ Error durante la migración:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Recolecta datos del formato antiguo
     */
    collectLegacyData() {
        const collected = {};

        this.legacyKeys.forEach(key => {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    const parsed = JSON.parse(data);

                    // Mapear campos conocidos
                    if (parsed.coins !== undefined) collected.coins = parsed.coins;
                    if (parsed.monedas !== undefined) collected.coins = parsed.monedas;
                    if (parsed.gamesPlayed !== undefined) collected.gamesPlayed = parsed.gamesPlayed;
                    if (parsed.victories !== undefined) collected.victories = parsed.victories;
                    if (parsed.perfectGames !== undefined) collected.perfectGames = parsed.perfectGames;
                    if (parsed.achievements) collected.achievements = parsed.achievements;
                    if (parsed.stats) collected.stats = parsed.stats;
                }
            } catch (e) {
                console.warn(`No se pudo parsear ${key}:`, e);
            }
        });

        return collected;
    }

    /**
     * Recolecta inventario del formato antiguo
     */
    collectLegacyInventory() {
        const inventory = {
            eliminate: 0,
            timeExtender: 0,
            secondChance: 0
        };

        try {
            const legacyInventory = localStorage.getItem('userInventory');
            if (legacyInventory) {
                const parsed = JSON.parse(legacyInventory);

                // Mapear power-ups conocidos
                if (parsed.eliminate !== undefined) inventory.eliminate = parsed.eliminate;
                if (parsed['50-50'] !== undefined) inventory.eliminate = parsed['50-50'];
                if (parsed.timeExtender !== undefined) inventory.timeExtender = parsed.timeExtender;
                if (parsed.tiempoExtra !== undefined) inventory.timeExtender = parsed.tiempoExtra;
                if (parsed.secondChance !== undefined) inventory.secondChance = parsed.secondChance;
                if (parsed.segundaOportunidad !== undefined) inventory.secondChance = parsed.segundaOportunidad;
            }
        } catch (e) {
            console.warn('No se pudo parsear inventario legacy:', e);
        }

        return inventory;
    }

    /**
     * Guarda en el nuevo formato
     */
    saveNewFormat(migratedData, migratedInventory) {
        // Cargar datos existentes si los hay
        let existingData = {};
        let existingInventory = { powerups: {} };

        try {
            const current = localStorage.getItem(this.newKey);
            if (current) existingData = JSON.parse(current);

            const currentInv = localStorage.getItem(this.newInventoryKey);
            if (currentInv) existingInventory = JSON.parse(currentInv);
        } catch (e) {
            console.warn('No se pudieron cargar datos existentes:', e);
        }

        // Merge: priorizar datos existentes sobre legacy
        const finalData = {
            coins: existingData.coins || migratedData.coins || 0,
            gamesPlayed: existingData.gamesPlayed || migratedData.gamesPlayed || 0,
            victories: existingData.victories || migratedData.victories || 0,
            perfectGames: existingData.perfectGames || migratedData.perfectGames || 0,
            lastPlayDate: existingData.lastPlayDate || null,
            achievements: existingData.achievements || migratedData.achievements || [],
            stats: existingData.stats || migratedData.stats || {},
            settings: existingData.settings || {
                theme: 'light',
                soundEnabled: true,
                vibrationEnabled: true
            }
        };

        const finalInventory = {
            powerups: {
                eliminate: existingInventory.powerups?.eliminate || migratedInventory.eliminate || 0,
                timeExtender: existingInventory.powerups?.timeExtender || migratedInventory.timeExtender || 0,
                secondChance: existingInventory.powerups?.secondChance || migratedInventory.secondChance || 0
            },
            lastUpdated: Date.now()
        };

        localStorage.setItem(this.newKey, JSON.stringify(finalData));
        localStorage.setItem(this.newInventoryKey, JSON.stringify(finalInventory));
    }

    /**
     * Limpia datos legacy (opcional, comentado por seguridad)
     */
    cleanupLegacyData() {
        // Por seguridad, no eliminamos automáticamente
        // Los datos legacy se pueden limpiar manualmente después de verificar
        console.log('ℹ️ Datos legacy conservados para verificación');

        // Descomentar para limpiar automáticamente:
        // this.legacyKeys.forEach(key => localStorage.removeItem(key));
    }

    /**
     * Resetea la migración (solo para desarrollo/testing)
     */
    reset() {
        localStorage.removeItem(this.migrationKey);
        console.log('🔄 Flag de migración reseteado');
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataMigration;
}

// Auto-ejecutar si se carga como script standalone
if (typeof window !== 'undefined') {
    window.DataMigration = DataMigration;

    // Ejecutar migración automáticamente al cargar
    const migration = new DataMigration();
    const result = migration.migrate();

    if (result.migrated) {
        console.log('✅ Datos migrados exitosamente al nuevo formato');
    }
}
