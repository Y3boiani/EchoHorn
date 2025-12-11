import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollProgress from "@/components/shared/ScrollProgress";
import ScrollToTop from "@/components/shared/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Echohorn - Engineering the Quiet in the Chaos of Motion",
  description: "AI-powered platform bridging light commercial vehicle drivers and fleet owners. Creating a transparent ecosystem for fair rewards and safer roads.",
  keywords: "fleet management, AI-powered, vehicle tracking, driver rewards, logistics",
  authors: [{ name: "Echohorn" }],
  openGraph: {
    title: "Echohorn - Engineering the Quiet in the Chaos of Motion",
    description: "AI-powered platform bridging light commercial vehicle drivers and fleet owners.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScrollProgress />
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}