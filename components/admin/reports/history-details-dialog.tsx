"use client"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { ChecklistHistory } from "@/lib/types"

interface HistoryDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  history: ChecklistHistory | null
}

export function HistoryDetailsDialog({ open, onOpenChange, history }: HistoryDetailsDialogProps) {
  if (!history) return null

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Checklist</DialogTitle>
          <DialogDescription>
            {history.createdAt.toLocaleDateString("pt-BR")} às{" "}
            {history.createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Funcionário</h3>
              <div className="space-y-1">
                <p className="font-medium">{history.employee.name}</p>
                <p className="text-sm text-muted-foreground">{history.employee.position}</p>
                <p className="text-xs text-muted-foreground font-mono">ID: {history.employee.id}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Equipamento</h3>
              <div className="space-y-1">
                <p className="font-medium">{history.equipment.name}</p>
                <p className="text-sm text-muted-foreground font-mono">{history.equipment.code}</p>
                <p className="text-xs text-muted-foreground">{history.equipment.description}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Ação Realizada</h3>
              <p className="text-sm text-muted-foreground">
                {history.action === "taking" ? "Retirada de equipamento" : "Devolução de equipamento"}
              </p>
            </div>
            <div className="flex gap-2">
              {getActionBadge(history.action)}
              {getStatusBadge(history.hasIssues)}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Respostas do Checklist</h3>
            <div className="space-y-3">
              {Object.entries(history.responses).map(([itemId, response]) => (
                <div key={itemId} className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">Item {itemId}:</span>
                    <div className="text-sm">
                      {typeof response === "boolean" ? (
                        <Badge variant={response ? "default" : "destructive"}>{response ? "Sim" : "Não"}</Badge>
                      ) : typeof response === "number" ? (
                        <span className="font-mono">{response}</span>
                      ) : (
                        <span className="italic">"{response}"</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {history.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Observações</h3>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">{history.notes}</p>
                </div>
              </div>
            </>
          )}

          {history.hasIssues && (
            <>
              <Separator />
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <h3 className="font-semibold text-destructive mb-2">Problemas Identificados</h3>
                <p className="text-sm text-muted-foreground">
                  Este checklist foi marcado como tendo problemas baseado nas respostas fornecidas. Verifique as
                  respostas acima e as observações para mais detalhes.
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
