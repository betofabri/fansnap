"use client";

// FanSnap · Admin · Overview — Slice 0 + Slice 1, calmer iteration.
// Less ambient mono noise, larger numbers, more whitespace.
// Still brutalist (2px borders, corner brackets, section markers,
// solid offset shadows, event codes everywhere) — just breathing.

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

// ---------- primitives ----------

function CornerBrackets({
  color = T.cyan, size = 16, thickness = 2, inset = -1,
}: { color?: string; size?: number; thickness?: number; inset?: number }) {
  const corner = (s: React.CSSProperties): React.CSSProperties => ({
    position: "absolute", width: size, height: size,
    borderColor: color, borderStyle: "solid", borderWidth: 0,
    pointerEvents: "none", ...s,
  });
  return (
    <>
      <span style={corner({ top: inset, left: inset, borderTopWidth: thickness, borderLeftWidth: thickness })} />
      <span style={corner({ top: inset, right: inset, borderTopWidth: thickness, borderRightWidth: thickness })} />
      <span style={corner({ bottom: inset, left: inset, borderBottomWidth: thickness, borderLeftWidth: thickness })} />
      <span style={corner({ bottom: inset, right: inset, borderBottomWidth: thickness, borderRightWidth: thickness })} />
    </>
  );
}

function SectionMarker({
  n, label, color = T.purple,
}: { n: string; label?: string; color?: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <span style={{
        fontFamily: mono, fontSize: 13, fontWeight: 700, color,
        border: `2px solid ${color}`, padding: "3px 9px", letterSpacing: "0.04em",
      }}>{n}</span>
      {label && (
        <span style={{
          fontFamily: mono, fontSize: 12, color: T.inkSoft,
          letterSpacing: "0.18em", textTransform: "uppercase",
        }}>{label}</span>
      )}
    </div>
  );
}

function Pill({
  color, bg, border, children, dot, dotPulse,
}: {
  color: string; bg?: string; border?: string;
  children: React.ReactNode; dot?: boolean; dotPulse?: boolean;
}) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      fontFamily: mono, fontSize: 11, fontWeight: 700,
      letterSpacing: "0.16em", textTransform: "uppercase",
      color, background: bg || "transparent",
      border: `1.5px solid ${border || color}`,
      padding: "4px 10px", whiteSpace: "nowrap",
    }}>
      {dot && (
        <span
          className={dotPulse ? "fs-pulse-dot" : ""}
          style={{ width: 7, height: 7, borderRadius: "50%", background: color }}
        />
      )}
      {children}
    </span>
  );
}

function StatusDot({ color, pulse = true }: { color: string; pulse?: boolean }) {
  return (
    <span
      className={pulse ? "fs-pulse-dot" : ""}
      style={{
        display: "inline-block", width: 8, height: 8, borderRadius: "50%",
        background: color, boxShadow: `0 0 0 2px ${color}22`,
      }}
    />
  );
}

// Local keyframes — scoped fs- prefix so they don't collide with globals.css.
function MockupStyles() {
  return (
    <style>{`
      @keyframes fs-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
      @keyframes fs-fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .fs-pulse-dot { animation: fs-pulse 1.4s ease-in-out infinite; }
      .fs-nav-item:hover { background: ${T.bgAlt} !important; color: ${T.ink} !important; }
      .fs-cta-primary:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 0 ${T.cyan} !important; }
    `}</style>
  );
}

// ============================================================
// SIDEBAR
// ============================================================

type NavAccent = "purple" | "cyan" | "pink";
type NavItem = { n: string; label: string; active?: boolean; badge?: string; accent?: NavAccent };

const NAV: NavItem[] = [
  { n: "01", label: "OVERVIEW",       active: true },
  { n: "02", label: "EVENTS",         badge: "142" },
  { n: "03", label: "PHOTOGRAPHERS",  badge: "23",  accent: "cyan" },
  { n: "04", label: "SALES" },
  { n: "05", label: "FANS" },
  { n: "06", label: "B2B" },
  { n: "07", label: "FINANCE" },
  { n: "08", label: "OPERATIONS",     badge: "!", accent: "pink" },
  { n: "09", label: "SETTINGS" },
];

