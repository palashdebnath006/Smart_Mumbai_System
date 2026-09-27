'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Zap,
  Sun,
  Wind,
  Droplets,
  Gauge,
  Activity,
  TrendingUp,
  RefreshCw,
  Loader2,
  Flame,
  Atom,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import { fetchEnergyData } from '@/lib/api-services';

export default function EnergyModule() {
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [energyData, setEnergyData] = useState<ReturnType<typeof fetchEnergyData> | null>(null);

  const loadData = () => {
    setLoading(true);
    try {
      const data = fetchEnergyData();
      setEnergyData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Energy data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30 * 1000); // every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading && !energyData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          <p className="text-muted-foreground">Loading Bandra energy grid data...</p>
        </div>
      </div>
    );
  }

  if (!energyData) return null;

  const loadPercent = (energyData.currentLoad / energyData.capacity) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Live indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500" />
          </span>
          <span className="text-sm text-muted-foreground">
            Energy Grid — Bandra (H-West Ward) • Tata Power / Adani Electricity
          </span>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              • Updated {lastUpdated.toLocaleTimeString('en-IN')}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Load</p>
                  <p className="text-2xl font-bold">{energyData.currentLoad} MW</p>
                  <p className="text-xs text-muted-foreground">Capacity: {energyData.capacity} MW</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
              <Progress value={loadPercent} className="h-2 mt-3" />
              <p className="text-xs text-muted-foreground mt-1">{loadPercent.toFixed(1)}% of capacity</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Renewable Share</p>
                  <p className="text-2xl font-bold text-green-500">{energyData.renewablePercent.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Solar + Wind + Hydro</p>
                </div>
                <Sun className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Grid Frequency</p>
                  <p className="text-2xl font-bold">{(49.8 + Math.random() * 0.4).toFixed(2)} Hz</p>
                  <p className="text-xs text-muted-foreground">Target: 50.00 Hz</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CO₂ Emissions</p>
                  <p className="text-2xl font-bold">{Math.round(energyData.currentLoad * 0.82)} tCO₂/h</p>
                  <p className="text-xs text-muted-foreground">Based on generation mix</p>
                </div>
                <Flame className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 24h Consumption Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">24-Hour Energy Consumption — Bandra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={energyData.hourlyConsumption}>
                    <defs>
                      <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="hour" stroke="#6b7280" fontSize={10} />
                    <YAxis stroke="#6b7280" fontSize={10} label={{ value: 'MW', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="consumption" stroke="#f59e0b" fill="url(#energyGrad)" strokeWidth={2} name="Total Load" />
                    <Line type="monotone" dataKey="renewable" stroke="#10b981" strokeWidth={2} dot={false} name="Renewable" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Energy Sources Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Energy Sources — Mumbai Grid Mix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={energyData.sources} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                      {energyData.sources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {energyData.sources.map((source) => {
                  const icons: Record<string, React.ReactNode> = {
                    'Thermal (Tata/Adani)': <Flame className="w-3 h-3" />,
                    'Solar': <Sun className="w-3 h-3" />,
                    'Wind': <Wind className="w-3 h-3" />,
                    'Hydro': <Droplets className="w-3 h-3" />,
                    'Nuclear (Tarapur)': <Atom className="w-3 h-3" />,
                  };
                  return (
                    <div key={source.name} className="flex items-center gap-1.5 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                      {icons[source.name]}
                      <span>{source.name}: {source.value}%</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Load vs Capacity Gauge */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="w-5 h-5 text-yellow-500" />
              Grid Load Status — Bandra Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Peak Load Today', value: `${Math.round(energyData.capacity * 0.95)} MW`, color: 'text-red-500', desc: 'Expected 7-9 PM' },
                { label: 'Off-Peak Load', value: `${Math.round(energyData.capacity * 0.48)} MW`, color: 'text-green-500', desc: '2-5 AM window' },
                { label: 'Avg. Voltage', value: `${(228 + Math.random() * 4).toFixed(1)} V`, color: 'text-blue-500', desc: 'Standard: 230V' },
                { label: 'Power Factor', value: `${(0.92 + Math.random() * 0.06).toFixed(3)}`, color: 'text-purple-500', desc: 'Target: > 0.95' },
              ].map((metric) => (
                <div key={metric.label} className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                  <p className="text-sm font-medium mt-1">{metric.label}</p>
                  <p className="text-xs text-muted-foreground">{metric.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
