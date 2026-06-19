"use client";

// SiteHeader — the single top-of-page chrome for the whole product.
// Used by the landings (/fotografos, /marcas, /aplica, /eventos, /pedidos,
// dashboard) AND by the main SPA (/fansnap). One component = no drift, no seam.
//
// It's theme-aware (the SPA passes its light/dark Theme; landings default to
// dark) and slotted: the SPA injects its theme/lang/cart controls via
// `rightSlot` (desktop) + `mobileSlot` (mobile menu), and intercepts nav
// clicks via `onNavClick` (to smooth-scroll home sections instead of a hard
// hash navigation). Landings pass none of these and behave as before.

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BUILD_SHA, BUILD_TIME } from "@/lib/build-info";
import { THEMES, type Theme } from "@/lib/theme";
import FanSnapLogo from "@/components/FanSnapLogo";

// Shared nav — same items + labels everywhere. `href` is a real destination;
// the SPA may intercept the home-anchor ones via onNavClick.
const NAV_ITEMS: ReadonlyArray<{
  key: string;
  labels: { es: string; pt: string; en: string };
  href: string;
}> = [
  { key: "how",   labels: { es: "Cómo funciona",   pt: "Como funciona",   en: "How it works"      }, href: "/fansnap#how" },
  { key: "evt",   labels: { es: "Eventos",          pt: "Eventos",          en: "Events"            }, href: "/fansnap#events" },
  { key: "foto",  labels: { es: "Para fotógrafos",  pt: "Para fotógrafos",  en: "For photographers" }, href: "/fansnap/fotografos" },
  { key: "brand", labels: { es: "Para marcas",      pt: "Para marcas",      en: "For brands"        }, href: "/fansnap/marcas" },
];

export default function SiteHeader({
  lang = "es",
  theme = THEMES.dark,
  ctaLabel,
  ctaHref,
  minimal = false,
  onNavClick,
  rightSlot,
  mobileSlot,
}: {
  lang?: "es" | "pt" | "en";
  theme?: Theme;
  ctaLabel?: string;
  ctaHref?: string;
  /** When true, only brand chrome (logo, build pill, powered-by) — no nav/CTA/
   *  hamburger, logo non-clickable. For pages that ship before the rest. */
  minimal?: boolean;
  /** Intercept a nav click. Return true if handled (we then preventDefault).
   *  The SPA uses this to smooth-scroll to home sections. */
  onNavClick?: (href: string) => boolean;
  /** Desktop right-side controls (SPA: theme/lang/cart). */
  rightSlot?: React.ReactNode;
  /** Extra controls inside the mobile menu (SPA: lang toggle). */
  mobileSlot?: React.ReactNode;
}) {
  const [mobileNav, setMobileNav] = useState(false);
  const s = styles(theme);

  const handleNav = (href: string) => (e: React.MouseEvent) => {
    if (onNavClick && onNavClick(href)) e.preventDefault();
    setMobileNav(false);
  };

  return (
    <header style={s.header}>
      <style>{globalCSS(theme)}</style>
      <div style={s.inner}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          {minimal ? (
            <span style={{ display: "inline-flex", lineHeight: 0 }} aria-label="FanSnap">
              <FanSnapLogo size="md" />
            </span>
          ) : (
            <a href="/fansnap" onClick={handleNav("/fansnap")} style={{ display: "inline-flex", lineHeight: 0 }} aria-label="FanSnap home">
              <FanSnapLogo size="md" />
            </a>
          )}
          <div style={s.pill} title={`Build ${BUILD_SHA} — ${BUILD_TIME}`} aria-label={`Built ${BUILD_TIME}`}>
            <span style={{ color: theme.cyan, opacity: 0.7 }}>·</span>
            <span>{BUILD_TIME}</span>
          </div>
          <div className="sh-desktop-only" style={s.powered}>
            <span style={{ opacity: 0.65 }}>Powered by</span>{" "}
            <span style={{ color: theme.purple, fontWeight: 700 }}>O&amp;CO</span>
          </div>
        </div>

        {!minimal && (
          <nav style={{ display: "flex", gap: 2 }} className="sh-desktop-nav">
            {NAV_ITEMS.map((it) => (
              <a key={it.key} href={it.href} onClick={handleNav(it.href)} style={s.navLink} className="sh-nav-link">
                {it.labels[lang]}
              </a>
            ))}
          </nav>
        )}

        {!minimal && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {rightSlot}
            {ctaLabel && ctaHref && (
              <a href={ctaHref} style={s.cta} className="sh-cta sh-desktop-only">{ctaLabel}</a>
            )}
            <button onClick={() => setMobileNav(!mobileNav)} style={s.menuBtn} className="sh-mobile-only" aria-label="Menu">
              {mobileNav ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={2.5} />}
            </button>
          </div>
        )}
      </div>

      {!minimal && mobileNav && (
        <div style={s.mobileMenu}>
          {NAV_ITEMS.map((it) => (
            <a key={it.key} href={it.href} onClick={handleNav(it.href)} style={s.mobileLink}>
              {it.labels[lang]}
            </a>
          ))}
          {ctaLabel && ctaHref && (
            <a href={ctaHref} onClick={() => setMobileNav(false)}
              style={{ ...s.mobileLink, background: theme.ink, color: theme.bg, borderColor: theme.ink, textAlign: "center" }}>
              {ctaLabel}
            </a>
          )}
          {mobileSlot && (
            <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>{mobileSlot}</div>
          )}
        </div>
      )}
    </header>
  );
}

