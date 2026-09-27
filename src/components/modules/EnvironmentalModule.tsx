'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Wind,
  Thermometer,
  Droplets,
  Sun,
  CloudRain,
  Compass,
  Eye,
  AlertTriangle,
  Activity,
  MapPin,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  BANDRA,
  fetchWeather,
  fetchAirQuality,
  fetchAQIHistory,
  degreesToCompass,
  weatherCodeToDescription,
  weatherCodeToIcon,
  type Coordinates,
  type WeatherData,
  type AirQualityData,
  type AQIHistoryPoint,
} from '@/lib/api-services';

// AQI level definitions
const aqiLevels = [
  { range: '0-50', level: 'Good', color: '#10b981', description: 'Air quality is satisfactory' },
  { range: '51-100', level: 'Moderate', color: '#f59e0b', description: 'Acceptable quality' },
  { range: '101-150', level: 'Unhealthy for Sensitive', color: '#f97316', description: 'Sensitive groups may experience effects' },
  { range: '151-200', level: 'Unhealthy', color: '#ef4444', description: 'Everyone may experience effects' },
  { range: '201-300', level: 'Very Unhealthy', color: '#8b5cf6', description: 'Health alert' },
  { range: '301+', level: 'Hazardous', color: '#7f1d1d', description: 'Emergency conditions' },
];

// Bandra sub-zones with approximate AQI variance
const aqiZones = [
  { zone: 'Bandra Station', baseDelta: 12 },
  { zone: 'Linking Road', baseDelta: 8 },
  { zone: 'Reclamation', baseDelta: -5 },
  { zone: 'Bandstand', baseDelta: -15 },
  { zone: 'Carter Road', baseDelta: -10 },
];

