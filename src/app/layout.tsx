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
  metadataBase: new URL("https://betofabri.com"),
  title: "FanSnap — You were there. We have the proof.",
  description:
    "Facial-recognition photo platform for live events. Find yourself in thousands of photos from concerts, conventions and the moments that mattered.",
  applicationName: "FanSnap",
  authors: [{ name: "FanSnap (CCXP / Omelete Company)" }],
  keywords: ["FanSnap", "live events", "facial recognition", "concert photos", "CCXP", "Ocesa"],
  openGraph: {
    title: "FanSnap — You were there. We have the proof.",
    description: "Facial-recognition photo platform for live events. Powered by O&CO.",
    type: "website",
    locale: "en_US",
    url: "https://betofabri.com/fansnap",
    siteName: "FanSnap",
  },
  twitter: {
    card: "summary_large_image",
    title: "FanSnap — You were there. We have the proof.",
    description: "Facial-recognition photo platform for live events. Powered by O&CO.",
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
