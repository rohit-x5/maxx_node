# 🌿 Smart Node — Minimalist IoT Environmental Telemetry Dashboard

[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-RTDB-ffca28.svg?style=flat&logo=firebase)](https://firebase.google.com/)
[![ESP32-S3](https://img.shields.io/badge/Hardware-ESP32--S3-e7352f.svg?style=flat&logo=espressif)](https://www.espressif.com/)

A consumer-grade, privacy-first **IoT Telemetry Dashboard** designed for real-time indoor climate monitoring using **ESP32-S3** and the **DHT11 (HD11) Temperature & Humidity Sensor**. 

Built with a clean aesthetic inspired by Apple Weather, Linear, and Tesla — featuring live environmental intelligence, room presets, actionable ventilation advice, and multi-channel telemetry streams.

---

## ✨ Features

- **🛋️ Target Climate Presets & Compliance Zones**:
  - Switch between customized spaces: *Living Room*, *Bedroom & Sleep*, *Home Office / Focus*, *Indoor Plants*, and *Server Closet*.
  - Real-time compliance badge indicates whether your room is in the optimal sweet spot.
- **💡 Smart Climate Action & Ventilation Advisor**:
  - Actionable guidance on natural ventilation, window adjustments, and dehumidifier usage.
  - Real-time thermal drift velocity (°C/hour) and moisture rate of change.
  - **1-Click Copy Snapshot** to copy a clean formatted climate briefing for WhatsApp, Slack, or notes.
- **⭕ Circular Progress Health Dial**:
  - Glowing circular progress gauge displaying overall climate rating (/100), core temperature, relative humidity, and dew point spread.
- **📈 Multi-Channel Spline Oscillograph**:
  - Toggle between *Temperature (°C)*, *Humidity (%RH)*, *Air Quality (AQI)*, and *Barometric Pressure (hPa)*.
  - Filter by time horizons (`1M`, `5M`, `15M`, `ALL`).
  - One-click high-resolution PNG graph snapshot & CSV data export.
- **🧠 AI Environmental Copilot**:
  - Continuous neural reasoning providing plain-English occupant summaries, mold risk evaluation, and thermal comfort ratings.
- **📄 Executive Printable PDF Report**:
  - Generate a print-ready PDF briefing with health scores, range statistics, and actionable recommendations.
- **🔒 Privacy & Security Hardened**:
  - Zero GPS or physical location exposure — safe for public web hosting.
  - SSL encrypted uplink to Firebase Realtime Database.

---

## 🛠️ Hardware Requirements

| Component | Description |
| :--- | :--- |
| **MCU** | ESP32-S3 (or ESP8266 / ESP32) Wi-Fi Microcontroller |
| **Sensor** | DHT11 (or DHT22 / HD11) Temperature & Humidity Sensor |
| **Power** | 3.3V or 5V USB Power Rail |
| **Data Pin** | GPIO 4 (or configured pin with 4.7kΩ pull-up resistor) |

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/iot-telemetry-dashboard.git
cd iot-telemetry-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Firebase RTDB (Optional)
Edit `src/firebase/config.ts` to link your Firebase Realtime Database endpoint:
```typescript
const firebaseConfig = {
  databaseURL: "https://YOUR_DATABASE_NAME.firebaseio.com",
};
```

### 4. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### 5. Build for Production
```bash
npm run build
```
Production assets will be output to the `dist/` directory, ready to deploy to **Vercel**, **Netlify**, or **GitHub Pages**.

---

## 📡 Sample Sensor Payload (Firebase RTDB `/sensorData`)

```json
{
  "temperature": 24.8,
  "humidity": 56.2,
  "battery": 98,
  "voltage": 3.32,
  "rssi": -56,
  "uptime": 1420
}
```

---

## 📂 Project Structure

```
├── src/
│   ├── components/
│   │   ├── Header.tsx                   # Minimalist top navigation bar
│   │   ├── TemperatureCard.tsx          # DHT11 Core Temperature card
│   │   ├── HumidityCard.tsx             # DHT11 Relative Humidity card
│   │   ├── AirQualityCard.tsx           # Indoor Air Quality & AQI card
│   │   ├── ClimateGaugeCard.tsx         # Circular progress health gauge
│   │   ├── EnvironmentPresetSelector.tsx# Target climate space selector
│   │   ├── SmartAdvisorCard.tsx         # Ventilation guidance & thermal drift
│   │   ├── LiveHistoryChart.tsx         # Multi-channel spline timeline
│   │   ├── AiAnalysisCard.tsx           # AI intelligence briefing & copilot
│   │   ├── DeviceHealthCard.tsx         # Hardware health & power rail
│   │   ├── DiagnosticsCard.tsx          # Raw JSON stream & node specs
│   │   ├── EventLogStream.tsx           # Real-time event & audit log
│   │   └── HumanReportModal.tsx         # Executive printable PDF modal
│   ├── hooks/
│   │   └── useTelemetry.ts              # RTDB subscription & rolling buffers
│   ├── utils/
│   │   ├── analytics.ts                 # VPD, Heat Index, Absolute Humidity DSP
│   │   ├── dewPoint.ts                  # Dew point calculations
│   │   ├── aiAnalysis.ts                # Natural language heuristics engine
│   │   ├── exportReport.ts              # CSV & High-res PNG exporter
│   │   ├── humanReport.ts               # Printable HTML/PDF report generator
│   │   └── sound.ts                     # Web Audio synthesizer chimes
│   ├── types/                           # TypeScript definitions
│   ├── App.tsx                          # Root application container
│   └── index.css                        # Glassmorphism design tokens & styles
└── package.json
```

---

## 📄 License

MIT License. Feel free to use and customize for your own IoT projects!
