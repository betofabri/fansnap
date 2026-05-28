"use client";

/**
 * FanSnap — Fatia 1 unified client app.
 *
 * Ported 1:1 from the validated prototype (fansnap-unified.jsx) into Next.js.
 * SPA-style internal navigation via `page` state — once Fatia 2 brings real
 * data, this fans out into proper App Router routes.
 *
 * Logo: temporary Imgur thumbnail (per FanSnap brief §7); replace with
 * self-hosted SVG variants when production assets are ready.
 */

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, Fragment } from "react";
import {
  Search, Music, Gamepad2, Trophy, PartyPopper, ChevronLeft, Calendar, MapPin, Camera,
  ArrowRight, Menu, Scan, Grid3x3, X, Upload, Check, Eye, Zap, Sun, Moon, ShoppingBag,
  Download, Image as ImageIcon, Shirt, Coffee, Frame, Plus, Minus, Sparkles,
} from "lucide-react";
import { THEMES, type Theme, type ThemeName } from "@/lib/theme";
import { I18N, LANGS, type Copy, type Lang } from "@/lib/i18n";
import {
  EVENTS, FEATURED_EVENTS, RECENT_EVENTS, UPCOMING_EVENTS,
  getPhotosForEvent, PRODUCTS, MXN_RATE, type Event as FsEvent, type Photo,
} from "@/lib/mock";

// Logo is rendered inline as SVG (not an <img>) so it can inherit the
// Space Grotesk font we already load via next/font + the brand gradient.
// Horizontal wordmark — much more readable at header sizes than the
// skull-shape vertical lockup (which left the inner text illegible at 44px).
// public/logo.svg still ships as a static-asset variant for og-image / favicon.

type Page = "home" | "event" | "selfie" | "scanning" | "gallery" | "photo";
type CartItem = {
  photoId: number; format: string; size: string | null; color: string | null;
  qty: number; priceUSD: number; tile: string;
};
type Category = "all" | "music" | "conventions" | "sports" | "parties";

const productIcon = {
  download: Download, image: ImageIcon, shirt: Shirt, coffee: Coffee, frame: Frame,
} as const;

const categoryLabel = (cat: string, t: Copy): string => {
  const map: Record<string, string> = {
    music: t.cat_music, conventions: t.cat_conventions, sports: t.cat_sports, parties: t.cat_parties,
  };
  return (map[cat] ?? cat).toUpperCase();
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
};

// --- localStorage-backed preferences via useSyncExternalStore. Cookie-based
// SSR sync arrives in Fatia 2 (will let us render the right theme on first paint
// instead of hydrating from default → user choice).
const subscribeStorage = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

function usePersistedTheme(): [ThemeName, (t: ThemeName) => void] {
  const value = useSyncExternalStore<ThemeName>(
    subscribeStorage,
    () => {
      const t = localStorage.getItem("fs:theme");
      return t === "light" || t === "dark" ? (t as ThemeName) : "dark";
    },
    () => "dark", // SSR / first paint
  );
  const setter = useCallback((t: ThemeName) => {
    localStorage.setItem("fs:theme", t);
    // useSyncExternalStore won't auto-re-read same-tab writes, so notify ourselves.
    window.dispatchEvent(new StorageEvent("storage", { key: "fs:theme", newValue: t }));
  }, []);
  return [value, setter];
}

function usePersistedLang(): [Lang, (l: Lang) => void] {
  const value = useSyncExternalStore<Lang>(
    subscribeStorage,
    () => {
      const l = localStorage.getItem("fs:lang");
      return l === "en" || l === "pt" || l === "es" ? (l as Lang) : "en";
    },
    () => "en",
  );
  const setter = useCallback((l: Lang) => {
    localStorage.setItem("fs:lang", l);
    window.dispatchEvent(new StorageEvent("storage", { key: "fs:lang", newValue: l }));
  }, []);
  return [value, setter];
}

// ============================================================
export default function FanSnapApp() {
  const [theme, setTheme] = usePersistedTheme();
  const [lang, setLang] = usePersistedLang();
  const [page, setPage] = useState<Page>("home");
  const [activeEvent, setActiveEvent] = useState<FsEvent | null>(null);
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [selfie, setSelfie] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mobileNav, setMobileNav] = useState(false);

  const c = THEMES[theme];
  const t = I18N[lang];

  const goTo = (p: Page) => {
    setPage(p);
    setMobileNav(false);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" });
  };

  const startEvent = (e: FsEvent) => { setActiveEvent(e); goTo("event"); };
  const startScan = () => goTo("selfie");

  const goHome = () => {
    setActiveEvent(null);
    setActivePhoto(null);
    setSelected(new Set());
    setSelfie(null);
    setConsent(false);
    goTo("home");
  };

  /** Jump to a section on the home page. If we're elsewhere (event, gallery, etc.),
   *  reset to home first then scroll once the DOM lands the anchor. */
  const goToSection = (id: string) => {
    const scroll = () => {
      const el = typeof document !== "undefined" ? document.getElementById(id) : null;
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (page !== "home") {
      goHome();
      // give React + DOM a beat to mount the home tree
      setTimeout(scroll, 80);
    } else {
      scroll();
    }
  };

  return (
    <div style={appStyle(c)}>
      <ThemeStyles c={c} />

      <Header
        theme={theme} setTheme={setTheme}
        lang={lang} setLang={setLang}
        c={c} t={t}
        onLogo={goHome}
        onNavSection={goToSection}
        cartCount={cart.length}
        mobileNav={mobileNav} setMobileNav={setMobileNav}
      />

      {page === "home" && (
        <Home c={c} t={t} category={category} setCategory={setCategory} search={search} setSearch={setSearch} onPick={startEvent} />
      )}
      {page === "event" && activeEvent && (
        <EventPage c={c} t={t} event={activeEvent} onBack={goHome} onStart={startScan} />
      )}
      {page === "selfie" && activeEvent && (
        <SelfieStep
          c={c} t={t} event={activeEvent}
          selfie={selfie} setSelfie={setSelfie}
          consent={consent} setConsent={setConsent}
          onContinue={() => goTo("scanning")}
          onBack={() => goTo("event")}
        />
      )}
      {page === "scanning" && activeEvent && (
        <Scanning c={c} t={t} event={activeEvent} onDone={() => goTo("gallery")} />
      )}
      {page === "gallery" && activeEvent && (
        <Gallery
          c={c} t={t} event={activeEvent}
          selected={selected} setSelected={setSelected}
          onPick={(p) => { setActivePhoto(p); goTo("photo"); }}
          onBack={() => goTo("event")}
        />
      )}
      {page === "photo" && activePhoto && activeEvent && (
        <PhotoDetail
          c={c} t={t} event={activeEvent} photo={activePhoto}
          onBack={() => goTo("gallery")}
          onAdd={(item) => setCart([...cart, item])}
        />
      )}

      <Footer c={c} />
    </div>
  );
}

// ============================================================
// LOGO
// ============================================================
function FanSnapLogo({ size = "md", theme: _theme = "dark" }: { size?: "xs" | "sm" | "md" | "lg"; theme?: ThemeName }) {
  void _theme; // gradient handles both themes; no invert trick needed
  const heights = { xs: 28, sm: 36, md: 44, lg: 72 };
  const h = heights[size];

  // useId gives each instance a unique gradient id so multiple logos on the
  // same page (header + footer) don't collide on `url(#...)` references.
  const reactId = useId().replace(/:/g, "");
  const gid = `fsg-${reactId}`;

  // viewBox 380×80 → ~4.75:1 aspect ratio. At header md=44px, this is ~209px
  // wide — comfortable for the wordmark + the two "eye" circles between
  // "fan" and "Snap" that preserve the skull personality.
  return (
    <svg
      viewBox="0 0 380 80"
      style={{ height: h, width: "auto", display: "block", flexShrink: 0 }}
      role="img"
      aria-label="FanSnap"
    >
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#C13EFF" />
          <stop offset="55%" stopColor="#7B4EFF" />
          <stop offset="100%" stopColor="#00B8FF" />
        </linearGradient>
      </defs>

      {/* "fan" */}
      <text
        x="0"
        y="62"
        fontFamily="var(--font-grotesk), system-ui, sans-serif"
        fontWeight="700"
        fontSize="64"
        fill={`url(#${gid})`}
        letterSpacing="-3"
      >
        fan
      </text>

      {/* Two eye circles — pulled from the skull motif */}
      <circle cx="138" cy="36" r="11" stroke={`url(#${gid})`} strokeWidth="3" fill="none" />
      <circle cx="138" cy="34" r="4.5" fill={`url(#${gid})`} />
      <circle cx="170" cy="36" r="11" stroke={`url(#${gid})`} strokeWidth="3" fill="none" />
      <circle cx="170" cy="34" r="4.5" fill={`url(#${gid})`} />

      {/* "Snap" */}
      <text
        x="195"
        y="62"
        fontFamily="var(--font-grotesk), system-ui, sans-serif"
        fontWeight="700"
        fontSize="64"
        fill={`url(#${gid})`}
        letterSpacing="-3"
      >
        Snap
      </text>
    </svg>
  );
}

// ============================================================
// HEADER
// ============================================================

/** Scroll smoothly to a section on the home page; works from any sub-screen
 *  too because the home is the only route in Fatia 1.5. The caller passes
 *  `onNavigate` so we can also reset to the home screen first when we're
 *  inside the event → selfie → gallery flow. */
const NAV_ITEMS: ReadonlyArray<{ id: string; key: "nav_how" | "nav_events" | "nav_photographers" | "nav_brand" }> = [
  { id: "how", key: "nav_how" },
  { id: "events", key: "nav_events" },
  { id: "photographers", key: "nav_photographers" },
  { id: "brand", key: "nav_brand" },
];

