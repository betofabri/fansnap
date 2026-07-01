"use client";

// FanSnap · Admin · Applications review queue.
// Three tabs over the D1 intake tables. Fetches /api/admin/applications on
// mount; status changes PATCH back and update optimistically.

import { useEffect, useState, useCallback } from "react";
import { T, mono, display, AdminShell, GridBg, PhotographersTabs, notify } from "./_kit";

// ─── Row shapes (mirror the D1 columns we read) ─────────────────────────────

interface ApplicationRow {
  id: string; code: string; full_name: string; email: string; phone: string | null;
  city: string | null; portfolio: string | null; event_types: string | null;
  equipment: string | null; big_event_experience: number; big_event_notes: string | null;
  verification: string | null; language: string | null; status: string; created_at: string;
}
interface ReferralRow {
  id: string; code: string; referrer_email: string; referred_name: string;
  referred_contact: string; referred_portfolio: string | null; note: string | null;
  status: string; created_at: string;
}
interface LeadRow {
  id: string; code: string; company: string; full_name: string; role: string | null;
  email: string; phone: string | null; event_interest: string | null; budget: string | null;
  message: string; status: string; created_at: string;
}

type Kind = "applications" | "referrals" | "leads";

const STATUS_OPTS: Record<Kind, string[]> = {
  applications: ["new", "reviewing", "approved", "rejected", "archived"],
  referrals: ["new", "contacted", "converted", "archived"],
  leads: ["new", "contacted", "qualified", "won", "lost", "archived"],
};

const STATUS_COLOR: Record<string, string> = {
  new: T.cyan, reviewing: "#FFD166", approved: T.green, converted: T.green,
  qualified: T.green, won: T.green, contacted: "#FFD166", rejected: T.pink,
  lost: T.pink, archived: T.inkMute,
};

function fmtDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch { return iso; }
}

