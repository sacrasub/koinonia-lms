'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ZoomIn, ZoomOut, RotateCcw, Moon, Sun, Download, 
  ExternalLink, Maximize2, Minimize2, FileText, Sparkles,
  Headphones, Play, Pause, Square, Volume2, FastForward,
  Settings2, Copy, Check, BookOpen, AlertCircle, RefreshCw,
  ChevronLeft, ChevronRight, RotateCw, PlusCircle, Bookmark,
  Type, AlignLeft, VolumeX, Info, CheckCircle2
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

/**
 * Sanitiza o texto para síntese de voz (TTS), removendo emojis, caracteres
 * especiais e markdown que causam erros silenciosos no sintetizador do Windows/Chromium.
 */
function sanitizeTextForSpeech(raw: string): string {
  if (!raw) return '';
  return raw
    // Remove emojis e símbolos pictográficos comuns que travam vozes SAPI/OneCore
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{2388}\u{2B05}-\u{2B07}\u{2934}-\u{2935}\u{2190}-\u{21FF}]/gu, '')
    // Substitui traço longo por vírgula para manter pausa natural de respiração
    .replace(/—|–/g, ', ')
    // Remove colchetes de tags como [Dica do Leitor]:
    .replace(/\[|\]/g, ' ')
    // Expande abreviações acadêmicas e teológicas para pronúncia fluida
    .replace(/\bProfº\b|\bProf\.\b/gi, 'Professor ')
    .replace(/\bProfª\b/gi, 'Professora ')
    .replace(/\bCap\.\b/gi, 'Capítulo ')
    .replace(/\bpág\.\b|\bpágs\.\b/gi, 'página ')
    .replace(/\bUIECB\b/g, 'U I E C B')
    .replace(/\bLMS\b/g, 'L M S')
    .replace(/\bAT\b/g, 'Antigo Testamento')
    .replace(/\bNT\b/g, 'Novo Testamento')
    // Remove asteriscos e caracteres de formatação markdown
    .replace(/[*_#`~]+/g, '')
    // Normaliza múltiplos espaços e quebras de linha
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Divide o texto da página em sentenças curtas (chunks de até 150 caracteres).
 * Isso contorna 100% o bug crônico do Chromium/Chrome que congela a fala após ~15 segundos.
 */
function splitIntoSpeechChunks(text: string): string[] {
  const clean = sanitizeTextForSpeech(text);
  if (!clean) return [];

  // Divide primariamente por pontuação de fim de sentença (. ! ? ; \n)
  const rawParts = clean.split(/(?<=[.?!;:\n])\s+/);
  const chunks: string[] = [];

  for (const part of rawParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Se a sentença for excessivamente longa (> 150 caracteres), divide em vírgulas
    if (trimmed.length > 150) {
      const subParts = trimmed.split(/(?<=,)\s+/);
      for (const sub of subParts) {
        if (sub.trim()) chunks.push(sub.trim());
      }
    } else {
      chunks.push(trimmed);
    }
  }

  return chunks.length > 0 ? chunks : [clean];
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
  // Modos de Exibição: 'ebook' (Leitura contínua & Áudio com páginas) ou 'pdf' (Visualizador original)
  const [readerMode, setReaderMode] = useState<'ebook' | 'pdf'>('ebook');

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(16); // px

  // Estados do Audioleitor (TTS - Text-to-Speech)
  const [isAudioPanelOpen, setIsAudioPanelOpen] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [ttsSupported, setTtsSupported] = useState<boolean>(true);

  // Estados de Chunking e Destaque Visual em Tempo Real
  const [currentChunkIdx, setCurrentChunkIdx] = useState<number>(0);
  const [activeSpokenSentence, setActiveSpokenSentence] = useState<string>('');
  const speechChunksRef = useRef<string[]>([]);
  const keepAliveIntervalRef = useRef<any>(null);

  // Estados de Leitura Contínua & Páginas
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [autoAdvancePages, setAutoAdvancePages] = useState<boolean>(true);
  const [pages, setPages] = useState<string[]>([]);
  const [isAddPagesModalOpen, setIsAddPagesModalOpen] = useState<boolean>(false);
  const [importTextContent, setImportTextContent] = useState<string>('');
  const [showEdgeGuideModal, setShowEdgeGuideModal] = useState<boolean>(false);

  // Seleção Direta de Trecho na Tela ("Ouvir a partir daqui")
  const [selectionPopup, setSelectionPopup] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  } | null>(null);

  const [isExtractingPages, setIsExtractingPages] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };
  const [isScannedPdf, setIsScannedPdf] = useState<boolean>(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Chave de persistência local para páginas deste livro
  const storageKey = `lms_book_pages_${encodeURIComponent(title.trim().toLowerCase().slice(0, 40))}`;
  const progressKey = `lms_book_progress_${encodeURIComponent(title.trim().toLowerCase().slice(0, 40))}`;

  // Extrai o texto de todas as páginas do PDF do Drive via backend autenticado
  const extractPagesFromPdfBackend = async (force = false) => {
    if (!pdfUrl) return;

    setIsExtractingPages(true);

    try {
      const res = await fetch('/api/pdf/extract-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfUrl, title }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível extrair o texto deste PDF.');
      }

      if (data.isScanned) {
        setIsScannedPdf(true);
        showToast('ℹ️ Este PDF é digitalizado em scanner. Use o modo PDF Original ou o leitor do navegador.');
      } else if (Array.isArray(data.pages) && data.pages.length > 0) {
        setPages(data.pages);
        setIsScannedPdf(false);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(storageKey, JSON.stringify(data.pages));
          } catch {}
        }
        showToast(`✨ ${data.pages.length} páginas extraídas com sucesso para leitura contínua!`);
      }
    } catch (err: any) {
      console.warn('Falha na extração de texto do PDF:', err);
      showToast('Aviso: Não foi possível extrair texto digital completo. Você pode ouvir os metadados ou colar o texto.');
    } finally {
      setIsExtractingPages(false);
    }
  };

  // Inicializa o conteúdo das páginas a partir do cache local ou metadados
  useEffect(() => {
    if (!isOpen) return;

    let loadedPages: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedPages = parsed;
          }
        }
      } catch {
        // Fallback silencioso
      }
    }

    // Se não tiver páginas salvas, monta a página 1 com os metadados acadêmicos da obra
    if (loadedPages.length === 0) {
      const defaultIntroPage = [
        `Capítulo Introdutório e Fundamentação Acadêmica: ${title}`,
        author ? `Autor(a): ${author}` : '',
        disciplinaName ? `Contexto da Matéria: ${disciplinaName}` : '',
        description ? `Descrição da Obra:\n${description}` : 'Obra de referência do acervo teológico.',
        '\n[Dica do Leitor]: Você pode avançar páginas, ouvir com virada automática ou selecionar qualquer parágrafo do livro para começar a escutar exatamente dali em diante!'
      ].filter(Boolean).join('\n\n');

      loadedPages = [defaultIntroPage];
      setPages(loadedPages);

      // Dispara extração automática do PDF em segundo plano
      extractPagesFromPdfBackend(false);
    } else {
      setPages(loadedPages);
    }

    // Carrega o progresso de página anterior
    if (typeof window !== 'undefined') {
      try {
        const savedPage = localStorage.getItem(progressKey);
        if (savedPage) {
          const pageNum = parseInt(savedPage, 10);
          if (!isNaN(pageNum) && pageNum >= 0 && pageNum < loadedPages.length) {
            setCurrentPageIndex(pageNum);
          }
        }
      } catch {}
    }
  }, [isOpen, storageKey, progressKey, title, author, disciplinaName, description]);

  // Salva o progresso da página atual
  const handleSetPage = (index: number) => {
    const validIndex = Math.max(0, Math.min(index, pages.length - 1));
    setCurrentPageIndex(validIndex);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(progressKey, String(validIndex));
      } catch {}
    }
    // Se estava tocando, para o áudio para tocar a nova página
    if (isPlaying) {
      stopAudio();
    }
  };

  // Carrega as vozes disponíveis no navegador
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTtsSupported(false);
      return;
    }

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length > 0) {
        const ptVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith('pt'));
        setVoices(ptVoices.length > 0 ? ptVoices : allVoices);

        if (!selectedVoiceURI) {
          // Prioriza vozes pt-BR de alta fidelidade
          const preferredPt = ptVoices.find(v => 
            v.lang.toLowerCase() === 'pt-br' && 
            (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Francisca') || v.name.includes('Daniel') || v.name.includes('Maria'))
          ) || ptVoices.find(v => v.lang.toLowerCase() === 'pt-br') || ptVoices[0] || allVoices[0];

          if (preferredPt) setSelectedVoiceURI(preferredPt.voiceURI);
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
    }
    return () => {
      stopAudio();
    };
  }, [isOpen]);

  // Limpeza de timers de keep-alive ao desmontar
  useEffect(() => {
    return () => {
      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
    };
  }, []);

  // =========================================================================
  // MOTOR DE ÁUDIO TTS BLINDADO COM CHUNKING ANTI-FREEZE
  // =========================================================================

  const stopAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSpokenSentence('');
    setSelectionPopup(null);
  };

  const playChunkSequence = (chunks: string[], startIdx: number, onCompleteAll?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (startIdx >= chunks.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setActiveSpokenSentence('');
      if (onCompleteAll) onCompleteAll();
      return;
    }

    const chunk = chunks[startIdx];
    setCurrentChunkIdx(startIdx);
    setActiveSpokenSentence(chunk);

    const utterance = new SpeechSynthesisUtterance(chunk);
    utteranceRef.current = utterance;
    // Prevenção contra Garbage Collection prematura do V8/Chromium
    (window as any).__lmsCurrentUtterance = utterance;

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
      // Avança para o próximo chunk após pequeno intervalo natural
      setTimeout(() => {
        if (speechChunksRef.current === chunks) {
          playChunkSequence(chunks, startIdx + 1, onCompleteAll);
        }
      }, 70);
    };

    utterance.onerror = (e) => {
      console.warn('Erro na emissão do chunk:', e);
      setTimeout(() => {
        if (speechChunksRef.current === chunks) {
          playChunkSequence(chunks, startIdx + 1, onCompleteAll);
        }
      }, 70);
    };

    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Falha ao acionar sintetizador:', err);
    }
  };

  const playAudio = (textOverride?: string, nextPageIndexOnEnd?: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('⚠️ Seu navegador não suporta a API nativa de voz.');
      return;
    }

    stopAudio();

    const rawText = (textOverride || pages[currentPageIndex] || '').trim();
    if (!rawText) {
      showToast('Nenhum texto disponível nesta página para leitura.');
      return;
    }

    const chunks = splitIntoSpeechChunks(rawText);
    if (chunks.length === 0) return;

    speechChunksRef.current = chunks;
    setIsPlaying(true);
    setIsPaused(false);

    // Keep-alive a cada 9 segundos para evitar congelamento crônico do Chromium
    keepAliveIntervalRef.current = setInterval(() => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 9000);

    // Pequeno delay após cancel() para que o Chrome processe o cancelamento da fila
    setTimeout(() => {
      playChunkSequence(chunks, 0, () => {
        // Callback ao finalizar todos os chunks da página:
        if (autoAdvancePages) {
          const nextIdx = nextPageIndexOnEnd !== undefined ? nextPageIndexOnEnd : currentPageIndex + 1;
          if (nextIdx < pages.length) {
            handleSetPage(nextIdx);
            setTimeout(() => {
              playAudio(pages[nextIdx], nextIdx + 1);
            }, 600);
          }
        }
      });
    }, 80);
  };

  const pauseAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.pause();
    } catch (e) {}
    setIsPaused(true);
    setIsPlaying(false);
  };

  const resumeAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.resume();
    } catch (e) {}
    setIsPaused(false);
    setIsPlaying(true);
  };

  // Testar voz do sintetizador
  const handleTestVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    stopAudio();
    setTimeout(() => {
      const testPhrase = 'Áudio do Koinonia LMS conectado com sucesso! O sintetizador está funcionando.';
      const u = new SpeechSynthesisUtterance(testPhrase);
      u.rate = playbackRate;
      u.lang = 'pt-BR';
      if (selectedVoiceURI && voices.length > 0) {
        const v = voices.find(voice => voice.voiceURI === selectedVoiceURI);
        if (v) u.voice = v;
      }
      (window as any).__lmsCurrentUtterance = u;
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(u);
        showToast('🔊 Testando som do sintetizador...');
      } catch (e) {}
    }, 80);
  };

  // Alternativa de Alta Fidelidade: Ouvir no Microsoft Edge / Navegador (Ctrl+Shift+U)
  const handleOpenInBrowserForSpeech = () => {
    let directPdfUrl = pdfUrl;
    const match = pdfUrl.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/) ||
                  pdfUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      directPdfUrl = `https://drive.google.com/file/d/${match[1]}/view`;
    }
    window.open(directPdfUrl, '_blank', 'noopener,noreferrer');
    setShowEdgeGuideModal(true);
  };

  // Copiar o texto da folha atual para a área de transferência
  const handleCopyCurrentPageText = () => {
    const txt = pages[currentPageIndex] || '';
    if (!txt) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(txt);
      showToast('📋 Texto da folha copiado! Você pode colar no Word ou em outro leitor de áudio.');
    }
  };

  // Altera a velocidade dinamicamente durante a leitura
  const handleRateChange = (newRate: number) => {
    setPlaybackRate(newRate);
    if (isPlaying && !isPaused) {
      playAudio();
    }
  };

  // Avançar / Retroceder Página
  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      handleSetPage(currentPageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      handleSetPage(currentPageIndex + 1);
    }
  };

  // Detecta seleção direta de texto do aluno ("Ouvir a partir daqui")
  const handleTextSelection = () => {
    if (typeof window === 'undefined') return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectionPopup(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length >= 3) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectionPopup({
        visible: true,
        x: Math.min(Math.max(rect.left + rect.width / 2, 80), window.innerWidth - 80),
        y: Math.max(rect.top - 48, 70),
        text: selectedText,
      });
    } else {
      setSelectionPopup(null);
    }
  };

  // Inicia o áudio exatamente a partir do trecho selecionado
  const handlePlayFromSelection = () => {
    if (!selectionPopup) return;
    const pageText = pages[currentPageIndex] || '';
    const startIndex = pageText.indexOf(selectionPopup.text);

    let textToSpeak = selectionPopup.text;
    if (startIndex !== -1) {
      textToSpeak = pageText.slice(startIndex);
    }

    playAudio(textToSpeak);
    setSelectionPopup(null);

    if (typeof window !== 'undefined' && window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  };

  // Salva páginas importadas manualmente (divididas por quebras de linha ou '---')
  const handleSaveImportedPages = () => {
    if (!importTextContent.trim()) return;

    let splitPages = importTextContent
      .split(/\n\s*---\s*\n|\f|\[P[aá]gina\s*\d+\]/gi)
      .map(p => p.trim())
      .filter(p => p.length > 10);

    if (splitPages.length === 0) {
      splitPages = [importTextContent.trim()];
    }

    setPages(splitPages);
    setCurrentPageIndex(0);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(splitPages));
        localStorage.setItem(progressKey, '0');
      } catch {}
    }
    setIsAddPagesModalOpen(false);
    setImportTextContent('');
    showToast(`✨ ${splitPages.length} páginas importadas com sucesso!`);
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

  const currentPageText = pages[currentPageIndex] || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-2 animate-in fade-in duration-200">
      
      {/* Toast flutuante de feedback */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-60 px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/50 text-white text-xs font-bold shadow-2xl animate-in slide-in-from-top-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div 
        className={`w-full flex flex-col bg-slate-900 border border-slate-700 shadow-2xl transition-all duration-200 ${
          isFullscreen 
            ? 'h-full rounded-none' 
            : 'h-full sm:h-[95vh] sm:max-w-5xl sm:rounded-2xl overflow-hidden'
        }`}
      >
        {/* BARRA SUPERIOR DO LEITOR COM SELETOR DE MODO & CONTROLES */}
        <div className="px-3 sm:px-5 py-2.5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between shrink-0 gap-2">
          
          {/* Título da Obra */}
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
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {readerMode === 'ebook' 
                  ? `Modo Leitura Contínua • Página ${currentPageIndex + 1} de ${pages.length}`
                  : 'Modo Visual (Google Drive Preview)'}
              </p>
            </div>
          </div>

          {/* ALTERNADOR DE MODO: PDF VISUAL vs. LEITURA CONTÍNUA & ÁUDIO */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setReaderMode('ebook')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                readerMode === 'ebook'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Modo Leitura Contínua com narração ininterrupta e seleção direta"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leitura Contínua</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 font-mono">
                {currentPageIndex + 1}/{pages.length}
              </span>
            </button>

            <button
              onClick={() => setReaderMode('pdf')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                readerMode === 'pdf'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Modo Visual com o PDF original do Google Drive"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF Original</span>
            </button>
          </div>

          {/* BOTÕES DE CONFIGURAÇÃO & FECHAR */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Botão de Painel de Áudio */}
            {ttsSupported && (
              <button
                onClick={() => setIsAudioPanelOpen(!isAudioPanelOpen)}
                className={`p-1.5 sm:px-2 sm:py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  isPlaying
                    ? 'bg-emerald-500 text-slate-950 animate-pulse'
                    : isAudioPanelOpen
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                title="Controles de Áudio e Velocidade"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{playbackRate}x</span>
              </button>
            )}

            {/* Modo Noturno */}
            <button
              onClick={() => setIsNightMode(!isNightMode)}
              className={`p-1.5 rounded-lg transition text-xs cursor-pointer ${
                isNightMode 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="Alternar Modo Noturno"
            >
              {isNightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Tela Cheia */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition hidden sm:flex cursor-pointer"
              title="Tela Cheia"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Baixar */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition hidden md:flex items-center gap-1 shadow-sm"
              title="Baixar Arquivo Original"
            >
              <Download className="w-3.5 h-3.5" />
            </a>

            {/* Fechar */}
            <button
              onClick={() => {
                stopAudio();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition ml-1 cursor-pointer"
              title="Fechar Leitor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PAINEL FLUTUANTE DE ÁUDIO & VELOCIDADE (EXPANSÍVEL) */}
        {isAudioPanelOpen && (
          <div className="bg-slate-950 border-b border-slate-800 p-2.5 sm:p-3 text-slate-200 shadow-md shrink-0 space-y-2">
            
            {/* Linha 1: Controles de Áudio Web */}
            <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2">
              
              {/* Controles de Reprodução Primários */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {!isPlaying && !isPaused ? (
                  <button
                    onClick={() => playAudio()}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Ouvir Página Atual
                  </button>
                ) : isPaused ? (
                  <button
                    onClick={resumeAudio}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Retomar
                  </button>
                ) : (
                  <button
                    onClick={pauseAudio}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5 fill-current" /> Pausar
                  </button>
                )}

                {(isPlaying || isPaused) && (
                  <button
                    onClick={stopAudio}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Parar Narração"
                  >
                    <Square className="w-3 h-3 fill-current" /> Parar
                  </button>
                )}

                {/* Botão de Teste Rápido de Som */}
                <button
                  onClick={handleTestVoice}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1 cursor-pointer"
                  title="Testar se o áudio do sintetizador está funcionando na saída de som"
                >
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Testar Som</span>
                </button>
              </div>

              {/* Seletor de Velocidades Rápidas */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 px-1 flex items-center gap-0.5">
                  <FastForward className="w-3 h-3 text-amber-400" /> Vel:
                </span>
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold transition cursor-pointer ${
                      playbackRate === rate
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Seletor de Vozes em Português */}
              <div className="hidden lg:flex items-center gap-1 text-xs">
                <span className="text-[10px] text-slate-400">Voz:</span>
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 max-w-[200px] truncate cursor-pointer"
                >
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Toggle de Virar Página Automaticamente */}
              <button
                onClick={() => setAutoAdvancePages(!autoAdvancePages)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  autoAdvancePages
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
                title="Avança para a próxima página e continua narrando automaticamente"
              >
                <RotateCw className={`w-3 h-3 ${autoAdvancePages ? 'text-emerald-400 animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                <span>Leitura Contínua {autoAdvancePages ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Linha 2: Alternativas Confiáveis de Voz Alta & Ferramentas */}
            <div className="max-w-5xl mx-auto pt-1.5 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Alternativa A: Ouvir no Microsoft Edge / Navegador com Vozes Neurais */}
                <button
                  onClick={handleOpenInBrowserForSpeech}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Abre no Microsoft Edge ou Chrome para usar o recurso 'Ler em voz alta' (Ctrl+Shift+U) com vozes neurais perfeitas"
                >
                  <Headphones className="w-3.5 h-3.5 text-sky-200" />
                  <span>Ouvir no Edge / Navegador (Ler em Voz Alta • Ctrl+Shift+U)</span>
                </button>

                {/* Alternativa B: Copiar texto da folha */}
                <button
                  onClick={handleCopyCurrentPageText}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition flex items-center gap-1 cursor-pointer"
                  title="Copiar texto desta folha para colar em leitores externos ou Word"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Copiar Folha</span>
                </button>
              </div>

              {/* Indicador de Frase Sendo Falada */}
              {isPlaying && activeSpokenSentence && (
                <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-0.5 rounded-lg truncate max-w-md flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate">Lendo: &ldquo;{activeSpokenSentence}&rdquo;</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ÁREA PRINCIPAL DO LEITOR */}
        {readerMode === 'ebook' ? (
          /* MODO E-BOOK & LEITURA CONTÍNUA COM PÁGINAS E SELEÇÃO DE TEXTO */
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900 relative">
            
            {/* Barra de Navegação de Páginas e Tipografia */}
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0">
              
              {/* Controles de Página: Anterior, Indicador e Próxima */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPageIndex === 0}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Página Anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-200">
                  Folha <span className="text-emerald-400">{currentPageIndex + 1}</span> de {pages.length}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPageIndex >= pages.length - 1}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Próxima Página"
                >
                  <span className="hidden sm:inline">Próxima</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Botões de Ação: Ajuste de Fonte + Importar Páginas */}
              <div className="flex items-center gap-1.5">
                {/* Tamanho da Fonte */}
                <div className="hidden sm:flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setFontSize((s) => Math.max(s - 2, 12))}
                    className="text-slate-400 hover:text-white px-1 font-bold"
                    title="Diminuir Fonte"
                  >
                    A-
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize((s) => Math.min(s + 2, 28))}
                    className="text-slate-400 hover:text-white px-1 font-bold"
                    title="Aumentar Fonte"
                  >
                    A+
                  </button>
                </div>

                {/* Extrair Páginas Automaticamente do PDF */}
                <button
                  onClick={() => extractPagesFromPdfBackend(true)}
                  disabled={isExtractingPages}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700/60 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1 border border-emerald-500/40 disabled:opacity-50 cursor-pointer"
                  title="Extrair e dividir todas as páginas deste PDF para leitura e narração em áudio"
                >
                  {isExtractingPages ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-300" />
                      <span className="hidden md:inline">Extraindo...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span className="hidden md:inline">Extrair do PDF</span>
                    </>
                  )}
                </button>

                {/* Importar / Adicionar Páginas do Livro */}
                <button
                  onClick={() => setIsAddPagesModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 border border-slate-700 cursor-pointer"
                  title="Colar texto de capítulos ou páginas adicionais deste livro"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden md:inline">Colar Páginas</span>
                </button>
              </div>
            </div>

            {/* CORPO DO TEXTO DA PÁGINA COM SELEÇÃO DIRETA */}
            <div 
              ref={textContainerRef}
              onMouseUp={handleTextSelection}
              onTouchEnd={handleTextSelection}
              className={`flex-1 overflow-y-auto p-5 sm:p-8 lg:p-12 transition-colors select-text ${
                isNightMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-900 text-slate-100'
              }`}
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
            >
              <div className="max-w-3xl mx-auto space-y-5 font-serif">
                {/* Alerta de Carregamento / Extração em Segundo Plano */}
                {isExtractingPages && (
                  <div className="mb-4 px-4 py-3 rounded-2xl bg-blue-950/70 border border-blue-500/30 text-blue-200 text-xs flex items-center gap-2.5 animate-pulse shadow-sm">
                    <Sparkles className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                    <span>Baixando e extraindo as páginas do arquivo PDF para leitura contínua e áudio...</span>
                  </div>
                )}

                {/* Alerta de PDF Escaneado (Imagens sem Camada de Texto) */}
                {isScannedPdf && (
                  <div className="mb-5 p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3 shadow-md">
                    <span className="text-xl shrink-0">📷</span>
                    <div>
                      <p className="font-bold text-amber-300 text-sm">Livro Digitalizado por Scanner (Fac-símile em Imagens)</p>
                      <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                        Este arquivo PDF original é composto por páginas digitalizadas em scanner físico (sem camada de texto digital embutida). 
                        Você pode folhear a obra completa com nitidez e zoom no modo <strong>[📄 PDF Original]</strong> no topo, ou usar o botão <strong>Ouvir no Edge / Navegador</strong> com OCR neural.
                      </p>
                    </div>
                  </div>
                )}

                {/* Parágrafos da Folha com Destaque Visual da Frase Falada */}
                {currentPageText.split('\n\n').map((paragraph, pIdx) => {
                  if (!paragraph.trim()) return null;

                  // Verifica se a frase atualmente falada pertence a este parágrafo
                  const isParagraphSpeaking = isPlaying && activeSpokenSentence && paragraph.includes(activeSpokenSentence.slice(0, 20));

                  return (
                    <div 
                      key={pIdx}
                      className={`group relative rounded-xl p-2.5 transition ${
                        isParagraphSpeaking
                          ? 'bg-amber-500/10 border-l-4 border-amber-400'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {paragraph}
                      </p>
                      {/* Botão de Play Rápido ao lado do Parágrafo */}
                      <button
                        onClick={() => playAudio(paragraph)}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition p-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[10px] font-sans flex items-center gap-1 shadow-sm cursor-pointer"
                        title="Ouvir apenas este parágrafo"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" /> Ouvir
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BALÃO FLUTUANTE DE SELEÇÃO DIRETA: "OUVIR A PARTIR DAQUI" */}
            {selectionPopup?.visible && (
              <div 
                className="fixed z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{ 
                  left: `${selectionPopup.x}px`, 
                  top: `${selectionPopup.y}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                <button
                  onClick={handlePlayFromSelection}
                  className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-2xl ring-4 ring-black/40 transition active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Ouvir a partir daqui</span>
                </button>
              </div>
            )}

            {/* Rodapé do Modo E-Book */}
            <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Selecione qualquer frase com o mouse/dedo para ver o botão <strong>&ldquo;Ouvir a partir daqui&rdquo;</strong></span>
              </span>

              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                <span>{currentPageText.length} caracteres</span>
                <span>•</span>
                <span>Folha {currentPageIndex + 1}/{pages.length}</span>
              </div>
            </div>
          </div>
        ) : (
          /* MODO VISUAL CLÁSSICO: GOOGLE DRIVE PREVIEW COM ZOOM E FILTRO NOTURNO */
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
        )}

        {/* MODAL DE GUIA: COMO OUVIR NO EDGE COM VOZES NEURAIS (CTRL+SHIFT+U) */}
        {showEdgeGuideModal && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-sky-400" />
                  <h4 className="text-sm font-bold text-white">Como Ouvir em Voz Alta no Navegador</h4>
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
                    O arquivo PDF foi aberto em uma nova aba!
                  </p>
                  <p>Para escutar com a melhor qualidade de voz do mundo (Microsoft Azure Neural):</p>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="px-2 py-0.5 rounded bg-blue-600 font-mono font-bold text-white text-[11px]">1</span>
                    <div>
                      <p className="font-bold text-white">No Microsoft Edge (Recomendado):</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Pressione o atalho <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-mono font-bold">Ctrl + Shift + U</kbd> no teclado ou clique com o botão direito no PDF e selecione <strong>&ldquo;Ler em voz alta&rdquo;</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="px-2 py-0.5 rounded bg-indigo-600 font-mono font-bold text-white text-[11px]">2</span>
                    <div>
                      <p className="font-bold text-white">No Google Chrome:</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Ative o painel lateral de <strong>&ldquo;Modo de Leitura&rdquo;</strong> e clique no ícone de reproduzir áudio.
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

        {/* MODAL DE IMPORTAÇÃO / ADIÇÃO DE PÁGINAS DO LIVRO */}
        {isAddPagesModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-150">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Importar / Colar Páginas deste Livro</h4>
                </div>
                <button
                  onClick={() => setIsAddPagesModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-300">
                  Cole abaixo o texto do livro (de uma folha, de um capítulo inteiro ou da obra). 
                  O LMS fatiará automaticamente o conteúdo em páginas navegáveis com leitura contínua:
                </p>
                <textarea
                  rows={9}
                  value={importTextContent}
                  onChange={(e) => setImportTextContent(e.target.value)}
                  placeholder="Cole aqui o texto copiado do PDF (para separar páginas manualmente, use três traços '---' entre elas)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-serif"
                />
                <p className="text-[11px] text-slate-400">
                  💡 Dica: Você pode usar <code>---</code> entre os parágrafos para forçar uma nova página de leitura.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setIsAddPagesModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveImportedPages}
                  disabled={!importTextContent.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow-md transition"
                >
                  Salvar e Iniciar Leitura
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
