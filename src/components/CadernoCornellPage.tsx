'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, Clock, Sparkles, Eye, EyeOff, Save, 
  Search, Plus, Trash2, FileText, Layers, CheckCircle2, 
  HelpCircle, Share2, Printer, ChevronLeft, ChevronRight,
  Filter, Lightbulb, Bookmark, Tag, X, Download, PenTool,
  Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen, ArrowLeft, ArrowRight,
  ExternalLink, FileCode, Check, Copy, Edit3, Wand2, RefreshCw, Zap, AlertTriangle,
  KeyRound, Settings, Bot, Cpu, Star, ShieldCheck
} from 'lucide-react';
import { CornellNote } from '@/types';
import { 
  subscribeToStudentSync, 
  saveCornellNote, 
  saveAllCornellNotes, 
  deleteCornellNote 
} from '@/services/studentSyncService';
import { transformToCornell, CornellTransformResult, AIProvider, OpenAIModel } from '@/services/aiCornellService';
import { trackEvent } from '@/services/telemetryService';

interface CadernoCornellPageProps {

  userEmail?: string;
  initialDisciplina?: string;
  initialDate?: string;
}

const defaultInitialNotes: Record<string, CornellNote> = {
  'note-his202-2026-08-11': {
    id: 'note-his202-2026-08-11',
    date: '2026-08-11',
    disciplina_name: 'História do Congregacionalismo',
    disciplina_code: 'HIS-202',
    theme: 'Origens do Movimento Congregacional e a Autonomia da Igreja Local',
    professor_name: 'Profº Ary Júnior',
    biblical_references: 'Mateus 18:15-20; Atos 15:1-29; 1 Pedro 2:9',
    cues: `• O que define o sistema de governo congregacional?
• Robert Browne e o princípio de separação
• O sacerdócio universal dos crentes
• Pacto Eclesiástico (Covenant)
• Qual a diferença entre autonomia e isolamento?`,
    notes: `1. CONTEXTO HISTÓRICO E RAÍZES
- Surgimento no século XVI durante a Reforma Puritana na Inglaterra.
- Descontentamento com o episcopado anglicano e a subordinação da Igreja ao Estado.
- Defesa veemente da autonomia de cada congregação local sob o senhorio exclusivo de Cristo.

2. PILARES DOUTRINÁRIOS FUNDAMENTAIS
- Sacerdócio Universal de Todos os Crentes: cada membro é chamado ao discernimento da vontade de Deus.
- Autonomia da Igreja Local: nenhuma autoridade externa hierárquica (bispo ou presbitério superior) pode ditar as decisões internas da assembleia.
- Governo por Assembleia Soberana: membros em comunhão deliberam e elegem seus oficiais (pastores e diáconos).
- Mutualidade e Comunhão Intereclesiástica: autonomia não é isolacionismo; as igrejas locais mantêm cooperação fraterna voluntária.

3. CHEGADA AO BRASIL
- Trabalho pioneiro do Dr. Robert Reid Kalley e Sarah Poulton Kalley (1855).
- Fundação da Igreja Evangélica Fluminense (1858), primeira igreja protestante de língua portuguesa em solo brasileiro.`,
    summary: 'O Congregacionalismo fundamenta-se no senhorio de Cristo, na soberania da assembleia local e no sacerdócio universal. As igrejas locais são autônomas, democráticas e unidas em mútua cooperação fraternal sem hierarquias eclesiásticas impostas.',
    ai_summary_url: 'https://docs.google.com/document/d/1Nm5l4jKBMCyglANAGVqOMs2a4nZxhRIJawBfjvshgm8/edit?usp=meet_tnfm_calendar',
    ai_summary_text: `Resumo do Google Meet (Gemini IA) • Aula 1 (11/08/2026)
Disciplina: História do Congregacionalismo • Docente: Profº Ary Júnior

1. RESUMO EXECUTIVO:
O encontro estabeleceu o planejamento pedagógico sobre a história do congregacionalismo e iniciou os estudos sobre o puritanismo e a Reforma na Inglaterra.

2. PLANEJAMENTO E METODOLOGIA:
- O professor definiu o cronograma de 16 encontros sobre a história do congregacionalismo e instituiu a obrigatoriedade do uso de câmeras ligadas.
- A estrutura pedagógica foi dividida entre o contexto do congregacionalismo mundial (7 aulas) e o brasileiro (7 aulas), com 2 avaliações (AV1 e AV2).

3. CONTEXTO DA REFORMA INGLESA & ORIGENS DO PURITANISMO:
- Rompimento político de Henrique VIII com Roma (1534 - Ato de Supremacia) e a subsequente Via Média estabelecida por Elizabeth I.
- A falta de uma reforma teológica completa gerou o surgimento do movimento puritano.
- Influência calvinista nos reformadores exilados em Genebra e tensões resultantes na Igreja da Inglaterra.
- Os puritanos criticavam a reforma "pela metade" (a igreja "saiu de Roma, mas não chegou a Genebra"), exigindo a abolição de cerimônias e vestes papais.

4. BIBLIOGRAFIA RECOMENDADA:
- "Quem eram os puritanos" (Erroll Hulse)
- "Santos no Mundo" (Leland Ryken)
- "Os Puritanos: suas origens e sucessores" (D. Martin Lloyd-Jones)
- "A Verdadeira Natureza de uma Igreja Evangélica" (John Owen)

5. PRÓXIMAS ETAPAS (ACTION ITEMS):
- [Cristiano Sacramento] Enviar slides utilizados na aula para os alunos no grupo.
- [Grupo de Alunos] Acessar e preencher a lista de presença da aula disponibilizada pelo Cristiano Sacramento.
- [Profº Ary Queiroz Jr] Apresentar detalhes sobre a obra de Packer relacionada aos puritanos na próxima aula.`,
    tags: ['Eclesiologia', 'História Denominacional', 'Reforma Puritana', 'Robert Kalley'],
  },
  'note-his102-2026-08-11': {
    id: 'note-his102-2026-08-11',
    date: '2026-08-11',
    disciplina_name: 'História do Pensamento Cristão II',
    disciplina_code: 'HIS-102',
    theme: 'Desenvolvimento do Pensamento Cristão: Da Escolástica Medieval à Reforma',
    professor_name: 'Profº Hilário Bispo',
    biblical_references: '1 Timóteo 4:16; Tito 1:9; Judas 1:3',
    cues: `• O que caracterizou a Escolástica Medieval?
• Síntese Tomista: Fé e Razão em Tomás de Aquino
• Crise do nominalismo com Guilherme de Ockham
• O retorno às fontes (Ad Fontes) no Humanismo Renascentista
• Antecedentes teológicos da Reforma Protestante`,
    notes: `1. PANORAMA DA ESCOLÁSTICA
- Método escolástico: quaestio, disputatio e síntese teológica.
- Anselmo de Cantuária: "Fides quaerens intellectum" (A fé que busca compreensão).
- Tomás de Aquino e a Suma Teológica: harmonização entre a teologia cristã e a filosofia aristotélica.

2. A CRISE DO NOMINALISMO
- Ockham e a Navalha de Ockham: separação rigorosa entre razão filosófica e revelação divina.
- Fragilização da teologia especulativa tradicional e preparação para o apelo reformado à autoridade bíblica.

3. O HUMANISMO E O RETORNO ÀS ESCRITURAS
- Erasmo de Roterdã e o Novo Testamento Grego (Novum Instrumentum omne, 1516).
- "Ad Fontes": estudo direto dos textos bíblicos originais e patrísticos.`,
    summary: 'A transição da teologia escolástica medieval para a modernidade foi marcada pelo questionamento dos sistemas filosóficos especulativos, pelo renascimento do estudo dos idiomas originais e pela redescoberta da centralidade da Escritura como única regra de fé e prática.',
    ai_summary_url: 'https://docs.google.com/document/d/1GIGP9tnUWdZs2EzSwFNBf-DtRxzU4a31xYm6hbVZ29U/edit?usp=meet_tnfm_calendar',
    ai_summary_text: `Resumo do Google Meet (Gemini IA) • Aula 1 (11/08/2026)
Disciplina: História do Pensamento Cristão II (HIS-102) • Docente: Profº Hilário Bispo

1. RESUMO EXECUTIVO:
Apresentação da ementa e introdução à transição teológica da Escolástica Medieval para a Reforma Protestante e o Pensamento Moderno.

2. METODOLOGIA E PLANEJAMENTO:
- 16 encontros previstos para o semestre 2026.2 (14 aulas temáticas e 2 avaliações AV1 e AV2).
- Dinâmica com leituras de fontes primárias teológicas e análise contextual dos grandes concílios e controvérsias dogmáticas.

3. TÓPICOS CENTRAIS ABORDADOS:
- A metodologia escolástica (questão disputada e síntese teológica).
- A harmonização entre Fé e Razão no pensamento de Anselmo de Cantuária ("A fé que busca inteligência") e Tomás de Aquino (Suma Teológica).
- A crise do Nominalismo com Guilherme de Ockham e o impacto na teologia tardia medieval.
- O Renascimento Cultural e o princípio humanista "Ad Fontes" (retorno aos idiomas originais hebraico e grego), pavimentando o caminho para a Reforma Protestante.

4. PRÓXIMAS ETAPAS (ACTION ITEMS):
- [Cristiano Sacramento] Disponibilizar o link do formulário de presença no chat.
- [Grupo de Alunos] Realizar a leitura dos textos introdutórios na pasta virtual da disciplina no Google Drive.
- [Profº Hilário Bispo] Aprofundar as raízes teológicas de Martinho Lutero e as 95 Teses no próximo encontro.`,
    tags: ['Patrística', 'Escolástica', 'História do Pensamento', 'Fé e Razão'],
  },
  'note-aco202-2026-08-12': {
    id: 'note-aco202-2026-08-12',
    date: '2026-08-12',
    disciplina_name: 'Aconselhamento Bíblico II',
    disciplina_code: 'ACO-202',
    theme: 'Fundamentos da Escuta Pastoral e Diagnóstico de Conflitos',
    professor_name: 'Profº Uilian Santos',
    biblical_references: 'Provérbios 18:13; Gálatas 6:1-2; Tiago 1:19',
    cues: `• Qual a primeira regra do conselheiro bíblico?
• Escuta ativa vs. Julgamento prematuro
• Tríade do cuidado: acolhimento, verdade e esperança
• Limites éticos do aconselhamento pastoral`,
    notes: `1. O PAPEL DA ESCUTA ATIVA
- "Quem responde antes de ouvir comete estultícia e vergonha" (Pv 18:13).
- Ouvir além das palavras: identificar dores, medos e motivações do coração (coração como fonte dos desejos).

2. METODOLOGIA DO ATENDIMENTO
- Estabelecimento de vínculo e confidencialidade sagrada.
- Coleta de dados com perguntas abertas e reflexivas.
- Iluminação pela Palavra de Deus sem moralismo frio, mas com a graça restauradora de Cristo.

3. DISTINÇÃO ESSENCIAL
- Aconselhamento Pastoral ≠ Terapia Clínica: o pastor cuida da dimensão espiritual e ética, encaminhando demandas de saúde mental para especialistas quando necessário.`,
    summary: 'O aconselhamento bíblico eficaz inicia-se com a escuta empática e desprovida de pré-julgamentos, aplicando as verdades bíblicas com amor e apontando sempre para a suficiência e restauração em Cristo.',
    ai_summary_url: 'https://docs.google.com/document/d/1y8xcU3pw0f7esxxJTpp13oV2Oc2j9YBy6E85bQqeQyY/edit?usp=meet_tnfm_calendar',
    tags: ['Cuidado Pastoral', 'Escuta Ativa', 'Ética Ministerial'],
  },
  'note-nt301-2026-08-13': {
    id: 'note-nt301-2026-08-13',
    date: '2026-08-13',
    disciplina_name: 'Novo Testamento III - Epístolas Gerais',
    disciplina_code: 'NT-301',
    theme: 'A Superioridade do Sacerdócio de Cristo na Epístola aos Hebreus',
    professor_name: 'Profº Marcio Leal',
    biblical_references: 'Hebreus 4:14-16; 7:23-28; 8:1-6',
    cues: `• Quem é o sumo sacerdote definitivo?
• A ordem de Melquisedeque vs. Ordem Levítica
• O sacrifício de uma vez por todas (Ephapax)
• Aplicação prática: aproximação confiante do trono da graça`,
    notes: `1. CONTEXTO DA COMUNIDADE DE DESTINO
- Cristãos de origem judaica enfrentando perseguição e tentados a regredir aos rituais levíticos do Antigo Pacto.

2. A SUPERIORIDADE DE CRISTO
- Superior aos anjos (Hb 1-2), a Moisés (Hb 3), e a Arão (Hb 7-8).
- Cristo é sacerdote eterno segundo a ordem de Melquisedeque (Hb 7:17).
- O sacerdócio levítico era imperfeito, transitório e exigia repetição constante de sacrifícios.
- Cristo ofereceu um único sacrifício cabal, de uma vez por todas (termo grego 'ephapax' - Hb 7:27).

3. O NOVO E VIVO CAMINHO
- O véu foi rasgado: temos livre acesso à presença de Deus sem mediadores humanos terrenos.`,
    summary: 'A Epístola aos Hebreus estabelece a supremacia absoluta de Jesus Cristo como o Sumo Sacerdote eterno da Nova Aliança, cujo sacrifício perfeito e definitivo concede livre acesso ao trono da graça de Deus.',
    tags: ['Cristologia', 'Epístolas Gerais', 'Exegese de Hebreus'],
  },
};

