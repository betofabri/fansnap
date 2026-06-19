"use client";

// FanSnap · Admin · Fan Detail (Slice 3)
// Festival-pass header with a real photo from the mock bank, KPIs,
// then 6 tabs (Overview default, then Scan Log / Purchases / Events /
// Consent LFPDPPP / Activity Log).

import React, { useState } from "react";
import {
  T, mono, display,
  AdminShell, CornerBrackets, SectionMarker, Pill,
} from "./_kit";

// ============================================================
// Photo helper — basePath-aware (next.config.ts has basePath:"/fansnap")
// ============================================================

const BASE_PATH = "/fansnap";
const mockPhoto = (evt: string, n: string) => `${BASE_PATH}/mock/events/${evt}/${n}.jpg`;

// ============================================================
// Mock fan profile
// ============================================================

const FAN = {
  code: "USR-810",
  name: "Carlos Ruiz",
  handle: null as string | null,
  email: "c.ruiz@protonmail.com",
  phone: "+52 55 8741 0042",
  city: "Ciudad de México",
  country: "MX",
  joinedAt: "JAN 14, 2026 — 14:32:08 GMT-6",
  joinedDisplay: "JAN 14, 2026",
  lastSeen: "12 MIN AGO",
  status: "LIVE" as "LIVE" | "ACTIVE" | "DORMANT" | "BLOCKED",
  tier: 4,                    // 1-5 stars
  segment: "VIP",
  topCategory: "Music" as "Music" | "Family" | "Esports" | "Culture" | "Corporate",
  // Profile photo — picked from the mock photo bank.
  photo: mockPhoto("bb-001", "12"),
  bio: "Music VIP from CDMX. Foro Sol regular, scanned every Bad Bunny date. Cross-tour buyer — prefers high-res digital + framed prints.",
  events: 12,
  photosOwned: 24,
  ltv: 1240,
  avgPerEvent: 103,
  matchSuccess: 92,           // %
  cartAbandon: 18,            // %
  selfieReject: 2,            // count lifetime
  refundCount: 0,
  crossEventScore: 78,        // composite (events × categories × consistency)
  scansLifetime: 28,
  consent: {
    state: "ACTIVE" as const,
    acceptedAt: "JAN 14, 2026 — 14:32:08 GMT-6",
    textVersion: "v2024.11.04 · LFPDPPP MX",
    selfieHash: "sha256:8a3f9e4c4b1d…f02a18",
    faceVector: "vec:b7c2e948d1…ab8e72",
    ipHistory: [
      { ip: "189.215.xx.xx", at: "MAY 28 · 14:32", city: "CDMX", network: "iPhone · LTE" },
      { ip: "189.215.xx.xx", at: "MAY 24 · 22:18", city: "CDMX", network: "iPhone · WiFi" },
      { ip: "189.215.xx.xx", at: "MAY 16 · 19:04", city: "CDMX", network: "iPhone · LTE" },
      { ip: "201.122.xx.xx", at: "APR 12 · 21:48", city: "CDMX", network: "iPad · WiFi" },
      { ip: "189.215.xx.xx", at: "MAR 22 · 16:31", city: "CDMX", network: "iPhone · LTE" },
    ],
  },
};

// Per-event behaviour breakdown (8 of his 12 events). Photo path reuses
// mock event photos so the cards look real.
const ATTENDED_EVENTS = [
  { code: "BB-001",  name: "BAD BUNNY · FORO SOL",        date: "MAY 28", matches: 14, photos: 6, gmvK: 0.32, category: "Music",   photo: mockPhoto("bb-001",  "07") },
  { code: "CCXP-26", name: "CCXP MX · DAY 02",            date: "MAY 28", matches: 8,  photos: 2, gmvK: 0.12, category: "Culture", photo: mockPhoto("ccxp-26", "05") },
  { code: "EDC-26",  name: "EDC MÉXICO · DAY 03",         date: "MAY 16", matches: 11, photos: 4, gmvK: 0.24, category: "Music",   photo: mockPhoto("edc-26",  "03") },
  { code: "KARO-12", name: "KAROL G · AZTECA",            date: "MAY 04", matches: 9,  photos: 3, gmvK: 0.18, category: "Music",   photo: mockPhoto("ccxp-26", "12") },
  { code: "LL-26",   name: "LOLLAPALOOZA MX · D01",       date: "APR 12", matches: 6,  photos: 0, gmvK: 0,    category: "Music",   photo: mockPhoto("ll-26",   "08") },
  { code: "AE-08",   name: "ARCA Y EUROPA · D01",         date: "MAR 22", matches: 7,  photos: 2, gmvK: 0.13, category: "Music",   photo: mockPhoto("ae-08",   "04") },
  { code: "ROSA-04", name: "ROSALÍA · MOTOMAMI",          date: "FEB 24", matches: 5,  photos: 1, gmvK: 0.06, category: "Music",   photo: mockPhoto("ll-26",   "11") },
  { code: "FCJ-22",  name: "FORÇA JOVEM · ANIVERSÁRIO",   date: "JAN 28", matches: 8,  photos: 2, gmvK: 0.09, category: "Music",   photo: mockPhoto("fcj-22",  "06") },
];

