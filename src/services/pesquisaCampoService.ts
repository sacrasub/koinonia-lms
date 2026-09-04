/**
 * pesquisaCampoService.ts
 * =========================================================================
 * MÓDULO DE PESQUISA DE CAMPO & DIAGNÓSTICO DO TCC
 *
 * Seminário: SEMINÁRIO TEOLÓGICO CONGREGACIONAL
 * Plataforma: KOINONIA LMS (Nome do Projeto LMS para Ensino Teológico Virtual)
 *
 * Instituição: CENTRO UNIVERSITÁRIO DO MACIÇO DE BATURITÉ - BATURITÉ – CE (UNIMB)
 * Curso: CURSO DE BACHARELADO EM TEOLOGIA
 * Contexto: Trabalho de Conclusão do Curso Bacharel em Teologia, apresentado no
 *           Centro Universitário do Maciço de Baturité (UNIMB)
 *
 * Pesquisador: Cristiano do Sacramento Soares
 * Orientador: Pastor Alexsandro Silva
 * Metodologia: Profª Gabriela Leal
 *
 * Metodologia Científica:
 * Estratificação de Atores & Triangulação Metodológica (Discentes, Docentes, Monitores, Pastores e Membros)
 * =========================================================================
 */

import { supabase } from '@/lib/supabaseClient';
import { cleanupBulkyLocalStorage } from './studentSyncService';

export const SEMINARIO_NOME = 'Seminário Teológico Congregacional – UIECB';
export const INSTITUICAO_NOME = 'Centro Universitário do Maciço de Baturité – UNIMB';
export const CURSO_NOME = 'Bacharelado em Teologia';
export const PESQUISADOR_NOME = 'Cristiano do Sacramento Soares';
export const ORIENTADOR_NOME = 'Pr. Alexsandro Silva';
export const COORDENADORA_TCC_NOME = 'Profª. Gabriela Leal';
export const METODOLOGIA_PROF = 'Profª. Gabriela Leal';
export const CIDADE_ESTADO = 'Baturité – CE, 2026';

export const TCC_TITULO_PRINCIPAL = 'O ENSINO TEOLÓGICO NO BRASIL: DO INTERNATO AO ENSINO MEDIADO POR TECNOLOGIAS';
export const TCC_SUBTITULO = 'Estratégias Eficazes para o Ensino Teológico no Ambiente Virtual: Distância Transacional, Preservação da Koinonia e a Transição do Internato Presencial para o Modelo Síncrono Remoto';
export const TCC_TEMA = `${TCC_TITULO_PRINCIPAL} — ${TCC_SUBTITULO}`;

export const TCC_PROBLEMA_PESQUISA = 'Como atenuar a distância transacional psicopedagógica e preservar a vivência da koinonia comunitária e espiritual durante o processo de transição do modelo histórico de internato residencial presencial para o modelo de ensino teológico superior síncrono remoto mediado por tecnologias virtuais?';

export const TCC_HIPOTESE = 'A superação dos desafios associados ao distanciamento geográfico e o sucesso do ensino teológico online de alta densidade formativa não dependem da mera transposição de conteúdos textuais ou do acúmulo passivo de informações no ambiente virtual. Postula-se que a mitigação da distância transacional psicopedagógica e a preservação da koinonia residem na implementação intencional de metodologias ativas de aprendizagem (como a aprendizagem baseada em problemas gamificada e simulações ministeriais), associadas à mediação tutorial proativa e contínua e à criação de espaços digitais de suporte e partilha de caráter comunitário (mural de orações e encontros síncronos). Essas dinâmicas são capazes de criar a sensação de "estar junto virtual" (presença social), transformando o ciberespaço em um autêntico laboratório relacional e eclesiológico.';

export const TCC_OBJETIVO_GERAL = 'Identificar e analisar estratégias didático-pedagógicas e tecnológicas eficazes para mitigar a distância transacional e preservar a koinonia na transição histórica do modelo teológico de internato presencial para o ambiente virtual de aprendizagem síncrono remoto, validando-as por meio de estudo de caso instrumental no Koinonia LMS.';

export const TCC_OBJETIVOS_ESPECIFICOS: string[] = [
  'Mapear a trajetória histórica do ensino teológico no Brasil, contrapondo o tradicional modelo de internato residencial às demandas socioeducacionais contemporâneas pela modalidade à distância;',
  'Investigar as implicações teóricas da distância transacional (Michael Moore) e da presença social no ambiente acadêmico teológico, articulando-as com o conceito confessional de koinonia;',
  'Explorar a aplicabilidade de metodologias inov-ativas de aprendizagem (aprendizagem baseada em problemas, caderno metacognitivo Cornell assistido por IA e gamificação) no desenvolvimento de competências prático-pastorais;',
  'Demonstrar as funcionalidades pedagógicas do Koinonia LMS como ferramenta instrumental de validação empírica e sandbox pedagógico, delineando sua arquitetura a serviço do combate ao isolamento discente.'
];

export const TCC_CAPITULOS_ESTRUTURA = [
  {
    capitulo: 'Capítulo I',
    titulo: 'Do Internato à Educação a Distância (Histórico e Confessionalidade)',
    descricao: 'A trajetória histórica desde os internatos católicos e protestantes do séc. XVIII e XIX, o modelo de imersão residencial fechada, as crises de viabilidade socioeconômica, até a virada com o Parecer CNE/CES nº 241/1999 (MEC) e a expansão da EaD confessional.'
  },
  {
    capitulo: 'Capítulo II',
    titulo: 'Distância Transacional e Koinonia (Análise Teológica e Teórica)',
    descricao: 'A Teoria da Distância Transacional de Michael Moore (diálogo, estrutura e autonomia do estudante) e o constructo de Presença Social ("estar junto virtual") de Garrison, Anderson & Archer, articulados com a eclesiologia bíblica de koinonia e mutualidade pastoral.'
  },
  {
    capitulo: 'Capítulo III',
    titulo: 'Metodologias Ativas e Mediação Pedagógica (Andragogia e Autonomia)',
    descricao: 'Superação da pedagogia bancária através da Andragogia de Jesus (perguntas socráticas e dilemas práticos), Aprendizagem Baseada em Problemas (PBL/ABP), Método Cornell de tomada de notas, Inteligência Artificial como andaime cognitivo e mediação tutorial proativa.'
  },
  {
    capitulo: 'Capítulo IV',
    titulo: 'Laboratório Instrumental: O Koinonia LMS (RPG, Cornell e Validação)',
    descricao: 'Apresentação do Koinonia LMS como sandbox andragógico: Simulador Pastoral RPG com instruções secretas confidenciais de bastidores, Mural Interativo de Oração e Partilha (Mural Koinonia) e módulo nativo de pesquisa com TCLE (Resoluções CNS 466/2012 e 510/2016).'
  }
];

