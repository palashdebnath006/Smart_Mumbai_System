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
  Trash2,
  Recycle,
  Truck,
  MapPin,
  Plus,
  Edit,
  CheckCircle,
  AlertTriangle,
  Activity,
  RefreshCw,
  Loader2,
  Leaf,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import {
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
  AreaChart,
  Area,
  ComposedChart,
  Line,
} from 'recharts';
import { fetchWasteData } from '@/lib/api-services';

// Bandra waste collection zones
interface WasteBin {
  id: number;
  zone: string;
  location: string;
  type: string;
  fillLevel: number;
  status: string;
  lastCollected: string;
}

const initialBins: WasteBin[] = [
  { id: 1, zone: 'Bandra Station', location: 'Near Platform 1', type: 'general', fillLevel: 0, status: 'active', lastCollected: '' },
  { id: 2, zone: 'Linking Road', location: 'Near ICICI Bank', type: 'recyclable', fillLevel: 0, status: 'active', lastCollected: '' },
  { id: 3, zone: 'Hill Road', location: 'Near St. Andrews Church', type: 'general', fillLevel: 0, status: 'active', lastCollected: '' },
  { id: 4, zone: 'Carter Road', location: 'Joggers Park End', type: 'organic', fillLevel: 0, status: 'active', lastCollected: '' },
  { id: 5, zone: 'S.V. Road', location: 'Lucky Junction', type: 'general', fillLevel: 0, status: 'active', lastCollected: '' },
  { id: 6, zone: 'Reclamation', location: 'Near Mehboob Studio', type: 'recyclable', fillLevel: 0, status: 'maintenance', lastCollected: '' },
];

// 8 waste trucks for Bandra ward
const initialTrucks = [
  { id: 1, name: 'BMC-HW-T01', zone: 'Bandra Station', status: 'collecting', tripsToday: 0, capacity: 8 },
  { id: 2, name: 'BMC-HW-T02', zone: 'Linking Road', status: 'en-route', tripsToday: 0, capacity: 8 },
  { id: 3, name: 'BMC-HW-T03', zone: 'Hill Road', status: 'collecting', tripsToday: 0, capacity: 10 },
  { id: 4, name: 'BMC-HW-T04', zone: 'Carter Road', status: 'dumping', tripsToday: 0, capacity: 8 },
  { id: 5, name: 'BMC-HW-T05', zone: 'S.V. Road', status: 'collecting', tripsToday: 0, capacity: 10 },
  { id: 6, name: 'BMC-HW-T06', zone: 'Reclamation', status: 'idle', tripsToday: 0, capacity: 8 },
];

