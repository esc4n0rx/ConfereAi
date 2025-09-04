import type { Employee, Equipment, EquipmentChecklist, ChecklistItem, ChecklistHistory } from "./types"

export const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "João Silva",
    position: "Técnico de Campo",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Maria Santos",
    position: "Engenheira de Segurança",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    name: "Pedro Costa",
    position: "Operador de Máquinas",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
]

export const mockEquipment: Equipment[] = [
  {
    id: "1",
    name: "Capacete de Segurança",
    description: "Capacete de proteção individual classe A",
    code: "EPI-001",
    photos: ["/yellow-safety-helmet.png"],
    status: "available",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "2",
    name: "Furadeira Elétrica",
    description: "Furadeira de impacto 800W com maleta",
    code: "FER-002",
    photos: ["/electric-drill.jpg"],
    status: "in-use",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-03-01"),
  },
  {
    id: "3",
    name: "Multímetro Digital",
    description: "Multímetro digital com display LCD",
    code: "INS-003",
    photos: ["/digital-multimeter.jpg"],
    status: "available",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
]

export const mockChecklistItems: ChecklistItem[] = [
  {
    id: "1",
    label: "Estado geral do equipamento",
    type: "select",
    required: true,
    options: ["Excelente", "Bom", "Regular", "Ruim"],
    order: 1,
  },
  {
    id: "2",
    label: "Possui todos os acessórios?",
    type: "checkbox",
    required: true,
    order: 2,
  },
  {
    id: "3",
    label: "Observações adicionais",
    type: "text",
    required: false,
    order: 3,
  },
  {
    id: "4",
    label: "Nível de bateria (se aplicável)",
    type: "number",
    required: false,
    order: 4,
  },
]

export const mockChecklists: EquipmentChecklist[] = [
  {
    id: "1",
    equipmentId: "1",
    items: mockChecklistItems,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "2",
    equipmentId: "2",
    items: mockChecklistItems,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "3",
    equipmentId: "3",
    items: mockChecklistItems,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
]

export const mockHistory: ChecklistHistory[] = [
  {
    id: "1",
    employee: mockEmployees[0],
    equipment: mockEquipment[1],
    action: "taking",
    responses: {
      "1": "Bom",
      "2": true,
      "3": "Equipamento em perfeitas condições",
      "4": 85,
    },
    hasIssues: false,
    createdAt: new Date("2024-03-01T08:30:00"),
  },
  {
    id: "2",
    employee: mockEmployees[1],
    equipment: mockEquipment[0],
    action: "returning",
    responses: {
      "1": "Regular",
      "2": false,
      "3": "Falta a viseira de proteção",
      "4": null,
    },
    hasIssues: true,
    notes: "Viseira danificada durante o uso",
    createdAt: new Date("2024-03-02T17:15:00"),
  },
]
