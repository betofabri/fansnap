import type { Metadata } from "next";
import AplicaLanding from "@/components/AplicaLanding";

export const metadata: Metadata = {
  title: "Roster oficial · FanSnap México",
  description:
    "Captura lo que nadie olvida. Aplica al roster oficial de fotógrafos de FanSnap México y cubre conciertos, convenciones, deportes y fiestas.",
  openGraph: {
    title: "Roster oficial · FanSnap México",
    description: "Aplica al roster de fotógrafos de FanSnap México.",
    type: "website",
    locale: "es_MX",
  },
  // Discourage indexing of an unannounced pre-registration page for now.
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AplicaLanding />;
}
