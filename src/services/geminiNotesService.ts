/**
 * geminiNotesService.ts
 * =========================================================================
 * Koinonia-LMS - Seminário Teológico
 * Módulo de Gestão de Materiais de Apoio & Gemini Notebook (NotebookLM)
 *
 * Suporta:
 * 1. Anotações Estruturadas & Transcrições (Google Docs / Gemini)
 * 2. Podcasts & Áudios de Resumo (NotebookLM / Deep Dive Audio)
 * 3. Mapas Mentais & Esquemas Visuais
 * 4. Apresentações de Slides (Google Slides / PDF)
 * 5. Vídeos & Clipes Explicativos (YouTube / Drive)
 * 6. Guias de Estudo & Flashcards de Fixação
 * =========================================================================
 */

import { GeminiNoteItem, SupportMaterialType } from '@/types';
import { supabase } from '@/lib/supabaseClient';

const STORAGE_KEY = 'lms_gemini_notes_v3';
const CLOUD_TITLE_KEY = 'lms_gemini_notes_cloud_v3';

export const SUPPORT_MATERIAL_CONFIG: Record<
  SupportMaterialType,
  { label: string; emoji: string; badgeColor: string; iconName: string; description: string }
> = {
  anotacao: {
    label: 'Anotações & Transcrição',
    emoji: '📑',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    iconName: 'FileText',
    description: 'Registro de transcrição e tópicos-chave gerados pelo Gemini durante a aula.',
  },
  audio_podcast: {
    label: 'Podcast / Áudio NotebookLM',
    emoji: '🎙️',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    iconName: 'Headphones',
    description: 'Resumo em áudio estilo podcast gerado pelo NotebookLM para estudo móvel.',
  },
  mapa_mental: {
    label: 'Mapa Mental & Esquema',
    emoji: '🧠',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconName: 'Network',
    description: 'Estrutura conceitual e tópicos conectados para memorização visual.',
  },
  slide: {
    label: 'Apresentação de Slides',
    emoji: '📊',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    iconName: 'Presentation',
    description: 'Lâminas e slides complementares da matéria.',
  },
  video: {
    label: 'Vídeo / Clipe Explicativo',
    emoji: '🎬',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    iconName: 'Video',
    description: 'Recorte em vídeo com explicações dos pontos mais complexos da aula.',
  },
  guia_estudo: {
    label: 'Guia de Estudo & Fixação',
    emoji: '📝',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    iconName: 'CheckSquare',
    description: 'Síntese executiva com questões e flashcards de auto-teste.',
  },
};

