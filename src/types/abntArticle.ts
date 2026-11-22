export type AbntTemplateType =
  | 'artigo_tcc'
  | 'trabalho_academico'
  | 'estudo_caso'
  | 'resumo_livro'
  | 'projeto_pesquisa';

export type AbntInstitutionPreset = 'unimb' | 'koinonia';

export interface AbntAuthor {
  id: string;
  fullName: string;
  registration?: string;
}

export type AbntContentBlock =
  | {
      id: string;
      type: 'paragraph';
      text: string;
    }
  | {
      id: string;
      type: 'long_quote';
      text: string;
      citation: string;
    }
  | {
      id: string;
      type: 'subheading';
      level: 2 | 3;
      numberLabel: string;
      title: string;
    }
  | {
      id: string;
      type: 'table';
      title: string;
      source: string;
      headers: string[];
      rows: string[][];
    }
  | {
      id: string;
      type: 'figure';
      title: string;
      source: string;
      imageDataUrl: string;
    };

export interface AbntSection {
  id: string;
  numberLabel: string;
  title: string;
  guideHint?: string;
  blocks: AbntContentBlock[];
}

export type AbntReferenceType =
  | 'livro'
  | 'capitulo'
  | 'artigo'
  | 'biblia'
  | 'site'
  | 'livre';

export interface AbntReference {
  id: string;
  type: AbntReferenceType;
  authors: string;
  title: string;
  subtitle?: string;
  containerTitle?: string;
  edition?: string;
  city?: string;
  publisher?: string;
  year: string;
  pages?: string;
  url?: string;
  accessDate?: string;
  formattedText: string;
}

export interface AbntAttachment {
  id: string;
  kind: 'apendice' | 'anexo';
  letter: string;
  title: string;
  description: string;
  imageDataUrl?: string;
  imageSource?: string;
}

export interface AbntFormattingOptions {
  fontFamily: 'Arial' | 'Times New Roman';
  firstLineIndentCm: 1.25 | 0;
  showLogo: boolean;
  institutionPreset: AbntInstitutionPreset;
  showCover: boolean;
  showTitlePage: boolean;
  showToc: boolean;
  showAbstract: boolean;
  targetMinPages?: number;
  targetMaxPages?: number;
  restrictFirstPerson?: boolean;
}

export interface AbntArticleDocument {
  id: string;
  userEmail: string;
  templateType: AbntTemplateType;
  disciplinaId?: string;
  disciplinaName: string;
  professorName: string;
  professorEmail?: string;
  institutionName: string;
  courseName: string;
  unitName?: string;
  city: string;
  year: string;
  title: string;
  subtitle?: string;
  academicNatureNote: string;
  authors: AbntAuthor[];
  resumo: string;
  palavrasChave: string;
  abstractEn: string;
  keywordsEn: string;
  sections: AbntSection[];
  references: AbntReference[];
  attachments: AbntAttachment[];
  formatting: AbntFormattingOptions;
  isLocked: boolean;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastCloudSyncAt?: string;
}

export interface AbntArticleSummary {
  id: string;
  user_email: string;
  title: string;
  template_type: AbntTemplateType;
  disciplina_id?: string | null;
  disciplina_name?: string | null;
  is_locked: boolean;
  word_count: number;
  estimated_pages: number;
  updated_at: string;
}
