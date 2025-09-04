// lib/api/whatsapp.ts
export interface WhatsAppMessage {
    numero: string
    mensagem: string
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


      static async sendMessage(numero: string, mensagem: string): Promise<boolean> {
        try {
          const { url, token } = this.getConfig()
          const formattedNumber = this.formatPhoneNumber(numero)
    
          console.log(`Enviando mensagem para: ${formattedNumber}`)
          console.log(`Mensagem: ${mensagem.substring(0, 100)}...`)
    
          const response = await fetch(`${url}/enviar`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': token,
            },
            body: JSON.stringify({
              numero: formattedNumber,
              mensagem,
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
      
      let message = `🔔 CHECKLIST ${actionText}\n\n`
      message += `📋 Código: ${checklist.codigo}\n`
      message += `👤 Funcionário: ${checklist.employee_name}\n`
      message += `📦 Equipamento: ${checklist.equipment_name}\n`
      message += `📊 Status: ${issuesText}\n`
      
      if (checklist.observations) {
        message += `📝 Observações: ${checklist.observations}\n`
      }
      
      message += `\n❓ Você AUTORIZA esta ${actionText.toLowerCase()}?\n`
      message += `✅ Responda: SIM\n`
      message += `❌ Responda: NÃO`
  
      const promises = managers.map(manager => 
        this.sendMessage(manager.telefone, message)
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
  }