export type UserRole = 'admin' | 'professor' | 'monitor' | 'aluno';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
}

export interface Disciplina {
  id: string;
  code: string;
  name: string;
  description: string;
  professor_name: string;
  professor_id: string;
  professor_email?: string;
  monitor_name: string;
  monitor_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  timezone: string;
  semester: string;
  turma_id?: string;
  turma_idx?: number; // 0: Fim de Semana (5º), 1: Semanal Noturno Turma A (7º), 2: Semanal Noturno Turma B (3º), 3: Curso Básico
  google_meet_url?: string;
  google_meet_phone?: string;
  google_meet_pin?: string;
  google_meet_tel_url?: string;
  google_drive_url?: string;
  attendance_form_url?: string;
}

export interface Aula {
  id: string;
  disciplina_id: string;
  disciplina_name: string;
  code?: string;
  turma_id?: string;
  turma_idx?: number; // 0: Fim de Semana (5º), 1: Semanal Noturno Turma A (7º), 2: Semanal Noturno Turma B (3º), 3: Curso Básico
  professor_name?: string;
  monitor_name?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  title: string;
  description: string;
  scheduled_at: string;
  google_meet_url?: string;
  google_meet_phone?: string;
  google_meet_pin?: string;
  google_meet_tel_url?: string;
  google_drive_url?: string;
  recording_url?: string;
  attendance_form_url?: string;
  ai_summary_url?: string; // Link para Google Docs gerado pela IA do Meet
  ai_summary_text?: string; // Texto transcrito/estruturado do resumo da IA
  is_live_now?: boolean;
}

export interface Avaliacao {
  id: string;
  disciplina_id: string;
  disciplina_name: string;
  title: string;
  description: string;
  due_date: string;
  google_forms_url?: string;
  is_legacy: boolean;
  max_score: number;
}

export interface Material {
  id: string;
  disciplina_id: string;
  disciplina_name: string;
  title: string;
  file_url?: string;
  google_drive_url?: string;
  file_type?: string;
  is_native_upload?: boolean;
  created_at: string;
}

export interface CornellNote {
  id: string;
  user_email?: string;
  date: string; // Data da aula (YYYY-MM-DD)
  disciplina_code?: string;
  disciplina_name: string;
  theme: string; // Tema principal da aula
  professor_name: string;
  biblical_references: string; // Textos bíblicos e referências teológicas de apoio
  cues: string; // Coluna da Esquerda (~30%): Palavras-chave, conceitos centrais e perguntas de auto-teste
  notes: string; // Coluna da Direita (~70%): Anotações em tempo real, bullet points e ideias telegráficas
  summary: string; // Faixa Basal Inferior: Síntese global e conclusões essenciais em 2-3 frases
  ai_summary_url?: string; // Link para o documento Google Docs gerado pela IA do Meet
  ai_summary_text?: string; // Texto estruturado / transcrição gerada pela IA
  tags?: string[];
  sheet_index?: number; // Número da folha na mesma aula (1, 2, 3...)
  sheet_title?: string; // Título opcional da folha (ex: "Parte 1", "Discussão")
  created_at?: string;
  updated_at?: string;
}

export interface SystemUpdate {
  id: string;
  version: string;
  title: string;
  description: string;
  date: string; // ex: "01/09/2026"
  category: 'novidade' | 'melhoria' | 'correcao' | 'comunicado';
  highlights: string[];
  badge?: string;
  link_url?: string;
  link_label?: string;
  author?: string;
}

export interface AvisoLeituraPreAula {
  id: string;
  disciplina_id: string;
  disciplina_name: string;
  author_name: string;
  author_role: 'professor' | 'monitor' | 'admin';
  author_email?: string;
  avatar_url?: string;
  title: string;
  message: string;
  link_url: string;
  created_at: string;
  target_date?: string;
  category?: 'pre_aula' | 'durante_aula' | 'complementar';
  is_pinned?: boolean;
  is_archived?: boolean;
  archived_at?: string;
}

