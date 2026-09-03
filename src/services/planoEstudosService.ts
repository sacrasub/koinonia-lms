'use client';

export interface Entregavel {
  id: string;
  disciplina: string;
  disciplinaId?: string;
  titulo: string;
  descricao: string;
  dataLimite: string;
  dataISO: string;
  tipo: 'prova' | 'trabalho' | 'resumo' | 'apresentacao' | 'entrega';
  isCustomStudentItem?: boolean;
  createdBy?: string;
}

export interface LivroRecomendado {
  id?: string;
  titulo: string;
  autor: string;
  tipo: 'obrigatorio' | 'base' | 'recomendado';
}

export interface RequisitosDisciplina {
  id: string;
  num: string;
  nome: string;
  professor: string;
  professorEmail?: string;
  cor: string;
  corFundo: string;
  corBorda: string;
  regrasGerais: string[];
  criteriosAvaliacao: string[];
  livros: LivroRecomendado[];
  infoExtra?: string;
  whatsapp?: string;
}

export interface PlanoEstudosTurma {
  entregaveis: Entregavel[];
  requisitos: RequisitosDisciplina[];
}

const STORAGE_PREFIX = 'lms_plano_estudos_turma_v2_';

// ============================================================
// DADOS INICIAIS POR TURMA
// ============================================================

