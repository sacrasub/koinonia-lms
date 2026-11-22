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
  arquivado?: boolean;
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

const STORAGE_PREFIX = 'lms_plano_estudos_turma_v2026_2_av2_oficial_';

// ============================================================
// DADOS INICIAIS POR TURMA
// ============================================================

const INITIAL_TURMA_A: PlanoEstudosTurma = {
  entregaveis: [
    { id: 'e-tcc-projeto', disciplinaId: 'disc-8', disciplina: 'TCC I', titulo: 'Projeto de Pesquisa Estruturado ABNT', descricao: 'Estrutura: Capa, Sumário, Objetivos (geral + 2-3 específicos), Justificativa, Referencial Teórico, Cronograma. Linguagem científica impessoal. Proibido uso de IA.', dataLimite: '04/09/2026 (Sex)', dataISO: '2026-09-04', tipo: 'entrega', arquivado: true },
    { id: 'e-his-av1', disciplinaId: 'disc-1', disciplina: 'História do Congregacionalismo', titulo: 'AV1: Prova Escrita — Unidade 1 (Congregacionalismo Mundial)', descricao: '0-8 pts prova + 1 pt frequência + 1 pt leitura obrigatória. Câmeras obrigatórias.', dataLimite: '29/09/2026 (Ter)', dataISO: '2026-09-29', tipo: 'prova', arquivado: true },
    { id: 'e-hpc-av1', disciplinaId: 'disc-2', disciplina: 'História do Pensamento Cristão II', titulo: 'AV1: Trabalho Acadêmico ABNT — Iluminismo & Modernidade', descricao: 'Pesquisa sob normas ABNT. Individual ou grupos de até 3 alunos.', dataLimite: '29/09/2026 (Ter)', dataISO: '2026-09-29', tipo: 'trabalho', arquivado: true },
    { id: 'e-aco-av1', disciplinaId: 'disc-3', disciplina: 'Aconselhamento Bíblico II', titulo: 'AV1: Prova Objetiva via Google Forms', descricao: 'Questões estritamente dos slides. Sem trabalhos escritos. Correção automática.', dataLimite: '30/09/2026 (Qua)', dataISO: '2026-09-30', tipo: 'prova', arquivado: true },
    { id: 'e-dir-trabalho-av1', disciplinaId: 'disc-4', disciplina: 'Direitos Humanos', titulo: 'Trabalho Dissertativo AV1: Desigualdade Social & Privilégios (peso 2)', descricao: 'Redigir dissertação de até 1 lauda: "Desigualdade social e privilégios conforme vídeo da aula de 26/09/2026. Discutir a importância da igreja como agente de transformação social". Formatação: Times New Roman 12, esp. 1,5. Enviar para cleitonpb@gmail.com com assunto "Trabalho para composição de nota". Prazo encerrado: 30/09/2026 às 23:59. Valor: 2,0 pts.', dataLimite: '30/09/2026 (Qua)', dataISO: '2026-09-30', tipo: 'trabalho', arquivado: true },
    { id: 'e-nt-av1', disciplinaId: 'disc-6', disciplina: 'NT III — Epístolas Gerais', titulo: 'AV1: Prova Objetiva via Google Forms (Hebreus a 2 Pedro)', descricao: 'Prova Objetiva Online via formulário Google Forms cobrindo as Epístolas de Hebreus, Tiago, 1 Pedro e 2 Pedro. Concluído.', dataLimite: '01/10/2026 (Qui)', dataISO: '2026-10-01', tipo: 'prova', arquivado: true },
    { id: 'e-dir-prova-av1', disciplinaId: 'disc-4', disciplina: 'Direitos Humanos', titulo: 'Prova Objetiva AV1 via Google Forms (Concluída)', descricao: 'Prova objetiva sem consulta via Google Forms aplicada na 1ª unidade. Valor: 8,0 pts. Concluído.', dataLimite: '04/10/2026 (Dom)', dataISO: '2026-10-04', tipo: 'prova', arquivado: true },
    { id: 'e-etc-seminario', disciplinaId: 'disc-5', disciplina: 'Ética Cristã', titulo: 'Seminários em Grupo — Dez Mandamentos (Concluídos)', descricao: 'Seminários Práticos em Grupo baseados no Catecismo Maior de Westminster e Norman Geisler (22/10 a 19/11). Nota individual integralizada para AV1/AV2.', dataLimite: '22/10 – 19/11/2026', dataISO: '2026-10-22', tipo: 'apresentacao' },
    { id: 'e-dam-exame', disciplinaId: 'disc-dam', disciplina: 'Exame DAM / UIECB', titulo: 'Exame DAM / UIECB — Prova Presencial (Concluído)', descricao: 'Avaliação denominacional presencial oficial da UIECB realizada em 07/11/2026.', dataLimite: '07/11/2026 (Sáb)', dataISO: '2026-11-07', tipo: 'prova' },
    { id: 'e-his-av2', disciplinaId: 'disc-1', disciplina: 'História do Congregacionalismo', titulo: 'AV2: Prova V/F (10 Afirmações) — Congregacionalismo no Brasil', descricao: '19:00–20:25 BRT (17:00–18:25 Tabatinga). 10 afirmações V/F: 2 primeiras de autodeclaração de participação e leitura dos 3 textos (2,0 pts) + 8 de conteúdo (8,0 pts). Sem consulta, câmeras abertas, sem trabalho extra.', dataLimite: '24/11/2026 (Ter)', dataISO: '2026-11-24', tipo: 'prova' },
    { id: 'e-hpc-av2', disciplinaId: 'disc-2', disciplina: 'História do Pensamento Cristão II', titulo: 'AV2: Prova Objetiva 10 Questões — Google Forms', descricao: '20:35–22:00 BRT (18:35–20:00 Tabatinga). 10 questões via Forms (1,0 pt cada), sem consulta, correção imediata. Sem trabalho na AV2.', dataLimite: '24/11/2026 (Ter)', dataISO: '2026-11-24', tipo: 'prova' },
    { id: 'e-aco-av2', disciplinaId: 'disc-3', disciplina: 'Aconselhamento Bíblico II', titulo: 'AV2: Prova Objetiva Final — Google Forms', descricao: '19:00–20:25 BRT (17:00–18:25 Tabatinga). Questões estritamente dos slides da Unidade 2 no Drive. Correção automática, sem trabalho escrito.', dataLimite: '25/11/2026 (Qua)', dataISO: '2026-11-25', tipo: 'prova' },
    { id: 'e-dir-av2', disciplinaId: 'disc-4', disciplina: 'Direitos Humanos', titulo: 'AV2: Prova Forms Peso 10 (Trabalho Cancelado • 52 Slides)', descricao: 'Janela 19:00–23:59 BRT (17:00–21:59 Tabatinga). Trabalho escrito de 2 pts CANCELADO: 10 questões no Forms valem 10,0 pontos integrais, sem consulta, 100% dos 52 slides pós-AV1.', dataLimite: '25/11/2026 (Qua)', dataISO: '2026-11-25', tipo: 'prova' },
    { id: 'e-etc-av2', disciplinaId: 'disc-5', disciplina: 'Ética Cristã', titulo: 'AV2: Encerramento & Conferência de Notas (Sem Prova Escrita)', descricao: '19:00–20:25 BRT (17:00–18:25 Tabatinga). NÃO haverá prova escrita na AV2; nota semestral 100% integralizada nos Seminários dos Dez Mandamentos.', dataLimite: '26/11/2026 (Qui)', dataISO: '2026-11-26', tipo: 'apresentacao' },
    { id: 'e-nt-av2', disciplinaId: 'disc-6', disciplina: 'NT III — Epístolas Gerais', titulo: 'AV2: Prova Objetiva 10 Questões — Google Forms', descricao: '20:35–22:00 BRT (18:35–20:00 Tabatinga). 10 questões objetivas via Google Forms, sem consulta, baseadas nos slides e Carson/Moo/Morris.', dataLimite: '26/11/2026 (Qui)', dataISO: '2026-11-26', tipo: 'prova' },
    { id: 'e-pla-resumo', disciplinaId: 'disc-7', disciplina: 'Plantação e Revitalização II', titulo: 'AV2: Prova com Consulta Livre (19h) + Resumo 12 pág (até 23:59)', descricao: 'Dupla atividade em 27/11: Prova AV2 às 19:00 BRT com CONSULTA LIVRE aos slides, anotações e PDF consolidado + Resumo digitado de 12 páginas (PDF ou Word) de "A Treliça e a Videira" enviado para thacyto@gmail.com até 23:59.', dataLimite: '27/11/2026 (Sex)', dataISO: '2026-11-27', tipo: 'resumo' },
    { id: 'e-afro-av2', disciplinaId: 'disc-9', disciplina: 'História e Cultura Afro-Brasileira e Indígena (AFR-101)', titulo: 'AV2 (Avaliação Única): Trabalho Final Aplicado (2 laudas • Sem Prova)', descricao: 'Disciplina modular gravada (4 videoaulas ~1h20 cada, sem prova escrita). Produção individual de exatamente 2 laudas em 3 partes (contextualização de situação-problema étnico-racial, análise com Bíblia + mínimo 2 autores do curso e proposta de ação pastoral/eclesial). Enviar exclusivamente para prof.alexsandro@gmail.com até 28/11/2026.', dataLimite: '28/11/2026 (Sáb)', dataISO: '2026-11-28', tipo: 'trabalho' },
    { id: 'e-tcc-artigo', disciplinaId: 'disc-8', disciplina: 'TCC I', titulo: 'Entrega Final: Artigo Científico Completo (20 a 25 pág.)', descricao: 'Até 23:59 BRT. Artigo completo ABNT / FMB (20 a 25 páginas da capa às referências), impessoal (3ª pessoa), PDF e Word, rigorosamente sem IA ou plágio.', dataLimite: '04/12/2026 (Sex)', dataISO: '2026-12-04', tipo: 'entrega' },
  ],
  requisitos: [
    {
      id: 'disc-1', num: '01', nome: 'História do Congregacionalismo', professor: 'Profº Ary Júnior', professorEmail: 'queiroz.aryjr@gmail.com',
      cor: 'text-amber-800', corFundo: 'bg-amber-50', corBorda: 'border-amber-300',
      regrasGerais: ['📷 Câmeras obrigatoriamente abertas durante toda a aula', '📅 Unidade 2 (AV2 — 24/11 às 19h): Congregacionalismo Brasileiro & 28 Artigos', '📚 Leitura obrigatória dos 3 textos indicados no WhatsApp — verificada por autodeclaração na prova (+2,0 pts)'],
      criteriosAvaliacao: ['✍️ AV2 (24/11): 10 afirmações V/F (2 autodeclaração + 8 conteúdo, sem consulta)', '✅ AV1 (Concluída): Prova escrita Unidade 1 (até 8 pts) + participação e leitura', '🏆 Total: 10 pontos por avaliação'],
      livros: [{ titulo: 'Livro sobre Congregacionalismo (Origens)', autor: 'Profº Idauro Campos', tipo: 'obrigatorio' }, { titulo: 'Quem eram os Puritanos', autor: 'Erroll Hulse', tipo: 'recomendado' }, { titulo: 'Santos no Mundo', autor: 'Leland Ryken', tipo: 'recomendado' }, { titulo: 'Os Puritanos: suas origens e sucessores', autor: 'D. Martin Lloyd-Jones', tipo: 'recomendado' }, { titulo: 'A Verdadeira Natureza de uma Igreja Evangélica', autor: 'John Owen', tipo: 'recomendado' }],
    },
    {
      id: 'disc-2', num: '02', nome: 'História do Pensamento Cristão II', professor: 'Profº Hilário Bispo', professorEmail: 'hilario.graca@catolica.edu.br',
      cor: 'text-blue-800', corFundo: 'bg-blue-50', corBorda: 'border-blue-300',
      regrasGerais: ['📊 AV2 (24/11 às 20h35): Prova objetiva com 10 questões Google Forms (sem consulta)', '✅ AV1 (Concluída): Trabalho acadêmico ABNT (Iluminismo & Modernidade)', '🎤 AV3 (apenas recuperação): Exame oral temático com o professor'],
      criteriosAvaliacao: ['📱 AV2: 10 questões objetivas Google Forms — resultado instantâneo', '✅ AV1 (Concluída): Pesquisa científica ABNT — Iluminismo & Modernidade', '🗣️ AV3 (somente recuperação): Exame oral temático'],
      livros: [{ titulo: 'Material de aula (apostila)', autor: 'Profº Hilário Bispo', tipo: 'base' }],
      infoExtra: 'Temas centrais: Escolástica (Anselmo, Aquino), Nominalismo de Ockham, Humanismo Renascentista, Iluminismo (Kant), Liberalismo Teológico (Schleiermacher) e Ortodoxia Contemporânea.',
    },
    {
      id: 'disc-3', num: '03', nome: 'Aconselhamento Bíblico II', professor: 'Profº Uilian Santos', professorEmail: 'uiliansantos@gmail.com',
      cor: 'text-emerald-800', corFundo: 'bg-emerald-50', corBorda: 'border-emerald-300',
      regrasGerais: ['📋 Avaliação EXCLUSIVA por provas objetivas Google Forms — sem trabalhos escritos', '🎯 Conteúdo AV2 (25/11 às 19h): RESTRITO aos slides da Unidade 2 no Drive', '✅ Lista de presença ao final de cada aula'],
      criteriosAvaliacao: ['📱 AV2 (25/11): Prova objetiva Google Forms — questões dos slides U2 — correção automática', '✅ AV1 (Concluída): Prova objetiva Google Forms — Unidade 1', '⚠️ Nenhum trabalho escrito é exigido'],
      livros: [{ titulo: 'Lutero como Conselheiro Espiritual', autor: 'Theodore Tappert', tipo: 'recomendado' }, { titulo: 'Aconselhamento Cristão', autor: 'Gary Collins', tipo: 'recomendado' }, { titulo: 'Aconselhamento a partir da Cruz', autor: 'Elyse Fitzpatrick', tipo: 'recomendado' }, { titulo: 'Ego Transformado', autor: 'Timothy Keller', tipo: 'recomendado' }],
    },
    {
      id: 'disc-4', num: '04', nome: 'Direitos Humanos', professor: 'Profº Cleiton Barbirato', professorEmail: 'cleitonpb@gmail.com',
      cor: 'text-indigo-800', corFundo: 'bg-indigo-50', corBorda: 'border-indigo-300',
      regrasGerais: [
        '⚠️ AV2 (25/11, 19:00–23:59 BRT): Trabalho escrito CANCELADO! Prova objetiva vale 10,0 pontos integrais',
        '📚 Base da AV2: 100% extraída do arquivo consolidado de 52 slides pós-AV1 no Drive',
        '🚫 Prova objetiva: 10 questões no Google Forms sem consulta',
        '🎯 Média >= 7,0 para aprovação direta; abaixo, prova extra (recuperação)'
      ],
      criteriosAvaliacao: [
        '📱 AV2 (25/11): Prova objetiva múltipla escolha Google Forms — 10 questões valendo 10,0 pontos integrais — sem consulta',
        '✅ V1 concluída: Prova Forms (8,0) + Trabalho dissertativo 1 lauda (2,0)',
        '🏆 Média V1 e V2 >= 7,0 para aprovação direta'
      ],
      livros: [{ titulo: 'E se Jesus não tivesse nascido', autor: 'D. James Kennedy & Jerry Newcombe', tipo: 'obrigatorio' }],
      infoExtra: 'AV2 (25/11/2026, janela 19:00–23:59 BRT): Trabalho complementar cancelado pelo professor; prova vale 10,0 pts com base nos 52 slides pós-AV1.',
    },
    {
      id: 'disc-5', num: '05', nome: 'Ética Cristã', professor: 'Profª Karoline Evangelista', professorEmail: 'karoline.leite@gmail.com',
      cor: 'text-violet-800', corFundo: 'bg-violet-50', corBorda: 'border-violet-300',
      regrasGerais: [
        '⚠️ NÃO HAVERÁ PROVA ESCRITA NA AV2 (26/11 às 19:00 é aula de encerramento e conferência de notas)',
        '👥 Nota semestral 100% integralizada nos Seminários Práticos dos Dez Mandamentos (22/10 a 19/11)',
        '🎯 Nota ESTREITAMENTE INDIVIDUAL — oratória, domínio do tema e slides'
      ],
      criteriosAvaliacao: [
        '📊 Seminários Práticos em Grupo sobre os Dez Mandamentos (Catecismo Maior de Westminster e Norman Geisler)',
        '✅ Nota semestral 100% integralizada nas apresentações',
        '📋 26/11/2026: Devolutiva final e conferência de notas ao vivo'
      ],
      livros: [{ titulo: 'Ética Cristã: Opções e Questões Contemporâneas', autor: 'Norman Geisler', tipo: 'base' }, { titulo: 'Catecismo Maior de Westminster', autor: 'Westminster Assembly (1648)', tipo: 'obrigatorio' }],
    },
    {
      id: 'disc-6', num: '06', nome: 'NT III — Epístolas Gerais', professor: 'Profº Marcio Leal', professorEmail: 'marcio.leal@uiecbead.com.br',
      cor: 'text-rose-800', corFundo: 'bg-rose-50', corBorda: 'border-rose-300',
      regrasGerais: [
        '📱 AV2 (26/11 às 20:35 BRT): Prova Objetiva Online via Google Forms — 10 questões (10,0 pts)',
        '🚫 Prova individual sem consulta',
        '📖 Conteúdo Cobrado: 1 e 2 Pedro, Judas, 1, 2 e 3 João (além de Hebreus e Tiago)'
      ],
      criteriosAvaliacao: [
        '📱 Prova Objetiva Online via Google Forms (10 questões x 1,0 pt)',
        '📚 Base: Slides do docente + Introdução ao Novo Testamento (Carson, Moo & Morris)'
      ],
      livros: [{ titulo: 'Introdução ao Novo Testamento', autor: 'Carson, Moo & Morris', tipo: 'base' }],
      infoExtra: 'Abrange: Hebreus, Tiago, 1 e 2 Pedro, 1, 2 e 3 João, e Judas.',
    },
    {
      id: 'disc-7', num: '07', nome: 'Plantação e Revitalização de Igrejas II', professor: 'Profº Thácyto Lessa', professorEmail: 'thacyto@gmail.com',
      cor: 'text-orange-800', corFundo: 'bg-orange-50', corBorda: 'border-orange-300',
      regrasGerais: [
        '⏰ Data decisiva 27/11/2026: Prova AV2 a partir das 19:00 BRT',
        '✅ PROVA AV2 COM CONSULTA LIVRE E ABERTA aos slides, anotações pessoais e PDF consolidado',
        '📄 Trabalho AV1: Resumo DIGITADO de 12 páginas (1 pág/capítulo de "A Treliça e a Videira")',
        '📧 Enviar arquivo (PDF ou Word) até 23:59 de 27/11/2026 para thacyto@gmail.com'
      ],
      criteriosAvaliacao: [
        '📖 AV1: Resumo DIGITADO de "A Treliça e a Videira" (12 páginas em PDF ou Word) — até 27/11 às 23:59',
        '📱 AV2: Prova online no Forms com CONSULTA LIVRE (slides, anotações e PDF consolidado) — 27/11 às 19:00'
      ],
      livros: [{ titulo: 'A Treliça e a Videira', autor: 'Colin Marshall & Tony Payne', tipo: 'obrigatorio' }],
      infoExtra: 'Em 27/11/2026: Prova online com consulta livre às 19:00 + envio do resumo (PDF ou Word, 12 págs) para thacyto@gmail.com até 23:59.',
    },
    {
      id: 'disc-8', num: '08', nome: 'TCC I', professor: 'Profª Gabriela Leal', professorEmail: 'gabriela.leal@uiecbead.com.br',
      cor: 'text-teal-800', corFundo: 'bg-teal-50', corBorda: 'border-teal-300',
      regrasGerais: [
        '💬 Grupo WhatsApp oficial: "TCC1 - segundo semestre 2026"',
        '🏫 Normas: ABNT (NBR 10520, 6028, 6023) e Manual da FMB/UNIMB',
        '📄 Extensão Exigida: Mínimo de 20 e máximo de 25 páginas no total (Capa até Referências)',
        '🚫 Linguagem 100% impessoal (3ª pessoa); USO DE IA e plágio são TERMINANTEMENTE PROIBIDOS',
        '📧 Entrega até 04/12/2026 às 23:59 em PDF e Word'
      ],
      criteriosAvaliacao: [
        '📋 Sem provas tradicionais — avaliação contínua de participação e progresso',
        '🗓️ Etapa 1: Projeto de Pesquisa estruturado ABNT — prazo 04/09/2026 (Concluído)',
        '📝 Etapa Final: Artigo científico monográfico completo (20 a 25 páginas, PDF e Word) — prazo 04/12/2026 às 23:59'
      ],
      livros: [{ titulo: 'Manual de Metodologia Científica (consultar com orientador)', autor: 'A definir', tipo: 'recomendado' }],
      infoExtra: 'Estrutura exigida: Capa, Folha de Rosto, Resumo/Abstract (150–500 palavras, parágrafo único, 3–5 palavras-chave), Introdução, Metodologia, Desenvolvimento, Considerações Finais e Referências em ordem alfabética. Extensão: 20 a 25 páginas.',
      whatsapp: 'TCC1 - segundo semestre 2026',
    },
    {
      id: 'disc-9', num: '09', nome: 'História e Cultura Afro-Brasileira e Indígena (AFR-101)', professor: 'Profº Alexsandro de Oliveira Silva', professorEmail: 'prof.alexsandro@gmail.com',
      cor: 'text-teal-800', corFundo: 'bg-teal-50', corBorda: 'border-teal-300',
      regrasGerais: [
        '🎬 Disciplina modular gravada: assistir integralmente às 4 videoaulas (~1h20 cada) na pasta do Drive',
        '⚠️ NÃO possui prova escrita convencional (nem AV1 nem AV2 por formulário)',
        '📄 Trabalho Final Aplicado individual com EXATAMENTE 2 laudas (duas páginas) em 3 partes obrigatórias',
        '📧 Enviar exclusivamente para prof.alexsandro@gmail.com até 28/11/2026 (Sábado)'
      ],
      criteriosAvaliacao: [
        '🎬 Etapa 1: Assistir às 4 videoaulas (Teologia & Leis 10.639/03 e 11.645/08; Áfricas/Diáspora; Povos Indígenas/CF-88; Análise Cristã Confessional)',
        '📝 Etapa 2 (Avaliação Única): Trabalho de 2 laudas — (1) Situação-problema étnico-racial concreta; (2) Análise com Bíblia (Gn 1:26-28, At 17:26, Gl 3:28, Tg 2:1-9) + mínimo 2 autores do curso; (3) Proposta de ação pastoral/eclesial concreta'
      ],
      livros: [
        { titulo: 'Racismo Estrutural', autor: 'Silvio Almeida', tipo: 'base' },
        { titulo: 'O Índio Brasileiro', autor: 'Gersem dos Santos Luciano Baniwa', tipo: 'base' },
        { titulo: 'Uma Leitura Negra', autor: 'Esau McCaulley', tipo: 'base' },
        { titulo: 'A Religião Mais Negra do Brasil', autor: 'Marco Davi de Oliveira', tipo: 'base' },
        { titulo: 'Movimento Negro Educador', autor: 'Nilma Lino Gomes', tipo: 'base' },
        { titulo: 'Ideias para Adiar o Fim do Mundo', autor: 'Ailton Krenak', tipo: 'base' },
        { titulo: 'O Racismo, a Cruz e o Cristão', autor: 'John Piper', tipo: 'base' }
      ],
      infoExtra: 'Prazo final: 28/11/2026 (Sábado) exclusivamente para prof.alexsandro@gmail.com. Extensão exata: 2 laudas. Citar Bíblia e pelo menos 2 autores estudados.',
    },
  ],
};

