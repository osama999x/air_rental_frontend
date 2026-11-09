import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { MotionRoot } from "@/components/motion/motion-root";
import { ThemeProvider } from "@/components/theme/theme-toggle";
import { site } from "@/config/site";
import { parseTheme, themeCookie, type ThemeChoice } from "@/lib/theme";
import "./globals.css";

export const instant = false;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function themeChoice(): Promise<ThemeChoice> {
  return parseTheme((await cookies()).get(themeCookie)?.value);
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: site.name,
      template: `%s · ${site.name}`,
    },
    description: site.description,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const choice = await themeChoice();
  return {
    themeColor: choice === "dark" ? "#0b1426" : "#f4f7fb",
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const choice = await themeChoice();
  return (
    <html
      lang="en"
      data-theme={choice}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <div className="ambient-glow" aria-hidden="true">
          <span />
          <span />
        </div>
        <ThemeProvider initial={choice}>
          <MotionRoot>{children}</MotionRoot>
        </ThemeProvider>
      </body>
    </html>
  );
}
