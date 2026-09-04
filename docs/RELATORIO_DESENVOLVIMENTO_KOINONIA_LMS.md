# RELATÓRIO EXECUTIVO DE DESENVOLVIMENTO, ARQUITETURA E GUIA OPERACIONAL
## Plataforma Koinonia LMS (Seminário Teológico Congregacional — Semestre Letivo 2026.2)

---

### SUMÁRIO
1. **Identidade do Projeto, Propósito e Escopo Acadêmico**
2. **Arquitetura Tecnológica e Infraestrutura Dual-Layer**
3. **Diretriz Arquitetural Mandatória: Blindagem de Egress (Supabase Free Tier)**
4. **Controle de Acesso Baseado em Funções (RBAC e Perfis de Acesso)**
5. **Módulos Pedagógicos Inov-Ativos e Recursos Especiais**
6. **Módulo Nativo de Pesquisa de Campo & Diagnóstico de TCC (Cristiano do Sacramento Soares — UNIMB)**
7. **Piloto Automático do Gravador de Aulas & Central de Monitoria (Monitor Cristiano)**
8. **Identidade Visual Oficial, Social Sharing & Blindagem Mobile**
9. **Histórico de Mudanças e Melhorias Recém-Implementadas (Changelog Completo)**
10. **Guia de Uso Operacional por Perfil (Aluno, Professor, Monitor, Admin, Pesquisador)**
11. **Guia Técnico de Desenvolvimento, Manutenção e Deploy**
12. **Mapeamento de Rotas, Banco de Dados e Variáveis de Ambiente**
13. **Conclusão e Próximos Passos**

---

## 1. IDENTIDADE DO PROJETO, PROPÓSITO E ESCOPO ACADÊMICO

### 1.1. Missão Pedagógica
O **Koinonia LMS** é o Sistema Integrado de Gestão da Aprendizagem concebido como projeto pioneiro para atender às demandas acadêmicas, teológicas e ministeriais do **Seminário Teológico Congregacional** (vinculado à União das Igrejas Evangélicas Congregacionais do Brasil — UIECB), servindo simultaneamente como plataforma educacional aberta e objeto de intervenção empírica do Trabalho de Conclusão de Curso (TCC) em Teologia do discente e pesquisador **Cristiano do Sacramento Soares**, sob orientação do **Pastor Alexsandro Silva**, no **Centro Universitário do Maciço de Baturité (UNIMB - Baturité – CE)**.

O sistema foi concebido para superar os principais gargalos pedagógicos e operacionais do ecossistema legado (dispersão de links em planilhas, grupos de WhatsApp desordenados, pastas desorganizadas no Google Drive e formulários avulsos do Google Forms), integrando:
- **Transmissões ao vivo sincronizadas**: Google Meet com contagem regressiva e liberação automática de links de presença.
- **Acervo de gravação centralizado & Piloto Automático**: Aulas transmitidas disponibilizadas em HD com player integrado e gravação automatizada com Auto-Stop inteligente.
- **Produtividade acadêmica**: Caderno Cornell com IA Gemini, NotebookLM, resumos e mapas conceituais.
- **Metodologias ativas**: Trilha socrática dos Quatro Ds (Desejo, Desestruturação, Desafio e Decisão), Estúdio de Prática Homilética, Simulador Pastoral RPG e Metaverso Bíblico 3D.
- **Biblioteca Teológica Digital**: Acervo com mais de 3.000 títulos clássicos e contemporâneos em PDF com citação ABNT instantânea.
- **Módulo Nativo de Pesquisa de Campo & Diagnóstico do TCC**: Instrumento empírico com Termo de Consentimento Livre e Esclarecido (TCLE), questionários multi-ator e dashboards analíticos com exportação CSV para SPSS/Excel.

### 1.2. Ambientes Oficiais e Repositório
- **URL Oficial de Produção**: `https://koinonialms.vercel.app`
- **URL Legada / Alias Retrocompatível**: `https://uiecblms.vercel.app`
- **Repositório GitHub**: `https://github.com/sacrasub/koinonia-lms` (Branch principal: `main`)
- **Semestre Corrente**: 2026.2 (Turma A, Turma B, Turma Básico e Módulos Especiais de Graduação/TCC).

---

## 2. ARQUITETURA TECNOLÓGICA E INFRAESTRUTURA DUAL-LAYER

O Koinonia LMS adota arquitetura moderna baseada em Next.js App Router, hospedada na Vercel, com persistência na nuvem Supabase (PostgreSQL) e autenticação federada Google OAuth.

