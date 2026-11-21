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

export const APP_VERSION = '1.1.0';
export const APP_VERSION_NAME = '1.1.0 • Operação Semana AV2 & NotebookLM';
export const APP_RELEASE_DATE = 'Novembro de 2026';

export const PREVIOUS_RELEASE_V1: ReleaseNote = {
  version: '1.0.0',
  versionName: '1.0.0 Oficial (Golden Master)',
  date: 'Setembro de 2026',
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

export const CURRENT_RELEASE_NOTES: ReleaseNote = {
  version: APP_VERSION,
  versionName: APP_VERSION_NAME,
  date: APP_RELEASE_DATE,
  summary: 'Chegou a Central Operação Semana da AV2 (24 a 27/11) integrada ao NotebookLM oficial com transcrições da Unidade 2, mapas mentais e 40 questões de simulado comentadas.',
  dataProtectionNotice: '🛡️ Todas as atualizações da Unidade 2 rodam em modo Zero-Egress, preservando suas notas, presenças e anotações do Caderno Cornell.',
  items: [
    {
      id: 'operacao-av2-hub',
      title: 'Nova Central: Operação Semana da AV2 & Simulados',
      description: 'Filtre por dia de prova (Ter 24/11 a Sex 27/11 + TCC 04/12), confira os horários de Brasília/Tabatinga, revise os guias express e pratique 40 questões comentadas no estilo de cada docente.',
      category: 'novidade',
      badge: 'Semana AV2'
    },
    {
      id: 'notebooklm-oficial',
      title: 'NotebookLM Oficial Vinculado com Transcrições U2',
      description: 'Acesso direto ao caderno atualizado do Seminário com todas as transcrições das aulas recentes e materiais compartilhados pelos professores.',
      category: 'novidade',
      badge: 'NotebookLM'
    },
    {
      id: 'regras-av2-homologadas',
      title: 'Alertas e Regras Oficiais Atualizadas (AV2)',
      description: 'Direitos Humanos com peso 10 integral na prova (trabalho cancelado, 52 slides), Ética Cristã sem prova escrita, Plantação II com consulta livre às 19h e NT III em 26/11.',
      category: 'melhoria',
      badge: 'Cronograma'
    },
    {
      id: 'mapas-mentais-av2',
      title: 'Mapas Mentais em Árvore Copiáveis em 1 Clique',
      description: 'Cada disciplina da Unidade 2 agora conta com esquema hierárquico pronto para revisão rápida antes das provas.',
      category: 'melhoria',
      badge: 'Revisão'
    }
  ]
};

export const RELEASE_HISTORY: ReleaseNote[] = [
  CURRENT_RELEASE_NOTES,
  PREVIOUS_RELEASE_V1
];

/**
 * Verifica se a versão atual é mais recente que a última versão vista pelo usuário
 */
export function hasNewVersion(lastSeenVersion: string | null): boolean {
  if (!lastSeenVersion) return true;
  return lastSeenVersion !== APP_VERSION;
}
