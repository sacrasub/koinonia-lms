'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Calendar as CalendarIcon, Clock, BookOpen, Layers, 
  Search, Sliders, CheckCircle2, RotateCcw, Check, Settings, Sparkles, 
  FlaskConical, Compass, ArrowRight, Tags, Info, Globe, ChevronLeft, ChevronRight, X,
  Video, ExternalLink, CheckSquare
} from 'lucide-react';
import { subscribeToStudentSync, savePortalProfile } from '@/services/studentSyncService';
import { UserRole } from '@/types';

interface PortalAcademicoPageProps {
  userEmail?: string;
  currentRole?: UserRole;
  onTabChange?: (tab: string) => void;
}

// --- DATA STRUCTURES (2026.2 OFFICIAL DATA) ---
const portalData = {
  calendario_2026_2: {
    arquivo_origem: "CALENDÁRIO 2026.2.pdf",
    meses: ["Agosto 2026", "Setembro 2026", "Outubro 2026", "Novembro 2026", "Dezembro 2026"],
    legenda_categorias: [
      "Dias não letivos", "Domingos e Feriados Nacionais", "Semana Teológica", 
      "Início do período letivo", "Dias letivos", "Dia da Denominação e dia do Professor", 
      "Período de AV1 e AV2", "Formatura 2026", "Período de Recuperação", "Diários à Secretaria"
    ],
    observacao: "Nos dias 8/set, 13/out e 3/nov, haverá aulas para os alunos do Curso Básico de Teologia, tendo em vista os feriados nacionais que antecedem essas datas, com isso evitaremos prejuízos nos dias letivos."
  },
  curriculo_atualizado: {
    arquivo_origem: "CURRÍCULO ATUALIZADO 23JULHO_2026.pdf",
    revisado_em: "23 DE JULHO DE 2026",
    periodos: [
      {
        periodo: "1º Período",
        disciplinas: [
          { nome: "Introdução à Antropologia", creditos: 2, carga_horaria: 36 },
          { nome: "Introdução à Filosofia", creditos: 2, carga_horaria: 36 },
          { nome: "Introdução à Psicologia", creditos: 2, carga_horaria: 36 },
          { nome: "Introdução à Sociologia", creditos: 2, carga_horaria: 36 },
          { nome: "Introdução à Teologia", creditos: 2, carga_horaria: 36 },
          { nome: "Metodologia do Trabalho Científico", creditos: 2, carga_horaria: 36 },
          { nome: "Métodos de Estudo Bíblico", creditos: 2, carga_horaria: 36 },
          { nome: "Teologia Sistemática I - Escrituras e Deus", creditos: 3, carga_horaria: 54 }
        ],
        total_semestre: { creditos: 17, carga_horaria: 306 }
      },
      {
        periodo: "2º Período",
        disciplinas: [
          { nome: "Antigo Testamento I - Livros do Pentateuco", creditos: 3, carga_horaria: 54 },
          { nome: "Evangelismo", creditos: 2, carga_horaria: 36 },
          { nome: "Geografia e Arqueologia Bíblica", creditos: 2, carga_horaria: 36 },
          { nome: "História das Religiões", creditos: 2, carga_horaria: 36 },
          { nome: "Língua Portuguesa I", creditos: 2, carga_horaria: 36 },
          { nome: "Língua Portuguesa II", creditos: 2, carga_horaria: 36 },
          { nome: "Teologia Sistemática II Hamartiologia/Angelologia", creditos: 3, carga_horaria: 54 },
          { nome: "Vocação", creditos: 2, carga_horaria: 36 }
        ],
        total_semestre: { creditos: 18, carga_horaria: 324 }
      },
      {
        periodo: "3º Período",
        disciplinas: [
          { nome: "Antigo Testamento II - Livros Históricos", creditos: 3, carga_horaria: 54 },
          { nome: "Fundamentos e Prática do Discipulado", creditos: 2, carga_horaria: 36 },
          { nome: "Hermenêutica Bíblica", creditos: 2, carga_horaria: 36 },
          { nome: "Homilética I", creditos: 2, carga_horaria: 36 },
          { nome: "Homilética II", creditos: 2, carga_horaria: 36 },
          { nome: "Introdução ao Novo Testamento", creditos: 2, carga_horaria: 36 },
          { nome: "Teologia da Missão", creditos: 2, carga_horaria: 36 },
          { nome: "Teologia Sistemática III - Cristologia/Pneumatologia", creditos: 3, carga_horaria: 54 }
        ],
        total_semestre: { creditos: 18, carga_horaria: 324 }
      },
      {
        periodo: "4º Período",
        disciplinas: [
          { nome: "Antigo Testamento III Livros Poéticos", creditos: 3, carga_horaria: 54 },
          { nome: "Cosmovisão Cristã e Contextualização", creditos: 2, carga_horaria: 36 },
          { nome: "Liderança Cristã", creditos: 2, carga_horaria: 36 },
          { nome: "Novo Testamento I Evangelhos e Atos", creditos: 3, carga_horaria: 54 },
          { nome: "Plantação e Revitalização de Igrejas I", creditos: 2, carga_horaria: 36 },
          { nome: "Plantação e Revitalização de Igrejas II", creditos: 2, carga_horaria: 36 },
          { nome: "Teologia Bíblica do Antigo Testamento", creditos: 2, carga_horaria: 36 },
          { nome: "Teologia Sistemática IV - Soteriologia/Eclesiologia", creditos: 3, carga_horaria: 54 }
        ],
        total_semestre: { creditos: 19, carga_horaria: 342 }
      },
      {
        periodo: "5º Período",
        disciplinas: [
          { nome: "Aconselhamento Bíblico I", creditos: 2, carga_horaria: 36 },
          { nome: "Aconselhamento Bíblico II", creditos: 2, carga_horaria: 36 },
          { nome: "Antigo Testamento IV - Livros Proféticos", creditos: 3, carga_horaria: 54 },
          { nome: "Exegese do Antigo Testamento", creditos: 3, carga_horaria: 54 },
          { nome: "Hebraico Instrumental", creditos: 2, carga_horaria: 36 },
          { nome: "História da Igreja I Igreja Antiga (5 a 590 d.C.)", creditos: 2, carga_horaria: 36 },
          { nome: "História da Igreja II - Igreja Medieval (590-1517 d.C.)", creditos: 2, carga_horaria: 36 },
          { nome: "Teologia Sistemática V - Escatologia", creditos: 3, carga_horaria: 54 }
        ],
        total_semestre: { creditos: 19, carga_horaria: 342 }
      },
      {
        periodo: "6º Período",
        disciplinas: [
          { nome: "Apologética I", creditos: 2, carga_horaria: 36 },
          { nome: "Apologética II", creditos: 2, carga_horaria: 36 },
          { nome: "Exegese do Novo Testamento", creditos: 3, carga_horaria: 54 },
          { nome: "Grego I", creditos: 2, carga_horaria: 36 },
          { nome: "Grego II", creditos: 2, carga_horaria: 36 },
          { nome: "História do Pensamento Cristão I", creditos: 2, carga_horaria: 36 },
          { nome: "História do Pensamento Cristão II", creditos: 2, carga_horaria: 36 },
          { nome: "Novo Testamento II - Epístolas Paulinas", creditos: 3, carga_horaria: 54 }
        ],
        total_semestre: { creditos: 18, carga_horaria: 324 }
      },
      {
        periodo: "7º Período",
        disciplinas: [
          { nome: "Administração Eclesiástica", creditos: 2, carga_horaria: 36 },
          { nome: "Direitos Humanos", creditos: 2, carga_horaria: 36 },
          { nome: "História do Congregacionalismo", creditos: 2, carga_horaria: 36 },
          { nome: "História do Protestantismo no Brasil", creditos: 2, carga_horaria: 36 },
          { nome: "Novo Testamento III Epístolas Gerais", creditos: 3, carga_horaria: 54 },
          { nome: "Tecnologias e Mídias Sociais Aplicadas ao Ministério", creditos: 2, carga_horaria: 36 },
          { nome: "Teologia Bíblica do Novo Testamento", creditos: 2, carga_horaria: 36 },
          { nome: "Teologia Contemporânea", creditos: 2, carga_horaria: 36 }
        ],
        total_semestre: { creditos: 17, carga_horaria: 306 }
      },
      {
        periodo: "8º Período",
        disciplinas: [
          { nome: "Eclesiologia Congregacional", creditos: 2, carga_horaria: 36 },
          { nome: "Ecumenismo e Diálogo inter Religioso", creditos: 2, carga_horaria: 36 },
          { nome: "Educação e Meio Ambiente", creditos: 2, carga_horaria: 36 },
          { nome: "Ética Cristã", creditos: 2, carga_horaria: 36 },
          { nome: "História da Cultura Afro Brasileira e Indígena", creditos: 2, carga_horaria: 36 },
          { nome: "História de Missões", creditos: 2, carga_horaria: 36 },
          { nome: "Oratória Sacra", creditos: 2, carga_horaria: 36 },
          { nome: "Teologia Pastoral", creditos: 2, carga_horaria: 36 }
        ],
        total_semestre: { creditos: 16, carga_horaria: 288 }
      }
    ],
    extensao_e_pesquisa_obrigatorias: [
      { nome: "Estágio Supervisionado I - Ação Pastoral (5º Período)", creditos: 4, carga_horaria: 72 },
      { nome: "Estágio Supervisionado II - Ensino (8º Período)", creditos: 4, carga_horaria: 72 },
      { nome: "TCC I (7º Período)", creditos: 2, carga_horaria: 36 },
      { nome: "TCC II - Artigo (Apresentação) - (8º Período)", creditos: 2, carga_horaria: 36 }
    ],
    total_extensao_e_pesquisa: { creditos: 12, carga_horaria: 216 },
    acumulado_total: { creditos: 154, carga_horaria: 2772 }
  },
  horario_integrado_2026_2: {
    arquivo_origem: "Horário Integrado 2026_2- atualizado.pdf",
    instituicao: "Seminário Teológico Congregacional",
    grade_horaria: [
      {
        turma: "Fim de Semana - 5º Período",
        horarios: [
          { dia: "Sexta-feira", horario: "19:00-20:00", materia: "Grego I / Grego II", professor: "Prof. Samuel Cesarino" },
          { dia: "Sexta-feira", horario: "20:00-21:00", materia: "Grego I / Grego II", professor: "Prof. Samuel Cesarino" },
          { dia: "Sexta-feira", horario: "21:00-22:00", materia: "Exegese do Novo Testamento", professor: "Prof. Willian Orlandi" },
          { dia: "Sábado", horario: "07:00-08:20", materia: "Apologética I / Apologética II", professor: "Profª Karoline Evangelista" },
          { dia: "Sábado", horario: "08:30-09:50", materia: "Apologética I / Apologética II", professor: "Profª Karoline Evangelista" },
          { dia: "Sábado", horario: "10:00-11:20", materia: "Novo Testamento II - Epístolas Paulinas", professor: "Profº Alexsandro Silva" },
          { dia: "Sábado", horario: "13:00-14:20", materia: "História do Pensamento Cristão I / História do Pensamento Cristão II", professor: "Profº Leonardo Paulino" },
          { dia: "Sábado", horario: "14:30-15:50", materia: "História do Pensamento Cristão I / História do Pensamento Cristão II", professor: "Profº Leonardo Paulino" }
        ],
        observacoes: [
          "Alunos do 5º e 8º período do curso (todas as turmas) encontram-se cadastrados nas matérias de Estágio Supervisionado I (Práticas Pastorais) e Estágio Supervisionado II (Práticas de Educação), cujas aulas serão ministradas, excepcionalmente, às segundas-feiras sob condução do Prof Antônio Carlos."
        ]
      },
      {
        turma: "Semanal Noturno - Turma A - Veteranos - 7º Período",
        horarios: [
          { dia: "Terça-feira", horario: "19:00-20:25", materia: "História do Congregacionalismo", professor: "Prof. Ary Júnior", meetUrl: "https://meet.google.com/sef-ggpp-bbn" },
          { dia: "Terça-feira", horario: "20:35-22:00", materia: "História do Pensamento Cristão II", professor: "Prof. Hilário Bispo", meetUrl: "https://meet.google.com/cxj-yetd-xpf" },
          { dia: "Quarta-feira", horario: "19:00-20:25", materia: "Aconselhamento Bíblico II", professor: "Prof. Uilian Santos", meetUrl: "https://meet.google.com/ifv-zsdd-gjx" },
          { dia: "Quarta-feira", horario: "20:35-22:00", materia: "Direitos Humanos", professor: "Prof. Cleiton Barbirato", meetUrl: "https://meet.google.com/uva-zmav-rds" },
          { dia: "Quinta-feira", horario: "19:00-20:25", materia: "Ética Cristã", professor: "Profª Karoline Evangelista", meetUrl: "https://meet.google.com/ypd-yzwg-nrw" },
          { dia: "Quinta-feira", horario: "20:35-22:00", materia: "Novo Testamento III - Epístolas Gerais", professor: "Prof. Marcio Leal", meetUrl: "https://meet.google.com/nyn-xjqk-vky" },
          { dia: "Sexta-feira", horario: "19:00-20:25", materia: "Plantação e Revitalização de Igrejas II", professor: "Profº Thácyto Lessa", meetUrl: "https://meet.google.com/jwb-wpvc-pzm" },
          { dia: "Sexta-feira", horario: "19:00-20:00", materia: "TCC I", professor: "Profª Gabriela Leal", meetUrl: "https://meet.google.com/jnz-hkqd-edc" },
          { dia: "Sexta-feira", horario: "20:00-21:00 / 20:35-22:00", materia: "História da Cultura Afro Brasileira e Indígena", professor: "Prof. Emerson Silva", formato: "módulo gravado" }
        ]
      },
      {
        turma: "Semanal Noturno - Turma B - 3º Período",
        horarios: [
          { 
            dia: "Terça-feira", 
            horario: "19:00-20:25", 
            materia: "Introdução ao Novo Testamento", 
            professor: "Profº Leonardo Paulino", 
            meetUrl: "https://meet.google.com/esq-sjmd-sau",
            phone: "(BR) +55 11 4933-7995",
            pin: "930 167 860#",
            telUrl: "https://tel.meet/esq-sjmd-sau?pin=6781630980308"
          },
          { 
            dia: "Terça-feira", 
            horario: "20:35-22:00", 
            materia: "Hermenêutica Bíblica", 
            professor: "Profº David Bezerra", 
            meetUrl: "https://meet.google.com/vee-maaz-cdn",
            phone: "(BR) +55 51 4560-7523",
            pin: "800 017 642#",
            telUrl: "https://tel.meet/vee-maaz-cdn?pin=2110831424383"
          },
          { 
            dia: "Quarta-feira", 
            horario: "19:00-20:25", 
            materia: "Fundamentos e Prática do Discipulado", 
            professor: "Profº José Milton", 
            meetUrl: "https://meet.google.com/xrk-hfza-tks",
            phone: "(BR) +55 21 4560-7221",
            pin: "221 096 667#",
            telUrl: "https://tel.meet/xrk-hfza-tks?pin=7368054294151"
          },
          { 
            dia: "Quarta-feira", 
            horario: "20:35-22:00", 
            materia: "Teologia da Missão", 
            professor: "Profº Jefferson Pontes", 
            meetUrl: "https://meet.google.com/gjg-jrbq-atk",
            phone: "(BR) +55 41 4560-9980",
            pin: "732 549 857#",
            telUrl: "https://tel.meet/gjg-jrbq-atk?pin=8301681074857"
          },
          { dia: "Quinta-feira", horario: "19:00-20:25", materia: "Teologia Sistemática III - Cristologia/Pneumatologia", professor: "Profº Marcio Leal" },
          { dia: "Quinta-feira", horario: "20:35-22:00", materia: "Antigo Testamento II - Livros Históricos", professor: "Profª Betânia Barbosa" },
          { dia: "Sexta-feira", horario: "19:00-20:25", materia: "Plantação e Revitalização de Igrejas II", professor: "Profº Thácyto Lessa", meetUrl: "https://meet.google.com/jwb-wpvc-pzm" },
          { dia: "Sexta-feira", horario: "19:00-20:25", materia: "Liderança Cristã", professor: "Profº Sandro Cruz" },
          { dia: "Sexta-feira", horario: "19:00-20:00", materia: "Homilética I / Homilética II (Novatos26.2)", professor: "Profº Wellington Estrela", formato: "módulo gravado" },
          { dia: "Sexta-feira", horario: "20:00-21:00", materia: "Homilética I / Homilética II (Novatos26.2)", professor: "Profº Wellington Estrela", formato: "módulo gravado" }
        ],
        observacoes: [
          "Homilética II (módulo gravado)"
        ]
      },
      {
        turma: "Semanal Noturno - Turma Básico de Teologia",
        horarios: [
          { dia: "Segunda-feira", horario: "19:00-20:25", materia: "Panorama do Antigo Testamento", professor: "Profª Betânia Barbosa" },
          { dia: "Segunda-feira", horario: "20:35-22:00", materia: "Liderança Espiritual", professor: "Prof. Robert Franque" },
          { dia: "Quarta-feira", horario: "19:00-20:25", materia: "Teologia I - Principais Doutrinas da Fé Cristã", professor: "Prof. Álvaro Marinho" },
          { dia: "Quarta-feira", horario: "20:35-22:00", materia: "Evangelismo e Discipulado", professor: "Profª Sylvia Maia" },
          { dia: "Sexta-feira", horario: "19:00-20:25", materia: "Interpretação Bíblica", professor: "Prof. Sandro Cruz" },
          { dia: "Sexta-feira", horario: "20:35-22:00", materia: "História da Igreja", professor: "Prof. Alexsandro Silva" }
        ]
      }
    ]
  }
};

