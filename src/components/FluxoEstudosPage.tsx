'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, Calendar, Clock, BookOpen, Sparkles, Video, 
  FolderOpen, CheckCircle2, Circle, Copy, Check, ExternalLink, 
  Bot, Headphones, FileText, ChevronRight, Layers, Bookmark, 
  HelpCircle, ArrowRight, ShieldCheck, UserCheck, Flame, 
  Share2, Download, AlertCircle, RefreshCw, Star, Cpu, 
  PenTool, Award, Library, Target, MessageSquare, Heart, CheckSquare,
  Edit3, Settings, X, Save, Link2
} from 'lucide-react';
import { mockDisciplinas, mockAulas, datasAvaliacoesMap } from '@/lib/mockData';
import { getAllGravacoes } from '@/services/gravacoesService';
import { getSemester2026Weeks, getCurrentWeekIndex } from '@/lib/semesterUtils';
import { getLocalTimeZoneInfo, TimeZoneInfo } from '@/lib/timeUtils';
import { trackEvent } from '@/services/telemetryService';
import { GoogleAgendaView } from '@/components/GoogleAgendaView';
import { UserRole } from '@/types';

interface FluxoEstudosPageProps {
  userEmail?: string;
  onTabChange?: (tab: string) => void;
  currentRole?: UserRole;
}

// ── DEFINIÇÃO DAS 9 PERSONAS DO GEMINI ──
interface PersonaConfig {
  id: string;
  num: string;
  disciplina: string;
  professor: string;
  personaTitle: string;
  badgeColor: string;
  accentBg: string;
  sourcesCount: number;
  notebookLmTitle: string;
  shortDesc: string;
  specialties: string[];
  systemPrompt: string;
  studyQuestions: string[];
  meetTime: string;
  driveFolderUrl: string;
}

