export interface SensorData {
  temperature: number;
  humidity: number;
  // Optional enriched / hardware sensor fields
  airQuality?: number; // 0-500 AQI or Air Purity Score (0-100)
  pressure?: number;   // Atmospheric pressure in hPa
  battery?: number;    // Battery percentage 0-100%
  voltage?: number;    // Bus rail voltage (e.g. 3.3V or 5.0V)
  lux?: number;        // Ambient light in Lux
  rssi?: number;       // Wi-Fi signal strength in -dBm
  uptime?: number;     // Node uptime in seconds
}

export interface TelemetryPoint {
  timestamp: number;
  timeStr: string;
  temperature: number;
  humidity: number;
  airQuality: number;
  pressure: number;
  battery: number;
  lux: number;
}

export interface TelemetryStats {
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  minHumidity: number;
  maxHumidity: number;
  avgHumidity: number;
  avgAirQuality: number;
  avgPressure: number;
  packetsReceived: number;
  lastPacketTime: number | null;
  latencyMs: number;
  packetRatePerMin: number;
  uptimeSeconds: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'TEMP_WARNING' | 'HUMIDITY_ALERT' | 'AIR_QUALITY' | 'CONNECTION';
  message: string;
  level: 'info' | 'warn' | 'critical' | 'success';
}

export type ConnectionStatus = 'CONNECTED' | 'RECONNECTING' | 'OFFLINE' | 'STANDBY';

export type DashboardView = 'overview' | 'analytics' | 'device' | 'logs';
