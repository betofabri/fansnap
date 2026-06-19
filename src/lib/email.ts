// Transactional email via Cloudflare Email Sending (Workers `send_email`
// binding, exposed as env.EMAIL). Everything here degrades gracefully: if the
// binding is absent or the domain isn't onboarded yet, sendEmail() logs and
// returns false — it NEVER throws into the request path, so a form submit
// always succeeds even while email is still being provisioned.
//
// To actually deliver mail, betofabri.com must be onboarded to Email Sending
// (`wrangler email sending enable betofabri.com` + DNS verification). Until
// then these calls no-op. See db.ts for the same getCloudflareContext pattern.

import { getCloudflareContext } from "@opennextjs/cloudflare";

interface EmailMessage {
  to: string;
  from: { email: string; name: string };
  subject: string;
  html: string;
  text: string;
}
interface EmailBinding {
  send(msg: EmailMessage): Promise<unknown>;
}

// Sender must live on an onboarded domain. Change if a different from-address
// is preferred once the domain is verified.
const FROM = { email: "roster@betofabri.com", name: "FanSnap México" };

export async function sendEmail(args: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const binding = (env as Record<string, unknown>).EMAIL as EmailBinding | undefined;
    if (!binding) {
      console.warn("[email] no EMAIL binding yet — skipping send to", args.to);
      return false;
    }
    await binding.send({
      from: FROM,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
    return true;
  } catch (err) {
    // Domain not onboarded, invalid recipient, quota, etc. Don't surface to the
    // user — the application/lead is already persisted in D1.
    console.error("[email] send failed", err);
    return false;
  }
}

// ─── Templates ───────────────────────────────────────────────────────────

const SHELL = (inner: string) => `<!doctype html><html><body style="margin:0;background:#000;color:#F4F4F2;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:40px 28px;">
  <div style="font-size:24px;font-weight:800;letter-spacing:-0.02em;margin-bottom:28px;">fan<span style="color:#00E5FF;">Snap</span></div>
  ${inner}
  <div style="margin-top:36px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.12);font-size:11px;color:#5C5C58;letter-spacing:0.06em;text-transform:uppercase;">
    FanSnap México · OCESA × Omelete Company
  </div>
</div></body></html>`;

export function applicationConfirmationEmail(opts: { name: string; code: string }): { subject: string; html: string; text: string } {
  const firstName = opts.name.trim().split(/\s+/)[0] || opts.name;
  const subject = `Recibimos tu aplicación · ${opts.code}`;
  const html = SHELL(`
    <h1 style="font-size:28px;font-weight:800;letter-spacing:-0.03em;line-height:1.1;margin:0 0 16px;">
      Gracias, ${firstName}.
    </h1>
    <p style="font-size:16px;line-height:1.55;color:#A8A8A4;margin:0 0 24px;">
      Recibimos tu aplicación al roster oficial de fotógrafos de FanSnap México.
      La revisamos y te respondemos en hasta 48 horas.
    </p>
    <div style="display:inline-block;padding:14px 22px;border:1px solid #00E5FF;color:#00E5FF;font-family:monospace;font-size:18px;font-weight:700;letter-spacing:0.1em;">
      ${opts.code}
    </div>
    <p style="font-size:13px;line-height:1.55;color:#5C5C58;margin:24px 0 0;">
      Guarda este código de seguimiento. Si no fuiste tú, puedes ignorar este correo.
    </p>
  `);
  const text = `Gracias, ${firstName}.

Recibimos tu aplicación al roster oficial de fotógrafos de FanSnap México. La revisamos y te respondemos en hasta 48 horas.

Código de seguimiento: ${opts.code}

Guarda este código. Si no fuiste tú, ignora este correo.

— FanSnap México · OCESA × Omelete Company`;
  return { subject, html, text };
}
