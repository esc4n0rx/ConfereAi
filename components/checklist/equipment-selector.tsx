"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Package, ArrowLeft, CheckCircle } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import type { Equipment, ChecklistAction } from "@/lib/types"

interface EquipmentSelectorProps {
  action: ChecklistAction
  onEquipmentSelect: (equipment: Equipment) => void
  onBack: () => void
}

export function EquipmentSelector({ action, onEquipmentSelect, onBack }: EquipmentSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const equipment = dataStore.getEquipment()

  // Filter equipment based on action
  const availableEquipment = equipment.filter((item) => {
    if (action === "taking") {
      return item.status === "available"
    } else {
      return item.status === "in-use"
    }
  })

  const filteredEquipment = availableEquipment.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusBadge = (status: Equipment["status"]) => {
    const variants = {
      available: { variant: "default" as const, label: "Disponível", className: "bg-green-500 hover:bg-green-600" },
      "in-use": { variant: "secondary" as const, label: "Em Uso", className: "bg-orange-500 text-white" },
      maintenance: { variant: "destructive" as const, label: "Manutenção", className: "" },
      retired: { variant: "outline" as const, label: "Aposentado", className: "" },
    }

    const config = variants[status]
    return (
      <Badge variant={config.variant} className={config.className}>
        <CheckCircle className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button variant="outline" onClick={onBack} size="lg" className="gap-2 bg-transparent">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-primary">
            {action === "taking" ? "Escolha o equipamento para retirar" : "Qual equipamento você está devolvendo?"}
          </h2>
          <p className="text-muted-foreground">
            {action === "taking"
              ? "Selecione um equipamento disponível da lista abaixo"
              : "Encontre o equipamento que você deseja devolver"}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Digite o nome ou código do equipamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredEquipment.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-full sm:w-24 h-24 flex-shrink-0">
                  {item.photos.length > 0 ? (
                    <img
                      src={item.photos[0] || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg border-2"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted rounded-lg border-2 flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h3 className="text-xl font-semibold text-foreground">{item.name}</h3>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-lg font-mono text-primary bg-primary/10 px-3 py-1 rounded-md inline-block">
                      {item.code}
                    </p>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>

                  <Button
                    onClick={() => onEquipmentSelect(item)}
                    size="lg"
                    className="w-full sm:w-auto text-lg px-8 py-3"
                  >
                    {action === "taking" ? "✓ Retirar Este Equipamento" : "✓ Devolver Este Equipamento"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {availableEquipment.length === 0
                ? action === "taking"
                  ? "Nenhum equipamento disponível"
                  : "Nenhum equipamento em uso"
                : "Nenhum resultado encontrado"}
            </h3>
            <p className="text-muted-foreground">
              {availableEquipment.length === 0
                ? action === "taking"
                  ? "Todos os equipamentos estão sendo utilizados no momento."
                  : "Não há equipamentos registrados como em uso."
                : "Tente buscar com um termo diferente."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
