import type { Metadata } from "next";
import FotografosLanding from "@/components/FotografosLanding";
import ComingSoon from "@/components/ComingSoon";
import { siteVisible } from "@/lib/gate";

export const metadata: Metadata = {
  title: "Fotógrafos · FanSnap México",
  description:
    "Captura. Sube. Cobra. Únete al roster oficial de fotógrafos de FanSnap México. Cubre conciertos, convenciones y festivales — nosotros vendemos tus fotos a los fans con reconocimiento facial.",
  openGraph: {
    title: "Fotógrafos · FanSnap México",
    description: "Captura. Sube. Cobra. Aplica al roster oficial.",
    type: "website",
    locale: "es_MX",
  },
};

export default async function Page() {
  if (!(await siteVisible())) return <ComingSoon />;
  return <FotografosLanding />;
}
