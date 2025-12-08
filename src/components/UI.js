/**
 * UI Manager
 * Centraliza la manipulación del DOM y la gestión de pantallas
 */

class UI {
    constructor() {
        this.elements = {
            coinsDisplay: document.querySelectorAll('.coins-count, .user-coins, #user-coins, #player-coins'),
            screens: document.querySelectorAll('.screen, .game-area, .main-menu'),
            loadingOverlay: document.getElementById('loading-overlay'),
            // Añadir más elementos según sea necesario
        };
    }

    /**
     * Actualiza el contador de monedas en toda la interfaz
     * @param {number} amount - Cantidad actual de monedas
     */
    updateCoins(amount) {
        this.elements.coinsDisplay.forEach(element => {
            if (element) {
                element.textContent = amount;
            }
        });
    }

    /**
     * Muestra una pantalla específica y oculta las demás
     * @param {string} screenId - ID o selector de la pantalla a mostrar
     */
    showScreen(screenSelector) {
        // Ocultar todas las pantallas conocidas
        this.elements.screens.forEach(screen => {
            screen.classList.add('hidden');
            screen.style.display = 'none';
        });

        // Mostrar la pantalla solicitada
        const targetScreen = document.querySelector(screenSelector);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            targetScreen.style.display = 'block'; // O flex/grid según corresponda, pero block es seguro por defecto
        } else {
            console.warn(`Pantalla no encontrada: ${screenSelector}`);
        }
    }

    /**
     * Muestra u oculta el overlay de carga
     * @param {boolean} show 
     */
    toggleLoading(show) {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Muestra una notificación (toast)
     * @param {string} message 
     * @param {string} type - 'success', 'error', 'info'
     */
    showToast(message, type = 'info') {
        // Implementación básica de toast si no existe un sistema
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Estilos básicos inline para asegurar visibilidad si no hay CSS
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            borderRadius: '5px',
            backgroundColor: type === 'error' ? '#ff4444' : '#33b5e5',
            color: 'white',
            zIndex: '10000',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    toggleMenu() {
        const dropdownMenu = document.getElementById("dropdown-menu");
        const menuOverlay = document.getElementById("menu-overlay");

        if (dropdownMenu && menuOverlay) {
            dropdownMenu.classList.toggle("show");
            menuOverlay.classList.toggle("show");
        }
    }

    toggleSpeech() {
        const speechBubble = document.getElementById("speech-bubble");
        if (speechBubble) {
            speechBubble.classList.toggle("show");
            if (speechBubble.classList.contains('show')) {
                setTimeout(() => {
                    speechBubble.classList.remove('show');
                }, 5000);
            }
        }
    }

    initGlobalEvents() {
        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            const dropdownMenu = document.getElementById('dropdown-menu');
            const menuOverlay = document.getElementById('menu-overlay');

            // Si se hace clic en un item del menú (que no tenga su propio handler que prevenga esto)
            if (e.target.closest('.dropdown-item') && !e.target.closest('.dropdown-item').onclick) {
                setTimeout(() => {
                    if (dropdownMenu) dropdownMenu.classList.remove('show');
                    if (menuOverlay) menuOverlay.classList.remove('show');
                }, 100);
            }

            // Si se hace clic fuera del menú y no es el botón de toggle
            if (!e.target.closest('.dropdown-menu') && !e.target.closest('.menu-toggle') && !e.target.closest('.dropdown-close')) {
                if (dropdownMenu && dropdownMenu.classList.contains('show')) {
                    dropdownMenu.classList.remove('show');
                    if (menuOverlay) menuOverlay.classList.remove('show');
                }
            }
        });
    }
}

export default new UI();
