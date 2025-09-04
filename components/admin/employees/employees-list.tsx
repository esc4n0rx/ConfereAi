"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Plus, Edit, Trash2, User, AlertTriangle, RefreshCw } from "lucide-react"
import type { Employee } from "@/lib/types"
import { EmployeeDialog } from "./employee-dialog"

export function EmployeesList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const filteredEmployees = employees.filter(
    (employee) =>
      (employee.nome || employee.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.cargo || employee.position || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.matricula || employee.id || "").includes(searchTerm),
  )

  // Função para garantir que createdAt seja Date
  const ensureDate = (date: any): Date => {
    if (date instanceof Date) {
      return date
    }
    if (typeof date === 'string') {
      return new Date(date)
    }
    return new Date()
  }

  const loadEmployees = async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await fetch('/api/employees')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar funcionários')
      }

      // Garantir que as datas sejam objetos Date
      const mappedEmployees = (result.employees || []).map((emp: any) => ({
        ...emp,
        createdAt: ensureDate(emp.createdAt),
        updatedAt: ensureDate(emp.updatedAt)
      }))

      setEmployees(mappedEmployees)
    } catch (error: any) {
      console.error('Erro ao carregar funcionários:', error)
      setError(error.message || 'Erro ao carregar funcionários')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o funcionário "${nome}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao excluir funcionário')
      }

      await loadEmployees() // Recarregar lista
    } catch (error: any) {
      console.error('Erro ao excluir funcionário:', error)
      alert(error.message || 'Erro ao excluir funcionário')
    }
  }

  const handleSuccess = () => {
    loadEmployees() // Recarregar lista após criar/editar
    setEditingEmployee(null)
    setIsAddDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Carregando funcionários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadEmployees}
              className="ml-2"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome, cargo ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Funcionário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Funcionários Cadastrados ({employees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {employees.length === 0
                        ? "Nenhum funcionário cadastrado ainda"
                        : "Nenhum funcionário encontrado com o termo de busca"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-mono font-medium">
                        {employee.matricula || employee.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {employee.nome || employee.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {employee.cargo || employee.position}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ensureDate(employee.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingEmployee(employee)}
                            className="h-8 w-8 p-0"
                            title="Editar funcionário"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(employee.id, employee.nome || employee.name)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Excluir funcionário"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredEmployees.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {filteredEmployees.length} de {employees.length} funcionários
            </div>
          )}
        </CardContent>
      </Card>

      <EmployeeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleSuccess}
      />

      <EmployeeDialog
        open={!!editingEmployee}
        onOpenChange={(open) => !open && setEditingEmployee(null)}
        employee={editingEmployee}
        onSuccess={handleSuccess}
      />
    </div>
  )
}