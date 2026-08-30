'use client';

import { useState, useEffect } from 'react';
import { AssessmentMode, AssessmentModeConfig, AlunoMatricula, HistoricoAssessmentMode, UserRole } from '@/types';

interface Props {
  userEmail: string;
  userName: string;
  userRole: UserRole;
}

const MODOS: AssessmentModeConfig[] = [
  {
    mode: 'SOFT_COMPENSATION',
    label: 'Trilha Flexível',
    subtitle: 'Compensação Ampla',
    description: 'Modelo padrão de entrada. Permite que notas mais altas em uma avaliação compensem notas mais baixas em outra, dentro de faixas amplas definidas pelo professor.',
    impact_trilha: 'Notas compensadas entre AV1 e AV2. Menor pressão individual por avaliação. Ideal para o primeiro semestre.',
    cor: 'from-emerald-900/30 to-slate-900',
    cor_badge: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700',
    requisitos: ['Nenhum pré-requisito', 'Disponível desde o início do semestre', 'Pode ser alterado até a semana 8'],
    recomendado_para: 'Ingressantes e alunos em adaptação à modalidade EaD',
    icone: '🌿',
  },
  {
    mode: 'RESTRICTIVE_COMPENSATION',
    label: 'Trilha Moderada',
    subtitle: 'Compensação Restritiva',
    description: 'Exige um patamar mínimo em cada avaliação antes que a compensação seja aplicada. Garante aprendizagem mais consistente ao longo de toda a trilha.',
    impact_trilha: 'Mínimo de 5.0 por avaliação. Compensação apenas até 2 pontos entre AV1 e AV2. Requer maior regularidade.',
    cor: 'from-amber-900/30 to-slate-900',
    cor_badge: 'bg-amber-900/50 text-amber-300 border border-amber-700',
    requisitos: ['Nota mínima de 5.0 em cada AV', 'Compensação limitada a ±2 pontos', 'Disponível a partir da semana 4'],
    recomendado_para: 'Alunos que buscam consistência e querem evitar dependências futuras',
    icone: '⚖️',
  },
  {
    mode: 'STRICT',
    label: 'Trilha Rigorosa',
    subtitle: 'Sem Compensação',
    description: 'Modo sem compensação entre avaliações. Cada prova e portfólio é avaliado de forma completamente independente. Desafia o domínio pleno de cada conteúdo.',
    impact_trilha: 'Cada avaliação independente. Sem compensação. Nota final = média aritmética pura. Exige excelência consistente.',
    cor: 'from-red-900/20 to-slate-900',
    cor_badge: 'bg-red-900/50 text-red-300 border border-red-700',
    requisitos: ['Alta autodisciplina exigida', 'Sem segunda chance por compensação', 'Indicado apenas para a partir da semana 2'],
    recomendado_para: 'Alunos com histórico sólido buscando máximo desafio acadêmico',
    icone: '⚡',
  },
];

