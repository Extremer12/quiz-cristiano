/**
 * Servicio de Anuncios (AdSense)
 */
class AdsService {
    constructor() {
        this.isAdSenseLoaded = false;
        this.testMode = false;
        this.pageAdsInitialized = false;

        this.adSenseConfig = {
            publisherId: 'ca-pub-6335862771432698',
            adSlots: {
                banner: '1234567890',
                square: '1234567891',
                leaderboard: '1234567892',
                mobile: '1234567893'
            }
        };

        this.adFrequency = {
            interstitial: 0,
            maxAdsPerSession: 5,
            timeBetweenAds: 120000,
            minGameTimeBeforeAd: 60000
        };

        this.lastAdTime = 0;
        this.userPremium = false;
        this.sessionStartTime = Date.now();
        this.adsBlocked = false;

        this.injectStyles();
    }

    async init() {
        try {
            console.log('💰 Inicializando AdsService...');

            this.userPremium = localStorage.getItem('premium-account') === 'true';

            if (this.userPremium) {
                console.log('👑 Usuario premium - anuncios deshabilitados');
                return;
            }

            await this.detectAdBlocker();

            if (this.adsBlocked) {
                console.log('🚫 AdBlocker detectado - anuncios no disponibles');
                this.showAdBlockerMessage();
                return;
            }

            await this.loadAdSenseScript();
            this.createAdContainers();

            if (!this.pageAdsInitialized) {
                this.initializePageLevelAds();
            }

            console.log('✅ AdsService inicializado correctamente');

        } catch (error) {
            console.error('❌ Error inicializando AdsService:', error);
        }
    }

    initializePageLevelAds() {
        if (this.pageAdsInitialized) return;

        if (!window.adsbygoogle) {
            console.warn('⚠️ AdSense script no disponible');
            return;
        }

        try {
            if (!window.pageAdsInitialized && !window.google_ad_client) {
                (window.adsbygoogle = window.adsbygoogle || []).push({
                    google_ad_client: this.adSenseConfig.publisherId,
                    enable_page_level_ads: true,
                    overlays: { bottom: true },
                    vignettes: { unhideDelay: 1000 }
                });

                window.pageAdsInitialized = true;
                this.pageAdsInitialized = true;
                console.log('✅ Page Level Ads inicializados');
            }
        } catch (error) {
            console.error('❌ Error inicializando Page Level Ads:', error);
        }
    }

    async detectAdBlocker() {
        try {
            const testAd = document.createElement('div');
            testAd.innerHTML = '&nbsp;';
            testAd.className = 'adsbox';
            testAd.style.cssText = 'position:absolute;left:-10000px;';
            document.body.appendChild(testAd);

            await new Promise(resolve => setTimeout(resolve, 100));

            this.adsBlocked = testAd.offsetHeight === 0;
            document.body.removeChild(testAd);
        } catch (error) {
            console.warn('No se pudo detectar AdBlocker:', error);
            this.adsBlocked = false;
        }
    }

    async loadAdSenseScript() {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src*="${this.adSenseConfig.publisherId}"]`)) {
                this.isAdSenseLoaded = true;
                resolve();
                return;
            }

            if (window.adsbygoogle) {
                this.isAdSenseLoaded = true;
                resolve();
                return;
            }

            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;

                if (window.adsbygoogle) {
                    clearInterval(checkInterval);
                    this.isAdSenseLoaded = true;
                    resolve();
                } else if (attempts > 20) {
                    clearInterval(checkInterval);
                    reject(new Error('AdSense script timeout'));
                }
            }, 500);
        });
    }

    createAdContainers() {
        this.createAdContainer('banner-ad-container', 'banner');
        this.createAdContainer('square-ad-container', 'square');
        this.createAdContainer('mobile-ad-container', 'mobile');
    }

    createAdContainer(id, type) {
        if (document.getElementById(id)) return;

        const container = document.createElement('div');
        container.id = id;
        container.className = `ad-container ad-${type}`;

        const styles = {
            banner: { width: '100%', maxWidth: '728px', height: '90px', margin: '20px auto', textAlign: 'center' },
            square: { width: '300px', height: '250px', margin: '20px auto', textAlign: 'center' },
            mobile: { width: '100%', maxWidth: '320px', height: '50px', margin: '10px auto', textAlign: 'center' }
        };

        Object.assign(container.style, styles[type] || styles.banner);
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
            @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }

    showAdBlockerMessage() {
        const message = document.createElement('div');
        Object.assign(message.style, {
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(231, 76, 60, 0.9)', color: 'white', padding: '15px 20px',
            borderRadius: '10px', zIndex: '9999', fontWeight: 'bold', maxWidth: '300px', textAlign: 'center'
        });
        message.innerHTML = '<i class="fas fa-shield-alt"></i> AdBlocker detectado. Los anuncios ayudan a mantener el juego gratuito.';
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }
}

export default new AdsService();
