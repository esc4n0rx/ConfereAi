// components/mobile/equipment-selection.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Package, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import type { DatabaseEmployee, DatabaseEquipment } from '@/lib/types'

interface EquipmentSelectionProps {
  employee: DatabaseEmployee
  action: 'taking' | 'returning'
  onEquipmentSelect: (equipment: DatabaseEquipment) => void
  onBack: () => void
}

export function EquipmentSelection({ 
  employee, 
  action, 
  onEquipmentSelect, 
  onBack 
}: EquipmentSelectionProps) {
  const [equipments, setEquipments] = useState<DatabaseEquipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEquipments()
  }, [action, employee.id])

  const loadEquipments = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/checklist/equipments?action=${action}&employee_id=${employee.id}`
      )
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar equipamentos')
      }

      setEquipments(result.equipments || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getActionTitle = () => {
    return action === 'taking' 
      ? 'Escolher Equipamento para Retirar'
      : 'Escolher Equipamento para Devolver'
  }

  const getEmptyMessage = () => {
    return action === 'taking'
      ? 'Nenhum equipamento disponível para retirada'
      : 'Você não possui equipamentos para devolver'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Carregando equipamentos...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold">{getActionTitle()}</h1>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {equipments.length === 0 && !error && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">{getEmptyMessage()}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {equipments.map((equipment) => (
            <Card 
              key={equipment.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onEquipmentSelect(equipment)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {equipment.nome}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {equipment.descricao}
                    </p>
                    {equipment.codigo && (
                      <p className="text-xs text-gray-500 mt-2 font-mono">
                        Código: {equipment.codigo}
                      </p>
                    )}
                  </div>
                  <div className="ml-3">
                    <Badge variant="outline">
                      {equipment.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}