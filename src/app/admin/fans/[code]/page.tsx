// FanSnap · Admin · Fan Detail route → /fansnap/admin/fans/<code>

import type { Metadata } from "next";
import FanDetail from "@/components/admin/FanDetail";

export const metadata: Metadata = {
  title: "FanSnap · Admin · Fan",
  description: "FanSnap admin — fan profile, scan log, purchases, LFPDPPP consent.",
  robots: { index: false, follow: false },
};

export default async function FanDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <FanDetail code={code} />;
}