const CATEGORY_BREAKDOWN = [
  { c: "Music",   pct: 75, n: 9 },
  { c: "Culture", pct: 17, n: 2 },
  { c: "Esports", pct: 8,  n: 1 },
];

const SPEND_BY_MONTH = [
  { m: "JAN", v: 0   }, { m: "FEB", v: 60  }, { m: "MAR", v: 140 },
  { m: "APR", v: 280 }, { m: "MAY", v: 420 }, { m: "JUN", v: 340 },
];

const TOP_PHOTOGS = [
  { code: "PHOT-001", name: "Diego Morales",     initials: "DM", hue: 270, photos: 8, gmv: 420 },
  { code: "PHOT-002", name: "Ana Rivas",         initials: "AR", hue: 320, photos: 4, gmv: 240 },
  { code: "PHOT-088", name: "Luis Pereira",      initials: "LP", hue: 190, photos: 3, gmv: 160 },
  { code: "PHOT-104", name: "Sofia Zamora",      initials: "SZ", hue: 350, photos: 5, gmv: 280 },
  { code: "PHOT-014", name: "Miguel Huerta",     initials: "MH", hue: 215, photos: 4, gmv: 140 },
];

const SCAN_LOG = [
  { t: "MAY 28 · 14:32:08", evt: "BB-001",  matches: 14, consent: "C-2026-A8291", ip: "189.215.xx.xx", res: "MATCHED" },
  { t: "MAY 24 · 22:18:44", evt: "EDC-26",  matches: 11, consent: "C-2026-A8104", ip: "189.215.xx.xx", res: "MATCHED" },
  { t: "MAY 16 · 19:04:12", evt: "EDC-26",  matches: 0,  consent: "C-2026-A8104", ip: "189.215.xx.xx", res: "RETRY" },
  { t: "MAY 04 · 23:12:30", evt: "KARO-12", matches: 9,  consent: "C-2026-A7611", ip: "201.122.xx.xx", res: "MATCHED" },
  { t: "APR 12 · 21:48:02", evt: "LL-26",   matches: 6,  consent: "C-2026-A6920", ip: "201.122.xx.xx", res: "MATCHED" },
  { t: "MAR 22 · 16:31:18", evt: "AE-08",   matches: 7,  consent: "C-2026-A6411", ip: "189.215.xx.xx", res: "MATCHED" },
  { t: "FEB 24 · 22:09:51", evt: "ROSA-04", matches: 5,  consent: "C-2026-A5824", ip: "189.215.xx.xx", res: "MATCHED" },
  { t: "JAN 28 · 19:42:00", evt: "FCJ-22",  matches: 8,  consent: "C-2026-A5210", ip: "189.215.xx.xx", res: "MATCHED" },
];

const PURCHASES = [
  { ord: "ORD-08291", at: "MAY 28 · 14:38", evt: "BB-001",  items: 4, products: "4× Digital", total: 320, status: "PAID" },
  { ord: "ORD-08104", at: "MAY 24 · 22:42", evt: "EDC-26",  items: 4, products: "3× Digital + 1× Print", total: 240, status: "PAID" },
  { ord: "ORD-07611", at: "MAY 04 · 23:36", evt: "KARO-12", items: 3, products: "3× Digital", total: 180, status: "PAID" },
  { ord: "ORD-06411", at: "MAR 22 · 16:55", evt: "AE-08",   items: 2, products: "1× Digital + 1× Canvas", total: 130, status: "PAID" },
  { ord: "ORD-05824", at: "FEB 24 · 22:31", evt: "ROSA-04", items: 1, products: "1× Digital", total: 60,  status: "PAID" },
  { ord: "ORD-05210", at: "JAN 28 · 20:08", evt: "FCJ-22",  items: 2, products: "2× Digital", total: 90,  status: "PAID" },
  { ord: "ORD-04901", at: "JAN 14 · 14:55", evt: "BB-001",  items: 6, products: "4× Digital + 2× Print", total: 220, status: "PAID" },
];

const ACTIVITY = [
  { t: "TODAY · 14:32", who: "FAN", action: "SCAN",     detail: "BB-001 · 14 matches · 0 yet purchased" },
  { t: "MAY 26 · 09:14", who: "SYS", action: "SEGMENT", detail: "Promoted to VIP (3rd month ≥ $300)" },
  { t: "MAY 24 · 22:42", who: "FAN", action: "PURCHASE", detail: "ORD-08104 · EDC-26 · 4 photos · $240" },
  { t: "MAY 16 · 19:08", who: "SYS", action: "FLAG",    detail: "Selfie reject — bad lighting, retry succeeded" },
  { t: "APR 12 · 21:50", who: "FAN", action: "PURCHASE", detail: "ORD-06920 · LL-26 · 0 photos (decided not to buy)" },
  { t: "JAN 14 · 14:32", who: "SYS", action: "ONBOARD", detail: "Account created via BB-001 first scan · LFPDPPP v2024.11.04 accepted" },
];

