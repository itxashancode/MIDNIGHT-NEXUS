"use client";

import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import NexusLogo from "@/components/NexusLogo";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export default function Navbar({ onLaunch }: { onLaunch?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    setMounted(true);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 20);
  });

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 w-full z-[500] transition-all duration-500",
        scrolled ? "py-4 backdrop-blur-xl bg-background/70" : "py-8 bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <NexusLogo size={28} />
          <span className="font-sans text-lg font-light tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">
            Midnight Nexus
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-white/[0.02] border border-white/[0.06] backdrop-blur-md rounded-full px-2 py-1.5 shadow-sm">
          {[
            { label: "Capabilities", href: "#features" },
            { label: "Security", href: "#security" },
            { label: "Documentation", href: "https://docs.midnight.network/" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-4 py-1.5 text-[13px] font-light text-muted hover:text-foreground transition-all duration-300 rounded-full hover:bg-white/[0.04]"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onLaunch}
            className="nx-btn-primary py-2 px-5 text-[13px] rounded-full font-light"
          >
            <span>Launch App</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
