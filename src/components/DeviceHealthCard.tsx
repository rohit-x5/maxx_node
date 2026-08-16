import React from 'react';
import { 
  Battery, 
  BatteryCharging, 
  Wifi, 
  Zap, 
  Clock, 
  Cpu, 
  ShieldCheck, 
  Database
} from 'lucide-react';
import { TelemetryCard } from './TelemetryCard';
import type { SensorData, TelemetryStats, ConnectionStatus } from '../types/telemetry';

interface DeviceHealthCardProps {
  data: SensorData;
  stats: TelemetryStats;
  connectionStatus: ConnectionStatus;
  className?: string;
}

function formatUptime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export const DeviceHealthCard: React.FC<DeviceHealthCardProps> = ({
  data,
  stats,
  connectionStatus,
  className,
}) => {
  const battery = data.battery ?? 98;
  const voltage = data.voltage ?? 3.32;
  const rssi = data.rssi ?? -56;
  const uptimeStr = formatUptime(stats.uptimeSeconds);

  // RSSI Signal Quality calculation
  const rssiPercent = Math.min(100, Math.max(10, Math.round(((rssi + 100) / 70) * 100)));
  const signalQuality = rssi >= -60 ? 'Strong' : rssi >= -75 ? 'Good' : 'Fair';
  const signalColor = rssi >= -60 ? 'text-emerald-400' : rssi >= -75 ? 'text-sky-400' : 'text-amber-400';

  return (
    <TelemetryCard
      title="Hardware Health & Link"
      badge={connectionStatus === 'CONNECTED' ? 'Online' : connectionStatus}
      badgeVariant={connectionStatus === 'CONNECTED' ? 'emerald' : 'papaya'}
      accentColor="none"
      className={className}
    >
      <div className="space-y-4 font-sans">
        
        {/* Main 4-Grid Diagnostic Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          {/* 1. Battery / Power Level */}
          <div className="bg-black/25 p-3 rounded-2xl border border-white/[0.04] space-y-1.5">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center space-x-1.5">
                {battery > 20 ? (
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <BatteryCharging className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span>Battery</span>
              </span>
              <span className="text-emerald-400 font-medium">{voltage.toFixed(2)}V</span>
            </div>

            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-white">{battery}%</span>
            </div>

            {/* Battery bar */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                style={{ width: `${battery}%` }}
              />
            </div>
          </div>

          {/* 2. Wi-Fi Signal & RSSI */}
          <div className="bg-black/25 p-3 rounded-2xl border border-white/[0.04] space-y-1.5">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center space-x-1.5">
                <Wifi className="w-3.5 h-3.5 text-sky-400" />
                <span>Wi-Fi</span>
              </span>
              <span className={`font-medium ${signalColor}`}>{signalQuality}</span>
            </div>

            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-white">{rssi}</span>
              <span className="text-xs text-sky-400 font-medium">dBm</span>
            </div>

            {/* RSSI bar */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-sky-400"
                style={{ width: `${rssiPercent}%` }}
              />
            </div>
          </div>

          {/* 3. Latency & Packet Rate */}
          <div className="bg-black/25 p-3 rounded-2xl border border-white/[0.04] space-y-1.5">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Latency</span>
              </span>
              <span className="text-emerald-400 font-medium">100%</span>
            </div>

            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-white">{stats.latencyMs}</span>
              <span className="text-xs text-amber-400 font-medium">ms</span>
            </div>

            <div className="text-[10px] text-zinc-400 truncate">
              {stats.packetRatePerMin} msgs/min
            </div>
          </div>

          {/* 4. Continuous Node Uptime */}
          <div className="bg-black/25 p-3 rounded-2xl border border-white/[0.04] space-y-1.5">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Uptime</span>
              </span>
              <span className="text-emerald-400 text-[10px] font-medium">Active</span>
            </div>

            <div className="flex items-baseline space-x-1">
              <span className="text-lg sm:text-xl font-bold text-white truncate">{uptimeStr}</span>
            </div>

            <div className="text-[10px] text-zinc-400 truncate">
              Zero drops
            </div>
          </div>

        </div>

        {/* Hardware Architecture Banner */}
        <div className="p-3.5 bg-black/30 border border-white/[0.04] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800/80 border border-white/[0.08] flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-white font-medium flex items-center space-x-2">
                <span>ESP32-S3 Node + DHT11</span>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  240 MHz
                </span>
              </div>
              <div className="text-zinc-400 text-[11px] mt-0.5">
                Low-power Wi-Fi & Sensor Hub
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 shrink-0 text-[11px] text-zinc-400">
            <div className="flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Firebase RTDB</span>
            </div>
            <div className="flex items-center space-x-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure SSL</span>
            </div>
          </div>
        </div>

      </div>
    </TelemetryCard>
  );
};
