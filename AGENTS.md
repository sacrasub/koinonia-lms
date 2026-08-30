# Regras de Negócio e Diretrizes do Projeto LMS-UIECB

Este documento contém a especificação arquitetural, regras de negócio e diretrizes operacionais para a criação do Learning Management System (LMS) do Seminário Teológico.

---

## 1. Visão Geral do Sistema
O **LMS-UIECB** é uma plataforma modernizada para gestão acadêmica de seminário teológico, focada em alto desempenho, segurança e transição suave do ecossistema de ferramentas legado (Google Workspace/Cerebrum).

---

## 2. Perfis de Usuário e Controle de Acesso (RBAC)
O sistema suporta 4 perfis distintos com permissões e visões dedicadas:

| Perfil | Responsabilidades e Recursos |
| :--- | :--- |
| **Admin** | Gestão global do sistema, usuários, disciplinas, turmas e permissões. |
| **Professor** | Gestão de disciplinas atribuídas, upload de materiais (nativo/Google Drive), criação e gestão de avaliações (nativas ou Google Forms). |
| **Monitor** | Suporte às aulas ao vivo, registro de links de gravação das aulas e disparo de links de lista de presença (Google Forms) no chat. |
| **Aluno** | Visualização de disciplinas matriculadas, acesso a pastas de materiais de estudo e atalho direto para a sala do Google Meet no horário agendado. |

---

## 3. Painéis e Funcionalidades do Frontend

### 3.1. Painel do Aluno
- **Listagem de Disciplinas**: Exibição das disciplinas matriculadas no semestre corrente.
- **Materiais de Estudo**: Acesso aos materiais sincronizados via Supabase (`Drive_Materials`), redirecionando para a URL nativa do Google Drive (validação de acesso efetuada pelo próprio Google).
- **Salas de Aula Ao Vivo**: Atalho direto em destaque para a reunião do **Google Meet** no horário agendado da disciplina.

### 3.2. Painel do Professor
- **Upload e Gestão de Materiais**: Suporte a upload nativo de arquivos e fallback para inserção de links externos do Google Drive.
- **Criação de Avaliações**: Cadastro de avaliações. Caso a flag `is_legacy` esteja ativa (`true`), o sistema deverá renderizar um `iframe` incorporando o link do **Google Forms**.

### 3.3. Painel do Monitor
- **Gravações de Aulas**: Interface para inclusão e gestão dos links de gravação das aulas ministradas.
- **Controle de Presença**: Botão/ação para disparar e copiar links de formulários de presença (Google Forms) para envio no chat da aula.

---

## 4. FASE 4: Arquitetura de Segurança Dual-Layer & Google Drive Restrito

### 4.1. Autenticação e Proteção de Rotas (Layer 1)
- **Supabase Auth + Google OAuth**: O login na aplicação é obrigatoriamente realizado via conta Google corporativa/acadêmica.
- **Middleware Next.js (`src/middleware.ts`)**: Bloqueia acessos não autenticados e protege todas as rotas sob `/dashboard` e painéis por perfil (`aluno`, `professor`, `monitor`, `admin`).

### 4.2. Sincronização Backend via Service Account (Layer 2)
- **Pasta Restrita do Google Drive**:
  - ID da Pasta: `1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO`
  - Acesso: Restrito (compartilhado com o e-mail da Service Account e e-mails autorizados dos alunos/professores).
- **Google Cloud Service Account**:
  - Credenciais em variáveis de ambiente protegidas (`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_DRIVE_RESTRICTED_FOLDER_ID`). Nenhuma chave é exposta no frontend.
  - Um Cron Job no backend (`src/app/api/cron/sync-drive/route.ts`) autentica com a Service Account, lê a estrutura de arquivos e executa o `upsert` na tabela `Drive_Materials` do Supabase.

### 4.3. SSOT & Performance de Cuidado ao Aluno (TTFB < 50ms)
- O frontend consulta exclusivamente os metadados indexados na tabela `Drive_Materials` do Supabase.
- Ao clicar no arquivo, o aluno é redirecionado para o `web_view_link` nativo do Google Drive. O próprio Google Drive valida em tempo real se a conta Google logada possui permissão de leitura.

