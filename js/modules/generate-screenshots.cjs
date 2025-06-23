// js/modules/generate-screenshots.cjs (VERSIÓN COMPATIBLE)
const puppeteer = require('puppeteer');
const fs = require('fs');

// Función helper para esperar
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateScreenshots() {
    console.log('🚀 Iniciando generación de screenshots...');
    
    // Crear directorio si no existe
    if (!fs.existsSync('assets/screenshots')) {
        fs.mkdirSync('assets/screenshots', { recursive: true });
        console.log('📁 Directorio assets/screenshots creado');
    }

    const browser = await puppeteer.launch({
        headless: false, // Para ver qué está pasando
        defaultViewport: null,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    });

    try {
        const page = await browser.newPage();
        
        // Screenshot 1: Narrow - Pantalla de bienvenida (640x1136)
        console.log('📸 Generando screenshot-narrow-1.png...');
        await page.setViewport({ width: 640, height: 1136 });
        
        console.log('🌐 Cargando página...');
        await page.goto('http://localhost:3000/single-player-new.html', { 
            waitUntil: 'domcontentloaded',
            timeout: 15000
        });
        
        console.log('✅ Página cargada, esperando contenido...');
        
        // Esperar usando setTimeout en lugar de waitForTimeout
        await sleep(5000);
        
        console.log('📄 Tomando primer screenshot...');
        await page.screenshot({ 
            path: 'assets/screenshots/screenshot-narrow-1.png',
            fullPage: false,
            type: 'png'
        });
        console.log('✅ screenshot-narrow-1.png generado');

        // Screenshot 2: Narrow - Categorías (640x1136)
        console.log('📸 Generando screenshot-narrow-2.png...');
        
        // Buscar información de la página
        const pageInfo = await page.evaluate(() => {
            return {
                title: document.title,
                url: window.location.href,
                buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
                    text: btn.textContent?.trim(),
                    onclick: btn.onclick ? btn.onclick.toString() : null
                }))
            };
        });
        
        console.log('🔍 Info de página:', pageInfo);
        
        // Intentar hacer click en botón de inicio
        try {
            const startClicked = await page.evaluate(() => {
                // Buscar botones por texto y onclick
                const buttons = Array.from(document.querySelectorAll('button'));
                
                // Buscar por texto
                let startButton = buttons.find(btn => {
                    const text = btn.textContent?.trim().toLowerCase();
                    return text?.includes('jugar') || 
                           text?.includes('empezar') ||
                           text?.includes('iniciar') ||
                           text?.includes('start');
                });
                
                // Buscar por onclick
                if (!startButton) {
                    startButton = buttons.find(btn => {
                        const onclick = btn.onclick?.toString();
                        return onclick?.includes('startGame');
                    });
                }
                
                if (startButton) {
                    startButton.click();
                    return true;
                }
                
                // Intentar función directa
                if (typeof startGame === 'function') {
                    startGame();
                    return true;
                }
                
                return false;
            });
            
            if (startClicked) {
                console.log('🎮 Botón de inicio clickeado');
                await sleep(3000); // Esperar transición
            } else {
                console.log('⚠️ No se encontró botón de inicio');
            }
        } catch (e) {
            console.log('⚠️ Error al hacer click:', e.message);
        }
        
        await page.screenshot({ 
            path: 'assets/screenshots/screenshot-narrow-2.png',
            fullPage: false,
            type: 'png'
        });
        console.log('✅ screenshot-narrow-2.png generado');

        // Screenshot 3: Wide - Pregunta (1024x768)
        console.log('📸 Generando screenshot-wide-1.png...');
        await page.setViewport({ width: 1024, height: 768 });
        await sleep(2000); // Esperar redimensión
        
        // Buscar categorías
        try {
            const categoryInfo = await page.evaluate(() => {
                const categories = document.querySelectorAll('.category-card, [data-category]');
                return {
                    found: categories.length,
                    categories: Array.from(categories).map(cat => ({
                        text: cat.textContent?.trim(),
                        dataset: cat.dataset
                    }))
                };
            });
            
            console.log('📚 Categorías encontradas:', categoryInfo);
            
            // Intentar seleccionar categoría
            if (categoryInfo.found > 0) {
                const categoryClicked = await page.evaluate(() => {
                    const category = document.querySelector('.category-card, [data-category]');
                    if (category) {
                        category.click();
                        return true;
                    }
                    return false;
                });
                
                if (categoryClicked) {
                    console.log('📖 Categoría seleccionada');
                    await sleep(4000); // Esperar que cargue pregunta
                }
            }
        } catch (e) {
            console.log('⚠️ Error con categorías:', e.message);
        }
        
        await page.screenshot({ 
            path: 'assets/screenshots/screenshot-wide-1.png',
            fullPage: false,
            type: 'png'
        });
        console.log('✅ screenshot-wide-1.png generado');

        // Verificar archivos generados
        console.log('🎉 ¡Screenshots generados!');
        console.log('📂 Verificando archivos...');
        
        const files = ['screenshot-narrow-1.png', 'screenshot-narrow-2.png', 'screenshot-wide-1.png'];
        files.forEach(file => {
            const filepath = `assets/screenshots/${file}`;
            if (fs.existsSync(filepath)) {
                const stats = fs.statSync(filepath);
                console.log(`✅ ${file} - ${Math.round(stats.size / 1024)}KB`);
            } else {
                console.log(`❌ ${file} - No encontrado`);
            }
        });

    } catch (error) {
        console.error('❌ Error detallado:', error.message);
        console.error('📋 Stack trace:', error.stack);
    } finally {
        console.log('🔚 Cerrando navegador...');
        await sleep(2000);
        await browser.close();
    }
}

// Ejecutar
generateScreenshots();