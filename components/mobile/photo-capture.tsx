// components/mobile/photo-capture.tsx
"use client"

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, X } from 'lucide-react'

interface PhotoCaptureProps {
  photos: File[]
  onAddPhoto: (photo: File) => void
  onRemovePhoto: (index: number) => void
}

export function PhotoCapture({ photos, onAddPhoto, onRemovePhoto }: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  // Atualizar previews quando as fotos mudarem
  useEffect(() => {
    // Limpar URLs anteriores
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    
    // Criar novas URLs de preview
    const newPreviewUrls = photos.map(photo => URL.createObjectURL(photo))
    setPreviewUrls(newPreviewUrls)

    // Cleanup on unmount
    return () => {
      newPreviewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [photos])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem')
      return
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB')
      return
    }

    // Validar limite de fotos
    if (photos.length >= 5) {
      alert('Máximo de 5 fotos permitidas')
      return
    }

    onAddPhoto(file)

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = (index: number) => {
    onRemovePhoto(index)
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-16 border-dashed border-2"
          disabled={photos.length >= 5}
        >
          <div className="flex flex-col items-center gap-2">
            <Camera className="w-6 h-6" />
            <span className="text-sm">
              {photos.length >= 5 ? 'Limite de fotos atingido' : 'Adicionar Foto'}
            </span>
          </div>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {previewUrls.map((url, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-2">
                <img
                  src={url}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                  onClick={() => handleRemovePhoto(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600 text-center">
        {photos.length}/5 fotos adicionadas
      </p>
    </div>
  )
}