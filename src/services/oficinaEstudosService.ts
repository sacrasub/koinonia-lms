/**
 * oficinaEstudosService.ts
 * ============================================================================
 * SERVIÇO: OFICINA DE ESTUDOS & IMERSÃO NO TCC (METATAG & METACADEIA)
 *
 * Arquitetura Local-First (Zero-Egress & Zero-Latency)
 * Persistência primária em localStorage com contingência para sincronização.
 *
 * Koinonia LMS - 2026
 * ============================================================================
 */

import {
  SprintSemanal,
  CornellAnotacao,
  CitacaoABNT,
  MatrizDialeticaItem,
  SimuladorDefesaPergunta,
  SimuladorDefesaRegistro,
  OficinaEstudosDadosCompletos,
  EixoTematicoId,
  CapituloTcc
} from '@/types/oficinaEstudos';

// ============================================================================
// CHAVES DE ARMAZENAMENTO LOCAL
// ============================================================================
export const STORAGE_KEYS = {
  SPRINTS: 'lms_oficina_sprints_v1',
  CORNELL: 'lms_oficina_cornell_v1',
  CITACOES: 'lms_oficina_citacoes_v1',
  DIALETICA: 'lms_oficina_dialetica_v1',
  DEFESA_HISTORICO: 'lms_oficina_defesa_historico_v1',
  AUDIO_CACHE: 'lms_oficina_audio_cache_v1',
};

// ============================================================================
// SEMENTES CANÔNICAS (SEEDS INICIAIS)
// ============================================================================

