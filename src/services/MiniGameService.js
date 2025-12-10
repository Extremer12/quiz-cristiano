/**
 * Servicio de Mini-Juego Joy
 * Maneja la lógica del juego, estado y persistencia
 */

import GameDataService from './GameDataService.js';

class MiniGameService {
    constructor() {
        this.config = {
            studyTimeMinimum: 30,
            repechageTime: 30,
            coinRewards: {
                studyComplete: 50,
                questionCorrect: 25,
                repechageSuccess: 75,
                levelUp: 100,
                streakBonus: 20
            },
            levelUpRequirement: 3,
            maxStreak: 365
        };

        this.studyVerses = [
            {
                reference: "Juan 3:16",
                text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
                question: {
                    text: "Según este versículo, ¿qué nos muestra el amor de Dios?",
                    options: ["Su generosidad al dar a su Hijo", "Su poder sobre todas las cosas", "Su sabiduría infinita", "Su justicia perfecta"],
                    correctIndex: 0
                }
            },
            {
                reference: "Salmos 23:1",
                text: "Jehová es mi pastor; nada me faltará.",
                question: {
                    text: "¿Qué nos asegura este versículo cuando Dios es nuestro pastor?",
                    options: ["Que seremos ricos", "Que nada nos faltará", "Que no tendremos problemas", "Que siempre estaremos felices"],
                    correctIndex: 1
                }
            },
            {
                reference: "Filipenses 4:13",
                text: "Todo lo puedo en Cristo que me fortalece.",
                question: {
                    text: "¿Cuál es la fuente de nuestra fortaleza según Pablo?",
                    options: ["Nuestro esfuerzo personal", "La ayuda de otros", "Cristo que nos fortalece", "Nuestra experiencia"],
                    correctIndex: 2
                }
            },
            {
                reference: "Proverbios 3:5-6",
                text: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.",
                question: {
                    text: "¿En qué debemos apoyarnos según este proverbio?",
                    options: ["En nuestra propia prudencia", "En Jehová de todo corazón", "En la experiencia de otros", "En nuestros conocimientos"],
                    correctIndex: 1
                }
            },
            {
                reference: "Romanos 8:28",
                text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.",
                question: {
                    text: "¿A quiénes les ayudan todas las cosas a bien?",
                    options: ["A todos sin excepción", "A los que aman a Dios", "A los que trabajan duro", "A los que son buenos"],
                    correctIndex: 1
                }
            },
            {
                reference: "Mateo 11:28",
                text: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.",
                question: {
                    text: "¿A quiénes invita Jesús a venir a él?",
                    options: ["Solo a los perfectos", "A los trabajados y cargados", "Solo a los pecadores", "A los que no tienen problemas"],
                    correctIndex: 1
                }
            }
        ];

        this.outfits = [
            { id: 'original', name: 'Joy Original', src: 'assets/images/mascota.png', unlocked: true, unlockCondition: null },
            { id: 'festejo', name: 'Joy Festejo', src: 'assets/images/joy-festejo.png', unlocked: true, unlockCondition: null },
            { id: 'consolando', name: 'Joy Consolando', src: 'assets/images/joy-consolando.png', unlocked: true, unlockCondition: null },
            { id: 'trofeo', name: 'Joy Trofeo', src: 'assets/images/joy-trofeo.png', unlocked: true, unlockCondition: null },
            { id: 'joy_corona', name: 'Joy Corona', src: 'assets/images/joy-corona.png', unlocked: false, unlockCondition: 'Nivel 10' }
        ];

        this.state = {
            joyLevel: 1,
            joyExperience: 0,
            currentOutfit: 'original',
            studyStreak: 0,
            totalStudies: 0,
            lastStudyDate: null,
            unlockedOutfits: ['original', 'festejo', 'consolando', 'trofeo']
        };
    }

    init() {
        this.loadData();
    }

    loadData() {
        const saved = localStorage.getItem('joy-mini-game-data');
        if (saved) {
            const data = JSON.parse(saved);
            this.state = { ...this.state, ...data };
            this.checkStreakContinuity();
        }

        // Cargar outfits desbloqueados extra si existen
        const savedOutfits = localStorage.getItem('joy-unlocked-outfits');
        if (savedOutfits) {
            const outfits = JSON.parse(savedOutfits);
            this.state.unlockedOutfits = [...new Set([...this.state.unlockedOutfits, ...outfits])];
        }
    }

