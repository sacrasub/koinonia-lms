import { supabase } from '@/lib/supabaseClient';

export interface SlideItem {
  id: string;
  disciplina_id: string;
  aula_num: number;
  data_aula?: string;
  title: string;
  slide_url: string; // URL do Google Slides, PDF ou PPT no Google Drive
  notes?: string; // Tópicos e guia de estudo
  author_name?: string;
  created_at: string;
}

const STORAGE_KEY = 'lms_disciplinas_slides_v1';

export const INITIAL_SLIDES: SlideItem[] = [
  {
    id: 'slide-disc1-aula1',
    disciplina_id: 'disc-1',
    aula_num: 1,
    data_aula: '11/08/2026',
    title: 'Slides • Aula 1 • Introdução ao Congregacionalismo e Puritanismo',
    slide_url: 'https://docs.google.com/presentation/d/1exampleCongregationalismo/preview',
    notes: 'Principais tópicos: Raízes na Reforma Inglesa, Ato de Supremacia (1534), Robert Browne e o princípio de autonomia congregacional.',
    author_name: 'Profº Ary Júnior',
    created_at: '2026-08-11T20:00:00Z',
  },
  {
    id: 'slide-disc2-aula1',
    disciplina_id: 'disc-2',
    aula_num: 1,
    data_aula: '11/08/2026',
    title: 'Slides • Aula 1 • Transição da Escolástica Medieval para a Reforma',
    slide_url: 'https://docs.google.com/presentation/d/1exampleEscolastica/preview',
    notes: 'Síntese Tomista, Crise do Nominalismo (Guilherme de Ockham) e o movimento Ad Fontes do Renascimento.',
    author_name: 'Profº Hilário Bispo',
    created_at: '2026-08-11T21:00:00Z',
  },
  {
    id: 'slide-disc4-aula1',
    disciplina_id: 'disc-4',
    aula_num: 1,
    data_aula: '12/08/2026',
    title: 'Slides • Aula 1 • Fundamentos Teológicos dos Direitos Humanos',
    slide_url: 'https://docs.google.com/presentation/d/1exampleDireitosHumanos/preview',
    notes: 'Imago Dei (Gênesis 1:26-27), Dignidade da Pessoa Humana, Justiça e Cidadania Cristã no mundo contemporâneo.',
    author_name: 'Profº Cleiton Barbirato',
    created_at: '2026-08-12T20:00:00Z',
  },
];

export function getAllSlides(): SlideItem[] {
  if (typeof window === 'undefined') return INITIAL_SLIDES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SLIDES));
      return INITIAL_SLIDES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SLIDES;
  } catch (e) {
    return INITIAL_SLIDES;
  }
}

export function getSlidesForDisciplina(disciplinaId: string): SlideItem[] {
  const all = getAllSlides();
  return all.filter((s) => s.disciplina_id === disciplinaId).sort((a, b) => a.aula_num - b.aula_num);
}

export function saveSlidesList(list: SlideItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('lms_slides_updated', { detail: list }));
  } catch (e) {
    console.error('Erro ao salvar slides:', e);
  }
}

export function addSlideItem(item: Omit<SlideItem, 'id' | 'created_at'>): SlideItem {
  const current = getAllSlides();
  const newSlide: SlideItem = {
    ...item,
    id: `slide_${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  const updated = [newSlide, ...current];
  saveSlidesList(updated);
  return newSlide;
}

export function updateSlideItem(id: string, updatedFields: Partial<SlideItem>): void {
  const current = getAllSlides();
  const index = current.findIndex((s) => s.id === id);
  if (index >= 0) {
    current[index] = { ...current[index], ...updatedFields };
    saveSlidesList(current);
  }
}

export function deleteSlideItem(id: string): void {
  const current = getAllSlides();
  const filtered = current.filter((s) => s.id !== id);
  saveSlidesList(filtered);
}
