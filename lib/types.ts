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