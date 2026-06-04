"use client";

// FanSnap · Admin · Photographer Detail (Slice 2)
// Festival-pass-style header + 6 tabs (Stats active, others stubbed).

import React, { useState } from "react";
import Link from "next/link";
import {
  T, mono, display,
  AdminShell, CornerBrackets, SectionMarker, Pill, StatusDot, GridBg,
} from "./_kit";

// ============================================================
// Mock photographer profile (would be loaded by code in real)
// ============================================================

const PHOTOG = {
  code: "PHOT-088",
  name: "Luis Pereira",
  handle: "luis_lens",
  initials: "LP",
  avatarHue: 190,
  tier: "Pro" as const,
  country: "MX",
  city: "Ciudad de México",
  joined: "AUG 2024",
  lastSeen: "2 MIN AGO",
  status: "LIVE" as const,
  specialties: ["Music", "Festival", "Live shows"],
  bio: "Live-music photographer based in CDMX. Crew on Bad Bunny World's Hottest Tour and resident shooter for Foro Sol since 2022.",
  scoreParts: {
    match: 84,    // %
    volume: 1202, // photos 90d
    rating: 4.6,
    refund: 1.2,  // %
  },
  score: 91,
  reliability: 88,
  paymentMethod: "STRIPE CONNECT · acct_1QXyZ…",
  taxId: "RFC · LPM920514XYZ",
  payoutBalance: 12480, // cents → display
  refundHoldback: 340,
};

// Stats — 12 month bar series, daily upload latency, fan rating histogram
const EVENTS_BY_MONTH = [
  { m: "JUN", v: 2 }, { m: "JUL", v: 1 }, { m: "AUG", v: 3 },
  { m: "SEP", v: 4 }, { m: "OCT", v: 3 }, { m: "NOV", v: 4 },
  { m: "DEC", v: 5 }, { m: "JAN", v: 3 }, { m: "FEB", v: 4 },
  { m: "MAR", v: 6 }, { m: "APR", v: 7 }, { m: "MAY", v: 9 },
];

const PHOTOS_VS_MATCHED = [
  { m: "JUN", up: 142, mt: 102 }, { m: "JUL", up: 88,  mt: 71 },
  { m: "AUG", up: 201, mt: 164 }, { m: "SEP", up: 320, mt: 268 },
  { m: "OCT", up: 244, mt: 198 }, { m: "NOV", up: 312, mt: 264 },
  { m: "DEC", up: 410, mt: 348 }, { m: "JAN", up: 198, mt: 161 },
  { m: "FEB", up: 268, mt: 232 }, { m: "MAR", up: 482, mt: 408 },
  { m: "APR", up: 588, mt: 502 }, { m: "MAY", up: 822, mt: 724 },
];

const RATING_HIST = [
  { r: 1, c: 8 }, { r: 2, c: 14 }, { r: 3, c: 41 }, { r: 4, c: 188 }, { r: 5, c: 412 },
];

const TOP_EVENTS = [
  { code: "BB-001",  name: "BAD BUNNY · FORO SOL",     gmvK: 14.2, photos: 612 },
  { code: "CCXP-26", name: "CCXP MX · DAY 02",          gmvK: 9.4,  photos: 408 },
  { code: "KARO-12", name: "KAROL G · ESTADIO AZTECA",  gmvK: 8.1,  photos: 312 },
  { code: "MAR-21",  name: "MARATÓN CDMX · 21K",        gmvK: 6.8,  photos: 248 },
  { code: "FCJ-22",  name: "FORÇA JOVEM · ANIVERSÁRIO", gmvK: 4.2,  photos: 188 },
];

const PAYOUTS = [
  { date: "MAY 28", ref: "TRF-088-MAY",  amount: 4820, status: "SCHEDULED", event: "BB-001 · CCXP-26" },
  { date: "MAY 14", ref: "TRF-088-MAY1", amount: 6240, status: "PAID",      event: "BB-001 ·  KARO-12" },
  { date: "APR 30", ref: "TRF-088-APR",  amount: 8120, status: "PAID",      event: "BB-001 · MAR-21" },
  { date: "APR 14", ref: "TRF-088-APR1", amount: 5340, status: "PAID",      event: "CCXP-26 · KARO-12" },
  { date: "MAR 30", ref: "TRF-088-MAR",  amount: 7610, status: "PAID",      event: "BB-001 · MAR-21" },
];

