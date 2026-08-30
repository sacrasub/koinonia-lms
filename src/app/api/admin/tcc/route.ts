import { NextResponse } from 'next/server';
import { 
  getAllSurveys, 
  getSurveyStats, 
  createSurvey, 
  toggleSurveyStatus, 
  deleteSurvey 
} from '@/services/tccResearchService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get('surveyId') || undefined;

    const stats = await getSurveyStats(surveyId);
    const allSurveys = await getAllSurveys();

    return NextResponse.json({
      success: true,
      stats,
      allSurveys,
    });
  } catch (error: any) {
    console.error('Erro na API /api/admin/tcc (GET):', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar dados do TCC' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, surveyData, perguntas, surveyId, ativa } = body;

    if (action === 'toggle_status' && surveyId) {
      await toggleSurveyStatus(surveyId, Boolean(ativa));
      return NextResponse.json({ success: true, message: 'Status atualizado com sucesso' });
    }

    if (action === 'delete' && surveyId) {
      await deleteSurvey(surveyId);
      return NextResponse.json({ success: true, message: 'Pesquisa removida com sucesso' });
    }

    if (!surveyData || !surveyData.titulo) {
      return NextResponse.json(
        { success: false, error: 'Título da pesquisa é obrigatório.' },
        { status: 400 }
      );
    }

    const created = await createSurvey(surveyData, perguntas || []);
    return NextResponse.json({ success: true, survey: created });
  } catch (error: any) {
    console.error('Erro na API /api/admin/tcc (POST):', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar requisição do TCC' },
      { status: 500 }
    );
  }
}
