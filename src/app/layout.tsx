import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notepad Pro - Evernote Style',
  description: 'Kişisel Takvim ve Notlar Uygulaması',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
