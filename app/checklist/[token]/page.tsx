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
import { Loader2, AlertCircle } from 'lucide-react'

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
      // Voltar para seleção de ação, mantendo o funcionário
      setAction(null as any)
    } else if (state.step === 'checklist') {
      // Voltar para seleção de equipamento
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
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Validando acesso...</p>
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
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {tokenValidation.error || 'Link inválido ou expirado'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Renderizar baseado no step
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
          action={state.action!}
          equipmentName={state.equipment!.nome}
          employeeName={state.employee!.nome}
          onReset={reset}
        />
      )

    default:
      return null
  }
}