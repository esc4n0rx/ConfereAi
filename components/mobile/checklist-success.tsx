// components/mobile/checklist-success.tsx
"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
 const successMessage = action === 'taking' 
   ? 'Retirada realizada com sucesso!'
   : 'Devolução realizada com sucesso!'

 const actionMessage = action === 'taking'
   ? `O equipamento "${equipmentName}" foi retirado por ${employeeName}.`
   : `O equipamento "${equipmentName}" foi devolvido por ${employeeName}.`

 return (
    <Card className="w-full max-w-md mx-auto">
       <CardHeader className="text-center">
         <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
           <CheckCircle className="w-10 h-10 text-green-600" />
         </div>
         <CardTitle className="text-2xl font-bold text-green-800">
           {successMessage}
         </CardTitle>
         <CardDescription>
            {actionMessage}
         </CardDescription>
       </CardHeader>
       
       <CardContent className="text-center space-y-6">
         <div className="bg-green-50 rounded-lg p-4 border border-green-200">
           <p className="text-sm text-green-700 space-y-1">
             <span>✓ Checklist registrado no sistema.</span><br/>
             <span>✓ O status do equipamento foi atualizado.</span><br/>
             <span>✓ Uma notificação foi enviada aos encarregados.</span>
           </p>
         </div>

         <Button 
           onClick={onReset}
           className="w-full h-12"
           size="lg"
         >
           <Home className="w-4 h-4 mr-2" />
           Realizar Novo Checklist
         </Button>
       </CardContent>
     </Card>
 )
}