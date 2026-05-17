"use client";

import { RefObject } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface FooterProps {
  footerRef: RefObject<HTMLElement | null>;
}

export default function Footer({ footerRef }: FooterProps) {
  return (
    <footer
      ref={footerRef}
      className="px-4 pb-4 pt-12 md:px-8 md:pb-8 bg-[hsl(var(--background))] border-t border-white/[0.03]"
    >
      <div className="relative w-full bg-[#0F121A] rounded-[28px] p-6 md:p-12 overflow-hidden flex flex-col justify-between min-h-[320px] md:min-h-[400px] border border-white/[0.04]">
        
        <div className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full bg-white/10 shadow-inner" />
        <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-white/10 shadow-inner" />
        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full bg-white/10 shadow-inner z-20" />
        <div className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full bg-white/10 shadow-inner z-20" />

        <div className="flex flex-col md:flex-row justify-between items-start w-full relative z-10">
          
          <div>
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6 tracking-tight">Contacts</h2>
            <a href="mailto:contact@midnightnexus.com" className="text-foreground/70 md:text-lg hover:text-white flex items-center gap-1 group font-light transition-colors">
              contact@midnightnexus.com
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          <div className="flex flex-col items-start md:items-end gap-6 md:gap-10 mt-10 md:mt-2">
            <p className="text-white/30 text-sm font-light">© 2026 Midnight Nexus</p>
            <div className="flex flex-wrap gap-5 text-white/60 font-light text-sm md:text-base">
              {[
                { label: 'Twitter', href: 'https://x.com/ASHAN868904' },
                { label: 'GitHub', href: 'https://github.com/itxashancode' },
                { label: 'Dev.to', href: 'https://dev.to/itxashancode' },
              ].map(link => (
                <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 hover:text-white transition-colors group">
                  {link.label}
                  <ArrowUpRight size={16} className="opacity-40 group-hover:opacity-80 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute -bottom-[8%] md:-bottom-[15%] left-0 right-0 w-full flex justify-center pointer-events-none select-none z-0">
          <span className="text-[20vw] md:text-[18vw] font-thin text-white/[0.02] leading-none tracking-tighter">
            nexus.
          </span>
        </div>
      </div>
    </footer>
  );
}