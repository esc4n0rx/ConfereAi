// app/api/checklist/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ChecklistAPI } from '@/lib/api/checklist'
import type { CreateChecklistData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { photos, ...checklistData }: CreateChecklistData & { photos: string[] } = body

    // Criar o checklist primeiro
    const checklist = await ChecklistAPI.createChecklist(checklistData)

    // Se há fotos, fazer upload e associar ao checklist
    if (photos && photos.length > 0) {
      try {
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

        // Converter base64 para Blob e adicionar ao FormData
        for (let i = 0; i < photos.length; i++) {
          const photoBase64 = photos[i]
          
          try {
            // Remover prefixo data:image/...;base64, se existir
            const base64Data = photoBase64.includes(',') 
              ? photoBase64.split(',')[1] 
              : photoBase64

            // Converter base64 para Blob
            const byteCharacters = atob(base64Data)
            const byteNumbers = new Array(byteCharacters.length)
            
            for (let j = 0; j < byteCharacters.length; j++) {
              byteNumbers[j] = byteCharacters.charCodeAt(j)
            }
            
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: 'image/jpeg' })
            
            formData.append('files', blob, `photo_${i + 1}_${Date.now()}.jpg`)
          } catch (photoConvertError) {
            console.error(`Erro ao converter foto ${i + 1}:`, photoConvertError)
            continue
          }
        }

        const uploadResponse = await fetch(
          `${process.env.UPLOAD_API_URL}/upload/confereai_${checklist.codigo}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.UPLOAD_API_TOKEN}`
            },
            body: formData
          }
        )

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          const files = uploadResult.files || []
          
          // Construir URLs das fotos
          files.forEach((filename: string) => {
            photoUrls.push(`${process.env.UPLOAD_API_URL}/files/confereai_${checklist.codigo}/${filename}`)
          })

          // Salvar URLs no banco
          if (photoUrls.length > 0) {
            await ChecklistAPI.addPhotosToChecklist(checklist.id, photoUrls)
          }
        } else {
          console.error('Erro no upload das fotos:', await uploadResponse.text())
        }
      } catch (photoError) {
        console.error('Erro ao processar fotos:', photoError)
        // Continuar mesmo se houver erro nas fotos
      }
    }

    return NextResponse.json({ 
      success: true, 
      checklist: {
        id: checklist.id,
        codigo: checklist.codigo
      }
    })
  } catch (error) {
    console.error('Erro ao submeter checklist:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}