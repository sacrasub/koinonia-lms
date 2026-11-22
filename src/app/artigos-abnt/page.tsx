import { Metadata } from 'next';
import { ArtigosAbntPageClient } from './ArtigosAbntPageClient';

export const metadata: Metadata = {
  title: 'Criador de Artigos Acadêmicos ABNT | Koinonia LMS • UniMB',
  description:
    'Estúdio acadêmico no padrão ABNT (NBR 6022, 14724, 10520, 6028 e 6023) para redigir, auditar, sincronizar e exportar artigos e trabalhos teológicos em Word (.docx) e PDF.',
};

export default function ArtigosAbntPage() {
  return <ArtigosAbntPageClient />;
}
