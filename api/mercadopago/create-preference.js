import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-152380984461471-061923-aa46cbff75052515b3bf2c1ef0c9d9c5-725736591'
});

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { productId, title, price, userEmail } = req.body;
        
        if (!productId || !title || !price) {
            return res.status(400).json({ error: 'Faltan parámetros requeridos' });
        }
        
        const preference = new Preference(client);
        
        const preferenceData = {
            items: [{
                id: productId,
                title: title,
                quantity: 1,
                unit_price: parseFloat(price),
                currency_id: 'ARS'
            }],
            payer: {
                email: userEmail || 'user@quizcristiano.com'
            },
    // ✅ LÍNEAS 39-43 - USA EL HOST ACTUAL AUTOMÁTICAMENTE
back_urls: {
    success: `https://${req.headers.host}/store.html?payment=success&product=${productId}`,
    failure: `https://${req.headers.host}/store.html?payment=failure`,
    pending: `https://${req.headers.host}/store.html?payment=pending`
},

            notification_url: `https://${req.headers.host}/api/mercadopago/webhook`,
            external_reference: `quiz-${productId}-${Date.now()}`,
            auto_return: 'approved'
        };
        
        const result = await preference.create({ body: preferenceData });
        
        return res.status(200).json({
            id: result.id,
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
}