/**
 * Servicio de Logros
 * Maneja el sistema de logros, progreso y desbloqueo automático
 */

import GameDataService from './GameDataService.js';

class AchievementService {
    constructor() {
        this.achievements = this.defineAchievements();
        this.rarityConfig = {
            common: { color: '#95a5a6', bgColor: 'rgba(149, 165, 166, 0.1)', name: 'Común' },
            uncommon: { color: '#27ae60', bgColor: 'rgba(39, 174, 96, 0.1)', name: 'Poco Común' },
            rare: { color: '#3498db', bgColor: 'rgba(52, 152, 219, 0.1)', name: 'Raro' },
            legendary: { color: '#f39c12', bgColor: 'rgba(243, 156, 18, 0.1)', name: 'Legendario' }
        };

        this.unlockedAchievements = [];
        this.achievementPoints = 0;
    }

    defineAchievements() {
        return {
            iniciacion: [
                { id: 'bienvenido', name: 'Bienvenido', description: 'Completa el tutorial del juego', icon: 'fa-hand-wave', points: 25, condition: (stats) => stats.tutorialCompleted, rarity: 'common' },
                { id: 'primera_partida', name: 'Primer Paso', description: 'Juega tu primera partida', icon: 'fa-baby-carriage', points: 50, condition: (stats) => stats.gamesPlayed >= 1, rarity: 'common' },
                { id: 'primera_respuesta_correcta', name: 'Luz en la Oscuridad', description: 'Responde tu primera pregunta correctamente', icon: 'fa-lightbulb', points: 25, condition: (stats) => stats.totalCorrectAnswers >= 1, rarity: 'common' },
                { id: 'primer_power_up', name: 'Poder Divino', description: 'Usa tu primer power-up', icon: 'fa-bolt', points: 50, condition: (stats) => stats.powerUpsUsed >= 1, rarity: 'common' },
                { id: 'primera_categoria', name: 'Especialista Novato', description: 'Completa tu primera categoría', icon: 'fa-bookmark', points: 75, condition: (stats) => stats.categoriesCompleted >= 1, rarity: 'common' },
                { id: 'primeras_monedas', name: 'Primer Tesoro', description: 'Gana tus primeras 100 monedas', icon: 'fa-coins', points: 50, condition: (stats) => stats.totalCoins >= 100, rarity: 'common' }
            ],
            progreso: [
                { id: 'aprendiz', name: 'Aprendiz Dedicado', description: 'Juega 5 partidas', icon: 'fa-graduation-cap', points: 75, condition: (stats) => stats.gamesPlayed >= 5, rarity: 'common' },
                { id: 'estudiante', name: 'Estudiante Aplicado', description: 'Juega 15 partidas', icon: 'fa-book-open', points: 150, condition: (stats) => stats.gamesPlayed >= 15, rarity: 'uncommon' },
                { id: 'veterano', name: 'Veterano Bíblico', description: 'Juega 50 partidas', icon: 'fa-medal', points: 300, condition: (stats) => stats.gamesPlayed >= 50, rarity: 'uncommon' },
                { id: 'maestro', name: 'Maestro de la Palabra', description: 'Juega 100 partidas', icon: 'fa-crown', points: 500, condition: (stats) => stats.gamesPlayed >= 100, rarity: 'rare' },
                { id: 'respuestas_correctas_50', name: 'Conocedor', description: 'Responde 50 preguntas correctamente', icon: 'fa-check-circle', points: 150, condition: (stats) => stats.totalCorrectAnswers >= 50, rarity: 'uncommon' },
                { id: 'respuestas_correctas_200', name: 'Erudito', description: 'Responde 200 preguntas correctamente', icon: 'fa-brain', points: 400, condition: (stats) => stats.totalCorrectAnswers >= 200, rarity: 'rare' }
            ],
            maestria: [
                { id: 'primera_victoria', name: 'Primera Victoria', description: 'Gana tu primera partida completa', icon: 'fa-trophy', points: 100, condition: (stats) => stats.victories >= 1, rarity: 'common' },
                { id: 'cinco_victorias', name: 'Campeón Emergente', description: 'Gana 5 partidas', icon: 'fa-award', points: 250, condition: (stats) => stats.victories >= 5, rarity: 'uncommon' },
                { id: 'perfeccionista', name: 'Perfección Divina', description: 'Completa una partida sin errores', icon: 'fa-gem', points: 400, condition: (stats) => stats.perfectGames >= 1, rarity: 'rare' },
                { id: 'cinco_perfectas', name: 'Maestro Perfecto', description: 'Completa 5 partidas perfectas', icon: 'fa-diamond', points: 1000, condition: (stats) => stats.perfectGames >= 5, rarity: 'legendary' }
            ],
            rachas: [
                { id: 'racha_respuestas_5', name: 'Inspiración', description: 'Responde 5 preguntas correctas seguidas', icon: 'fa-fire', points: 100, condition: (stats) => stats.maxCorrectStreak >= 5, rarity: 'common' },
                { id: 'racha_respuestas_10', name: 'Momento Brillante', description: 'Responde 10 preguntas correctas seguidas', icon: 'fa-flame', points: 250, condition: (stats) => stats.maxCorrectStreak >= 10, rarity: 'uncommon' },
                { id: 'racha_diaria_3', name: 'Constancia', description: 'Juega 3 días consecutivos', icon: 'fa-calendar-day', points: 150, condition: (stats) => stats.currentStreak >= 3, rarity: 'uncommon' },
                { id: 'racha_diaria_7', name: 'Semana Sagrada', description: 'Juega 7 días consecutivos', icon: 'fa-calendar-week', points: 400, condition: (stats) => stats.currentStreak >= 7, rarity: 'rare' }
            ],
            coleccion: [
                { id: 'collector_basic', name: 'Recolector', description: 'Acumula 500 monedas', icon: 'fa-piggy-bank', points: 100, condition: (stats) => stats.totalCoins >= 500, rarity: 'common' },
                { id: 'collector_advanced', name: 'Tesorero', description: 'Acumula 2,000 monedas', icon: 'fa-treasure-chest', points: 300, condition: (stats) => stats.totalCoins >= 2000, rarity: 'uncommon' },
                { id: 'millonario', name: 'Millonario Bíblico', description: 'Acumula 10,000 monedas', icon: 'fa-crown', points: 1500, condition: (stats) => stats.totalCoins >= 10000, rarity: 'legendary' }
            ]
        };
    }

