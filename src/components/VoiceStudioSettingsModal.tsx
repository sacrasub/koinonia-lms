'use client';

import React, { useState } from 'react';
import {
  Activity,
  AudioLines,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  Laptop,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
  Square,
  Terminal,
  Volume2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useVoiceStudio } from '@/contexts/VoiceStudioContext';
import {
  STYLE_INSTRUCT_PRESETS,
  VoiceStudioEngineMode,
  VoiceStudioResponseFormat,
  isLoopbackServerUrl,
} from '@/services/voiceStudioService';

const TEST_PHRASE_DEFAULT =
  'A paz do Senhor. Este é um teste de leitura em voz alta do Koinonia LMS integrado ao VoiceStudio.';

export const VoiceStudioSettingsModal: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetSettings,
    isSettingsOpen,
    closeSettings,
    connectionStatus,
    isTestingConnection,
    refreshConnection,
    availableVoices,
    availableModels,
    browserVoices,
    isSpeaking,
    isLoading,
    activeSourceId,
    speak,
    stop,
  } = useVoiceStudio();

  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);
  const [showHelpCmds, setShowHelpCmds] = useState(false);
  const [customVoiceMode, setCustomVoiceMode] = useState(false);
  const [testPhrase, setTestPhrase] = useState(TEST_PHRASE_DEFAULT);
  const [copiedCmd, setCopiedCmd] = useState<'install' | 'cors' | 'sh' | null>(null);

  if (!isSettingsOpen) return null;

  const isLoopback = isLoopbackServerUrl(settings.serverUrl);
  const originForCors =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://koinonialms.vercel.app';
  const corsAllowedList = Array.from(
    new Set([
      originForCors,
      'https://koinonialms.vercel.app',
      'https://uiecblms.vercel.app',
      'http://localhost:3000',
      'http://localhost:3902',
      'http://127.0.0.1:3902',
      'app://voicestudio',
    ])
  ).join(',');

  const winInstallCommand = `irm https://voicestudio.sh/install.ps1 | iex`;
  const winCorsEnvCommand = `[Environment]::SetEnvironmentVariable('OMNIVOICE_ALLOWED_ORIGINS', '${corsAllowedList}', 'User')`;
  const bashCommand = `OMNIVOICE_ALLOWED_ORIGINS="${corsAllowedList}" uv run uvicorn backend.main:app --host 127.0.0.1 --port 3900`;

  const handleCopyCmd = (which: 'install' | 'cors' | 'sh', cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(which);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const isTestingVoiceNow = activeSourceId === 'voicestudio-live-test' && (isSpeaking || isLoading);

  const handleLiveTest = () => {
    if (isTestingVoiceNow) {
      stop();
      return;
    }
    void speak({
      id: 'voicestudio-live-test',
      title: 'Teste de Voz • VoiceStudio',
      text: testPhrase.trim() || TEST_PHRASE_DEFAULT,
    });
  };

  return (
    <div
      data-voicestudio-modal="true"
      className="fixed inset-0 z-[80] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      onClick={closeSettings}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABEÇALHO */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 text-white flex items-center justify-between gap-3 border-b border-indigo-800/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-indigo-500/25 border border-indigo-400/40 shrink-0">
              <AudioLines className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black tracking-tight truncate">
                  Estúdio de Voz sobre Texto • VoiceStudio (TTS)
                </h2>
                <a
                  href="https://github.com/debpalash/voicestudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[10px] font-bold text-indigo-200 transition"
                >
                  <span>debpalash/VoiceStudio</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[11px] text-indigo-200/80 truncate">
                Ajuste voz, modelo, velocidade, estilo de narração e fallback para ler qualquer conteúdo da plataforma.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSettings}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shrink-0"
            aria-label="Fechar configurações de voz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CORPO COM SCROLL */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* SEÇÃO 1: MOTOR E CONEXÃO VOICESTUDIO */}
          <section className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                  1. Motor de Leitura & Conexão VoiceStudio
                </h3>
              </div>
              {connectionStatus && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    connectionStatus.ok
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-rose-100 text-rose-900 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  {connectionStatus.ok
                    ? `Conectado (${connectionStatus.activeEngine || 'VoiceStudio'}${
                        connectionStatus.device ? ` • ${connectionStatus.device}` : ''
                      })`
                    : 'VoiceStudio Offline'}
                </span>
              )}
            </div>

            {/* 3 Modos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'auto' as VoiceStudioEngineMode,
                  title: 'Automático (Recomendado)',
                  desc: 'Usa VoiceStudio quando ativo e cai para voz neural do navegador se offline.',
                },
                {
                  id: 'voicestudio' as VoiceStudioEngineMode,
                  title: 'Somente VoiceStudio',
                  desc: 'Usa exclusivamente sua engine local ou servidor VoiceStudio.',
                },
                {
                  id: 'browser' as VoiceStudioEngineMode,
                  title: 'Voz do Navegador',
                  desc: 'Usa apenas as vozes nativas do sistema (ideal no celular/sem servidor).',
                },
              ].map((m) => {
                const active = settings.engineMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => updateSettings({ engineMode: m.id })}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    <div className="text-xs font-extrabold">{m.title}</div>
                    <div
                      className={`text-[10px] mt-0.5 leading-snug ${
                        active ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {m.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* URL do servidor + atalhos */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-7 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>URL do Servidor VoiceStudio</span>
                  <span className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateSettings({
                          serverUrl: 'http://127.0.0.1:3900',
                          useServerProxy: false,
                        })
                      }
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <Laptop className="w-3 h-3" /> Local (:3900)
                    </button>
                  </span>
                </label>
                <input
                  type="url"
                  value={settings.serverUrl}
                  onChange={(e) => {
                    const nextUrl = e.target.value;
                    updateSettings({
                      serverUrl: nextUrl,
                      useServerProxy: isLoopbackServerUrl(nextUrl) ? false : settings.useServerProxy,
                    });
                  }}
                  placeholder="http://127.0.0.1:3900"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void refreshConnection()}
                  disabled={isTestingConnection}
                  className="w-full px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Testando...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Testar Conexão & Carregar Vozes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Proxy + Credenciais opcionais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                  API Key (opcional — <code className="text-[10px]">OMNIVOICE_API_KEY</code>)
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) => updateSettings({ apiKey: e.target.value })}
                    placeholder="Deixe vazio se local / loopback"
                    className="w-full px-3 py-2 pr-9 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey((p) => !p)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                  Share PIN de 6 dígitos (opcional — modo Network)
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={settings.sharePin}
                  onChange={(e) => updateSettings({ sharePin: e.target.value })}
                  placeholder="Ex: 123456 (se ativado)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {!isLoopback && (
              <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.useServerProxy}
                  onChange={(e) => updateSettings({ useServerProxy: e.target.checked })}
                  className="mt-0.5 accent-indigo-600"
                />
                <span className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                  <strong className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-500" />
                    Usar Proxy do Servidor Koinonia (para servidores remotos HTTP/HTTPS sem CORS)
                  </strong>
                  Encaminha a requisição via <code className="text-[10px]">/api/tts/voicestudio</code> quando a URL não é localhost.
                </span>
              </label>
            )}

            {/* Resultado de erro / CORS + ajuda */}
            {connectionStatus && !connectionStatus.ok && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs space-y-1.5">
                <div className="flex items-start gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{connectionStatus.error}</span>
                </div>
                {connectionStatus.corsHint && (
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 pl-6">
                    {connectionStatus.corsHint}
                  </p>
                )}
              </div>
            )}

            {connectionStatus?.ok && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {availableVoices.length} voz(es) e {availableModels.length} modelo(s) carregados com sucesso!
                </span>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={() => setShowHelpCmds((p) => !p)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Como iniciar o VoiceStudio no seu PC liberando este LMS</span>
                {showHelpCmds ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showHelpCmds && (
                <div className="mt-2 p-3.5 rounded-xl bg-slate-900 text-slate-100 text-[11px] space-y-3 border border-slate-700">
                  <div>
                    <div className="flex items-center justify-between text-emerald-300 font-bold mb-1">
                      <span>Passo 1 — Instalar VoiceStudio Desktop no Windows (1 vez):</span>
                      <div className="flex items-center gap-2">
                        <a
                          href="https://github.com/debpalash/VoiceStudio/releases/latest"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-300 hover:text-white underline inline-flex items-center gap-0.5"
                        >
                          <span>Baixar .exe</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyCmd('install', winInstallCommand)}
                          className="inline-flex items-center gap-1 text-indigo-300 hover:text-white cursor-pointer"
                        >
                          {copiedCmd === 'install' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCmd === 'install' ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                    <pre className="p-2 rounded-lg bg-slate-950 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
                      {winInstallCommand}
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-amber-300 font-bold mb-1">
                      <span>Passo 2 — Liberar CORS permanentemente (Windows PowerShell):</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCmd('cors', winCorsEnvCommand)}
                        className="inline-flex items-center gap-1 text-indigo-300 hover:text-white cursor-pointer"
                      >
                        {copiedCmd === 'cors' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCmd === 'cors' ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                    <pre className="p-2 rounded-lg bg-slate-950 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
                      {winCorsEnvCommand}
                    </pre>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Depois é só abrir o app <strong className="text-white">VoiceStudio</strong> no Menu Iniciar — não precisa rodar comandos <code className="text-indigo-300">uvicorn</code> na pasta do LMS.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-slate-400 font-bold mb-1">
                      <span>Alternativa (código-fonte — rodar DENTRO da pasta clonada do VoiceStudio após uv sync):</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCmd('sh', bashCommand)}
                        className="inline-flex items-center gap-1 text-indigo-300 hover:text-white cursor-pointer"
                      >
                        {copiedCmd === 'sh' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCmd === 'sh' ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                    <pre className="p-2 rounded-lg bg-slate-950 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap">
                      {bashCommand}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SEÇÃO 2: AJUSTES DE VOZ SOBRE TEXTO (VOICESTUDIO) */}
          <section className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                2. Ajustes da Voz sobre Texto (VoiceStudio)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Modelo / Engine */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Modelo / Engine TTS
                </label>
                <select
                  value={settings.model}
                  onChange={(e) => updateSettings({ model: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} {m.owned_by ? `(${m.owned_by})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voz / Perfil Clonado */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Voz / Perfil Clonado
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomVoiceMode((p) => !p)}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {customVoiceMode ? 'Escolher da lista' : 'Digitar ID/Nome'}
                  </button>
                </div>
                {customVoiceMode ? (
                  <input
                    type="text"
                    value={settings.voice}
                    onChange={(e) => updateSettings({ voice: e.target.value })}
                    placeholder="Ex: default, meu-perfil-clonado"
                    className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                  />
                ) : (
                  <select
                    value={
                      availableVoices.some((v) => v.voice_id === settings.voice)
                        ? settings.voice
                        : '__custom__'
                    }
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setCustomVoiceMode(true);
                      } else {
                        updateSettings({ voice: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                  >
                    {availableVoices.map((v) => (
                      <option key={v.voice_id} value={v.voice_id}>
                        {v.name} {v.type === 'profile' ? `[Perfil${v.language ? ` • ${v.language}` : ''}]` : ''}
                      </option>
                    ))}
                    {!availableVoices.some((v) => v.voice_id === settings.voice) && (
                      <option value="__custom__">Personalizada: {settings.voice}</option>
                    )}
                  </select>
                )}
              </div>

              {/* Idioma */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Idioma da Fala
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSettings({ language: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                >
                  <option value="pt">Português (pt)</option>
                  <option value="en">Inglês (en)</option>
                  <option value="es">Espanhol (es)</option>
                  <option value="auto">Automático (detectar)</option>
                </select>
              </div>

              {/* Formato de Áudio */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Formato de Áudio
                </label>
                <select
                  value={settings.responseFormat}
                  onChange={(e) =>
                    updateSettings({ responseFormat: e.target.value as VoiceStudioResponseFormat })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
                >
                  <option value="mp3">MP3 (Compatível e rápido)</option>
                  <option value="wav">WAV (Sem perdas)</option>
                  <option value="opus">Opus / OGG (Compacto)</option>
                </select>
              </div>
            </div>

            {/* Velocidade */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                <span>Velocidade de Leitura</span>
                <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 font-mono">
                  {settings.speed.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={settings.speed}
                onChange={(e) => updateSettings({ speed: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.50x (Mais devagar)</span>
                <span>1.00x (Normal)</span>
                <span>2.00x (Rápida)</span>
              </div>
            </div>

            {/* Instrução de Estilo / Emoção */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Instrução de Estilo / Entonação (<code className="text-[10px]">instruct</code>)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-1">
                {STYLE_INSTRUCT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => updateSettings({ instruct: preset.value })}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                      settings.instruct === preset.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-indigo-200 dark:border-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                {settings.instruct && (
                  <button
                    type="button"
                    onClick={() => updateSettings({ instruct: '' })}
                    className="px-2 py-1 rounded-full text-[10px] font-bold text-slate-500 hover:text-rose-600 cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <textarea
                rows={2}
                value={settings.instruct}
                onChange={(e) => updateSettings({ instruct: e.target.value })}
                placeholder="Ex: Fale com tom calmo, claro e didático como professor universitário..."
                className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Voice Design description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Descrição da Voz — Voice Design (opcional — <code className="text-[10px]">description</code>)
              </label>
              <input
                type="text"
                value={settings.voiceDescription}
                onChange={(e) => updateSettings({ voiceDescription: e.target.value })}
                placeholder="Ex: Male voice, warm baritone, calm and clear Brazilian Portuguese accent"
                className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>

            {/* Parâmetros avançados do VoiceStudio */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvancedParams((p) => !p)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:underline cursor-pointer"
              >
                <span>Parâmetros Avançados do Gerador (Denoise, Seed, Guidance, Steps)</span>
                {showAdvancedParams ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvancedParams && (
                <div className="mt-2.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.denoise}
                      onChange={(e) => updateSettings({ denoise: e.target.checked })}
                      className="accent-indigo-600"
                    />
                    <span>Denoise</span>
                  </label>

                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-slate-500 block">Seed (opcional)</label>
                    <input
                      type="number"
                      value={settings.seed ?? ''}
                      onChange={(e) =>
                        updateSettings({ seed: e.target.value === '' ? null : Number(e.target.value) })
                      }
                      placeholder="Aleatório"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-slate-500 block">Guidance Scale</label>
                    <input
                      type="number"
                      step="0.1"
                      value={settings.guidanceScale ?? ''}
                      onChange={(e) =>
                        updateSettings({
                          guidanceScale: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      placeholder="Padrão"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-slate-500 block">Num Steps</label>
                    <input
                      type="number"
                      min={1}
                      max={64}
                      value={settings.numStep ?? ''}
                      onChange={(e) =>
                        updateSettings({
                          numStep: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      placeholder="Padrão"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* SEÇÃO 3: FALLBACK / VOZ DO NAVEGADOR */}
          <section className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                3. Voz do Navegador (Fallback Automático / Celular)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-1 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                  Voz do Sistema / Navegador
                </label>
                <select
                  value={settings.browserVoiceURI}
                  onChange={(e) => updateSettings({ browserVoiceURI: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-500"
                >
                  <option value="">Melhor voz pt-BR automática</option>
                  {browserVoices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span>Tom (Pitch)</span>
                  <span className="font-mono">{settings.browserPitch.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  value={settings.browserPitch}
                  onChange={(e) => updateSettings({ browserPitch: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span>Volume</span>
                  <span className="font-mono">{Math.round(settings.browserVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={settings.browserVolume}
                  onChange={(e) => updateSettings({ browserVolume: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* SEÇÃO 4: PREFERÊNCIAS DE LEITURA */}
          <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
              4. Preferências de Leitura na Plataforma
            </h3>
            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.cleanMarkdownBeforeRead}
                onChange={(e) => updateSettings({ cleanMarkdownBeforeRead: e.target.checked })}
                className="accent-indigo-600"
              />
              <span>Limpar emojis decorativos, URLs e símbolos Markdown antes de ler o texto</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSelectionPopup}
                onChange={(e) => updateSettings({ enableSelectionPopup: e.target.checked })}
                className="accent-indigo-600"
              />
              <span>Exibir botão flutuante &ldquo;Ouvir seleção&rdquo; ao selecionar qualquer texto na tela</span>
            </label>
          </section>

          {/* SEÇÃO 5: TESTE AO VIVO */}
          <section className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white space-y-2.5">
            <label className="text-xs font-black uppercase tracking-wider text-indigo-200 block">
              5. Testar Voz sobre Texto Agora
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={testPhrase}
                onChange={(e) => setTestPhrase(e.target.value)}
                placeholder="Digite uma frase para testar a voz configurada..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-indigo-200/60 outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleLiveTest}
                className={`px-4 py-2 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                  isTestingVoiceNow
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                {isTestingVoiceNow && isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gerando...</span>
                  </>
                ) : isTestingVoiceNow ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Parar Teste</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Testar Voz Agora</span>
                  </>
                )}
              </button>
            </div>
          </section>
        </div>

        {/* RODAPÉ */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={resetSettings}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrões</span>
          </button>

          <button
            type="button"
            onClick={closeSettings}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Salvar & Fechar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
