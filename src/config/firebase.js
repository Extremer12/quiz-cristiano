/**
 * Firebase Configuration & Initialization
 * 
 * IMPORTANT: Firebase API keys for web apps are safe to expose publicly.
 * They are not secret and are meant to identify your Firebase project.
 * Security is enforced through Firebase Security Rules, not by hiding the API key.
 * 
 * Reference: https://firebase.google.com/docs/projects/api-keys
 */

const firebaseConfig = {
    apiKey: "AIzaSyBFQGl3T4szFn98mhJfyBrtrAaaqeWFRf8",
    authDomain: "quiz-cristiano-gaming.firebaseapp.com",
    projectId: "quiz-cristiano-gaming",
    storageBucket: "quiz-cristiano-gaming.firebasestorage.app",
    messagingSenderId: "67761249217",
    appId: "1:67761249217:web:5c370622351a2b8200ad40"
};

let app, auth, db, analytics, googleProvider, facebookProvider;

if (window.firebase) {
    try {
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
        } else {
            app = firebase.apps[0];
        }

        auth = firebase.auth();
        db = firebase.firestore();
        analytics = firebase.analytics();

        // Initialize providers
        googleProvider = new firebase.auth.GoogleAuthProvider();
        facebookProvider = new firebase.auth.FacebookAuthProvider();

        console.log('✅ Firebase initialized via src/config/firebase.js');
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
    }
} else {
    console.error('❌ Firebase SDK not loaded');
}

export { app, auth, db, analytics, firebaseConfig, googleProvider, facebookProvider };


