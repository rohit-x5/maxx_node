import React, { useState } from 'react';
import { Cpu, Wifi, Database, Copy, Check, Hash } from 'lucide-react';
import { TelemetryCard } from './TelemetryCard';
import type { SensorData, TelemetryStats } from '../types/telemetry';

interface DiagnosticsCardProps {
  data: SensorData;
  stats: TelemetryStats;
}

export const DiagnosticsCard: React.FC<DiagnosticsCardProps> = ({ data, stats }) => {
  const [copied, setCopied] = useState(false);

  const rawJson = JSON.stringify(data, null, 2);

  const copyJson = () => {
    navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const payloadBytes = new Blob([rawJson]).size;

  return (
    <TelemetryCard
      title="System Stream & Feed"
      badge="Raw Telemetry"
      badgeVariant="zinc"
      accentColor="none"
    >
      <div className="space-y-4 font-sans">
        
        {/* Hardware Status Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-black/25 p-2.5 rounded-xl border border-white/[0.04]">
            <div className="flex items-center space-x-1.5 text-zinc-400 text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>MCU Core</span>
            </div>
            <div className="text-white font-medium mt-1">ESP32-S3</div>
            <div className="text-[10px] text-zinc-500">240MHz Dual-Core</div>
          </div>

          <div className="bg-black/25 p-2.5 rounded-xl border border-white/[0.04]">
            <div className="flex items-center space-x-1.5 text-zinc-400 text-[11px]">
              <Wifi className="w-3.5 h-3.5 text-sky-400" />
              <span>Network</span>
            </div>
            <div className="text-white font-medium mt-1">Wi-Fi 802.11</div>
            <div className="text-[10px] text-emerald-400">Connected</div>
          </div>

          <div className="bg-black/25 p-2.5 rounded-xl border border-white/[0.04]">
            <div className="flex items-center space-x-1.5 text-zinc-400 text-[11px]">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Endpoint</span>
            </div>
            <div className="text-white font-medium mt-1 truncate">/sensorData</div>
            <div className="text-[10px] text-zinc-500">Asia-SE1 RTDB</div>
          </div>

          <div className="bg-black/25 p-2.5 rounded-xl border border-white/[0.04]">
            <div className="flex items-center space-x-1.5 text-zinc-400 text-[11px]">
              <Hash className="w-3.5 h-3.5 text-sky-400" />
              <span>Payload</span>
            </div>
            <div className="text-white font-medium mt-1">~{payloadBytes} Bytes</div>
            <div className="text-[10px] text-zinc-500">{stats.packetRatePerMin} msgs/min</div>
          </div>
        </div>

        {/* Live Raw JSON Payload Stream */}
        <div className="bg-black/35 border border-white/[0.06] p-3.5 rounded-2xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-xs">
            <span className="text-[11px] font-medium text-zinc-400 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              <span>Live Sensor Payload</span>
            </span>

            <button
              onClick={copyJson}
              className="flex items-center space-x-1 px-2.5 py-1 bg-zinc-800/60 hover:bg-zinc-800 border border-white/[0.08] rounded-lg text-[11px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="text-xs text-emerald-400/90 font-mono-tech leading-relaxed overflow-x-auto p-1 max-h-40">
            <code>{rawJson}</code>
          </pre>
        </div>

      </div>
    </TelemetryCard>
  );
};