### 2.1. Stack Tecnológica
- **Framework Web**: Next.js 15 (App Router com React 19 e TypeScript estrito).
- **Estilização e Design System**: TailwindCSS + Shadcn UI + Lucide Icons + Animações suaves em CSS.
- **Autenticação**: Supabase Auth integrado com Google Identity Services (OAuth corporativo/acadêmico).
- **Banco de Dados Relacional**: Supabase PostgreSQL com Row Level Security (RLS) e índices otimizados.
- **Armazenamento e Streaming**: Google Cloud Service Account com integração à pasta restrita do Google Drive (ID: `1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO`).
- **Onboarding e Guias**: Driver.js para onboarding guiado e tutoriais específicos por perfil (*role-based tours*).
- **Geração Documental**: Puppeteer headless integrado para exportação de relatórios executivos em PDF com paginação e design editorial A4.

### 2.2. Arquitetura de Segurança Dual-Layer
1. **Camada 1 (Frontend & Middleware)**:
   - Todo tráfego protegido pelo `middleware.ts` do Next.js.
   - Sessões não autenticadas são redirecionadas para a página de login (`/login`).
   - A validação de e-mails autorizados (`authConfig.ts`) garante que apenas alunos, docentes e monitores da lista oficial consigam transitar pelos painéis internos.