const INITIAL_TURMA_A: PlanoEstudosTurma = {
  entregaveis: [
    { id: 'e-tcc-projeto', disciplinaId: 'disc-8', disciplina: 'TCC I', titulo: 'Projeto de Pesquisa Estruturado ABNT', descricao: 'Estrutura: Capa, Sumário, Objetivos (geral + 2-3 específicos), Justificativa, Referencial Teórico, Cronograma. Linguagem científica impessoal. Proibido uso de IA.', dataLimite: '04/09/2026 (Sex)', dataISO: '2026-09-04', tipo: 'entrega' },
    { id: 'e-his-av1', disciplinaId: 'disc-1', disciplina: 'História do Congregacionalismo', titulo: 'AV1: Prova Escrita — Unidade 1 (Congregacionalismo Mundial)', descricao: '0-8 pts prova + 1 pt frequência + 1 pt leitura obrigatória. Câmeras obrigatórias.', dataLimite: '29/09/2026 (Ter)', dataISO: '2026-09-29', tipo: 'prova' },
    { id: 'e-hpc-av1', disciplinaId: 'disc-2', disciplina: 'História do Pensamento Cristão II', titulo: 'AV1: Trabalho Acadêmico ABNT — Iluminismo & Modernidade', descricao: 'Pesquisa sob normas ABNT. Individual ou grupos de até 3 alunos.', dataLimite: '29/09/2026 (Ter)', dataISO: '2026-09-29', tipo: 'trabalho' },
    { id: 'e-aco-av1', disciplinaId: 'disc-3', disciplina: 'Aconselhamento Bíblico II', titulo: 'AV1: Prova Objetiva via Google Forms', descricao: 'Questões estritamente dos slides. Sem trabalhos escritos. Correção automática.', dataLimite: '30/09/2026 (Qua)', dataISO: '2026-09-30', tipo: 'prova' },
    { id: 'e-dir-av1', disciplinaId: 'disc-4', disciplina: 'Direitos Humanos', titulo: 'Trabalho Dissertativo AV1: Desigualdade Social & Privilégios (peso 2) + Prova Forms (peso 8)', descricao: 'Redigir dissertação de até 1 lauda: "Desigualdade social e privilégios conforme vídeo da aula de 26/09/2026. Discutir a importância da igreja como agente de transformação social". Formatação: Times New Roman 12, esp. 1,5. Enviar para cleitonpb@gmail.com com assunto "Trabalho para composição de nota". Prazo improrrogável: 30/09/2026. Valor: 2,0 pts. Prova Forms: 8,0 pts.', dataLimite: '30/09/2026 (Qua)', dataISO: '2026-09-30', tipo: 'trabalho' },
    { id: 'e-etc-av1', disciplinaId: 'disc-5', disciplina: 'Ética Cristã', titulo: 'AV1: Slides do Seminário (elaboração coletiva em grupo)', descricao: 'Nota de elaboração dos slides (grupo de 3-4 alunos). Base: Dez Mandamentos — Catecismo Maior de Westminster e Norman Geisler.', dataLimite: '01/10/2026 (Qui)', dataISO: '2026-10-01', tipo: 'entrega' },
    { id: 'e-nt-av1', disciplinaId: 'disc-6', disciplina: 'NT III — Epístolas Gerais', titulo: 'AV Semestral: Bateria de 150 Questões (parte 1)', descricao: 'Questões baseadas em Carson/Moo/Morris e anotações dos slides. Câmeras obrigatórias.', dataLimite: '01/10/2026 (Qui)', dataISO: '2026-10-01', tipo: 'prova' },
    { id: 'e-etc-seminario', disciplinaId: 'disc-5', disciplina: 'Ética Cristã', titulo: 'AV2: Seminários em Grupo — Dez Mandamentos (22/10 a 19/11)', descricao: 'Apresentação 30 min (10 min/orador com cronômetro). Nota individual de oratória e tribuna.', dataLimite: '22/10 – 19/11/2026', dataISO: '2026-10-22', tipo: 'apresentacao' },
    { id: 'e-his-av2', disciplinaId: 'disc-1', disciplina: 'História do Congregacionalismo', titulo: 'AV2: Prova Escrita — Unidade 2 (Congregacionalismo no Brasil)', descricao: 'Prova final da segunda unidade. Mesma composição da AV1.', dataLimite: '24/11/2026 (Ter)', dataISO: '2026-11-24', tipo: 'prova' },
    { id: 'e-hpc-av2', disciplinaId: 'disc-2', disciplina: 'História do Pensamento Cristão II', titulo: 'AV2: Prova Objetiva 10 Questões — Google Forms', descricao: 'Prova objetiva 10 questões Google Forms. Resultado instantâneo.', dataLimite: '24/11/2026 (Ter)', dataISO: '2026-11-24', tipo: 'prova' },
    { id: 'e-aco-av2', disciplinaId: 'disc-3', disciplina: 'Aconselhamento Bíblico II', titulo: 'AV2: Prova Objetiva Final — Google Forms', descricao: 'Segunda prova objetiva. Questões dos slides. Correção automática.', dataLimite: '25/11/2026 (Qua)', dataISO: '2026-11-25', tipo: 'prova' },
    { id: 'e-dir-av2', disciplinaId: 'disc-4', disciplina: 'Direitos Humanos', titulo: 'V2: Prova Forms (peso 8) + Pesquisa Escrita (peso 2)', descricao: 'Mesma estrutura da V1. Média final >= 7,0 para aprovação.', dataLimite: '25/11/2026 (Qua)', dataISO: '2026-11-25', tipo: 'prova' },
    { id: 'e-pla-resumo', disciplinaId: 'disc-7', disciplina: 'Plantação e Revitalização II', titulo: 'AV1: Resumo Manuscrito — "A Treliça e a Videira" (12 pág.)', descricao: '1 página por capítulo (12 folhas). Enviar para thacyto@gmail.com. Prazo improrrogável.', dataLimite: '27/11/2026 (Sex)', dataISO: '2026-11-27', tipo: 'resumo' },
    { id: 'e-pla-av2', disciplinaId: 'disc-7', disciplina: 'Plantação e Revitalização II', titulo: 'AV2: Prova por Link (com consulta às anotações)', descricao: 'Prova online agendada para 27/11. Consulta livre às anotações pessoais.', dataLimite: '27/11/2026 (Sex)', dataISO: '2026-11-27', tipo: 'prova' },
    { id: 'e-tcc-artigo', disciplinaId: 'disc-8', disciplina: 'TCC I', titulo: 'Entrega Final: Artigo Científico Completo (máx. 20 pág.)', descricao: 'Sem IA. Ordem: Metodologia → Desenvolvimento → Conclusão → Resumo & Introdução por último. Referências ABNT em ordem alfabética.', dataLimite: '04/12/2026 (Sex)', dataISO: '2026-12-04', tipo: 'entrega' },
  ],
  requisitos: [
    {
      id: 'disc-1', num: '01', nome: 'História do Congregacionalismo', professor: 'Profº Ary Júnior', professorEmail: 'queiroz.aryjr@gmail.com',
      cor: 'text-amber-800', corFundo: 'bg-amber-50', corBorda: 'border-amber-300',
      regrasGerais: ['📷 Câmeras obrigatoriamente abertas durante toda a aula', '📅 16 encontros em 2 unidades: Unidade 1 (Congregacionalismo Mundial) e Unidade 2 (Congregacionalismo Brasileiro)', '📚 Leitura obrigatória dos textos indicados — verificada por autodeclaração na prova (+1 ponto)'],
      criteriosAvaliacao: ['✍️ AV1 e AV2: Provas escritas ao final de cada unidade — até 8 pontos', '👥 +1 ponto de frequência e participação ativa', '📖 +1 ponto pela leitura obrigatória (autodeclaração)', '🏆 Total: 10 pontos por avaliação'],
      livros: [{ titulo: 'Livro sobre Congregacionalismo (Origens)', autor: 'Profº Idauro Campos', tipo: 'obrigatorio' }, { titulo: 'Quem eram os Puritanos', autor: 'Erroll Hulse', tipo: 'recomendado' }, { titulo: 'Santos no Mundo', autor: 'Leland Ryken', tipo: 'recomendado' }, { titulo: 'Os Puritanos: suas origens e sucessores', autor: 'D. Martin Lloyd-Jones', tipo: 'recomendado' }, { titulo: 'A Verdadeira Natureza de uma Igreja Evangélica', autor: 'John Owen', tipo: 'recomendado' }],
    },
    {
      id: 'disc-2', num: '02', nome: 'História do Pensamento Cristão II', professor: 'Profº Hilário Bispo', professorEmail: 'hilario.graca@catolica.edu.br',
      cor: 'text-blue-800', corFundo: 'bg-blue-50', corBorda: 'border-blue-300',
      regrasGerais: ['📝 AV1: Trabalho acadêmico ABNT (individual ou grupos de até 3 alunos)', '📊 AV2: Prova objetiva com 10 questões Google Forms', '🎤 AV3 (apenas recuperação): Exame oral temático com o professor'],
      criteriosAvaliacao: ['📄 AV1: Pesquisa científica ABNT — Iluminismo & Modernidade (Razão vs Revelação)', '📱 AV2: 10 questões objetivas Google Forms — resultado instantâneo', '🗣️ AV3 (somente recuperação): Exame oral temático'],
      livros: [{ titulo: 'Material de aula (apostila)', autor: 'Profº Hilário Bispo', tipo: 'base' }],
      infoExtra: 'Temas centrais: Escolástica (Anselmo, Aquino), Nominalismo de Ockham, Humanismo Renascentista, Iluminismo (Kant), Liberalismo Teológico (Schleiermacher) e Ortodoxia Contemporânea.',
    },
    {
      id: 'disc-3', num: '03', nome: 'Aconselhamento Bíblico II', professor: 'Profº Uilian Santos', professorEmail: 'uiliansantos@gmail.com',
      cor: 'text-emerald-800', corFundo: 'bg-emerald-50', corBorda: 'border-emerald-300',
      regrasGerais: ['📋 Avaliação EXCLUSIVA por 2 provas objetivas Google Forms — sem trabalhos escritos', '🎯 Conteúdo RESTRITO aos slides apresentados em aula', '✅ Lista de presença ao final de cada aula'],
      criteriosAvaliacao: ['📱 AV1: Prova objetiva Google Forms — questões dos slides — correção automática', '📱 AV2: Prova objetiva Google Forms — questões dos slides — correção automática', '⚠️ Nenhum trabalho escrito é exigido'],
      livros: [{ titulo: 'Lutero como Conselheiro Espiritual', autor: 'Theodore Tappert', tipo: 'recomendado' }, { titulo: 'Aconselhamento Cristão', autor: 'Gary Collins', tipo: 'recomendado' }, { titulo: 'Aconselhamento a partir da Cruz', autor: 'Elyse Fitzpatrick', tipo: 'recomendado' }, { titulo: 'Ego Transformado', autor: 'Timothy Keller', tipo: 'recomendado' }],
    },
    {
      id: 'disc-4', num: '04', nome: 'Direitos Humanos', professor: 'Profº Cleiton Barbirato', professorEmail: 'cleitonpb@gmail.com',
      cor: 'text-indigo-800', corFundo: 'bg-indigo-50', corBorda: 'border-indigo-300',
      regrasGerais: [
        '📊 V1 e V2: Prova objetiva Forms (peso 8) + Trabalho de pesquisa individual (peso 2)',
        '✍️ AV1: Dissertação de no máx. 1 lauda sobre Desigualdade Social e Privilégios (Times New Roman 12, esp. 1,5)',
        '📧 Envio obrigatório para cleitonpb@gmail.com com assunto "Trabalho para composição de nota" até 30/09/2026',
        '🚫 Prova objetiva: sem consulta (peso 8,0)',
        '🎯 Média >= 7,0 para aprovação direta; abaixo, prova extra (recuperação)'
      ],
      criteriosAvaliacao: [
        '📱 Prova objetiva múltipla escolha Google Forms — peso 8,0 — sem consulta',
        '✍️ Trabalho dissertativo individual de até 1 lauda (Desigualdade Social, Privilégios e a Igreja como agente transformador) — peso 2,0 — prazo improrrogável 30/09/2026',
        '🏆 Média V1 e V2 >= 7,0 para aprovação direta'
      ],
      livros: [{ titulo: 'E se Jesus não tivesse nascido', autor: 'D. James Kennedy & Jerry Newcombe', tipo: 'obrigatorio' }],
      infoExtra: 'Textos e slides gratuitos disponíveis na pasta virtual da disciplina no Google Drive.',
    },
    {
      id: 'disc-5', num: '05', nome: 'Ética Cristã', professor: 'Profª Karoline Evangelista', professorEmail: 'karoline.leite@gmail.com',
      cor: 'text-violet-800', corFundo: 'bg-violet-50', corBorda: 'border-violet-300',
      regrasGerais: ['👥 Apresentações em grupos de 3 a 4 alunos (duplas/trios segundo o documento original)', '📅 Período: 22/10 a 19/11/2026', '⏱️ 30 minutos por grupo — 10 minutos EXATOS por orador (cronômetro)', '🎯 Nota INDIVIDUAL — cada aluno é avaliado de forma independente'],
      criteriosAvaliacao: ['📊 AV1: Pesquisa teológica + confecção coletiva dos slides (nota individual)', '🗣️ AV2: Desempenho individual na tribuna de apresentação', '📖 Base: Catecismo Maior de Westminster — seção dos Dez Mandamentos'],
      livros: [{ titulo: 'Ética Cristã: Opções e Questões Contemporâneas', autor: 'Norman Geisler', tipo: 'base' }, { titulo: 'Catecismo Maior de Westminster', autor: 'Westminster Assembly (1648)', tipo: 'obrigatorio' }],
    },
    {
      id: 'disc-6', num: '06', nome: 'NT III — Epístolas Gerais', professor: 'Profº Marcio Leal', professorEmail: 'marcio.leal@uiecbead.com.br',
      cor: 'text-rose-800', corFundo: 'bg-rose-50', corBorda: 'border-rose-300',
      regrasGerais: ['📷 Câmeras obrigatoriamente ligadas — flexibilidade no horário de encerramento', '📝 Slides são INTENCIONALMENTE SINTÉTICOS para forçar anotações manuais', '✏️ Faça anotações detalhadas — as provas são baseadas nelas'],
      criteriosAvaliacao: ['📱 Exames objetivos via Google Forms', '📚 Carga de 150 questões discursivas/orais baseadas no livro-base e slides'],
      livros: [{ titulo: 'Introdução ao Novo Testamento', autor: 'Carson, Moo & Morris', tipo: 'base' }],
      infoExtra: 'Abrange: Hebreus, Tiago, 1 e 2 Pedro, 1, 2 e 3 João, e Judas.',
    },
    {
      id: 'disc-7', num: '07', nome: 'Plantação e Revitalização de Igrejas II', professor: 'Profº Thácyto Lessa', professorEmail: 'thacyto@gmail.com',
      cor: 'text-orange-800', corFundo: 'bg-orange-50', corBorda: 'border-orange-300',
      regrasGerais: ['⏰ Início pontual às 19:00 — sem atrasos', '📷 Câmeras obrigatoriamente ligadas (avaliadas para presença/participação)', '🔒 Slides NÃO são liberados até a aula final de revisão', '📧 AV1: Enviar resumo para thacyto@gmail.com até 27/11/2026 (improrrogável)'],
      criteriosAvaliacao: ['📖 AV1: Resumo individual MANUSCRITO de "A Treliça e a Videira" — 1 pág./cap. (12 folhas) — entrega 27/11', '📱 AV2: Prova online (link) com consulta às anotações pessoais — 27/11/2026'],
      livros: [{ titulo: 'A Treliça e a Videira', autor: 'Colin Marshall & Tony Payne', tipo: 'obrigatorio' }],
      infoExtra: 'ATENÇÃO: O resumo manuscrito é OBRIGATÓRIO: caneta, papel, 1 página por capítulo, 12 capítulos = 12 folhas. Enviar por e-mail até 27/11.',
    },
    {
      id: 'disc-8', num: '08', nome: 'TCC I', professor: 'Profª Gabriela Leal', professorEmail: 'gabriela.leal@uiecbead.com.br',
      cor: 'text-teal-800', corFundo: 'bg-teal-50', corBorda: 'border-teal-300',
      regrasGerais: ['💬 Grupo WhatsApp oficial: "TCC1 - segundo semestre 2026"', '🏫 Normas: Faculdade Maciço do Baturité (UNIMB)', '📄 Extensão máxima: 20 páginas (Capa até Anexos)', '🚫 USO DE IA É TERMINANTEMENTE PROIBIDO (apenas correção ortográfica e formatação técnica externa são liberadas)', '👨‍🏫 Orientador escolhido por afinidade temática'],
      criteriosAvaliacao: ['📋 Sem provas tradicionais — avaliação contínua de participação e progresso', '🗓️ Etapa 1: Projeto de Pesquisa estruturado — prazo 04/09/2026', '📝 Etapa Final: Artigo científico completo — prazo 04/12/2026'],
      livros: [{ titulo: 'Manual de Metodologia Científica (consultar com orientador)', autor: 'A definir', tipo: 'recomendado' }],
      infoExtra: 'Ordem de escrita obrigatória:\n1º Metodologia (começar imediatamente)\n2º Referencial Teórico e Desenvolvimento\n3º Conclusão\n4º Resumo e Introdução (escrever POR ÚLTIMO, após concluir o artigo)\n\nReferências ABNT: somente obras citadas no texto, em ordem alfabética.',
      whatsapp: 'TCC1 - segundo semestre 2026',
    },
  ],
};

