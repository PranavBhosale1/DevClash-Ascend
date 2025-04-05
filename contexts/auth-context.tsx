"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Error checking auth session:", error)
      } finally {
        setLoading(false)
      }
    }
    
    initializeAuth()

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, !!session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Force router refresh when auth state changes
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      // First check if the profiles table exists
      const { error: tableCheckError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
        .limit(1)
      
      // Create user in auth
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      
      if (signUpError) throw signUpError

      // Only try to create profile if the table exists and we have user data
      if (!tableCheckError && data.user) {
        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
                full_name: fullName,
                created_at: new Date().toISOString(),
              },
            ])
          
          if (profileError) {
            console.warn("Could not create profile, but user was created:", profileError)
          }
        } catch (profileInsertError) {
          console.warn("Error during profile creation:", profileInsertError)
          // Continue without profile creation - auth succeeded
        }
      } else if (tableCheckError) {
        console.warn("Profiles table not found. Please create it in your Supabase project.")
      }

      // No error thrown for profile creation issues - auth succeeded
      return data
    } catch (error) {
      console.error("Error during sign up:", error)
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push("/signin")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 