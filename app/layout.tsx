import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Outfit, Space_Grotesk } from "next/font/google";
import Script from "next/script";
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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://deadstarai.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dead Star AI | Advanced Reasoning Protocol",
    template: "%s | Dead Star"
  },
  description: "Experience high-fidelity collaborative reasoning with Gemma 4. Intercept, analyze, and reshape AI cognitive nodes in real-time.",
  keywords: ["AI", "Gemma 4", "Reasoning Engine", "Multimodal AI", "Dead Star", "Artificial Intelligence", "Developer Tools", "Prompt Engineering", "Interception"],
  authors: [{ name: "Dead Star AI", url: siteUrl }],
  creator: "Dead Star AI",
  publisher: "Dead Star AI",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Dead Star AI | Advanced Reasoning Protocol",
    description: "Experience high-fidelity collaborative reasoning with Gemma 4. Intercept, analyze, and reshape AI cognitive nodes in real-time.",
    url: siteUrl,
    siteName: "Dead Star AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Dead Star AI Interface Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dead Star AI",
    description: "Intercept, analyze, and reshape AI cognitive nodes in real-time with Gemma 4.",
    creator: "@itxashancode",
    images: ["/og-image.png"],
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },
};


import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Dead Star AI",
              "description": "Advanced multimodal reasoning engine powered by Gemma 4. Intercept, analyze, and reshape AI cognitive nodes in real-time.",
              "applicationCategory": "AI Software",
              "operatingSystem": "Web",
              "url": "https://deadstarai.vercel.app",
              "author": {
                "@type": "Organization",
                "name": "Dead Star AI"
              }
            })
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased custom-scrollbar",
          inter.variable,
          outfit.variable,
          jetbrainsMono.variable,
          spaceGrotesk.variable
        )}
      >
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: true
                });
              `}
            </Script>
          </>
        )}

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Vercel Analytics — tracks page views & web vitals */}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
