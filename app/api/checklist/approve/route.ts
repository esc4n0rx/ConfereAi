// app/api/checklist/approve/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ChecklistApprovalAPI } from '@/lib/api/checklist-approval'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { checklistId, managerId, approved, responseMessage } = body

    if (!checklistId || !managerId || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Dados obrigatórios: checklistId, managerId e approved' },
        { status: 400 }
      )
    }

    await ChecklistApprovalAPI.processApprovalResponse(
      checklistId,
      managerId,
      approved,
      responseMessage
    )

    return NextResponse.json({
      success: true,
      message: `Checklist ${approved ? 'aprovado' : 'rejeitado'} com sucesso`
    })
  } catch (error: any) {
    console.error('Erro ao processar aprovação:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}