export default function ApplicationsQueue() {
  const [tab, setTab] = useState<Kind>("applications");
  const [data, setData] = useState<{ applications: ApplicationRow[]; referrals: ReferralRow[]; leads: LeadRow[] }>({ applications: [], referrals: [], leads: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/fansnap/api/admin/applications", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error ?? "Error");
      setData({ applications: j.applications ?? [], referrals: j.referrals ?? [], leads: j.leads ?? [] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateStatus = useCallback(async (kind: Kind, id: string, status: string) => {
    // optimistic
    setData((d) => ({
      ...d,
      [kind]: (d[kind] as Array<{ id: string; status: string }>).map((row) =>
        row.id === id ? { ...row, status } : row,
      ),
    }));
    try {
      const r = await fetch("/fansnap/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id, status }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error();
      if ((j as { promoted?: boolean }).promoted) {
        notify("Aprovado — fotógrafo no roster, link de alta gerado (válido 7 dias)");
      } else {
        notify("Status atualizado");
      }
    } catch {
      notify("Erro ao atualizar — recarregando", "error");
      void load(); // resync on failure
    }
  }, [load]);

  const counts = {
    applications: data.applications.length,
    referrals: data.referrals.length,
    leads: data.leads.length,
  };
  const newCount = (rows: Array<{ status: string }>) => rows.filter((r) => r.status === "new").length;

  return (
    <AdminShell currentNav="nav-photographers" breadcrumb="PHOTOGRAPHERS / SOLICITUDES">
      <div style={{ position: "relative", padding: "28px 32px 60px", flex: 1, overflow: "auto" }}>
        <GridBg />
        <div style={{ position: "relative" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14 }}>
            <h1 style={{ fontFamily: display, fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", color: T.ink, margin: 0 }}>
              Fotógrafos
            </h1>
            <span style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, letterSpacing: "0.15em" }}>
              INTAKE · D1 LIVE
            </span>
          </div>
          <PhotographersTabs active="applications" />
          <p style={{ fontFamily: display, fontSize: 14, color: T.inkSoft, margin: "18px 0 24px", maxWidth: 620 }}>
            Candidaturas de fotógrafos, indicações e leads de marcas — gravados direto no D1. Aprovar uma candidatura promove o fotógrafo ao <span style={{ color: T.cyan }}>Roster</span>.
          </p>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `2px solid ${T.border}` }}>
            {([
              ["applications", "Candidaturas", counts.applications, newCount(data.applications)],
              ["referrals", "Indicações", counts.referrals, newCount(data.referrals)],
              ["leads", "Marcas", counts.leads, newCount(data.leads)],
            ] as const).map(([key, label, total, fresh]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  padding: "12px 16px",
                  borderBottom: `2px solid ${tab === key ? T.cyan : "transparent"}`,
                  marginBottom: -2,
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: tab === key ? T.ink : T.inkSoft,
                }}
              >
                {label}
                <span style={{ fontFamily: mono, fontSize: 10, color: T.inkMute, border: `1px solid ${T.border}`, padding: "1px 6px" }}>{total}</span>
                {fresh > 0 && (
                  <span style={{ fontFamily: mono, fontSize: 10, color: T.bg, background: T.cyan, padding: "1px 6px", fontWeight: 700 }}>{fresh}</span>
                )}
              </button>
            ))}
            <button onClick={() => void load()} style={{
              marginLeft: "auto", background: "transparent", border: `2px solid ${T.border}`,
              color: T.inkSoft, cursor: "pointer", padding: "6px 14px", alignSelf: "center",
              fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            }}>↻ Atualizar</button>
          </div>

          {loading && <Empty label="Cargando…" />}
          {error && !loading && <Empty label={`Error: ${error}`} color={T.pink} />}

          {!loading && !error && (
            <>
              {tab === "applications" && (
                <Table
                  cols={["Código", "Nombre", "Contacto", "Ciudad", "Portafolio", "Equipo", "Recibido", "Estado"]}
                  rows={data.applications}
                  empty="Sin solicitudes todavía."
                  render={(a: ApplicationRow) => [
                    <Mono key="c">{a.code}</Mono>,
                    <span key="n" style={{ fontWeight: 600 }}>{a.full_name}{a.big_event_experience ? <Tag>exp</Tag> : null}</span>,
                    <Stack key="ct" main={a.email} sub={a.phone ?? ""} />,
                    a.city ?? "—",
                    <Link key="p" href={a.portfolio} />,
                    <Tags key="eq" json={a.equipment} />,
                    fmtDate(a.created_at),
                    <StatusCell key="s" kind="applications" id={a.id} status={a.status} onChange={updateStatus} />,
                  ]}
                />
              )}
              {tab === "referrals" && (
                <Table
                  cols={["Código", "Indicado", "Contacto", "Indicado por", "Nota", "Recibido", "Estado"]}
                  rows={data.referrals}
                  empty="Sin indicações todavía."
                  render={(r: ReferralRow) => [
                    <Mono key="c">{r.code}</Mono>,
                    <span key="n" style={{ fontWeight: 600 }}>{r.referred_name}</span>,
                    r.referred_contact,
                    r.referrer_email,
                    <Truncate key="nt" text={r.note ?? ""} />,
                    fmtDate(r.created_at),
                    <StatusCell key="s" kind="referrals" id={r.id} status={r.status} onChange={updateStatus} />,
                  ]}
                />
              )}
              {tab === "leads" && (
                <Table
                  cols={["Código", "Empresa", "Contacto", "Evento", "Presupuesto", "Mensaje", "Recibido", "Estado"]}
                  rows={data.leads}
                  empty="Sin leads de marcas todavía."
                  render={(l: LeadRow) => [
                    <Mono key="c">{l.code}</Mono>,
                    <Stack key="co" main={l.company} sub={l.role ?? ""} />,
                    <Stack key="ct" main={l.full_name} sub={l.email} />,
                    l.event_interest || "—",
                    l.budget || "—",
                    <Truncate key="m" text={l.message} />,
                    fmtDate(l.created_at),
                    <StatusCell key="s" kind="leads" id={l.id} status={l.status} onChange={updateStatus} />,
                  ]}
                />
              )}
            </>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

// ─── Bits ────────────────────────────────────────────────────────────────

function Table<R>({ cols, rows, render, empty }: {
  cols: string[];
  rows: R[];
  render: (row: R) => React.ReactNode[];
  empty: string;
}) {
  if (rows.length === 0) return <Empty label={empty} />;
  return (
    <div style={{ border: `2px solid ${T.border}`, overflow: "hidden", background: T.bgDeep }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: display, fontSize: 13 }}>
        <thead>
          <tr style={{ background: T.bgPaper }}>
            {cols.map((c) => (
              <th key={c} style={{
                textAlign: "left", padding: "12px 14px",
                fontFamily: mono, fontSize: 10, fontWeight: 700, color: T.inkMute,
                letterSpacing: "0.12em", textTransform: "uppercase",
                borderBottom: `2px solid ${T.border}`,
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
              {render(row).map((cell, j) => (
                <td key={j} style={{ padding: "12px 14px", color: T.ink, verticalAlign: "top" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusCell({ kind, id, status, onChange }: {
  kind: Kind; id: string; status: string;
  onChange: (kind: Kind, id: string, status: string) => void;
}) {
  const color = STATUS_COLOR[status] ?? T.inkMute;
  return (
    <select
      value={status}
      onChange={(e) => onChange(kind, id, e.target.value)}
      style={{
        background: T.bg, color, border: `1.5px solid ${color}`,
        fontFamily: mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", padding: "5px 8px", cursor: "pointer", outline: "none",
      }}
    >
      {STATUS_OPTS[kind].map((s) => (
        <option key={s} value={s} style={{ background: T.bg, color: T.ink }}>{s}</option>
      ))}
    </select>
  );
}

function Empty({ label, color = T.inkMute }: { label: string; color?: string }) {
  return (
    <div style={{
      border: `2px dashed ${T.border}`, padding: "48px 24px", textAlign: "center",
      fontFamily: mono, fontSize: 13, color, letterSpacing: "0.08em",
    }}>{label}</div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: mono, fontSize: 12, color: T.cyan, letterSpacing: "0.04em" }}>{children}</span>;
}

function Stack({ main, sub }: { main: string; sub: string }) {
  return (
    <div>
      <div style={{ fontWeight: 600 }}>{main}</div>
      {sub ? <div style={{ fontFamily: mono, fontSize: 11, color: T.inkMute, marginTop: 2 }}>{sub}</div> : null}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span style={{ marginLeft: 6, fontFamily: mono, fontSize: 9, color: T.green, border: `1px solid ${T.green}`, padding: "1px 5px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{children}</span>;
}

function Tags({ json }: { json: string | null }) {
  let arr: string[] = [];
  try { arr = json ? JSON.parse(json) : []; } catch { arr = []; }
  if (arr.length === 0) return <span style={{ color: T.inkMute }}>—</span>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 200 }}>
      {arr.map((x, i) => (
        <span key={i} style={{ fontFamily: mono, fontSize: 9, color: T.inkSoft, border: `1px solid ${T.border}`, padding: "1px 5px" }}>{x}</span>
      ))}
    </div>
  );
}

function Link({ href }: { href: string | null }) {
  if (!href) return <span style={{ color: T.inkMute }}>—</span>;
  const url = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{
      fontFamily: mono, fontSize: 11, color: T.cyan, textDecoration: "none",
      maxWidth: 160, display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    }}>{href}↗</a>
  );
}

function Truncate({ text }: { text: string }) {
  if (!text) return <span style={{ color: T.inkMute }}>—</span>;
  return (
    <span title={text} style={{
      display: "inline-block", maxWidth: 240, overflow: "hidden",
      textOverflow: "ellipsis", whiteSpace: "nowrap", color: T.inkSoft, fontSize: 12,
    }}>{text}</span>
  );
}