function Header({
  theme, setTheme, lang, setLang, c, t, onLogo, onNavSection, cartCount, mobileNav, setMobileNav,
}: {
  theme: ThemeName; setTheme: (n: ThemeName) => void;
  lang: Lang; setLang: (l: Lang) => void;
  c: Theme; t: Copy;
  onLogo: () => void;
  onNavSection: (id: string) => void;
  cartCount: number;
  mobileNav: boolean; setMobileNav: (v: boolean) => void;
}) {
  return (
    <header style={headerStyle(c)}>
      <div style={headerInnerStyle()}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onLogo} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <FanSnapLogo size="md" theme={theme} />
          </button>
          <div className="ff-desktop-only" style={poweredByStyle(c)}>
            <span style={{ opacity: 0.65 }}>{t.powered_by}</span>{" "}
            <span style={{ color: c.purple, fontWeight: 700 }}>O&amp;CO</span>
          </div>
        </div>

        <nav style={{ display: "flex", gap: 2 }} className="ff-desktop-nav">
          {NAV_ITEMS.map((it) => (
            <button
              key={it.id}
              onClick={() => onNavSection(it.id)}
              style={navLinkStyle(c)}
              className="ff-nav-link"
            >
              {t[it.key]}
            </button>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={themeToggleStyle(c)}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={14} strokeWidth={2.5} /> : <Moon size={14} strokeWidth={2.5} />}
          </button>
          <div className="ff-desktop-only">
            <LangToggle lang={lang} setLang={setLang} c={c} />
          </div>
          {cartCount > 0 && (
            <button style={cartBtnStyle(c)} className="ff-cta-cart">
              <ShoppingBag size={14} strokeWidth={2.5} />
              <span style={{ marginLeft: 6 }}>{cartCount}</span>
            </button>
          )}
          <button
            onClick={() => setMobileNav(!mobileNav)}
            style={menuBtnStyle(c)}
            className="ff-mobile-only"
            aria-label="Menu"
          >
            {mobileNav ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {mobileNav && (
        <div style={mobileMenuStyle(c)}>
          {NAV_ITEMS.map((it) => (
            <button
              key={it.id}
              onClick={() => { onNavSection(it.id); setMobileNav(false); }}
              style={mobileNavLinkStyle(c)}
            >
              {t[it.key]}
            </button>
          ))}
          <div style={{ height: 2, background: c.border, margin: "8px 0" }} />
          <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8 }}>
            <LangToggle lang={lang} setLang={setLang} c={c} />
          </div>
          <button style={{ ...signinBtnStyle(c), width: "100%", justifyContent: "center", display: "flex" }}>
            {t.nav_login}
          </button>
        </div>
      )}
    </header>
  );
}

function LangToggle({ lang, setLang, c }: { lang: Lang; setLang: (l: Lang) => void; c: Theme }) {
  return (
    <div style={langToggleStyle(c)}>
      {LANGS.map((l, i) => (
        <Fragment key={l}>
          {i > 0 && <div style={{ width: 2, height: 18, background: c.border }} />}
          <button onClick={() => setLang(l)} style={langBtnStyle(c, lang === l)}>{l.toUpperCase()}</button>
        </Fragment>
      ))}
    </div>
  );
}

