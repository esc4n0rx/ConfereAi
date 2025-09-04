// app/api/checklist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ChecklistAPI } from '@/lib/api/checklist'

export async function GET() {
  try {
    const checklists = await ChecklistAPI.getAllChecklists()
    return NextResponse.json({ checklists })
  } catch (error) {
    console.error('Erro ao buscar checklists:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}