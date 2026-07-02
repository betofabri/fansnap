"use client";

// FotografosLanding
// ─────────────────
// Public photographer marketing page for the FanSnap MX site (lives at
// /fansnap/fotografos). Inspired by fotop.com/photographers — long-form
// sales page with hero, how-it-works, tiers, events, testimonials, FAQ and
// a #cadastro signup form that POSTs to /api/photographers/apply.
//
// Style: full FanSnap brutalist (cyan + purple + magenta, mono labels,
// big grotesk headlines, grid overlays). Sister to AplicaLanding which is
// the closed-beta sober variant — this one is the public open door.

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Star,
  Crown,
  Loader2,
  Plus,
  Minus,
  Sparkles,
  CalendarDays,
  MapPin,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import FanSnapLogo from "@/components/FanSnapLogo";

// ─── Fonts & palette ───────────────────────────────────────────────────────

import { DARK, FONT_GROTESK, FONT_MONO } from "@/lib/theme";

// Shared flat-black tokens (audit Lote B); landing keeps its lighter card tone.
const c = { ...DARK, surfaceHi: "#161616" };

// ─── Data ──────────────────────────────────────────────────────────────────

// Hero photo strip — a few Unsplash photos rotating slowly behind the headline.
// Different from AplicaLanding's set so the two pages feel distinct.
const HERO_SLIDES: { url: string; pos: string }[] = [
  { url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=2400&q=80", pos: "center 40%" },
  { url: "https://images.unsplash.com/photo-1583792842909-8da78fe11ac3?auto=format&fit=crop&w=2400&q=80", pos: "center 45%" },
  { url: "https://images.unsplash.com/photo-1485872299712-c92b2c4b7f25?auto=format&fit=crop&w=2400&q=80", pos: "center 50%" },
];

const STEPS = [
  {
    n: "01",
    title: "Aplicas al roster",
    body: "Mandas tu portafolio. Revisamos en 48h y te asignamos un nivel inicial según experiencia y formato.",
  },
  {
    n: "02",
    title: "Cubres el evento",
    body: "Te avisamos de eventos compatibles. Tú llegas, fotografías, te vas. Sin operación logística.",
  },
  {
    n: "03",
    title: "Subes las fotos",
    body: "Workflow simple desde el celular o laptop. Marca de agua, resize y reconocimiento facial automáticos.",
  },
  {
    n: "04",
    title: "Cobras cada venta",
    body: "Cada vez que un fan compra una foto tuya con reconocimiento facial. Pagos en MXN, depósito directo.",
  },
];

const TIERS = [
  {
    name: "Standard",
    tag: "Entrada",
    description: "Empiezas aquí. Cubres eventos compatibles con tu portafolio.",
    perks: [
      "Hasta 3 eventos por mes",
      "Onboarding básico online",
      "Workflow de subida automatizado",
      "Pago mensual en MXN",
      "Marca de agua y procesamiento incluido",
    ],
    featured: false,
    accent: c.ink,
    icon: Star,
  },
  {
    name: "Pro",
    tag: "Crecimiento",
    description: "Para fotógrafos con historial. Más eventos, asignación prioritaria.",
    perks: [
      "Hasta 8 eventos por mes",
      "Asignación prioritaria",
      "Stipend de transporte por evento",
      "Pago quincenal",
      "Soporte directo de operaciones",
      "Co-branding en feed",
    ],
    featured: true,
    accent: c.accent,
    icon: Sparkles,
  },
  {
    name: "VIP",
    tag: "Top",
    description: "Cobertura principal. Eventos premium y exclusivos.",
    perks: [
      "Eventos ilimitados",
      "Asignación premium (main stage / VIP)",
      "Stipend de gear anual",
      "Pago semanal",
      "Manager dedicado",
      "Bonos por hit (foto top-10 del evento)",
      "Comisiones de Omelete Company",
    ],
    featured: false,
    accent: c.premium,
    icon: Crown,
  },
];

const UPCOMING_EVENTS = [
  { code: "CCXP-26", name: "CCXP México 2026", date: "29 MAY 2026", venue: "Centro Banamex", city: "CDMX", tag: "Conventions" },
  { code: "BB-001",  name: "Bad Bunny — Most Wanted", date: "08 MAY 2026", venue: "Estadio GNP Seguros", city: "CDMX", tag: "Music" },
  { code: "RO-014",  name: "Rosalía — Motomami Tour", date: "04 MAY 2026", venue: "Foro Sol", city: "CDMX", tag: "Music" },
  { code: "CC-26",   name: "Corona Capital", date: "01 MAY 2026", venue: "Autódromo Hnos. Rodríguez", city: "CDMX", tag: "Music" },
  { code: "EDC-26",  name: "EDC México 2026", date: "22 JUN 2026", venue: "Autódromo Hnos. Rodríguez", city: "CDMX", tag: "Music" },
  { code: "AE-08",   name: "Anime Expo Guadalajara", date: "22 ABR 2026", venue: "Expo Guadalajara", city: "GDL", tag: "Conventions" },
];

const TESTIMONIALS = [
  {
    name: "María Suárez",
    role: "Conciertos · CDMX",
    quote: "El workflow es honesto: dispara, sube, recibe. Antes perdía la mitad del tiempo cazando clientes. Acá el cliente ya está esperando.",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Carlos Reyes",
    role: "Convenciones · GDL",
    quote: "Cubrí CCXP. Subí 1.4k fotos en una tarde. Recibí mi primer pago el día 30. No vuelvo a vender vendor-by-vendor.",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Ana Núñez",
    role: "Deportes · CDMX",
    quote: "El reconocimiento facial me obsoletó la edición manual. Subo todo, FanSnap distribuye. Yo enfoco en disparar mejor.",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
  },
];

const FAQS = [
  {
    q: "¿Cuánto gano por foto?",
    a: "Depende del tier en el que entres y del evento. La estructura de ingresos se comparte en detalle al confirmar tu aplicación — incluye participación por venta, stipends de cobertura cuando aplican y bonos por desempeño en tiers Pro y VIP. Te enviamos los números exactos antes de cualquier compromiso.",
  },
  {
    q: "¿Cuándo recibo mis pagos?",
    a: "Standard cobra mensual (día 30). Pro cobra quincenal (días 15 y 30). VIP cobra semanal. Todos los pagos son depósito directo en cuenta CLABE mexicana, sin comisión adicional.",
  },
  {
    q: "¿Necesito un equipo específico?",
    a: "Para Standard: cámara mirrorless o DSLR full-frame, dos lentes (estándar + tele) y laptop para subir. Para Pro+: además flash externo y backup de baterías. Para eventos VIP el equipo se negocia caso a caso.",
  },
  {
    q: "¿Mis fotos van con marca de agua?",
    a: "Sí. El preview público lleva marca de agua sutil (esquina + diagonal). La foto en alta resolución sin marca solo se libera al comprador. Tu autoría está siempre en los metadatos EXIF.",
  },
  {
    q: "¿Hay exclusividad?",
    a: "No para tu trabajo en general. Sí para las fotos del evento cubierto: las fotos tomadas dentro de un evento FanSnap entran al catálogo exclusivo de la plataforma durante 90 días. Después puedes usarlas libremente en tu portafolio.",
  },
  {
    q: "¿Y si soy fotógrafo amateur?",
    a: "Aplicas igual. Revisamos el portafolio y, si vemos potencial, te asignamos eventos más pequeños para empezar. El sistema de tiers premia el volumen y la calidad: muchos VIP empezaron como Standard hace 6 meses.",
  },
  {
    q: "¿Cómo asignan eventos?",
    a: "Lanzamos los eventos vía notificación a los fotógrafos cuyo perfil coincide (ciudad, tipo, equipo). Aplicas en 1 click. El sistema considera rating, tier, historial y disponibilidad para confirmar.",
  },
];

const CITIES = [
  { value: "cdmx", label: "Ciudad de México" },
  { value: "gdl",  label: "Guadalajara" },
  { value: "mty",  label: "Monterrey" },
  { value: "pue",  label: "Puebla" },
  { value: "qro",  label: "Querétaro" },
  { value: "mid",  label: "Mérida" },
  { value: "otra", label: "Otra ciudad" },
];

const COUNTRY_CODES = [
  { code: "+52", label: "México",       flag: "🇲🇽" },
  { code: "+1",  label: "EE.UU./Canadá", flag: "🇺🇸" },
  { code: "+55", label: "Brasil",        flag: "🇧🇷" },
  { code: "+54", label: "Argentina",     flag: "🇦🇷" },
  { code: "+57", label: "Colombia",      flag: "🇨🇴" },
  { code: "+34", label: "España",        flag: "🇪🇸" },
  { code: "+56", label: "Chile",         flag: "🇨🇱" },
  { code: "+51", label: "Perú",          flag: "🇵🇪" },
];

// ─── Carousel primitives ───────────────────────────────────────────────────
//
// All three card sections (tiers, eventos, depoimentos) collapse into a
// horizontal snap-scroll carousel below 920px with finger-drag and dot
// navigation. Same behaviour everywhere — extracted here so each section
// only worries about its own card markup.

function useCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  // Track which card is centered and surface that as the active dot.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = scroller.scrollLeft + scroller.clientWidth / 2;
        let closest = 0;
        let bestDist = Infinity;
        cardRefs.current.forEach((card, i) => {
          if (!card) return;
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const d = Math.abs(cardCenter - center);
          if (d < bestDist) { bestDist = d; closest = i; }
        });
        setActiveIdx(closest);
      });
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  // Pointer-driven drag — finger, mouse, stylus. Threshold of 5px before
  // we claim the gesture so taps on inner buttons still register.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;
    let pid = -1;

    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button, a")) return;
      dragging = true;
      moved = false;
      pid = e.pointerId;
      startX = e.clientX;
      startScroll = scroller.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pid) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        try { scroller.setPointerCapture(pid); } catch {}
        scroller.classList.add("is-dragging");
      }
      if (moved) {
        e.preventDefault();
        scroller.scrollLeft = startScroll - dx;
      }
    };
    const endDrag = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (moved) {
        try { scroller.releasePointerCapture(e.pointerId); } catch {}
        scroller.classList.remove("is-dragging");
      }
      moved = false;
    };

    scroller.addEventListener("pointerdown", onDown);
    scroller.addEventListener("pointermove", onMove);
    scroller.addEventListener("pointerup", endDrag);
    scroller.addEventListener("pointercancel", endDrag);
    return () => {
      scroller.removeEventListener("pointerdown", onDown);
      scroller.removeEventListener("pointermove", onMove);
      scroller.removeEventListener("pointerup", endDrag);
      scroller.removeEventListener("pointercancel", endDrag);
    };
  }, []);

  const goTo = (i: number) => {
    cardRefs.current[i]?.scrollIntoView({
      behavior: "smooth", inline: "center", block: "nearest",
    });
  };

  return { scrollerRef, cardRefs, activeIdx, goTo };
}

