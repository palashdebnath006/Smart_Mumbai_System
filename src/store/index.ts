import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'officer' | 'citizen';
  avatar?: string;
  department?: string;
}

// Auth State
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      hasSeenOnboarding: false,
      
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      }),
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),
      setLoading: (isLoading) => set({ isLoading }),
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
    }),
    {
      name: 'smart-city-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
    }
  )
);

// Dashboard State
interface DashboardState {
  activeModule: string;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  realTimeUpdates: boolean;
  
  // Actions
  setActiveModule: (module: string) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  toggleRealTimeUpdates: () => void;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      activeModule: 'overview',
      sidebarCollapsed: false,
      theme: 'light',
      notifications: [],
      realTimeUpdates: true,
      
      setActiveModule: (activeModule) => set({ activeModule }),
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),
      setTheme: (theme) => set({ theme }),
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications].slice(0, 50)
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      toggleRealTimeUpdates: () => set((state) => ({
        realTimeUpdates: !state.realTimeUpdates
      })),
    }),
    {
      name: 'smart-city-dashboard',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeModule: state.activeModule,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        realTimeUpdates: state.realTimeUpdates,
      }),
    }
  )
);

// Traffic Data Store
interface TrafficSensor {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  status: 'active' | 'maintenance' | 'offline';
  vehicleCount: number;
  avgSpeed: number;
  congestion: 'low' | 'medium' | 'high';
}

interface TrafficIncident {
  id: string;
  type: 'accident' | 'roadwork' | 'breakdown' | 'hazard';
  location: string;
  lat: number;
  lng: number;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
  status: 'active' | 'resolved';
  reportedAt: Date;
}

interface TrafficData {
  sensors: TrafficSensor[];
  incidents: TrafficIncident[];
  avgSpeed: number;
  totalVehicles: number;
  congestionLevel: 'low' | 'medium' | 'high';
}

interface TrafficState {
  data: TrafficData;
  isLoading: boolean;
  lastUpdate: Date | null;
  
  setData: (data: TrafficData) => void;
  setLoading: (loading: boolean) => void;
  setLastUpdate: (date: Date) => void;
}

export const useTrafficStore = create<TrafficState>((set) => ({
  data: {
    sensors: [],
    incidents: [],
    avgSpeed: 0,
    totalVehicles: 0,
    congestionLevel: 'low',
  },
  isLoading: false,
  lastUpdate: null,
  
  setData: (data) => set({ data }),
  setLoading: (isLoading) => set({ isLoading }),
  setLastUpdate: (lastUpdate) => set({ lastUpdate }),
}));

// Environmental Data Store
interface AQISensor {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  aqi: number;
  pm25: number;
  pm10: number;
  co2: number;
  level: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  rainfall: number;
}

interface EnvironmentalData {
  aqiSensors: AQISensor[];
  currentAQI: number;
  aqiLevel: string;
  currentWeather: WeatherData;
}

interface EnvironmentalState {
  data: EnvironmentalData;
  isLoading: boolean;
  lastUpdate: Date | null;
  
  setData: (data: EnvironmentalData) => void;
  setLoading: (loading: boolean) => void;
  setLastUpdate: (date: Date) => void;
}

export const useEnvironmentalStore = create<EnvironmentalState>((set) => ({
  data: {
    aqiSensors: [],
    currentAQI: 0,
    aqiLevel: 'good',
    currentWeather: {
      temperature: 0,
      humidity: 0,
      windSpeed: 0,
      windDirection: '',
      pressure: 0,
      rainfall: 0,
    },
  },
  isLoading: false,
  lastUpdate: null,
  
  setData: (data) => set({ data }),
  setLoading: (isLoading) => set({ isLoading }),
  setLastUpdate: (lastUpdate) => set({ lastUpdate }),
}));

// Water Data Store
interface WaterReservoir {
  id: string;
  name: string;
  location: string;
  capacity: number;
  currentLevel: number;
  percentage: number;
  status: 'normal' | 'low' | 'critical' | 'overflow';
}

interface WaterLeak {
  id: string;
  location: string;
  lat: number;
  lng: number;
  severity: 'minor' | 'moderate' | 'major';
  status: 'reported' | 'repairing' | 'fixed';
}

interface WaterData {
  reservoirs: WaterReservoir[];
  dailyConsumption: number;
  leaks: WaterLeak[];
  zoneUsage: { zone: string; consumption: number; type: string }[];
}

interface WaterState {
  data: WaterData;
  isLoading: boolean;
  lastUpdate: Date | null;
  
  setData: (data: WaterData) => void;
  setLoading: (loading: boolean) => void;
  setLastUpdate: (date: Date) => void;
}

export const useWaterStore = create<WaterState>((set) => ({
  data: {
    reservoirs: [],
    dailyConsumption: 0,
    leaks: [],
    zoneUsage: [],
  },
  isLoading: false,
  lastUpdate: null,
  
  setData: (data) => set({ data }),
  setLoading: (isLoading) => set({ isLoading }),
  setLastUpdate: (lastUpdate) => set({ lastUpdate }),
}));

// News Data Store
interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: 'government' | 'policy' | 'incident' | 'general';
  author?: string;
  imageUrl?: string;
  isPinned: boolean;
  publishedAt: Date;
}

interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  category: 'welfare' | 'infrastructure' | 'health' | 'education';
  status: 'active' | 'closed';
}

interface NewsData {
  news: NewsItem[];
  schemes: GovernmentScheme[];
}

interface NewsState {
  data: NewsData;
  isLoading: boolean;
  
  setData: (data: NewsData) => void;
  setLoading: (loading: boolean) => void;
}

export const useNewsStore = create<NewsState>((set) => ({
  data: {
    news: [],
    schemes: [],
  },
  isLoading: false,
  
  setData: (data) => set({ data }),
  setLoading: (isLoading) => set({ isLoading }),
}));

// Public Safety Store
interface SafetyIncident {
  id: string;
  type: 'fire' | 'crime' | 'medical' | 'natural_disaster' | 'other';
  title: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved';
  reportedAt: Date;
}

interface EmergencyService {
  id: string;
  name: string;
  type: 'police' | 'fire' | 'ambulance' | 'disaster_management';
  location: string;
  lat: number;
  lng: number;
  phone: string;
  status: 'available' | 'busy' | 'offline';
}

interface CCTV {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  status: 'online' | 'offline' | 'maintenance';
}

interface SafetyData {
  incidents: SafetyIncident[];
  emergencyServices: EmergencyService[];
  cctvCameras: CCTV[];
  activeAlerts: number;
}

interface SafetyState {
  data: SafetyData;
  isLoading: boolean;
  lastUpdate: Date | null;
  
  setData: (data: SafetyData) => void;
  setLoading: (loading: boolean) => void;
  setLastUpdate: (date: Date) => void;
}

export const useSafetyStore = create<SafetyState>((set) => ({
  data: {
    incidents: [],
    emergencyServices: [],
    cctvCameras: [],
    activeAlerts: 0,
  },
  isLoading: false,
  lastUpdate: null,
  
  setData: (data) => set({ data }),
  setLoading: (isLoading) => set({ isLoading }),
  setLastUpdate: (lastUpdate) => set({ lastUpdate }),
}));
