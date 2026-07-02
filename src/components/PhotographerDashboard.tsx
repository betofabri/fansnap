"use client";

// PhotographerDashboard
// ─────────────────────
// The photographer's own logged-in area (/fansnap/fotografos/dashboard).
// Distinct from /admin (that's the operator view). This is what an approved
// roster photographer sees: assigned events, upload entry points, sales feed,
// payout summary and profile. No auth yet — runs on mock data with a clear
// "vista previa" badge until accounts + D1 land (Fatia 3).

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowRight, ArrowUpRight, Upload, Camera, DollarSign, Images,
  TrendingUp, Wallet, Clock, CheckCircle2, Calendar, MapPin, Star,
  ChevronRight, X, Loader2, AlertTriangle, FileImage, CloudUpload,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

import { DARK, FONT_GROTESK, FONT_MONO } from "@/lib/theme";

// Shared flat-black tokens (audit Lote B) — palette lives in src/lib/theme.ts.
const c = DARK;

// ─── Mock photographer (would load by session in real) ──────────────────────

const ME = {
  name: "María Suárez",
  handle: "msuarez.lens",
  initials: "MS",
  tier: "Pro",
  city: "Ciudad de México",
  joined: "Ago 2024",
  rating: 4.7,
};

const MONTH_STATS = [
  { icon: Calendar, label: "Eventos este mes", value: "4", delta: "+1", color: "#00E5FF" },
  { icon: Images,   label: "Fotos subidas",    value: "1,284", delta: "+312", color: "#9D4EFF" },
  { icon: Camera,   label: "Fotos vendidas",   value: "418", delta: "+96", color: "#FF2D87" },
  { icon: DollarSign, label: "Ganado (MXN)",   value: "$28,640", delta: "+18%", color: "#4ADE80" },
];

const ASSIGNED = [
  { code: "CCXP-26", name: "CCXP México 2026", date: "29 MAY", venue: "Centro Banamex", city: "CDMX", state: "upcoming", uploaded: 0 },
  { code: "BB-001", name: "Bad Bunny — Most Wanted", date: "08 MAY", venue: "Estadio GNP", city: "CDMX", state: "uploading", uploaded: 612 },
  { code: "RO-014", name: "Rosalía — Motomami", date: "04 MAY", venue: "Foro Sol", city: "CDMX", state: "live", uploaded: 388 },
];

const SALES = [
  { event: "Bad Bunny — Most Wanted", product: "Digital", qty: 3, amount: 540, when: "hace 2 h" },
  { event: "Rosalía — Motomami", product: "Print", qty: 1, amount: 320, when: "hace 5 h" },
  { event: "Bad Bunny — Most Wanted", product: "Digital", qty: 2, amount: 360, when: "ayer" },
  { event: "Rosalía — Motomami", product: "Canvas", qty: 1, amount: 890, when: "ayer" },
  { event: "Bad Bunny — Most Wanted", product: "Digital", qty: 5, amount: 900, when: "hace 2 d" },
];

const PAYOUTS = [
  { period: "May 2026 · 1ª quincena", amount: 14280, status: "paid", date: "15 May" },
  { period: "Abr 2026 · 2ª quincena", amount: 11940, status: "paid", date: "30 Abr" },
  { period: "Abr 2026 · 1ª quincena", amount: 9820, status: "paid", date: "15 Abr" },
];

