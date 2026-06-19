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
  ArrowRight, ArrowDown, Check, Mail, Phone, MapPin, Link2, Camera, Loader2, X, ChevronDown,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

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
  magenta: "#FF2D87",       // magenta — word highlights in body
  magentaSoft: "rgba(255,45,135,0.12)",
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

// Top 5 Mexican metro areas by population — these are where the launch
// events will live and where most photographer applications will come from.
const MEXICAN_CITIES = [
  "Ciudad de México",
  "Guadalajara",
  "Monterrey",
  "Puebla",
  "Tijuana",
  "Otra ciudad",
];

// Phone country codes. México first + pre-selected since the launch market is
// MX; LATAM neighbours follow, then a small global tail.
const COUNTRY_CODES: { flag: string; code: string; name: string }[] = [
  { flag: "🇲🇽", code: "+52", name: "México" },
  { flag: "🇧🇷", code: "+55", name: "Brasil" },
  { flag: "🇦🇷", code: "+54", name: "Argentina" },
  { flag: "🇨🇱", code: "+56", name: "Chile" },
  { flag: "🇨🇴", code: "+57", name: "Colombia" },
  { flag: "🇵🇪", code: "+51", name: "Perú" },
  { flag: "🇺🇸", code: "+1",  name: "USA" },
  { flag: "🇪🇸", code: "+34", name: "España" },
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
      <SiteHeader lang="es" minimal />
      <Hero />
      <Features />
      <Apply />
      <Footer />
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────

// Atmospheric stage / crowd shots cycled in the hero. Each gets a slow
// Ken Burns zoom while it's visible, then cross-fades to the next.
const HERO_SLIDES: { url: string; pos: string }[] = [
  { url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=2400&q=80", pos: "center 35%" },
  { url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=2400&q=80", pos: "center 55%" },
  { url: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=2400&q=80", pos: "center 45%" },
  { url: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?auto=format&fit=crop&w=2400&q=80", pos: "center 50%" },
];

function Hero() {
  const [idx, setIdx] = useState(0);
  const SLIDE_MS = 6000;

  useEffect(() => {
    const tick = setInterval(() => {
      setIdx((i) => (i + 1) % HERO_SLIDES.length);
    }, SLIDE_MS);
    return () => clearInterval(tick);
  }, []);

  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      {/* Stacked slides — only the active one is at opacity 1. The active
          slide also slowly scales up (Ken Burns) for the duration it's
          visible; inactive slides snap back to scale 1 ready for next
          appearance. Cross-fade 1.4s. */}
      {HERO_SLIDES.map((slide, i) => {
        const active = i === idx;
        return (
          <div
            key={i}
            style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${slide.url})`,
              backgroundSize: "cover",
              backgroundPosition: slide.pos,
              filter: "grayscale(0.3) contrast(1.05) brightness(0.5)",
              opacity: active ? 1 : 0,
              transform: active ? "scale(1.07)" : "scale(1)",
              transformOrigin: "center center",
              transition: active
                ? "opacity 1.4s ease, transform 8s linear"
                : "opacity 1.4s ease, transform 0.6s ease",
              willChange: "opacity, transform",
            }}
          />
        );
      })}
      {/* Dark vignette so the bottom fade naturally into the next section. */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, rgba(14,14,17,0.55) 0%, rgba(14,14,17,0.78) 60%, ${c.bg} 100%)`,
      }} />

      <div style={{
        position: "relative",
        maxWidth: 1200, margin: "0 auto",
        padding: "clamp(56px, 8vw, 120px) clamp(20px, 4vw, 40px) clamp(36px, 5vw, 72px)",
        textAlign: "center",
      }}>
        {/* Cyan pill — now carries 'Ocesa · CCXP presenta:'. Authority
            cascade in one box: presenter inside the brand-color frame. */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "8px 14px",
          background: c.accentSoft, border: `1px solid ${c.accent}55`,
          color: c.accent,
          fontFamily: FONT_MONO, fontSize: 11,
          letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700,
          marginBottom: 18,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%", background: c.accent,
            animation: "apl-pulse 2.4s ease-in-out infinite",
          }} />
          <span>Ocesa <span style={{ opacity: 0.55 }}>·</span> CCXP <span style={{ color: "#fff" }}>presenta:</span></span>
        </div>

        {/* Audience tag — 'PARA FOTÓGRAFOS' identifies who this page is for. */}
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: "clamp(11px, 0.9vw, 13px)",
          fontWeight: 700,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: c.inkSoft,
          marginBottom: 14,
        }}>
          Para fotógrafos
        </div>

        <h1 style={{
          fontFamily: FONT_GROTESK,
          fontSize: "clamp(41px, 7.5vw, 97px)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 0.96,
          margin: "0 auto 22px",
          maxWidth: 880,
          textWrap: "balance",
        }}>
          Captura lo que <em style={{
            fontStyle: "italic", fontWeight: 500,
            color: c.magenta,
          }}>nadie</em> olvida.
        </h1>

        {/* Body — three paragraphs with controlled break points.
            The .apl-hero-br elements show only on wide screens; on mobile
            the text reflows naturally so we don't get orphan short lines. */}
        <p style={{
          fontSize: "clamp(17px, 1.4vw, 20px)",
          color: c.inkSoft,
          lineHeight: 1.5,
          maxWidth: 720,
          margin: "0 auto 14px",
          textWrap: "balance",
        }}>
          Cada concierto, convención,<br className="apl-hero-br" />
          {" "}obra y fiesta es un momento que merece quedarse.
        </p>
        <p style={{
          fontSize: "clamp(17px, 1.4vw, 20px)",
          color: c.inkSoft,
          lineHeight: 1.5,
          maxWidth: 760,
          margin: "0 auto 22px",
          textWrap: "balance",
        }}>
          Tú pones <span style={{ color: c.ink, fontWeight: 600 }}>la mirada</span> y nosotros<br className="apl-hero-br" />
          {" "}ponemos la <span style={{ color: c.ink, fontWeight: 600 }}>tecnología</span>,
          la <span style={{ color: c.ink, fontWeight: 600 }}>audiencia</span> y
          la <span style={{ color: c.ink, fontWeight: 600 }}>monetización</span>.
        </p>
        <p style={{
          fontSize: "clamp(15px, 1.2vw, 17px)",
          color: c.ink,
          lineHeight: 1.5,
          maxWidth: 720,
          margin: "0 auto 32px",
          fontWeight: 500,
          textWrap: "balance",
        }}>
          Súmate al <span style={{ color: c.accent, fontWeight: 700 }}>closed beta solo para invitados</span> de FanSnap,<br className="apl-hero-br" />
          {" "}la plataforma oficial de fotógrafos de Ocesa y Omelete Company.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="#aplicar" style={primaryCTA} className="apl-cta-primary">
            <span>Aplicar al roster</span>
            <ArrowDown size={16} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Features (3 value-prop cards) ─────────────────────────────────────────
function Features() {
  const items = [
    {
      n: "01",
      title: "Acreditación oficial",
      body: "Entras al roster como fotógrafo de cobertura de nuestros eventos. Te invitamos a cubrir lo que coincide con tu perfil.",
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=80",
      imagePos: "center 30%",
      featured: false,
    },
    {
      n: "02",
      title: "Tú cubres. Nosotros vendemos.",
      body: "Tú haces lo que mejor haces. La plataforma indexa cada rostro, encuentra al fan y procesa cada venta — sin tu intervención.",
      image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=900&q=80",
      imagePos: "center 55%",
      featured: true,
    },
    {
      n: "03",
      title: "Más ventas, más tier, más ganancia.",
      body: "Cuantas más fotos vendas, más subes de tier. Cada nivel deja más comisión en tu bolsillo en cada venta.",
      image: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=900&q=80",
      imagePos: "center 40%",
      featured: false,
    },
  ];
  return (
    <section style={sectionStyle}>
      <div style={{ ...sectionInner, textAlign: "center" }}>
        <SectionLabel>Para fotógrafos</SectionLabel>
        <h2 style={{ ...sectionTitle, margin: "0 auto 0" }}>Entiende FanSnap.</h2>

        {/* 3-column grid with the middle column 20% wider on desktop.
            alignItems: center keeps the smaller side cards vertically
            centered against the taller middle card. Falls back to a
            single column on mobile via .apl-features-grid responsive. */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr 1fr",
          gap: "clamp(14px, 1.4vw, 22px)",
          alignItems: "center",
          marginTop: 28,
          textAlign: "left",
        }} className="apl-features-grid">
          {items.map((s) => (
            <div key={s.n} style={{
              background: c.surface,
              border: `1px solid ${s.featured ? c.accent + "55" : c.border}`,
              overflow: "hidden",
              display: "flex", flexDirection: "column",
              boxShadow: s.featured ? `0 12px 36px rgba(0,229,255,0.10)` : "none",
            }}>
              {/* Text first — the number, title and body lead. */}
              <div style={{
                padding: s.featured
                  ? "clamp(28px, 3.2vw, 40px) clamp(28px, 3.2vw, 40px) clamp(22px, 2.6vw, 30px)"
                  : "clamp(20px, 2.4vw, 28px) clamp(20px, 2.4vw, 28px) clamp(16px, 2vw, 22px)",
              }}>
                <div style={{
                  fontFamily: FONT_MONO, fontSize: s.featured ? 13 : 12, color: c.accent,
                  letterSpacing: "0.2em", fontWeight: 700, marginBottom: s.featured ? 14 : 12,
                }}>{s.n}</div>
                <div style={{
                  fontFamily: FONT_GROTESK,
                  fontSize: s.featured ? 26 : 22,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginBottom: s.featured ? 12 : 10,
                  lineHeight: 1.15,
                }}>{s.title}</div>
                <div style={{
                  fontSize: s.featured ? 16 : 15,
                  color: c.inkSoft, lineHeight: 1.55,
                }}>{s.body}</div>
              </div>

              {/* Card image at the bottom */}
              <div style={{
                position: "relative",
                aspectRatio: "16/9",
                backgroundImage: `url(${s.image})`,
                backgroundSize: "cover",
                backgroundPosition: s.imagePos,
                filter: "grayscale(0.35) contrast(1.05) brightness(0.78)",
                borderTop: `1px solid ${c.border}`,
                marginTop: "auto",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: `linear-gradient(0deg, rgba(14,14,17,0) 50%, rgba(14,14,17,0.55) 100%)`,
                }} />
              </div>
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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+52"); // México default
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [verification, setVerification] = useState<"email" | "whatsapp" | null>(null);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [bigEventExperience, setBigEventExperience] = useState<boolean | null>(null);
  const [bigEventNotes, setBigEventNotes] = useState("");
  const [submit, setSubmit] = useState<SubmitState>({ stage: "idle" });
  const [showRefer, setShowRefer] = useState(false);

  const successRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (submit.stage === "success" && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [submit.stage]);

  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    email.includes("@") &&
    phone.trim() &&
    city.trim() &&
    portfolio.trim() &&
    verification !== null &&
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
          fullName: `${firstName.trim()} ${lastName.trim()}`,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email,
          phone: `${countryCode} ${phone.trim()}`,
          countryCode,
          phoneNumber: phone.trim(),
          verification, // "email" | "whatsapp"
          city, portfolio,
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
              fontFamily: FONT_MONO, fontSize: 11,
              letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700,
              marginBottom: 28,
            }}>
              <Check size={12} strokeWidth={3} />
              <span>Aplicación recibida</span>
            </div>
            <h2 style={{ ...sectionTitle, marginBottom: 14 }}>Estás en la cola.</h2>
            <p style={{ fontSize: 17, color: c.inkSoft, lineHeight: 1.55, maxWidth: 560, marginBottom: 32 }}>
              Te enviamos la confirmación a <strong style={{ color: c.ink, fontWeight: 600 }}>{email}</strong>.
              El equipo de curaduría revisa tu portafolio y te responde en hasta 5 días hábiles.
            </p>

            <div style={{ display: "inline-block", padding: "16px 24px", background: c.bg, border: `1px solid ${c.border}` }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
                Código de protocolo
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: "clamp(21px, 2.5vw, 29px)", color: c.premium, fontWeight: 700, letterSpacing: "0.06em" }}>
                {submit.code}
              </div>
            </div>

            <div style={{ fontSize: 14, color: c.inkMute, marginTop: 28, maxWidth: 480, lineHeight: 1.55 }}>
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

        <form onSubmit={onSubmit} style={{ marginTop: 22 }}>
          {/* Required */}
          <FormGroup
            label="Sobre ti"
          >
            <FormRow cols={2}>
              <Field
                label="Nombre *"
                value={firstName} onChange={setFirstName}
                icon={<Camera size={14} strokeWidth={2.2} />}
                required
              />
              <Field
                label="Apellido *"
                value={lastName} onChange={setLastName}
                required
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
              <PhoneField
                label="Teléfono / WhatsApp *"
                countryCode={countryCode} setCountryCode={setCountryCode}
                phone={phone} setPhone={setPhone}
              />
            </FormRow>
            <FormRow cols={2}>
              <SelectField
                label="Ciudad de operación *"
                value={city} onChange={setCity}
                options={MEXICAN_CITIES}
                icon={<MapPin size={14} strokeWidth={2.2} />}
                placeholder="Elige una ciudad…"
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
                  fontFamily: FONT_GROTESK, fontSize: 15,
                  resize: "vertical", outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = c.borderFocus)}
                onBlur={(e) => (e.currentTarget.style.borderColor = c.border)}
              />
            )}
          </FormGroup>

          {/* Verification method picker — required, asked just before
              submit so it's the last decision the user makes. Magenta
              accent on the active choice ties it to the brand 'audiencia
              y monetización' wording in the hero. */}
          <div style={{
            marginTop: 24, paddingTop: 24, borderTop: `1px solid ${c.border}`,
          }}>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 11, color: c.accent,
              letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700,
              marginBottom: 9,
            }}>
              Cómo prefieres recibir el código de verificación *
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
            }} className="apl-form-row">
              <VerificationChip
                active={verification === "email"}
                icon={<Mail size={16} strokeWidth={2.2} />}
                label="Por email"
                sub={email || "el email de arriba"}
                onClick={() => setVerification("email")}
              />
              <VerificationChip
                active={verification === "whatsapp"}
                icon={<Phone size={16} strokeWidth={2.2} />}
                label="Por WhatsApp"
                sub={phone ? `${countryCode} ${phone}` : "el teléfono de arriba"}
                onClick={() => setVerification("whatsapp")}
              />
            </div>
          </div>

          {/* Submit + secondary referral CTA */}
          <div style={{
            marginTop: 22, paddingTop: 22, borderTop: `1px solid ${c.border}`,
            display: "flex", flexDirection: "column", gap: 16, alignItems: "stretch",
          }}>
            {submit.stage === "error" && (
              <div style={{
                padding: "10px 14px",
                background: "rgba(255,59,110,0.08)",
                border: "1px solid rgba(255,59,110,0.4)",
                color: "#FF3B6E", fontSize: 14,
              }}>
                {submit.message}
              </div>
            )}

            {/* BIG primary submit — main action of the page. */}
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                ...primaryCTA,
                padding: "24px 32px",
                fontSize: 18,
                width: "100%",
                justifyContent: "center",
                letterSpacing: "0.1em",
                gap: 14,
                opacity: canSubmit ? 1 : 0.45,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
              className="apl-cta-primary apl-cta-big"
            >
              {submit.stage === "submitting" ? (
                <>
                  <Loader2 size={20} className="apl-spin" />
                  <span>Enviando…</span>
                </>
              ) : (
                <>
                  <span>Enviar aplicación</span>
                  <ArrowRight size={20} strokeWidth={2.5} />
                </>
              )}
            </button>

            {/* "o" divider between primary apply and secondary referral. */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute,
              letterSpacing: "0.2em", textTransform: "uppercase",
              margin: "4px 0",
            }}>
              <span style={{ flex: 1, height: 1, background: c.border }} />
              <span>o</span>
              <span style={{ flex: 1, height: 1, background: c.border }} />
            </div>

            {/* Secondary CTA — refer another photographer. Same full width
                so the funnel feels parallel: aplicas tú o indicas a alguien. */}
            <button
              type="button"
              onClick={() => setShowRefer(true)}
              style={{
                ...secondaryCTA,
                padding: "20px 28px",
                fontSize: 15,
                width: "100%",
                justifyContent: "center",
                letterSpacing: "0.1em",
              }}
              className="apl-cta-secondary"
            >
              <span>Indicar a un fotógrafo</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>

            <div style={{ fontSize: 13, color: c.inkMute, maxWidth: 520, lineHeight: 1.55, marginTop: 4 }}>
              Al enviar aceptas que revisemos tu portafolio y compartamos esta
              información con la curaduría de FanSnap. Confidencial. No SPAM. Sin
              compromiso.
            </div>
          </div>
        </form>
      </div>

      {showRefer && (
        <ReferModal onClose={() => setShowRefer(false)} />
      )}
    </section>
  );
}

