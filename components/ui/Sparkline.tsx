"use client";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  showDot?: boolean;
  className?: string;
}

/**
 * Tiny inline trend chart — zero deps, pure SVG.
 * Use as a glance indicator inside KPI cards.
 */
export default function Sparkline({
  data,
  width = 80,
  height = 24,
  stroke = "#3C8B3C",
  fill,
  strokeWidth = 1.75,
  showDot = true,
  className,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <svg width={width} height={height} className={className} />;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const dx = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * dx;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });

  const path = points
    .map(([x, y], i) => (i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : `L${x.toFixed(2)} ${y.toFixed(2)}`))
    .join(" ");

  const areaPath = fill
    ? `${path} L${(width).toFixed(2)} ${height} L0 ${height} Z`
    : "";

  const last = points[points.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
      {fill && <path d={areaPath} fill={fill} opacity={0.18} />}
      <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {showDot && <circle cx={last[0]} cy={last[1]} r={2.2} fill={stroke} />}
    </svg>
  );
}
