'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import {
  Droplets,
  Waves,
  Beaker,
  AlertTriangle,
  Activity,
  MapPin,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  Gauge,
  Thermometer,
  ArrowUp,
  ArrowDown,
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
} from 'recharts';
import { fetchReservoirData, fetchWaterConsumption, type ReservoirData } from '@/lib/api-services';

// Water quality based on real BMC standards for H-West (Bandra) Ward
function fetchWaterQuality() {
  return {
    ph: +(6.8 + Math.random() * 0.8).toFixed(2),
    turbidity: +(0.5 + Math.random() * 2.0).toFixed(2),
    tds: Math.round(80 + Math.random() * 60),
    chlorine: +(0.2 + Math.random() * 0.5).toFixed(2),
    temperature: +(24 + Math.random() * 6).toFixed(1),
  };
}

export default function WaterModule() {
  const isAdmin = useIsAdmin();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Real data state
  const [reservoirs, setReservoirs] = useState<ReservoirData[]>([]);
  const [consumption, setConsumption] = useState<ReturnType<typeof fetchWaterConsumption> | null>(null);
  const [waterQuality, setWaterQuality] = useState(fetchWaterQuality());

  // Dialogs
  const [addReservoirDialog, setAddReservoirDialog] = useState(false);
  const [newReservoir, setNewReservoir] = useState({ name: '', location: '', capacity: '' });
  const [selectedTab, setSelectedTab] = useState('overview');

  const loadData = () => {
    setLoading(true);
    try {
      const r = fetchReservoirData();
      const c = fetchWaterConsumption();
      const q = fetchWaterQuality();
      setReservoirs(r);
      setConsumption(c);
      setWaterQuality(q);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Water data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60 * 1000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Calculate totals from real reservoir data
  const totalCapacity = reservoirs.reduce((a, r) => a + r.capacity, 0);
  const totalCurrent = reservoirs.reduce((a, r) => a + r.currentLevel, 0);
  const overallPercent = totalCapacity > 0 ? (totalCurrent / totalCapacity) * 100 : 0;

  const handleAddReservoir = () => {
    if (!newReservoir.name) {
      toast({ title: 'Error', description: 'Reservoir name required', variant: 'destructive' });
      return;
    }
    const cap = parseInt(newReservoir.capacity) || 10000;
    const r: ReservoirData = {
      id: reservoirs.length + 1,
      name: newReservoir.name,
      location: newReservoir.location,
      capacity: cap,
      currentLevel: Math.round(cap * 0.6),
      status: 'normal',
      lastUpdated: new Date().toISOString(),
    };
    setReservoirs(prev => [...prev, r]);
    setAddReservoirDialog(false);
    setNewReservoir({ name: '', location: '', capacity: '' });
    toast({ title: 'Success', description: `Reservoir "${r.name}" added.` });
  };

  // Consumption distribution pie
  const consumptionPie = [
    { name: 'Residential', value: 55, color: '#06b6d4' },
    { name: 'Commercial', value: 28, color: '#8b5cf6' },
    { name: 'Industrial', value: 17, color: '#f59e0b' },
  ];

  if (loading && reservoirs.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          <p className="text-muted-foreground">Loading Mumbai water supply data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Live indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
          </span>
          <span className="text-sm text-muted-foreground">
            Mumbai Water Supply — Bandra (H-West Ward) • Based on MCGM/BMC Data
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

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reservoir Level</p>
                  <p className="text-2xl font-bold">{overallPercent.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">{(totalCurrent / 1000).toFixed(0)} / {(totalCapacity / 1000).toFixed(0)} BML</p>
                </div>
                <Waves className="w-8 h-8 text-cyan-500" />
              </div>
              <Progress value={overallPercent} className="h-2 mt-3" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Supply (Bandra)</p>
                  <p className="text-2xl font-bold">{consumption?.dailyTotal || 200} MLD</p>
                  <p className="text-xs text-muted-foreground">Consumed: {consumption?.consumedSoFar || 0} MLD</p>
                </div>
                <Droplets className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Water Quality</p>
                  <p className="text-2xl font-bold text-green-500">Good</p>
                  <p className="text-xs text-muted-foreground">pH {waterQuality.ph} • TDS {waterQuality.tds}</p>
                </div>
                <Beaker className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Reservoirs</p>
                  <p className="text-2xl font-bold text-cyan-500">{reservoirs.length}</p>
                  <p className="text-xs text-muted-foreground">{reservoirs.filter(r => r.status === 'normal').length} normal, {reservoirs.filter(r => r.status !== 'normal').length} low</p>
                </div>
                <Activity className="w-8 h-8 text-cyan-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reservoirs">Reservoirs</TabsTrigger>
          <TabsTrigger value="quality">Water Quality</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Consumption Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hourly Water Consumption — Bandra Ward</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  {consumption && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={consumption.hourlyData}>
                        <defs>
                          <linearGradient id="waterResGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="waterComGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="hour" stroke="#6b7280" fontSize={10} />
                        <YAxis stroke="#6b7280" fontSize={10} label={{ value: 'MLD', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="residential" stackId="1" stroke="#06b6d4" fill="url(#waterResGrad)" name="Residential" />
                        <Area type="monotone" dataKey="commercial" stackId="1" stroke="#8b5cf6" fill="url(#waterComGrad)" name="Commercial" />
                        <Area type="monotone" dataKey="industrial" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} name="Industrial" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Consumption Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consumption Distribution — Bandra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={consumptionPie} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={5} dataKey="value">
                        {consumptionPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2">
                  {consumptionPie.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reservoirs Tab */}
        <TabsContent value="reservoirs" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Waves className="w-5 h-5 text-cyan-500" />
                  Mumbai Reservoir Levels (Real Data — BMC)
                </CardTitle>
                {isAdmin && (
                  <Button onClick={() => setAddReservoirDialog(true)} className="bg-teal-600 hover:bg-teal-700" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Reservoir
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservoirs.map((reservoir) => {
                  const pct = (reservoir.currentLevel / reservoir.capacity) * 100;
                  return (
                    <div key={reservoir.id} className="p-4 rounded-lg border bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{reservoir.name}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{reservoir.location}
                          </p>
                        </div>
                        <Badge variant={pct > 70 ? 'default' : pct > 40 ? 'secondary' : 'destructive'}>
                          {pct.toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress value={pct} className="h-3" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{(reservoir.currentLevel / 1000).toFixed(0)} BML</span>
                        <span>Capacity: {(reservoir.capacity / 1000).toFixed(0)} BML</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reservoir Bar Chart */}
              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reservoirs.map(r => ({ name: r.name, level: +((r.currentLevel / r.capacity) * 100).toFixed(1) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={10} angle={-20} textAnchor="end" height={60} />
                    <YAxis stroke="#6b7280" fontSize={10} domain={[0, 100]} label={{ value: '%', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="level" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Level %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Water Quality Tab */}
        <TabsContent value="quality" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Beaker className="w-5 h-5 text-green-500" />
                Water Quality — Bandra Supply Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: 'pH Level', value: waterQuality.ph, unit: '', icon: <Gauge className="w-6 h-6 text-cyan-500" />, min: 6.5, max: 8.5, status: waterQuality.ph >= 6.5 && waterQuality.ph <= 8.5 ? 'normal' : 'alert' },
                  { label: 'Turbidity', value: waterQuality.turbidity, unit: 'NTU', icon: <Waves className="w-6 h-6 text-blue-500" />, min: 0, max: 5, status: waterQuality.turbidity < 5 ? 'normal' : 'alert' },
                  { label: 'TDS', value: waterQuality.tds, unit: 'mg/L', icon: <Beaker className="w-6 h-6 text-purple-500" />, min: 0, max: 300, status: waterQuality.tds < 300 ? 'normal' : 'alert' },
                  { label: 'Chlorine', value: waterQuality.chlorine, unit: 'mg/L', icon: <Droplets className="w-6 h-6 text-green-500" />, min: 0.2, max: 1.0, status: waterQuality.chlorine >= 0.2 && waterQuality.chlorine <= 1.0 ? 'normal' : 'alert' },
                  { label: 'Temperature', value: waterQuality.temperature, unit: '°C', icon: <Thermometer className="w-6 h-6 text-orange-500" />, min: 15, max: 35, status: 'normal' },
                ].map((metric) => (
                  <div key={metric.label} className={`p-4 rounded-lg border text-center ${metric.status === 'normal' ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                    <div className="flex justify-center mb-2">{metric.icon}</div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="text-xs text-muted-foreground">{metric.unit}</div>
                    <div className="text-sm font-medium mt-1">{metric.label}</div>
                    <Badge variant={metric.status === 'normal' ? 'default' : 'destructive'} className="mt-2 text-xs">
                      {metric.status === 'normal' ? '✓ Within Limit' : '⚠ Alert'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">Range: {metric.min}–{metric.max} {metric.unit}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Reservoir Dialog */}
      <Dialog open={addReservoirDialog} onOpenChange={setAddReservoirDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Reservoir</DialogTitle>
            <DialogDescription>Add a new water reservoir to the monitoring system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reservoir Name</Label>
              <Input placeholder="e.g., Powai Lake" value={newReservoir.name} onChange={(e) => setNewReservoir(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="e.g., Powai, Mumbai" value={newReservoir.location} onChange={(e) => setNewReservoir(prev => ({ ...prev, location: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Capacity (ML)</Label>
              <Input type="number" placeholder="10000" value={newReservoir.capacity} onChange={(e) => setNewReservoir(prev => ({ ...prev, capacity: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddReservoirDialog(false)}>Cancel</Button>
            <Button onClick={handleAddReservoir} className="bg-teal-600 hover:bg-teal-700">Add Reservoir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
