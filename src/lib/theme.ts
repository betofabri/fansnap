// FanSnap design tokens — see fansnap-context.md §7.
// Both themes ship; dark is the default with a toggle in the header.

export type ThemeName = "dark" | "light";

export interface Theme {
  bg: string;
  bgAlt: string;
  bgPaper: string;
  ink: string;
  inkSoft: string;
  inkMute: string;
  border: string;
  purple: string;
  cyan: string;
  pink: string;
  gridLine: string;
  gridLineStrong: string;
}

export const THEMES: Record<ThemeName, Theme> = {
  dark: {
    bg: "#0A0A0F",
    bgAlt: "#15151D",
    bgPaper: "#1A1A24",
    ink: "#F5F5F7",
    inkSoft: "#B8B8C2",
    inkMute: "#8E8E98",
    border: "#1F1F2A",
    purple: "#9D4EFF",
    cyan: "#00E5FF",
    pink: "#FF2D87",
    gridLine: "rgba(255,255,255,0.04)",
    gridLineStrong: "rgba(255,255,255,0.08)",
  },
  light: {
    bg: "#FAF7F2",
    bgAlt: "#F2EEE6",
    bgPaper: "#FFFFFF",
    ink: "#0A0A0F",
    inkSoft: "#3D3D47",
    inkMute: "#8E8E98",
    border: "#0A0A0F",
    purple: "#9D4EFF",
    cyan: "#00B8D4",
    pink: "#FF2D87",
    gridLine: "rgba(10,10,15,0.04)",
    gridLineStrong: "rgba(10,10,15,0.08)",
  },
};

// ─── Shared brand fonts ──────────────────────────────────────────────────────
// One definition for every page component (SPA, landings, dashboard, alta).
// The admin kit keeps its CSS-variable variants (mono/display in _kit.tsx).
export const FONT_GROTESK = `"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
export const FONT_MONO = `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace`;

// ─── Flat-black palette (landings / dashboard / alta / event pages) ──────────
// The canonical superset of the per-file `const c = {…}` palettes that used to
// be copy-pasted across 7 components (audit Lote B). Components alias it as
// `const c = DARK` — or spread it with a local override where a surface tone
// intentionally differs. Change a color HERE, not in the components.
export const DARK = {
  bg: "#000000",
  surface: "#0A0A0A",
  surfaceAlt: "#111111",
  surfaceHi: "#121212",
  ink: "#F4F4F2",
  inkSoft: "#A8A8A4",
  inkMute: "#5C5C58",
  border: "rgba(244,244,242,0.10)",
  borderStrong: "rgba(244,244,242,0.25)",
  borderFocus: "rgba(0,229,255,0.55)",
  accent: "#00E5FF",
  accentSoft: "rgba(0,229,255,0.12)",
  magenta: "#FF2D87",
  magentaSoft: "rgba(255,45,135,0.12)",
  premium: "#9D4EFF",
  premiumSoft: "rgba(157,78,255,0.14)",
  warn: "#FFD166",
  ok: "#4ADE80",
  live: "#FF3B6E",
} as const;
