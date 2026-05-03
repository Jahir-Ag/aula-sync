'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { getProfile } from '@/services/profiles'
import { Profile } from '@/types'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  hasProfile: boolean
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  const loading = !authReady || profileLoading

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true)
    try {
      const p = await getProfile(userId)
      setProfile(p)
    } catch {
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (userId) await fetchProfile(userId)
  }

  const userId = user?.id

  useEffect(() => {
    let active = true

    // Obtener sesión inicial sin trabajo pesado dentro del callback de auth.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      setSession(session)
      setUser(session?.user ?? null)
      setAuthReady(true)
    })

    // Escuchar cambios de auth sin awaits para evitar deadlocks del lock interno.
    // Use the event to avoid overwriting an existing session with null unless
    // the user actually signed out or the account was removed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Clear only on explicit sign-out or account deletion
        if (event === 'SIGNED_OUT') {
          //use if is necesary if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setSession(null)
          setUser(null)
          setProfile(null)
        } else {
          setSession(newSession)
          setUser(newSession?.user ?? null)
        }
        setAuthReady(true)
      }
    )

    const handleVisibility = () => {
      if (!document.hidden) {
        void supabase.auth.getSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      active = false
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  useEffect(() => {
    if (!authReady) return

    if (!userId) {
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        setProfileLoading(true)
        const p = await getProfile(userId)
        if (!cancelled) setProfile(p)
      } catch {
        if (!cancelled) setProfile(null)
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [authReady, userId])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        hasProfile: !!profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
