// Ranking.js - Funcionalidad para la página de ranking

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar animaciones
    initAnimations();
    
    // Configurar eventos para filtros
    setupFilters();
    
    // Configurar paginación
    setupPagination();
    
    // Crear partículas de fondo
    createParticles();
});

// Función para inicializar animaciones
function initAnimations() {
    // Animar entrada de elementos
    animateElement('.ranking-title', 'fadeInDown', 0);
    animateElement('.ranking-tabs', 'fadeInUp', 200);
    animateElement('.ranking-filters', 'fadeIn', 400);
    
    // Animar podio con secuencia
    setTimeout(() => {
        animateElement('.podium-place.second', 'bounceInUp', 0);
        animateElement('.podium-place.first', 'bounceInUp', 200);
        animateElement('.podium-place.third', 'bounceInUp', 400);
        
        // Animar corona
        setTimeout(() => {
            const crown = document.querySelector('.crown');
            if (crown) {
                crown.classList.add('animate-crown');
            }
        }, 1000);
    }, 600);
    
    // Animar tabla de clasificación
    setTimeout(() => {
        animateElement('.ranking-table-container', 'fadeIn', 0);
        
        // Animar filas de la tabla con efecto cascada
        const rows = document.querySelectorAll('.ranking-table tbody tr');
        rows.forEach((row, index) => {
            animateElement(row, 'fadeInRight', 100 * index);
        });
        
        // Animar tu posición
        setTimeout(() => {
            animateElement('.your-position', 'pulse', 0);
        }, rows.length * 100 + 300);
        
        // Animar paginación
        setTimeout(() => {
            animateElement('.pagination', 'fadeInUp', 0);
        }, rows.length * 100 + 600);
    }, 1200);
}

// Función para animar un elemento
function animateElement(selector, animationName, delay) {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!element) return;
    
    setTimeout(() => {
        element.style.opacity = '0';
        element.style.animation = `${animationName} 0.8s forwards`;
        element.style.opacity = '1';
    }, delay);
}

// Configurar eventos para filtros
function setupFilters() {
    // Cambiar entre pestañas
    const tabs = document.querySelectorAll('.ranking-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover clase activa de todas las pestañas
            tabs.forEach(t => t.classList.remove('active'));
            // Añadir clase activa a la pestaña seleccionada
            tab.classList.add('active');
            
            // Simular carga de datos
            simulateDataLoading();
        });
    });
    
    // Filtro de categoría
    const categorySelect = document.querySelector('.filter-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            simulateDataLoading();
        });
    }
    
    // Búsqueda de jugador
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            simulateDataLoading();
        }, 300));
    }
}

// Función para simular carga de datos
function simulateDataLoading() {
    const tableContainer = document.querySelector('.ranking-table-container');
    if (!tableContainer) return;
    
    // Añadir clase de carga
    tableContainer.classList.add('loading');
    
    // Simular tiempo de carga
    setTimeout(() => {
        // Remover clase de carga
        tableContainer.classList.remove('loading');
        
        // Animar nuevas filas
        const rows = document.querySelectorAll('.ranking-table tbody tr');
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.animation = 'fadeInRight 0.5s forwards';
            }, 50 * index);
        });
    }, 800);
}

// Configurar paginación
function setupPagination() {
    const pageButtons = document.querySelectorAll('.page-button');
    const pageArrows = document.querySelectorAll('.page-arrow');
    
    // Configurar botones de página
    pageButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase activa de todos los botones
            pageButtons.forEach(btn => btn.classList.remove('active'));
            // Añadir clase activa al botón seleccionado
            button.classList.add('active');
            
            // Simular carga de datos
            simulateDataLoading();
        });
    });
    
    // Configurar flechas de paginación
    pageArrows.forEach(arrow => {
        arrow.addEventListener('click', () => {
            const activePage = document.querySelector('.page-button.active');
            if (!activePage) return;
            
            let currentPage = parseInt(activePage.textContent);
            let newPage;
            
            // Determinar dirección
            if (arrow.querySelector('.fa-chevron-left')) {
                newPage = Math.max(1, currentPage - 1);
            } else {
                newPage = Math.min(5, currentPage + 1);
            }
            
            // Actualizar página activa
            if (newPage !== currentPage) {
                pageButtons.forEach(btn => {
                    if (parseInt(btn.textContent) === newPage) {
                        btn.click();
                    }
                });
            }
        });
    });
}

// Función para crear partículas de fondo
function createParticles() {
    const container = document.querySelector('.particles-container');
    if (!container) return;
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Crear partículas
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Posición aleatoria
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        
        // Tamaño aleatorio
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Color aleatorio
        const colors = ['#FFD700', '#FFFFFF', '#3a86ff', '#ff006e'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.backgroundColor = color;
        
        // Animación aleatoria
        const duration = Math.random() * 20 + 10;
        particle.style.animation = `float ${duration}s infinite ease-in-out`;
        
        // Retraso aleatorio
        const delay = Math.random() * 5;
        particle.style.animationDelay = `${delay}s`;
        
        // Añadir partícula al contenedor
        container.appendChild(particle);
    }
}

// Función de debounce para optimizar eventos
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Animaciones adicionales para el podio
document.addEventListener('DOMContentLoaded', () => {
    // Efecto hover para el podio
    const podiumPlaces = document.querySelectorAll('.podium-place');
    podiumPlaces.forEach(place => {
        place.addEventListener('mouseenter', () => {
            place.style.transform = 'translateY(-10px)';
        });
        
        place.addEventListener('mouseleave', () => {
            place.style.transform = 'translateY(0)';
        });
    });
    
    // Efecto de brillo para la corona
    const crown = document.querySelector('.crown');
    if (crown) {
        setInterval(() => {
            crown.classList.add('shine');
            setTimeout(() => {
                crown.classList.remove('shine');
            }, 1000);
        }, 3000);
    }
});