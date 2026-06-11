import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProvidersWrapper } from "@/components/layout/providers-wrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "CarbonVerse AI - Sustainability Platform",
  description: "Track, reduce, and offset your carbon footprint with AI-powered insights",
  keywords: ["carbon footprint", "sustainability", "green", "environment", "carbon tracking"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ProvidersWrapper>{children}</ProvidersWrapper>
      </body>
    </html>
  );
}
