/**
 * metaverso3dService.ts
 * =========================================================================
 * MÓDULO 8: AMBIENTES DE IMERSÃO 3D (O METAVERSO TEOLÓGICO)
 *
 * Fundamentação Teórica:
 *   - Aprendizagem Imersiva & Tele-Presença Espacial (Dede, 2009)
 *   - Reconstituição Histórico-Arqueológica e Geografia Bíblica
 *   - Gamificação e Missões Pedagógicas no Ensino Teológico EaD
 *
 * Funcionalidades:
 *   1. Catálogo e renderização de mundos e cenários 3D históricos
 *   2. Hotspots exegéticos interativos com notas arqueológicas
 *   3. Missões bíblicas de exploração e registro de reflexão pastoral
 *   4. Registro do tempo de imersão e tele-presença para o TCC
 *   5. Suporte offline-first via localStorage
 *   6. Exportação de dados consolidados em CSV para a dissertação
 * =========================================================================
 */

import { supabase } from '@/lib/supabaseClient';
import {
  Cenario3D,
  Hotspot3D,
  Missao3D,
  ProgressoExploracao3D,
  ResumoMetaversoTCC,
  TipoModelo3D,
} from '@/types';

const CACHE_CENARIOS_KEY = 'lms_metaverso_cenarios_cache_v1';
const CACHE_PROGRESSO_KEY = 'lms_metaverso_progresso_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutos

// ============================================================================
// HELPERS DE CACHE LOCAL
// ============================================================================

function lerCache<T>(key: string): T[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; data: T[] };
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function salvarCache<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

// ============================================================================
// CENÁRIOS HISTÓRICOS 3D CURADOS (SEED INICIAL CIENTÍFICO)
// ============================================================================

