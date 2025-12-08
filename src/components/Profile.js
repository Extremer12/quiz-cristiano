/**
 * Componente de Perfil
 * Maneja la UI del perfil de usuario
 */

import GameDataService from '../services/GameDataService.js';

class Profile {
    constructor() {
        this.profileData = this.getDefaultProfile();
        this.hasUnsavedChanges = false;

        this.availableAvatars = [
            { id: 'nina', src: 'assets/images/fotos-perfil/niña.jpg', name: 'Niña', unlocked: true },
            { id: 'nino', src: 'assets/images/fotos-perfil/niño.jpg', name: 'Niño', unlocked: true },
            { id: 'oveja', src: 'assets/images/fotos-perfil/oveja.jpg', name: 'Oveja', unlocked: true },
            { id: 'paloma', src: 'assets/images/fotos-perfil/paloma.jpg', name: 'Paloma', unlocked: true }
        ];
    }

    getDefaultProfile() {
        return {
            username: '',
            displayName: '',
            favoriteVerse: '',
            currentAvatar: 'assets/images/fotos-perfil/niña.jpg',
            level: 1,
            exp: 0,
            expToNext: 100
        };
    }

    init() {
        console.log('👤 Inicializando Profile...');

        // Solo inicializar si estamos en la página de perfil
        if (!document.querySelector('.profile-container')) {
            return;
        }

        this.loadProfile();
        this.render();
        this.bindEvents();

        console.log('✅ Profile inicializado');
    }

    loadProfile() {
        const saved = localStorage.getItem('profileData');
        if (saved) {
            this.profileData = { ...this.getDefaultProfile(), ...JSON.parse(saved) };
        } else {
            // Cargar desde currentUser si existe
            const currentUser = localStorage.getItem('currentUser');
            if (currentUser) {
                const userData = JSON.parse(currentUser);
                this.profileData.username = userData.username || '';
                this.profileData.displayName = userData.displayName || '';
            }
        }
    }

    saveProfile() {
        localStorage.setItem('profileData', JSON.stringify(this.profileData));
        this.hasUnsavedChanges = false;
        this.updateSaveButtonState();
    }

    render() {
        const container = document.querySelector('.profile-container');
        if (!container) return;

        container.innerHTML = this.getHTML();
        this.updateFormFromProfile();
        this.renderStats();
    }

    getHTML() {
        return `
            <!-- Header -->
            <header class="header">
                <button class="back-btn" onclick="window.location.href='index.html'">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h1>Mi Perfil</h1>
                <div class="header-stats">
                    <span class="coins-display">
                        <i class="fas fa-coins"></i>
                        <span id="coins-count">${GameDataService.getCoins()}</span>
                    </span>
                </div>
            </header>

            <!-- Avatar Section -->
            <section class="profile-avatar-section">
                <div class="avatar-container">
                    <button class="avatar-btn" id="avatar-btn">
                        <img src="${this.profileData.currentAvatar}" alt="Avatar" id="current-avatar-img">
                        <div class="avatar-edit-overlay">
                            <i class="fas fa-camera"></i>
                        </div>
                    </button>
                </div>
                <h2 id="current-username">${this.profileData.username || 'Usuario'}</h2>
            </section>

            <!-- Profile Form -->
            <section class="profile-form-section">
                <form id="profile-form">
                    <div class="form-group">
                        <label for="username">Nombre de Usuario</label>
                        <input type="text" id="username" placeholder="usuario123" required>
                        <span class="input-hint">3-20 caracteres, solo letras, números, - y _</span>
                    </div>

                    <div class="form-group">
                        <label for="display-name">Nombre para Mostrar</label>
                        <input type="text" id="display-name" placeholder="Tu nombre" maxlength="30">
                        <span class="char-count" id="display-name-count">0/30</span>
                    </div>

                    <div class="form-group">
                        <label for="favorite-verse">Versículo Favorito</label>
                        <textarea id="favorite-verse" placeholder="Juan 3:16" maxlength="200" rows="3"></textarea>
                        <span class="char-count" id="favorite-verse-count">0/200</span>
                    </div>

                    <button type="submit" class="btn btn-primary" id="save-profile-btn">
                        <i class="fas fa-save"></i>
                        <span class="btn-text">Guardar Cambios</span>
                    </button>
                </form>
            </section>

            <!-- Stats Section -->
            <section class="profile-stats-section">
                <h3><i class="fas fa-chart-bar"></i> Estadísticas</h3>
                <div class="stats-grid" id="stats-grid">
                    <!-- Se llena dinámicamente -->
                </div>
            </section>

            <!-- Avatar Modal -->
            <div class="modal" id="avatar-modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Seleccionar Avatar</h3>
                        <button class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="avatars-grid" id="avatars-grid">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Navigation -->
            <nav class="bottom-nav">
                <a href="index.html" class="nav-item">
                    <i class="fas fa-home"></i>
                    <span>Inicio</span>
                </a>
                <a href="single-player-new.html" class="nav-item">
                    <i class="fas fa-play"></i>
                    <span>Jugar</span>
                </a>
                <a href="ranking.html" class="nav-item">
                    <i class="fas fa-trophy"></i>
                    <span>Ranking</span>
                </a>
                <a href="logros.html" class="nav-item">
                    <i class="fas fa-medal"></i>
                    <span>Logros</span>
                </a>
                <a href="perfil.html" class="nav-item active">
                    <i class="fas fa-user"></i>
                    <span>Perfil</span>
                </a>
            </nav>
        `;
    }

