'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Video, Mic, MicOff, Play, Pause, Square, Download, 
  UploadCloud, CheckCircle2, AlertCircle, Sparkles, Clock, FolderOpen, 
  Layers, ExternalLink, ShieldCheck, Check, Copy, HelpCircle,
  Minimize2, Maximize2, Lock, Smartphone, Loader2, RefreshCw, Trash2, Unlock,
  Bot, Timer
} from 'lucide-react';
import { Disciplina, UserRole } from '@/types';
import { getAllDisciplinas } from '@/services/disciplinasService';
import { getAuthorizedUserInfo } from '@/lib/authConfig';
import { getDateForLesson, getAulaEmAndamentoHoje } from '@/lib/semesterUtils';
import { 
  addGravacao, 
  formatDuration, 
  OFFICIAL_DRIVE_RECORDINGS_FOLDER,
  OFFICIAL_DRIVE_FOLDER_ID,
  startActiveRecording,
  stopActiveRecording,
  forceClearActiveRecordingForAula,
  clearAllActiveRecordings,
  isAulaBeingRecordedByOther,
  uploadRecordingToGoogleDrive,
  uploadLargeRecordingDirectToDrive,
  getActiveRecordings,
  ActiveRecordingSession
} from '@/services/gravacoesService';
import {
  initLocalRecordingSession,
  appendRecordingChunk,
  assembleRecordingBlob,
  updateLocalRecordingStatus,
  getPendingLocalRecordings,
  deleteLocalRecording,
  LocalRecordingSession
} from '@/services/recordingStorageService';

interface AulaRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDisciplinaId?: string;
  defaultAulaNum?: number;
  initialMode?: 'screen' | 'file' | 'link' | 'autopilot';
  userEmail?: string;
  currentRole?: UserRole;
  onRecordingSaved?: () => void;
}

