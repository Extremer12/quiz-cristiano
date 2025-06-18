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

// Función helper para login anónimo
export const signInAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log('✅ Login anónimo exitoso');
    return result.user;
  } catch (error) {
    console.error('❌ Error en login anónimo:', error);
    throw error;
  }
};

// Función para guardar datos del usuario
export const saveUserData = async (uid, data) => {
  try {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
    console.log('💾 Datos guardados en Firestore');
  } catch (error) {
    console.error('❌ Error guardando datos:', error);
  }
};

// Función para obtener datos del usuario
export const getUserData = async (uid) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      console.log('📦 Datos obtenidos de Firestore');
      return docSnap.data();
    } else {
      console.log('📋 Usuario nuevo, no hay datos previos');
      return null;
    }
  } catch (error) {
    console.error('❌ Error obteniendo datos:', error);
    return null;
  }
};