const INITIAL_TURMA_B: PlanoEstudosTurma = {
  entregaveis: [
    { id: 'e-tb-int-av1', disciplinaId: 'disc-b1', disciplina: 'Introdução ao Novo Testamento', titulo: 'AV1: Prova Escrita — Contexto Histórico e Canonicidade', descricao: 'Avaliação sobre formação do cânon e evangelhos sinóticos.', dataLimite: '29/09/2026 (Ter)', dataISO: '2026-09-29', tipo: 'prova' },
    { id: 'e-tb-her-av1', disciplinaId: 'disc-b2', disciplina: 'Hermenêutica Bíblica', titulo: 'AV1: Trabalho de Exegese e Interpretação de Texto', descricao: 'Aplicação dos princípios hermenêuticos histórico-gramaticais.', dataLimite: '30/09/2026 (Qua)', dataISO: '2026-09-30', tipo: 'trabalho' },
    { id: 'e-tb-dis-av1', disciplinaId: 'disc-b3', disciplina: 'Fundamentos e Prática do Discipulado', titulo: 'AV1: Projeto de Discipulado na Igreja Local', descricao: 'Elaboração de um guia prático de mentoria e acompanhamento espiritual.', dataLimite: '01/10/2026 (Qui)', dataISO: '2026-10-01', tipo: 'entrega' },
    { id: 'e-tb-mis-av1', disciplinaId: 'disc-b4', disciplina: 'Teologia da Missão', titulo: 'AV1: Resenha Crítica de Missiologia Contemporânea', descricao: 'Análise teológica dos desafios missionários urbanos e transculturais.', dataLimite: '02/10/2026 (Sex)', dataISO: '2026-10-02', tipo: 'resumo' },
    { id: 'e-tb-int-av2', disciplinaId: 'disc-b1', disciplina: 'Introdução ao Novo Testamento', titulo: 'AV2: Prova Objetiva Final — Cartas Paulinas e Gerais', descricao: 'Prova final via Google Forms abrangendo todo o conteúdo semestral.', dataLimite: '24/11/2026 (Ter)', dataISO: '2026-11-24', tipo: 'prova' },
    { id: 'e-tb-her-av2', disciplinaId: 'disc-b2', disciplina: 'Hermenêutica Bíblica', titulo: 'AV2: Prova Prática de Interpretação', descricao: 'Análise e resolução de passagens bíblicas complexas.', dataLimite: '25/11/2026 (Qua)', dataISO: '2026-11-25', tipo: 'prova' },
    { id: 'e-tb-ts-av2', disciplinaId: 'disc-b5', disciplina: 'Teologia Sistemática III', titulo: 'AV2: Artigo de Cristologia e Pneumatologia', descricao: 'Síntese doutrinária das naturezas de Cristo e obra do Espírito Santo.', dataLimite: '26/11/2026 (Qui)', dataISO: '2026-11-26', tipo: 'entrega' },
    { id: 'e-tb-hom-av2', disciplinaId: 'disc-b6', disciplina: 'Homilética II', titulo: 'AV2: Pregação Expositiva em Vídeo', descricao: 'Gravação e entrega de sermão expositivo estruturado.', dataLimite: '27/11/2026 (Sex)', dataISO: '2026-11-27', tipo: 'apresentacao' },
  ],
  requisitos: [
    {
      id: 'disc-b1', num: '01', nome: 'Introdução ao Novo Testamento', professor: 'Profº Ary Júnior', professorEmail: 'queiroz.aryjr@gmail.com',
      cor: 'text-amber-800', corFundo: 'bg-amber-50', corBorda: 'border-amber-300',
      regrasGerais: ['📷 Câmeras ligadas durante toda a aula', '📅 Leitura obrigatória de artigos e sínteses exegéticas'],
      criteriosAvaliacao: ['✍️ AV1 e AV2: Provas escritas e participação ativa'],
      livros: [{ titulo: 'Introdução ao Novo Testamento', autor: 'D. A. Carson & Douglas J. Moo', tipo: 'base' }],
    },
    {
      id: 'disc-b2', num: '02', nome: 'Hermenêutica Bíblica', professor: 'Profº Hilário Bispo', professorEmail: 'hilario.graca@catolica.edu.br',
      cor: 'text-blue-800', corFundo: 'bg-blue-50', corBorda: 'border-blue-300',
      regrasGerais: ['📝 Exercícios exegéticos semanais', '🎯 Foco na interpretação literal histórico-gramatical'],
      criteriosAvaliacao: ['📄 AV1: Trabalho de análise de texto', '📱 AV2: Prova prática'],
      livros: [{ titulo: 'Entendes o que Lês?', autor: 'Gordon Fee & Douglas Stuart', tipo: 'obrigatorio' }],
    },
    {
      id: 'disc-b3', num: '03', nome: 'Fundamentos e Prática do Discipulado', professor: 'Profº Uilian Santos', professorEmail: 'uiliansantos@gmail.com',
      cor: 'text-emerald-800', corFundo: 'bg-emerald-50', corBorda: 'border-emerald-300',
      regrasGerais: ['📋 Exercícios práticos na igreja local', '✅ Presença e pontualidade nas transmissões'],
      criteriosAvaliacao: ['📱 Provas objetivas e plano de discipulado prático'],
      livros: [{ titulo: 'O Plano Mestre de Evangelismo', autor: 'Robert Coleman', tipo: 'obrigatorio' }],
    },
    {
      id: 'disc-b4', num: '04', nome: 'Teologia da Missão', professor: 'Profº Cleiton Barbirato', professorEmail: 'cleitonpb@gmail.com',
      cor: 'text-indigo-800', corFundo: 'bg-indigo-50', corBorda: 'border-indigo-300',
      regrasGerais: ['📊 Leituras missiológicas e debates', '📧 Trabalhos enviados por e-mail'],
      criteriosAvaliacao: ['✍️ Resenha crítica e prova objetiva'],
      livros: [{ titulo: 'A Missão da Igreja Hoje', autor: 'Michael Green', tipo: 'recomendado' }],
    },
  ],
};