export interface BibliotecaBook {
  id: string;
  title: string;
  author: string;
  category: string;
  size?: number;
  date?: string;
  mime?: string;
  path?: string;
  drive_url?: string;
  description?: string;
  cover_url?: string;
  is_custom?: boolean;
  added_by_name?: string;
  added_by_role?: 'professor' | 'monitor' | 'admin';
  added_by_email?: string;
  created_at?: string;
  in_library?: boolean;
  is_available?: boolean;
  pages?: number;
  year?: string;
  isbn?: string;
  publisher?: string;
  subcategoria?: string;
}

export interface LivroRecomendadoDisciplina {
  id: string;
  disciplina_id: string;
  disciplina_name: string;
  book_title: string;
  book_author?: string;
  book_url: string; // Link direto do Google Drive / PDF / Biblioteca Digital
  biblioteca_book_id?: string; // ID da obra correspondente no acervo da Biblioteca Digital
  is_mandatory?: boolean; // Indica se é uma leitura obrigatória do semestre
  category?: string;
  notes?: string; // Ex: "Capítulos 1 a 4 para a Prova AV1"
  added_by_name: string;
  added_by_role: UserRole;
  added_by_email?: string;
  created_at: string;
  in_library?: boolean; // True se existe no acervo de PDFs
  is_available?: boolean; // True se disponível para download
}

export type SupportMaterialType = 
  | 'anotacao'       // 📑 Anotações & Transcrições estruturadas (Google Docs / Gemini)
  | 'slide'          // 📊 Apresentações de Slides (Google Slides / PDF)
  | 'audio_podcast'  // 🎙️ Áudios & Podcasts de Resumo (NotebookLM / Deep Dive Audio)
  | 'video'          // 🎬 Vídeos & Clipes Explicativos (YouTube / Drive)
  | 'mapa_mental'    // 🧠 Mapas Mentais & Esquemas Visuais
  | 'guia_estudo';   // 📝 Guias de Estudo & Flashcards de Fixação

export interface GeminiNoteItem {
  id: string;
  disciplina_id: string;
  disciplina_name: string;
  aula_num?: number;
  data_aula?: string; // Ex: "18/08/2026"
  title: string; // Ex: "Resumo Estruturado Gemini • Patrística & Agostinho"
  gemini_url: string; // Link para Google Docs, NotebookLM, YouTube, Drive, etc.
  tipo?: SupportMaterialType; // Tipo do material de apoio
  summary_snippet?: string; // Principais tópicos abordados / síntese do material
  audio_url?: string; // URL direta de áudio/podcast gerado para player integrado
  video_url?: string; // URL de vídeo para player incorporado
  mindmap_data?: string; // Tópicos do mapa mental ou estrutura textual
  duration_formatted?: string; // Ex: "14:30" para áudios ou vídeos
  tags?: string[]; // Tags de busca e fixação
  author_name: string;
  author_role: 'professor' | 'monitor' | 'admin';
  author_email?: string;
  created_at: string;
}

export interface GravacaoAulaItem {
  id: string;
  disciplina_id: string;
  disciplina_name: string;
  aula_num?: number;
  data_aula: string; // Ex: "18/08/2026"
  title: string; // Ex: "Gravação HD • Aula 2: Introdução à Hermenêutica"
  video_url: string; // URL do Google Drive ou link de streaming
  drive_file_id?: string;
  duration_seconds?: number;
  duration_formatted?: string; // Ex: "01:45:20"
  recorded_by_name: string;
  recorded_by_role: 'professor' | 'monitor' | 'admin';
  recorded_by_email?: string;
  is_restricted_lms?: boolean; // Protegido e restrito ao LMS
  created_at: string;
}

export type TutorialAudience = 'todos' | 'aluno' | 'monitor' | 'professor';

export interface TutorialVideoItem {
  id: string;
  title: string;
  description: string;
  audience: TutorialAudience;
  category: string; // Ex: "Primeiros Passos", "Aulas Ao Vivo", "Estudos & IA", "Monitoria & Plantão", "Gestão Docente"
  duration: string; // Ex: "01:30"
  video_url: string; // Link do Google Drive, YouTube ou vídeo direto
  thumbnail_url?: string;
  topics: string[]; // Lista de tópicos abordados no tutorial
  script_summary?: string; // Roteiro / guia de locução sugerido
  order: number;
  author_name?: string;
  updated_at: string;
}

