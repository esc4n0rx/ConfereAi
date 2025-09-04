// components/mobile/confirmation-modal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertTriangle, Package, User } from 'lucide-react'
import type { DatabaseEmployee, DatabaseEquipment } from '@/lib/types'

interface ConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (isEquipmentReady: boolean) => void
  employee: DatabaseEmployee
  equipment: DatabaseEquipment
  action: 'taking' | 'returning'
  loading: boolean
}

export function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  employee,
  equipment,
  action,
  loading
}: ConfirmationModalProps) {
  const handleConfirm = (isReady: boolean) => {
    onConfirm(isReady)
  }

  const actionText = action === 'taking' ? 'retirada' : 'devolução'
  const actionColor = action === 'taking' ? 'bg-blue-600' : 'bg-green-600'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mobile-confirmation-modal w-[calc(100vw-2rem)] max-w-[400px] max-h-[85vh] p-4 gap-4 rounded-lg">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-center text-lg font-semibold leading-tight">
            Confirmar {action === 'taking' ? 'Retirada' : 'Devolução'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Resumo da operação */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{employee.nome}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{equipment.nome}</span>
                {equipment.codigo && (
                  <Badge variant="outline" className="text-xs ml-auto">
                    {equipment.codigo}
                  </Badge>
                )}
              </div>
              <Badge className={`${actionColor} text-white text-xs w-fit`}>
                {action === 'taking' ? 'Retirada' : 'Devolução'}
              </Badge>
            </CardContent>
          </Card>

          {/* Pergunta principal */}
          <div className="text-center space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-1 text-sm">
                Baseado na sua avaliação:
              </h3>
              <p className="text-blue-800 text-sm">
                O equipamento está apto para uso normal?
              </p>
            </div>
            
            <p className="text-xs text-gray-600">
              Esta informação será usada para definir o status do equipamento no sistema.
            </p>
          </div>

          {/* Informação adicional */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Nota:</strong> Independente da sua escolha, o equipamento ficará disponível no sistema. 
              Caso indique que precisa de atenção, será marcado para revisão posterior.
            </p>
          </div>
        </div>

        {/* Botões de confirmação */}
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <Button
            onClick={() => handleConfirm(true)}
            disabled={loading}
            className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-medium text-sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {loading ? 'Enviando...' : 'Sim, está apto para uso'}
          </Button>
          
          <Button
            onClick={() => handleConfirm(false)}
            disabled={loading}
            variant="outline"
            className="w-full h-11 border-orange-300 text-orange-700 hover:bg-orange-50 font-medium text-sm"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {loading ? 'Enviando...' : 'Não, precisa de atenção'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}