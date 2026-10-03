import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist_Mono, Inter } from "next/font/google";
import { adsConfig, site } from "@/config/site";
import { Header } from "@/components/layout/Header";
import { allToolsMenu, categoryMenus } from "@/registry/menu";
import { Footer } from "@/components/layout/Footer";
import { themeInitScript } from "@/components/layout/theme";
import { ToastProvider } from "@/components/ui/toast";
import { AnalyticsScript } from "@/lib/analytics/AnalyticsScript";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline.replace(/\.$/, "")}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { siteName: site.name, locale: site.locale, type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8fafc",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${inter.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-50 rounded-md bg-brand px-4 py-2 font-medium text-brand-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <ToastProvider>
          <Header menus={{ categories: categoryMenus(), mobile: allToolsMenu(100) }} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </ToastProvider>
        <AnalyticsScript />
        {adsConfig.enabled && (
          <Script
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.client}`}
          />
        )}
      </body>
    </html>
  );
}
