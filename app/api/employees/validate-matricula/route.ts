import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { DatabaseEmployee } from '@/lib/types'
import { PostgrestError } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const matricula = searchParams.get('matricula')

    if (!matricula) {
      return NextResponse.json(
        { error: 'Matrícula é obrigatória' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    const { data: employee, error } = await supabase
      .from('confereai_employees')
      .select('*')
      .eq('matricula', matricula)
      .eq('is_active', true)
      .single() as { 
        data: DatabaseEmployee | null, 
        error: PostgrestError | null 
      }

    if (error || !employee) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      )
    }

    const mappedEmployee = {
      id: employee.id,
      matricula: employee.matricula,
      nome: employee.nome,
      cargo: employee.cargo,
      name: employee.nome, // compatibilidade
      position: employee.cargo, // compatibilidade
      createdAt: new Date(employee.created_at),
      updatedAt: new Date(employee.updated_at),
      is_active: employee.is_active
    }

    return NextResponse.json({ employee: mappedEmployee })
  } catch (error) {
    console.error('Erro na validação de matrícula:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}