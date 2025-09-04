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

  // Mover TODOS os useEffect para o topo do componente
  useEffect(() => {
    validateToken()
  }, [token])

  // Configurações mobile sempre executadas
  useEffect(() => {
    // Prevenir zoom no iOS quando tocar em inputs
    const metaViewport = document.querySelector('meta[name="viewport"]')
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    }

    // Adicionar classe para indicar que é uma página mobile
    document.body.classList.add('mobile-checklist')

    return () => {
      document.body.classList.remove('mobile-checklist')
      if (metaViewport) {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1')
      }
    }
  }, [])

  const validateToken = async () => {
    try {
      setTokenValidation(prev => ({ ...prev, loading: true, error: null }))

      const response = await fetch(`/api/checklist/validate?token=${encodeURIComponent(token)}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Token inválido')
      }

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

  const handleBack = () => {
    if (state.step === 'action') {
      reset()
    } else if (state.step === 'equipment') {
      setAction(null as any)
    } else if (state.step === 'checklist') {
      setEquipment(null as any)
    }
  }

  // Loading do token
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8">
            <div className="text-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-800 mb-2">Acesso Negado</h2>
            </div>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {tokenValidation.error || 'Link inválido ou expirado. Entre em contato com o administrador.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Renderizar conteúdo baseado no step
  const renderStepContent = () => {
    switch (state.step) {
      case 'validation':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="container mx-auto px-4 py-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Checklist de Equipamentos</h1>
                <p className="text-gray-600">Sistema mobile de controle</p>
              </div>
              
              <EmployeeValidation
                onValidate={validateEmployee}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        )

      case 'action':
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            <ActionSelection
              employee={state.employee!}
              onActionSelect={setAction}
            />
          </div>
        )

      case 'equipment':
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
            <EquipmentSelection
              employee={state.employee!}
              action={state.action!}
              onEquipmentSelect={setEquipment}
              onBack={handleBack}
            />
          </div>
        )

      case 'checklist':
        return (
          <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
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
              onSubmit={submitChecklist}
              onBack={handleBack}
            />
          </div>
        )

      case 'success':
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
            <ChecklistSuccess
              action={state.action!}
              equipmentName={state.equipment!.nome}
              employeeName={state.employee!.nome}
              onReset={reset}
            />
          </div>
        )

      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardContent className="py-8">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Estado Inválido</h2>
                  <p className="text-gray-600 mb-4">Ocorreu um erro inesperado.</p>
                  <button
                    onClick={reset}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Reiniciar
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return renderStepContent()
}