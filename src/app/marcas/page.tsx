import type { Metadata } from "next";
import MarcasLanding from "@/components/MarcasLanding";
import ComingSoon from "@/components/ComingSoon";
import { siteVisible } from "@/lib/gate";

export const metadata: Metadata = {
  title: "Para marcas · FanSnap México",
  description:
    "Llega a los fans con sus propias fotos. FanSnap conecta marcas con audiencias vivas de Ocesa y Omelete Company en México — patrocinios, activaciones, datos y leads sobre cada momento del evento.",
  openGraph: {
    title: "Para marcas · FanSnap México",
    description: "Reach. Recall. Recovery. Activaciones de marca sobre las fotos del evento.",
    type: "website",
    locale: "es_MX",
  },
};

export default async function Page() {
  if (!(await siteVisible())) return <ComingSoon />;
  return <MarcasLanding />;
}
