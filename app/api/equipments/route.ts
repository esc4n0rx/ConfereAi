// app/api/equipments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { CreateEquipmentData, DatabaseEquipment, EquipmentNew } from '@/lib/types'

/**
 * Mapeia um objeto do banco de dados (DatabaseEquipment) para o formato da API (EquipmentNew).
 */
const mapDbEquipmentToApi = (dbEquipment: DatabaseEquipment): EquipmentNew => ({
  id: dbEquipment.id,
  nome: dbEquipment.nome,
  descricao: dbEquipment.descricao,
  codigo: dbEquipment.codigo || `EQ-${dbEquipment.id.substring(0, 8).toUpperCase()}`,
  status: dbEquipment.status,
  checklistCampos: dbEquipment.checklist_campos || [],
  // Garantir que seja um objeto Date válido
  createdAt: new Date(dbEquipment.created_at),
  updatedAt: new Date(dbEquipment.updated_at),
})

export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data: equipments, error } = await supabase
      .from('confereai_equipments')
      .select('*')
      .eq('is_active', true)
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao buscar equipamentos:', error.message)
      return NextResponse.json(
        { error: 'Erro interno ao buscar equipamentos.' },
        { status: 500 }
      )
    }

    const mappedEquipments = (equipments || []).map(mapDbEquipmentToApi)

    return NextResponse.json({ equipments: mappedEquipments })
  } catch (error) {
    console.error('Erro inesperado na API GET /equipments:', error)
    return NextResponse.json(
      { error: 'Erro inesperado no servidor.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateEquipmentData = await request.json()
    
    if (!body.nome || !body.descricao) {
      return NextResponse.json(
        { error: 'Nome e descrição são obrigatórios.' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    
    // Verificar se já existe um equipamento com o mesmo código (se fornecido)
    if (body.codigo) {
      const { data: existing } = await supabase
        .from('confereai_equipments')
        .select('id')
        .eq('codigo', body.codigo)
        .eq('is_active', true)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'O código informado já está em uso.' },
          { status: 409 }
        )
      }
    }

    const { data: equipment, error } = await supabase
      .from('confereai_equipments')
      .insert([{
        nome: body.nome.trim(),
        descricao: body.descricao.trim(),
        codigo: body.codigo?.trim() || null,
        status: body.status || 'disponivel',
        checklist_campos: body.checklistCampos || [],
        is_active: true,
      }])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar equipamento:', error.message)
      return NextResponse.json(
        { error: 'Erro ao criar equipamento.' },
        { status: 500 }
      )
    }

    const mappedEquipment = mapDbEquipmentToApi(equipment)

    return NextResponse.json(
      { equipment: mappedEquipment, message: 'Equipamento criado com sucesso.' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro inesperado na API POST /equipments:', error)
    return NextResponse.json(
      { error: 'Erro inesperado no servidor.' },
      { status: 500 }
    )
  }
}