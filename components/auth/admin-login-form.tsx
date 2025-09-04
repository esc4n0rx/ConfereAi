"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AuthService } from "@/lib/auth"
import { Shield, Building2 } from "lucide-react"

export function AdminLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("[v0] Attempting login with:", email)
      const user = await AuthService.authenticateAdmin(email, password)
      console.log("[v0] Login result:", user)

      if (user) {
        console.log("[v0] Login successful, waiting for session to persist...")
        setTimeout(() => {
          const sessionExists = typeof window !== "undefined" && localStorage.getItem("admin_session")
          console.log("[v0] Session persisted:", !!sessionExists)
          if (sessionExists) {
            console.log("[v0] Redirecting to /admin")
            router.push("/admin")
          } else {
            console.log("[v0] Session not found, retrying...")
            setTimeout(() => router.push("/admin"), 500)
          }
        }, 600) // Increased delay to match AuthGuard timing
      } else {
        setError("Credenciais inválidas. Verifique seu email e senha.")
      }
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Sistema de Controle</h1>
          <p className="text-muted-foreground">Equipamentos e Checklists</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-6 w-6 text-primary mr-2" />
              <CardTitle className="text-xl font-semibold">Acesso Administrativo</CardTitle>
            </div>
            <CardDescription>Entre com suas credenciais para acessar o painel</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm font-medium text-primary mb-2">Credenciais de Demonstração:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <strong>Email:</strong> admin@empresa.com
                </p>
                <p>
                  <strong>Senha:</strong> admin123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">Desenvolvido para controle eficiente de equipamentos</p>
        </div>
      </div>
    </div>
  )
}
