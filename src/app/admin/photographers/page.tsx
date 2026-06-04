// FanSnap · Admin · Photographers Roster route.
// Lives at /fansnap/admin/photographers (basePath in next.config.ts).

import type { Metadata } from "next";
import PhotographersRoster from "@/components/admin/PhotographersRoster";

export const metadata: Metadata = {
  title: "FanSnap · Admin · Photographers",
  description: "FanSnap admin — photographer roster, FanSnap score, commission editor.",
  robots: { index: false, follow: false },
};

export default function PhotographersRosterPage() {
  return <PhotographersRoster />;
}
