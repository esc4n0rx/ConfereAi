import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { UpdateEmployeeData, DatabaseEmployee, Employee } from '@/lib/types'

/**
 * Mapeia um objeto do banco de dados (DatabaseEmployee) para o formato da API (Employee).
 * @param dbEmployee O objeto do funcionário vindo diretamente do Supabase.
 * @returns Um objeto de funcionário formatado para a resposta da API.
 */
const mapDbEmployeeToApi = (dbEmployee: DatabaseEmployee): Employee => ({
  id: dbEmployee.id,
  matricula: dbEmployee.matricula,
  nome: dbEmployee.nome,
  cargo: dbEmployee.cargo,
  name: dbEmployee.nome, // compatibilidade
  position: dbEmployee.cargo, // compatibilidade
  createdAt: new Date(dbEmployee.created_at),
  updatedAt: new Date(dbEmployee.updated_at),
  is_active: dbEmployee.is_active,
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    
    // Asserção de tipo removida, a tipagem agora é inferida corretamente.
    const { data: employee, error } = await supabase
      .from('confereai_employees')
      .select('*')
      .eq('id', params.id)
      .eq('is_active', true)
      .single()

    if (error || !employee) {
      return NextResponse.json(
        { error: 'Funcionário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ employee: mapDbEmployeeToApi(employee) })
  } catch (error) {
    console.error(`Erro na API GET /employees/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Erro interno ao buscar funcionário.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: UpdateEmployeeData = await request.json()
    const supabase = createServerClient()
    
    if (body.matricula) {
      const { data: existing } = await supabase
        .from('confereai_employees')
        .select('id')
        .eq('matricula', body.matricula)
        .eq('is_active', true)
        .neq('id', params.id)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'A matrícula informada já está em uso.' },
          { status: 409 }
        )
      }
    }

    // Erro resolvido e asserção de tipo removida.
    const { data: employee, error } = await supabase
      .from('confereai_employees')
      .update(body)
      .eq('id', params.id)
      .select('*')
      .single()

    if (error || !employee) {
      console.error('Erro ao atualizar funcionário:', error?.message)
      // Verifica se o erro é de recurso não encontrado para retornar 404
      if (error?.code === 'PGRST116') {
         return NextResponse.json(
          { error: 'Funcionário não encontrado para atualização.' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Erro interno ao atualizar funcionário.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ employee: mapDbEmployeeToApi(employee) })
  } catch (error) {
    console.error(`Erro na API PUT /employees/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Erro interno ao atualizar funcionário.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    
    // Erro resolvido. A tipagem correta permite a atualização.
    const { error } = await supabase
      .from('confereai_employees')
      .update({ is_active: false }) // Soft delete
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao excluir funcionário:', error.message)
      return NextResponse.json(
        { error: 'Erro interno ao excluir funcionário.' },
        { status: 500 }
      )
    }

    // Retorna 204 No Content para uma exclusão bem-sucedida.
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error(`Erro na API DELETE /employees/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Erro interno ao excluir funcionário.' },
      { status: 500 }
    )
  }
}