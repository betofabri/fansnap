"use client";

// FanSnap · Admin · Tour System
// Game-tutorial style — a floating callout that follows the cursor with
// smart offset and a 4-strip dim isolating the current target. Hooks into
// elements via [data-tour="<id>"] selectors so the tour stays decoupled
// from the page markup.
//
// Wiring (from any page):
//   import TourSystem, { TOUR_STEPS } from "@/components/admin/TourSystem";
//   const [open, setOpen] = useState(false);
//   {open && <TourSystem steps={TOUR_STEPS.overview} onClose={() => setOpen(false)} />}
//
// Add data-tour="<id>" attrs to the elements you want highlighted. The selector
// in each step matches by [data-tour="<selector>"].

import React, { useEffect, useState } from "react";
import { THEMES } from "@/lib/theme";

const T = {
  ...THEMES.dark,
  bgDeep: "#06060A",
  borderStrong: "#2E2E3D",
  green: "#3DDC97",
};

const mono = "var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";
const display = "var(--font-grotesk, 'Space Grotesk'), system-ui, sans-serif";

// ---------- types ----------

export type TourAccent = "purple" | "cyan" | "pink" | "green";

export type TourStep = {
  selector: string;             // value of [data-tour="<selector>"]
  kicker: string;               // "STEP 01 / 10"
  title: string;                // big display title
  body: string;                 // 2-3 sentence explanation
  bullets?: string[];           // optional inline bullets
  accent?: TourAccent;          // outline color override
  align?: "auto" | "center";    // center = ignore mouse, pin tooltip to viewport center
};

const accentColor = (a?: TourAccent) =>
  a === "cyan" ? T.cyan : a === "pink" ? T.pink : a === "green" ? T.green : T.purple;

// ---------- TOUR CONTENT (Overview page) ----------

export const TOUR_STEPS: Record<string, TourStep[]> = {
  overview: [
    {
      selector: "page-header",
      kicker: "STEP 01 / 10",
      title: "Welcome to Mission Control",
      body: "This is the live overview — every match, every sale, every fan in one feed. Use the arrows or click NEXT to walk through each block.",
      bullets: ["4 KPIs at the top", "Event heatmap + live feed", "GMV chart at the bottom"],
      accent: "purple",
    },
    {
      selector: "sidebar",
      kicker: "STEP 02 / 10",
      title: "9 sections of the back-office",
      body: "Numbered like a festival pass. The active one shows cyan corner brackets. Badges signal volume (142 events) or attention (pink ! on OPS).",
      bullets: ["Cyan badge = roster live", "Pink badge = alert pending"],
      accent: "purple",
    },
    {
      selector: "topbar-status",
      kicker: "STEP 03 / 10",
      title: "Systems health, at a glance",
      body: "Green dot pulses while D1, R2 and the Worker are all responding. If anything drops, this pill turns pink before you find out from a fan.",
      accent: "green",
    },
    {
      selector: "kpi-row",
      kicker: "STEP 04 / 10",
      title: "The four numbers that matter today",
      body: "GMV, scans, fans, photographers. Big number now, delta vs. baseline, mini trend on the right. The pink LIVE dot on Scans means it ticks every second.",
      bullets: ["▲ green = up", "▼ pink = down", "Sparkline = last hour"],
      accent: "purple",
    },
    {
      selector: "heatmap",
      kicker: "STEP 05 / 10",
      title: "24 hours of activity per event",
      body: "One row per active event, 24 cells per row — each cell is one hour. Darker purple = more face matches that hour. Empty (graphite) = silent.",
      bullets: ["Hours 00 06 12 18 labeled", "Cells with ≥ 8 print the number"],
      accent: "purple",
    },
    {
      selector: "event-code",
      kicker: "STEP 06 / 10",
      title: "Event codes carry the business model",
      body: "Every event has a short code (BB-001, CCXP-26). The border color tells you the deal type at a glance — no need to dig into details.",
      bullets: ["Purple = Official (Ocesa, CCXP)", "Cyan = Marketplace (self-serve)", "Pink = Sponsored (B2B flat fee)"],
      accent: "cyan",
    },
    {
      selector: "status-pill",
      kicker: "STEP 07 / 10",
      title: "Status pills tell you the phase",
      body: "Each event has a real-time phase. Pink LIVE pulses while photographers are uploading right now. Indexing, uploading, sponsored, idle each map to a color.",
      bullets: ["LIVE (pink) pulses", "UPLOADING (cyan)", "INDEXING (purple)", "SPONSORED (green) · IDLE (grey)"],
      accent: "pink",
    },
    {
      selector: "feed",
      kicker: "STEP 08 / 10",
      title: "Live feed — everything, in order",
      body: "Every sale, scan, refund, alert and crew join lands here as it happens. Timestamp on the left, event code in the body, dollar values bold.",
      bullets: ["~2.4 events per second peak", "Auto-scrolls newest at top"],
      accent: "pink",
    },
    {
      selector: "chart",
      kicker: "STEP 09 / 10",
      title: "7 days of GMV, stacked by business model",
      body: "Bars stack Marketplace (cyan) → Official (purple) → Sponsored (pink) bottom up. The best day of the week wears a solid purple offset shadow — Saturday here.",
      bullets: ["TOTAL · 7D on the right", "Forecast band at the bottom"],
      accent: "cyan",
    },
    {
      selector: "page-header",
      kicker: "STEP 10 / 10",
      title: "You're set — happy ops",
      body: "Click any pin in the dashboard to drill down. Press ESC any time to close this tour. You can re-open it from the ▸ TOUR button up top.",
      accent: "purple",
      align: "center",
    },
  ],
};