const ACTIVITY = [
  { t: "TODAY · 14:31",  who: "BF",  action: "PROMOTED",   detail: "Tier Std → Pro after BB-001 review" },
  { t: "MAY 26 · 09:14", who: "SYS", action: "SCORE",      detail: "FanSnap score 88 → 91" },
  { t: "MAY 20 · 18:02", who: "BF",  action: "FEATURED",   detail: "Pinned to homepage spotlight #3" },
  { t: "APR 12 · 11:08", who: "AD",  action: "PORTFOLIO",  detail: "5 sample shots approved" },
  { t: "AUG 14 · 16:42", who: "SYS", action: "ONBOARD",    detail: "Account created from BB-001 invite" },
];

// ============================================================
// Helpers
// ============================================================

type TierName = "VIP" | "Pro" | "Std" | "Pending";
type ProfileStatus = "LIVE" | "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING";

const tierColor = (t: TierName) => t === "VIP" ? T.purple : t === "Pro" ? T.cyan : T.inkSoft;
const statusColor = (s: ProfileStatus) =>
  s === "LIVE" ? T.pink : s === "ACTIVE" ? T.green : s === "PENDING" ? T.purple : s === "BLOCKED" ? T.pink : T.inkMute;

// ============================================================
// Avatar
// ============================================================

