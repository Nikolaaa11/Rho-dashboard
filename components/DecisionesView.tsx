"use client";

import { useMemo } from "react";
import { fmtCLP, fmtMM, analizarCuotasAdenda, dataset } from "@/lib/data";
import { getCallStatuses, URGENCY_CONFIG } from "@/lib/calendar";
import { headlineKPIs, ocSummary, listarDevoluciones } from "@/lib/derived";
import SectionHeader from "./ui/SectionHeader";
import {
  Vote,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  CreditCard,
  Shield,
  ArrowRight,
  Calendar,
  FileSignature,
} from "lucide-react";

type Severity = "high" | "medium" | "low";

interface Decision {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: "Capital" | "Comercial" | "Operativo" | "Regulatorio";
  amount?: number;
  due?: string;
  proposedAction: string;
  whoDecides: string[];
  blocker?: string;
}

export default function DecisionesView() {
  const decisiones = useMemo(buildDecisiones, []);
  const high = decisiones.filter((d) => d.severity === "high");
  const medium = decisiones.filter((d) => d.severity === "medium");
  const low = decisiones.filter((d) => d.severity === "low");

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          eyebrow="Directorio · acción requerida"
          title="Decisiones pendientes que requieren voto o aprobación."
          subtitle="Items priorizados de mayor a menor impacto. Cada item incluye monto involucrado, acción propuesta, quién decide y bloqueador asociado."
        />

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            label="Decisiones críticas"
            count={high.length}
            color="#dc2626"
            bg="bg-red-50"
            Icon={AlertTriangle}
          />
          <SummaryCard
            label="Importantes"
            count={medium.length}
            color="#d97706"
            bg="bg-amber-50"
            Icon={Clock}
          />
          <SummaryCard
            label="Seguimiento"
            count={low.length}
            color="#0891b2"
            bg="bg-cyan-50"
            Icon={CheckCircle2}
          />
          <SummaryCard
            label="Total items"
            count={decisiones.length}
            color="#475569"
            bg="bg-slate-50"
            Icon={Vote}
          />
        </div>

        {/* Lista priorizada */}
        <div className="space-y-4">
          {decisiones.map((d, i) => (
            <DecisionCard key={d.id} d={d} idx={i} />
          ))}
        </div>

        {decisiones.length === 0 && (
          <div className="card-elevated p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-ink-primary">
              Sin decisiones pendientes
            </h3>
            <p className="text-sm text-ink-tertiary mt-1">
              Todo en orden. La próxima junta puede ser informativa.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// BUILD DECISIONES desde el dataset
// ============================================================================

function buildDecisiones(): Decision[] {
  const decisiones: Decision[] = [];
  const cuotas = analizarCuotasAdenda();
  const calls = getCallStatuses();
  const k = headlineKPIs();
  const oc = ocSummary();
  const devs = listarDevoluciones();

  // 1. Cuotas urgentes (≤30d)
  const urgentes = calls.filter((c) => c.urgency === "urgent");
  for (const c of urgentes) {
    decisiones.push({
      id: `cuota-${c.cuota.id}`,
      title: `Aprobar capital call cuota ${c.cuota.letra} (${c.cuota.label})`,
      description: `Plazo notarial ${c.cuota.plazo}. Falta ${Math.abs(c.daysToDeadline ?? 0)} días. Requerida transferencia desde fondo del FIP a la CC Rho Generación.`,
      severity: "high",
      category: "Capital",
      amount: c.cuota.monto,
      due: c.cuota.plazo,
      proposedAction: "Aprobar wire transfer en próxima junta de directorio. Comunicar a tesorería para preparación.",
      whoDecides: ["Directorio FIP CEHTA", "Tesorería AFIS"],
    });
  }

  // 2. Cuotas vencidas
  const vencidas = calls.filter((c) => c.urgency === "overdue");
  for (const c of vencidas) {
    decisiones.push({
      id: `cuota-vencida-${c.cuota.id}`,
      title: `Regularizar cuota vencida ${c.cuota.letra}`,
      description: `Plazo cumplido hace ${Math.abs(c.daysToDeadline ?? 0)} días sin pago registrado. Bloquea destrabe de líneas Sinosure/CATL.`,
      severity: "high",
      category: "Capital",
      amount: c.cuota.monto,
      due: c.cuota.plazo,
      proposedAction: "Pagar al banco antes de próxima junta o formalizar renegociación de plazo en acta.",
      whoDecides: ["Directorio FIP CEHTA"],
      blocker: "Sinosure + project finance La Ligua",
    });
  }

  // 3. Cuotas próximas (next 60d)
  const proximas = calls.filter((c) => c.urgency === "soon");
  for (const c of proximas) {
    decisiones.push({
      id: `cuota-prox-${c.cuota.id}`,
      title: `Preparar capital call cuota ${c.cuota.letra} (${c.cuota.label})`,
      description: `Vence en ${c.daysToDeadline} días (${c.cuota.plazo}). Confirmar disponibilidad en fondo del FIP y orden de transferencia.`,
      severity: "medium",
      category: "Capital",
      amount: c.cuota.monto,
      due: c.cuota.plazo,
      proposedAction: "Notificar a AFIS para preparación de fondos. Calendar visit + sign-off técnico.",
      whoDecides: ["AFIS · Tesorería"],
    });
  }

  // 4. Comerciales blocker
  decisiones.push({
    id: "ppa-la-ligua",
    title: "Cerrar PPA La Ligua (target ≥ USD 42/MWh)",
    description: "Pre-condición para project finance del BESS 90 MW. Negociación activa con Energy Asset.",
    severity: "high",
    category: "Comercial",
    proposedAction: "Mandato de negociación a equipo comercial. Definir techo y validar con asesor legal.",
    whoDecides: ["Comité de Inversiones", "Directorio Rho"],
    blocker: "Sin PPA, no hay bancabilidad del proyecto",
  });

  decisiones.push({
    id: "catl-loi",
    title: "Cierre comercial CATL (BESS La Ligua)",
    description: "LOI activo. Cierre depende de visita técnica a fábrica + confirmación equity FIP.",
    severity: "medium",
    category: "Comercial",
    proposedAction: "Programar gira a China Q3 2026. Validar con CATL la fecha de visita técnica.",
    whoDecides: ["GG Rho", "Comité de Inversiones"],
    blocker: "Visita técnica pendiente · cierre equity FIP",
  });

  // 5. Sinosure
  const cuotasPendientesTotal = cuotas.filter((c) => c.estado !== "Pagada").reduce((a, b) => a + b.monto, 0);
  if (cuotasPendientesTotal > 0) {
    decisiones.push({
      id: "sinosure",
      title: "Activar línea Sinosure + JINKO (suministro PV Panimávida)",
      description: `Condicionada a equity FIP completo. Faltan ${fmtMM(cuotasPendientesTotal)} en cuotas no pagadas.`,
      severity: "medium",
      category: "Comercial",
      amount: cuotasPendientesTotal,
      proposedAction: "Completar cuotas e/f + auditoría flash MCG + correr documentación Sinosure.",
      whoDecides: ["Directorio Rho", "Sinosure agent"],
    });
  }

  // 6. OC altas pendientes
  const ocAltas = dataset.oc
    .filter((o) => o.PorPagar > 5_000_000 && o.Pagado === 0)
    .sort((a, b) => b.PorPagar - a.PorPagar)
    .slice(0, 3);
  for (const o of ocAltas) {
    decisiones.push({
      id: `oc-${o.NumOC}`,
      title: `Aprobar pago OC ${o.NumOC} — ${o.Proveedor}`,
      description: `${o.Descripcion?.slice(0, 120) || "Sin descripción"}. Comprometido pero sin desembolso bancario.`,
      severity: "low",
      category: "Operativo",
      amount: o.PorPagar,
      proposedAction: "Validar entregables + emitir orden de pago a tesorería.",
      whoDecides: ["GG Rho", "Administración"],
    });
  }

  // 7. Devoluciones a registrar contablemente
  if (devs.length > 0) {
    const total = devs.reduce((a, d) => a + d.monto, 0);
    decisiones.push({
      id: "devs-acta",
      title: "Formalizar devoluciones en acta de directorio",
      description: `${devs.length} devoluciones recibidas por ${fmtMM(total)} (boletas de garantía). Reflejar en estados financieros y reportar a LPs.`,
      severity: "low",
      category: "Regulatorio",
      amount: total,
      proposedAction: "Anexar a acta + actualizar reporting trimestral.",
      whoDecides: ["AFIS · Reporting"],
    });
  }

  // 8. Reporting SFDR
  decisiones.push({
    id: "sfdr",
    title: "Habilitar reporting SFDR / PAI trimestral",
    description: "Precondición para acceso a fondos institucionales europeos (BID Invest, IFC, Proparco).",
    severity: "low",
    category: "Regulatorio",
    proposedAction: "Contratar consultoría ESG + definir periodicidad + asignar owner interno.",
    whoDecides: ["Directorio FIP CEHTA"],
  });

  // Sort: high → medium → low, dentro de cada nivel por amount desc
  const order: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  return decisiones.sort((a, b) => {
    const d = order[a.severity] - order[b.severity];
    if (d !== 0) return d;
    return (b.amount || 0) - (a.amount || 0);
  });
}

// ============================================================================
// CARDS
// ============================================================================

function SummaryCard({
  label,
  count,
  color,
  bg,
  Icon,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) {
  return (
    <div className={`rounded-2xl border border-ink-quaternary/40 p-4 ${bg}`}>
      <div className="flex items-center justify-between mb-1">
        <Icon className="w-4 h-4" style={{ color }} />
        <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color }}>
          {label}
        </p>
      </div>
      <p className="mono-num text-3xl font-semibold tabular-nums" style={{ color }}>
        {count}
      </p>
    </div>
  );
}

function DecisionCard({ d, idx }: { d: Decision; idx: number }) {
  const cfg = {
    high: { color: "#dc2626", bg: "bg-red-50/60", border: "border-red-200", Icon: AlertTriangle, label: "CRÍTICA" },
    medium: { color: "#d97706", bg: "bg-amber-50/60", border: "border-amber-200", Icon: Clock, label: "IMPORTANTE" },
    low: { color: "#0891b2", bg: "bg-cyan-50/60", border: "border-cyan-200", Icon: CheckCircle2, label: "SEGUIMIENTO" },
  }[d.severity];
  const Icon = cfg.Icon;

  const catIcon = {
    Capital: CreditCard,
    Comercial: TrendingUp,
    Operativo: FileSignature,
    Regulatorio: Shield,
  }[d.category];
  const CatIcon = catIcon;

  return (
    <div
      className={`card-elevated p-6 md:p-7 border-l-4 animate-fade-in`}
      style={{ borderLeftColor: cfg.color, animationDelay: `${idx * 0.04}s` }}
    >
      <div className="flex flex-col md:flex-row md:items-start gap-5">
        {/* Severity badge column */}
        <div className="flex md:flex-col items-center md:items-start gap-3 md:w-40 shrink-0">
          <div
            className={`w-12 h-12 rounded-2xl ${cfg.bg} flex items-center justify-center`}
          >
            <Icon className="w-5 h-5" style={{ color: cfg.color }} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-block w-fit"
              style={{ background: cfg.color + "20", color: cfg.color }}
            >
              {cfg.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-ink-tertiary">
              <CatIcon className="w-3 h-3" />
              {d.category}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-ink-primary mb-2">{d.title}</h3>
          <p className="text-sm text-ink-secondary leading-relaxed mb-3">{d.description}</p>

          <div className="bg-white/60 rounded-xl p-3 border border-ink-quaternary/40 mb-3">
            <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-semibold mb-1">
              Acción propuesta
            </p>
            <p className="text-sm text-ink-primary leading-snug flex items-start gap-2">
              <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: cfg.color }} />
              {d.proposedAction}
            </p>
          </div>

          {d.blocker && (
            <div className="flex items-start gap-2 mb-3 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 mt-0.5 shrink-0" />
              <span className="text-red-700">
                <strong>Bloquea:</strong> {d.blocker}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-ink-tertiary uppercase tracking-wider font-semibold">
              Decide:
            </span>
            {d.whoDecides.map((w, i) => (
              <span key={i} className="pill pill-neutral">
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* Monto + plazo */}
        {(d.amount || d.due) && (
          <div className="md:text-right shrink-0 md:w-48 md:border-l md:border-ink-quaternary/40 md:pl-5">
            {d.amount != null && (
              <>
                <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-semibold">
                  Monto
                </p>
                <p className="mono-num text-2xl font-semibold tabular-nums">
                  {fmtCLP(d.amount, { compact: true })}
                </p>
              </>
            )}
            {d.due && (
              <div className="mt-2 flex md:justify-end items-center gap-1.5 text-xs text-ink-tertiary">
                <Calendar className="w-3 h-3" />
                <span>Plazo {d.due}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
