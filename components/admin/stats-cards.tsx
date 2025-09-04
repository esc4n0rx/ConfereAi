// components/admin/stats-cards.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, Activity, AlertTriangle, Loader2 } from "lucide-react"

interface StatsData {
  totalEquipment: number
  availableEquipment: number
  inUseEquipment: number
  maintenanceEquipment: number
  totalEmployees: number
  recentActivity: number
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    totalEquipment: 0,
    availableEquipment: 0,
    inUseEquipment: 0,
    maintenanceEquipment: 0,
    totalEmployees: 0,
    recentActivity: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)

      // Buscar equipamentos
      const equipmentsResponse = await fetch('/api/equipments')
      const equipmentsResult = await equipmentsResponse.json()
      const equipments = equipmentsResult.equipments || []

      // Buscar funcionários
      const employeesResponse = await fetch('/api/employees')
      const employeesResult = await employeesResponse.json()
      const employees = employeesResult.employees || []

      // Buscar checklists
      const checklistsResponse = await fetch('/api/checklist')
      const checklistsResult = await checklistsResponse.json()
      const checklists = checklistsResult.checklists || []

      // Calcular estatísticas
      const today = new Date()
      const dayAgo = new Date()
      dayAgo.setDate(dayAgo.getDate() - 1)

      const totalEquipment = equipments.length
      const availableEquipment = equipments.filter(eq => eq.status === 'disponivel').length
      const maintenanceEquipment = equipments.filter(eq => eq.status === 'manutencao').length

      // Calcular equipamentos em uso baseado nos checklists
      const takingChecklists = checklists.filter(c => c.action === 'taking')
      const returningChecklists = checklists.filter(c => c.action === 'returning')
      
      // Equipamentos únicos que foram retirados
      const takenEquipmentIds = new Set(takingChecklists.map(c => c.equipment.id))
      // Equipamentos únicos que foram devolvidos
      const returnedEquipmentIds = new Set(returningChecklists.map(c => c.equipment.id))
      
      // Equipamentos em uso = retirados - devolvidos
      const inUseEquipmentIds = new Set([...takenEquipmentIds].filter(id => !returnedEquipmentIds.has(id)))
      const inUseEquipment = inUseEquipmentIds.size

      const totalEmployees = employees.length

      const recentActivity = checklists.filter(c => {
        const checklistDate = new Date(c.device_timestamp)
        return checklistDate > dayAgo
      }).length

      setStats({
        totalEquipment,
        availableEquipment,
        inUseEquipment,
        maintenanceEquipment,
        totalEmployees,
        recentActivity,
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: "Total de Equipamentos",
      value: stats.totalEquipment,
      icon: Package,
      description: "Equipamentos cadastrados",
      loading: loading,
    },
    {
      title: "Equipamentos Disponíveis",
      value: stats.availableEquipment,
      icon: Package,
      description: "Prontos para uso",
      className: "text-primary",
      loading: loading,
    },
    {
      title: "Em Uso",
      value: stats.inUseEquipment,
      icon: Activity,
      description: "Equipamentos em campo",
      className: "text-secondary",
      loading: loading,
    },
    {
      title: "Em Manutenção",
      value: stats.maintenanceEquipment,
      icon: AlertTriangle,
      description: "Necessitam reparo",
      className: "text-destructive",
      loading: loading,
    },
    {
      title: "Funcionários",
      value: stats.totalEmployees,
      icon: Users,
      description: "Cadastrados no sistema",
      loading: loading,
    },
    {
      title: "Atividade Recente",
      value: stats.recentActivity,
      icon: Activity,
      description: "Últimas 24 horas",
      className: "text-accent",
      loading: loading,
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
            {card.loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <>
                <div className={`text-2xl font-bold ${card.className || "text-foreground"}`}>
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}