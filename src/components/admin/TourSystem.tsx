"use client";

// FanSnap · Admin · Sidebar Nav Inspector
// Hover on the number badge of a sidebar item reveals a small, passive
// callout that explains the section. No dim, no scroll lock, no buttons —
// pointer-events: none so the tooltip never blocks the cursor.

import React from "react";
import { THEMES } from "@/lib/theme";

const T = {
  ...THEMES.dark,
  bgDeep: "#06060A",
  borderStrong: "#2E2E3D",
  green: "#3DDC97",
};

const mono = "var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";
const display = "var(--font-grotesk, 'Space Grotesk'), system-ui, sans-serif";

export type NavAccent = "purple" | "cyan" | "pink" | "green" | "muted";

export type NavInfo = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  bullets?: string[];
  accent?: NavAccent;
};

const accentColor = (a?: NavAccent) =>
  a === "cyan" ? T.cyan :
  a === "pink" ? T.pink :
  a === "green" ? T.green :
  a === "muted" ? T.inkMute :
  T.purple;

// ============================================================
// Per-section copy. Keyed by data-tour id.
// ============================================================

export const NAV_INFO: Record<string, NavInfo> = {
  "nav-overview": {
    id: "nav-overview",
    kicker: "01 · ACTIVE",
    title: "Overview",
    body: "You're here. Live KPIs, event heatmap, sale feed and 7-day GMV — the room-level view of the whole platform.",
    accent: "purple",
  },

  "nav-events": {
    id: "nav-events",
    kicker: "02 · EVENTS",
    title: "Events",
    body: "Every event in one filterable list. Drill into a row for its gallery, photographer roster, sales feed, refund queue and pricing overrides.",
    bullets: [
      "Filters: model · status · category · city · date range",
      "5 tabs per event: Summary / Crew / Photos / Sales / Config",
      "New-event wizard — 3 steps to launch",
      "Bulk: clone last event · invite past crew",
      "142 lifetime · ≈12 active per month at peak",
    ],
    accent: "purple",
  },

  "nav-photographers": {
    id: "nav-photographers",
    kicker: "03 · ROSTER",
    title: "Photographers",
    body: "The bank. Roster with FanSnap score, tier and per-event commission. Pending applications, featured-slot curation and the full payouts ledger.",
    bullets: [
      "FanSnap score: match × volume × rating ÷ refund (0–100)",
      "Tiers — Standard 50% · Pro 60% · VIP 35% + cachê",
      "Pending applications (marketplace self-serve) → approve/reject",
      "Featured: 6 homepage slots, drag to reorder",
      "Payouts: Stripe Connect, balance pending, refund holdback",
      "Per-event commission override + activity log audit trail",
    ],
    accent: "purple",
  },

  "nav-sales": {
    id: "nav-sales",
    kicker: "04 · SALES",
    title: "Sales",
    body: "Live orders, refunds, disputes, OXXO settlement queue (Conekta T+1/T+2) and Stripe payouts.",
    accent: "purple",
  },

  "nav-fans": {
    id: "nav-fans",
    kicker: "05 · FANS",
    title: "Fans",
    body: "Scan logs for LFPDPPP audit, consent records, repeat customers and cross-event activity.",
    bullets: ["30-day deletion-request SLA tracker"],
    accent: "purple",
  },

  "nav-b2b": {
    id: "nav-b2b",
    kicker: "LATER · FATIA 3",
    title: "B2B · Sponsored",
    body: "Sponsored-deal pipeline — leads, contracts, renewal forecast. CRM-lite for the brands paying flat fees.",
    accent: "muted",
  },

  "nav-finance": {
    id: "nav-finance",
    kicker: "LATER · FATIA 3",
    title: "Finance",
    body: "CFO view — GMV by model, EBITDA proxy, IVA (16% MX), MXN vs USD, cash-buffer days.",
    accent: "muted",
  },

  "nav-operations": {
    id: "nav-operations",
    kicker: "LATER · FATIA 4",
    title: "Operations",
    body: "Infra observability — R2 usage + cost, face-index health, Worker, job queue.",
    accent: "muted",
  },

  "nav-settings": {
    id: "nav-settings",
    kicker: "09 · CONFIG",
    title: "Settings",
    body: "Team admins + roles, API keys + webhooks, brand config — tagline, hero copy, featured photographer slots.",
    accent: "purple",
  },
};

