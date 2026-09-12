import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "./NavBar";
import { getSetting } from "@/lib/queries";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Skeen Eggs",
  description: "Inventory, invoicing & accounting for Skeen Eggs",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Skeen Eggs",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#b45309",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [fontSize, appLogo] = await Promise.all([getSetting("font_size"), getSetting("app_logo")]);
  const sizeMap: Record<string, string> = {
    small: "16px",
    default: "18px",
    large: "20px",
    xlarge: "22px",
  };
  const base = sizeMap[fontSize] || "16px";
  const icon = appLogo || "/apple-touch-icon.png";

  return (
    <html lang="en" style={{ fontSize: base }}>
      <head>
        <link rel="apple-touch-icon" href={icon} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex`}>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            var swReloaded = false;
            navigator.serviceWorker.getRegistrations().then(function (regs) {
              var pending = regs.map(function (r) { return r.unregister(); });
              Promise.all(pending).then(function () {
                if (navigator.serviceWorker.controller && !swReloaded) {
                  swReloaded = true;
                  window.location.reload();
                }
              });
            });
          }
        `}} />
        <NavBar />
        <main className="app-main flex-1 min-h-screen safe-top">
          <div className="max-w-5xl mx-auto px-5 py-6 md:px-10 md:py-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
