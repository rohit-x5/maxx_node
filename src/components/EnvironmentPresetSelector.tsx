import React from 'react';
import { 
  Home, 
  Moon, 
  Laptop, 
  Sprout, 
  Server, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { ENVIRONMENT_PRESETS } from '../types/presets';

interface EnvironmentPresetSelectorProps {
  selectedPresetId: string;
  onSelectPreset: (id: string) => void;
  temperature: number;
  humidity: number;
}

export const EnvironmentPresetSelector: React.FC<EnvironmentPresetSelectorProps> = ({
  selectedPresetId,
  onSelectPreset,
  temperature,
  humidity,
}) => {
  const activePreset = ENVIRONMENT_PRESETS.find(p => p.id === selectedPresetId) || ENVIRONMENT_PRESETS[0];

  const isTempOptimal = temperature >= activePreset.targetTempMin && temperature <= activePreset.targetTempMax;
  const isHumOptimal = humidity >= activePreset.targetHumMin && humidity <= activePreset.targetHumMax;
  const isFullyOptimal = isTempOptimal && isHumOptimal;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Moon': return <Moon className="w-4 h-4" />;
      case 'Laptop': return <Laptop className="w-4 h-4" />;
      case 'Sprout': return <Sprout className="w-4 h-4" />;
      case 'Server': return <Server className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.08] p-4 sm:p-5 rounded-2xl sm:rounded-3xl space-y-4">
      
      {/* Top Header & Active Space Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              TARGET CLIMATE ZONE
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5 font-sans">
            {activePreset.description}
          </p>
        </div>

        {/* Real-time Zone Compliance Badge */}
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            isFullyOptimal 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
          }`}>
            {isFullyOptimal ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zone in Sweet Spot</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Target Deviation</span>
              </>
            )}
          </div>

          <div className="text-[11px] text-zinc-400 font-mono-tech hidden md:block">
            Target: <span className="text-zinc-200 font-bold">{activePreset.targetTempMin}–{activePreset.targetTempMax}°C</span> • <span className="text-zinc-200 font-bold">{activePreset.targetHumMin}–{activePreset.targetHumMax}%</span>
          </div>
        </div>
      </div>

      {/* Preset Pill Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {ENVIRONMENT_PRESETS.map((preset) => {
          const isSelected = preset.id === selectedPresetId;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-white text-zinc-950 font-semibold shadow-lg shadow-white/10'
                  : 'bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70 border border-white/[0.04]'
              }`}
            >
              {getIcon(preset.icon)}
              <span>{preset.name}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
