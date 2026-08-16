import React, { useState } from 'react';
import { Camera, FileSpreadsheet } from 'lucide-react';
import { TelemetryCard } from './TelemetryCard';
import type { TelemetryPoint } from '../types/telemetry';
import { exportHighResGraphPNG, exportCSV } from '../utils/exportReport';

interface LiveHistoryChartProps {
  history: TelemetryPoint[];
}

type ActiveChannel = 'temp' | 'hum' | 'aqi' | 'pressure';

// Smooth cubic Catmull-Rom spline path generator
function getSplinePath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  if (pts.length === 2) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} L ${pts[1].x.toFixed(1)} ${pts[1].y.toFixed(1)}`;

  let path = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
}

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
  const width = 860;
  const height = 260;
  const paddingLeft = 50;
  const paddingRight = 50;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Dynamic Intelligent Auto-Scaling
  const temps = points.map(p => p.temperature);
  const hums = points.map(p => p.humidity);
  const aqis = points.map(p => p.airQuality ?? 34);
  const presses = points.map(p => p.pressure ?? 1013.2);

  const rawMinT = Math.min(...temps);
  const rawMaxT = Math.max(...temps);
  const tempSpread = Math.max(1.2, (rawMaxT - rawMinT) * 0.25);
  const minTempScale = Math.floor(rawMinT - tempSpread);
  const maxTempScale = Math.ceil(rawMaxT + tempSpread);

  const rawMinH = Math.min(...hums);
  const rawMaxH = Math.max(...hums);
  const humSpread = Math.max(2.5, (rawMaxH - rawMinH) * 0.25);
  const minHumScale = Math.max(0, Math.floor(rawMinH - humSpread));
  const maxHumScale = Math.min(100, Math.ceil(rawMaxH + humSpread));

  const minAqiScale = 0;
  const maxAqiScale = Math.max(100, Math.ceil(Math.max(...aqis) * 1.25));

  const minPressScale = Math.floor(Math.min(...presses) - 2);
  const maxPressScale = Math.ceil(Math.max(...presses) + 2);

  const getX = (index: number) => {
    if (points.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (points.length - 1)) * chartWidth;
  };

  const getTempY = (temp: number) => {
    const clamped = Math.max(minTempScale, Math.min(maxTempScale, temp));
    const ratio = (clamped - minTempScale) / (maxTempScale - minTempScale || 1);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  const getHumY = (hum: number) => {
    const clamped = Math.max(minHumScale, Math.min(maxHumScale, hum));
    const ratio = (clamped - minHumScale) / (maxHumScale - minHumScale || 1);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  const getAqiY = (aqi: number) => {
    const clamped = Math.max(minAqiScale, Math.min(maxAqiScale, aqi));
    const ratio = (clamped - minAqiScale) / (maxAqiScale - minAqiScale || 1);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  const getPressureY = (press: number) => {
    const clamped = Math.max(minPressScale, Math.min(maxPressScale, press));
    const ratio = (clamped - minPressScale) / (maxPressScale - minPressScale || 1);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  // Generate coordinate lists for smooth Splines
  const tempCoords = points.map((p, i) => ({ x: getX(i), y: getTempY(p.temperature) }));
  const humCoords = points.map((p, i) => ({ x: getX(i), y: getHumY(p.humidity) }));
  const aqiCoords = points.map((p, i) => ({ x: getX(i), y: getAqiY(p.airQuality ?? 34) }));
  const pressCoords = points.map((p, i) => ({ x: getX(i), y: getPressureY(p.pressure ?? 1013.2) }));

  const tempSpline = getSplinePath(tempCoords);
  const humSpline = getSplinePath(humCoords);
  const aqiSpline = getSplinePath(aqiCoords);
  const pressSpline = getSplinePath(pressCoords);

  // Closed Gradient Area Paths
  const tempArea = points.length > 1
    ? `${tempSpline} L ${getX(points.length - 1).toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} L ${getX(0).toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} Z`
    : '';

  const humArea = points.length > 1
    ? `${humSpline} L ${getX(points.length - 1).toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} L ${getX(0).toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} Z`
    : '';

  const hoveredPoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  // Latest metrics for quick header display
  const latestPoint = points[points.length - 1] || points[0];

  return (
    <TelemetryCard
      title="Environmental Telemetry Timeline"
      badge="Adaptive Spline Engine"
      badgeVariant="zinc"
      accentColor="none"
      className="col-span-full"
    >
      <div className="space-y-4 font-sans">
        
        {/* Top Channel Toggles, Quick Metric Pills & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Channel Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => toggleChannel('temp')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeChannels.temp
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold shadow-sm'
                  : 'bg-zinc-800/30 text-zinc-500 hover:text-zinc-300 border border-white/[0.04]'
              }`}
            >
              <span className="w-2 h-2 bg-amber-400 rounded-full inline-block shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span>Temp ({latestPoint.temperature.toFixed(1)}°C)</span>
            </button>

            <button
              onClick={() => toggleChannel('hum')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeChannels.hum
                  ? 'bg-sky-500/15 border border-sky-500/30 text-sky-400 font-semibold shadow-sm'
                  : 'bg-zinc-800/30 text-zinc-500 hover:text-zinc-300 border border-white/[0.04]'
              }`}
            >
              <span className="w-2 h-2 bg-sky-400 rounded-full inline-block shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
              <span>Humidity ({latestPoint.humidity.toFixed(1)}%)</span>
            </button>

            <button
              onClick={() => toggleChannel('aqi')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeChannels.aqi
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold shadow-sm'
                  : 'bg-zinc-800/30 text-zinc-500 hover:text-zinc-300 border border-white/[0.04]'
              }`}
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span>Air Quality ({latestPoint.airQuality || 34})</span>
            </button>

            <button
              onClick={() => toggleChannel('pressure')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                activeChannels.pressure
                  ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400 font-semibold shadow-sm'
                  : 'bg-zinc-800/30 text-zinc-500 hover:text-zinc-300 border border-white/[0.04]'
              }`}
            >
              <span className="w-2 h-2 bg-purple-400 rounded-full inline-block shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              <span>Pressure ({(latestPoint.pressure || 1013.2).toFixed(0)} hPa)</span>
            </button>
          </div>

          {/* Time Window Tabs & Export Actions */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-full border border-white/[0.06]">
              {(['1m', '5m', '15m', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
                    timeRange === r
                      ? 'bg-white text-zinc-950 font-semibold shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            {/* PNG Snapshot */}
            <button
              onClick={() => exportHighResGraphPNG(points, timeRange)}
              title="Snapshot high-res PNG graph"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 border border-white/[0.08] rounded-xl text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">PNG</span>
            </button>

            {/* CSV Export */}
            <button
              onClick={() => exportCSV(points, timeRange)}
              title="Export points as CSV dataset"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800/50 hover:bg-zinc-800 border border-white/[0.08] rounded-xl text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>

        </div>

        {/* SVG Canvas with Adaptive Splines & Ambient Glow */}
        <div className="relative w-full overflow-hidden bg-black/35 border border-white/[0.05] p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-inner">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-56 sm:h-72 select-none"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              {/* Temperature Golden Amber Gradient */}
              <linearGradient id="tempGlowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>

              {/* Humidity Electric Sky Blue Gradient */}
              <linearGradient id="humGlowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
                <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>

              {/* Subtle Horizontal Grid Line Gradient */}
              <linearGradient id="gridLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
              </linearGradient>
            </defs>

            {/* Background Grid Lines & Dynamic Scales */}
            {[0.1, 0.35, 0.65, 0.9].map((fraction) => {
              const y = paddingTop + chartHeight * fraction;
              const tempVal = Number((maxTempScale - fraction * (maxTempScale - minTempScale)).toFixed(1));
              const humVal = Number((maxHumScale - fraction * (maxHumScale - minHumScale)).toFixed(0));

              return (
                <g key={fraction}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={paddingLeft + chartWidth}
                    y2={y}
                    stroke="url(#gridLineGrad)"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                  {activeChannels.temp && (
                    <text
                      x={paddingLeft - 10}
                      y={y + 3.5}
                      textAnchor="end"
                      fill="#f59e0b"
                      fontSize="10"
                      fontWeight="500"
                      opacity="0.75"
                    >
                      {tempVal}°
                    </text>
                  )}
                  {activeChannels.hum && (
                    <text
                      x={paddingLeft + chartWidth + 10}
                      y={y + 3.5}
                      textAnchor="start"
                      fill="#38bdf8"
                      fontSize="10"
                      fontWeight="500"
                      opacity="0.75"
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
                d={pressSpline}
                fill="none"
                stroke="#c084fc"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 4"
                className="filter drop-shadow-[0_0_8px_rgba(192,132,252,0.4)]"
              />
            )}

            {/* Air Quality Line */}
            {activeChannels.aqi && (
              <path
                d={aqiSpline}
                fill="none"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="filter drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]"
              />
            )}

            {/* Humidity Smooth Spline & Area Glow */}
            {activeChannels.hum && (
              <>
                <path d={humArea} fill="url(#humGlowGrad)" />
                <path
                  d={humSpline}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="filter drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                />
              </>
            )}

            {/* Temperature Smooth Spline & Area Glow */}
            {activeChannels.temp && (
              <>
                <path d={tempArea} fill="url(#tempGlowGrad)" />
                <path
                  d={tempSpline}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="filter drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                />
              </>
            )}

            {/* Hover Crosshair & Interactive Hit Zones */}
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

                  {/* Temperature Hover Circle */}
                  {activeChannels.temp && (
                    <circle
                      cx={x}
                      cy={tempY}
                      r={hoveredIndex === i ? 5.5 : 2}
                      fill={hoveredIndex === i ? '#ffffff' : '#f59e0b'}
                      stroke="#f59e0b"
                      strokeWidth={hoveredIndex === i ? 3 : 1}
                      className="transition-all duration-150"
                    />
                  )}

                  {/* Humidity Hover Circle */}
                  {activeChannels.hum && (
                    <circle
                      cx={x}
                      cy={humY}
                      r={hoveredIndex === i ? 5.5 : 2}
                      fill={hoveredIndex === i ? '#ffffff' : '#38bdf8'}
                      stroke="#38bdf8"
                      strokeWidth={hoveredIndex === i ? 3 : 1}
                      className="transition-all duration-150"
                    />
                  )}
                </g>
              );
            })}

            {/* Vertical Guide Line */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <g pointerEvents="none">
                <line
                  x1={getX(hoveredIndex)}
                  y1={paddingTop}
                  x2={getX(hoveredIndex)}
                  y2={paddingTop + chartHeight}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </g>
            )}

            {/* Bottom Time Axis Labels */}
            {points.map((pt, i) => {
              if (i % Math.max(1, Math.floor(points.length / 5)) === 0 || i === points.length - 1) {
                const x = getX(i);
                return (
                  <text
                    key={`time-${i}`}
                    x={x}
                    y={height - 10}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {pt.timeStr}
                  </text>
                );
              }
              return null;
            })}
          </svg>

          {/* Floating Glass Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-4 right-4 bg-zinc-950/90 border border-white/15 p-3.5 rounded-2xl font-sans text-xs shadow-2xl backdrop-blur-xl z-20 space-y-1.5 min-w-[170px]">
              <div className="text-[10px] font-semibold text-zinc-400 border-b border-white/[0.08] pb-1 flex items-center justify-between">
                <span>TIME:</span>
                <span className="text-white font-mono-tech">{hoveredPoint.timeStr}</span>
              </div>
              
              {activeChannels.temp && (
                <div className="flex items-center justify-between text-amber-400 font-medium">
                  <span>Temperature:</span>
                  <span className="font-bold font-mono-tech">{hoveredPoint.temperature.toFixed(1)}°C</span>
                </div>
              )}

              {activeChannels.hum && (
                <div className="flex items-center justify-between text-sky-400 font-medium">
                  <span>Humidity:</span>
                  <span className="font-bold font-mono-tech">{hoveredPoint.humidity.toFixed(1)}%</span>
                </div>
              )}

              {activeChannels.aqi && (
                <div className="flex items-center justify-between text-emerald-400 font-medium">
                  <span>Air Quality:</span>
                  <span className="font-bold font-mono-tech">{hoveredPoint.airQuality || 34} AQI</span>
                </div>
              )}

              {activeChannels.pressure && (
                <div className="flex items-center justify-between text-purple-400 font-medium">
                  <span>Pressure:</span>
                  <span className="font-bold font-mono-tech">{(hoveredPoint.pressure || 1013.2).toFixed(1)} hPa</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TelemetryCard>
  );
};
