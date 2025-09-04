import { createServerClient } from '@/lib/supabase/server'
import type { Manager, CreateManagerData, UpdateManagerData } from '@/lib/types'

export class ManagersAPI {
  static async getAllManagers(): Promise<Manager[]> {
    try {
      const supabase = createServerClient()
      
      const { data: managers, error } = await supabase
        .from('confereai_managers')
        .select('*')
        .eq('is_active', true)
        .order('nome', { ascending: true })

      if (error) {
        throw new Error(error.message)
      }

      return managers || []
    } catch (error) {
      console.error('Erro ao buscar encarregados:', error)
      throw error
    }
  }

  static async createManager(data: CreateManagerData): Promise<Manager> {
    try {
      const supabase = createServerClient()
      
      const { data: existing } = await supabase
        .from('confereai_managers')
        .select('id')
        .eq('telefone', data.telefone)
        .eq('is_active', true)
        .single()

      if (existing) {
        throw new Error('Já existe um encarregado com este telefone')
      }

      const { data: manager, error } = await supabase
        .from('confereai_managers')
        .insert([{
          nome: data.nome.trim(),
          telefone: data.telefone.trim(),
          is_active: true,
        }])
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return manager
    } catch (error) {
      console.error('Erro ao criar encarregado:', error)
      throw error
    }
  }

  static async updateManager(id: string, data: UpdateManagerData): Promise<Manager> {
    try {
      const supabase = createServerClient()
      
      const { data: manager, error } = await supabase
        .from('confereai_managers')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return manager
    } catch (error) {
      console.error('Erro ao atualizar encarregado:', error)
      throw error
    }
  }

  static async deleteManager(id: string): Promise<void> {
    try {
      const supabase = createServerClient()
      
      const { error } = await supabase
        .from('confereai_managers')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Erro ao deletar encarregado:', error)
      throw error
    }
  }
}