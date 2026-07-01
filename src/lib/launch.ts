// Launch gate.
//
// Before the public site opens, only /aplica (photographer pre-registration)
// and /admin are reachable. Every other public page renders <ComingSoon/>.
//
// ┌─ TO OPEN THE FULL SITE ──────────────────────────────────────────────┐
// │  Flip SITE_LIVE to `true` below, then `npm run deploy`.               │
// │  (It's a build-time constant — there's no runtime toggle.)            │
// └──────────────────────────────────────────────────────────────────────┘
export const SITE_LIVE = false;

// Private preview bypass. Visiting
//   /fansnap/api/preview?key=<PREVIEW_KEY>
// drops a cookie that lets THIS browser see the full site while everyone else
// still gets ComingSoon. Turn it off with /fansnap/api/preview?off=1.
//
// The key itself is a Worker secret (`wrangler secret put PREVIEW_KEY`; in dev,
// .dev.vars) — never hardcode it here: this repo is public, so a literal would
// hand the bypass to anyone. Read it via getPreviewKey() in src/lib/gate.ts.
export const PREVIEW_COOKIE = "fs_preview";
