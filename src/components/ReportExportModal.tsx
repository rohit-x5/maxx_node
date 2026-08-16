import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  X, 
  Clock, 
  Printer, 
  CheckCircle2, 
  BarChart2
} from 'lucide-react';
import type { TelemetryPoint } from '../types/telemetry';
import { exportCSV, exportHighResGraphPNG } from '../utils/exportReport';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TelemetryPoint[];
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  history,
}) => {
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | 'all'>('5m');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const now = Date.now();
  const rangeDurations = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    'all': Infinity,
  };

  const filteredPoints = history.filter((p) => {
    if (timeRange === 'all') return true;
    return now - p.timestamp <= rangeDurations[timeRange];
  });

  const displayPoints = filteredPoints.length > 0 ? filteredPoints : history;

  const temps = displayPoints.map(p => p.temperature);
  const hums = displayPoints.map(p => p.humidity);
  const minTemp = temps.length ? Math.min(...temps) : 0;
  const maxTemp = temps.length ? Math.max(...temps) : 0;
  const avgTemp = temps.length ? Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)) : 0;
  const minHum = hums.length ? Math.min(...hums) : 0;
  const maxHum = hums.length ? Math.max(...hums) : 0;
  const avgHum = hums.length ? Number((hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1)) : 0;

  const handleDownloadPNG = () => {
    exportHighResGraphPNG(displayPoints, timeRange);
    setDownloadSuccess('Graph PNG generated and downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadCSV = () => {
    exportCSV(displayPoints, timeRange);
    setDownloadSuccess('CSV Data Report generated and downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0e1117] border border-zinc-700 shadow-2xl cut-corner-tl p-6 font-mono-tech space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#ff7700]/20 border border-[#ff7700] text-[#ff7700]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-white uppercase tracking-wider">
                EXPORT DHT11 TELEMETRY REPORT & GRAPH
              </h2>
              <p className="text-xs text-zinc-400">
                Generate high-resolution graphical snapshots and structured datasets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-white bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Time Range Selector */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>SELECT REPORT TIME HORIZON</span>
          </label>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: '1m', label: 'LAST 1 MIN' },
              { id: '5m', label: 'LAST 5 MINS' },
              { id: '15m', label: 'LAST 15 MINS' },
              { id: 'all', label: 'FULL BUFFER' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id as typeof timeRange)}
                className={`py-2 text-xs font-bold border transition-all cursor-pointer ${
                  timeRange === t.id
                    ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Filtered Range Summary Preview */}
        <div className="bg-black/50 border border-zinc-800/80 p-4 space-y-3 cut-corner-tl">
          <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/60 pb-2">
            <span className="text-[10px] uppercase text-[#ff7700] font-bold flex items-center space-x-1">
              <BarChart2 className="w-3.5 h-3.5" />
              <span>DATASET SUMMARY PREVIEW</span>
            </span>
            <span>{displayPoints.length} TOTAL SAMPLES</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-zinc-900/60 border border-zinc-800 p-2">
              <div className="text-[9px] text-zinc-500 uppercase">TEMP (MIN / AVG / MAX)</div>
              <div className="text-white font-bold mt-1">
                <span className="text-[#00f0ff]">{minTemp.toFixed(1)}</span> / {avgTemp.toFixed(1)} / <span className="text-[#ff7700]">{maxTemp.toFixed(1)}°C</span>
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 p-2">
              <div className="text-[9px] text-zinc-500 uppercase">HUMIDITY (MIN / AVG / MAX)</div>
              <div className="text-white font-bold mt-1">
                <span className="text-[#00f0ff]">{minHum.toFixed(1)}</span> / {avgHum.toFixed(1)} / <span className="text-[#00f0ff]">{maxHum.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Export Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Download PNG Graph */}
          <button
            onClick={handleDownloadPNG}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-[#ff7700]/20 hover:bg-[#ff7700]/30 border border-[#ff7700] text-[#ff7700] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,119,0,0.2)] cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>GRAPH (PNG)</span>
          </button>

          {/* Download CSV Dataset */}
          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-[#00f0ff]/20 hover:bg-[#00f0ff]/30 border border-[#00f0ff] text-[#00f0ff] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>DATASET (CSV)</span>
          </button>

          {/* Print / PDF Document */}
          <button
            onClick={handlePrint}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / PDF</span>
          </button>

        </div>

        {downloadSuccess && (
          <div className="flex items-center space-x-2 p-2.5 bg-[#00e676]/15 border border-[#00e676] text-[#00e676] text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
        )}

      </div>
    </div>
  );
};
