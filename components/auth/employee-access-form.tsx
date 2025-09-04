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

export function EmployeeAccessForm() {
  const [employeeId, setEmployeeId] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (AuthService.verifyEmployee(employeeId)) {
        // Store employee ID for the session
        sessionStorage.setItem("employee_id", employeeId)
        router.push(`/checklist/portal?employee=${employeeId}`)
      } else {
        setError("ID do funcionário inválido. Digite apenas números.")
      }
    } catch (err) {
      setError("Erro ao verificar ID. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Portal de Checklists</CardTitle>
          <CardDescription>Digite seu ID de funcionário para acessar os checklists de equipamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">ID do Funcionário</Label>
              <Input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Digite seu ID (ex: 123)"
                required
                className="text-center text-lg"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verificando..." : "Acessar Checklists"}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>IDs de teste:</strong>
            </p>
            <p className="text-xs text-muted-foreground">Use: 1, 2, ou 3 para testar o sistema</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
