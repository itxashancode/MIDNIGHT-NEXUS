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
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

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
  data: any;
  title?: string;
}

export default function ChartRenderer({ type, data, title }: ChartRendererProps) {
  const defaultOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: '#4A4A6A',
          font: {
            family: "'Space Mono', monospace",
            size: 10,
          },
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: !!title,
        text: title,
        color: '#F0EBE1',
        font: {
          family: "'Bebas Neue', sans-serif",
          size: 18,
        },
        padding: { bottom: 20 },
      },
      tooltip: {
        backgroundColor: '#0F0F18',
        titleColor: '#00FFE0',
        bodyColor: '#F0EBE1',
        borderColor: '#1A1A2E',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
    scales: (type === 'pie' || type === 'doughnut') ? {} : {
      x: {
        grid: {
          color: 'rgba(26, 26, 46, 0.5)',
          drawBorder: false,
        },
        ticks: {
          color: '#4A4A6A',
          font: { family: "'Space Mono', monospace", size: 10 },
        },
      },
      y: {
        grid: {
          color: 'rgba(26, 26, 46, 0.5)',
          drawBorder: false,
        },
        ticks: {
          color: '#4A4A6A',
          font: { family: "'Space Mono', monospace", size: 10 },
        },
      },
    },
  };

  // Customizing colors for the data based on the theme
  const customData = {
    ...data,
    datasets: (data.datasets || []).map((ds: any) => ({
      ...ds,
      borderColor: '#00FFE0',
      backgroundColor: type === 'line' ? 'rgba(0, 255, 224, 0.1)' : ds.backgroundColor || 'rgba(0, 255, 224, 0.2)',
    }))
  };

  return (
    <div className="w-full h-[350px] p-6 nx-glass-card border-accent/20 my-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
      {type === 'line' && <Line options={defaultOptions} data={customData} />}
      {type === 'bar' && <Bar options={defaultOptions} data={customData} />}
      {type === 'pie' && <Pie options={defaultOptions} data={customData} />}
      {type === 'doughnut' && <Doughnut options={defaultOptions} data={customData} />}
    </div>
  );
}
