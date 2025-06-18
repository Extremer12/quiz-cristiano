/**
 * ================================================
 * QUIZ CRISTIANO - APP PRINCIPAL SIMPLIFICADO
 * Solo funcionalidades esenciales
 * ================================================
 */

class QuizCristianoApp {
    constructor() {
        this.version = '1.0.0';
        this.gameData = { coins: 0, achievements: [], stats: {} };
        
        console.log(`🎮 Quiz Cristiano App v${this.version} - Versión Simplificada`);
    }

    async init() {
        try {
            // 1. Aplicar tema inmediatamente
            await this.initDarkMode();
            
            // 2. Cargar datos del usuario
            this.loadUserData();
            
            // 3. Configurar eventos básicos
            this.bindEvents();
            
            // 4. Actualizar UI
            this.updateUI();
            
            console.log('✅ Quiz Cristiano App inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando la aplicación:', error);
        }
    }

    async initDarkMode() {
        // Aplicar tema inmediatamente
        const savedTheme = localStorage.getItem('quiz-cristiano-theme');
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = savedTheme || systemPreference;
        
        document.documentElement.setAttribute('data-theme', theme);
        
        // Actualizar meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = theme === 'dark' ? '#000000' : '#ffd700';
        }
        
        console.log(`🌙 Tema aplicado: ${theme}`);
    }

    loadUserData() {
        try {
            const savedData = localStorage.getItem('quizCristianoData');
            if (savedData) {
                this.gameData = { ...this.gameData, ...JSON.parse(savedData) };
            }
            console.log('💾 Datos del usuario cargados');
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
        }
    }

    bindEvents() {
        // Eventos de tema
        window.addEventListener('themeChanged', (e) => {
            console.log(`🎨 Tema cambiado a: ${e.detail.theme}`);
        });
        
        // Eventos de conexión
        window.addEventListener('online', () => {
            console.log('🌐 Conectado');
        });
        
        window.addEventListener('offline', () => {
            console.log('🌐 Desconectado');
        });
        
        console.log('⌨️ Eventos configurados');
    }

    updateUI() {
        this.updateCoinsDisplay();
    }

    updateCoinsDisplay() {
        const coinsElements = document.querySelectorAll('.coins-count, .user-coins, #user-coins, #player-coins');
        coinsElements.forEach(element => {
            if (element) {
                element.textContent = this.gameData.coins || 0;
            }
        });
    }

    saveGameData() {
        try {
            localStorage.setItem('quizCristianoData', JSON.stringify(this.gameData));
            console.log('💾 Datos guardados');
        } catch (error) {
            console.error('❌ Error guardando datos:', error);
        }
    }

    // Métodos públicos para otras páginas
    addCoins(amount) {
        this.gameData.coins += amount;
        this.updateCoinsDisplay();
        this.saveGameData();
        console.log(`💰 +${amount} monedas`);
    }

    spendCoins(amount) {
        if (this.gameData.coins >= amount) {
            this.gameData.coins -= amount;
            this.updateCoinsDisplay();
            this.saveGameData();
            return true;
        }
        return false;
    }
}

// ============================================
// INICIALIZACIÓN GLOBAL
// ============================================

// Crear instancia global
window.QuizApp = new QuizCristianoApp();

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.QuizApp.init();
    });
} else {
    window.QuizApp.init();
}

// Exportar para módulos ES6
export default window.QuizApp;

console.log('✅ App.js Simplificado cargado');