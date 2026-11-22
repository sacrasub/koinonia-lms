/**
 * ============================================================================
 * KOINONIA LMS — REPOSITÓRIO SSOT DE AULAS GEMINI & CADERNO CORNELL (2026.2)
 * ============================================================================
 * Arquivo gerado automaticamente a partir das anotações reais do Google Meet
 * (Unidade 1 em PDF + Unidade 2 em Google Docs) e do Dossiê AV2.
 * Zero-Waste Egress: 100% estático (0 bytes de leitura no Supabase).
 */

import type { CornellNote } from '@/types';

export interface CanonicalDisciplinaMeta {
  id: string;
  num: string;
  code: string;
  legacyCodes: string[];
  name: string;
  shortName: string;
  prof: string;
  dayOfWeek: string;
  time: string;
  defaultBib: string;
}

export const CANONICAL_DISCIPLINAS: CanonicalDisciplinaMeta[] = [
  {
    "id": "disc-1",
    "num": "01",
    "code": "HIS-202",
    "legacyCodes": [],
    "name": "01 - História do Congregacionalismo - Ary Júnior",
    "shortName": "História do Congregacionalismo",
    "prof": "Profº Ary Júnior",
    "dayOfWeek": "Terça-feira",
    "time": "19:00 – 20:25",
    "defaultBib": "Mateus 18:15-20; Atos 15:1-29; 1 Pedro 2:9"
  },
  {
    "id": "disc-2",
    "num": "02",
    "code": "HIS-102",
    "legacyCodes": [],
    "name": "02 - História do Pensamento Cristão II - Hilário Bispo",
    "shortName": "História do Pensamento Cristão II",
    "prof": "Profº Hilário Bispo",
    "dayOfWeek": "Terça-feira",
    "time": "20:35 – 22:00",
    "defaultBib": "1 Timóteo 4:16; Tito 1:9; Romanos 1:16-17; Judas 1:3"
  },
  {
    "id": "disc-3",
    "num": "03",
    "code": "ACO-202",
    "legacyCodes": [],
    "name": "03 - Aconselhamento Bíblico II - Uilian Santos",
    "shortName": "Aconselhamento Bíblico II",
    "prof": "Profº Uilian Santos",
    "dayOfWeek": "Quarta-feira",
    "time": "19:00 – 20:25",
    "defaultBib": "Provérbios 18:13; Romanos 15:14; Salmos 130; Hebreus 6:19"
  },
  {
    "id": "disc-4",
    "num": "04",
    "code": "DIR-101",
    "legacyCodes": [],
    "name": "04 - Direitos Humanos - Cleiton Barbirato",
    "shortName": "Direitos Humanos",
    "prof": "Profº Cleiton Barbirato",
    "dayOfWeek": "Quarta-feira",
    "time": "20:35 – 22:00",
    "defaultBib": "Gênesis 1:26-27; Miqueias 6:8; Deuteronômio 10:18-19"
  },
  {
    "id": "disc-5",
    "num": "05",
    "code": "ETC-201",
    "legacyCodes": [
      "ETI-201"
    ],
    "name": "05 - Ética Cristã - Karoline Evangelista",
    "shortName": "Ética Cristã",
    "prof": "Profª Karoline Evangelista",
    "dayOfWeek": "Quinta-feira",
    "time": "19:00 – 20:25",
    "defaultBib": "Êxodo 20:1-17; Mateus 5:17-48; Romanos 12:1-2"
  },
  {
    "id": "disc-6",
    "num": "06",
    "code": "NT-301",
    "legacyCodes": [],
    "name": "06 - Novo Testamento III - Epístolas Gerais - Marcio Leal",
    "shortName": "Novo Testamento III (Epístolas)",
    "prof": "Profº Marcio Leal",
    "dayOfWeek": "Quinta-feira",
    "time": "20:35 – 22:00",
    "defaultBib": "Tiago 1–5; 1 Pedro 1–5; 2 Pedro 1–3; 1–3 João; Judas"
  },
  {
    "id": "disc-7",
    "num": "07",
    "code": "MIS-202",
    "legacyCodes": [
      "PRI-202"
    ],
    "name": "07 - Plantação e Revitalização de Igrejas II - Thácyto Lessa",
    "shortName": "Plantação & Revitalização II",
    "prof": "Profº Thácyto Lessa",
    "dayOfWeek": "Sexta-feira",
    "time": "19:00 – 20:00",
    "defaultBib": "Atos 2:42-47; Mateus 16:18; Efésios 4:11-16"
  },
  {
    "id": "disc-8",
    "num": "08",
    "code": "TCC-101",
    "legacyCodes": [],
    "name": "08 - TCC I - Gabriela Leal",
    "shortName": "TCC I",
    "prof": "Profª Gabriela Leal",
    "dayOfWeek": "Sexta-feira",
    "time": "20:00 – 21:00",
    "defaultBib": "Eclesiastes 12:9-12; Lucas 1:1-4; 2 Timóteo 2:15"
  },
  {
    "id": "disc-9",
    "num": "09",
    "code": "AFR-101",
    "legacyCodes": [
      "CAB-201"
    ],
    "name": "09 - História da Cultura Afro Brasileira e Indígena - Alexsandro",
    "shortName": "Cultura Afro & Indígena",
    "prof": "Profº Alexsandro de Oliveira Silva",
    "dayOfWeek": "Sexta-feira",
    "time": "Modular (4 Videoaulas Gravadas)",
    "defaultBib": "Gênesis 1:26-28; Atos 17:26; Gálatas 3:28; Tiago 2:1-9"
  }
];

export interface GeminiAulaTopico {
  titulo: string;
  texto: string;
}

export interface GeminiAulaCornellData {
  id: string;
  disciplinaId: string;
  aulaNum: number;
  unidade: 1 | 2;
  dateIso: string;
  dateBr: string;
  theme: string;
  resumoGeral: string;
  topicos: GeminiAulaTopico[];
  proximasEtapas: string[];
  referenciasBiblicas: string;
  geminiUrl?: string;
  videoUrl?: string;
  sourceType: 'pdf' | 'gdoc' | 'dossie';
}

