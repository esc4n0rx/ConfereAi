"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { dataStore } from "@/lib/data-store"
import type { Employee } from "@/lib/types"

interface EmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee | null
  onSuccess: () => void
}

export function EmployeeDialog({ open, onOpenChange, employee, onSuccess }: EmployeeDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        position: employee.position,
      })
    } else {
      setFormData({
        name: "",
        position: "",
      })
    }
  }, [employee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (employee) {
        dataStore.updateEmployee(employee.id, formData)
      } else {
        dataStore.addEmployee(formData)
      }
      onSuccess()
    } catch (error) {
      console.error("Error saving employee:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{employee ? "Editar Funcionário" : "Adicionar Funcionário"}</DialogTitle>
          <DialogDescription>
            {employee ? "Atualize as informações do funcionário." : "Preencha os dados do novo funcionário."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Nome do funcionário"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
              placeholder="Cargo ou função"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : employee ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