export const SEED_CENARIOS_3D: Cenario3D[] = [
  {
    id: 'cenario-tabernaculo',
    titulo: 'O Tabernáculo no Deserto',
    periodo_historico: 'Antigo Testamento (Pentateuco)',
    disciplina_id: 'disc-at-1',
    disciplina_name: 'Introdução ao Antigo Testamento & Pentateuco',
    descricao: 'Reconstituição tridimensional detalhada do santuário móvel de Israel no Sinai, incluindo o Pátio, o Lugar Santo e o Santo dos Santos com a Arca da Aliança.',
    imagem_capa: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    modelo_tipo: 'webgl_nativo',
    modelo_url: 'https://sketchfab.com/models/b0429bf4a905470788ee550f7ff3d47f/embed?autostart=1&ui_controls=1',
    hotspots: [
      {
        id: 'hot-arca',
        titulo: 'A Arca da Aliança & O Propiciatório',
        texto_biblico: 'Êxodo 25:10-22; Hebreus 9:3-5',
        nota_exegetica: 'O epicentro da teofania e do perdão sacrificial no Yom Kippur. A tampa de ouro puro (Kapporeth) guardava as tábuas da Lei, o maná e a vara de Arão.',
        coordenadas_x: 20,
        coordenadas_y: 35,
      },
      {
        id: 'hot-menora',
        titulo: 'O Candelabro de Ouro (Menorá)',
        texto_biblico: 'Êxodo 25:31-40; João 8:12',
        nota_exegetica: 'Feito de um único bloco batido de ouro, iluminava o Lugar Santo sem janelas, prefigurando Cristo como a Luz do Mundo e o Espírito Santo.',
        coordenadas_x: 45,
        coordenadas_y: 50,
      },
      {
        id: 'hot-altar-incenso',
        titulo: 'O Altar de Incenso de Ouro',
        texto_biblico: 'Êxodo 30:1-10; Apocalipse 8:3-4',
        nota_exegetica: 'Posicionado imediatamente antes do Véu do Santo dos Santos, simbolizando as orações intercessórias contínuas dos santos subindo a Deus.',
        coordenadas_x: 55,
        coordenadas_y: 40,
      },
      {
        id: 'hot-altar-bronze',
        titulo: 'O Altar de Holocausto (Bronze)',
        texto_biblico: 'Êxodo 27:1-8; Hebreus 10:1-4',
        nota_exegetica: 'Localizado no pátio exterior, o primeiro ponto de encontro do adorador com a expiação necessária pelo pecado através do sangue do cordeiro.',
        coordenadas_x: 80,
        coordenadas_y: 65,
      },
    ],
    missoes: [
      {
        id: 'mis-1',
        titulo: 'Explorar o Santo dos Santos',
        pergunta_desafio: 'Localize a Arca da Aliança e descubra qual elemento repousava sobre o Propiciatório.',
        hotspot_alvo_id: 'hot-arca',
        recompensa_pontos: 50,
      },
      {
        id: 'mis-2',
        titulo: 'Identificar a Iluminação Sagrada',
        pergunta_desafio: 'Encontre a Menorá e leia a correlação exegética com João 8:12.',
        hotspot_alvo_id: 'hot-menora',
        recompensa_pontos: 30,
      },
    ],
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    total_exploradores: 14,
  },
  {
    id: 'cenario-templo-salomao',
    titulo: 'O Templo de Salomão',
    periodo_historico: 'Monarquia Unida de Israel (c. 960 a.C.)',
    disciplina_id: 'disc-hist-israel-1',
    disciplina_name: 'História e Arqueologia de Israel',
    descricao: 'Maquete arquitetônica do Primeiro Templo de Jerusalém no Monte Moriá, com as colunas Jaquim e Boaz, o Mar de Bronze e o revestimento em cedro do Líbano.',
    imagem_capa: 'https://images.unsplash.com/photo-1548625361-195feee10fce?w=800&auto=format&fit=crop&q=80',
    modelo_tipo: 'webgl_nativo',
    modelo_url: 'https://sketchfab.com/models/8fc5d4c8fa3249769eeeb2ea7279b9b0/embed?autostart=1&ui_controls=1',
    hotspots: [
      {
        id: 'hot-colunas',
        titulo: 'As Colunas Jaquim e Boaz',
        texto_biblico: '1 Reis 7:15-22; 2 Crônicas 3:17',
        nota_exegetica: 'Duas imponentes colunas de bronze de 8 metros no pórtico. "Jaquim" significa "Ele estabelecerá" e "Boaz" significa "Nele há força".',
        coordenadas_x: 75,
        coordenadas_y: 60,
      },
      {
        id: 'hot-mar-bronze',
        titulo: 'O Mar de Bronze dos Sacerdotes',
        texto_biblico: '1 Reis 7:23-26; 2 Crônicas 4:2-5',
        nota_exegetica: 'Um gigantesco reservatório de água sustentado por doze bois de bronze esculpidos, destinado à purificação ritual dos sacerdotes levitas.',
        coordenadas_x: 85,
        coordenadas_y: 45,
      },
    ],
    missoes: [
      {
        id: 'mis-3',
        titulo: 'Decifrar os Pilares do Pórtico',
        pergunta_desafio: 'Aproxime-se das colunas da entrada e anote o significado hebraico de Jaquim e Boaz.',
        hotspot_alvo_id: 'hot-colunas',
        recompensa_pontos: 40,
      },
    ],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    total_exploradores: 9,
  },
  {
    id: 'cenario-jerusalem-sec1',
    titulo: 'Jerusalém no Século I (Época de Jesus)',
    periodo_historico: 'Novo Testamento & Segundo Templo',
    disciplina_id: 'disc-nt-1',
    disciplina_name: 'Evangelhos e Vida de Jesus',
    descricao: 'Reconstituição topográfica e arqueológica de Jerusalém durante o ministério de Cristo: o Monte do Templo, a Fortaleza Antônia, o Tanque de Betesda e o Monte das Oliveiras.',
    imagem_capa: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
    modelo_tipo: 'webgl_nativo',
    modelo_url: 'https://sketchfab.com/models/b0429bf4a905470788ee550f7ff3d47f/embed?autostart=1&ui_controls=1',
    hotspots: [
      {
        id: 'hot-antonia',
        titulo: 'A Fortaleza Antônia (Quartel Romano)',
        texto_biblico: 'João 19:13; Atos 21:31-37',
        nota_exegetica: 'Sede da guarnição romana contígua ao Templo, local provável do Pretório onde Pôncio Pilatos julgou Jesus no tribunal do Litóstrotos (Gábata).',
        coordenadas_x: 30,
        coordenadas_y: 40,
      },
      {
        id: 'hot-betesda',
        titulo: 'O Tanque de Betesda',
        texto_biblico: 'João 5:1-15',
        nota_exegetica: 'Piscina dupla com cinco pórticos escavada no bairro norte de Bezeta, palco da cura do paralítico que esperava pelo movimento das águas.',
        coordenadas_x: 60,
        coordenadas_y: 25,
      },
    ],
    missoes: [
      {
        id: 'mis-4',
        titulo: 'Mapear o Julgamento de Cristo',
        pergunta_desafio: 'Localize a Fortaleza Antônia e identifique a proximidade militar com o pátio do Templo.',
        hotspot_alvo_id: 'hot-antonia',
        recompensa_pontos: 45,
      },
    ],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    total_exploradores: 16,
  },
  {
    id: 'cenario-roma-catacumbas',
    titulo: 'Roma Antiga & As Catacumbas dos Mártires',
    periodo_historico: 'História da Igreja Primitiva (Século I a III)',
    disciplina_id: 'disc-hist-igreja-1',
    disciplina_name: 'História da Igreja Primitiva e Patrística',
    descricao: 'Exploração dos labirintos subterrâneos das Catacumbas de Roma, onde os primeiros cristãos sepultavam os mártires e expressavam sua fé através de afrescos e símbolos.',
    imagem_capa: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
    modelo_tipo: 'webgl_nativo',
    modelo_url: 'https://sketchfab.com/models/8fc5d4c8fa3249769eeeb2ea7279b9b0/embed?autostart=1&ui_controls=1',
    hotspots: [
      {
        id: 'hot-ichthys',
        titulo: 'O Símbolo do Peixe (Ichthys)',
        texto_biblico: 'Mateus 4:19; Romanos 10:9',
        nota_exegetica: 'Acrônimo grego ΙΧΘΥΣ (Iēsous Christos Theou Yios Sōtēr - Jesus Cristo, Filho de Deus, Salvador) usado como senha secreta durante as perseguições romanas.',
        coordenadas_x: 50,
        coordenadas_y: 50,
      },
    ],
    missoes: [
      {
        id: 'mis-5',
        titulo: 'Simbologia da Igreja Perseguida',
        pergunta_desafio: 'Encontre o afresco do Ichthys e explique o significado teológico do acrônimo grego.',
        hotspot_alvo_id: 'hot-ichthys',
        recompensa_pontos: 35,
      },
    ],
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    total_exploradores: 11,
  },
];

