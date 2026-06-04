// FanSnap · Admin · Photographer Detail route.
// Lives at /fansnap/admin/photographers/<code>.
// Mock data ignores the param for now — wire it up in Fatia 2 when D1 is plugged.

import type { Metadata } from "next";
import PhotographerDetail from "@/components/admin/PhotographerDetail";

export const metadata: Metadata = {
  title: "FanSnap · Admin · Photographer",
  description: "FanSnap admin — photographer profile, stats, commission, payouts.",
  robots: { index: false, follow: false },
};

export default async function PhotographerDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <PhotographerDetail code={code} />;
}
