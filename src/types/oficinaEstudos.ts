/**
 * oficinaEstudos.ts
 * Definições e interfaces em TypeScript para o módulo
 * "Trilha de Estudos: Laboratório de Imersão e Metacognição do TCC"
 * Koinonia LMS - 2026
 */

export type EixoTematicoId = 'historico' | 'teorico' | 'eclesiologico' | 'inovacao';

export type CapituloTcc = 'cap_1' | 'cap_2' | 'cap_3' | 'cap_4';

export interface ChecklistItem {
  id: string;
  titulo: string;
  descricao: string;
  autor_referencia: string;
  link_leitura?: string;
  paginas_recomendadas?: string;
  lido: boolean;
}

export interface SprintSemanal {
  id: string;
  numero: number;
  titulo: string;
  subtitulo: string;
  eixo: EixoTematicoId;
  foco_autores: string;
  objetivo: string;
  meta_horas: number; // Meta recomendada de 2 a 3 horas
  tempo_estudado_segundos: number;
  checklist: ChecklistItem[];
}

export interface CornellAnotacao {
  id: string;
  sprint_id?: string;
  obra_titulo: string;
  autor_nome: string;
  pagina_referencia: string;
  eixo_tematico: EixoTematicoId;
  drive_url?: string; // Link direto para o PDF da obra no Google Drive
  cues: string; // Coluna Esquerda (~30%): Palavras-chave, perguntas socráticas e pistas
  notes: string; // Coluna Direita (~70%): Notas de leitura, tópicos e citações diretas
  summary: string; // Rodapé: Sumário executivo / takeaway para o TCC (3-4 linhas)
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CitacaoABNT {
  id: string;
  texto_citacao: string;
  autores: string; // Ex: "MOORE, Michael G."
  ano: number;
  pagina: string;
  referencia_abnt_completa: string;
  drive_url?: string; // Link direto para o PDF da fonte no Google Drive
  capitulo_tcc: CapituloTcc;
  eixo_tematico: EixoTematicoId;
  tags: string[];
  data_cadastro: string;
}

export interface MatrizDialeticaItem {
  id: string;
  autor_a: string;
  autor_b: string;
  autor_a_drive_url?: string;
  autor_b_drive_url?: string;
  tema_debate: string;
  ponto_convergencia: string;
  ponto_tensao: string;
  sintese_pesquisador: string; // Síntese autoral para a Revisão de Literatura
  capitulo_tcc: CapituloTcc;
  created_at: string;
}

export interface SimuladorDefesaPergunta {
  id: string;
  numero: number;
  enunciado: string;
  objetivo_pedagogico: string;
  autores_recomendados: string[];
  tempo_segundos: number; // Ex: 120s ou 180s
  rubrica_criterios: {
    id: string;
    criterio: string;
    descricao: string;
  }[];
}

export interface SimuladorDefesaRegistro {
  id: string;
  pergunta_id: string;
  pergunta_numero: number;
  pergunta_enunciado: string;
  duracao_gravacao_segundos: number;
  audio_url?: string;
  criterios_marcados: string[];
  nota_autoavaliacao: number; // 0 a 10
  reflexao_pesquisador: string;
  created_at: string;
}

export interface OficinaEstudosDadosCompletos {
  sprints: SprintSemanal[];
  cornellNotes: CornellAnotacao[];
  citacoes: CitacaoABNT[];
  dialetica: MatrizDialeticaItem[];
  defesaHistorico: SimuladorDefesaRegistro[];
  ultimaSessao?: string;
}
