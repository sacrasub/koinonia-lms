'use client';

import React, { useState } from 'react';
import {
  BookOpen, Calendar, AlertTriangle,
  ChevronDown, ChevronUp, Target,
  FileText, GraduationCap,
  Info, MessageSquare, Check
} from 'lucide-react';

interface PlanoEstudosPageProps {
  userEmail?: string;
  onTabChange?: (tab: string) => void;
}

// ============================================================
// ESTRUTURA DE DADOS
// ============================================================

interface Entregavel {
  id: string;
  disciplina: string;
  titulo: string;
  descricao: string;
  dataLimite: string;
  dataISO: string;
  tipo: 'prova' | 'trabalho' | 'resumo' | 'apresentacao' | 'entrega';
}

interface LivroRecomendado {
  titulo: string;
  autor: string;
  tipo: 'obrigatorio' | 'base' | 'recomendado';
}

interface RequisitosDisciplina {
  id: string;
  num: string;
  nome: string;
  professor: string;
  cor: string;
  corFundo: string;
  corBorda: string;
  regrasGerais: string[];
  criteriosAvaliacao: string[];
  livros: LivroRecomendado[];
  infoExtra?: string;
  whatsapp?: string;
}

const DIAS_ESPECIAIS = [
  { data: '08/09/2026 (Terça-feira)', descricao: 'Aula normal — Curso Básico de Teologia', motivo: 'Compensação pelo feriado de 07/09 (Independência do Brasil)' },
  { data: '13/10/2026 (Terça-feira)', descricao: 'Aula normal — Curso Básico de Teologia', motivo: 'Compensação pelo feriado de 12/10 (Nossa Senhora Aparecida)' },
  { data: '03/11/2026 (Terça-feira)', descricao: 'Aula normal — Curso Básico de Teologia', motivo: 'Compensação pelo feriado de 02/11 (Finados)' },
];

