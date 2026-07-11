import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopicsProvider } from "@/context/TopicsContext";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Trends As You Go",
  description:
    "Discover what's trending on X right now, with actionable video ideas for creators.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0a0a0a] text-white antialiased font-sans">
        <TopicsProvider>
          <div className="min-h-screen bg-[#0a0a0a]">
            <div className="mx-auto max-w-mobile min-h-screen pb-20">
              {children}
            </div>
          </div>
          <BottomNav />
        </TopicsProvider>
      </body>
    </html>
  );
}
