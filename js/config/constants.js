export const PHYSICS = {
  speedOfLight: 299792458,
};

export const SYSTEM = {
  txPowerDbm: 20,
  thresholdDbm: -95,
  wallCount: 2,
  minThicknessM: 0.1,
  maxThicknessM: 2.0,
  defaultThicknessM: 0.3,
  minDistanceM: 10,
  maxDistanceM: 150,
  defaultDistanceM: 80,
};

export const TECHNOLOGIES = [
  { id: '2g', name: '2G', band: '850 MHz', frequencyHz: 850e6, color: '#ff2bd6' },
  { id: '3g', name: '3G', band: '1900 MHz', frequencyHz: 1900e6, color: '#00f0ff' },
  { id: '4g', name: '4G', band: '2100 MHz', frequencyHz: 2100e6, color: '#00ff88' },
  { id: '5g-sub6', name: '5G (Sub-6)', band: '3.5 GHz', frequencyHz: 3.5e9, color: '#f0ff00' },
  { id: '5g-mmwave', name: '5G (mmWave)', band: '28 GHz', frequencyHz: 28e9, color: '#8a5cff' },
];

export const MATERIALS = [
  {
    id: 'concrete',
    name: 'Concreto Reforzado',
    attenuationDbPerMeterAt1GHz: 40,
    exponent: 0.85,
  },
  {
    id: 'brick',
    name: 'Ladrillo',
    attenuationDbPerMeterAt1GHz: 20,
    exponent: 0.85,
  },
  {
    id: 'faraday',
    name: 'Malla de Acero / Jaula de Faraday',
    attenuationDbPerMeterAt1GHz: 90,
    exponent: 0.6,
  },
];
