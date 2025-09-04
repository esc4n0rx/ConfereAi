"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { EquipmentNew, EquipmentStatusNew } from "@/lib/types"
import { AlertTriangle, Plus, X } from "lucide-react"

interface EquipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment?: EquipmentNew | null
  onSuccess: () => void
}

export function EquipmentDialog({ open, onOpenChange, equipment, onSuccess }: EquipmentDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    codigo: "",
    status: "disponivel" as EquipmentStatusNew,
    checklistCampos: [] as string[],
  })
  const [newChecklistField, setNewChecklistField] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (equipment) {
      setFormData({
        nome: equipment.nome,
        descricao: equipment.descricao,
        codigo: equipment.codigo || "",
        status: equipment.status,
        checklistCampos: equipment.checklistCampos || [],
      })
    } else {
      setFormData({
        nome: "",
        descricao: "",
        codigo: "",
        status: "disponivel",
        checklistCampos: [],
      })
    }
    setError("")
    setNewChecklistField("")
  }, [equipment, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const url = equipment ? `/api/equipments/${equipment.id}` : '/api/equipments'
      const method = equipment ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar equipamento')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Erro ao salvar equipamento:', error)
      setError(error.message || 'Erro ao salvar equipamento. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const addChecklistField = () => {
    if (newChecklistField.trim() && !formData.checklistCampos.includes(newChecklistField.trim())) {
      setFormData(prev => ({
        ...prev,
        checklistCampos: [...prev.checklistCampos, newChecklistField.trim()]
      }))
      setNewChecklistField("")
    }
  }

  const removeChecklistField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklistCampos: prev.checklistCampos.filter((_, i) => i !== index)
    }))
  }

  const getStatusLabel = (status: EquipmentStatusNew) => {
    const labels = {
      disponivel: "Disponível",
      manutencao: "Manutenção", 
      quebrado: "Quebrado",
      inativo: "Inativo"
    }
    return labels[status] || status
  }

  const getStatusVariant = (status: EquipmentStatusNew) => {
    const variants = {
      disponivel: "default" as const,
      manutencao: "secondary" as const,
      quebrado: "destructive" as const,
      inativo: "outline" as const
    }
    return variants[status] || "outline"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{equipment ? "Editar Equipamento" : "Adicionar Equipamento"}</DialogTitle>
          <DialogDescription>
            {equipment ? "Atualize as informações do equipamento." : "Preencha os dados do novo equipamento."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome do equipamento"
                required
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData((prev) => ({ ...prev, codigo: e.target.value }))}
                placeholder="EQ-001 (opcional)"
                maxLength={50}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descrição detalhada do equipamento"
              rows={3}
              required
              maxLength={1000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: EquipmentStatusNew) => setFormData((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="quebrado">Quebrado</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Campos do Checklist</Label>
            <p className="text-sm text-muted-foreground">
              Configure os campos que aparecerão no checklist deste equipamento
            </p>
            
            <div className="flex gap-2">
              <Input
                value={newChecklistField}
                onChange={(e) => setNewChecklistField(e.target.value)}
                placeholder="Ex: Bateria carregada, Pneus calibrados..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addChecklistField()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChecklistField}
                disabled={!newChecklistField.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.checklistCampos.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {formData.checklistCampos.map((campo, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {campo}
                      <button
                        type="button"
                        onClick={() => removeChecklistField(index)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.checklistCampos.length} campo(s) configurado(s)
                </p>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : equipment ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}