// ============================================================
// CORNER BRACKETS
// ============================================================
function CornerBrackets({ color }: { color: string }) {
  const base = { position: "absolute" as const, width: 14, height: 14, pointerEvents: "none" as const, zIndex: 5 };
  return (
    <>
      <div style={{ ...base, top: 12, left: 12, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <div style={{ ...base, top: 12, right: 12, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
      <div style={{ ...base, bottom: 12, left: 12, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <div style={{ ...base, bottom: 12, right: 12, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />
    </>
  );
}

// ============================================================
// HOMEPAGE
// ============================================================
function Home({
  c, t, category, setCategory, search, setSearch, onPick,
}: {
  c: Theme; t: Copy;
  category: Category; setCategory: (v: Category) => void;
  search: string; setSearch: (v: string) => void;
  onPick: (e: FsEvent) => void;
}) {
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setHeroIdx((i) => (i + 1) % FEATURED_EVENTS.length), 7000);
    return () => clearInterval(tick);
  }, []);

  const filterFn = (e: FsEvent) => {
    const matchesCat = category === "all" || e.category === category;
    const q = search.toLowerCase();
    const matchesSearch = !q || e.name.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  };

  const upcomingFiltered = UPCOMING_EVENTS.filter(filterFn);

  return (
    <>
      <Hero c={c} t={t} heroIdx={heroIdx} setHeroIdx={setHeroIdx} onStart={() => onPick(FEATURED_EVENTS[heroIdx])} />
      <HowItWorks c={c} t={t} />
      <section id="events">
        <SearchBar c={c} t={t} category={category} setCategory={setCategory} search={search} setSearch={setSearch} />
        <FeedSection c={c} t={t} label={t.section_recent} sub={t.section_recent_sub} marker="01"
          events={RECENT_EVENTS.filter(filterFn)} onPick={onPick} />
        {upcomingFiltered.length > 0 && (
          <FeedSection c={c} t={t} label={t.section_upcoming} sub={t.section_upcoming_sub} marker="02"
            events={upcomingFiltered} onPick={onPick} />
        )}
      </section>
      <ForPhotographers c={c} t={t} />
      <ForBrand c={c} t={t} />
    </>
  );
}

// ============================================================
// HOW IT WORKS
// ============================================================
function HowItWorks({ c, t }: { c: Theme; t: Copy }) {
  const steps = [
    { n: "01", title: t.how_step1_title, body: t.how_step1_body, color: c.purple },
    { n: "02", title: t.how_step2_title, body: t.how_step2_body, color: c.cyan },
    { n: "03", title: t.how_step3_title, body: t.how_step3_body, color: c.pink },
  ];
  return (
    <section id="how" style={{ background: c.bg, borderBottom: `2px solid ${c.border}` }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(48px, 6vw, 80px) clamp(20px, 3vw, 32px)" }}>
        <div style={kickerStyle(c)}>
          <span style={kickerDotStyle(c)} />
          <span style={{ color: c.cyan, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em" }}>{t.how_kicker}</span>
        </div>
        <h2 style={{ fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.0, margin: "0 0 12px 0", textTransform: "uppercase", color: c.ink, maxWidth: 760 }}>{t.how_title}</h2>
        <p style={{ fontSize: "clamp(14px, 1.4vw, 16px)", color: c.inkSoft, marginBottom: 40, maxWidth: 560, lineHeight: 1.5 }}>{t.how_sub}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{
              position: "relative", background: c.bgPaper, border: `2px solid ${c.border}`,
              padding: "clamp(24px, 3vw, 32px)", overflow: "hidden",
              opacity: 0, animation: `fadeUp 0.5s ${i * 0.08}s forwards`, transition: "all 0.2s",
            }} className="ff-highlight">
              <CornerBrackets color={s.color} />
              <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 13, color: s.color, fontWeight: 700, border: `2px solid ${s.color}`, padding: "5px 9px", letterSpacing: "0.05em", display: "inline-block", marginBottom: 16, background: c.bg }}>{s.n}</div>
              <div style={{ fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 700, letterSpacing: "-0.02em", color: c.ink, textTransform: "uppercase", marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: c.inkSoft }}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FOR PHOTOGRAPHERS
// ============================================================
function ForPhotographers({ c, t }: { c: Theme; t: Copy }) {
  return (
    <section id="photographers" style={{ background: c.bgAlt, borderBottom: `2px solid ${c.border}` }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(48px, 6vw, 80px) clamp(20px, 3vw, 32px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px, 4vw, 60px)", alignItems: "center" }} className="ff-hero-grid">
        <div>
          <div style={kickerStyle(c)}>
            <span style={kickerDotStyle(c)} />
            <span style={{ color: c.cyan, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em" }}>{t.photographers_kicker}</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.0, margin: "0 0 16px 0", textTransform: "uppercase", color: c.ink }}>{t.photographers_title}</h2>
          <p style={{ fontSize: "clamp(14px, 1.4vw, 16px)", color: c.inkSoft, marginBottom: 28, lineHeight: 1.55, maxWidth: 540 }}>{t.photographers_body}</p>
          <button style={ctaPrimaryStyle(c)} className="ff-cta-primary">
            <Camera size={16} strokeWidth={2.5} />
            <span>{t.photographers_cta}</span>
            <ArrowRight size={16} strokeWidth={3} />
          </button>
        </div>
        <div style={{ position: "relative", aspectRatio: "4/3", border: `3px solid ${c.purple}`, overflow: "hidden", boxShadow: `8px 8px 0 0 ${c.purple}` }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://picsum.photos/seed/fansnap-photographer/900/700)", backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(157,78,255,0.25) 0%, rgba(10,10,15,0.55) 100%)" }} />
          <CornerBrackets color={c.cyan} />
          <div style={{ position: "absolute", bottom: 14, left: 14, fontFamily: "var(--font-mono), monospace", fontSize: 10, color: "#fff", fontWeight: 700, letterSpacing: "0.1em", background: "rgba(0,0,0,0.55)", padding: "5px 9px", border: "2px solid rgba(255,255,255,0.2)" }}>STANDARD · 50% · PRO · VIP</div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FOR YOUR BRAND
// ============================================================
function ForBrand({ c, t }: { c: Theme; t: Copy }) {
  return (
    <section id="brand" style={{ background: c.bg, borderBottom: `2px solid ${c.border}` }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(48px, 6vw, 80px) clamp(20px, 3vw, 32px)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px, 4vw, 60px)", alignItems: "center" }} className="ff-hero-grid">
        <div style={{ position: "relative", aspectRatio: "4/3", border: `3px solid ${c.cyan}`, overflow: "hidden", boxShadow: `8px 8px 0 0 ${c.cyan}`, order: 1 }} className="ff-brand-tile">
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url(https://picsum.photos/seed/fansnap-brand/900/700)", backgroundSize: "cover", backgroundPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,184,212,0.25) 0%, rgba(10,10,15,0.55) 100%)" }} />
          <CornerBrackets color={c.purple} />
          <div style={{ position: "absolute", bottom: 14, left: 14, fontFamily: "var(--font-mono), monospace", fontSize: 10, color: "#fff", fontWeight: 700, letterSpacing: "0.1em", background: "rgba(0,0,0,0.55)", padding: "5px 9px", border: "2px solid rgba(255,255,255,0.2)" }}>SPONSORED · FREE FOR FANS · BRANDED</div>
        </div>
        <div style={{ order: 2 }}>
          <div style={kickerStyle(c)}>
            <span style={kickerDotStyle(c)} />
            <span style={{ color: c.cyan, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em" }}>{t.brand_kicker}</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.0, margin: "0 0 16px 0", textTransform: "uppercase", color: c.ink }}>{t.brand_title}</h2>
          <p style={{ fontSize: "clamp(14px, 1.4vw, 16px)", color: c.inkSoft, marginBottom: 28, lineHeight: 1.55, maxWidth: 540 }}>{t.brand_body}</p>
          <button style={ctaPrimaryStyle(c)} className="ff-cta-primary">
            <Sparkles size={16} strokeWidth={2.5} />
            <span>{t.brand_cta}</span>
            <ArrowRight size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </section>
  );
}

function Hero({
  c, t, heroIdx, setHeroIdx, onStart,
}: { c: Theme; t: Copy; heroIdx: number; setHeroIdx: (i: number) => void; onStart: () => void }) {
  const ev = FEATURED_EVENTS[heroIdx];
  return (
    <section style={heroStyle(c)}>
      <CornerBrackets color={c.purple} />
      <div style={heroGridLinesStyle(c)} />
      <div style={heroInnerStyle()} className="ff-hero-grid">
        <div>
          <div style={kickerStyle(c)}>
            <span style={kickerDotStyle(c)} />
            <span style={{ color: c.cyan, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em" }}>{t.hero_kicker}</span>
          </div>

          <h1 style={heroTitleStyle(c)}>
            <span style={heroLineStyle()} className="ff-up">{t.hero_t1}</span>
            <span style={{ ...heroLineStyle(), ...gradTextStyle(c) }} className="ff-up">{t.hero_t2}</span>
            {/* T3 is the "we have the proof" tagline — styled smaller +
                regular-weight + nowrap so it stays on one line across all
                viewports and languages instead of competing with the headline. */}
            <span style={heroLineT3Style(c)} className="ff-up">{t.hero_t3}</span>
          </h1>

          <p style={heroSubStyle(c)} className="ff-up">{t.hero_sub}</p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", opacity: 0, animation: "fadeUp 0.7s 0.55s forwards" }}>
            <button onClick={onStart} style={ctaPrimaryStyle(c)} className="ff-cta-primary">
              <Scan size={16} strokeWidth={2.5} />
              <span>{t.hero_cta}</span>
              <ArrowRight size={16} strokeWidth={3} />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <PassCard c={c} t={t} event={ev} idx={heroIdx} setIdx={setHeroIdx} />
        </div>
      </div>
    </section>
  );
}

function PassCard({
  c, t, event, idx, setIdx,
}: { c: Theme; t: Copy; event: FsEvent; idx: number; setIdx: (i: number) => void }) {
  return (
    <div style={passCardStyle(c)} className="ff-pass-card">
      <div style={passHeaderStyle(c)}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em" }}>{t.pass_no}</div>
        <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em" }}>{event.code}</div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 8px",
          background: event.status === "live" ? c.pink : c.bg, color: "#fff",
          fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
        }}>
          {event.status === "live" ? (
            <>
              <span style={{ width: 5, height: 5, background: "#fff", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
              <span>{t.live}</span>
            </>
          ) : (<span style={{ color: c.ink }}>{t.next}</span>)}
        </div>
      </div>

      <div style={{
        position: "relative", aspectRatio: "4/3", overflow: "hidden",
        backgroundColor: event.color,
        backgroundImage: `url(${event.imageHero})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }}>
        {/* darken the photo so the initials/code overlay stays readable */}
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${event.color}55 0%, rgba(10,10,15,0.45) 100%)` }} />
        <CornerBrackets color="rgba(255,255,255,0.85)" />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(56px, 9vw, 88px)", fontWeight: 700, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.04em", textShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>{event.initials}</div>
      </div>

      <div style={{ padding: "18px 16px 14px 16px", borderTop: `3px solid ${c.border}`, background: c.bgPaper }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: c.purple, letterSpacing: "0.18em", marginBottom: 6 }}>{t.featured}</div>
        <div style={{ fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 700, color: c.ink, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 10, textTransform: "uppercase" }}>{event.name}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: c.inkSoft }}>
            <MapPin size={12} strokeWidth={2.5} /><span>{event.venue}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: c.inkSoft }}>
            <Calendar size={12} strokeWidth={2.5} /><span>{formatDate(event.date)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "10px 14px", background: c.bgAlt, borderTop: `2px dashed ${c.border}` }}>
        <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10, color: c.purple, fontWeight: 700, letterSpacing: "0.05em" }}>
          {event.photoCount > 0 ? `${event.photoCount.toLocaleString()} ${t.photos_count}` : "· UPCOMING"}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {FEATURED_EVENTS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} aria-label={`featured ${i + 1}`} style={{
              width: i === idx ? 20 : 6, height: 6, background: i === idx ? c.purple : c.border,
              border: "none", cursor: "pointer", padding: 0, transition: "all 0.2s",
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchBar({
  c, t, category, setCategory, search, setSearch,
}: { c: Theme; t: Copy; category: Category; setCategory: (v: Category) => void; search: string; setSearch: (v: string) => void }) {
  return (
    <section style={{ background: c.bg, borderBottom: `2px solid ${c.border}` }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: 20 }}>
        <div style={searchBoxStyle(c)}>
          <Search size={16} strokeWidth={2.5} style={{ color: c.purple }} />
          <input
            placeholder={t.search_placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInputStyle(c)}
          />
          <div style={searchHotkeyStyle(c)} className="ff-desktop-only">⌘ K</div>
        </div>

        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          <CatBtn c={c} icon={Grid3x3} label={t.cat_all} active={category === "all"} onClick={() => setCategory("all")} />
          <CatBtn c={c} icon={Music} label={t.cat_music} active={category === "music"} onClick={() => setCategory("music")} />
          <CatBtn c={c} icon={Gamepad2} label={t.cat_conventions} active={category === "conventions"} onClick={() => setCategory("conventions")} />
          <CatBtn c={c} icon={Trophy} label={t.cat_sports} active={category === "sports"} onClick={() => setCategory("sports")} />
          <CatBtn c={c} icon={PartyPopper} label={t.cat_parties} active={category === "parties"} onClick={() => setCategory("parties")} />
        </div>
      </div>
    </section>
  );
}

function CatBtn({
  c, icon: Icon, label, active, onClick,
}: { c: Theme; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={catBtnStyle(c, active)} className="ff-cat-btn">
      <Icon size={13} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
}

function FeedSection({
  c, t, label, sub, marker, events, onPick,
}: { c: Theme; t: Copy; label: string; sub: string; marker: string; events: readonly FsEvent[]; onPick: (e: FsEvent) => void }) {
  // expose all 9 events even though some lists are pre-filtered by status
  void EVENTS;
  return (
    <section style={{ background: c.bg, borderBottom: `2px solid ${c.border}` }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(40px, 5vw, 60px) clamp(20px, 3vw, 32px)" }}>
        <div style={sectionHeaderStyle(c)}>
          <div style={sectionMarkerStyle(c)}>{marker}</div>
          <div style={{ flex: "0 0 30px", height: 2, background: c.border }} className="ff-desktop-only" />
          <div style={{ flex: 1, minWidth: 180 }}>
            <h2 style={sectionTitleStyle(c)}>{label}</h2>
            <div style={{ fontSize: 13, color: c.inkSoft, fontWeight: 500 }}>{sub}</div>
          </div>
          <div style={sectionCountStyle(c)}>
            <span style={{ fontFamily: "var(--font-grotesk), sans-serif", fontSize: 20, fontWeight: 700, color: c.cyan, letterSpacing: "-0.02em" }}>
              {String(events.length).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, color: c.inkSoft, letterSpacing: "0.1em" }}>EVENTS</span>
          </div>
        </div>

        {events.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {events.map((e, i) => (
              <EventCard key={e.id} c={c} t={t} event={e} onClick={() => onPick(e)} delay={i * 0.06} />
            ))}
          </div>
        ) : (
          <div style={{ padding: "60px 32px", textAlign: "center", border: `2px dashed ${c.border}`, background: c.bgPaper }}>
            <FanSnapLogo size="sm" theme={c.bg === "#0A0A0F" ? "dark" : "light"} />
            <div style={{ fontSize: 11, color: c.inkSoft, fontWeight: 700, letterSpacing: "0.15em", marginTop: 14 }}>NO RESULTS</div>
          </div>
        )}
      </div>
    </section>
  );
}

function EventCard({
  c, t, event, onClick, delay = 0,
}: { c: Theme; t: Copy; event: FsEvent; onClick: () => void; delay?: number }) {
  return (
    <button onClick={onClick} style={{ ...eventCardStyle(c), animationDelay: `${delay}s` }} className="ff-event-card">
      <div style={{
        position: "relative", aspectRatio: "4/3", overflow: "hidden",
        borderBottom: `2px solid ${c.border}`,
        backgroundColor: event.color,
        backgroundImage: `url(${event.image})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${event.color}55 0%, rgba(10,10,15,0.45) 100%)` }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <CornerBrackets color="rgba(255,255,255,0.85)" />
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(48px, 7vw, 76px)", fontWeight: 700, color: "rgba(255,255,255,0.95)", letterSpacing: "-0.04em", textShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>{event.initials}</div>

        {event.status === "live" && (
          <div style={{
            position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
            display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px",
            background: c.pink, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", zIndex: 6,
          }}>
            <span style={{ width: 5, height: 5, background: "#fff", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
            <span>{t.live}</span>
          </div>
        )}

        <div style={{ position: "absolute", bottom: 12, right: 12, fontFamily: "var(--font-mono), monospace", fontSize: 10, color: "rgba(255,255,255,0.95)", fontWeight: 700, letterSpacing: "0.05em", zIndex: 6, background: "rgba(0,0,0,0.5)", padding: "3px 6px" }}>
          {event.code}
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 9, color: c.purple, fontWeight: 700, letterSpacing: "0.15em", border: `2px solid ${c.purple}`, padding: "3px 8px", background: c.bgPaper }}>
            {categoryLabel(event.category, t)}
          </span>
          <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: 10, color: c.inkSoft, fontWeight: 500, letterSpacing: "0.05em" }}>
            {event.city}, {event.country}
          </span>
        </div>

        <div style={{ fontSize: 16, fontWeight: 700, color: c.ink, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 10, textTransform: "uppercase" }}>{event.name}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: c.inkSoft, marginBottom: 14 }}>
          <MapPin size={11} strokeWidth={2.5} /><span>{event.venue}</span>
        </div>

        <div style={{ height: 2, background: c.border, margin: "0 -16px 14px -16px" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          {event.photoCount > 0 ? (
            <>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: c.cyan, letterSpacing: "-0.02em", marginBottom: 2 }}>{event.photoCount.toLocaleString()}</div>
                <div style={{ fontSize: 9, color: c.inkSoft, fontWeight: 700, letterSpacing: "0.1em" }}>{t.photos_count}</div>
              </div>
              <div style={{ width: 2, height: 32, background: c.border }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: c.cyan, letterSpacing: "-0.02em", marginBottom: 2 }}>{event.photogCount}</div>
                <div style={{ fontSize: 9, color: c.inkSoft, fontWeight: 700, letterSpacing: "0.1em" }}>{t.photographers_count}</div>
              </div>
            </>
          ) : (
            <>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: c.cyan, letterSpacing: "-0.02em", marginBottom: 2 }}>{formatDate(event.date)}</div>
                <div style={{ fontSize: 9, color: c.inkSoft, fontWeight: 700, letterSpacing: "0.1em" }}>2026</div>
              </div>
              <div style={{ width: 2, height: 32, background: c.border }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: c.cyan, letterSpacing: "-0.02em", marginBottom: 2 }}>{event.photogCount > 0 ? event.photogCount : "—"}</div>
                <div style={{ fontSize: 9, color: c.inkSoft, fontWeight: 700, letterSpacing: "0.1em" }}>{t.photographers_count}</div>
              </div>
            </>
          )}
        </div>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "11px 13px", background: c.bg, border: `2px solid ${c.border}`,
          fontSize: 11, fontWeight: 700, color: c.ink, letterSpacing: "0.08em",
        }} className="ff-card-cta">
          <span>{event.photoCount > 0 ? t.find_my_photos : t.view_event}</span>
          <ArrowRight size={14} strokeWidth={3} />
        </div>
      </div>
    </button>
  );
}

// ============================================================
// EVENT PAGE
// ============================================================
function EventPage({
  c, t, event, onBack, onStart,
}: { c: Theme; t: Copy; event: FsEvent; onBack: () => void; onStart: () => void }) {
  return (
    <div className="ff-fade-in">
      <section style={{
        position: "relative", minHeight: "clamp(340px, 45vw, 420px)", overflow: "hidden",
        borderBottom: `3px solid ${c.border}`,
        backgroundColor: event.color,
        backgroundImage: `url(${event.imageHero})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom right, rgba(10,10,15,0.55) 0%, rgba(10,10,15,0.9) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <CornerBrackets color={c.cyan} />

        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "clamp(60px, 8vw, 80px) clamp(20px, 3vw, 32px) 32px", minHeight: "clamp(340px, 45vw, 420px)", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <button onClick={onBack} style={{
            position: "absolute", top: 20, left: "clamp(20px, 3vw, 32px)",
            display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px",
            background: "rgba(10,10,15,0.7)", border: "2px solid #fff", color: "#fff",
            fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.1em",
            textTransform: "uppercase", backdropFilter: "blur(10px)",
          }}>
            <ChevronLeft size={14} strokeWidth={3} />
            <span>{t.back}</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ display: "inline-block", padding: "4px 9px", background: "rgba(0,0,0,0.5)", border: `2px solid ${c.cyan}`, color: c.cyan, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em" }}>{categoryLabel(event.category, t)}</div>
            <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "rgba(255,255,255,0.95)", fontWeight: 600, background: "rgba(0,0,0,0.5)", padding: "4px 9px", border: "2px solid rgba(255,255,255,0.3)" }}>{event.code}</div>
          </div>

          <h1 style={{ fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(28px, 5.5vw, 64px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 0.95, margin: "0 0 20px 0", textTransform: "uppercase", color: "#fff", textShadow: "0 2px 24px rgba(0,0,0,0.3)" }}>{event.name}</h1>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", color: "rgba(255,255,255,0.92)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500 }}>
              <MapPin size={14} strokeWidth={2.5} />
              <span>{event.venue} · {event.city}, {event.country}</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500 }}>
              <Calendar size={14} strokeWidth={2.5} />
              <span>{formatDate(event.date)} · 2026</span>
            </div>
            {event.status === "live" && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#fff" }}>
                <span style={{ width: 5, height: 5, background: "#fff", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
                <span>{t.now_live}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ background: c.bgPaper, borderBottom: `2px solid ${c.border}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          <Stat c={c} label={t.photos_count} value={event.photoCount > 0 ? event.photoCount.toLocaleString() : "—"} accent={c.purple} />
          <Stat c={c} label={t.photographers_count} value={String(event.photogCount)} accent={c.cyan} />
          <Stat c={c} label={t.coverage} value={t.cover_panel} small />
        </div>
      </section>

      {event.photoCount > 0 && (
        <section style={{ background: c.bg, borderBottom: `2px solid ${c.border}` }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(40px, 5vw, 60px) clamp(20px, 3vw, 32px)" }}>
            <div style={sectionHeaderStyle(c)}>
              <div style={sectionMarkerStyle(c)}>03</div>
              <div style={{ flex: "0 0 30px", height: 2, background: c.border }} className="ff-desktop-only" />
              <div style={{ flex: 1, minWidth: 180 }}>
                <h2 style={sectionTitleStyle(c)}>{t.event_highlights}</h2>
                <div style={{ fontSize: 13, color: c.inkSoft, fontWeight: 500 }}>{t.highlights_sub}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} style={{
                  position: "relative", overflow: "hidden", cursor: "pointer",
                  border: `2px solid ${c.border}`, opacity: 0,
                  animation: `fadeUp 0.5s ${i * 0.06}s forwards`,
                  transition: "all 0.2s",
                  gridColumn: i === 1 ? "span 2" : "span 1",
                  aspectRatio: i === 1 ? "16/10" : "1/1",
                  backgroundColor: event.color,
                  backgroundImage: `url(https://picsum.photos/seed/fansnap-hl-${event.code}-${i}/800/600)`,
                  backgroundSize: "cover", backgroundPosition: "center",
                }} className="ff-highlight">
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${event.color}33 0%, rgba(10,10,15,0.35) 100%)` }} />
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
                  <CornerBrackets color="rgba(255,255,255,0.85)" />
                  <div style={{ position: "absolute", bottom: 12, right: 12, fontFamily: "var(--font-mono), monospace", fontSize: 9, color: "#fff", fontWeight: 700, letterSpacing: "0.08em", background: "rgba(0,0,0,0.5)", padding: "3px 7px", zIndex: 6 }}>FANSNAP · {event.code}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section style={{ background: c.bg, borderBottom: `2px solid ${c.border}` }}>
        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", padding: "clamp(40px, 5vw, 60px) clamp(20px, 3vw, 32px)", background: c.bgPaper, border: `3px solid ${c.purple}`, textAlign: "center", boxShadow: `0 0 40px ${c.purple}25` }}>
          <CornerBrackets color={c.purple} />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", border: `2px solid ${c.cyan}`, color: c.cyan, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 20, background: c.bg }}>
            <Scan size={12} strokeWidth={2.5} />
            <span>{t.scan_pill}</span>
          </div>
          <h3 style={{ fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(24px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 12px 0", textTransform: "uppercase", color: c.ink }}>{t.cta_start}</h3>
          <p style={{ fontSize: 14, color: c.inkSoft, marginBottom: 24, maxWidth: 440, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>{t.cta_sub}</p>
          <button onClick={onStart} style={ctaPrimaryStyle(c)} className="ff-cta-primary">
            <Scan size={16} strokeWidth={2.5} />
            <span>{t.cta_start}</span>
            <ArrowRight size={16} strokeWidth={3} />
          </button>
        </div>
      </section>
    </div>
  );
}

function Stat({ c, label, value, accent, small = false }: { c: Theme; label: string; value: string; accent?: string; small?: boolean }) {
  return (
    <div style={{ padding: "clamp(20px, 3vw, 32px) clamp(16px, 2vw, 32px)", borderRight: `2px solid ${c.border}` }}>
      <div style={{
        fontFamily: "var(--font-grotesk), sans-serif", fontWeight: 700, letterSpacing: "-0.02em",
        marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis",
        fontSize: small ? 14 : "clamp(24px, 4vw, 36px)", color: accent ?? c.ink,
      }}>{value}</div>
      <div style={{ fontSize: 9, color: c.inkSoft, fontWeight: 700, letterSpacing: "0.15em" }}>{label}</div>
    </div>
  );
}

// ============================================================
// SELFIE STEP
// ============================================================
function SelfieStep({
  c, t, event, selfie, setSelfie, consent, setConsent, onContinue, onBack,
}: {
  c: Theme; t: Copy; event: FsEvent;
  selfie: string | null; setSelfie: (v: string | null) => void;
  consent: boolean; setConsent: (v: boolean) => void;
  onContinue: () => void; onBack: () => void;
}) {
  void event;
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setSelfie(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  return (
    <section style={{ background: c.bg, borderBottom: `2px solid ${c.border}` }} className="ff-fade-in">
      <div style={{ position: "relative", maxWidth: 720, margin: "0 auto", padding: "clamp(40px, 6vw, 60px) clamp(20px, 3vw, 32px) 80px" }}>
        <button onClick={onBack} style={backBtnStyle(c)} className="ff-back-btn">
          <ChevronLeft size={14} strokeWidth={3} />
          <span>{t.back}</span>
        </button>

        <div style={stepBadgeStyle(c.purple)}>{t.step_label} 01 / 03</div>
        <h1 style={largeTitleStyle(c)}>{t.selfie_title}</h1>
        <p style={largeSubStyle(c)}>{t.selfie_sub}</p>

        <div style={{ position: "relative", width: "100%", maxWidth: 360, aspectRatio: "1/1", margin: "0 auto 24px", background: c.bgPaper, border: `3px solid ${c.border}`, overflow: "hidden" }}>
          <CornerBrackets color={c.cyan} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(to right, ${c.gridLineStrong} 1px, transparent 1px), linear-gradient(to bottom, ${c.gridLineStrong} 1px, transparent 1px)`, backgroundSize: "40px 40px", zIndex: 1 }} />

          {selfie ? (
            // user-uploaded data URL preview
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selfie} alt="selfie" style={{ width: "100%", height: "100%", objectFit: "cover", position: "relative", zIndex: 2 }} />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", zIndex: 2 }}>
              <div style={{ position: "absolute", width: 200, height: 240, border: `1px dashed ${c.purple}`, pointerEvents: "none" }} />
              <Camera size={56} strokeWidth={1.2} style={{ color: c.inkMute, position: "relative", zIndex: 3 }} />
              <div style={{ position: "absolute", bottom: 20, left: 0, right: 0, textAlign: "center", fontFamily: "var(--font-mono), monospace", fontSize: 10, color: c.cyan, letterSpacing: "0.15em", zIndex: 3 }}>
                FACE DETECTION READY
              </div>
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />

        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          <button onClick={() => fileRef.current?.click()} style={ctaSecondaryStyle(c)} className="ff-cta-sec">
            <Upload size={14} strokeWidth={2.5} />
            <span>{t.upload_selfie}</span>
          </button>
          <button onClick={() => fileRef.current?.click()} style={ctaSecondaryStyle(c)} className="ff-cta-sec">
            <Camera size={14} strokeWidth={2.5} />
            <span>{t.take_selfie}</span>
          </button>
        </div>

        <div style={{ background: c.bgPaper, border: `2px solid ${c.border}`, marginBottom: 16 }}>
          <div style={{ padding: "10px 14px", borderBottom: `2px solid ${c.border}`, background: c.bgAlt, display: "flex", alignItems: "center", gap: 8 }}>
            <Eye size={14} strokeWidth={2.5} style={{ color: c.cyan }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: c.cyan, letterSpacing: "0.18em" }}>{t.consent_title}</span>
          </div>
          <label style={{ display: "flex", gap: 12, padding: 14, cursor: "pointer" }}>
            <div onClick={() => setConsent(!consent)} style={{
              flexShrink: 0, width: 22, height: 22,
              border: `2px solid ${consent ? c.purple : c.border}`,
              background: consent ? c.purple : "transparent",
              display: "grid", placeItems: "center", cursor: "pointer", transition: "all 0.15s", marginTop: 2,
            }}>
              {consent && <Check size={12} strokeWidth={3} style={{ color: "#fff" }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: c.inkSoft, marginBottom: 8 }}>{t.consent_text}</div>
              <a href="#" style={{ fontSize: 11, color: c.purple, textDecoration: "underline", fontWeight: 600 }}>{t.privacy_link} →</a>
            </div>
          </label>
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", border: `2px solid ${c.cyan}`, color: c.cyan, fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 24, width: "fit-content" }}>
          <Zap size={11} strokeWidth={2.5} />
          <span>{t.secured_by}</span>
        </div>

        <button
          disabled={!selfie || !consent}
          onClick={onContinue}
          style={{ ...ctaPrimaryStyle(c), opacity: (!selfie || !consent) ? 0.4 : 1, cursor: (!selfie || !consent) ? "not-allowed" : "pointer", width: "100%", justifyContent: "center" }}
          className={selfie && consent ? "ff-cta-primary" : ""}
        >
          <span>{t.continue}</span>
          <ArrowRight size={16} strokeWidth={3} />
        </button>
      </div>
    </section>
  );
}

// ============================================================
// SCANNING
// ============================================================
function Scanning({ c, t, event, onDone }: { c: Theme; t: Copy; event: FsEvent; onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState(0);

  const totalPhotos = event.photoCount > 0 ? event.photoCount : 47283;

  // Fatia 1: cosmetic timer. Fatia 3 swaps this for POST /api/scan +
  // server-side Rekognition (or InsightFace at scale).
  useEffect(() => {
    const dur = 4500;
    const start = Date.now();
    const tick = setInterval(() => {
      const e = Date.now() - start;
      const p = Math.min(e / dur, 1);
      setProgress(p);
      setCount(Math.floor(totalPhotos * p));
      if (p < 0.4) setPhase(0);
      else if (p < 0.85) setPhase(1);
      else setPhase(2);
      if (p >= 1) {
        clearInterval(tick);
        // give the bar a beat to settle, then continue
        setTimeout(onDone, 500);
      }
    }, 30);
    return () => clearInterval(tick);
  }, [onDone, totalPhotos]);

  const phases = [t.scan_indexing, t.scan_matching, t.scan_finalizing];

  return (
    <section style={{ background: c.bg, borderBottom: `2px solid ${c.border}` }} className="ff-fade-in">
      <div style={{ position: "relative", maxWidth: 720, margin: "0 auto", padding: "clamp(40px, 6vw, 60px) clamp(20px, 3vw, 32px) 80px", textAlign: "center" }}>
        <div style={stepBadgeStyle(c.cyan)}>{t.step_label} 02 / 03</div>
        <h1 style={{ ...largeTitleStyle(c), marginBottom: 8 }}>{t.scan_title}</h1>

        <div style={{ position: "relative", width: "clamp(260px, 50vw, 360px)", height: "clamp(260px, 50vw, 360px)", margin: "32px auto", background: c.bgPaper, border: `3px solid ${c.border}`, overflow: "hidden" }}>
          <CornerBrackets color={c.cyan} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(to right, ${c.gridLineStrong} 1px, transparent 1px), linear-gradient(to bottom, ${c.gridLineStrong} 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />

          {[1, 2, 3].map((n) => (
            <div key={n} style={{
              position: "absolute", top: "50%", left: "50%",
              width: `${n * 35}%`, height: `${n * 35}%`,
              border: `1px solid ${c.cyan}`, borderRadius: "50%",
              transform: "translate(-50%, -50%)", opacity: 0.3 + 0.2 / n,
            }} />
          ))}

          <div style={{ position: "absolute", top: "50%", left: "50%", width: 64, height: 64, background: c.bg, border: `2px solid ${c.purple}`, transform: "translate(-50%, -50%)", display: "grid", placeItems: "center", zIndex: 3 }}>
            <Scan size={28} strokeWidth={2} style={{ color: c.purple }} />
          </div>

          <div style={{ position: "absolute", top: "50%", left: "50%", width: "50%", height: 2, background: `linear-gradient(to right, transparent, ${c.cyan})`, transformOrigin: "left", animation: "rotate-line 2s linear infinite", zIndex: 2 }} />

          <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", background: c.bg, padding: "6px 12px", border: `2px solid ${c.cyan}`, zIndex: 4 }}>
            <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: c.cyan, letterSpacing: "0.1em" }}>{phases[phase]}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 20 }}>
          <div style={{ background: c.bgPaper, border: `2px solid ${c.border}`, padding: 16 }}>
            <div style={{ fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4, color: c.cyan }}>{count.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: c.inkSoft, fontWeight: 700, letterSpacing: "0.15em" }}>{t.scan_photos}</div>
          </div>
          <div style={{ background: c.bgPaper, border: `2px solid ${c.border}`, padding: 16 }}>
            <div style={{ fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4, color: c.purple }}>{Math.round(progress * 100)}%</div>
            <div style={{ fontSize: 9, color: c.inkSoft, fontWeight: 700, letterSpacing: "0.15em" }}>PROGRESS</div>
          </div>
        </div>

        <div style={{ width: "100%", height: 6, background: c.bgPaper, border: `2px solid ${c.border}`, position: "relative", overflow: "hidden" }}>
          <div style={{ height: "100%", background: `linear-gradient(90deg, ${c.purple}, ${c.cyan})`, transition: "width 0.1s linear", boxShadow: `0 0 12px ${c.purple}`, width: `${progress * 100}%` }} />
        </div>
      </div>
    </section>
  );
}

// ============================================================
// GALLERY
// ============================================================
function Gallery({
  c, t, event, selected, setSelected, onPick, onBack,
}: {
  c: Theme; t: Copy; event: FsEvent;
  selected: Set<number>; setSelected: (s: Set<number>) => void;
  onPick: (p: Photo) => void; onBack: () => void;
}) {
  // Photos served from this event's folder (public/mock/events/<code>/),
  // falling back to MOCK_PHOTOS for events that have no dropped photos yet.
  const photos = getPhotosForEvent(event.code);

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <section style={{ background: c.bg, borderBottom: `2px solid ${c.border}` }} className="ff-fade-in">
      <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "clamp(40px, 5vw, 60px) clamp(20px, 3vw, 32px) 80px" }}>
        <button onClick={onBack} style={backBtnStyle(c)} className="ff-back-btn">
          <ChevronLeft size={14} strokeWidth={3} />
          <span>{t.back}</span>
        </button>

        <div style={kickerStyle(c)}>
          <span style={kickerDotStyle(c)} />
          <span style={{ color: c.cyan, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em" }}>{t.gallery_kicker}</span>
        </div>

        <h1 style={{ fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(40px, 8vw, 96px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 0.95, margin: "0 0 24px 0", textTransform: "uppercase", color: c.ink }}>
          {t.gallery_title}
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24, border: `2px solid ${c.border}` }}>
          <div style={{ padding: 16, borderRight: `2px solid ${c.border}`, background: c.bgPaper }}>
            <div style={{ fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4, color: c.purple }}>{photos.length}</div>
            <div style={{ fontSize: 9, color: c.inkSoft, fontWeight: 700, letterSpacing: "0.15em" }}>{t.gallery_photos}</div>
          </div>
          <div style={{ padding: 16, borderRight: `2px solid ${c.border}`, background: c.bgPaper }}>
            <div style={{ fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4, color: c.cyan }}>{event.code}</div>
            <div style={{ fontSize: 9, color: c.inkSoft, fontWeight: 700, letterSpacing: "0.15em" }}>EVENT</div>
          </div>
          <div style={{ padding: 16, background: c.bgPaper }}>
            <div style={{ fontFamily: "var(--font-grotesk), sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4, color: c.ink }}>{formatDate(event.date)}</div>
            <div style={{ fontSize: 9, color: c.inkSoft, fontWeight: 700, letterSpacing: "0.15em" }}>{event.city}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button onClick={() => setSelected(new Set(photos.map((p) => p.id)))} style={ctaSmallStyle(c)} className="ff-cta-sec">
              {t.gallery_select_all}
            </button>
            {selected.size > 0 && (
              <button onClick={() => setSelected(new Set())} style={ctaSmallStyle(c)} className="ff-cta-sec">
                {t.gallery_clear}
              </button>
            )}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", padding: "6px 12px", border: `2px solid ${c.purple}`, background: c.bgPaper }}>
            <span style={{ color: c.purple, fontFamily: "var(--font-grotesk), sans-serif", fontWeight: 700 }}>{selected.size}</span>
            <span style={{ color: c.inkSoft, fontSize: 10, letterSpacing: "0.1em", marginLeft: 6 }}>{t.gallery_selected}</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {photos.map((p, i) => {
            const isSelected = selected.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onPick(p)}
                style={{
                  position: "relative", aspectRatio: "4/5",
                  border: `2px solid ${isSelected ? c.purple : c.border}`,
                  cursor: "pointer", padding: 0, overflow: "hidden",
                  opacity: 0, animation: `fadeUp 0.4s ${i * 0.04}s forwards`,
                  transition: "all 0.2s",
                  boxShadow: isSelected ? `4px 4px 0 0 ${c.purple}` : "none",
                  transform: isSelected ? "translate(-2px, -2px)" : "none",
                  backgroundColor: p.color,
                  backgroundImage: `url(${p.image})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                }}
                className="ff-gallery-item"
              >
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <CornerBrackets color="rgba(255,255,255,0.7)" />

                <div style={{ position: "absolute", top: 8, left: 8, fontFamily: "var(--font-mono), monospace", fontSize: 9, color: "#fff", fontWeight: 700, letterSpacing: "0.05em", background: "rgba(0,0,0,0.5)", padding: "3px 6px", zIndex: 6 }}>
                  {p.timestamp}
                </div>

                <div
                  onClick={(e) => { e.stopPropagation(); toggle(p.id); }}
                  style={{
                    position: "absolute", top: 8, right: 8, width: 24, height: 24,
                    background: isSelected ? c.cyan : "rgba(255,255,255,0.85)",
                    border: `2px solid ${isSelected ? c.cyan : "#fff"}`,
                    display: "grid", placeItems: "center", cursor: "pointer", zIndex: 7, transition: "all 0.15s",
                  }}
                >
                  {isSelected && <Check size={14} strokeWidth={3} style={{ color: "#0A0A0F" }} />}
                </div>

                <div style={{ position: "absolute", bottom: 8, right: 8, fontFamily: "var(--font-mono), monospace", fontSize: 8, color: "rgba(255,255,255,0.85)", fontWeight: 600, letterSpacing: "0.08em", background: "rgba(0,0,0,0.4)", padding: "2px 5px", zIndex: 6 }}>
                  FANSNAP · {event.code}
                </div>

                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "grid", placeItems: "center", opacity: 0, transition: "opacity 0.2s", zIndex: 5 }} className="ff-photo-hover">
                  <ArrowRight size={20} strokeWidth={2.5} style={{ color: "#fff" }} />
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 12, fontSize: 11, color: c.inkMute, textAlign: "center", fontFamily: "var(--font-mono), monospace", letterSpacing: "0.05em" }}>
          {t.gallery_tap}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// PHOTO DETAIL
// ============================================================
function PhotoDetail({
  c, t, event, photo, onBack, onAdd,
}: { c: Theme; t: Copy; event: FsEvent; photo: Photo; onBack: () => void; onAdd: (item: CartItem) => void }) {
  const fmt = (usd: number) => `$${(usd * MXN_RATE).toLocaleString("es-MX", { maximumFractionDigits: 0 })} MXN`;

  return (
    <section style={{ background: c.bg, borderBottom: `2px solid ${c.border}` }} className="ff-fade-in">
      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "clamp(20px, 4vw, 40px) clamp(20px, 3vw, 32px) 80px" }}>
        <button onClick={onBack} style={backBtnStyle(c)} className="ff-back-btn">
          <ChevronLeft size={14} strokeWidth={3} />
          <span>{t.photo_back}</span>
        </button>

        <div style={{
          position: "relative", width: "100%", aspectRatio: "4/5", maxHeight: 540,
          backgroundColor: photo.color,
          backgroundImage: `url(${photo.image})`,
          backgroundSize: "cover", backgroundPosition: "center",
          border: `3px solid ${c.border}`, marginBottom: 12, overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <CornerBrackets color="rgba(255,255,255,0.85)" />

          <div style={{ position: "absolute", top: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between", zIndex: 6 }}>
            <div style={photoPillStyle()}>{photo.timestamp}</div>
            <div style={photoPillStyle()}>{event.code}</div>
          </div>

          <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between", zIndex: 6 }}>
            <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 9, color: "rgba(255,255,255,0.85)", letterSpacing: "0.1em" }}>{t.photo_quality}</div>
            <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 9, color: "rgba(255,255,255,0.85)", letterSpacing: "0.1em" }}>{t.photo_by} {photo.photographer}</div>
          </div>

          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(40px, 8vw, 88px)", color: "rgba(255,255,255,0.12)", fontWeight: 700, letterSpacing: "0.1em", zIndex: 4, pointerEvents: "none" }}>
            FANSNAP
          </div>
        </div>

        <div style={{ marginTop: 32 }}>
          <div style={kickerStyle(c)}>
            <span style={kickerDotStyle(c)} />
            <span style={{ color: c.purple, fontSize: 10, fontWeight: 700, letterSpacing: "0.18em" }}>{t.photo_choose_format}</span>
          </div>

          <h2 style={{ ...largeTitleStyle(c), marginBottom: 24 }}>{t.photo_choose_format}</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {Object.entries(PRODUCTS).map(([key, p]) => (
              <ProductCard key={key} c={c} t={t} productKey={key as keyof Copy} product={p} photo={photo} fmt={fmt} onAdd={onAdd} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  c, t, productKey, product, photo, fmt, onAdd,
}: {
  c: Theme; t: Copy; productKey: keyof Copy;
  product: (typeof PRODUCTS)[keyof typeof PRODUCTS];
  photo: Photo; fmt: (usd: number) => string;
  onAdd: (item: CartItem) => void;
}) {
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [qty, setQty] = useState(1);
  const Icon = productIcon[product.iconKey];

  const hasSize = !!product.sizes;
  const hasColor = !!product.colors;
  const currentPrice = product.sizePrices ? product.sizePrices[selectedSize] : product.priceUSD;
  const fulfillmentLabel = product.fulfillment === "instant" ? t.instant : `${t.ships_in} ${product.fulfillment} ${t.days}`;
  const badgeText = product.badge === "most_popular" ? t.most_popular : product.badge === "new_format" ? t.new_format : null;

  const descKey = `${String(productKey)}_d` as keyof Copy;

  return (
    <div style={{ background: c.bgPaper, border: `2px solid ${c.border}`, padding: 18, display: "flex", flexDirection: "column", gap: 10, transition: "all 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ width: 40, height: 40, border: `2px solid ${c.purple}`, display: "grid", placeItems: "center", color: c.purple }}>
          <Icon size={20} strokeWidth={2} />
        </div>
        {badgeText && (
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.15em",
            border: `2px solid ${product.badge === "most_popular" ? c.cyan : c.pink}`,
            color: product.badge === "most_popular" ? c.cyan : c.pink,
            padding: "3px 7px",
          }}>{badgeText}</div>
        )}
      </div>

      <div style={{ fontSize: 18, fontWeight: 700, color: c.ink, letterSpacing: "-0.01em", textTransform: "uppercase" }}>{t[productKey]}</div>
      <div style={{ fontSize: 12, color: c.inkSoft, lineHeight: 1.5, minHeight: 36 }}>{t[descKey]}</div>

      <div style={{ paddingBottom: 8, borderBottom: `2px solid ${c.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: c.inkSoft, letterSpacing: "0.08em" }}>
          {product.fulfillment === "instant" ? (
            <Zap size={12} strokeWidth={2.5} style={{ color: c.cyan }} />
          ) : (
            <Calendar size={12} strokeWidth={2.5} style={{ color: c.inkMute }} />
          )}
          <span>{fulfillmentLabel}</span>
        </div>
      </div>

      {hasSize && product.sizes && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 9, color: c.inkSoft, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 6 }}>{t.size}</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {product.sizes.map((s, i) => (
              <button key={i} onClick={() => setSelectedSize(i)} style={{
                padding: "6px 10px",
                background: selectedSize === i ? c.ink : "transparent",
                color: selectedSize === i ? c.bg : c.ink,
                border: `2px solid ${c.border}`,
                fontFamily: "var(--font-grotesk), sans-serif",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer",
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {hasColor && product.colors && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 9, color: c.inkSoft, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 6 }}>{t.color}</div>
          <div style={{ display: "flex", gap: 6 }}>
            {product.colors.map((col, i) => (
              <button
                key={i} onClick={() => setSelectedColor(i)}
                style={{
                  width: 28, height: 28, background: col.hex,
                  border: selectedColor === i ? `3px solid ${c.cyan}` : `2px solid ${c.border}`,
                  cursor: "pointer", transition: "all 0.15s",
                }}
                aria-label={col.name}
              />
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", border: `2px solid ${c.border}` }}>
          <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 28, height: 28, background: c.bgPaper, color: c.ink, border: "none", cursor: "pointer", display: "grid", placeItems: "center" }}>
            <Minus size={12} strokeWidth={3} />
          </button>
          <div style={{ width: 32, textAlign: "center", fontSize: 13, fontWeight: 700, borderLeft: `2px solid ${c.border}`, borderRight: `2px solid ${c.border}`, padding: "4px 0" }}>{qty}</div>
          <button onClick={() => setQty(qty + 1)} style={{ width: 28, height: 28, background: c.bgPaper, color: c.ink, border: "none", cursor: "pointer", display: "grid", placeItems: "center" }}>
            <Plus size={12} strokeWidth={3} />
          </button>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 8, color: c.inkSoft, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 2 }}>{t.starting_at}</div>
          <div style={{ fontFamily: "var(--font-grotesk), sans-serif", fontSize: 16, fontWeight: 700, color: c.cyan, letterSpacing: "-0.01em" }}>{fmt(currentPrice * qty)}</div>
        </div>
      </div>

      <button
        onClick={() => onAdd({
          photoId: photo.id,
          format: String(productKey),
          size: hasSize && product.sizes ? product.sizes[selectedSize] : null,
          color: hasColor && product.colors ? product.colors[selectedColor].name : null,
          qty,
          priceUSD: currentPrice * qty,
          tile: photo.color,
        })}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
          width: "100%", padding: 12, background: c.ink, color: c.bg, border: `2px solid ${c.ink}`,
          fontFamily: "var(--font-grotesk), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          cursor: "pointer", textTransform: "uppercase", transition: "all 0.15s",
        }}
        className="ff-cta-add"
      >
        <ShoppingBag size={14} strokeWidth={2.5} />
        <span>{t.add_to_cart}</span>
      </button>
    </div>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer({ c }: { c: Theme }) {
  return (
    <footer style={{ background: c.bgAlt, borderTop: `2px solid ${c.border}` }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(40px, 5vw, 60px) clamp(20px, 3vw, 32px) 40px", display: "grid", gridTemplateColumns: "1.4fr 2fr", gap: "clamp(32px, 4vw, 60px)" }} className="ff-footer-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <FanSnapLogo size="lg" theme={c.bg === "#0A0A0F" ? "dark" : "light"} />
          <p style={{ fontSize: 14, color: c.inkSoft, margin: 0, maxWidth: 280, lineHeight: 1.5 }}>The memory layer of live entertainment</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", background: c.bgPaper, border: `2px solid ${c.border}`, fontSize: 10, fontWeight: 700, color: c.purple, letterSpacing: "0.1em", width: "fit-content" }}>
            <span style={{ width: 6, height: 6, background: c.cyan, boxShadow: `0 0 8px ${c.cyan}`, animation: "pulse 2s infinite" }} />
            <span>OPERATIONAL · CDMX · LATAM</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(20px, 3vw, 32px)" }}>
          {[
            { title: "PRODUCT", items: ["For fans", "For photographers", "For business", "Developers / SDK"] },
            { title: "COMPANY", items: ["About", "Press", "Contact"] },
            { title: "LEGAL", items: ["Privacy", "Terms", "Biometric data"] },
          ].map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 10, fontWeight: 700, color: c.purple, letterSpacing: "0.18em", marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${c.border}` }}>{col.title}</div>
              {col.items.map((item) => (
                <a key={item} href="#" style={{ display: "block", fontSize: 13, color: c.inkSoft, textDecoration: "none", padding: "5px 0", fontWeight: 500 }}>{item}</a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `2px solid ${c.border}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "16px clamp(20px, 3vw, 32px)", fontFamily: "var(--font-mono), monospace", fontSize: 10, color: c.inkSoft, display: "flex", gap: 16, alignItems: "center", letterSpacing: "0.05em", flexWrap: "wrap" }}>
          <span>© 2026 FANSNAP INC.</span>
          <span>SYS:0237</span>
          <span>v0.4.0-beta</span>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// ThemeStyles — emits the theme-dependent CSS (hover, responsive rules)
// ============================================================
function ThemeStyles({ c }: { c: Theme }) {
  return (
    <style>{`
      body { background: ${c.bg}; }

      .ff-cta-primary:hover {
        background: ${c.cyan} !important;
        border-color: ${c.cyan} !important;
        color: ${c.ink} !important;
      }
      .ff-cta-sec:hover {
        border-color: ${c.purple} !important;
        color: ${c.purple} !important;
      }
      .ff-cta-add:hover {
        background: ${c.purple} !important;
        border-color: ${c.purple} !important;
        color: #fff !important;
      }
      .ff-cta-cart:hover {
        background: ${c.cyan} !important;
        border-color: ${c.cyan} !important;
        color: ${c.ink} !important;
      }
      .ff-cat-btn:hover { border-color: ${c.purple} !important; }
      .ff-back-btn:hover {
        border-color: ${c.purple} !important;
        color: ${c.purple} !important;
      }
      .ff-event-card:hover {
        border-color: ${c.purple} !important;
        transform: translateY(-3px);
      }
      .ff-event-card:hover .ff-card-cta {
        background: ${c.purple} !important;
        border-color: ${c.purple} !important;
        color: #fff !important;
      }
      .ff-pass-card:hover { transform: rotate(0deg) translateY(-4px) !important; }
      .ff-gallery-item:hover .ff-photo-hover { opacity: 1; }
      .ff-gallery-item:hover { border-color: ${c.cyan} !important; }
      .ff-highlight:hover {
        border-color: ${c.cyan} !important;
        transform: scale(1.01);
      }

      a:hover { color: ${c.ink} !important; }

      .ff-mobile-only { display: none; }
      .ff-nav-link:hover { color: ${c.ink} !important; }
      .ff-section-cta:hover {
        background: ${c.purple} !important;
        border-color: ${c.purple} !important;
        color: #fff !important;
      }
      @media (max-width: 900px) {
        .ff-desktop-nav { display: none; }
        .ff-desktop-only { display: none !important; }
        .ff-mobile-only { display: grid !important; place-items: center; }
        .ff-hero-grid { grid-template-columns: 1fr !important; }
        .ff-footer-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 640px) {
        .ff-pass-card {
          transform: rotate(0deg) !important;
          max-width: 100% !important;
        }
      }
    `}</style>
  );
}

// ============================================================
// SHARED STYLES
// ============================================================
const appStyle = (c: Theme): React.CSSProperties => ({
  minHeight: "100vh", background: c.bg, color: c.ink,
  fontFamily: "var(--font-grotesk), sans-serif", position: "relative",
});

const headerStyle = (c: Theme): React.CSSProperties => ({
  position: "sticky", top: 0, zIndex: 100,
  background: c.bg, borderBottom: `2px solid ${c.border}`,
});

const headerInnerStyle = (): React.CSSProperties => ({
  maxWidth: 1280, margin: "0 auto", padding: "0 20px", height: 76,
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
});

const navLinkStyle = (c: Theme): React.CSSProperties => ({
  fontSize: 12, fontWeight: 600, color: c.inkSoft, textDecoration: "none",
  letterSpacing: "0.05em", textTransform: "uppercase", padding: "8px 12px", transition: "color 0.15s",
  // for <button> reset
  background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit",
});

const poweredByStyle = (c: Theme): React.CSSProperties => ({
  fontFamily: "var(--font-mono), monospace", fontSize: 10, color: c.inkSoft,
  letterSpacing: "0.05em", whiteSpace: "nowrap",
});

const themeToggleStyle = (c: Theme): React.CSSProperties => ({
  width: 36, height: 36, background: c.bgPaper, border: `2px solid ${c.border}`,
  color: c.ink, cursor: "pointer", display: "grid", placeItems: "center", transition: "all 0.15s",
});

const langToggleStyle = (c: Theme): React.CSSProperties => ({
  display: "flex", alignItems: "center", border: `2px solid ${c.border}`, background: c.bgPaper,
});

const langBtnStyle = (c: Theme, active: boolean): React.CSSProperties => ({
  padding: "6px 10px", fontSize: 10, fontFamily: "var(--font-grotesk), sans-serif",
  fontWeight: 700, background: active ? c.purple : "transparent",
  color: active ? "#fff" : c.inkSoft, border: "none", cursor: "pointer", letterSpacing: "0.08em",
});

const signinBtnStyle = (c: Theme): React.CSSProperties => ({
  padding: "8px 14px", fontSize: 11, fontWeight: 700,
  background: c.ink, color: c.bg, border: `2px solid ${c.ink}`,
  cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase",
});

const cartBtnStyle = (c: Theme): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", padding: "8px 14px",
  background: c.purple, color: "#fff", border: `2px solid ${c.purple}`,
  fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em",
});

// NB: NO `display` here — the `.ff-mobile-only` CSS class controls it.
// Inline `display: grid` would beat the class and leak the button onto desktop
// (the symptom that originally looked like "broken hamburger on desktop").
const menuBtnStyle = (c: Theme): React.CSSProperties => ({
  width: 36, height: 36, background: c.bgPaper, border: `2px solid ${c.border}`,
  color: c.ink, cursor: "pointer", placeItems: "center",
});

const mobileMenuStyle = (c: Theme): React.CSSProperties => ({
  background: c.bgPaper, borderTop: `2px solid ${c.border}`, padding: "16px 20px",
  display: "flex", flexDirection: "column", gap: 4,
});

const mobileNavLinkStyle = (c: Theme): React.CSSProperties => ({
  fontSize: 14, fontWeight: 600, color: c.ink, textDecoration: "none",
  letterSpacing: "0.05em", textTransform: "uppercase", padding: "14px 12px",
  border: `2px solid ${c.border}`, background: c.bg,
  cursor: "pointer", fontFamily: "inherit", textAlign: "left",
});

const heroStyle = (c: Theme): React.CSSProperties => ({
  position: "relative", background: c.bg, borderBottom: `2px solid ${c.border}`, overflow: "hidden",
});

const heroGridLinesStyle = (c: Theme): React.CSSProperties => ({
  position: "absolute", inset: 0,
  backgroundImage: `linear-gradient(to right, ${c.gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${c.gridLine} 1px, transparent 1px)`,
  backgroundSize: "60px 60px", pointerEvents: "none",
});

const heroInnerStyle = (): React.CSSProperties => ({
  position: "relative", maxWidth: 1280, margin: "0 auto",
  padding: "clamp(40px, 6vw, 80px) clamp(20px, 3vw, 32px)",
  display: "grid", gridTemplateColumns: "1.4fr 1fr",
  gap: "clamp(32px, 5vw, 60px)", alignItems: "center",
});

const heroTitleStyle = (c: Theme): React.CSSProperties => ({
  fontFamily: "var(--font-grotesk), sans-serif",
  fontSize: "clamp(44px, 8vw, 116px)", fontWeight: 700,
  lineHeight: 0.95, letterSpacing: "-0.04em",
  margin: "0 0 clamp(20px, 3vw, 32px) 0", textTransform: "uppercase", color: c.ink,
  textWrap: "balance",
});

const heroLineStyle = (): React.CSSProperties => ({
  display: "block", opacity: 0, animation: "fadeUp 0.7s forwards",
  textWrap: "balance",
});

// T3 is the "we have the proof" follow-up after the big T1+T2 punch.
// Across languages it varies from 16 chars (EN "WE HAVE THE PROOF.") to 20
// chars (PT "A GENTE TEM A PROVA."). At full hero size it kept overflowing
// and wrapping ugly. Re-styled as a smaller subhead — ~35% of T1/T2 size +
// regular-weight + letter-spacing — so it always fits on one line and reads
// as a tagline instead of competing with the headline.
const heroLineT3Style = (c: Theme): React.CSSProperties => ({
  display: "block", opacity: 0, animation: "fadeUp 0.7s forwards",
  fontSize: "clamp(15px, 2.4vw, 32px)",
  lineHeight: 1.2,
  fontWeight: 500,
  letterSpacing: "0.04em",
  color: c.inkSoft,
  marginTop: "clamp(10px, 1.5vw, 20px)",
  whiteSpace: "nowrap",
});

const heroSubStyle = (c: Theme): React.CSSProperties => ({
  fontSize: "clamp(14px, 1.6vw, 17px)", lineHeight: 1.5, color: c.inkSoft,
  maxWidth: 480, marginBottom: "clamp(24px, 3vw, 36px)",
  fontWeight: 400, opacity: 0, animation: "fadeUp 0.7s 0.4s forwards",
});

const kickerStyle = (c: Theme): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 12px",
  background: c.bgPaper, border: `2px solid ${c.border}`, marginBottom: 20,
});

const kickerDotStyle = (c: Theme): React.CSSProperties => ({
  width: 6, height: 6, background: c.cyan, boxShadow: `0 0 8px ${c.cyan}`, animation: "pulse 2s infinite",
});

const gradTextStyle = (c: Theme): React.CSSProperties => ({
  background: `linear-gradient(90deg, ${c.purple} 0%, ${c.cyan} 100%)`,
  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
});

const ctaPrimaryStyle = (c: Theme): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 22px",
  background: c.purple, color: "#fff", border: `2px solid ${c.purple}`,
  fontFamily: "var(--font-grotesk), sans-serif", fontSize: "clamp(11px, 1.2vw, 13px)",
  fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer",
  textTransform: "uppercase", transition: "all 0.15s", flexShrink: 0,
});

const ctaSecondaryStyle = (c: Theme): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 18px",
  background: c.bgPaper, color: c.ink, border: `2px solid ${c.border}`,
  fontFamily: "var(--font-grotesk), sans-serif", fontSize: 12, fontWeight: 700,
  letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase",
  transition: "all 0.15s", flex: 1, justifyContent: "center", minWidth: 120,
});

const ctaSmallStyle = (c: Theme): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
  background: c.bgPaper, color: c.ink, border: `2px solid ${c.border}`,
  fontFamily: "var(--font-grotesk), sans-serif", fontSize: 10, fontWeight: 700,
  letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase", transition: "all 0.15s",
});

