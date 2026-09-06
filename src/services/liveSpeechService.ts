/**
 * Serviço de Transcrição Contínua em Tempo Real via Web Speech API (Browser-Native)
 * Zero Egress • Zero Custo • Compatível com Google Chrome e Microsoft Edge
 */

export interface SpeechRecognitionResultItem {
  timestamp: string;
  seconds: number;
  text: string;
}

export type SpeechLanguage = 'pt-BR' | 'en-US' | 'es-ES' | 'he-IL' | 'el-GR';

export interface LiveSpeechServiceOptions {
  lang?: SpeechLanguage;
  onInterimChange?: (interimText: string) => void;
  onFinalChange?: (fullText: string, items: SpeechRecognitionResultItem[]) => void;
  onError?: (errorMessage: string) => void;
  onStatusChange?: (isListening: boolean) => void;
  storageKey?: string;
}

export class LiveSpeechService {
  private recognition: any = null;
  private isListening = false;
  private shouldKeepListening = false;
  private lang: SpeechLanguage = 'pt-BR';
  private startTime: number = 0;
  private pausedDuration: number = 0;
  private pauseStartTime: number = 0;
  private isPaused = false;

  private transcriptItems: SpeechRecognitionResultItem[] = [];
  private fullText: string = '';
  private interimText: string = '';
  private storageKey: string | null = null;

  private onInterimChange?: (interimText: string) => void;
  private onFinalChange?: (fullText: string, items: SpeechRecognitionResultItem[]) => void;
  private onError?: (errorMessage: string) => void;
  private onStatusChange?: (isListening: boolean) => void;

