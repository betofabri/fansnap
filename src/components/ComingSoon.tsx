// Pre-launch placeholder shown on every public page except /aplica while
// SITE_LIVE is false. Carries the FanSnap brand chrome and routes the only
// audience we're courting pre-launch — photographers — to /aplica.

import { ArrowRight } from "lucide-react";
import FanSnapLogo from "@/components/FanSnapLogo";

const FONT_GROTESK = `"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
const FONT_MONO = `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace`;

const c = {
  bg: "#000000",
  ink: "#F4F4F2",
  inkSoft: "#A8A8A4",
  inkMute: "#5C5C58",
  border: "rgba(244,244,242,0.10)",
  accent: "#00E5FF",
  magenta: "#FF2D87",
};

export default function ComingSoon() {
  return (
    <div style={{
      minHeight: "100vh", background: c.bg, color: c.ink, fontFamily: FONT_GROTESK,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "40px 24px", position: "relative", overflow: "hidden", textAlign: "center",
    }}>
      <style>{`
        @keyframes cs-pulse { 0%,100% { opacity:1; transform:scale(1);} 50% { opacity:0.35; transform:scale(0.75);} }
        .cs-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(0,229,255,0.28); }
      `}</style>

      {/* Grid backdrop */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${c.border} 1px, transparent 1px), linear-gradient(90deg, ${c.border} 1px, transparent 1px)`,
        backgroundSize: "56px 56px", opacity: 0.5,
        maskImage: "radial-gradient(circle at 50% 45%, #000 20%, transparent 75%)",
      }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <FanSnapLogo size="lg" />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(0,229,255,0.12)", border: `1px solid rgba(0,229,255,0.45)`,
          padding: "8px 14px", borderRadius: 999,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.accent, animation: "cs-pulse 2.2s ease-in-out infinite" }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600, color: c.accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Ocesa · CCXP presenta
          </span>
        </div>

        <h1 style={{
          fontFamily: FONT_GROTESK, fontSize: "clamp(40px, 8vw, 80px)", fontWeight: 800,
          letterSpacing: "-0.04em", lineHeight: 0.96, margin: 0,
        }}>
          Algo está <span style={{ color: c.magenta }}>por venir.</span>
        </h1>

        <p style={{ fontSize: "clamp(16px, 1.6vw, 19px)", color: c.inkSoft, lineHeight: 1.55, margin: 0, maxWidth: 480 }}>
          La plataforma de fotos de tus eventos favoritos en México está en camino. Reconocimiento facial, fotos al instante, sin filas.
        </p>

        <a href="/fansnap/aplica" className="cs-cta" style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: c.accent, color: "#000", padding: "16px 26px",
          fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700,
          letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
        }}>
          ¿Eres fotógrafo? Aplica al roster <ArrowRight size={18} strokeWidth={2.5} />
        </a>

        <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 8 }}>
          México 2026 · OCESA × Omelete Company
        </div>
      </div>
    </div>
  );
}
