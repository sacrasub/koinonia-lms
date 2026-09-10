'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ZoomIn, ZoomOut, RotateCcw, Moon, Sun, Download, 
  ExternalLink, Maximize2, Minimize2, FileText, Sparkles,
  Headphones, Play, Pause, Square, Volume2, FastForward,
  Settings2, Copy, Check, BookOpen, AlertCircle, RefreshCw
} from 'lucide-react';

interface MobilePdfReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  pdfUrl: string;
  disciplinaName?: string;
  author?: string;
  description?: string;
}

export const MobilePdfReaderModal: React.FC<MobilePdfReaderModalProps> = ({
  isOpen,
  onClose,
  title,
  pdfUrl,
  disciplinaName,
  author,
  description,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Estados do Audioleitor (TTS - Text-to-Speech)
  const [isAudioPanelOpen, setIsAudioPanelOpen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [audioTab, setAudioTab] = useState<'synopsis' | 'custom'>('synopsis');
  const [customText, setCustomText] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [ttsSupported, setTtsSupported] = useState<boolean>(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Carrega as vozes disponíveis no navegador
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTtsSupported(false);
      return;
    }

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length > 0) {
        // Prioriza vozes em português (pt-BR ou pt-PT)
        const ptVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith('pt'));
        setVoices(ptVoices.length > 0 ? ptVoices : allVoices);

        // Se ainda não escolheu uma voz, prioriza uma de pt-BR natural
        if (!selectedVoiceURI) {
          const defaultPt = ptVoices.find(v => v.lang === 'pt-BR') || ptVoices[0] || allVoices[0];
          if (defaultPt) setSelectedVoiceURI(defaultPt.voiceURI);
        }
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoiceURI]);

  // Limpa estados e para a fala ao fechar o modal
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(100);
      setIsNightMode(false);
      setIsFullscreen(false);
    } else {
      stopAudio();
      setIsAudioPanelOpen(false);
    }
    return () => {
      stopAudio();
    };
  }, [isOpen]);

  // Texto montado para leitura da sinopse e apresentação acadêmica
  const getSynopsisText = (): string => {
    const parts = [
      `Título da obra: ${title}.`,
      author ? `Autor: ${author}.` : '',
      disciplinaName ? `Contexto acadêmico: ${disciplinaName}.` : '',
      description ? `Descrição e fundamentação teórica: ${description}` : 'Nenhuma descrição complementar cadastrada para esta obra no acervo.'
    ];
    return parts.filter(Boolean).join(' ');
  };

  // Executa a reprodução com a Web Speech API
  const playAudio = (textToRead?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const targetText = (textToRead || (audioTab === 'synopsis' ? getSynopsisText() : customText)).trim();
    if (!targetText) return;

    const utterance = new SpeechSynthesisUtterance(targetText);
    utteranceRef.current = utterance;

    utterance.rate = playbackRate;
    utterance.pitch = pitch;
    utterance.lang = 'pt-BR';

    if (selectedVoiceURI && voices.length > 0) {
      const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pauseAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const resumeAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Altera a velocidade dinamicamente durante a leitura
  const handleRateChange = (newRate: number) => {
    setPlaybackRate(newRate);
    if (isPlaying && !isPaused) {
      playAudio();
    }
  };

  // Colar texto da área de transferência
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setCustomText(text);
          setAudioTab('custom');
          setCopiedNotification(true);
          setTimeout(() => setCopiedNotification(false), 2000);
        }
      }
    } catch {
      // Ignora restrição de permissão caso o navegador bloqueie
    }
  };

  if (!isOpen || !pdfUrl) return null;

  // Transforma qualquer formato de link do Google Drive para o modo preview embutido
  let embedUrl = pdfUrl.trim();
  if (embedUrl.includes('drive.google.com') || embedUrl.includes('docs.google.com')) {
    const match = embedUrl.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/) ||
                  embedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  } else if (/^[a-zA-Z0-9_-]{25,}$/.test(embedUrl) && !embedUrl.startsWith('http')) {
    embedUrl = `https://drive.google.com/file/d/${embedUrl}/preview`;
  }

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 75));
  const handleZoomReset = () => setZoomLevel(100);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-3 animate-in fade-in duration-200">
      <div 
        className={`w-full flex flex-col bg-slate-900 border border-slate-700 shadow-2xl transition-all duration-200 ${
          isFullscreen 
            ? 'h-full rounded-none' 
            : 'h-full sm:h-[94vh] sm:max-w-5xl sm:rounded-2xl overflow-hidden'
        }`}
      >
        {/* Cabeçalho do Leitor com Controles Rápidos */}
        <div className="px-3 sm:px-5 py-2.5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
          
          {/* Título e Identificação */}
          <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-900/60 text-blue-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">{title}</h3>
                {author && (
                  <span className="hidden lg:inline text-[11px] text-slate-400 font-medium truncate">
                    • {author}
                  </span>
                )}
                {disciplinaName && (
                  <span className="hidden md:inline text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {disciplinaName}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate">Leitor Integrado • Modo Noturno & Áudio Text-to-Speech</p>
            </div>
          </div>

          {/* Barra de Ferramentas: Audioleitor + Zoom + Modo Noturno + Download + Fechar */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            
            {/* Botão de Destaque: Audioleitor (Ouvir) */}
            {ttsSupported && (
              <button
                onClick={() => setIsAudioPanelOpen(!isAudioPanelOpen)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  isPlaying
                    ? 'bg-emerald-500 text-slate-950 animate-pulse ring-2 ring-emerald-400/50'
                    : isAudioPanelOpen
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-500/30'
                }`}
                title={isAudioPanelOpen ? 'Ocultar Painel de Áudio' : 'Ouvir Livro com Controle de Voz'}
              >
                <Headphones className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isPlaying ? `Ouvindo (${playbackRate}x)` : 'Ouvir Livro'}
                </span>
              </button>
            )}

            {/* Separador */}
            <div className="hidden sm:block h-4 w-px bg-slate-800 mx-0.5" />

            {/* Zoom Out */}
            <button
              onClick={handleZoomOut}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1 cursor-pointer"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {/* Zoom Percentual / Reset */}
            <button
              onClick={handleZoomReset}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] font-bold transition hidden sm:inline cursor-pointer"
              title="Restaurar Zoom (100%)"
            >
              {zoomLevel}%
            </button>

            {/* Zoom In */}
            <button
              onClick={handleZoomIn}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-1 cursor-pointer"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Modo Leitura Noturna */}
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              className={`p-1.5 sm:p-2 rounded-lg transition text-xs flex items-center gap-1 cursor-pointer ${
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
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition hidden sm:flex items-center cursor-pointer"
              title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Baixar / Abrir Externo */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm shrink-0"
              title="Abrir no Google Drive ou Baixar Arquivo"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Baixar</span>
            </a>

            {/* Fechar */}
            <button
              onClick={() => {
                stopAudio();
                onClose();
              }}
              className="p-1.5 sm:p-2 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition ml-1 cursor-pointer"
              title="Fechar Leitor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PAINEL RETRÁTIL DO AUDIOLEITOR COM CONTROLES DE VELOCIDADE E VOZ */}
        {isAudioPanelOpen && (
          <div className="bg-slate-950 border-b border-slate-800 p-3 sm:p-4 text-slate-200 transition-all duration-200 shadow-inner shrink-0">
            <div className="max-w-4xl mx-auto space-y-3">
              
              {/* Barra de Status e Controles Principais de Áudio */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      Audioleitor Koinonia LMS
                      {isPlaying && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-normal">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                          Narrando em voz alta
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-slate-400">
                      Síntese de voz nativa • Zero consumo de dados • Controle de velocidade dinâmico
                    </p>
                  </div>
                </div>

                {/* Botões de Reprodução (Play, Pause, Stop) */}
                <div className="flex items-center gap-1.5">
                  {!isPlaying && !isPaused ? (
                    <button
                      onClick={() => playAudio()}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Ouvir Agora
                    </button>
                  ) : isPaused ? (
                    <button
                      onClick={resumeAudio}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Retomar
                    </button>
                  ) : (
                    <button
                      onClick={pauseAudio}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" /> Pausar
                    </button>
                  )}

                  {(isPlaying || isPaused) && (
                    <button
                      onClick={stopAudio}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      title="Parar Reprodução"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden sm:inline">Parar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Controles de Configuração: Velocidade + Vozes + Pitch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 border-t border-slate-800/80">
                
                {/* 1. Controle de Velocidade da Leitura */}
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <FastForward className="w-3 h-3 text-amber-400" /> Velocidade: {playbackRate}x
                    </span>
                    <span className="text-[10px] text-slate-500">Normal: 1.0x</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handleRateChange(rate)}
                        className={`flex-1 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer ${
                          playbackRate === rate
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Seleção de Vozes em Português */}
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-blue-400" /> Voz do Dispositivo
                    </span>
                    <span className="text-[10px] text-slate-500">{voices.length} vozes</span>
                  </div>
                  <select
                    value={selectedVoiceURI}
                    onChange={(e) => setSelectedVoiceURI(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Ajuste de Tom (Pitch) */}
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 sm:col-span-2 md:col-span-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                      <Settings2 className="w-3 h-3 text-emerald-400" /> Tom da Voz (Pitch): {pitch}
                    </span>
                    <button 
                      onClick={() => setPitch(1.0)} 
                      className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                    >
                      Restaurar
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Grave</span>
                    <input
                      type="range"
                      min="0.6"
                      max="1.4"
                      step="0.1"
                      value={pitch}
                      onChange={(e) => setPitch(parseFloat(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                    />
                    <span className="text-[10px] text-slate-500">Agudo</span>
                  </div>
                </div>
              </div>

              {/* Seletor de Conteúdo: Sinopse vs. Trecho Copiado */}
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setAudioTab('synopsis')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      audioTab === 'synopsis'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <BookOpen className="w-3 h-3" /> Sinopse & Apresentação
                  </button>

                  <button
                    onClick={() => setAudioTab('custom')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      audioTab === 'custom'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3 h-3" /> Ouvir Trechos da Página
                  </button>
                </div>

                {audioTab === 'synopsis' ? (
                  <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <p className="font-semibold text-white">Texto da Apresentação que será narrado:</p>
                    <p className="text-[11px] text-slate-400 italic line-clamp-3">
                      "{getSynopsisText()}"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Copie qualquer parágrafo do PDF abaixo e cole aqui para ouvir:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handlePasteClipboard}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Copy className="w-2.5 h-2.5" /> Colar Trecho
                        </button>
                        {customText && (
                          <button
                            onClick={() => setCustomText('')}
                            className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                    </div>
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Cole aqui um parágrafo ou página do livro para narrar em voz alta..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none h-16"
                    />
                    {copiedNotification && (
                      <p className="text-[10px] text-emerald-400 font-medium">✓ Trecho colado com sucesso!</p>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

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
        <div className="px-4 py-1.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Dica: clique em <strong>Ouvir Livro</strong> para escutar com velocidade ajustável (0.5x a 2.0x)</span>
          </span>
          <span className="font-mono text-slate-500 hidden sm:inline">Koinonia LMS Reader • TTS Integrado</span>
        </div>
      </div>
    </div>
  );
};