    saveData() {
        localStorage.setItem('joy-mini-game-data', JSON.stringify({
            joyLevel: this.state.joyLevel,
            joyExperience: this.state.joyExperience,
            currentOutfit: this.state.currentOutfit,
            studyStreak: this.state.studyStreak,
            totalStudies: this.state.totalStudies,
            lastStudyDate: this.state.lastStudyDate,
            unlockedOutfits: this.state.unlockedOutfits
        }));

        // Mantener compatibilidad con legacy por si acaso
        localStorage.setItem('joy-unlocked-outfits', JSON.stringify(this.state.unlockedOutfits));
    }

    checkStreakContinuity() {
        if (!this.state.lastStudyDate) return;

        const lastStudy = new Date(this.state.lastStudyDate);
        const today = new Date();
        const daysDifference = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));

        if (daysDifference > 1) {
            this.state.studyStreak = 0;
            this.saveData();
        }
    }

    getRandomVerse() {
        return this.studyVerses[Math.floor(Math.random() * this.studyVerses.length)];
    }

    getRandomMessage() {
        const messages = [
            "¡Hola! ¿Listos para estudiar juntos?",
            "La Palabra de Dios es una lámpara para nuestros pies",
            "¡Cada día es una nueva oportunidad para crecer en fe!",
            "¿Sabías que estudiar la Biblia me hace muy feliz?",
            "¡Qué bueno verte de nuevo! ¿Empezamos?",
            "Recuerda: 'Lámpara es a mis pies tu palabra'",
            "¡Tu constancia en el estudio me llena de alegría!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    canStudyToday() {
        if (!this.state.lastStudyDate) return true;
        const today = new Date().toDateString();
        const lastStudy = new Date(this.state.lastStudyDate).toDateString();
        return today !== lastStudy;
    }

    completeStudy(isCorrect) {
        let coinsEarned = this.config.coinRewards.studyComplete;
        let leveledUp = false;
        let newOutfit = null;

        // Actualizar racha si es un nuevo día
        if (this.canStudyToday()) {
            this.state.studyStreak++;
            this.state.totalStudies++;
            this.state.lastStudyDate = new Date().toISOString();
        }

        if (isCorrect) {
            coinsEarned += this.config.coinRewards.questionCorrect;
        }

        // Bonus por racha
        if (this.state.studyStreak >= 7) {
            coinsEarned += this.config.coinRewards.streakBonus;
        }

        // Verificar nivel
        const requiredStudies = this.state.joyLevel * this.config.levelUpRequirement;
        if (this.state.totalStudies >= requiredStudies) {
            this.state.joyLevel++;
            this.state.joyExperience = 0;
            coinsEarned += this.config.coinRewards.levelUp;
            leveledUp = true;

            // Verificar desbloqueo de corona
            if (this.state.joyLevel >= 10 && !this.state.unlockedOutfits.includes('corona')) {
                this.state.unlockedOutfits.push('corona');
                newOutfit = 'Joy Corona';
            }
        }



        this.saveData();
        GameDataService.addCoins(coinsEarned, 'joy_study');

        return {
            coinsEarned,
            leveledUp,
            newLevel: this.state.joyLevel,
            newStreak: this.state.studyStreak,
            newOutfit
        };
    }

    getOutfits() {
        return this.outfits.map(outfit => ({
            ...outfit,
            unlocked: this.state.unlockedOutfits.includes(outfit.id)
        }));
    }

    setOutfit(outfitId) {
        if (this.state.unlockedOutfits.includes(outfitId)) {
            this.state.currentOutfit = outfitId;
            this.saveData();
            return true;
        }
        return false;
    }

    getCurrentOutfitSrc() {
        const outfit = this.outfits.find(o => o.id === this.state.currentOutfit);
        return outfit ? outfit.src : 'assets/images/mascota.png';
    }
}

export default new MiniGameService();