const PERSONAS_CONFIG: PersonaConfig[] = [
  {
    id: 'persona-01',
    num: '01',
    disciplina: 'História do Congregacionalismo',
    professor: 'Profº Ary Júnior',
    personaTitle: 'Tutor em História Eclesiástica & Tradição Reformada',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    accentBg: 'from-amber-500/10 to-amber-600/5',
    sourcesCount: 3,
    notebookLmTitle: '01 - História do Congregacionalismo - Ary Júnior',
    shortDesc: 'Especialista no movimento puritano inglês, Declaração de Savoy de 1658, pactos eclesiásticos e chegada do Dr. Robert Kalley ao Brasil em 1855.',
    specialties: ['Puritanismo & Separatismo', 'Declaração de Savoy (1658)', 'Robert Reid Kalley & Sarah Kalley (1855)', 'Igreja Evangélica Fluminense', 'Autonomia da Igreja Local'],
    systemPrompt: `Você é o Tutor Acadêmico e Mentor de Estudos em História do Congregacionalismo para estudantes do Seminário Teológico Koinonia LMS (UIECB).
Docente da Cadeira: Profº Ary Júnior.
Suas diretrizes:
1. Adote rigor histórico reformado e congregacional, valorizando as fontes primárias puritanas e a história da Igreja no Brasil.
2. Empregue o Método Cornell: ao explicar um tema, apresente (a) Ideia Central / Palavras-chave, (b) Desenvolvimento Sistemático, (c) Resumo Executivo e (d) Aplicação Pastoral.
3. Principais obras de referência: "Quem eram os puritanos" (Erroll Hulse), "Santos no Mundo" (Leland Ryken), "A Verdadeira Natureza de uma Igreja Evangélica" (John Owen) e documentos históricos da UIECB.
4. Mantenha tom acadêmico encorajador, piedoso e de alta clareza didática.`,
    studyQuestions: [
      'Como a Via Média elisabetana impulsionou o separatismo congregacional puritano?',
      'Quais as distinções centrais de eclesiologia entre a Confissão de Westminster e a Declaração de Savoy?',
      'Qual foi o impacto civil e religioso da atuação do Dr. Robert Kalley na monarquia brasileira?'
    ],
    meetTime: 'Terça-feira • 19:00 – 20:25',
    driveFolderUrl: 'https://drive.google.com/open?id=19Y8Nv2Yvx1V-m4E5y5fUWOo5e8DZzeji&usp=drive_copy',
  },
  {
    id: 'persona-02',
    num: '02',
    disciplina: 'História do Pensamento Cristão II',
    professor: 'Profº Hilário Bispo',
    personaTitle: 'Filósofo Teológico & Crítica da Modernidade',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    accentBg: 'from-blue-500/10 to-blue-600/5',
    sourcesCount: 4,
    notebookLmTitle: '02 - História do Pensamento Cristão II - Hilário Bispo',
    shortDesc: 'Mestre no debate entre Fé e Razão, transição da Escolástica Medieval à Reforma, Iluminismo, Kant, Schleiermacher e Teologia Contemporânea.',
    specialties: ['Escolástica (Anselmo & Aquino)', 'Nominalismo de Ockham', 'Humanismo Renascentista Ad Fontes', 'Iluminismo & Racionalismo', 'Teologia Liberal vs Ortodoxia'],
    systemPrompt: `Você é o Tutor Acadêmico em História do Pensamento Cristão II para estudantes do Seminário Teológico Koinonia LMS.
Docente da Cadeira: Profº Hilário Bispo.
Suas diretrizes:
1. Explique com rigor filosófico e teológico as grandes transformações do pensamento cristão desde o fim da Idade Média até a contemporaneidade.
2. Analise criticamente as tensões entre Fé e Razão (Anselmo "Fides quaerens intellectum", Tomás de Aquino, Kant, Schleiermacher).
3. Auxilie o aluno na redação do Artigo Científico ABNT da AV1 e na resolução das 10 questões da AV2.
4. Estruture as explicações em tópicos Cornell com síntese concisa para fixação.`,
    studyQuestions: [
      'De que maneira o Nominalismo de Guilherme de Ockham abalou a síntese tomista?',
      'Como o princípio renascentista "Ad Fontes" influenciou a hermenêutica dos Reformadores?',
      'Quais foram os principais desafios que o Iluminismo kantiano impôs à dogmática cristã?'
    ],
    meetTime: 'Terça-feira • 20:35 – 22:00',
    driveFolderUrl: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
  },
  {
    id: 'persona-03',
    num: '03',
    disciplina: 'Aconselhamento Bíblico II',
    professor: 'Profº Uilian Santos',
    personaTitle: 'Conselheiro Bíblico & Cuidado da Alma',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    accentBg: 'from-emerald-500/10 to-emerald-600/5',
    sourcesCount: 3,
    notebookLmTitle: '03 - Aconselhamento Bíblico II - Uilian Santos',
    shortDesc: 'Orientador em cuidado pastoral compassivo, suficiência das Escrituras, resolução de crises emocionais e estudo da obra "Ego Transformado" de Timothy Keller.',
    specialties: ['Antropologia Bíblica', 'O Ego Transformado (Keller)', 'Cuidado em Crises & Luto', 'Aconselhamento Centrado no Evangelho', 'Ética no Sigilo Pastoral'],
    systemPrompt: `Você é o Mentor em Aconselhamento Bíblico II para alunos do Seminário Teológico Koinonia LMS.
Docente da Cadeira: Profº Uilian Santos.
Suas diretrizes:
1. Fundamente todas as intervenções na suficiência das Escrituras e na graça do Evangelho de Jesus Cristo.
2. Integre os conceitos-chave do livro "Ego Transformado" (Timothy Keller) e dos slides das aulas para preparação das provas da AV1 e AV2.
3. Demonstre empatia, discernimento bíblico, sabedoria pastoral e prudência quanto ao encaminhamento interdisciplinar quando necessário.
4. Formate respostas com perguntas reflexivas de autoexame e passos práticos de cuidado.`,
    studyQuestions: [
      'Como o conceito kelleriano de auto-esquecimento liberta o cristão da condenação e do orgulho?',
      'Quais são os passos bíblicos para estruturar uma primeira sessão de aconselhamento pastoral?',
      'Como diferenciar sofrimento decorrente do pecado pessoal de aflições existenciais caídas?'
    ],
    meetTime: 'Quarta-feira • 19:00 – 20:25',
    driveFolderUrl: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy',
  },
  {
    id: 'persona-04',
    num: '04',
    disciplina: 'Direitos Humanos',
    professor: 'Profº Cleiton Barbirato',
    personaTitle: 'Jurista de Direitos Humanos & Ética Social Cristã',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    accentBg: 'from-rose-500/10 to-rose-600/5',
    sourcesCount: 3,
    notebookLmTitle: '04 - Direitos Humanos - Cleiton Barbirato',
    shortDesc: 'Especialista em dignidade da pessoa humana (Imago Dei), Declaração Universal de 1948, cidadania responsável e justiça distributiva na cosmovisão bíblica.',
    specialties: ['Dignidade da Pessoa Humana (Imago Dei)', 'Declaração Universal dos Direitos Humanos (1948)', 'Liberdade Religiosa & Laicidade', 'Justiça Social & Vulnerabilidades', 'Cidadania & Participação Política'],
    systemPrompt: `Você é o Tutor Acadêmico em Direitos Humanos e Cidadania Cristã para estudantes do Seminário Teológico Koinonia LMS.
Docente da Cadeira: Profº Cleiton Barbirato.
Suas diretrizes:
1. Articule a doutrina da Imago Dei bíblica com os instrumentos jurídicos internacionais de proteção aos direitos fundamentais.
2. Auxilie os alunos na estruturação do Trabalho de Pesquisa Escrito (peso 2) e na fixação dos slides para as avaliações V1 e V2.
3. Aborde temas complexos com equilíbrio, fundamentação jurídica sólida e lealdade aos princípios evangélicos reformados.`,
    studyQuestions: [
      'Qual o fundamento teológico da dignidade humana inalienável a partir de Gênesis 1:26-27?',
      'Como a Igreja deve atuar profeticamente na defesa dos direitos de minorias e vulneráveis?',
      'Quais as garantias constitucionais brasileiras relativas à liberdade religiosa e de culto?'
    ],
    meetTime: 'Quarta-feira • 20:35 – 22:00',
    driveFolderUrl: 'https://drive.google.com/open?id=1fPSmFUBNzrzK--n3NDKOdMR5HWk25AV7&usp=drive_copy',
  },
  {
    id: 'persona-05',
    num: '05',
    disciplina: 'Ética Cristã',
    professor: 'Profª Karoline Evangelista',
    personaTitle: 'Moralista Teológica & Decálogo Sistemático',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    accentBg: 'from-purple-500/10 to-purple-600/5',
    sourcesCount: 3,
    notebookLmTitle: '05 - Ética Cristã - Profª Karoline Evangelista',
    shortDesc: 'Especialista em ética de princípios (Norman Geisler), exposição prática dos Dez Mandamentos e Catecismo Maior de Westminster para os seminários práticos.',
    specialties: ['Ética Normativa & Geisler', 'Exposição dos Dez Mandamentos', 'Catecismo Maior de Westminster', 'Bioética Cristã & Início da Vida', 'Seminários Práticos de Apresentação'],
    systemPrompt: `Você é a Mentora Acadêmica em Ética Cristã para estudantes do Seminário Teológico Koinonia LMS.
Docente da Cadeira: Profª Karoline Evangelista.
Suas diretrizes:
1. Utilize como referencial a Ética Cristã de Norman Geisler, as Sagradas Escrituras e os Padrões de Westminster (Catecismo Maior).
2. Auxilie os grupos na preparação dos Seminários Práticos sobre os Mandamentos (estrutura de 30 min, 10 min por orador, divisão de tópicos).
3. Forneça análises de dilemas éticos (absolutismo graduado, hierarquia de valores morais, bioética, verdade e justiça).`,
    studyQuestions: [
      'Como o absolutismo graduado de Norman Geisler resolve dilemas morais aparentes nas Escrituras?',
      'Qual a abrangência ética e espiritual do 8º Mandamento segundo o Catecismo Maior de Westminster?',
      'Como estruturar uma apresentação oral de 10 minutos com clareza exegética e aplicação prática?'
    ],
    meetTime: 'Quinta-feira • 19:00 – 20:25',
    driveFolderUrl: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy',
  },
  {
    id: 'persona-06',
    num: '06',
    disciplina: 'Novo Testamento III - Epístolas Gerais',
    professor: 'Profº Marcio Leal',
    personaTitle: 'Exegeta do Novo Testamento & Grego Koiné',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    accentBg: 'from-indigo-500/10 to-indigo-600/5',
    sourcesCount: 3,
    notebookLmTitle: '06 - Novo Testamento III - Epístolas Gerais - Marcio Leal',
    shortDesc: 'Exegeta das Epístolas Universais (Hebreus, Tiago, 1 e 2 Pedro, 1, 2 e 3 João e Judas), fundamentado em Carson, Moo e Morris e preparação para as 150 questões.',
    specialties: ['Exegese de Hebreus (Cristologia)', 'Tiago (Fé e Obras)', '1 e 2 Pedro (Sofrimento e Escatologia)', 'Epístolas Joaninas (Comunhão e Verdade)', 'Judas (Defesa da Fé - Apologética)'],
    systemPrompt: `Você é o Tutor Especialista em Novo Testamento III (Epístolas Gerais) para o Seminário Teológico Koinonia LMS.
Docente da Cadeira: Profº Marcio Leal.
Suas diretrizes:
1. Baseie-se na Introdução ao NT de Carson, Moo e Morris e nas análises textuais sintéticas apresentadas nas aulas.
2. Auxilie os alunos na resolução e fixação do banco de 150 questões discursivas e orais.
3. Demonstre a teologia bíblica de cada carta, autoria, destinatários, ocasião histórica e estrutura literária.
4. Mantenha fidelidade ao texto grego e à ortodoxia reformada.`,
    studyQuestions: [
      'Por que a Epístola aos Hebreus argumenta que a Nova Aliança é superior ao sacerdócio levítico?',
      'Como harmonizar o ensino de Paulo sobre justificação pela fé com a ênfase de Tiago 2 nas obras?',
      'Quais são as heresias proto-gnósticas combatidas pelo apóstolo João em suas primeiras epístolas?'
    ],
    meetTime: 'Quinta-feira • 20:35 – 22:00',
    driveFolderUrl: 'https://drive.google.com/open?id=1ppsv5caJVbHw-1RwhHu8nxBmqFT9Wm9P&usp=drive_copy',
  },
  {
    id: 'persona-07',
    num: '07',
    disciplina: 'Plantação e Revitalização de Igrejas II',
    professor: 'Profº Thácyto Lessa',
    personaTitle: 'Estrategista de Plantação & Revitalização Pastoral',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
    accentBg: 'from-teal-500/10 to-teal-600/5',
    sourcesCount: 3,
    notebookLmTitle: '07 - Plantação e Revitalização de Igrejas II - Thácyto Lessa',
    shortDesc: 'Orientador em revitalização eclesial, diagnóstico comunitário e fichamento crítico de "A Treliça e a Videira" (Colin Marshall e Tony Payne).',
    specialties: ['Revitalização vs Manutenção', 'A Treliça e a Videira (12 Capítulos)', 'Discipulado Formador de Líderes', 'Diagnóstico de Igrejas em Declínio', 'Plantação Contextualizada'],
    systemPrompt: `Você é o Mentor em Plantação e Revitalização de Igrejas II para estudantes do Seminário Teológico Koinonia LMS.
Docente da Cadeira: Profº Thácyto Lessa.
Suas diretrizes:
1. Ajude os alunos a produzir o Resumo Crítico capítulo por capítulo (1 página por capítulo, total de 12 laudas) da obra "A Treliça e a Videira".
2. Ensine a distinção entre trabalho na "Treliça" (estrutura, prédios, comissões) e trabalho na "Videira" (pessoas, proclamação da Palavra, oração e discipulado).
3. Prepare os estudantes para a avaliação com consulta do dia 27/11 com casos práticos de ministério.`,
    studyQuestions: [
      'O que significa a mudança de mentalidade de "administrar programas" para "cuidar de pessoas na videira"?',
      'Quais são os sinais clínicos que indicam que uma igreja local está em processo de declínio ou estagnação?',
      'Como mobilizar membros comuns da igreja para o ministério voluntário de aconselhamento e leitura bíblica mútua?'
    ],
    meetTime: 'Sexta-feira • 19:00 – 20:00',
    driveFolderUrl: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy',
  },
  {
    id: 'persona-08',
    num: '08',
    disciplina: 'TCC I',
    professor: 'Profª Gabriela Leal',
    personaTitle: 'Orientadora Metodológica ABNT de TCC Teológico',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    accentBg: 'from-orange-500/10 to-orange-600/5',
    sourcesCount: 3,
    notebookLmTitle: '08 - TCC I - Gabriela Leal',
    shortDesc: 'Supervisora de metodologia científica, formatação ABNT, objetivos no infinitivo, justificativa, referencial teórico sem plágio e cronograma em tabela.',
    specialties: ['Normas ABNT Rigorosas', 'Objetivos Geral e Específicos (Infinitivo)', 'Referencial Teórico & Citações', 'Cronograma em Tabela', 'Linguagem Impessoal & Sem IA'],
    systemPrompt: `Você é a Orientadora Metodológica de TCC I para o Seminário Teológico Koinonia LMS.
Docente da Cadeira: Profª Gabriela Leal.
Suas diretrizes:
1. Conduza o aluno na estruturação do Projeto de Pesquisa: Capa, Sumário, Objetivos (Geral e 2-3 Específicos no infinitivo), Justificativa, Referencial Teórico com citações ABNT e Cronograma em tabela.
2. Exija rigorosamente a linguagem impessoal (3ª pessoa do singular) e a originalidade da reflexão humana (ausência de conteúdo sintético cru).
3. Auxilie na escolha de orientadores por afinidade temática e no cronograma rígido de entrega.`,
    studyQuestions: [
      'Como formular um objetivo geral claro e conectá-lo a 3 objetivos específicos no infinitivo?',
      'Qual a diferença entre citação direta curta (até 3 linhas) e citação direta longa (recuo 4cm, fonte 10, entrelinhas simples)?',
      'Como estruturar uma justificativa acadêmica que destaque a relevância teológica e pastoral do tema?'
    ],
    meetTime: 'Sexta-feira • 20:00 – 21:00',
    driveFolderUrl: 'https://drive.google.com/open?id=1f-9i-TpqaZhzoLyrxg6flM6CHTsAOWPj&usp=drive_copy',
  },
  {
    id: 'persona-09',
    num: '09',
    disciplina: 'História da Cultura Afro Brasileira e Indígena',
    professor: 'Profº Alexsandro',
    personaTitle: 'Historiador Sociocultural & Missiólogo Étnico',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    accentBg: 'from-cyan-500/10 to-cyan-600/5',
    sourcesCount: 4,
    notebookLmTitle: '09 - História da Cultura Afro Brasileira e Indígena - Alexsandro',
    shortDesc: 'Especialista em formação étnica brasileira, cosmovisão indígena, diáspora africana e prática pastoral inclusiva e contextualizada.',
    specialties: ['Formação Étnica Brasileira', 'Povos Indígenas & Cosmovisão', 'Diáspora Africana no Brasil', 'Contextualização Missiológica', 'Combate ao Preconceito Religioso'],
    systemPrompt: `Você é o Tutor Acadêmico em História da Cultura Afro-Brasileira e Indígena para o Seminário Teológico Koinonia LMS.
Docente da Cadeira: Profº Alexsandro.
Suas diretrizes:
1. Ofereça reflexões históricas e antropológicas sólidas sobre a matriz formadora da identidade brasileira.
2. Trate com respeito, sensibilidade bíblica e profundidade a herança dos povos originários e das populações afrodescendentes.
3. Conecte os temas aos desafios da proclamação do Evangelho e da justiça pastoral em contextos urbanos e rurais brasileiros.`,
    studyQuestions: [
      'Quais as contribuições estruturais das culturas afro e indígenas para o vocabulário e religiosidade popular no Brasil?',
      'Como a história da escravidão no Brasil desafia a reflexão ética e missiológica da igreja contemporânea?',
      'Quais os princípios bíblicos para uma contextualização sadia do Evangelho entre etnias originárias?'
    ],
    meetTime: 'Módulo Gravado (4 Aulas) • Envio da Atividade por E-mail até 28/11/2026',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1mCp4ZCawhIekLJl3_bcoPiThAqwdzlty?usp=drive_link',
  }
];

