"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

interface EntropyGraphProps {
  data: number[];
  labels: string[];
}

export default function EntropyGraph({ data, labels }: EntropyGraphProps) {
  const chartData = {
    labels,
    datasets: [
      {
        fill: true,
        label: "Neural Entropy",
        data,
        borderColor: "var(--cyan-primary)",
        backgroundColor: "rgba(0, 255, 224, 0.1)",
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 10, family: "'Space Mono', monospace" },
        bodyFont: { size: 10, family: "'Space Mono', monospace" },
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: { display: false },
      y: {
        display: false,
        min: 0,
        max: Math.max(...data, 100) + 10,
      },
    },
  };

  return (
    <div className="p-6 nx-glass-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-accent/10 flex items-center justify-center text-accent">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="nx-label text-xs font-bold uppercase tracking-widest text-foreground">Cognitive Drift</h3>
            <p className="nx-meta text-[10px] uppercase tracking-tighter">Real-time Entropy Variance</p>
          </div>
        </div>
        <div className="text-right">
          <span className="nx-font-dm text-xl font-bold text-accent">
            {data.length > 0 ? data[data.length - 1].toFixed(1) : "0.0"}
          </span>
          <span className="nx-meta text-[10px] font-black text-accent/60 ml-1">Δ</span>
        </div>
      </div>

      <div className="h-[120px] w-full">
        <Line data={chartData} options={options} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-accent/10 pt-4">
        <div className="flex flex-col">
          <span className="nx-meta text-[9px] font-bold uppercase tracking-widest">Stability</span>
          <span className="nx-font-dm text-xs font-bold text-foreground">98.4%</span>
        </div>
        <div className="flex flex-col">
          <span className="nx-meta text-[9px] font-bold uppercase tracking-widest">Latency</span>
          <span className="nx-font-dm text-xs font-bold text-foreground">24ms</span>
        </div>
        <div className="flex flex-col">
          <span className="nx-meta text-[9px] font-bold uppercase tracking-widest">Nodes</span>
          <span className="nx-font-dm text-xs font-bold text-foreground">{data.length}</span>
        </div>
      </div>
    </div>
  );
}
