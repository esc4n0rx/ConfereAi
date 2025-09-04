// components/admin/reports/history-table.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { 
  History, 
  Search, 
  Calendar, 
  User, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react"
import type { ChecklistData } from "@/lib/types"

export function HistoryTable() {
  const [checklists, setChecklists] = useState<ChecklistData[]>([])
  const [filteredChecklists, setFilteredChecklists] = useState<ChecklistData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<'all' | 'taking' | 'returning'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'with_issues' | 'normal'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadChecklists()
  }, [])

  useEffect(() => {
    filterChecklists()
  }, [checklists, searchTerm, actionFilter, statusFilter])

  const loadChecklists = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch('/api/checklist')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar histórico')
      }

      setChecklists(result.checklists || [])
    } catch (err: any) {
      console.error('Erro ao carregar histórico:', err)
      setError(err.message || 'Erro ao carregar histórico')
    } finally {
      setLoading(false)
    }
  }

  const filterChecklists = () => {
    let filtered = checklists

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(checklist => 
        checklist.employee.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        checklist.equipment.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        checklist.codigo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por ação
    if (actionFilter !== 'all') {
      filtered = filtered.filter(checklist => checklist.action === actionFilter)
    }

    // Filtro por status
    if (statusFilter === 'with_issues') {
      filtered = filtered.filter(checklist => checklist.has_issues)
    } else if (statusFilter === 'normal') {
      filtered = filtered.filter(checklist => !checklist.has_issues)
    }

    setFilteredChecklists(filtered)
  }

  const getActionBadge = (action: 'taking' | 'returning') => {
    if (action === 'taking') {
      return <Badge className="bg-blue-600">Retirada</Badge>
    }
    return <Badge className="bg-green-600">Devolução</Badge>
  }

  const getStatusBadge = (hasIssues: boolean) => {
    if (hasIssues) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="w-3 h-3" />
          Com Problemas
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="gap-1 bg-green-600">
        <CheckCircle className="w-3 h-3" />
        Normal
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Carregando histórico...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Atividades ({filteredChecklists.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por funcionário, equipamento ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as any)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">Todas as ações</option>
            <option value="taking">Retiradas</option>
            <option value="returning">Devoluções</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">Todos os status</option>
            <option value="normal">Normal</option>
            <option value="with_issues">Com problemas</option>
          </select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Funcionário</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data/Hora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChecklists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {checklists.length === 0 
                      ? "Nenhuma atividade registrada ainda."
                      : "Nenhuma atividade encontrada com os filtros aplicados."
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredChecklists.map((checklist) => (
                  <TableRow key={checklist.id}>
                    <TableCell className="font-mono text-xs">
                      {checklist.codigo}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{checklist.employee.nome}</div>
                        <div className="text-xs text-gray-500">{checklist.employee.cargo}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                       <div className="font-medium">{checklist.equipment.nome}</div>
                       <div className="text-xs text-gray-500">{checklist.equipment.codigo}</div>
                     </div>
                   </TableCell>
                   <TableCell>
                     {getActionBadge(checklist.action)}
                   </TableCell>
                   <TableCell>
                     {getStatusBadge(checklist.has_issues)}
                   </TableCell>
                   <TableCell className="text-xs">
                     {formatDate(checklist.device_timestamp)}
                   </TableCell>
                 </TableRow>
               ))
             )}
           </TableBody>
         </Table>
       </div>

       {filteredChecklists.length > 0 && (
         <div className="mt-4 text-sm text-muted-foreground">
           Mostrando {filteredChecklists.length} de {checklists.length} registro(s)
         </div>
       )}
     </CardContent>
   </Card>
 )
}