const INITIAL_FDS: PlanoEstudosTurma = {
  entregaveis: [
    { id: 'e-fds-at-av1', disciplinaId: 'disc-fds-1', disciplina: 'Antigo Testamento I — Pentateuco', titulo: 'AV1: Prova Escrita — Alianças e Lei Mosaica', descricao: 'Avaliação das narrativas de Gênesis a Deuteronômio.', dataLimite: '03/10/2026 (Sáb)', dataISO: '2026-10-03', tipo: 'prova' },
    { id: 'e-fds-edu-av1', disciplinaId: 'disc-fds-2', disciplina: 'Educação Cristã', titulo: 'AV1: Plano Pedagógico para Escola Bíblica', descricao: 'Elaboração de currículo e didática para igreja local.', dataLimite: '04/10/2026 (Dom)', dataISO: '2026-10-04', tipo: 'trabalho' },
    { id: 'e-fds-at-av2', disciplinaId: 'disc-fds-1', disciplina: 'Antigo Testamento I — Pentateuco', titulo: 'AV2: Prova Final de Teologia do Pentateuco', descricao: 'Exame online e síntese temática.', dataLimite: '28/11/2026 (Sáb)', dataISO: '2026-11-28', tipo: 'prova' },
  ],
  requisitos: [
    {
      id: 'disc-fds-1', num: '01', nome: 'Antigo Testamento I (Pentateuco)', professor: 'Profº Ary Júnior', professorEmail: 'queiroz.aryjr@gmail.com',
      cor: 'text-amber-800', corFundo: 'bg-amber-50', corBorda: 'border-amber-300',
      regrasGerais: ['📷 Câmeras ligadas aos sábados e domingos', '📚 Leitura integral do Pentateuco'],
      criteriosAvaliacao: ['✍️ Provas escritas e trabalhos temáticos'],
      livros: [{ titulo: 'Panorama do Antigo Testamento', autor: 'William Sanford LaSor', tipo: 'base' }],
    },
  ],
};

