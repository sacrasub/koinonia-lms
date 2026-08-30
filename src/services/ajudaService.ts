import { TutorialVideoItem, TutorialAudience } from '@/types';
import { supabase } from '@/lib/supabaseClient';

const TUTORIAIS_STORAGE_KEY = 'lms_tutoriais_ajuda_v1';
const SUPABASE_SYNC_TITLE = 'lms_tutoriais_ajuda_cloud_v1';

export const DEFAULT_TUTORIALS: TutorialVideoItem[] = [
  // ==========================================
  // TRILHA 1: ALUNOS
  // ==========================================
  {
    id: 'tut-aluno-1',
    title: 'Primeiro Acesso & Navegação no Painel do Aluno',
    description: 'Aprenda como fazer login com sua conta Google acadêmica, localizar suas disciplinas matriculadas e navegar pelos recursos essenciais do LMS.',
    audience: 'aluno',
    category: 'Primeiros Passos',
    duration: '01:30',
    video_url: 'https://drive.google.com/file/d/1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO/view',
    thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
    topics: [
      'Login seguro com conta Google acadêmica/autorizada',
      'Estrutura do Painel do Aluno e atalhos rápidos',
      'Navegação entre disciplinas do semestre',
      'Avisos e comunicados importantes'
    ],
    script_summary: 'Mostrar login no LMS, cards das disciplinas matriculadas e menu lateral com atalhos para biblioteca, portal e caderno.',
    order: 1,
    author_name: 'Coordenação Acadêmica',
    updated_at: '2026-08-27',
  },
  {
    id: 'tut-aluno-2',
    title: 'Como Entrar na Aula Ao Vivo no Google Meet',
    description: 'Descubra como acessar a sala de aula ao vivo no horário correto diretamente pelo LMS, sem precisar buscar links no WhatsApp.',
    audience: 'aluno',
    category: 'Aulas Ao Vivo',
    duration: '01:00',
    video_url: 'https://drive.google.com/file/d/1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO/view',
    thumbnail_url: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&auto=format&fit=crop&q=80',
    topics: [
      'Localização do botão da aula ao vivo no painel',
      'Acesso seguro ao Google Meet oficial',
      'Diretrizes de câmeras ligadas e participação ativa'
    ],
    script_summary: 'Destacar o banner verde e botão "Entrar no Google Meet" da disciplina no horário agendado.',
    order: 2,
    author_name: 'Coordenação Acadêmica',
    updated_at: '2026-08-27',
  },
  {
    id: 'tut-aluno-3',
    title: 'Acessando Gravações, Slides e Livros no Hub da Matéria',
    description: 'Guia completo para assistir às gravações das aulas passadas com filtro por datas, baixar slides e consultar livros recomendados.',
    audience: 'aluno',
    category: 'Estudos & Revisão',
    duration: '02:00',
    video_url: 'https://drive.google.com/file/d/1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO/view',
    thumbnail_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
    topics: [
      'Navegação entre abas no Hub da Matéria',
      'Pílulas de aulas com datas de referência (11/08, 18/08...)',
      'Player de vídeo em HD no Google Drive restrito',
      'Visualização de apresentações de slides slide a slide'
    ],
    script_summary: 'Abrir uma disciplina, alternar entre abas de gravações, slides e livros recomendados.',
    order: 3,
    author_name: 'Coordenação Acadêmica',
    updated_at: '2026-08-27',
  },
  {
    id: 'tut-aluno-4',
    title: 'Utilizando o Caderno Cornell com IA do Gemini',
    description: 'Aprenda a fazer anotações de aula com o método Cornell e importar resumos teológicos estruturados gerados automaticamente pela IA.',
    audience: 'aluno',
    category: 'Estudos & IA',
    duration: '02:30',
    video_url: 'https://drive.google.com/file/d/1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO/view',
    thumbnail_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
    topics: [
      'Estrutura do Caderno Cornell (Pistas, Anotações e Síntese)',
      'Como criar e organizar suas anotações teológicas',
      'Importação em 1 clique dos resumos gerados pelo Gemini IA',
      'Impressão e exportação das notas de aula'
    ],
    script_summary: 'Demonstrar a criação de notas no Caderno Cornell e a importação de resumos do Gemini a partir do Hub da Disciplina.',
    order: 4,
    author_name: 'Coordenação Acadêmica',
    updated_at: '2026-08-27',
  },
  {
    id: 'tut-aluno-5',
    title: 'Biblioteca Digital & Checklist de Avaliações (AV1/AV2)',
    description: 'Como pesquisar no acervo digital de teologia e acompanhar seus prazos de provas e trabalhos no checklist semestral.',
    audience: 'aluno',
    category: 'Avaliações & Acervo',
    duration: '01:45',
    video_url: 'https://drive.google.com/file/d/1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO/view',
    thumbnail_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&auto=format&fit=crop&q=80',
    topics: [
      'Pesquisa por autor, título ou matéria na Biblioteca Digital',
      'Abertura direta das obras no Google Drive',
      'Checklist de tarefas e metas de estudo para AV1 e AV2',
      'Consulta ao Portal Acadêmico e calendário letivo'
    ],
    script_summary: 'Navegar na Biblioteca Digital e marcar metas no Checklist AV2.',
    order: 5,
    author_name: 'Coordenação Acadêmica',
    updated_at: '2026-08-27',
  },

  // ==========================================
  // TRILHA 2: MONITORES
  // ==========================================
  {
    id: 'tut-monitor-1',
    title: 'Escala de Monitoria & Plantões Semanais',
    description: 'Guia para monitores: visualização de horários, fuso horário adaptado e geração de textos formatados para WhatsApp da turma.',
    audience: 'monitor',
    category: 'Monitoria & Plantão',
    duration: '01:45',
    video_url: 'https://drive.google.com/file/d/1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO/view',
    thumbnail_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    topics: [
      'Filtros por Turma (Turma A / Turma B / Fim de Semana) e dias',
      'Ajuste automático de fusos horários da escala',
      'Botão "Copiar Texto p/ WhatsApp" com formatação completa',
      'Gestão de solicitações de troca de escala'
    ],
    script_summary: 'Abrir a tela de Escala de Monitoria, filtrar por dia e clicar em Copiar Texto para WhatsApp.',
    order: 6,
    author_name: 'Equipe de Monitoria',
    updated_at: '2026-08-27',
  },
  {
    id: 'tut-monitor-2',
    title: 'Controle e Disparo de Lista de Presença no Chat',
    description: 'Como copiar rapidamente o link do Google Forms de frequência durante a aula e enviar a mensagem padronizada no chat do Meet.',
    audience: 'monitor',
    category: 'Monitoria & Plantão',
    duration: '01:15',
    video_url: 'https://drive.google.com/file/d/1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO/view',
    thumbnail_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    topics: [
      'Localização do botão de presença na grade da disciplina',
      'Cópia instantânea da mensagem oficial de presença',
      'Disparo periódico no chat do Google Meet'
    ],
    script_summary: 'Mostrar o clique no botão de presença e o texto pronto para colar no Meet.',
    order: 7,
    author_name: 'Equipe de Monitoria',
    updated_at: '2026-08-27',
  },
  {
    id: 'tut-monitor-3',
    title: 'Como Gravar a Aula ao Vivo com Upload Direto para o Drive',
    description: 'Passo a passo para iniciar a gravação de tela com áudio, monitorar o status e salvar automaticamente no Google Drive sem limites de tamanho.',
    audience: 'monitor',
    category: 'Gravações & Mídia',
    duration: '02:30',
    video_url: 'https://drive.google.com/file/d/1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO/view',
    thumbnail_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    topics: [
      'Início da gravação pelo botão "Gravar Aula ao Vivo (HD)"',
      'Seleção da janela do Meet e inclusão do microfone',
      'Proteção anti-perda (chunks contínuos em disco)',
      'Upload Direto com barra de progresso para o Google Drive',
      'Liberação automática e manual do status da sala'
    ],
    script_summary: 'Abrir o gravador, selecionar matéria/aula, iniciar captura da janela e simular a finalização com barra de progresso.',
    order: 8,
    author_name: 'Equipe de Monitoria',
    updated_at: '2026-08-27',
  },

  // ==========================================
  // TRILHA 3: PROFESSORES
  // ==========================================
  {
    id: 'tut-prof-1',
    title: 'Gerenciando suas Matérias & Plano de Ensino',
    description: 'Como o professor gerencia suas disciplinas, personaliza links de sala de aula e acompanha os dados da turma.',
    audience: 'professor',
    category: 'Gestão Docente',
    duration: '01:30',
    video_url: 'https://drive.google.com/file/d/1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO/view',
    thumbnail_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    topics: [
      'Visão geral do Painel do Professor',
      'Edição de dados da matéria (links do Meet, Drive e Ementa)',
      'Consulta aos alunos matriculados e cronograma de aulas'
    ],
    script_summary: 'Acessar o Painel do Professor, clicar em editar disciplina e atualizar links do Meet e Drive.',
    order: 9,
    author_name: 'Corpo Docente',
    updated_at: '2026-08-27',
  },
  {
    id: 'tut-prof-2',
    title: 'Publicando Slides, Livros e Materiais de Apoio',
    description: 'Como cadastrar apresentações de slides aula a aula e indicar leituras recomendadas aos estudantes no Hub da Disciplina.',
    audience: 'professor',
    category: 'Conteúdo & Slides',
    duration: '02:00',
    video_url: 'https://drive.google.com/file/d/1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO/view',
    thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    topics: [
      'Cadastro de slides vinculados ao número da aula',
      'Inserção de links do Google Apresentações, Canva ou PDF',
      'Recomendação de livros do acervo e leituras obrigatórias',
      'Edição e atualização de materiais já cadastrados'
    ],
    script_summary: 'Abrir o Hub da Disciplina, clicar em "+ Cadastrar Apresentação de Slide" e preencher os dados.',
    order: 10,
    author_name: 'Corpo Docente',
    updated_at: '2026-08-27',
  },
  {
    id: 'tut-prof-3',
    title: 'Criando e Vinculando Avaliações (Google Forms / Nativas)',
    description: 'Como criar provas e trabalhos semestrais com suporte a incorporação de formulários do Google Forms diretamente no LMS.',
    audience: 'professor',
    category: 'Avaliações & Notas',
    duration: '01:45',
    video_url: 'https://drive.google.com/file/d/1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO/view',
    thumbnail_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    topics: [
      'Aba de Avaliações no Painel do Professor',
      'Configuração de prazos (Data limite AV1 / AV2)',
      'Incorporação segura de formulários Google Forms (is_legacy)',
      'Visualização da prova pelo aluno sem sair da plataforma'
    ],
    script_summary: 'Mostrar o formulário de cadastro de avaliação com flag is_legacy e link do Google Forms.',
    order: 11,
    author_name: 'Corpo Docente',
    updated_at: '2026-08-27',
  },
];

