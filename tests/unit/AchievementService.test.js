/**
 * Unit Tests for AchievementService.js
 * Tests achievement system, unlocking, and progress tracking
 */

describe('AchievementService', () => {
    let AchievementService;

    beforeEach(() => {
        // Clear localStorage
        localStorage.clear();

        // Reset modules
        jest.resetModules();

        // Import service
        AchievementService = require('../../src/services/AchievementService.js').default;

        // Reset state
        AchievementService.unlockedAchievements = new Set();
    });

    describe('Initialization', () => {
        test('should have predefined achievements', () => {
            expect(AchievementService.achievements).toBeDefined();
            expect(AchievementService.achievements.length).toBeGreaterThan(0);
        });

        test('should have rarity configuration', () => {
            expect(AchievementService.rarityConfig).toBeDefined();
            expect(AchievementService.rarityConfig.common).toBeDefined();
            expect(AchievementService.rarityConfig.rare).toBeDefined();
            expect(AchievementService.rarityConfig.epic).toBeDefined();
            expect(AchievementService.rarityConfig.legendary).toBeDefined();
        });
    });

    describe('Achievement Structure', () => {
        test('should have achievements with required fields', () => {
            AchievementService.achievements.forEach(achievement => {
                expect(achievement.id).toBeDefined();
                expect(achievement.name).toBeDefined();
                expect(achievement.description).toBeDefined();
                expect(achievement.category).toBeDefined();
                expect(achievement.rarity).toBeDefined();
                expect(achievement.condition).toBeDefined();
                expect(typeof achievement.condition).toBe('function');
            });
        });

        test('should have valid rarity levels', () => {
            const validRarities = ['common', 'rare', 'epic', 'legendary'];

            AchievementService.achievements.forEach(achievement => {
                expect(validRarities).toContain(achievement.rarity);
            });
        });

        test('should have valid categories', () => {
            const validCategories = ['general', 'mastery', 'special'];

            AchievementService.achievements.forEach(achievement => {
                expect(validCategories).toContain(achievement.category);
            });
        });
    });

    describe('Achievement Retrieval', () => {
        test('should get all achievements', () => {
            const allAchievements = AchievementService.getAllAchievements();

            expect(allAchievements).toBeDefined();
            expect(Array.isArray(allAchievements)).toBe(true);
            expect(allAchievements.length).toBe(AchievementService.achievements.length);
        });

        test('should include unlock status in achievements', () => {
            AchievementService.unlockedAchievements = new Set([AchievementService.achievements[0].id]);

            const allAchievements = AchievementService.getAllAchievements();
            const firstAchievement = allAchievements[0];

            expect(firstAchievement.unlocked).toBe(true);
        });

        test('should filter achievements by category', () => {
            const generalAchievements = AchievementService.getAchievementsByCategory('general');

            expect(generalAchievements).toBeDefined();
            generalAchievements.forEach(achievement => {
                expect(achievement.category).toBe('general');
            });
        });

        test('should return empty array for invalid category', () => {
            const invalidCategory = AchievementService.getAchievementsByCategory('invalid');

            expect(invalidCategory).toEqual([]);
        });
    });

    describe('Achievement Unlocking', () => {
        test('should unlock achievement', () => {
            const achievement = AchievementService.achievements[0];

            AchievementService.unlockAchievement(achievement);

            expect(AchievementService.isUnlocked(achievement.id)).toBe(true);
        });

        test('should save data after unlocking', () => {
            AchievementService.saveAchievementsData = jest.fn();
            const achievement = AchievementService.achievements[0];

            AchievementService.unlockAchievement(achievement);

            expect(AchievementService.saveAchievementsData).toHaveBeenCalled();
        });

        test('should not unlock already unlocked achievement', () => {
            const achievement = AchievementService.achievements[0];
            AchievementService.unlockedAchievements.add(achievement.id);

            const initialSize = AchievementService.unlockedAchievements.size;
            AchievementService.unlockAchievement(achievement);

            expect(AchievementService.unlockedAchievements.size).toBe(initialSize);
        });

        test('should check if achievement is unlocked', () => {
            const achievementId = 'test-achievement';

            expect(AchievementService.isUnlocked(achievementId)).toBe(false);

            AchievementService.unlockedAchievements.add(achievementId);

            expect(AchievementService.isUnlocked(achievementId)).toBe(true);
        });
    });

    describe('Achievement Progress', () => {
        test('should calculate progress for numeric achievements', () => {
            const achievement = {
                id: 'win-10-games',
                requirements: { gamesWon: 10 }
            };
            const stats = { gamesWon: 5 };

            const progress = AchievementService.getProgress(achievement, stats);

            expect(progress).toBe(50);
        });

        test('should return 100% progress when requirement met', () => {
            const achievement = {
                id: 'win-10-games',
                requirements: { gamesWon: 10 }
            };
            const stats = { gamesWon: 15 };

            const progress = AchievementService.getProgress(achievement, stats);

            expect(progress).toBe(100);
        });

        test('should return 0% progress for new players', () => {
            const achievement = {
                id: 'win-10-games',
                requirements: { gamesWon: 10 }
            };
            const stats = { gamesWon: 0 };

            const progress = AchievementService.getProgress(achievement, stats);

            expect(progress).toBe(0);
        });

        test('should get required value for achievement', () => {
            const achievement = {
                requirements: { gamesWon: 50 }
            };

            const required = AchievementService.getRequiredValue(achievement, 'gamesWon');

            expect(required).toBe(50);
        });
    });

    describe('Auto-Check Achievements', () => {
        test('should check and unlock eligible achievements', () => {
            const stats = {
                gamesPlayed: 1,
                gamesWon: 1,
                totalScore: 100
            };

            AchievementService.checkAchievements(stats);

            const unlockedCount = AchievementService.getUnlockedCount();
            expect(unlockedCount).toBeGreaterThanOrEqual(0);
        });

        test('should not re-unlock already unlocked achievements', () => {
            const stats = {
                gamesPlayed: 10,
                gamesWon: 10
            };

            AchievementService.checkAchievements(stats);
            const firstCount = AchievementService.getUnlockedCount();

            AchievementService.checkAchievements(stats);
            const secondCount = AchievementService.getUnlockedCount();

            expect(secondCount).toBe(firstCount);
        });
    });

    describe('Statistics', () => {
        test('should get total achievements count', () => {
            const total = AchievementService.getTotalAchievements();

            expect(total).toBe(AchievementService.achievements.length);
        });

        test('should get unlocked achievements count', () => {
            AchievementService.unlockedAchievements = new Set(['achievement1', 'achievement2', 'achievement3']);

            const count = AchievementService.getUnlockedCount();

            expect(count).toBe(3);
        });

        test('should calculate completion percentage', () => {
            AchievementService.unlockedAchievements = new Set(['achievement1', 'achievement2']);

            const percentage = AchievementService.getCompletionPercentage();

            expect(percentage).toBeGreaterThanOrEqual(0);
            expect(percentage).toBeLessThanOrEqual(100);
        });

        test('should return 0% for no unlocked achievements', () => {
            AchievementService.unlockedAchievements = new Set();

            const percentage = AchievementService.getCompletionPercentage();

            expect(percentage).toBe(0);
        });

        test('should return 100% when all achievements unlocked', () => {
            AchievementService.achievements.forEach(achievement => {
                AchievementService.unlockedAchievements.add(achievement.id);
            });

            const percentage = AchievementService.getCompletionPercentage();

            expect(percentage).toBe(100);
        });
    });

    describe('Data Persistence', () => {
        test('should save achievements data to localStorage', () => {
            AchievementService.unlockedAchievements = new Set(['achievement1', 'achievement2']);

            AchievementService.saveAchievementsData();

            const saved = JSON.parse(localStorage.getItem('quizCristianoAchievements'));
            expect(saved.unlockedAchievements).toContain('achievement1');
            expect(saved.unlockedAchievements).toContain('achievement2');
        });

        test('should load achievements data from localStorage', () => {
            const testData = {
                unlockedAchievements: ['achievement1', 'achievement2']
            };
            localStorage.setItem('quizCristianoAchievements', JSON.stringify(testData));

            AchievementService.loadAchievementsData();

            expect(AchievementService.isUnlocked('achievement1')).toBe(true);
            expect(AchievementService.isUnlocked('achievement2')).toBe(true);
        });

        test('should handle corrupted localStorage data', () => {
            localStorage.setItem('quizCristianoAchievements', 'invalid json');

            expect(() => AchievementService.loadAchievementsData()).not.toThrow();
            expect(AchievementService.unlockedAchievements.size).toBe(0);
        });

        test('should initialize empty set if no saved data', () => {
            localStorage.removeItem('quizCristianoAchievements');

            AchievementService.loadAchievementsData();

            expect(AchievementService.unlockedAchievements).toBeDefined();
            expect(AchievementService.unlockedAchievements.size).toBe(0);
        });
    });
});
