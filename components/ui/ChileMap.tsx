"use client";

import { useMemo } from "react";

/**
 * SVG mapa de Chile mainland geo-preciso.
 * Usa una proyección equirectangular simple [lon, lat] → [x, y]
 * tanto para el outline del país como para los marcadores.
 * De esta forma los pines siempre caen DENTRO del territorio.
 */

// Bounding box de Chile mainland (con un pequeño padding)
export const MAP_BBOX = {
  latMax: -17.0,
  latMin: -56.5,
  lonMin: -76.0,
  lonMax: -66.0,
};

// ViewBox del SVG
const VB_W = 100;
const VB_H = 395; // ~ratio real (39.5 / 10)

export function project(lat: number, lon: number): [number, number] {
  const x = ((lon - MAP_BBOX.lonMin) / (MAP_BBOX.lonMax - MAP_BBOX.lonMin)) * VB_W;
  const y = ((MAP_BBOX.latMax - lat) / (MAP_BBOX.latMax - MAP_BBOX.latMin)) * VB_H;
  return [x, y];
}

// Costa oeste (Pacífico) — de NORTE a SUR
const COSTA_OESTE: [number, number][] = [
  [-18.50, -70.32], // Arica
  [-19.20, -70.20],
  [-20.21, -70.16], // Iquique
  [-21.50, -70.12],
  [-22.49, -70.27], // Tocopilla
  [-23.65, -70.40], // Antofagasta
  [-24.65, -70.50],
  [-25.40, -70.58], // Taltal
  [-26.35, -70.65], // Chañaral
  [-27.07, -70.82], // Caldera
  [-27.85, -70.95],
  [-28.92, -71.25],
  [-29.95, -71.34], // Coquimbo
  [-30.65, -71.60],
  [-31.55, -71.55],
  [-32.45, -71.45], // La Ligua / Papudo
  [-33.05, -71.62], // Valparaíso
  [-33.60, -71.60], // San Antonio
  [-34.40, -72.00],
  [-35.32, -72.42], // Constitución
  [-36.10, -72.80],
  [-36.83, -73.05], // Concepción
  [-37.30, -73.50],
  [-37.62, -73.66], // Lebu
  [-38.60, -73.40], // Carahue/Imperial
  [-39.30, -73.20],
  [-39.82, -73.24], // Valdivia
  [-40.60, -73.20],
  [-41.20, -73.10],
  [-41.47, -72.94], // Puerto Montt
  [-41.85, -73.85], // Ancud (Chiloé norte)
  [-42.48, -73.77], // Castro
  [-43.12, -73.62], // Quellón
  [-43.80, -73.20],
  [-44.40, -73.55],
  [-45.40, -72.70], // Pto Aysén entrance
  [-46.20, -74.10],
  [-47.10, -74.40],
  [-48.10, -75.20],
  [-48.80, -74.50],
  [-49.50, -74.40],
  [-50.20, -74.80],
  [-50.95, -73.85],
  [-51.70, -73.30],
  [-52.50, -73.50],
  [-53.16, -70.92], // Punta Arenas
  [-53.80, -71.20],
  [-54.20, -71.50],
  [-54.80, -70.30],
  [-55.40, -68.60],
  [-55.85, -67.45], // Cabo Hornos
];

// Frontera oriental con Argentina — de SUR a NORTE
const FRONTERA_ESTE: [number, number][] = [
  [-55.50, -67.20],
  [-54.70, -67.50],
  [-53.80, -68.20],
  [-52.50, -68.40],
  [-51.50, -71.90],
  [-50.50, -72.50],
  [-49.50, -72.80],
  [-48.50, -72.65],
  [-47.20, -72.55],
  [-46.00, -71.80],
  [-45.20, -71.50],
  [-44.40, -71.30],
  [-43.20, -71.65],
  [-42.10, -71.60],
  [-41.10, -71.85],
  [-40.30, -71.70],
  [-39.20, -71.55],
  [-38.40, -71.20],
  [-37.40, -71.00],
  [-36.40, -71.10],
  [-35.30, -70.50],
  [-34.30, -70.10],
  [-33.40, -70.00], // Santiago/Andes
  [-32.30, -70.10],
  [-31.20, -70.50],
  [-30.20, -70.30],
  [-29.10, -69.95],
  [-28.00, -69.45],
  [-26.90, -68.85],
  [-25.90, -68.50],
  [-24.80, -68.40],
  [-23.50, -67.30],
  [-22.50, -67.20],
  [-21.30, -68.05],
  [-20.10, -68.70],
  [-19.10, -69.10],
  [-18.30, -69.50],
  [-17.50, -69.50], // Arica frontera
];

function buildChilePath(): string {
  const allPoints = [...COSTA_OESTE, ...FRONTERA_ESTE];
  let d = "";
  allPoints.forEach((p, i) => {
    const [x, y] = project(p[0], p[1]);
    d += `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)} `;
  });
  d += "Z";
  return d;
}

const CHILE_PATH = buildChilePath();

