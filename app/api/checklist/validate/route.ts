// app/api/checklist/validate/route.ts (continuação)
import { NextRequest, NextResponse } from 'next/server'
import { ChecklistAPI } from '@/lib/api/checklist'

export async function GET(request: NextRequest) {
 try {
   const { searchParams } = new URL(request.url)
   const token = searchParams.get('token')

   if (!token) {
     return NextResponse.json(
       { error: 'Token é obrigatório' },
       { status: 400 }
     )
   }

   const result = await ChecklistAPI.validateToken(token)

   if (!result.valid) {
     return NextResponse.json(
       { error: 'Token inválido ou expirado' },
       { status: 401 }
     )
   }

   return NextResponse.json({ valid: true })
 } catch (error) {
   console.error('Erro na validação de token:', error)
   return NextResponse.json(
     { error: 'Erro interno do servidor' },
     { status: 500 }
   )
 }
}