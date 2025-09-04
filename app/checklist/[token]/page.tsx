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
      setAction(null)
    } else if (state.step === 'checklist') {
      setEquipment(null)
    }
  }

  // Loading do token
  if (tokenValidation.loading) {
    return (
      <div className="mobile-container bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="mobile-content flex items-center justify-center">
          <div className="mobile-loading">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-lg font-medium text-gray-700">Validando acesso...</p>
          </div>
        </div>
      </div>
    )
  }

  // Token inválido
  if (!tokenValidation.valid || tokenValidation.error) {
    return (
      <div className="mobile-container bg-gradient-to-br from-red-50 to-pink-50">
        <div className="mobile-content flex items-center justify-center p-4">
          <div className="mobile-error">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-red-900 mb-2">Acesso Negado</h1>
            <p className="text-red-700 text-center mb-4">
              {tokenValidation.error || 'Token inválido ou expirado'}
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
              <div className="flex items-center gap-2 text-sm text-red-800">
                <Smartphone className="h-4 w-4" />
                <span>Para acessar o checklist, use o link enviado pelo seu supervisor.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Loading do checklist
  if (loading && !state.employee) {
    return (
      <div className="mobile-container bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="mobile-content flex items-center justify-center">
          <div className="mobile-loading">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-lg font-medium text-gray-700">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  // Erro global
  if (error) {
    return (
      <div className="mobile-container bg-gradient-to-br from-red-50 to-pink-50">
        <div className="mobile-content flex items-center justify-center p-4">
          <div className="mobile-error">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <h1 className="text-xl font-bold text-red-900 mb-2">Erro</h1>
            <p className="text-red-700 text-center">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar etapas do checklist
  const renderStep = () => {
    switch (state.step) {
      case 'validation':
        return (
          <EmployeeValidation
            onValidate={validateEmployee}
            loading={loading}
            error={error}
          />
        )

      case 'action':
        return (
          <ActionSelection
            employee={state.employee!}
            onActionSelect={setAction}
            onBack={handleBack}
          />
        )

      case 'equipment':
        return (
          <EquipmentSelection
            employee={state.employee!}
            action={state.action!}
            onEquipmentSelect={setEquipment}
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
            onSubmit={submitChecklist}
            onBack={handleBack}
          />
        )

      case 'success':
        return (
          <ChecklistSuccess
            employee={state.employee!}
            equipment={state.equipment!}
            action={state.action!}
            onReset={reset}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="mobile-container">
      {renderStep()}
    </div>
  )
}