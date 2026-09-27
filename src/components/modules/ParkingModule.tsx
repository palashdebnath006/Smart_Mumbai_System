'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
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
  Car,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Navigation,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Types
interface ParkingLot {
  id: number;
  name: string;
  location: string;
  total: number;
  available: number;
  rate: number;
  status: string;
}

// Initial data
const initialParkingLots: ParkingLot[] = [
  { id: 1, name: 'Central Plaza Parking', location: 'Downtown', total: 200, available: 45, rate: 5.0, status: 'open' },
  { id: 2, name: 'Mall Parking', location: 'Shopping District', total: 500, available: 120, rate: 3.0, status: 'open' },
  { id: 3, name: 'Train Station', location: 'Central Station', total: 300, available: 0, rate: 4.0, status: 'full' },
  { id: 4, name: 'Airport Parking', location: 'Terminal 1', total: 1000, available: 350, rate: 8.0, status: 'open' },
  { id: 5, name: 'Hospital', location: 'Medical District', total: 150, available: 12, rate: 2.0, status: 'open' },
  { id: 6, name: 'Stadium', location: 'Sports Complex', total: 800, available: 800, rate: 6.0, status: 'closed' },
];

const hourlyOccupancy = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  occupancy: Math.floor(Math.random() * 40) + 40 + (i >= 8 && i <= 18 ? 20 : 0),
}));

