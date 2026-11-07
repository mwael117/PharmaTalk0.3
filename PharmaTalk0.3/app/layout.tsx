import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Most Common Drugs Monograph Database',
  description: 'Gated clinical reference database for medical professionals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 antialiased">{children}</body>
    </html>
  );
}