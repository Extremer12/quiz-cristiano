/**
 * Servicio de Ranking
 * Maneja el sistema de divisiones, cálculo de puntajes y generación de jugadores
 */

import GameDataService from './GameDataService.js';

class RankingService {
    constructor() {
        this.divisionSystem = {
            divisions: [
                {
                    id: 'corona-divina',
                    name: 'Corona Divina',
                    minLevel: 100,
                    maxLevel: Infinity,
                    color: '#ffd700',
                    gradient: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                    icon: 'fa-crown',
                    trophyImage: 'assets/images/Trofeos/corona-divina.png',
                    description: 'Para leyendas del conocimiento bíblico',
                    maxPlayers: 30,
                    promotionZone: { start: 1, end: 0 },
                    relegationZone: { start: 26, end: 30 },
                    rewards: {
                        monthly: { coins: 10000, title: 'Leyenda Bíblica' },
                        seasonal: { coins: 25000, avatar: 'legendary_crown' }
                    }
                },
                {
                    id: 'diamante',
                    name: 'División Diamante',
                    minLevel: 76,
                    maxLevel: 100,
                    color: '#b9f2ff',
                    gradient: 'linear-gradient(135deg, #b9f2ff, #66d9ef)',
                    icon: 'fa-gem',
                    trophyImage: 'assets/images/Trofeos/Diamante.png',
                    description: 'Para maestros de las Escrituras',
                    maxPlayers: 30,
                    promotionZone: { start: 1, end: 5 },
                    relegationZone: { start: 26, end: 30 },
                    rewards: {
                        monthly: { coins: 5000, title: 'Maestro Bíblico' },
                        seasonal: { coins: 12000, avatar: 'diamond_scholar' }
                    }
                },
                {
                    id: 'platino',
                    name: 'División Platino',
                    minLevel: 51,
                    maxLevel: 75,
                    color: '#e5e4e2',
                    gradient: 'linear-gradient(135deg, #e5e4e2, #c0c0c0)',
                    icon: 'fa-medal',
                    trophyImage: 'assets/images/Trofeos/Platino.png',
                    description: 'Para expertos en conocimiento bíblico',
                    maxPlayers: 30,
                    promotionZone: { start: 1, end: 5 },
                    relegationZone: { start: 26, end: 30 },
                    rewards: {
                        monthly: { coins: 2500, title: 'Experto Bíblico' },
                        seasonal: { coins: 6000, avatar: 'platinum_student' }
                    }
                }
            ],

            scoring: {
                weights: {
                    activity: 0.40,
                    victories: 0.30,
                    achievements: 0.20,
                    level: 0.10
                },
                maxValues: {
                    monthlyGames: 100,
                    winRate: 1.0,
                    maxAchievements: 50,
                    maxLevel: 100
                }
            }
        };

        this.biblicalNames = [
            'Abraham', 'Isaac', 'Jacob', 'José', 'Moisés', 'Aarón', 'Josué', 'Caleb', 'Samuel', 'David',
            'Salomón', 'Daniel', 'Ezequiel', 'Isaías', 'Jeremías', 'Jonás', 'Elías', 'Eliseo', 'Nehemías', 'Esdras',
            'Pedro', 'Juan', 'Santiago', 'Andrés', 'Felipe', 'Mateo', 'Lucas', 'Marcos', 'Pablo', 'Timoteo',
            'Sara', 'Rebeca', 'Raquel', 'Lea', 'Miriam', 'Débora', 'Rut', 'Ana', 'Ester', 'Abigail',
            'María', 'Marta', 'María Magdalena', 'Lidia', 'Priscila', 'Dorcas', 'Eunice', 'Lois', 'Febe', 'Junia'
        ];

        this.verses = [
            'Juan 3:16', 'Salmos 23:1', 'Filipenses 4:13', 'Proverbios 3:5-6', 'Romanos 8:28',
            'Mateo 11:28', 'Jeremías 29:11', 'Isaías 40:31', '1 Corintios 13:4-7', 'Gálatas 5:22-23',
            'Efesios 6:10-11', 'Hebreos 11:1', 'Santiago 1:2-3', '1 Pedro 5:7', 'Apocalipsis 21:4'
        ];

        this.avatars = [
            'assets/images/fotos-perfil/niña.jpg',
            'assets/images/fotos-perfil/niño.jpg',
            'assets/images/fotos-perfil/oveja.jpg',
            'assets/images/fotos-perfil/paloma.jpg'
        ];

        this.rankingData = null;
    }

    /**
     * Obtiene la división del jugador actual
     */
    getPlayerDivision() {
        const gameData = GameDataService.gameData;
        const playerLevel = this.calculatePlayerLevel(gameData);

        for (let division of this.divisionSystem.divisions) {
            if (playerLevel >= division.minLevel && playerLevel <= division.maxLevel) {
                return division;
            }
        }

        return this.divisionSystem.divisions[this.divisionSystem.divisions.length - 1];
    }

    /**
     * Calcula el nivel del jugador basado en experiencia
     */
    calculatePlayerLevel(gameData) {
        const experience = (gameData.victories || 0) * 100 + (gameData.gamesPlayed || 0) * 10;
        return Math.floor(experience / 1000) + 1;
    }

