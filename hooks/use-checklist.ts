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

  const toggleIssue = useCallback((hasIssues: boolean) => {
    setState(prev => ({
      ...prev,
      hasIssues
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

  const validateEmployee = async (matricula: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/employees/validate-matricula?matricula=${encodeURIComponent(matricula)}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Funcionário não encontrado')
      }

      setEmployee(result.employee)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Função para converter File para Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  const submitChecklist = async (): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      if (!state.employee || !state.equipment || !state.action) {
        throw new Error('Dados incompletos para submissão')
      }

      // Converter fotos para base64
      const photoPromises = state.photos.map(photo => fileToBase64(photo))
      const photosBase64 = await Promise.all(photoPromises)

      const response = await fetch('/api/checklist/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employee_id: state.employee.id,
          equipment_id: state.equipment.id,
          action: state.action,
          checklist_responses: state.responses,
          observations: state.observations || null,
          has_issues: state.hasIssues,
          device_timestamp: new Date().toISOString(),
          photos: photosBase64
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao submeter checklist')
      }

      setState(prev => ({ ...prev, step: 'success' }))
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

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