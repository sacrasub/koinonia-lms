import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import fs from 'fs';
import path from 'path';

const CLOUD_TITLE_KEY = 'lms_gravacoes_cloud_v1';
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'gravacoes.json');

const INITIAL_SEEDS = [
  {
    id: 'rec-seed-aula3-his',
    disciplina_id: 'disc-1',
    disciplina_name: 'História do Congregacionalismo',
    aula_num: 3,
    data_aula: '25/08/2026',
    title: 'Aula 3 • História do Congregacionalismo (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1o03WW9pk6DQWTcgTs13MkLTrjP2GpTMI/view',
    drive_file_id: '1o03WW9pk6DQWTcgTs13MkLTrjP2GpTMI',
    recorded_by_name: 'Monitora Camila / Coordenação',
    recorded_by_role: 'monitor',
    recorded_by_email: 'camila@gmail.com',
    duration_formatted: '01:25:00',
    is_restricted_lms: true,
    created_at: '25/08/2026',
  },
  {
    id: 'rec-seed-aula3-dir',
    disciplina_id: 'disc-4',
    disciplina_name: 'Direitos Humanos',
    aula_num: 3,
    data_aula: '26/08/2026',
    title: 'Aula 3 • Direitos Humanos (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/16Nfst-Da9-WNQneOWeX3iTaTbXkhMY4j/view?usp=drive_link',
    drive_file_id: '16Nfst-Da9-WNQneOWeX3iTaTbXkhMY4j',
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '26/08/2026',
  },
  {
    id: 'rec-seed-aula3-tcc',
    disciplina_id: 'disc-8',
    disciplina_name: 'TCC I',
    aula_num: 3,
    data_aula: '28/08/2026',
    title: 'Aula 3 • TCC I (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1f-9i-TpqaZhzoLyrxg6flM6CHTsAOWPj/view',
    drive_file_id: '1f-9i-TpqaZhzoLyrxg6flM6CHTsAOWPj',
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '28/08/2026',
  },
  {
    id: 'rec-seed-aula3-aco',
    disciplina_id: 'disc-3',
    disciplina_name: 'Aconselhamento Bíblico II',
    aula_num: 3,
    data_aula: '26/08/2026',
    title: 'Aula 3 • Aconselhamento Bíblico II (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1O3pf9XJQ5pZGI8Mn7q0yqA19-6GcCsCy/view',
    drive_file_id: '1O3pf9XJQ5pZGI8Mn7q0yqA19-6GcCsCy',
    recorded_by_name: 'Cristiano Sacramento / Monitoria',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '26/08/2026',
  },
  {
    id: 'rec-seed-aula3-pri',
    disciplina_id: 'disc-7',
    disciplina_name: 'Plantação e Revitalização de Igrejas II',
    aula_num: 3,
    data_aula: '28/08/2026',
    title: 'Aula 3 • Plantação e Revitalização de Igrejas II (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/150PGpMsyfJb_eM_4OfPUfr3oh5EhW1OU/view?usp=drive_link',
    drive_file_id: '150PGpMsyfJb_eM_4OfPUfr3oh5EhW1OU',
    recorded_by_name: 'Monitora Camila / Coordenação',
    recorded_by_role: 'monitor',
    recorded_by_email: 'camilagbalbi@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '28/08/2026',
  },
  {
    id: 'rec-seed-aula3-nt3',
    disciplina_id: 'disc-6',
    disciplina_name: 'Novo Testamento III - Epístolas Gerais',
    aula_num: 3,
    data_aula: '27/08/2026',
    title: 'Aula 3 • Novo Testamento III - Epístolas Gerais (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1iBQGPbiKj8kFVTA9yAS-pQj06a8jAbwz/view',
    drive_file_id: '1iBQGPbiKj8kFVTA9yAS-pQj06a8jAbwz',
    recorded_by_name: 'Monitora Camila / Coordenação',
    recorded_by_role: 'monitor',
    recorded_by_email: 'camilagbalbi@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '27/08/2026',
  },
  {
    id: 'rec-seed-aula3-hpc',
    disciplina_id: 'disc-2',
    disciplina_name: 'História do Pensamento Cristão II',
    aula_num: 3,
    data_aula: '25/08/2026',
    title: 'Aula 3 • História do Pensamento Cristão II (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1bqjPqCWD1Sv5yBssjix0lUqYBYXMEio0/view?usp=drive_link',
    drive_file_id: '1bqjPqCWD1Sv5yBssjix0lUqYBYXMEio0',
    recorded_by_name: 'Cristiano Sacramento / Monitoria',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '25/08/2026',
  },
  {
    id: 'rec-seed-aula3-etc',
    disciplina_id: 'disc-5',
    disciplina_name: 'Ética Cristã',
    aula_num: 3,
    data_aula: '27/08/2026',
    title: 'Aula 3 • Ética Cristã (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC/view',
    drive_file_id: '1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC',
    recorded_by_name: 'Monitora Rosiane',
    recorded_by_role: 'monitor',
    recorded_by_email: 'rosianelcs73@gmail.com',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    is_restricted_lms: true,
    created_at: '27/08/2026',
  },
  {
    id: 'rec-afro-aula1',
    disciplina_id: 'disc-9',
    disciplina_name: '09 - História da Cultura Afro Brasileira e Indígena - Alexsandro',
    aula_num: 1,
    data_aula: '14/08/2026',
    title: '01 • Por Que Esta Disciplina é Necessária à Teologia? (Videoaula HD • 636 MB)',
    video_url: 'https://drive.google.com/file/d/1ypH0nSMA6E02c2enTzeLSacRhY8q9n05/view?usp=drive_link',
    drive_file_id: '1ypH0nSMA6E02c2enTzeLSacRhY8q9n05',
    recorded_by_name: 'Profº Alexsandro',
    recorded_by_role: 'professor',
    recorded_by_email: 'alexsandro@stc.edu.br',
    duration_formatted: 'Videoaula HD • 636 MB',
    duration_seconds: 4800,
    is_restricted_lms: true,
    created_at: '14/08/2026',
  },
  {
    id: 'rec-afro-aula2',
    disciplina_id: 'disc-9',
    disciplina_name: '09 - História da Cultura Afro Brasileira e Indígena - Alexsandro',
    aula_num: 2,
    data_aula: '21/08/2026',
    title: '02 • Áfricas, Diáspora e Cultura Afro-Brasileira (Videoaula HD • 595 MB)',
    video_url: 'https://drive.google.com/file/d/1zMrGk_T-658PSVDXk14qb4VsFcqNtfzq/view?usp=drive_link',
    drive_file_id: '1zMrGk_T-658PSVDXk14qb4VsFcqNtfzq',
    recorded_by_name: 'Profº Alexsandro',
    recorded_by_role: 'professor',
    recorded_by_email: 'alexsandro@stc.edu.br',
    duration_formatted: 'Videoaula HD • 595 MB',
    duration_seconds: 4500,
    is_restricted_lms: true,
    created_at: '21/08/2026',
  },
  {
    id: 'rec-afro-aula3',
    disciplina_id: 'disc-9',
    disciplina_name: '09 - História da Cultura Afro Brasileira e Indígena - Alexsandro',
    aula_num: 3,
    data_aula: '28/08/2026',
    title: '03 • Povos Indígenas: Histórias, Culturas, Missão e Direitos (Videoaula HD • 526 MB)',
    video_url: 'https://drive.google.com/file/d/1cdcDrVmHoPmet3oA2Bib6hhz_ugzBxaK/view?usp=drive_link',
    drive_file_id: '1cdcDrVmHoPmet3oA2Bib6hhz_ugzBxaK',
    recorded_by_name: 'Profº Alexsandro',
    recorded_by_role: 'professor',
    recorded_by_email: 'alexsandro@stc.edu.br',
    duration_formatted: 'Videoaula HD • 526 MB',
    duration_seconds: 4300,
    is_restricted_lms: true,
    created_at: '28/08/2026',
  },
  {
    id: 'rec-afro-aula4',
    disciplina_id: 'disc-9',
    disciplina_name: '09 - História da Cultura Afro Brasileira e Indígena - Alexsandro',
    aula_num: 4,
    data_aula: '04/09/2026',
    title: '04 • Religiões, Análise Cristã Confessional e Prática da Igreja [Atividade Avaliativa] (Videoaula HD • 532 MB)',
    video_url: 'https://drive.google.com/file/d/1gSk3mjti0WC5PCDDpv0DRdtQ0x2hB_yw/view?usp=drive_link',
    drive_file_id: '1gSk3mjti0WC5PCDDpv0DRdtQ0x2hB_yw',
    recorded_by_name: 'Profº Alexsandro',
    recorded_by_role: 'professor',
    recorded_by_email: 'alexsandro@stc.edu.br',
    duration_formatted: 'Videoaula HD • 532 MB',
    duration_seconds: 4600,
    is_restricted_lms: true,
    created_at: '04/09/2026',
  },
  {
    disciplina_id: 'disc-7',
    disciplina_name: 'Plantação e Revitalização de Igrejas II',
    aula_num: 2,
    data_aula: '21/08/2026',
    title: 'Aula 2 • Plantação e Revitalização de Igrejas II (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/10RogTFhXueTAab43iq9q8YphZ5wYiHOY/view?usp=drive_link',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    is_restricted_lms: true,
    id: 'rec-1788042267784-hf135',
    drive_file_id: '10RogTFhXueTAab43iq9q8YphZ5wYiHOY',
    created_at: '29/08/2026',
  },
  {
    disciplina_id: 'disc-7',
    disciplina_name: 'Plantação e Revitalização de Igrejas II',
    aula_num: 1,
    data_aula: '14/08/2026',
    title: 'Aula 1 • Plantação e Revitalização de Igrejas II (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1qcieEltcCaz7OQOfNBF_Fntfng_ALvta/view?usp=drive_link',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    is_restricted_lms: true,
    id: 'rec-1788042234924-ksp1i',
    drive_file_id: '1qcieEltcCaz7OQOfNBF_Fntfng_ALvta',
    created_at: '29/08/2026',
  },
  {
    disciplina_id: 'disc-6',
    disciplina_name: 'Novo Testamento III - Epístolas Gerais',
    aula_num: 1,
    data_aula: '13/08/2026',
    title: 'Aula 1 • Novo Testamento III - Epístolas Gerais (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1o_nVApXOXgwYcd-Aw6fKBGzHY_D2bYvV/view?usp=drive_link',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    is_restricted_lms: true,
    id: 'rec-1788042201024-44b0o',
    drive_file_id: '1o_nVApXOXgwYcd-Aw6fKBGzHY_D2bYvV',
    created_at: '29/08/2026',
  },
  {
    disciplina_id: 'disc-2',
    disciplina_name: 'História do Pensamento Cristão II',
    aula_num: 1,
    data_aula: '11/08/2026',
    title: 'Aula 1 • História do Pensamento Cristão II (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1NUGn7pyGR_E3zNBoID07X9C7fSjqIEoI/view?usp=drive_link',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    is_restricted_lms: true,
    id: 'rec-1788042147579-4m9jt',
    drive_file_id: '1NUGn7pyGR_E3zNBoID07X9C7fSjqIEoI',
    created_at: '29/08/2026',
  },
  {
    disciplina_id: 'disc-1',
    disciplina_name: 'História do Congregacionalismo',
    aula_num: 1,
    data_aula: '11/08/2026',
    title: 'Aula 1 • História do Congregacionalismo (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1UzDyO4u4ysUzBtIG3PnAQUrfOAnpc8kx/view?usp=drive_link',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    is_restricted_lms: true,
    id: 'rec-1788042118901-q3chx',
    drive_file_id: '1UzDyO4u4ysUzBtIG3PnAQUrfOAnpc8kx',
    created_at: '29/08/2026',
  },
  {
    disciplina_id: 'disc-4',
    disciplina_name: 'Direitos Humanos',
    aula_num: 1,
    data_aula: '12/08/2026',
    title: 'Aula 1 • Direitos Humanos (Gravação HD)',
    video_url: 'https://drive.google.com/file/d/1Efb3ZJQvIIG5O_A1I9bOU-8aJz8XTxNd/view?usp=drive_link',
    duration_formatted: 'Aula Gravada',
    duration_seconds: 0,
    recorded_by_name: 'Cristiano Sacramento',
    recorded_by_role: 'monitor',
    recorded_by_email: 'sacrasub@gmail.com',
    is_restricted_lms: true,
    id: 'rec-1788042032628-9j1vg',
    drive_file_id: '1Efb3ZJQvIIG5O_A1I9bOU-8aJz8XTxNd',
    created_at: '29/08/2026',
  },
];

