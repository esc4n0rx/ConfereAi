// lib/api/checklist.ts
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/client'
import type { 
  ChecklistData, 
  CreateChecklistData, 
  DatabaseEmployee, 
  DatabaseEquipment,
  ChecklistPhoto
} from '@/lib/types'

export class ChecklistAPI {
  
  static async generateChecklistToken(): Promise<{ token: string }> {
    try {
      const supabase = createServerClient()
      
      // Gerar token único
      const token = `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      return { token }
    } catch (error) {
      console.error('Erro ao gerar token de checklist:', error)
      throw new Error('Erro ao gerar token de checklist')
    }
  }

  static async validateToken(token: string): Promise<{ valid: boolean }> {
    try {
      // Por simplicidade, validamos se o token tem o formato correto
      // Em produção, você poderia armazenar tokens em uma tabela
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

      const takingEquipmentIds = (takingChecklistsData || []).map(c => c.equipment_id)

      if (takingEquipmentIds.length === 0) {
        return []
      }

      // Buscar devoluções para estes equipamentos
      const { data: returningChecklistsData, error: returningError } = await supabase
        .from('confereai_checklists')
        .select('equipment_id')
        .eq('employee_id', employeeId)
        .eq('action', 'returning')
        .in('equipment_id', takingEquipmentIds)

      if (returningError) {
        throw new Error(returningError.message)
      }

      const returnedEquipmentIds = (returningChecklistsData || []).map(c => c.equipment_id)
      
      // Equipamentos que foram pegos mas não devolvidos
      const inUseEquipmentIds = takingEquipmentIds.filter(id => !returnedEquipmentIds.includes(id))

      if (inUseEquipmentIds.length === 0) {
        return []
      }

      // Buscar dados dos equipamentos em uso
      const { data: equipments, error: equipError } = await supabase
        .from('confereai_equipments')
        .select('*')
        .in('id', inUseEquipmentIds)
        .eq('is_active', true)
        .order('nome')

      if (equipError) {
        throw new Error(equipError.message)
      }

      return equipments || []
    } catch (error) {
      console.error('Erro ao buscar equipamentos em uso pelo funcionário:', error)
      throw error
    }
  }

  static async createChecklist(data: CreateChecklistData): Promise<ChecklistData> {
    try {
      const supabase = createServerClient()
      
      // Gerar código único
      const codigo = `CHK_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      
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

  static async addPhotosToChecklist(checklistId: string, photoUrls: string[]): Promise<ChecklistPhoto[]> {
    try {
      const supabase = createServerClient()
      
      const photosData = photoUrls.map(url => ({
        checklist_id: checklistId,
        photo_url: url,
        photo_type: 'checklist'
      }))

      const { data: photos, error } = await supabase
        .from('confereai_checklist_photos')
        .insert(photosData)
        .select()

      if (error) {
        throw new Error(error.message)
      }

      return photos || []
    } catch (error) {
      console.error('Erro ao adicionar fotos ao checklist:', error)
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