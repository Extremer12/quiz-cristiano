/**
 * Lazy Image Component
 * Implementa lazy loading nativo con IntersectionObserver fallback
 */

export class LazyImage {
    static init() {
        // Usar lazy loading nativo del navegador
        const images = document.querySelectorAll('img[data-src]');

        if ('loading' in HTMLImageElement.prototype) {
            // Navegadores modernos con soporte nativo
            images.forEach(img => {
                img.src = img.dataset.src;
                img.loading = 'lazy';
            });
        } else {
            // Fallback con IntersectionObserver
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    static createImage(src, alt = '', className = '') {
        return `
      <img 
        data-src="${src}" 
        alt="${alt}" 
        class="${className} lazy-image"
        loading="lazy"
      >
    `;
    }
}
