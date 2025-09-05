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
      
      // ✅ MUDANÇA PRINCIPAL: Usar URL direta da API externa com token
      const response = await fetch('/api/upload/fetch-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: currentPhoto.photo_url
        })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao carregar imagem')
      }

      const blob = await response.blob()
      
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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25))
  }

  const handleRotate = () => {
    setRotation(prev => prev + 90)
  }

  const handleDownload = async () => {
    if (!imageUrl) return

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${checklistCode}_foto_${currentIndex + 1}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao baixar imagem:', err)
    }
  }

  const handleClose = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
    }
    onClose()
  }

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold">
              Foto {currentIndex + 1} de {photos.length}
            </h3>
            <span className="text-sm text-gray-500">{checklistCode}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-mono w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 relative bg-gray-900 overflow-hidden" style={{ height: 'calc(95vh - 120px)' }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Carregando imagem...</p>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-400" />
                <p>Erro ao carregar imagem</p>
              </div>
            </div>
          ) : imageUrl ? (
            <div className="absolute inset-0 flex items-center justify-center overflow-auto">
              <img
                src={imageUrl}
                alt={`Foto ${currentIndex + 1}`}
                className="max-w-none"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-in-out'
                }}
              />
            </div>
          ) : null}

          {/* Navigation arrows */}
          {photos.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={handleNext}
                disabled={currentIndex === photos.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2 overflow-x-auto pb-2">
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