// ============================================================
// Inspector
// ============================================================

const TIP_W = 360;
const GAP = 16;

export default function NavInspector({
  info, anchor,
}: { info: NavInfo | null; anchor: DOMRect | null }) {
  if (!info || !anchor) return null;

  const accent = accentColor(info.accent);
  const wW = typeof window !== "undefined" ? window.innerWidth : 1440;
  const wH = typeof window !== "undefined" ? window.innerHeight : 900;

  // Position: right of the anchor row, top-aligned (slight nudge up).
  let x = anchor.right + GAP;
  let y = anchor.top - 6;
  if (x + TIP_W > wW - 16) x = anchor.left - TIP_W - GAP;
  if (x < 16) x = 16;

  // Rough height estimate just to keep within viewport.
  const estH = info.bullets ? 100 + info.bullets.length * 22 + 80 : 200;
  if (y + estH > wH - 16) y = wH - 16 - estH;
  if (y < 16) y = 16;

  return (
    <>
      <style>{`
        @keyframes fs-inspector-in {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div style={{
        position: "fixed", left: x, top: y,
        width: TIP_W, maxWidth: "calc(100vw - 32px)",
        background: T.bgPaper,
        border: `2px solid ${accent}`,
        boxShadow: `4px 4px 0 0 ${T.cyan}`,
        padding: 18,
        display: "flex", flexDirection: "column", gap: 12,
        pointerEvents: "none",   // passive — never blocks cursor
        zIndex: 100,
        animation: "fs-inspector-in 0.16s ease-out both",
      }}>
        {/* corner brackets */}
        <span style={{ position: "absolute", top: -1, left: -1, width: 10, height: 10, borderTop: `2px solid ${T.cyan}`, borderLeft: `2px solid ${T.cyan}` }} />
        <span style={{ position: "absolute", top: -1, right: -1, width: 10, height: 10, borderTop: `2px solid ${T.cyan}`, borderRight: `2px solid ${T.cyan}` }} />
        <span style={{ position: "absolute", bottom: -1, left: -1, width: 10, height: 10, borderBottom: `2px solid ${T.cyan}`, borderLeft: `2px solid ${T.cyan}` }} />
        <span style={{ position: "absolute", bottom: -1, right: -1, width: 10, height: 10, borderBottom: `2px solid ${T.cyan}`, borderRight: `2px solid ${T.cyan}` }} />

        {/* kicker */}
        <span style={{
          alignSelf: "flex-start",
          fontFamily: mono, fontSize: 10, fontWeight: 700, color: accent,
          border: `1.5px solid ${accent}`, padding: "3px 8px", letterSpacing: "0.15em",
        }}>{info.kicker}</span>

        {/* title */}
        <h3 style={{
          margin: 0, fontFamily: display, fontWeight: 700, fontSize: 22,
          letterSpacing: "-0.02em", lineHeight: 1.15, color: T.ink,
        }}>{info.title}</h3>

        {/* body */}
        <p style={{
          margin: 0, fontFamily: display, fontSize: 13, lineHeight: 1.55,
          color: T.inkSoft,
        }}>{info.body}</p>

        {/* bullets */}
        {info.bullets && info.bullets.length > 0 && (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
            {info.bullets.map((b, i) => (
              <li key={i} style={{
                display: "flex", gap: 8, alignItems: "baseline",
                fontFamily: mono, fontSize: 11, color: T.inkSoft, letterSpacing: "0.02em", lineHeight: 1.45,
              }}>
                <span style={{ color: accent, flexShrink: 0 }}>▸</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