function BigAvatar({ initials, hue }: { initials: string; hue: number }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: 124, height: 124,
        background: `hsl(${hue}, 60%, 32%)`,
        border: `3px solid ${T.ink}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: display, fontWeight: 700, fontSize: 52, color: T.ink,
        letterSpacing: "-0.03em",
        boxShadow: `8px 8px 0 0 ${T.cyan}`,
      }}>
        {initials}
      </div>
      <CornerBrackets color={T.cyan} size={14} thickness={2} inset={-3} />
    </div>
  );
}

// ============================================================
// Festival-pass header
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
      <GridBg size={32} />

      {/* mono header strip — fake "festival pass" perforation */}
      <div style={{
        position: "relative", display: "flex", justifyContent: "space-between",
        alignItems: "center", paddingBottom: 18,
        borderBottom: `2px dashed ${T.border}`,
      }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{
            fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.cyan,
            border: `1.5px solid ${T.cyan}`, padding: "3px 8px", letterSpacing: "0.18em",
          }}>{PHOTOG.code}</span>
          <span style={{
            fontFamily: mono, fontSize: 10, fontWeight: 700, color: tierColor(PHOTOG.tier),
            border: `1.5px solid ${tierColor(PHOTOG.tier)}`, padding: "3px 8px",
            letterSpacing: "0.16em", textTransform: "uppercase",
          }}>TIER · {PHOTOG.tier}</span>
          <Pill color={statusColor(PHOTOG.status)} dot dotPulse>{PHOTOG.status}</Pill>
        </div>
        <span style={{
          fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.2em",
        }}>JOINED {PHOTOG.joined} · LAST SEEN {PHOTOG.lastSeen}</span>
      </div>

      {/* main row */}
      <div style={{
        position: "relative", display: "grid",
        gridTemplateColumns: "auto 1fr auto", gap: 32,
        paddingTop: 24, alignItems: "start",
      }}>
        <BigAvatar initials={PHOTOG.initials} hue={PHOTOG.avatarHue} />

        <div style={{ minWidth: 0 }}>
          <h1 style={{
            margin: "4px 0 4px",
            fontFamily: display, fontSize: 44, fontWeight: 700,
            letterSpacing: "-0.04em", lineHeight: 1,
          }}>
            {PHOTOG.name}
            <span style={{ color: T.purple }}>.</span>
          </h1>
          <div style={{
            fontFamily: mono, fontSize: 13, color: T.cyan, letterSpacing: "0.04em", marginBottom: 14,
          }}>«{PHOTOG.handle}»</div>

          <p style={{
            margin: "0 0 16px", color: T.inkSoft, fontSize: 14, lineHeight: 1.55, maxWidth: 540,
          }}>{PHOTOG.bio}</p>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {PHOTOG.specialties.map(s => (
              <span key={s} style={{
                fontFamily: mono, fontSize: 9, fontWeight: 700, color: T.inkSoft,
                border: `1px solid ${T.border}`, padding: "3px 7px",
                letterSpacing: "0.16em", textTransform: "uppercase",
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* score block */}
        <div style={{
          background: T.bgAlt,
          border: `2px solid ${T.purple}`,
          boxShadow: `6px 6px 0 0 ${T.cyan}`,
          padding: "18px 24px",
          textAlign: "center",
          minWidth: 200,
        }}>
          <div style={{
            fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.purple,
            letterSpacing: "0.2em", marginBottom: 6,
          }}>FANSNAP SCORE</div>
          <div style={{
            fontFamily: display, fontWeight: 700, fontSize: 84,
            color: T.purple, letterSpacing: "-0.06em", lineHeight: 1,
          }}>{PHOTOG.score}</div>
          <div style={{
            fontFamily: mono, fontSize: 10, color: T.inkMute,
            letterSpacing: "0.16em", marginTop: 8, textTransform: "uppercase",
          }}>
            MATCH {PHOTOG.scoreParts.match}% · ★ {PHOTOG.scoreParts.rating} · REFUND {PHOTOG.scoreParts.refund}%
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// KPI strip
// ============================================================

const DETAIL_KPIS = [
  { label: "LIFETIME GMV",   value: "$284K",  delta: "+$58K Q1",     color: T.ink },
  { label: "EVENTS COVERED", value: "47",     delta: "12 last 90d",  color: T.ink },
  { label: "PHOTOS UPLOAD",  value: "4,288",  delta: "1.2K last 90d", color: T.ink },
  { label: "MATCH RATE",     value: "84%",    delta: "+3 vs Q1",     color: T.cyan },
  { label: "AVG RATING",     value: "4.6",    delta: "663 reviews",  color: T.ink },
  { label: "REFUND RATE",    value: "1.2%",   delta: "low risk",     color: T.green },
  { label: "TIME TO UPLOAD", value: "T+4h",   delta: "p95 · 11h",    color: T.ink },
  { label: "PAYOUT BAL.",    value: "$12.4K", delta: "scheduled",    color: T.purple },
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

type TabId = "stats" | "profile" | "portfolio" | "commission" | "payouts" | "activity";

const TABS: { id: TabId; n: string; label: string }[] = [
  { id: "stats",      n: "T·1", label: "STATS" },
  { id: "profile",    n: "T·2", label: "PROFILE" },
  { id: "portfolio",  n: "T·3", label: "PORTFOLIO" },
  { id: "commission", n: "T·4", label: "COMMISSION" },
  { id: "payouts",    n: "T·5", label: "PAYOUTS" },
  { id: "activity",   n: "T·6", label: "ACTIVITY LOG" },
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
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className="fs-tab"
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
// Stats tab content (the rich one)
// ============================================================

function StatsCard({ n, title, children, span = 1 }: {
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

function EventsBarChart() {
  const max = Math.max(...EVENTS_BY_MONTH.map(d => d.v));
  return (
    <div style={{
      display: "grid", gridTemplateColumns: `repeat(${EVENTS_BY_MONTH.length}, 1fr)`,
      gap: 8, alignItems: "end", height: 160, position: "relative",
    }}>
      {EVENTS_BY_MONTH.map((d, i) => {
        const h = (d.v / max) * 100;
        const peak = d.v === max;
        return (
          <div key={d.m} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%",
          }}>
            <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
              <div style={{
                width: "100%", height: `${h}%`,
                background: peak ? T.purple : T.cyan,
                border: `2px solid ${T.ink}`,
                boxShadow: peak ? `3px 3px 0 0 ${T.cyan}` : "none",
                position: "relative",
                animation: "fs-fadeUp 0.6s ease-out both", animationDelay: `${i * 40}ms`,
              }}>
                {d.v >= 3 && (
                  <span style={{
                    position: "absolute", top: -22, left: 0, right: 0, textAlign: "center",
                    fontFamily: mono, fontSize: 10, fontWeight: 700,
                    color: peak ? T.purple : T.ink, letterSpacing: "0.04em",
                  }}>{d.v}</span>
                )}
              </div>
            </div>
            <span style={{
              fontFamily: mono, fontSize: 9, fontWeight: 700,
              color: peak ? T.purple : T.inkMute, letterSpacing: "0.15em",
            }}>{d.m}</span>
          </div>
        );
      })}
    </div>
  );
}

function PhotosVsMatchedLines() {
  const max = Math.max(...PHOTOS_VS_MATCHED.map(d => d.up));
  const W = 480, H = 160, PAD = 20;
  const stepX = (W - 2 * PAD) / (PHOTOS_VS_MATCHED.length - 1);
  const toY = (v: number) => H - PAD - ((v / max) * (H - 2 * PAD));
  const upPath = PHOTOS_VS_MATCHED.map((d, i) => `${i === 0 ? "M" : "L"}${PAD + i * stepX},${toY(d.up)}`).join(" ");
  const mtPath = PHOTOS_VS_MATCHED.map((d, i) => `${i === 0 ? "M" : "L"}${PAD + i * stepX},${toY(d.mt)}`).join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {/* axis */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={T.border} strokeWidth={2} />
        {/* uploads */}
        <path d={upPath} fill="none" stroke={T.cyan} strokeWidth={2.5} />
        {PHOTOS_VS_MATCHED.map((d, i) => (
          <circle key={`u${i}`} cx={PAD + i * stepX} cy={toY(d.up)} r={3} fill={T.cyan} stroke={T.bg} strokeWidth={1} />
        ))}
        {/* matched */}
        <path d={mtPath} fill="none" stroke={T.purple} strokeWidth={2.5} strokeDasharray="0" />
        {PHOTOS_VS_MATCHED.map((d, i) => (
          <circle key={`m${i}`} cx={PAD + i * stepX} cy={toY(d.mt)} r={3} fill={T.purple} stroke={T.bg} strokeWidth={1} />
        ))}
        {/* month labels (every other) */}
        {PHOTOS_VS_MATCHED.map((d, i) => i % 2 === 0 && (
          <text key={`l${i}`} x={PAD + i * stepX} y={H - 4}
            fontFamily="JetBrains Mono" fontSize={9} fill={T.inkMute} textAnchor="middle"
            letterSpacing="0.1em">{d.m}</text>
        ))}
      </svg>
      <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: mono, fontSize: 10, color: T.inkSoft, letterSpacing: "0.18em" }}>
          <span style={{ width: 12, height: 3, background: T.cyan }} /> UPLOADED
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: mono, fontSize: 10, color: T.inkSoft, letterSpacing: "0.18em" }}>
          <span style={{ width: 12, height: 3, background: T.purple }} /> FACE-MATCHED
        </span>
      </div>
    </div>
  );
}

function RatingHistogram() {
  const max = Math.max(...RATING_HIST.map(d => d.c));
  const total = RATING_HIST.reduce((s, d) => s + d.c, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {RATING_HIST.slice().reverse().map(d => {
        const pct = (d.c / max) * 100;
        const portion = ((d.c / total) * 100).toFixed(0);
        const color = d.r >= 4 ? T.cyan : d.r === 3 ? T.inkSoft : T.pink;
        return (
          <div key={d.r} style={{ display: "grid", gridTemplateColumns: "44px 1fr 60px", gap: 10, alignItems: "center" }}>
            <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: T.inkSoft, letterSpacing: "0.05em" }}>
              ★ {d.r}
            </span>
            <div style={{ height: 14, background: T.border, position: "relative" }}>
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`,
                background: color,
                border: `1px solid ${T.ink}`,
              }} />
            </div>
            <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: T.ink, textAlign: "right" }}>
              {d.c} <span style={{ color: T.inkMute, fontWeight: 400 }}>· {portion}%</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TopEventsTable() {
  return (
    <div>
      {TOP_EVENTS.map((e, i) => (
        <div key={e.code} style={{
          display: "grid", gridTemplateColumns: "84px 1fr 90px",
          padding: "12px 0", alignItems: "center", gap: 14,
          borderTop: i > 0 ? `1px dashed ${T.border}` : "none",
        }}>
          <span style={{
            fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.purple,
            border: `1.5px solid ${T.purple}`, padding: "2px 6px", letterSpacing: "0.06em",
            width: "fit-content",
          }}>{e.code}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: display, fontSize: 13, fontWeight: 600,
              letterSpacing: "0.01em", textTransform: "uppercase",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{e.name}</div>
            <div style={{ fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.1em", marginTop: 2 }}>
              {e.photos} photos
            </div>
          </div>
          <span style={{
            fontFamily: display, fontWeight: 700, fontSize: 18,
            color: T.ink, letterSpacing: "-0.02em", textAlign: "right",
          }}>${e.gmvK.toFixed(1)}K</span>
        </div>
      ))}
    </div>
  );
}

function StatsTab() {
  return (
    <div style={{
      padding: "26px 44px 48px",
      display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 18,
    }}>
      <StatsCard n="S·1" title="EVENTS COVERED · 12M">
        <EventsBarChart />
      </StatsCard>

      <StatsCard n="S·2" title="UPLOAD vs FACE-MATCHED">
        <PhotosVsMatchedLines />
      </StatsCard>

      <StatsCard n="S·3" title="FAN RATING DISTRIBUTION">
        <RatingHistogram />
      </StatsCard>

      <StatsCard n="S·4" title="TOP EVENTS · LIFETIME GMV">
        <TopEventsTable />
      </StatsCard>

      <StatsCard n="S·5" title="UPLOAD LATENCY" span={2}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18,
        }}>
          {[
            { label: "AVG",    value: "T+4h",   color: T.ink },
            { label: "P50",    value: "T+2h",   color: T.cyan },
            { label: "P95",    value: "T+11h",  color: T.purple },
            { label: "MISSED", value: "0",      color: T.green },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute, letterSpacing: "0.2em", marginBottom: 6 }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: display, fontWeight: 700, fontSize: 28,
                color: s.color, letterSpacing: "-0.03em", lineHeight: 1,
              }}>{s.value}</div>
            </div>
          ))}
        </div>
        <p style={{
          margin: "20px 0 0", paddingTop: 14, borderTop: `1px dashed ${T.border}`,
          fontFamily: display, fontSize: 13, lineHeight: 1.55, color: T.inkSoft,
        }}>
          Time between event end and first photo upload. Best in class is T+2h (live-ish gallery), p95 T+11h means even the rare slow batches land overnight.
        </p>
      </StatsCard>
    </div>
  );
}

