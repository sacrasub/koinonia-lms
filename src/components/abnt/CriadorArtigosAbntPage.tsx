'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Cloud,
  CloudOff,
  Lock,
  Unlock,
  Download,
  Upload,
  Printer,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ArrowLeft,
  Maximize2,
  BookOpen,
  Users,
  Layers,
  Image as ImageIcon,
  Table as TableIcon,
  Quote,
  Type,
  Heading2,
  ChevronUp,
  ChevronDown,
  Loader2,
  RefreshCw,
  FolderPlus,
  X,
  Check,
} from 'lucide-react';
import {
  AbntArticleDocument,
  AbntAttachment,
  AbntContentBlock,
  AbntReference,
  AbntReferenceType,
  AbntSection,
  AbntTemplateType,
} from '@/types/abntArticle';
import {
  ABNT_TEMPLATE_CARDS,
  INSTITUTION_PRESETS,
  SEMINARIO_LOGO_PATH,
  UNIMB_LOGO_PATH,
  createArticleFromTemplate,
} from '@/data/abntTemplates';
import {
  auditAbntArticle,
  buildProfessorMailto,
  compressImageForAbnt,
  countWords,
  formatAbntReference,
  slugifyFileName,
  sortReferencesAlphabetically,
} from '@/lib/abntFormatter';
import {
  deleteAbntArticleEverywhere,
  exportAbntArticleBackupJson,
  getLocalAbntArticles,
  normalizeAbntUserEmail,
  parseImportedAbntArticleJson,
  saveAbntArticleToCloud,
  syncAbntArticlesFromCloud,
  upsertLocalAbntArticle,
} from '@/services/abntArticleService';
import { downloadAbntDocx } from '@/lib/abntDocxExporter';
import { printAbntArticleAsPdf } from '@/lib/abntPrintExporter';
import { getAllDisciplinas } from '@/services/disciplinasService';
import { AbntPreviewDocument } from './AbntPreviewDocument';
import { AbntAiAssistModal } from './AbntAiAssistModal';

interface CriadorArtigosAbntPageProps {
  userEmail?: string;
  userName?: string;
  onTabChange?: (tab: string) => void;
  isStandalonePage?: boolean;
}

type StepTab = 'dados' | 'pretextuais' | 'redacao' | 'referencias' | 'anexos' | 'exportar';

const STEP_TABS: { id: StepTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'dados', label: '1. Dados & Capa', Icon: Users },
  { id: 'pretextuais', label: '2. Pré-Textuais', Icon: FileText },
  { id: 'redacao', label: '3. Redação', Icon: Type },
  { id: 'referencias', label: '4. Referências', Icon: BookOpen },
  { id: 'anexos', label: '5. Apêndices & Anexos', Icon: Layers },
  { id: 'exportar', label: '6. Exportar ABNT', Icon: Download },
];

