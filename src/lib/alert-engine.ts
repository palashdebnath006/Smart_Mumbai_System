/**
 * SmartMumbai Alert Engine
 * Transforms real-time monitoring data into automated actions and interventions.
 * This is the "solution" layer — not just showing data, but acting on it.
 */

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'resolved';
export type AlertModule = 'traffic' | 'environment' | 'water' | 'energy' | 'waste' | 'safety';

export interface SmartAlert {
  id: string;
  module: AlertModule;
  severity: AlertSeverity;
  title: string;
  description: string;
  location: string;
  timestamp: Date;
  isActionable: boolean;
  action?: {
    label: string;
    type: 'dispatch' | 'signal' | 'notify' | 'reroute' | 'shutdown' | 'schedule';
    payload?: Record<string, unknown>;
  };
  autoResolvesAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface DispatchOrder {
  id: string;
  alertId: string;
  type: 'bmc_crew' | 'traffic_police' | 'fire_brigade' | 'ambulance' | 'power_team' | 'swm_truck';
  unit: string;
  destination: string;
  dispatchedAt: Date;
  eta: number; // minutes
  status: 'dispatched' | 'en_route' | 'on_site' | 'resolved';
}

// ─── Alert Generation Rules ───────────────────────────────────────────────────

export function generateTrafficAlerts(roads: Array<{
  name: string; location: string; congestionLevel: string;
  currentSpeed: number; vehicleCount: number;
}>): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const now = new Date();

  roads.forEach(road => {
    if (road.congestionLevel === 'severe' || road.currentSpeed < 10) {
      alerts.push({
        id: `traffic-severe-${road.name}-${Date.now()}`,
        module: 'traffic',
        severity: 'critical',
        title: 'Severe Congestion Detected',
        description: `${road.name} is at near standstill (${road.currentSpeed} km/h). ${road.vehicleCount} vehicles queued. Signal optimization and diversion required.`,
        location: road.location,
        timestamp: now,
        isActionable: true,
        action: {
          label: 'Optimize Signals + Divert Traffic',
          type: 'signal',
          payload: { road: road.name, action: 'extend_green', divert: true },
        },
      });
    } else if (road.congestionLevel === 'high' || road.currentSpeed < 20) {
      alerts.push({
        id: `traffic-high-${road.name}-${Date.now()}`,
        module: 'traffic',
        severity: 'high',
        title: 'Heavy Traffic — Signal Adjustment Suggested',
        description: `${road.name} is heavily congested (${road.currentSpeed} km/h). Extending green phase by 30s recommended.`,
        location: road.location,
        timestamp: now,
        isActionable: true,
        action: {
          label: 'Adjust Signal Timing',
          type: 'signal',
          payload: { road: road.name, extendGreen: 30 },
        },
      });
    }
  });

  return alerts;
}

export function generateEnvironmentAlerts(aqi: number, pm25: number, no2: number): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const now = new Date();

  if (aqi > 200) {
    alerts.push({
      id: `env-aqi-critical-${Date.now()}`,
      module: 'environment',
      severity: 'critical',
      title: 'HAZARDOUS Air Quality — Bandra',
      description: `AQI has reached ${aqi} (Very Unhealthy). PM2.5 at ${pm25.toFixed(1)} µg/m³. Immediate public advisory required. Schools and outdoor events must be suspended.`,
      location: 'Bandra, H-West Ward',
      timestamp: now,
      isActionable: true,
      action: {
        label: 'Issue Public Health Advisory',
        type: 'notify',
        payload: { aqi, channels: ['SMS', 'Twitter', 'Municipal App'] },
      },
    });
  } else if (aqi > 150) {
    alerts.push({
      id: `env-aqi-high-${Date.now()}`,
      module: 'environment',
      severity: 'high',
      title: 'Unhealthy Air Quality Alert',
      description: `AQI at ${aqi} (Unhealthy). Sensitive groups (children, elderly, respiratory patients) should avoid outdoor activity in Bandra.`,
      location: 'Bandra, H-West Ward',
      timestamp: now,
      isActionable: true,
      action: {
        label: 'Send Health Advisory SMS',
        type: 'notify',
        payload: { aqi, sensitiveGroupsOnly: true },
      },
    });
  } else if (aqi > 100) {
    alerts.push({
      id: `env-aqi-medium-${Date.now()}`,
      module: 'environment',
      severity: 'medium',
      title: 'Moderate AQI — Monitor Situation',
      description: `AQI is ${aqi}. PM2.5 at ${pm25.toFixed(1)} µg/m³ — above safe limit of 60 µg/m³. Notify Bandra ward office.`,
      location: 'Bandra, H-West Ward',
      timestamp: now,
      isActionable: true,
      action: {
        label: 'Notify Bandra Ward Officer',
        type: 'notify',
        payload: { aqi },
      },
    });
  }

  if (no2 > 200) {
    alerts.push({
      id: `env-no2-${Date.now()}`,
      module: 'environment',
      severity: 'high',
      title: 'High NO₂ — Possible Industrial Source',
      description: `Nitrogen Dioxide at ${no2.toFixed(0)} µg/m³ exceeds WHO limit of 200 µg/m³. Investigate and restrict suspected industrial emission source.`,
      location: 'Bandra Industrial Zone',
      timestamp: now,
      isActionable: true,
      action: {
        label: 'Issue Industry Restriction Notice',
        type: 'notify',
        payload: { pollutant: 'NO2', value: no2 },
      },
    });
  }

  return alerts;
}

