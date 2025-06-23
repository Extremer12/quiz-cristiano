// js/modules/protection.js
class AppProtection {
    static init() {
        // 1. Detectar herramientas de desarrollador
        this.detectDevTools();
        
        // 2. Ofuscar código crítico
        this.obfuscateCriticalCode();
        
        // 3. Watermark en interfaz
        this.addWatermark();
    }

    static detectDevTools() {
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > 200) {
                console.warn('🔐 Quiz Cristiano - Código protegido por derechos de autor');
            }
        }, 1000);
    }

    static addWatermark() {
        document.body.insertAdjacentHTML('beforeend', `
            <div style="position:fixed;bottom:5px;right:5px;font-size:8px;opacity:0.3;z-index:9999;">
                © 2025 [TU NOMBRE] - Quiz Cristiano
            </div>
        `);
    }
}