export const INITIAL_SPRINTS: SprintSemanal[] = [
  {
    id: 'semana-1',
    numero: 1,
    titulo: 'Semana 1: O Eixo Histórico',
    subtitulo: 'A Crise do Internato e a Transição Institucional',
    eixo: 'historico',
    foco_autores: 'Gandra & Baade (2018) e Josemar Modes (2020)',
    objetivo: 'Compreender a evolução histórica do modelo de internato confessional e as contingências socioeconômicas e logísticas que impulsionaram a migração para a EaD teológica.',
    meta_horas: 3,
    tempo_estudado_segundos: 5400, // 1h 30m pré-computados
    checklist: [
      {
        id: 'chk-sem1-1',
        titulo: 'Gandra & Baade (2018) — O Seminário Clássico',
        descricao: 'Leitura sobre o modelo de enclausuramento espiritual e os custos insustentáveis de manutenção dos internatos teológicos no Brasil.',
        autor_referencia: 'GANDRA, E. A.; BAADE, J. H.',
        link_leitura: 'https://drive.google.com/file/d/1uLERidrciF2DFbAFL2EgfEbYa8malQU8/view',
        paginas_recomendadas: 'p. 15-38',
        lido: true,
      },
      {
        id: 'chk-sem1-2',
        titulo: 'Josemar Modes (2020) — A Virada Paradigmática da EaD',
        descricao: 'Análise do perfil do estudante adulto trabalhador e a desterritorialização da formação ministerial.',
        autor_referencia: 'MODES, Josemar',
        link_leitura: 'https://drive.google.com/file/d/1fhP4H2bNJTmxhkHxt0LwymoES6ij1fWT/view',
        paginas_recomendadas: 'p. 45-72',
        lido: true,
      },
      {
        id: 'chk-sem1-3',
        titulo: 'Fichamento Comparativo no Cornell',
        descricao: 'Registrar notas de síntese relacionando as pressões econômicas com a preservação do rigor doutrinário.',
        autor_referencia: 'Metodologia TCC',
        lido: false,
      },
      {
        id: 'chk-sem1-4',
        titulo: 'Extração de Citações para o Capítulo I',
        descricao: 'Catalogar pelo menos 2 citações formais sobre o declínio do modelo de internato.',
        autor_referencia: 'ABNT Hub',
        lido: false,
      },
    ],
  },
  {
    id: 'semana-2',
    numero: 2,
    titulo: 'Semana 2: O Eixo Teórico-Pedagógico',
    subtitulo: 'A Distância Transacional e a Presença Cognitiva',
    eixo: 'teorico',
    foco_autores: 'Michael Moore (1993), Randy Garrison (2000) e Lidiane Souza (2016)',
    objetivo: 'Assimilar a Distância Transacional como espaço cognitivo e relacional (não meramente físico), dominando a tríade Diálogo, Estrutura e Autonomia do Estudante.',
    meta_horas: 3,
    tempo_estudado_segundos: 7200, // 2h pré-computados
    checklist: [
      {
        id: 'chk-sem2-1',
        titulo: 'Michael Moore (1993) — Teoria da Distância Transacional',
        descricao: 'Compreender a equação fundamental: quanto maior o diálogo orientado, menor a distância transacional percebida pelo discente.',
        autor_referencia: 'MOORE, Michael G.',
        link_leitura: 'https://drive.google.com/file/d/1jbbPKFxfq38pPBDl2h4DD4PnCmpDKAJE/view',
        paginas_recomendadas: 'p. 22-39',
        lido: true,
      },
      {
        id: 'chk-sem2-2',
        titulo: 'Randy Garrison (2000) — Comunidade de Inquirição (CoI)',
        descricao: 'Estudo dos três pilares da presença educativa: presença docente, presença social e presença cognitiva.',
        autor_referencia: 'GARRISON, D. R.',
        link_leitura: 'https://drive.google.com/file/d/1zqqHku9T0IpOpYz9gBcWkOLVme4szvAs/view',
        paginas_recomendadas: 'p. 87-105',
        lido: true,
      },
      {
        id: 'chk-sem2-3',
        titulo: 'Lidiane Souza (2016) — Mediação Pedagógica na Teologia',
        descricao: 'Investigação empírica sobre mediação humana e papel do monitor síncrono no acolhimento teológico.',
        autor_referencia: 'SOUZA, Lidiane',
        link_leitura: 'https://drive.google.com/file/d/1eqIXo6iR033ZF0E_IiCM5C_bXqdnOVTT/view',
        paginas_recomendadas: 'p. 50-84',
        lido: false,
      },
      {
        id: 'chk-sem2-4',
        titulo: 'Ensaio Dialético no Capítulo II',
        descricao: 'Articular a autonomia do estudante andragógico com a rigidez da matriz curricular.',
        autor_referencia: 'Revisão de Literatura',
        lido: false,
      },
    ],
  },
  {
    id: 'semana-3',
    numero: 3,
    titulo: 'Semana 3: O Eixo Eclesiológico',
    subtitulo: 'A Koinonia Virtual e a Mutualidade Digital',
    eixo: 'eclesiologico',
    foco_autores: 'Eliseu Roque do Espírito Santo (2009) e Gleyds Domingues (2016)',
    objetivo: 'Fundamentar biblicamente a comunhão (koinonia) no Novo Testamento, demonstrando a legitimidade da formação do caráter moral e pastoral no ciberespaço.',
    meta_horas: 3,
    tempo_estudado_segundos: 3600, // 1h
    checklist: [
      {
        id: 'chk-sem3-1',
        titulo: 'Eliseu Roque do Espírito Santo (2009) — Comunhão e Cibercultura',
        descricao: 'A comunhão cristã mediada por computadores: superação do preconceito de inautenticidade no ambiente digital.',
        autor_referencia: 'ESPÍRITO SANTO, Eliseu Roque do',
        link_leitura: 'https://drive.google.com/file/d/1cSCI2Dq70Vwx-3dHkgBlf51c9CqkVocF/view',
        paginas_recomendadas: 'p. 112-145',
        lido: true,
      },
      {
        id: 'chk-sem3-2',
        titulo: 'Gleyds Domingues (2016) — Igreja em Rede e Afetividade',
        descricao: 'Mutualidade pastoral, grupos de oração síncronos e o vínculo espiritual na cultura conectada.',
        autor_referencia: 'DOMINGUES, Gleyds',
        link_leitura: 'https://drive.google.com/file/d/1dKBUlbl2R0UNSzv_L9tAJIvBjvmN1kvm/view',
        paginas_recomendadas: 'p. 33-68',
        lido: false,
      },
      {
        id: 'chk-sem3-3',
        titulo: 'Exegese de Atos 2:42 e 2 João 1:12',
        descricao: 'Conexão exegética da comunhão apostólica (koinonia) com a comunicação mediada por instrumentos epistolares e digitais.',
        autor_referencia: 'Teologia Bíblica',
        lido: false,
      },
      {
        id: 'chk-sem3-4',
        titulo: 'Formulação do Debate Hermenêutico',
        descricao: 'Inserir contraponto com críticos da virtualidade na Matriz Dialética.',
        autor_referencia: 'Matriz Crítica',
        link_leitura: 'https://drive.google.com/file/d/1PsMtb6VS8hJ_6bIQWRYxVVoiWi75FflE/view',
        lido: false,
      },
    ],
  },
  {
    id: 'semana-4',
    numero: 4,
    titulo: 'Semana 4: O Eixo de Inovação e Tele-proximidade',
    subtitulo: 'Metodologias Ativas e o Ecossistema Koinonia LMS',
    eixo: 'inovacao',
    foco_autores: 'Chryssa Themelis (2021), Filatro & Cavalcanti (2019) e Koinonia LMS (2026)',
    objetivo: 'Integrar a teoria à práxis de inovação pedagógica: tele-proximidade síncrona, simulador RPG pastoral, mural de oração e anotações Cornell ativas.',
    meta_horas: 3,
    tempo_estudado_segundos: 1800, // 30m
    checklist: [
      {
        id: 'chk-sem4-1',
        titulo: 'Chryssa Themelis (2021) — Tele-proximidade e Presença Visual',
        descricao: 'Conceito de tele-proximity: como o vídeo síncrono e a escuta afetiva eliminam o sentimento de abandono na EaD.',
        autor_referencia: 'THEMELIS, Chryssa',
        link_leitura: 'https://drive.google.com/file/d/1b2UITCK6GzRqGrCplN1yCk185naw115m/view',
        paginas_recomendadas: 'p. 90-118',
        lido: false,
      },
      {
        id: 'chk-sem4-2',
        titulo: 'Filatro & Cavalcanti (2019) — Metodologias Ativas no Ensino Superior',
        descricao: 'Design instrucional para andragogia: estudos de caso, gamificação reflexiva e tomada de decisão pastoral.',
        autor_referencia: 'FILATRO, Andrea; CAVALCANTI, Carolina',
        link_leitura: 'https://drive.google.com/file/d/12ZxaSfs1gQcZMOeRKb2cGTWsfeD95Rzl/view',
        paginas_recomendadas: 'p. 104-135',
        lido: false,
      },
      {
        id: 'chk-sem4-3',
        titulo: 'Relatório Empírico Koinonia LMS (2026)',
        descricao: 'Tabulação dos dados da pesquisa de campo: impacto da monitoria, uso do Meet e engajamento no Caderno Cornell.',
        autor_referencia: 'Koinonia LMS Research',
        link_leitura: 'https://drive.google.com/file/d/1Y9pMiWqulIngTTcz0TVm6bH9qKAndCXI/view',
        paginas_recomendadas: 'p. 1-45',
        lido: false,
      },
      {
        id: 'chk-sem4-4',
        titulo: 'Treinamento Oral da Defesa Socrática',
        descricao: 'Gravar as 5 respostas simuladas no Simulador da Banca.',
        autor_referencia: 'Simulador Oral',
        lido: false,
      },
    ],
  },
];

