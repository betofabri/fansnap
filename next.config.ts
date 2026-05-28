import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 + OpenNext on Cloudflare Workers.
  // App Router only — no images.domains (deprecated in 16); use remotePatterns when needed.

  // Custom URL: betofabri.com/fansnap — Next routes are served under /fansnap.
  // (workers.dev fallback URL becomes /fansnap too — acceptable, canonical lives at betofabri.com.)
  basePath: "/fansnap",
};

export default nextConfig;

// OpenNext bootstrap for `next dev` — exposes Cloudflare bindings (env.DB, env.PHOTOS, …)
// to your code through `getCloudflareContext()` during local development.
// Production binding access is wired by the deployed worker itself.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
