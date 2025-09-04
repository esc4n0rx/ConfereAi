// app/api/checklist/equipments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ChecklistAPI } from '@/lib/api/checklist'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') as 'taking' | 'returning'
    const employeeId = searchParams.get('employee_id')

    if (!action || !employeeId) {
      return NextResponse.json(
        { error: 'Ação e ID do funcionário são obrigatórios' },
        { status: 400 }
      )
    }

    let equipments
    
    if (action === 'taking') {
      equipments = await ChecklistAPI.getAvailableEquipments()
    } else if (action === 'returning') {
      equipments = await ChecklistAPI.getEquipmentsInUseByEmployee(employeeId)
    } else {
      return NextResponse.json(
        { error: 'Ação inválida' },
        { status: 400 }
      )
    }

    return NextResponse.json({ equipments })
  } catch (error) {
    console.error('Erro ao buscar equipamentos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}