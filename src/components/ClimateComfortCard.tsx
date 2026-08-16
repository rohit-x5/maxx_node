import React from 'react';
import { Sparkles, HeartPulse, Droplet, Thermometer } from 'lucide-react';
import { TelemetryCard } from './TelemetryCard';
import { calculateDewPoint } from '../utils/dewPoint';
import { calculateVPD } from '../utils/analytics';

interface ClimateComfortCardProps {
  temperature: number;
  humidity: number;
}

export const ClimateComfortCard: React.FC<ClimateComfortCardProps> = ({
  temperature,
  humidity,
}) => {
  const dewPoint = calculateDewPoint(temperature, humidity);
  const { vpdKpa } = calculateVPD(temperature, humidity);

  // Determine Living Comfort Sensation
  let comfortLevel = 'IDEAL COMFORT';
  let comfortColor = 'text-[#00e676]';
  let comfortBadge = 'bg-[#00e676]/15 border-[#00e676]/40 text-[#00e676]';

  if (humidity > 75 && temperature > 27) {
    comfortLevel = 'MUGGY // HUMID HEAT';
    comfortColor = 'text-[#ff1744]';
    comfortBadge = 'bg-[#ff1744]/15 border-[#ff1744]/40 text-[#ff1744]';
  } else if (humidity > 70) {
    comfortLevel = 'DAMP // ELEVATED MOISTURE';
    comfortColor = 'text-[#00f0ff]';
    comfortBadge = 'bg-[#00f0ff]/15 border-[#00f0ff]/40 text-[#00f0ff]';
  } else if (humidity < 30) {
    comfortLevel = 'DRY // DESICCATED';
    comfortColor = 'text-[#ffb703]';
    comfortBadge = 'bg-[#ffb703]/15 border-[#ffb703]/40 text-[#ffb703]';
  } else if (temperature > 28) {
    comfortLevel = 'WARM // COOLING ADVISED';
    comfortColor = 'text-[#ff7700]';
    comfortBadge = 'bg-[#ff7700]/15 border-[#ff7700]/40 text-[#ff7700]';
  } else if (temperature < 19) {
    comfortLevel = 'COOL // HEATING ADVISED';
    comfortColor = 'text-[#00f0ff]';
    comfortBadge = 'bg-[#00f0ff]/15 border-[#00f0ff]/40 text-[#00f0ff]';
  }

  // Mold Hazard Risk
  const moldRisk = humidity > 80 ? 'HIGH HAZARD' : humidity > 65 ? 'MODERATE' : 'LOW RISK';
  const moldColor = humidity > 80 ? 'text-[#ff1744]' : humidity > 65 ? 'text-[#ff7700]' : 'text-[#00e676]';

  // Overall Climate Productivity Score (0-100)
  const tempDiff = Math.abs(temperature - 22.5);
  const humDiff = Math.abs(humidity - 50);
  const comfortScore = Math.max(25, Math.min(100, Math.round(100 - tempDiff * 3.5 - humDiff * 0.5)));

  return (
    <TelemetryCard
      title="CLIMATE COMFORT // LIVING & WORKPLACE ERGONOMICS"
      badge={comfortLevel.split(' // ')[0]}
      badgeVariant={comfortScore >= 75 ? 'emerald' : comfortScore >= 50 ? 'cyan' : 'papaya'}
      serialCode="ENV-COMFORT-INDEX"
      accentColor={comfortScore >= 75 ? 'emerald' : comfortScore >= 50 ? 'cyan' : 'papaya'}
      className="relative overflow-hidden"
    >
      {/* Background watermark icon */}
      <HeartPulse className="absolute -right-6 -bottom-6 w-36 h-36 text-zinc-800/15 pointer-events-none stroke-1" />

      <div className="flex flex-col justify-between space-y-6">
        
        {/* Main Readout Section */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-mono-tech uppercase tracking-widest text-zinc-400 flex items-center space-x-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>CLIMATE COMFORT RATING</span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="font-mono-tech font-black text-5xl sm:text-6xl tracking-tighter text-white">
                {comfortScore}
              </span>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-mono-tech font-bold text-[#00f0ff]">/100</span>
                <span className="text-[10px] font-mono-tech text-zinc-500">
                  DEW PT: {dewPoint}°C
                </span>
              </div>
            </div>
          </div>

          {/* Comfort pill */}
          <div className="flex flex-col items-end">
            <div className={`px-2.5 py-1 text-xs font-mono-tech border ${comfortBadge}`}>
              <span className="font-bold">{comfortLevel.split(' // ')[0]}</span>
            </div>
            <span className="text-[9px] font-mono-tech text-zinc-500 mt-1 uppercase">Sensation</span>
          </div>
        </div>

        {/* Dynamic Comfort Quality Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono-tech text-zinc-400">
            <span className="flex items-center space-x-1">
              <Thermometer className="w-3 h-3 text-[#00e676]" />
              <span>ERGONOMIC EFFICIENCY: {comfortScore}%</span>
            </span>
            <span className="text-zinc-300 font-bold">{comfortScore >= 75 ? 'OPTIMAL' : 'MODERATE'}</span>
          </div>

          <div className="relative w-full h-3 bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="absolute inset-0 flex justify-between px-1 pointer-events-none z-10 opacity-30">
              <span className="w-px h-full bg-zinc-500" />
              <span className="w-px h-full bg-zinc-500" />
              <span className="w-px h-full bg-zinc-500" />
              <span className="w-px h-full bg-zinc-500" />
            </div>

            <div
              className="h-full transition-all duration-700 bg-gradient-to-r from-[#00f0ff] via-[#00e676] to-[#ff7700]"
              style={{ width: `${comfortScore}%` }}
            />
          </div>
        </div>

        {/* Technical Status Strip & 3-Column Stats */}
        <div className="space-y-3 pt-3 border-t border-zinc-800/80">
          <div className="px-2.5 py-1.5 bg-zinc-900/60 border border-zinc-800 text-xs font-mono-tech text-zinc-300 flex items-center justify-between">
            <span className="text-[10px] uppercase text-zinc-500">THERMAL STATE:</span>
            <span className={`text-[11px] font-bold ${comfortColor}`}>{comfortLevel}</span>
          </div>

          {/* 3-column stats */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono-tech">
            <div className="bg-zinc-900/60 border border-zinc-800/60 p-2">
              <div className="text-[9px] uppercase tracking-wider text-zinc-500">DEW POINT</div>
              <div className="text-sm font-bold text-[#00f0ff] mt-0.5">{dewPoint}°C</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/60 p-2">
              <div className="text-[9px] uppercase tracking-wider text-zinc-500">MOLD RISK</div>
              <div className={`text-sm font-bold mt-0.5 ${moldColor}`}>{moldRisk}</div>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/60 p-2">
              <div className="text-[9px] uppercase tracking-wider text-zinc-500">VPD</div>
              <div className="text-sm font-bold text-[#00e676] mt-0.5 flex items-center justify-center space-x-1">
                <Droplet className="w-3 h-3 inline" />
                <span>{vpdKpa} kPa</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </TelemetryCard>
  );
};