function CarouselDots({
  count, active, onPick, labelFor,
}: {
  count: number;
  active: number;
  onPick: (i: number) => void;
  labelFor?: (i: number) => string;
}) {
  return (
    <div className="fl-carousel-dots" aria-hidden={active < 0}>
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active;
        return (
          <button
            key={i}
            onClick={() => onPick(i)}
            aria-label={labelFor?.(i) ?? `Ver item ${i + 1}`}
            aria-current={isActive ? "true" : undefined}
            style={{
              width: isActive ? 28 : 8,
              height: 8,
              borderRadius: 999,
              background: isActive ? c.accent : c.borderStrong,
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "width 0.22s ease, background 0.22s ease",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function FotografosLanding() {
  return (
    <div style={{ background: c.bg, color: c.ink, fontFamily: FONT_GROTESK, minHeight: "100vh" }}>
      <style>{globalCSS}</style>
      <SiteHeader lang="es" />
      <Hero />
      <HowItWorks />
      <Tiers />
      <Events />
      <Testimonials />
      <Signup />
      <FAQ />
      <Footer />
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────

function Hero() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % HERO_SLIDES.length), 6500);
    return () => clearInterval(id);
  }, []);

  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      {/* Background photo carousel */}
      {HERO_SLIDES.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${s.url})`,
            backgroundSize: "cover",
            backgroundPosition: s.pos,
            opacity: i === active ? 1 : 0,
            transition: "opacity 1.4s ease",
            transform: `scale(${i === active ? 1.06 : 1})`,
            transitionProperty: "opacity, transform",
            transitionDuration: "1.4s, 8s",
          }}
        />
      ))}
      {/* Dark overlay + gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.78) 60%, ${c.bg} 100%)`,
      }} />
      {/* Grid pattern */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(${c.border} 1px, transparent 1px),
          linear-gradient(90deg, ${c.border} 1px, transparent 1px)
        `,
        backgroundSize: "56px 56px",
        opacity: 0.5,
        maskImage: "radial-gradient(circle at 50% 35%, #000 30%, transparent 80%)",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 2,
        maxWidth: 1280, margin: "0 auto",
        padding: "clamp(48px, 6vw, 88px) clamp(20px, 4vw, 40px) clamp(36px, 4.5vw, 64px)",
        display: "flex", flexDirection: "column", gap: 22,
      }}>
        {/* Kicker pill */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          alignSelf: "flex-start",
          background: c.accentSoft,
          border: `1px solid rgba(0,229,255,0.45)`,
          padding: "8px 14px", borderRadius: 999,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: c.accent,
            animation: "fl-pulse 2.2s ease-in-out infinite",
          }} />
          <span style={{
            fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600,
            color: c.accent, letterSpacing: "0.12em", textTransform: "uppercase",
          }}>
            Roster oficial · FanSnap MX
          </span>
        </div>

        {/* Mono tag */}
        <div style={{
          fontFamily: FONT_MONO, fontSize: 12,
          color: c.inkMute, letterSpacing: "0.22em", textTransform: "uppercase",
        }}>
          Para fotógrafos / 2026 →
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: FONT_GROTESK,
          fontSize: "clamp(48px, 8vw, 112px)",
          fontWeight: 800,
          letterSpacing: "-0.045em",
          lineHeight: 0.95,
          margin: 0,
          maxWidth: 1100,
        }}>
          Captura. Sube. <span style={{ color: c.magenta }}>Cobra.</span>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: "clamp(18px, 1.6vw, 22px)",
          color: c.inkSoft,
          lineHeight: 1.5,
          margin: 0,
          maxWidth: 640,
          fontWeight: 400,
        }}>
          Únete al roster oficial de fotógrafos de FanSnap México. Cubre conciertos, convenciones y festivales — nosotros vendemos tus fotos a los fans con reconocimiento facial.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
          <a href="#cadastro" style={primaryCTA} className="fl-cta-primary">
            <span>Aplicar al roster</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </a>
          <a href="#como" style={secondaryCTA} className="fl-cta-secondary">
            <span>Cómo funciona</span>
            <ArrowDown size={16} strokeWidth={2.2} />
          </a>
        </div>

        {/* Stats strip */}
        <div style={{
          marginTop: "clamp(24px, 3vw, 40px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 1,
          background: c.border,
          border: `1px solid ${c.border}`,
        }} className="fl-stats">
          {[
            { k: "3", v: "Niveles de roster" },
            { k: "9", v: "Eventos activos en MX" },
            { k: "MXN", v: "Pagos directos" },
            { k: "48h", v: "Respuesta de aplicación" },
          ].map((s, i) => (
            <div key={i} style={{
              background: c.bg, padding: "20px 22px",
              display: "flex", flexDirection: "column", gap: 4,
            }}>
              <div style={{
                fontFamily: FONT_GROTESK, fontSize: 28, fontWeight: 700,
                letterSpacing: "-0.02em",
                color: i === 0 ? c.accent : c.ink,
              }}>{s.k}</div>
              <div style={{
                fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute,
                letterSpacing: "0.14em", textTransform: "uppercase",
              }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const primaryCTA: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 10,
  background: c.accent, color: "#000",
  padding: "18px 28px",
  fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700,
  letterSpacing: "0.06em", textTransform: "uppercase",
  textDecoration: "none",
  borderRadius: 0,
  transition: "transform 0.18s ease, box-shadow 0.18s ease",
  cursor: "pointer", border: "none",
};

const secondaryCTA: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8,
  background: "transparent", color: c.ink,
  padding: "18px 26px",
  fontFamily: FONT_MONO, fontSize: 14, fontWeight: 600,
  letterSpacing: "0.06em", textTransform: "uppercase",
  textDecoration: "none",
  border: `1.5px solid ${c.borderStrong}`,
  borderRadius: 0,
  transition: "border-color 0.18s ease",
  cursor: "pointer",
};

// ─── How it works ──────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section id="como" style={section}>
      <SectionLabel n="01" label="Workflow" />
      <h2 style={sectionTitle}>De la cobertura<br/> al pago.</h2>
      <p style={sectionSub}>
        Cuatro pasos. Sin chamba operativa. Sin vender uno a uno.
      </p>

      <div style={{
        marginTop: 48,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 1,
        background: c.border,
        border: `1px solid ${c.border}`,
      }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{
            background: c.bg, padding: "36px 30px",
            display: "flex", flexDirection: "column", gap: 16,
            position: "relative",
          }}>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700,
              color: c.accent, letterSpacing: "0.1em",
            }}>{s.n}</div>
            <h3 style={{
              fontFamily: FONT_GROTESK, fontSize: 22, fontWeight: 700,
              letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0,
            }}>{s.title}</h3>
            <p style={{
              fontFamily: FONT_GROTESK, fontSize: 14, lineHeight: 1.55,
              color: c.inkSoft, margin: 0,
            }}>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Tiers ─────────────────────────────────────────────────────────────────

function Tiers() {
  const { scrollerRef, cardRefs, activeIdx, goTo } = useCarousel();

  return (
    <section id="tiers" style={{ ...section, background: c.surface }}>
      <SectionLabel n="02" label="Roster" />
      <h2 style={sectionTitle}>
        No se aplica.<br/> Se <span style={{ color: c.magenta }}>conquista.</span>
      </h2>
      <p style={sectionSub}>
        Todos entran como Standard. No eliges tu nivel: subes a Pro y VIP según tu trabajo — volumen, rating y consistencia evento tras evento. Sin contratos a largo plazo.
      </p>

      <div
        ref={scrollerRef}
        className="fl-tiers-grid fl-carousel"
        style={{
          marginTop: 48,
          display: "grid",
          gridTemplateColumns: "1fr 1.15fr 1fr",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        {TIERS.map((t, i) => {
          const Icon = t.icon;
          return (
            <div
              key={i}
              ref={(el) => { cardRefs.current[i] = el; }}
              style={{
                background: c.bg,
                border: `1.5px solid ${t.featured ? t.accent : c.border}`,
                padding: t.featured ? "40px 32px" : "36px 28px",
                display: "flex", flexDirection: "column", gap: 18,
                position: "relative",
                boxShadow: t.featured ? `0 0 0 1px ${t.accent}, 0 24px 64px -16px rgba(0,229,255,0.25)` : "none",
                transform: t.featured ? "translateY(-8px)" : "none",
                transition: "transform 0.18s ease",
              }}
              className={`fl-tier-card fl-carousel-card${t.featured ? " fl-tier-featured" : ""}`}
            >
              {t.featured && (
                <div style={{
                  position: "absolute", top: -14, left: 28,
                  background: t.accent, color: "#000",
                  padding: "5px 12px",
                  fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                }}>Donde la mayoría crece</div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={20} color={t.accent} strokeWidth={2} />
                <div style={{
                  fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700,
                  color: t.accent, letterSpacing: "0.14em", textTransform: "uppercase",
                }}>{t.name}</div>
              </div>
              <div>
                <div style={{
                  fontFamily: FONT_GROTESK, fontSize: t.featured ? 56 : 44,
                  fontWeight: 800, letterSpacing: "-0.035em",
                  lineHeight: 1, color: c.ink,
                }}>{t.tag}.</div>
                <div style={{
                  marginTop: 10,
                  fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                }}>{t.featured ? "Se llega trabajando" : t.name === "Standard" ? "Punto de entrada" : "Se llega trabajando"}</div>
              </div>
              <p style={{
                fontFamily: FONT_GROTESK, fontSize: 14, lineHeight: 1.5,
                color: c.inkSoft, margin: 0,
              }}>{t.description}</p>
              <ul style={{
                listStyle: "none", padding: 0, margin: "8px 0 0",
                display: "flex", flexDirection: "column", gap: 10,
                borderTop: `1px solid ${c.border}`, paddingTop: 18,
              }}>
                {t.perks.map((p, j) => (
                  <li key={j} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    fontFamily: FONT_GROTESK, fontSize: 14, lineHeight: 1.4, color: c.ink,
                  }}>
                    <CheckCircle2 size={16} color={t.accent} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <CarouselDots
        count={TIERS.length}
        active={activeIdx}
        onPick={goTo}
        labelFor={(i) => `Ver tier ${TIERS[i].name}`}
      />

      <p style={{
        marginTop: 32, textAlign: "center",
        fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute,
        letterSpacing: "0.1em", textTransform: "uppercase",
      }}>
        ¿En qué tier voy a entrar? Lo definimos juntos al aprobar tu portafolio.
      </p>
    </section>
  );
}

// ─── Events ────────────────────────────────────────────────────────────────

function Events() {
  const { scrollerRef, cardRefs, activeIdx, goTo } = useCarousel();

  return (
    <section id="eventos" style={section}>
      <SectionLabel n="03" label="Calendario" />
      <h2 style={sectionTitle}>Los eventos<br/> que cubrirás.</h2>
      <p style={sectionSub}>
        Una muestra del calendario actual. Cobertura abierta a fotógrafos del roster.
      </p>

      <div
        ref={scrollerRef}
        className="fl-events-grid fl-carousel"
        style={{
          marginTop: 48,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {UPCOMING_EVENTS.map((e, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            style={{
              background: c.surface,
              border: `1px solid ${c.border}`,
              padding: "24px 22px",
              display: "flex", flexDirection: "column", gap: 14,
              position: "relative",
              transition: "border-color 0.18s ease, transform 0.18s ease",
            }}
            className="fl-event-card fl-carousel-card"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                fontFamily: FONT_MONO, fontSize: 10, color: c.accent,
                letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "3px 8px",
                background: c.accentSoft,
                border: `1px solid rgba(0,229,255,0.35)`,
              }}>{e.code}</span>
              <span style={{
                fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute,
                letterSpacing: "0.12em", textTransform: "uppercase",
              }}>{e.tag}</span>
            </div>
            <h3 style={{
              fontFamily: FONT_GROTESK, fontSize: 20, fontWeight: 700,
              letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0,
            }}>{e.name}</h3>
            <div style={{
              display: "flex", flexDirection: "column", gap: 6,
              fontFamily: FONT_MONO, fontSize: 12, color: c.inkSoft,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarDays size={13} strokeWidth={2} color={c.inkMute} />
                {e.date}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={13} strokeWidth={2} color={c.inkMute} />
                {e.venue} · {e.city}
              </div>
            </div>
            <div style={{
              marginTop: 6, paddingTop: 12,
              borderTop: `1px solid ${c.border}`,
              fontFamily: FONT_MONO, fontSize: 10, color: c.magenta,
              letterSpacing: "0.14em", textTransform: "uppercase",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", background: c.magenta,
              }} />
              Cobertura disponible
            </div>
          </div>
        ))}
      </div>

      <CarouselDots
        count={UPCOMING_EVENTS.length}
        active={activeIdx}
        onPick={goTo}
        labelFor={(i) => `Ver evento ${UPCOMING_EVENTS[i].name}`}
      />
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────

function Testimonials() {
  const { scrollerRef, cardRefs, activeIdx, goTo } = useCarousel();

  return (
    <section style={{ ...section, background: c.surface }}>
      <SectionLabel n="04" label="Roster activo" />
      <h2 style={sectionTitle}>Voces del roster.</h2>
      <p style={sectionSub}>
        Fotógrafos que ya forman parte del closed beta.
        <span style={{
          marginLeft: 10,
          fontFamily: FONT_MONO, fontSize: 10, color: c.warn,
          letterSpacing: "0.12em", textTransform: "uppercase",
          padding: "2px 8px", border: `1px solid ${c.warn}`, borderRadius: 999,
        }}>Mock para preview</span>
      </p>

      <div
        ref={scrollerRef}
        className="fl-testimonials-grid fl-carousel"
        style={{
          marginTop: 32,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            className="fl-testimonial-card fl-carousel-card"
            style={{
              margin: 0,
              background: c.bg,
              border: `1px solid ${c.border}`,
              display: "flex", flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Big editorial photo — fills the top of the card.
                4:5 aspect lets it dominate without going taller than the
                surrounding column on desktop. */}
            <div style={{
              width: "100%",
              aspectRatio: "4 / 5",
              backgroundImage: `url(${t.photo})`,
              backgroundSize: "cover",
              backgroundPosition: "center 25%",
              filter: "grayscale(0.15)",
              borderBottom: `1px solid ${c.border}`,
            }} />
            <div style={{
              padding: 28,
              display: "flex", flexDirection: "column", gap: 18,
              flex: 1,
            }}>
              <blockquote style={{
                margin: 0,
                fontFamily: FONT_GROTESK, fontSize: 17, lineHeight: 1.5,
                color: c.ink,
                flex: 1,
              }}>
                <span style={{ color: c.magenta, fontWeight: 700, marginRight: 4 }}>“</span>
                {t.quote}
                <span style={{ color: c.magenta, fontWeight: 700, marginLeft: 4 }}>”</span>
              </blockquote>
              <figcaption style={{
                paddingTop: 18,
                borderTop: `1px solid ${c.border}`,
              }}>
                <div style={{
                  fontFamily: FONT_GROTESK, fontWeight: 700, fontSize: 17,
                  letterSpacing: "-0.01em", color: c.ink,
                }}>{t.name}</div>
                <div style={{
                  fontFamily: FONT_MONO, fontSize: 11, color: c.accent,
                  letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4,
                }}>{t.role}</div>
              </figcaption>
            </div>
          </figure>
        ))}
      </div>

      <CarouselDots
        count={TESTIMONIALS.length}
        active={activeIdx}
        onPick={goTo}
        labelFor={(i) => `Ver depoimento de ${TESTIMONIALS[i].name}`}
      />
    </section>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" style={section}>
      <SectionLabel n="06" label="FAQ" />
      <h2 style={sectionTitle}>Preguntas<br/> frecuentes.</h2>
      <p style={sectionSub}>
        Lo que más nos preguntan los fotógrafos antes de aplicar.
      </p>

      <div style={{
        marginTop: 48,
        maxWidth: 880,
        margin: "48px auto 0",
        borderTop: `1px solid ${c.border}`,
      }}>
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i} style={{ borderBottom: `1px solid ${c.border}` }}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  width: "100%", background: "transparent", border: "none",
                  padding: "26px 4px",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
                  cursor: "pointer", color: c.ink, textAlign: "left",
                }}
              >
                <span style={{
                  fontFamily: FONT_GROTESK, fontSize: 18, fontWeight: 600,
                  letterSpacing: "-0.01em",
                }}>{f.q}</span>
                <span style={{
                  flexShrink: 0,
                  width: 32, height: 32,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${isOpen ? c.accent : c.border}`,
                  background: isOpen ? c.accentSoft : "transparent",
                  transition: "all 0.2s ease",
                }}>
                  {isOpen
                    ? <Minus size={16} color={c.accent} strokeWidth={2.5} />
                    : <Plus size={16} color={c.inkSoft} strokeWidth={2.5} />}
                </span>
              </button>
              <div style={{
                overflow: "hidden",
                maxHeight: isOpen ? 400 : 0,
                transition: "max-height 0.32s ease",
              }}>
                <p style={{
                  margin: 0, paddingBottom: 26, paddingRight: 56,
                  fontFamily: FONT_GROTESK, fontSize: 15, lineHeight: 1.6,
                  color: c.inkSoft,
                }}>
                  {f.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Signup form (#cadastro) ────────────────────────────────────────────────

function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+52");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ code: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const missing: string[] = [];
    if (!fullName.trim()) missing.push("nombre");
    if (!email.trim() || !email.includes("@")) missing.push("email");
    if (!phoneNumber.trim()) missing.push("WhatsApp");
    if (!city.trim()) missing.push("ciudad");
    if (!portfolio.trim()) missing.push("portafolio");
    if (missing.length > 0) {
      setError(`Falta completar: ${missing.join(", ")}.`);
      return;
    }

    setSubmitting(true);
    try {
      const r = await fetch("/api/photographers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: `${countryCode} ${phoneNumber.trim()}`,
          city: city.trim(),
          portfolio: portfolio.trim(),
          language: "es",
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data?.error ?? "Error al enviar. Intenta de nuevo.");
      } else {
        setResult({ code: data.applicationCode });
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <section id="cadastro" style={section}>
        <div style={{
          maxWidth: 640, margin: "0 auto",
          textAlign: "center",
          padding: "60px 32px",
          border: `1.5px solid ${c.accent}`,
          background: c.accentSoft,
        }}>
          <CheckCircle2 size={56} color={c.accent} strokeWidth={1.5} style={{ marginBottom: 20 }} />
          <h2 style={{
            fontFamily: FONT_GROTESK, fontSize: 36, fontWeight: 700,
            letterSpacing: "-0.025em", lineHeight: 1.05, margin: "0 0 14px",
          }}>
            Aplicación recibida.
          </h2>
          <p style={{
            fontFamily: FONT_GROTESK, fontSize: 16, color: c.ink, lineHeight: 1.5,
            margin: "0 0 24px",
          }}>
            Te respondemos en 48 horas. Mientras tanto, guarda tu código.
          </p>
          <div style={{
            display: "inline-block",
            padding: "14px 22px",
            background: c.bg,
            border: `1px solid ${c.accent}`,
            fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700,
            color: c.accent, letterSpacing: "0.1em",
          }}>{result.code}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="cadastro" style={section}>
      <SectionLabel n="05" label="Cadastro" />
      <h2 style={sectionTitle}>
        Únete al<br/>
        <span style={{ color: c.magenta }}>roster.</span>
      </h2>
      <p style={sectionSub}>
        Cinco campos. Dos minutos. Respondemos en 48 horas.
        {" "}
        <a href="/fansnap/aplica" style={{
          color: c.accent, textDecoration: "none",
          borderBottom: `1px solid ${c.accent}`,
        }}>
          ¿Quieres dar más detalles? Versión completa →
        </a>
      </p>

      <form onSubmit={onSubmit} style={{
        marginTop: 48,
        maxWidth: 720,
        marginInline: "auto",
        display: "flex", flexDirection: "column", gap: 18,
      }}>
        <Field label="Nombre completo" value={fullName} onChange={setFullName} placeholder="María García López" />
        <Field type="email" label="Email" value={email} onChange={setEmail} placeholder="tu@correo.com" />

        {/* Phone composite */}
        <FieldShell label="WhatsApp">
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              style={{
                ...inputStyle,
                width: 120, paddingRight: 28,
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300E5FF' stroke-width='2.5'><polyline points='6 9 12 15 18 9'/></svg>")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
                backgroundSize: 14,
              }}
            >
              {COUNTRY_CODES.map((c2) => (
                <option key={c2.code} value={c2.code} style={{ background: c.bg, color: c.ink }}>
                  {c2.flag} {c2.code} {c2.label}
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="55 1234 5678"
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
        </FieldShell>

        <FieldShell label="Ciudad de operación">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              ...inputStyle,
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300E5FF' stroke-width='2.5'><polyline points='6 9 12 15 18 9'/></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
              backgroundSize: 14,
              paddingRight: 36,
              color: city ? c.ink : c.inkMute,
            }}
          >
            <option value="" style={{ background: c.bg }}>Selecciona tu ciudad</option>
            {CITIES.map((city2) => (
              <option key={city2.value} value={city2.label} style={{ background: c.bg, color: c.ink }}>
                {city2.label}
              </option>
            ))}
          </select>
        </FieldShell>

        <Field
          label="Portafolio / Instagram / Web"
          value={portfolio}
          onChange={setPortfolio}
          placeholder="instagram.com/tu-handle o url"
        />

        {error && (
          <div style={{
            padding: "12px 16px",
            background: "rgba(255,45,135,0.10)",
            border: `1px solid ${c.magenta}`,
            color: c.magenta,
            fontFamily: FONT_MONO, fontSize: 12,
            letterSpacing: "0.05em",
          }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            ...primaryCTA,
            padding: "22px 32px",
            fontSize: 16,
            justifyContent: "center",
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? "wait" : "pointer",
            marginTop: 8,
          }}
          className="fl-cta-primary fl-cta-big"
        >
          {submitting
            ? <><Loader2 size={18} className="fl-spin" /> Enviando…</>
            : <>Enviar aplicación <ArrowRight size={18} strokeWidth={2.5} /></>}
        </button>

        <p style={{
          textAlign: "center",
          fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute,
          letterSpacing: "0.1em", textTransform: "uppercase",
          margin: "8px 0 0",
        }}>
          Al enviar, aceptas los términos y la política de privacidad.
        </p>
      </form>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
      marginTop: 0,
      padding: "60px clamp(20px, 4vw, 40px) 40px",
      borderTop: `1px solid ${c.border}`,
      background: c.bg,
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 28,
        alignItems: "flex-end",
      }} className="fl-footer-grid">
        <div>
          <FanSnapLogo size="sm" />
          <p style={{
            margin: "12px 0 0",
            fontFamily: FONT_GROTESK, fontSize: 13, color: c.inkSoft,
            maxWidth: 380, lineHeight: 1.55,
          }}>
            Plataforma oficial de fotografía para fans y fotógrafos de Ocesa y Omelete Company en México.
          </p>
        </div>
        <nav style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <a href="/fansnap" style={footLink} className="fl-foot-link">Inicio</a>
          <a href="#como" style={footLink} className="fl-foot-link">Cómo funciona</a>
          <a href="#tiers" style={footLink} className="fl-foot-link">Tiers</a>
          <a href="#faq" style={footLink} className="fl-foot-link">FAQ</a>
          <a href="/fansnap/aplica" style={footLink} className="fl-foot-link">Closed beta</a>
          <a href="/fansnap/fotografos/dashboard" style={footLink} className="fl-foot-link">Ya soy del roster</a>
        </nav>
      </div>
      <div style={{
        marginTop: 40, paddingTop: 24,
        borderTop: `1px solid ${c.border}`,
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute,
        letterSpacing: "0.08em", textTransform: "uppercase",
      }}>
        <span>© FanSnap México 2026</span>
        <span>v0 · Roster oficial · OCESA × CCXP × Omelete Company</span>
      </div>
    </footer>
  );
}

const footLink: React.CSSProperties = {
  fontFamily: FONT_MONO, fontSize: 12, color: c.inkSoft,
  textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase",
  transition: "color 0.18s ease",
};

// ─── Section helpers ───────────────────────────────────────────────────────

const section: React.CSSProperties = {
  padding: "50px clamp(20px, 4vw, 40px)",
  maxWidth: 1280,
  margin: "0 auto",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: FONT_GROTESK,
  fontSize: "clamp(40px, 6.5vw, 88px)",
  fontWeight: 800,
  letterSpacing: "-0.04em",
  lineHeight: 0.95,
  margin: "0 0 18px",
};

const sectionSub: React.CSSProperties = {
  fontFamily: FONT_GROTESK,
  fontSize: "clamp(15px, 1.3vw, 18px)",
  color: c.inkSoft,
  lineHeight: 1.55,
  margin: 0,
  maxWidth: 640,
};

function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 12,
      fontFamily: FONT_MONO, fontSize: 11,
      color: c.inkMute, letterSpacing: "0.18em", textTransform: "uppercase",
      marginBottom: 24,
    }}>
      <span style={{
        color: c.accent, fontWeight: 700,
      }}>/ {n}</span>
      <span style={{
        width: 24, height: 1, background: c.border,
      }} />
      <span>{label}</span>
    </div>
  );
}

