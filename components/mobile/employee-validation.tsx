// components/mobile/employee-validation.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { User, Loader2, AlertCircle } from 'lucide-react'

interface EmployeeValidationProps {
  onValidate: (matricula: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function EmployeeValidation({ onValidate, loading, error }: EmployeeValidationProps) {
  const [matricula, setMatricula] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (matricula.trim()) {
      await onValidate(matricula.trim())
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">
          Portal de Checklist
        </CardTitle>
        <CardDescription>
          Digite sua matrícula para iniciar.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="matricula" className="text-base">
              Matrícula
            </Label>
            <Input
              id="matricula"
              type="text"
              placeholder="Sua matrícula de funcionário"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              disabled={loading}
              className="text-center text-lg h-12"
              autoFocus
              autoComplete="off"
              inputMode="numeric"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full h-12 text-lg"
            disabled={loading || !matricula.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              'Continuar'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}