// =====================================================
// MÓDULO 1: RPG Pastoral Simulador
// =====================================================

export interface RpgSessao {
  id: string;
  titulo: string;
  descricao_contexto: string;
  disciplina_id: string;
  disciplina_name: string;
  sala_meet_id?: string;
  etiqueta_digital?: string;
  status: 'rascunho' | 'ativa' | 'encerrada';
  created_by_email: string;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
  papeis?: RpgPapel[];
}

export interface RpgPapel {
  id: string;
  sessao_id: string;
  nome_papel: string;
  stakeholder_tipo: 'personagem' | 'facilitador' | 'observador';
  descricao_publica?: string;
  instrucoes_secretas: string; // Nunca exposto para outros alunos
  objetivos_conflito: string;
  dicas_de_postura?: string;
  atribuido_a_email?: string;
  atribuido_a_nome?: string;
  created_at?: string;
}

export interface RpgFichaAluno {
  id: string;
  papel_id: string;
  sessao_id: string;
  aluno_email: string;
  aluno_nome?: string;
  status_participacao: 'pendente' | 'em_andamento' | 'concluido';
  reflexao_pos_simulacao?: string;
  auto_avaliacao_empatia?: number; // 1-5
  auto_avaliacao_argumentacao?: number; // 1-5
  created_at?: string;
  updated_at?: string;
  papel?: RpgPapel; // Join opcional
  sessao?: RpgSessao; // Join opcional
}

// =====================================================
// MÓDULO 2: Portfólio Mediador e Rubricas
// =====================================================

export type TipoArtefato = 'ensaio' | 'esboco_sermao' | 'audio' | 'video' | 'mapa_mental' | 'projeto' | 'reflexao' | 'outro';
export type StatusPortfolio = 'rascunho' | 'enviado' | 'avaliado' | 'revisao';
export type NivelDesempenho = 'insatisfatorio' | 'em_desenvolvimento' | 'proficiente' | 'excelente';

export interface PortfolioItem {
  id: string;
  aluno_email: string;
  aluno_nome?: string;
  disciplina_id: string;
  disciplina_name: string;
  titulo_artefato: string;
  descricao_artefato?: string;
  tipo_artefato: TipoArtefato;
  url_artefato_drive?: string;
  drive_file_id?: string;
  autoavaliacao_texto?: string;
  status: StatusPortfolio;
  semana_referencia?: number; // 1-16
  avaliacao_tipo: 'AV1' | 'AV2' | 'formativa' | 'recuperacao';
  nota_final?: number;
  created_at: string;
  updated_at?: string;
  rubricas?: RubricaFeedback[];
}

export interface RubricaFeedback {
  id: string;
  portfolio_id: string;
  criterio_nome: string;
  criterio_descricao?: string;
  nivel_desempenho?: NivelDesempenho;
  nota_atribuida: number; // 0-10
  peso_criterio?: number;
  feedback_qualitativo_tutor: string;
  monitor_email: string;
  monitor_nome?: string;
  created_at?: string;
  updated_at?: string;
}

// =====================================================
// MÓDULO 3: Modo de Avaliação Metacognitivo
// =====================================================

export type AssessmentMode = 'STRICT' | 'RESTRICTIVE_COMPENSATION' | 'SOFT_COMPENSATION';

export interface AssessmentModeConfig {
  mode: AssessmentMode;
  label: string;
  subtitle: string;
  description: string;
  impact_trilha: string;
  cor: string;
  cor_badge: string;
  requisitos: string[];
  recomendado_para: string;
  icone: string;
}

export interface AlunoMatricula {
  id: string;
  aluno_email: string;
  aluno_nome?: string;
  semester: string;
  turma_id?: string;
  assessment_mode: AssessmentMode;
  assessment_mode_justificativa?: string;
  assessment_mode_updated_at?: string;
  data_matricula?: string;
  status: 'ativo' | 'trancado' | 'concluido' | 'desistencia';
  created_at?: string;
}

