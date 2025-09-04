// components/mobile/checklist-form.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { PhotoCapture } from './photo-capture'
import type { DatabaseEmployee, DatabaseEquipment } from '@/lib/types'

interface ChecklistFormProps {
  employee: DatabaseEmployee
  equipment: DatabaseEquipment
  action: 'taking' | 'returning'
  responses: Record<string, any>
  observations: string
  photos: File[]
  hasIssues: boolean
  loading: boolean
  onUpdateResponse: (field: string, value: any) => void
  onUpdateObservations: (observations: string) => void
  onAddPhoto: (photo: File) => void
  onRemovePhoto: (index: number) => void
  onToggleIssue: (hasIssues: boolean) => void
  onSubmit: () => Promise<void>
  onBack: () => void
}

export function ChecklistForm({
  employee,
  equipment,
  action,
  responses,
  observations,
  photos,
  hasIssues,
  loading,
  onUpdateResponse,
  onUpdateObservations,
  onAddPhoto,
  onRemovePhoto,
  onToggleIssue,
  onSubmit,
  onBack
}: ChecklistFormProps) {
  const [submitting, setSubmitting] = useState(false)

  const getActionTitle = () => {
    return action === 'taking' ? 'Retirada de Equipamento' : 'Devolução de Equipamento'
  }

  const getActionColor = () => {
    return action === 'taking' ? 'bg-blue-600' : 'bg-green-600'
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onSubmit()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="mr-2"
            disabled={submitting}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold">{getActionTitle()}</h1>
        </div>

        {/* Resumo */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{equipment.nome}</CardTitle>
              <Badge className={getActionColor()}>
                {action === 'taking' ? 'Retirada' : 'Devolução'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Funcionário:</span> {employee.nome}
            </div>
            <div className="text-sm">
              <span className="font-medium">Equipamento:</span> {equipment.descricao}
            </div>
            {equipment.codigo && (
              <div className="text-sm font-mono">
                <span className="font-medium">Código:</span> {equipment.codigo}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Verificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipment.checklist_campos && equipment.checklist_campos.length > 0 ? (
              equipment.checklist_campos.map((campo, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Checkbox
                    id={`check_${index}`}
                    checked={responses[campo] === true}
                    onCheckedChange={(checked) => onUpdateResponse(campo, checked)}
                    className="mt-1"
                  />
                  <label 
                    htmlFor={`check_${index}`}
                    className="text-sm flex-1 cursor-pointer"
                  >
                    {campo}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 italic">
                Nenhuma verificação específica configurada para este equipamento.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Observações */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Adicione observações sobre o estado do equipamento..."
              value={observations}
              onChange={(e) => onUpdateObservations(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* Problemas Identificados */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Checkbox
                id="has_issues"
                checked={hasIssues}
                onCheckedChange={(checked) => onToggleIssue(!!checked)}
              />
              <div className="flex-1">
                <label 
                  htmlFor="has_issues"
                  className="text-sm font-medium cursor-pointer flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Foram identificados problemas neste equipamento
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  Marque esta opção se houver danos, problemas de funcionamento ou outras questões
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fotos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Fotos</CardTitle>
            <p className="text-sm text-gray-600">
              Adicione fotos do equipamento para documentar seu estado
            </p>
          </CardHeader>
          <CardContent>
            <PhotoCapture
              photos={photos}
              onAddPhoto={onAddPhoto}
              onRemovePhoto={onRemovePhoto}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="max-w-md mx-auto">
            <Button 
              onClick={handleSubmit} 
              className="w-full h-12"
              disabled={submitting || loading}
            >
              {submitting || loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                `Confirmar ${action === 'taking' ? 'Retirada' : 'Devolução'}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}