"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  meta?: ReactNode;
  align?: "left" | "center";
}

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  badge,
  meta,
  align = "center",
}: PageHeaderProps) {
  return (
    <header className={`relative pt-12 md:pt-16 pb-8 ${align === "center" ? "text-center" : ""}`}>
      <div
        className={`max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col gap-4 ${
          align === "center" ? "items-center" : "items-start"
        }`}
      >
        {badge}
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-rho-medium">
            {eyebrow}
          </p>
        )}
        <h1 className="h-display max-w-4xl">{title}</h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-ink-secondary max-w-3xl leading-snug">
            {subtitle}
          </p>
        )}
        {meta && <div className="mt-2">{meta}</div>}
      </div>
    </header>
  );
}
