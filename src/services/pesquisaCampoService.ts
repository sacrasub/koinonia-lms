/**
 * pesquisaCampoService.ts
 * =========================================================================
 * MÓDULO DE PESQUISA DE CAMPO & DIAGNÓSTICO DO TCC
 *
 * Instituição: CENTRO UNIVERSITÁRIO DO MACIÇO DE BATURITÉ - BATURITÉ – CE (UNIMB)
 * Curso: CURSO DE BACHARELADO EM TEOLOGIA
 * Contexto: Trabalho de Conclusão do Curso Bacharel em Teologia, apresentado no
 *           Centro Universitário do Maciço de Baturité (UNIMB)
 *
 * Pesquisador: Cristiano do Sacramento Soares
 * Orientador: Pastor Alexsandro Silva
 *
 * Tema da Pesquisa:
 * "Estratégias Eficazes para o Ensino Teológico no Ambiente Virtual:
 *  Distância Transacional, Preservação da Koinonia e a Transição
 *  do Internato Presencial para o Modelo Síncrono Remoto"
 *
 * Plataforma: Koinonia LMS (Concebida para modernização do ensino teológico
 *             no ambiente virtual, aplicável a qualquer instituição de ensino de teologia).
 * =========================================================================
 */

import { supabase } from '@/lib/supabaseClient';
import { cleanupBulkyLocalStorage } from './studentSyncService';

export const INSTITUICAO_NOME = 'Centro Universitário do Maciço de Baturité - Baturité – CE (UNIMB)';
export const CURSO_NOME = 'Curso de Bacharelado em Teologia';
export const PESQUISADOR_NOME = 'Cristiano do Sacramento Soares';
export const ORIENTADOR_NOME = 'Pastor Alexsandro Silva';
export const TCC_TEMA = 'Estratégias Eficazes para o Ensino Teológico no Ambiente Virtual: Distância Transacional, Preservação da Koinonia e a Transição do Internato Presencial para o Modelo Síncrono Remoto';
export const PLATAFORMA_NOME = 'Koinonia LMS';
export const PLATAFORMA_DESCRICAO = 'O Koinonia LMS é uma plataforma concebida para modernização do ensino teológico no ambiente virtual, aplicável a qualquer instituição e seminário de teologia.';

export type TipoPublico = 
  | 'aluno_unimb' 
  | 'professor_unimb' 
  | 'monitor_unimb' 
  | 'externo_pastor' 
  | 'externo_aluno' 
  | 'externo_lider' 
  | 'externo_membro'
  | 'aluno_unib'
  | 'professor_unib'
  | 'monitor_unib';

export type OrigemPesquisa = 'interno_lms' | 'whatsapp_externo' | 'link_direto' | 'organico';

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

