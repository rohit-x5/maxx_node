import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Radio, 
  FileText, 
  Menu,
  X,
  Layers,
  BarChart3,
  Cpu,
  ScrollText
} from 'lucide-react';
import type { ConnectionStatus, DashboardView } from '../types/telemetry';

interface HeaderProps {
  activeView: DashboardView;
  setActiveView: (view: DashboardView) => void;
  connectionStatus: ConnectionStatus;
  packetsReceived: number;
  latencyMs: number;
  isAudioEnabled: boolean;
  toggleAudio: () => void;
  resetStats: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  connectionStatus,
  packetsReceived,
  latencyMs,
  isAudioEnabled,
  toggleAudio,
  resetStats,
  onOpenExportModal,
}) => {
  const [time, setTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    CONNECTED: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
      label: 'Live Online',
    },
    OFFLINE: {
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      dot: 'bg-rose-400 shadow-[0_0_8px_#f87171]',
      label: 'Offline',
    },
    RECONNECTING: {
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      dot: 'bg-amber-400 animate-ping',
      label: 'Connecting...',
    },
    STANDBY: {
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
      dot: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]',
      label: 'Ready',
    },
  };

  const currentStatus = statusConfig[connectionStatus] || statusConfig.CONNECTED;

  const navItems: Array<{ id: DashboardView; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'device', label: 'Device Health', icon: Cpu },
    { id: 'logs', label: 'Audit Log', icon: ScrollText },
  ];

  return (
    <header className="bg-zinc-950/80 border-b border-white/[0.08] px-4 sm:px-8 py-3.5 backdrop-blur-2xl z-40 sticky top-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Node Identifier */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500/20 to-emerald-500/20 border border-white/10 shadow-lg shadow-sky-500/5">
            <Radio className="w-4 h-4 text-sky-400" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-sans font-bold text-base text-white tracking-tight">
                Smart Node
              </span>
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/[0.08] text-zinc-300 border border-white/[0.06]">
                DHT11
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans hidden sm:block">
              Wireless Environmental Monitor
            </p>
          </div>
        </div>

        {/* Center Minimalist Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center bg-zinc-900/60 border border-white/[0.08] p-1 rounded-full text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-zinc-950 font-semibold shadow-md shadow-white/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-3">
          
          {/* Status Pill with Packets & Latency */}
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${currentStatus.bg}`}>
            <span className={`w-2 h-2 rounded-full ${currentStatus.dot}`} />
            <span className={currentStatus.color}>{currentStatus.label}</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400 text-[10px]">{latencyMs}ms ({packetsReceived} pkts)</span>
          </div>

          {/* Clock */}
          <div className="text-xs text-zinc-400 font-mono-tech px-2">
            {time}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleAudio}
            title={isAudioEnabled ? "Mute chimes" : "Enable chimes"}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isAudioEnabled 
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm' 
                : 'bg-zinc-900 border-white/[0.08] text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Export PDF Report */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-semibold shadow-lg shadow-white/5 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          {/* Reset Buffers */}
          <button
            onClick={resetStats}
            title="Reset history buffers"
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

        </div>

        {/* Mobile Actions */}
        <div className="flex items-center space-x-2 lg:hidden">
          <button
            onClick={onOpenExportModal}
            className="px-3 py-1.5 bg-white text-zinc-950 text-xs font-semibold rounded-lg flex items-center space-x-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className="p-2 bg-zinc-900 border border-white/10 rounded-lg text-zinc-300"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-white/10 space-y-3 text-xs bg-zinc-950 p-2 rounded-2xl">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center space-x-1.5 p-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-zinc-950 font-semibold shadow-md'
                      : 'bg-zinc-900 text-zinc-400 border border-white/[0.05]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border ${currentStatus.bg}`}>
              <span className={`w-2 h-2 rounded-full ${currentStatus.dot}`} />
              <span className={`font-medium ${currentStatus.color}`}>{currentStatus.label}</span>
            </div>
            <span className="text-zinc-400 font-mono-tech">{time}</span>
          </div>
        </div>
      )}
    </header>
  );
};
