import React, { useState } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  Wind, 
  Thermometer, 
  Droplet,
  Zap, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { TelemetryCard } from './TelemetryCard';
import { generateAiEnvironmentalAnalysis } from '../utils/aiAnalysis';

interface AiAnalysisCardProps {
  temperature: number;
  humidity: number;
}

export const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({
  temperature,
  humidity,
}) => {
  const [isThinking, setIsThinking] = useState(false);

  const ai = generateAiEnvironmentalAnalysis(
    temperature,
    humidity
  );

  const handleRefreshAi = () => {
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
    }, 400);
  };

  const getPriorityBadge = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'MEDIUM':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      default:
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    }
  };

  return (
    <TelemetryCard
      title="AI Climate Intelligence"
      badge="Copilot Active"
      badgeVariant="papaya"
      accentColor="papaya"
      className="col-span-full"
    >
      <div className="space-y-5 font-sans">
        
        {/* Top Header Row with Score and Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-black/25 border border-white/[0.05] rounded-2xl">
          
          <div className="flex items-center space-x-4">
            {/* Score Ring */}
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 border border-amber-500/30 shrink-0 shadow-lg shadow-amber-500/5">
              <span className="text-2xl font-bold text-white">{ai.overallScore}</span>
              <span className="absolute -bottom-2 text-[9px] font-bold bg-amber-400 text-zinc-950 px-1.5 py-0.2 rounded-full">/100</span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-amber-400" />
                <h4 className="font-semibold text-sm text-white">
                  Environmental Quality Score
                </h4>
              </div>
              <div className="text-xs font-medium text-emerald-400 mt-0.5">
                {ai.scoreLabel.split(' // ')[0]}
              </div>
            </div>
          </div>

          {/* Refresh Action */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefreshAi}
              disabled={isThinking}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isThinking ? 'animate-spin text-amber-400' : ''}`} />
              <span>{isThinking ? 'Analyzing...' : 'Refresh Insights'}</span>
            </button>
          </div>

        </div>

        {/* Plain-English Executive Summary Box */}
        <div className="p-4 bg-black/20 border border-white/[0.04] rounded-2xl space-y-1.5">
          <div className="text-[11px] font-medium text-amber-400 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXECUTIVE SUMMARY</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
            {ai.summaryParagraph}
          </p>
        </div>

        {/* Actionable Human Guidance Checklist */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-zinc-400 tracking-wider uppercase flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Recommended Actions</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ai.recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 p-3.5 bg-black/25 hover:bg-black/35 border border-white/[0.04] rounded-2xl transition-colors"
              >
                <div className="mt-0.5 p-2 bg-zinc-900 rounded-xl border border-white/[0.06] shrink-0">
                  {rec.iconType === 'wind' && <Wind className="w-3.5 h-3.5 text-sky-400" />}
                  {rec.iconType === 'thermometer' && <Thermometer className="w-3.5 h-3.5 text-amber-400" />}
                  {rec.iconType === 'droplet' && <Droplet className="w-3.5 h-3.5 text-sky-400" />}
                  {rec.iconType === 'zap' && <Zap className="w-3.5 h-3.5 text-purple-400" />}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{rec.title}</span>
                    <span className={`px-2 py-0.2 text-[9px] rounded-full uppercase font-medium border ${getPriorityBadge(rec.priority)}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3-Pill Living Indices */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/[0.06] text-center text-xs">
          <div className="bg-black/25 border border-white/[0.04] p-3 rounded-2xl">
            <div className="text-[10px] uppercase text-zinc-400">Mold Hazard</div>
            <div className="text-sm font-semibold mt-1 text-emerald-400">
              {ai.moldRisk}
            </div>
          </div>

          <div className="bg-black/25 border border-white/[0.04] p-3 rounded-2xl">
            <div className="text-[10px] uppercase text-zinc-400">Comfort Sensation</div>
            <div className="text-sm font-semibold text-sky-400 mt-1">
              {ai.comfortIndex}
            </div>
          </div>

          <div className="bg-black/25 border border-white/[0.04] p-3 rounded-2xl">
            <div className="text-[10px] uppercase text-zinc-400">Sleep & Focus</div>
            <div className="text-sm font-semibold text-amber-400 mt-1">
              {ai.productivityScore}% Optimal
            </div>
          </div>
        </div>

      </div>
    </TelemetryCard>
  );
};
