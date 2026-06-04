"use client";

// FanSnap · Admin · Events List (Slice 3)
// 142 lifetime events, filterable by model / status / category / city / date.

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  T, mono, display,
  AdminShell, CornerBrackets, SectionMarker, Pill,
  FilterCheckbox, FilterGroup, MiniKpi, SortHead,
} from "./_kit";

// ============================================================
// Types + mock data
// ============================================================

type BizModel = "OFF" | "MKT" | "SPO";
type EvtStatus = "LIVE" | "SCHEDULED" | "INDEXING" | "UPLOADING" | "ARCHIVED";
type Category = "Music" | "Conventions" | "Sports" | "Parties" | "Corporate";
type City = "CDMX" | "MTY" | "GDL" | "SP" | "BOG";

type Event = {
  code: string;
  name: string;
  venue: string;
  city: City;
  cityFull: string;
  model: BizModel;
  category: Category;
  date: string;       // display date "MAY 28"
  dateSort: number;   // sort key (days from epoch-ish)
  photogs: number;
  photos: number;
  matchRate: number;  // 0-100 or 0 if no data
  gmvK: number;
  status: EvtStatus;
};

const EVENTS: Event[] = [
  { code: "BB-001",  name: "BAD BUNNY · WORLD'S HOTTEST TOUR", venue: "FORO SOL",                city: "CDMX", cityFull: "Ciudad de México", model: "OFF", category: "Music",       date: "MAY 28", dateSort: 28,  photogs: 5, photos: 2841, matchRate: 91, gmvK: 42.8, status: "LIVE" },
  { code: "CCXP-26", name: "CCXP MX · DAY 02",                  venue: "CITIBANAMEX",             city: "CDMX", cityFull: "Ciudad de México", model: "OFF", category: "Conventions", date: "MAY 28", dateSort: 28,  photogs: 7, photos: 1908, matchRate: 84, gmvK: 18.1, status: "LIVE" },
  { code: "ANIM-08", name: "ANIME FRIENDS MX · DAY 01",         venue: "WTC",                     city: "CDMX", cityFull: "Ciudad de México", model: "SPO", category: "Conventions", date: "MAY 28", dateSort: 28,  photogs: 4, photos: 921,  matchRate: 72, gmvK: 0,    status: "LIVE" },
  { code: "MAR-21",  name: "MARATÓN CDMX · 21K",                venue: "RUTA",                    city: "CDMX", cityFull: "Ciudad de México", model: "OFF", category: "Sports",      date: "MAY 26", dateSort: 26,  photogs: 4, photos: 1208, matchRate: 78, gmvK: 9.4,  status: "INDEXING" },
  { code: "KARO-12", name: "KAROL G · MAÑANA SERÁ BONITO",      venue: "ESTADIO AZTECA",          city: "CDMX", cityFull: "Ciudad de México", model: "OFF", category: "Music",       date: "JUN 12", dateSort: 43,  photogs: 3, photos: 612,  matchRate: 82, gmvK: 6.2,  status: "INDEXING" },
  { code: "ROSA-04", name: "ROSALÍA · MOTOMAMI · MX LEG",       venue: "AUDITORIO NACIONAL",      city: "CDMX", cityFull: "Ciudad de México", model: "MKT", category: "Music",       date: "JUN 14", dateSort: 45,  photogs: 2, photos: 0,    matchRate: 0,  gmvK: 0,    status: "SCHEDULED" },
  { code: "LL-26",   name: "LOLLAPALOOZA MX · DAY 01",          venue: "BOSQUE DE CHAPULTEPEC",   city: "CDMX", cityFull: "Ciudad de México", model: "OFF", category: "Music",       date: "JUN 28", dateSort: 59,  photogs: 0, photos: 0,    matchRate: 0,  gmvK: 0,    status: "SCHEDULED" },
  { code: "AE-08",   name: "ARCA Y EUROPA · DAY 01",            venue: "ARENA CDMX",              city: "CDMX", cityFull: "Ciudad de México", model: "MKT", category: "Music",       date: "JUL 04", dateSort: 65,  photogs: 0, photos: 0,    matchRate: 0,  gmvK: 0,    status: "SCHEDULED" },
  { code: "EDC-26",  name: "EDC MÉXICO · DAY 03",               venue: "AUTÓDROMO HERMANOS R.",   city: "CDMX", cityFull: "Ciudad de México", model: "OFF", category: "Music",       date: "MAY 16", dateSort: 16,  photogs: 9, photos: 4012, matchRate: 88, gmvK: 68.4, status: "ARCHIVED" },
  { code: "CC-26",   name: "COMIC CON CDMX · DAY 01",           venue: "WTC",                     city: "CDMX", cityFull: "Ciudad de México", model: "OFF", category: "Conventions", date: "MAR 22", dateSort: -38, photogs: 6, photos: 2208, matchRate: 80, gmvK: 32.8, status: "ARCHIVED" },
  { code: "MX-MTN",  name: "MARATÓN MONTERREY · DAY 01",        venue: "RUTA",                    city: "MTY",  cityFull: "Monterrey",         model: "OFF", category: "Sports",      date: "MAY 04", dateSort: 4,   photogs: 3, photos: 988,  matchRate: 74, gmvK: 7.8,  status: "ARCHIVED" },
  { code: "FCJ-22",  name: "FORÇA JOVEM · ANIVERSÁRIO",         venue: "ALLIANZ PARQUE",          city: "SP",   cityFull: "São Paulo",         model: "OFF", category: "Music",       date: "APR 14", dateSort: -14, photogs: 5, photos: 1408, matchRate: 76, gmvK: 24.4, status: "ARCHIVED" },
  { code: "RO-014",  name: "ROCK AL PARQUE · STAGE A",          venue: "PARQUE SIMÓN BOLÍVAR",    city: "BOG",  cityFull: "Bogotá",            model: "MKT", category: "Music",       date: "MAY 22", dateSort: 22,  photogs: 2, photos: 488,  matchRate: 70, gmvK: 4.2,  status: "INDEXING" },
  { code: "FF-26",   name: "FESTA DA FIRMA 2025",               venue: "OMELETE OFFICE",          city: "SP",   cityFull: "São Paulo",         model: "SPO", category: "Corporate",   date: "MAY 22", dateSort: 22,  photogs: 1, photos: 243,  matchRate: 88, gmvK: 0,    status: "ARCHIVED" },
];

