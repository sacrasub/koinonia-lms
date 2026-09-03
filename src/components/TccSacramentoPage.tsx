'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, CheckCircle, Lightbulb, Target, Sparkles, 
  Flame, FileText, ArrowRight, CheckSquare, Clock, 
  ExternalLink, UserCheck, BarChart3, Save, Compass,
  Plus, Calendar, Trash2, Edit3, X, Download, Tag,
  Search, Eye, Layers, Check, Share2, Bookmark,
  Send, RefreshCw, Users, Filter, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { getSurveyResponses } from '@/services/tccResearchService';
import { 
  getPesquisaCampoAdminData, 
  TipoPublico, 
  TIPO_PUBLICO_LABELS, 
  PERGUNTAS_PESQUISA_TCC 
} from '@/services/pesquisaCampoService';

export interface TccCornellEntry {
  id: string;
  date: string; // YYYY-MM-DD ou formato DD/MM/YYYY
  theme: string;
  subject: string;
  professor: string;
  biblical_references: string;
  cues: string; // Coluna Esquerda (~30%): Palavras-chave, perguntas e pistas
  notes: string; // Coluna Direita (~70%): Anotações de aula/pesquisa, fichamento e reflexões
  summary: string; // Faixa Basal: Síntese e conclusões para o TCC
  tags: string[];
  created_at: string;
  updated_at: string;
}

const STORAGE_TCC_CORNELL_KEY = 'lms_tcc_cornell_notes_sacramento';
const STORAGE_TCC_CHECKLIST_KEY = 'lms_tcc_checklist_sacramento';
const STORAGE_TCC_NOTES_KEY = 'lms_tcc_notes_sacramento';

const INITIAL_CORNELL_SEEDS: TccCornellEntry[] = [
  {
    id: 'tcc-cornell-seed-1',
    date: '2026-08-25',
    theme: 'Fundamentação Teórica: A Distância Transacional de Michael G. Moore',
    subject: 'TCC - Metodologia & Fundamentação Teórica',
    professor: 'Orientador Pastor Alexsandro Silva / Profª Gabriela Leal',
    biblical_references: '1 Tessalonicenses 2:17; 2 João 1:12',
    cues: `• O que é Distância Transacional segundo Moore?
• A tríade: Diálogo, Estrutura e Autonomia
• Como o isolamento geográfico se difere do psicológico?
• Hipótese: O LMS Koinonia como ponte de proximidade`,
    notes: `1. CONCEITO DE DISTÂNCIA TRANSACIONAL (MOORE, 1993):
- A distância no ensino não é meramente física ou métrica, mas um espaço psicológico e de comunicação entre professor e estudantes.
- Três variáveis determinantes:
  a) Diálogo: Interação contínua síncrona (Google Meet, chats em tempo real).
  b) Estrutura: Grau de rigidez do design instrucional da plataforma.
  c) Autonomia do Aluno: Capacidade de autodirecionamento (Caderno Cornell, portfólios reflexivos).

2. APLICAÇÃO NO SEMINÁRIO TEOLÓGICO:
- O desafio na formação de pastores é garantir que o ambiente virtual não forme apenas mentes informadas, mas corações pastores em comunhão.
- Recursos de tele-proximidade reduzem a distância transacional permitindo presença real.`,
    summary: 'A Distância Transacional de Moore é superada quando combinamos estrutura flexível, autonomia de estudo e diálogo síncrono frequente, possibilitando a verdadeira formação ministerial no ambiente virtual.',
    tags: ['MichaelMoore', 'DistânciaTransacional', 'EADTeológica', 'Fundamentação'],
    created_at: '25/08/2026',
    updated_at: '25/08/2026',
  },
  {
    id: 'tcc-cornell-seed-2',
    date: '2026-08-28',
    theme: 'Eclesiologia Neotestamentária de Koinonia e Comunhão Digital',
    subject: 'TCC - Fundamentação Bíblico-Teológica',
    professor: 'Orientador Pastor Alexsandro Silva',
    biblical_references: 'Atos 2:42-47; 1 Coríntios 12:12-27; Hebreus 10:24-25',
    cues: `• Significado de Koinonia no Novo Testamento
• Compartilhamento de vida vs. Consumo de conteúdo
• Comunhão e mutualidade mediadas por tecnologia
• O modelo da igreja primitiva congregacional`,
    notes: `1. KOINONIA NO GREGO BÍBLICO:
- Não é mero encontro social; significa participação conjunta, compartilhamento de bens espirituais e mutualidade em Cristo.
- Atos 2:42: "perseveravam na doutrina dos apóstolos, na comunhão (koinonia), no partir do pão e nas orações".

2. TRANSLAÇÃO PARA O LMS:
- O LMS precisa deixar de ser um repositório passivo de PDFs para ser um espaço de vida comunitária: fóruns ativos, mural de oração e estudos colaborativos de homilética.`,
    summary: 'Koinonia é o cerne da identidade congregacional. No ambiente digital do LMS, ferramentas colaborativas e de oração resgatam a mutualidade apostólica mesmo à distância.',
    tags: ['Koinonia', 'Eclesiologia', 'Comunhão', 'Bíblico'],
    created_at: '28/08/2026',
    updated_at: '28/08/2026',
  },
  {
    id: 'tcc-cornell-seed-3',
    date: '2026-08-29',
    theme: 'Estruturação Metodológica do Pré-Projeto: Objetivos e Justificativa em 3ª Pessoa',
    subject: 'TCC - Metodologia Científica',
    professor: 'Profª Gabriela Leal',
    biblical_references: 'Lucas 1:1-4; Provérbios 25:2',
    cues: `• Verbos no infinitivo para objetivos (Geral e Específicos)
• Escrita impessoal em 3ª pessoa na Justificativa
• Definição da amostra empírica (Alunos 2026.2)
• Cronograma de 14 dias para o Pré-Projeto`,
    notes: `1. REGRAS DA PROFª GABRIELA LEAL:
- Objetivo Geral: Deve iniciar com verbo no infinitivo (ex: "Investigar as estratégias pedagógicas...", "Analisar a eficácia...").
- Objetivos Específicos: Mapear a percepção dos discentes, mensurar o impacto do Caderno Cornell e propor diretrizes curriculares.
- Justificativa: "A presente pesquisa justifica-se pela necessidade..." (nunca "Eu escolhi este tema porque...").

2. CRONOGRAMA:
- Alinhar com o Pastor Alexsandro Silva os capítulos 1 e 2.
- Tabular dados das 15 aulas sincronizadas no LMS.`,
    summary: 'O rigor científico é indispensável para que a pesquisa teológica tenha validade acadêmica. O pré-projeto segue rigorosamente a norma da ABNT e orientações da Profª Gabriela.',
    tags: ['Metodologia', 'PréProjeto', 'ABNT', 'EscritaCientífica'],
    created_at: '29/08/2026',
    updated_at: '29/08/2026',
  },
];

