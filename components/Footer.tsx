"use client";

import { RefObject } from "react";
import NexusLogo from "@/components/NexusLogo";

interface FooterProps {
  footerRef: RefObject<HTMLElement | null>;
}


export default function Footer({ footerRef }: FooterProps) {
  return (
    <footer ref={footerRef} className="w-full bg-[#E5E7EB] dark:bg-[#1A1A1A] border-t border-black/10 dark:border-white/10 text-black dark:text-white font-sans mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Left Column */}
        <div className="p-8 md:p-16 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center gap-4">
            <NexusLogo size={48} className="invert dark:invert-0" />
            <span className="text-4xl font-subheading font-medium tracking-tighter uppercase">MIDNIGHT-NEXUS</span>
          </div>
          <div className="flex flex-col gap-2 mt-8">
            <div className="text-xs text-muted font-body font-medium uppercase tracking-widest mb-4">
              ©2026 MIDNIGHT-NEXUS, Inc. All Rights Reserved.
            </div>
            <a
              href="https://calendly.com/ashandev/new-meeting"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary text-primary-foreground font-subheading font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 w-fit"
            >
              Book a Call
            </a>
          </div>
        </div>

        {/* Right Column */}
        <div className="p-8 md:p-16 flex flex-col justify-between min-h-[300px]">
          <div className="flex flex-col gap-4">
            <a href="https://dev.to/itxashancode" target="_blank" rel="noopener noreferrer" className="text-2xl font-subheading font-medium hover:opacity-50 transition-opacity">Dev.to</a>
            <a href="https://github.com/itxashancode" target="_blank" rel="noopener noreferrer" className="text-2xl font-subheading font-medium hover:opacity-50 transition-opacity">GitHub</a>
            <a href="https://linktr.ee/itxashanvibes" target="_blank" rel="noopener noreferrer" className="text-2xl font-subheading font-medium hover:opacity-50 transition-opacity">Linktree</a>
            <a href="https://x.com/ASHAN868904" target="_blank" rel="noopener noreferrer" className="text-2xl font-subheading font-medium hover:opacity-50 transition-opacity">X</a>
          </div>
          <div className="flex justify-start md:justify-end">
            <a href="#" className="text-xs text-muted font-body font-medium uppercase tracking-widest hover:opacity-100 transition-opacity">
              Privacy Notice
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
