import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// GET /api/portfolio?aluno_email=&disciplina_id=
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const aluno_email = searchParams.get('aluno_email');
  const disciplina_id = searchParams.get('disciplina_id');
  const role = searchParams.get('role') || 'aluno';

  try {
    let query = supabase
      .from('portfolios')
      .select(`
        *,
        rubricas:rubricas_feedback (
          id,
          criterio_nome,
          criterio_descricao,
          nivel_desempenho,
          nota_atribuida,
          peso_criterio,
          feedback_qualitativo_tutor,
          monitor_nome,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    // Aluno só vê seus próprios portfólios; monitor/professor vê todos da disciplina
    if (role === 'aluno' && aluno_email) {
      query = query.eq('aluno_email', aluno_email);
    }

    if (disciplina_id) {
      query = query.eq('disciplina_id', disciplina_id);
    } else if (aluno_email && role !== 'aluno') {
      query = query.eq('aluno_email', aluno_email);
    }

    const { data: portfolios, error } = await query;

    if (error) throw error;

    return NextResponse.json({ portfolios: portfolios || [] });
  } catch (error: any) {
    console.error('Erro ao buscar portfólios:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/portfolio — Aluno cadastra metadados do artefato
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      aluno_email,
      aluno_nome,
      disciplina_id,
      disciplina_name,
      titulo_artefato,
      descricao_artefato,
      tipo_artefato,
      url_artefato_drive,
      drive_file_id,
      autoavaliacao_texto,
      semana_referencia,
      avaliacao_tipo,
    } = body;

    if (!aluno_email || !disciplina_id || !titulo_artefato || !tipo_artefato) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: aluno_email, disciplina_id, titulo_artefato, tipo_artefato' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        aluno_email,
        aluno_nome,
        disciplina_id,
        disciplina_name: disciplina_name || '',
        titulo_artefato,
        descricao_artefato,
        tipo_artefato: tipo_artefato || 'ensaio',
        url_artefato_drive,
        drive_file_id,
        autoavaliacao_texto,
        status: url_artefato_drive ? 'enviado' : 'rascunho',
        semana_referencia: semana_referencia || null,
        avaliacao_tipo: avaliacao_tipo || 'AV1',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ portfolio: data }, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar portfólio:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
