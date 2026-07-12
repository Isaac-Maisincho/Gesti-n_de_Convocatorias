import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Convocatorias de Notas Conceptuales',
  description: 'Sistema institucional para la gestión de convocatorias de notas conceptuales y vinculación social.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Set unique IDs and SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#090d16" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>
        {children}
      </body>
    </html>
  );
}
