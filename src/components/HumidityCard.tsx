import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { TelemetryCard } from './TelemetryCard';
import type { TelemetryPoint } from '../types/telemetry';

interface HumidityCardProps {
  humidity: number;
  temperature: number;
  minHumidity: number;
  maxHumidity: number;
  avgHumidity: number;
  history: TelemetryPoint[];
}

export const HumidityCard: React.FC<HumidityCardProps> = ({
  humidity,
  temperature,
  minHumidity,
  maxHumidity,
  avgHumidity,
  history,
}) => {
  // Approximate dew point calculation: Td = T - ((100 - RH)/5)
  const dewPoint = Number((temperature - (100 - humidity) / 5).toFixed(1));

  // Determine moisture level state
  const isDry = humidity < 35;
  const isHigh = humidity > 65;
  const isCritical = humidity > 80;

  const moistureStatus = isCritical
    ? { text: 'High Moisture', badgeVariant: 'crimson' as const }
    : isHigh
    ? { text: 'Elevated Damp', badgeVariant: 'cyan' as const }
    : isDry
    ? { text: 'Dry Air', badgeVariant: 'papaya' as const }
    : { text: 'Balanced Air', badgeVariant: 'emerald' as const };

  // Calculate delta
  const prevHum = history.length > 1 ? history[history.length - 2].humidity : humidity;
  const diff = Number((humidity - prevHum).toFixed(1));

  return (
    <TelemetryCard
      title="Humidity"
      badge={moistureStatus.text}
      badgeVariant={moistureStatus.badgeVariant}
      accentColor="cyan"
      className="relative overflow-hidden"
    >
      <div className="flex flex-col justify-between space-y-5">
        
        {/* Main Humidity Display */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="font-sans font-bold text-5xl sm:text-6xl tracking-tight text-white">
                {humidity.toFixed(1)}
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-sans font-semibold text-sky-400">%</span>
                <span className="text-xs text-zinc-400 font-sans">
                  Dew: {dewPoint}°C
                </span>
              </div>
            </div>
          </div>

          {/* Rate Badge */}
          <div
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
              diff > 0
                ? 'border-sky-500/20 text-sky-400 bg-sky-500/10'
                : diff < 0
                ? 'border-amber-500/20 text-amber-400 bg-amber-500/10'
                : 'border-white/[0.06] text-zinc-400 bg-zinc-800/40'
            }`}
          >
            {diff > 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : diff < 0 ? (
              <ArrowDownRight className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>{diff > 0 ? `+${diff}` : diff}%</span>
          </div>
        </div>

        {/* Minimalist Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span>Range: 20% — 90% RH</span>
            <span className="text-zinc-300 font-medium">{humidity.toFixed(0)}%</span>
          </div>

          <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-sky-400 to-emerald-400"
              style={{ width: `${Math.min(100, Math.max(0, humidity))}%` }}
            />
          </div>
        </div>

        {/* 3-Pill Min / Avg / Max Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-white/[0.06]">
          <div className="bg-black/25 p-2 rounded-xl border border-white/[0.04]">
            <div className="text-[10px] uppercase text-zinc-400">Low</div>
            <div className="text-sm font-semibold text-sky-400 mt-0.5">{minHumidity.toFixed(1)}%</div>
          </div>
          <div className="bg-black/25 p-2 rounded-xl border border-white/[0.04]">
            <div className="text-[10px] uppercase text-zinc-400">Avg</div>
            <div className="text-sm font-semibold text-zinc-200 mt-0.5">{avgHumidity.toFixed(1)}%</div>
          </div>
          <div className="bg-black/25 p-2 rounded-xl border border-white/[0.04]">
            <div className="text-[10px] uppercase text-zinc-400">High</div>
            <div className="text-sm font-semibold text-sky-400 mt-0.5">{maxHumidity.toFixed(1)}%</div>
          </div>
        </div>

      </div>
    </TelemetryCard>
  );
};
