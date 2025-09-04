// app/preecher-checklist/page.tsx
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function PreencherChecklistPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para o token padrão
    router.replace('/checklist/preecher-checklist')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Redirecionando...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}