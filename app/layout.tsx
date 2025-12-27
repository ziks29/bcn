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
        <link href="https://fonts.googleapis.com/css2?family=PT+Serif:ital,wght@0,400;0,700;1,400&family=Oswald:wght@400;600;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{
          __html: `
          /* Custom Fonts */
          @font-face {
            font-family: 'Fatal';
            src: url('/fonts/fatal.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          
          /* Font Classes */
          .font-brand {
            font-family: 'Fatal', cursive, serif;
          }
          
          .font-newspaper {
            font-family: 'Playfair Display', Georgia, serif;
            font-weight: 700;
          }
          
          .font-serif-body {
            font-family: 'PT Serif', Georgia, serif;
          }
          
          .font-headline {
            font-family: 'Oswald', 'Arial Narrow', sans-serif;
            font-weight: 600;
            text-transform: uppercase;
          }
        `}} />
      </head>
      <body className="bg-[#faf8f3] text-zinc-900">
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