const disciplinasList = [
  { name: '01 - História do Congregacionalismo - Ary Júnior', shortName: 'História do Congregacionalismo', code: 'HIS-202', prof: 'Profº Ary Júnior' },
  { name: '02 - História do Pensamento Cristão II - Hilário Bispo', shortName: 'História do Pensamento Cristão II', code: 'HIS-102', prof: 'Profº Hilário Bispo' },
  { name: '03 - Aconselhamento Bíblico II - Uilian Santos', shortName: 'Aconselhamento Bíblico II', code: 'ACO-202', prof: 'Profº Uilian Santos' },
  { name: '04 - Direitos Humanos - Cleiton Barbirato', shortName: 'Direitos Humanos', code: 'DIR-101', prof: 'Profº Cleiton Barbirato' },
  { name: '05 - Ética Cristã - Karoline Evangelista', shortName: 'Ética Cristã', code: 'ETI-201', prof: 'Profª Karoline Evangelista' },
  { name: '06 - Novo Testamento III - Epístolas Gerais - Marcio Leal', shortName: 'Novo Testamento III - Epístolas Gerais', code: 'NT-301', prof: 'Profº Marcio Leal' },
  { name: '07 - Plantação e Revitalização de Igrejas II - Thácyto Lessa', shortName: 'Plantação e Revitalização de Igrejas II', code: 'PRI-202', prof: 'Profº Thácyto Lessa' },
  { name: '08 - TCC I - Gabriela Leal', shortName: 'TCC I', code: 'TCC-101', prof: 'Profª Gabriela Leal' },
  { name: '09 - História da Cultura Afro Brasileira e Indígena - Emerson Silva', shortName: 'História da Cultura Afro Brasileira e Indígena', code: 'CAB-201', prof: 'Profº Emerson Silva' },
];

