/**
 * Módulo para manejar efectos visuales de la interfaz
 */

class UIEffects {
    constructor() {
        this.particlesContainer = null;
        this.verseRefreshBtn = null;
        this.verseText = null;
        this.verseReference = null;
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
    }

    init() {
        // Inicializar contenedor de partículas
        this.particlesContainer = document.querySelector('.particles-container');
        
        // Inicializar versículo del día
        this.verseRefreshBtn = document.querySelector('.verse-refresh');
        this.verseText = document.querySelector('.verse-text');
        this.verseReference = document.querySelector('.verse-reference');
        
        if (this.verseRefreshBtn) {
            this.verseRefreshBtn.addEventListener('click', () => this.changeVerse());
        }
        
        // Iniciar efectos
        this.startParticleEffect();
        this.updateCountdown();
        
        // Actualizar el contador cada minuto
        setInterval(() => this.updateCountdown(), 60000);
    }
    
    // Generar partículas brillantes
    startParticleEffect() {
        setInterval(() => {
            if (this.particlesContainer) {
                this.createParticle();
            }
        }, 300);
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Posición aleatoria
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        
        // Tamaño aleatorio
        const size = Math.random() * 5 + 2;
        
        // Color aleatorio (dorado, azul celestial o blanco)
        const colors = ['rgba(255, 215, 0, 0.8)', 'rgba(75, 156, 211, 0.8)', 'rgba(255, 255, 255, 0.8)'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Aplicar estilos
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = color;
        
        // Añadir al contenedor
        this.particlesContainer.appendChild(particle);
        
        // Eliminar después de la animación
        setTimeout(() => {
            if (particle.parentNode === this.particlesContainer) {
                this.particlesContainer.removeChild(particle);
            }
        }, 3000);
    }
    
    // Cambiar versículo
    changeVerse() {
        if (!this.verseText || !this.verseReference) return;
        
        const randomIndex = Math.floor(Math.random() * this.verses.length);
        const verse = this.verses[randomIndex];
        
        // Aplicar efecto de desvanecimiento
        this.verseText.style.opacity = 0;
        this.verseReference.style.opacity = 0;
        
        setTimeout(() => {
            this.verseText.textContent = `"${verse.text}"`;
            this.verseReference.textContent = verse.reference;
            
            this.verseText.style.opacity = 1;
            this.verseReference.style.opacity = 1;
        }, 300);
    }
    
    // Actualizar contador regresivo
    updateCountdown() {
        const daysElement = document.querySelector('.countdown-days');
        const hoursElement = document.querySelector('.countdown-hours');
        const minutesElement = document.querySelector('.countdown-minutes');
        
        if (!daysElement || !hoursElement || !minutesElement) return;
        
        // Obtener el próximo domingo
        const now = new Date();
        const nextSunday = new Date();
        nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
        nextSunday.setHours(10, 0, 0, 0); // 10:00 AM
        
        // Calcular diferencia
        const diff = nextSunday - now;
        
        // Convertir a días, horas, minutos
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        // Actualizar elementos
        daysElement.textContent = days;
        hoursElement.textContent = hours;
        minutesElement.textContent = minutes;
    }
}

export default UIEffects;