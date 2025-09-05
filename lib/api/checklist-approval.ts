// lib/api/checklist-approval.ts
import { createServerClient } from '@/lib/supabase/server'
import { ManagersAPI } from './managers'
import { WhatsAppAPI } from './whatsapp'

export class ChecklistApprovalAPI {
  /**
   * Novo método: Apenas notifica os gerentes sobre um checklist já concluído.
   */
  static async notifyManagers(
    checklistId: string,
    employeeName: string,
    equipmentName: string,
    action: 'taking' | 'returning',
    hasIssues: boolean,
    observations?: string
  ): Promise<void> {
    try {
      const supabase = createServerClient()
      const managers = await ManagersAPI.getAllManagers()
      
      if (managers.length === 0) {
        console.warn('Nenhum encarregado encontrado para notificação.')
        return;
      }

      const { data: checklist, error: checklistError } = await supabase
        .from('confereai_checklists')
        .select('codigo, device_timestamp')
        .eq('id', checklistId)
        .single()

      if (checklistError || !checklist) {
        throw new Error('Erro ao buscar dados do checklist para notificação')
      }

      // Enviar notificação informativa via WhatsApp
      await WhatsAppAPI.sendChecklistNotification(
        managers.map(m => ({ nome: m.nome, telefone: m.telefone })),
        {
          codigo: checklist.codigo,
          action,
          employee_name: employeeName,
          equipment_name: equipmentName,
          has_issues: hasIssues,
          observations,
          device_timestamp: checklist.device_timestamp
        }
      )

      console.log(`📨 Notificação de checklist concluído enviada para ${managers.length} encarregados`)

    } catch (error) {
      console.error('Erro ao notificar encarregados:', error)
      // Não lançar erro para não interromper o fluxo principal
    }
  }

  // O restante do arquivo (processApprovalResponse, getPendingApprovals, etc.) pode ser mantido,
  // embora o fluxo de aprovação manual não seja mais iniciado.
  // ... (manter o restante do código do arquivo)
  static async processApprovalResponse(
    checklistId: string,
    managerId: string,
    approved: boolean,
    responseMessage?: string,
    responseSource: 'web' | 'whatsapp' = 'web'
  ): Promise<void> {
    try {
      const supabase = createServerClient()

      const { data: existingApproval, error: approvalError } = await supabase
        .from('confereai_checklist_approvals')
        .select('*')
        .eq('checklist_id', checklistId)
        .eq('manager_id', managerId)
        .eq('status', 'pending')
        .single()

      if (approvalError || !existingApproval) {
        throw new Error('Aprovação não encontrada ou já processada')
      }

      const { data: otherResponses, error: otherError } = await supabase
        .from('confereai_checklist_approvals')
        .select('*, confereai_managers!manager_id(nome)')
        .eq('checklist_id', checklistId)
        .neq('status', 'pending')

      if (otherError) {
        throw new Error('Erro ao verificar outras respostas')
      }

      if (otherResponses && otherResponses.length > 0) {
        const firstResponse = otherResponses[0]
        const wasApproved = firstResponse.status === 'approved'
        
        const sourceText = responseSource === 'whatsapp' ? '📱 WhatsApp' : '💻 Sistema'
        await WhatsAppAPI.notifyLateResponse(
          '',
          checklistId,
          firstResponse.confereai_managers.nome,
          wasApproved,
          responseSource
        )
        
        throw new Error(`Esta aprovação já foi ${wasApproved ? 'aprovada' : 'rejeitada'} por ${firstResponse.confereai_managers.nome}`)
      }

      const { data: manager, error: managerError } = await supabase
        .from('confereai_managers')
        .select('nome')
        .eq('id', managerId)
        .single()

      if (managerError || !manager) {
        throw new Error('Encarregado não encontrado')
      }

      const { error: updateError } = await supabase
        .from('confereai_checklist_approvals')
        .update({
          status: approved ? 'approved' : 'rejected',
          response_message: responseMessage,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingApproval.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      const { error: checklistError } = await supabase
        .from('confereai_checklists')
        .update({
          approval_status: approved ? 'approved' : 'rejected',
          approved_by: manager.nome,
          approval_response: responseMessage,
          status: approved ? 'approved' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', checklistId)

      if (checklistError) {
        throw new Error(checklistError.message)
      }

      const { data: checklist, error: checklistDataError } = await supabase
        .from('confereai_checklists')
        .select(`
          codigo,
          action,
          equipment_id,
          confereai_employees!employee_id(nome),
          confereai_equipments!equipment_id(nome)
        `)
        .eq('id', checklistId)
        .single()

      if (checklistDataError || !checklist) {
        throw new Error('Erro ao buscar dados do checklist')
      }

      if (approved && checklist.equipment_id) {
        await this.updateEquipmentStatus(checklist.equipment_id, checklist.action, manager.nome)
      }

      const allManagers = await ManagersAPI.getAllManagers()
      const sourceText = responseSource === 'whatsapp' ? '📱 WhatsApp' : '💻 Sistema'

      await WhatsAppAPI.notifyApprovalResponse(
        allManagers.map(m => ({ nome: m.nome, telefone: m.telefone })),
        `${manager.nome} (${sourceText})`,
        {
          codigo: checklist.codigo,
          employee_name: checklist.confereai_employees.nome,
          equipment_name: checklist.confereai_equipments.nome,
          action: checklist.action,
        },
        approved
      )

    } catch (error) {
      console.error('Erro ao processar resposta de aprovação:', error)
      throw error
    }
  }

  private static async updateEquipmentStatus(
    equipmentId: string,
    action: 'taking' | 'returning',
    approvedBy: string
  ): Promise<void> {
    try {
      const supabase = createServerClient()
      
      if (!equipmentId || equipmentId === 'undefined') {
        console.error('❌ Equipment ID inválido:', equipmentId)
        return
      }
      
      let newStatus = 'disponivel'
      if (action === 'taking') {
        newStatus = 'em_uso'
      } else if (action === 'returning') {
        newStatus = 'disponivel'
      }

      const { error } = await supabase
        .from('confereai_equipments')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', equipmentId)

      if (error) {
        throw new Error(`Erro ao atualizar status do equipamento: ${error.message}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar status do equipamento:', error)
      throw error
    }
  }

  static async getPendingApprovals(): Promise<any[]> {
    try {
      const supabase = createServerClient()
      
      const { data: approvals, error } = await supabase
        .from('confereai_checklist_approvals')
        .select(`
          *,
          confereai_checklists!checklist_id(
            codigo,
            action,
            has_issues,
            device_timestamp,
            confereai_employees!employee_id(nome),
            confereai_equipments!equipment_id(nome)
          ),
          confereai_managers!manager_id(nome, telefone)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return approvals || []
    } catch (error) {
      console.error('Erro ao buscar aprovações pendentes:', error)
      throw error
    }
  }

  static async getApprovalByChecklistCode(
    checklistCode: string
  ): Promise<any | null> {
    try {
      const supabase = createServerClient()
      
      const { data: approval, error } = await supabase
        .from('confereai_checklist_approvals')
        .select(`
          *,
          confereai_checklists!checklist_id(
            codigo,
            action,
            has_issues,
            confereai_employees!employee_id(nome),
            confereai_equipments!equipment_id(nome)
          ),
          confereai_managers!manager_id(nome, telefone)
        `)
        .eq('confereai_checklists.codigo', checklistCode)
        .eq('status', 'pending')
        .single()

      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message)
      }

      return approval || null
    } catch (error) {
      console.error('Erro ao buscar aprovação por código:', error)
      return null
    }
  }
}