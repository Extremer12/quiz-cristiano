/**
 * ================================================
 * ADS MANAGER - SISTEMA DE ANUNCIOS PARA QUIZ CRISTIANO
 * Versión corregida sin duplicados
 * ================================================
 */

class AdsManager {
    constructor() {
        this.isAdSenseLoaded = false;
        this.testMode = false;
        this.pageAdsInitialized = false; // ✅ NUEVO FLAG PARA EVITAR DUPLICADOS
        
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
        
        console.log('💰 AdsManager inicializado para Quiz Cristiano');
    }

    // ============================================
    // INICIALIZACIÓN CORREGIDA
    // ============================================

    async init() {
        try {
            console.log('💰 Inicializando Google AdSense...');
            
            // Verificar si es usuario premium
            this.userPremium = localStorage.getItem('premium-account') === 'true';
            
            if (this.userPremium) {
                console.log('👑 Usuario premium - anuncios deshabilitados');
                return;
            }
            
            // Verificar si hay adblocker
            await this.detectAdBlocker();
            
            if (this.adsBlocked) {
                console.log('🚫 AdBlocker detectado - anuncios no disponibles');
                this.showAdBlockerMessage();
                return;
            }
            
            await this.loadAdSenseScript();
            this.createAdContainers();
            
            // ✅ SOLO INICIALIZAR PAGE ADS UNA VEZ
            if (!this.pageAdsInitialized) {
                this.initializePageLevelAds();
            }
            
            console.log('✅ Google AdSense inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando AdSense:', error);
        }
    }

    // ✅ FUNCIÓN CORREGIDA PARA EVITAR DUPLICADOS
    initializePageLevelAds() {
        // Verificar si ya se inicializó
        if (this.pageAdsInitialized) {
            console.log('⚠️ Page Level Ads ya inicializados, omitiendo...');
            return;
        }
        
        if (!window.adsbygoogle) {
            console.warn('⚠️ AdSense script no disponible');
            return;
        }
        
        try {
            // ✅ VERIFICAR QUE NO SE HAYA EJECUTADO ANTES
            if (!window.pageAdsInitialized) {
                (window.adsbygoogle = window.adsbygoogle || []).push({
                    google_ad_client: this.adSenseConfig.publisherId,
                    enable_page_level_ads: true,
                    overlays: { bottom: true },
                    vignettes: { unhideDelay: 1000 }
                });
                
                // Marcar como inicializado globalmente
                window.pageAdsInitialized = true;
                this.pageAdsInitialized = true;
                
                console.log('✅ Page Level Ads inicializados correctamente');
            } else {
                console.log('ℹ️ Page Level Ads ya estaban inicializados globalmente');
                this.pageAdsInitialized = true;
            }
            
        } catch (error) {
            console.error('❌ Error inicializando Page Level Ads:', error);
        }
    }

