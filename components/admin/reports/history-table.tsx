"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Eye } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import type { ChecklistHistory, ChecklistAction } from "@/lib/types"
import { HistoryDetailsDialog } from "./history-details-dialog"

export function HistoryTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<ChecklistAction | "all">("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "ok" | "issues">("all")
  const [selectedHistory, setSelectedHistory] = useState<ChecklistHistory | null>(null)

  const history = dataStore.getHistory()

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipment.code.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAction = actionFilter === "all" || item.action === actionFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "ok" && !item.hasIssues) ||
      (statusFilter === "issues" && item.hasIssues)

    return matchesSearch && matchesAction && matchesStatus
  })

  const getActionBadge = (action: ChecklistAction) => {
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

  const exportToCSV = () => {
    const headers = ["Data", "Funcionário", "Equipamento", "Código", "Ação", "Status", "Observações"]
    const csvContent = [
      headers.join(","),
      ...filteredHistory.map((item) =>
        [
          item.createdAt.toLocaleDateString("pt-BR"),
          `"${item.employee.name}"`,
          `"${item.equipment.name}"`,
          item.equipment.code,
          item.action === "taking" ? "Retirada" : "Devolução",
          item.hasIssues ? "Com Problemas" : "OK",
          `"${item.notes || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `historico-checklists-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Histórico de Checklists</span>
            <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por funcionário, equipamento ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={(value: ChecklistAction | "all") => setActionFilter(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Ações</SelectItem>
                <SelectItem value="taking">Retiradas</SelectItem>
                <SelectItem value="returning">Devoluções</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: "all" | "ok" | "issues") => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ok">Sem Problemas</SelectItem>
                <SelectItem value="issues">Com Problemas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {history.length === 0
                        ? "Nenhum histórico encontrado"
                        : "Nenhum resultado encontrado com os filtros aplicados"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.createdAt.toLocaleDateString("pt-BR")}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.createdAt.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.employee.name}</div>
                          <div className="text-sm text-muted-foreground">{item.employee.position}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.equipment.name}</div>
                          <div className="text-sm text-muted-foreground font-mono">{item.equipment.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(item.action)}</TableCell>
                      <TableCell>{getStatusBadge(item.hasIssues)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedHistory(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredHistory.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Mostrando {filteredHistory.length} de {history.length} registros
            </div>
          )}
        </CardContent>
      </Card>

      <HistoryDetailsDialog
        open={!!selectedHistory}
        onOpenChange={(open) => !open && setSelectedHistory(null)}
        history={selectedHistory}
      />
    </div>
  )
}
