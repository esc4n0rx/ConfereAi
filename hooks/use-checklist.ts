// hooks/use-checklist.ts
"use client"

import { useState, useCallback } from 'react'
import type { MobileChecklistState, DatabaseEmployee, DatabaseEquipment } from '@/lib/types'

export function useChecklist() {
  const [state, setState] = useState<MobileChecklistState>({
    step: 'validation',
    employee: null,
    action: null,
    equipment: null,
    responses: {},
    observations: '',
    photos: [],
    hasIssues: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setEmployee = useCallback((employee: DatabaseEmployee) => {
    setState(prev => ({
      ...prev,
      employee,
      step: 'action'
    }))
  }, [])

  const setAction = useCallback((action: 'taking' | 'returning') => {
    setState(prev => ({
      ...prev,
      action,
      step: 'equipment'
    }))
  }, [])

  const setEquipment = useCallback((equipment: DatabaseEquipment) => {
    setState(prev => ({
      ...prev,
      equipment,
      step: 'checklist'
    }))
  }, [])

  const updateResponse = useCallback((field: string, value: any) => {
    setState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [field]: value
      }
    }))
  }, [])

  const updateObservations = useCallback((observations: string) => {
    setState(prev => ({
      ...prev,
      observations
    }))
  }, [])

  const addPhoto = useCallback((photo: File) => {
    setState(prev => ({
      ...prev,
      photos: [...prev.photos, photo]
    }))
  }, [])

  const removePhoto = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }, [])

  const toggleIssue = useCallback((hasIssue: boolean) => {
    setState(prev => ({
      ...prev,
      hasIssues: hasIssue
    }))
  }, [])

  const reset = useCallback(() => {
    setState({
      step: 'validation',
      employee: null,
      action: null,
      equipment: null,
      responses: {},
      observations: '',
      photos: [],
      hasIssues: false
    })
    setError(null)
  }, [])

  const validateEmployee = useCallback(async (matricula: string): Promise<DatabaseEmployee | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/employees/validate?matricula=${encodeURIComponent(matricula)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Funcionário não encontrado')
      }

      const result = await response.json()
      return result.employee
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Função auxiliar para converter File para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const submitChecklist = useCallback(async (isEquipmentReady: boolean): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      if (!state.employee || !state.equipment || !state.action) {
        throw new Error('Dados incompletos para submissão')
      }

      // Converter fotos para base64
      const photoPromises = state.photos.map(photo => fileToBase64(photo))
      const photosBase64 = await Promise.all(photoPromises)

      // Determinar status baseado na confirmação do usuário
      const equipmentStatus = isEquipmentReady ? 'available' : 'maintenance'

      const payload = {
        employee_id: state.employee.id,
        equipment_id: state.equipment.id,
        action: state.action,
        checklist_responses: state.responses,
        observations: state.observations || null,
        has_issues: state.hasIssues,
        device_timestamp: new Date().toISOString(),
        photos: photosBase64,
        equipment_status: equipmentStatus,
        is_equipment_ready: isEquipmentReady
      }

      const response = await fetch('/api/checklist/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Erro ao submeter checklist'
        
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          // Se não conseguir fazer parse do JSON, usar mensagem padrão
          console.error('Erro de resposta não-JSON:', errorText)
        }
        
        throw new Error(errorMessage)
      }

      const result = await response.json()

      setState(prev => ({ ...prev, step: 'success' }))
      return true
    } catch (err: any) {
      console.error('Erro no submitChecklist:', err)
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }, [state])

  return {
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
  }
}