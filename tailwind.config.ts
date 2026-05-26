import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rho: {
          dark: "#1A4A1A",
          medium: "#3C8B3C",
          light: "#6DBE6D",
          ultralight: "#E8F5E8",
          deep: "#0F2F0F",
          mist: "#F2F8F2",
        },
        accent: {
          emerald: "#10b981",
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          amber: "#f59e0b",
          rose: "#f43f5e",
          slate: "#64748b",
        },
        status: {
          ok: "#10b981",
          warn: "#f59e0b",
          danger: "#ef4444",
          info: "#0ea5e9",
          neutral: "#94a3b8",
        },
        ink: {
          primary: "#1D1D1F",
          secondary: "#6E6E73",
          tertiary: "#86868B",
          quaternary: "#D2D2D7",
          quinary: "#EBEBF0",
        },
        surface: {
          primary: "#FFFFFF",
          secondary: "#FBFBFD",
          tertiary: "#F5F5F7",
          glass: "rgba(255,255,255,0.72)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'SF Pro Display'",
          "'SF Pro Text'",
          "'Inter'",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'SF Pro Display'",
          "'Inter'",
          "system-ui",
          "sans-serif",
        ],
        mono: ["'SF Mono'", "Menlo", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.025em",
        snug: "-0.01em",
        wide: "0.01em",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "card": "0 1px 2px rgba(0,0,0,0.04), 0 8px 28px -12px rgba(0,0,0,0.06)",
        "elev": "0 2px 4px rgba(0,0,0,0.04), 0 24px 48px -20px rgba(0,0,0,0.12)",
        "float": "0 8px 16px rgba(0,0,0,0.06), 0 32px 64px -16px rgba(0,0,0,0.18)",
        "ring-green": "0 0 0 4px rgba(60,139,60,0.15)",
        "ring-warn": "0 0 0 4px rgba(245,158,11,0.15)",
        "ring-danger": "0 0 0 4px rgba(239,68,68,0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        "fade-in-fast": "fadeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-up": "slideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-up-sm": "slideUpSm 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "shimmer": "shimmer 2.5s linear infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "draw": "draw 1.6s cubic-bezier(0.65, 0, 0.35, 1) forwards",
        "blob": "blob 18s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUpSm: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        draw: {
          from: { strokeDashoffset: "var(--draw-len, 1000)" },
          to: { strokeDashoffset: "0" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(30px,-20px) scale(1.05)" },
          "66%": { transform: "translate(-20px,15px) scale(0.95)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
