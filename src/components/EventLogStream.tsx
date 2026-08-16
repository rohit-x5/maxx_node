import React, { useState } from 'react';
import { Terminal, AlertTriangle, CheckCircle2, Info, Droplets, Wind, Trash2 } from 'lucide-react';
import { TelemetryCard } from './TelemetryCard';
import type { LogEntry } from '../types/telemetry';

interface EventLogStreamProps {
  logs: LogEntry[];
  clearLogs: () => void;
}

export const EventLogStream: React.FC<EventLogStreamProps> = ({ logs, clearLogs }) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'SYSTEM'>('ALL');

  const filteredLogs = logs.filter(log => {
    if (filter === 'CRITICAL') return log.level === 'critical' || log.level === 'warn';
    if (filter === 'SYSTEM') return log.type === 'CONNECTION' || log.type === 'INFO';
    return true;
  });

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'critical':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'warn':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'success':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
    }
  };

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'TEMP_WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'HUMIDITY_ALERT':
        return <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      case 'AIR_QUALITY':
        return <Wind className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'CONNECTION':
        return <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
  };

  return (
    <TelemetryCard
      title="Realtime Activity & Audit Log"
      badge="Event Stream"
      badgeVariant="zinc"
      accentColor="none"
    >
      <div className="space-y-3 font-sans">
        
        {/* Filter controls & clear button */}
        <div className="flex items-center justify-between text-xs pb-2 border-b border-white/[0.06]">
          <div className="flex items-center space-x-1.5">
            {(['ALL', 'CRITICAL', 'SYSTEM'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  filter === f
                    ? 'bg-white text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-white bg-zinc-800/40'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              {filteredLogs.length} events logged
            </span>
            <button
              onClick={clearLogs}
              title="Clear event log"
              className="flex items-center space-x-1 text-xs text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Scrollable Event Log List */}
        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              <Terminal className="w-5 h-5 mx-auto mb-2 opacity-40" />
              No events recorded yet
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start space-x-3 p-2.5 bg-black/20 hover:bg-black/35 border border-white/[0.04] rounded-xl text-xs transition-colors"
              >
                <div className="mt-0.5">{getIcon(log.type)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-zinc-400 font-mono-tech">{log.timestamp}</span>
                    <span className={`px-2 py-0.2 text-[9px] rounded-full uppercase font-medium border ${getLevelBadge(log.level)}`}>
                      {log.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-xs mt-0.5 break-words">
                    {log.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </TelemetryCard>
  );
};
