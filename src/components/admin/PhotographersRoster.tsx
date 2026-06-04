"use client";

// FanSnap · Admin · Photographers Roster (Slice 2)
// The "bank" — filter rail + KPIs + sortable table + bulk actions.

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  T, mono, display,
  AdminShell, CornerBrackets, SectionMarker, Pill, StatusDot,
} from "./_kit";

// ============================================================
// Mock roster
// ============================================================

type Tier = "VIP" | "Pro" | "Std" | "Pending";
type Country = "MX" | "BR" | "AR";
type Specialty = "Music" | "Conventions" | "Sports" | "Parties" | "Corporate";
type RowStatus = "LIVE" | "ACTIVE" | "INACTIVE" | "BLOCKED" | "PENDING";

type Photog = {
  code: string;
  name: string;
  handle?: string;
  initials: string;
  avatarHue: number;     // 0-360 for the colored block
  tier: Tier;
  country: Country;
  specialties: Specialty[];
  events90d: number;
  matchRate: number;     // 0-100
  rating: number;        // 1.0-5.0 or 0 if none
  gmvK: number;          // thousands MXN
  score: number;         // 0-100
  status: RowStatus;
};

const ROSTER: Photog[] = [
  { code: "PHOT-001", name: "Diego Morales",      initials: "DM", avatarHue: 270, tier: "VIP", country: "MX", specialties: ["Music"],                  events90d: 12, matchRate: 92, rating: 4.9, gmvK: 98.2, score: 96, status: "LIVE" },
  { code: "PHOT-002", name: "Ana Rivas",          initials: "AR", avatarHue: 320, tier: "VIP", country: "MX", specialties: ["Conventions", "Corporate"], events90d: 18, matchRate: 88, rating: 4.8, gmvK: 84.6, score: 94, status: "ACTIVE" },
  { code: "PHOT-088", name: "Luis Pereira",       handle: "luis_lens", initials: "LP", avatarHue: 190, tier: "Pro", country: "MX", specialties: ["Music"],                  events90d: 9,  matchRate: 84, rating: 4.6, gmvK: 58.4, score: 91, status: "LIVE" },
  { code: "PHOT-129", name: "Camila Santos",      initials: "CS", avatarHue: 30,  tier: "Pro", country: "BR", specialties: ["Sports", "Music"],         events90d: 11, matchRate: 86, rating: 4.7, gmvK: 62.1, score: 90, status: "ACTIVE" },
  { code: "PHOT-014", name: "Miguel Huerta",      initials: "MH", avatarHue: 215, tier: "Pro", country: "MX", specialties: ["Music"],                  events90d: 8,  matchRate: 82, rating: 4.5, gmvK: 48.8, score: 88, status: "ACTIVE" },
  { code: "PHOT-104", name: "Sofia Zamora",       initials: "SZ", avatarHue: 350, tier: "Pro", country: "MX", specialties: ["Parties"],                events90d: 14, matchRate: 80, rating: 4.5, gmvK: 52.9, score: 86, status: "LIVE" },
  { code: "PHOT-209", name: "Mateus da Silva",    initials: "MS", avatarHue: 145, tier: "Pro", country: "BR", specialties: ["Conventions"],            events90d: 7,  matchRate: 78, rating: 4.4, gmvK: 39.4, score: 83, status: "ACTIVE" },
  { code: "PHOT-122", name: "Iván Cruz",          initials: "IC", avatarHue: 0,   tier: "Pro", country: "MX", specialties: ["Music"],                  events90d: 4,  matchRate: 76, rating: 4.5, gmvK: 18.4, score: 82, status: "INACTIVE" },
  { code: "PHOT-118", name: "Fernanda Vidal",     initials: "FV", avatarHue: 290, tier: "Std", country: "AR", specialties: ["Music"],                  events90d: 6,  matchRate: 74, rating: 4.3, gmvK: 24.5, score: 78, status: "ACTIVE" },
  { code: "PHOT-072", name: "Tomás Ríos",         initials: "TR", avatarHue: 50,  tier: "Std", country: "MX", specialties: ["Sports"],                 events90d: 5,  matchRate: 70, rating: 4.2, gmvK: 19.2, score: 74, status: "ACTIVE" },
  { code: "PHOT-188", name: "Bruno Klein",        initials: "BK", avatarHue: 175, tier: "Std", country: "BR", specialties: ["Parties", "Corporate"],   events90d: 4,  matchRate: 68, rating: 4.0, gmvK: 14.8, score: 70, status: "ACTIVE" },
  { code: "PHOT-256", name: "Lucía Mendoza",      initials: "LM", avatarHue: 230, tier: "Std", country: "MX", specialties: ["Corporate"],              events90d: 3,  matchRate: 66, rating: 3.9, gmvK: 11.4, score: 66, status: "ACTIVE" },
  { code: "PHOT-301", name: "Renata Lopes",       initials: "RL", avatarHue: 110, tier: "Pending", country: "BR", specialties: ["Music"],              events90d: 0,  matchRate: 0,  rating: 0,   gmvK: 0,    score: 0,  status: "PENDING" },
  { code: "PHOT-302", name: "Alex Núñez",         initials: "AN", avatarHue: 305, tier: "Pending", country: "MX", specialties: ["Sports"],             events90d: 0,  matchRate: 0,  rating: 0,   gmvK: 0,    score: 0,  status: "PENDING" },
  { code: "PHOT-066", name: "Paula Garza",        initials: "PG", avatarHue: 15,  tier: "VIP", country: "MX", specialties: ["Music"],                  events90d: 0,  matchRate: 0,  rating: 0,   gmvK: 0,    score: 0,  status: "BLOCKED" },
];