export const PLATAFORMA_NOME = 'Koinonia LMS';
export const PLATAFORMA_DESCRICAO = 'O Koinonia LMS é o projeto de plataforma integrada de aprendizagem e sandbox pedagógico desenvolvido para a modernização do ensino teológico no ambiente virtual, concebido para atender o Seminário Teológico Congregacional (UIECB) e instituições congêneres.';

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

export const TIPO_PUBLICO_LABELS: Record<string, { label: string; emoji: string; grupo: 'interno' | 'externo'; badgeColor: string; papelAcademico: string }> = {
  aluno_unimb: {
    label: 'Aluno / Seminarista UNIMB (Teologia)',
    emoji: '🎓',
    grupo: 'interno',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    papelAcademico: 'Visão Discente: Distância Afetiva e Cognitiva',
  },
  professor_unimb: {
    label: 'Professor / Docente do Curso de Teologia',
    emoji: '👨‍🏫',
    grupo: 'interno',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    papelAcademico: 'Visão Docente: Distância Pedagógica e Hermenêutica',
  },
  monitor_unimb: {
    label: 'Monitor Acadêmico / Equipe de Apoio e Tutoria',
    emoji: '👑',
    grupo: 'interno',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    papelAcademico: 'Visão Tutorial: Distância Operacional e Comunicacional',
  },
  externo_pastor: {
    label: 'Pastor / Ministro Ordenado',
    emoji: '⛪',
    grupo: 'externo',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    papelAcademico: 'Visão Ministerial: Credibilidade e Caráter Pastoral',
  },
  externo_aluno: {
    label: 'Estudante de Teologia (Outra Instituição / EAD)',
    emoji: '📚',
    grupo: 'externo',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    papelAcademico: 'Visão Comparada: Formação Teológica em Outras Redes',
  },
  externo_lider: {
    label: 'Líder de Ministério / Diácono / Presbítero',
    emoji: '🤝',
    grupo: 'externo',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    papelAcademico: 'Visão de Liderança: Impacto Prático na Igreja Local',
  },
  externo_membro: {
    label: 'Membro de Igreja / Comunidade Eclesial',
    emoji: '👥',
    grupo: 'externo',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    papelAcademico: 'Visão da Membresia: Vivência da Koinonia e Ensino',
  },
  // Retrocompatibilidade
  aluno_unib: {
    label: 'Aluno / Seminarista UNIMB (Teologia)',
    emoji: '🎓',
    grupo: 'interno',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    papelAcademico: 'Visão Discente: Distância Afetiva e Cognitiva',
  },
  professor_unib: {
    label: 'Professor / Docente do Curso de Teologia',
    emoji: '👨‍🏫',
    grupo: 'interno',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    papelAcademico: 'Visão Docente: Distância Pedagógica e Hermenêutica',
  },
  monitor_unib: {
    label: 'Monitor Acadêmico / Apoio Pedagógico',
    emoji: '👑',
    grupo: 'interno',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    papelAcademico: 'Visão Tutorial: Distância Operacional e Comunicacional',
  },
};

export const MULTI_PERFIL_STORAGE_KEY = 'lms_tcc_pesquisas_multi_perfil_v2';
export const LOCAL_SUBMISSIONS_KEY = 'lms_tcc_pesquisa_all_local_submissions';

export interface PerfilResponseState {
  tipo_publico: TipoPublico;
  respostas: Record<string, any>;
  dados_identificacao?: DadosIdentificacao;
  status: 'rascunho' | 'enviado';
  submission_id?: string;
  updated_at: string;
}

/**
 * =========================================================================
 * GLOSSÁRIO INTERATIVO DE INOVAÇÕES PEDAGÓGICAS E TERMOS DO TCC
 * (Extraído rigorosamente dos Capítulos I, II, III e IV do Pré-Projeto)
 * =========================================================================
 */
export interface TermoExplicativo {
  id: string;
  titulo: string;
  subtitulo: string;
  capituloRef: string;
  explicacaoSimples: string;
  comoFuncionaNoLms: string;
  fundamentacaoTeorica: string;
  icone: string;
}

