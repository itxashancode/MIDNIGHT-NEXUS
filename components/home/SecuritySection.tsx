"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Lock, Shield, EyeOff, Zap, CheckCircle } from "lucide-react";

const PILLARS = [
  {
    num: "01",
    icon: Lock,
    title: "Zero-Knowledge Infrastructure",
    description:
      "Our protocol ensures your sensitive data never leaves your device unencrypted. We utilize advanced ZK-proofs for every AI interaction — no exceptions.",
    proof: "NIZK Argument · Groth16",
  },
  {
    num: "02",
    icon: Shield,
    title: "Sovereign Identity",
    description:
      "Connect via Midnight Network's private-first identity layer. You own your data, your history, and your neural fingerprints — not us.",
    proof: "Pedersen Commitments",
  },
  {
    num: "03",
    icon: EyeOff,
    title: "Cognitive Privacy",
    description:
      "Analyze and reshape cognitive nodes without exposing raw prompts to centralized servers. True privacy for deep reasoning.",
    proof: "Homomorphic Encryption",
  },
  {
    num: "04",
    icon: Zap,
    title: "Verified Compliance",
    description:
      "Every response is verified against the Nexus Core policy engine using blockchain-backed cryptographic proofs that cannot be forged or altered.",
    proof: "On-chain Attestation",
  },
];

// Animated ZK proof terminal
function ProofTerminal() {
  const lines = [
    { text: "$ nexus-cli verify --session 0x4a9f...", delay: 0, color: "text-muted/60" },
    { text: "→ Loading ZK circuit...", delay: 0.3, color: "text-muted/60" },
    { text: "→ Generating witness...", delay: 0.7, color: "text-muted/60" },
    { text: "→ Computing proof...", delay: 1.1, color: "text-muted/60" },
    { text: "✓ Proof verified in 2.1s", delay: 1.6, color: "text-[var(--cyan)]" },
    { text: "✓ No personal data exposed", delay: 1.9, color: "text-[var(--cyan)]" },
    { text: "✓ Session integrity: VALID", delay: 2.2, color: "text-[var(--cyan)]" },
  ];

  return (
    <div
      className="glass-card rounded-[24px] p-6 font-mono text-xs leading-relaxed nx-clip-corner"
      data-reveal="fade-left"
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
        <span className="ml-3 tech-label">nexus-zkproof-terminal</span>
      </div>

      <div className="space-y-2">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: line.delay + 0.3, duration: 0.4 }}
            className={line.color}
          >
            {line.text}
          </motion.div>
        ))}
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 2.8 }}
          className="inline-block w-2 h-3 bg-[var(--cyan)] align-middle ml-1"
          style={{ animation: "tw-blink 0.8s step-end infinite" }}
        />
      </div>
    </div>
  );
}

export default function SecuritySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgGlow = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.08, 0]);

  return (
    <section ref={sectionRef} id="security" className="relative py-40 overflow-hidden">
      {/* Ambient glow that fades in/out on scroll */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(0,229,200,1) 0%, transparent 70%)",
          opacity: bgGlow,
          filter: "blur(60px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="max-w-2xl mb-24" data-reveal="fade-up">
          <span className="tech-label-cyan block mb-4">— Trust Architecture</span>
          <h2 className="text-4xl md:text-6xl font-subheading font-bold tracking-tighter text-foreground mb-6">
            Privacy isn&apos;t a feature.
            <br />
            <span className="gradient-text-static">It&apos;s the foundation.</span>
          </h2>
          <p className="text-muted/70 leading-relaxed">
            Midnight Nexus combines the power of advanced reasoning with the immutable security of
            the Midnight blockchain — creating a space where AI innovation meets absolute privacy.
          </p>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: pillars */}
          <div className="space-y-0">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={i}
                  data-reveal="fade-left"
                  data-delay={String(i * 100)}
                  className="group relative flex gap-6 py-8 border-b border-white/5 last:border-0"
                >
                  {/* Number */}
                  <div className="flex-shrink-0">
                    <div className="nx-number-badge group-hover:border-[var(--cyan)]/30 group-hover:text-[var(--cyan)] transition-colors duration-300">
                      {pillar.num}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={16} className="text-[var(--cyan)] opacity-70 flex-shrink-0" />
                      <h3 className="font-subheading font-bold text-foreground text-lg">{pillar.title}</h3>
                    </div>
                    <p className="text-sm text-muted/60 leading-relaxed mb-3">{pillar.description}</p>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={10} className="text-[var(--cyan)]" />
                      <span className="tech-label">{pillar.proof}</span>
                    </div>
                  </div>

                  {/* Hover line */}
                  <div className="absolute left-0 bottom-0 h-px bg-gradient-to-r from-[var(--cyan)] to-transparent w-0 group-hover:w-full transition-all duration-500" />
                </div>
              );
            })}
          </div>

          {/* Right: proof terminal + badge */}
          <div className="space-y-6 lg:sticky lg:top-32">
            <ProofTerminal />

            {/* Badges */}
            <div className="grid grid-cols-2 gap-4" data-reveal="fade-right" data-delay="200">
              {[
                { label: "ZK Circuit Depth", value: "2^18" },
                { label: "Trusted Setup", value: "None" },
                { label: "Proof Size", value: "~1.2KB" },
                { label: "Verify Time", value: "<10ms" },
              ].map((b) => (
                <div
                  key={b.label}
                  className="glass-card rounded-2xl p-4 flex flex-col gap-1"
                >
                  <span className="tech-label">{b.label}</span>
                  <span className="text-xl font-mono font-bold text-[var(--cyan)]">{b.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
