"use client";

// FanSnap · Admin · Fans (Slice 3)
// Scan logs, consent records, trust & safety queue, repeat-customer roster.

import React, { useMemo, useState } from "react";
import {
  T, mono, display,
  AdminShell, CornerBrackets, SectionMarker, Pill, StatusDot,
  Avatar, FilterCheckbox, FilterGroup, MiniKpi, SortHead,
} from "./_kit";

// ============================================================
// Types + mock data
// ============================================================

type Country = "MX" | "BR" | "AR" | "CO";
type FanActivity = "LIVE" | "ACTIVE" | "DORMANT" | "BLOCKED";
type Consent = "ACTIVE" | "WITHDRAWN" | "PENDING";
type Segment = "NEW" | "RETURNING" | "CROSS_EVENT" | "VIP";

type Fan = {
  code: string;
  name: string;
  initials: string;
  avatarHue: number;
  country: Country;
  joined: string;
  joinedSort: number;
  lastScan: string;
  lastScanMinutes: number; // 0 = scanning now, -1 = >30d
  events: number;
  photos: number;
  ltv: number;     // MXN
  consent: Consent;
  activity: FanActivity;
  segment: Segment;
  flagged?: "DELETION" | "DUPLICATE" | "SCRAPE";
};

const FANS: Fan[] = [
  { code: "USR-001",  name: "Mariana López",     initials: "ML", avatarHue: 320, country: "MX", joined: "MAR 12", joinedSort: 12, lastScan: "2 min ago",   lastScanMinutes: 2,    events: 8,  photos: 14, ltv: 480,   consent: "ACTIVE", activity: "LIVE",    segment: "RETURNING" },
  { code: "USR-204",  name: "Roberto Mendes",    initials: "RM", avatarHue: 220, country: "MX", joined: "APR 02", joinedSort: 32, lastScan: "8 min ago",   lastScanMinutes: 8,    events: 4,  photos: 6,  ltv: 220,   consent: "ACTIVE", activity: "LIVE",    segment: "RETURNING" },
  { code: "USR-810",  name: "Carlos Ruiz",       initials: "CR", avatarHue: 270, country: "MX", joined: "JAN 14", joinedSort: -16, lastScan: "12 min ago", lastScanMinutes: 12,   events: 12, photos: 24, ltv: 1240,  consent: "ACTIVE", activity: "LIVE",    segment: "VIP" },
  { code: "USR-1187", name: "Camila Souza",      initials: "CS", avatarHue: 40,  country: "BR", joined: "MAY 12", joinedSort: 12, lastScan: "28 min ago",  lastScanMinutes: 28,   events: 1,  photos: 3,  ltv: 84,    consent: "ACTIVE", activity: "ACTIVE",  segment: "NEW" },
  { code: "USR-088",  name: "Diego Hernández",   initials: "DH", avatarHue: 190, country: "MX", joined: "DEC 14", joinedSort: -106, lastScan: "1 day ago", lastScanMinutes: 1440, events: 5,  photos: 18, ltv: 620,   consent: "ACTIVE", activity: "ACTIVE",  segment: "RETURNING" },
  { code: "USR-301",  name: "Sofia Vargas",      initials: "SV", avatarHue: 350, country: "MX", joined: "NOV 22", joinedSort: -128, lastScan: "2 days ago", lastScanMinutes: 2880, events: 3, photos: 12, ltv: 340,   consent: "ACTIVE", activity: "ACTIVE",  segment: "RETURNING" },
  { code: "USR-1042", name: "Lucas Almeida",     initials: "LA", avatarHue: 145, country: "BR", joined: "OCT 08", joinedSort: -173, lastScan: "3 days ago", lastScanMinutes: 4320, events: 2, photos: 8,  ltv: 180,   consent: "ACTIVE", activity: "ACTIVE",  segment: "NEW" },
  { code: "USR-507",  name: "Andrea Castillo",   initials: "AC", avatarHue: 290, country: "MX", joined: "SEP 28", joinedSort: -183, lastScan: "5 days ago", lastScanMinutes: 7200, events: 4, photos: 14, ltv: 410,   consent: "ACTIVE", activity: "ACTIVE",  segment: "RETURNING" },
  { code: "USR-9842", name: "Bianca Costa",      initials: "BC", avatarHue: 15,  country: "BR", joined: "MAY 01", joinedSort: 1,    lastScan: "12 days ago", lastScanMinutes: 17280, events: 14, photos: 38, ltv: 1820, consent: "ACTIVE", activity: "DORMANT", segment: "CROSS_EVENT" },
  { code: "USR-3201", name: "Mateo Reyes",       initials: "MR", avatarHue: 100, country: "MX", joined: "MAY 28", joinedSort: 28,   lastScan: "18 days ago", lastScanMinutes: 25920, events: 8,  photos: 22, ltv: 980,   consent: "ACTIVE", activity: "DORMANT", segment: "CROSS_EVENT" },
  { code: "USR-2814", name: "Joaquín Ortiz",     initials: "JO", avatarHue: 50,  country: "AR", joined: "JUN 02", joinedSort: 33,   lastScan: "22 days ago", lastScanMinutes: 31680, events: 1, photos: 2,  ltv: 60,    consent: "ACTIVE", activity: "DORMANT", segment: "NEW" },
  { code: "USR-105",  name: "Valentina Cruz",    initials: "VC", avatarHue: 305, country: "MX", joined: "APR 20", joinedSort: -10,  lastScan: "28 days ago", lastScanMinutes: 40320, events: 3, photos: 6,  ltv: 240,   consent: "WITHDRAWN", activity: "DORMANT", segment: "RETURNING", flagged: "DELETION" },
  // Flagged accounts surfaced in the trust panel
  { code: "USR-8829", name: "Anon · descriptor dup", initials: "??", avatarHue: 0, country: "MX", joined: "MAY 28", joinedSort: 28, lastScan: "1 min ago", lastScanMinutes: 1,    events: 1, photos: 0, ltv: 0, consent: "ACTIVE", activity: "BLOCKED", segment: "NEW", flagged: "DUPLICATE" },
  { code: "USR-9203", name: "Anon · 7 events today", initials: "??", avatarHue: 0, country: "MX", joined: "MAY 27", joinedSort: 27, lastScan: "30 sec ago", lastScanMinutes: 0,    events: 7, photos: 0, ltv: 0, consent: "ACTIVE", activity: "LIVE",    segment: "NEW", flagged: "SCRAPE" },
];

