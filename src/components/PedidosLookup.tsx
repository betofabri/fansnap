"use client";

// PedidosLookup
// ─────────────
// Order recovery page (/fansnap/pedidos). A fan who closed the confirmation
// tab can re-find their order on the same device by entering order number +
// email. Reads from localStorage (see cart.ts → findOrder) since orders are
// device-local until accounts + D1 land. When no match is found we say so
// plainly and explain the device limitation.

import { useState } from "react";
import {
  ArrowRight, Search, Download, Package, CheckCircle2, AlertCircle, Clock,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import { findOrder, formatMXN, computeTotals, type PlacedOrder } from "@/lib/cart";

const FONT_GROTESK = `"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
const FONT_MONO = `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace`;

const c = {
  bg: "#000000",
  surface: "#0A0A0A",
  ink: "#F4F4F2",
  inkSoft: "#A8A8A4",
  inkMute: "#5C5C58",
  border: "rgba(244,244,242,0.10)",
  borderStrong: "rgba(244,244,242,0.25)",
  accent: "#00E5FF",
  accentSoft: "rgba(0,229,255,0.12)",
  magenta: "#FF2D87",
  premium: "#9D4EFF",
  warn: "#FFD166",
  ok: "#4ADE80",
};

type State =
  | { kind: "idle" }
  | { kind: "notfound" }
  | { kind: "found"; order: PlacedOrder };

export default function PedidosLookup() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!orderNumber.trim() || !email.trim()) {
      setError("Ingresa tu número de orden y tu email.");
      return;
    }
    const order = findOrder(orderNumber, email);
    setState(order ? { kind: "found", order } : { kind: "notfound" });
  }

  function reset() {
    setState({ kind: "idle" });
    setError(null);
  }

  return (
    <div style={{ background: c.bg, color: c.ink, fontFamily: FONT_GROTESK, minHeight: "100vh" }}>
      <style>{globalCSS}</style>
      <SiteHeader lang="es" />

      <section style={{
        maxWidth: 760, margin: "0 auto",
        padding: "clamp(48px, 7vw, 96px) clamp(20px, 4vw, 40px) 80px",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          fontFamily: FONT_MONO, fontSize: 11,
          color: c.inkMute, letterSpacing: "0.18em", textTransform: "uppercase",
          marginBottom: 22,
        }}>
          <span style={{ color: c.accent, fontWeight: 700 }}>/ 01</span>
          <span style={{ width: 24, height: 1, background: c.border }} />
          <span>Mis pedidos</span>
        </div>

        <h1 style={{
          fontFamily: FONT_GROTESK,
          fontSize: "clamp(40px, 7vw, 80px)",
          fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.96,
          margin: "0 0 18px",
        }}>
          Recupera<br/> tu <span style={{ color: c.magenta }}>pedido.</span>
        </h1>
        <p style={{
          fontFamily: FONT_GROTESK, fontSize: "clamp(15px, 1.3vw, 18px)",
          color: c.inkSoft, lineHeight: 1.55, margin: 0, maxWidth: 560,
        }}>
          Ingresa tu número de orden y el email de la compra para ver el estado y volver a descargar tus fotos.
        </p>

        {state.kind !== "found" && (
          <form onSubmit={onSubmit} style={{
            marginTop: 44,
            display: "flex", flexDirection: "column", gap: 18,
          }}>
            <Field
              label="Número de orden"
              value={orderNumber}
              onChange={setOrderNumber}
              placeholder="FS-2026-06-1234"
              mono
            />
            <Field
              type="email"
              label="Email de la compra"
              value={email}
              onChange={setEmail}
              placeholder="tu@correo.com"
            />

            {error && (
              <div style={alertBox(c.magenta)}>
                <AlertCircle size={16} strokeWidth={2.2} />
                <span>{error}</span>
              </div>
            )}

            {state.kind === "notfound" && (
              <div style={alertBox(c.warn)}>
                <AlertCircle size={16} strokeWidth={2.2} />
                <span>
                  No encontramos ese pedido en este dispositivo. Por ahora los
                  pedidos se guardan en el navegador donde compraste —
                  intenta desde ese mismo dispositivo. Pronto: cuentas para
                  acceder desde cualquier lado.
                </span>
              </div>
            )}

            <button type="submit" style={{
              ...primaryCTA, padding: "20px 32px", fontSize: 15,
              justifyContent: "center", marginTop: 4,
            }} className="pe-cta">
              <Search size={18} strokeWidth={2.2} />
              <span>Buscar pedido</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>

            <p style={{
              textAlign: "center", fontFamily: FONT_MONO, fontSize: 10,
              color: c.inkMute, letterSpacing: "0.1em", textTransform: "uppercase",
              margin: "4px 0 0",
            }}>
              ¿No tienes una compra aún? <a href="/fansnap" style={{ color: c.accent, textDecoration: "none" }}>Encuentra tus fotos →</a>
            </p>
          </form>
        )}

        {state.kind === "found" && (
          <OrderView order={state.order} onReset={reset} />
        )}
      </section>
    </div>
  );
}

// ─── Order view ──────────────────────────────────────────────────────────

function OrderView({ order, onReset }: { order: PlacedOrder; onReset: () => void }) {
  const totals = computeTotals(order.items);
  const digitals = order.items.filter((it) => it.fulfillment === "instant");
  const physicals = order.items.filter((it) => it.fulfillment !== "instant");
  const placed = new Date(order.placedAt);
  const placedStr = new Intl.DateTimeFormat("es-MX", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(placed);

  return (
    <div style={{ marginTop: 44, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header card */}
      <div style={{
        border: `1.5px solid ${c.accent}`, background: c.accentSoft,
        padding: "28px 26px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <CheckCircle2 size={20} color={c.accent} strokeWidth={2.2} />
          <span style={{
            fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: c.accent,
            letterSpacing: "0.14em", textTransform: "uppercase",
          }}>Pedido encontrado</span>
        </div>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 24, fontWeight: 700,
          color: c.ink, letterSpacing: "0.06em",
        }}>{order.number}</div>
        <div style={{
          marginTop: 8, fontFamily: FONT_MONO, fontSize: 12, color: c.inkSoft,
          letterSpacing: "0.04em",
        }}>
          {order.email} · {placedStr}
        </div>

        {order.oxxoReference && (
          <div style={{
            marginTop: 16, paddingTop: 16, borderTop: `1px solid ${c.border}`,
            display: "flex", alignItems: "center", gap: 10,
            fontFamily: FONT_MONO, fontSize: 12, color: c.warn,
          }}>
            <Clock size={15} strokeWidth={2.2} />
            <span>Pago OXXO pendiente · Ref: {order.oxxoReference}</span>
          </div>
        )}
      </div>

      {/* Digital items */}
      {digitals.length > 0 && (
        <div style={cardStyle}>
          <SubHead icon={Download} label={`Fotos digitales (${digitals.length})`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            {digitals.map((it) => (
              <OrderLine key={it.lineId} item={it} action="download" />
            ))}
          </div>
        </div>
      )}

      {/* Physical items */}
      {physicals.length > 0 && (
        <div style={cardStyle}>
          <SubHead icon={Package} label={`Productos físicos (${physicals.length})`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            {physicals.map((it) => (
              <OrderLine key={it.lineId} item={it} action="shipping" />
            ))}
          </div>
        </div>
      )}

      {/* Total */}
      <div style={{
        ...cardStyle,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{
          fontFamily: FONT_MONO, fontSize: 12, color: c.inkSoft,
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>Total pagado</span>
        <span style={{
          fontFamily: FONT_GROTESK, fontSize: 28, fontWeight: 800,
          letterSpacing: "-0.02em", color: c.accent,
        }}>{formatMXN(totals.totalMXN)}</span>
      </div>

      <button onClick={onReset} style={{
        ...secondaryCTA, justifyContent: "center",
      }} className="pe-cta-secondary">
        Buscar otro pedido
      </button>
    </div>
  );
}

function OrderLine({ item, action }: { item: PlacedOrder["items"][number]; action: "download" | "shipping" }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "12px 0", borderTop: `1px solid ${c.border}`,
    }}>
      <div style={{
        width: 48, height: 48, flexShrink: 0,
        backgroundImage: `url(${item.photoImage})`,
        backgroundColor: item.photoTile,
        backgroundSize: "cover", backgroundPosition: "center",
        border: `1px solid ${c.border}`,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: FONT_GROTESK, fontSize: 14, fontWeight: 600, color: c.ink,
        }}>{item.eventName}</div>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 11, color: c.inkSoft, marginTop: 2,
        }}>
          {item.productSku.toUpperCase()}{item.size ? ` · ${item.size}` : ""} · {item.photoTimestamp}
        </div>
      </div>
      {action === "download" ? (
        <button style={lineBtn} className="pe-line-btn">
          <Download size={14} strokeWidth={2.4} />
          <span>Descargar</span>
        </button>
      ) : (
        <span style={{
          fontFamily: FONT_MONO, fontSize: 10, color: c.warn,
          letterSpacing: "0.1em", textTransform: "uppercase",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          <Clock size={13} strokeWidth={2.2} />
          {typeof item.fulfillment === "number" ? `${item.fulfillment}d` : "En proceso"}
        </span>
      )}
    </div>
  );
}

function SubHead({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Icon size={18} strokeWidth={2} color={c.accent} />
      <span style={{
        fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: c.ink,
        letterSpacing: "0.1em", textTransform: "uppercase",
      }}>{label}</span>
    </div>
  );
}

// ─── Primitives ──────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  border: `1px solid ${c.border}`, background: c.surface, padding: "24px 24px",
};

const primaryCTA: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 10,
  background: c.accent, color: "#000",
  padding: "16px 26px",
  fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700,
  letterSpacing: "0.06em", textTransform: "uppercase",
  textDecoration: "none", borderRadius: 0, border: "none", cursor: "pointer",
  transition: "transform 0.18s ease, box-shadow 0.18s ease",
};

const secondaryCTA: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8,
  background: "transparent", color: c.ink,
  padding: "16px 26px",
  fontFamily: FONT_MONO, fontSize: 13, fontWeight: 600,
  letterSpacing: "0.06em", textTransform: "uppercase",
  textDecoration: "none", border: `1.5px solid ${c.borderStrong}`,
  borderRadius: 0, cursor: "pointer",
  transition: "border-color 0.18s ease",
};

const lineBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
  background: "transparent", color: c.accent,
  border: `1.5px solid rgba(0,229,255,0.45)`,
  padding: "8px 14px",
  fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700,
  letterSpacing: "0.06em", textTransform: "uppercase",
  cursor: "pointer", transition: "all 0.15s ease",
};

function alertBox(color: string): React.CSSProperties {
  return {
    display: "flex", alignItems: "flex-start", gap: 10,
    padding: "14px 16px",
    background: "rgba(255,255,255,0.02)",
    border: `1px solid ${color}`,
    color,
    fontFamily: FONT_MONO, fontSize: 12, lineHeight: 1.5,
    letterSpacing: "0.02em",
  };
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  mono?: boolean;
}

function Field({ label, value, onChange, type = "text", placeholder, mono }: FieldProps) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }} className="pe-field">
      <span style={{
        fontFamily: FONT_MONO, fontSize: 11, color: c.accent,
        letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
      }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "rgba(0,229,255,0.045)",
          border: `1.5px solid rgba(0,229,255,0.35)`,
          padding: "16px 18px",
          fontFamily: mono ? FONT_MONO : FONT_GROTESK,
          fontSize: 15, color: c.ink, borderRadius: 0, outline: "none", width: "100%",
          letterSpacing: mono ? "0.06em" : "normal",
          transition: "border-color 0.18s ease, background 0.18s ease",
        }}
      />
    </label>
  );
}

const globalCSS = `
  .pe-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(0,229,255,0.28); }
  .pe-cta-secondary:hover { border-color: ${c.ink}; }
  .pe-line-btn:hover { background: ${c.accent}; color: #000; }
  .pe-field:focus-within input {
    border-color: ${c.accent} !important;
    background: rgba(0,229,255,0.085) !important;
    box-shadow: 0 0 0 4px ${c.accentSoft};
  }
`;
