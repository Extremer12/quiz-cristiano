/**
 * ================================================
 * PERFIL SISTEMA COMPLETO - VERSIÓN CORREGIDA
 * Quiz Cristiano - Funcionalidad completa
 * ================================================
 */

// ==========================
// CONFIGURACIÓN Y DATOS
// ==========================

const DEFAULT_PROFILE = {
  username: "",
  displayName: "",
  favoriteVerse: "",
  currentAvatar: "assets/images/fotos-perfil/niña.jpg",
  level: 1,
  exp: 0,
  expToNext: 100,
};

const AVAILABLE_AVATARS = [
  {
    id: "nina",
    src: "assets/images/fotos-perfil/niña.jpg",
    name: "Niña",
    unlocked: true,
  },
  {
    id: "nino",
    src: "assets/images/fotos-perfil/niño.jpg",
    name: "Niño",
    unlocked: true,
  },
  {
    id: "oveja",
    src: "assets/images/fotos-perfil/oveja.jpg",
    name: "Oveja",
    unlocked: true,
  },
  {
    id: "paloma",
    src: "assets/images/fotos-perfil/paloma.jpg",
    name: "Paloma",
    unlocked: true,
  },
];

const LEVEL_NAMES = {
  1: {
    name: "Principiante",
    desc: "Comenzando tu camino espiritual",
    color: "#3498db",
  },
  2: {
    name: "Discípulo",
    desc: "Aprendiendo las enseñanzas",
    color: "#e74c3c",
  },
  3: { name: "Siervo", desc: "Sirviendo con dedicación", color: "#f39c12" },
  4: { name: "Maestro", desc: "Compartiendo sabiduría", color: "#27ae60" },
};

// Variables globales
let profile = { ...DEFAULT_PROFILE };
let hasUnsavedChanges = false;

// ==========================
// UTILIDADES
// ==========================

function saveProfileToStorage() {
  try {
    localStorage.setItem("quizCristianoProfile", JSON.stringify(profile));
    console.log("✅ Perfil guardado correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error guardando perfil:", error);
    showNotification("Error al guardar el perfil", "error");
    return false;
  }
}

function loadProfileFromStorage() {
  try {
    const data = localStorage.getItem("quizCristianoProfile");
    if (data) {
      profile = { ...DEFAULT_PROFILE, ...JSON.parse(data) };
      console.log("✅ Perfil cargado correctamente");
    } else {
      // Si no hay perfil guardado, usar datos del usuario actual
      console.log("ℹ️ No hay perfil guardado, usando datos del usuario actual");
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        profile.username = userData.username || "";
        profile.displayName = userData.displayName || "";
      }
    }
  } catch (error) {
    console.error("❌ Error cargando perfil:", error);
    profile = { ...DEFAULT_PROFILE };
  }
}

