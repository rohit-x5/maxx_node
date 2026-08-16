import type { TelemetryPoint } from '../types/telemetry';
import { generateAiEnvironmentalAnalysis } from './aiAnalysis';

export function generateHumanPrintableReport(
  points: TelemetryPoint[],
  currentTemp: number,
  currentHum: number,
  timeRangeLabel: string
) {
  const ai = generateAiEnvironmentalAnalysis(currentTemp, currentHum);
  
  const temps = points.map(p => p.temperature);
  const hums = points.map(p => p.humidity);
  const minTemp = temps.length ? Math.min(...temps) : currentTemp;
  const maxTemp = temps.length ? Math.max(...temps) : currentTemp;
  const minHum = hums.length ? Math.min(...hums) : currentHum;
  const maxHum = hums.length ? Math.max(...hums) : currentHum;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the printable PDF report.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Smart Node - Environmental Health & Comfort Executive Briefing</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      padding: 40px;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.6;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 13px;
    }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-yellow { background: #fef9c3; color: #a16207; }
    .badge-red { background: #fee2e2; color: #b91c1c; }
    
    .score-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 30px;
      display: flex;
      align-items: center;
      gap: 30px;
    }
    .score-number {
      font-size: 48px;
      font-weight: 800;
      color: #ff7700;
      line-height: 1;
    }
    
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .metric-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .metric-value {
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
    }
    .metric-desc {
      font-size: 13px;
      color: #475569;
      margin-top: 8px;
    }

    .recommendations-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 30px;
    }
    .rec-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 14px;
    }
    .rec-bullet {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #16a34a;
      margin-top: 6px;
      flex-shrink: 0;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <div class="brand-title">SMART NODE TELEMETRY</div>
      <div style="font-size: 14px; color: #64748b; margin-top: 4px;">
        DHT11 Environmental Health & Comfort Briefing • Horizon: ${timeRangeLabel.toUpperCase()}
      </div>
    </div>
    <div>
      <span class="badge ${ai.overallScore >= 75 ? 'badge-green' : ai.overallScore >= 50 ? 'badge-yellow' : 'badge-red'}">
        HEALTH GRADE: ${ai.overallScore}/100
      </span>
    </div>
  </div>

  <div class="score-card">
    <div>
      <div class="score-number">${ai.overallScore}<span style="font-size: 24px; color: #94a3b8;">/100</span></div>
      <div style="font-size: 12px; font-weight: 700; color: #64748b; margin-top: 4px;">ENVIRONMENTAL INDEX</div>
    </div>
    <div style="flex: 1;">
      <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a;">Executive Summary Briefing</h3>
      <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">
        ${ai.summaryParagraph}
      </p>
    </div>
  </div>

  <div class="metric-grid">
    <div class="metric-card">
      <div class="metric-title">🌡️ Core Temperature (DHT11)</div>
      <div class="metric-value">${currentTemp.toFixed(1)}°C <span style="font-size: 16px; color: #64748b; font-weight: 500;">(${((currentTemp * 9) / 5 + 32).toFixed(1)}°F)</span></div>
      <div class="metric-desc">
        ${currentTemp > 26 ? 'Slightly warm. Normal room temperature is 21°C - 25°C.' : currentTemp < 19 ? 'Cooler than average.' : 'Optimal comfort range for work & sleep.'}
      </div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">
        Range: ${minTemp.toFixed(1)}°C – ${maxTemp.toFixed(1)}°C
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-title">💧 Relative Humidity (DHT11)</div>
      <div class="metric-value">${currentHum.toFixed(1)}% <span style="font-size: 16px; color: #64748b; font-weight: 500;">RH</span></div>
      <div class="metric-desc">
        ${currentHum > 70 ? 'High moisture level. Recommended to ventilate or use dehumidifier.' : 'Healthy and balanced air moisture.'}
      </div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">
        Range: ${minHum.toFixed(1)}% – ${maxHum.toFixed(1)}%
      </div>
    </div>
  </div>

  <div class="recommendations-box">
    <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #14532d;">✨ AI Recommended Action Items</h3>
    ${ai.recommendations.map(r => `
      <div class="rec-item">
        <div class="rec-bullet"></div>
        <div>
          <strong style="color: #0f172a; font-size: 14px;">${r.title}:</strong>
          <span style="color: #334155; font-size: 13px;"> ${r.description}</span>
        </div>
      </div>
    `).join('')}
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px;">
    <h4 style="margin: 0 0 10px 0; color: #0f172a;">Practical Living & Workplace Indices</h4>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 13px;">
      <div><strong>Mold & Mildew Risk:</strong> <span style="color: ${ai.moldRisk === 'HIGH' || ai.moldRisk === 'CRITICAL' ? '#b91c1c' : '#15803d'};">${ai.moldRisk}</span></div>
      <div><strong>Comfort Sensation:</strong> ${ai.comfortIndex}</div>
      <div><strong>Productivity Rating:</strong> ${ai.productivityScore}%</div>
    </div>
  </div>

  <div class="footer">
    <div>Smart Node Telemetry • Hardware MCU: ESP32-S3 + DHT11 Sensor</div>
    <div>Generated: ${new Date().toLocaleString()}</div>
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="background: #ff7700; color: white; border: none; padding: 12px 28px; font-size: 15px; font-weight: 700; border-radius: 8px; cursor: pointer;">
      🖨️ Print / Save as PDF
    </button>
  </div>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
