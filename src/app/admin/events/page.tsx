// FanSnap · Admin · Events route → /fansnap/admin/events

import type { Metadata } from "next";
import EventsList from "@/components/admin/EventsList";

export const metadata: Metadata = {
  title: "FanSnap · Admin · Events",
  description: "FanSnap admin — events list, filters, sales, photographer crews.",
  robots: { index: false, follow: false },
};

export default function EventsListPage() {
  return <EventsList />;
}
