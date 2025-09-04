// lib/api/checklist.ts
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/client'
import type { 
  ChecklistData, 
  DatabaseEmployee, 
  DatabaseEquipment,
  ChecklistPhoto,
  CreateChecklistData
} from '@/lib/types'

export class ChecklistAPI {
  
  static async generateChecklistToken(): Promise<{ token: string }> {
    try {
      const supabase = createServerClient()
      
      // Verificar se o token permanente já existe
      const { data: existingToken } = await supabase
        .from('confereai_checklist_tokens')
        .select('token')
        .eq('token', 'preecher-checklist')
        .eq('is_active', true)
        .single()

      if (existingToken) {
        return { token: existingToken.token }
      }

      // Criar token permanente se não existir
      const { data: newToken, error } = await supabase
        .from('confereai_checklist_tokens')
        .insert({
          token: 'preecher-checklist',
          is_active: true,
          expires_at: null
        })
        .select('token')
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return { token: newToken.token }
    } catch (error) {
      console.error('Erro ao gerar token de checklist:', error)
      throw new Error('Erro ao gerar token de checklist')
    }
  }

  static async validateToken(token: string): Promise<{ valid: boolean }> {
    try {
      const supabase = createServerClient()

      if (token === 'preecher-checklist') {
        // Verificar se o token permanente está ativo
        const { data: tokenData } = await supabase
          .from('confereai_checklist_tokens')
          .select('is_active')
          .eq('token', token)
          .single()

        return { valid: tokenData?.is_active || false }
      }

      // Para tokens temporários (compatibilidade)
      if (!token || !token.startsWith('checklist_')) {
        return { valid: false }
      }

      return { valid: true }
    } catch (error) {
      console.error('Erro ao validar token:', error)
      return { valid: false }
    }
  }

  static async getAvailableEquipments(): Promise<DatabaseEquipment[]> {
    try {
      const supabase = createServerClient()
      
      const { data: equipments, error } = await supabase
        .from('confereai_equipments')
        .select('*')
        .eq('status', 'disponivel')
        .eq('is_active', true)
        .order('nome')

      if (error) {
        throw new Error(error.message)
      }

      return equipments || []
    } catch (error) {
      console.error('Erro ao buscar equipamentos disponíveis:', error)
      throw error
    }
  }

  static async getEquipmentsInUseByEmployee(employeeId: string): Promise<DatabaseEquipment[]> {
    try {
      const supabase = createServerClient()
      
      // Buscar equipamentos que o funcionário pegou e não devolveu ainda
      const { data: takingChecklistsData, error: takingError } = await supabase
        .from('confereai_checklists')
        .select('equipment_id')
        .eq('employee_id', employeeId)
        .eq('action', 'taking')

      if (takingError) {
        throw new Error(takingError.message)
      }

      const { data: returningChecklistsData, error: returningError } = await supabase
        .from('confereai_checklists')
        .select('equipment_id')
        .eq('employee_id', employeeId)
        .eq('action', 'returning')

      if (returningError) {
        throw new Error(returningError.message)
      }

      const takingEquipments = new Set(takingChecklistsData?.map(c => c.equipment_id) || [])
      const returningEquipments = new Set(returningChecklistsData?.map(c => c.equipment_id) || [])

      const equipmentsInUse = Array.from(takingEquipments).filter(
        equipId => !returningEquipments.has(equipId)
      )

      if (equipmentsInUse.length === 0) {
        return []
      }

      const { data: equipments, error } = await supabase
        .from('confereai_equipments')
        .select('*')
        .in('id', equipmentsInUse)
        .eq('is_active', true)
        .order('nome')

      if (error) {
        throw new Error(error.message)
      }

      return equipments || []
    } catch (error) {
      console.error('Erro ao buscar equipamentos em uso:', error)
      throw error
    }
  }

