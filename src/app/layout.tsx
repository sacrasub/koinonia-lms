import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Koinonia LMS • Seminário Teológico Congregacional',
  description: 'Plataforma Integrada de Gestão da Aprendizagem do Seminário Teológico Congregacional (UNIMB / UIECB)',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
  },
  openGraph: {
    title: 'Koinonia LMS • Seminário Teológico Congregacional',
    description: 'Plataforma Integrada de Gestão da Aprendizagem do Seminário Teológico Congregacional (UNIMB / UIECB)',
    url: 'https://koinonialms.vercel.app',
    siteName: 'Koinonia LMS',
    images: [
      {
        url: 'https://koinonialms.vercel.app/logo-koinonia-lms.png',
        width: 800,
        height: 800,
        alt: 'Logo Oficial Koinonia LMS',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Koinonia LMS • Seminário Teológico Congregacional',
    description: 'Plataforma Integrada de Gestão da Aprendizagem do Seminário Teológico Congregacional',
    images: ['https://koinonialms.vercel.app/logo-koinonia-lms.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Koinonia LMS',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0071E3',
};

import { PwaInitializer } from '@/components/PwaInitializer';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full overflow-x-hidden">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('lms_theme_mode');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                if (typeof window !== 'undefined' && window.localStorage) {
                  var toPurge = [];
                  for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    if (k) {
                      var val = localStorage.getItem(k);
                      if (val && val.length > 50000) {
                        toPurge.push(k);
                      }
                    }
                  }
                  toPurge.forEach(function(k) { localStorage.removeItem(k); });
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-full bg-[#F5F5F7] dark:bg-[#090d16] text-gray-900 dark:text-slate-100 overflow-x-hidden selection:bg-blue-500 selection:text-white transition-colors duration-200">
        <PwaInitializer />
        {children}
      </body>
    </html>
  );
}