// ============================================================
// Helpers
// ============================================================

function tierColor(t: Tier) {
  if (t === "VIP") return T.purple;
  if (t === "Pro") return T.cyan;
  if (t === "Std") return T.inkSoft;
  return T.inkMute;
}

function statusColor(s: RowStatus) {
  if (s === "LIVE") return T.pink;
  if (s === "ACTIVE") return T.green;
  if (s === "PENDING") return T.purple;
  if (s === "BLOCKED") return T.pink;
  return T.inkMute;
}

// ============================================================
// Filter rail
// ============================================================

type Filters = {
  search: string;
  tiers: Set<Tier>;
  countries: Set<Country>;
  specialties: Set<Specialty>;
  statuses: Set<RowStatus>;
  minMatch: number;
  minScore: number;
};

const EMPTY_FILTERS: Filters = {
  search: "",
  tiers: new Set(),
  countries: new Set(),
  specialties: new Set(),
  statuses: new Set(),
  minMatch: 0,
  minScore: 0,
};

function FilterCheckbox<K extends string>({
  label, value, set, onToggle, color = T.purple,
}: { label: string; value: K; set: Set<K>; onToggle: (v: K) => void; color?: string }) {
  const checked = set.has(value);
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 9,
      padding: "5px 0", cursor: "pointer",
      fontFamily: display, fontSize: 13, fontWeight: 500,
      color: checked ? T.ink : T.inkSoft,
    }}>
      <span style={{
        width: 14, height: 14,
        border: `2px solid ${checked ? color : T.border}`,
        background: checked ? color : "transparent",
        display: "grid", placeItems: "center",
      }}>
        {checked && (
          <span style={{ width: 6, height: 6, background: T.bg, display: "block" }} />
        )}
      </span>
      <span>{label}</span>
    </label>
  );
}

