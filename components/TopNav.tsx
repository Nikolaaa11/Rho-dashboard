"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Command, Printer, FileText } from "lucide-react";
import CommandPalette from "./CommandPalette";
import ThemeToggle from "./ui/ThemeToggle";

export interface TabDef {
  id: string;
  label: string;
  group: string;
  description?: string;
  hotkey?: string;
}

export const TABS: TabDef[] = [
  { id: "carta", label: "Carta", group: "Resumen", description: "One-pager ejecutivo imprimible" },
  { id: "overview", label: "Resumen", group: "Resumen", description: "Vista consolidada del capital" },
  { id: "banca", label: "Banca / Directorio", group: "Resumen", description: "Vista institucional ILPA" },
  { id: "desembolsos", label: "Plan de capital", group: "Capital", description: "6 cuotas Adenda N°2" },
  { id: "proyectos", label: "Proyectos", group: "Portafolio", description: "Ficha por proyecto" },
  { id: "mapa", label: "Mapa & Gantt", group: "Portafolio", description: "Geografía + cronograma" },
  { id: "categorias", label: "Categorías", group: "Operación", description: "Estructura del gasto" },
  { id: "oc", label: "Proveedores", group: "Operación", description: "Órdenes de compra" },
  { id: "movimientos", label: "Transacciones", group: "Operación", description: "Movimientos bancarios" },
  { id: "analitica", label: "Analítica", group: "Insights", description: "Galería de visualizaciones" },
  { id: "risk", label: "Riesgos", group: "Insights", description: "Tablero de riesgos y datos" },
  { id: "esg", label: "Impacto ESG", group: "Insights", description: "Métricas de impacto" },
];

export default function TopNav({
  active,
  setActive,
}: {
  active: string;
  setActive: (v: string) => void;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Listen for Cmd/Ctrl+K to open palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((s) => !s);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-40 nav-glass no-print">
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Image
              src="/logos/rho-icon.png"
              alt="Rho"
              width={28}
              height={28}
              className="rounded-md"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-ink-primary">
                Rho Generación
              </span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-ink-tertiary">
                Reporte FIP CEHTA
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1 overflow-x-auto flex-1 justify-center max-w-[860px]">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                title={t.description}
                className={`tab ${active === t.id ? "tab-active" : "tab-inactive"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-tertiary text-ink-secondary text-xs font-medium hover:bg-ink-quaternary/40 transition-colors"
              title="Abrir paleta de comandos"
            >
              <Command className="w-3.5 h-3.5" />
              <span className="text-ink-tertiary">Buscar</span>
              <span className="kbd">⌘K</span>
            </button>
            <button
              onClick={() => window.print()}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rho-dark text-white text-xs font-medium hover:bg-ink-primary transition-colors"
              title="Imprimir reporte"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
            <a
              href="/docs/Adenda_N2_RHO_FIP_CEHTA.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-ink-secondary hover:bg-surface-tertiary transition-colors"
              title="Ver Adenda N°2 (PDF)"
            >
              <FileText className="w-3.5 h-3.5" />
              Adenda
            </a>
            <div className="lg:hidden">
              <select
                value={active}
                onChange={(e) => setActive(e.target.value)}
                className="px-3 py-2 rounded-full bg-surface-tertiary text-sm font-medium border-none focus:outline-none"
              >
                {Array.from(new Set(TABS.map((t) => t.group))).map((g) => (
                  <optgroup key={g} label={g}>
                    {TABS.filter((t) => t.group === g).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelect={(id) => {
          setActive(id);
          setPaletteOpen(false);
        }}
        tabs={TABS}
      />
    </>
  );
}