const passCardStyle = (c: Theme): React.CSSProperties => ({
  position: "relative", width: "100%", maxWidth: 380,
  background: c.bgPaper, border: `3px solid ${c.border}`,
  overflow: "hidden", transform: "rotate(-1deg)", transition: "transform 0.3s",
});

const passHeaderStyle = (c: Theme): React.CSSProperties => ({
  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
  padding: "12px 14px", background: c.ink, color: c.bg,
  borderBottom: `3px solid ${c.border}`,
});

const searchBoxStyle = (c: Theme): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
  background: c.bgPaper, border: `2px solid ${c.border}`, marginBottom: 14,
});

const searchInputStyle = (c: Theme): React.CSSProperties => ({
  flex: 1, background: "transparent", border: "none", outline: "none",
  color: c.ink, fontSize: 14, fontFamily: "var(--font-grotesk), sans-serif",
  fontWeight: 500, minWidth: 0,
});

const searchHotkeyStyle = (c: Theme): React.CSSProperties => ({
  padding: "4px 7px", background: c.bgAlt, border: `2px solid ${c.border}`,
  fontSize: 10, color: c.inkSoft, fontWeight: 600,
  fontFamily: "var(--font-mono), monospace", flexShrink: 0,
});

const catBtnStyle = (c: Theme, active: boolean): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px",
  background: active ? c.ink : c.bgPaper,
  border: `2px solid ${c.border}`,
  color: active ? c.bg : c.ink,
  fontSize: 11, fontWeight: 700, cursor: "pointer",
  whiteSpace: "nowrap", transition: "all 0.15s",
  letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0,
});

