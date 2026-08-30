/**
 * googleAgendaService.ts - Serviço de Gestão e Dados da Google Agenda (Koinonia LMS)
 * Contém o catálogo completo das aulas semanais (Grade 2026.2), metadados do Google Meet,
 * informações de conexão por telefone/PIN, links do Drive/Docs, RSVP e exportação para a Google Agenda.
 */

export type RSVPStatus = 'yes' | 'no' | 'maybe' | 'none';

export interface AgendaAttachment {
  id: string;
  title: string;
  type: 'drive' | 'docs' | 'form' | 'pdf';
  url: string;
  iconType: 'drive' | 'docs' | 'forms' | 'slides';
}

export interface GoogleAgendaEvent {
  id: string;
  disciplinaId: string;
  code: string;
  title: string;
  professorName: string;
  professorEmail: string;
  monitorName: string;
  dayOfWeek: 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira';
  dayOfWeekIndex: number; // 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta
  startTime: string; // '19:00'
  endTime: string;   // '20:25'
  colorTag: string;  // Hex ou classe Tailwind
  pillColor: string; // bg-emerald-500, etc.
  bgLight: string;
  borderLight: string;
  recurrenceRule: string; // 'Semanal: cada terça-feira, até 2 dez. 2026'
  googleMeetUrl: string;
  googleMeetCode: string; // 'sef-ggpp-bbn'
  phoneBridge: string;    // '(BR) +55 19 4560-9588'
  phonePin: string;       // '812 860 450#'
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  organizerEmail: string;
  description: string;
  driveFolderUrl: string;
  cornellDocUrl: string;
  attendanceFormUrl: string;
  attachments: AgendaAttachment[];
}

