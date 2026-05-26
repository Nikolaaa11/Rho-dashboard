"use client";

import { ReactNode } from "react";

export type AccentKey = "emerald" | "cyan" | "violet" | "amber" | "rose" | "rho" | "slate";

const accentMap: Record<AccentKey, { bg: string; text: string; ring: string }> = {
  emerald: {
    bg: "from-emerald-500 to-cyan-500",
    text: "text-emerald-700",
    ring: "ring-emerald-500/15",
  },
  cyan: {
    bg: "from-cyan-500 to-blue-500",
    text: "text-cyan-700",
    ring: "ring-cyan-500/15",
  },
  violet: {
    bg: "from-violet-500 to-purple-500",
    text: "text-violet-700",
    ring: "ring-violet-500/15",
  },
  amber: {
    bg: "from-amber-500 to-orange-500",
    text: "text-amber-700",
    ring: "ring-amber-500/15",
  },
  rose: {
    bg: "from-rose-500 to-pink-500",
    text: "text-rose-700",
    ring: "ring-rose-500/15",
  },
  rho: {
    bg: "from-rho-dark to-rho-medium",
    text: "text-rho-dark",
    ring: "ring-rho-medium/15",
  },
  slate: {
    bg: "from-slate-500 to-slate-700",
    text: "text-slate-700",
    ring: "ring-slate-500/15",
  },
};

interface ChartCardProps {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  accent?: AccentKey;
  className?: string;
  actions?: ReactNode;
  badge?: string;
  loading?: boolean;
}

/**
 * Canonical chart card used across every analytic view.
 * Provides a consistent header (eyebrow + title + subtitle), optional actions slot and accent.
 */
export default function ChartCard({
  icon,
  eyebrow,
  title,
  subtitle,
  children,
  accent = "rho",
  className = "",
  actions,
  badge,
  loading,
}: ChartCardProps) {
  const a = accentMap[accent];
  return (
    <div className={`card-elevated p-6 md:p-8 relative overflow-hidden bg-white ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          {(icon || eyebrow) && (
            <div className="flex items-center gap-2.5 mb-1.5">
              {icon && (
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${a.bg} flex items-center justify-center text-white shadow-sm`}
                >
                  {icon}
                </div>
              )}
              {eyebrow && (
                <p className={`text-[10px] font-medium uppercase tracking-[0.12em] ${a.text}`}>
                  {eyebrow}
                </p>
              )}
              {badge && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-tertiary text-ink-secondary">
                  {badge}
                </span>
              )}
            </div>
          )}
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-ink-primary">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-ink-tertiary mt-1 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
      </div>
      <div className="mt-5">{loading ? <div className="skeleton h-72 w-full" /> : children}</div>
    </div>
  );
}
