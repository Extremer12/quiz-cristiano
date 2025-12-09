/**
 * Punto de entrada principal de la aplicación
 */

import QuizCristianoApp from './core/App.js';
import AuthService from './services/AuthService.js';
import UI from './components/UI.js';
import ThemeService from './services/ThemeService.js';
import PWAService from './services/PWAService.js';
import AdsService from './services/AdsService.js';
import FirebaseService from './services/FirebaseService.js';
import GameDataService from './services/GameDataService.js';
import Mascot from './components/Mascot.js';
import UIEffects from './components/UIEffects.js';
import Store from './components/Store.js';
import Ranking from './components/Ranking.js';
import Achievements from './components/Achievements.js';
import Profile from './components/Profile.js';
import MiniGame from './components/MiniGame.js';
import './utils/LegacyCompat.js'; // Compatibility layer for legacy code

// Inicializar autenticación antes que nada
AuthService.checkAuth();

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Quiz Cristiano...');

    // 1. Ejecutar migración de datos si es necesaria
    try {
        const { default: DataMigration } = await import('./utils/DataMigration.js');
        const migration = new DataMigration();
        const result = migration.migrate();

        if (result.migrated) {
            console.log('✅ Datos legacy migrados al nuevo formato');
        }
    } catch (error) {
        console.warn('⚠️ Error en migración de datos:', error);
    }

    // 2. Inicializar servicios
    AdsService.init();
    FirebaseService.init();
    GameDataService.init();
    Mascot.init();
    UIEffects.init();
    Store.init();
    Ranking.init();
    Achievements.init();
    Profile.init();
    MiniGame.init();
    UI.initGlobalEvents();

    // 3. Inicializar App
    window.QuizApp = new QuizCristianoApp();
    await window.QuizApp.init();

    // Bindings de eventos
    setupEventListeners();
});

function setupEventListeners() {
    // Menú Toggle
    const menuToggleBtn = document.querySelector('.menu-toggle');
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            UI.toggleMenu();
        });
    }

    const dropdownCloseBtn = document.querySelector('.dropdown-close');
    if (dropdownCloseBtn) {
        dropdownCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            UI.toggleMenu();
        });
    }

    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => {
            UI.toggleMenu();
        });
    }

    // Mascota Speech
    const mascotContainer = document.querySelector('.mascot-container');
    if (mascotContainer) {
        mascotContainer.addEventListener('click', () => {
            UI.toggleSpeech();
        });
    }

    // Cambiar Usuario (desde header o menú)
    const changeUserBtns = document.querySelectorAll('.change-user-btn');
    changeUserBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            AuthService.changeUser();
        });
    });

    // Toggle Dark Mode
    const themeToggleBtn = document.getElementById('theme-toggle-item');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            ThemeService.toggleTheme();
        });
    }

    // Instalar App
    const installAppBtn = document.getElementById('install-app-item');
    if (installAppBtn) {
        installAppBtn.addEventListener('click', (e) => {
            e.preventDefault();
            PWAService.installApp();
        });
    }
}
