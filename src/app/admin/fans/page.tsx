// FanSnap · Admin · Fans route → /fansnap/admin/fans

import type { Metadata } from "next";
import FansList from "@/components/admin/FansList";

export const metadata: Metadata = {
  title: "FanSnap · Admin · Fans",
  description: "FanSnap admin — fan roster, LFPDPPP audit, trust & safety queue.",
  robots: { index: false, follow: false },
};

export default function FansListPage() {
  return <FansList />;
}
