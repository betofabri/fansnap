"use client";

// FanSnap · Admin · Events — REAL data over the D1 `events` table.
// Row click → detail drawer (edit / trash there). Soft delete → trash
// (recoverable); both trashing and permanent-delete require typing DELETE.
// API: /api/admin/events (GET/POST/PATCH/DELETE, ?trash=1, ?permanent=1).

import { useEffect, useState, useCallback } from "react";
import { T, mono, display, AdminShell, GridBg, notify, Badge, Empty } from "./_kit";

interface EventRow {
  id: string;
  code: string;
  name: string;
  business_model: string;
  category: string;
  venue: string | null;
  city: string | null;
  country: string | null;
  start_at: string;
  status: string;
  featured: number;
  cover_color: string | null;
  photo_count: number;
  photographer_count: number;
  sponsor_fee_cents: number | null;
  deleted_at: string | null;
}

const STATUSES = ["draft", "upcoming", "live", "recent", "archived"];
const MODELS = ["official", "marketplace", "sponsored"];
const CATEGORIES = ["music", "conventions", "sports", "parties", "corporate"];

const STATUS_COLOR: Record<string, string> = {
  live: T.pink, upcoming: "#FFD166", recent: T.cyan, draft: T.inkMute, archived: T.inkMute,
};
const MODEL_COLOR: Record<string, string> = {
  official: T.purple, marketplace: T.cyan, sponsored: T.pink,
};

function fmtDate(iso: string): string {
  try {
    const [y, m, d] = iso.split("T")[0].split("-").map(Number);
    return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
      .format(new Date(Date.UTC(y, m - 1, d)));
  } catch { return iso; }
}