const ENTREGAVEIS: Entregavel[] = [
  { id: 'e-tcc-projeto', disciplina: 'TCC I', titulo: 'Projeto de Pesquisa Estruturado ABNT', descricao: 'Estrutura: Capa, Sumário, Objetivos (geral + 2-3 específicos), Justificativa, Referencial Teórico, Cronograma. Linguagem científica impessoal. Proibido uso de IA.', dataLimite: '04/09/2026 (Sex)', dataISO: '2026-09-04', tipo: 'entrega' },
  { id: 'e-his-av1', disciplina: 'História do Congregacionalismo', titulo: 'AV1: Prova Escrita — Unidade 1 (Congregacionalismo Mundial)', descricao: '0-8 pts prova + 1 pt frequência + 1 pt leitura obrigatória. Câmeras obrigatórias.', dataLimite: '29/09/2026 (Ter)', dataISO: '2026-09-29', tipo: 'prova' },
  { id: 'e-hpc-av1', disciplina: 'História do Pensamento Cristão II', titulo: 'AV1: Trabalho Acadêmico ABNT — Iluminismo & Modernidade', descricao: 'Pesquisa sob normas ABNT. Individual ou grupos de até 3 alunos.', dataLimite: '29/09/2026 (Ter)', dataISO: '2026-09-29', tipo: 'trabalho' },
  { id: 'e-aco-av1', disciplina: 'Aconselhamento Bíblico II', titulo: 'AV1: Prova Objetiva via Google Forms', descricao: 'Questões estritamente dos slides. Sem trabalhos escritos. Correção automática.', dataLimite: '30/09/2026 (Qua)', dataISO: '2026-09-30', tipo: 'prova' },
  { id: 'e-dir-av1', disciplina: 'Direitos Humanos', titulo: 'V1: Prova Forms (peso 8) + Pesquisa Escrita (peso 2)', descricao: 'Prova objetiva Google Forms sem consulta (peso 8). Trabalho de pesquisa escrito por e-mail (peso 2). Média >= 7,0.', dataLimite: '30/09/2026 (Qua)', dataISO: '2026-09-30', tipo: 'prova' },
  { id: 'e-etc-av1', disciplina: 'Ética Cristã', titulo: 'AV1: Slides do Seminário (elaboração coletiva em grupo)', descricao: 'Nota de elaboração dos slides (grupo de 3-4 alunos). Base: Dez Mandamentos — Catecismo Maior de Westminster e Norman Geisler.', dataLimite: '01/10/2026 (Qui)', dataISO: '2026-10-01', tipo: 'entrega' },
  { id: 'e-nt-av1', disciplina: 'NT III — Epístolas Gerais', titulo: 'AV Semestral: Bateria de 150 Questões (parte 1)', descricao: 'Questões baseadas em Carson/Moo/Morris e anotações dos slides. Câmeras obrigatórias.', dataLimite: '01/10/2026 (Qui)', dataISO: '2026-10-01', tipo: 'prova' },
  { id: 'e-etc-seminario', disciplina: 'Ética Cristã', titulo: 'AV2: Seminários em Grupo — Dez Mandamentos (22/10 a 19/11)', descricao: 'Apresentação 30 min (10 min/orador com cronômetro). Nota individual de oratória e tribuna.', dataLimite: '22/10 – 19/11/2026', dataISO: '2026-10-22', tipo: 'apresentacao' },
  { id: 'e-his-av2', disciplina: 'História do Congregacionalismo', titulo: 'AV2: Prova Escrita — Unidade 2 (Congregacionalismo no Brasil)', descricao: 'Prova final da segunda unidade. Mesma composição da AV1.', dataLimite: '24/11/2026 (Ter)', dataISO: '2026-11-24', tipo: 'prova' },
  { id: 'e-hpc-av2', disciplina: 'História do Pensamento Cristão II', titulo: 'AV2: Prova Objetiva 10 Questões — Google Forms', descricao: 'Prova objetiva 10 questões Google Forms. Resultado instantâneo.', dataLimite: '24/11/2026 (Ter)', dataISO: '2026-11-24', tipo: 'prova' },
  { id: 'e-aco-av2', disciplina: 'Aconselhamento Bíblico II', titulo: 'AV2: Prova Objetiva Final — Google Forms', descricao: 'Segunda prova objetiva. Questões dos slides. Correção automática.', dataLimite: '25/11/2026 (Qua)', dataISO: '2026-11-25', tipo: 'prova' },
  { id: 'e-dir-av2', disciplina: 'Direitos Humanos', titulo: 'V2: Prova Forms (peso 8) + Pesquisa Escrita (peso 2)', descricao: 'Mesma estrutura da V1. Média final >= 7,0 para aprovação.', dataLimite: '25/11/2026 (Qua)', dataISO: '2026-11-25', tipo: 'prova' },
  { id: 'e-pla-resumo', disciplina: 'Plantação e Revitalização II', titulo: 'AV1: Resumo Manuscrito — "A Treliça e a Videira" (12 pág.)', descricao: '1 página por capítulo (12 folhas). Enviar para thacyto@gmail.com. Prazo improrrogável.', dataLimite: '27/11/2026 (Sex)', dataISO: '2026-11-27', tipo: 'resumo' },
  { id: 'e-pla-av2', disciplina: 'Plantação e Revitalização II', titulo: 'AV2: Prova por Link (com consulta às anotações)', descricao: 'Prova online agendada para 27/11. Consulta livre às anotações pessoais.', dataLimite: '27/11/2026 (Sex)', dataISO: '2026-11-27', tipo: 'prova' },
  { id: 'e-tcc-artigo', disciplina: 'TCC I', titulo: 'Entrega Final: Artigo Científico Completo (máx. 20 pág.)', descricao: 'Sem IA. Ordem: Metodologia → Desenvolvimento → Conclusão → Resumo & Introdução por último. Referências ABNT em ordem alfabética.', dataLimite: '04/12/2026 (Sex)', dataISO: '2026-12-04', tipo: 'entrega' },
];

