import type { Metadata } from "next";
import { Barlow, Saira_Condensed, Share_Tech_Mono } from "next/font/google";
import { type ReactNode } from "react";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SITE_CONFIG } from "@/constants/site";
import { cn } from "@/lib/utils/cn";

import "./globals.css";

// Body: legible DIN-like sans. Display: condensed military headings. HUD: counters.
const fontBody = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const fontDisplay = Saira_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});
const fontHud = Share_Tech_Mono({ variable: "--font-hud", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: { default: SITE_CONFIG.name, template: `%s | ${SITE_CONFIG.name}` },
  description: SITE_CONFIG.description,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // next-themes sets the theme class on <html> before hydration.
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        fontBody.variable,
        fontDisplay.variable,
        fontHud.variable,
        "h-full antialiased",
      )}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
