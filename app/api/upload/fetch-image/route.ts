// app/api/upload/fetch-image/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL da imagem é obrigatória' },
        { status: 400 }
      )
    }

    const uploadApiUrl = process.env.UPLOAD_API_URL
    const uploadApiToken = process.env.UPLOAD_API_TOKEN

    console.log('🔧 Configuração Debug:', {
      uploadApiUrl: uploadApiUrl ? `${uploadApiUrl.substring(0, 30)}...` : 'undefined',
      hasToken: !!uploadApiToken,
      requestedUrl: imageUrl
    })

    if (!uploadApiToken) {
      return NextResponse.json(
        { error: 'Token de upload não configurado' },
        { status: 500 }
      )
    }

    // Extrair informações da URL para debug
    try {
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/')
      console.log('🔍 Análise da URL:', {
        fullUrl: imageUrl,
        hostname: url.hostname,
        pathname: url.pathname,
        pathParts: pathParts,
        expectedFormat: '/files/folder/filename'
      })
    } catch (urlError) {
      console.error('❌ URL inválida:', urlError)
      return NextResponse.json(
        { error: 'URL da imagem inválida' },
        { status: 400 }
      )
    }

    console.log('🖼️ Fazendo requisição para:', imageUrl)
    console.log('🔑 Usando token:', uploadApiToken ? `${uploadApiToken.substring(0, 10)}...` : 'undefined')

    // Fazer requisição para a API externa com token de autorização
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${uploadApiToken}`,
        'User-Agent': 'ConfereAI-App/1.0'
      }
    })

    console.log('📡 Resposta da API:', { 
      status: response.status, 
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      console.error('❌ Erro ao buscar imagem:', { 
        status: response.status, 
        statusText: response.statusText,
        url: imageUrl
      })

      // Tentar obter mais detalhes do erro
      let errorDetails = 'Erro desconhecido'
      try {
        const errorText = await response.text()
        errorDetails = errorText
        console.error('📄 Detalhes do erro:', errorText)
      } catch (e) {
        console.error('❌ Não foi possível ler detalhes do erro')
      }
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Imagem não encontrada', details: errorDetails },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: `Erro na API de upload: ${response.status}`, details: errorDetails },
        { status: response.status }
      )
    }

    // Obter o blob da imagem
    const imageBlob = await response.blob()
    console.log('✅ Imagem carregada com sucesso:', { 
      size: imageBlob.size, 
      type: imageBlob.type,
      url: imageUrl
    })
    
    // Retornar a imagem com headers apropriados
    return new NextResponse(imageBlob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': imageBlob.size.toString()
      }
    })
  } catch (error) {
    console.error('💥 Erro geral ao buscar imagem:', {
      error: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}