// Ciudades / regiones de referencia (etiquetas)
const REFERENCIAS = [
  { name: "Arica", lat: -18.48, lon: -70.32 },
  { name: "Antofagasta", lat: -23.65, lon: -70.40 },
  { name: "La Serena", lat: -29.90, lon: -71.25 },
  { name: "Valparaíso", lat: -33.05, lon: -71.62 },
  { name: "Santiago", lat: -33.45, lon: -70.65 },
  { name: "Concepción", lat: -36.83, lon: -73.05 },
  { name: "Temuco", lat: -38.74, lon: -72.59 },
  { name: "Puerto Montt", lat: -41.47, lon: -72.94 },
  { name: "Coyhaique", lat: -45.57, lon: -72.07 },
  { name: "Punta Arenas", lat: -53.16, lon: -70.92 },
];

export interface ChileMapPin {
  id: string;
  name: string;
  lat: number;
  lon: number;
  color: string;
  size: number; // 0..1
  meta?: string;
  isHover?: boolean;
}

interface ChileMapProps {
  pins: ChileMapPin[];
  hoverId?: string | null;
  onHover?: (id: string | null) => void;
  showReferences?: boolean;
  height?: number;
}

export default function ChileMap({
  pins,
  hoverId,
  onHover,
  showReferences = true,
  height = 540,
}: ChileMapProps) {
  const maxSize = useMemo(() => Math.max(0.001, ...pins.map((p) => p.size)), [pins]);

  return (
    <div
      className="relative rounded-2xl border overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(240,249,255,0.6), rgba(236,254,255,0.4), rgba(240,253,244,0.6))",
        borderColor: "var(--border)",
      }}
    >
      <svg
        viewBox={`-22 -8 ${VB_W + 44} ${VB_H + 16}`}
        style={{ width: "100%", height, display: "block" }}
        role="img"
        aria-label="Mapa de Chile con proyectos del portafolio Rho Generación"
      >
        <defs>
          <linearGradient id="land-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dcfce7" />
            <stop offset="100%" stopColor="#bbf7d0" />
          </linearGradient>
          <filter id="pin-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="0.6"
              stdDeviation="0.6"
              floodColor="#000"
              floodOpacity="0.25"
            />
          </filter>
        </defs>

        {/* Latitud guide lines */}
        {[-20, -30, -40, -50].map((lat) => {
          const [, y] = project(lat, MAP_BBOX.lonMin);
          return (
            <line
              key={lat}
              x1={-2}
              y1={y}
              x2={VB_W + 2}
              y2={y}
              stroke="#cbd5e1"
              strokeWidth={0.18}
              strokeDasharray="1.2 1.2"
              opacity={0.5}
            />
          );
        })}

        {/* Chile path */}
        <path
          d={CHILE_PATH}
          fill="url(#land-grad)"
          stroke="#86efac"
          strokeWidth={0.6}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* City reference labels */}
        {showReferences &&
          REFERENCIAS.map((r) => {
            const [x, y] = project(r.lat, r.lon);
            const isMajor = ["Santiago", "Valparaíso", "Concepción", "Antofagasta", "Punta Arenas"].includes(
              r.name
            );
            return (
              <g key={r.name}>
                <circle cx={x} cy={y} r={isMajor ? 0.55 : 0.35} fill="#64748b" opacity={0.55} />
                <text
                  x={x + 1.6}
                  y={y + 0.9}
                  fontSize={isMajor ? 2.3 : 1.9}
                  fill="#64748b"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                  opacity={isMajor ? 0.85 : 0.55}
                >
                  {r.name}
                </text>
              </g>
            );
          })}

        {/* Pins */}
        {pins.map((p) => {
          const [x, y] = project(p.lat, p.lon);
          const norm = Math.max(0.25, p.size / maxSize);
          const r = 1.6 + norm * 2.8;
          const isHover = hoverId === p.id;
          return (
            <g
              key={p.id}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => onHover?.(p.id)}
              onMouseLeave={() => onHover?.(null)}
            >
              {/* Glow ring */}
              <circle
                cx={x}
                cy={y}
                r={r * 2.6}
                fill={p.color}
                opacity={isHover ? 0.22 : 0.10}
                style={{ transition: "opacity 0.2s" }}
              />
              <circle
                cx={x}
                cy={y}
                r={r * 1.6}
                fill={p.color}
                opacity={isHover ? 0.32 : 0.18}
                style={{ transition: "opacity 0.2s" }}
              />
              {/* Main pin */}
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={p.color}
                stroke="#fff"
                strokeWidth={isHover ? 0.7 : 0.5}
                filter="url(#pin-shadow)"
                style={{ transition: "stroke-width 0.15s" }}
              />
              {/* Tooltip when hover */}
              {isHover && (
                <g style={{ pointerEvents: "none" }}>
                  <rect
                    x={x + r + 1.4}
                    y={y - 4.8}
                    rx={1.2}
                    ry={1.2}
                    width={28}
                    height={9.6}
                    fill="rgba(255,255,255,0.97)"
                    stroke={p.color}
                    strokeWidth={0.3}
                    filter="url(#pin-shadow)"
                  />
                  <text
                    x={x + r + 2.6}
                    y={y - 1.5}
                    fontSize={2.4}
                    fontWeight={600}
                    fill="#1d1d1f"
                    style={{ fontFamily: "system-ui, sans-serif" }}
                  >
                    {p.name}
                  </text>
                  {p.meta && (
                    <text
                      x={x + r + 2.6}
                      y={y + 1.6}
                      fontSize={1.9}
                      fill="#71717a"
                      style={{ fontFamily: "system-ui, sans-serif" }}
                    >
                      {p.meta}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