export const INITIAL_CORNELL_NOTES: CornellAnotacao[] = [
  {
    id: 'cornell-oficina-1',
    sprint_id: 'semana-2',
    obra_titulo: 'Theory of Transactional Distance',
    autor_nome: 'Michael G. Moore (1993)',
    pagina_referencia: 'p. 22-25',
    eixo_tematico: 'teorico',
    drive_url: 'https://drive.google.com/file/d/1jbbPKFxfq38pPBDl2h4DD4PnCmpDKAJE/view',
    cues: `• Definição de Distância Transacional
• A tríade: Diálogo, Estrutura e Autonomia
• Por que a distância geográfica não determina a qualidade da aprendizagem?
• Qual o perigo da alta estrutura sem diálogo no ensino teológico?`,
    notes: `1. DISTÂNCIA TRANSACIONAL NÃO É MERA DISTÂNCIA FÍSICA:
- Trata-se de uma distância psicológica e relacional entre professor e aluno.
- Ocorre em qualquer modalidade educativa (inclusive em salas presenciais apáticas).

2. AS TRÊS VARIÁVEIS FUNDAMENTAIS:
a) Diálogo: Interação positiva e colaborativa entre participantes. Quando o diálogo é alto, a distância transacional diminui expressivamente.
b) Estrutura: A rigidez ou flexibilidade dos objetivos e métodos do curso.
c) Autonomia do Estudante: O aluno adulto (andragógico) necessita de disciplina e autodirecionamento para gerenciar sua rotina de estudos.

3. IMPLICAÇÕES PARA A FORMAÇÃO PASTORAL:
- Aulas meramente gravadas (alta estrutura e zero diálogo) elevam a distância transacional e provocam abandono.
- Sessões síncronas via Google Meet acompanhadas de monitores restabelecem o canal dialógico.`,
    summary: 'A Teoria de Moore prova que a eficácia da formação teológica virtual repousa na densidade do diálogo síncrono. O Koinonia LMS combate o isolamento cognitivo através da tele-proximidade.',
    tags: ['MichaelMoore', 'DistanciaTransacional', 'TeoriaPedagogica', 'CapituloII'],
    created_at: new Date('2026-08-25').toISOString(),
    updated_at: new Date('2026-08-25').toISOString(),
  },
  {
    id: 'cornell-oficina-2',
    sprint_id: 'semana-3',
    obra_titulo: 'Koinonia em Ambientes Virtuais de Aprendizagem',
    autor_nome: 'Eliseu Roque do Espírito Santo (2009)',
    pagina_referencia: 'p. 112-118',
    eixo_tematico: 'eclesiologico',
    drive_url: 'https://drive.google.com/file/d/1cSCI2Dq70Vwx-3dHkgBlf51c9CqkVocF/view',
    cues: `• Raiz etimológica de Koinonia (grego neotestamentário)
• Diferença entre conexão técnica e comunhão moral
• O ciberespaço como locus de oração e edificação mútua
• Refutação da tese de que a presença física é requisito absoluto para a graça`,
    notes: `1. CONCEITO BÍBLICO DE KOINONIA:
- Do grego koinonia: coparticipação, compartilhamento íntimo, comunhão baseada no Espírito Santo.
- O apóstolo Paulo exercia comunhão e autoridade pastoral por cartas (2 Coríntios 10:11; 1 Tessalonicenses 2:17: "separados fisicamente, mas não no coração").

2. TRANSIÇÃO PARA AS REDES DIGITAIS:
- A comunhão cristã não reside nos tijolos do edifício, mas no pacto entre os irmãos em Cristo.
- Ferramentas como murais de oração e fóruns de partilha pastoral viabilizam acolhimento mútuo real e oração intercessória eficaz.`,
    summary: 'A koinonia bíblica transcende a proximidade física. Tecnologias digitais funcionam como instrumentos modernos do mesmo ministério epistolar apostólico que sustentava a comunhão à distância.',
    tags: ['Koinonia', 'Eclesiologia', 'EspíritoSanto2009', 'CapituloIII'],
    created_at: new Date('2026-08-28').toISOString(),
    updated_at: new Date('2026-08-28').toISOString(),
  },
];