function fmtMXN(n: number): string {
  return `$${n.toLocaleString("es-MX")}`;
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function PhotographerDashboard() {
  const [tab, setTab] = useState<"resumen" | "eventos" | "ventas" | "pagos">("resumen");
  const [upload, setUpload] = useState<{ code: string; name: string } | null>(null);
  const openUpload = (code: string, name: string) => setUpload({ code, name });

  return (
    <div style={{ background: c.bg, color: c.ink, fontFamily: FONT_GROTESK, minHeight: "100vh" }}>
      <style>{globalCSS}</style>
      <SiteHeader lang="es" />

      {/* Welcome bar */}
      <section style={{
        borderBottom: `1px solid ${c.border}`, background: c.surface,
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "32px clamp(20px, 4vw, 40px)",
          display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
        }}>
          <div style={{
            width: 64, height: 64, flexShrink: 0,
            display: "grid", placeItems: "center",
            background: `linear-gradient(135deg, ${c.premium}, ${c.accent})`,
            fontFamily: FONT_GROTESK, fontWeight: 800, fontSize: 24, color: "#000",
          }}>{ME.initials}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{
                fontFamily: FONT_GROTESK, fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800,
                letterSpacing: "-0.03em", margin: 0,
              }}>{ME.name}</h1>
              <span style={{
                fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: c.accent,
                letterSpacing: "0.12em", textTransform: "uppercase",
                border: `1px solid rgba(0,229,255,0.4)`, padding: "3px 10px",
                background: c.accentSoft,
              }}>Tier {ME.tier}</span>
              <span style={{
                fontFamily: FONT_MONO, fontSize: 11, color: c.warn,
                letterSpacing: "0.12em", textTransform: "uppercase",
                border: `1px solid ${c.warn}`, padding: "3px 10px", borderRadius: 999,
              }}>Vista previa</span>
            </div>
            <div style={{
              marginTop: 6, fontFamily: FONT_MONO, fontSize: 12, color: c.inkSoft,
              display: "flex", gap: 14, flexWrap: "wrap",
            }}>
              <span>@{ME.handle}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Star size={12} color={c.warn} strokeWidth={2.4} /> {ME.rating}
              </span>
              <span>{ME.city}</span>
              <span>Desde {ME.joined}</span>
            </div>
          </div>
          <button onClick={() => openUpload(ASSIGNED[0].code, ASSIGNED[0].name)} style={{ ...primaryCTA, border: "none", cursor: "pointer" }} className="pd-cta">
            <Upload size={16} strokeWidth={2.4} />
            <span>Subir fotos</span>
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div style={{
        position: "sticky", top: 76, zIndex: 40,
        borderBottom: `1px solid ${c.border}`, background: `${c.bg}e0`,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 4vw, 40px)",
          display: "flex", gap: 4, overflowX: "auto",
        }}>
          {([
            ["resumen", "Resumen"],
            ["eventos", "Eventos"],
            ["ventas", "Ventas"],
            ["pagos", "Pagos"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                padding: "16px 14px",
                fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: tab === key ? c.ink : c.inkMute,
                borderBottom: `2px solid ${tab === key ? c.accent : "transparent"}`,
                transition: "color 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >{label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px clamp(20px, 4vw, 40px) 80px" }}>
        {tab === "resumen" && <Resumen />}
        {tab === "eventos" && <Eventos onUpload={openUpload} />}
        {tab === "ventas" && <Ventas />}
        {tab === "pagos" && <Pagos />}
      </div>

      {upload && <UploadPanel eventCode={upload.code} eventName={upload.name} onClose={() => setUpload(null)} />}
    </div>
  );
}

// ─── Tab: Resumen ────────────────────────────────────────────────────────

function Resumen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Stat cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 1, background: c.border, border: `1px solid ${c.border}`,
      }}>
        {MONTH_STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ background: c.bg, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Icon size={20} color={s.color} strokeWidth={1.9} />
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 11, color: c.ok, fontWeight: 700,
                  display: "inline-flex", alignItems: "center", gap: 3,
                }}>
                  <TrendingUp size={12} strokeWidth={2.4} /> {s.delta}
                </span>
              </div>
              <div style={{ fontFamily: FONT_GROTESK, fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em" }}>
                {s.value}
              </div>
              <div style={{
                fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute,
                letterSpacing: "0.12em", textTransform: "uppercase",
              }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Two-up: next event + payout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <Panel title="Próximo evento" icon={Calendar}>
          <div style={{ fontFamily: FONT_GROTESK, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {ASSIGNED[0].name}
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: c.inkSoft, marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Calendar size={13} color={c.inkMute} strokeWidth={2} /> {ASSIGNED[0].date} 2026
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <MapPin size={13} color={c.inkMute} strokeWidth={2} /> {ASSIGNED[0].venue} · {ASSIGNED[0].city}
            </span>
          </div>
          <span style={{
            marginTop: 14, alignSelf: "flex-start",
            fontFamily: FONT_MONO, fontSize: 10, color: c.warn,
            letterSpacing: "0.12em", textTransform: "uppercase",
            border: `1px solid ${c.warn}`, padding: "4px 10px",
          }}>Confirmado · cobertura asignada</span>
        </Panel>

        <Panel title="Saldo disponible" icon={Wallet}>
          <div style={{ fontFamily: FONT_GROTESK, fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", color: c.ok }}>
            {fmtMXN(8420)}
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: c.inkSoft, marginTop: 6 }}>
            Próximo pago: 30 May · quincenal
          </div>
          <a href="#" style={{ ...secondaryCTA, marginTop: 16, alignSelf: "flex-start" }} className="pd-cta-secondary">
            Ver historial <ChevronRight size={14} strokeWidth={2.4} />
          </a>
        </Panel>
      </div>

      {/* Recent sales preview */}
      <Panel title="Ventas recientes" icon={DollarSign}>
        <SalesTable rows={SALES.slice(0, 3)} />
      </Panel>
    </div>
  );
}

// ─── Tab: Eventos ────────────────────────────────────────────────────────

function Eventos({ onUpload }: { onUpload: (code: string, name: string) => void }) {
  const STATE_LABEL: Record<string, { label: string; color: string }> = {
    upcoming: { label: "Próximo", color: "#FFD166" },
    uploading: { label: "Subiendo", color: "#00E5FF" },
    live: { label: "En vivo", color: "#FF3B6E" },
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {ASSIGNED.map((e) => {
        const st = STATE_LABEL[e.state];
        return (
          <div key={e.code} style={{
            border: `1px solid ${c.border}`, background: c.surface,
            padding: "22px 24px",
            display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
          }} className="pd-event-row">
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 10, color: c.accent,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                }}>{e.code}</span>
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 10, color: st.color,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.color }} />
                  {st.label}
                </span>
              </div>
              <div style={{ fontFamily: FONT_GROTESK, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {e.name}
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: c.inkSoft, marginTop: 4 }}>
                {e.date} 2026 · {e.venue} · {e.city}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: FONT_GROTESK, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
                {e.uploaded > 0 ? e.uploaded.toLocaleString("es-MX") : "—"}
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Fotos subidas
              </div>
            </div>
            <button onClick={() => onUpload(e.code, e.name)} style={{ ...(e.state === "upcoming" ? secondaryCTA : primaryCTA), cursor: "pointer" }} className={e.state === "upcoming" ? "pd-cta-secondary" : "pd-cta"}>
              <Upload size={15} strokeWidth={2.4} />
              <span>{e.uploaded > 0 ? "Subir más" : "Subir fotos"}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Ventas ───────────────────────────────────────────────────────────

function Ventas() {
  const total = SALES.reduce((n, s) => n + s.amount, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 1, background: c.border, border: `1px solid ${c.border}`,
      }}>
        {[
          { label: "Ventas (30 días)", value: `${SALES.length * 24}` },
          { label: "Ingreso bruto", value: fmtMXN(total * 12) },
          { label: "Ticket promedio", value: fmtMXN(Math.round(total / SALES.length)) },
        ].map((s, i) => (
          <div key={i} style={{ background: c.bg, padding: "22px 22px" }}>
            <div style={{ fontFamily: FONT_GROTESK, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: i === 0 ? c.accent : c.ink }}>{s.value}</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <Panel title="Detalle de ventas" icon={DollarSign}>
        <SalesTable rows={SALES} />
      </Panel>
    </div>
  );
}

// ─── Tab: Pagos ────────────────────────────────────────────────────────────

function Pagos() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Panel title="Saldo y método" icon={Wallet}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: FONT_GROTESK, fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em", color: c.ok }}>
              {fmtMXN(8420)}
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: c.inkSoft, marginTop: 4 }}>
              Disponible · próximo pago 30 May
            </div>
          </div>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 12, color: c.inkSoft,
            border: `1px solid ${c.border}`, padding: "10px 14px", background: c.surfaceHi,
          }}>
            Depósito · CLABE •••• 4821
          </div>
        </div>
      </Panel>

      <Panel title="Historial de pagos" icon={Clock}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {PAYOUTS.map((p, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14,
              padding: "16px 0", borderTop: i === 0 ? "none" : `1px solid ${c.border}`,
            }}>
              <div>
                <div style={{ fontFamily: FONT_GROTESK, fontSize: 15, fontWeight: 600 }}>{p.period}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute, marginTop: 2 }}>Pagado · {p.date}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: FONT_GROTESK, fontSize: 18, fontWeight: 700 }}>{fmtMXN(p.amount)}</span>
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 10, color: c.ok,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  display: "inline-flex", alignItems: "center", gap: 5,
                  border: `1px solid ${c.ok}`, padding: "3px 8px",
                }}>
                  <CheckCircle2 size={12} strokeWidth={2.4} /> Pagado
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ─── Shared ──────────────────────────────────────────────────────────────

