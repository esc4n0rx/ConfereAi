// components/admin/reports/history-table.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  History, 
  Search, 
  Calendar, 
  User, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Eye,
  ImageIcon
} from "lucide-react"
import { PhotoViewer } from "./photo-viewer"
import type { ChecklistData } from "@/lib/types"

export function HistoryTable() {
  const [checklists, setChecklists] = useState<ChecklistData[]>([])
  const [filteredChecklists, setFilteredChecklists] = useState<ChecklistData[]>([])
  const [selectedChecklist, setSelectedChecklist] = useState<ChecklistData | null>(null)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<'all' | 'taking' | 'returning'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'with_issues' | 'normal'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadChecklists()
  }, [])

  useEffect(() => {
    filterChecklists()
  }, [checklists, searchTerm, actionFilter, statusFilter])

  const loadChecklists = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch('/api/checklist')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar histórico')
      }

      setChecklists(result.checklists || [])
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err)
      setError(err.message || 'Erro ao carregar histórico')
    } finally {
      setLoading(false)
    }
  }

  const filterChecklists = () => {
    let filtered = checklists

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(checklist => 
        checklist.employee.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        checklist.equipment.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        checklist.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por ação
    if (actionFilter !== 'all') {
      filtered = filtered.filter(checklist => checklist.action === actionFilter)
    }

    // Filtro por status
    if (statusFilter === 'with_issues') {
      filtered = filtered.filter(checklist => checklist.has_issues)
    } else if (statusFilter === 'normal') {
      filtered = filtered.filter(checklist => !checklist.has_issues)
    }

    setFilteredChecklists(filtered)
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

  const viewDetails = (checklist: ChecklistData) => {
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
            <p>Carregando histórico...</p>
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
            <History className="h-5 w-5" />
            Histórico de Atividades ({filteredChecklists.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por funcionário, equipamento ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as any)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todas as ações</option>
              <option value="taking">Retiradas</option>
              <option value="returning">Devoluções</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os status</option>
              <option value="normal">Normal</option>
              <option value="with_issues">Com problemas</option>
            </select>
          </div>

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
                {filteredChecklists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {checklists.length === 0 
                        ? "Nenhuma atividade registrada ainda."
                        : "Nenhuma atividade encontrada com os filtros aplicados."
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredChecklists.map((checklist) => (
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
                          onClick={() => viewDetails(checklist)}
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

          {filteredChecklists.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {filteredChecklists.length} de {checklists.length} registro(s)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para visualizar detalhes */}
      <Dialog open={!!selectedChecklist} onOpenChange={() => setSelectedChecklist(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Detalhes da Atividade - {selectedChecklist?.codigo}
            </DialogTitle>
          </DialogHeader>
          
          {selectedChecklist && (
            <div className="space-y-4">
              {/* Informações básicas resumidas */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Funcionário</p>
                  <p className="font-medium">{selectedChecklist.employee.nome}</p>
                  <p className="text-xs text-gray-500">{selectedChecklist.employee.cargo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Equipamento</p>
                  <p className="font-medium">{selectedChecklist.equipment.nome}</p>
                  <p className="text-xs text-gray-500">{selectedChecklist.equipment.codigo}</p>
                </div>
              </div>

              {/* Status e Data */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getActionBadge(selectedChecklist.action)}
                  {getStatusBadge(selectedChecklist.has_issues)}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Data/Hora</p>
                  <p className="text-sm font-mono">
                    {formatDate(selectedChecklist.device_timestamp)}
                  </p>
                </div>
              </div>

              {/* Observações se houver */}
              {selectedChecklist.observations && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Observações</p>
                  <p className="text-sm text-blue-700">
                    {selectedChecklist.observations}
                  </p>
                </div>
              )}

              {/* Fotos */}
              {selectedChecklist.photos && selectedChecklist.photos.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Fotos ({selectedChecklist.photos.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedChecklist.photos.slice(0, 6).map((photo, index) => (
                      <div
                        key={photo.id}
                        className="aspect-square bg-gray-100 rounded border cursor-pointer hover:border-blue-500 transition-colors"
                        onClick={() => openPhotoViewer(index)}
                      >
                        <img
                          src={`/api/photos/${selectedChecklist.codigo.replace('CHK_', 'confereai_CHK_')}/${photo.photo_url.split('/').pop()}`}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                  {selectedChecklist.photos.length > 6 && (
                    <p className="text-xs text-gray-600 mt-1">
                      +{selectedChecklist.photos.length - 6} fotos adicionais
                    </p>
                  )}
                </div>
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