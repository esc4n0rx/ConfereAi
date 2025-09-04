"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Package, Loader2, AlertCircle, ArrowLeft, Search } from 'lucide-react'
import type { DatabaseEmployee, DatabaseEquipment } from '@/lib/types'

interface EquipmentSelectionProps {
 employee: DatabaseEmployee
 action: 'taking' | 'returning'
 onEquipmentSelect: (equipment: DatabaseEquipment) => void
 onBack: () => void
}

export function EquipmentSelection({ 
 employee, 
 action, 
 onEquipmentSelect, 
 onBack 
}: EquipmentSelectionProps) {
 const [equipments, setEquipments] = useState<DatabaseEquipment[]>([])
 const [filteredEquipments, setFilteredEquipments] = useState<DatabaseEquipment[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState<string | null>(null)
 const [searchTerm, setSearchTerm] = useState('')

 useEffect(() => {
   loadEquipments()
 }, [action, employee.id])

 useEffect(() => {
   // Filtrar equipamentos baseado no termo de busca
   if (searchTerm.trim() === '') {
     setFilteredEquipments(equipments)
   } else {
     const filtered = equipments.filter(equipment =>
       equipment.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (equipment.codigo && equipment.codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (equipment.descricao && equipment.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
     )
     setFilteredEquipments(filtered)
   }
 }, [equipments, searchTerm])

 const loadEquipments = async () => {
   try {
     setLoading(true)
     setError(null)

     const response = await fetch(
       `/api/checklist/equipments?action=${action}&employee_id=${employee.id}`
     )
     const result = await response.json()

     if (!response.ok) {
       throw new Error(result.error || 'Erro ao carregar equipamentos')
     }

     setEquipments(result.equipments || [])
   } catch (err: any) {
     setError(err.message)
   } finally {
     setLoading(false)
   }
 }

 const getActionTitle = () => {
   return action === 'taking' 
     ? 'Escolher Equipamento para Retirar'
     : 'Escolher Equipamento para Devolver'
 }

 const getActionBadge = () => {
   return action === 'taking' 
     ? <Badge className="bg-blue-600 text-white">Retirada</Badge>
     : <Badge className="bg-green-600 text-white">Devolução</Badge>
 }

 const getEmptyMessage = () => {
   if (searchTerm.trim() !== '') {
     return {
       title: 'Nenhum equipamento encontrado',
       description: 'Tente buscar com um termo diferente.'
     }
   }
   
   return action === 'taking'
     ? {
         title: 'Nenhum equipamento disponível',
         description: 'Todos os equipamentos estão sendo utilizados no momento.'
       }
     : {
         title: 'Nenhum equipamento em uso',
         description: 'Você não possui equipamentos para devolver.'
       }
 }

 const getStatusBadge = (equipment: DatabaseEquipment) => {
   switch (equipment.status) {
     case 'disponivel':
       return <Badge variant="default" className="bg-green-500">Disponível</Badge>
     case 'em_uso':
       return <Badge variant="secondary">Em Uso</Badge>
     case 'manutencao':
       return <Badge variant="destructive">Manutenção</Badge>
     case 'quebrado':
       return <Badge variant="destructive">Quebrado</Badge>
     default:
       return <Badge variant="outline">Desconhecido</Badge>
   }
 }

 if (loading) {
   return (
     <div className="mobile-container bg-gradient-to-br from-blue-50 to-purple-50">
       <div className="mobile-content flex items-center justify-center">
         <div className="mobile-loading">
           <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
           <p className="text-lg font-medium text-gray-700">Carregando equipamentos...</p>
         </div>
       </div>
     </div>
   )
 }

 if (error) {
   return (
     <div className="mobile-container bg-gradient-to-br from-red-50 to-pink-50">
       <div className="mobile-content flex items-center justify-center p-4">
         <div className="mobile-error">
           <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
           <h1 className="text-xl font-bold text-red-900 mb-2">Erro</h1>
           <p className="text-red-700 text-center mb-4">{error}</p>
           <Button onClick={loadEquipments} variant="outline" className="min-h-12">
             Tentar Novamente
           </Button>
         </div>
       </div>
     </div>
   )
 }

 return (
   <div className="mobile-container bg-gray-50">
     {/* Header fixo */}
     <div className="mobile-header bg-white border-b border-gray-200 p-4">
       <div className="flex items-center gap-4 mb-4">
         <Button variant="outline" size="icon" onClick={onBack} className="h-10 w-10">
           <ArrowLeft className="h-4 w-4" />
         </Button>
         <div className="flex-1">
           <h1 className="text-lg font-bold text-gray-900">{getActionTitle()}</h1>
           <div className="flex items-center gap-2 mt-1">
             <span className="text-sm text-gray-600">{employee.nome}</span>
             {getActionBadge()}
           </div>
         </div>
       </div>

       {/* Barra de busca */}
       <div className="relative">
         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
         <Input
           type="text"
           placeholder="Buscar equipamento..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="pl-10 h-11 bg-gray-50 border-gray-200"
         />
       </div>
     </div>

     {/* Conteúdo scrollável */}
     <div className="mobile-content custom-scrollbar p-4">
       {filteredEquipments.length === 0 ? (
         <div className="flex items-center justify-center min-h-[300px]">
           <div className="text-center max-w-sm">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Package className="h-8 w-8 text-gray-400" />
             </div>
             <h3 className="text-lg font-semibold text-gray-900 mb-2">
               {getEmptyMessage().title}
             </h3>
             <p className="text-gray-600 text-sm">
               {getEmptyMessage().description}
             </p>
             {searchTerm && (
               <Button 
                 onClick={() => setSearchTerm('')}
                 variant="outline" 
                 className="mt-4 min-h-12"
               >
                 Limpar Busca
               </Button>
             )}
           </div>
         </div>
       ) : (
         <div className="equipment-grid space-y-3">
           {filteredEquipments.map((equipment) => (
             <Card key={equipment.id} className="shadow-sm border-gray-200 overflow-hidden">
               <CardContent className="p-4">
                 <div className="space-y-3">
                   {/* Informações principais */}
                   <div className="flex items-start justify-between">
                     <div className="flex-1 min-w-0">
                       <h3 className="font-semibold text-gray-900 truncate">
                         {equipment.nome}
                       </h3>
                       {equipment.codigo && (
                         <p className="text-sm text-gray-600 mt-1">
                           Código: {equipment.codigo}
                         </p>
                       )}
                     </div>
                     <div className="ml-3 flex-shrink-0">
                       {getStatusBadge(equipment)}
                     </div>
                   </div>

                   {/* Descrição */}
                   {equipment.descricao && (
                     <p className="text-sm text-gray-600 line-clamp-2">
                       {equipment.descricao}
                     </p>
                   )}

                   {/* Checklist info */}
                   {equipment.checklist_campos && equipment.checklist_campos.length > 0 && (
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                       <p className="text-xs text-blue-800 font-medium">
                         ✓ {equipment.checklist_campos.length} itens de verificação
                       </p>
                     </div>
                   )}

                   {/* Botão de seleção */}
                   <Button
                     onClick={() => onEquipmentSelect(equipment)}
                     className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                   >
                     {action === 'taking' ? '✓ Retirar Este Equipamento' : '✓ Devolver Este Equipamento'}
                   </Button>
                 </div>
               </CardContent>
             </Card>
           ))}
         </div>
       )}

       {/* Espaço adicional no final para scroll confortável */}
       <div className="h-6" />
     </div>
   </div>
 )
}