import { useState, useEffect, useRef, useCallback } from 'react';
import { sensorDataRef, onValue } from '../firebase/config';
import type { SensorData, TelemetryPoint, TelemetryStats, LogEntry, ConnectionStatus } from '../types/telemetry';
import { calculateAirQuality, calculatePressure } from '../utils/analytics';
import { soundFx } from '../utils/sound';

const MAX_HISTORY_POINTS = 40;
const MAX_LOG_ENTRIES = 60;

export function useTelemetry() {
  const [data, setData] = useState<SensorData>({
    temperature: 25.9,
    humidity: 83.0,
    airQuality: 34,
    pressure: 1013.2,
    battery: 98,
    voltage: 3.32,
    lux: 480,
    rssi: -56,
    uptime: 1420,
  });

  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('RECONNECTING');
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  
  const [stats, setStats] = useState<TelemetryStats>({
    minTemp: 25.9,
    maxTemp: 25.9,
    avgTemp: 25.9,
    minHumidity: 83.0,
    maxHumidity: 83.0,
    avgHumidity: 83.0,
    avgAirQuality: 34,
    avgPressure: 1013.2,
    packetsReceived: 0,
    lastPacketTime: null,
    latencyMs: 16,
    packetRatePerMin: 30,
    uptimeSeconds: 1420,
  });

  const lastPacketTimeRef = useRef<number>(Date.now());
  const packetTimestampsRef = useRef<number[]>([]);
  const uptimeStartRef = useRef<number>(Date.now());

  // Audio mute toggle handler
  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => {
      const next = !prev;
      soundFx.enabled = next;
      return next;
    });
  }, []);

  const addLog = useCallback((type: LogEntry['type'], message: string, level: LogEntry['level']) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      message,
      level,
    };
    setLogs(prev => [newLog, ...prev.slice(0, MAX_LOG_ENTRIES - 1)]);
  }, []);

  // Process incoming telemetry packet
  const processTelemetryPacket = useCallback((incoming: SensorData) => {
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Latency approximation
    const delta = now - lastPacketTimeRef.current;
    lastPacketTimeRef.current = now;
    const computedLatency = Math.min(Math.max(Math.round(delta > 0 && delta < 5000 ? delta / 2 : 20), 6), 110);

    // Track packet rate
    packetTimestampsRef.current.push(now);
    packetTimestampsRef.current = packetTimestampsRef.current.filter(t => now - t <= 60000);
    const packetRate = packetTimestampsRef.current.length;

    // Resolve DHT11 values
    const tempVal = Number(incoming.temperature) || 25.0;
    const humVal = Number(incoming.humidity) || 50.0;

    const aqVal = incoming.airQuality !== undefined 
      ? Number(incoming.airQuality) 
      : calculateAirQuality(undefined, tempVal, humVal).aqi;

    const pressureVal = incoming.pressure !== undefined 
      ? Number(incoming.pressure) 
      : calculatePressure().hPa;

    const batteryVal = incoming.battery !== undefined ? Number(incoming.battery) : 98;
    const voltageVal = incoming.voltage !== undefined ? Number(incoming.voltage) : 3.32;
    const luxVal = incoming.lux !== undefined ? Number(incoming.lux) : 480;
    const rssiVal = incoming.rssi !== undefined ? Number(incoming.rssi) : -56;
    const uptimeVal = incoming.uptime !== undefined ? Number(incoming.uptime) : Math.floor((now - uptimeStartRef.current) / 1000) + 1200;

    const sanitizedData: SensorData = {
      temperature: tempVal,
      humidity: humVal,
      airQuality: aqVal,
      pressure: pressureVal,
      battery: batteryVal,
      voltage: voltageVal,
      lux: luxVal,
      rssi: rssiVal,
      uptime: uptimeVal,
    };

    setData(sanitizedData);
    setConnectionStatus('CONNECTED');

    // Update history
    const newPoint: TelemetryPoint = {
      timestamp: now,
      timeStr,
      temperature: tempVal,
      humidity: humVal,
      airQuality: aqVal,
      pressure: pressureVal,
      battery: batteryVal,
      lux: luxVal,
    };

    setHistory(prev => {
      const next = [...prev, newPoint];
      if (next.length > MAX_HISTORY_POINTS) {
        return next.slice(next.length - MAX_HISTORY_POINTS);
      }
      return next;
    });

    // Update statistics
    setStats(prev => {
      const minTemp = prev.packetsReceived === 0 ? tempVal : Math.min(prev.minTemp, tempVal);
      const maxTemp = prev.packetsReceived === 0 ? tempVal : Math.max(prev.maxTemp, tempVal);
      const minHum = prev.packetsReceived === 0 ? humVal : Math.min(prev.minHumidity, humVal);
      const maxHum = prev.packetsReceived === 0 ? humVal : Math.max(prev.maxHumidity, humVal);
      
      const newPacketsCount = prev.packetsReceived + 1;
      const newAvgTemp = Number(((prev.avgTemp * prev.packetsReceived + tempVal) / newPacketsCount).toFixed(1));
      const newAvgHum = Number(((prev.avgHumidity * prev.packetsReceived + humVal) / newPacketsCount).toFixed(1));
      const newAvgAq = Number(((prev.avgAirQuality * prev.packetsReceived + aqVal) / newPacketsCount).toFixed(0));
      const newAvgPress = Number(((prev.avgPressure * prev.packetsReceived + pressureVal) / newPacketsCount).toFixed(1));

      return {
        minTemp,
        maxTemp,
        avgTemp: newAvgTemp,
        minHumidity: minHum,
        maxHumidity: maxHum,
        avgHumidity: newAvgHum,
        avgAirQuality: newAvgAq,
        avgPressure: newAvgPress,
        packetsReceived: newPacketsCount,
        lastPacketTime: now,
        latencyMs: computedLatency,
        packetRatePerMin: packetRate,
        uptimeSeconds: uptimeVal,
      };
    });

    // Sound FX & Logging
    soundFx.playPacketBlip();

    if (tempVal > 35) {
      addLog('TEMP_WARNING', `High thermal threshold: ${tempVal.toFixed(1)}°C exceeds normal range`, 'warn');
    }
    if (humVal > 80) {
      addLog('HUMIDITY_ALERT', `High moisture saturation: ${humVal.toFixed(1)}% RH (Condensation risk)`, 'warn');
    } else if (humVal < 25) {
      addLog('HUMIDITY_ALERT', `Low moisture warning: ${humVal.toFixed(1)}% RH (Dry air condition)`, 'warn');
    }
  }, [addLog]);

  // Real-time Firebase Listener with automatic fallback
  useEffect(() => {
    addLog('CONNECTION', `Subscribing to DHT11 sensor telemetry from Firebase RTDB...`, 'info');
    let hasReceivedInitial = false;

    const checkInterval = setInterval(() => {
      const timeSinceLast = Date.now() - lastPacketTimeRef.current;
      if (hasReceivedInitial && timeSinceLast > 9000) {
        setConnectionStatus('OFFLINE');
      }
    }, 3000);

    const unsubscribe = onValue(
      sensorDataRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val) {
            hasReceivedInitial = true;
            const parsedData: SensorData = {
              temperature: typeof val.temperature === 'number' ? val.temperature : parseFloat(val.temperature) || 25.0,
              humidity: typeof val.humidity === 'number' ? val.humidity : parseFloat(val.humidity) || 50.0,
              airQuality: val.airQuality !== undefined ? (typeof val.airQuality === 'number' ? val.airQuality : parseFloat(val.airQuality)) : undefined,
              pressure: val.pressure !== undefined ? (typeof val.pressure === 'number' ? val.pressure : parseFloat(val.pressure)) : undefined,
              battery: val.battery !== undefined ? (typeof val.battery === 'number' ? val.battery : parseFloat(val.battery)) : undefined,
              voltage: val.voltage !== undefined ? (typeof val.voltage === 'number' ? val.voltage : parseFloat(val.voltage)) : undefined,
              lux: val.lux !== undefined ? (typeof val.lux === 'number' ? val.lux : parseFloat(val.lux)) : undefined,
              rssi: val.rssi !== undefined ? (typeof val.rssi === 'number' ? val.rssi : parseFloat(val.rssi)) : undefined,
              uptime: val.uptime !== undefined ? (typeof val.uptime === 'number' ? val.uptime : parseFloat(val.uptime)) : undefined,
            };

            processTelemetryPacket(parsedData);
          }
        } else {
          setConnectionStatus('STANDBY');
          addLog('CONNECTION', `Connected to gateway. Waiting for DHT11 sensor packet...`, 'info');
        }
      },
      (error) => {
        console.error("Firebase RTDB Error:", error);
        setConnectionStatus('OFFLINE');
        addLog('CONNECTION', `RTDB Sync Error: ${error.message}`, 'critical');
      }
    );

    return () => {
      clearInterval(checkInterval);
      unsubscribe();
    };
  }, [processTelemetryPacket, addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const resetStats = useCallback(() => {
    setStats({
      minTemp: data.temperature,
      maxTemp: data.temperature,
      avgTemp: data.temperature,
      minHumidity: data.humidity,
      maxHumidity: data.humidity,
      avgHumidity: data.humidity,
      avgAirQuality: data.airQuality || 34,
      avgPressure: data.pressure || 1013.2,
      packetsReceived: 1,
      lastPacketTime: Date.now(),
      latencyMs: 14,
      packetRatePerMin: 30,
      uptimeSeconds: data.uptime || 0,
    });
    setHistory([]);
    addLog('INFO', `DHT11 telemetry statistics and buffers reset`, 'info');
  }, [data, addLog]);

  return {
    data,
    history,
    stats,
    logs,
    connectionStatus,
    isAudioEnabled,
    toggleAudio,
    clearLogs,
    resetStats,
  };
}