// ============================================================
// Other tabs (stub but visually intact)
// ============================================================

function ProfileTab() {
  return (
    <div style={{ padding: "26px 44px 48px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 22 }}>
      <StatsCard n="P·1" title="BIO & CONTACT">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "FULL NAME",  value: "Luis Manuel Pereira Morales" },
            { label: "HANDLE",     value: "@luis_lens" },
            { label: "EMAIL",      value: "luis@pereira.photo" },
            { label: "PHONE",      value: "+52 55 1234 5678" },
            { label: "CITY",       value: "Ciudad de México, México" },
            { label: "JOINED",     value: "AUG 14, 2024" },
            { label: "INSTAGRAM",  value: "@luis_lens · 42.1K" },
          ].map(f => (
            <div key={f.label} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 14 }}>
              <span style={{ fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.2em" }}>{f.label}</span>
              <span style={{ fontFamily: display, fontSize: 13, color: T.ink }}>{f.value}</span>
            </div>
          ))}
        </div>
      </StatsCard>
      <StatsCard n="P·2" title="PAYMENT & TAX">
        <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: mono, fontSize: 11, color: T.inkSoft, letterSpacing: "0.04em" }}>
          <div>
            <div style={{ color: T.inkMute, fontSize: 10, letterSpacing: "0.2em", marginBottom: 4 }}>STRIPE CONNECT</div>
            <div>{PHOTOG.paymentMethod}</div>
          </div>
          <div>
            <div style={{ color: T.inkMute, fontSize: 10, letterSpacing: "0.2em", marginBottom: 4 }}>TAX ID (MX)</div>
            <div>{PHOTOG.taxId}</div>
          </div>
          <div>
            <div style={{ color: T.inkMute, fontSize: 10, letterSpacing: "0.2em", marginBottom: 4 }}>CREDENTIALS</div>
            <div style={{ color: T.green }}>✓ ID verified · ✓ Press pass · ✓ NDA signed</div>
          </div>
        </div>
      </StatsCard>
    </div>
  );
}

