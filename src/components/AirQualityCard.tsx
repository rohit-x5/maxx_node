import React from 'react';
import { Sparkles } from 'lucide-react';
import { TelemetryCard } from './TelemetryCard';
import { calculateAirQuality } from '../utils/analytics';
import type { TelemetryPoint } from '../types/telemetry';

interface AirQualityCardProps {
  airQuality?: number;
  temperature: number;
  humidity: number;
  avgAirQuality?: number;
  history?: TelemetryPoint[];
}

export const AirQualityCard: React.FC<AirQualityCardProps> = ({
  airQuality,
  temperature,
  humidity,
  avgAirQuality = 34,
}) => {
  const { aqi, category, pm25 } = calculateAirQuality(
    airQuality,
    temperature,
    humidity
  );

  // Scale: 0 - 200 AQI
  const percentage = Math.min(100, Math.max(0, (aqi / 200) * 100));

  const isGood = aqi <= 50;
  const isModerate = aqi > 50 && aqi <= 100;

  return (
    <TelemetryCard
      title="Air Quality"
      badge={category}
      badgeVariant={isGood ? 'emerald' : isModerate ? 'papaya' : 'crimson'}
      accentColor={isGood ? 'emerald' : isModerate ? 'papaya' : 'crimson'}
      className="relative overflow-hidden"
    >
      <div className="flex flex-col justify-between space-y-5">
        
        {/* Main AQI Readout */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="font-sans font-bold text-5xl sm:text-6xl tracking-tight text-white">
                {aqi}
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-sans font-semibold text-emerald-400">AQI</span>
                <span className="text-xs text-zinc-400 font-sans">
                  PM2.5: {pm25} µg/m³
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clean Air</span>
          </div>
        </div>

        {/* Minimalist Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <span>Air Purity Rating</span>
            <span className="text-zinc-300 font-medium">{100 - Math.min(100, Math.round(aqi * 0.4))}% Pure</span>
          </div>

          <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* 3-Pill Status Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-white/[0.06]">
          <div className="bg-black/25 p-2 rounded-xl border border-white/[0.04]">
            <div className="text-[10px] uppercase text-zinc-400">Rating</div>
            <div className="text-sm font-semibold text-emerald-400 mt-0.5 truncate">{category}</div>
          </div>
          <div className="bg-black/25 p-2 rounded-xl border border-white/[0.04]">
            <div className="text-[10px] uppercase text-zinc-400">Avg AQI</div>
            <div className="text-sm font-semibold text-zinc-200 mt-0.5">{avgAirQuality}</div>
          </div>
          <div className="bg-black/25 p-2 rounded-xl border border-white/[0.04]">
            <div className="text-[10px] uppercase text-zinc-400">PM2.5</div>
            <div className="text-sm font-semibold text-sky-400 mt-0.5">{pm25} µg</div>
          </div>
        </div>

      </div>
    </TelemetryCard>
  );
};
