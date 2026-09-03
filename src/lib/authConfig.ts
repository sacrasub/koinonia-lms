import { UserRole } from '@/types';
import { supabase } from '@/lib/supabaseClient';

export interface UserRoleMapping {
  email: string;
  name: string;
  roles: UserRole[];
  defaultRole: UserRole;
  avatarUrl?: string;
  addedAt?: string;
  turmaIdx?: number;
  periodoNum?: number;
  whatsapp?: string;
}

export interface AccessRequest {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  whatsapp?: string;
}

// Lista inicial de usuários autorizados do Seminário UIECB (Semestre 2026.2)
export const INITIAL_AUTHORIZED_USERS: Record<string, UserRoleMapping> = {
  // Criador & Administradores Principais (acesso total a todos os perfis)
  'sacrasub@gmail.com': {
    email: 'sacrasub@gmail.com',
    name: 'Cristiano Sacramento (Admin/Criador)',
    roles: ['admin', 'aluno', 'monitor', 'professor'],
    defaultRole: 'admin',
    avatarUrl: '/cristiano_sacramento.jpg',
    whatsapp: '5521981125314',
  },
  'sacrasub03@gmail.com': {
    email: 'sacrasub03@gmail.com',
    name: 'Cristiano Sacramento (Aluno Turma A)',
    roles: ['aluno'],
    defaultRole: 'aluno',
    turmaIdx: 1,
    periodoNum: 7,
    avatarUrl: '/cristiano_sacramento.jpg',
  },
  'prof.alexsandro.geografia@gmail.com': {
    email: 'prof.alexsandro.geografia@gmail.com',
    name: 'Alexsandro Silva',
    roles: ['professor', 'aluno'],
    defaultRole: 'professor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  'carlosprata905@gmail.com': {
    email: 'carlosprata905@gmail.com',
    name: 'Pr. Carlos Prata',
    roles: ['professor', 'aluno'],
    defaultRole: 'professor',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  'eliasamadorseminario@gmail.com': {
    email: 'eliasamadorseminario@gmail.com',
    name: 'Elias Amador',
    roles: ['aluno'],
    defaultRole: 'aluno',
    turmaIdx: 1,
    periodoNum: 7,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  'desbloquear854@gmail.com': {
    email: 'desbloquear854@gmail.com',
    name: 'Elizy Bessa',
    roles: ['aluno'],
    defaultRole: 'aluno',
    turmaIdx: 1,
    periodoNum: 7,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  'josiasrcosta@gmail.com': {
    email: 'josiasrcosta@gmail.com',
    name: 'Profº Josias Ribeiro (Filosofia)',
    roles: ['professor', 'aluno'],
    defaultRole: 'professor',
    turmaIdx: 1,
    periodoNum: 7,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    whatsapp: '5521964894670',
  },
  'eudoxiobalbino@gmail.com': {
    email: 'eudoxiobalbino@gmail.com',
    name: 'Eudoxio Balbino',
    roles: ['aluno'],
    defaultRole: 'aluno',
    turmaIdx: 1,
    periodoNum: 7,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  'raphaelfgalvao@gmail.com': {
    email: 'raphaelfgalvao@gmail.com',
    name: 'Raphael Galvão',
    roles: ['aluno'],
    defaultRole: 'aluno',
    turmaIdx: 1,
    periodoNum: 7,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  'thiagotecnote@gmail.com': {
    email: 'thiagotecnote@gmail.com',
    name: 'Thiago Gandra',
    roles: ['aluno'],
    defaultRole: 'aluno',
    turmaIdx: 1,
    periodoNum: 7,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    whatsapp: '5521991951971',
  },
  'paulohlima2003@gmail.com': {
    email: 'paulohlima2003@gmail.com',
    name: 'Paulo Lima',
    roles: ['aluno'],
    defaultRole: 'aluno',
    turmaIdx: 1,
    periodoNum: 7,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    whatsapp: '5561995161900',
  },
  'paulohenrique.unimb@gmail.com': {
    email: 'paulohenrique.unimb@gmail.com',
    name: 'Paulo Henrique',
    roles: ['aluno'],
    defaultRole: 'aluno',
    turmaIdx: 1,
    periodoNum: 7,
    whatsapp: '5521973677194',
  },
  'iagogarcia05@gmail.com': {
    email: 'iagogarcia05@gmail.com',
    name: 'Iago Garcia',
    roles: ['aluno'],
    defaultRole: 'aluno',
    turmaIdx: 1,
    periodoNum: 7,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  'ead@uiecbead.com.br': {
    email: 'ead@uiecbead.com.br',
    name: 'Secretaria EAD (Admin)',
    roles: ['admin', 'aluno', 'monitor', 'professor'],
    defaultRole: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  'tondedez@gmail.com': {
    email: 'tondedez@gmail.com',
    name: 'Ton de Dez (Admin UIECB)',
    roles: ['admin', 'aluno', 'monitor', 'professor'],
    defaultRole: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },

  // Professores
  'hilario.graca@catolica.edu.br': {
    email: 'hilario.graca@catolica.edu.br',
    name: 'Profº Hilário Bispo',
    roles: ['professor', 'aluno'],
    defaultRole: 'professor',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  'queiroz.aryjr@gmail.com': {
    email: 'queiroz.aryjr@gmail.com',
    name: 'Profº Ary Júnior',
    roles: ['professor', 'aluno'],
    defaultRole: 'professor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  'santosuilian093@gmail.com': {
    email: 'santosuilian093@gmail.com',
    name: 'Profº Uilian Santos',
    roles: ['professor', 'aluno'],
    defaultRole: 'professor',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  'cleitonpb@gmail.com': {
    email: 'cleitonpb@gmail.com',
    name: 'Profº Cleiton Barbirato',
    roles: ['professor', 'aluno'],
    defaultRole: 'professor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  'karolteologia@gmail.com': {
    email: 'karolteologia@gmail.com',
    name: 'Profª Karoline Evangelista',
    roles: ['professor', 'aluno'],
    defaultRole: 'professor',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  'pr.marcioleal@gmail.com': {
    email: 'pr.marcioleal@gmail.com',
    name: 'Profº Marcio Leal',
    roles: ['professor', 'aluno'],
    defaultRole: 'professor',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  'thacyto@gmail.com': {
    email: 'thacyto@gmail.com',
    name: 'Profº Thácyto Lessa',
    roles: ['professor', 'aluno'],
    defaultRole: 'professor',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  'gabriela.lealg7757@gmail.com': {
    email: 'gabriela.lealg7757@gmail.com',
    name: 'Profª Gabriela Leal',
    roles: ['professor', 'aluno'],
    defaultRole: 'professor',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },

  // ============================================================
  // EQUIPE OFICIAL DE SUPORTE E MONITORIA (COORDENAÇÃO ROBERT FMB)
  // ============================================================

  // Coordenação Geral de Suporte e Monitoria
  'robert.fmb@uiecbead.com.br': {
    email: 'robert.fmb@uiecbead.com.br',
    name: 'Robert FMB (Coordenação Geral de Monitoria)',
    roles: ['admin', 'monitor', 'aluno'],
    defaultRole: 'monitor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },

  // Monitores - Turma A (Veteranos - 7º Período)
  'camilagbalbi@gmail.com': {
    email: 'camilagbalbi@gmail.com',
    name: 'Camila Vieira (Monitora - Turma A)',
    roles: ['monitor', 'aluno'],
    defaultRole: 'monitor',
    turmaIdx: 1,
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  },
  'rosianelcs73@gmail.com': {
    email: 'rosianelcs73@gmail.com',
    name: 'Rosiane Lima (Rosi - Monitora - Turma A)',
    roles: ['monitor', 'aluno'],
    defaultRole: 'monitor',
    turmaIdx: 1,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    whatsapp: '5521993085206',
  },

  // Monitores - Turma B (3º Período)
  'andreseminariouiecb@gmail.com': {
    email: 'andreseminariouiecb@gmail.com',
    name: 'André (Monitor - Turma B)',
    roles: ['monitor', 'aluno'],
    defaultRole: 'monitor',
    turmaIdx: 2,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  'daniel.monitor@uiecbead.com.br': {
    email: 'daniel.monitor@uiecbead.com.br',
    name: 'Daniel (Monitor - Turma B)',
    roles: ['monitor', 'aluno'],
    defaultRole: 'monitor',
    turmaIdx: 2,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  'renata.monitora@uiecbead.com.br': {
    email: 'renata.monitora@uiecbead.com.br',
    name: 'Renata (Monitora Auxiliar - Turma B)',
    roles: ['monitor', 'aluno'],
    defaultRole: 'monitor',
    turmaIdx: 2,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },

  // Monitores - Turma de Fim de Semana (5º Período)
  'thiago.monitor@uiecbead.com.br': {
    email: 'thiago.monitor@uiecbead.com.br',
    name: 'Thiago (Monitor - Fim de Semana)',
    roles: ['monitor', 'aluno'],
    defaultRole: 'monitor',
    turmaIdx: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },
  'julia.monitora@uiecbead.com.br': {
    email: 'julia.monitora@uiecbead.com.br',
    name: 'Júlia (Monitora Auxiliar - Fim de Semana)',
    roles: ['monitor', 'aluno'],
    defaultRole: 'monitor',
    turmaIdx: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  'pauloroberto.monitor@uiecbead.com.br': {
    email: 'pauloroberto.monitor@uiecbead.com.br',
    name: 'Paulo Roberto (Monitor Auxiliar - Fim de Semana)',
    roles: ['monitor', 'aluno'],
    defaultRole: 'monitor',
    turmaIdx: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  },

  // Direção STC
  'karla.direcao@uiecbead.com.br': {
    email: 'karla.direcao@uiecbead.com.br',
    name: 'STC Diretora Karla DIREÇÃO',
    roles: ['admin', 'professor', 'aluno'],
    defaultRole: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },

  // Alunos Matriculados e Participantes (Semestre 2026.2)
  'adrianaclaudia@gmail.com': { email: 'adrianaclaudia@gmail.com', name: 'Adriana Cláudia', roles: ['aluno'], defaultRole: 'aluno', turmaIdx: 0, periodoNum: 5 },
  'adriana.claudia@uiecbead.com.br': { email: 'adriana.claudia@uiecbead.com.br', name: 'Adriana Cláudia', roles: ['aluno'], defaultRole: 'aluno', turmaIdx: 0, periodoNum: 5 },
  'riffocristianmision@gmail.com': { email: 'riffocristianmision@gmail.com', name: 'Cristian Riffo', roles: ['aluno'], defaultRole: 'aluno' },
  'adrielfofucho@gmail.com': { email: 'adrielfofucho@gmail.com', name: 'Adriel', roles: ['aluno'], defaultRole: 'aluno' },
  'alcimarluizdasilva3@gmail.com': { email: 'alcimarluizdasilva3@gmail.com', name: 'Alcimar Luiz da Silva', roles: ['aluno'], defaultRole: 'aluno' },
  'allemos01@gmail.com': { email: 'allemos01@gmail.com', name: 'Alex Lemos', roles: ['aluno'], defaultRole: 'aluno' },
  'andreapimentelmarianoesilvasil@gmail.com': { email: 'andreapimentelmarianoesilvasil@gmail.com', name: 'Andrea Pimentel', roles: ['aluno'], defaultRole: 'aluno' },
  'aricarlosjunior@gmail.com': { email: 'aricarlosjunior@gmail.com', name: 'Ari Carlos Júnior', roles: ['aluno'], defaultRole: 'aluno' },
  'bismarckjuniormqt@gmail.com': { email: 'bismarckjuniormqt@gmail.com', name: 'Bismarck Júnior', roles: ['aluno'], defaultRole: 'aluno' },
  'caiogracina98@gmail.com': { email: 'caiogracina98@gmail.com', name: 'Caio Gracina', roles: ['aluno'], defaultRole: 'aluno' },
  'caiosilvacllb@gmail.com': { email: 'caiosilvacllb@gmail.com', name: 'Caio Silva', roles: ['aluno'], defaultRole: 'aluno' },
  'camara.renata@gmail.com': { email: 'camara.renata@gmail.com', name: 'Renata Câmara', roles: ['aluno'], defaultRole: 'aluno' },
  'carliidasa@gmail.com': { email: 'carliidasa@gmail.com', name: 'Carlida', roles: ['aluno'], defaultRole: 'aluno' },
  'carvalholuan846@gmail.com': { email: 'carvalholuan846@gmail.com', name: 'Luan Carvalho', roles: ['aluno'], defaultRole: 'aluno' },
  'caseyestudo@gmail.com': { email: 'caseyestudo@gmail.com', name: 'Casey', roles: ['aluno'], defaultRole: 'aluno' },
  'cfcbernardo@gmail.com': { email: 'cfcbernardo@gmail.com', name: 'CFC Bernardo', roles: ['aluno'], defaultRole: 'aluno' },
  'christianbruno553@gmail.com': { email: 'christianbruno553@gmail.com', name: 'Christian Bruno', roles: ['aluno'], defaultRole: 'aluno' },
  'cksafas@gmail.com': { email: 'cksafas@gmail.com', name: 'Aluno UIECB', roles: ['aluno'], defaultRole: 'aluno' },
  'clarasaaraujo92@gmail.com': { email: 'clarasaaraujo92@gmail.com', name: 'Clara Araújo', roles: ['aluno'], defaultRole: 'aluno' },
  'claudiobarbershop602@gmail.com': { email: 'claudiobarbershop602@gmail.com', name: 'Cláudio', roles: ['aluno'], defaultRole: 'aluno' },
  'co4917463@gmail.com': { email: 'co4917463@gmail.com', name: 'Aluno UIECB', roles: ['aluno'], defaultRole: 'aluno' },
  'delamaral2021@gmail.com': { email: 'delamaral2021@gmail.com', name: 'Delamar Amaral', roles: ['aluno'], defaultRole: 'aluno' },
  'dijarioliveira12@gmail.com': { email: 'dijarioliveira12@gmail.com', name: 'Dijari Oliveira', roles: ['aluno'], defaultRole: 'aluno' },
  'dvieira.adv@gmail.com': { email: 'dvieira.adv@gmail.com', name: 'D. Vieira', roles: ['aluno'], defaultRole: 'aluno' },
  'edeildocardozo10@gmail.com': { email: 'edeildocardozo10@gmail.com', name: 'Edeildo Cardozo', roles: ['aluno'], defaultRole: 'aluno' },
  'edmundopantoja@hotmail.com': { email: 'edmundopantoja@hotmail.com', name: 'Edmundo Pantoja', roles: ['aluno'], defaultRole: 'aluno' },
  'efraimreiscorretor@gmail.com': { email: 'efraimreiscorretor@gmail.com', name: 'Efraim Reis', roles: ['aluno'], defaultRole: 'aluno' },
  'enilsonsantoslima@gmail.com': { email: 'enilsonsantoslima@gmail.com', name: 'Enilson Santos Lima', roles: ['aluno'], defaultRole: 'aluno' },
  'erikmonteirodossantos@gmail.com': { email: 'erikmonteirodossantos@gmail.com', name: 'Erik Monteiro', roles: ['aluno'], defaultRole: 'aluno' },
  'figueira.daniel28@gmail.com': { email: 'figueira.daniel28@gmail.com', name: 'Daniel Figueira', roles: ['aluno'], defaultRole: 'aluno' },
  'filipeluizglobo@gmail.com': { email: 'filipeluizglobo@gmail.com', name: 'Filipe Luiz', roles: ['aluno'], defaultRole: 'aluno' },
  'gabriel.drums0207@gmail.com': { email: 'gabriel.drums0207@gmail.com', name: 'Gabriel Drums', roles: ['aluno'], defaultRole: 'aluno' },
  'gabrielcsta2004@gmail.com': { email: 'gabrielcsta2004@gmail.com', name: 'Gabriel Costa', roles: ['aluno'], defaultRole: 'aluno' },
  'grazguimaraes@gmail.com': { email: 'grazguimaraes@gmail.com', name: 'Grazi Guimarães', roles: ['aluno'], defaultRole: 'aluno' },
  'jeffersonpensador1@gmail.com': { email: 'jeffersonpensador1@gmail.com', name: 'Jefferson Pensador', roles: ['aluno'], defaultRole: 'aluno' },
  'jns.vieira93@gmail.com': { email: 'jns.vieira93@gmail.com', name: 'JNS Vieira', roles: ['aluno'], defaultRole: 'aluno' },
  'joaoggc123@gmail.com': { email: 'joaoggc123@gmail.com', name: 'João GGC', roles: ['aluno'], defaultRole: 'aluno' },
  'joaomarcoscoelhoduarte@gmail.com': { email: 'joaomarcoscoelhoduarte@gmail.com', name: 'João Marcos Duarte', roles: ['aluno'], defaultRole: 'aluno' },
  'jorge.pgsilva@gmail.com': { email: 'jorge.pgsilva@gmail.com', name: 'Jorge Silva', roles: ['aluno'], defaultRole: 'aluno' },
  'juniorferreira545@gmail.com': { email: 'juniorferreira545@gmail.com', name: 'Júnior Ferreira', roles: ['aluno'], defaultRole: 'aluno' },
  'koka.teologia@gmail.com': { email: 'koka.teologia@gmail.com', name: 'Koka Teologia', roles: ['aluno'], defaultRole: 'aluno' },
  'lcscordeiro3@gmail.com': { email: 'lcscordeiro3@gmail.com', name: 'LCS Cordeiro', roles: ['aluno'], defaultRole: 'aluno' },
  'leandro.lc104@gmail.com': { email: 'leandro.lc104@gmail.com', name: 'Leandro LC', roles: ['aluno'], defaultRole: 'aluno' },
  'leandro.musicoxp@gmail.com': { email: 'leandro.musicoxp@gmail.com', name: 'Leandro Músico', roles: ['aluno'], defaultRole: 'aluno' },
  'leandroconceicao116@gmail.com': { email: 'leandroconceicao116@gmail.com', name: 'Leandro Conceição', roles: ['aluno'], defaultRole: 'aluno' },
  'lucasguimaraes.seven@gmail.com': { email: 'lucasguimaraes.seven@gmail.com', name: 'Lucas Guimarães', roles: ['aluno'], defaultRole: 'aluno' },
  'luxguggug@icloud.com': { email: 'luxguggug@icloud.com', name: 'Aluno UIECB', roles: ['aluno'], defaultRole: 'aluno' },
  'marcelosereno2013@gmail.com': { email: 'marcelosereno2013@gmail.com', name: 'Marcelo Sereno', roles: ['aluno'], defaultRole: 'aluno' },
  'marcusconteiro.agro@gmail.com': { email: 'marcusconteiro.agro@gmail.com', name: 'Marcus Conteiro', roles: ['aluno'], defaultRole: 'aluno' },
  'marlonluizdasilvapimentel@gmail.com': { email: 'marlonluizdasilvapimentel@gmail.com', name: 'Marlon Luiz Pimentel', roles: ['aluno'], defaultRole: 'aluno' },
  'maycolnpfarias@gmail.com': { email: 'maycolnpfarias@gmail.com', name: 'Maycol Farias', roles: ['aluno'], defaultRole: 'aluno' },
  'mpcn56@gmail.com': { email: 'mpcn56@gmail.com', name: 'MPCN', roles: ['aluno'], defaultRole: 'aluno' },
  'mroliveirarg@gmail.com': { email: 'mroliveirarg@gmail.com', name: 'M. R. Oliveira', roles: ['aluno'], defaultRole: 'aluno' },
  'murilloh096@gmail.com': { email: 'murilloh096@gmail.com', name: 'Murillo H.', roles: ['aluno'], defaultRole: 'aluno' },
  'noblurebis2@gmail.com': { email: 'noblurebis2@gmail.com', name: 'Aluno UIECB', roles: ['aluno'], defaultRole: 'aluno' },
  'paulopetinho@gmail.com': { email: 'paulopetinho@gmail.com', name: 'Paulo Petinho', roles: ['aluno'], defaultRole: 'aluno' },
  'pereiraclaudio1402@gmail.com': { email: 'pereiraclaudio1402@gmail.com', name: 'Cláudio Pereira', roles: ['aluno'], defaultRole: 'aluno' },
  'professorsergio.financas@gmail.com': { email: 'professorsergio.financas@gmail.com', name: 'Prof. Sérgio Finanças', roles: ['aluno'], defaultRole: 'aluno' },
  'rcf.radiologia@gmail.com': { email: 'rcf.radiologia@gmail.com', name: 'RCF Radiologia', roles: ['aluno'], defaultRole: 'aluno' },
  'rejanearruda1@gmail.com': { 
    email: 'rejanearruda1@gmail.com', 
    name: 'Rejane Arruda', 
    roles: ['aluno'], 
    defaultRole: 'aluno',
    turmaIdx: 1,
    periodoNum: 7,
    whatsapp: '5521971214494',
  },
  'ricoportoacu@gmail.com': { email: 'ricoportoacu@gmail.com', name: 'Rico Porto Açu', roles: ['aluno'], defaultRole: 'aluno' },
  'rmorais74@gmail.com': { 
    email: 'rmorais74@gmail.com', 
    name: 'Rodrigo Morais', 
    roles: ['aluno'], 
    defaultRole: 'aluno',
    turmaIdx: 1,
    periodoNum: 7,
    whatsapp: '5561992887093',
  },
  'simonehelena.unimb@gmail.com': {
    email: 'simonehelena.unimb@gmail.com',
    name: 'Simone Helena',
    roles: ['aluno'],
    defaultRole: 'aluno',
    turmaIdx: 1,
    periodoNum: 7,
    whatsapp: '5521998397979',
  },
  'tecio.unimb@gmail.com': {
    email: 'tecio.unimb@gmail.com',
    name: 'Técio',
    roles: ['aluno'],
    defaultRole: 'aluno',
    turmaIdx: 1,
    periodoNum: 7,
    whatsapp: '5521965953181',
  },
  'rsalatiel63@gmail.com': { email: 'rsalatiel63@gmail.com', name: 'R. Salatiel', roles: ['aluno'], defaultRole: 'aluno' },
  'rsouzast@gmail.com': { email: 'rsouzast@gmail.com', name: 'R. Souza', roles: ['aluno'], defaultRole: 'aluno' },
  'seminaristadanielrj@gmail.com': { email: 'seminaristadanielrj@gmail.com', name: 'Daniel RJ (Seminarista)', roles: ['aluno'], defaultRole: 'aluno' },
  'spiderkako@gmail.com': { email: 'spiderkako@gmail.com', name: 'Kako', roles: ['aluno'], defaultRole: 'aluno' },
  'teologiahelio@gmail.com': { email: 'teologiahelio@gmail.com', name: 'Hélio Teologia', roles: ['aluno'], defaultRole: 'aluno' },
  'uelinton21@gmail.com': { 
    email: 'uelinton21@gmail.com', 
    name: 'Uelinton Lima', 
    roles: ['aluno'], 
    defaultRole: 'aluno', 
    turmaIdx: 2, 
    periodoNum: 3,
    whatsapp: '5511999289711',
  },
  'wesleymarcos.unimb@gmail.com': {
    email: 'wesleymarcos.unimb@gmail.com',
    name: 'Wesley Marcos',
    roles: ['aluno'],
    defaultRole: 'aluno',
    turmaIdx: 1,
    periodoNum: 7,
    whatsapp: '5521999912215',
  },
  'vilsonsoares38@gmail.com': { email: 'vilsonsoares38@gmail.com', name: 'Vilson Soares', roles: ['aluno'], defaultRole: 'aluno' },
  'vivian.teologiahermom@gmail.com': { email: 'vivian.teologiahermom@gmail.com', name: 'Vivian Teologia', roles: ['aluno'], defaultRole: 'aluno' },
  'wagneraugustodossantoscosta@gmail.com': { email: 'wagneraugustodossantoscosta@gmail.com', name: 'Wagner Augusto', roles: ['aluno'], defaultRole: 'aluno' },
  'williamynecy@gmail.com': { email: 'williamynecy@gmail.com', name: 'Williamy Necy', roles: ['aluno'], defaultRole: 'aluno' },
  'wilsonncjr1@gmail.com': { email: 'wilsonncjr1@gmail.com', name: 'Wilson NC Júnior', roles: ['aluno'], defaultRole: 'aluno' },
  'zeniaguiar.alves@gmail.com': { email: 'zeniaguiar.alves@gmail.com', name: 'Zeni Aguiar Alves', roles: ['aluno'], defaultRole: 'aluno' },
};

/**
 * Decodifica o payload de um token JWT (Supabase access_token) para extrair e-mail, nome e foto
 */
export function parseJwtEmailAndUser(token: string): { email?: string; name?: string; avatar?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    const email = parsed.email || parsed.user_metadata?.email;
    const name = parsed.user_metadata?.full_name || parsed.user_metadata?.name || parsed.name || email;
    const avatar = parsed.user_metadata?.avatar_url || parsed.user_metadata?.picture || parsed.picture || '';
    return { email, name, avatar };
  } catch (e) {
    console.error('Erro ao decodificar token JWT:', e);
    return null;
  }
}

const RBAC_LAST_FETCH_KEY = 'lms_rbac_last_fetch_ts';
const RBAC_CACHE_TTL_MS = 60 * 1000; // 1 minuto de cache inteligente para refletir novos usuários rapidamente

/**
 * Busca da nuvem (Supabase) as permissões personalizadas e solicitações pendentes
 * para garantir que qualquer e-mail adicionado por um admin em outro PC/navegador
 * seja reconhecido instantaneamente por todos os dispositivos.
 */
export async function syncRbacFromCloud(force: boolean = false): Promise<void> {
  if (typeof window === 'undefined') return;

  const lastFetch = Number(localStorage.getItem(RBAC_LAST_FETCH_KEY) || 0);
  const now = Date.now();
  if (!force && now - lastFetch < RBAC_CACHE_TTL_MS) {
    return;
  }

  try {
    localStorage.setItem(RBAC_LAST_FETCH_KEY, String(Date.now()));

    // 1. Busca lista de usuários autorizados na nuvem
    const { data: usersData } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', 'system_rbac_users')
      .limit(1);

    if (usersData && usersData.length > 0 && usersData[0].file_url) {
      try {
        const parsed: Record<string, UserRoleMapping> = JSON.parse(usersData[0].file_url);
        // Merge bidirecional: preserva usuários locais que possam ter sido adicionados offline/em outro navegador
        const local = getAuthorizedUsersList();
        const mergedUsers: Record<string, UserRoleMapping> = {
          ...INITIAL_AUTHORIZED_USERS,
          ...local,
          ...parsed,
        };
        localStorage.setItem('lms_authorized_users_db', JSON.stringify(mergedUsers));

        // Se o dispositivo local tinha usuários a mais que a nuvem, envia o merge consolidado para a nuvem
        if (Object.keys(mergedUsers).length > Object.keys(parsed).length) {
          saveAuthorizedUsersList(mergedUsers);
        }
      } catch (e) {}
    }

    // 2. Busca solicitações pendentes na nuvem
    const { data: reqData } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', 'system_rbac_pending_requests')
      .limit(1);

    if (reqData && reqData.length > 0 && reqData[0].file_url) {
      try {
        const parsed: AccessRequest[] = JSON.parse(reqData[0].file_url);
        const localReqs = getPendingRequests();
        const reqMap = new Map<string, AccessRequest>();
        if (Array.isArray(parsed)) {
          parsed.forEach((r) => reqMap.set(r.email.toLowerCase().trim(), r));
        }
        localReqs.forEach((r) => {
          const norm = r.email.toLowerCase().trim();
          if (!reqMap.has(norm)) {
            reqMap.set(norm, r);
          }
        });
        const mergedReqs = Array.from(reqMap.values());
        localStorage.setItem('lms_pending_access_requests', JSON.stringify(mergedReqs));
      } catch (e) {}
    }

    // Dispara evento global para que componentes (Navbar, AdminPanel) atualizem a UI imediatamente
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_rbac_updated'));
    }
  } catch (e) {
    console.warn('[RBAC] Exceção ao ler RBAC da nuvem:', e);
  }
}

/**
 * Obtém a lista dinâmica de e-mails autorizados (sincronizado com localStorage)
 */
export function getAuthorizedUsersList(): Record<string, UserRoleMapping> {
  if (typeof window === 'undefined') {
    return INITIAL_AUTHORIZED_USERS;
  }

  try {
    const stored = localStorage.getItem('lms_authorized_users_db');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...INITIAL_AUTHORIZED_USERS, ...parsed };
    }
  } catch (e) {
    console.error('Erro ao ler lista de e-mails do localStorage:', e);
  }

  return INITIAL_AUTHORIZED_USERS;
}

/**
 * Salva a lista de e-mails autorizados no localStorage e na nuvem (Supabase)
 */
export function saveAuthorizedUsersList(users: Record<string, UserRoleMapping>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lms_authorized_users_db', JSON.stringify(users));

    (async () => {
      try {
        const payloadStr = JSON.stringify(users);
        const { data: existing } = await supabase
          .from('materiais')
          .select('id')
          .eq('title', 'system_rbac_users');

        if (existing && existing.length > 0) {
          await supabase.from('materiais').update({ file_url: payloadStr }).eq('title', 'system_rbac_users');
        } else {
          await supabase.from('materiais').insert({ title: 'system_rbac_users', file_url: payloadStr, is_native_upload: false });
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('lms_rbac_updated'));
        }
      } catch (err) {
        console.warn('[RBAC] Exceção ao salvar autorizações na nuvem:', err);
      }
    })();
  }
}

/**
 * Retorna se um e-mail está autorizados e os metadados do perfil
 */
export function getAuthorizedUserInfo(email: string): { isAuthorized: boolean; user?: UserRoleMapping } {
  if (!email) return { isAuthorized: false };
  const normalized = email.toLowerCase().trim();
  const currentList = getAuthorizedUsersList();
  const found = currentList[normalized];

  if (!found) {
    return { isAuthorized: false };
  }

  return { isAuthorized: true, user: found };
}

/**
 * Adiciona ou Atualiza um e-mail na lista de autorizados
 */
export function addOrUpdateAuthorizedUser(user: UserRoleMapping) {
  const normalized = user.email.toLowerCase().trim();
  const current = getAuthorizedUsersList();
  const updatedUser: UserRoleMapping = {
    ...(current[normalized] || {}),
    ...user,
    email: normalized,
    addedAt: user.addedAt || new Date().toLocaleDateString('pt-BR'),
  };
  current[normalized] = updatedUser;
  INITIAL_AUTHORIZED_USERS[normalized] = updatedUser;
  saveAuthorizedUsersList(current);

  // Também grava na tabela 'users'
  (async () => {
    try {
      await supabase.from('users').upsert({
        email: normalized,
        full_name: updatedUser.name,
        role: updatedUser.defaultRole,
        avatar_url: updatedUser.avatarUrl || null,
      }, { onConflict: 'email' });
    } catch (e) {}
  })();
}

/**
 * Revoga autorização de um e-mail
 */
export function removeAuthorizedUser(email: string) {
  const normalized = email.toLowerCase().trim();
  const current = getAuthorizedUsersList();
  delete current[normalized];
  saveAuthorizedUsersList(current);
}

// ==========================================
// SOLICITAÇÕES DE ACESSO PENDENTES
// ==========================================

export function getPendingRequests(): AccessRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('lms_pending_access_requests');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Erro ao ler solicitações de acesso:', e);
  }
  return [];
}

export async function savePendingRequests(requests: AccessRequest[]): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lms_pending_access_requests', JSON.stringify(requests));
  }

  try {
    const payloadStr = JSON.stringify(requests);
    const { data: existing } = await supabase
      .from('materiais')
      .select('id')
      .eq('title', 'system_rbac_pending_requests');

    if (existing && existing.length > 0) {
      await supabase.from('materiais').update({ file_url: payloadStr }).eq('title', 'system_rbac_pending_requests');
    } else {
      await supabase.from('materiais').insert({ title: 'system_rbac_pending_requests', file_url: payloadStr, is_native_upload: false });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lms_rbac_updated'));
    }
  } catch (err) {
    console.warn('[RBAC] Exceção ao salvar solicitações na nuvem:', err);
  }
}

export async function requestAccess(email: string, name?: string, avatarUrl?: string): Promise<AccessRequest> {
  const normalized = email.toLowerCase().trim();
  
  // Busca as requisições mais recentes diretamente da nuvem
  let cloudRequests: AccessRequest[] = [];
  try {
    const { data } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', 'system_rbac_pending_requests')
      .limit(1);

    if (data && data.length > 0 && data[0].file_url) {
      cloudRequests = JSON.parse(data[0].file_url);
    }
  } catch (e) {}

  const localRequests = getPendingRequests();
  const reqMap = new Map<string, AccessRequest>();
  if (Array.isArray(cloudRequests)) {
    cloudRequests.forEach((r) => reqMap.set(r.email.toLowerCase().trim(), r));
  }
  localRequests.forEach((r) => {
    const norm = r.email.toLowerCase().trim();
    if (!reqMap.has(norm)) {
      reqMap.set(norm, r);
    }
  });

  const existing = reqMap.get(normalized);
  if (existing) {
    return existing;
  }

  const newReq: AccessRequest = {
    id: `req_${Date.now()}`,
    email: normalized,
    name: name || normalized,
    avatarUrl,
    requestedAt: new Date().toLocaleString('pt-BR'),
    status: 'pending',
  };

  reqMap.set(normalized, newReq);
  const updatedList = Array.from(reqMap.values());
  await savePendingRequests(updatedList);

  // Dupla garantia: dispara também via API Route do servidor Next.js
  try {
    fetch('/api/auth/request-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalized, name, avatarUrl }),
    }).catch(() => {});
  } catch (e) {}

  return newReq;
}

export async function approveAccessRequest(requestId: string, role: UserRole = 'aluno'): Promise<void> {
  let requests = getPendingRequests();
  try {
    const { data } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', 'system_rbac_pending_requests')
      .limit(1);

    if (data && data.length > 0 && data[0].file_url) {
      requests = JSON.parse(data[0].file_url);
    }
  } catch (e) {}

  const req = requests.find((r) => r.id === requestId);

  if (req) {
    req.status = 'approved';
    const remaining = requests.filter((r) => r.id !== requestId);
    await savePendingRequests(remaining);

    // Adiciona à lista de autorizados
    addOrUpdateAuthorizedUser({
      email: req.email,
      name: req.name,
      roles: role === 'aluno' ? ['aluno'] : [role, 'aluno'],
      defaultRole: role,
      avatarUrl: req.avatarUrl,
      whatsapp: req.whatsapp,
    });
  }
}

export async function rejectAccessRequest(requestId: string): Promise<void> {
  let requests = getPendingRequests();
  try {
    const { data } = await supabase
      .from('materiais')
      .select('file_url')
      .eq('title', 'system_rbac_pending_requests')
      .limit(1);

    if (data && data.length > 0 && data[0].file_url) {
      requests = JSON.parse(data[0].file_url);
    }
  } catch (e) {}

  const remaining = requests.filter((r) => r.id !== requestId);
  await savePendingRequests(remaining);
}

/**
 * Gera os dados de e-mail de confirmação de aprovação de acesso (com links diretos para Gmail Web, WhatsApp e mailto)
 */
export function formatApprovalEmail(name: string, email: string, role: UserRole): {
  subject: string;
  body: string;
  mailtoUrl: string;
  gmailUrl: string;
  whatsappUrl: string;
} {
  const roleName = role === 'admin' ? 'Administrador(a)' : role === 'professor' ? 'Professor(a)' : role === 'monitor' ? 'Monitor(a)' : 'Aluno(a)';
  const subject = `Acesso Aprovado ao Koinonia LMS • Projeto TCC Cristiano Sacramento`;
  const body = `Olá, ${name || 'Estudante'}! ✝️

Sua solicitação de acesso ao Koinonia LMS (Plataforma Acadêmica do Seminário Teológico Koinonia) foi APROVADA com sucesso no perfil de ${roleName}!
Esta plataforma é fruto do Projeto de TCC do Seminarista Cristiano Sacramento.

🔗 Acesse a plataforma agora pelo link oficial:
https://koinonialms.vercel.app

Instruções de Acesso:
1. Acesse o link acima no seu computador ou celular.
2. Clique no botão "Continuar com Google" e selecione o seu e-mail cadastrado: ${email}.
3. Você terá acesso imediato à grade semanal de aulas, links do Google Meet, pastas virtuais do Google Drive, biblioteca digital e Caderno Cornell com inteligência artificial.

Dúvidas ou suporte? Estamos à disposição!

Atenciosamente,
Coordenação Acadêmica & Tecnologia
Koinonia LMS • Semestre 2026.2
Projeto de TCC do Seminarista Cristiano Sacramento`;

  const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const whatsappText = `Olá, ${name || 'Estudante'}! ✝️ Sua solicitação de acesso ao *Koinonia LMS* foi APROVADA com sucesso no perfil de *${roleName}*!\n\nEsta plataforma é fruto do *Projeto de TCC do Seminarista Cristiano Sacramento*.\n\n🔗 *Link Oficial de Acesso:*\nhttps://koinonialms.vercel.app\n\nBasta entrar com sua conta Google cadastrada (${email}) para ter acesso completo. Seja bem-vindo(a)!`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;

  return { subject, body, mailtoUrl, gmailUrl, whatsappUrl };
}