function showNotification(msg, type = "info") {
  // Remover notificación existente
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  const div = document.createElement("div");
  div.className = `notification notification-${type}`;
  div.innerHTML = `
        <span>${msg}</span>
        <button type="button" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

  document.body.appendChild(div);

  // Auto-remover después de 4 segundos
  setTimeout(() => {
    if (div.parentElement) {
      div.remove();
    }
  }, 4000);
}

// ==========================
// AVATARES
// ==========================

function openAvatarModal() {
  const modal = document.getElementById("avatar-modal");
  if (!modal) {
    console.error("❌ Modal de avatares no encontrado");
    return;
  }

  renderAvatarsGrid();
  modal.style.display = "flex";
  modal.classList.add("show");

  // Prevenir scroll del body
  document.body.style.overflow = "hidden";

  console.log("✅ Modal de avatares abierto");
}

function closeAvatarModal() {
  const modal = document.getElementById("avatar-modal");
  if (!modal) return;

  modal.classList.remove("show");

  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }, 300);

  console.log("✅ Modal de avatares cerrado");
}

function renderAvatarsGrid() {
  const grid = document.querySelector(".avatars-grid");
  if (!grid) {
    console.error("❌ Grid de avatares no encontrado");
    return;
  }

  grid.innerHTML = AVAILABLE_AVATARS.map(
    (avatar) => `
        <div class="avatar-option ${
          profile.currentAvatar === avatar.src ? "selected" : ""
        }" 
            data-avatar-id="${avatar.id}" 
            tabindex="0"
            onclick="selectAvatar('${avatar.id}')"
            onkeydown="if(event.key==='Enter') selectAvatar('${avatar.id}')">
            <div class="avatar-preview">
                <img src="${avatar.src}" alt="${avatar.name}" loading="lazy">
            </div>
            <div class="avatar-name">${avatar.name}</div>
            ${
              profile.currentAvatar === avatar.src
                ? `<div class="avatar-selected-indicator">✓</div>`
                : ""
            }
        </div>
    `
  ).join("");

  console.log("✅ Grid de avatares renderizado");
}

function selectAvatar(avatarId) {
  console.log("🎭 Seleccionando avatar:", avatarId);

  const avatar = AVAILABLE_AVATARS.find((a) => a.id === avatarId);
  if (!avatar) {
    console.error("❌ Avatar no encontrado:", avatarId);
    return;
  }

  if (!avatar.unlocked) {
    showNotification("Este avatar aún no está desbloqueado", "warning");
    return;
  }

  // Actualizar perfil
  profile.currentAvatar = avatar.src;

  // Actualizar UI
  updateAvatarDisplay();
  saveProfileToStorage();

  // Mostrar notificación
  showNotification(`Avatar cambiado a ${avatar.name}`, "success");

  // Cerrar modal después de un breve delay
  setTimeout(() => {
    closeAvatarModal();
  }, 500);

  console.log("✅ Avatar seleccionado correctamente");
}

function updateAvatarDisplay() {
  const img = document.getElementById("current-avatar-img");
  if (img) {
    img.src = profile.currentAvatar;
    img.alt = "Avatar actual";
  }
}

// ==========================
// FORMULARIO Y VALIDACIÓN
// ==========================

function updateProfileFromForm() {
  const usernameInput = document.getElementById("username");
  const displayNameInput = document.getElementById("display-name");
  const favoriteVerseInput = document.getElementById("favorite-verse");

  if (usernameInput) profile.username = usernameInput.value.trim();
  if (displayNameInput) profile.displayName = displayNameInput.value.trim();
  if (favoriteVerseInput)
    profile.favoriteVerse = favoriteVerseInput.value.trim();
}

function updateFormFromProfile() {
  const usernameInput = document.getElementById("username");
  const displayNameInput = document.getElementById("display-name");
  const favoriteVerseInput = document.getElementById("favorite-verse");
  const currentUsernameDisplay = document.getElementById("current-username");

  if (usernameInput) usernameInput.value = profile.username || "";
  if (displayNameInput) displayNameInput.value = profile.displayName || "";
  if (favoriteVerseInput)
    favoriteVerseInput.value = profile.favoriteVerse || "";

  updateAvatarDisplay();

  // Actualizar nombre de usuario mostrado
  if (currentUsernameDisplay) {
    currentUsernameDisplay.textContent = profile.username || "Usuario";
  }

  // Actualizar contadores de caracteres
  updateCharCount("display-name", "display-name-count", 30);
  updateCharCount("favorite-verse", "favorite-verse-count", 200);

  console.log("✅ Formulario actualizado desde perfil");
}

function updateCharCount(inputId, countId, max) {
  const input = document.getElementById(inputId);
  const count = document.getElementById(countId);

  if (input && count) {
    const currentLength = input.value.length;
    count.textContent = `${currentLength}/${max}`;

    // Limitar caracteres si excede el máximo
    if (currentLength > max) {
      input.value = input.value.substring(0, max);
      count.textContent = `${max}/${max}`;
    }

    // Cambiar color si se acerca al límite
    if (currentLength > max * 0.8) {
      count.style.color = "var(--danger-color)";
    } else {
      count.style.color = "var(--text-secondary)";
    }
  }
}

function validateUsername(username) {
  // Validar que solo contenga letras, números, guiones y guiones bajos
  const regex = /^[a-zA-Z0-9_-]{3,20}$/;
  return regex.test(username);
}

function validateUsernameInput() {
  const usernameInput = document.getElementById("username");
  const status = document.getElementById("username-status");

  if (!usernameInput || !status) return;

  const username = usernameInput.value.trim();

  if (username === "") {
    status.textContent = "";
    status.style.color = "";
  } else if (validateUsername(username)) {
    status.textContent = "✔️";
    status.style.color = "var(--valid-color)";
  } else {
    status.textContent = "❌";
    status.style.color = "var(--invalid-color)";
  }
}

function handleFormInput() {
  // Actualizar contadores
  updateCharCount("display-name", "display-name-count", 30);
  updateCharCount("favorite-verse", "favorite-verse-count", 200);

  // Validar nombre de usuario
  validateUsernameInput();

  // Marcar que hay cambios sin guardar
  hasUnsavedChanges = true;
  updateSaveButtonState(true);
}

// ==========================
// GUARDAR PERFIL
// ==========================

function handleProfileSubmit(e) {
  e.preventDefault();

  console.log("📝 Guardando perfil...");

  // ✅ PRIMERO actualizar perfil desde formulario
  updateProfileFromForm();

  // ✅ LUEGO validar datos actualizados
  if (!profile.username) {
    showNotification("El nombre de usuario es obligatorio", "error");
    return;
  }

  if (!validateUsername(profile.username)) {
    showNotification(
      "Nombre de usuario inválido. Debe tener 3-20 caracteres, solo letras, números, - y _",
      "error"
    );
    return;
  }

  // Guardar en localStorage
  if (saveProfileToStorage()) {
    // Mostrar indicador de guardado
    showSaveIndicator();

    // Actualizar UI
    updateFormFromProfile();

    // Marcar como guardado
    hasUnsavedChanges = false;
    updateSaveButtonState(false);

    showNotification("Perfil guardado correctamente", "success");
    console.log("✅ Perfil guardado exitosamente");
  }
}

function updateSaveButtonState(hasChanges = hasUnsavedChanges) {
  const btn = document.getElementById("save-profile-btn");
  if (!btn) return;

  const text = btn.querySelector(".btn-text");
  const icon = btn.querySelector("i");

  if (hasChanges) {
    btn.disabled = false;
    btn.style.background = "linear-gradient(135deg, #27ae60, #2ecc71)";
    if (text) text.textContent = "Guardar Cambios";
    if (icon) icon.className = "fas fa-save";
  } else {
    btn.disabled = true;
    btn.style.background = "linear-gradient(135deg, #95a5a6, #bdc3c7)";
    if (text) text.textContent = "Todo Guardado";
    if (icon) icon.className = "fas fa-check";
  }
}

function showSaveIndicator() {
  const indicator = document.getElementById("save-indicator");
  if (indicator) {
    indicator.style.display = "block";
    setTimeout(() => {
      indicator.style.display = "none";
    }, 2000);
  }
}

// ==========================
// ESTADÍSTICAS Y PROGRESO
// ==========================

function renderStats() {
  const statsGrid = document.querySelector(".stats-grid");
  if (!statsGrid) return;

  // Intentar obtener datos del GameDataManager si existe
  let stats;
  if (
    window.GameDataManager &&
    typeof window.GameDataManager.getStats === "function"
  ) {
    stats = window.GameDataManager.getStats();
  } else {
    // Fallback: obtener datos del localStorage
    const gameData = localStorage.getItem("quizCristianoData");
    if (gameData) {
      const data = JSON.parse(gameData);
      stats = {
        gamesPlayed: data.gamesPlayed || 0,
        victories: data.victories || 0,
        perfectGames: data.perfectGames || 0,
        coins: data.coins || 0,
      };
    } else {
      stats = {
        gamesPlayed: 0,
        victories: 0,
        perfectGames: 0,
        coins: 0,
      };
    }
  }

  try {
    statsGrid.innerHTML = [
      { label: "Partidas Jugadas", value: stats.gamesPlayed },
      { label: "Victorias", value: stats.victories },
      { label: "Juegos Perfectos", value: stats.perfectGames },
      { label: "Monedas", value: stats.coins },
    ]
      .map(
        (stat) => `
            <div class="stat-card">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `
      )
      .join("");

    console.log("✅ Estadísticas renderizadas:", stats);
  } catch (error) {
    console.warn("⚠️ Error obteniendo estadísticas:", error);
    statsGrid.innerHTML =
      '<div class="empty-time">Error cargando datos de estadísticas</div>';
  }
}

function renderRankingStats() {
  const rankingStats = document.querySelector(".ranking-stats");
  if (!rankingStats) return;

  try {
    const data = JSON.parse(localStorage.getItem("playerRankingData") || "{}");

    if (!data || Object.keys(data).length === 0) {
      rankingStats.innerHTML =
        '<div class="empty-time">Sin datos de ranking disponibles</div>';
      return;
    }

    const stats = [
      { value: data.currentRank || "-", label: "Posición Actual" },
      { value: data.seasonsParticipated || 0, label: "Temporadas" },
      { value: (data.medals && data.medals.total) || 0, label: "Medallas" },
      {
        value: data.currentDivision?.name || "Sin División",
        label: "División",
      },
    ];

    rankingStats.innerHTML = stats
      .map(
        (stat) => `
            <div class="ranking-stat-card">
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `
      )
      .join("");

    console.log("✅ Estadísticas de ranking renderizadas:", stats);
  } catch (error) {
    console.warn("⚠️ Error renderizando ranking:", error);
    rankingStats.innerHTML =
      '<div class="empty-time">Error cargando datos de ranking</div>';
  }
}

function renderProgress() {
  const userLevel = document.getElementById("user-level");
  const levelName = document.getElementById("level-name");
  const levelDescription = document.getElementById("level-description");
  const levelBadge = document.getElementById("level-badge");
  const expNumbers = document.getElementById("exp-numbers");
  const expFill = document.getElementById("exp-fill");

  const currentLevel = profile.level || 1;
  const levelInfo = LEVEL_NAMES[currentLevel] || LEVEL_NAMES[1];
  const expPercent = ((profile.exp || 0) / (profile.expToNext || 100)) * 100;

  if (userLevel) userLevel.textContent = `Nivel ${currentLevel}`;
  if (levelName) levelName.textContent = levelInfo.name;
  if (levelDescription) levelDescription.textContent = levelInfo.desc;
  if (levelBadge) {
    levelBadge.textContent = currentLevel;
    levelBadge.style.background = `linear-gradient(135deg, ${levelInfo.color}, #f39c12)`;
  }
  if (expNumbers)
    expNumbers.textContent = `${profile.exp || 0} / ${
      profile.expToNext || 100
    }`;
  if (expFill) {
    expFill.style.width = `${Math.min(expPercent, 100)}%`;
  }

  console.log("✅ Progreso renderizado correctamente");
}

