'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Car,
  Wind,
  Droplets,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin,
  Thermometer,
  Gauge,
} from 'lucide-react';
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
  BarChart,
  Bar,
} from 'recharts';

// Mock data generators
const generateTrafficData = () => {
  const hours = ['6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'];
  return hours.map((hour, i) => ({
    hour,
    vehicles: Math.floor(Math.random() * 200) + 100,
    speed: Math.floor(Math.random() * 30) + 20,
  }));
};

const generateAQIData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    aqi: Math.floor(Math.random() * 100) + 50,
  }));
};

const incidents = [
  { id: 1, type: 'accident', location: 'Main St & 5th Ave', time: '5 min ago', severity: 'high' },
  { id: 2, type: 'roadwork', location: 'Elm Street', time: '2 hours ago', severity: 'medium' },
  { id: 3, type: 'hazard', location: 'Highway 101', time: '30 min ago', severity: 'low' },
];

export default function OverviewModule() {
  const [trafficData, setTrafficData] = useState(generateTrafficData());
  const [aqiData, setAQIData] = useState(generateAQIData());
  const [liveStats, setLiveStats] = useState({
    traffic: { vehicles: 2847, avgSpeed: 34, congestion: 'Medium' },
    aqi: { value: 87, level: 'Moderate', pm25: 42 },
    water: { daily: 18500, reservoir: 67, leaks: 3 },
    safety: { incidents: 12, resolved: 8, active: 4 },
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        traffic: {
          ...prev.traffic,
          vehicles: prev.traffic.vehicles + Math.floor(Math.random() * 20) - 10,
          avgSpeed: Math.max(20, Math.min(50, prev.traffic.avgSpeed + (Math.random() * 4 - 2))),
        },
        aqi: {
          ...prev.aqi,
          value: Math.max(30, Math.min(200, prev.aqi.value + Math.floor(Math.random() * 6) - 3)),
        },
        water: {
          ...prev.water,
          daily: prev.water.daily + Math.floor(Math.random() * 50) - 25,
        },
        safety: {
          ...prev.safety,
        },
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getAQIColor = (value: number) => {
    if (value <= 50) return 'bg-green-500';
    if (value <= 100) return 'bg-yellow-500';
    if (value <= 150) return 'bg-orange-500';
    if (value <= 200) return 'bg-red-500';
    return 'bg-purple-500';
  };

  const getAQITextColor = (value: number) => {
    if (value <= 50) return 'text-green-500';
    if (value <= 100) return 'text-yellow-500';
    if (value <= 150) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Traffic Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Traffic Flow</CardTitle>
              <Car className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStats.traffic.vehicles.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">vehicles/hour</p>
              <div className="mt-3 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Avg Speed: {liveStats.traffic.avgSpeed.toFixed(0)} km/h</span>
              </div>
              <Badge 
                variant="outline" 
                className={`mt-2 ${
                  liveStats.traffic.congestion === 'Low' ? 'border-green-500 text-green-500' :
                  liveStats.traffic.congestion === 'Medium' ? 'border-yellow-500 text-yellow-500' :
                  'border-red-500 text-red-500'
                }`}
              >
                {liveStats.traffic.congestion} Congestion
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* AQI Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Air Quality</CardTitle>
              <Wind className="w-5 h-5 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getAQITextColor(liveStats.aqi.value)}`}>
                {liveStats.aqi.value}
              </div>
              <p className="text-xs text-muted-foreground">AQI Index</p>
              <div className="mt-3 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getAQIColor(liveStats.aqi.value)}`} />
                <span className="text-sm">{liveStats.aqi.level}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">PM2.5: {liveStats.aqi.pm25} μg/m³</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Water Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Water Usage</CardTitle>
              <Droplets className="w-5 h-5 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStats.water.daily.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">liters today</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Reservoir</span>
                  <span>{liveStats.water.reservoir}%</span>
                </div>
                <Progress value={liveStats.water.reservoir} className="h-2" />
              </div>
              {liveStats.water.leaks > 0 && (
                <Badge variant="outline" className="mt-2 border-orange-500 text-orange-500">
                  {liveStats.water.leaks} Active Leaks
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Safety Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Public Safety</CardTitle>
              <Shield className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveStats.safety.incidents}</div>
              <p className="text-xs text-muted-foreground">incidents today</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="bg-green-500/10 rounded-lg p-2">
                  <div className="text-lg font-bold text-green-500">{liveStats.safety.resolved}</div>
                  <div className="text-xs text-muted-foreground">Resolved</div>
                </div>
                <div className="bg-red-500/10 rounded-lg p-2">
                  <div className="text-lg font-bold text-red-500">{liveStats.safety.active}</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Traffic Flow Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="vehicles"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#trafficGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AQI Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Air Quality Index (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={aqiData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} domain={[0, 200]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="aqi"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Incidents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Active Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        incident.severity === 'high'
                          ? 'bg-red-500 animate-pulse'
                          : incident.severity === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{incident.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {incident.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {incident.location}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{incident.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* City Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-500" />
                <span className="live-indicator inline-block w-2 h-2 rounded-full bg-teal-500 mr-1" />
                Live Maps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 rounded-lg overflow-hidden border border-border/50">
                <iframe
                  title="Bandra Mumbai Live Map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=72.8095%2C19.0396%2C72.8495%2C19.0796&layer=mapnik&marker=19.0596%2C72.8295"
                  className="h-full w-full"
                  loading="lazy"
                />

                {/* Floating stats */}
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-xs">
                  <div className="font-semibold text-white/90 mb-1">Bandra, Mumbai</div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-3 h-3 text-orange-400" />
                    <span>28°C</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    <span>65% Humidity</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