// ---------- hooks ----------

function useMousePosition(active: boolean) {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  useEffect(() => {
    if (!active) return;
    // Initialize to viewport center on activation so the tip doesn't snap from (0,0).
    setPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [active]);
  return pos;
}

function useTargetRect(selector: string | null, active: boolean) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (!active || !selector) { setRect(null); return; }
    const el = document.querySelector<HTMLElement>(`[data-tour="${selector}"]`);
    if (!el) { setRect(null); return; }

    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setRect(el.getBoundingClientRect()));
    };
    // Initial measure once scroll lands.
    const t = window.setTimeout(update, 380);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [selector, active]);
  return rect;
}

// ---------- tooltip ----------

const TIP_W = 380;
const TIP_GAP = 28;

type TooltipProps = {
  step: TourStep;
  index: number;
  total: number;
  mouse: { x: number; y: number };
  centered: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
};

function Tooltip({ step, index, total, mouse, centered, onPrev, onNext, onClose }: TooltipProps) {
  const accent = accentColor(step.accent);
  const wW = typeof window !== "undefined" ? window.innerWidth : 1440;
  const wH = typeof window !== "undefined" ? window.innerHeight : 900;

  // Estimate height for offset math — tooltip auto-sizes, this is just for flip detection.
  const TIP_H_EST = 380;

  let x: number, y: number;
  if (centered) {
    x = (wW - TIP_W) / 2;
    y = Math.max(80, (wH - TIP_H_EST) / 2);
  } else {
    x = mouse.x + TIP_GAP;
    y = mouse.y + TIP_GAP;
    if (x + TIP_W > wW - 16) x = mouse.x - TIP_GAP - TIP_W;
    if (y + TIP_H_EST > wH - 16) y = mouse.y - TIP_GAP - TIP_H_EST;
    if (x < 16) x = 16;
    if (y < 16) y = 16;
  }

  const isLast = index === total - 1;

  return (
    <div style={{
      position: "fixed", left: x, top: y,
      width: TIP_W, maxWidth: "calc(100vw - 32px)",
      background: T.bgPaper,
      border: `3px solid ${accent}`,
      boxShadow: `8px 8px 0 0 ${T.cyan}`,
      padding: 22,
      display: "flex", flexDirection: "column", gap: 14,
      pointerEvents: "auto",
      zIndex: 1010,
      transition: "left 180ms cubic-bezier(0.2, 0.8, 0.2, 1), top 180ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      animation: "fs-tour-pop 0.32s cubic-bezier(0.2, 0.8, 0.2, 1.4)",
    }}>
      {/* corner brackets */}
      <span style={{ position: "absolute", top: -1, left: -1, width: 14, height: 14, borderTop: `2px solid ${T.cyan}`, borderLeft: `2px solid ${T.cyan}` }} />
      <span style={{ position: "absolute", top: -1, right: -1, width: 14, height: 14, borderTop: `2px solid ${T.cyan}`, borderRight: `2px solid ${T.cyan}` }} />
      <span style={{ position: "absolute", bottom: -1, left: -1, width: 14, height: 14, borderBottom: `2px solid ${T.cyan}`, borderLeft: `2px solid ${T.cyan}` }} />
      <span style={{ position: "absolute", bottom: -1, right: -1, width: 14, height: 14, borderBottom: `2px solid ${T.cyan}`, borderRight: `2px solid ${T.cyan}` }} />

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontFamily: mono, fontSize: 11, fontWeight: 700, color: accent,
          border: `2px solid ${accent}`, padding: "3px 9px", letterSpacing: "0.1em",
        }}>{step.kicker}</span>
        <button
          onClick={onClose}
          style={{
            fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute,
            background: "transparent", border: `1.5px solid ${T.border}`,
            padding: "5px 9px", cursor: "pointer", letterSpacing: "0.16em",
          }}
        >SKIP · ESC</button>
      </div>

      {/* title */}
      <h3 style={{
        margin: 0, fontFamily: display, fontWeight: 700, fontSize: 22,
        letterSpacing: "-0.02em", lineHeight: 1.15, color: T.ink,
      }}>{step.title}</h3>

      {/* body */}
      <p style={{
        margin: 0, fontFamily: display, fontSize: 14, lineHeight: 1.55,
        color: T.inkSoft,
      }}>{step.body}</p>

      {/* bullets */}
      {step.bullets && step.bullets.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
          {step.bullets.map((b, i) => (
            <li key={i} style={{
              display: "flex", gap: 9, alignItems: "baseline",
              fontFamily: mono, fontSize: 12, color: T.inkSoft, letterSpacing: "0.02em", lineHeight: 1.4,
            }}>
              <span style={{ color: accent, fontWeight: 700 }}>▸</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {/* step pip indicator */}
      <div style={{ display: "flex", gap: 5, marginTop: 4, alignItems: "center" }}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} style={{
            width: i === index ? 26 : 8, height: 8,
            background: i === index ? accent : (i < index ? T.inkSoft : T.border),
            transition: "all 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          }} />
        ))}
      </div>

      {/* nav buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button
          onClick={onPrev}
          disabled={index === 0}
          style={{
            flex: 1,
            fontFamily: mono, fontSize: 11, fontWeight: 700,
            color: index === 0 ? T.inkMute : T.inkSoft,
            background: "transparent", border: `2px solid ${T.border}`,
            padding: "11px 12px", letterSpacing: "0.18em",
            cursor: index === 0 ? "not-allowed" : "pointer",
            opacity: index === 0 ? 0.4 : 1, textTransform: "uppercase",
          }}
        >‹ Prev</button>
        {isLast ? (
          <button
            onClick={onClose}
            className="fs-tour-cta"
            style={{
              flex: 1.6,
              fontFamily: mono, fontSize: 11, fontWeight: 700,
              color: T.bg, background: T.cyan, border: `2px solid ${T.cyan}`,
              padding: "11px 12px", letterSpacing: "0.18em", cursor: "pointer",
              boxShadow: `4px 4px 0 0 ${T.purple}`, textTransform: "uppercase",
              transition: "transform 120ms, box-shadow 120ms",
            }}
          >Finish ✓</button>
        ) : (
          <button
            onClick={onNext}
            className="fs-tour-cta"
            style={{
              flex: 1.6,
              fontFamily: mono, fontSize: 11, fontWeight: 700,
              color: T.bg, background: T.purple, border: `2px solid ${T.purple}`,
              padding: "11px 12px", letterSpacing: "0.18em", cursor: "pointer",
              boxShadow: `4px 4px 0 0 ${T.cyan}`, textTransform: "uppercase",
              transition: "transform 120ms, box-shadow 120ms",
            }}
          >Next ›</button>
        )}
      </div>

      {/* keyboard hint */}
      <div style={{
        fontFamily: mono, fontSize: 9, color: T.inkMute, letterSpacing: "0.2em",
        borderTop: `1px dashed ${T.border}`, paddingTop: 10, textAlign: "center",
      }}>← → ARROWS · ESC TO EXIT</div>
    </div>
  );
}

