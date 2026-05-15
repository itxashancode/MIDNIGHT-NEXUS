"use client";

import { motion } from "framer-motion";
import GemmaLogo from "@/components/GemmaLogo";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements consistent with the theme */}
      <div className="star-mesh opacity-30" />
      <div className="star-grid opacity-30" />
      
      <div className="relative flex flex-col items-center gap-8">
        {/* Pulsing Logo */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="relative z-10"
        >
          <GemmaLogo size={80} priority />
        </motion.div>

        {/* Shimmering Text */}
        <div className="flex flex-col items-center gap-2 relative z-10">
          <motion.h2 
            className="text-xs font-subheading font-bold uppercase tracking-[0.4em] text-primary"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Initializing Protocol
          </motion.h2>
          <div className="w-48 h-[1px] bg-border relative overflow-hidden">
            <motion.div 
              className="absolute inset-0 bg-primary"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      </div>
    </div>
  );
}
