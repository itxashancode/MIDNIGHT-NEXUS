"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Shield, Zap, Lock } from "lucide-react";

const PHRASES = [
  "Analyze Medical Records",
  "Process Financial Data",
  "Verify Identity Claims",
  "Run Secure Inference",
];

function TypewriterCycle() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = PHRASES[phraseIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < phrase.length) {
      timeout = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 60);
    } else if (!deleting && displayed.length === phrase.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % PHRASES.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, phraseIdx]);

  return (
    <span className="text-foreground font-medium">
      {displayed}
      <span className="w-[2px] h-[1em] bg-violet-400 inline-block align-middle ml-1 animate-pulse" />
    </span>
  );
}

function ZkOrbital({ size, delay, duration }: { size: number; delay: number; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full border border-foreground/[0.04]"
      style={{ width: size, height: size, top: "50%", left: "50%", marginTop: -size/2, marginLeft: -size/2 }}
      animate={{ rotate: 360 }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      <div
        className="absolute w-1.5 h-1.5 rounded-full bg-violet-400/50"
        style={{ top: -3, left: "50%", marginLeft: -3 }}
      />
    </motion.div>
  );
}

export default function Hero({ onStart }: { onStart?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const y1 = useSpring(useTransform(scrollY, [0, 600], [0, -80]), { stiffness: 100, damping: 30 });
  const y2 = useSpring(useTransform(scrollY, [0, 600], [0, -140]), { stiffness: 100, damping: 30 });
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      <motion.div
        style={{ y: y1 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="relative w-[600px] h-[600px] opacity-40">
          <ZkOrbital size={600} delay={0} duration={40} />
          <ZkOrbital size={440} delay={0.5} duration={28} />
          <ZkOrbital size={300} delay={1} duration={18} />
          <ZkOrbital size={180} delay={0.2} duration={12} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-violet-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-violet-400/20" />
        </div>
      </motion.div>

      <motion.div style={{ y: y2 }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[15%] w-[500px] h-[300px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[250px] rounded-full bg-indigo-500/10 blur-[100px]" />
      </motion.div>

      <motion.div
        style={{ y: y1, opacity, scale }}
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-3 mb-10 bg-foreground/5 px-4 py-1.5 rounded-full border border-foreground/10"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-xs font-medium tracking-wide text-foreground/80">Midnight Network · ZK-Proof Verified</span>
        </motion.div>

        <div className="overflow-hidden mb-4">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="nx-display text-[clamp(56px,10vw,120px)] tracking-tighter text-foreground"
          >
            AI That Sees
          </motion.h1>
        </div>
        <div className="overflow-hidden mb-4">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
            className="nx-display text-[clamp(56px,10vw,120px)] tracking-tighter text-violet-400"
          >
            Nothing.
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-6 mb-10 nx-font-dm text-xl md:text-2xl text-muted/80 min-h-[2em]"
        >
          <TypewriterCycle />
          {" "}
          <span className="text-muted/50">— without exposing your data.</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="nx-font-dm max-w-xl mx-auto text-base md:text-lg text-muted/60 leading-relaxed mb-14"
        >
          The first privacy-preserving AI reasoning protocol on Midnight Network.
          Your data stays yours — cryptographically guaranteed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button onClick={onStart} className="nx-btn-primary">
            <span>Get Started</span>
            <ArrowRight size={14} />
          </button>
          <a
            href="https://midnight.network/"
            target="_blank"
            rel="noopener noreferrer"
            className="nx-btn-ghost"
          >
            Read Whitepaper
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 1 }}
          className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {[
            { icon: Shield, label: "ZK Proofs", value: "100%" },
            { icon: Zap, label: "Verify Speed", value: "<2.4s" },
            { icon: Lock, label: "Data Exposed", value: "Zero" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={14} className="text-violet-400 opacity-70" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
              <span className="font-medium text-sm text-foreground">{value}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-violet-500/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}