export function generateWaterAlerts(reservoirLevels: Array<{
  name: string; fillPercent: number; location: string;
}>, consumptionSpike: boolean): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const now = new Date();

  reservoirLevels.forEach(r => {
    if (r.fillPercent < 20) {
      alerts.push({
        id: `water-critical-${r.name}-${Date.now()}`,
        module: 'water',
        severity: 'critical',
        title: `${r.name} Reservoir Below 20%`,
        description: `${r.name} (${r.location}) is at only ${r.fillPercent.toFixed(1)}% capacity. Activate emergency rationing protocol for dependent wards. Contact Irrigation Dept.`,
        location: r.location,
        timestamp: now,
        isActionable: true,
        action: {
          label: 'Activate Water Rationing Protocol',
          type: 'schedule',
          payload: { reservoir: r.name, ration: true, alertDepts: ['BMC Water', 'IrrigationDept'] },
        },
      });
    } else if (r.fillPercent < 35) {
      alerts.push({
        id: `water-low-${r.name}-${Date.now()}`,
        module: 'water',
        severity: 'high',
        title: `${r.name} Reservoir Low`,
        description: `${r.name} at ${r.fillPercent.toFixed(1)}%. Reduce non-essential supply to commercial zones. Schedule tanker supply to vulnerable areas.`,
        location: r.location,
        timestamp: now,
        isActionable: true,
        action: {
          label: 'Schedule Tanker Supply',
          type: 'dispatch',
          payload: { reservoir: r.name, tankers: 3 },
        },
      });
    }
  });

  if (consumptionSpike) {
    alerts.push({
      id: `water-leak-${Date.now()}`,
      module: 'water',
      severity: 'critical',
      title: 'Anomalous Water Consumption — Possible Pipe Burst',
      description: 'Consumption spike of >25% detected in Bandra East zone. Pressure drop also recorded. Suspected main pipe leak. Dispatch BMC pipe repair crew immediately.',
      location: 'Bandra East Zone',
      timestamp: now,
      isActionable: true,
      action: {
        label: 'Dispatch BMC Pipe Repair Crew',
        type: 'dispatch',
        payload: { unit: 'BMC-W-CREW-04', destination: 'Bandra East Pipe Zn-3' },
      },
    });
  }

  return alerts;
}

export function generateEnergyAlerts(loadPercent: number, currentLoad: number, capacity: number): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const now = new Date();

  if (loadPercent > 95) {
    alerts.push({
      id: `energy-critical-${Date.now()}`,
      module: 'energy',
      severity: 'critical',
      title: 'Grid Near Overload — Immediate Action Required',
      description: `Bandra grid at ${loadPercent.toFixed(1)}% capacity (${currentLoad}/${capacity} MW). Risk of outage in 15 minutes. Initiate emergency load shedding in non-essential zones.`,
      location: 'Bandra H-West Grid Zone',
      timestamp: now,
      isActionable: true,
      action: {
        label: 'Initiate Load Shedding Schedule',
        type: 'shutdown',
        payload: { zones: ['Commercial Zone A', 'Industrial Belt'], duration: 30 },
      },
    });
  } else if (loadPercent > 85) {
    alerts.push({
      id: `energy-high-${Date.now()}`,
      module: 'energy',
      severity: 'high',
      title: 'High Grid Load — Demand Response Needed',
      description: `Grid at ${loadPercent.toFixed(1)}%. Activate demand response: request large commercial consumers to reduce load by 10%. Approaching peak hour.`,
      location: 'Bandra H-West Grid Zone',
      timestamp: now,
      isActionable: true,
      action: {
        label: 'Send Demand Response Request',
        type: 'notify',
        payload: { targets: 'large_commercial', reduction: 10 },
      },
    });
  }

  return alerts;
}

