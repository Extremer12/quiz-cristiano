/**
 * Utilidades Globales
 * Funciones helper reutilizables
 */

// ============================================
// FORMATEO Y DISPLAY
// ============================================

export function formatCoins(amount) {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toString();
}

export function formatNumber(num) {
    return new Intl.NumberFormat('es-ES').format(num);
}

export function formatDate(date) {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Intl.DateTimeFormat('es-ES', options).format(new Date(date));
}

// ============================================
// NOTIFICACIONES
// ============================================

export function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
        achievement: 'fa-trophy'
    };

    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        </div>
    `;

    // Estilos inline para asegurar funcionamiento sin CSS externo
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 15px;
        padding: 15px 20px;
        z-index: 2000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        max-width: 300px;
        color: white;
    `;

    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
    `;

    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db',
        achievement: '#ffd700'
    };

    if (colors[type]) {
        content.querySelector('i').style.color = colors[type];
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, duration);

    return notification;
}

// ============================================
// VALIDACIONES
// ============================================

export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function isStrongPassword(password) {
    return password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password);
}

// ============================================
// ALMACENAMIENTO
// ============================================

export function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
        return false;
    }
}

export function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Error cargando de localStorage:', error);
        return defaultValue;
    }
}

// ============================================
// ANIMACIONES
// ============================================

export function animateCoins(element, from, to, duration = 1000) {
    const start = performance.now();
    const diff = to - from;

    function update(timestamp) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(from + (diff * eased));

        element.textContent = formatCoins(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

export function shakeElement(element, intensity = 5, duration = 500) {
    const originalTransform = element.style.transform;
    const startTime = performance.now();

    function shake(timestamp) {
        const elapsed = timestamp - startTime;
        const progress = elapsed / duration;

        if (progress < 1) {
            const x = (Math.random() - 0.5) * intensity * (1 - progress);
            const y = (Math.random() - 0.5) * intensity * (1 - progress);

            element.style.transform = `${originalTransform} translate(${x}px, ${y}px)`;
            requestAnimationFrame(shake);
        } else {
            element.style.transform = originalTransform;
        }
    }

    requestAnimationFrame(shake);
}

// ============================================
// UTILIDADES DE DISPOSITIVO
// ============================================

export function isMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches;
}

export function canShare() {
    return 'share' in navigator;
}

// ============================================
// UTILIDADES DE RED
// ============================================

export function isOnline() {
    return navigator.onLine;
}

export async function checkConnection() {
    try {
        const response = await fetch('./ping.json', {
            method: 'HEAD',
            cache: 'no-cache'
        });
        return response.ok;
    } catch {
        return false;
    }
}

// ============================================
// UTILIDADES DE AUDIO
// ============================================

export function playSound(soundName, volume = 0.5) {
    try {
        const audio = new Audio(`./assets/sounds/${soundName}.mp3`);
        audio.volume = volume;
        audio.play().catch(e => {
            // console.warn('No se pudo reproducir el sonido:', e);
        });
    } catch (error) {
        console.warn('Error reproduciendo sonido:', error);
    }
}

// ============================================
// UTILIDADES DE TEXTO
// ============================================

export function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

export function capitalizeFirst(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// ============================================
// GENERADORES
// ============================================

export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ============================================
// UTILIDADES DE TIEMPO
// ============================================

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Objeto por defecto para compatibilidad
const Utils = {
    formatCoins,
    formatNumber,
    formatDate,
    showNotification,
    isValidEmail,
    isStrongPassword,
    saveToStorage,
    loadFromStorage,
    animateCoins,
    shakeElement,
    isMobile,
    isIOS,
    isStandalone,
    canShare,
    isOnline,
    checkConnection,
    playSound,
    truncateText,
    capitalizeFirst,
    generateUUID,
    generateRandomString,
    debounce,
    throttle
};

export default Utils;