---

## 5. Arquitetura e Stack Tecnológica
- **Frontend**: Next.js (App Router) + TailwindCSS + Shadcn UI.
- **Autenticação e Sessão**: Supabase Auth (Google OAuth) + Middleware do Next.js.
- **Banco de Dados**: PostgreSQL via Supabase (`users`, `disciplinas`, `aulas`, `avaliacoes`, `materiais`, `Drive_Materials`, `lms_user_sessions`, `lms_analytics_events`).

---

## 6. DIRETRIZ ARQUITETURAL OBRIGATÓRIA: BLINDAGEM DE EGRESS (SUPABASE FREE PLAN)

> [!CRITICAL]
> **REGRA SUPREMA PARA QUALQUER IA / ASSISTENTE DE DESENVOLVIMENTO (ANTIGRAVITY / CLAUDE / GEMINI / GPT):**
> O projeto **NÃO POSSUI PATROCÍNIO NEM RETORNO FINANCEIRO NO MOMENTO**. Ele **DEVE OPERAR COM FOLGA ABSOLUTA DENTRO DO PLANO GRATUITO DO SUPABASE** (limite de 5 GB de Egress/mês, mantendo o consumo real **< 200 MB a 500 MB/mês**).
> **É TERMINANTEMENTE PROIBIDO INTRODUZIR QUALQUER CÓDIGO QUE CAUSE EXPLOSÃO DE EGRESS OU POLLINGS AGRESSIVOS.**

### 6.1. Mandamentos Anti-Egress (Zero-Waste Egress Architecture)
1. **Local-First & Delta-Sync Obrigatório**:
   - Todo carregamento de histórico, telemetria, sessões, anotações ou dados de aluno deve ser lido instantaneamente do cache local persistente (`localStorage`).
   - Sincronizações com o banco devem consultar **unicamente registros novos** criados após o último timestamp de sincronização (`started_at > lastSync` / `timestamp > lastSync`), limitando o retorno a poucos KBs em vez de baixar o banco inteiro repetidas vezes.
2. **Projeção Estrita de Colunas (NUNCA usar `SELECT *` em tabelas com tráfego contínuo)**:
   - Em consultas frequentes, liste explicitamente apenas as colunas essenciais. Jamais busque colunas de payloads pesados ou metadados sem necessidade.
3. **Heartbeat Pontual e Ultra-Leve (0 Bytes de Download)**:
   - O *heartbeat* de sessões ativas deve ter ciclo de **150 a 180 segundos** (2.5 a 3 minutos) e executar **apenas `UPDATE` pontual** dos campos de tempo (`last_heartbeat_at`, `duration_seconds`) na linha da própria sessão do usuário.
   - **NUNCA** ler listas completas ou baixar JSONs consolidados durante o loop de heartbeat.
   - Pausar automaticamente o heartbeat quando o documento estiver em segundo plano (`document.visibilityState !== 'visible'`).
4. **Batching de Eventos com Respostas Minimal**:
   - Telemetria e eventos devem ser enfileirados em memória e enviados em lote (*batch*) com intervalo mínimo de **25 segundos** ou ao acumular 8+ eventos.
   - Inserções no Supabase devem priorizar respostas minimal (sem devolução do payload inserido, gerando `204 No Content` e 0 bytes de saída).
5. **Eliminação de Pollings Curtos em Loop**:
   - É proibido criar `setInterval` com intervalos menores que **3 a 5 minutos** para requisições de banco de dados.
   - Preferir revalidação inteligente no foco da janela (`window.addEventListener('focus', ...)`) com throttle/debounce de no mínimo 3 minutos e botões explícitos de recarga manual pelo usuário.
6. **Proibição de JSON Bloat em Tabelas de Fallback**:
   - Nunca utilizar registros únicos em tabelas compartilhadas (como `materiais`) para ler e re-escrever JSONs acumulados de centenas de KBs a cada requisição de cliente.
7. **Debounce em Formulários e Digitação**:
   - Salvamento automático de textos (como notas de estudo, resumos de Cornell, checklists) deve aplicar debounce de pelo menos **3 a 5 segundos** antes de enviar à nuvem.

