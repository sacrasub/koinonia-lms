import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const CLOUD_TITLE_KEY = 'lms_gravacoes_cloud_v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      driveFileId,
      webViewLink,
      disciplinaId = 'disc-1',
      disciplinaName = 'Aula Sem Título',
      aulaNum = 1,
      dataAula = new Date().toLocaleDateString('pt-BR'),
      recordedByName = 'Monitoria UIECB',
      recordedByEmail = 'monitor@uiecbead.com.br',
      recordedByRole = 'monitor',
      durationSeconds = 0,
      title,
    } = body;

    if (!driveFileId) {
      return NextResponse.json({ error: 'driveFileId é obrigatório.' }, { status: 400 });
    }

    const durationHours = Math.floor(durationSeconds / 3600);
    const durationMins = Math.floor((durationSeconds % 3600) / 60);
    const durationSecs = Math.floor(durationSeconds % 60);
    const durationFormatted =
      durationHours > 0
        ? `${String(durationHours).padStart(2, '0')}:${String(durationMins).padStart(2, '0')}:${String(durationSecs).padStart(2, '0')}`
        : `${String(durationMins).padStart(2, '0')}:${String(durationSecs).padStart(2, '0')}`;

    const customTitle = title || `Aula ${aulaNum} • ${disciplinaName} (Gravação HD)`;
    const finalWebViewLink = webViewLink || `https://drive.google.com/file/d/${driveFileId}/view`;

    const newGravacao = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      disciplina_id: disciplinaId,
      disciplina_name: disciplinaName,
      aula_num: Number(aulaNum),
      data_aula: dataAula,
      title: customTitle,
      video_url: finalWebViewLink,
      drive_file_id: driveFileId,
      recorded_by_name: recordedByName,
      recorded_by_role: recordedByRole,
      recorded_by_email: recordedByEmail,
      duration_seconds: Number(durationSeconds),
      duration_formatted: durationFormatted,
      is_restricted_lms: true,
      created_at: new Date().toLocaleDateString('pt-BR'),
    };

    // Sincroniza na tabela 'materiais' do Supabase
    try {
      const { data: existing } = await supabase
        .from('materiais')
        .select('id, file_url')
        .eq('title', CLOUD_TITLE_KEY)
        .limit(1);

      let currentList: any[] = [];
      if (existing && existing.length > 0 && existing[0].file_url) {
        try {
          currentList = JSON.parse(existing[0].file_url);
          if (!Array.isArray(currentList)) currentList = [];
        } catch (e) {}
      }

      // Substitui se já existia gravação da mesma aula ou adiciona no topo
      const existingIdx = currentList.findIndex(
        (g: any) => g.disciplina_id === disciplinaId && g.aula_num === Number(aulaNum)
      );
      if (existingIdx >= 0) {
        currentList[existingIdx] = newGravacao;
      } else {
        currentList = [newGravacao, ...currentList];
      }

      const updatedJson = JSON.stringify(currentList);
      if (existing && existing.length > 0) {
        await supabase
          .from('materiais')
          .update({ file_url: updatedJson, updated_at: new Date().toISOString() })
          .eq('id', existing[0].id);
      } else {
        await supabase.from('materiais').insert([
          {
            disciplina_id: disciplinaId,
            title: CLOUD_TITLE_KEY,
            file_url: updatedJson,
            file_type: 'json',
          },
        ]);
      }
    } catch (supaErr) {
      console.warn('Aviso ao persistir gravação no Supabase:', supaErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Gravação indexada e sincronizada com sucesso!',
      gravacao: newGravacao,
      driveFileId,
      webViewLink: finalWebViewLink,
    });
  } catch (error: any) {
    console.error('Erro na rota /api/drive/finalize-recording:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao finalizar indexação da gravação.' },
      { status: 500 }
    );
  }
}
