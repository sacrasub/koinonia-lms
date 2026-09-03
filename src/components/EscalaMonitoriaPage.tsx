'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Sparkles, Clock, Globe, Copy, Check, ExternalLink, Video, Calendar,
  Users, UserCheck, ShieldCheck, CheckCircle2, AlertCircle, ArrowUpDown,
  Search, Filter, ChevronRight, Plus, RefreshCw, Send, BookOpen, MessageSquare,
  HelpCircle, CheckSquare, PhoneCall, Mail, Award, Bell, Camera, Share2,
  Smartphone, Eye, Download, Image as ImageIcon, Upload, Loader2, GraduationCap,
  Volume2, VolumeX, Play, Archive, FolderOpen, Lock, Edit3, Link as LinkIcon,
  Ban, AlertTriangle, Bot
} from 'lucide-react';
import { UserRole, AvisoLeituraPreAula } from '@/types';
import { getAuthorizedUsersList, addOrUpdateAuthorizedUser, INITIAL_AUTHORIZED_USERS } from '@/lib/authConfig';
import { fetchStudentData, savePortalProfile } from '@/services/studentSyncService';
import { 
  cancelarAula, 
  reativarAula, 
  getAulaCanceladaStatus, 
  getAllAulasCanceladas,
  fetchAulasCanceladasFromCloud, 
  AulaCanceladaItem 
} from '@/services/aulaCanceladaService';
import { 
  getAnnouncements, 
  addAnnouncement, 
  updateAnnouncement,
  deleteAnnouncement,
  archiveAnnouncement,
  unarchiveAnnouncement,
  formatAnnouncementForWhatsApp 
} from '@/services/announcementsService';
import { 
  ActiveRecordingSession,
  getActiveRecordings,
  fetchActiveRecordingsFromCloud,
  getAllGravacoes,
  fetchGravacoesFromCloud,
  clearAllActiveRecordings,
  forceClearActiveRecordingForAula
} from '@/services/gravacoesService';
import { 
  getLocalTimeZoneInfo, 
  convertBRTToLocalTime, 
  formatBRTRangeToLocal,
  getCurrentBrasiliaMinutes,
  TimeZoneInfo 
} from '@/lib/timeUtils';
import { SupportMaterialsHub } from '@/components/SupportMaterialsHub';
import { 
  playRecordingAlarm, 
  playPresenceAlarm, 
  playClosingAlarm, 
  playTestBeep 
} from '@/lib/soundEffects';
import { 
  getDiretrizes, 
  saveDiretrizes, 
  addDiretriz, 
  getOcorrencias, 
  saveOcorrencias, 
  addOcorrencia, 
  DiretrizAcesso, 
  OcorrenciaMonitoria 
} from '@/services/monitoriaIncidentsService';
import { supabase } from '@/lib/supabaseClient';

export interface EscalaItem {
  id: string;
  dayOfWeek: 'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira';
  dayIndex: number;
  title: string;
  professor: string;
  startBRT: string;
  endBRT: string;
  monitor: 'Camila' | 'Cristiano' | 'Rosiane' | string;
  monitorEmail: string;
  turma: 'Turma A' | 'Turma B' | 'Curso Básico' | 'Fim de Semana';
  typeTag?: string;
  presencaUrl: string;
  meetUrl?: string;
  description?: string;
}

export interface MonitorInfo {
  name: string;
  shortName: string;
  email: string;
  turma: 'Turma A' | 'Turma B' | 'Curso Básico' | 'Fim de Semana' | string;
  turmaLabel: string;
  roleDescription: string;
  avatarUrl: string;
  phone?: string;
  disciplinas: string[];
  days: string[];
  totalWeeklyHours: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  isPendingRegistration?: boolean;
}

export interface TrocaEscalaRequest {
  id: string;
  solicitante: string;
  monitorSubstituto: string;
  disciplina: string;
  dataAula: string;
  horario: string;
  motivo: string;
  status: 'pendente' | 'aprovada' | 'recusada';
  createdAt: string;
}

/**
 * Comprime e converte imagem do dispositivo para Base64 leve
 */
function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Erro ao processar imagem.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
    reader.readAsDataURL(file);
  });
}

export const DEFAULT_MONITORES_DATA: Record<string, MonitorInfo> = {
  // ==========================================
  // COORDENAÇÃO GERAL (Robert FMB)
  // ==========================================
  Robert: {
    name: 'Robert FMB',
    shortName: 'Robert',
    email: 'robert.fmb@uiecbead.com.br',
    turma: 'Coordenação Geral',
    turmaLabel: 'Coordenação Geral de Monitoria & Suporte',
    roleDescription: 'Coordenador Geral de Suporte e Monitoria STC',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    disciplinas: ['Supervisão Geral de Turmas A, B e Fim de Semana', 'Suporte Técnico e Alinhamento com Professores'],
    days: ['Segunda a Sábado'],
    totalWeeklyHours: 'Coordenação',
    color: 'from-purple-600 to-indigo-700',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-200',
    borderColor: 'border-purple-500'
  },

  // ==========================================
  // MONITORES - TURMA A (7º Período - Veteranos)
  // ==========================================
  Camila: {
    name: 'Camila Vieira',
    shortName: 'Camila',
    email: 'camilagbalbi@gmail.com',
    turma: 'Turma A',
    turmaLabel: 'Turma A (7º Período - Veteranos)',
    roleDescription: 'Monitora de Terças, Quintas e Sextas',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
    disciplinas: [
      'História do Congregacionalismo (Terça 19h)',
      'Novo Testamento III - Epístolas Gerais (Quinta 20h35)',
      'Plantação e Revitalização de Igrejas II (Sexta 19h)'
    ],
    days: ['Terça-feira', 'Quinta-feira', 'Sexta-feira'],
    totalWeeklyHours: '3h 50min',
    color: 'from-pink-600 to-rose-500',
    badgeBg: 'bg-pink-100 text-pink-800 border-pink-200',
    borderColor: 'border-pink-500'
  },
  Cristiano: {
    name: 'Cristiano Sacramento',
    shortName: 'Cristiano',
    email: 'riffocristianmision@gmail.com',
    turma: 'Turma A',
    turmaLabel: 'Turma A (7º Período - Veteranos)',
    roleDescription: 'Monitor de Terças, Quartas e Sextas (2º Horário)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    disciplinas: [
      'História do Pensamento Cristão II (Terça 20h35)',
      'Direitos Humanos (Quarta 20h35)',
      'História da Cultura Afro Brasileira e Indígena (Sexta 21h)'
    ],
    days: ['Terça-feira', 'Quarta-feira', 'Sexta-feira'],
    totalWeeklyHours: '3h 50min',
    color: 'from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    borderColor: 'border-blue-500'
  },
  Rosiane: {
    name: 'Rosi (Rosiane Lima)',
    shortName: 'Rosi',
    email: 'rosianelcs73@gmail.com',
    turma: 'Turma A',
    turmaLabel: 'Turma A (7º Período - Veteranos)',
    roleDescription: 'Monitora de Quartas, Quintas e Sextas',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    disciplinas: [
      'Aconselhamento Bíblico II (Quarta 19h)',
      'Ética Cristã (Quinta 19h)',
      'TCC I (Sexta 20h)'
    ],
    days: ['Quarta-feira', 'Quinta-feira', 'Sexta-feira'],
    totalWeeklyHours: '3h 50min',
    color: 'from-emerald-600 to-teal-600',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    borderColor: 'border-emerald-500'
  },

  // ==========================================
  // MONITORES - TURMA B (3º Período - Novos Alunos)
  // ==========================================
  André: {
    name: 'André',
    shortName: 'André',
    email: 'andreseminariouiecb@gmail.com',
    turma: 'Turma B',
    turmaLabel: 'Turma B (3º Período - Noturno)',
    roleDescription: 'Monitor Titular de Terças e Quartas',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    disciplinas: [
      'Introdução ao Novo Testamento (Terça 19h)',
      'Hermenêutica Bíblica (Terça 20h35)',
      'Fundamentos e Prática do Discipulado (Quarta 19h)'
    ],
    days: ['Terça-feira', 'Quarta-feira'],
    totalWeeklyHours: '4h 15min',
    color: 'from-amber-600 to-orange-500',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
    borderColor: 'border-amber-500'
  },
  Daniel: {
    name: 'Daniel',
    shortName: 'Daniel',
    email: 'daniel.monitor@uiecbead.com.br',
    turma: 'Turma B',
    turmaLabel: 'Turma B (3º Período - Noturno)',
    roleDescription: 'Monitor Titular de Quartas, Quintas e Sextas',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    disciplinas: [
      'Teologia da Missão (Quarta 20h35)',
      'Teologia Sistemática III (Quinta 19h)',
      'Antigo Testamento II (Quinta 20h35)',
      'Liderança Cristã (Sexta 21h)'
    ],
    days: ['Quarta-feira', 'Quinta-feira', 'Sexta-feira'],
    totalWeeklyHours: '4h 15min',
    color: 'from-cyan-600 to-blue-600',
    badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-200',
    borderColor: 'border-cyan-500'
  },
  Renata: {
    name: 'Renata',
    shortName: 'Renata',
    email: 'renata.monitora@uiecbead.com.br',
    turma: 'Turma B',
    turmaLabel: 'Turma B (3º Período - Noturno)',
    roleDescription: 'Monitora Auxiliar (Adicionada em 05/08/2026 para apoio aos novos alunos)',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    disciplinas: [
      'Apoio em Introdução ao NT e Hermenêutica',
      'Plantação e Revitalização de Igrejas II (Sexta 19h)',
      'Plantão de Dúvidas dos Novos Alunos'
    ],
    days: ['Terça-feira', 'Quinta-feira', 'Sexta-feira'],
    totalWeeklyHours: '3h 30min',
    color: 'from-violet-600 to-fuchsia-600',
    badgeBg: 'bg-violet-100 text-violet-900 border-violet-200',
    borderColor: 'border-violet-500'
  },

  // ==========================================
  // MONITORES - TURMA DE FIM DE SEMANA (5º Período)
  // ==========================================
  Thiago: {
    name: 'Thiago',
    shortName: 'Thiago',
    email: 'thiago.monitor@uiecbead.com.br',
    turma: 'Fim de Semana',
    turmaLabel: 'Turma de Fim de Semana (5º Período)',
    roleDescription: 'Monitor Titular de Sextas e Sábados',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    disciplinas: [
      'Grego I / Grego II (Sexta 19h)',
      'Apologética I / II (Sábado 07h)'
    ],
    days: ['Sexta-feira', 'Sábado'],
    totalWeeklyHours: '4h 50min',
    color: 'from-teal-600 to-emerald-600',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-200',
    borderColor: 'border-teal-500'
  },
  Júlia: {
    name: 'Júlia',
    shortName: 'Júlia',
    email: 'julia.monitora@uiecbead.com.br',
    turma: 'Fim de Semana',
    turmaLabel: 'Turma de Fim de Semana (5º Período)',
    roleDescription: 'Monitora Auxiliar (Adicionada em 05/08/2026 após saída de Renan Bonacorso)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    disciplinas: [
      'Exegese do Novo Testamento (Sexta 21h)',
      'História do Pensamento Cristão I/II (Sábado 13h)'
    ],
    days: ['Sexta-feira', 'Sábado'],
    totalWeeklyHours: '3h 50min',
    color: 'from-rose-600 to-pink-600',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-200',
    borderColor: 'border-rose-500'
  },
  'Paulo Roberto': {
    name: 'Paulo Roberto',
    shortName: 'Paulo Roberto',
    email: 'pauloroberto.monitor@uiecbead.com.br',
    turma: 'Fim de Semana',
    turmaLabel: 'Turma de Fim de Semana (5º Período)',
    roleDescription: 'Monitor Auxiliar (Adicionado em 05/08/2026 após saída de Renan Bonacorso)',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    disciplinas: [
      'Novo Testamento II - Epístolas Paulinas (Sábado 10h)',
      'História do Pensamento Cristão I/II (Sábado 13h)'
    ],
    days: ['Sábado'],
    totalWeeklyHours: '4h 10min',
    color: 'from-indigo-600 to-sky-600',
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    borderColor: 'border-indigo-500'
  },
  'Monitoria Turma B': {
    name: 'Monitoria Turma B',
    shortName: 'Turma B',
    email: 'andreseminariouiecb@gmail.com',
    turma: 'Turma B',
    turmaLabel: 'Turma B (3º Período - Noturno)',
    roleDescription: 'Equipe de Monitoria da Turma B (André, Daniel e Renata)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    disciplinas: ['Disciplinas da Turma B'],
    days: ['Terça a Sexta'],
    totalWeeklyHours: '4h 15min',
    color: 'from-amber-600 to-orange-500',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
    borderColor: 'border-amber-500'
  }
};

