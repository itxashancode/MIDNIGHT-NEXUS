"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { ShieldCheck, UserCheck, Zap, Layers } from "lucide-react";

interface InfluenceScoreProps {
  score: number; // 0 to 100
  totalThoughts: number;
  changedThoughts: number;
}

export default function InfluenceScore({ score, totalThoughts, changedThoughts }: InfluenceScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const springScore = useSpring(0, {
    stiffness: 80,
    damping: 24,
  });

  useEffect(() => {
    springScore.set(score);
    return springScore.on("change", (latest) => {
      setAnimatedScore(Math.round(latest));
    });
  }, [score, springScore]);

  let status = "Machine Autonomy";
  let icon = <Zap className="w-4 h-4" />;
  let colorClass = "text-muted-foreground border-white/5 bg-white/[0.02]";
  let barColor = "bg-primary/20";

  if (score > 0 && score < 40) {
    status = "Logic Anchored";
    icon = <Layers className="w-4 h-4" />;
    colorClass = "text-primary/70 border-primary/20 bg-primary/5";
    barColor = "bg-primary/40";
  } else if (score >= 40 && score < 80) {
    status = "Neural Override";
    icon = <UserCheck className="w-4 h-4" />;
    colorClass = "text-primary border-primary/40 bg-primary/10";
    barColor = "bg-primary/70";
  } else if (score >= 80) {
    status = "Architect Directed";
    icon = <ShieldCheck className="w-4 h-4" />;
    colorClass = "text-white border-primary bg-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]";
    barColor = "bg-primary";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-4 flex flex-col p-4 rounded-2xl border ${colorClass} transition-all duration-700`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[11px] font-bold uppercase tracking-wider">{status}</span>
        </div>
        <div className="text-xl font-bold font-mono">{animatedScore}%</div>
      </div>
      
      <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden mb-2">
        <motion.div 
          className={`h-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${animatedScore}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
        />
      </div>
      
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter opacity-60">
        <span>Reasoning Influence</span>
        <span>{changedThoughts} / {totalThoughts} Nodes Altered</span>
      </div>
    </motion.div>
  );
}
