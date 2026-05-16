"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

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
        data: data,
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
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
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 10, family: "JetBrains Mono" },
        bodyFont: { size: 10, family: "JetBrains Mono" },
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        min: 0,
        max: Math.max(...data, 100) + 10,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="p-6 rounded-3xl border border-primary/20 bg-primary/[0.02] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-subheading font-bold uppercase tracking-widest text-foreground">Cognitive Drift</h3>
            <p className="text-[10px] text-muted font-body uppercase tracking-tighter">Real-time Entropy Variance</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold font-mono text-primary">
            {data.length > 0 ? data[data.length - 1].toFixed(1) : "0.0"}
          </span>
          <span className="text-[10px] font-black text-primary/60 ml-1">Δ</span>
        </div>
      </div>

      <div className="h-[120px] w-full">
        <Line data={chartData} options={options} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-primary/10 pt-4">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Stability</span>
          <span className="text-xs font-mono font-bold text-foreground">98.4%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Latency</span>
          <span className="text-xs font-mono font-bold text-foreground">24ms</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Nodes</span>
          <span className="text-xs font-mono font-bold text-foreground">{data.length}</span>
        </div>
      </div>
    </motion.div>
  );
}
