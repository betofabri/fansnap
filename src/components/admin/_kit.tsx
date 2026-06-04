"use client";

// FanSnap · Admin · Shared kit
// Tokens + primitives + Sidebar + TopBar used by every admin page.
// New pages should:
//   import { T, mono, display, AdminShell, CornerBrackets, ... } from "./_kit";
//   export default () => <AdminShell currentNav="nav-events" breadcrumb="EVENTS">{...}</AdminShell>;

import React, { useState } from "react";
import Link from "next/link";
import { THEMES } from "@/lib/theme";
import NavInspector, { NAV_INFO } from "./TourSystem";

export const T = {
  ...THEMES.dark,
  bgDeep: "#06060A",
  borderStrong: "#2E2E3D",
  green: "#3DDC97",
};

export const mono = "var(--font-mono, 'JetBrains Mono'), ui-monospace, monospace";
export const display = "var(--font-grotesk, 'Space Grotesk'), system-ui, sans-serif";

// ============================================================
// Primitives
// ============================================================

export function CornerBrackets({
  color = T.cyan, size = 14, thickness = 2, inset = -1,
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

export function SectionMarker({
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

export function Pill({
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

export function StatusDot({ color, pulse = true, size = 8 }: { color: string; pulse?: boolean; size?: number }) {
  return (
    <span
      className={pulse ? "fs-pulse-dot" : ""}
      style={{
        display: "inline-block", width: size, height: size, borderRadius: "50%",
        background: color, boxShadow: `0 0 0 2px ${color}22`,
      }}
    />
  );
}

export function GridBg({ size = 32, strong = false }: { size?: number; strong?: boolean }) {
  return (
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      backgroundImage:
        `linear-gradient(to right, ${strong ? T.gridLineStrong : T.gridLine} 1px, transparent 1px),
         linear-gradient(to bottom, ${strong ? T.gridLineStrong : T.gridLine} 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
    }} />
  );
}

export function Mono({ children, size = 11, color, ls = "0.15em" }: {
  children: React.ReactNode; size?: number; color?: string; ls?: string;
}) {
  return (
    <span style={{
      fontFamily: mono, fontSize: size, color: color || T.inkSoft, letterSpacing: ls,
    }}>{children}</span>
  );
}

// ============================================================
// Shared keyframes / hover styles
// ============================================================

export function KitStyles() {
  return (
    <style>{`
      @keyframes fs-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
      @keyframes fs-fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .fs-pulse-dot { animation: fs-pulse 1.4s ease-in-out infinite; }
      .fs-nav-item:hover { background: ${T.bgAlt} !important; color: ${T.ink} !important; }
      .fs-cta-primary:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 0 ${T.cyan} !important; }
      .fs-row:hover { background: ${T.bgAlt} !important; }
      .fs-row-selected { background: rgba(157, 78, 255, 0.06) !important; border-left: 3px solid ${T.purple} !important; }
      .fs-link:hover { color: ${T.cyan} !important; }
      .fs-tab:hover { color: ${T.ink} !important; }
    `}</style>
  );
}

// ============================================================
// Sidebar (shared, with NavInspector)
// ============================================================

type NavAccent = "purple" | "cyan" | "pink";
type NavItem = {
  n: string;
  label: string;
  href?: string;
  tourId: string;
  badge?: string;
  accent?: NavAccent;
  dim?: boolean;
  comingSoon?: boolean;
};

const NAV: NavItem[] = [
  { n: "01", label: "OVERVIEW",       href: "/admin",                tourId: "nav-overview" },
  { n: "02", label: "EVENTS",         href: "/admin/events",         tourId: "nav-events",          badge: "142" },
  { n: "03", label: "PHOTOGRAPHERS",  href: "/admin/photographers",  tourId: "nav-photographers",  badge: "23",  accent: "cyan" },
  { n: "04", label: "SALES",          tourId: "nav-sales",           comingSoon: true },
  { n: "05", label: "FANS",           href: "/admin/fans",           tourId: "nav-fans" },
  { n: "06", label: "B2B",            tourId: "nav-b2b",             dim: true, comingSoon: true },
  { n: "07", label: "FINANCE",        tourId: "nav-finance",         dim: true, comingSoon: true },
  { n: "08", label: "OPERATIONS",     tourId: "nav-operations",      dim: true, comingSoon: true },
  { n: "09", label: "SETTINGS",       tourId: "nav-settings",        comingSoon: true },
];

export function Sidebar({ current = "nav-overview" }: { current?: string }) {
  const [hovered, setHovered] = useState<{ id: string; rect: DOMRect } | null>(null);

  return (
    <>
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
            const active = item.tourId === current;
            const dim = !!item.dim;
            const isLink = !!item.href && !item.comingSoon;
            const accent = dim ? T.inkMute
              : item.accent === "pink" ? T.pink
              : item.accent === "cyan" ? T.cyan
              : T.purple;

            // Shared style for both Link and span variants — only difference is
            // the cursor and navigation behavior.
            const rowStyle: React.CSSProperties = {
              position: "relative", display: "flex", alignItems: "center", gap: 14,
              padding: "14px 14px", marginBottom: 4,
              textDecoration: "none",
              color: dim ? T.inkMute : (active ? T.ink : T.inkSoft),
              background: active ? T.bgPaper : "transparent",
              border: active ? `2px solid ${T.borderStrong}` : "2px solid transparent",
              opacity: dim ? 0.45 : 1,
              cursor: isLink ? "pointer" : "default",
              transition: "background 120ms, color 120ms, opacity 120ms",
            };

            // Find row rect for the inspector — works for both <a> and <div>.
            const onBadgeEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
              const row = e.currentTarget.parentElement;
              if (row) setHovered({ id: item.tourId, rect: row.getBoundingClientRect() });
            };

            const innerContent = (
              <>
                {active && <CornerBrackets color={T.cyan} size={11} thickness={2} inset={-2} />}
                <span
                  onMouseEnter={onBadgeEnter}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    fontFamily: mono, fontSize: 12, fontWeight: 700,
                    color: accent, width: 20, cursor: "help",
                    textAlign: "center", letterSpacing: "0.04em",
                  }}
                >{item.n}</span>
                <span style={{
                  fontFamily: display, fontSize: 14, fontWeight: active ? 700 : 500,
                  letterSpacing: "0.02em", textTransform: "uppercase", flex: 1,
                }}>{item.label}</span>
                {item.badge && !dim && (
                  <span style={{
                    fontFamily: mono, fontSize: 10, fontWeight: 700,
                    color: item.accent === "pink" ? T.pink : T.inkMute,
                    border: `1px solid ${item.accent === "pink" ? T.pink : T.border}`,
                    padding: "2px 6px",
                  }}>{item.badge}</span>
                )}
              </>
            );

            return isLink ? (
              <Link
                key={item.n}
                href={item.href!}
                data-tour={item.tourId}
                className={dim ? "fs-nav-item fs-nav-dim" : "fs-nav-item"}
                style={rowStyle}
              >{innerContent}</Link>
            ) : (
              <div
                key={item.n}
                data-tour={item.tourId}
                aria-disabled="true"
                className={dim ? "fs-nav-dim" : ""}
                style={rowStyle}
              >{innerContent}</div>
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
      <NavInspector
        info={hovered ? NAV_INFO[hovered.id] ?? null : null}
        anchor={hovered?.rect ?? null}
      />
    </>
  );
}

// ============================================================
// TopBar (configurable breadcrumb)
// ============================================================

export function TopBar({ breadcrumb }: { breadcrumb: string }) {
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
        <span style={{ color: T.ink, fontWeight: 700 }}>{breadcrumb}</span>
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
// Shell (Sidebar + TopBar + main wrapper)
// ============================================================

export function AdminShell({
  currentNav, breadcrumb, children,
}: {
  currentNav: string;
  breadcrumb: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <KitStyles />
      <div style={{ display: "flex", minHeight: "100vh", background: T.bg, minWidth: 1280 }}>
        <Sidebar current={currentNav} />
        <main style={{
          flex: 1, display: "flex", flexDirection: "column",
          background: T.bg, position: "relative", minWidth: 0,
        }}>
          <TopBar breadcrumb={breadcrumb} />
          {children}
        </main>
      </div>
    </>
  );
}

// ============================================================
// Filter rail / Table helpers (shared across list pages)
// ============================================================

export function FilterCheckbox<K extends string>({
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

export function FilterGroup({
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

export function Slider({
  label, value, onChange, color = T.purple, max = 100, suffix,
}: { label: string; value: number; onChange: (n: number) => void; color?: string; max?: number; suffix?: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: display, fontSize: 13, color: T.inkSoft }}>{label}</span>
        <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color }}>{value}{suffix ?? ""}</span>
      </div>
      <div style={{
        position: "relative", height: 4, background: T.border, marginBottom: 6,
      }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${(value / max) * 100}%`, background: color,
        }} />
        <input
          type="range" min={0} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute", inset: -6, width: "100%", height: 16,
            opacity: 0, cursor: "pointer",
          }}
        />
        <div style={{
          position: "absolute", left: `calc(${(value / max) * 100}% - 6px)`, top: -4,
          width: 12, height: 12, background: color,
          border: `2px solid ${T.ink}`, pointerEvents: "none",
        }} />
      </div>
    </div>
  );
}

export function SortHead({
  label, k, sort, onSort, align = "left",
}: {
  label: string; k: string;
  sort: { key: string; dir: "asc" | "desc" };
  onSort: (k: string) => void; align?: "left" | "right";
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

export function MiniKpi({
  label, value, unit, delta, color, live, index = 0,
}: {
  label: string; value: string; unit?: string; delta?: string;
  color?: string; live?: boolean; index?: number;
}) {
  return (
    <div style={{
      position: "relative", background: T.bgPaper,
      border: `2px solid ${T.border}`, padding: "18px 20px 16px",
      display: "flex", flexDirection: "column", gap: 10,
      animation: "fs-fadeUp 0.5s ease-out both", animationDelay: `${index * 50}ms`,
    }}>
      <CornerBrackets color={T.cyan} size={11} thickness={2} inset={-1} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkSoft,
          letterSpacing: "0.18em",
        }}>{label}</span>
        {live && (
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
          letterSpacing: "-0.04em", lineHeight: 1, color: color ?? T.ink,
        }}>{value}</span>
        {unit && <span style={{
          fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.18em",
        }}>{unit}</span>}
      </div>
      {delta && <span style={{ fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.04em" }}>
        {delta}
      </span>}
    </div>
  );
}

export function Avatar({
  initials, hue, size = 40, dim = false,
}: { initials: string; hue: number; size?: number; dim?: boolean }) {
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