function PortfolioTab() {
  // Mock 6 hue-colored "photo" tiles
  const tiles = Array.from({ length: 9 }, (_, i) => ({ id: i, hue: (i * 47 + 190) % 360, approved: i < 5 }));
  return (
    <div style={{ padding: "26px 44px 48px" }}>
      <StatsCard n="R·1" title="PORTFOLIO · APPROVED SAMPLES">
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14,
        }}>
          {tiles.map(t => (
            <div key={t.id} style={{
              position: "relative", aspectRatio: "3 / 2",
              background: `linear-gradient(135deg, hsl(${t.hue}, 50%, 28%), hsl(${(t.hue + 40) % 360}, 50%, 18%))`,
              border: `2px solid ${T.border}`,
              display: "flex", alignItems: "flex-end", padding: 10,
            }}>
              <CornerBrackets color={t.approved ? T.cyan : T.inkMute} size={10} thickness={2} inset={-1} />
              <div style={{
                fontFamily: mono, fontSize: 9, color: t.approved ? T.cyan : T.inkMute,
                letterSpacing: "0.18em", fontWeight: 700,
                background: "rgba(6,6,10,0.65)", padding: "3px 7px",
              }}>
                {t.approved ? "✓ APPROVED" : "PENDING"}
              </div>
            </div>
          ))}
        </div>
      </StatsCard>
    </div>
  );
}

