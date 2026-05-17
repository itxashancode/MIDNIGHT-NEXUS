"use client";

import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, Zap, Layers } from "lucide-react";

interface InfluenceScoreProps {
  score: number;
  totalThoughts: number;
  changedThoughts: number;
}

export default function InfluenceScore({ score, totalThoughts, changedThoughts }: InfluenceScoreProps) {
  let status = "Machine Autonomy";
  let icon = <Zap className="w-4 h-4" />;
  let colorClass = "text-muted border-white/5 bg-white/[0.02]";
  let barColor = "bg-accent/20";

  if (score > 0 && score < 40) {
    status = "Logic Anchored";
    icon = <Layers className="w-4 h-4" />;
    colorClass = "text-accent border-accent/20 bg-accent/5";
    barColor = "bg-accent/40";
  } else if (score >= 40 && score < 80) {
    status = "Neural Override";
    icon = <UserCheck className="w-4 h-4" />;
    colorClass = "text-accent border-accent/40 bg-accent/10";
    barColor = "bg-accent/70";
  } else if (score >= 80) {
    status = "Architect Directed";
    icon = <ShieldCheck className="w-4 h-4" />;
    colorClass = "text-accent border-accent bg-accent/20 shadow-[0_0_20px_rgba(0,255,224,0.2)]";
    barColor = "bg-accent";
  }

  return (
    <motion.div
      layout
      className={`mt-4 flex flex-col p-4 nx-glass-card transition-all duration-700 ${colorClass}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="nx-label text-[11px] font-bold uppercase tracking-wider">{status}</span>
        </div>
        <div className="text-xl font-bold nx-font-dm">{Math.round(score)}%</div>
      </div>
      
      <div className="h-1.5 w-full bg-muted/10 rounded-sm overflow-hidden mb-2">
        <motion.div 
          className={`h-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
        />
      </div>
      
      <div className="flex justify-between items-center nx-meta text-[10px] font-bold uppercase tracking-tighter opacity-60">
        <span>Reasoning Influence</span>
        <span>{changedThoughts} / {totalThoughts} Nodes Altered</span>
      </div>
    </motion.div>
  );
}
