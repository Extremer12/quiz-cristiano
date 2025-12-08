/**
 * Servicio para manejar el tema de la aplicación (Claro/Oscuro)
 */
class ThemeService {
    constructor() {
        this.themeKey = 'quiz-cristiano-theme';
        this.currentTheme = localStorage.getItem(this.themeKey) || 'light';
        this.init();
    }

    init() {
        // Aplicar tema guardado al inicio
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateIcon();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem(this.themeKey, this.currentTheme);

        // Disparar evento personalizado
        const event = new CustomEvent('themeChanged', { detail: { theme: this.currentTheme } });
        window.dispatchEvent(event);

        this.updateIcon();
    }

    updateIcon() {
        const themeIcon = document.getElementById('theme-icon');
        const themeText = document.getElementById('theme-text');

        if (themeIcon && themeText) {
            if (this.currentTheme === 'dark') {
                themeIcon.className = 'fas fa-sun';
                themeText.textContent = 'Modo Claro';
            } else {
                themeIcon.className = 'fas fa-moon';
                themeText.textContent = 'Modo Oscuro';
            }
        }
    }
}

export default new ThemeService();