export const INITIAL_CITACOES: CitacaoABNT[] = [
  {
    id: 'cit-1',
    texto_citacao: 'A distância transacional é uma distância pedagógica, e não geográfica; trata-se de um espaço psicológico e de comunicação a ser transposto por professores e alunos.',
    autores: 'MOORE, Michael G.',
    ano: 1993,
    pagina: '22',
    referencia_abnt_completa: 'MOORE, Michael G. Theory of transactional distance. In: KEEGAN, Desmond (org.). Theoretical principles of distance education. London: Routledge, 1993. p. 22-38.',
    drive_url: 'https://drive.google.com/file/d/1jbbPKFxfq38pPBDl2h4DD4PnCmpDKAJE/view',
    capitulo_tcc: 'cap_2',
    eixo_tematico: 'teorico',
    tags: ['Distância Transacional', 'Epistemologia', 'Michael Moore'],
    data_cadastro: '2026-08-20',
  },
  {
    id: 'cit-2',
    texto_citacao: 'O modelo de internato clássico de seminário atendeu a um contexto histórico de isolamento pré-industrial, porém colapsou frente às exigências de sustentabilidade econômica e ao imperativo ministerial do estudante inserido em sua comunidade de fé local.',
    autores: 'GANDRA, E. A.; BAADE, J. H.',
    ano: 2018,
    pagina: '27',
    referencia_abnt_completa: 'GANDRA, Edgar Ávila; BAADE, Joel Haroldo. A formação pastoral teológica entre o claustro e a rede: desafios contemporâneos da educação confessional. Reflexão & Práxis, v. 14, n. 2, p. 15-38, 2018.',
    drive_url: 'https://drive.google.com/file/d/1uLERidrciF2DFbAFL2EgfEbYa8malQU8/view',
    capitulo_tcc: 'cap_1',
    eixo_tematico: 'historico',
    tags: ['Crise do Internato', 'História da Teologia', 'Gandra & Baade'],
    data_cadastro: '2026-08-22',
  },
  {
    id: 'cit-3',
    texto_citacao: 'A comunhão espiritual (koinonia) não depende ontologicamente da justaposição física de corpos, mas da comunhão no Espírito que une os crentes em mutualidade sincera, permitindo que as tecnologias digitais sirvam como canais límpidos da graça comunitária.',
    autores: 'ESPÍRITO SANTO, Eliseu Roque do',
    ano: 2009,
    pagina: '115',
    referencia_abnt_completa: 'ESPÍRITO SANTO, Eliseu Roque do. Koinonia e Cibercultura: a comunhão cristã nos novos territórios da comunicação digital. São Paulo: Fonte Editorial, 2009.',
    drive_url: 'https://drive.google.com/file/d/1cSCI2Dq70Vwx-3dHkgBlf51c9CqkVocF/view',
    capitulo_tcc: 'cap_3',
    eixo_tematico: 'eclesiologico',
    tags: ['Koinonia', 'Eclesiologia', 'Mutualidade'],
    data_cadastro: '2026-08-26',
  },
  {
    id: 'cit-4',
    texto_citacao: 'Tele-proximidade pedagógica refere-se à habilidade do ecossistema de aprendizagem de transmitir sensação de presença afetiva e engajamento síncrono, desfazendo a solidão do aluno mediante o olhar e a moderação humana contínua.',
    autores: 'THEMELIS, Chryssa',
    ano: 2021,
    pagina: '94',
    referencia_abnt_completa: 'THEMELIS, Chryssa. Tele-proximity: human touch and visual presence in remote learning environments. International Journal of Educational Technology, v. 18, n. 3, p. 89-114, 2021.',
    drive_url: 'https://drive.google.com/file/d/1b2UITCK6GzRqGrCplN1yCk185naw115m/view',
    capitulo_tcc: 'cap_4',
    eixo_tematico: 'inovacao',
    tags: ['Tele-proximidade', 'Metodologia Ativa', 'Presença Visual'],
    data_cadastro: '2026-08-29',
  },
  {
    id: 'cit-5',
    texto_citacao: 'O diálogo é a variável crítica para diminuir a distância transacional; quando o diálogo é frequente e qualificado, a rigidez da estrutura curricular pode ser flexibilizada sem prejuízo da integridade acadêmica.',
    autores: 'SOUZA, Lidiane',
    ano: 2016,
    pagina: '58',
    referencia_abnt_completa: 'SOUZA, Lidiane. Mediação pedagógica e diálogo síncrono na educação teológica a distância. Rio de Janeiro: CPAD, 2016.',
    drive_url: 'https://drive.google.com/file/d/1eqIXo6iR033ZF0E_IiCM5C_bXqdnOVTT/view',
    capitulo_tcc: 'cap_2',
    eixo_tematico: 'teorico',
    tags: ['Diálogo Síncrono', 'Mediação', 'Lidiane Souza'],
    data_cadastro: '2026-09-01',
  },
];

export const INITIAL_DIALETICA: MatrizDialeticaItem[] = [
  {
    id: 'dialetica-semente-1',
    autor_a: 'Thomas Giulliano (Crítica Tradicionalista)',
    autor_b: 'Eliseu Roque do Espírito Santo (Teologia da Comunhão Digital)',
    autor_a_drive_url: 'https://drive.google.com/file/d/1PsMtb6VS8hJ_6bIQWRYxVVoiWi75FflE/view',
    autor_b_drive_url: 'https://drive.google.com/file/d/1cSCI2Dq70Vwx-3dHkgBlf51c9CqkVocF/view',
    tema_debate: 'A presencialidade física é ontologicamente indispensável para a formação pastoral e ordenação ao ministério sagrado?',
    ponto_convergencia: 'Ambos concordam que a mera transmissão passiva de informações em telas sem pastoreio direto descaracteriza a vocação e esvazia o propósito espiritual da Igreja.',
    ponto_tensao: 'Giulliano defende que sem a convivência física diária (mesa, altar e convivência comunitária contínua) é impossível forjar virtudes de caráter; enquanto Espírito Santo sustenta que o Espírito Santo não está preso ao espaço geográfico e que a comunicação mediada replica o padrão das epístolas do Novo Testamento.',
    sintese_pesquisador: 'A superação da crítica de Giulliano ocorre não pela negação da necessidade de convivência comunitária, mas pelo reconhecimento de que o aluno da EaD já vive a práxis pastoral diariamente em sua igreja local congregacional, servindo o LMS Koinonia como catalisador teológico com suporte síncrono humanizado de tele-proximidade.',
    capitulo_tcc: 'cap_3',
    created_at: new Date('2026-08-30').toISOString(),
  },
];

