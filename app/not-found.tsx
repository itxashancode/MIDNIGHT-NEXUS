"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, SearchX, AlertTriangle, Sparkles, Binary } from "lucide-react";
import GemmaLogo from "@/components/GemmaLogo";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-hidden selection:bg-primary/30">
      {/* Background Elements */}
      <div className="star-mesh" />
      <div className="star-grid" />
      
      {/* Complete Layout Container */}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row min-h-[85vh] bg-background/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side: Content */}
        <div className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 relative overflow-hidden z-10">
          {/* Subtle Grid on Left */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12 lg:mb-20"
          >
            <Link href="/" className="flex items-center gap-3 w-fit">
              <GemmaLogo size={48} priority />
              <span className="font-outfit font-extrabold text-2xl tracking-tighter text-foreground">DEAD STAR</span>
            </Link>
          </motion.div>

          <div className="space-y-6 max-w-md relative z-20">
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="font-mono text-[11px] text-primary uppercase tracking-[0.2em] font-bold"
            >
              Signal Lost: Error 404
            </motion.p>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-outfit text-foreground font-extrabold tracking-tight leading-[0.95]"
            >
              Event Horizon <span className="block mt-2 italic font-light text-primary/80">Reached.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted font-body text-sm md:text-base leading-relaxed pb-6 pt-2"
            >
              The neural path or version of reality you're seeking has collapsed into a singularity. It either never existed in this timeline or has been purged from the core memory.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link 
                href="/" 
                className="group h-14 px-8 rounded-full font-outfit text-[13px] uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 w-fit shadow-xl shadow-primary/20 premium-button"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Return to Core
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Right Side: Graphic/Visuals */}
        <div className="flex-1 bg-white/5 border-t lg:border-t-0 lg:border-l border-white/10 relative overflow-hidden min-h-[500px] lg:min-h-auto flex items-center justify-center p-8 md:p-16">
          
          {/* Background Glow */}
          <div className="hero-glow opacity-50" />

          {/* Large 404 Graphic Container */}
          <div className="relative z-10 flex items-center justify-center w-full h-full max-w-[500px]">
            <motion.h2 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, type: "spring" }}
              className="text-[160px] md:text-[220px] lg:text-[280px] font-outfit font-extrabold italic text-primary/20 leading-none drop-shadow-2xl select-none"
            >
              404
            </motion.h2>
            
            {/* Floating Element: Not Found Pill (Top Left) */}
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                rotate: [-8, -12, -8]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -left-4 md:-left-8 top-[20%] bg-background/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <SearchX className="h-6 w-6 text-primary" />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted font-bold">Unresolved Node</span>
            </motion.div>

            {/* Floating Element: Error Pill (Top Right) */}
            <motion.div 
              animate={{ 
                y: [0, 15, 0],
                rotate: [6, 10, 6]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute right-0 md:-right-8 top-[15%] bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-xl flex items-center gap-3"
            >
              <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground font-bold">System Leak</span>
            </motion.div>

            {/* Binary Decoration (Bottom Right) */}
            <motion.div 
              animate={{ 
                rotate: 360
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute right-[10%] -bottom-4 text-primary/30"
            >
              <Binary className="h-20 w-20" />
            </motion.div>
            
            {/* Sparkles (Scattered) */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute left-[40%] bottom-[15%] text-primary"
            >
              <Sparkles className="h-8 w-8 fill-primary" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
