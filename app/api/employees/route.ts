// app/api/employees/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { CreateEmployeeData, DatabaseEmployee, Employee } from '@/lib/types'

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

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // A asserção de tipo não é mais necessária, a tipagem é inferida corretamente.
    const { data: employees, error } = await supabase
      .from('confereai_employees')
      .select('*')
      .eq('is_active', true)
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao buscar funcionários:', error.message)
      return NextResponse.json(
        { error: 'Erro interno ao buscar funcionários.' },
        { status: 500 }
      )
    }

    const mappedEmployees = (employees || []).map(mapDbEmployeeToApi)

    return NextResponse.json({ employees: mappedEmployees })
  } catch (error) {
    console.error('Erro inesperado na API GET /employees:', error)
    return NextResponse.json(
      { error: 'Erro inesperado no servidor.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateEmployeeData = await request.json()
    
    if (!body.matricula || !body.nome || !body.cargo) {
      return NextResponse.json(
        { error: 'Matrícula, nome e cargo são obrigatórios.' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    const { data: existing } = await supabase
      .from('confereai_employees')
      .select('id')
      .eq('matricula', body.matricula)
      .eq('is_active', true)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A matrícula informada já está em uso.' },
        { status: 409 }
      )
    }

    // O erro no .insert() é resolvido pois o cliente agora está tipado.
    const { data: newEmployee, error } = await supabase
        .from('confereai_employees')
        .insert({
            matricula: body.matricula,
            nome: body.nome,
            cargo: body.cargo,
        })
        .select('*')
        .single()

    if (error || !newEmployee) {
      console.error('Erro ao criar funcionário no Supabase:', error?.message)
      return NextResponse.json(
        { error: 'Erro interno ao criar o funcionário.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { employee: mapDbEmployeeToApi(newEmployee) },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro inesperado na API POST /employees:', error)
    return NextResponse.json(
      { error: 'Erro inesperado no servidor.' },
      { status: 500 }
    )
  }
}