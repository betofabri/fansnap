// FanSnap · Roadmap — /fansnap/roadmap
//
// Navigable version of docs/roadmap-real-pipeline.md: phase status, what is
// real vs simulated, locked decisions and next steps. Internal: gated behind
// the PREVIEW cookie (same rule as /mapa) and noindex. Keep the data below in
// sync with the markdown when a phase changes state.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasPreviewCookie } from "@/lib/gate";
import { DARK as c, FONT_GROTESK, FONT_MONO } from "@/lib/theme";
import FanSnapLogo from "@/components/FanSnapLogo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Roadmap · FanSnap (interno)",
  robots: { index: false, follow: false },
};

const UPDATED = "01 out 2026";

type Status = "done" | "partial" | "blocked" | "pending" | "scope";

const STATUS: Record<Status, { label: string; color: string }> = {
  done: { label: "Concluída", color: c.ok },
  partial: { label: "Parcial", color: c.warn },
  blocked: { label: "Bloqueada", color: c.magenta },
  pending: { label: "Pendente", color: c.inkSoft },
  scope: { label: "Fora do escopo", color: c.inkMute },
};

type Phase = {
  id: string;
  title: string;
  status: Status;
  when?: string;
  summary: string;
  items: string[];
  verify?: string;
};

const PHASES: Phase[] = [
  {
    id: "0",
    title: "Provisão + flag",
    status: "done",
    when: "jul 2026",
    summary: "Fundação do pipeline real, 100% aditiva.",
    items: [
      "Bucket R2 fansnap-photos + binding PHOTOS",
      "migrate-004: photo_source (mock | live), photos.status, content_hash, tabela photo_faces",
      "Layout R2: originals/<code>/<id> privado, previews/<code>/<id> via Worker",
    ],
  },
  {
    id: "1",
    title: "Upload real",
    status: "done",
    when: "jul 2026",
    summary: "Fotógrafo sobe o arquivo direto pro R2, atrás do flag photo_source = live.",
    items: [
      "POST init, PUT stream, complete enfileira o processamento",
      "UploadPanel mantém validação client-side e passa a fazer polling do status",
      "Eventos mock continuam com a simulação",
    ],
  },
  {
    id: "2a",
    title: "Processamento: marca d'água",
    status: "done",
    when: "jul 2026",
    summary: "Fila fansnap-process + Worker fansnap-processor, deploy separado.",
    items: [
      "Resize 1600px + marca d'água v3 (lattice diagonal) via Photon WASM",
      "Nível por evento: suave, media, forte (admin, migrate-007)",
      "Chave de preview versionada, reprocesso sob demanda, status published",
    ],
    verify: "Verificado em prod com inspeção visual da preview.",
  },
  {
    id: "2b",
    title: "Processamento: índice facial",
    status: "blocked",
    summary: "Descriptors por foto em photo_faces, via Queue para um Container Node que reusa build-face-index.mjs.",
    items: [
      "Bloqueio: Docker Desktop não instalado (build da imagem) + plano Cloudflare com Containers",
      "Até lá face_indexed = 0 e o match só funciona em eventos mock",
      "Destravar: containers/face-index/ com Node + tfjs-node + canvas, consumer da fila",
    ],
    verify: "photo_faces populado, face_indexed = 1, rosto encontrado no scan de um evento live.",
  },
  {
    id: "3",
    title: "Match por evento",
    status: "pending",
    summary: "Scan client-side contra o índice do D1 para eventos live. Depende da 2b.",
    items: [
      "GET /api/events/<code>/face-index com previews + descriptors",
      "loadIndex(code, source): live busca o endpoint, mock mantém o JSON estático",
      "Threshold e mirror-invariance idênticos aos de hoje",
      "Gravar scans + scan_matches com consent_text_id e selfie_hash",
      "Aposentar o stub /api/scan",
    ],
    verify: "Scan acha fotos reais de um evento live; evento mock inalterado.",
  },
  {
    id: "4",
    title: "Entrega do original sem gateway",
    status: "done",
    when: "jul 2026",
    summary: "Ciclo pedido, pagamento stub e download, pronto pra receber o gateway depois.",
    items: [
      "POST /api/orders grava orders + order_lines no rail free_sponsored, status paid",
      "Código curto FS-XXXXXX + email para lookup em /pedidos",
      "Download com link assinado HMAC, 24h, original limpo byte-idêntico",
      "Link vencido reemite após código + email",
    ],
    verify: "E2E em prod: original idêntico, tampering rejeitado, mock faz 302.",
  },
  {
    id: "5",
    title: "Auth de produto",
    status: "pending",
    summary: "Magic-link por email, sessão JWT em cookie httpOnly. Vale pra fã e fotógrafo.",
    items: [
      "POST /api/auth/request e GET /api/auth/callback",
      "Dashboard do fotógrafo em dado real (eventos atribuídos, vendas)",
      "Conta do fã: histórico + re-download",
    ],
  },
  {
    id: "6",
    title: "Consentimento biométrico + legal MX",
    status: "pending",
    summary: "Pré-requisito pra abrir o site. Hoje só existe checkbox no carrinho.",
    items: [
      "Step versionado antes da selfie, gravando consent_text_id e consent_accepted_at",
      "Páginas /privacidad, /terminos, /aviso-biometrico",
      "Fluxo ARCO e apagar meus dados",
    ],
    verify: "Scan sem consentimento bloqueado; registro gravado e apagável.",
  },
  {
    id: "7",
    title: "Emails transacionais",
    status: "partial",
    summary: "Recibo pronto. Envio real depende do Email Sending no domínio.",
    items: [
      "Feito: recibo com thumbs marcadas e links assinados",
      "Pendente: tus fotos están listas ao publicar ou dar match",
      "Pendente: ativar Email Sending em betofabri.com + DNS; hoje falha em silêncio",
    ],
  },
  {
    id: "8",
    title: "Polish e dívida",
    status: "pending",
    summary: "Paralelo, baixo risco.",
    items: [
      "Dedupe dos dois forms de cadastro (/fotografos#cadastro e /aplica)",
      "Reconciliar brutalismo da SPA com as landings flat",
      "a11y (micro-labels, alvos de toque), analytics de funil",
    ],
  },
  {
    id: "#43",
    title: "Cloudflare Access no /admin",
    status: "pending",
    summary: "Trava de segurança do admin, item separado do pipeline. Obrigatória antes do lançamento.",
    items: ["Google SSO via Cloudflare Access na rota /fansnap/admin*"],
  },
  {
    id: "$",
    title: "Gateway de pagamento + repasse",
    status: "scope",
    summary: "Stripe, MercadoPago, OXXO e payout ao fotógrafo ficam fora desta rodada por decisão.",
    items: ["Quando entrar, só muda como orders.status flipa pra paid"],
  },
];

