/**
 * videoUtils.ts
 * Utilitários para detecção e embed seguro de URLs de vídeo (YouTube, Google Drive, Loom, Vimeo, etc.)
 * Koinonia-LMS
 */

// Informações oficiais da Pasta Modular de História da Cultura Afro-Brasileira e Indígena
export const AFRO_BRASILEIRA_DRIVE_FOLDER_ID = '1mCp4ZCawhIekLJl3_bcoPiThAqwdzlty';
export const AFRO_BRASILEIRA_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1mCp4ZCawhIekLJl3_bcoPiThAqwdzlty';

export interface ModularAulaVideoItem {
  aulaNum: number;
  title: string;
  driveFileId: string;
  videoUrl: string;
  previewUrl: string;
  sizeFormatted: string;
}

export const AFRO_BRASILEIRA_AULAS: Record<number, ModularAulaVideoItem> = {
  1: {
    aulaNum: 1,
    title: '01 • Por Que Esta Disciplina é Necessária à Teologia? (Videoaula HD • 636 MB)',
    driveFileId: '1ypH0nSMA6E02c2enTzeLSacRhY8q9n05',
    videoUrl: 'https://drive.google.com/file/d/1ypH0nSMA6E02c2enTzeLSacRhY8q9n05/view?usp=drive_link',
    previewUrl: 'https://drive.google.com/file/d/1ypH0nSMA6E02c2enTzeLSacRhY8q9n05/preview',
    sizeFormatted: '636 MB',
  },
  2: {
    aulaNum: 2,
    title: '02 • Áfricas, Diáspora e Cultura Afro-Brasileira (Videoaula HD • 595 MB)',
    driveFileId: '1zMrGk_T-658PSVDXk14qb4VsFcqNtfzq',
    videoUrl: 'https://drive.google.com/file/d/1zMrGk_T-658PSVDXk14qb4VsFcqNtfzq/view?usp=drive_link',
    previewUrl: 'https://drive.google.com/file/d/1zMrGk_T-658PSVDXk14qb4VsFcqNtfzq/preview',
    sizeFormatted: '595 MB',
  },
  3: {
    aulaNum: 3,
    title: '03 • Povos Indígenas: Histórias, Culturas, Missão e Direitos (Videoaula HD • 526 MB)',
    driveFileId: '1cdcDrVmHoPmet3oA2Bib6hhz_ugzBxaK',
    videoUrl: 'https://drive.google.com/file/d/1cdcDrVmHoPmet3oA2Bib6hhz_ugzBxaK/view?usp=drive_link',
    previewUrl: 'https://drive.google.com/file/d/1cdcDrVmHoPmet3oA2Bib6hhz_ugzBxaK/preview',
    sizeFormatted: '526 MB',
  },
  4: {
    aulaNum: 4,
    title: '04 • Religiões, Análise Cristã Confessional e Prática da Igreja [Atividade Avaliativa] (Videoaula HD • 532 MB)',
    driveFileId: '1gSk3mjti0WC5PCDDpv0DRdtQ0x2hB_yw',
    videoUrl: 'https://drive.google.com/file/d/1gSk3mjti0WC5PCDDpv0DRdtQ0x2hB_yw/view?usp=drive_link',
    previewUrl: 'https://drive.google.com/file/d/1gSk3mjti0WC5PCDDpv0DRdtQ0x2hB_yw/preview',
    sizeFormatted: '532 MB',
  },
};

// Detecta se uma URL aponta para uma pasta do Google Drive
export function isDriveFolderUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.includes('/folders/') ||
    trimmed.includes('folders%2F') ||
    trimmed.includes(AFRO_BRASILEIRA_DRIVE_FOLDER_ID)
  );
}

// Extrai ID de pasta do Google Drive
export function extractDriveFolderId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) return match[1];
  if (trimmed.includes(AFRO_BRASILEIRA_DRIVE_FOLDER_ID)) return AFRO_BRASILEIRA_DRIVE_FOLDER_ID;
  return null;
}

// Extrai ID de arquivo individual do Google Drive (excluindo pastas)
export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pastas não devem ser tratadas como file ID individual
  if (isDriveFolderUrl(trimmed) && !trimmed.includes('/file/d/')) {
    return null;
  }

  // Padrão 1: /file/d/ID/...
  const match1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1 && match1[1]) return match1[1];

  // Padrão 2: id=ID
  const match2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1] && !trimmed.includes('/folders/')) return match2[1];

  // Padrão 3: /open?id=ID
  const match3 = trimmed.match(/\/open\?id=([a-zA-Z0-9_-]+)/);
  if (match3 && match3[1]) return match3[1];

  return null;
}

// Extrai ID de vídeo do YouTube
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  const matchWatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/);
  if (matchWatch && matchWatch[1]) return matchWatch[1];

  return null;
}

// Detecta se a URL é arquivo direto de vídeo ou blob
export function isDirectVideoUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.startsWith('blob:') ||
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.ogg') ||
    clean.endsWith('.m4v') ||
    clean.endsWith('.mov') ||
    clean.includes('video/webm') ||
    clean.includes('video/mp4')
  );
}

