"use client";

import { ReactNode } from "react";
import AnimatedNumber from "./AnimatedNumber";
import Sparkline from "./Sparkline";

interface KpiTileProps {
  label: string;
  value: number;
  format: (n: number) => string;
  sub?: string;
  trend?: number[]; // optional sparkline series
  trendColor?: string;
  tone?: "default" | "accent" | "warn" | "danger" | "ok";
  icon?: ReactNode;
  className?: string;
  delta?: { value: number; positive?: boolean; label?: string };
  size?: "sm" | "md" | "lg";
}

const toneCls: Record<NonNullable<KpiTileProps["tone"]>, string> = {
  default: "bg-white text-ink-primary",
  accent: "bg-rho-ultralight/40 text-rho-dark",
  warn: "bg-amber-50/60 text-amber-800",
  danger: "bg-red-50/60 text-red-700",
  ok: "bg-emerald-50/60 text-emerald-800",
};

/**
 * Polished KPI tile with animated value, optional sparkline and delta chip.
 * Use for hero KPI grids, summary stripes, and exec dashboards.
 */
export default function KpiTile({
  label,
  value,
  format,
  sub,
  trend,
  trendColor,
  tone = "default",
  icon,
  className = "",
  delta,
  size = "md",
}: KpiTileProps) {
  const sizeMap = {
    sm: { val: "text-xl md:text-2xl", pad: "p-4" },
    md: { val: "text-2xl md:text-3xl", pad: "p-5 md:p-6" },
    lg: { val: "text-3xl md:text-4xl", pad: "p-6 md:p-7" },
  }[size];

  return (
    <div className={`${sizeMap.pad} ${toneCls[tone]} flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-current opacity-70">{icon}</span>}
          <span className="text-[11px] uppercase tracking-[0.08em] font-medium opacity-70">
            {label}
          </span>
        </div>
        {trend && trend.length > 1 && (
          <Sparkline
            data={trend}
            stroke={trendColor || (tone === "accent" ? "#3C8B3C" : "#86868B")}
            fill={trendColor || (tone === "accent" ? "#3C8B3C" : undefined)}
            width={70}
            height={20}
          />
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <AnimatedNumber
          value={value}
          format={format}
          className={`${sizeMap.val} font-semibold tabular-nums tracking-tightest whitespace-nowrap`}
        />
        {delta && (
          <span
            className={`text-xs font-medium tabular-nums px-1.5 py-0.5 rounded-md ${
              delta.positive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {delta.positive ? "+" : ""}
            {delta.value.toFixed(1)}% {delta.label || ""}
          </span>
        )}
      </div>
      {sub && <span className="text-xs opacity-60">{sub}</span>}
    </div>
  );
}