// ── DEFINIÇÃO DAS 11 PASTAS DO DRIVE DO USUÁRIO ──
interface DriveFolderItem {
  num: string;
  name: string;
  category: 'materia' | 'hub_anotacoes' | 'hub_gravacoes';
  desc: string;
  linkDrive: string;
  personaId?: string;
  notebookLmTitle?: string;
  iconType: 'folder' | 'notebook' | 'video';
  sources?: number;
}

const DRIVE_FOLDERS_11: DriveFolderItem[] = [
  {
    num: '01',
    name: '01 - História do Congregacionalismo - Ary Júnior',
    category: 'materia',
    desc: 'Pasta oficial no Drive pessoal com slides, artigos puritanos e apostilas da disciplina.',
    linkDrive: 'https://drive.google.com/open?id=19Y8Nv2Yvx1V-m4E5y5fUWOo5e8DZzeji&usp=drive_copy',
    personaId: 'persona-01',
    notebookLmTitle: '01 - História do Congregacionalismo - Ary Júnior',
    iconType: 'folder',
    sources: 3
  },
  {
    num: '02',
    name: '02 - História do Pensamento Cristão II - Hilário Bispo',
    category: 'materia',
    desc: 'Textos de fontes primárias medievais, iluministas e roteiro de pesquisa ABNT.',
    linkDrive: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
    personaId: 'persona-02',
    notebookLmTitle: '02 - História do Pensamento Cristão II - Hilário Bispo',
    iconType: 'folder',
    sources: 4
  },
  {
    num: '03',
    name: '03 - Aconselhamento Bíblico II - Uilian Santos',
    category: 'materia',
    desc: 'Lâminas das aulas, resumos de Timothy Keller e diretrizes de escuta pastoral.',
    linkDrive: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy',
    personaId: 'persona-03',
    notebookLmTitle: '03 - Aconselhamento Bíblico II - Uilian Santos',
    iconType: 'folder',
    sources: 3
  },
  {
    num: '04',
    name: '04 - Direitos Humanos - Cleiton Barbirato',
    category: 'materia',
    desc: 'Tratados de direitos fundamentais, slides do professor e propostas de pesquisa.',
    linkDrive: 'https://drive.google.com/open?id=1fPSmFUBNzrzK--n3NDKOdMR5HWk25AV7&usp=drive_copy',
    personaId: 'persona-04',
    notebookLmTitle: '04 - Direitos Humanos - Cleiton Barbirato',
    iconType: 'folder',
    sources: 3
  },
  {
    num: '05',
    name: '05 - Ética Cristã - Karoline Evangelista',
    category: 'materia',
    desc: 'Capítulos de Norman Geisler, Catecismo Maior e orientações para seminários orais.',
    linkDrive: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy',
    personaId: 'persona-05',
    notebookLmTitle: '05 - Ética Cristã - Profª Karoline Evangelista',
    iconType: 'folder',
    sources: 3
  },
  {
    num: '06',
    name: '06 - Novo Testamento III - Epístolas Gerais - Marcio Leal',
    category: 'materia',
    desc: 'Esboços exegéticos de Hebreus a Judas e banco de 150 questões de fixação.',
    linkDrive: 'https://drive.google.com/open?id=1ppsv5caJVbHw-1RwhHu8nxBmqFT9Wm9P&usp=drive_copy',
    personaId: 'persona-06',
    notebookLmTitle: '06 - Novo Testamento III - Epístolas Gerais - Marcio Leal',
    iconType: 'folder',
    sources: 3
  },
  {
    num: '07',
    name: '07 - Plantação e Revitalização de Igrejas II - Thácyto Lessa',
    category: 'materia',
    desc: 'Material de apoio para fichamento de "A Treliça e a Videira" e estudos de caso.',
    linkDrive: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy',
    personaId: 'persona-07',
    notebookLmTitle: '07 - Plantação e Revitalização de Igrejas II - Thácyto Lessa',
    iconType: 'folder',
    sources: 3
  },
  {
    num: '08',
    name: '08 - TCC I - Gabriela Leal',
    category: 'materia',
    desc: 'Manual de TCC, modelo ABNT com cronograma em tabela e modelos de objetivos.',
    linkDrive: 'https://drive.google.com/open?id=1f-9i-TpqaZhzoLyrxg6flM6CHTsAOWPj&usp=drive_copy',
    personaId: 'persona-08',
    notebookLmTitle: '08 - TCC I - Gabriela Leal',
    iconType: 'folder',
    sources: 3
  },
  {
    num: '09',
    name: '09 - História da Cultura Afro Brasileira e Indígena - Alexsandro',
    category: 'materia',
    desc: 'Pasta oficial com as 4 aulas gravadas e materiais do módulo online. Avaliação por e-mail até 28/11.',
    linkDrive: 'https://drive.google.com/drive/folders/1mCp4ZCawhIekLJl3_bcoPiThAqwdzlty?usp=drive_link',
    personaId: 'persona-09',
    notebookLmTitle: '09 - História da Cultura Afro Brasileira e Indígena - Alexsandro',
    iconType: 'folder',
    sources: 4
  },
  {
    num: '10',
    name: '10 - Anotações do Gemini',
    category: 'hub_anotacoes',
    desc: 'Repositório central de transcrições do Google Meet, resumos Cornell e prompts das personas.',
    linkDrive: 'https://docs.google.com/',
    iconType: 'notebook',
  },
  {
    num: '11',
    name: '11 - Gravações das aulas',
    category: 'hub_gravacoes',
    desc: 'Acervo completo das gravações em alta resolução das aulas ao vivo de 2026.2.',
    linkDrive: 'https://drive.google.com/drive/folders/1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO',
    iconType: 'video',
  }
];

