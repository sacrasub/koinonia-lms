/**
 * pesquisaCampoService.ts
 * =========================================================================
 * Módulo de Pesquisa de Campo & Diagnóstico do TCC
 * Trabalho de Conclusão de Curso em Teologia: Cristiano Sacramento Soares
 * Seminário Teológico Koinonia (UNIB / UIECB)
 *
 * Tema: "Estratégias Eficazes para o Ensino Teológico no Ambiente Virtual:
 *        Distância Transacional, Preservação da Koinonia e a Transição
 *        do Internato Presencial para o Modelo Síncrono Remoto"
 * =========================================================================
 */

import { supabase } from '@/lib/supabaseClient';
import { cleanupBulkyLocalStorage } from './studentSyncService';

export type TipoPublico = 
  | 'aluno_unib' 
  | 'professor_unib' 
  | 'monitor_unib' 
  | 'externo_pastor' 
  | 'externo_aluno' 
  | 'externo_lider' 
  | 'externo_membro';

export type OrigemPesquisa = 'interno_lms' | 'whatsapp_externo' | 'link_direto';

export interface DadosIdentificacao {
  nome?: string;
  email?: string;
  whatsapp?: string;
  igreja?: string;
  cidade_uf?: string;
  funcao?: string;
  tempo_ministerio?: string;
}

export interface TCCPesquisaCampoRecord {
  id?: string;
  user_id?: string | null;
  user_email?: string | null;
  tipo_publico: TipoPublico;
  dados_identificacao?: DadosIdentificacao;
  autorizou_tcc: boolean;
  origem?: OrigemPesquisa;
  respostas: Record<string, any>;
  created_at?: string;
}

