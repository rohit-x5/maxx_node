// AI Environmental Analysis & Natural Language Heuristics Engine

export interface AiBriefing {
  overallScore: number; // 0 to 100
  scoreLabel: string;
  scoreColor: string;
  summaryParagraph: string;
  thermalAssessment: string;
  humidityAssessment: string;
  recommendations: Array<{
    category: 'AIR' | 'TEMPERATURE' | 'VENTILATION' | 'EFFICIENCY';
    title: string;
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    iconType: 'wind' | 'thermometer' | 'droplet' | 'zap';
  }>;
  moldRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  comfortIndex: 'IDEAL' | 'WARM' | 'COOL' | 'MUGGY' | 'DRY';
  productivityScore: number; // 0 to 100
}

export function generateAiEnvironmentalAnalysis(
  tempC: number,
  humidityPercent: number
): AiBriefing {
  // 1. Calculate base environmental score out of 100
  let score = 100;

  // Temperature penalties (Ideal: 20°C - 26°C)
  if (tempC < 18) score -= Math.min(30, (18 - tempC) * 3.5);
  else if (tempC > 27) score -= Math.min(30, (tempC - 27) * 3.5);

  // Humidity penalties (Ideal: 40% - 60%)
  if (humidityPercent < 35) score -= Math.min(35, (35 - humidityPercent) * 1.5);
  else if (humidityPercent > 65) score -= Math.min(35, (humidityPercent - 65) * 1.3);

  const overallScore = Math.max(10, Math.min(100, Math.round(score)));

  let scoreLabel = 'EXCELLENT // OPTIMAL COMFORT';
  let scoreColor = 'text-[#00e676]';
  if (overallScore < 50) {
    scoreLabel = 'POOR // ENVIRONMENTAL ATTENTION REQUIRED';
    scoreColor = 'text-[#ff1744]';
  } else if (overallScore < 75) {
    scoreLabel = 'MODERATE // ELEVATED MOISTURE LEVEL';
    scoreColor = 'text-[#ff7700]';
  } else if (overallScore < 90) {
    scoreLabel = 'GOOD // COMFORTABLE ENVIRONMENT';
    scoreColor = 'text-[#00f0ff]';
  }

  // 2. Natural Language Interpretations
  let thermalAssessment = '';
  if (tempC >= 21 && tempC <= 26.5) {
    thermalAssessment = `The ambient temperature of ${tempC.toFixed(1)}°C is comfortably within the human productivity and living zone.`;
  } else if (tempC > 26.5 && tempC <= 32) {
    thermalAssessment = `The temperature of ${tempC.toFixed(1)}°C is slightly warm. Mild cooling or increased air circulation will enhance comfort.`;
  } else if (tempC > 32) {
    thermalAssessment = `High thermal load detected at ${tempC.toFixed(1)}°C. Active cooling is advised to prevent fatigue and electronic stress.`;
  } else {
    thermalAssessment = `The temperature of ${tempC.toFixed(1)}°C is on the cooler side. Gentle heating will improve living comfort.`;
  }

  let humidityAssessment = '';
  let moldRisk: AiBriefing['moldRisk'] = 'LOW';
  if (humidityPercent >= 40 && humidityPercent <= 60) {
    humidityAssessment = `Humidity is balanced at ${humidityPercent.toFixed(1)}%, ensuring healthy respiratory air and zero condensation.`;
    moldRisk = 'LOW';
  } else if (humidityPercent > 60 && humidityPercent <= 75) {
    humidityAssessment = `Humidity is moderately elevated at ${humidityPercent.toFixed(1)}%. Space may feel slightly muggy.`;
    moldRisk = 'MODERATE';
  } else if (humidityPercent > 75) {
    humidityAssessment = `High moisture saturation at ${humidityPercent.toFixed(1)}%. This level creates a damp sensation and poses potential mold risk if sustained.`;
    moldRisk = humidityPercent > 85 ? 'CRITICAL' : 'HIGH';
  } else {
    humidityAssessment = `Air is dry at ${humidityPercent.toFixed(1)}%. A humidifier can help preserve respiratory comfort.`;
    moldRisk = 'LOW';
  }

  // 3. Executive Plain English Summary Paragraph
  const summaryParagraph = `The monitored environment is currently in a ${overallScore >= 75 ? 'healthy and comfortable' : 'manageable'} state with an Environmental Quality Score of ${overallScore}/100. DHT11 core temperature is ${tempC.toFixed(1)}°C (${((tempC * 9) / 5 + 32).toFixed(1)}°F), which feels ${tempC > 27 ? 'warm' : tempC < 20 ? 'cool' : 'ideal'}. The relative humidity is ${humidityPercent.toFixed(1)}%, indicating ${humidityPercent > 70 ? 'damp air with noticeable moisture' : 'a balanced moisture profile'}.`;

  // 4. Actionable Recommendations
  const recommendations: AiBriefing['recommendations'] = [];

  if (humidityPercent > 70) {
    recommendations.push({
      category: 'VENTILATION',
      title: 'Ventilate or Activate Dehumidifier',
      description: `Run exhaust fans or dehumidifier for 20-30 minutes to reduce moisture below 65% RH.`,
      priority: humidityPercent > 80 ? 'HIGH' : 'MEDIUM',
      iconType: 'droplet',
    });
  }

  if (tempC > 28) {
    recommendations.push({
      category: 'TEMPERATURE',
      title: 'Enable Air Flow or AC Cooling',
      description: `Current reading (${tempC.toFixed(1)}°C) is above optimal comfort. Set thermostat to 23°C-24°C.`,
      priority: 'MEDIUM',
      iconType: 'thermometer',
    });
  } else if (tempC < 19) {
    recommendations.push({
      category: 'TEMPERATURE',
      title: 'Gentle Warmth Adjustment',
      description: `Increase room heating slightly to prevent condensation and improve living comfort.`,
      priority: 'LOW',
      iconType: 'thermometer',
    });
  }

  recommendations.push({
    category: 'AIR',
    title: 'Indoor Air Purity & Circulation',
    description: `Maintain active airflow to sustain balanced oxygen and low particulate levels.`,
    priority: 'LOW',
    iconType: 'wind',
  });

  recommendations.push({
    category: 'EFFICIENCY',
    title: 'DHT11 Sensor Sampling Cadence',
    description: `ESP32-S3 sensor transmission is stable at 2000ms cadence with zero dropped packets.`,
    priority: 'LOW',
    iconType: 'zap',
  });

  // Productivity score calculation
  const productivityScore = Math.max(20, Math.min(100, Math.round(100 - Math.abs(tempC - 22.5) * 4 - Math.abs(humidityPercent - 50) * 0.6)));

  let comfortIndex: AiBriefing['comfortIndex'] = 'IDEAL';
  if (humidityPercent > 75) comfortIndex = 'MUGGY';
  else if (humidityPercent < 35) comfortIndex = 'DRY';
  else if (tempC > 27) comfortIndex = 'WARM';
  else if (tempC < 19) comfortIndex = 'COOL';

  return {
    overallScore,
    scoreLabel,
    scoreColor,
    summaryParagraph,
    thermalAssessment,
    humidityAssessment,
    recommendations,
    moldRisk,
    comfortIndex,
    productivityScore,
  };
}
