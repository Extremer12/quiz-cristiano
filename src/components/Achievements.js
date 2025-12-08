/**
 * Componente de Logros
 * Maneja la UI del sistema de logros
 */

import AchievementService from '../services/AchievementService.js';
import GameDataService from '../services/GameDataService.js';

class Achievements {
    constructor() {
        this.currentFilter = 'all';
    }

    init() {
        console.log('🏅 Inicializando Achievements...');

        // Solo inicializar si estamos en la página de logros
        if (!document.querySelector('.achievements-container')) {
            return;
        }

        AchievementService.init();
        this.render();
        this.bindEvents();

        // Verificar logros automáticamente
        this.checkAchievements();

        console.log('✅ Achievements inicializado');
    }

    render() {
        const container = document.querySelector('.achievements-container');
        if (!container) return;

        container.innerHTML = this.getHTML();
        this.renderAchievements(this.currentFilter);
        this.updateStats();
    }

    getHTML() {
        return `
            <!-- Header -->
            <header class="header">
                <button class="back-btn" onclick="window.location.href='index.html'" title="Volver al inicio">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h1>Logros</h1>
                <div class="header-stats">
                    <span class="coins-display">
                        <i class="fas fa-coins"></i>
                        <span id="coins-count">${GameDataService.getCoins()}</span>
                    </span>
                </div>
            </header>

            <!-- Estadísticas Generales -->
            <section class="achievements-overview">
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="fas fa-trophy"></i>
                    </div>
                    <div class="overview-info">
                        <h3>Logros Desbloqueados</h3>
                        <p class="overview-number" id="total-achievements">0/0</p>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="overview-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="overview-info">
                        <h3>Puntos de Logro</h3>
                        <p class="overview-number" id="achievement-points">0</p>
                    </div>
                </div>

                <div class="progress-overview">
                    <h3>Progreso General</h3>
                    <div class="progress-bar-container">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-bar"></div>
                        </div>
                        <span class="progress-percentage" id="progress-percentage">0%</span>
                    </div>
                </div>
            </section>

            <!-- Filtros -->
            <section class="achievements-filters">
                <button class="filter-btn active" data-filter="all">
                    <i class="fas fa-th"></i> Todos
                </button>
                <button class="filter-btn" data-filter="unlocked">
                    <i class="fas fa-unlock"></i> Desbloqueados
                </button>
                <button class="filter-btn" data-filter="locked">
                    <i class="fas fa-lock"></i> Bloqueados
                </button>
                <button class="filter-btn" data-filter="progreso">
                    <i class="fas fa-chart-line"></i> Progreso
                </button>
                <button class="filter-btn" data-filter="maestria">
                    <i class="fas fa-crown"></i> Maestría
                </button>
                <button class="filter-btn" data-filter="rachas">
                    <i class="fas fa-fire"></i> Rachas
                </button>
            </section>

            <!-- Grid de Logros -->
            <section class="achievements-container-inner">
                <div class="achievements-grid" id="achievements-grid">
                    <!-- Los logros se cargan dinámicamente -->
                </div>
            </section>

            <!-- Modal de Detalle de Logro -->
            <div class="modal achievement-modal" id="achievement-modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="achievement-modal-content"></div>
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
                <a href="logros.html" class="nav-item active">
                    <i class="fas fa-medal"></i>
                    <span>Logros</span>
                </a>
                <a href="store.html" class="nav-item">
                    <i class="fas fa-store"></i>
                    <span>Tienda</span>
                </a>
            </nav>
        `;
    }

    renderAchievements(filter = 'all') {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;

        let achievements = AchievementService.getAllAchievements();

        // Filtrar
        if (filter === 'unlocked') {
            achievements = achievements.filter(a => AchievementService.isUnlocked(a.id));
        } else if (filter === 'locked') {
            achievements = achievements.filter(a => !AchievementService.isUnlocked(a.id));
        } else if (filter !== 'all') {
            achievements = achievements.filter(a => a.category === filter);
        }

        // Ordenar: desbloqueados primero
        achievements.sort((a, b) => {
            const aUnlocked = AchievementService.isUnlocked(a.id);
            const bUnlocked = AchievementService.isUnlocked(b.id);
            if (aUnlocked && !bUnlocked) return -1;
            if (!aUnlocked && bUnlocked) return 1;
            return b.points - a.points;
        });

        grid.innerHTML = achievements.map(achievement => this.getAchievementCardHTML(achievement)).join('');
    }

