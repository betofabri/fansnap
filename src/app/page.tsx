// Root page — Fatia 1 mounts the whole prototype as a single client app.
// As Fatia 2 lands (real events, auth, checkout) this splits into proper
// per-route pages: /event/[code], /event/[code]/scan, /gallery/[id], etc.
import FanSnapApp from "@/components/FanSnapApp";
import ComingSoon from "@/components/ComingSoon";
import { siteVisible } from "@/lib/gate";

export default async function Page() {
  if (!(await siteVisible())) return <ComingSoon />;
  return <FanSnapApp />;
}
