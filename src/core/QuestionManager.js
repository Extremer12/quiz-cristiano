/**
 * Módulo para gestionar las preguntas del juego
 */

class QuestionManager {
    constructor() {
        this.questions = [];
        this.categories = [
            { id: 'antiguo-testamento', name: 'Antiguo Testamento', icon: 'fa-book-open', color: '#8B4513' },
            { id: 'nuevo-testamento', name: 'Nuevo Testamento', icon: 'fa-cross', color: '#4169E1' },
            { id: 'personajes-biblicos', name: 'Personajes Bíblicos', icon: 'fa-users', color: '#32CD32' },
            { id: 'doctrina-cristiana', name: 'Doctrina Cristiana', icon: 'fa-pray', color: '#9B59B6' }
        ];
    }

    async init() {
        try {
            // Fetch from public/data
            const response = await fetch('data/questions.json');

            if (!response.ok) {
                throw new Error(`Error al cargar preguntas: ${response.status}`);
            }

            this.questions = await response.json();
            console.log(`✅ Cargadas ${this.questions.length} preguntas`);
            return true;
        } catch (error) {
            console.error('❌ Error al cargar preguntas:', error);
            this.questions = this.getFallbackQuestions();
            return true;
        }
    }

    getFallbackQuestions() {
        return [
            {
                "id": "fallback1",
                "category": "antiguo-testamento",
                "text": "¿Quién construyó el arca?",
                "options": ["Noé", "Abraham", "Moisés", "David"],
                "correctIndex": 0,
                "difficulty": "fácil",
                "reference": "Génesis 6:14"
            },
            {
                "id": "fallback_nt1",
                "category": "nuevo-testamento",
                "text": "¿Dónde nació Jesús?",
                "options": ["Nazaret", "Belén", "Jerusalén", "Galilea"],
                "correctIndex": 1,
                "difficulty": "fácil",
                "reference": "Lucas 2:4"
            },
            {
                "id": "fallback_pb1",
                "category": "personajes-biblicos",
                "text": "¿Quién mató a Goliat?",
                "options": ["Saúl", "David", "Samuel", "Jonatán"],
                "correctIndex": 1,
                "difficulty": "fácil",
                "reference": "1 Samuel 17"
            },
            {
                "id": "fallback_dc1",
                "category": "doctrina-cristiana",
                "text": "¿Qué es la fe?",
                "options": ["Creer en lo que se ve", "Certeza de lo que se espera", "Un sentimiento", "Una tradición"],
                "correctIndex": 1,
                "difficulty": "fácil",
                "reference": "Hebreos 11:1"
            }
        ];
    }

    getRandomQuestionsByCategory(category, count = 5) {
        const categoryQuestions = this.questions.filter(q => q.category === category);

        if (categoryQuestions.length === 0) return [];
        if (categoryQuestions.length <= count) return [...categoryQuestions];

        const randomQuestions = [];
        const availableQuestions = [...categoryQuestions];

        for (let i = 0; i < count && availableQuestions.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableQuestions.length);
            randomQuestions.push(availableQuestions[randomIndex]);
            availableQuestions.splice(randomIndex, 1);
        }

        return randomQuestions;
    }

    shuffleArray(array) {
        // Algoritmo Fisher-Yates para mezclar un array
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    getQuestionById(id) {
        return this.questions.find(q => q.id === id);
    }

    getQuestionsByDifficulty(difficulty) {
        return this.questions.filter(q => q.difficulty === difficulty);
    }
}

export default QuestionManager;