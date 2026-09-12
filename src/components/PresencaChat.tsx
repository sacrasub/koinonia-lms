'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Users, Send, X, Minimize2, Maximize2, 
  Circle, CheckCheck, Sparkles, Smile, RefreshCw, Bell, BellOff
} from 'lucide-react';
import { DirectMessage, OnlinePeer, UserRole } from '@/types';
import { 
  getOnlinePeers, 
  sendPresenceHeartbeat, 
  getDirectMessages, 
  sendDirectMessage, 
  getUnreadMessagesCount, 
  getLatestUnreadMessage,
  markMessagesAsRead 
} from '@/services/collaborationService';

interface PresencaChatProps {
  currentUserEmail: string;
  currentUserName?: string;
  currentUserRole?: UserRole;
}

// Sintetizador Web Audio API de toque suave (harmonioso e polido, sem arquivos externos)
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    // Harmônico suave: D5 (587.33Hz) saltando para A5 (880Hz)
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880.00, now + 0.09);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.40);
  } catch (e) {
    // Silently ignore se áudio não for permitido antes de interação do usuário
  }
}

export const PresencaChat: React.FC<PresencaChatProps> = ({
  currentUserEmail,
  currentUserName = 'Seminarista',
  currentUserRole = 'aluno'
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [peers, setPeers] = useState<OnlinePeer[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<OnlinePeer | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'peers' | 'chat'>('peers');

  // Modo Não Perturbe (DND) com persistência local
  const [isDndActive, setIsDndActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lms_chat_dnd') === 'true';
    }
    return false;
  });

  // Notificação visual flutuante (Toast de nova mensagem)
  const [incomingToast, setIncomingToast] = useState<{
    id: string;
    senderName: string;
    senderEmail: string;
    conteudo: string;
  } | null>(null);

  const lastNotifiedMsgIdRef = useRef<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleDnd = () => {
    setIsDndActive((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('lms_chat_dnd', String(next));
      }
      return next;
    });
  };

  // Heartbeat de Presença e Atualização de Mensagens / Notificações
  useEffect(() => {
    if (!currentUserEmail) return;

    // Envia presença imediatamente
    sendPresenceHeartbeat({
      email: currentUserEmail,
      nome: currentUserName,
      role: currentUserRole,
    });

    const checkNewMessagesAndPresence = async () => {
      try {
        const activePeers = await getOnlinePeers(currentUserEmail);
        setPeers(activePeers);
      } catch (e) {}

      try {
        const count = await getUnreadMessagesCount(currentUserEmail);
        setUnreadCount(count);

        if (count > 0) {
          const latestUnread = await getLatestUnreadMessage(currentUserEmail);
          if (latestUnread && latestUnread.id !== lastNotifiedMsgIdRef.current) {
            // Se for primeira vez lendo, apenas registra sem tocar som para não assustar no load
            if (lastNotifiedMsgIdRef.current !== null) {
              // Nova mensagem real chegou!
              if (!isDndActive) {
                playNotificationChime();
                setIncomingToast({
                  id: latestUnread.id,
                  senderName: latestUnread.remetente_nome || latestUnread.remetente_email.split('@')[0],
                  senderEmail: latestUnread.remetente_email,
                  conteudo: latestUnread.conteudo,
                });
                if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
                toastTimeoutRef.current = setTimeout(() => {
                  setIncomingToast(null);
                }, 7000);
              }
            }
            lastNotifiedMsgIdRef.current = latestUnread.id;
          }
        }
      } catch (e) {}
    };

    checkNewMessagesAndPresence();

    // Polling inteligente de mensagens a cada 12s quando visível
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        sendPresenceHeartbeat({
          email: currentUserEmail,
          nome: currentUserName,
          role: currentUserRole,
        });
        checkNewMessagesAndPresence();
      }
    }, 12000);

    return () => {
      clearInterval(interval);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [currentUserEmail, currentUserName, currentUserRole, isDndActive]);

  // Carrega mensagens do colega selecionado
  useEffect(() => {
    if (!selectedPeer || !currentUserEmail) return;

    const loadChat = async () => {
      const msgs = await getDirectMessages(currentUserEmail, selectedPeer.email);
      setMessages(msgs);
      markMessagesAsRead(selectedPeer.email, currentUserEmail);
      getUnreadMessagesCount(currentUserEmail).then(setUnreadCount);
      setTimeout(scrollToBottom, 100);
    };

    loadChat();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        loadChat();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedPeer, currentUserEmail]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeer || !inputText.trim() || !currentUserEmail) return;

    const text = inputText.trim();
    setInputText('');

    const newMsg = await sendDirectMessage({
      remetente_email: currentUserEmail,
      remetente_nome: currentUserName,
      destinatario_email: selectedPeer.email,
      destinatario_nome: selectedPeer.nome,
      conteudo: text,
    });

    setMessages((prev) => [...prev, newMsg]);
    setTimeout(scrollToBottom, 50);
  };

  const handleSelectPeer = (peer: OnlinePeer) => {
    setSelectedPeer(peer);
    setActiveTab('chat');
  };

  const otherOnlineCount = peers.filter((p) => p.is_online).length;
  const totalConnected = otherOnlineCount + 1; // Colegas online + Usuário atual logado

  // Ordena para que os colegas online fiquem sempre no topo
  const sortedPeers = [...peers].sort((a, b) => {
    if (a.is_online === b.is_online) return a.nome.localeCompare(b.nome);
    return a.is_online ? -1 : 1;
  });

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lms_presence_widget_dismissed') === 'true';
    }
    return false;
  });

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lms_presence_widget_dismissed', 'true');
    }
  };

  const handleUndismiss = () => {
    setIsDismissed(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lms_presence_widget_dismissed');
    }
  };

  return (
    <>
      {/* 1. WIDGET FLUTUANTE DISCRETO (POSICIONADO NO CANTO INFERIOR DIREITO E ELEVADO NO MOBILE) */}
      {!isOpen && !isDismissed && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-slate-900/90 hover:bg-slate-900 text-white px-3.5 py-2 rounded-full border border-slate-700/80 shadow-lg backdrop-blur-xs flex items-center gap-2 transition-all hover:scale-105 cursor-pointer text-xs font-semibold"
            title="Abrir Comunidade e Chat"
          >
            <div className="relative flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute opacity-75 animate-ping"></span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-bold">
                {otherOnlineCount > 0 
                  ? `${totalConnected} Conectados` 
                  : 'Online'}
              </span>
              {isDndActive && (
                <span title="Modo Não Perturbe Ativo (Silenciado)">
                  <BellOff className="w-3 h-3 text-amber-400 shrink-0" />
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] font-black rounded-full shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Botão de Fechar / Ocultar para não atrapalhar */}
          <button
            onClick={handleDismiss}
            className="w-6 h-6 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full flex items-center justify-center text-[10px] border border-slate-700 shadow-md transition cursor-pointer"
            title="Ocultar indicador de status da tela"
          >
            ✕
          </button>
        </div>
      )}

      {/* Ícone mínimo caso o usuário tenha dispensado */}
      {!isOpen && isDismissed && unreadCount > 0 && (
        <button
          onClick={() => {
            handleUndismiss();
            setIsOpen(true);
          }}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 bg-red-600 text-white w-10 h-10 rounded-full shadow-xl flex items-center justify-center animate-bounce cursor-pointer border-2 border-white"
          title="Novas mensagens recebidas!"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 bg-white text-red-600 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
            {unreadCount}
          </span>
        </button>
      )}

      {/* 2. JANELA DE CHAT EXPANDIDA / DRAWER */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl border border-gray-200/90 shadow-2xl overflow-hidden flex flex-col h-[460px] animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Header do Chat */}
          <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
              <div>
                <h4 className="text-xs font-black">
                  {selectedPeer ? selectedPeer.nome : 'Comunidade & Presença Social'}
                </h4>
                <span className="text-[10px] text-slate-300 block font-medium">
                  {selectedPeer 
                    ? selectedPeer.is_online ? '🟢 Online agora' : '⚪ Offline (Mensagem assíncrona)'
                    : otherOnlineCount > 0 
                      ? `🟢 ${totalConnected} conectados (${otherOnlineCount} colega${otherOnlineCount > 1 ? 's' : ''} + Você)`
                      : '🟢 Você está online • Nenhum outro colega conectado'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Botão Modo Não Perturbe (DND) */}
              <button
                onClick={toggleDnd}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  isDndActive 
                    ? 'text-amber-300 bg-amber-500/20 border border-amber-500/40' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isDndActive ? 'Não Perturbe ATIVO (Sons e avisos silenciados) - Clique para reativar' : 'Ativar Modo Não Perturbe (Silenciar sons)'}
              >
                {isDndActive ? <BellOff className="w-3.5 h-3.5 text-amber-400" /> : <Bell className="w-3.5 h-3.5" />}
              </button>

              {selectedPeer && (
                <button
                  onClick={() => setSelectedPeer(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg text-[10px] font-bold"
                  title="Ver todos os colegas"
                >
                  Lista
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                title="Minimizar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conteúdo: Lista de Colegas ou Janela de Mensagens */}
          {!selectedPeer ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50">
              {/* CARD DO PRÓPRIO USUÁRIO (STATUS PESSOAL) */}
              <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/70 border-2 border-emerald-300 rounded-2xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                      {currentUserName?.charAt(0) || 'V'}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-emerald-950 truncate">
                        {currentUserName || currentUserEmail}
                      </span>
                      <span className="text-[9px] bg-emerald-200 text-emerald-900 border border-emerald-300 px-1.5 py-0.2 rounded font-black uppercase shrink-0">
                        Você
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      🟢 Online agora (Conectado em tempo real)
                    </span>
                  </div>
                </div>
              </div>

              {/* CABEÇALHO DA LISTA DE COLEGAS */}
              <div className="px-1 pt-1 flex items-center justify-between text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
                <span>Colegas de Curso ({peers.length})</span>
                <span className={otherOnlineCount > 0 ? 'text-emerald-700 font-bold' : 'text-slate-400 font-bold'}>
                  {otherOnlineCount > 0 ? `${otherOnlineCount} colega(s) online` : '0 outros online'}
                </span>
              </div>

              {sortedPeers.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  Nenhum colega registrado.
                </div>
              ) : (
                sortedPeers.map((peer) => (
                  <button
                    key={peer.email}
                    onClick={() => handleSelectPeer(peer)}
                    className={`w-full p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-left cursor-pointer group shadow-2xs ${
                      peer.is_online
                        ? 'bg-emerald-50/50 hover:bg-emerald-100/60 border-emerald-200'
                        : 'bg-white hover:bg-blue-50/60 border-gray-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white ${
                          peer.is_online 
                            ? 'bg-gradient-to-br from-emerald-600 to-teal-800' 
                            : 'bg-gradient-to-br from-slate-700 to-slate-900'
                        }`}>
                          {peer.nome.charAt(0)}
                        </div>
                        <span 
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                            peer.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                          }`}
                          title={peer.is_online ? 'Online agora' : 'Offline'}
                        />
                      </div>

                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate transition ${
                          peer.is_online ? 'text-emerald-950 font-black' : 'text-gray-800 group-hover:text-blue-600'
                        }`}>
                          {peer.nome}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 capitalize">
                            {peer.role === 'admin' ? 'Coordenação' : peer.role}
                          </span>
                          <span className="text-[9px] text-slate-300">·</span>
                          <span className={`text-[10px] font-semibold ${peer.is_online ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                            {peer.is_online ? '🟢 Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition shrink-0">
                      Mensagem →
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Conversa Direta (DM) */
            <div className="flex-1 flex flex-col bg-[#F9FAFB]">
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">

                {messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400 space-y-1">
                    <p className="font-bold text-gray-600">Inicie uma conversa direta com {selectedPeer.nome}.</p>
                    <p className="text-[11px]">Tire dúvidas, combine estudos ou compartilhe experiências pastorais.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.remetente_email.toLowerCase() === currentUserEmail.toLowerCase();
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                            isMine
                              ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                              : 'bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs shadow-2xs'
                          }`}
                        >
                          <p>{msg.conteudo}</p>
                        </div>
                        <span className="text-[9px] text-gray-400 mt-0.5 px-1">
                          {new Date(msg.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Caixa de Digitação de Mensagem */}
              <form onSubmit={handleSendMessage} className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Mensagem para ${selectedPeer.nome.split(' ')[0]}...`}
                  className="flex-1 bg-gray-50 text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition cursor-pointer shadow-xs"
                  title="Enviar mensagem"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 3. AVISO VISUAL DE NOVA MENSAGEM RECEBIDA (TOAST FLUTUANTE COM RESPOSTA RÁPIDA) */}
      {incomingToast && !isOpen && (
        <div className="fixed bottom-24 sm:bottom-20 right-4 sm:right-6 z-60 max-w-xs sm:max-w-sm w-full bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl border-2 border-emerald-500/80 shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm ring-2 ring-emerald-400/40">
            {incomingToast.senderName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-black text-emerald-300 truncate">
                {incomingToast.senderName}
              </span>
              <button
                onClick={() => setIncomingToast(null)}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                title="Fechar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-200 line-clamp-2 mt-0.5 leading-snug">
              {incomingToast.conteudo}
            </p>
            <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-800">
              <button
                onClick={() => {
                  const peer = peers.find(p => p.email.toLowerCase() === incomingToast.senderEmail.toLowerCase()) || {
                    email: incomingToast.senderEmail,
                    nome: incomingToast.senderName,
                    role: 'aluno' as UserRole,
                    ultimo_heartbeat: new Date().toISOString(),
                    is_online: true,
                  };
                  setSelectedPeer(peer);
                  setActiveTab('chat');
                  setIsOpen(true);
                  setIncomingToast(null);
                }}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <span>Responder agora</span>
                <span>→</span>
              </button>
              <span className="text-[10px] text-slate-400">
                Agora mesmo
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
