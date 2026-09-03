'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, ZoomIn, ZoomOut, RotateCcw, Moon, Sun, Download, 
  ExternalLink, Maximize2, Minimize2, FileText, Sparkles 
} from 'lucide-react';

interface MobilePdfReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl: string;
  disciplinaName?: string;
}

export const MobilePdfReaderModal: React.FC<MobilePdfReaderModalProps> = ({
  isOpen,
  onClose,
  title,
  pdfUrl,
  disciplinaName,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setZoomLevel(100);
      setIsNightMode(false);
      setIsFullscreen(false);
    }
  }, [isOpen]);

  if (!isOpen || !pdfUrl) return null;

  // Transforma links do Google Drive para modo preview embeddable
  let embedUrl = pdfUrl;
  if (pdfUrl.includes('drive.google.com')) {
    const fileIdMatch = pdfUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      embedUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
  }

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));
  const handleZoomReset = () => setZoomLevel(100);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className={`w-full flex flex-col bg-slate-900 border border-slate-700 shadow-2xl transition-all duration-200 ${
          isFullscreen 
            ? 'h-full rounded-none' 
            : 'h-full sm:h-[92vh] sm:max-w-5xl sm:rounded-2xl overflow-hidden'
        }`}
      >
        {/* Cabeçalho do Leitor com Controles Rápidos */}
        <div className="px-3 sm:px-5 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
          
          {/* Título e Identificação */}
          <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-900/60 text-blue-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">{title}</h3>
                {disciplinaName && (
                  <span className="hidden md:inline text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {disciplinaName}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate">Leitor de PDF Embutido • Otimizado para Mobile</p>
            </div>
          </div>

          {/* Barra de Ferramentas: Zoom + Modo Noturno + Fechar */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Zoom Out */}
            <button
              onClick={handleZoomOut}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {/* Zoom Percentual / Reset */}
            <button
              onClick={handleZoomReset}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] font-bold transition hidden sm:inline"
              title="Restaurar Zoom (100%)"
            >
              {zoomLevel}%
            </button>

            {/* Zoom In */}
            <button
              onClick={handleZoomIn}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Modo Leitura Noturna (Inversão de Cores para Celular no Escuro) */}
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              className={`p-1.5 sm:p-2 rounded-lg transition text-xs flex items-center gap-1 ${
                isNightMode 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isNightMode ? 'Desativar Leitura Noturna' : 'Ativar Leitura Noturna (Conforto Visual)'}
            >
              {isNightMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span className="hidden xl:inline text-[10px] font-bold">Noturno</span>
            </button>

            {/* Tela Cheia */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition hidden sm:flex items-center"
              title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Download / Abrir Original Externo */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm shrink-0"
              title="Abrir no Google Drive ou Baixar"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Baixar</span>
            </a>

            {/* Fechar */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition ml-1 cursor-pointer"
              title="Fechar Leitor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Área do Documento com Zoom e Filtro Noturno */}
        <div className="flex-1 w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
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

        {/* Barra de Rodapé Mobile com Dica */}
        <div className="px-4 py-1.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Toque duas vezes para dar zoom ou use os botões da barra superior</span>
          </span>
          <span className="font-mono text-slate-500 hidden sm:inline">Koinonia LMS Reader</span>
        </div>
      </div>
    </div>
  );
};
