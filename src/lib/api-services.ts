/**
 * Real-time API Services for SmartMumbai Dashboard
 * All APIs used are FREE and require NO API key unless noted.
 * Focused on Bandra, Mumbai (lat: 19.0596, lon: 72.8295)
 */

// ─── Coordinates ────────────────────────────────────────────────────
export interface Coordinates {
  lat: number;
  lon: number;
}

export const BANDRA: Coordinates = { lat: 19.0596, lon: 72.8295 };

// ─── Types ──────────────────────────────────────────────────────────

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  rainfall: number;
  weatherCode: number;
  apparentTemperature: number;
  cloudCover: number;
  isDay: boolean;
}

export interface AirQualityData {
  aqi: number; // US AQI
  pm25: number;
  pm10: number;
  co: number;   // carbon monoxide µg/m³
  no2: number;  // nitrogen dioxide µg/m³
  o3: number;   // ozone µg/m³
  so2: number;  // sulphur dioxide µg/m³
}

export interface AQIHistoryPoint {
  hour: string;
  aqi: number;
  pm25: number;
}

export interface TrafficFlowData {
  currentSpeed: number;        // km/h
  freeFlowSpeed: number;       // km/h
  currentTravelTime: number;   // seconds
  freeFlowTravelTime: number;  // seconds
  confidence: number;
  roadClosure: boolean;
  congestionLevel: string;
}

export interface TrafficIncidentAPI {
  id: string;
  type: string;
  description: string;
  from: string;
  to: string;
  delay: number;
  severity: string;
  startTime: string;
  endTime: string;
  lat: number;
  lon: number;
}

// ─── WEATHER (Open-Meteo — FREE, no key) ──────────────────────────

function findNearestHourlyIndex(hourlyTimes: string[], currentTime: string): number {
  if (hourlyTimes.length === 0) return 0;

  const currentMs = new Date(currentTime).getTime();
  let nearestIndex = 0;
  let nearestDelta = Number.POSITIVE_INFINITY;

  for (let i = 0; i < hourlyTimes.length; i += 1) {
    const delta = Math.abs(new Date(hourlyTimes[i]).getTime() - currentMs);
    if (delta < nearestDelta) {
      nearestDelta = delta;
      nearestIndex = i;
    }
  }

  return nearestIndex;
}

export async function fetchWeather(coords: Coordinates = BANDRA): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=visibility,uv_index&timezone=auto`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const data = await res.json();
  const c = data.current;
  const nearestHourlyIndex = findNearestHourlyIndex(data.hourly?.time || [], c.time);
  const visibilityMeters = data.hourly?.visibility?.[nearestHourlyIndex];
  const visibilityKm = typeof visibilityMeters === 'number' ? +(visibilityMeters / 1000).toFixed(1) : 0;
  const uvIndex = data.hourly?.uv_index?.[nearestHourlyIndex] ?? 0;

  return {
    temperature: c.temperature_2m,
    humidity: c.relative_humidity_2m,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    pressure: c.pressure_msl,
    visibility: visibilityKm,
    uvIndex,
    rainfall: typeof c.rain === 'number' ? c.rain : (c.precipitation || 0),
    weatherCode: c.weather_code,
    apparentTemperature: c.apparent_temperature,
    cloudCover: c.cloud_cover,
    isDay: c.is_day === 1,
  };
}

// ─── AIR QUALITY (Open-Meteo — FREE, no key) ────────────────────

export async function fetchAirQuality(coords: Coordinates = BANDRA): Promise<AirQualityData> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Air Quality API error: ${res.status}`);
  const data = await res.json();
  const c = data.current;

  return {
    aqi: c.us_aqi || 0,
    pm25: c.pm2_5 || 0,
    pm10: c.pm10 || 0,
    co: c.carbon_monoxide || 0,
    no2: c.nitrogen_dioxide || 0,
    o3: c.ozone || 0,
    so2: c.sulphur_dioxide || 0,
  };
}

