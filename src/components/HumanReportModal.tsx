import React, { useState } from 'react';
import { 
  Printer, 
  FileText, 
  X, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  FileSpreadsheet, 
  Image as ImageIcon 
} from 'lucide-react';
import type { TelemetryPoint } from '../types/telemetry';
import { generateHumanPrintableReport } from '../utils/humanReport';
import { exportCSV, exportHighResGraphPNG } from '../utils/exportReport';
import { generateAiEnvironmentalAnalysis } from '../utils/aiAnalysis';

interface HumanReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TelemetryPoint[];
  currentTemp: number;
  currentHum: number;
}

export const HumanReportModal: React.FC<HumanReportModalProps> = ({
  isOpen,
  onClose,
  history,
  currentTemp,
  currentHum,
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

  const ai = generateAiEnvironmentalAnalysis(currentTemp, currentHum);

  const handlePrintPdf = () => {
    generateHumanPrintableReport(
      displayPoints,
      currentTemp,
      currentHum,
      timeRange
    );
    setDownloadSuccess('Print / PDF Briefing opened successfully!');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleDownloadPNG = () => {
    exportHighResGraphPNG(displayPoints, timeRange);
    setDownloadSuccess('Graph image generated and saved to downloads!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadCSV = () => {
    exportCSV(displayPoints, timeRange);
    setDownloadSuccess('Raw data CSV saved to downloads!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e1117] border border-zinc-700 shadow-2xl cut-corner-tl p-4 sm:p-6 font-mono-tech space-y-5 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#ff7700]/20 border border-[#ff7700] text-[#ff7700] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-black text-base sm:text-lg text-white uppercase tracking-wider">
                EXECUTIVE ENVIRONMENTAL BRIEFING & PDF
              </h2>
              <p className="text-xs text-zinc-400 font-sans">
                Summary report for DHT11 temperature and humidity telemetry
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

        {/* 1. Time Horizon Filter */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>SELECT REPORT TIME HORIZON</span>
          </label>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: '1m', label: '1 MIN' },
              { id: '5m', label: '5 MINS' },
              { id: '15m', label: '15 MINS' },
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

        {/* 2. Plain-English Executive Summary Preview */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 space-y-3 cut-corner-tl">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#ff7700] uppercase flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EXECUTIVE PREVIEW</span>
            </span>
            <span className={`px-2 py-0.5 text-xs font-bold border ${ai.overallScore >= 75 ? 'border-[#00e676]/40 text-[#00e676] bg-[#00e676]/10' : 'border-[#ff7700]/40 text-[#ff7700] bg-[#ff7700]/10'}`}>
              HEALTH SCORE: {ai.overallScore}/100
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
            {ai.summaryParagraph}
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80 text-center text-xs">
            <div className="bg-zinc-900/60 p-2">
              <div className="text-[9px] text-zinc-500">ROOM TEMP</div>
              <div className="text-white font-bold mt-0.5">{currentTemp.toFixed(1)}°C</div>
            </div>
            <div className="bg-zinc-900/60 p-2">
              <div className="text-[9px] text-zinc-500">AIR MOISTURE</div>
              <div className="text-[#00f0ff] font-bold mt-0.5">{currentHum.toFixed(1)}%</div>
            </div>
          </div>

        </div>

        {/* 3. Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          
          {/* Main Printable PDF Report */}
          <button
            onClick={handlePrintPdf}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-[#ff7700] hover:bg-[#ff8800] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,119,0,0.3)] cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>SAVE AS PDF / PRINT</span>
          </button>

          {/* Graph Snapshot */}
          <button
            onClick={handleDownloadPNG}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[#00f0ff] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>GRAPH (PNG)</span>
          </button>

          {/* CSV Raw Data */}
          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>DATA (CSV)</span>
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
