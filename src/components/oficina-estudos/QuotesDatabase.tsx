'use client';

import React, { useState, useMemo } from 'react';
import {
  CitacaoABNT,
  CapituloTcc,
  EixoTematicoId
} from '@/types/oficinaEstudos';
import { oficinaEstudosService } from '@/services/oficinaEstudosService';
import {
  Quote,
  Copy,
  Check,
  Plus,
  Trash2,
  Filter,
  Search,
  BookMarked,
  Tag,
  Layers,
  Sparkles,
  Award,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuotesDatabaseProps {
  onShowToast: (msg: string) => void;
}

const CAPITULOS_TCC_LABELS: Record<CapituloTcc, { titulo: string; desc: string; badgeColor: string }> = {
  cap_1: {
    titulo: 'Capítulo I • O Seminário Clássico e a Crise do Internato',
    desc: 'Historiografia, transição para EaD e contingências socioeconômicas',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30'
  },
  cap_2: {
    titulo: 'Capítulo II • A Distância Transacional de Michael Moore',
    desc: 'Diálogo, estrutura pedagógica, autonomia andragógica e mediação síncrona',
    badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/30'
  },
  cap_3: {
    titulo: 'Capítulo III • Eclesiologia e Koinonia no Ciberespaço',
    desc: 'Comunhão neotestamentária, Atos 2:42, mutualidade cristã e pastoral digital',
    badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/30'
  },
  cap_4: {
    titulo: 'Capítulo IV • Tele-Proximidade e Metodologias Ativas no LMS',
    desc: 'Monitoria, Caderno Cornell, simulador RPG, mural de oração e análise empírica',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
  },
};

export const QuotesDatabase: React.FC<QuotesDatabaseProps> = ({ onShowToast }) => {
  const [citacoes, setCitacoes] = useState<CitacaoABNT[]>(() =>
    oficinaEstudosService.getCitacoes()
  );

  // Estados do Modal / Formulário de Nova Citação
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [textoCitacao, setTextoCitacao] = useState<string>('');
  const [autores, setAutores] = useState<string>('');
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [pagina, setPagina] = useState<string>('');
  const [referenciaCompleta, setReferenciaCompleta] = useState<string>('');
  const [driveUrl, setDriveUrl] = useState<string>('');
  const [capituloTcc, setCapituloTcc] = useState<CapituloTcc>('cap_2');
  const [eixoTematico, setEixoTematico] = useState<EixoTematicoId>('teorico');
  const [tagsInput, setTagsInput] = useState<string>('');

  // Filtros
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCapitulo, setSelectedCapitulo] = useState<string>('all');
  const [selectedEixo, setSelectedEixo] = useState<string>('all');

  // Estado de feedback de cópia
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Contadores analíticos
  const totalCount = citacoes.length;
  const countByCap = useMemo(() => {
    return {
      cap_1: citacoes.filter((c) => c.capitulo_tcc === 'cap_1').length,
      cap_2: citacoes.filter((c) => c.capitulo_tcc === 'cap_2').length,
      cap_3: citacoes.filter((c) => c.capitulo_tcc === 'cap_3').length,
      cap_4: citacoes.filter((c) => c.capitulo_tcc === 'cap_4').length,
    };
  }, [citacoes]);

  // Lista filtrada
  const filteredCitacoes = useMemo(() => {
    return citacoes.filter((c) => {
      const matchCap = selectedCapitulo === 'all' || c.capitulo_tcc === selectedCapitulo;
      const matchEixo = selectedEixo === 'all' || c.eixo_tematico === selectedEixo;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        c.texto_citacao.toLowerCase().includes(q) ||
        c.autores.toLowerCase().includes(q) ||
        c.referencia_abnt_completa.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q));
      return matchCap && matchEixo && matchQuery;
    });
  }, [citacoes, selectedCapitulo, selectedEixo, searchQuery]);

  const handleSaveCitacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textoCitacao.trim() || !autores.trim()) {
      onShowToast('Preencha ao menos o texto da citação e os autores.');
      return;
    }

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const saved = oficinaEstudosService.saveCitacao({
      texto_citacao: textoCitacao,
      autores,
      ano: Number(ano) || new Date().getFullYear(),
      pagina,
      referencia_abnt_completa: referenciaCompleta,
      drive_url: driveUrl.trim() || undefined,
      capitulo_tcc: capituloTcc,
      eixo_tematico: eixoTematico,
      tags: tagsArray,
    });

    setCitacoes(saved);
    setIsModalOpen(false);
    // Limpa campos
    setTextoCitacao('');
    setAutores('');
    setPagina('');
    setReferenciaCompleta('');
    setDriveUrl('');
    setTagsInput('');
    onShowToast('✓ Citação ABNT catalogada com sucesso!');
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir esta citação catalogada?')) {
      const updated = oficinaEstudosService.deleteCitacao(id);
      setCitacoes(updated);
      onShowToast('Citação removida do banco.');
    }
  };

  const handleCopyInText = (cit: CitacaoABNT) => {
    const formatted = oficinaEstudosService.formatAbntInText(cit);
    navigator.clipboard.writeText(formatted);
    setCopiedId(`intext_${cit.id}`);
    setTimeout(() => setCopiedId(null), 2000);
    onShowToast(`Copiado em formato ABNT no texto: "${formatted}"`);
  };

  const handleCopyFull = (cit: CitacaoABNT) => {
    const inText = oficinaEstudosService.formatAbntInText(cit);
    const full = `"${cit.texto_citacao}" ${inText}\n\nReferência ABNT:\n${cit.referencia_abnt_completa}`;
    navigator.clipboard.writeText(full);
    setCopiedId(`full_${cit.id}`);
    setTimeout(() => setCopiedId(null), 2000);
    onShowToast('Citação + Referência ABNT completa copiadas para a área de transferência!');
  };

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO E CONTADORES POR CAPÍTULO DO TCC */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
              ABNT Hub • Citações Prontas para a Monografia
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              Banco de Dados de Citações & Fichamento Rápido
            </h3>
            <p className="text-xs text-slate-400">
              Copie citações textuais formatadas com 1 clique para colar no seu artigo científico ou monografia.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Nova Citação</span>
          </Button>
        </div>

        {/* CARDS DE DISTRIBUIÇÃO POR CAPÍTULO DO TCC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {(['cap_1', 'cap_2', 'cap_3', 'cap_4'] as CapituloTcc[]).map((cap) => {
            const isSelected = selectedCapitulo === cap;
            const count = countByCap[cap];
            const meta = CAPITULOS_TCC_LABELS[cap];

            return (
              <button
                key={cap}
                onClick={() => setSelectedCapitulo(isSelected ? 'all' : cap)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 border-amber-400/80 shadow-md shadow-amber-950/20'
                    : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${meta.badgeColor}`}>
                    {cap.toUpperCase().replace('_', ' ')}
                  </span>
                  <span className="text-xs font-black text-amber-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                    {count} {count === 1 ? 'citação' : 'citações'}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-white line-clamp-1">
                  {meta.titulo}
                </h5>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {meta.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. BARRA DE FILTROS & BUSCA */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por autor, texto ou palavra-chave..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={selectedCapitulo}
            onChange={(e) => setSelectedCapitulo(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:border-amber-400 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Capítulos</option>
            <option value="cap_1">Capítulo I (Histórico / Internato)</option>
            <option value="cap_2">Capítulo II (Distância Transacional)</option>
            <option value="cap_3">Capítulo III (Koinonia / Eclesiologia)</option>
            <option value="cap_4">Capítulo IV (Inovação / Práxis)</option>
          </select>

          <select
            value={selectedEixo}
            onChange={(e) => setSelectedEixo(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs focus:border-amber-400 focus:outline-none cursor-pointer"
          >
            <option value="all">Todos os Eixos Temáticos</option>
            <option value="historico">Eixo Histórico</option>
            <option value="teorico">Eixo Teórico-Pedagógico</option>
            <option value="eclesiologico">Eixo Eclesiológico</option>
            <option value="inovacao">Eixo Inovação</option>
          </select>
        </div>
      </div>

      {/* 3. LISTAGEM DAS CITAÇÕES */}
      <div className="space-y-4">
        {filteredCitacoes.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-6">
            <Quote className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">Nenhuma citação encontrada com os filtros atuais.</p>
            <p className="text-xs text-slate-500 mt-1">Clique em "Adicionar Nova Citação" para enriquecer seu acervo.</p>
          </div>
        ) : (
          filteredCitacoes.map((cit) => {
            const inTextCopy = oficinaEstudosService.formatAbntInText(cit);
            const capMeta = CAPITULOS_TCC_LABELS[cit.capitulo_tcc];

            return (
              <div
                key={cit.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xl transition-all space-y-4 group"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${capMeta.badgeColor}`}>
                      {cit.capitulo_tcc.toUpperCase().replace('_', ' ')}
                    </span>
                    <span className="text-xs font-black text-amber-300">
                      {cit.autores} ({cit.ano}{cit.pagina ? `, p. ${cit.pagina}` : ''})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* BOTÃO LINK PARA O PDF NO GOOGLE DRIVE */}
                    {cit.drive_url && (
                      <a
                        href={cit.drive_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all shadow-sm active:scale-95"
                        title="Abrir livro/artigo original no Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                        <span>Ver no Drive</span>
                      </a>
                    )}

                    {/* BOTÃO COPIAR FORMATO NO TEXTO */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyInText(cit)}
                      className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl flex items-center gap-1.5"
                      title="Copiar formato de citação no texto (ex: (AUTOR, 2026, p. 10))"
                    >
                      {copiedId === `intext_${cit.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{inTextCopy}</span>
                    </Button>

                    {/* BOTÃO COPIAR CITAÇÃO COMPLETA */}
                    <Button
                      size="sm"
                      onClick={() => handleCopyFull(cit)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                      title="Copiar texto da citação e a referência completa ABNT"
                    >
                      {copiedId === `full_${cit.id}` ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Quote className="w-3.5 h-3.5" />
                      )}
                      <span>Copiar em Formato ABNT</span>
                    </Button>

                    <button
                      onClick={() => handleDelete(cit.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="Excluir citação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* TEXTO DESTACADO DA CITAÇÃO */}
                <blockquote className="text-slate-200 text-sm leading-relaxed italic border-l-4 border-amber-400/80 pl-4 py-1 bg-slate-950/60 rounded-r-2xl pr-3">
                  "{cit.texto_citacao}"
                </blockquote>

                {/* REFERÊNCIA BIBLIOGRÁFICA COMPLETA */}
                {cit.referencia_abnt_completa && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400 leading-normal">
                    <strong className="text-slate-300">Referência ABNT: </strong>
                    {cit.referencia_abnt_completa}
                  </div>
                )}

                {/* TAGS */}
                {cit.tags && cit.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <Tag className="w-3 h-3 text-slate-500" />
                    {cit.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. MODAL DE CADASTRO DE NOVA CITAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Quote className="w-5 h-5 text-amber-400" />
                <h4 className="font-black text-white text-base">
                  Nova Citação ABNT para o TCC
                </h4>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCitacao} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Texto da Citação (Direta ou Paráfrase) *
                </label>
                <textarea
                  required
                  value={textoCitacao}
                  onChange={(e) => setTextoCitacao(e.target.value)}
                  placeholder="Cole aqui o trecho fiel do autor..."
                  rows={4}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Autor(es) no formato ABNT *
                  </label>
                  <input
                    required
                    type="text"
                    value={autores}
                    onChange={(e) => setAutores(e.target.value)}
                    placeholder="Ex: MOORE, Michael G."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Ano da Publicação
                  </label>
                  <input
                    type="number"
                    value={ano}
                    onChange={(e) => setAno(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Página da Citação
                  </label>
                  <input
                    type="text"
                    value={pagina}
                    onChange={(e) => setPagina(e.target.value)}
                    placeholder="Ex: 22 ou 45-48"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Referência Bibliográfica Completa (ABNT)
                </label>
                <textarea
                  value={referenciaCompleta}
                  onChange={(e) => setReferenciaCompleta(e.target.value)}
                  placeholder="Ex: MOORE, Michael G. Theory of transactional distance. In: KEEGAN, Desmond (org.)..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Capítulo de Destino no TCC
                  </label>
                  <select
                    value={capituloTcc}
                    onChange={(e) => setCapituloTcc(e.target.value as CapituloTcc)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-400 focus:outline-none"
                  >
                    <option value="cap_1">Capítulo I (Histórico / Internato)</option>
                    <option value="cap_2">Capítulo II (Distância Transacional)</option>
                    <option value="cap_3">Capítulo III (Koinonia / Eclesiologia)</option>
                    <option value="cap_4">Capítulo IV (Inovação / Práxis)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Eixo Temático
                  </label>
                  <select
                    value={eixoTematico}
                    onChange={(e) => setEixoTematico(e.target.value as EixoTematicoId)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-amber-400 focus:outline-none"
                  >
                    <option value="historico">Eixo Histórico</option>
                    <option value="teorico">Eixo Teórico-Pedagógico</option>
                    <option value="eclesiologico">Eixo Eclesiológico</option>
                    <option value="inovacao">Eixo Inovação</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Link do PDF no Google Drive (Opcional)
                </label>
                <input
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Ex: Distância Transacional, Diálogo, Michael Moore"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-slate-700 text-slate-300 text-xs rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl"
                >
                  Salvar Citação no Hub
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