function FilterGroup({
  n, title, children,
}: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      paddingTop: 18, paddingBottom: 18,
      borderTop: `1px dashed ${T.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
        <span style={{
          fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.purple,
          border: `1.5px solid ${T.purple}`, padding: "1px 6px", letterSpacing: "0.06em",
        }}>{n}</span>
        <span style={{
          fontFamily: mono, fontSize: 10, color: T.inkMute,
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Slider({
  label, value, onChange, color = T.purple,
}: { label: string; value: number; onChange: (n: number) => void; color?: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: display, fontSize: 13, color: T.inkSoft }}>{label}</span>
        <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{
        position: "relative", height: 4, background: T.border, marginBottom: 6,
      }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${value}%`, background: color,
        }} />
        <input
          type="range" min={0} max={100} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute", inset: -6, width: "100%", height: 16,
            opacity: 0, cursor: "pointer",
          }}
        />
        <div style={{
          position: "absolute", left: `calc(${value}% - 6px)`, top: -4,
          width: 12, height: 12, background: color,
          border: `2px solid ${T.ink}`, pointerEvents: "none",
        }} />
      </div>
    </div>
  );
}

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
    filters.tiers.size +
    filters.countries.size +
    filters.specialties.size +
    filters.statuses.size > 0 ||
    filters.minMatch > 0 ||
    filters.minScore > 0;

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
          <button
            onClick={() => set(EMPTY_FILTERS)}
            style={{
              fontFamily: mono, fontSize: 9, fontWeight: 700, color: T.pink,
              background: "transparent", border: `1.5px solid ${T.pink}`,
              padding: "3px 7px", letterSpacing: "0.18em", cursor: "pointer",
            }}>CLEAR</button>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search code or name…"
        value={filters.search}
        onChange={(e) => set(f => ({ ...f, search: e.target.value }))}
        style={{
          width: "100%",
          fontFamily: mono, fontSize: 12, color: T.ink,
          background: T.bg,
          border: `2px solid ${T.border}`,
          padding: "9px 11px", letterSpacing: "0.04em",
          outline: "none",
        }}
      />

      <FilterGroup n="01" title="TIER">
        {(["VIP", "Pro", "Std", "Pending"] as Tier[]).map(t => (
          <FilterCheckbox key={t} label={t} value={t} set={filters.tiers}
            onToggle={(v) => toggle("tiers", v)} color={tierColor(t)} />
        ))}
      </FilterGroup>

      <FilterGroup n="02" title="COUNTRY">
        {(["MX", "BR", "AR"] as Country[]).map(c => (
          <FilterCheckbox key={c} label={c === "MX" ? "México" : c === "BR" ? "Brasil" : "Argentina"}
            value={c} set={filters.countries} onToggle={(v) => toggle("countries", v)} />
        ))}
      </FilterGroup>

      <FilterGroup n="03" title="SPECIALTY">
        {(["Music", "Conventions", "Sports", "Parties", "Corporate"] as Specialty[]).map(s => (
          <FilterCheckbox key={s} label={s} value={s} set={filters.specialties}
            onToggle={(v) => toggle("specialties", v)} />
        ))}
      </FilterGroup>

      <FilterGroup n="04" title="STATUS">
        {(["LIVE", "ACTIVE", "INACTIVE", "BLOCKED", "PENDING"] as RowStatus[]).map(s => (
          <FilterCheckbox key={s} label={s} value={s} set={filters.statuses}
            onToggle={(v) => toggle("statuses", v)} color={statusColor(s)} />
        ))}
      </FilterGroup>

      <FilterGroup n="05" title="THRESHOLDS">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Slider label="Min match rate" value={filters.minMatch}
            onChange={(n) => set(f => ({ ...f, minMatch: n }))} color={T.cyan} />
          <Slider label="Min FanSnap score" value={filters.minScore}
            onChange={(n) => set(f => ({ ...f, minScore: n }))} color={T.purple} />
        </div>
      </FilterGroup>
    </aside>
  );
}

// ============================================================
// Avatar / Score bar
// ============================================================

