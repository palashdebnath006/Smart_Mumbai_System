'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store';
import {
  AlertTriangle, CheckCircle, Zap, Shield, Bell, BellOff,
  RefreshCw, Clock, MapPin, ChevronDown, ChevronUp, Radio,
  ActivitySquare, Filter, MessageSquare, User as UserIcon,
  ArrowRight, Send, Loader2, Inbox,
} from 'lucide-react';
import {
  SmartAlert, AlertModule, DispatchOrder, SEVERITY_CONFIG, MODULE_ICONS,
  generateTrafficAlerts, generateEnvironmentAlerts, generateWaterAlerts,
  generateEnergyAlerts, generateWasteAlerts, executeAction,
} from '@/lib/alert-engine';
import { fetchAirQuality, fetchReservoirData, fetchEnergyData, fetchWasteData } from '@/lib/api-services';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ReportNote {
  id: string;
  authorName: string;
  authorRole: string;
  department: string | null;
  message: string;
  createdAt: string;
}

interface CitizenReportData {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string | null;
  status: string;
  priority: string;
  assignedDepts: string | null;
  resolvedDepts: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: { id: string; name: string; email: string; role: string } | null;
  notes: ReportNote[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_DEPARTMENTS = [
  { id: 'water', label: 'Water Dept', icon: '💧', color: 'bg-blue-500' },
  { id: 'fire', label: 'Fire Dept', icon: '🚒', color: 'bg-red-500' },
  { id: 'traffic', label: 'Traffic Police', icon: '🚦', color: 'bg-orange-500' },
  { id: 'electricity', label: 'Power Dept', icon: '⚡', color: 'bg-yellow-500' },
  { id: 'waste', label: 'Waste / SWM', icon: '♻️', color: 'bg-green-500' },
  { id: 'safety', label: 'Public Safety', icon: '🛡️', color: 'bg-purple-500' },
  { id: 'infrastructure', label: 'Infrastructure', icon: '🏗️', color: 'bg-gray-500' },
  { id: 'health', label: 'Health Dept', icon: '🏥', color: 'bg-pink-500' },
];

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-gray-500', bg: 'bg-gray-500/10' },
  normal: { label: 'Normal', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  high: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  urgent: { label: 'Urgent', color: 'text-red-500', bg: 'bg-red-500/10' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  submitted: { label: 'New', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  reviewed: { label: 'Reviewed', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  in_progress: { label: 'In Progress', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  resolved: { label: 'Resolved', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
};

const categoryIcons: Record<string, string> = {
  infrastructure: '🏗️', water: '💧', waste: '♻️', electricity: '⚡',
  safety: '🛡️', complaint: '📋', other: '📌',
};

// ─── Synthetic current-state data for generating alerts ──────────────────────
function generateCurrentState() {
  const hour = new Date().getHours();
  const isPeak = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 21);
  const roads = [
    { name: 'Bandra-Worli Sea Link', location: 'Sea Link Approach', congestionLevel: isPeak ? 'severe' : 'medium', currentSpeed: isPeak ? 8 : 35, vehicleCount: isPeak ? 4800 : 1200 },
    { name: 'S.V. Road, Bandra', location: 'S.V. Road', congestionLevel: isPeak ? 'high' : 'low', currentSpeed: isPeak ? 15 : 38, vehicleCount: isPeak ? 3200 : 900 },
    { name: 'Linking Road', location: 'Linking Road', congestionLevel: 'medium', currentSpeed: 22, vehicleCount: 1800 },
  ];
  const energyData = fetchEnergyData();
  const energyLoadPercent = (energyData.currentLoad / energyData.capacity) * 100;
  const bins = [
    { zone: 'Bandra Station', location: 'Bandra Station Area', fillLevel: Math.min(100, Math.round((hour / 18) * 95 + Math.random() * 10)) },
    { zone: 'Linking Road', location: 'Linking Road Market', fillLevel: Math.min(100, Math.round((hour / 18) * 82 + Math.random() * 15)) },
    { zone: 'Hill Road', location: 'Hill Road', fillLevel: Math.min(100, Math.round((hour / 18) * 70 + Math.random() * 10)) },
  ];
  const reservoirs = fetchReservoirData().map(r => ({ name: r.name, location: r.location, fillPercent: (r.currentLevel / r.capacity) * 100 }));
  return { roads, energyLoadPercent, energyCurrentLoad: energyData.currentLoad, energyCapacity: energyData.capacity, bins, reservoirs };
}

// ─── AlertCard ────────────────────────────────────────────────────────────────
function AlertCard({ alert, onDispatch, onResolve }: { alert: SmartAlert; onDispatch: (a: SmartAlert) => void; onResolve: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[alert.severity];
  const icon = MODULE_ICONS[alert.module];
  return (
    <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={`rounded-lg border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="text-xl flex-shrink-0 mt-0.5">{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-bold ${cfg.color}`}>{alert.title}</span>
              <Badge variant={cfg.badge} className="text-xs capitalize">{alert.severity}</Badge>
              <Badge variant="outline" className="text-xs capitalize">{alert.module}</Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" /><span>{alert.location}</span><span className="mx-1">•</span><Clock className="w-3 h-3" /><span>{alert.timestamp.toLocaleTimeString('en-IN')}</span>
            </div>
          </div>
        </div>
        <button onClick={() => setExpanded(v => !v)} className="flex-shrink-0 text-muted-foreground">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="text-sm text-muted-foreground mt-3 mb-3 leading-relaxed">{alert.description}</p>
            <div className="flex gap-2 flex-wrap">
              {alert.isActionable && alert.action && alert.severity !== 'resolved' && (
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => onDispatch(alert)}>
                  <Radio className="w-3 h-3 mr-1" />{alert.action.label}
                </Button>
              )}
              {alert.severity !== 'resolved' && (
                <Button size="sm" variant="outline" onClick={() => onResolve(alert.id)}>
                  <CheckCircle className="w-3 h-3 mr-1" />Mark Resolved
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Dispatch Log ─────────────────────────────────────────────────────────────
function DispatchLog({ orders }: { orders: DispatchOrder[] }) {
  const typeLabels: Record<DispatchOrder['type'], string> = {
    bmc_crew: 'BMC Crew', traffic_police: 'Traffic Police', fire_brigade: 'Fire Brigade',
    ambulance: 'Ambulance', power_team: 'Power Team', swm_truck: 'SWM Truck',
  };
  return (
    <div className="space-y-2">
      {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No dispatches yet.</p>}
      {orders.map(order => (
        <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
          <div>
            <p className="text-sm font-medium">{typeLabels[order.type]} → {order.destination}</p>
            <p className="text-xs text-muted-foreground">Unit: {order.unit} • {order.dispatchedAt.toLocaleTimeString('en-IN')}</p>
          </div>
          <div className="text-right">
            <Badge variant={order.status === 'on_site' ? 'default' : 'secondary'} className="text-xs">{order.status.replace('_', ' ')}</Badge>
            <p className="text-xs text-muted-foreground mt-1">ETA {order.eta} min</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Citizen Reports Panel (Inter-Department Coordination) ────────────────────
function CitizenReportsPanel() {
  const { token } = useAuthStore();
  const [reports, setReports] = useState<CitizenReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>('normal');
  const [noteReportId, setNoteReportId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteDept, setNoteDept] = useState('admin');
  const [sendingNote, setSendingNote] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all' ? '/api/reports' : `/api/reports?status=${statusFilter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setReports(data.data || []);
    } catch {} finally { setLoading(false); }
  }, [token, statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleAssignDepts = async (reportId: string) => {
    if (selectedDepts.length === 0) return;
    setUpdatingId(reportId);
    try {
      await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'assign-departments', id: reportId, departments: selectedDepts, priority: selectedPriority }) });
      setAssigningId(null); setSelectedDepts([]); setSelectedPriority('normal'); fetchReports();
    } catch {} finally { setUpdatingId(null); }
  };

  const handleDeptResolve = async (reportId: string, dept: string) => {
    setUpdatingId(reportId);
    try {
      await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'dept-resolve', id: reportId, department: dept }) });
      fetchReports();
    } catch {} finally { setUpdatingId(null); }
  };

  const handleSendNote = async (reportId: string) => {
    if (!noteText.trim()) return;
    setSendingNote(true);
    try {
      await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'add-note', id: reportId, message: noteText.trim(), department: noteDept }) });
      setNoteText(''); fetchReports();
    } catch {} finally { setSendingNote(false); }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'update-status', id, status: newStatus }) });
      fetchReports();
    } catch {} finally { setUpdatingId(null); }
  };

  const newCount = reports.filter(r => r.status === 'submitted').length;
  const inProgressCount = reports.filter(r => r.status === 'in_progress').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'New Reports', value: newCount, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
          { label: 'In Progress', value: inProgressCount, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Resolved', value: resolvedCount, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'Total', value: reports.length, color: 'text-teal-500', bg: 'bg-teal-500/10 border-teal-500/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-lg border p-3 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Filter className="w-3 h-3" /> Status:</div>
        {['all', 'submitted', 'in_progress', 'resolved'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${statusFilter === s ? 'bg-teal-600 text-white border-teal-600' : 'border-muted-foreground/30 text-muted-foreground hover:border-teal-500'}`}>
            {s === 'all' ? 'All' : (statusConfig[s]?.label || s)}
          </button>
        ))}
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading}>
          <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading citizen reports...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><Inbox className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="font-medium">No citizen reports</p><p className="text-sm">Reports submitted by citizens will appear here.</p></div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {reports.map(report => {
              const sc = statusConfig[report.status] || statusConfig.submitted;
              const pc = priorityConfig[report.priority] || priorityConfig.normal;
              const isExpanded = expandedId === report.id;
              const isUpdating = updatingId === report.id;
              const catIcon = categoryIcons[report.type] || '📋';
              const assignedArr = report.assignedDepts ? report.assignedDepts.split(',').filter(Boolean) : [];
              const resolvedArr = report.resolvedDepts ? report.resolvedDepts.split(',').filter(Boolean) : [];
              const isAssigning = assigningId === report.id;
              const isNotingThis = noteReportId === report.id;
              const deptProgress = assignedArr.length > 0 ? (resolvedArr.length / assignedArr.length) * 100 : 0;

              return (
                <motion.div key={report.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className={`rounded-lg border p-4 ${sc.bg} ${sc.border} transition-colors`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="text-xl flex-shrink-0 mt-0.5">{catIcon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-bold ${sc.color}`}>{report.title}</span>
                          <Badge variant="secondary" className="text-xs capitalize">{sc.label}</Badge>
                          <Badge variant="outline" className={`text-xs capitalize ${pc.color}`}>{pc.label}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                          {report.reporter && <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" />{report.reporter.name}</span>}
                          {report.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{report.location}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(report.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                        {assignedArr.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="text-[10px] text-muted-foreground mr-0.5">Assigned:</span>
                            {assignedArr.map(d => {
                              const dept = ALL_DEPARTMENTS.find(dep => dep.id === d);
                              const isDeptDone = resolvedArr.includes(d);
                              return (
                                <span key={d} className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${isDeptDone ? 'bg-green-500/20 border-green-500/40 text-green-600 dark:text-green-400 line-through' : 'bg-muted/40 border-muted-foreground/20 text-foreground'}`}>
                                  {dept?.icon} {dept?.label || d} {isDeptDone && <CheckCircle className="w-3 h-3 text-green-500" />}
                                </span>
                              );
                            })}
                            <span className="text-[10px] text-muted-foreground ml-1">({resolvedArr.length}/{assignedArr.length} done)</span>
                          </div>
                        )}
                        {assignedArr.length > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={deptProgress} className="h-1.5 flex-1 max-w-48" />
                            <span className={`text-[10px] font-medium ${deptProgress === 100 ? 'text-green-500' : 'text-muted-foreground'}`}>{Math.round(deptProgress)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={() => setExpandedId(isExpanded ? null : report.id)} className="flex-shrink-0 text-muted-foreground">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-4 p-3 rounded-lg bg-background/60 border">
                          <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Citizen's Message</p>
                          <p className="text-sm text-foreground leading-relaxed">{report.description}</p>
                        </div>

                        {report.status !== 'resolved' && (
                          <div className="mt-4">
                            {!isAssigning ? (
                              <div className="flex gap-2 flex-wrap items-center">
                                <Button size="sm" variant="outline" onClick={() => { setAssigningId(report.id); setSelectedDepts(assignedArr); }}>
                                  {assignedArr.length > 0 ? 'Reassign Departments' : '🏛️ Assign Departments'}
                                </Button>
                                {report.status === 'submitted' && (
                                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-500/30" onClick={() => updateStatus(report.id, 'reviewed')} disabled={isUpdating}>
                                    <ArrowRight className="w-3 h-3 mr-1" /> Mark Reviewed
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg border bg-background/60 space-y-3">
                                <p className="text-xs font-semibold text-muted-foreground">Select departments to handle this report:</p>
                                <div className="flex flex-wrap gap-2">
                                  {ALL_DEPARTMENTS.map(dept => {
                                    const isSelected = selectedDepts.includes(dept.id);
                                    return (
                                      <button key={dept.id} onClick={() => setSelectedDepts(prev => isSelected ? prev.filter(d => d !== dept.id) : [...prev, dept.id])}
                                        className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${isSelected ? `${dept.color} text-white border-transparent` : 'bg-muted/30 text-foreground border-muted-foreground/20 hover:border-teal-500'}`}>
                                        {dept.icon} {dept.label}
                                      </button>
                                    );
                                  })}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-muted-foreground">Priority:</span>
                                  {['low', 'normal', 'high', 'urgent'].map(p => (
                                    <button key={p} onClick={() => setSelectedPriority(p)}
                                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors capitalize ${selectedPriority === p ? `${priorityConfig[p].bg} ${priorityConfig[p].color} border-current` : 'border-muted-foreground/20 text-muted-foreground'}`}>
                                      {p}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={selectedDepts.length === 0 || isUpdating} onClick={() => handleAssignDepts(report.id)}>
                                    {isUpdating ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Send className="w-3 h-3 mr-1" />}
                                    Assign {selectedDepts.length} Dept{selectedDepts.length !== 1 ? 's' : ''}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => { setAssigningId(null); setSelectedDepts([]); }}>Cancel</Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {assignedArr.length > 0 && report.status !== 'resolved' && (
                          <div className="mt-4 p-3 rounded-lg border bg-background/60 space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Department Resolution Status</p>
                            <div className="grid gap-2">
                              {assignedArr.map(d => {
                                const dept = ALL_DEPARTMENTS.find(dep => dep.id === d);
                                const isDone = resolvedArr.includes(d);
                                return (
                                  <div key={d} className={`flex items-center justify-between p-2 rounded-lg border ${isDone ? 'bg-green-500/10 border-green-500/20' : 'bg-muted/20'}`}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{dept?.icon || '📋'}</span>
                                      <span className={`text-sm font-medium ${isDone ? 'text-green-600 dark:text-green-400 line-through' : 'text-foreground'}`}>{dept?.label || d}</span>
                                      {isDone && <Badge variant="default" className="text-[10px] h-4 bg-green-600">Done</Badge>}
                                    </div>
                                    {!isDone && (
                                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs h-7" disabled={isUpdating} onClick={() => handleDeptResolve(report.id, d)}>
                                        {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />} Mark Done
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 p-3 rounded-lg border bg-background/60 space-y-3">
                          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Inter-Department Communication ({report.notes?.length || 0})</p>
                          {report.notes && report.notes.length > 0 ? (
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                              {report.notes.map(note => {
                                const nd = ALL_DEPARTMENTS.find(d => d.id === note.department);
                                return (
                                  <div key={note.id} className="flex gap-2.5">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${note.department === 'admin' ? 'bg-red-500/20' : 'bg-teal-500/20'}`}>
                                      {nd?.icon || (note.authorRole === 'admin' ? '👑' : '📋')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-semibold text-foreground">{note.authorName}</span>
                                        {note.department && <Badge variant="outline" className="text-[10px] h-4 capitalize">{nd?.label || note.department}</Badge>}
                                        <span className="text-[10px] text-muted-foreground">{new Date(note.createdAt).toLocaleString('en-IN')}</span>
                                      </div>
                                      <p className="text-sm text-foreground/80 mt-0.5 leading-relaxed">{note.message}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground text-center py-2">No messages yet. Start the conversation between departments.</p>
                          )}
                          {report.status !== 'resolved' && (
                            <div className="pt-2 border-t space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] text-muted-foreground">Posting as:</span>
                                <select value={isNotingThis ? noteDept : 'admin'} onChange={(e) => { setNoteReportId(report.id); setNoteDept(e.target.value); }}
                                  className="text-xs h-7 rounded border border-input bg-background px-2 focus:ring-1 focus:ring-ring">
                                  <option value="admin">Admin</option>
                                  {assignedArr.map(d => { const dept = ALL_DEPARTMENTS.find(dep => dep.id === d); return <option key={d} value={d}>{dept?.label || d}</option>; })}
                                </select>
                              </div>
                              <Textarea placeholder="Type a message for inter-department coordination..." className="min-h-[60px] text-sm"
                                value={isNotingThis ? noteText : ''} onChange={(e) => { setNoteReportId(report.id); setNoteText(e.target.value); }} onFocus={() => setNoteReportId(report.id)} />
                              <div className="flex justify-end">
                                <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={sendingNote || !(isNotingThis && noteText.trim())} onClick={() => handleSendNote(report.id)}>
                                  {sendingNote ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Send className="w-3 h-3 mr-1" />} Send Message
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {report.reporter && (
                          <div className="mt-3 pt-3 border-t flex items-center gap-3 text-xs text-muted-foreground">
                            <UserIcon className="w-3 h-3" />
                            <span>Reported by: <strong className="text-foreground font-medium">{report.reporter.name}</strong> ({report.reporter.email})</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ─── Main ActionCenter ────────────────────────────────────────────────────────
export default function ActionCenter() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [dispatches, setDispatches] = useState<DispatchOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [filterModule, setFilterModule] = useState<AlertModule | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high'>('all');
  const [muted, setMuted] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const state = generateCurrentState();
      const newAlerts: SmartAlert[] = [];
      newAlerts.push(...generateTrafficAlerts(state.roads));
      try {
        const aq = await fetchAirQuality();
        newAlerts.push(...generateEnvironmentAlerts(aq.aqi, aq.pm25, aq.no2));
      } catch {
        const simAQI = 90 + Math.round(Math.random() * 60);
        newAlerts.push(...generateEnvironmentAlerts(simAQI, simAQI * 0.35, simAQI * 0.15));
      }
      newAlerts.push(...generateWaterAlerts(state.reservoirs, Math.random() < 0.2));
      newAlerts.push(...generateEnergyAlerts(state.energyLoadPercent, state.energyCurrentLoad, state.energyCapacity));
      newAlerts.push(...generateWasteAlerts(state.bins));
      const sorted = newAlerts.sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3, resolved: 4 };
        return order[a.severity] - order[b.severity];
      });
      setAlerts(sorted);
      setLastRefresh(new Date());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); const i = setInterval(refresh, 30000); return () => clearInterval(i); }, [refresh]);

  const handleDispatch = (alert: SmartAlert) => {
    const result = executeAction(alert);
    if (result.success) {
      if (result.dispatch) setDispatches(prev => [result.dispatch!, ...prev]);
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, severity: 'resolved' as const, resolvedAt: new Date(), resolvedBy: 'Action Center' } : a));
    }
  };

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, severity: 'resolved' as const, resolvedAt: new Date(), resolvedBy: 'Manual' } : a));
  };

  const filtered = alerts.filter(a => {
    const moduleOk = filterModule === 'all' || a.module === filterModule;
    const severityOk = filterSeverity === 'all' || a.severity === filterSeverity;
    return moduleOk && severityOk;
  });

  const critical = alerts.filter(a => a.severity === 'critical').length;
  const high = alerts.filter(a => a.severity === 'high').length;
  const resolved = alerts.filter(a => a.severity === 'resolved').length;
  const active = alerts.filter(a => a.severity !== 'resolved').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${critical > 0 ? 'bg-red-400' : 'bg-green-400'}`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${critical > 0 ? 'bg-red-500' : 'bg-green-500'}`} />
          </span>
          <h2 className="text-lg font-bold">Smart Action Center</h2>
          <Badge variant="outline" className="text-xs text-muted-foreground">Last updated {lastRefresh.toLocaleTimeString('en-IN')}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setMuted(v => !v)}>
            {muted ? <BellOff className="w-3 h-3 mr-1 text-gray-400" /> : <Bell className="w-3 h-3 mr-1 text-yellow-500" />}
            {muted ? 'Unmute' : 'Mute'}
          </Button>
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Alerts', value: active, color: 'text-orange-500', icon: <AlertTriangle className="w-5 h-5" /> },
          { label: 'Critical', value: critical, color: 'text-red-500', icon: <Zap className="w-5 h-5" /> },
          { label: 'High Priority', value: high, color: 'text-orange-400', icon: <ActivitySquare className="w-5 h-5" /> },
          { label: 'Resolved Today', value: resolved + dispatches.length, color: 'text-green-500', icon: <CheckCircle className="w-5 h-5" /> },
        ].map(s => (
          <Card key={s.label}><CardContent className="pt-4 pb-4"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></div><div className={s.color}>{s.icon}</div></div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="alerts">
        <TabsList>
          <TabsTrigger value="alerts"><Bell className="w-3.5 h-3.5 mr-1.5" />Alerts & Actions{active > 0 && <Badge variant="destructive" className="ml-2 text-[10px] h-4 px-1">{active}</Badge>}</TabsTrigger>
          <TabsTrigger value="citizen-reports"><MessageSquare className="w-3.5 h-3.5 mr-1.5" />Citizen Reports</TabsTrigger>
          <TabsTrigger value="dispatch"><Radio className="w-3.5 h-3.5 mr-1.5" />Dispatch Log{dispatches.length > 0 && <Badge variant="outline" className="ml-2 text-[10px] h-4 px-1">{dispatches.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="prediction"><ActivitySquare className="w-3.5 h-3.5 mr-1.5" />Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4 mt-4">
          <div className="flex gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Filter className="w-3 h-3" /> Filter:</div>
            {(['all', 'traffic', 'environment', 'water', 'energy', 'waste', 'safety'] as const).map(m => (
              <button key={m} onClick={() => setFilterModule(m as AlertModule | 'all')}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${filterModule === m ? 'bg-teal-600 text-white border-teal-600' : 'border-muted-foreground/30 text-muted-foreground hover:border-teal-500'}`}>
                {m === 'all' ? 'All Modules' : `${MODULE_ICONS[m as AlertModule]} ${m.charAt(0).toUpperCase() + m.slice(1)}`}
              </button>
            ))}
            <div className="h-4 w-px bg-border mx-1" />
            {(['all', 'critical', 'high'] as const).map(s => (
              <button key={s} onClick={() => setFilterSeverity(s)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${filterSeverity === s ? 'bg-red-600 text-white border-red-600' : 'border-muted-foreground/30 text-muted-foreground hover:border-red-500'}`}>
                {s === 'all' ? 'All Severity' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-500" /><p className="font-medium">All systems nominal</p><p className="text-sm">No active alerts</p>
                </motion.div>
              )}
              {filtered.map(alert => <AlertCard key={alert.id} alert={alert} onDispatch={handleDispatch} onResolve={handleResolve} />)}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="citizen-reports" className="mt-4"><CitizenReportsPanel /></TabsContent>

        <TabsContent value="dispatch" className="mt-4">
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Radio className="w-4 h-4 text-teal-500" />Active Dispatch Orders</CardTitle></CardHeader><CardContent><DispatchLog orders={dispatches} /></CardContent></Card>
        </TabsContent>

        <TabsContent value="prediction" className="mt-4"><PredictionPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Prediction Panel ─────────────────────────────────────────────────────────
function PredictionPanel() {
  const hour = new Date().getHours();
  const peakIn = hour < 8 ? 8 - hour : hour < 17 ? 17 - hour : 0;
  const predictions = [
    { icon: '🚦', module: 'Traffic', title: 'Evening Peak Surge', detail: peakIn > 0 ? `Severe congestion expected in ${peakIn}h. Pre-emptive signal optimization recommended.` : 'Peak hour in progress. Congestion expected to ease by 21:00.', confidence: 87, action: 'Pre-schedule Signal Optimization', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { icon: '💧', module: 'Water', title: 'Supply Shortfall — Pre-Monsoon', detail: 'Vihar & Tulsi reservoirs projected to hit <20% by early May. Recommend activating conservation advisory.', confidence: 74, action: 'Issue Conservation Advisory', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: '⚡', module: 'Energy', title: 'Grid Peak Load Tonight', detail: 'Grid load will cross 92% capacity at 19:30–21:00. Prepare demand response protocol.', confidence: 91, action: 'Pre-notify Large Consumers', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { icon: '♻️', module: 'Waste', title: 'Post-Weekend Overflow Risk', detail: 'Monday bin overflow likely at Bandra Station and Linking Road. Deploy extra truck at 05:30.', confidence: 82, action: 'Schedule Extra Collection', color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: '🌿', module: 'Environment', title: 'Rain + Pollution Suppression', detail: 'Rain in next 12h. AQI expected to drop 20–35%. Warnings can be lifted by 06:00 tomorrow.', confidence: 68, action: 'Pre-schedule Advisory Lift', color: 'text-teal-500', bg: 'bg-teal-500/10' },
  ];
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">AI-assisted predictions based on historical patterns, live sensor data, and Open-Meteo forecasts.</p>
      {predictions.map(p => (
        <Card key={p.title} className={`border ${p.bg} border-opacity-30`}>
          <CardContent className="pt-4">
            <div className="flex gap-3 flex-1">
              <span className="text-2xl">{p.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><span className={`font-semibold text-sm ${p.color}`}>{p.title}</span><Badge variant="outline" className="text-xs">{p.module}</Badge></div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{p.detail}</p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <Progress value={p.confidence} className="h-1.5 flex-1 max-w-32" />
                  <span className={`text-xs font-medium ${p.color}`}>{p.confidence}%</span>
                </div>
                <Button size="sm" variant="outline" className="text-xs"><Zap className="w-3 h-3 mr-1" />{p.action}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
