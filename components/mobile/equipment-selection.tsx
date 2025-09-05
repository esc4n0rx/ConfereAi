// components/mobile/equipment-selection.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Package, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
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
   if (searchTerm.trim() === '') {
     setFilteredEquipments(equipments)
   } else {
     const filtered = equipments.filter(equipment =>
       equipment.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (equipment.codigo && equipment.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
     )
     setFilteredEquipments(filtered)
   }
 }, [equipments, searchTerm])

 const loadEquipments = async () => {
   try {
     setLoading(true)
     setError(null)
     const response = await fetch(`/api/checklist/equipments?action=${action}&employee_id=${employee.id}`)
     const result = await response.json()
     if (!response.ok) throw new Error(result.error || 'Erro ao carregar equipamentos')
     setEquipments(result.equipments || [])
   } catch (err: any) {
     setError(err.message)
   } finally {
     setLoading(false)
   }
 }

 const getEmptyMessage = () => {
   if (searchTerm.trim() !== '') return { title: 'Nenhum equipamento encontrado', description: 'Tente uma nova busca.' }
   return action === 'taking'
     ? { title: 'Nenhum equipamento disponível', description: 'Todos os equipamentos estão em uso ou manutenção.' }
     : { title: 'Nenhum equipamento para devolver', description: 'Você não possui equipamentos retirados em seu nome.' }
 }

 if (loading) {
   return <div className="text-center p-10"><Loader2 className="h-8 w-8 animate-spin mx-auto" /><p className="mt-2">Carregando...</p></div>
 }
 if (error) {
   return <div className="text-center p-10"><AlertCircle className="h-8 w-8 text-destructive mx-auto" /><p className="mt-2 text-destructive">{error}</p></div>
 }

 return (
   <Card className="w-full">
     <CardContent className="p-6 space-y-6">
       <div className="space-y-2">
         <Button variant="outline" onClick={onBack} size="sm" className="gap-2">
           <ArrowLeft className="h-4 w-4" /> Voltar
         </Button>
         <h2 className="text-2xl font-bold">
           {action === "taking" ? "Selecione o Equipamento para Retirar" : "Selecione o Equipamento para Devolver"}
         </h2>
         <div className="relative">
           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
           <Input
             placeholder="Buscar por nome ou código..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-10 h-10"
           />
         </div>
       </div>

       <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
         {filteredEquipments.length === 0 ? (
           <div className="text-center py-10">
             <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
             <h3 className="font-semibold">{getEmptyMessage().title}</h3>
             <p className="text-sm text-muted-foreground">{getEmptyMessage().description}</p>
           </div>
         ) : (
           filteredEquipments.map((item) => (
             <button
               key={item.id}
               onClick={() => onEquipmentSelect(item)}
               className="w-full text-left p-4 border rounded-lg hover:bg-accent hover:border-primary/50 transition-all flex items-center justify-between"
             >
               <div>
                 <p className="font-semibold">{item.nome}</p>
                 <p className="text-sm text-muted-foreground">{item.codigo}</p>
               </div>
               <Badge variant={item.status === "disponivel" ? "default" : "secondary"}>
                 {item.status === 'disponivel' ? 'Disponível' : 'Em uso'}
               </Badge>
             </button>
           ))
         )}
       </div>
     </CardContent>
   </Card>
 )
}