function Avatar({ initials, hue, size = 40, dim = false }: { initials: string; hue: number; size?: number; dim?: boolean }) {
  return (
    <div style={{
      width: size, height: size, flexShrink: 0,
      background: `hsl(${hue}, ${dim ? 10 : 55}%, ${dim ? 22 : 32}%)`,
      border: `2px solid ${T.ink}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: display, fontWeight: 700, fontSize: size * 0.4, color: T.ink,
      letterSpacing: "-0.02em",
      opacity: dim ? 0.6 : 1,
    }}>{initials}</div>
  );
}

function ScoreBar({ score }: { score: number }) {
  if (score === 0) {
    return <span style={{ fontFamily: mono, fontSize: 12, color: T.inkMute, letterSpacing: "0.1em" }}>—</span>;
  }
  const tone = score >= 90 ? T.purple : score >= 80 ? T.cyan : score >= 70 ? T.inkSoft : T.inkMute;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{
        fontFamily: display, fontWeight: 700, fontSize: 18,
        color: tone, letterSpacing: "-0.02em", minWidth: 28,
      }}>{score}</span>
      <div style={{
        flex: 1, height: 5, background: T.border, position: "relative",
      }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${score}%`, background: tone,
        }} />
      </div>
    </div>
  );
}

// ============================================================
// Table
// ============================================================

type SortKey = "score" | "events90d" | "matchRate" | "rating" | "gmvK" | "name";

function SortHead({ label, k, sort, onSort, align = "left" }: {
  label: string; k: SortKey; sort: { key: SortKey; dir: "asc" | "desc" };
  onSort: (k: SortKey) => void; align?: "left" | "right";
}) {
  const active = sort.key === k;
  return (
    <button onClick={() => onSort(k)} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      justifyContent: align === "right" ? "flex-end" : "flex-start",
      fontFamily: mono, fontSize: 10, fontWeight: 700,
      color: active ? T.ink : T.inkMute, letterSpacing: "0.18em",
      background: "transparent", border: "none", padding: 0, cursor: "pointer",
      width: "100%", textAlign: align,
    }}>
      <span>{label}</span>
      <span style={{ width: 9, color: active ? T.cyan : "transparent", fontSize: 9 }}>
        {sort.dir === "desc" ? "▾" : "▴"}
      </span>
    </button>
  );
}

