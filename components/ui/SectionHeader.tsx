"use client";

import { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  align?: "left" | "center";
}

/**
 * Canonical section header used at the top of each view.
 * Replaces the duplicated SectionHeader exported from HitosView.
 */
export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div
      className={`mb-10 md:mb-14 animate-fade-in ${
        align === "center" ? "text-center mx-auto" : ""
      }`}
    >
      <div
        className={`flex flex-col md:flex-row md:items-end md:justify-between gap-4 ${
          align === "center" ? "items-center" : ""
        }`}
      >
        <div className={align === "center" ? "max-w-3xl mx-auto" : ""}>
          {eyebrow && (
            <p className="text-sm font-medium text-rho-medium uppercase tracking-[0.12em] mb-3">
              {eyebrow}
            </p>
          )}
          <h2 className="h-section max-w-3xl">{title}</h2>
          {subtitle && (
            <p className="mt-3 text-lg text-ink-secondary max-w-2xl">{subtitle}</p>
          )}
        </div>
        {actions && <div className="shrink-0 flex items-center gap-2 no-print">{actions}</div>}
      </div>
    </div>
  );
}