function readLocalDataFile(): any[] {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Aviso ao ler data/gravacoes.json:', err);
  }
  return INITIAL_SEEDS;
}

const DELETED_CLOUD_TITLE_KEY = 'lms_deleted_gravacoes_cloud_v1';
const DELETED_DATA_FILE_PATH = path.join(process.cwd(), 'data', 'deleted_gravacoes.json');

function readDeletedDataFile(): string[] {
  try {
    if (fs.existsSync(DELETED_DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DELETED_DATA_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function writeDeletedDataFile(ids: string[]): void {
  try {
    const dir = path.dirname(DELETED_DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DELETED_DATA_FILE_PATH, JSON.stringify(ids, null, 2), 'utf-8');
  } catch (e) {}
}

function writeLocalDataFile(list: any[]): void {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Aviso ao gravar em data/gravacoes.json:', err);
  }
}

/**
 * GET /api/gravacoes
 * Retorna todas as gravações cadastradas e sincronizadas, excluindo as deletadas
 */
export async function GET() {
  let fileList = readLocalDataFile();
  let deletedIds = new Set<string>(readDeletedDataFile());

  // Tenta enriquecer com dados do Supabase se disponível
  try {
    const { data: delData } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', DELETED_CLOUD_TITLE_KEY)
      .limit(1);

    if (delData && delData.length > 0 && delData[0].file_url) {
      try {
        const cloudDels = JSON.parse(delData[0].file_url);
        if (Array.isArray(cloudDels)) {
          cloudDels.forEach((id: string) => deletedIds.add(id));
          writeDeletedDataFile(Array.from(deletedIds));
        }
      } catch (e) {}
    }

    const { data, error } = await supabase
      .from('materiais')
      .select('id, file_url, updated_at')
      .eq('title', CLOUD_TITLE_KEY)
      .limit(1);

    if (!error && data && data.length > 0 && data[0].file_url) {
      try {
        const cloudList = JSON.parse(data[0].file_url);
        if (Array.isArray(cloudList) && cloudList.length > 0) {
          const map = new Map<string, any>();
          fileList.forEach((item) => {
            if (!deletedIds.has(item.id)) map.set(item.id, item);
          });
          cloudList.forEach((item) => {
            if (!deletedIds.has(item.id)) map.set(item.id, item);
          });
          fileList = Array.from(map.values());
          writeLocalDataFile(fileList);
        }
      } catch (pErr) {}
    }
  } catch (e) {
    // Ignora erro de chave do Supabase
  }

  // Filtra itens deletados
  const filteredList = fileList.filter((g) => !deletedIds.has(g.id));

  return NextResponse.json({
    success: true,
    gravacoes: filteredList,
    deletedIds: Array.from(deletedIds),
  });
}

/**
 * POST /api/gravacoes
 * Salva e persiste gravações localmente no backend e no Supabase
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { list, gravacao, deletedId, deletedIds: incomingDeletedIds } = body;

    let deletedIds = new Set<string>(readDeletedDataFile());
    if (deletedId) deletedIds.add(deletedId);
    if (Array.isArray(incomingDeletedIds)) {
      incomingDeletedIds.forEach((id: string) => deletedIds.add(id));
    }
    writeDeletedDataFile(Array.from(deletedIds));

    let currentList = readLocalDataFile();
    let targetList: any[] = [];

    if (Array.isArray(list)) {
      targetList = list.filter((g: any) => !deletedIds.has(g.id));
    } else if (gravacao && gravacao.video_url) {
      const idx = currentList.findIndex(
        (g: any) => g.id === gravacao.id || (g.disciplina_id === gravacao.disciplina_id && g.aula_num === gravacao.aula_num)
      );

      if (idx >= 0) {
        currentList[idx] = { ...currentList[idx], ...gravacao };
      } else {
        currentList = [gravacao, ...currentList];
      }
      targetList = currentList.filter((g: any) => !deletedIds.has(g.id));
    } else {
      return NextResponse.json({ error: 'Nenhuma lista ou gravação informada.' }, { status: 400 });
    }

    // Persiste imediatamente no servidor local se possível
    writeLocalDataFile(targetList);

    // Persiste no Supabase
    try {
      const jsonStr = JSON.stringify(targetList);
      const { data: existingRecords } = await supabase
        .from('materiais')
        .select('id')
        .eq('title', CLOUD_TITLE_KEY)
        .limit(1);

      if (existingRecords && existingRecords.length > 0) {
        await supabase
          .from('materiais')
          .update({ file_url: jsonStr })
          .eq('id', existingRecords[0].id);
      } else {
        await supabase.from('materiais').insert([
          {
            disciplina_id: null,
            title: CLOUD_TITLE_KEY,
            file_url: jsonStr,
            is_native_upload: false,
          },
        ]);
      }

      if (deletedIds.size > 0) {
        const delJson = JSON.stringify(Array.from(deletedIds));
        const { data: existingDel } = await supabase
          .from('materiais')
          .select('id')
          .eq('title', DELETED_CLOUD_TITLE_KEY)
          .limit(1);

        if (existingDel && existingDel.length > 0) {
          await supabase
            .from('materiais')
            .update({ file_url: delJson })
            .eq('id', existingDel[0].id);
        } else {
          await supabase.from('materiais').insert([
            {
              disciplina_id: null,
              title: DELETED_CLOUD_TITLE_KEY,
              file_url: delJson,
              is_native_upload: false,
            },
          ]);
        }
      }
    } catch (supaErr) {
      console.warn('Erro ao persistir no Supabase:', supaErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Gravações sincronizadas e persistidas com sucesso!',
      gravacoes: targetList,
      deletedIds: Array.from(deletedIds),
    });
  } catch (err: any) {
    console.error('Erro no endpoint POST /api/gravacoes:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao sincronizar gravações.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gravacoes
 * Remove uma gravação por ID
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da gravação é obrigatório.' }, { status: 400 });
    }

    const deletedIds = new Set<string>(readDeletedDataFile());
    deletedIds.add(id);
    writeDeletedDataFile(Array.from(deletedIds));

    let currentList = readLocalDataFile();
    const updatedList = currentList.filter((g: any) => g.id !== id && !deletedIds.has(g.id));
    writeLocalDataFile(updatedList);

    try {
      const jsonStr = JSON.stringify(updatedList);
      const { data: existingRecords } = await supabase
        .from('materiais')
        .select('id')
        .eq('title', CLOUD_TITLE_KEY)
        .limit(1);

      if (existingRecords && existingRecords.length > 0) {
        await supabase
          .from('materiais')
          .update({ file_url: jsonStr })
          .eq('id', existingRecords[0].id);
      }

      const delJson = JSON.stringify(Array.from(deletedIds));
      const { data: existingDel } = await supabase
        .from('materiais')
        .select('id')
        .eq('title', DELETED_CLOUD_TITLE_KEY)
        .limit(1);

      if (existingDel && existingDel.length > 0) {
        await supabase
          .from('materiais')
          .update({ file_url: delJson })
          .eq('id', existingDel[0].id);
      } else {
        await supabase.from('materiais').insert([
          {
            disciplina_id: null,
            title: DELETED_CLOUD_TITLE_KEY,
            file_url: delJson,
            is_native_upload: false,
          },
        ]);
      }
    } catch (supaErr) {
      console.warn('Erro ao persistir exclusão no Supabase:', supaErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Gravação removida com sucesso.',
      gravacoes: updatedList,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao remover gravação.' },
      { status: 500 }
    );
  }
}