function CommissionTab() {
  return (
    <div style={{ padding: "26px 44px 48px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 22 }}>
      <StatsCard n="C·1" title="COMMISSION CONFIG · CURRENT">
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.2em", marginBottom: 8 }}>TIER</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["Standard", "Pro", "VIP"] as const).map((tier, i) => {
                const on = i === 1; // Pro
                return (
                  <button key={tier} style={{
                    flex: 1, fontFamily: mono, fontSize: 11, fontWeight: 700,
                    color: on ? T.bg : T.inkSoft,
                    background: on ? T.cyan : "transparent",
                    border: `2px solid ${on ? T.cyan : T.border}`,
                    padding: "9px 12px", letterSpacing: "0.16em",
                    cursor: "pointer", textTransform: "uppercase",
                  }}>{tier}</button>
                );
              })}
            </div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.2em", marginBottom: 8 }}>
              <span>COMMISSION RATE</span>
              <span style={{ color: T.cyan, fontWeight: 700, fontSize: 12 }}>60%</span>
            </div>
            <div style={{ position: "relative", height: 6, background: T.border }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "60%", background: T.cyan }} />
              <div style={{ position: "absolute", left: "calc(60% - 7px)", top: -4, width: 14, height: 14, background: T.cyan, border: `2px solid ${T.ink}` }} />
            </div>
            <div style={{ fontFamily: mono, fontSize: 9, color: T.inkMute, letterSpacing: "0.15em", marginTop: 6 }}>
              Pro default. Photographer keeps 60%, platform 40%.
            </div>
          </div>
          <div>
            <div style={{ fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.2em", marginBottom: 6 }}>FIXED FEE (CACHÊ)</div>
            <div style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: T.inkMute }}>$0 MXN</div>
            <div style={{ fontFamily: mono, fontSize: 9, color: T.inkMute, letterSpacing: "0.04em", marginTop: 4 }}>
              VIP only — leave 0 for Pro tier
            </div>
          </div>
          <div style={{ borderTop: `1px dashed ${T.border}`, paddingTop: 16 }}>
            <button style={{
              fontFamily: display, fontSize: 13, fontWeight: 700,
              color: T.bg, background: T.purple,
              border: `2px solid ${T.purple}`, padding: "11px 18px",
              letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer",
              boxShadow: `4px 4px 0 0 ${T.cyan}`,
            }}>SAVE COMMISSION</button>
          </div>
        </div>
      </StatsCard>
      <StatsCard n="C·2" title="PER-EVENT OVERRIDES">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { code: "BB-001", rate: "65%", note: "VIP guest crew" },
            { code: "CCXP-26", rate: "55%", note: "Official partner discount" },
          ].map(o => (
            <div key={o.code} style={{
              display: "grid", gridTemplateColumns: "70px 1fr 50px", gap: 10, alignItems: "center",
              padding: "10px 12px", border: `2px solid ${T.border}`, background: T.bgAlt,
            }}>
              <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.purple, border: `1.5px solid ${T.purple}`, padding: "2px 6px", letterSpacing: "0.06em" }}>{o.code}</span>
              <span style={{ fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.04em" }}>{o.note}</span>
              <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: T.cyan, textAlign: "right" }}>{o.rate}</span>
            </div>
          ))}
          <button style={{
            fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.purple,
            background: "transparent", border: `1.5px dashed ${T.purple}`,
            padding: "10px 12px", letterSpacing: "0.16em", cursor: "pointer",
          }}>+ ADD OVERRIDE</button>
        </div>
      </StatsCard>
    </div>
  );
}

