"use client"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { dataStore } from "@/lib/data-store"
import type { Equipment, EquipmentStatus } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface EquipmentDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipment: Equipment | null
}

export function EquipmentDetailsDialog({ open, onOpenChange, equipment }: EquipmentDetailsDialogProps) {
  if (!equipment) return null

  const checklist = dataStore.getChecklistByEquipmentId(equipment.id)
  const history = dataStore
    .getHistory()
    .filter((h) => h.equipment.id === equipment.id)
    .slice(0, 5)

  const getStatusBadge = (status: EquipmentStatus) => {
    const variants = {
      available: { variant: "default" as const, label: "Disponível", className: "bg-primary" },
      "in-use": { variant: "secondary" as const, label: "Em Uso", className: "" },
      maintenance: { variant: "destructive" as const, label: "Manutenção", className: "" },
      retired: { variant: "outline" as const, label: "Aposentado", className: "" },
    }

    const config = variants[status]
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{equipment.name}</DialogTitle>
              <DialogDescription className="font-mono text-base">{equipment.code}</DialogDescription>
            </div>
            {getStatusBadge(equipment.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Descrição</h3>
            <p className="text-muted-foreground">{equipment.description}</p>
          </div>

          {equipment.photos.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Fotos</h3>
              <div className="grid grid-cols-2 gap-2">
                {equipment.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo || "/placeholder.svg"}
                    alt={`${equipment.name} - Foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Informações</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Criado em:</span>
                <p>{equipment.createdAt.toLocaleDateString("pt-BR")}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Atualizado em:</span>
                <p>{equipment.updatedAt.toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
          </div>

          {checklist && (
            <div>
              <h3 className="font-semibold mb-2">Checklist Configurado</h3>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">{checklist.items.length} itens configurados</p>
                <div className="space-y-1">
                  {checklist.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="text-sm">
                      • {item.label} ({item.type})
                    </div>
                  ))}
                  {checklist.items.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{checklist.items.length - 3} itens adicionais</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Histórico Recente</h3>
              <div className="space-y-2">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <p className="text-sm font-medium">{item.employee.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.action === "taking" ? "Retirou" : "Devolveu"} •{" "}
                        {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <Badge variant={item.hasIssues ? "destructive" : "default"}>
                      {item.hasIssues ? "Com Problemas" : "OK"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