export const GOOGLE_AGENDA_EVENTS: GoogleAgendaEvent[] = [
  // ── TERÇA-FEIRA ──
  {
    id: 'agenda-event-01',
    disciplinaId: 'disc-1',
    code: 'HIS-202',
    title: 'História do Congregacionalismo - Profº Ary Júnior',
    professorName: 'Profº Ary Júnior',
    professorEmail: 'queiroz.aryjr@gmail.com',
    monitorName: 'Camila',
    dayOfWeek: 'Terça-feira',
    dayOfWeekIndex: 2,
    startTime: '19:00',
    endTime: '20:25',
    colorTag: '#10b981', // emerald
    pillColor: 'bg-emerald-500',
    bgLight: 'bg-blue-50/50',
    borderLight: 'border-blue-200/80',
    recurrenceRule: 'Semanal: cada terça-feira, até 2 dez. 2026',
    googleMeetUrl: 'https://meet.google.com/sef-ggpp-bbn',
    googleMeetCode: 'meet.google.com/sef-ggpp-bbn',
    phoneBridge: '(BR) +55 19 4560-9588',
    phonePin: '812 860 450#',
    totalGuests: 30,
    confirmedGuests: 19,
    pendingGuests: 11,
    organizerEmail: 'ead@uiecbead.com.br',
    description: '16 encontros em 2 unidades temáticas (Mundial e Brasileira). Câmeras ligadas. Avaliação: Prova de unidade (0-8 pts) + Frequência ativa (1 pt) + Leitura obrigatória ética (1 pt).',
    driveFolderUrl: 'https://drive.google.com/open?id=19Y8Nv2Yvx1V-m4E5y5fUWOo5e8DZzeji&usp=drive_copy',
    cornellDocUrl: '/?tab=aluno-caderno&disc=disc-1',
    attendanceFormUrl: 'https://forms.gle/2X7xGqge3dqdRKrGA',
    attachments: [
      {
        id: 'att-01-drive',
        title: 'História do Con... (Drive)',
        type: 'drive',
        url: 'https://drive.google.com/open?id=19Y8Nv2Yvx1V-m4E5y5fUWOo5e8DZzeji&usp=drive_copy',
        iconType: 'drive'
      },
      {
        id: 'att-01-docs',
        title: 'Anotações do G... (Cornell)',
        type: 'docs',
        url: '/?tab=aluno-caderno&disc=disc-1',
        iconType: 'docs'
      }
    ]
  },
  {
    id: 'agenda-event-02',
    disciplinaId: 'disc-2',
    code: 'HIS-102',
    title: 'História do Pensamento Cristão II - Profº Hilário Bispo',
    professorName: 'Profº Hilário Bispo',
    professorEmail: 'hilario.graca@catolica.edu.br',
    monitorName: 'Cristiano',
    dayOfWeek: 'Terça-feira',
    dayOfWeekIndex: 2,
    startTime: '20:35',
    endTime: '22:00',
    colorTag: '#3b82f6', // blue
    pillColor: 'bg-blue-500',
    bgLight: 'bg-blue-50/50',
    borderLight: 'border-blue-200/80',
    recurrenceRule: 'Semanal: cada terça-feira, até 2 dez. 2026',
    googleMeetUrl: 'https://meet.google.com/cxj-yetd-xpf',
    googleMeetCode: 'meet.google.com/cxj-yetd-xpf',
    phoneBridge: '(BR) +55 11 4933-5763',
    phonePin: '788 555 787#',
    totalGuests: 28,
    confirmedGuests: 20,
    pendingGuests: 8,
    organizerEmail: 'ead@uiecbead.com.br',
    description: 'Iluminismo e Modernidade (razão vs revelação). AV1: Pesquisa ABNT (individual ou até 3 alunos). AV2: Prova objetiva 10 questões no Google Forms.',
    driveFolderUrl: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
    cornellDocUrl: '/?tab=aluno-caderno&disc=disc-2',
    attendanceFormUrl: 'https://forms.gle/hM2j2fb7DK923wdR7',
    attachments: [
      {
        id: 'att-02-drive',
        title: 'História do Pensamento (Drive)',
        type: 'drive',
        url: 'https://drive.google.com/open?id=1iKwbRf-oLpyphrFnM-Km5TWOo2UCU1Me&usp=drive_copy',
        iconType: 'drive'
      },
      {
        id: 'att-02-docs',
        title: 'Anotações Cornell',
        type: 'docs',
        url: '/?tab=aluno-caderno&disc=disc-2',
        iconType: 'docs'
      }
    ]
  },

  // ── QUARTA-FEIRA ──
  {
    id: 'agenda-event-03',
    disciplinaId: 'disc-3',
    code: 'ACO-202',
    title: 'Aconselhamento Bíblico II - Profº Uilian Santos',
    professorName: 'Profº Uilian Santos',
    professorEmail: 'santosuilian093@gmail.com',
    monitorName: 'Rosiane',
    dayOfWeek: 'Quarta-feira',
    dayOfWeekIndex: 3,
    startTime: '19:00',
    endTime: '20:25',
    colorTag: '#10b981', // emerald
    pillColor: 'bg-emerald-500',
    bgLight: 'bg-emerald-50/50',
    borderLight: 'border-emerald-200/80',
    recurrenceRule: 'Semanal: cada quarta-feira, até 2 dez. 2026',
    googleMeetUrl: 'https://meet.google.com/ifv-zsdd-gjx',
    googleMeetCode: 'meet.google.com/ifv-zsdd-gjx',
    phoneBridge: '(BR) +55 11 4949-4189',
    phonePin: '287 717 439#',
    totalGuests: 30,
    confirmedGuests: 22,
    pendingGuests: 8,
    organizerEmail: 'ead@uiecbead.com.br',
    description: 'Avaliação exclusiva por 2 provas objetivas Google Forms baseadas nos slides. Leitura obrigatória: "Ego Transformado" (Keller).',
    driveFolderUrl: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy',
    cornellDocUrl: '/?tab=aluno-caderno&disc=disc-3',
    attendanceFormUrl: 'https://forms.gle/iSLGtjyaTnM9tFGb6',
    attachments: [
      {
        id: 'att-03-drive',
        title: 'Aconselhamento Bíblico (Drive)',
        type: 'drive',
        url: 'https://drive.google.com/open?id=1BUr0R4pLQjTt01ID8XjYKIBlZhAtaWcx&usp=drive_copy',
        iconType: 'drive'
      },
      {
        id: 'att-03-docs',
        title: 'Anotações Cornell',
        type: 'docs',
        url: '/?tab=aluno-caderno&disc=disc-3',
        iconType: 'docs'
      }
    ]
  },
  {
    id: 'agenda-event-04',
    disciplinaId: 'disc-4',
    code: 'DIR-101',
    title: 'Direitos Humanos - Profº Cleiton Barbirato',
    professorName: 'Profº Cleiton Barbirato',
    professorEmail: 'cleitonpb@gmail.com',
    monitorName: 'Cristiano',
    dayOfWeek: 'Quarta-feira',
    dayOfWeekIndex: 3,
    startTime: '20:35',
    endTime: '22:00',
    colorTag: '#059669', // emerald dark
    pillColor: 'bg-emerald-600',
    bgLight: 'bg-emerald-50/50',
    borderLight: 'border-emerald-200/80',
    recurrenceRule: 'Semanal: cada quarta-feira, até 2 dez. 2026',
    googleMeetUrl: 'https://meet.google.com/uva-zmav-rds',
    googleMeetCode: 'meet.google.com/uva-zmav-rds',
    phoneBridge: '(BR) +55 51 4560-7412',
    phonePin: '670 189 539#',
    totalGuests: 29,
    confirmedGuests: 18,
    pendingGuests: 11,
    organizerEmail: 'ead@uiecbead.com.br',
    description: 'AV1 e AV2 compostas por Prova objetiva Forms (peso 8) + Trabalho de pesquisa escrito individual (peso 2). Média >= 7.',
    driveFolderUrl: 'https://drive.google.com/open?id=1fPSmFUBNzrzK--n3NDKOdMR5HWk25AV7&usp=drive_copy',
    cornellDocUrl: '/?tab=aluno-caderno&disc=disc-4',
    attendanceFormUrl: 'https://forms.gle/QiWRgTit6XjxP9Ci7',
    attachments: [
      {
        id: 'att-04-drive',
        title: 'Direitos Humanos (Drive)',
        type: 'drive',
        url: 'https://drive.google.com/open?id=1fPSmFUBNzrzK--n3NDKOdMR5HWk25AV7&usp=drive_copy',
        iconType: 'drive'
      },
      {
        id: 'att-04-docs',
        title: 'Anotações Cornell',
        type: 'docs',
        url: '/?tab=aluno-caderno&disc=disc-4',
        iconType: 'docs'
      }
    ]
  },

  // ── QUINTA-FEIRA ──
  {
    id: 'agenda-event-05',
    disciplinaId: 'disc-5',
    code: 'ETC-201',
    title: 'Ética Cristã - Profª Karoline Evangelista',
    professorName: 'Profª Karoline Evangelista',
    professorEmail: 'karolteologia@gmail.com',
    monitorName: 'Rosiane',
    dayOfWeek: 'Quinta-feira',
    dayOfWeekIndex: 4,
    startTime: '19:00',
    endTime: '20:25',
    colorTag: '#8b5cf6', // purple
    pillColor: 'bg-purple-500',
    bgLight: 'bg-purple-50/50',
    borderLight: 'border-purple-200/80',
    recurrenceRule: 'Semanal: cada quinta-feira, até 2 dez. 2026',
    googleMeetUrl: 'https://meet.google.com/ypd-yzwg-nrw',
    googleMeetCode: 'meet.google.com/ypd-yzwg-nrw',
    phoneBridge: '(BR) +55 31 3958-9560',
    phonePin: '341 510 949#',
    totalGuests: 30,
    confirmedGuests: 24,
    pendingGuests: 6,
    organizerEmail: 'ead@uiecbead.com.br',
    description: 'Livro-texto: Norman Geisler. Avaliação unificada V1/V2: Seminários práticos em grupos (3 a 4 alunos) sobre os Dez Mandamentos e Catecismo Maior de Westminster.',
    driveFolderUrl: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy',
    cornellDocUrl: '/?tab=aluno-caderno&disc=disc-5',
    attendanceFormUrl: 'https://forms.gle/Tn3Ln3iS9cbAUEsJ8',
    attachments: [
      {
        id: 'att-05-drive',
        title: 'Ética Cristã (Drive)',
        type: 'drive',
        url: 'https://drive.google.com/open?id=1xuOm61ul94H3kdU5psFtbl-I2KZ41QJC&usp=drive_copy',
        iconType: 'drive'
      },
      {
        id: 'att-05-docs',
        title: 'Anotações Cornell',
        type: 'docs',
        url: '/?tab=aluno-caderno&disc=disc-5',
        iconType: 'docs'
      }
    ]
  },
  {
    id: 'agenda-event-06',
    disciplinaId: 'disc-6',
    code: 'NT-301',
    title: 'Novo Testamento III (Epístolas Gerais) - Profº Marcio Leal',
    professorName: 'Profº Marcio Leal',
    professorEmail: 'pr.marcioleal@gmail.com',
    monitorName: 'Camila',
    dayOfWeek: 'Quinta-feira',
    dayOfWeekIndex: 4,
    startTime: '20:35',
    endTime: '22:00',
    colorTag: '#7c3aed', // purple dark
    pillColor: 'bg-purple-600',
    bgLight: 'bg-purple-50/50',
    borderLight: 'border-purple-200/80',
    recurrenceRule: 'Semanal: cada quinta-feira, até 2 dez. 2026',
    googleMeetUrl: 'https://meet.google.com/nyn-xjqk-vky',
    googleMeetCode: 'meet.google.com/nyn-xjqk-vky',
    phoneBridge: '(BR) +55 11 4935-0167',
    phonePin: '813 789 014#',
    totalGuests: 31,
    confirmedGuests: 21,
    pendingGuests: 10,
    organizerEmail: 'ead@uiecbead.com.br',
    description: 'Metodologia com câmeras ligadas e anotações ativas dos slides sintéticos. Livro-base: Introdução ao NT (Carson/Moo/Morris). Avaliação: 150 questões discursivas e orais.',
    driveFolderUrl: 'https://drive.google.com/open?id=1ppsv5caJVbHw-1RwhHu8nxBmqFT9Wm9P&usp=drive_copy',
    cornellDocUrl: '/?tab=aluno-caderno&disc=disc-6',
    attendanceFormUrl: 'https://forms.gle/SC1mSMSZfDhJPPVE9',
    attachments: [
      {
        id: 'att-06-drive',
        title: 'Novo Testamento III (Drive)',
        type: 'drive',
        url: 'https://drive.google.com/open?id=1ppsv5caJVbHw-1RwhHu8nxBmqFT9Wm9P&usp=drive_copy',
        iconType: 'drive'
      },
      {
        id: 'att-06-docs',
        title: 'Anotações Cornell',
        type: 'docs',
        url: '/?tab=aluno-caderno&disc=disc-6',
        iconType: 'docs'
      }
    ]
  },

  // ── SEXTA-FEIRA ──
  {
    id: 'agenda-event-07',
    disciplinaId: 'disc-7',
    code: 'MIS-202',
    title: 'Plantação & Revitalização II - Profº Thácyto Lessa',
    professorName: 'Profº Thácyto Lessa',
    professorEmail: 'thacyto@gmail.com',
    monitorName: 'Camila',
    dayOfWeek: 'Sexta-feira',
    dayOfWeekIndex: 5,
    startTime: '19:00',
    endTime: '20:00',
    colorTag: '#f59e0b', // amber
    pillColor: 'bg-amber-500',
    bgLight: 'bg-amber-50/50',
    borderLight: 'border-amber-200/80',
    recurrenceRule: 'Semanal: cada sexta-feira, até 2 dez. 2026',
    googleMeetUrl: 'https://meet.google.com/jwb-wpvc-pzm',
    googleMeetCode: 'meet.google.com/jwb-wpvc-pzm',
    phoneBridge: '(BR) +55 11 4935-2549',
    phonePin: '177 432 157#',
    totalGuests: 30,
    confirmedGuests: 25,
    pendingGuests: 5,
    organizerEmail: 'ead@uiecbead.com.br',
    description: 'Foco em Revitalização de Igrejas. AV1: Resumo capítulo por capítulo (12 folhas) de "A Treliça e a Videira". AV2: Prova com consulta em 27/11.',
    driveFolderUrl: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy',
    cornellDocUrl: '/?tab=aluno-caderno&disc=disc-7',
    attendanceFormUrl: 'https://forms.gle/bSqjHe7zsV1EJDDB6',
    attachments: [
      {
        id: 'att-07-drive',
        title: 'Plantação & Revitalização (Drive)',
        type: 'drive',
        url: 'https://drive.google.com/open?id=1nzXIDnWvvrxSgXQULaSvDGdVr32L_xP8&usp=drive_copy',
        iconType: 'drive'
      },
      {
        id: 'att-07-docs',
        title: 'Anotações Cornell',
        type: 'docs',
        url: '/?tab=aluno-caderno&disc=disc-7',
        iconType: 'docs'
      }
    ]
  },
  {
    id: 'agenda-event-08',
    disciplinaId: 'disc-8',
    code: 'TCC-101',
    title: 'TCC I - Profª Gabriela Leal',
    professorName: 'Profª Gabriela Leal',
    professorEmail: 'gabriela.lealg7757@gmail.com',
    monitorName: 'Rosiane',
    dayOfWeek: 'Sexta-feira',
    dayOfWeekIndex: 5,
    startTime: '20:00',
    endTime: '21:00',
    colorTag: '#d97706', // amber dark
    pillColor: 'bg-amber-600',
    bgLight: 'bg-amber-50/50',
    borderLight: 'border-amber-200/80',
    recurrenceRule: 'Semanal: cada sexta-feira, até 2 dez. 2026',
    googleMeetUrl: 'https://meet.google.com/jnz-hkqd-edc',
    googleMeetCode: 'meet.google.com/jnz-hkqd-edc',
    phoneBridge: '(BR) +55 11 4935-6584',
    phonePin: '568 309 440#',
    totalGuests: 30,
    confirmedGuests: 23,
    pendingGuests: 7,
    organizerEmail: 'ead@uiecbead.com.br',
    description: 'Orientação metodológica ABNT de Projetos de Pesquisa Teológica. Capa, Justificativa, Referencial Teórico, Cronograma e Orientador Temático.',
    driveFolderUrl: 'https://drive.google.com/open?id=1f-9i-TpqaZhzoLyrxg6flM6CHTsAOWPj&usp=drive_copy',
    cornellDocUrl: '/?tab=aluno-caderno&disc=disc-8',
    attendanceFormUrl: 'https://forms.gle/vULryGYArnJZgBF28',
    attachments: [
      {
        id: 'att-08-drive',
        title: 'TCC I (Drive)',
        type: 'drive',
        url: 'https://drive.google.com/open?id=1f-9i-TpqaZhzoLyrxg6flM6CHTsAOWPj&usp=drive_copy',
        iconType: 'drive'
      },
      {
        id: 'att-08-docs',
        title: 'Anotações Cornell',
        type: 'docs',
        url: '/?tab=aluno-caderno&disc=disc-8',
        iconType: 'docs'
      }
    ]
  },
  {
    id: 'agenda-event-09',
    disciplinaId: 'disc-9',
    code: 'AFR-101',
    title: 'Cultura Afro e Indígena - Profº Emerson Silva',
    professorName: 'Profº Emerson Silva',
    professorEmail: 'emerson@uicb.edu.br',
    monitorName: 'Cristiano',
    dayOfWeek: 'Sexta-feira',
    dayOfWeekIndex: 5,
    startTime: '21:00',
    endTime: '22:00',
    colorTag: '#b45309', // amber deep
    pillColor: 'bg-amber-700',
    bgLight: 'bg-amber-50/50',
    borderLight: 'border-amber-200/80',
    recurrenceRule: 'Semanal: cada sexta-feira, até 2 dez. 2026 (EAD)',
    googleMeetUrl: 'https://meet.google.com/jnz-hkqd-edc',
    googleMeetCode: 'meet.google.com/jnz-hkqd-edc',
    phoneBridge: '(BR) +55 11 4935-6584',
    phonePin: '568 309 440#',
    totalGuests: 30,
    confirmedGuests: 20,
    pendingGuests: 10,
    organizerEmail: 'ead@uiecbead.com.br',
    description: 'Estudo da formação étnica brasileira, diversidade cultural e aplicação pastoral e eclesiológica congregacional.',
    driveFolderUrl: 'https://drive.google.com/open?id=13vp8jOcvdtH13O2iauyvsaTCw7DwiPIa&usp=drive_copy',
    cornellDocUrl: '/?tab=aluno-caderno&disc=disc-9',
    attendanceFormUrl: 'https://forms.gle/vULryGYArnJZgBF28',
    attachments: [
      {
        id: 'att-09-drive',
        title: 'Cultura Afro & Indígena (Drive)',
        type: 'drive',
        url: 'https://drive.google.com/open?id=13vp8jOcvdtH13O2iauyvsaTCw7DwiPIa&usp=drive_copy',
        iconType: 'drive'
      },
      {
        id: 'att-09-docs',
        title: 'Anotações Cornell',
        type: 'docs',
        url: '/?tab=aluno-caderno&disc=disc-9',
        iconType: 'docs'
      }
    ]
  }
];

