"use client";

import Image from "next/image";
import { FileText, Shield, Github, Mail } from "lucide-react";
import { dataset } from "@/lib/data";

export default function Footer() {
  const corte = dataset.metadata?.fecha_corte
    ? new Date(dataset.metadata.fecha_corte).toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";
  const totalMovs = dataset.metadata?.total_movimientos ?? 0;
  const totalOcs = dataset.metadata?.total_oc ?? 0;

  return (
    <footer className="border-t border-ink-quaternary/30 mt-20 bg-surface-secondary/40">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logos/rho-icon.png" alt="Rho" width={36} height={36} className="rounded-lg" />
              <div>
                <p className="font-semibold text-ink-primary">Rho Generación SpA</p>
                <p className="text-xs text-ink-tertiary">
                  RUT 77.931.386-7 · IPP y comercializador de energía
                </p>
              </div>
            </div>
            <p className="text-sm text-ink-secondary leading-relaxed max-w-md">
              Independent Power Producer chileno especializado en agrivoltaica y almacenamiento
              (BESS) de gran escala, en sociedad con el FIP CEHTA ESG.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-semibold mb-3">
              Documentos
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/docs/Adenda_N2_RHO_FIP_CEHTA.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-secondary hover:text-rho-dark flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Adenda N°2 (PDF)
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Nikolaaa11/Rho-dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-secondary hover:text-rho-dark flex items-center gap-1.5"
                >
                  <Github className="w-3.5 h-3.5" />
                  Repositorio
                </a>
              </li>
            </ul>
          </div>

          {/* Data Quality */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-semibold mb-3">
              Calidad del dato
            </p>
            <ul className="space-y-1.5 text-xs text-ink-secondary">
              <li className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-rho-medium" />
                <span className="mono-num">{totalMovs.toLocaleString("es-CL")}</span> transacciones
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-rho-medium" />
                <span className="mono-num">{totalOcs.toLocaleString("es-CL")}</span> órdenes de compra
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-rho-medium" />
                Cuentas: Santander + BICE
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3 h-3 text-rho-medium" />
                Corte: <span className="mono-num">{corte}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-ink-quaternary/40 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-ink-tertiary">
          <div>
            <p>
              FIP CEHTA ESG · Administradora de Fondos de la Industria Sostenible S.A. (AFIS)
            </p>
            <p className="mt-1">
              RUT 77.751.766-K · Información financiera sensible · acceso autorizado solamente
            </p>
          </div>
          <div className="md:text-right">
            <p>Reporte para inversionistas · Datos auditables sujetos a revisión final</p>
            <p className="mt-1 mono-num">
              v2.0 · Built {new Date().toLocaleDateString("es-CL", { month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
