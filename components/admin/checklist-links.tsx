// components/admin/checklist-links.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, Link, QrCode, Share2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

export function ChecklistLinks() {
  const [generatedLink, setGeneratedLink] = useState("")
  const [generating, setGenerating] = useState(false)

  const generateChecklistLink = async () => {
    try {
      setGenerating(true)
      
      // Gerar token único
      const token = `checklist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
      const link = `${baseUrl}/checklist/${token}`
      
      setGeneratedLink(link)
      toast.success("Link gerado com sucesso!")
    } catch (error) {
      toast.error("Erro ao gerar link")
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Link copiado para a área de transferência!")
    } catch (err) {
      toast.error("Erro ao copiar link")
    }
  }

  const shareLink = async (link: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Link do Checklist de Equipamentos",
          text: "Link para acessar o checklist de equipamentos",
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
          Link de Acesso ao Checklist Mobile
        </CardTitle>
        <CardDescription>
          Gere links únicos para funcionários acessarem o checklist via celular
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <Button 
            onClick={generateChecklistLink}
            disabled={generating}
            className="w-full"
          >
            {generating ? "Gerando..." : "Gerar Novo Link"}
          </Button>

          {generatedLink && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="generated-link">Link Gerado</Label>
                <div className="flex gap-2">
                  <Input
                    id="generated-link"
                    value={generatedLink}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedLink)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareLink(generatedLink)}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(generatedLink, '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Testar
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>Como usar:</strong>
                </p>
                <ol className="text-xs text-blue-600 mt-1 space-y-1 ml-4">
                  <li>1. Compartilhe este link com os funcionários</li>
                  <li>2. Funcionário acessa via celular e digita a matrícula</li>
                  <li>3. Escolhe se vai retirar ou devolver equipamento</li>
                  <li>4. Seleciona o equipamento e preenche o checklist</li>
                  <li>5. Adiciona fotos e observações se necessário</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}