function PayoutsTab() {
  return (
    <div style={{ padding: "26px 44px 48px" }}>
      <StatsCard n="Y·1" title="PAYOUT LEDGER">
        <div>
          <div style={{
            display: "grid", gridTemplateColumns: "80px 140px 1fr 100px 110px",
            padding: "0 0 10px", gap: 14,
            fontFamily: mono, fontSize: 9, color: T.inkMute, letterSpacing: "0.18em",
            borderBottom: `2px solid ${T.border}`,
          }}>
            <span>DATE</span><span>REF</span><span>EVENT(S)</span><span style={{ textAlign: "right" }}>AMOUNT</span><span>STATUS</span>
          </div>
          {PAYOUTS.map((p, i) => (
            <div key={p.ref} style={{
              display: "grid", gridTemplateColumns: "80px 140px 1fr 100px 110px",
              padding: "12px 0", gap: 14, alignItems: "center",
              borderBottom: i < PAYOUTS.length - 1 ? `1px dashed ${T.border}` : "none",
            }}>
              <span style={{ fontFamily: mono, fontSize: 12, color: T.cyan, letterSpacing: "0.04em" }}>{p.date}</span>
              <span style={{ fontFamily: mono, fontSize: 11, color: T.inkSoft, letterSpacing: "0.04em" }}>{p.ref}</span>
              <span style={{ fontFamily: mono, fontSize: 11, color: T.inkSoft, letterSpacing: "0.04em" }}>{p.event}</span>
              <span style={{ fontFamily: display, fontSize: 16, fontWeight: 700, color: T.ink, textAlign: "right" }}>
                ${(p.amount / 100).toLocaleString()}
              </span>
              <Pill color={p.status === "PAID" ? T.green : T.cyan}>{p.status}</Pill>
            </div>
          ))}
        </div>
      </StatsCard>
    </div>
  );
}

function ActivityTab() {
  return (
    <div style={{ padding: "26px 44px 48px" }}>
      <StatsCard n="L·1" title="ACTIVITY LOG · AUDIT TRAIL">
        <div>
          {ACTIVITY.map((a, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "140px 40px 100px 1fr",
              padding: "13px 0", gap: 14, alignItems: "start",
              borderBottom: i < ACTIVITY.length - 1 ? `1px dashed ${T.border}` : "none",
              fontFamily: mono, fontSize: 12, lineHeight: 1.45,
            }}>
              <span style={{ color: T.cyan, letterSpacing: "0.04em" }}>{a.t}</span>
              <span style={{
                color: a.who === "SYS" ? T.purple : T.inkSoft,
                border: `1px solid ${a.who === "SYS" ? T.purple : T.border}`,
                padding: "0 4px", fontSize: 9, fontWeight: 700, letterSpacing: "0.16em",
                textAlign: "center", height: 16, lineHeight: "14px", alignSelf: "start", marginTop: 2,
              }}>{a.who}</span>
              <span style={{
                color: a.action === "PROMOTED" || a.action === "FEATURED" ? T.cyan : T.inkSoft,
                fontWeight: 700, letterSpacing: "0.12em",
              }}>{a.action}</span>
              <span style={{ color: T.inkSoft }}>{a.detail}</span>
            </div>
          ))}
        </div>
      </StatsCard>
    </div>
  );
}

// ============================================================
// Default export
// ============================================================

export default function PhotographerDetail({ code = PHOTOG.code }: { code?: string }) {
  const [tab, setTab] = useState<TabId>("stats");

  // Single mocked photographer regardless of code param (for now).
  void code;

  return (
    <AdminShell currentNav="nav-photographers" breadcrumb={`PHOTOGRAPHERS / ${PHOTOG.code}`}>
      <ProfileHeader />
      <KPIStrip />
      <TabNav active={tab} onChange={setTab} />
      {tab === "stats"      && <StatsTab />}
      {tab === "profile"    && <ProfileTab />}
      {tab === "portfolio"  && <PortfolioTab />}
      {tab === "commission" && <CommissionTab />}
      {tab === "payouts"    && <PayoutsTab />}
      {tab === "activity"   && <ActivityTab />}
    </AdminShell>
  );
}
