import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pesquisa de Campo do TCC em Teologia • UNIMB & Seminário Teológico Congregacional',
  description: 'Participe do diagnóstico acadêmico do TCC de Cristiano do Sacramento Soares (Orientador: Pr. Alexsandro Silva): "Estratégias Eficazes para o Ensino Teológico no Ambiente Virtual, Distância Transacional e Preservação da Koinonia". Questionário personalizado para alunos, professores, monitores, pastores e membros!',
  openGraph: {
    title: 'Pesquisa de Campo do TCC em Teologia • UNIMB & Seminário Teológico Congregacional',
    description: 'Diagnóstico acadêmico do TCC de Cristiano do Sacramento Soares (Orientador: Pr. Alexsandro Silva). Participe com perguntas personalizadas para seminaristas, docentes, monitores, pastores e membros!',
    url: 'https://koinonialms.vercel.app/pesquisa-tcc',
    siteName: 'Koinonia LMS - Seminário Teológico Congregacional',
    images: [
      {
        url: 'https://koinonialms.vercel.app/og-pesquisa-tcc.png',
        width: 1200,
        height: 630,
        alt: 'Koinonia LMS - Pesquisa de Campo do TCC em Teologia',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pesquisa de Campo do TCC em Teologia • UNIMB & Seminário Teológico Congregacional',
    description: 'Participe do diagnóstico acadêmico de Cristiano do Sacramento Soares sobre o Ensino Teológico Virtual e Koinonia no Koinonia LMS.',
    images: ['https://koinonialms.vercel.app/og-pesquisa-tcc.png'],
  },
};

export default function PesquisaTCCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
