import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rho Generación — Reporte de Inversión FIP CEHTA",
  description: "Reporte ejecutivo de ejecución de capital, hitos y solicitud de desembolso.",
};

// Inline script that runs before paint — restores stored theme without flash.
const themeBootstrap = `
(function(){try{var t=localStorage.getItem('rho-theme');document.documentElement.setAttribute('data-theme', t==='dark'?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" data-theme="light">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
