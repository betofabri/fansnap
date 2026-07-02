"use client";

// OnboardingFlow — the tokenized post-approval alta. A 4-step form where the
// approved photographer fills their own account/financial data. On submit it
// completes their roster profile (the fields the admin ficha shows).
//
// UX: one step visible at a time, progress rail at top, big touch targets,
// keyboard-friendly, can't submit without consent. Matches FanSnap brutalist.

import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, Check, Loader2, ShieldCheck } from "lucide-react";
import FanSnapLogo from "@/components/FanSnapLogo";

import { DARK, FONT_GROTESK, FONT_MONO } from "@/lib/theme";

// Shared flat-black tokens (audit Lote B); the alta keeps its slightly softer
// borders / brighter panels — intentional local overrides, not drift.
const c = {
  ...DARK,
  surfaceHi: "#141414",
  border: "rgba(244,244,242,0.12)",
  borderStrong: "rgba(244,244,242,0.28)",
  accentSoft: "rgba(0,229,255,0.10)",
};

const PAYOUT_METHODS = [
  { v: "clabe", label: "Transferencia CLABE", hint: "Depósito a cuenta bancaria MX" },
  { v: "stripe", label: "Stripe Connect", hint: "Tarjeta / internacional" },
  { v: "paypal", label: "PayPal", hint: "Correo PayPal" },
];
const SPECIALTIES = ["Música en vivo", "Convenciones", "Deportes", "Fiestas", "Teatro", "Maratones"];
const EQUIPMENT = ["Cámara full-frame", "Teleobjetivo", "Flash externo", "Laptop en campo", "Drone"];

const STEPS = ["Identidad", "Pago", "Equipo", "Contrato"] as const;

interface Photog { first_name?: string; last_name?: string; name?: string; email?: string; phone?: string; city?: string; tier?: string; onboarding_status?: string; }

