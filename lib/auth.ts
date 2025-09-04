// lib/auth.ts
import type { AdminUser } from './api/auth'

export interface AuthSession {
  user: AdminUser
  expiresAt: number
}

export class AuthService {
  private static readonly CLIENT_SESSION_KEY = "admin_session_client"

  static async authenticateAdmin(matricula: string, password: string): Promise<AdminUser | null> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ matricula, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro de autenticação')
      }

      const { user } = await response.json()
      
      // Store session in localStorage for client-side access
      const session: AuthSession = {
        user,
        expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.CLIENT_SESSION_KEY, JSON.stringify(session))
      }

      return user
    } catch (error) {
      console.error('Authentication error:', error)
      throw error
    }
  }

  static async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.CLIENT_SESSION_KEY)
      }
    }
  }

  static async getSession(): Promise<AdminUser | null> {
    try {
      const response = await fetch('/api/auth/session')
      
      if (!response.ok) {
        return null
      }

      const { user } = await response.json()
      
      if (user && typeof window !== 'undefined') {
        // Sync client session
        const session: AuthSession = {
          user,
          expiresAt: Date.now() + (8 * 60 * 60 * 1000)
        }
        localStorage.setItem(this.CLIENT_SESSION_KEY, JSON.stringify(session))
      }

      return user
    } catch (error) {
      console.error('Session validation error:', error)
      return null
    }
  }

  static getAdminSession(): AdminUser | null {
    if (typeof window === 'undefined') return null

    try {
      const sessionData = localStorage.getItem(this.CLIENT_SESSION_KEY)
      if (!sessionData) return null

      const session: AuthSession = JSON.parse(sessionData)
      if (Date.now() > session.expiresAt) {
        this.logout()
        return null
      }

      return session.user
    } catch {
      return null
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getSession()
    return user !== null
  }

  static verifyEmployee(employeeId: string): boolean {
    return employeeId.length >= 1 && /^\d+$/.test(employeeId)
  }
}