const INITIAL_BASICO: PlanoEstudosTurma = {
  entregaveis: [
    { id: 'e-bas-pan-av1', disciplinaId: 'disc-bas-1', disciplina: 'Panorama Bíblico', titulo: 'AV1: Prova Objetiva — Linha do Tempo Bíblica', descricao: 'Avaliação das grandes épocas da história bíblica.', dataLimite: '29/09/2026 (Ter)', dataISO: '2026-09-29', tipo: 'prova' },
    { id: 'e-bas-dout-av1', disciplinaId: 'disc-bas-2', disciplina: 'Doutrinas Fundamentais', titulo: 'AV1: Questionário Doutrinário', descricao: 'Respostas fundamentadas sobre os pilares da fé cristã.', dataLimite: '30/09/2026 (Qua)', dataISO: '2026-09-30', tipo: 'trabalho' },
    { id: 'e-bas-pan-av2', disciplinaId: 'disc-bas-1', disciplina: 'Panorama Bíblico', titulo: 'AV2: Exame Final de Panorama Bíblico', descricao: 'Exame de conclusão da disciplina.', dataLimite: '24/11/2026 (Ter)', dataISO: '2026-11-24', tipo: 'prova' },
  ],
  requisitos: [
    {
      id: 'disc-bas-1', num: '01', nome: 'Panorama Bíblico', professor: 'Profº Ary Júnior', professorEmail: 'queiroz.aryjr@gmail.com',
      cor: 'text-amber-800', corFundo: 'bg-amber-50', corBorda: 'border-amber-300',
      regrasGerais: ['📅 Aulas às terças e quartas-feiras', '📝 Leitura diária da Bíblia'],
      criteriosAvaliacao: ['✍️ Provas de verificação e questionários'],
      livros: [{ titulo: 'Bíblia de Estudo', autor: 'Vários', tipo: 'obrigatorio' }],
    },
  ],
};

