"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, User } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import type { Employee } from "@/lib/types"
import { EmployeeDialog } from "./employee-dialog"

export function EmployeesList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const employees = dataStore.getEmployees()

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id.includes(searchTerm),
  )

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
      dataStore.deleteEmployee(id)
      // Force re-render
      setSearchTerm(searchTerm + " ")
      setSearchTerm(searchTerm)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar funcionários..."
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
            Funcionários Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
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
                      <TableCell className="font-mono">{employee.id}</TableCell>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{employee.position}</Badge>
                      </TableCell>
                      <TableCell>{employee.createdAt.toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingEmployee(employee)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(employee.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
        onSuccess={() => {
          setIsAddDialogOpen(false)
          // Force re-render
          setSearchTerm(searchTerm + " ")
          setSearchTerm(searchTerm)
        }}
      />

      <EmployeeDialog
        open={!!editingEmployee}
        onOpenChange={(open) => !open && setEditingEmployee(null)}
        employee={editingEmployee}
        onSuccess={() => {
          setEditingEmployee(null)
          // Force re-render
          setSearchTerm(searchTerm + " ")
          setSearchTerm(searchTerm)
        }}
      />
    </div>
  )
}
