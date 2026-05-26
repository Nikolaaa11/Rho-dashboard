"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "rho-theme";

type Theme = "light" | "dark";

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    try {
      // Default light (Apple branding). Only honor explicit user choice.
      const stored = (localStorage.getItem(KEY) as Theme | null) || null;
      const initial: Theme = stored === "dark" ? "dark" : "light";
      setThemeState(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch {
      // ignore
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(KEY, t);
      document.documentElement.setAttribute("data-theme", t);
    } catch {}
  };

  return [theme, setTheme];
}

export default function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "Cambiar a claro" : "Cambiar a oscuro"}
      aria-label="Toggle theme"
      className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors"
    >
      {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
    </button>
  );
}