export const ESCALA_DATA: EscalaItem[] = [
  // ==========================================
  // TURMA A (7º Período - Veteranos)
  // ==========================================
  {
    id: 'esc-ter-1',
    dayOfWeek: 'Terça-feira',
    dayIndex: 2,
    title: 'História do Congregacionalismo',
    professor: 'Profº Ary Júnior',
    startBRT: '19:00',
    endBRT: '20:25',
    monitor: 'Camila',
    monitorEmail: 'camilagbalbi@gmail.com',
    turma: 'Turma A',
    presencaUrl: 'https://forms.gle/2X7xGqge3dqdRKrGA',
    meetUrl: 'https://meet.google.com/sef-ggpp-bbn',
    description: 'Acompanhamento do 1º horário com foco nas origens congregacionais.'
  },
  {
    id: 'esc-ter-2',
    dayOfWeek: 'Terça-feira',
    dayIndex: 2,
    title: 'História do Pensamento Cristão II',
    professor: 'Profº Hilário Bispo',
    startBRT: '20:35',
    endBRT: '22:00',
    monitor: 'Cristiano',
    monitorEmail: 'riffocristianmision@gmail.com',
    turma: 'Turma A',
    presencaUrl: 'https://forms.gle/hM2j2fb7DK923wdR7',
    meetUrl: 'https://meet.google.com/cxj-yetd-xpf',
    description: 'Patrística, Escolástica, Teologia Medieval e Reforma Protestante.'
  },
  {
    id: 'esc-qua-1',
    dayOfWeek: 'Quarta-feira',
    dayIndex: 3,
    title: 'Aconselhamento Bíblico II',
    professor: 'Profº Uilian Santos',
    startBRT: '19:00',
    endBRT: '20:25',
    monitor: 'Rosiane',
    monitorEmail: 'rosianelcs73@gmail.com',
    turma: 'Turma A',
    presencaUrl: 'https://forms.gle/iSLGtjyaTnM9tFGb6',
    meetUrl: 'https://meet.google.com/ifv-zsdd-gjx',
    description: 'Práticas de cuidado pastoral, escuta ativa e apoio emocional bíblico.'
  },
  {
    id: 'esc-qua-2',
    dayOfWeek: 'Quarta-feira',
    dayIndex: 3,
    title: 'Direitos Humanos',
    professor: 'Profº Cleiton Barbirato',
    startBRT: '20:35',
    endBRT: '22:00',
    monitor: 'Cristiano',
    monitorEmail: 'riffocristianmision@gmail.com',
    turma: 'Turma A',
    presencaUrl: 'https://forms.gle/QiWRgTit6XjxP9Ci7',
    meetUrl: 'https://meet.google.com/uva-zmav-rds',
    description: 'Dignidade humana, cosmovisão cristã e impacto na sociedade.'
  },
  {
    id: 'esc-qui-1',
    dayOfWeek: 'Quinta-feira',
    dayIndex: 4,
    title: 'Ética Cristã',
    professor: 'Profª Karoline Evangelista',
    startBRT: '19:00',
    endBRT: '20:25',
    monitor: 'Rosiane',
    monitorEmail: 'rosianelcs73@gmail.com',
    turma: 'Turma A',
    presencaUrl: 'https://forms.gle/Tn3Ln3iS9cbAUEsJ8',
    meetUrl: 'https://meet.google.com/ypd-yzwg-nrw',
    description: 'Fundamentos morais e integridade na prática cristã contemporânea.'
  },
  {
    id: 'esc-qui-2',
    dayOfWeek: 'Quinta-feira',
    dayIndex: 4,
    title: 'Novo Testamento III - Epístolas Gerais',
    professor: 'Profº Marcio Leal',
    startBRT: '20:35',
    endBRT: '22:00',
    monitor: 'Camila',
    monitorEmail: 'camilagbalbi@gmail.com',
    turma: 'Turma A',
    presencaUrl: 'https://forms.gle/SC1mSMSZfDhJPPVE9',
    meetUrl: 'https://meet.google.com/nyn-xjqk-vky',
    description: 'Exegese e contexto das cartas de Tiago, Pedro, João e Judas.'
  },
  {
    id: 'esc-sex-1',
    dayOfWeek: 'Sexta-feira',
    dayIndex: 5,
    title: 'Plantação e Revitalização de Igrejas II',
    professor: 'Profº Thácyto Lessa',
    startBRT: '19:00',
    endBRT: '20:00',
    monitor: 'Camila',
    monitorEmail: 'camilagbalbi@gmail.com',
    turma: 'Turma A',
    presencaUrl: 'https://forms.gle/bSqjHe7zsV1EJDDB6',
    meetUrl: 'https://meet.google.com/jwb-wpvc-pzm',
    description: 'Metodologias práticas de plantio e renovação eclesial.'
  },
  {
    id: 'esc-sex-2',
    dayOfWeek: 'Sexta-feira',
    dayIndex: 5,
    title: 'TCC I - Orientação de Monografia',
    professor: 'Profª Gabriela Leal',
    startBRT: '20:00',
    endBRT: '21:00',
    monitor: 'Rosiane',
    monitorEmail: 'rosianelcs73@gmail.com',
    turma: 'Turma A',
    presencaUrl: 'https://forms.gle/vULryGYArnJZgBF28',
    meetUrl: 'https://meet.google.com/jnz-hkqd-edc',
    description: 'Normas técnicas da ABNT e construção do projeto científico.'
  },
  {
    id: 'esc-sex-3',
    dayOfWeek: 'Sexta-feira',
    dayIndex: 5,
    title: 'História da Cultura Afro Brasileira e Indígena',
    professor: 'Profº Emerson Silva',
    startBRT: '21:00',
    endBRT: '22:00',
    monitor: 'Cristiano',
    monitorEmail: 'sacrasub@gmail.com',
    turma: 'Turma A',
    presencaUrl: 'https://forms.gle/vULryGYArnJZgBF28',
    meetUrl: 'https://meet.google.com/jnz-hkqd-edc',
    description: 'História e contexto sociocultural afro-brasileiro e indígena no contexto cristão.'
  },

  // ==========================================
  // TURMA B (3º Período - Semanal Noturno)
  // Monitores: André, Daniel e Renata
  // ==========================================
  {
    id: 'esc-tb-1',
    dayOfWeek: 'Terça-feira',
    dayIndex: 2,
    title: 'Introdução ao Novo Testamento',
    professor: 'Profº Leonardo Paulino',
    startBRT: '19:00',
    endBRT: '20:25',
    monitor: 'André',
    monitorEmail: 'andreseminariouiecb@gmail.com',
    turma: 'Turma B',
    presencaUrl: '',
    meetUrl: 'https://meet.google.com/esq-sjmd-sau',
    description: 'Acompanhamento do 1º horário de Introdução ao Novo Testamento (Monitor Titular: André / Apoio: Renata).'
  },
  {
    id: 'esc-tb-2',
    dayOfWeek: 'Terça-feira',
    dayIndex: 2,
    title: 'Hermenêutica Bíblica',
    professor: 'Profº David Bezerra',
    startBRT: '20:35',
    endBRT: '22:00',
    monitor: 'André',
    monitorEmail: 'andreseminariouiecb@gmail.com',
    turma: 'Turma B',
    presencaUrl: '',
    meetUrl: 'https://meet.google.com/vee-maaz-cdn',
    description: 'Acompanhamento do 2º horário de Hermenêutica Bíblica (Monitor: André).'
  },
  {
    id: 'esc-tb-3',
    dayOfWeek: 'Quarta-feira',
    dayIndex: 3,
    title: 'Fundamentos e Prática do Discipulado',
    professor: 'Profº José Milton',
    startBRT: '19:00',
    endBRT: '20:25',
    monitor: 'André',
    monitorEmail: 'andreseminariouiecb@gmail.com',
    turma: 'Turma B',
    presencaUrl: '',
    meetUrl: 'https://meet.google.com/xrk-hfza-tks',
    description: 'Acompanhamento do 1º horário de Discipulado Cristão (Monitor: André).'
  },
  {
    id: 'esc-tb-4',
    dayOfWeek: 'Quarta-feira',
    dayIndex: 3,
    title: 'Teologia da Missão',
    professor: 'Profº Jefferson Pontes',
    startBRT: '20:35',
    endBRT: '22:00',
    monitor: 'Daniel',
    monitorEmail: 'daniel.monitor@uiecbead.com.br',
    turma: 'Turma B',
    presencaUrl: '',
    meetUrl: 'https://meet.google.com/gjg-jrbq-atk',
    description: 'Acompanhamento do 2º horário de Teologia da Missão (Monitor: Daniel).'
  },
  {
    id: 'esc-tb-5',
    dayOfWeek: 'Quinta-feira',
    dayIndex: 4,
    title: 'Teologia Sistemática III - Cristologia/Pneumatologia',
    professor: 'Profº Marcio Leal',
    startBRT: '19:00',
    endBRT: '20:25',
    monitor: 'Daniel',
    monitorEmail: 'daniel.monitor@uiecbead.com.br',
    turma: 'Turma B',
    presencaUrl: '',
    meetUrl: '',
    description: 'Doutrina de Cristo e do Espírito Santo (Monitor: Daniel).'
  },
  {
    id: 'esc-tb-6',
    dayOfWeek: 'Quinta-feira',
    dayIndex: 4,
    title: 'Antigo Testamento II - Livros Históricos',
    professor: 'Profª Betânia Barbosa',
    startBRT: '20:35',
    endBRT: '22:00',
    monitor: 'Daniel',
    monitorEmail: 'daniel.monitor@uiecbead.com.br',
    turma: 'Turma B',
    presencaUrl: '',
    meetUrl: '',
    description: 'Exegese e história dos Livros Históricos (Monitor: Daniel).'
  },
  {
    id: 'esc-tb-7',
    dayOfWeek: 'Sexta-feira',
    dayIndex: 5,
    title: 'Plantação e Revitalização de Igrejas II',
    professor: 'Profº Thácyto Lessa',
    startBRT: '19:00',
    endBRT: '20:25',
    monitor: 'Renata',
    monitorEmail: 'renata.monitora@uiecbead.com.br',
    turma: 'Turma B',
    presencaUrl: '',
    meetUrl: 'https://meet.google.com/jwb-wpvc-pzm',
    description: 'Metodologias de plantação e revitalização (Monitora: Renata - auxílio aos novos alunos).'
  },
  {
    id: 'esc-tb-8',
    dayOfWeek: 'Sexta-feira',
    dayIndex: 5,
    title: 'Liderança Cristã',
    professor: 'Profº Sandro Cruz',
    startBRT: '21:00',
    endBRT: '22:00',
    monitor: 'Daniel',
    monitorEmail: 'daniel.monitor@uiecbead.com.br',
    turma: 'Turma B',
    presencaUrl: '',
    meetUrl: '',
    description: 'Princípios e formação de liderança cristã bíblica (Monitor: Daniel).'
  },
  {
    id: 'esc-tb-9',
    dayOfWeek: 'Sexta-feira',
    dayIndex: 5,
    title: 'Homilética I / Homilética II (Novatos26.2)',
    professor: 'Profº Wellington Estrela',
    startBRT: '19:00',
    endBRT: '21:00',
    monitor: 'Módulo Gravado',
    monitorEmail: '',
    turma: 'Turma B',
    typeTag: '📹 Módulo Gravado / Assíncrono',
    presencaUrl: '',
    meetUrl: '',
    description: 'Conteúdo gravado disponibilizado para estudo assíncrono.'
  },

  // ==========================================
  // TURMA DE FIM DE SEMANA (5º Período - Sexta/Sábado)
  // Monitores: Thiago, Júlia e Paulo Roberto
  // ==========================================
  {
    id: 'esc-fds-1',
    dayOfWeek: 'Sexta-feira',
    dayIndex: 5,
    title: 'Grego I / Grego II',
    professor: 'Profº Samuel Cesarino',
    startBRT: '19:00',
    endBRT: '21:00',
    monitor: 'Thiago',
    monitorEmail: 'thiago.monitor@uiecbead.com.br',
    turma: 'Fim de Semana',
    presencaUrl: '',
    meetUrl: '',
    description: 'Morfologia, vocabulário e exegese básica de Grego Instrumental (Monitor: Thiago).'
  },
  {
    id: 'esc-fds-2',
    dayOfWeek: 'Sexta-feira',
    dayIndex: 5,
    title: 'Exegese do Novo Testamento',
    professor: 'Profº Willian Orlandi',
    startBRT: '21:00',
    endBRT: '22:00',
    monitor: 'Júlia',
    monitorEmail: 'julia.monitora@uiecbead.com.br',
    turma: 'Fim de Semana',
    presencaUrl: '',
    meetUrl: '',
    description: 'Métodos exegéticos aplicados aos textos neo-testamentários (Monitora: Júlia).'
  },
  {
    id: 'esc-fds-3',
    dayOfWeek: 'Sexta-feira', // No sábado às 07h, registrado na escala
    dayIndex: 6,
    title: 'Apologética I / Apologética II',
    professor: 'Profª Karoline Evangelista',
    startBRT: '07:00',
    endBRT: '09:50',
    monitor: 'Thiago',
    monitorEmail: 'thiago.monitor@uiecbead.com.br',
    turma: 'Fim de Semana',
    presencaUrl: '',
    meetUrl: '',
    description: 'Defesa racional e bíblica da fé cristã (Sábado matutino - Monitor: Thiago).'
  },
  {
    id: 'esc-fds-4',
    dayOfWeek: 'Sexta-feira', // No sábado às 10h
    dayIndex: 6,
    title: 'Novo Testamento II - Epístolas Paulinas',
    professor: 'Profº Alexsandro Silva',
    startBRT: '10:00',
    endBRT: '11:20',
    monitor: 'Paulo Roberto',
    monitorEmail: 'pauloroberto.monitor@uiecbead.com.br',
    turma: 'Fim de Semana',
    presencaUrl: '',
    meetUrl: '',
    description: 'Estudo das epístolas do apóstolo Paulo (Sábado - Monitor: Paulo Roberto).'
  },
  {
    id: 'esc-fds-5',
    dayOfWeek: 'Sexta-feira', // No sábado às 13h
    dayIndex: 6,
    title: 'História do Pensamento Cristão I / II',
    professor: 'Profº Leonardo Paulino',
    startBRT: '13:00',
    endBRT: '15:50',
    monitor: 'Júlia',
    monitorEmail: 'julia.monitora@uiecbead.com.br',
    turma: 'Fim de Semana',
    presencaUrl: '',
    meetUrl: '',
    description: 'Desenvolvimento histórico do pensamento cristão (Sábado vespertino - Monitores: Júlia & Paulo Roberto).'
  }
];

const DEFAULT_CHECKLIST = [
  { id: 'chk-1', text: 'Entrar na sala do Google Meet 15 minutos antes (testar microfone e câmera)', done: false },
  { id: 'chk-2', text: 'Recepcionar o(a) professor(a) e alinhar início da transmissão', done: false },
  { id: 'chk-3', text: 'Iniciar a gravação oficial da aula no Google Meet', done: false },
  { id: 'chk-4', text: 'Disparar o envio da Lista de Presença no chat ao atingir 50% do tempo de aula', done: false },
  { id: 'chk-5', text: 'Reenviar link de presença aos alunos que entraram após o intervalo', done: false },
  { id: 'chk-6', text: 'Disparar aviso de encerramento da lista de presença 10 minutos antes do fim', done: false },
  { id: 'chk-7', text: 'Encerrar gravação e conferir salvamento automático no Google Drive', done: false },
  { id: 'chk-8', text: 'Registrar ocorrências no grupo oficial da monitoria no WhatsApp', done: false },
];

interface EscalaMonitoriaPageProps {
  userEmail?: string;
  currentRole?: UserRole;
  onTabChange?: (tab: string) => void;
}

