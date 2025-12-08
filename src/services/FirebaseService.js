/**
 * Servicio de Operaciones con Firebase
 * Maneja la sincronización de datos, guardado y recuperación
 */

import { auth, db } from '../config/firebase.js';

class FirebaseService {
    constructor() {
        this.autoSyncInterval = null;
    }

    init() {
        this.startAutoSync();
        console.log('🔥 FirebaseService inicializado');
    }

    async saveUserData(uid, data) {
        console.log('=== GUARDANDO DATOS EN FIREBASE ===');

        try {
            if (!auth.currentUser) {
                console.warn('⚠️ No hay usuario autenticado');
                return false;
            }

            // Asegurar timestamp
            data.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();

            await db.collection('users').doc(uid).set(data, { merge: true });
            console.log('✅ Datos guardados exitosamente en Firebase');
            return true;

        } catch (error) {
            console.error('❌ Error guardando en Firebase:', error);
            return false;
        }
    }

    async getUserData(uid) {
        try {
            if (!auth.currentUser) {
                console.warn('⚠️ No hay usuario autenticado');
                return null;
            }

            console.log('Obteniendo datos de Firebase para UID:', uid);
            const docSnap = await db.collection('users').doc(uid).get();

            if (docSnap.exists) {
                console.log('✅ Datos encontrados en Firebase');
                return docSnap.data();
            } else {
                console.log('No hay datos para este usuario en Firebase');
                return null;
            }
        } catch (error) {
            console.error('❌ Error obteniendo datos de Firebase:', error);
            return null;
        }
    }

    async syncUserDataToFirebase() {
        if (!auth.currentUser) {
            // console.warn('⚠️ No hay usuario para sincronizar');
            return false;
        }

        console.log('=== SINCRONIZANDO DATOS LOCALES A FIREBASE ===');

        try {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const gameData = JSON.parse(localStorage.getItem('quizCristianoData') || '{}');
            const inventory = JSON.parse(localStorage.getItem('userInventory') || '{}');
            const profileCustomization = JSON.parse(localStorage.getItem('user-profile') || '{}');
            const ranking = JSON.parse(localStorage.getItem('playerRankingData') || '{}');

            gameData.lastPlayDate = Date.now();

            const fullData = {
                profile: {
                    name: currentUser.name,
                    email: currentUser.email,
                    photo: currentUser.photo,
                    loginMethod: currentUser.loginMethod || 'google'
                },
                gameData: gameData,
                inventory: inventory,
                profileCustomization: profileCustomization,
                ranking: ranking
            };

            const success = await this.saveUserData(auth.currentUser.uid, fullData);

            if (success) {
                console.log('✅ Sincronización completada exitosamente');
            } else {
                console.warn('⚠️ Error en la sincronización');
            }

            return success;

        } catch (error) {
            console.error('❌ Error en sincronización:', error);
            return false;
        }
    }

    startAutoSync() {
        if (this.autoSyncInterval) clearInterval(this.autoSyncInterval);

        this.autoSyncInterval = setInterval(async () => {
            if (auth.currentUser && navigator.onLine) {
                console.log('Auto-sincronización...');
                await this.syncUserDataToFirebase();
            }
        }, 30000); // 30 segundos
    }
}

export default new FirebaseService();
