'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Bell, CheckCheck, Sparkles, Tag, Calendar, ExternalLink, 
  Check, ArrowRight, ShieldCheck, Zap, Layers, RefreshCw
} from 'lucide-react';
import { SystemUpdate } from '@/types';
import { 
  getSystemUpdates, 
  getReadUpdateIds, 
  markAllUpdatesAsRead, 
  markUpdateAsRead 
} from '@/services/systemUpdatesService';

interface SystemUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export const SystemUpdatesModal: React.FC<SystemUpdatesModalProps> = ({
  isOpen,
  onClose,
  userEmail,
}) => {
  const [updates, setUpdates] = useState<SystemUpdate[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const normalizedEmail = (userEmail || '').toLowerCase().trim();

  const loadData = () => {
    setUpdates(getSystemUpdates());
    if (normalizedEmail) {
      setReadIds(getReadUpdateIds(normalizedEmail));
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }

    const handleUpdatesUpdated = (e: any) => {
      if (e?.detail) setUpdates(e.detail);
      else setUpdates(getSystemUpdates());
    };

    const handleReadUpdated = (e: any) => {
      if (e?.detail && e.detail.email === normalizedEmail) {
        setReadIds(e.detail.readIds);
      } else {
        setReadIds(getReadUpdateIds(normalizedEmail));
      }
    };

    window.addEventListener('lms_system_updates_updated', handleUpdatesUpdated);
    window.addEventListener('lms_read_updates_updated', handleReadUpdated);

    return () => {
      window.removeEventListener('lms_system_updates_updated', handleUpdatesUpdated);
      window.removeEventListener('lms_read_updates_updated', handleReadUpdated);
    };
  }, [isOpen, normalizedEmail]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    if (normalizedEmail) {
      markAllUpdatesAsRead(normalizedEmail);
      setReadIds(updates.map((u) => u.id));
    }
  };

  const handleSelectUpdate = (u: SystemUpdate) => {
    if (normalizedEmail && !readIds.includes(u.id)) {
      markUpdateAsRead(normalizedEmail, u.id);
    }
  };

  const filteredUpdates = updates.filter((u) => {
    if (filterCategory === 'ALL') return true;
    return u.category === filterCategory;
  });

  const unreadCount = updates.filter((u) => !readIds.includes(u.id)).length;

  const getCategoryBadge = (category: SystemUpdate['category']) => {
    switch (category) {
      case 'novidade':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-100 text-cyan-900 border border-cyan-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-600" /> Novidade
          </span>
        );
      case 'melhoria':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-600" /> Melhoria
          </span>
        );
      case 'correcao':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-amber-600" /> Correção
          </span>
        );
      case 'comunicado':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-purple-600" /> Comunicado
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        
        {/* Cabeçalho */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shrink-0">
              <Bell className="w-6 h-6 animate-swing" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Atualizações & Novidades do LMS
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-black animate-pulse">
                    {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200/90 mt-0.5">
                Acompanhe os lançamentos, recursos e melhorias do Seminário Teológico Koinonia
              </p>
            </div>
          </div>

          {/* Barra de Filtros e Ação "Marcar todas como lidas" */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setFilterCategory('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterCategory === 'ALL'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'bg-white/10 text-white/90 hover:bg-white/20'
                }`}
              >
                Todas ({updates.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('novidade')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterCategory === 'novidade'
                    ? 'bg-cyan-400 text-slate-950 font-black'
                    : 'bg-white/10 text-white/90 hover:bg-white/20'
                }`}
              >
                ✨ Novidades
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('melhoria')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterCategory === 'melhoria'
                    ? 'bg-emerald-400 text-slate-950 font-black'
                    : 'bg-white/10 text-white/90 hover:bg-white/20'
                }`}
              >
                ⚡ Melhorias
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory('comunicado')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterCategory === 'comunicado'
                    ? 'bg-purple-400 text-slate-950 font-black'
                    : 'bg-white/10 text-white/90 hover:bg-white/20'
                }`}
              >
                📢 Comunicados
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-cyan-300 hover:text-cyan-100 flex items-center gap-1 transition cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Marcar todas como lidas</span>
              </button>
            )}
          </div>
        </div>

        {/* Lista de Atualizações */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/60">
          {filteredUpdates.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold bg-white rounded-2xl border border-slate-200">
              Nenhuma atualização encontrada para esta categoria.
            </div>
          ) : (
            filteredUpdates.map((u) => {
              const isUnread = !readIds.includes(u.id);

              return (
                <div
                  key={u.id}
                  onClick={() => handleSelectUpdate(u)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white relative ${
                    isUnread
                      ? 'border-blue-300 shadow-md ring-2 ring-blue-400/20'
                      : 'border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  {/* Indicador de Não Lido */}
                  {isUnread && (
                    <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                    </span>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getCategoryBadge(u.category)}
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-black">
                        {u.version}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{u.date}</span>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                    {u.title}
                  </h4>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {u.description}
                  </p>

                  {/* Destaques da Versão */}
                  {u.highlights && u.highlights.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        O que mudou nesta versão:
                      </div>
                      <ul className="space-y-1">
                        {u.highlights.map((h, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5 leading-tight">
                            <span className="text-blue-600 font-bold shrink-0">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Autor / Rodapé do Card */}
                  {u.author && (
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Publicado por: <strong className="text-slate-600">{u.author}</strong></span>
                      {isUnread && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Não lido
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="text-[11px] text-slate-500 font-medium">
            Koinonia LMS • Versão 2026.2
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
