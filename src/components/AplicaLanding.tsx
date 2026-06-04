"use client";

/**
 * AplicaLanding — Photographer roster pre-registration landing.
 *
 * Sober palette, restrained typography, photo-forward. Pulls back from the
 * main FanSnap brutalist signature (no 2-3px hard borders, no corner brackets,
 * no purple→cyan gradient hero). Cyan + purple appear only as small accents:
 *   – cyan on the CTA + form focus states
 *   – purple only in the protocol code returned at the end
 *
 * Tone targets a working photographer audience — editorial / Mubi / Magnum
 * vibes, not festival-pass flair.
 *
 * Endpoint: POST /fansnap/api/photographers/apply (route handler in
 * src/app/api/photographers/apply/route.ts).
 */

import { useState, useRef, useEffect } from "react";
import {
  ArrowRight, ArrowDown, Check, Mail, Phone, MapPin, Link2, Camera, Loader2,
} from "lucide-react";

// ─── Sober palette local to this page ───────────────────────────────────────
const c = {
  bg: "#0E0E11",
  surface: "rgba(255,255,255,0.025)",
  surfaceStrong: "rgba(255,255,255,0.045)",
  ink: "#F5F5F7",
  inkSoft: "#9A9AA4",
  inkMute: "#5C5C66",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  borderFocus: "rgba(0,229,255,0.55)",
  accent: "#00E5FF",        // cyan — used sparingly
  accentSoft: "rgba(0,229,255,0.12)",
  premium: "#9D4EFF",       // purple — only on success state
};

const FONT_GROTESK = "var(--font-grotesk), system-ui, sans-serif";
const FONT_MONO = "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace";

const EVENT_TYPES = [
  "Música en vivo",
  "Conventions",
  "Deportes",
  "Fiestas",
  "Teatro",
  "Corporativos",
  "Maratones",
];

const EQUIPMENT_OPTIONS = [
  "Cámara profesional",
  "Lentes teleobjetivos",
  "Flash externo",
  "Laptop en campo",
  "Drone",
];

// ────────────────────────────────────────────────────────────────────────────
export default function AplicaLanding() {
  return (
    <div style={{ background: c.bg, color: c.ink, fontFamily: FONT_GROTESK, minHeight: "100vh" }}>
      <style>{globalCSS}</style>
      <Topbar />
      <Hero />
      <Process />
      <Tiers />
      <Apply />
      <Footer />
    </div>
  );
}

