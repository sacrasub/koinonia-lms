'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Box, MapPin, Target, Plus, Trash2, Image as ImageIcon,
  Check, Layers, BookOpen, Globe, Link as LinkIcon, AlertCircle,
  ExternalLink, Search, Info
} from 'lucide-react';
import { Cenario3D, Hotspot3D, Missao3D, TipoModelo3D } from '@/types';
import { NovoCenarioPayload, criarCenario3D, atualizarCenario3D } from '@/services/metaverso3dService';

interface Cenario3DFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cenarioParaEditar?: Cenario3D | null;
  onSuccess: (cenario: Cenario3D) => void;
}

const PRESET_COVERS = [
  { label: 'Tabernáculo / Deserto', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80' },
  { label: 'Templo / Jerusalém', url: 'https://images.unsplash.com/photo-1548625361-195feee10fce?w=800&auto=format&fit=crop&q=80' },
  { label: 'Século I / Monte das Oliveiras', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80' },
  { label: 'Catacumbas / Roma', url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80' },
  { label: 'Manuscritos / Papiro', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80' },
];

export const PRESET_3D_MODELS = [
  {
    label: '⛺ O Tabernáculo no Deserto',
    periodo: 'Antigo Testamento (Pentateuco)',
    disciplina: 'Introdução ao Antigo Testamento & Pentateuco',
    embedUrl: 'https://sketchfab.com/models/b0429bf4a905470788ee550f7ff3d47f/embed?autostart=1&ui_controls=1',
    capa: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    descricao: 'Reconstituição tridimensional detalhada do Tabernáculo de Moisés no Sinai, com o Pátio, Altar de Bronze, Pia de Cobre, Lugar Santo e Santo dos Santos.'
  },
  {
    label: '✨ A Arca da Aliança & Propiciatório',
    periodo: 'Antigo Testamento (Pentateuco)',
    disciplina: 'Introdução ao Antigo Testamento & Pentateuco',
    embedUrl: 'https://sketchfab.com/models/99a4192bc51f49e0839f99335efaa5be/embed?autostart=1&ui_controls=1',
    capa: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
    descricao: 'Modelo minucioso da Arca da Aliança revestida de ouro puro, com os Querubins da Glória e os elementos sagrados (Tábuas da Lei, Vara de Arão e Vaso de Maná).'
  },
  {
    label: '🏛️ O Templo de Salomão (Jerusalém)',
    periodo: 'Monarquia Unida de Israel (c. 960 a.C.)',
    disciplina: 'História de Israel e Monarquia',
    embedUrl: 'https://sketchfab.com/models/50c8227b60bb4a9f939460fe3bf63b36/embed?autostart=1&ui_controls=1',
    capa: 'https://images.unsplash.com/photo-1548625361-195feee10fce?w=800&auto=format&fit=crop&q=80',
    descricao: 'Reconstituição arquitetônica do Templo de Salomão no Monte Moriá, com as colunas Jaquim e Boaz, o Mar de Bronze e o Pórtico Dourado.'
  },
  {
    label: '🕯️ A Menorá Sagrada (Candelabro)',
    periodo: 'História de Israel & Segundo Templo',
    disciplina: 'Hermenêutica e Tipologia Bíblica',
    embedUrl: 'https://sketchfab.com/models/3ba418f4a132479e8a000676a0841bf0/embed?autostart=1&ui_controls=1',
    capa: 'https://images.unsplash.com/photo-1548625361-195feee10fce?w=800&auto=format&fit=crop&q=80',
    descricao: 'O candelabro de 7 braços lavrado em ouro maciço segundo as instruções reveladas no Sinai, símbolo perpétuo da luz e do Espírito de Deus.'
  },
  {
    label: '🏰 Fortaleza Antônia & Jerusalém Século I',
    periodo: 'Século I (Ministério de Jesus & Apóstolos)',
    disciplina: 'Teologia do Novo Testamento & Evangelhos',
    embedUrl: 'https://sketchfab.com/models/7ddcaebf7c00492cb470659eb858df34/embed?autostart=1&ui_controls=1',
    capa: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    descricao: 'A topografia e edifícios de Jerusalém nos dias do ministério terreno de Jesus, incluindo o Pretório, o Tanque de Betesda e o Monte do Templo.'
  },
  {
    label: '✝️ Catacumbas Paleocristãs de Roma',
    periodo: 'História da Igreja Primitiva (Século I a III)',
    disciplina: 'História da Igreja Cristã',
    embedUrl: 'https://sketchfab.com/models/e4c340df4ff94d4d8c8eaecbcece4d82/embed?autostart=1&ui_controls=1',
    capa: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
    descricao: 'Os corredores subterrâneos e criptas com os símbolos primitivos da fé (Icthis, Bom Pastor, Âncora) durante os períodos de perseguição imperial.'
  }
];

const PERIODOS_SUGERIDOS = [
  'Antigo Testamento (Pentateuco)',
  'Monarquia Unida de Israel (c. 960 a.C.)',
  'História de Israel & Segundo Templo',
  'Século I (Ministério de Jesus & Apóstolos)',
  'História da Igreja Primitiva (Século I a III)',
  'Geografia Bíblica & Arqueologia Sagrada'
];

/** Converte qualquer link colado do Sketchfab para o formato de embed interativo */
function formatarUrlSketchfab(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Se for código iframe <iframe src="...">
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/);
  if (iframeMatch && iframeMatch[1]) {
    return formatarUrlSketchfab(iframeMatch[1]);
  }

  // Se já for /embed
  if (trimmed.includes('/embed')) {
    if (!trimmed.includes('autostart=')) {
      return `${trimmed}${trimmed.includes('?') ? '&' : '?'}autostart=1&ui_controls=1`;
    }
    return trimmed;
  }

  // Se for URL normal https://sketchfab.com/3d-models/...-{id} ou https://sketchfab.com/models/{id}
  const idMatch = trimmed.match(/(?:models\/|3d-models\/.*-)?([a-f0-9]{32})/i);
  if (idMatch && idMatch[1]) {
    return `https://sketchfab.com/models/${idMatch[1]}/embed?autostart=1&ui_controls=1`;
  }

  return trimmed;
}

export const Cenario3DFormModal: React.FC<Cenario3DFormModalProps> = ({
  isOpen,
  onClose,
  cenarioParaEditar,
  onSuccess,
}) => {
  const isEditing = Boolean(cenarioParaEditar);

  const [titulo, setTitulo] = useState('');
  const [periodoHistorico, setPeriodoHistorico] = useState('Antigo Testamento (Pentateuco)');
  const [disciplinaName, setDisciplinaName] = useState('Introdução ao Antigo Testamento & Pentateuco');
  const [descricao, setDescricao] = useState('');
  const [imagemCapa, setImagemCapa] = useState(PRESET_COVERS[0].url);
  const [modeloTipo, setModeloTipo] = useState<TipoModelo3D>('webgl_nativo');
  const [modeloUrl, setModeloUrl] = useState('https://sketchfab.com/models/b0429bf4a905470788ee550f7ff3d47f/embed?autostart=1&ui_controls=1');

  // Hotspots e Missões
  const [hotspots, setHotspots] = useState<Hotspot3D[]>([]);
  const [missoes, setMissoes] = useState<Missao3D[]>([]);
  const [activeTabForm, setActiveTabForm] = useState<'geral' | 'hotspots' | 'missoes'>('geral');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (cenarioParaEditar) {
      setTitulo(cenarioParaEditar.titulo || '');
      setPeriodoHistorico(cenarioParaEditar.periodo_historico || 'Antigo Testamento (Pentateuco)');
      setDisciplinaName(cenarioParaEditar.disciplina_name || '');
      setDescricao(cenarioParaEditar.descricao || '');
      setImagemCapa(cenarioParaEditar.imagem_capa || PRESET_COVERS[0].url);
      setModeloTipo(cenarioParaEditar.modelo_tipo || 'webgl_nativo');
      setModeloUrl(cenarioParaEditar.modelo_url || '');
      setHotspots(cenarioParaEditar.hotspots || []);
      setMissoes(cenarioParaEditar.missoes || []);
    } else {
      // Valores padrão para novo cenário
      setTitulo('');
      setPeriodoHistorico('Antigo Testamento (Pentateuco)');
      setDisciplinaName('Introdução ao Antigo Testamento & Pentateuco');
      setDescricao('');
      setImagemCapa(PRESET_COVERS[0].url);
      setModeloTipo('webgl_nativo');
      setModeloUrl('https://sketchfab.com/models/b0429bf4a905470788ee550f7ff3d47f/embed?autostart=1&ui_controls=1');
      setHotspots([
        {
          id: 'hot-1',
          titulo: 'Ponto Central do Santuário',
          texto_biblico: 'Êxodo 25:8',
          nota_exegetica: 'E me farão um santuário, e habitarei no meio deles. Reconstituição arqueológica do espaço sagrado.',
          coordenadas_x: 50,
          coordenadas_y: 50,
        }
      ]);
      setMissoes([
        {
          id: 'mis-1',
          titulo: 'Explorar o Ponto Principal',
          pergunta_desafio: 'Localize o primeiro ponto de interesse e analise o texto bíblico fundacional.',
          hotspot_alvo_id: 'hot-1',
          recompensa_pontos: 50,
        }
      ]);
    }
    setActiveTabForm('geral');
    setErrorMsg(null);
  }, [cenarioParaEditar, isOpen]);

  if (!isOpen) return null;

  // Handlers para Hotspots
  const handleAddHotspot = () => {
    const newId = `hot-${Date.now()}`;
    setHotspots([
      ...hotspots,
      {
        id: newId,
        titulo: `Novo Hotspot ${hotspots.length + 1}`,
        texto_biblico: 'Referência Bíblica',
        nota_exegetica: 'Descrição exegética e significado arqueológico para os alunos...',
        coordenadas_x: Math.min(85, 20 + hotspots.length * 15),
        coordenadas_y: Math.min(85, 20 + hotspots.length * 12),
      }
    ]);
  };

  const handleUpdateHotspot = (index: number, field: keyof Hotspot3D, value: any) => {
    const updated = [...hotspots];
    updated[index] = { ...updated[index], [field]: value };
    setHotspots(updated);
  };

  const handleRemoveHotspot = (index: number) => {
    const removedId = hotspots[index]?.id;
    setHotspots(hotspots.filter((_, i) => i !== index));
    // Limpa referências em missões
    if (removedId) {
      setMissoes(missoes.map(m => m.hotspot_alvo_id === removedId ? { ...m, hotspot_alvo_id: '' } : m));
    }
  };

  // Handlers para Missões
  const handleAddMissao = () => {
    const newId = `mis-${Date.now()}`;
    setMissoes([
      ...missoes,
      {
        id: newId,
        titulo: `Missão ${missoes.length + 1}: Investigação`,
        pergunta_desafio: 'Descreva a tarefa ou pergunta que o aluno deve responder após investigar o modelo 3D.',
        hotspot_alvo_id: hotspots[0]?.id || '',
        recompensa_pontos: 40,
      }
    ]);
  };

  const handleUpdateMissao = (index: number, field: keyof Missao3D, value: any) => {
    const updated = [...missoes];
    updated[index] = { ...updated[index], [field]: value };
    setMissoes(updated);
  };

  const handleRemoveMissao = (index: number) => {
    setMissoes(missoes.filter((_, i) => i !== index));
  };

  // Salvar Cenário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setErrorMsg('Por favor, informe o título da exploração 3D.');
      setActiveTabForm('geral');
      return;
    }
    if (!modeloUrl.trim()) {
      setErrorMsg('Por favor, informe a URL do modelo 3D ou embed interativo.');
      setActiveTabForm('geral');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const payload: NovoCenarioPayload = {
      titulo: titulo.trim(),
      periodo_historico: periodoHistorico,
      disciplina_id: cenarioParaEditar?.disciplina_id || 'disc-custom',
      disciplina_name: disciplinaName.trim() || 'Teologia e Arqueologia',
      descricao: descricao.trim() || 'Exploração imersiva tridimensional de reconstituição bíblica e geográfica.',
      imagem_capa: imagemCapa.trim() || PRESET_COVERS[0].url,
      modelo_tipo: modeloTipo,
      modelo_url: modeloUrl.trim(),
      hotspots,
      missoes,
    };

    try {
      let resultado: Cenario3D;
      if (isEditing && cenarioParaEditar) {
        resultado = await atualizarCenario3D(cenarioParaEditar.id, payload);
      } else {
        resultado = await criarCenario3D(payload);
      }
      onSuccess(resultado);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao salvar cenário 3D.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-950 text-white w-full max-w-3xl rounded-3xl border border-cyan-500/40 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        
        {/* Header do Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-cyan-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500 text-slate-950">
                  {isEditing ? 'Edição Docente / Monitoria' : 'Nova Exploração 3D'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                {isEditing ? `Editar: ${cenarioParaEditar?.titulo}` : 'Criar Ambiente Imersivo 3D'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas do Formulário */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 gap-3">
          <button
            type="button"
            onClick={() => setActiveTabForm('geral')}
            className={`py-3 text-xs font-black flex items-center gap-2 border-b-2 transition ${
              activeTabForm === 'geral'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>1. Dados do Ambiente 3D</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabForm('hotspots')}
            className={`py-3 text-xs font-black flex items-center gap-2 border-b-2 transition ${
              activeTabForm === 'hotspots'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>2. Hotspots Exegéticos ({hotspots.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabForm('missoes')}
            className={`py-3 text-xs font-black flex items-center gap-2 border-b-2 transition ${
              activeTabForm === 'missoes'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>3. Missões Pedagógicas ({missoes.length})</span>
          </button>
        </div>

        {/* Mensagem de Erro se houver */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Corpo com Scroll */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
          
          {/* ================================================================ */}
          {/* ABA 1: DADOS GERAIS DO CENÁRIO                                   */}
          {/* ================================================================ */}
          {activeTabForm === 'geral' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Título da Exploração 3D *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: O Tabernáculo no Deserto, O Cenáculo em Jerusalém..."
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Período Histórico / Época Bíblica *
                  </label>
                  <select
                    value={periodoHistorico}
                    onChange={(e) => setPeriodoHistorico(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {PERIODOS_SUGERIDOS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Disciplina Associada
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: História de Israel, Pentateuco, Novo Testamento..."
                    value={disciplinaName}
                    onChange={(e) => setDisciplinaName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Descrição Pedagógica & Contexto Histórico
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva o que os alunos encontrarão nesta maquete 3D e qual a relevância para o estudo teológico..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* URL do Modelo 3D & Biblioteca de Presets */}
              <div className="p-4 bg-slate-900/80 border border-cyan-900/40 rounded-2xl space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-cyan-300 flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> Link do Modelo 3D / Embed Interativo (Sketchfab / WebGL) *
                  </span>
                  <div className="flex items-center gap-1.5">
                    <a
                      href="https://sketchfab.com/search?q=Tabern%C3%A1culo+no+Deserto&type=models"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/50 rounded-lg text-[10px] font-black flex items-center gap-1 transition shadow-xs cursor-pointer"
                      title="Abrir pesquisa de modelos do Tabernáculo e bíblicos no Sketchfab em nova aba"
                    >
                      <Search className="w-3 h-3 text-cyan-400" />
                      <span>Buscar no Sketchfab ↗</span>
                    </a>
                  </div>
                </div>

                {/* Modelos 3D Prontos para Carregamento Imediato */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Modelos Bíblicos 3D Prontos (Carregar com 1 clique):</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {PRESET_3D_MODELS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          setModeloUrl(p.embedUrl);
                          setImagemCapa(p.capa);
                          if (!titulo) setTitulo(p.label.replace(/^[^\s]+\s/, ''));
                          setPeriodoHistorico(p.periodo);
                          setDisciplinaName(p.disciplina);
                          if (!descricao) setDescricao(p.descricao);
                        }}
                        className={`p-2 rounded-xl text-left border transition text-[11px] font-bold truncate cursor-pointer ${
                          modeloUrl === p.embedUrl
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-xs'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                        title={`Carregar ${p.label}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">
                    URL do Modelo ou Código de Embed:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Cole qualquer link ou código embed do Sketchfab (ex: https://sketchfab.com/3d-models/... ou https://sketchfab.com/models/.../embed)"
                    value={modeloUrl}
                    onChange={(e) => setModeloUrl(formatarUrlSketchfab(e.target.value))}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="p-2.5 bg-cyan-950/40 border border-cyan-800/30 rounded-xl flex items-start gap-2 text-[11px] text-cyan-200 leading-relaxed">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Conversor Inteligente Ativo:</strong> Você pode colar qualquer link de página comum do Sketchfab, link de compartilhamento ou código <code>&lt;iframe&gt;</code>. O sistema converterá automaticamente para a maquete 3D interativa com suporte a rotação 360° e zoom.
                  </div>
                </div>
              </div>

              {/* Imagem de Capa */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Imagem de Capa (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imagemCapa}
                  onChange={(e) => setImagemCapa(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />

                {/* Sugestões de Capas */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">Sugestões:</span>
                  {PRESET_COVERS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImagemCapa(preset.url)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition shrink-0 cursor-pointer ${
                        imagemCapa === preset.url
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* ABA 2: HOTSPOTS EXEGÉTICOS INTERATIVOS                           */}
          {/* ================================================================ */}
          {activeTabForm === 'hotspots' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white">Pontos de Interesse Exegético (Hotspots)</h4>
                  <p className="text-xs text-slate-400">
                    Pins interativos no modelo 3D onde os alunos clicam para ler o contexto bíblico e arqueológico.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddHotspot}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Hotspot</span>
                </button>
              </div>

              {hotspots.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl space-y-2">
                  <MapPin className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">Nenhum hotspot adicionado ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hotspots.map((h, idx) => (
                    <div key={h.id || idx} className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          📍 Hotspot #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHotspot(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                          title="Remover Hotspot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Título do Ponto</label>
                          <input
                            type="text"
                            value={h.titulo}
                            onChange={(e) => handleUpdateHotspot(idx, 'titulo', e.target.value)}
                            placeholder="Ex: A Arca da Aliança"
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Referência Bíblica</label>
                          <input
                            type="text"
                            value={h.texto_biblico}
                            onChange={(e) => handleUpdateHotspot(idx, 'texto_biblico', e.target.value)}
                            placeholder="Ex: Êxodo 25:10-22; Hebreus 9:3"
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Nota Exegética & Arqueológica</label>
                        <textarea
                          rows={2}
                          value={h.nota_exegetica}
                          onChange={(e) => handleUpdateHotspot(idx, 'nota_exegetica', e.target.value)}
                          placeholder="Explicação teológica detalhada do elemento..."
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* ABA 3: MISSÕES PEDAGÓGICAS DE EXPLORAÇÃO                         */}
          {/* ================================================================ */}
          {activeTabForm === 'missoes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-white">Missões Pedagógicas & Gamificação</h4>
                  <p className="text-xs text-slate-400">
                    Desafios que guiam os alunos a explorar os santuários e responder perguntas exegéticas.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddMissao}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Missão</span>
                </button>
              </div>

              {missoes.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl space-y-2">
                  <Target className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">Nenhuma missão adicionada.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {missoes.map((m, idx) => (
                    <div key={m.id || idx} className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          🎯 Missão #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMissao(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                          title="Remover Missão"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Título da Missão</label>
                          <input
                            type="text"
                            value={m.titulo}
                            onChange={(e) => handleUpdateMissao(idx, 'titulo', e.target.value)}
                            placeholder="Ex: Explorar o Santo dos Santos"
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Pontos (Recompensa)</label>
                          <input
                            type="number"
                            value={m.recompensa_pontos || 50}
                            onChange={(e) => handleUpdateMissao(idx, 'recompensa_pontos', Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Pergunta-Desafio da Missão</label>
                        <textarea
                          rows={2}
                          value={m.pergunta_desafio}
                          onChange={(e) => handleUpdateMissao(idx, 'pergunta_desafio', e.target.value)}
                          placeholder="Ex: Localize a Arca e responda qual elemento repousava sobre ela..."
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                        />
                      </div>

                      {hotspots.length > 0 && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">Hotspot Alvo Vinculado</label>
                          <select
                            value={m.hotspot_alvo_id || ''}
                            onChange={(e) => handleUpdateMissao(idx, 'hotspot_alvo_id', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                          >
                            <option value="">Selecione um hotspot de destino...</option>
                            {hotspots.map((h) => (
                              <option key={h.id} value={h.id}>{h.titulo}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rodapé com Botões de Ação */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900 transition cursor-pointer"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              {activeTabForm !== 'geral' && (
                <button
                  type="button"
                  onClick={() => setActiveTabForm(activeTabForm === 'missoes' ? 'hotspots' : 'geral')}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                >
                  ← Voltar
                </button>
              )}

              {activeTabForm !== 'missoes' ? (
                <button
                  type="button"
                  onClick={() => setActiveTabForm(activeTabForm === 'geral' ? 'hotspots' : 'missoes')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-cyan-950 bg-cyan-400 hover:bg-cyan-300 transition cursor-pointer"
                >
                  Próximo Passo →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Salvando...' : isEditing ? 'Salvar Alterações no 3D' : 'Publicar Exploração 3D'}</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
