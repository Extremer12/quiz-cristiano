/**
 * Componente de Ranking
 * Maneja la UI del sistema de ranking por divisiones
 */

import RankingService from '../services/RankingService.js';
import GameDataService from '../services/GameDataService.js';

class Ranking {
    constructor() {
        this.rankingData = null;
        this.currentDivisionView = null;
    }

    init() {
        console.log('🏆 Inicializando Ranking...');

        // Solo inicializar si estamos en la página de ranking
        if (!document.querySelector('.ranking-container')) {
            return;
        }

        this.rankingData = RankingService.loadAllDivisionsData();
        this.currentDivisionView = this.rankingData.currentDivision.id;

        this.render();
        this.bindEvents();

        console.log('✅ Ranking inicializado');
    }

    render() {
        const container = document.querySelector('.ranking-container');
        if (!container) return;

        container.innerHTML = this.getHTML();

        // Mostrar la tabla de la división actual
        this.showDivisionTable(this.currentDivisionView);
    }

    getHTML() {
        const { currentDivision, playerScore, playerRank } = this.rankingData;

        return `
            <!-- Header -->
            <header class="ranking-header">
                <button class="back-btn" onclick="window.location.href='index.html'">
                    <i class="fas fa-arrow-left"></i>
                </button>
                
                <div class="ranking-title">
                    <h1>Ranking por Divisiones</h1>
                    <p>Temporada ${RankingService.getCurrentSeason()}</p>
                </div>
                
                <div class="player-coins">
                    <i class="fas fa-coins"></i>
                    <span id="coins-display">${GameDataService.getCoins()}</span>
                </div>
            </header>

            <!-- Mi División Actual -->
            <section class="my-division-section">
                <div class="division-card" data-division="${currentDivision.id}">
                    <div class="division-trophy">
                        <img src="${currentDivision.trophyImage}" alt="${currentDivision.name}">
                    </div>
                    <div class="division-info">
                        <h2>${currentDivision.name}</h2>
                        <p>${currentDivision.description}</p>
                        <div class="my-stats">
                            <div class="stat-item">
                                <span class="stat-value">${playerScore}</span>
                                <span class="stat-label">Puntos</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">#${playerRank || '?'}</span>
                                <span class="stat-label">Posición</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${RankingService.getDaysUntilSeasonEnd()}</span>
                                <span class="stat-label">Días restantes</span>
                            </div>
                        </div>
                        <div class="promotion-relegation-info">
                            ${this.getPromotionRelegationInfo(playerRank, currentDivision)}
                        </div>
                    </div>
                </div>
            </section>

            <!-- Selector de División -->
            <section class="division-selector">
                <h2><i class="fas fa-layer-group"></i> Ver División</h2>
                <div class="division-tabs">
                    ${RankingService.getAllDivisions().map(division => `
                        <button class="division-tab ${division.id === currentDivision.id ? 'active' : ''}" 
                                data-division="${division.id}">
                            <img src="${division.trophyImage}" alt="${division.name}">
                            <span>${division.name}</span>
                        </button>
                    `).join('')}
                </div>
            </section>

            <!-- Tabla de Ranking de División -->
            <section class="division-ranking">
                <div class="ranking-header-section">
                    <h2 id="division-ranking-title">Ranking ${currentDivision.name}</h2>
                    <div class="season-info">
                        <i class="fas fa-calendar"></i>
                        <span>Termina en ${RankingService.getDaysUntilSeasonEnd()} días</span>
                    </div>
                </div>
                
                <!-- Información de Ascensos/Descensos -->
                <div class="promotion-relegation-legend">
                    <div class="legend-item promotion">
                        <div class="legend-color"></div>
                        <span>Zona de Ascenso (Top 5)</span>
                    </div>
                    <div class="legend-item safe">
                        <div class="legend-color"></div>
                        <span>Zona Segura</span>
                    </div>
                    <div class="legend-item relegation">
                        <div class="legend-color"></div>
                        <span>Zona de Descenso (Últimos 5)</span>
                    </div>
                </div>
                
                <!-- Top 3 Podio -->
                <div class="podium-section">
                    <div class="podium" id="division-podium"></div>
                </div>
                
                <!-- Tabla completa -->
                <div class="players-table" id="division-players-table">
                    <div class="loading-players">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Cargando ranking...</p>
                    </div>
                </div>
            </section>

            <!-- Modal de Perfil de Jugador -->
            <div class="player-modal" id="player-modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="player-modal-content"></div>
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
                <a href="ranking.html" class="nav-item active">
                    <i class="fas fa-trophy"></i>
                    <span>Ranking</span>
                </a>
                <a href="logros.html" class="nav-item">
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

    getPromotionRelegationInfo(currentRank, division) {
        if (currentRank <= 5 && division.promotionZone.end > 0) {
            return `<div class="promotion-info">¡En zona de ascenso! Mantén tu posición para subir de división.</div>`;
        } else if (currentRank >= 26) {
            return `<div class="relegation-info">En zona de descenso. Mejora tu puntuación para mantenerte en la división.</div>`;
        } else {
            const toPromotion = Math.max(0, 5 - currentRank + 1);
            const toRelegation = Math.max(0, currentRank - 25);
            return `<div class="safe-info">En zona segura. ${toPromotion > 0 ? `${toPromotion} posiciones para ascenso.` : `${toRelegation} posiciones del descenso.`}</div>`;
        }
    }

    showDivisionTable(divisionId) {
        const division = RankingService.getAllDivisions().find(d => d.id === divisionId);
        const players = this.rankingData.allDivisions[divisionId];

        if (!division || !players) return;

        this.currentDivisionView = divisionId;

        // Actualizar tabs activos
        document.querySelectorAll('.division-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.division === divisionId);
        });

        // Actualizar título
        const titleEl = document.getElementById('division-ranking-title');
        if (titleEl) titleEl.textContent = `Ranking ${division.name}`;

        // Renderizar podio
        this.renderPodium(players.slice(0, 3));

        // Renderizar tabla completa
        this.renderPlayersTable(players, division);
    }

    renderPodium(topPlayers) {
        const podium = document.getElementById('division-podium');
        if (!podium || topPlayers.length < 3) return;

        podium.innerHTML = `
            <div class="podium-place second">
                <div class="podium-avatar">
                    <img src="${topPlayers[1]?.avatar || 'assets/images/fotos-perfil/niña.jpg'}" alt="${topPlayers[1]?.name}">
                </div>
                <div class="podium-info">
                    <h3>${topPlayers[1]?.name || 'Usuario'}</h3>
                    <p>${topPlayers[1]?.score || 0} pts</p>
                </div>
                <div class="podium-rank">2</div>
            </div>

            <div class="podium-place first">
                <div class="podium-crown">
                    <i class="fas fa-crown"></i>
                </div>
                <div class="podium-avatar">
                    <img src="${topPlayers[0]?.avatar || 'assets/images/fotos-perfil/niña.jpg'}" alt="${topPlayers[0]?.name}">
                </div>
                <div class="podium-info">
                    <h3>${topPlayers[0]?.name || 'Usuario'}</h3>
                    <p>${topPlayers[0]?.score || 0} pts</p>
                </div>
                <div class="podium-rank">1</div>
            </div>

            <div class="podium-place third">
                <div class="podium-avatar">
                    <img src="${topPlayers[2]?.avatar || 'assets/images/fotos-perfil/niña.jpg'}" alt="${topPlayers[2]?.name}">
                </div>
                <div class="podium-info">
                    <h3>${topPlayers[2]?.name || 'Usuario'}</h3>
                    <p>${topPlayers[2]?.score || 0} pts</p>
                </div>
                <div class="podium-rank">3</div>
            </div>
        `;
    }

    renderPlayersTable(players, division) {
        const tableContainer = document.getElementById('division-players-table');
        if (!tableContainer) return;

        const tableHTML = `
            <div class="players-table-header">
                <div class="pos">Pos</div>
                <div class="player">Jugador</div>
                <div class="stats">Estadísticas</div>
                <div class="points">Puntos</div>
            </div>
            <div class="players-table-body">
                ${players.map((player, index) => this.getPlayerRowHTML(player, index + 1, division)).join('')}
            </div>
        `;

        tableContainer.innerHTML = tableHTML;
    }

    getPlayerRowHTML(player, position, division) {
        let rowClass = 'player-row';

        if (position <= 5 && division.promotionZone.end > 0) {
            rowClass += ' promotion-zone';
        } else if (position >= 26) {
            rowClass += ' relegation-zone';
        } else {
            rowClass += ' safe-zone';
        }

        if (player.isCurrentPlayer) {
            rowClass += ' current-player';
        }

        return `
            <div class="${rowClass}" data-player-id="${player.id}">
                <div class="player-position">
                    <span class="position-number">${position}</span>
                    ${position <= 3 ? `<i class="fas fa-trophy position-trophy trophy-${position}"></i>` : ''}
                </div>
                <div class="player-info">
                    <div class="player-avatar">
                        <img src="${player.avatar}" alt="${player.name}" onerror="this.src='assets/images/fotos-perfil/niña.jpg'">
                        ${player.isBot ? '' : '<div class="real-player-badge"><i class="fas fa-user"></i></div>'}
                    </div>
                    <div class="player-details">
                        <div class="player-name">${player.name}</div>
                        <div class="player-level">Nivel ${player.level}</div>
                    </div>
                </div>
                <div class="player-stats">
                    <div class="stat-item">
                        <span class="stat-value">${player.monthlyGames}</span>
                        <span class="stat-label">Partidas</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${Math.round(player.winRate * 100)}%</span>
                        <span class="stat-label">Victorias</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${player.achievements}</span>
                        <span class="stat-label">Logros</span>
                    </div>
                </div>
                <div class="player-score">${player.score}</div>
            </div>
        `;
    }

    showPlayerProfile(playerId) {
        const players = this.rankingData.allDivisions[this.currentDivisionView];
        const player = players.find(p => p.id === playerId);
        const position = players.findIndex(p => p.id === playerId) + 1;
        const division = RankingService.getAllDivisions().find(d => d.id === this.currentDivisionView);

        if (!player) return;

        const modal = document.getElementById('player-modal');
        const modalContent = modal.querySelector('.player-modal-content');

        modalContent.innerHTML = this.getPlayerProfileHTML(player, position, division);

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    getPlayerProfileHTML(player, position, division) {
        return `
            <div class="player-profile-header">
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
                <div class="player-profile-avatar">
                    <img src="${player.avatar}" alt="${player.name}" onerror="this.src='assets/images/fotos-perfil/niña.jpg'">
                    ${player.isBot ? '<div class="bot-badge">BOT</div>' : '<div class="real-badge">REAL</div>'}
                </div>
                <div class="player-profile-info">
                    <h2>${player.name}</h2>
                    <div class="player-position-badge">
                        Posición #${position} en ${division.name}
                    </div>
                    <div class="player-level-badge">Nivel ${player.level}</div>
                </div>
            </div>
            
            <div class="player-profile-content">
                <div class="profile-section">
                    <h3><i class="fas fa-heart"></i> Versículo Favorito</h3>
                    <div class="favorite-verse">
                        "${player.favoriteVerse}"
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3><i class="fas fa-chart-bar"></i> Estadísticas</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-gamepad"></i></div>
                            <div class="stat-value">${player.monthlyGames}</div>
                            <div class="stat-label">Partidas este mes</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-trophy"></i></div>
                            <div class="stat-value">${Math.round(player.winRate * 100)}%</div>
                            <div class="stat-label">Tasa de victorias</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-medal"></i></div>
                            <div class="stat-value">${player.achievements}</div>
                            <div class="stat-label">Logros</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-star"></i></div>
                            <div class="stat-value">${player.score}</div>
                            <div class="stat-label">Puntos</div>
                        </div>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3><i class="fas fa-calendar"></i> Información General</h3>
                    <div class="general-info">
                        <div class="info-item">
                            <span class="info-label">Miembro desde:</span>
                            <span class="info-value">${this.formatDate(player.joinDate)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Tipo de cuenta:</span>
                            <span class="info-value">${player.isBot ? 'Bot generado' : 'Jugador real'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="profile-section">
                    <h3><i class="fas fa-crown"></i> Palmarés</h3>
                    <div class="palmares-section">
                        ${player.palmares && player.palmares.length > 0 ?
                player.palmares.map(medal => `
                                <div class="medal-item">
                                    <div class="medal-icon position-${medal.position}">
                                        <i class="fas fa-medal"></i>
                                    </div>
                                    <div class="medal-info">
                                        <div class="medal-title">Puesto ${medal.position} - ${medal.division.charAt(0).toUpperCase() + medal.division.slice(1)}</div>
                                        <div class="medal-date">Temporada ${medal.season}</div>
                                    </div>
                                </div>
                            `).join('') :
                '<div class="no-palmares">Aún no tiene medallas en su palmarés.</div>'
            }
                    </div>
                </div>
            </div>
        `;
    }

    closePlayerModal() {
        const modal = document.getElementById('player-modal');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(new Date(date));
    }

    bindEvents() {
        // Tabs de división
        document.querySelectorAll('.division-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.showDivisionTable(tab.dataset.division);
            });
        });

        // Click en filas de jugadores
        document.addEventListener('click', (e) => {
            const row = e.target.closest('.player-row');
            if (row) {
                this.showPlayerProfile(row.dataset.playerId);
            }
        });

        // Cerrar modal
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal-close') || e.target.closest('.modal-overlay')) {
                this.closePlayerModal();
            }
        });
    }
}

export default new Ranking();
