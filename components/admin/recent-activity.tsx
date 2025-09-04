"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { dataStore } from "@/lib/data-store"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function RecentActivity() {
  const history = dataStore.getHistory().slice(0, 5) // Last 5 activities

  const getActionBadge = (action: "taking" | "returning") => {
    return action === "taking" ? (
      <Badge variant="secondary">Retirada</Badge>
    ) : (
      <Badge variant="outline">Devolução</Badge>
    )
  }

  const getStatusBadge = (hasIssues: boolean) => {
    return hasIssues ? (
      <Badge variant="destructive">Com Problemas</Badge>
    ) : (
      <Badge variant="default" className="bg-primary">
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
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade registrada</p>
          ) : (
            history.map((item) => (
              <div key={item.id} className="flex items-center justify-between space-x-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.employee.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.equipment.name} ({item.equipment.code})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(item.createdAt, {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {getActionBadge(item.action)}
                  {getStatusBadge(item.hasIssues)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
