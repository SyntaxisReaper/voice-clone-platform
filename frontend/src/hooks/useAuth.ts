import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth, signInWithGoogle, signOutUser, isFirebaseInitialized, upsertUserProfile } from '@/lib/firebase'

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (!isFirebaseInitialized() || !auth) {
      setAuthState({
        user: null,
        loading: false,
        error: 'Firebase is not initialized'
      })
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await upsertUserProfile(user)
        try {
          const token = await user.getIdToken()
          const { syncUserProfile } = await import('@/lib/api')
          await syncUserProfile(user as any, token)
        } catch {}
      }
      setAuthState({
        user,
        loading: false,
        error: null
      })
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogleHandler = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const result = await signInWithGoogle()
    
    if (!result.success) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: result.error || 'Sign-in failed' 
      }))
    } else {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
    
    return result
  }

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    const result = await signOutUser()
    
    if (!result.success) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: result.error || 'Sign-out failed' 
      }))
    }
    
    return result
  }

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }))
  }

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signInWithGoogle: signInWithGoogleHandler,
    signOut,
    clearError,
    isAuthenticated: !!authState.user
  }
}