    getAchievementCardHTML(achievement) {
        const isUnlocked = AchievementService.isUnlocked(achievement.id);
        const rarity = AchievementService.rarityConfig[achievement.rarity];
        const stats = GameDataService.gameData;

        let progressHTML = '';
        if (!isUnlocked) {
            const progress = AchievementService.getProgress(achievement, stats);
            if (progress.current > 0) {
                const percentage = Math.min((progress.current / progress.total) * 100, 100);
                progressHTML = `
                    <div class="achievement-progress">
                        <div class="progress-bar-small">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                        <span class="progress-text">${progress.current}/${progress.total}</span>
                    </div>
                `;
            }
        }

        return `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'} rarity-${achievement.rarity}" data-achievement-id="${achievement.id}">
                <div class="achievement-icon ${isUnlocked ? '' : 'locked-icon'}" style="color: ${rarity.color}">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h3 class="achievement-name">${achievement.name}</h3>
                    <p class="achievement-description">${achievement.description}</p>
                    <div class="achievement-meta">
                        <span class="achievement-points">
                            <i class="fas fa-star"></i> ${achievement.points} pts
                        </span>
                        <span class="achievement-rarity" style="color: ${rarity.color}">
                            ${rarity.name}
                        </span>
                    </div>
                    ${progressHTML}
                </div>
                ${isUnlocked ? '<div class="achievement-unlocked"><i class="fas fa-check"></i></div>' : ''}
            </div>
        `;
    }

    showAchievementModal(achievementId) {
        const achievement = AchievementService.getAllAchievements().find(a => a.id === achievementId);
        if (!achievement) return;

        const modal = document.getElementById('achievement-modal');
        const modalContent = modal.querySelector('.achievement-modal-content');
        const isUnlocked = AchievementService.isUnlocked(achievement.id);
        const rarity = AchievementService.rarityConfig[achievement.rarity];
        const stats = GameDataService.gameData;

        let progressHTML = '';
        if (!isUnlocked) {
            const progress = AchievementService.getProgress(achievement, stats);
            const percentage = Math.min((progress.current / progress.total) * 100, 100);
            progressHTML = `
                <div class="modal-progress">
                    <h4>Progreso</h4>
                    <div class="progress-bar-large">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <p>${progress.current} / ${progress.total}</p>
                </div>
            `;
        }

        modalContent.innerHTML = `
            <div class="achievement-modal-header" style="background: ${rarity.bgColor}">
                <div class="modal-icon" style="color: ${rarity.color}">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <h2>${achievement.name}</h2>
                <span class="modal-rarity" style="color: ${rarity.color}">${rarity.name}</span>
            </div>
            <div class="achievement-modal-body">
                <p class="modal-description">${achievement.description}</p>
                <div class="modal-points">
                    <i class="fas fa-star"></i> ${achievement.points} puntos
                </div>
                ${progressHTML}
                ${isUnlocked ? '<div class="modal-unlocked"><i class="fas fa-check"></i> Logro Desbloqueado</div>' : ''}
            </div>
            <div class="achievement-modal-footer">
                <button class="btn modal-close-btn">Cerrar</button>
            </div>
        `;

        modal.style.display = 'flex';
    }

    closeAchievementModal() {
        const modal = document.getElementById('achievement-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateStats() {
        const totalEl = document.getElementById('total-achievements');
        const pointsEl = document.getElementById('achievement-points');
        const progressBarEl = document.getElementById('progress-bar');
        const progressPercentageEl = document.getElementById('progress-percentage');

        const total = AchievementService.getTotalAchievements();
        const unlocked = AchievementService.getUnlockedCount();
        const percentage = AchievementService.getCompletionPercentage();

        if (totalEl) totalEl.textContent = `${unlocked}/${total}`;
        if (pointsEl) pointsEl.textContent = AchievementService.achievementPoints;
        if (progressBarEl) progressBarEl.style.width = `${percentage}%`;
        if (progressPercentageEl) progressPercentageEl.textContent = `${percentage}%`;
    }

    checkAchievements() {
        const stats = GameDataService.gameData;
        const newUnlocks = AchievementService.checkAchievements(stats);

        if (newUnlocks.length > 0) {
            console.log(`🎉 ${newUnlocks.length} nuevos logros desbloqueados!`);
            // Aquí podrías mostrar una notificación
            this.updateStats();
            this.renderAchievements(this.currentFilter);
        }
    }

    bindEvents() {
        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.renderAchievements(this.currentFilter);
            });
        });

        // Click en tarjetas de logros
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.achievement-card');
            if (card) {
                this.showAchievementModal(card.dataset.achievementId);
            }
        });

        // Cerrar modal
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal-overlay') || e.target.closest('.modal-close-btn')) {
                this.closeAchievementModal();
            }
        });
    }
}

export default new Achievements();