function Panel({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${c.border}`, background: c.surface, padding: "24px 24px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <Icon size={16} color={c.accent} strokeWidth={2} />
        <span style={{
          fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: c.ink,
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function SalesTable({ rows }: { rows: typeof SALES }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {rows.map((s, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14,
          padding: "14px 0", borderTop: i === 0 ? "none" : `1px solid ${c.border}`,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: FONT_GROTESK, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.event}</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute, marginTop: 2 }}>
              {s.product} ×{s.qty} · {s.when}
            </div>
          </div>
          <span style={{ fontFamily: FONT_GROTESK, fontSize: 16, fontWeight: 700, color: c.ok, flexShrink: 0 }}>
            +{fmtMXN(s.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}

const primaryCTA: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8,
  background: c.accent, color: "#000", padding: "12px 20px",
  fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700,
  letterSpacing: "0.06em", textTransform: "uppercase",
  textDecoration: "none", border: "none", borderRadius: 0, cursor: "pointer",
  transition: "transform 0.18s ease, box-shadow 0.18s ease", flexShrink: 0,
};

const secondaryCTA: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8,
  background: "transparent", color: c.ink, padding: "12px 18px",
  fontFamily: FONT_MONO, fontSize: 12, fontWeight: 600,
  letterSpacing: "0.06em", textTransform: "uppercase",
  textDecoration: "none", border: `1.5px solid ${c.borderStrong}`,
  borderRadius: 0, cursor: "pointer", transition: "border-color 0.18s ease", flexShrink: 0,
};

const globalCSS = `
  .pd-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,229,255,0.26); }
  .pd-cta-secondary:hover { border-color: ${c.ink}; }
  .pd-event-row:hover { border-color: ${c.borderStrong}; }
  @keyframes fs-fade { from { opacity: 0 } to { opacity: 1 } }
  @keyframes fs-rise { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: none } }
  @keyframes fs-spin { to { transform: rotate(360deg) } }
  @keyframes fs-row { from { opacity: 0; transform: translateX(-6px) } to { opacity: 1; transform: none } }
  .fs-spin { animation: fs-spin 0.8s linear infinite; transform-origin: center; }
  .fs-up-overlay { animation: fs-fade 0.18s ease; }
  .fs-up-card { animation: fs-rise 0.28s cubic-bezier(.2,.7,.3,1); }
  .fs-up-row { animation: fs-row 0.24s ease both; }
  .fs-up-close:hover { color: ${c.ink} !important; border-color: ${c.borderStrong} !important; }
  .fs-up-done:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(0,229,255,0.26); }