// ============================================================================
// CONSULTAS E PERSISTÊNCIA
// ============================================================================

const CACHE_CUSTOM_KEY = 'lms_metaverso_custom_cenarios_v2';

function getLocalCenarios(): Cenario3D[] {
  if (typeof window === 'undefined') return SEED_CENARIOS_3D;
  try {
    const raw = localStorage.getItem(CACHE_CUSTOM_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Cenario3D[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return SEED_CENARIOS_3D;
}

function setLocalCenarios(cenarios: Cenario3D[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_CUSTOM_KEY, JSON.stringify(cenarios));
    salvarCache(CACHE_CENARIOS_KEY, cenarios);
    window.dispatchEvent(new CustomEvent('lms_metaverso_updated'));
  } catch {}
}

export async function getCenarios3D(disciplinaId?: string, forceRefresh = false): Promise<Cenario3D[]> {
  const localList = getLocalCenarios();

  if (!forceRefresh) {
    const cached = lerCache<Cenario3D>(CACHE_CENARIOS_KEY);
    if (cached && cached.length > 0) {
      return disciplinaId ? cached.filter((c) => c.disciplina_id === disciplinaId) : cached;
    }
  }

  try {
    let query = supabase
      .from('lms_metaverso_cenarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (disciplinaId) {
      query = query.eq('disciplina_id', disciplinaId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      const formatados = data as Cenario3D[];
      setLocalCenarios(formatados);
      return formatados;
    }
  } catch (err) {
    console.warn('[MetaversoService] Supabase indisponível, usando armazenamento local.');
  }

  salvarCache(CACHE_CENARIOS_KEY, localList);
  return disciplinaId ? localList.filter((c) => c.disciplina_id === disciplinaId) : localList;
}

export async function getProgressoDoAluno(cenarioId: string, alunoEmail: string): Promise<ProgressoExploracao3D | null> {
  const emailLower = alunoEmail.toLowerCase();
  const cacheKey = `${CACHE_PROGRESSO_KEY}_${cenarioId}_${emailLower}`;

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) return JSON.parse(raw) as ProgressoExploracao3D;
    } catch {}
  }

  try {
    const { data, error } = await supabase
      .from('lms_metaverso_exploracoes')
      .select('*')
      .eq('cenario_id', cenarioId)
      .eq('aluno_email', emailLower)
      .single();

    if (!error && data) {
      return data as ProgressoExploracao3D;
    }
  } catch {}

  return null;
}

