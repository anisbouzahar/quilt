import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { brandThemeCSS } from '@/lib/brand';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Quilt — A little more together.', template: '%s · Quilt' },
  description:
    'A calmer shared picture of your household’s money. Explore Quilt’s spending, budgeting, and goals concept, and follow its development.',
  applicationName: 'Quilt',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <style>{brandThemeCSS}</style>
      </head>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
