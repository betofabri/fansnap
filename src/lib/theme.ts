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
    pink: "#FF3B6E",
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
    pink: "#FF3B6E",
    gridLine: "rgba(10,10,15,0.04)",
    gridLineStrong: "rgba(10,10,15,0.08)",
  },
};
