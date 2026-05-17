"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Brain, Zap, Fingerprint, Lock, Globe, ArrowRight } from "lucide-react";

const scenarios = [
  {
    title: "Analyze System Architecture",
    desc: "Deconstruct a complex system.",
    description: "Deconstruct a complex system.",
    prompt: "Analyze a modern microservices architecture with an API gateway, Redis caching layer, and Postgres database. Map out the potential reasoning flaws in data consistency during a network partition.",
    icon: "Cpu",
    tag: "Analysis",
    large: false
  },
  {
    title: "Plan a Distributed Database",
    desc: "Design scalable data storage.",
    description: "Design scalable data storage.",
    prompt: "Design a globally distributed database topology. Map the intelligence nodes for handling eventual consistency versus strong consistency trade-offs.",
    icon: "Network",
    tag: "Design",
    large: false
  },
  {
    title: "Debug a Memory Leak",
    desc: "Identify elusive code flaws.",
    description: "Identify elusive code flaws.",
    prompt: "Trace the reasoning path for diagnosing a severe memory leak in a Node.js Edge runtime environment. What are the key diagnostic nodes?",
    icon: "Zap",
    tag: "Debugging",
    large: false
  }
];

const IconMap: any = {
  Cpu: Shield,
  Network: Brain,
  Zap: Zap,
};

export default function ScenarioHUD({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="flex overflow-x-auto pb-6 -mx-6 px-6 md:mx-0 md:px-0 gap-4 snap-x snap-mandatory custom-scrollbar">
      {scenarios.map((s, i) => {
        const Icon = IconMap[s.icon] || Shield;
        return (
          <motion.div
            key={i}
            onClick={() => onSelect(s.prompt)}
            className="group relative cursor-pointer p-6 md:p-8 nx-glass-card flex-shrink-0 w-[85vw] sm:w-[300px] md:w-auto snap-center"
            data-reveal="fade-up"
            data-delay={String(i * 100)}
          >
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div
                className="absolute top-0 right-0 w-px h-8 origin-top"
                style={{ background: "var(--cyan-primary)" }}
              />
              <div
                className="absolute top-0 right-0 w-8 h-px origin-right"
                style={{ background: "var(--cyan-primary)" }}
              />
            </div>

            {/* Background glow */}
            <div
              className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"
              style={{ background: "rgba(0, 255, 224, 0.06)" }}
            />

            <div className="relative z-10 h-full flex flex-col">
              {/* Tag + Icon */}
              <div className="flex items-start justify-between mb-6">
                <span className="nx-tech-label" style={{ color: "var(--cyan-primary)", opacity: 0.8 }}>
                  {s.tag || "Task"}
                </span>
                <div
                  className="w-10 h-10 rounded-sm flex items-center justify-center border"
                  style={{
                    borderColor: "rgba(0, 255, 224, 0.2)",
                    background: "rgba(0, 255, 224, 0.05)",
                  }}
                >
                  <Icon size={18} style={{ color: "var(--cyan-primary)" }} />
                </div>
              </div>

              {/* Title */}
              <h3 className="nx-display text-lg font-bold text-foreground mb-3">
                {s.title}
              </h3>

              {/* Description */}
              <p className="nx-body text-sm text-muted/70 leading-relaxed flex-1">
                {s.description}
              </p>

              {/* Large card gets a link */}
              {s.large && (
                <div className="mt-8">
                  <button className="flex items-center gap-2 text-sm font-medium text-accent group/link cursor-pointer">
                    <span className="nx-reveal-line active">Explore Protocol</span>
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
      })}
    </div>
  );
}
