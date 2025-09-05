// lib/types.ts
// lib/types.ts
export interface Employee {
  id: string
  matricula: string
  nome: string
  cargo: string
  is_active?: boolean
  createdAt: Date
  updatedAt: Date
}

// Manter compatibilidade com código existente
export interface Employee {
  id: string
  name: string
  position: string
  createdAt: Date
  updatedAt: Date
}

export interface Equipment {
  id: string
  name: string
  description: string
  code: string
  photos: string[]
  status: "available" | "in-use" | "maintenance" | "retired"
  createdAt: Date
  updatedAt: Date
}

// Novos tipos para o sistema de equipamentos
export interface EquipmentNew {
  id: string
  nome: string
  descricao: string
  codigo?: string
  status: "disponivel" | "manutencao" | "quebrado" | "inativo" | "em_uso"
  checklistCampos: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ChecklistItem {
  id: string
  label: string
  type: "checkbox" | "text" | "number" | "select"
  required: boolean
  options?: string[] // For select type
  order: number
}

export interface EquipmentChecklist {
  id: string
  equipmentId: string
  items: ChecklistItem[]
  createdAt: Date
  updatedAt: Date
}

export interface ChecklistResponse {
  id: string
  employeeId: string
  equipmentId: string
  checklistId: string
  action: "taking" | "returning"
  responses: Record<string, any> // itemId -> response value
  hasIssues: boolean
  notes?: string
  createdAt: Date
}

export interface ChecklistHistory {
  id: string
  employee: Employee
  equipment: Equipment
  action: "taking" | "returning"
  responses: Record<string, any>
  hasIssues: boolean
  notes?: string
  createdAt: Date
}

export type EquipmentStatus = Equipment["status"]
export type EquipmentStatusNew = EquipmentNew["status"]
export type ChecklistAction = ChecklistResponse["action"]

// Novos tipos para API
export interface DatabaseEmployee {
  id: string
  matricula: string
  nome: string
  cargo: string
  is_active: boolean
  created_at: string
  updated_at: string
  null: any
}

export interface DatabaseEquipment {
  id: string
  nome: string
  descricao: string
  codigo?: string
  status: EquipmentStatusNew
  checklist_campos: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateEmployeeData {
  matricula: string
  nome: string
  cargo: string
}

export interface UpdateEmployeeData {
  matricula?: string
  nome?: string
  cargo?: string
  is_active?: boolean
}

export interface CreateEquipmentData {
  nome: string
  descricao: string
  codigo?: string
  status: EquipmentStatusNew
  checklistCampos: string[]
}

export interface UpdateEquipmentData {
  nome?: string
  descricao?: string
  codigo?: string
  status?: EquipmentStatusNew
  checklistCampos?: string[]
  is_active?: boolean
}

// Novos tipos para Checklist Mobile
export interface ChecklistData {
  id: string
  employee_id:string
  equipment_id:string
  codigo: string
  employee: DatabaseEmployee
  equipment: DatabaseEquipment
  action: 'taking' | 'returning'
  checklist_responses: Record<string, any>
  observations: string | null
  has_issues: boolean
  device_timestamp: string
  photos: ChecklistPhoto[]
  created_at: string
  updated_at: string
}

export interface ChecklistPhoto {
  id: string
  checklist_id: string
  photo_url: string
  photo_type: string
  created_at: string
}

export interface ChecklistData {
  id: string
  codigo: string
  employee: DatabaseEmployee
  equipment: DatabaseEquipment
  action: 'taking' | 'returning'
  checklist_responses: Record<string, any>
  observations: string | null
  has_issues: boolean
  device_timestamp: string
  photos: ChecklistPhoto[]
  created_at: string
  updated_at: string
}



export interface ChecklistToken {
  id: string
  employee_id?: string
  expires_at: string
  used: boolean
  created_at: string
}

export interface MobileChecklistState {
  step: 'validation' | 'action' | 'equipment' | 'checklist' | 'success'
  employee: DatabaseEmployee | null
  action: 'taking' | 'returning' | null
  equipment: DatabaseEquipment | null
  responses: Record<string, any>
  observations: string
  photos: File[]
  hasIssues: boolean
}

// Adicionar nova interface para dados de checklist estendidos
export interface ExtendedChecklistData extends ChecklistData {
  equipment_status: 'available' | 'maintenance'
  is_equipment_ready: boolean
  photos: string[]
}

// lib/types.ts (ADICIONAR ao arquivo existente)

// Tipos para Managers/Encarregados
export interface Manager {
  id: string
  nome: string
  telefone: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateManagerData {
  nome: string
  telefone: string
}

export interface UpdateManagerData {
  nome?: string
  telefone?: string
  is_active?: boolean
}

// Tipos para Sistema de Aprovação
export interface ChecklistApproval {
  id: string
  checklist_id: string
  manager_id: string
  status: 'pending' | 'approved' | 'rejected'
  response_message?: string
  responded_at?: string
  created_at: string
  updated_at: string
}

export interface ChecklistWithApproval extends ChecklistData {
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  approval_status?: 'pending' | 'approved' | 'rejected'
  approved_by?: Manager
  approval_response?: string
}

// Atualizar a interface ChecklistData existente para incluir status
export interface ChecklistDataWithStatus extends ChecklistData {
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  approval_status?: 'pending' | 'approved' | 'rejected'
}

export interface WhatsAppWebhookRequest {
  phoneNumber: string
  approved: boolean
  timestamp?: string
}

export interface WhatsAppWebhookResponse {
  success: boolean
  error?: string
  checklistCodigo?: string
  manager?: string
}