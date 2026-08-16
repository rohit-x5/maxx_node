import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { TelemetryCard } from './TelemetryCard';
import type { TelemetryPoint } from '../types/telemetry';

interface TemperatureCardProps {
  temperature: number;
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  history: TelemetryPoint[];
}

export const TemperatureCard: React.FC<TemperatureCardProps> = ({
  temperature,
  minTemp,
  maxTemp,
  avgTemp,
  history,
}) => {
  // Normalize thermal level (range 10°C to 45°C)
  const clampedTemp = Math.max(10, Math.min(45, temperature));
  const percentage = ((clampedTemp - 10) / (45 - 10)) * 100;

  // Determine condition state
  const isCold = temperature < 19;
  const isHot = temperature > 28;
  const isCritical = temperature > 36;

  const thermalStatus = isCritical
    ? { text: 'High Heat', color: 'text-rose-400', badgeVariant: 'crimson' as const }
    : isHot
    ? { text: 'Warm Climate', color: 'text-amber-400', badgeVariant: 'papaya' as const }
    : isCold
    ? { text: 'Cool Room', color: 'text-sky-400', badgeVariant: 'cyan' as const }
    : { text: 'Optimal Temperature', color: 'text-emerald-400', badgeVariant: 'emerald' as const };

  // Calculate delta
  const prevTemp = history.length > 1 ? history[history.length - 2].temperature : temperature;
  const diff = Number((temperature - prevTemp).toFixed(1));

  return (
    <TelemetryCard
      title="Temperature"
      badge={thermalStatus.text}
      badgeVariant={thermalStatus.badgeVariant}
      accentColor="papaya"
      className="relative overflow-hidden"
    >
      <div className="flex flex-col justify-between space-y-5">
        
        {/* Main Temperature Display */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="font-sans font-bold text-5xl sm:text-6xl tracking-tight text-white">
                {temperature.toFixed(1)}
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-sans font-semibold text-amber-400">°C</span>
                <span className="text-xs text-zinc-400 font-sans">
                  {((temperature * 9) / 5 + 32).toFixed(1)}°F
                </span>
              </div>
            </div>
          </div>

          {/* Rate Badge */}
          <div
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
              diff > 0
                ? 'border-amber-500/20 text-amber-400 bg-amber-500/10'
                : diff < 0
                ? 'border-sky-500/20 text-sky-400 bg-sky-500/10'
                : 'border-white/[0.06] text-zinc-400 bg-zinc-800/40'
            }`}
          >
            {diff > 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : diff < 0 ? (
              <ArrowDownRight className="w-3.5 h-3.5" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5" />
            )}
            <span>{diff > 0 ? `+${diff}` : diff}°C</span>
          </div>
        </div>

        {/* Minimalist Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span>Scale: 10°C — 45°C</span>
            <span className="text-zinc-300 font-medium">{percentage.toFixed(0)}%</span>
          </div>

          <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* 3-Pill Min / Avg / Max Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-white/[0.06]">
          <div className="bg-black/25 p-2 rounded-xl border border-white/[0.04]">
            <div className="text-[10px] uppercase text-zinc-400">Low</div>
            <div className="text-sm font-semibold text-sky-400 mt-0.5">{minTemp.toFixed(1)}°C</div>
          </div>
          <div className="bg-black/25 p-2 rounded-xl border border-white/[0.04]">
            <div className="text-[10px] uppercase text-zinc-400">Avg</div>
            <div className="text-sm font-semibold text-zinc-200 mt-0.5">{avgTemp.toFixed(1)}°C</div>
          </div>
          <div className="bg-black/25 p-2 rounded-xl border border-white/[0.04]">
            <div className="text-[10px] uppercase text-zinc-400">High</div>
            <div className="text-sm font-semibold text-amber-400 mt-0.5">{maxTemp.toFixed(1)}°C</div>
          </div>
        </div>

      </div>
    </TelemetryCard>
  );
};