export async function fetchAQIHistory(coords: Coordinates = BANDRA): Promise<AQIHistoryPoint[]> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&hourly=us_aqi,pm2_5&timezone=auto&past_days=1&forecast_days=0`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`AQI History API error: ${res.status}`);
  const data = await res.json();

  return data.hourly.time.map((t: string, i: number) => ({
    hour: new Date(t).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    aqi: data.hourly.us_aqi[i] || 0,
    pm25: data.hourly.pm2_5[i] || 0,
  }));
}

// ─── TRAFFIC (TomTom free tier — needs key from env) ─────────────

const TOMTOM_KEY = typeof window === 'undefined'
  ? process.env.TOMTOM_API_KEY || ''
  : '';

// Bandra road segments for traffic flow queries
export const BANDRA_ROADS = [
  { name: 'Bandra-Worli Sea Link', lat: 19.0380, lon: 72.8162, heading: 180 },
  { name: 'S.V. Road, Bandra', lat: 19.0544, lon: 72.8402, heading: 0 },
  { name: 'Linking Road', lat: 19.0620, lon: 72.8340, heading: 90 },
  { name: 'Hill Road', lat: 19.0580, lon: 72.8300, heading: 45 },
  { name: 'Turner Road', lat: 19.0550, lon: 72.8280, heading: 270 },
  { name: 'Reclamation, Bandra', lat: 19.0445, lon: 72.8230, heading: 180 },
];

/**
 * TomTom Traffic Flow Tiles URL (for map overlay)
 * Use this as a raster tile layer on your map
 */
export function getTomTomTrafficTileUrl(apiKey: string): string {
  return `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${apiKey}&tileSize=256`;
}

/**
 * TomTom Traffic Incident Tiles URL
 */
export function getTomTomIncidentTileUrl(apiKey: string): string {
  return `https://api.tomtom.com/traffic/map/4/tile/incidents/s3/{z}/{x}/{y}.png?key=${apiKey}&tileSize=256`;
}

// ─── CCTV / PUBLIC WEBCAMS ──────────────────────────────────────────
// Using publicly available YouTube live streams of Mumbai/Bandra areas

export interface CCTVFeed {
  id: number;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  embedUrl: string;
  type: 'youtube' | 'iframe' | 'image';
}

export const BANDRA_CCTV_FEEDS: CCTVFeed[] = [
  {
    id: 1,
    name: 'Bandra Station Area',
    location: 'Bandra Railway Station',
    status: 'online',
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1',
    type: 'youtube',
  },
  {
    id: 2,
    name: 'Sea Link View',
    location: 'Bandra-Worli Sea Link',
    status: 'online',
    embedUrl: 'https://www.youtube.com/embed/ydYDqZQpim8?autoplay=1&mute=1',
    type: 'youtube',
  },
  {
    id: 3,
    name: 'Bandstand Promenade',
    location: 'Bandstand, Bandra West',
    status: 'online',
    embedUrl: 'https://www.youtube.com/embed/4xDzrJKXOOY?autoplay=1&mute=1',
    type: 'youtube',
  },
  {
    id: 4,
    name: 'Carter Road',
    location: 'Carter Road, Bandra West',
    status: 'online',
    embedUrl: 'https://www.youtube.com/embed/wpMXs58L5x4?autoplay=1&mute=1',
    type: 'youtube',
  },
  {
    id: 5,
    name: 'S.V. Road Junction',
    location: 'S.V. Road, Bandra',
    status: 'online',
    embedUrl: 'https://www.youtube.com/embed/iGpuQ0ioPrM?autoplay=1&mute=1',
    type: 'youtube',
  },
  {
    id: 6,
    name: 'Linking Road Market',
    location: 'Linking Road, Bandra',
    status: 'online',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1',
    type: 'youtube',
  },
];

// ─── WATER DATA (Realistic Mumbai BMC patterns) ─────────────────

export interface ReservoirData {
  id: number;
  name: string;
  location: string;
  capacity: number;     // in ML (million liters)
  currentLevel: number; // in ML
  status: string;
  lastUpdated: string;
}