// ─── Topbar ────────────────────────────────────────────────────────────────
function Topbar() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: `${c.bg}cc`, backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${c.border}`,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "16px clamp(20px, 4vw, 40px)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <a href="/fansnap" style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          color: c.ink, textDecoration: "none",
        }}>
          <span style={{ fontFamily: FONT_GROTESK, fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>
            fan<span style={{ color: c.accent }}>Snap</span>
          </span>
          <span style={{ width: 1, height: 14, background: c.border }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: c.inkSoft, letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Roster Oficial
          </span>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute, letterSpacing: "0.15em", textTransform: "uppercase" }} className="apl-desktop">
            MX · 2026
          </span>
          <a href="#aplicar" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px",
            background: "transparent", border: `1px solid ${c.borderStrong}`,
            color: c.ink, fontSize: 11, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase",
            textDecoration: "none", transition: "all 0.15s",
          }} className="apl-link">
            <span>Aplicar</span>
            <ArrowRight size={12} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      {/* Atmospheric image — a wide concert-ish shot. Darkened heavily so
          the headline reads cleanly. */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url(https://picsum.photos/seed/fansnap-apl-hero/2200/1400)",
        backgroundSize: "cover", backgroundPosition: "center 35%",
        filter: "grayscale(0.4) contrast(1.1) brightness(0.45)",
      }} />
      {/* Dark vignette so the bottom fade naturally into the next section. */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, rgba(14,14,17,0.55) 0%, rgba(14,14,17,0.78) 60%, ${c.bg} 100%)`,
      }} />

      <div style={{
        position: "relative",
        maxWidth: 1200, margin: "0 auto",
        padding: "clamp(80px, 12vw, 160px) clamp(20px, 4vw, 40px) clamp(80px, 10vw, 140px)",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 12px",
          background: c.accentSoft, border: `1px solid ${c.accent}55`,
          color: c.accent,
          fontFamily: FONT_MONO, fontSize: 10,
          letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600,
          marginBottom: 32,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.accent }} />
          <span>Pre-lanzamiento · México 2026</span>
        </div>

        <h1 style={{
          fontFamily: FONT_GROTESK,
          fontSize: "clamp(40px, 7.5vw, 96px)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 0.96,
          margin: "0 0 28px 0",
          maxWidth: 880,
          textWrap: "balance",
        }}>
          Captura lo que <em style={{
            fontStyle: "italic", fontWeight: 500,
            color: c.accent, opacity: 0.95,
          }}>nadie</em> olvida.
        </h1>

        <p style={{
          fontSize: "clamp(16px, 1.4vw, 19px)",
          color: c.inkSoft,
          lineHeight: 1.55,
          maxWidth: 640,
          margin: "0 0 44px 0",
        }}>
          Cada concierto, convención, obra y fiesta es un momento que merece quedarse.
          Tu cámara lo convierte en algo que se puede tocar, regalar, recordar. Nosotros
          ponemos la tecnología, la audiencia y el escenario. Tú pones la mirada y nosotros
          hacemos el resto.
          <br />
          <span style={{ color: c.ink, fontWeight: 500 }}>
            Bienvenido al roster oficial de FanSnap.
          </span>
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="#aplicar" style={primaryCTA} className="apl-cta-primary">
            <span>Aplicar al roster</span>
            <ArrowDown size={16} strokeWidth={2.5} />
          </a>
          <a href="#proceso" style={secondaryCTA} className="apl-cta-secondary">
            <span>Cómo funciona</span>
          </a>
        </div>

        {/* Soft credential strip */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "clamp(24px, 4vw, 48px)",
          marginTop: "clamp(56px, 8vw, 96px)",
          fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute,
          letterSpacing: "0.12em", textTransform: "uppercase",
        }}>
          <CredentialItem label="Lanzamiento" value="Q3 2026" />
          <CredentialItem label="Mercados" value="CDMX · GDL · MTY" />
          <CredentialItem label="Tiers" value="Standard · Pro · VIP" />
          <CredentialItem label="Pagos" value="Stripe + OXXO" />
        </div>
      </div>
    </section>
  );
}

function CredentialItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: c.inkMute, marginBottom: 4 }}>{label}</div>
      <div style={{ color: c.ink, fontFamily: FONT_GROTESK, fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em", textTransform: "none" }}>{value}</div>
    </div>
  );
}

