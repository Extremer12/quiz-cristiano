/**
 * ================================================
 * CONFIGURACIÓN GLOBAL DE GOOGLE ADSENSE
 * ================================================
 */

export const ADSENSE_CONFIG = {
    publisherId: 'ca-pub-6335862771432698',
    enabled: true,
    testMode: false,
    
    // Configuración de anuncios
    adSettings: {
        enableAutoAds: true,
        enablePageLevelAds: true,
        adFrequency: {
            maxAdsPerSession: 5,
            timeBetweenAds: 120000, // 2 minutos
            minGameTimeBeforeAd: 60000 // 1 minuto jugando antes del primer ad
        }
    },
    
    // Políticas y restricciones
    policies: {
        respectPremiumUsers: true,
        familyFriendlyOnly: true,
        noAdsOnEducationalContent: false
    }
};

// Auto-inicializar AdSense Page Level Ads
if (ADSENSE_CONFIG.enabled && ADSENSE_CONFIG.adSettings.enablePageLevelAds) {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({
        google_ad_client: ADSENSE_CONFIG.publisherId,
        enable_page_level_ads: true
    });
}

console.log('✅ Configuración de AdSense cargada');