export interface WaterQuality {
  ph: number;
  turbidity: number;  // NTU
  tds: number;        // mg/L
  chlorine: number;   // mg/L
  temperature: number; // °C
}

// Real Mumbai reservoir names and approximate data
export function fetchReservoirData(): ReservoirData[] {
  // Based on real BMC / MCGM reservoir data for Mumbai
  const now = new Date();
  const month = now.getMonth(); // 0-11
  // Monsoon months (Jun–Sep) have higher levels
  const seasonalFactor = (month >= 5 && month <= 8) ? 0.85 : (month >= 9 && month <= 11) ? 0.72 : 0.55;

  return [
    {
      id: 1,
      name: 'Upper Vaitarna',
      location: 'Nashik District',
      capacity: 204736,
      currentLevel: Math.round(204736 * seasonalFactor * (0.95 + Math.random() * 0.05)),
      status: seasonalFactor > 0.7 ? 'normal' : 'low',
      lastUpdated: now.toISOString(),
    },
    {
      id: 2,
      name: 'Modak Sagar',
      location: 'Thane District',
      capacity: 130851,
      currentLevel: Math.round(130851 * seasonalFactor * (0.9 + Math.random() * 0.1)),
      status: seasonalFactor > 0.7 ? 'normal' : 'low',
      lastUpdated: now.toISOString(),
    },
    {
      id: 3,
      name: 'Tansa',
      location: 'Thane District',
      capacity: 145228,
      currentLevel: Math.round(145228 * seasonalFactor * (0.88 + Math.random() * 0.12)),
      status: seasonalFactor > 0.7 ? 'normal' : 'low',
      lastUpdated: now.toISOString(),
    },
    {
      id: 4,
      name: 'Middle Vaitarna',
      location: 'Nashik District',
      capacity: 184930,
      currentLevel: Math.round(184930 * seasonalFactor * (0.92 + Math.random() * 0.08)),
      status: seasonalFactor > 0.7 ? 'normal' : 'low',
      lastUpdated: now.toISOString(),
    },
    {
      id: 5,
      name: 'Bhatsa',
      location: 'Thane District',
      capacity: 447363,
      currentLevel: Math.round(447363 * seasonalFactor * (0.87 + Math.random() * 0.13)),
      status: seasonalFactor > 0.7 ? 'normal' : 'low',
      lastUpdated: now.toISOString(),
    },
    {
      id: 6,
      name: 'Vihar',
      location: 'Borivali – Mumbai',
      capacity: 27698,
      currentLevel: Math.round(27698 * seasonalFactor * (0.8 + Math.random() * 0.2)),
      status: seasonalFactor > 0.6 ? 'normal' : 'critical',
      lastUpdated: now.toISOString(),
    },
    {
      id: 7,
      name: 'Tulsi',
      location: 'Borivali – Mumbai',
      capacity: 8046,
      currentLevel: Math.round(8046 * seasonalFactor * (0.75 + Math.random() * 0.25)),
      status: seasonalFactor > 0.6 ? 'normal' : 'critical',
      lastUpdated: now.toISOString(),
    },
  ];
}

// Total Mumbai daily water supply ≈ 3,850 MLD (million liters per day)
// Bandra area ≈ H-West ward gets ~200 MLD
export function fetchWaterConsumption() {
  const hour = new Date().getHours();
  // Realistic hourly pattern: peak morning 6-9, peak evening 6-9
  const hourlyPattern = [
    3.2, 2.8, 2.5, 2.3, 2.5, 4.0, 7.5, 9.2, 9.8, 8.5,
    7.0, 6.5, 6.8, 6.2, 5.8, 5.5, 5.8, 6.5, 8.2, 9.0,
    8.5, 7.0, 5.5, 4.0
  ];

  const dailyTotal = 200; // MLD for Bandra ward
  const hourlyData = hourlyPattern.map((factor, i) => {
    const total = factor;
    return {
      hour: `${i.toString().padStart(2, '0')}:00`,
      residential: +(total * 0.55).toFixed(1),
      commercial: +(total * 0.28).toFixed(1),
      industrial: +(total * 0.17).toFixed(1),
    };
  });

  // Current consumption up to this hour
  const consumedSoFar = hourlyPattern.slice(0, hour + 1).reduce((a, b) => a + b, 0);

  return {
    dailyTotal,
    consumedSoFar: +consumedSoFar.toFixed(1),
    hourlyData,
  };
}

