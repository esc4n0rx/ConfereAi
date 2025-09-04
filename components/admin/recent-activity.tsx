// components/admin/recent-activity.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { ChecklistData } from "@/lib/types"

export function RecentActivity() {
  const [history, setHistory] = useState<ChecklistData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentActivity()
  }, [])

  const loadRecentActivity = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/checklist')
      const result = await response.json()

      if (response.ok) {
        // Pegar apenas os 5 mais recentes
        const recentChecklists = (result.checklists || []).slice(0, 5)
        setHistory(recentChecklists)
      }
    } catch (error) {
      console.error('Erro ao carregar atividade recente:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: "taking" | "returning") => {
    return action === "taking" ? (
      <Badge className="bg-blue-600">Retirada</Badge>
    ) : (
      <Badge className="bg-green-600">Devolução</Badge>
    )
  }

  const getStatusBadge = (hasIssues: boolean) => {
    return hasIssues ? (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="w-3 h-3" />
        Problemas
      </Badge>
    ) : (
      <Badge variant="default" className="gap-1 bg-primary">
        <CheckCircle className="w-3 h-3" />
        OK
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
        <CardDescription>Últimas movimentações de equipamentos</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Carregando atividades...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade registrada</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="flex items-center justify-between space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.employee.nome}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.equipment.nome} ({item.equipment.codigo})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.device_timestamp), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {getActionBadge(item.action)}
                    {getStatusBadge(item.has_issues)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}