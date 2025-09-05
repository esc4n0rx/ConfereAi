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
    setEmployee,
    setAction,
    setEquipment,
    updateResponse,
    updateObservations,
    toggleIssue,
    reset,
    validateEmployee,
    submitChecklist,
    goBack,
  } = useChecklist()

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

  const handleSubmit = async (isEquipmentReady: boolean) => {
    await submitChecklist(isEquipmentReady)
  }

  const renderCurrentStep = () => {
    switch (state.step) {
      case 'validation':
        return <EmployeeValidation onValidate={validateEmployee} loading={loading} error={error} />
      case 'action':
        return <ActionSelection employee={state.employee!} onActionSelect={setAction} />
      case 'equipment':
        return <EquipmentSelection employee={state.employee!} action={state.action!} onEquipmentSelect={setEquipment} onBack={goBack} />
      case 'checklist':
        return (
          <ChecklistForm
            employee={state.employee!}
            equipment={state.equipment!}
            action={state.action!}
            responses={state.responses}
            observations={state.observations}
            hasIssues={state.hasIssues}
            loading={loading}
            onUpdateResponse={updateResponse}
            onUpdateObservations={updateObservations}
            onToggleIssue={toggleIssue}
            onSubmit={handleSubmit}
            onBack={goBack}
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
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Estado inválido do checklist. Por favor, reinicie o processo.
            </AlertDescription>
          </Alert>
        )
    }
  }

  if (tokenValidation.loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Validando acesso...</p>
        </div>
      </div>
    )
  }

  if (!tokenValidation.valid) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Inválido</h2>
          <p className="text-destructive">{tokenValidation.error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-2xl">
        {renderCurrentStep()}
      </div>
    </div>
  )
}