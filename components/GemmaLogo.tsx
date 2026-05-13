"use client";

import { motion } from "framer-motion";

interface GemmaLogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
  priority?: boolean;
}

export default function GemmaLogo({ className = "", size = 40, priority = false }: GemmaLogoProps) {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => {
      const delay = priority ? 0 : 1 + i * 0.1;
      return {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { delay, type: "spring" as const, duration: 1.5, bounce: 0 },
          opacity: { delay, duration: 0.1 }
        }
      };
    }
  };

  const starPulse = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.8, 
        ease: "easeOut" as const,
        delay: 0.5
      }
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={className}
    >
      <defs>
        <linearGradient id="gemma-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      <motion.line
        x1="25" y1="10" x2="25" y2="90"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.2"
        variants={draw} custom={1}
      />
      <motion.line
        x1="75" y1="10" x2="75" y2="90"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.2"
        variants={draw} custom={2}
      />
      <motion.line
        x1="10" y1="25" x2="90" y2="25"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.2"
        variants={draw} custom={3}
      />
      <motion.line
        x1="10" y1="75" x2="90" y2="75"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.2"
        variants={draw} custom={4}
      />
      
      {/* Central Cross Lines */}
      <motion.line
        x1="50" y1="0" x2="50" y2="100"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.1"
        variants={draw} custom={0}
      />
      <motion.line
        x1="0" y1="50" x2="100" y2="50"
        stroke="currentColor" strokeWidth="1" strokeOpacity="0.1"
        variants={draw} custom={0}
      />

      {/* Circle */}
      <motion.circle
        cx="50" cy="50" r="35"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.3"
        variants={draw}
        custom={5}
      />

      {/* The Gemma Star (Central shape) */}
      <motion.path
        d="M50 15C50 15 54 46 85 50C54 54 50 85 50 85C50 85 46 54 15 50C46 46 50 15 50 15Z"
        fill="url(#gemma-gradient)"
        initial="initial"
        animate="animate"
        variants={starPulse}
        className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
      />
      
      {/* Inner Highlight for depth */}
      <motion.path
        d="M50 25C50 25 52 48 75 50C52 52 50 75 50 75C50 75 48 52 25 50C48 48 50 25 50 25Z"
        fill="white"
        fillOpacity="0.1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      />
    </motion.svg>
  );
}
