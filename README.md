# Rho Generación · Reporte de Capital para Inversionistas

Dashboard ejecutivo construido para presentar a los inversionistas del FIP CEHTA ESG el estado consolidado de la inversión en Rho Generación SpA. Conecta los datos transaccionales del banco con el plan contractual establecido en la **Adenda N°2 al Contrato de Suscripción de Acciones**, firmada ante notario el 27 de octubre de 2025.

## Lo que muestra

El dashboard agrupa las vistas en **5 secciones** navegables desde el TopNav y vía paleta de comandos (`⌘K` / `Ctrl+K`):

### Resumen
- **Carta** — Reporte ejecutivo one-pager imprimible (A4). Resumen narrativo con KPIs, logros, próximos hitos, top inversiones, impacto ESG, riesgos críticos y carta de cierre. Ideal para enviar a LPs.
- **Resumen** — Hero cinematográfico con 4 KPIs grandes animados + sparklines, barra triple plan/aportado/ejecutado/vencido, portafolio físico, curva acumulada vs. plan contractual, bullet charts plan vs. real, y asignación por proyecto.

### Capital
- **Plan de capital** — Las 6 cuotas de la Adenda N°2 con estado real (Pagada / Vencida / Próxima), comparación visual plan vs. pagado, distribución del uso de fondos para las cuotas pendientes.

### Portafolio
- **Proyectos** — Ficha completa por proyecto: capital ejecutado, breakdown por categoría, evolución mensual, top proveedores, todas las OC con estado de pago.
- **Mapa & Gantt** — Mapa SVG geográfico de Chile con pin por proyecto (color = etapa, tamaño = MW) + Gantt 2024→2030 con fases (Desarrollo · Permisos · Financiamiento · Construcción · Operación). Marcador "hoy" en vivo.

### Operación
- **Categorías** — Estructura del gasto productivo: Desarrollo de proyectos, RRHH, Administración, Operación bancaria. Treemap + ranking.
- **Proveedores** — 117 OC emitidas, top proveedores, búsqueda por proyecto y proveedor + exportación CSV.
- **Transacciones** — Registro completo de las 715 transacciones de la cuenta Santander con clasificación contable, búsqueda, filtros por categoría/centro/cuota y exportación CSV.

### Insights
- **Analítica** — Galería con 14 visualizaciones: anillos de avance, curva de capital, radial de cuotas, heatmap proyecto×mes, Pareto categorías, bubble capacidad×inversión, flujo Sankey-like, velocidad mensual, evolución por categoría, radar proyectos, funnel OC, calendario heatmap GitHub-style, ranking proveedores, huella operativa.
- **Riesgos** — Risk dashboard: health score, distribución por severidad y categoría, lista priorizada con monto y acción recomendada, timeline visual de las 6 cuotas, calidad del dato (% clasificado).
- **Impacto ESG** — Métricas climáticas estimadas (GWh generados, kt CO₂ evitadas/año), mix tecnológico, alineamiento normativo (SFDR, Taxonomía UE, ODS, PAI, CMF), impacto territorial por región, trayectoria descarbonización 2027→2040.

## Stack técnico

- **Next.js 14** (App Router) + **TypeScript** + **Recharts** + **Lucide** + **Framer Motion**
- **Tailwind CSS** con tema RHO extendido (paleta brand + accent + status + ink + surface) y motion tokens
- **Diseño** inspirado en el lenguaje visual de Apple — fondo blanco, tipografía SF, glassmorphism sutil, micro-animaciones (shimmer, blob, pulse, fade-in escalonado)

## Estructura

