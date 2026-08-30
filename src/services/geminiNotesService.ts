/**
 * geminiNotesService.ts
 * =========================================================================
 * Koinonia-LMS - Seminário Teológico
 * Módulo de Gestão de Materiais de Apoio & Gemini Notebook (NotebookLM)
 *
 * Suporta:
 * 1. Anotações Estruturadas & Transcrições (Google Docs / Gemini)
 * 2. Podcasts & Áudios de Resumo (NotebookLM / Deep Dive Audio)
 * 3. Mapas Mentais & Esquemas Visuais
 * 4. Apresentações de Slides (Google Slides / PDF)
 * 5. Vídeos & Clipes Explicativos (YouTube / Drive)
 * 6. Guias de Estudo & Flashcards de Fixação
 * =========================================================================
 */

import { GeminiNoteItem, SupportMaterialType } from '@/types';
import { supabase } from '@/lib/supabaseClient';

const STORAGE_KEY = 'lms_gemini_notes_v3';
const CLOUD_TITLE_KEY = 'lms_gemini_notes_cloud_v3';

export const SUPPORT_MATERIAL_CONFIG: Record<
  SupportMaterialType,
  { label: string; emoji: string; badgeColor: string; iconName: string; description: string }
> = {
  anotacao: {
    label: 'Anotações & Transcrição',
    emoji: '📑',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    iconName: 'FileText',
    description: 'Registro de transcrição e tópicos-chave gerados pelo Gemini durante a aula.',
  },
  audio_podcast: {
    label: 'Podcast / Áudio NotebookLM',
    emoji: '🎙️',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    iconName: 'Headphones',
    description: 'Resumo em áudio estilo podcast gerado pelo NotebookLM para estudo móvel.',
  },
  mapa_mental: {
    label: 'Mapa Mental & Esquema',
    emoji: '🧠',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconName: 'Network',
    description: 'Estrutura conceitual e tópicos conectados para memorização visual.',
  },
  slide: {
    label: 'Apresentação de Slides',
    emoji: '📊',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    iconName: 'Presentation',
    description: 'Lâminas e slides complementares da matéria.',
  },
  video: {
    label: 'Vídeo / Clipe Explicativo',
    emoji: '🎬',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    iconName: 'Video',
    description: 'Recorte em vídeo com explicações dos pontos mais complexos da aula.',
  },
  guia_estudo: {
    label: 'Guia de Estudo & Fixação',
    emoji: '📝',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    iconName: 'CheckSquare',
    description: 'Síntese executiva com questões e flashcards de auto-teste.',
  },
};