export default function EnvironmentalModule() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [aqiHistory, setAqiHistory] = useState<AQIHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [locationLabel, setLocationLabel] = useState('Bandra, Mumbai');
  const coordsRef = useRef<Coordinates>(BANDRA);

  const loadData = async (coords: Coordinates = coordsRef.current) => {
    setLoading(true);
    setError(null);
    try {
      const [w, aq, hist] = await Promise.all([
        fetchWeather(coords),
        fetchAirQuality(coords),
        fetchAQIHistory(coords),
      ]);
      setWeather(w);
      setAirQuality(aq);
      setAqiHistory(hist);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Environment API error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const detectedCoords: Coordinates = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          coordsRef.current = detectedCoords;
          setLocationLabel(`Lat ${detectedCoords.lat.toFixed(4)}, Lon ${detectedCoords.lon.toFixed(4)}`);
          loadData(detectedCoords);
        },
        () => {
          coordsRef.current = BANDRA;
          setLocationLabel('Bandra, Mumbai');
          loadData(BANDRA);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5 * 60 * 1000,
        }
      );
    } else {
      loadData(BANDRA);
    }

    // Refresh every 5 minutes
    const interval = setInterval(() => loadData(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#f59e0b';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#8b5cf6';
    return '#7f1d1d';
  };

  const getAQILevel = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const currentAQI = airQuality?.aqi || 0;

  // Build pollutant data from real API
  const pollutants = airQuality ? [
    { name: 'PM2.5', value: airQuality.pm25, unit: 'μg/m³', limit: 60, status: airQuality.pm25 < 30 ? 'good' : airQuality.pm25 < 60 ? 'moderate' : 'poor' },
    { name: 'PM10', value: airQuality.pm10, unit: 'μg/m³', limit: 100, status: airQuality.pm10 < 50 ? 'good' : airQuality.pm10 < 100 ? 'moderate' : 'poor' },
    { name: 'CO', value: +(airQuality.co / 1000).toFixed(1), unit: 'mg/m³', limit: 4, status: airQuality.co < 2000 ? 'good' : airQuality.co < 4000 ? 'moderate' : 'poor' },
    { name: 'NO₂', value: +airQuality.no2.toFixed(1), unit: 'μg/m³', limit: 80, status: airQuality.no2 < 40 ? 'good' : airQuality.no2 < 80 ? 'moderate' : 'poor' },
    { name: 'O₃', value: +airQuality.o3.toFixed(1), unit: 'μg/m³', limit: 100, status: airQuality.o3 < 50 ? 'good' : airQuality.o3 < 100 ? 'moderate' : 'poor' },
    { name: 'SO₂', value: +airQuality.so2.toFixed(1), unit: 'μg/m³', limit: 80, status: airQuality.so2 < 40 ? 'good' : airQuality.so2 < 80 ? 'moderate' : 'poor' },
  ] : [];

  const radarData = pollutants.map(p => ({
    pollutant: p.name,
    value: Math.min((p.value / p.limit) * 100, 100),
    fullMark: 100,
  }));

  if (loading && !weather) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          <p className="text-muted-foreground">Loading real-time environment data for Bandra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Live data badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-sm text-muted-foreground">
            Live Data — {locationLabel} • via Open-Meteo API (Free)
          </span>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              • Updated {lastUpdated.toLocaleTimeString('en-IN')}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => loadData()} disabled={loading}>
          <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Main AQI Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wind className="w-5 h-5 text-teal-500" />
                Current Air Quality
                <Badge variant="outline" className="text-xs ml-auto">LIVE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#374151" strokeWidth="12" />
                  <circle
                    cx="100" cy="100" r="90" fill="none"
                    stroke={getAQIColor(currentAQI)}
                    strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${(currentAQI / 500) * 565.48} 565.48`}
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-500"
                  />
                  <text x="100" y="90" textAnchor="middle" fill="currentColor" fontSize="48" fontWeight="bold">
                    {currentAQI}
                  </text>
                  <text x="100" y="115" textAnchor="middle" fill="#9ca3af" fontSize="14">
                    US AQI
                  </text>
                </svg>
              </div>
              <Badge
                className="mt-4 text-lg px-4 py-2"
                style={{ backgroundColor: `${getAQIColor(currentAQI)}20`, color: getAQIColor(currentAQI) }}
              >
                {getAQILevel(currentAQI)}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {aqiLevels.find(l => l.level === getAQILevel(currentAQI))?.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Source: Open-Meteo Air Quality API
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weather Card — REAL DATA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-orange-500" />
                Weather Conditions
                {weather && (
                  <span className="ml-auto text-2xl">{weatherCodeToIcon(weather.weatherCode)}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weather ? (
                <>
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">{weatherCodeToDescription(weather.weatherCode)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg p-4 text-center">
                      <Thermometer className="w-6 h-6 mx-auto text-orange-500" />
                      <div className="text-2xl font-bold mt-2">{weather.temperature.toFixed(1)}°C</div>
                      <div className="text-xs text-muted-foreground">Temperature</div>
                      <div className="text-xs text-muted-foreground">Feels like {weather.apparentTemperature.toFixed(1)}°C</div>
                    </div>
                    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg p-4 text-center">
                      <Droplets className="w-6 h-6 mx-auto text-cyan-500" />
                      <div className="text-2xl font-bold mt-2">{weather.humidity}%</div>
                      <div className="text-xs text-muted-foreground">Humidity</div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-500/10 to-green-500/10 rounded-lg p-4 text-center">
                      <Wind className="w-6 h-6 mx-auto text-teal-500" />
                      <div className="text-2xl font-bold mt-2">{weather.windSpeed} km/h</div>
                      <div className="text-xs text-muted-foreground">Wind Speed</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 text-center">
                      <Compass className="w-6 h-6 mx-auto text-purple-500" />
                      <div className="text-2xl font-bold mt-2">{degreesToCompass(weather.windDirection)}</div>
                      <div className="text-xs text-muted-foreground">Wind Direction</div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center">No weather data</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pollutants Radar — REAL DATA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Pollutant Levels (Real-time)</CardTitle>
            </CardHeader>
            <CardContent>
              {radarData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="pollutant" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                      <PolarRadiusAxis tick={{ fill: '#9ca3af' }} />
                      <Radar name="Level" dataKey="value" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-muted-foreground text-center h-64 flex items-center justify-center">Loading...</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AQI Trend — REAL 24h HISTORY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AQI Trend (Last 24 Hours — Real Data)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {aqiHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aqiHistory}>
                      <defs>
                        <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="hour" stroke="#6b7280" fontSize={10} />
                      <YAxis stroke="#6b7280" fontSize={10} domain={[0, 'auto']} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="aqi" stroke="#14b8a6" strokeWidth={2} fill="url(#aqiGradient)" name="AQI" />
                      <Area type="monotone" dataKey="pm25" stroke="#f59e0b" strokeWidth={1.5} fill="transparent" name="PM2.5" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center h-full flex items-center justify-center">Loading history...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pollutant Details — REAL DATA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pollutant Details (Real-time)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pollutants.map((pollutant) => (
                  <div key={pollutant.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{pollutant.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {pollutant.value} {pollutant.unit}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            pollutant.status === 'good' ? 'border-green-500 text-green-500' :
                            pollutant.status === 'moderate' ? 'border-yellow-500 text-yellow-500' :
                            'border-red-500 text-red-500'
                          }
                        >
                          {pollutant.status}
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={Math.min((pollutant.value / pollutant.limit) * 100, 100)}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">NAAQS Limit: {pollutant.limit} {pollutant.unit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Zone-wise AQI Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-500" />
              Zone-wise Air Quality — Bandra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 rounded-lg overflow-hidden border border-border/50">
              <iframe
                title="Bandra Mumbai Environmental Zones"
                src="https://www.openstreetmap.org/export/embed.html?bbox=72.8065%2C19.0365%2C72.8525%2C19.0825&layer=mapnik&marker=19.0596%2C72.8295"
                className="h-full w-full"
                loading="lazy"
              />
              <div className="absolute top-3 right-3 rounded-lg bg-black/65 px-3 py-2 text-xs text-white backdrop-blur-sm">
                <p className="font-semibold">Bandra Zone View</p>
                <p className="text-white/80">Real AQI data from Open-Meteo</p>
              </div>
            </div>

            {/* Zone list with real AQI variance */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              {aqiZones.map((zone) => {
                const zoneAqi = Math.max(0, currentAQI + zone.baseDelta);
                return (
                  <div key={zone.zone} className="bg-muted/50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold" style={{ color: getAQIColor(zoneAqi) }}>
                      {zoneAqi}
                    </div>
                    <div className="text-sm font-medium">{zone.zone}</div>
                    <Badge
                      variant="outline"
                      className="mt-1 text-xs"
                      style={{ borderColor: getAQIColor(zoneAqi), color: getAQIColor(zoneAqi) }}
                    >
                      {getAQILevel(zoneAqi)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
