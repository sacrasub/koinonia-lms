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
  {
    id: 'slide-disc4-aula3',
    disciplina_id: 'disc-4',
    aula_num: 3,
    data_aula: '26/08/2026',
    title: 'Slides • Aula 3 • Desigualdade Social e Privilégios (Trabalho AV1)',
    slide_url: 'https://docs.google.com/presentation/d/1exampleDireitosHumanosAula3/preview',
    notes: 'Dissertação de até 1 lauda sobre desigualdade social, privilégios e a importância da igreja como agente de transformação social. Times New Roman 12, esp. 1,5. Enviar para cleitonpb@gmail.com (Assunto: "Trabalho para composição de nota") até 30/09/2026. Valor: 2,0 pontos.',
    author_name: 'Profº Cleiton Barbirato',
    created_at: '2026-08-26T20:00:00Z',
  },
  {
    id: 'slide-disc9-modular',
    disciplina_id: 'disc-9',
    aula_num: 1,
    data_aula: '07/09/2026',
    title: 'SLIDES • História e Cultura Afro-Brasileira e Indígena (UIECB)',
    slide_url: 'https://drive.google.com/file/d/1YxNvCVH0uksr63Ct-dZJ3Xcd1Zyd523S/view?usp=drive_link',
    notes: 'Apresentação visual completa em PDF (1,3 MB) elaborada pelo Profº Alexsandro para o módulo de 4 aulas (Áfricas, Diáspora, Povos Indígenas e Análise Confessional).',
    author_name: 'Profº Alexsandro',
    created_at: '2026-09-07T10:00:00Z',
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
    if (!Array.isArray(parsed)) return INITIAL_SLIDES;

    let hasChanges = false;
    const seedMap = new Map(INITIAL_SLIDES.map((s) => [s.id, s]));
    const updated = parsed.map((item: SlideItem) => {
      const seed = seedMap.get(item.id);
      if (seed && seed.slide_url !== item.slide_url) {
        hasChanges = true;
        return { ...item, slide_url: seed.slide_url };
      }
      return item;
    });

    const existingIds = new Set(updated.map((s: any) => s.id));
    const missing = INITIAL_SLIDES.filter((s) => !existingIds.has(s.id));
    if (missing.length > 0) {
      hasChanges = true;
      updated.push(...missing);
    }
    if (hasChanges) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }
    return parsed;
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