/**
 * Carrega a lista de tutoriais (do Supabase ou localStorage com fallback para DEFAULT_TUTORIALS)
 */
export function getAllTutorials(): TutorialVideoItem[] {
  if (typeof window === 'undefined') {
    return DEFAULT_TUTORIALS;
  }

  try {
    const raw = localStorage.getItem(TUTORIAIS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TUTORIAIS_STORAGE_KEY, JSON.stringify(DEFAULT_TUTORIALS));
      syncTutorialsFromSupabase();
      return DEFAULT_TUTORIALS;
    }
    const parsed: TutorialVideoItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(TUTORIAIS_STORAGE_KEY, JSON.stringify(DEFAULT_TUTORIALS));
      syncTutorialsFromSupabase();
      return DEFAULT_TUTORIALS;
    }
    return parsed.sort((a, b) => a.order - b.order);
  } catch (e) {
    console.error('Erro ao ler tutoriais do localStorage:', e);
    return DEFAULT_TUTORIALS;
  }
}

/**
 * Salva localmente e sincroniza no Supabase
 */
export function saveAllTutorialsLocal(list: TutorialVideoItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const sorted = [...list].sort((a, b) => a.order - b.order);
    localStorage.setItem(TUTORIAIS_STORAGE_KEY, JSON.stringify(sorted));
    window.dispatchEvent(new CustomEvent('lms_tutoriais_updated', { detail: sorted }));
    syncTutorialsToSupabase(sorted);
  } catch (e) {
    console.error('Erro ao salvar tutoriais localmente:', e);
  }
}

