'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { useTheme } from 'next-themes';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartRendererProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: ChartData<any>;
  title?: string;
}

export function ChartRenderer({ type, data, title }: ChartRendererProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const defaultOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: isDark ? '#a1a1aa' : '#71717a',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: !!title,
        text: title,
        color: isDark ? '#f4f4f5' : '#18181b',
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: '600',
        },
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        titleColor: isDark ? '#f4f4f5' : '#18181b',
        bodyColor: isDark ? '#a1a1aa' : '#71717a',
        borderColor: isDark ? '#27272a' : '#e4e4e7',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
      },
    },
    scales: type === 'pie' || type === 'doughnut' ? {} : {
      x: {
        grid: {
          color: isDark ? 'rgba(39, 39, 42, 0.5)' : 'rgba(228, 228, 231, 0.5)',
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#a1a1aa' : '#71717a',
        },
      },
      y: {
        grid: {
          color: isDark ? 'rgba(39, 39, 42, 0.5)' : 'rgba(228, 228, 231, 0.5)',
          drawBorder: false,
        },
        ticks: {
          color: isDark ? '#a1a1aa' : '#71717a',
        },
      },
    },
  };

  return (
    <div className="w-full h-[350px] p-6 bg-zinc-900/50 dark:bg-zinc-900/30 rounded-2xl border border-border/50 backdrop-blur-sm my-6 overflow-hidden">
      {type === 'line' && <Line options={defaultOptions} data={data} />}
      {type === 'bar' && <Bar options={defaultOptions} data={data} />}
      {type === 'pie' && <Pie options={defaultOptions} data={data} />}
      {type === 'doughnut' && <Doughnut options={defaultOptions} data={data} />}
    </div>
  );
}
