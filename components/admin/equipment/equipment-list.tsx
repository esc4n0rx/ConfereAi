// components/admin/equipment/equipments-list.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle, 
  RefreshCw,
  Settings,
  Eye
} from "lucide-react"
import type { EquipmentNew, EquipmentStatusNew } from "@/lib/types"
import { EquipmentDialog } from "./equipment-dialog"

export function EquipmentsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<EquipmentStatusNew | "all">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<EquipmentNew | null>(null)
  const [equipments, setEquipments] = useState<EquipmentNew[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const filteredEquipments = equipments.filter(
    (equipment) => {
      const matchesSearch = 
        equipment.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (equipment.codigo || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || equipment.status === statusFilter

      return matchesSearch && matchesStatus
    }
  )

  // Função auxiliar para garantir que data seja válida
  const safeFormatDate = (date: any): string => {
    try {
      if (!date) return "N/A"
      
      // Se já é uma instância de Date
      if (date instanceof Date) {
        return date.toLocaleDateString('pt-BR')
      }
      
      // Se é string, tentar converter
      if (typeof date === 'string') {
        const parsedDate = new Date(date)
        if (isNaN(parsedDate.getTime())) {
          return "Data inválida"
        }
        return parsedDate.toLocaleDateString('pt-BR')
      }
      
      return "N/A"
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return "Erro na data"
    }
  }

  const loadEquipments = async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await fetch('/api/equipments')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar equipamentos')
      }

      // Garantir que as datas sejam objetos Date válidos
      const processedEquipments = (result.equipments || []).map((eq: any) => ({
        ...eq,
        createdAt: eq.createdAt ? new Date(eq.createdAt) : new Date(),
        updatedAt: eq.updatedAt ? new Date(eq.updatedAt) : new Date(),
      }))

      setEquipments(processedEquipments)
    } catch (error: any) {
      console.error('Erro ao carregar equipamentos:', error)
      setError(error.message || 'Erro ao carregar equipamentos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEquipments()
  }, [])

  const handleEdit = (equipment: EquipmentNew) => {
    setEditingEquipment(equipment)
  }

  const handleDelete = async (equipment: EquipmentNew) => {
    if (!window.confirm(`Tem certeza que deseja excluir o equipamento "${equipment.nome}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/equipments/${equipment.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao excluir equipamento')
      }

      await loadEquipments()
    } catch (error: any) {
      console.error('Erro ao excluir equipamento:', error)
      alert(error.message || 'Erro ao excluir equipamento. Tente novamente.')
    }
  }

  const getStatusBadge = (status: EquipmentStatusNew) => {
    const statusConfig = {
      disponivel: { label: "Disponível", variant: "default" as const },
      manutencao: { label: "Manutenção", variant: "secondary" as const },
      quebrado: { label: "Quebrado", variant: "destructive" as const },
      inativo: { label: "Inativo", variant: "outline" as const }
    }

    const config = statusConfig[status] || { label: status, variant: "outline" as const }

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const getStatusCount = (status: EquipmentStatusNew) => {
    return equipments.filter(eq => eq.status === status).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando equipamentos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{equipments.length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold text-green-600">{getStatusCount("disponivel")}</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Manutenção</p>
                <p className="text-2xl font-bold text-orange-600">{getStatusCount("manutencao")}</p>
              </div>
              <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quebrados</p>
                <p className="text-2xl font-bold text-red-600">{getStatusCount("quebrado")}</p>
              </div>
              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadEquipments}
              className="ml-2"
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome, código ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EquipmentStatusNew | "all")}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">Todos os status</option>
            <option value="disponivel">Disponível</option>
            <option value="manutencao">Manutenção</option>
            <option value="quebrado">Quebrado</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Equipamento
        </Button>
      </div>

      {/* Equipments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Equipamentos Cadastrados ({filteredEquipments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Checklist</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {equipments.length === 0
                        ? "Nenhum equipamento cadastrado ainda."
                        : "Nenhum equipamento encontrado com os filtros aplicados."
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEquipments.map((equipment) => (
                    <TableRow key={equipment.id}>
                      <TableCell className="font-medium">{equipment.nome}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-xs">
                          {equipment.codigo || `EQ-${equipment.id.substring(0, 8).toUpperCase()}`}
                        </code>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={equipment.descricao}>
                        {equipment.descricao}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(equipment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {(equipment.checklistCampos || []).length} campo(s)
                          </span>
                          {(equipment.checklistCampos || []).length > 0 && (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {safeFormatDate(equipment.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(equipment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(equipment)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EquipmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={loadEquipments}
      />

      <EquipmentDialog
        open={!!editingEquipment}
        onOpenChange={(open) => !open && setEditingEquipment(null)}
        equipment={editingEquipment}
        onSuccess={loadEquipments}
      />
    </div>
  )
}