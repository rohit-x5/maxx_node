import React, { useState } from 'react';
import { 
  Sparkles, 
  Wind, 
  Droplet, 
  TrendingUp, 
  TrendingDown, 
  Copy, 
  Check, 
  Sun 
} from 'lucide-react';
import type { TelemetryPoint } from '../types/telemetry';

interface SmartAdvisorCardProps {
  temperature: number;
  humidity: number;
  history: TelemetryPoint[];
  airQuality?: number;
}

export const SmartAdvisorCard: React.FC<SmartAdvisorCardProps> = ({
  temperature,
  humidity,
  history,
  airQuality = 34,
}) => {
  const [copied, setCopied] = useState(false);

  // Compute thermal drift rate (°C per hour based on rolling points)
  let driftRateTempPerHour = 0.0;
  let driftRateHumPerHour = 0.0;

  if (history.length >= 5) {
    const first = history[0];
    const last = history[history.length - 1];
    const timeDiffHours = (last.timestamp - first.timestamp) / (1000 * 60 * 60);
    if (timeDiffHours > 0.001) {
      driftRateTempPerHour = Number(((last.temperature - first.temperature) / timeDiffHours).toFixed(1));
      driftRateHumPerHour = Number(((last.humidity - first.humidity) / timeDiffHours).toFixed(1));
    }
  }

  // Determine smart ventilation advice
  let windowAdvice = 'Natural ventilation recommended';
  let windowStatus = 'GOOD AIRFLOW';
  let windowBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  if (humidity > 72) {
    windowAdvice = 'Ventilate with exhaust fan or dehumidifier';
    windowStatus = 'MOISTURE CLEARANCE';
    windowBadge = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
  } else if (temperature > 28) {
    windowAdvice = 'Shade windows & enable active air circulation';
    windowStatus = 'HEAT MITIGATION';
    windowBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (humidity < 35) {
    windowAdvice = 'Close drafty windows & run a mist humidifier';
    windowStatus = 'MOISTURE PRESERVATION';
    windowBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }

  // 1-Click Copy formatted summary
  const handleCopySnapshot = () => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const text = `🏡 Climate Snapshot [${timeStr}]\n🌡️ Temp: ${temperature.toFixed(1)}°C (${((temperature * 9) / 5 + 32).toFixed(1)}°F)\n💧 Humidity: ${humidity.toFixed(1)}% RH\n✨ Air Quality: ${airQuality} AQI (Optimal)\n💡 Guidance: ${windowAdvice}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-zinc-900/45 backdrop-blur-xl border border-white/[0.08] p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl space-y-5">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="font-sans font-semibold text-xs tracking-wider uppercase text-zinc-300">
            SMART CLIMATE ADVISOR & TRENDS
          </h3>
        </div>

        {/* Copy Snapshot Button */}
        <button
          onClick={handleCopySnapshot}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.06] transition-all cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
          <span>{copied ? 'Copied Snapshot!' : 'Copy Snapshot'}</span>
        </button>
      </div>

      {/* 2-Column Guidance & Drift Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Ventilation Guidance Card */}
        <div className="bg-black/30 border border-white/[0.05] p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase flex items-center space-x-1.5">
              <Wind className="w-3.5 h-3.5 text-sky-400" />
              <span>VENTILATION ADVISORY</span>
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${windowBadge}`}>
              {windowStatus}
            </span>
          </div>

          <p className="text-sm font-medium text-white">
            {windowAdvice}
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Continuous real-time calculation based on DHT11 hygrometric balance.
          </p>
        </div>

        {/* Thermal Drift & Rate of Change */}
        <div className="bg-black/30 border border-white/[0.05] p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>THERMAL VELOCITY DRIFT</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono-tech">
              HOURLY ESTIMATE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-800/40 p-2.5 rounded-xl">
              <div className="text-[10px] text-zinc-400 uppercase">TEMP DRIFT</div>
              <div className="flex items-center space-x-1 mt-0.5">
                {driftRateTempPerHour > 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                ) : driftRateTempPerHour < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-zinc-500" />
                )}
                <span className="font-mono-tech font-bold text-sm text-white">
                  {driftRateTempPerHour > 0 ? `+${driftRateTempPerHour}` : driftRateTempPerHour}°C/hr
                </span>
              </div>
            </div>

            <div className="bg-zinc-800/40 p-2.5 rounded-xl">
              <div className="text-[10px] text-zinc-400 uppercase">MOISTURE DRIFT</div>
              <div className="flex items-center space-x-1 mt-0.5">
                <Droplet className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-mono-tech font-bold text-sm text-white">
                  {driftRateHumPerHour > 0 ? `+${driftRateHumPerHour}` : driftRateHumPerHour}%/hr
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