// ============================================================
// Helpers
// ============================================================

const categoryColor = (c: string): string => {
  switch (c) {
    case "Music":     return T.pink;
    case "Family":    return T.green;
    case "Esports":   return T.purple;
    case "Culture":   return T.cyan;
    case "Corporate": return T.inkSoft;
    default:          return T.inkMute;
  }
};

const statusColor = (s: typeof FAN.status) =>
  s === "LIVE" ? T.pink : s === "ACTIVE" ? T.green : s === "BLOCKED" ? T.pink : T.inkMute;

function TierStars({ n, big = false }: { n: number; big?: boolean }) {
  const size = big ? 36 : 14;
  return (
    <span style={{
      display: "inline-flex", gap: big ? 4 : 2, fontFamily: mono, fontSize: size, lineHeight: 1,
    }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{
          color: i <= n ? T.purple : T.border,
          textShadow: big && i <= n ? `2px 2px 0 ${T.cyan}66` : (i <= n ? `1px 1px 0 ${T.cyan}33` : "none"),
        }}>★</span>
      ))}
    </span>
  );
}

function CategoryChip({ c }: { c: string }) {
  const color = categoryColor(c);
  return (
    <span style={{
      fontFamily: mono, fontSize: 10, fontWeight: 700, color,
      border: `1.5px solid ${color}`, padding: "3px 8px",
      letterSpacing: "0.14em", textTransform: "uppercase",
      width: "fit-content",
    }}>{c}</span>
  );
}

// ============================================================
// Profile header — festival pass with REAL photo
// ============================================================