export const INITIAL_GEMINI_NOTES: GeminiNoteItem[] = [
  {
    id: "gemini-real-his-aula1",
    disciplina_id: "disc-1",
    disciplina_name: "História do Congregacionalismo",
    aula_num: 1,
    data_aula: "11/08/2026",
    title: "Anotações Gemini • Aula 1 • História do Congregacionalismo",
    gemini_url: "/gemini-notes/his_aula1_2026-08-11.pdf",
    tipo: "anotacao",
    summary_snippet: "ago. 11, 2026 História do Congregacionalismo - Profº Ary Júnior Anexos História do Congregacionalismo - Profº Ary Júnior Registros da reunião Gravação Resumo O encontro estabeleceu o planejamento pedagógico sobre a história do congregacionalismo e iniciou os estudos sobre o purit",
    tags: ["História do Congregacionalismo","Aula 1","Anotações Gemini"],
    author_name: "Profº Ary Júnior",
    author_role: "professor",
    created_at: "2026-08-11T18:47:00Z",
  },
  {
    id: "gemini-real-his-aula2",
    disciplina_id: "disc-1",
    disciplina_name: "História do Congregacionalismo",
    aula_num: 2,
    data_aula: "18/08/2026",
    title: "Anotações Gemini • Aula 2 • História do Congregacionalismo",
    gemini_url: "/gemini-notes/his_aula2_2026-08-18.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações ago. 18, 2026 História do Congregacionalismo - Profº Ary Júnior Anexos História do Congregacionalismo - Profº Ary Júnior Registros da reunião Transcrição Gravação Resumo O encontro estabeleceu diretrizes da disciplina e debateu fundamentos eclesiológicos histórico",
    tags: ["História do Congregacionalismo","Aula 2","Anotações Gemini"],
    author_name: "Profº Ary Júnior",
    author_role: "professor",
    created_at: "2026-08-18T18:44:00Z",
  },
  {
    id: "gemini-pod-1",
    disciplina_id: "disc-1",
    disciplina_name: "História do Congregacionalismo",
    aula_num: 2,
    data_aula: "18/08/2026",
    title: "Podcast NotebookLM • Aula 2 • Origens do Movimento no Brasil & Robert Kalley",
    gemini_url: "https://notebooklm.google.com/",
    tipo: "audio_podcast",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration_formatted: "12:45",
    summary_snippet: "Episódio em áudio gerado pelo NotebookLM analisando a chegada do Dr. Robert Reid Kalley ao Rio de Janeiro em 1855, a fundação da Igreja Evangélica Fluminense e o impacto na liberdade religiosa brasileira.",
    tags: ["Podcast","Robert Kalley","1855","Igreja Fluminense"],
    author_name: "Profº Hilário Bispo",
    author_role: "professor",
    created_at: "2026-08-18T23:15:00Z",
  },
  {
    id: "gemini-real-his-aula3",
    disciplina_id: "disc-1",
    disciplina_name: "História do Congregacionalismo",
    aula_num: 3,
    data_aula: "25/08/2026",
    title: "Anotações Gemini • Aula 3 • História do Congregacionalismo",
    gemini_url: "/gemini-notes/his_aula3_2026-08-25.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações ago. 25, 2026 História do Congregacionalismo - Profº Ary Júnior Anexos História do Congregacionalismo - Profº Ary Júnior Registros da reunião Transcrição Gravação Resumo Sessão explorou origens do congregacionalismo e teologia sobre a governança eclesiástica via p",
    tags: ["História do Congregacionalismo","Aula 3","Anotações Gemini"],
    author_name: "Profº Ary Júnior",
    author_role: "professor",
    created_at: "2026-08-25T18:57:00Z",
  },
  {
    id: "gemini-map-1",
    disciplina_id: "disc-1",
    disciplina_name: "História do Congregacionalismo",
    aula_num: 3,
    data_aula: "25/08/2026",
    title: "Mapa Mental Gemini • Eclesiologia & Autonomia Local",
    gemini_url: "https://docs.google.com/document/d/1fhM5sjh1-cpa8MHVSXvSqBgWHUmqqWhGHcn9dTq79rU/edit",
    tipo: "mapa_mental",
    mindmap_data: "• Eclesiologia Bíblica\n  ├── Autonomia da Igreja Local\n  │     ├── Governo sob o Senhorio de Cristo\n  │     └── Voto e decisão em Assembleia soberana\n  ├── Comunhão Intereclesiástica (UIECB)\n  │     ├── Fraternidade mútua\n  │     └── Cooperação missionária e educacional\n  └── Ministério Pastoral e Diaconal\n        ├── Ordenação e reconhecimento\n        └── Serviço à comunidade",
    summary_snippet: "Esquema visual sintetizando a relação entre a autonomia da igreja local e a cooperação fraternal entre congregações da UIECB.",
    tags: ["Eclesiologia","Governo Congregacional","Mapa Mental"],
    author_name: "Monitoria Oficial",
    author_role: "monitor",
    created_at: "2026-08-25T22:30:00Z",
  },
  {
    id: "gemini-real-his-aula4",
    disciplina_id: "disc-1",
    disciplina_name: "História do Congregacionalismo",
    aula_num: 4,
    data_aula: "01/09/2026",
    title: "Anotações Gemini • Aula 4 • História do Congregacionalismo",
    gemini_url: "/gemini-notes/his_aula4_2026-09-01.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações set. 1, 2026 História do Congregacionalismo - Profº Ary Júnior Anexos História do Congregacionalismo - Profº Ary Júnior Anotações do Gemini Registros da reunião (Algumas gravações estão indisponíveis) Transcrição Resumo A aula abordou a história do congregacionali",
    tags: ["História do Congregacionalismo","Aula 4","Anotações Gemini"],
    author_name: "Profº Ary Júnior",
    author_role: "professor",
    created_at: "2026-09-01T18:53:00Z",
  },
  {
    id: "gemini-real-hpc-aula1",
    disciplina_id: "disc-2",
    disciplina_name: "História do Pensamento Cristão II",
    aula_num: 1,
    data_aula: "11/08/2026",
    title: "Anotações Gemini • Aula 1 • História do Pensamento Cristão II",
    gemini_url: "/gemini-notes/hpc_aula1_2026-08-11.pdf",
    tipo: "anotacao",
    summary_snippet: "ago. 11, 2026 História do Pensamento Cristão II - Profº Hilário Bispo Anexos História do Pensamento Cristão II - Profº Hilário Bispo Registros da reunião Gravação Resumo A disciplina de História do Pensamento Cristão apresentou diretrizes avaliativas e a centralidade das confissõ",
    tags: ["História do Pensamento Cristão II","Aula 1","Anotações Gemini"],
    author_name: "Profº Hilário Bispo",
    author_role: "professor",
    created_at: "2026-08-11T20:29:00Z",
  },
  {
    id: "gemini-real-hpc-aula1-p2",
    disciplina_id: "disc-2",
    disciplina_name: "História do Pensamento Cristão II",
    aula_num: 1,
    data_aula: "11/08/2026",
    title: "Anotações Gemini • Aula 1 (Parte 2) • História do Pensamento Cristão II",
    gemini_url: "/gemini-notes/hpc_aula1_p2_2026-08-11.pdf",
    tipo: "anotacao",
    summary_snippet: "ago. 12, 2026 História do Pensamento Cristão II - Profº Hilário Bispo Anexos História do Pensamento Cristão II - Profº Hilário Bispo Resumo Problemas técnicos na plataforma interromperam o debate doutrinário e a organização acadêmica dos estágios obrigatórios. Falhas técnicas na ",
    tags: ["História do Pensamento Cristão II","Aula 1","Anotações Gemini"],
    author_name: "Profº Hilário Bispo",
    author_role: "professor",
    created_at: "2026-08-11T21:47:00Z",
  },
  {
    id: "gemini-real-hpc-aula2",
    disciplina_id: "disc-2",
    disciplina_name: "História do Pensamento Cristão II",
    aula_num: 2,
    data_aula: "18/08/2026",
    title: "Anotações Gemini • Aula 2 • História do Pensamento Cristão II",
    gemini_url: "/gemini-notes/hpc_aula2_2026-08-18.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações ago. 18, 2026 História do Pensamento Cristão II - Profº Hilário Bispo Anexos História do Pensamento Cristão II - Profº Hilário Bispo Registros da reunião Transcrição Gravação Resumo Reunião de capacitação teológica discutiu fundamentos da Reforma Protestante e est",
    tags: ["História do Pensamento Cristão II","Aula 2","Anotações Gemini"],
    author_name: "Profº Hilário Bispo",
    author_role: "professor",
    created_at: "2026-08-18T20:23:00Z",
  },
  {
    id: "gemini-pod-2",
    disciplina_id: "disc-2",
    disciplina_name: "História do Pensamento Cristão II",
    aula_num: 2,
    data_aula: "18/08/2026",
    title: "Podcast NotebookLM • Aula 2 • João Calvino & As Institutas",
    gemini_url: "https://notebooklm.google.com/",
    tipo: "audio_podcast",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration_formatted: "15:20",
    summary_snippet: "Debate em áudio entre duas vozes sintetizando a estrutura das Institutas de Calvino: o duplo conhecimento (de Deus e de nós mesmos), Providência, Cristologia e Pacto da Graça.",
    tags: ["Calvino","Institutas","Pacto","Podcast"],
    author_name: "Profº Hilário Bispo",
    author_role: "professor",
    created_at: "2026-08-18T23:30:00Z",
  },
  {
    id: "gemini-real-hpc-aula3",
    disciplina_id: "disc-2",
    disciplina_name: "História do Pensamento Cristão II",
    aula_num: 3,
    data_aula: "25/08/2026",
    title: "Anotações Gemini • Aula 3 • História do Pensamento Cristão II",
    gemini_url: "/gemini-notes/hpc_aula3_2026-08-25.pdf",
    tipo: "anotacao",
    summary_snippet: "ago. 25, 2026 História do Pensamento Cristão II - Profº Hilário Bispo Anexos História do Pensamento Cristão II - Profº Hilário Bispo Registros da reunião Gravação Resumo Aula sobre teologia reformada abordou fundamentos históricos, disputas doutrinárias e a centralidade da pregaç",
    tags: ["História do Pensamento Cristão II","Aula 3","Anotações Gemini"],
    author_name: "Profº Hilário Bispo",
    author_role: "professor",
    created_at: "2026-08-25T20:27:00Z",
  },
  {
    id: "gemini-map-2",
    disciplina_id: "disc-2",
    disciplina_name: "História do Pensamento Cristão II",
    aula_num: 3,
    data_aula: "25/08/2026",
    title: "Mapa Mental • Sínodo de Dort & Teologia Reformada",
    gemini_url: "https://docs.google.com/document/d/1rbxmWGKYrRVOsHOu-XA0_7zKQajRT3IuKPbsUVH6nuY/edit",
    tipo: "mapa_mental",
    mindmap_data: "• Cânones de Dort (1618–1619)\n  ├── Depravação Total (Incapacidade humana)\n  ├── Eleição Incondicional (Graça soberana)\n  ├── Expiação Limitada/Específica (Eficácia redentora)\n  ├── Graça Irresistível (Chamado eficaz do Espírito)\n  └── Perseverança dos Santos (Segurança eterna em Cristo)",
    summary_snippet: "Visão panorâmica dos 5 pontos de Dort e o confronto teológico com a Remonstrância Arminiana.",
    tags: ["Dort","TULIP","Graça Soberana"],
    author_name: "Monitoria Oficial",
    author_role: "monitor",
    created_at: "2026-08-25T23:00:00Z",
  },
  {
    id: "gemini-real-hpc-aula4",
    disciplina_id: "disc-2",
    disciplina_name: "História do Pensamento Cristão II",
    aula_num: 4,
    data_aula: "01/09/2026",
    title: "Anotações Gemini • Aula 4 • História do Pensamento Cristão II",
    gemini_url: "/gemini-notes/hpc_aula4_2026-09-01.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações set. 1, 2026 História do Pensamento Cristão II - Profº Hilário Bispo Anexos História do Pensamento Cristão II - Profº Hilário Bispo Registros da reunião Transcrição Gravação Resumo A aula abordou a história dos reformadores, as controvérsias teológicas entre calvi",
    tags: ["História do Pensamento Cristão II","Aula 4","Anotações Gemini"],
    author_name: "Profº Hilário Bispo",
    author_role: "professor",
    created_at: "2026-09-01T20:24:00Z",
  },
  {
    id: "gemini-real-acon-aula1",
    disciplina_id: "disc-3",
    disciplina_name: "Aconselhamento Bíblico II",
    aula_num: 1,
    data_aula: "12/08/2026",
    title: "Anotações Gemini • Aula 1 • Aconselhamento Bíblico II",
    gemini_url: "/gemini-notes/acon_aula1_2026-08-12.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações ago. 12, 2026 Aconselhamento Bíblico II - Profº Uilian Santos Anexos Aconselhamento Bíblico II - Profº Uilian Santos Registros da reunião Transcrição Gravação Resumo A aula discutiu a suficiência das Escrituras no aconselhamento cristão comparada à necessidade de ",
    tags: ["Aconselhamento Bíblico II","Aula 1","Anotações Gemini"],
    author_name: "Profº Uilian Santos",
    author_role: "professor",
    created_at: "2026-08-12T18:44:00Z",
  },
  {
    id: "gemini-real-acon-aula2",
    disciplina_id: "disc-3",
    disciplina_name: "Aconselhamento Bíblico II",
    aula_num: 2,
    data_aula: "19/08/2026",
    title: "Anotações Gemini • Aula 2 • Aconselhamento Bíblico II",
    gemini_url: "/gemini-notes/acon_aula2_2026-08-19.pdf",
    tipo: "anotacao",
    summary_snippet: "ago. 19, 2026 Aconselhamento Bíblico II - Profº Uilian Santos Anexos Aconselhamento Bíblico II - Profº Uilian Santos Registros da reunião Gravação Resumo O debate revisou princípios de aconselhamento bíblico e a postura empática ideal através do livro de Jó. Fundamentos do aconse",
    tags: ["Aconselhamento Bíblico II","Aula 2","Anotações Gemini"],
    author_name: "Profº Uilian Santos",
    author_role: "professor",
    created_at: "2026-08-19T18:49:00Z",
  },
  {
    id: "gemini-pod-3",
    disciplina_id: "disc-3",
    disciplina_name: "Aconselhamento Bíblico II",
    aula_num: 2,
    data_aula: "19/08/2026",
    title: "Podcast NotebookLM • Aula 2 • Depressão, Ansiedade & Aconselhamento Pastoral",
    gemini_url: "https://notebooklm.google.com/",
    tipo: "audio_podcast",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration_formatted: "14:10",
    summary_snippet: "Áudio imersivo do NotebookLM abordando a abordagem holística cristã: distinção entre causas orgânicas/físicas e lutas espirituais/emocionais, e o cuidado amoroso na mentoria cristã.",
    tags: ["Ansiedade","Depressão","Cuidado Pastoral","Podcast"],
    author_name: "Profº Hilário Bispo",
    author_role: "professor",
    created_at: "2026-08-19T22:45:00Z",
  },
  {
    id: "gemini-real-acon-aula3",
    disciplina_id: "disc-3",
    disciplina_name: "Aconselhamento Bíblico II",
    aula_num: 3,
    data_aula: "26/08/2026",
    title: "Anotações Gemini • Aula 3 • Aconselhamento Bíblico II",
    gemini_url: "/gemini-notes/acon_aula3_2026-08-26.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações ago. 26, 2026 Aconselhamento Bíblico II - Profº Uilian Santos Anexos Aconselhamento Bíblico II - Profº Uilian Santos Registros da reunião Transcrição Gravação Resumo A aula revisou fundamentos do aconselhamento bíblico centralizando Deus e a autoridade das Escritu",
    tags: ["Aconselhamento Bíblico II","Aula 3","Anotações Gemini"],
    author_name: "Profº Uilian Santos",
    author_role: "professor",
    created_at: "2026-08-26T18:55:00Z",
  },
  {
    id: "gemini-real-acon-aula4",
    disciplina_id: "disc-3",
    disciplina_name: "Aconselhamento Bíblico II",
    aula_num: 4,
    data_aula: "02/09/2026",
    title: "Anotações Gemini • Aula 4 • Aconselhamento Bíblico II",
    gemini_url: "/gemini-notes/acon_aula4_2026-09-02.pdf",
    tipo: "anotacao",
    summary_snippet: "set. 2, 2026 Aconselhamento Bíblico II - Profº Uilian Santos Anexos Aconselhamento Bíblico II - Profº Uilian Santos Registros da reunião Gravação Resumo Debates sobre teodiceia exploraram causas do sofrimento humano com reflexões bíblicas acerca da soberania divina e esperança. C",
    tags: ["Aconselhamento Bíblico II","Aula 4","Anotações Gemini"],
    author_name: "Profº Uilian Santos",
    author_role: "professor",
    created_at: "2026-09-02T18:55:00Z",
  },
  {
    id: "gemini-real-acon-aula5",
    disciplina_id: "disc-3",
    disciplina_name: "Aconselhamento Bíblico II",
    aula_num: 5,
    data_aula: "09/09/2026",
    title: "Anotações Gemini • Aula 5 • Aconselhamento Bíblico II",
    gemini_url: "/gemini-notes/acon_aula5_2026-09-09.pdf",
    tipo: "anotacao",
    summary_snippet: "set. 9, 2026 Aconselhamento Bíblico II - Profº Uilian Santos Anexos Aconselhamento Bíblico II - Profº Uilian Santos Registros da reunião Gravação Resumo Reunião de aconselhamento bíblico debateu princípios práticos e saúde física. Calendário acadêmico e aconselhamento Informou da",
    tags: ["Aconselhamento Bíblico II","Aula 5","Anotações Gemini"],
    author_name: "Profº Uilian Santos",
    author_role: "professor",
    created_at: "2026-09-09T18:53:00Z",
  },
  {
    id: "gemini-real-dh-aula1",
    disciplina_id: "disc-4",
    disciplina_name: "Direitos Humanos",
    aula_num: 1,
    data_aula: "12/08/2026",
    title: "Anotações Gemini • Aula 1 • Direitos Humanos",
    gemini_url: "/gemini-notes/dh_aula1_2026-08-12.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações ago. 12, 2026 Direitos Humanos - Profº Cleiton Barbirato Anexos Direitos Humanos - Profº Cleiton Barbirato Registros da reunião Transcrição Gravação Resumo A aula abordou critérios avaliativos e debateu a natureza humana e a função social da igreja cristã. Estrutu",
    tags: ["Direitos Humanos","Aula 1","Anotações Gemini"],
    author_name: "Profº Cleiton Barbirato",
    author_role: "professor",
    created_at: "2026-08-12T20:22:00Z",
  },
  {
    id: "gemini-real-dh-aula2",
    disciplina_id: "disc-4",
    disciplina_name: "Direitos Humanos",
    aula_num: 2,
    data_aula: "19/08/2026",
    title: "Anotações Gemini • Aula 2 • Direitos Humanos",
    gemini_url: "/gemini-notes/dh_aula2_2026-08-19.pdf",
    tipo: "anotacao",
    summary_snippet: "ago. 19, 2026 Direitos Humanos - Profº Cleiton Barbirato Anexos Direitos Humanos - Profº Cleiton Barbirato Registros da reunião Gravação Resumo A discussão explorou a fé cristã e direitos humanos, analisando tensões jurídicas, abusos judiciários e sistemas políticos. Fé e Direito",
    tags: ["Direitos Humanos","Aula 2","Anotações Gemini"],
    author_name: "Profº Cleiton Barbirato",
    author_role: "professor",
    created_at: "2026-08-19T20:11:00Z",
  },
  {
    id: "gemini-guia-4",
    disciplina_id: "disc-4",
    disciplina_name: "Direitos Humanos",
    aula_num: 2,
    data_aula: "19/08/2026",
    title: "Guia de Estudo & Flashcards • Gerações de Direitos & Justiça Bíblica",
    gemini_url: "https://docs.google.com/document/d/1eelDiEw9B4mcCW0lxf9L26zjWpCBmnzQCXRp5TcUSRs/edit",
    tipo: "guia_estudo",
    summary_snippet: "Guia de fixação com 8 questões socráticas comparando as 3 gerações de Direitos Humanos (Liberdade, Igualdade, Fraternidade) com os princípios de justiça distributiva dos profetas do AT.",
    tags: ["Guia de Estudo","Gerações de Direitos","Profetas"],
    author_name: "Profº David Bezerra",
    author_role: "professor",
    created_at: "2026-08-19T23:15:00Z",
  },
  {
    id: "gemini-real-dh-aula3",
    disciplina_id: "disc-4",
    disciplina_name: "Direitos Humanos",
    aula_num: 3,
    data_aula: "26/08/2026",
    title: "Anotações Gemini • Aula 3 • Direitos Humanos",
    gemini_url: "/gemini-notes/dh_aula3_2026-08-26.pdf",
    tipo: "anotacao",
    summary_snippet: "ago. 26, 2026 Direitos Humanos - Profº Cleiton Barbirato Anexos Direitos Humanos - Profº Cleiton Barbirato Registros da reunião Gravação Resumo Discussão sobre fundamentos bíblicos e jurídicos dos direitos humanos, dignidade inalienável e a aplicação prática da equidade. Fundamen",
    tags: ["Direitos Humanos","Aula 3","Anotações Gemini"],
    author_name: "Profº Cleiton Barbirato",
    author_role: "professor",
    created_at: "2026-08-26T20:20:00Z",
  },
  {
    id: "gemini-real-dh-aula4",
    disciplina_id: "disc-4",
    disciplina_name: "Direitos Humanos",
    aula_num: 4,
    data_aula: "02/09/2026",
    title: "Anotações Gemini • Aula 4 • Direitos Humanos",
    gemini_url: "/gemini-notes/dh_aula4_2026-09-02.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações set. 2, 2026 Direitos Humanos - Profº Cleiton Barbirato Anexos Direitos Humanos - Profº Cleiton Barbirato Registros da reunião Transcrição Gravação Resumo A sessão explorou fundamentos dos direitos humanos e estruturas legais brasileiras finalizando com orientaçõe",
    tags: ["Direitos Humanos","Aula 4","Anotações Gemini"],
    author_name: "Profº Cleiton Barbirato",
    author_role: "professor",
    created_at: "2026-09-02T20:08:00Z",
  },
  {
    id: "gemini-real-dh-aula5",
    disciplina_id: "disc-4",
    disciplina_name: "Direitos Humanos",
    aula_num: 5,
    data_aula: "09/09/2026",
    title: "Anotações Gemini • Aula 5 • Direitos Humanos",
    gemini_url: "/gemini-notes/dh_aula5_2026-09-09.pdf",
    tipo: "anotacao",
    summary_snippet: "set. 9, 2026 Direitos Humanos - Profº Cleiton Barbirato Anexos Direitos Humanos - Profº Cleiton Barbirato Registros da reunião Gravação Resumo Estudo do jusnaturalismo explorou direitos fundamentais e o debate ético sobre o aborto Origens do jusnaturalismo Apresentação abordou co",
    tags: ["Direitos Humanos","Aula 5","Anotações Gemini"],
    author_name: "Profº Cleiton Barbirato",
    author_role: "professor",
    created_at: "2026-09-09T20:16:00Z",
  },
  {
    id: "gemini-real-eti-aula1",
    disciplina_id: "disc-5",
    disciplina_name: "Ética Cristã",
    aula_num: 1,
    data_aula: "13/08/2026",
    title: "Anotações Gemini • Aula 1 • Ética Cristã",
    gemini_url: "/gemini-notes/eti_aula1_2026-08-13.pdf",
    tipo: "anotacao",
    summary_snippet: "Ética Cristã - Profª Karoline Eva ngelista ago. 13, 2026 Anexos Ética Cristã - Profª Karoline Evangelista Registros da reunião Gravação Resumo A sessão estruturou o programa de Ética Cristã e analisou correntes filosóficas mediante dilemas morais fundamentais. Organização e cron",
    tags: ["Ética Cristã","Aula 1","Anotações Gemini"],
    author_name: "Profª Karoline Evangelista",
    author_role: "professor",
    created_at: "2026-08-13T18:56:00Z",
  },
  {
    id: "gemini-real-eti-aula2",
    disciplina_id: "disc-5",
    disciplina_name: "Ética Cristã",
    aula_num: 2,
    data_aula: "20/08/2026",
    title: "Anotações Gemini • Aula 2 • Ética Cristã",
    gemini_url: "/gemini-notes/eti_aula2_2026-08-20.pdf",
    tipo: "anotacao",
    summary_snippet: "ago. 20, 2026 Ética Cristã - Profª Karoline Evangelista Anexos Ética Cristã - Profª Karoline Evangelista Registros da reunião Gravação Resumo A reunião organizou grupos para seminários sobre os 10 mandamentos e debateu modelos de absolutismo ético cristão. Organização dos grupos ",
    tags: ["Ética Cristã","Aula 2","Anotações Gemini"],
    author_name: "Profª Karoline Evangelista",
    author_role: "professor",
    created_at: "2026-08-20T18:57:00Z",
  },
  {
    id: "gemini-map-5",
    disciplina_id: "disc-5",
    disciplina_name: "Ética Cristã",
    aula_num: 2,
    data_aula: "20/08/2026",
    title: "Mapa Mental • Dilemas Éticos & Tomada de Decisão Pastoral",
    gemini_url: "https://docs.google.com/document/d/1sktGHfbZHCqlmd_Bh4xbmyIZGWf7iMzlA67KyGFRBHc/edit",
    tipo: "mapa_mental",
    mindmap_data: "• Tomada de Decisão Cristã\n  ├── Critério Normativo (A Palavra de Deus)\n  ├── Critério Situacional (O contexto e o próximo)\n  └── Critério Existencial (A integridade do coração regenerado)",
    summary_snippet: "Modelo triperspectival de John Frame aplicado à resolução de conflitos éticos no ministério pastoral.",
    tags: ["Triperspectivismo","John Frame","Mapa Mental"],
    author_name: "Monitoria Oficial",
    author_role: "monitor",
    created_at: "2026-08-20T23:00:00Z",
  },
  {
    id: "gemini-real-eti-aula3",
    disciplina_id: "disc-5",
    disciplina_name: "Ética Cristã",
    aula_num: 3,
    data_aula: "27/08/2026",
    title: "Anotações Gemini • Aula 3 • Ética Cristã",
    gemini_url: "/gemini-notes/eti_aula3_2026-08-27.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações ago. 27, 2026 Ética Cristã - Profª Karoline Evangelista Anexos Ética Cristã - Profª Karoline Evangelista Registros da reunião Transcrição Gravação Resumo O encontro definiu critérios avaliativos e debateu a falibilidade de cosmovisões éticas perante o fundamento c",
    tags: ["Ética Cristã","Aula 3","Anotações Gemini"],
    author_name: "Profª Karoline Evangelista",
    author_role: "professor",
    created_at: "2026-08-27T18:55:00Z",
  },
  {
    id: "gemini-real-eti-aula4",
    disciplina_id: "disc-5",
    disciplina_name: "Ética Cristã",
    aula_num: 4,
    data_aula: "03/09/2026",
    title: "Anotações Gemini • Aula 4 • Ética Cristã",
    gemini_url: "/gemini-notes/eti_aula4_2026-09-03.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações set. 3, 2026 Ética Cristã - Profª Karoline Evangelista Anexos Ética Cristã - Profª Karoline Evangelista Registros da reunião Transcrição Gravação Resumo Discussão ética cristã sobre aborto e a responsabilidade da igreja na assistência social e acolhimento comunitá",
    tags: ["Ética Cristã","Aula 4","Anotações Gemini"],
    author_name: "Profª Karoline Evangelista",
    author_role: "professor",
    created_at: "2026-09-03T18:54:00Z",
  },
  {
    id: "gemini-real-nt3-aula1",
    disciplina_id: "disc-6",
    disciplina_name: "Novo Testamento III - Epístolas Gerais",
    aula_num: 1,
    data_aula: "13/08/2026",
    title: "Anotações Gemini • Aula 1 • Novo Testamento III - Epístolas Gerais",
    gemini_url: "/gemini-notes/nt3_aula1_2026-08-13.pdf",
    tipo: "anotacao",
    summary_snippet: "ago. 13, 2026 Novo Testamento III - Epístolas Gerais - Profº Marcio Leal Anexos Novo Testamento III - Epístolas Gerais - Profº Marcio Leal Registros da reunião Gravação Resumo A aula estabeleceu diretrizes metodológicas e explorou debates históricos sobre a autoria da Epístola ao",
    tags: ["Novo Testamento III - Epístolas Gerais","Aula 1","Anotações Gemini"],
    author_name: "Profº Marcio Leal",
    author_role: "professor",
    created_at: "2026-08-13T20:22:00Z",
  },
  {
    id: "gemini-real-nt3-aula2",
    disciplina_id: "disc-6",
    disciplina_name: "Novo Testamento III - Epístolas Gerais",
    aula_num: 2,
    data_aula: "20/08/2026",
    title: "Anotações Gemini • Aula 2 • Novo Testamento III - Epístolas Gerais",
    gemini_url: "/gemini-notes/nt3_aula2_2026-08-20.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações ago. 20, 2026 Novo Testamento III - Epístolas Gerais - Profº Marcio Leal Anexos Novo Testamento III - Epístolas Gerais - Profº Marcio Leal Registros da reunião Transcrição Gravação Resumo O encontro estabeleceu diretrizes disciplinares e explorou questões acadêmic",
    tags: ["Novo Testamento III - Epístolas Gerais","Aula 2","Anotações Gemini"],
    author_name: "Profº Marcio Leal",
    author_role: "professor",
    created_at: "2026-08-20T20:31:00Z",
  },
  {
    id: "gemini-pod-6",
    disciplina_id: "disc-6",
    disciplina_name: "Novo Testamento III - Epístolas Gerais",
    aula_num: 2,
    data_aula: "20/08/2026",
    title: "Podcast NotebookLM • Aula 2 • Tiago & A Fé Viva em Ação",
    gemini_url: "https://notebooklm.google.com/",
    tipo: "audio_podcast",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration_formatted: "11:50",
    summary_snippet: "Síntese em áudio: a harmonia entre a justificação pela fé de Paulo e a justificação pelas obras/frutos em Tiago.",
    tags: ["Tiago","Fé e Obras","Podcast"],
    author_name: "Profº Hilário Bispo",
    author_role: "professor",
    created_at: "2026-08-20T23:30:00Z",
  },
  {
    id: "gemini-real-nt3-aula3",
    disciplina_id: "disc-6",
    disciplina_name: "Novo Testamento III - Epístolas Gerais",
    aula_num: 3,
    data_aula: "27/08/2026",
    title: "Anotações Gemini • Aula 3 • Novo Testamento III - Epístolas Gerais",
    gemini_url: "/gemini-notes/nt3_aula3_2026-08-27.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações ago. 27, 2026 Novo Testamento III - Epístolas Gerais - Profº Marcio Leal Anexos Novo Testamento III - Epístolas Gerais - Profº Marcio Leal Registros da reunião Transcrição Gravação Resumo A aula analisou a Epístola aos Hebreus focando na maturidade cristã e introd",
    tags: ["Novo Testamento III - Epístolas Gerais","Aula 3","Anotações Gemini"],
    author_name: "Profº Marcio Leal",
    author_role: "professor",
    created_at: "2026-08-27T20:23:00Z",
  },
  {
    id: "gemini-real-nt3-aula4",
    disciplina_id: "disc-6",
    disciplina_name: "Novo Testamento III - Epístolas Gerais",
    aula_num: 4,
    data_aula: "03/09/2026",
    title: "Anotações Gemini • Aula 4 • Novo Testamento III - Epístolas Gerais",
    gemini_url: "/gemini-notes/nt3_aula4_2026-09-03.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações set. 3, 2026 Novo Testamento III - Epístolas Gerais - Profº Marcio Leal Anexos Novo Testamento III - Epístolas Gerais - Profº Marcio Leal Registros da reunião Transcrição Resumo A aula foi cancelada devido a falhas técnicas, enquanto participantes discutiram trajet",
    tags: ["Novo Testamento III - Epístolas Gerais","Aula 4","Anotações Gemini"],
    author_name: "Profº Marcio Leal",
    author_role: "professor",
    created_at: "2026-09-03T20:28:00Z",
  },
  {
    id: "gemini-real-pri-aula1",
    disciplina_id: "disc-7",
    disciplina_name: "Plantação e Revitalização de Igrejas II",
    aula_num: 1,
    data_aula: "14/08/2026",
    title: "Anotações Gemini • Aula 1 • Plantação e Revitalização de Igrejas II",
    gemini_url: "/gemini-notes/pri_aula1_2026-08-14.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações ago. 14, 2026 Plantação e Revitalização de Igrejas II - Profº Thácyto Lessa Anexos Plantação e Revitalização de Igrejas II - Profº Thácyto Lessa Registros da reunião Transcrição Gravação Resumo A sessão definiu diretrizes para a disciplina de revitalização de igre",
    tags: ["Plantação e Revitalização de Igrejas II","Aula 1","Anotações Gemini"],
    author_name: "Profº Thácyto Lessa",
    author_role: "professor",
    created_at: "2026-08-14T18:37:00Z",
  },
  {
    id: "gemini-real-pri-aula2",
    disciplina_id: "disc-7",
    disciplina_name: "Plantação e Revitalização de Igrejas II",
    aula_num: 2,
    data_aula: "21/08/2026",
    title: "Anotações Gemini • Aula 2 • Plantação e Revitalização de Igrejas II",
    gemini_url: "/gemini-notes/pri_aula2_2026-08-21.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações ago. 21, 2026 Plantação e Revitalização de Igrejas II - Profº Thácyto Lessa luxguggug@icloud.com Anexos Plantação e Revitalização de Igrejas II - Profº Thácyto Lessa Registros da reunião Transcrição Gravação Resumo Debate sobre revitalização ministerial focou no p",
    tags: ["Plantação e Revitalização de Igrejas II","Aula 2","Anotações Gemini"],
    author_name: "Profº Thácyto Lessa",
    author_role: "professor",
    created_at: "2026-08-21T18:41:00Z",
  },
  {
    id: "gemini-real-pri-aula3",
    disciplina_id: "disc-7",
    disciplina_name: "Plantação e Revitalização de Igrejas II",
    aula_num: 3,
    data_aula: "28/08/2026",
    title: "Anotações Gemini • Aula 3 • Plantação e Revitalização de Igrejas II",
    gemini_url: "/gemini-notes/pri_aula3_2026-08-28.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações ago. 28, 2026 Plantação e Revitalização de Igrejas II - Profº Thácyto Lessa Anexos Plantação e Revitalização de Igrejas II - Profº Thácyto Lessa Registros da reunião Transcrição Gravação Resumo A discussão abordou critérios bíblicos para revitalização eclesiástica",
    tags: ["Plantação e Revitalização de Igrejas II","Aula 3","Anotações Gemini"],
    author_name: "Profº Thácyto Lessa",
    author_role: "professor",
    created_at: "2026-08-28T18:32:00Z",
  },
  {
    id: "gemini-real-tcc-aula1",
    disciplina_id: "disc-8",
    disciplina_name: "TCC I",
    aula_num: 1,
    data_aula: "14/08/2026",
    title: "Anotações Gemini • Aula 1 • TCC I",
    gemini_url: "/gemini-notes/tcc_aula1_2026-08-14.pdf",
    tipo: "anotacao",
    summary_snippet: "ago. 14, 2026 TCC I - Profª Gabriela Leal Anexos TCC I - Profª Gabriela Leal Registros da reunião Gravação Resumo A disciplina de Trabalho de Conclusão de Curso 1 iniciou focada no avanço da escrita e ética. Objetivos da disciplina A disciplina visa acelerar a escrita do artigo c",
    tags: ["TCC I","Aula 1","Anotações Gemini"],
    author_name: "Profª Gabriela Leal",
    author_role: "professor",
    created_at: "2026-08-14T19:51:00Z",
  },
  {
    id: "gemini-real-tcc-aula2",
    disciplina_id: "disc-8",
    disciplina_name: "TCC I",
    aula_num: 2,
    data_aula: "21/08/2026",
    title: "Anotações Gemini • Aula 2 • TCC I",
    gemini_url: "/gemini-notes/tcc_aula2_2026-08-21.pdf",
    tipo: "anotacao",
    summary_snippet: "ago. 21, 2026 TCC I - Profª Gabriela Leal Anexos TCC I - Profª Gabriela Leal Registros da reunião Gravação Resumo Reunião de alinhamento metodológico definiu prazos, estruturas acadêmicas e responsabilidades para o Trabalho de Conclusão de Curso. Diretrizes e estrutura metodológi",
    tags: ["TCC I","Aula 2","Anotações Gemini"],
    author_name: "Profª Gabriela Leal",
    author_role: "professor",
    created_at: "2026-08-21T19:50:00Z",
  },
  {
    id: "gemini-guia-8",
    disciplina_id: "disc-8",
    disciplina_name: "TCC I",
    aula_num: 2,
    data_aula: "21/08/2026",
    title: "Guia de Estudo & Checklist • Normas ABNT & Projeto de Pesquisa",
    gemini_url: "https://docs.google.com/document/d/13-BgUMgynR6ZMXkXeRSvu_8_RJvnz7ib1WBa06t03Bo/edit",
    tipo: "guia_estudo",
    summary_snippet: "Roteiro prático para estruturar Justificativa, Objetivos (Geral e Específicos) e Metodologia Científica.",
    tags: ["ABNT","Justificativa","Objetivos"],
    author_name: "Profª Gabriela Leal",
    author_role: "professor",
    created_at: "2026-08-21T22:45:00Z",
  },
  {
    id: "gemini-real-tcc-aula3",
    disciplina_id: "disc-8",
    disciplina_name: "TCC I",
    aula_num: 3,
    data_aula: "28/08/2026",
    title: "Anotações Gemini • Aula 3 • TCC I",
    gemini_url: "/gemini-notes/tcc_aula3_2026-08-28.pdf",
    tipo: "anotacao",
    summary_snippet: "📝 Observações ago. 28, 2026 TCC I - Profª Gabriela Leal Anexos TCC I - Profª Gabriela Leal Registros da reunião Transcrição Gravação Resumo Debates sobre a escrita do Trabalho de Conclusão de Curso integraram exigências metodológicas e normas acadêmicas técnicas. Desafios na Es",
    tags: ["TCC I","Aula 3","Anotações Gemini"],
    author_name: "Profª Gabriela Leal",
    author_role: "professor",
    created_at: "2026-08-28T19:34:00Z",
  },
  {
    id: "gemini-doc-at2-1",
    disciplina_id: "disc-b-6",
    disciplina_name: "Antigo Testamento II - Livros Históricos",
    aula_num: 1,
    data_aula: "13/08/2026",
    title: "Anotações Gemini • Aula 1 • A Teologia Histórica de Josué a 2 Reis",
    gemini_url: "https://docs.google.com/document/d/1V7VvP5G5kG-antigo-testamento-aula1/edit",
    tipo: "anotacao",
    summary_snippet: "Transcrição e síntese exegética: a fidelidade da aliança davídica, a conquista sob Josué e os ciclos de apostasia e restauração em Juízes.",
    tags: ["Aliança","Josué","Juízes","Historiografia"],
    author_name: "Profª Betânia Barbosa",
    author_role: "professor",
    created_at: "2026-08-13T22:30:00Z",
  },
  {
    id: "gemini-pod-at2-2",
    disciplina_id: "disc-b-6",
    disciplina_name: "Antigo Testamento II - Livros Históricos",
    aula_num: 2,
    data_aula: "20/08/2026",
    title: "Podcast NotebookLM • Aula 2 • A Monarquia Unida: Saul, Davi e Salomão",
    gemini_url: "https://notebooklm.google.com/",
    tipo: "audio_podcast",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration_formatted: "13:40",
    summary_snippet: "Debate em áudio sintetizando a transição teocrática para a monárquica, os triunfos e tragédias do reinado davídico e a sabedoria salomônica.",
    tags: ["Podcast","Davi","Salomão","Monarquia"],
    author_name: "Profª Betânia Barbosa",
    author_role: "professor",
    created_at: "2026-08-20T22:45:00Z",
  },
  {
    id: "gemini-map-at2-3",
    disciplina_id: "disc-b-6",
    disciplina_name: "Antigo Testamento II - Livros Históricos",
    aula_num: 3,
    data_aula: "27/08/2026",
    title: "Mapa Mental • A Divisão dos Reinos & O Exílio Babilônico",
    gemini_url: "https://docs.google.com/document/d/1V7VvP5G5kG-mapa-at2/edit",
    tipo: "mapa_mental",
    mindmap_data: "• Reinos Divididos\n  ├── Reino do Norte (Israel)\n  │     ├── Capital Samaria (Jeroboão I)\n  │     └── Queda perante a Assíria (722 a.C.)\n  ├── Reino do Sul (Judá)\n  │     ├── Capital Jerusalém (Dinastia de Davi)\n  │     └── Cativeiro Babilônico (586 a.C.)\n  └── Restauração Pós-Exílica\n        ├── Edito de Ciro (538 a.C.)\n        └── Esdras, Neemias e Zorobabel",
    summary_snippet: "Esquema visual detalhado da cronologia dos reis de Israel e Judá e o retorno do exílio.",
    tags: ["Reinos Divididos","Exílio","Mapa Mental","Cronologia"],
    author_name: "Profª Betânia Barbosa",
    author_role: "professor",
    created_at: "2026-08-27T23:00:00Z",
  },
  {
    id: "gemini-guia-at2-4",
    disciplina_id: "disc-b-6",
    disciplina_name: "Antigo Testamento II - Livros Históricos",
    aula_num: 4,
    data_aula: "03/09/2026",
    title: "Guia de Estudo • Hermenêutica Narrativa nos Livros Históricos",
    gemini_url: "https://docs.google.com/document/d/1V7VvP5G5kG-guia-at2/edit",
    tipo: "guia_estudo",
    summary_snippet: "Flashcards de fixação e questionário de auto-avaliação sobre a providência divina na narrativa de Rute e Ester.",
    tags: ["Hermenêutica Narrativa","Rute","Ester","Guia de Estudo"],
    author_name: "Profª Betânia Barbosa",
    author_role: "professor",
    created_at: "2026-09-03T22:30:00Z",
  },
  {
    id: "gemini-doc-pan-1",
    disciplina_id: "disc-bas-1",
    disciplina_name: "Panorama do Antigo Testamento",
    aula_num: 1,
    data_aula: "10/08/2026",
    title: "Anotações Gemini • Aula 1 • Visão Geral do Cânon & Estrutura do Tanakh",
    gemini_url: "https://docs.google.com/document/d/1V7VvP5G5kG-panorama-aula1/edit",
    tipo: "anotacao",
    summary_snippet: "Divisão canônica da Bíblia Hebraica: Torá (Lei), Nevi'im (Profetas) e Ketuvim (Escritos), e a linha mestra da Redenção Messiânica.",
    tags: ["Tanakh","Cânon","Torá","Pentateuco"],
    author_name: "Profª Betânia Barbosa",
    author_role: "professor",
    created_at: "2026-08-10T22:15:00Z",
  },
  {
    id: "gemini-pod-pan-2",
    disciplina_id: "disc-bas-1",
    disciplina_name: "Panorama do Antigo Testamento",
    aula_num: 2,
    data_aula: "17/08/2026",
    title: "Podcast NotebookLM • Aula 2 • As Alianças Bíblicas: De Adão a Davi",
    gemini_url: "https://notebooklm.google.com/",
    tipo: "audio_podcast",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    duration_formatted: "15:10",
    summary_snippet: "Episódio dinâmico explorando o desdobramento progressivo das alianças adâmica, noética, abraâmica, mosaica e davídica rumo ao Novo Pacto.",
    tags: ["Podcast","Alianças Bíblicas","Pacto","Teologia Bíblica"],
    author_name: "Profª Betânia Barbosa",
    author_role: "professor",
    created_at: "2026-08-17T22:30:00Z",
  },
  {
    id: "gemini-map-pan-3",
    disciplina_id: "disc-bas-1",
    disciplina_name: "Panorama do Antigo Testamento",
    aula_num: 3,
    data_aula: "24/08/2026",
    title: "Mapa Mental • Geografia Bíblica & O Crescente Fértil",
    gemini_url: "https://docs.google.com/document/d/1V7VvP5G5kG-mapa-panorama/edit",
    tipo: "mapa_mental",
    mindmap_data: "• Geografia do Antigo Testamento\n  ├── Mesopotâmia (Tigre e Eufrates)\n  │     └── Ur dos Caldeus a Nínive e Babilônia\n  ├── Canaã (A Terra Prometida)\n  │     └── A ponte terrestre entre os impérios\n  └── Egito (O Vale do Nilo)\n        └── Refúgio patriarcal e o Êxodo",
    summary_snippet: "Esquema visual integrando a geografia histórica do Antigo Testamento com a trajetória dos patriarcas.",
    tags: ["Geografia Bíblica","Crescente Fértil","Mapa Mental"],
    author_name: "Profª Betânia Barbosa",
    author_role: "professor",
    created_at: "2026-08-24T22:45:00Z",
  },
];

