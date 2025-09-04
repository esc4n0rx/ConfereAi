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
    <div className="mobile-container bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="mobile-content flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="text-center pb-6 bg-white">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                ConfereAI
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Digite sua matrícula para acessar o checklist
              </p>
            </CardHeader>
            
            <CardContent className="p-6 bg-white">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="matricula" className="text-sm font-medium text-gray-700">
                    Matrícula
                  </Label>
                  <Input
                    id="matricula"
                    type="text"
                    placeholder="Digite sua matrícula"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    disabled={loading}
                    className="text-center text-lg font-mono h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-200"
                    autoFocus
                    autoComplete="off"
                    inputMode="numeric"
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200" 
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
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Acesso seguro e criptografado
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}