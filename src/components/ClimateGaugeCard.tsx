import React from 'react';
import { Thermometer, Droplets, HeartPulse, Droplet } from 'lucide-react';
import { calculateDewPoint } from '../utils/dewPoint';
import { calculateVPD } from '../utils/analytics';

interface ClimateGaugeCardProps {
  temperature: number;
  humidity: number;
}

export const ClimateGaugeCard: React.FC<ClimateGaugeCardProps> = ({
  temperature,
  humidity,
}) => {
  const dewPoint = calculateDewPoint(temperature, humidity);
  const { vpdKpa } = calculateVPD(temperature, humidity);

  // Overall Score (0-100)
  const tempDiff = Math.abs(temperature - 22.5);
  const humDiff = Math.abs(humidity - 50);
  const comfortScore = Math.max(20, Math.min(100, Math.round(100 - tempDiff * 3.5 - humDiff * 0.5)));

  // SVG Gauge calculations
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (comfortScore / 100) * circumference;

  let scoreGrade = 'Optimal Balance';
  let scoreColor = 'text-emerald-400';

  if (comfortScore < 50) {
    scoreGrade = 'Needs Attention';
    scoreColor = 'text-rose-400';
  } else if (comfortScore < 75) {
    scoreGrade = 'Moderate Condition';
    scoreColor = 'text-amber-400';
  }

  return (
    <div className="bg-zinc-900/45 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center space-x-2">
          <HeartPulse className="w-4 h-4 text-emerald-400" />
          <h3 className="font-sans font-semibold text-xs tracking-wider uppercase text-zinc-300">
            OVERALL CLIMATE HEALTH
          </h3>
        </div>

        <span className="px-2.5 py-0.5 text-[11px] font-medium tracking-wide border rounded-full text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
          DHT11 LIVE
        </span>
      </div>

      {/* Circular Dial & Center Rating */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        
        {/* SVG Circular Progress Gauge */}
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated Value Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#climateGaugeGradient)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="climateGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="60%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-bold font-sans tracking-tight text-white">
              {comfortScore}
            </span>
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              SCORE / 100
            </span>
          </div>
        </div>

        {/* 3 Pill Metrics */}
        <div className="flex-1 w-full space-y-2.5">
          <div className="flex items-center justify-between p-2.5 bg-black/30 border border-white/[0.04] rounded-xl text-xs">
            <div className="flex items-center space-x-2 text-zinc-400">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span>Core Temperature</span>
            </div>
            <span className="font-mono-tech font-bold text-white text-sm">
              {temperature.toFixed(1)}°C
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-black/30 border border-white/[0.04] rounded-xl text-xs">
            <div className="flex items-center space-x-2 text-zinc-400">
              <Droplets className="w-4 h-4 text-sky-400" />
              <span>Relative Humidity</span>
            </div>
            <span className="font-mono-tech font-bold text-white text-sm">
              {humidity.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-black/30 border border-white/[0.04] rounded-xl text-xs">
            <div className="flex items-center space-x-2 text-zinc-400">
              <Droplet className="w-4 h-4 text-emerald-400" />
              <span>VPD / Dew Point</span>
            </div>
            <span className="font-mono-tech font-bold text-emerald-400 text-sm">
              {vpdKpa} kPa ({dewPoint}°C)
            </span>
          </div>
        </div>

      </div>

      {/* Footer Condition Evaluation */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.06] text-xs">
        <span className="text-zinc-400">Status Evaluation:</span>
        <span className={`font-semibold ${scoreColor}`}>{scoreGrade}</span>
      </div>

    </div>
  );
};
