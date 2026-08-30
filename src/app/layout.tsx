import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Koinonia LMS • Plataforma Teológica',
  description: 'Plataforma Acadêmica e Seminário Teológico Koinonia LMS',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full overflow-x-hidden">
      <body className="antialiased min-h-full bg-[#F5F5F7] text-gray-900 overflow-x-hidden selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
