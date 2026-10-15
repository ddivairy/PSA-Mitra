import '@/styles/globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '@/src/context/AppContext';

export const metadata: Metadata = {
  title: 'PSA Partnership Platform | Kemitraan & Relawan PSA',
  description: 'Platform resmi manajemen kemitraan dan relawan PSA. Pendaftaran volunteer, pengajuan kemitraan baru, kolaborasi program, dan tracking aplikasi terpadu.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
