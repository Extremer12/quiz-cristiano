# Estilos Completos del Menú Inferior - Quiz Cristiano

## 📋 Descripción General

El menú inferior (bottom navigation) es una barra de navegación fija en la parte inferior de la pantalla que permite acceso rápido a las secciones principales de la aplicación. Incluye un botón central de "Play" destacado con animación.

---

## 🎨 Estructura HTML

### Pantalla Principal (index.html)

```html
<!-- Bottom Navigation -->
<nav class="bottom-nav">
  <a href="store.html" class="nav-item">
    <i class="fas fa-store"></i>
    <span>Tienda</span>
  </a>
  <a href="ranking.html" class="nav-item">
    <i class="fas fa-trophy"></i>
    <span>Ranking</span>
  </a>
  <a href="single-player-new.html" class="nav-item play-button">
    <div class="play-circle"></div>
    <i class="fas fa-play"></i>
  </a>
  <a href="logros.html" class="nav-item">
    <i class="fas fa-medal"></i>
    <span>Logros</span>
  </a>
  <a href="mini-juego.html" class="nav-item">
    <i class="fas fa-book-open"></i>
    <span>Estudio</span>
  </a>
</nav>
```

### Otras Pantallas (Estructura Estándar)

```html
<!-- Bottom Navigation -->
<nav class="bottom-nav">
  <a href="index.html" class="nav-item">
    <i class="fas fa-home"></i>
    <span>Inicio</span>
  </a>
  <a href="single-player-new.html" class="nav-item active">
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
  <a href="store.html" class="nav-item">
    <i class="fas fa-store"></i>
    <span>Tienda</span>
  </a>
</nav>
```

---

## 💅 CSS Completo

### 1. Contenedor Principal (.bottom-nav)

```css
.bottom-nav {
  /* Posicionamiento */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;

  /* Layout */
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 0;

  /* Estilo Visual */
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
}
```

**Propiedades Explicadas:**

- `position: fixed` - Mantiene el menú siempre visible en la parte inferior
- `bottom: 0` - Ancla al fondo de la pantalla
- `z-index: 100` - Asegura que esté sobre otros elementos
- `backdrop-filter: blur(30px)` - Efecto glassmorphism (desenfoque del fondo)
- `box-shadow: 0 -4px 20px` - Sombra hacia arriba para dar profundidad

### 2. Tema Oscuro (.bottom-nav)

```css
[data-theme="dark"] .bottom-nav {
  background: rgba(0, 0, 0, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
}
```

**Cambios en Modo Oscuro:**

- Fondo más oscuro (0.8 vs 0.7 de opacidad)
- Borde más sutil (0.15 vs 0.2 de opacidad)
- Sombra más pronunciada (0.4 vs 0.2 de opacidad)

---

## 🔘 Items de Navegación (.nav-item)

### 3. Estilo Base

```css
.nav-item {
  /* Layout */
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;

  /* Espaciado */
  padding: 8px 12px;

  /* Estilo Visual */
  text-decoration: none;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 10px;

  /* Animación */
  transition: all 0.3s ease;
}
```

**Propiedades Explicadas:**

- `flex-direction: column` - Icono arriba, texto abajo
- `min-width: 60px` - Ancho mínimo para mantener consistencia
- `border-radius: 10px` - Bordes redondeados para el efecto hover
- `transition: all 0.3s ease` - Animación suave en todos los cambios

### 4. Estados Hover y Active

```css
.nav-item:hover,
.nav-item.active {
  color: #3a86ff;
  background: rgba(58, 134, 255, 0.2);
  transform: translateY(-2px);
}
```

**Efectos:**

