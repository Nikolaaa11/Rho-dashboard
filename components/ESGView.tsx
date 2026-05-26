"use client";

import { getESGSnapshot, PROYECTOS_GEO } from "@/lib/derived";
import SectionHeader from "./ui/SectionHeader";
import ChartCard from "./ui/ChartCard";
import AnimatedNumber from "./ui/AnimatedNumber";
import {
  Leaf,
  Zap,
  Wind,
  Sun,
  Battery,
  Users,
  MapPin,
  Sparkles,
  Globe,
  Building2,
  TrendingDown,
} from "lucide-react";

export default function ESGView() {
  const esg = getESGSnapshot();
  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 -z-10 bg-blob-emerald" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          eyebrow="Impacto · ESG"
          title="La huella que se va a construir."
          subtitle="Métricas de impacto estimadas asumiendo que el portafolio completo entra en operación. Factor de planta solar 27% · factor emisión grid Chile 0,39 tCO₂/MWh."
        />

        {/* === HERO STAT === */}
        <div className="card-elevated p-10 md:p-14 mb-8 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
          <div className="absolute -top-10 right-0 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-cyan-100/50 rounded-full blur-3xl" />
          <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_2fr] gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur border border-emerald-200 mb-4">
                <Leaf className="w-3 h-3 text-emerald-700" />
                <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-emerald-700">
                  Impacto climático
                </span>
              </div>
              <h3 className="h-mega mb-3 text-emerald-700">
                <AnimatedNumber
                  value={esg.co2EvitadoTonAnual / 1000}
                  format={(n) => n.toFixed(1)}
                />
                k tCO₂
              </h3>
              <p className="text-lg text-ink-secondary leading-snug">
                evitadas <strong>cada año</strong> cuando el portafolio operativo de{" "}
                {esg.pvMW} MW solar PV esté generando energía limpia para el sistema chileno.
              </p>
              <p className="text-sm text-ink-tertiary mt-4">
                Equivalente a retirar ~{(esg.co2EvitadoTonAnual / 2.4).toFixed(0).toLocaleString()} autos por año del tráfico chileno.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <ImpactStat
                icon={<Zap className="w-4 h-4" />}
                value={`${(esg.generacionAnualMWh / 1000).toFixed(0)} GWh`}
                label="Generación anual estimada"
                sub="Equivalente al consumo de ~70 mil hogares"
                color="emerald"
              />
              <ImpactStat
                icon={<Battery className="w-4 h-4" />}
                value={`${esg.mwhBESS} MWh`}
                label="Capacidad almacenamiento"
                sub="Habilitando integración renovable"
                color="cyan"
              />
              <ImpactStat
                icon={<MapPin className="w-4 h-4" />}
                value={`${esg.comunasImpactadas}`}
                label="Comunas impactadas"
                sub={`${esg.regionesImpactadas} regiones cubiertas`}
                color="violet"
              />
              <ImpactStat
                icon={<Users className="w-4 h-4" />}
                value={`~${esg.empleosConstruccion}`}
                label="Empleos en construcción"
                sub={`~${esg.empleosOperacion} en operación`}
                color="amber"
              />
            </div>
          </div>
        </div>

        {/* === COMPOSICIÓN TECNOLÓGICA === */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard
            icon={<Sun className="w-4 h-4" />}
            eyebrow="Mix tecnológico"
            title="Solar + almacenamiento"
            subtitle="Capacidad instalada por tipo de tecnología en el portafolio."
            accent="amber"
          >
            <div className="space-y-5">
              <TechBar
                icon={<Sun className="w-4 h-4" />}
                label="Solar fotovoltaico"
                mw={esg.pvMW}
                max={esg.mwTotal}
                color="#f59e0b"
                detail="Generación directa · 27% factor planta"
              />
              <TechBar
                icon={<Battery className="w-4 h-4" />}
                label="BESS — almacenamiento"
                mw={esg.bessMW}
                max={esg.mwTotal}
                color="#8b5cf6"
                detail={`${esg.mwhBESS} MWh · 4h promedio duración`}
              />
            </div>
            <div className="mt-6 pt-5 border-t border-ink-quaternary/40">
              <p className="text-sm text-ink-secondary leading-snug">
                El portafolio combina generación solar con almacenamiento de gran escala. El BESS de
                La Ligua (90 MW / 360 MWh) co-ubicado con la planta solar METLEN de 213 MW resuelve
                el cuello de botella del Sistema Eléctrico Nacional: <strong>desplazar energía solar
                del mediodía a la tarde-noche</strong>, cuando el grid la necesita.
              </p>
            </div>
          </ChartCard>

          <ChartCard
            icon={<Globe className="w-4 h-4" />}
            eyebrow="Alineamiento normativo"
            title="Marco regulatorio + estándares ESG"
            subtitle="Cómo conversa el portafolio con los marcos vigentes para acceso a capital institucional."
            accent="violet"
          >
            <div className="space-y-3">
              <FrameworkCard
                tag="SFDR"
                title="Artículo 9 — Inversión sostenible"
                description="Portafolio 100% renovable, sin combustibles fósiles. Cumple criterios DNSH (Do No Significant Harm)."
                ok
              />
              <FrameworkCard
                tag="Taxonomía UE"
                title="Actividad 4.1 — Generación de electricidad solar PV"
                description="Threshold 100 gCO₂eq/kWh cumplido por amplio margen (solar PV ~30g)."
                ok
              />
              <FrameworkCard
                tag="ODS / SDG"
                title="ODS 7, 9, 13"
                description="Energía limpia · Infraestructura sostenible · Acción climática."
                ok
              />
              <FrameworkCard
                tag="PAI"
                title="Principal Adverse Impacts"
                description="Reporting trimestral en preparación: huella carbono, biodiversidad, derechos humanos."
                pending
              />
              <FrameworkCard
                tag="CMF"
                title="NCG 461 — Reporting integrado"
                description="Reporte ESG anual estructurado en preparación."
                pending
              />
            </div>
          </ChartCard>
        </div>

        {/* === IMPACTO TERRITORIAL === */}
        <ChartCard
          icon={<Building2 className="w-4 h-4" />}
          eyebrow="Impacto territorial"
          title="Proyectos por región"
          subtitle="Distribución geográfica del portafolio con métricas de impacto local."
          accent="emerald"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(new Set(PROYECTOS_GEO.map((p) => p.region))).map((region) => {
              const projs = PROYECTOS_GEO.filter((p) => p.region === region);
              const mw = projs.reduce((a, p) => a + p.mw, 0);
              const comunas = new Set(projs.map((p) => p.comuna)).size;
              return (
                <div
                  key={region}
                  className="p-5 rounded-2xl border border-ink-quaternary/40 hover:border-rho-medium transition-colors bg-white"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-rho-medium" />
                    <p className="text-sm font-semibold text-ink-primary">{region}</p>
                  </div>
                  <p className="text-3xl font-semibold tabular-nums">{mw} MW</p>
                  <p className="text-xs text-ink-tertiary mt-0.5">
                    {projs.length} proyecto{projs.length === 1 ? "" : "s"} · {comunas} comuna
                    {comunas === 1 ? "" : "s"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {projs.map((p) => (
                      <span
                        key={p.nombre}
                        className="text-[10px] px-1.5 py-0.5 rounded-md bg-rho-ultralight text-rho-dark font-medium"
                      >
                        {p.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* === IMPACTO CO2 ESCENARIOS === */}
        <div className="mt-6">
          <ChartCard
            icon={<TrendingDown className="w-4 h-4" />}
            eyebrow="Trayectoria de descarbonización"
            title="CO₂ evitado acumulado en el horizonte 2027 → 2040"
            subtitle="Asumiendo COD escalonado del portafolio y vida útil 25 años."
            accent="emerald"
          >
            <CO2TrajectoryChart annual={esg.co2EvitadoTonAnual} />
          </ChartCard>
        </div>
      </div>
    </section>
  );
}

function ImpactStat({
  icon,
  value,
  label,
  sub,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sub: string;
  color: "emerald" | "cyan" | "violet" | "amber";
}) {
  const colorMap = {
    emerald: "from-emerald-500 to-emerald-700",
    cyan: "from-cyan-500 to-cyan-700",
    violet: "from-violet-500 to-violet-700",
    amber: "from-amber-500 to-amber-700",
  };
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border border-white/60 shadow-sm">
      <div
        className={`w-8 h-8 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white mb-3`}
      >
        {icon}
      </div>
      <p className="text-2xl md:text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="text-xs text-ink-primary font-medium mt-1">{label}</p>
      <p className="text-xs text-ink-tertiary mt-0.5">{sub}</p>
    </div>
  );
}

function TechBar({
  icon,
  label,
  mw,
  max,
  color,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  mw: number;
  max: number;
  color: string;
  detail: string;
}) {
  const pct = (mw / max) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <span className="text-sm font-medium" style={{ color }}>
            {label}
          </span>
        </div>
        <span className="text-base font-semibold tabular-nums">
          {mw} <span className="text-xs font-normal text-ink-tertiary">MW</span>
        </span>
      </div>
      <div className="h-3 bg-surface-tertiary rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
        />
      </div>
      <p className="text-xs text-ink-tertiary mt-1.5">{detail}</p>
    </div>
  );
}

function FrameworkCard({
  tag,
  title,
  description,
  ok,
  pending,
}: {
  tag: string;
  title: string;
  description: string;
  ok?: boolean;
  pending?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl border border-ink-quaternary/40 bg-white/60">
      <span
        className={`pill ${
          ok ? "pill-green" : pending ? "bg-amber-100 text-amber-800" : "pill-neutral"
        } shrink-0`}
      >
        {tag}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-primary">{title}</p>
        <p className="text-xs text-ink-secondary leading-snug">{description}</p>
      </div>
      <span
        className={`text-[10px] uppercase tracking-wider font-medium shrink-0 ${
          ok ? "text-emerald-700" : pending ? "text-amber-700" : "text-ink-tertiary"
        }`}
      >
        {ok ? "Cumple" : pending ? "En preparación" : "—"}
      </span>
    </div>
  );
}

function CO2TrajectoryChart({ annual }: { annual: number }) {
  // Build a yearly trajectory 2024 → 2040 assuming projects COD schedule
  // Approximation: 10% capacity in 2027, 50% in 2028, 100% from 2029
  const years: number[] = [];
  for (let y = 2024; y <= 2040; y++) years.push(y);
  let cum = 0;
  const data = years.map((y) => {
    const factor = y < 2027 ? 0 : y === 2027 ? 0.1 : y === 2028 ? 0.5 : 1;
    const yearly = Math.round(annual * factor);
    cum += yearly;
    return { y, yearly, cum };
  });

  const max = data[data.length - 1].cum || 1;
  const W = 800;
  const H = 240;
  const PAD = { top: 20, right: 30, bottom: 30, left: 60 };
  const xFor = (i: number) => PAD.left + ((W - PAD.left - PAD.right) * i) / (data.length - 1);
  const yFor = (v: number) => H - PAD.bottom - ((v / max) * (H - PAD.top - PAD.bottom));

  const path = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(d.cum).toFixed(1)}`)
    .join(" ");
  const area = `${path} L ${xFor(data.length - 1)} ${H - PAD.bottom} L ${xFor(0)} ${H - PAD.bottom} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[600px]" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Horizontal grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={PAD.left}
            y1={yFor(max * f)}
            x2={W - PAD.right}
            y2={yFor(max * f)}
            stroke="#F5F5F7"
          />
        ))}
        {/* Area */}
        <path d={area} fill="url(#co2Grad)" />
        <path d={path} stroke="#10b981" strokeWidth={2.5} fill="none" />
        {/* Points */}
        {data.map((d, i) => (
          <circle key={i} cx={xFor(i)} cy={yFor(d.cum)} r={i === data.length - 1 ? 4 : 0} fill="#10b981" />
        ))}
        {/* Last value label */}
        <text
          x={xFor(data.length - 1)}
          y={yFor(data[data.length - 1].cum) - 10}
          fontSize={11}
          fill="#10b981"
          fontWeight={600}
          textAnchor="end"
        >
          {(data[data.length - 1].cum / 1000).toFixed(0)}k tCO₂ acumuladas
        </text>
        {/* Y axis labels */}
        {[0, 0.5, 1].map((f) => (
          <text
            key={f}
            x={PAD.left - 8}
            y={yFor(max * f) + 4}
            fontSize={10}
            fill="#86868B"
            textAnchor="end"
          >
            {((max * f) / 1000).toFixed(0)}k
          </text>
        ))}
        {/* X axis labels */}
        {data.map((d, i) =>
          i % 2 === 0 ? (
            <text key={d.y} x={xFor(i)} y={H - 10} fontSize={10} fill="#86868B" textAnchor="middle">
              {d.y}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}