export const AulaRecorderModal: React.FC<AulaRecorderModalProps> = ({
  isOpen,
  onClose,
  defaultDisciplinaId,
  defaultAulaNum = 1,
  initialMode,
  userEmail = 'sacrasub@gmail.com',
  currentRole = 'monitor',
  onRecordingSaved
}) => {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  const authInfo = getAuthorizedUserInfo(normalizedEmail);
  const isSacramento = normalizedEmail.includes('sacrasub') || normalizedEmail.includes('riffocristianmision');
  const effectiveRoles = [
    ...(authInfo.user?.roles || []),
    ...(currentRole ? [currentRole] : []),
  ];
  const hasRecordingPermission = isSacramento || effectiveRoles.includes('monitor') || effectiveRoles.includes('admin') || effectiveRoles.includes('professor');

  // Estados de Configuração
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [selectedDisciplinaId, setSelectedDisciplinaId] = useState<string>(defaultDisciplinaId || '');
  const [aulaNum, setAulaNum] = useState<number>(defaultAulaNum);
  const [dataAula, setDataAula] = useState<string>(new Date().toLocaleDateString('pt-BR'));
  const [includeMic, setIncludeMic] = useState<boolean>(true);
  const [activeTabMode, setActiveTabMode] = useState<'screen' | 'file' | 'link' | 'autopilot'>(initialMode || 'screen');
  const [directDriveUrl, setDirectDriveUrl] = useState<string>('');
  const [directRecordingTitle, setDirectRecordingTitle] = useState<string>('');

  // Estados do Piloto Automático & Auto-Stop (Cristiano / Monitoria / Admin)
  const [isAutoPilot, setIsAutoPilot] = useState<boolean>(initialMode === 'autopilot');
  const [autoStopDurationMinutes, setAutoStopDurationMinutes] = useState<number>(120); // 2h padrão
  const [autoStopMode, setAutoStopMode] = useState<'duration' | 'fixed_time'>('duration');
  const [autoStopFixedTime, setAutoStopFixedTime] = useState<string>('22:00');
  const [autoUploadDrive, setAutoUploadDrive] = useState<boolean>(true);
  const [autoDownloadBackup, setAutoDownloadBackup] = useState<boolean>(true);
  const [autoStopRemainingSeconds, setAutoStopRemainingSeconds] = useState<number | null>(null);
  const autoStopTargetTimeRef = useRef<number | null>(null);

  // Estados do Gravador
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string>('');
  const [customFile, setCustomFile] = useState<File | null>(null);

  // Estados de Upload Automático no Google Drive
  const [isUploadingToDrive, setIsUploadingToDrive] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusStep, setUploadStatusStep] = useState<string>('');
  const [uploadedDriveUrl, setUploadedDriveUrl] = useState<string | null>(null);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Recuperação Anti-Perda (IndexedDB)
  const [pendingRecoveries, setPendingRecoveries] = useState<LocalRecordingSession[]>([]);
  const [recoveringKey, setRecoveringKey] = useState<string | null>(null);

  // Estado de Minimização (Para navegar livremente no LMS durante a gravação)
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Permissão efetiva (Se o modal estiver aberto explicitamente, sempre renderiza)
  const isAllowed = isOpen || hasRecordingPermission || recordingState !== 'idle' || isUploadingToDrive;

  // Sessão de Lock Ativo
  const [activeSessionKey, setActiveSessionKey] = useState<string | null>(null);
  const [lockedByOther, setLockedByOther] = useState<ActiveRecordingSession | null>(null);
  const [activeCloudSession, setActiveCloudSession] = useState<ActiveRecordingSession | null>(null);

  // Refs de Mídia e Estado Estável
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chunkIndexRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentSessionKeyRef = useRef<string | null>(null);
  const currentRecordingTimeRef = useRef<number>(0);

  // Sincroniza refs com estado
  useEffect(() => {
    currentRecordingTimeRef.current = recordingTime;
  }, [recordingTime]);

  useEffect(() => {
    currentSessionKeyRef.current = activeSessionKey;
  }, [activeSessionKey]);

  const syncActiveCloudSessions = () => {
    const list = getActiveRecordings();
    if (list.length > 0) {
      setActiveCloudSession(list[0]);
      if (recordingState === 'idle') {
        if (!defaultDisciplinaId && list[0].disciplinaId) {
          setSelectedDisciplinaId(list[0].disciplinaId);
        }
        if (list[0].aulaNum) {
          setAulaNum(list[0].aulaNum);
        }
      }
    } else {
      setActiveCloudSession(null);
    }
  };

  // Carrega disciplinas e pré-configura a aula em andamento
  useEffect(() => {
    const all = getAllDisciplinas();
    setDisciplinas(all);
    if (!selectedDisciplinaId && all.length > 0) {
      const aulaEmAndamento = getAulaEmAndamentoHoje(all);
      if (defaultDisciplinaId) {
        setSelectedDisciplinaId(defaultDisciplinaId);
      } else if (aulaEmAndamento) {
        setSelectedDisciplinaId(aulaEmAndamento.disciplinaId);
        setAulaNum(defaultAulaNum || aulaEmAndamento.aulaNum);
        setDataAula(aulaEmAndamento.dataAula);
      } else {
        setSelectedDisciplinaId(all[0].id);
      }
    }
  }, [defaultDisciplinaId, selectedDisciplinaId, defaultAulaNum]);

  // Ao abrir o modal, sempre garante a pré-configuração inteligente da aula em andamento
  useEffect(() => {
    if (isOpen && recordingState === 'idle') {
      setIsMinimized(false);
      checkPendingRecoveries();
      syncActiveCloudSessions();

      const all = getAllDisciplinas();
      const aulaEmAndamento = getAulaEmAndamentoHoje(all);

      if (defaultDisciplinaId) {
        setSelectedDisciplinaId(defaultDisciplinaId);
      } else if (aulaEmAndamento) {
        setSelectedDisciplinaId(aulaEmAndamento.disciplinaId);
      }

      if (defaultAulaNum) {
        setAulaNum(defaultAulaNum);
      } else if (aulaEmAndamento) {
        setAulaNum(aulaEmAndamento.aulaNum);
        setDataAula(aulaEmAndamento.dataAula);
      }

      const mode = initialMode || 'autopilot';
      setActiveTabMode(mode);
      if (mode === 'autopilot') {
        setIsAutoPilot(true);
      }
    }
  }, [isOpen, defaultDisciplinaId, defaultAulaNum, initialMode]);

  // Atualiza a data sugerida da aula ao mudar a disciplina ou número
  useEffect(() => {
    if (recordingState === 'idle' && selectedDisciplinaId) {
      const disc = disciplinas.find((d) => d.id === selectedDisciplinaId);
      if (disc) {
        const calculatedDate = getDateForLesson(aulaNum - 1, disc.day_of_week);
        setDataAula(calculatedDate);
      }
    }
  }, [selectedDisciplinaId, aulaNum, disciplinas, recordingState]);

  const calculateAutoStopTargetTimestamp = (): number => {
    if (autoStopMode === 'fixed_time') {
      const now = new Date();
      const [hours, minutes] = autoStopFixedTime.split(':').map(Number);
      const target = new Date();
      target.setHours(hours || 22, minutes || 0, 0, 0);
      if (target.getTime() <= now.getTime()) {
        return now.getTime() + 120 * 60 * 1000;
      }
      return target.getTime();
    } else {
      return Date.now() + autoStopDurationMinutes * 60 * 1000;
    }
  };

  const getEstimatedEndTimeString = (): string => {
    if (autoStopMode === 'fixed_time') {
      return autoStopFixedTime;
    }
    const end = new Date(Date.now() + autoStopDurationMinutes * 60 * 1000);
    const h = String(end.getHours()).padStart(2, '0');
    const m = String(end.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const checkPendingRecoveries = async () => {
    try {
      const list = await getPendingLocalRecordings();
      setPendingRecoveries(list);
    } catch (e) {}
  };

  useEffect(() => {
    checkPendingRecoveries();
    syncActiveCloudSessions();
  }, []);

  // Alerta antes de descarregar a página caso haja gravação em andamento
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (recordingState === 'recording' || recordingState === 'paused' || isUploadingToDrive) {
        e.preventDefault();
        e.returnValue = 'Existe uma gravação ou envio para o Google Drive em andamento. Deseja realmente sair?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [recordingState, isUploadingToDrive]);

  // Verifica concorrência
  useEffect(() => {
    if (selectedDisciplinaId) {
      const other = isAulaBeingRecordedByOther(selectedDisciplinaId, aulaNum, normalizedEmail);
      setLockedByOther(other || null);
    }
    syncActiveCloudSessions();
  }, [selectedDisciplinaId, aulaNum, normalizedEmail, isOpen]);

  useEffect(() => {
    const handleActiveChange = () => {
      if (selectedDisciplinaId) {
        const other = isAulaBeingRecordedByOther(selectedDisciplinaId, aulaNum, normalizedEmail);
        setLockedByOther(other || null);
      }
      syncActiveCloudSessions();
    };
    window.addEventListener('lms_active_recordings_updated', handleActiveChange);
    return () => window.removeEventListener('lms_active_recordings_updated', handleActiveChange);
  }, [selectedDisciplinaId, aulaNum, normalizedEmail]);

  // Limpeza de streams ao desmontar
  useEffect(() => {
    return () => {
      stopTracks();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const selectedDisciplina = disciplinas.find((d) => d.id === selectedDisciplinaId);

  const getMonitorDisplayName = () => {
    if (normalizedEmail.includes('sacra') || normalizedEmail.includes('cristiano') || normalizedEmail.includes('riffocristianmision')) {
      return 'Monitor Cristiano';
    }
    if (normalizedEmail.includes('camila')) return 'Monitora Camila';
    if (normalizedEmail.includes('rosiane')) return 'Monitora Rosiane';
    if (normalizedEmail.includes('andre')) return 'Monitor André';
    if (normalizedEmail.includes('daniel')) return 'Monitor Daniel';
    if (normalizedEmail.includes('renata')) return 'Monitora Renata';
    if (normalizedEmail.includes('thiago')) return 'Monitor Thiago';
    if (normalizedEmail.includes('julia')) return 'Monitora Júlia';
    if (normalizedEmail.includes('paulo')) return 'Monitor Paulo Roberto';
    if (normalizedEmail.includes('robert')) return 'Monitor Robert';
    if (authInfo.user?.name) {
      return `Monitor ${authInfo.user.name.split(' ')[0]}`;
    }
    return 'Monitor Cristiano';
  };

  // =========================================================================
  // PIPELINE DE UPLOAD AUTOMÁTICO IMEDIATO NO GOOGLE DRIVE
  // =========================================================================
  const executeAutoUploadPipeline = async (
    videoBlobOrFile: Blob | File,
    fileName: string,
    durationSecs: number,
    sessionKeyToClear?: string | null,
    overrideDisc?: Disciplina,
    overrideAulaNum?: number
  ) => {
    const disc = overrideDisc || selectedDisciplina;
    const targetAulaNum = overrideAulaNum || aulaNum;
    if (!disc) {
      setErrorMessage('Disciplina não identificada para o upload.');
      return;
    }

    setIsUploadingToDrive(true);
    setUploadProgress(0);
    setErrorMessage(null);
    setUploadStatusStep('Iniciando envio para o Google Drive...');

    try {
      const response = await uploadLargeRecordingDirectToDrive({
        videoFileOrBlob: videoBlobOrFile,
        fileName,

        disciplinaId: disc.id,
        disciplinaName: disc.name,
        aulaNum: targetAulaNum,
        dataAula: dataAula.trim() || new Date().toLocaleDateString('pt-BR'),
        recordedByName: getMonitorDisplayName(),
        recordedByEmail: normalizedEmail,
        recordedByRole: currentRole,
        durationSeconds: durationSecs,
        title: `Aula ${targetAulaNum} • ${disc.name} (Gravação HD)`,
        folderId: OFFICIAL_DRIVE_FOLDER_ID,
        onProgress: (pct) => {
          setUploadProgress(pct);
          setUploadStatusStep(`Enviando para o Google Drive: ${pct}%...`);
        },
      });

      if (response.success) {
        setUploadedDriveUrl(response.webViewLink);
        setIsSavedSuccess(true);
        setUploadProgress(100);
        setUploadStatusStep('Gravação salva e sincronizada na nuvem com sucesso!');

        // Atualiza IndexedDB
        if (sessionKeyToClear) {
          await updateLocalRecordingStatus(sessionKeyToClear, 'uploaded', {
            driveFileId: response.driveFileId,
            driveWebViewLink: response.webViewLink,
          });
          // Remove chunks do IndexedDB para economizar espaço
          await deleteLocalRecording(sessionKeyToClear);
          checkPendingRecoveries();
        }

        // Libera o lock de gravação ativa na nuvem
        const keyToRelease = sessionKeyToClear || currentSessionKeyRef.current;
        if (keyToRelease) {
          await stopActiveRecording(keyToRelease);
        }
        await forceClearActiveRecordingForAula(disc.id, targetAulaNum);

        setActiveSessionKey(null);
        currentSessionKeyRef.current = null;

        if (onRecordingSaved) onRecordingSaved();
      } else {
        throw new Error('Falha no upload do Google Drive.');
      }
    } catch (err: any) {
      console.error('Erro no upload para o Google Drive:', err);
      setErrorMessage(
        err.message || 'Aviso no envio automático. O vídeo foi salvo no navegador e você pode baixá-lo ou reenviar.'
      );
      if (sessionKeyToClear) {
        await updateLocalRecordingStatus(sessionKeyToClear, 'completed');
      }
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  // =========================================================================
  // INICIAR GRAVAÇÃO COM PERSISTÊNCIA CONTÍNUA (INDEXEDDB)
  // =========================================================================
  const startRecording = async (isAutopilotRun = false) => {
    // Verifica concorrência
    if (selectedDisciplinaId) {
      const other = isAulaBeingRecordedByOther(selectedDisciplinaId, aulaNum, normalizedEmail);
      if (other) {
        setLockedByOther(other);
        setErrorMessage(`Esta aula já está sendo gravada por ${other.recordedByName} (${other.recordedByEmail}).`);
        return;
      }
    }

    setErrorMessage(null);
    setIsSavedSuccess(false);
    chunksRef.current = [];
    chunkIndexRef.current = 0;

    const activateAutopilot = isAutopilotRun || activeTabMode === 'autopilot' || isAutoPilot;
    if (activateAutopilot) {
      const targetTs = calculateAutoStopTargetTimestamp();
      autoStopTargetTimeRef.current = targetTs;
      const initialRemaining = Math.max(0, Math.round((targetTs - Date.now()) / 1000));
      setAutoStopRemainingSeconds(initialRemaining);
      setIsAutoPilot(true);
    } else {
      autoStopTargetTimeRef.current = null;
      setAutoStopRemainingSeconds(null);
    }

    try {
      // 1. Captura a tela/aba (Google Meet) com áudio do sistema
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          frameRate: { ideal: 30, max: 60 },
        } as MediaTrackConstraints,
        audio: true,
      });

      let finalStream: MediaStream = displayStream;

      // 2. Mescla microfone se selecionado
      if (includeMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const destination = audioCtx.createMediaStreamDestination();

          const displayAudioTracks = displayStream.getAudioTracks();
          if (displayAudioTracks.length > 0) {
            const displaySource = audioCtx.createMediaStreamSource(new MediaStream(displayAudioTracks));
            displaySource.connect(destination);
          }

          const micSource = audioCtx.createMediaStreamSource(micStream);
          micSource.connect(destination);

          const videoTrack = displayStream.getVideoTracks()[0];
          finalStream = new MediaStream([videoTrack, ...destination.stream.getAudioTracks()]);
        } catch (micErr) {
          console.warn('Microfone não acessível, prosseguindo com áudio da aba:', micErr);
        }
      }

      streamRef.current = finalStream;

      // Detecta formato suportado
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      const recorder = new MediaRecorder(finalStream, { mimeType });
      mediaRecorderRef.current = recorder;

      const sessionKey = `${selectedDisciplinaId}_aula_${aulaNum}_${new Date().toISOString().slice(0, 10)}_${Date.now()}`;
      setActiveSessionKey(sessionKey);
      currentSessionKeyRef.current = sessionKey;

      // Registra no IndexedDB para proteção contínua
      await initLocalRecordingSession({
        key: sessionKey,
        disciplinaId: selectedDisciplinaId,
        disciplinaName: selectedDisciplina?.name || 'Aula ao Vivo',
        aulaNum,
        dataAula: dataAula.trim() || new Date().toLocaleDateString('pt-BR'),
        recordedByName: getMonitorDisplayName(),
        recordedByEmail: normalizedEmail,
        recordedByRole: currentRole,
        mimeType,
        durationSeconds: 0,
        startedAt: new Date().toISOString(),
        status: 'recording',
      });

      // Coleta chunks a cada 1 segundo e persiste em IndexedDB
      recorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
          const currentIndex = chunkIndexRef.current++;
          await appendRecordingChunk(sessionKey, currentIndex, event.data, currentRecordingTimeRef.current);
        }
      };

      // QUANDO A GRAVAÇÃO PARAR: GERA BLOB E DISPARA UPLOAD AUTOMÁTICO IMEDIATO
      recorder.onstop = async () => {
        const finalDuration = currentRecordingTimeRef.current;
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);

        const safeDiscName = (selectedDisciplina?.name || 'Aula')
          .replace(/[^a-zA-Z0-9]/g, '_')
          .substring(0, 30);
        const fileName = `LMS_UIECB_Aula_${String(aulaNum).padStart(2, '0')}_${safeDiscName}_${new Date().toISOString().slice(0, 10)}.webm`;
        setVideoFileName(fileName);

        setRecordingState('stopped');
        stopTracks();
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

        // Atualiza IndexedDB
        await updateLocalRecordingStatus(sessionKey, 'completed', {
          durationSeconds: finalDuration,
          blobSize: blob.size,
        });

        // Se contingência local estiver ativada, baixa o arquivo no computador
        if (autoDownloadBackup && (isAutoPilot || activeTabMode === 'autopilot')) {
          try {
            const dlUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = dlUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } catch (dlErr) {
            console.warn('Erro ao disparar download automático de contingência:', dlErr);
          }
        }

        // DISPARO AUTOMÁTICO IMEDIATO PARA O GOOGLE DRIVE
        if (autoUploadDrive || !isAutoPilot) {
          await executeAutoUploadPipeline(blob, fileName, finalDuration, sessionKey);
        }
      };

      // SE O USUÁRIO FECHAR A ABA DO GOOGLE MEET OU PARAR COMPARTILHAMENTO
      const videoTrack = displayStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            stopRecording();
          }
        };
      }

      recorder.start(1000); // 1s slice
      setRecordingState('recording');
      setRecordingTime(0);

      // Registra lock na nuvem para os outros monitores
      await startActiveRecording({
        key: sessionKey,
        disciplinaId: selectedDisciplinaId,
        disciplinaName: selectedDisciplina?.name || 'Aula ao Vivo',
        aulaNum,
        dataAula: dataAula.trim() || new Date().toLocaleDateString('pt-BR'),
        recordedByName: getMonitorDisplayName(),
        recordedByEmail: normalizedEmail,
      });

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);

        if (autoStopTargetTimeRef.current) {
          const remaining = Math.max(0, Math.round((autoStopTargetTimeRef.current - Date.now()) / 1000));
          setAutoStopRemainingSeconds(remaining);

          if (remaining <= 0) {
            console.log('🤖 [Piloto Automático] Auto-Stop atingido! Encerrando gravação autônoma...');
            autoStopTargetTimeRef.current = null;
            setAutoStopRemainingSeconds(0);
            stopRecording();
          }
        }
      }, 1000);

      if (activateAutopilot) {
        setTimeout(() => setIsMinimized(true), 400);
      }
    } catch (err: any) {
      console.error('Erro ao iniciar gravação:', err);
      if (err.name !== 'NotAllowedError') {
        setErrorMessage('Não foi possível iniciar a gravação. Verifique as permissões de tela e áudio.');
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);

        if (autoStopTargetTimeRef.current) {
          const remaining = Math.max(0, Math.round((autoStopTargetTimeRef.current - Date.now()) / 1000));
          setAutoStopRemainingSeconds(remaining);

          if (remaining <= 0) {
            autoStopTargetTimeRef.current = null;
            setAutoStopRemainingSeconds(0);
            stopRecording();
          }
        }
      }, 1000);
    }
  };

  const stopRecording = () => {
    setIsMinimized(false); // Auto-expande imediatamente para exibir a conclusão e opções
    autoStopTargetTimeRef.current = null;
    setAutoStopRemainingSeconds(null);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDownloadVideo = () => {
    const blobToDownload = customFile || recordedBlob;
    const urlToDownload = customFile ? URL.createObjectURL(customFile) : recordedVideoUrl;
    if (!blobToDownload || !urlToDownload) return;

    const a = document.createElement('a');
    a.href = urlToDownload;
    a.download = videoFileName || customFile?.name || 'aula_gravada.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Reenviar gravação manualmente
  const handleManualUploadClick = () => {
    const fileToUpload = customFile || recordedBlob;
    if (!fileToUpload || !selectedDisciplina) return;
    const fileName = customFile?.name || videoFileName || `LMS_Aula_${aulaNum}_${selectedDisciplina.name}.webm`;
    executeAutoUploadPipeline(fileToUpload, fileName, recordingTime, activeSessionKey);
  };

  // Enviar gravação recuperada de sessão interrompida
  const handleUploadRecoveredSession = async (session: LocalRecordingSession) => {
    setRecoveringKey(session.key);
    try {
      const recovered = await assembleRecordingBlob(session.key);
      if (!recovered) {
        throw new Error('Não foi possível reconstruir o vídeo salvo.');
      }

      const disc = disciplinas.find((d) => d.id === session.disciplinaId) || {
        id: session.disciplinaId,
        name: session.disciplinaName,
      } as Disciplina;

      const safeDiscName = (session.disciplinaName || 'Aula').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
      const fileName = `LMS_UIECB_Aula_${String(session.aulaNum).padStart(2, '0')}_${safeDiscName}_Recuperada.webm`;

      await executeAutoUploadPipeline(
        recovered.blob,
        fileName,
        session.durationSeconds || 0,
        session.key,
        disc,
        session.aulaNum
      );
    } catch (err: any) {
      alert(`Erro ao enviar gravação recuperada: ${err.message}`);
    } finally {
      setRecoveringKey(null);
    }
  };

  // Baixar gravação recuperada
  const handleDownloadRecoveredSession = async (session: LocalRecordingSession) => {
    try {
      const recovered = await assembleRecordingBlob(session.key);
      if (!recovered) return;
      const url = URL.createObjectURL(recovered.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LMS_UIECB_Recuperada_Aula_${session.aulaNum}_${session.disciplinaName}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Erro ao baixar vídeo recuperado.');
    }
  };

  // Descartar gravação recuperada
  const handleDeleteRecoveredSession = async (sessionKey: string) => {
    if (confirm('Deseja realmente excluir esta gravação temporária salva em disco?')) {
      await deleteLocalRecording(sessionKey);
      await checkPendingRecoveries();
    }
  };

  // Desbloquear sala / Forçar liberação de lock fantasma
  const handleForceUnlockRoom = async () => {
    try {
      if (lockedByOther?.key) {
        await stopActiveRecording(lockedByOther.key);
      }
      if (selectedDisciplinaId) {
        await forceClearActiveRecordingForAula(selectedDisciplinaId, aulaNum);
      }
      await clearAllActiveRecordings();
      setLockedByOther(null);
      setActiveSessionKey(null);
      setErrorMessage(null);
      alert('Sala liberada e gravações ativas resetadas com sucesso!');
    } catch (e) {
      alert('Erro ao liberar sala.');
    }
  };

  // Salvar Link Direto de Vídeo já Existente no Google Drive
  const handleSaveDirectDriveLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!directDriveUrl.trim() || !selectedDisciplina) {
      setErrorMessage('Por favor, informe o link da gravação no Google Drive.');
      return;
    }

    setIsUploadingToDrive(true);
    setErrorMessage(null);
    setUploadStatusStep('Vinculando gravação da aula no LMS...');

    try {
      const finalTitle = directRecordingTitle.trim() || `Aula ${aulaNum} • ${selectedDisciplina.name} (Gravação HD)`;
      addGravacao({
        disciplina_id: selectedDisciplina.id,
        disciplina_name: selectedDisciplina.name,
        aula_num: aulaNum,
        data_aula: dataAula.trim() || new Date().toLocaleDateString('pt-BR'),
        title: finalTitle,
        video_url: directDriveUrl.trim(),
        duration_formatted: 'Aula Gravada',
        duration_seconds: 0,
        recorded_by_name: getMonitorDisplayName(),
        recorded_by_email: normalizedEmail,
        recorded_by_role: currentRole === 'admin' ? 'admin' : currentRole === 'professor' ? 'professor' : 'monitor',
        is_restricted_lms: true,
      });

      setUploadedDriveUrl(directDriveUrl.trim());
      setIsSavedSuccess(true);
      setRecordingState('stopped');
      if (onRecordingSaved) onRecordingSaved();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao vincular gravação do Google Drive.');
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const handleReset = async () => {
    if (activeSessionKey) {
      await stopActiveRecording(activeSessionKey);
      setActiveSessionKey(null);
    }
    setRecordingState('idle');
    setRecordedBlob(null);
    setRecordedVideoUrl(null);
    setCustomFile(null);
    setRecordingTime(0);
    setIsSavedSuccess(false);
    setUploadedDriveUrl(null);
    setIsMinimized(false);
    setErrorMessage(null);
    checkPendingRecoveries();
  };

  const handleCloseModal = async () => {
    if (activeSessionKey && (recordingState === 'idle' || recordingState === 'stopped')) {
      try {
        await stopActiveRecording(activeSessionKey);
      } catch (e) {}
      setActiveSessionKey(null);
    }
    setRecordingState('idle');
    setIsMinimized(false);
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen && recordingState !== 'recording' && recordingState !== 'paused' && !isUploadingToDrive) {
    return null;
  }
  if (!isAllowed) return null;

  // =========================================================================
  // MODO 1: BARRA FLUTUANTE COMPACTA (MINIMIZADA) COM UPLOAD AUTOMÁTICO EM SEGUNDO PLANO
  // =========================================================================
  if (isMinimized) {
    return (
      <div className={`fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-[60] bg-slate-950/95 text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl border border-slate-700/80 backdrop-blur-xl flex items-center gap-3 sm:gap-4 animate-in slide-in-from-bottom-5 duration-300 max-w-lg border-l-4 ${isAutoPilot ? 'border-l-purple-500 shadow-purple-950/40' : 'border-l-red-500'}`}>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {isUploadingToDrive ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            ) : isSavedSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <>
                <div className={`w-3.5 h-3.5 rounded-full ${recordingState === 'recording' ? (isAutoPilot ? 'bg-purple-500 animate-ping' : 'bg-red-500 animate-ping') : 'bg-amber-400'}`} />
                <div className={`w-3.5 h-3.5 rounded-full ${recordingState === 'recording' ? (isAutoPilot ? 'bg-purple-600' : 'bg-red-600') : 'bg-amber-500'} absolute`} />
              </>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-base font-black text-white tracking-wider">
                {isUploadingToDrive ? 'Auto-Salvando...' : isSavedSuccess ? 'Salvo no Drive!' : formatDuration(recordingTime)}
              </span>
              <span className="text-[9px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.2 rounded-full font-black uppercase tracking-wider hidden sm:inline">
                {isUploadingToDrive ? '☁️ Upload Drive' : isSavedSuccess ? '✅ Concluído' : recordingState === 'recording' ? '🔴 Gravando Meet' : '⏸ Pausada'}
              </span>
              {autoStopRemainingSeconds !== null && !isUploadingToDrive && !isSavedSuccess && (
                <span className="text-[10px] bg-purple-500/25 text-purple-300 border border-purple-400/40 px-2 py-0.2 rounded-full font-mono font-bold flex items-center gap-1 animate-pulse">
                  <Bot className="w-3 h-3 text-purple-400" />
                  <span>Auto-Stop: {formatDuration(autoStopRemainingSeconds)}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 truncate max-w-[170px] sm:max-w-[220px] font-medium">
              {selectedDisciplina?.name} • Aula {aulaNum}
            </p>
          </div>
        </div>

        {/* Controles da Barra Flutuante */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {!isUploadingToDrive && !isSavedSuccess && (
            <>
              {recordingState === 'recording' ? (
                <button
                  onClick={pauseRecording}
                  className="p-2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl transition cursor-pointer"
                  title="Pausar gravação"
                >
                  <Pause className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={resumeRecording}
                  className="p-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white rounded-xl transition cursor-pointer"
                  title="Retomar gravação"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={stopRecording}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-xs cursor-pointer active:scale-95"
                title="Finalizar gravação e salvar automaticamente no Google Drive"
              >
                <Square className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={() => setIsMinimized(false)}
            className="py-1.5 px-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer shadow-xs"
            title="Expandir painel do gravador"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expandir</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODO 2: MODAL COMPLETO (EXPANDIDO)
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[95vh]">
        {/* Cabeçalho */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/90 text-white flex items-center justify-center shadow-md animate-pulse">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">Gravador de Aulas • Google Drive</h3>
              <p className="text-xs text-blue-200">Proteção anti-perda contínua: salva e envia automaticamente ao fechar o Meet.</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {(recordingState === 'recording' || recordingState === 'paused' || isUploadingToDrive) && (
              <button
                onClick={() => setIsMinimized(true)}
                className="py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs transition flex items-center gap-1.5 border border-white/20 cursor-pointer shadow-xs"
                title="Minimizar para continuar navegando no LMS enquanto a gravação ou envio corre em segundo plano"
              >
                <Minimize2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Minimizar</span>
              </button>
            )}

            <button
              onClick={() => {
                if (recordingState === 'recording' || recordingState === 'paused') {
                  setIsMinimized(true);
                } else {
                  handleCloseModal();
                }
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-xs transition cursor-pointer"
              title={recordingState === 'recording' ? 'Minimizar gravação' : 'Fechar'}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMessage && (
            <div className="p-4 bg-amber-50 border-2 border-amber-400 text-amber-950 rounded-2xl text-xs space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-extrabold text-amber-950 text-sm">
                      Gravação Preservada no Navegador!
                    </p>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      {errorMessage.includes('storageQuotaExceeded') || errorMessage.includes('storage quota') || errorMessage.includes('Cota do Google Drive')
                        ? 'O Google Drive recusou o upload automático pela conta de serviço (quota de Service Account restrita a Shared Drives). Seu vídeo foi 100% gravado e está pronto para download abaixo:'
                        : errorMessage}
                    </p>
                  </div>
                </div>

                {recordedBlob && (
                  <button
                    type="button"
                    onClick={handleDownloadVideo}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shrink-0 cursor-pointer shadow-md transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Vídeo</span>
                  </button>
                )}
              </div>

              {/* Formulário Rápido para Colar o Link do Drive */}
              <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2">
                <p className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Já enviou para a pasta do Google Drive? Vincule o link aqui:</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/.../view"
                    value={directDriveUrl}
                    onChange={(e) => setDirectDriveUrl(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveDirectDriveLink()}
                    disabled={!directDriveUrl.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition cursor-pointer shrink-0"
                  >
                    Vincular no LMS
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  Fechar Modal
                </button>
              </div>
            </div>
          )}

          {/* PAINEL DE RECUPERAÇÃO ANTI-PERDA (INDEXEDDB) */}
          {pendingRecoveries.length > 0 && recordingState === 'idle' && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-950 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gravação Recuperada em Disco Local (Proteção Anti-Perda)</span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                  {pendingRecoveries.length} pendente(s)
                </span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Encontramos blocos de vídeo gravados de uma sessão anterior salvos com segurança no seu navegador.
              </p>

              <div className="space-y-2 pt-1">
                {pendingRecoveries.map((rec) => (
                  <div key={rec.key} className="p-3 bg-white border border-emerald-200 rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-xs">
                    <div>
                      <h5 className="font-bold text-xs text-gray-900">{rec.disciplinaName} • Aula {rec.aulaNum}</h5>
                      <p className="text-[11px] text-gray-500 font-mono">
                        Duração: {formatDuration(rec.durationSeconds || 0)} • {rec.dataAula}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => handleUploadRecoveredSession(rec)}
                        disabled={Boolean(recoveringKey)}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {recoveringKey === rec.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                        <span>Enviar p/ Drive</span>
                      </button>

                      <button
                        onClick={() => handleDownloadRecoveredSession(rec)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                        title="Baixar cópia local"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteRecoveredSession(rec.key)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
                        title="Descartar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CARD DE SESSÃO ATIVA DETECTADA (QUANDO EM IDLE APÓS RECARREGAR) */}
          {activeCloudSession && recordingState === 'idle' && (
            <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl border-2 border-emerald-500 shadow-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-emerald-400">
                  <Video className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sessão em Andamento: {activeCloudSession.disciplinaName} • Aula {activeCloudSession.aulaNum}</span>
                </div>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2.5 py-0.5 rounded-full font-bold">
                  {activeCloudSession.recordedByName}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                Você possui uma sessão ativa para esta aula. Se você já baixou/salvou o vídeo no seu computador, pode enviá-lo diretamente para o Google Drive ou liberar o status da sala:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDisciplinaId(activeCloudSession.disciplinaId);
                    setAulaNum(activeCloudSession.aulaNum);
                    setActiveTabMode('file');
                    setTimeout(() => fileInputRef.current?.click(), 100);
                  }}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>📁 Enviar Vídeo Salvo no PC p/ o Drive</span>
                </button>

                <button
                  type="button"
                  onClick={handleForceUnlockRoom}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-red-700 text-slate-200 hover:text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <Unlock className="w-4 h-4" />
                  <span>🔓 Liberar Sala / Encerrar Status</span>
                </button>
              </div>
            </div>
          )}

          {/* ALERTA DE BLOQUEIO CONCORRENTE OU SESSÃO ANTERIOR PRESA (POR OUTRO MONITOR) */}
          {lockedByOther && recordingState === 'idle' && !activeCloudSession && (
            <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-2xl text-amber-950 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-amber-900">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sessão de Gravação Ativa na Nuvem</span>
                </div>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Esta aula consta como sendo gravada por <strong>{lockedByOther.recordedByName}</strong> ({lockedByOther.recordedByEmail}).
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200">
                <p className="text-[11px] text-amber-800">
                  Se a aula já encerrou ou o navegador fechou, você pode liberar a sala:
                </p>
                <button
                  type="button"
                  onClick={handleForceUnlockRoom}
                  className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Liberar Sala / Resetar Gravação</span>
                </button>
              </div>
            </div>
          )}

          {/* DICA DE PROTEÇÃO TOTAL */}
          {recordingState === 'idle' && (
            <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-xs text-blue-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-blue-950">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Proteção Anti-Perda e Auto-Upload Ativados:</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed pl-6">
                Ao fechar a chamada do Google Meet ou clicar em finalizar, o vídeo será enviado <strong>automaticamente para a pasta do Google Drive</strong> sem exigir ações manuais. Chunks são salvos continuamente no navegador.
              </p>
            </div>
          )}

          {/* BOTÃO DE DISPARO RÁPIDO SE EM PILOTO AUTOMÁTICO */}
          {recordingState === 'idle' && activeTabMode === 'autopilot' && (
            <div className="p-4 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 rounded-2xl text-white shadow-xl border border-purple-500/50 flex items-center justify-between flex-wrap gap-3 animate-in fade-in">
              <div className="space-y-1 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-400 animate-pulse shrink-0" />
                  <span className="font-extrabold text-sm text-purple-100">Pronto para Gravação Programada</span>
                </div>
                <p className="text-xs text-purple-200/90 font-medium">
                  {selectedDisciplina?.name ? `${selectedDisciplina.name} • Aula ${aulaNum}` : 'Selecione a disciplina'} (Encerra às {getEstimatedEndTimeString()})
                </p>
              </div>

              <button
                type="button"
                disabled={Boolean(lockedByOther)}
                onClick={() => startRecording(true)}
                className="py-3 px-5 bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-xl transition flex items-center gap-2 cursor-pointer animate-pulse"
              >
                <Video className="w-4 h-4" />
                <span>🔴 Começar Gravação (Aba do Meet)</span>
              </button>
            </div>
          )}

          {/* 1. SELEÇÃO DA DISCIPLINA E AULA (Se em modo IDLE) */}
          {recordingState === 'idle' && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTabMode('autopilot');
                    setIsAutoPilot(true);
                  }}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTabMode === 'autopilot' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs' : 'text-purple-700 hover:text-purple-950 hover:bg-purple-100/50'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>🤖 Piloto Automático</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTabMode('screen')}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTabMode === 'screen' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-red-600" />
                  <span>Gravar Tela</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTabMode('file')}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTabMode === 'file' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Enviar Arquivo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTabMode('link')}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTabMode === 'link' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>Link Drive</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Disciplina
                  </label>
                  <select
                    value={selectedDisciplinaId}
                    onChange={(e) => setSelectedDisciplinaId(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {disciplinas.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.day_of_week})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Número da Aula (1 a 18)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={18}
                    value={aulaNum}
                    onChange={(e) => setAulaNum(Number(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Data da Gravação
                  </label>
                  <input
                    type="text"
                    value={dataAula}
                    onChange={(e) => setDataAula(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold bg-white"
                  />
                </div>
              </div>

              {activeTabMode === 'autopilot' ? (
                <div className="pt-3 border-t border-purple-200 space-y-3.5">
                  {/* Banner Explicativo do Piloto Automático */}
                  <div className="p-3.5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl border border-purple-500/40 shadow-sm space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-300">
                      <Bot className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Piloto Automático Sentinela • Gravação Programada</span>
                    </div>
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Planejado para você (Cristiano) colocar a aula para iniciar, entrar na sala e não precisar ficar na frente do computador até o fim. O gravador iniciará e encerrará sozinho com salvamento no Drive.
                    </p>
                  </div>

                  {/* 1. Sala do Google Meet */}
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-blue-600" />
                        <span>Passo 1: Entrar na Sala do Google Meet</span>
                      </span>
                      {selectedDisciplina?.google_meet_url && (
                        <span className="text-[10px] text-blue-700 bg-blue-100/80 font-mono px-2 py-0.5 rounded-full truncate max-w-[180px]">
                          {selectedDisciplina.google_meet_url}
                        </span>
                      )}
                    </div>
                    {selectedDisciplina?.google_meet_url ? (
                      <button
                        type="button"
                        onClick={() => window.open(selectedDisciplina.google_meet_url, '_blank')}
                        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>🚀 1. Abrir Sala do Google Meet da Disciplina</span>
                      </button>
                    ) : (
                      <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                        Nenhum link de Meet vinculado a esta disciplina.
                      </p>
                    )}
                  </div>

                  {/* 2. Temporizador de Auto-Stop */}
                  <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <Timer className="w-3.5 h-3.5 text-purple-600" />
                        <span>Passo 2: Programar Encerramento (Auto-Stop)</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                        Término aprox: {getEstimatedEndTimeString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { label: '60 min (1h)', mins: 60 },
                        { label: '90 min (1h30)', mins: 90 },
                        { label: '120 min (2h)', mins: 120 },
                        { label: '150 min (2h30)', mins: 150 },
                      ].map((item) => (
                        <button
                          key={item.mins}
                          type="button"
                          onClick={() => {
                            setAutoStopMode('duration');
                            setAutoStopDurationMinutes(item.mins);
                          }}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                            autoStopMode === 'duration' && autoStopDurationMinutes === item.mins
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAutoStopMode('fixed_time');
                        setAutoStopFixedTime('22:00');
                      }}
                      className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        autoStopMode === 'fixed_time'
                          ? 'bg-purple-700 text-white shadow-xs'
                          : 'bg-white text-purple-900 border border-purple-200 hover:bg-purple-100'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Parar pontualmente às 22:00 (Término Oficial)</span>
                    </button>
                  </div>

                  {/* 3. Checkboxes de Proteção e Automação */}
                  <div className="p-3 bg-white rounded-2xl border border-gray-200 space-y-2 text-xs">
                    <label className="flex items-center gap-2 font-bold text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoUploadDrive}
                        onChange={(e) => setAutoUploadDrive(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span>☁️ Salvar e Enviar para a Pasta Oficial do Google Drive</span>
                    </label>

                    <label className="flex items-center gap-2 font-bold text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoDownloadBackup}
                        onChange={(e) => setAutoDownloadBackup(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span>💾 Baixar cópia de segurança local (.webm) no seu computador</span>
                    </label>

                    <label className="flex items-center gap-2 font-bold text-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeMic}
                        onChange={(e) => setIncludeMic(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span>🎙️ Incluir áudio do microfone na gravação (opcional)</span>
                    </label>
                  </div>
                </div>
              ) : activeTabMode === 'screen' ? (
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMic}
                      onChange={(e) => setIncludeMic(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>Incluir meu microfone na gravação (Opcional)</span>
                  </label>

                  {includeMic ? (
                    <Mic className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <MicOff className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              ) : activeTabMode === 'file' ? (
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Selecione o arquivo de vídeo gravado no celular ou PC:
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCustomFile(file);
                        setRecordedVideoUrl(URL.createObjectURL(file));
                        setVideoFileName(file.name);
                        setRecordingState('stopped');
                        // Auto-upload do arquivo selecionado
                        executeAutoUploadPipeline(file, file.name, 0);
                      }
                    }}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-900 file:text-white hover:file:bg-blue-800 cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-500">
                    O arquivo será salvo automaticamente na pasta oficial do Google Drive.
                  </p>
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Link do Vídeo na Pasta do Google Drive <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/.../view"
                      value={directDriveUrl}
                      onChange={(e) => setDirectDriveUrl(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Título da Gravação (Opcional):
                    </label>
                    <input
                      type="text"
                      placeholder={`Aula ${aulaNum} • ${selectedDisciplina?.name || 'Disciplina'} (Gravação HD)`}
                      value={directRecordingTitle}
                      onChange={(e) => setDirectRecordingTitle(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-xs font-semibold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. PAINEL DE CONTROLE DE GRAVAÇÃO AO VIVO */}
          {(recordingState === 'recording' || recordingState === 'paused') && (
            <div className="p-6 bg-slate-900 rounded-2xl text-white text-center space-y-4 shadow-inner border border-slate-800">
              <div className="flex items-center justify-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${recordingState === 'recording' ? 'bg-red-500 animate-ping' : 'bg-amber-400'}`} />
                <span className="text-xs font-black tracking-widest uppercase text-red-400">
                  {recordingState === 'recording' ? '🔴 GRAVANDO AULA EM 2º PLANO' : '⏸ GRAVAÇÃO PAUSADA'}
                </span>
              </div>

              <div className="text-4xl sm:text-5xl font-mono font-black text-white tracking-wider">
                {formatDuration(recordingTime)}
              </div>

              <p className="text-xs text-slate-400">
                {selectedDisciplina?.name} • Aula {aulaNum}
              </p>

              {autoStopRemainingSeconds !== null && (
                <div className="p-3 bg-purple-950/80 border border-purple-500/50 rounded-xl text-xs text-purple-200 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" />
                    <span className="font-bold">Piloto Automático Ativo</span>
                  </div>
                  <div className="font-mono font-black text-purple-300 bg-purple-900/60 px-2.5 py-1 rounded-lg border border-purple-400/30">
                    Auto-Stop em: {formatDuration(autoStopRemainingSeconds)}
                  </div>
                </div>
              )}

              <div className="p-2.5 bg-slate-800/80 rounded-xl text-[11px] text-blue-300 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Backup contínuo ativo. Ao fechar a chamada do Meet, o upload iniciará sozinho.</span>
              </div>

              {/* Botões de Ação Durante a Gravação */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {recordingState === 'recording' ? (
                  <button
                    onClick={pauseRecording}
                    className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pausar</span>
                  </button>
                ) : (
                  <button
                    onClick={resumeRecording}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Retomar</span>
                  </button>
                )}

                <button
                  onClick={stopRecording}
                  className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Square className="w-4 h-4" />
                  <span>Finalizar e Salvar no Drive</span>
                </button>

                <button
                  onClick={() => setIsMinimized(true)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl transition flex items-center gap-2 active:scale-95 cursor-pointer border border-slate-700"
                >
                  <Minimize2 className="w-4 h-4 text-amber-300" />
                  <span>Minimizar</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. PAINEL DE VÍDEO CONCLUÍDO & STATUS DE UPLOAD */}
          {(recordingState === 'stopped' || isUploadingToDrive || isSavedSuccess) && (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${isSavedSuccess ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-blue-50 border-blue-300 text-blue-950'} space-y-2`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-extrabold text-sm flex items-center gap-2">
                    {isSavedSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        Gravação Salva com Sucesso no Google Drive!
                      </>
                    ) : isUploadingToDrive ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        Salvando Automaticamente no Google Drive...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        Vídeo Pronto
                      </>
                    )}
                  </span>
                  {recordingTime > 0 && (
                    <span className="text-xs font-mono font-bold bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                      Duração: {formatDuration(recordingTime)}
                    </span>
                  )}
                </div>
                <p className="text-xs">
                  {isSavedSuccess
                    ? 'O arquivo já foi indexado e está disponível para todos os alunos autenticados.'
                    : isUploadingToDrive
                    ? uploadStatusStep || 'Enviando bytes do vídeo para a pasta oficial compartilhada...'
                    : 'Gravação finalizada. O upload foi processado.'}
                </p>
              </div>

              {/* Player de Prévia */}
              {recordedVideoUrl && (
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow border border-gray-200">
                  <video
                    src={recordedVideoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* CARD DE STATUS OFICIAL */}
              <div className="p-4 bg-gradient-to-br from-blue-950 to-slate-900 text-white rounded-2xl border border-blue-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <h5 className="font-extrabold text-sm text-white">
                      Status da Gravação
                    </h5>
                  </div>
                  <span className="text-[11px] font-mono bg-blue-900/80 text-blue-200 px-2.5 py-0.5 rounded-full">
                    Pasta: 01 - Teologia / 15 - Gravações
                  </span>
                </div>

                {isUploadingToDrive ? (
                  <div className="p-3.5 bg-blue-900/60 rounded-xl space-y-2.5 border border-blue-700/60">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>{uploadStatusStep || 'Enviando para o Google Drive...'}</span>
                      </div>
                      <span className="font-mono text-xs font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-950 rounded-full h-2.5 overflow-hidden border border-blue-800/80">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${Math.max(uploadProgress, 4)}%` }}
                      />
                    </div>
                  </div>
                ) : isSavedSuccess ? (
                  <div className="p-3.5 bg-emerald-950/80 border border-emerald-500 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-300">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Gravação Salva com Sucesso na Pasta Oficial do Google Drive!</span>
                    </div>
                    {uploadedDriveUrl && (
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={uploadedDriveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-300 hover:text-white underline flex items-center gap-1 font-bold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir Gravação no Google Drive</span>
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleManualUploadClick}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer border border-emerald-400"
                  >
                    <UploadCloud className="w-5 h-5" />
                    <span>Reenviar para a Pasta do Google Drive</span>
                  </button>
                )}
              </div>

              {/* Opções de Download Local e Acesso ao Drive */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleDownloadVideo}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Baixar Cópia Local (Downloads)</span>
                </button>

                <a
                  href={OFFICIAL_DRIVE_RECORDINGS_FOLDER}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Abrir a pasta oficial do Google Drive"
                >
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <span>Abrir Pasta do Drive</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          {recordingState === 'idle' && !isUploadingToDrive && !isSavedSuccess ? (
            <>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>

              {activeTabMode === 'autopilot' ? (
                <button
                  type="button"
                  disabled={Boolean(lockedByOther)}
                  onClick={() => startRecording(true)}
                  className={`px-5 py-2.5 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 ${
                    lockedByOther
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white active:scale-95 cursor-pointer shadow-purple-900/20'
                  }`}
                >
                  {lockedByOther ? <Lock className="w-4 h-4" /> : <Bot className="w-4 h-4 text-purple-200" />}
                  <span>{lockedByOther ? 'Aula Sendo Gravada' : 'Armar Piloto Automático & Gravar'}</span>
                </button>
              ) : activeTabMode === 'screen' ? (
                <button
                  type="button"
                  disabled={Boolean(lockedByOther)}
                  onClick={() => startRecording(false)}
                  className={`px-5 py-2.5 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 ${
                    lockedByOther
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white active:scale-95 cursor-pointer'
                  }`}
                >
                  {lockedByOther ? <Lock className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  <span>{lockedByOther ? 'Aula Sendo Gravada' : 'Iniciar Gravação da Aula'}</span>
                </button>
              ) : activeTabMode === 'file' ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Escolher Arquivo do Celular / PC</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSaveDirectDriveLink()}
                  disabled={isUploadingToDrive || !directDriveUrl.trim()}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>{isUploadingToDrive ? 'Vinculando...' : 'Salvar Gravação do Google Drive'}</span>
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition ml-auto cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Gravar Outra Aula</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
