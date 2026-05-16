"use client";

import { RefObject } from "react";
import NexusLogo from "@/components/NexusLogo";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface FooterProps {
  footerRef: RefObject<HTMLElement | null>;
}

const LINKS = {
  Protocol: [
    { label: "Capabilities", href: "#features" },
    { label: "Security", href: "#security" },
    { label: "Documentation", href: "https://docs.midnight.network/" },
    { label: "Whitepaper", href: "https://midnight.network/" },
  ],
  Community: [
    { label: "X / Twitter", href: "https://x.com/ASHAN868904" },
    { label: "GitHub", href: "https://github.com/itxashancode" },
    { label: "Dev.to", href: "https://dev.to/itxashancode" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Security", href: "#" },
    { label: "Terms of Use", href: "#" },
  ],
};

export default function Footer({ footerRef }: FooterProps) {
  return (
    <footer
      ref={footerRef}
      className="relative border-t border-white/[0.04] overflow-hidden"
      style={{ cursor: "none" }}
    >
      {/* Ambient glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full bg-[var(--cyan)]/4 blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Top: brand + links */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-16 mb-20">
          {/* Brand */}
          <div data-reveal="fade-up">
            <div className="flex items-center gap-3 mb-6">
              <NexusLogo size={40} />
              <div className="flex flex-col leading-none">
                <span className="text-xl font-subheading font-bold tracking-tighter uppercase">Midnight</span>
                <span className="tech-label-cyan mt-0.5">Nexus Protocol</span>
              </div>
            </div>
            <p className="text-sm text-muted/60 leading-relaxed max-w-[260px] mb-8">
              The first private-first neural reasoning engine built on the Midnight Network.
              Zero-knowledge. Fully sovereign.
            </p>
            <div className="status-dot">
              <div className="status-dot-indicator" />
              <span className="tech-label">Network Status: Operational</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, items], i) => (
            <div key={group} data-reveal="fade-up" data-delay={String((i + 1) * 100)}>
              <span className="tech-label-cyan block mb-6">{group}</span>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-sm text-muted/60 hover:text-foreground transition-colors flex items-center gap-1.5 group cursor-none w-fit"
                    >
                      {item.label}
                      {item.href.startsWith("http") && (
                        <ArrowUpRight
                          size={11}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="section-divider mb-10" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <span className="tech-label">
            ©2026 MIDNIGHT-NEXUS PROTOCOL · ALL RIGHTS RESERVED
          </span>
          <Link
            href="https://calendly.com/ashandev/new-meeting"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-nexus-primary text-[11px] py-3 px-6"
          >
            <span>Partner with Nexus</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
