// components/admin/checklist-links.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, Link, QrCode, Share2, ExternalLink, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export function ChecklistLinks() {
  const [permanentLink, setPermanentLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [tokenExists, setTokenExists] = useState(false)

  useEffect(() => {
    checkExistingToken()
  }, [])

  const checkExistingToken = async () => {
    try {
      const response = await fetch('/api/checklist/tokens')
      const result = await response.json()

      if (result.success && result.token) {
        const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
        setPermanentLink(`${baseUrl}/preecher-checklist`)
        setTokenExists(true)
      }
    } catch (error) {
      console.error('Erro ao verificar token existente:', error)
    }
  }

  const generatePermanentLink = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/checklist/tokens', {
        method: 'POST'
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao gerar link')
      }

      const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
      const link = `${baseUrl}/preecher-checklist`
      
      setPermanentLink(link)
      setTokenExists(true)
      toast.success("Link permanente gerado com sucesso!")
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar link")
    } finally {
      setLoading(false)
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
          Link Permanente do Checklist Mobile
        </CardTitle>
        <CardDescription>
          Gere um link permanente para funcionários acessarem o checklist via celular
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!tokenExists ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Clique no botão abaixo para gerar um link permanente que funcionários podem usar
              para preencher checklists de equipamentos.
            </p>
            <Button 
              onClick={generatePermanentLink}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Gerando link...
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Gerar Link Permanente
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Link Permanente Ativo</p>
                <p className="text-sm text-green-600">Este link nunca expira e pode ser compartilhado</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="permanent-link">Link Permanente</Label>
              <div className="flex gap-2">
                <Input
                  id="permanent-link"
                  value={permanentLink}
                  readOnly
                  className="bg-gray-50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(permanentLink)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => shareLink(permanentLink)}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open(permanentLink, '_blank')}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Testar Link
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">Como usar:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Compartilhe este link com funcionários</li>
                <li>• O link funciona em qualquer dispositivo (celular/computador)</li>
                <li>• Funcionários podem salvar como favorito</li>
                <li>• Link nunca expira, sempre disponível</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}