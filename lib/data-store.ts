import type { Employee, Equipment, EquipmentChecklist, ChecklistHistory, ChecklistResponse } from "./types"
import { mockEmployees, mockEquipment, mockChecklists, mockHistory } from "./mock-data"

class DataStore {
  private employees: Employee[] = [...mockEmployees]
  private equipment: Equipment[] = [...mockEquipment]
  private checklists: EquipmentChecklist[] = [...mockChecklists]
  private history: ChecklistHistory[] = [...mockHistory]

  // Employee methods
  getEmployees(): Employee[] {
    return this.employees
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.employees.find((emp) => emp.id === id)
  }

  addEmployee(employee: Omit<Employee, "id" | "createdAt" | "updatedAt">): Employee {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.employees.push(newEmployee)
    return newEmployee
  }

  updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const index = this.employees.findIndex((emp) => emp.id === id)
    if (index === -1) return null

    this.employees[index] = {
      ...this.employees[index],
      ...updates,
      updatedAt: new Date(),
    }
    return this.employees[index]
  }

  deleteEmployee(id: string): boolean {
    const index = this.employees.findIndex((emp) => emp.id === id)
    if (index === -1) return false

    this.employees.splice(index, 1)
    return true
  }

  // Equipment methods
  getEquipment(): Equipment[] {
    return this.equipment
  }

  getEquipmentById(id: string): Equipment | undefined {
    return this.equipment.find((eq) => eq.id === id)
  }

  addEquipment(equipment: Omit<Equipment, "id" | "createdAt" | "updatedAt">): Equipment {
    const newEquipment: Equipment = {
      ...equipment,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.equipment.push(newEquipment)
    return newEquipment
  }

  updateEquipment(id: string, updates: Partial<Equipment>): Equipment | null {
    const index = this.equipment.findIndex((eq) => eq.id === id)
    if (index === -1) return null

    this.equipment[index] = {
      ...this.equipment[index],
      ...updates,
      updatedAt: new Date(),
    }
    return this.equipment[index]
  }

  deleteEquipment(id: string): boolean {
    const index = this.equipment.findIndex((eq) => eq.id === id)
    if (index === -1) return false

    this.equipment.splice(index, 1)
    return true
  }

  // Checklist methods
  getChecklistByEquipmentId(equipmentId: string): EquipmentChecklist | undefined {
    return this.checklists.find((cl) => cl.equipmentId === equipmentId)
  }

  // History methods
  getHistory(): ChecklistHistory[] {
    return this.history.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  addChecklistResponse(response: ChecklistResponse): ChecklistHistory {
    const employee = this.getEmployeeById(response.employeeId)
    const equipment = this.getEquipmentById(response.equipmentId)

    if (!employee || !equipment) {
      throw new Error("Employee or equipment not found")
    }

    const historyEntry: ChecklistHistory = {
      id: Date.now().toString(),
      employee,
      equipment,
      action: response.action,
      responses: response.responses,
      hasIssues: response.hasIssues,
      notes: response.notes,
      createdAt: new Date(),
    }

    this.history.push(historyEntry)

    // Update equipment status based on action
    if (response.action === "taking") {
      this.updateEquipment(equipment.id, { status: "in-use" })
    } else if (response.action === "returning") {
      this.updateEquipment(equipment.id, {
        status: response.hasIssues ? "maintenance" : "available",
      })
    }

    return historyEntry
  }

  // Statistics methods
  getStats() {
    const totalEquipment = this.equipment.length
    const availableEquipment = this.equipment.filter((eq) => eq.status === "available").length
    const inUseEquipment = this.equipment.filter((eq) => eq.status === "in-use").length
    const maintenanceEquipment = this.equipment.filter((eq) => eq.status === "maintenance").length
    const totalEmployees = this.employees.length
    const recentActivity = this.history.filter((h) => {
      const dayAgo = new Date()
      dayAgo.setDate(dayAgo.getDate() - 1)
      return h.createdAt > dayAgo
    }).length

    return {
      totalEquipment,
      availableEquipment,
      inUseEquipment,
      maintenanceEquipment,
      totalEmployees,
      recentActivity,
    }
  }
}

export const dataStore = new DataStore()