const REQUISITOS_DISCIPLINAS: RequisitosDisciplina[] = [
  {
    id: 'disc-1', num: '01', nome: 'História do Congregacionalismo', professor: 'Profº Ary Júnior',
    cor: 'text-amber-800', corFundo: 'bg-amber-50', corBorda: 'border-amber-300',
    regrasGerais: ['📷 Câmeras obrigatoriamente abertas durante toda a aula', '📅 16 encontros em 2 unidades: Unidade 1 (Congregacionalismo Mundial) e Unidade 2 (Congregacionalismo Brasileiro)', '📚 Leitura obrigatória dos textos indicados — verificada por autodeclaração na prova (+1 ponto)'],
    criteriosAvaliacao: ['✍️ AV1 e AV2: Provas escritas ao final de cada unidade — até 8 pontos', '👥 +1 ponto de frequência e participação ativa', '📖 +1 ponto pela leitura obrigatória (autodeclaração)', '🏆 Total: 10 pontos por avaliação'],
    livros: [{ titulo: 'Livro sobre Congregacionalismo (Origens)', autor: 'Profº Idauro Campos', tipo: 'obrigatorio' }, { titulo: 'Quem eram os Puritanos', autor: 'Erroll Hulse', tipo: 'recomendado' }, { titulo: 'Santos no Mundo', autor: 'Leland Ryken', tipo: 'recomendado' }, { titulo: 'Os Puritanos: suas origens e sucessores', autor: 'D. Martin Lloyd-Jones', tipo: 'recomendado' }, { titulo: 'A Verdadeira Natureza de uma Igreja Evangélica', autor: 'John Owen', tipo: 'recomendado' }],
  },
  {
    id: 'disc-2', num: '02', nome: 'História do Pensamento Cristão II', professor: 'Profº Hilário Bispo',
    cor: 'text-blue-800', corFundo: 'bg-blue-50', corBorda: 'border-blue-300',
    regrasGerais: ['📝 AV1: Trabalho acadêmico ABNT (individual ou grupos de até 3 alunos)', '📊 AV2: Prova objetiva com 10 questões Google Forms', '🎤 AV3 (apenas recuperação): Exame oral temático com o professor'],
    criteriosAvaliacao: ['📄 AV1: Pesquisa científica ABNT — Iluminismo & Modernidade (Razão vs Revelação)', '📱 AV2: 10 questões objetivas Google Forms — resultado instantâneo', '🗣️ AV3 (somente recuperação): Exame oral temático'],
    livros: [{ titulo: 'Material de aula (apostila)', autor: 'Profº Hilário Bispo', tipo: 'base' }],
    infoExtra: 'Temas centrais: Escolástica (Anselmo, Aquino), Nominalismo de Ockham, Humanismo Renascentista, Iluminismo (Kant), Liberalismo Teológico (Schleiermacher) e Ortodoxia Contemporânea.',
  },
  {
    id: 'disc-3', num: '03', nome: 'Aconselhamento Bíblico II', professor: 'Profº Uilian Santos',
    cor: 'text-emerald-800', corFundo: 'bg-emerald-50', corBorda: 'border-emerald-300',
    regrasGerais: ['📋 Avaliação EXCLUSIVA por 2 provas objetivas Google Forms — sem trabalhos escritos', '🎯 Conteúdo RESTRITO aos slides apresentados em aula', '✅ Lista de presença ao final de cada aula'],
    criteriosAvaliacao: ['📱 AV1: Prova objetiva Google Forms — questões dos slides — correção automática', '📱 AV2: Prova objetiva Google Forms — questões dos slides — correção automática', '⚠️ Nenhum trabalho escrito é exigido'],
    livros: [{ titulo: 'Lutero como Conselheiro Espiritual', autor: 'Theodore Tappert', tipo: 'recomendado' }, { titulo: 'Aconselhamento Cristão', autor: 'Gary Collins', tipo: 'recomendado' }, { titulo: 'Aconselhamento a partir da Cruz', autor: 'Elyse Fitzpatrick', tipo: 'recomendado' }, { titulo: 'Ego Transformado', autor: 'Timothy Keller', tipo: 'recomendado' }],
  },
  {
    id: 'disc-4', num: '04', nome: 'Direitos Humanos', professor: 'Profº Cleiton Barbirato',
    cor: 'text-indigo-800', corFundo: 'bg-indigo-50', corBorda: 'border-indigo-300',
    regrasGerais: ['📊 V1 e V2: Prova objetiva Forms (peso 8) + Trabalho de pesquisa individual (peso 2)', '🚫 Prova objetiva: sem consulta', '📧 Trabalho de pesquisa: envio por e-mail', '🎯 Média >= 7,0 para aprovação direta; abaixo, prova extra (recuperação)'],
    criteriosAvaliacao: ['📱 Prova objetiva múltipla escolha Google Forms — peso 8,0 — sem consulta', '✍️ Trabalho de pesquisa escrito individual — peso 2,0', '🏆 Média V1 e V2 >= 7,0 para aprovação'],
    livros: [{ titulo: 'E se Jesus não tivesse nascido', autor: 'D. James Kennedy & Jerry Newcombe', tipo: 'obrigatorio' }],
    infoExtra: 'Textos e slides gratuitos disponíveis na pasta virtual da disciplina no Google Drive.',
  },
  {
    id: 'disc-5', num: '05', nome: 'Ética Cristã', professor: 'Profª Karoline Evangelista',
    cor: 'text-violet-800', corFundo: 'bg-violet-50', corBorda: 'border-violet-300',
    regrasGerais: ['👥 Apresentações em grupos de 3 a 4 alunos (duplas/trios segundo o documento original)', '📅 Período: 22/10 a 19/11/2026', '⏱️ 30 minutos por grupo — 10 minutos EXATOS por orador (cronômetro)', '🎯 Nota INDIVIDUAL — cada aluno é avaliado de forma independente'],
    criteriosAvaliacao: ['📊 AV1: Pesquisa teológica + confecção coletiva dos slides (nota individual)', '🗣️ AV2: Desempenho individual na tribuna de apresentação', '📖 Base: Catecismo Maior de Westminster — seção dos Dez Mandamentos'],
    livros: [{ titulo: 'Ética Cristã: Opções e Questões Contemporâneas', autor: 'Norman Geisler', tipo: 'base' }, { titulo: 'Catecismo Maior de Westminster', autor: 'Westminster Assembly (1648)', tipo: 'obrigatorio' }],
  },
  {
    id: 'disc-6', num: '06', nome: 'NT III — Epístolas Gerais', professor: 'Profº Marcio Leal',
    cor: 'text-rose-800', corFundo: 'bg-rose-50', corBorda: 'border-rose-300',
    regrasGerais: ['📷 Câmeras obrigatoriamente ligadas — flexibilidade no horário de encerramento', '📝 Slides são INTENCIONALMENTE SINTÉTICOS para forçar anotações manuais', '✏️ Faça anotações detalhadas — as provas são baseadas nelas'],
    criteriosAvaliacao: ['📱 Exames objetivos via Google Forms', '📚 Carga de 150 questões discursivas/orais baseadas no livro-base e slides'],
    livros: [{ titulo: 'Introdução ao Novo Testamento', autor: 'Carson, Moo & Morris', tipo: 'base' }],
    infoExtra: 'Abrange: Hebreus, Tiago, 1 e 2 Pedro, 1, 2 e 3 João, e Judas.',
  },
  {
    id: 'disc-7', num: '07', nome: 'Plantação e Revitalização de Igrejas II', professor: 'Profº Thácyto Lessa',
    cor: 'text-orange-800', corFundo: 'bg-orange-50', corBorda: 'border-orange-300',
    regrasGerais: ['⏰ Início pontual às 19:00 — sem atrasos', '📷 Câmeras obrigatoriamente ligadas (avaliadas para presença/participação)', '🔒 Slides NÃO são liberados até a aula final de revisão', '📧 AV1: Enviar resumo para thacyto@gmail.com até 27/11/2026 (improrrogável)'],
    criteriosAvaliacao: ['📖 AV1: Resumo individual MANUSCRITO de "A Treliça e a Videira" — 1 pág./cap. (12 folhas) — entrega 27/11', '📱 AV2: Prova online (link) com consulta às anotações pessoais — 27/11/2026'],
    livros: [{ titulo: 'A Treliça e a Videira', autor: 'Colin Marshall & Tony Payne', tipo: 'obrigatorio' }],
    infoExtra: 'ATENÇÃO: O resumo manuscrito é OBRIGATÓRIO: caneta, papel, 1 página por capítulo, 12 capítulos = 12 folhas. Enviar por e-mail até 27/11.',
  },
  {
    id: 'disc-8', num: '08', nome: 'TCC I', professor: 'Profª Gabriela Leal',
    cor: 'text-teal-800', corFundo: 'bg-teal-50', corBorda: 'border-teal-300',
    regrasGerais: ['💬 Grupo WhatsApp oficial: "TCC1 - segundo semestre 2026"', '🏫 Normas: Faculdade Maciço do Baturité (UNIMB)', '📄 Extensão máxima: 20 páginas (Capa até Anexos)', '🚫 USO DE IA É TERMINANTEMENTE PROIBIDO (apenas correção ortográfica e formatação técnica externa são liberadas)', '👨‍🏫 Orientador escolhido por afinidade temática'],
    criteriosAvaliacao: ['📋 Sem provas tradicionais — avaliação contínua de participação e progresso', '🗓️ Etapa 1: Projeto de Pesquisa estruturado — prazo 04/09/2026', '📝 Etapa Final: Artigo científico completo — prazo 04/12/2026'],
    livros: [{ titulo: 'Manual de Metodologia Científica (consultar com orientador)', autor: 'A definir', tipo: 'recomendado' }],
    infoExtra: 'Ordem de escrita obrigatória:\n1º Metodologia (começar imediatamente)\n2º Referencial Teórico e Desenvolvimento\n3º Conclusão\n4º Resumo e Introdução (escrever POR ÚLTIMO, após concluir o artigo)\n\nReferências ABNT: somente obras citadas no texto, em ordem alfabética.',
    whatsapp: 'TCC1 - segundo semestre 2026',
  },
];