// ─── Referral modal ────────────────────────────────────────────────────────
type ReferState =
  | { stage: "idle" }
  | { stage: "sending" }
  | { stage: "sent"; code: string }
  | { stage: "error"; message: string };

function ReferModal({ onClose }: { onClose: () => void }) {
  const [referrerEmail, setReferrerEmail] = useState("");
  const [referredName, setReferredName] = useState("");
  const [referredContact, setReferredContact] = useState("");
  const [referredPortfolio, setReferredPortfolio] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<ReferState>({ stage: "idle" });

  const canSubmit =
    referrerEmail.includes("@") &&
    referredName.trim() &&
    referredContact.trim() &&
    state.stage !== "sending";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setState({ stage: "sending" });
    try {
      const res = await fetch("/fansnap/api/photographers/refer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerEmail, referredName, referredContact, referredPortfolio, note, language: "es" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setState({ stage: "error", message: err.error || `Error ${res.status}` });
        return;
      }
      const data = await res.json() as { referralCode: string };
      setState({ stage: "sent", code: data.referralCode });
    } catch (err) {
      setState({ stage: "error", message: err instanceof Error ? err.message : "Network error" });
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)",
        display: "grid", placeItems: "center",
        padding: "clamp(16px, 4vw, 40px)",
        animation: "apl-fade-in 0.18s ease-out",
      }}
    >
      <div style={{
        position: "relative",
        background: c.bg, border: `1px solid ${c.borderStrong}`,
        maxWidth: 580, width: "100%",
        maxHeight: "90vh", overflowY: "auto",
        padding: "clamp(24px, 4vw, 40px)",
      }}>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 16, right: 16,
            width: 36, height: 36,
            background: "transparent", border: `1px solid ${c.border}`,
            color: c.inkSoft, cursor: "pointer",
            display: "grid", placeItems: "center",
            transition: "all 0.15s",
          }}
          className="apl-link"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        {state.stage === "sent" ? (
          <>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 12px",
              background: "rgba(157,78,255,0.12)", border: `1px solid ${c.premium}66`,
              color: c.premium,
              fontFamily: FONT_MONO, fontSize: 11,
              letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700,
              marginBottom: 22,
            }}>
              <Check size={13} strokeWidth={3} />
              <span>Indicación recibida</span>
            </div>
            <h3 style={{
              fontFamily: FONT_GROTESK, fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1,
              margin: "0 0 12px 0",
            }}>Gracias por la referencia.</h3>
            <p style={{ fontSize: 15, color: c.inkSoft, lineHeight: 1.55, margin: "0 0 24px 0" }}>
              Le mandamos una invitación personal a <strong style={{ color: c.ink }}>{referredName}</strong>.
              Si entra al roster, te avisamos.
            </p>
            <div style={{ display: "inline-block", padding: "14px 20px", background: c.surface, border: `1px solid ${c.border}` }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 5 }}>
                Código de referencia
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: c.premium, fontWeight: 700, letterSpacing: "0.06em" }}>
                {state.code}
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={onSubmit}>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 11, color: c.accent,
              letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700,
              marginBottom: 14,
            }}>
              Indicación
            </div>
            <h3 style={{
              fontFamily: FONT_GROTESK, fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1,
              margin: "0 0 8px 0",
            }}>Indicá a un fotógrafo.</h3>
            <p style={{ fontSize: 14, color: c.inkSoft, lineHeight: 1.55, margin: "0 0 24px 0" }}>
              Le mandamos una invitación personal de tu parte. Tú no necesitas estar en el roster para indicar.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field
                label="Tu email *" value={referrerEmail} onChange={setReferrerEmail}
                type="email" icon={<Mail size={14} strokeWidth={2.2} />} fullWidth required
              />
              <Field
                label="Nombre del fotógrafo *" value={referredName} onChange={setReferredName}
                icon={<Camera size={14} strokeWidth={2.2} />} fullWidth required
              />
              <Field
                label="Su email o WhatsApp *" value={referredContact} onChange={setReferredContact}
                icon={<Phone size={14} strokeWidth={2.2} />} fullWidth required
              />
              <Field
                label="Su portafolio (opcional)" value={referredPortfolio} onChange={setReferredPortfolio}
                icon={<Link2 size={14} strokeWidth={2.2} />} fullWidth
              />
              <label style={{ display: "block" }}>
                <div style={{
                  fontFamily: FONT_MONO, fontSize: 11, color: c.ink,
                  letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700,
                  marginBottom: 9,
                }}>Por qué lo recomiendas (opcional)</div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Una línea sobre su trabajo, dónde lo viste cubrir, etc."
                  style={{
                    width: "100%", padding: "14px 16px",
                    background: "rgba(0,229,255,0.045)", color: c.ink,
                    border: `1.5px solid rgba(0,229,255,0.35)`,
                    fontFamily: FONT_GROTESK, fontSize: 15,
                    resize: "vertical", outline: "none",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.background = "rgba(0,229,255,0.085)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(0,229,255,0.35)"; e.currentTarget.style.background = "rgba(0,229,255,0.045)"; }}
                />
              </label>
            </div>

            {state.stage === "error" && (
              <div style={{
                marginTop: 20,
                padding: "10px 14px",
                background: "rgba(255,59,110,0.08)",
                border: "1px solid rgba(255,59,110,0.4)",
                color: "#FF3B6E", fontSize: 14,
              }}>
                {state.message}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                ...primaryCTA,
                width: "100%", marginTop: 24,
                padding: "18px 28px", fontSize: 16,
                justifyContent: "center", letterSpacing: "0.1em",
                opacity: canSubmit ? 1 : 0.45,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
              className="apl-cta-primary"
            >
              {state.stage === "sending" ? (
                <>
                  <Loader2 size={18} className="apl-spin" />
                  <span>Enviando…</span>
                </>
              ) : (
                <>
                  <span>Enviar indicación</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
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
        fontFamily: FONT_MONO, fontSize: 12, color: c.inkMute,
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
  padding: "clamp(28px, 4vw, 56px) clamp(20px, 4vw, 40px)",
};

const sectionInner: React.CSSProperties = {
  maxWidth: 1100, margin: "0 auto",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: FONT_GROTESK,
  fontSize: "clamp(29px, 4vw, 53px)",
  fontWeight: 700,
  letterSpacing: "-0.035em",
  lineHeight: 1.05,
  margin: "0 0 18px 0",
  maxWidth: 760,
  textWrap: "balance",
};

const sectionSub: React.CSSProperties = {
  fontSize: "clamp(15px, 1.2vw, 18px)",
  color: c.inkSoft,
  lineHeight: 1.55,
  maxWidth: 580,
  margin: 0,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: FONT_MONO, fontSize: 12, color: c.accent,
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
  fontSize: 14, fontWeight: 700, letterSpacing: "0.08em",
  textTransform: "uppercase", cursor: "pointer",
  textDecoration: "none", transition: "all 0.15s",
};

const secondaryCTA: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 10,
  padding: "14px 22px",
  background: "transparent", color: c.ink,
  border: `1px solid ${c.borderStrong}`,
  fontFamily: FONT_GROTESK,
  fontSize: 14, fontWeight: 600, letterSpacing: "0.08em",
  textTransform: "uppercase", cursor: "pointer",
  textDecoration: "none", transition: "all 0.15s",
};

function VerificationChip({
  active, icon, label, sub, onClick,
}: {
  active: boolean; icon: React.ReactNode; label: string; sub: string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 18px", textAlign: "left",
        background: active ? c.magentaSoft : "rgba(0,229,255,0.045)",
        border: `1.5px solid ${active ? c.magenta : "rgba(0,229,255,0.35)"}`,
        boxShadow: active ? `0 0 0 4px rgba(255,45,135,0.18)` : "none",
        color: c.ink,
        cursor: "pointer", transition: "all 0.15s",
        fontFamily: "inherit",
      }}
    >
      <span style={{
        width: 38, height: 38, flexShrink: 0,
        border: `1.5px solid ${active ? c.magenta : c.borderStrong}`,
        background: active ? c.magenta : "transparent",
        display: "grid", placeItems: "center",
        color: active ? c.bg : c.accent,
      }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: FONT_GROTESK, fontSize: 14, fontWeight: 700,
          letterSpacing: "0.05em", textTransform: "uppercase",
          color: active ? c.magenta : c.ink, marginBottom: 3,
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 11, color: c.inkSoft,
          letterSpacing: "0.04em",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {sub}
        </div>
      </div>
    </button>
  );
}

function FormGroup({
  label, sub, children, optional,
}: { label: string; sub?: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div style={{
      paddingBottom: 20, marginBottom: 20,
      borderBottom: `1px solid ${c.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
        <div style={{
          fontFamily: FONT_GROTESK, fontSize: 21, fontWeight: 700,
          letterSpacing: "-0.02em", color: c.ink,
        }}>{label}</div>
        {optional && (
          <span style={{
            fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute,
            letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600,
            padding: "3px 8px", border: `1px solid ${c.border}`,
          }}>
            Opcional
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 14, color: c.inkSoft, marginBottom: 20 }}>{sub}</div>}
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

function PhoneField({
  label, countryCode, setCountryCode, phone, setPhone,
}: {
  label: string;
  countryCode: string; setCountryCode: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
}) {
  return (
    <label style={{ display: "block" }}>
      <div style={{
        fontFamily: FONT_MONO, fontSize: 11, color: c.accent,
        letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700,
        marginBottom: 9,
      }}>{label}</div>
      <div style={{
        position: "relative",
        background: "rgba(0,229,255,0.045)",
        border: `1.5px solid rgba(0,229,255,0.35)`,
        display: "flex", alignItems: "stretch", gap: 0,
        padding: "0 0 0 12px",
        transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
      }} className="apl-field">
        <span style={{ display: "flex", alignItems: "center", color: c.accent, flexShrink: 0 }}>
          <Phone size={14} strokeWidth={2.2} />
        </span>

        {/* Country code dropdown — narrow column on the left. */}
        <div style={{
          position: "relative",
          display: "flex", alignItems: "center",
          paddingLeft: 10, paddingRight: 4,
          borderRight: `1px solid rgba(0,229,255,0.25)`,
          marginLeft: 10,
        }}>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            style={{
              padding: "17px 22px 17px 0",
              background: "transparent",
              border: "none", outline: "none",
              color: c.ink,
              fontFamily: FONT_GROTESK, fontSize: 16, fontWeight: 600,
              letterSpacing: "-0.005em",
              appearance: "none", WebkitAppearance: "none",
              cursor: "pointer",
              minWidth: 78,
            }}
          >
            {COUNTRY_CODES.map((cc) => (
              <option key={cc.code} value={cc.code} style={{ background: c.bg, color: c.ink }}>
                {cc.flag} {cc.code}
              </option>
            ))}
          </select>
          <span style={{
            position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
            pointerEvents: "none", color: c.accent, opacity: 0.85, display: "flex",
          }}>
            <ChevronDown size={14} strokeWidth={2.5} />
          </span>
        </div>

        {/* The phone number — flex 1 on the right. */}
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="55 1234 5678"
          required
          style={{
            flex: 1, padding: "17px 16px 17px 14px",
            background: "transparent",
            border: "none", outline: "none",
            color: c.ink,
            fontFamily: FONT_GROTESK, fontSize: 16, fontWeight: 500,
            letterSpacing: "-0.005em",
            minWidth: 0,
          }}
        />
      </div>
    </label>
  );
}

function SelectField({
  label, value, onChange, options, required, fullWidth, icon, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: readonly string[]; required?: boolean; fullWidth?: boolean;
  icon?: React.ReactNode; placeholder?: string;
}) {
  return (
    <label style={{ display: "block", gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <div style={{
        fontFamily: FONT_MONO, fontSize: 11, color: c.accent,
        letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700,
        marginBottom: 9,
      }}>{label}</div>
      <div style={{
        position: "relative",
        background: "rgba(0,229,255,0.045)",
        border: `1.5px solid rgba(0,229,255,0.35)`,
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 16px",
        transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
      }} className="apl-field">
        {icon && <span style={{ color: c.accent, flexShrink: 0 }}>{icon}</span>}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          style={{
            flex: 1, padding: "17px 24px 17px 0",
            background: "transparent",
            border: "none", outline: "none",
            color: value ? c.ink : c.inkMute,
            fontFamily: FONT_GROTESK, fontSize: 16, fontWeight: 500,
            letterSpacing: "-0.005em",
            minWidth: 0,
            appearance: "none",
            WebkitAppearance: "none",
            cursor: "pointer",
          }}
        >
          <option value="" disabled style={{ background: c.bg, color: c.inkMute }}>
            {placeholder ?? "Selecciona…"}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} style={{ background: c.bg, color: c.ink }}>
              {opt}
            </option>
          ))}
        </select>
        {/* Caret indicator (just a visual hint — actual click is on the
            invisible native select). */}
        <span style={{
          position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
          pointerEvents: "none", color: c.accent, opacity: 0.85,
          display: "flex",
        }}>
          <ChevronDown size={16} strokeWidth={2.5} />
        </span>
      </div>
    </label>
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
        fontFamily: FONT_MONO, fontSize: 11, color: c.accent,
        letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700,
        marginBottom: 9,
      }}>{label}</div>
      <div style={{
        position: "relative",
        background: "rgba(0,229,255,0.045)",
        border: `1.5px solid rgba(0,229,255,0.35)`,
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 16px",
        transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
      }} className="apl-field">
        {icon && <span style={{ color: c.accent, flexShrink: 0 }}>{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          style={{
            flex: 1, padding: "17px 0",
            background: "transparent",
            border: "none", outline: "none",
            color: c.ink,
            fontFamily: FONT_GROTESK, fontSize: 16, fontWeight: 500,
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
        fontFamily: FONT_GROTESK, fontSize: 14, fontWeight: 500,
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
        fontFamily: FONT_GROTESK, fontSize: 14, fontWeight: 700,
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
    border-color: ${c.accent} !important;
    background: rgba(0,229,255,0.085) !important;
    box-shadow: 0 0 0 4px ${c.accentSoft};
  }
  .apl-chip:hover {
    border-color: ${c.borderFocus};
  }
  .apl-chip-on:hover {
    box-shadow: 0 0 0 3px ${c.accentSoft};
  }
  @keyframes apl-spin { to { transform: rotate(360deg); } }
  .apl-spin { animation: apl-spin 0.8s linear infinite; }

  @keyframes apl-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.3; transform: scale(0.7); }
  }

  @keyframes apl-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .apl-cta-big:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(0,229,255,0.28);
  }

  /* Standardized topbar — mirrors FotografosLanding nav behaviour. */
  .apl-nav-link:hover { color: ${c.ink}; }
  .apl-nav-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(0,229,255,0.28); }
  .apl-nav-mobile { display: none; }
  @media (max-width: 760px) {
    .apl-nav-desktop { display: none !important; }
    .apl-nav-mobile { display: inline-flex !important; }
  }

  /* Hide controlled hero line-breaks on narrow viewports — let the text
     reflow naturally below ~880px so we don't get awkward 2-word orphans.
     The {" "} string we put right after each <br> keeps a single space
     between the joined halves when the break is hidden. */
  br.apl-hero-br { display: none; }
  @media (min-width: 881px) {
    br.apl-hero-br { display: inline; }
  }

  @media (max-width: 880px) {
    .apl-features-grid { grid-template-columns: 1fr !important; }
  }

  @media (max-width: 600px) {
    .apl-form-row { grid-template-columns: 1fr !important; }
    .apl-desktop { display: none !important; }
  }
`;
