import "./globals.css";
import Script from "next/script";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Bebas_Neue, Space_Mono, DM_Mono, Plus_Jakarta_Sans, Inter } from "next/font/google";

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["300", "400", "500"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "700"],
});



const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://midnightnexusai.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MIDNIGHT-NEXUS AI | Advanced Reasoning Protocol",
    template: "%s | MIDNIGHT-NEXUS"
  },
  description: "Experience high-fidelity collaborative reasoning with Nexus Core. Intercept, analyze, and reshape AI cognitive nodes in real-time.",
  keywords: ["AI", "Nexus Core", "Reasoning Engine", "Multimodal AI", "MIDNIGHT-NEXUS", "Artificial Intelligence", "Developer Tools", "Prompt Engineering", "Interception"],
  authors: [{ name: "MIDNIGHT-NEXUS AI", url: siteUrl }],
  creator: "MIDNIGHT-NEXUS AI",
  publisher: "MIDNIGHT-NEXUS AI",
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
    title: "MIDNIGHT-NEXUS AI | Advanced Reasoning Protocol",
    description: "Experience high-fidelity collaborative reasoning with Nexus Core. Intercept, analyze, and reshape AI cognitive nodes in real-time.",
    url: siteUrl,
    siteName: "MIDNIGHT-NEXUS AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MIDNIGHT-NEXUS AI Interface Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MIDNIGHT-NEXUS AI",
    description: "Intercept, analyze, and reshape AI cognitive nodes in real-time with Nexus Core.",
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
              "name": "MIDNIGHT-NEXUS AI",
              "description": "Advanced multimodal reasoning engine powered by Nexus Core. Intercept, analyze, and reshape AI cognitive nodes in real-time.",
              "applicationCategory": "AI Software",
              "operatingSystem": "Web",
              "url": "https://midnightnexusai.vercel.app",
              "author": {
                "@type": "Organization",
                "name": "MIDNIGHT-NEXUS AI"
              }
            })
          }}
        />
      </head>
<body
         className={cn(
           "min-h-screen bg-background font-sans antialiased",
           bebasNeue.variable,
           dmMono.variable,
           spaceMono.variable,
           plusJakartaSans.variable,
           inter.variable
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
          <ClickSpark
            sparkColor="#fff"
            sparkSize={10}
            sparkRadius={15}
            sparkCount={8}
            duration={400}
          >
            {children}
          </ClickSpark>
        </ThemeProvider>
      </body>
    </html>
  );
}
