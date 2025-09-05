// lib/api/whatsapp-webhook.ts
import { createServerClient } from '@/lib/supabase/server'
import { ChecklistApprovalAPI } from './checklist-approval'

export interface WebhookResponse {
  success: boolean
  error?: string
  checklistCodigo?: string
  manager?: string
}

export class WhatsAppWebhookAPI {
  /**
   * Processa resposta de aprovação recebida via WhatsApp
   */
  static async processApprovalResponse(
    phoneNumber: string,
    approved: boolean,
    timestamp?: string
  ): Promise<WebhookResponse> {
    try {
      const supabase = createServerClient()

      // Formatar número para buscar no banco
      const formattedPhone = this.formatPhoneForSearch(phoneNumber)
      
      console.log(`🔍 Buscando encarregado com telefone: ${formattedPhone}`)

      // Buscar encarregado pelo telefone
      const { data: manager, error: managerError } = await supabase
        .from('confereai_managers')
        .select('id, nome, telefone')
        .eq('telefone', formattedPhone)
        .eq('is_active', true)
        .single()

      if (managerError || !manager) {
        console.log('❌ Encarregado não encontrado para o telefone:', formattedPhone)
        return {
          success: false,
          error: 'Encarregado não encontrado para este número'
        }
      }

      console.log(`✅ Encarregado encontrado: ${manager.nome}`)

      // Buscar aprovação pendente mais recente para este encarregado
      const { data: pendingApproval, error: approvalError } = await supabase
        .from('confereai_checklist_approvals')
        .select(`
          id,
          checklist_id,
          confereai_checklists!checklist_id(codigo)
        `)
        .eq('manager_id', manager.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (approvalError || !pendingApproval) {
        console.log('❌ Nenhuma aprovação pendente encontrada para:', manager.nome)
        return {
          success: false,
          error: 'Nenhuma aprovação pendente encontrada para este encarregado'
        }
      }

      const checklistCodigo = pendingApproval.confereai_checklists.codigo
      console.log(`📋 Processando aprovação para checklist: ${checklistCodigo}`)

      // Processar a aprovação usando a API existente
      await ChecklistApprovalAPI.processApprovalResponse(
        pendingApproval.checklist_id,
        manager.id,
        approved,
        `Resposta via WhatsApp: ${approved ? 'APROVADO' : 'REJEITADO'}`
      )

      console.log(`✅ Aprovação processada com sucesso: ${checklistCodigo} - ${approved ? 'APROVADO' : 'REJEITADO'}`)

      return {
        success: true,
        checklistCodigo,
        manager: manager.nome
      }

    } catch (error: any) {
      console.error('❌ Erro ao processar resposta de aprovação:', error)
      return {
        success: false,
        error: error.message || 'Erro interno ao processar aprovação'
      }
    }
  }

  /**
   * Formatar número de telefone para busca no banco
   */
  private static formatPhoneForSearch(phoneNumber: string): string {
    // Remove caracteres não numéricos
    let cleaned = phoneNumber.replace(/\D/g, '')
    
    // Remove código do país se presente
    if (cleaned.startsWith('55')) {
      cleaned = cleaned.substring(2)
    }
    
    // Garante que tenha 11 dígitos (DDD + 9 dígitos)
    if (cleaned.length === 10) {
      // Adiciona o 9 se não tiver
      cleaned = cleaned.substring(0, 2) + '9' + cleaned.substring(2)
    }
    
    return cleaned
  }
}