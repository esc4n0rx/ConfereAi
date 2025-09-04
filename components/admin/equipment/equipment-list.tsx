"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import type { Equipment, EquipmentStatus } from "@/lib/types"
import { EquipmentDialog } from "./equipment-dialog"
import { EquipmentDetailsDialog } from "./equipment-details-dialog"

export function EquipmentList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | "all">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [viewingEquipment, setViewingEquipment] = useState<Equipment | null>(null)

  const equipment = dataStore.getEquipment()

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: EquipmentStatus) => {
    const variants = {
      available: { variant: "default" as const, label: "Disponível", className: "bg-primary" },
      "in-use": { variant: "secondary" as const, label: "Em Uso", className: "" },
      maintenance: { variant: "destructive" as const, label: "Manutenção", className: "" },
      retired: { variant: "outline" as const, label: "Aposentado", className: "" },
    }

    const config = variants[status]
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este equipamento?")) {
      dataStore.deleteEquipment(id)
      // Force re-render by updating state
      setSearchTerm(searchTerm + " ")
      setSearchTerm(searchTerm)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar equipamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EquipmentStatus | "all")}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">Todos os Status</option>
            <option value="available">Disponível</option>
            <option value="in-use">Em Uso</option>
            <option value="maintenance">Manutenção</option>
            <option value="retired">Aposentado</option>
          </select>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Equipamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEquipment.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <p className="text-sm text-muted-foreground font-mono">{item.code}</p>
                </div>
                {getStatusBadge(item.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

              {item.photos.length > 0 && (
                <div className="aspect-video bg-muted rounded-md overflow-hidden">
                  <img
                    src={item.photos[0] || "/placeholder.svg"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setViewingEquipment(item)} className="flex-1 gap-2">
                  <Eye className="h-3 w-3" />
                  Ver
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditingEquipment(item)} className="flex-1 gap-2">
                  <Edit className="h-3 w-3" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Nenhum equipamento encontrado com os filtros aplicados."
              : "Nenhum equipamento cadastrado ainda."}
          </p>
        </div>
      )}

      <EquipmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={() => {
          setIsAddDialogOpen(false)
          // Force re-render
          setSearchTerm(searchTerm + " ")
          setSearchTerm(searchTerm)
        }}
      />

      <EquipmentDialog
        open={!!editingEquipment}
        onOpenChange={(open) => !open && setEditingEquipment(null)}
        equipment={editingEquipment}
        onSuccess={() => {
          setEditingEquipment(null)
          // Force re-render
          setSearchTerm(searchTerm + " ")
          setSearchTerm(searchTerm)
        }}
      />

      <EquipmentDetailsDialog
        open={!!viewingEquipment}
        onOpenChange={(open) => !open && setViewingEquipment(null)}
        equipment={viewingEquipment}
      />
    </div>
  )
}
