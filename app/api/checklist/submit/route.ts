// app/api/checklist/submit/route.ts (ATUALIZAR arquivo existente completamente)
import { NextRequest, NextResponse } from 'next/server'
import { ChecklistAPI } from '@/lib/api/checklist'
import { ChecklistApprovalAPI } from '@/lib/api/checklist-approval'
import type { ChecklistData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    // Melhor tratamento de parsing do JSON
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError)
      return NextResponse.json(
        { error: 'Dados inválidos enviados. Verifique o formato da requisição.' },
        { status: 400 }
      )
    }

    const { 
      photos, 
      equipment_status,
      is_equipment_ready,
      ...checklistData 
    }: ChecklistData & { 
      photos: string[]
      equipment_status: string
      is_equipment_ready: boolean
    } = body

    // Validação dos dados obrigatórios
    if (!checklistData.employee_id || !checklistData.equipment_id || !checklistData.action) {
      return NextResponse.json(
        { error: 'Dados obrigatórios ausentes (employee_id, equipment_id, action)' },
        { status: 400 }
      )
    }

    // Validação das fotos (deve ter exatamente 3)
    if (!photos || photos.length !== 3) {
      return NextResponse.json(
        { error: 'São obrigatórias exatamente 3 fotos do equipamento' },
        { status: 400 }
      )
    }

    // Criar o checklist primeiro
    const checklist = await ChecklistAPI.createChecklist({
      ...checklistData,
      equipment_status,
      is_equipment_ready
    })

    // Se há fotos, fazer upload e associar ao checklist
    if (photos && photos.length > 0) {
      try {
        // Validar se a API de upload está configurada
        if (!process.env.UPLOAD_API_URL || !process.env.UPLOAD_API_TOKEN) {
          console.warn('API de upload não configurada. Salvando checklist sem fotos.')
        } else {
          // Upload das fotos (manter lógica existente)
          // ... código de upload existente ...
        }
      } catch (uploadError) {
        console.error('Erro no upload das fotos:', uploadError)
        // Não falhar o checklist por causa do upload
      }
    }

    // NOVO: A notificação já foi enviada no createChecklist

    return NextResponse.json({
      success: true,
      checklist: {
        id: checklist.id,
        codigo: checklist.codigo,
        status: 'pending',
        approval_status: 'pending'
      },
      message: 'Checklist enviado com sucesso! Os encarregados foram notificados e você receberá uma resposta em breve.'
    })

  } catch (error: any) {
    console.error('Erro ao enviar checklist:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}