export function getAllGeminiNotes(): GeminiNoteItem[] {
  if (typeof window === 'undefined') return INITIAL_GEMINI_NOTES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_GEMINI_NOTES));
      return INITIAL_GEMINI_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const seedMap = new Map(INITIAL_GEMINI_NOTES.map((s) => [s.id, s]));
      let hasChanges = false;
      const updatedList = parsed.map((item: GeminiNoteItem) => {
        if (seedMap.has(item.id)) {
          const seed = seedMap.get(item.id)!;
          if (
            seed.gemini_url !== item.gemini_url ||
            seed.title !== item.title ||
            seed.tipo !== item.tipo ||
            seed.audio_url !== item.audio_url
          ) {
            hasChanges = true;
            return {
              ...item,
              ...seed,
            };
          }
        }
        return item;
      });

      const existingIds = new Set(updatedList.map((item: GeminiNoteItem) => item.id));
      const missingSeeds = INITIAL_GEMINI_NOTES.filter((seed) => !existingIds.has(seed.id));
      if (missingSeeds.length > 0) {
        hasChanges = true;
        updatedList.push(...missingSeeds);
      }

      if (hasChanges) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      }
      return updatedList;
    }
    return INITIAL_GEMINI_NOTES;
  } catch (e) {
    console.error('[GeminiNotes] Erro ao ler anotações do storage:', e);
    return INITIAL_GEMINI_NOTES;
  }
}

