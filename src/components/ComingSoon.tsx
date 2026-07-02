// Pre-launch placeholder shown on every public page except /aplica while
// SITE_LIVE is false. Carries the FanSnap brand chrome and routes the only
// audience we're courting pre-launch — photographers — to /aplica.

import { ArrowRight } from "lucide-react";
import FanSnapLogo from "@/components/FanSnapLogo";

import { DARK, FONT_GROTESK, FONT_MONO } from "@/lib/theme";

// Shared flat-black tokens (audit Lote B) — palette lives in src/lib/theme.ts.
const c = DARK;

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
        .cs-bypass summary { list-style: none; }
        .cs-bypass summary::-webkit-details-marker { display: none; }
        .cs-bypass summary:hover { color: ${c.inkSoft} !important; }
        .cs-bypass input:focus { border-color: ${c.accent} !important; outline: none; }
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

        {/* Team bypass — temporary while SITE_LIVE is false. Plain HTML
            <details> + GET form (no client JS): submits ?key= to /api/preview,
            which only sets the cookie when the key matches the Worker secret.
            A wrong key just lands back here, silently. Remove at launch. */}
        <details className="cs-bypass" style={{ marginTop: 20 }}>
          <summary style={{
            fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute,
            letterSpacing: "0.16em", textTransform: "uppercase",
            cursor: "pointer", transition: "color 0.15s",
          }}>
            · bypass this page ·
          </summary>
          <form action="/fansnap/api/preview" method="get" style={{
            display: "flex", gap: 8, marginTop: 14, justifyContent: "center", flexWrap: "wrap",
          }}>
            <input
              name="key"
              type="password"
              placeholder="clave de acceso"
              autoComplete="off"
              style={{
                background: "rgba(0,229,255,0.04)", border: `1.5px solid ${c.borderStrong}`,
                padding: "10px 14px", fontFamily: FONT_MONO, fontSize: 13, color: c.ink,
                width: 220, transition: "border-color 0.15s",
              }}
            />
            <button type="submit" style={{
              background: "transparent", border: `1.5px solid ${c.accent}`, color: c.accent,
              padding: "10px 18px", fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
            }}>
              Entrar
            </button>
          </form>
        </details>
      </div>
    </div>
  );
}
