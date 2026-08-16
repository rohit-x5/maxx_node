export interface EnvironmentPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  targetTempMin: number;
  targetTempMax: number;
  targetHumMin: number;
  targetHumMax: number;
}

export const ENVIRONMENT_PRESETS: EnvironmentPreset[] = [
  {
    id: 'living',
    name: 'Living Room',
    icon: 'Sofa',
    description: 'Daytime comfort & social living spaces',
    targetTempMin: 20.0,
    targetTempMax: 24.5,
    targetHumMin: 40.0,
    targetHumMax: 60.0,
  },
  {
    id: 'bedroom',
    name: 'Bedroom & Sleep',
    icon: 'Moon',
    description: 'Cooler nighttime restorative sleep',
    targetTempMin: 18.0,
    targetTempMax: 21.0,
    targetHumMin: 40.0,
    targetHumMax: 55.0,
  },
  {
    id: 'office',
    name: 'Home Office / Focus',
    icon: 'Laptop',
    description: 'High cognitive focus & alert workspace',
    targetTempMin: 21.0,
    targetTempMax: 23.5,
    targetHumMin: 45.0,
    targetHumMax: 55.0,
  },
  {
    id: 'plants',
    name: 'Indoor Plants & Green',
    icon: 'Sprout',
    description: 'Vibrant foliage & greenhouse humidity',
    targetTempMin: 21.0,
    targetTempMax: 27.0,
    targetHumMin: 55.0,
    targetHumMax: 75.0,
  },
  {
    id: 'tech',
    name: 'Server & Tech Closet',
    icon: 'Server',
    description: 'Hardware protection & moisture safety',
    targetTempMin: 17.0,
    targetTempMax: 23.0,
    targetHumMin: 30.0,
    targetHumMax: 50.0,
  },
];