`;

// ─── Upload simulation (model A: in-dashboard upload) ────────────────────────
// Photographer drops files → client-side validation (format + min resolution +
// size) → async status machine subiendo → procesando → publicado. Watermark +
// face-index happen server-side in the background, so the photographer can
// close the panel and come back: state persists per event in localStorage and
// any in-flight item is shown as published on return (the background finished).

const ALLOWED_EXT = ["jpg", "jpeg", "png", "heic", "heif", "webp"];
const HEIC_EXT = ["heic", "heif"];
const MIN_EDGE = 2000;            // px on the long edge
const MAX_BYTES = 50 * 1024 * 1024;

type UpStatus = "checking" | "uploading" | "processing" | "published" | "rejected";
type UpFile = {
  id: string;
  name: string;
  size: number;
  w?: number;
  h?: number;
  status: UpStatus;
  progress: number;     // 0–100 during "uploading"
  reason?: string;      // why rejected
  note?: string;        // soft warning (e.g. HEIC not verifiable)
};

const STATUS_META: Record<UpStatus, { label: string; color: string }> = {
  checking:   { label: "Validando",  color: c.inkSoft },
  uploading:  { label: "Subiendo",   color: c.accent },
  processing: { label: "Procesando", color: c.premium },
  published:  { label: "Publicado",  color: c.ok },
  rejected:   { label: "Rechazado",  color: c.magenta },
};

function fmtBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

function readDimensions(file: File): Promise<{ w: number; h: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { resolve(null); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

// Restore the prior session for this event. Anything caught mid-flight when the
// panel was closed shows as published — the server-side job finished while the
// window was away. Runs only client-side (the panel never mounts during SSR).
function loadSession(storageKey: string): UpFile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const saved = JSON.parse(raw) as UpFile[];
    return saved.map((f) =>
      f.status === "uploading" || f.status === "processing" || f.status === "checking"
        ? { ...f, status: "published", progress: 100 }
        : f,
    );
  } catch { return []; }
}

interface ServerPhoto {
  id: string; status: string | null; reject_reason: string | null;
  width: number | null; height: number | null; size_bytes: number | null; created_at: string;
}

function UploadPanel({ eventCode, eventName, onClose }: { eventCode: string; eventName: string; onClose: () => void }) {
  const storageKey = `fs_uploads_${eventCode}`;
  // Lazy init reads the saved session synchronously — no load effect, so the
  // save effect below can never race ahead of it and clobber storage with [].
  const [files, setFiles] = useState<UpFile[]>(() => loadSession(storageKey));
  const [dragOver, setDragOver] = useState(false);
  // 'live' = the event has photo_source='live' in D1 → real upload to R2.
  // 'sim' = demo/mock event → the original timer simulation. null = resolving
  // (drop zone disabled so files can't race the mode check).
  const [mode, setMode] = useState<"sim" | "live" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Clear any in-flight simulation timers when the panel unmounts.
  useEffect(() => {
    const t = timers.current;
    return () => { Object.values(t).forEach(clearTimeout); };
  }, []);

  // Resolve the event's mode; for live events the server rows are the truth
  // (statuses survive across devices), local entries only supply display names.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/fansnap/api/photographer/uploads?event=${encodeURIComponent(eventCode)}`, { cache: "no-store" });
        const j = await r.json();
        if (!alive) return;
        if (r.ok && j.mode === "live") {
          setMode("live");
          const server = (j.photos ?? []) as ServerPhoto[];
          setFiles((prev) => {
            const names = new Map(prev.map((f) => [f.id, f.name]));
            const rows: UpFile[] = server.map((p) => ({
              id: p.id,
              name: names.get(p.id) ?? `foto_${p.id.slice(-6)}`,
              size: p.size_bytes ?? 0,
              w: p.width ?? undefined,
              h: p.height ?? undefined,
              status: p.status === "published" ? "published"
                : p.status === "processing" ? "processing"
                : p.status === "rejected" ? "rejected"
                : "rejected", // stuck 'uploading' = interrupted — re-drop it
              progress: 100,
              reason: p.status === "uploading" ? "Subida interrumpida — vuelve a soltarla"
                : p.reject_reason ?? undefined,
            }));
            const serverIds = new Set(rows.map((s) => s.id));
            // Keep purely-local rejects (files the client refused pre-upload).
            const localOnly = prev.filter((f) => !serverIds.has(f.id) && f.status === "rejected");
            return [...rows, ...localOnly];
          });
        } else {
          setMode("sim");
        }
      } catch { if (alive) setMode("sim"); }
    })();
    return () => { alive = false; };
  }, [eventCode]);

  // Persist whenever the list changes (mount write just rewrites the restored data).
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(files)); } catch { /* quota */ }
  }, [files, storageKey]);

  const patch = useCallback((id: string, p: Partial<UpFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...p } : f)));
  }, []);

  // Async status machine: subiendo (animated progress) → procesando → publicado.
  const simulate = useCallback((id: string) => {
    let prog = 0;
    const step = () => {
      prog += 11 + Math.random() * 17;
      if (prog >= 100) {
        patch(id, { status: "processing", progress: 100 });
        timers.current[id] = setTimeout(() => patch(id, { status: "published" }), 1400 + Math.random() * 1100);
      } else {
        patch(id, { progress: Math.round(prog) });
        timers.current[id] = setTimeout(step, 150 + Math.random() * 170);
      }
    };
    patch(id, { status: "uploading", progress: 0 });
    timers.current[id] = setTimeout(step, 220);
  }, [patch]);

  // Real path (live events): register on the server, then stream the bytes to
  // R2. Status ends at 'processing' — Fase 2's pipeline (watermark + face
  // index) is what flips it to 'published'.
  const uploadLive = useCallback(async (tempId: string, file: File, dims: { w: number; h: number } | null) => {
    patch(tempId, { status: "uploading", progress: 0 });
    let sid = tempId;
    try {
      const init = await fetch("/fansnap/api/photographer/uploads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventCode, name: file.name, size: file.size, type: file.type, width: dims?.w, height: dims?.h }),
      });
      const j = await init.json().catch(() => ({}));
      if (!init.ok || !j.id) throw new Error();
      sid = j.id as string;
      // Adopt the server id so reopening reconciles by id against GET.
      setFiles((prev) => prev.map((f) => (f.id === tempId ? { ...f, id: sid } : f)));
      const put = await fetch(`/fansnap/api/photographer/uploads?id=${encodeURIComponent(sid)}`, {
        method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file,
      });
      if (!put.ok) throw new Error();
      patch(sid, { status: "processing", progress: 100 });
    } catch {
      patch(sid, { status: "rejected", reason: "Error al subir — inténtalo de nuevo" });
    }
  }, [eventCode, patch]);

  const ingest = useCallback(async (list: FileList | File[]) => {
    // The drop zone stays disabled until `mode` resolves, so this only runs
    // with a settled mode.
    const send = (id: string, file: File, dims: { w: number; h: number } | null) => {
      if (mode === "live") void uploadLive(id, file, dims);
      else simulate(id);
    };
    const arr = Array.from(list);
    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
      const id = `${Date.now().toString(36)}-${i}-${Math.random().toString(36).slice(2, 7)}`;
      const ext = (file.name.split(".").pop() ?? "").toLowerCase();
      setFiles((prev) => [...prev, { id, name: file.name, size: file.size, status: "checking", progress: 0 }]);

      if (!ALLOWED_EXT.includes(ext)) {
        patch(id, { status: "rejected", reason: "Formato no admitido" });
        continue;
      }
      if (file.size > MAX_BYTES) {
        patch(id, { status: "rejected", reason: `Supera 50 MB (${fmtBytes(file.size)})` });
        continue;
      }
      const dims = await readDimensions(file);
      if (!dims) {
        if (HEIC_EXT.includes(ext)) {
          patch(id, { note: "Resolución no verificable en el navegador", w: undefined, h: undefined });
          void send(id, file, null);
        } else {
          patch(id, { status: "rejected", reason: "No se pudo leer la imagen" });
        }
        continue;
      }
      if (Math.max(dims.w, dims.h) < MIN_EDGE) {
        patch(id, { status: "rejected", w: dims.w, h: dims.h, reason: `Resolución baja · ${dims.w}×${dims.h}` });
        continue;
      }
      patch(id, { w: dims.w, h: dims.h });
      void send(id, file, dims);
    }
  }, [patch, simulate, uploadLive, mode]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!mode) return; // still resolving live/sim — don't accept drops yet
    if (e.dataTransfer.files?.length) ingest(e.dataTransfer.files);
  };

  const published = files.filter((f) => f.status === "published").length;
  const inFlight = files.filter((f) => f.status === "uploading" || f.status === "processing" || f.status === "checking").length;
  const rejected = files.filter((f) => f.status === "rejected").length;

  return (
    <div
      className="fs-up-overlay"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.82)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        className="fs-up-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 660, maxHeight: "90vh",
          background: c.surface, border: `1px solid ${c.borderStrong}`,
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16,
          padding: "20px 24px", borderBottom: `1px solid ${c.border}`,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 10, color: c.accent,
              letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6,
            }}>{eventCode} · Subir fotos</div>
            <div style={{
              fontFamily: FONT_GROTESK, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{eventName}</div>
          </div>
          <button
            onClick={onClose}
            className="fs-up-close"
            aria-label="Cerrar"
            style={{
              flexShrink: 0, width: 40, height: 40, display: "grid", placeItems: "center",
              background: "transparent", color: c.inkSoft, cursor: "pointer",
              border: `1px solid ${c.border}`, transition: "color .15s, border-color .15s",
            }}
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Drop zone */}
          <div
            onClick={() => { if (mode) inputRef.current?.click(); }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{
              border: `1.5px dashed ${dragOver ? c.accent : c.borderStrong}`,
              background: dragOver ? c.accentSoft : c.surfaceHi,
              padding: "38px 24px", textAlign: "center", cursor: mode ? "pointer" : "wait",
              opacity: mode ? 1 : 0.6,
              transition: "border-color .15s, background .15s, opacity .15s",
            }}
          >
            <CloudUpload size={34} color={dragOver ? c.accent : c.inkSoft} strokeWidth={1.6} style={{ marginBottom: 12 }} />
            <div style={{ fontFamily: FONT_GROTESK, fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>
              {mode === null ? "Verificando evento…" : dragOver ? "Suelta para subir" : "Arrastra tus fotos aquí"}
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: c.inkSoft, marginTop: 6 }}>
              o haz clic para buscar en tu equipo
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.heic,.heif,.webp,image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              hidden
              onChange={(e) => { if (e.target.files?.length) ingest(e.target.files); e.target.value = ""; }}
            />
          </div>

          {/* Rules */}
          <div style={{
            fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute, lineHeight: 1.7,
            display: "flex", flexWrap: "wrap", gap: "2px 14px",
          }}>
            <span>JPEG · PNG · HEIC · WebP</span>
            <span style={{ color: c.border }}>·</span>
            <span>mín. {MIN_EDGE.toLocaleString("es-MX")} px lado largo</span>
            <span style={{ color: c.border }}>·</span>
            <span>máx. 50 MB</span>
            <span style={{ color: c.border }}>·</span>
            <span style={{ color: mode === "live" ? c.ok : c.warn, fontWeight: 700 }}>
              {mode === "live" ? "subida real" : mode === "sim" ? "simulación" : "…"}
            </span>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", border: `1px solid ${c.border}` }}>
              {files.map((f, i) => {
                const m = STATUS_META[f.status];
                return (
                  <div
                    key={f.id}
                    className="fs-up-row"
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "12px 14px",
                      borderTop: i === 0 ? "none" : `1px solid ${c.border}`,
                      background: f.status === "rejected" ? "rgba(255,45,135,0.05)" : "transparent",
                    }}
                  >
                    {/* Status glyph */}
                    <div style={{
                      width: 34, height: 34, flexShrink: 0, display: "grid", placeItems: "center",
                      border: `1px solid ${m.color}`, color: m.color,
                      background: f.status === "published" ? "rgba(74,222,128,0.10)" : "transparent",
                    }}>
                      {f.status === "published" ? <CheckCircle2 size={17} strokeWidth={2.2} />
                        : f.status === "rejected" ? <AlertTriangle size={16} strokeWidth={2.2} />
                        : f.status === "processing" ? <Loader2 size={16} strokeWidth={2.2} className="fs-spin" />
                        : f.status === "uploading" ? <Loader2 size={16} strokeWidth={2.2} className="fs-spin" />
                        : <FileImage size={16} strokeWidth={2} />}
                    </div>

                    {/* Name + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: FONT_GROTESK, fontSize: 14, fontWeight: 600,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{f.name}</div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: c.inkMute, marginTop: 2 }}>
                        {fmtBytes(f.size)}
                        {f.w && f.h ? ` · ${f.w}×${f.h}` : ""}
                        {f.reason ? ` · ${f.reason}` : ""}
                        {f.note ? ` · ${f.note}` : ""}
                      </div>
                      {f.status === "uploading" && (
                        <div style={{ height: 3, background: c.border, marginTop: 7, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${f.progress}%`, background: c.accent, transition: "width .18s linear" }} />
                        </div>
                      )}
                    </div>

                    {/* Status pill */}
                    <span style={{
                      flexShrink: 0, fontFamily: FONT_MONO, fontSize: 9.5, fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase", color: m.color,
                      border: `1px solid ${m.color}`, padding: "3px 8px",
                    }}>
                      {f.status === "uploading" && f.progress > 0 ? `${f.progress}%` : m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: `1px solid ${c.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
        }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inkSoft, lineHeight: 1.6 }}>
            {files.length === 0
              ? "Sin archivos todavía"
              : <>
                  <span style={{ color: c.ok }}>{published} publicadas</span>
                  {inFlight > 0 && <> · <span style={{ color: c.premium }}>{inFlight} en proceso</span></>}
                  {rejected > 0 && <> · <span style={{ color: c.magenta }}>{rejected} rechazadas</span></>}
                  <div style={{ color: c.inkMute, marginTop: 3 }}>
                    Puedes cerrar — el procesado sigue en segundo plano.
                  </div>
                </>}
          </div>
          <button onClick={onClose} className="fs-up-done" style={{ ...primaryCTA }}>
            <CheckCircle2 size={15} strokeWidth={2.4} />
            <span>Listo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
