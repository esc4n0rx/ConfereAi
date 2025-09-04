// app/checklist/[token]/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useChecklist } from '@/hooks/use-checklist'
import { EmployeeValidation } from '@/components/mobile/employee-validation'
import { ActionSelection } from '@/components/mobile/action-selection'
import { EquipmentSelection } from '@/components/mobile/equipment-selection'
import { ChecklistForm } from '@/components/mobile/checklist-form'
import { ChecklistSuccess } from '@/components/mobile/checklist-success'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, Smartphone } from 'lucide-react'

export default function ChecklistPage() {
 const params = useParams()
 const token = params.token as string

 const [tokenValidation, setTokenValidation] = useState<{
   loading: boolean
   valid: boolean | null
   error: string | null
 }>({
   loading: true,
   valid: null,
   error: null
 })

 const {
   state,
   loading,
   error,
   setEmployee,
   setAction,
   setEquipment,
   updateResponse,
   updateObservations,
   addPhoto,
   removePhoto,
   toggleIssue,
   reset,
   validateEmployee,
   submitChecklist
 } = useChecklist()

 // Configurações mobile sempre executadas
 useEffect(() => {
   // Configurar meta viewport para mobile otimizado
   const metaViewport = document.querySelector('meta[name="viewport"]')
   if (metaViewport) {
     metaViewport.setAttribute(
       'content', 
       'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
     )
   }

   // Adicionar classe para indicar que é uma página mobile
   document.body.classList.add('mobile-checklist')
   document.documentElement.style.height = '100%'
   document.body.style.height = '100%'

   // Prevenir scroll bounce no iOS
   const preventBounce = (e: TouchEvent) => {
     const target = e.target as HTMLElement
     const isScrollable = target.closest('.mobile-content')
     
     if (!isScrollable) {
       e.preventDefault()
     }
   }

   document.addEventListener('touchmove', preventBounce, { passive: false })

   return () => {
     document.body.classList.remove('mobile-checklist')
     document.documentElement.style.height = ''
     document.body.style.height = ''
     document.removeEventListener('touchmove', preventBounce)
     
     if (metaViewport) {
       metaViewport.setAttribute('content', 'width=device-width, initial-scale=1')
     }
   }
 }, [])

 useEffect(() => {
   validateToken()
 }, [token])

 const validateToken = async () => {
   try {
     setTokenValidation(prev => ({ ...prev, loading: true, error: null }))

     const response = await fetch(`/api/checklist/validate?token=${encodeURIComponent(token)}`)
     
     if (!response.ok) {
       const errorData = await response.json()
       throw new Error(errorData.error || 'Token inválido')
     }

     const result = await response.json()

     setTokenValidation({
       loading: false,
       valid: true,
       error: null
     })
   } catch (err: any) {
     setTokenValidation({
       loading: false,
       valid: false,
       error: err.message
     })
   }
 }

 // Função para lidar com submit atualizada para receber o parâmetro isEquipmentReady
 const handleSubmit = async (isEquipmentReady: boolean) => {
   const success = await submitChecklist(isEquipmentReady)
   if (!success && error) {
     // Mostrar erro se necessário
     console.error('Erro ao submeter:', error)
   }
 }

 // Função para voltar para etapa anterior
 const handleBack = () => {
   switch (state.step) {
     case 'action':
       // Voltar para validação, resetando employee
       setEmployee(null)
       break
     case 'equipment':
       // Voltar para seleção de ação, resetando action
       setAction(null)
       break
     case 'checklist':
       // Voltar para seleção de equipamento, resetando equipment
       setEquipment(null)
       break
   }
 }

 // Loading da validação do token
 if (tokenValidation.loading) {
   return (
     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
       <Card className="w-full max-w-md">
         <CardContent className="flex items-center justify-center py-8">
           <div className="text-center">
             <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
             <p className="text-gray-600">Validando acesso...</p>
           </div>
         </CardContent>
       </Card>
     </div>
   )
 }

 // Token inválido
 if (!tokenValidation.valid) {
   return (
     <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
       <Card className="w-full max-w-md">
         <CardContent className="text-center py-8">
           <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
           <h2 className="text-xl font-semibold text-red-800 mb-2">Acesso Negado</h2>
           <p className="text-red-700 mb-4">
             {tokenValidation.error || 'Token de acesso inválido ou expirado'}
           </p>
           <Button 
             onClick={() => window.location.href = '/'}
             variant="outline"
             className="border-red-300 text-red-700 hover:bg-red-50"
           >
             Voltar ao Início
           </Button>
         </CardContent>
       </Card>
     </div>
   )
 }

 // Verificar se é mobile (opcional - remover se quiser permitir desktop)
 const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

 if (typeof window !== 'undefined' && !isMobile) {
   return (
     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
       <Card className="w-full max-w-md">
         <CardContent className="text-center py-8">
           <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
           <h2 className="text-xl font-semibold text-blue-800 mb-2">Use o Celular</h2>
           <p className="text-blue-700 mb-4">
             Este checklist foi otimizado para dispositivos móveis. Acesse pelo seu smartphone para a melhor experiência.
           </p>
           <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
             <p className="text-xs text-blue-600">
               📱 Escaneie o QR Code ou acesse pelo celular para continuar
             </p>
           </div>
         </CardContent>
       </Card>
     </div>
   )
 }

 // Mostrar erro global se houver
 if (error) {
   return (
     <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
       <Card className="w-full max-w-md">
         <CardContent className="text-center py-8">
           <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
           <h2 className="text-xl font-semibold text-red-800 mb-2">Erro</h2>
           <p className="text-red-700 mb-4">{error}</p>
           <div className="space-y-2">
             <Button 
               onClick={() => window.location.reload()}
               className="w-full"
             >
               Tentar Novamente
             </Button>
             <Button 
               onClick={reset}
               variant="outline"
               className="w-full border-red-300 text-red-700 hover:bg-red-50"
             >
               Reiniciar Checklist
             </Button>
           </div>
         </CardContent>
       </Card>
     </div>
   )
 }

 // Renderizar etapas do checklist
 switch (state.step) {
   case 'validation':
     return (
       <EmployeeValidation 
         onValidate={async (matricula: string) => {
           const employee = await validateEmployee(matricula)
           if (employee) {
             setEmployee(employee)
           }
         }} 
         loading={loading} 
         error={error} 
       />
     )

   case 'action':
     return (
       <ActionSelection 
         onSelect={(action) => setAction(action)} 
         employee={state.employee!} 
         onBack={handleBack}
       />
     )

   case 'equipment':
     return (
       <EquipmentSelection
         action={state.action!}
         onSelect={(equipment) => setEquipment(equipment)}
         onBack={handleBack}
       />
     )

   case 'checklist':
     return (
       <ChecklistForm
         employee={state.employee!}
         equipment={state.equipment!}
         action={state.action!}
         responses={state.responses}
         observations={state.observations}
         photos={state.photos}
         hasIssues={state.hasIssues}
         loading={loading}
         onUpdateResponse={updateResponse}
         onUpdateObservations={updateObservations}
         onAddPhoto={addPhoto}
         onRemovePhoto={removePhoto}
         onToggleIssue={toggleIssue}
         onSubmit={handleSubmit}
         onBack={handleBack}
       />
     )

   case 'success':
     return (
       <ChecklistSuccess
         action={state.action!}
         equipmentName={state.equipment!.nome}
         employeeName={state.employee!.nome}
         onReset={reset}
       />
     )

   default:
     return (
       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
         <Card className="w-full max-w-md">
           <CardContent className="text-center py-8">
             <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
             <h2 className="text-xl font-semibold text-gray-800 mb-2">Estado Inválido</h2>
             <p className="text-gray-700 mb-4">
               O checklist está em um estado não reconhecido.
             </p>
             <Button 
               onClick={reset}
               className="w-full"
             >
               Reiniciar Checklist
             </Button>
           </CardContent>
         </Card>
       </div>
     )
 }
}