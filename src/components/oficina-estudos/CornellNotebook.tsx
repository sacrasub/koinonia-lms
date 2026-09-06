'use client';

import React, { useState, useEffect } from 'react';
import {
  CornellAnotacao,
  EixoTematicoId
} from '@/types/oficinaEstudos';
import { oficinaEstudosService } from '@/services/oficinaEstudosService';
import {
  BookOpen,
  Save,
  Download,
  Printer,
  Trash2,
  Plus,
  Edit3,
  Search,
  Sparkles,
  Tag,
  Copy,
  Check,
  HelpCircle,
  FileText,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CornellNotebookProps {
  initialAutor?: string;
  initialObra?: string;
  initialEixo?: EixoTematicoId;
  onShowToast: (msg: string) => void;
}

// Obras canônicas sugeridas para vínculo imediato
const SUGESTOES_OBRAS = [
  { autor: 'GANDRA, E. A.; BAADE, J. H.', obra: 'A formação pastoral teológica entre o claustro e a rede (2018)', eixo: 'historico' as EixoTematicoId },
  { autor: 'MODES, Josemar', obra: 'A virada paradigmática da EaD no ensino teológico brasileiro (2020)', eixo: 'historico' as EixoTematicoId },
  { autor: 'MOORE, Michael G.', obra: 'Theory of transactional distance (1993)', eixo: 'teorico' as EixoTematicoId },
  { autor: 'GARRISON, D. R.', obra: 'Community of inquiry in adult and higher education (2000)', eixo: 'teorico' as EixoTematicoId },
  { autor: 'SOUZA, Lidiane', obra: 'Mediação pedagógica e diálogo síncrono na educação teológica (2016)', eixo: 'teorico' as EixoTematicoId },
  { autor: 'ESPÍRITO SANTO, Eliseu Roque do', obra: 'Koinonia e Cibercultura: a comunhão cristã digital (2009)', eixo: 'eclesiologico' as EixoTematicoId },
  { autor: 'DOMINGUES, Gleyds', obra: 'Igreja em rede: afetividade e mutualidade conectada (2016)', eixo: 'eclesiologico' as EixoTematicoId },
  { autor: 'THEMELIS, Chryssa', obra: 'Tele-proximity: human touch and visual presence in remote learning (2021)', eixo: 'inovacao' as EixoTematicoId },
  { autor: 'FILATRO, A.; CAVALCANTI, C.', obra: 'Metodologias ativas para uma educação inovadora (2019)', eixo: 'inovacao' as EixoTematicoId },
  { autor: 'KOINONIA LMS', obra: 'Relatório Empírico da Pesquisa de Campo (2026)', eixo: 'inovacao' as EixoTematicoId },
];

export const CornellNotebook: React.FC<CornellNotebookProps> = ({
  initialAutor,
  initialObra,
  initialEixo,
  onShowToast,
}) => {
  const [notesList, setNotesList] = useState<CornellAnotacao[]>(() =>
    oficinaEstudosService.getCornellNotes()
  );
  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    const list = oficinaEstudosService.getCornellNotes();
    return list.length > 0 ? list[0].id : null;
  });

  // Campos do formulário ativo
  const [obraTitulo, setObraTitulo] = useState<string>(initialObra || '');
  const [autorNome, setAutorNome] = useState<string>(initialAutor || '');
  const [paginaReferencia, setPaginaReferencia] = useState<string>('');
  const [eixoTematico, setEixoTematico] = useState<EixoTematicoId>(initialEixo || 'teorico');
  const [cuesText, setCuesText] = useState<string>('');
  const [notesText, setNotesText] = useState<string>('');
  const [summaryText, setSummaryText] = useState<string>('');
  const [tagsText, setTagsText] = useState<string>('');

  const [searchFilter, setSearchFilter] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sincroniza se vierem props iniciais de atalho (ex: do SprintManager)
  useEffect(() => {
    if (initialObra || initialAutor) {
      setObraTitulo(initialObra || '');
      setAutorNome(initialAutor || '');
      if (initialEixo) setEixoTematico(initialEixo);
      setActiveNoteId(null); // Modo de nova anotação
    }
  }, [initialObra, initialAutor, initialEixo]);

  // Carrega nota selecionada no formulário
  useEffect(() => {
    if (activeNoteId) {
      const found = notesList.find((n) => n.id === activeNoteId);
      if (found) {
        setObraTitulo(found.obra_titulo);
        setAutorNome(found.autor_nome);
        setPaginaReferencia(found.pagina_referencia);
        setEixoTematico(found.eixo_tematico);
        setCuesText(found.cues);
        setNotesText(found.notes);
        setSummaryText(found.summary);
        setTagsText(found.tags.join(', '));
      }
    }
  }, [activeNoteId, notesList]);

  const handleSelectPreloadedBook = (idx: number) => {
    const b = SUGESTOES_OBRAS[idx];
    if (b) {
      setAutorNome(b.autor);
      setObraTitulo(b.obra);
      setEixoTematico(b.eixo);
      onShowToast(`Texto selecionado: "${b.obra}"`);
    }
  };

  const handleSave = () => {
    if (!obraTitulo.trim() || !autorNome.trim()) {
      onShowToast('Informe ao menos o Título da Obra e o Autor.');
      return;
    }

    const tagsArray = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const saved = oficinaEstudosService.saveCornellNote({
      id: activeNoteId || undefined,
      obra_titulo: obraTitulo,
      autor_nome: autorNome,
      pagina_referencia: paginaReferencia,
      eixo_tematico: eixoTematico,
      cues: cuesText,
      notes: notesText,
      summary: summaryText,
      tags: tagsArray.length > 0 ? tagsArray : ['Metacognição', 'TCC'],
    });

    setNotesList(saved);
    if (!activeNoteId && saved.length > 0) {
      setActiveNoteId(saved[0].id);
    }
    onShowToast('✓ Folha Cornell salva com sucesso!');
  };

  const handleCreateNew = () => {
    setActiveNoteId(null);
    setObraTitulo('');
    setAutorNome('');
    setPaginaReferencia('');
    setCuesText('');
    setNotesText('');
    setSummaryText('');
    setTagsText('TCC, Metacognição');
    onShowToast('Nova folha Cornell em branco iniciada.');
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover esta folha de estudo Cornell?')) {
      const updated = oficinaEstudosService.deleteCornellNote(id);
      setNotesList(updated);
      if (activeNoteId === id) {
        if (updated.length > 0) {
          setActiveNoteId(updated[0].id);
        } else {
          handleCreateNew();
        }
      }
      onShowToast('Folha Cornell excluída.');
    }
  };

  const handleExportMarkdown = () => {
    const currentNote: CornellAnotacao = {
      id: activeNoteId || 'temp',
      obra_titulo: obraTitulo || 'Sem Título',
      autor_nome: autorNome || 'Autor',
      pagina_referencia: paginaReferencia,
      eixo_tematico: eixoTematico,
      cues: cuesText,
      notes: notesText,
      summary: summaryText,
      tags: tagsText.split(',').map((t) => t.trim()),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const md = oficinaEstudosService.exportCornellMarkdown(currentNote);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cornell_${autorNome.replace(/\s+/g, '_')}_${paginaReferencia || 'Notas'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Arquivo Markdown (.md) baixado!');
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const filteredNotes = notesList.filter((n) => {
    const q = searchFilter.toLowerCase();
    return (
      n.obra_titulo.toLowerCase().includes(q) ||
      n.autor_nome.toLowerCase().includes(q) ||
      n.notes.toLowerCase().includes(q) ||
      n.cues.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. BARRA SUPERIOR: CONTROLES, SELETOR DE TEXTO E AÇÕES */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
              Metacognição Ativa • Padrão Walter Pauk
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              Caderno Digital Cornell do Concluinte
            </h3>
            <p className="text-xs text-slate-400">
              Processe leituras densas estruturando: 30% pistas socráticas, 70% notas reflexivas e sumário executivo no rodapé.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleCreateNew}
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nova Folha</span>
            </Button>

            <Button
              onClick={handleSave}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Anotações</span>
            </Button>

            <Button
              onClick={handleExportMarkdown}
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Exportar (.md)</span>
            </Button>

            <Button
              onClick={handlePrintPdf}
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-purple-400" />
              <span>Imprimir / PDF</span>
            </Button>
          </div>
        </div>

        {/* METADADOS DA OBRA & SELETOR DE TEXTO RÁPIDO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Obra / Artigo / Livro
            </label>
            <input
              type="text"
              value={obraTitulo}
              onChange={(e) => setObraTitulo(e.target.value)}
              placeholder="Ex: Theory of Transactional Distance"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Autor(es) e Ano
            </label>
            <input
              type="text"
              value={autorNome}
              onChange={(e) => setAutorNome(e.target.value)}
              placeholder="Ex: MOORE, Michael G. (1993)"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Páginas / Intervalo Lido
            </label>
            <input
              type="text"
              value={paginaReferencia}
              onChange={(e) => setPaginaReferencia(e.target.value)}
              placeholder="Ex: p. 22-38"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Vincular Leitura Canônica (1 Clique)
            </label>
            <select
              onChange={(e) => {
                if (e.target.value !== '') {
                  handleSelectPreloadedBook(Number(e.target.value));
                }
              }}
              defaultValue=""
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:border-amber-400 focus:outline-none cursor-pointer"
            >
              <option value="" disabled>Selecione um autor do TCC...</option>
              {SUGESTOES_OBRAS.map((b, idx) => (
                <option key={idx} value={idx}>
                  {b.autor} — {b.obra.substring(0, 32)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. LAYOUT RIGOROSO DO CADERNO CORNELL (30% PISTAS | 70% NOTAS | 100% SUMÁRIO) */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* CORPO CENTRAL DO CORNELL EM DUAS COLUNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* COLUNA ESQUERDA (30%): PISTAS, TERMOS CHAVE & PERGUNTAS SOCRÁTICAS */}
          <div className="lg:col-span-3 space-y-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Pistas & Perguntas (30%)
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                Provocações
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Anote palavras-chave, conceitos vitais e perguntas reflexivas que confrontam a leitura.
            </p>

            <textarea
              value={cuesText}
              onChange={(e) => setCuesText(e.target.value)}
              placeholder={`• O que é Distância Transacional segundo Moore?\n• A tríade: Diálogo, Estrutura e Autonomia\n• Como o isolamento físico se difere do psicológico?\n• Aplicação direta no Koinonia LMS...`}
              rows={14}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed focus:border-amber-400 focus:outline-none resize-none"
            />
          </div>

          {/* COLUNA DIREITA (70%): NOTAS DE LEITURA, TÓPICOS E CITAÇÕES DIRETAS */}
          <div className="lg:col-span-7 space-y-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Notas de Leitura & Citações (70%)
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                Fichamento Analítico
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Registre sínteses com suas próprias palavras, esquemas, citações textuais indicando número de página.
            </p>

            <textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder={`1. CONCEITO FUNDAMENTAL DO AUTOR:\n- A distância no ensino não é meramente física ou métrica, mas um espaço cognitivo e de comunicação.\n\n2. CITAÇÃO DIRETA COM PÁGINA:\n"A distância transacional é uma distância pedagógica..." (p. 22).\n\n3. IMPLICAÇÕES PARA A FORMAÇÃO TEOLÓGICA:\n- O ambiente virtual sem diálogo gera abandono; a tele-proximidade resgata a pastoral.`}
              rows={14}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs leading-relaxed focus:border-blue-400 focus:outline-none font-sans"
            />
          </div>
        </div>

        {/* FAIXA BASAL DO CORNELL (RODAPÉ 100% LARGURA): SUMÁRIO EXECUTIVO / TAKEAWAY TCC */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-950 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Sumário Executivo & Takeaway para o TCC (Síntese Autoral de 3 a 4 linhas)
            </span>
            <span className="text-[10px] font-bold text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full">
              Insumo Direto para a Monografia
            </span>
          </div>

          <textarea
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            placeholder="Escreva em 3 a 4 linhas: Qual é a conclusão inegociável deste texto e como você vai utilizá-lo na argumentação do seu TCC? (Ex: A Teoria de Moore demonstra que o Koinonia LMS supera o isolamento cognitivo através do diálogo síncrono frequente...)"
            rows={3}
            className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-amber-200 text-xs leading-relaxed focus:border-amber-400 focus:outline-none"
          />

          <div className="flex items-center gap-2 pt-1">
            <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Tags separadas por vírgula (ex: MichaelMoore, DistanciaTransacional, CapituloII)"
              className="flex-1 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. HISTÓRICO DE FOLHAS SALVAS NO REPOSITÓRIO LOCAL */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h4 className="font-black text-white text-base">
              Repositório de Fichamentos Cornell ({filteredNotes.length})
            </h4>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar autor, obra, tags..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const isCurrent = note.id === activeNoteId;
            return (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isCurrent
                    ? 'bg-slate-950 border-amber-400/60 shadow-lg shadow-amber-950/20'
                    : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700">
                      {note.eixo_tematico}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(note.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <h5 className="font-black text-white text-sm line-clamp-1">
                    {note.obra_titulo}
                  </h5>
                  <p className="text-xs text-slate-400 font-medium line-clamp-1">
                    {note.autor_nome} {note.pagina_referencia && `(${note.pagina_referencia})`}
                  </p>

                  <p className="text-xs text-slate-300/80 line-clamp-2 mt-2 italic bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                    "{note.summary || note.notes.substring(0, 100)}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-1 flex-wrap">
                    {note.tags.slice(0, 2).map((t, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNoteId(note.id);
                      }}
                      className="p-1 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Editar anotação"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Excluir folha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
