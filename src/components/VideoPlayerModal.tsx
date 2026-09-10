'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Video, 
  Lock, 
  ExternalLink, 
  Smartphone, 
  AlertCircle, 
  RefreshCw,
  FolderOpen,
  PlayCircle
} from 'lucide-react';
import { 
  getEmbedVideoUrl, 
  getNativeAppOrDirectLink, 
  isDirectVideoUrl,
  resolveVideoForAula,
  AFRO_BRASILEIRA_AULAS,
  AFRO_BRASILEIRA_DRIVE_FOLDER_URL,
  ModularAulaVideoItem
} from '@/lib/videoUtils';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  disciplinaName?: string;
  aulaNum?: number;
  videoUrl: string;
  allAulas?: { aulaNum?: number; title: string; videoUrl: string }[];
  folderUrl?: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  title: initialTitle,
  disciplinaName,
  aulaNum: initialAulaNum,
  videoUrl: initialVideoUrl,
  allAulas: initialAllAulas,
  folderUrl: initialFolderUrl,
}) => {
  const [activeUrl, setActiveUrl] = useState<string>(initialVideoUrl);
  const [activeTitle, setActiveTitle] = useState<string>(initialTitle);
  const [activeAulaNum, setActiveAulaNum] = useState<number | undefined>(initialAulaNum);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [hasIframeLoaded, setHasIframeLoaded] = useState<boolean>(false);

  React.useEffect(() => {
    setActiveUrl(initialVideoUrl);
    setActiveTitle(initialTitle);
    setActiveAulaNum(initialAulaNum);
    setIframeKey((prev) => prev + 1);
  }, [initialVideoUrl, initialTitle, initialAulaNum]);

  if (!isOpen || !activeUrl) return null;

  // Resolve inteligentemente a URL caso seja uma pasta ou disciplina modular
  const resolved = resolveVideoForAula(activeUrl, activeAulaNum, disciplinaName);
  const effectiveUrl = resolved.resolvedUrl;
  const isAfro = 
    (disciplinaName && (
      disciplinaName.toLowerCase().includes('afro') || 
      disciplinaName.toLowerCase().includes('indígena')
    )) ||
    activeUrl.includes('1mCp4ZCawhIekLJl3_bcoPiThAqwdzlty');

  const effectiveFolderUrl = initialFolderUrl || resolved.folderUrl || (isAfro ? AFRO_BRASILEIRA_DRIVE_FOLDER_URL : undefined);

  // Lista de aulas a exibir na barra superior: se for Afro-Brasileira e não tiver allAulas, gera as 4
  const computedAllAulas = (initialAllAulas && initialAllAulas.length > 1) 
    ? initialAllAulas 
    : isAfro 
      ? Object.values(AFRO_BRASILEIRA_AULAS).map((a: ModularAulaVideoItem) => ({
          aulaNum: a.aulaNum,
          title: a.title,
          videoUrl: a.videoUrl
        }))
      : undefined;

  const sourceType = resolved.sourceType;
  const isDirect = isDirectVideoUrl(effectiveUrl);
  const isFolder = resolved.isFolder || sourceType === 'drive_folder';
  const embedUrl = !isFolder ? getEmbedVideoUrl(effectiveUrl, activeAulaNum) : '';
  const directLink = getNativeAppOrDirectLink(effectiveUrl, activeAulaNum);
  const isGoogleDrive = sourceType === 'drive' || (!isDirect && effectiveUrl.includes('drive.google.com'));
  const isYouTube = sourceType === 'youtube';

  const handleReloadIframe = () => {
    setHasIframeLoaded(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleSelectAula = (aulaNumTarget?: number, titleTarget?: string, urlTarget?: string) => {
    if (aulaNumTarget && isAfro && AFRO_BRASILEIRA_AULAS[aulaNumTarget]) {
      const item = AFRO_BRASILEIRA_AULAS[aulaNumTarget];
      setActiveUrl(item.videoUrl);
      setActiveTitle(item.title);
      setActiveAulaNum(item.aulaNum);
    } else if (urlTarget) {
      setActiveUrl(urlTarget);
      if (titleTarget) setActiveTitle(titleTarget);
      if (aulaNumTarget) setActiveAulaNum(aulaNumTarget);
    }
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
              {activeAulaNum !== undefined && activeAulaNum > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                  Aula {activeAulaNum}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                <Lock className="w-2.5 h-2.5" /> LMS Koinonia
              </span>
            </div>
            
            <h3 className="text-white font-extrabold text-xs sm:text-sm md:text-base line-clamp-1 pt-0.5">
              {activeTitle}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Botão de Atalho para a Pasta da Disciplina */}
            {effectiveFolderUrl && (
              <a
                href={effectiveFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-[11px] sm:text-xs items-center gap-1.5 border border-slate-700 shadow-sm transition active:scale-95 cursor-pointer"
                title="Abrir Pasta Completa no Google Drive"
              >
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Pasta Oficial</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

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

        {/* Barra de seleção rápida de Aulas do Módulo */}
        {computedAllAulas && computedAllAulas.length > 1 && (
          <div className="flex items-center gap-2 px-3.5 sm:px-5 py-2 bg-slate-900/90 border-b border-slate-800 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Aulas do Módulo:</span>
            <div className="flex items-center gap-1.5">
              {computedAllAulas.map((aula) => (
                <button
                  key={aula.aulaNum}
                  type="button"
                  onClick={() => handleSelectAula(aula.aulaNum, aula.title, aula.videoUrl)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 whitespace-nowrap active:scale-95 ${
                    activeAulaNum === aula.aulaNum
                      ? 'bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Video className="w-3 h-3" />
                  <span>Aula {aula.aulaNum}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Área Central de Reprodução do Vídeo Otimizada para Celular & Desktop */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden select-none">
          {isFolder ? (
            /* HUB INSTITUCIONAL PARA PASTA DO GOOGLE DRIVE */
            <div className="p-6 text-center max-w-lg mx-auto flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mb-4">
                <FolderOpen className="w-8 h-8 text-amber-400" />
              </div>
              <h4 className="text-white font-extrabold text-base sm:text-lg mb-2">
                Pasta de Videoaulas e Materiais
              </h4>
              <p className="text-slate-300 text-xs sm:text-sm mb-5 leading-relaxed">
                As aulas gravadas e materiais desta disciplina foram organizados pelo professor em uma pasta do Google Drive.
              </p>

              {/* Botões das Aulas Rápidas se for Afro-Brasileira */}
              {isAfro && (
                <div className="w-full grid grid-cols-2 gap-2 mb-5">
                  {Object.values(AFRO_BRASILEIRA_AULAS).map((item: ModularAulaVideoItem) => (
                    <button
                      key={item.aulaNum}
                      type="button"
                      onClick={() => handleSelectAula(item.aulaNum, item.title, item.videoUrl)}
                      className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-left transition cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs font-extrabold text-amber-400 mb-0.5">
                        <span>Aula {item.aulaNum}</span>
                        <PlayCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition" />
                      </div>
                      <div className="text-[11px] text-slate-300 font-semibold truncate">{item.sizeFormatted}</div>
                    </button>
                  ))}
                </div>
              )}

              <a
                href={effectiveFolderUrl || directLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Abrir Pasta Completa no Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : isDirect ? (
            <video
              src={effectiveUrl}
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
              title={activeTitle}
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

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            <button
              onClick={handleReloadIframe}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition cursor-pointer"
              title="Recarregar player"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Recarregar</span>
            </button>

            {effectiveFolderUrl && (
              <a
                href={effectiveFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:hidden text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition underline underline-offset-2"
              >
                <FolderOpen className="w-3 h-3" />
                <span>Pasta Oficial</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

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

        {/* Dica para Navegadores Móveis com Bloqueio de Cookies e Fallback Rápido */}
        {isGoogleDrive && !isFolder && (
          <div className="px-3.5 py-2 sm:px-5 sm:py-2.5 bg-blue-950/60 border-t border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] sm:text-[11px] text-blue-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>
                <strong>Apareceu &quot;Nenhuma visualização disponível&quot;?</strong> O navegador pode bloquear cookies em players embutidos.
              </span>
            </div>
            <a
              href={directLink}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-black flex items-center gap-1 shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
            >
              <span>Assistir no Google Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