function RosterTable({
  rows, selected, setSelected, sort, setSort,
}: {
  rows: Photog[];
  selected: Set<string>;
  setSelected: React.Dispatch<React.SetStateAction<Set<string>>>;
  sort: { key: SortKey; dir: "asc" | "desc" };
  setSort: (s: { key: SortKey; dir: "asc" | "desc" }) => void;
}) {
  const onSort = (k: SortKey) => {
    setSort(sort.key === k ? { key: k, dir: sort.dir === "desc" ? "asc" : "desc" } : { key: k, dir: "desc" });
  };

  const allSelected = rows.length > 0 && rows.every(r => selected.has(r.code));

  return (
    <section style={{
      position: "relative", background: T.bgPaper,
      border: `2px solid ${T.border}`, overflow: "hidden",
    }}>
      <CornerBrackets color={T.cyan} size={14} thickness={2} inset={-1} />

      {/* head */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "44px 280px 80px 150px 70px 80px 90px 110px 1fr 90px",
        padding: "16px 22px",
        background: T.bgAlt, borderBottom: `2px solid ${T.border}`,
        alignItems: "center", gap: 10,
      }}>
        <label style={{ display: "flex", cursor: "pointer", justifyContent: "center" }}>
          <span style={{
            width: 14, height: 14,
            border: `2px solid ${allSelected ? T.purple : T.border}`,
            background: allSelected ? T.purple : "transparent",
            display: "grid", placeItems: "center",
          }}>
            {allSelected && <span style={{ width: 6, height: 6, background: T.bg }} />}
          </span>
          <input type="checkbox" checked={allSelected}
            onChange={() => {
              if (allSelected) setSelected(new Set());
              else setSelected(new Set(rows.map(r => r.code)));
            }}
            style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
          />
        </label>
        <SortHead label="PHOTOGRAPHER" k="name" sort={sort} onSort={onSort} />
        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute, letterSpacing: "0.18em" }}>TIER</span>
        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute, letterSpacing: "0.18em" }}>SPECIALTY</span>
        <SortHead label="90D EVT" k="events90d" sort={sort} onSort={onSort} align="right" />
        <SortHead label="MATCH" k="matchRate" sort={sort} onSort={onSort} align="right" />
        <SortHead label="RATING" k="rating" sort={sort} onSort={onSort} align="right" />
        <SortHead label="GMV" k="gmvK" sort={sort} onSort={onSort} align="right" />
        <SortHead label="FANSNAP SCORE" k="score" sort={sort} onSort={onSort} />
        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute, letterSpacing: "0.18em" }}>STATUS</span>
      </div>

      {/* rows */}
      <div>
        {rows.map((p, idx) => {
          const isSelected = selected.has(p.code);
          const dim = p.status === "BLOCKED" || p.status === "INACTIVE";
          return (
            <div
              key={p.code}
              className={`fs-row ${isSelected ? "fs-row-selected" : ""}`}
              style={{
                display: "grid",
                gridTemplateColumns: "44px 280px 80px 150px 70px 80px 90px 110px 1fr 90px",
                padding: "14px 22px", alignItems: "center", gap: 10,
                borderTop: idx > 0 ? `1px dashed ${T.border}` : "none",
                transition: "background 100ms",
                opacity: dim ? 0.55 : 1,
                animation: "fs-fadeUp 0.4s ease-out both",
                animationDelay: `${idx * 25}ms`,
              }}>
              {/* checkbox */}
              <label style={{ display: "flex", cursor: "pointer", justifyContent: "center" }}>
                <span style={{
                  width: 14, height: 14,
                  border: `2px solid ${isSelected ? T.purple : T.border}`,
                  background: isSelected ? T.purple : "transparent",
                  display: "grid", placeItems: "center",
                }}>
                  {isSelected && <span style={{ width: 6, height: 6, background: T.bg }} />}
                </span>
                <input type="checkbox" checked={isSelected}
                  onChange={() => setSelected(s => {
                    const next = new Set(s);
                    if (next.has(p.code)) next.delete(p.code); else next.add(p.code);
                    return next;
                  })}
                  style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
                />
              </label>

              {/* avatar + name + code */}
              <Link href={`/admin/photographers/${p.code}`}
                className="fs-link"
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  textDecoration: "none", color: T.ink,
                  transition: "color 100ms", minWidth: 0,
                }}>
                <Avatar initials={p.initials} hue={p.avatarHue} dim={dim} />
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: display, fontSize: 14, fontWeight: 600,
                    letterSpacing: "0.01em", lineHeight: 1.1,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {p.name}
                    {p.handle && (
                      <span style={{ color: T.inkMute, fontWeight: 400, marginLeft: 6 }}>
                        «{p.handle}»
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                    <span style={{
                      fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.1em",
                    }}>{p.code}</span>
                    <span style={{
                      fontFamily: mono, fontSize: 9, color: T.inkMute,
                      border: `1px solid ${T.border}`, padding: "0 4px",
                      letterSpacing: "0.1em",
                    }}>{p.country}</span>
                  </div>
                </div>
              </Link>

              {/* tier */}
              <span style={{
                fontFamily: mono, fontSize: 10, fontWeight: 700,
                color: tierColor(p.tier),
                border: `1.5px solid ${tierColor(p.tier)}`,
                padding: "3px 7px", letterSpacing: "0.16em",
                textTransform: "uppercase",
                width: "fit-content",
              }}>{p.tier}</span>

              {/* specialty */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {p.specialties.map(s => (
                  <span key={s} style={{
                    fontFamily: mono, fontSize: 9, fontWeight: 700,
                    color: T.inkSoft, border: `1px solid ${T.border}`,
                    padding: "2px 6px", letterSpacing: "0.1em",
                  }}>{s.toUpperCase()}</span>
                ))}
              </div>

              {/* events */}
              <span style={{
                fontFamily: display, fontWeight: 600, fontSize: 16,
                color: p.events90d === 0 ? T.inkMute : T.ink, textAlign: "right",
              }}>{p.events90d > 0 ? p.events90d : "—"}</span>

              {/* match */}
              <span style={{
                fontFamily: mono, fontSize: 13, fontWeight: 700,
                color: p.matchRate === 0 ? T.inkMute : T.ink, textAlign: "right",
              }}>{p.matchRate > 0 ? `${p.matchRate}%` : "—"}</span>

              {/* rating */}
              <span style={{
                fontFamily: mono, fontSize: 13, fontWeight: 700,
                color: p.rating === 0 ? T.inkMute : T.ink, textAlign: "right",
              }}>{p.rating > 0 ? `★ ${p.rating.toFixed(1)}` : "—"}</span>

              {/* GMV */}
              <span style={{
                fontFamily: mono, fontSize: 13, fontWeight: 700,
                color: p.gmvK === 0 ? T.inkMute : T.ink, textAlign: "right",
              }}>{p.gmvK > 0 ? `$${p.gmvK.toFixed(1)}K` : "—"}</span>

              {/* score */}
              <ScoreBar score={p.score} />

              {/* status */}
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <Pill color={statusColor(p.status)}
                  dot={p.status === "LIVE"} dotPulse={p.status === "LIVE"}>
                  {p.status}
                </Pill>
              </div>
            </div>
          );
        })}

        {rows.length === 0 && (
          <div style={{
            padding: "60px 22px", textAlign: "center",
            color: T.inkMute, fontFamily: mono, fontSize: 12, letterSpacing: "0.15em",
          }}>NO PHOTOGRAPHERS MATCH THESE FILTERS</div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// Bulk action bar (sticky)
// ============================================================

function BulkBar({ count, onClear }: { count: number; onClear: () => void }) {
  if (count === 0) return null;
  return (
    <div style={{
      position: "sticky", top: 70, zIndex: 20,
      background: T.bg,
      border: `2px solid ${T.purple}`,
      boxShadow: `4px 4px 0 0 ${T.cyan}`,
      padding: "12px 18px",
      display: "flex", alignItems: "center", gap: 14,
      marginBottom: 16,
      animation: "fs-fadeUp 0.3s ease-out both",
    }}>
      <span style={{
        fontFamily: display, fontWeight: 700, fontSize: 14, color: T.ink,
      }}>
        <span style={{ color: T.purple }}>{count}</span> selected
      </span>
      <span style={{ width: 1, height: 18, background: T.border, margin: "0 4px" }} />
      {[
        { label: "Bump tier",       color: T.purple },
        { label: "Invite to event", color: T.cyan },
        { label: "Onboard email",   color: T.cyan },
        { label: "Block / suspend", color: T.pink },
      ].map(a => (
        <button key={a.label} style={{
          fontFamily: mono, fontSize: 10, fontWeight: 700, color: a.color,
          background: "transparent", border: `1.5px solid ${a.color}`,
          padding: "6px 10px", letterSpacing: "0.16em", cursor: "pointer",
          textTransform: "uppercase",
        }}>{a.label}</button>
      ))}
      <div style={{ flex: 1 }} />
      <button onClick={onClear} style={{
        fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute,
        background: "transparent", border: `1.5px solid ${T.border}`,
        padding: "6px 10px", letterSpacing: "0.16em", cursor: "pointer",
      }}>CLEAR ×</button>
    </div>
  );
}

// ============================================================
// Page composition
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
        <SectionMarker n="03" label="THE BANK" color={T.cyan} />
        <h1 style={{
          margin: "16px 0 12px",
          fontFamily: display, fontSize: 56, fontWeight: 700,
          letterSpacing: "-0.04em", lineHeight: 1, textTransform: "uppercase",
        }}>
          Photographers<span style={{ color: T.purple }}>.</span>
        </h1>
        <p style={{
          margin: 0, color: T.inkSoft, fontSize: 17, lineHeight: 1.45, maxWidth: 620,
        }}>
          The roster — 142 in the bank, 23 live on the field, 14 pending review. Score, tier and commission live here.
        </p>
      </div>
      <div style={{
        position: "relative", display: "flex", alignItems: "center", gap: 12,
      }}>
        <Link href="/admin/photographers/pending" style={{
          fontFamily: mono, fontSize: 11, fontWeight: 700, color: T.purple,
          background: "transparent", border: `2px solid ${T.purple}`,
          padding: "11px 16px", letterSpacing: "0.14em", textTransform: "uppercase",
          cursor: "pointer", textDecoration: "none",
        }}>14 PENDING ›</Link>
        <button
          className="fs-cta-primary"
          style={{
            fontFamily: display, fontSize: 13, fontWeight: 700,
            color: T.bg, background: T.purple,
            border: `2px solid ${T.purple}`, padding: "11px 18px",
            letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer",
            boxShadow: `4px 4px 0 0 ${T.cyan}`,
            transition: "transform 120ms, box-shadow 120ms",
          }}>+ INVITE</button>
      </div>
    </div>
  );
}

const KPIS = [
  { label: "IN ROSTER",        value: "142", unit: "PHT",  delta: "+8 this month", color: T.ink },
  { label: "LIVE ON FIELD",    value: "23",  unit: "NOW",  delta: "5 BB-001 · 7 CCXP", color: T.pink, live: true },
  { label: "AVG FANSNAP SCORE", value: "76", unit: "/100", delta: "+2 vs Q1",       color: T.purple },
  { label: "FEATURED SLOTS",   value: "6/6", unit: "PIN",  delta: "All filled",     color: T.cyan },
];

function KPIRow() {
  return (
    <div style={{
      padding: "26px 44px 22px",
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18,
    }}>
      {KPIS.map((k, i) => (
        <div key={k.label} style={{
          position: "relative", background: T.bgPaper,
          border: `2px solid ${T.border}`, padding: "18px 20px 16px",
          display: "flex", flexDirection: "column", gap: 10,
          animation: "fs-fadeUp 0.5s ease-out both", animationDelay: `${i * 50}ms`,
        }}>
          <CornerBrackets color={T.cyan} size={11} thickness={2} inset={-1} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{
              fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkSoft,
              letterSpacing: "0.18em",
            }}>{k.label}</span>
            {k.live && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontFamily: mono, fontSize: 9, fontWeight: 700, color: T.pink,
                letterSpacing: "0.2em",
              }}>
                <StatusDot color={T.pink} size={6} /> LIVE
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{
              fontFamily: display, fontWeight: 700, fontSize: 38,
              letterSpacing: "-0.04em", lineHeight: 1, color: k.color,
            }}>{k.value}</span>
            <span style={{
              fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.18em",
            }}>{k.unit}</span>
          </div>
          <span style={{ fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.04em" }}>
            {k.delta}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Default export
// ============================================================

export default function PhotographersRoster() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "score", dir: "desc" });

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return ROSTER.filter(p => {
      if (q && !p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)
        && !(p.handle ?? "").toLowerCase().includes(q)) return false;
      if (filters.tiers.size && !filters.tiers.has(p.tier)) return false;
      if (filters.countries.size && !filters.countries.has(p.country)) return false;
      if (filters.specialties.size && !p.specialties.some(s => filters.specialties.has(s))) return false;
      if (filters.statuses.size && !filters.statuses.has(p.status)) return false;
      if (filters.minMatch > 0 && p.matchRate < filters.minMatch) return false;
      if (filters.minScore > 0 && p.score < filters.minScore) return false;
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
    <AdminShell currentNav="nav-photographers" breadcrumb="PHOTOGRAPHERS">
      <PageHeader />
      <KPIRow />

      <div style={{
        display: "grid", gridTemplateColumns: "280px 1fr",
        gap: 22, padding: "0 44px 44px", alignItems: "flex-start",
      }}>
        <FilterRail filters={filters} set={setFilters} />

        <div style={{ minWidth: 0 }}>
          <BulkBar count={selected.size} onClear={() => setSelected(new Set())} />

          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            marginBottom: 12,
            fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.15em",
          }}>
            <span>
              <span style={{ color: T.ink, fontWeight: 700 }}>{sorted.length}</span> OF {ROSTER.length} SHOWN
            </span>
            <span>SORTED BY {sort.key.toUpperCase()} {sort.dir === "desc" ? "▾" : "▴"}</span>
          </div>

          <RosterTable rows={sorted} selected={selected} setSelected={setSelected}
            sort={sort} setSort={setSort} />
        </div>
      </div>
    </AdminShell>
  );
}
