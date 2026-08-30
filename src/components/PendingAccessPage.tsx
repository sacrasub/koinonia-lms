'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Clock, Send, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react';
import { requestAccess, getPendingRequests, syncRbacFromCloud } from '@/lib/authConfig';

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

  useEffect(() => {
    async function checkPending() {
      await syncRbacFromCloud();
      const requests = getPendingRequests();
      const found = requests.find((r) => r.email === userEmail.toLowerCase().trim());
      if (found) {
        setRequested(true);
      }
    }
    checkPending();
  }, [userEmail]);

  const handleRequestAccess = () => {
    setLoading(true);
    setTimeout(() => {
      requestAccess(userEmail, userName, userAvatar);
      setRequested(true);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-2xl space-y-6 text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 text-3xl font-bold mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            Acesso Não Autorizado • Semestre 2026.2
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mt-2">Aprovação Necessária</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Sua conta do Google foi autenticada, mas ainda não possui permissão ativa para acessar o LMS do Seminário.
          </p>
        </div>

        {/* Card do Usuário Autenticado */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3 text-left">
          <img
            src={userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={userName || userEmail}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/20"
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-gray-900 truncate">{userName || userEmail}</div>
            <div className="text-xs text-gray-500 truncate">{userEmail}</div>
          </div>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
            Google OAuth ✓
          </span>
        </div>

        {/* Status da Solicitação */}
        {requested ? (
          <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl text-left space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Solicitação Enviada com Sucesso!</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Sua solicitação de acesso foi registrada para a secretaria e para os administradores. Assim que aprovada, você terá acesso imediato às disciplinas.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-left space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
              <Lock className="w-4 h-4 text-blue-600 flex-shrink-0" /> Solicitar Liberação ao Admin
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Se você é aluno matriculado ou docente do Seminário Teológico UIECB, clique no botão abaixo para enviar o pedido de autorização ao administrador.
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="space-y-3">
          {!requested && (
            <button
              onClick={handleRequestAccess}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Enviando Solicitação...' : 'Solicitar Autorização ao Administrador'}</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair / Entrar com Outra Conta Google</span>
          </button>
        </div>

        <div className="pt-2 text-[11px] text-gray-400">
          Suporte EAD: ead@uiecbead.com.br • Seminário Teológico UIECB
        </div>
      </div>
    </div>
  );
};
