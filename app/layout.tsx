import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rho Generación — Reporte de Inversión FIP CEHTA",
  description: "Reporte ejecutivo de ejecución de capital, hitos y solicitud de desembolso.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans">{children}</body>
    </html>
  );
}
