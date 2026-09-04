const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function generatePdf() {
  console.log('Iniciando gerador de PDF do Relatório do Koinonia LMS...');

  const outputPath = path.resolve(__dirname, '../docs/RELATORIO_DESENVOLVIMENTO_KOINONIA_LMS.pdf');
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Desenvolvimento - Koinonia LMS</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cinzel:wght@600;700;800&display=swap');

    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.6;
      font-size: 10.5pt;
    }

    /* PÁGINA DE CAPA */
    .cover-page {
      height: 250mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      padding: 20mm 10mm 15mm 10mm;
      border-bottom: 2px solid #e2e8f0;
    }

    .cover-header {
      border-bottom: 3px solid #312e81;
      padding-bottom: 20px;
    }

    .cover-badge {
      display: inline-block;
      padding: 6px 14px;
      background-color: #e0e7ff;
      color: #3730a3;
      border-radius: 9999px;
      font-size: 9.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }

    .cover-title {
      font-family: 'Cinzel', serif;
      font-size: 30pt;
      font-weight: 800;
      color: #1e1b4b;
      line-height: 1.15;
      margin-bottom: 8px;
    }

    .cover-subtitle {
      font-size: 13.5pt;
      font-weight: 600;
      color: #4338ca;
      line-height: 1.4;
    }

    .cover-description {
      font-size: 10.5pt;
      color: #475569;
      margin-top: 20px;
      max-width: 95%;
      line-height: 1.65;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-top: 30px;
      background: #f8fafc;
      padding: 18px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .meta-item strong {
      display: block;
      font-size: 8.5pt;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .meta-item span {
      font-size: 10pt;
      font-weight: 700;
      color: #0f172a;
    }

    .cover-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9pt;
      color: #64748b;
    }

    /* CONTEÚDO GERAL */
    h1 {
      font-size: 18pt;
      font-weight: 800;
      color: #1e1b4b;
      margin-top: 26px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e2e8f0;
      page-break-after: avoid;
    }

    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #312e81;
      margin-top: 18px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
    }

    p {
      margin-bottom: 10px;
      text-align: justify;
      color: #334155;
    }

    ul, ol {
      margin-left: 20px;
      margin-bottom: 12px;
      color: #334155;
    }

    li {
      margin-bottom: 4px;
    }

    /* CAIXAS DE DESTAQUE (CALLOUTS) */
    .callout {
      padding: 12px 16px;
      border-radius: 8px;
      margin: 14px 0;
      border-left: 4px solid #4f46e5;
      background-color: #f5f3ff;
      page-break-inside: avoid;
    }

    .callout-title {
      font-weight: 800;
      font-size: 10pt;
      color: #312e81;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .callout.danger {
      border-left-color: #e11d48;
      background-color: #fff1f2;
    }

    .callout.danger .callout-title {
      color: #9f1239;
    }

    .callout.success {
      border-left-color: #059669;
      background-color: #ecfdf5;
    }

    .callout.success .callout-title {
      color: #065f46;
    }

    .callout.info {
      border-left-color: #0284c7;
      background-color: #f0f9ff;
    }

    .callout.info .callout-title {
      color: #0369a1;
    }

    /* TABELAS */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }

    th, td {
      padding: 8px 10px;
      text-align: left;
      border: 1px solid #cbd5e1;
    }

    th {
      background-color: #1e1b4b;
      color: #ffffff;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.5px;
    }

    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* BLOCOS DE CÓDIGO */
    pre, code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 8.5pt;
      background: #0f172a;
      color: #f1f5f9;
      border-radius: 6px;
    }

    pre {
      padding: 10px 14px;
      overflow-x: auto;
      margin: 12px 0;
      line-height: 1.4;
      page-break-inside: avoid;
    }

    p code, li code {
      background: #e2e8f0;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
    }

    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-purple { background: #ede9fe; color: #5b21b6; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .badge-rose { background: #ffe4e6; color: #9f1239; }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- CAPA -->
  <div class="cover-page">
    <div class="cover-header">
      <div class="cover-badge">Documento Técnico & Pedagógico Oficial</div>
      <h1 class="cover-title">KOINONIA LMS</h1>
      <div class="cover-subtitle">Relatório Executivo de Desenvolvimento, Arquitetura e Guia Integrado</div>
      <p class="cover-description">
        Consolidação abrangente da plataforma acadêmica do <strong>Seminário Teológico Congregacional</strong> (UIECB), operando como ambiente de formação teológica e instrumento empírico do Trabalho de Conclusão de Curso (TCC) apresentado no <strong>Centro Universitário do Maciço de Baturité (UNIMB)</strong>. Apresenta arquitetura dual-layer, blindagem estrita de egress, controle de acesso RBAC, módulos pedagógicos inov-ativos, módulo de pesquisa de campo empírico, piloto automático de gravação para monitoria, social sharing seguro e changelog consolidado até a versão atual em produção.
      </p>
    </div>

    <div class="cover-meta-grid">
      <div class="meta-item">
        <strong>Instituição & Seminário</strong>
        <span>Seminário Teológico Congregacional (UIECB) & UNIMB</span>
      </div>
      <div class="meta-item">
        <strong>Pesquisador & Orientação</strong>
        <span>Cristiano do Sacramento Soares • Pr. Alexsandro Silva</span>
      </div>
      <div class="meta-item">
        <strong>Semestre Letivo</strong>
        <span>2026.2 (Turmas A, B, Básico & TCC)</span>
      </div>
      <div class="meta-item">
        <strong>URL Oficial de Produção</strong>
        <span>https://koinonialms.vercel.app</span>
      </div>
      <div class="meta-item">
        <strong>Repositório GitHub</strong>
        <span>github.com/sacrasub/koinonia-lms (Branch main)</span>
      </div>
      <div class="meta-item">
        <strong>Status de Compilação</strong>
        <span>Produção Estável (Next.js 15 App Router • React 19)</span>
      </div>
      <div class="meta-item">
        <strong>Último Commit Mapeado</strong>
        <span>c807892 (fix: eliminação de duplicação no mural)</span>
      </div>
      <div class="meta-item">
        <strong>Data de Emissão</strong>
        <span>Setembro de 2026</span>
      </div>
    </div>

    <div class="cover-footer">
      <span>Coordenação Acadêmica & Tecnologia Educacional</span>
      <span>Koinonia LMS • Documento Oficial de Engenharia & Pedagogia</span>
    </div>
  </div>

  <!-- SEÇÃO 1: IDENTIDADE -->
  <h1>1. Identidade do Projeto, Propósito e Escopo Acadêmico</h1>
  <p>
    O <strong>Koinonia LMS</strong> é a plataforma de aprendizagem digital desenvolvida para a formação teológica e ministerial do <strong>Seminário Teológico Congregacional</strong>, instituição vinculada à União das Igrejas Evangélicas Congregacionais do Brasil (UIECB). Simultaneamente, o sistema opera como objeto de intervenção empírica e instrumento científico do Trabalho de Conclusão de Curso (TCC) em Teologia do pesquisador <strong>Cristiano do Sacramento Soares</strong>, sob orientação do <strong>Pastor Alexsandro Silva</strong>, pelo <strong>Centro Universitário do Maciço de Baturité (UNIMB - Baturité – CE)</strong>.
  </p>
  <p>
    A iniciativa visa superar a dispersão operacional dos métodos legados (planilhas descentralizadas, pastas desorganizadas de Google Drive e formulários avulsos), integrando todo o ciclo formativo sob uma experiência moderna, fluida e de alto rigor teológico e metodológico.
  </p>

  <div class="callout success">
    <div class="callout-title">🎯 Pilares Centrais do Sistema</div>
    O ecossistema integra transmissão síncrona com pré-cache e registro de frequência em tempo real, acervo em alta definição com gravação automatizada via Piloto Automático, Caderno Cornell com Inteligência Artificial (Gemini Pro e NotebookLM), acervo teológico digital de mais de 3.000 livros em PDF, metodologias ativas imersivas (Quatro Ds, RPG e Homilética) e um módulo nativo de pesquisa de campo empírica com TCLE.
  </div>

  <h2>1.1. Comunidade Acadêmica e Turmas Atendidas</h2>
  <ul>
    <li><strong>Turma A (Semanal Noturno)</strong>: Terças e Quintas-feiras, abrangendo História do Congregacionalismo, Pensamento Cristão II, Aconselhamento Bíblico II e Ética Cristã.</li>
    <li><strong>Turma B (Semanal Noturno)</strong>: Terça a Sexta-feira, com Teontologia e Hamartologia, Hermenêutica Bíblica, História da Igreja I, Antigo Testamento II, Plantação e Revitalização de Igrejas II, Homilética II e Liderança Cristã II.</li>
    <li><strong>Turma Básico de Teologia</strong>: Segundas e Quartas-feiras, com Panorama do Antigo Testamento e Liderança Espiritual.</li>
    <li><strong>Módulos Especiais de Graduação</strong>: TCC I, Portfólio Reflexivo e Pesquisa de Campo Sacramento (UNIMB).</li>
  </ul>

  <!-- SEÇÃO 2: ARQUITETURA TECNOLÓGICA -->
  <div class="page-break"></div>
  <h1>2. Arquitetura Tecnológica e Infraestrutura Dual-Layer</h1>
  <p>
    O Koinonia LMS foi concebido sobre uma arquitetura moderna baseada em Next.js App Router hospedada na infraestrutura de borda da Vercel, combinada com banco de dados PostgreSQL serverless via Supabase e autenticação corporativa/acadêmica via Google OAuth.
  </p>

  <table>
    <thead>
      <tr>
        <th>Camada</th>
        <th>Tecnologia</th>
        <th>Papel no Ecossistema</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frontend</strong></td>
        <td>Next.js 15 (App Router), React 19, TypeScript</td>
        <td>Renderização de alta performance, rotas seguras e UI instantânea.</td>
      </tr>
      <tr>
        <td><strong>Estilização</strong></td>
        <td>TailwindCSS, Shadcn UI, Lucide Icons</td>
        <td>Design responsivo, modo escuro nativo e microinterações fluidas.</td>
      </tr>
      <tr>
        <td><strong>Autenticação</strong></td>
        <td>Supabase Auth + Google Identity Services (OAuth)</td>
        <td>Login seguro acadêmico sem senha para comunidade interna.</td>
      </tr>
      <tr>
        <td><strong>Banco de Dados</strong></td>
        <td>PostgreSQL via Supabase</td>
        <td>Persistência relacional de presenças, notas, turmas, enquetes e sessões.</td>
      </tr>
      <tr>
        <td><strong>Dual-Layer Storage</strong></td>
        <td>Google Cloud Service Account + Google Drive</td>
        <td>Sincronização backend na pasta restrita (ID: <code>1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO</code>).</td>
      </tr>
      <tr>
        <td><strong>Onboarding Guiado</strong></td>
        <td>Driver.js</td>
        <td>Tours interativos dinâmicos com roteiros específicos por perfil de usuário.</td>
      </tr>
      <tr>
        <td><strong>Relatórios PDF</strong></td>
        <td>Puppeteer Headless</td>
        <td>Geração automatizada de relatórios executivos com paginação e design editorial A4.</td>
      </tr>
    </tbody>
  </table>

  <h2>2.1. Arquitetura de Segurança Dual-Layer</h2>
  <ul>
    <li><strong>Camada 1 (Frontend & Middleware Next.js)</strong>: Assegura proteção estrita das rotas sob <code>/dashboard</code> e painéis por perfil. Sessões não autenticadas são barradas pelo <code>middleware.ts</code>. A lista oficial em <code>authConfig.ts</code> valida os perfis institucionais.</li>
    <li><strong>Camada 2 (Backend & Google Service Account)</strong>: Credenciais de alta confidencialidade operam estritamente no servidor (<code>/api/cron/sync-drive</code>). O frontend recebe apenas metadados indexados na tabela <code>Drive_Materials</code>. O download do arquivo redireciona para a URL oficial do Google Drive, delegando a autenticação ao Google Workspace.</li>
  </ul>

  <!-- SEÇÃO 3: BLINDAGEM DE EGRESS -->
  <h1>3. Blindagem Mandatória de Egress (Supabase Free Tier)</h1>
  <div class="callout danger">
    <div class="callout-title">⚠️ Diretriz Arquitetural Crítica: Cota Gratuita do Supabase</div>
    O sistema não conta com patrocínio financeiro comercial e opera obrigatoriamente dentro do plano gratuito do Supabase (limite de 5 GB/mês). O consumo real de egress é mantido estritamente abaixo de 200 MB a 500 MB/mês através de técnicas avançadas de Zero-Waste Egress.
  </div>

  <h3>Mandamentos Anti-Egress (Zero-Waste Egress Architecture):</h3>
  <ol>
    <li><strong>Local-First & Delta-Sync</strong>: O histórico e dados do aluno são carregados instantaneamente do <code>localStorage</code>. Consultas ao banco filtram unicamente registros novos posteriores ao último sync (<code>timestamp > lastSync</code>).</li>
    <li><strong>Projeção Estrita de Colunas</strong>: Fica vedado o uso de <code>SELECT *</code> em tabelas de tráfego contínuo. Selecionam-se estritamente os campos essenciais.</li>
    <li><strong>Heartbeat Ultra-Leve de 180 Segundos</strong>: O pulso de presença atualiza exclusivamente os campos de tempo (<code>last_heartbeat_at</code>, <code>duration_seconds</code>) na linha da própria sessão (0 bytes de download). Pausa quando a aba do navegador perde o foco.</li>
    <li><strong>Batching de Telemetria com 204 No Content</strong>: Eventos analíticos são acumulados em memória e despachados em pacotes a cada 25 segundos, recebendo resposta minimalista sem payload de retorno.</li>
    <li><strong>Poda Preventiva de Cache & Sanitização Pré-Hidratação</strong>: Script inline no cabeçalho HTML executa limpeza preventiva de itens maiores que 50 KB no <code>localStorage</code> antes da hidratação do React, eliminando o erro de cota (<code>QuotaExceededError</code>) em celulares.</li>
  </ol>

  <!-- SEÇÃO 4: RBAC -->
  <div class="page-break"></div>
  <h1>4. Controle de Acesso Baseado em Funções (RBAC)</h1>
  <p>
    O sistema possui 4 perfis operacionais com menus, ações e permissões segregadas, complementado pelo perfil de Pesquisa Acadêmica:
  </p>

  <table>
    <thead>
      <tr>
        <th>Perfil</th>
        <th>Recursos Exclusivos</th>
        <th>Visão Acadêmica</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="badge badge-blue">Aluno</span></td>
        <td>Grade curricular semanal (16 aulas), Caderno Cornell com IA, Salas Meet, Gravações HD, Simulador RPG, Estúdio de Homilética e Acervo de 3.000 livros.</td>
        <td>Foco no aprendizado, anotações e cumprimento da frequência e leituras da sua turma.</td>
      </tr>
      <tr>
        <td><span class="badge badge-amber">Professor</span></td>
        <td>Gestão estrita das matérias atribuídas, upload nativo e links do Drive, criação de avaliações (nativas ou Google Forms), materiais do NotebookLM.</td>
        <td>Isolamento por disciplina, impedindo visualização de materiais ou provas de outros docentes.</td>
      </tr>
      <tr>
        <td><span class="badge badge-purple">Monitor</span></td>
        <td>Escala de monitoria semanal, Piloto Automático de gravações em HD, disparo de formulários de frequência via chat com 1 clique.</td>
        <td>Suporte logístico e pedagógico em tempo real às transmissões ao vivo.</td>
      </tr>
      <tr>
        <td><span class="badge badge-green">Admin</span></td>
        <td>Controle de 106 usuários autorizados, telefones de WhatsApp, Radar de Tele-Proximidade, métricas globais e permissões RBAC.</td>
        <td>Supervisão institucional e gestão técnica integral da plataforma.</td>
      </tr>
      <tr>
        <td><span class="badge badge-rose">Pesquisador</span></td>
        <td>Painel do Pesquisador Sacramento, métricas em tempo real por segmento, respostas docentes, criação de novas enquetes e exportação CSV para SPSS/Excel.</td>
        <td>Investigação empírica da superação da distância transacional (TCC UNIMB).</td>
      </tr>
    </tbody>
  </table>

  <!-- SEÇÃO 5: METODOLOGIAS ATIVAS -->
  <h1>5. Módulos Pedagógicos Inov-Ativos e Recursos Especiais</h1>

  <h2>5.1. Fluxo de Estudos em 6 Fases (11 Pastas do Google Drive)</h2>
  <ul>
    <li><strong>Fase 1 • Preparação</strong>: Consulta de leituras pré-aula no Mural e horários na Google Agenda.</li>
    <li><strong>Fase 2 • Aula Síncrona</strong>: Sala do Google Meet com contagem regressiva e assinatura da lista de presença.</li>
    <li><strong>Fase 3 • Caderno Cornell</strong>: Tomada de notas estruturadas com IA Gemini, perguntas de auto-teste e síntese.</li>
    <li><strong>Fase 4 • Aprofundamento</strong>: Escuta de podcasts gerados pelo NotebookLM e mentoria com 9 Personas do Gemini Pro.</li>
    <li><strong>Fase 5 • Prática Ministerial</strong>: Gravação de sermões no Estúdio de Homilética e dilemas no Simulador RPG Pastoral.</li>
    <li><strong>Fase 6 • Avaliação</strong>: Resolução de provas, portfólio reflexivo e acompanhamento de notas.</li>
  </ul>

  <h2>5.2. Trilha dos Quatro Ds (Método de Jesus)</h2>
  <p>
    Metodologia andragógica socrática que guia o estudante em quatro momentos reflexivos:
    <strong>Desejo</strong> (provocação inicial do interesse espiritual),
    <strong>Desestruturação</strong> (confronto de preconceitos e tradições humanas),
    <strong>Desafio</strong> (exigência exegética e rigor bíblico) e
    <strong>Decisão</strong> (aplicação ministerial prática).
  </p>

  <h2>5.3. Estúdio de Homilética & Instrução por Pares</h2>
  <p>
    Ambiente dedicado para ensaio de sermões expositivos com cronômetro litúrgico (15, 25 e 40 minutos), gravação de vídeo/áudio e matriz de avaliação mútua entre pares baseada em rubricas de fidelidade textual, exegese e aplicação pastoral.
  </p>

  <h2>5.4. Metaverso Teológico 3D & Biblioteca Digital (3.000+ Títulos)</h2>
  <p>
    Reconstruções históricas do Tabernáculo no Deserto, Templo de Salomão e Jerusalém do Século I com hotspots explicativos, articuladas a um acervo de mais de 3.000 livros em PDF com leitor embutido e citação ABNT com 1 clique.
  </p>

  <!-- SEÇÃO 6: PESQUISA TCC UNIMB -->
  <div class="page-break"></div>
  <h1>6. Módulo Nativo de Pesquisa de Campo & Diagnóstico do TCC</h1>
  <div class="callout info">
    <div class="callout-title">🎓 Vínculo Acadêmico & Rigor Metodológico</div>
    Trabalho de Conclusão do Curso de Bacharelado em Teologia no <strong>Centro Universitário do Maciço de Baturité (UNIMB - Baturité – CE)</strong>, sob autoria do discente e pesquisador <strong>Cristiano do Sacramento Soares</strong> e orientação do <strong>Pastor Alexsandro Silva</strong>.
  </div>

  <h2>6.1. Instrumento Empírico & Termo de Consentimento Livre e Esclarecido (TCLE)</h2>
  <p>
    O instrumento de coleta de dados foi concebido em estrita conformidade com as diretrizes éticas (Resoluções CNS 466/2012 e 510/2016):
  </p>
  <ul>
    <li><strong>TCLE Integrado</strong>: Informações completas sobre finalidade acadêmica, garantia de sigilo, liberdade de participação ou desistência sem prejuízo e contatos do pesquisador e da coordenação da UNIMB.</li>
    <li><strong>Validação Institucional para Comunidade Interna</strong>: Seminaristas, docentes e monitores da UNIMB autenticam-se com a Conta Google institucional para conferência acadêmica, liberando acesso imediato à plataforma Koinonia LMS pós-resposta.</li>
    <li><strong>Acesso Livre e Anônimo para Comunidade Externa</strong>: Pastores ordenados, líderes, membros de congregações e discentes de outros seminários participam de forma anônima e desimpedida via link público.</li>
  </ul>

  <h2>6.2. Triangulação Metodológica de 5 Atores Eclesiais</h2>
  <table>
    <thead>
      <tr>
        <th>Ator Investigado</th>
        <th>Dimensões Teóricas e Pedagógicas Analisadas</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Discentes Internos</strong></td>
        <td>Distância transacional afetiva e cognitiva; eficácia das sínteses com IA no Caderno Cornell; frequência em aulas ao vivo e acesso a gravações.</td>
      </tr>
      <tr>
        <td><strong>Docentes</strong></td>
        <td>Distância pedagógica e hermenêutica; isolamento por disciplina; facilidade no upload de materiais e utilização do NotebookLM.</td>
      </tr>
      <tr>
        <td><strong>Monitores</strong></td>
        <td>Mediação técnica e operacional; pontualidade na liberação de gravações; fluxo de chat no Google Meet e disparo de presenças.</td>
      </tr>
      <tr>
        <td><strong>Pastores e Líderes</strong></td>
        <td>Avaliação da maturidade espiritual, firmeza bíblica e aptidão pastoral dos seminaristas formados online em contraste ao ensino presencial.</td>
      </tr>
      <tr>
        <td><strong>Membros da Igreja</strong></td>
        <td>Percepção prática sobre o impacto das pregações, clareza expositiva e acolhimento pastoral desempenhado pelos alunos em suas igrejas locais.</td>
      </tr>
    </tbody>
  </table>

  <h2>6.3. Gerenciador Multi-Perfil com Edição e Painel do Pesquisador</h2>
  <ul>
    <li><strong>Edição de Respostas Submetidas</strong>: O respondente pode alterar e atualizar suas respostas anteriores a qualquer momento, sem corromper ou duplicar registros.</li>
    <li><strong>Visualização de Respostas Docentes</strong>: O painel (<code>TccSacramentoPage.tsx</code>) permite filtrar respostas detalhadas dos professores (com destaque para contribuições docentes como a do Prof. Cleiton).</li>
    <li><strong>Criação Dinâmica de Novas Enquetes</strong>: O pesquisador pode cadastrar novas enquetes rápidas diretamente pela interface para aprofundar tópicos em tempo real.</li>
    <li><strong>Exportação em 1 Clique</strong>: Geração de arquivo CSV formatado para análise estatística descritiva e inferencial em Microsoft Excel, IBM SPSS e R.</li>
  </ul>

  <!-- SEÇÃO 7: MONITORIA & GRAVADOR -->
  <h1>7. Piloto Automático do Gravador de Aulas & Central de Monitoria</h1>
  <p>
    Para garantir excelência operacional e a disponibilização imediata do acervo aos alunos, a central de monitoria (coordenada pelo <strong>Monitor Cristiano</strong>) foi modernizada com gravação automatizada:
  </p>
  <ul>
    <li><strong>Piloto Automático de Gravação</strong>: Agendamento da gravação sincronizado com o horário oficial da aula, ativando contagem regressiva sonora e visual.</li>
    <li><strong>Auto-Stop Inteligente</strong>: O encerramento da captura é efetuado automaticamente no término da aula, prevenindo arquivos ociosos ou sobrecarga de memória.</li>
    <li><strong>Disparo Rápido de Presença</strong>: Botão de cópia instantânea do formulário oficial do Google Forms diretamente para a área de transferência do monitor.</li>
    <li><strong>Resolução Resiliente de Perfis</strong>: Proteção contra inconsistências de <code>avatarUrl</code> e sincronização estável entre papéis de monitor, discente e professor.</li>
  </ul>

  <!-- SEÇÃO 8: IDENTIDADE VISUAL & MOBILE -->
  <div class="page-break"></div>
  <h1>8. Identidade Visual Oficial, Social Sharing & Blindagem Mobile</h1>

  <h2>8.1. Logotipo Oficial e Pacote de Favicons</h2>
  <p>
    Desenvolvimento da marca oficial Koinonia LMS com símbolo litúrgico em alta definição (azul royal, dourado e grafite), acompanhado do conjunto completo de ativos para navegadores: <code>favicon.ico</code>, <code>favicon-16x16.png</code>, <code>favicon-32x32.png</code>, <code>apple-touch-icon.png</code> e manifesto PWA.
  </p>

  <h2>8.2. OpenGraph Rico e Convites Seguros via WhatsApp</h2>
  <div class="callout success">
    <div class="callout-title">📱 Compartilhamento Institucional Padronizado</div>
    Metatags OpenGraph e Twitter Cards configuradas no <code>layout.tsx</code> garantem cartões visuais ricos ao compartilhar a plataforma em grupos de WhatsApp. O modal de convite adota codificação 100% BMP segura via <code>api.whatsapp.com</code>, prevenindo truncamento de texto e caracteres ilegíveis em qualquer dispositivo móvel.
  </div>

  <h2>8.3. Blindagem Pré-Hidratação contra QuotaExceededError</h2>
  <p>
    Foi introduzido um script de auto-sanitização executado no <code>&lt;head&gt;</code> do documento antes da hidratação do React. A rotina varre o <code>localStorage</code> e elimina preventivamente chaves que excedam 50 KB, protegendo celulares com memória reduzida e assegurando carregamento estável em conexões móveis.
  </p>

  <!-- SEÇÃO 9: CHANGELOG COMPLETO -->
  <h1>9. Histórico Completo de Mudanças Recém-Implementadas (Changelog)</h1>
  <p>
    Consolidação de todas as atualizações de produção registradas no repositório oficial:
  </p>

  <table>
    <thead>
      <tr>
        <th>Commit</th>
        <th>Tipo</th>
        <th>Módulo</th>
        <th>Descrição Técnica e Pedagógica</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>c807892</code></td>
        <td><span class="badge badge-rose">Fix</span></td>
        <td>Aluno / Mural</td>
        <td>Eliminação definitiva de duplicação no mural de leituras e links recomendados no painel do estudante.</td>
      </tr>
      <tr>
        <td><code>abbac3d</code></td>
        <td><span class="badge badge-purple">Feat/Fix</span></td>
        <td>TCC / Monitor</td>
        <td>Exibição de respostas docentes do Prof. Cleiton; alteração e edição de respostas; criação de enquetes dinâmicas; ajuste do gravador para Monitor Cristiano.</td>
      </tr>
      <tr>
        <td><code>6dcfeeb</code></td>
        <td><span class="badge badge-rose">Fix</span></td>
        <td>Recorder</td>
        <td>Correção no disparo de gravação pré-configurada, permissões de monitor e sincronização de roles de usuário.</td>
      </tr>
      <tr>
        <td><code>9ef0e42</code></td>
        <td><span class="badge badge-purple">Feat/Fix</span></td>
        <td>Monitor</td>
        <td>Resolução de crash de <code>avatarUrl</code> e implementação do Piloto Automático de gravação programada com Auto-Stop.</td>
      </tr>
      <tr>
        <td><code>84c8d2d</code></td>
        <td><span class="badge badge-blue">Feat</span></td>
        <td>TCC / UX</td>
        <td>Garantia de persistência cloud em Supabase; atalhos no dashboard de resultados e ativação de tours guiados baseados no perfil do usuário (*role-based tours*).</td>
      </tr>
      <tr>
        <td><code>a530078</code></td>
        <td><span class="badge badge-rose">Fix</span></td>
        <td>WhatsApp</td>
        <td>Padronização 100% BMP em convites de WhatsApp eliminando caracteres truncados e migração definitiva para <code>api.whatsapp.com</code>.</td>
      </tr>
      <tr>
        <td><code>35b757a</code></td>
        <td><span class="badge badge-rose">Fix</span></td>
        <td>WhatsApp</td>
        <td>Substituição de emojis conflitantes por caracteres universais compatíveis com WhatsApp e padronização de nomes institucionais.</td>
      </tr>
      <tr>
        <td><code>3eb65dc</code></td>
        <td><span class="badge badge-blue">Feat</span></td>
        <td>Identidade</td>
        <td>Logotipo oficial Koinonia LMS, conjunto de favicons, preview rico de OpenGraph para WhatsApp e modal de convite institucional.</td>
      </tr>
      <tr>
        <td><code>e7062ae</code></td>
        <td><span class="badge badge-blue">Feat</span></td>
        <td>TCC</td>
        <td>Atualização do nome Seminário Teológico Congregacional, instrumentos empíricos com perguntas personalizadas por ator e edição multiperfil.</td>
      </tr>
      <tr>
        <td><code>961e046</code></td>
        <td><span class="badge badge-rose">Fix</span></td>
        <td>TCC / Core</td>
        <td>Correção de erro <code>useRef is not defined</code>; atualização de dados do TCLE da UNIMB e Koinonia LMS.</td>
      </tr>
      <tr>
        <td><code>fbc7faf</code></td>
        <td><span class="badge badge-blue">Feat</span></td>
        <td>TCC</td>
        <td>Atualização de dados da UNIMB, vinculação ao autor Cristiano do Sacramento Soares, autenticação institucional interna e explicabilidade pedagógica (glossário).</td>
      </tr>
      <tr>
        <td><code>f75b9d8</code></td>
        <td><span class="badge badge-blue">Feat</span></td>
        <td>TCC</td>
        <td>Implementação do módulo nativo de pesquisa de campo e diagnóstico com TCLE, rascunhos em tempo real e blindagem de egress.</td>
      </tr>
      <tr>
        <td><code>157ac6d</code></td>
        <td><span class="badge badge-rose">Fix</span></td>
        <td>Docente</td>
        <td>Visão padrão de matérias do professor (<code>Minhas Matérias - Todas</code>) e carga de sementes para a Profª Betânia Barbosa.</td>
      </tr>
      <tr>
        <td><code>2bdef17</code></td>
        <td><span class="badge badge-blue">Feat</span></td>
        <td>UX / Admin</td>
        <td>Isolamento docente de materiais; mural recolhido por padrão quando sem pendências; tour guiado de 14 etapas; correção de WhatsApp no Admin.</td>
      </tr>
    </tbody>
  </table>

  <!-- SEÇÃO 10: GUIA OPERACIONAL -->
  <div class="page-break"></div>
  <h1>10. Guia Operacional de Uso por Perfil</h1>

  <h2>10.1. Guia do Aluno</h2>
  <ol>
    <li>Acesse <code>https://koinonialms.vercel.app</code> e clique em <em>Entrar com Conta Google</em> com seu e-mail autorizado.</li>
    <li>No card superior, acompanhe a contagem regressiva da aula ao vivo. Clique em <em>Entrar no Google Meet</em> e assine a lista de presença.</li>
    <li>Utilize o <em>Caderno Cornell</em> para sintetizar as anotações e acione o Gemini Pro para resumos automáticos.</li>
    <li>Acesse a <em>Biblioteca Digital</em> para consultar as obras em PDF e copiar citações em ABNT com 1 clique.</li>
    <li>Responda ao questionário no banner de pesquisa do TCC para registrar sua avaliação acadêmica.</li>
  </ol>

  <h2>10.2. Guia do Professor</h2>
  <ol>
    <li>Selecione a visão <em>👨‍🏫 Professor</em> no cabeçalho.</li>
    <li>Suas disciplinas são selecionadas automaticamente. Clique em <em>+ Cadastrar Material de Apoio</em> para anexar links do Google Docs ou podcasts do NotebookLM.</li>
    <li>Cadastre provas nativas ou integre formulários do Google Forms ativando a renderização em iframe.</li>
    <li>Responda ao instrumento docente de pesquisa do TCC na aba correspondente.</li>
  </ol>

  <h2>10.3. Guia do Monitor</h2>
  <ol>
    <li>Na visão <em>👑 Monitor</em>, consulte a escala de aulas e selecione a disciplina do dia.</li>
    <li>Configure o tempo de encerramento e ative o <em>Piloto Automático</em> de gravação com Auto-Stop inteligente.</li>
    <li>Copie com 1 clique o link de presença oficial e envie no chat do Google Meet durante a transmissão.</li>
  </ol>

  <h2>10.4. Guia do Administrador</h2>
  <ol>
    <li>Acesse a aba <em>🛡️ Admin</em> -> <em>Usuários Autorizados</em> para gerenciar a base de 106 usuários.</li>
    <li>Atualize telefones de WhatsApp, sincronize dados com a nuvem Supabase e monitore o <em>Radar de Tele-Proximidade</em>.</li>
  </ol>

  <h2>10.5. Guia do Pesquisador (TCC Sacramento)</h2>
  <ol>
    <li>Acesse o menu do TCC para inspecionar os gráficos e totalizadores por segmento eclesiástico/acadêmico.</li>
    <li>Examine as respostas docentes detalhadas (como as contribuições do Prof. Cleiton).</li>
    <li>Crie novas perguntas dinâmicas e exporte os dados consolidados em CSV para análise no SPSS e Excel.</li>
  </ol>

  <!-- SEÇÃO 11: GUIA TÉCNICO -->
  <h1>11. Guia Técnico de Desenvolvimento, Manutenção e Deploy</h1>

  <h2>11.1. Configuração do Ambiente Local</h2>
  <pre><code># 1. Clonar o repositório
git clone https://github.com/sacrasub/koinonia-lms.git
cd koinonia-lms

# 2. Instalar dependências
npm install

# 3. Executar o ambiente de desenvolvimento local
npm run dev

# 4. Validar compilação e tipagem para produção
npm run build

# 5. Gerar o Relatório Oficial em PDF
node scripts/generate_report_pdf.js</code></pre>

  <h2>11.2. Variáveis de Ambiente Necessárias (.env.local)</h2>
  <pre><code>NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
GOOGLE_SERVICE_ACCOUNT_EMAIL=koinonia@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"
GOOGLE_DRIVE_RESTRICTED_FOLDER_ID=1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO</code></pre>

  <h2>11.3. Pipeline de Deploy Contínuo (Vercel CI/CD)</h2>
  <p>
    Toda alteração enviada para o branch <code>main</code> no GitHub dispara automaticamente a compilação e publicação em produção pela esteira da Vercel:
  </p>
  <pre><code>git add .
git commit -m "feat/fix: descricao da melhoria"
git push origin main</code></pre>

  <div class="callout success" style="margin-top: 25px;">
    <div class="callout-title">✅ Conclusão da Auditoria de Engenharia e Pedagogia</div>
    A plataforma <strong>Koinonia LMS</strong> alcança o patamar máximo de estabilidade operacional, maturidade arquitetural e aderência aos objetivos pedagógicos e de pesquisa acadêmica, operando em total conformidade com as diretrizes do Seminário Teológico Congregacional (UIECB) e do Centro Universitário do Maciço de Baturité (UNIMB).
  </div>

</body>
</html>
  `;

  // Inicializa Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  // Gera o PDF
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '15mm',
      right: '15mm',
      bottom: '18mm',
      left: '15mm'
    },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 8pt; color: #94a3b8; width: 100%; text-align: right; padding-right: 15mm; font-family: sans-serif;">
        Koinonia LMS • Seminário Teológico Congregacional (2026.2)
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 8pt; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; padding: 0 15mm; font-family: sans-serif;">
        <span>Relatório Executivo de Desenvolvimento & Arquitetura</span>
        <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
      </div>
    `
  });

  await browser.close();
  console.log(`PDF gerado com sucesso em: ${outputPath}`);
}

generatePdf().catch((err) => {
  console.error('Erro ao gerar PDF:', err);
  process.exit(1);
});
