// FanSnap · Admin · Overview — Slice 0 + Slice 1 visual mockup.
// Lives at /fansnap/admin (basePath in next.config.ts is "/fansnap").
//
// No auth yet — internal-only preview to validate the visual language
// before wiring real data. Auth (Clerk, restricted email domains) lands
// before this route holds any actual data.

import type { Metadata } from "next";
import OverviewMockup from "@/components/admin/OverviewMockup";

export const metadata: Metadata = {
  title: "FanSnap · Admin · Overview",
  description: "FanSnap admin dashboard — mission control for events, photographers, sales.",
  robots: { index: false, follow: false },
};

export default function AdminOverviewPage() {
  return <OverviewMockup />;
}