    updateFormFromProfile() {
        const usernameInput = document.getElementById('username');
        const displayNameInput = document.getElementById('display-name');
        const favoriteVerseInput = document.getElementById('favorite-verse');
        const currentUsernameDisplay = document.getElementById('current-username');

        if (usernameInput) usernameInput.value = this.profileData.username || '';
        if (displayNameInput) displayNameInput.value = this.profileData.displayName || '';
        if (favoriteVerseInput) favoriteVerseInput.value = this.profileData.favoriteVerse || '';
        if (currentUsernameDisplay) currentUsernameDisplay.textContent = this.profileData.username || 'Usuario';

        this.updateCharCount('display-name', 'display-name-count', 30);
        this.updateCharCount('favorite-verse', 'favorite-verse-count', 200);
    }

    updateCharCount(inputId, countId, max) {
        const input = document.getElementById(inputId);
        const count = document.getElementById(countId);

        if (input && count) {
            const currentLength = input.value.length;
            count.textContent = `${currentLength}/${max}`;
        }
    }

    renderStats() {
        const statsGrid = document.getElementById('stats-grid');
        if (!statsGrid) return;

        const gameData = GameDataService.gameData;

        const stats = [
            { label: 'Partidas Jugadas', value: gameData.gamesPlayed || 0, icon: 'fa-gamepad' },
            { label: 'Victorias', value: gameData.victories || 0, icon: 'fa-trophy' },
            { label: 'Juegos Perfectos', value: gameData.perfectGames || 0, icon: 'fa-star' },
            { label: 'Monedas', value: gameData.coins || 0, icon: 'fa-coins' }
        ];

        statsGrid.innerHTML = stats.map(stat => `
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas ${stat.icon}"></i>
                </div>
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');
    }

    openAvatarModal() {
        const modal = document.getElementById('avatar-modal');
        const avatarsGrid = document.getElementById('avatars-grid');

        if (!modal || !avatarsGrid) return;

        avatarsGrid.innerHTML = this.availableAvatars.map(avatar => `
            <div class="avatar-option ${this.profileData.currentAvatar === avatar.src ? 'selected' : ''}" data-avatar-id="${avatar.id}">
                <img src="${avatar.src}" alt="${avatar.name}">
                <div class="avatar-name">${avatar.name}</div>
                ${this.profileData.currentAvatar === avatar.src ? '<div class="avatar-selected-indicator">✓</div>' : ''}
            </div>
        `).join('');

        modal.style.display = 'flex';
    }

    closeAvatarModal() {
        const modal = document.getElementById('avatar-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    selectAvatar(avatarId) {
        const avatar = this.availableAvatars.find(a => a.id === avatarId);
        if (!avatar) return;

        this.profileData.currentAvatar = avatar.src;

        const img = document.getElementById('current-avatar-img');
        if (img) img.src = avatar.src;

        this.saveProfile();
        this.showNotification(`Avatar cambiado a ${avatar.name}`, 'success');

        setTimeout(() => this.closeAvatarModal(), 500);
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const usernameInput = document.getElementById('username');
        const displayNameInput = document.getElementById('display-name');
        const favoriteVerseInput = document.getElementById('favorite-verse');

        this.profileData.username = usernameInput?.value.trim() || '';
        this.profileData.displayName = displayNameInput?.value.trim() || '';
        this.profileData.favoriteVerse = favoriteVerseInput?.value.trim() || '';

        if (!this.profileData.username) {
            this.showNotification('El nombre de usuario es obligatorio', 'error');
            return;
        }

        if (!this.validateUsername(this.profileData.username)) {
            this.showNotification('Nombre de usuario inválido. Debe tener 3-20 caracteres, solo letras, números, - y _', 'error');
            return;
        }

        this.saveProfile();
        this.updateFormFromProfile();
        this.showNotification('Perfil guardado correctamente', 'success');
    }

    validateUsername(username) {
        const regex = /^[a-zA-Z0-9_-]{3,20}$/;
        return regex.test(username);
    }

    handleFormInput() {
        this.updateCharCount('display-name', 'display-name-count', 30);
        this.updateCharCount('favorite-verse', 'favorite-verse-count', 200);
        this.hasUnsavedChanges = true;
        this.updateSaveButtonState();
    }

    updateSaveButtonState() {
        const btn = document.getElementById('save-profile-btn');
        if (!btn) return;

        if (this.hasUnsavedChanges) {
            btn.disabled = false;
            btn.style.opacity = '1';
        } else {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        }
    }

    showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const div = document.createElement('div');
        div.className = `notification notification-${type}`;
        div.innerHTML = `
            <span>${message}</span>
            <button type="button" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(div);

        setTimeout(() => {
            if (div.parentElement) div.remove();
        }, 4000);
    }

    bindEvents() {
        // Avatar button
        const avatarBtn = document.getElementById('avatar-btn');
        if (avatarBtn) {
            avatarBtn.addEventListener('click', () => this.openAvatarModal());
        }

        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal-close') || e.target.closest('.modal-overlay')) {
                this.closeAvatarModal();
            }
        });

        // Avatar selection
        document.addEventListener('click', (e) => {
            const avatarOption = e.target.closest('.avatar-option');
            if (avatarOption) {
                this.selectAvatar(avatarOption.dataset.avatarId);
            }
        });

        // Form submit
        const form = document.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            form.addEventListener('input', () => this.handleFormInput());
        }

        // Warn about unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.returnValue = '¿Estás seguro de que quieres salir? Tienes cambios sin guardar.';
            }
        });
    }
}

export default new Profile();
