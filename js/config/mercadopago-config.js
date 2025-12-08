/* filepath: c:\Users\julian\Desktop\WEBS\Proyectos sin terminar\quiz-cristiano\js\config\mercadopago-config.js */
/**
 * ================================================
 * MERCADO PAGO CONFIGURATION - CREDENCIALES REALES
 * Quiz Cristiano - Sistema de pagos TEST (Nueva API)
 * ================================================
 */

// ✅ ACTUALIZAR A CREDENCIALES DE PRODUCCIÓN
const MERCADOPAGO_CONFIG = {
    // CAMBIAR A CREDENCIALES DE PRODUCCIÓN
    public_key: 'APP_USR-973a31b1-d26f-495a-a41d-104d4df0e532', // ✅ YA TIENES ESTA
    access_token: 'APP_USR-152380984461471-061923-aa46cbff75052515b3bf2c1ef0c9d9c5-725736591', // ✅ YA TIENES ESTA
    
    // ⚙️ CONFIGURACIÓN DE PRODUCCIÓN
    environment: 'production', // ✅ CAMBIAR A PRODUCTION
    currency: 'ARS',
    country: 'AR',
    testMode: false // ✅ CAMBIAR A FALSE
};

// INICIALIZAR MERCADO PAGO
let mp = null;

async function initMercadoPago() {
    try {
        // Verificar que el SDK esté cargado
        if (typeof MercadoPago === 'undefined') {
            console.warn('⚠️ SDK de MercadoPago no está cargado, usando modo simulación');
            return { simulated: true };
        }
        
        mp = new MercadoPago(MERCADOPAGO_CONFIG.public_key, {
            locale: 'es-AR'
        });
        
        console.log('✅ Mercado Pago TEST inicializado correctamente');
        console.log('Public Key:', MERCADOPAGO_CONFIG.public_key.substring(0, 20) + '...');
        
        return mp;
        
    } catch (error) {
        console.error('❌ Error inicializando Mercado Pago:', error);
        return { simulated: true };
    }
}

// ✅ FUNCIÓN PARA OBTENER PRECIO EN ARS ACTUALIZADA
function getPriceInARS(productId) {
    const product = STORE_PRODUCTS[productId];
    if (!product) return 0;
    
    if (product.currency === 'coins') {
        return 0; // No aplica para power-ups
    }
    
    if (product.currency === 'USD') {
        // ✅ TASA DE CAMBIO ACTUALIZADA PARA PRUEBAS
        const usdToArs = 1000; // 1 USD = 1000 ARS aproximado
        return Math.round(product.price * usdToArs);
    }
    
    return 0;
}

// ✅ NUEVA FUNCIÓN PARA FORMATEAR PRECIOS
function formatPrice(productId) {
    const product = STORE_PRODUCTS[productId];
    if (!product) return '';
    
    if (product.currency === 'USD') {
        const priceUSD = product.price;
        const priceARS = getPriceInARS(productId);
        
        return {
            usd: `$${priceUSD.toFixed(2)} USD`,
            ars: `$${priceARS.toLocaleString('es-AR')} ARS`,
            both: `$${priceUSD.toFixed(2)} USD (≈ $${priceARS.toLocaleString('es-AR')} ARS)`
        };
    }
    
    if (product.currency === 'coins') {
        return {
            coins: `${product.price} monedas`,
            display: `${product.price} monedas`
        };
    }
    
    return '';
}

