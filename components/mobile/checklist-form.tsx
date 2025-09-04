"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { 
  Camera, 
  Package, 
  User, 
  ArrowLeft, 
  Send, 
  X, 
  AlertTriangle,
  CheckCircle,
  Plus,
  FileImage
} from 'lucide-react'
import { PhotoGuidanceModal } from './photo-guidance-modal'
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
  onToggleIssue: (hasIssue: boolean) => void
  onSubmit: () => void
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
  const [showPhotoGuidance, setShowPhotoGuidance] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const checklistFields = equipment.checklist_campos || []

  const handlePhotoClick = () => {
    setShowPhotoGuidance(true)
  }

  const handleProceedWithPhotos = () => {
    setShowPhotoGuidance(false)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        onAddPhoto(file)
      })
    }
    // Reset input para permitir selecionar o mesmo arquivo novamente
    e.target.value = ''
  }

  const canSubmit = () => {
    // Deve ter pelo menos uma foto
    if (photos.length === 0) {
      return false
    }
    
    // Todos os campos do checklist devem estar preenchidos
    for (const field of checklistFields) {
      if (!responses[field] || responses[field] === '') {
        return false
      }
    }
    
    return true
  }

  const getActionBadge = () => {
    return action === 'taking' 
      ? <Badge className="bg-blue-600 text-white mobile-badge">Retirada</Badge>
      : <Badge className="bg-green-600 text-white mobile-badge">Devolução</Badge>
  }

  const getProgress = () => {
    let completed = 0
    let total = checklistFields.length + 1 // +1 para fotos

    // Contar campos preenchidos
    checklistFields.forEach(field => {
      if (responses[field] && responses[field] !== '') {
        completed++
      }
    })

    // Contar fotos
    if (photos.length > 0) {
      completed++
    }

    return { completed, total, percentage: Math.round((completed / total) * 100) }
  }

  const progress = getProgress()

  return (
    <>
      <div className="mobile-container bg-gray-50">
        {/* Header fixo com progresso */}
        <div className="mobile-header bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-4 mb-3">
            <Button variant="outline" size="icon" onClick={onBack} className="h-10 w-10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">Checklist do Equipamento</h1>
              <p className="text-sm text-gray-600">Preencha todas as informações</p>
            </div>
            {getActionBadge()}
          </div>

          {/* Barra de progresso */}
          <div className="bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 text-center">
            {progress.completed}/{progress.total} itens concluídos ({progress.percentage}%)
          </p>
        </div>

        {/* Conteúdo scrollável */}
        <div className="mobile-content custom-scrollbar">
          <div className="p-4 space-y-4">
            {/* Informações principais */}
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">{employee.nome}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900">{equipment.nome}</span>
                      {equipment.codigo && (
                        <span className="text-xs text-gray-500 ml-2">({equipment.codigo})</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campos do Checklist */}
            {checklistFields.length > 0 && (
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Itens de Verificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="checklist-compact space-y-4">
                    {checklistFields.map((field, index) => (
                      <div key={index} className="space-y-2">
                        <Label htmlFor={`field-${index}`} className="text-sm font-medium text-gray-700">
                          {field}
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={responses[field] === 'ok' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onUpdateResponse(field, 'ok')}
                            className="h-11 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            OK
                          </Button>
                          <Button
                            variant={responses[field] === 'problema' ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => onUpdateResponse(field, 'problema')}
                            className="h-11 text-sm"
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Problema
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fotos */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Fotos do Equipamento
                  <Badge variant="destructive" className="text-xs mobile-badge">Obrigatório</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                {photos.length === 0 && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      É obrigatório tirar pelo menos uma foto do equipamento e do número de série.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handlePhotoClick}
                  variant="outline"
                  className="w-full h-12 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {photos.length === 0 ? 'Adicionar Primeira Foto' : 'Adicionar Mais Fotos'}
                </Button>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full shadow-md"
                          onClick={() => onRemovePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    📸 <strong>Fotografe:</strong> número de série, estado geral do equipamento e possíveis danos
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Textarea
                  placeholder="Descreva qualquer observação adicional sobre o equipamento..."
                  value={observations}
                  onChange={(e) => onUpdateObservations(e.target.value)}
                  className="min-h-20 resize-none"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Toggle de problemas */}
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="has-issues" className="text-sm font-medium text-gray-700">
                      Este equipamento tem problemas?
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Marque se identificou algum problema no equipamento
                    </p>
                  </div>
                  <Switch
                    id="has-issues"
                    checked={hasIssues}
                    onCheckedChange={onToggleIssue}
                    className="ml-4"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Espaço para o botão fixo */}
            <div className="h-20" />
          </div>
        </div>

        {/* Footer fixo com botão de envio */}
        <div className="mobile-footer bg-white border-t border-gray-200 p-4">
          <Button
            onClick={onSubmit}
            disabled={!canSubmit() || loading}
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200"
          >
            {loading ? (
              <>
                <Send className="w-4 h-4 mr-2 animate-pulse" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Finalizar Checklist
              </>
            )}
          </Button>
        </div>

        {/* Input escondido para captura de fotos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handlePhotoCapture}
          className="hidden"
        />
      </div>

      {/* Modal de orientações para fotos */}
      <PhotoGuidanceModal
        open={showPhotoGuidance}
        onClose={() => setShowPhotoGuidance(false)}
        onProceed={handleProceedWithPhotos}
        action={action}
      />
    </>
  )
}