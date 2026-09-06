import { Metadata } from 'next';
import { OficinaEstudosPageClient } from './OficinaEstudosPageClient';

export const metadata: Metadata = {
  title: 'Trilha de Estudos: Laboratório de Imersão e Metacognição do TCC | Koinonia LMS',
  description: 'Espaço acadêmico para imersão em leituras densas de Teologia, Caderno Digital Cornell, Citações ABNT, Matriz Dialética e Simulador Socrático da Banca Examinadora.',
};

export default function EstudosPage() {
  return <OficinaEstudosPageClient />;
}
