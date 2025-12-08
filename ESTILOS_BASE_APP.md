# Estilos Base de la Aplicación - Quiz Cristiano

## 📋 Índice

1. [Variables CSS y Sistema de Temas](#variables-css-y-sistema-de-temas)
2. [Estructura Base](#estructura-base)
3. [Header y Navegación](#header-y-navegación)
4. [Componentes Principales](#componentes-principales)
5. [Sistema de Colores](#sistema-de-colores)
6. [Responsive Design](#responsive-design)

---

## 🎨 Variables CSS y Sistema de Temas

### Tema Claro (Por Defecto)

```css
:root {
  /* Fondos */
  --bg-primary: linear-gradient(135deg, #1e3c8a 0%, #142864 50%, #0f1940 100%);
  --bg-image: url("../../assets/images/fondo.png");
  --bg-overlay: rgba(30, 60, 138, 0.57);

  /* Textos */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.8);
  --text-accent: #ffd700;

  /* Superficies */
  --surface-primary: rgba(255, 255, 255, 0.1);
  --surface-secondary: rgba(255, 255, 255, 0.15);
  --surface-accent: rgba(255, 255, 255, 0.2);

  /* Bordes */
  --border-primary: rgba(255, 255, 255, 0.2);
  --border-secondary: rgba(255, 255, 255, 0.1);

  /* Sombras */
  --shadow-primary: 0 8px 20px rgba(0, 0, 0, 0.3);
  --shadow-secondary: 0 5px 15px rgba(0, 0, 0, 0.2);

  /* Efectos */
  --backdrop-blur: blur(20px);

  /* Colores de Estado */
  --success: #27ae60;
  --warning: #f39c12;
  --error: #e74c3c;
  --info: #3498db;
}
```

### Tema Oscuro

```css
[data-theme="dark"] {
  --bg-primary: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%);
  --bg-image: url("../../assets/images/fondo-black.png");
  --bg-overlay: rgba(0, 0, 0, 0.8);

  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-accent: #ffd700;

  --surface-primary: rgba(255, 255, 255, 0.05);
  --surface-secondary: rgba(255, 255, 255, 0.08);
  --surface-accent: rgba(255, 255, 255, 0.12);

  --border-primary: rgba(255, 255, 255, 0.1);
  --border-secondary: rgba(255, 255, 255, 0.05);

  --shadow-primary: 0 8px 20px rgba(0, 0, 0, 0.6);
  --shadow-secondary: 0 5px 15px rgba(0, 0, 0, 0.4);

  --backdrop-blur: blur(25px);
}
```

---

## 🏗️ Estructura Base

### Reset y Base

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Lato", Arial, sans-serif;
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  min-height: 100vh;
  color: var(--text-primary);
  overflow-x: hidden;
  position: relative;
}

.container {
  min-height: 100vh;
  padding-bottom: 100px;
  position: relative;
}
```

---

## 📱 Header y Navegación

### Header Principal

```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 20px;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  position: relative;
}

[data-theme="dark"] .header {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}
```

### Botón de Menú

```css
.menu-toggle {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

[data-theme="dark"] .menu-toggle {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

.menu-toggle:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}
```

### Logo

```css
.logo-title {
  font-family: "Cinzel", serif;
  font-size: 1.9rem;
  color: #ffd700;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-weight: 700;
}
```

### Display de Monedas

```css
.coins-display {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 215, 0, 0.2);
  padding: 10px 18px;
  border-radius: 25px;
  border: 1px solid rgba(255, 215, 0, 0.3);
  font-weight: 600;
  color: #ffd700;
  font-size: 1.1rem;
}

.coins-display i {
  font-size: 1.3rem;
}
```

---

## 🎯 Menú Dropdown

### Estructura del Menú

```css
.dropdown-menu {
  position: fixed;
  top: 0;
  left: -50%;
  width: 50%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  transition: left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .dropdown-menu {
  background: rgba(0, 0, 0, 0.9);
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.6);
}

.dropdown-menu.show {
  left: 0;
}
```

### Header del Menú

```css
.dropdown-header {
  padding: 30px 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.dropdown-header h3 {
  font-size: 1.5rem;
  color: #fff;
  margin-bottom: 5px;
  font-weight: 700;
}

.dropdown-header p {
  font-size: 0.9rem;
  opacity: 0.7;
  color: #fff;
}
```

### Botón de Cerrar

```css
.dropdown-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropdown-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}
```

### Items del Menú

```css
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 25px;
  color: #fff;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0;
  cursor: pointer;
  user-select: none;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.dropdown-item:active {
  transform: scale(0.98);
}

.dropdown-item i {
  width: 20px;
  text-align: center;
  font-size: 1.1rem;
}
```

### Overlay del Menú

```css
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1999;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.menu-overlay.show {
  opacity: 1;
  visibility: visible;
}
```

---

## 🎭 Sección de Mascota

### Contenedor de Mascota

```css
.mascot-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px 20px;
  text-align: center;
}

.mascot-container {
  position: relative;
  margin-bottom: 20px;
  cursor: pointer;
}

.mascot-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #ffd700;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.mascot-image:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 40px rgba(255, 215, 0, 0.3);
}
```

### Burbuja de Diálogo

```css
.speech-bubble {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 15px 20px;
  margin-top: 20px;
  position: relative;
  max-width: 300px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

[data-theme="dark"] .speech-bubble {
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.speech-bubble.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.speech-bubble::before {
  content: "";
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid rgba(0, 0, 0, 0.7);
}

.speech-text {
  font-size: 1rem;
  line-height: 1.4;
  color: #fff;
  font-weight: 500;
}
```

---

## 🎮 Botones Principales

### Contenedor de Botones

```css
.main-buttons {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 30px 20px;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
}
```

### Estilo Base de Botones

```css
.game-button {
  padding: 25px 35px;
  border: none;
  border-radius: 18px;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  position: relative;
  overflow: hidden;
  min-height: 70px;
}

.game-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.game-button:hover::before {
  left: 100%;
}

.game-button i {
  font-size: 1.5rem;
}
```

### Botón Modo Individual

```css
.single-player {
  background: linear-gradient(135deg, #3a86ff, #2563eb);
  color: white;
  box-shadow: 0 6px 18px rgba(58, 134, 255, 0.3);
}

.single-player:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(58, 134, 255, 0.4);
}
```

### Botón Multijugador

```css
.multiplayer {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 0 6px 18px rgba(139, 92, 246, 0.3);
}

.multiplayer:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
}
```

---

## 📊 Estadísticas del Jugador

### Contenedor de Estadísticas

```css
.player-stats {
  display: flex;
  justify-content: space-around;
  margin: 30px 20px;
  padding: 25px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
}

[data-theme="dark"] .player-stats {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}
```

### Items de Estadística

```css
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  flex: 1;
}

.stat-icon {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: #ffd700;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: bold;
  color: #fff;
}

.stat-label {
  font-size: 0.9rem;
  color: #fff;
  opacity: 0.7;
  font-weight: 500;
}
```

---

## 🔽 Navegación Inferior

### Bottom Navigation

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 0;
  z-index: 100;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"] .bottom-nav {
  background: rgba(0, 0, 0, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
}
```

### Items de Navegación

```css
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #fff;
  font-size: 0.75rem;
  padding: 8px 12px;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-weight: 500;
  min-width: 60px;
}

.nav-item:hover,
.nav-item.active {
  color: #3a86ff;
  background: rgba(58, 134, 255, 0.2);
  transform: translateY(-2px);
}

.nav-item i {
  font-size: 1.2rem;
  margin-bottom: 4px;
}

.nav-item span {
  font-size: 0.7rem;
}
```

### Botón de Play Central

```css
.play-button {
  position: relative;
  background: linear-gradient(135deg, #ffd700, #f39c12);
  border-radius: 50%;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
  margin-top: -10px;
}

.play-button:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 12px 30px rgba(255, 215, 0, 0.5);
  color: #2c3e50;
}

.play-button i {
  font-size: 2rem;
  color: #2c3e50;
}

.play-circle {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  animation: playPulse 2s infinite;
}

@keyframes playPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
}
```

---

## 🎨 Sistema de Colores

### Colores Principales

| Uso            | Color | Código    |
| -------------- | ----- | --------- |
| Acento/Dorado  | 🟡    | `#ffd700` |
| Azul Principal | 🔵    | `#3a86ff` |
| Azul Oscuro    | 🔵    | `#2563eb` |
| Morado         | 🟣    | `#8b5cf6` |
| Blanco         | ⚪    | `#ffffff` |

### Colores de Estado

| Estado      | Color | Código    |
| ----------- | ----- | --------- |
| Éxito       | 🟢    | `#27ae60` |
| Advertencia | 🟠    | `#f39c12` |
| Error       | 🔴    | `#e74c3c` |
| Info        | 🔵    | `#3498db` |

### Gradientes

```css
/* Azul Principal */
background: linear-gradient(135deg, #3a86ff, #2563eb);

/* Morado */
background: linear-gradient(135deg, #8b5cf6, #7c3aed);

/* Dorado */
background: linear-gradient(135deg, #ffd700, #f39c12);

/* Fondo Claro */
background: linear-gradient(135deg, #1e3c8a 0%, #142864 50%, #0f1940 100%);

/* Fondo Oscuro */
background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2d2d2d 100%);
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Móviles */
@media (max-width: 768px) {
  .dropdown-menu {
    width: 80%;
    left: -80%;
  }

  .header {
    margin: 10px;
    padding: 15px;
  }

  .logo-title {
    font-size: 1.6rem;
  }

  .mascot-image {
    width: 120px;
    height: 120px;
  }

  .main-buttons {
    margin: 20px 15px;
    max-width: none;
  }

  .player-stats {
    margin: 20px 15px;
    max-width: none;
  }

  .speech-bubble {
    max-width: 250px;
    padding: 12px 16px;
  }

  .dropdown-close {
    top: 15px;
    right: 15px;
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .dropdown-item {
    padding: 12px 20px;
    font-size: 0.95rem;
  }
}
```

---

## ✨ Efectos y Animaciones

### Transiciones Globales

```css
* {
  transition: background-color 0.3s ease, border-color 0.3s ease,
    color 0.3s ease, box-shadow 0.3s ease;
}
```

### Efecto Glassmorphism

```css
/* Aplicado a superficies principales */
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
```

### Hover Effects

```css
/* Botones */
.game-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(58, 134, 255, 0.4);
}

/* Items de menú */
.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

/* Navegación */
.nav-item:hover {
  color: #3a86ff;
  background: rgba(58, 134, 255, 0.2);
  transform: translateY(-2px);
}
```

---

## 🔧 Utilidades CSS

### Clases de Texto

```css
.text-primary {
  color: var(--text-primary);
}
.text-secondary {
  color: var(--text-secondary);
}
.text-accent {
  color: var(--text-accent);
}
```

### Clases de Fondo

```css
.bg-primary {
  background: var(--surface-primary);
}
.bg-secondary {
  background: var(--surface-secondary);
}
.bg-accent {
  background: var(--surface-accent);
}
```

### Clases de Sombra

```css
.shadow-primary {
  box-shadow: var(--shadow-primary);
}
.shadow-secondary {
  box-shadow: var(--shadow-secondary);
}
```

---

## 📝 Tipografía

### Fuentes

```css
/* Principal */
font-family: "Lato", Arial, sans-serif;

/* Títulos especiales */
font-family: "Cinzel", serif;
```

### Tamaños de Texto

| Elemento            | Tamaño  |
| ------------------- | ------- |
| Logo                | 1.9rem  |
| Botones principales | 1.3rem  |
| Texto normal        | 1rem    |
| Texto pequeño       | 0.9rem  |
| Navegación          | 0.75rem |

---

## 🎯 Mejores Prácticas

### 1. Usar Variables CSS

```css
/* ✅ Correcto */
background: var(--surface-primary);
color: var(--text-primary);

/* ❌ Evitar */
background: rgba(255, 255, 255, 0.1);
color: #ffffff;
```

### 2. Aplicar Backdrop Filter

```css
/* Para efecto glassmorphism */
backdrop-filter: var(--backdrop-blur);
-webkit-backdrop-filter: var(--backdrop-blur);
```

### 3. Transiciones Suaves

```css
transition: all 0.3s ease;
```

### 4. Responsive First

```css
/* Diseñar primero para móvil */
.element {
  width: 100%;
}

@media (min-width: 768px) {
  .element {
    width: 450px;
  }
}
```

---

## 🔍 Estructura de Archivos CSS

```
css/
├── pages/
│   ├── dark-mode.css          # Sistema de temas
│   ├── safari-fixes.css       # Correcciones para Safari
│   ├── single-player-new.css  # Estilos del modo individual
│   └── ...
└── ...
```

---

## 🎨 Paleta de Colores Completa

### Azules

- `#3a86ff` - Azul principal
- `#2563eb` - Azul hover
- `#1d4ed8` - Azul oscuro
- `#1e3c8a` - Azul fondo claro

### Morados

- `#8b5cf6` - Morado principal
- `#7c3aed` - Morado hover
- `#6d28d9` - Morado oscuro

### Dorados

- `#ffd700` - Dorado principal
- `#f39c12` - Dorado oscuro

### Grises/Negros

- `#0a0a0a` - Negro puro
- `#1a1a1a` - Negro medio
- `#2d2d2d` - Gris oscuro
- `#2c3e50` - Gris azulado

---

## 📚 Recursos Adicionales

### Fuentes Utilizadas

- **Lato**: https://fonts.google.com/specimen/Lato
- **Cinzel**: https://fonts.google.com/specimen/Cinzel

### Iconos

- **Font Awesome 6.5.0**: https://fontawesome.com/

### Imágenes de Fondo

- `assets/images/fondo.png` - Tema claro
- `assets/images/fondo-black.png` - Tema oscuro

---

Este documento contiene todos los estilos base de la pantalla principal de Quiz Cristiano, incluyendo el sistema de temas, componentes principales, y mejores prácticas de diseño.