    init() {
        this.loadAchievementsData();
    }

    loadAchievementsData() {
        const saved = localStorage.getItem('achievementsData');
        if (saved) {
            const data = JSON.parse(saved);
            this.unlockedAchievements = data.unlocked || [];
            this.achievementPoints = data.points || 0;
        }
    }

    saveAchievementsData() {
        localStorage.setItem('achievementsData', JSON.stringify({
            unlocked: this.unlockedAchievements,
            points: this.achievementPoints
        }));
    }

    getAllAchievements() {
        const all = [];
        Object.keys(this.achievements).forEach(category => {
            this.achievements[category].forEach(achievement => {
                all.push({ ...achievement, category });
            });
        });
        return all;
    }

    getAchievementsByCategory(category) {
        return this.achievements[category] || [];
    }

    isUnlocked(achievementId) {
        return this.unlockedAchievements.includes(achievementId);
    }

    unlockAchievement(achievement) {
        if (!this.isUnlocked(achievement.id)) {
            this.unlockedAchievements.push(achievement.id);
            this.achievementPoints += achievement.points;
            this.saveAchievementsData();
            return true;
        }
        return false;
    }

    checkAchievements(stats) {
        const newUnlocks = [];

        this.getAllAchievements().forEach(achievement => {
            if (!this.isUnlocked(achievement.id) && achievement.condition(stats)) {
                if (this.unlockAchievement(achievement)) {
                    newUnlocks.push(achievement);
                }
            }
        });

        return newUnlocks;
    }

    getProgress(achievement, stats) {
        // Determinar progreso basado en el tipo de logro
        if (achievement.id.includes('partida')) {
            const required = this.getRequiredValue(achievement, 'gamesPlayed');
            return { current: stats.gamesPlayed || 0, total: required };
        } else if (achievement.id.includes('victoria')) {
            const required = this.getRequiredValue(achievement, 'victories');
            return { current: stats.victories || 0, total: required };
        } else if (achievement.id.includes('monedas') || achievement.id.includes('millonario') || achievement.id.includes('collector')) {
            const required = this.getRequiredValue(achievement, 'totalCoins');
            return { current: stats.totalCoins || 0, total: required };
        } else if (achievement.id.includes('respuestas')) {
            const required = this.getRequiredValue(achievement, 'totalCorrectAnswers');
            return { current: stats.totalCorrectAnswers || 0, total: required };
        } else if (achievement.id.includes('racha')) {
            const required = this.getRequiredValue(achievement, 'currentStreak') || this.getRequiredValue(achievement, 'maxCorrectStreak');
            return { current: stats.currentStreak || stats.maxCorrectStreak || 0, total: required };
        }

        return { current: 0, total: 1 };
    }

    getRequiredValue(achievement, statName) {
        const conditionStr = achievement.condition.toString();
        const match = conditionStr.match(new RegExp(`${statName}\\s*>=\\s*(\\d+)`));
        return match ? parseInt(match[1]) : 1;
    }

    getTotalAchievements() {
        return this.getAllAchievements().length;
    }

    getUnlockedCount() {
        return this.unlockedAchievements.length;
    }

    getCompletionPercentage() {
        const total = this.getTotalAchievements();
        return total > 0 ? Math.round((this.getUnlockedCount() / total) * 100) : 0;
    }
}

export default new AchievementService();
