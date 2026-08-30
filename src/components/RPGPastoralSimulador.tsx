'use client';

import { useState, useEffect } from 'react';
import { RpgSessao, RpgPapel, RpgFichaAluno, UserRole } from '@/types';

interface Props {
  userEmail: string;
  userName: string;
  userRole: UserRole;
  disciplinaId?: string;
  disciplinaName?: string;
}

// Ícones e cores por tipo de stakeholder
const STAKEHOLDER_ICONS: Record<string, string> = {
  personagem: '🎭',
  facilitador: '🎤',
  observador: '👁️',
};

const STATUS_CONFIG = {
  rascunho: { label: 'Rascunho', cor: 'bg-slate-700 text-slate-300', icone: '📝' },
  ativa: { label: 'Ativa', cor: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700', icone: '🟢' },
  encerrada: { label: 'Encerrada', cor: 'bg-slate-700/50 text-slate-400', icone: '🏁' },
};

const NIVEL_AUTO_AVALIACAO = [
  { valor: 1, label: 'Muito Fraco' },
  { valor: 2, label: 'Fraco' },
  { valor: 3, label: 'Regular' },
  { valor: 4, label: 'Bom' },
  { valor: 5, label: 'Excelente' },
];

export default function RPGPastoralSimulador({ userEmail, userName, userRole, disciplinaId, disciplinaName }: Props) {
  const [sessoes, setSessoes] = useState<RpgSessao[]>([]);
  const [fichasAluno, setFichasAluno] = useState<RpgFichaAluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sessoes' | 'nova_sessao'>('sessoes');
  const [selectedSessao, setSelectedSessao] = useState<RpgSessao | null>(null);
  const [fichaModal, setFichaModal] = useState<RpgFichaAluno | null>(null);
  const [reflexaoTexto, setReflexaoTexto] = useState('');
  const [autoEmpatia, setAutoEmpatia] = useState(0);
  const [autoArgumentacao, setAutoArgumentacao] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const isPrivileged = ['professor', 'admin', 'monitor'].includes(userRole);

  // Formulário de nova sessão
  const [novaForm, setNovaForm] = useState({
    titulo: '',
    descricao_contexto: '',
    sala_meet_id: '',
    etiqueta_digital: 'Mantenha câmera aberta. Respeite o papel do colega. Fale em primeira pessoa.',
  });
  const [papeis, setPapeis] = useState<Partial<RpgPapel>[]>([
    { nome_papel: '', stakeholder_tipo: 'personagem', instrucoes_secretas: '', objetivos_conflito: '', atribuido_a_email: '' },
  ]);

  useEffect(() => {
    carregarSessoes();
    if (userRole === 'aluno') carregarFichasAluno();
  }, [disciplinaId, userRole]);

  async function carregarSessoes() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: userRole, user_email: userEmail });
      if (disciplinaId) params.set('disciplina_id', disciplinaId);
      const res = await fetch(`/api/rpg/sessoes?${params}`);
      const data = await res.json();
      setSessoes(data.sessoes || []);
    } catch (err) {
      console.error('Erro ao carregar sessões RPG:', err);
    } finally {
      setLoading(false);
    }
  }

  async function carregarFichasAluno() {
    try {
      const res = await fetch(`/api/rpg/fichas?aluno_email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      setFichasAluno(data.fichas || []);
    } catch (err) {
      console.error('Erro ao carregar fichas:', err);
    }
  }

  function getFichaDoAluno(sessaoId: string): RpgFichaAluno | undefined {
    return fichasAluno.find((f) => f.sessao_id === sessaoId);
  }

  function getPapelDoAluno(sessao: RpgSessao): RpgPapel | undefined {
    return sessao.papeis?.find((p) => p.atribuido_a_email === userEmail);
  }

  async function salvarReflexao() {
    if (!selectedSessao) return;
    setSalvando(true);
    try {
      const papel = getPapelDoAluno(selectedSessao);
      const res = await fetch('/api/rpg/fichas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessao_id: selectedSessao.id,
          papel_id: papel?.id,
          aluno_email: userEmail,
          aluno_nome: userName,
          reflexao_pos_simulacao: reflexaoTexto,
          auto_avaliacao_empatia: autoEmpatia || null,
          auto_avaliacao_argumentacao: autoArgumentacao || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMensagem('✅ Reflexão salva com sucesso!');
      setSelectedSessao(null);
      carregarFichasAluno();
    } catch (err: any) {
      setMensagem(`❌ Erro: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  }

  async function criarSessao() {
    setSalvando(true);
    try {
      const res = await fetch('/api/rpg/sessoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...novaForm,
          disciplina_id: disciplinaId || '',
          disciplina_name: disciplinaName || '',
          created_by_email: userEmail,
          created_by_name: userName,
          papeis: papeis.filter((p) => p.nome_papel && p.instrucoes_secretas && p.objetivos_conflito),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMensagem('✅ Sessão RPG criada com sucesso!');
      setActiveTab('sessoes');
      carregarSessoes();
    } catch (err: any) {
      setMensagem(`❌ Erro: ${err.message}`);
    } finally {
      setSalvando(false);
    }
  }

  function adicionarPapel() {
    setPapeis([...papeis, { nome_papel: '', stakeholder_tipo: 'personagem', instrucoes_secretas: '', objetivos_conflito: '', atribuido_a_email: '' }]);
  }

  function removerPapel(idx: number) {
    setPapeis(papeis.filter((_, i) => i !== idx));
  }

  function atualizarPapel(idx: number, campo: string, valor: string) {
    const atualizados = [...papeis];
    (atualizados[idx] as any)[campo] = valor;
    setPapeis(atualizados);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-slate-400">Carregando Simulações Pastorais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl">🎭</div>
          <div>
            <h1 className="text-2xl font-bold text-white">Simulador Pastoral RPG</h1>
            <p className="text-slate-400 text-sm">Cenários de simulação pastoral para aprendizagem ativa</p>
          </div>
        </div>

        {/* Tabs — apenas professor/admin vê "Nova Sessão" */}
        <div className="flex gap-2 mt-4 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('sessoes')}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'sessoes' ? 'bg-amber-500/20 text-amber-400 border-b-2 border-amber-500' : 'text-slate-400 hover:text-white'}`}
          >
            📋 Sessões Ativas
          </button>
          {isPrivileged && (
            <button
              onClick={() => setActiveTab('nova_sessao')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'nova_sessao' ? 'bg-amber-500/20 text-amber-400 border-b-2 border-amber-500' : 'text-slate-400 hover:text-white'}`}
            >
              ✨ Nova Sessão
            </button>
          )}
        </div>
      </div>

      {/* Mensagem de feedback */}
      {mensagem && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${mensagem.startsWith('✅') ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700' : 'bg-red-900/40 text-red-300 border border-red-700'}`}>
          {mensagem}
          <button onClick={() => setMensagem('')} className="ml-3 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* === ABA: SESSÕES ATIVAS === */}
      {activeTab === 'sessoes' && (
        <div className="space-y-4">
          {sessoes.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <div className="text-6xl mb-4">🎭</div>
              <p className="text-lg font-medium text-slate-400">Nenhuma sessão de simulação ativa</p>
              {isPrivileged && (
                <button onClick={() => setActiveTab('nova_sessao')} className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm transition-colors">
                  Criar Primeira Sessão
                </button>
              )}
            </div>
          ) : (
            sessoes.map((sessao) => {
              const papelAluno = getPapelDoAluno(sessao);
              const ficha = getFichaDoAluno(sessao.id);
              const statusCfg = STATUS_CONFIG[sessao.status] || STATUS_CONFIG.ativa;

              return (
                <div key={sessao.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  {/* Cabeçalho da sessão */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.cor}`}>
                            {statusCfg.icone} {statusCfg.label}
                          </span>
                          <span className="text-xs text-slate-500">{sessao.disciplina_name}</span>
                        </div>
                        <h2 className="text-lg font-bold text-white">{sessao.titulo}</h2>
                      </div>
                    </div>

                    {/* Contexto do Cenário */}
                    <div className="bg-slate-800/60 rounded-xl p-4 mb-4 border border-slate-700">
                      <p className="text-xs text-amber-400 font-semibold uppercase tracking-wide mb-2">📜 Contexto do Cenário</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{sessao.descricao_contexto}</p>
                    </div>

                    {/* Etiqueta Digital */}
                    {sessao.etiqueta_digital && (
                      <div className="flex items-start gap-2 bg-blue-950/30 border border-blue-800/30 rounded-lg p-3 mb-4">
                        <span className="text-blue-400 text-sm">📌</span>
                        <p className="text-blue-300 text-xs">{sessao.etiqueta_digital}</p>
                      </div>
                    )}

                    {/* Lista de papéis públicos */}
                    {sessao.papeis && sessao.papeis.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Participantes</p>
                        <div className="flex flex-wrap gap-2">
                          {sessao.papeis.map((papel) => (
                            <div key={papel.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${papel.atribuido_a_email === userEmail ? 'bg-amber-900/40 border-amber-700 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                              <span>{STAKEHOLDER_ICONS[papel.stakeholder_tipo] || '🎭'}</span>
                              <span>{papel.nome_papel}</span>
                              {papel.atribuido_a_nome && <span className="text-slate-500">— {papel.atribuido_a_nome}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ficha Privada do Aluno — DESTAQUE */}
                    {papelAluno && userRole === 'aluno' && (
                      <div className="bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-700 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{STAKEHOLDER_ICONS[papelAluno.stakeholder_tipo] || '🎭'}</span>
                          <div>
                            <p className="text-xs text-amber-400 font-semibold uppercase tracking-wide">🔐 Sua Identidade Secreta</p>
                            <p className="text-lg font-bold text-amber-300">{papelAluno.nome_papel}</p>
                          </div>
                        </div>
                        {papelAluno.descricao_publica && (
                          <p className="text-slate-300 text-sm mb-3">{papelAluno.descricao_publica}</p>
                        )}
                        <div className="space-y-3">
                          <div className="bg-slate-900/60 rounded-lg p-3 border border-amber-800/30">
                            <p className="text-xs text-red-400 font-semibold mb-1">🎯 Objetivos e Conflitos do Cenário</p>
                            <p className="text-slate-300 text-sm leading-relaxed">{papelAluno.objetivos_conflito}</p>
                          </div>
                          {papelAluno.dicas_de_postura && (
                            <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700">
                              <p className="text-xs text-blue-400 font-semibold mb-1">💡 Dicas de Postura</p>
                              <p className="text-slate-300 text-sm leading-relaxed">{papelAluno.dicas_de_postura}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status da reflexão do aluno */}
                    {userRole === 'aluno' && (
                      <div className="flex items-center justify-between">
                        {ficha?.reflexao_pos_simulacao ? (
                          <div className="flex items-center gap-2 text-emerald-400 text-sm">
                            <span>✅</span>
                            <span>Reflexão enviada</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setSelectedSessao(sessao); setReflexaoTexto(''); setAutoEmpatia(0); setAutoArgumentacao(0); }}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-amber-900/30"
                          >
                            ✍️ Registrar Reflexão Pós-Jogo
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* === ABA: NOVA SESSÃO (professor/admin) === */}
      {activeTab === 'nova_sessao' && isPrivileged && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-xl font-bold text-amber-400">✨ Criar Nova Sessão de Simulação</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Título do Cenário*</label>
              <input
                value={novaForm.titulo}
                onChange={(e) => setNovaForm({ ...novaForm, titulo: e.target.value })}
                placeholder="Ex: Conflito Ético na Liderança Pastoral"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Contexto e Narrativa do Cenário*</label>
              <textarea
                value={novaForm.descricao_contexto}
                onChange={(e) => setNovaForm({ ...novaForm, descricao_contexto: e.target.value })}
                rows={4}
                placeholder="Descreva o contexto pastoral, o dilema ético ou a situação de aconselhamento que será simulado..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">ID da Sala Google Meet (opcional)</label>
              <input
                value={novaForm.sala_meet_id}
                onChange={(e) => setNovaForm({ ...novaForm, sala_meet_id: e.target.value })}
                placeholder="Ex: abc-defg-hij"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Etiqueta Digital (instrução para participantes)</label>
              <textarea
                value={novaForm.etiqueta_digital}
                onChange={(e) => setNovaForm({ ...novaForm, etiqueta_digital: e.target.value })}
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Papéis/Stakeholders */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-300">🎭 Papéis e Stakeholders</label>
                <button onClick={adicionarPapel} className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors">
                  + Adicionar Papel
                </button>
              </div>

              <div className="space-y-4">
                {papeis.map((papel, idx) => (
                  <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-amber-400 font-semibold">Papel #{idx + 1}</span>
                      {papeis.length > 1 && (
                        <button onClick={() => removerPapel(idx)} className="text-xs text-red-400 hover:text-red-300">✕ Remover</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Nome do Papel*</label>
                        <input
                          value={papel.nome_papel || ''}
                          onChange={(e) => atualizarPapel(idx, 'nome_papel', e.target.value)}
                          placeholder="Ex: Pastor Conservador"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Tipo</label>
                        <select
                          value={papel.stakeholder_tipo || 'personagem'}
                          onChange={(e) => atualizarPapel(idx, 'stakeholder_tipo', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                        >
                          <option value="personagem">🎭 Personagem</option>
                          <option value="facilitador">🎤 Facilitador</option>
                          <option value="observador">👁️ Observador</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">🔐 Instruções Secretas* (só o aluno designado vê)</label>
                      <textarea
                        value={papel.instrucoes_secretas || ''}
                        onChange={(e) => atualizarPapel(idx, 'instrucoes_secretas', e.target.value)}
                        rows={3}
                        placeholder="Descreva a identidade, crenças, posição e objetivos secretos deste papel..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">🎯 Objetivos e Conflito*</label>
                      <textarea
                        value={papel.objetivos_conflito || ''}
                        onChange={(e) => atualizarPapel(idx, 'objetivos_conflito', e.target.value)}
                        rows={2}
                        placeholder="O que este personagem quer alcançar? Quais são seus pontos de conflito?"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">E-mail do Aluno Designado</label>
                      <input
                        value={papel.atribuido_a_email || ''}
                        onChange={(e) => atualizarPapel(idx, 'atribuido_a_email', e.target.value)}
                        placeholder="aluno@email.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={criarSessao}
              disabled={salvando || !novaForm.titulo || !novaForm.descricao_contexto}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl transition-all"
            >
              {salvando ? '⏳ Criando...' : '🎭 Criar Sessão de Simulação'}
            </button>
          </div>
        </div>
      )}

      {/* === MODAL: Reflexão Pós-Jogo === */}
      {selectedSessao && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-amber-800/40 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✍️</span>
              <div>
                <h3 className="font-bold text-white">Reflexão Pós-Simulação</h3>
                <p className="text-sm text-slate-400">{selectedSessao.titulo}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Sua Reflexão Pastoral</label>
                <textarea
                  value={reflexaoTexto}
                  onChange={(e) => setReflexaoTexto(e.target.value)}
                  rows={5}
                  placeholder="Descreva o que aprendeu sobre o cenário, o que sentiu ao assumir o papel, como isso se relaciona com sua formação teológica..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none text-sm"
                />
              </div>

              {/* Auto-avaliação */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Empatia demonstrada</label>
                  <div className="flex gap-1">
                    {NIVEL_AUTO_AVALIACAO.map((n) => (
                      <button
                        key={n.valor}
                        onClick={() => setAutoEmpatia(n.valor)}
                        title={n.label}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${autoEmpatia >= n.valor ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                      >
                        {n.valor}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Qualidade argumentativa</label>
                  <div className="flex gap-1">
                    {NIVEL_AUTO_AVALIACAO.map((n) => (
                      <button
                        key={n.valor}
                        onClick={() => setAutoArgumentacao(n.valor)}
                        title={n.label}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${autoArgumentacao >= n.valor ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                      >
                        {n.valor}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setSelectedSessao(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvarReflexao}
                disabled={salvando || !reflexaoTexto}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl text-sm transition-all"
              >
                {salvando ? '⏳ Salvando...' : '✅ Enviar Reflexão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