export const GEMINI_AULAS_CORNELL: GeminiAulaCornellData[] = [
  {
    "id": "cornell-gemini-disc-1-2026-08-11",
    "disciplinaId": "disc-1",
    "aulaNum": 1,
    "unidade": 1,
    "dateIso": "2026-08-11",
    "dateBr": "11/08/2026",
    "theme": "Aula 1 • Contexto da Reforma Inglesa",
    "resumoGeral": "O encontro estabeleceu o planejamento pedagógico sobre a história do congregacionalismo e iniciou os estudos sobre o puritanismo. Planejamento e Metodologia O professor definiu o cronograma de 16 encontros sobre a história do congregacionalismo e instituiu a obrigatoriedade do uso de câmeras ligadas. A estrutura pedagógica foi dividida entre o contexto do congregacionalismo mundial e o brasileiro.",
    "topicos": [
      {
        "titulo": "Contexto da Reforma Inglesa",
        "texto": "A aula abordou o rompimento político de Henrique VIII com Roma e a subsequente via média estabelecida por Elizabeth I. Discutiu-se como a falta de uma reforma teológica completa gerou o surgimento do movimento puritano. Origens do Puritanismo Os alunos analisaram a influência calvinista nos reformadores exilados e as tensões resultante..."
      },
      {
        "titulo": "Abertura do Encontro e Ajustes Iniciais",
        "texto": "Cristiano Sacramento inicia a sessão de testes informando que conseguiu solucionar os problemas com a sua câmera e que possui a capacidade de desativar o som dos participantes, exemplificando com a desativação do áudio do participante Robert. Rosiane Lima confirma que o funcionamento técnico de sua plataforma está regular e que já cons..."
      },
      {
        "titulo": "Suporte à Turma B e Recebimento de Convites",
        "texto": "O informa ao grupo que se ausentará da sala atual para prestar suporte à Turma B do seminário, justificando que aquela turma possui um contingente expressivo de alunos iniciantes que necessitam de orientação inicial. O orienta os participantes experientes que, caso surjam dúvidas, enviem mensagens diretamente pelo aplicativo WhatsApp, ..."
      },
      {
        "titulo": "Orientações Privadas e Entrada de Alunos",
        "texto": "Daniel Rodrigues solicita o auxílio de Cristiano Sacramento por meio de uma mensagem privada para obter orientações sobre uma situação específica. Rosiane Lima intervém e responde diretamente a Daniel Rodrigues, que agradece pela resolução do problema. Rosiane Lima confirma o início da gravação da chamada e saúda o aluno Salatiel Rodri..."
      },
      {
        "titulo": "Apresentação dos Alunos e Dinâmica das Aulas",
        "texto": "O Pastor Ary Queiroz Jr decide iniciar a sessão e solicita que os alunos se apresentem individualmente para conhecer melhor o grupo. O pastor identifica Rosiane Lima, Salatiel Rodrigues, Rodrigo Oliveira e Rejane Carla como alunos conhecidos de semestres anteriores, lembrando que o último período de aulas foi ministrado com eles. Salat..."
      },
      {
        "titulo": "Metodologia de Ensino e Recomendações de Diretoria",
        "texto": "O Pastor Ary Queiroz Jr solicita o auxílio de Cristiano Sacramento para projetar os slides preparados para a aula e orienta que o arquivo seja compartilhado diretamente no grupo para facilitar o acesso dos estudantes. O palestrante concede total liberdade para que os alunos o interrompam a qualquer momento por meio de sinais visuais pa..."
      },
      {
        "titulo": "Introdução às Origens do Puritanismo e do Congregacionalismo",
        "texto": "O Pastor Ary Queiroz Jr define que o tema central da primeira aula é \"A Reforma na Inglaterra e o Surgimento dos Puritanos\". O palestrante justifica essa abordagem inicial demonstrando o nexo causal e a motivação subjacente: para compreender a tradição de fé protestante reformada e as origens do congregacionalismo, é obrigatório estuda..."
      }
    ],
    "proximasEtapas": [
      "Informar sobre livro: Apresentar detalhes sobre a obra de Packer relacionada aos puritanos na próxima aula para o aluno Cristian."
    ],
    "referenciasBiblicas": "Mateus 18:15-20; Atos 15:1-29; 1 Pedro 2:9",
    "geminiUrl": "/gemini-notes/his_aula1_2026-08-11.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-1-2026-08-18",
    "disciplinaId": "disc-1",
    "aulaNum": 2,
    "unidade": 1,
    "dateIso": "2026-08-18",
    "dateBr": "18/08/2026",
    "theme": "Aula 2 • Fundamentos do governo congregacional",
    "resumoGeral": "O encontro estabeleceu diretrizes da disciplina e debateu fundamentos eclesiológicos históricos do congregacionalismo e suas implicações denominacionais. Estrutura da disciplina definida A matéria compreende 16 encontros organizados em 2 unidades temáticas distintas. A avaliação totaliza 10 pontos, integrando provas escritas, participação ativa e leitura obrigatória.",
    "topicos": [
      {
        "titulo": "Fundamentos do governo congregacional",
        "texto": "O Novo Testamento orienta a autonomia das congregações locais, rejeitando hierarquias supraeclesiásticas. A denominação opera como uma fraternidade de igrejas independentes, não como uma instituição nacional. Teoria denominacional discutida O denominacionalismo surgiu para permitir a colaboração entre cristãos de diferentes tradições s..."
      },
      {
        "titulo": "Organização e Estrutura da Disciplina",
        "texto": "O professor Ary Queiroz Jr conversou inicialmente com as monitoras Camila Vieira e Rosiane Lima (Rosi) para ajustar a projeção do material texto na tela e acompanhar a entrada dos alunos na sala virtual. Ary Queiroz Jr detalhou o plano de ensino da disciplina \"História do Congregacionalismo\", estruturada em 16 encontros divididos igual..."
      },
      {
        "titulo": "Retrospectiva Histórica - O Rompimento de Henrique VIII com Roma",
        "texto": "O professor Ary Queiroz Jr recapitulou o contexto da primeira aula do semestre, situando o surgimento do congregacionalismo no contexto histórico da Reforma Inglesa, especificamente entre os puritanos. Ary Queiroz Jr explicou que o rompimento inicial do rei Henrique VIII com o Papa Clemente não foi motivado por questões doutrinárias ou..."
      },
      {
        "titulo": "A Sucessão Monárquica e a Consolidação da Reforma Religiosa",
        "texto": "Ary Queiroz Jr narrou que Henrique VIII, após executar Ana Bolena e casar-se novamente, teve um filho chamado Eduardo. Com a morte de Henrique, o jovem Eduardo VI assumiu o trono sob o protetorado de um tio de inclinação protestante. Foi nesse curto reinado de Eduardo VI que a reforma religiosa de fato aconteceu na Inglaterra, mantendo..."
      },
      {
        "titulo": "O Reinado de Maria I e a Contrarreforma",
        "texto": "O professor descreveu que, após o breve reinado de Eduardo VI, ascendeu ao trono Maria I, filha de Henrique VIII com Catarina de Aragão, que possuía fortes ligações com o Papado romano. O governo de Maria representou a Contrarreforma no cenário inglês, caracterizado por uma feroz e intensa perseguição contra a fé protestante, resultand..."
      },
      {
        "titulo": "O Governo de Elizabeth I e o Surgimento do Puritanismo",
        "texto": "Com o fim do curto reinado de Maria I, assumiu o trono Elizabeth I, filha de Henrique VIII com Ana Bolena, cujo reinado foi marcado pela longevidade. Ary Queiroz Jr pontuou que Elizabeth I não mantinha relações com o Papa devido ao histórico de recusa da anulação do casamento de seus pais, mas agia predominantemente como estadista e go..."
      },
      {
        "titulo": "Princípios Eclesiásticos no Novo Testamento",
        "texto": "O professor Ary Queiroz Jr introduziu o debate ideológico subjacente ao congregacionalismo, defendendo que o Novo Testamento não apresenta órgãos supraeclesiásticos que exerçam supervisão, ingerência ou intervenção hierárquica sobre as igrejas locais. Ary Queiroz Jr argumentou que, mesmo com a presença dos apóstolos, as decisões releva..."
      }
    ],
    "proximasEtapas": [
      "Ler materiais: Realizar a leitura obrigatória dos materiais disponibilizados pelo professor. O conteúdo é requisito para as avaliações do curso.",
      "Realizar leitura: Ler os materiais indicados como leitura obrigatória para a disciplina. Este conteúdo será objeto de avaliação na prova."
    ],
    "referenciasBiblicas": "Atos 1:15; Atos 6; Atos 6:2-5; 1 Coríntios 5; Atos 20:17 e 28; Filipenses 1:1",
    "geminiUrl": "/gemini-notes/his_aula2_2026-08-18.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-1-2026-08-25",
    "disciplinaId": "disc-1",
    "aulaNum": 3,
    "unidade": 1,
    "dateIso": "2026-08-25",
    "dateBr": "25/08/2026",
    "theme": "Aula 3 • Teologia e pacto voluntário",
    "resumoGeral": "Sessão explorou origens do congregacionalismo e teologia sobre a governança eclesiástica via pacto entre crentes. Origens do movimento congregacional O movimento puritano originou o congregacionalismo através da rejeição de reformas incompletas e da busca por autonomia local. Separatistas e independentes divergiram quanto à relação com a igreja estatal.",
    "topicos": [
      {
        "titulo": "Teologia e pacto voluntário",
        "texto": "A eclesiologia define a igreja visível como uma associação voluntária de crentes regida por pacto. Esse modelo valoriza a independência e o autogoverno das congregações locais. Democracia e governança interna O sistema congregacional promove a democracia interna e a fiscalização coletiva, prevenindo centralizações de poder. Essa estrut..."
      },
      {
        "titulo": "Clarificação da Tese de Eclesiologia",
        "texto": "Ary Queiroz Jr inicia a aula esclarecendo a tese de Joelson Gomes, defendida na matéria, que sustenta que a eclesiologia dos reformadores se adequa mais ao governo congregacional do que a outros sistemas de governo eclesiástico. O professor enfatiza que isso não implica que Lutero ou Calvino fossem congregacionais, mas sim que o concei..."
      },
      {
        "titulo": "Contexto Histórico do Puritanismo",
        "texto": "O professor contextualiza que o congregacionalismo nasce no puritanismo, especificamente após o reinado de Maria Tudor, com o retorno de exilados durante o reinado de Elizabeth. O movimento puritano era unido pela rejeição ao que chamavam de \"reforma pela metade\" e pela defesa de que a Bíblia deveria ditar todos os aspectos da vida, in..."
      },
      {
        "titulo": "Diversidade no Movimento Puritano",
        "texto": "Ary Queiroz Jr explica que o puritanismo não era um movimento coeso, existindo divisões significativas. Havia puritanos anglicanos que buscavam reformas sem alterar o episcopado, e puritanos presbiterianos, como Thomas Cartwright, que defendiam o governo presbiteriano."
      },
      {
        "titulo": "O Movimento dos Independentes",
        "texto": "O docente apresenta o grupo dos \"independentes\" (termo que o professor nota ser anacrônico para o período), que propunham uma igreja oficial inglesa com governo congregacional. Segundo Martin Lloyd Jones, Henry Jacob é o autor de originalidade desse conceito. Eles não se opunham a uma igreja nacional, desde que as congregações locais t..."
      },
      {
        "titulo": "Diferenciação entre Independentes e Separatistas",
        "texto": "Ary Queiroz Jr diferencia os independentes dos separatistas. Enquanto os independentes aceitavam uma igreja nacional e não se opunham à comunhão ocasional com a igreja anglicana, os separatistas defendiam a ruptura total entre igreja e estado e recusavam qualquer comunhão com a igreja anglicana, por entenderem que esta não havia realiz..."
      },
      {
        "titulo": "Richard Fitz e a Primeira Igreja Separatista",
        "texto": "Richard Fitz é identificado como o primeiro pastor separatista, tendo fundado uma igreja em 1567 no Plumbers Hall. A congregação, baseada na compreensão de uma \"igreja segundo o Novo Testamento\" como uma associação voluntária de crentes, sofreu repressão policial em 19 de junho de 1567, resultando na prisão e morte de Fitz e outros mem..."
      }
    ],
    "proximasEtapas": [
      "Enviar texto complementar: Enviar um texto importante para os alunos para permitir o avanço do conteúdo na próxima aula.",
      "Ler livro: Ler o livro Congregacionalismo: origens e contribuições sociais da democracia protestante, do pastor Hidauro, conforme recomendado pelo professor."
    ],
    "referenciasBiblicas": "Mateus 18:15-20; Atos 15:1-29; 1 Pedro 2:9",
    "geminiUrl": "/gemini-notes/his_aula3_2026-08-25.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-1-2026-09-01",
    "disciplinaId": "disc-1",
    "aulaNum": 4,
    "unidade": 1,
    "dateIso": "2026-09-01",
    "dateBr": "01/09/2026",
    "theme": "Aula 4 • Plataformas e identidades eclesiásticas",
    "resumoGeral": "A aula abordou a história do congregacionalismo, o pacto do Mayflower e a estrutura da Plataforma de Cambridge. Origens do congregacionalismo histórico A discussão traçou a trajetória de Henry Jacob e a fundação da igreja em 1616. O contexto incluiu a migração para a América e o pacto do Mayflower.",
    "topicos": [
      {
        "titulo": "Plataformas e identidades eclesiásticas",
        "texto": "A análise da Assembleia de Westminster explicou o presbiterianismo e o erastianismo. O debate definiu a Plataforma de Cambridge como base para a identidade congregacional autônoma. Estruturas de governo congregacional A aula definiu a igreja visível baseada em pactos mútuos e detalhou a autoridade dos oficiais. O sistema combina monarq..."
      },
      {
        "titulo": "Organização da Aula e Cronograma",
        "texto": "Ary Queiroz Jr iniciou a aula realizando a chamada e confirmando a gestão dos materiais didáticos com a estudante Camila Vieira, que ficou responsável por listar os links dos quatro textos enviados para a turma no chat. Foi esclarecido que restam três encontros após a presente aula, totalizando sete encontros antes da prova, que será r..."
      },
      {
        "titulo": "Revisão da Trajetória de Henry Jacob",
        "texto": "Ary Queiroz Jr revisou os pontos principais sobre Henry Jacob, esclarecendo que ele não pertencia à congregação separatista de Scrooby, embora tenha mantido contato com John Robinson. Foi destacado que Jacob defendia a formação de igrejas independentes ou congregacionais não separatistas, diferenciando-se dos separatistas radicais da é..."
      },
      {
        "titulo": "Fundação da Igreja de Southwark",
        "texto": "Foi mencionado que Henry Jacob plantou a Igreja Congregacional de Southwark em 1616, sendo esta a primeira igreja congregacional de existência contínua, prevista para completar 410 anos em 2026. Ary Queiroz Jr ressaltou a importância da eclesiologia presente nos 28 artigos de Henry Jacob para a compreensão do congregacionalismo."
      },
      {
        "titulo": "Contexto da Migração para a América do Norte",
        "texto": "Ary Queiroz Jr explicou que os separatistas, perseguidos por James I, exilaram-se na Holanda, mas enfrentaram dificuldades após dez anos devido a conflitos teológicos entre calvinismo e arminianismo e à deterioração moral no país. Diante da impossibilidade de retorno seguro à Inglaterra, devido ao contexto político hostil, o grupo pass..."
      },
      {
        "titulo": "A Viagem do Mayflower",
        "texto": "As negociações para a viagem foram iniciadas em 1617 por John Carver e Robert Cushman, com financiamento do comerciante Thomas Weston, sob a condição de sete anos de trabalho como contraprestação. Devido a problemas de navegabilidade com o navio Speedwell, os passageiros foram realocados, resultando na superlotação do Mayflower, que pa..."
      },
      {
        "titulo": "O Pacto do Mayflower e a Fundação Democrática",
        "texto": "Em novembro de 1620, após a chegada ao litoral da América do Norte, os 41 homens a bordo do Mayflower assinaram o Pacto do Mayflower enquanto o navio estava ancorado. Ary Queiroz Jr destacou que este ato estabeleceu uma colônia baseada em leis justas e no temor de Deus, promovendo a igualdade jurídica e estruturando a primeira comunida..."
      }
    ],
    "proximasEtapas": [
      "Enviar textos: Disponibilize a sequência dos textos de apoio no chat para garantir que todos os alunos tenham acesso ao material de leitura obrigatória.",
      "Divulgar contato: Compartilhe o contato do autor do livro mencionado no grupo para que os alunos interessados possam adquiri-lo.",
      "Celebrar Ação Graças: Converse com o pastor local sobre a possibilidade de realizar a celebração oficial do Dia Nacional de Ação de Graças na igreja.",
      "Enviar contato do autor: Disponibilizar para os irmãos o contato do pastor Thomas Wagner para a aquisição do livro."
    ],
    "referenciasBiblicas": "Mateus 18:15-20; Atos 15:1-29; 1 Pedro 2:9",
    "geminiUrl": "/gemini-notes/his_aula4_2026-09-01.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-1-2026-10-06",
    "disciplinaId": "disc-1",
    "aulaNum": 9,
    "unidade": 2,
    "dateIso": "2026-10-06",
    "dateBr": "06/10/2026",
    "theme": "Aula 9 • Avaliação e Regras de Leitura",
    "resumoGeral": "Avaliação acadêmica e regras de leitura e exposição histórica sobre o missionário Robert Reid Kalley Avaliação e Regras de Leitura: Apresentação da avaliação aprovada por todos. Estabelecida a obrigatoriedade da leitura de textos e transcrições. Trajetória de Robert Kalley: Exposição sobre a conversão, formação médica e início da atuação missionária de Robert Reid Kalley na Ilha da Madeira. Desafios Missionários e Encerramento: Relatos sobre campos missionários atuais e recomendação de leitura para fixação do conteúdo.",
    "topicos": [
      {
        "titulo": "Avaliação e Regras de Leitura",
        "texto": "Apresentação da avaliação aprovada por todos. Estabelecida a obrigatoriedade da leitura de textos e transcrições."
      },
      {
        "titulo": "Trajetória de Robert Kalley",
        "texto": "Exposição sobre a conversão, formação médica e início da atuação missionária de Robert Reid Kalley na Ilha da Madeira."
      },
      {
        "titulo": "Desafios Missionários e Encerramento",
        "texto": "Relatos sobre campos missionários atuais e recomendação de leitura para fixação do conteúdo."
      },
      {
        "titulo": "Avaliação da Primeira Unidade",
        "texto": "Ary Queiroz Jr abriu a aula registrando que achou a avaliação muito boa e destacando que valoriza a participação em sala de aula e a leitura dos textos disponibilizados. Ary Queiroz Jr explicou que considera todos aprovados, pois entende que a avaliação é uma formalidade e quem aprende consegue responder adequadamente. O estudante Sérg..."
      },
      {
        "titulo": "Comentários sobre as Questões da Prova",
        "texto": "Ary Queiroz Jr realizou a leitura e correção comentada de várias questões da avaliação, indicando que a questão 3 era falsa por atribuir incorretamente dioceses à prática apostólica, a questão 4 era falsa por misturar o separatismo com os excessos anabatistas, a questão 5 e 6 eram verdadeiras sobre figuras separatistas como Richard Fit..."
      },
      {
        "titulo": "Discussão sobre o Movimento Anabatista",
        "texto": "Sérgio Dantas levantou uma dúvida sobre a compreensão do movimento anabatista no Brasil e suas divisões entre bíblicos e radicais milenaristas baseando-se em leituras. Ary Queiroz Jr esclareceu que generalizações pejorativas são comuns, mas que o movimento inicial teve traços de radicalização devido à luta com o protestantismo estatiza..."
      },
      {
        "titulo": "Regras de Leitura Obrigatória e Uso de Transcrições",
        "texto": "Ary Queiroz Jr consultou a turma sobre o hábito de leitura das transcrições geradas pelo Gemini, obtendo confirmação de estudantes como Paulo Lima, Grazi Guimarães, Rosiane Lima (Rosi) e celso oliveira. Em seguida, Ary Queiroz Jr estabeleceu como regra a obrigatoriedade da leitura de dois textos enviados no grupo e das transcrições das..."
      }
    ],
    "proximasEtapas": [
      "Ler materiais: Baixar e realizar a leitura dos dois textos disponibilizados no grupo. Ler as transcrições das aulas para acompanhar o conteúdo complementar ministrado.",
      "Verificar transcrições: Anotar datas históricas específicas mencionadas durante as aulas. Comparar as anotações próprias com os resumos das transcrições para garantir a precisão dos registros.",
      "Analisar Resumo Gemini: Avaliar se o conteúdo do resumo está coerente com os temas abordados na aula."
    ],
    "referenciasBiblicas": "Mateus 18:15-20; Atos 15:1-29; 1 Pedro 2:9",
    "geminiUrl": "https://docs.google.com/document/d/1SMYzyOHEFRtDWfNcnfN6u274xaRfiDtZQwxOMt2T49M/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-1-2026-10-13",
    "disciplinaId": "disc-1",
    "aulaNum": 10,
    "unidade": 2,
    "dateIso": "2026-10-13",
    "dateBr": "13/10/2026",
    "theme": "Aula 10 • Dr. Robert Reid Kalley (1809–1888)",
    "resumoGeral": "A missão pioneira do Dr. Kalley na Ilha da Madeira, o sucesso evangelístico, as perseguições civis e religiosas de 1843 a 1846 e a fuga dramática dos convertidos. Pontos de aprofundamento vinculados à unidade: Dr. Robert Reid Kalley (1809–1888) (Médico escocês presbiteriano de nascimento que adotou a eclesiologia congregacional independente na prática missionária.) Sarah Poulton Wilson Kalley (Esposa de Kalley, vinda de família puritana congregacional inglesa; compositora de dezenas de Salmos e Hinos e incentivadora do modelo de governo local.) Base documental da avaliação: 3 textos enviados pelo professor no WhatsApp: (1) Síntese do Congregacionalismo Brasileiro; (2...",
    "topicos": [
      {
        "titulo": "Dr. Robert Reid Kalley (1809–1888)",
        "texto": "Médico escocês presbiteriano de nascimento que adotou a eclesiologia congregacional independente na prática missionária."
      },
      {
        "titulo": "Sarah Poulton Wilson Kalley",
        "texto": "Esposa de Kalley, vinda de família puritana congregacional inglesa; compositora de dezenas de Salmos e Hinos e incentivadora do modelo de governo local."
      },
      {
        "titulo": "Igreja Evangélica Pernambucana (19/10/1873)",
        "texto": "Fundada por Kalley em Recife, sendo a primeira igreja evangélica de brasileiros nativos no Nordeste."
      },
      {
        "titulo": "A Gênese dos 28 Artigos (1874–1876)",
        "texto": "Kalley convocou a congregação fluminense para que todos soubessem o que financiavam e criam. O texto inicial tinha 27 artigos sem o artigo 4º e sem versículos, adicionados depois em debate democrático em assembleia."
      },
      {
        "titulo": "Help for Brazil e UEA",
        "texto": "Sociedades missionárias britânicas que sustentaram o envio de novos obreiros ao Brasil após a partida dos Kalley."
      }
    ],
    "proximasEtapas": [
      "Revisar: 3 textos enviados pelo professor no WhatsApp: (1) Síntese do Congregacionalismo Brasileiro; (2) Síntese dos 28 Artigos; (3) Análise analítica ampla dos 28 Artigos."
    ],
    "referenciasBiblicas": "Mateus 18:15-20; Atos 15:1-29; 1 Pedro 2:9",
    "geminiUrl": "https://docs.google.com/document/d/19OA-kkDNv6T02-2KmJSZU1TwBUctCEJdI1RGNTZ2Hlw/edit",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-1-2026-10-20",
    "disciplinaId": "disc-1",
    "aulaNum": 11,
    "unidade": 2,
    "dateIso": "2026-10-20",
    "dateBr": "20/10/2026",
    "theme": "Aula 11 • Igreja Evangélica Pernambucana (19/10/1873)",
    "resumoGeral": "Chegada de Robert e Sarah Kalley ao Brasil (1855), estabelecimento em Petrópolis e a organização da histórica Igreja Evangélica Fluminense (1858). Pontos de aprofundamento vinculados à unidade: Igreja Evangélica Pernambucana (19/10/1873) (Fundada por Kalley em Recife, sendo a primeira igreja evangélica de brasileiros nativos no Nordeste.) Dr. Robert Reid Kalley (1809–1888) (Médico escocês presbiteriano de nascimento que adotou a eclesiologia congregacional independente na prática missionária.) Base documental da avaliação: 3 textos enviados pelo professor no WhatsApp: (1) Síntese do Congregacionalismo Brasileiro; (2) Síntese dos 28 Artigos; (3) Análise analítica ampl...",
    "topicos": [
      {
        "titulo": "Igreja Evangélica Pernambucana (19/10/1873)",
        "texto": "Fundada por Kalley em Recife, sendo a primeira igreja evangélica de brasileiros nativos no Nordeste."
      },
      {
        "titulo": "Dr. Robert Reid Kalley (1809–1888)",
        "texto": "Médico escocês presbiteriano de nascimento que adotou a eclesiologia congregacional independente na prática missionária."
      },
      {
        "titulo": "Sarah Poulton Wilson Kalley",
        "texto": "Esposa de Kalley, vinda de família puritana congregacional inglesa; compositora de dezenas de Salmos e Hinos e incentivadora do modelo de governo local."
      },
      {
        "titulo": "A Gênese dos 28 Artigos (1874–1876)",
        "texto": "Kalley convocou a congregação fluminense para que todos soubessem o que financiavam e criam. O texto inicial tinha 27 artigos sem o artigo 4º e sem versículos, adicionados depois em debate democrático em assembleia."
      },
      {
        "titulo": "Help for Brazil e UEA",
        "texto": "Sociedades missionárias britânicas que sustentaram o envio de novos obreiros ao Brasil após a partida dos Kalley."
      }
    ],
    "proximasEtapas": [
      "Revisar: 3 textos enviados pelo professor no WhatsApp: (1) Síntese do Congregacionalismo Brasileiro; (2) Síntese dos 28 Artigos; (3) Análise analítica ampla dos 28 Artigos."
    ],
    "referenciasBiblicas": "Mateus 18:15-20; Atos 15:1-29; 1 Pedro 2:9",
    "geminiUrl": "https://docs.google.com/document/d/1Uix9VsejGbtSt-P30Wk8g9tVQe84pQrXax22yh3Y4Mw/edit",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-1-2026-10-27",
    "disciplinaId": "disc-1",
    "aulaNum": 12,
    "unidade": 2,
    "dateIso": "2026-10-27",
    "dateBr": "27/10/2026",
    "theme": "Aula 12 • Dúvidas sobre voto",
    "resumoGeral": "Reunião acadêmica abordou o histórico denominacional e o planejamento de avaliações. Dúvidas sobre voto: Debate sobre a participação de jovens nas assembleias e a revisão dos estatutos. Histórico e expansão Discussão sobre as práticas pastorais e a expansão das igrejas fluminense e pernambucana. Cronograma de aulas: Confirmação do calendário de avaliações e planejamento para o retorno em 10 de novembro.",
    "topicos": [
      {
        "titulo": "Dúvidas sobre voto",
        "texto": "Debate sobre a participação de jovens nas assembleias e a revisão dos estatutos. Histórico e expansão Discussão sobre as práticas pastorais e a expansão das igrejas fluminense e pernambucana."
      },
      {
        "titulo": "Cronograma de aulas",
        "texto": "Confirmação do calendário de avaliações e planejamento para o retorno em 10 de novembro."
      }
    ],
    "proximasEtapas": [
      "Buscar orientacao: Conversar em particular com o pastor Ary para receber orientacao sobre a participacao de jovens em assembleias e votacoes na igreja.",
      "Analisar estatuto: Verificar se o documento interno da igreja possui lacunas sobre a participacao de menores em votacoes.",
      "Compartilhar questionario: Disponibilizar o questionario caleiano de 10 perguntas no grupo da turma.",
      "Estudar material: Realizar a leitura e atualizacao dos conteudos e resumos antes de cada aula."
    ],
    "referenciasBiblicas": "números 4 e 5",
    "geminiUrl": "https://docs.google.com/document/d/1Kc4aCpxigVaTgRncC_YysuKmjnO9N-c0DHySAFoGpY4/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-1-2026-11-10",
    "disciplinaId": "disc-1",
    "aulaNum": 13,
    "unidade": 2,
    "dateIso": "2026-11-10",
    "dateBr": "10/11/2026",
    "theme": "Aula 13 • A Gênese dos 28 Artigos (1874–1876)",
    "resumoGeral": "Análise exegética e histórica dos 28 Artigos de Fé da Breve Exposição: Artigos 1 a 10 cobrindo Bibliologia, Teologia Própria, Criação e Queda (Federalismo em Adão). Pontos de aprofundamento vinculados à unidade: A Gênese dos 28 Artigos (1874–1876) (Kalley convocou a congregação fluminense para que todos soubessem o que financiavam e criam. O texto inicial tinha 27 artigos sem o artigo 4º e sem versículos, adicionados depois em debate democrático em assembleia.) 1913 e as \"Igrejas Indenominacionais do Brasil\" (Criação da denominação com 13 igrejas; evitou-se a palavra \"Congregacional\" para fugir da pecha de liberalismo teológico, unitarianismo e universalismo que cont...",
    "topicos": [
      {
        "titulo": "A Gênese dos 28 Artigos (1874–1876)",
        "texto": "Kalley convocou a congregação fluminense para que todos soubessem o que financiavam e criam. O texto inicial tinha 27 artigos sem o artigo 4º e sem versículos, adicionados depois em debate democrático em assembleia."
      },
      {
        "titulo": "1913 e as \"Igrejas Indenominacionais do Brasil\"",
        "texto": "Criação da denominação com 13 igrejas; evitou-se a palavra \"Congregacional\" para fugir da pecha de liberalismo teológico, unitarianismo e universalismo que contaminava igrejas irmãs da Inglaterra e dos EUA."
      }
    ],
    "proximasEtapas": [
      "Revisar: 3 textos enviados pelo professor no WhatsApp: (1) Síntese do Congregacionalismo Brasileiro; (2) Síntese dos 28 Artigos; (3) Análise analítica ampla dos 28 Artigos."
    ],
    "referenciasBiblicas": "Mateus 18:15-20; Atos 15:1-29; 1 Pedro 2:9",
    "geminiUrl": "https://docs.google.com/document/d/1Ku9I4Y1jOTe0EV4qmL3_6B2LLjfKwjcBNwJneLx8cMw/edit",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-1-2026-11-17",
    "disciplinaId": "disc-1",
    "aulaNum": 14,
    "unidade": 2,
    "dateIso": "2026-11-17",
    "dateBr": "17/11/2026",
    "theme": "Aula 14 • 1913 e as \"Igrejas Indenominacionais do Brasil\"",
    "resumoGeral": "Conclusão dos 28 Artigos (Cristologia, Soteriologia, ritos no Artigo 24 e escatologia) e organização denominacional: Help for Brazil, UEA e convenção de 1913 (\"Igrejas Indenominacionais do Brasil\"). Pontos de aprofundamento vinculados à unidade: 1913 e as \"Igrejas Indenominacionais do Brasil\" (Criação da denominação com 13 igrejas; evitou-se a palavra \"Congregacional\" para fugir da pecha de liberalismo teológico, unitarianismo e universalismo que contaminava igrejas irmãs da Inglaterra e dos EUA.) Help for Brazil e UEA (Sociedades missionárias britânicas que sustentaram o envio de novos obreiros ao Brasil após a partida dos Kalley.) Base documental da avaliação: 3 te...",
    "topicos": [
      {
        "titulo": "1913 e as \"Igrejas Indenominacionais do Brasil\"",
        "texto": "Criação da denominação com 13 igrejas; evitou-se a palavra \"Congregacional\" para fugir da pecha de liberalismo teológico, unitarianismo e universalismo que contaminava igrejas irmãs da Inglaterra e dos EUA."
      },
      {
        "titulo": "Help for Brazil e UEA",
        "texto": "Sociedades missionárias britânicas que sustentaram o envio de novos obreiros ao Brasil após a partida dos Kalley."
      },
      {
        "titulo": "A Gênese dos 28 Artigos (1874–1876)",
        "texto": "Kalley convocou a congregação fluminense para que todos soubessem o que financiavam e criam. O texto inicial tinha 27 artigos sem o artigo 4º e sem versículos, adicionados depois em debate democrático em assembleia."
      },
      {
        "titulo": "Artigo 24 (Cessação dos Ritos e Refutação Dispensacionalista)",
        "texto": "Afirma expressamente que os ritos judaicos mosaicos cessaram de forma definitiva com a vinda de Cristo, restando apenas dois ritos cristãos: Batismo e Ceia do Senhor (incompatível com retorno de sacrifícios milenares terrenos)."
      },
      {
        "titulo": "Igreja Evangélica Pernambucana (19/10/1873)",
        "texto": "Fundada por Kalley em Recife, sendo a primeira igreja evangélica de brasileiros nativos no Nordeste."
      }
    ],
    "proximasEtapas": [
      "Revisar: 3 textos enviados pelo professor no WhatsApp: (1) Síntese do Congregacionalismo Brasileiro; (2) Síntese dos 28 Artigos; (3) Análise analítica ampla dos 28 Artigos."
    ],
    "referenciasBiblicas": "Mateus 18:15-20; Atos 15:1-29; 1 Pedro 2:9",
    "geminiUrl": "https://docs.google.com/document/d/1gvg7E0kf0cakBge6lHp_cKToXM86S_utejmoQ0_0X9w/edit",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-2-2026-08-11",
    "disciplinaId": "disc-2",
    "aulaNum": 1,
    "unidade": 1,
    "dateIso": "2026-08-11",
    "dateBr": "11/08/2026",
    "theme": "Aula 1 • Abertura da Disciplina e Metas Semestrais",
    "resumoGeral": "A disciplina de História do Pensamento Cristão apresentou diretrizes avaliativas e a centralidade das confissões doutrinárias. Objetivos e diretrizes avaliativas O curso focará na evolução histórica do pensamento cristão e teologia. As avaliações incluem um trabalho de pesquisa sobre o Iluminismo, prova objetiva e exame oral. Centralidade das confissões doutrinárias",
    "topicos": [
      {
        "titulo": "Abertura da Disciplina e Metas Semestrais",
        "texto": "HILARIO JOSE BISPO GRACA deu as boas-vindas aos estudantes para o novo semestre letivo da disciplina \"História do Pensamento Cristão\" e realizou uma oração de abertura focada no aprendizado e no crescimento espiritual. O professor ressaltou a importância de os alunos terem cursado o primeiro módulo da disciplina e destacou que o objeti..."
      },
      {
        "titulo": "Orientações sobre as Avaliações (AV1, AV2 e AV3)",
        "texto": "HILARIO JOSE BISPO GRACA detalhou o sistema de avaliação, seguindo as diretrizes da coordenação para apresentar as regras logo na primeira aula. A primeira avaliação (AV1) consistirá em um trabalho acadêmico de pesquisa sobre o Iluminismo e a modernidade, com tópicos obrigatórios que abordam o conflito entre razão e revelação, os impac..."
      },
      {
        "titulo": "Diferenciação das Disciplinas Teológicas e Históricas",
        "texto": "HILARIO JOSE BISPO GRACA apresentou um diagrama para diferenciar os focos de disciplinas que frequentemente se sobrepõem, como Introdução à Teologia Cristã, História do Pensamento Cristão e História da Igreja. Explicou que a Introdução à Teologia Cristã foca na história da interpretação do texto sagrado e nos métodos que originaram os ..."
      },
      {
        "titulo": "Evolução Histórica do Pensamento Cristão",
        "texto": "HILARIO JOSE BISPO GRACA traçou uma linha do tempo do pensamento cristão, iniciando no livro de Atos com o primeiro concílio em Jerusalém e passando pelo período dos pais apostólicos, cujo propósito era a preservação da unidade e devoção da igreja. Na sequência, detalhou o período da Patrística, marcado pelo combate a heresias internas..."
      },
      {
        "titulo": "Sistematização Doutrinária na Ortodoxia Protestante",
        "texto": "HILARIO JOSE BISPO GRACA explicou que, após a Reforma Protestante, a nova igreja reformada necessitou de um esforço intencional para se consolidar, o que gerou a necessidade de sistematizar e confessar a fé publicamente para se contrapor ao arcabouço dogmático já consolidado da Igreja Católica. Esse movimento deu origem à ortodoxia pro..."
      },
      {
        "titulo": "O Debate Atual sobre a Confissão de Fé na Denominação",
        "texto": "HILARIO JOSE BISPO GRACA contextualizou a importância histórica das confissões de fé trazendo um panorama atual da sua própria denominação, a União das Igrejas Evangélicas Congregacionais do Brasil (UIECB), que está consultando as igrejas locais sobre a real necessidade de adotar uma confissão de fé formal. O professor mencionou que o ..."
      },
      {
        "titulo": "Conceito, Funções e Estrutura das Confissões e Catecismos",
        "texto": "HILARIO JOSE BISPO GRACA definiu conceitualmente que uma confissão de fé é uma declaração organizada e sistemática das doutrinas principais de uma igreja ou denominação, responsável por responder \"o que nós cremos\". Já o catecismo é um instrumento didático de ensino, frequentemente estruturado em perguntas e respostas, feito para respo..."
      }
    ],
    "proximasEtapas": [
      "Pesquisar Iluminismo: Realizar pesquisa acadêmica sobre o Iluminismo, cobrindo o problema central da razão e revelação, princípios iluministas, críticas à autoridade da Bíblia e milagres, liberalismo teológi...",
      "Organizar Trabalho: Subdividir o trabalho acadêmico nos tópicos obrigatórios apresentados em aula, observando as normas da ABNT e garantindo que o grupo não exceda três componentes.",
      "Compartilhar material: Disponibilizar o quadro informativo sobre a história do pensamento cristão para a turma após a aula.",
      "Realizar trabalho acadêmico: Elaborar o trabalho solicitado com cuidado e iniciar a pesquisa imediatamente para garantir o aprendizado sobre o liberalismo teológico."
    ],
    "referenciasBiblicas": "Neemias 8; Efésios 4:11-14",
    "geminiUrl": "/gemini-notes/hpc_aula1_2026-08-11.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-2-2026-08-18",
    "disciplinaId": "disc-2",
    "aulaNum": 2,
    "unidade": 1,
    "dateIso": "2026-08-18",
    "dateBr": "18/08/2026",
    "theme": "Aula 2 • Abertura e Logística",
    "resumoGeral": "Reunião de capacitação teológica discutiu fundamentos da Reforma Protestante e estratégias para fortalecer a liderança eclesiástica. Fundamentos da Fé Reformada O encontro estabeleceu a teologia reformada através da soberania divina e autoridade suprema das Escrituras. A priorização da pregação sistemática e do ensino doutrinário claro foi destacada como essencial. Organização e Prática Ministerial",
    "topicos": [
      {
        "titulo": "Abertura e Logística",
        "texto": "Hilario Jose Bispo Graca iniciou a reunião, verificando a presença dos participantes e garantindo que o registro da sessão estivesse em andamento. Carla P dos S de Almeida conduziu a oração inicial, solicitando orientação para o encontro. Carla também mencionou uma tarefa pendente referente a uma lista de missionários, que estava sendo..."
      },
      {
        "titulo": "Visão Geral da Tradição Reformada",
        "texto": "Hilario enfatizou a necessidade de sistematizar a fé reformada para consolidar o movimento, observando que a Reforma Protestante não foi um processo uniforme, mas composto por diversos centros com ênfases variadas. Embora nomes como Lutero e Calvino sejam centrais, o movimento incluiu tradições distintas, como a luterana, a reformada, ..."
      },
      {
        "titulo": "Características Centrais da Fé Reformada",
        "texto": "Apesar das diferenças, os movimentos compartilhavam princípios fundamentais: a autoridade suprema das Escrituras (Sola Scriptura), a soberania de Deus, a salvação pela graça e um culto baseado em princípios bíblicos. Hilario destacou a Reforma Suíça, liderada inicialmente por Huldrych Zwingli, como um ponto crucial para a consolidação ..."
      },
      {
        "titulo": "A Importância de Huldrych Zwingli",
        "texto": "Zwingli, sacerdote humanista de Zurique, foi essencial para a Reforma, defendendo uma adesão inflexível às Escrituras como a única autoridade para a doutrina e a vida da igreja. O participante explicou que a abordagem de Zwingli exigia abandonar qualquer prática sem respaldo bíblico, rejeitando a colocação da tradição eclesiástica no m..."
      },
      {
        "titulo": "Fidelidade Ministerial",
        "texto": "Hilario destacou que as pessoas no ministério devem ser fiéis na distribuição da Palavra de Deus, conforme sugerido em 1 Coríntios 4:2, resistindo à tendência atual de inovações e diversões que carecem de base bíblica. O poder ministerial reside na Palavra, e não em métodos humanos ou na criatividade pessoal."
      },
      {
        "titulo": "Reforma do Culto e Liturgia",
        "texto": "O movimento reformado enfatizou a simplificação da liturgia e a centralidade da pregação, removendo imagens e práticas sem fundamentação bíblica. Hilario argumentou contra a transformação do culto em entretenimento, observando que uma liturgia simples e previsível mantém o foco na pregação. O orador compartilhou uma experiência de seus..."
      },
      {
        "titulo": "Influência Moral da Igreja",
        "texto": "Hilario enfatizou que a igreja deve servir como padrão moral para a sociedade, criticando a participação de alguns líderes religiosos em escândalos e políticas partidárias. O participante notou que a igreja corre o risco de perder sua seriedade e testemunho quando se iguala a comportamentos mundanos, destacando que a instituição não de..."
      }
    ],
    "proximasEtapas": [
      "Coletar assinatura: Solicitar a assinatura da participante no documento após a entrega do material.",
      "Iniciar estudo bíblico: Utilizar a revista do pastor Vanderlei para iniciar estudos bíblicos estruturados com os membros da igreja.",
      "Adicionar espaco no drive: Liberar espaco de armazenamento no Drive para que os slides das aulas sejam disponibilizados.",
      "Ler livros recomendados: Adquirir e ler as obras A missao de Deus e A missao do povo de Deus de Christopher Wright."
    ],
    "referenciasBiblicas": "1 Coríntios 4:2; Mateus 24",
    "geminiUrl": "/gemini-notes/hpc_aula2_2026-08-18.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-2-2026-08-25",
    "disciplinaId": "disc-2",
    "aulaNum": 3,
    "unidade": 1,
    "dateIso": "2026-08-25",
    "dateBr": "25/08/2026",
    "theme": "Aula 3 • Debates Teológicos e Eclesiásticos",
    "resumoGeral": "Aula sobre teologia reformada abordou fundamentos históricos, disputas doutrinárias e a centralidade da pregação bíblica expositiva. Fundamentos da Reforma Protestante O estudo revisou a cronologia do pensamento cristão, destacando a autoridade das Escrituras e a sistematização doutrinária realizada por teólogos suíços.",
    "topicos": [
      {
        "titulo": "Debates Teológicos e Eclesiásticos",
        "texto": "A sessão explorou divergências históricas sobre a Eucaristia, o confronto entre o calvinismo e arminianismo e a oposição imposta pela Contra-Reforma. Foco no Ministério Pastoral Defendeu-se a pregação expositiva como ferramenta vital contra desvios doutrinários, rejeitando entretenimento em favor da autoridade bíblica e fidelidade teol..."
      },
      {
        "titulo": "Celebração de Aniversário",
        "texto": "O participante Daniel Rodrigues e outros estudantes parabenizam o professor, HILARIO JOSE BISPO GRACA, pelo seu aniversário ocorrido no dia 24 de agosto, no qual completou 58 anos."
      },
      {
        "titulo": "Oração de Abertura",
        "texto": "A pedido do professor HILARIO JOSE BISPO GRACA, o participante Rodrigo Oliveira realiza uma oração inicial, agradecendo a Deus e pedindo direcionamento, discernimento e capacidade de absorção dos ensinamentos que serão ministrados na aula."
      },
      {
        "titulo": "Introdução à Teologia Reformada",
        "texto": "O professor HILARIO JOSE BISPO GRACA explica que o estudo da história do pensamento cristão exige observar a Reforma Protestante como o marco inicial de uma teologia reformada baseada em princípios e estandartes específicos. Enfatiza-se a necessidade de compreender o período histórico e o contexto teológico vigente em cada época e regi..."
      },
      {
        "titulo": "Abordagem Pedagógica e Divisões Históricas",
        "texto": "O palestrante HILARIO JOSE BISPO GRACA esclarece que o foco do curso é fornecer uma visão panorâmica dos acontecimentos históricos e divisões básicas do pensamento cristão, deixando debates teológicos mais profundos para o nível de pós-graduação. O professor recapitula a cronologia abordada desde os pais apostólicos, passando por Agost..."
      },
      {
        "titulo": "Consolidação da Tradição Reformada",
        "texto": "Conforme exposto por HILARIO JOSE BISPO GRACA, embora o conhecimento popular associe a Reforma Protestante quase exclusivamente a Martim Lutero, a consolidação e a sistematização da tradição reformada foram realizadas principalmente por Ulrico Zuínglio e João Calvino. É ressaltado que, apesar de Lutero ter sido contemporâneo de Zuíngli..."
      },
      {
        "titulo": "Orientações sobre Trabalho Acadêmico (AV1)",
        "texto": "O professor HILARIO JOSE BISPO GRACA relembra os estudantes sobre o trabalho planejado para a avaliação AV1, cujo tema central é o Iluminismo. Adverte-se que os alunos devem formar grupos de dois ou três integrantes, ou optar pelo formato individual, utilizando os slides da primeira aula para verificar as exigências e estruturas requer..."
      }
    ],
    "proximasEtapas": [
      "Pesquisar Iluminismo: Realizar a pesquisa sobre o tema, organizar grupos de trabalho e consultar os slides da primeira aula para preparar a avaliação AV1.",
      "Corrigir material didático: Realizar correções nas datas e séculos mencionadas no material da aula.",
      "Disponibilizar materiais didáticos: Upload dos slides corrigidos no Google Drive para os alunos."
    ],
    "referenciasBiblicas": "2 Timóteo 4:2-4; Jeremias 17:9; Filipenses 4:6-7; Isaías 55; Filipenses 4",
    "geminiUrl": "/gemini-notes/hpc_aula3_2026-08-25.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-2-2026-09-01",
    "disciplinaId": "disc-2",
    "aulaNum": 4,
    "unidade": 1,
    "dateIso": "2026-09-01",
    "dateBr": "01/09/2026",
    "theme": "Aula 4 • Abertura e Oração",
    "resumoGeral": "A aula abordou a história dos reformadores, as controvérsias teológicas entre calvinismo e arminianismo e diretrizes acadêmicas. História da Reforma Protestante A reunião revisou os legados dos reformadores e a sistematização da fé através de confissões históricas. O período destacou a formação das tradições confessionais",
    "topicos": [
      {
        "titulo": "Abertura e Oração",
        "texto": "O encontro teve início com saudações entre os participantes. O facilitador HILARIO JOSE BISPO GRACA solicitou ao participante Salatiel Rodrigues que realizasse uma oração inicial, buscando sabedoria divina para a condução e o aprendizado do curso."
      },
      {
        "titulo": "Recapitulação sobre Reformadores",
        "texto": "HILARIO JOSE BISPO GRACA revisou os papéis de Martinho Lutero, Ulrico Zuínglio e João Calvino. Lutero, autor das 95 Teses, é apontado como o pioneiro do rompimento e das controvérsias iniciais. Zuínglio destacou-se pela ênfase na autoridade das escrituras e pela reforma do culto, enquanto Calvino, na Suíça, consolidou a teologia reform..."
      },
      {
        "titulo": "Formação das Tradições Confessionais",
        "texto": "Foi discutido que o período da Reforma foi crucial para a criação de grandes famílias confessionais. O facilitador citou documentos fundamentais, como a Confissão de Augsburgo e o Livro da Concórdia para a tradição luterana, e a Confissão Helvética para a tradição reformada, destacando a importância desses documentos para a sistematiza..."
      },
      {
        "titulo": "Concílio de Trento e Reação Católica",
        "texto": "HILARIO JOSE BISPO GRACA mencionou que a Igreja Católica respondeu à Reforma com o Concílio de Trento. O facilitador observou que, ao longo dos séculos, incluindo o Concílio Vaticano II e o movimento de renovação carismática no final da década de 70 e início da década de 80, a instituição católica buscou se adaptar para preservar seus ..."
      },
      {
        "titulo": "Ortodoxia Protestante e Documentos Confessionais",
        "texto": "Após a primeira geração de reformadores, houve um movimento de sistematização doutrinária, resultando em confissões e catecismos. Foram citados o Catecismo de Heidelberg, a Confissão Helvética, os Cânones de Dort, a Confissão de Fé de Westminster, o Catecismo Maior de Westminster e a Declaração de Savoy, esta última sendo uma adaptação..."
      },
      {
        "titulo": "Controvérsia entre Calvinismo e Arminianismo",
        "texto": "O facilitador abordou o embate histórico entre calvinistas e arminianos, citando Jacobus Arminius. Após o falecimento de Arminius, seus seguidores apresentaram a \"Remonstrância\" em 1610, questionando aspectos da predestinação calvinista e propondo uma revisão teológica baseada na Bíblia sobre a soberania divina e a responsabilidade hum..."
      },
      {
        "titulo": "Pressupostos Filosóficos da Disputa",
        "texto": "HILARIO JOSE BISPO GRACA explicou que os remonstrantes argumentavam que a soberania absoluta de Deus, se interpretada de forma estrita, poderia anular o livre-arbítrio humano e fragilizar a responsabilidade moral. Em contrapartida, discutiu-se como diferentes vertentes teológicas tentam conciliar a soberania divina com a responsabilida..."
      }
    ],
    "proximasEtapas": [
      "Disponibilizar textos teológicos: Enviar materiais de apoio sobre as diferenças doutrinárias entre calvinismo e arminianismo para os alunos que pedirem.",
      "Realizar trabalho acadêmico: Desenvolver um texto organizado, com cerca de 5 a 6 páginas, demonstrando síntese e sistematização de ideias sobre o tema proposto."
    ],
    "referenciasBiblicas": "1 Timóteo 4:16; Tito 1:9; Romanos 1:16-17; Judas 1:3",
    "geminiUrl": "/gemini-notes/hpc_aula4_2026-09-01.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-2-2026-10-06",
    "disciplinaId": "disc-2",
    "aulaNum": 9,
    "unidade": 2,
    "dateIso": "2026-10-06",
    "dateBr": "06/10/2026",
    "theme": "Aula 9 • Impacto do Iluminismo teológico",
    "resumoGeral": "Debate sobre o impacto do Iluminismo na teologia e a centralidade da Bíblia. Impacto do Iluminismo teológico: Iluminismo colocou a razão acima das Escrituras. Teólogos buscaram explicações naturalistas para os milagres. Subjetividade de Friedrich Schleiermacher: Friedrich Schleiermacher centrou a religião na experiência interior. Tradição reformada criticou essa subjetividade por desconsiderar a revelação divina. Autoridade das Escrituras: Escrituras permanecem como padrão seguro contra o liberalismo. Tarefa teológica exige responder ao contexto mantendo fundamentos bíblicos.",
    "topicos": [
      {
        "titulo": "Impacto do Iluminismo teológico",
        "texto": "Iluminismo colocou a razão acima das Escrituras. Teólogos buscaram explicações naturalistas para os milagres."
      },
      {
        "titulo": "Subjetividade de Friedrich Schleiermacher",
        "texto": "Friedrich Schleiermacher centrou a religião na experiência interior. Tradição reformada criticou essa subjetividade por desconsiderar a revelação divina."
      },
      {
        "titulo": "Autoridade das Escrituras",
        "texto": "Escrituras permanecem como padrão seguro contra o liberalismo. Tarefa teológica exige responder ao contexto mantendo fundamentos bíblicos."
      },
      {
        "titulo": "Abertura da Aula e Oração Inicial",
        "texto": "Hilario Jose Bispo Graca iniciou a discussão sobre as repercussões do Iluminismo na teologia cristã e o surgimento da teologia liberal, destacando que o tema é amplo e abordará pensadores expressivos até o pensamento cristão contemporâneo. Em seguida, Rosiane Lima (Rosi) conduziu a oração inicial, solicitando compreensão e sabedoria pa..."
      },
      {
        "titulo": "Influência do Iluminismo na Teologia Reformada",
        "texto": "Hilario Jose Bispo Graca abordou como o pensamento moderno e o Iluminismo forçaram os teólogos a reagir à pressão exercida sobre a fé e a tradição reformada. O problema central consistiu na tentativa de adaptar a fé cristã às novas formas de pensamento sobre a vida, apontando que o pensamento kantiano e seu antropocentrismo representar..."
      },
      {
        "titulo": "A Razão Humana como Critério de Verdade",
        "texto": "Hilario Jose Bispo Graca destacou que o Iluminismo estabeleceu a razão como julgadora da verdade religiosa, em contraste com a tradição reformada que fundamentava todas as coisas na autoridade e inspiração das Escrituras. Como consequência da mudança para o antropocentrismo de Kant, a Bíblia passou a ser submetida à razão humana, valid..."
      },
      {
        "titulo": "Ceticismo e Explicações Naturalistas para os Milagres",
        "texto": "Hilario Jose Bispo Graca discutiu a consequente suspeita diante dos milagres nas narrativas bíblicas, que passaram a receber explicações naturalistas por meio de argumentos humanos e científicos, reduzindo-os a construções religiosas ou alegorias. Como exemplo, Hilario Jose Bispo Graca citou a travessia do Mar Vermelho descrita em Êxod..."
      }
    ],
    "proximasEtapas": [
      "Estudar Filósofos: Estudar as obras e o pensamento de Emanuel Kant e Friedrich Schleiermacher para aprofundar o entendimento sobre a teologia moderna.",
      "Mostrar livro: Mostrar o livro sobre a história do protestantismo em Portugal na próxima semana."
    ],
    "referenciasBiblicas": "Romanos 2, :14; Romanos 11",
    "geminiUrl": "https://docs.google.com/document/d/1gwe3NgkR7EzAJ7F_GLIXwLP07oLO8KNgphP33PhfaMw/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-2-2026-10-13",
    "disciplinaId": "disc-2",
    "aulaNum": 10,
    "unidade": 2,
    "dateIso": "2026-10-13",
    "dateBr": "13/10/2026",
    "theme": "Aula 10 • Liberalismo Teológico e Avivamentos",
    "resumoGeral": "Aula abordou avivamentos espirituais e teologia moderna com foco na soberania divina e pregação cristocêntrica. Liberalismo Teológico e Avivamentos: A aula debateu o liberalismo teológico de Friedrich Schleiermacher e a soberania divina nos despertamentos históricos mundiais. Despertamentos e Oração Diária: O encontro analisou o impacto de Jonathan Edwards e John Wesley, destacando a necessidade de oração contínua e conversão genuína. Legado Missionário e Conclusão A sessão concluiu ressaltando a importância da pregação expositiva e da expansão missionária para evitar o declínio espiritual.",
    "topicos": [
      {
        "titulo": "Liberalismo Teológico e Avivamentos",
        "texto": "A aula debateu o liberalismo teológico de Friedrich Schleiermacher e a soberania divina nos despertamentos históricos mundiais."
      },
      {
        "titulo": "Despertamentos e Oração Diária",
        "texto": "O encontro analisou o impacto de Jonathan Edwards e John Wesley, destacando a necessidade de oração contínua e conversão genuína. Legado Missionário e Conclusão A sessão concluiu ressaltando a importância da pregação expositiva e da expansão missionária para evitar o declínio espiritual."
      }
    ],
    "proximasEtapas": [
      "Estudar Redes Sociais: Pesquisar e investir em métodos para utilizar meios digitais de forma intencional na evangelização e integração da igreja.",
      "Pesquisar David Bran: Realizar estudos sobre a vida e a obra missionária de David Bran. Aprofundar o conhecimento sobre sua influência no despertamento missionário.",
      "Enviar notas: Encaminhar as notas dos trabalhos realizados aos estudantes. Realizar o envio durante a semana."
    ],
    "referenciasBiblicas": "Atos 19; Apocalipse 2; Lucas 12; Gênesis 12; Atos 18",
    "geminiUrl": "https://docs.google.com/document/d/11wqEdqKGnnjvKDiKhVIK3ALmeaMWUVwYuEhWa67IqKw/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-2-2026-10-20",
    "disciplinaId": "disc-2",
    "aulaNum": 11,
    "unidade": 2,
    "dateIso": "2026-10-20",
    "dateBr": "20/10/2026",
    "theme": "Aula 11 • Introdução à Teologia de Barth",
    "resumoGeral": "Estudo teológico abordou Barth e liberalismo com análise histórica e exegese bíblica. Introdução à Teologia de Barth: Apresentação de obras literárias e contexto histórico da reação de Karl Barth ao liberalismo teológico. Discussão sobre a transcendência divina e os limites da razão humana. Centralidade de Cristo e Pregação Exposição sobre a sabedoria em Cristo e a necessidade de uma pregação genuinamente cristocêntrica. Crítica a sistemas filosóficos... Pilares da Teologia Reformulada: Detalhamento dos pilares teológicos e reformulação da doutrina da eleição. Proposta de pesquisa sobre a Declaração de Barmen frente ao poder político.",
    "topicos": [
      {
        "titulo": "Introdução à Teologia de Barth",
        "texto": "Apresentação de obras literárias e contexto histórico da reação de Karl Barth ao liberalismo teológico. Discussão sobre a transcendência divina e os limites da razão humana. Centralidade de Cristo e Pregação Exposição sobre a sabedoria em Cristo e a necessidade de uma pregação genuinamente cristocêntrica. Crítica a sistemas filosóficos..."
      },
      {
        "titulo": "Pilares da Teologia Reformulada",
        "texto": "Detalhamento dos pilares teológicos e reformulação da doutrina da eleição. Proposta de pesquisa sobre a Declaração de Barmen frente ao poder político."
      }
    ],
    "proximasEtapas": [
      "Ler texto: Realizar a leitura do material sobre Karl Barth e a reação ao liberalismo teológico disponibilizado no grupo.",
      "Responder exercício: Completar o exercício de fixação utilizando o link disponibilizado no grupo após a leitura.",
      "Solicitar nota: Enviar mensagem para o professor via WhatsApp para receber a nota do trabalho realizado, sendo que o representante deve compartilhar com o grupo.",
      "Enviar tema: Enviar o conteúdo referente ao tema da pregação cristocêntrica para o professor."
    ],
    "referenciasBiblicas": "Colossenses 2; Filipenses 1:20-21; Gálatas 2:20; João 6; 1 Tessalonicenses 5:18; Isaías 55",
    "geminiUrl": "https://docs.google.com/document/d/1tI3jrEMgEaMS775bKmWJSp9-hznZUKVkVrFM4mJOI1U/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-2-2026-11-03",
    "disciplinaId": "disc-2",
    "aulaNum": 12,
    "unidade": 2,
    "dateIso": "2026-11-03",
    "dateBr": "03/11/2026",
    "theme": "Aula 12 • Contexto Histórico e Barmen",
    "resumoGeral": "Aula abordou o contexto histórico de Barmen e o pensamento de Kierkegaard com foco na fé genuína. Contexto Histórico e Barmen: Estudantes debateram a Declaração de Barmen e a resistência contra a nazificação da igreja alemã. O documento alertou sobre a instrumentalização política da fé e a necessidade de obediência a Cristo. Pensamento de Kierkegaard: O pensamento de Søren Kierkegaard foi examinado como crítica ao cristianismo institucional e formal. A fé exige compromisso pessoal, decisão e discipulado verdadeiro diante do sofrimento.",
    "topicos": [
      {
        "titulo": "Contexto Histórico e Barmen",
        "texto": "Estudantes debateram a Declaração de Barmen e a resistência contra a nazificação da igreja alemã. O documento alertou sobre a instrumentalização política da fé e a necessidade de obediência a Cristo."
      },
      {
        "titulo": "Pensamento de Kierkegaard",
        "texto": "O pensamento de Søren Kierkegaard foi examinado como crítica ao cristianismo institucional e formal. A fé exige compromisso pessoal, decisão e discipulado verdadeiro diante do sofrimento."
      },
      {
        "titulo": "Teologia e Prática Ministerial",
        "texto": "A importância da pregação expositiva e da formação prática foi enfatizada por todos os participantes. A cosmovisão reformada sustenta a prioridade da evangelização e a soberania de Deus."
      }
    ],
    "proximasEtapas": [
      "Compartilhar Vídeo: Disponibilizar o vídeo educacional no grupo para os alunos assistirem.",
      "Assistir Vídeo: Ver o vídeo curto sobre os pensadores da disciplina.",
      "Realizar Exercício: Completar a tarefa de fixação sobre os temas abordados.",
      "Ler conteúdos complementares: Aprofundar a leitura dos tópicos de estudo mencionados durante o encontro."
    ],
    "referenciasBiblicas": "Isaías 5:20; Mateus 6:24; 2 Coríntios 10:4-5; 1 Tessalonicenses 5:21; Isaías 5; João 14",
    "geminiUrl": "https://docs.google.com/document/d/1I-JzKyFBGHu4c0DOEGHCjpoNKq-1pUydzAxnuieqlFI/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-2-2026-11-10",
    "disciplinaId": "disc-2",
    "aulaNum": 13,
    "unidade": 2,
    "dateIso": "2026-11-10",
    "dateBr": "10/11/2026",
    "theme": "Aula 13 • Contexto e Reforma Protestante",
    "resumoGeral": "Estudo teológico abordou a reforma protestante com o pensamento moderno e as oportunidades missionárias. Contexto e Reforma Protestante: A aula destacou a importância de viver o evangelho na sociedade. Pensadores como Martin Lutero e João Calvino estruturaram bases da teologia reformada. Teologia Moderna e Contemporânea: Filósofos modernos e teólogos discutiram a fé diante da razão e da cultura. O discipulado prático foi enfatizado por meio de figuras históricas. Desafios e Missões Transculturais: Debate abordou a necessidade de cooperação interdenominacional e missões. Oportunidades em Portugal e regiões do Brasil foram avaliadas.",
    "topicos": [
      {
        "titulo": "Contexto e Reforma Protestante",
        "texto": "A aula destacou a importância de viver o evangelho na sociedade. Pensadores como Martin Lutero e João Calvino estruturaram bases da teologia reformada."
      },
      {
        "titulo": "Teologia Moderna e Contemporânea",
        "texto": "Filósofos modernos e teólogos discutiram a fé diante da razão e da cultura. O discipulado prático foi enfatizado por meio de figuras históricas."
      },
      {
        "titulo": "Desafios e Missões Transculturais",
        "texto": "Debate abordou a necessidade de cooperação interdenominacional e missões. Oportunidades em Portugal e regiões do Brasil foram avaliadas."
      }
    ],
    "proximasEtapas": [
      "Preparar para AV2: Revisar os personagens históricos abordados em aula e o material de estudo disponibilizado na pasta. Garantir o domínio dos conteúdos para a realização da segunda avaliação.",
      "Orar por missões: Orar pelas oportunidades missionárias em Portugal para ajudar na formação ministerial, aconselhamento bíblico e evangelismo.",
      "Buscar formação missionária: Buscar formação específica para o propósito missionário nas igrejas locais."
    ],
    "referenciasBiblicas": "Mateus 5; Filipenses 2; Mateus 16:18; Efésios 6:10; Colossenses 2:8 e 2; 1 Coríntios 2",
    "geminiUrl": "https://docs.google.com/document/d/1_sz99xNWRRztk760jNlwOWv_N6twhRRpyM9q8tqBfeE/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-2-2026-11-17",
    "disciplinaId": "disc-2",
    "aulaNum": 14,
    "unidade": 2,
    "dateIso": "2026-11-17",
    "dateBr": "17/11/2026",
    "theme": "Aula 14 • Pensamento cristão contemporâneo",
    "resumoGeral": "Estudo do pensamento cristão cobriu teólogos do século XX e a relevância da missão integral para a igreja. Pensamento cristão contemporâneo: O estudo abordou a trajetória do pensamento cristão e a importância de associar a evangelização à responsabilidade social, evitando o uso político da assistência. Teólogos como John Stott e J. I. Packer foram destacados por unirem profundidade bíblica e vida devocional. Teologias da libertação e esperança Jürgen Moltmann e Gustavo Guti... Encerramento da disciplina: A aula finalizou com a revisão de movimentos como o pentecostalismo e a neo-ortodoxia, preparando os alunos para as avaliações.",
    "topicos": [
      {
        "titulo": "Pensamento cristão contemporâneo",
        "texto": "O estudo abordou a trajetória do pensamento cristão e a importância de associar a evangelização à responsabilidade social, evitando o uso político da assistência. Teólogos como John Stott e J. I. Packer foram destacados por unirem profundidade bíblica e vida devocional. Teologias da libertação e esperança Jürgen Moltmann e Gustavo Guti..."
      },
      {
        "titulo": "Encerramento da disciplina",
        "texto": "A aula finalizou com a revisão de movimentos como o pentecostalismo e a neo-ortodoxia, preparando os alunos para as avaliações. O estudo desses pensadores protege a igreja contra modismos e doutrinas equivocadas."
      }
    ],
    "proximasEtapas": [
      "Estudar o Pacto de Lausanne: Estudar o Pacto de Lausanne de 1974 para compreender a declaração dos evangélicos mundiais sobre evangelização.",
      "Ler John Stott: Ler as obras recomendadas de John Stott, especificamente A Cruz de Cristo, Cristianismo Básico e O Discípulo Radical.",
      "Ler J.I. Packer: Adquirir e ler as obras mencionadas de J.I. Packer, como Conhecimento de Deus, para aprofundamento teológico e devocional.",
      "Estudar Teologia da Libertação: Estudar a Teologia da Libertação e autores como Gustavo Gutierrez para compreender o contexto da pobreza e o debate teológico latino americano."
    ],
    "referenciasBiblicas": "1 Coríntios 15:19-20; Mateus 25; João 6; Apocalipse 5",
    "geminiUrl": "https://docs.google.com/document/d/11LmcdzMLOqeE_kro08Q10rkWrhgEkpT6jRiqFT5OSZ4/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-3-2026-08-12",
    "disciplinaId": "disc-3",
    "aulaNum": 1,
    "unidade": 1,
    "dateIso": "2026-08-12",
    "dateBr": "12/08/2026",
    "theme": "Aula 1 • Metodologia de avaliação final",
    "resumoGeral": "A aula discutiu a suficiência das Escrituras no aconselhamento cristão comparada à necessidade de suporte profissional psicológico. Contexto e expectativas iniciais O semestre iniciou com apresentações dos estudantes e recomendações bibliográficas essenciais para a formação teológica. A expectativa é de um período focado no aprofundamento do conteúdo acadêmico. Aconselhamento bíblico versus terapia O grupo debateu a distinção entre a suficiência das escrituras para questões espirituais e a necessidade de auxílio clínico para patologias médicas. A igreja deve priorizar a Bíblia enquanto reconhece a legitimidade de diagnósticos profissionais.",
    "topicos": [
      {
        "titulo": "Metodologia de avaliação final",
        "texto": "Ficou decidido que a avaliação da disciplina ocorrerá via 2 provas objetivas disponibilizadas por meio do Google para gerar notas automaticamente. Estudantes foram incentivados a buscar aprendizado autônomo."
      },
      {
        "titulo": "Contexto Inicial e Expectativas para o Semestre",
        "texto": "O professor uilian santos abriu a aula de Aconselhamento II dando as boas-vindas aos estudantes, compartilhando sua expectativa de que o semestre seja abençoado, rico em conhecimento e muito proveitoso para todos. Antes de iniciar o conteúdo substantivo, uilian santos liderou uma oração pedindo a guia divina para que o aprendizado mútu..."
      },
      {
        "titulo": "Apresentação Pessoal e Trajetória do Professor",
        "texto": "O professor uilian santos compartilhou detalhes detalhados sobre sua vida pessoal e ministerial. Ele informou ser nordestino de Iraia, Bahia, e que serve há quase 14 anos no Rio de Janeiro. uilian santos está concluindo a graduação em Psicologia em dezembro, após cinco anos de estudos, possui um MBA em Gestão Estratégica de Pessoas e é..."
      },
      {
        "titulo": "Indicações de Obras de Aconselhamento",
        "texto": "Como introdução ao tema da disciplina, uilian santos fez a recomendação detalhada de três livros que considera cruciais para a formação dos estudantes, que estão próximos da formatura em dezembro. A primeira obra indicada foi \"Lutero como conselheiro espiritual\", lançada em 2014, livro que o professor ganhou por sorteio das mãos de Jon..."
      },
      {
        "titulo": "Universalidade do Chamado ao Aconselhamento Bíblico vs. Dons Específicos",
        "texto": "uilian santos propôs um debate inicial questionando se a tarefa do aconselhamento bíblico se aplica a todos os cristãos ou apenas a pessoas específicas. Rosiane Lima defendeu a perspectiva de que o aconselhamento deve ser exercido por pessoas específicas que possuam preparo, dinâmica adequada, frutos do espírito e um dom específico, em..."
      },
      {
        "titulo": "Fundamentação Teológica e Prática da Maturidade no Corpo de Cristo",
        "texto": "O professor uilian santos sintetizou as discussões e defendeu que, biblicamente, o chamado ao aconselhamento é universal para todo crente maduro, baseando-se na repetição da expressão \"uns aos outros\" no Novo Testamento (cerca de 30 vezes em textos como Romanos 15, 1 Tessalonicenses 4 e 5, e Tiago 5) e na ordem de Colossenses para que ..."
      },
      {
        "titulo": "Profissionalismo Terapêutico e a Inversão da Centralidade das Escrituras nas Igrejas",
        "texto": "O professor uilian santos trouxe uma séria preocupação sobre a crescente profissionalização do aconselhamento nas igrejas em detrimento das escrituras sagradas, mencionando o surgimento de cursos rápidos de psicanálise (de 6 meses a um ano) que dão uma falsa sensação de aptidão para emitir diagnósticos e abrir consultórios em ambientes..."
      }
    ],
    "proximasEtapas": [],
    "referenciasBiblicas": "Atos 29; Romanos 15, 1; Tiago 5; Mateus 18; Efésios 1",
    "geminiUrl": "/gemini-notes/acon_aula1_2026-08-12.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-3-2026-08-19",
    "disciplinaId": "disc-3",
    "aulaNum": 2,
    "unidade": 1,
    "dateIso": "2026-08-19",
    "dateBr": "19/08/2026",
    "theme": "Aula 2 • Revisão da aula anterior sobre aconselhamento bíblico",
    "resumoGeral": "O debate revisou princípios de aconselhamento bíblico e a postura empática ideal através do livro de Jó. Fundamentos do aconselhamento bíblico A aula revisou a importância das Escrituras contra métodos psicológicos rápidos e superficiais. O aconselhamento eficaz prioriza o discernimento espiritual e a centralidade de Cristo. Lições de empatia e julgamento A análise do livro de Jó destacou que o silêncio e a presença são superiores ao pré-julgamento teológico. Conselheiros devem evitar explicações apressadas para",
    "topicos": [
      {
        "titulo": "Revisão da aula anterior sobre aconselhamento bíblico",
        "texto": "uilian santos recapitulou quatro questões introdutórias sobre o aconselhamento bíblico na igreja local: a natureza antiga da prática, o chamado para que cristãos maduros estejam aptos a aconselhar, a tendência de substituir o aconselhamento bíblico por terapias psicológicas e a busca por cursos rápidos de aconselhamento."
      },
      {
        "titulo": "Críticas aos cursos rápidos de terapia",
        "texto": "uilian santos expressou preocupação com o movimento de pessoas que realizam cursos de curta duração, de quatro a cinco meses, e se consideram aptas para abrir consultórios e realizar diagnósticos. O professor contrastou essa formação com os cinco anos de graduação exigidos em psicologia e notou que, apesar da crescente busca por terape..."
      },
      {
        "titulo": "Psicologia moderna e recursos bíblicos",
        "texto": "uilian santos discutiu as premissas da psicologia moderna, como a visão de que a natureza humana é basicamente boa e que as respostas estão no interior do indivíduo. Foi enfatizado que, embora questões fisiológicas exijam profissionais, o aconselhamento bíblico, apoiado pelas Escrituras e pelo Espírito Santo, permanece como um recurso ..."
      },
      {
        "titulo": "Estudo de caso",
        "texto": "O livro de Jó e a empatia inicial: uilian santos introduziu o livro de Jó (capítulo 2) como estudo de caso. Os participantes observaram que os amigos de Jó demonstraram inicialmente empatia, altruísmo e sensibilidade ao se sentarem com Jó e chorarem em silêncio por sete dias, validando o sofrimento do outro antes de qualquer interação ..."
      },
      {
        "titulo": "Análise sobre a teologia da retribuição",
        "texto": "Rosiane Lima (Rosi) contextualizou a postura dos amigos de Jó, explicando que, na cultura da Mesopotâmia da época, tudo era atribuído a Deus, bom ou ruim. Rosiane Lima (Rosi) pontuou que o erro dos amigos foi tentar justificar o sofrimento de Jó através de uma teologia retributiva, insinuando que Jó estaria colhendo consequências de pe..."
      },
      {
        "titulo": "Discussão sobre o perigo do pré-julgamento",
        "texto": "Alcimar Luiz da Silva argumentou que o principal pecado dos amigos de Jó foi o pré-julgamento, tratando a situação de forma mecânica sem compaixão. Alcimar Luiz da Silva compartilhou o exemplo de uma irmã da igreja que foi repreendida por estar triste em um momento de luto, reforçando que conselheiros não devem \"esmagar a cana quebrada\"."
      },
      {
        "titulo": "Foco na solução em vez de culpados",
        "texto": "Grazi Guimarães destacou que, ao aconselhar, o foco deve ser na busca por soluções e no apoio inicial à pessoa, em vez de tentar encontrar causas ou culpados, para evitar que o conselheiro desmorone junto com quem sofre ou aumente o estresse da pessoa aconselhada."
      }
    ],
    "proximasEtapas": [
      "Praticar aconselhamento interrogativo: Conduza processos de aconselhamento utilizando exclusivamente perguntas. Utilize este método para auxiliar o aconselhado a realinhar seu coração em Deus.",
      "Estudar Teodiceia: Leia sobre os conceitos de Teodiceia. Busque compreender a justificativa de Deus em relação ao mal e ao sofrimento.",
      "Ler Ego Transformado: Leia o livro Ego Transformado de Timothy Keller para auxiliar no processo de aconselhamento bíblico."
    ],
    "referenciasBiblicas": "Provérbios 18:13; Romanos 15:14; Salmos 130; Hebreus 6:19",
    "geminiUrl": "/gemini-notes/acon_aula2_2026-08-19.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-3-2026-08-26",
    "disciplinaId": "disc-3",
    "aulaNum": 3,
    "unidade": 1,
    "dateIso": "2026-08-26",
    "dateBr": "26/08/2026",
    "theme": "Aula 3 • Revisão dos Elementos Centrais do Aconselhamento Bíblico",
    "resumoGeral": "A aula revisou fundamentos do aconselhamento bíblico centralizando Deus e a autoridade das Escrituras nas práticas pastorais. Fundamentos do aconselhamento bíblico O aconselhamento deve centralizar Deus e submeter todas as ferramentas ou experiências pessoais à autoridade absoluta das Escrituras Sagradas. O pecado é a raiz dos problemas, exigindo confrontação amorosa. Prática e evangelismo intencional A postura íntegra no cotidiano e o vínculo de confiança facilitam o discipulado com pessoas não cristãs. Adversidades situacionais revelam o estado do coração,",
    "topicos": [
      {
        "titulo": "Revisão dos Elementos Centrais do Aconselhamento Bíblico",
        "texto": "uilian santos iniciou a terceira aula abordando o calendário de provas e questionando a turma sobre experiências prévias de aconselhamento cristão. A discussão revisou o erro dos três amigos de Jó, apontando o problema de tentarem responder a perguntas que Jó não estava fazendo ou que não possuem respostas, alertando que conselheiros c..."
      },
      {
        "titulo": "Consequências Epistemológicas e a Submissão de Ferramentas às Escrituras",
        "texto": "uilian santos explicou que o aconselhamento possui consequências epistemológicas, exigindo que todas as ferramentas e literaturas de apoio, como as obras de Garen Collins, além de experiências pessoais e alegações de revelação divina (\"Deus me falou\"), sejam rigorosamente submetidas à autoridade das Escrituras Sagradas. O argumento cen..."
      },
      {
        "titulo": "Estudo de Caso sobre Experiências Pessoais e Falsas Possessões",
        "texto": "uilian santos relatou uma experiência pastoral em Copédico, onde um atendimento noturno a uma jovem identificada como Elisama, apontada por familiares como supostamente endemoniada em meio a gritos e um ambiente místico, revelou na verdade um quadro de abuso psicológico e físico sofrido ao longo de anos. A perspectiva destacada foi a d..."
      },
      {
        "titulo": "Ideologias Políticas, Teísmo Aberto e Ídolos do Coração",
        "texto": "uilian santos discutiu o problema da infiltração de ideologias políticas extremas e do teísmo aberto nas igrejas, onde crentes rompem relacionamentos profundos por fanatismo político. O argumento central, alinhado ao conceito de ídolos do coração de Tim Keller, questiona se Cristo realmente domina o coração dessas pessoas ou se há idol..."
      },
      {
        "titulo": "Dimensões do Pecado como Raiz dos Problemas de Aconselhamento",
        "texto": "uilian santos apresentou o terceiro elemento central, destacando que a raiz principal dos problemas de quem busca ajuda não reside em necessidades psicológicas insatisfeitas, mas sim no pecado em todas as suas dimensões (motivação, conduta, pecados cometidos e sofridos). A discussão apontou o problema do medo que conselheiros frequente..."
      },
      {
        "titulo": "Confrontação Bíblica de Pecados Dominantes e Reação ao Aconselhamento",
        "texto": "uilian santos compartilhou uma experiência de aconselhamento com um ex-pastor que perdeu o ministério e a família devido ao adultério e à compulsão sexual, onde uilian utilizou os capítulos 5, 6 e 7 de Provérbios sobre os perigos da prostituição. O conflito gerado pela confrontação direta levou o indivíduo a afastar-se temporariamente ..."
      },
      {
        "titulo": "Desafios no Aconselhamento de Não Cristãos e Postura Intencional",
        "texto": "Camila Vieira levantou a dificuldade de aconselhar e discipular amigas não cristãs sem pressupor crenças na Bíblia ou transformar interações cotidianas em púlpitos. uilian santos respondeu recomendando uma postura intencional, sugerindo marcar cafés e criar vínculos de confiança antes de introduzir gradualmente conceitos cristãos como ..."
      }
    ],
    "proximasEtapas": [
      "Disponibilizar material: Incluir o conteúdo da aula na plataforma para que os alunos possam realizar a leitura."
    ],
    "referenciasBiblicas": "Lucas 18",
    "geminiUrl": "/gemini-notes/acon_aula3_2026-08-26.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-3-2026-09-02",
    "disciplinaId": "disc-3",
    "aulaNum": 4,
    "unidade": 1,
    "dateIso": "2026-09-02",
    "dateBr": "02/09/2026",
    "theme": "Aula 4 • Abertura e Recomendações Bibliográficas",
    "resumoGeral": "Debates sobre teodiceia exploraram causas do sofrimento humano com reflexões bíblicas acerca da soberania divina e esperança. Conceitos Fundamentais Teodiceia A definição acadêmica de teodiceia aborda o dilema entre a bondade de Deus e a existência do mal. Discussões destacaram que o mal resulta do uso da liberdade humana. Perspectivas Sofrimento Fé O sofrimento foi analisado como instrumento pedagógico e impulsionador da consciência religiosa. Definiu-se que o sofrimento centraliza a fé cristã através da",
    "topicos": [
      {
        "titulo": "Abertura e Recomendações Bibliográficas",
        "texto": "uilian santos iniciou a aula fazendo uma oração e indicando duas obras fundamentais para o estudo da teodiceia: *Deus, a Liberdade e o Mal*, de Alvin Plantinga, e *O Problema do Mal no Antigo Testamento*, a tese de mestrado de Luiz Saião."
      },
      {
        "titulo": "Definição e Origem do Conceito de Teodiceia",
        "texto": "uilian santos explicou que o termo deriva de duas palavras gregas, *theos* (Deus) e *dike* (justiça), buscando entender a relação entre a bondade de Deus e a existência do mal no mundo. O conceito foi introduzido pelo jurista alemão Leibniz, e a discussão sobre por que um Deus bondoso e onipotente permite o sofrimento é um dilema centr..."
      },
      {
        "titulo": "Desafios Práticos no Ensino da Teologia",
        "texto": "uilian santos compartilhou uma experiência pessoal em uma congregação em Seropédica, onde tentou discutir teodiceia com jovens e adolescentes em um contexto que não favorecia esse tipo de abordagem acadêmica, enfatizando a importância de realizar uma exegese do local onde a igreja está inserida antes de escolher os temas de estudo."
      },
      {
        "titulo": "O Dilema de Voltaire e a Origem do Mal",
        "texto": "Foi discutido o questionamento de Voltaire após o terremoto em Lisboa em 1755, que apresenta um trilema: se Deus quis impedir o mal e não pôde, não é onipotente; se pôde e não quis, não é bom; se quer e pode, qual seria a origem do mal? uilian santos ressaltou que esse questionamento permanece central nos argumentos ateístas contemporâ..."
      },
      {
        "titulo": "Teodiceia do Livre Arbítrio",
        "texto": "uilian santos apresentou a perspectiva de Agostinho de Hipona, que argumenta que o mal procede da criatura, não do Criador, resultado do mau uso da liberdade concedida por Deus. Cristiano Sacramento levantou um contraponto, questionando se, após a queda e a corrupção de toda a criação, o ser humano ainda possui um livre arbítrio pleno,..."
      },
      {
        "titulo": "Teodiceia Pedagógica",
        "texto": "Foi discutida a visão de que o sofrimento serve como ferramenta pedagógica, ensinando algo aos indivíduos, com base em exemplos bíblicos como o exílio do povo de Israel narrado por Jeremias e Ezequiel, e o livro de Jó. uilian santos pontuou que, embora o sofrimento possa conduzir ao aprendizado, nem todo sofrimento deve ser interpretad..."
      },
      {
        "titulo": "Perspectivas sobre Sofrimento e Responsabilidade Pessoal",
        "texto": "Rosiane Lima (Rosi) ressaltou a necessidade de equilíbrio ao interpretar o sofrimento, distinguindo ações divinas, consequências de escolhas humanas, e eventos naturais que fazem parte da vida. Rosiane Lima (Rosi) utilizou exemplos como a vida de José e a saúde de Timóteo para ilustrar que nem toda dor é um castigo ou uma lição direta,..."
      }
    ],
    "proximasEtapas": [
      "Disponibilizar arquivo: Carregar o material da aula na plataforma do curso após o encerramento da sessão.",
      "Contatar João: Entrar em contato com João após esta semana para tratar de assuntos pendentes."
    ],
    "referenciasBiblicas": "1 Coríntios 11; Romanos 5",
    "geminiUrl": "/gemini-notes/acon_aula4_2026-09-02.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-3-2026-09-09",
    "disciplinaId": "disc-3",
    "aulaNum": 5,
    "unidade": 1,
    "dateIso": "2026-09-09",
    "dateBr": "09/09/2026",
    "theme": "Aula 5 • Abertura e interações iniciais",
    "resumoGeral": "Reunião de aconselhamento bíblico debateu princípios práticos e saúde física. Calendário acadêmico e aconselhamento Informou datas das avaliações e iniciou série sobre aconselhamento eficaz com foco na realidade cotidiana. Investigação e saúde física Enfatizou a importância da escuta ativa e da coleta de informações sobre sono, alimentação e medicamentos. Estudo de caso holístico",
    "topicos": [
      {
        "titulo": "Abertura e interações iniciais",
        "texto": "O encontro começou com uma conversa informal entre Rosiane Lima (Rosi), Daniel Rodrigues e Camila Vieira sobre as rotinas cansativas de estudo e trabalho, momento em que uilian santos ingressou para dar as boas-vindas ao grupo e iniciar a sessão formal."
      },
      {
        "titulo": "Calendário acadêmico e perfil da turma",
        "texto": "uilian santos informou as datas das avaliações do curso, sendo a V1 agendada para o período entre 28 de setembro e 3 de outubro, com a prova no dia 30 de setembro, e a V2 marcada para 25 de novembro. Foi realizada uma breve verificação sobre a composição da turma, notando-se uma mistura de alunos de diferentes períodos acadêmicos."
      },
      {
        "titulo": "Introdução à nova série sobre aconselhamento",
        "texto": "Após um momento de oração, uilian santos introduziu uma série de aulas focada em noções práticas para um aconselhamento sólido e eficaz. Foi destacado que a conversa no aconselhamento não deve se limitar a questões meramente subjetivas ou espirituais, mas sim focar na realidade cotidiana do aconselhado."
      },
      {
        "titulo": "Estudo de caso bíblico",
        "texto": "Eli e Ana: uilian santos apresentou 1 Samuel 1:12-14 como um estudo de caso, onde o sacerdote Eli observou Ana orando silenciosamente e a julgou equivocadamente como embriagada. A turma debateu os erros de Eli, apontando que o pré-julgamento e a falta de uma abordagem acolhedora foram falhas críticas na conduta de Eli."
      },
      {
        "titulo": "A importância da investigação no aconselhamento",
        "texto": "uilian santos enfatizou que, antes de interpretar qualquer demanda, o conselheiro deve reunir o máximo de informações verídicas, evitando conclusões ilusórias baseadas em suposições. Foi reforçado que a escuta ativa é fundamental para o sucesso do aconselhamento, evitando que o conselheiro tente dar soluções precipitadas sem entender o..."
      },
      {
        "titulo": "Relatos práticos de aconselhamento",
        "texto": "Salatiel Rodrigues compartilhou experiências pessoais de aconselhamento, destacando que, ao permitir que o aconselhado fale livremente e aplicar o conhecimento bíblico diretamente à situação, a pessoa consegue chegar à própria conscientização sobre suas atitudes. Foram discutidos casos delicados, incluindo o cenário envolvendo um indiv..."
      },
      {
        "titulo": "Aspectos físicos no aconselhamento",
        "texto": "uilian santos iniciou a discussão sobre a coleta de informações físicas do aconselhado, sublinhando que fatores externos, como saúde física, influenciam o interior e vice-versa. Foi ressaltado que problemas físicos podem atuar como pedras de tropeço, sendo crucial identificar condições de saúde para compreender plenamente a demanda apr..."
      }
    ],
    "proximasEtapas": [
      "Coletar informações físicas: Realizar uma investigação detalhada sobre o sono, alimentação, rotina de exercícios, doenças pré-existentes e medicações do aconselhado antes de interpretar qualquer demanda."
    ],
    "referenciasBiblicas": "1 Samuel 1:12-14",
    "geminiUrl": "/gemini-notes/acon_aula5_2026-09-09.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-3-2026-10-07",
    "disciplinaId": "disc-3",
    "aulaNum": 8,
    "unidade": 2,
    "dateIso": "2026-10-07",
    "dateBr": "07/10/2026",
    "theme": "Aula 8 • Diretrizes de Coleta de Dados",
    "resumoGeral": "Revisão de inventário e técnicas de questionamento com estudos de caso. Diretrizes de Coleta de Dados: Obtenção de panorama geral exige perguntas apropriadas e evitação de tom inquisitório. Aplicação da técnica de avançar e recuar protege a abertura para o diálogo. Análise de Casos Familiares: Abordagem inicial de conflitos familiares requer acolhimento conjunto e sessões individuais subsequentes. Identificação da hesitação revela o núcleo do problema.",
    "topicos": [
      {
        "titulo": "Diretrizes de Coleta de Dados",
        "texto": "Obtenção de panorama geral exige perguntas apropriadas e evitação de tom inquisitório. Aplicação da técnica de avançar e recuar protege a abertura para o diálogo."
      },
      {
        "titulo": "Análise de Casos Familiares",
        "texto": "Abordagem inicial de conflitos familiares requer acolhimento conjunto e sessões individuais subsequentes. Identificação da hesitação revela o núcleo do problema."
      }
    ],
    "proximasEtapas": [
      "Enviar perguntas inventário: Enviar para o grupo as perguntas formuladas para cada item do inventário, abrangendo aspectos físicos e emocionais."
    ],
    "referenciasBiblicas": "Provérbios 18:13; Romanos 15:14; Salmos 130; Hebreus 6:19",
    "geminiUrl": "https://docs.google.com/document/d/1ScuCYlpgK66clRDWEyX1UsYNgqt3RXlDz2hPp87XnGw/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-3-2026-10-14",
    "disciplinaId": "disc-3",
    "aulaNum": 9,
    "unidade": 2,
    "dateIso": "2026-10-14",
    "dateBr": "14/10/2026",
    "theme": "Aula 9 • Transição e planejamento pastoral",
    "resumoGeral": "Reunião pastoral debateu transição ministerial e aconselhamento sobre homossexualidade e acolhimento. Transição e planejamento pastoral: Transição pastoral de uilian santos gerou surpresa entre colegas e conflitos de agenda para a posse. Aconselhamento e sexualidade humana: Discussão abordou o aconselhamento de jovens com desejos homossexuais e a necessidade de acolhimento seguro nas igrejas. Histórico acadêmico e apologética: Debate incluiu marcos históricos da despatologização e estratégias de apologética cristã frente a temas contemporâneos.",
    "topicos": [
      {
        "titulo": "Transição e planejamento pastoral",
        "texto": "Transição pastoral de uilian santos gerou surpresa entre colegas e conflitos de agenda para a posse."
      },
      {
        "titulo": "Aconselhamento e sexualidade humana",
        "texto": "Discussão abordou o aconselhamento de jovens com desejos homossexuais e a necessidade de acolhimento seguro nas igrejas."
      },
      {
        "titulo": "Histórico acadêmico e apologética",
        "texto": "Debate incluiu marcos históricos da despatologização e estratégias de apologética cristã frente a temas contemporâneos."
      }
    ],
    "proximasEtapas": [
      "Pesquisar carta: Pesquisar na internet a carta fictícia escrita por Augusto Nicodemos sobre aconselhamento cristão relacionada à luta contra desejos.",
      "Confirmar aula: Confirmar com o responsável Robert se haverá aula amanhã devido ao feriado do Dia do Professor."
    ],
    "referenciasBiblicas": "Gênesis 1 e 2; Gênesis 1; Gênesis 2; Hebreus 12; Romanos 1",
    "geminiUrl": "https://docs.google.com/document/d/1zmR8MIsk7bOJbTz9V2ttu6l-MsWeQhLKXzmtLe63mXw/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-3-2026-10-21",
    "disciplinaId": "disc-3",
    "aulaNum": 10,
    "unidade": 2,
    "dateIso": "2026-10-21",
    "dateBr": "21/10/2026",
    "theme": "Aula 10 • Introdução ao Estudo",
    "resumoGeral": "Estudo sobre sexualidade e aconselhamento pastoral via análise bíblica Introdução ao Estudo: Estudo abordou sexualidade e aconselhamento com base bíblica. Características do amor matrimonial foram explicadas. Análise de Romanos: Romanos 1 foi discutido destacando a alienação humana de Deus. Homossexualidade foi abordada como fruto dessa separação espiritual. Oportunidade do Evangelho: Evangelho foi apresentado como única solução restauradora. Relações naturais e traduções bíblicas foram debatidas.",
    "topicos": [
      {
        "titulo": "Introdução ao Estudo",
        "texto": "Estudo abordou sexualidade e aconselhamento com base bíblica. Características do amor matrimonial foram explicadas."
      },
      {
        "titulo": "Análise de Romanos",
        "texto": "Romanos 1 foi discutido destacando a alienação humana de Deus. Homossexualidade foi abordada como fruto dessa separação espiritual."
      },
      {
        "titulo": "Oportunidade do Evangelho",
        "texto": "Evangelho foi apresentado como única solução restauradora. Relações naturais e traduções bíblicas foram debatidas."
      }
    ],
    "proximasEtapas": [],
    "referenciasBiblicas": "Romanos 1; Romanos 1:24-26",
    "geminiUrl": "https://docs.google.com/document/d/1pt7-izAE3LUG6ldEWG4Mwk9oklvlgRuCJkSQVW5ne40/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-3-2026-10-28",
    "disciplinaId": "disc-3",
    "aulaNum": 11,
    "unidade": 2,
    "dateIso": "2026-10-28",
    "dateBr": "28/10/2026",
    "theme": "Aula 11 • Esperança Bíblica versus Falsa Esperança",
    "resumoGeral": "O perigo das \"falsas esperanças\" no aconselhamento; crítica ao pensamento mágico devocional e a injeção da verdadeira esperança do Evangelho. Pontos de aprofundamento vinculados à unidade: Esperança Bíblica versus Falsa Esperança (A esperança cristã não é otimismo ingênuo (\"vai dar tudo certo nesta vida terrena\"), mas a ancoragem nas promessas firmes e eternas de Deus reveladas no Evangelho.) Aconselhamento e Discipulado (Quando a pessoa que procura ajuda não é convertida, o aconselhamento torna-se essencialmente uma oportunidade de evangelização e discipulado.)",
    "topicos": [
      {
        "titulo": "Esperança Bíblica versus Falsa Esperança",
        "texto": "A esperança cristã não é otimismo ingênuo (\"vai dar tudo certo nesta vida terrena\"), mas a ancoragem nas promessas firmes e eternas de Deus reveladas no Evangelho."
      },
      {
        "titulo": "Aconselhamento e Discipulado",
        "texto": "Quando a pessoa que procura ajuda não é convertida, o aconselhamento torna-se essencialmente uma oportunidade de evangelização e discipulado."
      }
    ],
    "proximasEtapas": [],
    "referenciasBiblicas": "Provérbios 18:13; Romanos 15:14; Salmos 130; Hebreus 6:19",
    "geminiUrl": "https://docs.google.com/document/d/15YRhOK7KEpH-YV0V-fkfTddxVymzA52PrZsvG_fvuis/edit",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-3-2026-11-04",
    "disciplinaId": "disc-3",
    "aulaNum": 12,
    "unidade": 2,
    "dateIso": "2026-11-04",
    "dateBr": "04/11/2026",
    "theme": "Aula 12 • Esperança versus expectativa humana",
    "resumoGeral": "Aconselhamento bíblico abordou falsa esperança e trabalho humano, com debates sobre oração e regeneração em Cristo. Discussão sobre falsa esperança Aulas de aconselhamento abordaram como pessoas transferem responsabilidades para Deus ao orar sem tomar atitudes práticas. Exemplos práticos demonstraram que necessidades cotidianas exigem ação imediata e alinhamento com mandamentos bíblicos.",
    "topicos": [
      {
        "titulo": "Esperança versus expectativa humana",
        "texto": "Participantes debateram a diferença entre expectativas pessoais frustradas e a esperança inabalável fundamentada em Deus. Ficou estabelecido que a soberania divina rege as respostas às orações humanas."
      },
      {
        "titulo": "Fundamento da esperança cristã",
        "texto": "A verdadeira esperança foi definida como fruto direto do novo nascimento e da união com Cristo Jesus. O encontro concluiu com orientações sobre a avaliação final e a disponibilização de materiais."
      }
    ],
    "proximasEtapas": [
      "Pesquisar apartamentos: Pesquisar opções de aluguel e encaminhar as informações para o William.",
      "Postar Material: Subir o conteúdo da aula na pasta compartilhada após a reunião."
    ],
    "referenciasBiblicas": "Mateus 6; Romanos 4:18; Romanos 8:24; 1 Pedro 1:3; Colossenses 1:4-5; Romanos 8",
    "geminiUrl": "https://docs.google.com/document/d/1Viw3fiPpgyLAFmed3ZHD475YZizI3Shbbhln4QrSViA/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-3-2026-11-11",
    "disciplinaId": "disc-3",
    "aulaNum": 13,
    "unidade": 2,
    "dateIso": "2026-11-11",
    "dateBr": "11/11/2026",
    "theme": "Aula 13 • Fundamentos da Esperança Bíblica",
    "resumoGeral": "Aconselhamento bíblico priorizou esperança escatológica e debateu conflitos conjugais e disciplina eclesiástica. Fundamentos da Esperança Bíblica: Esperança verdadeira está vinculada ao plano redentivo de Deus em Cristo. Alunos debateram se um caso de adultério passado deve ser confessado ao cônjuge. Disciplina e Casos Pastorais: Divórcios sem motivos bíblicos geraram reflexão sobre investimento ministerial improdutivo. Disciplina eclesiástica visa sempre a restauração e não a punição pública. Perspectiva Escatológica Ministerial: Conselheiros devem injetar esperança em pessoas quebradas usando exemplos bíblicos.",
    "topicos": [
      {
        "titulo": "Fundamentos da Esperança Bíblica",
        "texto": "Esperança verdadeira está vinculada ao plano redentivo de Deus em Cristo. Alunos debateram se um caso de adultério passado deve ser confessado ao cônjuge."
      },
      {
        "titulo": "Disciplina e Casos Pastorais",
        "texto": "Divórcios sem motivos bíblicos geraram reflexão sobre investimento ministerial improdutivo. Disciplina eclesiástica visa sempre a restauração e não a punição pública."
      },
      {
        "titulo": "Perspectiva Escatológica Ministerial",
        "texto": "Conselheiros devem injetar esperança em pessoas quebradas usando exemplos bíblicos. Superações financeiras pessoais ilustraram a necessidade de manter a fé inabalável."
      }
    ],
    "proximasEtapas": [
      "Escrever artigo: Desenvolver texto acadêmico sobre os processos de disciplina na igreja."
    ],
    "referenciasBiblicas": "Filipenses 1:12-14 e 17; Salmo 23; Mateus 18; 1 Coríntios 5; Gênesis 50:20",
    "geminiUrl": "https://docs.google.com/document/d/19JSpAgBBeapOIjkjVRL6Vy4sCes2tJt0SR9OaomudjE/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-3-2026-11-18",
    "disciplinaId": "disc-3",
    "aulaNum": 14,
    "unidade": 2,
    "dateIso": "2026-11-18",
    "dateBr": "18/11/2026",
    "theme": "Aula 14 • Suficiência das Escrituras (Salmo 130:5 e Lc 24:32)",
    "resumoGeral": "As Escrituras Sagradas como clímax inegociável do aconselhamento (Salmo 130:5 e os discípulos de Emaús em Lc 24); encerramento do semestre. Pontos de aprofundamento vinculados à unidade: Suficiência das Escrituras (Salmo 130:5 e Lc 24:32) (Somente a Palavra de Deus iluminada pelo Espírito tem o poder de queimar o coração, derrubar ídolos e produzir santificação duradoura.) Aconselhamento e Discipulado (Quando a pessoa que procura ajuda não é convertida, o aconselhamento torna-se essencialmente uma oportunidade de evangelização e discipulado.)",
    "topicos": [
      {
        "titulo": "Suficiência das Escrituras (Salmo 130:5 e Lc 24:32)",
        "texto": "Somente a Palavra de Deus iluminada pelo Espírito tem o poder de queimar o coração, derrubar ídolos e produzir santificação duradoura."
      },
      {
        "titulo": "Aconselhamento e Discipulado",
        "texto": "Quando a pessoa que procura ajuda não é convertida, o aconselhamento torna-se essencialmente uma oportunidade de evangelização e discipulado."
      }
    ],
    "proximasEtapas": [],
    "referenciasBiblicas": "Salmo 130:5; Lc 24",
    "geminiUrl": "https://docs.google.com/document/d/1QWa3tF0XwKnByxdtM_a80MZYL6KZD4VEGAe5xmlSGQo/edit",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-4-2026-08-12",
    "disciplinaId": "disc-4",
    "aulaNum": 1,
    "unidade": 1,
    "dateIso": "2026-08-12",
    "dateBr": "12/08/2026",
    "theme": "Aula 1 • Impacto social da igreja",
    "resumoGeral": "A aula abordou critérios avaliativos e debateu a natureza humana e a função social da igreja cristã. Estrutura da disciplina definida A avaliação do semestre foi estabelecida em 2 etapas principais com provas objetivas e trabalhos individuais de pesquisa. O conteúdo conecta direitos humanos a fundamentos teológicos. Debate sobre natureza humana O grupo confrontou visões filosóficas opostas sobre a bondade humana, destacando a necessidade de direitos fundamentais para proteger o cidadão contra abusos do Estado.",
    "topicos": [
      {
        "titulo": "Impacto social da igreja",
        "texto": "Discutiu-se a responsabilidade histórica dos cristãos na promoção do bem-estar social, reforçando que a fé autêntica deve transbordar em ações práticas de cuidado com o próximo."
      },
      {
        "titulo": "Abertura do Período Letivo e Contexto dos Alunos",
        "texto": "O professor Cleiton Barbirato inicia a reunião cumprimentando os estudantes Daniel Rodrigues e carla p dos s de almeida, celebrando o fato de a maioria da turma estar ingressando no sétimo período e visualizando a reta final do curso. Daniel Rodrigues demonstra entusiasmo com a proximidade da formatura, enquanto carla p dos s de almeid..."
      },
      {
        "titulo": "Definição de Temas de TCC e Orientações",
        "texto": "O estudante Daniel Rodrigues compartilha que seu tema de TCC será \"Pioneirismo da Igreja Evangélica Fluminense, Identidade Nacional, Desafios Civis e Democracia no Segundo Século\", sob a orientação do pastor Idauro Campos. O professor Cleiton Barbirato elogia a escolha, destacando a vasta experiência do orientador na área de história d..."
      },
      {
        "titulo": "Introdução à Disciplina de Direitos Humanos e Canais de Comunicação",
        "texto": "O professor Cleiton Barbirato introduz a matéria de Direitos Humanos aos estudantes de teologia, apresentando seus contatos profissionais de WhatsApp e e-mail no primeiro slide para o esclarecimento de dúvidas e envio de avaliações. A ementa da disciplina abrange noções, pressupostos, classificações, história e desafios dos direitos hu..."
      },
      {
        "titulo": "Critérios de Avaliação e Cronograma",
        "texto": "O docente Cleiton Barbirato detalha a estrutura de avaliação do semestre, mantendo o padrão do período anterior, dividida em duas etapas principais (V1 e V2). Cada etapa será composta por uma avaliação objetiva de múltipla escolha realizada via Google Forms, com peso oito e sem direito a consulta, complementada por um trabalho escrito ..."
      },
      {
        "titulo": "Percepções Sociais e Contextos dos Direitos Humanos",
        "texto": "Em debate interativo proposto pelo professor Cleiton Barbirato sobre os contextos em que a expressão \"direitos humanos\" é mais ouvida, os participantes trazem diferentes perspectivas do cotidiano. Cristiano Sacramento associa o termo ao ambiente político e aos cenários de guerra, locais propícios para a ocorrência de graves violações d..."
      },
      {
        "titulo": "Fundamentação Teórica e a Visão de Jean-Jacques Rousseau",
        "texto": "O professor Cleiton Barbirato inicia a análise das bases teóricas dos direitos humanos citando o pensamento do filósofo suíço Jean-Jacques Rousseau, que defende a premissa de que o homem nasce essencialmente bom, mas é corrompido pelo meio social em que é inserido. Para ilustrar a atualidade da tese rousseauniana, o professor cita o ar..."
      }
    ],
    "proximasEtapas": [
      "Disponibilizar materiais: Disponibilizar todo o material bibliográfico e os slides da disciplina na pasta compartilhada para auxílio nos estudos.",
      "Enviar trabalhos: Enviar os dois trabalhos acadêmicos propostos ao longo do semestre para o endereço de e-mail fornecido pelo professor.",
      "Pesquisar autor livro: Pesquisar o autor da obra E se Jesus não tivesse nascido para divulgar no grupo.",
      "Identificar universidade histórica: Identificar o nome da universidade fundada por pastores congregacionais para compartilhar no grupo."
    ],
    "referenciasBiblicas": "Gênesis 6:5; Jeremias 17:9",
    "geminiUrl": "/gemini-notes/dh_aula1_2026-08-12.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-4-2026-08-19",
    "disciplinaId": "disc-4",
    "aulaNum": 2,
    "unidade": 1,
    "dateIso": "2026-08-19",
    "dateBr": "19/08/2026",
    "theme": "Aula 2 • Desafios Estruturais do País",
    "resumoGeral": "A discussão explorou a fé cristã e direitos humanos, analisando tensões jurídicas, abusos judiciários e sistemas políticos. Fé e Direitos Humanos A interseção entre o compromisso cristão com o próximo e as construções seculares de direitos humanos orientou a reflexão inicial. Valores éticos fundamentam a necessidade de cuidado social nas comunidades. Críticas ao Sistema Judiciário A análise avançou pelas 3 gerações de direitos e críticas ao Supremo Tribunal Federal. Preocupações sobre impunidade seletiva e a politização do judiciário foram destacadas.",
    "topicos": [
      {
        "titulo": "Desafios Estruturais do País",
        "texto": "Reflexões sobre a influência do poder econômico na política e o atraso histórico na garantia de direitos concluíram o debate. Tratados internacionais funcionam como mecanismos essenciais para monitorar violações."
      },
      {
        "titulo": "Abertura e Oração Inicial",
        "texto": "Cleiton Barbirato inicia a sessão com uma oração, pedindo força e renovação para os estudantes, destacando a resiliência e persistência deles para aprender e servir ao reino de Deus, mesmo sendo o último período da aula."
      },
      {
        "titulo": "Cristianismo e Direitos Humanos",
        "texto": "Cleiton Barbirato introduz a relação entre os direitos humanos, que são construções jurídicas seculares, e a carreira ministerial. Ele enfatiza, citando John Wesley, que não se deve dissociar o cuidado espiritual das necessidades físicas e materiais das pessoas."
      },
      {
        "titulo": "Conceito de Próximo",
        "texto": "Cleiton Barbirato e Rosiane Lima (Rosi) discutem quem é o \"próximo\". O consenso é que o próximo engloba todas as pessoas com quem se tem contato e a oportunidade de praticar o bem, indo além de um grupo religioso específico."
      },
      {
        "titulo": "A Missão Integral da Igreja",
        "texto": "Cleiton Barbirato argumenta que a igreja não é uma organização não governamental (ONG), mas sua missão de proclamar o evangelho deve ser acompanhada pelo cuidado com o próximo. Ele utiliza Tiago 2:15-16 para explicar que pregar o evangelho sem suprir necessidades básicas como alimento e vestimenta é insuficiente."
      },
      {
        "titulo": "Cuidado Social como Parte do Evangelho",
        "texto": "Cleiton Barbirato reforça que a igreja deve atentar para as necessidades físicas das pessoas, mencionando o exemplo de William Booth, fundador do Exército da Salvação, com o lema \"Sopa, sabão e salvação\". O objetivo é amar e cuidar, não usar a ajuda social como moeda de troca por frequência na igreja."
      },
      {
        "titulo": "Fé e Obras",
        "texto": "Cleiton Barbirato explica que, embora a salvação ocorra pela graça, a fé verdadeira manifesta-se através de boas obras. Essa transformação mental leva o cristão a preocupar-se com o bem-estar e as condições de vida do próximo."
      }
    ],
    "proximasEtapas": [
      "Ler livro: Ler o livro E se Jesus não tivesse nascido para compreender o impacto do cristianismo no bem-estar social.",
      "Realizar ação social: Realizar ações sociais na igreja local focadas em amar e cuidar das necessidades físicas das pessoas sem condicionar o apoio à conversão.",
      "Avaliar relevância comunitária: Refletir sobre a relevância da igreja na comunidade local e identificar formas de ser útil aos vizinhos.",
      "Confirmar abolição escravatura: Confirmar se o Brasil foi o último país da América do Sul a abolir a escravidão."
    ],
    "referenciasBiblicas": "Tiago 2:15-16",
    "geminiUrl": "/gemini-notes/dh_aula2_2026-08-19.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-4-2026-08-26",
    "disciplinaId": "disc-4",
    "aulaNum": 3,
    "unidade": 1,
    "dateIso": "2026-08-26",
    "dateBr": "26/08/2026",
    "theme": "Aula 3 • Noticiário Inicial e Casos Recentes",
    "resumoGeral": "Discussão sobre fundamentos bíblicos e jurídicos dos direitos humanos, dignidade inalienável e a aplicação prática da equidade. Fundamentos dos Direitos Humanos Normas jurídicas surgiram para conter a crueldade humana decorrente da corrupção moral após a queda. A história de atrocidades globais, como guerras mundiais, justificou a implementação de tribunais internacionais. Dignidade e Justiça Social Dignidade é um valor absoluto e inalienável, exigindo mobilidade social e políticas públicas eficazes. A gestão estatal deve priorizar recursos para garantir",
    "topicos": [
      {
        "titulo": "Noticiário Inicial e Casos Recentes",
        "texto": "Paulo Henrique apresenta notícias gerais, incluindo um incidente nos Estados Unidos onde o maquinista de um trem do tipo VLT dormiu na cabine e colidiu com um trem parado no fim de julho de 2025, sem feridos graves. O relato também aborda a tradicional festa Tomatina em Bunhol, província de Valência, Espanha, que reuniu cerca de 20.000..."
      },
      {
        "titulo": "Abertura da Aula e Introdução aos Direitos Humanos",
        "texto": "Cleiton Barbirato inicia a aula com uma oração pelos participantes, oferece café e informa que os slides da aula anterior e da aula atual estão disponíveis em formato PDF na pasta compartilhada para download. A exposição prossegue com a discussão sobre direitos humanos, levantando o questionamento sobre a motivação humana para criar no..."
      },
      {
        "titulo": "A Natureza Humana e a Justificativa para Mecanismos Jurídicos",
        "texto": "Cleiton Barbirato discute a origem da maldade humana, contrapondo teorias seculares (como as de Rousseau e Hobbes sobre a corrupção social ou o homem como o lobo do próprio homem) com a perspectiva bíblica de que o coração humano é corrompido pela queda e pelo pecado. Embora a literatura jurídica atribua a brutalidade a um instinto ani..."
      },
      {
        "titulo": "Atrocidades Históricas e Contexto das Guerras Mundiais",
        "texto": "Cleiton Barbirato aponta que horrores históricos, notadamente a Segunda Guerra Mundial entre 1939 e 1945, o Holocausto com o assassinato de cerca de 6 milhões de judeus pelo regime nazista sob o discurso de supremacia racial ariana, e abusos em campos de concentração motivaram a criação de regras e tribunais internacionais de punição, ..."
      },
      {
        "titulo": "O Impacto Nuclear em Hiroshima e Nagasaki e o Conceito de Direitos Humanos",
        "texto": "Cleiton Barbirato ilustra os danos de conflitos com o caso de Sadako Sasaki, uma menina de 2 anos localizada a cerca de 1.600 metros do epicentro da bomba atômica em Hiroshima e Nagasaki, que foi atingida por chuva ácida e faleceu dez anos depois, aos 12 anos de idade, com sintomas de leucemia e contaminação por radiação. A partir diss..."
      },
      {
        "titulo": "Perspectivas sobre o Conceito de Dignidade",
        "texto": "Cristiano Sacramento define dignidade como um valor absoluto e essencial inerente ao ser humano, argumentando que a vida não é descartável e que existe um preço a pagar para garantir dignidade a si e ao próximo. Rosiane Lima (Rosi) complementa que a dignidade é um direito inalienável associado à justiça social e ao respeito, criticando..."
      },
      {
        "titulo": "Mobilidade Social e Desigualdades Estruturais",
        "texto": "Rosiane Lima (Rosi) cita o sistema de castas na Índia — onde a base da pirâmide é oprimida para sustentar as camadas superiores — para ilustrar a opressão e a falta de acesso a condições dignas. Cleiton Barbirato e Rosiane Lima (Rosi) concordam que a dignidade exige mobilidade social, ferramentas de capacitação e educação que beneficie..."
      }
    ],
    "proximasEtapas": [
      "Baixar materiais de estudo: Realizar o download dos slides da aula passada e da aula atual disponíveis na pasta compartilhada para compor o material de estudo.",
      "Assistir vídeo: Assista ao vídeo sobre a corrida da vida para refletir sobre as diferentes condições iniciais das pessoas e melhorar a forma de se relacionar com quem teve menos acesso a oportunidades.",
      "Assinar presença: Registre sua presença na aula acessando o link disponibilizado no chat."
    ],
    "referenciasBiblicas": "Gênesis 3:16; Gálatas 3:28",
    "geminiUrl": "/gemini-notes/dh_aula3_2026-08-26.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-4-2026-09-02",
    "disciplinaId": "disc-4",
    "aulaNum": 4,
    "unidade": 1,
    "dateIso": "2026-09-02",
    "dateBr": "02/09/2026",
    "theme": "Aula 4 • Configuração da Aula e Saudações",
    "resumoGeral": "A sessão explorou fundamentos dos direitos humanos e estruturas legais brasileiras finalizando com orientações sobre trabalho acadêmico. Fundamentos dos Direitos Humanos A discussão estabeleceu o contexto histórico da proteção aos direitos humanos após conflitos mundiais. O grupo diferenciou igualdade de equidade e definiu os direitos fundamentais universais. Estruturas Legais e Normativas Foi analisada a hierarquia das leis conforme a Pirâmide de Kelsen e o controle de constitucionalidade realizado pelo Supremo Tribunal Federal. Analisaram-se",
    "topicos": [
      {
        "titulo": "Configuração da Aula e Saudações",
        "texto": "Cristiano Sacramento e Rosiane Lima discutiram as configurações de gravação da aula antes do início formal. Após a resolução dos problemas técnicos, Daniel Rodrigues e Cleiton Barbirato trocaram saudações cordiais."
      },
      {
        "titulo": "Apresentações dos Alunos",
        "texto": "Cleiton Barbirato deu boas-vindas a Dijair Oliveira, que confirmou não ser sua primeira aula, embora estivesse com a câmera desligada anteriormente, e informou ser natural de Brejo dos Santos, Paraíba."
      },
      {
        "titulo": "Oração Inicial",
        "texto": "A aula foi aberta com uma oração conduzida por Rosiane Lima, que solicitou bênçãos para os participantes e para as cordas vocais de Cleiton Barbirato, visando o bom andamento da exposição do conteúdo."
      },
      {
        "titulo": "Contexto Histórico e Conflitos",
        "texto": "Cleiton Barbirato revisou que as atrocidades da Segunda Guerra Mundial foram o principal motivo para a comunidade internacional estabelecer mecanismos de proteção aos direitos humanos, destacando que conflitos atuais, como os ocorridos no Irã e na Ucrânia, demonstram a necessidade contínua de proteção a civis e militares tanto durante ..."
      },
      {
        "titulo": "Conceito de Direitos Humanos Estrito Senso",
        "texto": "Cleiton Barbirato definiu os direitos humanos estrito senso como as legislações e regulações estabelecidas em tempos de paz para assegurar a dignidade humana, preferindo este termo em vez de \"dignidade da pessoa humana\" por considerar a expressão redundante."
      },
      {
        "titulo": "Direitos Humanos Fundamentais",
        "texto": "Os direitos universais identificados como essenciais para todos os cidadãos, independentemente de nacionalidade, gênero ou idade, incluem o direito à vida, à liberdade, à igualdade e ao tratamento equitativo."
      },
      {
        "titulo": "Igualdade versus Equidade",
        "texto": "Jorge Silva explicou a diferença entre igualdade e equidade, utilizando o exemplo de caixotes para visualizar que, enquanto a igualdade trata todos da mesma forma, a equidade foca em atender às necessidades específicas de cada indivíduo para garantir resultados justos, com o apoio adicional de Rosiane Lima."
      }
    ],
    "proximasEtapas": [
      "Configurar Transcrição: Realizar a configuração da ferramenta de transcrição antes de iniciar a próxima aula.",
      "Produzir trabalho AV1: Redigir um texto de até uma lauda sobre desigualdade social e privilégios. Enviar o arquivo para o email indicado pelo professor utilizando o assunto trabalho para composição de notas.",
      "Solicitar isenção: Entrar em contato diretamente com a diretora Carla Janaína para tratar da documentação de isenção da disciplina.",
      "Solicitar link: Enviar uma mensagem ao professor solicitando o link do vídeo de 26 de setembro caso ainda não o tenham assistido."
    ],
    "referenciasBiblicas": "Gênesis 1:26-27; Miqueias 6:8; Deuteronômio 10:18-19",
    "geminiUrl": "/gemini-notes/dh_aula4_2026-09-02.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-4-2026-09-09",
    "disciplinaId": "disc-4",
    "aulaNum": 5,
    "unidade": 1,
    "dateIso": "2026-09-09",
    "dateBr": "09/09/2026",
    "theme": "Aula 5 • Abertura da Reunião e Oração Inicial",
    "resumoGeral": "Estudo do jusnaturalismo explorou direitos fundamentais e o debate ético sobre o aborto Origens do jusnaturalismo Apresentação abordou conceitos históricos e teológicos dos direitos naturais desde a Antiguidade. Debate sobre aborto Discussão jurídica analisou o início da personalidade civil e a proteção do nascituro.",
    "topicos": [
      {
        "titulo": "Abertura da Reunião e Oração Inicial",
        "texto": "A aula teve início com saudações entre os participantes, incluindo Cristiano Sacramento, Salatiel Rodrigues, Grazi Guimarães, Cleiton Barbirato, Rosiane Lima (Rosi), Daniel Rodrigues e carla p dos s de almeida, seguido por um ajuste técnico no áudio do professor Cleiton Barbirato e a menção de trabalhos a serem corrigidos. A sessão foi..."
      },
      {
        "titulo": "Introdução ao Jusnaturalismo",
        "texto": "Cleiton Barbirato introduziu o conceito de jusnaturalismo, descrevendo-o como uma das duas vertentes estudadas no curso para explicar a origem dos direitos humanos, baseada em uma lógica natural presente em diversas sociedades independentemente de cultura ou religião."
      },
      {
        "titulo": "Fundamentos do Direito Natural",
        "texto": "Foi estabelecido que o direito natural pressupõe que os direitos humanos derivam de elementos naturais, argumentando que certas regras, como a proteção à vida, são universais. Cleiton Barbirato pontuou que, embora a visão secular utilize explicações antropológicas e sociológicas, a perspectiva cristã reconhece a imagem de Deus como fun..."
      },
      {
        "titulo": "Conceitos de Liberdade e Sujeição a Direitos",
        "texto": "Cleiton Barbirato explicou que, segundo o direito natural, um ser humano nasce livre e sem obrigações, mas já possui direitos fundamentais como saúde e alimentação. O professor destacou a vulnerabilidade da criança humana em comparação a outras espécies que se desenvolvem mais rapidamente, justificando assim a necessidade de proteção l..."
      },
      {
        "titulo": "O Princípio do Universalismo no Direito",
        "texto": "Foi definido o conceito de universalismo no âmbito do jusnaturalismo, enfatizando que os direitos fundamentais pertencem a todo ser humano, independentemente de etnia, gênero, condição econômica ou cultural, diferenciando esse termo do uso teológico da palavra."
      },
      {
        "titulo": "Origens Históricas e Filosóficas",
        "texto": "A discussão abordou as raízes do pensamento naturalista na Grécia Antiga, citando Tales de Mileto como um precursor que vinculava a existência a elementos naturais (física ou \"physis\"). Essa escola de pensamento sugeria que, se a vida provém de elementos naturais como água, terra, fogo e ar, os direitos também deveriam derivar dessas l..."
      },
      {
        "titulo": "Definição de Direito Natural Objetivo",
        "texto": "Cleiton Barbirato apresentou a definição de jusnaturalismo como uma ordem perceptiva de caráter objetivo e imutável, derivada da natureza. Foi esclarecido que as leis humanas deveriam, sob essa perspectiva, replicar as leis naturais, sendo estas últimas consideradas incontestáveis e aplicáveis universalmente."
      }
    ],
    "proximasEtapas": [
      "Relatar história: Compartilhar os detalhes do ocorrido mencionado durante a aula com o professor.",
      "Enviar trabalho: Produzir um trabalho de no máximo uma lauda sobre o vídeo de desigualdade social e privilégio, discutindo a importância da igreja como agente de transformação social.",
      "Entregar tarefa: Enviar o trabalho finalizado por e-mail até o dia 30 de setembro de 2026, às 23:59.",
      "Orar por Eglésia: Apresentar a jovem Eglésia em oração devido ao seu quadro de saúde e situação mencionada durante a aula."
    ],
    "referenciasBiblicas": "Salmo 139",
    "geminiUrl": "/gemini-notes/dh_aula5_2026-09-09.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-4-2026-10-07",
    "disciplinaId": "disc-4",
    "aulaNum": 8,
    "unidade": 2,
    "dateIso": "2026-10-07",
    "dateBr": "07/10/2026",
    "theme": "Aula 8 • Devolutiva comentada da AV1",
    "resumoGeral": "Revisão de prova com análise constitucional e debates sobre a estrutura da ONU. Correção da primeira avaliação Correção detalhada da prova abordou conceitos fundamentais de direitos humanos, teorias de Kant, jusnaturalismo e teoria natalista. Tratados e Constituição Debate sobre a incorporação de tratados internacionais, as inovações da Constituição de 1988 e o papel do Supremo Tribunal Federal.",
    "topicos": [],
    "proximasEtapas": [
      "Solicitar revisão de prova: Contatar o professor no privado para solicitar a anulação da questão com erro de digitação caso tenha sido prejudicado na nota da prova.",
      "Solicitar Constituição impressa: Acessar o portal do Senado Federal e realizar o pedido para receber um exemplar gratuito da Constituição da República Federativa do Brasil em casa."
    ],
    "referenciasBiblicas": "Gênesis 1:26-27; Miqueias 6:8; Deuteronômio 10:18-19",
    "geminiUrl": "https://docs.google.com/document/d/1-ddZB6qd2ajhKqEOHaqQG-sUqamoq_Ba8HTRdvR0orc/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-4-2026-10-14",
    "disciplinaId": "disc-4",
    "aulaNum": 9,
    "unidade": 2,
    "dateIso": "2026-10-14",
    "dateBr": "14/10/2026",
    "theme": "Aula 9 • Estrutura da ONU e Conselho de Segurança",
    "resumoGeral": "A estrutura da ONU, a Carta de 1945 e a composição do Conselho de Segurança (15 membros, com 5 membros permanentes e poder de veto). Pontos de aprofundamento vinculados à unidade: Estrutura da ONU e Conselho de Segurança (Composto por 15 membros: 5 permanentes com direito de veto (EUA, Rússia, China, França e Reino Unido) e 10 membros rotativos eleitos por 2 anos.) Artigo 5º da Constituição Federal de 1988 (Garante a brasileiros e estrangeiros residentes a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade (Cláusula Pétrea imutável por emenda).) Base documental da avaliação: 100% extraída do arquivo consolidado de 52 slides pós-A...",
    "topicos": [
      {
        "titulo": "Estrutura da ONU e Conselho de Segurança",
        "texto": "Composto por 15 membros: 5 permanentes com direito de veto (EUA, Rússia, China, França e Reino Unido) e 10 membros rotativos eleitos por 2 anos."
      },
      {
        "titulo": "Artigo 5º da Constituição Federal de 1988",
        "texto": "Garante a brasileiros e estrangeiros residentes a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade (Cláusula Pétrea imutável por emenda)."
      },
      {
        "titulo": "Dimensão Vertical vs. Horizontal",
        "texto": "Vertical: o indivíduo buscando proteção contra os arbítrios e o poder punitivo do Estado (jus puniendi). Horizontal: aplicação dos direitos fundamentais nas relações entre particulares e instituições privadas."
      }
    ],
    "proximasEtapas": [
      "Revisar: 100% extraída do arquivo consolidado de 52 slides pós-AV1 disponibilizado na pasta do Drive."
    ],
    "referenciasBiblicas": "Gênesis 1:26-27; Miqueias 6:8; Deuteronômio 10:18-19",
    "geminiUrl": "https://docs.google.com/document/d/1CjT12m6_gcTll_LqF7j6MPXpFjRP4AjWPzu-En4R0Xc/edit",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-4-2026-10-21",
    "disciplinaId": "disc-4",
    "aulaNum": 10,
    "unidade": 2,
    "dateIso": "2026-10-21",
    "dateBr": "21/10/2026",
    "theme": "Aula 10 • Conceitos de Direitos Fundamentais",
    "resumoGeral": "Aula abordou direitos humanos e garantias fundamentais com foco na vida. Conceitos de Direitos Fundamentais: Estudantes discutiram classificações normativas e garantias instrumentais do Estado. Debate abordou a vedação da censura e a liberdade de expressão. Dimensões do Direito à Vida: Debate analisou a inviolabilidade da vida e o aborto. Análise incluiu dimensões verticais e horizontais com obrigações estatais. Proteção do Nascituro: Aula examinou teorias sobre o início da vida e direitos do nascituro. Sessão encerrou com conceitos sobre o término da vida.",
    "topicos": [
      {
        "titulo": "Conceitos de Direitos Fundamentais",
        "texto": "Estudantes discutiram classificações normativas e garantias instrumentais do Estado. Debate abordou a vedação da censura e a liberdade de expressão."
      },
      {
        "titulo": "Dimensões do Direito à Vida",
        "texto": "Debate analisou a inviolabilidade da vida e o aborto. Análise incluiu dimensões verticais e horizontais com obrigações estatais."
      },
      {
        "titulo": "Proteção do Nascituro",
        "texto": "Aula examinou teorias sobre o início da vida e direitos do nascituro. Sessão encerrou com conceitos sobre o término da vida."
      }
    ],
    "proximasEtapas": [
      "Cobrar governantes: Cobre dos candidatos e governantes eleitos o cumprimento das promessas e a adoção de medidas governamentais necessárias."
    ],
    "referenciasBiblicas": "Gênesis 1:26-27; Miqueias 6:8; Deuteronômio 10:18-19",
    "geminiUrl": "https://docs.google.com/document/d/12xr5g31EYSxe3RrlqlaVKlEwZp8aT2kHDhCGfciDMtM/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-4-2026-10-28",
    "disciplinaId": "disc-4",
    "aulaNum": 11,
    "unidade": 2,
    "dateIso": "2026-10-28",
    "dateBr": "28/10/2026",
    "theme": "Aula 11 • Artigo 5º da Constituição Federal de 1988",
    "resumoGeral": "Inviolabilidade da vida e dignidade humana perante os dilemas biomédicos da eutanásia, distanásia e cuidados paliativos. Pontos de aprofundamento vinculados à unidade: Artigo 5º da Constituição Federal de 1988 (Garante a brasileiros e estrangeiros residentes a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade (Cláusula Pétrea imutável por emenda).) Direito à Honra, Imagem e Privacidade (Direitos da personalidade invioláveis; a honra subjetiva relaciona-se à autoestima íntima, enquanto a honra objetiva refere-se à reputação social perante a comunidade.) Base documental da avaliação: 100% extraída do arquivo consolidado de 52 slid...",
    "topicos": [
      {
        "titulo": "Artigo 5º da Constituição Federal de 1988",
        "texto": "Garante a brasileiros e estrangeiros residentes a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade (Cláusula Pétrea imutável por emenda)."
      },
      {
        "titulo": "Direito à Honra, Imagem e Privacidade",
        "texto": "Direitos da personalidade invioláveis; a honra subjetiva relaciona-se à autoestima íntima, enquanto a honra objetiva refere-se à reputação social perante a comunidade."
      }
    ],
    "proximasEtapas": [
      "Revisar: 100% extraída do arquivo consolidado de 52 slides pós-AV1 disponibilizado na pasta do Drive."
    ],
    "referenciasBiblicas": "Gênesis 1:26-27; Miqueias 6:8; Deuteronômio 10:18-19",
    "geminiUrl": "https://docs.google.com/document/d/1BteQvptuhZnjGaBG2DtSyjKXLcIrEM16gHhGg3cx7oY/edit",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-4-2026-11-04",
    "disciplinaId": "disc-4",
    "aulaNum": 12,
    "unidade": 2,
    "dateIso": "2026-11-04",
    "dateBr": "04/11/2026",
    "theme": "Aula 12 • Igualdade e justiça distributiva",
    "resumoGeral": "Estudo constitucional debateu igualdade com discriminação positiva e acessibilidade eclesiástica. Igualdade e justiça distributiva: Igualdade exige discriminação positiva para proteger grupos vulneráveis contra disparidades. Políticas públicas atenuam assimetrias sociais e garantem direitos fundamentais. Acessibilidade nas igrejas: Comunidades religiosas precisam repensar a inclusão estrutural para pessoas atípicas. Adaptações sensoriais e arquitetônicas garantem acolhimento adequado. Ministério infantil capacitado: Escolas dominicais exigem rigorosa checagem de antecedentes para proteção infantil.",
    "topicos": [
      {
        "titulo": "Igualdade e justiça distributiva",
        "texto": "Igualdade exige discriminação positiva para proteger grupos vulneráveis contra disparidades. Políticas públicas atenuam assimetrias sociais e garantem direitos fundamentais."
      },
      {
        "titulo": "Acessibilidade nas igrejas",
        "texto": "Comunidades religiosas precisam repensar a inclusão estrutural para pessoas atípicas. Adaptações sensoriais e arquitetônicas garantem acolhimento adequado."
      },
      {
        "titulo": "Ministério infantil capacitado",
        "texto": "Escolas dominicais exigem rigorosa checagem de antecedentes para proteção infantil. Professores capacitados pedagogicamente asseguram formação espiritual consistente."
      }
    ],
    "proximasEtapas": [
      "Compartilhar Informações: Compartilhar o material sobre a segunda dimensão da igualdade com o restante da turma.",
      "Estudar Justiça: Realizar o estudo sobre o conceito de justiça distributiva para aprofundamento da matéria.",
      "Emitir certidão negativa: Emitir certidão negativa de antecedentes criminais dos professores da escola dominical periodicamente. O objetivo é garantir a segurança infantil contra abusos, servindo como uma me...",
      "Melhorar acessibilidade: Implementar rampas de acesso e melhorias na acessibilidade estrutural das igrejas. A liderança deve avaliar e propor essas modificações em assembleia para melhor receber membros com ..."
    ],
    "referenciasBiblicas": "Gênesis 1:26-27; Miqueias 6:8; Deuteronômio 10:18-19",
    "geminiUrl": "https://docs.google.com/document/d/1YaYYHMlUoUAXW7OZ2Nk7qkXZGGwKhuIhwoMb3cszZWU/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-4-2026-11-11",
    "disciplinaId": "disc-4",
    "aulaNum": 13,
    "unidade": 2,
    "dateIso": "2026-11-11",
    "dateBr": "11/11/2026",
    "theme": "Aula 13 • Organizacao e Conteudo da V2",
    "resumoGeral": "Avaliação V2 cobriu direitos constitucionais com discussões sobre integridade física, vacinação e laicidade estatal. Organizacao e Conteudo da V2: A segunda avaliacao consistira em uma prova objetiva de 10 questoes de multipla escolha sobre o conteudo posterior a primeira avaliacao. Nao havera trabalho academico complementar para compor a nota. Integridade Fisica e Consentimento: O debate abordou a intangibilidade do corpo humano, regulando excecoes para procedimentos medicos invasivos e campanhas de vacinacao obrigatoria. A recusa de transfusao de sangue foi analisada sob a otica da liberdade religiosa.",
    "topicos": [
      {
        "titulo": "Organizacao e Conteudo da V2",
        "texto": "A segunda avaliacao consistira em uma prova objetiva de 10 questoes de multipla escolha sobre o conteudo posterior a primeira avaliacao. Nao havera trabalho academico complementar para compor a nota."
      },
      {
        "titulo": "Integridade Fisica e Consentimento",
        "texto": "O debate abordou a intangibilidade do corpo humano, regulando excecoes para procedimentos medicos invasivos e campanhas de vacinacao obrigatoria. A recusa de transfusao de sangue foi analisada sob a otica da liberdade religiosa."
      },
      {
        "titulo": "Estado Laico e Privacidade",
        "texto": "A aula debateu a neutralidade do estado laico frente as instrucoes religiosas e delimitou a protecao juridica da intimidade. A discussao concluiu sobre a necessidade de rigor etico na preservacao de sigilos."
      }
    ],
    "proximasEtapas": [
      "Realizar Avaliação: Realizar a segunda prova da disciplina focada na matéria iniciada após a primeira avaliação.",
      "{Publicar slides}: {Disponibilizar os slides da aula na plataforma digital.}",
      "{Estudar slides}: {Revisar o material didático disponibilizado para a preparação da prova.}",
      "{Preparar revisão}: {Conduzir uma sessão de revisão sobre o conteúdo estudado na próxima semana.}"
    ],
    "referenciasBiblicas": "Gênesis 1:26-27; Miqueias 6:8; Deuteronômio 10:18-19",
    "geminiUrl": "https://docs.google.com/document/d/1mMxMeEvCuWSJTr2H3D_uD2nBQokcFedsPZ7CeJlqmvI/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-4-2026-11-18",
    "disciplinaId": "disc-4",
    "aulaNum": 14,
    "unidade": 2,
    "dateIso": "2026-11-18",
    "dateBr": "18/11/2026",
    "theme": "Aula 14 • Abertura e Motivo da Aula",
    "resumoGeral": "Revisão da matéria e orientações para a prova final com encerramento antecipado das atividades. Abertura e Motivo da Aula: A aula foi reduzida devido a questões de saúde e conclusão prévia do conteúdo programático. O encontro focou em orientações gerais sobre a avaliação. Formato da Prova: A avaliação consistirá em 10 questões objetivas via Google Forms com base nos slides do Google Drive. O prazo de envio será na quarta-feira.",
    "topicos": [
      {
        "titulo": "Abertura e Motivo da Aula",
        "texto": "A aula foi reduzida devido a questões de saúde e conclusão prévia do conteúdo programático. O encontro focou em orientações gerais sobre a avaliação."
      },
      {
        "titulo": "Formato da Prova",
        "texto": "A avaliação consistirá em 10 questões objetivas via Google Forms com base nos slides do Google Drive. O prazo de envio será na quarta-feira."
      }
    ],
    "proximasEtapas": [
      "Comunicar colegas: Informe os colegas ausentes sobre o cronograma e os detalhes da prova objetiva.",
      "Solicitar segunda chamada: Entre em contato com o professor após a segunda avaliação caso tenha perdido a prova um ou a prova dois para receber orientações sobre a segunda chamada.",
      "Contatar aluno: Envie uma mensagem para Salatiel para tratar de assuntos pendentes."
    ],
    "referenciasBiblicas": "Gênesis 1:26-27; Miqueias 6:8; Deuteronômio 10:18-19",
    "geminiUrl": "https://docs.google.com/document/d/1MxeIKhKmGCvPiy-XN9zNGMyIdnYiPlFi1RCHUQMbpKc/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-5-2026-08-13",
    "disciplinaId": "disc-5",
    "aulaNum": 1,
    "unidade": 1,
    "dateIso": "2026-08-13",
    "dateBr": "13/08/2026",
    "theme": "Aula 1 • Avaliação das correntes éticas",
    "resumoGeral": "A sessão estruturou o programa de Ética Cristã e analisou correntes filosóficas mediante dilemas morais fundamentais. Organização e cronograma acadêmico O cronograma do semestre focará em dilemas éticos baseados na obra de Norman Geisler. A avaliação final consistirá em apresentações de grupos sobre os Dez Mandamentos. Análise de dilemas morais Debates teológicos exploraram conflitos entre leis morais divinas e condutas humanas em situações extremas. O grupo analisou a desobediência civil e o conflito entre mentira e preservação da vida.",
    "topicos": [
      {
        "titulo": "Avaliação das correntes éticas",
        "texto": "Visões éticas não cristãs foram contrapostas ao absolutismo cristão. O modelo de absolutismo graduado foi defendido como a estrutura superior para solucionar conflitos morais sem gerar culpa."
      },
      {
        "titulo": "Introdução e Dinâmica de Aula",
        "texto": "Daniel Rodrigues, Rosiane Lima e Cristiano Sacramento iniciam a sessão conversando com a professora Karoline Evangelista sobre o retorno das férias e a dinâmica das próximas atividades. Daniel Rodrigues sugere, em tom de brincadeira, a realização de provas orais ou resenhas de múltiplos livros escritos à mão, o que gera uma discussão s..."
      },
      {
        "titulo": "Logística de Matrícula e Início da Aula",
        "texto": "Rosiane Lima assume a gravação da aula e relata que o Google Meet apresentou instabilidades temporárias, exigindo autorização manual para a entrada de todos os participantes. Contudo, o problema técnico foi logo solucionado e os alunos conseguiram acessar a sala virtual. Diante da presença de 13 participantes no momento, Cristiano Sacr..."
      },
      {
        "titulo": "Apresentação do Conteúdo Programático",
        "texto": "Karoline Evangelista detalha as bases teóricas e a estrutura de temas que serão estudados ao longo do semestre na disciplina de Ética Cristã. O cronograma pedagógico seguirá a sequência de tópicos proposta por Norman Geisler na obra \"Ética Cristã: Opções e Questões Contemporâneas\" (Editora Vida Nova, com aproximadamente 500 páginas), a..."
      },
      {
        "titulo": "Indicações Bibliográficas Complementares",
        "texto": "Karoline Evangelista apresenta a obra de Walter Kaiser, intitulada \"O Cristão e as Questões Éticas da Atualidade\", estabelecendo um comparativo técnico com o livro de Norman Geisler para orientar o uso prático dos alunos. Após uma breve interrupção de Cristiano Sacramento e Antonio Marcos, que alertaram sobre a ausência de compartilham..."
      },
      {
        "titulo": "Planejamento de Avaliações (V1 e V2)",
        "texto": "Karoline Evangelista define que as notas de avaliação do semestre serão unificadas em uma única atividade prática baseada no Catecismo Maior de Westminster, focando especificamente na seção que comenta os Dez Mandamentos. A escolha bibliográfica justifica-se pela acessibilidade e ampla oferta de edições comentadas no mercado. O planeja..."
      },
      {
        "titulo": "Regras de Avaliação e Critérios de Tempo",
        "texto": "Karoline Evangelista estabelece os critérios de atribuição de notas para o trabalho dos Dez Mandamentos, pacificando dúvidas de Antonio Marcos e Rosiane Lima. A professora determina que a nota final será rigorosamente individual, baseada na confecção dos slides e no desempenho de cada estudante na tribuna, mitigando o risco de alunos s..."
      }
    ],
    "proximasEtapas": [
      "Formar Grupos: Organizar os alunos em grupos de 3 a 4 pessoas para as apresentações de trabalho.",
      "Enviar Lista: Enviar a lista final dos grupos para a professora até a próxima aula.",
      "Adquirir e Ler Livro: Comprar e ler o livro Ética Cristã de Norman Geisler.",
      "Pesquisar Catecismo: Estudar o Catecismo Maior de Westminster para fundamentar as apresentações sobre os 10 mandamentos."
    ],
    "referenciasBiblicas": "Isaías 58; Gênesis 22",
    "geminiUrl": "/gemini-notes/eti_aula1_2026-08-13.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-5-2026-08-20",
    "disciplinaId": "disc-5",
    "aulaNum": 2,
    "unidade": 1,
    "dateIso": "2026-08-20",
    "dateBr": "20/08/2026",
    "theme": "Aula 2 • Aplicação prática da ética",
    "resumoGeral": "A reunião organizou grupos para seminários sobre os 10 mandamentos e debateu modelos de absolutismo ético cristão. Organização dos grupos acadêmicos Alunos organizaram grupos para seminários sobre os 10 mandamentos. A avaliação ocorrerá de 22 de outubro a 19 de novembro. Debates sobre absolutismo ético O grupo analisou três correntes de absolutismo cristão, identificando o absolutismo graduado como o modelo mais alinhado à tradição. Discussões diferenciaram dilemas éticos reais de conveniência pessoal.",
    "topicos": [
      {
        "titulo": "Aplicação prática da ética",
        "texto": "A turma concluiu que o absolutismo graduado não valida mentiras por conveniência, exigindo integridade absoluta sob pressão. A perspectiva reafirmou que o fim não justifica os meios."
      },
      {
        "titulo": "Logística da Turma e Reposição de Conteúdo",
        "texto": "BiblicaMente por Karoline Evangelista iniciou a reunião pontuando a necessidade de aguardar mais estudantes para revisar o conteúdo da primeira aula, que serve de base para toda a disciplina, além de esclarecer dúvidas sobre a avaliação que haviam surgido durante a semana."
      },
      {
        "titulo": "Processo de Formação de Grupos para a Avaliação",
        "texto": "Com uma estimativa de 20 a 24 alunos, BiblicaMente por Karoline Evangelista orientou que a turma se organizasse em duplas e alguns trios para cobrir os 10 mandamentos, sendo necessário reorganizar grupos pré-existentes que contavam com mais integrantes."
      },
      {
        "titulo": "Atribuição dos Mandamentos (1º e 2º)",
        "texto": "O primeiro mandamento foi atribuído ao grupo de Daniel Rodrigues, após a exclusão de um membro que já havia cursado a disciplina. O segundo mandamento foi definido para a dupla composta por Camila Vieira e Cristian Riffo."
      },
      {
        "titulo": "Integração de Novos Estudantes e Atribuição do 8º Mandamento",
        "texto": "Talita RF Felinto, uma estudante transferida de turma, foi integrada ao grupo de Rodrigo Oliveira para o oitavo mandamento."
      },
      {
        "titulo": "Finalização das Composições de Grupo e 9º Mandamento",
        "texto": "Celso Oliveira e Alexandre foram definidos para o nono mandamento. O décimo mandamento foi reservado para Marlon, com a observação de que, caso não houvesse novos alunos, integrantes de outros grupos poderiam ser remanejados para completar a dupla."
      },
      {
        "titulo": "Detalhamento da Avaliação e Referências Bibliográficas",
        "texto": "BiblicaMente por Karoline Evangelista explicou que a avaliação consistirá em seminários realizados de 22 de outubro a 19 de novembro, baseados no livro Catecismo Maior de Westminster, focando em ética cristã, distinção entre legalismo e ética genuína, e aplicações contemporâneas. As notas serão atribuídas individualmente para cada estu..."
      }
    ],
    "proximasEtapas": [
      "Revisar Conteúdo Anterior: Realizar uma revisão do conteúdo da aula passada para os alunos que não puderam comparecer. Abordar os pontos principais ministrados anteriormente.",
      "Preparar Seminário: Elaborar o trabalho sobre um dos 10 Mandamentos com base na literatura recomendada e aplicações práticas. Organizar a divisão de tarefas dentro dos grupos definidos.",
      "Validar Grupos: Verificar a composição final dos grupos e a alocação dos alunos ausentes na próxima aula. Confirmar se todas as duplas e trios estão definidos corretamente.",
      "Organizar Grupos: Definir os responsáveis pelos estudos do 10º mandamento entre os participantes."
    ],
    "referenciasBiblicas": "Êxodo 20:1-17; Mateus 5:17-48; Romanos 12:1-2",
    "geminiUrl": "/gemini-notes/eti_aula2_2026-08-20.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-5-2026-08-27",
    "disciplinaId": "disc-5",
    "aulaNum": 3,
    "unidade": 1,
    "dateIso": "2026-08-27",
    "dateBr": "27/08/2026",
    "theme": "Aula 3 • Realidades Culturais e Missionárias",
    "resumoGeral": "O encontro definiu critérios avaliativos e debateu a falibilidade de cosmovisões éticas perante o fundamento cristão. Critérios e Dinâmica Avaliativa A nota será composta por pesquisa em grupo e apresentação individual. Cada grupo terá 30 minutos para expor seus mandamentos focando na aplicação prática da ética cristã. Debate Sobre Fundamentos Éticos Os participantes analisaram a falência do relativismo, do hedonismo e do poder humano como medidas morais. Concluiu-se que apenas a ética cristã oferece um padrão imutável e sólido.",
    "topicos": [
      {
        "titulo": "Realidades Culturais e Missionárias",
        "texto": "Relatos do campo missionário destacaram os desafios culturais complexos no Brasil. A turma foi incentivada a considerar seu papel como agentes de transformação em regiões carentes."
      },
      {
        "titulo": "Organização e Critérios do Trabalho em Grupo",
        "texto": "A discussão inicial abordou a estrutura e os critérios de avaliação para as apresentações dos mandamentos. Rosiane Lima (Rosi) questionou sobre a abordagem exigida para mandamentos específicos, como o primeiro mandamento. BiblicaMente por Karoline Evangelista orientou que cada mandamento demanda uma abordagem distinta, recomendando seg..."
      },
      {
        "titulo": "Fundamentos Éticos e a Visão do Poder como Medida do Certo",
        "texto": "A aula retomou os conceitos de Norman Geisler sobre absolutismo ético e passou a analisar cosmovisões contrárias, avaliando o argumento de que o certo está nas mãos do mais forte. Levando essa premissa às últimas consequências, os participantes discutiram governos totalitários e figuras de poder. João Alexandre Souza Lemos citou Alexan..."
      },
      {
        "titulo": "Realidades Missionárias e Desafios Culturais no Brasil",
        "texto": "Salatiel Rodrigues compartilhou relatos profundos sobre o campo missionário, mencionando uma missionária com cinquenta anos de atuação em uma tribo indígena que conseguiu reverter o infanticídio de crianças nascidas com lábio leporino (termo complementado por Rodrigo Oliveira) e abordar outras práticas culturais locais, como a pornogra..."
      },
      {
        "titulo": "Hedonismo e o impacto da busca pela felicidade nas decisões éticas",
        "texto": "BiblicaMente por Karoline Evangelista apresentou o problema de pessoas, incluindo influenciadores cristãos, justificarem atitudes como o divórcio com base na premissa de que \"Deus quer a felicidade individual\", caindo no hedonismo. Rosiane Lima (Rosi) concordou, apontando que essa linguagem motivacional extrema distorce o conceito de c..."
      },
      {
        "titulo": "Crítica ao fundamento ético do \"bem maior para a raça humana\"",
        "texto": "A partir da afirmação de que o certo seria o bem maior para a raça humana, Rosiane Lima (Rosi) e Grazi Guimarães questionaram qual seria esse parâmetro e quem o define. Cristiano Sacramento argumentou que essa perspectiva utilitarista pode justificar a opressão, a escravidão ou o sacrifício de inocentes em prol da sociedade, comparando..."
      },
      {
        "titulo": "Adiamento do tema sobre aborto e reflexão sobre cosmovisão",
        "texto": "BiblicaMente por Karoline Evangelista informou que o tema do aborto seria transferido para a próxima semana devido ao tempo restrito da reunião. A pessoa docente solicitou que a turma pensasse em argumentos bíblicos para demonstrar que o fundamento moral não reside no ser humano, na sociedade ou na cultura, incentivando o uso de questi..."
      }
    ],
    "proximasEtapas": [
      "Confirmar membro: Localizar o nome do aluno pendente e confirmar a participação no grupo após a reunião.",
      "Organizar apresentação: Realizar a pesquisa sobre os mandamentos atribuídos e marcar uma reunião entre os integrantes para dividir as tarefas de apresentação e elaboração dos slides.",
      "Estudar aborto: Preparar o conteúdo sobre aborto para a discussão na próxima semana.",
      "Convidar participante: Chamar o marido para contribuir com a discussão sobre o tema da próxima aula."
    ],
    "referenciasBiblicas": "Êxodo 20:1-17; Mateus 5:17-48; Romanos 12:1-2",
    "geminiUrl": "/gemini-notes/eti_aula3_2026-08-27.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-5-2026-09-03",
    "disciplinaId": "disc-5",
    "aulaNum": 4,
    "unidade": 1,
    "dateIso": "2026-09-03",
    "dateBr": "03/09/2026",
    "theme": "Aula 4 • Relevância social da igreja",
    "resumoGeral": "Discussão ética cristã sobre aborto e a responsabilidade da igreja na assistência social e acolhimento comunitário. Fundamentos bíblicos sobre vida A reunião analisou perspectivas teológicas e exegeses bíblicas sobre a vida intrauterina e a proteção fetal. O consenso ético prioriza a preservação da vida sob princípios divinos. Dilemas e responsabilidade eclesial Debates abordaram casos de estupro e gestações de alto risco, destacando a necessidade do acolhimento cristão. A igreja deve oferecer suporte integral, evitando julgamentos e oferecendo assistência prática.",
    "topicos": [
      {
        "titulo": "Relevância social da igreja",
        "texto": "A conclusão reafirmou a importância da atuação prática da igreja na assistência social em vez de posições meramente teóricas. A vida foi estabelecida como o valor supremo cristão."
      },
      {
        "titulo": "Abertura e Introdução ao Encontro",
        "texto": "O encontro foi iniciado por BiblicaMente por Karoline Evangelista, que realizou um breve momento de acolhimento e interação com os participantes, incluindo uma breve troca de informações meteorológicas com Salatiel Rodrigues, que relatou temperaturas elevadas no Mato Grosso do Sul. A reunião foi formalmente aberta com uma oração, estab..."
      },
      {
        "titulo": "Critérios Éticos sobre o Aborto",
        "texto": "BiblicaMente por Karoline Evangelista apresentou os fundamentos que definem as decisões sobre o aborto, explicando que a visão sobre o feto — como ser plenamente humano, humano em potencial ou subumano — determina a posição ética adotada. Para quem considera o feto plenamente humano, o aborto é inaceitável, prevalecendo a dignidade da ..."
      },
      {
        "titulo": "Dificuldades na Definição de Pessoa",
        "texto": "Foi discutida a complexidade científica e lógica de determinar o momento exato em que um feto passa de \"não pessoa\" para \"pessoa\". BiblicaMente por Karoline Evangelista observou que não existe uma resposta científica clara para essa transição, dado que o ser humano está em constante desenvolvimento, inclusive após o nascimento, o que g..."
      },
      {
        "titulo": "Argumento Bíblico e a Vida no Ventre",
        "texto": "Rosiane Lima (Rosi) trouxe o Salmo 139:13 para embasar a visão cristã, destacando a criação do ser humano por Deus desde o ventre materno. BiblicaMente por Karoline Evangelista reforçou a importância deste texto como um argumento claro contra o aborto, sustentando que o feto já possui a condição de ser plenamente humano."
      },
      {
        "titulo": "Exegese de Êxodo 21",
        "texto": "22-23 e Problemas de Tradução: BiblicaMente por Karoline Evangelista apontou problemas sérios em certas traduções bíblicas de Êxodo 21:22-23, que utilizam termos como \"aborto\" em vez de \"dar à luz prematuramente\". Foi explicado que o texto original hebraico se refere a um parto prematuro sem dano grave, onde o ofensor paga uma indeniza..."
      },
      {
        "titulo": "Contexto Cultural Israelita e a Bênção da Vida",
        "texto": "Alcimar Luiz da Silva e Rosiane Lima (Rosi) destacaram que, na cultura judaica da época, o aborto era algo impensável e que filhos eram considerados bênçãos imensuráveis. Foi ressaltado que a exegese correta do texto de Êxodo enfatiza a proteção às mulheres grávidas e a responsabilidade civil em casos de acidentes, sendo fundamental ob..."
      }
    ],
    "proximasEtapas": [
      "Organizar Materiais: Acessar o aplicativo para visualizar e organizar os materiais para os alunos.",
      "Analisar Êxodo 21: Verificar em diferentes traduções da Bíblia o texto de Êxodo 21 22 a 23 e identificar o termo utilizado para descrever a situação.",
      "Continuar debate: Retomar a reflexão teológica e ética sobre o aborto na próxima aula para aprofundar o assunto."
    ],
    "referenciasBiblicas": "Salmo 139:13",
    "geminiUrl": "/gemini-notes/eti_aula4_2026-09-03.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-5-2026-10-08",
    "disciplinaId": "disc-5",
    "aulaNum": 9,
    "unidade": 2,
    "dateIso": "2026-10-08",
    "dateBr": "08/10/2026",
    "theme": "Aula 9 • Perspectivas Éticas Sobre Guerra",
    "resumoGeral": "Debate de ética cristã e guerra justa, conflitos geopolíticos e dilemas morais. Perspectivas Éticas Sobre Guerra: Revisão de ativismo e pacifismo. Seletivismo valida a defesa de inocentes. Conflito Israel e Hamas: Discussão sobre legítima defesa e terrorismo. Divergências sobre proporcionalidade e crimes de guerra. Encerramento e Metanoia: Reflexão sobre transformação mental e princípios cristãos. Conclusão da aula.",
    "topicos": [
      {
        "titulo": "Perspectivas Éticas Sobre Guerra",
        "texto": "Revisão de ativismo e pacifismo. Seletivismo valida a defesa de inocentes."
      },
      {
        "titulo": "Conflito Israel e Hamas",
        "texto": "Discussão sobre legítima defesa e terrorismo. Divergências sobre proporcionalidade e crimes de guerra."
      },
      {
        "titulo": "Encerramento e Metanoia",
        "texto": "Reflexão sobre transformação mental e princípios cristãos. Conclusão da aula."
      }
    ],
    "proximasEtapas": [
      "Apresentar Trabalho: Apresentar o trabalho em sala de aula seguindo o roteiro e os slides preparados, com duração máxima de 10 minutos."
    ],
    "referenciasBiblicas": "Êxodo 20:1-17; Mateus 5:17-48; Romanos 12:1-2",
    "geminiUrl": "https://docs.google.com/document/d/1w2xGUl8Ru7sSkltPpWN34rnPLkSCF-prX-1WO8XUXDI/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-5-2026-10-22",
    "disciplinaId": "disc-5",
    "aulaNum": 10,
    "unidade": 2,
    "dateIso": "2026-10-22",
    "dateBr": "22/10/2026",
    "theme": "Aula 10 • Visão Cristã da Ecologia",
    "resumoGeral": "Debate ecológico cristão abordou visões ambientais e ecologia com ênfase prática e teológica. Visão Cristã da Ecologia: Cristianismo equilibra o cuidado ambiental e o domínio humano, evitando extremos materialistas e panteístas. Debate sobre Animais e Teologia Teólogos liberais e tradicionais debateram direitos dos animais e hierarquia da criação sob premissa bíblica. Encerramento e Próximos Temas: Cronograma futuro incluiu novos debates e aula terminou com oração coletiva.",
    "topicos": [
      {
        "titulo": "Visão Cristã da Ecologia",
        "texto": "Cristianismo equilibra o cuidado ambiental e o domínio humano, evitando extremos materialistas e panteístas. Debate sobre Animais e Teologia Teólogos liberais e tradicionais debateram direitos dos animais e hierarquia da criação sob premissa bíblica."
      },
      {
        "titulo": "Encerramento e Próximos Temas",
        "texto": "Cronograma futuro incluiu novos debates e aula terminou com oração coletiva."
      }
    ],
    "proximasEtapas": [
      "Assistir aula gravada: Assistir ao início da aula gravada e preparar considerações sobre o tema discutido para compartilhar posteriormente com a turma.",
      "Realizar apresentações: Apresentar os temas referentes ao primeiro, segundo, terceiro e quarto mandamentos durante a próxima aula.",
      "Apresentar 10 Mandamentos: Preparar e apresentar os trabalhos em grupo sobre os 10 mandamentos durante a próxima aula."
    ],
    "referenciasBiblicas": "Gênesis 1:29; Romanos 1; Mateus 12:1",
    "geminiUrl": "https://docs.google.com/document/d/1Z1Tf7d25ZP6oaP4cM6Oy99Iz-uGu8uKLElKrgP8X8QE/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-5-2026-10-29",
    "disciplinaId": "disc-5",
    "aulaNum": 11,
    "unidade": 2,
    "dateIso": "2026-10-29",
    "dateBr": "29/10/2026",
    "theme": "Aula 11 • Organização do Cronograma",
    "resumoGeral": "Reunião abordou cronograma e seminários com mandamentos divinos. Organização do Cronograma: Definição do escopo das apresentações de seminários sobre os mandamentos devido a restrições de tempo. Seminário do Primeiro Mandamento: Discussão sobre os fundamentos teológicos, éticos e a idolatria do coração conforme o Catecismo Maior de Westminster. Seminário do Terceiro Mandamento: Análise dos pecados proibidos, razões anexas e teorias éticas aplicadas ao terceiro mandamento.",
    "topicos": [
      {
        "titulo": "Organização do Cronograma",
        "texto": "Definição do escopo das apresentações de seminários sobre os mandamentos devido a restrições de tempo."
      },
      {
        "titulo": "Seminário do Primeiro Mandamento",
        "texto": "Discussão sobre os fundamentos teológicos, éticos e a idolatria do coração conforme o Catecismo Maior de Westminster."
      },
      {
        "titulo": "Seminário do Terceiro Mandamento",
        "texto": "Análise dos pecados proibidos, razões anexas e teorias éticas aplicadas ao terceiro mandamento."
      }
    ],
    "proximasEtapas": [
      "Preparar apresentação: Preparar a apresentação sobre o quarto mandamento para a próxima aula."
    ],
    "referenciasBiblicas": "Deuteronômio 28:58; Mateus 12:24; Deuteronômio 6:4; Jeremias 10:10; Romanos 11:36; Isaías 42",
    "geminiUrl": "https://docs.google.com/document/d/1fNjlqWCj4F5N4PB_v03Q3-szv66roDyhy_nVRchv2uo/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-5-2026-11-05",
    "disciplinaId": "disc-5",
    "aulaNum": 12,
    "unidade": 2,
    "dateIso": "2026-11-05",
    "dateBr": "05/11/2026",
    "theme": "Aula 12 • Ajustes no cronograma",
    "resumoGeral": "Apresentação sobre o quarto mandamento debateu o descanso sabático e ajustou cronogramas com debates teológicos. Apresentação do quarto mandamento Apresentação abordou o quarto mandamento como lei moral perpétua contra a hiperprodutividade secular. Descanso sabático foi definido como abstenção voluntária e culto a Deus.",
    "topicos": [
      {
        "titulo": "Ajustes no cronograma",
        "texto": "Cronograma foi reorganizado para garantir 30 minutos por dupla nas próximas apresentações. Participantes discutiram critérios de notas e distribuição de pesquisas no drive. Debate teológico final Debate teológico aprofundou a distinção entre sábado e domingo cristão. Princípio do descanso semanal foi destacado para evitar idolatria e e..."
      }
    ],
    "proximasEtapas": [
      "Apresentar Quinto Mandamento: Apresentar o quinto mandamento na próxima aula. O grupo deve organizar o tempo para exposição dentro do cronograma da disciplina.",
      "Apresentar Sexto Mandamento: Apresentar o sexto mandamento na próxima quinta-feira. Caso o tempo permita após a apresentação dos outros grupos, a dupla deve estar preparada para expor.",
      "Compartilhar Pesquisa: Compartilhar a pesquisa realizada e os slides da apresentação com a turma. O material servirá como contribuição adicional ao conteúdo discutido.",
      "Preparar Apresentações: Preparar as apresentações dos próximos grupos para a aula seguinte. Os grupos responsáveis devem estar atentos ao tempo para garantir a exposição de todos."
    ],
    "referenciasBiblicas": "Apocalipse 1:10; Lucas 23:56; Mateus 2:27; Gênesis 2; Hebreus 4:9",
    "geminiUrl": "https://docs.google.com/document/d/1wYqtYlp27mvSlmeRK8dx2zWI0D7QFkKQJcmtP8pKN9c/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-5-2026-11-12",
    "disciplinaId": "disc-5",
    "aulaNum": 13,
    "unidade": 2,
    "dateIso": "2026-11-12",
    "dateBr": "12/11/2026",
    "theme": "Aula 13 • Análise do sexto mandamento",
    "resumoGeral": "Reunião analisou o quinto e o sexto mandamentos com foco na preservação da vida e deveres morais. Apresentação do quinto mandamento A aula debateu a Confissão de Fé de Westminster e os deveres recíprocos entre superiores e inferiores na família e na sociedade. Ficou decidido que a submissão aos líderes deve sempre subordinar-se aos princípios da palavra de Deus.",
    "topicos": [
      {
        "titulo": "Análise do sexto mandamento",
        "texto": "O grupo examinou a proibição do homicídio e a necessidade de cultivar a preservação da vida física e espiritual. A discussão destacou que a responsabilidade cristã exige ações ativas de proteção ao próximo e evangelização."
      },
      {
        "titulo": "Ajustes de cronograma e avisos",
        "texto": "A organização ajustou o calendário das próximas apresentações devido a compromissos particulares e divulgou materiais de estudo bíblico. A liderança confirmou a data para o seminário de apologética com foco em temáticas políticas."
      }
    ],
    "proximasEtapas": [
      "Apresentar Trabalho: Realizar a apresentação sobre o oitavo mandamento na próxima aula.",
      "Apresentar mandamento: Realizar a apresentação sobre o último mandamento na data acordada de 26.",
      "Enviar link: Compartilhar o link de acesso para a aula de sábado sobre política com os participantes."
    ],
    "referenciasBiblicas": "Mateus 5:21-22; Atos 16:28; Gênesis 4; Tiago 5:20; João 10:10; Romanos 13",
    "geminiUrl": "https://docs.google.com/document/d/1ZyK4GLfnI6nWyPRcJRbI2va4mclULoJJK6K3AtXcat4/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-5-2026-11-19",
    "disciplinaId": "disc-5",
    "aulaNum": 14,
    "unidade": 2,
    "dateIso": "2026-11-19",
    "dateBr": "19/11/2026",
    "theme": "Aula 14 • Sétimo mandamento e casamento",
    "resumoGeral": "Reunião discutiu mandamentos divinos para pureza conjugal e honestidade financeira. Sétimo mandamento e casamento: Estudo destacou que o sétimo mandamento exige santidade integral no corpo e na mente. O casamento foi instituído por Deus como união exclusiva entre homem e mulher. Oitavo mandamento e honestidade: Apresentação detalhou as exigências do oitavo mandamento contra o furto e a desonestidade. Enfatizou-se a mordomia responsável e a justiça nas relações sociais. Práticas financeiras e encerramento: Debateu-se o impacto negativo de fraudes, desperdícios e jogos de azar na comunidade. Próximos tópicos foram adiados para a semana seguinte devido ao horário.",
    "topicos": [
      {
        "titulo": "Sétimo mandamento e casamento",
        "texto": "Estudo destacou que o sétimo mandamento exige santidade integral no corpo e na mente. O casamento foi instituído por Deus como união exclusiva entre homem e mulher."
      },
      {
        "titulo": "Oitavo mandamento e honestidade",
        "texto": "Apresentação detalhou as exigências do oitavo mandamento contra o furto e a desonestidade. Enfatizou-se a mordomia responsável e a justiça nas relações sociais."
      },
      {
        "titulo": "Práticas financeiras e encerramento",
        "texto": "Debateu-se o impacto negativo de fraudes, desperdícios e jogos de azar na comunidade. Próximos tópicos foram adiados para a semana seguinte devido ao horário."
      }
    ],
    "proximasEtapas": [
      "Preparar Apresentação: Manter-se preparados para realizar a apresentação do trabalho durante esta sessão ou na próxima semana.",
      "Apresentar Nono Mandamento: Preparar e apresentar o nono mandamento na próxima aula.",
      "Apresentar Décimo Mandamento: Preparar e apresentar o décimo mandamento na próxima aula."
    ],
    "referenciasBiblicas": "Gênesis 2:24; Hebreus 13:4; Provérbios 4:23; Mateus 5:27-28; Hebreus 4:15 e 1; Efésios 5:25-27",
    "geminiUrl": "https://docs.google.com/document/d/1n45zbNB16cgYba0VB3IvoeTI_PESNZbq0bvlNOsComQ/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-6-2026-08-13",
    "disciplinaId": "disc-6",
    "aulaNum": 1,
    "unidade": 1,
    "dateIso": "2026-08-13",
    "dateBr": "13/08/2026",
    "theme": "Aula 1 • Abertura e interação inicial",
    "resumoGeral": "A aula estabeleceu diretrizes metodológicas e explorou debates históricos sobre a autoria da Epístola aos Hebreus. Metodologia e ferramentas digitais A nova metodologia prioriza anotações próprias e o uso de ferramentas digitais, incluindo o NotebookLM Pro. O semestre focará no estudo das Epístolas Gerais. Contexto da Epístola Hebreus O livro possui estrutura singular e utiliza grego refinado para confortar",
    "topicos": [
      {
        "titulo": "Abertura e interação inicial",
        "texto": "Márcio Leal, Salatiel Rodrigues, Daniel Rodrigues, Rosiane Lima, Josias Ribeiro e Cristiano Sacramento iniciaram a sessão com saudações e comentários sobre o clima, marcando o começo do semestre."
      },
      {
        "titulo": "Projetos e necessidades locais",
        "texto": "Cristiano Sacramento estimou a presença de 22 a 24 alunos na turma. Durante a discussão, Salatiel Rodrigues mencionou a necessidade de reparos no telhado do templo em Ladário, enquanto Cristiano Sacramento relatou o interesse da igreja em Tabatinga na aquisição de um motor de popa para o transporte de fiéis."
      },
      {
        "titulo": "Orientações do curso e material didático",
        "texto": "Márcio Leal informou que a metodologia do semestre será diferente, com as apresentações servindo apenas para pontuar os assuntos, exigindo que a turma faça anotações próprias. O livro base adotado para a disciplina é \"Introdução ao Novo Testamento\", de Carson, Douglas e Morris, publicado pela editora Vida Nova."
      },
      {
        "titulo": "Discussão sobre ferramentas digitais",
        "texto": "Cristiano Sacramento sugeriu o uso do NotebookLM para as apresentações. Márcio Leal relatou barreiras para acessar a versão paga da ferramenta, enquanto Josias Ribeiro recomendou o uso de um e-mail universitário para obter benefícios institucionais e acesso gratuito a recursos como armazenamento e o NotebookLM Pro. Cristiano Sacramento..."
      },
      {
        "titulo": "Logística das aulas",
        "texto": "Márcio Leal esclareceu que, embora as aulas tenham previsão de término para às 22h, o horário é flexível conforme o desenvolvimento do tema. O foco do semestre serão as Epístolas Gerais, com início pelo livro de Hebreus."
      },
      {
        "titulo": "Características literárias da Epístola aos Hebreus",
        "texto": "O autor observou que Hebreus possui uma estrutura singular, iniciando como um tratado, seguindo como um sermão e concluindo como uma carta. O texto carece de saudação inicial, identificação do autor e definição de destinatários, contudo, é notável pelo uso de um grego de alta qualidade e um vocabulário refinado."
      },
      {
        "titulo": "Contexto histórico e destinatários originais",
        "texto": "Os destinatários originais da epístola enfrentavam perseguição religiosa e instabilidade social, com a eminente destruição de Jerusalém e do templo, o que impactou a vida da comunidade cristã da época."
      }
    ],
    "proximasEtapas": [
      "Realizar anotações: Registrar os pontos abordados nas aulas para estudo posterior pois as apresentações servem apenas como roteiro de tópicos.",
      "Adquirir livro: Providenciar o exemplar de Introdução ao Novo Testamento de Carson Douglas e Morris para aprofundamento do conteúdo.",
      "Testar ferramenta: Tentar utilizar novamente o Notebook LM para a elaboração de futuras apresentações de slides.",
      "Compartilhar email: Informar aos demais colegas caso a secretaria responda à solicitação de fornecimento do endereço de e-mail estudantil."
    ],
    "referenciasBiblicas": "Atos 4:36; Atos 18:24 e 18:28",
    "geminiUrl": "/gemini-notes/nt3_aula1_2026-08-13.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-6-2026-08-20",
    "disciplinaId": "disc-6",
    "aulaNum": 2,
    "unidade": 1,
    "dateIso": "2026-08-20",
    "dateBr": "20/08/2026",
    "theme": "Aula 2 • Abertura e interações iniciais",
    "resumoGeral": "O encontro estabeleceu diretrizes disciplinares e explorou questões acadêmicas fundamentais sobre a autoria, destino e propósito de Hebreus. Diretrizes da disciplina acadêmica O curso exige uso de câmeras ligadas e realização de avaliações com 150 questões discursivas e orais. A referência bibliográfica principal definida para o semestre é a Introdução ao Novo Testamento. Análise histórica de Hebreus",
    "topicos": [
      {
        "titulo": "Abertura e interações iniciais",
        "texto": "O encontro iniciou com uma conversa informal entre Márcio Leal, Rodrigo Oliveira, Camila Vieira e Daniel Rodrigues, onde compartilharam atualizações sobre viagens de férias e a rotina de trabalho de Camila. Márcio Leal comentou sobre uma visita pastoral que não ocorreu devido a uma negativa da família, e o grupo discutiu brevemente o r..."
      },
      {
        "titulo": "Comentários sobre a aula anterior e citações",
        "texto": "Salatiel Rodrigues mencionou que o nome de Márcio Leal foi citado em uma aula anterior, gerando curiosidade sobre quem teria feito o comentário. Houve uma troca sobre se o autor do elogio seria Willam ou Tácito, com Daniel Rodrigues observando que Willam descreveu Márcio Leal em termos elevados, o que levou a uma brincadeira comparativ..."
      },
      {
        "titulo": "Atividades acadêmicas e convites",
        "texto": "Camila Vieira trouxe detalhes sobre o conteúdo ministrado pelo Willam, mencionando o conceito de \"caçar o coração\" e sua semelhança com o \"Gospel Coach\" da SRI. Márcio Leal anunciou que Willam pediu para que Márcio pregasse em sua posse no dia 17 de outubro, e Márcio compartilhou que viajará para a Malásia no dia 24 de outubro para um ..."
      },
      {
        "titulo": "Oração inicial",
        "texto": "Após os avisos e saudações, Camila Vieira conduziu a oração de abertura, pedindo bênçãos para a aula e para que os presentes recebessem o ensino ministrado."
      },
      {
        "titulo": "Boas-vindas aos novos alunos",
        "texto": "Márcio Leal deu as boas-vindas aos novos estudantes, Talita RF Felinto, da Igreja Congregacional do Ligeiro em Campina Grande, e Dijair Oliveira, presbítero da Igreja Congregacional no bairro Alto do Cruzeiro, em Brejo dos Santos."
      },
      {
        "titulo": "Diretrizes da disciplina",
        "texto": "Márcio Leal reiterou regras importantes para o semestre: a necessidade de manter as câmeras ligadas, a flexibilidade quanto ao horário de término (encerrando o tema conforme necessário antes das 22h), e o uso de slides sintéticos, exigindo que os alunos façam suas próprias anotações. Foi explicado que a avaliação consistirá em 150 ques..."
      },
      {
        "titulo": "Introdução à Epístola aos Hebreus",
        "texto": "O grupo iniciou a discussão teológica sobre a epístola aos Hebreus, analisando-a como um sermão transformado em carta. Márcio Leal destacou a ausência de introdução identificando o autor e os destinatários, o que torna o estudo desse livro particularmente complexo."
      }
    ],
    "proximasEtapas": [
      "Enviar material: Enviar o arquivo em PDF com a introdução ao Novo Testamento para Camila.",
      "Distribuir material: Encaminhar o arquivo PDF recebido para todos os alunos da turma.",
      "Ler Hebreus: Realizar a leitura da epístola aos Hebreus ao longo da semana para acompanhamento das próximas aulas."
    ],
    "referenciasBiblicas": "Hebreus 13:24; Hebreus 13:9; Romanos 14; Romanos 11:13 e 18; Hebreus 13:22",
    "geminiUrl": "/gemini-notes/nt3_aula2_2026-08-20.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-6-2026-08-27",
    "disciplinaId": "disc-6",
    "aulaNum": 3,
    "unidade": 1,
    "dateIso": "2026-08-27",
    "dateBr": "27/08/2026",
    "theme": "Aula 3 • Estudo das epístolas gerais",
    "resumoGeral": "A aula analisou a Epístola aos Hebreus focando na maturidade cristã e introduziu a Epístola de Tiago. Propósito da epístola Hebreus A carta foi definida como um sermão exortativo focado na maturidade cristã e na superioridade de Cristo. A hipótese de evangelização de não cristãos foi descartada.",
    "topicos": [
      {
        "titulo": "Estudo das epístolas gerais",
        "texto": "O termo católicas foi explicado como universal, e a ordenação no cânon foi detalhada. A epístola de Tiago foi apresentada como um texto de literatura de sabedoria prática. Autoria da carta Tiago A autoria de Tiago, irmão de Jesus, foi identificada como a mais viável devido às evidências históricas. A simplicidade da obra refletiu a exp..."
      },
      {
        "titulo": "Abertura e Contextualização da Epístola aos Hebreus",
        "texto": "Márcio Leal iniciou a aula abordando a questão do propósito da Epístola aos Hebreus, destacando que a carta é classificada como sui generis e possui um tom eminentemente exortativo, conforme indicado no capítulo 13, verso 13. Após a abertura, Cristiano Sacramento realizou a oração inicial da aula."
      },
      {
        "titulo": "Rejeição da Evangelização de Judeus Não Cristãos em Hebreus",
        "texto": "Durante a análise das teorias sobre o propósito da carta, Márcio Leal pontuou que a hipótese de ter sido escrita para evangelizar judeus não cristãos é descartada, pois a leitura de trechos como Hebreus 3:1-4, 6:4-9, 10:23-26 e 12:22-24 demonstra claramente que os leitores já eram cristãos."
      },
      {
        "titulo": "Análise da Apostasia e Segurança da Salvação",
        "texto": "Márcio Leal discutiu a teoria de que o propósito seria advertir contra a apostasia entendida como perda de salvação, refutando-a com base na doutrina reformada da redenção, segundo a qual a salvação é eterna e o nome dos salvos está definitivamente inscrito no livro da vida."
      },
      {
        "titulo": "Contexto Histórico e Desafios da Igreja Primitiva",
        "texto": "Márcio Leal destacou o cenário da igreja primitiva, marcado por uma atmosfera insegura, ausência ética e moral entre alguns gentios convertidos, ameaças constantes de perseguição, desapontamento com a demora da volta de Jesus e o receio de uma ruptura completa entre o judaísmo e o cristianismo."
      },
      {
        "titulo": "O Verdadeiro Propósito de Hebreus e a Maturidade Cristã",
        "texto": "Márcio Leal argumentou que o real objetivo da epístola é exortar os cristãos judeus à maturidade cristã, exigindo um rompimento completo com as velhas práticas e rituais do judaísmo que os impediam de experimentar uma vida abundante em Cristo."
      },
      {
        "titulo": "Influências Culturais Passadas e a Meritocracia Religiosa",
        "texto": "Márcio Leal abordou como heranças de religiões anteriores, a exemplo do catolicismo romano, deixam marcas em hábitos, vestimentas e na introdução equivocada da meritocracia na vivência evangélica, o que se opõe diretamente à graça divina e à visão de John Stott do cristianismo como uma contracultura."
      }
    ],
    "proximasEtapas": [
      "Verificar Divisões: Analisar as divisões de capítulos e aplicações da epístola aos Hebreus. Apresentar a estrutura correta na próxima aula.",
      "Preparar Slides: Elaborar novos materiais de apresentação para as próximas aulas sobre as epístolas gerais. Melhorar a qualidade visual do conteúdo didático.",
      "Ler Tiago: Realizar a leitura da epístola de Tiago durante a semana. Explorar o conteúdo bíblico para a discussão posterior.",
      "Apresentar data e local: Apresentar a data e o local da escrita da Epístola de Tiago na próxima reunião."
    ],
    "referenciasBiblicas": "Hebreus 3:1-4, 6:4-9, 10:23-26 e 12:22-24; Gálatas 2:9; Atos 15; Gênesis 49",
    "geminiUrl": "/gemini-notes/nt3_aula3_2026-08-27.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-6-2026-09-03",
    "disciplinaId": "disc-6",
    "aulaNum": 4,
    "unidade": 1,
    "dateIso": "2026-09-03",
    "dateBr": "03/09/2026",
    "theme": "Aula 4 • Ausência do Pastor Marcio e Status da Aula",
    "resumoGeral": "A aula foi cancelada devido a falhas técnicas, enquanto participantes discutiram trajetórias pessoais e condições climáticas regionais. Indisponibilidade do instrutor A instabilidade na conexão de internet impediu a realização da aula prevista. A liderança acompanhou a situação antes da definição final. Troca de vivências acadêmicas",
    "topicos": [
      {
        "titulo": "Ausência do Pastor Marcio e Status da Aula",
        "texto": "Os participantes discutiram a possibilidade de o Pastor Marcio ministrar a aula, com Camila Vieira relatando que, devido a uma viagem e problemas de conexão com a internet no hotel, o pastor não poderia estar presente naquele momento. Foi mencionado que a liderança, especificamente Robert, estava acompanhando a situação para verificar ..."
      },
      {
        "titulo": "Histórico Acadêmico e Eclesiástico dos Participantes",
        "texto": "Dijair Oliveira e Salatiel Rodrigues conversaram sobre suas trajetórias no seminário, relatando períodos de interrupção nos estudos devido a dificuldades pessoais e o posterior retorno para a conclusão dos cursos. Dijair Oliveira compartilhou detalhes sobre a vinculação com a Igreja Congregacional de Brejo dos Santos, na Paraíba, enqua..."
      },
      {
        "titulo": "Condições Climáticas e Geográficas Regionais",
        "texto": "A conversa abordou as condições climáticas e características regionais de locais como Mato Grosso do Sul, Brasília e Vitória da Conquista. Os participantes discutiram temas como temperaturas elevadas, chegando a marcas como 37º, 41º e 42º, a baixa umidade do ar, com registros de 12%, e os efeitos práticos dessas condições no cotidiano,..."
      },
      {
        "titulo": "Cancelamento da Aula e Avisos Finais",
        "texto": "Camila Vieira confirmou definitivamente que a aula não ocorreria, pois o Pastor Marcio não conseguiu solucionar os problemas técnicos de internet durante a viagem. Foi orientado que não havia necessidade de registrar presença ou realizar qualquer procedimento adicional, sendo o momento encerrado com votos de parabéns pelo aniversário d..."
      }
    ],
    "proximasEtapas": [],
    "referenciasBiblicas": "Tiago 1–5; 1 Pedro 1–5; 2 Pedro 1–3; 1–3 João; Judas",
    "geminiUrl": "/gemini-notes/nt3_aula4_2026-09-03.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-6-2026-10-08",
    "disciplinaId": "disc-6",
    "aulaNum": 8,
    "unidade": 2,
    "dateIso": "2026-10-08",
    "dateBr": "08/10/2026",
    "theme": "Aula 8 • 1 Pedro (Esperança Viva no Sofrimento)",
    "resumoGeral": "Devolutiva da AV1; introdução às Epístolas de Pedro e a contextualização da perseguição sob o Império Romano. Pontos de aprofundamento vinculados à unidade: 1 Pedro (Esperança Viva no Sofrimento) (Escrita com Silvano a partir de Roma (\"Babilônia\"); exorta os cristãos peregrinos a manterem conduta ilibada sob difamação hostil, lembrando que o sofrimento purifica a fé como ouro refinado no fogo.) 2 Pedro (Alerta contra Falsos Mestres e a Parusia) (Pedro combate hereges internos que ensinavam libertinagem e zombavam da segunda vinda; em 2Pe 3:9 ensina que o Senhor não retarda a promessa, mas é paciente visando ao arrependimento.) Base documental da avaliação: Slides do ...",
    "topicos": [
      {
        "titulo": "1 Pedro (Esperança Viva no Sofrimento)",
        "texto": "Escrita com Silvano a partir de Roma (\"Babilônia\"); exorta os cristãos peregrinos a manterem conduta ilibada sob difamação hostil, lembrando que o sofrimento purifica a fé como ouro refinado no fogo."
      },
      {
        "titulo": "2 Pedro (Alerta contra Falsos Mestres e a Parusia)",
        "texto": "Pedro combate hereges internos que ensinavam libertinagem e zombavam da segunda vinda; em 2Pe 3:9 ensina que o Senhor não retarda a promessa, mas é paciente visando ao arrependimento."
      },
      {
        "titulo": "O Conhecimento Pleno (Epignosis)",
        "texto": "Em 2 Pedro, a verdadeira arma contra a corrupção herética e o desvio moral é o crescimento no verdadeiro conhecimento salvífico de Jesus Cristo (2Pe 1:3; 3:18)."
      }
    ],
    "proximasEtapas": [
      "Revisar: Slides do professor e o livro-texto Introdução ao Novo Testamento (D. A. Carson, Douglas J. Moo e Leon Morris)."
    ],
    "referenciasBiblicas": "Tiago 1–5; 1 Pedro 1–5; 2 Pedro 1–3; 1–3 João; Judas",
    "geminiUrl": "https://docs.google.com/document/d/1IiEdNvD7Pu2n9gTSQc7t2aMU_-31twD3vF0u8F9yJJM/edit",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-6-2026-10-15",
    "disciplinaId": "disc-6",
    "aulaNum": 9,
    "unidade": 2,
    "dateIso": "2026-10-15",
    "dateBr": "15/10/2026",
    "theme": "Aula 9 • 1 Pedro (Esperança Viva no Sofrimento)",
    "resumoGeral": "1 Pedro: autoria do apóstolo Pedro com a mediação estilística de Silvano (Silas); envio a partir de Roma (\"Babilônia\", 1Pe 5:13) aos crentes da diáspora. Pontos de aprofundamento vinculados à unidade: 1 Pedro (Esperança Viva no Sofrimento) (Escrita com Silvano a partir de Roma (\"Babilônia\"); exorta os cristãos peregrinos a manterem conduta ilibada sob difamação hostil, lembrando que o sofrimento purifica a fé como ouro refinado no fogo.) Epístola aos Hebreus (Estilo homilético (sermão em forma de epístola); autoria humana anônima; anterior a 70 d.C.",
    "topicos": [
      {
        "titulo": "1 Pedro (Esperança Viva no Sofrimento)",
        "texto": "Escrita com Silvano a partir de Roma (\"Babilônia\"); exorta os cristãos peregrinos a manterem conduta ilibada sob difamação hostil, lembrando que o sofrimento purifica a fé como ouro refinado no fogo."
      },
      {
        "titulo": "Epístola aos Hebreus",
        "texto": "Estilo homilético (sermão em forma de epístola); autoria humana anônima; anterior a 70 d.C. (sacrifícios em vigor); destinação aos cristãos judeus de Roma (Hb 13:24); supremacia absoluta de Cristo sobre anjos, Moisés, Josué e Arão."
      },
      {
        "titulo": "2 Pedro (Alerta contra Falsos Mestres e a Parusia)",
        "texto": "Pedro combate hereges internos que ensinavam libertinagem e zombavam da segunda vinda; em 2Pe 3:9 ensina que o Senhor não retarda a promessa, mas é paciente visando ao arrependimento."
      },
      {
        "titulo": "O Conhecimento Pleno (Epignosis)",
        "texto": "Em 2 Pedro, a verdadeira arma contra a corrupção herética e o desvio moral é o crescimento no verdadeiro conhecimento salvífico de Jesus Cristo (2Pe 1:3; 3:18)."
      },
      {
        "titulo": "Carta de Tiago",
        "texto": "Autoria de Tiago (irmão de Jesus, líder em Jerusalém); datação primitiva (45 a 49 d.C.); sabedoria prática com 54 imperativos; harmonia com Paulo (Paulo combate o legalismo antes da salvação; Tiago combate o antinomismo hipócrita sem frutos)."
      }
    ],
    "proximasEtapas": [
      "Revisar: Slides do professor e o livro-texto Introdução ao Novo Testamento (D. A. Carson, Douglas J. Moo e Leon Morris)."
    ],
    "referenciasBiblicas": "Hb 13:24",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-6-2026-10-22",
    "disciplinaId": "disc-6",
    "aulaNum": 10,
    "unidade": 2,
    "dateIso": "2026-10-22",
    "dateBr": "22/10/2026",
    "theme": "Aula 10 • Autoria e Destinatários",
    "resumoGeral": "Aula abordou a carta de Judas com análise de autoria e datação. Autoria e Destinatários: Judas foi identificado como autor. Caráter circular da carta foi estabelecido. Datação e Apócrifos: Datação fixada por volta do ano 70 d.C. Uso de literatura apócrifa foi debatido. Propósito e Vigilância: Exortação contra falsos mestres destacada. Vigilância cristã recomendada.",
    "topicos": [
      {
        "titulo": "Autoria e Destinatários",
        "texto": "Judas foi identificado como autor. Caráter circular da carta foi estabelecido."
      },
      {
        "titulo": "Datação e Apócrifos",
        "texto": "Datação fixada por volta do ano 70 d.C. Uso de literatura apócrifa foi debatido."
      },
      {
        "titulo": "Propósito e Vigilância",
        "texto": "Exortação contra falsos mestres destacada. Vigilância cristã recomendada."
      }
    ],
    "proximasEtapas": [
      "Ler cartas joaninas: Realizar a leitura dos livros de primeira, segunda e terceira João. Utilizar o horário da aula suspensa da próxima semana para concluir esta tarefa.",
      "Orar por João: Dedicar momentos de oração pelo sucesso da cirurgia de João. Manter-se em espírito de oração para o procedimento médico agendado para amanhã."
    ],
    "referenciasBiblicas": "Judas 5; Judas 9; Judas 3",
    "geminiUrl": "https://docs.google.com/document/d/1Kq80omtq6u75kaI3x9nrvQfnHZBgPnfGydPMpN6XKGM/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-6-2026-10-29",
    "disciplinaId": "disc-6",
    "aulaNum": 11,
    "unidade": 2,
    "dateIso": "2026-10-29",
    "dateBr": "29/10/2026",
    "theme": "Aula 11 • 2 Pedro (Alerta contra Falsos Mestres e a Parusia)",
    "resumoGeral": "2 Pedro: o testamento de despedida do apóstolo diante do martírio iminente e a denúncia profética contra falsos mestres libertinos. Pontos de aprofundamento vinculados à unidade: 2 Pedro (Alerta contra Falsos Mestres e a Parusia) (Pedro combate hereges internos que ensinavam libertinagem e zombavam da segunda vinda; em 2Pe 3:9 ensina que o Senhor não retarda a promessa, mas é paciente visando ao arrependimento.) O Conhecimento Pleno (Epignosis) (Em 2 Pedro, a verdadeira arma contra a corrupção herética e o desvio moral é o crescimento no verdadeiro conhecimento salvífico de Jesus Cristo (2Pe 1:3; 3:18).) Base documental da avaliação: Slides do professor e o livro-tex...",
    "topicos": [
      {
        "titulo": "2 Pedro (Alerta contra Falsos Mestres e a Parusia)",
        "texto": "Pedro combate hereges internos que ensinavam libertinagem e zombavam da segunda vinda; em 2Pe 3:9 ensina que o Senhor não retarda a promessa, mas é paciente visando ao arrependimento."
      },
      {
        "titulo": "O Conhecimento Pleno (Epignosis)",
        "texto": "Em 2 Pedro, a verdadeira arma contra a corrupção herética e o desvio moral é o crescimento no verdadeiro conhecimento salvífico de Jesus Cristo (2Pe 1:3; 3:18)."
      },
      {
        "titulo": "1 Pedro (Esperança Viva no Sofrimento)",
        "texto": "Escrita com Silvano a partir de Roma (\"Babilônia\"); exorta os cristãos peregrinos a manterem conduta ilibada sob difamação hostil, lembrando que o sofrimento purifica a fé como ouro refinado no fogo."
      },
      {
        "titulo": "Cartas Joaninas (1, 2 e 3 João)",
        "texto": "Escritas pelo apóstolo João para refutar o docetismo (que negava a encarnação física real de Jesus); apresenta três testes do crente genuíno: doutrina correta, obediência moral e amor fraterno."
      }
    ],
    "proximasEtapas": [
      "Revisar: Slides do professor e o livro-texto Introdução ao Novo Testamento (D. A. Carson, Douglas J. Moo e Leon Morris)."
    ],
    "referenciasBiblicas": "Tiago 1–5; 1 Pedro 1–5; 2 Pedro 1–3; 1–3 João; Judas",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-6-2026-11-05",
    "disciplinaId": "disc-6",
    "aulaNum": 12,
    "unidade": 2,
    "dateIso": "2026-11-05",
    "dateBr": "05/11/2026",
    "theme": "Aula 12 • Introdução e diferenças críticas",
    "resumoGeral": "Estudo bíblico analisou a literatura joanina com foco na escatologia e combate às heresias atuais via amor cristão prático Introdução e diferenças críticas: Estudo detalhou as epístolas joaninas comparando sua escatologia primitiva e visão da morte de Cristo com o Evangelho. Divergências doutrinárias foram explicadas pelos propósitos específicos de cada texto bíblico. Contexto histórico e gnosticismo: Análise contextualizou Primeira João como um sermão contra o gnosticismo em Éfeso e a pós-modernidade. O espírito do anticristo foi combatido através da defesa da encarnação real de Jesus.",
    "topicos": [
      {
        "titulo": "Introdução e diferenças críticas",
        "texto": "Estudo detalhou as epístolas joaninas comparando sua escatologia primitiva e visão da morte de Cristo com o Evangelho. Divergências doutrinárias foram explicadas pelos propósitos específicos de cada texto bíblico."
      },
      {
        "titulo": "Contexto histórico e gnosticismo",
        "texto": "Análise contextualizou Primeira João como um sermão contra o gnosticismo em Éfeso e a pós-modernidade. O espírito do anticristo foi combatido através da defesa da encarnação real de Jesus."
      },
      {
        "titulo": "Marcas do cristianismo autêntico",
        "texto": "Reunião definiu as marcas da verdadeira fé como a obediência aos mandamentos e o perdão prático. Encontro encerrou com oração focada na submissão à palavra e transformação interior."
      }
    ],
    "proximasEtapas": [
      "Comprar passagem: Adquirir a passagem aérea para Gabriela acompanhar o pastor Márcio no encontro na Argentina.",
      "Preparar refeição: Cozinhar pratos de camarão sem pimenta nas próximas ocasiões de alimentação.",
      "Estudar Segunda João: Estudar a segunda carta de João durante o próximo encontro."
    ],
    "referenciasBiblicas": "1 João 5:11-13; João 20:30-31; 1 João 5:13; João 14:16; João 16:13; João 3",
    "geminiUrl": "https://docs.google.com/document/d/18ykCo3NYtT1JTBkWw0GLBZO9hkawUP6d9VK_S6Y6Mgo/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-6-2026-11-12",
    "disciplinaId": "disc-6",
    "aulaNum": 13,
    "unidade": 2,
    "dateIso": "2026-11-12",
    "dateBr": "12/11/2026",
    "theme": "Aula 13 • Encerramento da Matéria",
    "resumoGeral": "Estudo das epístolas abordou interpretação e combate a falsos mestres com desafios pastorais encerrados via oração Análise de Segunda João Estudo focou na epístola de Segunda João discutindo sua destinação e advertências contra o relativismo e falsos mestres. Comunidades foram instruídas a andar na verdade rejeitando doutrinas heréticas.",
    "topicos": [
      {
        "titulo": "Encerramento da Matéria",
        "texto": "Professor finalizou a disciplina de Epístolas Gerais orientando sobre a avaliação e incentivando a pós-graduação. A aula concluiu com agradecimentos e oração final."
      }
    ],
    "proximasEtapas": [
      "Manter alarme: Chamar um técnico para verificar e consertar o sistema de alarme da igreja.",
      "Revisar matéria: Estudar todo o conteúdo da disciplina para a segunda prova e preparar dúvidas para a próxima aula.",
      "Indicar Camila: Realizar a indicação de Camila para o curso na PUC.",
      "Estudar referências: Verificar as referências bibliográficas e iniciar a leitura dos livros necessários para o curso."
    ],
    "referenciasBiblicas": "João 1",
    "geminiUrl": "https://docs.google.com/document/d/1CzhxUexq8v-WnXg_O5Vh6N9Jdfu5yym4ohDKW_oVAUw/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-6-2026-11-19",
    "disciplinaId": "disc-6",
    "aulaNum": 14,
    "unidade": 2,
    "dateIso": "2026-11-19",
    "dateBr": "19/11/2026",
    "theme": "Aula 14 • Apresentações e Turmas",
    "resumoGeral": "Apresentações e Turmas: Apresentações acadêmicas foram avaliadas quanto à duração e ao cumprimento dos limites de tempo. A organização das turmas e a integração da nova discente foram discutidas para o próximo semestre. Formato da Avaliação Esclarecimentos sobre a prova destacaram questões de múltipla escolha com entrega estipulada para a quinta-feira. Materi...",
    "topicos": [
      {
        "titulo": "Apresentações e Turmas",
        "texto": "Apresentações acadêmicas foram avaliadas quanto à duração e ao cumprimento dos limites de tempo. A organização das turmas e a integração da nova discente foram discutidas para o próximo semestre. Formato da Avaliação Esclarecimentos sobre a prova destacaram questões de múltipla escolha com entrega estipulada para a quinta-feira. Materi..."
      }
    ],
    "proximasEtapas": [
      "Liberar Prova: Disponibilizar a avaliacao na proxima quinta-feira as 19 horas com prazo de entrega ate a meia-noite.",
      "Realizar Avaliacao: Responder a prova de multipla escolha disponibilizada pelo professor ate a meia-noite da proxima quinta-feira."
    ],
    "referenciasBiblicas": "Tiago 1–5; 1 Pedro 1–5; 2 Pedro 1–3; 1–3 João; Judas",
    "geminiUrl": "https://docs.google.com/document/d/14pJY-VuipYA9Hkv7tRJBxsyw8S5ySzZzwHMDWK9CVRQ/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-7-2026-08-14",
    "disciplinaId": "disc-7",
    "aulaNum": 1,
    "unidade": 1,
    "dateIso": "2026-08-14",
    "dateBr": "14/08/2026",
    "theme": "Aula 1 • Dúvidas sobre a turma e acesso ao conteúdo",
    "resumoGeral": "A sessão definiu diretrizes para a disciplina de revitalização de igrejas e debateu seus fundamentos e objetivos. Logística e objetivos acadêmicos A disciplina foi introduzida com foco em revitalização de igrejas para denominações históricas. A avaliação foi definida como composta por participação, resumos de leitura e prova escrita. Diferenciação de conceitos fundamentais Revitalização foi distinguida de plantação e manutenção, sendo um processo contínuo de reorganização bíblica. O debate esclareceu que revitalização difere de avivamento por ser uma prática cotidiana.",
    "topicos": [
      {
        "titulo": "Dúvidas sobre a turma e acesso ao conteúdo",
        "texto": "Os participantes Daniel Rodrigues e Cristiano Sacramento discutem a confusão sobre o link de acesso e a turma correta, questionando se já cursaram a disciplina em questão. Durante o diálogo, Seminarista William Barros esclarece que algumas aulas serão compartilhadas entre a turma A e a turma B, incluindo o Trabalho de Conclusão de Curs..."
      },
      {
        "titulo": "Apresentações e conexões pessoais",
        "texto": "Hélio da Silva Costa e Daniel Rodrigues realizam uma breve apresentação e trocam cumprimentos, com a participação de outros estudantes que relatam suas origens geográficas. O professor Thácyto Lessa entra na chamada e estabelece que as aulas começarão pontualmente às 19:00, visando otimizar o tempo disponível durante as sextas-feiras."
      },
      {
        "titulo": "Apresentação dos estudantes e ministérios",
        "texto": "O professor Thácyto Lessa conduz uma rodada de apresentações, na qual cada estudante compartilha informações sobre sua igreja, pastor e papel ministerial. Durante este processo, uma pessoa designada como \"\" faz uma intervenção importante, orientando que alunos da turma B que não cursaram as disciplinas de Homilética 1 e 2 devem migrar ..."
      },
      {
        "titulo": "Objetivos da disciplina e contexto da revitalização",
        "texto": "Thácyto Lessa apresenta a disciplina de \"Plantação e Revitalização de Igrejas 2\", explicando que o módulo foca especificamente em revitalização, um tema essencial para denominações históricas que enfrentam desafios de crescimento e saúde espiritual. O professor compartilha sua experiência pessoal na Igreja Congregacional de Teresópolis..."
      },
      {
        "titulo": "Formação e metodologia de ensino",
        "texto": "O docente expõe sua trajetória acadêmica, destacando pós-graduações em revitalização e liderança cristã, além de um mestrado em exposição bíblica e a colaboração com o movimento \"City to City Brasil\". O professor enfatiza que a metodologia de ensino evitará monólogos, incentivando a participação ativa e objetiva dos 38 alunos presentes..."
      },
      {
        "titulo": "Critérios de avaliação e datas",
        "texto": "O professor estabelece que a nota será composta pela participação e presença com a câmera ligada. A primeira avaliação (AV1) consiste em um resumo do livro \"A Treliça e a Videira\", escrito por Colin Marshall e Tony Payne, devendo ser entregue com uma página por capítulo para os 12 capítulos do livro. A segunda avaliação (AV2) será uma ..."
      },
      {
        "titulo": "Discussão sobre o estado da igreja brasileira",
        "texto": "Thácyto Lessa provoca um debate sobre a condição atual da igreja brasileira, perguntando se ela é saudável ou meramente \"inchada\". Paulo Lima argumenta que muitas igrejas apresentam crescimento numérico sem discipulado, assemelhando-se aos 300 de Gideão. Cristiano Sacramento observa que, no interior do Amazonas, a prática é focada na f..."
      }
    ],
    "proximasEtapas": [
      "Resumir livro: Resumir o livro A treliça e a videira capítulo por capítulo, com limite de uma folha por capítulo, e enviar para o e-mail do professor até o dia 27 de novembro de 2026.",
      "Realizar prova: Realizar a prova da disciplina no dia 27 de novembro de 2026.",
      "Enviar resumo: Enviar o resumo do livro para o e-mail do professor conforme disponibilidade.",
      "Disponibilizar slides: Entregar todos os slides da disciplina antes da realização da prova. O material servirá como fonte de consulta para os alunos."
    ],
    "referenciasBiblicas": "Apocalipse 2 e 3",
    "geminiUrl": "/gemini-notes/pri_aula1_2026-08-14.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-7-2026-08-21",
    "disciplinaId": "disc-7",
    "aulaNum": 2,
    "unidade": 1,
    "dateIso": "2026-08-21",
    "dateBr": "21/08/2026",
    "theme": "Aula 2 • Abertura e Introdução à Vitalidade da Igreja",
    "resumoGeral": "Debate sobre revitalização ministerial focou no papel do pastor e na importância de relacionamentos para mudanças estruturais. Papel central na revitalização A revitalização ministerial depende fundamentalmente da iniciativa, oração e compromisso do pastor com um ministério relacional. O pastor deve conquistar corações antes de implementar qualquer mudança estrutural necessária. Estratégia prática e gestão Pastores devem usar ferramentas de gestão, como a delegação de tarefas e planejamento estratégico, para equilibrar estrutura e crescimento orgânico. A revitalização exige perseverança, foco em pregação, piedade, pastoreio e paciência.",
    "topicos": [
      {
        "titulo": "Abertura e Introdução à Vitalidade da Igreja",
        "texto": "Thácyto Lessa abriu a reunião com uma oração, destacando o privilégio do encontro remoto para a reflexão sobre o reino de Deus e o serviço como servos do Senhor. O tema central estabelecido para a aula foi a análise da vitalidade da igreja local como o primeiro princípio fundamental para o processo de revitalização ministerial."
      },
      {
        "titulo": "Necessidade de Revitalização na Denominação",
        "texto": "Thácyto Lessa pontuou que, na realidade atual da denominação congregacional, aproximadamente 80% das igrejas necessitam de processos de revitalização. Foi enfatizado que muitos seminaristas, ao se formarem, encontrarão igrejas que precisam ser revitalizadas, sendo necessário abandonar a postura de \"pastor de manutenção\" para atuar de f..."
      },
      {
        "titulo": "O Papel Central do Pastor na Revitalização",
        "texto": "A revitalização depende fundamentalmente da compreensão e do empenho do pastor. Thácyto Lessa ressaltou que a oração deve focar na transformação do coração do pastor, pois sem a iniciativa e a consciência ministerial dele, a igreja não mudará."
      },
      {
        "titulo": "O Primeiro Princípio",
        "texto": "Ministério Relacional: Thácyto Lessa explicou que a revitalização exige um pastor relacional. O trabalho ministerial vai além do púlpito e do gabinete, exigindo que o pastor conquiste o coração das pessoas, participando de suas vidas, dores e alegrias, sem o que não há pastoreio efetivo."
      },
      {
        "titulo": "A Importância da Identificação de Problemas",
        "texto": "Através do relacionamento, o pastor consegue identificar os reais problemas que levam a igreja ao declínio. Thácyto Lessa alertou que, sem esse contato próximo, o pastor corre o risco de gastar energia lutando contra problemas que não são a causa principal da estagnação da igreja."
      },
      {
        "titulo": "Desafios para Pastores Antigos vs. Novos",
        "texto": "Renata Souza e Thácyto Lessa discutiram que, embora seja possível revitalizar uma igreja onde se está há muito tempo, é um processo mais difícil devido à necessidade de humildade para reconhecer falhas anteriores. Marcos Paulo Carmo Nogueira acrescentou que, independentemente do tempo de casa, se o pastor não tiver a visão de revitaliz..."
      },
      {
        "titulo": "Modelos de Governo e Revitalização",
        "texto": "O Prof. Sergio observou que o modelo de governo da igreja influencia o processo de revitalização, sendo a democracia congregacional mais propícia ao questionamento e à participação do que modelos verticais ou monocráticos. Thácyto Lessa concordou, ressaltando que, embora desafiador, a revitalização é possível em diversos modelos, desde..."
      }
    ],
    "proximasEtapas": [
      "Presentear com Literatura: Presentear pastores com obras relevantes e indicar materiais de qualidade para o desenvolvimento ministerial.",
      "Contatar Pastor: Entrar em contato com o pastor Thácyto Lessa para solicitar orientação sobre processos de revitalização e pastoreio."
    ],
    "referenciasBiblicas": "Atos 6",
    "geminiUrl": "/gemini-notes/pri_aula2_2026-08-21.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-7-2026-08-28",
    "disciplinaId": "disc-7",
    "aulaNum": 3,
    "unidade": 1,
    "dateIso": "2026-08-28",
    "dateBr": "28/08/2026",
    "theme": "Aula 3 • Abertura da Sessão",
    "resumoGeral": "A discussão abordou critérios bíblicos para revitalização eclesiástica, enfatizando a liderança, pregação expositiva e saúde ministerial. Conceito de Vitalidade Eclesiástica A vitalidade depende da fidelidade às Escrituras e não de crescimento numérico ou excesso de eventos. O amadurecimento espiritual precede o crescimento numérico soberano de Deus. Treinamento de Liderança Líderes eficazes precisam treinar sucessores continuamente para evitar interrupções no crescimento ministerial. Delegar tarefas exige proximidade, discipulado constante e disposição para preparar pessoas antes de assumirem cargos.",
    "topicos": [
      {
        "titulo": "Abertura da Sessão",
        "texto": "Thácyto Lessa iniciou a reunião cumprimentando os participantes e conduzindo uma oração inicial, agradecendo pela oportunidade de realizar o encontro de forma remota para debater e louvar, pedindo que o Senhor conduzisse o diálogo e as famílias representadas."
      },
      {
        "titulo": "Processo de Revitalização da Igreja",
        "texto": "Thácyto Lessa recapitulou os temas abordados na semana anterior, destacando que a vitalidade da igreja local depende de relacionamento, identificação de problemas e ação, bem como dos quatro pilares que direcionam o pastor: pregação, piedade (interesse em buscar a Deus), pastoreio e perseverança, sendo esta última essencial pois os fru..."
      },
      {
        "titulo": "Sinais de Vitalidade vs. Maquiagem da Vitalidade",
        "texto": "Durante o debate sobre o que demonstra uma igreja viva, os participantes mencionaram que muitos membros e eventos frequentes podem aparentar saúde, mas muitas vezes mascaram problemas, levando ao sobrecarregamento dos mesmos membros e à falta de tempo para a vida familiar e comunitária fora da igreja."
      },
      {
        "titulo": "Pilares de uma Igreja Viva",
        "texto": "Hélio Teologia2026 destacou a comunhão e a zeladoria como elementos vitais, o que Thácyto Lessa corroborou, enfatizando que na sua igreja a Bíblia, a oração e a comunhão são pilares inegociáveis que orientam toda a programação ministerial."
      },
      {
        "titulo": "Definição de Vitalidade da Igreja",
        "texto": "A vitalidade é definida pela fidelidade às Escrituras, centralidade de Cristo e a obra do Espírito Santo, não sendo medida meramente por popularidade, tendências modernas ou intensidade ministerial, mas pela saúde espiritual conforme padrões bíblicos."
      },
      {
        "titulo": "Riscos da Programação Excessiva",
        "texto": "Thácyto Lessa compartilhou a experiência de mentorar pastores cujas igrejas definharam após a pandemia por serem dependentes de um fluxo constante de eventos, reforçando que uma igreja viva não precisa necessariamente de alta carga de programação, conforme princípios do livro Igreja Simples."
      },
      {
        "titulo": "Crescimento Numérico e Saúde da Igreja",
        "texto": "Discutiu-se que o crescimento numérico não é garantia de saúde, citando exemplos de igrejas grandes onde os membros desconhecem princípios básicos do evangelho, sendo possível que uma igreja menor seja extremamente saudável."
      }
    ],
    "proximasEtapas": [
      "Treinar Lideranças: Preparar novos líderes continuamente e discipular pessoas para evitar interrupções no crescimento ministerial.",
      "Estudar a Bíblia: Dedicar-se ao estudo das escrituras como livro base e evitar a negligência em favor de obras de autores teológicos.",
      "Treinar professores: Capacitar a equipe para ensinar o evangelho e a redenção, superando o foco exclusivo em lições morais.",
      "Ensinar crianças: Alocar seminaristas e teólogos preparados para o ministério infantil para garantir que o ensino aponte para Cristo."
    ],
    "referenciasBiblicas": "Lucas 18:27; Mateus 18:20; 2 Coríntios 3:6; Efésios 2",
    "geminiUrl": "/gemini-notes/pri_aula3_2026-08-28.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-7-2026-10-09",
    "disciplinaId": "disc-7",
    "aulaNum": 8,
    "unidade": 2,
    "dateIso": "2026-10-09",
    "dateBr": "09/10/2026",
    "theme": "Aula 8 • Critérios de equipe",
    "resumoGeral": "Revisão da avaliação com debate sobre liderança e definição de critérios de formação. Prazo da avaliação Decisão de manter o link de entrega da avaliação aberto até a meia-noite. Conceito de liderança Definição de liderança eficaz com foco em influência consciente e planejamento estratégico.",
    "topicos": [
      {
        "titulo": "Critérios de equipe",
        "texto": "Apresentação dos pilares de caráter, competência e combinação de temperamentos."
      }
    ],
    "proximasEtapas": [
      "Entregar AV1: Enviar a atividade AV1 através do link disponibilizado até a meia-noite de hoje.",
      "Responder perguntas: Analisar as 3 questões de liderança propostas pelo professor sobre o grupo ministerial e metas do reino.",
      "Cumprir prazo: Enviar a atividade ou projeto pendente respeitando o prazo limite que se encerra hoje."
    ],
    "referenciasBiblicas": "Atos 2:42-47; Mateus 16:18; Efésios 4:11-16",
    "geminiUrl": "https://docs.google.com/document/d/19nnfw9HsfjDxdE6yx4glueKYZW9NMqexeTvtSo8KOzw/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-7-2026-10-16",
    "disciplinaId": "disc-7",
    "aulaNum": 9,
    "unidade": 2,
    "dateIso": "2026-10-16",
    "dateBr": "16/10/2026",
    "theme": "Aula 9 • Os 4 Ps da Revitalização Pastoral",
    "resumoGeral": "Os 4 Ps da Revitalização Pastoral: Pregar (exposição bíblica vibrante), Piedade (santidade da liderança), Pastorear (cuidado individual) e Perseverar (resiliência ministerial). Pontos de aprofundamento vinculados à unidade: Os 4 Ps da Revitalização Pastoral ((1) Pregar: exposição fiel, vibrante e cristocêntrica da Bíblia; (2) Piedade: santidade de vida pessoal do pastor, oração e dependência do Espírito; (3) Pastorear: cuidado relacional individualizado; (4) Perseverar: paciência a longo prazo perante resistências.) As 9 Marcas de uma Igreja Saudável (Mark Dever) (Pregação Expositiva, Teologia Bíblica, Compreensão do Evangelho, Conversão Bíblica, Evangelismo Bíblico,...",
    "topicos": [
      {
        "titulo": "Os 4 Ps da Revitalização Pastoral",
        "texto": "(1) Pregar: exposição fiel, vibrante e cristocêntrica da Bíblia; (2) Piedade: santidade de vida pessoal do pastor, oração e dependência do Espírito; (3) Pastorear: cuidado relacional individualizado; (4) Perseverar: paciência a longo prazo perante resistências."
      },
      {
        "titulo": "As 9 Marcas de uma Igreja Saudável (Mark Dever)",
        "texto": "Pregação Expositiva, Teologia Bíblica, Compreensão do Evangelho, Conversão Bíblica, Evangelismo Bíblico, Membresia Consciente, Disciplina Eclesiástica, Discipulado e Liderança Bíblica."
      },
      {
        "titulo": "Plantação vs. Manutenção vs. Revitalização",
        "texto": "Plantação: nascimento de nova igreja do zero; Manutenção: estado burocrático focado em programas sem conversões ou maturidade; Revitalização: restauração intencional de uma igreja histórica viva em declínio grave."
      },
      {
        "titulo": "A Mudança de Mentalidade Pastoral (Ef 4:11-12)",
        "texto": "Transição do modelo de \"pastor como único funcionário prestador de serviços\" para \"pastor como treinador de fazedores de discípulos\"."
      }
    ],
    "proximasEtapas": [],
    "referenciasBiblicas": "Atos 2:42-47; Mateus 16:18; Efésios 4:11-16",
    "geminiUrl": "https://docs.google.com/document/d/1p90BhDK1MudLADtl6xBSSE-K5QWr_z4QgyGk0YpAL1c/edit",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-7-2026-10-23",
    "disciplinaId": "disc-7",
    "aulaNum": 10,
    "unidade": 2,
    "dateIso": "2026-10-23",
    "dateBr": "23/10/2026",
    "theme": "Aula 10 • Avisos e Conexões",
    "resumoGeral": "Debate sobre oração e revitalização eclesiástica com foco na dependência divina e engajamento masculino. Perspectivas da Oração Diferenciação entre oração de manutenção e de linha de frente. Necessidade de buscar uma relação profunda com Deus. Desafios e Liderança Discussão sobre a baixa participação masculina nas igrejas e orações. Enfatizada a importância do hábito devocional e comunitário.",
    "topicos": [
      {
        "titulo": "Avisos e Conexões",
        "texto": "Informado o cancelamento de aula acadêmica. Planejamento de cultos missionários e eventos de confraternização."
      }
    ],
    "proximasEtapas": [
      "Realizar semana de oração: Realizar uma semana de oração focada no conceito de linha de frente. O objetivo é desafiar a igreja a buscar conhecer o Senhor e desejar Sua vontade.",
      "Ler Livro: Ler o livro O Poder Através da Oração de E. M. Bounds para entender a base da oração de linha de frente.",
      "Ler Livro: Ler o livro Por que Tardará o Pleno Avivamento de Leonard Ravenhill para aprofundar o entendimento sobre avivamento e oração."
    ],
    "referenciasBiblicas": "Atos 2:42-47; Mateus 16:18; Efésios 4:11-16",
    "geminiUrl": "https://docs.google.com/document/d/1jvZb_7cO5hDhAPq_3eS5znOtkQBySC6-LqNSPOtHcU0/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-7-2026-10-30",
    "disciplinaId": "disc-7",
    "aulaNum": 11,
    "unidade": 2,
    "dateIso": "2026-10-30",
    "dateBr": "30/10/2026",
    "theme": "Aula 11 • A Metáfora da Treliça e da Videira",
    "resumoGeral": "Os conceitos centrais do livro A Treliça e a Videira: como manter as estruturas eclesiásticas a serviço do ministério relacional de proclamar a Palavra de Deus. Pontos de aprofundamento vinculados à unidade: A Metáfora da Treliça e da Videira (Treliça (Estrutura): prédios, orçamentos, organogramas, programas e estatutos — sustenta mas não gera vida. Videira (Vida Espiritual): falar a Palavra de Deus no poder do Espírito através de evangelismo, oração e discipulado.) As Três Marcas da Igreja Verdadeira (R. C.",
    "topicos": [
      {
        "titulo": "A Metáfora da Treliça e da Videira",
        "texto": "Treliça (Estrutura): prédios, orçamentos, organogramas, programas e estatutos — sustenta mas não gera vida. Videira (Vida Espiritual): falar a Palavra de Deus no poder do Espírito através de evangelismo, oração e discipulado."
      },
      {
        "titulo": "As Três Marcas da Igreja Verdadeira (R. C. Sproul e Reformadores)",
        "texto": "(1) Fiel proclamação da Palavra de Deus; (2) Ministração correta das ordenanças/sacramentos (Batismo e Ceia); (3) Exercício da disciplina eclesiástica restauradora."
      },
      {
        "titulo": "Os 4 Ps da Revitalização Pastoral",
        "texto": "(1) Pregar: exposição fiel, vibrante e cristocêntrica da Bíblia; (2) Piedade: santidade de vida pessoal do pastor, oração e dependência do Espírito; (3) Pastorear: cuidado relacional individualizado; (4) Perseverar: paciência a longo prazo perante resistências."
      },
      {
        "titulo": "A Mudança de Mentalidade Pastoral (Ef 4:11-12)",
        "texto": "Transição do modelo de \"pastor como único funcionário prestador de serviços\" para \"pastor como treinador de fazedores de discípulos\"."
      }
    ],
    "proximasEtapas": [],
    "referenciasBiblicas": "Atos 2:42-47; Mateus 16:18; Efésios 4:11-16",
    "geminiUrl": "https://docs.google.com/document/d/1PRf_AE2Q6eoQKk_e_oDpNFPQ23koQSaFP9Ev0WJvdPA/edit",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-7-2026-11-06",
    "disciplinaId": "disc-7",
    "aulaNum": 12,
    "unidade": 2,
    "dateIso": "2026-11-06",
    "dateBr": "06/11/2026",
    "theme": "Aula 12 • Fundamentos da missionalidade eclesiástica",
    "resumoGeral": "Revisão sobre missionalidade eclesiástica com foco na superação do isolamento interno e adoção de práticas intencionais Fundamentos da missionalidade eclesiástica: Revitalização de igrejas exige ir além das preferências pessoais para alcançar o povo perdido. Programações centradas em si mesmas isolam os de fora e transformam comunidades em clubes sociais. Missromissões e discipulado digital: Missão de Deus possui vertentes centrípeta e centrífuga. Ferramentas digitais atraem públicos cristãos, mas o principal desafio continua sendo o discipulado adequado dessas pessoas.",
    "topicos": [
      {
        "titulo": "Fundamentos da missionalidade eclesiástica",
        "texto": "Revitalização de igrejas exige ir além das preferências pessoais para alcançar o povo perdido. Programações centradas em si mesmas isolam os de fora e transformam comunidades em clubes sociais."
      },
      {
        "titulo": "Missromissões e discipulado digital",
        "texto": "Missão de Deus possui vertentes centrípeta e centrífuga. Ferramentas digitais atraem públicos cristãos, mas o principal desafio continua sendo o discipulado adequado dessas pessoas."
      },
      {
        "titulo": "Ações intencionais e evangelho",
        "texto": "Assistencialismo isolado deve ser evitado em prol de ações missionárias intencionais fundamentadas no evangelho. Essência da igreja é definida pelas Escrituras e contexto comunitário."
      }
    ],
    "proximasEtapas": [
      "Ler livro: Ler o livro Igreja Simples conforme indicado pelo professor para compreender a mudança de mentalidade necessária."
    ],
    "referenciasBiblicas": "Mateus 16:18; Mateus 28; Mateus 18:15-20; João 10; Apocalipse 2 e 3; Apocalipse 3:20",
    "geminiUrl": "https://docs.google.com/document/d/1UFG0ufUtVOwDJEBXn72eE6xETnshS-sdu3sbWA-HZmQ/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-7-2026-11-13",
    "disciplinaId": "disc-7",
    "aulaNum": 13,
    "unidade": 2,
    "dateIso": "2026-11-13",
    "dateBr": "13/11/2026",
    "theme": "Aula 13 • Avaliação e Fundamentos Teológicos",
    "resumoGeral": "Revisão da avaliação final com diretrizes de revitalização e distinção entre forma e essência. Avaliação e Fundamentos Teológicos: A prova final foi definida com consulta a material em PDF e prazo estendido. A essência da igreja exige retorno às doutrinas básicas fundamentadas nas Escrituras. Cosmovisão Missional e Demografia: O processo de revitalização demanda compreender o contexto histórico e demográfico da comunidade. A cosmovisão missional orienta os cristãos a atuarem como agentes do reino. Forma versus Essência: A confusão entre forma e essência gera resistências desnecessárias a mudanças na igreja.",
    "topicos": [
      {
        "titulo": "Avaliação e Fundamentos Teológicos",
        "texto": "A prova final foi definida com consulta a material em PDF e prazo estendido. A essência da igreja exige retorno às doutrinas básicas fundamentadas nas Escrituras."
      },
      {
        "titulo": "Cosmovisão Missional e Demografia",
        "texto": "O processo de revitalização demanda compreender o contexto histórico e demográfico da comunidade. A cosmovisão missional orienta os cristãos a atuarem como agentes do reino."
      },
      {
        "titulo": "Forma versus Essência",
        "texto": "A confusão entre forma e essência gera resistências desnecessárias a mudanças na igreja. Exemplos corporativos ilustraram a importância de preservar a essência adaptando a forma."
      }
    ],
    "proximasEtapas": [
      "Disponibilizar materiais: Converter as apresentações de aula em formato PDF e enviar o conteúdo aos alunos como material de consulta para a prova.",
      "Enviar PDF: Disponibilizar o arquivo em PDF com o conteúdo da aula para a turma.",
      "Entregar Avaliações: Realizar a prova de consulta e entregar o trabalho sobre o livro Treliça e a Videira até o dia 28.",
      "Solicitar Informações: Contatar o pastor por mensagem para obter detalhes sobre a impressão de envelopes da igreja."
    ],
    "referenciasBiblicas": "Gênesis 11; Gênesis 12; Efésios 5:25",
    "geminiUrl": "https://docs.google.com/document/d/1jooWD7YG-2GZWIDfINg5_Ac9MWjRAspEwQsTnSk9e3o/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-7-2026-11-20",
    "disciplinaId": "disc-7",
    "aulaNum": 14,
    "unidade": 2,
    "dateIso": "2026-11-20",
    "dateBr": "20/11/2026",
    "theme": "Aula 14 • Plantação vs. Manutenção vs. Revitalização",
    "resumoGeral": "Conclusão das dinâmicas pastorais de revitalização e plantação de congregações autônomas; encerramento preparatório para a AV2. Pontos de aprofundamento vinculados à unidade: Plantação vs. Manutenção vs. Revitalização (Plantação: nascimento de nova igreja do zero; Manutenção: estado burocrático focado em programas sem conversões ou maturidade; Revitalização: restauração intencional de uma igreja histórica viva em declínio grave.) Os 4 Ps da Revitalização Pastoral ((1) Pregar: exposição fiel, vibrante e cristocêntrica da Bíblia; (2) Piedade: santidade de vida pessoal do pastor, oração e dependência do Espírito; (3) Pastorear: cuidado relacional individualizado; (4) Pe...",
    "topicos": [
      {
        "titulo": "Plantação vs. Manutenção vs. Revitalização",
        "texto": "Plantação: nascimento de nova igreja do zero; Manutenção: estado burocrático focado em programas sem conversões ou maturidade; Revitalização: restauração intencional de uma igreja histórica viva em declínio grave."
      },
      {
        "titulo": "Os 4 Ps da Revitalização Pastoral",
        "texto": "(1) Pregar: exposição fiel, vibrante e cristocêntrica da Bíblia; (2) Piedade: santidade de vida pessoal do pastor, oração e dependência do Espírito; (3) Pastorear: cuidado relacional individualizado; (4) Perseverar: paciência a longo prazo perante resistências."
      }
    ],
    "proximasEtapas": [],
    "referenciasBiblicas": "Atos 2:42-47; Mateus 16:18; Efésios 4:11-16",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-8-2026-08-14",
    "disciplinaId": "disc-8",
    "aulaNum": 1,
    "unidade": 1,
    "dateIso": "2026-08-14",
    "dateBr": "14/08/2026",
    "theme": "Aula 1 • Abertura da disciplina e objetivos",
    "resumoGeral": "A disciplina de Trabalho de Conclusão de Curso 1 iniciou focada no avanço da escrita e ética. Objetivos da disciplina A disciplina visa acelerar a escrita do artigo científico. Foi decidido criar um grupo de WhatsApp para facilitar a comunicação acadêmica. Critérios e integridade acadêmica A nota final considerará a participação e o progresso contínuo. É proibido o uso de ferramentas de inteligência artificial ou terceiros para a redação do trabalho. Metodologia e planejamento futuro O foco deve ser a pesquisa bibliográfica para sustentar os dados. Recomenda-se aproveitar o período de férias para concluir o trabalho antes do próximo semestre.",
    "topicos": [
      {
        "titulo": "Abertura da disciplina e objetivos",
        "texto": "A disciplina de TCC1 foi iniciada pelo docente Márcio Leal, que estabeleceu como objetivo principal o adiantamento significativo do trabalho acadêmico. A meta é que, ao término desta disciplina, a turma já tenha avançado na escrita do artigo científico, independente do período em que cada pessoa se encontre no curso."
      },
      {
        "titulo": "Organização administrativa e comunicação",
        "texto": "Ficou decidido que será criado um grupo de WhatsApp, denominado \"TCC1 - segundo semestre 2026\", para facilitar a comunicação fora do horário de aula e o envio de informações pertinentes. O grupo será gerenciado por representantes da turma e incluirá o docente para acompanhamento."
      },
      {
        "titulo": "Coleta de dados da turma",
        "texto": "Para organizar a disciplina, cada estudante deverá fornecer no grupo de WhatsApp o nome completo, o período do curso em que está matriculado, o tema da pesquisa (ou título provisório), o nome do orientador (caso já definido), o status do projeto (se já existe um pronto) e o estágio atual de desenvolvimento da escrita."
      },
      {
        "titulo": "Definição de orientadores e projetos",
        "texto": "O docente enfatizou a necessidade de buscar um orientador com afinidade na área do tema escolhido e verificar a viabilidade da orientação. Caso o projeto de pesquisa tenha sido alterado desde a disciplina de Metodologia, o estudante deve elaborar um novo projeto para servir de base ao artigo."
      },
      {
        "titulo": "Mapeamento do estágio de escrita",
        "texto": "O docente ressaltou a importância de cada pessoa identificar claramente em que ponto do desenvolvimento do artigo se encontra, seja apenas na fase de pesquisa bibliográfica, leitura ou início da redação, para que o docente possa oferecer o suporte adequado."
      },
      {
        "titulo": "Critérios de avaliação",
        "texto": "Foi esclarecido que a disciplina não terá avaliações tradicionais, como provas. A nota final será composta pela participação e, principalmente, pelo desenvolvimento contínuo do trabalho final de cada estudante."
      },
      {
        "titulo": "Ética e autorização para entrevistas",
        "texto": "Em resposta a dúvidas sobre pesquisas de campo com fontes primárias, o docente orientou que, ao citar nomes de pessoas entrevistadas, o estudante deve obter uma autorização por escrito da pessoa. Caso o estudante opte por não citar nomes reais, utilizando pseudônimos ou descrições genéricas, a autorização formal não é exigida."
      }
    ],
    "proximasEtapas": [
      "Criar Grupo WhatsApp: Criar um grupo no WhatsApp nomeado TCC1 segundo semestre 2026 e incluir todos os alunos e a professora.",
      "Responder Questionário: Enviar no grupo de WhatsApp as informações sobre nome, período, tema, orientador, status do projeto e estágio do desenvolvimento do artigo.",
      "Pesquisar Normas ABNT: Buscar as regras de formatação da Associação Brasileira de Normas Técnicas para aplicar ao artigo científico.",
      "Definir Orientador: Verificar a afinidade dos professores com o tema escolhido e contatá-los para confirmar a disponibilidade de orientação."
    ],
    "referenciasBiblicas": "Eclesiastes 12:9-12; Lucas 1:1-4; 2 Timóteo 2:15",
    "geminiUrl": "/gemini-notes/tcc_aula1_2026-08-14.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-8-2026-08-21",
    "disciplinaId": "disc-8",
    "aulaNum": 2,
    "unidade": 1,
    "dateIso": "2026-08-21",
    "dateBr": "21/08/2026",
    "theme": "Aula 2 • Início da Reunião e Logística Tecnológica",
    "resumoGeral": "Reunião de alinhamento metodológico definiu prazos, estruturas acadêmicas e responsabilidades para o Trabalho de Conclusão de Curso. Diretrizes e estrutura metodológica Foi estabelecido o prazo rigoroso de 2 semanas para a entrega do projeto de pesquisa. A estrutura exigida deve incluir capa, sumário, objetivos e justificativa, com a introdução finalizada obrigatoriamente ao final. Metodologia e pesquisa científica Definiu-se a predominância da pesquisa qualitativa bibliográfica, com ressalvas para a pesquisa campo que exige fundamentação teórica sólida. O uso de primeira pessoa foi proibido em favor de linguagem impessoal.",
    "topicos": [
      {
        "titulo": "Início da Reunião e Logística Tecnológica",
        "texto": "No início do encontro, Cristiano Sacramento ofereceu suporte técnico a Márcio Leal (identificada no contexto como professora Gabriela) devido ao uso do e-mail de outra pessoa, sugerindo a inclusão automática do endereço para evitar a necessidade de autorizações futuras. Cristiano Sacramento também aconselhou todos os participantes a in..."
      },
      {
        "titulo": "Diferenças no Progresso dos Alunos e a Importância do Projeto",
        "texto": "Márcio Leal observou uma disparidade considerável no progresso dos estudantes: alguns já possuem o projeto finalizado ou rascunhos de artigos, enquanto outros definiram apenas a temática. Diante disso, a palestrante argumentou detalhadamente que o projeto de pesquisa funciona como um planejamento indispensável e um norteador para evita..."
      },
      {
        "titulo": "Definição de Prazos e Nivelamento da Turma",
        "texto": "Márcio Leal estabeleceu o prazo rígido de duas semanas para a entrega do projeto de pesquisa, independentemente de os alunos estarem no quarto, quinto ou sétimo período. A justificativa para a imposição desse limite de tempo baseou-se na premissa de que a escrita científica exige prazos estipulados para evitar a procrastinação. O plane..."
      },
      {
        "titulo": "Elementos Iniciais do Projeto - Capa, Sumário e Objetivos",
        "texto": "Ao detalhar a estrutura do projeto, Márcio Leal explicou que a capa deve conter o título provisório ou, no mínimo, a temática geral da pesquisa (como \"discipulado\" ou \"protestantismo no Brasil\"), seguida por um sumário com os itens regulamentares. Foi emitida uma regra metodológica clara: a introdução nunca deve ser o ponto de partida,..."
      },
      {
        "titulo": "A Estrutura e o Sentido da Justificativa",
        "texto": "Márcio Leal respondeu a uma dúvida de Daniel Rodrigues, esclarecendo que a justificativa pode ser posicionada após a introdução sem que isso cause qualquer prejuízo ao cronograma do trabalho. A palestrante definiu a justificativa como a explicação do \"porquê\" o pesquisador se interessou pelo tema, diferenciando-a do objetivo, que foca ..."
      },
      {
        "titulo": "Metodologia de Pesquisa - Tipos e Aplicações",
        "texto": "Márcio Leal expôs detalhadamente as três modalidades de metodologia aplicadas na graduação: a pesquisa qualitativa, a quantitativa e a mista (qualitativa-quantitativa). A pesquisa qualitativa pura, baseada estritamente na revisão bibliográfica, foi apontada como a predominante nos cursos de graduação. Sobre a pesquisa quantitativa, det..."
      },
      {
        "titulo": "Pesquisa de Campo, Observação e Inclusão de Anexos",
        "texto": "João Alexandre Souza Lemos indagou se a pesquisa quantitativa poderia englobar a observação de campo, e Márcio Leal confirmou a possibilidade, desde que seja elaborado um roteiro estruturado e planejado previamente de acordo com o tema, evitando visitas sem direcionamento. Toda coleta de dados empíricos por meio de observação ou entrev..."
      }
    ],
    "proximasEtapas": [
      "Criar projeto: Desenvolver o projeto de pesquisa seguindo os tópicos apresentados em aula no prazo de 2 semanas.",
      "Publicar itens: Disponibilizar no grupo os itens detalhados que compoem o projeto de pesquisa para consulta dos alunos.",
      "Instalar Google Agenda: Instalar o aplicativo Google Agenda no celular ou computador para melhorar a organização e o acesso aos convites das aulas.",
      "Procurar orientador: Entrar em contato com o orientador acadêmico para auxiliar na estruturação e no direcionamento da pesquisa."
    ],
    "referenciasBiblicas": "Eclesiastes 12:9-12; Lucas 1:1-4; 2 Timóteo 2:15",
    "geminiUrl": "/gemini-notes/tcc_aula2_2026-08-21.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-8-2026-08-28",
    "disciplinaId": "disc-8",
    "aulaNum": 3,
    "unidade": 1,
    "dateIso": "2026-08-28",
    "dateBr": "28/08/2026",
    "theme": "Aula 3 • Ansiedade relacionada ao Trabalho de Conclusão de Curso",
    "resumoGeral": "Debates sobre a escrita do Trabalho de Conclusão de Curso integraram exigências metodológicas e normas acadêmicas técnicas. Desafios na Escrita Acadêmica Estudantes discutiram tensões na conciliação do Trabalho de Conclusão de Curso com estágios. A diretriz principal estabeleceu manter o foco nos artigos atuais sem reestruturar projetos originais. Exigências Técnicas e Metodologia A orientação reforçou a necessidade de seguir rigidamente as normas da Associação Brasileira de Normas Técnicas. A escrita da metodologia deve iniciar imediatamente para estruturar a abordagem qualitativa ou quantitativa.",
    "topicos": [
      {
        "titulo": "Ansiedade relacionada ao Trabalho de Conclusão de Curso",
        "texto": "Os estudantes expressaram tensão e ansiedade quanto à produção do Trabalho de Conclusão de Curso (TCC), destacando a dificuldade de conciliar o estágio e a escrita final durante o oitavo período."
      },
      {
        "titulo": "Trajetória acadêmica e futura",
        "texto": "A Professora Márcio Leal incentivou os estudantes a considerarem a continuidade acadêmica em mestrados e doutorados, enfatizando a importância de teólogos bem formados que unam a fé à ciência."
      },
      {
        "titulo": "Homenagem ao trabalho acadêmico de Cristiano Sacramento",
        "texto": "A Professora Márcio Leal parabenizou o filho de Cristiano Sacramento por sua corajosa defesa de tese sobre sexualidade, um tema considerado relevante e pouco abordado nas igrejas."
      },
      {
        "titulo": "Mudança de foco no projeto de Cristiano Sacramento",
        "texto": "Cristiano explicou que, por recomendação de seu orientador, decidiu manter seu pré-projeto atual em vez de mudar para o tema de povos originários e ribeirinhos, deixando o tópico mais complexo para uma futura pós-graduação."
      },
      {
        "titulo": "Desenvolvimento ministerial de Cristiano Sacramento",
        "texto": "Cristiano compartilhou que seu filho assumirá a liderança de uma congregação em Itaguaí, atuando como pastor presidente com Cristiano servindo como pastor auxiliar."
      },
      {
        "titulo": "Oração de abertura",
        "texto": "Daniel Rodrigues liderou uma oração pedindo sabedoria e entendimento para que a turma pudesse aplicar o conhecimento adquirido durante a escrita do artigo."
      },
      {
        "titulo": "Exigências de formatação da Maciço do Baturité",
        "texto": "A Professora Márcio Leal reforçou a necessidade de seguir rigidamente as normas de formatação da faculdade Maciço do Baturité, advertindo que trabalhos fora do padrão serão devolvidos pela coordenação do seminário."
      }
    ],
    "proximasEtapas": [
      "Compartilhar formato artigo: Publicar o guia de formatação do artigo da Faculdade Maciço do Baturité no grupo de metodologia após o término da aula.",
      "Compartilhar modelo artigo: Disponibilizar um modelo de artigo que siga a estrutura exigida pela instituição no grupo de metodologia.",
      "Enviar normas orientador: Encaminhar o documento com as normas de formatação do artigo para os respectivos orientadores acadêmicos.",
      "Publicar guia ABNT: Publicar no grupo o guia de como realizar citações de podcast conforme as normas da ABNT."
    ],
    "referenciasBiblicas": "Eclesiastes 12:9-12; Lucas 1:1-4; 2 Timóteo 2:15",
    "geminiUrl": "/gemini-notes/tcc_aula3_2026-08-28.pdf",
    "sourceType": "pdf"
  },
  {
    "id": "cornell-gemini-disc-8-2026-10-09",
    "disciplinaId": "disc-8",
    "aulaNum": 8,
    "unidade": 2,
    "dateIso": "2026-10-09",
    "dateBr": "09/10/2026",
    "theme": "Aula 8 • Abertura e Diretrizes Acadêmicas",
    "resumoGeral": "Reunião abordou diretrizes de TCC com estratégias de pesquisa e relatos missionários. Abertura e Diretrizes Acadêmicas: Aula introduziu a dinâmica de TCC e destacou a segurança de dados em nuvem. Rigor científico e cronogramas exigem planejamento adequado dos estudantes. Metodologia e Escrita: Apresentação detalhou pesquisas de campo e leitura seletiva. Alinhamento entre dados práticos e fundamentação teórica estruturou a construção dos capítulos. Relatos Missionários e Parcerias: Discussão abordou desafios de missionários na Bolívia. Parcerias estruturadas garantem apoio sem posturas de dependência.",
    "topicos": [
      {
        "titulo": "Abertura e Diretrizes Acadêmicas",
        "texto": "Aula introduziu a dinâmica de TCC e destacou a segurança de dados em nuvem. Rigor científico e cronogramas exigem planejamento adequado dos estudantes."
      },
      {
        "titulo": "Metodologia e Escrita",
        "texto": "Apresentação detalhou pesquisas de campo e leitura seletiva. Alinhamento entre dados práticos e fundamentação teórica estruturou a construção dos capítulos."
      },
      {
        "titulo": "Relatos Missionários e Parcerias",
        "texto": "Discussão abordou desafios de missionários na Bolívia. Parcerias estruturadas garantem apoio sem posturas de dependência."
      }
    ],
    "proximasEtapas": [
      "Compartilhar link: Publicar o link no grupo. Enviar novamente o link de acesso ao armazenamento em nuvem para os estudantes.",
      "Apresentar vídeo: Exibir o vídeo na próxima aula conforme planejado anteriormente.",
      "Concluir apresentação: Realizar o fechamento da apresentação na aula da próxima semana."
    ],
    "referenciasBiblicas": "Eclesiastes 12:9-12; Lucas 1:1-4; 2 Timóteo 2:15",
    "geminiUrl": "https://docs.google.com/document/d/1mANDz_crlvKLbTE-UDDX9t9GjiCu5cPfO6pqP_813bE/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-8-2026-10-16",
    "disciplinaId": "disc-8",
    "aulaNum": 9,
    "unidade": 2,
    "dateIso": "2026-10-16",
    "dateBr": "16/10/2026",
    "theme": "Aula 9 • Ordem Cronológica Recomendada de Redação",
    "resumoGeral": "Metodologia Científica Aplicada à Teologia: classificação da pesquisa (qualitativa, bibliográfica, documental e histórico-descritiva). Pontos de aprofundamento vinculados à unidade: Ordem Cronológica Recomendada de Redação (Metodologia → Desenvolvimento dos Capítulos (Fundamentação Teórica) → Considerações Finais → Introdução e Resumo/Abstract (redigidos por último, após a conclusão do texto).) Linguagem Científica Impessoal (Terceira pessoa do singular ou voz passiva pronominal (\"observa-se\", \"constata-se\", \"pretende-se demonstrar\"). Jamais utilizar \"eu acho\", \"minha opinião\" ou \"percebemos\".)",
    "topicos": [
      {
        "titulo": "Ordem Cronológica Recomendada de Redação",
        "texto": "Metodologia → Desenvolvimento dos Capítulos (Fundamentação Teórica) → Considerações Finais → Introdução e Resumo/Abstract (redigidos por último, após a conclusão do texto)."
      },
      {
        "titulo": "Linguagem Científica Impessoal",
        "texto": "Terceira pessoa do singular ou voz passiva pronominal (\"observa-se\", \"constata-se\", \"pretende-se demonstrar\"). Jamais utilizar \"eu acho\", \"minha opinião\" ou \"percebemos\"."
      },
      {
        "titulo": "Estrutura do Resumo Acadêmico (NBR 6028)",
        "texto": "Parágrafo único contínuo de 150 a 500 palavras, espaçamento simples, contendo tema, objetivo geral, metodologia, principais resultados e conclusão, seguido de 3 a 5 palavras-chave separadas por ponto final."
      },
      {
        "titulo": "Normas de Referências Bibliográficas (NBR 6023)",
        "texto": "Alinhadas estritamente à margem esquerda, espaçamento simples interno, separadas por 1 espaço em branco, ordenadas em ordem alfabética pelo sobrenome do autor e com título da obra em negrito."
      }
    ],
    "proximasEtapas": [],
    "referenciasBiblicas": "Eclesiastes 12:9-12; Lucas 1:1-4; 2 Timóteo 2:15",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-8-2026-10-23",
    "disciplinaId": "disc-8",
    "aulaNum": 10,
    "unidade": 2,
    "dateIso": "2026-10-23",
    "dateBr": "23/10/2026",
    "theme": "Aula 10 • Cancelamento da aula",
    "resumoGeral": "Cancelamento de aula discutido e comunicado confirmado para turmas Cancelamento da aula: Ausência comunicada para a turma A mas ignorada pela turma B. Confirmação do cancelamento: Confirmação direta obtida sobre a suspensão da aula.",
    "topicos": [
      {
        "titulo": "Cancelamento da aula",
        "texto": "Ausência comunicada para a turma A mas ignorada pela turma B."
      },
      {
        "titulo": "Confirmação do cancelamento",
        "texto": "Confirmação direta obtida sobre a suspensão da aula."
      }
    ],
    "proximasEtapas": [],
    "referenciasBiblicas": "Eclesiastes 12:9-12; Lucas 1:1-4; 2 Timóteo 2:15",
    "geminiUrl": "https://docs.google.com/document/d/1op8PfbAYUEXkMsYk05A2Wn8LGrWsVrUNIedIB5OX7ks/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-8-2026-10-30",
    "disciplinaId": "disc-8",
    "aulaNum": 11,
    "unidade": 2,
    "dateIso": "2026-10-30",
    "dateBr": "30/10/2026",
    "theme": "Aula 11 • Chegada e Problema Técnico",
    "resumoGeral": "Recepção de família e debate técnico e levantamento acadêmico e planos de viagem Chegada e Problema Técnico: Família venezuelana chegou com documentação regularizada. Falta de acesso ao Microsoft Word persistiu por 1 mês. Levantamento Acadêmico e Avisos: Levantamento identificou períodos acadêmicos da turma. Avaliações de História da Cultura Afro-Brasileira e Indígena ocorrerão em 3 semanas. Reconhecimento e Encerramento: Capacidade de conteúdo foi elogiada. Viagens de carro foram discutidas antes das despedidas finais.",
    "topicos": [
      {
        "titulo": "Chegada e Problema Técnico",
        "texto": "Família venezuelana chegou com documentação regularizada. Falta de acesso ao Microsoft Word persistiu por 1 mês."
      },
      {
        "titulo": "Levantamento Acadêmico e Avisos",
        "texto": "Levantamento identificou períodos acadêmicos da turma. Avaliações de História da Cultura Afro-Brasileira e Indígena ocorrerão em 3 semanas."
      },
      {
        "titulo": "Reconhecimento e Encerramento",
        "texto": "Capacidade de conteúdo foi elogiada. Viagens de carro foram discutidas antes das despedidas finais."
      }
    ],
    "proximasEtapas": [
      "Compartilhar link de vídeo: Enviar o vídeo da professora Gabriela no grupo da turma.",
      "Enviar lista acadêmica: Encaminhar a lista de alunos para o Robert."
    ],
    "referenciasBiblicas": "Eclesiastes 12:9-12; Lucas 1:1-4; 2 Timóteo 2:15",
    "geminiUrl": "https://docs.google.com/document/d/1Hv7A1JHsNEQY2BhnFCZfbf_LUBu8Vpb0_NyB_T8mFSE/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-8-2026-11-06",
    "disciplinaId": "disc-8",
    "aulaNum": 12,
    "unidade": 2,
    "dateIso": "2026-11-06",
    "dateBr": "06/11/2026",
    "theme": "Aula 12 • Diretrizes e Recursos Acadêmicos",
    "resumoGeral": "Reunião de orientação de TCC cobriu diretrizes acadêmicas e progresso discente com foco na escrita. Diretrizes e Recursos Acadêmicos: Márcio Leal explicou as regras da disciplina de TCC 1 e recomendou recursos de apoio. A comunidade discente recebeu conselhos para manter os estudos durante o período de férias. Relatos de Progresso Discente: Diversos estudantes apresentaram o andamento de seus trabalhos de conclusão de curso. O corpo discente detalhou temas, escolha de orientadores e etapas atuais de pesquisa. Orientações e Encerramento: O professor orientou sobre a escrita textual e o afunilamento de temas de pesquisa.",
    "topicos": [
      {
        "titulo": "Diretrizes e Recursos Acadêmicos",
        "texto": "Márcio Leal explicou as regras da disciplina de TCC 1 e recomendou recursos de apoio. A comunidade discente recebeu conselhos para manter os estudos durante o período de férias."
      },
      {
        "titulo": "Relatos de Progresso Discente",
        "texto": "Diversos estudantes apresentaram o andamento de seus trabalhos de conclusão de curso. O corpo discente detalhou temas, escolha de orientadores e etapas atuais de pesquisa."
      },
      {
        "titulo": "Orientações e Encerramento",
        "texto": "O professor orientou sobre a escrita textual e o afunilamento de temas de pesquisa. A aula foi encerrada com avisos sobre a confraternização final do semestre."
      }
    ],
    "proximasEtapas": [
      "Comunicar orientador: Enviar mensagem pelo WhatsApp para Márcio Leal confirmando o vínculo de orientação acadêmica.",
      "Ajustar projeto: Implementar as modificações solicitadas no projeto acadêmico e enviar a versão atualizada para a professora.",
      "Avançar TCC férias: Realizar registros e avançar com a produção textual do trabalho acadêmico durante o período de férias.",
      "Iniciar escrita: Iniciar a redação do trabalho focando na seção de metodologia durante as férias."
    ],
    "referenciasBiblicas": "salmo 121; salmo 12",
    "geminiUrl": "https://docs.google.com/document/d/1z4tSB5VQ4DyD2KWvIV4pFR_8Cdh-B7Hy1IDCxqVxFa0/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-8-2026-11-13",
    "disciplinaId": "disc-8",
    "aulaNum": 13,
    "unidade": 2,
    "dateIso": "2026-11-13",
    "dateBr": "13/11/2026",
    "theme": "Aula 13 • Reflexão sobre humildade epistêmica",
    "resumoGeral": "Avaliação dos trabalhos de conclusão de curso com aprovação geral e reflexão sobre humildade epistêmica. Avaliação diagnóstica e aprovação Estudantes relataram o andamento de seus artigos e a busca por orientadores. A turma foi integralmente aprovada com foco na produção autônoma dos trabalhos.",
    "topicos": [
      {
        "titulo": "Reflexão sobre humildade epistêmica",
        "texto": "Apresentou-se a entrevista sobre a limitação do conhecimento humano e a autocorreção na ciência. Destacou-se que a arrogância trava a busca acadêmica."
      },
      {
        "titulo": "Considerações finais e cronograma",
        "texto": "Encerrou-se o semestre com incentivo às leituras e aviso das defesas marcadas para o dia 2 de dezembro. A formatura ocorrerá em 12 de dezembro."
      }
    ],
    "proximasEtapas": [
      "Atualizar Tema: Modificar o tema escolhido no grupo da turma.",
      "Definir Orientador: Selecionar um professor orientador que possua afinidade com a temática do trabalho.",
      "Definir Orientador: Definir um orientador para acompanhar o desenvolvimento do trabalho acadêmico.",
      "Definir Orientador: Buscar e selecionar um orientador acadêmico para o projeto de pesquisa."
    ],
    "referenciasBiblicas": "João 23",
    "geminiUrl": "https://docs.google.com/document/d/1XTq-zk-3TRNqujyrpQERGI_uAlj8RYJZ3YCrhBXBqE0/edit",
    "sourceType": "gdoc"
  },
  {
    "id": "cornell-gemini-disc-8-2026-11-20",
    "disciplinaId": "disc-8",
    "aulaNum": 14,
    "unidade": 2,
    "dateIso": "2026-11-20",
    "dateBr": "20/11/2026",
    "theme": "Aula 14 • Normas de Referências Bibliográficas (NBR 6023)",
    "resumoGeral": "Revisão de formatação pré-entrega: normas ABNT NBR 6023 para referências bibliográficas alfabéticas e o checklist de 20 a 25 laudas. Pontos de aprofundamento vinculados à unidade: Normas de Referências Bibliográficas (NBR 6023) (Alinhadas estritamente à margem esquerda, espaçamento simples interno, separadas por 1 espaço em branco, ordenadas em ordem alfabética pelo sobrenome do autor e com título da obra em negrito.) Extensão Rígida de 20 a 25 Páginas (O artigo não pode ter menos de 20 nem mais de 25 páginas completas (da capa às referências).)",
    "topicos": [
      {
        "titulo": "Normas de Referências Bibliográficas (NBR 6023)",
        "texto": "Alinhadas estritamente à margem esquerda, espaçamento simples interno, separadas por 1 espaço em branco, ordenadas em ordem alfabética pelo sobrenome do autor e com título da obra em negrito."
      },
      {
        "titulo": "Extensão Rígida de 20 a 25 Páginas",
        "texto": "O artigo não pode ter menos de 20 nem mais de 25 páginas completas (da capa às referências)."
      },
      {
        "titulo": "Regras de Citação ABNT (NBR 10520)",
        "texto": "Direta Curta (até 3 linhas): no parágrafo, entre aspas duplas, com autor, ano e página (SOBRENOME, 2026, p. 45). Direta Longa (+3 linhas): bloco destacado com recuo de 4 cm da margem esquerda, fonte 10, espaçamento simples e SEM aspas. Indireta (Paráfrase): exige autor e ano (SOBRENOME, 2026)."
      }
    ],
    "proximasEtapas": [],
    "referenciasBiblicas": "Eclesiastes 12:9-12; Lucas 1:1-4; 2 Timóteo 2:15",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-9-2026-08-14",
    "disciplinaId": "disc-9",
    "aulaNum": 1,
    "unidade": 2,
    "dateIso": "2026-08-14",
    "dateBr": "14/08/2026",
    "theme": "Aula 1 • Base Legal & Conceitos Fundamentais (Aula 1)",
    "resumoGeral": "Por que esta disciplina é necessária à Teologia? Fundamentação legal (Leis 10.639/03, 11.645/08 e Resolução CNE/CES 4/2016) e conceitos de raça, etnia, preconceito e racismo institucional/estrutural. Pontos de aprofundamento vinculados à unidade: Base Legal & Conceitos Fundamentais (Aula 1) (Leis 10.639/03 (História e Cultura Afro-Brasileira), 11.645/08 (inclusão da temática Indígena) e Resolução CNE/CES 4/2016 (diretrizes para cursos de Teologia).",
    "topicos": [
      {
        "titulo": "Base Legal & Conceitos Fundamentais (Aula 1)",
        "texto": "Leis 10.639/03 (História e Cultura Afro-Brasileira), 11.645/08 (inclusão da temática Indígena) e Resolução CNE/CES 4/2016 (diretrizes para cursos de Teologia). Distinção entre raça (construção sócio-histórica), etnia, preconceito, racismo institucional e racismo estrutural."
      },
      {
        "titulo": "Autores Estudados no Curso (Citar no Mínimo 2)",
        "texto": "Silvio Almeida (\"Racismo Estrutural\"); Gersem dos Santos Luciano Baniwa (\"O Índio Brasileiro\"); Esau McCaulley (\"Uma Leitura Negra\"); Marco Davi de Oliveira (\"A Religião Mais Negra do Brasil\"); Nilma Lino Gomes (\"Movimento Negro Educador\"); Ailton Krenak (\"Ideias para Adiar o Fim do Mundo\"); John Piper (\"O Racismo, a Cruz e o Cristão\")."
      },
      {
        "titulo": "Fundamentação Bíblica Sugerida pelo Docente",
        "texto": "Textos centrais indicados para sustentar a dignidade da Imago Dei, a unidade da humanidade e o repúdio à acepção de pessoas: Gn 1:26-28, At 17:26, Gl 3:28 e Tg 2:1-9."
      }
    ],
    "proximasEtapas": [
      "Revisar: Pasta compartilhada oficial no Google Drive com as 4 videoaulas gravadas e Plano de Curso. Autores estudados: Silvio Almeida, Gersem Baniwa, Esau McCaulley, Marco Davi de Oliveira, Nilma Lino Gomes, Ailton Krenak e John Piper."
    ],
    "referenciasBiblicas": "Gn 1:26-28; At 17:26; Gl 3:28; Tg 2:1-9",
    "videoUrl": "https://drive.google.com/file/d/1ypH0nSMA6E02c2enTzeLSacRhY8q9n05/view?usp=drive_link",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-9-2026-08-21",
    "disciplinaId": "disc-9",
    "aulaNum": 2,
    "unidade": 2,
    "dateIso": "2026-08-21",
    "dateBr": "21/08/2026",
    "theme": "Aula 2 • Áfricas, Diáspora, Quilombos & Hermenêutica Negra (Aula 2)",
    "resumoGeral": "Áfricas, Diáspora e Cultura Afro-Brasileira: história africana pré-colonial, escravização, resistência nos quilombos, movimento negro, saberes estético-corpóreos e hermenêutica bíblica negra. Pontos de aprofundamento vinculados à unidade: Áfricas, Diáspora, Quilombos & Hermenêutica Negra (Aula 2) (Valorização da história africana pré-colonial (reinos e tradições), trauma e diáspora da escravização, resistência histórica nos quilombos, atuação do movimento negro, saberes estético-corpóreos e chaves da hermenêutica bíblica negra.) Base Legal & Conceitos Fundamentais (Aula 1) (Leis 10.639/03 (História e Cultura Afro-Brasileira), 11.645/08 (inclusão da temática Indígena)...",
    "topicos": [
      {
        "titulo": "Áfricas, Diáspora, Quilombos & Hermenêutica Negra (Aula 2)",
        "texto": "Valorização da história africana pré-colonial (reinos e tradições), trauma e diáspora da escravização, resistência histórica nos quilombos, atuação do movimento negro, saberes estético-corpóreos e chaves da hermenêutica bíblica negra."
      },
      {
        "titulo": "Base Legal & Conceitos Fundamentais (Aula 1)",
        "texto": "Leis 10.639/03 (História e Cultura Afro-Brasileira), 11.645/08 (inclusão da temática Indígena) e Resolução CNE/CES 4/2016 (diretrizes para cursos de Teologia). Distinção entre raça (construção sócio-histórica), etnia, preconceito, racismo institucional e racismo estrutural."
      },
      {
        "titulo": "Autores Estudados no Curso (Citar no Mínimo 2)",
        "texto": "Silvio Almeida (\"Racismo Estrutural\"); Gersem dos Santos Luciano Baniwa (\"O Índio Brasileiro\"); Esau McCaulley (\"Uma Leitura Negra\"); Marco Davi de Oliveira (\"A Religião Mais Negra do Brasil\"); Nilma Lino Gomes (\"Movimento Negro Educador\"); Ailton Krenak (\"Ideias para Adiar o Fim do Mundo\"); John Piper (\"O Racismo, a Cruz e o Cristão\")."
      },
      {
        "titulo": "Análise Cristã Confessional — Os 3 Passos (Aula 4)",
        "texto": "Diante das espiritualidades indígenas e religiões de matriz africana, defender a liberdade de consciência e culto aplicando o método em 3 passos com fidelidade bíblica e respeito: (1) Descrever sem caricaturas; (2) Compreender no seu contexto; (3) Avaliar confessionalmente à luz das Escrituras."
      },
      {
        "titulo": "Povos Indígenas, CF/88 & Missão Transcultural (Aula 3)",
        "texto": "Pluralidade étnica e autodefinição dos povos originários conforme o Censo; garantia de direitos culturais e territoriais nos Arts. 215, 231 e 232 da Constituição Federal de 1988; superação de estereótipos paternalistas ou colonizadores na missão transcultural."
      }
    ],
    "proximasEtapas": [
      "Revisar: Pasta compartilhada oficial no Google Drive com as 4 videoaulas gravadas e Plano de Curso. Autores estudados: Silvio Almeida, Gersem Baniwa, Esau McCaulley, Marco Davi de Oliveira, Nilma Lino Gomes, Ailton Krenak e John Piper."
    ],
    "referenciasBiblicas": "Gênesis 1:26-28; Atos 17:26; Gálatas 3:28; Tiago 2:1-9",
    "videoUrl": "https://drive.google.com/file/d/1zMrGk_T-658PSVDXk14qb4VsFcqNtfzq/view?usp=drive_link",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-9-2026-08-28",
    "disciplinaId": "disc-9",
    "aulaNum": 3,
    "unidade": 2,
    "dateIso": "2026-08-28",
    "dateBr": "28/08/2026",
    "theme": "Aula 3 • Povos Indígenas, CF/88 & Missão Transcultural (Aula 3)",
    "resumoGeral": "Povos Indígenas: Histórias, Culturas, Missão e Direitos — pluralidade e autodefinição indígena, dados do Censo, direitos constitucionais nos Arts. 215, 231 e 232 da CF/88 e superação de estereótipos na missão transcultural. Pontos de aprofundamento vinculados à unidade: Povos Indígenas, CF/88 & Missão Transcultural (Aula 3) (Pluralidade étnica e autodefinição dos povos originários conforme o Censo; garantia de direitos culturais e territoriais nos Arts.",
    "topicos": [
      {
        "titulo": "Povos Indígenas, CF/88 & Missão Transcultural (Aula 3)",
        "texto": "Pluralidade étnica e autodefinição dos povos originários conforme o Censo; garantia de direitos culturais e territoriais nos Arts. 215, 231 e 232 da Constituição Federal de 1988; superação de estereótipos paternalistas ou colonizadores na missão transcultural."
      },
      {
        "titulo": "Estrutura Obrigatória do Trabalho Final (2 Laudas / 3 Partes)",
        "texto": "Produção individual textual de EXATAMENTE 2 laudas (duas páginas) dividida em 3 partes: (1) Descrição da situação-problema étnico-racial concreta e impacto na igreja/missão (ex.: imposição cultural em comunidade quilombola ou indígena sem ouvir lideranças locais); (2) Análise fundamentada (Bíblia + pelo menos 2 autores); (3) Proposta de ação concreta aplicável por pastores, igrejas locais ou missionários."
      },
      {
        "titulo": "Análise Cristã Confessional — Os 3 Passos (Aula 4)",
        "texto": "Diante das espiritualidades indígenas e religiões de matriz africana, defender a liberdade de consciência e culto aplicando o método em 3 passos com fidelidade bíblica e respeito: (1) Descrever sem caricaturas; (2) Compreender no seu contexto; (3) Avaliar confessionalmente à luz das Escrituras."
      },
      {
        "titulo": "Base Legal & Conceitos Fundamentais (Aula 1)",
        "texto": "Leis 10.639/03 (História e Cultura Afro-Brasileira), 11.645/08 (inclusão da temática Indígena) e Resolução CNE/CES 4/2016 (diretrizes para cursos de Teologia). Distinção entre raça (construção sócio-histórica), etnia, preconceito, racismo institucional e racismo estrutural."
      },
      {
        "titulo": "Autores Estudados no Curso (Citar no Mínimo 2)",
        "texto": "Silvio Almeida (\"Racismo Estrutural\"); Gersem dos Santos Luciano Baniwa (\"O Índio Brasileiro\"); Esau McCaulley (\"Uma Leitura Negra\"); Marco Davi de Oliveira (\"A Religião Mais Negra do Brasil\"); Nilma Lino Gomes (\"Movimento Negro Educador\"); Ailton Krenak (\"Ideias para Adiar o Fim do Mundo\"); John Piper (\"O Racismo, a Cruz e o Cristão\")."
      }
    ],
    "proximasEtapas": [
      "Revisar: Pasta compartilhada oficial no Google Drive com as 4 videoaulas gravadas e Plano de Curso. Autores estudados: Silvio Almeida, Gersem Baniwa, Esau McCaulley, Marco Davi de Oliveira, Nilma Lino Gomes, Ailton Krenak e John Piper."
    ],
    "referenciasBiblicas": "Gênesis 1:26-28; Atos 17:26; Gálatas 3:28; Tiago 2:1-9",
    "videoUrl": "https://drive.google.com/file/d/1cdcDrVmHoPmet3oA2Bib6hhz_ugzBxaK/view?usp=drive_link",
    "sourceType": "dossie"
  },
  {
    "id": "cornell-gemini-disc-9-2026-09-04",
    "disciplinaId": "disc-9",
    "aulaNum": 4,
    "unidade": 2,
    "dateIso": "2026-09-04",
    "dateBr": "04/09/2026",
    "theme": "Aula 4 • Análise Cristã Confessional — Os 3 Passos (Aula 4)",
    "resumoGeral": "Religiões, Análise Cristã Confessional e Prática da Igreja: espiritualidades indígenas e de matriz africana, liberdade de consciência e culto, os 3 passos (descrever, compreender e avaliar com fidelidade cristã) e explicação detalhada da avaliação final. Pontos de aprofundamento vinculados à unidade: Análise Cristã Confessional — Os 3 Passos (Aula 4) (Diante das espiritualidades indígenas e religiões de matriz africana, defender a liberdade de consciência e culto aplicando o método em 3 passos com fidelidade bíblica e respeito: (1) Descrever sem caricaturas; (2) Compreender no seu contexto; (3) Avaliar confessionalmente à luz das Escrituras.) Estrutura Obrigatória do...",
    "topicos": [
      {
        "titulo": "Análise Cristã Confessional — Os 3 Passos (Aula 4)",
        "texto": "Diante das espiritualidades indígenas e religiões de matriz africana, defender a liberdade de consciência e culto aplicando o método em 3 passos com fidelidade bíblica e respeito: (1) Descrever sem caricaturas; (2) Compreender no seu contexto; (3) Avaliar confessionalmente à luz das Escrituras."
      },
      {
        "titulo": "Estrutura Obrigatória do Trabalho Final (2 Laudas / 3 Partes)",
        "texto": "Produção individual textual de EXATAMENTE 2 laudas (duas páginas) dividida em 3 partes: (1) Descrição da situação-problema étnico-racial concreta e impacto na igreja/missão (ex.: imposição cultural em comunidade quilombola ou indígena sem ouvir lideranças locais); (2) Análise fundamentada (Bíblia + pelo menos 2 autores); (3) Proposta de ação concreta aplicável por pastores, igrejas locais ou missionários."
      },
      {
        "titulo": "Autores Estudados no Curso (Citar no Mínimo 2)",
        "texto": "Silvio Almeida (\"Racismo Estrutural\"); Gersem dos Santos Luciano Baniwa (\"O Índio Brasileiro\"); Esau McCaulley (\"Uma Leitura Negra\"); Marco Davi de Oliveira (\"A Religião Mais Negra do Brasil\"); Nilma Lino Gomes (\"Movimento Negro Educador\"); Ailton Krenak (\"Ideias para Adiar o Fim do Mundo\"); John Piper (\"O Racismo, a Cruz e o Cristão\")."
      },
      {
        "titulo": "Áfricas, Diáspora, Quilombos & Hermenêutica Negra (Aula 2)",
        "texto": "Valorização da história africana pré-colonial (reinos e tradições), trauma e diáspora da escravização, resistência histórica nos quilombos, atuação do movimento negro, saberes estético-corpóreos e chaves da hermenêutica bíblica negra."
      },
      {
        "titulo": "Povos Indígenas, CF/88 & Missão Transcultural (Aula 3)",
        "texto": "Pluralidade étnica e autodefinição dos povos originários conforme o Censo; garantia de direitos culturais e territoriais nos Arts. 215, 231 e 232 da Constituição Federal de 1988; superação de estereótipos paternalistas ou colonizadores na missão transcultural."
      }
    ],
    "proximasEtapas": [
      "Revisar: Pasta compartilhada oficial no Google Drive com as 4 videoaulas gravadas e Plano de Curso. Autores estudados: Silvio Almeida, Gersem Baniwa, Esau McCaulley, Marco Davi de Oliveira, Nilma Lino Gomes, Ailton Krenak e John Piper."
    ],
    "referenciasBiblicas": "Gênesis 1:26-28; Atos 17:26; Gálatas 3:28; Tiago 2:1-9",
    "videoUrl": "https://drive.google.com/file/d/1gSk3mjti0WC5PCDDpv0DRdtQ0x2hB_yw/view?usp=drive_link",
    "sourceType": "dossie"
  }
];