- Cambia color a azul principal (#3a86ff)
- Fondo azul semi-transparente
- Se eleva 2px hacia arriba

### 5. Iconos (.nav-item i)

```css
.nav-item i {
  font-size: 1.2rem;
  margin-bottom: 4px;
}
```

**Propiedades:**

- Tamaño de icono: 1.2rem
- Separación del texto: 4px

### 6. Texto (.nav-item span)

```css
.nav-item span {
  font-size: 0.7rem;
}
```

**Propiedades:**

- Tamaño de texto: 0.7rem (más pequeño que el icono)

---

## ⭐ Botón de Play Central (.play-button)

### 7. Estilo Base del Botón de Play

```css
.play-button {
  /* Posicionamiento */
  position: relative;
  margin-top: -10px;

  /* Layout */
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Estilo Visual */
  background: linear-gradient(135deg, #ffd700, #f39c12);
  border-radius: 50%;
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
}
```

**Características Especiales:**

- `margin-top: -10px` - Sobresale del menú hacia arriba
- `width: 70px; height: 70px` - Más grande que otros items
- `border-radius: 50%` - Forma circular perfecta
- Gradiente dorado (#ffd700 → #f39c12)
- Sombra dorada brillante

### 8. Hover del Botón de Play

```css
.play-button:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 12px 30px rgba(255, 215, 0, 0.5);
  color: #2c3e50;
}
```

**Efectos Hover:**

- Se eleva 5px (más que otros items)
- Escala 1.05 (crece 5%)
- Sombra más grande y brillante
- Color del icono cambia a gris oscuro

### 9. Icono del Botón de Play

```css
.play-button i {
  font-size: 2rem;
  color: #2c3e50;
}
```

**Propiedades:**

- Tamaño: 2rem (mucho más grande que otros iconos)
- Color: Gris oscuro (#2c3e50) para contraste con fondo dorado

### 10. Ocultar Texto del Play

```css
.play-button span {
  display: none;
}
```

**Razón:**

- El botón de play no muestra texto, solo el icono

---

## 🌀 Animación del Círculo Pulsante (.play-circle)

### 11. Estructura del Círculo

```css
.play-circle {
  /* Posicionamiento */
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;

  /* Estilo Visual */
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 50%;

  /* Animación */
  animation: playPulse 2s infinite;
}
```

**Propiedades:**

- Posicionado absolutamente alrededor del botón
- 5px más grande en cada dirección
- Borde dorado semi-transparente
- Animación infinita de 2 segundos

### 12. Keyframes de la Animación

```css
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

**Efecto:**

- Inicia en tamaño normal (scale 1) y opacidad completa
- A la mitad crece 10% y se vuelve semi-transparente
- Regresa al estado inicial
- Crea efecto de "pulso" o "latido"

---

## 📱 Responsive Design

### 13. Ajustes para Móviles

```css
@media (max-width: 768px) {
  .bottom-nav {
    padding: 10px 0;
  }

  .nav-item {
    min-width: 50px;
    padding: 6px 8px;
    font-size: 0.65rem;
  }

  .nav-item i {
    font-size: 1.1rem;
    margin-bottom: 3px;
  }

  .nav-item span {
    font-size: 0.65rem;
  }

  .play-button {
    width: 60px;
    height: 60px;
    margin-top: -8px;
  }

  .play-button i {
    font-size: 1.8rem;
  }
}
```

**Ajustes en Móvil:**

- Padding reducido
- Items más pequeños (50px vs 60px)
- Texto e iconos más pequeños
- Botón de play reducido (60px vs 70px)

### 14. Ajustes para Tablets

```css
@media (min-width: 769px) and (max-width: 1024px) {
  .bottom-nav {
    padding: 14px 0;
  }

  .nav-item {
    min-width: 70px;
    padding: 10px 14px;
  }

  .play-button {
    width: 75px;
    height: 75px;
  }
}
```

---

## 🎨 Variantes de Tema

### 15. Modo Oscuro - Items de Navegación

```css
[data-theme="dark"] .nav-item {
  color: rgba(255, 255, 255, 0.7);
}

[data-theme="dark"] .nav-item:hover,
[data-theme="dark"] .nav-item.active {
  color: #3a86ff;
  background: rgba(58, 134, 255, 0.15);
}
```

**Diferencias en Modo Oscuro:**

- Color inicial más tenue (0.7 de opacidad)
- Fondo hover más sutil (0.15 vs 0.2)

### 16. Modo Oscuro - Botón de Play

```css
[data-theme="dark"] .play-button {
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.6);
}

[data-theme="dark"] .play-button:hover {
  box-shadow: 0 12px 30px rgba(255, 215, 0, 0.7);
}
```

**Diferencias:**

- Sombra más intensa en modo oscuro para mayor contraste

---

## 🔧 Utilidades y Helpers

### 17. Clase Active

```css
.nav-item.active {
  color: #3a86ff;
  background: rgba(58, 134, 255, 0.2);
  font-weight: 600;
}
```

**Uso:**

- Se aplica al item de la página actual
- Indica visualmente dónde está el usuario

### 18. Transiciones Globales

```css
.bottom-nav * {
  transition: all 0.3s ease;
}
```

**Efecto:**

- Todas las animaciones son suaves (0.3 segundos)

---

## 📊 Especificaciones Técnicas

### Dimensiones

| Elemento    | Ancho    | Alto | Padding  |
| ----------- | -------- | ---- | -------- |
| bottom-nav  | 100%     | auto | 12px 0   |
| nav-item    | 60px min | auto | 8px 12px |
| play-button | 70px     | 70px | -        |
| play-circle | 80px     | 80px | -        |

### Colores

| Elemento       | Color Normal      | Color Hover          | Color Active         |
| -------------- | ----------------- | -------------------- | -------------------- |
| nav-item       | #ffffff           | #3a86ff              | #3a86ff              |
| nav-item bg    | transparent       | rgba(58,134,255,0.2) | rgba(58,134,255,0.2) |
| play-button    | -                 | -                    | -                    |
| play-button bg | #ffd700 → #f39c12 | -                    | -                    |

### Animaciones

| Animación | Duración | Timing | Iteraciones |
| --------- | -------- | ------ | ----------- |
| playPulse | 2s       | ease   | infinite    |
| hover     | 0.3s     | ease   | 1           |
| active    | 0.3s     | ease   | 1           |

---

## 🎯 Iconos Utilizados (Font Awesome)

| Sección | Icono | Clase          |
| ------- | ----- | -------------- |
| Inicio  | 🏠    | `fa-home`      |
| Tienda  | 🏪    | `fa-store`     |
| Ranking | 🏆    | `fa-trophy`    |
| Play    | ▶️    | `fa-play`      |
| Logros  | 🏅    | `fa-medal`     |
| Estudio | 📖    | `fa-book-open` |

---

## 💡 Mejores Prácticas

### 1. Accesibilidad

```html
<nav class="bottom-nav" aria-label="Navegación principal">
  <a href="index.html" class="nav-item" aria-label="Ir a inicio">
    <i class="fas fa-home" aria-hidden="true"></i>
    <span>Inicio</span>
  </a>
</nav>
```

### 2. Estado Active

```javascript
// Marcar item activo según la página actual
document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split("/").pop();
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach((item) => {
    if (item.getAttribute("href") === currentPage) {
      item.classList.add("active");
    }
  });
});
```

### 3. Smooth Scroll

```css
html {
  scroll-behavior: smooth;
  scroll-padding-bottom: 80px; /* Altura del bottom-nav */
}
```

---

## 🐛 Solución de Problemas Comunes

### Problema 1: Menú Oculta Contenido

```css
/* Agregar padding al contenedor principal */
.container {
  padding-bottom: 100px; /* Altura del menú + margen */
}
```

### Problema 2: Backdrop Filter no Funciona en Safari

```css
.bottom-nav {
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px); /* Prefijo para Safari */
}
```

### Problema 3: Z-index Conflictos

```css
/* Asegurar que el menú esté sobre modales */
.bottom-nav {
  z-index: 100;
}