function ProfileHeader() {
  return (
    <section style={{
      position: "relative",
      background: T.bgPaper,
      border: `2px solid ${T.border}`,
      margin: "32px 44px 0",
      padding: "32px 36px",
      overflow: "hidden",
    }}>
      <CornerBrackets color={T.cyan} size={16} thickness={2} inset={-1} />
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage:
          `linear-gradient(to right, ${T.gridLine} 1px, transparent 1px),
           linear-gradient(to bottom, ${T.gridLine} 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }} />

      {/* top strip — festival-pass perforation */}
      <div style={{
        position: "relative", display: "flex", justifyContent: "space-between",
        alignItems: "center", paddingBottom: 18,
        borderBottom: `2px dashed ${T.border}`,
      }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{
            fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.cyan,
            border: `1.5px solid ${T.cyan}`, padding: "3px 8px", letterSpacing: "0.18em",
          }}>{FAN.code}</span>
          <span style={{
            fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.purple,
            border: `1.5px solid ${T.purple}`, padding: "3px 8px", letterSpacing: "0.16em",
          }}>{FAN.segment}</span>
          <span style={{
            fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkSoft,
            border: `1px solid ${T.border}`, padding: "3px 7px", letterSpacing: "0.16em",
          }}>{FAN.country} · {FAN.city.toUpperCase()}</span>
          <Pill color={statusColor(FAN.status)} dot dotPulse>{FAN.status}</Pill>
        </div>
        <span style={{
          fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.2em",
        }}>JOINED {FAN.joinedDisplay} · LAST SEEN {FAN.lastSeen}</span>
      </div>

      {/* main row */}
      <div style={{
        position: "relative", display: "grid",
        gridTemplateColumns: "auto 1fr auto", gap: 32,
        paddingTop: 24, alignItems: "start",
      }}>
        {/* PHOTO from the mock bank */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 144, height: 144,
            border: `3px solid ${T.ink}`,
            boxShadow: `8px 8px 0 0 ${T.cyan}`,
            overflow: "hidden",
            background: T.bgAlt,
            position: "relative",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FAN.photo}
              alt={`${FAN.name} profile`}
              style={{
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center 30%",
                display: "block",
                filter: "saturate(1.05)",
              }}
            />
            {/* scanline mark in corner */}
            <span style={{
              position: "absolute", top: 8, right: 8,
              fontFamily: mono, fontSize: 8, fontWeight: 700, color: T.cyan,
              letterSpacing: "0.2em",
              background: "rgba(6,6,10,0.7)", padding: "2px 5px",
              border: `1px solid ${T.cyan}`,
            }}>FACE · MATCHED</span>
          </div>
          <CornerBrackets color={T.cyan} size={14} thickness={2} inset={-3} />
        </div>

        {/* center: name + bio */}
        <div style={{ minWidth: 0 }}>
          <h1 style={{
            margin: "4px 0 8px",
            fontFamily: display, fontSize: 44, fontWeight: 700,
            letterSpacing: "-0.04em", lineHeight: 1,
          }}>
            {FAN.name}
            <span style={{ color: T.purple }}>.</span>
          </h1>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
            fontFamily: mono, fontSize: 12, color: T.inkSoft, letterSpacing: "0.06em",
          }}>
            <span style={{ color: T.cyan }}>{FAN.email}</span>
            <span style={{ color: T.borderStrong }}>·</span>
            <span>{FAN.phone}</span>
          </div>

          <p style={{
            margin: "0 0 16px", color: T.inkSoft, fontSize: 14, lineHeight: 1.55, maxWidth: 540,
          }}>{FAN.bio}</p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <CategoryChip c={FAN.topCategory} />
            <span style={{
              fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.cyan,
              border: `1px solid ${T.cyan}`, padding: "3px 7px",
              letterSpacing: "0.16em", textTransform: "uppercase",
            }}>{FAN.events} EVENTS</span>
            <span style={{
              fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkSoft,
              border: `1px solid ${T.border}`, padding: "3px 7px",
              letterSpacing: "0.16em", textTransform: "uppercase",
            }}>{FAN.scansLifetime} SCANS</span>
          </div>
        </div>

        {/* right: tier block */}
        <div style={{
          background: T.bgAlt,
          border: `2px solid ${T.purple}`,
          boxShadow: `6px 6px 0 0 ${T.cyan}`,
          padding: "18px 28px 22px",
          textAlign: "center",
          minWidth: 220,
        }}>
          <div style={{
            fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.purple,
            letterSpacing: "0.2em", marginBottom: 8,
          }}>FAN TIER</div>
          <TierStars n={FAN.tier} big />
          <div style={{
            fontFamily: display, fontWeight: 700, fontSize: 32,
            color: T.ink, letterSpacing: "-0.04em", lineHeight: 1, marginTop: 14,
          }}>${FAN.ltv.toLocaleString()}</div>
          <div style={{
            fontFamily: mono, fontSize: 10, color: T.inkMute,
            letterSpacing: "0.16em", marginTop: 6, textTransform: "uppercase",
          }}>LIFETIME · ${FAN.avgPerEvent}/EVT</div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// KPI strip
// ============================================================

const DETAIL_KPIS = [
  { label: "LIFETIME GMV",   value: `$${FAN.ltv}`,        delta: `$${FAN.avgPerEvent} / evt`,   color: T.ink },
  { label: "EVENTS",         value: `${FAN.events}`,      delta: "Music ×9 · Culture ×2",       color: T.ink },
  { label: "PHOTOS OWNED",   value: `${FAN.photosOwned}`, delta: `from ${TOP_PHOTOGS.length} photographers`, color: T.ink },
  { label: "SCAN COUNT",     value: `${FAN.scansLifetime}`, delta: "since JAN 14",              color: T.cyan },
  { label: "MATCH SUCCESS",  value: `${FAN.matchSuccess}%`, delta: "Avg 14 photos / scan",      color: T.cyan },
  { label: "CART ABANDON",   value: `${FAN.cartAbandon}%`,  delta: "below 25% benchmark",       color: T.green },
  { label: "SELFIE REJECT",  value: `${FAN.selfieReject}`,  delta: "lifetime · retry OK",       color: T.ink },
  { label: "X-EVENT SCORE",  value: `${FAN.crossEventScore}`, delta: "consistency + breadth",   color: T.purple },
];

function KPIStrip() {
  return (
    <div style={{
      padding: "24px 44px",
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14,
    }}>
      {DETAIL_KPIS.map((k, i) => (
        <div key={k.label} style={{
          position: "relative", background: T.bgPaper,
          border: `2px solid ${T.border}`, padding: "14px 16px",
          display: "flex", flexDirection: "column", gap: 6,
          animation: "fs-fadeUp 0.4s ease-out both", animationDelay: `${i * 30}ms`,
        }}>
          <span style={{
            fontFamily: mono, fontSize: 9, fontWeight: 700, color: T.inkSoft,
            letterSpacing: "0.18em",
          }}>{k.label}</span>
          <span style={{
            fontFamily: display, fontWeight: 700, fontSize: 24,
            letterSpacing: "-0.03em", lineHeight: 1, color: k.color,
          }}>{k.value}</span>
          <span style={{ fontFamily: mono, fontSize: 9, color: T.inkMute, letterSpacing: "0.04em" }}>
            {k.delta}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Tabs
// ============================================================

type TabId = "overview" | "scans" | "purchases" | "events" | "consent" | "activity";

const TABS: { id: TabId; n: string; label: string }[] = [
  { id: "overview",  n: "T·1", label: "OVERVIEW" },
  { id: "scans",     n: "T·2", label: "SCAN LOG" },
  { id: "purchases", n: "T·3", label: "PURCHASES" },
  { id: "events",    n: "T·4", label: "EVENTS" },
  { id: "consent",   n: "T·5", label: "CONSENT · LFPDPPP" },
  { id: "activity",  n: "T·6", label: "ACTIVITY LOG" },
];

function TabNav({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <div style={{
      display: "flex", gap: 0,
      borderBottom: `2px solid ${T.border}`,
      padding: "0 44px",
      background: T.bg,
      position: "sticky", top: 64, zIndex: 10,
    }}>
      {TABS.map(t => {
        const on = t.id === active;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} className="fs-tab"
            style={{
              position: "relative",
              display: "flex", alignItems: "center", gap: 8,
              padding: "16px 18px",
              fontFamily: mono, fontSize: 11, fontWeight: 700,
              color: on ? T.ink : T.inkMute,
              background: "transparent", border: "none",
              borderBottom: on ? `2px solid ${T.purple}` : "2px solid transparent",
              cursor: "pointer", letterSpacing: "0.16em",
              transition: "color 120ms, border-color 120ms",
              marginBottom: -2,
            }}>
            <span style={{ color: on ? T.purple : T.inkMute, fontSize: 9 }}>{t.n}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Card primitive
// ============================================================

function Card({ n, title, children, span = 1 }: {
  n: string; title: string; children: React.ReactNode; span?: number;
}) {
  return (
    <section style={{
      position: "relative", background: T.bgPaper,
      border: `2px solid ${T.border}`, overflow: "hidden",
      gridColumn: `span ${span}`,
    }}>
      <CornerBrackets color={T.cyan} size={12} thickness={2} inset={-1} />
      <header style={{
        padding: "14px 20px", borderBottom: `2px solid ${T.border}`,
        background: T.bgAlt,
      }}>
        <SectionMarker n={n} label={title} />
      </header>
      <div style={{ padding: "22px 24px" }}>{children}</div>
    </section>
  );
}

// ============================================================
// Overview tab (rich) — events grid + categories + spend + photographers
// ============================================================

function EventsAttendedGrid() {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12,
    }}>
      {ATTENDED_EVENTS.map(e => (
        <div key={e.code} style={{
          position: "relative",
          border: `2px solid ${T.border}`,
          background: T.bgAlt, overflow: "hidden",
        }}>
          <div style={{
            position: "relative", aspectRatio: "4 / 3",
            background: T.bgDeep, overflow: "hidden",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.photo} alt={e.name}
              style={{
                width: "100%", height: "100%",
                objectFit: "cover",
                filter: "saturate(0.9) brightness(0.8)",
              }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, transparent 50%, rgba(6,6,10,0.85) 100%)",
            }} />
            <span style={{
              position: "absolute", top: 8, left: 8,
              fontFamily: mono, fontSize: 9, fontWeight: 700, color: T.cyan,
              border: `1.5px solid ${T.cyan}`, padding: "2px 6px",
              letterSpacing: "0.12em",
              background: "rgba(6,6,10,0.6)",
            }}>{e.code}</span>
            <span style={{
              position: "absolute", bottom: 8, left: 8, right: 8,
              fontFamily: display, fontSize: 11, fontWeight: 700, color: T.ink,
              textTransform: "uppercase", letterSpacing: "0.04em",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{e.name}</span>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            padding: "10px 12px", gap: 4,
            fontFamily: mono, fontSize: 9, color: T.inkMute, letterSpacing: "0.1em",
          }}>
            <div>
              <div style={{ color: T.inkMute }}>MATCHED</div>
              <div style={{ color: T.cyan, fontSize: 13, fontWeight: 700 }}>{e.matches}</div>
            </div>
            <div>
              <div style={{ color: T.inkMute }}>BOUGHT</div>
              <div style={{ color: e.photos > 0 ? T.ink : T.inkMute, fontSize: 13, fontWeight: 700 }}>
                {e.photos > 0 ? e.photos : "—"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: T.inkMute }}>GMV</div>
              <div style={{ color: e.gmvK > 0 ? T.ink : T.inkMute, fontSize: 13, fontWeight: 700 }}>
                {e.gmvK > 0 ? `$${(e.gmvK * 1000).toFixed(0)}` : "—"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryBreakdown() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {CATEGORY_BREAKDOWN.map(c => {
        const color = categoryColor(c.c);
        return (
          <div key={c.c} style={{ display: "grid", gridTemplateColumns: "84px 1fr 60px", gap: 12, alignItems: "center" }}>
            <CategoryChip c={c.c} />
            <div style={{ height: 14, background: T.border, position: "relative" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: `${c.pct}%`,
                background: color,
                border: `1px solid ${T.ink}`,
              }} />
            </div>
            <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: T.ink, textAlign: "right" }}>
              {c.pct}% <span style={{ color: T.inkMute, fontWeight: 400 }}>· {c.n}</span>
            </span>
          </div>
        );
      })}
      <div style={{
        marginTop: 8, paddingTop: 12, borderTop: `1px dashed ${T.border}`,
        fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.04em", lineHeight: 1.5,
      }}>
        ⇢ Music dominance. Consider pushing music-event invites + featured-shot upsells from his top photographers.
      </div>
    </div>
  );
}

function SpendChart() {
  const max = Math.max(...SPEND_BY_MONTH.map(d => d.v));
  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(${SPEND_BY_MONTH.length}, 1fr)`,
      gap: 12, alignItems: "end", height: 180, position: "relative",
    }}>
      {SPEND_BY_MONTH.map((d, i) => {
        const h = max > 0 ? (d.v / max) * 100 : 0;
        const peak = d.v === max && max > 0;
        return (
          <div key={d.m} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%",
          }}>
            <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
              <div style={{
                width: "100%", height: d.v > 0 ? `${h}%` : "4px",
                background: peak ? T.purple : T.cyan,
                border: `2px solid ${T.ink}`,
                boxShadow: peak ? `3px 3px 0 0 ${T.cyan}` : "none",
                position: "relative",
                opacity: d.v > 0 ? 1 : 0.4,
                animation: "fs-fadeUp 0.6s ease-out both", animationDelay: `${i * 60}ms`,
              }}>
                {d.v > 0 && (
                  <span style={{
                    position: "absolute", top: -22, left: 0, right: 0, textAlign: "center",
                    fontFamily: mono, fontSize: 10, fontWeight: 700,
                    color: peak ? T.purple : T.ink, letterSpacing: "0.02em",
                  }}>${d.v}</span>
                )}
              </div>
            </div>
            <span style={{
              fontFamily: mono, fontSize: 10, fontWeight: 700,
              color: peak ? T.purple : T.inkMute, letterSpacing: "0.15em",
            }}>{d.m}</span>
          </div>
        );
      })}
    </div>
  );
}

