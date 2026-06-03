"use client";

// FanSnap · Admin · Tour System (menu-only, calm)
// A small floating callout that follows the cursor with smart anchoring.
// 4-strip dim isolates the current target. Targets are wired via
// [data-tour="<id>"] attributes on the page elements.

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
export type TourAnchor = "auto" | "target-right" | "target-left" | "center";

export type TourStep = {
  selector: string;
  kicker: string;
  title: string;
  body: string;
  bullets?: string[];
  accent?: TourAccent;
  anchor?: TourAnchor;
};

const accentColor = (a?: TourAccent) =>
  a === "cyan" ? T.cyan : a === "pink" ? T.pink : a === "green" ? T.green : T.purple;

// ---------- TOUR CONTENT (sidebar menu walkthrough) ----------

export const TOUR_STEPS: Record<string, TourStep[]> = {
  menu: [
    {
      selector: "nav-overview",
      kicker: "MENU · 01 / 09",
      title: "Overview",
      body: "You're here. Live KPIs, event heatmap, sale feed and 7-day GMV — the room-level view of the whole platform.",
      accent: "purple",
      anchor: "target-right",
    },
    {
      selector: "nav-events",
      kicker: "MENU · 02 / 09",
      title: "Events",
      body: "Every event in one filterable list — by business model, status, category, date. New events start as a 3-step wizard.",
      bullets: ["Filters: marketplace · official · sponsored", "Detail tabs: photographers / photos / sales"],
      accent: "purple",
      anchor: "target-right",
    },
    {
      selector: "nav-photographers",
      kicker: "MENU · 03 / 09",
      title: "Photographers",
      body: "The bank — roster, FanSnap score, tier, commission editor. Plus pending applications, featured slots and payouts history.",
      bullets: ["Cyan 23 = live on field now", "Score = match × rating ÷ refund"],
      accent: "cyan",
      anchor: "target-right",
    },
    {
      selector: "nav-sales",
      kicker: "MENU · 04 / 09",
      title: "Sales",
      body: "Live orders, refunds, disputes, OXXO settlement queue (Conekta T+1/T+2) and Stripe payouts.",
      bullets: ["Badge tracks next order ID"],
      accent: "purple",
      anchor: "target-right",
    },
    {
      selector: "nav-fans",
      kicker: "MENU · 05 / 09",
      title: "Fans",
      body: "Scan logs for LFPDPPP audit, consent records, repeat customers and cross-event activity.",
      bullets: ["30-day deletion-request SLA tracker"],
      accent: "purple",
      anchor: "target-right",
    },
    {
      selector: "nav-b2b",
      kicker: "MENU · 06 / 09",
      title: "B2B · Sponsored",
      body: "Sponsored-deal pipeline — leads, contracts, renewal forecast. The CRM-lite layer for the brands that pay flat fees.",
      bullets: ["Avg deal: US$ 3–15k / event", "Renewal forecast over next 90d"],
      accent: "purple",
      anchor: "target-right",
    },
    {
      selector: "nav-finance",
      kicker: "MENU · 07 / 09",
      title: "Finance",
      body: "The CFO view — GMV by business model, net, EBITDA proxy, IVA (16% MX), MXN vs USD breakdown, cash buffer days.",
      accent: "purple",
      anchor: "target-right",
    },
    {
      selector: "nav-operations",
      kicker: "MENU · 08 / 09",
      title: "Operations",
      body: "R2 usage + cost, face-index health, Worker observability and the job queue (watermarking, face-indexing, payouts).",
      bullets: ["Pink ! = something needs you", "Today: R2 bucket 78%"],
      accent: "pink",
      anchor: "target-right",
    },
    {
      selector: "nav-settings",
      kicker: "MENU · 09 / 09",
      title: "Settings",
      body: "Team admins + roles, API keys + webhooks, brand config — tagline, hero copy, featured photographer slots.",
      accent: "purple",
      anchor: "target-right",
    },
  ],
};

// ---------- hooks ----------

