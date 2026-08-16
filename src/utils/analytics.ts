// Advanced Environmental & Telemetry Analytics Calculations

/**
 * Calculates Vapor Pressure Deficit (VPD in kPa)
 * VPD = Saturated Vapor Pressure (VPsat) - Actual Vapor Pressure (VPact)
 */
export function calculateVPD(tempC: number, humidityPercent: number): { vpdKpa: number; status: string; color: string } {
  const vpSat = 0.61078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
  const vpAct = vpSat * (humidityPercent / 100);
  const vpd = Math.max(0, vpSat - vpAct);
  const vpdKpa = Number(vpd.toFixed(2));

  let status = 'BALANCED TRANSPIRATION';
  let color = 'text-[#00e676]';

  if (vpdKpa < 0.4) {
    status = 'LOW // CONDENSATION RISK';
    color = 'text-[#00f0ff]';
  } else if (vpdKpa > 1.6) {
    status = 'ELEVATED // MOISTURE EVAPORATION';
    color = 'text-[#ff7700]';
  } else if (vpdKpa > 2.2) {
    status = 'HIGH WATER STRESS';
    color = 'text-[#ff1744]';
  }

  return { vpdKpa, status, color };
}

/**
 * Calculates Heat Index / Apparent "Feels Like" Temperature (°C)
 */
export function calculateHeatIndex(tempC: number, humidityPercent: number): number {
  const T = (tempC * 9) / 5 + 32;
  const R = humidityPercent;

  let hi = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + R * 0.094);

  if (hi >= 80) {
    hi =
      -42.379 +
      2.04901523 * T +
      10.14333127 * R -
      0.22475541 * T * R -
      0.00683783 * T * T -
      0.05481717 * R * R +
      0.00122874 * T * T * R +
      0.00085282 * T * R * R -
      0.00000199 * T * T * R * R;
  }

  const hiCelsius = ((hi - 32) * 5) / 9;
  return Number(hiCelsius.toFixed(1));
}

/**
 * Calculates Absolute Humidity in g/m³
 */
export function calculateAbsoluteHumidity(tempC: number, humidityPercent: number): number {
  const numerator = 6.112 * Math.exp((17.67 * tempC) / (tempC + 243.5)) * humidityPercent * 2.1674;
  const denominator = 273.15 + tempC;
  return Number((numerator / denominator).toFixed(1));
}

/**
 * Calculates Air Quality metrics (AQI 0-500, PM2.5 proxy, category)
 */
export function calculateAirQuality(
  rawAQI?: number,
  tempC: number = 25,
  humidity: number = 50
): {
  aqi: number;
  pm25: number;
  category: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' | 'HAZARDOUS';
  color: string;
  badgeBg: string;
  description: string;
} {
  // If rawAQI provided by sensor, use it; otherwise compute realistic indoor IAQ proxy based on humidity/temp ventilation
  let aqi = rawAQI !== undefined ? rawAQI : 32;
  if (rawAQI === undefined) {
    // Indoor IAQ proxy calculation
    const humFactor = Math.abs(humidity - 45) * 0.4;
    const tempFactor = Math.max(0, tempC - 26) * 1.5;
    aqi = Math.round(Math.min(180, Math.max(18, 28 + humFactor + tempFactor)));
  }

  const pm25 = Number((aqi * 0.28).toFixed(1));

  if (aqi <= 50) {
    return {
      aqi,
      pm25,
      category: 'EXCELLENT',
      color: 'text-[#00e676]',
      badgeBg: 'bg-[#00e676]/15 border-[#00e676]/40 text-[#00e676]',
      description: 'Air quality is pure and ideal for living and deep focus.',
    };
  } else if (aqi <= 100) {
    return {
      aqi,
      pm25,
      category: 'GOOD',
      color: 'text-[#00f0ff]',
      badgeBg: 'bg-[#00f0ff]/15 border-[#00f0ff]/40 text-[#00f0ff]',
      description: 'Acceptable air quality with minor particulate presence.',
    };
  } else if (aqi <= 150) {
    return {
      aqi,
      pm25,
      category: 'MODERATE',
      color: 'text-[#ffb703]',
      badgeBg: 'bg-[#ffb703]/15 border-[#ffb703]/40 text-[#ffb703]',
      description: 'Sensitive individuals may experience mild respiratory irritation.',
    };
  } else if (aqi <= 200) {
    return {
      aqi,
      pm25,
      category: 'POOR',
      color: 'text-[#ff7700]',
      badgeBg: 'bg-[#ff7700]/15 border-[#ff7700]/40 text-[#ff7700]',
      description: 'Increased particulate load. Ventilation or air purification advised.',
    };
  } else {
    return {
      aqi,
      pm25,
      category: 'HAZARDOUS',
      color: 'text-[#ff1744]',
      badgeBg: 'bg-[#ff1744]/15 border-[#ff1744]/40 text-[#ff1744]',
      description: 'Unhealthy air index. Active exhaust filtration required.',
    };
  }
}

/**
 * Calculates Atmospheric Pressure details
 */
export function calculatePressure(rawPressure?: number): {
  hPa: number;
  inHg: number;
  altitudeM: number;
  condition: 'HIGH PRESSURE // FAIR' | 'STANDARD // STABLE' | 'LOW PRESSURE // STORMY';
  color: string;
} {
  const hPa = rawPressure !== undefined ? rawPressure : 1013.25;
  const inHg = Number((hPa * 0.02953).toFixed(2));
  // Altitude approximation based on barometric formula
  const altitudeM = Math.round(44330 * (1 - Math.pow(hPa / 1013.25, 1 / 5.255)));

  let condition: 'HIGH PRESSURE // FAIR' | 'STANDARD // STABLE' | 'LOW PRESSURE // STORMY' = 'STANDARD // STABLE';
  let color = 'text-[#00e676]';

  if (hPa > 1020) {
    condition = 'HIGH PRESSURE // FAIR';
    color = 'text-[#00f0ff]';
  } else if (hPa < 1005) {
    condition = 'LOW PRESSURE // STORMY';
    color = 'text-[#ff7700]';
  }

  return { hPa, inHg, altitudeM, condition, color };
}

/**
 * Calculates Anomaly Detection Score based on z-score of rolling standard deviation
 */
export function calculateAnomalyIndex(currentVal: number, values: number[]): { score: number; isAnomaly: boolean; label: string } {
  if (values.length < 5) {
    return { score: 0.1, isAnomaly: false, label: 'CALIBRATING BASELINE' };
  }

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < 0.05) {
    return { score: 0.0, isAnomaly: false, label: 'OPTIMAL STABILITY (NOISE < 0.1%)' };
  }

  const zScore = Math.abs(currentVal - mean) / stdDev;
  const normalizedScore = Number(Math.min(100, (zScore / 3) * 100).toFixed(0));
  const isAnomaly = zScore > 2.2;

  const label = isAnomaly
    ? 'STATISTICAL SPIKE DETECTED'
    : zScore > 1.4
    ? 'MODERATE VARIATION'
    : 'STEADY STATE TELEMETRY';

  return { score: normalizedScore, isAnomaly, label };
}