/**
 * Adiciona ou edita um tutorial existente
 */
export function saveTutorial(tutorial: TutorialVideoItem): void {
  const current = getAllTutorials();
  const index = current.findIndex((t) => t.id === tutorial.id);
  let updatedList: TutorialVideoItem[];

  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = { ...tutorial, updated_at: new Date().toISOString().slice(0, 10) };
  } else {
    const newId = tutorial.id || `tut-${Date.now()}`;
    const newOrder = tutorial.order || current.length + 1;
    updatedList = [
      ...current,
      {
        ...tutorial,
        id: newId,
        order: newOrder,
        updated_at: new Date().toISOString().slice(0, 10),
      },
    ];
  }

  saveAllTutorialsLocal(updatedList);
}

/**
 * Remove um tutorial
 */
export function deleteTutorial(tutorialId: string): void {
  const current = getAllTutorials();
  const filtered = current.filter((t) => t.id !== tutorialId);
  saveAllTutorialsLocal(filtered);
}

/**
 * Reordena tutoriais
 */
export function reorderTutorials(orderedTutorials: TutorialVideoItem[]): void {
  const updated = orderedTutorials.map((t, idx) => ({ ...t, order: idx + 1 }));
  saveAllTutorialsLocal(updated);
}

/**
 * Restaura tutoriais para os padrões originais
 */
