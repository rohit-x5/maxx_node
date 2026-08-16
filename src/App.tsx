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
  Battery,
  Wifi,
  Sparkles
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
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-300 pb-20 md:pb-0">
      
      {/* Minimalist Top Header */}
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

      {/* Mobile-Friendly Sub-Bar */}
      <div className="bg-zinc-950/60 border-b border-white/[0.05] px-3 sm:px-8 py-2 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-zinc-400">
            <span className="flex items-center space-x-1.5 text-emerald-400 font-medium text-[11px] sm:text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DHT11 Live</span>
            </span>
            <span className="text-zinc-700">•</span>
            <span className="flex items-center space-x-1 text-[11px] sm:text-xs">
              <Battery className="w-3 h-3 text-emerald-400" />
              <span>{data.battery ?? 98}%</span>
            </span>
            <span className="text-zinc-700 hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center space-x-1 text-[11px]">
              <Wifi className="w-3 h-3 text-sky-400" />
              <span>{data.rssi ?? -56} dBm</span>
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs text-zinc-400">
            <Sparkles className="w-3 h-3 text-amber-400 hidden sm:inline" />
            <span className="text-zinc-300 font-medium">ESP32-S3 Node</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        
        {/* VIEW 1: OVERVIEW */}
        {activeView === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            
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
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
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
          <div className="space-y-4 sm:space-y-6">
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
          <div className="space-y-4 sm:space-y-6">
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
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
          <div className="space-y-4 sm:space-y-6">
            <section>
              <EventLogStream logs={logs} clearLogs={clearLogs} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
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

      {/* iOS-Style Native Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/85 backdrop-blur-2xl border-t border-white/[0.08] px-3 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button
          onClick={() => setActiveView('overview')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeView === 'overview' 
              ? 'text-white font-bold bg-white/[0.08]' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Overview</span>
        </button>

        <button
          onClick={() => setActiveView('analytics')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeView === 'analytics' 
              ? 'text-white font-bold bg-white/[0.08]' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Analytics</span>
        </button>

        <button
          onClick={() => setActiveView('device')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeView === 'device' 
              ? 'text-white font-bold bg-white/[0.08]' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Device</span>
        </button>

        <button
          onClick={() => setActiveView('logs')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeView === 'logs' 
              ? 'text-white font-bold bg-white/[0.08]' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ScrollText className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Logs</span>
        </button>

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded-xl text-amber-400 font-semibold cursor-pointer hover:bg-amber-500/10 transition-all"
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">PDF</span>
        </button>
      </nav>

      {/* Minimalist Modern Footer (Desktop only) */}
      <footer className="hidden md:block border-t border-white/[0.06] bg-zinc-950/60 px-4 py-6 mt-12 text-xs text-zinc-400 font-sans">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block" />
            <span className="font-medium text-zinc-300">Smart Node Telemetry</span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-400">ESP32-S3 + DHT11</span>
          </div>

          <div className="flex items-center space-x-3 text-zinc-400 text-[11px]">
            <span>Live RTDB Connected</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