export function saveAllGeminiNotes(list: GeminiNoteItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('lms_gemini_notes_updated', { detail: list }));
    syncGeminiNotesToCloud(list);
  } catch (e) {
    console.error('[GeminiNotes] Erro ao salvar anotações:', e);
  }
}

export async function syncGeminiNotesToCloud(list: GeminiNoteItem[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const jsonStr = JSON.stringify(list);
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', CLOUD_TITLE_KEY)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabase
        .from('materiais')
        .update({ file_url: jsonStr, updated_at: new Date().toISOString() })
        .eq('id', existing[0].id);
    } else {
      await supabase.from('materiais').insert([
        {
          disciplina_id: 'global-cloud-gemini',
          title: CLOUD_TITLE_KEY,
          file_url: jsonStr,
          file_type: 'json',
          is_native_upload: false,
        },
      ]);
    }
  } catch (err) {
    console.warn('[GeminiNotes] Falha na sincronização cloud:', err);
  }
}

export async function fetchGeminiNotesFromCloud(): Promise<GeminiNoteItem[]> {
  if (typeof window === 'undefined') return INITIAL_GEMINI_NOTES;
  try {
    const { data } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', CLOUD_TITLE_KEY)
      .limit(1);

    if (data && data.length > 0 && data[0].file_url) {
      const parsed = JSON.parse(data[0].file_url);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        window.dispatchEvent(new CustomEvent('lms_gemini_notes_updated', { detail: parsed }));
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[GeminiNotes] Falha ao baixar anotações do Supabase:', err);
  }
  return getAllGeminiNotes();
}

if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    fetchGeminiNotesFromCloud();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      fetchGeminiNotesFromCloud();
    }
  });
}

export function getGeminiNotesForDisciplina(disciplinaId: string): GeminiNoteItem[] {
  const all = getAllGeminiNotes();
  if (!disciplinaId) return all;
  return all.filter((item) => item.disciplina_id === disciplinaId);
}

export function addGeminiNote(
  item: Omit<GeminiNoteItem, 'id' | 'created_at'>
): GeminiNoteItem {
  const newItem: GeminiNoteItem = {
    ...item,
    id: `gemini-doc-${Date.now()}`,
    tipo: item.tipo || 'anotacao',
    created_at: new Date().toISOString(),
  };

  const current = getAllGeminiNotes();
  const next = [newItem, ...current];
  saveAllGeminiNotes(next);
  return newItem;
}

export function updateGeminiNote(
  id: string,
  patch: Partial<GeminiNoteItem>
): GeminiNoteItem | null {
  const current = getAllGeminiNotes();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: GeminiNoteItem = {
    ...current[index],
    ...patch,
  };

  const next = [...current];
  next[index] = updated;
  saveAllGeminiNotes(next);
  return updated;
}

export function deleteGeminiNote(id: string): void {
  const current = getAllGeminiNotes();
  const next = current.filter((item) => item.id !== id);
  saveAllGeminiNotes(next);
}
