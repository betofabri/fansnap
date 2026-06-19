"use client";

// EventDetail
// ───────────
// Public, indexable detail page for a single event (/fansnap/eventos/<code>).
// Rendered by the SSR route, so this is pre-rendered to static HTML. The
// primary CTA deep-links into the SPA face-match flow via /fansnap?event=CODE.
//
// Visual language matches the brand-facing landings: SiteHeader chrome,
// brutalist palette, mono labels. Photos shown here are the same watermarked
// previews used across the site.

import { ArrowRight, CalendarDays, MapPin, Camera, Images, ScanFace } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import FanSnapLogo from "@/components/FanSnapLogo";
import { EVENTS, getPhotosForEvent, type Event as FsEvent } from "@/lib/mock";

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
  live: "#FF3B6E",
};

const CATEGORY_ES: Record<string, string> = {
  music: "Música en vivo",
  conventions: "Convención",
  sports: "Deportes",
  parties: "Fiesta",
};

const STATUS_ES: Record<string, { label: string; color: string }> = {
  live: { label: "En vivo", color: "#FF3B6E" },
  upcoming: { label: "Próximamente", color: "#FFD166" },
  recent: { label: "Disponible", color: "#00E5FF" },
};

function formatDate(iso: string): string {
  // Parse as UTC-safe Y/M/D to avoid TZ drift, format in es-MX.
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatCount(n: number): string {
  return new Intl.NumberFormat("es-MX").format(n);
}

export default function EventDetail({ event }: { event: FsEvent }) {
  const status = STATUS_ES[event.status] ?? STATUS_ES.recent;
  const category = CATEGORY_ES[event.category] ?? event.category;
  const previews = getPhotosForEvent(event.code).slice(0, 8);
  const others = EVENTS.filter((e) => e.code !== event.code).slice(0, 3);
  const flowHref = `/fansnap?event=${encodeURIComponent(event.code)}`;

  return (
    <div style={{ background: c.bg, color: c.ink, fontFamily: FONT_GROTESK, minHeight: "100vh" }}>
      <style>{globalCSS}</style>
      <SiteHeader lang="es" />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${event.imageHero})`,
          backgroundSize: "cover", backgroundPosition: "center",
          transform: "scale(1.04)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.78) 55%, ${c.bg} 100%)`,
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(${c.border} 1px, transparent 1px),
            linear-gradient(90deg, ${c.border} 1px, transparent 1px)`,
          backgroundSize: "56px 56px", opacity: 0.4,
          maskImage: "radial-gradient(circle at 50% 40%, #000 30%, transparent 80%)",
        }} />

        <div style={{
          position: "relative", zIndex: 2,
          maxWidth: 1100, margin: "0 auto",
          padding: "clamp(48px, 7vw, 96px) clamp(20px, 4vw, 40px) clamp(40px, 6vw, 72px)",
          display: "flex", flexDirection: "column", gap: 22,
        }}>
          {/* Breadcrumb + badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <a href="/fansnap" style={{
              fontFamily: FONT_MONO, fontSize: 11, color: c.inkSoft,
              letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none",
            }} className="ev-back">← Eventos</a>
            <span style={{ color: c.inkMute }}>/</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600,
              color: status.color, letterSpacing: "0.12em", textTransform: "uppercase",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", background: status.color,
                animation: event.status === "live" ? "ev-pulse 1.8s ease-in-out infinite" : "none",
              }} />
              {status.label}
            </span>
            <span style={{ color: c.inkMute }}>/</span>
            <span style={{
              fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute,
              letterSpacing: "0.12em", textTransform: "uppercase",
            }}>{category}</span>
          </div>

          {/* Event code */}
          <div style={{
            fontFamily: FONT_MONO, fontSize: 12, color: c.accent,
            letterSpacing: "0.22em", textTransform: "uppercase",
          }}>{event.code} →</div>

          {/* Name */}
          <h1 style={{
            fontFamily: FONT_GROTESK,
            fontSize: "clamp(40px, 7vw, 92px)",
            fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.96,
            margin: 0, maxWidth: 980,
          }}>{event.name}</h1>

          {/* Meta */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "10px 24px",
            fontFamily: FONT_MONO, fontSize: 13, color: c.inkSoft,
          }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, textTransform: "capitalize" }}>
              <CalendarDays size={15} strokeWidth={2} color={c.inkMute} />
              {formatDate(event.date)}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <MapPin size={15} strokeWidth={2} color={c.inkMute} />
              {event.venue} · {event.city}, {event.country}
            </span>
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
            <a href={flowHref} style={primaryCTA} className="ev-cta-primary">
              <ScanFace size={18} strokeWidth={2.2} />
              <span>Encuentra tus fotos</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </a>
          </div>
          <p style={{
            fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute,
            letterSpacing: "0.08em", textTransform: "uppercase", margin: 0,
          }}>
            Busca gratis · Paga solo por lo que quieras
          </p>

          {/* Stats strip */}
          <div style={{
            marginTop: "clamp(20px, 3vw, 36px)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 1, background: c.border, border: `1px solid ${c.border}`,
          }}>
            {[
              { icon: Images, k: event.photoCount > 0 ? formatCount(event.photoCount) : "Pronto", v: "Fotos en el evento" },
              { icon: Camera, k: formatCount(event.photogCount), v: "Fotógrafos cubriendo" },
              { icon: ScanFace, k: "IA", v: "Reconocimiento facial" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{
                  background: c.bg, padding: "20px 22px",
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <Icon size={18} strokeWidth={1.8} color={c.accent} />
                  <div style={{
                    fontFamily: FONT_GROTESK, fontSize: 26, fontWeight: 700,
                    letterSpacing: "-0.02em", color: i === 0 ? c.accent : c.ink,
                  }}>{s.k}</div>
                  <div style={{
                    fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                  }}>{s.v}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Preview gallery ────────────────────────────────────────────── */}
      {previews.length > 0 && (
        <section style={section}>
          <SectionLabel n="01" label="Vista previa" />
          <h2 style={sectionTitle}>Algunas tomas<br/> del evento.</h2>
          <p style={sectionSub}>
            Previews con marca de agua. Encuentra las tuyas con un selfie — la versión final llega sin marca.
          </p>

          <div style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 10,
          }}>
            {previews.map((p, i) => (
              <a
                key={i}
                href={flowHref}
                className="ev-photo"
                style={{
                  position: "relative",
                  aspectRatio: "3 / 4",
                  backgroundImage: `url(${p.image})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  border: `1px solid ${c.border}`,
                  display: "block",
                  filter: "grayscale(0.1)",
                }}
                aria-label="Encuentra tus fotos"
              >
                <span style={{
                  position: "absolute", left: 8, bottom: 8,
                  fontFamily: FONT_MONO, fontSize: 9, color: "rgba(255,255,255,0.7)",
                  letterSpacing: "0.1em",
                  textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                }}>{p.timestamp} · {p.photographer}</span>
              </a>
            ))}
          </div>

          <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
            <a href={flowHref} style={primaryCTA} className="ev-cta-primary">
              <ScanFace size={18} strokeWidth={2.2} />
              <span>Buscar mis fotos</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </a>
          </div>
        </section>
      )}

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section style={{ ...section, background: c.surface }}>
        <SectionLabel n="02" label="Cómo funciona" />
        <h2 style={sectionTitle}>Tres pasos.</h2>
        <div style={{
          marginTop: 40,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 1, background: c.border, border: `1px solid ${c.border}`,
        }}>
          {[
            { n: "01", t: "Tómate un selfie", b: "Una foto rápida desde tu cámara. No se guarda — solo se usa para el match." },
            { n: "02", t: "La IA te encuentra", b: "El reconocimiento facial busca tu rostro entre todas las fotos del evento." },
            { n: "03", t: "Compra las que quieras", b: "Ves tus fotos al instante. Pagas solo por las que te gustan, en MXN." },
          ].map((s, i) => (
            <div key={i} style={{
              background: c.bg, padding: "32px 28px",
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              <div style={{
                fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700,
                color: c.accent, letterSpacing: "0.1em",
              }}>{s.n}</div>
              <h3 style={{
                fontFamily: FONT_GROTESK, fontSize: 20, fontWeight: 700,
                letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0,
              }}>{s.t}</h3>
              <p style={{
                fontFamily: FONT_GROTESK, fontSize: 14, lineHeight: 1.55,
                color: c.inkSoft, margin: 0,
              }}>{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Other events ───────────────────────────────────────────────── */}
      <section style={section}>
        <SectionLabel n="03" label="Más eventos" />
        <h2 style={sectionTitle}>Otros eventos.</h2>
        <div style={{
          marginTop: 40,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}>
          {others.map((e) => {
            const st = STATUS_ES[e.status] ?? STATUS_ES.recent;
            return (
              <a
                key={e.code}
                href={`/fansnap/eventos/${e.code.toLowerCase()}`}
                className="ev-other-card"
                style={{
                  display: "block", textDecoration: "none", color: c.ink,
                  border: `1px solid ${c.border}`, overflow: "hidden",
                  background: c.surface,
                  transition: "border-color 0.18s ease, transform 0.18s ease",
                }}
              >
                <div style={{
                  aspectRatio: "16 / 10",
                  backgroundImage: `url(${e.image})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  filter: "grayscale(0.2)",
                }} />
                <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontFamily: FONT_MONO, fontSize: 10, color: c.accent,
                      letterSpacing: "0.12em", textTransform: "uppercase",
                    }}>{e.code}</span>
                    <span style={{
                      fontFamily: FONT_MONO, fontSize: 10, color: st.color,
                      letterSpacing: "0.12em", textTransform: "uppercase",
                    }}>{st.label}</span>
                  </div>
                  <h3 style={{
                    fontFamily: FONT_GROTESK, fontSize: 19, fontWeight: 700,
                    letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0,
                  }}>{e.name}</h3>
                  <span style={{
                    fontFamily: FONT_MONO, fontSize: 11, color: c.inkSoft,
                  }}>{e.venue} · {e.city}</span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{
        padding: "56px clamp(20px, 4vw, 40px) 40px",
        borderTop: `1px solid ${c.border}`, background: c.bg,
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
          alignItems: "flex-end",
        }}>
          <div>
            <FanSnapLogo size="sm" />
            <p style={{
              margin: "10px 0 0", fontFamily: FONT_GROTESK, fontSize: 13,
              color: c.inkSoft, maxWidth: 360, lineHeight: 1.5,
            }}>
              Encuentra tus fotos de los mejores eventos en México con reconocimiento facial.
            </p>
          </div>
          <nav style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            <a href="/fansnap" style={footLink} className="ev-foot-link">Inicio</a>
            <a href="/fansnap/fotografos" style={footLink} className="ev-foot-link">Fotógrafos</a>
            <a href="/fansnap/marcas" style={footLink} className="ev-foot-link">Marcas</a>
          </nav>
        </div>
        <div style={{
          maxWidth: 1100, margin: "32px auto 0", paddingTop: 22,
          borderTop: `1px solid ${c.border}`,
          fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute,
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          © FanSnap México 2026
        </div>
      </footer>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const section: React.CSSProperties = {
  padding: "50px clamp(20px, 4vw, 40px)",
  maxWidth: 1100,
  margin: "0 auto",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: FONT_GROTESK,
  fontSize: "clamp(34px, 5vw, 64px)",
  fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.96,
  margin: "0 0 16px",
};

const sectionSub: React.CSSProperties = {
  fontFamily: FONT_GROTESK,
  fontSize: "clamp(14px, 1.2vw, 17px)",
  color: c.inkSoft, lineHeight: 1.55, margin: 0, maxWidth: 600,
};

const primaryCTA: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 10,
  background: c.accent, color: "#000",
  padding: "16px 26px",
  fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700,
  letterSpacing: "0.06em", textTransform: "uppercase",
  textDecoration: "none", borderRadius: 0,
  transition: "transform 0.18s ease, box-shadow 0.18s ease",
  cursor: "pointer", border: "none",
};

const footLink: React.CSSProperties = {
  fontFamily: FONT_MONO, fontSize: 12, color: c.inkSoft,
  textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase",
  transition: "color 0.18s ease",
};

function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 12,
      fontFamily: FONT_MONO, fontSize: 11,
      color: c.inkMute, letterSpacing: "0.18em", textTransform: "uppercase",
      marginBottom: 22,
    }}>
      <span style={{ color: c.accent, fontWeight: 700 }}>/ {n}</span>
      <span style={{ width: 24, height: 1, background: c.border }} />
      <span>{label}</span>
    </div>
  );
}

const globalCSS = `
  @keyframes ev-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.3; transform: scale(0.7); }
  }
  .ev-back:hover { color: ${c.ink}; }
  .ev-foot-link:hover { color: ${c.ink}; }
  .ev-cta-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(0,229,255,0.28);
  }
  .ev-photo:hover { filter: grayscale(0) brightness(1.05) !important; }
  .ev-other-card:hover {
    border-color: ${c.borderStrong};
    transform: translateY(-2px);
  }
`;
