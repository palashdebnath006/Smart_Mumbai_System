'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useDashboardStore, type User } from '@/store';
import { useIsAdmin, useUserRole } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Car,
  Wind,
  Shield,
  Droplets,
  Newspaper,
  Zap,
  Trash2,
  SquareParking,
  Menu,
  LogOut,
  Settings,
  Bell,
  User as UserIcon,
  Moon,
  Sun,
  ChevronLeft,
  Activity,
  Radio,
  FileWarning,
  Users,
} from 'lucide-react';
import OverviewModule from '@/components/modules/OverviewModule';
import TrafficModule from '@/components/modules/TrafficModule';
import EnvironmentalModule from '@/components/modules/EnvironmentalModule';
import SafetyModule from '@/components/modules/SafetyModule';
import WaterModule from '@/components/modules/WaterModule';
import NewsModule from '@/components/modules/NewsModule';
import EnergyModule from '@/components/modules/EnergyModule';
import WasteModule from '@/components/modules/WasteModule';
import ParkingModule from '@/components/modules/ParkingModule';
import ActionCenter from '@/components/modules/ActionCenter';
import CitizenReportModule from '@/components/modules/CitizenReportModule';
import UserManagementModule from '@/components/modules/UserManagementModule';

interface DashboardProps {
  user: User | null;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'actions', label: 'Action Center', icon: Radio, alert: true },
  { id: 'traffic', label: 'Traffic', icon: Car },
  { id: 'environmental', label: 'Environment', icon: Wind },
  { id: 'safety', label: 'Public Safety', icon: Shield },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'energy', label: 'Energy', icon: Zap },
  { id: 'waste', label: 'Waste', icon: Trash2 },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'parking', label: 'Parking', icon: SquareParking },
];

export default function Dashboard({ user }: DashboardProps) {
  const { logout } = useAuthStore();
  const { activeModule, setActiveModule, sidebarCollapsed, toggleSidebar, theme, setTheme } = useDashboardStore();
  const isAdmin = useIsAdmin();
  const userRole = useUserRole();

  const handleLogout = async () => {
    try {
      const token = useAuthStore.getState().token;
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      }
    } catch {
      // Ignore logout errors
    }
    logout();
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'overview':
        return <OverviewModule />;
      case 'actions':
        return userRole !== 'citizen' ? <ActionCenter /> : <OverviewModule />;
      case 'report':
        return userRole === 'citizen' ? <CitizenReportModule /> : <OverviewModule />;
      case 'traffic':
        return <TrafficModule />;
      case 'environmental':
        return <EnvironmentalModule />;
      case 'safety':
        return <SafetyModule />;
      case 'water':
        return <WaterModule />;
      case 'news':
        return <NewsModule />;
      case 'energy':
        return <EnergyModule />;
      case 'waste':
        return <WasteModule />;
      case 'parking':
        return <ParkingModule />;
      case 'user-management':
        return isAdmin ? <UserManagementModule /> : <OverviewModule />;
      default:
        return <OverviewModule />;
    }
  };

  const getNavItems = () => {
    if (userRole === 'citizen') {
      const items = navItems.filter(i => i.id !== 'actions');
      items.splice(1, 0, { id: 'report', label: 'Report Issue', icon: FileWarning, alert: false });
      return items;
    }
    if (userRole === 'admin') {
      return [...navItems, { id: 'user-management', label: 'Manage Users', icon: Users, alert: false }];
    }
    return navItems;
  };

  const currentNavItems = getNavItems();

  return (
    <TooltipProvider>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="flex h-screen bg-background">
          {/* Sidebar */}
          <motion.aside
            initial={false}
            animate={{ width: sidebarCollapsed ? 72 : 256 }}
            className="bg-sidebar flex flex-col border-r border-sidebar-border relative z-20"
          >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <span className="text-lg">🏙️</span>
                  </div>
                  <div>
                    <h1 className="font-heading font-bold text-sidebar-foreground text-sm tracking-wide">SmartMumbai</h1>
                    <p className="text-xs text-sidebar-foreground/50">Bandra · H-West Ward</p>
                  </div>
                </motion.div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-sidebar-foreground hover:bg-sidebar-accent"
              >
                {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </Button>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4">
              <nav className="px-2 space-y-1">
                {currentNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setActiveModule(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                          }`}
                        >
                          <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-teal-400' : ''}`} />
                          {!sidebarCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              className="font-medium text-sm"
                            >
                              {item.label}
                            </motion.span>
                          )}
                          {/* Alert pulse for Action Center */}
                          {'alert' in item && item.alert && !isActive && (
                            <span className="ml-auto relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>
                          )}
                          {isActive && !sidebarCollapsed && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400"
                            />
                          )}
                        </button>
                      </TooltipTrigger>
                      {sidebarCollapsed && (
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </nav>
            </ScrollArea>

            {/* User section */}
            <div className="p-3 border-t border-sidebar-border">
              {sidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="w-full flex justify-center">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className={isAdmin ? "bg-red-500/20 text-red-400 font-semibold" : "bg-teal-500/20 text-teal-400 font-semibold"}>
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <Badge variant={isAdmin ? "destructive" : "secondary"} className="mt-1 text-xs">
                      {userRole === 'admin' ? 'Admin' : userRole === 'officer' ? 'Officer' : 'Citizen'}
                    </Badge>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 ring-2 ring-teal-500/20">
                    <AvatarFallback className={isAdmin ? "bg-red-500/20 text-red-400 font-bold text-sm" : "bg-teal-500/20 text-teal-400 font-bold text-sm"}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {user?.name}
                      </p>
                      <Badge variant={isAdmin ? "destructive" : "secondary"} className="text-xs">
                        {userRole === 'admin' ? 'Admin' : userRole === 'officer' ? 'Officer' : 'Citizen'}
                      </Badge>
                    </div>
                    <p className="text-xs text-sidebar-foreground/60 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-sidebar-foreground/70">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Settings</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        {theme === 'dark' ? (
                          <>
                            <Sun className="w-4 h-4 mr-2" />
                            Light Mode
                          </>
                        ) : (
                          <>
                            <Moon className="w-4 h-4 mr-2" />
                            Dark Mode
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserIcon className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </motion.aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  {currentNavItems.find(item => item.id === activeModule)?.label || 'Dashboard'}
                </h2>
                <Badge variant="secondary" className="bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <span className="w-2 h-2 rounded-full bg-teal-500 mr-2 animate-pulse" />
                  Live
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-64 overflow-y-auto">
                      <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                        <span className="font-medium">Traffic Alert</span>
                        <span className="text-xs text-muted-foreground">High congestion on Main Street</span>
                        <span className="text-xs text-muted-foreground">2 minutes ago</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                        <span className="font-medium">AQI Update</span>
                        <span className="text-xs text-muted-foreground">Air quality improved to Good</span>
                        <span className="text-xs text-muted-foreground">15 minutes ago</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                        <span className="font-medium">Water Alert</span>
                        <span className="text-xs text-muted-foreground">Reservoir levels are low</span>
                        <span className="text-xs text-muted-foreground">1 hour ago</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* Main content area */}
            <main className="flex-1 overflow-auto bg-background">
              <div className="bg-gradient-mesh">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeModule}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {renderModule()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
