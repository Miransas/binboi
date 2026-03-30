import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "../components/provider/theme-provider";
import SessionProvider from "../components/provider/session-provider";

// Binboi SEO & Meta Bilgileri
export const metadata: Metadata = {
  title: "Binboi | Neural Tunnels",
  description: "Hyper-speed introspection tunnels for the Miransas ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="selection:text-white selection:bg-red-700">
      <head />
      <body
        className={cn(
          "min-h-screen bg-[#000000] text-white antialiased font-sans",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark" // Sistemi dinleme, hep karanlık kalsın
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
