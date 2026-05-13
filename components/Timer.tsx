"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

interface TimerProps {
  duration?: number;
  onComplete?: () => void;
  isActive?: boolean;
}

export default function Timer({ duration = 30, onComplete, isActive = true }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const controls = useAnimation();

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
  }, [duration, isActive]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      onComplete?.();
    }
  }, [timeLeft, onComplete, isActive]);

  useEffect(() => {
    if (!isActive) {
      controls.stop();
      return;
    }
    controls.start({
      strokeDashoffset: [0, 88],
      transition: { duration: duration, ease: "linear" }
    });
  }, [duration, controls, isActive]);

  // Welcoming color palette
  const color = timeLeft > 15 ? "hsl(var(--primary))" : timeLeft > 5 ? "#3b82f6" : "#6366f1";

  return (
    <div className="relative flex items-center justify-center w-10 h-10">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="3"
        />
        <motion.circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray="88"
          animate={controls}
          style={{ transition: "stroke 1s ease" }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-[11px] font-bold font-mono"
        style={{ color }}
      >
        {timeLeft}
      </div>
    </div>
  );
}
