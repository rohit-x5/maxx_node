import { useState } from 'react';
import { useTelemetry } from './hooks/useTelemetry';
import { Header } from './components/Header';
import { TemperatureCard } from './components/TemperatureCard';
import { HumidityCard } from './components/HumidityCard';
import { AirQualityCard } from './components/AirQualityCard';
import { ClimateGaugeCard } from './components/ClimateGaugeCard';
import { EnvironmentPresetSelector } from './components/EnvironmentPresetSelector';
import { SmartAdvisorCard } from './components/SmartAdvisorCard';
import { AiAnalysisCard } from './components/AiAnalysisCard';
import { AdvancedAnalyticsCard } from './components/AdvancedAnalyticsCard';
import { LiveHistoryChart } from './components/LiveHistoryChart';
import { DeviceHealthCard } from './components/DeviceHealthCard';
import { DiagnosticsCard } from './components/DiagnosticsCard';
import { EventLogStream } from './components/EventLogStream';
import { HumanReportModal } from './components/HumanReportModal';
import type { DashboardView } from './types/telemetry';
import { 
  FileText, 
  Layers, 
  BarChart3, 
  Cpu, 
  ScrollText,
  Zap,
  Battery,
  Wifi
} from 'lucide-react';

export default function App() {
  const {
    data,
    history,
    stats,
    logs,
    connectionStatus,
    isAudioEnabled,
    toggleAudio,
    clearLogs,
    resetStats,
  } = useTelemetry();

  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('living');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-300 pb-16 lg:pb-0">
      
      {/* Sleek Minimalist Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        connectionStatus={connectionStatus}
        packetsReceived={stats.packetsReceived}
        latencyMs={stats.latencyMs}
        isAudioEnabled={isAudioEnabled}
        toggleAudio={toggleAudio}
        resetStats={resetStats}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Modern Quick-Status Bar */}
      <div className="bg-zinc-950/40 border-b border-white/[0.05] px-4 sm:px-8 py-2.5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 text-zinc-400">
            <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DHT11 Active</span>
            </span>
            <span className="text-zinc-700">|</span>
            <span className="flex items-center space-x-1">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>{data.battery ?? 98}%</span>
            </span>
            <span className="text-zinc-700 hidden sm:inline">|</span>
            <span className="hidden sm:flex items-center space-x-1">
              <Wifi className="w-3.5 h-3.5 text-sky-400" />
              <span>{data.rssi ?? -56} dBm</span>
            </span>
            <span className="text-zinc-700 hidden sm:inline">|</span>
            <span className="hidden sm:flex items-center space-x-1 text-zinc-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{stats.latencyMs}ms RTT</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-zinc-400 text-xs">
            <span>Hardware:</span>
            <span className="text-zinc-200 font-medium">ESP32-S3 Node</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* VIEW 1: OVERVIEW */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            
            {/* 1. Target Environment Preset Selector */}
            <section>
              <EnvironmentPresetSelector
                selectedPresetId={selectedPresetId}
                onSelectPreset={setSelectedPresetId}
                temperature={data.temperature}
                humidity={data.humidity}
              />
            </section>

            {/* 2. Core 4-Card Sensor Matrix */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Temperature */}
              <TemperatureCard
                temperature={data.temperature}
                minTemp={stats.minTemp}
                maxTemp={stats.maxTemp}
                avgTemp={stats.avgTemp}
                history={history}
              />

              {/* Humidity */}
              <HumidityCard
                humidity={data.humidity}
                temperature={data.temperature}
                minHumidity={stats.minHumidity}
                maxHumidity={stats.maxHumidity}
                avgHumidity={stats.avgHumidity}
                history={history}
              />

              {/* Air Quality */}
              <AirQualityCard
                airQuality={data.airQuality}
                temperature={data.temperature}
                humidity={data.humidity}
                avgAirQuality={stats.avgAirQuality}
                history={history}
              />

              {/* Overall Climate Gauge Dial */}
              <ClimateGaugeCard
                temperature={data.temperature}
                humidity={data.humidity}
              />
            </section>

            {/* 3. Smart Climate Advisor & Trend Drift Card */}
            <section>
              <SmartAdvisorCard
                temperature={data.temperature}
                humidity={data.humidity}
                history={history}
                airQuality={data.airQuality}
              />
            </section>

            {/* 4. Live Multi-Channel Timeline Chart */}
            <section>
              <LiveHistoryChart history={history} />
            </section>

            {/* 5. AI Environmental Insights & Copilot */}
            <section>
              <AiAnalysisCard
                temperature={data.temperature}
                humidity={data.humidity}
              />
            </section>

            {/* 6. Hardware & Stream Diagnostics Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DeviceHealthCard
                data={data}
                stats={stats}
                connectionStatus={connectionStatus}
              />

              <DiagnosticsCard data={data} stats={stats} />
            </section>

            {/* 7. Event Stream Log */}
            <section>
              <EventLogStream logs={logs} clearLogs={clearLogs} />
            </section>

          </div>
        )}

        {/* VIEW 2: DEEP ANALYTICS */}
        {activeView === 'analytics' && (
          <div className="space-y-6">
            <section>
              <AdvancedAnalyticsCard
                temperature={data.temperature}
                humidity={data.humidity}
                pressure={data.pressure}
                lux={data.lux}
                history={history}
                stats={stats}
              />
            </section>

            <section>
              <LiveHistoryChart history={history} />
            </section>

            <section>
              <AiAnalysisCard
                temperature={data.temperature}
                humidity={data.humidity}
              />
            </section>
          </div>
        )}

        {/* VIEW 3: DEVICE HEALTH */}
        {activeView === 'device' && (
          <div className="space-y-6">
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DeviceHealthCard
                data={data}
                stats={stats}
                connectionStatus={connectionStatus}
              />

              <DiagnosticsCard data={data} stats={stats} />
            </section>

            <section>
              <AirQualityCard
                airQuality={data.airQuality}
                temperature={data.temperature}
                humidity={data.humidity}
                avgAirQuality={stats.avgAirQuality}
                history={history}
              />
            </section>
          </div>
        )}

        {/* VIEW 4: AUDIT STREAM */}
        {activeView === 'logs' && (
          <div className="space-y-6">
            <section>
              <EventLogStream logs={logs} clearLogs={clearLogs} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <DiagnosticsCard data={data} stats={stats} />
              <DeviceHealthCard
                data={data}
                stats={stats}
                connectionStatus={connectionStatus}
              />
            </section>
          </div>
        )}

      </main>

      {/* Human-Friendly Executive PDF & Print Report Modal */}
      <HumanReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        history={history}
        currentTemp={data.temperature}
        currentHum={data.humidity}
      />

      {/* Mobile Bottom Quick-Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 border-t border-white/10 backdrop-blur-xl px-2 py-2 flex items-center justify-around text-[10px]">
        <button
          onClick={() => setActiveView('overview')}
          className={`flex flex-col items-center space-y-0.5 py-1 px-2 ${activeView === 'overview' ? 'text-sky-400 font-semibold' : 'text-zinc-500'}`}
        >
          <Layers className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveView('analytics')}
          className={`flex flex-col items-center space-y-0.5 py-1 px-2 ${activeView === 'analytics' ? 'text-sky-400 font-semibold' : 'text-zinc-500'}`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => setActiveView('device')}
          className={`flex flex-col items-center space-y-0.5 py-1 px-2 ${activeView === 'device' ? 'text-sky-400 font-semibold' : 'text-zinc-500'}`}
        >
          <Cpu className="w-4 h-4" />
          <span>Device</span>
        </button>

        <button
          onClick={() => setActiveView('logs')}
          className={`flex flex-col items-center space-y-0.5 py-1 px-2 ${activeView === 'logs' ? 'text-sky-400 font-semibold' : 'text-zinc-500'}`}
        >
          <ScrollText className="w-4 h-4" />
          <span>Logs</span>
        </button>

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex flex-col items-center space-y-0.5 text-amber-400 py-1 px-2 font-semibold"
        >
          <FileText className="w-4 h-4" />
          <span>Report</span>
        </button>
      </div>

      {/* Minimalist Modern Footer */}
      <footer className="border-t border-white/[0.06] bg-zinc-950/60 px-4 py-6 mt-12 text-xs text-zinc-500 font-sans">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" />
            <span className="font-medium text-zinc-300">Smart Node Telemetry</span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-400">DHT11 Environmental Sensor</span>
          </div>

          <div className="flex items-center space-x-3 text-zinc-400 text-[11px]">
            <span>Cadence: 2000ms</span>
            <span className="text-zinc-700">•</span>
            <span>Cloud RTDB Connected</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