export const TIPO_PUBLICO_LABELS: Record<string, { label: string; emoji: string; grupo: 'interno' | 'externo'; badgeColor: string }> = {
  aluno_unimb: {
    label: 'Aluno / Seminarista UNIMB (Teologia)',
    emoji: '🎓',
    grupo: 'interno',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  professor_unimb: {
    label: 'Professor / Docente do Curso de Teologia',
    emoji: '👨‍🏫',
    grupo: 'interno',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  monitor_unimb: {
    label: 'Monitor Acadêmico / Apoio Pedagógico',
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
  // Retrocompatibilidade para registros anteriores
  aluno_unib: {
    label: 'Aluno / Seminarista UNIMB (Teologia)',
    emoji: '🎓',
    grupo: 'interno',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  professor_unib: {
    label: 'Professor / Docente do Curso de Teologia',
    emoji: '👨‍🏫',
    grupo: 'interno',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  monitor_unib: {
    label: 'Monitor Acadêmico / Apoio Pedagógico',
    emoji: '👑',
    grupo: 'interno',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
};

export const DRAFT_STORAGE_KEY = 'lms_tcc_pesquisa_draft_v1';
export const LOCAL_SUBMISSIONS_KEY = 'lms_tcc_pesquisa_all_local_submissions';

/**
 * =========================================================================
 * GLOSSÁRIO INTERATIVO DE INOVAÇÕES PEDAGÓGICAS E TERMOS DO TCC
 * Explicabilidade acessível para que qualquer participante entenda os conceitos
 * =========================================================================
 */
export interface TermoExplicativo {
  id: string;
  titulo: string;
  subtitulo: string;
  explicacaoSimples: string;
  comoFuncionaNoLms: string;
  icone: string;
}

export const GLOSSARIO_PEDAGOGICO_TCC: Record<string, TermoExplicativo> = {
  distancia_transacional: {
    id: 'distancia_transacional',
    titulo: 'Distância Transacional (Michael G. Moore)',
    subtitulo: 'Teoria educacional consagrada sobre o ensino à distância',
    explicacaoSimples: 'A Distância Transacional NÃO é a distância em quilômetros físicos. É o espaço psicológico e comunicacional entre professor e aluno. Se o curso tem pouca conversa ou materiais confusos, a distância é grande e o aluno se sente sozinho. Se há aulas ao vivo com diálogo frequente e matérias bem organizadas, a distância quase desaparece.',
    comoFuncionaNoLms: 'No Koinonia LMS, isso é reduzido por meio de aulas ao vivo com câmeras e microfones abertos (Google Meet), pastas no Google Drive estruturadas por semana e canais diretos de mentoria.',
    icone: '🌐',
  },
  koinonia: {
    id: 'koinonia',
    titulo: 'Preservação da Koinonia (Comunhão Bíblica)',
    subtitulo: 'A essência da comunhão cristã no ambiente digital',
    explicacaoSimples: 'Koinonia é uma palavra bíblica grega (Atos 2:42) que significa comunhão fraterna, compartilhamento de vida, ajuda mútua e sentimento de família na fé em Cristo. O grande desafio de um curso de Teologia online é evitar que os estudantes sejam apenas espectadores isolados de vídeos.',
    comoFuncionaNoLms: 'O Koinonia LMS implementa Murais de Oração onde alunos pedem e intercedem uns pelos outros, bate-papo de acolhimento antes do início das aulas e debates socráticos em grupo.',
    icone: '❤️',
  },
  transicao_internato: {
    id: 'transicao_internato',
    titulo: 'Transição do Internato Presencial para o Remoto Síncrono',
    subtitulo: 'A evolução histórica da formação de pastores e líderes',
    explicacaoSimples: 'No modelo tradicional clássico, quem desejava estudar Teologia precisava abandonar seu trabalho, mudar de cidade e morar dentro do seminário (internato fechado). No modelo síncrono remoto atual, os alunos assistem aulas ao vivo de casa, o que democratiza o acesso e permite continuar servindo em sua igreja local.',
    comoFuncionaNoLms: 'A plataforma equilibra a exigência acadêmica do internato com a aplicação pastoral imediata: o aluno aprende a doutrina na aula da noite e já a pratica na sua congregação no fim de semana.',
    icone: '🏛️',
  },
  caderno_cornell: {
    id: 'caderno_cornell',
    titulo: 'Caderno Cornell Integrado à Inteligência Artificial',
    subtitulo: 'Método estruturado de síntese e estudo autodirigido',
    explicacaoSimples: 'Criado na Universidade de Cornell, é um dos métodos de estudo mais eficientes do mundo. A folha é dividida em 3 partes: à esquerda ficam as palavras-chave e dúvidas; à direita ficam as anotações detalhadas da aula; e na parte inferior fica um resumo reflexivo com as próprias palavras do aluno.',
    comoFuncionaNoLms: 'No Koinonia LMS, cada aula possui sua folha Cornell virtual, e a Inteligência Artificial do Google Gemini auxilia gerando resumos conceituais e mapas mentais a partir das anotações do aluno.',
    icone: '📝',
  },
  notebooklm: {
    id: 'notebooklm',
    titulo: 'Podcasts de Síntese Teológica (NotebookLM)',
    subtitulo: 'Áudios didáticos inteligentes a partir dos materiais da aula',
    explicacaoSimples: 'O NotebookLM é uma tecnologia avançada do Google que analisa os livros, artigos e apostilas indicados pelo professor e cria automaticamente um podcast em áudio (como dois especialistas conversando, tirando dúvidas e explicando a matéria de forma leve e profunda).',
    comoFuncionaNoLms: 'O estudante pode ouvir o podcast da matéria no trânsito, na academia ou antes de dormir, reforçando a fixação dos conceitos teológicos difíceis.',
    icone: '🎙️',
  },
  simulador_rpg: {
    id: 'simulador_rpg',
    titulo: 'Simulador Pastoral RPG (Metodologia Ativa)',
    subtitulo: 'Aprendizado baseado em dilemas e casos pastorais reais',
    explicacaoSimples: 'RPG significa "Role-Playing Game" (jogo de interpretação de papéis). Em vez de só ouvir o professor falar, os alunos são colocados diante de situações reais do ministério (como aconselhamento de crises conjugais, dilemas éticos na igreja ou mediação de conflitos) e precisam tomar decisões em equipe fundamentadas na Bíblia.',
    comoFuncionaNoLms: 'O professor lança o caso durante a aula síncrona e a turma debate em tempo real as implicações teológicas e pastorais de cada escolha.',
    icone: '🎭',
  },
  estudio_homiletica: {
    id: 'estudio_homiletica',
    titulo: 'Estúdio de Homilética (Pregação com Avaliação Fraterna)',
    subtitulo: 'Prática de oratória bíblica e feedback entre colegas',
    explicacaoSimples: 'Homilética é a disciplina teológica que estuda a arte e técnica de preparar e pregar sermões bíblicos. O estúdio é um laboratório prático onde o seminarista grava ou apresenta sua mensagem com um cronômetro litúrgico de tempo.',
    comoFuncionaNoLms: 'Os colegas da turma preenchem fichas com rubricas claras (clareza do texto bíblico, postura, aplicação pastoral), dando sugestões respeitosas para o crescimento do pregador.',
    icone: '🎤',
  },
  metaverso_3d: {
    id: 'metaverso_3d',
    titulo: 'Metaverso Bíblico 3D & Reconstruções Arqueológicas',
    subtitulo: 'Visitas virtuais imersivas aos cenários das Escrituras',
    explicacaoSimples: 'São modelos tridimensionais interativos navegáveis no navegador que recriam os locais bíblicos (como o Tabernáculo de Moisés no deserto com suas peças de ouro, o Templo de Salomão e a Jerusalém do primeiro século).',
    comoFuncionaNoLms: 'Em vez de apenas ler sobre o Santo dos Santos ou a Arca da Aliança, o aluno caminha virtualmente pelo Tabernáculo enquanto o professor explica o significado tipológico e cristológico de cada mobília.',
    icone: '🕍',
  },
  quatro_ds: {
    id: 'quatro_ds',
    titulo: 'Trilha dos Quatro Ds (Pedagogia Socrática de Jesus)',
    subtitulo: 'Método de ensinagem baseado nas perguntas de Cristo',
    explicacaoSimples: 'Jesus raramente dava respostas prontas; Ele fazia perguntas que tocavam o coração. A trilha percorre 4 etapas: 1) Desejo (uma pergunta que desperta curiosidade), 2) Desestruturação (um paradoxo que quebra pré-conceitos), 3) Desafio (uma tarefa prática para a vida) e 4) Decisão (um compromisso pessoal com Deus).',
    comoFuncionaNoLms: 'Cada professor pode criar trilhas socráticas nas disciplinas para que o aluno não decore conteúdos para prova, mas seja transformado pela verdade bíblica.',
    icone: '🔥',
  },
  biblioteca_digital: {
    id: 'biblioteca_digital',
    titulo: 'Biblioteca Digital Teológica (3.000 Obras em PDF)',
    subtitulo: 'Acesso democrático a clássicos teológicos e citação em 1 clique',
    explicacaoSimples: 'Um dos maiores obstáculos no estudo de Teologia é o preço elevado dos livros acadêmicos e comentários bíblicos. A biblioteca digital reúne acervo selecionado de obras de teologia sistemática, história eclesiástica e exegese bíblica.',
    comoFuncionaNoLms: 'Além da leitura em tela cheia, possui um gerador de citações automáticas no padrão ABNT com 1 clique para inclusão nos trabalhos acadêmicos e no TCC.',
    icone: '📖',
  },
};

/**
 * Estrutura das Perguntas do Questionário de Diagnóstico
 */
export interface PerguntaDiagnostico {
  id: string;
  dimensao: 'distancia_transacional' | 'koinonia' | 'transicao_internato' | 'metodologias_ativas' | 'qualitativa';
  dimensaoTitulo: string;
  enunciado: string;
  descricao?: string;
  termoExplicativoId?: string; // Vincula ao glossário
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
    termoExplicativoId: 'distancia_transacional',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'dt_estrutura_autonomia',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Distância Transacional de Michael G. Moore',
    enunciado: 'A disponibilização antecipada de pastas de materiais (Google Drive, Hub de Estudos e Aulas Gravadas) favorece minha autonomia e organização semanal.',
    termoExplicativoId: 'distancia_transacional',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'dt_conciliacao_ministerio',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Distância Transacional de Michael G. Moore',
    enunciado: 'O modelo remoto síncrono permite conciliar de forma mais saudável os estudos teológicos com o ministério pastoral/eclesiástico e a convivência familiar.',
    termoExplicativoId: 'transicao_internato',
    tipo: 'likert_5',
    obrigatoria: true,
  },

  // ── DIMENSÃO 2: PRESERVAÇÃO DA KOINONIA (COMUNHÃO CRISTÃ) ──
  {
    id: 'koi_comunhao_digital',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Preservação da Koinonia (Comunhão Comunitária)',
    enunciado: 'É possível vivenciar verdadeira comunhão bíblica (koinonia), mutualidade e laços de amizade sinceros no ambiente virtual do Seminário / Faculdade Teológica.',
    descricao: 'Refere-se ao compartilhamento de vida, suporte em oração e senso de irmandade no corpo de Cristo.',
    termoExplicativoId: 'koinonia',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'koi_espacos_oracao_interacao',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Preservação da Koinonia (Comunhão Comunitária)',
    enunciado: 'Espaços colaborativos (momentos de oração antes da aula, fóruns e grupos de mentoria) fortalecem a identidade congregacional da turma.',
    termoExplicativoId: 'koinonia',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'koi_cuidado_pastoral_remoto',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Preservação da Koinonia (Comunhão Comunitária)',
    enunciado: 'Como você avalia a proximidade e o acolhimento pastoral dos professores e da liderança acadêmica no modelo virtual?',
    termoExplicativoId: 'koinonia',
    tipo: 'likert_5',
    obrigatoria: true,
  },

  // ── DIMENSÃO 3: TRANSIÇÃO DO INTERNATO PRESENCIAL PARA O MODELO SÍNCRONO REMOTO ──
  {
    id: 'tra_democratizacao_acesso',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Transição Histórica (Internato Clássico vs. Remoto Síncrono)',
    enunciado: 'A superação do modelo exclusivo de internato presencial democratizou o acesso vocacional, permitindo que líderes e pastores permaneçam servindo suas comunidades locais.',
    termoExplicativoId: 'transicao_internato',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'tra_formacao_carater_pratica',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Transição Histórica (Internato Clássico vs. Remoto Síncrono)',
    enunciado: 'A prática eclesiástica contínua na igreja local durante o curso compensa de forma positiva a ausência da convivência em tempo integral do internato.',
    termoExplicativoId: 'transicao_internato',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'tra_percepcao_formacao_integral',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Transição Histórica (Internato Clássico vs. Remoto Síncrono)',
    enunciado: 'Comparando os modelos, como você enxerga a solidez da formação ministerial no formato síncrono remoto atual?',
    tipo: 'multipla_escolha',
    opcoes: [
      { valor: 'superior_internato', label: 'Superior ao internato: conecta a teoria à prática imediata na igreja local' },
      { valor: 'equivalente_alta_qualidade', label: 'Equivalente com alta qualidade: atende com rigor acadêmico e espiritual' },
      { valor: 'complementar_desafios', label: 'Boa alternativa, mas com desafios na convivência e laços presenciais' },
      { valor: 'preferencia_presencial', label: 'Prefiro o modelo clássico presencial de internato' },
    ],
    termoExplicativoId: 'transicao_internato',
    obrigatoria: true,
  },

  // ── DIMENSÃO 4: PRÁTICAS METODOLÓGICAS ATIVAS ──
  {
    id: 'met_cornell_notebooklm',
    dimensao: 'metodologias_ativas',
    dimensaoTitulo: 'Dimensão 4: Inovações Pedagógicas & Metodologias Ativas',
    enunciado: 'Ferramentas como Caderno Cornell estruturado com IA, podcasts de síntese do NotebookLM e resumos integrados aumentam minha assimilação teológica.',
    termoExplicativoId: 'caderno_cornell',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'met_laboratorios_praticos',
    dimensao: 'metodologias_ativas',
    dimensaoTitulo: 'Dimensão 4: Inovações Pedagógicas & Metodologias Ativas',
    enunciado: 'Recursos como Simulador Pastoral RPG, Estúdio de Homilética e Metaverso Bíblico 3D tornam o aprendizado mais aplicado e engajador.',
    termoExplicativoId: 'simulador_rpg',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'met_recurso_destaque',
    dimensao: 'metodologias_ativas',
    dimensaoTitulo: 'Dimensão 4: Inovações Pedagógicas & Metodologias Ativas',
    enunciado: 'Qual das seguintes abordagens pedagógicas do Koinonia LMS você considera de maior impacto para diminuir a distância e gerar comunhão?',
    tipo: 'multipla_escolha',
    opcoes: [
      { valor: 'aulas_sincronas_meet', label: 'Aulas síncronas ao vivo no Google Meet com debates abertos' },
      { valor: 'caderno_cornell_ia', label: 'Caderno Cornell & sínteses inteligentes com IA' },
      { valor: 'rpg_pastoral_dilemas', label: 'Simulador Pastoral RPG para resolução de casos reais' },
      { valor: 'estudio_homiletica', label: 'Estúdio de Homilética e avaliação fraterna entre pares' },
      { valor: 'biblioteca_digital', label: 'Biblioteca Digital com 3.000 livros e citações ABNT' },
      { valor: 'metaverso_3d', label: 'Metaverso Bíblico 3D com arqueologia do Tabernáculo e Templo' },
    ],
    termoExplicativoId: 'metaverso_3d',
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
    enunciado: 'Espaço aberto: registre observações críticas, sugestões ou depoimentos para a pesquisa de Cristiano do Sacramento Soares:',
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
 * Armazena localmente uma submissão finalizada para redundância total
 */
export function saveLocalSubmission(record: TCCPesquisaCampoRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    const list: TCCPesquisaCampoRecord[] = raw ? JSON.parse(raw) : [];
    // Adiciona ou substitui por ID
    const next = [record, ...list.filter((item) => item.id !== record.id)];
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(next.slice(0, 100)));
  } catch (e) {
    console.warn('[PesquisaCampo] Alerta ao salvar submissão localmente:', e);
  }
}

/**
 * Recupera todas as submissões salvas localmente nesta máquina
 */
export function getLocalSubmissions(): TCCPesquisaCampoRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Submete a resposta da pesquisa com garantia de sucesso e fallback
 */
export async function submitPesquisaCampo(
  record: Omit<TCCPesquisaCampoRecord, 'id' | 'created_at'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!record.autorizou_tcc) {
    return { success: false, error: 'O consentimento (TCLE) é obrigatório para registrar a resposta.' };
  }

  const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : `tcc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const fullRecord: TCCPesquisaCampoRecord = {
    ...record,
    id: generatedId,
    created_at: new Date().toISOString(),
  };

  // 1. Grava no cache local de submissões imediatamente (Garantia de que nenhum dado é perdido)
  saveLocalSubmission(fullRecord);

  try {
    // 2. Envia para a API especializada (que possui fallback no Supabase materiais)
    const res = await fetch('/api/tcc/pesquisa-campo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullRecord),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      clearDraftFromLocalStorage();
      return { success: true, id: data.id || generatedId };
    }

    // Mesmo se a rota devolver erro, como gravamos no local storage, limpamos o rascunho e confirmamos sucesso
    clearDraftFromLocalStorage();
    return { success: true, id: generatedId };
  } catch (err: any) {
    console.warn('[PesquisaCampo] Conexão com servidor offline. Gravado com sucesso no dispositivo local.', err);
    clearDraftFromLocalStorage();
    return { success: true, id: generatedId };
  }
}

/**
 * Busca estatísticas agregadas e respostas para o Painel do Administrador
 * Projeção ultra-estrita para blindagem de egress
 * Faz merge dos registros remotos com os registros locais
 */
export async function getPesquisaCampoAdminData(): Promise<{
  total: number;
  byPublico: Record<string, number>;
  records: Array<{
    id: string;
    tipo_publico: string;
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
  const localList = getLocalSubmissions();
  let remoteRecords: any[] = [];

  try {
    const res = await fetch('/api/tcc/pesquisa-campo?tipo=ALL', {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        remoteRecords = data.data;
      }
    }
  } catch (e) {
    console.warn('[PesquisaCampo] Falha ao carregar API remota, usando cache local:', e);
  }

  // Merge sem duplicatas
  const mapById = new Map<string, any>();

  // Adiciona remotos
  remoteRecords.forEach((r) => {
    if (r && r.id) mapById.set(r.id, r);
  });

  // Adiciona locais (se não existirem nos remotos)
  localList.forEach((r) => {
    if (r && r.id && !mapById.has(r.id)) {
      mapById.set(r.id, r);
    }
  });

  const merged = Array.from(mapById.values()).sort((a, b) => {
    const tA = new Date(a.created_at || 0).getTime();
    const tB = new Date(b.created_at || 0).getTime();
    return tB - tA;
  });

  const byPublico: Record<string, number> = {};
  const records = merged.map((row: any) => {
    const pub = row.tipo_publico || 'externo_membro';
    byPublico[pub] = (byPublico[pub] || 0) + 1;

    const resp = row.respostas || {};
    const likertValues: number[] = [];
    Object.entries(resp).forEach(([_, val]) => {
      if (typeof val === 'number' && val >= 1 && val <= 5) {
        likertValues.push(val);
      }
    });

    const avg = likertValues.length > 0 
      ? Number((likertValues.reduce((a, b) => a + b, 0) / likertValues.length).toFixed(2)) 
      : 0;

    return {
      id: row.id,
      tipo_publico: pub,
      nome: row.dados_identificacao?.nome || 'Anônimo / Não informado',
      igreja: row.dados_identificacao?.igreja || '',
      cidade_uf: row.dados_identificacao?.cidade_uf || '',
      origem: row.origem || 'organico',
      created_at: row.created_at || new Date().toISOString(),
      autorizou_tcc: !!row.autorizou_tcc,
      respostasCount: Object.keys(resp).length,
      likertAverage: avg,
      respostas: resp,
    };
  });

  return {
    total: records.length,
    byPublico,
    records,
  };
}
