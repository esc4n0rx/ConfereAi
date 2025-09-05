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
      throw new Error('Configuração do WhatsApp não encontrada. Verifique WHATSAPP_API_URL e WHATSAPP_API_KEY')
    }

    return { url, token }
  }

  private static formatPhoneNumber(numero: string): string {
    // Remove todos os caracteres não numéricos
    let cleanNumber = numero.replace(/\D/g, '')
    
    // Se não começar com 55 (código do Brasil), adiciona
    if (!cleanNumber.startsWith('55')) {
      cleanNumber = '55' + cleanNumber
    }
    
    // Garante que tenha 13 dígitos (55 + DDD + 9 dígitos)
    if (cleanNumber.length === 12 && !cleanNumber.substring(4, 5).includes('9')) {
      // Adiciona o 9 após o DDD se não tiver
      cleanNumber = cleanNumber.substring(0, 4) + '9' + cleanNumber.substring(4)
    }
    
    console.log(`Número formatado: ${numero} -> ${cleanNumber}`)
    return cleanNumber
  }

  // MÉTODO ATUALIZADO: Incluir código do checklist
  static async sendMessage(numero: string, mensagem: string, checklistCodigo?: string): Promise<boolean> {
    try {
      const { url, token } = this.getConfig()
      const formattedNumber = this.formatPhoneNumber(numero)

      console.log(`Enviando mensagem para: ${formattedNumber}`)
      console.log(`Mensagem: ${mensagem.substring(0, 100)}...`)
      if (checklistCodigo) {
        console.log(`Código do checklist: ${checklistCodigo}`)
      }

      const response = await fetch(`${url}/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': token,
        },
        body: JSON.stringify({
          numero: formattedNumber,
          mensagem,
          checklistCodigo // Incluir código se fornecido
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('Erro na resposta da API WhatsApp:', result)
        throw new Error(`Erro na API WhatsApp: ${response.status} - ${result.erro || 'Erro desconhecido'}`)
      }

      console.log('Resposta da API WhatsApp:', result)
      return true
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error)
      return false
    }
  }

  // MÉTODO ATUALIZADO: Incluir código e usar botões/opções
  static async notifyChecklistSubmission(
    managers: { nome: string; telefone: string }[],
    checklist: {
      codigo: string
      employee_name: string
      equipment_name: string
      action: 'taking' | 'returning'
      has_issues: boolean
      observations?: string
    }
  ): Promise<void> {
    const actionText = checklist.action === 'taking' ? 'RETIRADA' : 'DEVOLUÇÃO'
    const issuesText = checklist.has_issues ? '⚠️ COM PROBLEMAS' : '✅ SEM PROBLEMAS'
    
    let message = `🔔 SOLICITAÇÃO DE APROVAÇÃO\n\n`
    message += `📋 Código: ${checklist.codigo}\n`
    message += `🎯 Ação: ${actionText}\n`
    message += `👤 Funcionário: ${checklist.employee_name}\n`
    message += `📦 Equipamento: ${checklist.equipment_name}\n`
    message += `📊 Status: ${issuesText}\n`
    
    if (checklist.observations) {
      message += `📝 Observações: ${checklist.observations}\n`
    }
    
    message += `\n❓ Você AUTORIZA esta ${actionText.toLowerCase()}?\n\n`
    message += `✅ Responda: SIM\n`
    message += `❌ Responda: NÃO\n\n`
    message += `⏰ Responda rapidamente - aprovação automática por WhatsApp`

    const promises = managers.map(manager => 
      this.sendMessage(manager.telefone, message, checklist.codigo)
    )

    await Promise.allSettled(promises)
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

  // NOVO MÉTODO: Notificar quando alguém tenta responder após decisão já tomada
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
      console.log(`📱 Notificação de resposta tardia enviada para: ${phoneNumber}`)
    } catch (error) {
      console.error('Erro ao enviar notificação de resposta tardia:', error)
    }
  }

  // NOVO MÉTODO: Enviar mensagem de confirmação quando resposta é aceita
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
      console.log(`📱 Confirmação enviada para: ${phoneNumber} - ${statusText}`)
    } catch (error) {
      console.error('Erro ao enviar confirmação:', error)
    }
  }

  // NOVO MÉTODO: Testar conectividade com a API do WhatsApp
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { url, token } = this.getConfig()
      
      const response = await fetch(`${url}/`, {
        method: 'GET',
        headers: {
          'x-api-key': token,
        },
      })

      if (response.ok) {
        const result = await response.json()
        return {
          success: true,
          message: `Conectado com sucesso. Status: ${result.status || 'OK'}`
        }
      } else {
        return {
          success: false,
          message: `Erro na conexão: ${response.status}`
        }
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erro de conectividade: ${error.message}`
      }
    }
  }

  // NOVO MÉTODO: Obter status do bot
  static async getBotStatus(): Promise<{
    success: boolean
    isReady: boolean
    message: string
  }> {
    try {
      const { url, token } = this.getConfig()
      
      const response = await fetch(`${url}/`, {
        method: 'GET',
        headers: {
          'x-api-key': token,
        },
      })

      if (response.ok) {
        const result = await response.json()
        return {
          success: true,
          isReady: result.status?.includes('Conectado') || false,
          message: result.status || 'Status desconhecido'
        }
      } else {
        return {
          success: false,
          isReady: false,
          message: `Erro ao verificar status: ${response.status}`
        }
      }
    } catch (error: any) {
      return {
        success: false,
        isReady: false,
        message: `Erro de conectividade: ${error.message}`
      }
    }
  }
}