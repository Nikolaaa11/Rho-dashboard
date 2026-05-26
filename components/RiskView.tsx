"use client";

import { useMemo } from "react";
import { fmtCLP, fmtMM, analizarCuotasAdenda, dataset } from "@/lib/data";
import { getRiskSurface, headlineKPIs, ocSummary, dataQuality } from "@/lib/derived";
import SectionHeader from "./ui/SectionHeader";
import ChartCard from "./ui/ChartCard";
import {
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Info,
  Activity,
  CheckCircle2,
  Clock,
  TrendingDown,
  Database,
  Calendar,
} from "lucide-react";

const SEVERITY_CONFIG = {
  high: {
    label: "Crítico",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    pill: "bg-red-100 text-red-700",
    dot: "bg-red-500",
    icon: AlertTriangle,
  },
  medium: {
    label: "Atención",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    pill: "bg-amber-100 text-amber-800",
    dot: "bg-amber-500",
    icon: AlertCircle,
  },
  low: {
    label: "Seguimiento",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    pill: "bg-sky-100 text-sky-800",
    dot: "bg-sky-500",
    icon: Info,
  },
} as const;

const CATEGORY_COLOR: Record<string, string> = {
  Financiero: "#3C8B3C",
  Operativo: "#06b6d4",
  Regulatorio: "#8b5cf6",
  Comercial: "#f59e0b",
};

export default function RiskView() {
  const risks = useMemo(() => getRiskSurface(), []);
  const k = headlineKPIs();
  const cuotas = analizarCuotasAdenda();
  const oc = ocSummary();
  const dq = dataQuality();

  const counts = {
    high: risks.filter((r) => r.severity === "high").length,
    medium: risks.filter((r) => r.severity === "medium").length,
    low: risks.filter((r) => r.severity === "low").length,
  };

  const score = computeHealthScore(k, oc, dq);

  return (
    <section className="py-12 md:py-20">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          eyebrow="Risk dashboard"
          title="Lo que hay que vigilar. Lo que hay que decidir."
          subtitle="Tablero de riesgos y dependencias críticas del FIP CEHTA. Cada item tiene severidad, monto involucrado y acción recomendada."
        />

        {/* === HEALTH SCORE + CONTADORES === */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_2fr] gap-6 mb-8">
          <ChartCard
            icon={<ShieldCheck className="w-4 h-4" />}
            eyebrow="Salud operativa global"
            title={`${score.value}/100`}
            subtitle={score.label}
            accent={score.value >= 80 ? "emerald" : score.value >= 60 ? "amber" : "rose"}
          >
            <HealthMeter score={score.value} />
            <div className="grid grid-cols-3 gap-3 mt-5">
              <ScoreFacet
                label="Capital"
                pct={Math.min(100, k.pctPagado)}
                color="#3C8B3C"
                detail={`${k.pctPagado.toFixed(0)}% pagado`}
              />
              <ScoreFacet
                label="OC"
                pct={Math.min(100, oc.pctPagado)}
                color="#06b6d4"
                detail={`${oc.pctPagado.toFixed(0)}% pagadas`}
              />
              <ScoreFacet
                label="Datos"
                pct={dq.pctClasificados}
                color="#8b5cf6"
                detail={`${dq.pctClasificados.toFixed(0)}% clasificado`}
              />
            </div>
          </ChartCard>

          <ChartCard
            icon={<Activity className="w-4 h-4" />}
            eyebrow="Distribución de riesgos activos"
            title="Mapa de severidad"
            subtitle="Riesgos identificados y priorizados por impacto potencial sobre la operación del fondo."
            accent="amber"
          >
            <div className="grid grid-cols-3 gap-3 mb-4">
              <SeverityBox severity="high" count={counts.high} />
              <SeverityBox severity="medium" count={counts.medium} />
              <SeverityBox severity="low" count={counts.low} />
            </div>
            <CategoryMix risks={risks} />
          </ChartCard>
        </div>

        {/* === LISTA DE RIESGOS === */}
        <ChartCard
          icon={<AlertTriangle className="w-4 h-4" />}
          eyebrow="Riesgos priorizados"
          title="Items para directorio y comité de inversión"
          subtitle="Ordenados de mayor a menor severidad. Cada uno con monto, categoría y acción sugerida cuando aplica."
          accent="rose"
        >
          <div className="space-y-3">
            {risks.map((r) => (
              <RiskRow key={r.id} risk={r} />
            ))}
          </div>
        </ChartCard>

        {/* === LINEA DE TIEMPO DE CUOTAS === */}
        <div className="mt-6">
          <ChartCard
            icon={<Calendar className="w-4 h-4" />}
            eyebrow="Calendario de capital"
            title="Las 6 cuotas en línea temporal"
            subtitle="Vista cronológica de cada cuota Adenda N°2 con su estado actual."
            accent="rho"
          >
            <CuotasTimeline />
          </ChartCard>
        </div>

        {/* === DATA QUALITY === */}
        <div className="mt-6">
          <ChartCard
            icon={<Database className="w-4 h-4" />}
            eyebrow="Calidad del dato"
            title="Lo que respalda este reporte"
            subtitle="Estado del clasificador contable: % de transacciones con categoría, centro de negocios e hito asignado."
            accent="violet"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <DqStat
                label="Movimientos totales"
                value={dq.totalMovs.toLocaleString("es-CL")}
                sub={`Datos al ${dq.fechaCorte}`}
              />
              <DqStat
                label="Clasificación general"
                value={`${dq.pctClasificados.toFixed(1)}%`}
                sub={`${dq.clasificados} / ${dq.totalMovs} con categoría`}
                pct={dq.pctClasificados}
              />
              <DqStat
                label="Centro de negocios"
                value={`${dq.pctConCentro.toFixed(1)}%`}
                sub={`${dq.conCentro} asignados`}
                pct={dq.pctConCentro}
              />
              <DqStat
                label="Hito de aporte"
                value={`${dq.pctConHito.toFixed(1)}%`}
                sub={`${dq.conHito} con aporte_k`}
                pct={dq.pctConHito}
              />
            </div>
          </ChartCard>
        </div>
      </div>
    </section>
  );
}