// ── PERSISTÊNCIA LOCAL-FIRST DE RSVP DO USUÁRIO ──
const RSVP_STORAGE_KEY = 'koinonia_lms_google_agenda_rsvp';

export function getUserRSVPs(): Record<string, RSVPStatus> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(RSVP_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveUserRSVP(eventId: string, status: RSVPStatus): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getUserRSVPs();
    current[eventId] = status;
    localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('koinonia_rsvp_changed', { detail: { eventId, status } }));
  } catch (err) {
    console.error('Erro ao salvar RSVP:', err);
  }
}

export function getUserRSVP(eventId: string): RSVPStatus {
  const all = getUserRSVPs();
  return all[eventId] || 'yes'; // Padrão: 'yes' (aluno matriculado)
}

// ── GERAÇÃO DE URL PARA ADICIONAR DIRETO À GOOGLE AGENDA PESSOAL ──
export function generateGoogleCalendarUrl(event: GoogleAgendaEvent): string {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const text = encodeURIComponent(event.title);
  const details = encodeURIComponent(
    `${event.description}\n\nGoogle Meet: ${event.googleMeetUrl}\nTelefone: ${event.phoneBridge} (PIN: ${event.phonePin})\nDrive da Disciplina: ${event.driveFolderUrl}\nOrganizador: ${event.organizerEmail}`
  );
  const location = encodeURIComponent(event.googleMeetUrl);
  
  // Próxima data de ocorrência no semestre 2026.2 (Formato YYYYMMDDTHHmmssZ)
  const startHourStr = event.startTime.replace(':', '') + '00';
  const endHourStr = event.endTime.replace(':', '') + '00';
  const dates = `20260825T${startHourStr}Z/20260825T${endHourStr}Z`;
  
  const recur = encodeURIComponent('RRULE:FREQ=WEEKLY;UNTIL=20261202T235959Z');

  return `${base}&text=${text}&details=${details}&location=${location}&dates=${dates}&recur=${recur}`;
}

