/**
 * Módulo para manejar la mascota Joy del Quiz Cristiano
 */

// Clase para manejar la mascota Joy
class Mascot {
    constructor() {
        this.mascotElement = null;
        this.speechBubble = null;
        this.currentMessageIndex = 0;
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
        this.animationState = 'idle';
        this.bubbleTimeout = null;
    }

    init() {
        // Verificar si estamos en una página que no usa la mascota
        const isSinglePlayerPage = window.location.pathname.includes('single-player.html');
        if (isSinglePlayerPage) {
            console.log('Página de single-player detectada, omitiendo inicialización de mascota');
            return;
        }
        

        
        this.mascotContainer = document.querySelector('.mascot-container');
        this.mascot = document.querySelector('.mascot');
        this.speechBubble = document.querySelector('.speech-bubble');
        this.speechText = document.querySelector('.speech-text');
        
        if (!this.mascotContainer || !this.mascot || !this.speechBubble || !this.speechText) {
            console.log('No se encontraron los elementos de la mascota');
            return;
        }
        
        // Posicionar la burbuja de texto a la derecha
        this.speechBubble.style.left = '100%';
        this.speechBubble.style.right = 'auto';
        this.speechBubble.style.transform = 'translateX(10px)';
        
        // Mejorar la legibilidad del texto
        this.speechText.style.fontSize = '1.2rem';
        this.speechText.style.lineHeight = '1.5';
        this.speechText.style.color = '#333';
        this.speechText.style.fontWeight = '500';
        
        // Agregar evento de clic a la mascota
        this.mascot.addEventListener('click', () => {
            this.showRandomTip();
        });
    }

    showMessage(message, duration = 5000) {
        if (!this.speechBubble || !this.speechText) return;
        
        // Actualizar el texto y mostrar la burbuja
        this.speechText.textContent = message;
        this.speechBubble.style.display = 'block';
        this.speechBubble.style.opacity = '1';
        
        // Ajustar el ancho de la burbuja según el contenido
        const textLength = message.length;
        const minWidth = 200;
        const maxWidth = 350;
        const calculatedWidth = Math.min(maxWidth, Math.max(minWidth, textLength * 8));
        this.speechBubble.style.width = `${calculatedWidth}px`;
        
        // Limpiar el temporizador anterior si existe
        if (this.messageTimer) {
            clearTimeout(this.messageTimer);
        }
        
        // Establecer un nuevo temporizador para ocultar la burbuja
        this.messageTimer = setTimeout(() => {
            this.speechBubble.style.opacity = '0';
            setTimeout(() => {
                this.speechBubble.style.display = 'none';
            }, 300);
        }, duration);
    }
}

// Exportar la clase Mascot
export default Mascot;