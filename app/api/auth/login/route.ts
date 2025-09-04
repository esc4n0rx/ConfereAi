// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AuthAPI } from '@/lib/api/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { matricula, password } = body

    if (!matricula || !password) {
      return NextResponse.json(
        { error: 'Matrícula e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const user = await AuthAPI.authenticateAdmin({ matricula, password })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    const session = AuthAPI.createSession(user)

    const response = NextResponse.json({ user })
    
    // Set httpOnly cookie for session
    response.cookies.set('admin_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}