/**
 * ================================================
 * DARK MODE CONTROLLER - CONTROLADOR DE MODO OSCURO
 * Quiz Cristiano - Sistema de temas profesional
 * ================================================
 */

class DarkModeController {
    constructor() {
        this.STORAGE_KEY = 'quiz-cristiano-theme';
        this.currentTheme = 'light';
        this.button = null;
        
        // Detectar preferencia del sistema
        this.systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        
        console.log('🌙 Dark Mode Controller inicializado');
    }

    init() {
        this.loadTheme();
        this.createToggleButton();
        this.bindEvents();
        this.applyTheme();
        
        // Escuchar cambios en preferencia del sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.applyTheme();
            }
        });
        
        console.log(`✅ Tema ${this.currentTheme} aplicado`);
    }

    loadTheme() {
        // Cargar tema guardado o usar preferencia del sistema
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        this.currentTheme = savedTheme || this.systemPreference;
        
        console.log(`📱 Tema cargado: ${this.currentTheme}`);
    }

    createToggleButton() {
        // Verificar si ya existe el botón
        if (document.querySelector('.theme-toggle')) return;

        this.button = document.createElement('button');
        this.button.className = 'theme-toggle';
        this.button.setAttribute('title', 'Cambiar tema');
        this.button.setAttribute('aria-label', 'Alternar modo oscuro');
        
        this.button.innerHTML = `
            <i class="fas fa-sun light-icon"></i>
            <i class="fas fa-moon dark-icon"></i>
        `;
        
        document.body.appendChild(this.button);
    }

    bindEvents() {
        if (this.button) {
            this.button.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Atajo de teclado: Ctrl + Shift + D
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggleTheme();
                this.showThemeNotification();
            }
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveTheme();
        
        console.log(`🔄 Tema cambiado a: ${this.currentTheme}`);
        
        // Feedback visual
        this.animateToggle();
        
        // Analytics (si está disponible)
        if (window.gtag) {
            gtag('event', 'theme_change', {
                'theme': this.currentTheme
            });
        }
    }

    applyTheme() {
        // Aplicar el atributo data-theme al documento
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Actualizar meta theme-color para PWA
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = this.currentTheme === 'dark' ? '#000000' : '#ffd700';
        }
        
        // Precargar imagen de fondo para transición suave
        this.preloadBackgroundImage();
        
        // Notificar a otros módulos del cambio
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: this.currentTheme } 
        }));
    }

    preloadBackgroundImage() {
        const imagePath = this.currentTheme === 'dark' 
            ? './assets/images/fondo-black.png' 
            : './assets/images/fondo.png';
            
        const img = new Image();
        img.onload = () => {
            console.log(`✅ Imagen de fondo ${this.currentTheme} precargada`);
        };
        img.onerror = () => {
            console.warn(`⚠️ Error precargando imagen: ${imagePath}`);
        };
        img.src = imagePath;
    }

    saveTheme() {
        localStorage.setItem(this.STORAGE_KEY, this.currentTheme);
    }

    animateToggle() {
        if (!this.button) return;

        // Animación de rotación
        this.button.style.transform = 'scale(0.8) rotate(180deg)';
        
        setTimeout(() => {
            this.button.style.transform = 'scale(1) rotate(0deg)';
        }, 150);
    }

    showThemeNotification() {
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.innerHTML = `
            <div class="theme-notification-content">
                <i class="fas ${this.currentTheme === 'dark' ? 'fa-moon' : 'fa-sun'}"></i>
                <span>Modo ${this.currentTheme === 'dark' ? 'Oscuro' : 'Claro'} activado</span>
            </div>
        `;
        
        // Estilos inline para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--surface-primary);
            backdrop-filter: var(--backdrop-blur);
            border: 1px solid var(--border-primary);
            border-radius: 15px;
            padding: 15px 20px;
            z-index: 2000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: var(--shadow-primary);
        `;
        
        const content = notification.querySelector('.theme-notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--text-primary);
            font-weight: 600;
        `;
        
        document.body.appendChild(notification);
        
        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 2 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Método público para obtener el tema actual
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Método público para forzar un tema específico
    setTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme;
            this.applyTheme();
            this.saveTheme();
        }
    }

    // Método para detectar si está en modo oscuro
    isDarkMode() {
        return this.currentTheme === 'dark';
    }
}

// Crear instancia global
const darkModeController = new DarkModeController();

// Inicializar automáticamente cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        darkModeController.init();
    });
} else {
    darkModeController.init();
}

// Exportar para uso en otros módulos
window.DarkModeController = darkModeController;

console.log('✅ Dark Mode System cargado');