// ─── Process (3 steps) ─────────────────────────────────────────────────────
function Process() {
  const steps = [
    {
      n: "01",
      title: "Aplicas",
      body: "Llenas el formulario con tu portafolio. Revisamos tu trabajo y tu disponibilidad. Te respondemos en 5 días hábiles.",
    },
    {
      n: "02",
      title: "Te credenciamos",
      body: "Si encajas, entras al roster con un tier (Standard / Pro / VIP). Te invitamos a cubrir los eventos que coinciden con tu perfil.",
    },
    {
      n: "03",
      title: "Cubres y cobras",
      body: "Subes las fotos a tu portal. El sistema las indexa, los fans se buscan, compran. Tu split sale automático.",
    },
  ];
  return (
    <section id="proceso" style={sectionStyle}>
      <div style={sectionInner}>
        <SectionLabel>Cómo trabajamos juntos</SectionLabel>
        <h2 style={sectionTitle}>Tres pasos. Sin papeleo extraño.</h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "clamp(20px, 2vw, 32px)",
          marginTop: 48,
        }}>
          {steps.map((s) => (
            <div key={s.n} style={{
              padding: "clamp(24px, 3vw, 36px)",
              background: c.surface,
              border: `1px solid ${c.border}`,
            }}>
              <div style={{
                fontFamily: FONT_MONO, fontSize: 11, color: c.accent,
                letterSpacing: "0.2em", fontWeight: 700, marginBottom: 18,
              }}>{s.n}</div>
              <div style={{
                fontFamily: FONT_GROTESK, fontSize: 22, fontWeight: 700,
                letterSpacing: "-0.02em", marginBottom: 12,
              }}>{s.title}</div>
              <div style={{ fontSize: 14, color: c.inkSoft, lineHeight: 1.6 }}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Tiers ─────────────────────────────────────────────────────────────────
function Tiers() {
  const tiers = [
    {
      name: "Standard",
      commission: "50%",
      description: "Entras pagando por venta. Sin garantía mínima. Ideal para empezar y construir reputación.",
      perks: ["Acceso al roster", "Eventos abiertos", "Pago por venta"],
    },
    {
      name: "Pro",
      commission: "60%",
      description: "Más comisión + bonificación si pegas metas mensuales. Para fotógrafos con track record.",
      perks: ["Comisión ampliada", "Bonus por meta", "Prioridad en invitaciones"],
      featured: true,
    },
    {
      name: "VIP",
      commission: "40%",
      description: "Comisión menor a cambio de cachê fijo o garantía mínima. Solo por invitación.",
      perks: ["Cachê o garantía", "Eventos premium", "Curaduría editorial"],
    },
  ];
  return (
    <section style={{ ...sectionStyle, background: c.surface, borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
      <div style={sectionInner}>
        <SectionLabel>Tiers</SectionLabel>
        <h2 style={sectionTitle}>Tres niveles. Tú decides cuál encajas.</h2>
        <p style={{ ...sectionSub }}>
          Empezamos contigo en Standard. Cuando entregas, subes. La diferencia está
          en cómo se reparte la venta y qué se exige.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "clamp(16px, 1.5vw, 24px)",
          marginTop: 44,
        }}>
          {tiers.map((tier) => (
            <div key={tier.name} style={{
              position: "relative",
              padding: "clamp(28px, 3vw, 40px)",
              background: tier.featured ? c.surfaceStrong : c.bg,
              border: tier.featured
                ? `1px solid ${c.accent}55`
                : `1px solid ${c.border}`,
            }}>
              {tier.featured && (
                <div style={{
                  position: "absolute", top: -1, right: -1,
                  background: c.accent, color: c.bg,
                  fontFamily: FONT_MONO, fontSize: 9,
                  fontWeight: 700, letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                }}>Más popular</div>
              )}
              <div style={{
                fontFamily: FONT_MONO, fontSize: 11, color: c.inkSoft,
                letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, marginBottom: 14,
              }}>{tier.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
                <span style={{ fontFamily: FONT_GROTESK, fontSize: 52, fontWeight: 700, letterSpacing: "-0.04em" }}>{tier.commission}</span>
                <span style={{ fontSize: 12, color: c.inkSoft }}>del neto</span>
              </div>
              <div style={{ fontSize: 14, color: c.inkSoft, lineHeight: 1.55, marginBottom: 22 }}>
                {tier.description}
              </div>
              <ul style={{
                listStyle: "none", padding: 0, margin: 0,
                display: "flex", flexDirection: "column", gap: 9,
              }}>
                {tier.perks.map((perk) => (
                  <li key={perk} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    fontSize: 13, color: c.ink,
                  }}>
                    <Check size={14} strokeWidth={2.5} style={{ color: c.accent, flexShrink: 0 }} />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Apply form ────────────────────────────────────────────────────────────
type SubmitState =
  | { stage: "idle" }
  | { stage: "submitting" }
  | { stage: "success"; code: string }
  | { stage: "error"; message: string };

function Apply() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [bigEventExperience, setBigEventExperience] = useState<boolean | null>(null);
  const [bigEventNotes, setBigEventNotes] = useState("");
  const [submit, setSubmit] = useState<SubmitState>({ stage: "idle" });

  const successRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (submit.stage === "success" && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [submit.stage]);

  const canSubmit =
    fullName.trim() &&
    email.includes("@") &&
    phone.trim() &&
    city.trim() &&
    portfolio.trim() &&
    submit.stage !== "submitting";

  const toggle = (list: string[], value: string): string[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmit({ stage: "submitting" });

    try {
      const res = await fetch("/fansnap/api/photographers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName, email, phone, city, portfolio,
          eventTypes, equipment,
          bigEventExperience: bigEventExperience === true,
          bigEventNotes: bigEventExperience === true ? bigEventNotes : "",
          language: "es",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSubmit({ stage: "error", message: err.error || `Error ${res.status}` });
        return;
      }

      const data = await res.json() as { applicationCode: string };
      setSubmit({ stage: "success", code: data.applicationCode });
    } catch (err) {
      setSubmit({ stage: "error", message: err instanceof Error ? err.message : "Network error" });
    }
  };

  // SUCCESS STATE — replaces the form entirely
  if (submit.stage === "success") {
    return (
      <section id="aplicar" style={sectionStyle}>
        <div style={sectionInner}>
          <div ref={successRef} style={{
            padding: "clamp(40px, 6vw, 64px)",
            background: c.surface,
            border: `1px solid ${c.premium}55`,
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 12px",
              background: "rgba(157,78,255,0.12)", border: `1px solid ${c.premium}66`,
              color: c.premium,
              fontFamily: FONT_MONO, fontSize: 10,
              letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700,
              marginBottom: 28,
            }}>
              <Check size={12} strokeWidth={3} />
              <span>Aplicación recibida</span>
            </div>
            <h2 style={{ ...sectionTitle, marginBottom: 14 }}>Estás en la cola.</h2>
            <p style={{ fontSize: 16, color: c.inkSoft, lineHeight: 1.55, maxWidth: 560, marginBottom: 32 }}>
              Te enviamos la confirmación a <strong style={{ color: c.ink, fontWeight: 600 }}>{email}</strong>.
              El equipo de curaduría revisa tu portafolio y te responde en hasta 5 días hábiles.
            </p>

            <div style={{ display: "inline-block", padding: "16px 24px", background: c.bg, border: `1px solid ${c.border}` }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
                Código de protocolo
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: "clamp(20px, 2.5vw, 28px)", color: c.premium, fontWeight: 700, letterSpacing: "0.06em" }}>
                {submit.code}
              </div>
            </div>

            <div style={{ fontSize: 13, color: c.inkMute, marginTop: 28, maxWidth: 480, lineHeight: 1.55 }}>
              Guarda este código. Si necesitas referenciar tu aplicación por email o
              WhatsApp, este es el número.
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="aplicar" style={sectionStyle}>
      <div style={sectionInner}>
        <SectionLabel>Aplica</SectionLabel>
        <h2 style={sectionTitle}>Llena el formulario.</h2>
        <p style={sectionSub}>
          Solo cinco campos son obligatorios. El resto nos ayuda a entender mejor tu
          perfil y proponerte el tier correcto. Todo es confidencial.
        </p>

        <form onSubmit={onSubmit} style={{ marginTop: 48 }}>
          {/* Required */}
          <FormGroup
            label="Sobre ti"
            sub="Los esenciales — solo lo necesario para hablar contigo."
          >
            <FormRow>
              <Field
                label="Nombre completo *"
                value={fullName} onChange={setFullName}
                icon={<Camera size={14} strokeWidth={2.2} />}
                fullWidth required
              />
            </FormRow>
            <FormRow cols={2}>
              <Field
                label="Email *"
                value={email} onChange={setEmail}
                type="email"
                icon={<Mail size={14} strokeWidth={2.2} />}
                required
              />
              <Field
                label="Teléfono / WhatsApp *"
                value={phone} onChange={setPhone}
                type="tel"
                icon={<Phone size={14} strokeWidth={2.2} />}
                placeholder="+52 55 1234 5678"
                required
              />
            </FormRow>
            <FormRow cols={2}>
              <Field
                label="Ciudad de operación *"
                value={city} onChange={setCity}
                icon={<MapPin size={14} strokeWidth={2.2} />}
                placeholder="CDMX, GDL, MTY…"
                required
              />
              <Field
                label="Portafolio / Instagram / Web *"
                value={portfolio} onChange={setPortfolio}
                icon={<Link2 size={14} strokeWidth={2.2} />}
                placeholder="@tu_handle  o  url completa"
                required
              />
            </FormRow>
          </FormGroup>

          {/* Optional — Event types */}
          <FormGroup
            label="Qué eventos cubres"
            sub="Opcional, pero ayuda a saber dónde encajas mejor."
            optional
          >
            <CheckboxGrid>
              {EVENT_TYPES.map((opt) => (
                <CheckboxChip
                  key={opt}
                  label={opt}
                  selected={eventTypes.includes(opt)}
                  onClick={() => setEventTypes(toggle(eventTypes, opt))}
                />
              ))}
            </CheckboxGrid>
          </FormGroup>

          {/* Optional — Equipment */}
          <FormGroup
            label="Equipo que tienes"
            sub="Solo lo que es tuyo o tienes acceso confiable."
            optional
          >
            <CheckboxGrid>
              {EQUIPMENT_OPTIONS.map((opt) => (
                <CheckboxChip
                  key={opt}
                  label={opt}
                  selected={equipment.includes(opt)}
                  onClick={() => setEquipment(toggle(equipment, opt))}
                />
              ))}
            </CheckboxGrid>
          </FormGroup>

          {/* Optional — Big events */}
          <FormGroup
            label="¿Ya cubriste algo grande?"
            sub="Ocesa, CCXP, festival, evento de marca. Cualquiera."
            optional
          >
            <div style={{ display: "flex", gap: 10, marginBottom: bigEventExperience === true ? 16 : 0 }}>
              <YesNoChip selected={bigEventExperience === true} label="SÍ" onClick={() => setBigEventExperience(true)} />
              <YesNoChip selected={bigEventExperience === false} label="NO" onClick={() => { setBigEventExperience(false); setBigEventNotes(""); }} />
            </div>
            {bigEventExperience === true && (
              <textarea
                value={bigEventNotes}
                onChange={(e) => setBigEventNotes(e.target.value)}
                placeholder="¿Cuáles? Festival, marca, año, rol…"
                rows={3}
                style={{
                  width: "100%", padding: "12px 14px",
                  background: c.bg, color: c.ink,
                  border: `1px solid ${c.border}`,
                  fontFamily: FONT_GROTESK, fontSize: 14,
                  resize: "vertical", outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = c.borderFocus)}
                onBlur={(e) => (e.currentTarget.style.borderColor = c.border)}
              />
            )}
          </FormGroup>

          {/* Submit */}
          <div style={{
            marginTop: 40, paddingTop: 32, borderTop: `1px solid ${c.border}`,
            display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start",
          }}>
            {submit.stage === "error" && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(255,59,110,0.08)",
                border: "1px solid rgba(255,59,110,0.4)",
                color: "#FF3B6E", fontSize: 13,
              }}>
                {submit.message}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                ...primaryCTA,
                padding: "18px 28px",
                fontSize: 14,
                opacity: canSubmit ? 1 : 0.4,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
              className="apl-cta-primary"
            >
              {submit.stage === "submitting" ? (
                <>
                  <Loader2 size={16} className="apl-spin" />
                  <span>Enviando…</span>
                </>
              ) : (
                <>
                  <span>Enviar aplicación</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </>
              )}
            </button>

            <div style={{ fontSize: 12, color: c.inkMute, maxWidth: 480, lineHeight: 1.55 }}>
              Al enviar aceptas que revisemos tu portafolio y compartamos esta
              información con la curaduría de FanSnap. Confidencial. No SPAM. Sin
              compromiso.
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${c.border}`,
      padding: "48px clamp(20px, 4vw, 40px)",
      background: c.bg,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", flexWrap: "wrap", justifyContent: "space-between",
        alignItems: "center", gap: 16,
        fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute,
        letterSpacing: "0.12em", textTransform: "uppercase",
      }}>
        <div>© 2026 FanSnap · Roster oficial</div>
        <div style={{ display: "flex", gap: 22 }}>
          <a href="/fansnap" style={{ color: c.inkSoft, textDecoration: "none" }} className="apl-link">fansnap.com</a>
          <a href="#aplicar" style={{ color: c.inkSoft, textDecoration: "none" }} className="apl-link">aplicar</a>
        </div>
      </div>
    </footer>
  );
}

// ─── Bits ──────────────────────────────────────────────────────────────────
const sectionStyle: React.CSSProperties = {
  padding: "clamp(72px, 10vw, 140px) clamp(20px, 4vw, 40px)",
};

const sectionInner: React.CSSProperties = {
  maxWidth: 1100, margin: "0 auto",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: FONT_GROTESK,
  fontSize: "clamp(28px, 4vw, 52px)",
  fontWeight: 700,
  letterSpacing: "-0.035em",
  lineHeight: 1.05,
  margin: "0 0 18px 0",
  maxWidth: 760,
  textWrap: "balance",
};

const sectionSub: React.CSSProperties = {
  fontSize: "clamp(14px, 1.2vw, 17px)",
  color: c.inkSoft,
  lineHeight: 1.55,
  maxWidth: 580,
  margin: 0,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_MONO, fontSize: 11, color: c.accent,
      letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700,
      marginBottom: 18,
    }}>
      {children}
    </div>
  );
}

const primaryCTA: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 10,
  padding: "14px 22px",
  background: c.accent, color: c.bg,
  border: "none", fontFamily: FONT_GROTESK,
  fontSize: 13, fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", cursor: "pointer",
  textDecoration: "none", transition: "all 0.15s",
};

const secondaryCTA: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 10,
  padding: "14px 22px",
  background: "transparent", color: c.ink,
  border: `1px solid ${c.borderStrong}`,
  fontFamily: FONT_GROTESK,
  fontSize: 13, fontWeight: 600, letterSpacing: "0.08em",
  textTransform: "uppercase", cursor: "pointer",
  textDecoration: "none", transition: "all 0.15s",
};

function FormGroup({
  label, sub, children, optional,
}: { label: string; sub?: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div style={{
      paddingBottom: 36, marginBottom: 36,
      borderBottom: `1px solid ${c.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
        <div style={{
          fontFamily: FONT_GROTESK, fontSize: 20, fontWeight: 700,
          letterSpacing: "-0.02em", color: c.ink,
        }}>{label}</div>
        {optional && (
          <span style={{
            fontFamily: FONT_MONO, fontSize: 9, color: c.inkMute,
            letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600,
            padding: "3px 8px", border: `1px solid ${c.border}`,
          }}>
            Opcional
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 13, color: c.inkSoft, marginBottom: 20 }}>{sub}</div>}
      {children}
    </div>
  );
}

function FormRow({ children, cols = 1 }: { children: React.ReactNode; cols?: 1 | 2 }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: cols === 2 ? "1fr 1fr" : "1fr",
      gap: 14, marginBottom: 14,
    }} className={cols === 2 ? "apl-form-row" : ""}>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, required, fullWidth, icon,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; fullWidth?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <label style={{ display: "block", gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <div style={{
        fontFamily: FONT_MONO, fontSize: 10, color: c.inkSoft,
        letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
        marginBottom: 8,
      }}>{label}</div>
      <div style={{
        position: "relative",
        background: c.bg, border: `1px solid ${c.border}`,
        display: "flex", alignItems: "center", gap: 10,
        padding: "0 14px",
        transition: "border-color 0.15s",
      }} className="apl-field">
        {icon && <span style={{ color: c.inkMute, flexShrink: 0 }}>{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          style={{
            flex: 1, padding: "14px 0",
            background: "transparent",
            border: "none", outline: "none",
            color: c.ink,
            fontFamily: FONT_GROTESK, fontSize: 14, fontWeight: 500,
            letterSpacing: "-0.005em",
            minWidth: 0,
          }}
        />
      </div>
    </label>
  );
}

function CheckboxGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {children}
    </div>
  );
}

function CheckboxChip({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "10px 14px",
        background: selected ? c.accentSoft : c.bg,
        border: `1px solid ${selected ? c.accent + "66" : c.border}`,
        color: selected ? c.accent : c.ink,
        fontFamily: FONT_GROTESK, fontSize: 13, fontWeight: 500,
        cursor: "pointer", transition: "all 0.15s",
      }}
      className="apl-chip"
    >
      <span style={{
        width: 14, height: 14, flexShrink: 0,
        border: `1.5px solid ${selected ? c.accent : c.borderStrong}`,
        background: selected ? c.accent : "transparent",
        display: "grid", placeItems: "center",
      }}>
        {selected && <Check size={9} strokeWidth={3.5} style={{ color: c.bg }} />}
      </span>
      <span>{label}</span>
    </button>
  );
}

function YesNoChip({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "12px 26px",
        background: selected ? c.accent : c.bg,
        border: `1px solid ${selected ? c.accent : c.borderStrong}`,
        color: selected ? c.bg : c.ink,
        fontFamily: FONT_GROTESK, fontSize: 13, fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase",
        cursor: "pointer", transition: "all 0.15s",
        minWidth: 90,
      }}
    >
      {label}
    </button>
  );
}

// ─── Page-scoped CSS ───────────────────────────────────────────────────────
const globalCSS = `
  .apl-cta-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(0,229,255,0.18);
  }
  .apl-cta-secondary:hover {
    border-color: ${c.ink};
  }
  .apl-link:hover {
    color: ${c.ink};
  }
  .apl-field:focus-within {
    border-color: ${c.borderFocus};
  }
  .apl-chip:hover {
    border-color: ${c.borderFocus};
  }
  @keyframes apl-spin { to { transform: rotate(360deg); } }
  .apl-spin { animation: apl-spin 0.8s linear infinite; }

  @media (max-width: 600px) {
    .apl-form-row { grid-template-columns: 1fr !important; }
    .apl-desktop { display: none !important; }
  }
`;
