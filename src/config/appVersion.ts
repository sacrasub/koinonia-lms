export interface ReleaseItem {
  id: string;
  title: string;
  description: string;
  category: 'novidade' | 'melhoria' | 'seguranca';
  badge?: string;
}

export interface ReleaseNote {
  version: string;
  versionName: string;
  date: string;
  summary: string;
  dataProtectionNotice: string;
  items: ReleaseItem[];
}

export const APP_VERSION = '1.0.0';
export const APP_VERSION_NAME = '1.0.0 Oficial (Golden Master)';
export const APP_RELEASE_DATE = 'Setembro de 2026';

export const CURRENT_RELEASE_NOTES: ReleaseNote = {
  version: APP_VERSION,
  versionName: APP_VERSION_NAME,
  date: APP_RELEASE_DATE,
  summary: 'A versão oficial 1.0 do Koinonia LMS chega com estabilidade máxima, blindagem definitiva das suas anotações e novas ferramentas de produtividade.',
  dataProtectionNotice: '🛡️ Seus dados, presenças, tarefas e anotações do Caderno Cornell estão 100% seguros e sincronizados.',
  items: [
    {
      id: 'blindagem-dados',
      title: 'Blindagem de Anotações & Backup',
      description: 'Agora você pode exportar todas as suas anotações do Caderno Cornell em um clique para ter um backup seguro no seu próprio computador ou celular.',
      category: 'seguranca',
      badge: 'Proteção Total'
    },
    {
      id: 'chat-nao-perturbe',
      title: 'Chat com Alerta Sonoro e Modo Não Perturbe',
      description: 'Receba avisos instantâneos com som ao vivo quando colegas ou monitores enviarem mensagens. Você pode silenciar a qualquer momento com o botão Não Perturbe.',
      category: 'novidade',
      badge: 'Comunicação'
    },
    {
      id: 'compartilhar-livro',
      title: 'Compartilhamento de Livros da Biblioteca',
      description: 'Compartilhe qualquer livro diretamente na plataforma ou envie o link via WhatsApp para seu grupo de estudos com apenas um toque.',
      category: 'novidade',
      badge: 'Biblioteca'
    },
    {
      id: 'checklist-whatsapp',
      title: 'Cronograma de Avaliações no WhatsApp',
      description: 'Gere um resumo formatado e organizado de todas as provas e trabalhos do semestre para compartilhar com a turma no WhatsApp.',
      category: 'melhoria',
      badge: 'Checklist'
    },
    {
      id: 'leitor-blindado',
      title: 'Leitor de PDFs Estável e Conexão com Google Drive',
      description: 'Leitura de apostilas mais rápida, com fallback direto para abrir no Google Drive caso o navegador restrinja cookies de terceiros.',
      category: 'melhoria',
      badge: 'Leitor'
    }
  ]
};

export const RELEASE_HISTORY: ReleaseNote[] = [
  CURRENT_RELEASE_NOTES
];

/**
 * Verifica se a versão atual é mais recente que a última versão vista pelo usuário
 */
export function hasNewVersion(lastSeenVersion: string | null): boolean {
  if (!lastSeenVersion) return true;
  return lastSeenVersion !== APP_VERSION;
}
