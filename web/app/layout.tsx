import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "../components/provider/theme-provider";
import SessionProvider from "../components/provider/session-provider";
import { PricingPlanProvider } from "../components/provider/pricing-plan-provider";
import AiChatWidget from "@/components/shared/ai-chat-widget";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Binboi | Self-Hosted Tunnels",
  description: "A self-hosted HTTP tunnel control plane with a Go relay, CLI agent, and dashboard.",
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
        "selection:text-white selection:bg-red-700",
        spaceGrotesk.variable,
        spaceMono.variable
      )}
    >
      <head />
      <body className={cn("min-h-screen bg-[#000000] text-white antialiased font-sans")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <SessionProvider>
            <PricingPlanProvider>
              {children}
              <AiChatWidget />
            </PricingPlanProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}