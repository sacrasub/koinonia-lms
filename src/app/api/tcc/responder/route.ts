import { NextResponse } from 'next/server';
import { getActiveSurveyForRole, submitSurveyAnswers } from '@/services/tccResearchService';
import { TCCSubmitAnswerPayload } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') || 'aluno') as 'aluno' | 'professor' | 'monitor' | 'admin';
    const email = searchParams.get('email') || '';

    const result = await getActiveSurveyForRole(role, email);
    return NextResponse.json({
      success: true,
      survey: result.survey,
      alreadyAnswered: result.alreadyAnswered,
    });
  } catch (error: any) {
    console.error('Erro na API /api/tcc/responder (GET):', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao carregar questionário ativo' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload: TCCSubmitAnswerPayload = await request.json();

    if (!payload.pesquisa_id || !payload.respostas || payload.respostas.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Payload incompleto para registro de respostas.' },
        { status: 400 }
      );
    }

    const result = await submitSurveyAnswers(payload);
    return NextResponse.json({
      success: true,
      message: 'Respostas registradas com sucesso no banco de dados do TCC.',
      count: result.count,
    });
  } catch (error: any) {
    console.error('Erro na API /api/tcc/responder (POST):', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao submeter respostas' },
      { status: 500 }
    );
  }
}
