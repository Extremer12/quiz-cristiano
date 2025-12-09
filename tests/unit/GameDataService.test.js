/**
 * Unit Tests for GameDataService.js
 * Tests data management, persistence, and event callbacks
 */

// Mock FirebaseService before importing
jest.mock('../../src/services/FirebaseService.js', () => ({
    default: {
        syncUserDataToFirebase: jest.fn().mockResolvedValue(true)
    }
}));

describe('GameDataService', () => {
    let GameDataService;
    let FirebaseService;

    beforeEach(() => {
        // Clear localStorage
        localStorage.clear();

        // Reset modules to get fresh instances
        jest.resetModules();

        // Import fresh instances
        GameDataService = require('../../src/services/GameDataService.js').default;
        FirebaseService = require('../../src/services/FirebaseService.js').default;

        // Reset the service state manually
        GameDataService.gameData = {
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
        GameDataService.inventory = {
            eliminate: 0,
            timeExtender: 0,
            secondChance: 0
        };
        GameDataService.listeners = {
            coinsChanged: [],
            inventoryChanged: [],
            dataChanged: []
        };

        // Clear all mocks
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize with default data structure', () => {
            expect(GameDataService.gameData).toBeDefined();
            expect(GameDataService.gameData.coins).toBe(0);
            expect(GameDataService.inventory).toEqual({
                eliminate: 0,
                timeExtender: 0,
                secondChance: 0
            });
        });

        test('should load data from localStorage if available', () => {
            const testData = {
                coins: 500,
                stats: { gamesPlayed: 10 }
            };
            const inventoryData = {
                powerups: { eliminate: 3 },
                lastUpdated: Date.now()
            };
            localStorage.setItem('quizCristianoData', JSON.stringify(testData));
            localStorage.setItem('quizCristianoInventory', JSON.stringify(inventoryData));

            GameDataService.loadAllData();

            expect(GameDataService.gameData.coins).toBe(500);
            expect(GameDataService.inventory.eliminate).toBe(3);
        });
    });

    describe('Coins Management', () => {
        test('should get current coins', () => {
            GameDataService.gameData.coins = 150;

            expect(GameDataService.getCoins()).toBe(150);
        });

        test('should add coins correctly', () => {
            const initialCoins = GameDataService.getCoins();

            GameDataService.addCoins(50, 'test');

            expect(GameDataService.getCoins()).toBe(initialCoins + 50);
        });

        test('should not add negative coins', () => {
            const initialCoins = GameDataService.getCoins();

            GameDataService.addCoins(-50, 'test');

            expect(GameDataService.getCoins()).toBe(initialCoins);
        });

        test('should spend coins if sufficient balance', () => {
            GameDataService.gameData.coins = 100;

            const result = GameDataService.spendCoins(30, 'test');

            expect(result).toBe(true);
            expect(GameDataService.getCoins()).toBe(70);
        });

        test('should not spend coins if insufficient balance', () => {
            GameDataService.gameData.coins = 20;

            const result = GameDataService.spendCoins(30, 'test');

            expect(result).toBe(false);
            expect(GameDataService.getCoins()).toBe(20);
        });

        test('should not spend negative amount', () => {
            GameDataService.gameData.coins = 100;

            GameDataService.spendCoins(-50, 'test');

            expect(GameDataService.getCoins()).toBe(100);
        });

        test('should save data after adding coins', () => {
            GameDataService.saveAllData = jest.fn();

            GameDataService.addCoins(50, 'test');

            expect(GameDataService.saveAllData).toHaveBeenCalled();
        });

        test('should save data after spending coins', () => {
            GameDataService.gameData.coins = 100;
            GameDataService.saveAllData = jest.fn();

            GameDataService.spendCoins(30, 'test');

            expect(GameDataService.saveAllData).toHaveBeenCalled();
        });
    });

    describe('Inventory Management', () => {
        test('should get full inventory', () => {
            GameDataService.inventory = {
                eliminate: 3,
                timeExtender: 2,
                secondChance: 1
            };

            const inventory = GameDataService.getInventory();

            expect(inventory.eliminate).toBe(3);
            expect(inventory.timeExtender).toBe(2);
        });

        test('should get powerup count', () => {
            GameDataService.inventory = { eliminate: 5 };

            expect(GameDataService.getPowerupCount('eliminate')).toBe(5);
        });

        test('should return 0 for non-existent powerup', () => {
            expect(GameDataService.getPowerupCount('nonExistent')).toBe(0);
        });

        test('should add powerup to inventory', () => {
            GameDataService.addPowerup('eliminate', 3, 'purchase');

            expect(GameDataService.getPowerupCount('eliminate')).toBe(3);
        });

        test('should increment existing powerup count', () => {
            GameDataService.inventory = { eliminate: 2 };

            GameDataService.addPowerup('eliminate', 3, 'purchase');

            expect(GameDataService.getPowerupCount('eliminate')).toBe(5);
        });

        test('should not add invalid powerup', () => {
            const result = GameDataService.addPowerup('invalidPowerup', 1, 'test');

            expect(result).toBe(false);
        });

        test('should use powerup if available', () => {
            GameDataService.inventory = { eliminate: 3 };

            const result = GameDataService.usePowerup('eliminate', 1, 'game');

            expect(result).toBe(true);
            expect(GameDataService.getPowerupCount('eliminate')).toBe(2);
        });

        test('should not use powerup if insufficient quantity', () => {
            GameDataService.inventory = { eliminate: 1 };

            const result = GameDataService.usePowerup('eliminate', 3, 'game');

            expect(result).toBe(false);
            expect(GameDataService.getPowerupCount('eliminate')).toBe(1);
        });

        test('should not use invalid powerup', () => {
            const result = GameDataService.usePowerup('invalidPowerup', 1, 'test');

            expect(result).toBe(false);
        });

        test('should validate powerup IDs correctly', () => {
            expect(GameDataService.isValidPowerupId('eliminate')).toBe(true);
            expect(GameDataService.isValidPowerupId('timeExtender')).toBe(true);
            expect(GameDataService.isValidPowerupId('secondChance')).toBe(true);
            expect(GameDataService.isValidPowerupId('invalid')).toBe(false);
        });
    });

    describe('Data Persistence', () => {
        test('should save data to localStorage', () => {
            GameDataService.gameData.coins = 250;
            GameDataService.inventory = { eliminate: 2 };

            GameDataService.saveAllData();

            const saved = JSON.parse(localStorage.getItem('quizCristianoData'));
            expect(saved.coins).toBe(250);

            const savedInventory = JSON.parse(localStorage.getItem('quizCristianoInventory'));
            expect(savedInventory.powerups.eliminate).toBe(2);
        });

        test('should load data from localStorage', () => {
            const testData = {
                coins: 300,
                stats: { gamesPlayed: 5 }
            };
            const inventoryData = {
                powerups: { timeExtender: 4 },
                lastUpdated: Date.now()
            };
            localStorage.setItem('quizCristianoData', JSON.stringify(testData));
            localStorage.setItem('quizCristianoInventory', JSON.stringify(inventoryData));

            GameDataService.loadAllData();

            expect(GameDataService.gameData.coins).toBe(300);
            expect(GameDataService.inventory.timeExtender).toBe(4);
        });

        test('should handle corrupted localStorage data', () => {
            localStorage.setItem('quizCristianoData', 'invalid json');

            expect(() => GameDataService.loadAllData()).not.toThrow();

            // Should keep existing valid data
            expect(GameDataService.gameData.coins).toBeDefined();
            expect(typeof GameDataService.gameData.coins).toBe('number');
        });
    });

    describe('Event Callbacks', () => {
        test('should trigger onCoinsChanged callback when coins change', () => {
            const callback = jest.fn();
            GameDataService.onCoinsChanged(callback);

            GameDataService.addCoins(50, 'test');

            expect(callback).toHaveBeenCalled();
            const callArgs = callback.mock.calls[0][0];
            expect(callArgs.difference).toBe(50);
        });

        test('should trigger onInventoryChanged callback when inventory changes', () => {
            const callback = jest.fn();
            GameDataService.onInventoryChanged(callback);

            GameDataService.addPowerup('eliminate', 2, 'test');

            expect(callback).toHaveBeenCalled();
        });

        test('should trigger onDataChanged callback on any data change', () => {
            const callback = jest.fn();
            GameDataService.onDataChanged(callback);

            GameDataService.saveAllData();

            expect(callback).toHaveBeenCalled();
        });

        test('should support multiple callbacks', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            GameDataService.onCoinsChanged(callback1);
            GameDataService.onCoinsChanged(callback2);

            GameDataService.addCoins(10, 'test');

            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });
    });

    describe('Data Validation', () => {
        test('should validate coins are non-negative', () => {
            GameDataService.gameData.coins = -100;

            GameDataService.validateData();

            expect(GameDataService.gameData.coins).toBe(0);
        });

        test('should validate inventory quantities are non-negative', () => {
            GameDataService.inventory = {
                eliminate: -5,
                timeExtender: 3,
                secondChance: 0
            };

            GameDataService.validateData();

            expect(GameDataService.inventory.eliminate).toBe(0);
            expect(GameDataService.inventory.timeExtender).toBe(3);
        });
    });

    describe('Firebase Sync', () => {
        test('should call Firebase sync method', async () => {
            await GameDataService.safeSyncWithFirebase();

            expect(FirebaseService.syncUserDataToFirebase).toHaveBeenCalled();
        });

        test('should handle Firebase sync errors gracefully', async () => {
            FirebaseService.syncUserDataToFirebase.mockRejectedValue(new Error('Sync failed'));

            await expect(GameDataService.safeSyncWithFirebase()).resolves.not.toThrow();
        });
    });
});
