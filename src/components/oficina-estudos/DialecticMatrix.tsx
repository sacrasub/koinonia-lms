'use client';

import React, { useState } from 'react';
import {
  MatrizDialeticaItem,
  CapituloTcc
} from '@/types/oficinaEstudos';
import { oficinaEstudosService } from '@/services/oficinaEstudosService';
import {
  Scale,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  ArrowRightLeft,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DialecticMatrixProps {
  onShowToast: (msg: string) => void;
}

export const DialecticMatrix: React.FC<DialecticMatrixProps> = ({ onShowToast }) => {
  const [debates, setDebates] = useState<MatrizDialeticaItem[]>(() =>
    oficinaEstudosService.getMatrizDialetica()
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [autorA, setAutorA] = useState<string>('');
  const [autorB, setAutorB] = useState<string>('');
  const [temaDebate, setTemaDebate] = useState<string>('');
  const [convergencia, setConvergencia] = useState<string>('');
  const [tensao, setTensao] = useState<string>('');
  const [sintese, setSintese] = useState<string>('');
  const [capituloTcc, setCapituloTcc] = useState<CapituloTcc>('cap_2');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSaveDebate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!autorA.trim() || !autorB.trim() || !temaDebate.trim()) {
      onShowToast('Preencha os dois autores e o tema do debate.');
      return;
    }

    const saved = oficinaEstudosService.saveMatrizItem({
      autor_a: autorA,
      autor_b: autorB,
      tema_debate: temaDebate,
      ponto_convergencia: convergencia,
      ponto_tensao: tensao,
      sintese_pesquisador: sintese,
      capitulo_tcc: capituloTcc,
    });

    setDebates(saved);
    setIsModalOpen(false);
    // Reset formulário
    setAutorA('');
    setAutorB('');
    setTemaDebate('');
    setConvergencia('');
    setTensao('');
    setSintese('');
    onShowToast('✓ Novo debate dialético adicionado à Matriz!');
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este debate da Matriz Dialética?')) {
      const updated = oficinaEstudosService.deleteMatrizItem(id);
      setDebates(updated);
      onShowToast('Debate removido da Matriz.');
    }
  };

  const handleCopySintese = (item: MatrizDialeticaItem) => {
    const textoFormatado = `DEBATE DIALÉTICO: ${item.autor_a} vs. ${item.autor_b}\nTema: ${item.tema_debate}\n\nConvergência:\n${item.ponto_convergencia}\n\nTensão/Contraponto:\n${item.ponto_tensao}\n\nSíntese do Pesquisador (Revisão de Literatura):\n${item.sintese_pesquisador}`;
    navigator.clipboard.writeText(textoFormatado);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
    onShowToast('Síntese dialética copiada para a Revisão de Literatura!');
  };

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO DA MATRIZ */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Debate Hermenêutico & Revisão Crítica
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              Matriz Dialética de Autores e Correntes
            </h3>
            <p className="text-xs text-slate-400">
              Coloque autores em diálogo crítico: identifique convergências, exponha tensões e formule sua síntese autoral para o TCC.
            </p>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Novo Debate</span>
          </Button>
        </div>
      </div>

      {/* 2. LISTA DE QUADROS DIALÉTICOS */}
      <div className="space-y-6">
        {debates.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden"
          >
            {/* TOPO: AUTORES EM CONFRONTO */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-black text-xs shadow-inner">
                  {item.autor_a}
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-blue-300 font-black text-xs shadow-inner">
                  {item.autor_b}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {item.capitulo_tcc.toUpperCase().replace('_', ' ')}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                  title="Excluir debate"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TEMA DO DEBATE */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Problema de Pesquisa / Ponto de Tensão
              </span>
              <h4 className="text-base font-black text-white">
                {item.tema_debate}
              </h4>
            </div>

            {/* CONVERGÊNCIA VS TENSÃO (LADO A LADO) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PONTO DE CONVERGÊNCIA */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Ponto de Convergência (Acordo Teórico)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.ponto_convergencia}
                </p>
              </div>

              {/* PONTO DE TENSÃO */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Ponto de Tensão (Contraponto Crítico)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.ponto_tensao}
                </p>
              </div>
            </div>

            {/* SÍNTESE PESSOAL DO PESQUISADOR (DESTAQUE) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-950 to-slate-950 border border-amber-400/40 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    Síntese do Pesquisador (Insumo para a Revisão de Literatura)
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopySintese(item)}
                  className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Copiar Síntese para a Monografia</span>
                </Button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                "{item.sintese_pesquisador}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. MODAL PARA ADICIONAR NOVO DEBATE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <h4 className="font-black text-white text-base">
                  Nova Conexão Crítica na Matriz Dialética
                </h4>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDebate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Autor A (Tese / Corrente 1) *
                  </label>
                  <input
                    required
                    type="text"
                    value={autorA}
                    onChange={(e) => setAutorA(e.target.value)}
                    placeholder="Ex: Thomas Giulliano"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Autor B (Antítese / Corrente 2) *
                  </label>
                  <input
                    required
                    type="text"
                    value={autorB}
                    onChange={(e) => setAutorB(e.target.value)}
                    placeholder="Ex: Eliseu Roque do Espírito Santo"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tema Central / Questão em Disputa *
                </label>
                <input
                  required
                  type="text"
                  value={temaDebate}
                  onChange={(e) => setTemaDebate(e.target.value)}
                  placeholder="Ex: A presencialidade física é indispensável para a formação pastoral?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Ponto de Convergência (O que ambos admitem?)
                </label>
                <textarea
                  value={convergencia}
                  onChange={(e) => setConvergencia(e.target.value)}
                  placeholder="Ambos concordam que a formação passiva descaracteriza a vocação ministerial..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Ponto de Tensão / Contraponto Crítico
                </label>
                <textarea
                  value={tensao}
                  onChange={(e) => setTensao(e.target.value)}
                  placeholder="Giulliano foca no enclausuramento comunitário, enquanto Espírito Santo defende a comunhão pelo Espírito mediada tecnicamente..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Síntese Pessoal do Pesquisador (Revisão de Literatura)
                </label>
                <textarea
                  value={sintese}
                  onChange={(e) => setSintese(e.target.value)}
                  placeholder="Sua proposta de superação teórica que integrará a monografia..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-200 text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Capítulo Alvo no TCC
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
                  Salvar Debate na Matriz
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