function HealthMeter({ score }: { score: number }) {
  // Bar from red→amber→green based on score
  const stops = [
    { p: 0, c: "#ef4444" },
    { p: 60, c: "#f59e0b" },
    { p: 80, c: "#10b981" },
  ];
  return (
    <div className="relative h-4 bg-ink-quinary rounded-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, ${stops.map((s) => `${s.c} ${s.p}%`).join(", ")})`,
          opacity: 0.18,
        }}
      />
      <div
        className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
        style={{
          width: `${score}%`,
          background:
            score >= 80
              ? "linear-gradient(90deg, #10b981, #34d399)"
              : score >= 60
              ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
              : "linear-gradient(90deg, #ef4444, #f87171)",
        }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-1 h-6 bg-ink-primary rounded-full"
        style={{ left: `${score}%` }}
      />
    </div>
  );
}

function ScoreFacet({
  label,
  pct,
  color,
  detail,
}: {
  label: string;
  pct: number;
  color: string;
  detail: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-medium">{label}</p>
      <p className="text-xl font-semibold tabular-nums mt-0.5" style={{ color }}>
        {pct.toFixed(0)}%
      </p>
      <div className="h-1 bg-surface-tertiary rounded-full mt-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <p className="text-[10px] text-ink-tertiary mt-1">{detail}</p>
    </div>
  );
}

