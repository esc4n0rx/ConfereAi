// app/checklist/[token]/error.tsx
"use client"

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-8 space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ocorreu um erro inesperado. Tente novamente.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={reset}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}