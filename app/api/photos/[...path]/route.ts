// app/api/photos/[...path]/route.ts (continuação)
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
 request: NextRequest,
 { params }: { params: { path: string[] } }
) {
 try {
   const { path } = params
   
   if (!path || path.length < 2) {
     return NextResponse.json(
       { error: 'Caminho da foto inválido' },
       { status: 400 }
     )
   }

   const [folder, filename] = path
   const uploadApiUrl = process.env.UPLOAD_API_URL
   const uploadApiToken = process.env.UPLOAD_API_TOKEN

   if (!uploadApiUrl || !uploadApiToken) {
     return NextResponse.json(
       { error: 'Configuração de upload não encontrada' },
       { status: 500 }
     )
   }

   // Fazer requisição para a API de upload
   const response = await fetch(
     `${uploadApiUrl}/files/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`,
     {
       headers: {
         'Authorization': `Bearer ${uploadApiToken}`
       }
     }
   )

   if (!response.ok) {
     if (response.status === 404) {
       return NextResponse.json(
         { error: 'Arquivo não encontrado' },
         { status: 404 }
       )
     }
     throw new Error(`Erro na API de upload: ${response.status}`)
   }

   // Obter o blob da imagem
   const imageBlob = await response.blob()
   
   // Retornar a imagem com headers apropriados
   return new NextResponse(imageBlob, {
     headers: {
       'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
       'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
       'Content-Disposition': `inline; filename="${filename}"`
     }
   })
 } catch (error) {
   console.error('Erro ao servir foto:', error)
   return NextResponse.json(
     { error: 'Erro interno do servidor' },
     { status: 500 }
   )
 }
}