2. **Camada 2 (Backend & Google Service Account)**:
   - As credenciais da conta de serviço (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`) operam exclusivamente no servidor (rotas `/api/cron/sync-drive` e uploads).
   - O frontend consulta apenas metadados indexados na tabela `Drive_Materials` do Supabase.
   - O acesso real ao arquivo físico redireciona para a URL do Google Drive, delegando a autorização de leitura ao Google Workspace da instituição.

---

## 3. DIRETRIZ ARQUITETURAL MANDATÓRIA: BLINDAGEM DE EGRESS

Como o projeto é mantido institucionalmente sem verba comercial adicional, a aplicação opera com **folga absoluta dentro do plano gratuito do Supabase (limite de 5 GB/mês, mantendo o consumo real entre 200 MB e 500 MB/mês)**.

### Mandamentos Anti-Egress (Zero-Waste Egress Architecture):
1. **Local-First & Delta-Sync**: Todo carregamento inicial é lido instantaneamente do `localStorage`. Sincronizações com o banco buscam unicamente dados criados após o último timestamp sincronizado (`timestamp > lastSync`), trafegando poucos bytes.
2. **Projeção Estrita de Colunas**: Proibido usar `SELECT *` em tabelas com tráfego frequente. Selecionam-se apenas as colunas vitais (`id`, `title`, `updated_at`).
3. **Heartbeat Pontual (0 Bytes de Download)**: O ciclo de telemetria de presença ativa ocorre a cada 150-180 segundos e executa apenas `UPDATE` pontual na linha da sessão do próprio usuário. O heartbeat é automaticamente pausado quando a aba do navegador perde o foco (`document.visibilityState !== 'visible'`).
4. **Batching de Eventos com Respostas Minimal**: Eventos são agrupados em memória e enviados em lote com intervalo mínimo de 25 segundos ou 8+ eventos, retornando cabeçalho minimal `204 No Content`.
5. **Eliminação de Polling Agressivo**: Intervalos curtos de consulta ao banco são expressamente vedados. Revalidações acontecem na ação do usuário ou no retorno de foco da janela (`window.focus`).
6. **Poda Preventiva de Cache & Sanitização Pré-Hidratação**: Rotina `cleanupBulkyLocalStorage()` limpa logs e caches obsoletos no boot e um script inline no `<head>` purga itens maiores que 50 KB antes da hidratação do React, prevenindo bloqueios por `QuotaExceededError` em navegadores mobile.

---

## 4. CONTROLE DE ACESSO BASEADO EM FUNÇÕES (RBAC)

O sistema possui controle granular de perfis com menus, ações e permissões segregadas:

| Perfil | Acessos e Responsabilidades Principais |
| :--- | :--- |
| **🎓 Aluno** | Grade curricular semanal (16 aulas), Caderno Cornell com IA, gravações em HD, mural de avisos e leituras, materiais do Drive, simulador pastoral RPG, estúdio de pregação, acervo de 3.000 livros e participação na pesquisa empírica. |
| **👨‍🏫 Professor** | Gestão exclusiva das suas matérias atribuídas, upload nativo e links do Drive, criação de avaliações (nativas ou Forms), acompanhamento de notas de Cornell, materiais de apoio (NotebookLM) e questionário docente de TCC. |
| **👑 Monitor** | Escala semanal de monitoria de todas as turmas, Piloto Automático de gravação em HD com contagem regressiva e Auto-Stop, disparo de frequência (Google Forms) com 1 toque no chat da aula ao vivo. |
| **🛡️ Admin** | Gestão de mais de 106 usuários autorizados, controle de telefones/WhatsApp, permissões RBAC, sincronização cloud, relatórios de tele-proximidade e telemetria de acesso. |
| **🔬 Pesquisador (TCC)** | Painel do Pesquisador Sacramento, métricas em tempo real por segmento (discente, docente, monitor, pastor, membro), respostas detalhadas de docentes, criação de novas enquetes dinâmicas e exportação CSV para SPSS/Excel. |

---

## 5. MÓDULOS PEDAGÓGICOS INOV-ATIVOS E RECURSOS ESPECIAIS

### 5.1. Fluxo de Estudos & Ecossistema Teológico (6 Fases)
Estruturação semanal que conecta todas as ferramentas do aluno:
- **Fase 1: Preparação e Pré-Aula**: Acesso às leituras recomendadas no Mural e consulta à Google Agenda.
- **Fase 2: Aula Síncrona (Google Meet)**: Transmissão ao vivo com contagem regressiva e assinatura da lista de presença.
- **Fase 3: Caderno Cornell & IA**: Anotações estruturadas, perguntas socráticas e síntese executiva gerada via Gemini.
- **Fase 4: Aprofundamento (NotebookLM & Personas Gemini)**: Áudios em formato podcast e mentoria com 9 personas especializadas (Agostinho, Calvino, Edwards, Spurgeon, etc.).
- **Fase 5: Aplicação Prática (Homilética & RPG)**: Gravação de sermões expositivos e simulações ministeriais gamificadas.
- **Fase 6: Avaliação & Portfólio**: Entrega de atividades, simulados e consolidação de competências.

### 5.2. Trilha dos Quatro Ds (Método de Ensinagem de Jesus)
Metodologia andragógica dividida em quatro etapas reflexivas:
1. **Desejo**: Despertar da sede pelo conhecimento espiritual.
2. **Desestruturação**: Ruptura de pressupostos dogmáticos limitantes.
3. **Desafio**: Chamado ao estudo exegético e histórico rigoroso.
4. **Decisão**: Resolução vocacional e ministerial com impacto na igreja local.

### 5.3. Estúdio de Prática Homilética & Instrução por Pares
- Cronômetro litúrgico para ensaio de sermões (15, 25 ou 40 minutos).
- Registro de gravações em vídeo/áudio.
- Matriz de avaliação entre colegas com rubrica homilética (exegese, oratória, fidelidade textual e aplicação pastoral).

### 5.4. Metaverso Teológico 3D (Arqueologia Bíblica)
Ambiente imersivo com modelos tridimensionais do Tabernáculo no Deserto, Templo de Salomão e Jerusalém do Século I, contendo hotspots explicativos com exegese e dados históricos arqueológicos.

### 5.5. Biblioteca Digital Teológica (3.000+ Títulos)
- Acervo pesquisável por autor, título, assunto e disciplina recomendada.
- Leitor de PDF embutido de alta resolução compatível com desktop e smartphones.
- Gerador automático de citação no padrão ABNT com um clique.

---

## 6. MÓDULO NATIVO DE PESQUISA DE CAMPO & DIAGNÓSTICO DO TCC
*(Cristiano do Sacramento Soares — UNIMB / Orientador: Pr. Alexsandro Silva)*

### 6.1. Identidade e Rigor Metodológico
O módulo de pesquisa foi desenvolvido como instrumento empírico nativo de coleta de dados para o Trabalho de Conclusão de Curso intitulado **"Superação da Distância Transacional no Ensino Teológico Online através do Koinonia LMS"**, submetido ao Centro Universitário do Maciço de Baturité (UNIMB).

O instrumento cumpre todas as exigências éticas da pesquisa com seres humanos (Resoluções CNS 466/2012 e 510/2016):
- **Termo de Consentimento Livre e Esclarecido (TCLE)**: Apresentação transparente dos objetivos, garantia de confidencialidade, liberdade de recusa a qualquer momento e contatos institucionais do pesquisador e da UNIMB.
- **Autenticação Obrigatória para Comunidade Interna**: Seminaristas, professores e monitores da UNIMB autenticam-se com a Conta Google institucional para validação acadêmica e liberação de acesso imediato à plataforma Koinonia LMS.
- **Acesso Público & Anônimo para Comunidade Externa**: Pastores ordenados, líderes, membros de igrejas e estudantes de outros seminários contam com acesso anônimo sem barreiras via link compartilhado.

### 6.2. Triangulação Metodológica Multi-Ator (5 Segmentos)
O questionário adapta suas questões de acordo com o papel do respondente no ecossistema eclesial e educacional:
1. **Discentes**: Medição de distância transacional (afetiva e cognitiva), engajamento com Caderno Cornell e IA, facilidade no acesso às aulas ao vivo e gravações.
2. **Docentes**: Distância pedagógica, mediação de conteúdos, isolamento por disciplina e utilização de materiais do NotebookLM.
3. **Monitores**: Mediação técnica, pontualidade de gravação, fluxo no chat e facilidade de operação.
4. **Pastores e Líderes**: Avaliação da solidez doutrinária, maturidade espiritual e aptidão ministerial dos alunos formados online em comparação ao modelo presencial.
5. **Membros da Igreja**: Percepção do impacto prático das pregações, estudos bíblicos e maturidade pastoral na igreja local.

### 6.3. Gerenciador Multi-Perfil com Edição e Persistência Blindada
- **Múltiplos Papéis**: Um respondente pode enviar contribuições sob mais de um perfil (ex: seminarista e pastor), sem conflito de dados.
- **Alteração de Respostas**: O respondente pode retornar e editar ou atualizar respostas submetidas anteriormente.
- **Persistência Blindada de Egress**: Rota `/api/tcc/pesquisa-campo` com salvamento automático de rascunhos em `localStorage` e persistência no Supabase com respostas HTTP minimalistas (201 Created).

### 6.4. Painel do Pesquisador (`TccSacramentoPage.tsx`)
- Indicadores quantitativos e qualitativos consolidados em tempo real.
- Visualização detalhada de respostas de professores (com destaque para contribuições docentes como a do Prof. Cleiton).
- Módulo de criação dinâmica de novas enquetes rápidas para investigações complementares.
- Exportação em um clique de planilha formatada em CSV compatível com Microsoft Excel, IBM SPSS e scripts em R.

---

## 7. PILOTO AUTOMÁTICO DO GRAVADOR DE AULAS & CENTRAL DE MONITORIA
*(Monitor Cristiano & Equipe de Monitoria)*

### 7.1. Gravador com Piloto Automático & Auto-Stop
Para assegurar que nenhuma transmissão síncrona deixe de ser gravada e disponibilizada aos alunos com pontualidade estrita:
- **Agendamento Programado**: O monitor seleciona a aula na escala semanal e ativa o modo *Piloto Automático*.
- **Contagem Regressiva Visual**: O modal (`AulaRecorderModal.tsx`) exibe a contagem regressiva para o início da aula com alertas sonoros opcionais.
- **Auto-Stop Inteligente**: O gravador encerra a sessão automaticamente ao término previsto da aula, impedindo gravações vazias ou arquivos corrompidos.
- **Fallback de Perfil Resiliente**: Tratamento robusto para evitar falhas com URLs de avatar e permissões simultâneas de monitor/admin/docente.

### 7.2. Disparo Instantâneo de Presença
- Um clique para copiar o link oficial do Google Forms e colar no chat do Google Meet.
- Registro visual de aulas canceladas ou transferidas com histórico transparente compartilhado com toda a comunidade acadêmica.

---

## 8. IDENTIDADE VISUAL OFICIAL, SOCIAL SHARING & BLINDAGEM MOBILE

### 8.1. Logotipo e Identidade Institucional
- Criação e integração do logotipo oficial Koinonia LMS em alta definição com paleta teológica solene (azul royal, dourado e grafite).
- Conjunto completo de favicons e web app icons (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome`).

