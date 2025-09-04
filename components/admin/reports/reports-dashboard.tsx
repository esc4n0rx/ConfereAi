"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Activity, Calendar } from "lucide-react"
import { dataStore } from "@/lib/data-store"

export function ReportsDashboard() {
  const stats = dataStore.getStats()
  const history = dataStore.getHistory()

  // Calculate additional metrics
  const totalChecklistsToday = history.filter((h) => {
    const today = new Date()
    const itemDate = new Date(h.createdAt)
    return itemDate.toDateString() === today.toDateString()
  }).length

  const totalChecklistsWeek = history.filter((h) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(h.createdAt) > weekAgo
  }).length

  const issuesThisWeek = history.filter((h) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(h.createdAt) > weekAgo && h.hasIssues
  }).length

  const equipmentUtilization =
    stats.totalEquipment > 0 ? Math.round((stats.inUseEquipment / stats.totalEquipment) * 100) : 0

  const issueRate = totalChecklistsWeek > 0 ? Math.round((issuesThisWeek / totalChecklistsWeek) * 100) : 0

  const recentTakings = history.filter((h) => h.action === "taking").length
  const recentReturns = history.filter((h) => h.action === "returning").length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Checklists Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalChecklistsToday}</div>
            <p className="text-xs text-muted-foreground">Atividades registradas hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Checklists (7 dias)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{totalChecklistsWeek}</div>
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
                <span className="font-medium">{recentTakings}</span>
                <Badge variant="secondary">
                  {totalChecklistsWeek > 0 ? Math.round((recentTakings / totalChecklistsWeek) * 100) : 0}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                <span className="text-sm">Devoluções</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{recentReturns}</span>
                <Badge variant="outline">
                  {totalChecklistsWeek > 0 ? Math.round((recentReturns / totalChecklistsWeek) * 100) : 0}%
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
                  {stats.totalEquipment > 0 ? Math.round((stats.maintenanceEquipment / stats.totalEquipment) * 100) : 0}
                  %
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {issuesThisWeek > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Alertas da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {issuesThisWeek} checklist{issuesThisWeek > 1 ? "s" : ""} com problemas identificados nos últimos 7 dias.
              Verifique o histórico detalhado para mais informações.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
