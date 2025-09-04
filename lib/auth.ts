// Simple authentication utilities for the equipment checklist system
export interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin"
}

// Mock admin users - in production this would come from a database
const mockAdmins: AdminUser[] = [
  {
    id: "1",
    email: "admin@empresa.com",
    name: "Administrador",
    role: "admin",
  },
  {
    id: "2",
    email: "gestor@empresa.com",
    name: "Gestor de Equipamentos",
    role: "admin",
  },
]

export class AuthService {
  private static readonly ADMIN_SESSION_KEY = "admin_session"
  private static readonly SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours

  // Admin authentication
  static async authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
    // Simple password check - in production use proper hashing
    const validCredentials = [
      { email: "admin@empresa.com", password: "admin123" },
      { email: "gestor@empresa.com", password: "gestor123" },
    ]

    const credential = validCredentials.find((c) => c.email === email && c.password === password)
    if (!credential) return null

    const admin = mockAdmins.find((a) => a.email === email)
    if (!admin) return null

    // Store session in localStorage
    const session = {
      user: admin,
      expiresAt: Date.now() + this.SESSION_DURATION,
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(this.ADMIN_SESSION_KEY, JSON.stringify(session))
    }

    return admin
  }

  static getAdminSession(): AdminUser | null {
    if (typeof window === "undefined") return null

    try {
      const sessionData = localStorage.getItem(this.ADMIN_SESSION_KEY)
      if (!sessionData) return null

      const session = JSON.parse(sessionData)
      if (Date.now() > session.expiresAt) {
        this.logout()
        return null
      }

      return session.user
    } catch {
      return null
    }
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.ADMIN_SESSION_KEY)
    }
  }

  static isAuthenticated(): boolean {
    return this.getAdminSession() !== null
  }

  // Employee verification (simple ID check)
  static verifyEmployee(employeeId: string): boolean {
    // In production, this would check against the database
    return employeeId.length >= 1 && /^\d+$/.test(employeeId)
  }
}
