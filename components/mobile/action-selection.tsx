// components/mobile/action-selection.tsx
"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowDown, ArrowUp, User } from 'lucide-react'
import type { DatabaseEmployee } from '@/lib/types'

interface ActionSelectionProps {
  employee: DatabaseEmployee
  onActionSelect: (action: 'taking' | 'returning') => void
}

export function ActionSelection({ employee, onActionSelect }: ActionSelectionProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold">
          Olá, {employee.nome}!
        </CardTitle>
        <CardDescription>
          {employee.cargo}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground mb-6">
          O que você gostaria de fazer?
        </p>
        
        <Button
          onClick={() => onActionSelect('taking')}
          className="w-full h-20 text-base flex items-center justify-center gap-4"
          size="lg"
        >
          <ArrowDown className="w-8 h-8" />
          <div className="text-left">
            <div className="font-semibold text-lg">Retirar Equipamento</div>
            <div className="font-normal opacity-90">Iniciar um novo checklist de retirada</div>
          </div>
        </Button>
        
        <Button
          onClick={() => onActionSelect('returning')}
          className="w-full h-20 text-base flex items-center justify-center gap-4"
          size="lg"
          variant="secondary"
        >
          <ArrowUp className="w-8 h-8" />
          <div className="text-left">
            <div className="font-semibold text-lg">Devolver Equipamento</div>
            <div className="font-normal opacity-90">Registrar a devolução de um equipamento</div>
          </div>
        </Button>
      </CardContent>
    </Card>
  )
}