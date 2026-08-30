'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Flame, RotateCcw, Zap, CheckCircle2, BookOpen, PlusCircle,
  ChevronRight, ChevronLeft, Save, Loader2, Trash2, Edit3,
  Download, Eye, EyeOff, Users, BarChart3, Lock, CheckSquare,
  Sparkles, GraduationCap, ArrowRight, Trophy, AlertCircle,
  RefreshCw
} from 'lucide-react';
import {
  QuatrodsTrilha,
  QuatrodsResposta,
  QuatrodsEstagio,
  QuatrodsProgressoAluno,
  UserRole,
} from '@/types';
import {
  getTrilhas,
  getTrilhasDoProfessor,
  criarTrilha,
  atualizarTrilha,
  arquivarTrilha,
  getRespostasDoAluno,
  salvarResposta,
  getProgressoDaTrilha,
  getEstagioAtivo,
  isEstagioDesbloqueado,
  isTrilhaConcluida,
  exportarRespostasCsv,
  ESTAGIO_CONFIG,
  ESTAGIOS_ORDENADOS,
  PLACEHOLDERS_PROFESSOR,
} from '@/services/quatrodsDsService';

// ============================================================================
// HELPERS
// ============================================================================

const ICONE_ESTAGIO: Record<QuatrodsEstagio, React.ElementType> = {
  d1_desejo: Flame,
  d2_desestruturacao: RotateCcw,
  d3_desafio: Zap,
  d4_decisao: CheckCircle2,
};

// ============================================================================
// SUB-COMPONENTE: BARRA DE PROGRESSO DOS 4 ESTÁGIOS
// ============================================================================

