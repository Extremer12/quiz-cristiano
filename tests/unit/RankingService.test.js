/**
 * Unit Tests for RankingService.js
 * Tests division system, score calculation, and player generation
 */

describe('RankingService', () => {
    let RankingService;
    let GameDataService;

    beforeEach(() => {
        // Reset modules
        jest.resetModules();

        // Mock GameDataService
        jest.doMock('../../src/services/GameDataService.js', () => ({
            default: {
                gameData: {
                    stats: {
                        gamesPlayed: 50,
                        gamesWon: 30,
                        totalScore: 15000,
                        correctAnswers: 200,
                        totalQuestions: 250,
                        perfectGames: 5,
                        categoriesCompleted: 10
                    }
                }
            }
        }));

        // Import services
        RankingService = require('../../src/services/RankingService.js').default;
        GameDataService = require('../../src/services/GameDataService.js').default;
    });

    describe('Division System', () => {
        test('should have divisions defined', () => {
            expect(RankingService.divisionSystem.divisions).toBeDefined();
            expect(RankingService.divisionSystem.divisions.length).toBeGreaterThan(0);
        });

        test('should get player division based on stats', () => {
            const division = RankingService.getPlayerDivision(GameDataService.gameData);

            expect(division).toBeDefined();
            expect(division.id).toBeDefined();
            expect(division.name).toBeDefined();
        });

        test('should return lowest division for new players', () => {
            const newPlayerData = {
                stats: {
                    gamesPlayed: 0,
                    gamesWon: 0,
                    totalScore: 0
                }
            };

            const division = RankingService.getPlayerDivision(newPlayerData);

            expect(division.id).toBe('bronce-iii');
        });
    });

    describe('Level Calculation', () => {
        test('should calculate player level from stats', () => {
            const level = RankingService.calculatePlayerLevel(GameDataService.gameData);

            expect(level).toBeGreaterThan(0);
            expect(typeof level).toBe('number');
        });

        test('should return level 1 for new players', () => {
            const newPlayerData = {
                stats: {
                    gamesPlayed: 0,
                    gamesWon: 0,
                    totalScore: 0
                }
            };

            const level = RankingService.calculatePlayerLevel(newPlayerData);

            expect(level).toBe(1);
        });

        test('should increase level with more experience', () => {
            const lowExpData = {
                stats: { gamesPlayed: 10, gamesWon: 5, totalScore: 1000 }
            };
            const highExpData = {
                stats: { gamesPlayed: 100, gamesWon: 80, totalScore: 50000 }
            };

            const lowLevel = RankingService.calculatePlayerLevel(lowExpData);
            const highLevel = RankingService.calculatePlayerLevel(highExpData);

            expect(highLevel).toBeGreaterThan(lowLevel);
        });
    });

    describe('Integral Score Calculation', () => {
        test('should calculate integral score correctly', () => {
            const score = RankingService.calculateIntegralScore(GameDataService.gameData);

            expect(score).toBeGreaterThan(0);
            expect(typeof score).toBe('number');
        });

        test('should return 0 for players with no stats', () => {
            const emptyData = {
                stats: {
                    gamesPlayed: 0,
                    gamesWon: 0,
                    totalScore: 0
                }
            };

            const score = RankingService.calculateIntegralScore(emptyData);

            expect(score).toBe(0);
        });

        test('should weight win rate in score calculation', () => {
            const highWinRate = {
                stats: {
                    gamesPlayed: 100,
                    gamesWon: 90,
                    totalScore: 10000,
                    correctAnswers: 300,
                    totalQuestions: 350
                }
            };
            const lowWinRate = {
                stats: {
                    gamesPlayed: 100,
                    gamesWon: 30,
                    totalScore: 10000,
                    correctAnswers: 300,
                    totalQuestions: 350
                }
            };

            const highScore = RankingService.calculateIntegralScore(highWinRate);
            const lowScore = RankingService.calculateIntegralScore(lowWinRate);

            expect(highScore).toBeGreaterThan(lowScore);
        });
    });

    describe('Player Generation', () => {
        test('should generate player with correct structure', () => {
            const division = RankingService.divisionSystem.divisions[0];

            const player = RankingService.generatePlayer(false, division, 1);

            expect(player).toBeDefined();
            expect(player.position).toBe(1);
            expect(player.isBot).toBe(false);
            expect(player.username).toBeDefined();
            expect(player.level).toBeDefined();
            expect(player.score).toBeDefined();
        });

        test('should generate bot with palmares', () => {
            const palmares = RankingService.generateBotPalmares();

            expect(palmares).toBeDefined();
            expect(typeof palmares.titles).toBe('number');
            expect(typeof palmares.trophies).toBe('number');
        });

        test('should generate division players', () => {
            const division = RankingService.divisionSystem.divisions[0];

            const players = RankingService.generateDivisionPlayers(division);

            expect(players).toBeDefined();
            expect(players.length).toBe(division.playerCount);
        });

        test('should order players by score descending', () => {
            const division = RankingService.divisionSystem.divisions[0];

            const players = RankingService.generateDivisionPlayers(division);

            for (let i = 0; i < players.length - 1; i++) {
                expect(players[i].score).toBeGreaterThanOrEqual(players[i + 1].score);
            }
        });
    });

    describe('Season Management', () => {
        test('should get current season', () => {
            const season = RankingService.getCurrentSeason();

            expect(season).toBeDefined();
            expect(typeof season).toBe('string');
            expect(season).toMatch(/\d{4}-\d{2}/);
        });

        test('should calculate days until season end', () => {
            const days = RankingService.getDaysUntilSeasonEnd();

            expect(days).toBeGreaterThanOrEqual(0);
            expect(days).toBeLessThanOrEqual(31);
        });

        test('should return all divisions', () => {
            const divisions = RankingService.getAllDivisions();

            expect(divisions).toBeDefined();
            expect(Array.isArray(divisions)).toBe(true);
            expect(divisions.length).toBeGreaterThan(0);
        });
    });

    describe('Division Data Loading', () => {
        test('should load all divisions data', () => {
            const allDivisionsData = RankingService.loadAllDivisionsData();

            expect(allDivisionsData).toBeDefined();
            expect(Array.isArray(allDivisionsData)).toBe(true);
        });

        test('should generate players for each division', () => {
            const allDivisionsData = RankingService.loadAllDivisionsData();

            allDivisionsData.forEach(divisionData => {
                expect(divisionData.players).toBeDefined();
                expect(divisionData.players.length).toBeGreaterThan(0);
            });
        });
    });
});