function getInitialDataForTurma(turmaIdx: number): PlanoEstudosTurma {
  switch (turmaIdx) {
    case 0:
      return INITIAL_FDS;
    case 2:
      return INITIAL_TURMA_B;
    case 3:
      return INITIAL_BASICO;
    case 1:
    default:
      return INITIAL_TURMA_A;
  }
}

export function getPlanoEstudosForTurma(turmaIdx: number): PlanoEstudosTurma {
  const initial = getInitialDataForTurma(turmaIdx);
  if (typeof window === 'undefined') return initial;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${turmaIdx}`);
    if (!raw) {
      localStorage.setItem(`${STORAGE_PREFIX}${turmaIdx}`, JSON.stringify(initial));
      return initial;
    }
    const parsed: PlanoEstudosTurma = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entregaveis) || !Array.isArray(parsed.requisitos)) {
      return initial;
    }
    // Sincroniza entregáveis e requisitos oficiais atualizados
    let changed = false;
    const updatedEntregaveis = parsed.entregaveis.map((item) => {
      const initMatch = initial.entregaveis.find((ie) => ie.id === item.id);
      if (initMatch && !item.isCustomStudentItem && item.descricao !== initMatch.descricao) {
        changed = true;
        return { ...item, titulo: initMatch.titulo, descricao: initMatch.descricao, dataLimite: initMatch.dataLimite, dataISO: initMatch.dataISO, tipo: initMatch.tipo };
      }
      return item;
    });
    const updatedRequisitos = initial.requisitos.map((initReq) => {
      const existing = parsed.requisitos.find((r) => r.id === initReq.id);
      if (existing && JSON.stringify(existing.criteriosAvaliacao) !== JSON.stringify(initReq.criteriosAvaliacao)) {
        changed = true;
        return { ...existing, regrasGerais: initReq.regrasGerais, criteriosAvaliacao: initReq.criteriosAvaliacao };
      }
      return existing || initReq;
    });

    if (changed) {
      const merged: PlanoEstudosTurma = { ...parsed, entregaveis: updatedEntregaveis, requisitos: updatedRequisitos };
      localStorage.setItem(`${STORAGE_PREFIX}${turmaIdx}`, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (e) {
    console.error('Erro ao ler plano de estudos do storage:', e);
    return initial;
  }
}

export function savePlanoEstudosForTurma(turmaIdx: number, data: PlanoEstudosTurma): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${turmaIdx}`, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('lms_plano_estudos_updated', { detail: { turmaIdx, data } }));
  } catch (e) {
    console.error('Erro ao salvar plano de estudos:', e);
  }
}

