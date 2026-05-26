"use client";

import { useMemo } from "react";
import SectionHeader from "./ui/SectionHeader";
import ChartCard from "./ui/ChartCard";
import { runAuditChecks, auditSummary, type AuditCheck, type AuditStatus } from "@/lib/audit";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, FileSearch } from "lucide-react";

const STATUS_CONFIG: Record<
  AuditStatus,
  { color: string; bg: string; border: string; label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  pass: {
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "PASS",
    Icon: CheckCircle2,
  },
  warn: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "WARN",
    Icon: AlertTriangle,
  },
  fail: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "FAIL",
    Icon: XCircle,
  },
};

export default function AuditView() {
  const checks = useMemo(() => runAuditChecks(), []);
  const summary = useMemo(() => auditSummary(checks), [checks]);

  const byCat = useMemo(() => {
    const map: Record<string, AuditCheck[]> = {};
    for (const c of checks) {
      (map[c.category] = map[c.category] || []).push(c);
    }
    return map;
  }, [checks]);

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          eyebrow="Auditoría · Health Check"
          title={`Score de integridad: ${summary.score}/100`}
          subtitle="Validación automática de cuotas, cuentas, órdenes de compra y calidad del dato. Cada item se chequea contra el libro contable agregado (Santander + BICE) y la Adenda N°2."
        />

        {/* === SCORECARD === */}
        <div className="card-elevated p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-100/30 rounded-full blur-3xl" />
          <div className="relative grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 items-center">
            <div className="flex items-center gap-5">
              <div
                className={`w-24 h-24 rounded-3xl flex items-center justify-center ${
                  summary.score >= 90
                    ? "bg-emerald-100 text-emerald-700"
                    : summary.score >= 70
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <ShieldCheck className="w-12 h-12" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-ink-tertiary">
                  Health score
                </p>
                <p className="mono-num text-5xl font-semibold tabular-nums">
                  {summary.score}
                  <span className="text-xl text-ink-tertiary font-normal">/100</span>
                </p>
                <p className="text-sm text-ink-secondary mt-1">
                  {summary.score >= 90
                    ? "Excelente integridad. Listo para due diligence."
                    : summary.score >= 70
                    ? "Operación estable con observaciones."
                    : "Requiere atención inmediata."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <ScoreBox label="Total" value={summary.total} color="text-ink-primary" />
              <ScoreBox label="Pass" value={summary.pass} color="text-emerald-700" />
              <ScoreBox label="Warn" value={summary.warn} color="text-amber-700" />
              <ScoreBox label="Fail" value={summary.fail} color="text-red-700" />
            </div>
          </div>
        </div>

        {/* === CHECKS POR CATEGORÍA === */}
        <div className="space-y-6">
          {Object.entries(byCat).map(([cat, items]) => (
            <ChartCard
              key={cat}
              icon={<FileSearch className="w-4 h-4" />}
              eyebrow={cat}
              title={`${items.length} chequeo${items.length === 1 ? "" : "s"} de ${cat.toLowerCase()}`}
              accent={cat === "Capital" ? "emerald" : cat === "Cuentas" ? "cyan" : cat === "OC" ? "violet" : "slate"}
            >
              <div className="space-y-2.5">
                {items.map((c) => (
                  <CheckRow key={c.id} check={c} />
                ))}
              </div>
            </ChartCard>
          ))}
        </div>

        {/* === FOOTER === */}
        <p className="text-xs text-ink-tertiary mt-8 text-center max-w-2xl mx-auto">
          Estos chequeos se ejecutan client-side en cada carga, sobre los datos actuales del data.json.
          Para auditoría formal, exportá CSV desde la pestaña Transacciones y validá contra el libro mayor MCG.
        </p>
      </div>
    </section>
  );
}

function ScoreBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-ink-quaternary/40 p-4 text-center bg-white">
      <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-medium mb-1">{label}</p>
      <p className={`mono-num text-3xl font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function CheckRow({ check }: { check: AuditCheck }) {
  const cfg = STATUS_CONFIG[check.status];
  const Icon = cfg.Icon;
  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-2xl border ${cfg.border} ${cfg.bg}/40 hover:${cfg.bg} transition-colors`}
    >
      <div className={`w-9 h-9 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 flex-wrap mb-1">
          <span className={`pill text-[10px] ${cfg.bg} ${cfg.color} font-bold`}>{cfg.label}</span>
          <h4 className="text-sm font-semibold text-ink-primary flex-1 min-w-0">{check.title}</h4>
          {check.metric && (
            <span className="mono-num text-xs font-semibold text-ink-secondary tabular-nums">
              {check.metric}
            </span>
          )}
        </div>
        <p className="text-sm text-ink-secondary leading-snug">{check.detail}</p>
        {check.evidence && check.evidence.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {check.evidence.map((e) => (
              <span key={e} className="pill pill-neutral text-[10px]">
                {e}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