export interface HistoricoAssessmentMode {
  id: string;
  aluno_email: string;
  aluno_nome?: string;
  modo_anterior?: AssessmentMode;
  modo_novo: AssessmentMode;
  justificativa?: string;
  semester: string;
  changed_at: string;
}

// =====================================================
// MÓDULO 4: Auditoria de Acessos & Telemetria (Analytics)
// =====================================================

export type DeviceType = 'desktop' | 'mobile' | 'tablet';

export interface UserSessionLog {
  id: string;
  user_email: string;
  user_name: string;
  user_role: UserRole;
  avatar_url?: string;
  device_type: DeviceType;
  browser: string;
  os: string;
  screen_resolution?: string;
  started_at: string;
  last_heartbeat_at: string;
  duration_seconds: number;
  is_active: boolean;
  page_views_count: number;
  events_count: number;
}

export type AnalyticsCategory = 
  | 'session'
  | 'navigation'
  | 'meet'
  | 'drive'
  | 'cornell_notes'
  | 'biblioteca'
  | 'portfolio'
  | 'rpg'
  | 'gravacoes'
  | 'checklist'
  | 'ajuda'
  | 'portal_academico'
  | 'metacognitivo';

export interface AnalyticsEvent {
  id: string;
  session_id?: string;
  user_email: string;
  user_name: string;
  user_role: UserRole;
  category: AnalyticsCategory;
  action: string;
  label?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface ModuleUsageStats {
  category: AnalyticsCategory;
  label: string;
  icon_name: string;
  total_events: number;
  unique_users: number;
  percentage: number;
  trend: 'up' | 'stable' | 'down';
}

export interface PeakHourStats {
  hour: number;
  label: string;
  count: number;
}

export interface WeekdayStats {
  day_index: number;
  day_name: string;
  count: number;
}

export interface DevelopmentInsight {
  id: string;
  type: 'feature_opportunity' | 'high_engagement' | 'low_adoption' | 'performance' | 'pedagogical';
  title: string;
  description: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  metric_value?: string;
}

export interface AnalyticsSummary {
  dau: number; // Daily Active Users
  wau: number; // Weekly Active Users
  mau: number; // Monthly Active Users
  total_sessions: number;
  total_events: number;
  avg_session_duration_minutes: number;
  active_users_now: number;
  role_breakdown: Record<UserRole, number>;
  device_breakdown: Record<DeviceType, number>;
  top_modules: ModuleUsageStats[];
  peak_hours: PeakHourStats[];
  peak_weekdays: WeekdayStats[];
  insights: DevelopmentInsight[];
  recent_sessions: UserSessionLog[];
  recent_events: AnalyticsEvent[];
}

// =========================================================================
// MÓDULO DE COLETA DE DADOS E PESQUISA EMPÍRICA DO TCC
// Pilares: Distância Transacional, Metodologias Ativas (RPG), Autodeterminação e Avaliação Mediadora
// =========================================================================

export type TCCPilarTCC = 
  | 'DISTANCIA_TRANSACIONAL' 
  | 'METODOLOGIAS_ATIVAS_RPG' 
  | 'AUTODETERMINACAO' 
  | 'AVALIACAO_MEDIADORA' 
  | 'GERAL';

export type TCCQuestionType = 'LIKERT_5' | 'MULTIPLA_ESCOLHA' | 'DISCURSIVA';

export interface TCCPesquisa {
  id: string;
  titulo: string;
  descricao?: string;
  alvo: 'ALUNO' | 'PROFESSOR' | 'AMBOS';
  ativa: boolean;
  pilar_principal?: TCCPilarTCC;
  criado_em: string;
  perguntas?: TCCPergunta[];
}

export interface TCCPergunta {
  id: string;
  pesquisa_id: string;
  ordem: number;
  texto_pergunta: string;
  pilar_tcc: TCCPilarTCC;
  tipo: TCCQuestionType;
  opcoes?: string[]; // Para múltipla escolha
  obrigatoria?: boolean;
  criado_em?: string;
}

export interface TCCResposta {
  id: string;
  pesquisa_id: string;
  pergunta_id: string;
  usuario_email: string;
  usuario_role: 'aluno' | 'professor' | 'monitor' | 'admin';
  resposta_escala?: number; // 1 a 5 (Likert)
  resposta_texto?: string;
  respondido_em: string;
}

export interface TCCQuestionStats {
  pergunta_id: string;
  texto_pergunta: string;
  pilar_tcc: TCCPilarTCC;
  tipo: TCCQuestionType;
  total_respostas: number;
  media_likert?: number; // Ex: 4.65
  desvio_padrao?: number;
  distribuicao_likert?: {
    1: number; // Discordo Totalmente
    2: number; // Discordo Parcialmente
    3: number; // Neutro / Indiferente
    4: number; // Concordo Parcialmente
    5: number; // Concordo Totalmente
  };
  respostas_discursivas?: string[];
}

export interface TCCPlatformMetrics {
  total_cornell_notes: number;
  total_rpg_sessions: number;
  total_rpg_fichas: number;
  avg_rubrica_feedback_hours: number;
  total_drive_access: number;
  total_meet_joins: number;
  total_unique_respondents: number;
  taxa_adesao_percent: number;
}

export interface TCCSurveyResult {
  pesquisa: TCCPesquisa;
  total_respondentes: number;
  perguntas_stats: TCCQuestionStats[];
  metricas_plataforma: TCCPlatformMetrics;
}

export interface TCCSubmitAnswerPayload {
  pesquisa_id: string;
  usuario_email: string;
  usuario_role: 'aluno' | 'professor' | 'monitor' | 'admin';
  respostas: Array<{
    pergunta_id: string;
    resposta_escala?: number;
    resposta_texto?: string;
  }>;
}

// =========================================================================
// SUÍTE DE INTERAÇÃO E COLABORAÇÃO DISCENTE (FÓRUNS, PRESENÇA, CHAT E ORAÇÃO)
// =========================================================================

export type ForumTipo = 'TEMATICO' | 'P_E_R' | 'LIVRE_KOINONIA';

export interface ForumTopico {
  id: string;
  disciplina_id: string;
  disciplina_nome?: string;
  autor_email: string;
  autor_nome: string;
  autor_role: 'aluno' | 'professor' | 'monitor' | 'admin';
  titulo: string;
  conteudo: string;
  tipo: ForumTipo;
  fixado?: boolean;
  criado_em: string;
  respostas_count?: number;
  respostas?: ForumResposta[];
  usuario_ja_respondeu?: boolean; // Para Fóruns P&R
}

export interface ForumResposta {
  id: string;
  topico_id: string;
  autor_email: string;
  autor_nome: string;
  autor_role: 'aluno' | 'professor' | 'monitor' | 'admin';
  conteudo: string;
  criado_em: string;
}

export interface DirectMessage {
  id: string;
  remetente_email: string;
  remetente_nome: string;
  destinatario_email: string;
  destinatario_nome: string;
  conteudo: string;
  lida: boolean;
  criado_em: string;
}

export interface OnlinePeer {
  email: string;
  nome: string;
  role: UserRole;
  avatar?: string;
  avatar_url?: string;
  ultimo_heartbeat: string;
  is_online: boolean;
}

export type OracaoCategoria = 'ORACAO' | 'GRATIDAO' | 'MISSAO';

export interface PedidoOracaoCard {
  id: string;
  autor_email: string;
  autor_nome: string;
  autor_cargo: string;
  categoria: OracaoCategoria;
  pedido_oracao: string;
  intercessores: string[]; // Lista de e-mails de quem clicou em "Estou Orando"
  criado_em: string;
}

// =========================================================================
// MÓDULO 5: TELE-PROXIMIDADE (LEARNING ANALYTICS ANTI-EVASÃO)
// Fundamentação Teórica: Tele-Social Presença (TSP) — Chryssa Themelis, 2022
// O sistema analisa silenciosamente a frequência de interações síncronas e
// assíncronas para identificar alunos em risco de isolamento e evasão.
// =========================================================================

export type NivelRiscoIsolamento = 'critico' | 'atencao' | 'monitorar' | 'engajado';

export interface PerfilEngajamentoAluno {
  aluno_email: string;
  aluno_nome: string;
  avatar_url?: string;
  nivel_risco: NivelRiscoIsolamento;
  score_engajamento: number; // 0-100 (composto de login + fórum + oração + meet/drive)
  ultima_sessao?: string;    // ISO timestamp da última sessão registrada
  dias_sem_login: number;
  total_eventos_7d: number;  // Eventos de telemetria nos últimos 7 dias
  total_forum_7d: number;    // Posts + respostas no fórum nos últimos 7 dias
  total_oracoes_7d: number;  // Pedidos + intercessões no mural nos últimos 7 dias
  total_meet_joins_7d: number; // Entradas no Google Meet nos últimos 7 dias
  ultima_atividade?: string; // ISO timestamp da última atividade registrada
  tendencia: 'melhorando' | 'estavel' | 'piorando'; // Comparando 7d vs 14d anteriores
}

export interface AlertaIsolamento {
  id: string;
  aluno_email: string;
  aluno_nome?: string;
  nivel_risco: NivelRiscoIsolamento;
  dias_sem_login: number;
  dias_sem_forum: number;
  dias_sem_oracao: number;
  score_engajamento: number;
  ultima_atividade?: string;
  professor_email?: string;  // Quem foi notificado / tomou ação
  acao_tomada?: string;      // Registro narrativo da ação pedagógica
  resolvido: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TeleProximidadeSummary {
  total_alunos_monitorados: number;
  alunos_criticos: number;
  alunos_atencao: number;
  alunos_monitorar: number;
  alunos_engajados: number;
  taxa_engajamento_geral: number; // Percentual (0-100)
  perfis: PerfilEngajamentoAluno[];
  alertas_abertos: AlertaIsolamento[];
}

// =========================================================================
// MÓDULO 6: TRILHA DE ENSINAGEM SOCRÁTICA — OS QUATRO Ds DE JESUS
// Fundamentação: Andragogia (Knowles, 1980) + Inov-Ativa (Moran, 2018)
// O ciclo socrático de Jesus: Desejo → Desestruturação → Desafio → Decisão
// =========================================================================

export type QuatrodsEstagio = 'd1_desejo' | 'd2_desestruturacao' | 'd3_desafio' | 'd4_decisao';

export interface QuatrodsTrilha {
  id: string;
  disciplina_id: string;
  disciplina_name?: string;
  titulo: string;             // Título da trilha (ex: "A Pesca Milagrosa")
  descricao?: string;         // Contexto geral
  professor_email: string;
  aula_referencia?: string;   // Ex: "Aula 3 — Hermenêutica Narrativa"
  publicado: boolean;
  // Estágios — 4 perguntas/desafios definidos pelo professor
  d1_titulo: string;          // Pergunta de Indagação (Desejo)
  d1_conteudo: string;
  d2_titulo: string;          // Paradoxo (Desestruturação)
  d2_conteudo: string;
  d3_titulo: string;          // Desafio prático
  d3_conteudo: string;
  d4_titulo: string;          // Pergunta de Comprometimento (Decisão)
  d4_conteudo: string;
  created_at: string;
  updated_at?: string;
}

export interface QuatrodsResposta {
  id: string;
  trilha_id: string;
  aluno_email: string;
  aluno_nome?: string;
  estagio: QuatrodsEstagio;
  conteudo: string;           // Resposta escrita do aluno
  completado: boolean;
  created_at: string;
}

export interface QuatrodsProgressoAluno {
  trilha_id: string;
  alunos_completaram_d1: number;
  alunos_completaram_d2: number;
  alunos_completaram_d3: number;
  alunos_completaram_d4: number;
  total_alunos: number;
  respostas: QuatrodsResposta[];
}

// =========================================================================
// MÓDULO 7: ESTÚDIO DE PRÁTICA HOMILÉTICA E ACONSELHAMENTO (PEER INSTRUCTION)
// Fundamentação: Peer Instruction (Eric Mazur) + Avaliação Mediadora (Hoffmann)
// =========================================================================

export type TipoPraticaHomiletica = 'homiletica' | 'aconselhamento' | 'devocional';
export type TipoMidiaPratica = 'audio' | 'video' | 'link_externo';
export type StatusPraticaHomiletica = 'rascunho' | 'publicado' | 'arquivado';

export interface PraticaHomiletica {
  id: string;
  aluno_email: string;
  aluno_nome: string;
  aluno_avatar?: string;
  disciplina_id: string;
  disciplina_name?: string;
  titulo: string;
  tipo_pratica: TipoPraticaHomiletica;
  texto_biblico?: string;
  esboco_resumo?: string;
  midia_tipo: TipoMidiaPratica;
  midia_url?: string;
  duracao_segundos: number;
  status: StatusPraticaHomiletica;
  created_at: string;
  updated_at?: string;
  // Campos calculados em runtime
  peer_reviews_count?: number;
  media_fidelidade?: number;
  media_comunicacao?: number;
  media_aplicacao?: number;
  media_geral_pares?: number;
  avaliacao_docente?: AvaliacaoDocenteHomiletica;
}

export interface PeerReviewHomiletica {
  id: string;
  pratica_id: string;
  revisor_email: string;
  revisor_nome: string;
  nota_fidelidade: number;      // 1 a 5 (Fidelidade Bíblica / Exegese)
  nota_comunicacao: number;     // 1 a 5 (Clareza & Comunicação / Oratória)
  nota_aplicacao: number;       // 1 a 5 (Aplicação Pastoral Contemporânea)
  ponto_forte?: string;
  oportunidade_melhoria?: string;
  comentario_geral: string;
  created_at: string;
}

export interface AvaliacaoDocenteHomiletica {
  id: string;
  pratica_id: string;
  avaliador_email: string;
  avaliador_nome: string;
  avaliador_role: string;
  nota_exegese: number;         // 0 a 10
  nota_estrutura: number;       // 0 a 10
  nota_postura: number;         // 0 a 10
  nota_final: number;           // Média ponderada
  feedback_mediador: string;
  created_at: string;
}

export interface ResumoEstatisticoHomiletica {
  total_praticas: number;
  total_peer_reviews: number;
  total_avaliacoes_docentes: number;
  media_geral_fidelidade: number;
  media_geral_comunicacao: number;
  media_geral_aplicacao: number;
  praticas_com_mais_reviews: PraticaHomiletica[];
}

// =========================================================================
// MÓDULO 8: AMBIENTES DE IMERSÃO 3D (O METAVERSO TEOLÓGICO)
// Fundamentação: Tele-Presença Espacial + Arqueologia Bíblica Imersiva
// =========================================================================

export type TipoModelo3D = 'webgl_nativo' | 'sketchfab_embed' | 'tour_360' | 'link_metaverso';

export interface Hotspot3D {
  id: string;
  titulo: string;
  texto_biblico?: string;
  nota_exegetica: string;
  coordenadas_x: number; // Porcentagem ou posição no modelo
  coordenadas_y: number;
}

export interface Missao3D {
  id: string;
  titulo: string;
  pergunta_desafio: string;
  hotspot_alvo_id: string;
  recompensa_pontos: number;
}

export interface Cenario3D {
  id: string;
  titulo: string;
  periodo_historico: string;
  disciplina_id: string;
  disciplina_name?: string;
  descricao: string;
  imagem_capa: string;
  modelo_tipo: TipoModelo3D;
  modelo_url: string;
  hotspots: Hotspot3D[];
  missoes: Missao3D[];
  created_at: string;
  updated_at?: string;
  // Runtime
  total_exploradores?: number;
  meu_progresso?: ProgressoExploracao3D;
}

export interface ProgressoExploracao3D {
  id: string;
  cenario_id: string;
  aluno_email: string;
  aluno_nome: string;
  hotspots_visitados: string[];
  missoes_completadas: string[];
  tempo_imersao_segundos: number;
  reflexao_aluno?: string;
  created_at: string;
  updated_at?: string;
}

export interface ResumoMetaversoTCC {
  total_cenarios: number;
  total_exploradores_unicos: number;
  tempo_total_imersao_minutos: number;
  total_missoes_concluidas: number;
  cenarios_mais_explorados: Cenario3D[];
}