// ============================================================
// Helpers
// ============================================================

const modelColor = (m: BizModel) =>
  m === "OFF" ? T.purple : m === "MKT" ? T.cyan : T.pink;
const modelLabel = (m: BizModel) =>
  m === "OFF" ? "OFFICIAL" : m === "MKT" ? "MARKET" : "SPONSORED";

const statusColor = (s: EvtStatus) =>
  s === "LIVE" ? T.pink :
  s === "SCHEDULED" ? T.cyan :
  s === "INDEXING" ? T.purple :
  s === "UPLOADING" ? T.cyan :
  T.inkMute;

// ============================================================
// Filter rail
// ============================================================

type Filters = {
  search: string;
  models: Set<BizModel>;
  statuses: Set<EvtStatus>;
  categories: Set<Category>;
  cities: Set<City>;
};

const EMPTY_FILTERS: Filters = {
  search: "",
  models: new Set(),
  statuses: new Set(),
  categories: new Set(),
  cities: new Set(),
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
    filters.models.size + filters.statuses.size +
    filters.categories.size + filters.cities.size > 0;

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

      <input type="text" placeholder="Search code, name or venue…"
        value={filters.search}
        onChange={(e) => set(f => ({ ...f, search: e.target.value }))}
        style={{
          width: "100%",
          fontFamily: mono, fontSize: 12, color: T.ink,
          background: T.bg, border: `2px solid ${T.border}`,
          padding: "9px 11px", letterSpacing: "0.04em", outline: "none",
        }}
      />

      <FilterGroup n="01" title="BUSINESS MODEL">
        {(["OFF", "MKT", "SPO"] as BizModel[]).map(m => (
          <FilterCheckbox key={m} label={modelLabel(m)} value={m} set={filters.models}
            onToggle={(v) => toggle("models", v)} color={modelColor(m)} />
        ))}
      </FilterGroup>

      <FilterGroup n="02" title="STATUS">
        {(["LIVE", "SCHEDULED", "INDEXING", "UPLOADING", "ARCHIVED"] as EvtStatus[]).map(s => (
          <FilterCheckbox key={s} label={s} value={s} set={filters.statuses}
            onToggle={(v) => toggle("statuses", v)} color={statusColor(s)} />
        ))}
      </FilterGroup>

      <FilterGroup n="03" title="CATEGORY">
        {(["Music", "Conventions", "Sports", "Parties", "Corporate"] as Category[]).map(c => (
          <FilterCheckbox key={c} label={c} value={c} set={filters.categories}
            onToggle={(v) => toggle("categories", v)} />
        ))}
      </FilterGroup>

      <FilterGroup n="04" title="CITY">
        {(["CDMX", "MTY", "GDL", "SP", "BOG"] as City[]).map(c => (
          <FilterCheckbox key={c}
            label={c === "CDMX" ? "Ciudad de México" : c === "MTY" ? "Monterrey" : c === "GDL" ? "Guadalajara" : c === "SP" ? "São Paulo" : "Bogotá"}
            value={c} set={filters.cities} onToggle={(v) => toggle("cities", v)} />
        ))}
      </FilterGroup>

      <FilterGroup n="05" title="DATE RANGE">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {["Past 7 days", "Past 30 days", "Past 90 days", "Past 12 months", "All time"].map((r, i) => (
            <label key={r} style={{ display: "flex", gap: 9, alignItems: "center", cursor: "pointer", fontFamily: display, fontSize: 13, color: i === 4 ? T.ink : T.inkSoft }}>
              <span style={{
                width: 12, height: 12, borderRadius: "50%",
                border: `2px solid ${i === 4 ? T.purple : T.border}`,
                background: i === 4 ? T.purple : "transparent",
              }} />
              {r}
            </label>
          ))}
        </div>
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
        <SectionMarker n="02" label="LIVE PRODUCTION" color={T.purple} />
        <h1 style={{
          margin: "16px 0 12px",
          fontFamily: display, fontSize: 56, fontWeight: 700,
          letterSpacing: "-0.04em", lineHeight: 1, textTransform: "uppercase",
        }}>
          Events<span style={{ color: T.purple }}>.</span>
        </h1>
        <p style={{
          margin: 0, color: T.inkSoft, fontSize: 17, lineHeight: 1.45, maxWidth: 600,
        }}>
          142 lifetime · 5 live now · 8 scheduled this month. Drill into a row for crew, photos, sales and pricing overrides.
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
        }}>CLONE LAST</button>
        <button
          className="fs-cta-primary"
          style={{
            fontFamily: display, fontSize: 13, fontWeight: 700,
            color: T.bg, background: T.purple,
            border: `2px solid ${T.purple}`, padding: "11px 18px",
            letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer",
            boxShadow: `4px 4px 0 0 ${T.cyan}`,
            transition: "transform 120ms, box-shadow 120ms",
          }}>+ NEW EVENT</button>
      </div>
    </div>
  );
}