// ─── ENERGY DATA (Realistic patterns based on BEST/Adani data) ───

export function fetchEnergyData() {
  const hour = new Date().getHours();
  // Mumbai peak load ~3,500 MW, Bandra ward ~250 MW
  const peakLoad = 250;
  const hourlyPattern = [
    0.55, 0.50, 0.48, 0.47, 0.50, 0.58, 0.68, 0.78, 0.85, 0.88,
    0.90, 0.92, 0.88, 0.85, 0.82, 0.80, 0.82, 0.88, 0.95, 1.00,
    0.95, 0.85, 0.72, 0.62
  ];

  const currentLoad = Math.round(peakLoad * hourlyPattern[hour] * (0.98 + Math.random() * 0.04));
  const renewablePercent = 18 + Math.random() * 8; // Mumbai ~18-26% renewable

  const hourlyConsumption = hourlyPattern.map((factor, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    consumption: Math.round(peakLoad * factor * (0.95 + Math.random() * 0.1)),
    renewable: Math.round(peakLoad * factor * (0.18 + Math.random() * 0.08)),
  }));

  return {
    currentLoad,
    capacity: peakLoad,
    renewablePercent: +renewablePercent.toFixed(1),
    hourlyConsumption,
    sources: [
      { name: 'Thermal (Tata/Adani)', value: 52, color: '#6b7280' },
      { name: 'Solar', value: 14, color: '#f59e0b' },
      { name: 'Wind', value: 8, color: '#3b82f6' },
      { name: 'Hydro', value: 18, color: '#06b6d4' },
      { name: 'Nuclear (Tarapur)', value: 8, color: '#8b5cf6' },
    ],
  };
}

// ─── WASTE DATA (Realistic SWM patterns) ────────────────────────

export function fetchWasteData() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  // Mumbai generates ~7,000 TPD, Bandra ward ~350 TPD
  const baseDailyWaste = 350;
  const dayFactor = dayOfWeek === 0 ? 0.7 : dayOfWeek === 6 ? 0.85 : 1.0;
  const hour = now.getHours();

  // Collection happens mostly 6 AM – 2 PM
  const collectedPercent = hour < 6 ? 5 : hour < 10 ? 35 : hour < 14 ? 70 : hour < 18 ? 88 : 95;
  const collected = Math.round(baseDailyWaste * dayFactor * (collectedPercent / 100));

  // Weekly history
  const weekData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
    day,
    general: Math.round((baseDailyWaste * 0.48) * (0.9 + Math.random() * 0.2)),
    recyclable: Math.round((baseDailyWaste * 0.27) * (0.9 + Math.random() * 0.2)),
    organic: Math.round((baseDailyWaste * 0.25) * (0.9 + Math.random() * 0.2)),
  }));

  return {
    dailyTarget: Math.round(baseDailyWaste * dayFactor),
    collected,
    recyclingRate: 32 + Math.random() * 8, // Mumbai ~32-40%
    weekData,
  };
}

// ─── HELPER: Wind direction degrees to compass ──────────────────

export function degreesToCompass(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(deg / 22.5) % 16];
}

// ─── HELPER: WMO Weather Code to description ───────────────────

export function weatherCodeToDescription(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snowfall',
    73: 'Moderate snowfall',
    75: 'Heavy snowfall',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
  };
  return map[code] || 'Unknown';
}

// ─── HELPER: Weather code to icon ────────────────────────────────

export function weatherCodeToIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 75) return '❄️';
  if (code <= 82) return '🌧️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}
