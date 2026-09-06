'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Play, Pause, Square, Sparkles, Copy, Check, 
  Download, Trash2, Maximize2, Minimize2, X, AlertCircle, 
  HelpCircle, Globe, Edit3, Volume2, BookOpen, Clock, FileText,
  ExternalLink, CheckCircle2
} from 'lucide-react';
import { 
  LiveSpeechService, 
  SpeechLanguage, 
  SpeechRecognitionResultItem 
} from '@/services/liveSpeechService';

interface LiveAudioTranscriberProps {
  isOpen: boolean;
  onClose: () => void;
  disciplinaName?: string;
  disciplinaCode?: string;
  aulaNum?: number;
  date?: string;
  onSendToCornell?: (transcriptText: string) => void;
  initialMinimized?: boolean;
}

export const LiveAudioTranscriber: React.FC<LiveAudioTranscriberProps> = ({
  isOpen,
  onClose,
  disciplinaName = 'História do Congregacionalismo',
  disciplinaCode = 'HIS-202',
  aulaNum = 1,
  date,
  onSendToCornell,
  initialMinimized = false,
}) => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [fullText, setFullText] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<SpeechLanguage>('pt-BR');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(initialMinimized);
  const [isEditingManually, setIsEditingManually] = useState<boolean>(false);
  const [showTips, setShowTips] = useState<boolean>(false);

  const serviceRef = useRef<LiveSpeechService | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);

  const storageKey = `lms_live_transcript_${disciplinaCode}_aula${aulaNum}`;

  // Inicializa serviço
  useEffect(() => {
    const supported = LiveSpeechService.isSupported();
    setIsSupported(supported);

    if (!supported) {
      setErrorMessage(
        'A Web Speech API não é suportada por este navegador. Recomendamos usar o Google Chrome ou Microsoft Edge para transcrição ao vivo.'
      );
      return;
    }

    const service = new LiveSpeechService({
      lang: selectedLang,
      storageKey,
      onInterimChange: (interim) => {
        setInterimText(interim);
      },
      onFinalChange: (text) => {
        setFullText(text);
        setInterimText('');
      },
      onError: (err) => {
        setErrorMessage(err);
      },
      onStatusChange: (listening) => {
        setIsListening(listening);
      },
    });

    serviceRef.current = service;
    setFullText(service.getFullText());

    return () => {
      service.stop();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [selectedLang, storageKey]);

  // Temporizador
  useEffect(() => {
    if (isListening && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        if (serviceRef.current) {
          setElapsedSeconds(serviceRef.current.getElapsedSeconds());
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isListening, isPaused]);

  // Auto-scroll para o final conforme o texto surge
  useEffect(() => {
    if (textContainerRef.current && !isEditingManually) {
      textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight;
    }
  }, [fullText, interimText, isEditingManually]);

  if (!isOpen) return null;

  const handleStart = () => {
    setErrorMessage(null);
    if (serviceRef.current) {
      const ok = serviceRef.current.start();
      if (ok) {
        setIsListening(true);
        setIsPaused(false);
      }
    }
  };

  const handlePause = () => {
    if (serviceRef.current) {
      serviceRef.current.pause();
      setIsPaused(true);
      setIsListening(false);
    }
  };

  const handleResume = () => {
    setErrorMessage(null);
    if (serviceRef.current) {
      serviceRef.current.resume();
      setIsPaused(false);
      setIsListening(true);
    }
  };

  const handleStop = () => {
    if (serviceRef.current) {
      serviceRef.current.stop();
      setIsListening(false);
      setIsPaused(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Tem certeza que deseja limpar toda a transcrição capturada desta aula?')) {
      if (serviceRef.current) {
        serviceRef.current.clear();
      }
      setFullText('');
      setInterimText('');
      setElapsedSeconds(0);
      setErrorMessage(null);
    }
  };

  const handleCopy = () => {
    const textToCopy = fullText + (interimText ? `\n${interimText}` : '');
    if (!textToCopy.trim()) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    const textToDownload = fullText + (interimText ? `\n${interimText}` : '');
    if (!textToDownload.trim()) return;

    const blob = new Blob([
      `=== TRANSCRIÇÃO DA AULA • KOINONIA LMS ===\n` +
      `Disciplina: ${disciplinaName} (${disciplinaCode})\n` +
      `Aula: ${aulaNum} | Data: ${date || new Date().toLocaleDateString('pt-BR')}\n` +
      `Duração da Captura: ${formatTime(elapsedSeconds)}\n\n` +
      `-----------------------------------------\n\n` +
      textToDownload
    ], { type: 'text/plain;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transcricao_${disciplinaCode}_Aula${aulaNum}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendCornell = () => {
    const textToSend = fullText + (interimText ? `\n${interimText}` : '');
    if (!textToSend.trim()) {
      alert('Inicie a fala ou aguarde a transcrição para enviar ao Caderno Cornell.');
      return;
    }
    if (onSendToCornell) {
      onSendToCornell(textToSend);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setFullText(newText);
    if (serviceRef.current) {
      serviceRef.current.setFullTextManual(newText);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  const wordCount = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
  const charCount = fullText.length;

  // ==========================================
  // MODO MINIMIZADO (FLUTUANTE NO CANTO INFERIOR)
  // ==========================================
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-[9999] bg-gray-900/95 backdrop-blur-md text-white border border-gray-700/80 shadow-2xl rounded-2xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center gap-2">
          {isListening ? (
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
            </span>
          ) : isPaused ? (
            <span className="h-3 w-3 rounded-full bg-amber-400"></span>
          ) : (
            <span className="h-3 w-3 rounded-full bg-gray-500"></span>
          )}

          <div className="flex flex-col">
            <span className="text-[11px] font-black tracking-wide text-gray-200 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-red-400" />
              {isListening ? 'Transcrevendo...' : isPaused ? 'Transcrição Pausada' : 'Transcrição Pronta'}
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              {formatTime(elapsedSeconds)} • {wordCount} palavras
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2 border-l border-gray-700 pl-2">
          {isListening ? (
            <button
              onClick={handlePause}
              className="p-1.5 hover:bg-gray-800 rounded-lg text-amber-300 hover:text-amber-200 transition"
              title="Pausar"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : isPaused ? (
            <button
              onClick={handleResume}
              className="p-1.5 hover:bg-gray-800 rounded-lg text-emerald-300 hover:text-emerald-200 transition"
              title="Retomar"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="p-1.5 hover:bg-gray-800 rounded-lg text-red-400 hover:text-red-300 transition"
              title="Iniciar"
            >
              <Play className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsMinimized(false)}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-blue-400 hover:text-blue-300 transition"
            title="Expandir Janela"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-200 transition"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MODO COMPLETO (MODAL / JANELA PRINCIPAL)
  // ==========================================
  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* CABEÇALHO */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl flex items-center justify-center ${
              isListening 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' 
                : 'bg-white/10 text-white'
            }`}>
              <Mic className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Transcritor de Aula ao Vivo
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Web Speech Native
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  0 Egress • Ilimitado
                </span>
              </div>
              <p className="text-xs text-gray-300 flex items-center gap-2 mt-0.5">
                <span>{disciplinaName} ({disciplinaCode})</span>
                <span>•</span>
                <span>Aula {aulaNum}</span>
                {date && <span>• {date}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Seletor de Idioma */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 absolute left-2.5 text-gray-400 pointer-events-none" />
              <select
                value={selectedLang}
                onChange={(e) => {
                  const newLang = e.target.value as SpeechLanguage;
                  setSelectedLang(newLang);
                  if (serviceRef.current) {
                    serviceRef.current.setLanguage(newLang);
                  }
                }}
                disabled={isListening}
                className="pl-7 pr-3 py-1 bg-gray-800 border border-gray-700 rounded-xl text-xs text-gray-200 outline-none focus:border-blue-500 disabled:opacity-60 cursor-pointer"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
                <option value="el-GR">Grego (Koinē/Moderno)</option>
                <option value="he-IL">Hebraico (Bíblico)</option>
              </select>
            </div>

            <button
              onClick={() => setShowTips(!showTips)}
              className="p-2 hover:bg-gray-800 rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
              title="Dicas de áudio e fones de ouvido"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-gray-800 rounded-xl text-gray-300 hover:text-white transition cursor-pointer"
              title="Minimizar (Deixar no canto enquanto assiste ao Meet)"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* DICAS DE CAPTAÇÃO DE ÁUDIO */}
        {showTips && (
          <div className="bg-blue-50/90 border-b border-blue-100 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <strong className="font-bold">Como captar a fala do professor no Google Meet:</strong>
              <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[11px] text-blue-800">
                <li><strong>Som nos alto-falantes (Recomendado):</strong> O microfone do seu computador capta perfeitamente a voz do professor saindo das caixas de som.</li>
                <li><strong>Com fone de ouvido:</strong> Nas configurações de áudio do Windows/Mac, selecione <em>"Mixagem Estéreo" (Stereo Mix)</em> como microfone padrão ou utilize extensões como o Tactiq para salvar no Google Docs e importar aqui.</li>
                <li><strong>Modo Flutuante:</strong> Clique no botão <Minimize2 className="w-3 h-3 inline mx-0.5" /> para encolher este gravador em um card no canto da tela enquanto acompanha o Google Meet em tela cheia!</li>
              </ul>
            </div>
            <button
              onClick={() => setShowTips(false)}
              className="text-blue-500 hover:text-blue-700 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* BARRA DE STATUS & MÉTRICAS */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div className={`px-3 py-1.5 rounded-full font-black flex items-center gap-2 ${
              isListening 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : isPaused
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}>
              {isListening ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span>Escutando & Transcrevendo ao Vivo</span>
                </>
              ) : isPaused ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span>Transcrição Pausada</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                  <span>Aguardando Início</span>
                </>
              )}
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1.5 font-mono font-bold text-gray-700 bg-white px-3 py-1 rounded-xl border border-gray-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            {/* Métricas de Texto */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-500">
              <span><strong>{wordCount}</strong> palavras</span>
              <span>•</span>
              <span><strong>{charCount}</strong> caracteres</span>
            </div>
          </div>

          {/* Botões de Ação Secundários */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingManually(!isEditingManually)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isEditingManually
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
              title="Editar ou corrigir o texto manualmente"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingManually ? 'Concluir Edição' : 'Editar Texto'}</span>
            </button>

            <button
              onClick={handleCopy}
              disabled={!fullText.trim()}
              className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-2xs"
              title="Copiar transcrição para a área de transferência"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              disabled={!fullText.trim()}
              className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-2xs"
              title="Baixar arquivo de texto (.TXT)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Baixar TXT</span>
            </button>

            <button
              onClick={handleClear}
              disabled={!fullText.trim() && !interimText.trim()}
              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-xl border border-transparent hover:border-red-200 transition disabled:opacity-30 cursor-pointer"
              title="Limpar transcrição"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MENSAGEM DE ERRO SE HOUVER */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-100 px-4 py-2 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* ÁREA DE TRANSCRIÇÃO DINÂMICA */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50/40 relative min-h-[320px] max-h-[50vh]">
          {isEditingManually ? (
            <textarea
              value={fullText}
              onChange={handleTextChange}
              placeholder="Digite ou edite a transcrição manualmente..."
              className="w-full h-full min-h-[280px] p-4 bg-white border border-blue-300 rounded-2xl text-xs sm:text-sm font-sans leading-relaxed outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            />
          ) : (
            <div 
              ref={textContainerRef}
              className="w-full h-full min-h-[280px] p-4 bg-white border border-gray-200 rounded-2xl shadow-2xs overflow-y-auto text-xs sm:text-sm font-sans leading-relaxed space-y-3"
            >
              {!fullText && !interimText ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-12">
                  <div className="p-4 bg-gray-50 rounded-full mb-3 border border-gray-100">
                    <Mic className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="font-extrabold text-sm text-gray-600">
                    Nenhuma fala capturada ainda
                  </p>
                  <p className="text-xs text-gray-400 max-w-sm mt-1">
                    Clique no botão vermelho <strong>"Iniciar Transcrição ao Vivo"</strong> abaixo. O áudio da aula do professor será transcrito em tempo real na tela.
                  </p>
                </div>
              ) : (
                <>
                  {fullText.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-gray-800 leading-relaxed">
                      {paragraph.startsWith('[') ? (
                        <>
                          <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md mr-1.5 border border-blue-100 select-none">
                            {paragraph.substring(0, paragraph.indexOf(']') + 1)}
                          </span>
                          <span>{paragraph.substring(paragraph.indexOf(']') + 1).trim()}</span>
                        </>
                      ) : (
                        paragraph
                      )}
                    </p>
                  ))}

                  {/* Fala Provisória em Andamento (Interim) */}
                  {interimText && (
                    <p className="text-gray-400 italic flex items-center gap-1.5 animate-pulse bg-gray-50/80 p-2 rounded-xl border border-dashed border-gray-200">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      <span>{interimText}</span>
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* RODAPÉ DE CONTROLES PRINCIPAIS */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          {/* Controles de Gravação de Voz */}
          <div className="flex items-center gap-2">
            {!isListening && !isPaused ? (
              <button
                onClick={handleStart}
                disabled={!isSupported}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Iniciar Transcrição ao Vivo</span>
              </button>
            ) : isListening ? (
              <>
                <button
                  onClick={handlePause}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pausar</span>
                </button>

                <button
                  onClick={handleStop}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Finalizar</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleResume}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Retomar</span>
                </button>

                <button
                  onClick={handleStop}
                  className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Finalizar</span>
                </button>
              </>
            )}
          </div>

          {/* Ação Primária: Enviar para o Caderno Cornell com IA */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSendCornell}
              disabled={!fullText.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>✨ Sintetizar no Caderno Cornell com IA</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
