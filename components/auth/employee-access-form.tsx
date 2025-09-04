"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EmployeesAPI } from "@/lib/api/employees"

export function EmployeeAccessForm() {
  const [matricula, setMatricula] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!matricula.trim()) {
        setError("Por favor, digite sua matrícula.")
        return
      }

      // Buscar funcionário pela matrícula
      const employee = await EmployeesAPI.getEmployeeByMatricula(matricula.trim())
      
      if (!employee) {
        setError("Matrícula não encontrada. Verifique se digitou corretamente.")
        return
      }

      // Store employee ID for the session
      sessionStorage.setItem("employee_id", employee.id)
      router.push(`/checklist/portal?employee=${employee.id}`)
    } catch (err: any) {
      console.error('Erro ao verificar matrícula:', err)
      setError("Erro ao verificar matrícula. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Portal de Checklists</CardTitle>
          <CardDescription>Digite sua matrícula para acessar os checklists de equipamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula do Funcionário</Label>
              <Input
                id="matricula"
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Digite sua matrícula (ex: 1001)"
                required
                className="text-center text-lg"
                maxLength={50}
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
              <strong>Para funcionários já cadastrados:</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Digite sua matrícula fornecida pelo administrador do sistema para acessar os checklists.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}