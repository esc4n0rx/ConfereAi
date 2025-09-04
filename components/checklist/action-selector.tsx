"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Upload, ArrowRight } from "lucide-react"
import type { ChecklistAction } from "@/lib/types"

interface ActionSelectorProps {
  onActionSelect: (action: ChecklistAction) => void
}

export function ActionSelector({ onActionSelect }: ActionSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-primary">O que você deseja fazer?</h2>
        <p className="text-muted-foreground">Escolha uma das opções abaixo para continuar</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
          onClick={() => onActionSelect("taking")}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
              <Download className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Retirar Equipamento</h3>
              <p className="text-sm text-muted-foreground">Pegar um equipamento para usar no trabalho</p>
            </div>
            <Button size="lg" className="w-full group-hover:bg-primary/90">
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
          onClick={() => onActionSelect("returning")}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-secondary/20 transition-colors">
              <Upload className="h-8 w-8 text-secondary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Devolver Equipamento</h3>
              <p className="text-sm text-muted-foreground">Retornar um equipamento que estava usando</p>
            </div>
            <Button size="lg" variant="secondary" className="w-full group-hover:bg-secondary/90">
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm font-bold">💡</span>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-blue-900">Dica:</p>
            <p className="text-sm text-blue-800">
              Após escolher a ação, você selecionará o equipamento e preencherá um checklist rápido para garantir que
              tudo está em ordem.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
