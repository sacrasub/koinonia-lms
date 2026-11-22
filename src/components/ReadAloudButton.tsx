'use client';

import React from 'react';
import { Loader2, Square, Volume2 } from 'lucide-react';
import { useVoiceStudio } from '@/contexts/VoiceStudioContext';

interface ReadAloudButtonProps {
  text: string;
  title: string;
  sourceId: string;
  label?: string;
  variant?: 'pill' | 'icon' | 'toolbar' | 'dark' | 'subtle';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({
  text,
  title,
  sourceId,
  label = 'Ouvir',
  variant = 'pill',
  size = 'xs',
  className = '',
}) => {
  const { activeSourceId, isSpeaking, isLoading, toggleSpeak } = useVoiceStudio();

  const isCurrent = activeSourceId === sourceId && (isSpeaking || isLoading);
  const isEmpty = !text || !text.trim();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isEmpty) return;
    void toggleSpeak({
      id: sourceId,
      title,
      text,
    });
  };

  const sizeClass =
    variant === 'icon'
      ? size === 'xs'
        ? 'p-1.5 rounded-lg text-xs'
        : 'p-2 rounded-xl text-xs'
      : size === 'xs'
      ? 'px-2.5 py-1 rounded-lg text-[11px] font-bold gap-1.5'
      : size === 'sm'
      ? 'px-3 py-1.5 rounded-xl text-xs font-bold gap-1.5'
      : 'px-4 py-2 rounded-xl text-xs font-extrabold gap-2';

  let variantClass = '';
  if (isCurrent) {
    variantClass =
      'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 shadow-sm ring-2 ring-rose-400/30';
  } else {
    switch (variant) {
      case 'dark':
        variantClass =
          'bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-100 border border-indigo-400/30 shadow-xs';
        break;
      case 'toolbar':
        variantClass =
          'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 shadow-xs';
        break;
      case 'subtle':
        variantClass =
          'bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700';
        break;
      case 'icon':
        variantClass =
          'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800';
        break;
      case 'pill':
      default:
        variantClass =
          'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs';
        break;
    }
  }

  const iconSize = size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isEmpty}
      aria-label={isCurrent ? `Parar leitura de ${title}` : `Ouvir em voz alta: ${title}`}
      title={
        isEmpty
          ? 'Sem texto para ler'
          : isCurrent
          ? 'Parar leitura em voz alta'
          : `Ouvir em voz alta: ${title}`
      }
      className={`inline-flex items-center justify-center transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${sizeClass} ${variantClass} ${className}`}
    >
      {isCurrent && isLoading ? (
        <>
          <Loader2 className={`${iconSize} animate-spin shrink-0`} />
          {variant !== 'icon' && <span>Gerando...</span>}
        </>
      ) : isCurrent ? (
        <>
          <Square className={`${iconSize} fill-current shrink-0`} />
          {variant !== 'icon' && <span>Parar</span>}
        </>
      ) : (
        <>
          <Volume2 className={`${iconSize} shrink-0`} />
          {variant !== 'icon' && <span>{label}</span>}
        </>
      )}
    </button>
  );
};
