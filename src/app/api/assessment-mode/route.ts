import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { AssessmentMode } from '@/types';

// GET /api/assessment-mode?aluno_email=&semester=
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const aluno_email = searchParams.get('aluno_email');
  const semester = searchParams.get('semester') || '2026.2';

  if (!aluno_email) {
    return NextResponse.json({ error: 'aluno_email é obrigatório' }, { status: 400 });
  }

  try {
    // Busca ou cria matrícula do aluno
    let { data: matricula, error } = await supabase
      .from('alunos_matriculas')
      .select('*')
      .eq('aluno_email', aluno_email)
      .eq('semester', semester)
      .single();

    if (error && error.code === 'PGRST116') {
      // Não encontrado: cria registro padrão
      const { data: novoRegistro, error: insertError } = await supabase
        .from('alunos_matriculas')
        .insert({ aluno_email, semester, assessment_mode: 'SOFT_COMPENSATION' })
        .select()
        .single();

      if (insertError) throw insertError;
      matricula = novoRegistro;
    } else if (error) {
      throw error;
    }

    // Busca histórico de mudanças
    const { data: historico } = await supabase
      .from('historico_assessment_mode')
      .select('*')
      .eq('aluno_email', aluno_email)
      .eq('semester', semester)
      .order('changed_at', { ascending: false })
      .limit(10);

    return NextResponse.json({ matricula, historico: historico || [] });
  } catch (error: any) {
    console.error('Erro ao buscar modo de avaliação:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/assessment-mode — Aluno altera modo de avaliação
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { aluno_email, aluno_nome, modo_novo, justificativa, semester } = body;

    if (!aluno_email || !modo_novo) {
      return NextResponse.json({ error: 'aluno_email e modo_novo são obrigatórios' }, { status: 400 });
    }

    const modoValido: AssessmentMode[] = ['STRICT', 'RESTRICTIVE_COMPENSATION', 'SOFT_COMPENSATION'];
    if (!modoValido.includes(modo_novo)) {
      return NextResponse.json({ error: 'modo_novo inválido' }, { status: 400 });
    }

    const semesterAtual = semester || '2026.2';

    // Busca modo atual para registrar histórico
    const { data: matriculaAtual } = await supabase
      .from('alunos_matriculas')
      .select('assessment_mode')
      .eq('aluno_email', aluno_email)
      .eq('semester', semesterAtual)
      .single();

    const modo_anterior = matriculaAtual?.assessment_mode || null;

    // Registra no histórico
    await supabase.from('historico_assessment_mode').insert({
      aluno_email,
      aluno_nome,
      modo_anterior,
      modo_novo,
      justificativa,
      semester: semesterAtual,
    });

    // Atualiza a matrícula
    const { data, error } = await supabase
      .from('alunos_matriculas')
      .upsert({
        aluno_email,
        aluno_nome,
        semester: semesterAtual,
        assessment_mode: modo_novo,
        assessment_mode_justificativa: justificativa,
        assessment_mode_updated_at: new Date().toISOString(),
      }, { onConflict: 'aluno_email,semester' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ matricula: data, message: `Modo alterado para ${modo_novo}` });
  } catch (error: any) {
    console.error('Erro ao alterar modo de avaliação:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