### 8.2. OpenGraph & Compartilhamento Rico no WhatsApp
- Metatags completas de OpenGraph e Twitter Cards configuradas no `layout.tsx`, gerando pré-visualizações ricas e atraentes com título, descrição e arte oficial ao compartilhar links do Koinonia LMS no WhatsApp, Telegram e redes sociais.
- **Modal de Convite Inteligente**: Ferramenta de compartilhamento via WhatsApp com codificação 100% BMP segura (`api.whatsapp.com`), eliminando caracteres truncados, interrogações ou problemas com emojis em sistemas operacionais móveis.

### 8.3. Blindagem Mobile e Anti-Quota Error
- Script de auto-sanitização pré-hidratação inline executado antes da inicialização do React, varrendo o `localStorage` e eliminando payloads obsoletos superiores a 50 KB.
- Garantia de navegação suave em smartphones iOS e Android mesmo em conexões instáveis.

---

## 9. HISTÓRICO COMPLETO DE MUDANÇAS RECENTES (CHANGELOG)

Abaixo está o registro cronológico completo das implementações e correções até a versão mais recente em produção:

| Commit | Tipo | Módulo | Descrição Resumida |
| :--- | :--- | :--- | :--- |
| `c807892` | **Fix** | Aluno / Mural | Eliminação de duplicação do mural de leituras e links recomendados no painel do discente. |
| `abbac3d` | **Fix/Feat** | TCC / Monitor | Exibição de respostas docentes do Prof. Cleiton; alteração e edição de respostas; criação de novas enquetes dinâmicas; ajuste do gravador para Monitor Cristiano. |
| `6dcfeeb` | **Fix** | Recorder | Correção no disparo de gravação pré-configurada, permissões de monitor e sincronização de papéis de usuário. |
| `9ef0e42` | **Fix/Feat** | Monitor | Resolução de crash de `avatarUrl` e implementação do Piloto Automático de gravação com contagem regressiva e Auto-Stop. |
| `84c8d2d` | **Feat** | TCC / UX | Garantia de persistência cloud em Supabase; atalhos no dashboard de resultados e ativação de tours guiados baseados no perfil do usuário (*role-based tours*). |
| `a530078` | **Fix** | WhatsApp | Padronização 100% BMP em convites de WhatsApp eliminando caracteres truncados e migração definitiva para `api.whatsapp.com`. |
| `35b757a` | **Fix** | WhatsApp | Substituição de emojis conflitantes por caracteres universais compatíveis com WhatsApp e padronização de nomes institucionais. |
| `3eb65dc` | **Feat** | Identidade | Logo oficial Koinonia LMS, conjunto de favicons, preview rico de OpenGraph para WhatsApp e modal de convite institucional. |
| `e7062ae` | **Feat** | TCC | Atualização do nome Seminário Teológico Congregacional, instrumentos empíricos com perguntas personalizadas por ator e edição multiperfil. |
| `961e046` | **Fix** | TCC / Core | Correção de erro `useRef is not defined`; atualização de dados do TCLE da UNIMB e Koinonia LMS. |
| `fbc7faf` | **Feat** | TCC | Atualização de dados da UNIMB, vinculação ao autor Cristiano do Sacramento Soares, autenticação institucional interna e explicabilidade pedagógica (glossário). |
| `f75b9d8` | **Feat** | TCC | Implementação do módulo nativo de pesquisa de campo e diagnóstico com TCLE, rascunhos em tempo real e blindagem de egress. |
| `157ac6d` | **Fix** | Docente | Visão padrão de matérias do professor (`Minhas Matérias - Todas`) e carga de sementes para a Profª Betânia Barbosa. |
| `2bdef17` | **Feat** | UX / Admin | Isolamento docente de materiais; mural recolhido por padrão quando sem pendências; tour guiado de 14 etapas; correção de WhatsApp no Admin. |

