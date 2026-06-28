import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Bodoni_Moda } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const displaySerif = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Green Fashion Solution — Fashion Sourcing & Supply Chain Expertise",
  description:
    "Global fashion sourcing and supply chain expertise — from material research and supplier curation to sourcing proposals, sampling, and production delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full ",
        GeistSans.variable,
        GeistMono.variable,
        displaySerif.variable,
      )}
    >
      <body className="min-h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
