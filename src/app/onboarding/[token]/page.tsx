// Photographer onboarding — opened from the tokenized link sent on approval.
// Public (token-gated), reachable even pre-launch so approved photographers
// can complete their roster profile before the site opens.
import type { Metadata } from "next";
import OnboardingFlow from "@/components/OnboardingFlow";

export const metadata: Metadata = {
  title: "Completa tu alta · FanSnap México",
  robots: { index: false, follow: false },
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <OnboardingFlow token={token} />;
}
