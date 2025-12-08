/**
 * Componente de Efectos Visuales
 * Maneja partículas, versículo del día y contadores.
 */

class UIEffects {
    constructor() {
        this.verses = [
            {
                text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.",
                reference: "Juan 3:16"
            },
            {
                text: "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.",
                reference: "Josué 1:9"
            },
            {
                text: "Todo lo puedo en Cristo que me fortalece.",
                reference: "Filipenses 4:13"
            },
            {
                text: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.",
                reference: "Proverbios 3:5-6"
            },
            {
                text: "El ladrón no viene sino para hurtar y matar y destruir; yo he venido para que tengan vida, y para que la tengan en abundancia.",
                reference: "Juan 10:10"
            }
        ];
        this.particleInterval = null;
    }

    init() {
        this.particlesContainer = document.querySelector('.particles-container');
        this.verseRefreshBtn = document.querySelector('.verse-refresh');
        this.verseText = document.querySelector('.verse-text');
        this.verseReference = document.querySelector('.verse-reference');

        // Inicializar versículo si existen los elementos
        if (this.verseRefreshBtn && this.verseText && this.verseReference) {
            this.verseRefreshBtn.addEventListener('click', () => this.changeVerse());
            this.changeVerse(); // Mostrar uno al inicio
        }

        // Inicializar partículas si existe el contenedor
        if (this.particlesContainer) {
            this.startParticleEffect();
        }

        // Inicializar contador si existen los elementos
        if (document.querySelector('.countdown-days')) {
            this.updateCountdown();
            setInterval(() => this.updateCountdown(), 60000);
        }

        console.log('✨ UIEffects inicializado');
    }

    startParticleEffect() {
        if (this.particleInterval) clearInterval(this.particleInterval);

        this.particleInterval = setInterval(() => {
            if (document.hidden) return; // No animar si la pestaña no está visible
            this.createParticle();
        }, 300);
    }

    createParticle() {
        if (!this.particlesContainer) return;

        const particle = document.createElement('div');
        particle.classList.add('particle');

        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        const size = Math.random() * 5 + 2;

        const colors = ['rgba(255, 215, 0, 0.8)', 'rgba(75, 156, 211, 0.8)', 'rgba(255, 255, 255, 0.8)'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.style.cssText = `
            position: absolute;
            left: ${posX}px;
            top: ${posY}px;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            opacity: 0;
            animation: particleFade 3s ease-in-out forwards;
        `;

        this.particlesContainer.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode === this.particlesContainer) {
                this.particlesContainer.removeChild(particle);
            }
        }, 3000);
    }

    changeVerse() {
        if (!this.verseText || !this.verseReference) return;

        const randomIndex = Math.floor(Math.random() * this.verses.length);
        const verse = this.verses[randomIndex];

        this.verseText.style.opacity = 0;
        this.verseReference.style.opacity = 0;

        setTimeout(() => {
            this.verseText.textContent = `"${verse.text}"`;
            this.verseReference.textContent = verse.reference;

            this.verseText.style.opacity = 1;
            this.verseReference.style.opacity = 1;
        }, 300);
    }

    updateCountdown() {
        const daysElement = document.querySelector('.countdown-days');
        const hoursElement = document.querySelector('.countdown-hours');
        const minutesElement = document.querySelector('.countdown-minutes');

        if (!daysElement || !hoursElement || !minutesElement) return;

        const now = new Date();
        const nextSunday = new Date();
        nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
        nextSunday.setHours(10, 0, 0, 0);

        if (nextSunday < now) {
            nextSunday.setDate(nextSunday.getDate() + 7);
        }

        const diff = nextSunday - now;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        daysElement.textContent = days;
        hoursElement.textContent = hours;
        minutesElement.textContent = minutes;
    }
}

// Agregar estilos de animación dinámicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFade {
        0% { opacity: 0; transform: translateY(0) scale(0); }
        50% { opacity: 1; transform: translateY(-20px) scale(1); }
        100% { opacity: 0; transform: translateY(-40px) scale(0); }
    }
`;
document.head.appendChild(style);

export default new UIEffects();
