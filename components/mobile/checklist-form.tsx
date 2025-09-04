// components/mobile/checklist-form.tsx
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
import { PhotoInstructionSection } from './photo-instruction-section'
import { ConfirmationModal } from './confirmation-modal'
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
  onSubmit: (isEquipmentReady: boolean) => void
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
  const [showConfirmation, setShowConfirmation] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const checklistFields = equipment.checklist_campos || []

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
    // Deve ter exatamente 3 fotos (conforme orientações)
    if (photos.length < 3) {
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
      ? <Badge className="bg-blue-600 border-blue-600">Retirada</Badge>
      : <Badge className="bg-green-600 border-green-600">Devolução</Badge>
  }

  const handleFinalize = () => {
    setShowConfirmation(true)
  }

  const handleConfirmSubmit = (isEquipmentReady: boolean) => {
    setShowConfirmation(false)
    onSubmit(isEquipmentReady)
  }

  const getPhotoLabel = (index: number): string => {
    const labels = [
      'Número de Série',
      'Painel do Equipamento', 
      'Equipamento Completo'
    ]
    return labels[index] || `Foto ${index + 1}`
  }

  return (
    <>
      <div className="mobile-container">
        {/* Header fixo */}
        <div className="mobile-header bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600 flex-shrink-0" />
                <h1 className="font-semibold text-gray-900 truncate">
                  {equipment.nome}
                </h1>
                {getActionBadge()}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 truncate">
                  {employee.nome}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="mobile-content">
          <div className="p-4 space-y-4">
            {/* Instruções para fotos */}
            <PhotoInstructionSection />

            {/* Seção de fotos */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  Fotos do Equipamento
                  <Badge variant={photos.length >= 3 ? "default" : "secondary"}>
                    {photos.length}/3
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                {photos.length < 3 && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>Atenção:</strong> Você precisa tirar exatamente 3 fotos para continuar. 
                      Faltam {3 - photos.length} foto(s).
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full h-12 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {photos.length === 0 ? 'Tirar Primeira Foto' : `Tirar ${getPhotoLabel(photos.length)}`}
                </Button>

                {photos.length > 0 && (
                  <div className="space-y-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={getPhotoLabel(index)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {index + 1}
                            </Badge>
                            <span className="font-medium text-sm text-gray-900 truncate">
                              {getPhotoLabel(index)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {(photo.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemovePhoto(index)}
                          className="h-8 w-8 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campos do checklist */}
            {checklistFields.length > 0 && (
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Checklist de Verificação</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  {checklistFields.map((field, index) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={`field-${index}`} className="text-sm font-medium text-gray-700">
                        {field}
                      </Label>
                      <Input
                        id={`field-${index}`}
                        value={responses[field] || ''}
                        onChange={(e) => onUpdateResponse(field, e.target.value)}
                        placeholder={`Responda: ${field}`}
                        className="w-full"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

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
            onClick={handleFinalize}
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
                <Send className="w-4 w-4 mr-2" />
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
          onChange={handlePhotoCapture}
          className="hidden"
        />
      </div>

      {/* Modal de confirmação */}
      <ConfirmationModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={handleConfirmSubmit}
        employee={employee}
        equipment={equipment}
        action={action}
        loading={loading}
      />
    </>
  )
}