const sectionHeaderStyle = (c: Theme): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: "clamp(12px, 2vw, 20px)",
  marginBottom: "clamp(28px, 4vw, 40px)",
  paddingBottom: 20, borderBottom: `2px solid ${c.border}`, flexWrap: "wrap",
});

const sectionMarkerStyle = (c: Theme): React.CSSProperties => ({
  fontFamily: "var(--font-mono), monospace", fontSize: 13, color: c.purple,
  fontWeight: 700, border: `2px solid ${c.purple}`, padding: "5px 9px",
  letterSpacing: "0.05em", flexShrink: 0, background: c.bgPaper,
});

const sectionTitleStyle = (c: Theme): React.CSSProperties => ({
  fontFamily: "var(--font-grotesk), sans-serif",
  fontSize: "clamp(24px, 4vw, 48px)", fontWeight: 700,
  letterSpacing: "-0.03em", margin: "0 0 4px 0",
  lineHeight: 1.0, textTransform: "uppercase", color: c.ink,
});

const sectionCountStyle = (c: Theme): React.CSSProperties => ({
  display: "flex", alignItems: "baseline", gap: 8,
  border: `2px solid ${c.border}`, padding: "6px 12px",
  background: c.bgPaper, flexShrink: 0,
});

const eventCardStyle = (c: Theme): React.CSSProperties => ({
  background: c.bgPaper, border: `2px solid ${c.border}`,
  cursor: "pointer", padding: 0, color: c.ink, textAlign: "left",
  display: "flex", flexDirection: "column",
  opacity: 0, animation: "fadeUp 0.5s forwards", transition: "all 0.2s",
});