// ─── Form primitives ───────────────────────────────────────────────────────

function FieldShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{
      display: "flex", flexDirection: "column", gap: 8,
    }} className="fl-field">
      <span style={{
        fontFamily: FONT_MONO, fontSize: 11, color: c.accent,
        letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
      }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(0,229,255,0.045)",
  border: `1.5px solid rgba(0,229,255,0.35)`,
  padding: "16px 18px",
  fontFamily: FONT_GROTESK,
  fontSize: 15,
  color: c.ink,
  borderRadius: 0,
  outline: "none",
  width: "100%",
  transition: "border-color 0.18s ease, background 0.18s ease",
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}

function Field({ label, value, onChange, type = "text", placeholder }: FieldProps) {
  return (
    <FieldShell label={label}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </FieldShell>
  );
}

// ─── Global CSS ────────────────────────────────────────────────────────────

const globalCSS = `
  @keyframes fl-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.35; transform: scale(0.75); }
  }
  @keyframes fl-spin { to { transform: rotate(360deg); } }
  .fl-spin { animation: fl-spin 0.8s linear infinite; }

  .flnav-link:hover { color: ${c.ink}; }
  .fl-foot-link:hover { color: ${c.ink}; }

  .fl-cta-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(0,229,255,0.28);
  }
  .fl-cta-secondary:hover {
    border-color: ${c.ink};
  }
  .fl-cta-big:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 48px rgba(0,229,255,0.32);
  }

  .fl-event-card:hover {
    border-color: ${c.borderStrong};
    transform: translateY(-2px);
  }

  .fl-tier-card:hover {
    transform: translateY(-4px);
  }

  .fl-field:focus-within input,
  .fl-field:focus-within select {
    border-color: ${c.accent} !important;
    background: rgba(0,229,255,0.085) !important;
    box-shadow: 0 0 0 4px ${c.accentSoft};
  }

  .flnav-mobile { display: none; }

  /* Card sections (tiers, eventos, depoimentos) — desktop renders their own
     grid via inline styles; mobile flips them into a snap-scrolling
     horizontal carousel with drag + dot navigation. The same .fl-carousel /
     .fl-carousel-card classes are reused across all three so the gesture
     and visual rhythm stay consistent. */
  .fl-carousel-dots { display: none; }

  @media (max-width: 920px) {
    .fl-carousel {
      display: flex !important;
      grid-template-columns: none !important;
      overflow-x: auto;
      overflow-y: visible;
      scroll-snap-type: x mandatory;
      scroll-padding-inline: 20px;
      gap: 14px !important;
      padding: 18px 20px 24px;
      margin-inline: calc(-1 * clamp(20px, 4vw, 40px));
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      align-items: stretch !important;
      /* Let vertical page scroll through, while the finger drag horizontally
         is owned by the carousel (combined with the pointer-event handler
         in JS for snap + momentum). */
      touch-action: pan-y;
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
      overscroll-behavior-x: contain;
    }
    .fl-carousel.is-dragging {
      cursor: grabbing;
      scroll-snap-type: none;
      scroll-behavior: auto;
    }
    .fl-carousel::-webkit-scrollbar { display: none; }
    .fl-carousel-card {
      flex: 0 0 86%;
      max-width: 86%;
      scroll-snap-align: center;
      transform: none !important;
      -webkit-user-drag: none;
    }
    .fl-carousel-card:hover { transform: none !important; }
    .fl-carousel-dots {
      display: flex !important;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-top: 24px;
    }
  }

  @media (max-width: 760px) {
    .flnav-desktop { display: none !important; }
    .flnav-mobile { display: inline-flex !important; }
    .fl-footer-grid { grid-template-columns: 1fr !important; align-items: flex-start !important; }
  }
`;
