import React, { useState, useMemo, useRef } from 'react';
import { 
  Camera, 
  FileSpreadsheet, 
  Thermometer, 
  Droplets, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Sparkles,
  Database
} from 'lucide-react';
import { TelemetryCard } from './TelemetryCard';
import type { TelemetryPoint } from '../types/telemetry';
import { exportHighResGraphPNG, exportCSV } from '../utils/exportReport';

interface LiveHistoryChartProps {
  history: TelemetryPoint[];
}

type GraphLayoutMode = 'split' | 'temp' | 'hum' | 'combined';

// Generate smooth cubic Catmull-Rom bezier curve
function generateSpline(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (points.length === 2) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
}

export const LiveHistoryChart: React.FC<LiveHistoryChartProps> = ({ history }) => {
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>('split');
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '6h' | '24h' | 'all'>('1h');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const now = Date.now();
  const rangeDurations = {
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    'all': Infinity,
  };

  const points = useMemo(() => {
    const pts = history.filter(p => {
      if (timeRange === 'all') return true;
      return now - p.timestamp <= rangeDurations[timeRange];
    });
    return pts.length > 0 ? pts : history;
  }, [history, timeRange, now]);

  const latestPoint = points[points.length - 1] || points[0] || {
    timestamp: Date.now(),
    timeStr: '--:--',
    temperature: 25.9,
    humidity: 87.0,
    airQuality: 34,
    pressure: 1013.2,
  };
  const firstPoint = points[0] || latestPoint;

  // Temperature Stats
  const temps = points.map(p => p.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const avgTemp = Number((temps.reduce((a, b) => a + b, 0) / (temps.length || 1)).toFixed(1));
  const tempDelta = Number((latestPoint.temperature - firstPoint.temperature).toFixed(1));

  // Humidity Stats
  const hums = points.map(p => p.humidity);
  const minHum = Math.min(...hums);
  const maxHum = Math.max(...hums);
  const avgHum = Number((hums.reduce((a, b) => a + b, 0) / (hums.length || 1)).toFixed(1));
  const humDelta = Number((latestPoint.humidity - firstPoint.humidity).toFixed(1));

  // Handle Touch Scrubbing on Mobile
  const handleTouch = (e: React.TouchEvent<SVGSVGElement>, chartW: number, padLeft: number) => {
    if (!e.touches[0] || points.length <= 1) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const touchX = e.touches[0].clientX - svgRect.left;
    const ratio = Math.max(0, Math.min(1, (touchX - (padLeft / 880) * svgRect.width) / ((chartW / 880) * svgRect.width)));
    const idx = Math.round(ratio * (points.length - 1));
    setHoveredIndex(Math.max(0, Math.min(points.length - 1, idx)));
  };

  // Single Pane Chart Renderer Function
  const renderSingleChart = (
    title: string,
    icon: React.FC<{ className?: string }>,
    accentColor: string,
    valueUnit: string,
    currentVal: number,
    minVal: number,
    avgVal: number,
    maxVal: number,
    delta: number,
    comfortMin: number,
    comfortMax: number,
    comfortLabel: string,
    getValue: (p: TelemetryPoint) => number,
    gradientId: string,
    strokeColor: string
  ) => {
    const Icon = icon;
    const width = 880;
    const height = 230;
    const padLeft = 48;
    const padRight = 25;
    const padTop = 25;
    const padBottom = 35;

    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Scale calculation
    const spread = Math.max(1.2, (maxVal - minVal) * 0.3);
    const minScale = Number((minVal - spread).toFixed(1));
    const maxScale = Number((maxVal + spread).toFixed(1));

    const getX = (i: number) => {
      if (points.length <= 1) return padLeft + chartW / 2;
      return padLeft + (i / (points.length - 1)) * chartW;
    };

    const getY = (val: number) => {
      const ratio = (val - minScale) / (maxScale - minScale || 1);
      return padTop + chartH - Math.max(0, Math.min(1, ratio)) * chartH;
    };

    const coords = points.map((p, i) => ({ x: getX(i), y: getY(getValue(p)) }));
    const splinePath = generateSpline(coords);
    const areaPath = points.length > 1
      ? `${splinePath} L ${getX(points.length - 1).toFixed(1)} ${(padTop + chartH).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + chartH).toFixed(1)} Z`
      : '';

    // Comfort Zone Band Box
    const comfortTopY = Math.max(padTop, Math.min(padTop + chartH, getY(comfortMax)));
    const comfortBottomY = Math.max(padTop, Math.min(padTop + chartH, getY(comfortMin)));
    const comfortHeight = Math.max(0, comfortBottomY - comfortTopY);

    const maxIdx = coords.findIndex((_, idx) => getValue(points[idx]) === maxVal);
    const minIdx = coords.findIndex((_, idx) => getValue(points[idx]) === minVal);

    const hoveredPt = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

    return (
      <div className="bg-black/35 border border-white/[0.07] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl space-y-3 shadow-xl relative">
        
        {/* Header Strip with Mobile-Friendly Wrap */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2.5">
            <div 
              className="p-1.5 sm:p-2 rounded-xl border flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${accentColor}15`,
                borderColor: `${accentColor}30`,
                color: accentColor,
              }}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-zinc-300">
                  {title}
                </h4>
                <span className={`inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-semibold ${
                  delta > 0
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : delta < 0
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {delta > 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : delta < 0 ? <ArrowDownRight className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                  <span>{delta > 0 ? `+${delta}` : delta}{valueUnit}</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-sans">
                {comfortLabel}
              </p>
            </div>
          </div>

          {/* Current & Range Summary Pill (2x2 on Mobile, Inline on Tablet/Desktop) */}
          <div className="grid grid-cols-4 sm:flex items-center gap-1.5 sm:space-x-3 text-[10px] sm:text-xs bg-zinc-900/80 p-2 sm:px-3 sm:py-1.5 rounded-xl border border-white/[0.06] text-center sm:text-left">
            <div>
              <span className="text-[9px] text-zinc-400 uppercase block sm:inline sm:mr-1">LIVE</span>
              <span className="font-bold text-white font-mono-tech">{currentVal.toFixed(1)}{valueUnit}</span>
            </div>
            <div className="border-l border-white/[0.06] sm:border-l-0 pl-1 sm:pl-0">
              <span className="text-[9px] text-zinc-400 uppercase block sm:inline sm:mr-1">MIN</span>
              <span className="text-zinc-300 font-mono-tech">{minVal.toFixed(1)}{valueUnit}</span>
            </div>
            <div className="border-l border-white/[0.06] sm:border-l-0 pl-1 sm:pl-0">
              <span className="text-[9px] text-zinc-400 uppercase block sm:inline sm:mr-1">AVG</span>
              <span className="text-zinc-300 font-mono-tech">{avgVal.toFixed(1)}{valueUnit}</span>
            </div>
            <div className="border-l border-white/[0.06] sm:border-l-0 pl-1 sm:pl-0">
              <span className="text-[9px] text-zinc-400 uppercase block sm:inline sm:mr-1">MAX</span>
              <span className="text-zinc-300 font-mono-tech">{maxVal.toFixed(1)}{valueUnit}</span>
            </div>
          </div>
        </div>

        {/* SVG Canvas with Mobile Touch Support */}
        <div className="relative w-full overflow-hidden touch-none" ref={containerRef}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-44 sm:h-60 select-none cursor-crosshair"
            onMouseLeave={() => setHoveredIndex(null)}
            onTouchMove={(e) => handleTouch(e, chartW, padLeft)}
            onTouchStart={(e) => handleTouch(e, chartW, padLeft)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity="0.4" />
                <stop offset="60%" stopColor={accentColor} stopOpacity="0.08" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id="comfortBandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.03" />
              </linearGradient>
            </defs>

            {/* Shaded Comfort Zone Band */}
            {comfortHeight > 0 && (
              <g>
                <rect
                  x={padLeft}
                  y={comfortTopY}
                  width={chartW}
                  height={comfortHeight}
                  fill="url(#comfortBandGrad)"
                  stroke="#10b981"
                  strokeOpacity="0.2"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft + 8}
                  y={comfortTopY + 12}
                  fill="#10b981"
                  fontSize="9"
                  fontWeight="600"
                  opacity="0.8"
                >
                  ✓ IDEAL ZONE ({comfortMin}–{comfortMax}{valueUnit})
                </text>
              </g>
            )}

            {/* Reference Horizontal Lines & Y-Axis Scale Values */}
            {[0.1, 0.4, 0.7, 0.95].map((fraction) => {
              const y = padTop + chartH * fraction;
              const val = Number((maxScale - fraction * (maxScale - minScale)).toFixed(1));
              return (
                <g key={fraction}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={padLeft + chartW}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeDasharray="3 4"
                  />
                  <text
                    x={padLeft - 6}
                    y={y + 3.5}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="500"
                    fontFamily="monospace"
                  >
                    {val}{valueUnit}
                  </text>
                </g>
              );
            })}

            {/* Average Mean Line */}
            <g>
              <line
                x1={padLeft}
                y1={getY(avgVal)}
                x2={padLeft + chartW}
                y2={getY(avgVal)}
                stroke={accentColor}
                strokeOpacity="0.45"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={padLeft + chartW - 4}
                y={getY(avgVal) - 4}
                textAnchor="end"
                fill={accentColor}
                fontSize="9"
                fontWeight="600"
                opacity="0.9"
              >
                Avg: {avgVal.toFixed(1)}{valueUnit}
              </text>
            </g>

            {/* Area Fill */}
            {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

            {/* Main Smooth Spline Curve */}
            <path
              d={splinePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="filter drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]"
            />

            {/* Peak High Badge */}
            {points.length > 2 && maxIdx >= 0 && (
              <g transform={`translate(${coords[maxIdx].x}, ${coords[maxIdx].y - 10})`}>
                <rect x="-22" y="-11" width="44" height="16" rx="8" fill={accentColor} />
                <text x="0" y="0.5" textAnchor="middle" fill="#090a0f" fontSize="8.5" fontWeight="700">
                  ▲ {maxVal.toFixed(1)}{valueUnit}
                </text>
              </g>
            )}

            {/* Peak Low Badge */}
            {points.length > 2 && minIdx >= 0 && minIdx !== maxIdx && (
              <g transform={`translate(${coords[minIdx].x}, ${coords[minIdx].y + 13})`}>
                <rect x="-22" y="-8" width="44" height="16" rx="8" fill="#1e293b" stroke={accentColor} strokeWidth="1" />
                <text x="0" y="3.5" textAnchor="middle" fill={accentColor} fontSize="8.5" fontWeight="700">
                  ▼ {minVal.toFixed(1)}{valueUnit}
                </text>
              </g>
            )}

            {/* Interactive Hit Zones & Circles */}
            {coords.map((pt, i) => (
              <g
                key={`hit-${i}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
              >
                <rect
                  x={pt.x - chartW / (points.length * 2)}
                  y={padTop}
                  width={chartW / points.length}
                  height={chartH}
                  fill="transparent"
                />

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIndex === i ? 5.5 : 1.5}
                  fill={hoveredIndex === i ? '#ffffff' : accentColor}
                  stroke={accentColor}
                  strokeWidth={hoveredIndex === i ? 3 : 1}
                  className="transition-all duration-150"
                />
              </g>
            ))}

            {/* Vertical Guide Line */}
            {hoveredIndex !== null && coords[hoveredIndex] && (
              <line
                x1={coords[hoveredIndex].x}
                y1={padTop}
                x2={coords[hoveredIndex].x}
                y2={padTop + chartH}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            )}

            {/* Time Axis Markers */}
            {points.map((pt, i) => {
              if (i % Math.max(1, Math.floor(points.length / 5)) === 0 || i === points.length - 1) {
                return (
                  <text
                    key={`time-${i}`}
                    x={getX(i)}
                    y={height - 10}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="500"
                    fontFamily="monospace"
                  >
                    {pt.timeStr}
                  </text>
                );
              }
              return null;
            })}
          </svg>

          {/* Floating Hover Card */}
          {hoveredPt && (
            <div className="absolute top-2 right-2 bg-zinc-950/95 border border-white/20 p-2 rounded-xl font-sans text-[11px] shadow-2xl backdrop-blur-xl z-20 space-y-0.5">
              <div className="text-[9px] text-zinc-400 flex items-center justify-between space-x-2">
                <span>TIME:</span>
                <span className="text-white font-mono">{hoveredPt.timeStr}</span>
              </div>
              <div className="flex items-center justify-between space-x-2 font-semibold" style={{ color: accentColor }}>
                <span>{title.split(' ')[0]}:</span>
                <span className="font-mono">{getValue(hoveredPt).toFixed(1)}{valueUnit}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    );
  };

  return (
    <TelemetryCard
      title="Historical Telemetry & Analytics"
      badge="Realtime Ingestion"
      badgeVariant="emerald"
      accentColor="none"
      className="col-span-full"
    >
      <div className="space-y-4 font-sans">
        
        {/* Top Control Bar: Scrollable on Mobile */}
        <div className="flex flex-col gap-3 pb-3 border-b border-white/[0.06]">
          
          {/* Layout Mode Switcher (Horizontal Scroll Pill Bar) */}
          <div className="flex items-center space-x-1.5 bg-black/40 p-1 rounded-full border border-white/[0.08] overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'split', label: '📊 Dual Dedicated', desc: 'Separated °C & %RH' },
              { id: 'temp', label: '🌡️ Temperature', desc: 'Core thermal focus' },
              { id: 'hum', label: '💧 Humidity', desc: 'Moisture focus' },
              { id: 'combined', label: '⚡ Dual-Axis', desc: 'Synchronized view' },
            ].map((tab) => {
              const isSelected = layoutMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setLayoutMode(tab.id as GraphLayoutMode)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-white text-zinc-950 font-semibold shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Time Window Tabs & Export Actions (Flex Wrap) */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            
            {/* Time Window Selector */}
            <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-full border border-white/[0.08] shrink-0">
              {(['15m', '1h', '6h', '24h', 'all'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-medium rounded-full transition-all cursor-pointer ${
                    timeRange === r
                      ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Snapshot & Export */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={() => exportHighResGraphPNG(points, timeRange)}
                title="Snapshot graph as PNG"
                className="flex items-center space-x-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-zinc-800/60 hover:bg-zinc-800 border border-white/[0.08] rounded-xl text-zinc-300 hover:text-white text-[11px] sm:text-xs transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                <span>PNG</span>
              </button>

              <button
                onClick={() => exportCSV(points, timeRange)}
                title="Export points as CSV"
                className="flex items-center space-x-1 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-zinc-800/60 hover:bg-zinc-800 border border-white/[0.08] rounded-xl text-zinc-300 hover:text-white text-[11px] sm:text-xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                <span>CSV</span>
              </button>
            </div>

          </div>

        </div>

        {/* Dynamic Charts Area */}
        <div className="space-y-4">
          
          {/* 1. Split Mode: Temperature Chart + Humidity Chart */}
          {layoutMode === 'split' && (
            <div className="grid grid-cols-1 gap-4">
              {renderSingleChart(
                'Core Temperature Timeline',
                Thermometer,
                '#f59e0b',
                '°C',
                latestPoint.temperature,
                minTemp,
                avgTemp,
                maxTemp,
                tempDelta,
                20.0,
                25.0,
                'Ideal Indoor Thermal Comfort: 20.0°C – 25.0°C',
                (p) => p.temperature,
                'tempSplitGrad',
                '#f59e0b'
              )}

              {renderSingleChart(
                'Relative Humidity & Moisture Timeline',
                Droplets,
                '#38bdf8',
                '%',
                latestPoint.humidity,
                minHum,
                avgHum,
                maxHum,
                humDelta,
                40.0,
                65.0,
                'Ideal Relative Humidity Comfort: 40.0% – 65.0% RH',
                (p) => p.humidity,
                'humSplitGrad',
                '#38bdf8'
              )}
            </div>
          )}

          {/* 2. Temperature Only Mode */}
          {layoutMode === 'temp' && (
            renderSingleChart(
              'Core Temperature Detailed Timeline',
              Thermometer,
              '#f59e0b',
              '°C',
              latestPoint.temperature,
              minTemp,
              avgTemp,
              maxTemp,
              tempDelta,
              20.0,
              25.0,
              'Ideal Indoor Thermal Comfort Zone: 20.0°C – 25.0°C',
              (p) => p.temperature,
              'tempDetailedGrad',
              '#f59e0b'
            )
          )}

          {/* 3. Humidity Only Mode */}
          {layoutMode === 'hum' && (
            renderSingleChart(
              'Relative Humidity Detailed Timeline',
              Droplets,
              '#38bdf8',
              '%',
              latestPoint.humidity,
              minHum,
              avgHum,
              maxHum,
              humDelta,
              40.0,
              65.0,
              'Ideal Relative Humidity Comfort Zone: 40.0% – 65.0% RH',
              (p) => p.humidity,
              'humDetailedGrad',
              '#38bdf8'
            )
          )}

          {/* 4. Combined Dual-Axis Overlay Mode */}
          {layoutMode === 'combined' && (
            <div className="bg-black/35 border border-white/[0.07] p-4 sm:p-5 rounded-3xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      Synchronized Dual-Axis Overlay
                    </h4>
                    <p className="text-[10px] text-zinc-400">
                      Left Axis: Temperature (°C) • Right Axis: Humidity (% RH)
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[10px] sm:text-xs">
                  <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Temp ({latestPoint.temperature.toFixed(1)}°C)</span>
                  </span>
                  <span className="flex items-center space-x-1 text-sky-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>Humidity ({latestPoint.humidity.toFixed(1)}%)</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {renderSingleChart(
                  'Core Temperature Stream',
                  Thermometer,
                  '#f59e0b',
                  '°C',
                  latestPoint.temperature,
                  minTemp,
                  avgTemp,
                  maxTemp,
                  tempDelta,
                  20.0,
                  25.0,
                  'Left Axis Scale: Temperature (°C)',
                  (p) => p.temperature,
                  'tempCombGrad',
                  '#f59e0b'
                )}
                {renderSingleChart(
                  'Relative Humidity Stream',
                  Droplets,
                  '#38bdf8',
                  '%',
                  latestPoint.humidity,
                  minHum,
                  avgHum,
                  maxHum,
                  humDelta,
                  40.0,
                  65.0,
                  'Right Axis Scale: Relative Humidity (% RH)',
                  (p) => p.humidity,
                  'humCombGrad',
                  '#38bdf8'
                )}
              </div>
            </div>
          )}

        </div>

        {/* Database Health Summary Footer (Grid 3-block on desktop, compact on mobile) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-white/[0.06] text-[11px] sm:text-xs">
          <div className="bg-black/25 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/[0.04] flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[9px] uppercase text-zinc-400">Total Samples</div>
              <div className="text-white font-semibold">{points.length} Database Records</div>
            </div>
          </div>

          <div className="bg-black/25 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/[0.04] flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <div>
              <div className="text-[9px] uppercase text-zinc-400">Cadence</div>
              <div className="text-white font-semibold">2000ms Live Ingestion</div>
            </div>
          </div>

          <div className="bg-black/25 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-white/[0.04] flex items-center space-x-2">
            <Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[9px] uppercase text-zinc-400">Firebase Synchronization</div>
              <div className="text-emerald-400 font-semibold">100% Real-Time Connected</div>
            </div>
          </div>
        </div>

      </div>
    </TelemetryCard>
  );
};
