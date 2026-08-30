'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Video, Lock, ExternalLink, Smartphone, AlertCircle, RefreshCw } from 'lucide-react';
import { 
  extractDriveFileId, 
  getEmbedVideoUrl, 
  getNativeAppOrDirectLink, 
  getVideoSourceType, 
  isDirectVideoUrl 
} from '@/lib/videoUtils';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  disciplinaName?: string;
  aulaNum?: number;
  videoUrl: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  title,
  disciplinaName,
  aulaNum,
  videoUrl,
}) => {
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [hasIframeLoaded, setHasIframeLoaded] = useState<boolean>(false);

  if (!isOpen || !videoUrl) return null;

  const sourceType = getVideoSourceType(videoUrl);
  const isDirect = isDirectVideoUrl(videoUrl);
  const embedUrl = getEmbedVideoUrl(videoUrl);
  const directLink = getNativeAppOrDirectLink(videoUrl);
  const isGoogleDrive = sourceType === 'drive';
  const isYouTube = sourceType === 'youtube';

  const handleReloadIframe = () => {
    setHasIframeLoaded(false);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-950 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col max-h-[96vh]">
        
        {/* Cabeçalho do Player */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {disciplinaName && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                  <Video className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="truncate max-w-[150px] sm:max-w-none">{disciplinaName}</span>
                </span>
              )}
              {aulaNum !== undefined && aulaNum > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                  Aula {aulaNum}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                <Lock className="w-2.5 h-2.5" /> LMS Koinonia
              </span>
            </div>
            
            <h3 className="text-white font-extrabold text-xs sm:text-sm md:text-base line-clamp-1 pt-0.5">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Botão de Abertura Direta no App do Celular / Nova Guia */}
            {directLink && (
              <a
                href={directLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                title="Abrir no Google Drive ou App do Celular"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">
                  {isGoogleDrive ? 'Abrir no Drive' : isYouTube ? 'Abrir no YouTube' : 'Abrir Vídeo'}
                </span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center text-sm transition shrink-0 cursor-pointer"
              title="Fechar player"
              aria-label="Fechar player de vídeo"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Área Central de Reprodução do Vídeo Otimizada para Celular & Desktop */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden select-none">
          {isDirect ? (
            <video
              src={videoUrl}
              controls
              playsInline
              webkit-playsinline="true"
              preload="metadata"
              controlsList="nodownload noplaybackrate"
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-full object-contain"
            />
          ) : (
            <iframe
              key={iframeKey}
              src={embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              onLoad={() => setHasIframeLoaded(true)}
            />
          )}
        </div>

        {/* Barra de Ajuda e Fallback para Dispositivos Móveis */}
        <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 bg-slate-900/95 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-slate-400">
          
          <div className="flex items-center gap-2 text-slate-300 text-[11px] sm:text-xs leading-tight">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              Ambiente Institucional Seguro • {isGoogleDrive ? 'Transmissão Google Drive' : isYouTube ? 'Transmissão YouTube' : 'Vídeo HD'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={handleReloadIframe}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition cursor-pointer"
              title="Recarregar player"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Recarregar</span>
            </button>

            {directLink && (
              <a
                href={directLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition underline underline-offset-2"
              >
                <span>Assistir no App do Celular</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Dica para Navegadores Móveis com Bloqueio de Cookies */}
        {isGoogleDrive && (
          <div className="px-3.5 py-1.5 sm:px-5 sm:py-2 bg-blue-950/40 border-t border-blue-900/30 flex items-center gap-2 text-[10px] sm:text-[11px] text-blue-300/90">
            <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>
              <strong>Dica no Celular:</strong> Se a tela ficar preta ou solicitar login devido à segurança do navegador, clique em <strong>"Abrir no Drive"</strong> para reproduzir no aplicativo.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
