"use client";

interface BulletChartProps {
  actual: number;
  target: number;
  max?: number;
  comparison?: number;
  fmt: (n: number) => string;
  height?: number;
  label?: string;
  sub?: string;
  color?: string;
  trackColor?: string;
}

/**
 * Stephen Few–style bullet chart: shows actual vs target on a track.
 * Use to compare plan vs ejecutado, pagado vs comprometido, etc.
 */
export default function BulletChart({
  actual,
  target,
  max,
  comparison,
  fmt,
  height = 14,
  label,
  sub,
  color = "#3C8B3C",
  trackColor = "#F5F5F7",
}: BulletChartProps) {
  const m = max ?? Math.max(actual, target, comparison ?? 0) * 1.15;
  const actualPct = m > 0 ? Math.min(100, (actual / m) * 100) : 0;
  const targetPct = m > 0 ? Math.min(100, (target / m) * 100) : 0;
  const compPct = comparison != null && m > 0 ? Math.min(100, (comparison / m) * 100) : 0;

  const reached = actual >= target;

  return (
    <div className="space-y-1.5">
      {(label || sub) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && <span className="text-sm font-medium text-ink-primary">{label}</span>}
          {sub && <span className="text-xs text-ink-tertiary tabular-nums">{sub}</span>}
        </div>
      )}
      <div
        className="relative w-full rounded-full overflow-visible"
        style={{ height, background: trackColor }}
      >
        {/* Comparison bar (lighter) */}
        {comparison != null && (
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: `${compPct}%`,
              background: color,
              opacity: 0.18,
            }}
          />
        )}
        {/* Actual bar */}
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000"
          style={{
            width: `${actualPct}%`,
            background: reached
              ? `linear-gradient(90deg, ${color}, ${color}cc)`
              : `linear-gradient(90deg, ${color}aa, ${color})`,
          }}
        />
        {/* Target marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-ink-primary"
          style={{ left: `${targetPct}%`, height: height + 6 }}
          title={`Plan: ${fmt(target)}`}
        />
      </div>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-ink-secondary tabular-nums">
          Real <strong className="text-ink-primary">{fmt(actual)}</strong>
        </span>
        <span className="text-ink-tertiary tabular-nums">
          Plan {fmt(target)}
        </span>
      </div>
    </div>
  );
}