function Sidebar() {
  return (
    <aside style={{
      width: 248, flexShrink: 0,
      borderRight: `2px solid ${T.border}`,
      background: T.bgDeep,
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0, height: "100vh",
    }}>
      <div style={{
        borderBottom: `2px solid ${T.border}`,
        padding: "26px 22px 24px",
        display: "flex", alignItems: "baseline", gap: 10,
      }}>
        <div style={{
          fontFamily: display, fontWeight: 700, fontSize: 26,
          letterSpacing: "-0.035em", color: T.ink,
        }}>FAN<span style={{ color: T.purple }}>SNAP</span></div>
        <span style={{
          fontFamily: mono, fontSize: 10, fontWeight: 700,
          color: T.cyan, border: `1.5px solid ${T.cyan}`,
          padding: "2px 6px", letterSpacing: "0.2em",
        }}>ADMIN</span>
      </div>

      <nav style={{ padding: "18px 12px", flex: 1, overflowY: "auto" }}>
        {NAV.map((item) => {
          const accent =
            item.accent === "pink" ? T.pink :
            item.accent === "cyan" ? T.cyan : T.purple;
          return (
            <a
              key={item.n}
              href="#"
              className="fs-nav-item"
              style={{
                position: "relative", display: "flex", alignItems: "center", gap: 14,
                padding: "14px 14px", marginBottom: 4,
                textDecoration: "none",
                color: item.active ? T.ink : T.inkSoft,
                background: item.active ? T.bgPaper : "transparent",
                border: item.active ? `2px solid ${T.borderStrong}` : "2px solid transparent",
                transition: "background 120ms, color 120ms",
              }}
            >
              {item.active && <CornerBrackets color={T.cyan} size={11} thickness={2} inset={-2} />}
              <span style={{
                fontFamily: mono, fontSize: 12, fontWeight: 700,
                color: accent, width: 20,
              }}>{item.n}</span>
              <span style={{
                fontFamily: display, fontSize: 14, fontWeight: item.active ? 700 : 500,
                letterSpacing: "0.02em", textTransform: "uppercase", flex: 1,
              }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontFamily: mono, fontSize: 10, fontWeight: 700,
                  color: item.accent === "pink" ? T.pink : T.inkMute,
                  border: `1px solid ${item.accent === "pink" ? T.pink : T.border}`,
                  padding: "2px 6px",
                }}>{item.badge}</span>
              )}
            </a>
          );
        })}
      </nav>

      <div style={{ borderTop: `2px solid ${T.border}`, padding: "18px 16px 22px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          border: `2px solid ${T.border}`, padding: "10px 12px",
          background: T.bgAlt, position: "relative",
        }}>
          <div style={{
            width: 36, height: 36, background: T.purple,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: display, fontWeight: 700, fontSize: 14, color: T.bg,
            border: `2px solid ${T.ink}`,
          }}>BF</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.1 }}>Beto Fabri</div>
            <div style={{
              fontFamily: mono, fontSize: 10, color: T.inkMute,
              letterSpacing: "0.15em", marginTop: 3,
            }}>USR-001 · ADMIN</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ============================================================
// TOP BAR — simpler
// ============================================================

function TopBar() {
  return (
    <header style={{
      display: "flex", alignItems: "stretch",
      borderBottom: `2px solid ${T.border}`,
      background: T.bg, height: 64, flexShrink: 0,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 26px",
        fontFamily: mono, fontSize: 12, letterSpacing: "0.16em",
      }}>
        <span style={{ color: T.inkMute }}>ADMIN</span>
        <span style={{ color: T.borderStrong }}>/</span>
        <span style={{ color: T.ink, fontWeight: 700 }}>OVERVIEW</span>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 22px" }}>
        <Pill color={T.green} dot dotPulse>ALL SYSTEMS</Pill>
        <button style={{
          fontFamily: mono, fontSize: 11, fontWeight: 700, color: T.inkSoft,
          background: "transparent", border: `2px solid ${T.border}`,
          padding: "8px 12px", letterSpacing: "0.18em", cursor: "pointer",
        }}>THEME · DARK</button>
      </div>
    </header>
  );
}

