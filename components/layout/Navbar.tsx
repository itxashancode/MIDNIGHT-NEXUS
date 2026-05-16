"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState, useEffect } from "react";
import NexusLogo from "@/components/NexusLogo";
import Link from "next/link";

export default function Navbar({ onLaunch }: { onLaunch?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 60);
    setHidden(y > lastY && y > 100);
    setLastY(y);
  });

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -100 : 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
className={cn(
          "fixed top-0 left-0 w-full z-[500] transition-all duration-500",
          scrolled
            ? "py-3 border-b border-white/5 bg-[hsl(var(--background))]/80 backdrop-blur-2xl"
            : "py-6"
        )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
<Link href="/" className="flex items-center gap-3 group cursor-none">
           <NexusLogo size={36} />
           <div className="flex flex-col leading-none">
             <span className="nx-display text-base tracking-tighter uppercase text-foreground">
               Midnight
             </span>
             <span className="nx-tech-label-cyan leading-none mt-0.5">Nexus Protocol</span>
           </div>
         </Link>

         {/* Center Nav */}
         <div className="hidden md:flex items-center gap-1">
           {[
             { label: "Capabilities", href: "#features" },
             { label: "Security", href: "#security" },
             { label: "Docs", href: "https://docs.midnight.network/" },
           ].map((item) => (
             <Link
               key={item.label}
               href={item.href}
               className="relative px-4 py-2 text-sm font-medium text-muted hover:text-foreground transition-colors cursor-none group"
             >
               {item.label}
               <span className="absolute bottom-0 left-4 right-4 h-px bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
             </Link>
           ))}
         </div>

         {/* CTA */}
         <div className="flex items-center gap-3">
           {/* Status indicator */}
           <div className="hidden sm:flex nx-status-dot">
             <div className="nx-status-dot-indicator" />
             <span className="nx-tech-label">ZK Online</span>
           </div>

           <button
             onClick={onLaunch}
             className="nx-btn-primary"
           >
             <span>Launch Nexus</span>
           </button>
         </div>
      </div>
    </motion.nav>
  );
}
