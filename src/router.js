/**
 * Router Simple para SPA
 */

const routes = {
    '/': () => import('./pages/Home.js'),
    '/store': () => import('./pages/Store.js'),
    '/ranking': () => import('./pages/Ranking.js'),
    '/perfil': () => import('./pages/Perfil.js'),
    '/logros': () => import('./pages/Logros.js'),
    '/single-player': () => import('./pages/SinglePlayer.js'),
    '/mini-juego': () => import('./pages/MiniJuego.js')
};

export class Router {
    constructor(appElement) {
        this.app = appElement;
        this.currentPage = null;

        // Listen to popstate (back/forward buttons)
        window.addEventListener('popstate', () => this.loadRoute());

        // Intercept link clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigate(e.target.getAttribute('href'));
            }
        });

        // Load initial route
        this.loadRoute();
    }

    navigate(path) {
        window.history.pushState({}, '', path);
        this.loadRoute();
    }

    async loadRoute() {
        const path = window.location.pathname;
        const route = routes[path] || routes['/'];

        try {
            const module = await route();
            const Page = module.default;

            if (this.currentPage && this.currentPage.destroy) {
                this.currentPage.destroy();
            }

            this.currentPage = new Page();
            this.app.innerHTML = this.currentPage.render();

            if (this.currentPage.init) {
                this.currentPage.init();
            }
        } catch (error) {
            console.error('Error loading route:', error);
            this.app.innerHTML = '<h1>Error 404 - Página no encontrada</h1>';
        }
    }
}
