'use client';

import React, { useState } from 'react';
import { 
  X, Send, Mail, MessageCircle, Copy, Check, ExternalLink, 
  Sparkles, ShieldCheck, GraduationCap, BookOpen, UserCheck, Smartphone, User
} from 'lucide-react';
import { UserRole } from '@/types';
import { UserRoleMapping } from '@/lib/authConfig';
import { cleanPhoneNumber, formatPhone, getWhatsAppUrl } from '@/lib/phoneUtils';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name?: string;
    email: string;
    role?: UserRole;
    defaultRole?: UserRole;
    whatsapp?: string;
    turmaIdx?: number;
    periodoNum?: number;
  } | null;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !user) return null;

  const role: UserRole = user.defaultRole || user.role || 'aluno';
  const roleName = 
    role === 'admin' ? 'Administrador(a)' : 
    role === 'professor' ? 'Professor(a)' : 
    role === 'monitor' ? 'Monitor(a)' : 'Aluno(a)';

  const platformUrl = 'https://koinonialms.vercel.app';
  const cleanPhone = cleanPhoneNumber(user.whatsapp);
  const formattedPhone = formatPhone(user.whatsapp);
  const userName = user.name || user.email.split('@')[0];

  const inviteSubject = `Convite de Acesso • Koinonia LMS (Seminário Teológico)`;

  const inviteMessage = `Olá, *${userName}*! ✝️

Seu acesso ao *Koinonia LMS* (Plataforma Acadêmica do Seminário Teológico Koinonia) está liberado e autorizado no perfil de *${roleName}*!
Esta plataforma é fruto do Projeto de TCC do Seminarista Cristiano Sacramento.

🔗 *Link Oficial de Acesso:*
${platformUrl}

📋 *Como Entrar:*
1. Acesse o link acima no seu celular ou computador.
2. Clique no botão *"Continuar com Google"*.
3. Selecione o seu e-mail cadastrado: *${user.email}*.
4. Pronto! Você terá acesso instantâneo à grade semanal de aulas, links do Google Meet, pastas virtuais do Google Drive, biblioteca digital e caderno Cornell com inteligência artificial.

Dúvidas ou suporte? Estamos à disposição!

_Coordenação Acadêmica & Tecnologia_
*Koinonia LMS • Semestre 2026.2*
_Projeto TCC do Seminarista Cristiano Sacramento_`;

  const mailtoUrl = `mailto:${encodeURIComponent(user.email)}?subject=${encodeURIComponent(inviteSubject)}&body=${encodeURIComponent(inviteMessage)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(user.email)}&su=${encodeURIComponent(inviteSubject)}&body=${encodeURIComponent(inviteMessage)}`;
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(inviteMessage)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteMessage)}`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(inviteMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(platformUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
        
        {/* Cabeçalho do Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Send className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-400 text-slate-950">
                  Acesso Autorizado
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                  {roleName}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1 leading-tight">
                Enviar Convite de Acesso ao LMS
              </h3>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Compartilhe as instruções de login para {userName} com 1 clique
              </p>
            </div>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Cartão do Usuário */}
          <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm shrink-0 border border-blue-200">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-sm text-slate-900 truncate">{userName}</div>
                <div className="text-xs text-slate-500 font-medium truncate">{user.email}</div>
              </div>
            </div>

            {formattedPhone ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shrink-0">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{formattedPhone}</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 italic">WhatsApp não informado</span>
            )}
          </div>

          {/* Pré-visualização da Mensagem */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                Mensagem Formatada de Convite
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition cursor-pointer"
              >
                {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMessage ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>

            <div className="p-3.5 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono leading-relaxed max-h-48 overflow-y-auto border border-slate-800 whitespace-pre-line shadow-inner">
              {inviteMessage}
            </div>
          </div>

          {/* Ações Rápidas de Disparo */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Canais de Envio Rápido:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Botão WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>{cleanPhone ? 'Enviar via WhatsApp' : 'Abrir WhatsApp Web'}</span>
              </a>

              {/* Botão Gmail Web / Celular */}
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>Abrir no Gmail (Web / Celular)</span>
              </a>
            </div>

            {/* Opção alternativa caso utilize aplicativo de desktop */}
            <button
              type="button"
              onClick={() => {
                window.location.href = mailtoUrl;
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Ou abrir no App de E-mail do Sistema (Outlook / Apple Mail)</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Botão Copiar Mensagem */}
              <button
                type="button"
                onClick={handleCopyMessage}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  copiedMessage
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {copiedMessage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copiedMessage ? 'Mensagem Copiada!' : 'Copiar Mensagem Completa'}</span>
              </button>

              {/* Botão Copiar Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  copiedLink
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4 text-blue-600" /> : <ExternalLink className="w-4 h-4 text-slate-500" />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Apenas o Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 rounded-b-3xl flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-extrabold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
