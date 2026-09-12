'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  BookOpen, 
  CheckSquare, 
  FileText, 
  X, 
  ChevronRight,
  HeartHandshake,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { APP_VERSION, CURRENT_RELEASE_NOTES, hasNewVersion } from '@/config/appVersion';

interface WhatsNewModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function WhatsNewModal({ forceOpen = false, onClose }: WhatsNewModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 1. Se forceOpen for true, abre direto
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    // 2. Checa versão salva no localStorage
    try {
      const lastSeen = localStorage.getItem('lms_last_seen_version');
      if (hasNewVersion(lastSeen)) {
        // Pequeno delay de 1.2s para a página terminar de carregar antes de exibir
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('Erro ao verificar versão no WhatsNewModal:', e);
    }
  }, [forceOpen]);

  // Listener para abertura sob demanda (ex: clicando em "Novidades da Versão" no Perfil/Menu)
  useEffect(() => {
    const handleOpenEvent = () => setIsOpen(true);
    window.addEventListener('lms_open_whats_new', handleOpenEvent);
    return () => window.removeEventListener('lms_open_whats_new', handleOpenEvent);
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem('lms_last_seen_version', APP_VERSION);
    } catch (e) {}
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  const getCategoryIcon = (category: string, id: string) => {
    if (id === 'blindagem-dados' || category === 'seguranca') {
      return <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
    }
    if (id === 'chat-nao-perturbe') {
      return <MessageSquare className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
    }
    if (id === 'compartilhar-livro') {
      return <BookOpen className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
    }
    if (id === 'checklist-whatsapp') {
      return <CheckSquare className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
    }
    return <FileText className="w-5 h-5 text-violet-500 dark:text-violet-400" />;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
      >
        {/* Botão de Fechar no topo */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
          aria-label="Fechar novidades"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Topo Estilo Apple / Hero */}
        <div className="px-6 pt-8 pb-4 text-center border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent dark:from-blue-950/20">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 mb-4 ring-4 ring-blue-100 dark:ring-blue-900/40">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold tracking-wide uppercase mb-2">
            <span>Atualização do Sistema</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
          </div>

          <h2 
            id="whats-new-title" 
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            O que há de novo no LMS
          </h2>

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {CURRENT_RELEASE_NOTES.versionName} • {CURRENT_RELEASE_NOTES.date}
          </p>

          {/* Faixa de Blindagem e Garantia de Dados */}
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-left flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
              <span className="font-semibold block mb-0.5">Blindagem de Dados Ativa</span>
              Suas anotações do Caderno Cornell, checklists e registros de presença estão 100% preservados e salvos em nuvem e no dispositivo.
            </div>
          </div>
        </div>

        {/* Lista de Novidades com Rolagem */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 divide-y divide-slate-100 dark:divide-slate-800/60">
          {CURRENT_RELEASE_NOTES.items.map((item, idx) => (
            <div key={item.id || idx} className={`flex items-start gap-3.5 ${idx > 0 ? 'pt-4' : ''}`}>
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 shrink-0 mt-0.5">
                {getCategoryIcon(item.category, item.id)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé com Botão Estilo Apple */}
        <div className="p-5 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-col gap-2">
          <button
            onClick={handleDismiss}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>Continuar Meus Estudos</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
            Você pode rever essas novidades a qualquer momento no seu perfil.
          </p>
        </div>
      </div>
    </div>
  );
}

export default WhatsNewModal;