export default function EventsList() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"active" | "trash">("active");
  const [showNew, setShowNew] = useState(false);
  const [detail, setDetail] = useState<EventRow | null>(null);
  const [del, setDel] = useState<{ ev: EventRow; mode: "trash" | "permanent" } | null>(null);

  const load = useCallback(async (v: "active" | "trash") => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`/fansnap/api/admin/events${v === "trash" ? "?trash=1" : ""}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error ?? "Error");
      setEvents(j.events ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(view); }, [load, view]);

  const patch = useCallback(async (id: string, fields: Record<string, unknown>) => {
    setEvents((evs) => evs.map((e) => e.id === id ? { ...e, ...fields } as EventRow : e));
    setDetail((d) => d && d.id === id ? { ...d, ...fields } as EventRow : d);
    try {
      const r = await fetch("/fansnap/api/admin/events", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...fields }),
      });
      if (!r.ok) throw new Error();
      notify("Salvo");
    } catch { notify("Erro ao salvar — recarregando", "error"); void load(view); }
  }, [load, view]);

  const restore = useCallback(async (id: string) => {
    setEvents((evs) => evs.filter((e) => e.id !== id));
    try {
      const r = await fetch("/fansnap/api/admin/events", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, restore: true }),
      });
      if (!r.ok) throw new Error();
      notify("Evento restaurado");
    } catch { notify("Erro ao restaurar — recarregando", "error"); void load(view); }
  }, [load, view]);

  const doDelete = useCallback(async (ev: EventRow, mode: "trash" | "permanent") => {
    setEvents((evs) => evs.filter((e) => e.id !== ev.id));
    setDetail(null);
    try {
      const r = await fetch(`/fansnap/api/admin/events?id=${encodeURIComponent(ev.id)}${mode === "permanent" ? "&permanent=1" : ""}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      notify(mode === "permanent" ? "Excluído permanentemente" : "Movido para a lixeira");
    } catch { notify("Erro ao excluir — recarregando", "error"); void load(view); }
  }, [load, view]);

  const kpis = {
    total: events.length,
    live: events.filter((e) => e.status === "live").length,
    upcoming: events.filter((e) => e.status === "upcoming").length,
    photos: events.reduce((n, e) => n + (e.photo_count || 0), 0),
  };

  return (
    <AdminShell currentNav="nav-events" breadcrumb="EVENTS">
      <div style={{ position: "relative", padding: "28px 32px 60px", flex: 1, overflow: "auto" }}>
        <GridBg />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 4 }}>
            <h1 style={{ fontFamily: display, fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: T.ink, margin: 0 }}>Eventos</h1>
            <span style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.15em" }}>D1 LIVE</span>
          </div>
          <p style={{ fontFamily: display, fontSize: 14, color: T.inkSoft, margin: "0 0 22px", maxWidth: 620 }}>
            Eventos reais do banco. Clique numa linha para ver detalhes, editar ou mover para a lixeira.
          </p>

          {view === "active" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 22 }}>
              {[
                { k: "Total", v: kpis.total, c: T.ink },
                { k: "Ao vivo", v: kpis.live, c: T.pink },
                { k: "Próximos", v: kpis.upcoming, c: "#FFD166" },
                { k: "Fotos indexadas", v: kpis.photos.toLocaleString("es-MX"), c: T.cyan },
              ].map((s, i) => (
                <div key={i} style={{ background: T.bgPaper, border: `2px solid ${T.border}`, padding: "14px 16px" }}>
                  <div style={{ fontFamily: display, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: s.c }}>{s.v}</div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>{s.k}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => { setView("active"); setShowNew(false); }} style={chip(view === "active")}>Ativos</button>
            <button onClick={() => { setView("trash"); setShowNew(false); }} style={chip(view === "trash")}>🗑 Lixeira</button>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={() => void load(view)} style={chip(false)}>↻ Atualizar</button>
              {view === "active" && (
                <button onClick={() => setShowNew((v) => !v)} style={{ ...chip(showNew), borderColor: T.cyan, color: showNew ? T.bg : T.cyan, background: showNew ? T.cyan : "transparent" }}>+ Novo evento</button>
              )}
            </div>
          </div>

          {showNew && <NewEventForm onCreated={() => { setShowNew(false); void load("active"); }} />}

          {loading && <Empty label="Carregando…" />}
          {error && !loading && <Empty label={`Erro: ${error}`} color={T.pink} />}

          {!loading && !error && (
            <div style={{ border: `2px solid ${T.border}`, background: T.bgDeep, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: display, fontSize: 13, minWidth: 760 }}>
                <thead>
                  <tr style={{ background: T.bgPaper }}>
                    {(view === "active"
                      ? ["Código", "Nome", "Modelo", "Data", "Local", "Fotos", "Fotógs", "Status", ""]
                      : ["Código", "Nome", "Excluído em", "", ""]).map((h, i) => (
                      <th key={i} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => view === "active" ? (
                    <tr key={e.id} onClick={() => setDetail(e)} style={{ borderBottom: `1px solid ${T.border}`, cursor: "pointer" }} className="fs-evt-row">
                      <td style={td}><span style={{ fontFamily: mono, fontSize: 12, color: T.cyan }}>{e.code}</span></td>
                      <td style={{ ...td, fontWeight: 600, maxWidth: 240 }}>
                        {e.featured ? <span style={{ color: "#FFD166", marginRight: 6 }}>★</span> : null}{e.name}
                      </td>
                      <td style={td}><Badge color={MODEL_COLOR[e.business_model] ?? T.inkMute} label={e.business_model} /></td>
                      <td style={{ ...td, fontFamily: mono, fontSize: 12, color: T.inkSoft, whiteSpace: "nowrap" }}>{fmtDate(e.start_at)}</td>
                      <td style={{ ...td, color: T.inkSoft, fontSize: 12 }}>{e.city || "—"}</td>
                      <td style={{ ...td, fontFamily: mono, fontWeight: 700 }}>{(e.photo_count || 0).toLocaleString("es-MX")}</td>
                      <td style={{ ...td, fontFamily: mono, color: e.photographer_count ? T.ink : T.inkMute }}>{e.photographer_count || 0}</td>
                      <td style={td}><Badge color={STATUS_COLOR[e.status] ?? T.inkMute} label={e.status} /></td>
                      <td style={td}><span style={{ color: T.inkMute, fontSize: 16 }}>›</span></td>
                    </tr>
                  ) : (
                    <tr key={e.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={td}><span style={{ fontFamily: mono, fontSize: 12, color: T.inkSoft }}>{e.code}</span></td>
                      <td style={{ ...td, fontWeight: 600 }}>{e.name}</td>
                      <td style={{ ...td, fontFamily: mono, fontSize: 12, color: T.inkMute }}>{e.deleted_at ? fmtDate(e.deleted_at) : "—"}</td>
                      <td style={td}><button onClick={() => restore(e.id)} style={{ ...chip(false), borderColor: T.cyan, color: T.cyan }}>↩ Restaurar</button></td>
                      <td style={td}><button onClick={() => setDel({ ev: e, mode: "permanent" })} style={{ ...chip(false), borderColor: T.pink, color: T.pink }}>Apagar de vez</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {events.length === 0 && <Empty label={view === "trash" ? "Lixeira vazia." : "Nenhum evento."} />}
            </div>
          )}
        </div>
      </div>

      {detail && (
        <EventDrawer
          ev={detail}
          onClose={() => setDetail(null)}
          onPatch={patch}
          onCountChange={(id, n) => {
            setEvents((evs) => evs.map((e) => e.id === id ? { ...e, photographer_count: n } : e));
            setDetail((d) => d && d.id === id ? { ...d, photographer_count: n } : d);
          }}
          onTrash={() => setDel({ ev: detail, mode: "trash" })}
        />
      )}

      {del && (
        <ConfirmDeleteModal
          ev={del.ev}
          mode={del.mode}
          onCancel={() => setDel(null)}
          onConfirm={() => { doDelete(del.ev, del.mode); setDel(null); }}
        />
      )}
    </AdminShell>
  );
}

// ─── Detail drawer ─────────────────────────────────────────────────────────

function EventDrawer({ ev, onClose, onPatch, onCountChange, onTrash }: {
  ev: EventRow;
  onClose: () => void;
  onPatch: (id: string, fields: Record<string, unknown>) => void;
  onCountChange: (id: string, n: number) => void;
  onTrash: () => void;
}) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(460px, 92vw)", height: "100%", background: T.bgDeep, borderLeft: `2px solid ${T.border}`, overflowY: "auto", padding: 0 }}>
        <div style={{ height: 6, background: ev.cover_color || T.purple }} />
        <div style={{ padding: "24px 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 12, color: T.cyan, letterSpacing: "0.08em" }}>{ev.code}</div>
              <h2 style={{ fontFamily: display, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: T.ink, margin: "6px 0 0" }}>{ev.name}</h2>
            </div>
            <button onClick={onClose} aria-label="fechar" style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.inkSoft, cursor: "pointer", padding: "6px 10px", fontFamily: mono }}>✕</button>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0" }}>
            <Badge color={STATUS_COLOR[ev.status] ?? T.inkMute} label={ev.status} />
            <Badge color={MODEL_COLOR[ev.business_model] ?? T.inkMute} label={ev.business_model} />
            <Badge color={T.inkSoft} label={ev.category} />
          </div>

          <Row k="Data" v={fmtDate(ev.start_at)} />
          <Row k="Local" v={ev.venue || "—"} />
          <Row k="Cidade" v={`${ev.city || "—"}${ev.country ? " · " + ev.country : ""}`} />
          <Row k="Fotos indexadas" v={(ev.photo_count || 0).toLocaleString("es-MX")} />

          {/* Quick edit */}
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${T.border}` }}>
            <Label>Editar</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <Field label="Status">
                <select value={ev.status} onChange={(e) => onPatch(ev.id, { status: e.target.value })} style={sel}>
                  {STATUSES.map((s) => <option key={s} value={s} style={opt}>{s}</option>)}
                </select>
              </Field>
              <Field label="Modelo">
                <select value={ev.business_model} onChange={(e) => onPatch(ev.id, { business_model: e.target.value })} style={sel}>
                  {MODELS.map((m) => <option key={m} value={m} style={opt}>{m}</option>)}
                </select>
              </Field>
            </div>
            <button onClick={() => onPatch(ev.id, { featured: ev.featured ? 0 : 1 })}
              style={{ ...chip(false), marginTop: 12, borderColor: ev.featured ? "#FFD166" : T.border, color: ev.featured ? "#FFD166" : T.inkSoft }}>
              {ev.featured ? "★ Em destaque" : "☆ Destacar"}
            </button>
          </div>

          {/* Operacional & financeiro */}
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${T.border}` }}>
            <Label>Operacional & financeiro</Label>
            <div style={{ marginTop: 10 }}>
              <Row k="Modelo de negócio" v={ev.business_model} />
              <Row k="Fotos indexadas" v={(ev.photo_count || 0).toLocaleString("es-MX")} />
              <Row k="Fotógrafos atribuídos" v={String(ev.photographer_count || 0)} />
              {ev.business_model === "sponsored" && (
                <Row k="Cachê de patrocínio" v={ev.sponsor_fee_cents != null ? `$${Math.round(ev.sponsor_fee_cents / 100).toLocaleString("es-MX")}` : "a definir"} />
              )}
              <Row k="Receita estimada" v="— (pedidos ainda não no D1)" />
              <Row k="Comissão paga" v="— (pendente vendas)" />
            </div>
            <div style={{ fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.04em", marginTop: 8, lineHeight: 1.5 }}>
              Receita/vendas aparecem quando o checkout gravar pedidos no D1. Aí também entra o split de comissão por fotógrafo (tier de cada um abaixo).
            </div>
          </div>

          {/* Photographers — the event↔photographer relationship lives here */}
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${T.border}` }}>
            <EventPhotographers eventId={ev.id} onCountChange={(n) => onCountChange(ev.id, n)} />
          </div>

          {/* Danger zone */}
          <div style={{ marginTop: 26, paddingTop: 18, borderTop: `1px solid ${T.border}` }}>
            <button onClick={onTrash} style={{ background: "transparent", border: `1.5px solid ${T.pink}`, color: T.pink, cursor: "pointer", padding: "10px 16px", fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Mover para a lixeira
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Event ↔ Photographer assignments (inside the drawer) ────────────────────

interface Assignment {
  id: string; tier: string; commission_rate: number;
  photographer_id: string; name: string | null; email: string; city: string | null;
}
interface RosterItem { id: string; name: string | null; email: string; city: string | null; }
const TIERS = ["standard", "pro", "vip"];

function EventPhotographers({ eventId, onCountChange }: { eventId: string; onCountChange: (n: number) => void }) {
  const [rows, setRows] = useState<Assignment[]>([]);
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState(false);
  const [pickId, setPickId] = useState("");
  const [pickTier, setPickTier] = useState("standard");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/fansnap/api/admin/event-photographers?eventId=${encodeURIComponent(eventId)}`, { cache: "no-store" });
      const j = await r.json();
      setRows(j.assignments ?? []);
      onCountChange((j.assignments ?? []).length);
    } catch { /* keep prior */ } finally { setLoading(false); }
  }, [eventId, onCountChange]);
  useEffect(() => { void load(); }, [load]);

  const openPicker = async () => {
    setPicking(true); setMsg(null);
    try {
      const r = await fetch("/fansnap/api/admin/photographers", { cache: "no-store" });
      const j = await r.json();
      setRoster(j.photographers ?? []);
    } catch { setRoster([]); }
  };

  const assign = async () => {
    if (!pickId) { setMsg("Escolha um fotógrafo."); return; }
    setMsg(null);
    try {
      const r = await fetch("/fansnap/api/admin/event-photographers", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, photographerId: pickId, tier: pickTier }),
      });
      const j = await r.json();
      if (!r.ok) { setMsg(j?.error ?? "Erro"); return; }
      setPicking(false); setPickId("");
      void load();
    } catch { setMsg("Erro de rede"); }
  };

  const changeTier = async (id: string, tier: string) => {
    setRows((rs) => rs.map((a) => a.id === id ? { ...a, tier } : a));
    try {
      const r = await fetch("/fansnap/api/admin/event-photographers", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, tier }),
      });
      if (!r.ok) throw new Error();
      notify("Tier atualizado");
    } catch { notify("Erro ao atualizar tier — recarregando", "error"); void load(); }
  };

  const unassign = async (id: string) => {
    const next = rows.filter((a) => a.id !== id);
    setRows(next);
    onCountChange(next.length);
    try {
      const r = await fetch(`/fansnap/api/admin/event-photographers?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      notify("Fotógrafo desatribuído");
    } catch { notify("Erro ao desatribuir — recarregando", "error"); void load(); }
  };

  const assignedIds = new Set(rows.map((a) => a.photographer_id));
  const available = roster.filter((p) => !assignedIds.has(p.id));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <Label>Fotógrafos atribuídos · {rows.length}</Label>
        {!picking && <button onClick={openPicker} style={{ ...chip(false), borderColor: T.cyan, color: T.cyan }}>+ Atribuir</button>}
      </div>

      {picking && (
        <div style={{ border: `2px solid ${T.cyan}`, padding: 12, marginBottom: 12 }}>
          {available.length === 0 ? (
            <div style={{ fontFamily: display, fontSize: 13, color: T.inkSoft, lineHeight: 1.5 }}>
              Nenhum fotógrafo disponível no roster. Aprove candidaturas em <span style={{ color: T.cyan }}>Solicitudes</span> ou adicione em <span style={{ color: T.cyan }}>Fotógrafos</span>.
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <select value={pickId} onChange={(e) => setPickId(e.target.value)} style={{ ...sel, flex: 2, minWidth: 160 }}>
                <option value="" style={opt}>Escolher fotógrafo…</option>
                {available.map((p) => <option key={p.id} value={p.id} style={opt}>{p.name || p.email}{p.city ? ` · ${p.city}` : ""}</option>)}
              </select>
              <select value={pickTier} onChange={(e) => setPickTier(e.target.value)} style={{ ...sel, flex: 1, minWidth: 100 }}>
                {TIERS.map((t) => <option key={t} value={t} style={opt}>{t}</option>)}
              </select>
              <button onClick={assign} style={{ background: T.cyan, color: T.bg, border: "none", padding: "8px 14px", fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}>OK</button>
              <button onClick={() => { setPicking(false); setMsg(null); }} style={chip(false)}>Cancelar</button>
            </div>
          )}
          {msg && <div style={{ fontFamily: mono, fontSize: 12, color: T.pink, marginTop: 8 }}>{msg}</div>}
        </div>
      )}

      {loading ? (
        <div style={{ fontFamily: mono, fontSize: 12, color: T.inkMute }}>Carregando…</div>
      ) : rows.length === 0 ? (
        <div style={{ border: `2px dashed ${T.border}`, padding: "14px", fontFamily: display, fontSize: 13, color: T.inkSoft }}>
          Nenhum fotógrafo atribuído ainda.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${T.border}`, padding: "10px 12px", background: T.bg }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: display, fontSize: 14, fontWeight: 600, color: T.ink }}>{a.name || a.email}</div>
                <div style={{ fontFamily: mono, fontSize: 11, color: T.inkMute }}>{a.email}{a.city ? ` · ${a.city}` : ""}</div>
              </div>
              <select value={a.tier} onChange={(e) => changeTier(a.id, e.target.value)} style={pill(T.purple)}>
                {TIERS.map((t) => <option key={t} value={t} style={opt}>{t}</option>)}
              </select>
              <span style={{ fontFamily: mono, fontSize: 11, color: T.inkSoft }}>{Math.round((a.commission_rate || 0) * 100)}%</span>
              <button onClick={() => unassign(a.id)} aria-label="remover" style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.inkMute, cursor: "pointer", padding: "4px 8px", fontFamily: mono, fontSize: 11 }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Type-DELETE confirmation modal ──────────────────────────────────────────

