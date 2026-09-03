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
      font-size: 11pt;
    }

    /* PÁGINA DE CAPA */
    .cover-page {
      height: 250mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      padding: 25mm 10mm 15mm 10mm;
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
      font-size: 10pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }

    .cover-title {
      font-family: 'Cinzel', serif;
      font-size: 32pt;
      font-weight: 800;
      color: #1e1b4b;
      line-height: 1.15;
      margin-bottom: 10px;
    }

    .cover-subtitle {
      font-size: 14pt;
      font-weight: 600;
      color: #4338ca;
      line-height: 1.4;
    }

    .cover-description {
      font-size: 11.5pt;
      color: #475569;
      margin-top: 25px;
      max-width: 90%;
      line-height: 1.7;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-top: 40px;
      background: #f8fafc;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .meta-item strong {
      display: block;
      font-size: 9pt;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }

    .meta-item span {
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
    }

    .cover-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5pt;
      color: #64748b;
    }

    /* CONTEÚDO GERAL */
    h1 {
      font-size: 20pt;
      font-weight: 800;
      color: #1e1b4b;
      margin-top: 30px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
      page-break-after: avoid;
    }

    h2 {
      font-size: 14pt;
      font-weight: 700;
      color: #312e81;
      margin-top: 22px;
      margin-bottom: 8px;
      page-break-after: avoid;
    }

    h3 {
      font-size: 11.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-top: 16px;
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
      padding: 14px 18px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #4f46e5;
      background-color: #f5f3ff;
      page-break-inside: avoid;
    }

    .callout-title {
      font-weight: 800;
      font-size: 10.5pt;
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

    /* TABELAS */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }

    th, td {
      padding: 9px 12px;
      text-align: left;
      border: 1px solid #cbd5e1;
    }

    th {
      background-color: #1e1b4b;
      color: #ffffff;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8.5pt;
      letter-spacing: 0.5px;
    }

    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* BLOCOS DE CÓDIGO */
    pre, code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 9pt;
      background: #0f172a;
      color: #f1f5f9;
      border-radius: 6px;
    }

    pre {
      padding: 12px;
      overflow-x: auto;
      margin: 12px 0;
      line-height: 1.4;
      page-break-inside: avoid;
    }

    p code {
      background: #e2e8f0;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
    }

    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-green { background: #d1fae5; color: #065f46; }
    .badge-purple { background: #ede9fe; color: #5b21b6; }
    .badge-amber { background: #fef3c7; color: #92400e; }

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
        Consolidação abrangente da plataforma acadêmica do Seminário Teológico Koinonia (UIECB).
        Apresenta a visão geral de arquitetura, blindagem de egress, controle de acesso RBAC, módulos pedagógicos inov-ativos, changelog detalhado de melhorias e guia operacional para alunos, docentes e administradores.
      </p>
    </div>

    <div class="cover-meta-grid">
      <div class="meta-item">
        <strong>Instituição</strong>
        <span>Seminário Teológico Koinonia (UIECB)</span>
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
        <span>github.com/sacrasub/koinonia-lms</span>
      </div>
      <div class="meta-item">
        <strong>Status de Compilação</strong>
        <span>Produção Ativa (Next.js 15 App Router)</span>
      </div>
      <div class="meta-item">
        <strong>Data de Emissão</strong>
        <span>Setembro de 2026</span>
      </div>
    </div>

    <div class="cover-footer">
      <span>Coordenação Acadêmica & Tecnologia Educacional</span>
      <span>Koinonia LMS • Documento Oficial</span>
    </div>
  </div>

  <!-- SEÇÃO 1: VISÃO GERAL -->
  <h1>1. Identidade do Projeto, Propósito e Escopo Acadêmico</h1>
  <p>
    O <strong>Koinonia LMS</strong> é a plataforma de aprendizagem digital sob medida desenvolvida para a formação teológica e ministerial do <strong>Seminário Teológico Koinonia</strong>, instituição vinculada à União das Igrejas Evangélicas Congregacionais do Brasil (UIECB).
  </p>
  <p>
    A iniciativa surgiu para superar as limitações dos sistemas legados baseados na dispersão de links em planilhas, pastas soltas do Google Drive e mensagens em aplicativos, integrando todo o ciclo acadêmico sob uma experiência moderna, fluida e de alto rigor teológico.
  </p>

  <div class="callout success">
    <div class="callout-title">🎯 Pilares da Plataforma</div>
    O sistema une transmissão síncrona com pré-cache e registro de frequência em tempo real, acervo em alta definição de gravações passadas, Caderno Cornell impulsionado por Inteligência Artificial (Gemini Pro e NotebookLM), biblioteca teológica com mais de 3.000 livros em PDF e metodologias ativas imersivas.
  </div>

  <h2>1.1. Comunidade Acadêmica e Turmas Atendidas</h2>
  <ul>
    <li><strong>Turma A (Semanal Noturno)</strong>: Terças e Quintas-feiras, abrangendo disciplinas de História do Congregacionalismo, Pensamento Cristão II, Aconselhamento Bíblico II e Ética Cristã.</li>
    <li><strong>Turma B (Semanal Noturno)</strong>: Terça a Sexta-feira, com Teontologia e Hamartologia, Hermenêutica Bíblica, História da Igreja I, Antigo Testamento II, Plantação e Revitalização de Igrejas II, Homilética II e Liderança Cristã II.</li>
    <li><strong>Turma Básico de Teologia</strong>: Segundas e Quartas-feiras, com Panorama do Antigo Testamento e Liderança Espiritual.</li>
    <li><strong>Módulos Especiais de Graduação</strong>: TCC I, Portfólio Reflexivo e Projetos de Pesquisa Sacramento.</li>
  </ul>

  <!-- SEÇÃO 2: ARQUITETURA -->
  <div class="page-break"></div>
  <h1>2. Arquitetura Tecnológica e Infraestrutura Dual-Layer</h1>
  <p>
    A solução adota uma stack moderna, performática e modular, priorizando tempos de resposta imediatos (TTFB &lt; 50ms) e transições instantâneas entre abas:
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
        <td>Renderização híbrida, rotas seguras e UI ultra-rápida.</td>
      </tr>
      <tr>
        <td><strong>Estilização</strong></td>
        <td>TailwindCSS, Shadcn UI, Lucide Icons</td>
        <td>Design responsivo, modo escuro nativo e estética premium.</td>
      </tr>
      <tr>
        <td><strong>Autenticação</strong></td>
        <td>Supabase Auth + Google Identity (OAuth)</td>
        <td>Login seguro corporativo/acadêmico sem necessidade de senha.</td>
      </tr>
      <tr>
        <td><strong>Banco de Dados</strong></td>
        <td>PostgreSQL via Supabase</td>
        <td>Persistência relacional de presenças, notas, turmas e sessões.</td>
      </tr>
      <tr>
        <td><strong>Dual-Layer Storage</strong></td>
        <td>Google Cloud Service Account + Google Drive</td>
        <td>Sincronização backend na pasta restrita (ID: <code>1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO</code>).</td>
      </tr>
      <tr>
        <td><strong>Onboarding</strong></td>
        <td>Driver.js</td>
        <td>Tour guiado interativo de 14 etapas em desktop e celulares.</td>
      </tr>
    </tbody>
  </table>

  <h2>2.1. Arquitetura Dual-Layer do Google Drive</h2>
  <p>
    A gestão de arquivos opera em duas camadas de segurança complementares:
  </p>
  <ul>
    <li><strong>Camada 1 (Autenticação do Aluno)</strong>: O login é autenticado pelo Google Workspace. As credenciais do aluno garantem autorização imediata nos arquivos compartilhados institucionalmente.</li>
    <li><strong>Camada 2 (Service Account Server-Side)</strong>: Um Cron Job no backend (<code>/api/cron/sync-drive</code>) autentica-se com chave criptográfica privada protegida e mapeia os metadados dos arquivos para a tabela <code>Drive_Materials</code> do Supabase, sem nunca expor chaves ao frontend.</li>
  </ul>

  <!-- SEÇÃO 3: BLINDAGEM DE EGRESS -->
  <h1>3. Blindagem Suprema de Egress (Supabase Free Tier)</h1>
  <div class="callout danger">
    <div class="callout-title">⚠️ Diretriz Arquitetural Crítica: Cota Gratuita do Supabase</div>
    O sistema não conta com patrocínio financeiro e opera obrigatoriamente dentro do plano gratuito do Supabase (limite de 5 GB/mês). O consumo real de egress é mantido estritamente abaixo de 200 MB a 500 MB/mês através de técnicas avançadas de Zero-Waste Egress.
  </div>

  <h3>Mandamentos de Economia de Tráfego:</h3>
  <ol>
    <li><strong>Local-First & Delta-Sync</strong>: O histórico e dados do aluno são lidos imediatamente do <code>localStorage</code>. Consultas ao banco filtram exclusivamente registros novos posteriores ao último sync (<code>timestamp > lastSync</code>).</li>
    <li><strong>Projeção Estrita de Colunas</strong>: Fica expressamente proibido o uso de <code>SELECT *</code> em tabelas de alto volume. Buscam-se apenas as colunas vitais para a renderização.</li>
    <li><strong>Heartbeat Ultra-Leve de 180 Segundos</strong>: O pulso de presença da sessão do aluno atualiza unicamente os campos de tempo (<code>last_heartbeat_at</code>, <code>duration_seconds</code>) na sua própria linha, sem baixar nada da nuvem (0 bytes de download). Pausa quando a aba perde o foco.</li>
    <li><strong>Batching de Telemetria com 204 No Content</strong>: Eventos analíticos são acumulados em memória e despachados em pacotes a cada 25 segundos, recebendo resposta minimal sem payload de retorno.</li>
    <li><strong>Poda Preventiva de Cache</strong>: Rotina inteligente no boot limpa dados secundários obsoletos para impedir bloqueios por <code>QuotaExceededError</code> no navegador.</li>
  </ol>

  <!-- SEÇÃO 4: RBAC -->
  <div class="page-break"></div>
  <h1>4. Controle de Acesso Baseado em Funções (RBAC)</h1>
  <p>
    O sistema divide o acesso em 4 perfis distintos com visões e ações exclusivas:
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
        <td>Grade de aulas, Caderno Cornell com IA, Salas Meet, Gravações HD, Simulador RPG, Estúdio de Homilética e Acervo de 3.000 livros.</td>
        <td>Foco no aprendizado, anotações e cumprimento da frequência e leituras da sua turma.</td>
      </tr>
      <tr>
        <td><span class="badge badge-amber">Professor</span></td>
        <td>Gestão estrita das matérias atribuídas, upload nativo e links do Drive, criação de avaliações (nativas ou Google Forms), materiais do NotebookLM.</td>
        <td>Isolamento por disciplina, impedindo visualização de materiais ou provas de outros docentes.</td>
      </tr>
      <tr>
        <td><span class="badge badge-purple">Monitor</span></td>
        <td>Escala de monitoria semanal, publicação de links de gravações em HD, disparo de formulários de frequência via chat.</td>
        <td>Suporte logístico e pedagógico em tempo real às transmissões ao vivo.</td>
      </tr>
      <tr>
        <td><span class="badge badge-green">Admin</span></td>
        <td>Controle de 106 usuários autorizados, telefones de WhatsApp, Radar de Tele-Proximidade, métricas globais e permissões RBAC.</td>
        <td>Supervisão institucional e gestão técnica integral da plataforma.</td>
      </tr>
    </tbody>
  </table>

  <!-- SEÇÃO 5: METODOLOGIAS ATIVAS -->
  <h1>5. Módulos Pedagógicos Inov-Ativos e Recursos Especiais</h1>

  <h2>5.1. Fluxo de Estudos em 6 Fases (11 Pastas do Google Drive)</h2>
  <p>
    Estrutura metodológica semanal que conecta o aluno desde a preparação prévia até a consolidação:
  </p>
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
    Ambiente dedicado para gravação de sermões expositivos e simulações de aconselhamento cristão, equipado com temporizador litúrgico (15, 25 e 40 minutos), envio de links e formulário de avaliação mútua entre pares baseado em rubricas pedagógicas.
  </p>

  <h2>5.4. Metaverso Teológico 3D (Arqueologia Bíblica)</h2>
  <p>
    Módulo imersivo tridimensional contendo reconstruções históricas do Tabernáculo no Deserto, Templo de Salomão e Jerusalém do Século I, permitindo que o aluno explore hotspots arqueológicos e bíblicos interativos.
  </p>

  <h2>5.5. Biblioteca Digital Teológica (3.000+ Livros)</h2>
  <p>
    Acervo digital com mais de 3.000 títulos clássicos e comentários bíblicos organizados por assunto, autor e disciplina, com visualizador de PDF embutido de alta performance e gerador de citação bibliográfica no padrão ABNT com um clique.
  </p>

  <!-- SEÇÃO 6: CHANGELOG RECENTE -->
  <div class="page-break"></div>
  <h1>6. Histórico de Mudanças e Melhorias Recém-Implementadas</h1>

  <div class="callout success">
    <div class="callout-title">🚀 Último Pacote de Atualizações em Produção (Commit 157ac6d)</div>
    Todas as correções relatadas foram solucionadas, testadas com build de produção e publicadas oficialmente na Vercel:
  </div>

  <ul>
    <li>
      <strong>Isolamento e Visão Padrão do Professor no SupportMaterialsHub</strong>:
      Implementado o escopo <code>scopedBaseNotes</code> e configurado o filtro padrão para <code>Minhas Matérias - Todas</code>. Quando o professor possui disciplinas atribuídas (como a Profª Betânia Barbosa com <em>Antigo Testamento II</em> e <em>Panorama do Antigo Testamento</em>), o hub lista instantaneamente todos os seus materiais e podcasts, eliminando o erro de lista vazia.
    </li>
    <li>
      <strong>Mural de Recursos Recolhido por Padrão</strong>:
      No painel do aluno, sempre que a contagem de leituras pendentes for zero (<code>pendingAnnouncementsCount === 0</code>), o mural inicia recolhido em barra compacta (<em>"✨ Todas as leituras em dia"</em>), liberando espaço visual para as aulas.
    </li>
    <li>
      <strong>Eliminação do Bug de Redirecionamento ("Abre e Volta")</strong>:
      Removido o timer em segundo plano do <code>GlobalWalkthrough.tsx</code> que forçava retorno para a grade ao clicar em "Fluxo de Estudos". A navegação entre telas agora obedece unicamente à vontade do usuário.
    </li>
    <li>
      <strong>Poda Preventiva de Cache de Armazenamento</strong>:
      Introduzida a função <code>cleanupBulkyLocalStorage()</code> no boot e proteção com <code>try/catch</code> no <code>handleTabChange</code> para evitar estouro da cota de 5 MB do navegador (<code>QuotaExceededError</code>).
    </li>
    <li>
      <strong>Silenciamento Permanente da Avaliação Pedagógica do TCC</strong>:
      A dispensa do modal foi migrada para <code>localStorage</code> com opção <em>"Depois / Não exibir mais"</em>, garantindo que o aviso não reapareça após ser fechado.
    </li>
    <li>
      <strong>Tour Guiado Abrangente de 14 Etapas</strong>:
      Novo roteiro interativo com Driver.js cobrindo Seletor de Perfis, Modo Escuro, Central de Avisos, Sincronização Nuvem, Aulas Ao Vivo, Gravações HD, Grade Curricular, Fluxo de Estudos, Quatro Ds, Homilética, Metaverso 3D, Biblioteca Digital e Ajuda.
    </li>
    <li>
      <strong>Correção dos Números de WhatsApp no Painel Admin</strong>:
      Merge bidirecional em <code>getAuthorizedUsersList()</code> preservando os números formatados dos 11 novos alunos e docentes.
    </li>
  </ul>

  <!-- SEÇÃO 7: GUIA OPERACIONAL -->
  <h1>7. Guia Operacional de Uso por Perfil</h1>

  <h2>7.1. Guia do Aluno</h2>
  <ol>
    <li>Acesse <code>https://koinonialms.vercel.app</code> e clique em <em>Entrar com Google</em> com o e-mail autorizado.</li>
    <li>No banner superior, acompanhe a contagem regressiva para a aula ao vivo. Clique em <em>Entrar no Google Meet</em>.</li>
    <li>Durante a aula, clique em <em>Assinar Presença</em> para registrar sua frequência no formulário oficial.</li>
    <li>Use o <em>Caderno Cornell</em> para registrar as anotações da matéria e gerar sínteses com IA Gemini.</li>
    <li>Acesse a <em>Biblioteca Digital</em> para ler os livros da bibliografia em PDF e copiar citações ABNT.</li>
  </ol>

  <h2>7.2. Guia do Professor</h2>
  <ol>
    <li>Selecione a visão <em>👨‍🏫 Professor</em> no topo da tela.</li>
    <li>Selecione sua matéria no painel docente para acompanhar os materiais e avisos vinculados.</li>
    <li>No botão <em>+ Cadastrar Material de Apoio</em>, inclua anotações do Google Docs, podcasts do NotebookLM ou mapas mentais.</li>
    <li>Crie avaliações nativas ou vincule formulários do Google Forms com a flag de incorporação em iframe.</li>
  </ol>

  <h2>7.3. Guia do Monitor</h2>
  <ol>
    <li>Na visão <em>👑 Monitor</em>, consulte a escala semanal de turmas e horários.</li>
    <li>Após o término da aula síncrona, cadastre o link oficial da gravação em HD para disponibilização aos alunos.</li>
    <li>Durante as transmissões, copie o link da lista de presença com 1 clique e envie no chat do Meet.</li>
  </ol>

  <h2>7.4. Guia do Administrador</h2>
  <ol>
    <li>Acesse a aba <em>🛡️ Admin</em> para gerenciar a base de 106 usuários autorizados.</li>
    <li>Edite números de WhatsApp, atribua papéis múltiplos (Aluno, Professor, Monitor) e force o sync em nuvem.</li>
    <li>Analise o <em>Radar de Tele-Proximidade</em> para identificar alunos com frequência baixa e prestar assistência pastoral preventiva.</li>
  </ol>

  <!-- SEÇÃO 8: GUIA TÉCNICO -->
  <div class="page-break"></div>
  <h1>8. Guia Técnico de Desenvolvimento, Manutenção e Deploy</h1>

  <h2>8.1. Configuração do Ambiente Local</h2>
  <p>Clone o repositório e configure as variáveis de ambiente:</p>
  <pre><code># 1. Clonar repositório
git clone https://github.com/sacrasub/koinonia-lms.git
cd koinonia-lms

# 2. Instalar dependências
npm install

# 3. Criar arquivo de configuração (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
GOOGLE_SERVICE_ACCOUNT_EMAIL=koinonia@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"
GOOGLE_DRIVE_RESTRICTED_FOLDER_ID=1jQ0co8yOr0shnKxVX_lv2JTAM8AQNCMO</code></pre>

  <h2>8.2. Comandos Operacionais</h2>
  <ul>
    <li><code>npm run dev</code>: Inicia o servidor local de desenvolvimento em <code>http://localhost:3000</code>.</li>
    <li><code>npm run build</code>: Executa a compilação completa, checagem de tipos e geração estática para produção.</li>
    <li><code>npm run lint</code>: Executa as regras de validação e qualidade de código do ESLint.</li>
  </ul>

  <h2>8.3. Pipeline de Deploy Contínuo (Vercel CI/CD)</h2>
  <p>
    O projeto está integrado à esteira de entrega contínua da Vercel. Cada envio para o branch <code>main</code> dispara a compilação e publicação automática:
  </p>
  <pre><code>git add .
git commit -m "feat: nova funcionalidade pedagógica"
git push origin main</code></pre>

  <h2>8.4. Políticas de Manutenção e Auditoria Anti-Egress</h2>
  <p>
    Antes de introduzir qualquer nova funcionalidade de banco de dados, certifique-se de cumprir as regras do documento <code>AGENTS.md</code>:
  </p>
  <ul>
    <li>Nunca utilize <code>setInterval</code> com intervalo inferior a 3 minutos para chamadas à API do Supabase.</li>
    <li>Priorize gravação Local-First com sincronização assíncrona delta.</li>
    <li>Monitore o painel de consumo do Supabase mantendo o tráfego mensal em folga total abaixo de 500 MB.</li>
  </ul>

  <div class="callout success" style="margin-top: 30px;">
    <div class="callout-title">✅ Conclusão da Auditoria</div>
    A plataforma Koinonia LMS atinge índice máximo de conformidade arquitetural, estabilidade e usabilidade pedagógica, preparada para o suporte a todas as atividades do semestre 2026.2 e expansões futuras.
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
        Koinonia LMS • Seminário Teológico Koinonia (2026.2)
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
