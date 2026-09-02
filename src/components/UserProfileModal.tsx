'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, Church, MapPin, GraduationCap, 
  FileText, Camera, Check, X, Sparkles, Save, Globe, Image as ImageIcon, Upload, Loader2, Clock
} from 'lucide-react';
import { 
  fetchStudentData, 
  savePortalProfile,
  parsePeriodoToNum,
  formatPeriodoNumToLabel
} from '@/services/studentSyncService';
import { 
  getAuthorizedUserInfo, 
  addOrUpdateAuthorizedUser 
} from '@/lib/authConfig';
import { formatPhone } from '@/lib/phoneUtils';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onProfileUpdated?: () => void;
  isFirstAccess?: boolean;
  onRemindLater?: () => void;
}

export interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  igreja: string;
  cidade: string;
  periodo: string;
  periodoNum?: number;
  turmaIdx?: number;
  turmaNome?: string;
  avatarUrl: string;
  bio: string;
}

const PRESET_AVATARS = [
  { id: 'av-1', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', label: 'Masculino 1' },
  { id: 'av-2', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', label: 'Masculino 2' },
  { id: 'av-3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', label: 'Masculino 3' },
  { id: 'av-4', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', label: 'Feminino 1' },
  { id: 'av-5', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', label: 'Feminino 2' },
  { id: 'av-6', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', label: 'Feminino 3' },
];

/**
 * Redimensiona e comprime uma imagem do dispositivo para Base64 leve (~25KB)
 * garantindo compatibilidade com Supabase, Safari iOS, Android e PC.
 */
function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onProfileUpdated,
  isFirstAccess = false,
  onRemindLater,
}) => {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  const authInfo = getAuthorizedUserInfo(normalizedEmail);
  const userConfig = authInfo.user;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UserProfileData>({
    name: userConfig?.name || normalizedEmail,
    email: normalizedEmail,
    phone: '',
    igreja: '',
    cidade: '',
    periodo: '7º Período (Turma A Noturno)',
    periodoNum: 7,
    turmaIdx: 1, // 0: Fim de Semana (5º), 1: Semanal Noturno A (7º), 2: Semanal Noturno B (3º), 3: Curso Básico
    turmaNome: 'Semanal Noturno - Turma A (7º Período)',
    avatarUrl: userConfig?.avatarUrl || PRESET_AVATARS[0].url,
    bio: '',
  });

  const [customAvatarInput, setCustomAvatarInput] = useState<string>('');
  const [showCustomAvatarField, setShowCustomAvatarField] = useState<boolean>(false);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);

  // Carregar perfil salvo na nuvem/local ao abrir o modal e ao receber atualizações da nuvem
  useEffect(() => {
    if (!isOpen || !normalizedEmail) return;

    let isMounted = true;

    const loadProfileData = () => {
      fetchStudentData(normalizedEmail).then((data) => {
        if (!isMounted) return;
        const prof = data.portalProfile || {};
        const latestAuth = getAuthorizedUserInfo(normalizedEmail).user;
        const pNum = parsePeriodoToNum(prof.periodoNum ?? prof.periodo ?? 7);
        const tIdx = prof.turmaIdx !== undefined ? Number(prof.turmaIdx) : (pNum === 5 ? 0 : pNum === 7 ? 1 : pNum === 3 ? 2 : 0);
        setFormData({
          name: prof.name || latestAuth?.name || normalizedEmail,
          email: normalizedEmail,
          phone: formatPhone(prof.phone || latestAuth?.whatsapp || ''),
          igreja: prof.igreja || '',
          cidade: prof.cidade || '',
          periodoNum: pNum,
          periodo: formatPeriodoNumToLabel(pNum),
          turmaIdx: tIdx,
          turmaNome: prof.turmaNome || '',
          avatarUrl: prof.avatarUrl || latestAuth?.avatarUrl || PRESET_AVATARS[0].url,
          bio: prof.bio || '',
        });
      });
    };

    loadProfileData();

    const handleSyncUpd = (e: any) => {
      if (e?.detail?.email === normalizedEmail && e?.detail?.source === 'cloud_sync') {
        loadProfileData();
      }
    };

    window.addEventListener('lms_student_sync_updated', handleSyncUpd);

    return () => {
      isMounted = false;
      window.removeEventListener('lms_student_sync_updated', handleSyncUpd);
    };
  }, [isOpen, normalizedEmail]);

  if (!isOpen) return null;

  const handleSelectAvatar = (url: string) => {
    setFormData((prev) => ({ ...prev, avatarUrl: url }));
    setShowCustomAvatarField(false);
  };

  const handleApplyCustomAvatar = () => {
    if (customAvatarInput.trim()) {
      setFormData((prev) => ({ ...prev, avatarUrl: customAvatarInput.trim() }));
      setCustomAvatarInput('');
      setShowCustomAvatarField(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const compressed = await compressImageFile(file);
      setFormData((prev) => ({ ...prev, avatarUrl: compressed }));
    } catch (err) {
      console.warn('Erro ao processar imagem de foto:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemindLaterClick = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`lms_remind_profile_later_${normalizedEmail}`, 'true');
    }
    if (onRemindLater) onRemindLater();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Marca perfil como confirmado definitivamente no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`lms_profile_confirmed_${normalizedEmail}`, 'true');
        localStorage.removeItem(`lms_remind_profile_later_${normalizedEmail}`);
      }

      // 2. Atualiza a lista de usuários autorizados (RBAC local/cloud)
      addOrUpdateAuthorizedUser({
        ...(userConfig || { email: normalizedEmail, name: formData.name, roles: ['aluno' as const], defaultRole: 'aluno' as const }),
        email: normalizedEmail,
        name: formData.name,
        avatarUrl: formData.avatarUrl,
        whatsapp: formData.phone,
        turmaIdx: formData.turmaIdx,
        periodoNum: formData.periodoNum,
      });

      // 3. Salva no Supabase DB (student_sync) + localStorage de forma local-first & assíncrona
      savePortalProfile(normalizedEmail, formData);

      // 4. Dispara evento de atualização em tempo real para a barra superior (Navbar) e painéis
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('lms_student_sync_updated', { detail: { email: normalizedEmail } })
        );
      }

      // 5. Notifica o callback pai e fecha o modal imediatamente (< 1ms)
      if (onProfileUpdated) onProfileUpdated();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Input de arquivo invisível para acionar a galeria/câmera do celular ou arquivos do PC */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="bg-white w-full max-w-xl rounded-3xl border border-gray-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header do Modal */}
        <div className={`p-5 sm:p-6 text-white flex justify-between items-start flex-shrink-0 ${
          isFirstAccess 
            ? 'bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-700'
        }`}>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {isFirstAccess ? 'Boas-Vindas ao Koinonia LMS • Primeiro Acesso' : 'Cadastro do Aluno'}
            </span>
            <h3 className="text-xl font-black">
              {isFirstAccess ? 'Configure sua Situação Acadêmica & Perfil' : 'Meu Perfil Acadêmico'}
            </h3>
            <p className="text-xs text-blue-100 mt-1">
              {isFirstAccess 
                ? 'Confirme seu período e turma para personalizar sua grade de aulas e presenças.' 
                : 'Atualize suas informações pessoais, período, turma e foto no Koinonia LMS.'}
            </p>
          </div>

          <button
            onClick={isFirstAccess ? handleRemindLaterClick : onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            title={isFirstAccess ? 'Lembrar mais tarde' : 'Fechar'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário de Perfil */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Seção da Foto de Perfil / Avatar */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-3">
            <label className="text-xs font-bold text-gray-700 block">Foto de Perfil / Avatar</label>
            <div className="flex items-center gap-4">
              <div 
                className="relative group cursor-pointer" 
                onClick={() => fileInputRef.current?.click()}
                title="Clique para escolher uma foto do seu dispositivo"
              >
                <img
                  src={formData.avatarUrl}
                  alt={formData.name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-500/30 shadow-md"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition">
                  {uploadingFile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-900">{formData.name || 'Aluno'}</p>
                <p className="text-[11px] text-gray-500">{formData.email}</p>
                
                {/* Botões de Ação para Foto */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition shadow-xs disabled:opacity-50"
                  >
                    {uploadingFile ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>{uploadingFile ? 'Carregando...' : 'Enviar foto do PC / Celular'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCustomAvatarField(!showCustomAvatarField)}
                    className="text-xs font-bold text-gray-600 hover:text-blue-700 underline flex items-center gap-1"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    {showCustomAvatarField ? 'Avatares padrão' : 'URL de foto'}
                  </button>
                </div>
              </div>
            </div>

            {/* Input de URL Personalizada */}
            {showCustomAvatarField ? (
              <div className="flex gap-2 pt-2">
                <input
                  type="url"
                  placeholder="Cole a URL da sua foto (ex: Google Drive, Imgur, etc.)"
                  value={customAvatarInput}
                  onChange={(e) => setCustomAvatarInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomAvatar}
                  className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
                >
                  Aplicar
                </button>
              </div>
            ) : (
              /* Galeria de Avatares Rápidos */
              <div className="pt-2">
                <span className="text-[11px] text-gray-400 font-semibold block mb-2">Ou escolha uma foto pronta:</span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleSelectAvatar(av.url)}
                      className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition ${
                        formData.avatarUrl === av.url ? 'border-blue-600 ring-2 ring-blue-500/40 scale-105' : 'border-transparent hover:opacity-80'
                      }`}
                    >
                      <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                      {formData.avatarUrl === av.url && (
                        <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center text-white">
                          <Check className="w-4 h-4 font-bold" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grid de Campos de Dados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Nome Completo
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                placeholder="Seu nome completo"
              />
            </div>

            {/* E-mail (Read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> E-mail da Conta Google
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* WhatsApp / Telefone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp / Celular
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                maxLength={15}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                placeholder="(21) 99999-9999"
              />
            </div>

            {/* Igreja / Denominação */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Church className="w-3.5 h-3.5 text-purple-600" /> Igreja / Congregação
              </label>
              <input
                type="text"
                value={formData.igreja}
                onChange={(e) => setFormData({ ...formData, igreja: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                placeholder="Ex: Igreja Evangélica Congregacional"
              />
            </div>

            {/* Cidade / Estado */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" /> Cidade / Estado
              </label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                placeholder="Ex: Rio de Janeiro - RJ"
              />
            </div>

            {/* Período Teológico */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-600" /> Período Teológico Atual
              </label>
              <select
                value={formData.periodoNum ?? parsePeriodoToNum(formData.periodo)}
                onChange={(e) => {
                  const newNum = Number(e.target.value);
                  let autoTurma = formData.turmaIdx ?? 1;
                  if (newNum === 5) autoTurma = 0;
                  else if (newNum === 7) autoTurma = 1;
                  else if (newNum === 3) autoTurma = 2;
                  else if (newNum === 0) autoTurma = 3;

                  setFormData({
                    ...formData,
                    periodoNum: newNum,
                    periodo: formatPeriodoNumToLabel(newNum),
                    turmaIdx: autoTurma,
                  });
                }}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value={1}>1º Período - Ingressantes</option>
                <option value={2}>2º Período</option>
                <option value={3}>3º Período (Turma B Noturno)</option>
                <option value={4}>4º Período</option>
                <option value={5}>5º Período (Fim de Semana)</option>
                <option value={6}>6º Período</option>
                <option value={7}>7º Período (Turma A Noturno)</option>
                <option value={8}>8º Período - Formandos</option>
                <option value={0}>Curso Básico de Teologia</option>
              </select>
            </div>

            {/* Turma de Aulas (Horários) */}
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Turma de Aulas (Horários)
              </label>
              <select
                value={formData.turmaIdx ?? 1}
                onChange={(e) => {
                  const newTurma = Number(e.target.value);
                  setFormData({
                    ...formData,
                    turmaIdx: newTurma,
                  });
                }}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              >
                <option value={1}>Semanal Noturno - Turma A (7º Período)</option>
                <option value={2}>Semanal Noturno - Turma B (3º Período)</option>
                <option value={0}>Fim de Semana - 5º Período</option>
                <option value={3}>Semanal Noturno - Curso Básico</option>
              </select>
            </div>

            {/* Minibio / Foco de Estudo */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-600" /> Breve Apresentação / Ministério
              </label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 resize-none"
                placeholder="Compartilhe brevemente sua trajetória ou ministério na igreja..."
              />
            </div>
          </div>

          {/* Footer Botões */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
            {isFirstAccess || onRemindLater ? (
              <button
                type="button"
                onClick={handleRemindLaterClick}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Lembrar-me Depois</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
              >
                Cancelar
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md transition flex items-center gap-2 cursor-pointer ${
                  isFirstAccess
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{isFirstAccess ? 'Salvar e Confirmar Perfil' : 'Salvar Perfil'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