export const INITIAL_GEMINI_NOTES: GeminiNoteItem[] = [
  // ── HISTÓRIA DO CONGREGACIONALISMO ──
  {
    id: 'gemini-doc-1',
    disciplina_id: 'disc-1',
    disciplina_name: 'História do Congregacionalismo',
    aula_num: 1,
    data_aula: '11/08/2026',
    title: 'Anotações Gemini • Aula 1 • História do Congregacionalismo',
    gemini_url: 'https://docs.google.com/document/d/1Nm5l4jKBMCyglANAGVqOMs2a4nZxhRIJawBfjvshgm8/edit?usp=meet_tnfm_calendar',
    tipo: 'anotacao',
    summary_snippet: 'Registro de transcrição e tópicos-chave gerados pelo Gemini durante a aula ao vivo no Google Meet: origens na Reforma Inglesa, separatismo puritano e a Declaração de Savoy.',
    tags: ['Reforma Inglesa', 'Puritanismo', 'Savoy'],
    author_name: 'Monitoria Oficial',
    author_role: 'monitor',
    created_at: '2026-08-11T22:30:00Z',
  },
  {
    id: 'gemini-pod-1',
    disciplina_id: 'disc-1',
    disciplina_name: 'História do Congregacionalismo',
    aula_num: 2,
    data_aula: '18/08/2026',
    title: 'Podcast NotebookLM • Aula 2 • Origens do Movimento no Brasil & Robert Kalley',
    gemini_url: 'https://notebooklm.google.com/',
    tipo: 'audio_podcast',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration_formatted: '12:45',
    summary_snippet: 'Episódio em áudio gerado pelo NotebookLM analisando a chegada do Dr. Robert Reid Kalley ao Rio de Janeiro em 1855, a fundação da Igreja Evangélica Fluminense e o impacto na liberdade religiosa brasileira.',
    tags: ['Podcast', 'Robert Kalley', '1855', 'Igreja Fluminense'],
    author_name: 'Profº Hilário Bispo',
    author_role: 'professor',
    created_at: '2026-08-18T23:15:00Z',
  },
  {
    id: 'gemini-map-1',
    disciplina_id: 'disc-1',
    disciplina_name: 'História do Congregacionalismo',
    aula_num: 3,
    data_aula: '25/08/2026',
    title: 'Mapa Mental Gemini • Eclesiologia & Autonomia Local',
    gemini_url: 'https://docs.google.com/document/d/1fhM5sjh1-cpa8MHVSXvSqBgWHUmqqWhGHcn9dTq79rU/edit',
    tipo: 'mapa_mental',
    mindmap_data: '• Eclesiologia Bíblica\n  ├── Autonomia da Igreja Local\n  │     ├── Governo sob o Senhorio de Cristo\n  │     └── Voto e decisão em Assembleia soberana\n  ├── Comunhão Intereclesiástica (UIECB)\n  │     ├── Fraternidade mútua\n  │     └── Cooperação missionária e educacional\n  └── Ministério Pastoral e Diaconal\n        ├── Ordenação e reconhecimento\n        └── Serviço à comunidade',
    summary_snippet: 'Esquema visual sintetizando a relação entre a autonomia da igreja local e a cooperação fraternal entre congregações da UIECB.',
    tags: ['Eclesiologia', 'Governo Congregacional', 'Mapa Mental'],
    author_name: 'Monitoria Oficial',
    author_role: 'monitor',
    created_at: '2026-08-25T22:30:00Z',
  },

  // ── HISTÓRIA DO PENSAMENTO CRISTÃO II ──
  {
    id: 'gemini-doc-2',
    disciplina_id: 'disc-2',
    disciplina_name: 'História do Pensamento Cristão II',
    aula_num: 1,
    data_aula: '11/08/2026',
    title: 'Anotações Gemini • Aula 1 • Da Escolástica à Reforma Protestante',
    gemini_url: 'https://docs.google.com/document/d/1GIGP9tnUWdZs2EzSwFNBf-DtRxzU4a31xYm6hbVZ29U/edit?usp=meet_tnfm_calendar',
    tipo: 'anotacao',
    summary_snippet: 'Transcritura e conceitos centrais: o nominalismo de Guilherme de Ockham, a devotio moderna e a virada soteriológica de Martinho Lutero.',
    tags: ['Lutero', 'Escolástica', 'Soteriologia'],
    author_name: 'Monitoria Oficial',
    author_role: 'monitor',
    created_at: '2026-08-11T23:00:00Z',
  },
  {
    id: 'gemini-pod-2',
    disciplina_id: 'disc-2',
    disciplina_name: 'História do Pensamento Cristão II',
    aula_num: 2,
    data_aula: '18/08/2026',
    title: 'Podcast NotebookLM • Aula 2 • João Calvino & As Institutas',
    gemini_url: 'https://notebooklm.google.com/',
    tipo: 'audio_podcast',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration_formatted: '15:20',
    summary_snippet: 'Debate em áudio entre duas vozes sintetizando a estrutura das Institutas de Calvino: o duplo conhecimento (de Deus e de nós mesmos), Providência, Cristologia e Pacto da Graça.',
    tags: ['Calvino', 'Institutas', 'Pacto', 'Podcast'],
    author_name: 'Profº Hilário Bispo',
    author_role: 'professor',
    created_at: '2026-08-18T23:30:00Z',
  },
  {
    id: 'gemini-map-2',
    disciplina_id: 'disc-2',
    disciplina_name: 'História do Pensamento Cristão II',
    aula_num: 3,
    data_aula: '25/08/2026',
    title: 'Mapa Mental • Sínodo de Dort & Teologia Reformada',
    gemini_url: 'https://docs.google.com/document/d/1rbxmWGKYrRVOsHOu-XA0_7zKQajRT3IuKPbsUVH6nuY/edit',
    tipo: 'mapa_mental',
    mindmap_data: '• Cânones de Dort (1618–1619)\n  ├── Depravação Total (Incapacidade humana)\n  ├── Eleição Incondicional (Graça soberana)\n  ├── Expiação Limitada/Específica (Eficácia redentora)\n  ├── Graça Irresistível (Chamado eficaz do Espírito)\n  └── Perseverança dos Santos (Segurança eterna em Cristo)',
    summary_snippet: 'Visão panorâmica dos 5 pontos de Dort e o confronto teológico com a Remonstrância Arminiana.',
    tags: ['Dort', 'TULIP', 'Graça Soberana'],
    author_name: 'Monitoria Oficial',
    author_role: 'monitor',
    created_at: '2026-08-25T23:00:00Z',
  },

  // ── ACONSELHAMENTO BÍBLICO II ──
  {
    id: 'gemini-doc-3',
    disciplina_id: 'disc-3',
    disciplina_name: 'Aconselhamento Bíblico II',
    aula_num: 1,
    data_aula: '12/08/2026',
    title: 'Anotações Gemini • Aula 1 • A Suficiência das Escrituras na Alma',
    gemini_url: 'https://docs.google.com/document/d/1y8xcU3pw0f7esxxJTpp13oV2Oc2j9YBy6E85bQqeQyY/edit?usp=meet_tnfm_calendar',
    tipo: 'anotacao',
    summary_snippet: 'Registro de transcrição: diagnóstico bíblico do coração (Pv 4:23), idolatria dos desejos e a graça terapêutica do Evangelho.',
    tags: ['Aconselhamento', 'Coração', 'Idolatria'],
    author_name: 'Monitoria Oficial',
    author_role: 'monitor',
    created_at: '2026-08-12T22:30:00Z',
  },
  {
    id: 'gemini-pod-3',
    disciplina_id: 'disc-3',
    disciplina_name: 'Aconselhamento Bíblico II',
    aula_num: 2,
    data_aula: '19/08/2026',
    title: 'Podcast NotebookLM • Aula 2 • Depressão, Ansiedade & Aconselhamento Pastoral',
    gemini_url: 'https://notebooklm.google.com/',
    tipo: 'audio_podcast',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration_formatted: '14:10',
    summary_snippet: 'Áudio imersivo do NotebookLM abordando a abordagem holística cristã: distinção entre causas orgânicas/físicas e lutas espirituais/emocionais, e o cuidado amoroso na mentoria cristã.',
    tags: ['Ansiedade', 'Depressão', 'Cuidado Pastoral', 'Podcast'],
    author_name: 'Profº Hilário Bispo',
    author_role: 'professor',
    created_at: '2026-08-19T22:45:00Z',
  },

  // ── DIREITOS HUMANOS ──
  {
    id: 'gemini-doc-4',
    disciplina_id: 'disc-4',
    disciplina_name: 'Direitos Humanos',
    aula_num: 1,
    data_aula: '12/08/2026',
    title: 'Anotações Gemini • Aula 1 • Imago Dei & Dignidade Humana',
    gemini_url: 'https://docs.google.com/document/d/19Y166a7POikgPYX5M3LzqA5MyGYPSydC2hdusz9EY4s/edit?usp=meet_tnfm_calendar',
    tipo: 'anotacao',
    summary_snippet: 'Fundamentação bíblica e filosófica da dignidade inalienável da pessoa humana baseada na criação à imagem e semelhança de Deus (Gn 1:26-27).',
    tags: ['Imago Dei', 'Dignidade', 'Ética'],
    author_name: 'Monitoria Oficial',
    author_role: 'monitor',
    created_at: '2026-08-12T23:00:00Z',
  },
  {
    id: 'gemini-guia-4',
    disciplina_id: 'disc-4',
    disciplina_name: 'Direitos Humanos',
    aula_num: 2,
    data_aula: '19/08/2026',
    title: 'Guia de Estudo & Flashcards • Gerações de Direitos & Justiça Bíblica',
    gemini_url: 'https://docs.google.com/document/d/1eelDiEw9B4mcCW0lxf9L26zjWpCBmnzQCXRp5TcUSRs/edit',
    tipo: 'guia_estudo',
    summary_snippet: 'Guia de fixação com 8 questões socráticas comparando as 3 gerações de Direitos Humanos (Liberdade, Igualdade, Fraternidade) com os princípios de justiça distributiva dos profetas do AT.',
    tags: ['Guia de Estudo', 'Gerações de Direitos', 'Profetas'],
    author_name: 'Profº David Bezerra',
    author_role: 'professor',
    created_at: '2026-08-19T23:15:00Z',
  },

  // ── ÉTICA CRISTÃ ──
  {
    id: 'gemini-doc-5',
    disciplina_id: 'disc-5',
    disciplina_name: 'Ética Cristã',
    aula_num: 1,
    data_aula: '13/08/2026',
    title: 'Anotações Gemini • Aula 1 • Princípios Éticos do Reino de Deus',
    gemini_url: 'https://docs.google.com/document/d/1c0qeSjuKMonuiDT0Fh11fKBu1mvl4KQIGOF57Fwlsso/edit?usp=meet_tnfm_calendar',
    tipo: 'anotacao',
    summary_snippet: 'Registro de transcrição e tópicos: deontologia cristã, teleologia do Reino e a ética do Sermão do Monte.',
    tags: ['Sermão do Monte', 'Deontologia', 'Reino de Deus'],
    author_name: 'Monitoria Oficial',
    author_role: 'monitor',
    created_at: '2026-08-13T22:30:00Z',
  },
  {
    id: 'gemini-map-5',
    disciplina_id: 'disc-5',
    disciplina_name: 'Ética Cristã',
    aula_num: 2,
    data_aula: '20/08/2026',
    title: 'Mapa Mental • Dilemas Éticos & Tomada de Decisão Pastoral',
    gemini_url: 'https://docs.google.com/document/d/1sktGHfbZHCqlmd_Bh4xbmyIZGWf7iMzlA67KyGFRBHc/edit',
    tipo: 'mapa_mental',
    mindmap_data: '• Tomada de Decisão Cristã\n  ├── Critério Normativo (A Palavra de Deus)\n  ├── Critério Situacional (O contexto e o próximo)\n  └── Critério Existencial (A integridade do coração regenerado)',
    summary_snippet: 'Modelo triperspectival de John Frame aplicado à resolução de conflitos éticos no ministério pastoral.',
    tags: ['Triperspectivismo', 'John Frame', 'Mapa Mental'],
    author_name: 'Monitoria Oficial',
    author_role: 'monitor',
    created_at: '2026-08-20T23:00:00Z',
  },

  // ── NOVO TESTAMENTO III ──
  {
    id: 'gemini-doc-6',
    disciplina_id: 'disc-6',
    disciplina_name: 'Novo Testamento III - Epístolas Gerais',
    aula_num: 1,
    data_aula: '13/08/2026',
    title: 'Anotações Gemini • Aula 1 • Introdução às Epístolas Gerais & Hebreus',
    gemini_url: 'https://docs.google.com/document/d/18Rh-IOXaP6TdKBcYF2RrLhjZvqgdFvk4LdlMUIvy4hg/edit?usp=meet_tnfm_calendar',
    tipo: 'anotacao',
    summary_snippet: 'Registro de aula: a superioridade de Cristo sobre anjos, Moisés e o sacerdócio levítico no livro de Hebreus.',
    tags: ['Hebreus', 'Cristologia', 'Novo Sacerdócio'],
    author_name: 'Monitoria Oficial',
    author_role: 'monitor',
    created_at: '2026-08-13T23:00:00Z',
  },
  {
    id: 'gemini-pod-6',
    disciplina_id: 'disc-6',
    disciplina_name: 'Novo Testamento III - Epístolas Gerais',
    aula_num: 2,
    data_aula: '20/08/2026',
    title: 'Podcast NotebookLM • Aula 2 • Tiago & A Fé Viva em Ação',
    gemini_url: 'https://notebooklm.google.com/',
    tipo: 'audio_podcast',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration_formatted: '11:50',
    summary_snippet: 'Síntese em áudio: a harmonia entre a justificação pela fé de Paulo e a justificação pelas obras/frutos em Tiago.',
    tags: ['Tiago', 'Fé e Obras', 'Podcast'],
    author_name: 'Profº Hilário Bispo',
    author_role: 'professor',
    created_at: '2026-08-20T23:30:00Z',
  },

  // ── TCC I ──
  {
    id: 'gemini-doc-8',
    disciplina_id: 'disc-8',
    disciplina_name: 'TCC I',
    aula_num: 1,
    data_aula: '14/08/2026',
    title: 'Anotações Gemini • Aula 1 • Escolha do Tema & Problema de Pesquisa',
    gemini_url: 'https://docs.google.com/document/d/1UorXk-6NWK13-h3orl58FYHtnPLLFgJoeKs3y_xUies/edit?usp=meet_tnfm_calendar',
    tipo: 'anotacao',
    summary_snippet: 'Diretrizes metodológicas: delimitação temática, elaboração do problema de pesquisa e hipóteses preliminares.',
    tags: ['Metodologia', 'Problema de Pesquisa', 'TCC'],
    author_name: 'Monitoria Oficial',
    author_role: 'monitor',
    created_at: '2026-08-14T22:30:00Z',
  },
  {
    id: 'gemini-guia-8',
    disciplina_id: 'disc-8',
    disciplina_name: 'TCC I',
    aula_num: 2,
    data_aula: '21/08/2026',
    title: 'Guia de Estudo & Checklist • Normas ABNT & Projeto de Pesquisa',
    gemini_url: 'https://docs.google.com/document/d/13-BgUMgynR6ZMXkXeRSvu_8_RJvnz7ib1WBa06t03Bo/edit',
    tipo: 'guia_estudo',
    summary_snippet: 'Roteiro prático para estruturar Justificativa, Objetivos (Geral e Específicos) e Metodologia Científica.',
    tags: ['ABNT', 'Justificativa', 'Objetivos'],
    author_name: 'Profª Gabriela Leal',
    author_role: 'professor',
    created_at: '2026-08-21T22:45:00Z',
  },
];

