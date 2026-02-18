import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User, Auth } from 'firebase/auth'
import { getFirestore, Firestore, doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { getAnalytics, Analytics } from 'firebase/analytics'
import { getDatabase, ref as rtdbRef, update as rtdbUpdate, serverTimestamp as rtdbServerTimestamp, Database } from 'firebase/database'

// Prefer env vars; fallback to provided web config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCGd8v-lIiK6X_daXYx49Tc9DtI96HvXvU',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'vcaas-c6c43.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'vcaas-c6c43',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'vcaas-c6c43.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '61832540435',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:61832540435:web:4553166bd9fc6df4286ae6',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-2VQGJNJ6XG',
}

// Initialize Firebase only on client side and when config is available
let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let googleProvider: GoogleAuthProvider | undefined
let analytics: Analytics | undefined
let rtdb: Database | undefined

if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
  try {
    analytics = getAnalytics(app)
  } catch {}
  try {
    rtdb = getDatabase(app)
  } catch {}
  
  // Configure Google Auth Provider
  googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({
    hd: 'gmail.com' // Restrict to Gmail domain (adjust/remove as needed)
  })
}

export { auth, db, app, analytics }

// Create/Update user profile in Firestore
export const upsertUserProfile = async (user: User | null, extras?: Partial<Pick<User, 'email' | 'phoneNumber' | 'displayName' | 'photoURL'>>) => {
  if (!user || !db) return { success: false, error: 'No user or DB' }
  try {
    const ref = doc(db, 'users', user.uid)
    const snap = await getDoc(ref)
    const base = {
      uid: user.uid,
      email: extras?.email ?? user.email ?? null,
      displayName: extras?.displayName ?? user.displayName ?? null,
      photoURL: extras?.photoURL ?? user.photoURL ?? null,
      phoneNumber: extras?.phoneNumber ?? (user as any).phoneNumber ?? null,
      providerId: user.providerData?.[0]?.providerId ?? null,
      updatedAt: serverTimestamp(),
    }
    if (snap.exists()) {
      await updateDoc(ref, base as any)
    } else {
      await setDoc(ref, { ...base, createdAt: serverTimestamp() } as any)
    }
    // Also mirror to Realtime Database at /users/{uid}
    try {
      if (rtdb && app) {
        await rtdbUpdate(rtdbRef(rtdb, `users/${user.uid}`), {
          uid: base.uid,
          email: base.email,
          displayName: base.displayName,
          photoURL: base.photoURL,
          phoneNumber: base.phoneNumber,
          providerId: base.providerId,
          updatedAt: rtdbServerTimestamp(),
        } as any)
      }
    } catch {}
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e?.message }
  }
}

// Helper function to check if Firebase is initialized
export const isFirebaseInitialized = (): boolean => {
  return typeof window !== 'undefined' && !!auth && !!db && !!googleProvider
}

// Authentication functions
export const signInWithGoogle = async () => {
  if (!isFirebaseInitialized() || !auth || !googleProvider) {
    return {
      success: false,
      error: 'Firebase is not initialized'
    }
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    
    // Log user info for development
    console.log('Google Sign-In successful:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    })
    
    return {
      success: true,
      user: user,
      isNewUser: result.providerId === 'google.com'
    }
  } catch (error: any) {
    console.error('Google Sign-In error:', error)
    
    let errorMessage = 'Google sign-in failed. Please try again.'
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in was cancelled. Please try again.'
        break
      case 'auth/popup-blocked':
        errorMessage = 'Popup was blocked. Please enable popups and try again.'
        break
      case 'auth/cancelled-popup-request':
        errorMessage = 'Another sign-in popup is already open.'
        break
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection and try again.'
        break
      case 'auth/too-many-requests':
        errorMessage = 'Too many attempts. Please try again later.'
        break
    }
    
    return {
      success: false,
      error: errorMessage,
      code: error.code
    }
  }
}

export const signOutUser = async () => {
  if (!isFirebaseInitialized() || !auth) {
    return { 
      success: false, 
      error: 'Firebase is not initialized' 
    }
  }
  
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    console.error('Sign-out error:', error)
    return { success: false, error: error.message }
  }
}

// Helper function to get current user
export const getCurrentUser = (): User | null => {
  if (!isFirebaseInitialized() || !auth) {
    return null
  }
  return auth.currentUser
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (!isFirebaseInitialized() || !auth) {
    return false
  }
  return !!auth.currentUser
}