// components/admin/stats-cards.tsx (SUBSTITUIR arquivo completo)
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, Activity, AlertTriangle, Loader2, Bell } from "lucide-react"

interface StatsData {
  totalEquipment: number
  availableEquipment: number
  inUseEquipment: number
  maintenanceEquipment: number
  totalEmployees: number
  recentActivity: number
  pendingApprovals: number
}

export function StatsCards() {
  const [stats, setStats] = useState<StatsData>({
    totalEquipment: 0,
    availableEquipment: 0,
    inUseEquipment: 0,
    maintenanceEquipment: 0,
    totalEmployees: 0,
    recentActivity: 0,
    pendingApprovals: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Buscar todas as APIs em paralelo
      const [equipmentsResponse, employeesResponse, checklistsResponse, approvalsResponse] = await Promise.all([
        fetch('/api/equipments'),
        fetch('/api/employees'),
        fetch('/api/checklist'),
        fetch('/api/checklist/pending').catch(() => ({ ok: false })) // Fallback se a API não existir ainda
      ])

      // Processar equipamentos
      const equipmentsResult = await equipmentsResponse.json()
      const equipments = equipmentsResult.equipments || []

      // Processar funcionários
      const employeesResult = await employeesResponse.json()
      const employees = employeesResult.employees || []

      // Processar checklists
      const checklistsResult = await checklistsResponse.json()
      const checklists = checklistsResult.checklists || []

      // Processar aprovações pendentes
      let pendingApprovals = 0
      if (approvalsResponse.ok) {
        const approvalData = await approvalsResponse.json()
        pendingApprovals = approvalData.pendingApprovals?.length || 0
      }

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
        pendingApprovals
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: "Aprovações Pendentes",
      value: stats.pendingApprovals,
      icon: Bell,
      description: stats.pendingApprovals > 0 ? "Requerem atenção" : "Tudo em dia",
      color: stats.pendingApprovals > 0 ? "text-orange-600" : "text-green-600",
      loading: loading,
    },
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
            <card.icon className={`h-4 w-4 ${card.className || card.color || "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            {card.loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : (
              <>
                <div className={`text-2xl font-bold ${card.className || card.color || "text-foreground"}`}>
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