// ==========================
// INICIALIZACIÓN
// ==========================

// Funciones globales principales para onclick
window.openAvatarModal = openAvatarModal;
window.closeAvatarModal = closeAvatarModal;
window.selectAvatar = selectAvatar;

// Inicialización cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  try {
    console.log("🚀 Inicializando página de perfil...");

    // Cargar perfil del localStorage
    loadProfileFromStorage();

    // Renderizar UI inicial
    updateFormFromProfile();
    renderStats();
    renderRankingStats();
    renderProgress();

    // Inicializar historial de pagos
    initializePaymentHistory();

    // Actualizar estado del botón de guardar
    updateSaveButtonState(false);

    console.log("✅ Página de perfil inicializada correctamente");
  } catch (error) {
    console.error("❌ Error inicializando página:", error);
    showNotification("Error inicializando perfil", "error");
  }
});

// ==========================
// HISTORIAL DE PAGOS
// ==========================

function initializePaymentHistory() {
  try {
    if (typeof PaymentHistoryUI !== "undefined") {
      window.paymentHistoryUI = new PaymentHistoryUI();
      console.log("✅ Payment History UI initialized");
    } else {
      console.warn("⚠️ PaymentHistoryUI not available");
    }
  } catch (error) {
    console.error("❌ Error initializing payment history:", error);
  }
}

