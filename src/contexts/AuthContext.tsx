'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { registerMember } from '@/lib/auth-actions'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  tNumber: string
  verified: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  createCredentials: (tNumber: string, username: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = async (username: string, password: string) => {
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    if (result?.error) {
      throw new Error('Invalid username or password')
    }

    if (!result?.ok) {
      throw new Error('Login failed. Please try again.')
    }

    // Successful login - NextAuth will update the session
    return
  }

  const logout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const createCredentials = async (
    tNumber: string,
    username: string,
    email: string,
    password: string
  ) => {
    // Use server action instead of API route
    const result = await registerMember({
      t_number: tNumber,
      username,
      email,
      password,
    })

    if (!result.success) {
      throw new Error(result.error || 'Registration failed')
    }

    // Auto-login after successful registration
    await login(username, password)
  }

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        tNumber: session.user.tNumber,
        verified: session.user.verified,
      }
    : null

  const value: AuthContextType = {
    user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    login,
    logout,
    createCredentials,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
