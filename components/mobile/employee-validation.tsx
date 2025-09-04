// components/mobile/employee-validation.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            ConfereAI
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Digite sua matrícula para acessar o checklist
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                type="text"
                placeholder="Ex: 12345"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                disabled={loading}
                className="text-center text-lg font-mono"
                autoFocus
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !matricula.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                'Continuar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}