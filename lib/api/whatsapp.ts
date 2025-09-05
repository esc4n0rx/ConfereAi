// lib/api/whatsapp.ts
export interface WhatsAppMessage {
  numero: string
  mensagem: string
  checklistCodigo?: string 
}

export class WhatsAppAPI {
  private static getConfig() {
    const url = process.env.WHATSAPP_API_URL
    const token = process.env.WHATSAPP_API_KEY

    if (!url || !token) {
      // Não lança erro, apenas loga, para não quebrar o fluxo se o whatsapp não estiver configurado
      console.warn('Configuração do WhatsApp não encontrada. As notificações não serão enviadas.');
      return null;
    }

    return { url, token }
  }

  private static formatPhoneNumber(numero: string): string {
    let cleanNumber = numero.replace(/\D/g, '')
    if (!cleanNumber.startsWith('55')) {
      cleanNumber = '55' + cleanNumber
    }
    if (cleanNumber.length === 12 && !cleanNumber.substring(4, 5).includes('9')) {
      cleanNumber = cleanNumber.substring(0, 4) + '9' + cleanNumber.substring(4)
    }
    return cleanNumber
  }

  static async sendMessage(numero: string, mensagem: string, checklistCodigo?: string): Promise<boolean> {
    const config = this.getConfig();
    if (!config) return false; // Retorna se não estiver configurado

    try {
      const { url, token } = config;
      const formattedNumber = this.formatPhoneNumber(numero)

      const response = await fetch(`${url}/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': token,
        },
        body: JSON.stringify({
          numero: formattedNumber,
          mensagem,
          checklistCodigo
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('Erro na resposta da API WhatsApp:', result)
        throw new Error(`Erro na API WhatsApp: ${response.status} - ${result.erro || 'Erro desconhecido'}`)
      }

      return true
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error)
      return false
    }
  }

  /**
   * Novo método para enviar notificação informativa.
   */
  static async sendChecklistNotification(
    managers: { nome: string; telefone: string }[],
    checklist: {
      codigo: string
      action: 'taking' | 'returning'
      employee_name: string
      equipment_name: string
      has_issues: boolean
      observations?: string
      device_timestamp: string
    }
  ): Promise<void> {
    const actionText = checklist.action === 'taking' ? 'RETIRADA' : 'DEVOLUÇÃO'
    const issuesText = checklist.has_issues ? '⚠️ COM PROBLEMAS' : '✅ SEM PROBLEMAS'
    
    let message = `ℹ️ REGISTRO DE CHECKLIST\n\n`
    message += `O seguinte checklist foi registrado e aprovado automaticamente no sistema:\n\n`
    message += `📋 *Código:* ${checklist.codigo}\n`
    message += `🎯 *Ação:* ${actionText}\n`
    message += `👤 *Funcionário:* ${checklist.employee_name}\n`
    message += `📦 *Equipamento:* ${checklist.equipment_name}\n`
    message += `📊 *Status Reportado:* ${issuesText}\n`
    
    if (checklist.observations) {
      message += `📝 *Observações:* ${checklist.observations}\n`
    }
    
    message += `\nEsta é uma mensagem informativa. Nenhuma ação é necessária.`

    const promises = managers.map(manager => 
      this.sendMessage(manager.telefone, message, checklist.codigo)
    )

    await Promise.allSettled(promises)
  }

  // O restante dos métodos pode ser mantido para outras funcionalidades ou removido se não for mais usado.
  // ... (manter o restante do código do arquivo)
  static async notifyLateResponse(
    phoneNumber: string,
    checklistCode: string,
    alreadyApprovedBy: string,
    wasApproved: boolean,
    responseSource: 'web' | 'whatsapp' = 'whatsapp'
  ): Promise<void> {
    const statusText = wasApproved ? 'APROVADO' : 'REJEITADO'
    const icon = wasApproved ? '✅' : '❌'
    const sourceText = responseSource === 'whatsapp' ? '📱 WhatsApp' : '💻 Sistema'
    
    const message = `⚠️ RESPOSTA NÃO PROCESSADA\n\n`
      + `📋 Código: ${checklistCode}\n`
      + `${icon} Já foi ${statusText} por: ${alreadyApprovedBy}\n`
      + `📍 Respondido via: ${sourceText}\n\n`
      + `ℹ️ Sua resposta chegou após a decisão já ter sido tomada.`
 
    try {
      await this.sendMessage(phoneNumber, message)
    } catch (error) {
      console.error('Erro ao enviar notificação de resposta tardia:', error)
    }
  }
 
  static async sendConfirmationMessage(
    phoneNumber: string,
    checklistCode: string,
    approved: boolean,
    managerName: string
  ): Promise<void> {
    const statusText = approved ? 'APROVAÇÃO' : 'REJEIÇÃO'
    const icon = approved ? '✅' : '❌'
    
    const message = `${icon} ${statusText} REGISTRADA\n\n`
      + `📋 Código: ${checklistCode}\n`
      + `👨‍💼 Por: ${managerName}\n`
      + `⏰ Em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}\n\n`
      + `✅ Sua decisão foi processada com sucesso!`
 
    try {
      await this.sendMessage(phoneNumber, message)
    } catch (error) {
      console.error('Erro ao enviar confirmação:', error)
    }
  }

  static async notifyApprovalResponse(
    managers: { nome: string; telefone: string }[],
    approvedBy: string,
    checklist: {
      codigo: string
      employee_name: string
      equipment_name: string
      action: 'taking' | 'returning'
    },
    approved: boolean
  ): Promise<void> {
    const actionText = checklist.action === 'taking' ? 'retirada' : 'devolução'
    const statusText = approved ? 'APROVADA' : 'REJEITADA'
    const icon = approved ? '✅' : '❌'
    
    const message = `${icon} CHECKLIST ${statusText}\n\n`
      + `📋 Código: ${checklist.codigo}\n`
      + `👤 Funcionário: ${checklist.employee_name}\n`
      + `📦 Equipamento: ${checklist.equipment_name}\n`
      + `🎯 Ação: ${actionText}\n`
      + `👨‍💼 ${statusText} por: ${approvedBy}\n\n`
      + `ℹ️ Não é necessário responder mais.`
 
    const promises = managers
      .filter(manager => manager.nome !== approvedBy)
      .map(manager => this.sendMessage(manager.telefone, message))
 
    await Promise.allSettled(promises)
  }
}