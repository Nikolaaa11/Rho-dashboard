"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Command, Printer, FileText, Menu, X, ShieldCheck } from "lucide-react";
import CommandPalette from "./CommandPalette";
import ThemeToggle from "./ui/ThemeToggle";
import { runAuditChecks, auditSummary } from "@/lib/audit";
import { dataset } from "@/lib/data";

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
  { id: "decisiones", label: "Decisiones", group: "Resumen", description: "Action items para directorio" },
  { id: "estrategia", label: "Estrategia Capital", group: "Resumen", description: "2 situaciones críticas + escenarios" },
  { id: "desembolsos", label: "Plan de capital", group: "Capital", description: "6 cuotas Adenda N°2" },
  { id: "proyectos", label: "Proyectos", group: "Portafolio", description: "Ficha por proyecto" },
  { id: "mapa", label: "Mapa & Gantt", group: "Portafolio", description: "Geografía + cronograma" },
  { id: "categorias", label: "Categorías", group: "Operación", description: "Estructura del gasto" },
  { id: "oc", label: "Proveedores", group: "Operación", description: "Órdenes de compra" },
  { id: "movimientos", label: "Transacciones", group: "Operación", description: "Movimientos bancarios" },
  { id: "analitica", label: "Analítica", group: "Insights", description: "Galería de visualizaciones" },
  { id: "risk", label: "Riesgos", group: "Insights", description: "Tablero de riesgos y datos" },
  { id: "esg", label: "Impacto ESG", group: "Insights", description: "Métricas de impacto" },
  { id: "audit", label: "Auditoría", group: "Insights", description: "Health checks & validaciones" },
];

export default function TopNav({
  active,
  setActive,
}: {
  active: string;
  setActive: (v: string) => void;
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Listen for Cmd/Ctrl+K to open palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((s) => !s);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      <nav className="sticky top-0 z-40 nav-glass no-print">
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-2.5 flex items-center justify-between gap-3">
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
            <StaleBadge />
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
            <AuditScoreBadge onClick={() => setActive("audit")} active={active === "audit"} />
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
            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden w-9 h-9 rounded-full bg-surface-tertiary flex items-center justify-center hover:bg-ink-quaternary/40 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
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

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        active={active}
        onSelect={(id) => {
          setActive(id);
          setDrawerOpen(false);
        }}
      />
    </>
  );
}

// ============================================================================
// MOBILE DRAWER
// ============================================================================
function MobileDrawer({
  open,
  onClose,
  active,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  active: string;
  onSelect: (id: string) => void;
}) {
  if (!open) return null;
  const groups = Array.from(new Set(TABS.map((t) => t.group)));

  return (
    <div className="fixed inset-0 z-50 lg:hidden no-print" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="absolute top-0 right-0 bottom-0 w-[88%] max-w-[360px] bg-white shadow-float overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-ink-quaternary/40 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-primary">Navegación</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-tertiary">
              Rho Generación · FIP CEHTA
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-tertiary flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3">
          {groups.map((g) => (
            <div key={g} className="mb-4 last:mb-0">
              <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-ink-tertiary">
                {g}
              </p>
              <div className="space-y-0.5">
                {TABS.filter((t) => t.group === g).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelect(t.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                      active === t.id
                        ? "bg-rho-dark text-white"
                        : "hover:bg-surface-tertiary text-ink-primary"
                    }`}
                  >
                    <p className="text-sm font-medium">{t.label}</p>
                    {t.description && (
                      <p
                        className={`text-[11px] mt-0.5 ${
                          active === t.id ? "text-white/70" : "text-ink-tertiary"
                        }`}
                      >
                        {t.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="px-3 pt-4 mt-4 border-t border-ink-quaternary/40 space-y-2">
            <button
              onClick={() => {
                onClose();
                setTimeout(() => window.print(), 100);
              }}
              className="w-full btn-primary"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <a
              href="/docs/Adenda_N2_RHO_FIP_CEHTA.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-outline"
              onClick={onClose}
            >
              <FileText className="w-4 h-4" />
              Adenda N°2 (PDF)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STALE DATA BADGE
// ============================================================================
function StaleBadge() {
  const fechaCorte = dataset.metadata?.fecha_corte;
  if (!fechaCorte) return null;
  const days = Math.floor((Date.now() - new Date(fechaCorte).getTime()) / 86400000);
  const tone =
    days <= 30
      ? { color: "#059669", bg: "bg-emerald-50", border: "border-emerald-200", label: "Reciente" }
      : days <= 90
      ? { color: "#d97706", bg: "bg-amber-50", border: "border-amber-200", label: "Stale" }
      : { color: "#dc2626", bg: "bg-red-50", border: "border-red-200", label: "Muy desactualizado" };

  const fmt = new Date(fechaCorte).toLocaleDateString("es-CL", { day: "2-digit", month: "short" });

  return (
    <span
      className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${tone.bg} ${tone.border}`}
      style={{ color: tone.color }}
      title={`Corte de datos: ${fechaCorte} · ${days} días desde último update`}
    >
      <span
        className="w-1 h-1 rounded-full"
        style={{ background: tone.color }}
      />
      <span className="mono-num">{fmt}</span>
      {days > 30 && <span className="text-[9px]">· {tone.label}</span>}
    </span>
  );
}

function AuditScoreBadge({ onClick, active }: { onClick: () => void; active: boolean }) {
  const summary = auditSummary(runAuditChecks());
  const tone =
    summary.score >= 90
      ? { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" }
      : summary.score >= 70
      ? { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" }
      : { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" };
  return (
    <button
      onClick={onClick}
      title={`Health score · ${summary.pass} pass · ${summary.warn} warn · ${summary.fail} fail`}
      className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${tone.bg} ${tone.text} ${tone.border} ${
        active ? "ring-2 ring-rho-medium/40" : "hover:brightness-95"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${tone.dot} animate-pulse`} />
      <ShieldCheck className="w-3.5 h-3.5" />
      <span className="mono-num tabular-nums">{summary.score}</span>
    </button>
  );
}