export const FluxoEstudosPage: React.FC<FluxoEstudosPageProps> = ({ userEmail, onTabChange, currentRole = 'aluno' }) => {
  const normalizedEmail = (userEmail || 'sacrasub@gmail.com').toLowerCase().trim();

  // Abas de navegação interna do módulo
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'pastas11' | 'personas' | 'notebooklm' | 'agenda'>('pipeline');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('persona-01');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedQuestion, setCopiedQuestion] = useState<string | null>(null);

  // Links Personalizados das Personas do Gemini (Zero-Egress / Local-First)
  const [customPersonaLinks, setCustomPersonaLinks] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`lms_custom_personas_${normalizedEmail}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  // Links Personalizados dos Cadernos NotebookLM (Zero-Egress / Local-First)
  const [customNotebookLinks, setCustomNotebookLinks] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`lms_custom_notebooks_${normalizedEmail}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  // Estados dos Modais de Personalização
  const [editingPersonaLink, setEditingPersonaLink] = useState<{ id: string; num: string; disciplina: string; personaTitle: string; currentUrl: string } | null>(null);
  const [tempPersonaUrl, setTempPersonaUrl] = useState<string>('');

  const [editingNotebookLink, setEditingNotebookLink] = useState<{ id: string; num: string; title: string; currentUrl: string } | null>(null);
  const [tempNotebookUrl, setTempNotebookUrl] = useState<string>('');

  const [customToastMsg, setCustomToastMsg] = useState<string | null>(null);

  // Salvar Link da Persona
  const handleSavePersonaLink = () => {
    if (!editingPersonaLink) return;
    const updated = { ...customPersonaLinks };
    if (tempPersonaUrl.trim()) {
      updated[editingPersonaLink.id] = tempPersonaUrl.trim();
    } else {
      delete updated[editingPersonaLink.id];
    }
    setCustomPersonaLinks(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`lms_custom_personas_${normalizedEmail}`, JSON.stringify(updated));
    }
    setEditingPersonaLink(null);
    setCustomToastMsg(`Link da Persona ${editingPersonaLink.num} salvo com sucesso!`);
    setTimeout(() => setCustomToastMsg(null), 3000);
  };

  // Salvar Link do NotebookLM
  const handleSaveNotebookLink = () => {
    if (!editingNotebookLink) return;
    const updated = { ...customNotebookLinks };
    if (tempNotebookUrl.trim()) {
      updated[editingNotebookLink.id] = tempNotebookUrl.trim();
    } else {
      delete updated[editingNotebookLink.id];
    }
    setCustomNotebookLinks(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`lms_custom_notebooks_${normalizedEmail}`, JSON.stringify(updated));
    }
    setEditingNotebookLink(null);
    setCustomToastMsg(`Link do Caderno NotebookLM ${editingNotebookLink.num} salvo com sucesso!`);
    setTimeout(() => setCustomToastMsg(null), 3000);
  };

  // Semestre e Semana Atual
  const semesterWeeks = getSemester2026Weeks();
  const currentWeekIdx = getCurrentWeekIndex();
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(currentWeekIdx);

  // Fuso Horário
  const [tzInfo, setTzInfo] = useState<TimeZoneInfo>({ timeZone: 'America/Sao_Paulo', gmtOffset: 'GMT-3', isBRT: true });

  // Checklist de Hábitos da Semana (Persistência Local-First / Zero-Waste Egress)
  const [weeklyHabits, setWeeklyHabits] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`lms_study_habits_${normalizedEmail}_w${selectedWeekIndex}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      '01-agenda': true,
      '01-meet': true,
      '01-cornell': true,
      '01-gemini': false,
      '02-agenda': true,
      '02-meet': true,
      '02-cornell': true,
      '02-gemini': false,
      '03-agenda': true,
      '03-meet': false,
      '03-cornell': false,
      '03-gemini': false,
      '04-agenda': true,
      '04-meet': false,
      '04-cornell': false,
      '04-gemini': false,
      '05-agenda': true,
      '05-meet': false,
      '05-cornell': false,
      '05-gemini': false,
      '06-agenda': true,
      '06-meet': false,
      '06-cornell': false,
      '06-gemini': false,
      '07-agenda': true,
      '07-meet': false,
      '07-cornell': false,
      '07-gemini': false,
      '08-agenda': true,
      '08-meet': false,
      '08-cornell': false,
      '08-gemini': false,
      '09-agenda': true,
      '09-meet': false,
      '09-cornell': false,
      '09-gemini': false,
    };
  });

  useEffect(() => {
    setTzInfo(getLocalTimeZoneInfo());
    trackEvent('navigation', 'view_study_flow', activeSubTab, { subTab: activeSubTab }, normalizedEmail);
  }, [normalizedEmail, activeSubTab]);

  const handleToggleHabit = (key: string) => {
    setWeeklyHabits((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`lms_study_habits_${normalizedEmail}_w${selectedWeekIndex}`, JSON.stringify(next));
      }
      return next;
    });
  };

  const handleCopyPrompt = (promptText: string, personaId: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPromptId(personaId);
    setTimeout(() => setCopiedPromptId(null), 2500);
    trackEvent('cornell_notes', 'copy_gemini_persona_prompt', personaId, { personaId }, normalizedEmail);
  };

  const handleCopyQuestion = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestion(`${idx}-${text}`);
    setTimeout(() => setCopiedQuestion(null), 2000);
  };

  // Cálculo da Taxa de Conclusão dos Hábitos da Semana
  const habitStats = useMemo(() => {
    const totalKeys = Object.keys(weeklyHabits).length;
    const doneKeys = Object.values(weeklyHabits).filter(Boolean).length;
    const pct = totalKeys > 0 ? Math.round((doneKeys / totalKeys) * 100) : 0;
    return { done: doneKeys, total: totalKeys, pct };
  }, [weeklyHabits]);

  const selectedPersona = useMemo(() => {
    return PERSONAS_CONFIG.find((p) => p.id === selectedPersonaId) || PERSONAS_CONFIG[0];
  }, [selectedPersonaId]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ── BANNER CABEÇALHO DO ECOSSISTEMA DE ESTUDOS ── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-white/10">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold tracking-wide border border-blue-400/30">
              <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
              <span>SISTEMÁTICA SEMANAL • KOINONIA LMS</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Fluxo de Estudos & Ecossistema Teológico</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Unindo a organização do seu <strong>Google Drive (01 a 11)</strong>, <strong>Google Agenda</strong>, <strong>Google Meet</strong>, <strong>Caderno Cornell</strong>, <strong>Personas Gemini</strong> e <strong>NotebookLM</strong> em um único fluxo de excelência acadêmica.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-xs font-semibold text-slate-200">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Horário Semanal: {tzInfo.gmtOffset} (Brasília)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-xs font-semibold text-slate-200">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Semana Letiva #{selectedWeekIndex + 1} de {semesterWeeks.length}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{habitStats.pct}% dos Hábitos Concluídos</span>
              </div>
            </div>
          </div>

          {/* Card Resumo do Progresso */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 flex flex-col justify-between min-w-[260px] space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Progresso do Ciclo Semanal</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-white">{habitStats.done}</span>
                <span className="text-xs font-medium text-slate-300">/ {habitStats.total} etapas concluídas</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500 rounded-full"
                  style={{ width: `${habitStats.pct}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-300">Local-First (0 Egress)</span>
              <span className="font-bold text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Ativo
              </span>
            </div>
          </div>
        </div>

        {/* ── BARRA DE NAVEGAÇÃO DE SUB-ABAS ── */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/15">
          <button
            onClick={() => setActiveSubTab('pipeline')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'pipeline'
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>1. Ciclo de Estudos (6 Fases)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pastas11')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'pastas11'
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>2. As 11 Pastas Estruturadas</span>
          </button>

          <button
            onClick={() => setActiveSubTab('personas')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'personas'
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>3. Personas Acadêmicas Gemini</span>
          </button>

          <button
            onClick={() => setActiveSubTab('notebooklm')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'notebooklm'
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>4. Gemini Notebook (NotebookLM)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('agenda')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'agenda'
                ? 'bg-white text-slate-900 shadow-md font-extrabold'
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>5. Google Agenda & Horários</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ABA 1: PIPELINE METODOLÓGICO DO CICLO DE ESTUDOS (6 FASES)
      ─────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span>Metodologia do Ciclo de Aprendizagem Teológica (360°)</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Siga estas 6 etapas em cada disciplina para consolidar os estudos e alcançar excelência espiritual e acadêmica.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Roteiro Oficial do Aluno</span>
              </div>
            </div>

            {/* Grid das 6 Fases do Ciclo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* FASE 1 */}
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 hover:shadow-md transition-all space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                    01
                  </span>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                    Pré-Aula
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  1. Google Agenda & Leituras
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Consulte a sua Google Agenda semanal para monitorar convites e horários das aulas. Realize a leitura prévia recomendada na pasta do Drive da disciplina.
                </p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Pasta 01 a 09</span>
                  <button 
                    onClick={() => setActiveSubTab('agenda')}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Agenda</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* FASE 2 */}
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 hover:shadow-md transition-all space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                    02
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                    Ao Vivo
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  2. Google Meet & Presença
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Conecte-se com câmeras ligadas no horário marcado. Ao final do encontro, envie a sua presença pelo link do Google Forms disponibilizado pelo monitor.
                </p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Link & PIN da Sala</span>
                  <button 
                    onClick={() => onTabChange && onTabChange('aluno-disciplinas')}
                    className="text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Acessar Salas</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* FASE 3 */}
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 hover:shadow-md transition-all space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                    03
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                    Síntese Ativa
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                  3. Caderno Cornell (Notas)
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Organize suas anotações no Método Cornell: Tópicos e Perguntas na coluna esquerda, notas da aula no centro e Resumo Executivo + Aplicação Pastoral na base.
                </p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Pasta 10 (Anotações)</span>
                  <button 
                    onClick={() => onTabChange && onTabChange('aluno-caderno')}
                    className="text-amber-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Abrir Caderno</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* FASE 4 */}
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 hover:shadow-md transition-all space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                    04
                  </span>
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider bg-purple-100/80 px-2.5 py-0.5 rounded-full">
                    Mentoria IA
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  4. Personas do Gemini
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Converse com a persona especializada da disciplina no Gemini para tirar dúvidas profundas, debater teses reformadas e gerar perguntas simuladas para AV1/AV2.
                </p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">9 Personas Ativas</span>
                  <button 
                    onClick={() => setActiveSubTab('personas')}
                    className="text-purple-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Personas</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* FASE 5 */}
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 hover:shadow-md transition-all space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-cyan-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                    05
                  </span>
                  <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider bg-cyan-100/80 px-2.5 py-0.5 rounded-full">
                    Aprofundamento
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
                  5. NotebookLM & Podcasts
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Consulte os cadernos do NotebookLM de cada matéria (com as fontes indexadas) e gere Podcasts em áudio (Deep Dive Audio) para escutar no deslocamento.
                </p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">9 Cadernos Criados</span>
                  <button 
                    onClick={() => setActiveSubTab('notebooklm')}
                    className="text-cyan-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Cadernos</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* FASE 6 */}
              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 hover:shadow-md transition-all space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                    06
                  </span>
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider bg-rose-100/80 px-2.5 py-0.5 rounded-full">
                    Revisão
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                  6. Gravações HD & Checklist AV
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Reveja pontos complexos nas gravações oficiais em HD (Pasta 11) e acompanhe o cumprimento dos marcos de trabalho e provas no Checklist AV2.
                </p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">Pasta 11 (Gravações)</span>
                  <button 
                    onClick={() => onTabChange && onTabChange('aluno-checklist')}
                    className="text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Checklist AV</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── QUADRO DE HÁBITOS SEMANAIS DO ESTUDANTE POR MATÉRIA ── */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  <span>Checklist de Hábitos Semanais (Semana #{selectedWeekIndex + 1})</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Marque cada etapa conforme você progride durante a semana. Os dados são salvos instantaneamente no seu navegador (Zero Egress).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600">Semana:</span>
                <select
                  value={selectedWeekIndex}
                  onChange={(e) => setSelectedWeekIndex(Number(e.target.value))}
                  className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {semesterWeeks.map((w, idx) => (
                    <option key={idx} value={idx}>
                      Semana #{w.weekNumber} ({w.formattedStart} a {w.formattedEnd})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    <th className="py-3 px-4 rounded-l-xl">Matéria / Dia</th>
                    <th className="py-3 px-3 text-center">1. Agenda & Leitura</th>
                    <th className="py-3 px-3 text-center">2. Presença Meet</th>
                    <th className="py-3 px-3 text-center">3. Notas Cornell</th>
                    <th className="py-3 px-3 text-center">4. Tutor Gemini</th>
                    <th className="py-3 px-3 text-center rounded-r-xl">Ação Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {PERSONAS_CONFIG.map((p) => {
                    const kAgenda = `${p.num}-agenda`;
                    const kMeet = `${p.num}-meet`;
                    const kCornell = `${p.num}-cornell`;
                    const kGemini = `${p.num}-gemini`;

                    const isAllDone = weeklyHabits[kAgenda] && weeklyHabits[kMeet] && weeklyHabits[kCornell] && weeklyHabits[kGemini];

                    return (
                      <tr key={p.id} className={`hover:bg-blue-50/40 transition-colors ${isAllDone ? 'bg-emerald-50/30' : ''}`}>
                        <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-lg text-[11px] font-extrabold flex items-center justify-center border ${p.badgeColor}`}>
                            {p.num}
                          </span>
                          <div>
                            <div className="truncate max-w-[240px] font-bold text-gray-900">{p.disciplina}</div>
                            <div className="text-[10px] text-gray-500 font-medium">{p.meetTime} • {p.professor}</div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleHabit(kAgenda)}
                            className="cursor-pointer inline-flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 transition-all"
                          >
                            {weeklyHabits[kAgenda] ? (
                              <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleHabit(kMeet)}
                            className="cursor-pointer inline-flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 transition-all"
                          >
                            {weeklyHabits[kMeet] ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleHabit(kCornell)}
                            className="cursor-pointer inline-flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 transition-all"
                          >
                            {weeklyHabits[kCornell] ? (
                              <CheckCircle2 className="w-5 h-5 text-amber-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleHabit(kGemini)}
                            className="cursor-pointer inline-flex items-center justify-center p-1 rounded-lg hover:bg-gray-100 transition-all"
                          >
                            {weeklyHabits[kGemini] ? (
                              <CheckCircle2 className="w-5 h-5 text-purple-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                            )}
                          </button>
                        </td>

                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedPersonaId(p.id);
                              setActiveSubTab('personas');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Bot className="w-3 h-3" />
                            <span>Persona</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ABA 2: AS 11 PASTAS ESTRUTURADAS (GOOGLE DRIVE DO ALUNO)
      ─────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'pastas11' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-blue-600" />
                  <span>As 11 Pastas Estruturadas do Ecossistema Pessoal</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Organização idêntica à do seu Google Drive pessoal (01 a 11), permitindo acesso instantâneo a materiais, salas, cadernos e assistentes de IA.
                </p>
              </div>

              <a
                href="https://drive.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-all border border-blue-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Meu Google Drive</span>
              </a>
            </div>

            {/* Grade das 11 Pastas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {DRIVE_FOLDERS_11.map((f) => {
                const isSpecial = f.category !== 'materia';

                return (
                  <div 
                    key={f.num}
                    className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-lg ${
                      isSpecial 
                        ? 'bg-gradient-to-br from-indigo-50/60 to-purple-50/40 border-indigo-200/80' 
                        : 'bg-white border-gray-200/80 hover:border-blue-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center shadow-sm ${
                          isSpecial 
                            ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          {f.num}
                        </span>

                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {f.category === 'materia' ? 'Disciplina' : f.category === 'hub_anotacoes' ? 'Hub IA' : 'Repositório HD'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-gray-900 leading-snug">
                        {f.name}
                      </h3>

                      <p className="text-xs text-gray-600 leading-relaxed">
                        {f.desc}
                      </p>

                      {f.sources && (
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200/60">
                          <Library className="w-3 h-3 text-indigo-500" />
                          <span>{f.sources} fontes indexadas no NotebookLM</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                      <a
                        href={f.linkDrive}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Abrir Drive</span>
                      </a>

                      {f.personaId && (
                        <button
                          onClick={() => {
                            setSelectedPersonaId(f.personaId!);
                            setActiveSubTab('personas');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 transition-all inline-flex items-center gap-1.5 border border-purple-200 cursor-pointer"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>Tutor IA</span>
                        </button>
                      )}

                      {f.category === 'hub_anotacoes' && (
                        <button
                          onClick={() => onTabChange && onTabChange('aluno-caderno')}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs hover:bg-amber-100 transition-all inline-flex items-center gap-1.5 border border-amber-200 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Caderno Cornell</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Notificação Toast Temporária de Personalização */}
      {customToastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-2xl text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{customToastMsg}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ABA 3: PERSONAS ACADÊMICAS DO GEMINI (COM PROMPTS PRONTOS)
      ─────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'personas' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Seletor de Persona na Esquerda */}
            <div className="lg:col-span-4 space-y-3">
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                    PERSONAS DO GEMINI ({PERSONAS_CONFIG.length})
                  </h3>
                  <a
                    href="https://gemini.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-purple-600 hover:underline flex items-center gap-1"
                  >
                    <span>Abrir Gemini</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                  {PERSONAS_CONFIG.map((p) => {
                    const isSelected = p.id === selectedPersonaId;
                    const hasCustomLink = Boolean(customPersonaLinks[p.id]);

                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPersonaId(p.id)}
                        className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-3 border ${
                          isSelected
                            ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300 shadow-sm'
                            : 'bg-gray-50/50 hover:bg-gray-100/80 border-transparent text-gray-700'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center border shrink-0 ${p.badgeColor}`}>
                          {p.num}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-gray-900 truncate flex items-center gap-1.5">
                            <span>{p.disciplina}</span>
                            {hasCustomLink && (
                              <span className="text-[10px] text-amber-500" title="Link personalizado ativo">
                                ✨
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate">
                            {p.personaTitle}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Painel de Detalhes da Persona Selecionada na Direita */}
            <div className="lg:col-span-8 space-y-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
                {/* Header da Persona */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className={`w-12 h-12 rounded-2xl font-black text-base flex items-center justify-center border shadow-sm ${selectedPersona.badgeColor}`}>
                      {selectedPersona.num}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          <Bot className="w-3 h-3" />
                          <span>Persona Especializada Gemini Pro</span>
                        </span>
                        {customPersonaLinks[selectedPersona.id] && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            ✨ Link Pessoal Ativo
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedPersona.personaTitle}
                      </h2>
                      <p className="text-xs text-gray-500 font-medium">
                        Disciplina: <strong>{selectedPersona.disciplina}</strong> • {selectedPersona.professor}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botão de Personalizar Link */}
                    <button
                      onClick={() => {
                        setTempPersonaUrl(customPersonaLinks[selectedPersona.id] || '');
                        setEditingPersonaLink({
                          id: selectedPersona.id,
                          num: selectedPersona.num,
                          disciplina: selectedPersona.disciplina,
                          personaTitle: selectedPersona.personaTitle,
                          currentUrl: customPersonaLinks[selectedPersona.id] || '',
                        });
                      }}
                      className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all flex items-center gap-1.5 border border-gray-200 cursor-pointer"
                      title="Personalizar a URL do seu Gem ou chat do Gemini desta matéria"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-gray-600" />
                      <span>{customPersonaLinks[selectedPersona.id] ? 'Editar Link' : 'Personalizar Link'}</span>
                    </button>

                    {/* Copiar Prompt */}
                    <button
                      onClick={() => handleCopyPrompt(selectedPersona.systemPrompt, selectedPersona.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                        copiedPromptId === selectedPersona.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {copiedPromptId === selectedPersona.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Prompt Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Prompt da Persona</span>
                        </>
                      )}
                    </button>

                    {/* Abrir Gemini com Link Personalizado ou Padrão */}
                    <a
                      href={customPersonaLinks[selectedPersona.id] || 'https://gemini.google.com/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-all flex items-center gap-1.5 border border-purple-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{customPersonaLinks[selectedPersona.id] ? 'Abrir Meu Gem' : 'Abrir Gemini'}</span>
                    </a>
                  </div>
                </div>

                {/* Descrição & Especialidades */}
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {selectedPersona.shortDesc}
                  </p>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Especialidades Temáticas:</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedPersona.specialties.map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bloco de Diretrizes de Persona (System Prompt) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-purple-600" />
                      <span>Diretrizes de Persona (Cole no Gemini para ativar):</span>
                    </span>
                  </div>

                  <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800 max-h-60 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{selectedPersona.systemPrompt}</pre>
                  </div>
                </div>

                {/* Perguntas Simuladas de Estudo da Persona */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Perguntas Sugeridas para Conversar com a Persona:</span>
                  </span>

                  <div className="space-y-2">
                    {selectedPersona.studyQuestions.map((q, idx) => {
                      const isCopied = copiedQuestion === `${idx}-${q}`;

                      return (
                        <div 
                          key={idx}
                          className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between gap-3 text-xs text-gray-800 hover:bg-blue-50/50 transition-colors"
                        >
                          <span className="leading-snug">{q}</span>
                          <button
                            onClick={() => handleCopyQuestion(q, idx)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-white transition-all shrink-0 cursor-pointer"
                            title="Copiar pergunta"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ABA 4: GEMINI NOTEBOOK (NOTEBOOKLM) COM AS 9 MATÉRIAS
      ─────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'notebooklm' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <span>Cadernos de Estudo no Gemini Notebook (NotebookLM)</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Seus 9 cadernos configurados no NotebookLM com fontes de cada matéria. Você pode personalizar o link para apontar direto para os seus próprios cadernos!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://notebooklm.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition-all shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir NotebookLM Geral</span>
                </a>
              </div>
            </div>

            {/* Grade dos 9 Cadernos do NotebookLM */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {PERSONAS_CONFIG.map((p) => {
                const customLink = customNotebookLinks[p.id];
                const targetUrl = customLink || 'https://notebooklm.google.com/';

                return (
                  <div 
                    key={p.id}
                    className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                      customLink 
                        ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20' 
                        : 'bg-slate-50/70 border-slate-200/80 hover:border-amber-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center border shadow-sm ${p.badgeColor}`}>
                          {p.num}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {customLink && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                              ✨ Meu Caderno
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                            <Library className="w-3 h-3" />
                            <span>{p.sourcesCount} fontes</span>
                          </span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-gray-900 leading-snug">
                        {p.notebookLmTitle}
                      </h3>

                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                        {p.shortDesc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      {/* Botão de Personalizar Link */}
                      <button
                        type="button"
                        onClick={() => {
                          setTempNotebookUrl(customLink || '');
                          setEditingNotebookLink({
                            id: p.id,
                            num: p.num,
                            title: p.notebookLmTitle,
                            currentUrl: customLink || '',
                          });
                        }}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-amber-700 hover:bg-amber-100/60 transition-all cursor-pointer inline-flex items-center gap-1"
                        title="Personalizar a URL do seu caderno próprio desta disciplina"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">{customLink ? 'Editar Link' : 'Vincular'}</span>
                      </button>

                      {/* Abrir Caderno */}
                      <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-700 font-bold hover:underline flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100/50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
                      >
                        <span>{customLink ? 'Abrir Meu Caderno' : 'Abrir Caderno'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          ABA 5: GOOGLE AGENDA & HORÁRIOS SEMANAIS (INTERATIVO)
      ─────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'agenda' && (
        <div className="animate-fadeIn">
          <GoogleAgendaView 
            userEmail={userEmail} 
            onTabChange={onTabChange} 
            currentRole={currentRole}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAIS DE PERSONALIZAÇÃO DE LINKS (PERSONA & NOTEBOOKLM)
      ─────────────────────────────────────────────────────────────── */}

      {/* Modal 1: Personalizar Link da Persona do Gemini */}
      {editingPersonaLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Bot className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    Personalizar Persona do Gemini ({editingPersonaLink.num})
                  </h3>
                  <p className="text-xs text-gray-500">
                    {editingPersonaLink.disciplina}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingPersonaLink(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Você pode colar o link direto do seu <strong>Gem personalizado</strong> no Gemini ou de um chat salvo da disciplina. O botão <em>"Abrir Gemini"</em> desta persona abrirá sua URL personalizada automaticamente.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  URL da Persona / Gem no Gemini:
                </label>
                <input
                  type="url"
                  placeholder="https://gemini.google.com/gems/..."
                  value={tempPersonaUrl}
                  onChange={(e) => setTempPersonaUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Ex: Link de um Gem criado por você no Google Gemini ou link de chat compartilhado.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setTempPersonaUrl('');
                  const updated = { ...customPersonaLinks };
                  delete updated[editingPersonaLink.id];
                  setCustomPersonaLinks(updated);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem(`lms_custom_personas_${normalizedEmail}`, JSON.stringify(updated));
                  }
                  setEditingPersonaLink(null);
                  setCustomToastMsg('Link da Persona restaurado para o padrão oficial.');
                  setTimeout(() => setCustomToastMsg(null), 3000);
                }}
                className="text-xs font-bold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Restaurar Padrão
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPersonaLink(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSavePersonaLink}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-sm cursor-pointer"
                >
                  Salvar Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Personalizar Link do Caderno no NotebookLM */}
      {editingNotebookLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <BookOpen className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-gray-900">
                    Vincular Caderno NotebookLM ({editingNotebookLink.num})
                  </h3>
                  <p className="text-xs text-gray-500 truncate max-w-[280px]">
                    {editingNotebookLink.title}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingNotebookLink(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Cole a URL do <strong>caderno que você criou no seu Google NotebookLM</strong> para esta disciplina. O botão <em>"Abrir Caderno"</em> redirecionará você direto para o seu ambiente com suas fontes e notas.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  URL do Caderno no NotebookLM:
                </label>
                <input
                  type="url"
                  placeholder="https://notebooklm.google.com/notebook/..."
                  value={tempNotebookUrl}
                  onChange={(e) => setTempNotebookUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Ex: Abra o caderno no NotebookLM e copie a URL da barra do navegador.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setTempNotebookUrl('');
                  const updated = { ...customNotebookLinks };
                  delete updated[editingNotebookLink.id];
                  setCustomNotebookLinks(updated);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem(`lms_custom_notebooks_${normalizedEmail}`, JSON.stringify(updated));
                  }
                  setEditingNotebookLink(null);
                  setCustomToastMsg('Link do NotebookLM restaurado para o padrão.');
                  setTimeout(() => setCustomToastMsg(null), 3000);
                }}
                className="text-xs font-bold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Restaurar Padrão
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNotebookLink(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveNotebookLink}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-sm cursor-pointer"
                >
                  Salvar Caderno
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
