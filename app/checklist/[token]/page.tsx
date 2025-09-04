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
        useState(prev => ({ ...prev, step: 'validation', action: null }))
        break
      case 'equipment':
        useState(prev => ({ ...prev, step: 'action', equipment: null }))
        break
      case 'checklist':
        useState(prev => ({ 
          ...prev, 
          step: 'equipment', 
          responses: {}, 
          observations: '', 
          photos: [], 
          hasIssues: false 
        }))
        break
    }
  }

  // Loading de validação do token
  if (tokenValidation.loading) {
    return (
      <div className="mobile-container bg-gray-50">
        <div className="mobile-content flex items-center justify-center">
          <div className="mobile-loading">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Validando acesso...</p>
          </div>
        </div>
      </div>
    )
  }

  // Token inválido
  if (!tokenValidation.valid) {
    return (
      <div className="mobile-container bg-gray-50">
        <div className="mobile-content flex items-center justify-center">
          <div className="mobile-error">
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 max-w-sm mx-4">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Erro
                  </h2>
                  <p className="text-sm text-red-600">
                    {tokenValidation.error}
                  </p>
                </div>
                <div className="space-y-2">
                  <Button 
                    onClick={validateToken}
                    className="w-full bg-green-600 hover:bg-green-700"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar componente baseado na etapa atual
  const renderCurrentStep = () => {
    switch (state.step) {
      case 'validation':
        return (
          <EmployeeValidation
            onValidate={validateEmployee} // Agora compatível
            loading={loading}
            error={error}
          />
        )

      case 'action':
        return (
          <ActionSelection
            employee={state.employee!}
            onActionSelect={setAction} // Nome correto da prop
          />
        )

      case 'equipment':
        return (
          <EquipmentSelection
            employee={state.employee!}
            action={state.action!}
            onEquipmentSelect={setEquipment} // Nome correto da prop
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
            onReset={reset} // Nome correto da prop
          />
        )

      default:
        return (
          <div className="mobile-error">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Estado inválido do checklist. Recarregue a página.
              </AlertDescription>
            </Alert>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Indicador para desktop */}
      <div className="hidden md:block">
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <Card className="max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Interface Mobile
              </h2>
              <p className="text-gray-600 mb-4">
                Esta interface foi otimizada para dispositivos móveis. 
                Acesse pelo seu smartphone ou tablet para melhor experiência.
              </p>
              <Button onClick={() => window.location.href = '/dashboard'}>
                Ir para Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interface mobile */}
      <div className="block md:hidden">
        {renderCurrentStep()}
      </div>

      {/* Toast de erro global */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}