// app/api/managers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ManagersAPI } from '@/lib/api/managers'
import type { CreateManagerData } from '@/lib/types'

export async function GET() {
  try {
    const managers = await ManagersAPI.getAllManagers()
    return NextResponse.json({ managers })
  } catch (error) {
    console.error('Erro ao buscar encarregados:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateManagerData = await request.json()
    
    if (!body.nome || !body.telefone) {
      return NextResponse.json(
        { error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar formato do telefone
    const phoneRegex = /^\d{10,11}$/
    const cleanPhone = body.telefone.replace(/\D/g, '')
    
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Telefone deve conter 10 ou 11 dígitos' },
        { status: 400 }
      )
    }

    const manager = await ManagersAPI.createManager({
      nome: body.nome,
      telefone: cleanPhone
    })

    return NextResponse.json(
      { manager, message: 'Encarregado criado com sucesso' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Erro ao criar encarregado:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}