import type { Metadata } from "next";
import { Inter, Permanent_Marker } from "next/font/google";
import HtmlLangSync from "@/components/HtmlLangSync";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  variable: "--font-permanent-marker",
  weight: "400",
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
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${permanentMarker.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <HtmlLangSync />
        {children}
      </body>
    </html>
  );
}
