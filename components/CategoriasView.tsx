"use client";

import { useMemo } from "react";
import { dataset, fmtCLP, sum, groupBy, isOperativo, movimientosHistoricos } from "@/lib/data";
import SectionHeader from "./ui/SectionHeader";
import {
  ResponsiveContainer,
  Tooltip,
  Treemap,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";

const CAT_COLORS: Record<string, string> = {
  Desarrollo_Proyecto: "#1A4A1A",
  RRHH: "#3C8B3C",
  Administración: "#6DBE6D",
  Operación: "#A8DBA8",
  Ventas: "#5B8C5A",
};

const CAT_LABELS: Record<string, string> = {
  Desarrollo_Proyecto: "Desarrollo de proyectos",
  RRHH: "Recursos humanos",
  Administración: "Administración",
  Operación: "Operación bancaria",
  Ventas: "Ventas",
};

export default function CategoriasView() {
  const movs = movimientosHistoricos();
  // Solo gasto productivo (operativo). Excluye préstamos, reversas, fondos mutuos, capital.
  const opMovs = movs.filter((m) => m.EGRESO > 0 && isOperativo(m) && m.General);

  const general = useMemo(() => {
    const g = groupBy(opMovs, (m) => m.General);
    return Object.entries(g)
      .filter(([k]) => k && k !== "—")
      .map(([k, v]) => ({
        name: k,
        size: sum(v, (m) => m.EGRESO),
        movs: v.length,
      }))
      .sort((a, b) => b.size - a.size);
  }, [opMovs]);

  const detallado = useMemo(() => {
    const g = groupBy(opMovs, (m) => m.Detallado || "—");
    return Object.entries(g)
      .map(([k, v]) => ({
        name: k,
        size: sum(v, (m) => m.EGRESO),
        movs: v.length,
      }))
      .sort((a, b) => b.size - a.size);
  }, [opMovs]);

  const especifico = useMemo(() => {
    const g = groupBy(opMovs, (m) => m.Especifico || "—");
    return Object.entries(g)
      .map(([k, v]) => ({
        name: k,
        size: sum(v, (m) => m.EGRESO),
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 15);
  }, [opMovs]);

  const totalOp = opMovs.reduce((a, b) => a + b.EGRESO, 0);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <SectionHeader
          eyebrow="Análisis por categoría"
          title="Estructura del gasto productivo."
          subtitle={`Solo gasto operativo (${fmtCLP(totalOp)}). Excluye préstamos internos, fondos mutuos, ajustes contables y movimientos de capital.`}
        />

        {/* General categories - large cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {general.slice(0, 4).map((c, i) => (
            <CategoryHeroCard
              key={c.name}
              name={c.name}
              total={c.size}
              count={c.movs}
              pct={(c.size / totalOp) * 100}
              color={CAT_COLORS[c.name] || "#3C8B3C"}
              delay={i * 0.08}
            />
          ))}
        </div>

        {/* Treemap */}
        <div className="card-elevated p-8 mb-10">
          <h3 className="h-section mb-2">Mapa de categorías generales</h3>
          <p className="text-ink-secondary mb-6">
            Visualización proporcional de cada categoría de gasto.
          </p>
          <ResponsiveContainer width="100%" height={420}>
            <Treemap
              data={general}
              dataKey="size"
              nameKey="name"
              stroke="#fff"
              fill="#3C8B3C"
              content={<TreemapNode />}
            >
              <Tooltip
                formatter={(v: number) => fmtCLP(v)}
                contentStyle={{ borderRadius: 12 }}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>

        {/* Detallado bars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-elevated p-8">
            <h3 className="text-lg font-semibold mb-1">Subcategorías (Detallado)</h3>
            <p className="text-sm text-ink-tertiary mb-6">
              Solo gasto operativo (excluye préstamos, fondos mutuos y reversas).
            </p>
            <ResponsiveContainer width="100%" height={420}>
              <BarChart
                data={detallado.slice(0, 10)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid stroke="#F5F5F7" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#86868B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => fmtCLP(v, { compact: true })}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#86868B"
                  fontSize={12}
                  width={140}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip formatter={(v: number) => fmtCLP(v)} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
                <Bar dataKey="size" radius={[0, 8, 8, 0]} fill="#3C8B3C" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card-elevated p-8">
            <h3 className="text-lg font-semibold mb-1">Top 15 específicos</h3>
            <p className="text-sm text-ink-tertiary mb-6">
              Detalle máximo del clasificador contable.
            </p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {especifico.map((e, i) => {
                const max = especifico[0].size;
                return (
                  <div key={i} className="p-3 rounded-xl hover:bg-surface-secondary transition">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-sm font-medium text-ink-primary truncate pr-3">
                        {e.name}
                      </span>
                      <span className="text-sm tabular-nums text-ink-secondary shrink-0">
                        {fmtCLP(e.size, { compact: true })}
                      </span>
                    </div>
                    <div className="h-1 bg-surface-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rho-medium to-rho-dark"
                        style={{ width: `${(e.size / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryHeroCard({
  name,
  total,
  count,
  pct,
  color,
  delay,
}: {
  name: string;
  total: number;
  count: number;
  pct: number;
  color: string;
  delay: number;
}) {
  const friendly = CAT_LABELS[name] || (name ?? "").replace(/_/g, " ") || "Sin clasificar";
  return (
    <div
      className="card p-5 animate-scale-in relative overflow-hidden"
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20"
        style={{ background: color }}
      />
      <div className="relative">
        <div className="w-1 h-8 rounded-full mb-3" style={{ background: color }} />
        <p className="text-xs text-ink-tertiary uppercase tracking-wide mb-1 truncate">
          {friendly}
        </p>
        <p className="text-2xl font-semibold tabular-nums mb-1">
          {fmtCLP(total, { compact: true })}
        </p>
        <p className="text-xs text-ink-tertiary">{pct.toFixed(1)}% · {count} mov.</p>
      </div>
    </div>
  );
}


function TreemapNode(props: any) {
  const { x, y, width, height, name, value } = props;
  if (width < 60 || height < 40) return <g />;
  const safeName: string = name ?? "";
  const color = CAT_COLORS[safeName] || "#3C8B3C";
  const label = CAT_LABELS[safeName] || safeName.replace(/_/g, " ") || "—";
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} stroke="#fff" strokeWidth={2} rx={6} />
      <text
        x={x + 12}
        y={y + 24}
        fill="#fff"
        fontSize={13}
        fontWeight={600}
        style={{ pointerEvents: "none" }}
      >
        {label}
      </text>
      <text
        x={x + 12}
        y={y + 42}
        fill="rgba(255,255,255,0.8)"
        fontSize={11}
        style={{ pointerEvents: "none" }}
      >
        {fmtCLP(value, { compact: true })}
      </text>
    </g>
  );
}

function isOperativoCat(g: string) {
  return !["Préstamos", "Reversa", "Fondos_Mutuos", "Capital"].includes(g);
}
