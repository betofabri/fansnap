// FanSnap · Public event page — /fansnap/eventos/<code>.
//
// SSR / statically-prerendered detail page for each event so individual
// events are linkable + indexable (share a specific concert, SEO). The
// "Encuentra tus fotos" CTA hands the fan to the SPA via /fansnap?event=CODE,
// where FanSnapApp resolves the code and jumps into the face-match flow.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EVENTS } from "@/lib/mock";
import EventDetail from "@/components/EventDetail";
import ComingSoon from "@/components/ComingSoon";
import { siteVisible } from "@/lib/gate";

// Gated by the preview cookie (siteVisible), same as the rest of the site, so
// preview holders can open events pre-launch. Reading the cookie makes this
// dynamic — so no generateStaticParams pre-launch. When SITE_LIVE flips true,
// siteVisible() returns true for everyone and these render for the public
// (edge-cached via s-maxage); restore generateStaticParams then if SSG matters.
export const dynamic = "force-dynamic";

function findEvent(code: string) {
  return EVENTS.find((e) => e.code.toLowerCase() === code.toLowerCase());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const event = findEvent(code);
  if (!event) {
    return { title: "Evento no encontrado · FanSnap" };
  }
  const title = `${event.name} · FanSnap México`;
  const description = `Encuentra tus fotos de ${event.name} en ${event.venue}, ${event.city}. Reconocimiento facial — busca gratis, paga solo por lo que quieras.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_MX",
      images: [{ url: event.imageHero }],
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const event = findEvent(code);
  if (!event) notFound();
  if (!(await siteVisible())) return <ComingSoon />;
  return <EventDetail event={event} />;
}
