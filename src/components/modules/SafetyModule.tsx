'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Shield,
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  Video,
  Activity,
  CheckCircle,
  XCircle,
  Users,
  Building,
  Flame,
  Heart,
  Siren,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';

// Types
interface SafetyIncident {
  id: number;
  type: string;
  title: string;
  location: string;
  severity: string;
  status: string;
  time: string;
  description: string;
}

interface EmergencyService {
  id: number;
  name: string;
  type: string;
  location: string;
  phone: string;
  status: string;
  personnel: number;
}

interface CCTVCamera {
  id: number;
  name: string;
  location: string;
  status: string;
}

// Initial mock data
const initialIncidents: SafetyIncident[] = [
  { id: 1, type: 'fire', title: 'Building Fire', location: '123 Main St', severity: 'critical', status: 'investigating', time: '15 min ago', description: 'Fire reported on 3rd floor' },
  { id: 2, type: 'crime', title: 'Theft Report', location: 'Central Plaza', severity: 'medium', status: 'investigating', time: '45 min ago', description: 'Vehicle theft reported' },
  { id: 3, type: 'medical', title: 'Medical Emergency', location: 'Train Station', severity: 'high', status: 'reported', time: '20 min ago', description: 'Person collapsed, ambulance dispatched' },
  { id: 4, type: 'fire', title: 'Small Fire', location: 'Industrial Zone', severity: 'low', status: 'resolved', time: '2 hours ago', description: 'Minor fire extinguished' },
];

const initialEmergencyServices: EmergencyService[] = [
  { id: 1, name: 'Central Police Station', type: 'police', location: 'Downtown', phone: '911', status: 'available', personnel: 45 },
  { id: 2, name: 'Fire Station #1', type: 'fire', location: 'Main St', phone: '911', status: 'available', personnel: 12 },
  { id: 3, name: 'City Hospital', type: 'ambulance', location: 'Medical District', phone: '911', status: 'busy', personnel: 120 },
  { id: 4, name: 'Disaster Management', type: 'disaster', location: 'City Center', phone: '911', status: 'available', personnel: 30 },
];

const initialCCTVCameras: CCTVCamera[] = [
  { id: 1, name: 'Bandra Station Area', location: 'Bandra Railway Station', status: 'online' },
  { id: 2, name: 'Sea Link View', location: 'Bandra-Worli Sea Link', status: 'online' },
  { id: 3, name: 'Bandstand Promenade', location: 'Bandstand, Bandra West', status: 'online' },
  { id: 4, name: 'Carter Road', location: 'Carter Road, Bandra West', status: 'online' },
  { id: 5, name: 'S.V. Road Junction', location: 'S.V. Road, Bandra', status: 'online' },
  { id: 6, name: 'Linking Road Market', location: 'Linking Road, Bandra', status: 'online' },
];

// CCTV camera coordinates for satellite view (actual Bandra locations)
const CCTV_LOCATIONS: Record<number, { lat: number; lon: number; zoom: number }> = {
  1: { lat: 19.0544, lon: 72.8402, zoom: 18 }, // Bandra Station
  2: { lat: 19.0380, lon: 72.8162, zoom: 16 }, // Sea Link
  3: { lat: 19.0486, lon: 72.8196, zoom: 17 }, // Bandstand
  4: { lat: 19.0580, lon: 72.8230, zoom: 17 }, // Carter Road
  5: { lat: 19.0596, lon: 72.8402, zoom: 18 }, // S.V. Road
  6: { lat: 19.0620, lon: 72.8340, zoom: 17 }, // Linking Road
};

