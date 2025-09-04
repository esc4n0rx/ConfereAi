// components/admin/reports/checklist-reports.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
 History,
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
 X,
 Search
} from "lucide-react"
import { PhotoViewer } from "./photo-viewer"
import type { ChecklistData } from "@/lib/types"

export function ChecklistReports() {
 const [checklists, setChecklists] = useState<ChecklistData[]>([])
 const [filteredChecklists, setFilteredChecklists] = useState<ChecklistData[]>([])
 const [selectedChecklist, setSelectedChecklist] = useState<ChecklistData | null>(null)
 const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState("")
 const [searchTerm, setSearchTerm] = useState("")
 const [actionFilter, setActionFilter] = useState("all")
 const [statusFilter, setStatusFilter] = useState("all")

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
           <p>Carregando histórico completo...</p>
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
           Histórico Completo de Atividades ({filteredChecklists.length})
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
           
           <Select value={actionFilter} onValueChange={setActionFilter}>
             <SelectTrigger className="w-full sm:w-40">
               <SelectValue placeholder="Ação" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Todas as ações</SelectItem>
               <SelectItem value="taking">Retiradas</SelectItem>
               <SelectItem value="returning">Devoluções</SelectItem>
             </SelectContent>
           </Select>

           <Select value={statusFilter} onValueChange={setStatusFilter}>
             <SelectTrigger className="w-full sm:w-40">
               <SelectValue placeholder="Status" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">Todos os status</SelectItem>
               <SelectItem value="normal">Normal</SelectItem>
               <SelectItem value="with_issues">Com Problemas</SelectItem>
             </SelectContent>
           </Select>
         </div>

         {/* Tabela */}
         <div className="rounded-md border overflow-hidden">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead className="w-32">Código</TableHead>
                 <TableHead>Funcionário</TableHead>
                 <TableHead>Equipamento</TableHead>
                 <TableHead className="w-24">Ação</TableHead>
                 <TableHead className="w-32">Status</TableHead>
                 <TableHead className="w-16">Fotos</TableHead>
                 <TableHead className="w-40">Data/Hora</TableHead>
                 <TableHead className="w-20">Ações</TableHead>
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

         {filteredChecklists.length > 0 && (
           <div className="mt-4 text-sm text-muted-foreground">
             Mostrando {filteredChecklists.length} de {checklists.length} registro(s)
           </div>
         )}
       </CardContent>
     </Card>

     {/* Dialog para visualizar detalhes */}
     <Dialog open={!!selectedChecklist} onOpenChange={() => setSelectedChecklist(null)}>
       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <Package className="h-5 w-5" />
             Detalhes do Checklist - {selectedChecklist?.codigo}
           </DialogTitle>
         </DialogHeader>
         
         {selectedChecklist && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                 <div>
                   <label className="text-sm font-medium text-gray-500">Funcionário</label>
                   <div className="flex items-center gap-2 mt-1">
                     <User className="w-4 h-4 text-gray-400" />
                     <div>
                       <p className="font-medium">{selectedChecklist.employee.nome}</p>
                       <p className="text-sm text-gray-600">{selectedChecklist.employee.cargo}</p>
                     </div>
                   </div>
                 </div>
                 
                 <div>
                   <label className="text-sm font-medium text-gray-500">Data/Hora</label>
                   <div className="flex items-center gap-2 mt-1">
                     <Calendar className="w-4 h-4 text-gray-400" />
                     <span className="text-sm">{formatDate(selectedChecklist.device_timestamp)}</span>
                   </div>
                 </div>
               </div>

               <div className="space-y-4">
                 <div>
                   <label className="text-sm font-medium text-gray-500">Equipamento</label>
                   <div className="flex items-center gap-2 mt-1">
                     <Package className="w-4 h-4 text-gray-400" />
                     <div>
                       <p className="font-medium">{selectedChecklist.equipment.nome}</p>
                       <p className="text-sm text-gray-600">{selectedChecklist.equipment.codigo}</p>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-sm font-medium text-gray-500">Ação</label>
                 <div>{getActionBadge(selectedChecklist.action)}</div>
               </div>
               <div>
                 <label className="text-sm font-medium text-gray-500">Status</label>
                 <div>{getStatusBadge(selectedChecklist.has_issues)}</div>
               </div>
             </div>

             {selectedChecklist.checklist_responses && (
               <div>
                 <label className="text-sm font-medium text-gray-500 mb-2 block">Respostas do Checklist</label>
                 <div className="bg-gray-50 p-3 rounded-lg">
                   <pre className="text-sm whitespace-pre-wrap">
                     {JSON.stringify(selectedChecklist.checklist_responses, null, 2)}
                   </pre>
                 </div>
               </div>
             )}

             {selectedChecklist.observations && (
               <div>
                 <label className="text-sm font-medium text-gray-500 mb-2 block">Observações</label>
                 <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedChecklist.observations}</p>
               </div>
             )}

             {selectedChecklist.photos && selectedChecklist.photos.length > 0 && (
               <div>
                 <label className="text-sm font-medium text-gray-500 mb-2 block">
                   Fotos ({selectedChecklist.photos.length})
                 </label>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                   {selectedChecklist.photos.slice(0, 6).map((photo, index) => (
                     <PhotoThumbnail
                       key={photo.id}
                       photo={photo}
                       checklistCode={selectedChecklist.codigo}
                       index={index}
                       onClick={() => openPhotoViewer(index)}
                     />
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

// Componente para thumbnail das fotos
interface PhotoThumbnailProps {
 photo: any
 checklistCode: string
 index: number
 onClick: () => void
}

function PhotoThumbnail({ photo, checklistCode, index, onClick }: PhotoThumbnailProps) {
 const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(false)

 useEffect(() => {
   loadThumbnail()
   
   return () => {
     if (thumbnailUrl) {
       URL.revokeObjectURL(thumbnailUrl)
     }
   }
 }, [photo.photo_url])

 const loadThumbnail = async () => {
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
     setThumbnailUrl(imageUrl)
   } catch (err) {
     console.error('Erro ao carregar thumbnail:', err)
     setError(true)
   } finally {
     setLoading(false)
   }
 }

 if (loading) {
   return (
     <div className="aspect-square bg-gray-100 rounded border flex items-center justify-center">
       <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
     </div>
   )
 }

 if (error || !thumbnailUrl) {
   return (
     <div className="aspect-square bg-gray-100 rounded border flex items-center justify-center">
       <AlertTriangle className="w-4 h-4 text-gray-400" />
     </div>
   )
 }

 return (
   <div
     className="aspect-square bg-gray-100 rounded border cursor-pointer hover:border-blue-500 transition-colors overflow-hidden"
     onClick={onClick}
   >
     <img
       src={thumbnailUrl}
       alt={`Foto ${index + 1}`}
       className="w-full h-full object-cover"
       loading="lazy"
     />
   </div>
 )
}