type Row = { piece: string; today: string; real: boolean; target: string };

const REAL_VS_SIM: Row[] = [
  { piece: "Upload do fotógrafo", today: "Stream direto pro R2 quando o evento é live", real: true, target: "Igual" },
  { piece: "Armazenamento", today: "R2: originals privados, previews via Worker", real: true, target: "Igual" },
  { piece: "Marca d'água / resize", today: "Server-side por upload, nível por evento, chave versionada", real: true, target: "Igual" },
  { piece: "Índice facial", today: "JSON estático só pros eventos mock", real: false, target: "Por evento, a partir dos uploads (2b)" },
  { piece: "Match", today: "Client-side vs JSON estático, só mock", real: false, target: "Client por evento (3), server em escala" },
  { piece: "Pedido", today: "orders + order_lines no D1, rail free_sponsored", real: true, target: "Gateway só flipa o status" },
  { piece: "Entrega do original", today: "Link assinado 24h, original limpo", real: true, target: "Igual" },
  { piece: "Auth", today: "Nenhuma; id do pedido é a capability", real: false, target: "Magic-link (5) + Access no admin (#43)" },
  { piece: "Consentimento biométrico", today: "Checkbox no carrinho", real: false, target: "Step versionado antes da selfie (6)" },
  { piece: "Emails", today: "Template pronto, envio depende do domínio", real: false, target: "Fotos listas + envio confirmado (7)" },
];

const DECISIONS = [
  { n: "1", title: "Índice facial server-side: Queue para Container Node", body: "face-api precisa de canvas nativo e não roda no runtime de Workers. O Container reusa o código validado de build-face-index.mjs e a biometria não sai da Cloudflare. Rekognition e Vectorize descartados." },
  { n: "2", title: "Auth de produto: magic-link por email", body: "Passwordless, reusa o binding de Email. Sessão em JWT assinado, cookie httpOnly. Google OAuth descartado por ora." },
  { n: "3", title: "Match em escala", body: "Client-side por evento até cerca de 1.500 a 2.000 fotos. Acima disso o mesmo Container faz o match server-side." },
  { n: "4", title: "Entrega sem gateway: rail free_sponsored", body: "Executado na Fase 4. Pedido nasce paid por stub; o gateway, quando entrar, só muda como esse status flipa." },
];