export const PERGUNTAS_BANCA_EXAMINADORA: SimuladorDefesaPergunta[] = [
  {
    id: 'banca-q1',
    numero: 1,
    enunciado: 'Diante das críticas de que o modelo de internato fechado é a única garantia de forja do caráter pastoral, como o candidato sustenta teológica e sociologicamente a viabilidade da formação ministerial no modelo síncrono remoto?',
    objetivo_pedagogico: 'Avaliar a clareza argumentativa do aluno ao confrontar o modelo clássico de internato (Gandra & Baade) com as exigências da igreja contemporânea.',
    autores_recomendados: ['Gandra & Baade (2018)', 'Josemar Modes (2020)', 'Atos 2:42-47'],
    tempo_segundos: 180, // 3 minutos
    rubrica_criterios: [
      { id: 'crit_1_1', criterio: 'Citação dos Autores Chave', descricao: 'Mencionou explicitamente Gandra & Baade ou Modes para contextualizar o declínio econômico e logístico do internato.' },
      { id: 'crit_1_2', criterio: 'Conexão com a Práxis Pastoral Local', descricao: 'Demonstrou que o discente atua simultaneamente na comunidade local enquanto estuda, sem desenraizamento ministerial.' },
      { id: 'crit_1_3', criterio: 'Vocabulário Acadêmico Correto', descricao: 'Utilizou termos como "desterritorialização", "andragogia" e "formação em serviço".' },
      { id: 'crit_1_4', criterio: 'Equilíbrio e Postura Firme', descricao: 'Não desrespeitou a tradição histórica, mas justificou solidamente a transição com elegância acadêmica.' },
      { id: 'crit_1_5', criterio: 'Domínio do Tempo (até 3 min)', descricao: 'Concluiu a linha de raciocínio de forma conclusiva dentro da janela temporal.' },
    ],
  },
  {
    id: 'banca-q2',
    numero: 2,
    enunciado: 'Qual é a sustentação bíblico-teológica para afirmar que a "Koinonia" pode ser vivenciada legitimamente através de interfaces digitais, sem violar a eclesiologia neotestamentária?',
    objetivo_pedagogico: 'Verificar a fundamentação bíblica exegética do candidato articulada com teóricos contemporâneos da comunhão digital.',
    autores_recomendados: ['Eliseu Roque do Espírito Santo (2009)', 'Gleyds Domingues (2016)', '2 João 1:12', '1 Tessalonicenses 2:17'],
    tempo_segundos: 180,
    rubrica_criterios: [
      { id: 'crit_2_1', criterio: 'Exegese e Texto Bíblico', descricao: 'Citou passagens bíblicas (Atos 2:42, epístolas paulinas ou joaninas) relacionando mediação epistolar e comunhão no Espírito.' },
      { id: 'crit_2_2', criterio: 'Diferenciação entre Técnica e Comunhão', descricao: 'Explicou que o meio técnico é instrumento, enquanto a comunhão reside na mutualidade relacional.' },
      { id: 'crit_2_3', criterio: 'Morfologia de Koinonia', descricao: 'Explicou a raiz do termo koinonia como participação conjunta em Cristo e partilha espiritual.' },
      { id: 'crit_2_4', criterio: 'Citação de Espírito Santo (2009)', descricao: 'Recorreu ao referencial teórico da dissertação de Eliseu Roque do Espírito Santo.' },
      { id: 'crit_2_5', criterio: 'Clareza e Fluência Teológica', descricao: 'Apresentou raciocínio sem hesitações excessivas com firmeza doutrinária congregacional.' },
    ],
  },
  {
    id: 'banca-q3',
    numero: 3,
    enunciado: 'Como a Teoria da Distância Transacional de Michael Moore elucida os mecanismos pedagógicos implementados no Koinonia LMS para evitar a evasão e o isolamento cognitivo?',
    objetivo_pedagogico: 'Testar a capacidade do aluno de operacionalizar o construto teórico de Moore (Diálogo, Estrutura e Autonomia) nas ferramentas concretas da plataforma.',
    autores_recomendados: ['Michael G. Moore (1993)', 'Randy Garrison (2000)', 'Lidiane Souza (2016)'],
    tempo_segundos: 150, // 2m 30s
    rubrica_criterios: [
      { id: 'crit_3_1', criterio: 'Definição da Tríade de Moore', descricao: 'Articulou claramente os conceitos de Diálogo, Estrutura e Autonomia do Aluno.' },
      { id: 'crit_3_2', criterio: 'Distinção Conceitual Crucial', descricao: 'Frisou que distância transacional é psicológica/comunicacional e não meramente métrica/quilométrica.' },
      { id: 'crit_3_3', criterio: 'Apresentação de Recursos Concretos', descricao: 'Vinculou o diálogo ao Google Meet com monitores e a autonomia ao Caderno Cornell.' },
      { id: 'crit_3_4', criterio: 'Rigor Metodológico', descricao: 'Mencionou autores com precisão de ano e preceito científico.' },
      { id: 'crit_3_5', criterio: 'Objetividade de Resposta', descricao: 'Respondeu diretamente à pergunta sem prolixidade ou desvios temáticos.' },
    ],
  },
  {
    id: 'banca-q4',
    numero: 4,
    enunciado: 'Quais evidências epistemológicas sustentam que o uso do Caderno Digital Cornell promove a metacognição ativa em discentes que enfrentam leituras teológicas densas?',
    objetivo_pedagogico: 'Avaliar a fundamentação sobre metacognição, andragogia e retenção de conteúdo no estudo autônomo do concluinte.',
    autores_recomendados: ['Walter Pauk (Cornell University)', 'Filatro & Cavalcanti (2019)', 'Relatório Koinonia LMS'],
    tempo_segundos: 150,
    rubrica_criterios: [
      { id: 'crit_4_1', criterio: 'Metodologia Pauk / Cornell', descricao: 'Explicou a separação das colunas (Pistas socráticas 30%, Notas 70% e Sumário basilar de síntese).' },
      { id: 'crit_4_2', criterio: 'Conceito de Metacognição', descricao: 'Demonstrou que o aluno reflete sobre o próprio processo de aprendizagem e elabora sínteses autorais.' },
      { id: 'crit_4_3', criterio: 'Andragogia e Aprendizagem Significativa', descricao: 'Relacionou a técnica com a maturidade do estudante adulto que precisa aplicar o saber no ministério.' },
      { id: 'crit_4_4', criterio: 'Diferenciação de Cópia Passiva', descricao: 'Destacou a ruptura com o mero grifo passivo de PDF, migrando para elaboração dialógica.' },
      { id: 'crit_4_5', criterio: 'Conclusão Propositiva', descricao: 'Apresentou o takeaway executivo como insumo direto para a redação da monografia.' },
    ],
  },
  {
    id: 'banca-q5',
    numero: 5,
    enunciado: 'De que maneira a inovação da "Tele-proximidade" e a atuação do Monitor Acadêmico atuam na salvaguarda da saúde emocional e da identidade pastoral dos alunos à distância?',
    objetivo_pedagogico: 'Aferir a dimensão humana e pastoral da pesquisa, demonstrando o acolhimento afetivo e mitigação da solidão do estudante.',
    autores_recomendados: ['Chryssa Themelis (2021)', 'Lidiane Souza (2016)', 'Dados Empíricos do LMS (2026)'],
    tempo_segundos: 150,
    rubrica_criterios: [
      { id: 'crit_5_1', criterio: 'Conceituação de Tele-proximidade', descricao: 'Definiu o termo de Themelis como presença visual, acolhimento afetivo e atenção intencional.' },
      { id: 'crit_5_2', criterio: 'Papel do Monitor como Mediador', descricao: 'Destacou o monitor não apenas como suporte técnico, mas como presença acolhedora e mediador de koinonia.' },
      { id: 'crit_5_3', criterio: 'Dados da Pesquisa de Campo', descricao: 'Mencionou que os alunos relatam alívio da solidão quando há interação síncrona frequente.' },
      { id: 'crit_5_4', criterio: 'Equilíbrio Técnico e Espiritual', descricao: 'Harmonizou o rigor da ciência da computação/educação com o zelo pastoral congregacional.' },
      { id: 'crit_5_5', criterio: 'Articulação Final e Segurança', descricao: 'Demonstrou prontidão para a homologação do diploma perante a banca examinadora.' },
    ],
  },
];

