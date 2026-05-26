"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Command,
  ArrowRight,
  Printer,
  FileText,
  Wallet,
  Building2,
  BarChart3,
  Calendar,
  AlertTriangle,
  Leaf,
  Search,
  CreditCard,
  Map as MapIcon,
  Activity,
} from "lucide-react";
import type { TabDef } from "./TopNav";
import { dataset } from "@/lib/data";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  tabs: TabDef[];
}

const ICONS: Record<string, React.ReactNode> = {
  carta: <FileText className="w-4 h-4" />,
  overview: <BarChart3 className="w-4 h-4" />,
  desembolsos: <Wallet className="w-4 h-4" />,
  proyectos: <Building2 className="w-4 h-4" />,
  mapa: <MapIcon className="w-4 h-4" />,
  categorias: <BarChart3 className="w-4 h-4" />,
  oc: <CreditCard className="w-4 h-4" />,
  movimientos: <CreditCard className="w-4 h-4" />,
  analitica: <Activity className="w-4 h-4" />,
  risk: <AlertTriangle className="w-4 h-4" />,
  esg: <Leaf className="w-4 h-4" />,
};

export default function CommandPalette({ open, onClose, onSelect, tabs }: CommandPaletteProps) {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter results: tabs + top movements + OCs
  const results = useMemo(() => {
    const ql = q.toLowerCase().trim();
    const tabResults = tabs
      .filter((t) =>
        ql === "" ||
        t.label.toLowerCase().includes(ql) ||
        t.description?.toLowerCase().includes(ql) ||
        t.group.toLowerCase().includes(ql)
      )
      .map((t) => ({ type: "tab" as const, ...t }));

    let moveResults: any[] = [];
    let ocResults: any[] = [];
    if (ql.length >= 2) {
      moveResults = dataset.movimientos
        .filter((m) =>
          `${m.DESCRIPCION} ${m.Nombre} ${m.Especifico}`.toLowerCase().includes(ql)
        )
        .slice(0, 4)
        .map((m, i) => ({
          type: "movement" as const,
          id: `mov-${i}`,
          label: m.DESCRIPCION?.slice(0, 60) || m.Nombre,
          sub: `${m.FECHA_STR} · ${m.Centro_Negocios || "—"}`,
          monto: m.EGRESO || m.ABONOS,
        }));
      ocResults = dataset.oc
        .filter((o) =>
          `${o.NumOC} ${o.Proveedor} ${o.Descripcion}`.toLowerCase().includes(ql)
        )
        .slice(0, 4)
        .map((o) => ({
          type: "oc" as const,
          id: `oc-${o.NumOC}`,
          label: o.NumOC + " — " + o.Proveedor,
          sub: o.Descripcion?.slice(0, 60),
          monto: o.PorPagar,
        }));
    }

    const actions = [
      { type: "action" as const, id: "print", label: "Imprimir reporte", sub: "Genera PDF imprimible" },
      { type: "action" as const, id: "adenda", label: "Abrir Adenda N°2 (PDF)", sub: "Documento contractual" },
    ].filter((a) => ql === "" || a.label.toLowerCase().includes(ql) || a.sub.toLowerCase().includes(ql));

    return { tabs: tabResults, actions, movements: moveResults, ocs: ocResults };
  }, [q, tabs]);

  const flatList = useMemo(() => {
    const out: { kind: "tab" | "action" | "movement" | "oc"; item: any }[] = [];
    for (const t of results.tabs) out.push({ kind: "tab", item: t });
    for (const a of results.actions) out.push({ kind: "action", item: a });
    for (const m of results.movements) out.push({ kind: "movement", item: m });
    for (const o of results.ocs) out.push({ kind: "oc", item: o });
    return out;
  }, [results]);

  // Reset cursor on q change
  useEffect(() => {
    setCursor(0);
  }, [q]);

  const handleSelect = (entry: typeof flatList[number]) => {
    if (entry.kind === "tab") onSelect(entry.item.id);
    else if (entry.kind === "action") {
      if (entry.item.id === "print") {
        onClose();
        setTimeout(() => window.print(), 100);
      } else if (entry.item.id === "adenda") {
        window.open("/docs/Adenda_N2_RHO_FIP_CEHTA.pdf", "_blank");
        onClose();
      }
    } else if (entry.kind === "movement") {
      onSelect("movimientos");
    } else if (entry.kind === "oc") {
      onSelect("oc");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(flatList.length - 1, c + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
      } else if (e.key === "Enter") {
        if (flatList[cursor]) {
          e.preventDefault();
          handleSelect(flatList[cursor]);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, cursor, flatList]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 no-print"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-float border border-ink-quaternary/30 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-ink-quaternary/40">
          <Search className="w-4 h-4 text-ink-tertiary" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar vistas, transacciones, proveedores, acciones..."
            className="flex-1 text-base outline-none placeholder-ink-tertiary"
          />
          <span className="kbd">ESC</span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {flatList.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-ink-tertiary">
              Sin resultados. Probá con otra palabra.
            </div>
          )}
          {results.tabs.length > 0 && (
            <Group title="Vistas">
              {results.tabs.map((t, i) => {
                const flatIdx = i;
                return (
                  <Row
                    key={t.id}
                    icon={ICONS[t.id] || <ArrowRight className="w-4 h-4" />}
                    label={t.label}
                    sub={t.description || ""}
                    badge={t.group}
                    active={cursor === flatIdx}
                    onClick={() => handleSelect({ kind: "tab", item: t })}
                  />
                );
              })}
            </Group>
          )}
          {results.actions.length > 0 && (
            <Group title="Acciones">
              {results.actions.map((a, i) => {
                const flatIdx = results.tabs.length + i;
                return (
                  <Row
                    key={a.id}
                    icon={a.id === "print" ? <Printer className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    label={a.label}
                    sub={a.sub}
                    active={cursor === flatIdx}
                    onClick={() => handleSelect({ kind: "action", item: a })}
                  />
                );
              })}
            </Group>
          )}
          {results.movements.length > 0 && (
            <Group title={`Movimientos (${results.movements.length})`}>
              {results.movements.map((m, i) => {
                const flatIdx = results.tabs.length + results.actions.length + i;
                return (
                  <Row
                    key={m.id}
                    icon={<CreditCard className="w-4 h-4" />}
                    label={m.label}
                    sub={m.sub}
                    active={cursor === flatIdx}
                    onClick={() => handleSelect({ kind: "movement", item: m })}
                  />
                );
              })}
            </Group>
          )}
          {results.ocs.length > 0 && (
            <Group title={`Órdenes de compra (${results.ocs.length})`}>
              {results.ocs.map((o, i) => {
                const flatIdx =
                  results.tabs.length + results.actions.length + results.movements.length + i;
                return (
                  <Row
                    key={o.id}
                    icon={<Building2 className="w-4 h-4" />}
                    label={o.label}
                    sub={o.sub}
                    active={cursor === flatIdx}
                    onClick={() => handleSelect({ kind: "oc", item: o })}
                  />
                );
              })}
            </Group>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-ink-quaternary/40 bg-surface-secondary text-xs text-ink-tertiary">
          <span>
            <span className="kbd">↑</span> <span className="kbd">↓</span> navegar
          </span>
          <span>
            <span className="kbd">↵</span> seleccionar · <span className="kbd">ESC</span> cerrar
          </span>
        </div>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-2">
      <div className="px-5 py-1.5 text-[10px] uppercase tracking-wider font-medium text-ink-tertiary">
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({
  icon,
  label,
  sub,
  badge,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  badge?: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
        active ? "bg-rho-ultralight/60" : "hover:bg-surface-tertiary"
      }`}
    >
      <span
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          active ? "bg-rho-dark text-white" : "bg-surface-tertiary text-ink-secondary"
        }`}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-primary truncate">{label}</p>
        {sub && <p className="text-xs text-ink-tertiary truncate">{sub}</p>}
      </div>
      {badge && <span className="pill pill-neutral shrink-0">{badge}</span>}
      <ArrowRight
        className={`w-4 h-4 shrink-0 transition-opacity ${
          active ? "opacity-100 text-rho-dark" : "opacity-0"
        }`}
      />
    </button>
  );
}
