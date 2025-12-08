/**
 * Componente Mascota (Joy)
 * Maneja la interacción con la mascota y sus mensajes.
 */

class Mascot {
    constructor() {
        this.messages = [
            "¡Hola! Soy Joy, tu guía en este viaje bíblico.",
            "¿Sabías que la Biblia tiene 66 libros?",
            "¡Aprende sobre los libros y los versículos!",
            "¡Diviértete mientras aprendes!",
            "¡Vamos a aprender juntos!",
            "¡Juega y gana puntos para canjear por premios!",
            "Los torneos dominicales son una gran oportunidad para demostrar tus conocimientos.",
            "¡Diviértete mientras aprendes sobre la Palabra de Dios!"
        ];
        this.bubbleTimeout = null;
    }

    init() {
        this.mascotContainer = document.querySelector('.mascot-container');
        this.speechBubble = document.getElementById('speech-bubble');
        this.speechText = document.querySelector('.speech-text');

        if (!this.mascotContainer || !this.speechBubble || !this.speechText) {
            console.warn('Elementos de mascota no encontrados');
            return;
        }

        // Event listener para click en la mascota
        this.mascotContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showRandomTip();
        });

        // Event listener para cerrar al hacer click fuera (opcional, ya manejado por UI global)
        document.addEventListener('click', (e) => {
            if (!this.mascotContainer.contains(e.target) && !this.speechBubble.contains(e.target)) {
                this.hideBubble();
            }
        });

        console.log('🐶 Mascota Joy inicializada');
    }

    showRandomTip() {
        const randomIndex = Math.floor(Math.random() * this.messages.length);
        this.showMessage(this.messages[randomIndex]);
    }

    showMessage(message, duration = 5000) {
        if (!this.speechBubble || !this.speechText) return;

        this.speechText.textContent = message;
        this.speechBubble.classList.add('show');

        // Reiniciar timer
        if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);

        if (duration > 0) {
            this.bubbleTimeout = setTimeout(() => {
                this.hideBubble();
            }, duration);
        }
    }

    hideBubble() {
        if (this.speechBubble) {
            this.speechBubble.classList.remove('show');
        }
    }
}

export default new Mascot();
