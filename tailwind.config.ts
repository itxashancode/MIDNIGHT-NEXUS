import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Direct token access
        cyan: "var(--cyan)",
        violet: "var(--violet)",
        obsidian: "var(--obsidian)",
        bone: "var(--bone)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // MANDATED TYPOGRAPHY — no substitutions
        heading: ["Bebas Neue", "Impact", "monospace"],
        subheading: ["Space Mono", "Courier New", "monospace"],
        body: ["DM Mono", "Courier New", "monospace"],
        sans: ["DM Mono", "Courier New", "monospace"],
        mono: ["DM Mono", "Courier New", "monospace"],
        space: ["Space Mono", "Courier New", "monospace"],
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "rotate-slow": "rotate-slow 12s linear infinite",
        float: "float 6s ease-in-out infinite",
        "marquee-scroll": "marquee-scroll 25s linear infinite",
        "gradient-shift": "gradientShift 4s ease infinite",
        "status-ping": "statusPing 2s cubic-bezier(0,0,0.2,1) infinite",
        "scan-line": "scan-line 1.8s ease-in-out infinite",
        flicker: "flicker 8s ease-in-out infinite",
        "tw-blink": "tw-blink 0.8s step-end infinite",
        "border-glow": "borderGlow 3s ease-in-out infinite",
        "zk-pulse": "zk-pulse 3s ease-in-out infinite",
        "particle-float": "particleFloat 8s ease-in-out infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" },
        },
      },
      backgroundSize: {
        "200%": "200% 200%",
      },
    },
  },
  plugins: [typography, animate],
};

export default config;