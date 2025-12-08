# Security Note: Firebase API Keys

## Why Firebase API Keys Are Safe to Expose

The Firebase API key visible in `src/config/firebase.js` is **NOT a security risk**. Here's why:

### Firebase Web API Keys Are Public
- Firebase API keys for web applications are designed to be public
- They are used to identify your Firebase project, not to authenticate users
- They are included in every web app that uses Firebase

### Security Is Enforced Through:
1. **Firebase Security Rules** - Control access to Firestore, Storage, etc.
2. **Authentication** - Users must be authenticated to access protected resources
3. **Domain Restrictions** - Configure authorized domains in Firebase Console

### What You Should Protect:
- ❌ **Service Account Keys** (server-side JSON files)
- ❌ **Database URLs with admin access**
- ❌ **Private API keys** (not Firebase web API keys)

### References:
- [Firebase Documentation: API Keys](https://firebase.google.com/docs/projects/api-keys)
- [Is it safe to expose Firebase apiKey?](https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public)

## Current Security Measures
✅ Firebase Security Rules configured in `firestore.rules`
✅ Authentication required for sensitive operations
✅ Domain restrictions can be configured in Firebase Console

## To Close the GitHub Security Alert:
1. Go to your repository's Security tab
2. Find the alert about the Firebase API key
3. Click "Dismiss alert" → "Won't fix" → "This is used in tests" or "This is a public key"