    /**
     * Calcula el puntaje integral del jugador
     */
    calculateIntegralScore(gameData) {
        const weights = this.divisionSystem.scoring.weights;
        const maxValues = this.divisionSystem.scoring.maxValues;

        const monthlyData = this.getMonthlyData(gameData);

        const activityScore = Math.min(monthlyData.gamesPlayed / maxValues.monthlyGames, 1) * 100;
        const victoryScore = monthlyData.winRate * 100;
        const achievementScore = ((gameData.achievements?.length || 0) / maxValues.maxAchievements) * 100;
        const levelScore = Math.min(this.calculatePlayerLevel(gameData) / maxValues.maxLevel, 1) * 100;

        const finalScore = (
            activityScore * weights.activity +
            victoryScore * weights.victories +
            achievementScore * weights.achievements +
            levelScore * weights.level
        );

        return Math.round(finalScore);
    }

    /**
     * Obtiene datos del mes actual (simulado como 30% del total)
     */
    getMonthlyData(gameData) {
        const totalGames = gameData.gamesPlayed || 0;
        const victories = gameData.victories || 0;

        const monthlyGames = Math.floor(totalGames * 0.3);
        const monthlyVictories = Math.floor(victories * 0.3);

        return {
            gamesPlayed: monthlyGames,
            victories: monthlyVictories,
            winRate: monthlyGames > 0 ? monthlyVictories / monthlyGames : 0
        };
    }

    /**
     * Genera un jugador (bot o real)
     */
    generatePlayer(isBot, division, position) {
        const baseScore = Math.max(10, 100 - (position * 2) + (Math.random() * 10 - 5));

        if (!isBot) {
            const profileData = JSON.parse(localStorage.getItem('profileData') || '{}');
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const gameData = GameDataService.gameData;

            return {
                id: 'current_player',
                name: profileData.displayName || profileData.username || currentUser.displayName || 'Usuario',
                level: this.calculatePlayerLevel(gameData),
                score: this.calculateIntegralScore(gameData),
                avatar: profileData.currentAvatar || this.avatars[0],
                monthlyGames: this.getMonthlyData(gameData).gamesPlayed,
                winRate: this.getMonthlyData(gameData).winRate,
                achievements: gameData.achievements?.length || 0,
                favoriteVerse: profileData.favoriteVerse || 'Juan 3:16',
                isBot: false,
                isCurrentPlayer: true,
                joinDate: new Date(2024, 0, 1),
                palmares: []
            };
        }

        // Bot generado
        const name = this.biblicalNames[Math.floor(Math.random() * this.biblicalNames.length)];
        const verse = this.verses[Math.floor(Math.random() * this.verses.length)];
        const avatar = this.avatars[Math.floor(Math.random() * this.avatars.length)];

        const joinDate = new Date();
        joinDate.setDate(joinDate.getDate() - Math.floor(Math.random() * 365));

        return {
            id: `bot_${division.id}_${position}_${Date.now()}`,
            name: name,
            level: Math.floor(Math.random() * (division.maxLevel - division.minLevel + 1)) + division.minLevel,
            score: Math.max(1, baseScore),
            avatar: avatar,
            monthlyGames: Math.floor(Math.random() * 80) + 20,
            winRate: Math.random() * 0.6 + 0.3,
            achievements: Math.floor(Math.random() * 25) + 5,
            favoriteVerse: verse,
            isBot: true,
            isCurrentPlayer: false,
            joinDate: joinDate,
            palmares: this.generateBotPalmares()
        };
    }

    /**
     * Genera palmarés aleatorio para bots
     */
    generateBotPalmares() {
        const palmares = [];
        const numMedals = Math.floor(Math.random() * 5);

        for (let i = 0; i < numMedals; i++) {
            const months = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'];
            const positions = [1, 2, 3];
            const divisions = ['platino', 'diamante'];

            palmares.push({
                season: months[Math.floor(Math.random() * months.length)],
                division: divisions[Math.floor(Math.random() * divisions.length)],
                position: positions[Math.floor(Math.random() * positions.length)],
                date: new Date(2024, Math.floor(Math.random() * 12), 1)
            });
        }

        return palmares;
    }

    /**
     * Genera jugadores para una división
     */
    generateDivisionPlayers(division) {
        const players = [];

        for (let i = 0; i < division.maxPlayers; i++) {
            players.push(this.generatePlayer(true, division, i + 1));
        }

        players.sort((a, b) => b.score - a.score);

        return players;
    }

    /**
     * Carga datos de todas las divisiones
     */
    loadAllDivisionsData() {
        const allDivisions = {};
        const currentDivision = this.getPlayerDivision();

        for (let division of this.divisionSystem.divisions) {
            allDivisions[division.id] = this.generateDivisionPlayers(division);
        }

        // Insertar jugador real en su división
        if (currentDivision) {
            const divisionPlayers = allDivisions[currentDivision.id];
            const realPlayer = this.generatePlayer(false, currentDivision, 15);

            divisionPlayers[14] = realPlayer;
            divisionPlayers.sort((a, b) => b.score - a.score);

            const playerIndex = divisionPlayers.findIndex(p => p.isCurrentPlayer);
            const playerRank = playerIndex + 1;

            this.rankingData = {
                currentDivision,
                allDivisions,
                playerScore: realPlayer.score,
                playerRank
            };
        }

        return this.rankingData;
    }

    /**
     * Obtiene la temporada actual
     */
    getCurrentSeason() {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    /**
     * Obtiene días hasta el fin de temporada
     */
    getDaysUntilSeasonEnd() {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return Math.ceil((nextMonth - now) / (1000 * 60 * 60 * 24));
    }

    /**
     * Obtiene todas las divisiones
     */
    getAllDivisions() {
        return this.divisionSystem.divisions;
    }
}

export default new RankingService();