function SeverityBox({ severity, count }: { severity: keyof typeof SEVERITY_CONFIG; count: number }) {
  const c = SEVERITY_CONFIG[severity];
  const Icon = c.icon;
  return (
    <div className={`p-4 rounded-2xl border ${c.bg} ${c.border}`}>
      <div className="flex items-center justify-between mb-1">
        <Icon className={`w-4 h-4 ${c.text}`} />
        <span className={`text-[10px] uppercase tracking-wider font-medium ${c.text}`}>
          {c.label}
        </span>
      </div>
      <p className={`text-3xl font-semibold tabular-nums ${c.text}`}>{count}</p>
      <p className="text-xs text-ink-tertiary mt-0.5">
        item{count === 1 ? "" : "s"} activo{count === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function CategoryMix({ risks }: { risks: ReturnType<typeof getRiskSurface> }) {
  const counts: Record<string, number> = {};
  for (const r of risks) counts[r.category] = (counts[r.category] || 0) + 1;
  const total = risks.length;
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-tertiary font-medium mb-2">
        Por categoría
      </p>
      <div className="flex h-8 rounded-xl overflow-hidden shadow-sm">
        {Object.entries(counts).map(([cat, n], i) => {
          const pct = (n / total) * 100;
          return (
            <div
              key={cat}
              className="flex items-center justify-center text-[10px] font-medium text-white transition-all hover:brightness-110"
              style={{ width: `${pct}%`, background: CATEGORY_COLOR[cat] || "#94a3b8" }}
              title={`${cat}: ${n}`}
            >
              {pct > 10 ? cat : ""}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs">
        {Object.entries(counts).map(([cat, n]) => (
          <span key={cat} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: CATEGORY_COLOR[cat] || "#94a3b8" }}
            />
            <span className="text-ink-secondary">
              {cat} <span className="text-ink-tertiary tabular-nums">({n})</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function RiskRow({ risk }: { risk: ReturnType<typeof getRiskSurface>[number] }) {
  const c = SEVERITY_CONFIG[risk.severity];
  const Icon = c.icon;
  return (
    <div
      className={`flex flex-col md:flex-row md:items-start gap-4 p-5 rounded-2xl border ${c.border} ${c.bg}/40 hover:${c.bg} transition-colors`}
    >
      <div className="flex items-center gap-3 md:w-44 shrink-0">
        <div className={`w-9 h-9 rounded-xl ${c.bg} ${c.text} flex items-center justify-center`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div>
          <span className={`pill ${c.pill}`}>{c.label}</span>
          <p className="text-[10px] uppercase tracking-wider text-ink-tertiary mt-1">
            {risk.category}
          </p>
        </div>
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-ink-primary mb-1">{risk.title}</h4>
        <p className="text-sm text-ink-secondary leading-snug">{risk.description}</p>
        {risk.action && (
          <p className="text-xs text-ink-primary mt-2 bg-white rounded-lg px-3 py-1.5 border border-ink-quaternary/40 inline-block">
            <strong>Acción:</strong> {risk.action}
          </p>
        )}
      </div>
      {risk.amount != null && risk.amount > 0 && (
        <div className="md:text-right shrink-0">
          <p className="text-[10px] uppercase tracking-wider text-ink-tertiary font-medium">
            Monto involucrado
          </p>
          <p className="text-xl font-semibold tabular-nums">
            {fmtCLP(risk.amount, { compact: true })}
          </p>
          {risk.count != null && (
            <p className="text-[11px] text-ink-tertiary">{risk.count} item(s)</p>
          )}
        </div>
      )}
    </div>
  );
}

function CuotasTimeline() {
  const cuotas = analizarCuotasAdenda();
  return (
    <div className="relative">
      <div className="absolute top-7 left-0 right-0 h-px bg-ink-quaternary/50" />
      <div className="grid grid-cols-6 gap-2 relative">
        {cuotas.map((c, i) => {
          const color =
            c.estado === "Pagada"
              ? "#10b981"
              : c.estado === "Pagada parcial"
              ? "#f59e0b"
              : c.estado === "Vencida"
              ? "#ef4444"
              : "#94a3b8";
          const Icon =
            c.estado === "Pagada"
              ? CheckCircle2
              : c.estado === "Vencida"
              ? AlertTriangle
              : Clock;
          return (
            <div key={c.id} className="flex flex-col items-center text-center">
              <div
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center border-4 z-10 transition-transform hover:scale-110"
                style={{ borderColor: color, color }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] uppercase tracking-wider text-ink-tertiary mt-2">
                Cuota {c.letra}
              </p>
              <p className="text-sm font-semibold mt-0.5" style={{ color }}>
                {c.estado}
              </p>
              <p className="text-[11px] text-ink-tertiary">{c.plazo}</p>
              <p className="text-xs font-medium tabular-nums mt-1">
                {fmtCLP(c.monto, { compact: true })}
              </p>
              {c.pagado > 0 && (
                <p className="text-[10px] text-rho-dark tabular-nums">
                  pagado {fmtCLP(c.pagado, { compact: true })}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DqStat({
  label,
  value,
  sub,
  pct,
}: {
  label: string;
  value: string;
  sub: string;
  pct?: number;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-ink-tertiary font-medium">{label}</p>
      <p className="text-2xl font-semibold tabular-nums mt-1">{value}</p>
      {pct != null && (
        <div className="h-1.5 bg-surface-tertiary rounded-full mt-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background:
                pct >= 90
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : pct >= 70
                  ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                  : "linear-gradient(90deg, #ef4444, #f87171)",
            }}
          />
        </div>
      )}
      <p className="text-xs text-ink-tertiary mt-1.5">{sub}</p>
    </div>
  );
}

function computeHealthScore(
  k: ReturnType<typeof headlineKPIs>,
  oc: ReturnType<typeof ocSummary>,
  dq: ReturnType<typeof dataQuality>
): { value: number; label: string } {
  // Sencillo: ponderado de 3 factores
  const capWeight = Math.min(100, k.pctPagado) * 0.45;
  const ocWeight = Math.min(100, oc.pctPagado) * 0.25;
  const dqWeight = dq.pctClasificados * 0.15;
  // Penalización por cuotas vencidas
  const venc = Math.max(0, 100 - k.cuotasVencidas * 15);
  const vencWeight = venc * 0.15;
  const total = Math.round(capWeight + ocWeight + dqWeight + vencWeight);
  const label =
    total >= 80
      ? "Operación saludable, atención preventiva"
      : total >= 60
      ? "Operación estable con focos críticos"
      : "Acción requerida en múltiples frentes";
  return { value: total, label };
}
