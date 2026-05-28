import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Fatia 1: sem cache incremental — sem R2 ainda. Vai usar in-memory cache do worker.
// Fatia 2+: plugar r2IncrementalCache quando R2 estiver no scope do token.
export default defineCloudflareConfig({});
