// js/config/config.js
// Configuración para desarrollo - Quiz Cristiano
window.CONFIG = {
  firebase: {
    apiKey: "AIzaSyDemo_Replace_With_Your_Key",
    authDomain: "quiz-cristiano-demo.firebaseapp.com",
    projectId: "quiz-cristiano-demo",
    storageBucket: "quiz-cristiano-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:demo123456789"
  },
  mercadopago: {
    publicKey: "TEST-demo-public-key-replace-me",
    accessToken: "TEST-demo-access-token-replace-me"
  },
  paypal: {
    clientId: "demo-paypal-client-id-replace-me",
    environment: "sandbox" // sandbox | production
  },
  environment: "development", // development | production
  features: {
    enablePayments: false, // Deshabilitado hasta configurar credenciales reales
    enableAnalytics: false,
    enableAds: false,
    enableOfflineMode: true
  },
  app: {
    name: "Quiz Cristiano",
    version: "1.3.0",
    baseUrl: "http://localhost:3000"
  }
};

// Configuración cargada globalmente
console.log('Configuración cargada:', {
  environment: window.CONFIG.environment,
  features: window.CONFIG.features,
  firebase: window.CONFIG.firebase.projectId
});