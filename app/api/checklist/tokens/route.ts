// app/api/checklist/tokens/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Gerar token único e permanente
    const token = 'preecher-checklist'
    
    // Verificar se já existe um token ativo
    const { data: existingToken } = await supabase
      .from('confereai_checklist_tokens')
      .select('id, token')
      .eq('token', token)
      .eq('is_active', true)
      .single()

    if (existingToken) {
      return NextResponse.json({ 
        success: true, 
        token: existingToken.token,
        message: 'Token já existe e está ativo'
      })
    }

    // Criar novo token
    const { data: newToken, error } = await supabase
      .from('confereai_checklist_tokens')
      .insert({
        token,
        is_active: true,
        expires_at: null // Token permanente
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ 
      success: true, 
      token: newToken.token 
    })
  } catch (error) {
    console.error('Erro ao gerar token de checklist:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Buscar token ativo
    const { data: token } = await supabase
      .from('confereai_checklist_tokens')
      .select('token')
      .eq('token', 'preecher-checklist')
      .eq('is_active', true)
      .single()

    if (token) {
      return NextResponse.json({ 
        success: true, 
        token: token.token 
      })
    }

    return NextResponse.json({ 
      success: false,
      message: 'Nenhum token ativo encontrado' 
    })
  } catch (error) {
    console.error('Erro ao buscar token:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}