export function getAllGeminiNotes(): GeminiNoteItem[] {
  if (typeof window === 'undefined') return INITIAL_GEMINI_NOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GEMINI_NOTES));
      return INITIAL_GEMINI_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const seedMap = new Map(INITIAL_GEMINI_NOTES.map((s) => [s.id, s]));
      let hasChanges = false;
      const updatedList = parsed.map((item: GeminiNoteItem) => {
        if (seedMap.has(item.id)) {
          const seed = seedMap.get(item.id)!;
          if (
            seed.gemini_url !== item.gemini_url ||
            seed.title !== item.title ||
            seed.tipo !== item.tipo ||
            seed.audio_url !== item.audio_url
          ) {
            hasChanges = true;
            return {
              ...item,
              ...seed,
            };
          }
        }
        return item;
      });

      const existingIds = new Set(updatedList.map((item: GeminiNoteItem) => item.id));
      const missingSeeds = INITIAL_GEMINI_NOTES.filter((seed) => !existingIds.has(seed.id));
      if (missingSeeds.length > 0) {
        hasChanges = true;
        updatedList.push(...missingSeeds);
      }

      if (hasChanges) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      }
      return updatedList;
    }
    return INITIAL_GEMINI_NOTES;
  } catch (e) {
    console.error('[GeminiNotes] Erro ao ler anotações do storage:', e);
    return INITIAL_GEMINI_NOTES;
  }
}

