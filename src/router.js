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

        // Prefetch other routes for instant navigation
        setTimeout(() => {
            this.prefetchRoutes();
        }, 2000); // Wait 2s to prioritize initial render
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

            // View Transition API
            if (document.startViewTransition) {
                document.startViewTransition(() => {
                    this._renderPage(Page);
                });
            } else {
                // Fallback
                this._renderPage(Page);
            }

        } catch (error) {
            console.error('Error loading route:', error);
            this.app.innerHTML = '<h1>Error 404 - Página no encontrada</h1>';
        }
    }

    _renderPage(Page) {
        this.currentPage = new Page();
        this.app.innerHTML = this.currentPage.render();

        // Reinicializar Lazy Loading después del render
        if (window.LazyImage) { // Check global or re-import
            // Dynamic import might be needed if LazyImage isn't global
            import('./utils/LazyImage.js').then(m => m.LazyImage.init());
        }

        if (this.currentPage.init) {
            this.currentPage.init();
        }

        // Update active state in bottom nav
        this._updateActiveNav();
    }

    _updateActiveNav() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-item').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === currentPath);
        });
    }

    prefetchRoutes() {
        const paths = Object.keys(routes);
        paths.forEach(path => {
            if (path !== window.location.pathname) {
                routes[path](); // Trigger import
            }
        });
    }
}
