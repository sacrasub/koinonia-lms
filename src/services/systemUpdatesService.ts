import { SystemUpdate } from '@/types';

const STORAGE_KEY = 'lms_system_updates_v1';
const READ_STORAGE_PREFIX = 'lms_read_system_updates_';

export const INITIAL_SYSTEM_UPDATES: SystemUpdate[] = [
  {
    id: 'upd-2026-09-12-v1-0-0-golden-master',
    version: 'v1.0.0 Oficial',
    title: '🎉 Lançamento Oficial: Koinonia LMS 1.0 (Golden Master)',
    description: 'A versão oficial 1.0 fecha o ciclo de maturidade da plataforma, trazendo blindagem definitiva para suas anotações, novo chat com alerta sonoro e modo não perturbe, e ferramentas avançadas de compartilhamento.',
    date: '12/09/2026',
    category: 'novidade',
    badge: 'Versão 1.0',
    highlights: [
      '🛡️ Blindagem de Anotações: Suas anotações no Caderno Cornell estão seguras na nuvem e você agora pode exportar um backup pessoal a qualquer momento.',
      '🔔 Chat com Notificações Sonoras e Não Perturbe: Alerta sonoro sutil quando receber mensagens, com chave rápida de silenciamento.',
      '📚 Biblioteca Compartilhável: Compartilhe o link de qualquer livro da biblioteca diretamente no LMS ou no WhatsApp com 1 clique.',
      '📋 Cronograma para WhatsApp: No checklist de avaliações, gere um texto formatado com todas as provas e trabalhos previstos para a turma.',
      '⚡ Leitor de PDF Aprimorado: Acesso rápido e botão de abertura direta no Google Drive.'
    ],
    author: 'Equipe de Tecnologia • Seminário Koinonia'
  },
  {
    id: 'upd-2026-09-09-diretoria-afro',
    version: 'Aviso Oficial',
    title: '📢 Matéria Modular: História da Cultura Afro-brasileira e Indígena',
    description: 'A Diretoria do STC disponibilizou a pasta oficial no Google Drive com as 4 aulas gravadas, materiais e diretrizes da avaliação com o Prof. Alexsandro.',
    date: '09/09/2026',
    category: 'comunicado',
    badge: 'Diretoria STC',
    highlights: [
      '📂 Pasta do Google Drive com as 4 aulas e materiais: https://drive.google.com/drive/folders/1mCp4ZCawhIekLJl3_bcoPiThAqwdzlty?usp=drive_link',
      '🎓 Formato Modular: Contém 4 aulas gravadas ministradas pelo Profº Alexsandro.',
      '📝 Avaliação Oficial: Na 4ª aula, o Profº Alexsandro apresenta e explica a atividade que deve ser produzida e enviada para o seu e-mail.',
      '⏰ Prazo de Entrega: Alunos têm até o final do período (28 de novembro de 2026) para assistir às aulas, produzir e enviar a atividade.',
      '🤝 Dúvidas ou suporte: Procurar diretamente a Diretoria do Seminário (Diretora Karla).'
    ],
    author: 'STC Diretora Karla • Direção'
  },
  {
    id: 'upd-2026-09-01-v2',
    version: 'v2.8.0',
    title: '🚀 Novas Ferramentas: Alarme de Presença, Múltiplas Folhas e Hub Global',
    description: 'Atualização robusta focada em produtividade acadêmica, pontualidade nas aulas ao vivo e navegação contínua.',
    date: '01/09/2026',
    category: 'novidade',
    badge: 'Novo',
    highlights: [
      '🔔 Sininho de atualizações e novidades do sistema no cabeçalho.',
      '🔴 Card de Aula Ao Vivo agora visível em todas as páginas do portal do aluno.',
      '⏰ Alarme sonoro e visual inteligente no momento de assinar a lista de presença.',
      '📑 Caderno Cornell com suporte a múltiplas folhas para a mesma aula/data com navegação facilitada.',
      '📚 Painel do Professor com módulo direto de recomendação de livros para as disciplinas.',
      '✉️ Botão de envio rápido de convites de acesso via WhatsApp e E-mail para os usuários autorizados.'
    ],
    author: 'Equipe de Tecnologia • Seminário Koinonia'
  },
  {
    id: 'upd-2026-08-25-v1',
    version: 'v2.7.0',
    title: '🧠 Inteligência Artificial Gemini Pro & Resumos do Google Meet',
    description: 'Integração de modelos de IA para estruturação automática de anotações no método Cornell.',
    date: '25/08/2026',
    category: 'novidade',
    highlights: [
      '✨ Assistente inteligente de transformação de transcrições de aula no formato Cornell.',
      '🎙️ Suporte a resumos automáticos gerados pelo Google Meet.',
      '🏛️ 9 Personas Teológicas do Gemini Pro configuradas para tutoria acadêmica individual.'
    ],
    author: 'Coordenação EAD'
  },
  {
    id: 'upd-2026-08-18-v1',
    version: 'v2.6.0',
    title: '📅 Grade Horária 2026.2 & Sincronização com Google Agenda',
    description: 'Disponibilização da grade oficial de aulas com exportação em lote (.ICS) e links diretos.',
    date: '18/08/2026',
    category: 'melhoria',
    highlights: [
      '🗓️ Exportação unificada de todas as matérias para Google Agenda e Apple Calendar.',
      '⚡ Acesso a salas virtuais do Google Meet com 15 minutos de antecedência.',
      '📂 Pastas virtuais restritas no Google Drive indexadas no Supabase com TTFB ultrarrápido.'
    ],
    author: 'Secretaria Acadêmica'
  },
  {
    id: 'upd-2026-08-11-v1',
    version: 'v2.5.0',
    title: '✝️ Abertura Oficial do Semestre Letivo 2026.2',
    description: 'Boas-vindas a todos os docentes, monitores e discentes do Seminário Teológico Koinonia!',
    date: '11/08/2026',
    category: 'comunicado',
    highlights: [
      '📖 Início das 16 semanas letivas com aulas regulares de Terça a Sexta-feira.',
      '📋 Formulários de presença oficiais disponibilizados durante as aulas ao vivo.',
      '🛡️ Controle de acesso integrado via Google OAuth.'
    ],
    author: 'Diretoria Koinonia LMS'
  }
];

