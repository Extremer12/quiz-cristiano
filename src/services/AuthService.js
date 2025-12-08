import { auth, googleProvider, facebookProvider } from '../config/firebase.js';
import { signInWithPopup, signInWithRedirect } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

class AuthService {
    constructor() {
        this.protectionFlags = [
            "NAVIGATING_AWAY",
            "PROCESSING_LOGIN",
            "USING_REDIRECT_LOGIN",
            "REDIRECTING_TO_LOGIN",
            "CHANGING_USER",
        ];
    }

    async loginWithGoogle() {
        try {
            console.log('🔑 Iniciando login con Google...');
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            console.log('✅ Login exitoso:', user.displayName);
            this.handleSuccessfulLogin(user, 'google');
            return user;
        } catch (error) {
            console.error('❌ Error en login Google:', error);
            if (error.code === 'auth/popup-blocked') {
                await signInWithRedirect(auth, googleProvider);
            }
            throw error;
        }
    }

    async loginWithFacebook() {
        try {
            console.log('🔑 Iniciando login con Facebook...');
            const result = await signInWithPopup(auth, facebookProvider);
            const user = result.user;
            console.log('✅ Login exitoso:', user.displayName);
            this.handleSuccessfulLogin(user, 'facebook');
            return user;
        } catch (error) {
            console.error('❌ Error en login Facebook:', error);
            if (error.code === 'auth/popup-blocked') {
                await signInWithRedirect(auth, facebookProvider);
            }
            throw error;
        }
    }

    handleSuccessfulLogin(user, method) {
        // Guardar datos básicos en localStorage
        const userData = {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            loginMethod: method,
            loginTimestamp: Date.now()
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('loginCompleted', 'true');

        // Redirigir
        window.location.href = 'index.html';
    }

    checkAuth() {
        console.log("=== VERIFICACIÓN OPTIMIZADA DE AUTH ===");

        const hasProtectionFlag = this.protectionFlags.some((flag) =>
            sessionStorage.getItem(flag)
        );

        if (hasProtectionFlag) {
            console.log("🛡️ Protección anti-bucle activa - Saltando verificación");

            // Limpiar flags después de un tiempo razonable
            setTimeout(() => {
                this.protectionFlags.forEach((flag) => sessionStorage.removeItem(flag));
                console.log("Flags de protección limpiados");
            }, 3000);

            return true; // Asumimos válido para evitar bucles
        }

        // Verificación rápida de datos esenciales
        const authData = {
            currentUser: localStorage.getItem("currentUser"),
            gameData: localStorage.getItem("quizCristianoData"),
            loginCompleted: localStorage.getItem("loginCompleted"),
        };

        console.log("Datos de auth:", {
            hasUser: !!authData.currentUser,
            hasGameData: !!authData.gameData,
            hasLoginFlag: !!authData.loginCompleted,
        });

        if (authData.currentUser && authData.loginCompleted) {
            try {
                const userData = JSON.parse(authData.currentUser);
                const loginTime = userData.loginTimestamp || 0;
                const now = Date.now();
                const maxAge = 24 * 60 * 60 * 1000; // 24 horas

                if (now - loginTime < maxAge) {
                    console.log("✅ Sesión válida - Continuando carga");
                    return true;
                }

                console.log("⏰ Sesión expirada");
            } catch (e) {
                console.warn("⚠️ Error validando datos de usuario:", e.message);
            }
        }

        // Si estamos en login.html, no redirigir
        if (window.location.pathname.includes('login.html')) {
            return false;
        }

        this.redirectToLogin();
        return false;
    }

    redirectToLogin() {
        console.log("Redirigiendo a login...");

        // Marcar redirección para evitar bucles
        sessionStorage.setItem("REDIRECTING_TO_LOGIN", "true");

        // Limpiar datos inválidos
        ["currentUser", "loginCompleted"].forEach((key) =>
            localStorage.removeItem(key)
        );

        // Redirección inmediata pero segura
        setTimeout(() => {
            window.location.replace("login.html");
        }, 100);
    }

    async changeUser() {
        if (confirm("¿Estás seguro de que quieres cambiar de usuario? Se guardarán tus datos automáticamente.")) {
            console.log("=== INICIANDO CAMBIO DE USUARIO SEGURO ===");

            try {
                sessionStorage.setItem("CHANGING_USER", "true");

                // Aquí deberíamos llamar a Firebase si estuviera modularizado, 
                // pero por ahora mantenemos la lógica básica

                // Limpiar completamente
                localStorage.clear();
                sessionStorage.clear();

                sessionStorage.setItem('USER_CHANGE_REQUEST', 'true');

                console.log('Redirigiendo a login para cambio de usuario...');
                window.location.replace('login.html?change=true');

            } catch (error) {
                console.error('❌ Error en cambio de usuario:', error);
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace('login.html');
            }
        }
    }
}

export default new AuthService();
