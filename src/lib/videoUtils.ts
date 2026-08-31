/**
 * videoUtils.ts
 * Utilitários para detecção e embed seguro de URLs de vídeo (YouTube, Google Drive, Loom, Vimeo, etc.)
 * Koinonia-LMS
 */

// Extrai ID de arquivo do Google Drive
export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Padrão 1: /file/d/ID/...
  const match1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1 && match1[1]) return match1[1];

  // Padrão 2: id=ID
  const match2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) return match2[1];

  // Padrão 3: /open?id=ID
  const match3 = trimmed.match(/\/open\?id=([a-zA-Z0-9_-]+)/);
  if (match3 && match3[1]) return match3[1];

  // Padrão 4: /folders/ID
  const match4 = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match4 && match4[1]) return match4[1];

  return null;
}

// Extrai ID de vídeo do YouTube
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // youtube.com/watch?v=ID ou m.youtube.com/watch?v=ID ou youtu.be/ID
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
export type VideoSourceType = 'drive' | 'youtube' | 'direct' | 'other_embed';

export function getVideoSourceType(url: string): VideoSourceType {
  if (!url) return 'other_embed';
  if (isDirectVideoUrl(url)) return 'direct';
  if (extractDriveFileId(url) || url.includes('drive.google.com')) return 'drive';
  if (extractYouTubeId(url) || url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'other_embed';
}

// Retorna a URL de Embed ideal para iframe no Desktop e Celular (Modo Player Limpo sem download)
export function getEmbedVideoUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Caso 1: Google Drive
  const driveId = extractDriveFileId(trimmed);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }

  // Caso 2: YouTube
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
  }

  // Caso 3: URL normal
  return trimmed;
}

// Retorna a URL protegida do Google Drive (/preview) sem a barra de menus com opcao de download
export function getSafeStreamUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const driveId = extractDriveFileId(trimmed);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }
  return trimmed;
}

// Retorna o link nativo direto para reprodução protegida em tela cheia (sem menu de download do Google Drive)
export function getNativeAppOrDirectLink(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  const driveId = extractDriveFileId(trimmed);
  if (driveId) {
    // Rota /preview do Google Drive não exibe o menu "Arquivo -> Baixar (Ctrl+D)" nem barra de ferramentas
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }

  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return `https://www.youtube.com/watch?v=${ytId}`;
  }

  return trimmed;
}