export const CadernoCornellPage: React.FC<CadernoCornellPageProps> = ({
  userEmail,
  initialDisciplina,
  initialDate,
}) => {
  const normalizedEmail = (userEmail || 'sacrasub@gmail.com').toLowerCase().trim();

  // Estado das Anotações com carregamento instantâneo do LocalStorage (Zero Latência)
  const [allNotes, setAllNotes] = useState<Record<string, CornellNote>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`lms_cornell_notes_${normalizedEmail}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            return { ...defaultInitialNotes, ...parsed };
          }
        }
      } catch (e) {}
    }
    return defaultInitialNotes;
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedActive = localStorage.getItem(`lms_cornell_active_note_${normalizedEmail}`);
      if (savedActive) return savedActive;
    }
    return 'note-his202-2026-08-11';
  });

  // Estado da Anotação Ativa em Edição
  const [currentNote, setCurrentNote] = useState<CornellNote>(() => {
    const initialId = typeof window !== 'undefined'
      ? (localStorage.getItem(`lms_cornell_active_note_${normalizedEmail}`) || 'note-his202-2026-08-11')
      : 'note-his202-2026-08-11';

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`lms_cornell_notes_${normalizedEmail}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed[initialId]) return parsed[initialId];
        }
      } catch (e) {}
    }
    return defaultInitialNotes[initialId] || defaultInitialNotes['note-his202-2026-08-11'];
  });

  // Controle do Modo Active Recall (Recuperação Ativa)
  const [isActiveRecallCovered, setIsActiveRecallCovered] = useState<boolean>(false);

  // Navegação Histórica e Filtros
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDisciplina, setFilterDisciplina] = useState<string>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);

  // Modais e Estados do Transformador de IA (Google Meet / Docs ➡️ Método Cornell)
  const [isAiSummaryModalOpen, setIsAiSummaryModalOpen] = useState<boolean>(false);
  const [isEditAiModalOpen, setIsEditAiModalOpen] = useState<boolean>(false);
  const [tempAiUrl, setTempAiUrl] = useState<string>('');
  const [tempAiText, setTempAiText] = useState<string>('');
  const [isAiTransforming, setIsAiTransforming] = useState<boolean>(false);
  const [aiTransformError, setAiTransformError] = useState<string | null>(null);
  const [aiTransformResult, setAiTransformResult] = useState<CornellTransformResult | null>(null);

  // Configurações de IA (Provedores: OpenAI, Gemini, Nativo)
  const [aiProvider, setAiProvider] = useState<AIProvider>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('lms_ai_provider') as AIProvider) || 'auto';
    }
    return 'auto';
  });
  const [openAiApiKey, setOpenAiApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lms_openai_api_key') || '';
    }
    return '';
  });
  const [openAiModel, setOpenAiModel] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lms_openai_model') || 'gpt-4o';
    }
    return 'gpt-4o';
  });
  const [showOpenAiKeyVisibility, setShowOpenAiKeyVisibility] = useState<boolean>(false);
  const [openAiTestStatus, setOpenAiTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [openAiTestMessage, setOpenAiTestMessage] = useState<string | null>(null);
  const [isAiSettingsModalOpen, setIsAiSettingsModalOpen] = useState<boolean>(false);

  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lms_gemini_api_key') || '';
    }
    return '';
  });
  const [showApiKeyConfig, setShowApiKeyConfig] = useState<boolean>(false);
  const [showApiKeyVisibility, setShowApiKeyVisibility] = useState<boolean>(false);
  const [apiKeyTestStatus, setApiKeyTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [apiKeyTestMessage, setApiKeyTestMessage] = useState<string | null>(null);

  // Modal do Gerador de Resumos Consolidados
  const [isConsolidatedModalOpen, setIsConsolidatedModalOpen] = useState<boolean>(false);
  const [selectedNoteIdsForSummary, setSelectedNoteIdsForSummary] = useState<string[]>([]);
  const [consolidatedResult, setConsolidatedResult] = useState<string | null>(null);
  const [includeFullNotesInSummary, setIncludeFullNotesInSummary] = useState<boolean>(true);

  // Modal e Estado de Exclusão de Caderno (por data / duplicatas)
  const [noteToDelete, setNoteToDelete] = useState<CornellNote | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Carregar e sincronizar anotações via Supabase DB + LocalStorage
  useEffect(() => {
    const unsubscribe = subscribeToStudentSync(normalizedEmail, (data) => {
      if (data.cornellNotes && Object.keys(data.cornellNotes).length > 0) {
        setAllNotes((prev) => {
          const updated = { ...defaultInitialNotes, ...prev, ...data.cornellNotes };
          return updated;
        });
      }
    });

    return () => unsubscribe();
  }, [normalizedEmail]);

  // Mantém a nota corrente em sincronia quando activeNoteId muda
  useEffect(() => {
    if (allNotes[activeNoteId]) {
      setCurrentNote((prev) => {
        if (prev.id !== activeNoteId) {
          return allNotes[activeNoteId];
        }
        return prev;
      });
    }
  }, [activeNoteId]);

  // Função centralizada para carregar ou criar folha Cornell da aula clicada
  const handleProcessOpenDetail = (d: {
    disciplina_name: string;
    disciplina_code?: string;
    professor_name?: string;
    date: string;
    dateFormatted?: string;
    theme?: string;
    text?: string;
    ai_summary_url?: string;
    ai_summary_text?: string;
  }) => {
    if (!d || !d.disciplina_name) return;

    let targetIsoDate = d.date || new Date().toISOString().split('T')[0];
    if (targetIsoDate.includes('/')) {
      const parts = targetIsoDate.split('/');
      if (parts.length === 3) {
        targetIsoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }

    const targetDisc = d.disciplina_name;
    const displayDateStr = d.dateFormatted || targetIsoDate;

    // Busca se já existe anotação para essa disciplina nessa data
    const existingKey = Object.keys(allNotes).find(
      (k) =>
        allNotes[k].disciplina_name.toLowerCase() === targetDisc.toLowerCase() &&
        (allNotes[k].date === targetIsoDate || allNotes[k].date === d.dateFormatted || allNotes[k].date === d.date)
    );

    setFilterDisciplina(targetDisc);

    if (existingKey) {
      setActiveNoteId(existingKey);
      setCurrentNote(allNotes[existingKey]);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`lms_cornell_active_note_${normalizedEmail}`, existingKey);
      }
      setSaveStatusMessage(`Folha de ${targetDisc} (${displayDateStr}) carregada.`);
    } else {
      // Cria nova anotação pré-preenchida para a aula da disciplina e data exata
      const isInitialSeedDate = targetIsoDate === '2026-08-11' || targetIsoDate === '2026-08-12' || targetIsoDate === '2026-08-13';
      const discObj = disciplinasList.find((item) => item.name.toLowerCase() === targetDisc.toLowerCase());
      const newId = `note-${targetDisc.substring(0, 3).toLowerCase()}-${targetIsoDate}`;
      const newNoteObj: CornellNote = {
        id: newId,
        date: targetIsoDate,
        disciplina_name: targetDisc,
        disciplina_code: d.disciplina_code || discObj?.code || 'TEO-2026',
        professor_name: d.professor_name || discObj?.prof || 'Corpo Docente',
        theme: d.theme || `Aula de ${targetDisc} (${displayDateStr})`,
        biblical_references: '',
        cues: `• Qual o tema central da aula de ${targetDisc}?\n• Principais conceitos explicados pelo docente\n• Pergunta de auto-avaliação pós-aula`,
        notes: d.text && d.text.trim() !== '' 
          ? d.text 
          : `1. ANOTAÇÕES DA AULA (${displayDateStr})\n- Registros em tempo real...\n- Tópicos e ideias telegráficas...`,
        summary: `Síntese estruturada dos aprendizados da aula de ${targetDisc} (${displayDateStr}).`,
        ai_summary_url: isInitialSeedDate ? (d.ai_summary_url || '') : '',
        ai_summary_text: isInitialSeedDate ? (d.ai_summary_text || '') : '',
        tags: [targetDisc],
      };

      setAllNotes((prev) => ({ [newId]: newNoteObj, ...prev }));
      setActiveNoteId(newId);
      setCurrentNote(newNoteObj);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`lms_cornell_active_note_${normalizedEmail}`, newId);
      }
      saveCornellNote(normalizedEmail, newNoteObj);
      trackEvent('cornell_notes', 'create_note', newNoteObj.theme || newNoteObj.disciplina_name, { disciplina: newNoteObj.disciplina_name, date: newNoteObj.date }, normalizedEmail, 'aluno');
      setSaveStatusMessage(`Novo caderno aberto para ${targetDisc} (${displayDateStr})!`);
    }


    setTimeout(() => setSaveStatusMessage(null), 3500);
  };

  // Verifica se há pedido pendente de abertura via localStorage ao montar o componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rawPending = localStorage.getItem('lms_cornell_pending_open');
      if (rawPending) {
        try {
          const d = JSON.parse(rawPending);
          localStorage.removeItem('lms_cornell_pending_open');
          handleProcessOpenDetail(d);
        } catch (e) {
          console.warn('Erro ao processar lms_cornell_pending_open:', e);
        }
      }
    }
  }, []);

  // Listener para evento customizado de abertura direta vindo do Card da Aula no Painel do Aluno
  useEffect(() => {
    const handleOpenCornellEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        disciplina_name: string;
        disciplina_code?: string;
        professor_name?: string;
        date: string;
        dateFormatted?: string;
        theme?: string;
        text?: string;
        ai_summary_url?: string;
        ai_summary_text?: string;
      }>;

      if (customEvent.detail) {
        handleProcessOpenDetail(customEvent.detail);
      }
    };

    window.addEventListener('lms_open_cornell_note', handleOpenCornellEvent);
    return () => window.removeEventListener('lms_open_cornell_note', handleOpenCornellEvent);
  }, [allNotes, normalizedEmail]);

  // Se parâmetros iniciais foram passados por props
  useEffect(() => {
    if (initialDisciplina && initialDate) {
      const matchId = Object.keys(allNotes).find(
        (k) => allNotes[k].disciplina_name === initialDisciplina && allNotes[k].date === initialDate
      );
      if (matchId) {
        setActiveNoteId(matchId);
        setCurrentNote(allNotes[matchId]);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`lms_cornell_active_note_${normalizedEmail}`, matchId);
        }
      }
    }
  }, [initialDisciplina, initialDate]);

  // Troca de anotação ativa
  const handleSelectNote = (noteId: string) => {
    if (allNotes[noteId]) {
      setActiveNoteId(noteId);
      setCurrentNote(allNotes[noteId]);
      setIsActiveRecallCovered(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`lms_cornell_active_note_${normalizedEmail}`, noteId);
      }
    }
  };

  // Criação de Nova Anotação
  const handleCreateNewNoteForDisc = (discName?: string, dateStr?: string) => {
    const todayStr = dateStr || new Date().toISOString().split('T')[0];
    const selectedDisc = disciplinasList.find(d => d.name === (discName || filterDisciplina)) || disciplinasList[0];
    const newId = `note-${Date.now()}`;
    const newNoteObj: CornellNote = {
      id: newId,
      date: todayStr,
      disciplina_name: selectedDisc.name,
      disciplina_code: selectedDisc.code,
      professor_name: selectedDisc.prof,
      theme: `Aula de ${selectedDisc.name} (${todayStr})`,
      biblical_references: '',
      cues: '• Pergunta principal da aula?\n• Conceito chave 1\n• Conceito chave 2',
      notes: '1. TÓPICO PRINCIPAL\n- Anotação em tempo real...\n- Ideia central explicada pelo professor...',
      summary: 'Síntese global da aula em 2 a 3 frases estruturadas.',
      ai_summary_url: '',
      ai_summary_text: '',
      tags: [selectedDisc.name],
    };

    const updated = { [newId]: newNoteObj, ...allNotes };
    setAllNotes(updated);
    setActiveNoteId(newId);
    setCurrentNote(newNoteObj);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`lms_cornell_active_note_${normalizedEmail}`, newId);
    }
    saveCornellNote(normalizedEmail, newNoteObj);
    setSaveStatusMessage(`Nova folha de ${selectedDisc.name} criada!`);
    setTimeout(() => setSaveStatusMessage(null), 3000);
  };

  // Solicitação de exclusão com modal de confirmação
  const handlePromptDeleteNote = (noteId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const note = allNotes[noteId];
    if (note) {
      setNoteToDelete(note);
      setIsDeleteModalOpen(true);
    }
  };

  // Executa a exclusão definitiva do dia / duplicata
  const handleConfirmDeleteNote = async () => {
    if (!noteToDelete) return;
    const idToDelete = noteToDelete.id;
    const dateStr = noteToDelete.date;
    const discStr = noteToDelete.disciplina_name;

    // Atualiza estado local
    const updated = { ...allNotes };
    delete updated[idToDelete];
    setAllNotes(updated);

    // Se a nota excluída era a ativa, seleciona a próxima ou cria uma limpa
    if (activeNoteId === idToDelete) {
      const remainingKeys = Object.keys(updated);
      if (remainingKeys.length > 0) {
        const nextId = remainingKeys[0];
        setActiveNoteId(nextId);
        setCurrentNote(updated[nextId]);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`lms_cornell_active_note_${normalizedEmail}`, nextId);
        }
      } else {
        handleCreateNewNoteForDisc(disciplinasList[0].name);
      }
    }

    // Persiste no banco de dados e LocalStorage
    await deleteCornellNote(normalizedEmail, idToDelete);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`lms_cornell_notes_${normalizedEmail}`, JSON.stringify(updated));
      } catch (err) {}
    }

    setIsDeleteModalOpen(false);
    setNoteToDelete(null);
    setSaveStatusMessage(`🗑️ Caderno de ${discStr} do dia ${dateStr} excluído com sucesso!`);
    setTimeout(() => setSaveStatusMessage(null), 4000);
  };

  // Atualização de campos com persistência
  const handleUpdateCurrentNote = (patch: Partial<CornellNote>) => {
    const updated = { ...currentNote, ...patch, updated_at: new Date().toISOString() };
    setCurrentNote(updated);
    setAllNotes((prev) => ({ ...prev, [updated.id]: updated }));
    saveCornellNote(normalizedEmail, updated, false);
  };

  // Mesclar o Resumo da IA nas Notas do Aluno
  const handleMergeAiSummaryToNotes = () => {
    if (!currentNote.ai_summary_text && !currentNote.ai_summary_url) return;
    const separator = currentNote.notes && currentNote.notes.trim() !== '' ? '\n\n---\n\n' : '';
    
    let contentToInject = '';
    if (currentNote.ai_summary_text) {
      contentToInject = `=== SÍNTESE IMPORTADA DA IA DO GOOGLE MEET ===\n${currentNote.ai_summary_text}`;
    } else if (currentNote.ai_summary_url) {
      contentToInject = `=== RESUMO DA IA DO GOOGLE MEET (GEMINI) ===\n• Disciplina: ${currentNote.disciplina_name} (${currentNote.date})\n• Documento Oficial no Google Docs: ${currentNote.ai_summary_url}\n- Acesse o link acima para consultar os tópicos e tarefas completas geradas pela IA.`;
    }

    const newNotes = `${currentNote.notes}${separator}${contentToInject}`;
    handleUpdateCurrentNote({ notes: newNotes });
    setSaveStatusMessage('Resumo da IA injetado na coluna de anotações!');
    setTimeout(() => setSaveStatusMessage(null), 3000);
  };

  // Executa o processamento e transformação do resumo/transcrição no Método Cornell
  const handleRunAiTransformation = async (customUrl?: string, customText?: string) => {
    const urlToUse = customUrl !== undefined ? customUrl : tempAiUrl;
    const textToUse = customText !== undefined ? customText : tempAiText;

    if (!urlToUse && !textToUse) {
      setAiTransformError('Informe o link do Google Docs ou cole o texto do resumo/transcrição da aula.');
      return;
    }

    setIsAiTransforming(true);
    setAiTransformError(null);
    setAiTransformResult(null);

    const res = await transformToCornell({
      url: urlToUse,
      text: textToUse,
      disciplina_name: currentNote.disciplina_name,
      disciplina_code: currentNote.disciplina_code,
      professor_name: currentNote.professor_name,
      date: currentNote.date,
      provider: aiProvider,
      openai_api_key: openAiApiKey.trim() || undefined,
      openai_model: openAiModel,
      gemini_api_key: geminiApiKey.trim() || undefined,
    });

    setIsAiTransforming(false);

    if (res.success && res.data) {
      setAiTransformResult(res.data);
      if (res.data.sourceText && !tempAiText) {
        setTempAiText(res.data.sourceText);
      }
    } else {
      setAiTransformError(res.error || 'Não foi possível ler o documento automaticamente. Por favor, copie e cole o texto do resumo no campo abaixo.');
    }
  };

  // Aplica o resultado estruturado da IA diretamente na folha Cornell ativa
  const handleApplyAiTransformationToSheet = (data: CornellTransformResult) => {
    const cleanCues = (data.cues || currentNote.cues || '')
      .replace(/,\s*(❓|💡|🎯|•|\d+[\.\)])/g, '\n\n$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const cleanNotes = (data.notes || currentNote.notes || '')
      .replace(/,\s*📌/g, '\n\n📌')
      .replace(/,\s*•/g, '\n\n•')
      .replace(/,\s*↳/g, '\n   ↳')
      .replace(/,\s*-\s*/g, '\n   ↳ ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const cleanSummary = (data.summary || currentNote.summary || '')
      .replace(/,\s*•/g, '\n\n•')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const patch: Partial<CornellNote> = {
      cues: cleanCues,
      notes: cleanNotes,
      summary: cleanSummary,
      ai_summary_url: tempAiUrl || currentNote.ai_summary_url,
      ai_summary_text: tempAiText || data.sourceText || currentNote.ai_summary_text,
    };

    if (data.theme && data.theme.trim().length > 3) {
      patch.theme = data.theme;
    }
    if (data.biblical_references && data.biblical_references.trim().length > 2) {
      patch.biblical_references = data.biblical_references;
    }

    handleUpdateCurrentNote(patch);
    setIsEditAiModalOpen(false);
    setAiTransformResult(null);
    setSaveStatusMessage('🎉 Método Cornell gerado com IA e aplicado na folha com sucesso!');
    setTimeout(() => setSaveStatusMessage(null), 4000);
  };

  // Testar conexão com a API da OpenAI (ChatGPT)
  const handleTestOpenAiKey = async () => {
    if (!openAiApiKey.trim()) {
      setOpenAiTestStatus('error');
      setOpenAiTestMessage('Por favor, digite ou cole sua chave de API da OpenAI (sk-...) para testar.');
      return;
    }

    setOpenAiTestStatus('testing');
    setOpenAiTestMessage(null);

    try {
      const selectedModel = openAiModel === 'gpt-4.1' || openAiModel === 'gpt-5.5' ? 'gpt-4o' : (openAiModel || 'gpt-4o');
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiApiKey.trim()}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [{ role: 'user', content: 'Responda apenas: OK' }],
          max_tokens: 5,
        }),
      });

      if (res.ok) {
        setOpenAiTestStatus('success');
        setOpenAiTestMessage(`✅ Chave OpenAI Válida! Conectada com sucesso ao modelo ${openAiModel}.`);
      } else {
        const errData = await res.json().catch(() => ({}));
        setOpenAiTestStatus('error');
        setOpenAiTestMessage(`❌ Erro na OpenAI: ${errData?.error?.message || res.statusText}`);
      }
    } catch (e: any) {
      setOpenAiTestStatus('error');
      setOpenAiTestMessage(`❌ Erro de conexão com a OpenAI: ${e.message}`);
    }
  };

  // Testar a conexão com a API do Google Gemini
  const handleTestGeminiKey = async () => {
    if (!geminiApiKey.trim()) {
      setApiKeyTestStatus('error');
      setApiKeyTestMessage('Por favor, digite ou cole sua chave de API do Gemini para testar.');
      return;
    }

    setApiKeyTestStatus('testing');
    setApiKeyTestMessage(null);

    try {
      const candidateModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
      let isSuccess = false;
      let lastErrMsg = '';

      for (const model of candidateModels) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey.trim()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Responda apenas: OK' }] }]
            })
          });

          if (res.ok) {
            setApiKeyTestStatus('success');
            setApiKeyTestMessage(`✅ Chave Gemini Válida! Conectada com sucesso ao modelo ${model}.`);
            isSuccess = true;
            break;
          } else {
            const errData = await res.json().catch(() => ({}));
            lastErrMsg = errData?.error?.message || res.statusText;
          }
        } catch (e: any) {
          lastErrMsg = e.message;
        }
      }

      if (!isSuccess) {
        setApiKeyTestStatus('error');
        setApiKeyTestMessage(`❌ Falha na validação da chave: ${lastErrMsg}`);
      }
    } catch (e: any) {
      setApiKeyTestStatus('error');
      setApiKeyTestMessage(`❌ Erro ao conectar à API do Gemini: ${e.message}`);
    }
  };

  // Salvar Link e Texto da IA editados
  const handleSaveAiModal = () => {
    handleUpdateCurrentNote({
      ai_summary_url: tempAiUrl,
      ai_summary_text: tempAiText,
    });
    setIsEditAiModalOpen(false);
    setAiTransformResult(null);
    setSaveStatusMessage('Resumo da IA atualizado com sucesso!');
    setTimeout(() => setSaveStatusMessage(null), 3000);
  };

  // Exclusão de anotação
  const handleDeleteNote = (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja realmente excluir esta anotação do seu Caderno Cornell?')) {
      const updated = { ...allNotes };
      delete updated[noteId];
      setAllNotes(updated);
      deleteCornellNote(normalizedEmail, noteId);

      const remainingKeys = Object.keys(updated);
      if (remainingKeys.length > 0) {
        setActiveNoteId(remainingKeys[0]);
        setCurrentNote(updated[remainingKeys[0]]);
      }
    }
  };

  // Filtragem e Ordenação Cronológica das Anotações
  const allNotesList = Object.values(allNotes);

  const notesOfActiveScope = allNotesList
    .filter((note) => filterDisciplina === 'all' || note.disciplina_name === filterDisciplina)
    .sort((a, b) => a.date.localeCompare(b.date));

  const currentNoteIndexInScope = notesOfActiveScope.findIndex((n) => n.id === currentNote.id);

  const handleNavigatePreviousNote = () => {
    if (currentNoteIndexInScope > 0) {
      const prevNote = notesOfActiveScope[currentNoteIndexInScope - 1];
      handleSelectNote(prevNote.id);
    }
  };

  const handleNavigateNextNote = () => {
    if (currentNoteIndexInScope >= 0 && currentNoteIndexInScope < notesOfActiveScope.length - 1) {
      const nextNote = notesOfActiveScope[currentNoteIndexInScope + 1];
      handleSelectNote(nextNote.id);
    }
  };

  // Filtragem na Sidebar Histórica
  const filteredNoteKeys = Object.keys(allNotes).filter((key) => {
    const note = allNotes[key];
    const matchesSearch =
      !searchTerm ||
      note.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.disciplina_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.cues.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.biblical_references.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDisciplina =
      filterDisciplina === 'all' || note.disciplina_name === filterDisciplina;

    return matchesSearch && matchesDisciplina;
  });

  // Gerador de Resumos Consolidados (Consolidated Summary Generator)
  const handleOpenConsolidatedModal = () => {
    // Carrega todas as notas disponíveis (se filtro for 'all', traz todas; senão, traz da matéria)
    const targetNotes = filterDisciplina === 'all' 
      ? allNotesList.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      : notesOfActiveScope;
    setSelectedNoteIdsForSummary(targetNotes.map((n) => n.id));
    setConsolidatedResult(null);
    setIsConsolidatedModalOpen(true);
  };

  const handleGenerateConsolidated = () => {
    try {
      const selectedNotes = selectedNoteIdsForSummary
        .map((id) => allNotes[id])
        .filter((n): n is CornellNote => Boolean(n && n.id))
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

      if (selectedNotes.length === 0) {
        setConsolidatedResult('⚠️ Nenhuma anotação selecionada. Por favor, marque ao menos uma aula na lista acima.');
        return;
      }

      let text = `# 📖 GUIA DE ESTUDOS CONSOLIDADO • MÉTODO CORNELL\n`;
      text += `Koinonia LMS • Plataforma Acadêmica de Teologia\n`;
      text += `Total de Aulas Incluídas: ${selectedNotes.length} aula(s)\n`;
      text += `Data de Emissão: ${new Date().toLocaleDateString('pt-BR')} • Aluno: ${normalizedEmail || 'Aluno(a)'}\n\n`;
      text += `========================================================================================\n\n`;

      selectedNotes.forEach((n, idx) => {
        const disc = (n.disciplina_name || 'Disciplina').toUpperCase();
        const dateStr = n.date || 'Data não informada';
        const themeStr = n.theme || 'Sem título cadastrado';
        const profStr = n.professor_name || 'Corpo Docente';
        const bibRef = n.biblical_references || 'Nenhuma passagem especificada';
        const cuesStr = (n.cues || 'Nenhuma pista ou pergunta registrada.').trim();
        const notesStr = (n.notes || '').trim();
        const summaryStr = (n.summary || 'Nenhum resumo consolidado registrado.').trim();

        text += `## 📚 AULA ${idx + 1}: ${disc} (${dateStr})\n`;
        text += `• 📌 Tema Central: ${themeStr}\n`;
        text += `• 👨‍🏫 Docente Responsável: ${profStr}\n`;
        text += `• 📖 Referências Bíblicas: ${bibRef}\n`;
        if (n.ai_summary_url) {
          text += `• 🔗 Link do Google Docs (Meet IA): ${n.ai_summary_url}\n`;
        }
        text += `\n`;
        
        text += `### ❓ [ PISTAS & PERGUNTAS DE AUTO-TESTE (CUES - 30%) ]\n`;
        text += `${cuesStr}\n\n`;

        if (includeFullNotesInSummary && notesStr) {
          text += `### 📝 [ ANOTAÇÕES DE AULA ESTRUTURADAS (NOTES - 70%) ]\n`;
          text += `${notesStr}\n\n`;
        }

        text += `### 🎯 [ SÍNTESE & RESUMO CONSOLIDADO DA AULA ]\n`;
        text += `${summaryStr}\n\n`;
        text += `----------------------------------------------------------------------------------------\n\n`;
      });

      setConsolidatedResult(text);
    } catch (err: any) {
      console.error('Erro ao gerar resumo consolidado:', err);
      setConsolidatedResult(`❌ Ocorreu um erro ao processar o guia de estudos: ${err?.message || 'Falha inesperada'}`);
    }
  };

  const handlePrintNote = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal do Módulo Cornell */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 rounded-3xl text-white shadow-lg border border-indigo-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-black bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-xs">
              <BookOpen className="w-3.5 h-3.5" />
              Método Cornell Acadêmico
            </span>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/15">
              30% Pistas • 70% Anotações • Resumo IA Meet
            </span>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Sincronização Nuvem Ativa
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Caderno de Anotações Teológicas (Método Cornell)
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/90 max-w-3xl leading-relaxed">
            Anotações de aula em tempo real integradas com os resumos inteligentes gerados pela IA do Google Meet (Gemini),
            navegação cronológica por disciplina e modo de auto-teste.
          </p>
        </div>

        {/* Botões de Ação Global */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => handleCreateNewNoteForDisc()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Anotação</span>
          </button>

          <button
            onClick={handleOpenConsolidatedModal}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            title="Consolidar anotações em um Guia de Estudos Unificado"
          >
            <Layers className="w-4 h-4" />
            <span>Gerar Guia de Estudos</span>
          </button>

          <button
            onClick={() => {
              setTempAiUrl(currentNote.ai_summary_url || '');
              setTempAiText(currentNote.ai_summary_text || '');
              setShowApiKeyConfig(true);
              setIsEditAiModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Configurações do Motor de IA e Chave Gemini"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Configurar IA Gemini</span>
          </button>

          <button
            onClick={handlePrintNote}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BARRA DE FILTRO POR MATÉRIA & NAVEGAÇÃO CRONOLÓGICA ENTRE DIAS */}
      <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Seletor / Filtro por Matéria */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <span className="p-2 bg-blue-50 text-blue-800 rounded-xl">
            <Filter className="w-4 h-4" />
          </span>
          <div className="flex-1 md:w-80">
            <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-0.5">
              Filtrar por Matéria / Disciplina:
            </label>
            <select
              value={filterDisciplina}
              onChange={(e) => {
                const selected = e.target.value;
                setFilterDisciplina(selected);
                const scoped = allNotesList.filter(n => selected === 'all' || n.disciplina_name === selected);
                if (scoped.length > 0) {
                  setActiveNoteId(scoped[scoped.length - 1].id);
                  setCurrentNote(scoped[scoped.length - 1]);
                }
              }}
              className="w-full p-2 text-xs font-bold border border-gray-200 rounded-xl bg-gray-50 text-blue-950 outline-none focus:border-blue-500 focus:bg-white transition"
            >
              <option value="all">📚 Todas as Disciplinas ({allNotesList.length} aulas)</option>
              {disciplinasList.map((d) => {
                const count = allNotesList.filter((n) => n.disciplina_name === d.name).length;
                return (
                  <option key={d.name} value={d.name}>
                    {d.name} ({count} {count === 1 ? 'aula' : 'aulas'})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Navegador Cronológico de Dias da Matéria Selecionada */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleNavigatePreviousNote}
              disabled={currentNoteIndexInScope <= 0}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
              title="Voltar para a aula do dia anterior"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Aula Anterior</span>
            </button>

            <span className="px-2.5 py-1 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg">
              {currentNoteIndexInScope >= 0 ? `${currentNoteIndexInScope + 1} de ${notesOfActiveScope.length}` : '—'}
            </span>

            <button
              onClick={handleNavigateNextNote}
              disabled={currentNoteIndexInScope < 0 || currentNoteIndexInScope >= notesOfActiveScope.length - 1}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
              title="Avançar para a próxima aula"
            >
              <span>Próxima Aula</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Botão de alternar Histórico */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs cursor-pointer ${
              !isSidebarOpen
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
            }`}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            <span>{isSidebarOpen ? 'Ocultar Histórico' : `Histórico (${filteredNoteKeys.length})`}</span>
          </button>
        </div>
      </div>

      {/* Pílulas de Aulas Registradas para Navegação Rápida entre Dias */}
      {notesOfActiveScope.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap flex items-center gap-1">
            <Clock className="w-3 h-3" /> Dias Gravados:
          </span>
          {notesOfActiveScope.map((n, idx) => {
            const isSelected = n.id === currentNote.id;
            return (
              <button
                key={n.id}
                onClick={() => handleSelectNote(n.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>🗓️ {n.date}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  Aula {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Notificação Temporária de Salvamento */}
      {saveStatusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveStatusMessage}</span>
        </div>
      )}

      {/* Grid Principal: Sidebar Histórica (Esquerda) + Caderno Cornell Espacial (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SIDEBAR HISTÓRICA & BUSCA DE ANOTAÇÕES */}
        {isSidebarOpen && (
          <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4 animate-in fade-in slide-in-from-left-4 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Histórico Cronológico</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold">
                  {filteredNoteKeys.length}
                </span>
              </h3>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCreateNewNoteForDisc()}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                  title="Criar nova aula"
                >
                  <Plus className="w-3.5 h-3.5" /> Nova
                </button>

                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                  title="Ocultar Histórico para expandir a folha (Tela Cheia)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Campo de Busca em Tempo Real */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar em notas, temas ou passagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Lista de Aulas Gravadas */}
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredNoteKeys.map((key) => {
                const note = allNotes[key];
                const isSelected = activeNoteId === key;
                return (
                  <div
                    key={key}
                    onClick={() => handleSelectNote(key)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-300 shadow-sm ring-2 ring-blue-500/10'
                        : 'bg-gray-50/50 border-gray-200/80 hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-blue-800 border border-blue-200">
                        {note.disciplina_name}
                      </span>
                      <button
                        onClick={(e) => handlePromptDeleteNote(key, e)}
                        className="text-gray-300 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer"
                        title="Excluir este caderno de anotação deste dia"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className={`font-bold text-xs leading-snug line-clamp-2 ${isSelected ? 'text-blue-950' : 'text-gray-800'}`}>
                      {note.theme || 'Sem título'}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                      <span className="flex items-center gap-1 font-mono font-bold">
                        <Clock className="w-3 h-3 text-gray-400" /> {note.date}
                      </span>
                      {note.ai_summary_url && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> IA
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredNoteKeys.length === 0 && (
                <div className="p-8 text-center text-xs text-gray-400 italic">
                  Nenhuma anotação encontrada com os filtros selecionados.
                </div>
              )}
            </div>
          </div>
        )}

        {/* CADERNO CORNELL ESPACIAL (Ocupa 8 Colunas ou 12 Colunas em Tela Expandida) */}
        <div className={`${isSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white p-5 sm:p-7 rounded-3xl border border-gray-200 shadow-sm space-y-6 transition-all duration-300`}>
          {/* BARRA DE FERRAMENTAS DO CADERNO & ACTIVE RECALL TOGGLE */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                <Bookmark className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <span>Folha Cornell Ativa</span>
                  {!isSidebarOpen && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      Modo Expandido
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500">
                  Disciplina: <strong>{currentNote.disciplina_name}</strong> • Data: <strong>{currentNote.date}</strong>
                </p>
              </div>
            </div>

            {/* BOTÕES DA BARRA SUPERIOR (EXCLUIR / ACTIVE RECALL) */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handlePromptDeleteNote(activeNoteId)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 border border-red-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Excluir este caderno de anotações (libera o dia ou remove duplicatas)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Folha</span>
              </button>

              <button
                onClick={() => setIsActiveRecallCovered(!isActiveRecallCovered)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer ${
                  isActiveRecallCovered
                    ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
                }`}
                title="Oculta ou revela a coluna de notas para testar sua memória usando apenas as pistas da esquerda"
              >
                {isActiveRecallCovered ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Modo Active Recall: REVELAR NOTAS</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Modo Auto-Teste (Active Recall)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 1. CABEÇALHO DE METADADOS (Faixa Superior da Folha Cornell) */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border border-gray-200/90 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Disciplina */}
              <div>
                <label className="block text-[11px] font-extrabold text-gray-600 uppercase tracking-wider mb-1">
                  Disciplina Teológica:
                </label>
                <select
                  value={currentNote.disciplina_name}
                  onChange={(e) => {
                    const disc = disciplinasList.find((d) => d.name === e.target.value);
                    handleUpdateCurrentNote({
                      disciplina_name: e.target.value,
                      disciplina_code: disc?.code || '',
                      professor_name: disc?.prof || currentNote.professor_name,
                    });
                  }}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-white font-bold text-xs text-blue-900 outline-none focus:border-blue-500 shadow-2xs"
                >
                  {disciplinasList.map((d) => (
                    <option key={d.name} value={d.name}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              {/* Data da Aula */}
              <div>
                <label className="block text-[11px] font-extrabold text-gray-600 uppercase tracking-wider mb-1">
                  Data da Aula:
                </label>
                <input
                  type="date"
                  value={currentNote.date ?? ''}
                  onChange={(e) => handleUpdateCurrentNote({ date: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-white font-bold text-xs text-gray-800 outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              {/* Professor Responsável */}
              <div>
                <label className="block text-[11px] font-extrabold text-gray-600 uppercase tracking-wider mb-1">
                  Docente / Professor:
                </label>
                <input
                  type="text"
                  value={currentNote.professor_name ?? ''}
                  onChange={(e) => handleUpdateCurrentNote({ professor_name: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-xl bg-white font-semibold text-xs text-gray-800 outline-none focus:border-blue-500 shadow-2xs"
                  placeholder="Nome do docente..."
                />
              </div>
            </div>

            {/* Tema da Aula & Referências Bíblicas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-extrabold text-gray-600 uppercase tracking-wider mb-1">
                  Tema Central da Aula:
                </label>
                <input
                  type="text"
                  value={currentNote.theme ?? ''}
                  onChange={(e) => handleUpdateCurrentNote({ theme: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-white font-extrabold text-xs sm:text-sm text-gray-900 outline-none focus:border-blue-500 shadow-2xs"
                  placeholder="Ex: Justificação pela Fé em Romanos..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-gray-600 uppercase tracking-wider mb-1">
                  Textos Bíblicos & Apoio:
                </label>
                <input
                  type="text"
                  value={currentNote.biblical_references ?? ''}
                  onChange={(e) => handleUpdateCurrentNote({ biblical_references: e.target.value })}
                  className="w-full p-2.5 border border-gray-200 rounded-xl bg-white font-semibold text-xs text-indigo-900 outline-none focus:border-indigo-500 shadow-2xs"
                  placeholder="Ex: Romanos 3:21-26; Efésios 2:8-9..."
                />
              </div>
            </div>
          </div>

          {/* 1.5. BARRA DE RESUMO INTELIGENTE DA IA DO GOOGLE MEET */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl text-white shadow-md border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Resumo IA do Google Meet (Gemini)
                </span>
                {currentNote.ai_summary_url && (
                  <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Google Docs Vinculado
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100/90 leading-relaxed">
                {currentNote.ai_summary_text || currentNote.ai_summary_url
                  ? 'Resumo executivo, tópicos da aula e tarefas geradas pela IA do Meet disponíveis para seus estudos.'
                  : 'Vincule o link do Google Docs gerado após a aula no Google Meet ou cole o resumo para estudar.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {currentNote.ai_summary_url && (
                <a
                  href={currentNote.ai_summary_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                  title="Abrir arquivo oficial no Google Docs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Google Docs ↗</span>
                </a>
              )}

              {(currentNote.ai_summary_url || currentNote.ai_summary_text) && (
                <button
                  onClick={() => {
                    setTempAiUrl(currentNote.ai_summary_url || '');
                    setTempAiText(currentNote.ai_summary_text || '');
                    setAiTransformResult(null);
                    setAiTransformError(null);
                    setIsEditAiModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  title="Abrir o Transformador de IA para gerar o Método Cornell (30% Pistas, 70% Anotações e Resumo)"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>🪄 Estruturar em Cornell com IA</span>
                </button>
              )}

              {(currentNote.ai_summary_url || currentNote.ai_summary_text) && (
                <button
                  onClick={() => setIsAiSummaryModalOpen(true)}
                  className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  title="Ler todo o resumo transcrito pela IA"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-300" />
                  <span>Ler Resumo da IA</span>
                </button>
              )}

              {(currentNote.ai_summary_url || currentNote.ai_summary_text) && (
                <button
                  onClick={handleMergeAiSummaryToNotes}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  title="Injetar o resumo da IA na sua coluna de anotações"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Injetar nas Notas</span>
                </button>
              )}

              <button
                onClick={() => {
                  setTempAiUrl(currentNote.ai_summary_url || '');
                  setTempAiText(currentNote.ai_summary_text || '');
                  setAiTransformResult(null);
                  setAiTransformError(null);
                  setIsEditAiModalOpen(true);
                }}
                className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                title="Editar link ou texto do resumo de IA"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{currentNote.ai_summary_url || currentNote.ai_summary_text ? 'Editar IA' : 'Adicionar Resumo IA'}</span>
              </button>
            </div>
          </div>

          {/* 2 & 3. ARQUITETURA ESPACIAL BIPARTIDA CORNELL (30% PISTAS / 70% NOTAS) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch min-h-[420px]">
            {/* COLUNA DA ESQUERDA (~30% ou 4 Colunas Grid): PISTAS, CONCEITOS E PERGUNTAS */}
            <div className="md:col-span-4 bg-amber-50/60 p-4 rounded-2xl border border-amber-200 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 flex items-center gap-1.5 uppercase tracking-wider">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                    Pistas & Perguntas (Cues)
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                    30% Largura
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/80 leading-tight">
                  Palavras-chave, conceitos centrais e perguntas para auto-avaliação pós-aula.
                </p>
              </div>

              <textarea
                rows={18}
                value={currentNote.cues ?? ''}
                onChange={(e) => handleUpdateCurrentNote({ cues: e.target.value })}
                placeholder="❓ 1. Pergunta de fixação da matéria...&#10;&#10;💡 2. Conceito-chave ou doutrina bíblica...&#10;&#10;🎯 3. Aplicação pastoral prática..."
                className="w-full p-4 border border-amber-200/90 rounded-2xl bg-white/95 text-xs sm:text-[13px] font-sans font-medium text-amber-950 outline-none focus:border-amber-500 focus:bg-white resize-none shadow-inner leading-loose flex-1 transition"
              />

              <div className="text-[10px] text-amber-700 italic flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Cubra a coluna ao lado e teste se consegue responder a estas perguntas.</span>
              </div>
            </div>

            {/* COLUNA DA DIREITA (~70% ou 8 Colunas Grid): ANOTAÇÕES PRINCIPAIS EM TEMPO REAL */}
            <div className="md:col-span-8 bg-blue-50/40 p-4 rounded-2xl border border-blue-200 flex flex-col justify-between space-y-2 relative overflow-hidden">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-950 flex items-center gap-1.5 uppercase tracking-wider">
                    <PenTool className="w-3.5 h-3.5 text-blue-700" />
                    Anotações de Aula (Notes)
                  </span>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    70% Largura
                  </span>
                </div>
                <p className="text-[11px] text-blue-800/80 leading-tight">
                  Anotações em tempo real, sentenças telegráficas curtas, tópicos e esquemas.
                </p>
              </div>

              {/* Cortina do Active Recall */}
              {isActiveRecallCovered ? (
                <div className="flex-1 min-h-[340px] bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 rounded-xl p-6 text-white flex flex-col items-center justify-center text-center space-y-3 shadow-inner animate-in fade-in">
                  <div className="p-3 bg-white/10 rounded-full text-amber-300">
                    <EyeOff className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-base text-white">Coluna de Anotações Oculta para Auto-Teste</h4>
                  <p className="text-xs text-blue-200 max-w-md leading-relaxed">
                    Exercício de Recuperação Ativa (*Active Recall*): Tente formular e responder em voz alta
                    ou mentalmente aos tópicos listados na coluna de Pistas à esquerda antes de conferir.
                  </p>
                  <button
                    onClick={() => setIsActiveRecallCovered(false)}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    👁️ Revelar Minhas Anotações
                  </button>
                </div>
              ) : (
                <textarea
                  rows={18}
                  value={currentNote.notes ?? ''}
                  onChange={(e) => handleUpdateCurrentNote({ notes: e.target.value })}
                  placeholder="📌 1. METODOLOGIA E CRITÉRIOS AVALIATIVOS&#10;&#10;• Ideia central explicada pelo docente...&#10;   ↳ Argumento exegético...&#10;   ↳ Aplicação ministerial prática..."
                  className="w-full p-4.5 border border-blue-200 rounded-2xl bg-white text-xs sm:text-[13px] font-sans text-gray-900 outline-none focus:border-blue-500 resize-none shadow-inner leading-relaxed flex-1 whitespace-pre-wrap transition"
                />
              )}

              <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1">
                <span>{(currentNote.notes ?? '').length} caracteres digitados</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Auto-salvamento ativo
                </span>
              </div>
            </div>
          </div>

          {/* 4. FAIXA BASAL INFERIOR: ÁREA DE RESUMO (Síntese Global em 2 a 3 Frases) */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-emerald-50/70 rounded-2xl border border-emerald-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                Resumo Consolidado da Aula (Summary)
              </span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
                Faixa Basal Inferior
              </span>
            </div>

            <p className="text-[11px] text-emerald-800">
              Síntese global e essencial do conteúdo em 2 a 3 sentenças estruturadas (preenchida após a aula).
            </p>

            <textarea
              rows={4}
              value={currentNote.summary ?? ''}
              onChange={(e) => handleUpdateCurrentNote({ summary: e.target.value })}
              placeholder="Sintetize a grande ideia teológica da aula em 2 a 3 frases claras e objetivas..."
              className="w-full p-3.5 border border-emerald-300 rounded-2xl bg-white text-xs sm:text-[13px] font-sans font-medium text-emerald-950 outline-none focus:border-emerald-600 resize-none shadow-inner leading-relaxed transition"
            />
          </div>
        </div>
      </div>

      {/* MODAL: LEITOR COMPLETO DO RESUMO GERADO PELA IA DO MEET */}
      {isAiSummaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-950 rounded-xl">
                  <Sparkles className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    Resumo Inteligente Google Meet & Gemini
                  </h3>
                  <p className="text-xs text-gray-500">
                    {currentNote.disciplina_name} • Data: {currentNote.date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiSummaryModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {currentNote.ai_summary_text ? (
                <div className="p-4 bg-gray-900 text-emerald-300 rounded-2xl font-mono text-xs whitespace-pre-wrap max-h-[420px] overflow-y-auto border border-gray-800 leading-relaxed shadow-inner">
                  {currentNote.ai_summary_text}
                </div>
              ) : (
                <div className="p-6 bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-500/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-white">Documento Oficial no Google Docs Vinculado</h4>
                      <p className="text-xs text-blue-200">
                        O resumo da IA e a transcrição desta aula estão prontos para consulta no Google Docs.
                      </p>
                    </div>
                  </div>

                  {currentNote.ai_summary_url && (
                    <div className="p-4 bg-white/10 rounded-xl border border-white/15 space-y-2">
                      <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                        Link do Documento no Google Docs:
                      </span>
                      <a
                        href={currentNote.ai_summary_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-blue-300 hover:text-blue-200 underline break-all flex items-center gap-1.5"
                      >
                        <span>{currentNote.ai_summary_url}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Clique no botão para abrir o documento oficial no Google Docs ou clique em <strong>Editar / Colar Texto</strong> para manter uma cópia textual nesta folha.
                    </p>
                    <button
                      onClick={() => {
                        setIsAiSummaryModalOpen(false);
                        setTempAiUrl(currentNote.ai_summary_url || '');
                        setTempAiText(currentNote.ai_summary_text || '');
                        setIsEditAiModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl transition whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Colar Texto da IA
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {currentNote.ai_summary_url && (
                  <a
                    href={currentNote.ai_summary_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir no Google Docs Oficial ↗</span>
                  </a>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (currentNote.ai_summary_text) {
                      navigator.clipboard.writeText(currentNote.ai_summary_text);
                      alert('Resumo copiado para a área de transferência!');
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" /> Copiar Texto
                </button>
                <button
                  onClick={() => {
                    handleMergeAiSummaryToNotes();
                    setIsAiSummaryModalOpen(false);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Injetar nas Anotações da Folha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFORMADOR INTELIGENTE DE IA (MEET / DOCS ➡️ MÉTODO CORNELL) */}
      {isEditAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 rounded-2xl shadow-xs">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-gray-900">
                      Transformador IA: Meet ➡️ Método Cornell
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      Gemini IA
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {currentNote.disciplina_name} • Data: {currentNote.date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditAiModalOpen(false);
                  setAiTransformResult(null);
                  setAiTransformError(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* 1. Entrada de Link do Google Docs */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Link do Google Docs (Resumo gerado pela IA do Google Meet):
                  </label>
                  <div className="flex items-center gap-2">
                    {(tempAiUrl || tempAiText) && (
                      <button
                        type="button"
                        onClick={() => {
                          setTempAiUrl('');
                          setTempAiText('');
                          setAiTransformResult(null);
                          setAiTransformError(null);
                        }}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 hover:underline cursor-pointer"
                        title="Limpar link e texto para colar um novo conteúdo"
                      >
                        <Trash2 className="w-3 h-3" /> Limpar Campos
                      </button>
                    )}
                    {tempAiUrl && (
                      <a
                        href={tempAiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Testar link ↗</span>
                      </a>
                    )}
                  </div>
                </div>
                <input
                  type="url"
                  placeholder="https://docs.google.com/document/d/..."
                  value={tempAiUrl}
                  onChange={(e) => {
                    setTempAiUrl(e.target.value);
                    setAiTransformResult(null);
                    setAiTransformError(null);
                  }}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-500 bg-gray-50/50 transition font-mono"
                />
              </div>

              {/* 2. Entrada de Texto da Transcrição / Resumo */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Texto ou Transcrição Completa da Aula (Cole aqui para transformar):
                  </label>
                  {tempAiText && (
                    <span className="text-[10px] text-gray-500 font-mono">
                      {tempAiText.length} caracteres • {tempAiText.split(/\s+/).filter(Boolean).length} palavras
                    </span>
                  )}
                </div>
                <textarea
                  rows={6}
                  placeholder="Cole aqui o texto gerado pelo Gemini no Meet, resumo executivo, tópicos ou anotações brutas da aula..."
                  value={tempAiText}
                  onChange={(e) => {
                    setTempAiText(e.target.value);
                    setAiTransformResult(null);
                    setAiTransformError(null);
                  }}
                  className="w-full p-3 border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-blue-500 transition resize-none leading-relaxed bg-gray-50/50"
                />
              </div>

              {/* PAINEL DE CONFIGURAÇÕES DE IA (OPENAI + GEMINI + NATIVO) */}
              <div className="border border-indigo-100 rounded-2xl p-4 bg-gradient-to-br from-indigo-50/70 via-slate-50/50 to-blue-50/50 shadow-2xs space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-xl shadow-2xs">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                        <span>⚙️ Configurações de IA</span>
                      </h4>
                      <p className="text-[10px] text-gray-500">
                        Insira suas chaves de API. Elas são salvas apenas no seu navegador e não são enviadas para nenhum servidor nosso.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {aiProvider === 'openai' && openAiApiKey && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        OpenAI ({openAiModel})
                      </span>
                    )}
                    {aiProvider === 'gemini' && geminiApiKey && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Gemini Conectado
                      </span>
                    )}
                    {aiProvider === 'auto' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                        🔄 Automático
                      </span>
                    )}
                    {aiProvider === 'native' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                        🔵 Motor Nativo
                      </span>
                    )}
                  </div>
                </div>

                {/* 1. SELETOR DE PROVEDOR PREFERIDO */}
                <div>
                  <label className="block text-[11px] font-extrabold text-gray-800 mb-1.5">
                    Provedor Preferido:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'auto', label: '🔄 Automático', desc: 'Tenta OpenAI, depois Gemini' },
                      { id: 'openai', label: '🤖 OpenAI (ChatGPT)', desc: 'GPT-4o, 4.1, 5.5' },
                      { id: 'gemini', label: '✨ Google Gemini', desc: 'Google AI Studio' },
                      { id: 'native', label: '🔵 Motor Nativo', desc: 'Sem necessidade de chaves' },
                    ].map((prov) => (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => {
                          setAiProvider(prov.id as AIProvider);
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('lms_ai_provider', prov.id);
                          }
                        }}
                        className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                          aiProvider === prov.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-bold text-[11px] block">{prov.label}</span>
                        <span className={`text-[9px] block leading-tight ${aiProvider === prov.id ? 'text-blue-100' : 'text-gray-400'}`}>
                          {prov.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. CONFIGURAÇÃO OPENAI (CHATGPT) */}
                {(aiProvider === 'openai' || aiProvider === 'auto') && (
                  <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-emerald-600" />
                          <span>OpenAI API Key:</span>
                        </label>
                        <a
                          href="https://platform.openai.com/api-keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          <span>Obter ↗</span>
                        </a>
                      </div>
                      <span className="text-[10px] text-gray-500 block mb-1.5">
                        Sua chave da OpenAI funciona com qualquer modelo abaixo.
                      </span>

                      <div className="relative flex items-center">
                        <input
                          type={showOpenAiKeyVisibility ? 'text' : 'password'}
                          placeholder="sk-proj-..."
                          value={openAiApiKey}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOpenAiApiKey(val);
                            setOpenAiTestStatus('idle');
                            setOpenAiTestMessage(null);
                            if (typeof window !== 'undefined') {
                              localStorage.setItem('lms_openai_api_key', val.trim());
                            }
                          }}
                          className="w-full pl-3 pr-20 py-2 border border-gray-300 rounded-xl text-xs bg-gray-50/50 font-mono outline-none focus:border-blue-500 transition shadow-2xs"
                        />
                        <div className="absolute right-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setShowOpenAiKeyVisibility(!showOpenAiKeyVisibility)}
                            className="p-1 text-gray-400 hover:text-gray-700 transition"
                            title={showOpenAiKeyVisibility ? 'Ocultar' : 'Mostrar'}
                          >
                            {showOpenAiKeyVisibility ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          {openAiApiKey && (
                            <button
                              type="button"
                              onClick={() => {
                                setOpenAiApiKey('');
                                setOpenAiTestStatus('idle');
                                setOpenAiTestMessage(null);
                                if (typeof window !== 'undefined') {
                                  localStorage.removeItem('lms_openai_api_key');
                                }
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition"
                              title="Remover chave"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SELEÇÃO DO MODELO OPENAI */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-800 mb-1.5">
                        Modelo OpenAI:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {[
                          {
                            id: 'gpt-4.1',
                            name: '⭐ GPT-4.1',
                            tag: 'Ótima qualidade, bom custo (Recomendado)',
                          },
                          {
                            id: 'gpt-5.5',
                            name: '🏆 GPT-5.5',
                            tag: 'Melhor qualidade teológica (Mais robusto)',
                          },
                          {
                            id: 'gpt-4o',
                            name: '🤖 GPT-4o',
                            tag: 'Qualidade alta, custo médio equilibrado',
                          },
                          {
                            id: 'gpt-4o-mini',
                            name: '💸 GPT-4o mini',
                            tag: 'Mais barato, qualidade mais simples',
                          },
                        ].map((mod) => (
                          <div
                            key={mod.id}
                            onClick={() => {
                              setOpenAiModel(mod.id);
                              if (typeof window !== 'undefined') {
                                localStorage.setItem('lms_openai_model', mod.id);
                              }
                            }}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                              openAiModel === mod.id
                                ? 'bg-emerald-50/80 border-emerald-500 shadow-2xs ring-1 ring-emerald-400/30'
                                : 'bg-gray-50/60 border-gray-200 hover:bg-gray-100/70'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-gray-900">{mod.name}</span>
                              <input
                                type="radio"
                                name="openai_model_select"
                                checked={openAiModel === mod.id}
                                onChange={() => {}}
                                className="accent-emerald-600"
                              />
                            </div>
                            <span className="text-[10px] text-gray-500 mt-0.5">{mod.tag}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[10px] text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-200 mt-2 leading-relaxed">
                        💡 <strong>Dica:</strong> Para textos de narração com profundidade pastoral, prefira <strong>GPT-4.1</strong> ou <strong>GPT-5.5</strong> (ou <strong>GPT-4o</strong>). O modelo &quot;mini&quot; é mais raso para esse tipo de conteúdo.
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleTestOpenAiKey}
                        disabled={openAiTestStatus === 'testing' || !openAiApiKey.trim()}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[11px] rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        {openAiTestStatus === 'testing' ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Validando com OpenAI...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 text-amber-300" />
                            <span>Testar Conexão com OpenAI</span>
                          </>
                        )}
                      </button>

                      <span className="text-[10px] text-gray-400">
                        Validação instantânea via API OpenAI
                      </span>
                    </div>

                    {openAiTestMessage && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
                          openAiTestStatus === 'success'
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                            : 'bg-red-50 text-red-900 border border-red-200'
                        }`}
                      >
                        {openAiTestStatus === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <span>{openAiTestMessage}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. CONFIGURAÇÃO GOOGLE GEMINI */}
                {(aiProvider === 'gemini' || aiProvider === 'auto') && (
                  <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Google Gemini API Key:</span>
                      </label>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <span>Obter grátis ↗</span>
                      </a>
                    </div>

                    <div className="relative flex items-center">
                      <input
                        type={showApiKeyVisibility ? 'text' : 'password'}
                        placeholder="AQ... ou AIzaSy..."
                        value={geminiApiKey}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGeminiApiKey(val);
                          setApiKeyTestStatus('idle');
                          setApiKeyTestMessage(null);
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('lms_gemini_api_key', val.trim());
                          }
                        }}
                        className="w-full pl-3 pr-20 py-2 border border-gray-300 rounded-xl text-xs bg-gray-50/50 font-mono outline-none focus:border-blue-500 transition shadow-2xs"
                      />
                      <div className="absolute right-2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowApiKeyVisibility(!showApiKeyVisibility)}
                          className="p-1 text-gray-400 hover:text-gray-700 transition"
                          title={showApiKeyVisibility ? 'Ocultar' : 'Mostrar'}
                        >
                          {showApiKeyVisibility ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        {geminiApiKey && (
                          <button
                            type="button"
                            onClick={() => {
                              setGeminiApiKey('');
                              setApiKeyTestStatus('idle');
                              setApiKeyTestMessage(null);
                              if (typeof window !== 'undefined') {
                                localStorage.removeItem('lms_gemini_api_key');
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition"
                            title="Remover chave"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleTestGeminiKey}
                        disabled={apiKeyTestStatus === 'testing' || !geminiApiKey.trim()}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-[11px] rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        {apiKeyTestStatus === 'testing' ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Validando com Gemini...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 text-amber-300" />
                            <span>Testar Conexão com Gemini</span>
                          </>
                        )}
                      </button>

                      <span className="text-[10px] text-gray-400">
                        Suporte a Gemini 2.5 Flash / Flash Lite
                      </span>
                    </div>

                    {apiKeyTestMessage && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
                          apiKeyTestStatus === 'success'
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                            : 'bg-red-50 text-red-900 border border-red-200'
                        }`}
                      >
                        {apiKeyTestStatus === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <span>{apiKeyTestMessage}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botão de Disparo do Motor de IA */}
              <div className="p-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm border border-indigo-900">
                <div className="text-xs">
                  <span className="font-extrabold text-amber-300 block">
                    ⚡ Estruturação Automática em Método Cornell
                  </span>
                  <span className="text-[11px] text-blue-200">
                    Gera Pistas (30%), Anotações (70%), Resumo e Referências Bíblicas.
                  </span>
                </div>

                <button
                  onClick={() => handleRunAiTransformation()}
                  disabled={isAiTransforming || (!tempAiUrl && !tempAiText)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  {isAiTransforming ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Processando com IA...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Gerar Estrutura Cornell com IA</span>
                    </>
                  )}
                </button>
              </div>

              {/* Alerta de Erro ou Orientação */}
              {aiTransformError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-950">Aviso de Leitura:</p>
                    <p>{aiTransformError}</p>
                    <p className="text-[11px] text-amber-800">
                      💡 <strong>Como resolver:</strong> Abra o documento no Google Docs, selecione todo o texto (Ctrl+A / Cmd+A), copie e cole no campo de texto acima. Em seguida clique novamente em <strong>Gerar Estrutura Cornell com IA</strong>.
                    </p>
                  </div>
                </div>
              )}

              {/* PREVIEW DO RESULTADO GERADO PELA IA */}
              {aiTransformResult && (
                <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-2xl space-y-3 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Estrutura Cornell Gerada pela IA (Pronta para Aplicação)
                    </span>
                    <button
                      onClick={() => handleApplyAiTransformationToSheet(aiTransformResult)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Aplicar na Folha
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                      <strong className="text-[10px] text-gray-500 uppercase block">Tema Identificado:</strong>
                      <span className="font-bold text-gray-900">{aiTransformResult.theme}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200">
                      <strong className="text-[10px] text-gray-500 uppercase block">Textos Bíblicos & Apoio:</strong>
                      <span className="font-bold text-indigo-900">{aiTransformResult.biblical_references || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                    {/* Pistas 30% */}
                    <div className="sm:col-span-5 p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200 space-y-1.5 max-h-80 overflow-y-auto">
                      <strong className="text-[10px] font-black text-amber-950 uppercase tracking-wider block">
                        🎯 Pistas & Perguntas (Cues - 30%):
                      </strong>
                      <div className="text-[11px] sm:text-xs text-amber-950 whitespace-pre-wrap leading-loose font-sans">
                        {aiTransformResult.cues}
                      </div>
                    </div>

                    {/* Notas 70% */}
                    <div className="sm:col-span-7 p-3.5 bg-blue-50/90 rounded-2xl border border-blue-200 space-y-1.5 max-h-80 overflow-y-auto">
                      <strong className="text-[10px] font-black text-blue-950 uppercase tracking-wider block">
                        📝 Anotações Estruturadas (Notes - 70%):
                      </strong>
                      <div className="text-[11px] sm:text-xs text-blue-950 whitespace-pre-wrap leading-relaxed font-sans">
                        {aiTransformResult.notes}
                      </div>
                    </div>
                  </div>

                  {/* Resumo Consolidado */}
                  <div className="p-3.5 bg-white rounded-2xl border border-emerald-300 space-y-1 text-xs">
                    <strong className="text-[10px] font-black text-emerald-950 uppercase tracking-wider block">
                      ✨ Síntese & Resumo Consolidado (Summary):
                    </strong>
                    <p className="text-xs text-emerald-950 leading-relaxed font-sans font-medium whitespace-pre-wrap">
                      {aiTransformResult.summary}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setIsEditAiModalOpen(false);
                  setAiTransformResult(null);
                  setAiTransformError(null);
                }}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Fechar
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveAiModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  title="Salva apenas o link e o texto sem reformatar os campos da folha"
                >
                  <Save className="w-3.5 h-3.5" /> Salvar Link / Texto
                </button>

                {aiTransformResult && (
                  <button
                    onClick={() => handleApplyAiTransformationToSheet(aiTransformResult)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Aplicar na Folha Cornell
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GERADOR DE RESUMOS CONSOLIDADOS (GUIA DE ESTUDOS) */}
      {isConsolidatedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">Gerador de Guia de Estudos Consolidado</h3>
                  <p className="text-xs text-gray-500">Unifica as pistas, sínteses e resumos de IA das aulas selecionadas.</p>
                </div>
              </div>
              <button
                onClick={() => setIsConsolidatedModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!consolidatedResult ? (
              <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-700">
                      Selecione as aulas para incluir no guia ({selectedNoteIdsForSummary.length} selecionadas):
                    </label>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          const targetNotes = filterDisciplina === 'all' ? allNotesList : notesOfActiveScope;
                          setSelectedNoteIdsForSummary(targetNotes.map((n) => n.id));
                        }}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-bold cursor-pointer"
                      >
                        Marcar Todas
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedNoteIdsForSummary([])}
                        className="text-gray-500 hover:text-gray-700 hover:underline font-bold cursor-pointer"
                      >
                        Desmarcar Todas
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-2xl p-3 bg-gray-50">
                    {(filterDisciplina === 'all' ? allNotesList.sort((a, b) => (a.date || '').localeCompare(b.date || '')) : notesOfActiveScope).map((n) => {
                      const id = n.id;
                      const isChecked = selectedNoteIdsForSummary.includes(id);
                      return (
                        <label
                          key={id}
                          className="flex items-start gap-2.5 p-2.5 bg-white rounded-xl border border-gray-200/80 cursor-pointer hover:bg-blue-50/50 transition shadow-2xs"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedNoteIdsForSummary([...selectedNoteIdsForSummary, id]);
                              } else {
                                setSelectedNoteIdsForSummary(selectedNoteIdsForSummary.filter((k) => k !== id));
                              }
                            }}
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <div className="text-xs flex-1">
                            <div className="flex justify-between items-center">
                              <strong className="text-gray-900 font-bold">{n.disciplina_name}</strong>
                              <span className="text-gray-400 font-mono text-[11px] font-bold">{n.date}</span>
                            </div>
                            <span className="text-gray-600 line-clamp-1 mt-0.5">{n.theme || 'Sem título'}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-blue-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeFullNotesInSummary}
                      onChange={(e) => setIncludeFullNotesInSummary(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Incluir Anotações de Aula Detalhadas (Coluna de 70% Notes)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setIsConsolidatedModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleGenerateConsolidated}
                    disabled={selectedNoteIdsForSummary.length === 0}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar Síntese Unificada ({selectedNoteIdsForSummary.length} aulas)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                <div className="p-4 bg-gray-900 text-emerald-300 rounded-2xl font-mono text-xs whitespace-pre-wrap max-h-96 overflow-y-auto border border-gray-800 leading-relaxed shadow-inner select-text">
                  {consolidatedResult}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setConsolidatedResult(null)}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    ← Voltar para seleção
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (consolidatedResult) {
                          navigator.clipboard.writeText(consolidatedResult);
                          alert('✅ Guia de Estudos copiado com sucesso para a área de transferência!');
                        }
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Copiar Texto
                    </button>
                    <button
                      onClick={() => {
                        if (consolidatedResult) {
                          const blob = new Blob([consolidatedResult], { type: 'text/markdown;charset=utf-8;' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `Guia_Estudos_Cornell_${new Date().toISOString().split('T')[0]}.md`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Baixar Markdown
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE CADERNO */}
      {isDeleteModalOpen && noteToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">
                  Excluir Caderno de Anotações?
                </h3>
                <p className="text-xs text-gray-500">
                  Esta ação removerá a folha deste dia do seu histórico e da nuvem.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Disciplina:</span>
                <span className="font-black text-gray-900">{noteToDelete.disciplina_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Data da Aula:</span>
                <span className="font-mono font-black text-blue-900">{noteToDelete.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">Tema Registrado:</span>
                <span className="font-bold text-gray-800 line-clamp-1 max-w-[200px]">{noteToDelete.theme || 'Sem título'}</span>
              </div>
            </div>

            <p className="text-xs text-red-800 bg-red-50 p-3 rounded-xl border border-red-200 leading-relaxed">
              💡 <strong>Dica:</strong> Ao excluir, você poderá recriar uma nova folha do zero para esse mesmo dia ou remover duplicatas indesejadas.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setNoteToDelete(null);
                }}
                className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteNote}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir Folha</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
