import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'CadxStudio — AI-Powered Parametric CAD & 2D Engineering Drawings',
  description:
    'Design parametric 3D CAD models, multi-part assemblies, photorealistic studio renders, and ISO/ASME 2D engineering drawings in your browser.',
  icons: {
    icon: '/logo.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070709] text-zinc-100 selection:bg-sky-500/30 selection:text-sky-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
