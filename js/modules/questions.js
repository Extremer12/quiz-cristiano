/**
 * Módulo para gestionar las preguntas del juego
 */

class QuestionManager {
    constructor() {
        this.questions = [];
        // ✅ CORREGIDO: Solo 4 categorías para coincidir con single-player.js
        this.categories = [
            { id: 'antiguo-testamento', name: 'Antiguo Testamento', icon: 'fa-book', color: '#8E44AD' },
            { id: 'nuevo-testamento', name: 'Nuevo Testamento', icon: 'fa-cross', color: '#3498DB' },
            { id: 'personajes-biblicos', name: 'Personajes Bíblicos', icon: 'fa-user', color: '#E67E22' },
            { id: 'doctrina-cristiana', name: 'Doctrina Cristiana', icon: 'fa-pray', color: '#9B59B6' }
        ];
    }
    
    async init() {
        try {
            // Primero intentar ruta relativa (más común en desarrollo)
            let response = await fetch('./data/questions.json');
            
            if (!response.ok) {
                // Si falla, intentar desde la raíz
                response = await fetch('/data/questions.json');
            }
            
            if (!response.ok) {
                throw new Error(`Error al cargar preguntas: ${response.status}`);
            }
            
            this.questions = await response.json();
            console.log(`✅ Cargadas ${this.questions.length} preguntas`);
            return true;
        } catch (error) {
            console.error('❌ Error al cargar preguntas:', error);
            
            // Fallback con preguntas básicas
            this.questions = this.getFallbackQuestions();
            console.log(`⚠️ Usando ${this.questions.length} preguntas de fallback`);
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
            // Más preguntas de fallback...
        ];
    }
    
    getRandomQuestionsByCategory(category, count = 5) {
        console.log(`Obteniendo ${count} preguntas aleatorias de la categoría: ${category}`);
        
        // Filtrar preguntas por categoría
        const categoryQuestions = this.questions.filter(q => q.category === category);
        console.log(`Encontradas ${categoryQuestions.length} preguntas en la categoría ${category}`);
        
        if (categoryQuestions.length === 0) {
            console.error(`No se encontraron preguntas para la categoría: ${category}`);
            return [];
        }
        
        // Si hay menos preguntas que las solicitadas, devolver todas
        if (categoryQuestions.length <= count) {
            console.log(`Devolviendo todas las ${categoryQuestions.length} preguntas disponibles`);
            return [...categoryQuestions];
        }
        
        // Seleccionar preguntas aleatorias
        const randomQuestions = [];
        const availableQuestions = [...categoryQuestions];
        
        for (let i = 0; i < count && availableQuestions.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableQuestions.length);
            randomQuestions.push(availableQuestions[randomIndex]);
            availableQuestions.splice(randomIndex, 1);
        }
        
        console.log(`Devolviendo ${randomQuestions.length} preguntas aleatorias`);
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