"use client";

// FanSnap · Admin · Photographers roster — REAL data over D1 `users`
// (role='photographer'). Photographers arrive two ways:
//  1. Auto — approving an application in /admin/applications promotes it here.
//  2. Manual — the "+ Novo fotógrafo" form on this page.
// Event assignments (tier/commission) are managed from each event's drawer.

import { useEffect, useState, useCallback } from "react";
import { T, mono, display, AdminShell, GridBg, PhotographersTabs, notify, fmtDate, Badge, Section, Row, Kpi, Empty } from "./_kit";

interface Photographer {
  id: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  handle: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  portfolio: string | null;
  bio: string | null;
  specialties: string | null;
  equipment: string | null;
  tier: string | null;
  status: string | null;
  payout_method: string | null;
  payout_account: string | null;
  tax_id: string | null;
  onboarding_token: string | null;
  onboarding_status: string | null;
  created_at: string;
  last_seen_at: string | null;
  event_count: number;
}


export default function PhotographersRoster() {
  const [rows, setRows] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [detail, setDetail] = useState<Photographer | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch("/fansnap/api/admin/photographers", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error ?? "Error");
      setRows(j.photographers ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const remove = useCallback(async (p: Photographer) => {
    if (!confirm(`Remover ${p.name || p.email} do roster? As atribuições a eventos também saem.`)) return;
    setRows((rs) => rs.filter((x) => x.id !== p.id));
    setDetail(null);
    try {
      const r = await fetch(`/fansnap/api/admin/photographers?id=${encodeURIComponent(p.id)}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      notify("Fotógrafo removido do roster");
    } catch { notify("Erro ao remover — recarregando", "error"); void load(); }
  }, [load]);

  const patch = useCallback(async (id: string, fields: Record<string, unknown>) => {
    setRows((rs) => rs.map((p) => p.id === id ? { ...p, ...fields } as Photographer : p));
    setDetail((d) => d && d.id === id ? { ...d, ...fields } as Photographer : d);
    try {
      const r = await fetch("/fansnap/api/admin/photographers", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...fields }),
      });
      if (!r.ok) throw new Error();
      notify("Salvo");
    } catch { notify("Erro ao salvar — recarregando", "error"); void load(); }
  }, [load]);

  const assigned = rows.reduce((n, p) => n + (p.event_count || 0), 0);

  return (
    <AdminShell currentNav="nav-photographers" breadcrumb="PHOTOGRAPHERS">
      <div style={{ position: "relative", padding: "28px 32px 60px", flex: 1, overflow: "auto" }}>
        <GridBg />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14 }}>
            <h1 style={{ fontFamily: display, fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: T.ink, margin: 0 }}>Fotógrafos</h1>
            <span style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.15em" }}>D1 LIVE</span>
          </div>
          <PhotographersTabs active="roster" />
          <div style={{ height: 18 }} />
          <p style={{ fontFamily: display, fontSize: 14, color: T.inkSoft, margin: "0 0 22px", maxWidth: 640 }}>
            O roster real. Entram ao aprovar candidaturas em <span style={{ color: T.cyan }}>Solicitudes</span>, ou adicione manualmente aqui. Atribua-os a eventos pela gaveta de cada evento.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 22 }}>
            <Kpi k="Fotógrafos" v={rows.length} c={T.ink} />
            <Kpi k="Atribuições a eventos" v={assigned} c={T.cyan} />
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={() => void load()} style={chip(false)}>↻ Atualizar</button>
              <button onClick={() => setShowNew((v) => !v)} style={{ ...chip(showNew), borderColor: T.cyan, color: showNew ? T.bg : T.cyan, background: showNew ? T.cyan : "transparent" }}>+ Novo fotógrafo</button>
            </div>
          </div>

          {showNew && <NewPhotographerForm onCreated={() => { setShowNew(false); void load(); }} />}

          {loading && <Empty label="Carregando…" />}
          {error && !loading && <Empty label={`Erro: ${error}`} color={T.pink} />}

          {!loading && !error && (
            <div style={{ border: `2px solid ${T.border}`, background: T.bgDeep, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: display, fontSize: 13, minWidth: 720 }}>
                <thead>
                  <tr style={{ background: T.bgPaper }}>
                    {["Nome", "Tier", "Contato", "Cidade", "Eventos", "Status", ""].map((h, i) => <th key={i} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} onClick={() => setDetail(p)} style={{ borderBottom: `1px solid ${T.border}`, cursor: "pointer" }} className="fs-evt-row">
                      <td style={{ ...td, fontWeight: 600 }}>{p.name || "—"}{p.handle ? <span style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, marginLeft: 6 }}>@{p.handle}</span> : null}</td>
                      <td style={td}><Badge color={p.tier === "vip" ? T.purple : p.tier === "pro" ? T.cyan : T.inkSoft} label={p.tier || "standard"} /></td>
                      <td style={td}>
                        <div>{p.email}</div>
                        {p.phone && <div style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, marginTop: 2 }}>{p.phone}</div>}
                      </td>
                      <td style={{ ...td, color: T.inkSoft }}>{p.city || "—"}</td>
                      <td style={{ ...td, fontFamily: mono, fontWeight: 700, color: p.event_count ? T.cyan : T.inkMute }}>{p.event_count || 0}</td>
                      <td style={td}><Badge color={p.status === "paused" ? "#FFD166" : p.status === "archived" ? T.inkMute : T.green} label={p.status || "active"} /></td>
                      <td style={td}><span style={{ color: T.inkMute, fontSize: 16 }}>›</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && <Empty label="Nenhum fotógrafo ainda. Aprove uma candidatura ou adicione manualmente." />}
            </div>
          )}
        </div>
      </div>

      {detail && (
        <PhotographerDrawer ev={detail} onClose={() => setDetail(null)} onPatch={patch} onRemove={() => remove(detail)} />
      )}
    </AdminShell>
  );
}

// ─── Photographer ficha (detail drawer) ──────────────────────────────────────

function PhotographerDrawer({ ev, onClose, onPatch, onRemove }: {
  ev: Photographer;
  onClose: () => void;
  onPatch: (id: string, fields: Record<string, unknown>) => void;
  onRemove: () => void;
}) {
  const tags = (json: string | null): string[] => { try { return json ? JSON.parse(json) : []; } catch { return []; } };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(480px, 94vw)", height: "100%", background: T.bgDeep, borderLeft: `2px solid ${T.border}`, overflowY: "auto" }}>
        <div style={{ padding: "24px 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <h2 style={{ fontFamily: display, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: T.ink, margin: 0 }}>{ev.name || "—"}</h2>
              {ev.handle && <div style={{ fontFamily: mono, fontSize: 12, color: T.cyan, marginTop: 4 }}>@{ev.handle}</div>}
            </div>
            <button onClick={onClose} aria-label="fechar" style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.inkSoft, cursor: "pointer", padding: "6px 10px", fontFamily: mono }}>✕</button>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0" }}>
            <Badge color={ev.tier === "vip" ? T.purple : ev.tier === "pro" ? T.cyan : T.inkSoft} label={`tier ${ev.tier || "standard"}`} />
            <Badge color={ev.status === "paused" ? "#FFD166" : ev.status === "archived" ? T.inkMute : T.green} label={ev.status || "active"} />
            <Badge color={T.inkSoft} label={`${ev.event_count || 0} eventos`} />
          </div>

          <Section title="Contato">
            <Row k="Email" v={ev.email} />
            <Row k="Telefone" v={ev.phone || "—"} />
            <Row k="Cidade" v={`${ev.city || "—"}${ev.country ? " · " + ev.country : ""}`} />
            <Row k="Portfólio" v={ev.portfolio || "—"} link={ev.portfolio} />
          </Section>

          <Section title="Perfil">
            <Tags label="Especialidades" items={tags(ev.specialties)} />
            <Tags label="Equipamento" items={tags(ev.equipment)} />
            {ev.bio && <p style={{ fontFamily: display, fontSize: 13, color: T.inkSoft, lineHeight: 1.5, margin: "8px 0 0" }}>{ev.bio}</p>}
          </Section>

          <Section title="Financeiro">
            <EditRow label="Tier padrão" value={ev.tier || "standard"} options={["standard", "pro", "vip"]} onSave={(v) => onPatch(ev.id, { tier: v })} />
            <EditRow label="Status" value={ev.status || "active"} options={["active", "paused", "archived"]} onSave={(v) => onPatch(ev.id, { status: v })} />
            <EditRow label="Método de pagamento" value={ev.payout_method || ""} options={["", "clabe", "stripe", "paypal"]} onSave={(v) => onPatch(ev.id, { payout_method: v })} />
            <EditText label="Conta / CLABE" value={ev.payout_account || ""} placeholder="•••• 4821" onSave={(v) => onPatch(ev.id, { payout_account: v })} />
            <EditText label="RFC / Tax ID" value={ev.tax_id || ""} placeholder="RFC…" onSave={(v) => onPatch(ev.id, { tax_id: v })} />
          </Section>

          <Section title="Alta / onboarding">
            <OnboardingBlock token={ev.onboarding_token} status={ev.onboarding_status} />
          </Section>

          <div style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${T.border}` }}>
            <button onClick={onRemove} style={{ background: "transparent", border: `1.5px solid ${T.pink}`, color: T.pink, cursor: "pointer", padding: "10px 16px", fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Remover do roster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shows the tokenized onboarding link (sent to the photographer on approval to
// fill account/financial data) + whether they've completed it. Copy-to-share.
function OnboardingBlock({ token, status }: { token: string | null; status: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!token) {
    return (
      <p style={{ fontFamily: mono, fontSize: 12, color: T.inkMute, margin: 0, lineHeight: 1.6 }}>
        Sem link de alta. Fotógrafos adicionados manualmente não têm onboarding —
        o link é gerado ao aprovar uma candidatura.
      </p>
    );
  }
  const url = `https://betofabri.com/fansnap/onboarding/${token}`;
  const done = status === "complete";
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* no clipboard */ }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Badge color={done ? T.green : "#FFD166"} label={done ? "alta completa" : "alta pendente"} />
      <div style={{
        display: "flex", alignItems: "stretch", border: `1px solid ${T.border}`, background: T.bg,
      }}>
        <code style={{
          flex: 1, minWidth: 0, fontFamily: mono, fontSize: 11, color: T.inkSoft,
          padding: "10px 12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{url}</code>
        <button onClick={copy} style={{
          flexShrink: 0, background: copied ? T.green : "transparent",
          color: copied ? "#000" : T.cyan, border: "none", borderLeft: `1px solid ${T.border}`,
          cursor: "pointer", padding: "0 16px", fontFamily: mono, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.06em", textTransform: "uppercase",
        }}>{copied ? "copiado ✓" : "copiar"}</button>
      </div>
      <p style={{ fontFamily: mono, fontSize: 10.5, color: T.inkMute, margin: 0, lineHeight: 1.6 }}>
        Envia por email ou WhatsApp. O fotógrafo preenche CLABE, RFC, método de
        pagamento, equipamento e aceita o contrato.
      </p>
    </div>
  );
}

function NewPhotographerForm({ onCreated }: { onCreated: () => void }) {
  const [f, setF] = useState({ firstName: "", lastName: "", email: "", phone: "", city: "", portfolio: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setErr(null);
    if (!f.firstName || !f.lastName || !f.email.includes("@")) { setErr("Nome, sobrenome e email válido são obrigatórios."); return; }
    setBusy(true);
    try {
      const r = await fetch("/fansnap/api/admin/photographers", {
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
      <div style={{ fontFamily: mono, fontSize: 11, color: T.cyan, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>Novo fotógrafo (manual)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        <input style={inp} placeholder="Nome" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} />
        <input style={inp} placeholder="Sobrenome" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} />
        <input style={inp} placeholder="Email" value={f.email} onChange={(e) => set("email", e.target.value)} />
        <input style={inp} placeholder="Telefone / WhatsApp" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
        <input style={inp} placeholder="Cidade" value={f.city} onChange={(e) => set("city", e.target.value)} />
        <input style={inp} placeholder="Portfólio / IG / web" value={f.portfolio} onChange={(e) => set("portfolio", e.target.value)} />
      </div>
      {err && <div style={{ fontFamily: mono, fontSize: 12, color: T.pink, marginTop: 10 }}>{err}</div>}
      <div style={{ marginTop: 14 }}>
        <button onClick={submit} disabled={busy} style={{ background: T.cyan, color: T.bg, border: "none", padding: "10px 18px", fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1 }}>
          {busy ? "Adicionando…" : "Adicionar ao roster"}
        </button>
      </div>
    </div>
  );
}

// Badge/Section/Row/Kpi/Empty/fmtDate come from ./_kit (audit Lote B dedup).
function Tags({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={{ padding: "6px 0" }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      {items.length === 0 ? <span style={{ color: T.inkMute, fontFamily: display, fontSize: 13 }}>—</span> : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {items.map((x, i) => <span key={i} style={{ fontFamily: mono, fontSize: 10, color: T.inkSoft, border: `1px solid ${T.border}`, padding: "2px 7px" }}>{x}</span>)}
        </div>
      )}
    </div>
  );
}
function EditRow({ label, value, options, onSave }: { label: string; value: string; options: string[]; onSave: (v: string) => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "6px 0" }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
      <select value={value} onChange={(e) => onSave(e.target.value)} style={{ background: T.bg, color: T.ink, border: `1px solid ${T.border}`, fontFamily: mono, fontSize: 12, padding: "5px 8px", outline: "none" }}>
        {options.map((o) => <option key={o} value={o} style={{ background: "#15151D" }}>{o || "—"}</option>)}
      </select>
    </div>
  );
}
function EditText({ label, value, placeholder, onSave }: { label: string; value: string; placeholder?: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "6px 0" }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
      <input value={v} placeholder={placeholder} onChange={(e) => setV(e.target.value)} onBlur={() => { if (v !== value) onSave(v); }}
        style={{ background: T.bg, color: T.ink, border: `1px solid ${T.border}`, fontFamily: mono, fontSize: 12, padding: "5px 8px", outline: "none", textAlign: "right", maxWidth: 200 }} />
    </div>
  );
}
const th: React.CSSProperties = { textAlign: "left", padding: "11px 12px", fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `2px solid ${T.border}`, whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "12px 12px", color: T.ink, verticalAlign: "top" };
function chip(active: boolean): React.CSSProperties {
  return { background: active ? T.ink : "transparent", color: active ? T.bg : T.inkSoft, border: `1.5px solid ${active ? T.ink : T.border}`, padding: "6px 12px", fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", borderRadius: 0 };
}