.modal {
  z-index: 1000; /* Mayor que bottom-nav */
}
```

---

## 📝 Código Completo Consolidado

```css
/* ============================================
   BOTTOM NAVIGATION - ESTILOS COMPLETOS
   ============================================ */

/* Contenedor Principal */
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

/* Items de Navegación */
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

/* Botón de Play Central */
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

.play-button span {
  display: none;
}

/* Círculo Animado */
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

/* Modo Oscuro - Ajustes */
[data-theme="dark"] .nav-item {
  color: rgba(255, 255, 255, 0.7);
}

[data-theme="dark"] .nav-item:hover,
[data-theme="dark"] .nav-item.active {
  color: #3a86ff;
  background: rgba(58, 134, 255, 0.15);
}

/* Responsive */
@media (max-width: 768px) {
  .bottom-nav {
    padding: 10px 0;
  }

  .nav-item {
    min-width: 50px;
    padding: 6px 8px;
    font-size: 0.65rem;
  }

  .nav-item i {
    font-size: 1.1rem;
    margin-bottom: 3px;
  }

  .play-button {
    width: 60px;
    height: 60px;
    margin-top: -8px;
  }

  .play-button i {
    font-size: 1.8rem;
  }
}
```

---

## 🎨 Ejemplo de Implementación Completa

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quiz Cristiano</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    />
    <style>
      /* Incluir todos los estilos del menú aquí */
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Contenido de la página -->

      <!-- Bottom Navigation -->
      <nav class="bottom-nav" aria-label="Navegación principal">
        <a href="store.html" class="nav-item">
          <i class="fas fa-store"></i>
          <span>Tienda</span>
        </a>
        <a href="ranking.html" class="nav-item">
          <i class="fas fa-trophy"></i>
          <span>Ranking</span>
        </a>
        <a href="single-player-new.html" class="nav-item play-button">
          <div class="play-circle"></div>
          <i class="fas fa-play"></i>
        </a>
        <a href="logros.html" class="nav-item">
          <i class="fas fa-medal"></i>
          <span>Logros</span>
        </a>
        <a href="mini-juego.html" class="nav-item">
          <i class="fas fa-book-open"></i>
          <span>Estudio</span>
        </a>
      </nav>
    </div>
  </body>
</html>
```

---

Este documento contiene todos los estilos completos del menú inferior de la pantalla inicial de Quiz Cristiano, incluyendo el botón de play central animado, estados hover/active, responsive design y variantes de tema.
