"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import FeatureGrid from "@/components/home/FeatureGrid";
import SecuritySection from "@/components/home/SecuritySection";
import Footer from "@/components/Footer";
import MidnightNexusChat from "./MidnightNexusChat";
import CursorGlow from "@/components/CursorGlow";
import { useScrollReveal } from "@/hooks/useScrollReveal";

// ─── Init Overlay ─────────────────────────────────────────────────────────────
const INIT_LINES = [
  "Initializing ZK-circuit...",
  "Loading Groth16 prover...",
  "Establishing secure channel...",
  "Zero-knowledge environment ready.",
];

function InitOverlay() {
  const [lineIdx, setLineIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const lineInterval = setInterval(() => {
      setLineIdx((i) => Math.min(i + 1, INIT_LINES.length - 1));
    }, 540);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(progressInterval); return 100; }
        return p + 2.2;
      });
    }, 50);

    return () => {
      clearInterval(lineInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <motion.div
      key="init"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5 }}
      className="nx-init-overlay"
    >
      {/* Scanline */}
      <div className="nx-init-scan" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,229,200,0.05) 1px, transparent 1px), linear-gradient(90deg,rgba(0,229,200,0.05) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Spinner */}
        <div className="relative w-20 h-20">
          <motion.div
            className="absolute inset-0 rounded-full border border-[var(--cyan)]/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-t border-r border-[var(--cyan)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-5 rounded-full border-b border-l border-[var(--cyan)]/50"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-2 h-2 rounded-full bg-[var(--cyan)]"
              style={{ boxShadow: "0 0 12px var(--cyan), 0 0 30px rgba(0,229,200,0.4)" }}
            />
          </div>
        </div>

        {/* Status text */}
        <div className="w-72">
          <AnimatePresence mode="wait">
            <motion.p
              key={lineIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-xs text-[var(--cyan)] tracking-widest uppercase mb-4"
            >
              {INIT_LINES[lineIdx]}
            </motion.p>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="h-px bg-white/5 w-full relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-[var(--cyan)]"
              style={{ boxShadow: "0 0 12px var(--cyan)" }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ ease: "linear", duration: 0.05 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="tech-label">SYSTEM BOOT</span>
            <span className="tech-label text-[var(--cyan)]">{Math.min(Math.round(progress), 100)}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  // Activate scroll reveal system
  useScrollReveal();

  const startChat = () => {
    setIsInitializing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      setIsInitializing(false);
      setShowChat(true);
    }, 2500);
  };

  return (
    <>
      {/* Custom cursor */}
      <CursorGlow />

{/* Fixed layered background */}
       <div className="nx-bg" aria-hidden>
         <div className="nx-bg-void" />
         <div className="nx-bg-dots" />
         <div className="nx-bg-vignette" />
         <div className="nx-bg-noise" />
       </div>

      <AnimatePresence mode="wait">
        {isInitializing ? (
          <InitOverlay key="init" />
        ) : !showChat ? (
          /* ─── LANDING ─── */
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative min-h-screen"
          >
            <Navbar onLaunch={startChat} />
            <Hero onStart={startChat} />

            {/* Marquee separator between Hero and Features */}
            <div className="relative overflow-hidden py-6 border-y border-white/[0.04]">
              <div className="marquee-track">
                {Array.from({ length: 2 }).map((_, ri) =>
                  ["Zero-Knowledge Proofs", "Midnight Network", "Sovereign Identity", "Cognitive Privacy", "ZK Verified AI", "No Data Exposure"].map(
                    (label, i) => (
                      <div
                        key={`${ri}-${i}`}
                        className="flex items-center gap-8 px-8"
                        style={{ minWidth: "max-content" }}
                      >
                        <span className="w-1 h-1 rounded-full bg-[var(--cyan)] opacity-60" />
                        <span className="tech-label whitespace-nowrap">{label}</span>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            <FeatureGrid />
            <SecuritySection />

            {/* Final CTA Section */}
            <section className="relative py-40 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] rounded-full border border-white/[0.03]" />
                <div className="absolute w-[400px] h-[400px] rounded-full border border-[var(--cyan)]/5" />
                <div className="absolute w-[200px] h-[200px] rounded-full border border-[var(--cyan)]/10" />
              </div>

              <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
                <div data-reveal="scale-in">
                  <span className="tech-label-cyan block mb-6">— Ready to Begin</span>
                  <h2 className="text-5xl md:text-7xl font-subheading font-bold tracking-tighter text-foreground mb-6">
                    Your data.<br />
                    <span className="gradient-text">Your rules.</span>
                  </h2>
                  <p className="text-muted/60 text-lg mb-12 max-w-md mx-auto">
                    Initialize the Nexus and experience AI that genuinely cannot see your data.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={startChat}
                      className="btn-nexus-primary text-sm py-4 px-10"
                    >
                      <span>Initialize Nexus</span>
                    </button>
                    <div className="status-dot">
                      <div className="status-dot-indicator" />
                      <span className="tech-label">ZK Environment Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <Footer footerRef={footerRef} />
          </motion.div>
        ) : (
          /* ─── CHAT ─── */
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 bg-[hsl(var(--background))]"
          >
            <MidnightNexusChat />
            <button
              onClick={() => setShowChat(false)}
              className="fixed top-6 right-6 z-[100] btn-nexus-ghost text-xs py-2 px-5 cursor-none"
            >
              ← Back to Surface
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
