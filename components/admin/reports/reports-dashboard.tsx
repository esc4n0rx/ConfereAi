// components/admin/reports/reports-dashboard.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity, Calendar } from "lucide-react"
import type { ChecklistData, DatabaseEquipment } from "@/lib/types"

interface ReportsStats {
  totalEquipment: number
  availableEquipment: number
  inUseEquipment: number
  maintenanceEquipment: number
  totalChecklistsToday: number
  totalChecklistsWeek: number
  issuesThisWeek: number
  recentTakings: number
  recentReturns: number
}

export function ReportsDashboard() {
  const [stats, setStats] = useState<ReportsStats>({
    totalEquipment: 0,
    availableEquipment: 0,
    inUseEquipment: 0,
    maintenanceEquipment: 0,
    totalChecklistsToday: 0,
    totalChecklistsWeek: 0,
    issuesThisWeek: 0,
    recentTakings: 0,
    recentReturns: 0
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
      const equipments: DatabaseEquipment[] = equipmentsResult.equipments || []

      // Buscar checklists
      const checklistsResponse = await fetch('/api/checklist')
      const checklistsResult = await checklistsResponse.json()
      const checklists: ChecklistData[] = checklistsResult.checklists || []

      // Calcular estatísticas
      const today = new Date()
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

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

      const totalChecklistsToday = checklists.filter(c => {
        const checklistDate = new Date(c.device_timestamp)
        return checklistDate.toDateString() === today.toDateString()
      }).length

      const checklistsThisWeek = checklists.filter(c => {
        const checklistDate = new Date(c.device_timestamp)
        return checklistDate > weekAgo
      })

      const totalChecklistsWeek = checklistsThisWeek.length
      const issuesThisWeek = checklistsThisWeek.filter(c => c.has_issues).length
      const recentTakings = checklistsThisWeek.filter(c => c.action === 'taking').length
      const recentReturns = checklistsThisWeek.filter(c => c.action === 'returning').length

      setStats({
        totalEquipment,
        availableEquipment,
        inUseEquipment,
        maintenanceEquipment,
        totalChecklistsToday,
        totalChecklistsWeek,
        issuesThisWeek,
        recentTakings,
        recentReturns
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const equipmentUtilization = stats.totalEquipment > 0 
    ? Math.round((stats.inUseEquipment / stats.totalEquipment) * 100) 
    : 0

  const issueRate = stats.totalChecklistsWeek > 0 
    ? Math.round((stats.issuesThisWeek / stats.totalChecklistsWeek) * 100) 
    : 0

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Checklists Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalChecklistsToday}</div>
            <p className="text-xs text-muted-foreground">Atividades registradas hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Checklists (7 dias)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.totalChecklistsWeek}</div>
            <p className="text-xs text-muted-foreground">Atividades na última semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Utilização</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{equipmentUtilization}%</div>
            <Progress value={equipmentUtilization} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Equipamentos em uso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Problemas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${issueRate > 20 ? "text-destructive" : "text-primary"}`}>
              {issueRate}%
            </div>
            <Progress value={issueRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Checklists com problemas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-secondary" />
                <span className="text-sm">Retiradas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stats.recentTakings}</span>
                <Badge variant="secondary">
                  {stats.totalChecklistsWeek > 0 ? Math.round((stats.recentTakings / stats.totalChecklistsWeek) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                <span className="text-sm">Devoluções</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stats.recentReturns}</span>
                <Badge variant="outline">
                  {stats.totalChecklistsWeek > 0 ? Math.round((stats.recentReturns / stats.totalChecklistsWeek) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Equipamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm">Disponíveis</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stats.availableEquipment}</span>
                <Badge variant="default" className="bg-primary">
                  {stats.totalEquipment > 0 ? Math.round((stats.availableEquipment / stats.totalEquipment) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-secondary" />
                <span className="text-sm">Em Uso</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stats.inUseEquipment}</span>
                <Badge variant="secondary">
                  {stats.totalEquipment > 0 ? Math.round((stats.inUseEquipment / stats.totalEquipment) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm">Manutenção</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{stats.maintenanceEquipment}</span>
                <Badge variant="destructive">
                  {stats.totalEquipment > 0 ? Math.round((stats.maintenanceEquipment / stats.totalEquipment) * 100) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.issuesThisWeek > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Alertas da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {stats.issuesThisWeek} checklist{stats.issuesThisWeek > 1 ? "s" : ""} com problemas identificados nos últimos 7 dias.
              Verifique o histórico detalhado para mais informações.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}