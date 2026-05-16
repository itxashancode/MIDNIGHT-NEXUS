"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Cpu, Network, Zap } from "lucide-react";

const icons = {
  Cpu: Cpu,
  Network: Network,
  Zap: Zap,
};

interface ScenarioHUDProps {
  onSelect: (prompt: string) => void;
}

const ScenarioHUD = memo(({ onSelect }: ScenarioHUDProps) => {
  const scenarios = [
    {
      title: "Analyze System Architecture",
      desc: "Deconstruct a complex system.",
      prompt: "Analyze a modern microservices architecture with an API gateway, Redis caching layer, and Postgres database. Map out the potential reasoning flaws in data consistency during a network partition.",
      icon: "Cpu" as keyof typeof icons
    },
    {
      title: "Plan a Distributed Database",
      desc: "Design scalable data storage.",
      prompt: "Design a globally distributed database topology. Map the intelligence nodes for handling eventual consistency versus strong consistency trade-offs.",
      icon: "Network" as keyof typeof icons
    },
    {
      title: "Debug a Memory Leak",
      desc: "Identify elusive code flaws.",
      prompt: "Trace the reasoning path for diagnosing a severe memory leak in a Node.js Edge runtime environment. What are the key diagnostic nodes?",
      icon: "Zap" as keyof typeof icons
    }
  ];

  return (
    <div className="flex overflow-x-auto pb-6 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 gap-4 md:gap-6 snap-x snap-mandatory custom-scrollbar">
      {scenarios.map((s, i) => {
        const Icon = icons[s.icon];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            onClick={() => onSelect(s.prompt)}
            className="group relative cursor-pointer p-6 md:p-8 rounded-[32px] bg-muted/30 border border-white/5 hover:bg-muted/50 hover:border-primary/30 transition-all duration-500 overflow-hidden flex-shrink-0 w-[85vw] sm:w-[300px] md:w-auto snap-center"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="mb-4 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Icon size={20} />
            </div>
            <h3 className="text-lg font-subheading font-bold text-foreground mb-2 tracking-tight group-hover:text-primary transition-colors">{s.title}</h3>
            <p className="text-sm text-muted font-body leading-relaxed">{s.desc}</p>
          </motion.div>
        );
      })}
    </div>
  );
});

ScenarioHUD.displayName = "ScenarioHUD";

export default ScenarioHUD;