// ============================================================
// PAGE HEADER — bigger H1, calmer subtitle
// ============================================================

function PageHeader() {
  return (
    <div style={{
      padding: "44px 44px 36px",
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
        <SectionMarker n="01" label="MISSION CONTROL" />
        <h1 style={{
          margin: "16px 0 12px",
          fontFamily: display, fontSize: 56, fontWeight: 700,
          letterSpacing: "-0.04em", lineHeight: 1, textTransform: "uppercase",
        }}>
          Overview<span style={{ color: T.purple }}>.</span>
        </h1>
        <p style={{
          margin: 0, color: T.inkSoft, fontSize: 17, lineHeight: 1.45, maxWidth: 560,
        }}>
          Every match, every sale, every fan — one feed. 5 events live, 23 photographers on the field.
        </p>
      </div>
      <div style={{
        position: "relative", display: "flex", alignItems: "center", gap: 12,
      }}>
        <Pill color={T.cyan} border={T.borderStrong}>TODAY · 14:00 → 14:32</Pill>
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

// ============================================================
// KPI ROW — bigger numbers, no code chips, no detail line
// ============================================================

type Kpi = {
  label: string; value: string; unit: string;
  delta: string; deltaUp: boolean;
  sparkColor: string; sparkPath: string;
  live?: boolean;
};

const KPIS: Kpi[] = [
  { label: "GMV TODAY", value: "$48,210", unit: "MXN",
    delta: "+12.4%", deltaUp: true, sparkColor: T.purple,
    sparkPath: "M0,26 L10,22 L20,20 L30,22 L40,16 L50,18 L60,12 L70,14 L80,8 L90,12 L100,6" },
  { label: "ACTIVE SCANS", value: "1,247", unit: "NOW",
    delta: "+24.0%", deltaUp: true, sparkColor: T.cyan, live: true,
    sparkPath: "M0,24 L10,22 L20,26 L30,18 L40,14 L50,10 L60,8 L70,12 L80,6 L90,8 L100,4" },
  { label: "NEW FANS · 7D", value: "8,902", unit: "USR",
    delta: "+6.1%", deltaUp: true, sparkColor: T.cyan,
    sparkPath: "M0,20 L10,22 L20,16 L30,18 L40,14 L50,15 L60,11 L70,12 L80,9 L90,10 L100,6" },
  { label: "PHOTOGRAPHERS LIVE", value: "23/142", unit: "PHT",
    delta: "−2", deltaUp: false, sparkColor: T.pink,
    sparkPath: "M0,14 L10,12 L20,16 L30,14 L40,18 L50,16 L60,20 L70,18 L80,22 L90,20 L100,24" },
];

function KPICard({ kpi, index }: { kpi: Kpi; index: number }) {
  return (
    <div style={{
      position: "relative", background: T.bgPaper,
      border: `2px solid ${T.border}`, padding: "26px 26px 22px",
      display: "flex", flexDirection: "column", gap: 22,
      overflow: "hidden",
      animation: "fs-fadeUp 0.5s ease-out both",
      animationDelay: `${index * 60}ms`,
    }}>
      <CornerBrackets color={T.cyan} size={14} thickness={2} inset={-1} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontFamily: mono, fontSize: 11, fontWeight: 700, color: T.inkSoft,
          letterSpacing: "0.18em", textTransform: "uppercase",
        }}>{kpi.label}</span>
        {kpi.live && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.pink,
            letterSpacing: "0.2em",
          }}>
            <StatusDot color={T.pink} /> LIVE
          </span>
        )}
      </div>

      <div style={{ position: "relative", display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{
          fontFamily: display, fontWeight: 700, fontSize: 56,
          letterSpacing: "-0.045em", lineHeight: 1, color: T.ink,
        }}>{kpi.value}</span>
        <span style={{
          fontFamily: mono, fontSize: 12, color: T.inkMute, letterSpacing: "0.18em",
        }}>{kpi.unit}</span>
      </div>

      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <span style={{
          fontFamily: mono, fontSize: 14, fontWeight: 700,
          color: kpi.deltaUp ? T.green : T.pink, letterSpacing: "0.04em",
        }}>{kpi.deltaUp ? "▲" : "▼"} {kpi.delta}</span>
        <svg width="130" height="36" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor={kpi.sparkColor} stopOpacity="0.45" />
              <stop offset="100%" stopColor={kpi.sparkColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${kpi.sparkPath} L100,32 L0,32 Z`} fill={`url(#grad-${index})`} transform="scale(1.3 1.1)" />
          <path d={kpi.sparkPath} fill="none" stroke={kpi.sparkColor} strokeWidth="2" transform="scale(1.3 1.1)" />
        </svg>
      </div>
    </div>
  );
}

function KPIRow() {
  return (
    <div style={{
      padding: "32px 44px",
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22,
    }}>
      {KPIS.map((kpi, i) => <KPICard key={kpi.label} kpi={kpi} index={i} />)}
    </div>
  );
}

// ============================================================
// EVENT HEATMAP
// ============================================================

type EvtStatus = "LIVE" | "UPLOADING" | "INDEXING" | "SPONSORED" | "IDLE";
type BizModel = "OFF" | "MKT" | "SPO";

type EvtRow = {
  code: string; name: string; venue: string;
  status: EvtStatus; model: BizModel; matches: number; cells: number[];
};

const EVENTS: EvtRow[] = [
  { code: "BB-001",  name: "BAD BUNNY · WORLD'S HOTTEST TOUR", venue: "FORO SOL · CDMX",    status: "LIVE",      model: "OFF", matches: 8420,
    cells: [4,3,2,1,0,0,0,0,0,1,2,3,4,5,5,6,7,8,9,10,10,9,8,7] },
  { code: "CCXP-26", name: "CCXP MX · DAY 02",                 venue: "CITIBANAMEX · CDMX", status: "LIVE",      model: "OFF", matches: 4201,
    cells: [2,1,1,0,0,0,0,1,3,5,7,8,8,7,6,7,8,8,9,9,8,6,4,3] },
  { code: "MAR-21",  name: "MARATÓN CDMX · 21K",               venue: "CDMX · RUTA",         status: "UPLOADING", model: "OFF", matches: 1802,
    cells: [8,9,9,8,6,4,2,1,0,0,0,0,0,0,0,1,2,3,3,3,2,2,1,1] },
  { code: "KARO-12", name: "KAROL G · MAÑANA SERÁ BONITO",     venue: "ESTADIO AZTECA",      status: "INDEXING",  model: "OFF", matches: 612,
    cells: [0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,4,3,2,2,1,1,1,0,0] },
  { code: "ANIM-08", name: "ANIME FRIENDS MX · DAY 01",        venue: "WTC · CDMX",          status: "SPONSORED", model: "SPO", matches: 921,
    cells: [0,0,0,0,0,0,1,2,2,3,3,4,4,3,3,2,2,1,1,1,0,0,0,0] },
  { code: "ROSA-04", name: "ROSALÍA · MOTOMAMI · MX LEG",      venue: "AUDITORIO NACIONAL",  status: "IDLE",      model: "MKT", matches: 0,
    cells: Array(24).fill(0) },
];

function statusColor(s: EvtStatus) {
  if (s === "LIVE") return T.pink;
  if (s === "UPLOADING") return T.cyan;
  if (s === "INDEXING") return T.purple;
  if (s === "SPONSORED") return T.green;
  return T.inkMute;
}
function modelColor(m: BizModel) {
  if (m === "OFF") return T.purple;
  if (m === "MKT") return T.cyan;
  if (m === "SPO") return T.pink;
  return T.inkMute;
}
function heatColor(v: number) {
  if (v === 0) return T.bgAlt;
  const ratio = Math.min(v / 10, 1);
  const alpha = 0.15 + ratio * 0.85;
  return `rgba(157, 78, 255, ${alpha.toFixed(3)})`;
}

function EventHeatmap() {
  return (
    <section style={{
      position: "relative", background: T.bgPaper,
      border: `2px solid ${T.border}`, overflow: "hidden",
    }}>
      <CornerBrackets color={T.cyan} size={16} thickness={2} inset={-1} />
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 24px", borderBottom: `2px solid ${T.border}`,
        background: T.bgAlt,
      }}>
        <SectionMarker n="A·1" label="EVENT ACTIVITY · 24H" />
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.18em",
        }}>
          <span>LOW</span>
          <div style={{ display: "flex", gap: 3 }}>
            {[0, 2, 4, 6, 8, 10].map(v => (
              <span key={v} style={{ width: 18, height: 14, background: heatColor(v), border: `1px solid ${T.border}` }} />
            ))}
          </div>
          <span>HIGH</span>
        </div>
      </header>

      {/* hour axis — only every 6h labeled */}
      <div style={{
        display: "grid", gridTemplateColumns: "300px 1fr 110px",
        padding: "14px 24px 10px",
        fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.15em",
      }}>
        <div>EVENT</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 3, paddingRight: 18 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} style={{ textAlign: "center", opacity: i % 6 === 0 ? 1 : 0 }}>
              {String(i).padStart(2, "0")}
            </span>
          ))}
        </div>
        <div style={{ textAlign: "right" }}>MATCHES</div>
      </div>

      <div>
        {EVENTS.map((e, idx) => (
          <div key={e.code} style={{
            display: "grid", gridTemplateColumns: "300px 1fr 110px",
            padding: "18px 24px", alignItems: "center",
            borderTop: `1px dashed ${T.border}`,
            animation: "fs-fadeUp 0.5s ease-out both",
            animationDelay: `${100 + idx * 40}ms`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 16 }}>
              <span style={{
                fontFamily: mono, fontSize: 11, fontWeight: 700, color: modelColor(e.model),
                border: `1.5px solid ${modelColor(e.model)}`, padding: "3px 7px",
                letterSpacing: "0.06em", whiteSpace: "nowrap",
              }}>{e.code}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontFamily: display, fontSize: 14, fontWeight: 600,
                  letterSpacing: "0.01em", textTransform: "uppercase",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>{e.name}</div>
                <div style={{
                  fontFamily: mono, fontSize: 11, color: T.inkMute,
                  letterSpacing: "0.1em", marginTop: 4,
                }}>{e.venue}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 3, paddingRight: 18 }}>
              {e.cells.map((v, i) => (
                <div key={i} style={{
                  height: 30, background: heatColor(v),
                  border: `1px solid ${T.border}`, position: "relative",
                }}>
                  {v >= 8 && (
                    <span style={{
                      position: "absolute", inset: 0, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontFamily: mono, fontSize: 9, fontWeight: 700, color: T.bg,
                    }}>{v}</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{
                fontFamily: display, fontWeight: 700, fontSize: 24,
                letterSpacing: "-0.03em", color: T.ink, lineHeight: 1,
              }}>{e.matches.toLocaleString()}</div>
              <div style={{ marginTop: 8 }}>
                <Pill color={statusColor(e.status)} dot={e.status === "LIVE"} dotPulse={e.status === "LIVE"}>
                  {e.status}
                </Pill>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// TERMINAL FEED — bigger lines, no filter chips
// ============================================================

type FeedRow = { t: string; type: string; color: string; body: React.ReactNode };

const FEED: FeedRow[] = [
  { t: "14:32:07", type: "SALE",   color: T.green,  body: <>BB-001 · 4 photos · <strong style={{ color: T.ink }}>$1,240</strong> MXN</> },
  { t: "14:32:01", type: "SCAN",   color: T.cyan,   body: <>BB-001 · USR-204 · 12 matches</> },
  { t: "14:31:54", type: "SCAN",   color: T.cyan,   body: <>CCXP-26 · USR-810 · 7 matches</> },
  { t: "14:31:42", type: "SALE",   color: T.green,  body: <>CCXP-26 · 2 photos · <strong style={{ color: T.ink }}>$620</strong> MXN</> },
  { t: "14:31:30", type: "INDEX",  color: T.purple, body: <>MAR-21 · 412 photos indexed</> },
  { t: "14:31:14", type: "SCAN",   color: T.cyan,   body: <>BB-001 · USR-205 · 0 matches</> },
  { t: "14:30:58", type: "REFUND", color: T.pink,   body: <>BB-001 · <strong style={{ color: T.ink }}>−$340</strong> MXN</> },
  { t: "14:30:44", type: "JOIN",   color: T.purple, body: <>PHT-088 «luis_lens» joined BB-001</> },
  { t: "14:30:31", type: "SALE",   color: T.green,  body: <>BB-001 · 1 print · <strong style={{ color: T.ink }}>$890</strong> MXN</> },
  { t: "14:30:00", type: "ALERT",  color: T.pink,   body: <>R2 bucket 78% · scale-up</> },
  { t: "14:29:46", type: "SCAN",   color: T.cyan,   body: <>CCXP-26 · 21 matches · TOP</> },
];

function TerminalFeed() {
  return (
    <section style={{
      position: "relative", background: T.bgDeep,
      border: `2px solid ${T.border}`, display: "flex", flexDirection: "column",
      height: "100%", overflow: "hidden", minHeight: 560,
    }}>
      <CornerBrackets color={T.pink} size={16} thickness={2} inset={-1} />
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 22px", borderBottom: `2px solid ${T.border}`,
        background: T.bgAlt,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <StatusDot color={T.pink} />
          <span style={{
            fontFamily: display, fontSize: 16, fontWeight: 700, color: T.ink,
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>Live Feed</span>
        </div>
        <span style={{
          fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.18em",
        }}>↑ 2.4 / sec</span>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 22px 22px" }}>
        {FEED.map((row, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "84px 72px 1fr",
            gap: 14, padding: "13px 0",
            borderBottom: i < FEED.length - 1 ? `1px solid ${T.border}` : "none",
            fontFamily: mono, fontSize: 13, lineHeight: 1.45,
            animation: "fs-fadeUp 0.35s ease-out both",
            animationDelay: `${i * 30}ms`,
          }}>
            <span style={{ color: T.cyan, letterSpacing: "0.02em" }}>{row.t}</span>
            <span style={{
              color: row.color, border: `1.5px solid ${row.color}`,
              padding: "0 6px", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.16em", textAlign: "center",
              height: 20, lineHeight: "18px", alignSelf: "start", marginTop: 2,
            }}>{row.type}</span>
            <span style={{ color: T.inkSoft }}>{row.body}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// GMV CHART
// ============================================================

type GmvDay = { day: string; label: string; m: number; o: number; s: number };

const GMV_7D: GmvDay[] = [
  { day: "THU", label: "MAY 22", m: 8200,  o: 22400, s: 6400 },
  { day: "FRI", label: "MAY 23", m: 12400, o: 38120, s: 6400 },
  { day: "SAT", label: "MAY 24", m: 18200, o: 52600, s: 6400 },
  { day: "SUN", label: "MAY 25", m: 14800, o: 41200, s: 0    },
  { day: "MON", label: "MAY 26", m: 6200,  o: 18400, s: 0    },
  { day: "TUE", label: "MAY 27", m: 7400,  o: 21100, s: 0    },
  { day: "WED", label: "MAY 28", m: 9100,  o: 33400, s: 6400 },
];

function GMVChart() {
  const totals = GMV_7D.map(d => d.m + d.o + d.s);
  const maxTotal = Math.max(...totals);
  const yMax = Math.ceil(maxTotal / 10000) * 10000;
  const yTicks = [0, yMax * 0.5, yMax];
  const total = totals.reduce((s, v) => s + v, 0);
  const avg = Math.round(total / 7);
  const bestIdx = totals.indexOf(maxTotal);
  const best = GMV_7D[bestIdx];

  const TOP_PAD = 40;
  const BOTTOM_PAD = 68;
  const HEIGHT = 360;
  const innerH = HEIGHT - TOP_PAD - BOTTOM_PAD;

  return (
    <section style={{
      position: "relative", background: T.bgPaper,
      border: `2px solid ${T.border}`, overflow: "hidden",
    }}>
      <CornerBrackets color={T.cyan} size={16} thickness={2} inset={-1} />
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 24px", borderBottom: `2px solid ${T.border}`,
        background: T.bgAlt, flexWrap: "wrap", gap: 16,
      }}>
        <SectionMarker n="A·2" label="GMV · LAST 7 DAYS" />
        <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
          {[
            { label: "MARKETPLACE", color: T.cyan,   value: "$76.3K" },
            { label: "OFFICIAL",    color: T.purple, value: "$227.2K" },
            { label: "SPONSORED",   color: T.pink,   value: "$25.6K" },
          ].map(l => (
            <span key={l.label} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 12, height: 12, background: l.color, border: `1px solid ${T.ink}` }} />
              <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: T.inkSoft, letterSpacing: "0.18em" }}>{l.label}</span>
              <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: T.ink }}>{l.value}</span>
            </span>
          ))}
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px" }}>
        <div style={{
          position: "relative", height: HEIGHT,
          padding: `${TOP_PAD}px 80px ${BOTTOM_PAD}px 32px`,
          borderRight: `1px dashed ${T.border}`,
        }}>
          {yTicks.map((y, i) => {
            const top = TOP_PAD + innerH * (1 - y / yMax);
            return (
              <React.Fragment key={i}>
                <div style={{
                  position: "absolute", left: 32, right: 80, top,
                  borderTop: `1px dashed ${T.border}`,
                }} />
                <span style={{
                  position: "absolute", right: 22, top: top - 9,
                  fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.14em",
                  background: T.bgPaper, padding: "0 6px",
                }}>${(y / 1000).toFixed(0)}K</span>
              </React.Fragment>
            );
          })}

          <div style={{
            position: "absolute", left: 32, right: 80,
            top: TOP_PAD, bottom: BOTTOM_PAD,
            display: "grid", gridTemplateColumns: `repeat(${GMV_7D.length}, 1fr)`,
            gap: 26, alignItems: "end",
          }}>
            {GMV_7D.map((d, i) => {
              const dTotal = d.m + d.o + d.s;
              const heightPct = (dTotal / yMax) * 100;
              const isBest = i === bestIdx;
              return (
                <div key={d.day} style={{
                  position: "relative", height: `${heightPct}%`,
                  display: "flex", flexDirection: "column-reverse",
                  border: `2px solid ${T.ink}`,
                  boxShadow: isBest ? `5px 5px 0 0 ${T.purple}` : "none",
                  animation: "fs-fadeUp 0.6s ease-out both",
                  animationDelay: `${i * 60}ms`,
                }}>
                  <div style={{ flex: d.m, background: T.cyan,   borderBottom: d.m > 0 ? `2px solid ${T.ink}` : "none" }} />
                  <div style={{ flex: d.o, background: T.purple, borderBottom: d.o > 0 ? `2px solid ${T.ink}` : "none" }} />
                  <div style={{ flex: d.s || 0.0001, background: d.s > 0 ? T.pink : "transparent" }} />
                  <div style={{
                    position: "absolute", top: -26, left: 0, right: 0, textAlign: "center",
                    fontFamily: mono, fontSize: 12, fontWeight: 700, color: isBest ? T.purple : T.ink,
                    letterSpacing: "0.02em", whiteSpace: "nowrap",
                  }}>${(dTotal / 1000).toFixed(1)}K</div>
                </div>
              );
            })}
          </div>

          <div style={{
            position: "absolute", left: 32, right: 80, bottom: 14,
            display: "grid", gridTemplateColumns: `repeat(${GMV_7D.length}, 1fr)`,
            gap: 26, paddingTop: 14,
            borderTop: `2px solid ${T.borderStrong}`,
          }}>
            {GMV_7D.map((d, i) => (
              <div key={d.day} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: mono, fontSize: 13, fontWeight: 700,
                  color: i === bestIdx ? T.purple : T.ink, letterSpacing: "0.14em",
                }}>{d.day}</div>
                <div style={{
                  fontFamily: mono, fontSize: 10, color: T.inkMute,
                  letterSpacing: "0.14em", marginTop: 4,
                }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "28px 26px", display: "flex", flexDirection: "column", gap: 26 }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.2em", marginBottom: 8 }}>TOTAL · 7D</div>
            <div style={{
              fontFamily: display, fontWeight: 700, fontSize: 40,
              color: T.ink, letterSpacing: "-0.04em", lineHeight: 1,
            }}>
              ${(total / 1000).toFixed(1)}<span style={{ fontSize: 16, color: T.inkMute, fontWeight: 500 }}> K</span>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.2em", marginBottom: 8 }}>AVG · DAY</div>
            <div style={{
              fontFamily: display, fontWeight: 600, fontSize: 26,
              color: T.inkSoft, letterSpacing: "-0.03em", lineHeight: 1,
            }}>${(avg / 1000).toFixed(1)}K</div>
          </div>
          <div>
            <div style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.2em", marginBottom: 8 }}>BEST DAY</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontFamily: display, fontWeight: 700, fontSize: 26, color: T.purple }}>{best.day}</span>
              <span style={{ fontFamily: mono, fontSize: 13, color: T.inkSoft }}>${(maxTotal / 1000).toFixed(1)}K</span>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ borderTop: `1px dashed ${T.border}`, paddingTop: 18 }}>
            <div style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.2em", marginBottom: 6 }}>FORECAST · NEXT 7D</div>
            <div style={{ fontFamily: display, fontSize: 17, fontWeight: 700, color: T.cyan }}>▲ $360 – 420K</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FOOTER — minimal status strip
// ============================================================

function FooterStrip() {
  return (
    <footer style={{
      marginTop: "auto", borderTop: `2px solid ${T.border}`,
      background: T.bgDeep, padding: "16px 44px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.18em",
      flexShrink: 0,
    }}>
      <span>FANSNAP · ADMIN · v0.1</span>
      <span style={{ display: "inline-flex", gap: 22 }}>
        <span style={{ color: T.green }}>D1 · OK</span>
        <span style={{ color: T.green }}>R2 · OK</span>
        <span style={{ color: T.pink }}>REKOG · STUB</span>
      </span>
    </footer>
  );
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default function OverviewMockup() {
  return (
    <>
      <MockupStyles />
      <div style={{ display: "flex", minHeight: "100vh", background: T.bg, minWidth: 1280 }}>
        <Sidebar />
        <main style={{
          flex: 1, display: "flex", flexDirection: "column",
          background: T.bg, position: "relative", minWidth: 0,
        }}>
          <TopBar />
          <PageHeader />
          <KPIRow />
          <div style={{
            padding: "0 44px 32px",
            display: "grid", gridTemplateColumns: "minmax(0, 1fr) 420px",
            gap: 22, alignItems: "stretch",
          }}>
            <EventHeatmap />
            <TerminalFeed />
          </div>
          <div style={{ padding: "0 44px 48px" }}>
            <GMVChart />
          </div>
          <FooterStrip />
        </main>
      </div>
    </>
  );
}
