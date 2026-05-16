"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { RefreshCw, Zap, AlertCircle, Cpu, Skull } from "lucide-react";
import NexusLogo from "@/components/NexusLogo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-hidden selection:bg-destructive/30">
      {/* Background Elements */}
      <div className="star-mesh opacity-60" />
      <div className="star-grid opacity-30" />
      
      {/* Complete Layout Container */}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[85vh] bg-background/40 backdrop-blur-3xl rounded-[2.5rem] border border-destructive/20 shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side: Content */}
        <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 relative overflow-hidden z-10">
          {/* Subtle Grid on Left */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(239,68,68,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(239,68,68,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 lg:mb-20"
          >
            <Link href="/" className="flex items-center gap-3 w-fit">
              <NexusLogo size={48} priority />
              <span className="font-outfit font-extrabold text-2xl tracking-tighter text-foreground">MIDNIGHT-NEXUS</span>
            </Link>
          </motion.div>

          <div className="space-y-6 max-w-md relative z-20">
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-mono text-[11px] text-destructive uppercase tracking-[0.2em] font-bold flex items-center gap-2"
            >
              <Zap className="w-3 h-3 fill-destructive" />
              Critical Neural Overload
            </motion.p>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-outfit text-foreground font-extrabold tracking-tight leading-[0.95]"
            >
              Logic Gate <span className="block mt-2 italic font-light text-destructive/80">Fractured.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted font-body text-sm md:text-base leading-relaxed pb-6 pt-2"
            >
              The reasoning engine encountered a paradox it couldn't resolve. The current cognitive branch has been corrupted by an unhandled exception.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={() => reset()}
                className="group h-14 px-8 rounded-full font-outfit text-[13px] uppercase tracking-widest bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 w-fit shadow-xl shadow-destructive/20 premium-button"
              >
                <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                Reboot Core
              </button>
              
              <Link 
                href="/" 
                className="h-14 px-8 rounded-full font-outfit text-[13px] uppercase tracking-widest bg-white/5 border border-white/10 text-foreground hover:bg-white/10 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 w-fit"
              >
                Emergency Exit
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Graphic/Visuals */}
        <div className="flex-1 bg-destructive/5 border-t lg:border-t-0 lg:border-l border-white/10 relative overflow-hidden min-h-[500px] lg:min-h-auto flex items-center justify-center p-8 md:p-16">
          
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] max-w-[600px] max-h-[600px] bg-destructive/5 blur-[120px] rounded-full animate-pulse z-0 pointer-events-none" />

          {/* Large Error Graphic Container */}
          <div className="relative z-10 flex items-center justify-center w-full h-full max-w-[500px]">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
               <Skull className="text-[160px] md:text-[220px] lg:text-[280px] text-destructive/20 drop-shadow-2xl select-none" strokeWidth={1} />
            </motion.div>
            
            {/* Floating Element: Alert (Top Left) */}
            <motion.div 
              animate={{ 
                y: [0, -15, 0],
                rotate: [-5, -10, -5]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -left-4 md:-left-8 top-[20%] bg-background/80 backdrop-blur-md border border-destructive/30 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-destructive font-bold underline decoration-wavy">Kernel Panic</span>
            </motion.div>

            {/* Floating Element: CPU (Top Right) */}
            <motion.div 
              animate={{ 
                y: [0, 20, 0],
                rotate: [5, 0, 5]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2
              }}
              className="absolute right-0 md:-right-8 top-[15%] bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-xl flex items-center gap-3"
            >
              <Cpu className="h-4 w-4 text-muted animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground font-bold">Unstable State</span>
            </motion.div>

            {/* Glitch Decoration (Bottom) */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[300px] h-px bg-gradient-to-r from-transparent via-destructive/50 to-transparent blur-sm animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
