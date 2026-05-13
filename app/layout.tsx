import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://deadstarai.vercel.app"),
  title: {
    default: "Dead Star AI - Bending AI Reasoning",
    template: "%s | Dead Star AI"
  },
  description: "Dead Star AI is an advanced multimodal reasoning engine powered by Gemma 4. Intercept, analyze, and reshape AI cognitive nodes in real-time.",
  keywords: ["AI", "Gemma 4", "Reasoning Engine", "Multimodal AI", "Dead Star", "Artificial Intelligence", "Developer Tools", "Prompt Engineering"],
  authors: [{ name: "Dead Star Team", url: "https://deadstarai.vercel.app" }],
  creator: "Dead Star Team",
  publisher: "Dead Star AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Dead Star AI - Bending AI Reasoning",
    description: "Dead Star AI is an advanced multimodal reasoning engine powered by Gemma 4. Intercept, analyze, and reshape AI cognitive nodes in real-time.",
    url: "https://deadstarai.vercel.app",
    siteName: "Dead Star AI",
    images: [
      {
        url: "/icon.svg",
        width: 800,
        height: 600,
        alt: "Dead Star AI Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dead Star AI",
    description: "Intercept, analyze, and reshape AI cognitive nodes in real-time with Gemma 4.",
    creator: "@DeadStarAI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "J1p5DIxzr2GfL6I2Ouuu-ASvS8WgjdKlIu4pqawLAHM",
    other: {
      "msvalidate.01": "0CE40AA79AE219E065CCF60DBDD27315",
    },
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased custom-scrollbar",
          inter.variable,
          outfit.variable,
          jetbrainsMono.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