function useMousePosition(active: boolean) {
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  useEffect(() => {
    if (!active) return;
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

    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setRect(el.getBoundingClientRect()));
    };
    const t = window.setTimeout(update, 280);
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

const TIP_W = 340;
const TIP_GAP = 22;
const TIP_H_EST = 280;

type TooltipProps = {
  step: TourStep;
  index: number;
  total: number;
  mouse: { x: number; y: number };
  rect: DOMRect | null;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
};

function Tooltip({ step, index, total, mouse, rect, onPrev, onNext, onClose }: TooltipProps) {
  const accent = accentColor(step.accent);
  const wW = typeof window !== "undefined" ? window.innerWidth : 1440;
  const wH = typeof window !== "undefined" ? window.innerHeight : 900;

  let x: number, y: number;
  const anchor = step.anchor ?? "auto";

  if (anchor === "center" || !rect) {
    x = (wW - TIP_W) / 2;
    y = Math.max(80, (wH - TIP_H_EST) / 2);
  } else if (anchor === "target-right") {
    // Anchor X to the right of target; Y follows mouse softly,
    // clamped to viewport and biased to align near target top.
    x = rect.right + TIP_GAP;
    if (x + TIP_W > wW - 16) x = wW - 16 - TIP_W;
    const desiredY = mouse.y - TIP_H_EST / 3;
    y = Math.max(16, Math.min(desiredY, wH - 16 - TIP_H_EST));
    // If mouse hasn't drifted into target area yet, bias to target top.
    if (Math.abs(mouse.x - (rect.left + rect.width / 2)) > 200) {
      y = Math.max(16, Math.min(rect.top - 8, wH - 16 - TIP_H_EST));
    }
  } else if (anchor === "target-left") {
    x = rect.left - TIP_GAP - TIP_W;
    if (x < 16) x = 16;
    const desiredY = mouse.y - TIP_H_EST / 3;
    y = Math.max(16, Math.min(desiredY, wH - 16 - TIP_H_EST));
  } else {
    // auto: cursor-follow with edge flip
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
      border: `2px solid ${accent}`,
      boxShadow: `4px 4px 0 0 ${T.cyan}`,
      padding: 20,
      display: "flex", flexDirection: "column", gap: 12,
      pointerEvents: "auto",
      zIndex: 1010,
      transition: "left 200ms cubic-bezier(0.2, 0.8, 0.2, 1), top 200ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      animation: "fs-tour-pop 0.24s cubic-bezier(0.2, 0.8, 0.2, 1) both",
    }}>
      {/* corner brackets — small, cyan, dashboard-consistent */}
      <span style={{ position: "absolute", top: -1, left: -1, width: 12, height: 12, borderTop: `2px solid ${T.cyan}`, borderLeft: `2px solid ${T.cyan}` }} />
      <span style={{ position: "absolute", top: -1, right: -1, width: 12, height: 12, borderTop: `2px solid ${T.cyan}`, borderRight: `2px solid ${T.cyan}` }} />
      <span style={{ position: "absolute", bottom: -1, left: -1, width: 12, height: 12, borderBottom: `2px solid ${T.cyan}`, borderLeft: `2px solid ${T.cyan}` }} />
      <span style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderBottom: `2px solid ${T.cyan}`, borderRight: `2px solid ${T.cyan}` }} />

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontFamily: mono, fontSize: 10, fontWeight: 700, color: accent,
          border: `1.5px solid ${accent}`, padding: "3px 8px", letterSpacing: "0.14em",
        }}>{step.kicker}</span>
        <button
          onClick={onClose}
          style={{
            fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute,
            background: "transparent", border: `1px solid ${T.border}`,
            padding: "4px 8px", cursor: "pointer", letterSpacing: "0.16em",
          }}
        >SKIP · ESC</button>
      </div>

      {/* title */}
      <h3 style={{
        margin: 0, fontFamily: display, fontWeight: 700, fontSize: 20,
        letterSpacing: "-0.02em", lineHeight: 1.15, color: T.ink,
      }}>{step.title}</h3>

      {/* body */}
      <p style={{
        margin: 0, fontFamily: display, fontSize: 13, lineHeight: 1.55,
        color: T.inkSoft,
      }}>{step.body}</p>

      {/* bullets */}
      {step.bullets && step.bullets.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
          {step.bullets.map((b, i) => (
            <li key={i} style={{
              display: "flex", gap: 8, alignItems: "baseline",
              fontFamily: mono, fontSize: 11, color: T.inkSoft, letterSpacing: "0.02em", lineHeight: 1.4,
            }}>
              <span style={{ color: accent }}>▸</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {/* step pip indicator */}
      <div style={{ display: "flex", gap: 4, marginTop: 2, alignItems: "center" }}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} style={{
            width: i === index ? 18 : 6, height: 6,
            background: i === index ? accent : (i < index ? T.inkSoft : T.border),
            transition: "all 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
          }} />
        ))}
      </div>

      {/* nav buttons */}
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <button
          onClick={onPrev}
          disabled={index === 0}
          style={{
            flex: 1,
            fontFamily: mono, fontSize: 10, fontWeight: 700,
            color: index === 0 ? T.inkMute : T.inkSoft,
            background: "transparent", border: `1.5px solid ${T.border}`,
            padding: "9px 10px", letterSpacing: "0.18em",
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
              fontFamily: mono, fontSize: 10, fontWeight: 700,
              color: T.bg, background: T.cyan, border: `1.5px solid ${T.cyan}`,
              padding: "9px 10px", letterSpacing: "0.18em", cursor: "pointer",
              boxShadow: `3px 3px 0 0 ${T.purple}`, textTransform: "uppercase",
              transition: "transform 120ms, box-shadow 120ms",
            }}
          >Done ✓</button>
        ) : (
          <button
            onClick={onNext}
            className="fs-tour-cta"
            style={{
              flex: 1.6,
              fontFamily: mono, fontSize: 10, fontWeight: 700,
              color: T.bg, background: T.purple, border: `1.5px solid ${T.purple}`,
              padding: "9px 10px", letterSpacing: "0.18em", cursor: "pointer",
              boxShadow: `3px 3px 0 0 ${T.cyan}`, textTransform: "uppercase",
              transition: "transform 120ms, box-shadow 120ms",
            }}
          >Next ›</button>
        )}
      </div>
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
  const centered = current.anchor === "center";

  const mouse = useMousePosition(true);
  const rect = useTargetRect(centered ? null : current.selector, true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      else if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); setStep(s => Math.min(s + 1, total - 1)); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); setStep(s => Math.max(s - 1, 0)); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, total]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const accent = accentColor(current.accent);
  const wW = typeof window !== "undefined" ? window.innerWidth : 1440;
  const wH = typeof window !== "undefined" ? window.innerHeight : 900;

  // 4-strip dim around the target
  const PAD = 6;
  const t = rect ? Math.max(0, rect.top - PAD) : 0;
  const l = rect ? Math.max(0, rect.left - PAD) : 0;
  const r = rect ? Math.min(wW, rect.right + PAD) : 0;
  const b = rect ? Math.min(wH, rect.bottom + PAD) : 0;

  const dimStyle: React.CSSProperties = {
    position: "fixed",
    background: "rgba(6,6,10,0.55)",
    pointerEvents: "auto",
    transition: "all 240ms cubic-bezier(0.2, 0.8, 0.2, 1)",
  };

  return (
    <>
      <style>{`
        @keyframes fs-tour-pop {
          from { opacity: 0; transform: scale(0.97) translateY(4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        .fs-tour-cta:hover { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 0 ${T.cyan} !important; }
        .fs-tour-cta:active { transform: translate(0, 0); box-shadow: 2px 2px 0 0 ${T.cyan} !important; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "none" }}>
        {rect && !centered ? (
          <>
            <div style={{ ...dimStyle, left: 0, top: 0, right: 0, height: t }} onClick={onClose} />
            <div style={{ ...dimStyle, left: 0, top: t, width: l, height: b - t }} onClick={onClose} />
            <div style={{ ...dimStyle, left: r, top: t, right: 0, height: b - t }} onClick={onClose} />
            <div style={{ ...dimStyle, left: 0, top: b, right: 0, bottom: 0 }} onClick={onClose} />

            {/* highlight outline — subtle, dashboard-consistent */}
            <div style={{
              position: "fixed",
              left: l, top: t, width: r - l, height: b - t,
              border: `2px solid ${accent}`,
              boxShadow: `4px 4px 0 0 ${T.cyan}`,
              pointerEvents: "none",
              transition: "all 240ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}>
              <span style={{ position: "absolute", top: -2, left: -2, width: 12, height: 12, borderTop: `2px solid ${T.cyan}`, borderLeft: `2px solid ${T.cyan}` }} />
              <span style={{ position: "absolute", top: -2, right: -2, width: 12, height: 12, borderTop: `2px solid ${T.cyan}`, borderRight: `2px solid ${T.cyan}` }} />
              <span style={{ position: "absolute", bottom: -2, left: -2, width: 12, height: 12, borderBottom: `2px solid ${T.cyan}`, borderLeft: `2px solid ${T.cyan}` }} />
              <span style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, borderBottom: `2px solid ${T.cyan}`, borderRight: `2px solid ${T.cyan}` }} />
            </div>
          </>
        ) : (
          <div style={{ ...dimStyle, inset: 0 }} onClick={onClose} />
        )}

        <Tooltip
          step={current}
          index={step}
          total={total}
          mouse={mouse}
          rect={rect}
          onPrev={() => setStep(s => Math.max(s - 1, 0))}
          onNext={() => setStep(s => Math.min(s + 1, total - 1))}
          onClose={onClose}
        />
      </div>
    </>
  );
}