export default function SeletorMetacognitivoAvaliacao({ userEmail, userName, userRole }: Props) {
  const [matricula, setMatricula] = useState<AlunoMatricula | null>(null);
  const [historico, setHistorico] = useState<HistoricoAssessmentMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [modoSelecionado, setModoSelecionado] = useState<AssessmentMode | null>(null);
  const [justificativa, setJustificativa] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [showHistorico, setShowHistorico] = useState(false);

  const isAdmin = ['admin', 'professor'].includes(userRole);

  useEffect(() => { carregarModo(); }, [userEmail]);

  async function carregarModo() {
    setLoading(true);
    try {
      const res = await fetch(`/api/assessment-mode?aluno_email=${encodeURIComponent(userEmail)}&semester=2026.2`);
      const data = await res.json();
      setMatricula(data.matricula || null);
      setHistorico(data.historico || []);
    } catch (err) {
      console.error('Erro ao carregar modo de avaliação:', err);
    } finally {
      setLoading(false);
    }
  }

  function iniciarMudanca(modo: AssessmentMode) {
    if (modo === matricula?.assessment_mode) return;
    setModoSelecionado(modo);
    setJustificativa('');
    setModalAberto(true);
  }

  async function confirmarMudanca() {
    if (!modoSelecionado || !justificativa.trim()) {
      setMensagem('❌ A justificativa é obrigatória para registrar a mudança.');
      return;
    }
    setSalvando(true);
    try {
      const res = await fetch('/api/assessment-mode', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aluno_email: userEmail,
          aluno_nome: userName,
          modo_novo: modoSelecionado,
          justificativa,
          semester: '2026.2',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMensagem(`✅ Modo alterado para "${MODOS.find((m) => m.mode === modoSelecionado)?.label}"!`);
      setModalAberto(false);
      carregarModo();
    } catch (err: any) {
      setMensagem(`❌ Erro: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  }

  const modoAtual = MODOS.find((m) => m.mode === matricula?.assessment_mode) || MODOS[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-slate-400">Carregando seu Modo de Avaliação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center text-3xl mx-auto mb-3">🧭</div>
        <h1 className="text-2xl font-bold text-white">Trilha de Avaliação</h1>
        <p className="text-slate-400 text-sm mt-1">Selecione o modo que melhor se adapta à sua jornada acadêmica</p>

        {/* Badge do modo atual */}
        {matricula && (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mt-4 text-sm font-semibold ${modoAtual.cor_badge}`}>
            <span className="text-lg">{modoAtual.icone}</span>
            Modo Atual: {modoAtual.label}
          </div>
        )}
      </div>

      {mensagem && (
        <div className={`mb-6 p-3 rounded-lg text-sm font-medium text-center ${mensagem.startsWith('✅') ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700' : 'bg-red-900/40 text-red-300 border border-red-700'}`}>
          {mensagem}
          <button onClick={() => setMensagem('')} className="ml-3 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Cards de modo — pricing plan style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {MODOS.map((modo) => {
          const isAtual = matricula?.assessment_mode === modo.mode;
          const isSelecionavel = userRole === 'aluno';

          return (
            <div
              key={modo.mode}
              className={`relative bg-gradient-to-b ${modo.cor} border rounded-2xl p-5 transition-all duration-300 ${
                isAtual
                  ? 'border-violet-500 shadow-lg shadow-violet-900/30 scale-[1.02]'
                  : isSelecionavel
                  ? 'border-slate-800 hover:border-slate-600 hover:scale-[1.01] cursor-pointer'
                  : 'border-slate-800 opacity-80'
              }`}
              onClick={() => isSelecionavel && !isAtual && iniciarMudanca(modo.mode)}
            >
              {/* Badge "Atual" */}
              {isAtual && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    ✦ SEU MODO ATUAL
                  </span>
                </div>
              )}

              <div className="text-4xl mb-3">{modo.icone}</div>
              <h3 className="text-xl font-bold text-white mb-0.5">{modo.label}</h3>
              <p className="text-sm text-slate-400 mb-3">{modo.subtitle}</p>

              <p className="text-slate-300 text-sm leading-relaxed mb-4">{modo.description}</p>

              {/* Impacto na trilha */}
              <div className="bg-black/20 rounded-xl p-3 mb-4 border border-white/5">
                <p className="text-xs text-violet-400 font-semibold uppercase tracking-wide mb-1">📊 Impacto na Trilha</p>
                <p className="text-slate-300 text-xs leading-relaxed">{modo.impact_trilha}</p>
              </div>

              {/* Requisitos */}
              <div className="space-y-1 mb-4">
                {modo.requisitos.map((req, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                    <span className="text-slate-600 mt-0.5">•</span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>

              {/* Recomendado para */}
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs text-slate-500">
                  <span className="text-slate-400 font-medium">Ideal para:</span> {modo.recomendado_para}
                </p>
              </div>

              {/* Botão de seleção */}
              {isSelecionavel && !isAtual && (
                <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-colors">
                  Escolher esta Trilha →
                </button>
              )}
              {isAtual && (
                <div className="mt-4 w-full py-2 bg-violet-600/30 border border-violet-600 text-violet-300 text-sm font-medium rounded-xl text-center">
                  ✦ Trilha Ativa
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Histórico de mudanças */}
      {historico.length > 0 && (
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => setShowHistorico(!showHistorico)}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-3"
          >
            <span>{showHistorico ? '▼' : '▶'}</span>
            Histórico de Alterações ({historico.length})
          </button>
          {showHistorico && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              {historico.map((h) => {
                const modoNovoCfg = MODOS.find((m) => m.mode === h.modo_novo);
                const modoAnteriorCfg = MODOS.find((m) => m.mode === h.modo_anterior);
                return (
                  <div key={h.id} className="border-b border-slate-800 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center gap-2 text-sm">
                      {modoAnteriorCfg && <span className={`px-2 py-0.5 rounded text-xs ${modoAnteriorCfg.cor_badge}`}>{modoAnteriorCfg.icone} {modoAnteriorCfg.label}</span>}
                      <span className="text-slate-600">→</span>
                      {modoNovoCfg && <span className={`px-2 py-0.5 rounded text-xs ${modoNovoCfg.cor_badge}`}>{modoNovoCfg.icone} {modoNovoCfg.label}</span>}
                      <span className="text-xs text-slate-500 ml-auto">{new Date(h.changed_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {h.justificativa && <p className="text-xs text-slate-400 mt-1 ml-1">"{h.justificativa}"</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Nota informativa para admin/professor */}
      {isAdmin && (
        <div className="max-w-xl mx-auto mt-6 bg-slate-900 border border-slate-700 rounded-xl p-4">
          <p className="text-sm text-slate-400">
            <span className="text-violet-400 font-semibold">👁️ Visão do Administrador:</span> Você está visualizando as configurações de avaliação do aluno <strong className="text-white">{userName}</strong>. Para modificar em nome de um aluno, use o painel de gestão acadêmica.
          </p>
        </div>
      )}

      {/* === MODAL DE CONFIRMAÇÃO === */}
      {modalAberto && modoSelecionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-violet-800/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">{MODOS.find((m) => m.mode === modoSelecionado)?.icone}</div>
              <h3 className="text-xl font-bold text-white">Confirmar Mudança de Trilha</h3>
              <p className="text-slate-400 text-sm mt-1">
                Você está mudando para a <span className="text-violet-400 font-semibold">{MODOS.find((m) => m.mode === modoSelecionado)?.label}</span>
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 mb-4">
              <p className="text-xs text-amber-400 font-semibold mb-1">⚠️ Impacto na sua trilha</p>
              <p className="text-slate-300 text-xs">{MODOS.find((m) => m.mode === modoSelecionado)?.impact_trilha}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Justificativa da Mudança <span className="text-red-400">*</span>
              </label>
              <textarea
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                rows={3}
                placeholder="Descreva o motivo desta mudança. Ex: Quero me desafiar mais academicamente neste semestre..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Esta justificativa ficará registrada no histórico acadêmico.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setModalAberto(false); setModoSelecionado(null); }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarMudanca}
                disabled={salvando || !justificativa.trim()}
                className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl text-sm transition-all"
              >
                {salvando ? '⏳ Salvando...' : '✅ Confirmar Mudança'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