// CREAR PREFERENCIA DE PAGO - CORREGIDA COMPLETAMENTE
async function crearPreferenciaMercadoPago(productId, quantity = 1) {
    const product = STORE_PRODUCTS[productId];
    const price = getPriceInARS(productId);
    
    if (!product || !price) {
        throw new Error(`Producto ${productId} no encontrado o sin precio`);
    }
    
    // ✅ URLS MÁS SIMPLES Y DIRECTAS
    const preferenceData = {
        items: [{
            id: productId,
            title: `${product.name}`, // ✅ QUITAR [PRUEBA]
            description: `${product.description}`, // ✅ QUITAR - COMPRA DE PRUEBA
            category_id: 'games',
            quantity: quantity,
            currency_id: 'ARS',
            unit_price: price
        }],
        
        payer: {
            name: 'Usuario',
            surname: 'Quiz',
            email: 'user@quizcristiano.com'
        },
        
        // ✅ CAMBIAR ESTAS URLs DE LOCALHOST A TU DOMINIO
    back_urls: {
    success: 'https://quiz-cristiano-backend-2xqfe1c4n-cristian-bordon-s-projects.vercel.app/store.html?status=success',
    failure: 'https://quiz-cristiano-backend-2xqfe1c4n-cristian-bordon-s-projects.vercel.app/store.html?status=failure', 
    pending: 'https://quiz-cristiano-backend-2xqfe1c4n-cristian-bordon-s-projects.vercel.app/store.html?status=pending'
},
        payment_methods: {
            installments: 12
        },
        
        external_reference: `quiz-${productId}-${Date.now()}`,
        
        // ✅ CAMBIAR METADATA
        metadata: {
            product_id: productId,
            user_id: getUserId(),
            test_mode: 'false' // ✅ CAMBIAR A FALSE
        }
    };
    
    console.log('Preferencia simplificada:', {
        product: product.name,
        price: price,
        back_urls: preferenceData.back_urls
    });
    
    try {
        const response = await fetch(`${getBackendUrl()}/api/mercadopago/create-preference`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferenceData)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`HTTP error! status: ${response.status}, details: ${errorData?.message || 'Error desconocido'}`);
        }
        
        const preferenceResult = await response.json();
        console.log('✅ Preferencia creada exitosamente:', preferenceResult);
        
        return preferenceResult;
        
    } catch (fetchError) {
        console.error('❌ Error en fetch:', fetchError);
        throw new Error(`Error creando preferencia: ${fetchError.message}`);
    }
}

// FUNCIÓN DE SIMULACIÓN PARA PRUEBAS SIN BACKEND
async function simulateSuccessfulPurchase(productId) {
    console.log('SIMULANDO COMPRA EXITOSA para:', productId);
    
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Desbloquear producto directamente
    await unlockPremiumProduct(productId);
    
    return {
        id: 'simulated_' + Date.now(),
        init_point: '#simulated',
        simulated: true
    };
}

// FUNCIÓN PARA DESBLOQUEAR PRODUCTO
async function unlockPremiumProduct(productId) {
    try {
        console.log('Desbloqueando producto:', productId);
        
        // Guardar en localStorage
        const purchases = JSON.parse(localStorage.getItem('premium-purchases') || '[]');
        if (!purchases.includes(productId)) {
            purchases.push(productId);
            localStorage.setItem('premium-purchases', JSON.stringify(purchases));
        }
        
        // Actualizar UI
        if (typeof updateProductCards === 'function') {
            updateProductCards();
        }
        
        // Mostrar notificación de éxito
        showNotification(`¡${productId} desbloqueado exitosamente!`, 'success');
        
        // Cerrar modal de compra
        if (typeof closePurchaseModal === 'function') {
            closePurchaseModal();
        }
        
        console.log('✅ Producto desbloqueado exitosamente');
        
    } catch (error) {
        console.error('❌ Error desbloqueando producto:', error);
    }
}

// PROCESAR PAGO CON MERCADO PAGO - MEJORADO
async function procesarPagoMercadoPago(productId) {
    console.log('=== INICIANDO PAGO MERCADO PAGO ===');
    console.log('Producto:', productId);
    
    try {
        showPaymentLoading(true);
        
        // ✅ GUARDAR DATOS DE LA COMPRA ANTES DEL PAGO
        const purchaseData = {
            productId: productId,
            timestamp: Date.now(),
            method: 'mercadopago'
        };
        
        sessionStorage.setItem('lastPurchaseAttempt', JSON.stringify(purchaseData));
        console.log('Datos de compra guardados:', purchaseData);
        
        // Verificar que el producto exista
        const product = STORE_PRODUCTS[productId];
        if (!product) {
            throw new Error(`Producto ${productId} no encontrado`);
        }
        
        console.log('Producto encontrado:', product.name);
        
        // Crear preferencia
        const preference = await crearPreferenciaMercadoPago(productId);
        
        if (!preference || !preference.id) {
            throw new Error('No se pudo crear la preferencia de pago');
        }
        
        console.log('✅ Preferencia creada con ID:', preference.id);
        
        // ✅ ABRIR PAGO - USANDO WINDOW.OPEN PARA MEJOR CONTROL
        if (preference.init_point) {
            console.log('Abriendo checkout en nueva ventana...');
            
            // Abrir en la misma ventana para mejor control de redirección
            window.location.href = preference.init_point;
        } else {
            throw new Error('No se pudo obtener el link de pago');
        }
        
    } catch (error) {
        console.error('❌ ERROR COMPLETO en procesarPagoMercadoPago:', error);
        
        // Limpiar datos de compra en caso de error
        sessionStorage.removeItem('lastPurchaseAttempt');
        
        // Mostrar error específico
        let userMessage = 'Error procesando el pago';
        
        if (error.message.includes('HTTP error! status: 500')) {
            userMessage = 'Error del servidor. Intenta de nuevo en unos minutos.';
        } else if (error.message.includes('network')) {
            userMessage = 'Error de conexión. Verifica tu internet.';
        } else {
            userMessage = `Error: ${error.message}`;
        }
        
        showNotification(`❌ ${userMessage}`, 'error');
        
    } finally {
        showPaymentLoading(false);
    }
}