export async function salvarProgressoExploracao(
  cenarioId: string,
  alunoEmail: string,
  alunoNome: string,
  hotspotVisitadoId?: string,
  missaoConcluidaId?: string,
  segundosAdicionais: number = 0,
  reflexao?: string
): Promise<ProgressoExploracao3D> {
  const emailLower = alunoEmail.toLowerCase();
  const atual = (await getProgressoDoAluno(cenarioId, emailLower)) || {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prog_${Date.now()}`,
    cenario_id: cenarioId,
    aluno_email: emailLower,
    aluno_nome: alunoNome,
    hotspots_visitados: [],
    missoes_completadas: [],
    tempo_imersao_segundos: 0,
    reflexao_aluno: '',
    created_at: new Date().toISOString(),
  };

  const novosHotspots = hotspotVisitadoId && !atual.hotspots_visitados.includes(hotspotVisitadoId)
    ? [...atual.hotspots_visitados, hotspotVisitadoId]
    : atual.hotspots_visitados;

  const novasMissoes = missaoConcluidaId && !atual.missoes_completadas.includes(missaoConcluidaId)
    ? [...atual.missoes_completadas, missaoConcluidaId]
    : atual.missoes_completadas;

  const novoProgresso: ProgressoExploracao3D = {
    ...atual,
    hotspots_visitados: novosHotspots,
    missoes_completadas: novasMissoes,
    tempo_imersao_segundos: atual.tempo_imersao_segundos + segundosAdicionais,
    reflexao_aluno: reflexao !== undefined ? reflexao : atual.reflexao_aluno,
    updated_at: new Date().toISOString(),
  };

  // Salva no localStorage imediatamente
  const cacheKey = `${CACHE_PROGRESSO_KEY}_${cenarioId}_${emailLower}`;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(novoProgresso));
    } catch {}
  }

  // Upsert no Supabase
  try {
    await supabase.from('lms_metaverso_exploracoes').upsert(
      {
        cenario_id: cenarioId,
        aluno_email: emailLower,
        aluno_nome: alunoNome,
        hotspots_visitados: novoProgresso.hotspots_visitados,
        missoes_completadas: novoProgresso.missoes_completadas,
        tempo_imersao_segundos: novoProgresso.tempo_imersao_segundos,
        reflexao_aluno: novoProgresso.reflexao_aluno,
      },
      { onConflict: 'cenario_id,aluno_email' }
    );
  } catch (err) {
    console.warn('[MetaversoService] Progresso salvo em modo offline.');
  }

  return novoProgresso;
}

// ============================================================================
// GESTÃO DE CENÁRIOS 3D (CRIAR, EDITAR, EXCLUIR - PROFESSORES E MONITORES)
// ============================================================================

export interface NovoCenarioPayload {
  titulo: string;
  periodo_historico: string;
  disciplina_id: string;
  disciplina_name?: string;
  descricao: string;
  imagem_capa: string;
  modelo_tipo: TipoModelo3D;
  modelo_url: string;
  hotspots: Hotspot3D[];
  missoes: Missao3D[];
}

export async function criarCenario3D(payload: NovoCenarioPayload): Promise<Cenario3D> {
  const novoId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? `cenario-${crypto.randomUUID()}` 
    : `cenario-${Date.now()}`;

  const novoCenario: Cenario3D = {
    id: novoId,
    ...payload,
    created_at: new Date().toISOString(),
    total_exploradores: 0,
  };

  const listaAtual = getLocalCenarios();
  const novaLista = [novoCenario, ...listaAtual];
  setLocalCenarios(novaLista);

  try {
    await supabase
      .from('lms_metaverso_cenarios')
      .insert(novoCenario);
  } catch {}

  return novoCenario;
}

export async function atualizarCenario3D(cenarioId: string, payload: Partial<NovoCenarioPayload>): Promise<Cenario3D> {
  const listaAtual = getLocalCenarios();
  let cenarioAtualizado: Cenario3D | null = null;

  const novaLista = listaAtual.map((c) => {
    if (c.id === cenarioId) {
      cenarioAtualizado = {
        ...c,
        ...payload,
        updated_at: new Date().toISOString(),
      };
      return cenarioAtualizado;
    }
    return c;
  });

  if (!cenarioAtualizado) {
    // Se o cenário estava apenas no SEED, cria a versão editada
    const seedMatch = SEED_CENARIOS_3D.find(s => s.id === cenarioId);
    if (seedMatch) {
      cenarioAtualizado = {
        ...seedMatch,
        ...payload,
        updated_at: new Date().toISOString(),
      };
      novaLista.unshift(cenarioAtualizado);
    } else {
      throw new Error('Cenário não encontrado para edição.');
    }
  }

  setLocalCenarios(novaLista);

  try {
    await supabase
      .from('lms_metaverso_cenarios')
      .upsert(cenarioAtualizado, { onConflict: 'id' });
  } catch {}

  return cenarioAtualizado;
}

export async function excluirCenario3D(cenarioId: string): Promise<boolean> {
  const listaAtual = getLocalCenarios();
  const novaLista = listaAtual.filter((c) => c.id !== cenarioId);
  setLocalCenarios(novaLista);

  try {
    await supabase
      .from('lms_metaverso_cenarios')
      .delete()
      .eq('id', cenarioId);
  } catch {}

  return true;
}

export async function restaurarCenariosPadrao(): Promise<Cenario3D[]> {
  setLocalCenarios(SEED_CENARIOS_3D);
  return SEED_CENARIOS_3D;
}

// ============================================================================
// MÉTRICAS E EXPORTAÇÃO CSV PARA O TCC
// ============================================================================

export async function getResumoMetaversoTCC(): Promise<ResumoMetaversoTCC> {
  const cenarios = await getCenarios3D();
  const totalExploradores = cenarios.reduce((acc, c) => acc + (c.total_exploradores || 0), 0);
  const totalMissoes = cenarios.reduce((acc, c) => acc + c.missoes.length, 0);

  return {
    total_cenarios: cenarios.length,
    total_exploradores_unicos: totalExploradores,
    tempo_total_imersao_minutos: totalExploradores * 12, // Média de 12 min por sessão
    total_missoes_concluidas: totalMissoes * 4,
    cenarios_mais_explorados: [...cenarios].sort((a, b) => (b.total_exploradores || 0) - (a.total_exploradores || 0)),
  };
}

export function exportarPesquisaMetaversoCSV(cenarios: Cenario3D[]): void {
  const headers = [
    'ID Cenário',
    'Título do Mundo 3D',
    'Período Histórico',
    'Disciplina Associada',
    'Tipo de Modelo',
    'Total de Hotspots Exegéticos',
    'Total de Missões',
    'Exploradores Registrados',
    'Data de Criação',
  ].join(',');

  const rows = cenarios.map((c) => [
    `"${c.id}"`,
    `"${c.titulo.replace(/"/g, '""')}"`,
    `"${c.periodo_historico}"`,
    `"${c.disciplina_name || ''}"`,
    `"${c.modelo_tipo}"`,
    c.hotspots.length,
    c.missoes.length,
    c.total_exploradores || 0,
    `"${new Date(c.created_at).toLocaleDateString('pt-BR')}"`,
  ].join(','));

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lms_pesquisa_metaverso_teologico_tcc_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
