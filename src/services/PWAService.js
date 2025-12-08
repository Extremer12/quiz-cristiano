/**
 * Servicio para manejar la instalación de la PWA
 */
class PWAService {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevenir que Chrome muestre el prompt automáticamente
            e.preventDefault();
            // Guardar el evento para usarlo después
            this.deferredPrompt = e;
            console.log('💾 PWA install prompt disponible');
        });
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const choiceResult = await this.deferredPrompt.userChoice;

            if (choiceResult.outcome === 'accepted') {
                console.log('✅ Usuario aceptó instalar la PWA');
            } else {
                console.log('❌ Usuario rechazó instalar la PWA');
            }

            this.deferredPrompt = null;
        } else {
            alert('Para instalar la app, usa la opción "Instalar" o "Agregar a inicio" de tu navegador.');
        }
    }
}

export default new PWAService();
