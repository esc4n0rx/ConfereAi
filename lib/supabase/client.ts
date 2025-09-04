import { createBrowserClient } from '@supabase/ssr'

export type Database = {
  public: {
    Tables: {
      confereai_employees: {
        Row: {
          id: string
          nome: string
          cargo: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          cargo: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          cargo?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      confereai_equipments: {
        Row: {
          id: string
          nome: string
          descricao: string
          codigo?: string | null
          status?: 'disponivel' | 'manutencao' | 'quebrado' | 'inativo'
          checklist_campos?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          nome: string
          descricao: string
          codigo?: string | null
          status?: 'disponivel' | 'manutencao' | 'quebrado' | 'inativo'
          checklist_campos?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string
          codigo?: string | null
          status?: 'disponivel' | 'manutencao' | 'quebrado' | 'inativo'
          checklist_campos?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      confereai_checklist_photos: {
        Row: {
          id: string
          checklist_id: string
          photo_url: string
          photo_type: string
          created_at: string
        }
        Insert: {
          id?: string
          checklist_id: string
          photo_url: string
          photo_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          checklist_id?: string
          photo_url?: string
          photo_type?: string
          created_at?: string
        }
      }
      confereai_checklist_tokens: {
        Row: {
          id: string
          token: string
          is_active: boolean
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          token: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          token?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
      }
      confereai_managers: {
        Row: {
          id: string
          nome: string
          telefone: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          telefone: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          telefone?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      
      confereai_checklist_approvals: {
        Row: {
          id: string
          checklist_id: string
          manager_id: string
          status: 'pending' | 'approved' | 'rejected'
          response_message?: string | null
          responded_at?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          checklist_id: string
          manager_id: string
          status?: 'pending' | 'approved' | 'rejected'
          response_message?: string | null
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          checklist_id?: string
          manager_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          response_message?: string | null
          responded_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      
      confereai_checklists: {
        Row: {
          id: string
          codigo: string
          employee_id: string
          equipment_id: string
          action: 'taking' | 'returning'
          checklist_responses: Record<string, any>
          observations: string | null
          has_issues: boolean
          device_timestamp: string
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          approval_status?: 'pending' | 'approved' | 'rejected' | null
          approved_by?: string | null
          approval_response?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo: string
          employee_id: string
          equipment_id: string
          action: 'taking' | 'returning'
          checklist_responses?: Record<string, any>
          observations?: string | null
          has_issues?: boolean
          device_timestamp: string
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          approval_status?: 'pending' | 'approved' | 'rejected' | null
          approved_by?: string | null
          approval_response?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo?: string
          employee_id?: string
          equipment_id?: string
          action?: 'taking' | 'returning'
          checklist_responses?: Record<string, any>
          observations?: string | null
          has_issues?: boolean
          device_timestamp?: string
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          approval_status?: 'pending' | 'approved' | 'rejected' | null
          approved_by?: string | null
          approval_response?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}


export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}