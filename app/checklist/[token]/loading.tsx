// app/checklist/[token]/loading.tsx
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}