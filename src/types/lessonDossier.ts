export type LessonTimelineCategory =
  | 'Ensino Central'
  | 'Estudo de Caso'
  | 'Exegese Bíblica'
  | 'Debate em Turma'
  | 'Aplicação Pastoral'
  | 'Contexto Histórico';

export type LessonTimelinePhase =
  | 'Abertura & Contexto'
  | 'Desenvolvimento Teológico'
  | 'Casos & Debate'
  | 'Síntese & Aplicação';

export interface LessonTimelineMoment {
  ordem: number;
  timestamp?: string;
  fase: LessonTimelinePhase;
  categoria: LessonTimelineCategory;
  titulo: string;
  resumoCurto: string;
  detalhamento: string;
  pontosChave: string[];
  referenciasNoBloco: string[];
}

export interface LessonBiblicalRef {
  referencia: string;
  contexto: string;
}

export interface LessonCaseItem {
  titulo: string;
  relato: string;
  timestamp?: string;
}

export interface LessonReviewQuestion {
  pergunta: string;
  dicaResposta: string;
}

export interface LessonExamPoint {
  titulo: string;
  detalhe: string;
}

export interface LessonDossierData {
  id: string;
  disciplinaId: string;
  disciplinaName: string;
  disciplinaShortName: string;
  disciplinaCode: string;
  professor: string;
  aulaNum: number;
  unidade: 1 | 2;
  dateIso: string;
  dateBr: string;
  theme: string;
  geminiUrl?: string;
  videoUrl?: string;
  sourceType: 'google-doc' | 'pdf' | 'dossie';
  panorama: {
    resumoCurado: string;
    sinteseGeral: string;
    mapaRapido: string[];
    duracaoEstimada?: string;
    totalBlocos: number;
  };
  linhaDoTempo: LessonTimelineMoment[];
  casosEDebates: LessonCaseItem[];
  referenciasBiblicas: LessonBiblicalRef[];
  pontosDeProva: LessonExamPoint[];
  perguntasRevisao: LessonReviewQuestion[];
  encaminhamentos: string[];
}

export interface LessonAiRefinement {
  sinteseDidatica: string;
  fioCondutor: string[];
  glossarioConceitos: { termo: string; definicao: string }[];
  dicasDeProva: string[];
  aplicacaoMinisterial: string;
  usedProvider: string;
  usedModel: string;
  generatedAt: string;
}

export interface LessonNavSibling {
  aulaNum: number;
  dateBr: string;
  theme: string;
  unidade: 1 | 2;
  totalBlocos: number;
}

export interface LessonDossierIndexEntry {
  id: string;
  disciplinaId: string;
  disciplinaShortName: string;
  aulaNum: number;
  unidade: 1 | 2;
  dateIso: string;
  dateBr: string;
  theme: string;
  totalBlocos: number;
  duracaoEstimada?: string;
  sourceType: 'google-doc' | 'pdf' | 'dossie';
}

export function buildLessonDossierUrl(disciplinaId: string, aulaNum: number): string {
  return `/aula/${disciplinaId}/${aulaNum}`;
}