function ConfirmDeleteModal({ ev, mode, onConfirm, onCancel }: {
  ev: EventRow; mode: "trash" | "permanent"; onConfirm: () => void; onCancel: () => void;
}) {
  const [txt, setTxt] = useState("");
  const ok = txt.trim().toUpperCase() === "DELETE";
  const permanent = mode === "permanent";
  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(440px, 94vw)", background: T.bgPaper, border: `2px solid ${T.pink}`, padding: 26 }}>
        <div style={{ fontFamily: display, fontSize: 20, fontWeight: 700, color: T.ink, letterSpacing: "-0.02em" }}>
          {permanent ? "Apagar definitivamente?" : "Mover para a lixeira?"}
        </div>
        <p style={{ fontFamily: display, fontSize: 14, color: T.inkSoft, lineHeight: 1.5, margin: "10px 0 18px" }}>
          {permanent
            ? <>O evento <b style={{ color: T.ink }}>{ev.name}</b> será apagado para sempre. Não tem como desfazer.</>
            : <>O evento <b style={{ color: T.ink }}>{ev.name}</b> vai para a lixeira. Você pode restaurar depois.</>}
        </p>
        <div style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
          Digite <b style={{ color: T.pink }}>DELETE</b> para confirmar
        </div>
        <input autoFocus value={txt} onChange={(e) => setTxt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && ok) onConfirm(); }}
          placeholder="DELETE"
          style={{ width: "100%", background: T.bg, border: `1.5px solid ${ok ? T.pink : T.border}`, color: T.ink, padding: "12px 14px", fontFamily: mono, fontSize: 14, letterSpacing: "0.1em", outline: "none" }} />
        <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={chip(false)}>Cancelar</button>
          <button onClick={onConfirm} disabled={!ok}
            style={{ background: ok ? T.pink : "transparent", color: ok ? "#fff" : T.inkMute, border: `1.5px solid ${ok ? T.pink : T.border}`, padding: "8px 18px", fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: ok ? "pointer" : "not-allowed" }}>
            {permanent ? "Apagar de vez" : "Mover p/ lixeira"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── New event form ──────────────────────────────────────────────────────────

function NewEventForm({ onCreated }: { onCreated: () => void }) {
  const [f, setF] = useState({ code: "", name: "", business_model: "official", category: "music", venue: "", city: "CDMX", country: "MX", start_at: "", status: "upcoming", cover_color: "#9D4EFF" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setErr(null);
    if (!f.code || !f.name || !f.start_at) { setErr("Código, nome e data são obrigatórios."); return; }
    setBusy(true);
    try {
      const r = await fetch("/fansnap/api/admin/events", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, start_at: `${f.start_at}T20:00:00Z` }),
      });
      const j = await r.json();
      if (!r.ok) { setErr(j?.error ?? "Erro"); setBusy(false); return; }
      onCreated();
    } catch { setErr("Erro de rede"); setBusy(false); }
  };

  const inp: React.CSSProperties = { background: T.bg, border: `1px solid ${T.border}`, color: T.ink, padding: "8px 10px", fontFamily: display, fontSize: 13, borderRadius: 4, outline: "none" };
  return (
    <div style={{ border: `2px solid ${T.cyan}`, background: T.bgPaper, padding: 18, marginBottom: 18 }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: T.cyan, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>Novo evento</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
        <input style={inp} placeholder="Código (ex: TOUR-01)" value={f.code} onChange={(e) => set("code", e.target.value)} />
        <input style={{ ...inp, gridColumn: "span 2" }} placeholder="Nome do evento" value={f.name} onChange={(e) => set("name", e.target.value)} />
        <input style={inp} type="date" value={f.start_at} onChange={(e) => set("start_at", e.target.value)} />
        <input style={inp} placeholder="Local / venue" value={f.venue} onChange={(e) => set("venue", e.target.value)} />
        <input style={inp} placeholder="Cidade" value={f.city} onChange={(e) => set("city", e.target.value)} />
        <select style={inp} value={f.business_model} onChange={(e) => set("business_model", e.target.value)}>{MODELS.map((m) => <option key={m} value={m} style={opt}>{m}</option>)}</select>
        <select style={inp} value={f.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIES.map((m) => <option key={m} value={m} style={opt}>{m}</option>)}</select>
        <select style={inp} value={f.status} onChange={(e) => set("status", e.target.value)}>{STATUSES.map((m) => <option key={m} value={m} style={opt}>{m}</option>)}</select>
      </div>
      {err && <div style={{ fontFamily: mono, fontSize: 12, color: T.pink, marginTop: 10 }}>{err}</div>}
      <div style={{ marginTop: 14 }}>
        <button onClick={submit} disabled={busy} style={{ background: T.cyan, color: T.bg, border: "none", padding: "10px 18px", fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1 }}>
          {busy ? "Criando…" : "Criar evento"}
        </button>
      </div>
    </div>
  );
}