// Configurar eventos del formulario
const profileForm = document.getElementById("profile-form");
if (profileForm) {
  profileForm.addEventListener("submit", handleProfileSubmit);
  profileForm.addEventListener("input", handleFormInput);
}

// Configurar eventos del modal de avatar
const avatarBtn = document.getElementById("current-avatar-btn");
if (avatarBtn) {
  avatarBtn.addEventListener("click", openAvatarModal);
  avatarBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openAvatarModal();
    }
  });
}

const modalClose = document.querySelector(".modal-close");
if (modalClose) {
  modalClose.addEventListener("click", closeAvatarModal);
}

const modalOverlay = document.querySelector(".modal-overlay");
if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeAvatarModal();
    }
  });
}

// Eventos de teclado para cerrar modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("avatar-modal");
    if (modal && modal.classList.contains("show")) {
      closeAvatarModal();
    }
  }
});

// Advertir sobre cambios sin guardar
window.addEventListener("beforeunload", (e) => {
  if (hasUnsavedChanges) {
    e.returnValue =
      "¿Estás seguro de que quieres salir? Tienes cambios sin guardar.";
  }
});

// Exportar funciones si es necesario
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    saveProfileToStorage,
    loadProfileFromStorage,
    updateFormFromProfile,
    openAvatarModal,
    closeAvatarModal,
    selectAvatar,
  };
}
