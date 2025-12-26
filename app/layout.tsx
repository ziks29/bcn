import React from 'react';
import type { Metadata } from 'next';
import { Providers } from '../components/Providers';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Blaine County News | Правда Глаза Колет',
  description: 'Новости Blaine County',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=PT+Serif:ital,wght@0,400;0,700;1,400&family=UnifrakturMaguntia&family=Oswald:wght@300;400;600&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
          /* Old English font for the brand name only */
          .font-brand {
            font-family: 'UnifrakturMaguntia', cursive;
          }
          /* Classic serif for Russian headlines */
          .font-newspaper {
            font-family: 'Playfair Display', serif;
          }
          /* Readable serif for body text */
          .font-serif-body {
            font-family: 'PT Serif', serif;
          }
          /* Condensed sans for tags and UI elements */
          .font-headline {
            font-family: 'Oswald', sans-serif;
          }
        `}} />
      </head>
      <body className="bg-[#f4f1ea] text-zinc-900">
        <Providers>
          <div id="root">{children}</div>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#000000',
                border: '2px solid #000000',
                padding: '1.5rem',
                boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
