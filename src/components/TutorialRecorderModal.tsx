'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Video, Mic, MicOff, Play, Pause, Square, Scissors, 
  UploadCloud, CheckCircle2, AlertCircle, Sparkles, Clock, 
  RotateCcw, Check, Loader2, ExternalLink, FastForward, Rewind, Eye
} from 'lucide-react';
import { TutorialVideoItem } from '@/types';
import { uploadLargeRecordingDirectToDrive, formatDuration, OFFICIAL_DRIVE_FOLDER_ID } from '@/services/gravacoesService';
import { saveTutorial } from '@/services/ajudaService';

interface TutorialRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorial: TutorialVideoItem;
  onSaved?: (updated: TutorialVideoItem) => void;
}

export const TutorialRecorderModal: React.FC<TutorialRecorderModalProps> = ({
  isOpen,
  onClose,
  tutorial,
  onSaved,
}) => {
  // Etapa do fluxo: 'record' -> 'trim' -> 'uploading' -> 'success'
  const [step, setStep] = useState<'record' | 'trim' | 'uploading' | 'success'>('record');

  // Gravação
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [includeMic, setIncludeMic] = useState<boolean>(true);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  // Recorte (Trimming)
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);

  // Upload
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusStep, setUploadStatusStep] = useState<string>('');
  const [uploadedDriveUrl, setUploadedDriveUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Limpa estados ao fechar ou abrir
  useEffect(() => {
    if (isOpen) {
      setStep('record');
      setIsRecording(false);
      setRecordingTime(0);
      setRecordedBlob(null);
      setRecordedVideoUrl(null);
      setTrimStart(0);
      setTrimEnd(0);
      setVideoDuration(0);
      setUploadProgress(0);
      setErrorMessage(null);
    } else {
      stopRecordingCleanup();
    }
  }, [isOpen]);

  const stopRecordingCleanup = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  // Inicia a Captura de Tela / Aba com Áudio
  const handleStartRecording = async () => {
    setErrorMessage(null);
    try {
      // 1. Captura a tela ou aba
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          frameRate: { ideal: 30, max: 60 },
        },
        audio: true,
      });

      let finalStream = displayStream;

      // 2. Se microfone estiver ativo, mixa ou combina faixa de áudio
      if (includeMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });

          const audioContext = new AudioContext();
          const destination = audioContext.createMediaStreamDestination();

          if (displayStream.getAudioTracks().length > 0) {
            const displaySource = audioContext.createMediaStreamSource(displayStream);
            displaySource.connect(destination);
          }

          const micSource = audioContext.createMediaStreamSource(micStream);
          micSource.connect(destination);

          const combinedTracks = [
            ...displayStream.getVideoTracks(),
            ...destination.stream.getAudioTracks(),
          ];
          finalStream = new MediaStream(combinedTracks);
        } catch (micErr) {
          console.warn('Microfone não acessível, prosseguindo apenas com áudio do sistema:', micErr);
        }
      }

      streamRef.current = finalStream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const mediaRecorder = new MediaRecorder(finalStream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setRecordedVideoUrl(url);
        setIsRecording(false);
        setStep('trim');
      };

      // Se o usuário fechar o compartilhamento da tela nativo do navegador
      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          handleStopRecording();
        };
      }

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Erro ao iniciar gravação de tela:', err);
      if (err.name !== 'NotAllowedError') {
        setErrorMessage('Não foi possível iniciar a gravação. Verifique as permissões de tela do navegador.');
      }
    }
  };

  // Para a gravação
  const handleStopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Carrega vídeo gravado ou selecionado localmente
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecordedBlob(file);
      const url = URL.createObjectURL(file);
      setRecordedVideoUrl(url);
      setStep('trim');
    }
  };

  // Carrega metadados do vídeo para definir limites de corte
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setVideoDuration(dur);
      setTrimStart(0);
      setTrimEnd(dur);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (isPlayingPreview && videoRef.current.currentTime >= trimEnd) {
        videoRef.current.pause();
        setIsPlayingPreview(false);
      }
    }
  };

  // Toca apenas o trecho recortado
  const handlePlayTrimmedPreview = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = trimStart;
      videoRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const formatTimeSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`;
  };

  const trimmedDuration = Math.max(0, trimEnd - trimStart);
  const formattedTrimmedDuration = `${String(Math.floor(trimmedDuration / 60)).padStart(2, '0')}:${String(Math.floor(trimmedDuration % 60)).padStart(2, '0')}`;

  // Executa o envio para o Google Drive e atualiza o card
  const handleSaveAndPublish = async () => {
    if (!recordedBlob) return;

    setStep('uploading');
    setUploadProgress(0);
    setUploadStatusStep('Iniciando sessão segura no Google Drive...');
    setErrorMessage(null);

    try {
      const safeTitle = `Tutorial_${tutorial.audience.toUpperCase()}_${tutorial.title.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      const fileName = `${safeTitle}.webm`;

      // Upload direto (Resumable Upload) sem limite da Vercel
      const uploadRes = await uploadLargeRecordingDirectToDrive({
        videoFileOrBlob: recordedBlob,
        fileName,
        disciplinaId: 'disc-tutoriais-global',
        disciplinaName: 'Central de Ajuda Koinonia LMS',
        title: `${tutorial.title} (Tutorial Oficial)`,
        dataAula: new Date().toLocaleDateString('pt-BR'),
        recordedByName: 'Coordenação LMS',
        recordedByEmail: 'sacrasub@gmail.com',
        durationSeconds: Math.round(trimmedDuration || videoDuration || recordingTime),
        folderId: OFFICIAL_DRIVE_FOLDER_ID,
        onProgress: (percent, status) => {
          setUploadProgress(percent);
          if (status) setUploadStatusStep(status);
        },
      });


      if (!uploadRes.success || !uploadRes.webViewLink) {
        throw new Error('Falha ao obter link de visualização do Google Drive.');
      }

      setUploadedDriveUrl(uploadRes.webViewLink);

      // Atualiza o tutorial no banco de dados e localmente
      const updatedTutorial: TutorialVideoItem = {
        ...tutorial,
        video_url: uploadRes.webViewLink,
        duration: formattedTrimmedDuration !== '00:00' ? formattedTrimmedDuration : tutorial.duration,
        updated_at: new Date().toISOString().slice(0, 10),
      };

      saveTutorial(updatedTutorial);
      if (onSaved) onSaved(updatedTutorial);

      setStep('success');
    } catch (err: any) {
      console.error('Erro no upload do tutorial:', err);
      setErrorMessage(err.message || 'Falha ao salvar vídeo no Google Drive.');
      setStep('trim');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-200">
        
        {/* CABEÇALHO DO GRAVADOR */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600 text-white rounded-xl shadow-md">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/40 px-2 py-0.5 rounded-full">
                  Trilha: {tutorial.audience.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Meta: {tutorial.duration}
                </span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-white truncate max-w-md mt-0.5">
                Gravando: {tutorial.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPO DO MODAL (FLUXO) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TELEPROMPTER / ROTEIRO DO TUTORIAL */}
          <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white p-4 rounded-2xl border border-blue-800/40 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Roteiro & Tópicos para Demonstrar na Tela:</span>
              </span>
              <span className="text-[10px] bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded-md font-mono">
                {tutorial.category}
              </span>
            </div>

            {tutorial.script_summary && (
              <p className="text-xs text-slate-200 italic bg-blue-900/30 p-2.5 rounded-xl border border-blue-700/40">
                "{tutorial.script_summary}"
              </p>
            )}

            {tutorial.topics && tutorial.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tutorial.topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-white/10 text-slate-200 px-2 py-0.5 rounded-lg border border-white/10 font-semibold"
                  >
                    ✓ {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ETAPA 1: GRAVAÇÃO */}
          {step === 'record' && (
            <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-6 text-center shadow-xs">
              {!isRecording ? (
                <div className="space-y-5">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200/80 max-w-md mx-auto space-y-3">
                    <label className="flex items-center justify-center gap-2.5 text-xs font-extrabold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMic}
                        onChange={(e) => setIncludeMic(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>Incluir meu Microfone na gravação (Locução)</span>
                    </label>

                    <p className="text-[11px] text-gray-500">
                      Ao clicar em iniciar, selecione a <strong>Aba do Navegador</strong> ou <strong>Janela</strong> do LMS para gravar.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="w-full sm:w-auto px-6 py-3.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer border border-red-400"
                    >
                      <Video className="w-5 h-5" />
                      <span>🔴 Iniciar Gravação da Tela ou Aba</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Escolher Vídeo do Computador</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-5 py-4">
                  <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-red-50 border-2 border-red-500 text-red-900 rounded-full font-mono text-lg font-black animate-pulse shadow-md">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping" />
                    <span>GRAVANDO: {formatDuration(recordingTime)}</span>
                  </div>

                  <p className="text-xs text-gray-600 max-w-sm mx-auto">
                    Navegue pela tela do LMS e faça a locução do tutorial. Quando terminar, clique no botão abaixo para recortar o início e o fim:
                  </p>

                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2 mx-auto cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-red-500 text-red-500" />
                    <span>Concluir Gravação & Ir para o Recorte</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ETAPA 2: RECORTE (TRIMMING) INÍCIO E FIM */}
          {step === 'trim' && recordedVideoUrl && (
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 space-y-5 shadow-xs animate-in fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-purple-600" />
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Ajuste Fino: Recortar Início e Fim do Vídeo
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold bg-purple-100 text-purple-900 px-2.5 py-1 rounded-full">
                  Duração Final: {formattedTrimmedDuration}
                </span>
              </div>

              {/* Player do Vídeo para Visualização do Corte */}
              <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-md">
                <video
                  ref={videoRef}
                  src={recordedVideoUrl}
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onTimeUpdate={handleVideoTimeUpdate}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              {/* CONTROLES DE CORTE */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                  <span>Posição Atual: <strong className="font-mono text-blue-700">{formatTimeSec(currentTime)}</strong></span>
                  <span>Duração Original: <strong className="font-mono">{formatTimeSec(videoDuration)}</strong></span>
                </div>

                {/* Sliders de Início e Fim */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Ponto de Início */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800">Início do Vídeo:</span>
                      <span className="font-mono font-black text-purple-700 text-xs">
                        {formatTimeSec(trimStart)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, trimEnd - 1)}
                      step={0.5}
                      value={trimStart}
                      onChange={(e) => setTrimStart(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <div className="flex items-center justify-between gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setTrimStart((prev) => Math.max(0, prev - 1))}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold rounded-md"
                      >
                        -1s
                      </button>
                      <button
                        type="button"
                        onClick={() => setTrimStart(currentTime)}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-extrabold rounded-md flex-1 text-center"
                      >
                        Marcar Posição Atual
                      </button>
                      <button
                        type="button"
                        onClick={() => setTrimStart((prev) => Math.min(trimEnd - 1, prev + 1))}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold rounded-md"
                      >
                        +1s
                      </button>
                    </div>
                  </div>

                  {/* Ponto de Fim */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800">Fim do Vídeo:</span>
                      <span className="font-mono font-black text-purple-700 text-xs">
                        {formatTimeSec(trimEnd)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={Math.min(videoDuration, trimStart + 1)}
                      max={videoDuration || 100}
                      step={0.5}
                      value={trimEnd}
                      onChange={(e) => setTrimEnd(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <div className="flex items-center justify-between gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => setTrimEnd((prev) => Math.max(trimStart + 1, prev - 1))}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold rounded-md"
                      >
                        -1s
                      </button>
                      <button
                        type="button"
                        onClick={() => setTrimEnd(currentTime)}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-extrabold rounded-md flex-1 text-center"
                      >
                        Marcar Posição Atual
                      </button>
                      <button
                        type="button"
                        onClick={() => setTrimEnd((prev) => Math.min(videoDuration, prev + 1))}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold rounded-md"
                      >
                        +1s
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handlePlayTrimmedPreview}
                    className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>▶️ Testar Apenas Trecho Cortado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('record');
                      setRecordedBlob(null);
                      setRecordedVideoUrl(null);
                    }}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Regravar</span>
                  </button>
                </div>
              </div>

              {/* Botão de Envio e Publicação no Card */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndPublish}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer border border-emerald-400"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Salvar Vídeo no Google Drive & Publicar no Card</span>
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 3: UPLOAD DIRETO PARA O GOOGLE DRIVE */}
          {step === 'uploading' && (
            <div className="bg-white p-8 rounded-3xl border border-gray-200 text-center space-y-5 shadow-sm animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-slate-900">
                  Enviando Gravação Diretamente para o Google Drive
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  {uploadStatusStep || 'Transmitindo bytes para a pasta oficial de tutoriais...'}
                </p>
              </div>

              {/* Barra de Progresso Real */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                  <span>Progresso do Upload:</span>
                  <span className="font-mono text-blue-700 font-black">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-gray-200">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${Math.max(uploadProgress, 4)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 4: SUCESSO */}
          {step === 'success' && (
            <div className="bg-white p-8 rounded-3xl border border-emerald-300 text-center space-y-5 shadow-sm animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-400">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div className="space-y-1.5">
                <h4 className="font-extrabold text-lg text-slate-900">
                  Vídeo Publicado com Sucesso no Card!
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  A gravação foi salva no Google Drive oficial e o card <strong>"{tutorial.title}"</strong> já está atualizado para todos os alunos e docentes.
                </p>
              </div>

              {uploadedDriveUrl && (
                <div className="pt-2">
                  <a
                    href={uploadedDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Ver Vídeo no Google Drive</span>
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-3 bg-blue-950 hover:bg-blue-900 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Concluir & Voltar para a Central de Ajuda
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