```
rho-dashboard/
├── app/
│   ├── globals.css            # Sistema de diseño + print CSS
│   ├── layout.tsx
│   └── page.tsx               # Router de tabs
├── components/
│   ├── TopNav.tsx             # Nav sticky + ⌘K trigger + botón imprimir
│   ├── CommandPalette.tsx     # Paleta de comandos (vistas + movimientos + OC + acciones)
│   ├── Hero.tsx               # Hero cinematográfico con KPIs animados
│   ├── OverviewView.tsx       # Story cards + curva vs plan + bullet charts
│   ├── CartaView.tsx          # One-pager imprimible
│   ├── DesembolsosView.tsx    # Las 6 cuotas Adenda N°2
│   ├── ProyectosView.tsx      # Grid + ficha detallada
│   ├── PortafolioMapView.tsx  # Mapa Chile + Gantt
│   ├── CategoriasView.tsx     # Treemap + breakdown
│   ├── OCView.tsx             # OC + top proveedores
│   ├── MovimientosView.tsx    # Tabla completa con filtros
│   ├── AnaliticaView.tsx      # 14 visualizaciones
│   ├── RiskView.tsx           # Risk dashboard + DQ
│   ├── ESGView.tsx            # Métricas de impacto
│   ├── Footer.tsx
│   └── ui/                    # Primitivos reutilizables
│       ├── AnimatedNumber.tsx # Tick animation on scroll
│       ├── Sparkline.tsx      # Inline trend chart
│       ├── ChartCard.tsx      # Canonical chart wrapper
│       ├── KpiTile.tsx        # Tile con valor + sparkline + delta
│       ├── BulletChart.tsx    # Stephen Few bullet
│       ├── SectionHeader.tsx  # Canonical section header
│       └── PageHeader.tsx     # Header de página
├── data/
│   └── data.json              # Datos exportados de la CC Santander
├── lib/
│   ├── data.ts                # Helpers, metadata proyectos, Adenda N°2
│   ├── derived.ts             # Geo, Gantt, ESG, Risk, agregaciones
│   └── types.ts
├── public/
│   ├── logos/                 # Logos Rho Generación
│   └── docs/                  # Adenda N°2 (PDF)
└── scripts/export.py          # Regenera data.json desde Excel
```

## Atajos de teclado

| Tecla | Acción |
|---|---|
| `⌘K` / `Ctrl+K` | Abrir paleta de comandos |
| `↑` `↓` | Navegar en paleta |
| `↵` | Seleccionar |
| `ESC` | Cerrar paleta |

## Imprimir / PDF

- Botón **Imprimir** en TopNav (y en la vista Carta).
- CSS `@media print` optimizado: oculta nav, formatea cards para A4, repite headers de tabla, page-breaks inteligentes.
- Resultado: PDF imprimible con un click.

## Despliegue

### Local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

### Build de producción

```bash
npm run build
npm start
```

### GitHub + Vercel

```bash
git init
git add .
git commit -m "Initial: Rho Dashboard para inversionistas"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/rho-dashboard.git
git push -u origin main
```

Luego en Vercel: **New Project** → importa el repo → Deploy. Framework auto-detectado (Next.js). Sin variables de entorno requeridas.

## Actualización de datos

Los datos viven en `data/data.json`. Para regenerarlo desde un Excel actualizado:

```bash
python3 scripts/export.py /ruta/al/nuevo_excel.xlsx
git commit -am "Update: corte al [fecha]"
git push
```

Vercel re-desplegará automáticamente.

## Documento contractual

Toda la sección "Plan de capital" se basa en el documento legal:

> **Adenda N°2 al Contrato de Suscripción de Acciones** entre RHO GENERACIÓN SpA
> (RUT 77.931.386-7) y FONDO DE INVERSIÓN PRIVADO CEHTA ESG (RUT 77.751.766-K),
> suscrita el 27 de octubre de 2025 ante el Notario Público Sr. Juan Ricardo San
> Martín Urrejola. Código de verificación: 20251027170542JRZ.

Las 6 cuotas (a-f) y sus plazos contractuales están codificados en `lib/data.ts` → `CUOTAS_ADENDA_N2`.

## Notas de uso

- Información financiera sensible — limitar acceso a stakeholders autorizados.
- Los importes son auditables contra el Excel `2026_02_17_CC_SANTANDER_VA.xlsx`.
- "Cuota vencida" significa: plazo notarial cumplido sin pago bancario registrado, no significa incumplimiento doloso — son cuotas con renegociación pendiente.

---

© Rho Generación SpA · FIP CEHTA ESG
