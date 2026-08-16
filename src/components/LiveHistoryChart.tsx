import React, { useState } from 'react';
import { Camera, FileSpreadsheet } from 'lucide-react';
import { TelemetryCard } from './TelemetryCard';
import type { TelemetryPoint } from '../types/telemetry';
import { exportHighResGraphPNG, exportCSV } from '../utils/exportReport';

interface LiveHistoryChartProps {
  history: TelemetryPoint[];
}

type ActiveChannel = 'temp' | 'hum' | 'aqi' | 'pressure';

export const LiveHistoryChart: React.FC<LiveHistoryChartProps> = ({ history }) => {
  const [activeChannels, setActiveChannels] = useState<Record<ActiveChannel, boolean>>({
    temp: true,
    hum: true,
    aqi: false,
    pressure: false,
  });
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | 'all'>('5m');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const toggleChannel = (channel: ActiveChannel) => {
    setActiveChannels(prev => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  const now = Date.now();
  const rangeDurations = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    'all': Infinity,
  };

  const filteredHistory = history.filter(p => {
    if (timeRange === 'all') return true;
    return now - p.timestamp <= rangeDurations[timeRange];
  });

  const points = filteredHistory.length > 0 ? filteredHistory : (
    history.length > 0 ? history : [
      { timestamp: Date.now(), timeStr: '--:--', temperature: 25.0, humidity: 50.0, airQuality: 34, pressure: 1013.2, battery: 98, lux: 480 }
    ]
  );

  // Graph dimensions
  const width = 800;
  const height = 230;
  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Scales
  const minTempScale = 10;
  const maxTempScale = 45;
  const minHumScale = 0;
  const maxHumScale = 100;
  const minAqiScale = 0;
  const maxAqiScale = 150;
  const minPressScale = 990;
  const maxPressScale = 1030;

  const getX = (index: number) => {
    if (points.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (points.length - 1)) * chartWidth;
  };

  const getTempY = (temp: number) => {
    const clamped = Math.max(minTempScale, Math.min(maxTempScale, temp));
    const ratio = (clamped - minTempScale) / (maxTempScale - minTempScale);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  const getHumY = (hum: number) => {
    const clamped = Math.max(minHumScale, Math.min(maxHumScale, hum));
    const ratio = (clamped - minHumScale) / (maxHumScale - minHumScale);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  const getAqiY = (aqi: number) => {
    const clamped = Math.max(minAqiScale, Math.min(maxAqiScale, aqi));
    const ratio = (clamped - minAqiScale) / (maxAqiScale - minAqiScale);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  const getPressureY = (press: number) => {
    const clamped = Math.max(minPressScale, Math.min(maxPressScale, press));
    const ratio = (clamped - minPressScale) / (maxPressScale - minPressScale);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  // Generate SVG paths
  const tempPath = points.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getTempY(pt.temperature);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const humPath = points.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getHumY(pt.humidity);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const aqiPath = points.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getAqiY(pt.airQuality || 34);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const pressPath = points.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getPressureY(pt.pressure || 1013.2);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Gradient area fill paths
  const tempArea = points.length > 1
    ? `${tempPath} L ${getX(points.length - 1)} ${paddingTop + chartHeight} L ${getX(0)} ${paddingTop + chartHeight} Z`
    : '';

  const humArea = points.length > 1
    ? `${humPath} L ${getX(points.length - 1)} ${paddingTop + chartHeight} L ${getX(0)} ${paddingTop + chartHeight} Z`
    : '';

  const hoveredPoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  return (
    <TelemetryCard
      title="Live Telemetry Timeline"
      badge="Realtime Sync"
      badgeVariant="zinc"
      accentColor="none"
      className="col-span-full"
    >
      <div className="space-y-4 font-sans">
        
        {/* Channel Toggles & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Channel Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => toggleChannel('temp')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeChannels.temp
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold'
                  : 'bg-zinc-800/30 text-zinc-500 hover:text-zinc-300 border border-white/[0.04]'
              }`}
            >
              <span className="w-2 h-2 bg-amber-400 rounded-full inline-block" />
              <span>Temperature</span>
            </button>

            <button
              onClick={() => toggleChannel('hum')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeChannels.hum
                  ? 'bg-sky-500/15 border border-sky-500/30 text-sky-400 font-semibold'
                  : 'bg-zinc-800/30 text-zinc-500 hover:text-zinc-300 border border-white/[0.04]'
              }`}
            >
              <span className="w-2 h-2 bg-sky-400 rounded-full inline-block" />
              <span>Humidity</span>
            </button>

            <button
              onClick={() => toggleChannel('aqi')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeChannels.aqi
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold'
                  : 'bg-zinc-800/30 text-zinc-500 hover:text-zinc-300 border border-white/[0.04]'
              }`}
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" />
              <span>Air Quality</span>
            </button>

            <button
              onClick={() => toggleChannel('pressure')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeChannels.pressure
                  ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400 font-semibold'
                  : 'bg-zinc-800/30 text-zinc-500 hover:text-zinc-300 border border-white/[0.04]'
              }`}
            >
              <span className="w-2 h-2 bg-purple-400 rounded-full inline-block" />
              <span>Pressure</span>
            </button>
          </div>

          {/* Time Range Filter Buttons & Export Actions */}
          <div className="flex items-center space-x-2">
            {/* Time Window Tabs */}
            <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-full border border-white/[0.06]">
              {(['1m', '5m', '15m', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
                    timeRange === r
                      ? 'bg-white text-zinc-950 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Snapshot Graph PNG */}
            <button
              onClick={() => exportHighResGraphPNG(points, timeRange)}
              title="Snapshot graph as PNG"
              className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 border border-white/[0.08] rounded-xl text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">PNG</span>
            </button>

            {/* CSV Export */}
            <button
              onClick={() => exportCSV(points, timeRange)}
              title="Export points as CSV"
              className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 border border-white/[0.08] rounded-xl text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>

        </div>

        {/* SVG Canvas */}
        <div className="relative w-full overflow-hidden bg-black/25 border border-white/[0.04] p-3 rounded-2xl">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-52 sm:h-64 select-none"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Reference horizontal gridlines */}
            {[0.25, 0.5, 0.75].map((fraction) => {
              const y = paddingTop + chartHeight * fraction;
              const tempVal = Math.round(maxTempScale - fraction * (maxTempScale - minTempScale));
              const humVal = Math.round(maxHumScale - fraction * (maxHumScale - minHumScale));
              return (
                <g key={fraction}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={paddingLeft + chartWidth}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeDasharray="4 4"
                  />
                  {activeChannels.temp && (
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      fill="#f59e0b"
                      fontSize="10"
                      opacity="0.6"
                    >
                      {tempVal}°
                    </text>
                  )}
                  {activeChannels.hum && (
                    <text
                      x={paddingLeft + chartWidth + 8}
                      y={y + 3}
                      textAnchor="start"
                      fill="#38bdf8"
                      fontSize="10"
                      opacity="0.6"
                    >
                      {humVal}%
                    </text>
                  )}
                </g>
              );
            })}

            {/* Pressure Line */}
            {activeChannels.pressure && (
              <path
                d={pressPath}
                fill="none"
                stroke="#c084fc"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 4"
              />
            )}

            {/* Air Quality Line */}
            {activeChannels.aqi && (
              <path
                d={aqiPath}
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Humidity Line */}
            {activeChannels.hum && (
              <>
                <path d={humArea} fill="url(#humGradient)" />
                <path
                  d={humPath}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Temperature Line */}
            {activeChannels.temp && (
              <>
                <path d={tempArea} fill="url(#tempGradient)" />
                <path
                  d={tempPath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Hover Data Nodes */}
            {points.map((pt, i) => {
              const x = getX(i);
              const tempY = getTempY(pt.temperature);
              const humY = getHumY(pt.humidity);

              return (
                <g
                  key={`node-${i}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                >
                  <rect
                    x={x - chartWidth / (points.length * 2)}
                    y={paddingTop}
                    width={chartWidth / points.length}
                    height={chartHeight}
                    fill="transparent"
                  />

                  {activeChannels.temp && (
                    <circle
                      cx={x}
                      cy={tempY}
                      r={hoveredIndex === i ? 5 : 2}
                      fill={hoveredIndex === i ? '#ffffff' : '#f59e0b'}
                      stroke="#f59e0b"
                      strokeWidth={hoveredIndex === i ? 2 : 1}
                    />
                  )}

                  {activeChannels.hum && (
                    <circle
                      cx={x}
                      cy={humY}
                      r={hoveredIndex === i ? 5 : 2}
                      fill={hoveredIndex === i ? '#ffffff' : '#38bdf8'}
                      stroke="#38bdf8"
                      strokeWidth={hoveredIndex === i ? 2 : 1}
                    />
                  )}
                </g>
              );
            })}

            {/* Guide Cursor */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <g pointerEvents="none">
                <line
                  x1={getX(hoveredIndex)}
                  y1={paddingTop}
                  x2={getX(hoveredIndex)}
                  y2={paddingTop + chartHeight}
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.5"
                />
              </g>
            )}

            {/* Time Axis Labels */}
            {points.map((pt, i) => {
              if (i % Math.max(1, Math.floor(points.length / 5)) === 0 || i === points.length - 1) {
                const x = getX(i);
                return (
                  <text
                    key={`time-${i}`}
                    x={x}
                    y={height - 8}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                  >
                    {pt.timeStr}
                  </text>
                );
              }
              return null;
            })}
          </svg>

          {/* Interactive Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-4 right-4 bg-zinc-900/90 border border-white/10 p-3 rounded-xl font-sans text-xs shadow-2xl backdrop-blur-md z-20 space-y-1">
              <div className="text-[10px] text-zinc-400 border-b border-white/[0.06] pb-1">
                Time: <span className="text-white font-medium">{hoveredPoint.timeStr}</span>
              </div>
              <div className="flex items-center justify-between space-x-4 text-amber-400">
                <span>Temperature:</span>
                <span className="font-semibold">{hoveredPoint.temperature.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center justify-between space-x-4 text-sky-400">
                <span>Humidity:</span>
                <span className="font-semibold">{hoveredPoint.humidity.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </TelemetryCard>
  );
};
