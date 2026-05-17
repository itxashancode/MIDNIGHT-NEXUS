"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimerProps {
  duration?: number;
  onComplete?: () => void;
  isActive?: boolean;
}

export default function Timer({ duration = 30, onComplete, isActive = true }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, duration]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      onComplete?.();
    }
  }, [timeLeft, onComplete, isActive]);

  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted"
        />
        <motion.circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="var(--cyan-primary)"
          strokeWidth="3"
          strokeDasharray="88"
          animate={{ strokeDashoffset: [0, 88] }}
          transition={{ duration: duration, ease: "linear" }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center nx-font-dm text-[11px] font-bold text-accent"
      >
        {timeLeft}
      </div>
    </div>
  );
}