export const EscalaMonitoriaPage: React.FC<EscalaMonitoriaPageProps> = ({
  userEmail,
  currentRole = 'monitor',
  onTabChange
}) => {
  const [selectedMonitor, setSelectedMonitor] = useState<string>('Todos');
  const [selectedDay, setSelectedDay] = useState<string>('Todos');
  const [selectedTurma, setSelectedTurma] = useState<'Todos' | 'Turma A' | 'Turma B'>('Turma A');
  const [turmaPrintTab, setTurmaPrintTab] = useState<'Turma A' | 'Turma B' | 'Todos'>('Turma A');
  const [turmaEquipeTab, setTurmaEquipeTab] = useState<'Todas' | 'Turma A' | 'Turma B'>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'compacto' | 'grade' | 'equipe' | 'checklist' | 'trocas' | 'leituras' | 'materiais' | 'portaria'>('grade');

  // Diretrizes da Coordenação, Validador de Alunos e Diário de Ocorrências
  const [diretrizesList, setDiretrizesList] = useState<DiretrizAcesso[]>(() => getDiretrizes());
  const [ocorrenciasList, setOcorrenciasList] = useState<OcorrenciaMonitoria[]>(() => getOcorrencias());
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
  const [copiedStudentEmail, setCopiedStudentEmail] = useState<string | null>(null);
  const [modalNovaOcorrencia, setModalNovaOcorrencia] = useState<boolean>(false);
  const [formOcorrenciaTipo, setFormOcorrenciaTipo] = useState<OcorrenciaMonitoria['tipo']>('liberacao_acesso');
  const [formOcorrenciaAluno, setFormOcorrenciaAluno] = useState<string>('');
  const [formOcorrenciaEmail, setFormOcorrenciaEmail] = useState<string>('');
  const [formOcorrenciaDisciplina, setFormOcorrenciaDisciplina] = useState<string>('');
  const [formOcorrenciaDesc, setFormOcorrenciaDesc] = useState<string>('');

  const [copiedLinkMap, setCopiedLinkMap] = useState<Record<string, boolean>>({});
  const [copiedMeetMap, setCopiedMeetMap] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRecorderOpen, setIsRecorderOpen] = useState<boolean>(false);

  // Leituras Pré-Aula e Avisos com Links
  const [announcements, setAnnouncements] = useState<AvisoLeituraPreAula[]>([]);
  const [announcementsSubTab, setAnnouncementsSubTab] = useState<'active' | 'archived'>('active');
  const [copiedAvisoId, setCopiedAvisoId] = useState<string | null>(null);
  const [editingAvisoId, setEditingAvisoId] = useState<string | null>(null);
  const [formAvisoDisc, setFormAvisoDisc] = useState<string>('História do Congregacionalismo');
  const [formAvisoAuthor, setFormAvisoAuthor] = useState<string>('Camila (Monitora)');
  const [formAvisoTitle, setFormAvisoTitle] = useState<string>('');
  const [formAvisoUrl, setFormAvisoUrl] = useState<string>('');
  const [formAvisoMsg, setFormAvisoMsg] = useState<string>('');
  const [formAvisoCategory, setFormAvisoCategory] = useState<'pre_aula' | 'durante_aula' | 'complementar'>('durante_aula');
  const [formAvisoTargetDate, setFormAvisoTargetDate] = useState<string>('Próxima Aula');

  useEffect(() => {
    setAnnouncements(getAnnouncements());
    const handleUpd = (e: any) => {
      if (e.detail) setAnnouncements(e.detail);
      else setAnnouncements(getAnnouncements());
    };
    window.addEventListener('lms_announcements_updated', handleUpd);
    return () => window.removeEventListener('lms_announcements_updated', handleUpd);
  }, []);

  const handleStartEditAviso = (av: AvisoLeituraPreAula) => {
    setEditingAvisoId(av.id);
    setFormAvisoDisc(av.disciplina_name);
    setFormAvisoAuthor(av.author_name);
    setFormAvisoTitle(av.title);
    setFormAvisoUrl(av.link_url);
    setFormAvisoMsg(av.message || '');
    setFormAvisoCategory(av.category || 'pre_aula');
    setFormAvisoTargetDate(av.target_date || 'Próxima Aula');
    showToast(`✏️ Editando: "${av.title}"`);
    // Foca na aba de leituras
    setActiveTab('leituras');
  };

  const handleCancelEdit = () => {
    setEditingAvisoId(null);
    setFormAvisoTitle('');
    setFormAvisoUrl('');
    setFormAvisoMsg('');
    setFormAvisoCategory('durante_aula');
    setFormAvisoTargetDate('Próxima Aula');
  };

  const handleAddAvisoMonitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAvisoTitle || !formAvisoUrl) {
      showToast('Preencha o título e o link de acesso.');
      return;
    }

    const discObj = ESCALA_DATA.find((c) => c.title === formAvisoDisc) || ESCALA_DATA[0];

    if (editingAvisoId) {
      const existing = announcements.find((a) => a.id === editingAvisoId);
      if (existing) {
        updateAnnouncement({
          ...existing,
          disciplina_id: discObj.id,
          disciplina_name: discObj.title,
          author_name: formAvisoAuthor,
          title: formAvisoTitle,
          link_url: formAvisoUrl,
          message: formAvisoMsg || 'Link / material de apoio compartilhado com a turma.',
          category: formAvisoCategory,
          target_date: formAvisoTargetDate || discObj.dayOfWeek,
        });
        showToast('Leitura / Link atualizado com sucesso!');
        handleCancelEdit();
        setAnnouncements(getAnnouncements());
        return;
      }
    }

    addAnnouncement({
      disciplina_id: discObj.id,
      disciplina_name: discObj.title,
      author_name: formAvisoAuthor,
      author_role: 'monitor',
      title: formAvisoTitle,
      link_url: formAvisoUrl,
      message: formAvisoMsg || (formAvisoCategory === 'durante_aula' ? 'Link compartilhado pelo professor durante a aula ao vivo.' : 'Material complementar para apoio à aula.'),
      category: formAvisoCategory,
      target_date: formAvisoTargetDate || discObj.dayOfWeek,
      is_pinned: true,
      avatar_url: getMonitorAvatar(formAvisoAuthor.split(' ')[0] || 'Camila'),
    });

    setAnnouncements(getAnnouncements());
    handleCancelEdit();
    showToast(formAvisoCategory === 'durante_aula' ? 'Link da aula ao vivo compartilhado com sucesso!' : 'Leitura publicada com sucesso!');
  };

  const handleArchiveAviso = (id: string) => {
    archiveAnnouncement(id);
    setAnnouncements(getAnnouncements());
    showToast('Leitura movida para o acervo de arquivadas.');
  };

  const handleUnarchiveAviso = (id: string) => {
    unarchiveAnnouncement(id);
    setAnnouncements(getAnnouncements());
    showToast('Leitura reativada no mural principal dos alunos!');
  };

  const handleCopyAvisoWhatsApp = (av: AvisoLeituraPreAula) => {
    const text = formatAnnouncementForWhatsApp(av);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAvisoId(av.id);
      showToast('Mensagem formatada copiada para WhatsApp!');
      setTimeout(() => setCopiedAvisoId(null), 3000);
    });
  };

  const handleDeleteAviso = (id: string) => {
    if (confirm('Deseja realmente excluir este link / leitura?')) {
      deleteAnnouncement(id);
      setAnnouncements(getAnnouncements());
      if (editingAvisoId === id) handleCancelEdit();
      showToast('Item removido com sucesso.');
    }
  };

  // =========================================================================
  // MOTOR DE ALARMES INTELIGENTES PARA MONITORES (ALTA POTÊNCIA ACÚSTICA)
  // =========================================================================
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [alarmVolume, setAlarmVolume] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lms_alarm_volume');
      if (saved) return Number(saved) || 0.9;
    }
    return 0.9;
  });
  const [lastPlayedAlarmKey, setLastPlayedAlarmKey] = useState<string>('');
  const [currentMinutesTick, setCurrentMinutesTick] = useState<number>(() => getCurrentBrasiliaMinutes());

  // Sincronização em tempo real de gravações ativas (bloqueio entre monitores)
  const [activeRecordings, setActiveRecordings] = useState<ActiveRecordingSession[]>(() => getActiveRecordings());
  const [allGravacoes, setAllGravacoes] = useState(() => getAllGravacoes());

  useEffect(() => {
    const handleActiveUpdate = () => {
      setActiveRecordings(getActiveRecordings());
      setAllGravacoes(getAllGravacoes());
    };
    window.addEventListener('lms_active_recordings_updated', handleActiveUpdate);
    window.addEventListener('lms_gravacoes_updated', handleActiveUpdate);
    fetchActiveRecordingsFromCloud().then(setActiveRecordings);
    fetchGravacoesFromCloud().then((list) => setAllGravacoes(list));

    return () => {
      window.removeEventListener('lms_active_recordings_updated', handleActiveUpdate);
      window.removeEventListener('lms_gravacoes_updated', handleActiveUpdate);
    };
  }, []);

  // Atualização periódica dos minutos a cada 5 segundos para precisão nos alarmes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMinutesTick(getCurrentBrasiliaMinutes());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Toca o alarme sonoro com volume ajustado e alta nitidez harmônica
  const playAlarmTone = (type: 'recording' | 'presence' | 'closing') => {
    if (!soundEnabled) return;
    if (type === 'recording') {
      playRecordingAlarm(alarmVolume);
    } else if (type === 'presence') {
      playPresenceAlarm(alarmVolume);
    } else {
      playClosingAlarm(alarmVolume);
    }
  };

  // Cálculo do Alarme Ativo em Tempo Real
  const monitorAlarm = useMemo(() => {
    const now = new Date();
    const dayIndex = now.getDay();
    const daysMap: Record<number, string> = {
      2: 'Terça-feira',
      3: 'Quarta-feira',
      4: 'Quinta-feira',
      5: 'Sexta-feira',
    };
    const currentDayName = daysMap[dayIndex];
    if (!currentDayName) return null;

    const currentMinutes = currentMinutesTick;
    const todayFormatted = now.toLocaleDateString('pt-BR');

    // Aulas de hoje da Turma A (ou turma selecionada)
    const aulasToday = ESCALA_DATA.filter(
      (a) => (selectedTurma === 'Todos' ? true : a.turma === selectedTurma) && a.dayOfWeek === currentDayName && a.startBRT && a.endBRT
    );

    for (const aula of aulasToday) {
      const [startH, startM] = aula.startBRT.split(':').map(Number);
      const [endH, endM] = aula.endBRT.split(':').map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      const durationMin = endMin - startMin;
      const halfDurationMin = Math.round(durationMin / 2); // Ex: 43 min para aula de 1h25 (85 min), 30 min para aula de 1h (60 min)
      const midMin = startMin + halfDurationMin; // Momento de 50% sincronizado com o Painel do Aluno
      const closingMin = endMin - 10; // 10 min antes do fim

      // Verifica se a aula já está sendo gravada por algum monitor neste momento
      const activeSession = activeRecordings.find(
        (r) =>
          r.status === 'recording' &&
          (r.disciplinaName.toLowerCase().includes(aula.title.toLowerCase()) ||
            aula.title.toLowerCase().includes(r.disciplinaName.toLowerCase()) ||
            r.key.includes(aula.id))
      );

      // Verifica se a aula de hoje já possui gravação finalizada no LMS
      const isAlreadyRecordedToday = allGravacoes.some(
        (g) =>
          (g.disciplina_name?.toLowerCase().includes(aula.title.toLowerCase()) ||
            aula.title.toLowerCase().includes(g.disciplina_name?.toLowerCase())) &&
          g.data_aula === todayFormatted
      );

      // 0. Alarme Prévio de Preparação (15 min antes do início da aula)
      if (currentMinutes >= (startMin - 15) && currentMinutes < startMin) {
        if (!activeSession && !isAlreadyRecordedToday) {
          const minLeft = startMin - currentMinutes;
          return {
            type: 'recording' as const,
            key: `prep_${aula.id}_${startMin}`,
            aula,
            title: `⏰ Preparação da Aula: ${aula.title}`,
            message: `A aula inicia em ${minLeft} min (às ${aula.startBRT} BRT). Acesse a sala do Google Meet com 15 min de antecedência para abrir a sessão e acolher a turma!`,
            actionLabel: '📹 Acessar Sala do Google Meet',
            badge: `Inicia em ${minLeft} min`,
          };
        }
      }

      // 1. Alarme de Início de Aula & Gravação: SÓ ALARMAR NO HORÁRIO CERTO DO INÍCIO (a partir de startMin até midMin)
      // REGRA: Se qualquer monitor já iniciou a gravação OU a aula já foi gravada hoje, o alarme DESAPARECE!
      if (currentMinutes >= startMin && currentMinutes < midMin) {
        if (!activeSession && !isAlreadyRecordedToday) {
          return {
            type: 'recording' as const,
            key: `rec_${aula.id}_${startMin}`,
            aula,
            title: `🚨 Início da Aula: ${aula.title}`,
            message: `A aula iniciou às ${aula.startBRT} BRT. Acesse o Google Meet e inicie a gravação oficial da aula!`,
            actionLabel: '🔴 Iniciar Gravação Pré-Configurada',
            badge: 'Início da Transmissão',
          };
        }
      }

      // 2. Alarme de Disparo de Chamada (Aos 50% de aula - correspondendo ao Painel do Aluno)
      if (currentMinutes >= midMin && currentMinutes < closingMin) {
        const elapsed = currentMinutes - startMin;
        const currentPct = Math.min(100, Math.max(0, Math.round((elapsed / durationMin) * 100)));
        return {
          type: 'presence' as const,
          key: `pres_${aula.id}_${midMin}`,
          aula,
          title: `📋 Hora da Chamada: Disparar Presença no Chat`,
          message: `Atingidos ${halfDurationMin} minutos (50%) da aula de ${aula.title}. Dispare agora o formulário de presença no chat do Google Meet!`,
          actionLabel: '📋 Copiar Mensagem de Presença com Link',
          badge: `Chamada Oficial (${currentPct}%)`,
        };
      }

      // 3. Alarme de Encerramento (10 min antes do fim)
      if (currentMinutes >= closingMin && currentMinutes <= endMin) {
        return {
          type: 'closing' as const,
          key: `close_${aula.id}_${closingMin}`,
          aula,
          title: `⏳ Alarme de Encerramento: Chamada Fechando`,
          message: `Faltam 10 minutos para encerrar a aula de ${aula.title}. Avise no chat que o formulário fechará ao término da aula.`,
          actionLabel: '📢 Enviar Aviso de Encerramento',
          badge: 'Encerramento em 10 Min',
        };
      }
    }

    return null;
  }, [currentMinutesTick, selectedTurma, activeRecordings, allGravacoes]);

  // Cálculo da Aula Ativa em Andamento e Barra de Progresso/Contagem (com 15 min de antecedência)
  const activeLiveAulaMonitor = useMemo(() => {
    const now = new Date();
    const dayIndex = now.getDay();
    const daysMap: Record<number, string> = {
      2: 'Terça-feira',
      3: 'Quarta-feira',
      4: 'Quinta-feira',
      5: 'Sexta-feira',
    };
    const currentDayName = daysMap[dayIndex];
    if (!currentDayName) return null;

    const currentMinutes = currentMinutesTick;

    // Aulas de hoje da Turma A (ou turma selecionada)
    const aulasToday = ESCALA_DATA.filter(
      (a) => (selectedTurma === 'Todos' ? true : a.turma === selectedTurma) && a.dayOfWeek === currentDayName && a.startBRT && a.endBRT
    );

    for (const aula of aulasToday) {
      const [startH, startM] = aula.startBRT.split(':').map(Number);
      const [endH, endM] = aula.endBRT.split(':').map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;

      if (currentMinutes >= (startMin - 15) && currentMinutes <= endMin) {
        const totalDuration = endMin - startMin;
        const isPreLive = currentMinutes < startMin;
        const minutesToStart = isPreLive ? startMin - currentMinutes : 0;
        const elapsed = isPreLive ? 0 : currentMinutes - startMin;
        const pct = isPreLive ? 0 : Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
        const is50PercentReached = pct >= 50;

        return {
          aula,
          startMin,
          endMin,
          totalDuration,
          elapsed,
          isPreLive,
          minutesToStart,
          progressPercent: pct,
          is50PercentReached,
        };
      }
    }

    return null;
  }, [currentMinutesTick, selectedTurma]);

  // Efeito para tocar som de alarme quando acionado
  useEffect(() => {
    if (monitorAlarm && soundEnabled && monitorAlarm.key !== lastPlayedAlarmKey) {
      setLastPlayedAlarmKey(monitorAlarm.key);
      playAlarmTone(monitorAlarm.type);
    }
  }, [monitorAlarm, soundEnabled, lastPlayedAlarmKey]);

  // Fuso horário local detectado (como no restante do LMS)
  const [tzInfo, setTzInfo] = useState<TimeZoneInfo>({
    timeZone: 'America/Sao_Paulo',
    gmtOffset: 'GMT-3',
    isBRT: true
  });

  useEffect(() => {
    setTzInfo(getLocalTimeZoneInfo());
  }, []);

  // Armazenamento das fotos reais cadastradas dos monitores
  const [monitoresPhotos, setMonitoresPhotos] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lms_monitores_custom_photos');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return {
      Camila: DEFAULT_MONITORES_DATA.Camila?.avatarUrl || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
      Cristiano: DEFAULT_MONITORES_DATA.Cristiano?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      Rosiane: DEFAULT_MONITORES_DATA.Rosiane?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      'Monitoria Turma B': DEFAULT_MONITORES_DATA['Monitoria Turma B']?.avatarUrl || DEFAULT_MONITORES_DATA.André?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    };
  });

  // Modal para trocar foto com upload ou link
  const [modalFotoMonitor, setModalFotoMonitor] = useState<string | null>(null);
  const [inputUrlFoto, setInputUrlFoto] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Checklist interativo persistido localmente
  const [checklist, setChecklist] = useState<typeof DEFAULT_CHECKLIST>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lms_monitor_checklist');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { return DEFAULT_CHECKLIST; }
      }
    }
    return DEFAULT_CHECKLIST;
  });

  // Solicitações de troca de escala
  const [trocas, setTrocas] = useState<TrocaEscalaRequest[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lms_monitor_trocas');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { return []; }
      }
    }
    return [
      {
        id: 'tr-sample-1',
        solicitante: 'Camila',
        monitorSubstituto: 'Rosiane',
        disciplina: 'Ética Cristã (Turma A)',
        dataAula: '2026-09-17 (Quinta-feira)',
        horario: '19:00 – 20:25',
        motivo: 'Compromisso eclesiástico inadiável. Já combinado previamente.',
        status: 'aprovada',
        createdAt: '2026-08-15T14:30:00Z'
      }
    ];
  });

  // Estado do formulário de nova troca
  const [modalNovaTroca, setModalNovaTroca] = useState<boolean>(false);
  const [formSolicitante, setFormSolicitante] = useState<string>('Camila');
  const [formSubstituto, setFormSubstituto] = useState<string>('Cristiano');
  const [formDisciplina, setFormDisciplina] = useState<string>('História do Congregacionalismo');
  const [formDataAula, setFormDataAula] = useState<string>('');
  const [formMotivo, setFormMotivo] = useState<string>('');

  // 0. AULAS CANCELADAS / SUSPENSAS
  const [aulasCanceladasList, setAulasCanceladasList] = useState<AulaCanceladaItem[]>([]);
  const [modalCancelamento, setModalCancelamento] = useState<{
    isOpen: boolean;
    aula: EscalaItem | null;
    currentDataAula: string;
    existingCancelada: AulaCanceladaItem | null;
  }>({
    isOpen: false,
    aula: null,
    currentDataAula: new Date().toLocaleDateString('pt-BR'),
    existingCancelada: null,
  });
  const [motivoCancelamentoInput, setMotivoCancelamentoInput] = useState<string>('');

  // Sincronização em tempo real de aulas canceladas
  useEffect(() => {
    const carregarCanceladas = () => {
      setAulasCanceladasList(getAllAulasCanceladas());
    };
    carregarCanceladas();
    fetchAulasCanceladasFromCloud().then(carregarCanceladas);

    window.addEventListener('lms_aula_cancelada_updated', carregarCanceladas);
    return () => window.removeEventListener('lms_aula_cancelada_updated', carregarCanceladas);
  }, []);

  // 1. CARREGAMENTO DAS FOTOS REAIS DOS CADASTROS DOS USUÁRIOS
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const carregarFotosReaisDosCadastros = async () => {
      try {
        const usersList = getAuthorizedUsersList();
        const updated = { ...monitoresPhotos };
        let changed = false;

        // 1.1. Consulta ao Supabase - Registro Global de Fotos dos Monitores
        try {
          const { data: dbPhotos } = await supabase
            .from('materiais')
            .select('file_url')
            .eq('title', 'lms_monitores_photos')
            .limit(1);

          if (dbPhotos && dbPhotos.length > 0 && dbPhotos[0].file_url) {
            try {
              const parsedCloud = JSON.parse(dbPhotos[0].file_url);
              if (parsedCloud.Camila && parsedCloud.Camila.length > 20) {
                updated.Camila = parsedCloud.Camila;
                changed = true;
              }
              if (parsedCloud.Cristiano && parsedCloud.Cristiano.length > 20) {
                updated.Cristiano = parsedCloud.Cristiano;
                changed = true;
              }
              if (parsedCloud.Rosiane && parsedCloud.Rosiane.length > 20) {
                updated.Rosiane = parsedCloud.Rosiane;
                changed = true;
              }
            } catch (e) {}
          }
        } catch (e) {}

        // 1.2. Consulta à tabela de usuários cadastrados do Supabase
        try {
          const { data: dbUsers } = await supabase
            .from('users')
            .select('email, avatar_url, full_name');

          if (dbUsers && dbUsers.length > 0) {
            dbUsers.forEach((u) => {
              const em = (u.email || '').toLowerCase().trim();
              const av = u.avatar_url;
              if (av && av.length > 10 && !av.includes('unsplash')) {
                if (em.includes('camila') && (!updated.Camila || updated.Camila.includes('unsplash'))) {
                  updated.Camila = av;
                  changed = true;
                }
                if ((em.includes('sacra') || em.includes('cristian')) && (!updated.Cristiano || updated.Cristiano.includes('unsplash'))) {
                  updated.Cristiano = av;
                  changed = true;
                }
                if (em.includes('rosiane') && (!updated.Rosiane || updated.Rosiane.includes('unsplash'))) {
                  updated.Rosiane = av;
                  changed = true;
                }
              }
            });
          }
        } catch (e) {}

        // 1.3. Fallback de Sync dos Perfis Individuais
        const emailsMap = [
          { key: 'Camila', emails: ['camilagbalbi@gmail.com', 'camila@uicb.edu.br'] },
          { key: 'Cristiano', emails: ['sacrasub@gmail.com', 'sacrasub03@gmail.com'] },
          { key: 'Rosiane', emails: ['rosianelcs73@gmail.com'] },
        ];

        for (const item of emailsMap) {
          for (const email of item.emails) {
            try {
              const cloudData = await fetchStudentData(email);
              if (cloudData.portalProfile && (cloudData.portalProfile as any).avatarUrl) {
                const cloudAvatar = (cloudData.portalProfile as any).avatarUrl;
                if (cloudAvatar && cloudAvatar.length > 20 && !cloudAvatar.includes('unsplash')) {
                  if (updated[item.key] !== cloudAvatar) {
                    updated[item.key] = cloudAvatar;
                    changed = true;
                  }
                }
              }
            } catch {}
          }
        }

        // 1.4. Perfis locais no LocalStorage
        const camilaProfileStr = localStorage.getItem('lms_user_profile_camilagbalbi@gmail.com');
        if (camilaProfileStr) {
          try {
            const p = JSON.parse(camilaProfileStr);
            if (p.avatarUrl && !p.avatarUrl.includes('unsplash') && p.avatarUrl !== updated.Camila) {
              updated.Camila = p.avatarUrl;
              changed = true;
            }
          } catch {}
        }

        const cristianoProfileStr = localStorage.getItem('lms_user_profile_sacrasub03@gmail.com') || localStorage.getItem('lms_user_profile_sacrasub@gmail.com');
        if (cristianoProfileStr) {
          try {
            const p = JSON.parse(cristianoProfileStr);
            if (p.avatarUrl && !p.avatarUrl.includes('unsplash') && p.avatarUrl !== updated.Cristiano) {
              updated.Cristiano = p.avatarUrl;
              changed = true;
            }
          } catch {}
        }

        const rosianeProfileStr = localStorage.getItem('lms_user_profile_rosianelcs73@gmail.com');
        if (rosianeProfileStr) {
          try {
            const p = JSON.parse(rosianeProfileStr);
            if (p.avatarUrl && !p.avatarUrl.includes('unsplash') && p.avatarUrl !== updated.Rosiane) {
              updated.Rosiane = p.avatarUrl;
              changed = true;
            }
          } catch {}
        }

        if (changed) {
          setMonitoresPhotos(updated);
          localStorage.setItem('lms_monitores_custom_photos', JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Erro ao carregar fotos reais:', e);
      }
    };

    carregarFotosReaisDosCadastros();

    const handleSyncEvent = () => carregarFotosReaisDosCadastros();
    window.addEventListener('lms_student_sync_updated', handleSyncEvent);
    return () => window.removeEventListener('lms_student_sync_updated', handleSyncEvent);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lms_monitor_checklist', JSON.stringify(checklist));
    }
  }, [checklist]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lms_monitor_trocas', JSON.stringify(trocas));
    }
  }, [trocas]);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Obter foto ativa do monitor
  const getMonitorAvatar = (monitorName: string): string => {
    if (monitoresPhotos[monitorName]) return monitoresPhotos[monitorName];
    if (DEFAULT_MONITORES_DATA[monitorName]?.avatarUrl) return DEFAULT_MONITORES_DATA[monitorName].avatarUrl;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(monitorName)}&background=1e3a8a&color=fff&bold=true`;
  };

  // Upload direto de arquivo da galeria / câmera
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !modalFotoMonitor) return;

    if (!file.type.startsWith('image/')) {
      showToast('Selecione um arquivo de imagem válido (PNG, JPG, etc).');
      return;
    }

    try {
      setUploadingImage(true);
      const base64 = await compressImageFile(file);
      setInputUrlFoto(base64);
      setUploadingImage(false);
      showToast('Imagem carregada com sucesso! Clique em Salvar.');
    } catch (err) {
      setUploadingImage(false);
      showToast('Erro ao processar imagem.');
    }
  };

  // Salvar foto e persistir no perfil do usuário, no authConfig e no Supabase global
  const handleSalvarFotoCustomizada = async (monitorKey: string, newUrl: string) => {
    if (!newUrl) return;
    const updated = { ...monitoresPhotos, [monitorKey]: newUrl };
    setMonitoresPhotos(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lms_monitores_custom_photos', JSON.stringify(updated));
    }

    // 1. Atualiza também o cadastro oficial do usuário correspondente
    const emailMapping: Record<string, string[]> = {
      Camila: ['camilagbalbi@gmail.com', 'camila@uicb.edu.br'],
      Cristiano: ['sacrasub@gmail.com', 'sacrasub03@gmail.com'],
      Rosiane: ['rosianelcs73@gmail.com'],
    };

    const targetEmails = emailMapping[monitorKey] || [];
    for (const targetEmail of targetEmails) {
      addOrUpdateAuthorizedUser({
        email: targetEmail,
        name: DEFAULT_MONITORES_DATA[monitorKey]?.name || monitorKey,
        roles: ['monitor', 'aluno'],
        defaultRole: 'monitor',
        avatarUrl: newUrl
      });
      savePortalProfile(targetEmail, { avatarUrl: newUrl });
    }

    // 2. Persiste no Supabase em tempo real sob 'lms_monitores_photos'
    try {
      const { data: existing } = await supabase
        .from('materiais')
        .select('id')
        .eq('title', 'lms_monitores_photos');

      if (existing && existing.length > 0) {
        await supabase
          .from('materiais')
          .update({ file_url: JSON.stringify(updated) })
          .eq('id', existing[0].id);
      } else {
        await supabase
          .from('materiais')
          .insert({
            title: 'lms_monitores_photos',
            file_url: JSON.stringify(updated),
            is_native_upload: false,
          });
      }
    } catch (errSupabase) {
      console.warn('Erro ao persistir fotos na nuvem:', errSupabase);
    }

    setModalFotoMonitor(null);
    setInputUrlFoto('');
    showToast(`Foto de ${monitorKey} salva e sincronizada na nuvem com sucesso!`);
  };

  const handleCopyPresenca = (link: string, classId: string, disciplina: string) => {
    if (!link) return;
    const textToCopy = `📋 LISTA DE PRESENÇA\n📖 Disciplina: ${disciplina}\n🔗 Link do Formulário: ${link}\n\nAtenção: Registre seu nome completo antes do término da aula.`;

    const executeCopy = () => {
      setCopiedLinkMap((prev) => ({ ...prev, [classId]: true }));
      showToast('Link de presença e mensagem copiados!');
      setTimeout(() => {
        setCopiedLinkMap((prev) => ({ ...prev, [classId]: false }));
      }, 2000);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy).then(executeCopy).catch(() => fallbackCopy(textToCopy, executeCopy));
    } else {
      fallbackCopy(textToCopy, executeCopy);
    }
  };

  const handleCopyMeet = (meetUrl: string, classId: string, disciplina: string, professor: string) => {
    if (!meetUrl) return;
    const textToCopy = `🔴 *AULA AO VIVO NO GOOGLE MEET*\n📖 Disciplina: ${disciplina}\n👨‍🏫 ${professor}\n🔗 Link da Sala: ${meetUrl}\n\nSeminário Teológico UIECB • 2026.2`;

    const executeCopy = () => {
      setCopiedMeetMap((prev) => ({ ...prev, [classId]: true }));
      showToast('Link do Google Meet copiado!');
      setTimeout(() => {
        setCopiedMeetMap((prev) => ({ ...prev, [classId]: false }));
      }, 2000);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(textToCopy).then(executeCopy).catch(() => fallbackCopy(textToCopy, executeCopy));
    } else {
      fallbackCopy(textToCopy, executeCopy);
    }
  };

  // Copiar escala formatada completa para WhatsApp (com Horários Locais e BRT)
  const handleCopyEscalaWhatsApp = (turmaTarget?: 'Turma A' | 'Turma B' | 'Todos') => {
    const turmaToUse = turmaTarget || (selectedTurma === 'Todos' ? turmaPrintTab : selectedTurma);
    const tzLabel = tzInfo.isBRT ? 'Horário de Brasília (BRT)' : `Horário Local (${tzInfo.gmtOffset}) / Brasília (BRT)`;

    const turmaTitle = turmaToUse === 'Turma A' 
      ? 'TURMA A (7º Período - Veteranos)' 
      : turmaToUse === 'Turma B' 
      ? 'TURMA B (3º Período)' 
      : 'GERAL (TODAS AS TURMAS)';

    let text = `📅 *ESCALA OFICIAL DE MONITORIA - ${turmaTitle} (2026.2)*\n🏛️ *Seminário Teológico UIECB*\n⏰ *Fuso:* ${tzLabel}\n\n`;

    const filteredItems = ESCALA_DATA.filter(c => turmaToUse === 'Todos' || c.turma === turmaToUse);

    daysOrder.forEach(day => {
      const classesOfDay = filteredItems.filter(c => c.dayOfWeek === day);
      if (classesOfDay.length === 0) return;

      text += `🗓️ *${day.toUpperCase()}*\n`;
      classesOfDay.forEach(c => {
        const startLocal = convertBRTToLocalTime(c.startBRT);
        const endLocal = convertBRTToLocalTime(c.endBRT);
        const timeDisplay = tzInfo.isBRT 
          ? `${c.startBRT} - ${c.endBRT}`
          : `${startLocal} - ${endLocal} (BRT: ${c.startBRT} - ${c.endBRT})`;

        if (c.typeTag?.includes('Assíncrono')) {
          text += `🔹 ${timeDisplay} | *${c.title}*\n   👨‍🏫 ${c.professor} (📹 Módulo Gravado)\n`;
        } else {
          text += `🔹 ${timeDisplay} | *${c.title}*\n   👨‍🏫 ${c.professor} • 👑 Monitor(a): *${c.monitor}*\n`;
        }
      });
      text += `\n`;
    });

    text += `📍 *Koinonia LMS:* https://koinonialms.vercel.app`;

    const onSuccess = () => showToast(`Escala da ${turmaToUse} copiada em formato WhatsApp com horários locais!`);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopy(text, onSuccess));
    } else {
      fallbackCopy(text, onSuccess);
    }
  };

  const fallbackCopy = (text: string, onSuccess: () => void) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      onSuccess();
    } catch {
      showToast('Texto copiado!');
    }
    document.body.removeChild(textArea);
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const resetChecklist = () => {
    setChecklist(prev => prev.map(item => ({ ...item, done: false })));
    showToast('Checklist reiniciado para novo plantão!');
  };

  const handleCriarTroca = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDataAula || !formMotivo) {
      showToast('Preencha a data e o motivo da troca.');
      return;
    }

    const nova: TrocaEscalaRequest = {
      id: `tr-${Date.now()}`,
      solicitante: formSolicitante,
      monitorSubstituto: formSubstituto,
      disciplina: formDisciplina,
      dataAula: formDataAula,
      horario: '19:00 ou 20:35 BRT',
      motivo: formMotivo,
      status: 'pendente',
      createdAt: new Date().toISOString()
    };

    setTrocas([nova, ...trocas]);
    setModalNovaTroca(false);
    setFormDataAula('');
    setFormMotivo('');
    showToast('Solicitação de troca registrada com sucesso!');
  };

  const handleAprovarTroca = (id: string) => {
    setTrocas(prev => prev.map(t => t.id === id ? { ...t, status: 'aprovada' } : t));
    showToast('Troca de escala marcada como APROVADA!');
  };

  // Monitores disponíveis para filtro conforme a Turma selecionada
  const availableMonitoresForSelectedTurma = useMemo(() => {
    if (selectedTurma === 'Turma A') {
      return ['Todos', 'Camila', 'Cristiano', 'Rosiane'];
    }
    if (selectedTurma === 'Turma B') {
      return ['Todos', 'Monitoria Turma B'];
    }
    return ['Todos', 'Camila', 'Cristiano', 'Rosiane', 'Monitoria Turma B'];
  }, [selectedTurma]);

  // Filtragem dos itens da escala
  const filteredEscala = useMemo(() => {
    return ESCALA_DATA.filter((item) => {
      const matchMonitor = selectedMonitor === 'Todos' || item.monitor.toLowerCase().includes(selectedMonitor.toLowerCase());
      const matchDay = selectedDay === 'Todos' || item.dayOfWeek === selectedDay;
      const matchTurma = selectedTurma === 'Todos' || item.turma === selectedTurma;
      const matchSearch = searchQuery.trim() === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.professor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.monitor.toLowerCase().includes(searchQuery.toLowerCase());

      return matchMonitor && matchDay && matchTurma && matchSearch;
    });
  }, [selectedMonitor, selectedDay, selectedTurma, searchQuery]);

  const baseDaysOrder: Array<'Terça-feira' | 'Quarta-feira' | 'Quinta-feira' | 'Sexta-feira'> = [
    'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'
  ];

  // Identificação do dia da semana atual
  const currentDayOfWeekName = useMemo(() => {
    const dayNum = new Date().getDay();
    if (dayNum === 2) return 'Terça-feira';
    if (dayNum === 3) return 'Quarta-feira';
    if (dayNum === 4) return 'Quinta-feira';
    if (dayNum === 5) return 'Sexta-feira';
    return null;
  }, []);

  // Ordenação inteligente: Dia de hoje no topo, seguido dos próximos dias e dias anteriores depois
  const daysOrder = useMemo(() => {
    if (currentDayOfWeekName) {
      const todayIdx = baseDaysOrder.indexOf(currentDayOfWeekName);
      if (todayIdx !== -1) {
        const upcomingAndToday = baseDaysOrder.slice(todayIdx);
        const pastDays = baseDaysOrder.slice(0, todayIdx);
        return [...upcomingAndToday, ...pastDays];
      }
    }
    return baseDaysOrder;
  }, [currentDayOfWeekName]);

  // Helper para calcular a data aproximada do dia da semana atual
  const getDateForDayOfWeek = (dayName: string): string => {
    const dayMap: Record<string, number> = {
      'Domingo': 0,
      'Segunda-feira': 1,
      'Terça-feira': 2,
      'Quarta-feira': 3,
      'Quinta-feira': 4,
      'Sexta-feira': 5,
      'Sábado': 6,
    };
    const targetDay = dayMap[dayName];
    if (targetDay === undefined) return new Date().toLocaleDateString('pt-BR');

    const now = new Date();
    const currentDay = now.getDay();
    const diff = targetDay - currentDay;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
    return targetDate.toLocaleDateString('pt-BR');
  };

  // Helper para obter status de cancelamento de um item da escala
  const getCanceladaStatusForItem = (item: EscalaItem) => {
    const dateForDay = getDateForDayOfWeek(item.dayOfWeek);
    return (
      aulasCanceladasList.find(
        (c) =>
          c.ativo &&
          c.data_aula === dateForDay &&
          (c.disciplina_id === item.id ||
            c.disciplina_name.toLowerCase().trim() === item.title.toLowerCase().trim())
      ) || null
    );
  };

  // Abrir modal de cancelamento
  const handleOpenModalCancelamento = (item: EscalaItem, existing: AulaCanceladaItem | null) => {
    const dateForDay = getDateForDayOfWeek(item.dayOfWeek);
    setModalCancelamento({
      isOpen: true,
      aula: item,
      currentDataAula: dateForDay,
      existingCancelada: existing,
    });
    setMotivoCancelamentoInput(existing?.motivo || '');
  };

  // Salvar cancelamento de aula
  const handleSalvarCancelamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCancelamento.aula) return;

    const motivoFinal = motivoCancelamentoInput.trim() || 'Imprevisto com o corpo docente. Aula suspensa nesta data.';
    const normalizedEmail = (userEmail || '').toLowerCase().trim();
    const authorizedUser = INITIAL_AUTHORIZED_USERS[normalizedEmail];
    const monitorLogadoName =
      authorizedUser?.name ||
      (normalizedEmail.includes('camila')
        ? 'Camila Balbi'
        : normalizedEmail.includes('sacra') || normalizedEmail.includes('cristian')
        ? 'Cristiano Sacramento'
        : normalizedEmail.includes('rosiane')
        ? 'Rosiane Santos'
        : currentRole === 'monitor'
        ? 'Monitoria UIECB'
        : 'Coordenação Acadêmica');

    await cancelarAula({
      disciplinaId: modalCancelamento.aula.id,
      disciplinaName: modalCancelamento.aula.title,
      dataAula: modalCancelamento.currentDataAula,
      motivo: motivoFinal,
      autorNome: monitorLogadoName,
      autorEmail: userEmail || 'monitor@uiecbead.com.br',
      autorRole: currentRole,
    });

    setModalCancelamento({ isOpen: false, aula: null, currentDataAula: '', existingCancelada: null });
    setMotivoCancelamentoInput('');
    showToast(`🚫 Aviso registrado: Não haverá aula de "${modalCancelamento.aula.title}" em ${modalCancelamento.currentDataAula}.`);
  };

  // Reativar aula cancelada
  const handleReativarAula = async () => {
    if (!modalCancelamento.aula) return;
    await reativarAula(modalCancelamento.aula.id, modalCancelamento.currentDataAula);
    await reativarAula(modalCancelamento.aula.title, modalCancelamento.currentDataAula);

    setModalCancelamento({ isOpen: false, aula: null, currentDataAula: '', existingCancelada: null });
    setMotivoCancelamentoInput('');
    showToast(`✅ Aula de "${modalCancelamento.aula.title}" reativada com sucesso!`);
  };

  const groupedEscala = useMemo(() => {
    return daysOrder.map(day => {
      const classes = filteredEscala.filter(item => item.dayOfWeek === day);
      return { day, classes };
    }).filter(group => group.classes.length > 0);
  }, [daysOrder, filteredEscala]);

  // Itens da escala para a aba Compacto/Print
  const printEscalaClasses = useMemo(() => {
    return ESCALA_DATA.filter(item => turmaPrintTab === 'Todos' || item.turma === turmaPrintTab);
  }, [turmaPrintTab]);

  const completedChecklistCount = checklist.filter(c => c.done).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700/60 backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 font-medium text-sm">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            ✓
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BANNER DE ALARME INTELIGENTE DA MONITORIA AO VIVO                         */}
      {/* ========================================================================= */}
      {monitorAlarm && (
        <div className={`p-4 sm:p-5 rounded-3xl border shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-300 ${
          monitorAlarm.type === 'recording'
            ? 'bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 border-red-500/60 text-white'
            : monitorAlarm.type === 'presence'
            ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border-amber-500/60 text-white'
            : 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-blue-500/60 text-white'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl shrink-0 ${
              monitorAlarm.type === 'recording'
                ? 'bg-red-600 text-white animate-pulse'
                : monitorAlarm.type === 'presence'
                ? 'bg-amber-500 text-slate-950 animate-bounce'
                : 'bg-blue-600 text-white'
            }`}>
              {monitorAlarm.type === 'recording' ? <Video className="w-6 h-6" /> : <Bell className="w-6 h-6" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  monitorAlarm.type === 'recording' ? 'bg-red-500 text-white' : 'bg-amber-400 text-slate-950'
                }`}>
                  {monitorAlarm.badge}
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  {monitorAlarm.aula.startBRT} – {monitorAlarm.aula.endBRT} BRT • Monitor(a): {monitorAlarm.aula.monitor}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                {monitorAlarm.title}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
                {monitorAlarm.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
            {monitorAlarm.type === 'recording' ? (
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('lms_open_recorder', {
                      detail: {
                        disciplina: monitorAlarm.aula.title,
                        aulaNumero: '1',
                        professor: monitorAlarm.aula.professor,
                      }
                    }));
                  }
                }}
                className="w-full sm:w-auto px-4 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 border border-red-400 cursor-pointer"
              >
                <Video className="w-4 h-4 text-white" />
                <span>🔴 Iniciar Gravação Pré-Configurada</span>
              </button>
            ) : (
              <button
                onClick={() => handleCopyPresenca(monitorAlarm.aula.presencaUrl, monitorAlarm.aula.id, monitorAlarm.aula.title)}
                className="w-full sm:w-auto px-4 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 border border-emerald-400 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-white" />
                <span>📋 Copiar Chamada p/ Meet</span>
              </button>
            )}

            <div className="flex items-center gap-1 bg-black/30 p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  playTestBeep(alarmVolume);
                  showToast(`🔊 Bipe sonoro de alta potência testado (${Math.round(alarmVolume * 100)}% de volume)!`);
                }}
                className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer"
                title="Testar sinal sonoro de alta potência na hora"
              >
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span className="hidden sm:inline">Testar Bipe</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newVol = alarmVolume >= 1.0 ? 0.6 : alarmVolume >= 0.8 ? 1.0 : 0.9;
                  setAlarmVolume(newVol);
                  if (typeof window !== 'undefined') localStorage.setItem('lms_alarm_volume', String(newVol));
                  playTestBeep(newVol);
                  showToast(`🔊 Volume do bipe ajustado para ${Math.round(newVol * 100)}%`);
                }}
                className="px-2 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-blue-200 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                title="Ajustar intensidade do volume do alarme"
              >
                <span>{alarmVolume >= 1.0 ? '🔊 100%' : alarmVolume >= 0.8 ? '🔉 90%' : '🔈 60%'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) {
                    playPresenceAlarm(alarmVolume);
                    showToast('🔊 Som do alarme ATIVADO.');
                  } else {
                    showToast('🔇 Som do alarme SILENCIADO.');
                  }
                }}
                className={`p-2 rounded-xl transition flex items-center justify-center cursor-pointer ${
                  soundEnabled
                    ? 'text-emerald-400 hover:bg-white/10'
                    : 'text-red-400 bg-red-500/20'
                }`}
                title={soundEnabled ? 'Silenciar som do alarme' : 'Ativar som do alarme'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BANNER DE GRAVAÇÃO ATIVA EM ANDAMENTO (SINCRONIZADO NA NUVEM) */}
      {activeRecordings.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-emerald-600 text-white animate-pulse shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-white">
                  🟢 Gravação em Andamento
                </span>
                <span className="text-xs text-emerald-200 font-mono">
                  {activeRecordings[0].disciplinaName} • Aula {activeRecordings[0].aulaNum}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                Gravação oficial iniciada por <strong>{activeRecordings[0].recordedByName}</strong>
              </h4>
              <p className="text-xs text-slate-300">
                A gravação será salva automaticamente na pasta compartilhada do Google Drive ao término. Os demais monitores estão protegidos contra duplicações.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('lms_open_recorder', {
                    detail: {
                      disciplina: activeRecordings[0].disciplinaName,
                      aulaNumero: activeRecordings[0].aulaNum,
                    }
                  }));
                }
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-2xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Status da Gravação</span>
            </button>

            <button
              onClick={async () => {
                if (confirm('Deseja realmente liberar a sala e encerrar o status desta gravação?')) {
                  if (activeRecordings[0]?.disciplinaId) {
                    await forceClearActiveRecordingForAula(activeRecordings[0].disciplinaId, activeRecordings[0].aulaNum);
                  }
                  await clearAllActiveRecordings();
                  await fetchActiveRecordingsFromCloud();
                }
              }}
              className="px-3 py-2.5 bg-slate-800/90 hover:bg-red-700/80 text-slate-200 hover:text-white font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              title="Liberar status da gravação caso a chamada já tenha sido finalizada"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Liberar Sala</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CARD DE AULA ATIVA COM BARRA DE CONTAGEM / PROGRESSO DE DURAÇÃO (MONITOR) */}
      {/* ========================================================================= */}
      {activeLiveAulaMonitor && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-xl space-y-4 animate-in fade-in duration-300">
          {/* Topo do Card de Aula Ativa */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 animate-pulse shadow-xs" />
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 leading-tight">
                Aula Ativa: <span className="text-blue-700">{activeLiveAulaMonitor.aula.title}</span>
              </h3>
              {activeLiveAulaMonitor.isPreLive && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-xs animate-pulse">
                  ⏰ Sala Aberta (Inicia em {activeLiveAulaMonitor.minutesToStart} min)
                </span>
              )}
            </div>

            <div className="text-xs text-gray-600 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Professor(a): <strong>{activeLiveAulaMonitor.aula.professor || 'Corpo Docente'}</strong></span>
              <span>•</span>
              <span>Monitor(a): <strong>{activeLiveAulaMonitor.aula.monitor}</strong></span>
              <span>•</span>
              <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                ⏰ Seu Horário: {convertBRTToLocalTime(activeLiveAulaMonitor.aula.startBRT)} – {convertBRTToLocalTime(activeLiveAulaMonitor.aula.endBRT)}
              </span>
              <span className="text-gray-500">
                (Base Brasília: {activeLiveAulaMonitor.aula.startBRT} – {activeLiveAulaMonitor.aula.endBRT} BRT)
              </span>
            </div>
          </div>

          {/* Barra de Progresso do Tempo da Aula */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> {activeLiveAulaMonitor.isPreLive ? 'Sala aberta com 15 min de antecedência' : 'Progresso de Duração da Aula em Andamento'}
              </span>
              <span className={`font-black px-2.5 py-0.5 rounded-md ${
                activeLiveAulaMonitor.is50PercentReached
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  : activeLiveAulaMonitor.isPreLive
                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}>
                {activeLiveAulaMonitor.isPreLive
                  ? `Início oficial em ${activeLiveAulaMonitor.minutesToStart} min`
                  : `${activeLiveAulaMonitor.progressPercent}% da aula percorrida`}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3.5 overflow-hidden p-0.5 border border-gray-300/60 shadow-inner relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-400/80 z-10" title="Gatilho de 50% de Presença" />
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${
                  activeLiveAulaMonitor.is50PercentReached 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                    : activeLiveAulaMonitor.isPreLive
                    ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                    : 'bg-gradient-to-r from-amber-400 to-blue-500'
                }`}
                style={{ width: `${activeLiveAulaMonitor.isPreLive ? 100 : activeLiveAulaMonitor.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Ações da Transmissão do Google Meet e Presença */}
          <div className="space-y-3 pt-1">
            {activeLiveAulaMonitor.aula.meetUrl && (
              <div className="p-3.5 bg-red-50/90 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-red-950 font-medium">
                  <span className="p-2.5 bg-red-600 text-white rounded-xl shrink-0 shadow-xs">
                    <Video className="w-4 h-4" />
                  </span>
                  <div>
                    <strong className="block text-red-900 font-extrabold text-xs sm:text-sm">
                      {activeLiveAulaMonitor.isPreLive 
                        ? 'Transmissão Oficial do Google Meet Liberada (15 min de antecedência)' 
                        : 'Transmissão Oficial do Google Meet em Andamento'}
                    </strong>
                    <span className="text-[11px] text-red-800">
                      {activeLiveAulaMonitor.isPreLive
                        ? 'Acesse a sala com antecedência para abrir a sessão, testar microfone/vídeo e acolher os alunos.'
                        : 'Clique ao lado para ingressar na sala da aula ao vivo com o docente e a turma.'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
                  <a
                    href={activeLiveAulaMonitor.aula.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2 shrink-0 active:scale-95"
                  >
                    <Video className="w-4 h-4" />
                    <span>Entrar na Aula ao Vivo (Google Meet)</span>
                  </a>
                </div>
              </div>
            )}

            {activeLiveAulaMonitor.is50PercentReached ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-950">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <strong className="block text-emerald-900 font-extrabold">Chamada Oficial Liberada (50% atingido)!</strong>
                    <span className="text-[11px] text-emerald-800">Dispare agora o link da lista de presença no chat do Google Meet para os alunos.</span>
                  </div>
                </div>

                <button
                  onClick={() => handleCopyPresenca(activeLiveAulaMonitor.aula.presencaUrl, activeLiveAulaMonitor.aula.id, activeLiveAulaMonitor.aula.title)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>📋 Copiar Chamada p/ Chat</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px] leading-relaxed">
                  <strong>Atenção:</strong> O link para registrar a presença no Google Forms será liberado automaticamente assim que atingir 50% do tempo da aula corrente.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header Principal com Estilo Moderno e Divisão de Turmas */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-8 border border-blue-900/40 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Badge de Identificação do Semestre e Turma */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Semestre 2026.2 • Equipe Oficial de Monitoria</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                {currentRole === 'monitor' ? '👑 Sua Atribuição: Turma A (7º Período)' : 'Turma A (Veteranos) & Turma B (3º Período)'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {currentRole === 'monitor' ? 'Escala de Monitoria • Turma A' : 'Escala Semanal de Monitoria'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {currentRole === 'monitor' 
                ? 'Plantões ao vivo, responsáveis por aula e links de presença da Turma A para atendimento ágil aos alunos.'
                : 'Plantões ao vivo, responsáveis por aula e links rápidos separados por turma para facilidade operacional e comunicação direta com os alunos.'}
            </p>

            {/* Fuso Horário Local Detectado do Usuário */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <div className="inline-flex items-center gap-2 bg-slate-800/90 text-blue-300 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
                <Globe className="w-4 h-4 text-blue-400 animate-pulse" />
                <span>
                  Seu Fuso Local: <strong className="text-white">{tzInfo.timeZone} ({tzInfo.gmtOffset})</strong>
                  {!tzInfo.isBRT && <span className="text-amber-300 ml-1.5 font-bold">• Horários adaptados</span>}
                </span>
              </div>
            </div>

            {/* Segmentação dos Monitores no Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
              <div className="flex items-center gap-2 bg-white/10 p-1.5 pr-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-blue-600 text-white px-2 py-1 rounded-xl">
                  Turma A
                </span>
                <div className="flex items-center -space-x-2">
                  {['Camila', 'Cristiano', 'Rosiane'].map((key) => {
                    const mon = DEFAULT_MONITORES_DATA[key];
                    const currentAvatar = getMonitorAvatar(key);
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setModalFotoMonitor(key);
                          setInputUrlFoto(currentAvatar);
                        }}
                        title={`Foto real de ${mon.name} (Turma A). Clique para alterar.`}
                        className="relative group transition hover:scale-110 z-10 cursor-pointer"
                      >
                        <img
                          src={currentAvatar}
                          alt={mon.name}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md bg-slate-800"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(mon.shortName)}&background=2563eb&color=fff&bold=true`;
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-slate-200">
                  Camila, Cristiano e Rosiane
                </span>
              </div>
            </div>
          </div>

          {/* Ações de Compartilhamento no Topo */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 min-w-[220px]">
            {activeRecordings.length > 0 && activeRecordings[0].recordedByEmail.toLowerCase().trim() !== (userEmail || '').toLowerCase().trim() ? (
              <button
                onClick={() => {
                  showToast(`🔒 A aula "${activeRecordings[0].disciplinaName}" já está sendo gravada por ${activeRecordings[0].recordedByName}.`);
                }}
                className="w-full py-2.5 px-4 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-xs rounded-2xl border border-amber-400/40 shadow transition flex items-center justify-center gap-2 cursor-pointer"
                title={`Esta aula já está sendo gravada por ${activeRecordings[0].recordedByName}`}
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>🔒 Gravando: {activeRecordings[0].recordedByName.split(' ')[0]}</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('lms_open_recorder', {
                        detail: { initialMode: 'autopilot' }
                      }));
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 border border-purple-400/40 cursor-pointer shadow-purple-950/30"
                  title="Programar para colocar a aula para iniciar, entrar na sala e encerrar automaticamente (Auto-Stop)"
                >
                  <Bot className="w-4 h-4 text-purple-200" />
                  <span>🤖 Piloto Automático (Auto-Stop)</span>
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('lms_open_recorder', {
                        detail: { initialMode: 'screen' }
                      }));
                    }
                  }}
                  className="w-full py-2 px-3 bg-red-600/80 hover:bg-red-600 active:scale-95 text-white font-bold text-xs rounded-2xl shadow transition flex items-center justify-center gap-2 border border-red-500/40 cursor-pointer"
                  title="Gravar a aba do Google Meet manualmente"
                >
                  <Video className="w-3.5 h-3.5 text-white" />
                  <span>🔴 Gravação Manual (HD)</span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                playPresenceAlarm(alarmVolume);
                showToast(`🔊 Bipe sonoro de alta potência testado (${Math.round(alarmVolume * 100)}% de volume)!`);
              }}
              className="w-full py-2 px-3 bg-amber-500/25 hover:bg-amber-500/40 active:scale-95 text-amber-200 font-black text-xs rounded-2xl border border-amber-400/40 transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              title="Testar sinal sonoro de alarme potente do monitor"
            >
              <Bell className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
              <span>🔊 Testar Bipe Sonoro (Alto)</span>
            </button>

            <button
              onClick={() => handleCopyEscalaWhatsApp(selectedTurma === 'Todos' ? 'Turma A' : selectedTurma)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 border border-emerald-500/50"
            >
              <Share2 className="w-4 h-4" />
              <span>Copiar Texto p/ WhatsApp</span>
            </button>

            <button
              onClick={() => setActiveTab(activeTab === 'compacto' ? 'grade' : 'compacto')}
              className="w-full py-2.5 px-4 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-xs rounded-2xl backdrop-blur-md transition flex items-center justify-center gap-2 border border-white/20"
            >
              <Smartphone className="w-4 h-4 text-amber-300" />
              <span>{activeTab === 'compacto' ? 'Ver Grade Expandida' : '📸 Modo Print (WhatsApp)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('compacto')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'compacto'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>📸 Resumo da Semana (Print)</span>
          </button>

          <button
            onClick={() => setActiveTab('grade')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'grade'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Grade com Links & Ações</span>
          </button>

          <button
            onClick={() => setActiveTab('equipe')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'equipe'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Equipe & Fotos Reais</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Checklist</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
              activeTab === 'checklist' ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {completedChecklistCount}/{checklist.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('trocas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'trocas'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Trocas</span>
          </button>

          <button
            onClick={() => setActiveTab('leituras')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'leituras'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📢 Leituras & Avisos</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
              activeTab === 'leituras' ? 'bg-blue-800 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {announcements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('portaria')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'portaria'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>🛡️ Portaria & Validador</span>
            <span className="text-[10px] bg-purple-900 text-purple-200 px-1.5 py-0.2 rounded-full font-black">
              Novo
            </span>
          </button>

          <button
            onClick={() => setActiveTab('materiais')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'materiais'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Materiais & Gemini</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleCopyEscalaWhatsApp(turmaPrintTab)}
            title="Copiar texto formatado da escala para colar direto no WhatsApp"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar WhatsApp</span>
          </button>

          <button
            onClick={() => setModalNovaTroca(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Solicitar Troca</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: MODO COMPACTO / CARTÃO DE PRINT COM SELETOR DE TURMA                */}
      {/* ========================================================================= */}
      {activeTab === 'compacto' && (
        <div className="space-y-4">
          {/* Seletor de Turma do Modo Print */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Escolha a Turma para o Cartão de Print:
                </span>
                <span className="text-xs text-gray-600 font-medium">
                  Gere o cartão e o texto de WhatsApp específico para cada turma.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(['Turma A', 'Turma B', 'Todos'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTurmaPrintTab(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    turmaPrintTab === t
                      ? 'bg-blue-900 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t === 'Turma A' ? 'Turma A (Veteranos - 7º)' : t === 'Turma B' ? 'Turma B (3º Período)' : 'Todas as Turmas'}
                </button>
              ))}
            </div>
          </div>

          {/* Banner explicativo de Horário Local */}
          <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-950 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                <strong>Horários Convertidos para seu Fuso:</strong> Exibindo horários locais em <strong>{tzInfo.timeZone} ({tzInfo.gmtOffset})</strong>.
                {!tzInfo.isBRT && <span className="text-blue-700 ml-1">(Horário base de Brasília entre parênteses).</span>}
              </span>
            </div>
            <button
              onClick={() => handleCopyEscalaWhatsApp(turmaPrintTab)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg whitespace-nowrap shadow-xs text-xs self-start sm:self-auto"
            >
              📋 Copiar Texto {turmaPrintTab !== 'Todos' ? `da ${turmaPrintTab}` : 'Geral'} p/ WhatsApp
            </button>
          </div>

          {/* CARTÃO OFICIAL PARA PRINT (Adaptado para a Turma Selecionada) */}
          <div 
            id="cartao-escala-print"
            className="bg-white border-2 border-slate-900 rounded-3xl overflow-hidden shadow-xl"
          >
            {/* Header do Cartão */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-amber-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-extrabold text-xl shadow-md">
                  ✝
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                    ESCALA DE MONITORIA • {turmaPrintTab === 'Turma A' ? 'TURMA A (7º PERÍODO)' : turmaPrintTab === 'Turma B' ? 'TURMA B (3º PERÍODO)' : 'TURMAS A & B'}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-amber-300 font-semibold">
                    Seminário Teológico UIECB • Semestre 2026.2 (Terça a Sexta)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span>Horário Local: {tzInfo.gmtOffset}</span>
              </div>
            </div>

            {/* Corpo da Grade - Compacto */}
            <div className="p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 bg-slate-50/50">
              {daysOrder.map((day) => {
                const classesOfDay = printEscalaClasses.filter(c => c.dayOfWeek === day);
                if (classesOfDay.length === 0) return null;

                return (
                  <div 
                    key={day} 
                    className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs space-y-2.5"
                  >
                    {/* Cabeçalho do Dia */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wide">
                          {day}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {classesOfDay.length} aulas
                      </span>
                    </div>

                    {/* Lista das aulas do dia */}
                    <div className="space-y-2">
                      {classesOfDay.map((c) => {
                        const avatar = getMonitorAvatar(c.monitor);
                        const isGravado = c.typeTag?.includes('Assíncrono');
                        const startLocal = convertBRTToLocalTime(c.startBRT);
                        const endLocal = convertBRTToLocalTime(c.endBRT);

                        return (
                          <div 
                            key={c.id}
                            className="bg-slate-50 hover:bg-blue-50/60 transition p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 font-black text-[11px] bg-blue-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                                  <Clock className="w-3 h-3" />
                                  {startLocal} – {endLocal}
                                </span>
                                {turmaPrintTab === 'Todos' && (
                                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                    c.turma === 'Turma A' ? 'bg-indigo-100 text-indigo-900' : 'bg-amber-100 text-amber-900'
                                  }`}>
                                    {c.turma}
                                  </span>
                                )}
                                {!tzInfo.isBRT && (
                                  <span className="text-[10px] font-medium text-gray-500">
                                    (BRT: {c.startBRT}–{c.endBRT})
                                  </span>
                                )}
                              </div>
                              <h4 className="font-extrabold text-xs text-slate-900 truncate mt-1">
                                {c.title}
                              </h4>
                              <p className="text-[11px] text-slate-600 truncate font-medium">
                                {c.professor}
                              </p>
                            </div>

                            {/* Foto Real e Nome do Monitor */}
                            <div className="flex-shrink-0 flex flex-col items-center justify-center pl-2 border-l border-slate-200">
                              {!isGravado ? (
                                <>
                                  <div className="relative">
                                    <img
                                      src={avatar}
                                      alt={c.monitor}
                                      referrerPolicy="no-referrer"
                                      crossOrigin="anonymous"
                                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm bg-slate-200"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.monitor)}&background=1e3a8a&color=fff&bold=true`;
                                      }}
                                    />
                                    <span className="absolute -top-1 -right-1 text-[11px]" title="Monitor(a)">
                                      👑
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-800 mt-0.5">
                                    {c.monitor}
                                  </span>
                                </>
                              ) : (
                                <div className="text-center">
                                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs">
                                    📹
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-500 mt-0.5">
                                    Gravada
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rodapé do Cartão */}
            <div className="bg-slate-900 text-slate-300 p-3 sm:p-4 text-center text-[10px] sm:text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <span>📍 Links do Google Meet e Formulários de Presença no LMS Oficial</span>
              </div>
              <span className="text-slate-400">koinonia-lms • https://koinonialms.vercel.app</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: GRADE EXPANDIDA COM LINKS, MEET E FORMULÁRIOS                      */}
      {/* ========================================================================= */}
      {activeTab === 'grade' && (
        <div className="space-y-6">
          {/* Barra de Filtros e Busca */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Filtro por Turma */}
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. {currentRole === 'monitor' ? 'Sua Turma de Monitoria:' : 'Selecionar Turma:'}</span>
                </label>
                {currentRole === 'monitor' ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-blue-900 text-white shadow-xs">
                    <span>👑 Turma A (7º Período - Veteranos)</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {(['Todos', 'Turma A', 'Turma B'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setSelectedTurma(t);
                          setSelectedMonitor('Todos');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedTurma === t
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {t === 'Todos' ? '🏫 Todas as Turmas' : t === 'Turma A' ? 'Turma A (7º Período)' : 'Turma B (3º Período)'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filtro por Monitor Dinâmico por Turma */}
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>2. Monitor ({selectedTurma}):</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableMonitoresForSelectedTurma.map((name) => (
                    <button
                      key={name}
                      onClick={() => setSelectedMonitor(name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        selectedMonitor === name
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {name !== 'Todos' && (
                        <img
                          src={getMonitorAvatar(name)}
                          alt={name}
                          referrerPolicy="no-referrer"
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      )}
                      <span>{name === 'Todos' ? '👥 Todos da Turma' : name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro por Dia da Semana */}
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dia da Semana:</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Todos', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'].map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedDay === day
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {day === 'Todos' ? 'Todos os Dias' : day.replace('-feira', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Busca Textual */}
              <div className="space-y-1.5 w-full md:w-64">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  <span>Buscar Disciplina:</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ex: Ética, NT, Missão..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Listagem dos Grupos por Dia */}
          {groupedEscala.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-xl font-bold">
                🔍
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Nenhum plantão encontrado</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Não há plantões correspondentes aos filtros selecionados.
              </p>
              <button
                onClick={() => { setSelectedTurma('Todos'); setSelectedMonitor('Todos'); setSelectedDay('Todos'); setSearchQuery(''); }}
                className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow hover:bg-blue-700 transition"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedEscala.map((group) => {
                const isToday = group.day === currentDayOfWeekName;

                return (
                  <div key={group.day} className={`space-y-4 ${isToday ? 'p-4 sm:p-5 rounded-3xl bg-blue-50/50 border-2 border-blue-500/40 shadow-sm' : ''}`}>
                    {/* Título do Dia */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-4 py-1.5 rounded-xl text-sm font-bold shadow-xs inline-flex items-center gap-2 ${
                        isToday 
                          ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white border border-blue-500/50' 
                          : 'bg-blue-950 text-white'
                      }`}>
                        <Calendar className={`w-4 h-4 ${isToday ? 'text-amber-300' : 'text-blue-400'}`} />
                        <span>{group.day}</span>
                        {isToday && (
                          <span className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full ml-1 animate-pulse">
                            📍 Aulas de Hoje
                          </span>
                        )}
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        {group.classes.length} {group.classes.length === 1 ? 'aula' : 'aulas'}
                      </span>
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-900/20 via-blue-900/10 to-transparent rounded-full min-w-[50px]" />
                    </div>

                    {/* Grid de Cards dos Plantões */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.classes.map((item) => {
                        const startLocal = convertBRTToLocalTime(item.startBRT);
                        const endLocal = convertBRTToLocalTime(item.endBRT);
                        const isCopiedPresenca = copiedLinkMap[item.id];
                        const isCopiedMeet = copiedMeetMap[item.id];
                        const avatarUrl = getMonitorAvatar(item.monitor);
                        const isGravado = item.typeTag?.includes('Assíncrono');
                        const canceladaStatus = getCanceladaStatusForItem(item);

                        return (
                          <div
                            key={item.id}
                            className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group ${
                              canceladaStatus 
                                ? 'border-red-300 bg-gradient-to-b from-red-50/30 to-white' 
                                : isToday 
                                ? 'border-blue-300 ring-2 ring-blue-500/10' 
                                : 'border-gray-200/90'
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Topo do Card: Foto Real do Monitor, Turma e Horários Locais */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  {!isGravado ? (
                                    <div className="relative">
                                      <img
                                        src={avatarUrl}
                                        alt={item.monitor}
                                        referrerPolicy="no-referrer"
                                        crossOrigin="anonymous"
                                        className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-600 shadow-sm bg-slate-200"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.monitor)}&background=1e3a8a&color=fff&bold=true`;
                                        }}
                                      />
                                      <span className="absolute -bottom-1 -right-1 bg-amber-400 text-blue-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                                        👑
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xl border border-slate-200">
                                      📹
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                        item.turma === 'Turma A' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                                      }`}>
                                        {item.turma}
                                      </span>
                                    </div>
                                    <div className="font-extrabold text-base text-slate-900 flex items-center gap-1.5 mt-0.5">
                                      <span>{item.monitor}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full text-xs font-extrabold border border-emerald-200 shadow-xs">
                                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                                    {startLocal} – {endLocal} (Local)
                                  </span>
                                  {!tzInfo.isBRT && (
                                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                                      Brasília: {item.startBRT} – {item.endBRT} BRT
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Informações da Disciplina */}
                              <div className="pt-2 border-t border-gray-100">
                                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-blue-900 transition">
                                  {item.title}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                                  {item.professor}
                                </p>
                                {item.description && (
                                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed bg-gray-50/80 p-2 rounded-xl">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Ações Rápidas (Meet, Presença e Cancelamento) */}
                            <div className="space-y-2.5 pt-3 border-t border-gray-100">
                              {item.meetUrl ? (
                                <div className="flex items-center gap-2">
                                  <a
                                    href={item.meetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex-1 py-2.5 px-3 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 ${
                                      canceladaStatus
                                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-500 border border-gray-200'
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                    }`}
                                  >
                                    <Video className="w-3.5 h-3.5" />
                                    <span>{canceladaStatus ? 'Meet (Aula Cancelada)' : 'Entrar no Meet'}</span>
                                  </a>

                                  <button
                                    onClick={() => handleCopyMeet(item.meetUrl!, item.id, item.title, item.professor)}
                                    title="Copiar link do Google Meet formatado"
                                    className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 active:scale-95"
                                  >
                                    {isCopiedMeet ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Copiado!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copiar Meet</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <div className="w-full py-2.5 px-3 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5">
                                  <span>📹 Módulo Gravado / Assíncrono</span>
                                </div>
                              )}

                              {item.presencaUrl ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleCopyPresenca(item.presencaUrl, item.id, item.title)}
                                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95 ${
                                      isCopiedPresenca
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-blue-600 hover:bg-blue-800 text-white'
                                    }`}
                                  >
                                    {isCopiedPresenca ? (
                                      <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Mensagem Copiada!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>📋 Copiar Lista de Presença</span>
                                      </>
                                    )}
                                  </button>

                                  <a
                                    href={item.presencaUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title="Abrir formulário oficial do Google Forms"
                                    className="px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 active:scale-95"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Abrir</span>
                                  </a>
                                </div>
                              ) : (
                                <button
                                  disabled
                                  className="w-full py-2 px-3 rounded-xl font-medium text-xs bg-slate-50 text-slate-400 border border-slate-200/60 cursor-not-allowed flex items-center justify-center gap-1"
                                >
                                  Sem formulário de presença ao vivo
                                </button>
                              )}

                              {/* Botão de Cancelamento / Aviso de Sem Aula */}
                              <div className="pt-2 border-t border-gray-100">
                                {canceladaStatus ? (
                                  <div className="p-3 bg-red-50/90 border border-red-200 rounded-2xl space-y-1.5">
                                    <div className="flex items-center justify-between gap-1 flex-wrap">
                                      <span className="text-[11px] font-black text-red-900 flex items-center gap-1.5">
                                        <Ban className="w-3.5 h-3.5 text-red-600" />
                                        <span>🚫 AULA CANCELADA HOJE</span>
                                      </span>
                                      <button
                                        onClick={() => handleOpenModalCancelamento(item, canceladaStatus)}
                                        className="text-[10px] font-extrabold text-red-700 hover:text-red-950 underline cursor-pointer"
                                      >
                                        Editar / Reativar
                                      </button>
                                    </div>
                                    <p className="text-[11px] text-red-950 font-medium leading-relaxed bg-white/70 p-2 rounded-xl border border-red-100">
                                      <strong>Motivo:</strong> "{canceladaStatus.motivo}"
                                    </p>
                                    <span className="text-[9px] text-red-700 block text-right font-mono">
                                      Registrado por: {canceladaStatus.autor_nome}
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleOpenModalCancelamento(item, null)}
                                    className="w-full py-2 px-3 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-700 border border-gray-200/80 hover:border-red-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                                    title="Informar aos alunos que não haverá esta aula e descrever o motivo"
                                  >
                                    <Ban className="w-3.5 h-3.5 text-red-500" />
                                    <span>Avisar: Não Haverá Aula</span>
                                  </button>
                                )}
                              </div>
                            </div>
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
      )}

      {/* ========================================================================= */}
      {/* ABA 3: EQUIPE DE MONITORES SEPARADA POR TURMA                              */}
      {/* ========================================================================= */}
      {activeTab === 'equipe' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 text-blue-900">
                  <Users className="w-5 h-5" />
                  <h2 className="text-xl font-extrabold">Corpo de Monitores Oficiais • 2026.2</h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Equipes estruturadas e separadas por turma para apoio às aulas ao vivo e coordenação pedagógica.
                </p>
              </div>

              {/* Seletor de Turma na Aba de Equipe */}
              <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl">
                {(['Todas', 'Turma A', 'Turma B'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTurmaEquipeTab(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      turmaEquipeTab === t
                        ? 'bg-blue-900 text-white shadow-xs'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t === 'Todas' ? 'Todas as Equipes' : t === 'Turma A' ? 'Turma A (Veteranos)' : 'Turma B (3º Período)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SEÇÃO TURMA A */}
          {(turmaEquipeTab === 'Todas' || turmaEquipeTab === 'Turma A') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Monitores Oficiais • Turma A (7º Período - Veteranos)
                  </h3>
                </div>
                <span className="text-xs bg-blue-100 text-blue-900 font-bold px-3 py-1 rounded-full">
                  3 Monitores Ativos
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(DEFAULT_MONITORES_DATA)
                  .filter(([_, m]) => m.turma === 'Turma A')
                  .map(([key, monitor]) => {
                    const currentAvatar = getMonitorAvatar(key);

                    return (
                      <div
                        key={key}
                        className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-5"
                      >
                        <div className="space-y-4">
                          {/* Header do Card com Foto Real Nítida */}
                          <div className="flex items-center gap-4">
                            <div className="relative group">
                              <img
                                src={currentAvatar}
                                alt={monitor.name}
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-600 shadow-md bg-slate-100"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(monitor.shortName)}&background=1e3a8a&color=fff&bold=true`;
                                }}
                              />
                              <button
                                onClick={() => {
                                  setModalFotoMonitor(key);
                                  setInputUrlFoto(currentAvatar);
                                }}
                                title="Alterar Foto Oficial"
                                className="absolute -bottom-1 -right-1 bg-slate-900 text-white p-1 rounded-full text-xs shadow hover:bg-blue-600 transition"
                              >
                                <Camera className="w-3 h-3" />
                              </button>
                            </div>
                            <div>
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${monitor.badgeBg}`}>
                                Turma A (7º Período)
                              </span>
                              <h3 className="font-extrabold text-lg text-slate-900 mt-1">{monitor.name}</h3>
                              <p className="text-xs text-gray-500 font-medium">{monitor.email}</p>
                            </div>
                          </div>

                          {/* Informações de Carga Horária e Dias */}
                          <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs">
                            <div>
                              <span className="text-gray-400 block font-medium">Dias de Atuação</span>
                              <strong className="text-slate-800">{monitor.days.length} dias/sem.</strong>
                            </div>
                            <div>
                              <span className="text-gray-400 block font-medium">Carga Semanal</span>
                              <strong className="text-blue-700">{monitor.totalWeeklyHours}</strong>
                            </div>
                          </div>

                          {/* Disciplinas sob responsabilidade */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                              Disciplinas na Turma A:
                            </label>
                            <div className="space-y-1.5">
                              {monitor.disciplinas.map((disc, idx) => (
                                <div
                                  key={idx}
                                  className="text-xs bg-blue-50/70 text-blue-900 border border-blue-100 px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5"
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                  <span>{disc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Botões de Ação para o Monitor */}
                        <div className="pt-3 border-t border-gray-100 flex gap-2">
                          <button
                            onClick={() => {
                              setModalFotoMonitor(key);
                              setInputUrlFoto(currentAvatar);
                            }}
                            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Alterar Foto</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTurma('Turma A');
                              setSelectedMonitor(key);
                              setActiveTab('grade');
                            }}
                            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                          >
                            <span>Ver Grade</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Tabela de Carga Horária - Turma A */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <Award className="w-5 h-5 text-amber-600" />
                  <h4 className="font-extrabold text-sm sm:text-base">Distribuição Semanal de Carga Horária • Turma A</h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="p-3 rounded-l-xl font-bold">Monitor(a)</th>
                        <th className="p-3 font-bold">Dias Ativos</th>
                        <th className="p-3 font-bold">Aulas / Turnos</th>
                        <th className="p-3 rounded-r-xl font-bold">Carga Semanal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <img src={getMonitorAvatar('Camila')} alt="Camila" className="w-6 h-6 rounded-full object-cover" />
                          <span>Camila</span>
                        </td>
                        <td className="p-3 text-slate-700">Terça, Quinta, Sexta</td>
                        <td className="p-3 text-slate-700">3 turnos (2 de 1h25 + 1 de 1h)</td>
                        <td className="p-3 font-bold text-blue-700">3h 50min</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <img src={getMonitorAvatar('Rosiane')} alt="Rosiane" className="w-6 h-6 rounded-full object-cover" />
                          <span>Rosiane</span>
                        </td>
                        <td className="p-3 text-slate-700">Quarta, Quinta, Sexta</td>
                        <td className="p-3 text-slate-700">3 turnos (2 de 1h25 + 1 de 1h)</td>
                        <td className="p-3 font-bold text-blue-700">3h 50min</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <img src={getMonitorAvatar('Cristiano')} alt="Cristiano" className="w-6 h-6 rounded-full object-cover" />
                          <span>Cristiano</span>
                        </td>
                        <td className="p-3 text-slate-700">Terça, Quarta</td>
                        <td className="p-3 text-slate-700">2 turnos (2 de 1h25)</td>
                        <td className="p-3 font-bold text-blue-700">2h 50min</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SEÇÃO TURMA B */}
          {(turmaEquipeTab === 'Todas' || turmaEquipeTab === 'Turma B') && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Equipe de Monitoria • Turma B (3º Período - Noturno)
                  </h3>
                </div>
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full border border-amber-200">
                  Aguardando Novos Cadastros
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card Geral da Turma B */}
                <div className="bg-white border border-amber-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-extrabold text-2xl border-2 border-amber-400 shadow-md">
                        🏫
                      </div>
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-900 border border-amber-200">
                          Turma B (3º Período)
                        </span>
                        <h4 className="font-extrabold text-lg text-slate-900 mt-1">Equipe de Monitoria da Turma B</h4>
                        <p className="text-xs text-gray-500 font-medium">ead@uiecbead.com.br</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                      Plantões de Introdução ao NT, Hermenêutica Bíblica, Discipulado, Teologia da Missão, Teologia Sistemática III, Antigo Testamento II e Liderança Cristã.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTurma('Turma B');
                      setActiveTab('grade');
                    }}
                    className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <span>Ver Grade da Turma B</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card de Recepção para Novos Monitores */}
                <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-dashed border-amber-300 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
                    📥
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">Cadastro de Novos Monitores</h4>
                    <p className="text-xs text-gray-600 max-w-sm mx-auto mt-1">
                      Envie os nomes, e-mails e matérias dos monitores da Turma B e demais turmas para que sejam imediatamente ativados com fotos oficiais e escalas individuais!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: CHECKLIST OPERACIONAL DO PLANTÃO                                    */}
      {/* ========================================================================= */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-900">
                  <CheckSquare className="w-5 h-5" />
                  <h2 className="text-xl font-extrabold">Checklist Operacional do Plantão</h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Roteiro de boas práticas para os monitores executarem antes, durante e após a transmissão ao vivo de qualquer turma.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={resetChecklist}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reiniciar Checklist</span>
                </button>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-500">Progresso do Plantão Atual:</span>
                <span className="text-blue-700">{Math.round((completedChecklistCount / checklist.length) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${(completedChecklistCount / checklist.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Lista de Itens do Checklist */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-3">
            {checklist.map((item, index) => (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  item.done
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-gray-50/60 border-gray-200/80 hover:bg-gray-100/80 text-gray-800'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition font-bold text-xs mt-0.5 ${
                    item.done
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-gray-300 bg-white text-transparent'
                  }`}
                >
                  ✓
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">Etapa {index + 1}</span>
                    {item.done && (
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                        Concluído
                      </span>
                    )}
                  </div>
                  <p className={`text-sm font-semibold mt-0.5 leading-relaxed ${item.done ? 'line-through opacity-80' : ''}`}>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 5: TROCAS DE ESCALA                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'trocas' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-900">
                  <ArrowUpDown className="w-5 h-5" />
                  <h2 className="text-xl font-extrabold">Mural de Trocas de Escala</h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Solicitações de cobertura ou substituição temporária entre os membros da equipe de monitoria da Turma A e Turma B.
                </p>
              </div>

              <button
                onClick={() => setModalNovaTroca(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Solicitação</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {trocas.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-200/80 shadow-xs space-y-2">
                <p className="text-sm font-bold text-gray-600">Nenhuma solicitação de troca registrada.</p>
              </div>
            ) : (
              trocas.map((troca) => (
                <div
                  key={troca.id}
                  className="bg-white border border-gray-200/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        troca.status === 'aprovada'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : troca.status === 'recusada'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        Status: {troca.status}
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        {troca.dataAula}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900">
                      {troca.solicitante} ➔ {troca.monitorSubstituto} ({troca.disciplina})
                    </h4>

                    <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 leading-relaxed">
                      <strong>Motivo:</strong> {troca.motivo}
                    </p>
                  </div>

                  {troca.status === 'pendente' && (
                    <button
                      onClick={() => handleAprovarTroca(troca.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprovar Troca</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 6: LEITURAS, LINKS E RECURSOS DAS AULAS (MONITOR & PROFESSOR)          */}
      {/* ========================================================================= */}
      {activeTab === 'leituras' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Leituras, Links e Recursos das Aulas</h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Cadastre artigos pré-aula, links compartilhados pelo professor no chat do Meet durante a aula ao vivo ou materiais complementares com 1 clique para WhatsApp e portal do aluno.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 w-fit">
                {announcements.filter((a) => !a.is_archived).length} {announcements.filter((a) => !a.is_archived).length === 1 ? 'Link / Leitura Ativa' : 'Links / Leituras Ativas'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Formulário de Cadastro / Edição de Link ou Leitura */}
            <form onSubmit={handleAddAvisoMonitor} className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  {editingAvisoId ? (
                    <>
                      <Edit3 className="w-4 h-4 text-amber-600" />
                      <span>Editar Leitura / Link</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-blue-600" />
                      <span>Publicar Link ou Leitura</span>
                    </>
                  )}
                </h4>

                {editingAvisoId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-xs font-bold text-gray-500 hover:text-red-600 transition flex items-center gap-1 cursor-pointer"
                  >
                    ✕ Cancelar Edição
                  </button>
                )}
              </div>

              {/* Banner de Modo de Edição */}
              {editingAvisoId && (
                <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-center justify-between gap-2 text-xs text-amber-950">
                  <span className="font-semibold">
                    Editando: <strong>{formAvisoTitle || 'Item selecionado'}</strong>
                  </span>
                </div>
              )}

              {/* Seletor de Categoria / Momento do Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Momento / Categoria do Recurso
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAvisoCategory('durante_aula')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      formAvisoCategory === 'durante_aula'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-2xs font-extrabold'
                        : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>🔴 Em Aula (Ao Vivo)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormAvisoCategory('pre_aula')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      formAvisoCategory === 'pre_aula'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs font-extrabold'
                        : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>📖 Leitura Pré-Aula</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormAvisoCategory('complementar')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      formAvisoCategory === 'complementar'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs font-extrabold'
                        : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>📌 Complementar</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Disciplina / Turma</label>
                  <select
                    value={formAvisoDisc}
                    onChange={(e) => setFormAvisoDisc(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <optgroup label="Turma A (7º Período)">
                      {ESCALA_DATA.filter(i => i.turma === 'Turma A' && !i.typeTag?.includes('Assíncrono')).map((c) => (
                        <option key={c.id} value={c.title}>
                          {c.title} ({c.dayOfWeek})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Turma B (3º Período)">
                      {ESCALA_DATA.filter(i => i.turma === 'Turma B' && !i.typeTag?.includes('Assíncrono')).map((c) => (
                        <option key={c.id} value={c.title}>
                          {c.title} ({c.dayOfWeek})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Autor / Responsável</label>
                  <input
                    type="text"
                    value={formAvisoAuthor}
                    onChange={(e) => setFormAvisoAuthor(e.target.value)}
                    placeholder="Ex: Profº Cleiton ou Cristiano (Monitor)"
                    className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título do Link / Artigo / Recurso</label>
                <input
                  type="text"
                  value={formAvisoTitle}
                  onChange={(e) => setFormAvisoTitle(e.target.value)}
                  placeholder="Ex: Slide da Apresentação, Artigo do IBGE, Vídeo Citado..."
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Link de Acesso (URL Completa)</label>
                <div className="relative">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formAvisoUrl}
                    onChange={(e) => setFormAvisoUrl(e.target.value)}
                    className="w-full p-2.5 pl-8 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data / Referência da Aula</label>
                  <input
                    type="text"
                    value={formAvisoTargetDate}
                    onChange={(e) => setFormAvisoTargetDate(e.target.value)}
                    placeholder="Ex: Aula de Quarta ou 26/08/2026"
                    className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recado / Contexto aos Alunos</label>
                  <input
                    type="text"
                    value={formAvisoMsg}
                    onChange={(e) => setFormAvisoMsg(e.target.value)}
                    placeholder="Ex: Link compartilhado pelo professor no chat..."
                    className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer ${
                  editingAvisoId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-900 hover:bg-blue-800'
                }`}
              >
                {editingAvisoId ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-blue-300" />
                    <span>{formAvisoCategory === 'durante_aula' ? 'Publicar Link da Aula Ao Vivo' : 'Publicar no LMS'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Lista de Leituras & Links Ativos e Arquivados */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Links & Leituras das Matérias</span>
                </h4>

                {/* Seletor de Aba: Ativas vs Arquivadas */}
                <div className="flex items-center bg-gray-100 p-0.5 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAnnouncementsSubTab('active')}
                    className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                      announcementsSubTab === 'active'
                        ? 'bg-white text-blue-900 shadow-2xs font-extrabold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Ativos ({announcements.filter((a) => !a.is_archived).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncementsSubTab('archived')}
                    className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                      announcementsSubTab === 'archived'
                        ? 'bg-white text-amber-900 shadow-2xs font-extrabold'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Archive className="w-3 h-3 text-amber-600" />
                    <span>Arquivados ({announcements.filter((a) => a.is_archived).length})</span>
                  </button>
                </div>
              </div>

              {(() => {
                const displayedList = announcements.filter((a) =>
                  announcementsSubTab === 'active' ? !a.is_archived : a.is_archived
                );

                if (displayedList.length === 0) {
                  return (
                    <div className="p-8 bg-slate-50/80 rounded-3xl border border-gray-200/80 text-center text-xs text-gray-500 space-y-1.5 shadow-2xs">
                      <p className="font-bold text-slate-800 text-sm">
                        {announcementsSubTab === 'active'
                          ? 'Nenhum link ou leitura ativa no momento.'
                          : 'Nenhum item arquivado.'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {announcementsSubTab === 'active'
                          ? 'Use o formulário ao lado para compartilhar um novo link ou leitura com a turma.'
                          : 'Ao arquivar um link ou leitura, ele é guardado aqui para consulta histórica.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                    {displayedList.map((av) => (
                      <div
                        key={av.id}
                        className={`p-5 rounded-3xl bg-white border shadow-2xs space-y-3 transition ${
                          editingAvisoId === av.id
                            ? 'border-2 border-amber-400 bg-amber-50/30 ring-2 ring-amber-300/40'
                            : av.is_archived
                            ? 'border-amber-200/80 bg-amber-50/20'
                            : 'border-gray-200/90 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md">
                                {av.disciplina_name}
                              </span>

                              {/* Badge de Categoria / Momento */}
                              {av.category === 'durante_aula' ? (
                                <span className="text-[10px] font-black uppercase tracking-wide bg-rose-100 text-rose-900 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                                  🔴 Em Aula (Ao Vivo)
                                </span>
                              ) : av.category === 'complementar' ? (
                                <span className="text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  📌 Complementar
                                </span>
                              ) : (
                                <span className="text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  📖 Leitura Pré-Aula
                                </span>
                              )}

                              {av.is_archived && (
                                <span className="text-[10px] font-extrabold uppercase tracking-wide bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Archive className="w-2.5 h-2.5" /> Arquivada
                                </span>
                              )}
                            </div>
                            <h5 className="font-extrabold text-base text-slate-900 mt-1">{av.title}</h5>
                            {av.message && (
                              <p className="text-xs text-slate-600 italic">"{av.message}"</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {/* Botão de Editar */}
                            <button
                              onClick={() => handleStartEditAviso(av)}
                              className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                              title="Editar este link ou leitura"
                            >
                              <Edit3 className="w-3 h-3 text-blue-600" />
                              <span>Editar</span>
                            </button>

                            {av.is_archived ? (
                              <button
                                onClick={() => handleUnarchiveAviso(av.id)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                                title="Reativar Leitura no Mural dos Alunos"
                              >
                                <RefreshCw className="w-3 h-3 text-emerald-600" />
                                <span>Reativar</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleArchiveAviso(av.id)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                                title="Mover para Arquivadas"
                              >
                                <Archive className="w-3 h-3 text-amber-600" />
                                <span>Arquivar</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteAviso(av.id)}
                              title="Excluir link definitivamente"
                              className="text-gray-400 hover:text-red-600 p-1.5 text-xs transition cursor-pointer rounded-lg hover:bg-red-50"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                          <span className="font-medium text-slate-700">Por: {av.author_name}</span>
                          <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-bold">
                            {av.target_date || 'Data da Aula'}
                          </span>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <a
                            href={av.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center justify-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Abrir Link</span>
                          </a>
                          <button
                            onClick={() => handleCopyAvisoWhatsApp(av)}
                            className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                          >
                            {copiedAvisoId === av.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-200" />
                                <span>Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar WhatsApp</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 7: MATERIAIS DE APOIO & GEMINI NOTEBOOK (NOTEBOOKLM)                  */}
      {/* ========================================================================= */}
      {activeTab === 'materiais' && (
        <div className="space-y-4">
          <SupportMaterialsHub
            currentRole={currentRole}
            userEmail={userEmail}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 8: PORTARIA VIRTUAL, VALIDADOR DE ALUNOS & DIRETRIZES DA COORDENAÇÃO  */}
      {/* ========================================================================= */}
      {activeTab === 'portaria' && (
        <div className="space-y-6">
          {/* BANNER DE CABEÇALHO */}
          <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-purple-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-400/30">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                      Plantão & Portaria Virtual
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                    Diretrizes Oficiais & Validador de Alunos
                  </h2>
                  <p className="text-xs text-purple-200/80 max-w-2xl">
                    Consulte e-mails de estudantes instantaneamente, audite pedidos de entrada na sala do Google Meet e acompanhe as diretrizes emitidas pela coordenação e direção.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setFormOcorrenciaAluno('');
                  setFormOcorrenciaEmail('');
                  setFormOcorrenciaDisciplina('');
                  setFormOcorrenciaDesc('');
                  setModalNovaOcorrencia(true);
                }}
                className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Registrar Ocorrência / Entrada</span>
              </button>
            </div>
          </div>

          {/* GRID DE DUAS COLUNAS: VALIDADOR DE ALUNOS (ESQ) & DIRETRIZES DA COORDENAÇÃO (DIR) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* COLUNA ESQUERDA: VALIDADOR INSTANTÂNEO DE ALUNOS & CONSULTA DE E-MAIL */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-purple-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                      <Search className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Validador Rápido de Estudantes
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Digite qualquer nome para ver o e-mail Google cadastrado e liberar no Meet.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full">
                    {Object.keys(INITIAL_AUTHORIZED_USERS).length} no Diretório
                  </span>
                </div>

                {/* Campo de Busca Instantânea */}
                <div className="relative">
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    placeholder="Digite o nome da aluna(o) (Ex: Adriana Cláudia, Renata, Cristian...)"
                    className="w-full bg-slate-50 border border-purple-200 text-slate-900 rounded-2xl pl-10 pr-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition shadow-2xs"
                  />
                  <Search className="w-4 h-4 text-purple-600 absolute left-3.5 top-3.5" />
                  {studentSearchTerm && (
                    <button
                      onClick={() => setStudentSearchTerm('')}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Lista de Resultados da Busca de Alunos */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {(() => {
                    const allList = Object.values(INITIAL_AUTHORIZED_USERS).filter(u => u.roles.includes('aluno'));
                    const q = studentSearchTerm.toLowerCase().trim();
                    const filtered = q
                      ? allList.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
                      : allList.slice(0, 8);

                    if (filtered.length === 0) {
                      return (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
                          <p className="text-xs font-bold text-slate-700">Nenhum aluno localizado com "{studentSearchTerm}".</p>
                          <p className="text-[11px] text-gray-500">
                            Caso seja um participante externo, aplique a <strong>Regra RULE-001</strong> (bloqueio ou contingenciamento com anotação).
                          </p>
                        </div>
                      );
                    }

                    return filtered.map((st) => (
                      <div
                        key={st.email}
                        className="p-3.5 bg-gradient-to-r from-slate-50 to-purple-50/40 rounded-2xl border border-purple-100 hover:border-purple-300 transition flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={st.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.name)}&background=6b21a8&color=fff&bold=true`}
                            alt={st.name}
                            className="w-10 h-10 rounded-xl object-cover border border-purple-200 shrink-0 bg-purple-100"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-xs text-slate-900 truncate">
                                {st.name}
                              </h4>
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200">
                                🟢 Matriculado
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-mono truncate select-all">
                              {st.email}
                            </p>
                            <span className="text-[10px] text-purple-800 font-semibold block mt-0.5">
                              {st.turmaIdx === 0 ? 'Fim de Semana (5º Período)' : st.turmaIdx === 2 ? 'Turma B (3º Período)' : 'Turma A (7º Período)'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(st.email);
                              setCopiedStudentEmail(st.email);
                              showToast(`E-mail de ${st.name} copiado!`);
                              setTimeout(() => setCopiedStudentEmail(null), 2500);
                            }}
                            title="Copiar e-mail para colar no Meet ou verificar no Google Admin"
                            className="px-2.5 py-1.5 bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            {copiedStudentEmail === st.email ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar E-mail</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              addOcorrencia({
                                data: new Date().toLocaleDateString('pt-BR'),
                                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                                monitor: 'Monitor de Plantão',
                                tipo: 'liberacao_acesso',
                                alunoNome: st.name,
                                alunoEmail: st.email,
                                disciplina: 'Aulas Ao Vivo',
                                descricao: `Acesso validado e liberado pelo monitor no plantão virtual para ${st.name}.`,
                                status: 'resolvido',
                              });
                              setOcorrenciasList(getOcorrencias());
                              showToast(`Entrada de ${st.name} registrada no diário com sucesso!`);
                            }}
                            title="Registrar liberação de entrada no diário de ocorrências"
                            className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-[11px] font-bold shadow-2xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Registrar Entrada</span>
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA: DIRETRIZES & REGRAS OFICIAIS DE ACESSO */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        Diretrizes Oficiais de Portaria & Coordenação
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        Orientações emitidas por Robert FMB e Diretora Karla no grupo oficial.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
                    {diretrizesList.length} Diretrizes
                  </span>
                </div>

                {/* Lista de Diretrizes */}
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {diretrizesList.map((dir) => (
                    <div
                      key={dir.id}
                      className={`p-4 rounded-2xl border transition space-y-2 shadow-2xs ${
                        dir.tipo === 'bloqueio'
                          ? 'bg-rose-50/60 border-rose-200'
                          : dir.tipo === 'contingencia'
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-blue-50/60 border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            dir.tipo === 'bloqueio'
                              ? 'bg-rose-600 text-white'
                              : dir.tipo === 'contingencia'
                              ? 'bg-amber-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}>
                            {dir.id} • {dir.tipo.replace('_', ' ').toUpperCase()}
                          </span>
                          {dir.escopo && (
                            <span className="text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                              {dir.escopo}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {dir.data} às {dir.timestamp}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        {dir.titulo}
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {dir.descricao}
                      </p>
                      <div className="text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                        <span>Emissor: <strong>{dir.emissor}</strong></span>
                        <span className="text-emerald-700">✓ Em Vigor</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* SEÇÃO INFERIOR: DIÁRIO DE BORDO & OCORRÊNCIAS REGISTRADAS */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Diário de Bordo & Auditoria de Ocorrências da Monitoria
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Histórico de plantão com registros de liberações de entrada, relatórios e contingenciamentos.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {ocorrenciasList.length} Registros no Livro de Plantão
              </span>
            </div>

            {/* Listagem de Ocorrências */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {ocorrenciasList.map((oc) => (
                <div
                  key={oc.id}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 hover:border-slate-300 transition shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200">
                      {oc.id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {oc.data} • {oc.timestamp}
                    </span>
                  </div>

                  {oc.alunoNome && (
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs space-y-0.5">
                      <span className="font-extrabold text-slate-900 block">
                        👤 {oc.alunoNome}
                      </span>
                      {oc.alunoEmail && (
                        <span className="text-[11px] text-slate-500 font-mono block">
                          {oc.alunoEmail}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {oc.descricao}
                  </p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Monitor: <strong>{oc.monitor}</strong></span>
                    <span className={`font-bold px-1.5 py-0.5 rounded ${
                      oc.status === 'resolvido' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {oc.status === 'resolvido' ? '✓ Resolvido' : '⏳ Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PARA REGISTRAR NOVA OCORRÊNCIA NO DIÁRIO DE BORDO                   */}
      {/* ========================================================================= */}
      {modalNovaOcorrencia && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span>Registrar Ocorrência / Entrada de Aluno</span>
              </h3>
              <button
                onClick={() => setModalNovaOcorrencia(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addOcorrencia({
                  data: new Date().toLocaleDateString('pt-BR'),
                  timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                  monitor: userEmail ? (INITIAL_AUTHORIZED_USERS[userEmail.toLowerCase()]?.name || userEmail) : 'Monitor de Plantão',
                  tipo: formOcorrenciaTipo,
                  alunoNome: formOcorrenciaAluno.trim() || undefined,
                  alunoEmail: formOcorrenciaEmail.trim() || undefined,
                  disciplina: formOcorrenciaDisciplina.trim() || undefined,
                  descricao: formOcorrenciaDesc.trim() || 'Liberação de acesso registrada pelo monitor.',
                  status: 'resolvido',
                });
                setOcorrenciasList(getOcorrencias());
                setModalNovaOcorrencia(false);
                showToast('Ocorrência registrada no Diário de Bordo com sucesso!');
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Ocorrência</label>
                <select
                  value={formOcorrenciaTipo}
                  onChange={(e) => setFormOcorrenciaTipo(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="liberacao_acesso">✅ Liberação de Acesso no Google Meet</option>
                  <option value="relatorio_diario">📋 Relatório de Plantão de Sala</option>
                  <option value="aluno_nao_identificado">⚠️ Aluno Não Identificado / Bloqueio</option>
                  <option value="problema_tecnico">🔧 Problema Técnico / Link / Áudio</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Aluno(a)</label>
                  <input
                    type="text"
                    value={formOcorrenciaAluno}
                    onChange={(e) => setFormOcorrenciaAluno(e.target.value)}
                    placeholder="Ex: Adriana Cláudia"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Cadastrado</label>
                  <input
                    type="email"
                    value={formOcorrenciaEmail}
                    onChange={(e) => setFormOcorrenciaEmail(e.target.value)}
                    placeholder="Ex: adrianaclaudia@gmail.com"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Disciplina / Aula</label>
                <input
                  type="text"
                  value={formOcorrenciaDisciplina}
                  onChange={(e) => setFormOcorrenciaDisciplina(e.target.value)}
                  placeholder="Ex: História do Congregacionalismo ou Aula Fim de Semana"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição / Detalhes</label>
                <textarea
                  value={formOcorrenciaDesc}
                  onChange={(e) => setFormOcorrenciaDesc(e.target.value)}
                  placeholder="Descreva as providências tomadas no plantão..."
                  rows={3}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalNovaOcorrencia(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-900 hover:bg-purple-800 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Salvar Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PARA EDITAR FOTO DO MONITOR (UPLOAD DIRETO OU LINK)                 */}
      {/* ========================================================================= */}
      {modalFotoMonitor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Foto Oficial de {modalFotoMonitor}</span>
              </h3>
              <button
                onClick={() => setModalFotoMonitor(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 py-2">
              <img
                src={inputUrlFoto || getMonitorAvatar(modalFotoMonitor)}
                alt="Preview"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="w-24 h-24 rounded-3xl object-cover border-4 border-blue-600 shadow-md bg-slate-100"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(modalFotoMonitor)}&background=1e3a8a&color=fff&bold=true`;
                }}
              />
              <p className="text-xs text-gray-500 text-center">
                Envie uma foto da galeria do seu celular/PC ou cole a URL direta da imagem.
              </p>

              {/* Botão de Upload de Foto do Dispositivo */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{uploadingImage ? 'Processando foto...' : 'Escolher Foto do Celular / PC'}</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Ou cole a URL da Foto:</label>
              <input
                type="url"
                value={inputUrlFoto}
                onChange={(e) => setInputUrlFoto(e.target.value)}
                placeholder="https://..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setModalFotoMonitor(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSalvarFotoCustomizada(modalFotoMonitor, inputUrlFoto)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Salvar Foto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PARA NOVA TROCA DE ESCALA                                           */}
      {/* ========================================================================= */}
      {modalNovaTroca && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-blue-600" />
                <span>Solicitar Troca de Plantão</span>
              </h3>
              <button
                onClick={() => setModalNovaTroca(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCriarTroca} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Monitor Solicitante:</label>
                  <select
                    value={formSolicitante}
                    onChange={(e) => setFormSolicitante(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <optgroup label="Turma A (Veteranos - 7º Período)">
                      <option value="Camila">Camila (Turma A)</option>
                      <option value="Cristiano">Cristiano (Turma A)</option>
                      <option value="Rosiane">Rosiane (Turma A)</option>
                    </optgroup>
                    <optgroup label="Turma B (3º Período)">
                      <option value="Monitoria Turma B">Monitoria Turma B</option>
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500">Substituto Proposto:</label>
                  <select
                    value={formSubstituto}
                    onChange={(e) => setFormSubstituto(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <optgroup label="Turma A (Veteranos - 7º Período)">
                      <option value="Cristiano">Cristiano (Turma A)</option>
                      <option value="Rosiane">Rosiane (Turma A)</option>
                      <option value="Camila">Camila (Turma A)</option>
                    </optgroup>
                    <optgroup label="Turma B (3º Período)">
                      <option value="Monitoria Turma B">Monitoria Turma B</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Disciplina:</label>
                <select
                  value={formDisciplina}
                  onChange={(e) => setFormDisciplina(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <optgroup label="Turma A (7º Período)">
                    {ESCALA_DATA.filter(i => i.turma === 'Turma A' && !i.typeTag?.includes('Assíncrono')).map((c) => (
                      <option key={c.id} value={`${c.title} (Turma A)`}>{c.title} ({c.dayOfWeek})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Turma B (3º Período)">
                    {ESCALA_DATA.filter(i => i.turma === 'Turma B' && !i.typeTag?.includes('Assíncrono')).map((c) => (
                      <option key={c.id} value={`${c.title} (Turma B)`}>{c.title} ({c.dayOfWeek})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Data do Plantão:</label>
                <input
                  type="date"
                  value={formDataAula}
                  onChange={(e) => setFormDataAula(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Motivo da Troca:</label>
                <textarea
                  value={formMotivo}
                  onChange={(e) => setFormMotivo(e.target.value)}
                  placeholder="Explique o motivo do pedido..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs min-h-[80px]"
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovaTroca(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Solicitação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PARA AVISO / CANCELAMENTO DE AULA                                   */}
      {/* ========================================================================= */}
      {modalCancelamento.isOpen && modalCancelamento.aula && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Topo do Modal */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-red-100 text-red-600 rounded-2xl">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                    {modalCancelamento.existingCancelada ? 'Gerenciar Aula Cancelada' : 'Aviso: Não Haverá Aula'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {modalCancelamento.aula.title} ({modalCancelamento.currentDataAula})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalCancelamento({ isOpen: false, aula: null, currentDataAula: '', existingCancelada: null })}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Informações da Aula */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs text-slate-700">
              <div className="flex items-center justify-between font-bold">
                <span>📖 Disciplina: {modalCancelamento.aula.title}</span>
                <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-extrabold">
                  {modalCancelamento.aula.turma}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>👨‍🏫 Docente: {modalCancelamento.aula.professor}</span>
                <span>👑 Monitor: {modalCancelamento.aula.monitor}</span>
              </div>
            </div>

            {/* Formulário de Motivo */}
            <form onSubmit={handleSalvarCancelamento} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Motivo do Cancelamento / Aviso aos Alunos:</span>
                  <span className="text-[10px] text-red-500 font-medium">*Visível a todos os alunos</span>
                </label>
                <textarea
                  value={motivoCancelamentoInput}
                  onChange={(e) => setMotivoCancelamentoInput(e.target.value)}
                  placeholder="Ex: Por motivos de saúde do professor, não teremos aula hoje. A reposição será agendada na próxima semana."
                  className="w-full bg-gray-50 border border-gray-300 rounded-2xl p-3 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-h-[90px] outline-none"
                  required
                />
              </div>

              {/* Sugestões Rápidas de 1 Clique */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                  Sugestões Rápidas (Clique para preencher):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Imprevisto de saúde do corpo docente. A aula será reposta em breve.',
                    'Feriado / Recesso institucional do Seminário Teológico.',
                    'Aula suspensa excepcionalmente hoje por motivos de força maior.',
                    'Instabilidade técnica na conexão do docente. Remarcação informada em breve.'
                  ].map((sugestao, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMotivoCancelamentoInput(sugestao)}
                      className="text-[10px] bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-xl transition text-left cursor-pointer"
                    >
                      {sugestao.substring(0, 45)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
                {modalCancelamento.existingCancelada ? (
                  <button
                    type="button"
                    onClick={handleReativarAula}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Reativar Aula (Desfazer Cancelamento)</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setModalCancelamento({ isOpen: false, aula: null, currentDataAula: '', existingCancelada: null })}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Fechar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Salvar e Avisar Alunos</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
