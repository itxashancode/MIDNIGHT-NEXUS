"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, Brain, Zap, Fingerprint, Lock, Globe, ArrowRight } from "lucide-react";

const features = [
  {
    title: "Zero-Knowledge Proofs",
    description: "Verify AI execution without revealing the underlying data or model logic. Mathematical privacy at the protocol layer.",
    icon: Shield,
    tag: "Core Protocol",
    large: true,
    accent: "cyan",
  },
  {
    title: "Neural Synergy",
    description: "Distributed reasoning across the Midnight Network's privacy mesh.",
    icon: Brain,
    tag: "AI Engine",
    large: false,
    accent: "violet",
  },
  {
    title: "Instant Verification",
    description: "Sub-second ZK proof generation — so privacy never means slowness.",
    icon: Zap,
    tag: "Performance",
    large: false,
    accent: "cyan",
  },
  {
    title: "Anonymity First",
    description: "Your identity never leaves your device, guaranteed by cryptographic commitment schemes.",
    icon: Fingerprint,
    tag: "Identity",
    large: false,
    accent: "violet",
  },
  {
    title: "End-to-End Encryption",
    description: "Every byte secured with quantum-resistant cryptographic primitives.",
    icon: Lock,
    tag: "Encryption",
    large: false,
    accent: "cyan",
  },
  {
    title: "Global Distribution",
    description: "Available everywhere on the decentralized Midnight mesh network.",
    icon: Globe,
    tag: "Network",
    large: false,
    accent: "violet",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const Icon = feature.icon;
  const isCyan = feature.accent === "cyan";

  return (
    <motion.div
      data-reveal="fade-up"
      data-delay={String(index * 100)}
      className={`glass-card rounded-[32px] p-8 group relative overflow-hidden ${
        feature.large ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className="absolute top-0 right-0 w-px h-8 origin-top"
          style={{ background: isCyan ? "var(--cyan)" : "var(--violet)" }}
        />
        <div
          className="absolute top-0 right-0 w-8 h-px origin-right"
          style={{ background: isCyan ? "var(--cyan)" : "var(--violet)" }}
        />
      </div>

      {/* Background glow */}
      <div
        className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
        style={{ background: isCyan ? "rgba(0,229,200,0.06)" : "rgba(123,60,220,0.08)" }}
      />

      <div className="relative z-10 h-full flex flex-col">
        {/* Tag + Icon */}
        <div className="flex items-start justify-between mb-6">
          <span
            className="tech-label"
            style={{ color: isCyan ? "var(--cyan)" : "var(--violet)", opacity: 0.8 }}
          >
            {feature.tag}
          </span>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center border"
            style={{
              borderColor: isCyan ? "rgba(0,229,200,0.2)" : "rgba(123,60,220,0.2)",
              background: isCyan ? "rgba(0,229,200,0.05)" : "rgba(123,60,220,0.05)",
            }}
          >
            <Icon
              size={18}
              style={{ color: isCyan ? "var(--cyan)" : "var(--violet)" }}
            />
          </div>
        </div>

        {/* Title */}
        <h3
          className={`font-subheading font-bold text-foreground mb-3 ${
            feature.large ? "text-2xl md:text-3xl" : "text-lg"
          }`}
        >
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted/70 leading-relaxed flex-1">
          {feature.description}
        </p>

        {/* Large card gets a link */}
        {feature.large && (
          <div className="mt-8">
            <button className="flex items-center gap-2 text-sm font-medium text-[var(--cyan)] group/link cursor-none">
              <span className="reveal-line active">Explore Protocol</span>
              <ArrowRight
                size={14}
                className="group-hover/link:translate-x-1 transition-transform"
              />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function FeatureGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 0.4], [60, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative py-40 overflow-hidden"
    >
      {/* Section divider top */}
      <div className="section-divider mb-24 mx-6" />

      {/* Parallax title */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="max-w-7xl mx-auto px-6 mb-20"
      >
        <div className="flex items-end justify-between flex-wrap gap-8">
          <div>
            <span className="tech-label-cyan block mb-4">— Core Capabilities</span>
            <h2 className="text-4xl md:text-6xl font-subheading font-bold tracking-tighter text-foreground">
              Built for the next era<br />
              <span className="gradient-text-static">of data privacy.</span>
            </h2>
          </div>
          <p className="max-w-sm text-muted/70 text-sm leading-relaxed">
            Every component of Midnight Nexus is engineered around a single axiom:
            your data belongs to you, mathematically and irrevocably.
          </p>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[280px]">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom divider */}
      <div className="section-divider mt-24 mx-6" />
    </section>
  );
}
