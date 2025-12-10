/**
 * Main Entry Point - Vite
 */

import './styles/main.css';
import './styles/store.css';
import './styles/ranking.css';
import './styles/perfil.css';
import './styles/logros.css';
import './styles/mini-juego.css';
import { Router } from './router.js';

// Initialize Firebase (mantener configuración existente)
import './config/firebase.js';

// Initialize Router
const app = document.getElementById('app');
new Router(app);

console.log('🚀 Quiz Cristiano - Vite Edition');