// Detecta o tipo de fonte de vídeo
export type VideoSourceType = 'drive' | 'drive_folder' | 'youtube' | 'direct' | 'other_embed';

export function getVideoSourceType(url: string): VideoSourceType {
  if (!url) return 'other_embed';
  if (isDirectVideoUrl(url)) return 'direct';
  if (isDriveFolderUrl(url) && !url.includes('/file/d/')) return 'drive_folder';
  if (extractDriveFileId(url) || url.includes('drive.google.com')) return 'drive';
  if (extractYouTubeId(url) || url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'other_embed';
}

/**
 * Resolve inteligentemente uma URL para garantir reprodução de vídeo válida.
 * Se uma pasta de aulas for informada com o número da aula correspondente,
 * resolve automaticamente para o arquivo HD individual daquela aula.
 */
export function resolveVideoForAula(
  url: string,
  aulaNum?: number,
  disciplinaName?: string
): {
  resolvedUrl: string;
  isFolder: boolean;
  driveFileId: string | null;
  folderUrl?: string;
  sourceType: VideoSourceType;
  titleSuggestion?: string;
  sizeFormatted?: string;
} {
  const cleanUrl = (url || '').trim();
  const isAfro =
    cleanUrl.includes(AFRO_BRASILEIRA_DRIVE_FOLDER_ID) ||
    (disciplinaName && (
      disciplinaName.toLowerCase().includes('afro') ||
      disciplinaName.toLowerCase().includes('indígena')
    ));

  // 1. Caso especial: disciplina modular com aula numerada (1 a 4)
  if (isAfro && aulaNum && AFRO_BRASILEIRA_AULAS[aulaNum]) {
    const item = AFRO_BRASILEIRA_AULAS[aulaNum];
    return {
      resolvedUrl: item.videoUrl,
      isFolder: false,
      driveFileId: item.driveFileId,
      folderUrl: AFRO_BRASILEIRA_DRIVE_FOLDER_URL,
      sourceType: 'drive',
      titleSuggestion: item.title,
      sizeFormatted: item.sizeFormatted,
    };
  }

  // 2. Pasta genérica do Google Drive
  if (isDriveFolderUrl(cleanUrl) && !cleanUrl.includes('/file/d/')) {
    const folderId = extractDriveFolderId(cleanUrl);
    return {
      resolvedUrl: cleanUrl,
      isFolder: true,
      driveFileId: null,
      folderUrl: folderId ? `https://drive.google.com/drive/folders/${folderId}` : cleanUrl,
      sourceType: 'drive_folder',
    };
  }

  // 3. Arquivo individual do Google Drive ou outra fonte
  const fileId = extractDriveFileId(cleanUrl);
  const srcType = getVideoSourceType(cleanUrl);

  return {
    resolvedUrl: cleanUrl,
    isFolder: false,
    driveFileId: fileId,
    folderUrl: isAfro ? AFRO_BRASILEIRA_DRIVE_FOLDER_URL : undefined,
    sourceType: srcType,
  };
}

// Retorna a URL de Embed ideal para iframe no Desktop e Celular (Modo Player Limpo sem download)
export function getEmbedVideoUrl(url: string, aulaNum?: number): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Se for a pasta modular com aula identificada, usa a aula correspondente
  if (isDriveFolderUrl(trimmed) && aulaNum && AFRO_BRASILEIRA_AULAS[aulaNum]) {
    return AFRO_BRASILEIRA_AULAS[aulaNum].previewUrl;
  }

  // Caso 1: Google Drive (arquivo individual)
  const driveId = extractDriveFileId(trimmed);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }

  // Caso 2: YouTube
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
  }

  // Se for uma pasta sem mapeamento direto de aula, não deve gerar preview de arquivo inexistente
  if (isDriveFolderUrl(trimmed)) {
    return '';
  }

  return trimmed;
}

// Retorna a URL protegida do Google Drive (/preview) sem barra de menus com opção de download
export function getSafeStreamUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const driveId = extractDriveFileId(trimmed);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }
  return trimmed;
}

// Retorna o link nativo direto para reprodução protegida em tela cheia ou aplicativo
export function getNativeAppOrDirectLink(url: string, aulaNum?: number): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Se for a pasta modular com aula numerada, retorna o link do vídeo correspondente
  if (isDriveFolderUrl(trimmed) && aulaNum && AFRO_BRASILEIRA_AULAS[aulaNum]) {
    return AFRO_BRASILEIRA_AULAS[aulaNum].videoUrl;
  }

  // Se for pasta do Google Drive
  if (isDriveFolderUrl(trimmed)) {
    const folderId = extractDriveFolderId(trimmed);
    return folderId ? `https://drive.google.com/drive/folders/${folderId}` : trimmed;
  }

  // Arquivo do Google Drive (abre nativo na conta Google do usuário com usp=drive_link)
  const driveId = extractDriveFileId(trimmed);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/view?usp=drive_link`;
  }

  // YouTube
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return `https://www.youtube.com/watch?v=${ytId}`;
  }

  return trimmed;
}
