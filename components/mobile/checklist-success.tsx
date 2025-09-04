// components/mobile/checklist-success.tsx (continuação)
"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Home } from 'lucide-react'

interface ChecklistSuccessProps {
 action: 'taking' | 'returning'
 equipmentName: string
 employeeName: string
 onReset: () => void
}

export function ChecklistSuccess({ 
 action, 
 equipmentName, 
 employeeName, 
 onReset 
}: ChecklistSuccessProps) {
 const getSuccessMessage = () => {
   return action === 'taking' 
     ? 'Retirada realizada com sucesso!'
     : 'Devolução realizada com sucesso!'
 }

 const getActionMessage = () => {
   return action === 'taking'
     ? `O equipamento "${equipmentName}" foi retirado por ${employeeName}`
     : `O equipamento "${equipmentName}" foi devolvido por ${employeeName}`
 }

 return (
   <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
     <Card className="w-full max-w-md">
       <CardHeader className="text-center pb-4">
         <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
           <CheckCircle className="w-10 h-10 text-green-600" />
         </div>
         <CardTitle className="text-2xl font-bold text-green-800">
           {getSuccessMessage()}
         </CardTitle>
       </CardHeader>
       
       <CardContent className="text-center space-y-6">
         <p className="text-gray-700">
           {getActionMessage()}
         </p>
         
         <div className="bg-green-50 rounded-lg p-4 border border-green-200">
           <p className="text-sm text-green-700">
             ✓ Checklist registrado no sistema<br />
             ✓ Fotos salvas com segurança<br />
             ✓ Notificação enviada aos responsáveis
           </p>
         </div>

         <Button 
           onClick={onReset}
           className="w-full h-12 bg-blue-600 hover:bg-blue-700"
         >
           <Home className="w-4 h-4 mr-2" />
           Fazer Novo Checklist
         </Button>
       </CardContent>
     </Card>
   </div>
 )
}