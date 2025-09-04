// components/admin/reports/checklist-reports.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ClipboardList, 
  Eye, 
  Calendar, 
  User, 
  Package, 
  AlertTriangle,
  CheckCircle,
  ImageIcon,
  Loader2,
  ZoomIn,
  Download,
  X
} from "lucide-react"
import { PhotoViewer } from "./photo-viewer"
import type { ChecklistData } from "@/lib/types"

export function ChecklistReports() {
  const [checklists, setChecklists] = useState<ChecklistData[]>([])
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistData | null>(null)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadChecklists()
  }, [])

  const loadChecklists = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch('/api/checklist')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar checklists')
      }

      setChecklists(result.checklists || [])
    } catch (err: any) {
      console.error('Erro ao carregar checklists:', err)
      setError(err.message || 'Erro ao carregar checklists')
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: 'taking' | 'returning') => {
    if (action === 'taking') {
      return <Badge className="bg-blue-600">Retirada</Badge>
    }
    return <Badge className="bg-green-600">Devolução</Badge>
  }

  const getStatusBadge = (hasIssues: boolean) => {
    if (hasIssues) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          Com Problemas
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="gap-1 bg-green-600">
        <CheckCircle className="w-3 h-3" />
        Normal
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const viewChecklist = (checklist: ChecklistData) => {
    setSelectedChecklist(checklist)
  }

  const openPhotoViewer = (photoIndex: number) => {
    setSelectedPhotoIndex(photoIndex)
  }

  const closePhotoViewer = () => {
    setSelectedPhotoIndex(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Carregando checklists...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Checklists Realizados ({checklists.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fotos</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checklists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum checklist realizado ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  checklists.map((checklist) => (
                    <TableRow key={checklist.id}>
                      <TableCell className="font-mono text-xs">
                        {checklist.codigo}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{checklist.employee.nome}</div>
                          <div className="text-xs text-gray-500">{checklist.employee.cargo}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{checklist.equipment.nome}</div>
                          <div className="text-xs text-gray-500">{checklist.equipment.codigo}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(checklist.action)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(checklist.has_issues)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{checklist.photos?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDate(checklist.device_timestamp)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewChecklist(checklist)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para visualizar detalhes do checklist */}
      <Dialog open={!!selectedChecklist} onOpenChange={() => setSelectedChecklist(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Detalhes do Checklist - {selectedChecklist?.codigo}
            </DialogTitle>
          </DialogHeader>
          
          {selectedChecklist && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Funcionário
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="font-medium">{selectedChecklist.employee.nome}</p>
                      <p className="text-sm text-gray-600">{selectedChecklist.employee.cargo}</p>
                      <p className="text-xs text-gray-500">
                        Mat.: {selectedChecklist.employee.matricula}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Equipamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="font-medium">{selectedChecklist.equipment.nome}</p>
                      <p className="text-sm text-gray-600">{selectedChecklist.equipment.descricao}</p>
                      <p className="text-xs text-gray-500">
                        Cód.: {selectedChecklist.equipment.codigo}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ação e Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Ação</p>
                    {getActionBadge(selectedChecklist.action)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    {getStatusBadge(selectedChecklist.has_issues)}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Data/Hora</p>
                  <p className="text-sm font-mono">
                    {formatDate(selectedChecklist.device_timestamp)}
                  </p>
                </div>
              </div>

              {/* Respostas do Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Verificações Realizadas</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(selectedChecklist.checklist_responses).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(selectedChecklist.checklist_responses).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm">{key}</span>
                          <Badge variant={value ? "default" : "destructive"}>
                            {value ? "✓ OK" : "✗ Problema"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 italic">
                      Nenhuma verificação específica foi configurada.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Observações */}
              {selectedChecklist.observations && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedChecklist.observations}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Fotos */}
              {selectedChecklist.photos && selectedChecklist.photos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Fotos ({selectedChecklist.photos.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {selectedChecklist.photos.map((photo, index) => (
                        <PhotoThumbnail
                          key={photo.id}
                          photo={photo}
                          index={index}
                          checklistCode={selectedChecklist.codigo}
                          onClick={() => openPhotoViewer(index)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Viewer */}
      {selectedChecklist && selectedPhotoIndex !== null && (
        <PhotoViewer
          photos={selectedChecklist.photos}
          initialIndex={selectedPhotoIndex}
          checklistCode={selectedChecklist.codigo}
          onClose={closePhotoViewer}
        />
      )}
    </>
  )
}

// Componente para thumbnail das fotos
interface PhotoThumbnailProps {
  photo: { id: string; photo_url: string; photo_type: string; created_at: string }
  index: number
  checklistCode: string
  onClick: () => void
}

function PhotoThumbnail({ photo, index, checklistCode, onClick }: PhotoThumbnailProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    loadImage()
  }, [photo.photo_url])

  const loadImage = async () => {
    try {
      setLoading(true)
      setError(false)

      // Extrair folder e filename da URL da foto
      const url = new URL(photo.photo_url)
      const pathParts = url.pathname.split('/')
      const folder = pathParts[pathParts.length - 2]
      const filename = pathParts[pathParts.length - 1]

      const response = await fetch(`/api/photos/${folder}/${filename}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar imagem')
      }

      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      setImageUrl(imageUrl)
    } catch (err) {
      console.error('Erro ao carregar thumbnail:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="relative aspect-square bg-gray-100 rounded-lg border flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !imageUrl) {
    return (
      <div className="relative aspect-square bg-gray-100 rounded-lg border flex items-center justify-center cursor-pointer hover:bg-gray-200">
        <div className="text-center">
          <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500">Erro ao carregar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-square group cursor-pointer" onClick={onClick}>
      <img
        src={imageUrl}
        alt={`Foto ${index + 1}`}
        className="w-full h-full object-cover rounded-lg border hover:border-blue-500 transition-colors"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
        {index + 1}
      </div>
    </div>
  )
}