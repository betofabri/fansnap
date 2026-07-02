"use client";

// MarcasLanding
// ─────────────
// Public sales page for brands and agencies, lives at /fansnap/marcas.
// Sister to FotografosLanding but speaks to the buyer side: reach,
// recall, recovery — i.e. how FanSnap turns the fan's post-event photo
// search into an opportunity for sponsored activations and qualified
// leads. Same SiteHeader, same brutalist palette, same useCarousel
// helpers reused here so visual language stays consistent across the
// photographer-facing and brand-facing pages.

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Loader2,
  Plus,
  Minus,
  Frame,
  LineChart,
  UserPlus,
  Megaphone,
  Music,
  Trophy,
  Theater,
  Sparkles,
  Briefcase,
  Building2,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import FanSnapLogo from "@/components/FanSnapLogo";

// ─── Fonts & palette ───────────────────────────────────────────────────────

import { DARK, FONT_GROTESK, FONT_MONO } from "@/lib/theme";

// Shared flat-black tokens (audit Lote B); landing keeps its lighter card tone.
const c = { ...DARK, surfaceHi: "#161616" };

// ─── Data ──────────────────────────────────────────────────────────────────

const HERO_SLIDES: { url: string; pos: string }[] = [
  { url: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=2400&q=80", pos: "center 40%" },
  { url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=2400&q=80", pos: "center 50%" },
  { url: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=2400&q=80", pos: "center 45%" },
];

const VALUE_PROPS = [
  {
    icon: Megaphone,
    title: "Reach permitido",
    body: "El fan llega por su cuenta a buscar sus fotos del evento. No interrumpes — apareces dentro del momento que él ya está buscando.",
  },
  {
    icon: LineChart,
    title: "Recall medible",
    body: "Cada interacción con una foto tuya genera un dato — vistas, descargas, compras, compartidas. Insight por demografía, ciudad y evento.",
  },
  {
    icon: UserPlus,
    title: "Recovery cualificado",
    body: "Leads opt-in con foto verificada del fan. Audiencia limpia, sin compra de listas, con consentimiento explícito para activaciones futuras.",
  },
  {
    icon: Frame,
    title: "Brand fit nativo",
    body: "Tu marca vive en el activo más compartido del evento — la foto del fan. Marco, sticker, gallery sponsor: integración orgánica, no banner.",
  },
];

const PRODUCTS = [
  {
    icon: Frame,
    name: "Branded Frame",
    body: "Marco sutil con tu marca alrededor de cada foto del evento. El fan descarga, comparte, sube a IG — tu marca viaja con la imagen.",
    metrics: ["Hasta 4k descargas por evento mediano", "Impresiones orgánicas en redes", "Sin opt-in adicional del fan"],
  },
  {
    icon: Sparkles,
    name: "Sponsored Gallery",
    body: "Sección dedicada del evento patrocinada por tu marca. Hero con tu identidad, mensajes contextuales, CTAs medibles. Premium e exclusivo por evento.",
    metrics: ["Lock-in por marca y categoría", "Reporte semanal de performance", "Co-marketing con el artista / evento"],
  },
  {
    icon: LineChart,
    name: "Data Insights",
    body: "Acceso al dashboard del evento: quién buscó fotos, de dónde, qué tier de tickets, qué horarios. Insights por demografía y ciudad, sin PII.",
    metrics: ["Acceso semanal al panel", "Exportable CSV / API", "Agregados anonimizados"],
  },
  {
    icon: UserPlus,
    name: "Lead Capture",
    body: "Formulario opt-in al final del flujo. Activable por marca: 'Únete al club de [Marca] para más experiencias así'. Lead con email + datos del evento.",
    metrics: ["Opt-in explícito con foto verificada", "Sincroniza con tu CRM (HubSpot, Salesforce)", "Compliance LGPD / GDPR"],
  },
];

const VERTICALS = [
  { icon: Music,    name: "Música en vivo",  count: "4 eventos" },
  { icon: Building2, name: "Convenciones",   count: "2 eventos" },
  { icon: Trophy,   name: "Deportes",        count: "2 eventos" },
  { icon: Theater,  name: "Festivales",      count: "3 eventos" },
];

const CASES = [
  {
    brand: "Marca de bebida",
    event: "Festival × Foro Sol",
    headline: "1.8 M impresiones orgánicas a través del branded frame.",
    metric: { value: "1.8M", label: "Impresiones orgánicas" },
    tag: "Branded frame",
  },
  {
    brand: "Telco principal",
    event: "Convención · CDMX",
    headline: "11k leads opt-in en 48 horas post-evento.",
    metric: { value: "11k", label: "Leads opt-in" },
    tag: "Lead capture",
  },
  {
    brand: "Marca deportiva",
    event: "Maratón CDMX 2026",
    headline: "67% de los fans compartieron sus fotos enmarcadas.",
    metric: { value: "67%", label: "Compartir orgánico" },
    tag: "Sponsored gallery",
  },
];

const STEPS = [
  { n: "01", title: "Brief", body: "Nos dices el evento, vertical y objetivo (reach / recall / leads). Te respondemos con propuesta en 5 días." },
  { n: "02", title: "Integración", body: "Activamos tu paquete: branded frames, sponsored gallery, lead capture, dashboard. Sin desarrollos del lado de la marca." },
  { n: "03", title: "Evento", body: "Tu marca vive en cada foto del evento. Nuestro equipo monitorea performance en tiempo real durante la cobertura." },
  { n: "04", title: "Reporte", body: "Recibes el dashboard final con todas las métricas: alcance, engagement, leads capturados, ROI estimado." },
];

const FAQS = [
  {
    q: "¿Cuánto cuesta una activación?",
    a: "Depende del paquete (frame / gallery / leads / insights), del evento y de la exclusividad por categoría. Trabajamos con tres bandas: starter, performance y headline. Te enviamos rate card al confirmar el brief.",
  },
  {
    q: "¿Cuándo puedo empezar?",
    a: "Los próximos eventos del calendario están abiertos para sponsorship a partir de 6 semanas de la fecha del evento. Para eventos premium (festivales top, conventions principales) la ventana es 12 semanas.",
  },
  {
    q: "¿Hay exclusividad por categoría?",
    a: "Sí — el sponsored gallery y branded frame son exclusivos por categoría dentro del evento. Solo una marca de bebida, una de telco, etc. Define el lock-in al firmar el contrato.",
  },
  {
    q: "¿Cómo se ven los datos?",
    a: "Dashboard web con métricas en tiempo real durante el evento y reporte agregado al final. Datos anonimizados, sin PII, agrupados por ciudad, demografía, horario y tier de ticket. Exportable a CSV o vía API.",
  },
  {
    q: "¿Funciona con mi CRM?",
    a: "Sí. Las leads del módulo Lead Capture se entregan en tiempo real vía webhook, integración nativa con HubSpot / Salesforce / Mailchimp, o export semanal en CSV.",
  },
  {
    q: "¿Qué eventos tienen disponibles?",
    a: "El calendario actual incluye Ocesa, Omelete Company y partners — CCXP, Corona Capital, EDC, festivales, tours principales y eventos deportivos selectos. Pide el calendario completo al iniciar el brief.",
  },
];

// ─── Carousel primitives (mirror of FotografosLanding) ─────────────────────

function useCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

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
    <div className="mc-carousel-dots" aria-hidden={active < 0}>
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
              border: "none", padding: 0, cursor: "pointer",
              transition: "width 0.22s ease, background 0.22s ease",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

export default function MarcasLanding() {
  return (
    <div style={{ background: c.bg, color: c.ink, fontFamily: FONT_GROTESK, minHeight: "100vh" }}>
      <style>{globalCSS}</style>
      <SiteHeader lang="es" />
      <Hero />
      <BrandStrip />
      <ValueProps />
      <Products />
      <Verticals />
      <Cases />
      <HowItWorks />
      <Contact />
      <FAQ />
      <Footer />
    </div>
  );
}

// ─── Brand strip — social proof ──────────────────────────────────────────────
// Brands that have activated with us. Placeholder wordmarks for now (generic,
// not real third parties) — swap for real client logos when cleared.

const BRANDS = ["OCESA", "CCXP", "OMELETE CO.", "CORONA", "TELCEL", "SPOTIFY", "HEINEKEN", "RED BULL"];

function BrandStrip() {
  return (
    <section style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`, background: c.surface }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "26px clamp(20px, 4vw, 40px)" }}>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute,
          letterSpacing: "0.18em", textTransform: "uppercase", textAlign: "center", marginBottom: 18,
        }}>
          Marcas que ya activaron con nosotros
        </div>
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center",
          gap: "clamp(20px, 4vw, 48px)",
        }}>
          {BRANDS.map((b) => (
            <span key={b} style={{
              fontFamily: FONT_GROTESK, fontSize: "clamp(15px, 1.6vw, 19px)", fontWeight: 800,
              letterSpacing: "-0.01em", color: c.inkSoft, opacity: 0.55,
              filter: "grayscale(1)",
            }}>{b}</span>
          ))}
        </div>
      </div>
    </section>
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
      {HERO_SLIDES.map((s, i) => (
        <div key={i} style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${s.url})`,
          backgroundSize: "cover",
          backgroundPosition: s.pos,
          opacity: i === active ? 1 : 0,
          transition: "opacity 1.4s ease",
          transform: `scale(${i === active ? 1.06 : 1})`,
          transitionProperty: "opacity, transform",
          transitionDuration: "1.4s, 8s",
        }} />
      ))}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.78) 60%, ${c.bg} 100%)`,
      }} />
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

      <div style={{
        position: "relative", zIndex: 2,
        maxWidth: 1280, margin: "0 auto",
        padding: "clamp(48px, 6vw, 88px) clamp(20px, 4vw, 40px) clamp(36px, 4.5vw, 64px)",
        display: "flex", flexDirection: "column", gap: 22,
      }}>
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
            animation: "mc-pulse 2.2s ease-in-out infinite",
          }} />
          <span style={{
            fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600,
            color: c.accent, letterSpacing: "0.12em", textTransform: "uppercase",
          }}>
            Patrocinios · FanSnap MX
          </span>
        </div>

        <div style={{
          fontFamily: FONT_MONO, fontSize: 12,
          color: c.inkMute, letterSpacing: "0.22em", textTransform: "uppercase",
        }}>
          Para marcas / 2026 →
        </div>

        <h1 style={{
          fontFamily: FONT_GROTESK,
          fontSize: "clamp(48px, 8vw, 112px)",
          fontWeight: 800,
          letterSpacing: "-0.045em",
          lineHeight: 0.95,
          margin: 0,
          maxWidth: 1100,
        }}>
          Llega a <span style={{ color: c.magenta }}>fans,</span> no a usuarios.
        </h1>

        <p style={{
          fontSize: "clamp(18px, 1.6vw, 22px)",
          color: c.inkSoft,
          lineHeight: 1.5,
          margin: 0,
          maxWidth: 720,
          fontWeight: 400,
        }}>
          FanSnap conecta tu marca con el momento exacto en que el fan busca su foto del evento. Reach permitido, recall medible, recovery cualificado — sobre el activo más compartido del evento: la imagen del fan.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
          <a href="#contacto" style={primaryCTA} className="mc-cta-primary">
            <span>Habla con comercial</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </a>
          <a href="#productos" style={secondaryCTA} className="mc-cta-secondary">
            <span>Ver productos</span>
            <ArrowDown size={16} strokeWidth={2.2} />
          </a>
        </div>

        <div style={{
          marginTop: "clamp(24px, 3vw, 40px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 1,
          background: c.border,
          border: `1px solid ${c.border}`,
        }} className="mc-stats">
          {[
            { k: "11", v: "Eventos activos en MX" },
            { k: "320k+", v: "Fans alcanzados / mes" },
            { k: "73%", v: "Tasa de match facial" },
            { k: "9d", v: "Tiempo de respuesta" },
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

// ─── Value props ───────────────────────────────────────────────────────────

function ValueProps() {
  return (
    <section style={section}>
      <SectionLabel n="01" label="Por qué" />
      <h2 style={sectionTitle}>
        Reach, recall,<br/>
        <span style={{ color: c.magenta }}>recovery.</span>
      </h2>
      <p style={sectionSub}>
        El fan llega buscando su foto. Tu marca aparece en el momento exacto en que él ya está prestando atención.
      </p>

      <div style={{
        marginTop: 48,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 1,
        background: c.border,
        border: `1px solid ${c.border}`,
      }}>
        {VALUE_PROPS.map((v, i) => {
          const Icon = v.icon;
          return (
            <div key={i} style={{
              background: c.bg, padding: "36px 30px",
              display: "flex", flexDirection: "column", gap: 14,
            }}>
              <Icon size={26} color={c.accent} strokeWidth={1.8} />
              <h3 style={{
                fontFamily: FONT_GROTESK, fontSize: 22, fontWeight: 700,
                letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0,
              }}>{v.title}</h3>
              <p style={{
                fontFamily: FONT_GROTESK, fontSize: 14, lineHeight: 1.55,
                color: c.inkSoft, margin: 0,
              }}>{v.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Products ──────────────────────────────────────────────────────────────

function Products() {
  const { scrollerRef, cardRefs, activeIdx, goTo } = useCarousel();
  return (
    <section id="productos" style={{ ...section, background: c.surface }}>
      <SectionLabel n="02" label="Productos" />
      <h2 style={sectionTitle}>
        Cuatro maneras<br/>
        de <span style={{ color: c.magenta }}>activar.</span>
      </h2>
      <p style={sectionSub}>
        Modulares y combinables. Empieza por uno o por el paquete completo según el objetivo del evento.
      </p>

      <div
        ref={scrollerRef}
        className="mc-products-grid mc-carousel"
        style={{
          marginTop: 48,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
          alignItems: "stretch",
        }}
      >
        {PRODUCTS.map((p, i) => {
          const Icon = p.icon;
          return (
            <div
              key={i}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="mc-product-card mc-carousel-card"
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                padding: "30px 26px",
                display: "flex", flexDirection: "column", gap: 16,
                position: "relative",
                transition: "border-color 0.18s ease, transform 0.18s ease",
              }}
            >
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 44, height: 44,
                background: c.accentSoft,
                border: `1px solid rgba(0,229,255,0.35)`,
              }}>
                <Icon size={20} color={c.accent} strokeWidth={2} />
              </div>
              <h3 style={{
                fontFamily: FONT_GROTESK, fontSize: 22, fontWeight: 700,
                letterSpacing: "-0.02em", lineHeight: 1.15, margin: 0,
              }}>{p.name}</h3>
              <p style={{
                fontFamily: FONT_GROTESK, fontSize: 14, lineHeight: 1.55,
                color: c.inkSoft, margin: 0,
              }}>{p.body}</p>
              <ul style={{
                listStyle: "none", padding: 0, margin: "auto 0 0",
                display: "flex", flexDirection: "column", gap: 10,
                borderTop: `1px solid ${c.border}`, paddingTop: 16,
              }}>
                {p.metrics.map((m, j) => (
                  <li key={j} style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    fontFamily: FONT_GROTESK, fontSize: 13, lineHeight: 1.4, color: c.ink,
                  }}>
                    <CheckCircle2 size={14} color={c.accent} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 3 }} />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <CarouselDots
        count={PRODUCTS.length}
        active={activeIdx}
        onPick={goTo}
        labelFor={(i) => `Ver ${PRODUCTS[i].name}`}
      />
    </section>
  );
}

// ─── Verticals ─────────────────────────────────────────────────────────────

function Verticals() {
  return (
    <section style={section}>
      <SectionLabel n="03" label="Verticales" />
      <h2 style={sectionTitle}>Donde activamos.</h2>
      <p style={sectionSub}>
        El calendario 2026 cubre cuatro verticales con la cobertura de Ocesa y Omelete Company.
      </p>

      <div style={{
        marginTop: 48,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 14,
      }}>
        {VERTICALS.map((v, i) => {
          const Icon = v.icon;
          return (
            <div key={i} style={{
              background: c.surface,
              border: `1px solid ${c.border}`,
              padding: "28px 26px",
              display: "flex", flexDirection: "column", gap: 14,
            }} className="mc-vertical-card">
              <Icon size={28} color={c.magenta} strokeWidth={1.8} />
              <div>
                <div style={{
                  fontFamily: FONT_GROTESK, fontSize: 20, fontWeight: 700,
                  letterSpacing: "-0.01em", color: c.ink,
                }}>{v.name}</div>
                <div style={{
                  marginTop: 4,
                  fontFamily: FONT_MONO, fontSize: 11, color: c.accent,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                }}>{v.count}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Cases ─────────────────────────────────────────────────────────────────

function Cases() {
  const { scrollerRef, cardRefs, activeIdx, goTo } = useCarousel();
  return (
    <section style={{ ...section, background: c.surface }}>
      <SectionLabel n="04" label="Casos" />
      <h2 style={sectionTitle}>Resultados.</h2>
      <p style={sectionSub}>
        Ejemplos de activaciones recientes en eventos del calendario.
        <span style={{
          marginLeft: 10,
          fontFamily: FONT_MONO, fontSize: 10, color: c.warn,
          letterSpacing: "0.12em", textTransform: "uppercase",
          padding: "2px 8px", border: `1px solid ${c.warn}`, borderRadius: 999,
        }}>Mock para preview</span>
      </p>

      <div
        ref={scrollerRef}
        className="mc-cases-grid mc-carousel"
        style={{
          marginTop: 32,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {CASES.map((cs, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            className="mc-case-card mc-carousel-card"
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              padding: "28px 26px",
              display: "flex", flexDirection: "column", gap: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                fontFamily: FONT_MONO, fontSize: 10, color: c.accent,
                letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "3px 8px",
                background: c.accentSoft,
                border: `1px solid rgba(0,229,255,0.35)`,
              }}>{cs.tag}</span>
              <span style={{
                fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute,
                letterSpacing: "0.12em", textTransform: "uppercase",
              }}>{cs.event}</span>
            </div>

            <div>
              <div style={{
                fontFamily: FONT_GROTESK, fontSize: 56, fontWeight: 800,
                letterSpacing: "-0.04em", lineHeight: 1,
                color: c.magenta,
              }}>{cs.metric.value}</div>
              <div style={{
                marginTop: 6,
                fontFamily: FONT_MONO, fontSize: 11, color: c.inkSoft,
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>{cs.metric.label}</div>
            </div>

            <p style={{
              margin: 0,
              fontFamily: FONT_GROTESK, fontSize: 16, lineHeight: 1.45,
              color: c.ink,
            }}>{cs.headline}</p>
            <div style={{
              marginTop: "auto", paddingTop: 16,
              borderTop: `1px solid ${c.border}`,
              fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute,
              letterSpacing: "0.12em", textTransform: "uppercase",
            }}>
              {cs.brand}
            </div>
          </div>
        ))}
      </div>

      <CarouselDots
        count={CASES.length}
        active={activeIdx}
        onPick={goTo}
        labelFor={(i) => `Ver caso ${CASES[i].brand}`}
      />
    </section>
  );
}

// ─── How it works ──────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section style={section}>
      <SectionLabel n="05" label="Workflow" />
      <h2 style={sectionTitle}>Del brief<br/> al reporte.</h2>
      <p style={sectionSub}>
        Cuatro pasos. Sin desarrollos del lado de la marca. Sin sorpresas en el reporte final.
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

// ─── Contact form (#contacto) ───────────────────────────────────────────────

function Contact() {
  const [company, setCompany] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventInterest, setEventInterest] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ code: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const missing: string[] = [];
    if (!company.trim()) missing.push("empresa");
    if (!firstName.trim()) missing.push("nombre");
    if (!lastName.trim()) missing.push("apellido");
    if (!email.trim() || !email.includes("@")) missing.push("email");
    if (!message.trim()) missing.push("mensaje");
    if (missing.length > 0) {
      setError(`Falta completar: ${missing.join(", ")}.`);
      return;
    }

    setSubmitting(true);
    try {
      const r = await fetch("/api/brands/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim(),
          fullName: `${firstName.trim()} ${lastName.trim()}`,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: role.trim(),
          email: email.trim(),
          phone: phone.trim(),
          eventInterest: eventInterest.trim(),
          budget: budget.trim(),
          message: message.trim(),
          language: "es",
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data?.error ?? "Error al enviar. Intenta de nuevo.");
      } else {
        setResult({ code: data.leadCode });
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <section id="contacto" style={section}>
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
            Recibido.
          </h2>
          <p style={{
            fontFamily: FONT_GROTESK, fontSize: 16, color: c.ink, lineHeight: 1.5,
            margin: "0 0 24px",
          }}>
            Te respondemos con propuesta inicial en 5 días hábiles. Guarda tu código de seguimiento.
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
    <section id="contacto" style={{ ...section, background: c.surface }}>
      <SectionLabel n="06" label="Brief" />
      <h2 style={sectionTitle}>
        Habla con<br/>
        <span style={{ color: c.magenta }}>comercial.</span>
      </h2>
      <p style={sectionSub}>
        Cuéntanos qué quieres activar. Te respondemos con propuesta inicial en 5 días hábiles.
      </p>

      <form onSubmit={onSubmit} style={{
        marginTop: 48,
        maxWidth: 760,
        marginInline: "auto",
        display: "flex", flexDirection: "column", gap: 18,
      }}>
        <Field label="Empresa" value={company} onChange={setCompany} placeholder="Marca o agencia" />
        <FormRow>
          <Field label="Nombre" value={firstName} onChange={setFirstName} placeholder="María" />
          <Field label="Apellido" value={lastName} onChange={setLastName} placeholder="García López" />
        </FormRow>
        <FormRow>
          <Field label="Cargo" value={role} onChange={setRole} placeholder="Brand Manager" />
          <Field label="Teléfono" value={phone} onChange={setPhone} placeholder="+52 55 1234 5678" />
        </FormRow>
        <Field type="email" label="Email" value={email} onChange={setEmail} placeholder="tu@empresa.com" />
        <FormRow>
          <Field label="Evento de interés" value={eventInterest} onChange={setEventInterest} placeholder="CCXP México 2026, festival X..." />
          <Field label="Inversión estimada" value={budget} onChange={setBudget} placeholder="$ MXN o 'a definir'" />
        </FormRow>
        <FieldShell label="Mensaje">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="¿Qué quieres lograr? Reach, leads, presencia de marca, datos…"
            rows={5}
            style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
          />
        </FieldShell>

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
          className="mc-cta-primary mc-cta-big"
        >
          {submitting
            ? <><Loader2 size={18} className="mc-spin" /> Enviando…</>
            : <>Enviar brief <ArrowRight size={18} strokeWidth={2.5} /></>}
        </button>

        <p style={{
          textAlign: "center",
          fontFamily: FONT_MONO, fontSize: 10, color: c.inkMute,
          letterSpacing: "0.1em", textTransform: "uppercase",
          margin: "8px 0 0",
        }}>
          Tu información va directo al equipo comercial de FanSnap MX.
        </p>
      </form>
    </section>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section style={section}>
      <SectionLabel n="07" label="FAQ" />
      <h2 style={sectionTitle}>Preguntas<br/> frecuentes.</h2>
      <p style={sectionSub}>
        Lo que más nos preguntan agencias y marcas antes de cerrar.
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

// ─── Footer ────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
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
      }} className="mc-footer-grid">
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
          <a href="/fansnap" style={footLink} className="mc-foot-link">Inicio</a>
          <a href="/fansnap/fotografos" style={footLink} className="mc-foot-link">Fotógrafos</a>
          <a href="#productos" style={footLink} className="mc-foot-link">Productos</a>
          <a href="#contacto" style={footLink} className="mc-foot-link">Comercial</a>
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
        <span>v0 · Para marcas · OCESA × OMELETE COMPANY</span>
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
      <span style={{ color: c.accent, fontWeight: 700 }}>/ {n}</span>
      <span style={{ width: 24, height: 1, background: c.border }} />
      <span>{label}</span>
    </div>
  );
}

// ─── CTA + form primitives ─────────────────────────────────────────────────

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

function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mc-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {children}
    </div>
  );
}

function FieldShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }} className="mc-field">
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
  @keyframes mc-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.35; transform: scale(0.75); }
  }
  @keyframes mc-spin { to { transform: rotate(360deg); } }
  .mc-spin { animation: mc-spin 0.8s linear infinite; }

  .mc-cta-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(0,229,255,0.28);
  }
  .mc-cta-secondary:hover {
    border-color: ${c.ink};
  }
  .mc-cta-big:hover {
    transform: translateY(-2px);
    box-shadow: 0 18px 48px rgba(0,229,255,0.32);
  }

  .mc-product-card:hover,
  .mc-vertical-card:hover,
  .mc-case-card:hover {
    border-color: ${c.borderStrong};
    transform: translateY(-2px);
    transition: border-color 0.18s ease, transform 0.18s ease;
  }
  .mc-foot-link:hover { color: ${c.ink}; }

  .mc-field:focus-within input,
  .mc-field:focus-within textarea {
    border-color: ${c.accent} !important;
    background: rgba(0,229,255,0.085) !important;
    box-shadow: 0 0 0 4px ${c.accentSoft};
  }

  .mc-carousel-dots { display: none; }

  @media (max-width: 920px) {
    .mc-carousel {
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
      touch-action: pan-y;
      cursor: grab;
      user-select: none;
      -webkit-user-select: none;
      overscroll-behavior-x: contain;
    }
    .mc-carousel.is-dragging {
      cursor: grabbing;
      scroll-snap-type: none;
      scroll-behavior: auto;
    }
    .mc-carousel::-webkit-scrollbar { display: none; }
    .mc-carousel-card {
      flex: 0 0 86%;
      max-width: 86%;
      scroll-snap-align: center;
      transform: none !important;
      -webkit-user-drag: none;
    }
    .mc-carousel-card:hover { transform: none !important; }
    .mc-carousel-dots {
      display: flex !important;
      justify-content: center;
      align-items: center;
      gap: 8px;
      margin-top: 24px;
    }
  }

  @media (max-width: 600px) {
    .mc-form-row { grid-template-columns: 1fr !important; }
    .mc-footer-grid { grid-template-columns: 1fr !important; align-items: flex-start !important; }
  }
`;
