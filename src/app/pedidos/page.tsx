import type { Metadata } from "next";
import PedidosLookup from "@/components/PedidosLookup";
import ComingSoon from "@/components/ComingSoon";
import { siteVisible } from "@/lib/gate";

export const metadata: Metadata = {
  title: "Mis pedidos · FanSnap México",
  description:
    "Recupera tu pedido de FanSnap. Ingresa tu número de orden y email para ver el estado y volver a descargar tus fotos.",
  robots: { index: false, follow: false },
};

export default async function Page() {
  if (!(await siteVisible())) return <ComingSoon />;
  return <PedidosLookup />;
}
