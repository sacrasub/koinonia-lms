# RELATÓRIO EXECUTIVO DE DESENVOLVIMENTO, ARQUITETURA E GUIA OPERACIONAL
## Plataforma Koinonia LMS (Seminário Teológico Koinonia — Semestre Letivo 2026.2)

---

### SUMÁRIO
1. **Identidade do Projeto, Propósito e Escopo Acadêmico**
2. **Arquitetura Tecnológica e Infraestrutura Dual-Layer**
3. **Diretriz Arquitetural Mandatória: Blindagem de Egress (Supabase Free Tier)**
4. **Controle de Acesso Baseado em Funções (RBAC - 4 Perfis)**
5. **Módulos Pedagógicos Inov-Ativos e Recursos Especiais**
6. **Histórico de Mudanças e Melhorias Recém-Implementadas (Changelog)**
7. **Guia de Uso Operacional por Perfil (Aluno, Professor, Monitor, Admin)**
8. **Guia Técnico de Desenvolvimento, Manutenção e Deploy**
9. **Mapeamento de Rotas, Banco de Dados e Variáveis de Ambiente**

---

## 1. IDENTIDADE DO PROJETO, PROPÓSITO E ESCOPO ACADÊMICO

### 1.1. Missão Pedagógica
O **Koinonia LMS** é o Sistema Integrado de Gestão da Aprendizagem desenvolvido especificamente para atender às demandas acadêmicas, teológicas e ministeriais do **Seminário Teológico Koinonia** (vinculado à União das Igrejas Evangélicas Congregacionais do Brasil — UIECB).

O sistema foi concebido para resolver os principais gargalos pedagógicos e operacionais do ecossistema legado (dispersão de links em planilhas, grupos de WhatsApp desordenados, pastas desorganizadas no Google Drive e formulários avulsos do Google Forms), integrando:
- **Transmissões ao vivo sincronizadas**: Google Meet com contagem regressiva e liberação automática de links de presença.
- **Acervo de gravação centralizado**: Aulas transmitidas disponibilizadas em HD com player integrado seguro.
- **Produtividade acadêmica**: Caderno Cornell com IA Gemini, NotebookLM, resumos e mapas conceituais.
- **Metodologias ativas**: Trilha socrática dos Quatro Ds (Desejo, Desestruturação, Desafio e Decisão), Estúdio de Prática Homilética, Simulador Pastoral RPG e Metaverso Bíblico 3D.
- **Biblioteca Teológica Digital**: Acervo com mais de 3.000 títulos clássicos e contemporâneos em PDF com citação ABNT instantânea.

### 1.2. Ambientes Oficiais e Repositório
- **URL Oficial de Produção**: `https://koinonialms.vercel.app`
- **URL Legada / Alias Retrocompatível**: `https://uiecblms.vercel.app`
- **Repositório GitHub**: `https://github.com/sacrasub/koinonia-lms` (Branch principal: `main`)
- **Semestre Corrente**: 2026.2 (Turma A, Turma B, Turma Básico e Módulos Especiais de TCC).

---

## 2. ARQUITETURA TECNOLÓGICA E INFRAESTRUTURA DUAL-LAYER

O Koinonia LMS adota arquitetura moderna baseada em Next.js App Router, hospedada na Vercel, com persistência na nuvem Supabase (PostgreSQL) e autenticação federada Google OAuth.

### 2.1. Stack Tecnológica
- **Framework Web**: Next.js 15 (App Router com React 19 e TypeScript estrito).
- **Estilização e Design System**: TailwindCSS + Shadcn UI + Lucide Icons + Animações suaves em CSS.
- **Autenticação**: Supabase Auth integrado com Google Identity Services (OAuth corporativo/acadêmico).
- **Banco de Dados Relacional**: Supabase PostgreSQL com Row Level Security (RLS) e índices otimizados.
- **Armazenamento e Streaming**: Google Cloud Service Account com integração à pasta restrita do Google Drive (ID: `1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO`).
- **Tour Interativo**: Driver.js para onboarding guiado e tutoriais passo a passo.

### 2.2. Arquitetura de Segurança Dual-Layer
1. **Camada 1 (Frontend & Middleware)**:
   - Todo tráfego protegido pelo `middleware.ts` do Next.js.
   - Sessões não autenticadas são redirecionadas para a página de login (`/login`).
   - A validação de e-mails autorizados (`authConfig.ts`) garante que apenas alunos, docentes e monitores da lista oficial consigam transitar pelos painéis.
