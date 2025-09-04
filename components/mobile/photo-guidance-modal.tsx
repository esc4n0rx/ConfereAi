// components/mobile/photo-guidance-modal.tsx
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  Hash, 
  Package,
  Eye,
  X 
} from 'lucide-react'

interface PhotoGuidanceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProceed: () => void
  equipmentName: string
  action: 'taking' | 'returning'
}

export function PhotoGuidanceModal({ 
  open, 
  onOpenChange, 
  onProceed, 
  equipmentName,
  action 
}: PhotoGuidanceModalProps) {
  const [understood, setUnderstood] = useState(false)

  const handleProceed = () => {
    onProceed()
    onOpenChange(false)
    setUnderstood(false) // Reset para próxima vez
  }

  const actionText = action === 'taking' ? 'retirada' : 'devolução'
  const actionColor = action === 'taking' ? 'bg-blue-600' : 'bg-green-600'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4 rounded-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5 text-blue-600" />
            Orientações para Fotos
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Info do equipamento e ação */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">{equipmentName}</span>
            </div>
            <Badge className={actionColor}>
              {action === 'taking' ? 'Retirada' : 'Devolução'}
            </Badge>
          </div>

          {/* Instruções obrigatórias */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Fotos Obrigatórias</h4>
                <p className="text-sm text-red-700">
                  É obrigatório tirar pelo menos uma foto para prosseguir com a {actionText}.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">📸 O que fotografar:</h4>
              
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-2 bg-blue-50 rounded-lg">
                  <Hash className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium text-blue-800">Número de Série</span>
                    <p className="text-blue-700">Foto clara da etiqueta/placa com o número de série do equipamento</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2 bg-green-50 rounded-lg">
                  <Package className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium text-green-800">Estado do Equipamento</span>
                    <p className="text-green-700">Foto geral mostrando o estado atual do equipamento</p>
                  </div>
                </div>

                {action === 'returning' && (
                  <div className="flex items-start gap-3 p-2 bg-yellow-50 rounded-lg">
                    <Eye className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="font-medium text-yellow-800">Possíveis Danos</span>
                      <p className="text-yellow-700">Se houver danos, fotografe claramente para registro</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dicas importantes */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 Dicas importantes:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use boa iluminação</li>
              <li>• Mantenha o celular estável</li>
              <li>• Certifique-se que o texto está legível</li>
              <li>• Tire múltiplas fotos se necessário</li>
            </ul>
          </div>

          {/* Checkbox de entendimento */}
          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <button
              onClick={() => setUnderstood(!understood)}
              className={`flex-shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                understood 
                  ? 'bg-green-600 border-green-600' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {understood && <CheckCircle className="h-3 w-3 text-white" />}
            </button>
            <label 
              onClick={() => setUnderstood(!understood)}
              className="text-sm text-gray-700 cursor-pointer select-none"
            >
              Li e entendi as orientações. Estou ciente que preciso tirar pelo menos uma foto do número de série e do estado do equipamento.
            </label>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button
              onClick={handleProceed}
              disabled={!understood}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Começar Fotos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}