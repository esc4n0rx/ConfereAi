import bcrypt from 'bcryptjs'
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/client' 
import { PostgrestError } from '@supabase/supabase-js'

// Tipagem explícita extraída do tipo genérico Database
type AdminTableRow = Database['public']['Tables']['confereai_admins']['Row']
type AdminTableInsert = Database['public']['Tables']['confereai_admins']['Insert']

export interface AdminUser {
  id: string
  matricula: string
  email: string
  name: string
  role: string
}

export interface LoginCredentials {
  matricula: string
  password: string
}

export interface AuthSession {
  user: AdminUser
  expiresAt: number
}

export class AuthAPI {
  private static readonly SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours

  static async authenticateAdmin(credentials: LoginCredentials): Promise<AdminUser | null> {
    try {
      const supabase = createServerClient()
      
      // Usamos a asserção de tipo 'as' para forçar a tipagem correta
      const { data: admin, error } = await supabase
        .from('confereai_admins')
        .select('id, matricula, email, name, role, password_hash')
        .eq('matricula', credentials.matricula)
        .eq('is_active', true)
        .single() as { data: AdminTableRow | null, error: PostgrestError | null }

      if (error || !admin) {
        return null
      }

      const isPasswordValid = await bcrypt.compare(credentials.password, admin.password_hash)
      
      if (!isPasswordValid) {
        return null
      }

      return {
        id: admin.id,
        matricula: admin.matricula,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    } catch (error) {
      console.error('Authentication error:', error)
      return null
    }
  }

  static async createAdmin(adminData: {
    matricula: string
    email: string
    name: string
    password: string
    role?: string
  }): Promise<AdminUser | null> {
    try {
      const supabase = createServerClient()
      
      const passwordHash = await bcrypt.hash(adminData.password, 12)
      
      const adminToInsert: AdminTableInsert = {
        matricula: adminData.matricula,
        email: adminData.email,
        name: adminData.name,
        password_hash: passwordHash,
        role: adminData.role || 'admin'
      }

      const { data: admin, error } = await supabase
        .from('confereai_admins')
        .insert(adminToInsert as any)
        .select('id, matricula, email, name, role')
        .single() as { data: Omit<AdminTableRow, 'password_hash' | 'created_at' | 'is_active' | 'updated_at'> | null, error: PostgrestError | null }

      if (error || !admin) {
        if (error) {
            console.error('Supabase insert error:', error.message)
        }
        throw error || new Error("Admin creation failed and no data was returned.")
      }

      return {
        id: admin.id,
        matricula: admin.matricula,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    } catch (error) {
      console.error('Create admin error:', error)
      return null
    }
  }

  static async getAdminById(id: string): Promise<AdminUser | null> {
    try {
      const supabase = createServerClient()
      
      const { data: admin, error } = await supabase
        .from('confereai_admins')
        .select('id, matricula, email, name, role')
        .eq('id', id)
        .eq('is_active', true)
        .single() as { data: Pick<AdminTableRow, 'id' | 'matricula' | 'email' | 'name' | 'role'> | null, error: PostgrestError | null }

      if (error || !admin) {
        return null
      }

      return admin
    } catch (error) {
      console.error('Get admin error:', error)
      return null
    }
  }

  static createSession(user: AdminUser): AuthSession {
    return {
      user,
      expiresAt: Date.now() + this.SESSION_DURATION
    }
  }

  static validateSession(session: AuthSession): boolean {
    return Date.now() < session.expiresAt
  }
}