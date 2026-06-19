import type { Metadata } from "next";
import PhotographerDashboard from "@/components/PhotographerDashboard";
import ComingSoon from "@/components/ComingSoon";
import { siteVisible } from "@/lib/gate";

export const metadata: Metadata = {
  title: "Dashboard · Fotógrafos · FanSnap México",
  description: "Tu panel de fotógrafo FanSnap — eventos asignados, subidas, ventas y pagos.",
  // Logged-in area (mock for now) — keep out of the index.
  robots: { index: false, follow: false },
};

export default async function Page() {
  if (!(await siteVisible())) return <ComingSoon />;
  return <PhotographerDashboard />;
}
