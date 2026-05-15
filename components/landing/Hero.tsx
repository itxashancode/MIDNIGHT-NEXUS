"use client";

import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import GemmaLogo from "@/components/GemmaLogo";
import ScenarioHUD from "@/components/ScenarioHUD";

interface HeroProps {
  setUserInput: (input: string) => void;
  onSend: (input: string) => void;
  protocol: "cloud" | "local";
}



export default function Hero({ setUserInput, onSend, protocol }: HeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-[1000px] mx-auto w-full px-6"
    >
      {protocol === "local" ? (
        <div className="flex flex-col gap-12 mt-12 mb-24">
          <div className="p-6 md:p-12 rounded-[48px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl relative overflow-hidden">

             <div className="absolute top-0 right-0 p-8">
               <GemmaLogo size={64} className="opacity-10" />
             </div>
             
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-8">
                 <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/80">Local Inference Mode</span>
               </div>
               
               <h2 className="text-4xl md:text-6xl font-subheading font-bold tracking-tighter mb-8 italic">
                 PRIVACY-FIRST <br /> <span className="text-primary not-italic">INTELLIGENCE</span>.
               </h2>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="flex flex-col gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm font-bold border border-white/10">01</div>
                   <h3 className="font-subheading font-bold text-lg">Enable WebGPU</h3>
                   <p className="text-sm text-muted leading-relaxed">Ensure your browser supports WebGPU. Chrome 113+ or Edge 113+ is required for on-device reasoning.</p>
                 </div>
                 <div className="flex flex-col gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm font-bold border border-white/10">02</div>
                   <h3 className="font-subheading font-bold text-lg">Load Model Weights</h3>
                   <p className="text-sm text-muted leading-relaxed">The Gemma 4 model (approx. 2.4GB) will be cached in your browser's IndexedDB for subsequent runs.</p>
                 </div>
                 <div className="flex flex-col gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm font-bold border border-white/10">03</div>
                   <h3 className="font-subheading font-bold text-lg">Process Offline</h3>
                   <p className="text-sm text-muted leading-relaxed">Once loaded, all reasoning happens entirely on your machine. No data ever leaves your device.</p>
                 </div>
               </div>

               <div className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                   <h4 className="font-subheading font-bold text-primary">Ready to activate?</h4>
                   <p className="text-xs text-muted">A valid GPU and high-speed connection for initial load is recommended.</p>
                 </div>
                 <button className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                   Initialize Local Core
                 </button>
               </div>
             </div>
          </div>
        </div>
      ) : (
        <>

      <div className="flex flex-col items-center gap-6 md:gap-10 mb-12 md:mb-20 mt-4 md:mt-12">
        <GemmaLogo size={80} className="drop-shadow-2xl md:hidden" priority />
        <GemmaLogo size={120} className="drop-shadow-2xl hidden md:block" priority />
        <div className="text-center relative">
          <div className="hero-glow" />
          <h1 className="halaska-display mb-6 tracking-tighter relative z-10">
            DEAD STAR
          </h1>
          <p className="text-lg md:text-2xl lg:text-3xl font-body font-medium text-muted leading-tight max-w-[700px] mx-auto relative z-10 px-2">
            The first reasoning interface designed to <span className="text-foreground font-semibold">partner with your logic</span>.
            Optimized for <span className="text-primary font-bold">Gemma 4 Expert Intelligence</span>.
          </p>
        </div>
      </div>

      {/* Intelligence Upload Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => {
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          fileInput?.click();
        }}
        className="group relative cursor-pointer mb-20 p-[1px] rounded-[48px] bg-gradient-to-br from-primary/30 via-white/10 to-primary/30 hover:from-primary/50 transition-all duration-700 overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="bg-background/40 backdrop-blur-3xl rounded-[32px] md:rounded-[47px] p-6 md:p-12 lg:p-20 flex flex-col md:flex-row items-center gap-8 md:gap-16 border border-white/5 relative z-10">

          <div className="flex-1 text-left">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.3em] border border-primary/20">Multimodal Core</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-subheading font-bold tracking-tighter mb-4 md:mb-8 leading-[0.9] italic">
              START A <br /> <span className="text-primary not-italic">CONSULTATION</span>.
            </h2>
            <p className="text-base md:text-xl lg:text-2xl text-muted font-body leading-relaxed max-w-lg">
              Share an architecture diagram, a complex flowchart, or a technical challenge.
              Gemma 4 will collaborate with you to map out every reasoning step.
            </p>
          </div>

          <div className="w-full md:w-auto flex justify-center">
            <div className="w-full max-w-[280px] md:w-72 h-48 md:h-72 rounded-[32px] md:rounded-[40px] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-4 md:gap-6 group-hover:border-primary/50 transition-all duration-500 bg-primary/[0.02] shadow-inner">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-700 shadow-2xl">
                <Camera className="w-8 h-8 md:w-12 md:h-12 text-primary" />
              </div>
              <div className="text-center">
                <span className="block text-xs font-bold uppercase tracking-[0.3em] text-primary mb-1">Share Context</span>
                <span className="block text-[10px] text-muted font-subheading uppercase tracking-widest opacity-50">Drag & Drop Supported</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scenarios Library Section */}
      <div className="mb-16 md:mb-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
          <h2 className="text-xs font-subheading font-bold uppercase tracking-[0.3em] text-muted/60">Service Categories</h2>
        </div>

        <ScenarioHUD onSelect={(prompt) => {
          setUserInput(prompt);
          onSend(prompt);
        }} />
      </div>

      </>
      )}
    </motion.div>
  );
}

