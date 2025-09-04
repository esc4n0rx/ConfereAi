// app/api/checklist/pending/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ChecklistApprovalAPI } from '@/lib/api/checklist-approval'

export async function GET() {
  try {
    const pendingApprovals = await ChecklistApprovalAPI.getPendingApprovals()
    return NextResponse.json({ pendingApprovals })
  } catch (error) {
    console.error('Erro ao buscar aprovações pendentes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}