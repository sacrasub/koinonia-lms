'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, Video, FileText, Ban, Check, Copy, ExternalLink, 
  Send, AlertTriangle, Sparkles, MessageSquare, ArrowRight,
  Clock, Calendar, UserCheck, Shield, CheckCircle2, ChevronRight,
  Play, Download, Upload, Loader2, Link as LinkIcon
} from 'lucide-react';
import { UserRole } from '@/types';
import { ESCALA_DATA, EscalaItem } from '@/components/EscalaMonitoriaPage';
import { 
  TipoProvidencia, 
  registrarProvidenciaAula, 
  reativarAula, 
  getAulaCanceladaStatus,
  isAulaCanceladaHoje,
  parseProvidenciaMotivo,
  AulaCanceladaItem
} from '@/services/aulaCanceladaService';
import { INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';

interface ModalProvidenciaAulaProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  currentRole?: UserRole;
  initialAula?: {
    id: string;
    title: string;
    professor?: string;
    turma?: string;
    dayOfWeek?: string;
    startBRT?: string;
    endBRT?: string;
    meetUrl?: string;
    presencaUrl?: string;
  } | null;
  onSuccess?: (msg: string) => void;
}

export const ModalProvidenciaAula: React.FC<ModalProvidenciaAulaProps> = ({
  isOpen,
  onClose,
  userEmail = '',
  currentRole = 'monitor',
  initialAula = null,
  onSuccess,
}) => {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  const authUser = INITIAL_AUTHORIZED_USERS[normalizedEmail];
  const autorNome = authUser?.name || (currentRole === 'professor' ? 'Docência' : 'Monitoria Acadêmica');

  // Obtém a data de hoje no fuso de Brasília em formato ISO (YYYY-MM-DD)
  const getTodayISO = () => {
    try {
      const now = new Date();
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  };

  // Data selecionada para o imprevisto (padrão: data de hoje)
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO);

  // Deriva o dia da semana e formato DD/MM/YYYY a partir da data escolhida
  const { dateFormatted, dayOfWeekName, isToday, isYesterday, isTomorrow } = useMemo(() => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    if (!selectedDate) {
      return { dateFormatted: '', dayOfWeekName: '', isToday: false, isYesterday: false, isTomorrow: false };
    }
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = days[dateObj.getDay()];
    const formatted = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;

    const todayISO = getTodayISO();
    const [ty, tm, td] = todayISO.split('-').map(Number);
    const baseToday = new Date(ty, tm - 1, td);

    const yestDate = new Date(baseToday);
    yestDate.setDate(baseToday.getDate() - 1);
    const yestISO = `${yestDate.getFullYear()}-${String(yestDate.getMonth() + 1).padStart(2, '0')}-${String(yestDate.getDate()).padStart(2, '0')}`;

    const tomDate = new Date(baseToday);
    tomDate.setDate(baseToday.getDate() + 1);
    const tomISO = `${tomDate.getFullYear()}-${String(tomDate.getMonth() + 1).padStart(2, '0')}-${String(tomDate.getDate()).padStart(2, '0')}`;

    return {
      dateFormatted: formatted,
      dayOfWeekName: dayOfWeek,
      isToday: selectedDate === todayISO,
      isYesterday: selectedDate === yestISO,
      isTomorrow: selectedDate === tomISO,
    };
  }, [selectedDate]);

  // Aula selecionada
  const [selectedAulaId, setSelectedAulaId] = useState<string>('');
  const [tipoProvidencia, setTipoProvidencia] = useState<TipoProvidencia>('aula_dupla');
  
  // Dados do Substituto / Aula Dupla
  const [substitutoAulaId, setSubstitutoAulaId] = useState<string>('');
  const [substitutoProfName, setSubstitutoProfName] = useState<string>('');
  const [substitutoDiscName, setSubstitutoDiscName] = useState<string>('');
  const [substitutoMeetUrl, setSubstitutoMeetUrl] = useState<string>('');
  const [substitutoPresencaUrl, setSubstitutoPresencaUrl] = useState<string>('');
  const [motivoTexto, setMotivoTexto] = useState<string>('');

  // Novos campos: Aula Gravada + Trabalho PDF em um só aviso
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [arquivoUrl, setArquivoUrl] = useState<string>('');
  const [arquivoNome, setArquivoNome] = useState<string>('');
  const [trabalhoPrazo, setTrabalhoPrazo] = useState<string>('');
  const [trabalhoInstrucoes, setTrabalhoInstrucoes] = useState<string>('');
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Busca dados da aula selecionada
  const selectedAula = useMemo(() => {
    if (!selectedAulaId) return null;
    return ESCALA_DATA.find(e => e.id === selectedAulaId) || null;
  }, [selectedAulaId]);

  // Checa se já existe providência / cancelamento ativo para essa aula na data selecionada
  const existingProvidencia = useMemo<AulaCanceladaItem | null>(() => {
    if (!selectedAula || !dateFormatted) return null;
    return getAulaCanceladaStatus(selectedAula.id, selectedAula.title, dateFormatted) ||
      (isToday ? isAulaCanceladaHoje(selectedAula.id, selectedAula.title, userEmail) : null);
  }, [selectedAula, userEmail, dateFormatted, isToday]);

  // Altera a data selecionada e auto-adapta a aula selecionada para o dia correspondente
  const handleDateChange = (newDateISO: string) => {
    setSelectedDate(newDateISO);
    if (!newDateISO) return;
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const [y, m, d] = newDateISO.split('-').map(Number);
    const newDayOfWeek = days[new Date(y, m - 1, d).getDay()];
    
    // Sugere a primeira aula daquele dia caso a atual não seja do mesmo dia
    const matchingClasses = ESCALA_DATA.filter(e => e.dayOfWeek === newDayOfWeek);
    if (matchingClasses.length > 0) {
      const currentStillValid = matchingClasses.some(e => e.id === selectedAulaId);
      if (!currentStillValid) {
        setSelectedAulaId(matchingClasses[0].id);
      }
    }
  };

  // Botões rápidos de preset de data (-1: Ontem, 0: Hoje, 1: Amanhã)
  const handleSetPresetDate = (offsetDays: number) => {
    const todayISO = getTodayISO();
    const [ty, tm, td] = todayISO.split('-').map(Number);
    const target = new Date(ty, tm - 1, td);
    target.setDate(target.getDate() + offsetDays);
    const iso = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    handleDateChange(iso);
  };

  // Inicializa quando abre o modal
  useEffect(() => {
    if (!isOpen) return;

    if (initialAula) {
      setSelectedAulaId(initialAula.id);
    } else {
      // Sugere aula de acordo com a data selecionada
      const matchingClasses = ESCALA_DATA.filter(e => e.dayOfWeek === dayOfWeekName);
      if (matchingClasses.length > 0) {
        setSelectedAulaId(matchingClasses[0].id);
      } else if (ESCALA_DATA.length > 0) {
        setSelectedAulaId(ESCALA_DATA[0].id);
      }
    }
  }, [isOpen, initialAula, dayOfWeekName]);

  // Quando seleciona uma aula ou se já existir providência, sincroniza os campos
  useEffect(() => {
    if (!selectedAula) return;

    if (existingProvidencia && existingProvidencia.ativo) {
      const parsed = parseProvidenciaMotivo(existingProvidencia.motivo || '');
      setTipoProvidencia(parsed.tipoProvidencia || 'aula_dupla');
      setSubstitutoProfName(parsed.substitutoProfessorName || existingProvidencia.substituto_professor_name || '');
      setSubstitutoDiscName(parsed.substitutoDisciplinaName || existingProvidencia.substituto_disciplina_name || '');
      setSubstitutoMeetUrl(parsed.substitutoMeetUrl || existingProvidencia.substituto_meet_url || '');
      setSubstitutoPresencaUrl(parsed.substitutoPresencaUrl || existingProvidencia.substituto_presenca_url || '');
      setMotivoTexto(parsed.motivoLimpo || 'Imprevisto docente com adaptação da grade.');
      
      // Carrega dados de aula gravada / trabalho anexo
      setVideoUrl(parsed.videoUrl || existingProvidencia.video_url || '');
      setArquivoUrl(parsed.arquivoUrl || existingProvidencia.arquivo_url || '');
      setArquivoNome(parsed.arquivoNome || existingProvidencia.arquivo_nome || '');
      setTrabalhoPrazo(parsed.trabalhoPrazo || existingProvidencia.trabalho_prazo || '');
      setTrabalhoInstrucoes(parsed.trabalhoInstrucoes || existingProvidencia.trabalho_instrucoes || '');
      return;
    }

    // Limpa campos adicionais se for novo registro
    setVideoUrl('');
    setArquivoUrl('');
    setArquivoNome('');
    setTrabalhoPrazo('');
    setTrabalhoInstrucoes('');

    // Se for aula da Terça-feira (Ary Júnior), sugere automaticamente o Hilário Bispo (caso padrão de aula dupla)
    if (selectedAula.title.toLowerCase().includes('congregacionalismo') || selectedAula.professor.toLowerCase().includes('ary')) {
      const hilarioAula = ESCALA_DATA.find(e => e.professor.toLowerCase().includes('hilário') || e.title.toLowerCase().includes('pensamento cristão'));
      if (hilarioAula) {
        setSubstitutoAulaId(hilarioAula.id);
        setSubstitutoProfName(hilarioAula.professor);
        setSubstitutoDiscName(hilarioAula.title);
        setSubstitutoMeetUrl(hilarioAula.meetUrl || 'https://meet.google.com/cxj-yetd-xpf');
        setSubstitutoPresencaUrl(hilarioAula.presencaUrl || 'https://forms.gle/hM2j2fb7DK923wdR7');
        setMotivoTexto(`O Profº ${selectedAula.professor} teve um imprevisto justificado. O Profº ${hilarioAula.professor} assumirá os 2 tempos de aula com ${hilarioAula.title}.`);
        return;
      }
    }

    // Caso padrão: busca a outra aula do mesmo dia
    const outraAulaDoDia = ESCALA_DATA.find(e => e.dayOfWeek === selectedAula.dayOfWeek && e.id !== selectedAula.id);
    if (outraAulaDoDia) {
      setSubstitutoAulaId(outraAulaDoDia.id);
      setSubstitutoProfName(outraAulaDoDia.professor);
      setSubstitutoDiscName(outraAulaDoDia.title);
      setSubstitutoMeetUrl(outraAulaDoDia.meetUrl || '');
      setSubstitutoPresencaUrl(outraAulaDoDia.presencaUrl || '');
      setMotivoTexto(`Devido a imprevisto com o Profº ${selectedAula.professor}, o Profº ${outraAulaDoDia.professor} assumirá a regência dos 2 tempos hoje.`);
    } else {
      setMotivoTexto(`Devido a imprevisto com o Profº ${selectedAula.professor}, esta aula foi adaptada.`);
    }
  }, [selectedAula, existingProvidencia]);

  // Função para leitura de arquivo PDF/documento (Base64 local sem quebrar cota Supabase)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('O arquivo selecionado é muito grande. Por favor, envie arquivos de até 8MB ou informe um link do Google Drive.');
      return;
    }

    setIsUploadingFile(true);
    setArquivoNome(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setArquivoUrl(reader.result as string);
      setIsUploadingFile(false);
    };
    reader.onerror = () => {
      alert('Erro ao carregar o arquivo local. Tente novamente ou use um link do Google Drive.');
      setIsUploadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  // Ao trocar o substituto no select
  const handleSelectSubstituto = (aulaId: string) => {
    setSubstitutoAulaId(aulaId);
    const target = ESCALA_DATA.find(e => e.id === aulaId);
    if (target && selectedAula) {
      setSubstitutoProfName(target.professor);
      setSubstitutoDiscName(target.title);
      setSubstitutoMeetUrl(target.meetUrl || '');
      setSubstitutoPresencaUrl(target.presencaUrl || '');
      if (tipoProvidencia === 'aula_dupla') {
        setMotivoTexto(`O Profº ${selectedAula.professor} teve um imprevisto justificado. O Profº ${target.professor} assumirá os 2 tempos de aula com ${target.title}.`);
      } else {
        setMotivoTexto(`O Profº ${target.professor} substituirá a aula de hoje de ${selectedAula.title}.`);
      }
    }
  };

  // Texto formatado para WhatsApp
  const mensagemWhatsApp = useMemo(() => {
    if (!selectedAula) return '';
    const emoji = tipoProvidencia === 'aula_dupla' ? '⚡' : tipoProvidencia === 'substituicao' ? '🔄' : '🚫';
    const tituloAviso = tipoProvidencia === 'aula_dupla'
      ? '*COMUNICADO URGENTE: AULA DUPLA HOJE*'
      : tipoProvidencia === 'substituicao'
      ? '*COMUNICADO: SUBSTITUIÇÃO DOCENTE HOJE*'
      : '*COMUNICADO: AULA SUSPENSA HOJE*';

    let corpo = `${emoji} ${tituloAviso}\n` +
      `🏛️ *Seminário Teológico Koinonia*\n` +
      `📅 Data: *${dateFormatted} (${dayOfWeekName})*\n\n` +
      `Prezados alunos da *${selectedAula.turma}*,\n\n`;

    if (tipoProvidencia === 'aula_dupla') {
      corpo += `Informamos que, devido a um imprevisto com o *Profº ${selectedAula.professor}* (${selectedAula.title}), o *Profº ${substitutoProfName}* assumirá a regência ministrando *DOIS TEMPOS DE AULA* de *${substitutoDiscName}*.\n\n` +
        `⏰ *Horário:* A partir das 19h00 BRT\n` +
        `📹 *Sala Oficial do Google Meet (Ambos os tempos):*\n${substitutoMeetUrl}\n\n` +
        `📝 *Lista de Presença Oficial:*\n${substitutoPresencaUrl}\n\n` +
        `💬 *Orientação:* Todos os alunos devem ingressar diretamente no link do Meet acima. Contamos com a pontualidade e participação de todos!`;
    } else if (tipoProvidencia === 'substituicao') {
      corpo += `Informamos que a aula de *${selectedAula.title}* de hoje será ministrada pelo *Profº ${substitutoProfName}*.\n\n` +
        `📹 *Link do Google Meet:*\n${substitutoMeetUrl || selectedAula.meetUrl}\n\n` +
        `📝 *Lista de Presença:*\n${substitutoPresencaUrl || selectedAula.presencaUrl}\n\n` +
        `💬 *Motivo:* ${motivoTexto}`;
    } else {
      corpo += `Informamos que *NÃO HAVERÁ TRANSMISSÃO AO VIVO* de *${selectedAula.title}* (${selectedAula.professor}) nesta data.\n\n` +
        `💬 *Motivo:* ${motivoTexto}\n\n`;

      if (videoUrl) {
        corpo += `▶️ *Aula Gravada pelo Professor:*\n${videoUrl}\n\n`;
      }
      if (arquivoUrl) {
        corpo += `📄 *Arquivo / Trabalho em Anexo:* ${arquivoNome || 'Disponível no Portal do Aluno'}\n${arquivoUrl.startsWith('data:') ? '(Disponível para download direto no Portal do Aluno)' : arquivoUrl}\n\n`;
      }
      if (trabalhoPrazo) {
        corpo += `📅 *Prazo de Entrega da Atividade:* ${trabalhoPrazo}\n\n`;
      }
      if (trabalhoInstrucoes) {
        corpo += `📋 *Instruções da Chamada / Atividade:*\n${trabalhoInstrucoes}\n\n`;
      } else if (videoUrl || arquivoUrl) {
        corpo += `📋 *Lista de Presença:* A entrega da atividade/trabalho corresponderá à presença desta aula.\n\n`;
      }

      corpo += `📚 Acessem o portal para assistir ao vídeo e baixar o material: https://koinonialms.vercel.app`;
    }

    return corpo;
  }, [selectedAula, tipoProvidencia, substitutoProfName, substitutoDiscName, substitutoMeetUrl, substitutoPresencaUrl, motivoTexto, dateFormatted, dayOfWeekName, videoUrl, arquivoUrl, arquivoNome, trabalhoPrazo, trabalhoInstrucoes]);

  // Mensagem curta para colar no Chat do Google Meet
  const mensagemChatMeet = useMemo(() => {
    if (!selectedAula) return '';
    if (tipoProvidencia === 'aula_dupla') {
      return `⚠️ ATENÇÃO TURMA: Aula Dupla hoje com o Profº ${substitutoProfName} (${substitutoDiscName}). Sala oficial: ${substitutoMeetUrl}`;
    }
    if (tipoProvidencia === 'substituicao') {
      return `⚠️ AVISO: Aula ministrada hoje pelo Profº ${substitutoProfName}. Link Meet: ${substitutoMeetUrl}`;
    }
    if (videoUrl || arquivoUrl) {
      return `⚠️ AVISO: Não haverá aula ao vivo hoje. O professor disponibilizou vídeo gravado e trabalho no portal: https://koinonialms.vercel.app`;
    }
    return `⚠️ AVISO: A aula de hoje foi suspensa pela coordenação. Motivo: ${motivoTexto}`;
  }, [selectedAula, tipoProvidencia, substitutoProfName, substitutoDiscName, substitutoMeetUrl, motivoTexto, videoUrl, arquivoUrl]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDispararWhatsApp = () => {
    const encoded = encodeURIComponent(mensagemWhatsApp);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Salvar Providência
  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAula) return;
    setIsSubmitting(true);

    try {
      await registrarProvidenciaAula({
        disciplinaId: selectedAula.id,
        disciplinaName: selectedAula.title,
        dataAula: dateFormatted,
        tipoProvidencia,
        motivo: motivoTexto.trim() || 'Imprevisto com o corpo docente.',
        autorNome,
        autorEmail: userEmail || 'monitoria@koinonia.edu.br',
        autorRole: currentRole,
        substitutoDisciplinaId: substitutoAulaId,
        substitutoDisciplinaName: substitutoDiscName,
        substitutoProfessorName: substitutoProfName,
        substitutoMeetUrl,
        substitutoPresencaUrl,
        substitutoObservacoes: motivoTexto,
        videoUrl: videoUrl.trim() || undefined,
        arquivoUrl: arquivoUrl.trim() || undefined,
        arquivoNome: arquivoNome.trim() || undefined,
        trabalhoPrazo: trabalhoPrazo.trim() || undefined,
        trabalhoInstrucoes: trabalhoInstrucoes.trim() || undefined,
      });

      const msg = tipoProvidencia === 'aula_dupla'
        ? `⚡ Aula Dupla registrada para ${dateFormatted}! O Profº ${substitutoProfName} assumiu os 2 tempos.`
        : tipoProvidencia === 'substituicao'
        ? `🔄 Substituição registrada para ${dateFormatted} com o Profº ${substitutoProfName}.`
        : videoUrl || arquivoUrl
        ? `📹 Aula gravada e trabalho registrados para ${dateFormatted}! Alunos notificados.`
        : `🚫 Suspensão de aula registrada para ${dateFormatted}. Alunos notificados.`;

      if (onSuccess) onSuccess(msg);
      onClose();
    } catch (err) {
      console.error('Erro ao registrar providência:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Desfazer providência (reativar normalidade)
  const handleDesfazer = async () => {
    if (!selectedAula) return;
    setIsSubmitting(true);
    try {
      await reativarAula(selectedAula.id, dateFormatted);
      await reativarAula(selectedAula.title, dateFormatted);
      if (onSuccess) onSuccess(`✅ Providência desfeita! A aula de "${selectedAula.title}" em ${dateFormatted} voltou à normalidade.`);
      onClose();
    } catch (err) {
      console.error('Erro ao desfazer providência:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-5 shadow-2xl border border-gray-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Topo do Modal */}
        <div className="flex items-start justify-between border-b border-gray-100 dark:border-slate-800 pb-3 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-xs">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                Tomar Providência em Aula • Imprevisto Docente
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Atualize a sala oficial do Meet, lista de presença e avise os alunos instantaneamente
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-300 font-bold flex items-center justify-center text-xs transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSalvar} className="space-y-4">
          
          {/* Passo 1: Seleção de Data e Aula Afetada */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-700/80">
            {/* Seletor de Data */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-extrabold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Data da Aula com Imprevisto:</span>
                </label>
                
                {/* Presets Rápidos: Ontem / Hoje / Amanhã */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSetPresetDate(-1)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer active:scale-95 ${
                      isYesterday
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-gray-100'
                    }`}
                  >
                    Ontem
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetDate(0)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer active:scale-95 ${
                      isToday
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-gray-100'
                    }`}
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPresetDate(1)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer active:scale-95 ${
                      isTomorrow
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-gray-100'
                    }`}
                  >
                    Amanhã
                  </button>
                </div>
              </div>

              {/* Input Date Nativo + Badge do Dia da Semana */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                />
                <span className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 text-xs font-black whitespace-nowrap">
                  📅 {dayOfWeekName}
                </span>
              </div>
            </div>

            {/* Dropdown da Aula Afetada */}
            <div className="space-y-1.5 pt-2 border-t border-gray-200/70 dark:border-slate-700/60">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center justify-between">
                <span>Qual aula sofreu o imprevisto?</span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                  {dateFormatted} ({dayOfWeekName})
                </span>
              </label>
              <select
                value={selectedAulaId}
                onChange={(e) => setSelectedAulaId(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              >
                <optgroup label={`Aulas de ${dayOfWeekName}`}>
                  {ESCALA_DATA.filter(e => e.dayOfWeek === dayOfWeekName).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.title} — {item.professor} ({item.startBRT} - {item.endBRT})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Outras Aulas da Grade Semanal">
                  {ESCALA_DATA.filter(e => e.dayOfWeek !== dayOfWeekName).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.dayOfWeek}: {item.title} — {item.professor}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Passo 2: Escolha do Tipo de Providência */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
              2. Qual a providência adotada para hoje?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Card Aula Dupla (Recomendado) */}
              <button
                type="button"
                onClick={() => setTipoProvidencia('aula_dupla')}
                className={`p-3 rounded-2xl border text-left transition relative cursor-pointer ${
                  tipoProvidencia === 'aula_dupla'
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/30 text-amber-950 dark:text-amber-200'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500 text-white">
                    ⭐ Dobradinha
                  </span>
                  {tipoProvidencia === 'aula_dupla' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                </div>
                <h4 className="font-extrabold text-xs">Aula Dupla (2 Tempos)</h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-snug">
                  Outro professor assume os dois tempos consecutivos (ex: Hilário Bispo).
                </p>
              </button>

              {/* Card Substituição Pontual */}
              <button
                type="button"
                onClick={() => setTipoProvidencia('substituicao')}
                className={`p-3 rounded-2xl border text-left transition relative cursor-pointer ${
                  tipoProvidencia === 'substituicao'
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/30 text-blue-950 dark:text-blue-200'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-600 text-white">
                    🔄 Substituição
                  </span>
                  {tipoProvidencia === 'substituicao' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
                <h4 className="font-extrabold text-xs">Substituição de Docente</h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-snug">
                  Outro professor leciona apenas neste tempo específico.
                </p>
              </button>

              {/* Card Suspensão / Não Haverá Aula */}
              <button
                type="button"
                onClick={() => setTipoProvidencia('cancelamento')}
                className={`p-3 rounded-2xl border text-left transition relative cursor-pointer ${
                  tipoProvidencia === 'cancelamento'
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-500 ring-2 ring-red-500/30 text-red-950 dark:text-red-200'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-red-600 text-white">
                    🚫 Suspensão
                  </span>
                  {tipoProvidencia === 'cancelamento' && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                </div>
                <h4 className="font-extrabold text-xs">Não Haverá Aula</h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 leading-snug">
                  Horário sem transmissão ao vivo hoje.
                </p>
              </button>

            </div>
          </div>

          {/* Passo 3: Configuração do Substituto (quando aplicável) */}
          {tipoProvidencia !== 'cancelamento' && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  3. Professor e Disciplina que Assume:
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                  Preenchimento Automático
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-600 dark:text-slate-400">
                  Selecione o Docente / Disciplina Substituto:
                </label>
                <select
                  value={substitutoAulaId}
                  onChange={(e) => handleSelectSubstituto(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="">Selecione uma disciplina cadastrada...</option>
                  {ESCALA_DATA.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.professor} — {e.title} ({e.dayOfWeek})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-400 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-red-600" />
                    <span>Link do Google Meet Oficial:</span>
                  </label>
                  <input
                    type="url"
                    value={substitutoMeetUrl}
                    onChange={(e) => setSubstitutoMeetUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-600 dark:text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Link da Lista de Presença (Forms):</span>
                  </label>
                  <input
                    type="url"
                    value={substitutoPresencaUrl}
                    onChange={(e) => setSubstitutoPresencaUrl(e.target.value)}
                    placeholder="https://forms.gle/..."
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Passo 3 (Cancelamento): Recursos da Aula Remota / Gravada e Trabalho Anexo */}
          {tipoProvidencia === 'cancelamento' && (
            <div className="bg-red-50/50 dark:bg-red-950/20 p-3.5 rounded-2xl border border-red-200/80 dark:border-red-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-red-950 dark:text-red-200 flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-red-600" />
                  Aula Gravada & Trabalho Avaliativo (Mesmo Aviso):
                </span>
                <span className="text-[10px] bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 px-2 py-0.5 rounded-md font-bold">
                  Opcional / Integrado
                </span>
              </div>

              {/* Botão de Sugestão Rápida */}
              <button
                type="button"
                onClick={() => {
                  setMotivoTexto('O professor disponibilizou a aula gravada e um trabalho avaliativo. A lista de presença será o envio do próprio trabalho.');
                  setTrabalhoInstrucoes('A lista de chamada será o próprio trabalho. Enviem pelo grupo oficial ou portal.');
                  setTrabalhoPrazo('Próxima sexta-feira');
                }}
                className="w-full py-1.5 px-2.5 bg-red-100/70 hover:bg-red-200/70 text-red-800 text-[11px] font-bold rounded-xl text-left flex items-center justify-between transition cursor-pointer"
              >
                <span>💡 Preencher modelo rápido: "Aula Gravada + Trabalho como Presença"</span>
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Link do Vídeo Gravado */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1">
                    <Play className="w-3 h-3 text-red-600" />
                    <span>Link do Vídeo Gravado (URL):</span>
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtu.be/... ou Google Drive"
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-red-500"
                  />
                </div>

                {/* Prazo de Entrega */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-red-600" />
                    <span>Prazo de Entrega do Trabalho:</span>
                  </label>
                  <input
                    type="text"
                    value={trabalhoPrazo}
                    onChange={(e) => setTrabalhoPrazo(e.target.value)}
                    placeholder="Ex: Sexta-feira 18/09 às 23:59"
                    className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Arquivo do Trabalho / PDF */}
              <div className="space-y-1.5 pt-1 border-t border-red-200/50 dark:border-red-900/30">
                <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3 text-red-600" />
                    Arquivo PDF do Trabalho / Atividade:
                  </span>
                  {arquivoNome && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold truncate max-w-[200px]">
                      ✓ {arquivoNome}
                    </span>
                  )}
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 hover:bg-red-50 text-red-800 dark:text-red-300 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition active:scale-95 shadow-2xs">
                    {isUploadingFile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploadingFile ? 'Anexando...' : 'Anexar PDF Local'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.zip,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="relative flex-1 w-full">
                    <input
                      type="url"
                      value={arquivoUrl.startsWith('data:') ? '' : arquivoUrl}
                      onChange={(e) => {
                        setArquivoUrl(e.target.value);
                        if (e.target.value) setArquivoNome('Trabalho da Aula (Link)');
                        else setArquivoNome('');
                      }}
                      placeholder={arquivoUrl.startsWith('data:') ? `Arquivo anexado: ${arquivoNome}` : "Ou cole o link do Google Drive/Dropbox..."}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>

                  {(arquivoUrl || arquivoNome) && (
                    <button
                      type="button"
                      onClick={() => {
                        setArquivoUrl('');
                        setArquivoNome('');
                      }}
                      className="text-[11px] text-red-600 hover:text-red-800 font-bold px-2 py-1 cursor-pointer"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>

              {/* Instruções da Chamada / Presença */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 dark:text-slate-300">
                  Instruções de Presença / Chamada:
                </label>
                <input
                  type="text"
                  value={trabalhoInstrucoes}
                  onChange={(e) => setTrabalhoInstrucoes(e.target.value)}
                  placeholder="Ex: A lista de chamada será o próprio trabalho. Enviem pelo WhatsApp oficial."
                  className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          {/* Motivo e Orientação aos Alunos */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center justify-between">
              <span>Orientação / Motivo Exibido aos Alunos:</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">*Visível em tempo real no portal</span>
            </label>
            <textarea
              value={motivoTexto}
              onChange={(e) => setMotivoTexto(e.target.value)}
              rows={2}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl p-3 text-xs font-medium text-slate-800 dark:text-white focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              placeholder="Descreva a razão do imprevisto e instruções para a turma..."
              required
            />
          </div>

          {/* Ações Rápidas de Comunicação (WhatsApp e Meet) */}
          <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                Disparo Rápido de Comunicado
              </span>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                1 Clique
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDispararWhatsApp}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Disparar no WhatsApp da Turma</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(mensagemWhatsApp, 'whatsapp')}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                {copiedKey === 'whatsapp' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'whatsapp' ? 'Copiado!' : 'Copiar Texto Completo'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy(mensagemChatMeet, 'meet')}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                {copiedKey === 'meet' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <MessageSquare className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'meet' ? 'Copiado!' : 'Copiar para Chat do Meet'}</span>
              </button>
            </div>
          </div>

          {/* Rodapé e Ações Finais */}
          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {existingProvidencia && existingProvidencia.ativo ? (
              <button
                type="button"
                onClick={handleDesfazer}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-700 hover:border-red-300 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Desfazer Providência (Voltar ao Normal)
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{isSubmitting ? 'Salvando...' : 'Ativar Providência & Notificar'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
