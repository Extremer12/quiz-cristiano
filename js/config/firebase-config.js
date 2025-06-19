import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInAnonymously, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// 🔥 TU CONFIGURACIÓN FIREBASE REAL
const firebaseConfig = {
  apiKey: "AIzaSyBFQGl3T4szFn98mhJfyBrtrAaaqeWFRf8",
  authDomain: "quiz-cristiano-gaming.firebaseapp.com",
  projectId: "quiz-cristiano-gaming",
  storageBucket: "quiz-cristiano-gaming.firebasestorage.app",
  messagingSenderId: "67761249217",
  appId: "1:67761249217:web:5c370622351a2b8200ad40"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Configurar provider de Google
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

console.log('🔥 Firebase inicializado correctamente');

// ✅ EXPORTAR TODAS LAS FUNCIONES NECESARIAS
export { signOut, onAuthStateChanged };

// Función helper para login con Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Login exitoso:', result.user.displayName);
    return result.user;
  } catch (error) {
    console.error('❌ Error en login:', error);
    throw error;
  }
};

// ✅ FUNCIÓN DE LOGIN ANÓNIMO CORREGIDA - SIN FIRESTORE
export const signInAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log('✅ Login anónimo exitoso');
    
    // ✅ NO INTENTAR GUARDAR EN FIRESTORE PARA USUARIOS ANÓNIMOS
    // Solo usar localStorage para usuarios invitados
    
    return result.user;
  } catch (error) {
    console.error('❌ Error en login anónimo:', error);
    throw error;
  }
};

// ✅ FUNCIÓN MEJORADA PARA GUARDAR - VERIFICAR PERMISOS
export const saveUserData = async (uid, data) => {
  try {
    // ✅ VERIFICAR QUE EL USUARIO ESTÁ AUTENTICADO
    if (!auth.currentUser) {
      console.warn('⚠️ No hay usuario autenticado para guardar datos');
      return false;
    }
    
    // ✅ NO GUARDAR EN FIRESTORE SI ES USUARIO ANÓNIMO (OPCIONAL)
    if (auth.currentUser.isAnonymous) {
      console.log('👤 Usuario anónimo - usando solo localStorage');
      return true; // Permitir que GameDataManager use localStorage
    }
    
    // Estructura clara de datos para Firestore
    const userData = {
      profile: {
        name: data.profile?.name || auth.currentUser.displayName || 'Usuario',
        email: data.profile?.email || auth.currentUser.email,
        photo: data.profile?.photo || auth.currentUser.photoURL,
        loginMethod: data.profile?.loginMethod || (auth.currentUser.isAnonymous ? 'anonymous' : 'google'),
        lastLogin: new Date(),
        createdAt: data.profile?.createdAt || new Date()
      },
      gameData: {
        coins: data.gameData?.coins || 0,
        gamesPlayed: data.gameData?.gamesPlayed || 0,
        victories: data.gameData?.victories || 0,
        perfectGames: data.gameData?.perfectGames || 0,
        lastPlayDate: data.gameData?.lastPlayDate || null,
        achievements: data.gameData?.achievements || [],
        stats: data.gameData?.stats || {},
        settings: data.gameData?.settings || {
          theme: 'light',
          soundEnabled: true,
          vibrationEnabled: true
        }
      },
      inventory: {
        eliminate: data.inventory?.eliminate || 0,
        timeExtender: data.inventory?.timeExtender || 0,
        secondChance: data.inventory?.secondChance || 0
      },
      profileCustomization: {
        username: data.profileCustomization?.username || '',
        displayName: data.profileCustomization?.displayName || '',
        favoriteVerse: data.profileCustomization?.favoriteVerse || '',
        currentAvatar: data.profileCustomization?.currentAvatar || 'assets/images/mascota.png'
      },
      lastUpdated: new Date(),
      version: '1.0.0'
    };
    
    // ✅ INTENTAR GUARDAR CON MANEJO DE ERRORES MEJORADO
    try {
      await setDoc(doc(db, 'users', uid), userData, { merge: true });
      console.log('💾 ✅ Datos guardados en Firestore correctamente');
      return true;
    } catch (firestoreError) {
      console.warn('⚠️ Error guardando en Firestore, usando solo localStorage:', firestoreError);
      return true; // Permitir que continúe con localStorage
    }
    
  } catch (error) {
    console.error('❌ Error en saveUserData:', error);
    return false;
  }
};

// ✅ FUNCIÓN MEJORADA PARA OBTENER DATOS DEL USUARIO
export const getUserData = async (uid) => {
  try {
    if (!auth.currentUser) {
      console.warn('⚠️ No hay usuario autenticado para obtener datos');
      return null;
    }
    
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      const userData = docSnap.data();
      console.log('📦 ✅ Datos obtenidos de Firestore:', userData);
      return userData;
    } else {
      console.log('📋 Usuario nuevo, no hay datos previos en Firestore');
      return null;
    }
  } catch (error) {
    console.error('❌ Error obteniendo datos de Firestore:', error);
    return null;
  }
};

// ✅ NUEVA FUNCIÓN PARA ACTUALIZAR SOLO DATOS DE JUEGO
export const updateGameStats = async (uid, gameStats) => {
  try {
    if (!auth.currentUser) {
      console.warn('⚠️ No hay usuario autenticado');
      return false;
    }
    
    const updateData = {
      'gameData.coins': gameStats.coins,
      'gameData.gamesPlayed': gameStats.gamesPlayed,
      'gameData.victories': gameStats.victories,
      'gameData.perfectGames': gameStats.perfectGames,
      'gameData.lastPlayDate': new Date(),
      'gameData.stats': gameStats.stats || {},
      'lastUpdated': new Date()
    };
    
    await updateDoc(doc(db, 'users', uid), updateData);
    console.log('🎮 ✅ Estadísticas de juego actualizadas en Firestore');
    return true;
    
  } catch (error) {
    console.error('❌ Error actualizando estadísticas:', error);
    return false;
  }
};

// ✅ NUEVA FUNCIÓN PARA ACTUALIZAR INVENTARIO
export const updateInventory = async (uid, inventory) => {
  try {
    if (!auth.currentUser) {
      console.warn('⚠️ No hay usuario autenticado');
      return false;
    }
    
    const updateData = {
      'inventory.eliminate': inventory.eliminate || 0,
      'inventory.timeExtender': inventory.timeExtender || 0,
      'inventory.secondChance': inventory.secondChance || 0,
      'lastUpdated': new Date()
    };
    
    await updateDoc(doc(db, 'users', uid), updateData);
    console.log('🎒 ✅ Inventario actualizado en Firestore');
    return true;
    
  } catch (error) {
    console.error('❌ Error actualizando inventario:', error);
    return false;
  }
};