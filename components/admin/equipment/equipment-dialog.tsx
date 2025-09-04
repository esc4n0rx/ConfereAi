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
import { dataStore } from "@/lib/data-store"
import type { Equipment, EquipmentStatus } from "@/lib/types"

interface EquipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment?: Equipment | null
  onSuccess: () => void
}

export function EquipmentDialog({ open, onOpenChange, equipment, onSuccess }: EquipmentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    status: "available" as EquipmentStatus,
    photos: [] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name,
        description: equipment.description,
        code: equipment.code,
        status: equipment.status,
        photos: equipment.photos,
      })
    } else {
      setFormData({
        name: "",
        description: "",
        code: "",
        status: "available",
        photos: [],
      })
    }
  }, [equipment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (equipment) {
        dataStore.updateEquipment(equipment.id, formData)
      } else {
        dataStore.addEquipment(formData)
      }
      onSuccess()
    } catch (error) {
      console.error("Error saving equipment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUrlAdd = (url: string) => {
    if (url.trim() && !formData.photos.includes(url.trim())) {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, url.trim()],
      }))
    }
  }

  const handlePhotoRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{equipment ? "Editar Equipamento" : "Adicionar Equipamento"}</DialogTitle>
          <DialogDescription>
            {equipment ? "Atualize as informações do equipamento." : "Preencha os dados do novo equipamento."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do equipamento"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="EPI-001"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição detalhada do equipamento"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: EquipmentStatus) => setFormData((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponível</SelectItem>
                <SelectItem value="in-use">Em Uso</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="retired">Aposentado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fotos</Label>
            <div className="space-y-2">
              <Input
                placeholder="URL da foto"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handlePhotoUrlAdd(e.currentTarget.value)
                    e.currentTarget.value = ""
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">Pressione Enter para adicionar a URL da foto</p>
            </div>

            {formData.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handlePhotoRemove(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