const REFERENCE_TABS: { id: AbntReferenceType; label: string }[] = [
  { id: 'livro', label: 'Livro' },
  { id: 'capitulo', label: 'Capítulo' },
  { id: 'artigo', label: 'Artigo' },
  { id: 'biblia', label: 'Bíblia' },
  { id: 'site', label: 'Site / Aula' },
  { id: 'livre', label: 'Texto Livre' },
];

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const CriadorArtigosAbntPage: React.FC<CriadorArtigosAbntPageProps> = ({
  userEmail,
  userName,
  onTabChange,
  isStandalonePage = false,
}) => {
  const router = useRouter();
  const normEmail = normalizeAbntUserEmail(userEmail);
  const disciplinas = useMemo(() => getAllDisciplinas(), []);

  const [articles, setArticles] = useState<AbntArticleDocument[]>([]);
  const [activeDoc, setActiveDoc] = useState<AbntArticleDocument | null>(null);
  const [activeStep, setActiveStep] = useState<StepTab>('dados');

  // Estados de interface e sincronização
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedTemplateForNew, setSelectedTemplateForNew] = useState<AbntTemplateType>('artigo_tcc');
  const [selectedDiscForNew, setSelectedDiscForNew] = useState<string>('');
  const [showProjectsDrawer, setShowProjectsDrawer] = useState(false);

  const [syncState, setSyncState] = useState<'local' | 'saving' | 'synced' | 'error'>('local');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Assistente IA
  const [aiModalSectionId, setAiModalSectionId] = useState<string | null>(null);
  const [aiAbstractLoading, setAiAbstractLoading] = useState(false);
  const [aiRefInput, setAiRefInput] = useState('');
  const [aiRefLoading, setAiRefLoading] = useState(false);

  // Construtor guiado de Referências NBR 6023
  const [refDraft, setRefDraft] = useState<Omit<AbntReference, 'id' | 'formattedText'> & { freeText: string }>({
    type: 'livro',
    authors: '',
    title: '',
    subtitle: '',
    containerTitle: '',
    edition: '',
    city: '',
    publisher: '',
    year: '2026',
    pages: '',
    url: '',
    accessDate: '',
    freeText: '',
  });

  const fileImportRef = useRef<HTMLInputElement | null>(null);
  const cloudDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashBanner = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Inicialização Local-First + Pull delta sob demanda da nuvem (0 polling)
  useEffect(() => {
    const localList = getLocalAbntArticles(normEmail);
    if (localList.length > 0) {
      setArticles(localList);
      setActiveDoc(localList[0]);
      setSyncState(localList[0].lastCloudSyncAt ? 'synced' : 'local');
    } else {
      const initial = createArticleFromTemplate('artigo_tcc', {
        userEmail: normEmail,
        userName: userName || normEmail,
        disciplina: disciplinas.find((d) => d.id === 'disc-8') || disciplinas[0],
      });
      const seeded = upsertLocalAbntArticle(normEmail, initial);
      setArticles(seeded);
      setActiveDoc(initial);
    }

    if (normEmail && normEmail !== 'aluno_padrao') {
      syncAbntArticlesFromCloud(normEmail).then(({ articles: syncedList, source, updatedCount }) => {
        if (syncedList.length > 0) {
          setArticles(syncedList);
          if (updatedCount > 0) {
            setActiveDoc((prev) => {
              if (!prev) return syncedList[0];
              return syncedList.find((item) => item.id === prev.id) || syncedList[0];
            });
            flashBanner(`Nuvem sincronizada: ${updatedCount} artigo(s) atualizado(s).`);
          }
          if (source !== 'local') setSyncState('synced');
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normEmail]);

  const updateActiveDoc = (
    updater: (prev: AbntArticleDocument) => AbntArticleDocument,
    skipLockGuard = false
  ) => {
    setActiveDoc((prev) => {
      if (!prev) return prev;
      if (prev.isLocked && !skipLockGuard) return prev;
      const updated: AbntArticleDocument = {
        ...updater(prev),
        updatedAt: new Date().toISOString(),
      };
      const nextList = upsertLocalAbntArticle(normEmail, updated);
      setArticles(nextList);
      setSyncState('local');

      if (cloudDebounceRef.current) clearTimeout(cloudDebounceRef.current);
      if (normEmail && normEmail !== 'aluno_padrao') {
        cloudDebounceRef.current = setTimeout(() => {
          setSyncState('saving');
          saveAbntArticleToCloud(normEmail, updated).then(({ ok }) => {
            setSyncState(ok ? 'synced' : 'error');
          });
        }, 5000);
      }

      return updated;
    });
  };

  useEffect(() => {
    return () => {
      if (cloudDebounceRef.current) clearTimeout(cloudDebounceRef.current);
    };
  }, []);

  const audit = useMemo(() => (activeDoc ? auditAbntArticle(activeDoc) : null), [activeDoc]);

  const handleManualSaveCloud = async () => {
    if (!activeDoc) return;
    if (cloudDebounceRef.current) clearTimeout(cloudDebounceRef.current);
    setSyncState('saving');
    const res = await saveAbntArticleToCloud(normEmail, activeDoc);
    setSyncState(res.ok ? 'synced' : 'error');
    if (res.ok) {
      flashBanner('Artigo salvo na nuvem! Agora você pode continuar em outro PC ou celular.');
    } else {
      flashBanner(`Salvo localmente (${res.error || 'sem conexão com a nuvem'}).`);
    }
  };

  const handleManualPullCloud = async () => {
    setSyncState('saving');
    const { articles: syncedList, source, updatedCount } = await syncAbntArticlesFromCloud(normEmail);
    setArticles(syncedList);
    if (activeDoc) {
      const updatedMatch = syncedList.find((a) => a.id === activeDoc.id);
      if (updatedMatch) setActiveDoc(updatedMatch);
    } else if (syncedList[0]) {
      setActiveDoc(syncedList[0]);
    }
    setSyncState(source === 'local' ? 'local' : 'synced');
    flashBanner(
      updatedCount > 0
        ? `${updatedCount} artigo(s) atualizado(s) a partir da nuvem.`
        : 'Tudo já está atualizado entre seus dispositivos.'
    );
  };

  const handleCreateNewArticle = () => {
    const disc = disciplinas.find((d) => d.id === selectedDiscForNew) || null;
    const created = createArticleFromTemplate(selectedTemplateForNew, {
      userEmail: normEmail,
      userName: userName || normEmail,
      disciplina: disc,
    });
    const nextList = upsertLocalAbntArticle(normEmail, created);
    setArticles(nextList);
    setActiveDoc(created);
    setActiveStep('dados');
    setShowNewModal(false);
    saveAbntArticleToCloud(normEmail, created).then(({ ok }) => setSyncState(ok ? 'synced' : 'local'));
    flashBanner('Novo artigo criado com sucesso!');
  };

  const handleDeleteArticle = async (id: string) => {
    if (articles.length <= 1) {
      flashBanner('Mantenha pelo menos 1 artigo ativo ou crie um novo antes de excluir.');
      return;
    }
    const remaining = await deleteAbntArticleEverywhere(normEmail, id);
    setArticles(remaining);
    if (activeDoc?.id === id) {
      setActiveDoc(remaining[0] || null);
    }
    flashBanner('Artigo removido.');
  };

  const handleToggleLock = async () => {
    if (!activeDoc) return;
    const nextLocked = !activeDoc.isLocked;
    const lockedDoc: AbntArticleDocument = {
      ...activeDoc,
      isLocked: nextLocked,
      lockedAt: nextLocked ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };
    setActiveDoc(lockedDoc);
    setArticles(upsertLocalAbntArticle(normEmail, lockedDoc));
    const res = await saveAbntArticleToCloud(normEmail, lockedDoc);
    setSyncState(res.ok ? 'synced' : 'local');
    flashBanner(
      nextLocked
        ? 'Artigo trancado em modo somente leitura para proteger sua entrega.'
        : 'Artigo destrancado para edição.'
    );
  };

  const handleApplyPreset = (presetId: 'unimb' | 'koinonia') => {
    const preset = INSTITUTION_PRESETS[presetId];
    updateActiveDoc((d) => ({
      ...d,
      institutionName: preset.institutionName,
      courseName: preset.courseName,
      unitName: preset.unitName,
      city: preset.city,
      formatting: {
        ...d.formatting,
        institutionPreset: presetId,
      },
    }));
  };

  const handleDisciplinaSelect = (discId: string) => {
    const disc = disciplinas.find((d) => d.id === discId);
    if (!disc) {
      updateActiveDoc((d) => ({ ...d, disciplinaId: undefined }));
      return;
    }
    updateActiveDoc((d) => ({
      ...d,
      disciplinaId: disc.id,
      disciplinaName: disc.name,
      professorName: disc.professor_name || d.professorName,
      professorEmail: disc.professor_email || d.professorEmail,
      academicNatureNote: `Trabalho acadêmico apresentado ao ${d.courseName} do ${d.institutionName}, na disciplina ${disc.name}, sob orientação de ${disc.professor_name || 'Docente'}.`,
    }));
  };

  const handleExportJson = () => {
    if (!activeDoc) return;
    const json = exportAbntArticleBackupJson(activeDoc);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_abnt_${slugifyFileName(activeDoc.title)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseImportedAbntArticleJson(text, normEmail);
      const next = upsertLocalAbntArticle(normEmail, imported);
      setArticles(next);
      setActiveDoc(imported);
      saveAbntArticleToCloud(normEmail, imported).then(({ ok }) => setSyncState(ok ? 'synced' : 'local'));
      flashBanner('Backup JSON restaurado com sucesso!');
    } catch (err: any) {
      flashBanner(err?.message || 'Erro ao importar arquivo JSON.');
    }
  };

  const handleDownloadDocx = async () => {
    if (!activeDoc) return;
    setExportingDocx(true);
    try {
      await downloadAbntDocx(activeDoc);
      flashBanner('Arquivo Word (.docx) ABNT gerado com sucesso!');
    } catch (err: any) {
      flashBanner(err?.message || 'Erro ao gerar arquivo .docx.');
    } finally {
      setExportingDocx(false);
    }
  };

  const handlePrintPdf = async () => {
    if (!activeDoc) return;
    setExportingPdf(true);
    try {
      await printAbntArticleAsPdf(activeDoc);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleGenerateAbstractAi = async () => {
    if (!activeDoc || activeDoc.isLocked) return;
    setAiAbstractLoading(true);
    try {
      const summaryText = activeDoc.sections
        .map((s) => {
          const content = s.blocks
            .map((b) => (b.type === 'paragraph' || b.type === 'long_quote' ? b.text : ''))
            .join(' ');
          return `${s.numberLabel} ${s.title}: ${content.slice(0, 600)}`;
        })
        .join('\n');

      const res = await fetch('/api/ai/abnt-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_abstract',
          title: activeDoc.title,
          subtitle: activeDoc.subtitle,
          disciplinaName: activeDoc.disciplinaName,
          sectionsSummary: summaryText,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Falha ao gerar resumo.');
      updateActiveDoc((d) => ({
        ...d,
        resumo: json.data?.resumo || d.resumo,
        palavrasChave: json.data?.palavrasChave || d.palavrasChave,
        abstractEn: json.data?.abstractEn || d.abstractEn,
        keywordsEn: json.data?.keywordsEn || d.keywordsEn,
      }));
      flashBanner(`Resumo & Abstract gerados (${json.usedProvider}). Revise e ajuste com sua autoria.`);
    } catch (err: any) {
      flashBanner(err?.message || 'Erro ao gerar Resumo com IA.');
    } finally {
      setAiAbstractLoading(false);
    }
  };

  const handleFormatReferenceAi = async () => {
    if (!aiRefInput.trim()) return;
    setAiRefLoading(true);
    try {
      const res = await fetch('/api/ai/abnt-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'format_reference',
          rawReference: aiRefInput,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Falha ao converter referência.');
      const d = json.data || {};
      const validType: AbntReferenceType = ['livro', 'capitulo', 'artigo', 'biblia', 'site', 'livre'].includes(d.type)
        ? d.type
        : 'livre';
      setRefDraft({
        type: validType,
        authors: d.authors || '',
        title: d.title || '',
        subtitle: d.subtitle || '',
        containerTitle: d.containerTitle || '',
        edition: d.edition || '',
        city: d.city || '',
        publisher: d.publisher || '',
        year: d.year || '2026',
        pages: d.pages || '',
        url: d.url || '',
        accessDate: d.accessDate || '',
        freeText: d.formattedText || aiRefInput,
      });
      flashBanner('Campos preenchidos no padrão NBR 6023! Confira e clique em "+ Adicionar Referência".');
    } catch (err: any) {
      flashBanner(err?.message || 'Erro ao formatar referência.');
    } finally {
      setAiRefLoading(false);
    }
  };

  if (!activeDoc || !audit) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Carregando módulo ABNT...
      </div>
    );
  }

  const isLocked = activeDoc.isLocked;
  const logoLayout = activeDoc.formatting.logoLayout || 'both';

  const aiSectionTarget = activeDoc.sections.find((s) => s.id === aiModalSectionId) || null;

  const previewRefText = formatAbntReference({
    ...refDraft,
    formattedText: refDraft.freeText,
  });

  const handleAddReference = () => {
    if (!previewRefText.trim() || isLocked) return;
    const newRef: AbntReference = {
      id: uid('ref'),
      type: refDraft.type,
      authors: refDraft.authors,
      title: refDraft.title,
      subtitle: refDraft.subtitle,
      containerTitle: refDraft.containerTitle,
      edition: refDraft.edition,
      city: refDraft.city,
      publisher: refDraft.publisher,
      year: refDraft.year,
      pages: refDraft.pages,
      url: refDraft.url,
      accessDate: refDraft.accessDate,
      formattedText: previewRefText,
    };
    updateActiveDoc((d) => ({
      ...d,
      references: sortReferencesAlphabetically([...d.references, newRef]),
    }));
    setRefDraft((prev) => ({
      ...prev,
      authors: '',
      title: '',
      subtitle: '',
      containerTitle: '',
      edition: '',
      city: '',
      publisher: '',
      pages: '',
      url: '',
      accessDate: '',
      freeText: '',
    }));
    setAiRefInput('');
  };

  const updateSection = (secId: string, updater: (sec: AbntSection) => AbntSection) => {
    updateActiveDoc((d) => ({
      ...d,
      sections: d.sections.map((s) => (s.id === secId ? updater(s) : s)),
    }));
  };

  const renumberSections = (list: AbntSection[]): AbntSection[] =>
    list.map((sec, idx) => ({
      ...sec,
      numberLabel: String(idx + 1),
    }));

  const addBlockToSection = (secId: string, blockType: AbntContentBlock['type']) => {
    updateSection(secId, (sec) => {
      let newBlock: AbntContentBlock;
      if (blockType === 'long_quote') {
        newBlock = { id: uid('blk'), type: 'long_quote', text: '', citation: '(AUTOR, 2026, p. 00).' };
      } else if (blockType === 'subheading') {
        const subCount = sec.blocks.filter((b) => b.type === 'subheading').length + 1;
        newBlock = {
          id: uid('blk'),
          type: 'subheading',
          level: 2,
          numberLabel: `${sec.numberLabel}.${subCount}`,
          title: 'Subtítulo Temático',
        };
      } else if (blockType === 'table') {
        newBlock = {
          id: uid('blk'),
          type: 'table',
          title: 'Quadro Comparativo',
          source: 'Elaborado pelo autor (2026).',
          headers: ['Aspecto Analisado', 'Descrição / Dados'],
          rows: [
            ['Item 1', 'Detalhamento 1'],
            ['Item 2', 'Detalhamento 2'],
          ],
        };
      } else if (blockType === 'figure') {
        newBlock = {
          id: uid('blk'),
          type: 'figure',
          title: 'Figura Ilustrativa',
          source: 'Acervo da pesquisa (2026).',
          imageDataUrl: '',
        };
      } else {
        newBlock = { id: uid('blk'), type: 'paragraph', text: '' };
      }
      return { ...sec, blocks: [...sec.blocks, newBlock] };
    });
  };

  const updateBlock = (secId: string, blkId: string, updater: (b: AbntContentBlock) => AbntContentBlock) => {
    updateSection(secId, (sec) => ({
      ...sec,
      blocks: sec.blocks.map((b) => (b.id === blkId ? updater(b) : b)),
    }));
  };

  const removeBlock = (secId: string, blkId: string) => {
    updateSection(secId, (sec) => ({
      ...sec,
      blocks: sec.blocks.filter((b) => b.id !== blkId),
    }));
  };

  const handleAddAttachment = (kind: 'apendice' | 'anexo') => {
    const existingKind = activeDoc.attachments.filter((a) => a.kind === kind);
    const letter = String.fromCharCode(65 + existingKind.length);
    const newAtt: AbntAttachment = {
      id: uid('att'),
      kind,
      letter,
      title: kind === 'apendice' ? 'Instrumento / Material Elaborado pelo Autor' : 'Documento Complementar',
      description: '',
    };
    updateActiveDoc((d) => ({ ...d, attachments: [...d.attachments, newAtt] }));
  };

  return (
    <div className="space-y-4 pb-12 max-w-6xl mx-auto">
      {/* CABEÇALHO SUPERIOR ESTILO ESTÁGIO SUPERVISIONADO */}
      <header className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl px-4 sm:px-6 py-3.5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <img
              src={SEMINARIO_LOGO_PATH}
              alt="Seminário Teológico Congregacional"
              className="h-9 w-auto rounded-lg object-contain bg-white border border-slate-200 p-0.5"
            />
            <img
              src={UNIMB_LOGO_PATH}
              alt="UniMB"
              className="h-9 w-auto rounded-lg object-contain bg-white border border-slate-200 p-0.5"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
              Criador de Artigos ABNT
            </h1>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
              Centro Universitário Maciço de Baturité • Seminário Teológico Koinonia
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isStandalonePage ? (
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Koinonia LMS</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/artigos-abnt')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 dark:text-indigo-200 transition cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Tela Cheia</span>
            </button>
          )}

          {/* Seletor de Meus Artigos */}
          <button
            type="button"
            onClick={() => setShowProjectsDrawer((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>Meus Artigos ({articles.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Artigo</span>
          </button>

          {/* Status Local / Nuvem Cross-Device */}
          <button
            type="button"
            onClick={handleManualSaveCloud}
            title="Salvar agora na nuvem para continuar em outro PC ou celular"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              syncState === 'synced'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : syncState === 'saving'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {syncState === 'saving' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : syncState === 'error' ? (
              <CloudOff className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Cloud className="w-3.5 h-3.5" />
            )}
            <span>
              {syncState === 'synced'
                ? 'Salvo na Nuvem'
                : syncState === 'saving'
                ? 'Sincronizando...'
                : 'Salvar Nuvem'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleManualPullCloud}
            title="Buscar atualizações feitas em outro dispositivo"
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {isLocked && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs font-bold">
              <Lock className="w-3 h-3" />
              <span>Trancado</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleExportJson}
            title="Baixar Backup .json"
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => fileImportRef.current?.click()}
            title="Restaurar Backup .json"
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileImportRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportJson}
            className="hidden"
          />
        </div>
      </header>

      {/* PAINEL RÁPIDO DE TROCA ENTRE ARTIGOS */}
      {showProjectsDrawer && (
        <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Meus Artigos e Trabalhos ({articles.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowProjectsDrawer(false)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {articles.map((art) => {
              const isCurrent = art.id === activeDoc.id;
              const tplLabel = ABNT_TEMPLATE_CARDS.find((t) => t.id === art.templateType)?.name || 'ABNT';
              return (
                <div
                  key={art.id}
                  className={`p-3 rounded-2xl border flex items-start justify-between gap-2 transition ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDoc(art);
                      setShowProjectsDrawer(false);
                    }}
                    className="text-left min-w-0 flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {tplLabel}
                      </span>
                      {art.isLocked && <Lock className="w-3 h-3 text-amber-600" />}
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {art.title || 'Sem título'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {art.disciplinaName}
                    </p>
                  </button>
                  {articles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteArticle(art.id)}
                      title="Excluir artigo"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STATUS TOAST */}
      {statusBanner && (
        <div className="no-print px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold flex items-center justify-between shadow-lg">
          <span>{statusBanner}</span>
          <button type="button" onClick={() => setStatusBanner(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LINHA DE PROGRESSO E ESTIMATIVA DE LAUDAS */}
      <div className="no-print flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Progresso ABNT: <strong>{audit.progressPercent}%</strong> ({audit.completedBlocks}/{audit.totalBlocks} requisitos)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <span>
            Extensão estimada: <strong>~{audit.estimatedPages} pág(s)</strong> ({audit.wordCount} palavras)
          </span>
          {(activeDoc.formatting.targetMinPages || activeDoc.formatting.targetMaxPages) && (
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px]">
              Meta: {activeDoc.formatting.targetMinPages || 1}–{activeDoc.formatting.targetMaxPages || '∞'} págs
            </span>
          )}
        </div>
      </div>

      {/* BARRA DE 6 ETAPAS */}
      <nav className="no-print flex items-center gap-2 overflow-x-auto pb-1">
        {STEP_TABS.map((step) => {
          const isActive = activeStep === step.id;
          const IconComp = step.Icon;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap border transition cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{step.label}</span>
            </button>
          );
        })}
      </nav>

      {/* BANNER TRANCADO */}
      {isLocked && (
        <div className="no-print bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-3xl p-4 space-y-2.5">
          <div className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-700 dark:text-amber-300" />
            <p>
              <strong>Artigo trancado (entregue):</strong> modo somente leitura para proteger os dados contra alterações. Você pode consultar todas as abas e exportar em <strong>6. Exportar ABNT</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleLock}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-xs font-bold text-slate-800 dark:text-amber-100 hover:bg-amber-100/60 transition cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Destrancar para edição</span>
          </button>
        </div>
      )}

      {/* ==================== ETAPA 1: DADOS & CAPA ==================== */}
      {activeStep === 'dados' && (
        <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Identidade Institucional, Disciplina &amp; Autoria
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Padrão oficial UniMB / Seminário Koinonia com vínculo rápido para qualquer matéria.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(['unimb', 'koinonia'] as const).map((presetKey) => {
                const active = activeDoc.formatting.institutionPreset === presetKey;
                return (
                  <button
                    key={presetKey}
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleApplyPreset(presetKey)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer disabled:opacity-60 ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {INSTITUTION_PRESETS[presetKey].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vínculo rápido com disciplina */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vincular a Disciplina do LMS (opcional)
              </label>
              <select
                disabled={isLocked}
                value={activeDoc.disciplinaId || ''}
                onChange={(e) => handleDisciplinaSelect(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
              >
                <option value="">Personalizada / Outra disciplina</option>
                {disciplinas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nome da Disciplina no Trabalho
              </label>
              <input
                disabled={isLocked}
                value={activeDoc.disciplinaName}
                onChange={(e) => updateActiveDoc((d) => ({ ...d, disciplinaName: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Modelo ABNT Ativo
              </label>
              <select
                disabled={isLocked}
                value={activeDoc.templateType}
                onChange={(e) =>
                  updateActiveDoc((d) => ({
                    ...d,
                    templateType: e.target.value as AbntTemplateType,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
              >
                {ABNT_TEMPLATE_CARDS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.normaBadge})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cabeçalho da Capa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Instituição (Capa)
              </label>
              <input
                disabled={isLocked}
                value={activeDoc.institutionName}
                onChange={(e) => updateActiveDoc((d) => ({ ...d, institutionName: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Curso (Capa)
              </label>
              <input
                disabled={isLocked}
                value={activeDoc.courseName}
                onChange={(e) => updateActiveDoc((d) => ({ ...d, courseName: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Título Principal do Artigo / Trabalho
              </label>
              <input
                disabled={isLocked}
                value={activeDoc.title}
                onChange={(e) => updateActiveDoc((d) => ({ ...d, title: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subtítulo (opcional)
              </label>
              <input
                disabled={isLocked}
                value={activeDoc.subtitle || ''}
                onChange={(e) => updateActiveDoc((d) => ({ ...d, subtitle: e.target.value }))}
                placeholder="Ex.: uma análise bíblico-teológica"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cidade – UF
                </label>
                <input
                  disabled={isLocked}
                  value={activeDoc.city}
                  onChange={(e) => updateActiveDoc((d) => ({ ...d, city: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ano
                </label>
                <input
                  disabled={isLocked}
                  value={activeDoc.year}
                  onChange={(e) => updateActiveDoc((d) => ({ ...d, year: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Autores (1 a 4 seminaristas) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Autor(es) na Capa e Folha de Rosto (1 a 4 seminaristas)
              </label>
              {!isLocked && activeDoc.authors.length < 4 && (
                <button
                  type="button"
                  onClick={() =>
                    updateActiveDoc((d) => ({
                      ...d,
                      authors: [...d.authors, { id: uid('aut'), fullName: '' }],
                    }))
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Coautor</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeDoc.authors.map((author, idx) => (
                <div key={author.id} className="flex items-center gap-2">
                  <input
                    disabled={isLocked}
                    value={author.fullName}
                    onChange={(e) =>
                      updateActiveDoc((d) => ({
                        ...d,
                        authors: d.authors.map((a) =>
                          a.id === author.id ? { ...a, fullName: e.target.value } : a
                        ),
                      }))
                    }
                    placeholder={`Nome completo oficial (${idx + 1}º autor)`}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold"
                  />
                  {!isLocked && activeDoc.authors.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        updateActiveDoc((d) => ({
                          ...d,
                          authors: d.authors.filter((a) => a.id !== author.id),
                        }))
                      }
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Docente e Nota de Natureza */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Professor(a) / Orientador(a)
              </label>
              <input
                disabled={isLocked}
                value={activeDoc.professorName}
                onChange={(e) => updateActiveDoc((d) => ({ ...d, professorName: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                E-mail do Professor (para botão Enviar E-mail)
              </label>
              <input
                disabled={isLocked}
                type="email"
                value={activeDoc.professorEmail || ''}
                onChange={(e) => updateActiveDoc((d) => ({ ...d, professorEmail: e.target.value }))}
                placeholder="ex.: prof.alexsandro@gmail.com"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nota de Natureza Acadêmica (recuo 8 cm na Folha de Rosto)
            </label>
            <textarea
              disabled={isLocked}
              rows={2}
              value={activeDoc.academicNatureNote}
              onChange={(e) => updateActiveDoc((d) => ({ ...d, academicNatureNote: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      {/* ==================== ETAPA 2: PRÉ-TEXTUAIS ==================== */}
      {activeStep === 'pretextuais' && (
        <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Elementos Pré-Textuais &amp; Regras do Trabalho
            </h2>
            <div className="flex flex-wrap gap-3 pt-1">
              {[
                { key: 'showCover', label: 'Incluir Capa' },
                { key: 'showDisciplinaOnCover', label: 'Disciplina & Professor na Capa' },
                { key: 'showTitlePage', label: 'Incluir Folha de Rosto' },
                { key: 'showToc', label: 'Incluir Sumário' },
                { key: 'showAbstract', label: 'Incluir Resumo & Abstract' },
                { key: 'restrictFirstPerson', label: 'Alertar 1ª pessoa (impessoalidade)' },
              ].map((opt) => {
                const checked = Boolean((activeDoc.formatting as any)[opt.key]);
                return (
                  <label
                    key={opt.key}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      disabled={isLocked}
                      checked={checked}
                      onChange={(e) =>
                        updateActiveDoc((d) => ({
                          ...d,
                          formatting: {
                            ...d.formatting,
                            [opt.key]: e.target.checked,
                          },
                        }))
                      }
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Meta Mínima de Páginas (opcional — deixe 0 para desativar)
              </label>
              <input
                type="number"
                min={0}
                disabled={isLocked}
                value={activeDoc.formatting.targetMinPages || 0}
                onChange={(e) =>
                  updateActiveDoc((d) => ({
                    ...d,
                    formatting: { ...d.formatting, targetMinPages: Number(e.target.value) || undefined },
                  }))
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Meta Máxima de Páginas (opcional — deixe 0 para desativar)
              </label>
              <input
                type="number"
                min={0}
                disabled={isLocked}
                value={activeDoc.formatting.targetMaxPages || 0}
                onChange={(e) =>
                  updateActiveDoc((d) => ({
                    ...d,
                    formatting: { ...d.formatting, targetMaxPages: Number(e.target.value) || undefined },
                  }))
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {activeDoc.formatting.showAbstract && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Resumo (NBR 6028 — Parágrafo Único, 150 a 500 palavras)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Contagem atual:{' '}
                    <strong
                      className={
                        audit.abstractWordCount >= 150 && audit.abstractWordCount <= 500
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      }
                    >
                      {audit.abstractWordCount} palavras
                    </strong>
                  </p>
                </div>
                {!isLocked && (
                  <button
                    type="button"
                    disabled={aiAbstractLoading}
                    onClick={handleGenerateAbstractAi}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold cursor-pointer shadow-sm"
                  >
                    {aiAbstractLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Gerar Resumo &amp; Abstract com IA</span>
                  </button>
                )}
              </div>

              <textarea
                disabled={isLocked}
                rows={5}
                value={activeDoc.resumo}
                onChange={(e) => updateActiveDoc((d) => ({ ...d, resumo: e.target.value }))}
                placeholder="Redija em parágrafo único contínuo apresentando tema, objetivo, metodologia, principais resultados e considerações finais..."
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-sm leading-relaxed"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Palavras-chave (3 a 5 descritores separados por ponto final)
                </label>
                <input
                  disabled={isLocked}
                  value={activeDoc.palavrasChave}
                  onChange={(e) => updateActiveDoc((d) => ({ ...d, palavrasChave: e.target.value }))}
                  placeholder="Ex.: Eclesiologia. Congregacionalismo. Missão Urbana. Teologia Prática."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Abstract (Inglês — opcional para artigos TCC I)
                </label>
                <textarea
                  disabled={isLocked}
                  rows={4}
                  value={activeDoc.abstractEn}
                  onChange={(e) => updateActiveDoc((d) => ({ ...d, abstractEn: e.target.value }))}
                  placeholder="English abstract..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 text-sm leading-relaxed"
                />
                <input
                  disabled={isLocked}
                  value={activeDoc.keywordsEn}
                  onChange={(e) => updateActiveDoc((d) => ({ ...d, keywordsEn: e.target.value }))}
                  placeholder="Keywords: Ecclesiology. Theology. Ministry."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== ETAPA 3: REDAÇÃO ABNT ==================== */}
      {activeStep === 'redacao' && (
        <div className="no-print space-y-4">
          {activeDoc.formatting.restrictFirstPerson && audit.firstPersonCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 dark:text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>
                  Alerta de Impessoalidade (ABNT 3ª pessoa): {audit.firstPersonCount} termo(s) em 1ª pessoa detectado(s)
                </span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                Exemplos:{' '}
                {audit.firstPersonSamples.map((s, idx) => (
                  <span key={idx} className="mr-2">
                    [<strong>{s.term}</strong> em &ldquo;{s.excerpt}&rdquo;]
                  </span>
                ))}
              </p>
            </div>
          )}

          {activeDoc.sections.map((sec, secIdx) => (
            <div
              key={sec.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    disabled={isLocked}
                    value={sec.numberLabel}
                    onChange={(e) => updateSection(sec.id, (s) => ({ ...s, numberLabel: e.target.value }))}
                    className="w-12 text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-sm font-black"
                  />
                  <input
                    disabled={isLocked}
                    value={sec.title}
                    onChange={(e) => updateSection(sec.id, (s) => ({ ...s, title: e.target.value }))}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-sm font-black uppercase"
                  />
                </div>
                {!isLocked && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAiModalSectionId(sec.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-200 text-xs font-bold cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Assistente IA</span>
                    </button>
                    {secIdx > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveDoc((d) => {
                            const arr = [...d.sections];
                            [arr[secIdx - 1], arr[secIdx]] = [arr[secIdx], arr[secIdx - 1]];
                            return { ...d, sections: renumberSections(arr) };
                          })
                        }
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {secIdx < activeDoc.sections.length - 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveDoc((d) => {
                            const arr = [...d.sections];
                            [arr[secIdx + 1], arr[secIdx]] = [arr[secIdx], arr[secIdx + 1]];
                            return { ...d, sections: renumberSections(arr) };
                          })
                        }
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {activeDoc.sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveDoc((d) => ({
                            ...d,
                            sections: renumberSections(d.sections.filter((s) => s.id !== sec.id)),
                          }))
                        }
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {sec.guideHint && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                  💡 <strong>Orientação:</strong> {sec.guideHint}
                </p>
              )}

              <div className="space-y-3">
                {sec.blocks.map((blk) => (
                  <div
                    key={blk.id}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span className="uppercase">
                        {blk.type === 'paragraph' && 'Parágrafo ABNT (12pt • Justificado)'}
                        {blk.type === 'long_quote' && 'Citação Direta Longa (Recuo 4 cm • Fonte 10 • Sem aspas)'}
                        {blk.type === 'subheading' && 'Subtítulo Numerado'}
                        {blk.type === 'table' && 'Tabela Padrão ABNT'}
                        {blk.type === 'figure' && 'Figura / Imagem ABNT'}
                      </span>
                      {!isLocked && sec.blocks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBlock(sec.id, blk.id)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    {blk.type === 'paragraph' && (
                      <div className="space-y-1">
                        <textarea
                          disabled={isLocked}
                          rows={5}
                          value={blk.text}
                          onChange={(e) =>
                            updateBlock(sec.id, blk.id, (b) =>
                              b.type === 'paragraph' ? { ...b, text: e.target.value } : b
                            )
                          }
                          placeholder="Redija seus parágrafos aqui (deixe uma linha em branco para iniciar novo parágrafo com recuo 1,25 cm)..."
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm leading-relaxed"
                        />
                        <div className="text-right text-[11px] text-slate-400">
                          {countWords(blk.text)} palavras neste bloco
                        </div>
                      </div>
                    )}

                    {blk.type === 'long_quote' && (
                      <div className="space-y-2 pl-4 border-l-4 border-indigo-400">
                        <textarea
                          disabled={isLocked}
                          rows={3}
                          value={blk.text}
                          onChange={(e) =>
                            updateBlock(sec.id, blk.id, (b) =>
                              b.type === 'long_quote' ? { ...b, text: e.target.value } : b
                            )
                          }
                          placeholder="Cole o trecho citado diretamente com mais de 3 linhas (SEM aspas)..."
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs leading-relaxed"
                        />
                        <input
                          disabled={isLocked}
                          value={blk.citation}
                          onChange={(e) =>
                            updateBlock(sec.id, blk.id, (b) =>
                              b.type === 'long_quote' ? { ...b, citation: e.target.value } : b
                            )
                          }
                          placeholder="(SOBRENOME, Ano, p. 45)."
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold"
                        />
                      </div>
                    )}

                    {blk.type === 'subheading' && (
                      <div className="flex items-center gap-2">
                        <input
                          disabled={isLocked}
                          value={blk.numberLabel}
                          onChange={(e) =>
                            updateBlock(sec.id, blk.id, (b) =>
                              b.type === 'subheading' ? { ...b, numberLabel: e.target.value } : b
                            )
                          }
                          className="w-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-sm font-bold"
                        />
                        <input
                          disabled={isLocked}
                          value={blk.title}
                          onChange={(e) =>
                            updateBlock(sec.id, blk.id, (b) =>
                              b.type === 'subheading' ? { ...b, title: e.target.value } : b
                            )
                          }
                          className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm font-bold"
                        />
                      </div>
                    )}

                    {blk.type === 'table' && (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            disabled={isLocked}
                            value={blk.title}
                            onChange={(e) =>
                              updateBlock(sec.id, blk.id, (b) =>
                                b.type === 'table' ? { ...b, title: e.target.value } : b
                              )
                            }
                            placeholder="Título da Tabela"
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold"
                          />
                          <input
                            disabled={isLocked}
                            value={blk.source}
                            onChange={(e) =>
                              updateBlock(sec.id, blk.id, (b) =>
                                b.type === 'table' ? { ...b, source: e.target.value } : b
                              )
                            }
                            placeholder="Fonte: Elaborado pelo autor (2026)."
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs"
                          />
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <thead>
                              <tr>
                                {blk.headers.map((h, hIdx) => (
                                  <th key={hIdx} className="p-1 border border-slate-200 dark:border-slate-700">
                                    <input
                                      disabled={isLocked}
                                      value={h}
                                      onChange={(e) =>
                                        updateBlock(sec.id, blk.id, (b) => {
                                          if (b.type !== 'table') return b;
                                          const headers = [...b.headers];
                                          headers[hIdx] = e.target.value;
                                          return { ...b, headers };
                                        })
                                      }
                                      className="w-full px-1.5 py-1 font-bold bg-transparent"
                                    />
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {blk.rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-1 border border-slate-200 dark:border-slate-700">
                                      <input
                                        disabled={isLocked}
                                        value={cell}
                                        onChange={(e) =>
                                          updateBlock(sec.id, blk.id, (b) => {
                                            if (b.type !== 'table') return b;
                                            const rows = b.rows.map((r) => [...r]);
                                            rows[rIdx][cIdx] = e.target.value;
                                            return { ...b, rows };
                                          })
                                        }
                                        className="w-full px-1.5 py-1 bg-transparent"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {!isLocked && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateBlock(sec.id, blk.id, (b) =>
                                  b.type === 'table'
                                    ? { ...b, rows: [...b.rows, b.headers.map(() => '')] }
                                    : b
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-[11px] font-bold cursor-pointer"
                            >
                              + Linha
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateBlock(sec.id, blk.id, (b) =>
                                  b.type === 'table'
                                    ? {
                                        ...b,
                                        headers: [...b.headers, `Coluna ${b.headers.length + 1}`],
                                        rows: b.rows.map((r) => [...r, '']),
                                      }
                                    : b
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-[11px] font-bold cursor-pointer"
                            >
                              + Coluna
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {blk.type === 'figure' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            disabled={isLocked}
                            value={blk.title}
                            onChange={(e) =>
                              updateBlock(sec.id, blk.id, (b) =>
                                b.type === 'figure' ? { ...b, title: e.target.value } : b
                              )
                            }
                            placeholder="Título da Figura"
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold"
                          />
                          <input
                            disabled={isLocked}
                            value={blk.source}
                            onChange={(e) =>
                              updateBlock(sec.id, blk.id, (b) =>
                                b.type === 'figure' ? { ...b, source: e.target.value } : b
                              )
                            }
                            placeholder="Fonte: Arquivo pessoal (2026)."
                            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs"
                          />
                        </div>
                        {!isLocked && (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              e.target.value = '';
                              if (!file) return;
                              try {
                                const compressed = await compressImageForAbnt(file);
                                updateBlock(sec.id, blk.id, (b) =>
                                  b.type === 'figure' ? { ...b, imageDataUrl: compressed } : b
                                );
                              } catch (err: any) {
                                flashBanner(err?.message || 'Erro ao comprimir imagem.');
                              }
                            }}
                            className="text-xs"
                          />
                        )}
                        {blk.imageDataUrl && (
                          <img
                            src={blk.imageDataUrl}
                            alt={blk.title}
                            className="max-h-44 rounded-xl border border-slate-200 object-contain"
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!isLocked && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => addBlockToSection(sec.id, 'paragraph')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold cursor-pointer"
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>+ Parágrafo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlockToSection(sec.id, 'long_quote')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold cursor-pointer"
                  >
                    <Quote className="w-3.5 h-3.5" />
                    <span>+ Citação Longa (4 cm)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlockToSection(sec.id, 'subheading')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold cursor-pointer"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                    <span>+ Subtítulo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlockToSection(sec.id, 'table')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold cursor-pointer"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>+ Tabela</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlockToSection(sec.id, 'figure')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>+ Figura</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {!isLocked && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  updateActiveDoc((d) => ({
                    ...d,
                    sections: [
                      ...d.sections,
                      {
                        id: uid('sec'),
                        numberLabel: String(d.sections.length + 1),
                        title:
                          d.templateType === 'resumo_livro'
                            ? `CAPÍTULO ${d.sections.length} — SÍNTESE ANALÍTICA`
                            : 'NOVA SEÇÃO TEMÁTICA',
                        blocks: [{ id: uid('blk'), type: 'paragraph', text: '' }],
                      },
                    ],
                  }))
                }
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {activeDoc.templateType === 'resumo_livro' ? 'Adicionar Capítulo' : 'Adicionar Nova Seção'}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== ETAPA 4: REFERÊNCIAS NBR 6023 ==================== */}
      {activeStep === 'referencias' && (
        <div className="no-print space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Construtor Guiado de Referências (ABNT NBR 6023)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Título destacado em negrito e ordenação alfabética automática pelo sobrenome do autor.
                </p>
              </div>
            </div>

            {!isLocked && (
              <>
                <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    value={aiRefInput}
                    onChange={(e) => setAiRefInput(e.target.value)}
                    placeholder="Cole uma referência solta ou link (ex.: Silvio Almeida Racismo Estrutural 2019 Pólen) para converter com IA..."
                    className="flex-1 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    disabled={aiRefLoading || !aiRefInput.trim()}
                    onClick={handleFormatReferenceAi}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
                  >
                    {aiRefLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Converter em ABNT</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {REFERENCE_TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setRefDraft((p) => ({ ...p, type: t.id }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer ${
                        refDraft.type === t.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {refDraft.type === 'livre' ? (
                  <textarea
                    rows={2}
                    value={refDraft.freeText}
                    onChange={(e) => setRefDraft((p) => ({ ...p, freeText: e.target.value }))}
                    placeholder="Ex.: ALMEIDA, Silvio. **Racismo estrutural**. São Paulo: Sueli Carneiro; Pólen, 2019."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs"
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Autor(es) (SOBRENOME, Nome)</label>
                      <input
                        value={refDraft.authors}
                        onChange={(e) => setRefDraft((p) => ({ ...p, authors: e.target.value }))}
                        placeholder="Ex.: PIPER, John"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">
                        {refDraft.type === 'biblia' ? 'Título (ex.: BÍBLIA)' : 'Título da Obra / Artigo'}
                      </label>
                      <input
                        value={refDraft.title}
                        onChange={(e) => setRefDraft((p) => ({ ...p, title: e.target.value }))}
                        placeholder="Ex.: O racismo, a cruz e o cristão"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Subtítulo / Versão (opcional)</label>
                      <input
                        value={refDraft.subtitle || ''}
                        onChange={(e) => setRefDraft((p) => ({ ...p, subtitle: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
                      />
                    </div>
                    {(refDraft.type === 'capitulo' || refDraft.type === 'artigo' || refDraft.type === 'site') && (
                      <div>
                        <label className="block text-[11px] font-bold mb-1">
                          {refDraft.type === 'capitulo' ? 'Livro Coletânea (In:)' : 'Revista / Site'}
                        </label>
                        <input
                          value={refDraft.containerTitle || ''}
                          onChange={(e) => setRefDraft((p) => ({ ...p, containerTitle: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Cidade</label>
                      <input
                        value={refDraft.city || ''}
                        onChange={(e) => setRefDraft((p) => ({ ...p, city: e.target.value }))}
                        placeholder="Ex.: São Paulo"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Editora</label>
                      <input
                        value={refDraft.publisher || ''}
                        onChange={(e) => setRefDraft((p) => ({ ...p, publisher: e.target.value }))}
                        placeholder="Ex.: Vida Nova"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Ano</label>
                      <input
                        value={refDraft.year}
                        onChange={(e) => setRefDraft((p) => ({ ...p, year: e.target.value }))}
                        placeholder="2026"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
                      />
                    </div>
                    {(refDraft.type === 'artigo' || refDraft.type === 'site') && (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">URL</label>
                          <input
                            value={refDraft.url || ''}
                            onChange={(e) => setRefDraft((p) => ({ ...p, url: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold mb-1">Acesso em</label>
                          <input
                            value={refDraft.accessDate || ''}
                            onChange={(e) => setRefDraft((p) => ({ ...p, accessDate: e.target.value }))}
                            placeholder="Ex.: 21 nov. 2026"
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {previewRefText && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-bold text-slate-500">Prévia NBR 6023: </span>
                    <span className="text-slate-900 dark:text-slate-100">{previewRefText}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!previewRefText.trim()}
                  onClick={handleAddReference}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Referência</span>
                </button>
              </>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Referências Adicionadas ({activeDoc.references.length}) — Ordem Alfabética Automática
            </h3>
            {activeDoc.references.length === 0 ? (
              <p className="text-xs text-slate-500">Nenhuma referência cadastrada ainda.</p>
            ) : (
              <div className="space-y-2">
                {sortReferencesAlphabetically(activeDoc.references).map((ref) => (
                  <div
                    key={ref.id}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <input
                      disabled={isLocked}
                      value={ref.formattedText}
                      onChange={(e) =>
                        updateActiveDoc((d) => ({
                          ...d,
                          references: d.references.map((r) =>
                            r.id === ref.id ? { ...r, formattedText: e.target.value } : r
                          ),
                        }))
                      }
                      className="flex-1 bg-transparent text-xs font-medium focus:outline-none"
                    />
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveDoc((d) => ({
                            ...d,
                            references: d.references.filter((r) => r.id !== ref.id),
                          }))
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== ETAPA 5: APÊNDICES & ANEXOS ==================== */}
      {activeStep === 'anexos' && (
        <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Apêndices (autoria própria) &amp; Anexos (documentos de terceiros)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Imagens são comprimidas automaticamente para exportar no Word (.docx), PDF e sincronizar leve na nuvem.
              </p>
            </div>
            {!isLocked && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleAddAttachment('apendice')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Apêndice</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddAttachment('anexo')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Anexo</span>
                </button>
              </div>
            )}
          </div>

          {activeDoc.attachments.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
              Nenhum apêndice ou anexo adicionado. Use os botões acima caso queira incluir roteiros, questionários, documentos ou imagens.
            </p>
          ) : (
            <div className="space-y-4">
              {activeDoc.attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                      {att.kind === 'apendice' ? 'APÊNDICE' : 'ANEXO'} {att.letter}
                    </span>
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveDoc((d) => ({
                            ...d,
                            attachments: d.attachments.filter((a) => a.id !== att.id),
                          }))
                        }
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                  <input
                    disabled={isLocked}
                    value={att.title}
                    onChange={(e) =>
                      updateActiveDoc((d) => ({
                        ...d,
                        attachments: d.attachments.map((a) =>
                          a.id === att.id ? { ...a, title: e.target.value } : a
                        ),
                      }))
                    }
                    placeholder="Título do Apêndice / Anexo"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-bold"
                  />
                  <textarea
                    disabled={isLocked}
                    rows={3}
                    value={att.description}
                    onChange={(e) =>
                      updateActiveDoc((d) => ({
                        ...d,
                        attachments: d.attachments.map((a) =>
                          a.id === att.id ? { ...a, description: e.target.value } : a
                        ),
                      }))
                    }
                    placeholder="Texto explicativo, transcrição de documento ou instrumento..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                    {!isLocked && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (!file) return;
                          try {
                            const compressed = await compressImageForAbnt(file);
                            updateActiveDoc((d) => ({
                              ...d,
                              attachments: d.attachments.map((a) =>
                                a.id === att.id ? { ...a, imageDataUrl: compressed } : a
                              ),
                            }));
                          } catch (err: any) {
                            flashBanner(err?.message || 'Erro ao processar imagem.');
                          }
                        }}
                        className="text-xs"
                      />
                    )}
                    <input
                      disabled={isLocked}
                      value={att.imageSource || ''}
                      onChange={(e) =>
                        updateActiveDoc((d) => ({
                          ...d,
                          attachments: d.attachments.map((a) =>
                            a.id === att.id ? { ...a, imageSource: e.target.value } : a
                          ),
                        }))
                      }
                      placeholder="Fonte da imagem (ex.: Acervo do autor, 2026)"
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs"
                    />
                  </div>
                  {att.imageDataUrl && (
                    <img
                      src={att.imageDataUrl}
                      alt={att.title}
                      className="max-h-52 rounded-xl border border-slate-200 object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== ETAPA 6: EXPORTAR ABNT ==================== */}
      {activeStep === 'exportar' && (
        <div className="space-y-6">
          <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Pré-visualização ABNT &amp; Exportação Final
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dica: exporte primeiro o rascunho em <strong>Word (.docx)</strong> se quiser fazer ajustes finos antes de salvar o <strong>PDF</strong> final para enviar ao docente.
              </p>
            </div>

            {/* Controles rápidos idênticos ao Estágio Supervisionado */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={activeDoc.formatting.fontFamily}
                onChange={(e) =>
                  updateActiveDoc(
                    (d) => ({
                      ...d,
                      formatting: {
                        ...d.formatting,
                        fontFamily: e.target.value as 'Arial' | 'Times New Roman',
                      },
                    }),
                    true
                  )
                }
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
              >
                <option value="Arial">Arial 12pt</option>
                <option value="Times New Roman">Times New Roman 12pt</option>
              </select>

              <select
                value={String(activeDoc.formatting.firstLineIndentCm)}
                onChange={(e) =>
                  updateActiveDoc(
                    (d) => ({
                      ...d,
                      formatting: {
                        ...d.formatting,
                        firstLineIndentCm: Number(e.target.value) === 0 ? 0 : 1.25,
                      },
                    }),
                    true
                  )
                }
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
              >
                <option value="1.25">Recuo 1,25 cm</option>
                <option value="0">Sem recuo (0 cm)</option>
              </select>

              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeDoc.formatting.showLogo}
                  onChange={(e) =>
                    updateActiveDoc(
                      (d) => ({
                        ...d,
                        formatting: { ...d.formatting, showLogo: e.target.checked },
                      }),
                      true
                    )
                  }
                />
                <span>Logos na Capa</span>
              </label>

              {activeDoc.formatting.showLogo && (
                <select
                  value={logoLayout}
                  onChange={(e) =>
                    updateActiveDoc(
                      (d) => ({
                        ...d,
                        formatting: {
                          ...d.formatting,
                          logoLayout: e.target.value as 'both' | 'unimb' | 'stc',
                        },
                      }),
                      true
                    )
                  }
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold"
                >
                  <option value="both">Seminário + UniMB (2 Logos)</option>
                  <option value="unimb">Somente Brasão UniMB</option>
                  <option value="stc">Somente Logo Seminário</option>
                </select>
              )}
            </div>

            {/* Checklist ABNT em Pílulas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {audit.checks.map((chk) => (
                <div
                  key={chk.id}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    chk.passed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : chk.severity === 'warn'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {chk.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  )}
                  <span className="truncate">{chk.label}</span>
                </div>
              ))}
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                disabled={exportingDocx}
                onClick={handleDownloadDocx}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                {exportingDocx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Baixar Artigo (.docx)</span>
              </button>

              <button
                type="button"
                disabled={exportingPdf}
                onClick={handlePrintPdf}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                <span>Imprimir / Salvar PDF</span>
              </button>

              <a
                href={buildProfessorMailto(activeDoc)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
              >
                <Mail className="w-4 h-4" />
                <span>
                  Enviar E-mail ao Professor
                  {activeDoc.professorEmail ? ` (${activeDoc.professorEmail})` : ''}
                </span>
              </a>

              <button
                type="button"
                onClick={handleToggleLock}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-xs transition cursor-pointer ${
                  isLocked
                    ? 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{isLocked ? 'Destrancar Artigo' : 'Trancar Versão Entregue'}</span>
              </button>
            </div>
          </div>

          <AbntPreviewDocument doc={activeDoc} />
        </div>
      )}

      {/* MODAL DE NOVO ARTIGO COM OS 5 TEMPLATES */}
      {showNewModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Criar Novo Trabalho Acadêmico ABNT
                </h3>
                <p className="text-xs text-slate-500">
                  Escolha o formato adequado e vincule opcionalmente à disciplina desejada.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto modal-scroll space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Disciplina (opcional)
                </label>
                <select
                  value={selectedDiscForNew}
                  onChange={(e) => setSelectedDiscForNew(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                >
                  <option value="">Sem vínculo específico (preencher manualmente)</option>
                  {disciplinas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {ABNT_TEMPLATE_CARDS.map((tpl) => {
                  const selected = selectedTemplateForNew === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateForNew(tpl.id)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        selected
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                          : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          {selected && <Check className="w-4 h-4 text-blue-600" />}
                          {tpl.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                            {tpl.normaBadge}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {tpl.metaLabel}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">{tpl.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateNewArticle}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Criar Artigo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DO ASSISTENTE DE IA POR SEÇÃO */}
      {aiSectionTarget && (
        <AbntAiAssistModal
          isOpen={Boolean(aiSectionTarget)}
          onClose={() => setAiModalSectionId(null)}
          title={activeDoc.title}
          subtitle={activeDoc.subtitle}
          disciplinaName={activeDoc.disciplinaName}
          sectionTitle={`${aiSectionTarget.numberLabel} ${aiSectionTarget.title}`}
          currentText={aiSectionTarget.blocks
            .map((b) => (b.type === 'paragraph' ? b.text : ''))
            .filter(Boolean)
            .join('\n\n')}
          restrictAiNotice={activeDoc.formatting.restrictFirstPerson}
          onInsertNewParagraph={(generated) => {
            updateSection(aiSectionTarget.id, (sec) => {
              const onlyEmpty =
                sec.blocks.length === 1 &&
                sec.blocks[0].type === 'paragraph' &&
                !sec.blocks[0].text.trim();
              if (onlyEmpty) {
                return { ...sec, blocks: [{ ...sec.blocks[0], text: generated }] };
              }
              return {
                ...sec,
                blocks: [...sec.blocks, { id: uid('blk'), type: 'paragraph', text: generated }],
              };
            });
          }}
          onReplaceCurrent={(generated) => {
            updateSection(aiSectionTarget.id, (sec) => {
              const firstParaIdx = sec.blocks.findIndex((b) => b.type === 'paragraph');
              if (firstParaIdx === -1) {
                return {
                  ...sec,
                  blocks: [{ id: uid('blk'), type: 'paragraph', text: generated }, ...sec.blocks],
                };
              }
              const nextBlocks = sec.blocks.map((b, idx) =>
                idx === firstParaIdx && b.type === 'paragraph' ? { ...b, text: generated } : b
              );
              return { ...sec, blocks: nextBlocks };
            });
          }}
        />
      )}
    </div>
  );
};
