/**
 * Archivo de configuración global para el Quiz Cristiano
 */

const CONFIG = {
    // Configuración general
    appName: 'Quiz Cristiano',
    version: '1.0.0',
    
    // Configuración de la mascota
    mascot: {
        name: 'Joy',
        defaultAnimation: 'float',
        speechDuration: 8000, // Duración en ms que se muestra el mensaje
        animations: {
            float: {
                duration: 3000,
                timing: 'ease-in-out',
                iterations: 'infinite'
            },
            bounce: {
                duration: 1000,
                timing: 'ease',
                iterations: 1
            }
        }
    },
    
    // Otras configuraciones...
    game: {
        // Configuración del juego
    },
    
    tournament: {
        // Configuración del torneo
    },
    
    rewards: {
        // Configuración de recompensas
    }
};

// Export removed for browser compatibility
// export default CONFIG;

// Make CONFIG available globally
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}