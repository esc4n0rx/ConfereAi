"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import type { Equipment, Employee, ChecklistAction, ChecklistItem } from "@/lib/types"

interface ChecklistFormProps {
  employee: Employee
  equipment: Equipment
  action: ChecklistAction
  onBack: () => void
  onComplete: () => void
}

export function ChecklistForm({ employee, equipment, action, onBack, onComplete }: ChecklistFormProps) {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const checklist = dataStore.getChecklistByEquipmentId(equipment.id)

  if (!checklist) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum checklist configurado para este equipamento.</p>
          <Button onClick={onBack} className="mt-4">
            Voltar
          </Button>
        </CardContent>
      </Card>
    )
  }

  const handleResponseChange = (itemId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [itemId]: value,
    }))
  }

  const renderChecklistItem = (item: ChecklistItem) => {
    const value = responses[item.id]

    switch (item.type) {
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={item.id}
              checked={value || false}
              onCheckedChange={(checked) => handleResponseChange(item.id, checked)}
            />
            <Label htmlFor={item.id} className="text-sm font-normal">
              {item.label}
            </Label>
          </div>
        )

      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={item.id}>{item.label}</Label>
            <Input
              id={item.id}
              value={value || ""}
              onChange={(e) => handleResponseChange(item.id, e.target.value)}
              placeholder="Digite sua resposta..."
              required={item.required}
            />
          </div>
        )

      case "number":
        return (
          <div className="space-y-2">
            <Label htmlFor={item.id}>{item.label}</Label>
            <Input
              id={item.id}
              type="number"
              value={value || ""}
              onChange={(e) => handleResponseChange(item.id, Number(e.target.value))}
              placeholder="Digite um número..."
              required={item.required}
            />
          </div>
        )

      case "select":
        return (
          <div className="space-y-2">
            <Label htmlFor={item.id}>{item.label}</Label>
            <Select value={value || ""} onValueChange={(selectedValue) => handleResponseChange(item.id, selectedValue)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção..." />
              </SelectTrigger>
              <SelectContent>
                {item.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      default:
        return null
    }
  }

  const validateForm = () => {
    const requiredItems = checklist.items.filter((item) => item.required)
    return requiredItems.every((item) => {
      const response = responses[item.id]
      return response !== undefined && response !== "" && response !== null
    })
  }

  const detectIssues = () => {
    // Simple issue detection based on responses
    return Object.values(responses).some((response) => {
      if (typeof response === "string") {
        return (
          response.toLowerCase().includes("ruim") ||
          response.toLowerCase().includes("problema") ||
          response.toLowerCase().includes("danificado")
        )
      }
      if (typeof response === "boolean") {
        return !response // false indicates an issue for checkbox items
      }
      if (typeof response === "number") {
        return response < 20 // Low battery or poor condition
      }
      return false
    })
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setIsSubmitting(true)

    try {
      const hasIssues = detectIssues()

      dataStore.addChecklistResponse({
        id: Date.now().toString(),
        employeeId: employee.id,
        equipmentId: equipment.id,
        checklistId: checklist.id,
        action,
        responses,
        hasIssues,
        notes: notes.trim() || undefined,
        createdAt: new Date(),
      })

      onComplete()
    } catch (error) {
      console.error("Error submitting checklist:", error)
      alert("Erro ao enviar checklist. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = validateForm()
  const hasDetectedIssues = detectIssues()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onBack}>
          ← Voltar
        </Button>
        <div>
          <h2 className="text-lg font-semibold">
            {action === "taking" ? "Checklist de Retirada" : "Checklist de Devolução"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {equipment.name} ({equipment.code})
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Itens do Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {checklist.items
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <div key={item.id} className="space-y-2">
                {renderChecklistItem(item)}
                {item.required && <p className="text-xs text-muted-foreground">* Campo obrigatório</p>}
              </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Observações Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione observações, problemas encontrados ou comentários..."
            rows={3}
          />
        </CardContent>
      </Card>

      {hasDetectedIssues && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Possíveis problemas detectados</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Baseado nas suas respostas, foram identificados possíveis problemas com o equipamento.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting} className="flex-1" size="lg">
          {isSubmitting ? "Enviando..." : "Finalizar Checklist"}
        </Button>
      </div>
    </div>
  )
}
