# Lógica del Modo Individual - Quiz Cristiano

## 📋 Índice

1. [Estructura General](#estructura-general)
2. [Configuración y Constantes](#configuración-y-constantes)
3. [Flujo del Juego](#flujo-del-juego)
4. [Sistema de Preguntas](#sistema-de-preguntas)
5. [Sistema de Categorías](#sistema-de-categorías)
6. [Sistema de Repechaje](#sistema-de-repechaje)
7. [Sistema de Monedas](#sistema-de-monedas)
8. [Power-ups](#power-ups)
9. [Gestión de Datos](#gestión-de-datos)

---

## 🎮 Estructura General

### Archivos Principales

- **HTML**: `single-player-new.html`
- **JavaScript**: `js/pages/single-player-new.js`
- **CSS**: `css/pages/single-player-new.css`
- **Gestión de Datos**: `js/modules/gamedatamanager.js`
- **Preguntas**: `data/questions.json`

---

## ⚙️ Configuración y Constantes

### Categorías Disponibles

```javascript
const CATEGORIES = [
  {
    id: "antiguo-testamento",
    name: "Antiguo Testamento",
    icon: "fa-book-open",
    color: "#8B4513",
  },
  {
    id: "nuevo-testamento",
    name: "Nuevo Testamento",
    icon: "fa-cross",
    color: "#4169E1",
  },
  {
    id: "personajes",
    name: "Personajes Bíblicos",
    icon: "fa-users",
    color: "#32CD32",
  },
  {
    id: "geografia",
    name: "Geografía Bíblica",
    icon: "fa-map",
    color: "#FF6347",
  },
];
```

### Configuración de Categorías

```javascript
const CATEGORY_CONFIG = {
  questionsPerCategory: 3, // 3 preguntas por categoría
  minCorrectToWin: 3, // 3 correctas = victoria inmediata
  correctForRepechage: 2, // 2 correctas = repechaje
  maxIncorrectBeforeGameOver: 2, // 2 incorrectas = game over
};
```

### Sistema de Recompensas

```javascript
const COIN_REWARDS = {
  categoryCorrect: 4, // Por respuesta correcta
  categoryComplete: 15, // Por completar categoría
  rescueSuccess: 8, // Por repechaje exitoso
  gameComplete: 70, // Por completar el juego
  perfectGame: 100, // Por juego perfecto
  speedBonus: 8, // Por responder rápido (<10s)
  wrongAnswer: -8, // Penalización por error
  timeoutPenalty: -4, // Penalización por timeout
};
```

---

## 🎯 Flujo del Juego

### 1. Pantalla de Bienvenida

- Muestra la mascota "Joy"
- Información sobre las 6 categorías bíblicas
- Botón "Comenzar Aventura"

### 2. Fase Inicial (3 Preguntas Aleatorias)

**Objetivo**: Determinar si el jugador puede elegir categorías o se le asigna una aleatoria

**Reglas**:

- Se presentan 3 preguntas aleatorias de cualquier categoría
- Cada pregunta tiene 20 segundos para responder
- El jugador puede fallar máximo 1 pregunta

**Resultados posibles**:

- **3 correctas**: Puede elegir cualquier categoría disponible
- **2 correctas**: Se le asigna una categoría aleatoria
- **0-1 correctas**: Game Over

**Código clave**:

```javascript
function evaluateInitialPhase() {
  if (gameState.initialCorrectAnswers >= 3) {
    showCategorySelection(); // Puede elegir
  } else if (gameState.initialCorrectAnswers === 2) {
    showRandomCategoryModal(); // Categoría aleatoria
  } else {
    showGameOver("Necesitas al menos 2 respuestas correctas");
  }
}
```

### 3. Fase de Categorías

**Objetivo**: Completar las 4 categorías disponibles

**Por cada categoría**:

- Se presentan 3 preguntas de la categoría seleccionada
- Cada pregunta tiene 20 segundos
- El jugador puede fallar máximo 1 pregunta

**Resultados posibles por categoría**:

- **3 correctas**: Categoría completada ✅
- **2 correctas**: Pregunta de repechaje 🆘
- **2 incorrectas**: Game Over ❌

### 4. Sistema de Repechaje

**Cuándo se activa**: Cuando el jugador responde 2 de 3 preguntas correctamente

**Características**:

- Se presenta 1 pregunta adicional de la misma categoría
- Tiempo extendido: 30 segundos (en lugar de 20)
- Si acierta: Categoría completada
- Si falla: Game Over

**Código clave**:

```javascript
function evaluateCategoryPhase() {
  const correctas = gameState.categoryCorrectAnswers;

  if (correctas === 3) {
    completeCategory(); // Victoria directa
  } else if (correctas === 2) {
    startRepechageQuestion(); // Repechaje
  } else {
    showGameOver("Necesitas al menos 2 respuestas correctas");
  }
}
```

### 5. Victoria o Game Over

**Victoria**: Se alcanza al completar las 4 categorías
**Game Over**: Se alcanza al:

- Fallar 2 preguntas en fase inicial
- Fallar 2 preguntas en una categoría
- Fallar la pregunta de repechaje

---

## 📚 Sistema de Preguntas

### Estructura de una Pregunta

```javascript
{
    id: "unique_id",
    category: "antiguo-testamento",
    text: "¿Pregunta?",
    options: ["Opción A", "Opción B", "Opción C", "Opción D"],
    correctIndex: 0,  // Índice de la respuesta correcta (0-3)
    difficulty: "fácil",
    reference: "Génesis 1:1"
}
```

### Carga de Preguntas

```javascript
async function loadQuestions() {
  const response = await fetch("./data/questions.json?" + Date.now());
  const data = await response.json();

  // Validar preguntas
  const validQuestions = data.filter((item) => {
    return (
      item &&
      typeof item.text === "string" &&
      Array.isArray(item.options) &&
      item.options.length === 4 &&
      typeof item.correctIndex === "number" &&
      item.correctIndex >= 0 &&
      item.correctIndex < 4 &&
      typeof item.category === "string"
    );
  });

  allQuestions = validQuestions;
}
```

### Preguntas Iniciales Aleatorias

```javascript
function getRandomInitialQuestions() {
  const randomQuestions = [];
  const availableQuestions = [...allQuestions];

  // Seleccionar 8 preguntas aleatorias
  for (let i = 0; i < 8 && availableQuestions.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    randomQuestions.push(availableQuestions[randomIndex]);
    availableQuestions.splice(randomIndex, 1);
  }

  return randomQuestions;
}
```

### Preguntas por Categoría

```javascript
function loadCategoryQuestions(categoryId) {
  const categoryQuestions = allQuestions.filter(
    (q) => q.category === categoryId
  );

  // Mezclar y tomar solo 3 preguntas
  const shuffled = [...categoryQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  gameState.categoryQuestions = shuffled.slice(0, 3);
}
```

---

## 🎲 Sistema de Categorías

### Selección de Categorías

Después de la fase inicial, el jugador puede:

1. **Elegir libremente** (si respondió 3/3 correctas)
2. **Recibir categoría aleatoria** (si respondió 2/3 correctas)

### Progreso de Categorías

```javascript
gameState = {
  completedCategories: [], // Categorías completadas
  pendingCategories: [...CATEGORIES], // Categorías pendientes
  currentCategory: "", // Categoría actual
  categoryQuestionIndex: 0, // Índice de pregunta actual
  categoryCorrectAnswers: 0, // Respuestas correctas
  categoryIncorrectAnswers: 0, // Respuestas incorrectas
};
```

### Completar Categoría

```javascript
function completeCategory() {
  // Agregar a completadas
  gameState.completedCategories.push(gameState.currentCategory);

  // Remover de pendientes
  gameState.pendingCategories = gameState.pendingCategories.filter(
    (cat) => cat.id !== gameState.currentCategory
  );

  // Recompensa
  const categoryBonus = COIN_REWARDS.categoryComplete;
  window.GameDataManager.addCoins(categoryBonus, "category_complete");

  // Verificar victoria total
  if (gameState.completedCategories.length >= CATEGORIES.length) {
    showVictory();
  } else {
    showCategorySelection();
  }
}
```

---

## 🆘 Sistema de Repechaje

### Activación del Repechaje

El repechaje se activa cuando:

- El jugador responde **2 de 3** preguntas correctamente en una categoría
- Aún no ha fallado 2 preguntas

### Características del Repechaje

```javascript
function startRepechageQuestion() {
  gameState.phase = "repechage";

  // Buscar pregunta de repechaje (diferente a las ya respondidas)
  const repechageQuestions = allQuestions.filter(
    (q) =>
      q.category === gameState.currentCategory &&
      !gameState.categoryQuestions.some((cq) => cq.id === q.id)
  );

  // Seleccionar pregunta aleatoria
  const randomIndex = Math.floor(Math.random() * repechageQuestions.length);
  gameState.currentQuestion = repechageQuestions[randomIndex];

  // Tiempo extendido: 30 segundos
  startTimer(30, () => {
    handleRepechageAnswer(false, -1, false);
  });
}
```

### Manejo de Respuesta de Repechaje

```javascript
function handleRepechageAnswer(isCorrect, selectedIndex, speedBonus) {
  if (isCorrect) {
    gameState.categoryCorrectAnswers++;

    const coinsEarned =
      COIN_REWARDS.rescueSuccess + (speedBonus ? COIN_REWARDS.speedBonus : 0);
    window.GameDataManager.addCoins(coinsEarned, "repechage_success");

    showNotification(`¡Repechaje exitoso! +${coinsEarned} monedas`, "success");
    completeCategory();
  } else {
    showGameOver("No lograste aprobar el repechaje de la categoría");
  }
}
```

---

## 💰 Sistema de Monedas

### Recompensas

| Acción                    | Monedas |
| ------------------------- | ------- |
| Respuesta correcta        | +4      |
| Bonus de velocidad (<10s) | +8      |
| Completar categoría       | +15     |
| Repechaje exitoso         | +8      |
| Completar juego           | +70     |
| Juego perfecto            | +100    |

### Penalizaciones

| Acción               | Monedas |
| -------------------- | ------- |
| Respuesta incorrecta | -8      |
| Timeout              | -4      |

### Gestión de Monedas

```javascript
// Añadir monedas
window.GameDataManager.addCoins(amount, reason);

// Gastar monedas
window.GameDataManager.spendCoins(amount, reason);

// Obtener monedas actuales
const coins = window.GameDataManager.getCoins();
```

### Ejemplo de Recompensa

```javascript
function handleCategoryAnswer(isCorrect, selectedIndex, speedBonus) {
  if (isCorrect) {
    const coinsEarned =
      COIN_REWARDS.categoryCorrect + (speedBonus ? COIN_REWARDS.speedBonus : 0);
    window.GameDataManager.addCoins(coinsEarned, "category_correct");
    showNotification(`¡Correcto! +${coinsEarned} monedas`, "success");
  } else {
    const coinsPenalty = Math.abs(COIN_REWARDS.wrongAnswer);
    window.GameDataManager.spendCoins(coinsPenalty, "category_wrong");
    showNotification(`Incorrecto. -${coinsPenalty} monedas`, "error");
  }
}
```

---

## ⚡ Power-ups

### Tipos de Power-ups

```javascript
const POWERUPS = {
  eliminate: {
    name: "Eliminar Opciones",
    icon: "fa-eraser",
    description: "Elimina 2 opciones incorrectas",
  },
  timeExtender: {
    name: "Tiempo Extra",
    icon: "fa-clock",
    description: "Añade 15 segundos al temporizador",
  },
  secondChance: {
    name: "Segunda Oportunidad",
    icon: "fa-heart",
    description: "Permite un error adicional",
  },
};
```

### Uso de Power-ups

```javascript
window.usePowerup = function (powerupType) {
  if (!window.GameDataManager.getPowerupCount(powerupType)) {
    showNotification("No tienes este power-up", "error");
    return;
  }

  switch (powerupType) {
    case "eliminate":
      eliminateOptions();
      break;
    case "timeExtender":
      extendTime();
      break;
    case "secondChance":
      activateSecondChance();
      break;
  }
};
```

### Eliminar Opciones

```javascript
function eliminateOptions() {
  const buttons = elements.answersContainer.querySelectorAll(
    ".answer-btn:not(.eliminated)"
  );
  const correctIndex = gameState.currentQuestion.correctIndex;

  // Encontrar opciones incorrectas
  const incorrectButtons = Array.from(buttons).filter(
    (button, index) => index !== correctIndex
  );

  // Eliminar 2 opciones incorrectas aleatoriamente
  for (let i = 0; i < 2 && incorrectButtons.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * incorrectButtons.length);
    const button = incorrectButtons[randomIndex];
    button.classList.add("eliminated");
    button.disabled = true;
    incorrectButtons.splice(randomIndex, 1);
  }

  window.GameDataManager.usePowerup("eliminate", 1, "game_use");
  showNotification("2 opciones eliminadas", "info");
}
```

### Extender Tiempo

```javascript
function extendTime() {
  gameState.timer += 15;
  updateTimerDisplay(gameState.timer);

  window.GameDataManager.usePowerup("timeExtender", 1, "game_use");
  showNotification("+15 segundos", "info");
}
```

---

## 💾 Gestión de Datos

### GameDataManager

El `GameDataManager` es el módulo central que gestiona:

- Monedas del jugador
- Inventario de power-ups
- Estadísticas del juego
- Sincronización con Firebase

### Estructura de Datos

```javascript
gameData = {
  coins: 0,
  gamesPlayed: 0,
  victories: 0,
  perfectGames: 0,
  lastPlayDate: null,
  achievements: [],
  stats: {},
  settings: {
    theme: "light",
    soundEnabled: true,
    vibrationEnabled: true,
  },
};

inventory = {
  eliminate: 0,
  timeExtender: 0,
  secondChance: 0,
};
```

### Persistencia Local

```javascript
// Guardar datos
function saveAllData() {
  localStorage.setItem("quizCristianoData", JSON.stringify(this.gameData));
  localStorage.setItem(
    "quizCristianoInventory",
    JSON.stringify({
      powerups: this.inventory,
      lastUpdated: Date.now(),
    })
  );
}

// Cargar datos
function loadAllData() {
  const gameData = localStorage.getItem("quizCristianoData");
  if (gameData) {
    this.gameData = { ...this.gameData, ...JSON.parse(gameData) };
  }

  const inventoryData = localStorage.getItem("quizCristianoInventory");
  if (inventoryData) {
    const parsed = JSON.parse(inventoryData);
    this.inventory = { ...this.inventory, ...parsed.powerups };
  }
}
```

### Sincronización con Firebase

```javascript
async function syncWithFirebase() {
  const auth = this.getAuth();
  const saveFunction = this.getSaveFunction();

  if (!auth || !saveFunction || !auth.currentUser) {
    return false;
  }

  const syncData = {
    profile: {
      /* datos del perfil */
    },
    gameData: {
      coins: this.gameData.coins,
      gamesPlayed: this.gameData.gamesPlayed,
      victories: this.gameData.victories,
      perfectGames: this.gameData.perfectGames,
      lastPlayDate: Date.now(),
    },
    inventory: this.inventory,
  };

  const success = await saveFunction(auth.currentUser.uid, syncData);
  return success;
}
```

### Actualización de Estadísticas

```javascript
function updateGameStats(gameResult) {
  this.gameData.gamesPlayed++;

  if (gameResult.victory) {
    this.gameData.victories++;
  }

  if (gameResult.perfect) {
    this.gameData.perfectGames++;
  }

  if (gameResult.coinsEarned) {
    this.addCoins(gameResult.coinsEarned, "game_victory");
  }

  this.gameData.lastPlayDate = Date.now();
  this.saveAllData();
  this.safeSyncWithFirebase();
}
```

---

## 🎬 Flujo Completo del Juego

### Diagrama de Flujo

```
INICIO
  ↓
Pantalla de Bienvenida
  ↓
Fase Inicial (3 preguntas)
  ↓
  ├─ 3 correctas → Elegir Categoría
  ├─ 2 correctas → Categoría Aleatoria
  └─ 0-1 correctas → GAME OVER
  ↓
Fase de Categoría (3 preguntas)
  ↓
  ├─ 3 correctas → Categoría Completada
  ├─ 2 correctas → Repechaje
  │   ↓
  │   ├─ Acierta → Categoría Completada
  │   └─ Falla → GAME OVER
  └─ 2 incorrectas → GAME OVER
  ↓
¿Todas las categorías completadas?
  ├─ SÍ → VICTORIA
  └─ NO → Volver a Elegir Categoría
```

### Estado del Juego

```javascript
gameState = {
  phase: "welcome", // welcome, initial, category, repechage
  currentQuestionIndex: 0,
  initialCorrectAnswers: 0,
  completedCategories: [],
  pendingCategories: [...CATEGORIES],
  currentCategory: "",
  categoryQuestions: [],
  categoryQuestionIndex: 0,
  categoryCorrectAnswers: 0,
  categoryIncorrectAnswers: 0,
  needsRepechageQuestion: false,
  currentQuestion: null,
  isProcessingAnswer: false,
  timer: 20,
  timerInterval: null,
  questionStartTime: 0,
  perfectGame: true,
  hintsUsed: 0,
  totalCorrectAnswers: 0,
  totalQuestions: 0,
  selectedRandomCategory: null,
  hasSecondChance: false,
};
```

---

## 🔧 Funciones Principales

### Inicialización

```javascript
async function init() {
  await waitForGameDataManager();
  bindElements();
  setupGameDataListeners();
  await loadQuestions();
  updateAllDisplays();
}
```

### Iniciar Juego

```javascript
window.startGame = function () {
  // Reiniciar estado
  gameState = {
    /* estado inicial */
  };

  updatePhaseIndicator("Preguntas Iniciales");
  updateAllDisplays();
  showScreen("question-screen");
  loadInitialQuestion(0);
};
```

### Seleccionar Respuesta

```javascript
window.selectAnswer = function (selectedIndex) {
  if (gameState.isProcessingAnswer) return;

  gameState.isProcessingAnswer = true;
  stopTimer();

  const correctIndex = gameState.currentQuestion.correctIndex;
  const isCorrect = selectedIndex === correctIndex;
  const timeElapsed = (Date.now() - gameState.questionStartTime) / 1000;
  const speedBonus = timeElapsed < 10;

  markAnswers(selectedIndex, correctIndex);

  setTimeout(() => {
    if (gameState.phase === "initial") {
      handleInitialAnswer(isCorrect, selectedIndex, speedBonus);
    } else if (gameState.phase === "category") {
      handleCategoryAnswer(isCorrect, selectedIndex, speedBonus);
    } else if (gameState.phase === "repechage") {
      handleRepechageAnswer(isCorrect, selectedIndex, speedBonus);
    }
  }, 1500);
};
```

### Temporizador

```javascript
function startTimer(duration, callback) {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
  }

  gameState.timer = duration;
  gameState.questionStartTime = Date.now();
  updateTimerDisplay(gameState.timer);

  gameState.timerInterval = setInterval(() => {
    gameState.timer--;
    updateTimerDisplay(gameState.timer);

    if (gameState.timer <= 0) {
      clearInterval(gameState.timerInterval);
      if (callback) callback();
    }
  }, 1000);
}
```

---

## 📱 Interfaz de Usuario

### Pantallas del Juego

1. **welcome-screen**: Pantalla de bienvenida
2. **question-screen**: Pantalla de preguntas
3. **categories-screen**: Selección de categorías
4. **victory-screen**: Pantalla de victoria
5. **gameover-screen**: Pantalla de game over

### Elementos Principales

```javascript
elements = {
  welcomeScreen: document.getElementById("welcome-screen"),
  questionScreen: document.getElementById("question-screen"),
  categoriesScreen: document.getElementById("categories-screen"),
  victoryScreen: document.getElementById("victory-screen"),
  gameoverScreen: document.getElementById("gameover-screen"),
  timerSection: document.getElementById("timer-section"),
  timerNumber: document.getElementById("timer-number"),
  timerCircle: document.getElementById("timer-circle"),
  timerPhase: document.getElementById("timer-phase"),
  timerQuestion: document.getElementById("timer-question"),
  questionText: document.querySelector(".question-text"),
  bibleReference: document.getElementById("bible-reference"),
  answersContainer: document.getElementById("answers-container"),
  powerupsSection: document.getElementById("powerups-section"),
  phaseIndicator: document.getElementById("phase-indicator"),
};
```

### Actualización de Pantalla

```javascript
function showScreen(screenId) {
  const screens = [
    "welcome-screen",
    "question-screen",
    "categories-screen",
    "victory-screen",
    "gameover-screen",
  ];

  screens.forEach((id) => {
    const screen = document.getElementById(id);
    if (screen) {
      screen.classList.remove("active");
    }
  });

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add("active");
  }
}
```

---

## 🐛 Debugging

### Funciones de Debug

```javascript
// Ver estado del juego
window.debugGame = function () {
  console.log("Estado actual del juego:", gameState);
  console.log("Preguntas cargadas:", allQuestions.length);
  console.log("Monedas:", window.GameDataManager.getCoins());
};

// Forzar inicio del juego
window.forceStartGame = function () {
  window.startGame();
};

// Debug de preguntas
window.debugQuestions = function () {
  fetch("./data/questions.json?" + Date.now())
    .then((response) => response.json())
    .then((data) => {
      console.log("Total preguntas:", data.length);
      console.log("Primera pregunta:", data[0]);
      console.log("Categorías:", [...new Set(data.map((q) => q.category))]);
    });
};

// Debug de Firebase
window.debugFirebaseConnection = function () {
  console.log("Variables globales:", {
    firebaseAuth: !!window.firebaseAuth,
    saveUserDataToFirebase: !!window.saveUserDataToFirebase,
  });

  console.log("GameDataManager:", {
    existe: !!window.GameDataManager,
    firebaseReady: window.GameDataManager?.firebaseReady,
  });
};
```

---

## 📊 Resumen de Reglas

### Fase Inicial

- ✅ 3 preguntas aleatorias
- ✅ 20 segundos por pregunta
- ✅ Máximo 1 error permitido
- ✅ 3 correctas = Elegir categoría
- ✅ 2 correctas = Categoría aleatoria
- ❌ 0-1 correctas = Game Over

### Fase de Categoría

- ✅ 3 preguntas por categoría
- ✅ 20 segundos por pregunta
- ✅ Máximo 1 error permitido
- ✅ 3 correctas = Categoría completada
- ✅ 2 correctas = Repechaje
- ❌ 2 incorrectas = Game Over

### Repechaje

- ✅ 1 pregunta adicional
- ✅ 30 segundos (tiempo extendido)
- ✅ Acierta = Categoría completada
- ❌ Falla = Game Over

### Victoria

- ✅ Completar las 4 categorías
- ✅ Recompensa: 70 monedas
- ✅ Bonus perfecto: +100 monedas adicionales

---

## 🎯 Conclusión

El modo individual del Quiz Cristiano es un sistema completo que combina:

- **Mecánicas de juego** progresivas y desafiantes
- **Sistema de recompensas** equilibrado
- **Gestión de datos** robusta con sincronización Firebase
- **Interfaz intuitiva** con feedback visual constante
- **Sistema de repechaje** que da segundas oportunidades

El juego está diseñado para ser accesible pero desafiante, recompensando tanto el conocimiento bíblico como la velocidad de respuesta.
