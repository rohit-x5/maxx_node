import React, { useState, useMemo } from 'react';
import { 
  Camera, 
  FileSpreadsheet, 
  Thermometer, 
  Droplets, 
  Wind, 
  Compass, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus 
} from 'lucide-react';
import { TelemetryCard } from './TelemetryCard';
import type { TelemetryPoint } from '../types/telemetry';
import { exportHighResGraphPNG, exportCSV } from '../utils/exportReport';

interface LiveHistoryChartProps {
  history: TelemetryPoint[];
}

type ViewMode = 'temp' | 'hum' | 'aqi' | 'pressure' | 'all';

// Smooth cubic Catmull-Rom to Bezier spline generator
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
  const [viewMode, setViewMode] = useState<ViewMode>('temp');
  const [timeRange, setTimeRange] = useState<'1m' | '5m' | '15m' | 'all'>('5m');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const now = Date.now();
  const rangeDurations = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    'all': Infinity,
  };

  const filteredHistory = useMemo(() => {
    const pts = history.filter(p => {
      if (timeRange === 'all') return true;
      return now - p.timestamp <= rangeDurations[timeRange];
    });
    return pts.length > 0 ? pts : (
      history.length > 0 ? history : [
        { timestamp: Date.now(), timeStr: '--:--', temperature: 25.0, humidity: 50.0, airQuality: 34, pressure: 1013.2, battery: 98, lux: 480 }
      ]
    );
  }, [history, timeRange, now]);

  const points = filteredHistory;

  // Chart canvas specs
  const width = 900;
  const height = 280;
  const padLeft = 55;
  const padRight = 55;
  const padTop = 30;
  const padBottom = 40;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Metrics for calculations
  const temps = points.map(p => p.temperature);
  const hums = points.map(p => p.humidity);
  const aqis = points.map(p => p.airQuality ?? 34);
  const presses = points.map(p => p.pressure ?? 1013.2);

  // Dynamic Scale ranges with comfortable visual breathing margins
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const tSpread = Math.max(1.0, (maxT - minT) * 0.3);
  const minTempScale = Number((minT - tSpread).toFixed(1));
  const maxTempScale = Number((maxT + tSpread).toFixed(1));

  const minH = Math.min(...hums);
  const maxH = Math.max(...hums);
  const hSpread = Math.max(2.0, (maxH - minH) * 0.3);
  const minHumScale = Math.max(0, Number((minH - hSpread).toFixed(1)));
  const maxHumScale = Math.min(100, Number((maxH + hSpread).toFixed(1)));

  const minAqiScale = 0;
  const maxAqiScale = Math.max(100, Math.ceil(Math.max(...aqis) * 1.3));

  const minPressScale = Math.floor(Math.min(...presses) - 1.5);
  const maxPressScale = Math.ceil(Math.max(...presses) + 1.5);

  const getX = (i: number) => {
    if (points.length <= 1) return padLeft + chartW / 2;
    return padLeft + (i / (points.length - 1)) * chartW;
  };

  const getYTemp = (t: number) => {
    const ratio = (t - minTempScale) / (maxTempScale - minTempScale || 1);
    return padTop + chartH - Math.max(0, Math.min(1, ratio)) * chartH;
  };

  const getYHum = (h: number) => {
    const ratio = (h - minHumScale) / (maxHumScale - minHumScale || 1);
    return padTop + chartH - Math.max(0, Math.min(1, ratio)) * chartH;
  };

  const getYAqi = (a: number) => {
    const ratio = (a - minAqiScale) / (maxAqiScale - minAqiScale || 1);
    return padTop + chartH - Math.max(0, Math.min(1, ratio)) * chartH;
  };

  const getYPress = (p: number) => {
    const ratio = (p - minPressScale) / (maxPressScale - minPressScale || 1);
    return padTop + chartH - Math.max(0, Math.min(1, ratio)) * chartH;
  };

  // Generate coordinate paths
  const tempCoords = points.map((p, i) => ({ x: getX(i), y: getYTemp(p.temperature) }));
  const humCoords = points.map((p, i) => ({ x: getX(i), y: getYHum(p.humidity) }));
  const aqiCoords = points.map((p, i) => ({ x: getX(i), y: getYAqi(p.airQuality ?? 34) }));
  const pressCoords = points.map((p, i) => ({ x: getX(i), y: getYPress(p.pressure ?? 1013.2) }));

  const tempSpline = generateSpline(tempCoords);
  const humSpline = generateSpline(humCoords);
  const aqiSpline = generateSpline(aqiCoords);
  const pressSpline = generateSpline(pressCoords);

  // Closed Gradient Area Paths
  const tempArea = points.length > 1
    ? `${tempSpline} L ${getX(points.length - 1).toFixed(1)} ${(padTop + chartH).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + chartH).toFixed(1)} Z`
    : '';

  const humArea = points.length > 1
    ? `${humSpline} L ${getX(points.length - 1).toFixed(1)} ${(padTop + chartH).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + chartH).toFixed(1)} Z`
    : '';

  const aqiArea = points.length > 1
    ? `${aqiSpline} L ${getX(points.length - 1).toFixed(1)} ${(padTop + chartH).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + chartH).toFixed(1)} Z`
    : '';

  const pressArea = points.length > 1
    ? `${pressSpline} L ${getX(points.length - 1).toFixed(1)} ${(padTop + chartH).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + chartH).toFixed(1)} Z`
    : '';

  const latestPoint = points[points.length - 1] || points[0];
  const firstPoint = points[0] || points[0];
  const hoveredPoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  // Active Channel Configuration
  const config = {
    temp: {
      label: 'Temperature',
      icon: Thermometer,
      currentVal: `${latestPoint.temperature.toFixed(1)}°C`,
      subVal: `${((latestPoint.temperature * 9) / 5 + 32).toFixed(1)}°F`,
      color: '#f59e0b',
      glowGrad: 'tempHeroGrad',
      strokeGrad: 'tempStrokeGrad',
      delta: Number((latestPoint.temperature - firstPoint.temperature).toFixed(1)),
      unit: '°C',
    },
    hum: {
      label: 'Relative Humidity',
      icon: Droplets,
      currentVal: `${latestPoint.humidity.toFixed(1)}%`,
      subVal: 'RH Level',
      color: '#38bdf8',
      glowGrad: 'humHeroGrad',
      strokeGrad: 'humStrokeGrad',
      delta: Number((latestPoint.humidity - firstPoint.humidity).toFixed(1)),
      unit: '%',
    },
    aqi: {
      label: 'Air Quality Index',
      icon: Wind,
      currentVal: `${latestPoint.airQuality || 34}`,
      subVal: 'AQI Purity',
      color: '#10b981',
      glowGrad: 'aqiHeroGrad',
      strokeGrad: 'aqiStrokeGrad',
      delta: Number(((latestPoint.airQuality || 34) - (firstPoint.airQuality || 34)).toFixed(0)),
      unit: 'AQI',
    },
    pressure: {
      label: 'Atmospheric Pressure',
      icon: Compass,
      currentVal: `${(latestPoint.pressure || 1013.2).toFixed(1)}`,
      subVal: 'hPa Barometer',
      color: '#c084fc',
      glowGrad: 'pressHeroGrad',
      strokeGrad: 'pressStrokeGrad',
      delta: Number(((latestPoint.pressure || 1013.2) - (firstPoint.pressure || 1013.2)).toFixed(1)),
      unit: 'hPa',
    },
    all: {
      label: 'Multi-Channel Composite',
      icon: Layers,
      currentVal: `${latestPoint.temperature.toFixed(1)}°C / ${latestPoint.humidity.toFixed(1)}%`,
      subVal: 'Unified Sensor Stream',
      color: '#38bdf8',
      glowGrad: 'tempHeroGrad',
      strokeGrad: 'tempStrokeGrad',
      delta: 0,
      unit: '',
    },
  };

  const activeConf = config[viewMode];
  const ActiveIcon = activeConf.icon;

  // High/Low Peak Nodes for Single View
  const maxTempIdx = temps.indexOf(maxT);
  const minTempIdx = temps.indexOf(minT);
  const maxHumIdx = hums.indexOf(maxH);
  const minHumIdx = hums.indexOf(minH);

  return (
    <TelemetryCard
      title="Environmental Telemetry Timeline"
      badge="Apple-Grade Spline"
      badgeVariant="zinc"
      accentColor="none"
      className="col-span-full"
    >
      <div className="space-y-5 font-sans">
        
        {/* Top Hero Section: Large Current Metric & Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-white/[0.06]">
          
          {/* Large Hero Metric Display */}
          <div className="flex items-center space-x-4">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg"
              style={{
                backgroundColor: `${activeConf.color}15`,
                borderColor: `${activeConf.color}35`,
                color: activeConf.color,
                boxShadow: `0 0 20px ${activeConf.color}20`,
              }}
            >
              <ActiveIcon className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl font-bold font-sans tracking-tight text-white">
                  {activeConf.currentVal}
                </span>
                <span className="text-xs font-medium text-zinc-400 font-sans">
                  {activeConf.subVal}
                </span>
              </div>

              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-xs text-zinc-400">{activeConf.label}</span>
                {viewMode !== 'all' && (
                  <span className={`inline-flex items-center space-x-0.5 px-2 py-0.2 rounded-full text-[10px] font-medium ${
                    activeConf.delta > 0
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : activeConf.delta < 0
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {activeConf.delta > 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : activeConf.delta < 0 ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                    <span>{activeConf.delta > 0 ? `+${activeConf.delta}` : activeConf.delta}{activeConf.unit} ({timeRange})</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mode Tabs & Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* View Mode Switcher Pills */}
            <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-full border border-white/[0.08]">
              {[
                { id: 'temp', label: 'Temperature', color: '#f59e0b' },
                { id: 'hum', label: 'Humidity', color: '#38bdf8' },
                { id: 'aqi', label: 'Air Quality', color: '#10b981' },
                { id: 'pressure', label: 'Pressure', color: '#c084fc' },
                { id: 'all', label: 'All Channels', color: '#ffffff' },
              ].map((tab) => {
                const isSelected = viewMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id as ViewMode)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-zinc-950 font-semibold shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: tab.color }} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Time Horizon Pills */}
            <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-full border border-white/[0.08]">
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

            {/* Export Actions */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => exportHighResGraphPNG(points, timeRange)}
                title="Snapshot high-res PNG graph"
                className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-800/60 hover:bg-zinc-800 border border-white/[0.08] rounded-xl text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">PNG</span>
              </button>

              <button
                onClick={() => exportCSV(points, timeRange)}
                title="Export points as CSV dataset"
                className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-800/60 hover:bg-zinc-800 border border-white/[0.08] rounded-xl text-zinc-300 hover:text-white text-xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">CSV</span>
              </button>
            </div>

          </div>

        </div>

        {/* Master Fluid SVG Canvas */}
        <div className="relative w-full overflow-hidden bg-black/35 border border-white/[0.06] p-3 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-64 sm:h-80 select-none"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <defs>
              {/* Temperature Golden Amber Gradient */}
              <linearGradient id="tempHeroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>

              {/* Humidity Electric Sky Blue Gradient */}
              <linearGradient id="humHeroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>

              {/* Air Quality Emerald Gradient */}
              <linearGradient id="aqiHeroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>

              {/* Pressure Violet Gradient */}
              <linearGradient id="pressHeroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0.0" />
              </linearGradient>

              {/* Stroke Highlights */}
              <linearGradient id="tempStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>

              <linearGradient id="humStrokeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              {/* Subtle Horizontal Grid Line Gradient */}
              <linearGradient id="subtleGridLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.01)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.07)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
              </linearGradient>
            </defs>

            {/* Background Reference Horizontal Gridlines */}
            {[0.12, 0.38, 0.65, 0.9].map((fraction) => {
              const y = padTop + chartH * fraction;
              const tempVal = Number((maxTempScale - fraction * (maxTempScale - minTempScale)).toFixed(1));
              const humVal = Number((maxHumScale - fraction * (maxHumScale - minHumScale)).toFixed(0));

              return (
                <g key={fraction}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={padLeft + chartW}
                    y2={y}
                    stroke="url(#subtleGridLine)"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                  {(viewMode === 'temp' || viewMode === 'all') && (
                    <text
                      x={padLeft - 10}
                      y={y + 3.5}
                      textAnchor="end"
                      fill="#f59e0b"
                      fontSize="10"
                      fontWeight="500"
                      opacity="0.8"
                    >
                      {tempVal}°
                    </text>
                  )}
                  {(viewMode === 'hum' || viewMode === 'all') && (
                    <text
                      x={padLeft + chartW + 10}
                      y={y + 3.5}
                      textAnchor="start"
                      fill="#38bdf8"
                      fontSize="10"
                      fontWeight="500"
                      opacity="0.8"
                    >
                      {humVal}%
                    </text>
                  )}
                </g>
              );
            })}

            {/* 1. Pressure Channel Spline */}
            {(viewMode === 'pressure' || viewMode === 'all') && (
              <>
                {viewMode === 'pressure' && <path d={pressArea} fill="url(#pressHeroGrad)" />}
                <path
                  d={pressSpline}
                  fill="none"
                  stroke="#c084fc"
                  strokeWidth={viewMode === 'pressure' ? '3.5' : '2'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="filter drop-shadow-[0_0_12px_rgba(192,132,252,0.6)]"
                />
              </>
            )}

            {/* 2. Air Quality Channel Spline */}
            {(viewMode === 'aqi' || viewMode === 'all') && (
              <>
                {viewMode === 'aqi' && <path d={aqiArea} fill="url(#aqiHeroGrad)" />}
                <path
                  d={aqiSpline}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={viewMode === 'aqi' ? '3.5' : '2'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="filter drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                />
              </>
            )}

            {/* 3. Humidity Channel Spline */}
            {(viewMode === 'hum' || viewMode === 'all') && (
              <>
                {viewMode === 'hum' && <path d={humArea} fill="url(#humHeroGrad)" />}
                <path
                  d={humSpline}
                  fill="none"
                  stroke="url(#humStrokeGrad)"
                  strokeWidth={viewMode === 'hum' ? '3.5' : '2.5'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="filter drop-shadow-[0_0_14px_rgba(56,189,248,0.7)]"
                />
              </>
            )}

            {/* 4. Temperature Channel Spline */}
            {(viewMode === 'temp' || viewMode === 'all') && (
              <>
                {viewMode === 'temp' && <path d={tempArea} fill="url(#tempHeroGrad)" />}
                <path
                  d={tempSpline}
                  fill="none"
                  stroke="url(#tempStrokeGrad)"
                  strokeWidth={viewMode === 'temp' ? '3.5' : '2.5'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="filter drop-shadow-[0_0_14px_rgba(245,158,11,0.7)]"
                />
              </>
            )}

            {/* Peak High & Low Badges (When in Single Metric Mode) */}
            {viewMode === 'temp' && points.length > 3 && maxTempIdx >= 0 && (
              <g transform={`translate(${getX(maxTempIdx)}, ${getYTemp(maxT) - 12})`}>
                <rect x="-24" y="-12" width="48" height="18" rx="9" fill="#f59e0b" />
                <text x="0" y="0.5" textAnchor="middle" fill="#090a0f" fontSize="9" fontWeight="700">
                  ▲ {maxT.toFixed(1)}°
                </text>
              </g>
            )}
            {viewMode === 'temp' && points.length > 3 && minTempIdx >= 0 && minTempIdx !== maxTempIdx && (
              <g transform={`translate(${getX(minTempIdx)}, ${getYTemp(minT) + 16})`}>
                <rect x="-24" y="-10" width="48" height="18" rx="9" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
                <text x="0" y="2.5" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="700">
                  ▼ {minT.toFixed(1)}°
                </text>
              </g>
            )}

            {viewMode === 'hum' && points.length > 3 && maxHumIdx >= 0 && (
              <g transform={`translate(${getX(maxHumIdx)}, ${getYHum(maxH) - 12})`}>
                <rect x="-24" y="-12" width="48" height="18" rx="9" fill="#38bdf8" />
                <text x="0" y="0.5" textAnchor="middle" fill="#090a0f" fontSize="9" fontWeight="700">
                  ▲ {maxH.toFixed(0)}%
                </text>
              </g>
            )}
            {viewMode === 'hum' && points.length > 3 && minHumIdx >= 0 && minHumIdx !== maxHumIdx && (
              <g transform={`translate(${getX(minHumIdx)}, ${getYHum(minH) + 16})`}>
                <rect x="-24" y="-10" width="48" height="18" rx="9" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
                <text x="0" y="2.5" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="700">
                  ▼ {minH.toFixed(0)}%
                </text>
              </g>
            )}

            {/* Interactive Cursor Scrubber & Hit Zones */}
            {points.map((pt, i) => {
              const x = getX(i);
              const tY = getYTemp(pt.temperature);
              const hY = getYHum(pt.humidity);

              return (
                <g
                  key={`node-${i}`}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                >
                  <rect
                    x={x - chartW / (points.length * 2)}
                    y={padTop}
                    width={chartW / points.length}
                    height={chartH}
                    fill="transparent"
                  />

                  {/* Highlight Circles on Hover */}
                  {(viewMode === 'temp' || viewMode === 'all') && (
                    <circle
                      cx={x}
                      cy={tY}
                      r={hoveredIndex === i ? 6 : 2.5}
                      fill={hoveredIndex === i ? '#ffffff' : '#f59e0b'}
                      stroke="#f59e0b"
                      strokeWidth={hoveredIndex === i ? 3.5 : 1}
                      className="transition-all duration-150"
                    />
                  )}

                  {(viewMode === 'hum' || viewMode === 'all') && (
                    <circle
                      cx={x}
                      cy={hY}
                      r={hoveredIndex === i ? 6 : 2.5}
                      fill={hoveredIndex === i ? '#ffffff' : '#38bdf8'}
                      stroke="#38bdf8"
                      strokeWidth={hoveredIndex === i ? 3.5 : 1}
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
                  y1={padTop}
                  x2={getX(hoveredIndex)}
                  y2={padTop + chartH}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </g>
            )}

            {/* Time Axis Markers */}
            {points.map((pt, i) => {
              if (i % Math.max(1, Math.floor(points.length / 5)) === 0 || i === points.length - 1) {
                const x = getX(i);
                return (
                  <text
                    key={`time-${i}`}
                    x={x}
                    y={height - 12}
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

          {/* Floating Glass Tooltip Card */}
          {hoveredPoint && (
            <div className="absolute top-4 right-4 bg-zinc-950/95 border border-white/20 p-3.5 rounded-2xl font-sans text-xs shadow-2xl backdrop-blur-2xl z-20 space-y-1.5 min-w-[180px]">
              <div className="text-[10px] font-semibold text-zinc-400 border-b border-white/[0.08] pb-1 flex items-center justify-between">
                <span>TIMESTAMP:</span>
                <span className="text-white font-mono-tech">{hoveredPoint.timeStr}</span>
              </div>
              
              <div className="flex items-center justify-between text-amber-400 font-medium">
                <span>Temperature:</span>
                <span className="font-bold font-mono-tech">{hoveredPoint.temperature.toFixed(1)}°C</span>
              </div>

              <div className="flex items-center justify-between text-sky-400 font-medium">
                <span>Humidity:</span>
                <span className="font-bold font-mono-tech">{hoveredPoint.humidity.toFixed(1)}%</span>
              </div>

              <div className="flex items-center justify-between text-emerald-400 font-medium">
                <span>Air Quality:</span>
                <span className="font-bold font-mono-tech">{hoveredPoint.airQuality || 34} AQI</span>
              </div>

              <div className="flex items-center justify-between text-purple-400 font-medium">
                <span>Pressure:</span>
                <span className="font-bold font-mono-tech">{(hoveredPoint.pressure || 1013.2).toFixed(1)} hPa</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </TelemetryCard>
  );
};