const INITIAL_TURMA_B: PlanoEstudosTurma = {
  entregaveis: [
    { id: 'e-tb-int-av1', disciplinaId: 'disc-b1', disciplina: 'Introdução ao Novo Testamento', titulo: 'AV1: Prova Escrita — Contexto Histórico e Canonicidade', descricao: 'Avaliação sobre formação do cânon e evangelhos sinóticos.', dataLimite: '29/09/2026 (Ter)', dataISO: '2026-09-29', tipo: 'prova', arquivado: true },
    { id: 'e-tb-her-av1', disciplinaId: 'disc-b2', disciplina: 'Hermenêutica Bíblica', titulo: 'AV1: Trabalho de Exegese e Interpretação de Texto', descricao: 'Aplicação dos princípios hermenêuticos histórico-gramaticais.', dataLimite: '30/09/2026 (Qua)', dataISO: '2026-09-30', tipo: 'trabalho', arquivado: true },
    { id: 'e-tb-dis-av1', disciplinaId: 'disc-b3', disciplina: 'Fundamentos e Prática do Discipulado', titulo: 'AV1: Projeto de Discipulado na Igreja Local', descricao: 'Elaboração de um guia prático de mentoria e acompanhamento espiritual.', dataLimite: '01/10/2026 (Qui)', dataISO: '2026-10-01', tipo: 'entrega', arquivado: true },
    { id: 'e-tb-mis-av1', disciplinaId: 'disc-b4', disciplina: 'Teologia da Missão', titulo: 'AV1: Resenha Crítica de Missiologia Contemporânea', descricao: 'Análise teológica dos desafios missionários urbanos e transculturais.', dataLimite: '02/10/2026 (Sex)', dataISO: '2026-10-02', tipo: 'resumo', arquivado: true },
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
    { id: 'e-fds-at-av1', disciplinaId: 'disc-fds-1', disciplina: 'Antigo Testamento I — Pentateuco', titulo: 'AV1: Prova Escrita — Alianças e Lei Mosaica', descricao: 'Avaliação das narrativas de Gênesis a Deuteronômio.', dataLimite: '03/10/2026 (Sáb)', dataISO: '2026-10-03', tipo: 'prova', arquivado: true },
    { id: 'e-fds-edu-av1', disciplinaId: 'disc-fds-2', disciplina: 'Educação Cristã', titulo: 'AV1: Plano Pedagógico para Escola Bíblica', descricao: 'Elaboração de currículo e didática para igreja local.', dataLimite: '04/10/2026 (Dom)', dataISO: '2026-10-04', tipo: 'trabalho', arquivado: true },
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
    { id: 'e-bas-pan-av1', disciplinaId: 'disc-bas-1', disciplina: 'Panorama Bíblico', titulo: 'AV1: Prova Objetiva — Linha do Tempo Bíblica', descricao: 'Avaliação das grandes épocas da história bíblica.', dataLimite: '29/09/2026 (Ter)', dataISO: '2026-09-29', tipo: 'prova', arquivado: true },
    { id: 'e-bas-dout-av1', disciplinaId: 'disc-bas-2', disciplina: 'Doutrinas Fundamentais', titulo: 'AV1: Questionário Doutrinário', descricao: 'Respostas fundamentadas sobre os pilares da fé cristã.', dataLimite: '30/09/2026 (Qua)', dataISO: '2026-09-30', tipo: 'trabalho', arquivado: true },
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

export function resetToOfficialPlanoEstudos(turmaIdx: number): PlanoEstudosTurma {
  const initial = getInitialDataForTurma(turmaIdx);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${turmaIdx}`, JSON.stringify(initial));
      window.dispatchEvent(new CustomEvent('lms_plano_estudos_updated', { detail: { turmaIdx, data: initial } }));
    } catch (e) {
      console.error('Erro ao resetar plano de estudos:', e);
    }
  }
  return initial;
}

export function getPlanoEstudosForTurma(turmaIdx: number): PlanoEstudosTurma {
  const initial = getInitialDataForTurma(turmaIdx);
  if (typeof window === 'undefined') return initial;

  try {
    // Limpeza mandatória de chaves obsoletas do storage para eliminar cronogramas legados
    ['lms_plano_estudos_turma_', 'lms_plano_estudos_turma_v1_', 'lms_plano_estudos_turma_v2_', 'lms_plano_estudos_turma_v3_', 'lms_plano_estudos_turma_v2026_2_homologado_'].forEach((pfx) => {
      [0, 1, 2, 3].forEach((idx) => {
        try { localStorage.removeItem(`${pfx}${idx}`); } catch (e) {}
      });
    });

    const raw = localStorage.getItem(`${STORAGE_PREFIX}${turmaIdx}`);
    if (!raw) {
      localStorage.setItem(`${STORAGE_PREFIX}${turmaIdx}`, JSON.stringify(initial));
      return initial;
    }
    const parsed: PlanoEstudosTurma = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.entregaveis) || !Array.isArray(parsed.requisitos)) {
      return initial;
    }
    // Sincroniza entregáveis oficiais atualizados e preserva itens customizados do aluno
    const customItems = parsed.entregaveis.filter((item) => item.isCustomStudentItem);
    const updatedEntregaveis = [...initial.entregaveis, ...customItems];

    const updatedRequisitos = initial.requisitos.map((initReq) => {
      const existing = parsed.requisitos.find((r) => r.id === initReq.id);
      return existing
        ? {
            ...existing,
            nome: initReq.nome,
            professor: initReq.professor,
            professorEmail: initReq.professorEmail,
            regrasGerais: initReq.regrasGerais,
            criteriosAvaliacao: initReq.criteriosAvaliacao,
            infoExtra: initReq.infoExtra,
          }
        : initReq;
    });

    const merged: PlanoEstudosTurma = { ...parsed, entregaveis: updatedEntregaveis, requisitos: updatedRequisitos };
    localStorage.setItem(`${STORAGE_PREFIX}${turmaIdx}`, JSON.stringify(merged));
    return merged;
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