  constructor(options: LiveSpeechServiceOptions = {}) {
    this.lang = options.lang || 'pt-BR';
    this.onInterimChange = options.onInterimChange;
    this.onFinalChange = options.onFinalChange;
    this.onError = options.onError;
    this.onStatusChange = options.onStatusChange;
    this.storageKey = options.storageKey || null;

    if (this.storageKey && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.fullText = parsed.fullText || '';
          this.transcriptItems = parsed.transcriptItems || [];
        }
      } catch (e) {
        console.warn('Falha ao restaurar rascunho de transcrição:', e);
      }
    }
  }

  public static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  public initRecognition(): boolean {
    if (typeof window === 'undefined') return false;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.onError?.(
        'A Web Speech API não é suportada neste navegador. Recomendamos o uso do Google Chrome ou Microsoft Edge.'
      );
      return false;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.lang;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStatusChange?.(true);
      };

      this.recognition.onresult = (event: any) => {
        if (this.isPaused) return;

        let interim = '';
        let newFinalSentence = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0].transcript;

          if (res.isFinal) {
            newFinalSentence += (newFinalSentence ? ' ' : '') + text.trim();
          } else {
            interim += text;
          }
        }

        this.interimText = interim;
        this.onInterimChange?.(interim);

        if (newFinalSentence) {
          const elapsedSec = this.getElapsedSeconds();
          const timestamp = this.formatTimestamp(elapsedSec);

          const item: SpeechRecognitionResultItem = {
            timestamp,
            seconds: elapsedSec,
            text: newFinalSentence,
          };

          this.transcriptItems.push(item);
          this.fullText = (this.fullText ? this.fullText + '\n\n' : '') + `[${timestamp}] ${newFinalSentence}`;

          this.saveToStorage();
          this.onFinalChange?.(this.fullText, [...this.transcriptItems]);
        }
      };

      this.recognition.onerror = (event: any) => {
        const error = event.error;
        console.warn('SpeechRecognition erro:', error);

        if (error === 'no-speech') {
          // Normal após pausa no áudio, não deve interromper o fluxo contínuo
          return;
        }

        if (error === 'not-allowed') {
          this.shouldKeepListening = false;
          this.isListening = false;
          this.onStatusChange?.(false);
          this.onError?.('Permissão de acesso ao microfone foi recusada no navegador.');
          return;
        }

        if (error === 'audio-capture') {
          this.shouldKeepListening = false;
          this.isListening = false;
          this.onStatusChange?.(false);
          this.onError?.('Nenhum microfone ou dispositivo de áudio detectado.');
          return;
        }

        if (error === 'network') {
          this.onError?.('Falha de rede momentânea no motor de voz do navegador. Tentando reconectar...');
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // Reconexão contínua: o Chrome frequentemente desliga o reconhecimento após alguns segundos de silêncio
        if (this.shouldKeepListening && !this.isPaused) {
          try {
            this.recognition.start();
          } catch (e) {
            // Se falhar a reinicialização imediata, tenta com backoff curto
            setTimeout(() => {
              if (this.shouldKeepListening && !this.isListening && !this.isPaused) {
                try {
                  this.recognition.start();
                } catch (err) {}
              }
            }, 300);
          }
        } else {
          this.onStatusChange?.(false);
        }
      };

      return true;
    } catch (e: any) {
      this.onError?.(`Erro ao inicializar reconhecimento de fala: ${e.message}`);
      return false;
    }
  }

  public start(): boolean {
    if (!this.recognition) {
      const ok = this.initRecognition();
      if (!ok) return false;
    }

    this.shouldKeepListening = true;
    this.isPaused = false;

    if (this.startTime === 0) {
      this.startTime = Date.now();
    } else if (this.pauseStartTime > 0) {
      this.pausedDuration += Date.now() - this.pauseStartTime;
      this.pauseStartTime = 0;
    }

    try {
      this.recognition.start();
      return true;
    } catch (e: any) {
      if (e.name !== 'InvalidStateError') {
        console.warn('Erro ao chamar recognition.start:', e);
      }
      return true;
    }
  }

  public pause(): void {
    this.isPaused = true;
    this.pauseStartTime = Date.now();
    this.interimText = '';
    this.onInterimChange?.('');
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
    this.onStatusChange?.(false);
  }

  public resume(): void {
    this.isPaused = false;
    if (this.pauseStartTime > 0) {
      this.pausedDuration += Date.now() - this.pauseStartTime;
      this.pauseStartTime = 0;
    }
    this.start();
  }

  public stop(): void {
    this.shouldKeepListening = false;
    this.isPaused = false;
    this.interimText = '';
    this.onInterimChange?.('');

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    this.isListening = false;
    this.onStatusChange?.(false);
  }

  public clear(): void {
    this.fullText = '';
    this.interimText = '';
    this.transcriptItems = [];
    this.startTime = 0;
    this.pausedDuration = 0;
    this.pauseStartTime = 0;
    this.isPaused = false;

    if (this.storageKey && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.storageKey);
      } catch (e) {}
    }

    this.onInterimChange?.('');
    this.onFinalChange?.('', []);
  }

  public setLanguage(lang: SpeechLanguage): void {
    this.lang = lang;
    const wasListening = this.isListening;
    if (this.recognition) {
      this.stop();
      this.recognition = null;
    }
    if (wasListening) {
      this.start();
    }
  }

  public setFullTextManual(text: string): void {
    this.fullText = text;
    this.saveToStorage();
    this.onFinalChange?.(this.fullText, [...this.transcriptItems]);
  }

  public getFullText(): string {
    return this.fullText;
  }

  public getItems(): SpeechRecognitionResultItem[] {
    return [...this.transcriptItems];
  }

  public getElapsedSeconds(): number {
    if (this.startTime === 0) return 0;
    const currentEnd = this.isPaused && this.pauseStartTime > 0 ? this.pauseStartTime : Date.now();
    const totalMs = currentEnd - this.startTime - this.pausedDuration;
    return Math.max(0, Math.floor(totalMs / 1000));
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  private saveToStorage(): void {
    if (this.storageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            fullText: this.fullText,
            transcriptItems: this.transcriptItems,
            updatedAt: new Date().toISOString(),
          })
        );
      } catch (e) {}
    }
  }

  private formatTimestamp(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }
}