const NEXT = [
  "Destravar a Fase 2b (Docker Desktop + plano Containers) e fechar a Fase 3",
  "Fase 6: consentimento e páginas legais, pré-requisito de abrir o site no MX",
  "Fase 5: magic-link e dashboard do fotógrafo em dado real",
  "#43: Cloudflare Access no /admin",
  "Confirmar Email Sending no domínio e completar a Fase 7",
];

export default async function RoadmapPage() {
  if (!(await hasPreviewCookie())) notFound();

  const count = (s: Status) => PHASES.filter((p) => p.status === s).length;

  return (
    <div style={{ background: c.bg, color: c.ink, minHeight: "100vh", fontFamily: FONT_GROTESK }}>
      <style>{css}</style>

      <header style={{ borderBottom: `1px solid ${c.border}`, background: c.surface, position: "sticky", top: 0, zIndex: 5 }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "18px clamp(20px,4vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <FanSnapLogo size="sm" />
          <nav style={{ display: "flex", gap: 18, alignItems: "center", fontFamily: FONT_MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            <a href="#fases" className="rm-nav">Fases</a>
            <a href="#real" className="rm-nav">Real x simulado</a>
            <a href="#decisoes" className="rm-nav">Decisões</a>
            <a href="/fansnap/mapa" className="rm-nav" style={{ color: c.inkMute }}>Mapa</a>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "clamp(36px,6vw,72px) clamp(20px,4vw,40px) 120px" }}>
        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.accent, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>
            Roadmap · interno · atualizado {UPDATED}
          </div>
          <h1 style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 0.98, margin: 0 }}>
            Do protótipo ao <span style={{ color: c.magenta }}>pipeline real.</span>
          </h1>
          <p style={{ color: c.inkSoft, fontSize: 16, lineHeight: 1.6, margin: "18px 0 0", maxWidth: 640 }}>
            Upload, marca d&apos;água, pedido e entrega já rodam em prod. O que falta pra abrir o site no México:
            índice facial dos eventos live, consentimento biométrico e auth. Gateway de pagamento fica fora desta rodada.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 1, background: c.border, border: `1px solid ${c.border}`, marginBottom: 56 }}>
          {(["done", "partial", "blocked", "pending"] as Status[]).map((s) => (
            <div key={s} style={{ background: c.surface, padding: "18px 20px" }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 36, fontWeight: 700, color: STATUS[s].color, lineHeight: 1 }}>{count(s)}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: c.inkMute, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 8 }}>{STATUS[s].label}</div>
            </div>
          ))}
          <div style={{ background: c.surface, padding: "18px 20px" }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 36, fontWeight: 700, color: c.premium, lineHeight: 1 }}>2b</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: c.inkMute, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 8 }}>Bloqueio crítico</div>
          </div>
        </div>

        {/* Phases */}
        <SectionTitle id="fases" n="01" title="Fases" accent={c.accent} />
        <div style={{ display: "flex", flexDirection: "column", gap: 1, background: c.border, border: `1px solid ${c.border}`, marginBottom: 64 }}>
          {PHASES.map((p) => <PhaseCard key={p.id} p={p} />)}
        </div>

        {/* Real vs simulated */}
        <SectionTitle id="real" n="02" title="Real x simulado" accent={c.premium} />
        <div style={{ border: `1px solid ${c.border}`, marginBottom: 64, overflowX: "auto" }}>
          <table className="rm-table">
            <thead>
              <tr>
                <th>Peça</th>
                <th>Hoje</th>
                <th>Alvo</th>
              </tr>
            </thead>
            <tbody>
              {REAL_VS_SIM.map((r) => (
                <tr key={r.piece}>
                  <td style={{ fontWeight: 700, color: c.ink, whiteSpace: "nowrap" }}>{r.piece}</td>
                  <td>
                    <span style={{ display: "inline-block", width: 7, height: 7, background: r.real ? c.ok : c.warn, marginRight: 9, verticalAlign: "middle" }} />
                    <span style={{ fontFamily: FONT_MONO, fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: r.real ? c.ok : c.warn, marginRight: 10 }}>{r.real ? "real" : "simulado"}</span>
                    {r.today}
                  </td>
                  <td style={{ color: c.inkSoft }}>{r.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Decisions */}
        <SectionTitle id="decisoes" n="03" title="Decisões batidas" accent={c.magenta} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1, background: c.border, border: `1px solid ${c.border}`, marginBottom: 64 }}>
          {DECISIONS.map((d) => (
            <div key={d.n} style={{ background: c.surface, padding: "20px 22px" }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.magenta, letterSpacing: "0.14em", marginBottom: 10 }}>DECISÃO {d.n} · FECHADA</div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 8 }}>{d.title}</div>
              <p style={{ fontSize: 13.5, color: c.inkSoft, lineHeight: 1.6, margin: 0 }}>{d.body}</p>
            </div>
          ))}
        </div>

        {/* Next */}
        <SectionTitle id="proximos" n="04" title="Próximos passos" accent={c.ok} />
        <ol style={{ listStyle: "none", margin: 0, padding: 0, border: `1px solid ${c.border}`, marginBottom: 48 }}>
          {NEXT.map((t, i) => (
            <li key={t} style={{ display: "flex", gap: 18, padding: "16px 22px", borderTop: i ? `1px solid ${c.border}` : "none", background: c.surface, alignItems: "baseline" }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: c.ok, fontWeight: 700, minWidth: 24 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 15, lineHeight: 1.5 }}>{t}</span>
            </li>
          ))}
        </ol>

        <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute, lineHeight: 1.7, borderTop: `1px solid ${c.border}`, paddingTop: 18 }}>
          Princípio: tudo aditivo e atrás de flag. Eventos mock seguem intactos. Migrations rodam uma vez (remote + local).
          Não flipar SITE_LIVE antes da Fase 6 e do #43. Fonte em docs/roadmap-real-pipeline.md.
        </div>
      </main>
    </div>
  );
}