export function addOrUpdateEntregavel(turmaIdx: number, item: Entregavel): void {
  const current = getPlanoEstudosForTurma(turmaIdx);
  const exists = current.entregaveis.some((e) => e.id === item.id);
  const nextEntregaveis = exists
    ? current.entregaveis.map((e) => (e.id === item.id ? { ...e, ...item } : e))
    : [{ ...item, id: item.id || `e-${Date.now()}` }, ...current.entregaveis];

  savePlanoEstudosForTurma(turmaIdx, { ...current, entregaveis: nextEntregaveis });
}

export function deleteEntregavel(turmaIdx: number, itemId: string): void {
  const current = getPlanoEstudosForTurma(turmaIdx);
  const nextEntregaveis = current.entregaveis.filter((e) => e.id !== itemId);
  savePlanoEstudosForTurma(turmaIdx, { ...current, entregaveis: nextEntregaveis });
}

export function updateRequisitosDisciplina(
  turmaIdx: number,
  disciplinaId: string,
  patch: Partial<RequisitosDisciplina>
): void {
  const current = getPlanoEstudosForTurma(turmaIdx);
  const nextRequisitos = current.requisitos.map((r) =>
    r.id === disciplinaId ? { ...r, ...patch } : r
  );
  savePlanoEstudosForTurma(turmaIdx, { ...current, requisitos: nextRequisitos });
}
