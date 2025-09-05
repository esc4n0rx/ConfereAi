// lib/api/checklist.ts
import { createServerClient } from '@/lib/supabase/server'
import { ChecklistApprovalAPI } from './checklist-approval'
import type { ChecklistData, ChecklistDataWithStatus, DatabaseEmployee, DatabaseEquipment } from '@/lib/types'

export class ChecklistAPI {
  static async createChecklist(data: Omit<ChecklistData, 'id' | 'photos' | 'created_at' | 'updated_at' | 'employee' | 'equipment'> & { 
    equipment_status: string
    is_equipment_ready: boolean 
  }): Promise<ChecklistData> {
    try {
      const supabase = createServerClient()
      
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
          status: 'approved', // Status inicial já é aprovado
          approval_status: 'approved' // Status de aprovação também
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

      // Notificar encarregados sobre o checklist já aprovado
      try {
        await ChecklistApprovalAPI.notifyManagers(
          checklist.id,
          checklist.confereai_employees.nome,
          checklist.confereai_equipments.nome,
          checklist.action,
          checklist.has_issues,
          checklist.observations
        )
      } catch (notificationError) {
        console.error('Erro ao notificar encarregados:', notificationError)
        // Não falhar a criação do checklist se a notificação falhar
      }

      // Atualizar status do equipamento
      await this.updateEquipmentStatus(checklist.equipment_id, data.action, data.has_issues);

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
      
      const photoData = photos.map(photo => ({
        checklist_id: checklistId,
        photo_url: photo.url,
        photo_type: 'url', // indicando que é uma URL fictícia
        photo_order: photo.order
      }))

      const { error } = await supabase
        .from('confereai_checklist_photos')
        .insert(photoData)

      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Erro ao salvar fotos:', error)
      throw error
    }
  }
  
  static async updateEquipmentStatus(equipmentId: string, action: 'taking' | 'returning', hasIssues: boolean): Promise<void> {
    try {
        const supabase = createServerClient();
        
        let newStatus: DatabaseEquipment['status'] = 'disponivel';
        if (action === 'taking') {
            newStatus = 'em_uso';
        } else if (action === 'returning') {
            newStatus = hasIssues ? 'manutencao' : 'disponivel';
        }

        const { error } = await supabase
            .from('confereai_equipments')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', equipmentId);

        if (error) {
            throw new Error(error.message);
        }

        console.log(`Status do equipamento ${equipmentId} atualizado para: ${newStatus}`);
    } catch (error) {
        console.error('Erro ao atualizar status do equipamento:', error);
        throw error;
    }
}

  // O restante dos métodos (getChecklistById, getAvailableEquipments, etc.) permanecem os mesmos.
  // ... (manter o restante do código do arquivo)
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
      
      const { data: checklists, error: checklistError } = await supabase
        .from('confereai_checklists')
        .select('equipment_id, action')
        .eq('employee_id', employeeId)
        .eq('status', 'approved');

      if(checklistError) throw checklistError;

      const equipmentCount = new Map<string, number>();
      for(const checklist of checklists) {
          const count = equipmentCount.get(checklist.equipment_id) || 0;
          if(checklist.action === 'taking') {
              equipmentCount.set(checklist.equipment_id, count + 1);
          } else if (checklist.action === 'returning') {
              equipmentCount.set(checklist.equipment_id, count - 1);
          }
      }

      const inUseEquipmentIds = Array.from(equipmentCount.entries())
          .filter(([, count]) => count > 0)
          .map(([id]) => id);
      
      if(inUseEquipmentIds.length === 0) return [];

      const { data: equipments, error } = await supabase
        .from('confereai_equipments')
        .select(`*`)
        .in('id', inUseEquipmentIds)
        .eq('is_active', true);

      if (error) {
        throw new Error(error.message)
      }

      return equipments || []
    } catch (error) {
      console.error('Erro ao buscar equipamentos em uso:', error)
      throw error
    }
  }

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
        .from('confereai_checklist_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .single()

      if (error || !tokenData) {
        return { valid: false }
      }

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