// ============================================================
// Helpers
// ============================================================

const activityColor = (a: FanActivity) =>
  a === "LIVE" ? T.pink :
  a === "ACTIVE" ? T.green :
  a === "DORMANT" ? T.inkMute :
  T.pink;

const consentColor = (c: Consent) =>
  c === "ACTIVE" ? T.green :
  c === "WITHDRAWN" ? T.pink :
  T.purple;

// ============================================================
// Trust & safety panel
// ============================================================

const TRUST_ITEMS = [
  {
    color: T.purple, kicker: "LFPDPPP · SLA",
    title: "3 deletion requests pending",
    body: "USR-105 (8d), USR-7104 (14d), USR-3340 (22d). Must respond within 30 days.",
    cta: "REVIEW QUEUE",
  },
  {
    color: T.pink, kicker: "FRAUD · BOT",
    title: "2 duplicate selfie descriptors",
    body: "USR-8829 ↔ USR-8830 share a face vector hash. Auto-blocked, awaiting human review.",
    cta: "INVESTIGATE",
  },
  {
    color: T.pink, kicker: "SCRAPE · VOLUME",
    title: "5 fans scanning >5 events today",
    body: "USR-9203 (7), USR-9418 (6), USR-9520 (6), USR-9601 (6), USR-9710 (5). Possible automation.",
    cta: "INSPECT",
  },
];

