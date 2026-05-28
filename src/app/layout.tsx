import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FanSnap — You were there. We have the proof.",
  description:
    "Facial-recognition photo platform for live events. Find yourself in thousands of photos from concerts, conventions and the moments that mattered.",
  applicationName: "FanSnap",
  authors: [{ name: "FanSnap (CCXP / Omelete Company)" }],
  keywords: ["FanSnap", "live events", "facial recognition", "concert photos", "CCXP", "Ocesa"],
  openGraph: {
    title: "FanSnap — You were there. We have the proof.",
    description: "The memory layer of live entertainment.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