export const GLOSSARIO_PEDAGOGICO_TCC: Record<string, TermoExplicativo> = {
  distancia_transacional: {
    id: 'distancia_transacional',
    titulo: 'Distância Transacional (Michael G. Moore)',
    subtitulo: 'A tríade: Diálogo, Estrutura e Autonomia do Estudante',
    capituloRef: 'Capítulo II do TCC',
    explicacaoSimples: 'A Distância Transacional NÃO é a distância em quilômetros físicos, mas sim um espaço psicológico e de comunicação entre docentes e discentes. Quando o ambiente virtual é excessivamente rígido e possui baixo diálogo, a distância se expande, gerando sensação de isolamento e abandono.',
    comoFuncionaNoLms: 'No Koinonia LMS, é mitigada com aulas síncronas ao vivo no Google Meet (diálogo contínuo), planejamento transparente com Google Drive semanal e ferramentas de autorregulação discente.',
    fundamentacaoTeorica: 'Teoria da Distância Transacional formulada por Michael G. Moore (1993, 2011).',
    icone: '🌐',
  },
  koinonia: {
    id: 'koinonia',
    titulo: 'Preservação da Koinonia (Comunhão Bíblica)',
    subtitulo: 'A mutualidade eclesiástica no ciberespaço',
    capituloRef: 'Capítulo II do TCC',
    explicacaoSimples: 'Koinonia é o vocábulo neotestamentário grego (Atos 2:42) que descreve a comunhão profunda, o compartilhamento mútuo de bens materiais e espirituais, o acolhimento fraterno e a intercessão mútua sob a guia do Espírito Santo. O ciberespaço é ressignificado como um "lugar teológico" de conexão autêntica.',
    comoFuncionaNoLms: 'Implementada através do Mural Interativo de Oração e Partilha (Mural Koinonia), salas abertas para oração antes das aulas e debates socráticos em grupo.',
    fundamentacaoTeorica: 'Eclesiologia neotestamentária e estudos confessionais de Lidiane Souza (2016) e Eliseu Roque do Espírito Santo (2009).',
    icone: '❤️',
  },
  presenca_social: {
    id: 'presenca_social',
    titulo: 'Presença Social e o "Estar Junto Virtual"',
    subtitulo: 'Projeção de afeto, identidade e calor humano no meio digital',
    capituloRef: 'Capítulo II do TCC',
    explicacaoSimples: 'Constructo que define a capacidade de projetar a subjetividade, a intimidade emocional e a identidade autêntica de cada indivíduo através de texto, áudio e vídeo, gerando clima de confiança mútua e sentimento de pertencer a um corpo real de irmãos.',
    comoFuncionaNoLms: 'Aconchego digital nas aulas síncronas com câmeras/microfones abertos, murais reativos e acompanhamento tutorial contínuo.',
    fundamentacaoTeorica: 'Modelo da Comunidade de Inquirição (CoI) de Garrison, Anderson & Archer (2000).',
    icone: '🤝',
  },
  transicao_internato: {
    id: 'transicao_internato',
    titulo: 'Transição do Internato Presencial para o Remoto Síncrono',
    subtitulo: 'Superação do modelo clássico e democratização da vocação',
    capituloRef: 'Capítulo I do TCC',
    explicacaoSimples: 'Historicamente, os seminários operavam em internatos fechados e custosos, exigindo o afastamento total da família e da igreja local. O modelo síncrono remoto atual permite ao vocacionado permanecer atuando pastoralmente no seu campo de trabalho enquanto recebe formação teológica de alta densidade acadêmica e espiritual.',
    comoFuncionaNoLms: 'Permite que estudantes de regiões interioranas e de fronteira (como a Amazônia/Tabatinga) acessem os melhores professores sem desvincular-se de suas igrejas locais.',
    fundamentacaoTeorica: 'Historiografia do ensino teológico no Brasil e Parecer CNE/CES nº 241/1999 (Modes, 2020; Reblin, 2014).',
    icone: '🏛️',
  },
  andragogia_jesus: {
    id: 'andragogia_jesus',
    titulo: 'A Andragogia de Jesus & Metodologias Ativas',
    subtitulo: 'Superação da pedagogia bancária conteudista',
    capituloRef: 'Capítulo III do TCC',
    explicacaoSimples: 'Jesus de Nazaré ensinava adultos utilizando parábolas provocativas, perguntas de desestruturação, dilemas éticos reais e resolução colaborativa, promovendo o protagonismo dos discípulos em vez da memorização mecânica de dogmas.',
    comoFuncionaNoLms: 'Aulas estruturadas na Trilha dos Quatro Ds (Desejo, Desestruturação, Desafio e Decisão) e simulações com casos reais da vida cristã.',
    fundamentacaoTeorica: 'Andragogia (Malcolm Knowles), Pedagogia da Autonomia (Paulo Freire, 1996) e metodologia de discipulado de Jesus.',
    icone: '🔥',
  },
  caderno_cornell: {
    id: 'caderno_cornell',
    titulo: 'Caderno Metacognitivo Cornell Assistido por IA',
    subtitulo: 'Tomada de notas estruturada e andaime cognitivo inteligente',
    capituloRef: 'Capítulos III e IV do TCC',
    explicacaoSimples: 'Método que divide as anotações da aula em 3 seções: Pistas/Perguntas à esquerda, Anotações detalhadas à direita e Sumário de síntese na base. A Inteligência Artificial atua como andaime cognitivo ético para simular o contraditório hermenêutico e aprofundar a exegese.',
    comoFuncionaNoLms: 'Cada disciplina e aula possui sua folha Cornell digital com sincronização em nuvem e suporte do Google Gemini para sínteses conceituais.',
    fundamentacaoTeorica: 'Metacognição estruturada de Walter Pauk (Cornell University) e andaimes cognitivos de Lev Vygotsky.',
    icone: '📝',
  },
  simulador_rpg: {
    id: 'simulador_rpg',
    titulo: 'Simulador Pastoral RPG (PBL com Instruções Secretas)',
    subtitulo: 'Ambiente seguro e tolerante ao erro para simulações ministeriais',
    capituloRef: 'Capítulo IV do TCC',
    explicacaoSimples: 'Gamificação pedagógica baseada em problemas (PBL). O professor cadastra cenários pastorais complexos (aconselhamento conjugal, liturgia, dilemas éticos) com instruções secretas confidenciais visíveis apenas aos alunos designados, que interpretam os papéis na aula ao vivo.',
    comoFuncionaNoLms: 'Desenvolve oratória pastoral, alteridade hermenêutica e empatia em tempo real durante a reunião do Google Meet.',
    fundamentacaoTeorica: 'Aprendizagem Baseada em Problemas (PBL/ABP) aplicada à teologia e simulações socioemocionais.',
    icone: '🎭',
  },
  mural_koinonia: {
    id: 'mural_koinonia',
    titulo: 'Mural Interativo de Oração e Partilha (Mural Koinonia)',
    subtitulo: 'Parede virtual de apoio fraterno e mutualidade espiritual',
    capituloRef: 'Capítulo IV do TCC',
    explicacaoSimples: 'Painel colaborativo no estilo "post-its" reativos onde discentes e docentes compartilham pedidos de oração, motivos de gratidão e desafios ministeriais da semana, permitindo que colegas cliquem em "Apoiar em Oração" e orem uns pelos outros.',
    comoFuncionaNoLms: 'Mantém viva a mutualidade cristã entre as aulas síncronas e combate a solidão acadêmica típica da EaD tradicional.',
    fundamentacaoTeorica: 'Princípio eclesiológico de mutualidade e cuidado pastoral preventivo (Garrison et al., 2000; Souza, 2016).',
    icone: '🙏',
  },
  notebooklm: {
    id: 'notebooklm',
    titulo: 'Podcasts de Síntese Teológica (NotebookLM)',
    subtitulo: 'Áudios didáticos inteligentes a partir dos materiais da aula',
    capituloRef: 'Capítulo III do TCC',
    explicacaoSimples: 'Tecnologia do Google que converte livros, apostilas e exegeses em conversas em áudio no formato podcast para fixação.',
    comoFuncionaNoLms: 'O estudante escuta sínteses comentadas dos textos indicados pelo professor no trajeto diário ou momentos de devoção.',
    fundamentacaoTeorica: 'Mídias andragógicas multimodais e aprendizagem em mobilidade (MALL - Chryssa Themelis, 2021).',
    icone: '🎙️',
  },
  estudio_homiletica: {
    id: 'estudio_homiletica',
    titulo: 'Estúdio de Homilética (Pregação com Avaliação Fraterna)',
    subtitulo: 'Prática de oratória bíblica e feedback entre colegas',
    capituloRef: 'Capítulo IV do TCC',
    explicacaoSimples: 'Homilética é a arte da pregação bíblica. O estúdio é um laboratório prático onde o seminarista treina sermões com cronômetro litúrgico.',
    comoFuncionaNoLms: 'Colegas avaliam a pregação com base em rubricas (fidelidade textual, clareza, apelo pastoral) promovendo crescimento fraterno.',
    fundamentacaoTeorica: 'Prática pastoral supervisionada e avaliação por pares.',
    icone: '🎤',
  },
  metaverso_3d: {
    id: 'metaverso_3d',
    titulo: 'Metaverso Bíblico 3D & Reconstruções Arqueológicas',
    subtitulo: 'Visitas virtuais imersivas aos cenários das Escrituras',
    capituloRef: 'Capítulo IV do TCC',
    explicacaoSimples: 'Modelos tridimensionais interativos navegáveis no navegador do Tabernáculo de Moisés, Templo de Salomão e Jerusalém bíblica.',
    comoFuncionaNoLms: 'O discente caminha pelas dependências do Tabernáculo enquanto o docente explica a tipologia de Cristo presente em cada mobília.',
    fundamentacaoTeorica: 'Realidade imersiva contextualizada na arqueologia bíblica.',
    icone: '🕍',
  },
  quatro_ds: {
    id: 'quatro_ds',
    titulo: 'Trilha dos Quatro Ds (Pedagogia Socrática de Jesus)',
    subtitulo: 'Método de ensinagem baseado nas perguntas de Cristo',
    capituloRef: 'Capítulo III do TCC',
    explicacaoSimples: 'Inspirado na pedagogia de Jesus: 1) Desejo (pergunta intrigante), 2) Desestruturação (quebra de pré-conceitos), 3) Desafio (tarefa prática) e 4) Decisão (compromisso vocacional).',
    comoFuncionaNoLms: 'Conduz o aluno a não apenas memorizar tópicos para exames, mas a vivenciar a transformação do coração.',
    fundamentacaoTeorica: 'A Andragogia de Jesus e pedagogia da autonomia (Paulo Freire, 1996; Souza, 2016).',
    icone: '🔥',
  },
  biblioteca_digital: {
    id: 'biblioteca_digital',
    titulo: 'Biblioteca Digital Teológica (3.000 Obras em PDF)',
    subtitulo: 'Acesso democrático a clássicos teológicos e citação em 1 clique',
    capituloRef: 'Capítulo IV do TCC',
    explicacaoSimples: 'Acervo de clássicos de teologia sistemática, exegese e história eclesiástica acessível sem custos de aquisição de livros físicos.',
    comoFuncionaNoLms: 'Possui gerador de citações prontas no padrão ABNT com 1 clique para inclusão nos trabalhos acadêmicos e no TCC.',
    fundamentacaoTeorica: 'Democratização do conhecimento acadêmico confessional e superação de barreiras geográficas.',
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
  termoExplicativoId?: string;
  tipo: 'likert_5' | 'multipla_escolha' | 'texto';
  opcoes?: { valor: string; label: string }[];
  obrigatoria: boolean;
}

/**
 * =========================================================================
 * BANCO DE PERGUNTAS ESTRATIFICADAS POR ATOR (TRIANGULAÇÃO METODOLÓGICA)
 * =========================================================================
 */

// 1. QUESTIONÁRIO DOS DISCENTES / SEMINARISTAS (ALUNOS)
export const PERGUNTAS_DISCENTE: PerguntaDiagnostico[] = [
  {
    id: 'disc_dt_dialogo',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Distância Afetiva e Cognitiva (Moore)',
    enunciado: 'A realização de aulas síncronas ao vivo (Google Meet com microfones e câmeras abertos) reduz a sensação de isolamento e aproxima você dos professores.',
    descricao: 'Michael G. Moore define a distância transacional como o espaço comunicacional e afetivo entre professor e aluno.',
    termoExplicativoId: 'distancia_transacional',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'disc_dt_autoregulacao',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Distância Afetiva e Cognitiva (Moore)',
    enunciado: 'A rotina de conciliar trabalho secular, família e estudos teológicos à noite exige grande esforço de autorregulação e disciplina pessoal.',
    termoExplicativoId: 'distancia_transacional',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'disc_dt_materiais_autonomia',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Distância Afetiva e Cognitiva (Moore)',
    enunciado: 'A disponibilização antecipada de pastas de materiais semanais e aulas gravadas favorece minha autonomia e organização nos estudos.',
    termoExplicativoId: 'distancia_transacional',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'disc_koi_comunhao',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Preservação da Koinonia (Comunhão dos Seminaristas)',
    enunciado: 'É possível vivenciar verdadeira comunhão bíblica (koinonia), mutualidade e laços de amizade sinceros com os colegas de turma através do ambiente virtual.',
    termoExplicativoId: 'koinonia',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'disc_koi_oracao_acolhimento',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Preservação da Koinonia (Comunhão dos Seminaristas)',
    enunciado: 'Espaços colaborativos (Mural de Oração, acolhimento antes da aula e grupos de mentoria) fortalecem o sentimento de família na fé e a presença social.',
    termoExplicativoId: 'mural_koinonia',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'disc_koi_suporte_pastoral',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Preservação da Koinonia (Comunhão dos Seminaristas)',
    enunciado: 'Como discente, sinto-me acolhido pastoralmente pela coordenação acadêmica e pelos professores do Seminário Teológico Congregacional.',
    termoExplicativoId: 'koinonia',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'disc_tra_democratizacao',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Transição Histórica (Internato Clássico vs. Remoto Síncrono)',
    enunciado: 'A superação do modelo exclusivo de internato presencial permitiu que eu cursasse teologia sem abandonar minha igreja local, minha família e meu sustento.',
    termoExplicativoId: 'transicao_internato',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'disc_tra_saudade_convivio',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Transição Histórica (Internato Clássico vs. Remoto Síncrono)',
    enunciado: 'A prática ministerial contínua na igreja local compensa a ausência da convivência presencial em tempo integral do internato tradicional.',
    termoExplicativoId: 'transicao_internato',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'disc_tra_percepcao_formacao',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Transição Histórica (Internato Clássico vs. Remoto Síncrono)',
    enunciado: 'Comparando os modelos, como você avalia a solidez da sua formação teológica e ministerial no formato síncrono remoto atual?',
    tipo: 'multipla_escolha',
    opcoes: [
      { valor: 'superior_internato', label: 'Superior: conecta a teoria teológica à prática pastoral imediata na igreja local' },
      { valor: 'equivalente_alta_qualidade', label: 'Equivalente com alta qualidade: atende com rigor espiritual e acadêmico' },
      { valor: 'complementar_desafios', label: 'Boa alternativa, embora sinta falta da convivência presencial diária' },
      { valor: 'preferencia_presencial', label: 'Ainda prefiro o modelo clássico de internato fechado' },
    ],
    termoExplicativoId: 'transicao_internato',
    obrigatoria: true,
  },
  {
    id: 'disc_met_cornell_ia',
    dimensao: 'metodologias_ativas',
    dimensaoTitulo: 'Dimensão 4: Metodologias Ativas no Koinonia LMS',
    enunciado: 'O Caderno Cornell integrado à Inteligência Artificial e os podcasts do NotebookLM auxiliam no aprofundamento e retenção dos temas bíblicos.',
    termoExplicativoId: 'caderno_cornell',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'disc_met_pratica_laboratorios',
    dimensao: 'metodologias_ativas',
    dimensaoTitulo: 'Dimensão 4: Metodologias Ativas no Koinonia LMS',
    enunciado: 'Recursos como Simulador Pastoral RPG e Estúdio de Homilética tornam a aula mais prática, dinâmica e voltada aos desafios ministeriais reais.',
    termoExplicativoId: 'simulador_rpg',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'disc_met_recurso_favorito',
    dimensao: 'metodologias_ativas',
    dimensaoTitulo: 'Dimensão 4: Metodologias Ativas no Koinonia LMS',
    enunciado: 'Qual inovação da plataforma Koinonia LMS mais contribui para aproximar você da turma e diminuir a sensação de distância?',
    tipo: 'multipla_escolha',
    opcoes: [
      { valor: 'aulas_sincronas_meet', label: 'Aulas ao vivo síncronas no Google Meet com diálogo aberto' },
      { valor: 'caderno_cornell_ia', label: 'Caderno Cornell com sínteses inteligentes de IA' },
      { valor: 'simulador_rpg', label: 'Simulador Pastoral RPG de casos ministeriais' },
      { valor: 'estudio_homiletica', label: 'Estúdio de Homilética e prática de pregação' },
      { valor: 'biblioteca_digital', label: 'Biblioteca Digital com 3.000 livros em PDF e ABNT' },
      { valor: 'metaverso_3d', label: 'Metaverso Bíblico 3D do Tabernáculo e Templo' },
    ],
    termoExplicativoId: 'caderno_cornell',
    obrigatoria: true,
  },
  {
    id: 'disc_obs_desafio_pessoal',
    dimensao: 'qualitativa',
    dimensaoTitulo: 'Dimensão 5: Considerações Discursivas do Aluno',
    enunciado: 'Qual é o maior desafio ou oportunidade que você vivencia na sua formação teológica no formato remoto síncrono?',
    tipo: 'texto',
    obrigatoria: false,
  },
  {
    id: 'disc_obs_depoimento_livre',
    dimensao: 'qualitativa',
    dimensaoTitulo: 'Dimensão 5: Considerações Discursivas do Aluno',
    enunciado: 'Espaço aberto: sugestões, críticas fraternas ou depoimento para a pesquisa do TCC de Cristiano do Sacramento Soares:',
    tipo: 'texto',
    obrigatoria: false,
  },
];

// 2. QUESTIONÁRIO DOS DOCENTES / PROFESSORES
export const PERGUNTAS_DOCENTE: PerguntaDiagnostico[] = [
  {
    id: 'doc_dt_profundidade_hermeneutica',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Distância Pedagógica e Hermenêutica (Moore)',
    enunciado: 'Como docente, consigo manter nas aulas síncronas ao vivo o mesmo nível de rigor exegético e debate teológico que no formato presencial.',
    descricao: 'Michael G. Moore: a distância transacional pedagógica decorre da intensidade do diálogo reflexivo entre professor e discentes.',
    termoExplicativoId: 'distancia_transacional',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'doc_dt_frieza_telas',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Distância Pedagógica e Hermenêutica (Moore)',
    enunciado: 'A presença de alunos com câmeras fechadas ou pouca verbalização representa um obstáculo à verificação da aprendizagem e à criação de presença social.',
    termoExplicativoId: 'presenca_social',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'doc_dt_estrutura_plataforma',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Distância Pedagógica e Hermenêutica (Moore)',
    enunciado: 'A estrutura do Koinonia LMS (cronograma de 16 aulas, Google Drive sincronizado e avisos pré-aula) facilita meu planejamento didático semanal.',
    termoExplicativoId: 'distancia_transacional',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'doc_koi_avaliacao_carater',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Avaliação do Caráter Pastoral e Koinonia',
    enunciado: 'É pedagogicamente viável perceber e acompanhar o crescimento espiritual e o caráter pastoral dos estudantes através das interações virtuais.',
    termoExplicativoId: 'koinonia',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'doc_koi_comunhao_turma',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Avaliação do Caráter Pastoral e Koinonia',
    enunciado: 'Momentos de oração, acolhimento pastoral no Mural Koinonia e debates no início da aula criam uma identidade congregacional sólida na turma.',
    termoExplicativoId: 'mural_koinonia',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'doc_tra_democratizacao_docente',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Transição Histórica sob a Ótica Docente',
    enunciado: 'A transição do internato presencial para o síncrono remoto democratizou o ensino teológico, incluindo vocacionados que antes seriam excluídos por razões geográficas ou financeiras.',
    termoExplicativoId: 'transicao_internato',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'doc_tra_comparacao_egressos',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Transição Histórica sob a Ótica Docente',
    enunciado: 'Em sua experiência docente, o preparo teológico dos estudantes do modelo síncrono atual se equipara ao dos egressos do internato tradicional?',
    tipo: 'multipla_escolha',
    opcoes: [
      { valor: 'equivalente_ou_superior', label: 'Equivalente ou superior: a aplicação pastoral imediata na igreja local amadurece o aluno mais rápido' },
      { valor: 'equivalente_bom_nivel', label: 'Equivalente com bom nível: atende satisfatoriamente às exigências do ministério pastoral' },
      { valor: 'inferior_convivencia', label: 'Com lacunas: a falta de convivência diária no internato enfraquece a disciplina comunitária' },
      { valor: 'indeciso_em_transicao', label: 'Ainda em avaliação: os efeitos da transição precisam de mais tempo de análise' },
    ],
    termoExplicativoId: 'transicao_internato',
    obrigatoria: true,
  },
  {
    id: 'doc_met_estimulo_ativo',
    dimensao: 'metodologias_ativas',
    dimensaoTitulo: 'Dimensão 4: Metodologias Ativas na Docência Teológica',
    enunciado: 'Ferramentas ativas (como o Caderno Cornell com IA e a Trilha dos Quatro Ds) estimulam a autonomia intelectual e o pensamento crítico do seminarista.',
    termoExplicativoId: 'caderno_cornell',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'doc_met_laboratorios_docencia',
    dimensao: 'metodologias_ativas',
    dimensaoTitulo: 'Dimensão 4: Metodologias Ativas na Docência Teológica',
    enunciado: 'O uso de metodologias ativas como simulações de casos pastorais (RPG) e laboratórios de homilética com avaliação por pares agrega alto valor à docência.',
    termoExplicativoId: 'simulador_rpg',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'doc_obs_desafios_professores',
    dimensao: 'qualitativa',
    dimensaoTitulo: 'Dimensão 5: Considerações Discursivas do Docente',
    enunciado: 'Quais são os principais desafios pedagógicos e teológicos que os professores enfrentam na formação ministerial remota?',
    tipo: 'texto',
    obrigatoria: false,
  },
  {
    id: 'doc_obs_sugestoes_tcc',
    dimensao: 'qualitativa',
    dimensaoTitulo: 'Dimensão 5: Considerações Discursivas do Docente',
    enunciado: 'Recomendações, reflexões teológicas ou comentários para a pesquisa de Cristiano do Sacramento Soares:',
    tipo: 'texto',
    obrigatoria: false,
  },
];

// 3. QUESTIONÁRIO DOS MONITORES / TUTORES
export const PERGUNTAS_MONITOR: PerguntaDiagnostico[] = [
  {
    id: 'mon_dt_suporte_ao_vivo',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Distância Operacional e Comunicacional (Moore)',
    enunciado: 'A mediação ágil da monitoria durante a aula síncrona (organizando dúvidas, chat e links de presença) é indispensável para encurtar a distância transacional.',
    termoExplicativoId: 'distancia_transacional',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'mon_dt_sobrecarga_tecnica',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Distância Operacional e Comunicacional (Moore)',
    enunciado: 'As falhas de conexão à internet e as dificuldades técnicas dos alunos exigem da monitoria uma postura contínua de paciência, empatia e acolhimento.',
    termoExplicativoId: 'distancia_transacional',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'mon_koi_escuta_pastoral',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Mediação da Koinonia e Cuidado Preventivo',
    enunciado: 'Na rotina da monitoria, é comum os alunos procurarem o monitor não apenas para dúvidas da matéria, mas para desabafos, pedidos de oração e conselhos.',
    termoExplicativoId: 'koinonia',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'mon_koi_engajamento_chat',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Mediação da Koinonia e Cuidado Preventivo',
    enunciado: 'O chat durante a aula ao vivo funciona como um termômetro vital de comunhão, encorajamento e intercessão fraterna entre os seminaristas.',
    termoExplicativoId: 'koinonia',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'mon_tra_papel_humanizador',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Suporte ao Aluno Remoto vs. Internato',
    enunciado: 'Na transição do internato para o modelo síncrono remoto, o monitor assume um papel de ponte humanizadora fundamental para combater a solidão acadêmica.',
    termoExplicativoId: 'transicao_internato',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'mon_met_ferramentas_painel',
    dimensao: 'metodologias_ativas',
    dimensaoTitulo: 'Dimensão 4: Painel do Koinonia LMS na Rotina da Monitoria',
    enunciado: 'Os atalhos do painel (envio rápido de links de presença, registro de gravações e biblioteca com 3.000 livros) facilitam o suporte aos alunos.',
    termoExplicativoId: 'biblioteca_digital',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'mon_obs_vulnerabilidades',
    dimensao: 'qualitativa',
    dimensaoTitulo: 'Dimensão 5: Considerações Discursivas da Monitoria',
    enunciado: 'Quais são as principais dificuldades emocionais, espirituais ou técnicas que os alunos relatam na monitoria?',
    tipo: 'texto',
    obrigatoria: false,
  },
  {
    id: 'mon_obs_mensagem_tcc',
    dimensao: 'qualitativa',
    dimensaoTitulo: 'Dimensão 5: Considerações Discursivas da Monitoria',
    enunciado: 'Sugestões e apontamentos da equipe de apoio para o TCC de Cristiano do Sacramento Soares:',
    tipo: 'texto',
    obrigatoria: false,
  },
];

// 4. QUESTIONÁRIO DOS PASTORES / LÍDERES ECLESIÁSTICOS (EXTERNOS)
export const PERGUNTAS_PASTOR_LIDER: PerguntaDiagnostico[] = [
  {
    id: 'pas_dt_presenca_local',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Percepção de Valor e Proximidade Eclesiástica',
    enunciado: 'O fato de o estudante de teologia permanecer servindo ativamente na igreja local durante o curso é um benefício substancial para o ministério pastoral da congregação.',
    termoExplicativoId: 'transicao_internato',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'pas_dt_credibilidade_ensino',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Percepção de Valor e Proximidade Eclesiástica',
    enunciado: 'A realização de aulas síncronas ao vivo e o rigor do Seminário Teológico Congregacional conferem credibilidade e segurança à formação dos novos obreiros.',
    termoExplicativoId: 'distancia_transacional',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'pas_koi_comunhao_igreja',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Preservação da Koinonia e Caráter Espiritual',
    enunciado: 'O convívio cristão e a prática litúrgica na igreja local suprem de forma consistente a convivência comunitária que outrora existia dentro do internato presencial.',
    termoExplicativoId: 'koinonia',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'pas_koi_crescimento_visivel',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Preservação da Koinonia e Caráter Espiritual',
    enunciado: 'A liderança da igreja percebe sinais claros de amadurecimento espiritual, zelo doutrinário e amor pelas almas nos alunos que estudam no modelo virtual síncrono.',
    termoExplicativoId: 'koinonia',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'pas_tra_democratizacao_lideres',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Comparação Histórica (Internato vs. Modelo Atual)',
    enunciado: 'A superação do internato presencial tradicional possibilitou a capacitação de obreiros vocacionados que não poderiam se mudar para a capital.',
    termoExplicativoId: 'transicao_internato',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'pas_tra_aptidao_pastoral',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Comparação Histórica (Internato vs. Modelo Atual)',
    enunciado: 'Em sua avaliação pastoral, qual formato melhor prepara o pastor para os desafios complexos da igreja contemporânea?',
    tipo: 'multipla_escolha',
    opcoes: [
      { valor: 'sincrono_remoto_igreja', label: 'Modelo Síncrono Remoto: une estudo profundo à vivência pastoral contínua no campo' },
      { valor: 'internato_classico', label: 'Internato Presencial Tradicional: focado exclusivamente no ambiente fechado de convivência' },
      { valor: 'hibrido_com_encontros', label: 'Modelo Híbrido: aulas síncronas remotas com encontros periódicos presenciais' },
      { valor: 'ambos_com_excelencia', label: 'Ambos são eficazes, dependendo da dedicação pessoal do aluno e da mentoria pastoral' },
    ],
    termoExplicativoId: 'transicao_internato',
    obrigatoria: true,
  },
  {
    id: 'pas_met_pratica_homiletica',
    dimensao: 'metodologias_ativas',
    dimensaoTitulo: 'Dimensão 4: Metodologias Ativas e Aptidão Ministerial',
    enunciado: 'Ferramentas práticas como laboratórios de oratória bíblica (Homilética) e simulação de dilemas de aconselhamento (RPG) qualificam a atuação do futuro pastor no púlpito.',
    termoExplicativoId: 'simulador_rpg',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'pas_obs_alerta_fervor',
    dimensao: 'qualitativa',
    dimensaoTitulo: 'Dimensão 5: Contribuição Pastoral para a Pesquisa',
    enunciado: 'Qual advertência ou recomendação pastoral você daria aos seminários teológicos virtuais para que não percam o fervor espiritual e a paixão evangelística?',
    tipo: 'texto',
    obrigatoria: false,
  },
  {
    id: 'pas_obs_palavra_final',
    dimensao: 'qualitativa',
    dimensaoTitulo: 'Dimensão 5: Contribuição Pastoral para a Pesquisa',
    enunciado: 'Considerações pastorais e observações para a monografia do pesquisador Cristiano do Sacramento Soares:',
    tipo: 'texto',
    obrigatoria: false,
  },
];

// 5. QUESTIONÁRIO DOS MEMBROS DE IGREJA / COMUNIDADE GERAL
export const PERGUNTAS_MEMBRO_COMUNIDADE: PerguntaDiagnostico[] = [
  {
    id: 'mem_dt_presenca_estudante',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Presença do Obreiro e Ensino na Igreja Local',
    enunciado: 'Ter membros da minha congregação estudando teologia enquanto continuam convivendo e servindo na igreja abençoa diretamente a nossa comunidade.',
    termoExplicativoId: 'transicao_internato',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'mem_dt_clareza_ensino',
    dimensao: 'distancia_transacional',
    dimensaoTitulo: 'Dimensão 1: Presença do Obreiro e Ensino na Igreja Local',
    enunciado: 'Percebo que os estudantes de teologia que utilizam recursos modernos explicam a Bíblia com mais clareza, profundidade e amor nas pregações e na Escola Bíblica.',
    termoExplicativoId: 'distancia_transacional',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'mem_koi_testemunho_diario',
    dimensao: 'koinonia',
    dimensaoTitulo: 'Dimensão 2: Comunhão e Exemplo de Vida Cristã',
    enunciado: 'A convivência fraterna e o testemunho diário na igreja local são a melhor maneira de comprovar a vocação pastoral de quem estuda teologia.',
    termoExplicativoId: 'koinonia',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'mem_tra_apoio_formacao',
    dimensao: 'transicao_internato',
    dimensaoTitulo: 'Dimensão 3: Visão Geral sobre o Ensino Teológico',
    enunciado: 'Vejo de forma muito positiva que a liderança da minha igreja e novos obreiros possam se qualificar através de aulas virtuais sem precisarem se ausentar da congregação.',
    termoExplicativoId: 'transicao_internato',
    tipo: 'likert_5',
    obrigatoria: true,
  },
  {
    id: 'mem_obs_comentario_livre',
    dimensao: 'qualitativa',
    dimensaoTitulo: 'Dimensão 4: Considerações Finais da Membresia',
    enunciado: 'Espaço aberto: registre seu depoimento ou mensagem para a pesquisa de Cristiano do Sacramento Soares:',
    tipo: 'texto',
    obrigatoria: false,
  },
];

/**
 * Retorna as perguntas personalizadas de acordo com o perfil do respondente
 * Aplicação prática da Estratificação de Atores & Triangulação Metodológica
 */
export function getPerguntasParaPublico(tipoPublico: TipoPublico): PerguntaDiagnostico[] {
  if (tipoPublico === 'professor_unimb' || tipoPublico === 'professor_unib') {
    return PERGUNTAS_DOCENTE;
  }
  if (tipoPublico === 'monitor_unimb' || tipoPublico === 'monitor_unib') {
    return PERGUNTAS_MONITOR;
  }
  if (tipoPublico === 'externo_pastor' || tipoPublico === 'externo_lider') {
    return PERGUNTAS_PASTOR_LIDER;
  }
  if (tipoPublico === 'externo_membro') {
    return PERGUNTAS_MEMBRO_COMUNIDADE;
  }
  // Padrão: Aluno UNIMB / Aluno Externo
  return PERGUNTAS_DISCENTE;
}

/**
 * Compatibilidade legada para referências diretas
 */
export const PERGUNTAS_PESQUISA_TCC = PERGUNTAS_DISCENTE;

/**
 * =========================================================================
 * GERENCIAMENTO DE RESPOSTAS E MÚLTIPLOS PERFIS NO DISPOSITIVO
 * =========================================================================
 */

/**
 * Salva o estado de respostas de um perfil específico, permitindo posterior edição
 */
export function saveProfileResponsesState(state: PerfilResponseState): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(MULTI_PERFIL_STORAGE_KEY);
    const map: Record<string, PerfilResponseState> = raw ? JSON.parse(raw) : {};
    map[state.tipo_publico] = {
      ...state,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(MULTI_PERFIL_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    cleanupBulkyLocalStorage();
    try {
      const raw = localStorage.getItem(MULTI_PERFIL_STORAGE_KEY);
      const map: Record<string, PerfilResponseState> = raw ? JSON.parse(raw) : {};
      map[state.tipo_publico] = state;
      localStorage.setItem(MULTI_PERFIL_STORAGE_KEY, JSON.stringify(map));
    } catch (_) {}
  }
}

/**
 * Recupera o estado salvo de um perfil específico para edição ou continuação
 */
export function getProfileResponseState(tipoPublico: TipoPublico): PerfilResponseState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(MULTI_PERFIL_STORAGE_KEY);
    if (!raw) return null;
    const map: Record<string, PerfilResponseState> = JSON.parse(raw);
    return map[tipoPublico] || null;
  } catch (e) {
    return null;
  }
}

