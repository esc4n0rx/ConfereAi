"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Equipment, Employee, ChecklistAction } from "@/lib/types"

interface SuccessScreenProps {
  employee: Employee
  equipment: Equipment
  action: ChecklistAction
  hasIssues: boolean
}

export function SuccessScreen({ employee, equipment, action, hasIssues }: SuccessScreenProps) {
  const router = useRouter()

  const handleNewChecklist = () => {
    // Clear session and redirect to employee access
    sessionStorage.removeItem("employee_id")
    router.push("/checklist")
  }

  const handleGoHome = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {hasIssues ? (
              <AlertTriangle className="h-16 w-16 text-destructive" />
            ) : (
              <CheckCircle className="h-16 w-16 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {hasIssues ? "Checklist Concluído com Alertas" : "Checklist Concluído com Sucesso"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              {action === "taking" ? "Equipamento retirado com sucesso" : "Equipamento devolvido com sucesso"}
            </p>
            <div className="space-y-1">
              <p className="font-medium">{equipment.name}</p>
              <p className="text-sm text-muted-foreground font-mono">{equipment.code}</p>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Funcionário:</span>
              <span className="text-sm font-medium">{employee.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ação:</span>
              <Badge variant={action === "taking" ? "secondary" : "outline"}>
                {action === "taking" ? "Retirada" : "Devolução"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={hasIssues ? "destructive" : "default"}>{hasIssues ? "Com Problemas" : "OK"}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Data/Hora:</span>
              <span className="text-sm">{new Date().toLocaleString("pt-BR")}</span>
            </div>
          </div>

          {hasIssues && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <p className="text-sm text-destructive font-medium">Problemas detectados no equipamento</p>
              <p className="text-xs text-muted-foreground mt-1">
                O administrador foi notificado sobre os problemas identificados.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button onClick={handleNewChecklist} className="w-full" size="lg">
              Fazer Novo Checklist
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full gap-2 bg-transparent">
              <Home className="h-4 w-4" />
              Voltar ao Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
