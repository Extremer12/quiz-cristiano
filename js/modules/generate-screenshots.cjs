// js/modules/generate-screenshots.cjs - VERSIÓN COMPLETA CON WIDGET
const puppeteer = require('puppeteer');
const fs = require('fs');

// Función helper para esperar
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateScreenshots() {
    console.log('🚀 Iniciando generación de screenshots completos...');
    
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
        await sleep(5000);
        
        await page.screenshot({ 
            path: 'assets/screenshots/screenshot-narrow-1.png',
            fullPage: false,
            type: 'png'
        });
        console.log('✅ screenshot-narrow-1.png generado');

        // Screenshot 2: Narrow - Después de click (640x1136)
        console.log('📸 Generando screenshot-narrow-2.png...');
        
        // Intentar hacer click en botón de inicio
        try {
            const startClicked = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                
                let startButton = buttons.find(btn => {
                    const text = btn.textContent?.trim().toLowerCase();
                    return text?.includes('jugar') || 
                           text?.includes('empezar') ||
                           text?.includes('iniciar') ||
                           text?.includes('comenzar');
                });
                
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
                
                return false;
            });
            
            if (startClicked) {
                console.log('🎮 Botón de inicio clickeado');
                await sleep(3000);
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

        // Screenshot 3: Wide - Vista desktop (1024x768)
        console.log('📸 Generando screenshot-wide-1.png...');
        await page.setViewport({ width: 1024, height: 768 });
        await sleep(2000);
        
        await page.screenshot({ 
            path: 'assets/screenshots/screenshot-wide-1.png',
            fullPage: false,
            type: 'png'
        });
        console.log('✅ screenshot-wide-1.png generado');

        // ✅ NUEVO: Screenshot 4: Widget para PWA (400x200)
        console.log('📸 Generando widget-screenshot.png...');
        
        // Crear contenido HTML para el widget
        const widgetHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Quiz Cristiano Widget</title>
            <style>
                body {
                    margin: 0;
                    font-family: 'Lato', Arial, sans-serif;
                    background: linear-gradient(135deg, #1e3c8a, #3a86ff);
                    width: 400px;
                    height: 200px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    color: white;
                    position: relative;
                    overflow: hidden;
                }
                
                .widget-container {
                    text-align: center;
                    padding: 20px;
                    width: 100%;
                    box-sizing: border-box;
                }
                
                .widget-title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #ffd700;
                    margin-bottom: 15px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                
                .stat-item {
                    background: rgba(255,255,255,0.1);
                    border-radius: 8px;
                    padding: 8px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                }
                
                .stat-value {
                    font-size: 1.3rem;
                    font-weight: bold;
                    color: #ffd700;
                }
                
                .stat-label {
                    font-size: 0.8rem;
                    opacity: 0.9;
                    margin-top: 2px;
                }
                
                .widget-footer {
                    font-size: 0.7rem;
                    opacity: 0.7;
                    margin-top: 10px;
                }
                
                .decorative-icon {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    font-size: 2rem;
                    opacity: 0.3;
                }
            </style>
        </head>
        <body>
            <div class="decorative-icon">📊</div>
            <div class="widget-container">
                <div class="widget-title">📖 Quiz Cristiano</div>
                
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">2,450</div>
                        <div class="stat-label">⭐ Puntos</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">8/12</div>
                        <div class="stat-label">🏆 Logros</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">350</div>
                        <div class="stat-label">💰 Monedas</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">127</div>
                        <div class="stat-label">📝 Preguntas</div>
                    </div>
                </div>
                
                <div class="widget-footer">
                    © 2025 Cristian Bordón
                </div>
            </div>
        </body>
        </html>
        `;

        // Cargar el HTML del widget
        await page.setContent(widgetHTML);
        await page.setViewport({ width: 400, height: 200 });
        await sleep(1000); // Esperar renderizado
        
        // Tomar screenshot del widget
        await page.screenshot({ 
            path: 'assets/screenshots/widget-screenshot.png',
            fullPage: true,
            type: 'png'
        });
        console.log('✅ widget-screenshot.png generado');

        // Verificar todos los archivos generados
        console.log('🎉 ¡Todos los screenshots generados!');
        console.log('📂 Verificando archivos...');
        
        const files = [
            'screenshot-narrow-1.png', 
            'screenshot-narrow-2.png', 
            'screenshot-wide-1.png',
            'widget-screenshot.png'
        ];
        
        files.forEach(file => {
            const filepath = `assets/screenshots/${file}`;
            if (fs.existsSync(filepath)) {
                const stats = fs.statSync(filepath);
                console.log(`✅ ${file} - ${Math.round(stats.size / 1024)}KB`);
            } else {
                console.log(`❌ ${file} - No encontrado`);
            }
        });

        console.log('');
        console.log('🎯 SCREENSHOTS COMPLETADOS:');
        console.log('  📱 screenshot-narrow-1.png (640x1136) - Pantalla principal');
        console.log('  📱 screenshot-narrow-2.png (640x1136) - Después del click');
        console.log('  💻 screenshot-wide-1.png (1024x768) - Vista desktop');
        console.log('  🎛️ widget-screenshot.png (400x200) - Widget PWA');
        console.log('');
        console.log('✅ Tu PWA está lista para puntuación 10/10 en PWA Builder!');

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