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
      ? <Badge className="bg-blue-600">Retirada</Badge>
      : <Badge className="bg-green-600">Devolução</Badge>
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Checklist do Equipamento</h1>
              <p className="text-sm text-gray-600">Preencha todas as informações</p>
            </div>
          </div>
        </div>

        {/* Informações */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">{employee.nome}</span>
                </div>
                {getActionBadge()}
              </div>
              
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-600" />
                <div>
                  <span className="text-sm font-medium">{equipment.nome}</span>
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Itens de Verificação</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {checklistFields.map((field, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`field-${index}`} className="text-sm font-medium">
                    {field}
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant={responses[field] === 'ok' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onUpdateResponse(field, 'ok')}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      OK
                    </Button>
                    <Button
                      variant={responses[field] === 'problema' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => onUpdateResponse(field, 'problema')}
                      className="flex-1"
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Problema
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Fotos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-5 w-5" />
              Fotos do Equipamento
              <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {photos.length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  É obrigatório tirar pelo menos uma foto do equipamento e do número de série.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handlePhotoClick}
              variant="outline"
              className="w-full h-12"
            >
              <Plus className="h-4 w-4 mr-2" />
              {photos.length === 0 ? 'Adicionar Primeira Foto' : 'Adicionar Mais Fotos'}
            </Button>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => onRemovePhoto(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500">
              📸 Fotografe: número de série, estado geral do equipamento e possíveis danos
            </p>
          </CardContent>
        </Card>

        {/* Observações */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Observações</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Textarea
              placeholder="Descreva qualquer observação adicional sobre o equipamento..."
              value={observations}
              onChange={(e) => onUpdateObservations(e.target.value)}
              className="min-h-20"
            />
          </CardContent>
        </Card>

        {/* Toggle de problemas */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="has-issues" className="text-sm font-medium">
                  Este equipamento tem problemas?
                </Label>
                <p className="text-xs text-gray-500">
                  Marque se identificou algum problema no equipamento
                </p>
              </div>
              <Switch
                id="has-issues"
                checked={hasIssues}
                onCheckedChange={onToggleIssue}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botão de envio */}
        <Button
          onClick={onSubmit}
          disabled={!canSubmit() || loading}
          className="w-full h-12 text-lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Enviando...
            </div>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Finalizar {action === 'taking' ? 'Retirada' : 'Devolução'}
            </>
          )}
        </Button>

        {!canSubmit() && !loading && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              {photos.length === 0 
                ? 'Adicione pelo menos uma foto para continuar'
                : 'Preencha todos os campos de verificação para continuar'
              }
            </p>
          </div>
        )}

        {/* Input oculto para fotos */}
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

      {/* Modal de orientação */}
      <PhotoGuidanceModal
        open={showPhotoGuidance}
        onOpenChange={setShowPhotoGuidance}
        onProceed={handleProceedWithPhotos}
        equipmentName={equipment.nome}
        action={action}
      />
    </>
  )
}