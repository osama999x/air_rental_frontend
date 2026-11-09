import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { MotionRoot } from "@/components/motion/motion-root";
import { ThemeBoot } from "@/components/theme/theme-toggle";
import { site } from "@/config/site";
import "./globals.css";

const themeScript = `(function(){try{if(localStorage.getItem("air-theme")==="dark")document.documentElement.setAttribute("data-theme","dark")}catch(e){}})()`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Script id="air-theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <ThemeBoot />
        <div className="ambient-glow" aria-hidden="true">
          <span />
          <span />
        </div>
        <MotionRoot>{children}</MotionRoot>
      </body>
    </html>
  );
}
