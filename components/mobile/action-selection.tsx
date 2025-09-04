// components/mobile/action-selection.tsx
"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDown, ArrowUp, User } from 'lucide-react'
import type { DatabaseEmployee } from '@/lib/types'

interface ActionSelectionProps {
  employee: DatabaseEmployee
  onActionSelect: (action: 'taking' | 'returning') => void
}

export function ActionSelection({ employee, onActionSelect }: ActionSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            Olá, {employee.nome}!
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {employee.cargo}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-gray-700 mb-6">
            O que você gostaria de fazer?
          </p>
          
          <Button
            onClick={() => onActionSelect('taking')}
            className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3"
            size="lg"
          >
            <ArrowDown className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Retirar Equipamento</div>
              <div className="text-sm opacity-90">Pegar um equipamento disponível</div>
            </div>
          </Button>
          
          <Button
            onClick={() => onActionSelect('returning')}
            className="w-full h-16 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-3"
            size="lg"
          >
            <ArrowUp className="w-6 h-6" />
            <div className="text-left">
              <div className="font-semibold">Devolver Equipamento</div>
              <div className="text-sm opacity-90">Retornar um equipamento</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}