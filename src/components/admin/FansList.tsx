"use client";

// FanSnap · Admin · Fans — REAL data over D1 `users` (role='fan').
// Fans register at checkout (auto) or via the gallery "avísame" opt-in, both
// hitting /api/fans/register. Manual add here mirrors the photographers page.

import { useEffect, useState, useCallback } from "react";
import { T, mono, display, AdminShell, GridBg } from "./_kit";

interface Fan {
  id: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  source: string | null;
  language: string | null;
  consent_at: string | null;
  created_at: string;
  last_seen_at: string | null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try { return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso)); }
  catch { return iso; }
}

export default function FansList() {
  const [rows, setRows] = useState<Fan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<Fan | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch("/fansnap/api/admin/fans", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error ?? "Error");
      setRows(j.fans ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const remove = useCallback(async (f: Fan) => {
    if (!confirm(`Remover ${f.name || f.email}?`)) return;
    setRows((rs) => rs.filter((x) => x.id !== f.id));
    setDetail(null);
    try { await fetch(`/fansnap/api/admin/fans?id=${encodeURIComponent(f.id)}`, { method: "DELETE" }); }
    catch { void load(); }
  }, [load]);

  const filtered = q.trim()
    ? rows.filter((f) => `${f.name ?? ""} ${f.email} ${f.city ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()))
    : rows;
  const withCity = rows.filter((f) => f.city).length;

  return (
    <AdminShell currentNav="nav-fans" breadcrumb="FANS">
      <div style={{ position: "relative", padding: "28px 32px 60px", flex: 1, overflow: "auto" }}>
        <GridBg />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 4 }}>
            <h1 style={{ fontFamily: display, fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: T.ink, margin: 0 }}>Fans</h1>
            <span style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.15em" }}>D1 LIVE</span>
          </div>
          <p style={{ fontFamily: display, fontSize: 14, color: T.inkSoft, margin: "0 0 22px", maxWidth: 640 }}>
            Fans reais. Entram ao comprar no checkout ou ao pedir aviso na galeria — ou adicione manualmente. A busca por foto segue grátis e anônima; só viram cadastro quando deixam o email.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 22 }}>
            <Kpi k="Fans" v={rows.length} c={T.ink} />
            <Kpi k="Com cidade" v={withCity} c={T.cyan} />
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nome, email, cidade…"
              style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.ink, padding: "8px 12px", fontFamily: display, fontSize: 13, borderRadius: 4, outline: "none", minWidth: 220 }} />
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={() => void load()} style={chip(false)}>↻ Atualizar</button>
              <button onClick={() => setShowNew((v) => !v)} style={{ ...chip(showNew), borderColor: T.cyan, color: showNew ? T.bg : T.cyan, background: showNew ? T.cyan : "transparent" }}>+ Novo fan</button>
            </div>
          </div>

          {showNew && <NewFanForm onCreated={() => { setShowNew(false); void load(); }} />}

          {loading && <Empty label="Carregando…" />}
          {error && !loading && <Empty label={`Erro: ${error}`} color={T.pink} />}

          {!loading && !error && (
            <div style={{ border: `2px solid ${T.border}`, background: T.bgDeep, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: display, fontSize: 13, minWidth: 680 }}>
                <thead>
                  <tr style={{ background: T.bgPaper }}>
                    {["Nome", "Email", "Cidade", "Origem", "Última atividade", ""].map((h, i) => <th key={i} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => (
                    <tr key={f.id} onClick={() => setDetail(f)} style={{ borderBottom: `1px solid ${T.border}`, cursor: "pointer" }} className="fs-evt-row">
                      <td style={{ ...td, fontWeight: 600 }}>{f.name || "—"}</td>
                      <td style={td}>{f.email}</td>
                      <td style={{ ...td, color: T.inkSoft }}>{f.city || "—"}</td>
                      <td style={td}>{f.source ? <Badge color={T.inkSoft} label={f.source} /> : <span style={{ color: T.inkMute }}>—</span>}</td>
                      <td style={{ ...td, fontFamily: mono, fontSize: 12, color: T.inkMute }}>{fmtDate(f.last_seen_at || f.created_at)}</td>
                      <td style={td}><span style={{ color: T.inkMute, fontSize: 16 }}>›</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <Empty label={rows.length === 0 ? "Nenhum fan ainda. Eles aparecem ao comprar ou pedir aviso." : "Nada encontrado nessa busca."} />}
            </div>
          )}
        </div>
      </div>

      {detail && <FanDrawer f={detail} onClose={() => setDetail(null)} onRemove={() => remove(detail)} />}
    </AdminShell>
  );
}

function NewFanForm({ onCreated }: { onCreated: () => void }) {
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "", city: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setErr(null);
    if (!f.firstName || !f.lastName || !f.email.includes("@")) { setErr("Nome, sobrenome e email válido são obrigatórios."); return; }
    setBusy(true);
    try {
      const r = await fetch("/fansnap/api/admin/fans", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
      });
      const j = await r.json();
      if (!r.ok) { setErr(j?.error ?? "Erro"); setBusy(false); return; }
      onCreated();
    } catch { setErr("Erro de rede"); setBusy(false); }
  };

  const inp: React.CSSProperties = { background: T.bg, border: `1px solid ${T.border}`, color: T.ink, padding: "8px 10px", fontFamily: display, fontSize: 13, borderRadius: 4, outline: "none" };
  return (
    <div style={{ border: `2px solid ${T.cyan}`, background: T.bgPaper, padding: 18, marginBottom: 18 }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: T.cyan, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>Novo fan (manual)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        <input style={inp} placeholder="Nome" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} />
        <input style={inp} placeholder="Sobrenome" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} />
        <input style={inp} placeholder="Email" value={f.email} onChange={(e) => set("email", e.target.value)} />
        <input style={inp} placeholder="Telefone" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
        <input style={inp} placeholder="Cidade" value={f.city} onChange={(e) => set("city", e.target.value)} />
      </div>
      {err && <div style={{ fontFamily: mono, fontSize: 12, color: T.pink, marginTop: 10 }}>{err}</div>}
      <div style={{ marginTop: 14 }}>
        <button onClick={submit} disabled={busy} style={{ background: T.cyan, color: T.bg, border: "none", padding: "10px 18px", fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1 }}>
          {busy ? "Adicionando…" : "Adicionar fan"}
        </button>
      </div>
    </div>
  );
}

// ─── Fan ficha (detail drawer) ───────────────────────────────────────────────

function FanDrawer({ f, onClose, onRemove }: { f: Fan; onClose: () => void; onRemove: () => void }) {
  const fmt = (iso: string | null) => {
    if (!iso) return "—";
    try { return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)); }
    catch { return iso; }
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(460px, 94vw)", height: "100%", background: T.bgDeep, borderLeft: `2px solid ${T.border}`, overflowY: "auto" }}>
        <div style={{ padding: "24px 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <h2 style={{ fontFamily: display, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: T.ink, margin: 0 }}>{f.name || "—"}</h2>
            <button onClick={onClose} aria-label="fechar" style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.inkSoft, cursor: "pointer", padding: "6px 10px", fontFamily: mono }}>✕</button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0" }}>
            {f.source && <Badge color={T.cyan} label={f.source} />}
            {f.language && <Badge color={T.inkSoft} label={f.language} />}
          </div>

          <Section title="Contato">
            <Row k="Email" v={f.email} />
            <Row k="Telefone" v={f.phone || "—"} />
            <Row k="Cidade" v={`${f.city || "—"}${f.country ? " · " + f.country : ""}`} />
          </Section>

          <Section title="Atividade">
            <Row k="Cadastrado em" v={fmt(f.created_at)} />
            <Row k="Última atividade" v={fmt(f.last_seen_at)} />
            <Row k="Origem" v={f.source || "—"} />
          </Section>

          <Section title="Consentimento biométrico">
            <Row k="Aceito em" v={f.consent_at ? fmt(f.consent_at) : "—"} />
            <div style={{ fontFamily: display, fontSize: 12, color: T.inkMute, lineHeight: 1.5, marginTop: 4 }}>
              LFPDPPP: a selfie nunca é armazenada; só o vetor para o match. O registro de consentimento por scan entra quando os scans forem persistidos.
            </div>
          </Section>

          <Section title="Compras">
            <div style={{ fontFamily: display, fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}>
              Histórico de pedidos aparece aqui quando o checkout gravar no D1 (hoje os pedidos vivem no dispositivo — ver <span style={{ color: T.cyan }}>/pedidos</span>).
            </div>
          </Section>

          <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${T.border}` }}>
            <button onClick={onRemove} style={{ background: "transparent", border: `1.5px solid ${T.pink}`, color: T.pink, cursor: "pointer", padding: "10px 16px", fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Remover fan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  return <span style={{ display: "inline-block", fontFamily: mono, fontSize: 10, fontWeight: 700, color, border: `1px solid ${color}`, padding: "3px 7px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0" }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.06em", textTransform: "uppercase" }}>{k}</span>
      <span style={{ fontFamily: display, fontSize: 13, color: T.ink, textAlign: "right" }}>{v}</span>
    </div>
  );
}

function Kpi({ k, v, c }: { k: string; v: number | string; c: string }) {
  return (
    <div style={{ background: T.bgPaper, border: `2px solid ${T.border}`, padding: "14px 16px" }}>
      <div style={{ fontFamily: display, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: c }}>{v}</div>
      <div style={{ fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>{k}</div>
    </div>
  );
}
function Empty({ label, color = T.inkMute }: { label: string; color?: string }) {
  return <div style={{ border: `2px dashed ${T.border}`, padding: "40px 24px", textAlign: "center", fontFamily: mono, fontSize: 13, color, letterSpacing: "0.06em" }}>{label}</div>;
}
const th: React.CSSProperties = { textAlign: "left", padding: "11px 12px", fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `2px solid ${T.border}`, whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "12px 12px", color: T.ink, verticalAlign: "top" };
function chip(active: boolean): React.CSSProperties {
  return { background: active ? T.ink : "transparent", color: active ? T.bg : T.inkSoft, border: `1.5px solid ${active ? T.ink : T.border}`, padding: "6px 12px", fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", borderRadius: 0 };
}