export function resetToDefaultTutorials(): void {
  saveAllTutorialsLocal(DEFAULT_TUTORIALS);
}

/**
 * Sincroniza tutoriais salvos para a nuvem (Supabase)
 */
export async function syncTutorialsToSupabase(list: TutorialVideoItem[]): Promise<boolean> {
  try {
    const payload = JSON.stringify(list);
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', SUPABASE_SYNC_TITLE)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('materiais')
        .update({
          google_drive_url: payload,
          created_at: new Date().toISOString(),
        })
        .eq('title', SUPABASE_SYNC_TITLE);
    } else {
      await supabase.from('materiais').insert({
        disciplina_id: 'disc-tutoriais-global',
        disciplina_name: 'Central de Ajuda & Tutoriais LMS',
        title: SUPABASE_SYNC_TITLE,
        google_drive_url: payload,
        is_native_upload: false,
        created_at: new Date().toISOString(),
      });
    }
    return true;
  } catch (e) {
    console.warn('Sincronização de tutoriais no Supabase (offline/mock):', e);
    return false;
  }
}

const TUTORIAIS_LAST_FETCH_KEY = 'lms_tutoriais_last_fetch_ts';
const TUTORIAIS_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos de cache

/**
 * Puxa tutoriais da nuvem (Supabase) para o cache local
 */
export async function syncTutorialsFromSupabase(force: boolean = false): Promise<TutorialVideoItem[]> {
  if (typeof window === 'undefined') return getAllTutorials();

  const lastFetch = Number(localStorage.getItem(TUTORIAIS_LAST_FETCH_KEY) || 0);
  const now = Date.now();
  if (!force && now - lastFetch < TUTORIAIS_CACHE_TTL_MS) {
    return getAllTutorials();
  }

  try {
    const { data, error } = await supabase
      .from('materiais')
      .select('google_drive_url')
      .eq('title', SUPABASE_SYNC_TITLE)
      .limit(1);

    localStorage.setItem(TUTORIAIS_LAST_FETCH_KEY, String(Date.now()));

    if (error || !data || data.length === 0 || !data[0].google_drive_url) {
      return getAllTutorials();
    }

    const parsed: TutorialVideoItem[] = JSON.parse(data[0].google_drive_url);
    if (Array.isArray(parsed) && parsed.length > 0) {
      localStorage.setItem(TUTORIAIS_STORAGE_KEY, JSON.stringify(parsed));
      window.dispatchEvent(new CustomEvent('lms_tutoriais_updated', { detail: parsed }));
      return parsed;
    }
  } catch (e) {
    console.warn('Falha ao baixar tutoriais do Supabase, mantendo cache local:', e);
  }
  return getAllTutorials();
}