export function saveAllGeminiNotes(list: GeminiNoteItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('lms_gemini_notes_updated', { detail: list }));
    syncGeminiNotesToCloud(list);
  } catch (e) {
    console.error('[GeminiNotes] Erro ao salvar anotações:', e);
  }
}

export async function syncGeminiNotesToCloud(list: GeminiNoteItem[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const jsonStr = JSON.stringify(list);
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', CLOUD_TITLE_KEY)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('materiais')
        .update({ file_url: jsonStr, updated_at: new Date().toISOString() })
        .eq('id', existing[0].id);
    } else {
      await supabase.from('materiais').insert([
        {
          disciplina_id: 'global-cloud-gemini',
          title: CLOUD_TITLE_KEY,
          file_url: jsonStr,
          file_type: 'json',
          is_native_upload: false,
        },
      ]);
    }
  } catch (err) {
    console.warn('[GeminiNotes] Falha na sincronização cloud:', err);
  }
}

export async function fetchGeminiNotesFromCloud(): Promise<GeminiNoteItem[]> {
  if (typeof window === 'undefined') return INITIAL_GEMINI_NOTES;
  try {
    const { data } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', CLOUD_TITLE_KEY)
      .limit(1);

    if (data && data.length > 0 && data[0].file_url) {
      const parsed = JSON.parse(data[0].file_url);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        window.dispatchEvent(new CustomEvent('lms_gemini_notes_updated', { detail: parsed }));
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[GeminiNotes] Falha ao baixar anotações do Supabase:', err);
  }
  return getAllGeminiNotes();
}

if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    fetchGeminiNotesFromCloud();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchGeminiNotesFromCloud();
    }
  });
}

export function getGeminiNotesForDisciplina(disciplinaId: string): GeminiNoteItem[] {
  const all = getAllGeminiNotes();
  if (!disciplinaId) return all;
  return all.filter((item) => item.disciplina_id === disciplinaId);
}

export function addGeminiNote(
  item: Omit<GeminiNoteItem, 'id' | 'created_at'>
): GeminiNoteItem {
  const newItem: GeminiNoteItem = {
    ...item,
    id: `gemini-doc-${Date.now()}`,
    tipo: item.tipo || 'anotacao',
    created_at: new Date().toISOString(),
  };

  const current = getAllGeminiNotes();
  const next = [newItem, ...current];
  saveAllGeminiNotes(next);
  return newItem;
}

export function updateGeminiNote(
  id: string,
  patch: Partial<GeminiNoteItem>
): GeminiNoteItem | null {
  const current = getAllGeminiNotes();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: GeminiNoteItem = {
    ...current[index],
    ...patch,
  };

  const next = [...current];
  next[index] = updated;
  saveAllGeminiNotes(next);
  return updated;
}

export function deleteGeminiNote(id: string): void {
  const current = getAllGeminiNotes();
  const next = current.filter((item) => item.id !== id);
  saveAllGeminiNotes(next);
}