---

## 10. GUIA DE USO OPERACIONAL POR PERFIL

### 10.1. Guia do Aluno
1. **Acesso**: Entre em `https://koinonialms.vercel.app` e clique em *"Entrar com Conta Google"* com seu e-mail cadastrado.
2. **Aula Síncrona**: No card vermelho no topo da tela, acompanhe a contagem regressiva. Clique em *"Entrar no Google Meet"* e, quando anunciado, em *"Assinar Presença"*.
3. **Caderno Cornell**: Utilize as abas de notas para sintetizar a matéria e gere sínteses executivas instantâneas com o Gemini Pro.
4. **Biblioteca Digital**: Consulte mais de 3.000 livros em PDF e gere citações formatadas em ABNT com 1 clique.
5. **Pesquisa do TCC**: Acesse o banner do TCC e registre sua avaliação sincera para contribuir com a pesquisa institucional.

### 10.2. Guia do Professor
1. **Alternar Painel**: Mude o seletor no topo para *"👨‍🏫 Professor"*.
2. **Materiais**: Seus materiais surgem filtrados automaticamente por sua disciplina. Use *"+ Cadastrar Material de Apoio"* para adicionar Google Docs, resumos ou podcasts do NotebookLM.
3. **Avaliações**: Crie questionários nativos ou incorpore formulários do Google Forms ativando a visualização integrada em iframe.