// ── GERAÇÃO E DOWNLOAD DE ARQUIVO .ICS PARA APPLE CALENDAR / OUTLOOK / GOOGLE ──
export function downloadIcsFile(event: GoogleAgendaEvent): void {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Seminario Teologico Koinonia//LMS 2026.2//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@koinonia.uiecbead.com.br`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\\n\\nGoogle Meet: ${event.googleMeetUrl}\\nTelefone: ${event.phoneBridge} PIN: ${event.phonePin}`,
    `LOCATION:${event.googleMeetUrl}`,
    `ORGANIZER;CN=Seminario Koinonia:mailto:${event.organizerEmail}`,
    'RRULE:FREQ=WEEKLY;UNTIL=20261202T235959Z',
    `DTSTART:20260825T${event.startTime.replace(':', '')}00`,
    `DTEND:20260825T${event.endTime.replace(':', '')}00`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${event.code}_${event.title.split(' ')[0]}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── DOWNLOAD DO ARQUIVO ICS COM TODAS AS 9 DISCIPLINAS DO SEMESTRE 2026.2 (1-CLIQUE) ──
export function downloadFullSemesterIcsFile(): void {
  const eventsBlocks = GOOGLE_AGENDA_EVENTS.map((event) => {
    return [
      'BEGIN:VEVENT',
      `UID:${event.id}-full@koinonia.uiecbead.com.br`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}\\n\\nGoogle Meet: ${event.googleMeetUrl}\\nTelefone: ${event.phoneBridge} PIN: ${event.phonePin}\\nDrive: ${event.driveFolderUrl}`,
      `LOCATION:${event.googleMeetUrl}`,
      `ORGANIZER;CN=Seminario Koinonia:mailto:${event.organizerEmail}`,
      'RRULE:FREQ=WEEKLY;UNTIL=20261202T235959Z',
      `DTSTART:20260825T${event.startTime.replace(':', '')}00`,
      `DTEND:20260825T${event.endTime.replace(':', '')}00`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    ].join('\r\n');
  }).join('\r\n');

  const fullIcsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Seminario Teologico Koinonia//LMS Grade Completa 2026.2//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Grade 2026.2 • Seminário Koinonia',
    'X-WR-TIMEZONE:America/Sao_Paulo',
    eventsBlocks,
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([fullIcsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Grade_Completa_2026_2_Seminario_Koinonia.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── GESTÃO DE URL PERSONALIZADA DA AGENDA INDIVIDUAL DO ALUNO (ZERO-EGRESS) ──
export function getCustomCalendarUrl(email?: string): string {
  const normEmail = (email || 'sacrasub@gmail.com').toLowerCase().trim();
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`lms_custom_calendar_url_${normEmail}`) || '';
  }
  return '';
}

export function saveCustomCalendarUrl(url: string, email?: string): void {
  const normEmail = (email || 'sacrasub@gmail.com').toLowerCase().trim();
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(`lms_custom_calendar_url_${normEmail}`, url.trim());
    } else {
      localStorage.removeItem(`lms_custom_calendar_url_${normEmail}`);
    }
  }
}

// ── OBTENÇÃO DE EVENTOS POR DIA DA SEMANA ──
export function getEventsByDay(): Record<string, GoogleAgendaEvent[]> {
  return {
    'Terça-feira': GOOGLE_AGENDA_EVENTS.filter((e) => e.dayOfWeek === 'Terça-feira'),
    'Quarta-feira': GOOGLE_AGENDA_EVENTS.filter((e) => e.dayOfWeek === 'Quarta-feira'),
    'Quinta-feira': GOOGLE_AGENDA_EVENTS.filter((e) => e.dayOfWeek === 'Quinta-feira'),
    'Sexta-feira': GOOGLE_AGENDA_EVENTS.filter((e) => e.dayOfWeek === 'Sexta-feira'),
  };
}

// ── DETECTA SE HÁ AULA AO VIVO NESTE INSTANTE ──
export function getLiveEventNow(): { isLive: boolean; currentEvent: GoogleAgendaEvent | null; nextEvent: GoogleAgendaEvent | null } {
  const now = new Date();
  const day = now.getDay(); // 0=domingo, 1=seg, 2=terça, 3=quarta, 4=quinta, 5=sexta, 6=sábado
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayEvents = GOOGLE_AGENDA_EVENTS.filter((e) => e.dayOfWeekIndex === day);

  let currentEvent: GoogleAgendaEvent | null = null;
  let nextEvent: GoogleAgendaEvent | null = null;

  for (const ev of todayEvents) {
    const [sH, sM] = ev.startTime.split(':').map(Number);
    const [eH, eM] = ev.endTime.split(':').map(Number);
    const startMin = sH * 60 + sM;
    const endMin = eH * 60 + eM;

    if (currentMinutes >= startMin && currentMinutes <= endMin) {
      currentEvent = ev;
      break;
    } else if (currentMinutes < startMin && !nextEvent) {
      nextEvent = ev;
    }
  }

  // Se não tem próxima hoje, pega a primeira do próximo dia letivo
  if (!currentEvent && !nextEvent) {
    const sorted = [...GOOGLE_AGENDA_EVENTS].sort((a, b) => {
      if (a.dayOfWeekIndex !== b.dayOfWeekIndex) return a.dayOfWeekIndex - b.dayOfWeekIndex;
      return a.startTime.localeCompare(b.startTime);
    });
    nextEvent = sorted.find((e) => e.dayOfWeekIndex > day) || sorted[0];
  }

  return {
    isLive: currentEvent !== null,
    currentEvent,
    nextEvent
  };
}
