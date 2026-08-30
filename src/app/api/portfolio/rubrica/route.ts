import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// POST /api/portfolio/rubrica — Monitor/Professor submete rubrica de avaliação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      portfolio_id,
      criterio_nome,
      criterio_descricao,
      nivel_desempenho,
      nota_atribuida,
      peso_criterio,
      feedback_qualitativo_tutor,
      monitor_email,
      monitor_nome,
    } = body;

    if (!portfolio_id || !criterio_nome || nota_atribuida === undefined || !feedback_qualitativo_tutor || !monitor_email) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: portfolio_id, criterio_nome, nota_atribuida, feedback_qualitativo_tutor, monitor_email' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('rubricas_feedback')
      .insert({
        portfolio_id,
        criterio_nome,
        criterio_descricao,
        nivel_desempenho,
        nota_atribuida,
        peso_criterio: peso_criterio || 1.0,
        feedback_qualitativo_tutor,
        monitor_email,
        monitor_nome,
      })
      .select()
      .single();

    if (error) throw error;

    // Atualiza status do portfólio para 'avaliado'
    await supabase
      .from('portfolios')
      .update({ status: 'avaliado', updated_at: new Date().toISOString() })
      .eq('id', portfolio_id);

    // Calcula nota final média ponderada de todas as rubricas
    const { data: todasRubricas } = await supabase
      .from('rubricas_feedback')
      .select('nota_atribuida, peso_criterio')
      .eq('portfolio_id', portfolio_id);

    if (todasRubricas && todasRubricas.length > 0) {
      const totalPeso = todasRubricas.reduce((sum: number, r: any) => sum + (r.peso_criterio || 1), 0);
      const notaPonderada = todasRubricas.reduce((sum: number, r: any) => sum + (r.nota_atribuida * (r.peso_criterio || 1)), 0) / totalPeso;

      await supabase
        .from('portfolios')
        .update({ nota_final: Math.round(notaPonderada * 100) / 100 })
        .eq('id', portfolio_id);
    }

    return NextResponse.json({ rubrica: data }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar rubrica:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/portfolio/rubrica?portfolio_id=
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const portfolio_id = searchParams.get('portfolio_id');

  if (!portfolio_id) {
    return NextResponse.json({ error: 'portfolio_id é obrigatório' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('rubricas_feedback')
      .select('*')
      .eq('portfolio_id', portfolio_id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ rubricas: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