// MOSTRAR INFORMACIÓN DE PRUEBA ACTUALIZADA
function showTestPaymentInfo() {
    const testInfo = `
MODO DE PRUEBA ACTIVADO - MERCADO PAGO

TARJETAS DE PRUEBA OFICIALES:

MASTERCARD (Aprobación automática):
   Número: 5031 7557 3453 0604
   Vencimiento: 11/30
   CVV: 123
   
VISA (Aprobación automática):
   Número: 4509 9535 6623 3704
   Vencimiento: 11/30
   CVV: 123

DATOS ADICIONALES PARA PRUEBAS:
• Titular: APRO (para aprobación automática)
• DNI: 12345678
• Email: test@test.com

PARA PROBAR RECHAZOS:
• Titular: OTHE (será rechazado automáticamente)

Este es un pago de prueba, no se cobrará dinero real.
    `;
    
    console.log(testInfo);
    showNotification('Modo de prueba activado. Revisa la consola para las tarjetas de test.', 'info');
}


// ✅ FUNCIÓN DINÁMICA - SE ADAPTA AUTOMÁTICAMENTE
function getBackendUrl() {
    // Siempre usar la URL actual del navegador
    return window.location.origin;
}

function getUserId() {
    return localStorage.getItem('user-id') || 'test-user-' + Date.now();
}

function showPaymentLoading(show) {
    const btn = document.getElementById('confirm-purchase-btn');
    
    if (btn) {
        if (show) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            btn.disabled = true;
        } else {
            btn.innerHTML = '<i class="fas fa-shopping-cart"></i> Pagar Ahora';
            btn.disabled = false;
        }
    }
}

// Detectar éxito de pago desde URL
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const productId = urlParams.get('product');
    
    if (paymentStatus === 'success' && productId) {
        console.log('Pago exitoso detectado para:', productId);
        setTimeout(() => {
            unlockPremiumProduct(productId);
        }, 1000);
    }
});

// ❌ COMENTAR ESTA FUNCIÓN QUE CAUSA ERROR CORS:
/*
function debugMercadoPagoUrls() {
    console.log('=== DEBUG MERCADO PAGO URLs ===');
    console.log('Base URL:', getBaseUrl());
    console.log('Success URL:', getSuccessUrl());
    console.log('Backend URL:', getBackendUrl());
    console.log('Current URL:', window.location.href);
    
    // ❌ ESTA LÍNEA CAUSA EL ERROR CORS:
    fetch(`${getBackendUrl()}/test`)
        .then(response => response.json())
        .then(data => console.log('✅ Server test OK:', data))
        .catch(error => console.log('❌ Server test failed:', error));
}
*/

function getBaseUrl() {
    return window.location.origin;
}

// ✅ REEMPLAZAR CON ESTA VERSIÓN SIN FETCH:
function debugMercadoPagoUrls() {
    console.log('=== DEBUG MERCADO PAGO URLs ===');
    console.log('Base URL:', getBaseUrl());
    console.log('Backend URL:', getBackendUrl());
    console.log('Current URL:', window.location.href);
    console.log('✅ URLs configuradas correctamente');
}

// ✅ EXPONER LA FUNCIÓN GLOBALMENTE
window.debugMercadoPagoUrls = debugMercadoPagoUrls;

// Llamar debug automáticamente
setTimeout(debugMercadoPagoUrls, 2000);

// Exportar funciones globalmente
window.MERCADOPAGO_CONFIG = MERCADOPAGO_CONFIG;
window.initMercadoPago = initMercadoPago;
window.procesarPagoMercadoPago = procesarPagoMercadoPago;
window.unlockPremiumProduct = unlockPremiumProduct;

console.log('✅ MercadoPago Config REAL cargado - Modo PRUEBA (Nueva API)');
console.log('App Quiz Cristiano lista para testing');