// ─── Theme-aware styles ──────────────────────────────────────────────────────

function styles(t: Theme) {
  return {
    header: { position: "sticky", top: 0, zIndex: 100, background: t.bg, borderBottom: `2px solid ${t.border}` } as React.CSSProperties,
    inner: { maxWidth: 1280, margin: "0 auto", padding: "0 20px", height: 76, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 } as React.CSSProperties,
    navLink: { fontSize: 12, fontWeight: 600, color: t.inkSoft, textDecoration: "none", letterSpacing: "0.05em", textTransform: "uppercase", padding: "8px 12px", transition: "color 0.15s", fontFamily: "var(--font-grotesk), sans-serif" } as React.CSSProperties,
    powered: { fontFamily: "var(--font-mono), monospace", fontSize: 10, color: t.inkSoft, letterSpacing: "0.05em", whiteSpace: "nowrap" } as React.CSSProperties,
    pill: { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", background: t.bgPaper, border: `1.5px solid ${t.border}`, fontFamily: "var(--font-mono), monospace", fontSize: 9, color: t.inkSoft, letterSpacing: "0.05em", whiteSpace: "nowrap", flexShrink: 0 } as React.CSSProperties,
    cta: { padding: "8px 14px", fontSize: 11, fontWeight: 700, background: t.purple, color: "#fff", border: `2px solid ${t.purple}`, textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-grotesk), sans-serif", display: "inline-flex", alignItems: "center", gap: 6 } as React.CSSProperties,
    menuBtn: { width: 36, height: 36, background: t.bgPaper, border: `2px solid ${t.border}`, color: t.ink, cursor: "pointer", placeItems: "center" } as React.CSSProperties,
    mobileMenu: { background: t.bgPaper, borderTop: `2px solid ${t.border}`, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 4 } as React.CSSProperties,
    mobileLink: { fontSize: 14, fontWeight: 600, color: t.ink, textDecoration: "none", letterSpacing: "0.05em", textTransform: "uppercase", padding: "14px 12px", border: `2px solid ${t.border}`, background: t.bg, cursor: "pointer", fontFamily: "var(--font-grotesk), sans-serif", display: "block" } as React.CSSProperties,
  };
}

function globalCSS(t: Theme) {
  return `
  .sh-nav-link:hover { color: ${t.ink}; }
  .sh-cta:hover { background: ${t.ink}; color: ${t.bg}; border-color: ${t.ink}; }
  .sh-desktop-only { display: inline-block; }
  .sh-desktop-nav { display: flex; }
  .sh-mobile-only { display: none; }
  @media (max-width: 1100px) {
    .sh-desktop-only { display: none !important; }
    .sh-desktop-nav { display: none !important; }
    .sh-mobile-only { display: grid !important; }
  }`;
}
