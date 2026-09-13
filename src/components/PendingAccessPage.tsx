'use client';

import React, { useState, useEffect } from 'react';
import { 
  Lock, Clock, Send, LogOut, CheckCircle2, ShieldAlert, 
  GraduationCap, User, Phone, BookOpen, Edit3, MessageSquare, AlertCircle
} from 'lucide-react';
import { 
  requestAccess, 
  getPendingRequests, 
  syncRbacFromCloud, 
  AccessRequest, 
  RequestAccessPayload 
} from '@/lib/authConfig';
import { formatPhone, cleanPhoneNumber } from '@/lib/phoneUtils';

interface PendingAccessPageProps {
  userEmail: string;
  userName?: string;
  userAvatar?: string;
  onLogout: () => void;
}

export const PendingAccessPage: React.FC<PendingAccessPageProps> = ({
  userEmail,
  userName,
  userAvatar,
  onLogout,
}) => {
  const [requested, setRequested] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [existingData, setExistingData] = useState<AccessRequest | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Campos do formulário de solicitação
  const [fullName, setFullName] = useState<string>(userName || '');
  const [turmaIdx, setTurmaIdx] = useState<number>(1); // 1: Turma A (Veteranos)
  const [periodoNum, setPeriodoNum] = useState<number>(7); // 7: 7º Período
  const [perfilSolicitado, setPerfilSolicitado] = useState<'aluno' | 'professor' | 'monitor' | 'ouvinte'>('aluno');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [observacao, setObservacao] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  // Honeypot Anti-Bot (Invisível via CSS)
  const [honeypotCode, setHoneypotCode] = useState<string>('');

  // Mapeamento de rótulos amigáveis de turmas
  const TURMA_OPTIONS = [
    { idx: 1, label: 'Turma A • Semanal Noturno (7º Período - Veteranos)', defaultPeriodo: 7 },
    { idx: 2, label: 'Turma B • Semanal Noturno (3º Período - Ingressantes)', defaultPeriodo: 3 },
    { idx: 0, label: 'Turma Fim de Semana • Modular (5º Período)', defaultPeriodo: 5 },
    { idx: 3, label: 'Curso Básico Teológico / Outro', defaultPeriodo: 1 },
  ];

  // Mapeamento de períodos
  const PERIODO_OPTIONS = [
    { num: 1, label: '1º Período' },
    { num: 2, label: '2º Período' },
    { num: 3, label: '3º Período (Turma B)' },
    { num: 4, label: '4º Período' },
    { num: 5, label: '5º Período (Modular)' },
    { num: 6, label: '6º Período' },
    { num: 7, label: '7º Período (Turma A - Veteranos)' },
    { num: 8, label: '8º Período (Concluinte / TCC)' },
  ];

  useEffect(() => {
    async function checkPending() {
      await syncRbacFromCloud(true);
      const requests = getPendingRequests();
      const found = requests.find((r) => r.email === userEmail.toLowerCase().trim());
      if (found) {
        setRequested(true);
        setExistingData(found);
        if (found.name) setFullName(found.name);
        if (found.turmaIdx !== undefined) setTurmaIdx(found.turmaIdx);
        if (found.periodoNum !== undefined) setPeriodoNum(found.periodoNum);
        if (found.perfilSolicitado) setPerfilSolicitado(found.perfilSolicitado);
        if (found.whatsapp) setWhatsapp(formatPhone(found.whatsapp));
        if (found.observacao) setObservacao(found.observacao);
      }
    }
    checkPending();
  }, [userEmail]);

  // Ao trocar de turma, sugere automaticamente o período correspondente
  const handleTurmaChange = (newIdx: number) => {
    setTurmaIdx(newIdx);
    const matched = TURMA_OPTIONS.find((t) => t.idx === newIdx);
    if (matched) {
      setPeriodoNum(matched.defaultPeriodo);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setWhatsapp(formatPhone(raw));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Se o honeypot estiver preenchido, é um bot! Descarte silencioso.
    if (honeypotCode && honeypotCode.trim().length > 0) {
      console.warn('[Anti-Bot] Tentativa automatizada bloqueada via Honeypot.');
      setRequested(true);
      return;
    }

    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length < 3) {
      setFormError('Por favor informe seu nome completo civil.');
      return;
    }

    const selectedTurma = TURMA_OPTIONS.find((t) => t.idx === turmaIdx);
    const selectedPeriodo = PERIODO_OPTIONS.find((p) => p.num === periodoNum);

    const payload: RequestAccessPayload = {
      email: userEmail,
      name: trimmedName,
      googleName: userName,
      avatarUrl: userAvatar,
      turmaIdx,
      turmaNome: selectedTurma?.label || `Turma ${turmaIdx}`,
      periodoNum,
      periodoNome: selectedPeriodo?.label || `${periodoNum}º Período`,
      perfilSolicitado,
      whatsapp: cleanPhoneNumber(whatsapp),
      observacao: observacao.trim() || undefined,
      b_security_code: honeypotCode,
    };

    try {
      setLoading(true);
      const req = await requestAccess(payload);
      setExistingData(req);
      setRequested(true);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Erro ao solicitar acesso:', err);
      setFormError(err?.message || 'Ocorreu um erro ao enviar sua solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex items-center justify-center p-3 sm:p-6">
      <div className="bg-slate-900 w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        
        {/* Header Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl font-bold mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Solicitação de Autorização • Semestre 2026.2
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">Acesso ao Koinonia LMS</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
              Sua conta Google foi autenticada. Para liberação das suas disciplinas, confirme seus dados acadêmicos abaixo para análise da coordenação.
            </p>
          </div>
        </div>

        {/* Card da Conta Google Conectada */}
        <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-center gap-3 text-left">
          <img
            src={userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={userName || userEmail}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-white truncate">{userName || userEmail}</div>
            <div className="text-xs text-slate-400 truncate">{userEmail}</div>
          </div>
          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/20 shrink-0">
            Google Conectado ✓
          </span>
        </div>

        {/* MODO 1: RESUMO DO PEDIDO JÁ ENVIADO */}
        {requested && !isEditing ? (
          <div className="space-y-4">
            <div className="p-5 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-left space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Solicitação em Análise pela Secretaria</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline underline-offset-2 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar dados
                </button>
              </div>

              <p className="text-xs text-emerald-200/90 leading-relaxed">
                Seu pedido foi registrado com sucesso. Assim que a coordenação ou a secretaria aprovar, seu acesso será liberado instantaneamente.
              </p>

              {/* Dados enviados */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-emerald-900/50 text-xs space-y-2 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Nome Oficial:</span>
                  <span className="font-bold text-white">{existingData?.name || fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Turma:</span>
                  <span className="font-bold text-blue-300">
                    {TURMA_OPTIONS.find((t) => t.idx === (existingData?.turmaIdx ?? turmaIdx))?.label || `Turma ${existingData?.turmaIdx ?? turmaIdx}`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Período:</span>
                  <span className="font-bold text-amber-300">
                    {PERIODO_OPTIONS.find((p) => p.num === (existingData?.periodoNum ?? periodoNum))?.label || `${existingData?.periodoNum ?? periodoNum}º Período`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Perfil Pretendido:</span>
                  <span className="font-bold capitalize text-emerald-300">
                    {existingData?.perfilSolicitado || perfilSolicitado}
                  </span>
                </div>
                {(existingData?.whatsapp || whatsapp) && (
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">WhatsApp:</span>
                    <span className="font-bold text-white">{formatPhone(existingData?.whatsapp || whatsapp)}</span>
                  </div>
                )}
                {(existingData?.observacao || observacao) && (
                  <div className="pt-1">
                    <span className="text-slate-400 block text-[11px]">Observações:</span>
                    <p className="italic text-slate-300 text-[11px] mt-0.5">
                      "{existingData?.observacao || observacao}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* MODO 2: FORMULÁRIO DE PREENCHIMENTO */
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Campo Honeypot Oculto (Anti-Bot: invisível para humanos, preenchido por scripts automatizados) */}
            <div
              style={{
                display: 'none',
                position: 'absolute',
                left: '-9999px',
                opacity: 0,
                pointerEvents: 'none',
                width: 0,
                height: 0,
                overflow: 'hidden'
              }}
              aria-hidden="true"
            >
              <label htmlFor="b_security_code">Segurança - Deixe em branco</label>
              <input
                id="b_security_code"
                type="text"
                name="b_security_code"
                tabIndex={-1}
                autoComplete="new-password"
                value={honeypotCode}
                onChange={(e) => setHoneypotCode(e.target.value)}
              />
            </div>

            {/* 1. Nome Completo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Nome Completo Oficial (Registro Acadêmico) *</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome e sobrenome completo"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <p className="text-[10px] text-slate-400">
                Se a sua conta Google usa apelido ou nome incompleto, informe seu nome civil para a lista de presença.
              </p>
            </div>

            {/* 2. Turma e Período (Lado a Lado) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Turma */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sua Turma *</span>
                </label>
                <select
                  value={turmaIdx}
                  onChange={(e) => handleTurmaChange(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  {TURMA_OPTIONS.map((t) => (
                    <option key={t.idx} value={t.idx}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Período */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Período Acadêmico *</span>
                </label>
                <select
                  value={periodoNum}
                  onChange={(e) => setPeriodoNum(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  {PERIODO_OPTIONS.map((p) => (
                    <option key={p.num} value={p.num}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Perfil Solicitado e WhatsApp (Lado a Lado) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Perfil Pretendido */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Perfil Solicitado *</span>
                </label>
                <select
                  value={perfilSolicitado}
                  onChange={(e) => setPerfilSolicitado(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="aluno">Aluno(a) Regular</option>
                  <option value="professor">Professor(a) / Docente</option>
                  <option value="monitor">Monitor(a) de Turma</option>
                  <option value="ouvinte">Aluno(a) Ouvinte / Especial</option>
                </select>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp com DDD</span>
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={handlePhoneChange}
                  placeholder="(00) 00000-0000"
                  maxLength={16}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* 4. Observações / Justificativa (Opcional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                <span>Observação ou Mensagem à Secretaria (Opcional)</span>
              </label>
              <textarea
                rows={2}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex: Matrícula realizada recentemente, disciplina avulsa, etc."
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              />
            </div>

            {/* Botão de Enviar */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Enviando Solicitação...' : (isEditing ? 'Atualizar Solicitação' : 'Enviar Solicitação de Autorização')}</span>
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full mt-2 py-2 text-xs font-semibold text-slate-400 hover:text-white transition text-center cursor-pointer"
                >
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>
        )}

        {/* Botão de Logout */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair / Entrar com Outra Conta Google</span>
          </button>

          <div className="text-center text-[10px] text-slate-500">
            Koinonia LMS • Seminário Teológico Congregacional • Suporte: ead@uiecbead.com.br
          </div>
        </div>
      </div>
    </div>
  );
};
