// FanSnap · Internal dev map — /fansnap/mapa
//
// A quick navigation hub listing every page we've built (public, photographer,
// admin) so it's easy to jump around while building. Deliberately gated behind
// the PREVIEW cookie specifically (not siteVisible) — it links to admin/PII, so
// it must stay internal even after the public site goes live. noindex.

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { EVENTS } from "@/lib/mock";
import { PREVIEW_KEY, PREVIEW_COOKIE } from "@/lib/launch";
import FanSnapLogo from "@/components/FanSnapLogo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Mapa del sitio · FanSnap (interno)",
  robots: { index: false, follow: false },
};

const FONT_GROTESK = `"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
const FONT_MONO = `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace`;

const c = {
  bg: "#000000", surface: "#0A0A0A", surfaceHi: "#121212",
  ink: "#F4F4F2", inkSoft: "#A8A8A4", inkMute: "#5C5C58",
  border: "rgba(244,244,242,0.10)", borderStrong: "rgba(244,244,242,0.25)",
  accent: "#00E5FF", magenta: "#FF2D87", premium: "#9D4EFF", warn: "#FFD166", ok: "#4ADE80",
};

type Link = { path: string; label: string; desc: string; tag?: { text: string; color: string } };
type Group = { title: string; accent: string; note?: string; items: Link[] };

const DYN = { text: "dinâmico", color: "#FFD166" };
const INT = { text: "interno · PII", color: "#FF2D87" };

const GROUPS: Group[] = [
  {
    title: "Site público",
    accent: "#00E5FF",
    items: [
      { path: "/fansnap", label: "Home · busca facial", desc: "SPA: scan, galeria, carrinho, checkout" },
      { path: "/fansnap/aplica", label: "Aplica al roster", desc: "Pré-cadastro de fotógrafo + indicação" },
      { path: "/fansnap/fotografos", label: "Para fotógrafos", desc: "Landing pública · tiers · roster" },
      { path: "/fansnap/marcas", label: "Para marcas", desc: "Landing sponsors / patrocínio" },
      { path: "/fansnap/pedidos", label: "Mis pedidos", desc: "Recuperar pedido por nº + email" },
    ],
  },
  {
    title: "Fluxo do fotógrafo",
    accent: "#9D4EFF",
    items: [
      { path: "/fansnap/fotografos/dashboard", label: "Dashboard", desc: "Eventos, upload (sim), vendas, pagos" },
      { path: "/fansnap/admin/photographers", label: "Alta por link", desc: "/onboarding/[token] — copie o link na ficha do fotógrafo", tag: DYN },
    ],
  },
  {
    title: "Admin",
    accent: "#FF2D87",
    note: "Área interna — expõe PII. Travar com Cloudflare Access antes do lançamento.",
    items: [
      { path: "/fansnap/admin", label: "Painel", desc: "Visão geral", tag: INT },
      { path: "/fansnap/admin/photographers", label: "Fotógrafos · Roster", desc: "Ficha completa + onboarding", tag: INT },
      { path: "/fansnap/admin/applications", label: "Solicitudes", desc: "Candidaturas · indicações · marcas", tag: INT },
      { path: "/fansnap/admin/events", label: "Eventos", desc: "CRUD · lixeira · atribuir fotógrafos", tag: INT },
      { path: "/fansnap/admin/fans", label: "Fans", desc: "Cadastros · consentimento · compras", tag: INT },
    ],
  },
];

// GET endpoints that return JSON — handy to poke at during dev.
const APIS: Link[] = [
  { path: "/fansnap/api/admin/photographers", label: "GET photographers", desc: "Roster (JSON)" },
  { path: "/fansnap/api/admin/fans", label: "GET fans", desc: "Fans (JSON)" },
  { path: "/fansnap/api/admin/events", label: "GET events", desc: "Eventos (JSON)" },
  { path: "/fansnap/api/admin/applications", label: "GET applications", desc: "Intake: apps/refs/leads (JSON)" },
  { path: "/fansnap/sitemap.xml", label: "GET sitemap.xml", desc: "Sitemap SEO público" },
];

export default async function MapaPage() {
  const jar = await cookies();
  if (jar.get(PREVIEW_COOKIE)?.value !== PREVIEW_KEY) notFound();

  const eventItems: Link[] = EVENTS.map((e) => ({
    path: `/fansnap/eventos/${e.code.toLowerCase()}`,
    label: e.name,
    desc: `${e.code} · ${e.venue}, ${e.city}`,
  }));

  return (
    <div style={{ background: c.bg, color: c.ink, minHeight: "100vh", fontFamily: FONT_GROTESK }}>
      <style>{css}</style>

      {/* header */}
      <header style={{ borderBottom: `1px solid ${c.border}`, background: c.surface }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "22px clamp(20px,4vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <FanSnapLogo size="sm" />
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Mapa del sitio · interno
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "clamp(32px,5vw,56px) clamp(20px,4vw,40px) 100px" }}>
        <div style={{ marginBottom: 44 }}>
          <h1 style={{ fontFamily: FONT_GROTESK, fontSize: "clamp(32px,5vw,48px)", fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>
            Todas las <span style={{ color: c.magenta }}>páginas.</span>
          </h1>
          <p style={{ color: c.inkSoft, fontSize: 15, lineHeight: 1.6, margin: "12px 0 0", maxWidth: 560 }}>
            Atalho de navegação durante o desenvolvimento. Esta página é interna
            (protegida pelo cookie de preview) e não é indexada.
          </p>
        </div>

        {GROUPS.map((g) => (
          <Section key={g.title} title={g.title} accent={g.accent} note={g.note}
            items={g.title === "Site público" ? [...g.items, ...eventItems] : g.items} />
        ))}

        <Section title="APIs (GET · JSON)" accent={c.ok} items={APIS} muted />
      </main>
    </div>
  );
}

function Section({ title, accent, note, items, muted }: {
  title: string; accent: string; note?: string; items: Link[]; muted?: boolean;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ width: 8, height: 8, background: accent }} />
        <h2 style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: c.ink, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>{title}</h2>
        <span style={{ flex: 1, height: 1, background: c.border }} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute }}>{items.length}</span>
      </div>
      {note && (
        <p style={{ fontFamily: FONT_MONO, fontSize: 11.5, color: c.magenta, margin: "0 0 14px", lineHeight: 1.6 }}>⚠ {note}</p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: c.border, border: `1px solid ${c.border}` }}>
        {items.map((it) => (
          <a key={it.path} href={it.path} className="mapa-card" style={{
            background: c.surface, padding: "16px 18px", textDecoration: "none", color: c.ink,
            display: "flex", flexDirection: "column", gap: 5, transition: "background .15s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: FONT_GROTESK, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: muted ? c.inkSoft : c.ink }}>{it.label}</span>
              {it.tag && (
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: it.tag.color, border: `1px solid ${it.tag.color}`, padding: "2px 6px" }}>{it.tag.text}</span>
              )}
            </div>
            <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.accent, wordBreak: "break-all" }}>{it.path}</span>
            <span style={{ fontFamily: FONT_GROTESK, fontSize: 12.5, color: c.inkMute, lineHeight: 1.5 }}>{it.desc}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

const css = `
  .mapa-card:hover { background: ${c.surfaceHi} !important; }
  .mapa-card:hover span:nth-child(2) { text-decoration: underline; }
`;