export default function ParkingModule() {
  const isAdmin = useIsAdmin();
  const { toast } = useToast();

  // State
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>(initialParkingLots);
  const [totalSpaces, setTotalSpaces] = useState(2950);
  const [availableSpaces, setAvailableSpaces] = useState(1327);

  // Dialog states
  const [parkingDialogOpen, setParkingDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingParking, setEditingParking] = useState<ParkingLot | null>(null);
  const [parkingToDelete, setParkingToDelete] = useState<number | null>(null);

  // Form states
  const [parkingForm, setParkingForm] = useState({
    name: '',
    location: '',
    total: 0,
    available: 0,
    rate: 0,
    status: 'open',
  });

  // Live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAvailableSpaces(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(0, Math.min(totalSpaces, prev + change));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [totalSpaces]);

  // Handlers
  const handleAddParking = useCallback(() => {
    if (!parkingForm.name.trim() || !parkingForm.location.trim()) {
      toast({ title: 'Error', description: 'Name and location are required', variant: 'destructive' });
      return;
    }

    const newParking: ParkingLot = {
      id: parkingLots.length + 1,
      name: parkingForm.name,
      location: parkingForm.location,
      total: parkingForm.total,
      available: parkingForm.available || parkingForm.total,
      rate: parkingForm.rate,
      status: parkingForm.status,
    };

    setParkingLots(prev => [...prev, newParking]);
    setTotalSpaces(prev => prev + parkingForm.total);
    setAvailableSpaces(prev => prev + (parkingForm.available || parkingForm.total));
    setParkingDialogOpen(false);
    setParkingForm({ name: '', location: '', total: 0, available: 0, rate: 0, status: 'open' });
    toast({ title: 'Success', description: 'Parking location added successfully' });
  }, [parkingForm, parkingLots.length, toast]);

  const handleUpdateParking = useCallback(() => {
    if (!editingParking) return;

    setParkingLots(prev => prev.map(p =>
      p.id === editingParking.id ? { ...p, ...parkingForm } : p
    ));
    setParkingDialogOpen(false);
    setEditingParking(null);
    setParkingForm({ name: '', location: '', total: 0, available: 0, rate: 0, status: 'open' });
    toast({ title: 'Success', description: 'Parking location updated successfully' });
  }, [editingParking, parkingForm, toast]);

  const handleDeleteParking = useCallback(() => {
    if (parkingToDelete === null) return;

    const parking = parkingLots.find(p => p.id === parkingToDelete);
    if (parking) {
      setTotalSpaces(prev => prev - parking.total);
      setAvailableSpaces(prev => prev - parking.available);
    }

    setParkingLots(prev => prev.filter(p => p.id !== parkingToDelete));
    setDeleteConfirmOpen(false);
    setParkingToDelete(null);
    toast({ title: 'Success', description: 'Parking location deleted successfully' });
  }, [parkingToDelete, parkingLots, toast]);

  // Helper functions
  const getOccupancyColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'text-green-500';
    if (percentage > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const occupancyRate = ((totalSpaces - availableSpaces) / totalSpaces) * 100;

  const openEditParking = (parking: ParkingLot) => {
    setEditingParking(parking);
    setParkingForm({
      name: parking.name,
      location: parking.location,
      total: parking.total,
      available: parking.available,
      rate: parking.rate,
      status: parking.status,
    });
    setParkingDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Spots</p>
                  <p className="text-2xl font-bold text-green-500">{availableSpaces}</p>
                  <p className="text-xs text-muted-foreground">of {totalSpaces} total</p>
                </div>
                <Car className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                  <p className="text-2xl font-bold">{occupancyRate.toFixed(0)}%</p>
                </div>
                <div className="w-16 h-16 relative">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#374151"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="3"
                      strokeDasharray={`${occupancyRate}, 100`}
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Rate</p>
                  <p className="text-2xl font-bold">
                    ${(parkingLots.reduce((acc, p) => acc + p.rate, 0) / parkingLots.length).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">per hour</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Parking Lots</p>
                  <p className="text-2xl font-bold">{parkingLots.length}</p>
                  <p className="text-xs text-muted-foreground">{parkingLots.filter(p => p.status === 'open').length} open</p>
                </div>
                <MapPin className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Parking Lots Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-500" />
                Parking Locations
              </CardTitle>
              {isAdmin && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingParking(null);
                    setParkingForm({ name: '', location: '', total: 0, available: 0, rate: 0, status: 'open' });
                    setParkingDialogOpen(true);
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Location
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parkingLots.map((lot) => {
                const occupancyPercent = ((lot.total - lot.available) / lot.total) * 100;
                return (
                  <div
                    key={lot.id}
                    className={`p-4 rounded-lg border relative ${
                      lot.status === 'full' ? 'border-red-500/30 bg-red-500/5' :
                      lot.status === 'closed' ? 'border-gray-500/30 bg-gray-500/5' :
                      'border-border bg-muted/30'
                    }`}
                  >
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditParking(lot)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            setParkingToDelete(lot.id);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{lot.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {lot.location}
                        </p>
                      </div>
                      <Badge
                        variant={lot.status === 'open' ? 'default' : 'secondary'}
                        className={
                          lot.status === 'open' ? 'bg-green-500' :
                          lot.status === 'full' ? 'bg-red-500' : ''
                        }
                      >
                        {lot.status}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Availability</span>
                          <span className={getOccupancyColor(lot.available, lot.total)}>
                            {lot.available}/{lot.total}
                          </span>
                        </div>
                        <Progress value={occupancyPercent} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Rate</span>
                        <span className="font-medium">${lot.rate.toFixed(2)}/hr</span>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={lot.status !== 'open' || lot.available === 0}
                      >
                        {lot.status === 'full' ? (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Full
                          </>
                        ) : lot.status === 'closed' ? (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Closed
                          </>
                        ) : (
                          <>
                            <Navigation className="w-4 h-4 mr-2" />
                            Navigate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Hourly Occupancy Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hourly Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyOccupancy}>
                  <defs>
                    <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="hour" stroke="#6b7280" fontSize={10} />
                  <YAxis stroke="#6b7280" fontSize={10} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value}%`, 'Occupancy']}
                  />
                  <Bar dataKey="occupancy" fill="url(#occupancyGradient)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Parking Dialog */}
      <Dialog open={parkingDialogOpen} onOpenChange={setParkingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingParking ? 'Edit Parking Location' : 'Add Parking Location'}</DialogTitle>
            <DialogDescription>
              {editingParking ? 'Update the parking location details.' : 'Add a new parking location to the system.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Location Name</Label>
              <Input
                value={parkingForm.name}
                onChange={(e) => setParkingForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Central Plaza Parking"
              />
            </div>
            <div className="space-y-2">
              <Label>Address/Area</Label>
              <Input
                value={parkingForm.location}
                onChange={(e) => setParkingForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Downtown"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Spaces</Label>
                <Input
                  type="number"
                  value={parkingForm.total}
                  onChange={(e) => setParkingForm(prev => ({ ...prev, total: parseInt(e.target.value) || 0 }))}
                  placeholder="Total parking spaces"
                />
              </div>
              <div className="space-y-2">
                <Label>Available Spaces</Label>
                <Input
                  type="number"
                  value={parkingForm.available}
                  onChange={(e) => setParkingForm(prev => ({ ...prev, available: parseInt(e.target.value) || 0 }))}
                  placeholder="Currently available"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hourly Rate ($)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={parkingForm.rate}
                  onChange={(e) => setParkingForm(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g., 5.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={parkingForm.status} onValueChange={(v) => setParkingForm(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setParkingDialogOpen(false)}>Cancel</Button>
            <Button onClick={editingParking ? handleUpdateParking : handleAddParking} className="bg-teal-600 hover:bg-teal-700">
              {editingParking ? 'Update' : 'Add Location'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this parking location? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteParking}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