// ── Helpers ──
function getDiasRestantes(dataISO: string): number {
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const alvo = new Date(dataISO); alvo.setHours(0, 0, 0, 0);
  return Math.round((alvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function getBadgeTipo(tipo: Entregavel['tipo']) {
  const map: Record<Entregavel['tipo'], { label: string; cls: string }> = {
    prova: { label: '📝 Prova', cls: 'bg-red-100 text-red-700 border border-red-200' },
    trabalho: { label: '📄 Trabalho', cls: 'bg-blue-100 text-blue-700 border border-blue-200' },
    resumo: { label: '📖 Resumo', cls: 'bg-orange-100 text-orange-700 border border-orange-200' },
    apresentacao: { label: '🎤 Seminário', cls: 'bg-violet-100 text-violet-700 border border-violet-200' },
    entrega: { label: '📤 Entrega', cls: 'bg-teal-100 text-teal-700 border border-teal-200' },
  };
  return map[tipo] || { label: tipo, cls: 'bg-gray-100 text-gray-700' };
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export const PlanoEstudosPage: React.FC<PlanoEstudosPageProps> = ({ userEmail }) => {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem(`lms_plano_checklist_${userEmail}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [expandedDisciplina, setExpandedDisciplina] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'cronograma' | 'requisitos' | 'livros'>('cronograma');

  const toggleCheck = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { localStorage.setItem(`lms_plano_checklist_${userEmail}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const entregaveisOrdenados = [...ENTREGAVEIS].sort(
    (a, b) => new Date(a.dataISO).getTime() - new Date(b.dataISO).getTime()
  );
  const completados = ENTREGAVEIS.filter(e => checkedIds.has(e.id)).length;
  const progresso = Math.round((completados / ENTREGAVEIS.length) * 100);

  return (
    <div className="space-y-5 px-1 pb-8">
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-5 text-white shadow-xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-amber-400 blur-3xl" />
          <div className="absolute bottom-2 left-12 w-24 h-24 rounded-full bg-blue-400 blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-white/10"><Target className="w-6 h-6 text-amber-300" /></div>
            <div>
              <h1 className="text-lg font-bold">Plano de Estudos 2026.2</h1>
              <p className="text-slate-300 text-xs">Seminário Teológico Congregacional • Turma A — 7º Período</p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>{completados} de {ENTREGAVEIS.length} entregáveis marcados</span>
            <span className="font-bold text-amber-300">{progresso}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500" style={{ width: `${progresso}%` }} />
          </div>
        </div>
      </div>

      {/* ALERTA DIAS ESPECIAIS */}
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <h2 className="font-bold text-amber-800 text-sm">Dias Letivos Especiais — Curso Básico de Teologia</h2>
        </div>
        <p className="text-amber-700 text-xs mb-3">Haverá aulas normais nos dias abaixo para compensar feriados, evitando prejuízo na carga horária:</p>
        <div className="space-y-2">
          {DIAS_ESPECIAIS.map((d, i) => (
            <div key={i} className="flex items-start gap-2 bg-white rounded-lg p-3 border border-amber-200">
              <span className="text-base">📅</span>
              <div>
                <p className="font-semibold text-amber-800 text-xs">{d.data}</p>
                <p className="text-amber-700 text-xs">{d.descricao}</p>
                <p className="text-amber-500 text-xs italic">{d.motivo}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-amber-100 rounded-lg p-2 text-xs text-amber-700">
          💬 Canal de comunicação: <strong>grupos de WhatsApp por disciplina</strong>. TCC I: <em>"TCC1 - segundo semestre 2026"</em>.
        </div>
      </div>

      {/* SELETOR DE SEÇÃO */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
        {[
          { id: 'cronograma', emoji: '📅', label: 'Cronograma' },
          { id: 'requisitos', emoji: '📋', label: 'Requisitos' },
          { id: 'livros', emoji: '📚', label: 'Livros' },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id as any)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${activeSection === s.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      {/* ── SEÇÃO: CRONOGRAMA & CHECKLIST ── */}
      {activeSection === 'cronograma' && (
        <div className="space-y-3">
          <p className="text-slate-500 text-xs">Marque os itens conforme for concluindo. O progresso é salvo automaticamente.</p>
          {entregaveisOrdenados.map(e => {
            const dias = getDiasRestantes(e.dataISO);
            const done = checkedIds.has(e.id);
            const badge = getBadgeTipo(e.tipo);
            const urgente = !done && dias >= 0 && dias <= 14;
            const vencido = !done && dias < 0;
            return (
              <div key={e.id} className={`rounded-xl border p-4 transition-all shadow-sm ${done ? 'bg-green-50 border-green-200 opacity-70' : vencido ? 'bg-red-50 border-red-200' : urgente ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleCheck(e.id)} className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${done ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 hover:border-green-400'}`}>
                    {done && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                      {urgente && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 border border-amber-300">⚡ {dias === 0 ? 'Hoje!' : `${dias}d restantes`}</span>}
                      {vencido && <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-800 border border-red-300">⚠️ Vencido</span>}
                      {!urgente && !vencido && !done && dias > 0 && <span className="text-xs text-slate-400">{dias}d restantes</span>}
                    </div>
                    <p className="text-xs font-semibold text-slate-500">{e.disciplina}</p>
                    <p className={`text-sm font-bold ${done ? 'line-through text-slate-400' : 'text-slate-800'}`}>{e.titulo}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{e.descricao}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-medium text-slate-600">{e.dataLimite}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SEÇÃO: REQUISITOS POR MATÉRIA ── */}
      {activeSection === 'requisitos' && (
        <div className="space-y-3">
          <p className="text-slate-500 text-xs">Diretrizes oficiais informadas pelos professores no início do semestre. Clique para expandir cada matéria.</p>
          {REQUISITOS_DISCIPLINAS.map(disc => {
            const expanded = expandedDisciplina === disc.id;
            return (
              <div key={disc.id} className={`rounded-xl border ${disc.corBorda} ${disc.corFundo} shadow-sm overflow-hidden`}>
                <button onClick={() => setExpandedDisciplina(prev => prev === disc.id ? null : disc.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:opacity-80 transition-opacity">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/70 ${disc.cor}`}>{disc.num}</span>
                    </div>
                    <p className={`font-bold text-sm ${disc.cor}`}>{disc.nome}</p>
                    <p className="text-xs text-slate-500">{disc.professor}</p>
                  </div>
                  {expanded ? <ChevronUp className={`w-4 h-4 ${disc.cor}`} /> : <ChevronDown className={`w-4 h-4 ${disc.cor}`} />}
                </button>
                {expanded && (
                  <div className="border-t border-white/40 bg-white/70 p-4 space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1"><Info className="w-3 h-3" /> Diretrizes</h3>
                      <ul className="space-y-1.5">
                        {disc.regrasGerais.map((r, i) => <li key={i} className="text-xs text-slate-700 bg-white/80 rounded-lg px-3 py-2 leading-relaxed">{r}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Avaliação</h3>
                      <ul className="space-y-1.5">
                        {disc.criteriosAvaliacao.map((c, i) => <li key={i} className="text-xs text-slate-700 bg-white/80 rounded-lg px-3 py-2 leading-relaxed">{c}</li>)}
                      </ul>
                    </div>
                    {disc.infoExtra && (
                      <div className="bg-white/80 rounded-lg p-3 border border-white/60">
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{disc.infoExtra}</p>
                      </div>
                    )}
                    {disc.whatsapp && (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
                        <MessageSquare className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-green-800">Grupo WhatsApp Oficial</p>
                          <p className="text-xs text-green-700">"{disc.whatsapp}"</p>
                        </div>
                      </div>
                    )}
                    {disc.livros.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Leituras</h3>
                        <div className="space-y-1.5">
                          {disc.livros.map((l, i) => (
                            <div key={i} className="flex items-start gap-2 bg-white/80 rounded-lg px-3 py-2">
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 ${l.tipo === 'obrigatorio' ? 'bg-red-100 text-red-700' : l.tipo === 'base' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                {l.tipo === 'obrigatorio' ? 'OBRIG.' : l.tipo === 'base' ? 'BASE' : 'REC.'}
                              </span>
                              <div><p className="text-xs font-semibold text-slate-800">{l.titulo}</p><p className="text-xs text-slate-500">{l.autor}</p></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── SEÇÃO: LIVROS ── */}
      {activeSection === 'livros' && (
        <div className="space-y-5">
          {/* Obrigatórios */}
          <div>
            <div className="flex items-center gap-2 mb-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><h3 className="text-sm font-bold text-red-700">📕 Leitura Obrigatória</h3></div>
            <div className="space-y-2">
              {[
                { t: 'A Treliça e a Videira', a: 'Colin Marshall & Tony Payne', d: 'Plantação e Revitalização II', n: 'Base da AV1: resumo manuscrito de 12 páginas (1 por capítulo). Enviar até 27/11.' },
                { t: 'E se Jesus não tivesse nascido', a: 'D. James Kennedy & Jerry Newcombe', d: 'Direitos Humanos', n: 'Leitura obrigatória para V1 e V2.' },
                { t: 'Catecismo Maior de Westminster', a: 'Westminster Assembly (1648)', d: 'Ética Cristã', n: 'Seção dos Dez Mandamentos — base do Seminário (AV1/AV2).' },
                { t: 'Livro sobre Congregacionalismo (Idauro Campos)', a: 'Profº Idauro Campos', d: 'História do Congregacionalismo', n: 'Leitura verificada por autodeclaração na prova (+1 ponto).' },
              ].map((l, i) => (
                <div key={i} className="rounded-xl border border-red-200 p-4 bg-white shadow-sm flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">📕</span>
                  <div><p className="font-bold text-slate-800 text-sm">{l.t}</p><p className="text-xs text-slate-500 mb-1">{l.a}</p><span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">{l.d}</span><p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{l.n}</p></div>
                </div>
              ))}
            </div>
          </div>
          {/* Base */}
          <div>
            <div className="flex items-center gap-2 mb-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><h3 className="text-sm font-bold text-blue-700">📘 Livro-Texto (Base das Aulas)</h3></div>
            <div className="space-y-2">
              {[
                { t: 'Introdução ao Novo Testamento', a: 'Carson, Moo & Morris', d: 'NT III — Epístolas Gerais', n: 'Base das 150 questões da avaliação. Slides são sintéticos — anote tudo em aula!' },
                { t: 'Ética Cristã: Opções e Questões Contemporâneas', a: 'Norman Geisler', d: 'Ética Cristã', n: 'Livro-texto oficial para o Seminário (AV1/AV2).' },
              ].map((l, i) => (
                <div key={i} className="rounded-xl border border-blue-200 p-4 bg-white shadow-sm flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">📘</span>
                  <div><p className="font-bold text-slate-800 text-sm">{l.t}</p><p className="text-xs text-slate-500 mb-1">{l.a}</p><span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{l.d}</span><p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{l.n}</p></div>
                </div>
              ))}
            </div>
          </div>
          {/* Recomendados */}
          <div>
            <div className="flex items-center gap-2 mb-2"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><h3 className="text-sm font-bold text-green-700">📗 Leituras Recomendadas</h3></div>
            <div className="space-y-2">
              {[
                { t: 'Lutero como Conselheiro Espiritual', a: 'Theodore Tappert', d: 'Aconselhamento Bíblico II' },
                { t: 'Aconselhamento Cristão', a: 'Gary Collins', d: 'Aconselhamento Bíblico II' },
                { t: 'Aconselhamento a partir da Cruz', a: 'Elyse Fitzpatrick', d: 'Aconselhamento Bíblico II' },
                { t: 'Ego Transformado', a: 'Timothy Keller', d: 'Aconselhamento Bíblico II' },
                { t: 'Quem eram os Puritanos', a: 'Erroll Hulse', d: 'História do Congregacionalismo' },
                { t: 'Santos no Mundo', a: 'Leland Ryken', d: 'História do Congregacionalismo' },
                { t: 'Os Puritanos: suas origens e sucessores', a: 'D. Martin Lloyd-Jones', d: 'História do Congregacionalismo' },
                { t: 'A Verdadeira Natureza de uma Igreja Evangélica', a: 'John Owen', d: 'História do Congregacionalismo' },
              ].map((l, i) => (
                <div key={i} className="rounded-xl border border-green-200 p-3 bg-white shadow-sm flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">📗</span>
                  <div><p className="font-bold text-slate-800 text-sm">{l.t}</p><p className="text-xs text-slate-500 mb-1">{l.a}</p><span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">{l.d}</span></div>
                </div>
              ))}
            </div>
          </div>
          {/* Aviso TCC */}
          <div className="rounded-xl border border-teal-300 bg-teal-50 p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-teal-800 text-sm mb-1">🚫 TCC I — Regra sobre IA</h3>
                <p className="text-teal-700 text-xs leading-relaxed">
                  É <strong>terminantemente proibido</strong> o uso de Inteligência Artificial ou terceiros para redigir o TCC. 
                  Somente correções ortográficas e formatação técnica externa são permitidas.
                </p>
                <div className="mt-2 bg-teal-100 rounded-lg p-2">
                  <p className="text-teal-700 text-xs font-bold mb-1">Ordem de escrita obrigatória:</p>
                  <p className="text-teal-600 text-xs">1º Metodologia → 2º Desenvolvimento → 3º Conclusão → 4º <strong>Resumo & Introdução (por último!)</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanoEstudosPage;
