'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, ZoomIn, ZoomOut, RotateCcw, Moon, Sun, Download, 
  ExternalLink, Maximize2, Minimize2, FileText, Sparkles,
  Headphones, Info, CheckCircle2, BookOpen, Share2
} from 'lucide-react';

interface MobilePdfReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl: string;
  disciplinaName?: string;
  author?: string;
  description?: string;
  onShare?: () => void;
}

export const MobilePdfReaderModal: React.FC<MobilePdfReaderModalProps> = ({
  isOpen,
  onClose,
  title,
  pdfUrl,
  disciplinaName,
  author,
  description,
  onShare,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState<boolean>(false);
  const [showEdgeGuideModal, setShowEdgeGuideModal] = useState<boolean>(false);

  // Limpa estados ao fechar ou abrir o modal
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(100);
      setIsNightMode(false);
      setIsFullscreen(false);
      setShowInfoDrawer(false);
    }
  }, [isOpen]);

  if (!isOpen || !pdfUrl) return null;

  // Converte qualquer formato de URL do Google Drive para o visualizador oficial completo
  let embedUrl = pdfUrl.trim();
  let directOpenUrl = pdfUrl.trim();

  if (embedUrl.includes('drive.google.com') || embedUrl.includes('docs.google.com')) {
    const match = embedUrl.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/) ||
                  embedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      directOpenUrl = `https://drive.google.com/file/d/${match[1]}/view`;
    }
  } else if (/^[a-zA-Z0-9_-]{25,}$/.test(embedUrl) && !embedUrl.startsWith('http')) {
    embedUrl = `https://drive.google.com/file/d/${embedUrl}/preview`;
    directOpenUrl = `https://drive.google.com/file/d/${embedUrl}/view`;
  }

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 20, 80));
  const handleZoomReset = () => setZoomLevel(100);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleOpenForSpeech = () => {
    window.open(directOpenUrl, '_blank', 'noopener,noreferrer');
    setShowEdgeGuideModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-2 animate-in fade-in duration-200">
      
      <div 
        className={`w-full flex flex-col bg-slate-900 border border-slate-700 shadow-2xl transition-all duration-200 ${
          isFullscreen 
            ? 'h-full rounded-none' 
            : 'h-full sm:h-[95vh] sm:max-w-6xl sm:rounded-2xl overflow-hidden'
        }`}
      >
        {/* BARRA SUPERIOR DO LEITOR COM CONTROLES COMPLETOS */}
        <div className="px-3 sm:px-5 py-2.5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
          
          {/* Título da Obra e Autor */}
          <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
            <div className="p-2 rounded-xl bg-blue-900/60 text-blue-400 shrink-0 border border-blue-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">{title}</h3>
                {author && (
                  <span className="hidden md:inline text-[11px] text-slate-400 font-medium truncate">
                    • {author}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1.5">
                <span className="text-emerald-400 font-medium">● Documento Oficial Completo</span>
                <span>• Todas as folhas do arquivo original</span>
              </p>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO: OUVIR EM VOZ ALTA, INFORMAÇÕES E VISUALIZAÇÃO */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Ouvir no Edge / Navegador com Vozes Neurais (Ctrl+Shift+U) */}
            <button
              onClick={handleOpenForSpeech}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              title="Ouvir o PDF completo em voz alta com vozes neurais de alta fidelidade"
            >
              <Headphones className="w-3.5 h-3.5 text-sky-200" />
              <span className="hidden sm:inline">Ouvir em Voz Alta (Ctrl+Shift+U)</span>
            </button>

            {/* Informações da Obra / Ementa */}
            {(description || author || disciplinaName) && (
              <button
                onClick={() => setShowInfoDrawer(!showInfoDrawer)}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer border ${
                  showInfoDrawer 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
                title="Ver detalhes da ementa e descrição da obra"
              >
                <Info className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Sobre a Obra</span>
              </button>
            )}

            {/* Compartilhar Obra */}
            <button
              onClick={() => {
                if (onShare) {
                  onShare();
                } else if (typeof navigator !== 'undefined' && navigator.share) {
                  navigator.share({
                    title,
                    text: `Livro "${title}" no acervo do Seminário Koinonia`,
                    url: directOpenUrl,
                  }).catch(() => {});
                } else if (typeof navigator !== 'undefined') {
                  navigator.clipboard.writeText(directOpenUrl);
                }
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer border bg-blue-900/40 text-blue-300 hover:bg-blue-800/60 border-blue-500/30 active:scale-95"
              title="Compartilhar esta obra (WhatsApp, Link ou Citação)"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-0.5 bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 80}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomReset}
                className="px-1.5 text-[10px] font-mono text-slate-400 hover:text-white"
                title="Redefinir Zoom"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
                className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modo Noturno */}
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              className={`p-1.5 rounded-xl transition text-xs cursor-pointer border ${
                isNightMode 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
              }`}
              title="Alternar Modo Noturno (Inversão de alto contraste para leitura noturna)"
            >
              {isNightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Abrir diretamente no Google Drive Oficial */}
            <a
              href={directOpenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Abrir no visualizador oficial do Google Drive em nova aba (Autenticado com sua conta)"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Abrir no Drive</span>
              <span className="sm:hidden">Drive</span>
            </a>

            {/* Baixar Arquivo Original */}
            <a
              href={directOpenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition hidden md:flex items-center gap-1 shadow-sm"
              title="Baixar Arquivo Original"
            >
              <Download className="w-3.5 h-3.5" />
            </a>

            {/* Tela Cheia */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition hidden sm:flex cursor-pointer border border-slate-700"
              title="Alternar Tela Cheia"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Fechar */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition ml-1 cursor-pointer"
              title="Fechar Leitor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BANNER INFORMATIVO PARA CASO O NAVEGADOR BLOQUEIE COOKIES DE TERCEIROS NO IFRAME */}
        <div className="bg-slate-900/95 border-b border-slate-800 px-3 sm:px-5 py-2 flex items-center justify-between gap-3 text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
            <p className="truncate text-[11px] sm:text-xs text-slate-300">
              <strong className="text-white">Acesso do Seminário:</strong> Se o leitor exibir <span className="text-amber-300 font-semibold italic">&ldquo;Nenhuma visualização disponível&rdquo;</span> (bloqueio de cookies do navegador), acesse com sua conta autorizada:
            </p>
          </div>
          <a
            href={directOpenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-sm shrink-0 active:scale-95 transition"
          >
            <span>Abrir no Google Drive ↗</span>
          </a>
        </div>

        {/* ÁREA PRINCIPAL: VISUALIZADOR OFICIAL COM TODAS AS FOLHAS REAIS DO PDF */}
        <div className="flex-1 w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
          
          {/* Gaveta Lateral de Informações / Ementa da Obra */}
          {showInfoDrawer && (
            <div className="absolute top-0 right-0 z-30 w-full sm:w-96 h-full bg-slate-900/98 backdrop-blur-md border-l border-slate-800 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white">Sobre a Obra</h4>
                  </div>
                  <button
                    onClick={() => setShowInfoDrawer(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Título Oficial:</span>
                    <p className="font-semibold text-white mt-0.5 leading-snug">{title}</p>
                  </div>

                  {author && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Autor / Docente:</span>
                      <p className="font-medium text-emerald-400 mt-0.5">{author}</p>
                    </div>
                  )}

                  {disciplinaName && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Disciplina Vinculada:</span>
                      <p className="text-slate-300 mt-0.5">{disciplinaName}</p>
                    </div>
                  )}

                  {description && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Ementa / Observações:</span>
                      <p className="text-slate-300 mt-1 whitespace-pre-line leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        {description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleOpenForSpeech}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Headphones className="w-4 h-4" />
                  Ouvir em Voz Alta no Navegador
                </button>
              </div>
            </div>
          )}

          {/* IFRAME DO GOOGLE DRIVE COM TODAS AS FOLHAS DO LIVRO */}
          <div 
            className="w-full h-full transition-transform duration-150 origin-top flex items-center justify-center"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              filter: isNightMode ? 'invert(90%) hue-rotate(180deg)' : 'none',
            }}
          >
            <iframe
              src={embedUrl}
              className="w-full h-full border-0 bg-white"
              title={title}
              allow="autoplay"
            />
          </div>
        </div>

        {/* MODAL DE GUIA: COMO OUVIR EM VOZ ALTA COM VOZES NEURAIS */}
        {showEdgeGuideModal && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-sky-400" />
                  <h4 className="text-sm font-bold text-white">Como Ouvir o Livro em Voz Alta</h4>
                </div>
                <button
                  onClick={() => setShowEdgeGuideModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-200 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 text-blue-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    O PDF com todas as folhas foi aberto em uma nova aba!
                  </p>
                  <p>Para escutar com as vozes neurais ultra-realistas da Microsoft:</p>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="px-2 py-0.5 rounded bg-blue-600 font-mono font-bold text-white text-[11px]">1</span>
                    <div>
                      <p className="font-bold text-white">No Microsoft Edge (Recomendado):</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Pressione o atalho <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-mono font-bold">Ctrl + Shift + U</kbd> no teclado ou clique com o botão direito no PDF e escolha <strong>&ldquo;Ler em voz alta&rdquo;</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="px-2 py-0.5 rounded bg-indigo-600 font-mono font-bold text-white text-[11px]">2</span>
                    <div>
                      <p className="font-bold text-white">No Google Chrome:</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Ative o painel lateral de <strong>&ldquo;Modo de Leitura&rdquo;</strong> e clique no ícone de áudio.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-800">
                <button
                  onClick={() => setShowEdgeGuideModal(false)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition"
                >
                  Entendi, obrigado!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
