import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LessonDossierPage } from '@/components/LessonDossierPage';
import {
  getCanonicalDisciplinaMeta,
  getGeminiAulaRecord,
  getGeminiAulasForDisciplina,
} from '@/data/geminiAulasCornell';
import { DOSSIE_AV2_2026_2 } from '@/data/dossieAv2_2026_2';
import type {
  LessonDossierData,
  LessonDossierIndexEntry,
  LessonNavSibling,
} from '@/types/lessonDossier';

const DOSSIERS_DIR = path.join(process.cwd(), 'public', 'lesson-dossiers');

function readIndexSafe(): LessonDossierIndexEntry[] {
  try {
    const idxPath = path.join(DOSSIERS_DIR, 'index.json');
    if (!fs.existsSync(idxPath)) return [];
    const raw = fs.readFileSync(idxPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadDossierSafe(disciplinaId: string, aulaNum: number): LessonDossierData | null {
  try {
    const filePath = path.join(DOSSIERS_DIR, `${disciplinaId}-aula-${aulaNum}.json`);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw) as LessonDossierData;
    }
  } catch {}

  // Fallback sintético caso acesse aula fora do pré-gerado
  const rec = getGeminiAulaRecord(disciplinaId, aulaNum);
  const meta = getCanonicalDisciplinaMeta(disciplinaId);
  if (!rec || !meta) return null;

  const dossieDisc = DOSSIE_AV2_2026_2.find((d) => d.disciplinaId === disciplinaId);
  const dossieAula = dossieDisc?.aulasUnidade2.find((a) => a.aulaNum === aulaNum);

  const moments =
    rec.topicos.length > 0
      ? rec.topicos.map((t, idx) => ({
          ordem: idx + 1,
          fase:
            idx === 0
              ? ('Abertura & Contexto' as const)
              : ('Desenvolvimento Teológico' as const),
          categoria: 'Ensino Central' as const,
          titulo: t.titulo,
          resumoCurto: t.texto,
          detalhamento: t.texto,
          pontosChave: [t.texto],
          referenciasNoBloco: [],
        }))
      : [
          {
            ordem: 1,
            fase: 'Desenvolvimento Teológico' as const,
            categoria: 'Ensino Central' as const,
            titulo: rec.theme,
            resumoCurto: rec.resumoGeral,
            detalhamento: rec.resumoGeral,
            pontosChave: [rec.resumoGeral],
            referenciasNoBloco: [],
          },
        ];

  return {
    id: `${disciplinaId}-aula-${aulaNum}`,
    disciplinaId,
    disciplinaName: meta.name,
    disciplinaShortName: meta.shortName,
    disciplinaCode: meta.code,
    professor: meta.prof,
    aulaNum,
    unidade: rec.unidade,
    dateIso: rec.dateIso,
    dateBr: rec.dateBr,
    theme: rec.theme,
    geminiUrl: rec.geminiUrl,
    videoUrl: rec.videoUrl || dossieAula?.videoUrl,
    sourceType: 'dossie',
    panorama: {
      resumoCurado: dossieAula?.resumo || rec.resumoGeral,
      sinteseGeral: rec.resumoGeral,
      mapaRapido: moments.map((m) => `${m.titulo}: ${m.resumoCurto}`),
      totalBlocos: moments.length,
    },
    linhaDoTempo: moments,
    casosEDebates: [],
    referenciasBiblicas: rec.referenciasBiblicas
      ? rec.referenciasBiblicas.split(';').map((r) => ({
          referencia: r.trim(),
          contexto: `Texto bíblico de apoio em ${meta.shortName}.`,
        }))
      : [],
    pontosDeProva: (dossieDisc?.guiaRevisao || []).slice(0, 3),
    perguntasRevisao: moments.slice(0, 4).map((m) => ({
      pergunta: `O que foi destacado sobre "${m.titulo}"?`,
      dicaResposta: m.detalhamento,
    })),
    encaminhamentos: rec.proximasEtapas,
  };
}

function getSiblingsForDisciplina(disciplinaId: string): LessonNavSibling[] {
  const index = readIndexSafe();
  const fromIdx = index.filter((e) => e.disciplinaId === disciplinaId);
  if (fromIdx.length > 0) {
    return fromIdx.map((e) => ({
      aulaNum: e.aulaNum,
      dateBr: e.dateBr,
      theme: e.theme,
      unidade: e.unidade,
      totalBlocos: e.totalBlocos,
    }));
  }

  return getGeminiAulasForDisciplina(disciplinaId).map((a) => ({
    aulaNum: a.aulaNum,
    dateBr: a.dateBr,
    theme: a.theme,
    unidade: a.unidade,
    totalBlocos: Math.max(1, a.topicos.length),
  }));
}

export async function generateStaticParams() {
  const index = readIndexSafe();
  if (index.length > 0) {
    return index.map((entry) => ({
      disciplinaId: entry.disciplinaId,
      aulaNum: String(entry.aulaNum),
    }));
  }
  return [];
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ disciplinaId: string; aulaNum: string }>;
}): Promise<Metadata> {
  const { disciplinaId, aulaNum } = await params;
  const dossier = loadDossierSafe(disciplinaId, Number(aulaNum));
  if (!dossier) {
    return { title: 'Aula não encontrada • Koinonia LMS' };
  }
  return {
    title: `${dossier.theme} • ${dossier.disciplinaShortName} | Koinonia LMS`,
    description: dossier.panorama.resumoCurado,
  };
}

export default async function AulaDetalhadaPage({
  params,
}: {
  params: Promise<{ disciplinaId: string; aulaNum: string }>;
}) {
  const { disciplinaId, aulaNum } = await params;
  const parsedNum = Number(aulaNum);
  if (!Number.isFinite(parsedNum) || parsedNum <= 0) {
    notFound();
  }

  const dossier = loadDossierSafe(disciplinaId, parsedNum);
  if (!dossier) {
    notFound();
  }

  const siblings = getSiblingsForDisciplina(disciplinaId);

  return <LessonDossierPage dossier={dossier} siblings={siblings} />;
}