function KPIRow() {
  const KPIS = [
    { label: "LIVE NOW",       value: "5",     unit: "EVT",  delta: "BB-001 + 4 more",       color: T.pink,   live: true },
    { label: "LIFETIME",       value: "142",   unit: "EVT",  delta: "+8 this month",         color: T.ink },
    { label: "GMV TODAY",      value: "$48.2K", unit: "MXN", delta: "+12.4% vs yesterday",   color: T.purple },
    { label: "AVG MATCH RATE", value: "84%",   unit: "/100", delta: "+2 vs Q1",              color: T.cyan },
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

type SortKey = "name" | "dateSort" | "photogs" | "photos" | "matchRate" | "gmvK";

function EventsTable({
  rows, sort, setSort,
}: {
  rows: Event[];
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
        gridTemplateColumns: "minmax(280px, 1fr) 110px 120px 90px 80px 90px 90px 100px 110px",
        padding: "16px 22px",
        background: T.bgAlt, borderBottom: `2px solid ${T.border}`,
        alignItems: "center", gap: 14,
      }}>
        <SortHead label="EVENT" k="name" sort={sort} onSort={onSort} />
        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute, letterSpacing: "0.18em" }}>MODEL</span>
        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute, letterSpacing: "0.18em" }}>CATEGORY</span>
        <SortHead label="DATE" k="dateSort" sort={sort} onSort={onSort} />
        <SortHead label="CREW" k="photogs" sort={sort} onSort={onSort} align="right" />
        <SortHead label="PHOTOS" k="photos" sort={sort} onSort={onSort} align="right" />
        <SortHead label="MATCH" k="matchRate" sort={sort} onSort={onSort} align="right" />
        <SortHead label="GMV" k="gmvK" sort={sort} onSort={onSort} align="right" />
        <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute, letterSpacing: "0.18em" }}>STATUS</span>
      </div>

      {/* rows */}
      <div>
        {rows.map((e, idx) => {
          const dim = e.status === "ARCHIVED";
          return (
            <Link
              key={e.code}
              href={`/admin/events/${e.code}`}
              className="fs-row"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(280px, 1fr) 110px 120px 90px 80px 90px 90px 100px 110px",
                padding: "16px 22px", alignItems: "center", gap: 14,
                borderTop: idx > 0 ? `1px dashed ${T.border}` : "none",
                textDecoration: "none", color: T.ink,
                opacity: dim ? 0.62 : 1,
                animation: "fs-fadeUp 0.4s ease-out both",
                animationDelay: `${idx * 25}ms`,
              }}>
              {/* event */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <span style={{
                  fontFamily: mono, fontSize: 11, fontWeight: 700, color: modelColor(e.model),
                  border: `1.5px solid ${modelColor(e.model)}`, padding: "3px 8px",
                  letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0,
                }}>{e.code}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: display, fontSize: 14, fontWeight: 600,
                    letterSpacing: "0.01em", textTransform: "uppercase", lineHeight: 1.1,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{e.name}</div>
                  <div style={{
                    fontFamily: mono, fontSize: 10, color: T.inkMute,
                    letterSpacing: "0.12em", marginTop: 3,
                  }}>{e.venue} · {e.cityFull}</div>
                </div>
              </div>

              {/* model */}
              <span style={{
                fontFamily: mono, fontSize: 9, fontWeight: 700,
                color: modelColor(e.model),
                border: `1px solid ${modelColor(e.model)}`,
                padding: "3px 7px", letterSpacing: "0.16em",
                width: "fit-content",
              }}>{modelLabel(e.model)}</span>

              {/* category */}
              <span style={{
                fontFamily: mono, fontSize: 9, fontWeight: 700, color: T.inkSoft,
                border: `1px solid ${T.border}`, padding: "3px 7px",
                letterSpacing: "0.14em", textTransform: "uppercase", width: "fit-content",
              }}>{e.category}</span>

              {/* date */}
              <span style={{
                fontFamily: mono, fontSize: 12, fontWeight: 700, color: T.ink,
                letterSpacing: "0.06em",
              }}>{e.date}</span>

              {/* crew */}
              <span style={{
                fontFamily: display, fontWeight: 600, fontSize: 16,
                color: e.photogs === 0 ? T.inkMute : T.ink, textAlign: "right",
              }}>{e.photogs > 0 ? e.photogs : "—"}</span>

              {/* photos */}
              <span style={{
                fontFamily: mono, fontSize: 13, fontWeight: 700,
                color: e.photos === 0 ? T.inkMute : T.ink, textAlign: "right",
              }}>{e.photos > 0 ? e.photos.toLocaleString() : "—"}</span>

              {/* match */}
              <span style={{
                fontFamily: mono, fontSize: 13, fontWeight: 700,
                color: e.matchRate === 0 ? T.inkMute : T.ink, textAlign: "right",
              }}>{e.matchRate > 0 ? `${e.matchRate}%` : "—"}</span>

              {/* GMV */}
              <span style={{
                fontFamily: mono, fontSize: 13, fontWeight: 700,
                color: e.gmvK === 0 ? (e.model === "SPO" ? T.green : T.inkMute) : T.ink,
                textAlign: "right",
              }}>{e.gmvK > 0 ? `$${e.gmvK.toFixed(1)}K` : e.model === "SPO" ? "FLAT FEE" : "—"}</span>

              {/* status */}
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <Pill color={statusColor(e.status)}
                  dot={e.status === "LIVE"} dotPulse={e.status === "LIVE"}>
                  {e.status}
                </Pill>
              </div>
            </Link>
          );
        })}

        {rows.length === 0 && (
          <div style={{
            padding: "60px 22px", textAlign: "center",
            color: T.inkMute, fontFamily: mono, fontSize: 12, letterSpacing: "0.15em",
          }}>NO EVENTS MATCH THESE FILTERS</div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// Default export
// ============================================================

export default function EventsList() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "dateSort", dir: "desc" });

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return EVENTS.filter(e => {
      if (q && !e.name.toLowerCase().includes(q)
        && !e.code.toLowerCase().includes(q)
        && !e.venue.toLowerCase().includes(q)) return false;
      if (filters.models.size && !filters.models.has(e.model)) return false;
      if (filters.statuses.size && !filters.statuses.has(e.status)) return false;
      if (filters.categories.size && !filters.categories.has(e.category)) return false;
      if (filters.cities.size && !filters.cities.has(e.city)) return false;
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
    <AdminShell currentNav="nav-events" breadcrumb="EVENTS">
      <PageHeader />
      <KPIRow />

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
              <span style={{ color: T.ink, fontWeight: 700 }}>{sorted.length}</span> OF {EVENTS.length} SHOWN
            </span>
            <span>SORTED BY {sort.key === "dateSort" ? "DATE" : sort.key.toUpperCase()} {sort.dir === "desc" ? "▾" : "▴"}</span>
          </div>

          <EventsTable rows={sorted} sort={sort} setSort={setSort} />
        </div>
      </div>
    </AdminShell>
  );
}