// Simulated CCTV feed component using satellite map + security overlay
function CCTVFeedView({ camera }: { camera: CCTVCamera }) {
  const [timestamp, setTimestamp] = useState(new Date());
  const loc = CCTV_LOCATIONS[camera.id] || { lat: 19.0596, lon: 72.8295, zoom: 16 };

  useEffect(() => {
    const interval = setInterval(() => setTimestamp(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = timestamp.toLocaleTimeString('en-IN', { hour12: false });
  const dateStr = timestamp.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="relative w-full h-full bg-gray-950 overflow-hidden">
      {/* Satellite/street map as background */}
      <iframe
        title={`CCTV Map - ${camera.name}`}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${loc.lon - 0.003}%2C${loc.lat - 0.002}%2C${loc.lon + 0.003}%2C${loc.lat + 0.002}&layer=mapnik&marker=${loc.lat}%2C${loc.lon}`}
        className="w-full h-full opacity-70 grayscale contrast-125"
        loading="lazy"
        style={{ filter: 'grayscale(80%) contrast(1.2) brightness(0.6)' }}
      />

      {/* Scan line effect overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
        }}
      />

      {/* Dark vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Camera ID - top left */}
      <div className="absolute top-2 left-2 font-mono text-[10px] text-green-400/90">
        CAM-{String(camera.id).padStart(3, '0')} | {camera.name.toUpperCase()}
      </div>

      {/* REC indicator - top right */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
        </span>
        <span className="font-mono text-[10px] text-red-400 font-bold">REC</span>
      </div>

      {/* Timestamp - bottom left */}
      <div className="absolute bottom-2 left-2 font-mono text-[10px] text-green-400/80">
        {dateStr} {timeStr}
      </div>

      {/* Location - bottom right */}
      <div className="absolute bottom-2 right-2 font-mono text-[10px] text-white/60">
        {loc.lat.toFixed(4)}°N {loc.lon.toFixed(4)}°E
      </div>

      {/* Motion detection box (simulated) */}
      <div
        className="absolute border border-green-500/40 rounded-sm"
        style={{
          top: `${30 + (camera.id * 7) % 20}%`,
          left: `${20 + (camera.id * 11) % 30}%`,
          width: `${15 + (camera.id * 3) % 10}%`,
          height: `${12 + (camera.id * 5) % 8}%`,
        }}
      >
        <div className="absolute -top-3 left-0 font-mono text-[8px] text-green-500/60">
          MOTION
        </div>
      </div>
    </div>
  );
}

export default function SafetyModule() {
  const isAdmin = useIsAdmin();
  const { toast } = useToast();

  // State
  const [incidents, setIncidents] = useState<SafetyIncident[]>(initialIncidents);
  const [emergencyServices, setEmergencyServices] = useState<EmergencyService[]>(initialEmergencyServices);
  const [cctvCameras, setCctvCameras] = useState<CCTVCamera[]>(initialCCTVCameras);
  const [stats, setStats] = useState({
    activeIncidents: 3,
    resolvedToday: 12,
    emergencyAvailable: 3,
    cctvOnline: 4,
  });

  // Dialog states
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [cctvDialogOpen, setCctvDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SafetyIncident | EmergencyService | CCTVCamera | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: number } | null>(null);

  // Form states
  const [incidentForm, setIncidentForm] = useState({
    type: 'fire',
    title: '',
    location: '',
    severity: 'medium',
    status: 'reported',
    description: '',
  });

  const [serviceForm, setServiceForm] = useState({
    name: '',
    type: 'police',
    location: '',
    phone: '911',
    status: 'available',
    personnel: 0,
  });

  const [cctvForm, setCctvForm] = useState({
    name: '',
    location: '',
    status: 'online',
  });

  // Live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeIncidents: Math.max(0, Math.min(10, prev.activeIncidents + (Math.random() > 0.8 ? 1 : -1))),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleAddIncident = useCallback(() => {
    if (!incidentForm.title.trim()) {
      toast({ title: 'Error', description: 'Title is required', variant: 'destructive' });
      return;
    }

    const newIncident: SafetyIncident = {
      id: incidents.length + 1,
      ...incidentForm,
      time: 'Just now',
    };

    setIncidents(prev => [newIncident, ...prev]);
    setIncidentDialogOpen(false);
    setIncidentForm({ type: 'fire', title: '', location: '', severity: 'medium', status: 'reported', description: '' });
    toast({ title: 'Success', description: 'Incident added successfully' });
  }, [incidentForm, incidents.length, toast]);

  const handleUpdateIncident = useCallback(() => {
    if (!editingItem || !('type' in editingItem)) return;

    setIncidents(prev => prev.map(inc =>
      inc.id === editingItem.id ? { ...inc, ...incidentForm } : inc
    ));
    setIncidentDialogOpen(false);
    setEditingItem(null);
    setIncidentForm({ type: 'fire', title: '', location: '', severity: 'medium', status: 'reported', description: '' });
    toast({ title: 'Success', description: 'Incident updated successfully' });
  }, [editingItem, incidentForm, toast]);

  const handleAddService = useCallback(() => {
    if (!serviceForm.name.trim()) {
      toast({ title: 'Error', description: 'Service name is required', variant: 'destructive' });
      return;
    }

    const newService: EmergencyService = {
      id: emergencyServices.length + 1,
      ...serviceForm,
    };

    setEmergencyServices(prev => [...prev, newService]);
    setServiceDialogOpen(false);
    setServiceForm({ name: '', type: 'police', location: '', phone: '911', status: 'available', personnel: 0 });
    toast({ title: 'Success', description: 'Emergency service added successfully' });
  }, [serviceForm, emergencyServices.length, toast]);

  const handleUpdateService = useCallback(() => {
    if (!editingItem || !('personnel' in editingItem)) return;

    setEmergencyServices(prev => prev.map(svc =>
      svc.id === editingItem.id ? { ...svc, ...serviceForm } : svc
    ));
    setServiceDialogOpen(false);
    setEditingItem(null);
    setServiceForm({ name: '', type: 'police', location: '', phone: '911', status: 'available', personnel: 0 });
    toast({ title: 'Success', description: 'Service updated successfully' });
  }, [editingItem, serviceForm, toast]);

  const handleAddCCTV = useCallback(() => {
    if (!cctvForm.name.trim()) {
      toast({ title: 'Error', description: 'Camera name is required', variant: 'destructive' });
      return;
    }

    const newCamera: CCTVCamera = {
      id: cctvCameras.length + 1,
      ...cctvForm,
    };

    setCctvCameras(prev => [...prev, newCamera]);
    setCctvDialogOpen(false);
    setCctvForm({ name: '', location: '', status: 'online' });
    toast({ title: 'Success', description: 'CCTV camera added successfully' });
  }, [cctvForm, cctvCameras.length, toast]);

  const handleDelete = useCallback(() => {
    if (!itemToDelete) return;

    switch (itemToDelete.type) {
      case 'incident':
        setIncidents(prev => prev.filter(i => i.id !== itemToDelete.id));
        break;
      case 'service':
        setEmergencyServices(prev => prev.filter(s => s.id !== itemToDelete.id));
        break;
      case 'cctv':
        setCctvCameras(prev => prev.filter(c => c.id !== itemToDelete.id));
        break;
    }

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
    toast({ title: 'Success', description: 'Item deleted successfully' });
  }, [itemToDelete, toast]);

  // Helper functions
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'police': return <Shield className="w-5 h-5" />;
      case 'fire': return <Flame className="w-5 h-5" />;
      case 'ambulance': return <Heart className="w-5 h-5" />;
      case 'disaster': return <Siren className="w-5 h-5" />;
      default: return <Building className="w-5 h-5" />;
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case 'police': return 'text-blue-500 bg-blue-500/10';
      case 'fire': return 'text-red-500 bg-red-500/10';
      case 'ambulance': return 'text-green-500 bg-green-500/10';
      case 'disaster': return 'text-orange-500 bg-orange-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const openEditIncident = (incident: SafetyIncident) => {
    setEditingItem(incident);
    setIncidentForm({
      type: incident.type,
      title: incident.title,
      location: incident.location,
      severity: incident.severity,
      status: incident.status,
      description: incident.description,
    });
    setIncidentDialogOpen(true);
  };

  const openEditService = (service: EmergencyService) => {
    setEditingItem(service);
    setServiceForm({
      name: service.name,
      type: service.type,
      location: service.location,
      phone: service.phone,
      status: service.status,
      personnel: service.personnel,
    });
    setServiceDialogOpen(true);
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
                  <p className="text-sm text-muted-foreground">Active Incidents</p>
                  <p className="text-2xl font-bold text-red-500">{stats.activeIncidents}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved Today</p>
                  <p className="text-2xl font-bold text-green-500">{stats.resolvedToday}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Services Available</p>
                  <p className="text-2xl font-bold text-teal-500">{emergencyServices.filter(s => s.status === 'available').length}/{emergencyServices.length}</p>
                </div>
                <Phone className="w-8 h-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CCTV Online</p>
                  <p className="text-2xl font-bold text-blue-500">{cctvCameras.filter(c => c.status === 'online').length}/{cctvCameras.length}</p>
                </div>
                <Video className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Incidents */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Active Incidents
                </CardTitle>
                {isAdmin && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingItem(null);
                      setIncidentForm({ type: 'fire', title: '', location: '', severity: 'medium', status: 'reported', description: '' });
                      setIncidentDialogOpen(true);
                    }}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={`p-4 rounded-lg border ${
                      incident.status === 'resolved' 
                        ? 'border-green-500/30 bg-green-500/5' 
                        : incident.severity === 'critical'
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-yellow-500/30 bg-yellow-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          incident.type === 'fire' ? 'bg-red-500/20 text-red-500' :
                          incident.type === 'crime' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-green-500/20 text-green-500'
                        }`}>
                          {incident.type === 'fire' && <Flame className="w-5 h-5" />}
                          {incident.type === 'crime' && <Shield className="w-5 h-5" />}
                          {incident.type === 'medical' && <Heart className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{incident.title}</h4>
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{incident.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {incident.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {incident.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={incident.status === 'resolved' ? 'default' : 'destructive'}>
                          {incident.status}
                        </Badge>
                        {isAdmin && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditIncident(incident)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setItemToDelete({ type: 'incident', id: incident.id });
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Emergency Services */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="w-5 h-5 text-teal-500" />
                  Emergency Services
                </CardTitle>
                {isAdmin && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingItem(null);
                      setServiceForm({ name: '', type: 'police', location: '', phone: '911', status: 'available', personnel: 0 });
                      setServiceDialogOpen(true);
                    }}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emergencyServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getServiceColor(service.type)}`}>
                        {getServiceIcon(service.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {service.location}
                          <Users className="w-3 h-3 ml-2" />
                          {service.personnel} personnel
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold">{service.phone}</div>
                        <Badge
                          variant={service.status === 'available' ? 'default' : 'secondary'}
                          className={service.status === 'available' ? 'bg-green-500' : ''}
                        >
                          {service.status}
                        </Badge>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditService(service)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setItemToDelete({ type: 'service', id: service.id });
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CCTV Network — LIVE FEEDS */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-500" />
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                CCTV Network — Bandra Live Monitoring
              </CardTitle>
              {isAdmin && (
                <Button
                  size="sm"
                  onClick={() => {
                    setCctvForm({ name: '', location: '', status: 'online' });
                    setCctvDialogOpen(true);
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Camera
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cctvCameras.map((camera) => (
                <div
                  key={camera.id}
                  className={`rounded-lg border overflow-hidden relative ${
                    camera.status === 'online'
                      ? 'border-green-500/30'
                      : camera.status === 'maintenance'
                      ? 'border-yellow-500/30'
                      : 'border-red-500/30'
                  }`}
                >
                  {/* Live CCTV feed simulation */}
                  <div className="relative h-48 bg-black">
                    {camera.status === 'online' ? (
                      <CCTVFeedView camera={camera} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <div className="text-center">
                          {camera.status === 'maintenance' ? (
                            <Activity className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                          ) : (
                            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                          )}
                          <p className="text-sm text-gray-400 capitalize">{camera.status}</p>
                        </div>
                      </div>
                    )}
                    {/* Status overlay */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded px-2 py-1">
                      {camera.status === 'online' ? (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                      ) : (
                        <span className="flex h-2 w-2 rounded-full bg-gray-500" />
                      )}
                      <span className="text-xs text-white font-medium">
                        {camera.status === 'online' ? 'LIVE' : camera.status.toUpperCase()}
                      </span>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70"
                        onClick={() => {
                          setItemToDelete({ type: 'cctv', id: camera.id });
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    )}
                  </div>
                  {/* Camera info */}
                  <div className="p-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{camera.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {camera.location}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          camera.status === 'online' ? 'border-green-500 text-green-500' :
                          camera.status === 'maintenance' ? 'border-yellow-500 text-yellow-500' :
                          'border-red-500 text-red-500'
                        }`}
                      >
                        {camera.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Incident Dialog */}
      <Dialog open={incidentDialogOpen} onOpenChange={setIncidentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Incident' : 'Add New Incident'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the incident details.' : 'Report a new safety incident.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={incidentForm.type} onValueChange={(v) => setIncidentForm(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fire">Fire</SelectItem>
                    <SelectItem value="crime">Crime</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Severity</Label>
                <Select value={incidentForm.severity} onValueChange={(v) => setIncidentForm(prev => ({ ...prev, severity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={incidentForm.title}
                onChange={(e) => setIncidentForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Incident title"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={incidentForm.location}
                onChange={(e) => setIncidentForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Incident location"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={incidentForm.description}
                onChange={(e) => setIncidentForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the incident"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={incidentForm.status} onValueChange={(v) => setIncidentForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIncidentDialogOpen(false)}>Cancel</Button>
            <Button onClick={editingItem ? handleUpdateIncident : handleAddIncident} className="bg-teal-600 hover:bg-teal-700">
              {editingItem ? 'Update' : 'Add Incident'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Emergency Service Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Service' : 'Add Emergency Service'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Update the service details.' : 'Add a new emergency service to the directory.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input
                value={serviceForm.name}
                onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Fire Station #2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={serviceForm.type} onValueChange={(v) => setServiceForm(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="police">Police</SelectItem>
                    <SelectItem value="fire">Fire</SelectItem>
                    <SelectItem value="ambulance">Ambulance</SelectItem>
                    <SelectItem value="disaster">Disaster Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={serviceForm.status} onValueChange={(v) => setServiceForm(prev => ({ ...prev, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={serviceForm.location}
                onChange={(e) => setServiceForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Service location"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={serviceForm.phone}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="911"
                />
              </div>
              <div className="space-y-2">
                <Label>Personnel</Label>
                <Input
                  type="number"
                  value={serviceForm.personnel}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, personnel: parseInt(e.target.value) || 0 }))}
                  placeholder="Number of personnel"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>Cancel</Button>
            <Button onClick={editingItem ? handleUpdateService : handleAddService} className="bg-teal-600 hover:bg-teal-700">
              {editingItem ? 'Update' : 'Add Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CCTV Dialog */}
      <Dialog open={cctvDialogOpen} onOpenChange={setCctvDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New CCTV Camera</DialogTitle>
            <DialogDescription>
              Add a new camera to the surveillance network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Camera Name</Label>
              <Input
                value={cctvForm.name}
                onChange={(e) => setCctvForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Main Street Junction"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={cctvForm.location}
                onChange={(e) => setCctvForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Camera location"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={cctvForm.status} onValueChange={(v) => setCctvForm(prev => ({ ...prev, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCctvDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCCTV} className="bg-teal-600 hover:bg-teal-700">Add Camera</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
