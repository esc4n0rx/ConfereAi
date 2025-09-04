// app/api/equipments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { UpdateEquipmentData, DatabaseEquipment, EquipmentNew } from '@/lib/types'

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createServerClient()

    const { data: equipment, error } = await supabase
      .from('confereai_equipments')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !equipment) {
      return NextResponse.json(
        { error: 'Equipamento não encontrado.' },
        { status: 404 }
      )
    }

    const mappedEquipment = mapDbEquipmentToApi(equipment)

    return NextResponse.json({ equipment: mappedEquipment })
  } catch (error) {
    console.error('Erro inesperado na API GET /equipments/[id]:', error)
    return NextResponse.json(
      { error: 'Erro inesperado no servidor.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body: UpdateEquipmentData = await request.json()
    
    const supabase = createServerClient()

    // Verificar se o equipamento existe
    const { data: existing } = await supabase
      .from('confereai_equipments')
      .select('id')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Equipamento não encontrado.' },
        { status: 404 }
      )
    }

    // Verificar se já existe um equipamento com o mesmo código (se alterado)
    if (body.codigo) {
      const { data: codeExists } = await supabase
        .from('confereai_equipments')
        .select('id')
        .eq('codigo', body.codigo)
        .neq('id', id)
        .eq('is_active', true)
        .single()

      if (codeExists) {
        return NextResponse.json(
          { error: 'O código informado já está em uso.' },
          { status: 409 }
        )
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.nome) updateData.nome = body.nome.trim()
    if (body.descricao) updateData.descricao = body.descricao.trim()
    if (body.codigo !== undefined) updateData.codigo = body.codigo?.trim() || null
    if (body.status) updateData.status = body.status
    if (body.checklistCampos !== undefined) updateData.checklist_campos = body.checklistCampos
    if (body.is_active !== undefined) updateData.is_active = body.is_active

    const { data: equipment, error } = await supabase
      .from('confereai_equipments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar equipamento:', error.message)
      return NextResponse.json(
        { error: 'Erro ao atualizar equipamento.' },
        { status: 500 }
      )
    }

    const mappedEquipment = mapDbEquipmentToApi(equipment)

    return NextResponse.json({
      equipment: mappedEquipment,
      message: 'Equipamento atualizado com sucesso.'
    })
  } catch (error) {
    console.error('Erro inesperado na API PUT /equipments/[id]:', error)
    return NextResponse.json(
      { error: 'Erro inesperado no servidor.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = createServerClient()

    // Verificar se o equipamento existe
    const { data: existing } = await supabase
      .from('confereai_equipments')
      .select('id')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Equipamento não encontrado.' },
        { status: 404 }
      )
    }

    // Soft delete - marcar como inativo
    const { error } = await supabase
      .from('confereai_equipments')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir equipamento:', error.message)
      return NextResponse.json(
        { error: 'Erro ao excluir equipamento.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Equipamento excluído com sucesso.'
    })
  } catch (error) {
    console.error('Erro inesperado na API DELETE /equipments/[id]:', error)
    return NextResponse.json(
      { error: 'Erro inesperado no servidor.' },
      { status: 500 }
    )
  }
}