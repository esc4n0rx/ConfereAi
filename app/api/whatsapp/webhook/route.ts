// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppWebhookAPI } from '@/lib/api/whatsapp-webhook'

export async function POST(request: NextRequest) {
  try {
    // Verificar autorização
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const expectedToken = process.env.WHATSAPP_WEBHOOK_TOKEN

    if (!expectedToken || token !== expectedToken) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { phoneNumber, approved, timestamp } = body

    if (!phoneNumber || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Dados obrigatórios: phoneNumber e approved' },
        { status: 400 }
      )
    }

    console.log(`📨 Webhook recebido: ${phoneNumber} - ${approved ? 'APROVADO' : 'REJEITADO'}`)

    // Processar a resposta de aprovação
    const result = await WhatsAppWebhookAPI.processApprovalResponse(
      phoneNumber,
      approved,
      timestamp
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Aprovação ${approved ? 'confirmada' : 'rejeitada'} com sucesso`,
      checklistCodigo: result.checklistCodigo,
      manager: result.manager
    })

  } catch (error: any) {
    console.error('❌ Erro no webhook WhatsApp:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}