### 10.3. Guia do Monitor
1. **Escala e Gravador**: Acesse a aba *"👑 Monitor"* e clique em *Gravar Aula* no card da disciplina do dia.
2. **Piloto Automático**: Configure o horário de término e ative o *Piloto Automático* para início com contagem e Auto-Stop pontual.
3. **Presença**: Copie o link do formulário de presença e compartilhe no chat do Google Meet.

### 10.4. Guia do Administrador
1. **Gestão de Usuários**: Acesse *"🛡️ Admin"* -> *"Usuários Autorizados"*. Ajuste papéis (Aluno, Professor, Monitor), inclua telefones com DDD e force o sync cloud.
2. **Tele-Proximidade**: Monitore a frequência e engajamento dos alunos para intervenções pastorais de acolhimento.

### 10.5. Guia do Pesquisador (TCC Sacramento)
1. **Painel de Resultados**: Acesse o menu de pesquisa para acompanhar os índices de resposta por segmento.
2. **Respostas Docentes**: Visualize detalhadamente as respostas e observações dos professores.
3. **Enquetes Dinâmicas**: Crie novas perguntas em tempo real para elucidar dados qualitativos.
4. **Exportação**: Clique em *"Exportar CSV"* para gerar arquivos compatíveis com o SPSS ou Microsoft Excel.

---

## 11. GUIA TÉCNICO DE DESENVOLVIMENTO, MANUTENÇÃO E DEPLOY

### 11.1. Configuração do Ambiente Local
```bash
# 1. Clonar o repositório
git clone https://github.com/sacrasub/koinonia-lms.git
cd koinonia-lms

# 2. Instalar dependências
npm install

# 3. Executar o servidor de desenvolvimento
npm run dev

# 4. Validar compilação e tipagem para produção
npm run build

# 5. Gerar o Relatório Executivo Oficial em PDF
node scripts/generate_report_pdf.js
```

### 11.2. Variáveis de Ambiente Necessárias (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
GOOGLE_SERVICE_ACCOUNT_EMAIL=koinonia@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_DRIVE_RESTRICTED_FOLDER_ID=1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO
```

### 11.3. Esteira de Deploy Contínuo (Vercel CI/CD)
Toda alteração enviada para a branch `main` dispara automaticamente a compilação e publicação no domínio de produção:
```bash
git add .
git commit -m "feat/fix: descricao da melhoria"
git push origin main
```

---

## 12. MAPEAMENTO DE ROTAS, BANCO DE DADOS E ARQUIVOS PRINCIPAIS

- **Rotas de Página**:
  - `/`: Painel principal com alternância inteligente de perfis (Aluno, Professor, Monitor, Admin).
  - `/pesquisa-tcc`: Módulo de pesquisa de campo empírica do TCC com TCLE integrado.
  - `/login`: Portal de autenticação corporativa Google OAuth.
- **Rotas de API (Backend)**:
  - `/api/tcc/pesquisa-campo`: Ingestão blindada de respostas e enquetes do TCC.
  - `/api/cron/sync-drive`: Cron job de mapeamento de arquivos da pasta restrita do Google Drive.
- **Tabelas do Banco de Dados**:
  - `users`: Usuários autorizados, perfis e telefones.
  - `disciplinas` & `aulas`: Grade curricular e cronograma 2026.2.
  - `tcc_pesquisas_campo`: Respostas empíricas dos 5 perfis de respondentes.
  - `Drive_Materials`: Metadados indexados de arquivos e pastas do Google Drive.
  - `lms_user_sessions` & `lms_analytics_events`: Telemetria de acesso com resposta minimal.

---

## 13. CONCLUSÃO E PRÓXIMOS PASSOS

A plataforma **Koinonia LMS** atinge índice pleno de maturidade arquitetural e pedagógica. A integração entre a formação teológica do **Seminário Teológico Congregacional**, o rigor acadêmico da pesquisa de TCC na **UNIMB** e os módulos tecnológicos de última geração (Piloto Automático, Caderno Cornell com IA, OpenGraph rico e Blindagem de Egress) consolidam um marco de referência no ensino teológico digital no Brasil.
