// components/mobile/photo-instruction-section.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Hash, Monitor, Package } from 'lucide-react'

export function PhotoInstructionSection() {
  return (
    <Card className="shadow-sm border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-blue-900 flex items-center gap-2">
          📸 Orientações para Fotos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <p className="text-sm text-blue-800 mb-4">
          <strong>Obrigatório:</strong> Tire exatamente 3 fotos na ordem indicada abaixo:
        </p>
        
        <div className="space-y-3">
          {/* Foto 1 - Número de Série */}
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-900">Número de Série</span>
              </div>
              <p className="text-sm text-blue-700">
                Fotografe a etiqueta ou placa com o número de série do equipamento. 
                Certifique-se que os números estão legíveis.
              </p>
            </div>
          </div>

          {/* Foto 2 - Painel do Equipamento */}
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Monitor className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-900">Painel do Equipamento</span>
              </div>
              <p className="text-sm text-blue-700">
                Fotografe o painel principal, tela, botões ou controles do equipamento. 
                Mostre o estado dos indicadores.
              </p>
            </div>
          </div>

          {/* Foto 3 - Equipamento Completo */}
          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-900">Equipamento Completo</span>
              </div>
              <p className="text-sm text-blue-700">
                Foto geral do equipamento mostrando seu estado atual, 
                incluindo possíveis danos ou desgastes visíveis.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            💡 <strong>Dicas:</strong> Use boa iluminação, mantenha o celular firme, 
            e certifique-se que todos os detalhes estão visíveis nas fotos.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}