export const TIPO_PUBLICO_LABELS: Record<TipoPublico, { label: string; emoji: string; grupo: 'interno' | 'externo'; badgeColor: string }> = {
  aluno_unib: {
    label: 'Aluno / Seminarista UNIB (Koinonia)',
    emoji: '🎓',
    grupo: 'interno',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  professor_unib: {
    label: 'Professor / Docente do Seminário',
    emoji: '👨‍🏫',
    grupo: 'interno',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  monitor_unib: {
    label: 'Monitor Acadêmico / Equipe de Apoio',
    emoji: '👑',
    grupo: 'interno',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  externo_pastor: {
    label: 'Pastor / Ministro Ordenado',
    emoji: '⛪',
    grupo: 'externo',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  externo_aluno: {
    label: 'Estudante de Teologia (Outra Instituição / EAD)',
    emoji: '📚',
    grupo: 'externo',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  externo_lider: {
    label: 'Líder de Ministério / Diácono / Presbítero',
    emoji: '🤝',
    grupo: 'externo',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  externo_membro: {
    label: 'Membro de Igreja / Interessado no Tema',
    emoji: '👥',
    grupo: 'externo',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
  },
};

export const DRAFT_STORAGE_KEY = 'lms_tcc_pesquisa_draft_v1';
export const COMPLETED_STORAGE_KEY = 'lms_tcc_pesquisa_completed_v1';

/**
 * Estrutura das Perguntas do Questionário de Diagnóstico
 */
export interface PerguntaDiagnostico {
  id: string;
  dimensao: 'distancia_transacional' | 'koinonia' | 'transicao_internato' | 'metodologias_ativas' | 'qualitativa';
  dimensaoTitulo: string;
  enunciado: string;
  descricao?: string;
  tipo: 'likert_5' | 'multipla_escolha' | 'texto';
  opcoes?: { valor: string; label: string }[];
  obrigatoria: boolean;
}

export const PERGUNTAS_PESQUISA_TCC: PerguntaDiagnostico[] = [
  // ── DIMENSÃO 1: DISTÂNCIA TRANSACIONAL (MOORE) ──
  {
    id: 'dt_dialogo_sincrono',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Distância Transacional de Michael G. Moore',
    enunciado: 'A realização de aulas síncronas ao vivo (Google Meet com câmeras e microfones abertos) e o diálogo frequente reduzem a sensação de distância psicológica entre professor e aluno.',
    descricao: 'Michael G. Moore define Distância Transacional como o espaço comunicacional e psicológico entre docentes e discentes, e não meramente a distância geográfica.',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'dt_estrutura_autonomia',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Distância Transacional de Michael G. Moore',
    enunciado: 'A disponibilização antecipada de pastas de materiais (Google Drive, Hub de Estudos e Aulas Gravadas) favorece minha autonomia e organização semanal.',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'dt_conciliacao_ministerio',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Distância Transacional de Michael G. Moore',
    enunciado: 'O modelo remoto síncrono permite conciliar de forma mais saudável os estudos teológicos com o ministério pastoral/eclesiástico e a convivência familiar.',
    tipo: 'likert_5',
    obrigatoria: true,
  },

  // ── DIMENSÃO 2: PRESERVAÇÃO DA KOINONIA (COMUNHÃO CRISTÃ) ──
  {
    id: 'koi_comunhao_digital',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Preservação da Koinonia (Comunhão Comunitária)',
    enunciado: 'É possível vivenciar verdadeira comunhão bíblica (koinonia), mutualidade e laços de amizade sinceros no ambiente virtual do Seminário.',
    descricao: 'Refere-se ao compartilhamento de vida, suporte em oração e senso de irmandade no corpo de Cristo.',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'koi_espacos_oracao_interacao',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Preservação da Koinonia (Comunhão Comunitária)',
    enunciado: 'Espaços colaborativos (momentos de oração antes da aula, fóruns e grupos de mentoria) fortalecem a identidade congregacional da turma.',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'koi_cuidado_pastoral_remoto',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Preservação da Koinonia (Comunhão Comunitária)',
    enunciado: 'Como você avalia a proximidade e o acolhimento pastoral dos professores e da liderança do Seminário no modelo virtual?',
    tipo: 'likert_5',
    obrigatoria: true,
  },

  // ── DIMENSÃO 3: TRANSIÇÃO DO INTERNATO PRESENCIAL PARA O MODELO SÍNCRONO REMOTO ──
  {
    id: 'tra_democratizacao_acesso',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Transição Histórica (Internato vs. Remoto Síncrono)',
    enunciado: 'A superação do modelo exclusivo de internato presencial democratizou o acesso vocacional, permitindo que líderes e pastores locais permaneçam servindo suas comunidades.',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'tra_formacao_carater_pratica',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Transição Histórica (Internato vs. Remoto Síncrono)',
    enunciado: 'A prática eclesiástica contínua na igreja local durante o curso compensa de forma positiva a ausência da convivência em tempo integral do internato.',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'tra_percepcao_formacao_integral',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Transição Histórica (Internato vs. Remoto Síncrono)',
    enunciado: 'Comparando os modelos, como você enxerga a solidez da formação ministerial no formato síncrono remoto atual?',
    tipo: 'multipla_escolha',
    opcoes: [
      { valor: 'superior_internato', label: 'Superior ao internato: conecta a teoria à prática imediata na igreja local' },
      { valor: 'equivalente_alta_qualidade', label: 'Equivalente com alta qualidade: atende com rigor acadêmico e espiritual' },
      { valor: 'complementar_desafios', label: 'Boa alternativa, mas com desafios na convivência e laços presenciais' },
      { valor: 'preferencia_presencial', label: 'Prefiro o modelo clássico presencial de internato' },
    ],
    obrigatoria: true,
  },

  // ── DIMENSÃO 4: PRÁTICAS METODOLÓGICAS ATIVAS ──
  {
    id: 'met_cornell_notebooklm',
    dimensao: 'metodologias_ativas',
    dimensaoTitulo: 'Dimensão 4: Inovações Pedagógicas & Metodologias Ativas',
    enunciado: 'Ferramentas como Caderno Cornell estruturado com IA, podcasts de síntese do NotebookLM e resumos integrados aumentam minha assimilação teológica.',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'met_laboratorios_praticos',
    dimensao: 'metodologias_ativas',
    dimensaoTitulo: 'Dimensão 4: Inovações Pedagógicas & Metodologias Ativas',
    enunciado: 'Recursos como Simulador Pastoral RPG, Estúdio de Homilética e Metaverso Bíblico 3D tornam o aprendizado mais aplicado e engajador.',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'met_recurso_destaque',
    dimensao: 'metodologias_ativas',
    dimensaoTitulo: 'Dimensão 4: Inovações Pedagógicas & Metodologias Ativas',
    enunciado: 'Qual das seguintes abordagens pedagógicas do LMS você considera de maior impacto para diminuir a distância e gerar comunhão?',
    tipo: 'multipla_escolha',
    opcoes: [
      { valor: 'aulas_sincronas_meet', label: 'Aulas síncronas ao vivo no Google Meet com debates abertos' },
      { valor: 'caderno_cornell_ia', label: 'Caderno Cornell & sínteses inteligentes com Gemini Pro' },
      { valor: 'rpg_pastoral_dilemas', label: 'Simulador Pastoral RPG para resolução de casos reais' },
      { valor: 'estudio_homiletica', label: 'Estúdio de Homilética e avaliação fraterna entre pares' },
      { valor: 'biblioteca_digital', label: 'Biblioteca Digital com 3.000 livros em PDF e citações ABNT' },
      { valor: 'metaverso_3d', label: 'Metaverso Bíblico 3D com arqueologia do Tabernáculo e Templo' },
    ],
    obrigatoria: true,
  },

  // ── DIMENSÃO 5: QUALITATIVA & CONSIDERAÇÕES FINAIS ──
  {
    id: 'obs_maiores_desafios',
    dimensao: 'qualitativa',
    dimensaoTitulo: 'Dimensão 5: Considerações Finais & Avaliação Qualitativa',
    enunciado: 'Em sua percepção, quais são os maiores desafios ou oportunidades no ensino teológico virtual síncrono?',
    descricao: 'Sua resposta aberta será de fundamental importância para a análise qualitativa do TCC.',
    tipo: 'texto',
    obrigatoria: false,
  },
  {
    id: 'obs_sugestoes_livres',
    dimensao: 'qualitativa',
    dimensaoTitulo: 'Dimensão 5: Considerações Finais & Avaliação Qualitativa',
    enunciado: 'Espaço aberto: registre observações críticas, sugestões ou depoimentos para a pesquisa de Cristiano Sacramento Soares:',
    tipo: 'texto',
    obrigatoria: false,
  },
];

/**
 * Salva rascunho de preenchimento localmente para evitar perda de dados
 */
export function saveDraftToLocalStorage(draft: Partial<TCCPesquisaCampoRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch (e) {
    cleanupBulkyLocalStorage();
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (_) {}
  }
}

/**
 * Recupera o rascunho salvo do localStorage
 */
export function getDraftFromLocalStorage(): Partial<TCCPesquisaCampoRecord> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Limpa o rascunho após submissão bem-sucedida
 */
export function clearDraftFromLocalStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (_) {}
}

/**
 * Submete a resposta da pesquisa (Zero-Waste Egress)
 */
export async function submitPesquisaCampo(
  record: Omit<TCCPesquisaCampoRecord, 'id' | 'created_at'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!record.autorizou_tcc) {
    return { success: false, error: 'O consentimento (TCLE) é obrigatório para registrar a resposta.' };
  }

  try {
    // 1. Envia para a API especializada
    const res = await fetch('/api/tcc/pesquisa-campo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      clearDraftFromLocalStorage();
      if (typeof window !== 'undefined') {
        localStorage.setItem(COMPLETED_STORAGE_KEY, 'true');
      }
      return { success: true, id: data.id };
    }

    // Fallback: Tentativa direta via client do Supabase caso a rota falhe
    const { data: inserted, error: sbError } = await supabase
      .from('tcc_pesquisa_respostas')
      .insert([record])
      .select('id')
      .single();

    if (!sbError && inserted) {
      clearDraftFromLocalStorage();
      if (typeof window !== 'undefined') {
        localStorage.setItem(COMPLETED_STORAGE_KEY, 'true');
      }
      return { success: true, id: inserted.id };
    }

    return { success: false, error: data.error || sbError?.message || 'Falha ao salvar no banco de dados.' };
  } catch (err: any) {
    console.error('[PesquisaCampo] Erro ao submeter:', err);
    return { success: false, error: err.message || 'Erro de conexão ao enviar resposta.' };
  }
}

/**
 * Busca estatísticas agregadas e respostas para o Painel do Administrador
 * Projeção ultra-estrita para não consumir egress
 */
export async function getPesquisaCampoAdminData(): Promise<{
  total: number;
  byPublico: Record<TipoPublico, number>;
  records: Array<{
    id: string;
    tipo_publico: TipoPublico;
    nome?: string;
    igreja?: string;
    cidade_uf?: string;
    origem: string;
    created_at: string;
    autorizou_tcc: boolean;
    respostasCount: number;
    likertAverage: number;
    respostas: Record<string, any>;
  }>;
}> {
  try {
    // Projeção estrita de colunas
    const { data, error } = await supabase
      .from('tcc_pesquisa_respostas')
      .select('id, tipo_publico, created_at, autorizou_tcc, dados_identificacao, origem, respostas')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[PesquisaCampo] Falha ao carregar admin data:', error);
      return { total: 0, byPublico: {} as any, records: [] };
    }

    const byPublico: Record<string, number> = {};
    const records = data.map((row: any) => {
      byPublico[row.tipo_publico] = (byPublico[row.tipo_publico] || 0) + 1;

      const resp = row.respostas || {};
      const likertValues: number[] = [];
      Object.entries(resp).forEach(([k, val]) => {
        if (typeof val === 'number' && val >= 1 && val <= 5) {
          likertValues.push(val);
        }
      });

      const avg = likertValues.length > 0 
        ? Number((likertValues.reduce((a, b) => a + b, 0) / likertValues.length).toFixed(2)) 
        : 0;

      return {
        id: row.id,
        tipo_publico: row.tipo_publico,
        nome: row.dados_identificacao?.nome || 'Anônimo / Não informado',
        igreja: row.dados_identificacao?.igreja || '',
        cidade_uf: row.dados_identificacao?.cidade_uf || '',
        origem: row.origem || 'organico',
        created_at: row.created_at,
        autorizou_tcc: row.autorizou_tcc,
        respostasCount: Object.keys(resp).length,
        likertAverage: avg,
        respostas: resp,
      };
    });

    return {
      total: data.length,
      byPublico: byPublico as Record<TipoPublico, number>,
      records,
    };
  } catch (err) {
    console.error('[PesquisaCampo] Erro admin:', err);
    return { total: 0, byPublico: {} as any, records: [] };
  }
}