function TrustPanel() {
  return (
    <div style={{
      padding: "0 44px",
      marginBottom: 28,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <SectionMarker n="T·S" label="TRUST & SAFETY · NEEDS ATTENTION" color={T.pink} />
        <span style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.18em" }}>
          10 OPEN · 4 ACKNOWLEDGED
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {TRUST_ITEMS.map((t, i) => (
          <div key={t.title} style={{
            position: "relative", background: T.bgPaper,
            border: `2px solid ${t.color}`, boxShadow: `4px 4px 0 0 ${T.cyan}`,
            padding: "20px 22px 18px",
            display: "flex", flexDirection: "column", gap: 10,
            animation: "fs-fadeUp 0.5s ease-out both", animationDelay: `${i * 70}ms`,
          }}>
            <CornerBrackets color={T.cyan} size={12} thickness={2} inset={-1} />
            <span style={{
              alignSelf: "flex-start",
              fontFamily: mono, fontSize: 10, fontWeight: 700, color: t.color,
              border: `1.5px solid ${t.color}`, padding: "3px 8px", letterSpacing: "0.16em",
            }}>{t.kicker}</span>
            <h3 style={{
              margin: 0, fontFamily: display, fontSize: 17, fontWeight: 700,
              letterSpacing: "-0.02em", lineHeight: 1.2, color: T.ink,
            }}>{t.title}</h3>
            <p style={{
              margin: 0, fontFamily: display, fontSize: 13, lineHeight: 1.5, color: T.inkSoft,
            }}>{t.body}</p>
            <button style={{
              alignSelf: "flex-start",
              fontFamily: mono, fontSize: 10, fontWeight: 700, color: t.color,
              background: "transparent", border: `1.5px solid ${t.color}`,
              padding: "6px 10px", letterSpacing: "0.16em", cursor: "pointer",
              marginTop: 4,
            }}>{t.cta} ›</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Filter rail
// ============================================================

type Filters = {
  search: string;
  activities: Set<FanActivity>;
  countries: Set<Country>;
  segments: Set<Segment>;
  consents: Set<Consent>;
};

const EMPTY_FILTERS: Filters = {
  search: "",
  activities: new Set(),
  countries: new Set(),
  segments: new Set(),
  consents: new Set(),
};

function FilterRail({ filters, set }: {
  filters: Filters;
  set: React.Dispatch<React.SetStateAction<Filters>>;
}) {
  const toggle = <K extends string>(key: keyof Filters, v: K) => {
    set(f => {
      const s = new Set(f[key] as Set<K>);
      if (s.has(v)) s.delete(v); else s.add(v);
      return { ...f, [key]: s };
    });
  };

  const hasAny =
    !!filters.search ||
    filters.activities.size + filters.countries.size +
    filters.segments.size + filters.consents.size > 0;

  return (
    <aside style={{
      width: 280, flexShrink: 0,
      background: T.bgPaper,
      border: `2px solid ${T.border}`,
      padding: "22px 22px 28px",
      position: "sticky", top: 88, alignSelf: "flex-start",
      maxHeight: "calc(100vh - 110px)", overflowY: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <SectionMarker n="F·1" label="FILTERS" />
        {hasAny && (
          <button onClick={() => set(EMPTY_FILTERS)}
            style={{
              fontFamily: mono, fontSize: 9, fontWeight: 700, color: T.pink,
              background: "transparent", border: `1.5px solid ${T.pink}`,
              padding: "3px 7px", letterSpacing: "0.18em", cursor: "pointer",
            }}>CLEAR</button>
        )}
      </div>

      <input type="text" placeholder="Search code or name…"
        value={filters.search}
        onChange={(e) => set(f => ({ ...f, search: e.target.value }))}
        style={{
          width: "100%",
          fontFamily: mono, fontSize: 12, color: T.ink,
          background: T.bg, border: `2px solid ${T.border}`,
          padding: "9px 11px", letterSpacing: "0.04em", outline: "none",
        }}
      />

      <FilterGroup n="01" title="ACTIVITY">
        {(["LIVE", "ACTIVE", "DORMANT", "BLOCKED"] as FanActivity[]).map(a => (
          <FilterCheckbox key={a} label={a} value={a} set={filters.activities}
            onToggle={(v) => toggle("activities", v)} color={activityColor(a)} />
        ))}
      </FilterGroup>

      <FilterGroup n="02" title="SEGMENT">
        {(["NEW", "RETURNING", "CROSS_EVENT", "VIP"] as Segment[]).map(s => (
          <FilterCheckbox key={s} label={s.replace("_", "-")} value={s} set={filters.segments}
            onToggle={(v) => toggle("segments", v)} color={s === "VIP" ? T.purple : T.cyan} />
        ))}
      </FilterGroup>

      <FilterGroup n="03" title="COUNTRY">
        {(["MX", "BR", "AR", "CO"] as Country[]).map(c => (
          <FilterCheckbox key={c}
            label={c === "MX" ? "México" : c === "BR" ? "Brasil" : c === "AR" ? "Argentina" : "Colombia"}
            value={c} set={filters.countries} onToggle={(v) => toggle("countries", v)} />
        ))}
      </FilterGroup>

      <FilterGroup n="04" title="CONSENT (LFPDPPP)">
        {(["ACTIVE", "WITHDRAWN", "PENDING"] as Consent[]).map(c => (
          <FilterCheckbox key={c} label={c} value={c} set={filters.consents}
            onToggle={(v) => toggle("consents", v)} color={consentColor(c)} />
        ))}
      </FilterGroup>
    </aside>
  );
}

// ============================================================
// Page header + KPIs
// ============================================================

function PageHeader() {
  return (
    <div style={{
      padding: "44px 44px 30px",
      borderBottom: `2px solid ${T.border}`,
      display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "end",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage:
          `linear-gradient(to right, ${T.gridLine} 1px, transparent 1px),
           linear-gradient(to bottom, ${T.gridLine} 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        maskImage: "linear-gradient(to right, black 0%, black 50%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, black 0%, black 50%, transparent 100%)",
      }} />
      <div style={{ position: "relative" }}>
        <SectionMarker n="05" label="CONSUMER" color={T.cyan} />
        <h1 style={{
          margin: "16px 0 12px",
          fontFamily: display, fontSize: 56, fontWeight: 700,
          letterSpacing: "-0.04em", lineHeight: 1, textTransform: "uppercase",
        }}>
          Fans<span style={{ color: T.purple }}>.</span>
        </h1>
        <p style={{
          margin: 0, color: T.inkSoft, fontSize: 17, lineHeight: 1.45, maxWidth: 580,
        }}>
          8,902 active this week · 1,341 today · LFPDPPP-compliant audit trail on every scan.
        </p>
      </div>
      <div style={{
        position: "relative", display: "flex", alignItems: "center", gap: 12,
      }}>
        <button style={{
          fontFamily: mono, fontSize: 11, fontWeight: 700, color: T.cyan,
          background: "transparent", border: `2px solid ${T.cyan}`,
          padding: "11px 16px", letterSpacing: "0.14em", textTransform: "uppercase",
          cursor: "pointer",
        }}>EXPORT AUDIT</button>
        <button style={{
          fontFamily: mono, fontSize: 11, fontWeight: 700, color: T.purple,
          background: "transparent", border: `2px solid ${T.purple}`,
          padding: "11px 16px", letterSpacing: "0.14em", textTransform: "uppercase",
          cursor: "pointer",
        }}>SCAN LOGS ›</button>
      </div>
    </div>
  );
}

function KPIRow() {
  const KPIS = [
    { label: "ACTIVE TODAY",  value: "1,341", unit: "FAN", delta: "+12% vs yesterday",       color: T.pink,   live: true },
    { label: "NEW THIS WEEK", value: "8,902", unit: "USR", delta: "CDMX +52% · SP +18%",     color: T.cyan },
    { label: "RETURN RATE",   value: "42%",   unit: "30D", delta: "+4 pp vs Q1",             color: T.purple },
    { label: "LFPDPPP SLA",   value: "3",     unit: "DEL", delta: "all within 30-day SLA",    color: T.green },
  ];
  return (
    <div style={{
      padding: "26px 44px 22px",
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18,
    }}>
      {KPIS.map((k, i) => (
        <MiniKpi key={k.label} {...k} index={i} />
      ))}
    </div>
  );
}

// ============================================================
// Table
// ============================================================

type SortKey = "name" | "joinedSort" | "lastScanMinutes" | "events" | "photos" | "ltv";

function FansTable({
  rows, sort, setSort,
}: {
  rows: Fan[];
  sort: { key: SortKey; dir: "asc" | "desc" };
  setSort: (s: { key: SortKey; dir: "asc" | "desc" }) => void;
}) {
  const onSort = (k: string) => {
    const key = k as SortKey;
    setSort(sort.key === key ? { key, dir: sort.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" });
  };

  return (
    <section style={{
      position: "relative", background: T.bgPaper,
      border: `2px solid ${T.border}`, overflow: "hidden",
    }}>
      <CornerBrackets color={T.cyan} size={14} thickness={2} inset={-1} />

      {/* head */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(260px, 1fr) 90px 110px 80px 80px 110px 110px 100px",
        padding: "16px 22px",
        background: T.bgAlt, borderBottom: `2px solid ${T.border}`,
        alignItems: "center", gap: 14,
      }}>
        <SortHead label="FAN" k="name" sort={sort} onSort={onSort} />
        <SortHead label="JOINED" k="joinedSort" sort={sort} onSort={onSort} />
        <SortHead label="LAST SCAN" k="lastScanMinutes" sort={sort} onSort={onSort} />
        <SortHead label="EVENTS" k="events" sort={sort} onSort={onSort} align="right" />
        <SortHead label="PHOTOS" k="photos" sort={sort} onSort={onSort} align="right" />
        <SortHead label="LTV (MXN)" k="ltv" sort={sort} onSort={onSort} align="right" />
        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute, letterSpacing: "0.18em" }}>CONSENT</span>
        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute, letterSpacing: "0.18em" }}>STATUS</span>
      </div>

      {/* rows */}
      <div>
        {rows.map((f, idx) => {
          const dim = f.activity === "DORMANT" || f.activity === "BLOCKED";
          const flagColor = f.flagged === "DELETION" ? T.purple : T.pink;
          return (
            <div key={f.code}
              className="fs-row"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(260px, 1fr) 90px 110px 80px 80px 110px 110px 100px",
                padding: "14px 22px", alignItems: "center", gap: 14,
                borderTop: idx > 0 ? `1px dashed ${T.border}` : "none",
                borderLeft: f.flagged ? `3px solid ${flagColor}` : "3px solid transparent",
                opacity: dim ? 0.62 : 1,
                animation: "fs-fadeUp 0.4s ease-out both",
                animationDelay: `${idx * 25}ms`,
              }}>
              {/* fan */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <Avatar initials={f.initials} hue={f.avatarHue} dim={dim} />
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: display, fontSize: 14, fontWeight: 600,
                    letterSpacing: "0.01em", lineHeight: 1.1,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    color: T.ink,
                  }}>{f.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                    <span style={{
                      fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.1em",
                    }}>{f.code}</span>
                    <span style={{
                      fontFamily: mono, fontSize: 9, color: T.inkMute,
                      border: `1px solid ${T.border}`, padding: "0 4px",
                      letterSpacing: "0.1em",
                    }}>{f.country}</span>
                    {f.segment === "VIP" && (
                      <span style={{
                        fontFamily: mono, fontSize: 9, fontWeight: 700, color: T.purple,
                        border: `1px solid ${T.purple}`, padding: "0 4px",
                        letterSpacing: "0.14em",
                      }}>VIP</span>
                    )}
                    {f.segment === "CROSS_EVENT" && (
                      <span style={{
                        fontFamily: mono, fontSize: 9, fontWeight: 700, color: T.cyan,
                        border: `1px solid ${T.cyan}`, padding: "0 4px",
                        letterSpacing: "0.14em",
                      }}>CROSS-EVT</span>
                    )}
                  </div>
                </div>
              </div>

              {/* joined */}
              <span style={{
                fontFamily: mono, fontSize: 12, color: T.inkSoft, letterSpacing: "0.06em",
              }}>{f.joined}</span>

              {/* last scan */}
              <span style={{
                fontFamily: mono, fontSize: 12,
                color: f.lastScanMinutes < 30 ? T.pink : f.lastScanMinutes < 1440 ? T.cyan : T.inkSoft,
                fontWeight: f.lastScanMinutes < 30 ? 700 : 400,
                letterSpacing: "0.04em",
              }}>{f.lastScan}</span>

              {/* events */}
              <span style={{
                fontFamily: display, fontWeight: 600, fontSize: 16,
                color: f.events === 0 ? T.inkMute : T.ink, textAlign: "right",
              }}>{f.events > 0 ? f.events : "—"}</span>

              {/* photos */}
              <span style={{
                fontFamily: mono, fontSize: 13, fontWeight: 700,
                color: f.photos === 0 ? T.inkMute : T.ink, textAlign: "right",
              }}>{f.photos > 0 ? f.photos : "—"}</span>

              {/* LTV */}
              <span style={{
                fontFamily: mono, fontSize: 13, fontWeight: 700,
                color: f.ltv === 0 ? T.inkMute : T.ink, textAlign: "right",
              }}>{f.ltv > 0 ? `$${f.ltv.toLocaleString()}` : "—"}</span>

              {/* consent */}
              <Pill color={consentColor(f.consent)}>{f.consent}</Pill>

              {/* status */}
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <Pill color={activityColor(f.activity)}
                  dot={f.activity === "LIVE"} dotPulse={f.activity === "LIVE"}>
                  {f.activity}
                </Pill>
              </div>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div style={{
            padding: "60px 22px", textAlign: "center",
            color: T.inkMute, fontFamily: mono, fontSize: 12, letterSpacing: "0.15em",
          }}>NO FANS MATCH THESE FILTERS</div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// Default export
// ============================================================

export default function FansList() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "lastScanMinutes", dir: "asc" });

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return FANS.filter(f => {
      if (q && !f.name.toLowerCase().includes(q) && !f.code.toLowerCase().includes(q)) return false;
      if (filters.activities.size && !filters.activities.has(f.activity)) return false;
      if (filters.countries.size && !filters.countries.has(f.country)) return false;
      if (filters.segments.size && !filters.segments.has(f.segment)) return false;
      if (filters.consents.size && !filters.consents.has(f.consent)) return false;
      return true;
    });
  }, [filters]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const sign = sort.dir === "desc" ? -1 : 1;
    arr.sort((a, b) => {
      if (sort.key === "name") return sign * a.name.localeCompare(b.name);
      return sign * ((a[sort.key] as number) - (b[sort.key] as number));
    });
    return arr;
  }, [filtered, sort]);

  return (
    <AdminShell currentNav="nav-fans" breadcrumb="FANS">
      <PageHeader />
      <KPIRow />
      <TrustPanel />

      <div style={{
        display: "grid", gridTemplateColumns: "280px 1fr",
        gap: 22, padding: "0 44px 44px", alignItems: "flex-start",
      }}>
        <FilterRail filters={filters} set={setFilters} />

        <div style={{ minWidth: 0 }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            marginBottom: 12,
            fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.15em",
          }}>
            <span>
              <span style={{ color: T.ink, fontWeight: 700 }}>{sorted.length}</span> OF {FANS.length} SHOWN
            </span>
            <span>SORTED BY {sort.key === "lastScanMinutes" ? "LAST SCAN" : sort.key === "joinedSort" ? "JOINED" : sort.key.toUpperCase()} {sort.dir === "desc" ? "▾" : "▴"}</span>
          </div>

          <FansTable rows={sorted} sort={sort} setSort={setSort} />
        </div>
      </div>
    </AdminShell>
  );
}
