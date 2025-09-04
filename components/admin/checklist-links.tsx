"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, Link, QrCode, Share2 } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import { toast } from "sonner"

export function ChecklistLinks() {
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const employees = dataStore.getEmployees()

  const generateChecklistLink = (employeeId: string) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    return `${baseUrl}/checklist/portal?employee=${employeeId}`
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Link copiado para a área de transferência!")
    } catch (err) {
      toast.error("Erro ao copiar link")
    }
  }

  const shareLink = async (link: string, employeeName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Link do Checklist de Equipamentos",
          text: `Link para ${employeeName} acessar o checklist de equipamentos`,
          url: link,
        })
      } catch (err) {
        copyToClipboard(link)
      }
    } else {
      copyToClipboard(link)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Links de Acesso ao Checklist
        </CardTitle>
        <CardDescription>Gere e compartilhe links diretos para funcionários acessarem o checklist</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="employee-select">Selecionar Funcionário</Label>
          <select
            id="employee-select"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full p-2 border rounded-md bg-background"
          >
            <option value="">Escolha um funcionário...</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} - {employee.position}
              </option>
            ))}
          </select>
        </div>

        {selectedEmployee && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Link Gerado:</span>
              <Badge variant="secondary">Ativo</Badge>
            </div>

            <div className="flex items-center gap-2">
              <Input value={generateChecklistLink(selectedEmployee)} readOnly className="font-mono text-xs" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(generateChecklistLink(selectedEmployee))}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const employee = employees.find((e) => e.id === selectedEmployee)
                  if (employee) {
                    shareLink(generateChecklistLink(selectedEmployee), employee.name)
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // In a real app, this would generate a QR code
                  toast.info("Funcionalidade de QR Code em desenvolvimento")
                }}
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              💡 Envie este link diretamente para o funcionário via WhatsApp, email ou SMS
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
          <strong>Como usar:</strong>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>Selecione o funcionário acima</li>
            <li>Copie o link gerado ou use o botão compartilhar</li>
            <li>Envie o link para o funcionário</li>
            <li>O funcionário acessa diretamente o checklist no celular</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}
