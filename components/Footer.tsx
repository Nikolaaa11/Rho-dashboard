"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-ink-quaternary/30 mt-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <Image src="/logos/rho-icon.png" alt="Rho" width={32} height={32} />
            <div>
              <p className="font-semibold text-ink-primary">Rho Generación SpA</p>
              <p className="text-xs text-ink-tertiary">
                RUT 77.931.386-7 · Independent Power Producer y comercializador de energía
              </p>
            </div>
          </div>
          <div className="text-xs text-ink-tertiary md:text-right">
            <p>FIP CEHTA ESG · Administradora de Fondos de la Industria Sostenible S.A.</p>
            <p className="mt-1">
              Reporte para inversionistas · Datos auditables sujetos a revisión final
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