export const PortalAcademicoPage: React.FC<PortalAcademicoPageProps> = ({ userEmail, currentRole, onTabChange }) => {
  const normalizedEmail = (userEmail || 'default_student').toLowerCase().trim();
  const isReadOnly = currentRole === 'admin' || currentRole === 'monitor';

  // Navigation inside Module
  const [activeTab, setActiveTab] = useState<'inicio' | 'calendario' | 'horario' | 'curriculo'>('inicio');

  // Helper to extract all subjects
  const getAllSubjects = () => {
    const list: { nome: string; creditos: number; carga_horaria: number; periodoNum: number }[] = [];
    portalData.curriculo_atualizado.periodos.forEach((p, idx) => {
      p.disciplinas.forEach((d) => {
        list.push({ nome: d.nome, creditos: d.creditos, carga_horaria: d.carga_horaria, periodoNum: idx + 1 });
      });
    });
    portalData.curriculo_atualizado.extensao_e_pesquisa_obrigatorias.forEach((d) => {
      let pNum = 7;
      if (d.nome.includes("5º")) pNum = 5;
      if (d.nome.includes("8º")) pNum = 8;
      list.push({ nome: d.nome, creditos: d.creditos, carga_horaria: d.carga_horaria, periodoNum: pNum });
    });
    return list;
  };

  // Auto-mark previous subjects helper
  const getAutoMarkedPrevious = (periodoNum: number) => {
    const allSubs = getAllSubjects();
    if (periodoNum > 1 && periodoNum <= 8) {
      return allSubs.filter((s) => s.periodoNum < periodoNum).map((s) => s.nome);
    }
    return [];
  };

  // Student Profile State
  const [studentProfile, setStudentProfile] = useState<{
    periodoNum: number;
    turmaIdx: number;
    autoMarkPrevious: boolean;
    completedSubjects: string[];
  }>(() => {
    let p = 7;
    let t = 1;
    let auto = true;
    let comp: string[] = [];

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`lms_profile_${normalizedEmail}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          p = parsed.periodoNum !== undefined ? Number(parsed.periodoNum) : 7;
          t = parsed.turmaIdx !== undefined ? Number(parsed.turmaIdx) : (p === 5 ? 0 : p === 7 ? 1 : p === 3 ? 2 : 1);
          auto = parsed.autoMarkPrevious !== undefined ? Boolean(parsed.autoMarkPrevious) : true;
          comp = Array.isArray(parsed.completedSubjects) ? parsed.completedSubjects : [];
        }
      } catch (e) {}
    }

    if (auto && p > 1 && p <= 8) {
      const autoPrev = getAutoMarkedPrevious(p);
      comp = Array.from(new Set([...autoPrev, ...comp]));
    }

    return {
      periodoNum: p,
      turmaIdx: t,
      autoMarkPrevious: auto,
      completedSubjects: comp
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPeriodo, setModalPeriodo] = useState(studentProfile.periodoNum);
  const [modalTurma, setModalTurma] = useState(studentProfile.turmaIdx);
  const [modalAutoMark, setModalAutoMark] = useState(studentProfile.autoMarkPrevious);

  // Curriculum State
  const [currentStatusFilter, setCurrentStatusFilter] = useState<'all' | 'concluida' | 'em_andamento' | 'pendente'>('all');
  const [curriculumSearch, setCurriculumSearch] = useState('');

  // Calendar State
  const [calendarMode, setCalendarMode] = useState<'month' | 'week' | 'year'>('month');
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0); // 0: Aug 2026

  const monthNames = ["Agosto 2026", "Setembro 2026", "Outubro 2026", "Novembro 2026", "Dezembro 2026"];
  const monthDays = [31, 30, 31, 30, 31];
  const monthStartDay = [6, 2, 4, 0, 2];

  const dayNameToIdx: Record<string, number> = {
    "Domingo": 0, "Segunda-feira": 1, "Terça-feira": 2, "Quarta-feira": 3,
    "Quinta-feira": 4, "Sexta-feira": 5, "Sábado": 6
  };

  const calendarEvents: Record<string, Record<number, { label: string; type: string }>> = {
    "Agosto 2026": { 1: { label: "Início do Período Letivo 2026.2", type: "inicio" } },
    "Setembro 2026": { 7: { label: "Feriado: Independência", type: "feriado" }, 8: { label: "Aula Básico", type: "especial" } },
    "Outubro 2026": {
      12: { label: "Feriado: N. Sra Aparecida", type: "feriado" },
      13: { label: "Aula Básico", type: "especial" },
      15: { label: "Dia do Professor", type: "especial" },
      19: { label: "Semana Teológica", type: "teologica" },
      20: { label: "Semana Teológica", type: "teologica" },
      21: { label: "Semana Teológica", type: "teologica" },
      22: { label: "Semana Teológica", type: "teologica" },
      23: { label: "Semana Teológica", type: "teologica" }
    },
    "Novembro 2026": {
      2: { label: "Feriado: Finados", type: "feriado" },
      3: { label: "Aula Básico", type: "especial" },
      15: { label: "Feriado: República", type: "feriado" },
      23: { label: "Período AV1 / AV2", type: "provas" },
      24: { label: "Período AV1 / AV2", type: "provas" },
      25: { label: "Período AV1 / AV2", type: "provas" },
      26: { label: "Período AV1 / AV2", type: "provas" },
      27: { label: "Período AV1 / AV2", type: "provas" }
    },
    "Dezembro 2026": {
      10: { label: "Diários à Secretaria", type: "diarios" },
      12: { label: "Formatura 2026", type: "formatura" },
      15: { label: "Recuperação", type: "recuperacao" },
      25: { label: "Feriado: Natal", type: "feriado" }
    }
  };

  // Convert GMT-3 (Brasília) time strings to user's Local Timezone
  const convertGmt3ToLocalTimeStr = (timeStr: string) => {
    if (!timeStr || typeof timeStr !== 'string') return timeStr;
    const localOffsetMin = -new Date().getTimezoneOffset();
    const gmt3OffsetMin = -180; // GMT-3
    const diffMin = localOffsetMin - gmt3OffsetMin;

    if (diffMin === 0) return timeStr;

    return timeStr.replace(/(\d{1,2}):(\d{2})/g, (_, hh, mm) => {
      let totalMin = parseInt(hh, 10) * 60 + parseInt(mm, 10) + diffMin;
      totalMin = (totalMin % 1440 + 1440) % 1440;
      const newH = String(Math.floor(totalMin / 60)).padStart(2, '0');
      const newM = String(totalMin % 60).padStart(2, '0');
      return `${newH}:${newM}`;
    });
  };

  // Load & Sync from Supabase DB + Local Cache
  useEffect(() => {
    const unsubscribe = subscribeToStudentSync(normalizedEmail, (data) => {
      if (data.portalProfile) {
        const parsed = data.portalProfile;
        const pNum = parsed.periodoNum !== undefined ? Number(parsed.periodoNum) : 7;
        const auto = parsed.autoMarkPrevious !== undefined ? Boolean(parsed.autoMarkPrevious) : true;
        let comp: string[] = Array.isArray(parsed.completedSubjects) ? parsed.completedSubjects : [];

        if (auto && pNum > 1 && pNum <= 8) {
          const autoPrev = getAutoMarkedPrevious(pNum);
          comp = Array.from(new Set([...autoPrev, ...comp]));
        }

        setStudentProfile({
          periodoNum: pNum,
          turmaIdx: parsed.turmaIdx !== undefined ? Number(parsed.turmaIdx) : (pNum === 5 ? 0 : pNum === 7 ? 1 : pNum === 3 ? 2 : 1),
          autoMarkPrevious: auto,
          completedSubjects: comp,
        });

        setModalPeriodo(pNum);
        if (parsed.turmaIdx !== undefined) setModalTurma(Number(parsed.turmaIdx));
        setModalAutoMark(auto);
      }
    });

    return () => unsubscribe();
  }, [normalizedEmail]);

  // Save Cloud & Local helper
  const saveProfile = (newProfile: typeof studentProfile) => {
    setStudentProfile(newProfile);
    if (!isReadOnly) {
      savePortalProfile(normalizedEmail, newProfile);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('lms_student_sync_updated', { detail: { email: normalizedEmail } })
        );
      }
    }
  };

  // Subject status logic
  const isSubjectCompleted = (nome: string) => {
    if (studentProfile.completedSubjects.includes(nome)) return true;
    if (studentProfile.autoMarkPrevious && studentProfile.periodoNum > 1 && studentProfile.periodoNum <= 8) {
      const sub = getAllSubjects().find((s) => s.nome === nome);
      if (sub && sub.periodoNum < studentProfile.periodoNum) {
        return true;
      }
    }
    return false;
  };

  const isSubjectInCurrentSemester = (nome: string) => {
    if (studentProfile.periodoNum === 0) return false;
    const sub = getAllSubjects().find((s) => s.nome === nome);
    return sub ? sub.periodoNum === studentProfile.periodoNum : false;
  };

  const getSubjectStatus = (nome: string) => {
    if (isSubjectCompleted(nome)) return 'concluida';
    if (isSubjectInCurrentSemester(nome)) return 'em_andamento';
    return 'pendente';
  };

  const toggleSubjectCompleted = (nome: string, isChecked: boolean) => {
    if (isReadOnly) return;
    let currentAllCompleted: string[] = [];
    if (studentProfile.autoMarkPrevious && studentProfile.periodoNum > 1 && studentProfile.periodoNum <= 8) {
      const autoPrev = getAutoMarkedPrevious(studentProfile.periodoNum);
      currentAllCompleted = Array.from(new Set([...autoPrev, ...studentProfile.completedSubjects]));
    } else {
      currentAllCompleted = [...studentProfile.completedSubjects];
    }

    let updated: string[] = [];
    if (isChecked) {
      updated = Array.from(new Set([...currentAllCompleted, nome]));
    } else {
      updated = currentAllCompleted.filter((item) => item !== nome);
    }

    const sub = getAllSubjects().find((s) => s.nome === nome);
    const isPrevious = sub && studentProfile.periodoNum > 1 && sub.periodoNum < studentProfile.periodoNum;
    const newAutoMark = isPrevious && !isChecked ? false : studentProfile.autoMarkPrevious;

    saveProfile({ ...studentProfile, autoMarkPrevious: newAutoMark, completedSubjects: updated });
  };

  // Modal Handlers
  const handleSaveModal = () => {
    let completed = [...studentProfile.completedSubjects];
    if (modalAutoMark && modalPeriodo > 1 && modalPeriodo <= 8) {
      const autoPrev = getAutoMarkedPrevious(modalPeriodo);
      completed = Array.from(new Set([...autoPrev, ...completed]));
    }
    saveProfile({
      periodoNum: modalPeriodo,
      turmaIdx: modalTurma,
      autoMarkPrevious: modalAutoMark,
      completedSubjects: completed
    });
    setIsModalOpen(false);
  };

  // Metrics Calculation
  const allSubjects = getAllSubjects();
  const totalCreditos = portalData.curriculo_atualizado.acumulado_total.creditos; // 154
  const totalCH = portalData.curriculo_atualizado.acumulado_total.carga_horaria; // 2772
  let paidCR = 0;
  let paidCH = 0;
  let completedCount = 0;
  let inProgressCount = 0;

  allSubjects.forEach((s) => {
    const status = getSubjectStatus(s.nome);
    if (status === 'concluida') {
      paidCR += s.creditos;
      paidCH += s.carga_horaria;
      completedCount++;
    } else if (status === 'em_andamento') {
      inProgressCount++;
    }
  });

  const progressPercent = ((paidCR / totalCreditos) * 100).toFixed(1);
  const turmaNames = [
    "Fim de Semana - 5º Período",
    "Semanal Noturno - Turma A (7º Período)",
    "Semanal Noturno - Turma B (3º Período)",
    "Semanal Noturno - Curso Básico"
  ];
  const pNome = studentProfile.periodoNum === 0 ? "Curso Básico de Teologia" : `${studentProfile.periodoNum}º Período`;

  // Get active class days for selected turma
  const getActiveDaysOfWeekForTurma = (turmaIdx: number) => {
    const turmaData = portalData.horario_integrado_2026_2.grade_horaria[turmaIdx];
    const daysSet = new Set<number>();
    if (turmaData && turmaData.horarios) {
      turmaData.horarios.forEach((h) => {
        const idx = dayNameToIdx[h.dia];
        if (idx !== undefined) daysSet.add(idx);
      });
    }
    if (turmaIdx === 3) daysSet.add(2); // Special Tuesdays
    const sorted = Array.from(daysSet).sort((a, b) => a - b);
    return sorted.length > 0 ? sorted : [1, 2, 3, 4, 5];
  };

  const getTurmaClassesForDay = (turmaIdx: number, dayIdx: number) => {
    const turmaData = portalData.horario_integrado_2026_2.grade_horaria[turmaIdx];
    if (!turmaData || !turmaData.horarios) return [];
    return turmaData.horarios.filter((h) => dayNameToIdx[h.dia] === dayIdx);
  };

  // Day Theme Resolver
  const getDayTheme = (monthName: string, dayNum: number, dayIdx: number) => {
    const specials = calendarEvents[monthName] || {};
    const special = specials[dayNum];
    const classes = getTurmaClassesForDay(studentProfile.turmaIdx, dayIdx);

    let type = 'nao_letivo';
    if (special) type = special.type;
    else if (dayIdx === 0) type = 'feriado';
    else if (classes.length > 0) type = 'letivo';

    const themes: Record<string, { bg: string; border: string; text: string; badgeBg: string }> = {
      inicio:      { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857', badgeBg: '#10b981' },
      feriado:     { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', badgeBg: '#ef4444' },
      teologica:   { bg: '#f3e8ff', border: '#ddd6fe', text: '#6b21a8', badgeBg: '#8b5cf6' },
      especial:    { bg: '#fffbeb', border: '#fde68a', text: '#b45309', badgeBg: '#f59e0b' },
      provas:      { bg: '#fce7f3', border: '#fbcfe8', text: '#be185d', badgeBg: '#ec4899' },
      formatura:   { bg: '#ecfeff', border: '#a5f3fc', text: '#0e7490', badgeBg: '#06b6d4' },
      recuperacao: { bg: '#e0e7ff', border: '#c7d2fe', text: '#4338ca', badgeBg: '#6366f1' },
      diarios:     { bg: '#f8fafc', border: '#cbd5e1', text: '#334155', badgeBg: '#64748b' },
      letivo:      { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', badgeBg: '#3b82f6' },
      nao_letivo:  { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b', badgeBg: '#94a3b8' }
    };

    return { ...(themes[type] || themes.nao_letivo), label: special ? special.label : '' };
  };

  return (
    <div className="space-y-6">
      {/* Header Bar do Portal */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-blue-800/40">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Oficial 2026.2
              </span>
              {isReadOnly ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/25 text-purple-200 border border-purple-400/30">
                  Modo Consulta ({currentRole === 'admin' ? 'Administrador' : 'Monitor'})
                </span>
              ) : (
                <span className="text-xs text-blue-200">Seminário Teológico Congregacional</span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {isReadOnly ? 'Portal & Calendário Acadêmico' : 'Portal Acadêmico do Aluno'}
            </h1>
            <p className="text-xs md:text-sm text-blue-200/90 mt-1">
              {isReadOnly 
                ? 'Consulta completa de calendário letivo oficial, horários de turmas e grade curricular dos cursos.'
                : 'Filtros da sua situação, grade horária integrada e visualizador interativo do calendário.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => {
                if (onTabChange) onTabChange('aluno-checklist');
                else if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('lms_change_tab', { detail: 'aluno-checklist' }));
                }
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
              title="Acompanhamento individual de trabalhos escritos, portfólios e provas objetivas finais"
            >
              <CheckSquare className="w-4 h-4 text-amber-300" />
              <span>Checklist & Dashboard AV</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition"
            >
              {isReadOnly ? <Sliders className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              <span>{isReadOnly ? `Filtrar Visualização (${pNome})` : `Minha Situação (${pNome})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Synchronized Hero Progress Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>{isReadOnly ? `Visualizando Grade: ${pNome}` : `Minha Situação: ${pNome}`}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Turma: <strong>{turmaNames[studentProfile.turmaIdx]}</strong> • Semestre 2026.2 {isReadOnly && '(Consulta)'}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
          >
            <Sliders className="w-3.5 h-3.5" /> {isReadOnly ? 'Trocar Período / Turma em Exibição' : 'Alterar Filtros do Perfil'}
          </button>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-gray-700">
            <span>Progresso Geral do Bacharel: <strong className="text-blue-700">{progressPercent}%</strong></span>
            <span className="text-gray-500">{paidCR} de {totalCreditos} Créditos ({paidCH} / {totalCH} hrs)</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tab Controls for the Module */}
      <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('inicio')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'inicio' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Compass className="w-4 h-4" /> Início & Métricas
        </button>
        <button
          onClick={() => setActiveTab('calendario')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'calendario' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CalendarIcon className="w-4 h-4" /> Calendário 2026.2
        </button>
        <button
          onClick={() => setActiveTab('horario')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'horario' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" /> Grade Horária
        </button>
        <button
          onClick={() => setActiveTab('curriculo')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
            activeTab === 'curriculo' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Currículo Acadêmico
        </button>
      </div>

      {/* --- TAB 1: INÍCIO & MÉTRICAS --- */}
      {activeTab === 'inicio' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500">Créditos Pagos</span>
              <div className="text-xl font-extrabold text-blue-900 mt-1">{paidCR} / {totalCreditos} CR</div>
              <span className="text-[11px] text-blue-600 mt-0.5 block">{totalCreditos - paidCR} CR Faltantes</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500">Carga Horária</span>
              <div className="text-xl font-extrabold text-amber-900 mt-1">{paidCH.toLocaleString('pt-BR')}h</div>
              <span className="text-[11px] text-amber-600 mt-0.5 block">Total: {totalCH.toLocaleString('pt-BR')} hrs</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500">Disciplinas Pagas</span>
              <div className="text-xl font-extrabold text-emerald-900 mt-1">{completedCount} / {allSubjects.length}</div>
              <span className="text-[11px] text-emerald-600 mt-0.5 block">Concluídas com Êxito</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500">Em Andamento</span>
              <div className="text-xl font-extrabold text-purple-900 mt-1">{inProgressCount} Matérias</div>
              <span className="text-[11px] text-purple-600 mt-0.5 block">Semestre {pNome}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('calendario')}
              className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-900 text-sm">Calendário Interativo</h4>
                  <CalendarIcon className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-xs text-gray-500">Visão Mensal, Semanal e Anual com horários convertidos p/ fuso local.</p>
              </div>
              <span className="text-xs font-bold text-blue-600 mt-4 flex items-center gap-1">Abrir Calendário <ArrowRight className="w-3.5 h-3.5"/></span>
            </div>

            <div
              onClick={() => setActiveTab('horario')}
              className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-900 text-sm">Grade Horária</h4>
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs text-gray-500">Grade horária das 4 turmas com ajuste automático GMT-3 ➔ Local.</p>
              </div>
              <span className="text-xs font-bold text-blue-600 mt-4 flex items-center gap-1">Consultar Horários <ArrowRight className="w-3.5 h-3.5"/></span>
            </div>

            <div
              onClick={() => setActiveTab('curriculo')}
              className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-900 text-sm">Currículo & Checkboxes</h4>
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs text-gray-500">Estrutura curricular de 1º a 8º período com marcação individual de disciplinas.</p>
              </div>
              <span className="text-xs font-bold text-blue-600 mt-4 flex items-center gap-1">Explorar Matérias <ArrowRight className="w-3.5 h-3.5"/></span>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: CALENDÁRIO 2026.2 --- */}
      {activeTab === 'calendario' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1"><Compass className="w-4 h-4 text-blue-600"/> Modo:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setCalendarMode('month')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${calendarMode === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Visão Mensal
                </button>
                <button
                  onClick={() => setCalendarMode('week')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${calendarMode === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Visão Semanal
                </button>
                <button
                  onClick={() => setCalendarMode('year')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${calendarMode === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Visão Anual
                </button>
              </div>
            </div>

            <div className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Horários convertidos p/ Fuso Local (Origem: Brasília GMT-3)</span>
            </div>
          </div>

          {/* Calendar Display Area */}
          <div className={`space-y-6 ${calendarMode === 'week' ? '' : 'grid grid-cols-1 lg:grid-cols-4 gap-6 space-y-0'}`}>
            <div className={`bg-white p-5 rounded-2xl border border-gray-200 shadow-sm ${calendarMode === 'week' ? '' : 'lg:col-span-3'}`}>
              {calendarMode !== 'year' && (
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setCurrentMonthIdx((prev) => Math.max(0, prev - 1))}
                    disabled={currentMonthIdx === 0}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-bold text-gray-900 text-base">{monthNames[currentMonthIdx]}</h3>
                  <button
                    onClick={() => setCurrentMonthIdx((prev) => Math.min(monthNames.length - 1, prev + 1))}
                    disabled={currentMonthIdx === monthNames.length - 1}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* MONTHLY VIEW */}
              {calendarMode === 'month' && (() => {
                const activeDays = getActiveDaysOfWeekForTurma(studentProfile.turmaIdx);
                const dayNamesFull = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
                const totalDays = monthDays[currentMonthIdx];
                const startDay = monthStartDay[currentMonthIdx];
                const currentMonthName = monthNames[currentMonthIdx];

                const now = new Date();
                const realYear = now.getFullYear();
                const realMonth = now.getMonth();
                const realDay = now.getDate();
                const targetMonthIdx = currentMonthIdx + 7; // Aug = 7

                let firstActiveDayInMonth = -1;
                for (let day = 1; day <= totalDays; day++) {
                  const dOfWeek = (startDay + day - 1) % 7;
                  if (activeDays.includes(dOfWeek)) {
                    firstActiveDayInMonth = dOfWeek;
                    break;
                  }
                }
                const firstActiveColIdx = activeDays.indexOf(firstActiveDayInMonth);

                return (
                  <div className="space-y-2">
                    <div className="grid gap-1 text-center" style={{ gridTemplateColumns: `repeat(${activeDays.length}, minmax(0, 1fr))` }}>
                      {activeDays.map((dIdx) => (
                        <div key={dIdx} className="text-xs font-bold text-gray-400 py-1 uppercase">{dayNamesFull[dIdx]}</div>
                      ))}
                    </div>
                    <div className="grid gap-1.5 text-center" style={{ gridTemplateColumns: `repeat(${activeDays.length}, minmax(0, 1fr))` }}>
                      {Array.from({ length: Math.max(0, firstActiveColIdx) }).map((_, i) => (
                        <div key={`empty-${i}`} className="min-h-[60px] bg-transparent" />
                      ))}
                      {Array.from({ length: totalDays }).map((_, i) => {
                        const day = i + 1;
                        const dayOfWeek = (startDay + day - 1) % 7;
                        if (!activeDays.includes(dayOfWeek)) return null;

                        const isToday = realYear === 2026 && realMonth === targetMonthIdx && realDay === day;
                        const theme = getDayTheme(currentMonthName, day, dayOfWeek);
                        const turmaClasses = getTurmaClassesForDay(studentProfile.turmaIdx, dayOfWeek);

                        return (
                          <div
                            key={`day-${day}`}
                            className="min-h-[70px] p-1.5 rounded-lg text-left flex flex-col justify-between transition border"
                            style={{
                              backgroundColor: theme.bg,
                              borderColor: isToday ? '#2563eb' : theme.border,
                              borderWidth: isToday ? '2px' : '1px',
                              boxShadow: isToday ? '0 0 8px rgba(37, 99, 235, 0.35)' : 'none'
                            }}
                          >
                            <div className="flex justify-between items-center">
                              {isToday ? <span className="bg-blue-600 text-white text-[9px] font-bold px-1 rounded">HOJE</span> : <span />}
                              <span className="text-xs font-bold text-gray-800">{day}</span>
                            </div>
                            {theme.label && (
                              <span className="text-[9px] font-semibold text-white px-1 py-0.5 rounded truncate" style={{ backgroundColor: theme.badgeBg }}>
                                {theme.label}
                              </span>
                            )}
                            {turmaClasses.map((c, idx) => (
                              <div key={idx} className="text-[9px] font-semibold bg-blue-100/80 text-blue-900 border border-blue-200 px-1 py-0.5 rounded truncate" title={`${convertGmt3ToLocalTimeStr(c.horario)}: ${c.materia}`}>
                                📖 {c.materia}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* WEEKLY VIEW (Fits 100% within viewport!) */}
              {calendarMode === 'week' && (() => {
                const activeDays = getActiveDaysOfWeekForTurma(studentProfile.turmaIdx);
                const diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
                const now = new Date();

                return (
                  <div className="grid gap-2.5 w-full overflow-x-hidden" style={{ gridTemplateColumns: `repeat(${activeDays.length}, minmax(0, 1fr))` }}>
                    {activeDays.map((dayOfWeekIdx) => {
                      const diaNome = diasSemana[dayOfWeekIdx];
                      const classes = getTurmaClassesForDay(studentProfile.turmaIdx, dayOfWeekIdx);
                      const isToday = now.getDay() === dayOfWeekIdx;
                      const theme = getDayTheme(monthNames[currentMonthIdx], 1, dayOfWeekIdx);

                      return (
                        <div key={dayOfWeekIdx} className="bg-white border rounded-xl overflow-hidden flex flex-col justify-between shadow-sm" style={{ borderColor: theme.border }}>
                          <div className="p-2.5 border-b flex justify-between items-center" style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
                            <span className="text-xs font-bold truncate" style={{ color: theme.text }}>{diaNome}</span>
                            {isToday && <span className="bg-blue-600 text-white text-[9px] font-bold px-1 rounded">HOJE</span>}
                          </div>
                          <div className="p-2 space-y-2 flex-1">
                            {classes.length === 0 ? (
                              <div className="text-[11px] text-gray-400 italic text-center py-4">Sem aulas.</div>
                            ) : (
                              classes.map((c, idx) => (
                                <div key={idx} className="p-2 rounded-lg border-l-4 space-y-1 text-left" style={{ backgroundColor: theme.bg, borderLeftColor: theme.badgeBg }}>
                                  <div className="text-[10px] font-mono font-bold" style={{ color: theme.text }}>
                                    ⏰ {convertGmt3ToLocalTimeStr(c.horario)}
                                  </div>
                                  <strong className="text-xs text-gray-900 block leading-tight truncate">{c.materia}</strong>
                                  <div className="text-[10px] text-gray-500 truncate">👨‍🏫 {c.professor}</div>
                                  {Boolean('meetUrl' in c && c.meetUrl) && (
                                    <a
                                      href={String((c as any).meetUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded shadow-2xs transition"
                                    >
                                      <Video className="w-2.5 h-2.5" /> Entrar no Meet
                                    </a>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* YEARLY VIEW */}
              {calendarMode === 'year' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {monthNames.map((mNome, mIdx) => {
                    const totalDays = monthDays[mIdx];
                    const startDay = monthStartDay[mIdx];

                    return (
                      <div key={mIdx} className="p-3 bg-white border border-gray-200 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-center text-gray-800">{mNome}</h4>
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                          <span className="font-bold text-gray-400">D</span>
                          <span className="font-bold text-gray-400">S</span>
                          <span className="font-bold text-gray-400">T</span>
                          <span className="font-bold text-gray-400">Q</span>
                          <span className="font-bold text-gray-400">Q</span>
                          <span className="font-bold text-gray-400">S</span>
                          <span className="font-bold text-gray-400">S</span>
                          {Array.from({ length: startDay }).map((_, i) => (
                            <div key={`y-emp-${i}`} />
                          ))}
                          {Array.from({ length: totalDays }).map((_, i) => {
                            const day = i + 1;
                            const dayOfWeek = (startDay + day - 1) % 7;
                            const theme = getDayTheme(mNome, day, dayOfWeek);
                            return (
                              <div
                                key={`y-day-${day}`}
                                className="py-1 rounded font-semibold text-[9px]"
                                style={{ backgroundColor: theme.bg, color: theme.text, border: `1px solid ${theme.border}` }}
                              >
                                {day}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legend Box (Placed Below in Weekly View, Sidebar in Month/Year) */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Tags className="w-4 h-4 text-blue-600" /> Legendas do Calendário
              </h4>
              <div className={calendarMode === 'week' ? "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3" : "space-y-2"}>
                {[
                  { label: "Dias Letivos & Aulas", color: "#3b82f6" },
                  { label: "Dias Não Letivos", color: "#94a3b8" },
                  { label: "Domingos e Feriados", color: "#ef4444" },
                  { label: "Semana Teológica", color: "#8b5cf6" },
                  { label: "Início do Período", color: "#10b981" },
                  { label: "Dia Denominação / Prof", color: "#f59e0b" },
                  { label: "Período de AV1 e AV2", color: "#ec4899" },
                  { label: "Formatura 2026", color: "#06b6d4" },
                  { label: "Recuperação", color: "#6366f1" },
                  { label: "Diários Secretaria", color: "#64748b" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                    <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: GRADE HORÁRIA --- */}
      {activeTab === 'horario' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Grade Horária Integrada 2026_2</h2>
            <p className="text-xs text-gray-500 mt-1">
              Selecione a turma abaixo para consultar disciplinas, docentes e horários convertidos para o fuso local do seu computador.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {turmaNames.map((name, idx) => (
              <button
                key={idx}
                onClick={() => setStudentProfile((prev) => ({ ...prev, turmaIdx: idx }))}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border ${
                  studentProfile.turmaIdx === idx
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* Table */}
          {(() => {
            const turmaData = portalData.horario_integrado_2026_2.grade_horaria[studentProfile.turmaIdx];
            return (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-base">{turmaData.turma}</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase">
                      <tr>
                        <th className="p-3">Dia da Semana</th>
                        <th className="p-3">Horário (Local)</th>
                        <th className="p-3">Disciplina / Matéria</th>
                        <th className="p-3">Docente / Professor(a)</th>
                        <th className="p-3 text-center">Aula Ao Vivo (Meet)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {turmaData.horarios.map((h, idx) => {
                        const status = getSubjectStatus(h.materia);
                        const meet = 'meetUrl' in h ? (h.meetUrl as string) : undefined;
                        return (
                          <tr key={idx} className={status === 'em_andamento' ? 'bg-blue-50/70 font-medium' : 'hover:bg-gray-50'}>
                            <td className="p-3 font-semibold text-blue-900">{h.dia}</td>
                            <td className="p-3 font-mono font-bold text-gray-700" title={`Brasília GMT-3: ${h.horario}`}>
                              {convertGmt3ToLocalTimeStr(h.horario)}
                            </td>
                            <td className="p-3 text-gray-900">
                              <strong>{h.materia}</strong>
                              {('formato' in h && h.formato) && <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">{h.formato}</span>}
                            </td>
                            <td className="p-3 text-gray-600">{h.professor}</td>
                            <td className="p-3 text-center">
                              {meet ? (
                                <a
                                  href={meet}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>Google Meet</span>
                                </a>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">Módulo Gravado</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {turmaData.observacoes && turmaData.observacoes.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 space-y-1">
                      <strong className="block font-bold">Observação da Turma:</strong>
                      <p>{turmaData.observacoes.join(' ')}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* --- TAB 4: CURRÍCULO ACADÊMICO --- */}
      {activeTab === 'curriculo' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Estrutura Curricular & Situação Disciplinar</h2>
              <p className="text-xs text-gray-500 mt-1">
                Marque as disciplinas já concluídas para calcular seu progresso automaticamente.
              </p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                <button
                  onClick={() => setCurrentStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${currentStatusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setCurrentStatusFilter('concluida')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${currentStatusFilter === 'concluida' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'}`}
                >
                  🟢 Concluídas
                </button>
                <button
                  onClick={() => setCurrentStatusFilter('em_andamento')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${currentStatusFilter === 'em_andamento' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'}`}
                >
                  🔵 Em Andamento
                </button>
                <button
                  onClick={() => setCurrentStatusFilter('pendente')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${currentStatusFilter === 'pendente' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  ⚪ Pendentes
                </button>
              </div>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar disciplina por nome..."
                value={curriculumSearch}
                onChange={(e) => setCurriculumSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Period Accordion Cards */}
          <div className="space-y-4">
            {portalData.curriculo_atualizado.periodos.map((p, pIdx) => {
              let paidCRInPeriod = 0;
              let paidCHInPeriod = 0;

              p.disciplinas.forEach((d) => {
                if (isSubjectCompleted(d.nome)) {
                  paidCRInPeriod += d.creditos;
                  paidCHInPeriod += d.carga_horaria;
                }
              });

              const filteredDisciplinas = p.disciplinas.filter((d) => {
                const status = getSubjectStatus(d.nome);
                const matchesFilter = currentStatusFilter === 'all' || status === currentStatusFilter;
                const matchesSearch = !curriculumSearch || d.nome.toLowerCase().includes(curriculumSearch.toLowerCase());
                return matchesFilter && matchesSearch;
              });

              if (currentStatusFilter !== 'all' && filteredDisciplinas.length === 0) return null;

              return (
                <div key={pIdx} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" /> {p.periodo}
                    </h3>
                    <div className="flex gap-2 text-xs font-semibold">
                      <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">{paidCRInPeriod} / {p.total_semestre.creditos} CR Pagos</span>
                      <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">{paidCHInPeriod} / {p.total_semestre.carga_horaria}h CH</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/50 text-gray-500 font-bold border-b border-gray-200">
                        <tr>
                          <th className="p-3 w-10 text-center">Status</th>
                          <th className="p-3">Disciplina</th>
                          <th className="p-3 text-center">Situação</th>
                          <th className="p-3 text-center">Créditos</th>
                          <th className="p-3 text-center">Carga Horária</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredDisciplinas.map((d, dIdx) => {
                          const status = getSubjectStatus(d.nome);
                          const isChecked = status === 'concluida';

                          return (
                            <tr key={dIdx} className="hover:bg-gray-50">
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isReadOnly}
                                  onChange={(e) => toggleSubjectCompleted(d.nome, e.target.checked)}
                                  className={`w-4 h-4 accent-emerald-600 rounded ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                  title={isReadOnly ? 'Apenas consulta (Modo Leitura)' : 'Marcar disciplina como concluída'}
                                />
                              </td>
                              <td className="p-3 font-medium text-gray-900">
                                <span className={isChecked ? 'line-through text-gray-400' : ''}>{d.nome}</span>
                              </td>
                              <td className="p-3 text-center">
                                {status === 'concluida' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">🟢 Concluída</span>}
                                {status === 'em_andamento' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">🔵 Em Andamento</span>}
                                {status === 'pendente' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">⚪ Pendente</span>}
                              </td>
                              <td className="p-3 text-center font-bold text-gray-700">{d.creditos}</td>
                              <td className="p-3 text-center font-bold text-blue-700">{d.carga_horaria} hrs</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {/* Extensão e Pesquisa Card */}
            {(() => {
              const ext = portalData.curriculo_atualizado.extensao_e_pesquisa_obrigatorias;
              let extPaidCR = 0;
              let extPaidCH = 0;

              ext.forEach((d) => {
                if (isSubjectCompleted(d.nome)) {
                  extPaidCR += d.creditos;
                  extPaidCH += d.carga_horaria;
                }
              });

              const filteredExt = ext.filter((d) => {
                const status = getSubjectStatus(d.nome);
                const matchesFilter = currentStatusFilter === 'all' || status === currentStatusFilter;
                const matchesSearch = !curriculumSearch || d.nome.toLowerCase().includes(curriculumSearch.toLowerCase());
                return matchesFilter && matchesSearch;
              });

              if (currentStatusFilter !== 'all' && filteredExt.length === 0) return null;

              return (
                <div className="border border-indigo-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-indigo-50 border-b border-indigo-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h3 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-indigo-600" /> Extensão e Pesquisa (Obrigatórias)
                    </h3>
                    <div className="flex gap-2 text-xs font-semibold">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-200 text-indigo-900">{extPaidCR} / {portalData.curriculo_atualizado.total_extensao_e_pesquisa.creditos} CR Pagos</span>
                      <span className="px-2.5 py-1 rounded-full bg-indigo-300/60 text-indigo-950">{extPaidCH} / {portalData.curriculo_atualizado.total_extensao_e_pesquisa.carga_horaria}h CH</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-indigo-50/30 text-indigo-600 font-bold border-b border-indigo-100">
                        <tr>
                          <th className="p-3 w-10 text-center">Status</th>
                          <th className="p-3">Atividade / Estágio / TCC</th>
                          <th className="p-3 text-center">Situação</th>
                          <th className="p-3 text-center">Créditos</th>
                          <th className="p-3 text-center">Carga Horária</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-indigo-100">
                        {filteredExt.map((d, dIdx) => {
                          const status = getSubjectStatus(d.nome);
                          const isChecked = status === 'concluida';

                          return (
                            <tr key={dIdx} className="hover:bg-indigo-50/50">
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isReadOnly}
                                  onChange={(e) => toggleSubjectCompleted(d.nome, e.target.checked)}
                                  className={`w-4 h-4 accent-emerald-600 rounded ${isReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                                  title={isReadOnly ? 'Apenas consulta (Modo Leitura)' : 'Marcar atividade como concluída'}
                                />
                              </td>
                              <td className="p-3 font-medium text-indigo-950">
                                <span className={isChecked ? 'line-through text-gray-400' : ''}>{d.nome}</span>
                              </td>
                              <td className="p-3 text-center">
                                {status === 'concluida' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">🟢 Concluída</span>}
                                {status === 'em_andamento' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">🔵 Em Andamento</span>}
                                {status === 'pendente' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">⚪ Pendente</span>}
                              </td>
                              <td className="p-3 text-center font-bold text-indigo-900">{d.creditos}</td>
                              <td className="p-3 text-center font-bold text-indigo-700">{d.carga_horaria} hrs</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIGURAÇÃO DA SITUAÇÃO DO ALUNO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                {isReadOnly ? <Sliders className="w-5 h-5 text-amber-400" /> : <Settings className="w-5 h-5 text-amber-400" />}
                {isReadOnly ? 'Consultar Período & Turma (Modo Consulta)' : 'Configurar Minha Situação'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-blue-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {isReadOnly ? 'Período para Visualização:' : 'Seu Período Atual no Curso:'}
                </label>
                <select
                  value={modalPeriodo}
                  onChange={(e) => {
                    const pVal = parseInt(e.target.value, 10);
                    setModalPeriodo(pVal);
                    if (pVal === 5) setModalTurma(0);
                    else if (pVal === 7) setModalTurma(1);
                    else if (pVal === 3) setModalTurma(2);
                    else if (pVal === 0) setModalTurma(3);
                  }}
                  className="w-full p-2.5 text-xs font-semibold border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                >
                  <option value={1}>1º Período</option>
                  <option value={2}>2º Período</option>
                  <option value={3}>3º Período (Turma B Noturno)</option>
                  <option value={4}>4º Período</option>
                  <option value={5}>5º Período (Fim de Semana)</option>
                  <option value={6}>6º Período</option>
                  <option value={7}>7º Período (Turma A Noturno)</option>
                  <option value={8}>8º Período</option>
                  <option value={0}>Curso Básico de Teologia</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">
                  {isReadOnly ? 'Turma de Horários para Visualização:' : 'Sua Turma de Aulas (Horários):'}
                </label>
                <select
                  value={modalTurma}
                  onChange={(e) => setModalTurma(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 text-xs font-semibold border border-gray-300 rounded-xl outline-none focus:border-blue-500"
                >
                  <option value={0}>Fim de Semana - 5º Período</option>
                  <option value={1}>Semanal Noturno - Turma A (7º Período)</option>
                  <option value={2}>Semanal Noturno - Turma B (3º Período)</option>
                  <option value={3}>Semanal Noturno - Curso Básico</option>
                </select>
              </div>

              {!isReadOnly && (
                <label className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={modalAutoMark}
                    onChange={(e) => setModalAutoMark(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded mt-0.5"
                  />
                  <span>Considerar automaticamente pagas/concluídas todas as disciplinas dos períodos anteriores ao meu período atual.</span>
                </label>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between gap-3">
              <button
                onClick={() => {
                  setModalPeriodo(7);
                  setModalTurma(1);
                  setModalAutoMark(true);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Redefinir
              </button>

              <button
                onClick={handleSaveModal}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" /> {isReadOnly ? 'Aplicar Visualização' : 'Salvar no Perfil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