/**
 * Recupera todos os perfis já iniciados/respondidos neste dispositivo
 */
export function getAllProfileResponseStates(): Record<string, PerfilResponseState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(MULTI_PERFIL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Armazena localmente uma submissão finalizada para redundância total
 */
export function saveLocalSubmission(record: TCCPesquisaCampoRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    const list: TCCPesquisaCampoRecord[] = raw ? JSON.parse(raw) : [];
    // Adiciona ou substitui pelo par (tipo_publico, email) ou id
    const next = [record, ...list.filter((item) => item.id !== record.id)];
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(next.slice(0, 150)));
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

  // 1. Grava no cache de perfil como 'enviado' (permite reabrir para edição se desejar)
  saveProfileResponsesState({
    tipo_publico: record.tipo_publico,
    respostas: record.respostas,
    dados_identificacao: record.dados_identificacao,
    status: 'enviado',
    submission_id: generatedId,
    updated_at: new Date().toISOString(),
  });

  // 2. Grava no cache de submissões locais
  saveLocalSubmission(fullRecord);

  try {
    // 3. Envia para a API especializada (com fallback no Supabase materiais)
    const res = await fetch('/api/tcc/pesquisa-campo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullRecord),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, id: data.id || generatedId };
    }

    return { success: true, id: generatedId };
  } catch (err: any) {
    console.warn('[PesquisaCampo] Gravado com sucesso no dispositivo local.', err);
    return { success: true, id: generatedId };
  }
}