// ---------- main ----------

export default function TourSystem({
  steps, onClose,
}: { steps: TourStep[]; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const total = steps.length;
  const current = steps[step];
  const centered = current.align === "center";

  const mouse = useMousePosition(true);
  const rect = useTargetRect(centered ? null : current.selector, true);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); setStep(s => Math.min(s + 1, total - 1)); }
      else if (e.key === "ArrowLeft")  { e.preventDefault(); setStep(s => Math.max(s - 1, 0)); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, total]);

  // Lock page scroll while tour is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const accent = accentColor(current.accent);
  const wW = typeof window !== "undefined" ? window.innerWidth : 1440;
  const wH = typeof window !== "undefined" ? window.innerHeight : 900;

  // 4-strip dim around the target rect
  const PAD = 10;
  const t = rect ? Math.max(0, rect.top - PAD) : 0;
  const l = rect ? Math.max(0, rect.left - PAD) : 0;
  const r = rect ? Math.min(wW, rect.right + PAD) : 0;
  const b = rect ? Math.min(wH, rect.bottom + PAD) : 0;

  const dimStyle: React.CSSProperties = {
    position: "fixed",
    background: "rgba(6,6,10,0.78)",
    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(2px)",
    pointerEvents: "auto",
    transition: "all 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
  };

  return (
    <>
      {/* Animations + hover boosts scoped inline */}
      <style>{`
        @keyframes fs-tour-pop {
          from { opacity: 0; transform: scale(0.94) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes fs-tour-march {
          to { background-position: 24px 0, -24px 0, 0 24px, 0 -24px; }
        }
        .fs-tour-cta:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 0 ${T.cyan} !important; }
        .fs-tour-cta:active { transform: translate(0, 0); box-shadow: 2px 2px 0 0 ${T.cyan} !important; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none" }}>
        {rect && !centered ? (
          <>
            {/* 4 dim strips */}
            <div style={{ ...dimStyle, left: 0, top: 0, right: 0, height: t }} onClick={onClose} />
            <div style={{ ...dimStyle, left: 0, top: t, width: l, height: b - t }} onClick={onClose} />
            <div style={{ ...dimStyle, left: r, top: t, right: 0, height: b - t }} onClick={onClose} />
            <div style={{ ...dimStyle, left: 0, top: b, right: 0, bottom: 0 }} onClick={onClose} />

            {/* Target highlight outline */}
            <div style={{
              position: "fixed",
              left: l, top: t, width: r - l, height: b - t,
              border: `3px solid ${accent}`,
              boxShadow: `8px 8px 0 0 ${T.cyan}, -1px -1px 0 0 ${T.cyan}`,
              pointerEvents: "none",
              transition: "all 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}>
              {/* corner brackets, slightly larger to read on the highlight */}
              <span style={{ position: "absolute", top: -3, left: -3, width: 22, height: 22, borderTop: `3px solid ${T.cyan}`, borderLeft: `3px solid ${T.cyan}` }} />
              <span style={{ position: "absolute", top: -3, right: -3, width: 22, height: 22, borderTop: `3px solid ${T.cyan}`, borderRight: `3px solid ${T.cyan}` }} />
              <span style={{ position: "absolute", bottom: -3, left: -3, width: 22, height: 22, borderBottom: `3px solid ${T.cyan}`, borderLeft: `3px solid ${T.cyan}` }} />
              <span style={{ position: "absolute", bottom: -3, right: -3, width: 22, height: 22, borderBottom: `3px solid ${T.cyan}`, borderRight: `3px solid ${T.cyan}` }} />
            </div>
          </>
        ) : (
          // No rect (centered final step, or target not yet measured) — full dim
          <div style={{ ...dimStyle, inset: 0 }} onClick={onClose} />
        )}

        {/* tooltip */}
        <Tooltip
          step={current}
          index={step}
          total={total}
          mouse={mouse}
          centered={centered}
          onPrev={() => setStep(s => Math.max(s - 1, 0))}
          onNext={() => setStep(s => Math.min(s + 1, total - 1))}
          onClose={onClose}
        />
      </div>
    </>
  );
}
