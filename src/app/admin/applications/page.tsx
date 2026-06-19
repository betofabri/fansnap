// FanSnap · Admin · Applications review queue.
// Lives at /fansnap/admin/applications. Reads the D1 intake tables wired in
// Fatia 3 (photographer_applications, photographer_referrals, brand_leads).
//
// ⚠️ Must sit behind Cloudflare Access before launch — see the API route note.

import type { Metadata } from "next";
import ApplicationsQueue from "@/components/admin/ApplicationsQueue";

export const metadata: Metadata = {
  title: "FanSnap · Admin · Applications",
  description: "FanSnap admin — review photographer applications, referrals and brand leads.",
  robots: { index: false, follow: false },
};

export default function ApplicationsPage() {
  return <ApplicationsQueue />;
}
