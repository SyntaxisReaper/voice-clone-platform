import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase only on client side and when config is available
let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let googleProvider: GoogleAuthProvider | undefined

if (typeof window !== 'undefined' && firebaseConfig.apiKey) {
  // Only initialize on client side with valid config
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
  
  // Configure Google Auth Provider
  googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({
    hd: 'gmail.com' // Restrict to Gmail domain
  })
}

export { auth, db }

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