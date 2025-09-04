// app/api/managers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ManagersAPI } from '@/lib/api/managers'
import type { UpdateManagerData } from '@/lib/types'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body: UpdateManagerData = await request.json()

    if (body.telefone) {
      const phoneRegex = /^\d{10,11}$/
      const cleanPhone = body.telefone.replace(/\D/g, '')
      
      if (!phoneRegex.test(cleanPhone)) {
        return NextResponse.json(
          { error: 'Telefone deve conter 10 ou 11 dígitos' },
          { status: 400 }
        )
      }
      
      body.telefone = cleanPhone
    }

    const manager = await ManagersAPI.updateManager(id, body)

    return NextResponse.json({
      manager,
      message: 'Encarregado atualizado com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao atualizar encarregado:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
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
    await ManagersAPI.deleteManager(id)

    return NextResponse.json({
      message: 'Encarregado removido com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao remover encarregado:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}