import React from 'react';
import { 
  Wind, 
  ThermometerSun, 
  Zap, 
  Gauge, 
  Percent, 
  Sun, 
  Compass, 
  Activity, 
  Droplet 
} from 'lucide-react';
import { TelemetryCard } from './TelemetryCard';
import { 
  calculateVPD, 
  calculateHeatIndex, 
  calculateAbsoluteHumidity, 
  calculateAnomalyIndex, 
  calculatePressure 
} from '../utils/analytics';
import { calculateDewPoint } from '../utils/dewPoint';
import type { TelemetryPoint, TelemetryStats } from '../types/telemetry';

interface AdvancedAnalyticsCardProps {
  temperature: number;
  humidity: number;
  pressure?: number;
  lux?: number;
  history: TelemetryPoint[];
  stats: TelemetryStats;
}

export const AdvancedAnalyticsCard: React.FC<AdvancedAnalyticsCardProps> = ({
  temperature,
  humidity,
  pressure,
  lux = 480,
  history,
  stats,
}) => {
  const { vpdKpa, status: vpdStatus } = calculateVPD(temperature, humidity);
  const heatIndex = calculateHeatIndex(temperature, humidity);
  const absoluteHumidity = calculateAbsoluteHumidity(temperature, humidity);
  const dewPoint = calculateDewPoint(temperature, humidity);
  const press = calculatePressure(pressure);

  // Anomaly calculation
  const recentTemps = history.map(h => h.temperature);
  const anomaly = calculateAnomalyIndex(temperature, recentTemps);

  // Dew point spread
  const dewSpread = Number((temperature - dewPoint).toFixed(1));

  // Lux daylight category
  const daylightCategory = lux > 500 ? 'Bright Daylight' : lux > 100 ? 'Indoor Ambient' : 'Dim Light';

  return (
    <TelemetryCard
      title="Advanced Climate Analytics"
      badge="DSP Metrics"
      badgeVariant="cyan"
      accentColor="cyan"
      className="col-span-full"
    >
      <div className="space-y-5 font-sans">
        
        {/* Top 6-Block Sensor Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          
          {/* 1. Vapor Pressure Deficit (VPD) */}
          <div className="bg-black/25 border border-white/[0.04] p-4 rounded-2xl space-y-2 hover:border-sky-500/30 transition-colors">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center space-x-1.5 text-[11px] uppercase">
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                <span>VPD (Transpiration)</span>
              </span>
              <span className="px-2 py-0.2 text-[10px] rounded-full border border-sky-500/20 text-sky-400 bg-sky-500/10">
                kPA
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white">{vpdKpa}</span>
              <span className="text-xs text-sky-400 font-medium">kPa</span>
            </div>

            <div className="text-[11px] font-medium text-emerald-400 truncate">
              {vpdStatus}
            </div>
          </div>

          {/* 2. Heat Index (Feels Like) */}
          <div className="bg-black/25 border border-white/[0.04] p-4 rounded-2xl space-y-2 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center space-x-1.5 text-[11px] uppercase">
                <ThermometerSun className="w-3.5 h-3.5 text-amber-400" />
                <span>Feels Like (Heat Index)</span>
              </span>
              <span className="px-2 py-0.2 text-[10px] rounded-full border border-amber-500/20 text-amber-400 bg-amber-500/10">
                °C
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white">{heatIndex}</span>
              <span className="text-xs text-amber-400 font-medium">°C</span>
              <span className="text-xs text-zinc-400">({((heatIndex * 9) / 5 + 32).toFixed(1)}°F)</span>
            </div>

            <div className="text-[11px] text-zinc-400 truncate">
              Apparent living comfort load
            </div>
          </div>

          {/* 3. Absolute Humidity (g/m³) */}
          <div className="bg-black/25 border border-white/[0.04] p-4 rounded-2xl space-y-2 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center space-x-1.5 text-[11px] uppercase">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>Absolute Humidity</span>
              </span>
              <span className="px-2 py-0.2 text-[10px] rounded-full border border-emerald-500/20 text-emerald-400 bg-emerald-500/10">
                g/m³
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white">{absoluteHumidity}</span>
              <span className="text-xs text-emerald-400 font-medium">g/m³</span>
            </div>

            <div className="text-[11px] text-zinc-400 truncate">
              Volumetric moisture density
            </div>
          </div>

          {/* 4. Atmospheric Pressure / Barometer */}
          <div className="bg-black/25 border border-white/[0.04] p-4 rounded-2xl space-y-2 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center space-x-1.5 text-[11px] uppercase">
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                <span>Barometric Pressure</span>
              </span>
              <span className="px-2 py-0.2 text-[10px] rounded-full border border-purple-500/20 text-purple-400 bg-purple-500/10">
                hPa
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white">{press.hPa.toFixed(1)}</span>
              <span className="text-xs text-purple-400 font-medium">hPa</span>
              <span className="text-xs text-zinc-400">({press.inHg} inHg)</span>
            </div>

            <div className="text-[11px] font-medium text-purple-400 truncate">
              {press.condition}
            </div>
          </div>

          {/* 5. Ambient Optical Illuminance */}
          <div className="bg-black/25 border border-white/[0.04] p-4 rounded-2xl space-y-2 hover:border-sky-500/30 transition-colors">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center space-x-1.5 text-[11px] uppercase">
                <Sun className="w-3.5 h-3.5 text-sky-400" />
                <span>Ambient Illuminance</span>
              </span>
              <span className="px-2 py-0.2 text-[10px] rounded-full border border-sky-500/20 text-sky-400 bg-sky-500/10">
                LUX
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white">{lux}</span>
              <span className="text-xs text-sky-400 font-medium">Lux</span>
            </div>

            <div className="text-[11px] text-sky-400 font-medium truncate">
              {daylightCategory}
            </div>
          </div>

          {/* 6. Thermal Noise & Stability */}
          <div className="bg-black/25 border border-white/[0.04] p-4 rounded-2xl space-y-2 hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center space-x-1.5 text-[11px] uppercase">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Sensor Stability</span>
              </span>
              <span className="px-2 py-0.2 text-[10px] rounded-full border border-white/[0.08] text-zinc-400">
                Z-Score
              </span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-white">
                {anomaly.score}%
              </span>
              <span className="text-xs text-zinc-400 font-medium">Variance</span>
            </div>

            <div className="text-[11px] text-zinc-400 font-medium truncate">
              {anomaly.label}
            </div>
          </div>

        </div>

        {/* 3-Pill Bottom Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-3 border-t border-white/[0.06]">
          <div className="bg-black/25 border border-white/[0.04] p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Droplet className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">Dew Margin</div>
                <div className="text-white font-semibold">{dewSpread}°C Margin</div>
              </div>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">
              {dewSpread > 4 ? 'Optimal' : 'Condensation'}
            </div>
          </div>

          <div className="bg-black/25 border border-white/[0.04] p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">Packet Cadence</div>
                <div className="text-white font-semibold">2000ms Interval</div>
              </div>
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">
              100% Health
            </div>
          </div>

          <div className="bg-black/25 border border-white/[0.04] p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase">Sampling Rate</div>
                <div className="text-white font-semibold">{stats.packetRatePerMin} msgs/min</div>
              </div>
            </div>
            <div className="text-[11px] text-zinc-400">
              DHT11 Stream
            </div>
          </div>
        </div>

      </div>
    </TelemetryCard>
  );
};
