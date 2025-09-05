// app/api/checklist/submit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ChecklistAPI } from '@/lib/api/checklist'
import type { ChecklistData } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Removendo 'photos' do corpo da requisição e mantendo o resto dos dados
    const { 
      equipment_status,
      is_equipment_ready,
      ...checklistData 
    } = body as Omit<ChecklistData, 'photos'> & { 
      equipment_status: string;
      is_equipment_ready: boolean;
      photos?: unknown; // Para garantir que a propriedade seja removida
    };

    if (!checklistData.employee_id || !checklistData.equipment_id || !checklistData.action) {
      return NextResponse.json(
        { error: 'Dados obrigatórios ausentes (employee_id, equipment_id, action)' },
        { status: 400 }
      );
    }

    // Criar o checklist primeiro
    const checklist = await ChecklistAPI.createChecklist({
      ...checklistData,
      equipment_status,
      is_equipment_ready
    });

    // Gerar e salvar URLs de fotos fictícias
    const fakePhotos = [
      { url: `https://fakeimages.com/${checklist.codigo}/serie.jpg`, order: 1 },
      { url: `https://fakeimages.com/${checklist.codigo}/painel.jpg`, order: 2 },
      { url: `https://fakeimages.com/${checklist.codigo}/completo.jpg`, order: 3 },
    ];

    await ChecklistAPI.savePhotos(checklist.id, fakePhotos);
    console.log(`3 fotos fictícias salvas para o checklist ${checklist.id}`);

    return NextResponse.json({
      success: true,
      checklist: {
        id: checklist.id,
        codigo: checklist.codigo,
        status: 'approved', // Status já é aprovado
        approval_status: 'approved'
      },
      message: 'Checklist registrado e aprovado com sucesso! Os encarregados foram notificados.'
    });

  } catch (error: any) {
    console.error('Erro ao enviar checklist:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}