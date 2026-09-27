import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import FloatingChatbot from "@/components/chatbot/FloatingChatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartMumbai — Intelligent Urban Management",
  description: "Real-time smart city dashboard for Mumbai. Monitor traffic, environment, water, energy, waste & safety with AI-powered alerts and inter-department coordination.",
  keywords: ["SmartMumbai", "Smart City", "Mumbai", "Dashboard", "IoT", "Urban Management", "Bandra"],
  authors: [{ name: "SmartMumbai Team" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏙️</text></svg>",
  },
  openGraph: {
    title: "SmartMumbai Dashboard",
    description: "AI-powered urban management platform for Mumbai",
    siteName: "SmartMumbai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartMumbai Dashboard",
    description: "AI-powered urban management platform for Mumbai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <FloatingChatbot />
      </body>
    </html>
  );
}
