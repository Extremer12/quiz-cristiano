# Estilos Completos del Ranking - Quiz Cristiano

## 📋 Índice

1. [Variables CSS](#variables-css)
2. [Layout Principal](#layout-principal)
3. [Header del Ranking](#header-del-ranking)
4. [Mi División Actual](#mi-división-actual)
5. [Sistema de Divisiones](#sistema-de-divisiones)
6. [Podio Top 3](#podio-top-3)
7. [Tabla de Jugadores](#tabla-de-jugadores)
8. [Modal de Perfil](#modal-de-perfil)
9. [Animaciones](#animaciones)
10. [Responsive Design](#responsive-design)

---

## 🎨 Variables CSS

### Variables Específicas del Ranking

```css
:root {
  /* Colores de medallas */
  --ranking-gold: #ffd700;
  --ranking-silver: #c0c0c0;
  --ranking-bronze: #cd7f32;
  --ranking-accent: #3a86ff;

  /* Colores de divisiones */
  --platino-primary: #e5e4e2;
  --platino-secondary: #c0c0c0;
  --diamante-primary: #b9f2ff;
  --diamante-secondary: #66d9ef;
  --corona-primary: #ffd700;
  --corona-secondary: #ffed4e;

  /* Zonas de ranking */
  --promotion-color: #27ae60;
  --promotion-bg: rgba(39, 174, 96, 0.1);
  --safe-color: #3498db;
  --safe-bg: rgba(52, 152, 219, 0.1);
  --relegation-color: #e74c3c;
  --relegation-bg: rgba(231, 76, 60, 0.1);

  /* Efectos de brillo */
  --podium-glow-gold: 0 0 30px rgba(255, 215, 0, 0.5);
  --podium-glow-silver: 0 0 25px rgba(192, 192, 192, 0.4);
  --podium-glow-bronze: 0 0 20px rgba(205, 127, 50, 0.4);

  /* Transiciones */
  --ranking-transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 🏗️ Layout Principal

### Contenedor Base

```css
.ranking-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-bottom: 100px;
}
```

### Body con Fondo

```css
body {
  font-family: "Lato", sans-serif;
  background: var(--bg-primary);
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  min-height: 100vh;
  color: var(--text-primary);
  overflow-x: hidden;
  position: relative;
  transition: all 0.3s ease;
}

body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-overlay);
  z-index: -1;
  pointer-events: none;
  transition: all 0.3s ease;
}
```

---

## 📱 Header del Ranking

### Estructura del Header

```css
.ranking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: var(--surface-primary);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--border-primary);
  margin: 15px;
  border-radius: 15px;
  box-shadow: var(--shadow-secondary);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}
```

### Botón de Retroceso

```css
.back-btn {
  background: var(--surface-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--ranking-transition);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.back-btn:hover {
  background: var(--surface-accent);
  transform: scale(1.05);
}
```

### Título del Ranking

```css
.ranking-title {
  flex: 1;
  text-align: center;
  margin: 0 15px;
}

.ranking-title h1 {
  font-family: "Cinzel", serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-accent);
  margin-bottom: 3px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.ranking-title p {
  font-size: 0.8rem;
  color: var(--text-secondary);
  opacity: 0.8;
}
```

### Display de Monedas

```css
.player-coins {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 15px;
  padding: 8px 12px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-accent);
}

.player-coins i {
  color: var(--text-accent);
  animation: coinSpin 3s linear infinite;
}

@keyframes coinSpin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

---

## 🏆 Mi División Actual

### Contenedor de División

```css
.my-division-section {
  margin: 0 15px 20px;
}

.division-card {
  background: var(--surface-primary);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  padding: 25px;
  box-shadow: var(--shadow-secondary);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
```

### Efecto de Brillo al Hover

```css
.division-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.8s ease;
}

.division-card:hover::before {
  left: 100%;
}

.division-card:hover {
  background: var(--surface-secondary);
  transform: translateY(-5px);
  box-shadow: var(--shadow-primary);
}
```

### Colores por División

```css
.division-card[data-division="platino"] {
  border-color: var(--platino-secondary);
}

.division-card[data-division="diamante"] {
  border-color: var(--diamante-secondary);
}

.division-card[data-division="corona-divina"] {
  border-color: var(--corona-secondary);
}
```

### Trofeo de División

```css
.division-trophy {
  text-align: center;
  margin-bottom: 20px;
}

.division-trophy img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(0 8px 25px rgba(0, 0, 0, 0.3));
  animation: trophyFloat 3s ease-in-out infinite;
}

@keyframes trophyFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(2deg);
  }
}
```

### Información de División

```css
.division-info {
  text-align: center;
}

.division-info h2 {
  color: var(--text-accent);
  margin-bottom: 10px;
  font-size: 1.8rem;
  font-family: "Cinzel", serif;
}

.division-info p {
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-size: 1rem;
}
```

### Estadísticas Personales

```css
.my-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  background: var(--surface-secondary);
  border: 1px solid var(--border-secondary);
  border-radius: 15px;
  padding: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: var(--surface-accent);
  transform: translateY(-2px);
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-accent);
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}
```

### Información de Promoción/Descenso

```css
.promotion-info {
  background: var(--promotion-bg);
  border: 1px solid var(--promotion-color);
  border-radius: 10px;
  padding: 12px;
  color: var(--promotion-color);
  font-weight: 600;
  text-align: center;
}

.relegation-info {
  background: var(--relegation-bg);
  border: 1px solid var(--relegation-color);
  border-radius: 10px;
  padding: 12px;
  color: var(--relegation-color);
  font-weight: 600;
  text-align: center;
}

.safe-info {
  background: var(--safe-bg);
  border: 1px solid var(--safe-color);
  border-radius: 10px;
  padding: 12px;
  color: var(--safe-color);
  font-weight: 600;
  text-align: center;
}
```

---

## 🎯 Sistema de Divisiones

### Selector de División

```css
.division-selector {
  margin: 0 15px 20px;
}

.division-selector h2 {
  color: var(--text-accent);
  margin-bottom: 15px;
  font-size: 1.5rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
```

### Tabs de Divisiones

```css
.division-tabs {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.division-tabs::-webkit-scrollbar {
  display: none;
}

.division-tab {
  background: var(--surface-primary);
  border: 1px solid var(--border-primary);
  border-radius: 15px;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  flex-shrink: 0;
}

.division-tab:hover {
  background: var(--surface-secondary);
  transform: translateY(-3px);
}

.division-tab.active {
  background: var(--surface-accent);
  border-color: var(--text-accent);
  box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3);
}

.division-tab img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.division-tab span {
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}
```

---

## 🥇 Podio Top 3

### Sección del Podio

```css
.podium-section {
  background: var(--surface-primary);
  backdrop-filter: var(--backdrop-blur);
  border-left: 1px solid var(--border-primary);
  border-right: 1px solid var(--border-primary);
  padding: 30px 20px;
}

.podium {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 20px;
  max-width: 400px;
  margin: 0 auto;
}
```

### Lugares del Podio

```css
.podium-place {
  background: var(--surface-secondary);
  border: 1px solid var(--border-secondary);
  border-radius: 15px;
  padding: 20px 15px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.podium-place:hover {
  background: var(--surface-accent);
  transform: translateY(-5px);
}
```

### Primer Lugar

```css
.podium-place.first {
  order: 2;
  transform: scale(1.1);
  border-color: var(--ranking-gold);
}

.podium-place.first:hover {
  box-shadow: var(--podium-glow-gold);
}
```

### Segundo Lugar

```css
.podium-place.second {
  order: 1;
  border-color: var(--ranking-silver);
}

.podium-place.second:hover {
  box-shadow: var(--podium-glow-silver);
}
```

### Tercer Lugar

```css
.podium-place.third {
  order: 3;
  border-color: var(--ranking-bronze);
}

.podium-place.third:hover {
  box-shadow: var(--podium-glow-bronze);
}
```

### Corona del Primer Lugar

```css
.podium-crown {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  color: var(--ranking-gold);
  animation: crownFloat 2s ease-in-out infinite;
}

@keyframes crownFloat {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-5px);
  }
}
```

### Avatar del Podio

```css
.podium-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 10px;
  border: 2px solid var(--border-primary);
}

.podium-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### Información del Podio

```css
.podium-info h3 {
  color: var(--text-primary);
  margin-bottom: 5px;
  font-size: 0.9rem;
  font-weight: 600;
}

.podium-info p {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.8rem;
}
```

### Número de Posición

```css
.podium-rank {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 25px;
  height: 25px;
  background: var(--text-accent);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.podium-place.first .podium-rank {
  background: var(--ranking-gold);
  color: #000;
}

.podium-place.second .podium-rank {
  background: var(--ranking-silver);
  color: #000;
}

.podium-place.third .podium-rank {
  background: var(--ranking-bronze);
  color: #fff;
}
```

---

## 📊 Tabla de Jugadores

### Header de la Sección

```css
.ranking-header-section {
  background: var(--surface-primary);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--border-primary);
  border-radius: 20px 20px 0 0;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.ranking-header-section h2 {
  color: var(--text-accent);
  margin: 0;
  font-size: 1.4rem;
}
```

### Información de Temporada

```css
.season-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 15px;
  padding: 8px 12px;
  font-size: 0.9rem;
  color: var(--text-accent);
  font-weight: 600;
}
```

### Leyenda de Zonas

```css
.promotion-relegation-legend {
  background: var(--surface-primary);
  border-left: 1px solid var(--border-primary);
  border-right: 1px solid var(--border-primary);
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-item.promotion .legend-color {
  background: var(--promotion-color);
}

.legend-item.safe .legend-color {
  background: var(--safe-color);
}

.legend-item.relegation .legend-color {
  background: var(--relegation-color);
}
```

### Contenedor de la Tabla

```css
.players-table {
  background: var(--surface-primary);
  backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--border-primary);
  border-radius: 0 0 20px 20px;
  border-top: none;
  overflow: hidden;
}
```

### Header de la Tabla

```css
.players-table-header {
  background: var(--surface-secondary);
  border-bottom: 1px solid var(--border-secondary);
  padding: 15px 20px;
  display: grid;
  grid-template-columns: 60px 1fr 200px 80px;
  gap: 15px;
  align-items: center;
  font-weight: 700;
  color: var(--text-accent);
  font-size: 0.9rem;
}
```

### Body de la Tabla

```css
.players-table-body {
  max-height: 600px;
  overflow-y: auto;
}
```

### Fila de Jugador

```css
.player-row {
  display: grid;
  grid-template-columns: 60px 1fr 200px 80px;
  gap: 15px;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-secondary);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.player-row:last-child {
  border-bottom: none;
}

.player-row:hover {
  background: var(--surface-secondary);
}
```

### Zonas de Promoción/Descenso

```css
.player-row.promotion-zone {
  border-left: 4px solid var(--promotion-color);
  background: var(--promotion-bg);
}

.player-row.safe-zone {
  border-left: 4px solid var(--safe-color);
  background: var(--safe-bg);
}

.player-row.relegation-zone {
  border-left: 4px solid var(--relegation-color);
  background: var(--relegation-bg);
}

.player-row.current-player {
  background: rgba(255, 215, 0, 0.15);
  border: 2px solid rgba(255, 215, 0, 0.5);
  font-weight: 600;
}
```

### Posición del Jugador

```css
.player-position {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.position-number {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.position-trophy {
  font-size: 1rem;
}

.position-trophy.trophy-1 {
  color: var(--ranking-gold);
}

.position-trophy.trophy-2 {
  color: var(--ranking-silver);
}

.position-trophy.trophy-3 {
  color: var(--ranking-bronze);
}
```

### Información del Jugador

```css
.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.player-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border-primary);
  position: relative;
  flex-shrink: 0;
}

.player-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.real-player-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  background: var(--promotion-color);
  border-radius: 50%;
  border: 2px solid var(--surface-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.6rem;
}
```

### Detalles del Jugador

```css
.player-details {
  flex: 1;
  min-width: 0;
}

.player-name {
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 3px;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-level {
  color: var(--text-secondary);
  font-size: 0.8rem;
}
```

### Estadísticas del Jugador

```css
.player-stats {
  display: flex;
  gap: 15px;
  align-items: center;
}

.player-stats .stat-item {
  text-align: center;
  background: none;
  border: none;
  padding: 0;
}

.player-stats .stat-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.player-stats .stat-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.player-score {
  color: var(--text-accent);
  font-weight: 700;
  font-size: 1.1rem;
  text-align: center;
}
```

### Estado de Carga

```css
.loading-players {
  padding: 40px;
  text-align: center;
  color: var(--text-secondary);
}

.loading-players i {
  font-size: 2rem;
  margin-bottom: 15px;
  animation: spin 1s linear infinite;
}
```

---

## 🔍 Modal de Perfil de Jugador

### Contenedor del Modal

```css
.player-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.player-modal.show {
  opacity: 1;
  visibility: visible;
}
```

### Overlay del Modal

```css
.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
}
```

### Contenido del Modal

```css
.player-modal-content {
  background: var(--surface-primary);
  border: 1px solid var(--border-primary);
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  z-index: 1001;
  box-shadow: var(--shadow-primary);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    transform: scale(0.8) translateY(-50px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
```

### Header del Modal

```css
.player-profile-header {
  background: var(--surface-secondary);
  border-bottom: 1px solid var(--border-secondary);
  padding: 25px;
  text-align: center;
  position: relative;
  border-radius: 20px 20px 0 0;
}
```

### Botón de Cerrar

```css
.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: var(--surface-primary);
  border: 1px solid var(--border-primary);
  border-radius: 50%;
  width: 35px;
  height: 35px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: var(--text-accent);
  color: white;
  transform: scale(1.1);
}
```

### Avatar del Perfil

```css
.player-profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border-primary);
  margin: 0 auto 15px;
  position: relative;
}

.player-profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### Badges del Perfil

```css
.bot-badge,
.real-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
}

.bot-badge {
  background: var(--text-secondary);
}

.real-badge {
  background: var(--promotion-color);
}
```

### Información del Perfil

```css
.player-profile-info h2 {
  color: var(--text-accent);
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.player-position-badge {
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 15px;
  padding: 6px 12px;
  display: inline-block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--text-accent);
  font-weight: 600;
}

.player-level-badge {
  background: var(--surface-primary);
  border: 1px solid var(--border-primary);
  border-radius: 15px;
  padding: 6px 12px;
  display: inline-block;
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 600;
}
```

### Contenido del Perfil
```css
.player-profile-content {
    padding: 25px;
}

.profile-section {
   