// app/api/checklist/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ChecklistAPI } from '@/lib/api/checklist'
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

    // Se há fotos, fazer upload e associar ao checklist
    if (photos && photos.length > 0) {
      try {
        // Validar se a API de upload está configurada
        if (!process.env.UPLOAD_API_URL || !process.env.UPLOAD_API_TOKEN) {
          console.warn('API de upload não configurada. Salvando checklist sem fotos.')
        } else {
          // Criar pasta no upload API
          const folderResponse = await fetch(process.env.UPLOAD_API_URL + '/folder', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.UPLOAD_API_TOKEN}`
            },
            body: JSON.stringify({
              name: `confereai_${checklist.codigo}`
            })
          })

          if (!folderResponse.ok) {
            console.error('Erro ao criar pasta:', await folderResponse.text())
          }

          // Upload das fotos
          const photoUrls: string[] = []
          const formData = new FormData()

          // Labels para as fotos baseado na ordem
          const photoLabels = [
            'numero_serie',
            'painel_equipamento', 
            'equipamento_completo'
          ]

          // Converter base64 para Blob e adicionar ao FormData
          for (let i = 0; i < photos.length; i++) {
            const photoBase64 = photos[i]
            
            try {
              // Remover prefixo data:image/...;base64, se existir
              const base64Data = photoBase64.includes(',') 
                ? photoBase64.split(',')[1] 
                : photoBase64

              // Converter para Blob
              const byteCharacters = atob(base64Data)
              const byteNumbers = new Array(byteCharacters.length)
              for (let j = 0; j < byteCharacters.length; j++) {
                byteNumbers[j] = byteCharacters.charCodeAt(j)
              }
              const byteArray = new Uint8Array(byteNumbers)
              const blob = new Blob([byteArray], { type: 'image/jpeg' })

              // Adicionar ao FormData
              const filename = `${photoLabels[i] || `foto_${i + 1}`}.jpg`
              formData.append('files', blob, filename)
            } catch (conversionError) {
              console.error(`Erro ao converter foto ${i + 1}:`, conversionError)
              throw new Error(`Erro ao processar foto ${i + 1}`)
            }
          }

          // Fazer upload
          const uploadResponse = await fetch(process.env.UPLOAD_API_URL + '/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.UPLOAD_API_TOKEN}`
            },
            body: formData
          })

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json()
            console.log('Fotos enviadas com sucesso:', uploadResult)
          } else {
            console.error('Erro no upload das fotos:', await uploadResponse.text())
          }
        }
      } catch (uploadError) {
        console.error('Erro no processo de upload:', uploadError)
        // Não falhar a requisição por erro de upload
      }
    }

    // CORREÇÃO PRINCIPAL: Atualizar status do equipamento corretamente
    try {
      let newStatus: string
      
      if (checklistData.action === 'taking') {
        // Na retirada: equipamento deve ficar "em_uso"
        newStatus = 'em_uso'
      } else if (checklistData.action === 'returning') {
        // Na devolução: equipamento volta para "disponivel" se estiver OK, ou "manutencao" se tiver problemas
        newStatus = checklistData.has_issues ? 'manutencao' : 'disponivel'
      } else {
        throw new Error('Ação inválida')
      }

      // Atualizar status do equipamento
      await ChecklistAPI.updateEquipmentStatus(checklistData.equipment_id, newStatus)
      
      console.log(`Status do equipamento ${checklistData.equipment_id} atualizado para: ${newStatus}`)
    } catch (statusError) {
      console.error('Erro ao atualizar status do equipamento:', statusError)
      // Não falhar a requisição por isso, mas logar o erro
    }

    return NextResponse.json({ 
      success: true, 
      checklist: {
        id: checklist.id,
        codigo: checklist.codigo,
        equipment_status,
        is_equipment_ready
      }
    })
  } catch (error) {
    console.error('Erro ao submeter checklist:', error)
    
    // Retornar erro mais específico baseado no tipo
    let errorMessage = 'Erro interno do servidor'
    let statusCode = 500

    if (error instanceof SyntaxError) {
      errorMessage = 'Formato de dados inválido'
      statusCode = 400
    } else if (error instanceof TypeError) {
      errorMessage = 'Dados obrigatórios ausentes ou inválidos'
      statusCode = 400
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}