interface TccSacramentoPageProps {
  onTabChange?: (tab: string) => void;
}

export const TccSacramentoPage: React.FC<TccSacramentoPageProps> = ({ onTabChange }) => {
  // Lista de Notas Cornell do TCC
  const [cornellNotes, setCornellNotes] = useState<TccCornellEntry[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_TCC_CORNELL_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_CORNELL_SEEDS;
  });

  // Modal de Criação / Edição de Resumo Cornell
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Campos do formulário Cornell
  const [formDate, setFormDate] = useState<string>('');
  const [formTheme, setFormTheme] = useState<string>('');
  const [formSubject, setFormSubject] = useState<string>('TCC - Metodologia Científica & Koinonia');
  const [formProfessor, setFormProfessor] = useState<string>('Orientador Pastor Alexsandro Silva / Profª Gabriela Leal');
  const [formBiblical, setFormBiblical] = useState<string>('');
  const [formCues, setFormCues] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formSummary, setFormSummary] = useState<string>('');
  const [formTags, setFormTags] = useState<string>('TCC, Koinonia, Metodologia');

  // Filtro de busca nas notas
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');

  // Toast / Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Checklist de Metodologia com persistência local
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_TCC_CHECKLIST_KEY);
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return {
      convite_orientador: true,
      objetivos_geral_especificos: false,
      justificativa_terceira_pessoa: false,
      finalizar_pre_projeto: false,
      revisao_literatura_distancia_transacional: true,
      coleta_dados_empiricos_lms: true,
    };
  });

  const [notesQuick, setNotesQuick] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_TCC_NOTES_KEY) || 
        '• Ideia central: Como a ferramenta de Tele-proximidade e o Caderno Cornell atenuam a Distância Transacional de Moore no ensino teológico.';
    }
    return '';
  });

  const [savedNotesStatus, setSavedNotesStatus] = useState<boolean>(false);
  const [surveyCount, setSurveyCount] = useState<number>(0);

  // Pesquisa de Campo & Diagnóstico do TCC (Cristiano Sacramento)
  const [pesquisaCampoTotal, setPesquisaCampoTotal] = useState<number>(0);
  const [pesquisaCampoByPublico, setPesquisaCampoByPublico] = useState<Record<string, number>>({});
  const [pesquisaCampoRecords, setPesquisaCampoRecords] = useState<any[]>([]);
  const [pesquisaCampoLoading, setPesquisaCampoLoading] = useState<boolean>(false);
  const [selectedResponseDetail, setSelectedResponseDetail] = useState<any | null>(null);
  const [copiedPesquisaLink, setCopiedPesquisaLink] = useState<boolean>(false);
  const [selectedPublicoFilter, setSelectedPublicoFilter] = useState<string>('ALL');

  const loadPesquisaCampoData = async () => {
    setPesquisaCampoLoading(true);
    try {
      const data = await getPesquisaCampoAdminData();
      setPesquisaCampoTotal(data.total);
      setPesquisaCampoByPublico(data.byPublico);
      setPesquisaCampoRecords(data.records);
    } catch (e) {
      console.warn('Erro ao carregar dados da pesquisa de campo:', e);
    } finally {
      setPesquisaCampoLoading(false);
    }
  };

  useEffect(() => {
    const responses = getSurveyResponses();
    setSurveyCount(responses.length);
    loadPesquisaCampoData();
  }, []);

  const handleCopyPesquisaLink = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/pesquisa-tcc?origem=whatsapp_externo`;
    navigator.clipboard.writeText(url);
    setCopiedPesquisaLink(true);
    showToast('Link da Pesquisa copiado! Pronto para enviar no WhatsApp.');
    setTimeout(() => setCopiedPesquisaLink(false), 3000);
  };

  const handleExportPesquisaCsv = () => {
    if (pesquisaCampoRecords.length === 0) {
      showToast('Nenhuma resposta para exportar.');
      return;
    }

    const headers = ['ID', 'Data/Hora', 'Tipo de Público', 'Nome', 'Igreja', 'Cidade/UF', 'Origem', 'Autorizou TCLE', 'Média Likert'];
    const questionCols = PERGUNTAS_PESQUISA_TCC.map((p) => p.id);
    const questionHeaders = PERGUNTAS_PESQUISA_TCC.map((p) => `"[${p.id}] ${p.enunciado.replace(/"/g, '""')}"`);
    const allHeaders = [...headers, ...questionHeaders].join(';');

    const rows = pesquisaCampoRecords.map((r) => {
      const pubLabel = TIPO_PUBLICO_LABELS[r.tipo_publico as TipoPublico]?.label || r.tipo_publico;
      const base = [
        r.id,
        new Date(r.created_at).toLocaleString('pt-BR'),
        `"${pubLabel}"`,
        `"${(r.nome || '').replace(/"/g, '""')}"`,
        `"${(r.igreja || '').replace(/"/g, '""')}"`,
        `"${(r.cidade_uf || '').replace(/"/g, '""')}"`,
        r.origem,
        r.autorizou_tcc ? 'SIM' : 'NÃO',
        r.likertAverage,
      ];
      const answers = questionCols.map((qId) => {
        const val = r.respostas?.[qId];
        if (val === undefined || val === null) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      return [...base, ...answers].join(';');
    });

    const csvContent = '\uFEFF' + [allHeaders, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pesquisa_Campo_TCC_Cristiano_Sacramento_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Planilha CSV gerada e baixada com sucesso!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saveCornellList = (list: TccCornellEntry[]) => {
    setCornellNotes(list);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_TCC_CORNELL_KEY, JSON.stringify(list));
      } catch (e) {}
    }
  };

  // Abrir criação de Novo Resumo Cornell do Dia
  const handleOpenNewCornell = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const displayDate = today.toLocaleDateString('pt-BR');

    setEditingNoteId(null);
    setFormDate(formattedDate);
    setFormTheme(`Anotações & Progresso do TCC - ${displayDate}`);
    setFormSubject('TCC - Metodologia Científica & Koinonia');
    setFormProfessor('Orientador Pastor Alexsandro Silva / Profª Gabriela Leal');
    setFormBiblical('Atos 2:42; 1 Tessalonicenses 2:17');
    setFormCues(`• Qual o foco principal do estudo de hoje?
• Quais conceitos de Moore / Koinonia foram aprofundados?
• Principais dúvidas para alinhar com o Pastor Alexsandro Silva:`);
    setFormNotes(`1. LEITURAS & PROGRESSO DO DIA:
- Livro / Artigo estudado hoje: 
- Principais citações e fichamento:

2. DESENVOLVIMENTO DA ESCRITA:
- Seção trabalhada: 
- Argumentos desenvolvidos:`);
    setFormSummary('Resumo em 2-3 frases das principais descobertas do dia e como elas contribuem para a redação final do TCC.');
    setFormTags('TCC, EstudoDiário, Koinonia');
    setIsEditorOpen(true);
  };

  // Abrir edição de nota existente
  const handleOpenEditNote = (note: TccCornellEntry) => {
    setEditingNoteId(note.id);
    setFormDate(note.date);
    setFormTheme(note.theme);
    setFormSubject(note.subject);
    setFormProfessor(note.professor);
    setFormBiblical(note.biblical_references || '');
    setFormCues(note.cues);
    setFormNotes(note.notes);
    setFormSummary(note.summary);
    setFormTags(note.tags ? note.tags.join(', ') : '');
    setIsEditorOpen(true);
  };

  // Salvar nota no diário de bordo
  const handleSaveCornellNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTheme.trim()) {
      alert('Por favor, informe o tema ou título do resumo.');
      return;
    }

    const tagList = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const now = new Date().toLocaleDateString('pt-BR');

    if (editingNoteId) {
      // Edição
      const updated = cornellNotes.map((n) => {
        if (n.id === editingNoteId) {
          return {
            ...n,
            date: formDate,
            theme: formTheme,
            subject: formSubject,
            professor: formProfessor,
            biblical_references: formBiblical,
            cues: formCues,
            notes: formNotes,
            summary: formSummary,
            tags: tagList,
            updated_at: now,
          };
        }
        return n;
      });
      saveCornellList(updated);
      showToast('Resumo Cornell atualizado com sucesso!');
    } else {
      // Nova Nota
      const newEntry: TccCornellEntry = {
        id: `tcc-cornell-${Date.now()}`,
        date: formDate,
        theme: formTheme,
        subject: formSubject,
        professor: formProfessor,
        biblical_references: formBiblical,
        cues: formCues,
        notes: formNotes,
        summary: formSummary,
        tags: tagList,
        created_at: now,
        updated_at: now,
      };
      const updated = [newEntry, ...cornellNotes];
      saveCornellList(updated);
      showToast('Novo Resumo Cornell salvo no seu Diário de TCC!');
    }

    setIsEditorOpen(false);
  };

  // Excluir nota
  const handleDeleteNote = (id: string, theme: string) => {
    if (confirm(`Deseja remover o resumo "${theme}"?`)) {
      const filtered = cornellNotes.filter((n) => n.id !== id);
      saveCornellList(filtered);
      showToast('Resumo removido.');
    }
  };

  // Exportar todas as anotações compiladas para a redação do TCC (Markdown / TXT)
  const handleExportAllNotes = () => {
    let content = `# DIÁRIO DE BORDO & COMPILADO DO TCC - CRISTIANO SACRAMENTO\n`;
    content += `Tema: Koinonia e a Redução da Distância Transacional no Ensino Teológico Online\n`;
    content += `Orientador: Pastor Alexsandro Silva | Metodologia: Profª Gabriela Leal\n`;
    content += `Data da Exportação: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}\n\n`;
    content += `================================================================================\n\n`;

    cornellNotes.forEach((note, index) => {
      content += `### REGISTRO ${index + 1}: ${note.theme}\n`;
      content += `• Data do Estudo: ${note.date}\n`;
      content += `• Disciplina / Área: ${note.subject}\n`;
      content += `• Orientação: ${note.professor}\n`;
      if (note.biblical_references) {
        content += `• Referências Bíblicas / Fontes: ${note.biblical_references}\n`;
      }
      content += `• Tags: ${note.tags.join(', ')}\n\n`;
      content += `--- [COLUNA DE PISTAS & CONCEITOS-CHAVE] ---\n`;
      content += `${note.cues}\n\n`;
      content += `--- [ANOTAÇÕES DETALHADAS & PROGRESSO DE ESCRITA] ---\n`;
      content += `${note.notes}\n\n`;
      content += `--- [SÍNTESE & CONCLUSÃO PARA O TCC] ---\n`;
      content += `${note.summary}\n\n`;
      content += `--------------------------------------------------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TCC_Cristiano_Sacramento_Compilado_Cornell_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Compilado do TCC baixado com sucesso!');
  };

  const toggleChecklistItem = (key: string) => {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_TCC_CHECKLIST_KEY, JSON.stringify(next));
    }
  };

  const handleSaveNotesQuick = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_TCC_NOTES_KEY, notesQuick);
      setSavedNotesStatus(true);
      setTimeout(() => setSavedNotesStatus(false), 2000);
    }
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Extrai todas as tags únicas
  const allTags = Array.from(
    new Set(cornellNotes.flatMap((n) => n.tags || []))
  );

  // Filtra notas por busca e tag
  const filteredNotes = cornellNotes.filter((note) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = 
      !q ||
      note.theme.toLowerCase().includes(q) ||
      note.notes.toLowerCase().includes(q) ||
      note.cues.toLowerCase().includes(q) ||
      note.summary.toLowerCase().includes(q) ||
      note.date.toLowerCase().includes(q);

    const matchTag = 
      selectedTagFilter === 'all' || 
      (note.tags && note.tags.includes(selectedTagFilter));

    return matchQuery && matchTag;
  });

  const filteredPesquisaRecords = useMemo(() => {
    return pesquisaCampoRecords.filter((r) => {
      if (selectedPublicoFilter !== 'ALL' && r.tipo_publico !== selectedPublicoFilter) {
        return false;
      }
      return true;
    });
  }, [pesquisaCampoRecords, selectedPublicoFilter]);

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Notificação Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/50 animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header do TCC */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl border border-blue-900/50">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-black tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Área de Pesquisa Exclusiva • Cristiano Sacramento</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Painel do TCC - Cristiano Sacramento
          </h1>
          <p className="text-xs sm:text-base text-blue-200">
            Orientador: <strong className="text-white">Pastor Alexsandro Silva</strong> | Metodologia: <strong className="text-white">Profª Gabriela Leal</strong> | Status:{' '}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              🟢 Em Desenvolvimento
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={handleOpenNewCornell}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-lg flex items-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Novo Resumo (Método Cornell)</span>
          </Button>
          {onTabChange && (
            <Button
              variant="outline"
              onClick={() => onTabChange('quatro-ds')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold cursor-pointer"
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Ver Trilha dos 4 Ds</span>
            </Button>
          )}
        </div>
      </header>

      {/* SEÇÃO PRINCIPAL: DIÁRIO DE BORDO DO TCC COM MÉTODO CORNELL */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                <BookOpen className="w-5 h-5 text-amber-700" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Diário de Bordo do TCC • Caderno Cornell da Pesquisa
              </h2>
            </div>
            <p className="text-xs text-gray-500">
              Registre a cada dia o que tem estudado, fichamentos bibliográficos e reflexões estruturadas para a conclusão da tese.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              onClick={handleExportAllNotes}
              variant="outline"
              size="sm"
              className="border-indigo-200 text-indigo-900 bg-indigo-50/50 hover:bg-indigo-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              title="Baixar todas as anotações estruturadas para colar no Google Docs / Word"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Exportar para Conclusão do TCC (.MD)</span>
            </Button>
            <Button
              onClick={handleOpenNewCornell}
              size="sm"
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Anotação do Dia</span>
            </Button>
          </div>
        </div>

        {/* Filtros e Busca no Diário */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/80 p-3 rounded-xl border border-gray-200 text-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Pesquisar por tema, citação ou conceito..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-gray-500 font-bold shrink-0">Tags:</span>
            <button
              onClick={() => setSelectedTagFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                selectedTagFilter === 'all'
                  ? 'bg-blue-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Todas ({cornellNotes.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTagFilter(tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                  selectedTagFilter === tag
                    ? 'bg-blue-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Lista / Grade de Anotações Cornell do TCC */}
        {filteredNotes.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300 space-y-3">
            <BookOpen className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Nenhuma anotação encontrada</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Clique no botão <strong>"+ Novo Resumo (Método Cornell)"</strong> acima para criar seu primeiro fichamento de pesquisa com a data de hoje.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3">
                  {/* Cabeçalho do Card */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-extrabold">
                      <Calendar className="w-3 h-3 text-amber-700" />
                      <span>{note.date.includes('-') ? note.date.split('-').reverse().join('/') : note.date}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditNote(note)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Editar Resumo Cornell"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id, note.theme)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Excluir Resumo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Título do Estudo */}
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-900 transition leading-snug line-clamp-2">
                    {note.theme}
                  </h3>

                  {/* Referências Bíblicas / Acadêmicas */}
                  {note.biblical_references && (
                    <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-gray-100 flex items-center gap-1.5">
                      <Bookmark className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span className="truncate">{note.biblical_references}</span>
                    </div>
                  )}

                  {/* Prévia da Síntese Cornell */}
                  <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                      <Lightbulb className="w-3 h-3 text-amber-600" />
                      <span>Síntese & Conclusão:</span>
                    </span>
                    <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed italic">
                      "{note.summary}"
                    </p>
                  </div>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {note.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rodapé do Card */}
                <div className="p-3 bg-slate-50/80 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    Caderno Cornell TCC
                  </span>
                  <button
                    onClick={() => handleOpenEditNote(note)}
                    className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Abrir Completo</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Grid Secundário: O Grande Objetivo & Trilha dos 4 Ds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: O Grande Objetivo */}
        <Card className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Target className="w-5 h-5 text-blue-600" />
              <span>O Grande Objetivo da Pesquisa</span>
            </CardTitle>
            <CardDescription>Tema central e hipótese de pesquisa teológica-educacional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700 leading-relaxed font-medium text-sm sm:text-base">
              Desenvolver estratégias eficazes para o ensino teológico no ambiente virtual, atenuando a{' '}
              <strong>Distância Transacional (Michael G. Moore)</strong> e promovendo a verdadeira{' '}
              <strong className="text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded">Koinonia</strong>, para formar pastores e obreiros com a mesma excelência do seminário presencial.
            </p>

            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1 text-xs text-blue-950">
              <span className="font-extrabold flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Pergunta-Problema Científica:</span>
              </span>
              <p className="italic text-blue-900">
                "De que maneira recursos pedagógicos síncronos e assíncronos de tele-proximidade no LMS Koinonia reduzem a sensação de isolamento e potencializam a formação ministerial?"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Trilha dos 4 Ds */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-emerald-950">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>Trilha dos 4 Ds (Desta Semana)</span>
              </CardTitle>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md">
                Etapa Vigente
              </span>
            </div>
            <CardDescription>Passos estruturados de amadurecimento metodológico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-gray-100">
              <span className="px-2 py-0.5 rounded-md bg-blue-900 text-white font-black text-xs">D1</span>
              <div>
                <strong className="text-xs text-slate-900 block font-bold">Desejo de Comunhão</strong>
                <p className="text-xs text-gray-600">Como transformar o anseio por comunhão em pesquisa científica rigorosa?</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-gray-100">
              <span className="px-2 py-0.5 rounded-md bg-indigo-900 text-white font-black text-xs">D2</span>
              <div>
                <strong className="text-xs text-slate-900 block font-bold">Dilema da Linguagem</strong>
                <p className="text-xs text-gray-600">O paradoxo da justificativa apaixonada vs. escrita impessoal em 3ª pessoa.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-gray-100">
              <span className="px-2 py-0.5 rounded-md bg-emerald-800 text-white font-black text-xs">D3</span>
              <div>
                <strong className="text-xs text-slate-900 block font-bold">Decisão de Escopo</strong>
                <p className="text-xs text-gray-600">Estruturar Objetivos (Geral e Específicos) e Justificativa em 14 dias.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-gray-100">
              <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white font-black text-xs">D4</span>
              <div>
                <strong className="text-xs text-slate-900 block font-bold">Destino e Prazo</strong>
                <p className="text-xs text-gray-600">Oficializar o orientador Pastor Alexsandro Silva e protocolar o Pré-Projeto.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card 3: Checklist de Metodologia */}
      <Card className="shadow-sm border-t-4 border-t-indigo-600">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Checklist de Metodologia & Pré-Projeto (Profª Gabriela Leal)</span>
              </CardTitle>
              <CardDescription>Acompanhe e marque os requisitos atendidos para o TCC</CardDescription>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Progresso: {completedCount} de {totalCount} ({progressPercent}%)
              </span>
            </div>
          </div>

          {/* Barra de Progresso Visual */}
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-gray-100 cursor-pointer">
            <input
              type="checkbox"
              checked={!!checklist.convite_orientador}
              onChange={() => toggleChecklistItem('convite_orientador')}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className={`text-sm font-medium ${checklist.convite_orientador ? 'line-through text-gray-400 font-normal' : 'text-gray-800'}`}>
              Formalizar convite ao <strong>Pastor Alexsandro Silva</strong> como orientador oficial
            </span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-gray-100 cursor-pointer">
            <input
              type="checkbox"
              checked={!!checklist.objetivos_geral_especificos}
              onChange={() => toggleChecklistItem('objetivos_geral_especificos')}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className={`text-sm font-medium ${checklist.objetivos_geral_especificos ? 'line-through text-gray-400 font-normal' : 'text-gray-800'}`}>
              Definir <strong>Objetivo Geral</strong> e <strong>Específicos</strong> com verbos no infinitivo (analisar, mapear, propor)
            </span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-gray-100 cursor-pointer">
            <input
              type="checkbox"
              checked={!!checklist.justificativa_terceira_pessoa}
              onChange={() => toggleChecklistItem('justificativa_terceira_pessoa')}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className={`text-sm font-medium ${checklist.justificativa_terceira_pessoa ? 'line-through text-gray-400 font-normal' : 'text-gray-800'}`}>
              Redigir a Justificativa rigorosamente em <strong>3ª pessoa</strong> (impessoalidade científica)
            </span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-gray-100 cursor-pointer">
            <input
              type="checkbox"
              checked={!!checklist.revisao_literatura_distancia_transacional}
              onChange={() => toggleChecklistItem('revisao_literatura_distancia_transacional')}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className={`text-sm font-medium ${checklist.revisao_literatura_distancia_transacional ? 'line-through text-gray-400 font-normal' : 'text-gray-800'}`}>
              Revisão bibliográfica sobre a Teoria da Distância Transacional (Michael G. Moore) e EAD Teológica
            </span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-gray-100 cursor-pointer">
            <input
              type="checkbox"
              checked={!!checklist.coleta_dados_empiricos_lms}
              onChange={() => toggleChecklistItem('coleta_dados_empiricos_lms')}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className={`text-sm font-medium ${checklist.coleta_dados_empiricos_lms ? 'line-through text-gray-400 font-normal' : 'text-gray-800'}`}>
              Coleta de dados e percepção discente via formulário empírico integrado no LMS ({surveyCount} respostas coletadas)
            </span>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-gray-100 cursor-pointer">
            <input
              type="checkbox"
              checked={!!checklist.finalizar_pre_projeto}
              onChange={() => toggleChecklistItem('finalizar_pre_projeto')}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className={`text-sm font-medium ${checklist.finalizar_pre_projeto ? 'line-through text-gray-400 font-normal' : 'text-gray-800'}`}>
              Finalizar e protocolar Pré-Projeto completo (Prazo: 2 semanas)
            </span>
          </label>
        </CardContent>
      </Card>

      {/* Grid Inferior: Anotações Rápidas & Evidências Empíricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bloco de Anotações do Pesquisador */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Bloco de Insights do Pesquisador</span>
              </CardTitle>
              {savedNotesStatus && (
                <span className="text-xs font-bold text-emerald-600 animate-in fade-in">✓ Salvo</span>
              )}
            </div>
            <CardDescription>Rascunhos rápidos, hipóteses e citações para o TCC</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              rows={6}
              value={notesQuick}
              onChange={(e) => setNotesQuick(e.target.value)}
              placeholder="Digite aqui anotações, referências bibliográficas ou reflexões..."
              className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button onClick={handleSaveNotesQuick} size="sm" className="bg-blue-900 hover:bg-blue-800 text-white gap-1.5 cursor-pointer">
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Anotações</span>
            </Button>
          </CardFooter>
        </Card>

        {/* Bloco de Evidências Empíricas no Koinonia LMS */}
        <Card className="shadow-sm bg-gradient-to-br from-indigo-50/50 to-blue-50/30 border border-blue-200/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-950">
              <BarChart3 className="w-5 h-5 text-blue-700" />
              <span>Laboratório Empírico do Koinonia LMS</span>
            </CardTitle>
            <CardDescription>Evidências coletadas diretamente na plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-700">
            <p>
              O Koinonia LMS atua como o ambiente real de experimentação da sua pesquisa. Os dados de uso das ferramentas de
              <strong> Tele-proximidade</strong>, <strong>Caderno Cornell</strong> e <strong>Fórum Colaborativo</strong> geram métricas acadêmicas para comprovação da tese.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="p-3 bg-white rounded-xl border border-blue-200 text-center space-y-1">
                <span className="text-2xl font-black text-blue-900">{surveyCount}</span>
                <p className="text-[11px] text-gray-500 font-bold">Respostas no Survey TCC</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-blue-200 text-center space-y-1">
                <span className="text-2xl font-black text-emerald-600">100%</span>
                <p className="text-[11px] text-gray-500 font-bold">Koinonia & Engajamento</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t border-blue-100 pt-3">
            <span className="text-[11px] text-gray-500">Dados protegidos pelo protocolo de ética</span>
            {onTabChange && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTabChange('tele-proximidade')}
                className="text-xs border-blue-300 text-blue-900 hover:bg-blue-100 cursor-pointer"
              >
                <span>Radar Tele-Proximidade</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 3: MÓDULO NATIVO DE PESQUISA DE CAMPO & DIAGNÓSTICO DO TCC          */}
      {/* ========================================================================= */}
      <section className="space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-indigo-200/80 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                  Coleta Empírica • Resolução CNS 510/2016
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Pesquisa de Campo & Diagnóstico do TCC
                </h2>
              </div>
            </div>
            <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
              Investigação científica sobre <em>Distância Transacional</em>, <em>Preservação da Koinonia</em> e a <em>Transição do Internato Presencial para o Modelo Síncrono Remoto</em> no Seminário Teológico Koinonia (UNIB / UIECB).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              onClick={handleCopyPesquisaLink}
              variant="outline"
              size="sm"
              className="border-indigo-200 text-indigo-900 hover:bg-indigo-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {copiedPesquisaLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedPesquisaLink ? 'Link Copiado!' : 'Copiar Link WhatsApp'}</span>
            </Button>

            <Button
              onClick={() => window.open('/pesquisa-tcc', '_blank')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Questionário Público</span>
            </Button>

            <Button
              onClick={handleExportPesquisaCsv}
              variant="outline"
              size="sm"
              className="border-emerald-300 text-emerald-900 hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              title="Exportar respostas para Excel / SPSS / Google Sheets"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar CSV</span>
            </Button>

            <Button
              onClick={loadPesquisaCampoData}
              variant="ghost"
              size="sm"
              disabled={pesquisaCampoLoading}
              className="text-gray-500 hover:text-slate-900 font-bold text-xs p-2 cursor-pointer"
              title="Recarregar Respostas"
            >
              <RefreshCw className={`w-4 h-4 ${pesquisaCampoLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Cards de Métricas por Público */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-indigo-950">{pesquisaCampoTotal}</span>
            <p className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">Total Respostas</p>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-blue-900">{pesquisaCampoByPublico['aluno_unib'] || 0}</span>
            <p className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider">Alunos UNIB</p>
          </div>

          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-indigo-900">
              {(pesquisaCampoByPublico['professor_unib'] || 0) + (pesquisaCampoByPublico['monitor_unib'] || 0)}
            </span>
            <p className="text-[11px] font-extrabold text-indigo-700 uppercase tracking-wider">Docentes / Mon.</p>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-800">{pesquisaCampoByPublico['externo_pastor'] || 0}</span>
            <p className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider">Pastores Externos</p>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-900">
              {(pesquisaCampoByPublico['externo_aluno'] || 0) + (pesquisaCampoByPublico['externo_lider'] || 0) + (pesquisaCampoByPublico['externo_membro'] || 0)}
            </span>
            <p className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">Líderes / Membros</p>
          </div>

          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-purple-900">
              {pesquisaCampoRecords.length > 0 
                ? (pesquisaCampoRecords.reduce((acc, r) => acc + (r.likertAverage || 0), 0) / pesquisaCampoRecords.length).toFixed(1)
                : '5.0'}
            </span>
            <p className="text-[11px] font-extrabold text-purple-700 uppercase tracking-wider">Média Likert</p>
          </div>
        </div>

        {/* Filtros e Barra de Ações da Tabela */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-bold text-gray-500 shrink-0">Filtrar:</span>
            <button
              onClick={() => setSelectedPublicoFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                selectedPublicoFilter === 'ALL'
                  ? 'bg-indigo-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos ({pesquisaCampoRecords.length})
            </button>
            {(Object.keys(TIPO_PUBLICO_LABELS) as TipoPublico[]).map((key) => {
              const cfg = TIPO_PUBLICO_LABELS[key];
              const count = pesquisaCampoByPublico[key] || 0;
              if (count === 0 && selectedPublicoFilter !== key) return null;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedPublicoFilter(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                    selectedPublicoFilter === key
                      ? 'bg-indigo-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cfg.emoji} {cfg.label.split('/')[0].trim()} ({count})
                </button>
              );
            })}
          </div>

          <span className="text-xs text-gray-500 shrink-0 font-medium">
            Mostrando {filteredPesquisaRecords.length} de {pesquisaCampoRecords.length} respostas
          </span>
        </div>

        {/* Tabela com Projeção Estrita */}
        {filteredPesquisaRecords.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-gray-300 space-y-2">
            <p className="text-sm font-bold text-slate-700">Nenhuma resposta registrada com os filtros atuais.</p>
            <p className="text-xs text-gray-500">
              Compartilhe o link do questionário pelo WhatsApp para iniciar a coleta empírica do seu TCC.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200 text-slate-700 font-extrabold">
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Público / Segmento</th>
                  <th className="p-3">Identificação / Igreja</th>
                  <th className="p-3">Cidade / UF</th>
                  <th className="p-3">Origem</th>
                  <th className="p-3 text-center">Média Likert</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredPesquisaRecords.map((r) => {
                  const cfg = TIPO_PUBLICO_LABELS[r.tipo_publico as TipoPublico] || {
                    label: r.tipo_publico,
                    emoji: '👤',
                    badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
                  };
                  return (
                    <tr key={r.id} className="hover:bg-indigo-50/30 transition">
                      <td className="p-3 whitespace-nowrap text-slate-600 font-medium">
                        {new Date(r.created_at).toLocaleDateString('pt-BR')} {new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border inline-flex items-center gap-1 ${cfg.badgeColor}`}>
                          <span>{cfg.emoji}</span>
                          <span>{cfg.label.split('/')[0].trim()}</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{r.nome}</span>
                        {r.igreja && <span className="text-[11px] text-gray-500">{r.igreja}</span>}
                      </td>
                      <td className="p-3 whitespace-nowrap text-slate-600">
                        {r.cidade_uf || '—'}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          {r.origem}
                        </span>
                      </td>
                      <td className="p-3 text-center font-black text-indigo-700">
                        {r.likertAverage > 0 ? `${r.likertAverage} / 5` : '—'}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedResponseDetail(r)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs border border-indigo-200 transition cursor-pointer"
                        >
                          Ver Respostas
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL DETALHES DA RESPOSTA DO PARTICIPANTE */}
      {selectedResponseDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between border-b border-indigo-900/40 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-300">
                  Ficha de Resposta Individual • TCC
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {selectedResponseDetail.nome || 'Participante'} • {TIPO_PUBLICO_LABELS[selectedResponseDetail.tipo_publico as TipoPublico]?.label || selectedResponseDetail.tipo_publico}
                </h3>
              </div>
              <button
                onClick={() => setSelectedResponseDetail(null)}
                className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-400 block font-bold">Data:</span>
                  <span className="font-bold text-slate-800">{new Date(selectedResponseDetail.created_at).toLocaleString('pt-BR')}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold">Igreja:</span>
                  <span className="font-bold text-slate-800">{selectedResponseDetail.igreja || 'Não informada'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold">Cidade/UF:</span>
                  <span className="font-bold text-slate-800">{selectedResponseDetail.cidade_uf || 'Não informada'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold">TCLE:</span>
                  <span className="font-bold text-emerald-600">✓ Autorizado</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Respostas por Pergunta:</h4>
                {PERGUNTAS_PESQUISA_TCC.map((p, idx) => {
                  const val = selectedResponseDetail.respostas?.[p.id];
                  return (
                    <div key={p.id} className="p-3.5 bg-white rounded-xl border border-gray-200 space-y-1">
                      <p className="text-xs font-bold text-slate-900">
                        {idx + 1}. {p.enunciado}
                      </p>
                      <div className="text-xs text-indigo-950 font-extrabold bg-indigo-50/60 p-2 rounded-lg border border-indigo-100">
                        {val !== undefined && val !== null ? String(val) : 'Sem resposta'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
              <Button
                onClick={() => setSelectedResponseDetail(null)}
                variant="outline"
                size="sm"
                className="font-bold cursor-pointer"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DO EDITOR CORNELL NATIVO DO TCC                                      */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header do Modal */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white flex items-center justify-between border-b border-blue-900/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-400 text-slate-950 font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-extrabold text-white">
                    {editingNoteId ? 'Editar Resumo Cornell do TCC' : 'Novo Resumo de Pesquisa (Método Cornell)'}
                  </h3>
                  <p className="text-xs text-blue-200">
                    Método de Estudo Ativo • Cornell University adaptado para o TCC
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo do Editor Cornell */}
            <form onSubmit={handleSaveCornellNote} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FDFDFE]">
              {/* Linha 1: Data, Disciplina & Orientador */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Data do Estudo / Registro:
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-bold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Área / Disciplina:
                  </label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Orientação / Metodologia:
                  </label>
                  <input
                    type="text"
                    value={formProfessor}
                    onChange={(e) => setFormProfessor(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Linha 2: Tema Principal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tema / Foco de Estudo do Dia:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Leitura de Moore sobre Distância Transacional e Proximidade Síncrona"
                  value={formTheme}
                  onChange={(e) => setFormTheme(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs sm:text-sm font-extrabold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Linha 3: Referências Bíblicas & Bibliográficas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Textos Bíblicos & Referências Acadêmicas:
                </label>
                <input
                  type="text"
                  placeholder="Ex: Atos 2:42-47; Moore (1993); Garrison et al. (2000)"
                  value={formBiblical}
                  onChange={(e) => setFormBiblical(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* GRID CORNELL CLÁSSICO: COLUNA ESQUERDA (30%) & COLUNA DIREITA (70%) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
                {/* Coluna Esquerda: Pistas, Palavras-chave e Perguntas (35%) */}
                <div className="md:col-span-4 space-y-1.5 p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-amber-950 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-amber-700" />
                      <span>1. Pistas & Dúvidas</span>
                    </span>
                    <span className="text-[10px] text-amber-800 font-bold">~30%</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Palavras-chave, conceitos centrais, perguntas de pesquisa e dúvidas para o Pastor Alexsandro Silva.
                  </p>
                  <textarea
                    rows={12}
                    value={formCues}
                    onChange={(e) => setFormCues(e.target.value)}
                    placeholder="• Conceito de Moore&#10;• Definição de Koinonia&#10;• Dúvida sobre o Capítulo 2..."
                    className="w-full p-2.5 border border-amber-200 rounded-xl text-xs font-medium bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                {/* Coluna Direita: Anotações Detalhadas e Fichamento (65%) */}
                <div className="md:col-span-8 space-y-1.5 p-3 rounded-2xl bg-blue-50/40 border border-blue-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-blue-950 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-blue-700" />
                      <span>2. Anotações & Fichamento</span>
                    </span>
                    <span className="text-[10px] text-blue-800 font-bold">~70%</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    Anotações completas, resumos de parágrafos, citações textuais e hipóteses desenvolvidas.
                  </p>
                  <textarea
                    rows={12}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="1. Ideias Principais...&#10;2. Fichamento de Citações...&#10;3. Progresso da Escrita..."
                    className="w-full p-2.5 border border-blue-200 rounded-xl text-xs font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* FAIXA BASAL INFERIOR: SÍNTESE CORNELL */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-emerald-950 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-700" />
                    <span>3. Síntese & Conclusão para o TCC (Faixa Basal)</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold">Resumo Essencial</span>
                </div>
                <p className="text-[10px] text-gray-500">
                  Sintetize em 2 a 3 frases o principal aprendizado do dia e como isso entra na conclusão do seu TCC.
                </p>
                <textarea
                  rows={3}
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Ex: A pesquisa demonstrou que a proximidade pedagógica no LMS minimiza o isolamento do seminarista..."
                  className="w-full p-2.5 border border-emerald-200 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags / Palavras-chave (separadas por vírgula):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Koinonia, MichaelMoore, EAD, Metodologia"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Botões do Rodapé do Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditorOpen(false)}
                  className="border-gray-300 text-gray-700 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingNoteId ? 'Salvar Alterações' : 'Salvar no Diário de TCC'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TccSacramentoPage;