// ============================================================================
// SERVIÇO PRINCIPAL (FUNÇÕES EXPORTADAS)
// ============================================================================

export const oficinaEstudosService = {
  // --- SPRINTS E EIXOS TEMÁTICOS ---
  getSprints(): SprintSemanal[] {
    if (typeof window === 'undefined') return INITIAL_SPRINTS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SPRINTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Mescla URLs do Google Drive caso os itens salvos anteriormente estejam sem os links
          return parsed.map((sprint: SprintSemanal) => {
            const seedSprint = INITIAL_SPRINTS.find((s) => s.id === sprint.id);
            if (!seedSprint) return sprint;
            return {
              ...sprint,
              checklist: sprint.checklist.map((item) => {
                const seedItem = seedSprint.checklist.find((ci) => ci.id === item.id);
                if (seedItem && seedItem.link_leitura && !item.link_leitura) {
                  return { ...item, link_leitura: seedItem.link_leitura };
                }
                return item;
              }),
            };
          });
        }
      }
    } catch (e) {
      console.warn('Falha ao ler sprints do localStorage:', e);
    }
    return INITIAL_SPRINTS;
  },

  saveSprints(sprints: SprintSemanal[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SPRINTS, JSON.stringify(sprints));
    } catch (e) {
      console.error('Erro ao persistir sprints no localStorage:', e);
    }
  },

  toggleChecklistItem(sprintId: string, itemId: string): SprintSemanal[] {
    const sprints = this.getSprints();
    const updated = sprints.map((sprint) => {
      if (sprint.id !== sprintId) return sprint;
      return {
        ...sprint,
        checklist: sprint.checklist.map((chk) => 
          chk.id === itemId ? { ...chk, lido: !chk.lido } : chk
        ),
      };
    });
    this.saveSprints(updated);
    return updated;
  },

  addStudyTime(sprintId: string, secondsToAdd: number): SprintSemanal[] {
    const sprints = this.getSprints();
    const updated = sprints.map((sprint) => {
      if (sprint.id !== sprintId) return sprint;
      return {
        ...sprint,
        tempo_estudado_segundos: (sprint.tempo_estudado_segundos || 0) + secondsToAdd,
      };
    });
    this.saveSprints(updated);
    return updated;
  },

  // --- CADERNO DIGITAL CORNELL ---
  getCornellNotes(): CornellAnotacao[] {
    if (typeof window === 'undefined') return INITIAL_CORNELL_NOTES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CORNELL);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: CornellAnotacao) => {
            const seed = INITIAL_CORNELL_NOTES.find((c) => c.id === item.id);
            if (seed && seed.drive_url && !item.drive_url) {
              return { ...item, drive_url: seed.drive_url };
            }
            return item;
          });
        }
      }
    } catch (e) {
      console.warn('Falha ao ler Cornell do localStorage:', e);
    }
    return INITIAL_CORNELL_NOTES;
  },

  saveCornellNote(note: Partial<CornellAnotacao> & { id?: string }): CornellAnotacao[] {
    const list = this.getCornellNotes();
    const now = new Date().toISOString();
    let updated: CornellAnotacao[];

    if (note.id) {
      updated = list.map((item) => 
        item.id === note.id ? { ...item, ...note, updated_at: now } as CornellAnotacao : item
      );
    } else {
      const newEntry: CornellAnotacao = {
        id: `cornell_${Date.now()}`,
        sprint_id: note.sprint_id || 'semana-1',
        obra_titulo: note.obra_titulo || 'Obra sem título',
        autor_nome: note.autor_nome || 'Autor',
        pagina_referencia: note.pagina_referencia || '',
        eixo_tematico: note.eixo_tematico || 'teorico',
        drive_url: note.drive_url,
        cues: note.cues || '',
        notes: note.notes || '',
        summary: note.summary || '',
        tags: note.tags || ['Metacognição', 'TCC'],
        created_at: now,
        updated_at: now,
      };
      updated = [newEntry, ...list];
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CORNELL, JSON.stringify(updated));
    }
    return updated;
  },

  deleteCornellNote(id: string): CornellAnotacao[] {
    const list = this.getCornellNotes();
    const updated = list.filter((item) => item.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CORNELL, JSON.stringify(updated));
    }
    return updated;
  },

  exportCornellMarkdown(note: CornellAnotacao): string {
    return `# CADERNO CORNELL — METADADOS DO TCC
**Obra:** ${note.obra_titulo}
**Autor(es):** ${note.autor_nome} (${note.pagina_referencia || 'Sem página indicada'})
**Eixo Temático:** ${note.eixo_tematico.toUpperCase()}${note.drive_url ? `\n**PDF no Google Drive:** [Acessar Arquivo](${note.drive_url})` : ''}
**Data de Registro:** ${new Date(note.created_at).toLocaleDateString('pt-BR')}
**Tags:** ${note.tags.join(', ')}

---

## 1. PISTAS SOCRÁTICAS E PALAVRAS-CHAVE (COLUNA ESQUERDA - 30%)
${note.cues}

---

## 2. NOTAS DE LEITURA E CITAÇÕES DIRETAS (COLUNA DIREITA - 70%)
${note.notes}

---

## 3. SUMÁRIO EXECUTIVO & TAKEAWAY PARA O TCC (RODAPÉ)
${note.summary}

---
*Gerado via Oficina de Estudos & Imersão no TCC — Koinonia LMS*
`;
  },

  // --- BANCO DE CITAÇÕES ABNT ---
  getCitacoes(): CitacaoABNT[] {
    if (typeof window === 'undefined') return INITIAL_CITACOES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CITACOES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: CitacaoABNT) => {
            const seed = INITIAL_CITACOES.find((c) => c.id === item.id);
            if (seed && seed.drive_url && !item.drive_url) {
              return { ...item, drive_url: seed.drive_url };
            }
            return item;
          });
        }
      }
    } catch (e) {
      console.warn('Falha ao ler citações do localStorage:', e);
    }
    return INITIAL_CITACOES;
  },

  saveCitacao(citacao: Partial<CitacaoABNT> & { id?: string }): CitacaoABNT[] {
    const list = this.getCitacoes();
    let updated: CitacaoABNT[];

    if (citacao.id) {
      updated = list.map((item) =>
        item.id === citacao.id ? { ...item, ...citacao } as CitacaoABNT : item
      );
    } else {
      const newEntry: CitacaoABNT = {
        id: `cit_${Date.now()}`,
        texto_citacao: citacao.texto_citacao || '',
        autores: citacao.autores || '',
        ano: citacao.ano || new Date().getFullYear(),
        pagina: citacao.pagina || '',
        referencia_abnt_completa: citacao.referencia_abnt_completa || '',
        drive_url: citacao.drive_url,
        capitulo_tcc: citacao.capitulo_tcc || 'cap_1',
        eixo_tematico: citacao.eixo_tematico || 'teorico',
        tags: citacao.tags || [],
        data_cadastro: new Date().toISOString().split('T')[0],
      };
      updated = [newEntry, ...list];
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CITACOES, JSON.stringify(updated));
    }
    return updated;
  },

  deleteCitacao(id: string): CitacaoABNT[] {
    const list = this.getCitacoes();
    const updated = list.filter((item) => item.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CITACOES, JSON.stringify(updated));
    }
    return updated;
  },

  formatAbntInText(cit: CitacaoABNT): string {
    // Formato: (SOUSA, 2016, p. 45)
    const autorLimpo = cit.autores.split(',')[0].trim().toUpperCase();
    const pag = cit.pagina ? `, p. ${cit.pagina}` : '';
    return `(${autorLimpo}, ${cit.ano}${pag})`;
  },

  // --- MATRIZ DIALÉTICA DE AUTORES ---
  getMatrizDialetica(): MatrizDialeticaItem[] {
    if (typeof window === 'undefined') return INITIAL_DIALETICA;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DIALETICA);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: MatrizDialeticaItem) => {
            const seed = INITIAL_DIALETICA.find((d) => d.id === item.id);
            if (seed) {
              return {
                ...item,
                autor_a_drive_url: item.autor_a_drive_url || seed.autor_a_drive_url,
                autor_b_drive_url: item.autor_b_drive_url || seed.autor_b_drive_url,
              };
            }
            return item;
          });
        }
      }
    } catch (e) {
      console.warn('Falha ao ler dialética do localStorage:', e);
    }
    return INITIAL_DIALETICA;
  },

  saveMatrizItem(item: Partial<MatrizDialeticaItem> & { id?: string }): MatrizDialeticaItem[] {
    const list = this.getMatrizDialetica();
    let updated: MatrizDialeticaItem[];

    if (item.id) {
      updated = list.map((it) => it.id === item.id ? { ...it, ...item } as MatrizDialeticaItem : it);
    } else {
      const newEntry: MatrizDialeticaItem = {
        id: `dialetica_${Date.now()}`,
        autor_a: item.autor_a || '',
        autor_b: item.autor_b || '',
        autor_a_drive_url: item.autor_a_drive_url,
        autor_b_drive_url: item.autor_b_drive_url,
        tema_debate: item.tema_debate || '',
        ponto_convergencia: item.ponto_convergencia || '',
        ponto_tensao: item.ponto_tensao || '',
        sintese_pesquisador: item.sintese_pesquisador || '',
        capitulo_tcc: item.capitulo_tcc || 'cap_2',
        created_at: new Date().toISOString(),
      };
      updated = [newEntry, ...list];
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DIALETICA, JSON.stringify(updated));
    }
    return updated;
  },

  deleteMatrizItem(id: string): MatrizDialeticaItem[] {
    const list = this.getMatrizDialetica();
    const updated = list.filter((it) => it.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DIALETICA, JSON.stringify(updated));
    }
    return updated;
  },

  // --- SIMULADOR SOCRÁTICO DE ARGUIÇÃO DA BANCA ---
  getPerguntasBanca(): SimuladorDefesaPergunta[] {
    return PERGUNTAS_BANCA_EXAMINADORA;
  },

  getHistoricoDefesa(): SimuladorDefesaRegistro[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEFESA_HISTORICO);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Falha ao ler histórico de defesa:', e);
    }
    return [];
  },

  saveDefesaRegistro(registro: Omit<SimuladorDefesaRegistro, 'id' | 'created_at'>): SimuladorDefesaRegistro[] {
    const list = this.getHistoricoDefesa();
    const newEntry: SimuladorDefesaRegistro = {
      ...registro,
      id: `defesa_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [newEntry, ...list];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DEFESA_HISTORICO, JSON.stringify(updated));
    }
    return updated;
  },

  deleteDefesaRegistro(id: string): SimuladorDefesaRegistro[] {
    const list = this.getHistoricoDefesa();
    const updated = list.filter((it) => it.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.DEFESA_HISTORICO, JSON.stringify(updated));
    }
    return updated;
  },

  // --- BACKUP & RESTAURAÇÃO INTEGRAL (LOCAL-FIRST SSOT) ---
  getAllData(): OficinaEstudosDadosCompletos {
    return {
      sprints: this.getSprints(),
      cornellNotes: this.getCornellNotes(),
      citacoes: this.getCitacoes(),
      dialetica: this.getMatrizDialetica(),
      defesaHistorico: this.getHistoricoDefesa(),
      ultimaSessao: new Date().toISOString(),
    };
  },

  restoreAllData(data: Partial<OficinaEstudosDadosCompletos>): boolean {
    if (typeof window === 'undefined') return false;
    try {
      if (data.sprints) localStorage.setItem(STORAGE_KEYS.SPRINTS, JSON.stringify(data.sprints));
      if (data.cornellNotes) localStorage.setItem(STORAGE_KEYS.CORNELL, JSON.stringify(data.cornellNotes));
      if (data.citacoes) localStorage.setItem(STORAGE_KEYS.CITACOES, JSON.stringify(data.citacoes));
      if (data.dialetica) localStorage.setItem(STORAGE_KEYS.DIALETICA, JSON.stringify(data.dialetica));
      if (data.defesaHistorico) localStorage.setItem(STORAGE_KEYS.DEFESA_HISTORICO, JSON.stringify(data.defesaHistorico));
      return true;
    } catch (e) {
      console.error('Falha ao restaurar backup completo da oficina:', e);
      return false;
    }
  },
};