  static async validateEmployee(nome: string): Promise<DatabaseEmployee | null> {
    try {
      const supabase = createServerClient()
      
      const { data: employee, error } = await supabase
        .from('confereai_employees')
        .select('*')
        .ilike('nome', nome)
        .eq('is_active', true)
        .single()

      if (error || !employee) {
        return null
      }

      return employee
    } catch (error) {
      console.error('Erro ao validar funcionário:', error)
      return null
    }
  }

  static async createChecklist(data: CreateChecklistData): Promise<ChecklistData> {
    try {
      const supabase = createServerClient()
      
      // Gerar código único
      const timestamp = new Date().getTime()
      const codigo = `CHK_${timestamp}`

      const { data: checklist, error } = await supabase
        .from('confereai_checklists')
        .insert({
          codigo,
          employee_id: data.employee_id,
          equipment_id: data.equipment_id,
          action: data.action,
          checklist_responses: data.checklist_responses,
          observations: data.observations,
          has_issues: data.has_issues,
          device_timestamp: data.device_timestamp
        })
        .select(`
          *,
          confereai_employees!employee_id(*),
          confereai_equipments!equipment_id(*)
        `)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return {
        id: checklist.id,
        codigo: checklist.codigo,
        employee: checklist.confereai_employees,
        equipment: checklist.confereai_equipments,
        action: checklist.action,
        checklist_responses: checklist.checklist_responses,
        observations: checklist.observations,
        has_issues: checklist.has_issues,
        device_timestamp: checklist.device_timestamp,
        photos: [],
        created_at: checklist.created_at,
        updated_at: checklist.updated_at
      }
    } catch (error) {
      console.error('Erro ao criar checklist:', error)
      throw error
    }
  }

  // NOVO MÉTODO: Atualizar status do equipamento
  static async updateEquipmentStatus(equipmentId: string, status: string): Promise<void> {
    try {
      const supabase = createServerClient()
      
      const { error } = await supabase
        .from('confereai_equipments')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', equipmentId)

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Erro ao atualizar status do equipamento:', error)
      throw error
    }
  }

  static async getAllChecklists(): Promise<ChecklistData[]> {
    try {
      const supabase = createServerClient()
      
      const { data: checklists, error } = await supabase
        .from('confereai_checklists')
        .select(`
          *,
          confereai_employees!employee_id(*),
          confereai_equipments!equipment_id(*),
          confereai_checklist_photos(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return (checklists || []).map(checklist => ({
        id: checklist.id,
        codigo: checklist.codigo,
        employee: checklist.confereai_employees,
        equipment: checklist.confereai_equipments,
        action: checklist.action,
        checklist_responses: checklist.checklist_responses,
        observations: checklist.observations,
        has_issues: checklist.has_issues,
        device_timestamp: checklist.device_timestamp,
        photos: checklist.confereai_checklist_photos || [],
        created_at: checklist.created_at,
        updated_at: checklist.updated_at
      }))
    } catch (error) {
      console.error('Erro ao buscar todos os checklists:', error)
      throw error
    }
  }

  static async getChecklistById(id: string): Promise<ChecklistData | null> {
    try {
      const supabase = createServerClient()
      
      const { data: checklist, error } = await supabase
        .from('confereai_checklists')
        .select(`
          *,
          confereai_employees!employee_id(*),
          confereai_equipments!equipment_id(*),
          confereai_checklist_photos(*)
        `)
        .eq('id', id)
        .single()

      if (error || !checklist) {
        return null
      }

      return {
        id: checklist.id,
        codigo: checklist.codigo,
        employee: checklist.confereai_employees,
        equipment: checklist.confereai_equipments,
        action: checklist.action,
        checklist_responses: checklist.checklist_responses,
        observations: checklist.observations,
        has_issues: checklist.has_issues,
        device_timestamp: checklist.device_timestamp,
        photos: checklist.confereai_checklist_photos || [],
        created_at: checklist.created_at,
        updated_at: checklist.updated_at
      }
    } catch (error) {
      console.error('Erro ao buscar checklist por ID:', error)
      return null
    }
  }
}