const backBtnStyle = (c: Theme): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "8px 14px", background: c.bgPaper, border: `2px solid ${c.border}`,
  color: c.ink, fontSize: 11, fontWeight: 700, cursor: "pointer",
  letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24, transition: "all 0.15s",
});

const stepBadgeStyle = (color: string): React.CSSProperties => ({
  fontFamily: "var(--font-mono), monospace", fontSize: 11, fontWeight: 600,
  letterSpacing: "0.15em", marginBottom: 16, display: "inline-block",
  padding: "4px 10px", border: `2px solid ${color}`, color,
});

const largeTitleStyle = (c: Theme): React.CSSProperties => ({
  fontFamily: "var(--font-grotesk), sans-serif",
  fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 700,
  letterSpacing: "-0.04em", lineHeight: 0.95,
  margin: "0 0 12px 0", textTransform: "uppercase", color: c.ink,
});

const largeSubStyle = (c: Theme): React.CSSProperties => ({
  fontSize: "clamp(14px, 1.6vw, 16px)", color: c.inkSoft, marginBottom: 32, lineHeight: 1.5,
});

const photoPillStyle = (): React.CSSProperties => ({
  fontFamily: "var(--font-mono), monospace", fontSize: 10, color: "#fff",
  fontWeight: 700, letterSpacing: "0.1em", background: "rgba(0,0,0,0.5)",
  padding: "4px 8px", border: "2px solid rgba(255,255,255,0.2)",
});
