// components/mobile/checklist-form.tsx
"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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

  // CORREÇÃO: Melhorar handling de fotos no mobile
  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    console.log(`Processando ${files.length} foto(s)...`)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        console.error(`Arquivo ${file.name} não é uma imagem`)
        continue
      }

      // Validar tamanho (máximo 10MB para mobile)
      if (file.size > 10 * 1024 * 1024) {
        console.error(`Arquivo ${file.name} muito grande (${file.size} bytes)`)
        continue
      }

      // Verificar se não excedeu o limite de fotos
      if (photos.length >= 3) {
        console.warn('Limite de 3 fotos atingido')
        break
      }

      console.log(`Adicionando foto: ${file.name} (${file.size} bytes)`)
      onAddPhoto(file)
    }

    // Reset input para permitir selecionar o mesmo arquivo novamente
    e.target.value = ''
  }

  const triggerPhotoCapture = () => {
    if (photos.length >= 3) {
      return // Não permitir mais fotos
    }
    
    fileInputRef.current?.click()
  }

  // CORREÇÃO: Validação mais rigorosa
  const canSubmit = () => {
    // Deve ter exatamente 3 fotos
    if (photos.length !== 3) {
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

  const handleFinalize = () => {
    if (!canSubmit()) {
      return
    }
    setShowConfirmation(true)
  }

  const handleConfirmSubmit = (isEquipmentReady: boolean) => {
    setShowConfirmation(false)
    onSubmit(isEquipmentReady)
  }

  const getActionBadge = () => {
    return action === 'taking' 
      ? <Badge className="bg-blue-600 text-white">Retirada</Badge>
      : <Badge className="bg-green-600 text-white">Devolução</Badge>
  }

  const getSubmitButtonText = () => {
    const missing = 3 - photos.length
    if (missing > 0) {
      return `Faltam ${missing} foto(s)`
    }
    
    const missingFields = checklistFields.filter(field => !responses[field] || responses[field] === '')
    if (missingFields.length > 0) {
      return `Faltam ${missingFields.length} campo(s)`
    }
    
    return 'Finalizar Checklist'
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header fixo */}
        <div className="mobile-header bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-semibold">Checklist</h1>
                {getActionBadge()}
              </div>
              <p className="text-sm text-gray-600">
                {employee.nome} • {equipment.nome}
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="mobile-content flex-1 p-4 space-y-4">
          <div className="space-y-4">
            {/* Informações do equipamento */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Informações do Equipamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome:</span>
                  <span className="font-medium">{equipment.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Código:</span>
                  <span className="font-mono">{equipment.codigo}</span>
                </div>
                {equipment.descricao && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Descrição:</span>
                    <span className="font-medium">{equipment.descricao}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instruções de fotos */}
            <PhotoInstructionSection />

            {/* Seção de fotos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Fotos do Equipamento
                  <Badge variant={photos.length === 3 ? "default" : "secondary"} className="ml-auto">
                    {photos.length}/3
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Grid de fotos */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                          onClick={() => onRemovePhoto(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          Foto {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botão para adicionar fotos */}
                {photos.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerPhotoCapture}
                    className="w-full h-20 border-dashed border-2 flex flex-col items-center gap-2"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-sm">
                      {photos.length === 0 ? 'Tirar Primeira Foto' : `Tirar Foto ${photos.length + 1}`}
                    </span>
                  </Button>
                )}

                {photos.length === 3 && (
                  <Alert>
                    <CheckCircle className="w-4 h-4" />
                    <AlertDescription>
                      Todas as 3 fotos foram capturadas com sucesso!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Checklist */}
            {checklistFields.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Checklist de Verificação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {checklistFields.map((field, index) => (
                    <div key={index} className="space-y-2">
                      <Label className="text-sm font-medium">{field}</Label>
                      <RadioGroup
                        value={responses[field] || ''}
                        onValueChange={(value) => onUpdateResponse(field, value)}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ok" id={`${field}-ok`} />
                          <Label htmlFor={`${field}-ok`} className="text-sm">✓ OK</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="problema" id={`${field}-problema`} />
                          <Label htmlFor={`${field}-problema`} className="text-sm">⚠ Problema</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Digite suas observações sobre o equipamento (opcional)"
                  value={observations}
                  onChange={(e) => onUpdateObservations(e.target.value)}
                  className="min-h-[80px] text-base"
                />
              </CardContent>
            </Card>

            {/* Switch de problemas */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="has-issues" className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Equipamento com problemas
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
                <Send className="w-4 h-4 mr-2" />
                {getSubmitButtonText()}
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
          multiple={false}
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