function BarraProgressoDs({
  respostas,
  estagioAtivo,
}: {
  respostas: QuatrodsResposta[];
  estagioAtivo: QuatrodsEstagio;
}) {
  const completados = new Set(respostas.filter((r) => r.completado).map((r) => r.estagio));
  const isConcluida = isTrilhaConcluida(respostas);

  return (
    <div className="flex items-center gap-1">
      {ESTAGIOS_ORDENADOS.map((estagio, idx) => {
        const config = ESTAGIO_CONFIG[estagio];
        const concluido = completados.has(estagio);
        const ativo = estagio === estagioAtivo && !isConcluida;
        const Icon = ICONE_ESTAGIO[estagio];

        return (
          <React.Fragment key={estagio}>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
                concluido
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : ativo
                  ? `${config.badge} border shadow-sm`
                  : 'bg-gray-100 text-gray-400 border-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">D{idx + 1}</span>
              {concluido && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              {!concluido && !ativo && <Lock className="w-3 h-3" />}
            </div>
            {idx < 3 && (
              <ArrowRight className={`w-3 h-3 flex-shrink-0 ${concluido ? 'text-emerald-400' : 'text-gray-300'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTE: CARD DE TRILHA (VISÃO ALUNO — LISTA)
// ============================================================================

function CardTrilhaAluno({
  trilha,
  respostas,
  onSelecionar,
}: {
  trilha: QuatrodsTrilha;
  respostas: QuatrodsResposta[];
  onSelecionar: () => void;
}) {
  const concluida = isTrilhaConcluida(respostas);
  const estagioAtivo = getEstagioAtivo(respostas);
  const completados = respostas.filter((r) => r.completado).length;

  return (
    <button
      onClick={onSelecionar}
      className="w-full text-left rounded-2xl border border-gray-200 bg-white hover:border-orange-300 hover:shadow-md transition-all duration-200 overflow-hidden group"
    >
      {/* Header colorido */}
      <div className={`p-4 ${concluida ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-orange-600 to-amber-600'}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                {trilha.disciplina_name || 'Disciplina'} {trilha.aula_referencia ? `· ${trilha.aula_referencia}` : ''}
              </span>
            </div>
            <h3 className="text-sm font-black text-white leading-snug">{trilha.titulo}</h3>
          </div>
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            {concluida ? (
              <Trophy className="w-5 h-5 text-yellow-300" />
            ) : (
              <span className="text-lg font-black text-white">{completados}/4</span>
            )}
          </div>
        </div>
      </div>

      {/* Corpo */}
      <div className="p-4 space-y-3">
        {trilha.descricao && (
          <p className="text-xs text-gray-600 line-clamp-2 italic">"{trilha.descricao}"</p>
        )}
        <BarraProgressoDs respostas={respostas} estagioAtivo={estagioAtivo} />
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold ${concluida ? 'text-emerald-600' : 'text-orange-600'}`}>
            {concluida ? '🏆 Trilha Concluída!' : `Próximo: ${ESTAGIO_CONFIG[estagioAtivo].emoji} ${ESTAGIO_CONFIG[estagioAtivo].label}`}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// SUB-COMPONENTE: PLAYER DA TRILHA (MODO ALUNO — ESTÁGIOS SEQUENCIAIS)
// ============================================================================

function PlayerTrilha({
  trilha,
  alunoEmail,
  alunoNome,
  onVoltar,
}: {
  trilha: QuatrodsTrilha;
  alunoEmail: string;
  alunoNome: string;
  onVoltar: () => void;
}) {
  const [respostas, setRespostas] = useState<QuatrodsResposta[]>([]);
  const [estagioAtivo, setEstagioAtivo] = useState<QuatrodsEstagio>('d1_desejo');
  const [texto, setTexto] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    getRespostasDoAluno(trilha.id, alunoEmail).then((r) => {
      setRespostas(r);
      const ativo = getEstagioAtivo(r);
      setEstagioAtivo(ativo);
      // Pre-preenche com resposta salva se existir
      const existente = r.find((resp) => resp.estagio === ativo);
      setTexto(existente?.conteudo || '');
      setLoading(false);
    });
  }, [trilha.id, alunoEmail]);

  const trocarEstagio = (novoEstagio: QuatrodsEstagio) => {
    if (!isEstagioDesbloqueado(novoEstagio, respostas)) return;
    setEstagioAtivo(novoEstagio);
    const existente = respostas.find((r) => r.estagio === novoEstagio);
    setTexto(existente?.conteudo || '');
  };

  const handleSalvar = async (avancar = false) => {
    if (!texto.trim() || texto.trim().length < 10) {
      showToast('Por favor, escreva uma resposta mais completa (mínimo 10 caracteres).');
      return;
    }
    setSalvando(true);
    try {
      await salvarResposta(trilha.id, alunoEmail, alunoNome, estagioAtivo, texto.trim());
      // Atualiza respostas locais
      const atualizadas = [
        ...respostas.filter((r) => r.estagio !== estagioAtivo),
        {
          id: crypto.randomUUID(),
          trilha_id: trilha.id,
          aluno_email: alunoEmail,
          aluno_nome: alunoNome,
          estagio: estagioAtivo,
          conteudo: texto.trim(),
          completado: true,
          created_at: new Date().toISOString(),
        },
      ];
      setRespostas(atualizadas);

      if (avancar) {
        const idx = ESTAGIOS_ORDENADOS.indexOf(estagioAtivo);
        if (idx < 3) {
          const proximo = ESTAGIOS_ORDENADOS[idx + 1];
          setEstagioAtivo(proximo);
          setTexto('');
          showToast(`${ESTAGIO_CONFIG[proximo].emoji} Avançando para: ${ESTAGIO_CONFIG[proximo].label}!`);
        } else {
          showToast('🏆 Parabéns! Você completou os Quatro Ds desta trilha!');
        }
      } else {
        showToast('💾 Resposta salva com sucesso!');
      }
    } catch {
      showToast('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const concluida = isTrilhaConcluida(respostas);
  const config = ESTAGIO_CONFIG[estagioAtivo];
  const Icon = ICONE_ESTAGIO[estagioAtivo];
  const idxAtivo = ESTAGIOS_ORDENADOS.indexOf(estagioAtivo);

  // Conteúdo de cada estágio baseado na trilha
  const CONTEUDO_ESTAGIO: Record<QuatrodsEstagio, { titulo: string; conteudo: string }> = {
    d1_desejo: { titulo: trilha.d1_titulo, conteudo: trilha.d1_conteudo },
    d2_desestruturacao: { titulo: trilha.d2_titulo, conteudo: trilha.d2_conteudo },
    d3_desafio: { titulo: trilha.d3_titulo, conteudo: trilha.d3_conteudo },
    d4_decisao: { titulo: trilha.d4_titulo, conteudo: trilha.d4_conteudo },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm text-gray-500 mt-3">Carregando sua trilha...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-2 duration-300 max-w-sm">
          {toast}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <button
            onClick={onVoltar}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Todas as trilhas
          </button>
          <h2 className="text-lg font-black text-gray-900">{trilha.titulo}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {trilha.disciplina_name} {trilha.aula_referencia ? `· ${trilha.aula_referencia}` : ''}
          </p>
        </div>
        {concluida && (
          <div className="flex-shrink-0 flex items-center gap-1.5 bg-yellow-100 border border-yellow-200 text-yellow-800 px-3 py-1.5 rounded-xl">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-bold">Concluída!</span>
          </div>
        )}
      </div>

      {/* Navegação dos estágios */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {ESTAGIOS_ORDENADOS.map((estagio, idx) => {
          const cfg = ESTAGIO_CONFIG[estagio];
          const desbloqueado = isEstagioDesbloqueado(estagio, respostas);
          const concl = respostas.some((r) => r.estagio === estagio && r.completado);
          const ativo = estagio === estagioAtivo;
          const EIcon = ICONE_ESTAGIO[estagio];

          return (
            <button
              key={estagio}
              onClick={() => trocarEstagio(estagio)}
              disabled={!desbloqueado}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                ativo
                  ? `${cfg.badge} shadow-sm scale-105`
                  : concl
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : desbloqueado
                  ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <EIcon className="w-3.5 h-3.5" />
              <span>D{idx + 1} {cfg.label}</span>
              {concl && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
              {!desbloqueado && <Lock className="w-3 h-3" />}
            </button>
          );
        })}
      </div>

      {/* Painel do Estágio Ativo */}
      <div className={`rounded-3xl border ${config.border} ${config.bg} overflow-hidden`}>
        {/* Header do estágio */}
        <div className="p-5 border-b border-current/10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-2xl`}>
              {config.emoji}
            </div>
            <div>
              <div className={`text-[10px] font-extrabold uppercase tracking-wider ${config.cor} mb-0.5`}>
                D{idxAtivo + 1} de 4 · {config.label}
              </div>
              <h3 className="text-base font-black text-gray-900">
                {CONTEUDO_ESTAGIO[estagioAtivo].titulo}
              </h3>
            </div>
          </div>
        </div>

        {/* Conteúdo do estágio */}
        <div className="p-5 space-y-4">
          <div className="rounded-2xl bg-white border border-white/80 shadow-sm p-4">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {CONTEUDO_ESTAGIO[estagioAtivo].conteudo}
            </p>
          </div>

          {/* Resposta do aluno */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              📝 Sua resposta ao {config.emoji} {config.label}:
            </label>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={`Escreva aqui sua resposta reflexiva para o estágio ${config.label}...\n\nSeja autêntico — não há resposta certa ou errada. O que importa é a sua reflexão genuína.`}
              className="w-full text-sm border border-gray-200 rounded-2xl p-4 resize-none h-32 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white transition-all"
            />
            <p className="text-[10px] text-gray-400 mt-1 text-right">{texto.length} caracteres</p>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleSalvar(false)}
              disabled={salvando || !texto.trim()}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-bold py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Rascunho
            </button>
            <button
              onClick={() => handleSalvar(true)}
              disabled={salvando || !texto.trim()}
              className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-3 px-4 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                idxAtivo === 3
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {salvando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : idxAtivo === 3 ? (
                <><Trophy className="w-4 h-4" /> Concluir Trilha!</>
              ) : (
                <><ChevronRight className="w-4 h-4" /> Salvar e Avançar para D{idxAtivo + 2}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Referência Teórica */}
      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <span className="font-bold text-gray-600">Fundamentação Pedagógica:</span>{' '}
          Este ciclo socrático reproduz o método de ensino de Jesus: <em>Indagação (Desejo) → Paradoxo (Desestruturação) → Praxis (Desafio) → Comprometimento (Decisão)</em>.
          Base teórica: Andragogia (Knowles, 1980) · Pedagogia do Oprimido (Freire, 1970) · Inov-Ativa (Moran, 2018).
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTE: FORMULÁRIO DE CRIAÇÃO/EDIÇÃO DE TRILHA (PROFESSOR)
// ============================================================================

const TRILHA_VAZIA = {
  disciplina_id: '',
  disciplina_name: '',
  titulo: '',
  descricao: '',
  aula_referencia: '',
  publicado: true,
  d1_titulo: '',
  d1_conteudo: '',
  d2_titulo: '',
  d2_conteudo: '',
  d3_titulo: '',
  d3_conteudo: '',
  d4_titulo: '',
  d4_conteudo: '',
};

function FormularioTrilha({
  professorEmail,
  trilhaParaEditar,
  onSalvo,
  onCancelar,
}: {
  professorEmail: string;
  trilhaParaEditar: QuatrodsTrilha | null;
  onSalvo: () => void;
  onCancelar: () => void;
}) {
  const [form, setForm] = useState<typeof TRILHA_VAZIA>(() =>
    trilhaParaEditar
      ? {
          disciplina_id: trilhaParaEditar.disciplina_id,
          disciplina_name: trilhaParaEditar.disciplina_name || '',
          titulo: trilhaParaEditar.titulo,
          descricao: trilhaParaEditar.descricao || '',
          aula_referencia: trilhaParaEditar.aula_referencia || '',
          publicado: trilhaParaEditar.publicado,
          d1_titulo: trilhaParaEditar.d1_titulo,
          d1_conteudo: trilhaParaEditar.d1_conteudo,
          d2_titulo: trilhaParaEditar.d2_titulo,
          d2_conteudo: trilhaParaEditar.d2_conteudo,
          d3_titulo: trilhaParaEditar.d3_titulo,
          d3_conteudo: trilhaParaEditar.d3_conteudo,
          d4_titulo: trilhaParaEditar.d4_titulo,
          d4_conteudo: trilhaParaEditar.d4_conteudo,
        }
      : TRILHA_VAZIA,
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const campo = (key: keyof typeof TRILHA_VAZIA) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.d1_conteudo.trim() || !form.d2_conteudo.trim() || !form.d3_conteudo.trim() || !form.d4_conteudo.trim()) {
      setErro('Preencha o título e os conteúdos dos 4 estágios.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const payload = {
        ...form,
        professor_email: professorEmail,
        d1_titulo: form.d1_titulo || PLACEHOLDERS_PROFESSOR.d1_desejo.titulo,
        d2_titulo: form.d2_titulo || PLACEHOLDERS_PROFESSOR.d2_desestruturacao.titulo,
        d3_titulo: form.d3_titulo || PLACEHOLDERS_PROFESSOR.d3_desafio.titulo,
        d4_titulo: form.d4_titulo || PLACEHOLDERS_PROFESSOR.d4_decisao.titulo,
      };
      if (trilhaParaEditar) {
        await atualizarTrilha(trilhaParaEditar.id, payload);
      } else {
        await criarTrilha(payload);
      }
      onSalvo();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar trilha.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-gray-900">
            {trilhaParaEditar ? '✏️ Editar Trilha' : '🔥 Nova Trilha dos Quatro Ds'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Personalize as 4 perguntas socráticas para sua turma</p>
        </div>
        <button type="button" onClick={onCancelar} className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors">
          Cancelar
        </button>
      </div>

      {erro && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {erro}
        </div>
      )}

      {/* Dados gerais */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
        <p className="text-xs font-bold text-gray-700">📚 Informações da Trilha</p>
        <input
          type="text"
          value={form.titulo}
          onChange={campo('titulo')}
          placeholder="Título da trilha (ex: A Pesca Milagrosa — Hermenêutica Narrativa)"
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
          required
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={form.disciplina_name}
            onChange={campo('disciplina_name')}
            placeholder="Disciplina (ex: Hermenêutica)"
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <input
            type="text"
            value={form.aula_referencia}
            onChange={campo('aula_referencia')}
            placeholder="Referência (ex: Aula 3)"
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <textarea
          value={form.descricao}
          onChange={campo('descricao')}
          placeholder="Contexto geral da trilha (opcional) — aparece na listagem para os alunos"
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none h-16 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {/* Estágios D1-D4 */}
      {ESTAGIOS_ORDENADOS.map((estagio, idx) => {
        const config = ESTAGIO_CONFIG[estagio];
        const ph = PLACEHOLDERS_PROFESSOR[estagio];
        const tituloKey = `d${idx + 1}_titulo` as keyof typeof TRILHA_VAZIA;
        const conteudoKey = `d${idx + 1}_conteudo` as keyof typeof TRILHA_VAZIA;

        return (
          <div key={estagio} className={`rounded-2xl border ${config.border} ${config.bg} p-4 space-y-3`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{config.emoji}</span>
              <div>
                <p className={`text-xs font-extrabold ${config.cor}`}>D{idx + 1} — {config.label}</p>
                <p className="text-[10px] text-gray-500">{
                  estagio === 'd1_desejo' ? 'Pergunta provocadora que desperta a curiosidade e a motivação' :
                  estagio === 'd2_desestruturacao' ? 'Paradoxo ou dilema que abala a resposta fácil' :
                  estagio === 'd3_desafio' ? 'Tarefa prática ou reflexão aplicada (mín. 3 parágrafos)' :
                  'Comprometimento pessoal/vocacional com o aprendizado'
                }</p>
              </div>
            </div>
            <input
              type="text"
              value={form[tituloKey] as string}
              onChange={campo(tituloKey)}
              placeholder={ph.titulo}
              className="w-full text-sm border border-white bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <textarea
              value={form[conteudoKey] as string}
              onChange={campo(conteudoKey)}
              placeholder={ph.conteudo}
              className="w-full text-sm border border-white bg-white rounded-xl px-3 py-2.5 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-orange-300"
              required
            />
          </div>
        );
      })}

      {/* Botão salvar */}
      <button
        type="submit"
        disabled={salvando}
        className="w-full flex items-center justify-center gap-2 text-sm font-bold py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white transition-colors disabled:opacity-50 shadow-md"
      >
        {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckSquare className="w-4 h-4" />}
        {salvando ? 'Salvando...' : trilhaParaEditar ? 'Salvar Alterações' : 'Publicar Trilha'}
      </button>
    </form>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL: QuatrodsDsPage
// ============================================================================

interface QuatrodsDsPageProps {
  userEmail: string;
  userName: string;
  currentRole: UserRole;
  disciplinaId?: string;
}

export const QuatrodsDsPage: React.FC<QuatrodsDsPageProps> = ({
  userEmail,
  userName,
  currentRole,
  disciplinaId,
}) => {
  const isPrivileged = ['professor', 'admin', 'monitor'].includes(currentRole);
  const [trilhas, setTrilhas] = useState<QuatrodsTrilha[]>([]);
  const [respostasPorTrilha, setRespostasPorTrilha] = useState<Record<string, QuatrodsResposta[]>>({});
  const [loading, setLoading] = useState(true);
  const [trilhaSelecionada, setTrilhaSelecionada] = useState<QuatrodsTrilha | null>(null);
  const [modoFormulario, setModoFormulario] = useState(false);
  const [trilhaEditando, setTrilhaEditando] = useState<QuatrodsTrilha | null>(null);
  const [progressos, setProgressos] = useState<Record<string, QuatrodsProgressoAluno>>({});
  const [modoVerRespostas, setModoVerRespostas] = useState<QuatrodsTrilha | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const carregarDados = useCallback(async (force = false) => {
    setLoading(true);
    try {
      let lista: QuatrodsTrilha[];
      if (isPrivileged) {
        lista = await getTrilhasDoProfessor(userEmail);
      } else {
        lista = await getTrilhas(disciplinaId, force);
      }
      setTrilhas(lista);

      // Carrega respostas do aluno para cada trilha
      if (!isPrivileged && lista.length > 0) {
        const map: Record<string, QuatrodsResposta[]> = {};
        await Promise.all(
          lista.map(async (t) => {
            map[t.id] = await getRespostasDoAluno(t.id, userEmail);
          }),
        );
        setRespostasPorTrilha(map);
      }
    } catch {
      showToast('Erro ao carregar trilhas. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  }, [userEmail, disciplinaId, isPrivileged]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const handleArquivar = async (id: string) => {
    if (!confirm('Deseja arquivar (ocultar para alunos) esta trilha?')) return;
    await arquivarTrilha(id);
    showToast('Trilha arquivada com sucesso.');
    carregarDados(true);
  };

  const handleVerProgresso = async (trilha: QuatrodsTrilha) => {
    const progresso = await getProgressoDaTrilha(trilha.id, 12); // estimativa de alunos
    setProgressos((p) => ({ ...p, [trilha.id]: progresso }));
    setModoVerRespostas(trilha);
  };

  // ── MODO PLAYER (Aluno jogando a trilha) ──
  if (trilhaSelecionada && !isPrivileged) {
    return (
      <PlayerTrilha
        trilha={trilhaSelecionada}
        alunoEmail={userEmail}
        alunoNome={userName}
        onVoltar={() => { setTrilhaSelecionada(null); carregarDados(true); }}
      />
    );
  }

  // ── MODO FORMULÁRIO (Professor criando/editando) ──
  if (modoFormulario || trilhaEditando) {
    return (
      <FormularioTrilha
        professorEmail={userEmail}
        trilhaParaEditar={trilhaEditando}
        onSalvo={() => { setModoFormulario(false); setTrilhaEditando(null); showToast('✅ Trilha publicada!'); carregarDados(true); }}
        onCancelar={() => { setModoFormulario(false); setTrilhaEditando(null); }}
      />
    );
  }

  // ── MODO VER RESPOSTAS (Professor analisando) ──
  if (modoVerRespostas) {
    const progresso = progressos[modoVerRespostas.id];
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        <div>
          <button
            onClick={() => setModoVerRespostas(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar às trilhas
          </button>
          <h2 className="text-base font-black text-gray-900">📊 Respostas: {modoVerRespostas.titulo}</h2>
        </div>

        {/* Progresso por estágio */}
        {progresso && (
          <div className="grid grid-cols-4 gap-3">
            {ESTAGIOS_ORDENADOS.map((e, idx) => {
              const cfg = ESTAGIO_CONFIG[e];
              const count = idx === 0 ? progresso.alunos_completaram_d1 : idx === 1 ? progresso.alunos_completaram_d2 : idx === 2 ? progresso.alunos_completaram_d3 : progresso.alunos_completaram_d4;
              return (
                <div key={e} className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-3 text-center`}>
                  <span className="text-2xl">{cfg.emoji}</span>
                  <p className={`text-xl font-black ${cfg.cor} mt-1`}>{count}</p>
                  <p className="text-[10px] text-gray-600 font-medium">{cfg.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Botão exportar */}
        {progresso && progresso.respostas.length > 0 && (
          <button
            onClick={() => exportarRespostasCsv(modoVerRespostas, progresso.respostas)}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV (Analytics)
          </button>
        )}

        {/* Lista de respostas */}
        {progresso?.respostas.length === 0 && (
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-8 text-center">
            <GraduationCap className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Nenhuma resposta registrada ainda.</p>
          </div>
        )}
        {ESTAGIOS_ORDENADOS.map((estagio) => {
          const resps = progresso?.respostas.filter((r) => r.estagio === estagio) || [];
          if (resps.length === 0) return null;
          const cfg = ESTAGIO_CONFIG[estagio];
          return (
            <div key={estagio} className={`rounded-2xl border ${cfg.border} overflow-hidden`}>
              <div className={`px-4 py-3 ${cfg.bg} border-b ${cfg.border}`}>
                <p className={`text-xs font-bold ${cfg.cor}`}>{cfg.emoji} {cfg.label} — {resps.length} resposta(s)</p>
              </div>
              <div className="divide-y divide-gray-100">
                {resps.map((r) => (
                  <div key={r.id} className="p-4 bg-white">
                    <p className="text-[11px] font-bold text-gray-700 mb-1">{r.aluno_nome || r.aluno_email}</p>
                    <p className="text-xs text-gray-600 leading-relaxed">{r.conteudo}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(r.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── MODO LISTA PRINCIPAL ──
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-2 max-w-sm">
          {notification}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Trilha Socrática dos Quatro Ds</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-10">
            Fundamentação: <em>Método de Jesus</em> · Andragogia (Knowles, 1980) · Inov-Ativa (Moran, 2018)
          </p>
        </div>
        <div className="flex items-center gap-2 ml-10 sm:ml-0">
          <button
            onClick={() => carregarDados(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </button>
          {isPrivileged && (
            <button
              onClick={() => { setTrilhaEditando(null); setModoFormulario(true); }}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-colors shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Nova Trilha
            </button>
          )}
        </div>
      </div>

      {/* Banner explicativo */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-orange-800">Como funciona a Trilha Socrática</p>
            <p className="text-[11px] text-orange-700 mt-1">
              Cada trilha possui 4 estágios sequenciais inspirados no método de ensino de Jesus:
              <strong> 🔥 Desejo</strong> (indagação) → <strong>🌀 Desestruturação</strong> (paradoxo) →
              <strong> ⚡ Desafio</strong> (praxis) → <strong>✅ Decisão</strong> (comprometimento).
              Você só avança ao completar o estágio anterior.
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
        </div>
      )}

      {/* Lista vazia */}
      {!loading && trilhas.length === 0 && (
        <div className="rounded-2xl bg-gray-50 border border-dashed border-gray-300 p-12 text-center space-y-3">
          <Flame className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-600">
            {isPrivileged
              ? 'Nenhuma trilha criada ainda. Clique em "Nova Trilha" para começar.'
              : 'Nenhuma trilha disponível para você no momento.'}
          </p>
          {isPrivileged && (
            <button
              onClick={() => setModoFormulario(true)}
              className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Criar Primeira Trilha
            </button>
          )}
        </div>
      )}

      {/* LISTA: Modo Aluno */}
      {!loading && !isPrivileged && trilhas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trilhas.map((trilha) => (
            <CardTrilhaAluno
              key={trilha.id}
              trilha={trilha}
              respostas={respostasPorTrilha[trilha.id] || []}
              onSelecionar={() => setTrilhaSelecionada(trilha)}
            />
          ))}
        </div>
      )}

      {/* LISTA: Modo Professor/Admin */}
      {!loading && isPrivileged && trilhas.length > 0 && (
        <div className="space-y-3">
          {trilhas.map((trilha) => (
            <div
              key={trilha.id}
              className={`rounded-2xl border ${trilha.publicado ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-70'} overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${trilha.publicado ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {trilha.publicado ? '🟢 Publicada' : '⚫ Arquivada'}
                      </span>
                      {trilha.disciplina_name && (
                        <span className="text-[10px] text-gray-500 font-medium">{trilha.disciplina_name}</span>
                      )}
                      {trilha.aula_referencia && (
                        <span className="text-[10px] text-gray-400">· {trilha.aula_referencia}</span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">{trilha.titulo}</h4>
                    {trilha.descricao && (
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{trilha.descricao}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleVerProgresso(trilha)}
                      title="Ver Respostas dos Alunos"
                      className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setTrilhaEditando(trilha); setModoFormulario(false); }}
                      title="Editar Trilha"
                      className="p-2 rounded-xl hover:bg-amber-50 text-gray-400 hover:text-amber-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleArquivar(trilha.id)}
                      title="Arquivar"
                      className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Preview dos 4Ds */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {ESTAGIOS_ORDENADOS.map((e, i) => {
                    const cfg = ESTAGIO_CONFIG[e];
                    const titulo = i === 0 ? trilha.d1_titulo : i === 1 ? trilha.d2_titulo : i === 2 ? trilha.d3_titulo : trilha.d4_titulo;
                    return (
                      <div key={e} className={`rounded-xl border ${cfg.border} ${cfg.bg} px-2 py-1.5`}>
                        <p className="text-[9px] font-bold text-gray-500 uppercase">{cfg.emoji} D{i + 1}</p>
                        <p className="text-[10px] font-semibold text-gray-800 line-clamp-1 mt-0.5">{titulo || cfg.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rodapé acadêmico */}
      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
        <div className="flex items-start gap-2">
          <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-gray-500 leading-relaxed">
            <span className="font-bold text-gray-600">Referências Teóricas:</span>{' '}
            KNOWLES, M. <em>The Modern Practice of Adult Education: Andragogy vs. Pedagogy</em>, 1980.
            FREIRE, P. <em>Pedagogia do Oprimido</em>, 1970.
            MORAN, J. <em>Metodologias Ativas para uma Educação Inovadora</em>, 2018.
            Implementado no Koinonia-LMS (Seminário Teológico UIECB), 2026.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuatrodsDsPage;