/**
 * Busca estatísticas agregadas e respostas para o Painel do Administrador
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
    console.warn('[PesquisaCampo] API remota offline, usando cache local:', e);
  }

  // Merge sem duplicatas
  const mapById = new Map<string, any>();

  // Adiciona remotos
  remoteRecords.forEach((r) => {
    if (r && r.id) mapById.set(r.id, r);
  });

  // Adiciona locais
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

// =========================================================================
// SISTEMA DE ENQUETES DINÂMICAS E CUSTOMIZADAS DO TCC & LMS
// =========================================================================

export interface PerguntaEnqueteCustom {
  id: string;
  enunciado: string;
  tipo: 'likert_5' | 'texto' | 'multipla_escolha';
  opcoes?: string[];
  obrigatoria: boolean;
}

export interface EnquetePersonalizada {
  id: string;
  titulo: string;
  descricao: string;
  publicoAlvo: string; // 'todos' | TipoPublico
  status: 'aberta' | 'encerrada';
  permiteEdicao: boolean;
  created_at: string;
  created_by: string;
  perguntas: PerguntaEnqueteCustom[];
}

const ENQUETES_CUSTOM_STORAGE_KEY = 'lms_enquetes_personalizadas_v1';
const ENQUETES_CUSTOM_CLOUD_TITLE = 'lms_enquetes_personalizadas_cloud_v1';

export async function getEnquetesPersonalizadas(): Promise<EnquetePersonalizada[]> {
  let list: EnquetePersonalizada[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(ENQUETES_CUSTOM_STORAGE_KEY);
      if (raw) list = JSON.parse(raw);
    } catch (_) {}
  }

  try {
    const { data } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', ENQUETES_CUSTOM_CLOUD_TITLE)
      .limit(1);

    if (data && data.length > 0 && data[0].file_url) {
      const remoteList: EnquetePersonalizada[] = JSON.parse(data[0].file_url);
      if (Array.isArray(remoteList)) {
        list = remoteList;
        if (typeof window !== 'undefined') {
          localStorage.setItem(ENQUETES_CUSTOM_STORAGE_KEY, JSON.stringify(list));
        }
      }
    }
  } catch (err) {
    console.warn('[Enquetes] Fallback offline:', err);
  }

  return list;
}

export async function saveEnquetePersonalizada(enquete: EnquetePersonalizada): Promise<boolean> {
  const current = await getEnquetesPersonalizadas();
  const existingIdx = current.findIndex((e) => e.id === enquete.id);
  let updated: EnquetePersonalizada[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = enquete;
  } else {
    updated = [enquete, ...current];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(ENQUETES_CUSTOM_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lms_enquetes_updated', { detail: updated }));
  }

  try {
    const jsonStr = JSON.stringify(updated);
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', ENQUETES_CUSTOM_CLOUD_TITLE)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('materiais')
        .update({ file_url: jsonStr })
        .eq('id', existing[0].id);
    } else {
      await supabase.from('materiais').insert([
        {
          disciplina_id: null,
          title: ENQUETES_CUSTOM_CLOUD_TITLE,
          file_url: jsonStr,
          is_native_upload: false,
        },
      ]);
    }
    return true;
  } catch (e) {
    console.warn('[Enquetes] Erro ao sincronizar nuvem:', e);
    return true;
  }
}

export async function toggleEnqueteStatus(id: string, status: 'aberta' | 'encerrada'): Promise<boolean> {
  const current = await getEnquetesPersonalizadas();
  const target = current.find((e) => e.id === id);
  if (!target) return false;
  target.status = status;
  return saveEnquetePersonalizada(target);
}

export async function deleteEnquetePersonalizada(id: string): Promise<boolean> {
  const current = await getEnquetesPersonalizadas();
  const filtered = current.filter((e) => e.id !== id);

  if (typeof window !== 'undefined') {
    localStorage.setItem(ENQUETES_CUSTOM_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('lms_enquetes_updated', { detail: filtered }));
  }

  try {
    const jsonStr = JSON.stringify(filtered);
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', ENQUETES_CUSTOM_CLOUD_TITLE)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('materiais')
        .update({ file_url: jsonStr })
        .eq('id', existing[0].id);
    }
    return true;
  } catch (e) {
    return true;
  }
}
