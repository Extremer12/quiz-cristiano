/**
 * Bottom Navigation Component
 * Componente reutilizable para el menú inferior
 */

export function BottomNav(activePage = '') {
  const items = [
    { href: '/', icon: 'fa-home', label: 'Inicio', page: 'home' },
    { href: '/store', icon: 'fa-store', label: 'Tienda', page: 'store' },
    { href: '/ranking', icon: 'fa-trophy', label: 'Ranking', page: 'ranking' },
    { href: '/logros', icon: 'fa-medal', label: 'Logros', page: 'logros' },
    { href: '/mini-juego', icon: 'fa-book-open', label: 'Estudio', page: 'mini-juego' }
  ];

  return `
    <nav class="bottom-nav" style="view-transition-name: bottom-nav">
      ${items.map(item => `
        <a href="${item.href}" data-link class="nav-item ${activePage === item.page ? 'active' : ''}">
          <i class="fas ${item.icon}"></i>
          <span>${item.label}</span>
        </a>
      `).join('')}
    </nav>
  `;
}