function TopPhotographers() {
  return (
    <div>
      {TOP_PHOTOGS.map((p, i) => (
        <div key={p.code} style={{
          display: "grid", gridTemplateColumns: "44px 1fr 80px 80px",
          padding: "12px 0", alignItems: "center", gap: 14,
          borderTop: i > 0 ? `1px dashed ${T.border}` : "none",
        }}>
          <div style={{
            width: 36, height: 36, flexShrink: 0,
            background: `hsl(${p.hue}, 55%, 32%)`,
            border: `2px solid ${T.ink}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: display, fontWeight: 700, fontSize: 13, color: T.ink,
          }}>{p.initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: display, fontSize: 13, fontWeight: 600,
              letterSpacing: "0.01em", lineHeight: 1.1,
            }}>{p.name}</div>
            <div style={{
              fontFamily: mono, fontSize: 10, color: T.inkMute,
              letterSpacing: "0.1em", marginTop: 3,
            }}>{p.code}</div>
          </div>
          <span style={{
            fontFamily: display, fontWeight: 600, fontSize: 16, color: T.ink, textAlign: "right",
          }}>{p.photos}</span>
          <span style={{
            fontFamily: mono, fontSize: 13, fontWeight: 700, color: T.ink, textAlign: "right",
          }}>${p.gmv}</span>
        </div>
      ))}
    </div>
  );
}

function OverviewTab() {
  return (
    <div style={{ padding: "26px 44px 48px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18 }}>
      <Card n="O·1" title="EVENTS ATTENDED · LATEST 8 OF 12" span={2}>
        <EventsAttendedGrid />
      </Card>

      <Card n="O·2" title="CATEGORY BREAKDOWN">
        <CategoryBreakdown />
      </Card>

      <Card n="O·3" title="MONTHLY SPEND · 6M">
        <SpendChart />
      </Card>

      <Card n="O·4" title="TOP PHOTOGRAPHERS · BOUGHT FROM" span={2}>
        <TopPhotographers />
      </Card>
    </div>
  );
}

// ============================================================
// Other tabs
// ============================================================

function ScanLogTab() {
  return (
    <div style={{ padding: "26px 44px 48px" }}>
      <Card n="S·1" title="SCAN AUDIT TRAIL · LFPDPPP COMPLIANT">
        <div style={{
          display: "grid", gridTemplateColumns: "200px 100px 80px 180px 130px 1fr",
          padding: "0 0 10px", gap: 12,
          fontFamily: mono, fontSize: 9, color: T.inkMute, letterSpacing: "0.18em",
          borderBottom: `2px solid ${T.border}`,
        }}>
          <span>TIMESTAMP (GMT-6)</span>
          <span>EVENT</span>
          <span style={{ textAlign: "right" }}>MATCHES</span>
          <span>CONSENT REF</span>
          <span>IP</span>
          <span>RESULT</span>
        </div>
        {SCAN_LOG.map((s, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "200px 100px 80px 180px 130px 1fr",
            padding: "12px 0", gap: 12, alignItems: "center",
            borderBottom: i < SCAN_LOG.length - 1 ? `1px dashed ${T.border}` : "none",
            fontFamily: mono, fontSize: 12,
          }}>
            <span style={{ color: T.cyan, letterSpacing: "0.02em" }}>{s.t}</span>
            <span style={{ color: T.purple, fontWeight: 700, letterSpacing: "0.06em" }}>{s.evt}</span>
            <span style={{ color: s.matches === 0 ? T.pink : T.ink, fontWeight: 700, textAlign: "right" }}>{s.matches}</span>
            <span style={{ color: T.inkSoft, letterSpacing: "0.04em" }}>{s.consent}</span>
            <span style={{ color: T.inkMute, letterSpacing: "0.04em" }}>{s.ip}</span>
            <span style={{
              color: s.res === "MATCHED" ? T.green : T.pink, fontWeight: 700, letterSpacing: "0.12em",
            }}>{s.res}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function PurchasesTab() {
  const total = PURCHASES.reduce((s, p) => s + p.total, 0);
  return (
    <div style={{ padding: "26px 44px 48px" }}>
      <Card n="P·1" title={`PURCHASE HISTORY · ${PURCHASES.length} ORDERS · $${total} LIFETIME`}>
        <div style={{
          display: "grid", gridTemplateColumns: "120px 140px 90px 1fr 90px 90px",
          padding: "0 0 10px", gap: 12,
          fontFamily: mono, fontSize: 9, color: T.inkMute, letterSpacing: "0.18em",
          borderBottom: `2px solid ${T.border}`,
        }}>
          <span>ORDER</span>
          <span>WHEN</span>
          <span>EVENT</span>
          <span>PRODUCTS</span>
          <span style={{ textAlign: "right" }}>TOTAL</span>
          <span>STATUS</span>
        </div>
        {PURCHASES.map((p, i) => (
          <div key={p.ord} style={{
            display: "grid", gridTemplateColumns: "120px 140px 90px 1fr 90px 90px",
            padding: "13px 0", gap: 12, alignItems: "center",
            borderBottom: i < PURCHASES.length - 1 ? `1px dashed ${T.border}` : "none",
          }}>
            <span style={{ fontFamily: mono, fontSize: 12, color: T.cyan, letterSpacing: "0.04em" }}>{p.ord}</span>
            <span style={{ fontFamily: mono, fontSize: 11, color: T.inkSoft, letterSpacing: "0.04em" }}>{p.at}</span>
            <span style={{
              fontFamily: mono, fontSize: 11, fontWeight: 700, color: T.purple,
              border: `1.5px solid ${T.purple}`, padding: "2px 6px", letterSpacing: "0.06em",
              width: "fit-content",
            }}>{p.evt}</span>
            <span style={{ fontFamily: display, fontSize: 13, color: T.ink }}>
              {p.products}
              <span style={{ color: T.inkMute, fontFamily: mono, fontSize: 11, marginLeft: 8 }}>· {p.items} item{p.items > 1 ? "s" : ""}</span>
            </span>
            <span style={{ fontFamily: display, fontSize: 16, fontWeight: 700, color: T.ink, textAlign: "right" }}>
              ${p.total}
            </span>
            <Pill color={T.green}>{p.status}</Pill>
          </div>
        ))}
      </Card>
    </div>
  );
}

function EventsTab() {
  return (
    <div style={{ padding: "26px 44px 48px" }}>
      <Card n="E·1" title="EVENTS ATTENDED · ALL 12">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {ATTENDED_EVENTS.map(e => (
            <div key={e.code} style={{
              position: "relative",
              border: `2px solid ${T.border}`, background: T.bgAlt,
              overflow: "hidden",
            }}>
              <div style={{ position: "relative", aspectRatio: "1 / 1", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.photo} alt={e.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, transparent 40%, rgba(6,6,10,0.9) 100%)",
                }} />
                <div style={{
                  position: "absolute", bottom: 10, left: 10, right: 10,
                }}>
                  <CategoryChip c={e.category} />
                  <div style={{
                    fontFamily: display, fontSize: 13, fontWeight: 700, color: T.ink,
                    marginTop: 6, lineHeight: 1.2, textTransform: "uppercase",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{e.name}</div>
                  <div style={{
                    fontFamily: mono, fontSize: 10, color: T.cyan,
                    letterSpacing: "0.12em", marginTop: 3,
                  }}>{e.code} · {e.date}</div>
                </div>
              </div>
              <div style={{
                padding: "10px 12px",
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: 4, fontFamily: mono, fontSize: 9, color: T.inkMute, letterSpacing: "0.1em",
              }}>
                <div>
                  <div>SCANS</div>
                  <div style={{ color: T.cyan, fontSize: 13, fontWeight: 700 }}>1</div>
                </div>
                <div>
                  <div>MATCH</div>
                  <div style={{ color: T.ink, fontSize: 13, fontWeight: 700 }}>{e.matches}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div>SPENT</div>
                  <div style={{ color: e.gmvK > 0 ? T.ink : T.inkMute, fontSize: 13, fontWeight: 700 }}>
                    {e.gmvK > 0 ? `$${(e.gmvK * 1000).toFixed(0)}` : "—"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ConsentTab() {
  return (
    <div style={{ padding: "26px 44px 48px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 22 }}>
      <Card n="L·1" title="CONSENT RECORD · LFPDPPP MX">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Pill color={T.green} dot>{FAN.consent.state}</Pill>
            <span style={{ fontFamily: mono, fontSize: 11, color: T.inkSoft, letterSpacing: "0.06em" }}>
              v{FAN.consent.textVersion}
            </span>
          </div>
          {[
            { label: "ACCEPTED AT",     value: FAN.consent.acceptedAt },
            { label: "SELFIE HASH",     value: FAN.consent.selfieHash, mono: true },
            { label: "FACE VECTOR HASH", value: FAN.consent.faceVector, mono: true },
            { label: "DELETION REQUEST", value: "NONE · clean record" },
          ].map(f => (
            <div key={f.label} style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14 }}>
              <span style={{
                fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.2em",
              }}>{f.label}</span>
              <span style={{
                fontFamily: f.mono ? mono : display,
                fontSize: f.mono ? 12 : 13, color: T.ink, letterSpacing: "0.04em",
              }}>{f.value}</span>
            </div>
          ))}

          <div style={{
            marginTop: 14, padding: "14px 16px",
            background: T.bgAlt, border: `1.5px dashed ${T.border}`,
            fontFamily: display, fontSize: 13, lineHeight: 1.55, color: T.inkSoft,
          }}>
            Stored biometric data is non-reversible (vector representation only). Original selfie is hashed and discarded
            within 24h of the scan, per LFPDPPP Art. 14 + FanSnap retention policy v2024.11.
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button style={{
              fontFamily: mono, fontSize: 11, fontWeight: 700, color: T.cyan,
              background: "transparent", border: `2px solid ${T.cyan}`,
              padding: "10px 14px", letterSpacing: "0.16em", cursor: "pointer",
            }}>EXPORT RECORD</button>
            <button style={{
              fontFamily: mono, fontSize: 11, fontWeight: 700, color: T.pink,
              background: "transparent", border: `2px solid ${T.pink}`,
              padding: "10px 14px", letterSpacing: "0.16em", cursor: "pointer",
            }}>FORCE DELETION ›</button>
          </div>
        </div>
      </Card>

      <Card n="L·2" title="IP HISTORY · LAST 5">
        {FAN.consent.ipHistory.map((h, i) => (
          <div key={i} style={{
            padding: "12px 0", borderBottom: i < FAN.consent.ipHistory.length - 1 ? `1px dashed ${T.border}` : "none",
          }}>
            <div style={{
              fontFamily: mono, fontSize: 12, fontWeight: 700, color: T.cyan, letterSpacing: "0.04em",
            }}>{h.ip}</div>
            <div style={{
              fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.06em", marginTop: 3,
            }}>{h.at} · {h.city} · {h.network}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function ActivityTab() {
  return (
    <div style={{ padding: "26px 44px 48px" }}>
      <Card n="A·1" title="ACTIVITY LOG · AUDIT TRAIL">
        {ACTIVITY.map((a, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "150px 50px 110px 1fr",
            padding: "13px 0", gap: 14, alignItems: "start",
            borderBottom: i < ACTIVITY.length - 1 ? `1px dashed ${T.border}` : "none",
            fontFamily: mono, fontSize: 12, lineHeight: 1.45,
          }}>
            <span style={{ color: T.cyan, letterSpacing: "0.04em" }}>{a.t}</span>
            <span style={{
              color: a.who === "SYS" ? T.purple : T.cyan,
              border: `1px solid ${a.who === "SYS" ? T.purple : T.cyan}`,
              padding: "0 4px", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em",
              textAlign: "center", height: 16, lineHeight: "14px", alignSelf: "start", marginTop: 2,
            }}>{a.who}</span>
            <span style={{
              color: a.action === "SCAN" || a.action === "PURCHASE" ? T.ink : T.inkSoft,
              fontWeight: 700, letterSpacing: "0.12em",
            }}>{a.action}</span>
            <span style={{ color: T.inkSoft }}>{a.detail}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ============================================================
// Default export
// ============================================================

export default function FanDetail({ code = FAN.code }: { code?: string }) {
  const [tab, setTab] = useState<TabId>("overview");

  // Single mocked fan regardless of code param (for now).
  void code;

  return (
    <AdminShell currentNav="nav-fans" breadcrumb={`FANS / ${FAN.code}`}>
      <ProfileHeader />
      <KPIStrip />
      <TabNav active={tab} onChange={setTab} />
      {tab === "overview"  && <OverviewTab />}
      {tab === "scans"     && <ScanLogTab />}
      {tab === "purchases" && <PurchasesTab />}
      {tab === "events"    && <EventsTab />}
      {tab === "consent"   && <ConsentTab />}
      {tab === "activity"  && <ActivityTab />}
    </AdminShell>
  );
}