export default function OnboardingFlow({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [already, setAlready] = useState(false);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [f, setF] = useState({
    first_name: "", last_name: "", phone: "", city: "",
    payout_method: "clabe", payout_account: "", tax_id: "",
    specialties: [] as string[], equipment: [] as string[],
    consent: false,
  });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (k: "specialties" | "equipment", v: string) =>
    setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/fansnap/api/onboarding?token=${encodeURIComponent(token)}`, { cache: "no-store" });
        if (r.status === 404) { setNotFound(true); return; }
        const j = await r.json();
        const p: Photog = j.photographer ?? {};
        if (p.onboarding_status === "complete") setAlready(true);
        setF((prev) => ({ ...prev, first_name: p.first_name ?? "", last_name: p.last_name ?? "", phone: p.phone ?? "", city: p.city ?? "" }));
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [token]);

  const canNext = () => {
    if (step === 0) return f.first_name.trim() && f.last_name.trim() && f.phone.trim() && f.city.trim();
    if (step === 1) return f.payout_method && f.payout_account.trim() && f.tax_id.trim();
    if (step === 2) return true; // specialties/equipment optional
    if (step === 3) return f.consent;
    return false;
  };

  const submit = async () => {
    setError(null); setSubmitting(true);
    try {
      const r = await fetch("/fansnap/api/onboarding", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...f }),
      });
      const j = await r.json();
      if (!r.ok) { setError(j?.error ?? "Error"); setSubmitting(false); return; }
      setDone(true);
    } catch { setError("Error de red"); setSubmitting(false); }
  };

  return (
    <div style={{ background: c.bg, color: c.ink, minHeight: "100vh", fontFamily: FONT_GROTESK, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{globalCSS}</style>

      {/* header */}
      <div style={{ width: "100%", borderBottom: `1px solid ${c.border}`, padding: "18px clamp(20px,4vw,40px)", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 720, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <FanSnapLogo size="sm" />
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute, letterSpacing: "0.12em", textTransform: "uppercase" }}>Alta de fotógrafo</span>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 640, padding: "clamp(32px,6vw,64px) clamp(20px,4vw,40px) 80px" }}>
        {loading && <Center>Cargando…</Center>}
        {!loading && notFound && (
          <Center>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: FONT_GROTESK, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 10 }}>Enlace no válido</div>
              <p style={{ color: c.inkSoft, fontSize: 15, lineHeight: 1.5 }}>Este enlace de alta expiró o no existe. Pide uno nuevo al equipo de FanSnap.</p>
            </div>
          </Center>
        )}
        {!loading && already && !done && (
          <Center>
            <div style={{ textAlign: "center" }}>
              <ShieldCheck size={48} color={c.ok} strokeWidth={1.5} style={{ marginBottom: 16 }} />
              <div style={{ fontFamily: FONT_GROTESK, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 10 }}>Tu alta ya está completa</div>
              <p style={{ color: c.inkSoft, fontSize: 15, lineHeight: 1.5 }}>Ya tenemos tus datos. Si necesitas cambiar algo, escríbenos.</p>
            </div>
          </Center>
        )}

        {!loading && done && (
          <Center>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: c.accentSoft, border: `2px solid ${c.accent}`, display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
                <Check size={36} color={c.accent} strokeWidth={2.5} />
              </div>
              <div style={{ fontFamily: FONT_GROTESK, fontSize: "clamp(28px,5vw,40px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
                ¡Bienvenido al <span style={{ color: c.magenta }}>roster.</span></div>
              <p style={{ color: c.inkSoft, fontSize: 16, lineHeight: 1.55, maxWidth: 440, margin: "0 auto" }}>
                Tu alta está completa. Te avisaremos por email/WhatsApp cuando tengas eventos asignados para cubrir.
              </p>
            </div>
          </Center>
        )}

        {!loading && !notFound && !already && !done && (
          <>
            {/* progress rail */}
            <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ flex: 1 }}>
                  <div style={{ height: 4, background: i <= step ? c.accent : c.border, transition: "background 0.3s" }} />
                  <div style={{ marginTop: 8, fontFamily: FONT_MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: i === step ? c.ink : c.inkMute }}>{i + 1}. {s}</div>
                </div>
              ))}
            </div>

            {step === 0 && (
              <Step title="Tus datos" sub="Confirma tu identidad de contacto.">
                <Row>
                  <Field label="Nombre" value={f.first_name} onChange={(v) => set("first_name", v)} />
                  <Field label="Apellido" value={f.last_name} onChange={(v) => set("last_name", v)} />
                </Row>
                <Field label="WhatsApp" value={f.phone} onChange={(v) => set("phone", v)} placeholder="+52 55 1234 5678" />
                <Field label="Ciudad de operación" value={f.city} onChange={(v) => set("city", v)} placeholder="Ciudad de México" />
              </Step>
            )}

            {step === 1 && (
              <Step title="¿Cómo te pagamos?" sub="Tus datos de cobro. Solo el equipo de finanzas los ve.">
                <FieldLabel>Método de pago</FieldLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
                  {PAYOUT_METHODS.map((m) => {
                    const on = f.payout_method === m.v;
                    return (
                      <button key={m.v} onClick={() => set("payout_method", m.v)} style={{
                        display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                        padding: "14px 16px", cursor: "pointer",
                        background: on ? c.accentSoft : "transparent",
                        border: `1.5px solid ${on ? c.accent : c.border}`, color: c.ink,
                      }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${on ? c.accent : c.borderStrong}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                          {on && <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.accent }} />}
                        </span>
                        <span>
                          <div style={{ fontFamily: FONT_GROTESK, fontSize: 15, fontWeight: 600 }}>{m.label}</div>
                          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute, marginTop: 2 }}>{m.hint}</div>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <Field label={f.payout_method === "clabe" ? "CLABE (18 dígitos)" : f.payout_method === "paypal" ? "Correo PayPal" : "Cuenta / referencia"} value={f.payout_account} onChange={(v) => set("payout_account", v)} placeholder={f.payout_method === "clabe" ? "0123 4567 8901 2345 67" : ""} />
                <Field label="RFC" value={f.tax_id} onChange={(v) => set("tax_id", v)} placeholder="XAXX010101000" />
              </Step>
            )}

            {step === 2 && (
              <Step title="Tu trabajo" sub="Para asignarte los eventos que encajan contigo.">
                <FieldLabel>Especialidades</FieldLabel>
                <Chips options={SPECIALTIES} selected={f.specialties} onToggle={(v) => toggle("specialties", v)} />
                <div style={{ height: 18 }} />
                <FieldLabel>Equipo propio</FieldLabel>
                <Chips options={EQUIPMENT} selected={f.equipment} onToggle={(v) => toggle("equipment", v)} />
              </Step>
            )}

            {step === 3 && (
              <Step title="Casi listo" sub="Revisa y acepta para entrar al roster.">
                <div style={{ border: `1px solid ${c.border}`, background: c.surface, padding: "18px 20px", marginBottom: 18 }}>
                  <SummaryRow k="Nombre" v={`${f.first_name} ${f.last_name}`} />
                  <SummaryRow k="WhatsApp" v={f.phone} />
                  <SummaryRow k="Ciudad" v={f.city} />
                  <SummaryRow k="Pago" v={`${PAYOUT_METHODS.find((m) => m.v === f.payout_method)?.label} · ${f.payout_account}`} />
                  <SummaryRow k="RFC" v={f.tax_id} />
                  <SummaryRow k="Especialidades" v={f.specialties.join(", ") || "—"} />
                </div>
                <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", padding: "14px 16px", border: `1.5px solid ${f.consent ? c.accent : c.border}`, background: f.consent ? c.accentSoft : "transparent" }}>
                  <input type="checkbox" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} style={{ marginTop: 3, accentColor: c.accent, width: 16, height: 16 }} />
                  <span style={{ fontSize: 13, color: c.inkSoft, lineHeight: 1.5 }}>
                    Acepto los <span style={{ color: c.accent }}>términos del roster</span> de FanSnap (OCESA × Omelete Company), la política de comisiones por tier y el tratamiento de mis datos conforme a la LFPDPPP.
                  </span>
                </label>
                {error && <div style={{ marginTop: 14, padding: "12px 14px", border: `1px solid ${c.magenta}`, color: c.magenta, fontFamily: FONT_MONO, fontSize: 12 }}>{error}</div>}
              </Step>
            )}

            {/* nav */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
              <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
                style={{ ...btnGhost, opacity: step === 0 ? 0.4 : 1, cursor: step === 0 ? "default" : "pointer" }}>
                <ArrowLeft size={16} strokeWidth={2.5} /> Atrás
              </button>
              {step < 3 ? (
                <button onClick={() => canNext() && setStep((s) => s + 1)} disabled={!canNext()} style={{ ...btnPrimary, opacity: canNext() ? 1 : 0.4, cursor: canNext() ? "pointer" : "not-allowed" }} className="ob-cta">
                  Continuar <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              ) : (
                <button onClick={submit} disabled={!f.consent || submitting} style={{ ...btnPrimary, opacity: f.consent && !submitting ? 1 : 0.4, cursor: f.consent && !submitting ? "pointer" : "not-allowed" }} className="ob-cta">
                  {submitting ? <><Loader2 size={16} className="ob-spin" /> Enviando…</> : <>Completar alta <Check size={16} strokeWidth={2.5} /></>}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── bits ──
function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: 320, display: "grid", placeItems: "center", fontFamily: FONT_MONO, fontSize: 14, color: c.inkSoft }}>{children}</div>;
}
function Step({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="ob-step">
      <h1 style={{ fontFamily: FONT_GROTESK, fontSize: "clamp(28px,5vw,40px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, margin: "0 0 10px" }}>{title}</h1>
      <p style={{ color: c.inkSoft, fontSize: 15, lineHeight: 1.5, margin: "0 0 28px" }}>{sub}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="ob-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>;
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.accent, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>{children}</span>;
}
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }} className="ob-field">
      <FieldLabel>{label}</FieldLabel>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{
        background: "rgba(0,229,255,0.04)", border: `1.5px solid rgba(0,229,255,0.30)`, padding: "14px 16px",
        fontFamily: FONT_GROTESK, fontSize: 15, color: c.ink, outline: "none", width: "100%",
      }} />
    </label>
  );
}
function Chips({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button key={o} onClick={() => onToggle(o)} style={{
            padding: "9px 14px", cursor: "pointer", fontFamily: FONT_GROTESK, fontSize: 13, fontWeight: 600,
            background: on ? c.accent : "transparent", color: on ? "#000" : c.inkSoft,
            border: `1.5px solid ${on ? c.accent : c.border}`,
          }}>{o}</button>
        );
      })}
    </div>
  );
}
function SummaryRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: `1px solid ${c.border}` }}>
      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: c.inkMute, letterSpacing: "0.06em", textTransform: "uppercase" }}>{k}</span>
      <span style={{ fontSize: 14, color: c.ink, textAlign: "right" }}>{v || "—"}</span>
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8, background: c.accent, color: "#000",
  padding: "14px 24px", fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
  textTransform: "uppercase", border: "none", transition: "transform 0.15s ease, box-shadow 0.15s ease",
};
const btnGhost: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: c.inkSoft,
  padding: "14px 18px", fontFamily: FONT_MONO, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em",
  textTransform: "uppercase", border: `1.5px solid ${c.border}`,
};

const globalCSS = `
  @keyframes ob-spin { to { transform: rotate(360deg); } }
  .ob-spin { animation: ob-spin 0.8s linear infinite; }
  @keyframes ob-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .ob-step { animation: ob-in 0.28s ease-out; }
  .ob-cta:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(0,229,255,0.28); }
  .ob-field:focus-within input { border-color: ${c.accent} !important; background: rgba(0,229,255,0.08) !important; box-shadow: 0 0 0 4px ${c.accentSoft}; }
  @media (max-width: 520px) { .ob-row { grid-template-columns: 1fr !important; } }
`;
