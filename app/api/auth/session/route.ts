// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { AuthAPI } from '@/lib/api/auth'
import type { AuthSession } from '@/lib/api/auth'

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('admin_session')
    
    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null })
    }

    const session: AuthSession = JSON.parse(sessionCookie.value)
    
    if (!AuthAPI.validateSession(session)) {
      const response = NextResponse.json({ user: null })
      response.cookies.delete('admin_session')
      return response
    }

    // Verify user still exists and is active
    const user = await AuthAPI.getAdminById(session.user.id)
    
    if (!user) {
      const response = NextResponse.json({ user: null })
      response.cookies.delete('admin_session')
      return response
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json({ user: null })
  }
}