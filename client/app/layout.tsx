import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { AuthInitializer } from "@/components/provider/auth";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "VoiceAgentSaaS",
  description: "MutliAgent AI Voice System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <AuthInitializer>{children}</AuthInitializer>
      </body>
    </html>
  );
}
