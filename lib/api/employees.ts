import type { DatabaseEmployee, Employee, CreateEmployeeData, UpdateEmployeeData } from '@/lib/types'

export class EmployeesAPI {
  
  /**
   * Converte DatabaseEmployee para Employee (compatibilidade)
   */
  private static mapDatabaseToEmployee(dbEmployee: any): Employee {
    return {
      id: dbEmployee.id,
      matricula: dbEmployee.matricula,
      nome: dbEmployee.nome,
      cargo: dbEmployee.cargo,
      // Compatibilidade com código existente
      name: dbEmployee.nome,
      position: dbEmployee.cargo,
      createdAt: new Date(dbEmployee.created_at),
      updatedAt: new Date(dbEmployee.updated_at),
      is_active: dbEmployee.is_active
    }
  }

  /**
   * Buscar todos os funcionários (client-side)
   */
  static async getAllEmployees(): Promise<Employee[]> {
    try {
      const response = await fetch('/api/employees')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao buscar funcionários')
      }

      const result = await response.json()
      return result.employees || []
    } catch (error) {
      console.error('Erro na API getAllEmployees:', error)
      throw error
    }
  }

  /**
   * Buscar funcionário por ID (client-side)
   */
  static async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const response = await fetch(`/api/employees/${id}`)
      
      if (response.status === 404) {
        return null
      }
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao buscar funcionário')
      }

      const result = await response.json()
      return result.employee || null
    } catch (error) {
      console.error('Erro na API getEmployeeById:', error)
      return null
    }
  }

  /**
   * Buscar funcionário por matrícula (client-side)
   */
  static async getEmployeeByMatricula(matricula: string): Promise<Employee | null> {
    try {
      const response = await fetch(`/api/employees/validate-matricula?matricula=${encodeURIComponent(matricula)}`)
      
      if (response.status === 404) {
        return null
      }
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao buscar funcionário')
      }

      const result = await response.json()
      return result.employee || null
    } catch (error) {
      console.error('Erro na API getEmployeeByMatricula:', error)
      return null
    }
  }

  /**
   * Criar novo funcionário (client-side)
   */
  static async createEmployee(employeeData: CreateEmployeeData): Promise<Employee> {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(employeeData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar funcionário')
      }

      const result = await response.json()
      return result.employee
    } catch (error) {
      console.error('Erro na API createEmployee:', error)
      throw error
    }
  }

  /**
   * Atualizar funcionário (client-side)
   */
  static async updateEmployee(id: string, updates: UpdateEmployeeData): Promise<Employee> {
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar funcionário')
      }

      const result = await response.json()
      return result.employee
    } catch (error) {
      console.error('Erro na API updateEmployee:', error)
      throw error
    }
  }

  /**
   * Excluir funcionário (client-side)
   */
  static async deleteEmployee(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir funcionário')
      }

      return true
    } catch (error) {
      console.error('Erro na API deleteEmployee:', error)
      throw error
    }
  }
}