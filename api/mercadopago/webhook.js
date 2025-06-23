import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-152380984461471-061923-aa46cbff75052515b3bf2c1ef0c9d9c5-725736591'
});

export default async function handler(req, res) {
    console.log('🔔 Webhook recibido:', req.method, req.body);
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { type, data } = req.body;
        
        if (type === 'payment') {
            const payment = new Payment(client);
            const paymentInfo = await payment.get({ id: data.id });
            
            console.log('💳 Pago procesado:', {
                id: paymentInfo.id,
                status: paymentInfo.status,
                amount: paymentInfo.transaction_amount,
                external_reference: paymentInfo.external_reference
            });
            
            if (paymentInfo.status === 'approved') {
                const productId = paymentInfo.external_reference?.split('-')[1];
                console.log('🎉 PAGO APROBADO - Desbloquear producto:', productId);
            }
        }
        
        res.status(200).send('OK');
        
    } catch (error) {
        console.error('❌ Error webhook:', error);
        res.status(500).send('Error');
    }
}