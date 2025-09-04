// components/admin/reports/photo-viewer.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ZoomIn, 
  ZoomOut,
  RotateCw,
  Loader2,
  AlertCircle
} from 'lucide-react'
import type { ChecklistPhoto } from '@/lib/types'

interface PhotoViewerProps {
  photos: ChecklistPhoto[]
  initialIndex: number
  checklistCode: string
  onClose: () => void
}

export function PhotoViewer({ photos, initialIndex, checklistCode, onClose }: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    loadCurrentImage()
  }, [currentIndex])

  const loadCurrentImage = async () => {
    try {
      setLoading(true)
      setError(false)
      setZoom(1)
      setRotation(0)

      const currentPhoto = photos[currentIndex]
      
      // Extrair folder e filename da URL da foto
      const url = new URL(currentPhoto.photo_url)
      const pathParts = url.pathname.split('/')
      const folder = pathParts[pathParts.length - 2]
      const filename = pathParts[pathParts.length - 1]

      const response = await fetch(`/api/photos/${folder}/${filename}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar imagem')
      }

      const blob = await response.blob()
      
      // Limpar URL anterior se existir
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
      
      const newImageUrl = URL.createObjectURL(blob)
      setImageUrl(newImageUrl)
    } catch (err) {
      console.error('Erro ao carregar imagem:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const resetTransform = () => {
    setZoom(1)
    setRotation(0)
  }

  const downloadImage = async () => {
    if (!imageUrl) return

    try {
      const currentPhoto = photos[currentIndex]
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${checklistCode}_foto_${currentIndex + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Erro ao baixar imagem:', err)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        goToPrevious()
        break
      case 'ArrowRight':
        e.preventDefault()
        goToNext()
        break
      case 'Escape':
        e.preventDefault()
        onClose()
        break
      case '+':
      case '=':
        e.preventDefault()
        handleZoomIn()
        break
      case '-':
        e.preventDefault()
        handleZoomOut()
        break
      case 'r':
      case 'R':
        e.preventDefault()
        handleRotate()
        break
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      // Limpar URL quando componente desmontar
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [currentIndex, imageUrl])

  const currentPhoto = photos[currentIndex]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 bg-black">
        {/* Header com controles */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-75 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {currentIndex + 1} de {photos.length}
              </span>
              <span className="text-xs text-gray-300">
                {new Date(currentPhoto.created_at).toLocaleString('pt-BR')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.1}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <span className="text-xs px-2">
                {Math.round(zoom * 100)}%
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 5}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRotate}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={resetTransform}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                Reset
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadImage}
                disabled={!imageUrl}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <Download className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Área da imagem */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <span className="text-white">Carregando imagem...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <span className="text-white">Erro ao carregar imagem</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadCurrentImage}
                className="text-black"
              >
                Tentar Novamente
              </Button>
            </div>
          )}

          {imageUrl && !loading && !error && (
            <img
              src={imageUrl}
              alt={`Foto ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
            />
          )}

          {/* Navegação */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="lg"
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 disabled:opacity-30"
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={goToNext}
                disabled={currentIndex === photos.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white hover:bg-opacity-20 disabled:opacity-30"
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnails na parte inferior */}
        {photos.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-4">
            <div className="flex justify-center gap-2 overflow-x-auto max-w-full">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                    index === currentIndex 
                      ? 'border-blue-500' 
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <PhotoThumbnailMini
                    photoUrl={photo.photo_url}
                    alt={`Thumb ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Componente para thumbnail pequeno no viewer
interface PhotoThumbnailMiniProps {
  photoUrl: string
  alt: string
}

function PhotoThumbnailMini({ photoUrl, alt }: PhotoThumbnailMiniProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadThumbnail()
    
    return () => {
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl)
      }
    }
  }, [photoUrl])

  const loadThumbnail = async () => {
    try {
      const url = new URL(photoUrl)
      const pathParts = url.pathname.split('/')
      const folder = pathParts[pathParts.length - 2]
      const filename = pathParts[pathParts.length - 1]

      const response = await fetch(`/api/photos/${folder}/${filename}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setThumbnailUrl(url)
      }
    } catch (err) {
      console.error('Erro ao carregar thumbnail mini:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!thumbnailUrl) {
    return (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
        <AlertCircle className="w-4 h-4 text-gray-400" />
      </div>
    )
  }

  return (
    <img
      src={thumbnailUrl}
      alt={alt}
      className="w-full h-full object-cover"
    />
  )
}