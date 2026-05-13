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
  title: "Dead Star AI",
  description: "Bending AI reasoning before it arrives. A multimodal experience with Gemma 4.",
  keywords: ["AI", "Gemma 4", "Reasoning", "Multimodal", "Dead Star"],
  authors: [{ name: "Dead Star Team" }],
  icons: {
    icon: "/icon.svg?v=2",
    shortcut: "/favicon.ico?v=2",
    apple: "/icon.svg?v=2",
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