const META_BY_ID = new Map<string, CanonicalDisciplinaMeta>(
  CANONICAL_DISCIPLINAS.map((d) => [d.id, d])
);

function normalizeDateToIso(dateStr?: string): string {
  if (!dateStr) return '';
  const clean = dateStr.replace(/^~/, '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const br = clean.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  return clean;
}

export function getCanonicalDisciplinaMeta(disciplinaId: string): CanonicalDisciplinaMeta | undefined {
  return META_BY_ID.get(disciplinaId);
}

export function getGeminiAulasForDisciplina(disciplinaId: string): GeminiAulaCornellData[] {
  if (!disciplinaId) return [];
  return GEMINI_AULAS_CORNELL.filter((a) => a.disciplinaId === disciplinaId);
}

export function getGeminiAulaRecord(
  disciplinaId: string,
  aulaNum?: number,
  dateIsoOrBr?: string
): GeminiAulaCornellData | undefined {
  if (!disciplinaId) return undefined;
  const targetIso = normalizeDateToIso(dateIsoOrBr);
  if (targetIso) {
    const byDate = GEMINI_AULAS_CORNELL.find(
      (a) => a.disciplinaId === disciplinaId && a.dateIso === targetIso
    );
    if (byDate) return byDate;
  }
  if (aulaNum !== undefined) {
    return GEMINI_AULAS_CORNELL.find(
      (a) => a.disciplinaId === disciplinaId && a.aulaNum === aulaNum
    );
  }
  return undefined;
}

export function buildCornellNoteFromGeminiAula(aula: GeminiAulaCornellData): CornellNote {
  const meta = META_BY_ID.get(aula.disciplinaId);
  const cuesList: string[] = [];

  if (aula.topicos.length > 0) {
    aula.topicos.slice(0, 4).forEach((t, idx) => {
      const prefix = idx % 2 === 0 ? '❓' : '💡';
      cuesList.push(`${prefix} ${idx + 1}. ${t.titulo} — como sintetizar e aplicar este ponto?`);
    });
  } else {
    cuesList.push(`❓ 1. Qual a tese central desenvolvida na Aula ${aula.aulaNum} de ${meta?.shortName || 'Disciplina'}?`);
  }
  if (aula.referenciasBiblicas) {
    cuesList.push(`📖 Referências Bíblicas: ${aula.referenciasBiblicas}`);
  }
  cuesList.push('🎯 Aplicação Pastoral: como este ensino molda a prática ministerial e a defesa confessional?');

  const notesSections: string[] = [];
  if (aula.topicos.length > 0) {
    aula.topicos.forEach((t, idx) => {
      notesSections.push(`📌 ${idx + 1}. ${t.titulo.toUpperCase()}\n   ↳ ${t.texto}`);
    });
  } else {
    notesSections.push(`📌 1. SÍNTESE ESTRUTURADA DA AULA ${aula.aulaNum}\n   ↳ ${aula.resumoGeral}`);
  }

  if (aula.proximasEtapas.length > 0) {
    notesSections.push(
      `📌 PRÓXIMAS ETAPAS & LEITURAS ORIENTADAS\n${aula.proximasEtapas.map((p) => `   • ${p}`).join('\n')}`
    );
  }

  const aiTextLines: string[] = [
    `Resumo Gemini IA • Aula ${aula.aulaNum} (${aula.dateBr})`,
    `Disciplina: ${meta?.shortName || aula.disciplinaId} • ${meta?.prof || ''}`,
    '',
    '1. VISÃO GERAL:',
    aula.resumoGeral,
  ];
  if (aula.topicos.length > 0) {
    aiTextLines.push('', '2. TÓPICOS ESTRUTURADOS:');
    aula.topicos.forEach((t) => aiTextLines.push(`• ${t.titulo}: ${t.texto}`));
  }
  if (aula.proximasEtapas.length > 0) {
    aiTextLines.push('', '3. ENCAMINHAMENTOS DE ESTUDO:');
    aula.proximasEtapas.forEach((p) => aiTextLines.push(`- ${p}`));
  }

  return {
    id: aula.id,
    date: aula.dateIso,
    disciplina_name: meta?.name || aula.disciplinaId,
    disciplina_code: meta?.code || 'TEO-2026',
    professor_name: meta?.prof || 'Corpo Docente',
    theme: aula.theme,
    biblical_references: aula.referenciasBiblicas || meta?.defaultBib || '',
    cues: cuesList.join('\n\n'),
    notes: notesSections.join('\n\n'),
    summary: aula.resumoGeral,
    ai_summary_url: aula.geminiUrl || aula.videoUrl || '',
    ai_summary_text: aiTextLines.join('\n'),
    tags: [
      meta?.shortName || 'Disciplina',
      `Aula ${aula.aulaNum}`,
      'Gemini IA',
      'Auto-Cornell',
    ],
  };
}

let cachedAutoNotes: Record<string, CornellNote> | null = null;

export function getAllAutoGeneratedCornellNotes(): Record<string, CornellNote> {
  if (!cachedAutoNotes) {
    const map: Record<string, CornellNote> = {};
    for (const aula of GEMINI_AULAS_CORNELL) {
      map[aula.id] = buildCornellNoteFromGeminiAula(aula);
    }
    cachedAutoNotes = map;
  }
  return cachedAutoNotes;
}

export function buildCornellDeepLinkUrl(
  disciplinaId: string,
  dateIso?: string,
  aulaNum?: number
): string {
  const params = new URLSearchParams();
  params.set('tab', 'aluno-caderno');
  if (disciplinaId) params.set('disciplina', disciplinaId);
  if (dateIso) params.set('date', dateIso);
  if (aulaNum !== undefined) params.set('aula', String(aulaNum));
  return `/?${params.toString()}`;
}
