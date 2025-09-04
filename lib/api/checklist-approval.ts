// lib/api/checklist-approval.ts
import { createServerClient } from '@/lib/supabase/server'
import { ManagersAPI } from './managers'
import { WhatsAppAPI } from './whatsapp'
import type { ChecklistApproval, Manager, ChecklistData } from '@/lib/types'

export class ChecklistApprovalAPI {
  static async createApprovalRequest(checklistId: string): Promise<void> {
    try {
      const supabase = createServerClient()
      
      // Buscar todos os encarregados ativos
      const managers = await ManagersAPI.getAllManagers()
      
      if (managers.length === 0) {
        console.warn('Nenhum encarregado configurado para receber notificações')
        return
      }

      // Criar registros de aprovação para cada encarregado
      const approvals = managers.map(manager => ({
        checklist_id: checklistId,
        manager_id: manager.id,
        status: 'pending' as const,
      }))

      const { error } = await supabase
        .from('confereai_checklist_approvals')
        .insert(approvals)

      if (error) {
        throw new Error(error.message)
      }

      // Buscar dados do checklist para notificação
      const { data: checklist, error: checklistError } = await supabase
        .from('confereai_checklists')
        .select(`
          codigo,
          action,
          has_issues,
          observations,
          confereai_employees!employee_id(nome),
          confereai_equipments!equipment_id(nome)
        `)
        .eq('id', checklistId)
        .single()

      if (checklistError || !checklist) {
        throw new Error('Checklist não encontrado')
      }

      // Enviar notificação WhatsApp
      await WhatsAppAPI.notifyChecklistSubmission(
        managers.map(m => ({ nome: m.nome, telefone: m.telefone })),
        {
          codigo: checklist.codigo,
          employee_name: checklist.confereai_employees.nome,
          equipment_name: checklist.confereai_equipments.nome,
          action: checklist.action,
          has_issues: checklist.has_issues,
          observations: checklist.observations || undefined,
        }
      )

    } catch (error) {
      console.error('Erro ao criar solicitação de aprovação:', error)
      throw error
    }
  }

  static async processApprovalResponse(
    checklistId: string,
    managerId: string,
    approved: boolean,
    responseMessage?: string
  ): Promise<void> {
    try {
      const supabase = createServerClient()
      
      // Verificar se já foi aprovado/rejeitado por outro encarregado
      const { data: existingApproval, error: checkError } = await supabase
        .from('confereai_checklist_approvals')
        .select('status, confereai_managers!manager_id(nome)')
        .eq('checklist_id', checklistId)
        .neq('status', 'pending')
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(checkError.message)
      }

      if (existingApproval) {
        throw new Error(`Checklist já foi ${existingApproval.status === 'approved' ? 'aprovado' : 'rejeitado'} por ${existingApproval.confereai_managers.nome}`)
      }

      // Atualizar o registro de aprovação
      const { error: approvalError } = await supabase
        .from('confereai_checklist_approvals')
        .update({
          status: approved ? 'approved' : 'rejected',
          response_message: responseMessage,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('checklist_id', checklistId)
        .eq('manager_id', managerId)

      if (approvalError) {
        throw new Error(approvalError.message)
      }

      // Buscar dados do encarregado que respondeu
      const { data: manager, error: managerError } = await supabase
        .from('confereai_managers')
        .select('nome')
        .eq('id', managerId)
        .single()

      if (managerError || !manager) {
        throw new Error('Encarregado não encontrado')
      }

      // Atualizar o checklist
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

      // Buscar dados do checklist e outros encarregados para notificação
      const { data: checklist, error: checklistDataError } = await supabase
        .from('confereai_checklists')
        .select(`
          codigo,
          action,
          confereai_employees!employee_id(nome),
          confereai_equipments!equipment_id(nome)
        `)
        .eq('id', checklistId)
        .single()

      if (checklistDataError || !checklist) {
        throw new Error('Erro ao buscar dados do checklist')
      }

      const allManagers = await ManagersAPI.getAllManagers()

      // Notificar outros encarregados sobre a resposta
      await WhatsAppAPI.notifyApprovalResponse(
        allManagers.map(m => ({ nome: m.nome, telefone: m.telefone })),
        manager.nome,
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
          confereai_managers!manager_id(nome)
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
}