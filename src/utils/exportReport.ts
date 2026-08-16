import type { TelemetryPoint } from '../types/telemetry';
import { calculateDewPoint } from './dewPoint';
import { calculateHeatIndex, calculateVPD } from './analytics';

export function exportCSV(points: TelemetryPoint[], timeRangeLabel = 'all') {
  const headers = [
    'Timestamp (ISO)',
    'Local Time',
    'Temperature (°C)',
    'Temperature (°F)',
    'Humidity (%RH)',
    'Air Quality (AQI)',
    'Pressure (hPa)',
    'Battery (%)',
    'Dew Point (°C)',
    'Heat Index (°C)',
    'VPD (kPa)',
  ];

  const rows = points.map((p) => {
    const dewPoint = calculateDewPoint(p.temperature, p.humidity);
    const heatIndex = calculateHeatIndex(p.temperature, p.humidity);
    const { vpdKpa } = calculateVPD(p.temperature, p.humidity);
    const tempF = Number(((p.temperature * 9) / 5 + 32).toFixed(1));

    return [
      new Date(p.timestamp).toISOString(),
      p.timeStr,
      p.temperature.toFixed(2),
      tempF.toFixed(2),
      p.humidity.toFixed(2),
      (p.airQuality ?? 34).toFixed(0),
      (p.pressure ?? 1013.2).toFixed(1),
      (p.battery ?? 98).toFixed(0),
      dewPoint.toFixed(2),
      heatIndex.toFixed(2),
      vpdKpa.toFixed(2),
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `dht11-telemetry-${timeRangeLabel}-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportHighResGraphPNG(points: TelemetryPoint[], timeRangeLabel = 'all') {
  const canvas = document.createElement('canvas');
  const width = 1600;
  const height = 900;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Dark Carbon Background
  ctx.fillStyle = '#07090e';
  ctx.fillRect(0, 0, width, height);

  // Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 2. Header Box
  ctx.fillStyle = '#0d1017';
  ctx.fillRect(40, 30, width - 80, 110);
  ctx.strokeStyle = '#1a202c';
  ctx.strokeRect(40, 30, width - 80, 110);

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "JetBrains Mono", monospace';
  ctx.fillText('DHT11 SENSOR TELEMETRY // REALTIME OSCILLOGRAPH', 70, 75);

  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText(`TIME WINDOW: ${timeRangeLabel.toUpperCase()}  |  SAMPLES: ${points.length} PTS  |  EXPORT: ${new Date().toLocaleString()}`, 70, 110);

  // Min / Max Summary Badges
  const temps = points.map(p => p.temperature);
  const hums = points.map(p => p.humidity);
  const minTemp = temps.length ? Math.min(...temps) : 0;
  const maxTemp = temps.length ? Math.max(...temps) : 0;
  const minHum = hums.length ? Math.min(...hums) : 0;
  const maxHum = hums.length ? Math.max(...hums) : 0;

  ctx.fillStyle = '#ff7700';
  ctx.font = 'bold 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`TEMP: ${minTemp.toFixed(1)}°C - ${maxTemp.toFixed(1)}°C  |  HUM: ${minHum.toFixed(1)}% - ${maxHum.toFixed(1)}%`, width - 70, 90);
  ctx.textAlign = 'left';

  // 3. Graph Area
  const padLeft = 100;
  const padRight = 100;
  const padTop = 180;
  const padBottom = 120;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  ctx.fillStyle = '#090b10';
  ctx.fillRect(padLeft, padTop, chartW, chartH);
  ctx.strokeStyle = '#27272a';
  ctx.strokeRect(padLeft, padTop, chartW, chartH);

  // Scale ranges
  const minT = 10;
  const maxT = 50;
  const minH = 0;
  const maxH = 100;

  const getX = (i: number) => {
    if (points.length <= 1) return padLeft + chartW / 2;
    return padLeft + (i / (points.length - 1)) * chartW;
  };
  const getYTemp = (t: number) => padTop + chartH - ((Math.max(minT, Math.min(maxT, t)) - minT) / (maxT - minT)) * chartH;
  const getYHum = (h: number) => padTop + chartH - ((Math.max(minH, Math.min(maxH, h)) - minH) / (maxH - minH)) * chartH;

  // Grid Lines
  for (let f = 0.25; f <= 0.75; f += 0.25) {
    const y = padTop + chartH * f;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + chartW, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Y labels
    const tVal = Math.round(maxT - f * (maxT - minT));
    const hVal = Math.round(maxH - f * (maxH - minH));
    ctx.fillStyle = '#ff7700';
    ctx.font = '14px monospace';
    ctx.fillText(`${tVal}°C`, padLeft - 60, y + 5);

    ctx.fillStyle = '#00f0ff';
    ctx.fillText(`${hVal}%`, padLeft + chartW + 15, y + 5);
  }

  // Draw Humidity Line (Cyan)
  if (points.length > 0) {
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    points.forEach((pt, i) => {
      const x = getX(i);
      const y = getYHum(pt.humidity);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Humidity Nodes
    points.forEach((pt, i) => {
      const x = getX(i);
      const y = getYHum(pt.humidity);
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Draw Temperature Line (Papaya Orange)
  if (points.length > 0) {
    ctx.strokeStyle = '#ff7700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    points.forEach((pt, i) => {
      const x = getX(i);
      const y = getYTemp(pt.temperature);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Temp Nodes
    points.forEach((pt, i) => {
      const x = getX(i);
      const y = getYTemp(pt.temperature);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#ff7700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  // X Axis Timestamps
  ctx.fillStyle = '#a1a1aa';
  ctx.font = '13px monospace';
  points.forEach((pt, i) => {
    if (i % Math.max(1, Math.floor(points.length / 6)) === 0 || i === points.length - 1) {
      const x = getX(i);
      ctx.fillText(pt.timeStr, x - 25, padTop + chartH + 30);
    }
  });

  // Watermark Footer
  ctx.fillStyle = '#71717a';
  ctx.font = '13px monospace';
  ctx.fillText('SMART NODE TELEMETRY // HARDWARE: ESP32-S3 + DHT11 // DATABASE: RTDB ASIA-SE1', 70, height - 35);

  // Trigger PNG download
  const link = document.createElement('a');
  link.download = `dht11-telemetry-chart-${timeRangeLabel}-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
