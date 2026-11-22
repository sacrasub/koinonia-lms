'use client';

import React, { useState } from 'react';
import { Sparkles, X, Loader2, AlertTriangle, Check, Wand2, Copy } from 'lucide-react';

export type AbntAiSectionAction = 'draft_section' | 'rewrite_impersonal' | 'expand_theological';

interface AbntAiAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  disciplinaName: string;
  sectionTitle: string;
  currentText: string;
  restrictAiNotice?: boolean;
  onInsertNewParagraph: (text: string) => void;
  onReplaceCurrent: (text: string) => void;
}

export const AbntAiAssistModal: React.FC<AbntAiAssistModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  disciplinaName,
  sectionTitle,
  currentText,
  restrictAiNotice,
  onInsertNewParagraph,
  onReplaceCurrent,
}) => {
  const [action, setAction] = useState<AbntAiSectionAction>(
    currentText.trim().length > 25 ? 'rewrite_impersonal' : 'draft_section'
  );
  const [userNotes, setUserNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultText, setResultText] = useState('');
  const [resultNotes, setResultNotes] = useState('');
  const [usedProvider, setUsedProvider] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/abnt-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          title,
          subtitle,
          disciplinaName,
          sectionTitle,
          currentText,
          userNotes,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Não foi possível gerar a sugestão.');
      }
      setResultText(json.data?.text || '');
      setResultNotes(json.data?.notes || '');
      setUsedProvider(json.usedProvider || 'native');
    } catch (err: any) {
      setError(err?.message || 'Erro ao comunicar com o assistente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5" />
            <div>
              <h3 className="text-sm font-black">Assistente de Redação ABNT</h3>
              <p className="text-[11px] text-indigo-100 truncate max-w-md">
                Seção: {sectionTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto modal-scroll space-y-4">
          {restrictAiNotice && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Aviso de Ética Acadêmica:</strong> Algumas disciplinas (como TCC I e Direitos Humanos) proíbem redação gerada por IA. Utilize este recurso apenas como apoio de revisão formal e impessoalidade da sua própria autoria.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'draft_section', label: 'Rascunhar Seção', desc: 'A partir dos seus tópicos' },
              { id: 'rewrite_impersonal', label: 'Corrigir 3ª Pessoa', desc: 'Impessoalidade ABNT' },
              { id: 'expand_theological', label: 'Aprofundar Texto', desc: 'Coesão e rigor acadêmico' },
            ].map((opt) => {
              const active = action === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAction(opt.id as AbntAiSectionAction)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    active
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-xs font-extrabold">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{opt.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Seus tópicos, versículos, autores ou instruções para esta seção
            </label>
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              rows={3}
              placeholder="Ex.: Abordar Ef 4:11-16, comparar abordagem de Silvio Almeida com Esau McCaulley e concluir com aplicação para liderança local..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {currentText.trim() && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Texto atual detectado ({currentText.trim().length} caracteres) será considerado como base.
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            className="w-full py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando no padrão ABNT...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Gerar Sugestão Acadêmica</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {resultText && (
            <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                  Sugestão gerada ({usedProvider})
                </span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(resultText)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar</span>
                </button>
              </div>
              <textarea
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                rows={7}
                className="w-full rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-slate-800 px-3.5 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {resultNotes && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  {resultNotes}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onInsertNewParagraph(resultText);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Inserir como Novo Parágrafo</span>
                </button>
                {currentText.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onReplaceCurrent(resultText);
                      onClose();
                    }}
                    className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                  >
                    Substituir Texto Atual
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
