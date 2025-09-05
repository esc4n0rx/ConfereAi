// app/api/checklist/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ChecklistAPI } from '@/lib/api/checklist'
import { ChecklistApprovalAPI } from '@/lib/api/checklist-approval'
import type { ChecklistData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    // Melhor tratamento de parsing do JSON
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError)
      return NextResponse.json(
        { error: 'Dados inválidos enviados. Verifique o formato da requisição.' },
        { status: 400 }
      )
    }

    const { 
      photos, 
      equipment_status,
      is_equipment_ready,
      ...checklistData 
    }: ChecklistData & { 
      photos: string[]
      equipment_status: string
      is_equipment_ready: boolean
    } = body

    // Validação dos dados obrigatórios
    if (!checklistData.employee_id || !checklistData.equipment_id || !checklistData.action) {
      return NextResponse.json(
        { error: 'Dados obrigatórios ausentes (employee_id, equipment_id, action)' },
        { status: 400 }
      )
    }

    // Validação das fotos (deve ter exatamente 3)
    if (!photos || photos.length !== 3) {
      return NextResponse.json(
        { error: 'São obrigatórias exatamente 3 fotos do equipamento' },
        { status: 400 }
      )
    }

    // Criar o checklist primeiro
    const checklist = await ChecklistAPI.createChecklist({
      ...checklistData,
      equipment_status,
      is_equipment_ready
    })

    // Upload das fotos e associação ao checklist
    if (photos && photos.length > 0) {
      try {
        // Validar se a API de upload está configurada
        if (!process.env.UPLOAD_API_URL || !process.env.UPLOAD_API_TOKEN) {
          console.warn('API de upload não configurada. Salvando checklist sem fotos.')
        } else {
          const uploadResults = await uploadPhotos(photos, checklist.codigo)
          
          // Salvar as fotos no banco de dados
          if (uploadResults.length > 0) {
            await ChecklistAPI.savePhotos(checklist.id, uploadResults)
            console.log(`${uploadResults.length} fotos salvas com sucesso para checklist ${checklist.id}`)
          }
        }
      } catch (uploadError) {
        console.error('Erro no upload das fotos:', uploadError)
        // Não falhar o checklist por causa do upload, mas logar o erro
        console.warn(`Checklist ${checklist.codigo} criado sem fotos devido ao erro: ${uploadError.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      checklist: {
        id: checklist.id,
        codigo: checklist.codigo,
        status: 'pending',
        approval_status: 'pending'
      },
      message: 'Checklist enviado com sucesso! Os encarregados foram notificados e você receberá uma resposta em breve.'
    })

  } catch (error: any) {
    console.error('Erro ao enviar checklist:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

async function uploadPhotos(photosBase64: string[], checklistCode: string): Promise<Array<{url: string, order: number}>> {
  const uploadApiUrl = process.env.UPLOAD_API_URL
  const uploadApiToken = process.env.UPLOAD_API_TOKEN
  const uploadResults: Array<{url: string, order: number}> = []

  if (!uploadApiUrl || !uploadApiToken) {
    throw new Error('Configuração de upload não encontrada')
  }

  // Criar nome da pasta seguindo o padrão existente
  const folderName = `confereai_${checklistCode}_${Date.now()}`
  
  try {
    // Passo 1: Criar a pasta
    console.log(`Criando pasta: ${folderName}`)
    
    const createFolderResponse = await fetch(`${uploadApiUrl}/folder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${uploadApiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName
      })
    })

    if (!createFolderResponse.ok) {
      const errorText = await createFolderResponse.text()
      console.error('Erro ao criar pasta:', errorText)
      throw new Error(`Erro ao criar pasta: ${createFolderResponse.status} ${createFolderResponse.statusText}`)
    }

    console.log(`Pasta ${folderName} criada com sucesso`)

    // Passo 2: Upload das fotos para a pasta criada
    for (let i = 0; i < photosBase64.length; i++) {
      try {
        const base64Data = photosBase64[i]
        
        // Extrair o tipo MIME e os dados da string base64
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
        if (!matches || matches.length !== 3) {
          throw new Error(`Formato base64 inválido para foto ${i + 1}`)
        }

        const mimeType = matches[1]
        const imageData = matches[2]
        
        // Converter base64 para buffer
        const buffer = Buffer.from(imageData, 'base64')
        
        // Gerar nome único para o arquivo seguindo o padrão existente
        const timestamp = Date.now()
        const extension = mimeType.split('/')[1] || 'jpg'
        const filename = `${timestamp}-photo_${i + 1}_${timestamp}.${extension}`
        
        // Criar FormData para envio multipart
        const formData = new FormData()
        const blob = new Blob([buffer], { type: mimeType })
        formData.append('files', blob, filename) // Usar 'files' conforme documentação
        
        console.log(`Fazendo upload da foto ${i + 1}: ${filename} para pasta ${folderName}`)

        // Fazer upload para a pasta específica usando a rota correta
        const uploadResponse = await fetch(`${uploadApiUrl}/upload/${encodeURIComponent(folderName)}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${uploadApiToken}`
            // Não definir Content-Type - deixar o browser definir para multipart/form-data
          },
          body: formData
        })

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error(`Erro no upload da foto ${i + 1}:`, errorText)
          throw new Error(`Erro no upload da foto ${i + 1}: ${uploadResponse.status} ${uploadResponse.statusText}`)
        }

        const uploadResult = await uploadResponse.json()
        console.log(`Upload da foto ${i + 1} concluído:`, uploadResult)
        
        // CORRIGIDO: Gerar URL no formato da API externa (não mais /api/photos)
        const photoUrl = `${uploadApiUrl}/files/${folderName}/${filename}`
        
        uploadResults.push({
          url: photoUrl,
          order: i + 1
        })

      } catch (error) {
        console.error(`Erro ao fazer upload da foto ${i + 1}:`, error)
        throw new Error(`Falha no upload da foto ${i + 1}: ${error.message}`)
      }
    }

    console.log(`Upload concluído. ${uploadResults.length} fotos enviadas para pasta ${folderName}`)
    return uploadResults

  } catch (error) {
    console.error('Erro no processo de upload:', error)
    throw error
  }
}