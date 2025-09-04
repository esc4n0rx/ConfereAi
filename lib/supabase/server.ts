// lib/supabase/server.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js' // Importar SupabaseClient
import { cookies } from 'next/headers'
import type { Database } from './client'

// Adicionar o tipo de retorno explícito aqui
export function createServerClient(): SupabaseClient<Database> {
  const cookieStore = cookies()
  
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false
      }
    }
  )
}