2. **Camada 2 (Backend & Google Service Account)**:
   - As credenciais da conta de serviço (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`) operam exclusivamente no servidor (rotas `/api/cron/sync-drive` e uploads).
   - O frontend consulta apenas metadados indexados na tabela `Drive_Materials` do Supabase.
   - O acesso real ao arquivo físico redireciona para a URL do Google Drive, delegando a autorização de leitura ao Google Workspace da instituição.

---

## 3. DIRETRIZ ARQUITETURAL MANDATÓRIA: BLINDAGEM DE EGRESS

Como o projeto é mantido institucionalmente sem verba comercial adicional, a aplicação opera com **folga absoluta dentro do plano gratuito do Supabase (limite de 5 GB/mês, mantendo o consumo real entre 200 MB e 500 MB/mês)**.

### Mandamentos Anti-Egress (Zero-Waste Egress):
1. **Local-First & Delta-Sync**: Todo carregamento inicial é lido instantaneamente do `localStorage`. Sincronizações com o banco buscam unicamente dados criados após o último timestamp sincronizado (`timestamp > lastSync`), trafegando poucos bytes.
2. **Projeção Estrita de Colunas**: Proibido usar `SELECT *` em tabelas com tráfego frequente. Selecionam-se apenas as colunas vitais (`id`, `title`, `updated_at`).
3. **Heartbeat Pontual (0 Bytes de Download)**: O ciclo de telemetria de presença ativa ocorre a cada 150-180 segundos e executa apenas `UPDATE` pontual na linha da sessão do próprio usuário. O heartbeat é automaticamente pausado quando a aba do navegador perde o foco (`document.visibilityState !== 'visible'`).
4. **Batching de Eventos com Respostas Minimal**: Eventos são agrupados em memória e enviados em lote com intervalo mínimo de 25 segundos ou 8+ eventos, retornando cabeçalho minimal `204 No Content`.
5. **Eliminação de Polling Agressivo**: Intervalos curtos de consulta ao banco são expressamente vedados. Revalidações acontecem na ação do usuário ou no retorno de foco da janela (`window.focus`).
6. **Poda Preventiva de Cache**: Rotina `cleanupBulkyLocalStorage()` limpa logs e caches obsoletos no boot para prevenir erros de cota do navegador (`QuotaExceededError`).

---

## 4. CONTROLE DE ACESSO BASEADO EM FUNÇÕES (RBAC)

O sistema possui 4 perfis operacionais com menus, ações e permissões segregadas:

| Perfil | Acessos e Responsabilidades Principais |
| :--- | :--- |
| **🎓 Aluno** | Grade curricular semanal (16 aulas), Caderno Cornell com IA, gravações em HD, mural de avisos, materiais do Drive, simulador pastoral RPG, estúdio de pregação e acervo de 3.000 livros da biblioteca. |
| **👨‍🏫 Professor** | Gestão exclusiva das suas matérias atribuídas, upload nativo e links do Drive, criação de avaliações (nativas ou Forms), acompanhamento de notas de Cornell e materiais de apoio (NotebookLM). |
| **👑 Monitor** | Escala semanal de monitoria de todas as turmas, lançamento de links de gravação em HD, disparo de frequência (Google Forms) com 1 toque no chat da aula ao vivo. |
| **🛡️ Admin** | Gestão de 106 usuários autorizados, controle de telefones/WhatsApp, permissões RBAC, sincronização cloud, relatórios de tele-proximidade e telemetria de acesso. |

---

## 5. MÓDULOS PEDAGÓGICOS INOV-ATIVOS

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

## 6. HISTÓRICO DE MUDANÇAS RECENTES (CHANGELOG)

1. **Isolamento de Disciplinas no Painel Docente**:
   - O componente `SupportMaterialsHub` agora restringe a listagem de materiais, podcasts e resumos exclusivamente às disciplinas lecionadas pelo professor logado.
   - Configurado o valor padrão do seletor para `Minhas Matérias - Todas`, eliminando o erro de exibição de lista vazia.
   - Inseridos materiais semente para *Antigo Testamento II* e *Panorama do Antigo Testamento* (Profª Betânia Barbosa).

2. **Mural de Recursos Compactado por Padrão**:
   - Quando não há leituras pendentes (`pendingAnnouncementsCount === 0`), o mural do aluno surge recolhido com o card de status *"✨ Todas as leituras em dia"*, evitando ocupação de espaço na tela inicial.

3. **Correção do Bug de Bounce ("Abre e Volta") e Cota de Cache**:
   - Desativado o redirecionamento forçado do `GlobalWalkthrough.tsx` durante a navegação espontânea do usuário.
   - Adicionada rotina de limpeza preventiva no boot (`cleanupBulkyLocalStorage()`) e proteção com `try/catch` no `handleTabChange`.

4. **Silenciamento Permanente da Avaliação do TCC**:
   - Migrado o armazenamento de dispensa da pesquisa de `sessionStorage` para `localStorage` sob a chave `lms_tcc_dismissed_${normalizedEmail}`, com opção explícita de opt-out definitivo.

5. **Tour Guiado Onboarding em 14 Etapas**:
   - Reestruturado o passo a passo com Driver.js para cobrir 14 pontos focais fundamentais do sistema, com layouts otimizados para Desktop e Smartphones.

6. **Exibição dos Números de WhatsApp no Admin**:
   - Implementado merge bidirecional seguro em `getAuthorizedUsersList()`, preservando os telefones formatados dos 11 novos contatos adicionados à lista de usuários autorizados.

---

## 7. GUIA DE USO OPERACIONAL POR PERFIL

### 7.1. Para o Aluno
1. **Login**: Acesse `https://koinonialms.vercel.app` e clique em *"Entrar com Conta Google"*. Utilize o e-mail cadastrado junto à coordenação.
2. **Aulas Ao Vivo**: Na data da aula, o banner vermelho indicará a sala aberta no topo. Clique em *"Entrar no Google Meet"* e, no momento informado, clique em *"Assinar Presença"*.
3. **Estudos e Notas**: No menu lateral, acesse o *Caderno Cornell* para tomar notas durante ou após a aula, ou acesse a *Biblioteca Digital* para ler os PDFs recomendados.

### 7.2. Para o Professor
1. **Alternar Visão**: Utilize o seletor no cabeçalho para ativar a visão *"👨‍🏫 Professor"*.
2. **Gerenciar Disciplina**: No painel docente, selecione sua disciplina para cadastrar materiais de apoio (Google Docs ou arquivos), criar avaliações e postar avisos de leituras pré-aula.
3. **Materiais de Apoio**: Utilize o botão *"+ Cadastrar Material de Apoio"* para disponibilizar links do NotebookLM, mapas mentais e sínteses executivas.

### 7.3. Para o Monitor
1. **Registrar Gravação**: Acesse a visão *"👑 Monitor"*, selecione a matéria ministrada e informe a data da aula e o link da gravação no Google Drive / YouTube.
2. **Disparar Presença**: Durante a aula ao vivo, clique no botão *"Copiar Link de Presença"* e cole no chat da reunião do Google Meet.

### 7.4. Para o Administrador
1. **Gerenciar Acessos**: Acesse *"🛡️ Admin"* -> *"Usuários Autorizados"*. Consulte a lista de 106 contas, adicione telefones de WhatsApp, redefina perfis e sincronize com a nuvem.
2. **Acompanhar Frequência**: Verifique relatórios consolidados no *Radar de Tele-Proximidade*.

---

## 8. GUIA TÉCNICO DE DESENVOLVIMENTO, MANUTENÇÃO E DEPLOY

### 8.1. Pré-requisitos
- Node.js 18+ (recomendado 20.x ou superior)
- Git e conta no GitHub vinculada ao repositório `sacrasub/koinonia-lms`
- Vercel CLI ou integração contínua ativa na Vercel

### 8.2. Variáveis de Ambiente Necessárias (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
GOOGLE_SERVICE_ACCOUNT_EMAIL=koinonia-service@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_DRIVE_RESTRICTED_FOLDER_ID=1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO
```

### 8.3. Comandos Principais
```bash
# Instalação de dependências
npm install

# Executar servidor de desenvolvimento local
npm run dev

# Validar compilação e tipagem para produção
npm run build

# Executar linter de código
npm run lint
```

### 8.4. Fluxo de Deploy Contínuo (CI/CD)
O repositório está integrado à Vercel com deploy automático a cada push na branch `main`:
```bash
git add .
git commit -m "feat/fix: descricao da alteracao"
git push origin main
```
O build é disparado na Vercel e a atualização fica ativa em produção em menos de 2 minutos.

---

## 9. CONCLUSÃO E PRÓXIMOS PASSOS
O Koinonia LMS encontra-se em estado de produção estável, auditado contra vazamentos de tráfego de egress, com conformidade total às diretrizes acadêmicas do Seminário Teológico Koinonia e com os recursos metodológicos de ponta plenamente operacionais.
