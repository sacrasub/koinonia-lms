'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  SimuladorDefesaPergunta,
  SimuladorDefesaRegistro
} from '@/types/oficinaEstudos';
import { oficinaEstudosService } from '@/services/oficinaEstudosService';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  Volume2,
  Trash2,
  BookOpen,
  ChevronRight,
  ShieldAlert,
  Flame,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DefenseSimulatorProps {
  onShowToast: (msg: string) => void;
}

export const DefenseSimulator: React.FC<DefenseSimulatorProps> = ({ onShowToast }) => {
  const perguntas = oficinaEstudosService.getPerguntasBanca();
  const [selectedPerguntaId, setSelectedPerguntaId] = useState<string>(perguntas[0].id);
  const [historico, setHistorico] = useState<SimuladorDefesaRegistro[]>(() =>
    oficinaEstudosService.getHistoricoDefesa()
  );

  const activePergunta = perguntas.find((p) => p.id === selectedPerguntaId) || perguntas[0];

  // Modo de Treinamento Oral Ativo
  const [isDefending, setIsDefending] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(activePergunta.tempo_segundos);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Gravador de Áudio (Web Audio API / MediaRecorder)
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Rubrica de Autoavaliação pós-resposta
  const [checkedCriteria, setCheckedCriteria] = useState<Record<string, boolean>>({});
  const [reflexaoText, setReflexaoText] = useState<string>('');
  const [simulacaoConcluida, setSimulacaoConcluida] = useState<boolean>(false);

  // Reset ao mudar pergunta
  useEffect(() => {
    setTimeLeft(activePergunta.tempo_segundos);
    setIsDefending(false);
    setIsTimerRunning(false);
    setIsRecording(false);
    setAudioUrl(null);
    setRecordingSeconds(0);
    setCheckedCriteria({});
    setReflexaoText('');
    setSimulacaoConcluida(false);

    if (timerRef.current) clearInterval(timerRef.current);
    if (recIntervalRef.current) clearInterval(recIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [selectedPerguntaId, activePergunta.tempo_segundos]);

  // Efeito do Cronômetro Regressivo de Defesa
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            clearInterval(timerRef.current!);
            handleStopRecording();
            setSimulacaoConcluida(true);
            onShowToast('⏰ Tempo esgotado! Avalie sua oratória na Rubrica Socrática.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Iniciar Gravação e Cronômetro
  const handleStartDefense = async () => {
    try {
      setIsDefending(true);
      setTimeLeft(activePergunta.tempo_segundos);
      setRecordingSeconds(0);
      setAudioUrl(null);
      setSimulacaoConcluida(false);
      setCheckedCriteria({});
      audioChunksRef.current = [];

      // Tenta acessar o microfone do navegador
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          recorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            // Para as tracks do microfone para liberar a luz do navegador
            stream.getTracks().forEach((track) => track.stop());
          };

          recorder.start();
          setIsRecording(true);
        } catch (micErr) {
          console.warn('Microfone não acessível ou sem permissão:', micErr);
          onShowToast('⚠️ Microfone não detectado. Modo de simulação oral ativado sem gravação física.');
          setIsRecording(false);
        }
      }

      setIsTimerRunning(true);
      recIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      onShowToast('🎙️ Defesa ativa iniciada! Fale claramente sem consulta prévia.');
    } catch (err) {
      console.error('Erro ao iniciar defesa:', err);
    }
  };

  const handleStopRecording = () => {
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (recIntervalRef.current) clearInterval(recIntervalRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setSimulacaoConcluida(true);
  };

  const handleToggleCriterion = (critId: string) => {
    setCheckedCriteria((prev) => ({
      ...prev,
      [critId]: !prev[critId],
    }));
  };

  // Cálculo da Nota de Autoavaliação (0 a 10)
  const totalCrit = activePergunta.rubrica_criterios.length;
  const markedCritCount = Object.values(checkedCriteria).filter(Boolean).length;
  const computedScore = totalCrit > 0 ? Math.round((markedCritCount / totalCrit) * 10) : 0;

  const handleSaveSimulacao = () => {
    const marcadosArray = Object.keys(checkedCriteria).filter((k) => checkedCriteria[k]);
    const updated = oficinaEstudosService.saveDefesaRegistro({
      pergunta_id: activePergunta.id,
      pergunta_numero: activePergunta.numero,
      pergunta_enunciado: activePergunta.enunciado,
      duracao_gravacao_segundos: recordingSeconds,
      audio_url: audioUrl || undefined,
      criterios_marcados: marcadosArray,
      nota_autoavaliacao: computedScore,
      reflexao_pesquisador: reflexaoText || 'Treino oral concluído.',
    });

    setHistorico(updated);
    setIsDefending(false);
    setSimulacaoConcluida(false);
    onShowToast(`✓ Simulação registrada com sucesso! Nota: ${computedScore}/10`);
  };

  const handleDeleteTreino = (id: string) => {
    if (confirm('Deseja excluir este registro de treino da banca?')) {
      const updated = oficinaEstudosService.deleteDefesaRegistro(id);
      setHistorico(updated);
      onShowToast('Registro de treino excluído.');
    }
  };

  const formatMinutes = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* 1. CABEÇALHO DO SIMULADOR SOCRÁTICO */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
              Arguição Socrática • Banca Examinadora TCC
            </span>
            <h3 className="text-xl font-black text-white mt-1">
              Simulador de Defesa Oral & Autoavaliação com Gravação de Voz
            </h3>
            <p className="text-xs text-slate-400">
              Treine sua resposta oral sob pressão de tempo, ouça a gravação de voz e avalie seu desempenho na rubrica acadêmica.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              {historico.length} {historico.length === 1 ? 'treino realizado' : 'treinos realizados'}
            </span>
          </div>
        </div>

        {/* SELETOR DE PERGUNTAS DA BANCA (5 PERGUNTAS CANÔNICAS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2">
          {perguntas.map((p) => {
            const isSelected = p.id === selectedPerguntaId;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPerguntaId(p.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 border-amber-400/80 shadow-md shadow-amber-950/20'
                    : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    Pergunta {p.numero}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {Math.round(p.tempo_segundos / 60)} min
                  </span>
                </div>
                <p className="text-xs font-bold text-white line-clamp-2">
                  {p.enunciado}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CARTÃO DE DESTAQUE DA PERGUNTA & MODO DEFESA ATIVA */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Questão Oficial da Banca Examinadora • Pergunta #{activePergunta.numero}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Tempo Limite: {formatMinutes(activePergunta.tempo_segundos)}
            </span>
          </div>

          <h4 className="text-lg sm:text-xl font-black text-white leading-relaxed">
            "{activePergunta.enunciado}"
          </h4>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
            <p>
              <strong className="text-amber-300">Objetivo Pedagógico da Banca: </strong>
              {activePergunta.objetivo_pedagogico}
            </p>
            <p className="text-slate-400">
              <strong className="text-blue-300">Autores Recomendados na Resposta: </strong>
              {activePergunta.autores_recomendados.join(' • ')}
            </p>
          </div>
        </div>

        {/* VISOR DO CRONÔMETRO E CONTROLES DE GRAVAÇÃO */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 to-blue-950/40 border border-slate-800 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className={`text-5xl sm:text-6xl font-black font-mono tracking-tight drop-shadow ${
              timeLeft <= 30 ? 'text-rose-400 animate-pulse' : 'text-white'
            }`}>
              {formatMinutes(timeLeft)}
            </div>
            {isRecording && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>REC ({recordingSeconds}s)</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
            {isTimerRunning
              ? '🎤 Responda agora em voz alta como se estivesse diante da banca examinadora.'
              : 'Clique em "Iniciar Defesa Oral" para disparar o cronômetro e a gravação de voz.'}
          </p>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            {!isDefending ? (
              <Button
                onClick={handleStartDefense}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Mic className="w-5 h-5" />
                <span>Iniciar Defesa Oral</span>
              </Button>
            ) : isTimerRunning ? (
              <Button
                onClick={handleStopRecording}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-sm px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Finalizar Resposta</span>
              </Button>
            ) : (
              <Button
                onClick={handleStartDefense}
                variant="outline"
                className="border-slate-700 bg-slate-800 text-slate-200 text-xs rounded-xl flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Treinar Novamente</span>
              </Button>
            )}
          </div>

          {/* PLAYER DE ÁUDIO CASO TENHA GRAVADO */}
          {audioUrl && (
            <div className="pt-4 border-t border-slate-800 max-w-md mx-auto space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Volume2 className="w-4 h-4" />
                  <span>Gravação de Voz do Aluno</span>
                </span>
                <span className="text-slate-500 font-mono">{recordingSeconds}s</span>
              </div>
              <audio src={audioUrl} controls className="w-full h-10 rounded-xl" />
            </div>
          )}
        </div>

        {/* 3. RUBRICA SOCRÁTICA DE AUTOAVALIAÇÃO (EXIBIDA APÓS CONCLUIR) */}
        {simulacaoConcluida && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-amber-400/60 space-y-5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Rubrica Socrática • Autoavaliação
                </span>
                <h5 className="text-base font-black text-white mt-1">
                  Checklist de Rigor Acadêmico da Resposta
                </h5>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-bold">Nota Calculada:</span>
                <span className="text-2xl font-black text-amber-400">
                  {computedScore} / 10
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {activePergunta.rubrica_criterios.map((crit) => {
                const isChecked = Boolean(checkedCriteria[crit.id]);
                return (
                  <label
                    key={crit.id}
                    onClick={() => handleToggleCriterion(crit.id)}
                    className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                      isChecked
                        ? 'bg-slate-900 border-emerald-500/40 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-600 hover:border-amber-400" />
                      )}
                    </div>
                    <div>
                      <h6 className="text-xs font-bold text-white">
                        {crit.criterio}
                      </h6>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        {crit.descricao}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* CAMPO DE REFLEXÃO FINAL DO ALUNO */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">
                Reflexão Pessoal / O que melhorar na próxima tentativa?
              </label>
              <textarea
                value={reflexaoText}
                onChange={(e) => setReflexaoText(e.target.value)}
                placeholder="Ex: Preciso falar com mais calma ao citar a tríade de Moore e não esquecer de mencionar os dados de tele-proximidade..."
                rows={2}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                onClick={handleSaveSimulacao}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-lg cursor-pointer"
              >
                Salvar Treino no Histórico
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 4. HISTÓRICO DE TREINOS ORAL REALIZADOS */}
      {historico.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h4 className="font-black text-white text-base">
              Histórico de Simulações da Banca ({historico.length})
            </h4>
          </div>

          <div className="space-y-3">
            {historico.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 border border-slate-700">
                      Pergunta {h.pergunta_numero}
                    </span>
                    <span className="text-xs font-black text-emerald-400">
                      Nota: {h.nota_autoavaliacao}/10
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(h.created_at).toLocaleDateString('pt-BR')} • {h.duracao_gravacao_segundos}s
                    </span>
                  </div>

                  <p className="text-xs text-white font-bold line-clamp-1">
                    "{h.pergunta_enunciado}"
                  </p>
                  <p className="text-xs text-slate-400 italic">
                    "{h.reflexao_pesquisador}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {h.audio_url && (
                    <audio src={h.audio_url} controls className="h-8 w-44 rounded-lg" />
                  )}
                  <button
                    onClick={() => handleDeleteTreino(h.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    title="Excluir treino"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
