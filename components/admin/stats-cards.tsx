"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, Activity, AlertTriangle } from "lucide-react"
import { dataStore } from "@/lib/data-store"

export function StatsCards() {
  const stats = dataStore.getStats()

  const cards = [
    {
      title: "Total de Equipamentos",
      value: stats.totalEquipment,
      icon: Package,
      description: "Equipamentos cadastrados",
    },
    {
      title: "Equipamentos Disponíveis",
      value: stats.availableEquipment,
      icon: Package,
      description: "Prontos para uso",
      className: "text-primary",
    },
    {
      title: "Em Uso",
      value: stats.inUseEquipment,
      icon: Activity,
      description: "Equipamentos em campo",
      className: "text-secondary",
    },
    {
      title: "Em Manutenção",
      value: stats.maintenanceEquipment,
      icon: AlertTriangle,
      description: "Necessitam reparo",
      className: "text-destructive",
    },
    {
      title: "Funcionários",
      value: stats.totalEmployees,
      icon: Users,
      description: "Cadastrados no sistema",
    },
    {
      title: "Atividade Recente",
      value: stats.recentActivity,
      icon: Activity,
      description: "Últimas 24 horas",
      className: "text-accent",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.className || "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.className || "text-foreground"}`}>{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
