// lib/api/checklist.ts
import { createServerClient } from '@/lib/supabase/server'
import { ChecklistApprovalAPI } from './checklist-approval'
import type { ChecklistData, ChecklistDataWithStatus, DatabaseEmployee, DatabaseEquipment } from '@/lib/types'

export class ChecklistAPI {
  static async createChecklist(data: ChecklistData & { 
    equipment_status: string
    is_equipment_ready: boolean 
  }): Promise<ChecklistData> {
    try {
      const supabase = createServerClient()
      
      // Gerar código único para o checklist
      const codigo = `CHK_${Date.now()}`
      
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
          device_timestamp: data.device_timestamp,
          status: 'pending', // NOVO: Status inicial
          approval_status: 'pending' // NOVO: Status de aprovação
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

      // CORRIGIDO: Usar o método correto para criar solicitação de aprovação
      try {
        await ChecklistApprovalAPI.requestApproval(
          checklist.id,
          checklist.confereai_employees.nome,
          checklist.confereai_equipments.nome,
          checklist.action,
          checklist.has_issues,
          checklist.observations
        )
      } catch (approvalError) {
        console.error('Erro ao criar solicitação de aprovação:', approvalError)
        // Não falhar a criação do checklist se a notificação falhar
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

  static async savePhotos(checklistId: string, photos: Array<{url: string, order: number}>): Promise<void> {
    try {
      const supabase = createServerClient()
      
      // Preparar dados das fotos
      const photoData = photos.map(photo => ({
        checklist_id: checklistId,
        photo_url: photo.url,
        photo_order: photo.order
      }))

      const { error } = await supabase
        .from('confereai_checklist_photos')
        .insert(photoData)

      if (error) {
        throw new Error(error.message)
      }

      console.log(`${photos.length} fotos salvas para checklist ${checklistId}`)
    } catch (error) {
      console.error('Erro ao salvar fotos:', error)
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

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
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
        photos: checklist.confereai_checklist_photos || [],
        created_at: checklist.created_at,
        updated_at: checklist.updated_at
      }
    } catch (error) {
      console.error('Erro ao buscar checklist:', error)
      throw error
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
        .order('nome', { ascending: true })

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
      
      // Buscar equipamentos que estão em uso por este funcionário
      // através dos checklists de retirada aprovados
      const { data: equipments, error } = await supabase
        .from('confereai_equipments')
        .select(`
          *,
          confereai_checklists!equipment_id(
            employee_id,
            action,
            approval_status
          )
        `)
        .eq('status', 'em_uso')
        .eq('is_active', true)
        .eq('confereai_checklists.employee_id', employeeId)
        .eq('confereai_checklists.action', 'taking')
        .eq('confereai_checklists.approval_status', 'approved')

      if (error) {
        throw new Error(error.message)
      }

      return equipments || []
    } catch (error) {
      console.error('Erro ao buscar equipamentos em uso:', error)
      throw error
    }
  }

  // NOVO MÉTODO: Buscar checklists com status de aprovação
  static async getAllChecklistsWithApproval(): Promise<ChecklistDataWithStatus[]> {
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
        updated_at: checklist.updated_at,
        status: checklist.status,
        approval_status: checklist.approval_status
      }))
    } catch (error) {
      console.error('Erro ao buscar checklists com aprovação:', error)
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
      console.error('Erro ao buscar checklists:', error)
      throw error
    }
  }

  static async validateToken(token: string): Promise<{ valid: boolean; data?: any }> {
    try {
      const supabase = createServerClient()
      
      const { data: tokenData, error } = await supabase
        .from('confereai_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .single()

      if (error || !tokenData) {
        return { valid: false }
      }

      // Verificar se o token não expirou
      if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
        return { valid: false }
      }

      return { valid: true, data: tokenData }
    } catch (error) {
      console.error('Erro ao validar token:', error)
      return { valid: false }
    }
  }
}