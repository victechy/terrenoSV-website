import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import HtmlLangSync from "@/components/HtmlLangSync";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Rounded, bold, friendly — stands in for the "terrenoSV" brand wordmark
// wherever it appears as text instead of the logo image (header, footer,
// portal/admin login screens, 404 page).
const baloo2 = Baloo_2({
  variable: "--font-baloo-2",
  weight: "800",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://terrenosv.org"),
  title: {
    default: "terrenoSV: Land & Property in El Salvador",
    template: "%s | terrenoSV",
  },
  description:
    "Browse verified land and property listings in El Salvador, convert manzanas and varas to acres, and get the guidance behind the terrenoSV app and guidebook.",
  icons: {
    icon: "/favicon.png",
    apple: "/logo-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${baloo2.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <HtmlLangSync />
        {children}
      </body>
    </html>
  );
}
