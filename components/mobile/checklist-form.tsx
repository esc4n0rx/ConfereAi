// components/mobile/checklist-form.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Package, 
  User, 
  ArrowLeft, 
  Send, 
  AlertTriangle,
} from 'lucide-react'
import type { DatabaseEmployee, DatabaseEquipment } from '@/lib/types'

interface ChecklistFormProps {
  employee: DatabaseEmployee
  equipment: DatabaseEquipment
  action: 'taking' | 'returning'
  responses: Record<string, any>
  observations: string
  hasIssues: boolean
  loading: boolean
  onUpdateResponse: (field: string, value: any) => void
  onUpdateObservations: (observations: string) => void
  onToggleIssue: (hasIssue: boolean) => void
  onSubmit: (isEquipmentReady: boolean) => void
  onBack: () => void
}

export function ChecklistForm({
  employee,
  equipment,
  action,
  responses,
  observations,
  hasIssues,
  loading,
  onUpdateResponse,
  onUpdateObservations,
  onToggleIssue,
  onSubmit,
  onBack
}: ChecklistFormProps) {
  const checklistFields = equipment.checklist_campos || []

  const canSubmit = () => {
    for (const field of checklistFields) {
      if (!responses[field] || responses[field] === '') {
        return false
      }
    }
    return true
  }

  const handleFinalize = () => {
    if (!canSubmit()) {
      return
    }
    // Para simplificar, vamos assumir que se não há problemas marcados, o equipamento está apto.
    // O modal complexo foi removido.
    onSubmit(!hasIssues);
  }

  const getSubmitButtonText = () => {
    const missingFields = checklistFields.filter(field => !responses[field] || responses[field] === '')
    if (missingFields.length > 0) {
      return `Faltam ${missingFields.length} campo(s)`
    }
    
    return 'Finalizar Checklist'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">Checklist</h1>
                <Badge variant={action === 'taking' ? 'default' : 'secondary'}>
                  {action === 'taking' ? 'Retirada' : 'Devolução'}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Preencha os campos abaixo para registrar a movimentação.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna de Informações */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Funcionário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{employee.nome}</p>
              <p className="text-sm text-muted-foreground">{employee.cargo}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Equipamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{equipment.nome}</p>
              <p className="text-sm text-muted-foreground">{equipment.codigo}</p>
            </CardContent>
          </Card>
        </div>

        {/* Coluna do Formulário */}
        <div className="space-y-6">
          {checklistFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Itens de Verificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {checklistFields.map((field, index) => (
                  <div key={index} className="space-y-3">
                    <Label className="font-medium">{field}</Label>
                    <RadioGroup
                      value={responses[field] || ''}
                      onValueChange={(value) => onUpdateResponse(field, value)}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ok" id={`${field}-ok`} />
                        <Label htmlFor={`${field}-ok`}>✓ OK</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="problema" id={`${field}-problema`} />
                        <Label htmlFor={`${field}-problema`}>⚠ Problema</Label>
                      </div>
                    </RadioGroup>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Adicione observações sobre o estado do equipamento..."
                value={observations}
                onChange={(e) => onUpdateObservations(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="has-issues" className="font-medium flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Reportar problema geral no equipamento?
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Ative esta opção se o equipamento precisa ser enviado para manutenção.
            </p>
          </div>
          <Switch
            id="has-issues"
            checked={hasIssues}
            onCheckedChange={onToggleIssue}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleFinalize}
          disabled={!canSubmit() || loading}
          size="lg"
          className="w-full md:w-auto"
        >
          {loading ? 'Enviando...' : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {getSubmitButtonText()}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}