function SectionTitle({ id, n, title, accent }: { id: string; n: string; title: string; accent: string }) {
  return (
    <div id={id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, scrollMarginTop: 90 }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: accent, fontWeight: 700 }}>{n}</span>
      <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>{title}</h2>
      <span style={{ flex: 1, height: 1, background: c.border }} />
    </div>
  );
}

function PhaseCard({ p }: { p: Phase }) {
  const s = STATUS[p.status];
  const dim = p.status === "scope";
  return (
    <article className="rm-phase" style={{ background: c.surface, display: "grid", gridTemplateColumns: "72px 1fr", gap: 0, opacity: dim ? 0.7 : 1 }}>
      <div style={{ borderRight: `1px solid ${c.border}`, padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>{p.id}</span>
        <span style={{ width: 8, height: 8, background: s.color }} />
      </div>
      <div style={{ padding: "18px 22px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.015em", margin: 0 }}>{p.title}</h3>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: s.color, border: `1px solid ${s.color}`, padding: "3px 7px" }}>{s.label}</span>
          {p.when && <span style={{ fontFamily: FONT_MONO, fontSize: 10.5, color: c.inkMute }}>{p.when}</span>}
        </div>
        <p style={{ fontSize: 14, color: c.inkSoft, lineHeight: 1.55, margin: "0 0 12px" }}>{p.summary}</p>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
          {p.items.map((it) => (
            <li key={it} style={{ fontSize: 13.5, color: c.ink, lineHeight: 1.5, paddingLeft: 14, position: "relative" }}>
              <span style={{ position: "absolute", left: 0, top: 9, width: 5, height: 1, background: c.inkMute }} />
              {it}
            </li>
          ))}
        </ul>
        {p.verify && (
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.accent, marginTop: 12, lineHeight: 1.6 }}>
            VERIF · {p.verify}
          </div>
        )}
      </div>
    </article>
  );
}

const css = `
  .rm-nav { color: ${c.inkSoft}; text-decoration: none; }
  .rm-nav:hover { color: ${c.accent}; }
  .rm-phase:hover { background: ${c.surfaceHi} !important; }
  .rm-table { width: 100%; border-collapse: collapse; font-family: ${FONT_GROTESK}; font-size: 13.5px; }
  .rm-table th { text-align: left; font-family: ${FONT_MONO}; font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase; color: ${c.inkMute}; padding: 12px 16px; border-bottom: 1px solid ${c.borderStrong}; background: ${c.surface}; }
  .rm-table td { padding: 12px 16px; border-bottom: 1px solid ${c.border}; vertical-align: top; line-height: 1.5; background: ${c.surface}; }
  .rm-table tr:last-child td { border-bottom: none; }
  @media (max-width: 640px) {
    .rm-phase { grid-template-columns: 52px 1fr !important; }
    .rm-table td { min-width: 180px; }
  }
`;
