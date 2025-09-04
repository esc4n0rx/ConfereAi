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
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Employee } from "@/lib/types"
import { AlertTriangle } from "lucide-react"

interface EmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee | null
  onSuccess: () => void
}

export function EmployeeDialog({ open, onOpenChange, employee, onSuccess }: EmployeeDialogProps) {
  const [formData, setFormData] = useState({
    matricula: "",
    nome: "",
    cargo: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (employee) {
      setFormData({
        matricula: employee.matricula || "",
        nome: employee.nome || employee.name || "",
        cargo: employee.cargo || employee.position || "",
      })
    } else {
      setFormData({
        matricula: "",
        nome: "",
        cargo: "",
      })
    }
    setError("")
  }, [employee, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const url = employee ? `/api/employees/${employee.id}` : '/api/employees'
      const method = employee ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar funcionário')
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Erro ao salvar funcionário:', error)
      setError(error.message || 'Erro ao salvar funcionário. Tente novamente.')
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
            <Label htmlFor="matricula">Matrícula *</Label>
            <Input
              id="matricula"
              value={formData.matricula}
              onChange={(e) => setFormData((prev) => ({ ...prev, matricula: e.target.value }))}
              placeholder="Ex: 1001"
              required
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
              placeholder="Nome completo do funcionário"
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo *</Label>
            <Input
              id="cargo"
              value={formData.cargo}
              onChange={(e) => setFormData((prev) => ({ ...prev, cargo: e.target.value }))}
              placeholder="Cargo ou função"
              required
              maxLength={255}
            />
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
              {isLoading ? "Salvando..." : employee ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}