export default function WasteModule() {
  const isAdmin = useIsAdmin();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Data states
  const [wasteData, setWasteData] = useState<ReturnType<typeof fetchWasteData> | null>(null);
  const [bins, setBins] = useState<WasteBin[]>(initialBins);
  const [trucks, setTrucks] = useState(initialTrucks);

  // Dialogs
  const [addBinDialog, setAddBinDialog] = useState(false);
  const [newBin, setNewBin] = useState({ zone: '', location: '', type: 'general' });

  const loadData = () => {
    setLoading(true);
    try {
      const data = fetchWasteData();
      setWasteData(data);

      // Update bin fill levels based on time
      const hour = new Date().getHours();
      setBins(prev => prev.map(bin => ({
        ...bin,
        fillLevel: Math.min(100, Math.round((hour / 24) * 100 * (0.7 + Math.random() * 0.3))),
        lastCollected: hour < 6 ? 'Yesterday 9 PM' : `Today ${Math.max(6, hour - Math.floor(Math.random() * 4))}:00`,
      })));

      // Update truck data
      const statuses = ['collecting', 'en-route', 'dumping', 'idle'];
      setTrucks(prev => prev.map(truck => ({
        ...truck,
        tripsToday: Math.min(6, Math.floor(hour / 3)),
        status: hour < 6 ? 'idle' : hour > 20 ? 'idle' : statuses[Math.floor(Math.random() * 3)],
      })));

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Waste data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Waste category distribution
  const wasteCategories = [
    { name: 'General / Mixed', value: 48, color: '#6b7280' },
    { name: 'Recyclable', value: 27, color: '#10b981' },
    { name: 'Organic / Wet', value: 25, color: '#f59e0b' },
  ];

  const handleAddBin = () => {
    if (!newBin.zone) {
      toast({ title: 'Error', description: 'Zone name required', variant: 'destructive' });
      return;
    }
    const bin: WasteBin = {
      id: bins.length + 1,
      zone: newBin.zone,
      location: newBin.location,
      type: newBin.type,
      fillLevel: 0,
      status: 'active',
      lastCollected: 'Just added',
    };
    setBins(prev => [...prev, bin]);
    setAddBinDialog(false);
    setNewBin({ zone: '', location: '', type: 'general' });
    toast({ title: 'Success', description: `Bin at "${bin.zone}" has been added.` });
  };

  if (loading && !wasteData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          <p className="text-muted-foreground">Loading Bandra waste management data...</p>
        </div>
      </div>
    );
  }

  if (!wasteData) return null;

  const collectionPercent = (wasteData.collected / wasteData.dailyTarget) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Live indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-sm text-muted-foreground">
            SWM — Bandra (H-West Ward) • Based on BMC Solid Waste Data
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Target</p>
                  <p className="text-2xl font-bold">{wasteData.dailyTarget} TPD</p>
                  <p className="text-xs text-muted-foreground">Collected: {wasteData.collected} tons</p>
                </div>
                <Trash2 className="w-8 h-8 text-gray-500" />
              </div>
              <Progress value={collectionPercent} className="h-2 mt-3" />
              <p className="text-xs text-muted-foreground mt-1">{collectionPercent.toFixed(0)}% collected</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recycling Rate</p>
                  <p className="text-2xl font-bold text-green-500">{wasteData.recyclingRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">BMC target: 40%</p>
                </div>
                <Recycle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Trucks</p>
                  <p className="text-2xl font-bold text-blue-500">{trucks.filter(t => t.status !== 'idle').length}/{trucks.length}</p>
                  <p className="text-xs text-muted-foreground">{trucks.reduce((a, t) => a + t.tripsToday, 0)} trips today</p>
                </div>
                <Truck className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bins Monitored</p>
                  <p className="text-2xl font-bold">{bins.length}</p>
                  <p className="text-xs text-muted-foreground">{bins.filter(b => b.fillLevel > 80).length} need collection</p>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bins">Bins & Zones</TabsTrigger>
          <TabsTrigger value="trucks">Fleet</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Collection Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  Weekly Waste Collection — Bandra Ward
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={wasteData.weekData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={10} label={{ value: 'Tons', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="general" stackId="a" fill="#6b7280" name="General" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="recyclable" stackId="a" fill="#10b981" name="Recyclable" />
                      <Bar dataKey="organic" stackId="a" fill="#f59e0b" name="Organic" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Waste Composition Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-500" />
                  Waste Composition — Bandra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={wasteCategories} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${value}%`}>
                        {wasteCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2">
                  {wasteCategories.map((item) => (
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

        {/* Bins Tab */}
        <TabsContent value="bins" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Smart Bins — Bandra Zones</CardTitle>
                {isAdmin && (
                  <Button onClick={() => setAddBinDialog(true)} className="bg-teal-600 hover:bg-teal-700" size="sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Bin
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bins.map((bin) => (
                  <div key={bin.id} className={`p-4 rounded-lg border ${bin.fillLevel > 80 ? 'border-red-500/30 bg-red-500/5' : bin.fillLevel > 50 ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-green-500/30 bg-green-500/5'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Trash2 className={`w-4 h-4 ${bin.fillLevel > 80 ? 'text-red-500' : bin.fillLevel > 50 ? 'text-yellow-500' : 'text-green-500'}`} />
                        <span className="font-medium text-sm">{bin.zone}</span>
                      </div>
                      <Badge variant="outline" className="capitalize text-xs">{bin.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" />{bin.location}
                    </p>
                    <Progress value={bin.fillLevel} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Fill: {bin.fillLevel}%</span>
                      <span>Last: {bin.lastCollected}</span>
                    </div>
                    {bin.fillLevel > 80 && (
                      <Badge variant="destructive" className="mt-2 text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Needs Collection
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fleet Tab */}
        <TabsContent value="trucks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-500" />
                Waste Collection Fleet — Bandra Ward
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Vehicle</th>
                      <th className="text-left py-3 px-4 font-medium">Zone</th>
                      <th className="text-center py-3 px-4 font-medium">Status</th>
                      <th className="text-center py-3 px-4 font-medium">Trips Today</th>
                      <th className="text-right py-3 px-4 font-medium">Capacity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trucks.map((truck) => (
                      <tr key={truck.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{truck.name}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{truck.zone}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={truck.status === 'collecting' ? 'default' : truck.status === 'en-route' ? 'secondary' : truck.status === 'dumping' ? 'outline' : 'secondary'} className="capitalize">
                            {truck.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">{truck.tripsToday}</td>
                        <td className="py-3 px-4 text-right">{truck.capacity} tons</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Bin Dialog */}
      <Dialog open={addBinDialog} onOpenChange={setAddBinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Smart Bin</DialogTitle>
            <DialogDescription>Add a new waste collection bin to the monitoring network.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Zone</Label>
              <Input placeholder="e.g., Pali Hill" value={newBin.zone} onChange={(e) => setNewBin(prev => ({ ...prev, zone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="e.g., Near Pali Naka" value={newBin.location} onChange={(e) => setNewBin(prev => ({ ...prev, location: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={newBin.type} onValueChange={(v) => setNewBin(prev => ({ ...prev, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="recyclable">Recyclable</SelectItem>
                  <SelectItem value="organic">Organic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBinDialog(false)}>Cancel</Button>
            <Button onClick={handleAddBin} className="bg-teal-600 hover:bg-teal-700">Add Bin</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