// ─── Bits ────────────────────────────────────────────────────────────────────

// Badge/Empty come from ./_kit (audit Lote B dedup). This file keeps its own
// Row (divider style) and fmtDate (UTC-pinned for date-only event strings).
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.08em", textTransform: "uppercase" }}>{k}</span>
      <span style={{ fontFamily: display, fontSize: 14, color: T.ink, textAlign: "right" }}>{v}</span>
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.12em", textTransform: "uppercase" }}>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontFamily: mono, fontSize: 10, color: T.inkMute, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
      {children}
    </label>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: "11px 12px", fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute, letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `2px solid ${T.border}`, whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "12px 12px", color: T.ink, verticalAlign: "middle" };
const opt: React.CSSProperties = { background: "#15151D", color: "#F4F4F2" };
const sel: React.CSSProperties = { background: T.bg, border: `1px solid ${T.border}`, color: T.ink, padding: "8px 10px", fontFamily: display, fontSize: 13, borderRadius: 4, outline: "none", width: "100%" };

function chip(active: boolean): React.CSSProperties {
  return { background: active ? T.ink : "transparent", color: active ? T.bg : T.inkSoft, border: `1.5px solid ${active ? T.ink : T.border}`, padding: "6px 12px", fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", borderRadius: 0 };
}
function pill(color: string): React.CSSProperties {
  return { background: T.bg, color, border: `1.5px solid ${color}`, fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "5px 7px", cursor: "pointer", outline: "none" };
}