export function generateWasteAlerts(bins: Array<{
  zone: string; fillLevel: number; location: string;
}>): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const now = new Date();
  const criticalBins = bins.filter(b => b.fillLevel > 90);
  const highBins = bins.filter(b => b.fillLevel > 75 && b.fillLevel <= 90);

  if (criticalBins.length > 0) {
    alerts.push({
      id: `waste-overflow-${Date.now()}`,
      module: 'waste',
      severity: 'critical',
      title: `${criticalBins.length} Bins at Overflow Risk`,
      description: `Bins at ${criticalBins.map(b => b.zone).join(', ')} are above 90% capacity. Overflow will cause public health hazard. Dispatch collection crew immediately.`,
      location: criticalBins[0].location,
      timestamp: now,
      isActionable: true,
      action: {
        label: 'Dispatch Collection Truck',
        type: 'dispatch',
        payload: { bins: criticalBins.map(b => b.zone), truck: 'BMC-HW-T01' },
      },
    });
  }

  if (highBins.length >= 3) {
    alerts.push({
      id: `waste-high-${Date.now()}`,
      module: 'waste',
      severity: 'medium',
      title: 'Multiple Bins Above 75% — Schedule Collection',
      description: `${highBins.length} bins in Bandra zone are above 75%. Optimize truck routing to collect these on next round.`,
      location: 'Bandra H-West Ward',
      timestamp: now,
      isActionable: true,
      action: {
        label: 'Optimize Truck Route',
        type: 'reroute',
        payload: { bins: highBins.map(b => b.zone) },
      },
    });
  }

  return alerts;
}

// ─── Action Executor ──────────────────────────────────────────────────────────

export function executeAction(alert: SmartAlert): {
  success: boolean;
  message: string;
  dispatch?: DispatchOrder;
} {
  const action = alert.action;
  if (!action) return { success: false, message: 'No action defined.' };

  const dispatchUnits: Record<string, string> = {
    dispatch: 'BMC Field Unit',
    signal: 'Traffic Control System',
    notify: 'Municipal Communication Hub',
    reroute: 'Navigation & Signage System',
    shutdown: 'Energy Management System',
    schedule: 'Supply Chain Management',
  };

  if (action.type === 'dispatch') {
    const order: DispatchOrder = {
      id: `DO-${Date.now()}`,
      alertId: alert.id,
      type: alert.module === 'water' ? 'bmc_crew'
        : alert.module === 'waste' ? 'swm_truck'
        : alert.module === 'traffic' ? 'traffic_police'
        : 'bmc_crew',
      unit: (action.payload?.unit as string) || dispatchUnits[action.type],
      destination: (action.payload?.destination as string) || alert.location,
      dispatchedAt: new Date(),
      eta: Math.round(5 + Math.random() * 10),
      status: 'dispatched',
    };
    return {
      success: true,
      message: `${order.unit} dispatched to ${order.destination}. ETA: ${order.eta} minutes.`,
      dispatch: order,
    };
  }

  const messages: Record<string, string> = {
    signal: `Signal timing updated for ${(action.payload?.road as string) || alert.location}. Traffic flow optimization active.`,
    notify: `Advisory sent to ${Array.isArray(action.payload?.channels) ? action.payload.channels.join(', ') : 'all channels'}.`,
    reroute: `Traffic diversion activated. Navigation apps will show alternate routes in ~2 minutes.`,
    shutdown: `Load shedding initiated for ${(action.payload?.zones as string[])?.join(', ') || 'selected zones'}. Duration: ${action.payload?.duration || 30} minutes.`,
    schedule: `Protocol activated. Relevant departments have been notified.`,
  };

  return {
    success: true,
    message: messages[action.type] || 'Action executed successfully.',
  };
}

// ─── Severity Config ──────────────────────────────────────────────────────────

export const SEVERITY_CONFIG = {
  critical: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'destructive' as const, icon: '🔴' },
  high:     { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', badge: 'destructive' as const, icon: '🟠' },
  medium:   { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', badge: 'outline' as const, icon: '🟡' },
  low:      { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', badge: 'secondary' as const, icon: '🔵' },
  resolved: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30', badge: 'outline' as const, icon: '✅' },
};

export const MODULE_ICONS: Record<AlertModule, string> = {
  traffic: '🚦',
  environment: '🌿',
  water: '💧',
  energy: '⚡',
  waste: '♻️',
  safety: '🛡️',
};