    // ✅ RESTO DE FUNCIONES SIN CAMBIOS...
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
                    console.log('✅ Google AdSense script detectado');
                    resolve();
                } else if (attempts > 20) {
                    clearInterval(checkInterval);
                    console.warn('⚠️ Timeout esperando AdSense script');
                    reject(new Error('AdSense script timeout'));
                }
            }, 500);
        });
    }

    // ✅ RESTO DE MÉTODOS IGUALES...
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
            banner: {
                width: '100%',
                maxWidth: '728px',
                height: '90px',
                margin: '20px auto',
                textAlign: 'center'
            },
            square: {
                width: '300px',
                height: '250px',
                margin: '20px auto',
                textAlign: 'center'
            },
            mobile: {
                width: '100%',
                maxWidth: '320px',
                height: '50px',
                margin: '10px auto',
                textAlign: 'center'
            }
        };
        
        Object.assign(container.style, styles[type] || styles.banner);
        console.log(`📦 Contenedor de anuncio ${type} creado`);
    }

    // ✅ MÉTODOS DE ANUNCIOS SIMULADOS
    async showInterstitialAd(reason = 'game_over') {
        if (this.userPremium) {
            console.log('👑 Usuario premium - omitiendo anuncio intersticial');
            return Promise.resolve(true);
        }

        if (!this.canShowAd()) {
            console.log('⏰ Anuncio bloqueado por frecuencia');
            return Promise.resolve(false);
        }

        console.log(`📺 Mostrando anuncio intersticial: ${reason}`);

        return new Promise((resolve) => {
            this.showAdModal('interstitial', () => {
                this.updateAdFrequency();
                this.trackAdEvent('interstitial_completed', reason);
                resolve(true);
            });
        });
    }

    async showRewardedAd(reward = 'coins') {
        if (this.userPremium) {
            console.log('👑 Usuario premium - otorgando recompensa directa');
            this.grantReward(reward, true);
            return Promise.resolve(true);
        }

        console.log(`🎁 Mostrando anuncio con recompensa: ${reward}`);

        return new Promise((resolve) => {
            this.showAdModal('rewarded', () => {
                this.grantReward(reward);
                this.trackAdEvent('rewarded_completed', reward);
                resolve(true);
            }, () => {
                this.trackAdEvent('rewarded_skipped', reward);
                resolve(false);
            });
        });
    }

    showAdModal(type, onComplete, onSkip = null) {
        const modal = this.createAdModal(type);
        document.body.appendChild(modal);

        const duration = type === 'rewarded' ? 30000 : 5000;
        let timeLeft = duration / 1000;

        const countdownElement = modal.querySelector('.ad-countdown');
        const skipButton = modal.querySelector('.ad-skip');

        const countdown = setInterval(() => {
            timeLeft--;
            if (countdownElement) {
                countdownElement.textContent = timeLeft;
            }

            if (timeLeft <= 0) {
                clearInterval(countdown);
                this.closeAdModal(modal);
                onComplete();
            }
        }, 1000);

        if (type === 'interstitial') {
            setTimeout(() => {
                if (skipButton) {
                    skipButton.style.display = 'block';
                    skipButton.onclick = () => {
                        clearInterval(countdown);
                        this.closeAdModal(modal);
                        onComplete();
                    };
                }
            }, 5000);
        }

        if (type === 'rewarded' && onSkip) {
            const closeButton = modal.querySelector('.ad-close');
            if (closeButton) {
                closeButton.onclick = () => {
                    clearInterval(countdown);
                    this.closeAdModal(modal);
                    onSkip();
                };
            }
        }
    }

    createAdModal(type) {
        const modal = document.createElement('div');
        modal.className = 'ad-modal-web';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.95);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: 'Lato', sans-serif;
        `;

        const isRewarded = type === 'rewarded';

        modal.innerHTML = `
            <div class="ad-content-web" style="text-align: center; padding: 20px; max-width: 500px;">
                <div class="ad-icon" style="font-size: 4rem; margin-bottom: 20px;">
                    <i class="fas ${isRewarded ? 'fa-gift' : 'fa-tv'}"></i>
                </div>
                <h2 style="margin-bottom: 10px; color: #ffd700;">
                    ${isRewarded ? '🎁 Anuncio con Recompensa' : '📺 Anuncio Patrocinado'}
                </h2>
                <p style="margin-bottom: 20px; opacity: 0.8;">
                    ${isRewarded 
                        ? 'Mira el anuncio completo para recibir tu recompensa' 
                        : 'Gracias por apoyar Quiz Cristiano'}
                </p>
                
                <div class="ad-placeholder" style="
                    width: 400px;
                    height: 300px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 15px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    margin: 20px auto;
                    border: 3px solid #ffd700;
                    position: relative;
                    overflow: hidden;
                ">
                    <div style="text-align: center; z-index: 2;">
                        <i class="fas fa-cross" style="font-size: 3rem; margin-bottom: 15px; color: #ffd700;"></i>
                        <h3 style="margin: 10px 0; color: white;">Quiz Cristiano</h3>
                        <p style="margin: 5px 0; opacity: 0.9;">Fortalece tu fe jugando</p>
                    </div>
                </div>
                
                <div class="ad-timer" style="margin: 20px 0;">
                    <span>Tiempo restante: </span>
                    <span class="ad-countdown" style="color: #ffd700; font-weight: bold; font-size: 1.2rem;">${isRewarded ? '30' : '5'}</span>
                    <span> segundos</span>
                </div>
                
                <button class="ad-skip" style="
                    display: none;
                    background: #27ae60;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: bold;
                    transition: all 0.3s ease;
                ">
                    <i class="fas fa-forward"></i> Continuar
                </button>
                
                ${isRewarded ? `
                    <button class="ad-close" style="
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: rgba(255,255,255,0.2);
                        color: white;
                        border: none;
                        padding: 12px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 1.2rem;
                        transition: all 0.3s ease;
                    ">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </div>
        `;

        return modal;
    }

    closeAdModal(modal) {
        if (modal && modal.parentNode) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
        }
    }

    grantReward(rewardType, isPremium = false) {
        console.log(`🎁 Otorgando recompensa: ${rewardType}`);

        switch (rewardType) {
            case 'coins':
                const coins = isPremium ? 200 : 100;
                this.addCoinsReward(coins);
                break;
            case 'powerup':
                this.addPowerupReward();
                break;
            case 'revive':
                this.grantRevive();
                break;
            case 'double_coins':
                this.activateDoubleCoins();
                break;
            default:
                console.warn('Tipo de recompensa desconocido:', rewardType);
        }
    }

    addCoinsReward(amount) {
        if (window.GameDataManager) {
            window.GameDataManager.addCoins(amount, 'ad_reward');
            this.showRewardNotification(`¡+${amount} monedas!`, 'success');
        }
    }

    addPowerupReward() {
        if (window.GameDataManager) {
            const powerups = ['eliminate', 'timeExtender', 'secondChance'];
            const randomPowerup = powerups[Math.floor(Math.random() * powerups.length)];
            
            window.GameDataManager.addPowerup(randomPowerup, 1, 'ad_reward');
            this.showRewardNotification('¡Power-up gratis!', 'success');
        }
    }

    grantRevive() {
        window.dispatchEvent(new CustomEvent('adReviveGranted'));
        this.showRewardNotification('¡Reviviste!', 'success');
    }

    activateDoubleCoins() {
        const endTime = Date.now() + (30 * 60 * 1000);
        localStorage.setItem('doubleCoinsEnd', endTime.toString());
        window.dispatchEvent(new CustomEvent('doubleCoinsActivated'));
        this.showRewardNotification('¡Monedas dobles por 30 minutos!', 'success');
    }

    canShowAd() {
        const now = Date.now();
        const timeSinceLastAd = now - this.lastAdTime;
        const timeSinceSessionStart = now - this.sessionStartTime;
        
        return timeSinceLastAd >= this.adFrequency.timeBetweenAds &&
               this.adFrequency.interstitial < this.adFrequency.maxAdsPerSession &&
               timeSinceSessionStart >= this.adFrequency.minGameTimeBeforeAd;
    }

    updateAdFrequency() {
        this.lastAdTime = Date.now();
        this.adFrequency.interstitial++;
    }

    showRewardNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `ad-reward-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 9999;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
        `;
        
        notification.innerHTML = `<i class="fas fa-gift"></i> ${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showAdBlockerMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(231, 76, 60, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 9999;
            font-weight: bold;
            max-width: 300px;
            text-align: center;
        `;
        
        message.innerHTML = `
            <i class="fas fa-shield-alt"></i> 
            AdBlocker detectado. Los anuncios ayudan a mantener el juego gratuito.
        `;
        
        document.body.appendChild(message);
        setTimeout(() => message.remove(), 5000);
    }

    trackAdEvent(eventName, details = null) {
        if (window.gtag) {
            gtag('event', eventName, {
                event_category: 'ads',
                event_label: details,
                value: 1
            });
        }
        console.log(`📊 Ad Event: ${eventName}`, details);
    }

    isPremiumUser() {
        return this.userPremium;
    }

    activatePremium() {
        this.userPremium = true;
        localStorage.setItem('premium-account', 'true');
        console.log('👑 Cuenta premium activada - anuncios deshabilitados');
    }
}

// ✅ CREAR INSTANCIA ÚNICA
const adsManager = new AdsManager();
window.AdsManager = adsManager;

// CSS para animaciones
const adStyles = document.createElement('style');
adStyles.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(adStyles);

console.log('✅ AdsManager.js CORREGIDO cargado completamente');

export default adsManager;