export function getSystemUpdates(): SystemUpdate[] {
  if (typeof window === 'undefined') {
    return INITIAL_SYSTEM_UPDATES;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SYSTEM_UPDATES));
      return INITIAL_SYSTEM_UPDATES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SYSTEM_UPDATES));
      return INITIAL_SYSTEM_UPDATES;
    }
    // Garante que novidades padrão estejam presentes
    const existingIds = new Set(parsed.map((u: SystemUpdate) => u.id));
    const missing = INITIAL_SYSTEM_UPDATES.filter((u) => !existingIds.has(u.id));
    if (missing.length > 0) {
      const combined = [...missing, ...parsed];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
      return combined;
    }
    return parsed;
  } catch (err) {
    console.error('Erro ao ler atualizações do sistema:', err);
    return INITIAL_SYSTEM_UPDATES;
  }
}

export function saveSystemUpdates(list: SystemUpdate[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('lms_system_updates_updated', { detail: list }));
  } catch (err) {
    console.error('Erro ao salvar atualizações do sistema:', err);
  }
}

export function addSystemUpdate(newUpdate: Omit<SystemUpdate, 'id'>): SystemUpdate {
  const full: SystemUpdate = {
    ...newUpdate,
    id: `upd-${Date.now()}`,
  };
  const current = getSystemUpdates();
  const updated = [full, ...current];
  saveSystemUpdates(updated);
  return full;
}

export function getReadUpdateIds(userEmail: string): string[] {
  if (typeof window === 'undefined' || !userEmail) return [];
  try {
    const key = `${READ_STORAGE_PREFIX}${userEmail.toLowerCase().trim()}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function markUpdateAsRead(userEmail: string, updateId: string): void {
  if (typeof window === 'undefined' || !userEmail || !updateId) return;
  try {
    const key = `${READ_STORAGE_PREFIX}${userEmail.toLowerCase().trim()}`;
    const current = getReadUpdateIds(userEmail);
    if (!current.includes(updateId)) {
      const updated = [...current, updateId];
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('lms_read_updates_updated', { 
        detail: { email: userEmail.toLowerCase().trim(), readIds: updated } 
      }));
    }
  } catch (err) {}
}

export function markAllUpdatesAsRead(userEmail: string): void {
  if (typeof window === 'undefined' || !userEmail) return;
  try {
    const allUpdates = getSystemUpdates();
    const allIds = allUpdates.map((u) => u.id);
    const key = `${READ_STORAGE_PREFIX}${userEmail.toLowerCase().trim()}`;
    localStorage.setItem(key, JSON.stringify(allIds));
    window.dispatchEvent(new CustomEvent('lms_read_updates_updated', { 
      detail: { email: userEmail.toLowerCase().trim(), readIds: allIds } 
    }));
  } catch (err) {}
}

export function getUnreadUpdatesCount(userEmail: string): number {
  if (!userEmail) return 0;
  const updates = getSystemUpdates();
  const readIds = new Set(getReadUpdateIds(userEmail));
  return updates.filter((u) => !readIds.has(u.id)).length;
}
