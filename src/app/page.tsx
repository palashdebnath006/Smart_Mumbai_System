'use client';

import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store';
import OnboardingScreen from '@/components/auth/OnboardingScreen';
import AuthScreen from '@/components/auth/AuthScreen';
import Dashboard from '@/components/dashboard/Dashboard';

export default function Home() {
  const { isAuthenticated, hasSeenOnboarding, isLoading, setLoading, user } = useAuthStore();

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [setLoading]);

  // Calculate display state based on auth state
  const displayState = useMemo(() => {
    if (isLoading) return 'loading';
    if (!hasSeenOnboarding) return 'onboarding';
    if (!isAuthenticated) return 'auth';
    return 'dashboard';
  }, [isLoading, hasSeenOnboarding, isAuthenticated]);

  // Loading screen
  if (displayState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-900 via-ocean-800 to-teal-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 border-4 border-teal-400 border-t-transparent rounded-full mx-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">🏙️</span>
            </div>
          </div>
          <h1 className="mt-6 text-2xl font-heading font-bold text-white">
            Smart City Dashboard
          </h1>
          <p className="mt-2 text-ocean-200">Loading your city data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {displayState === 'onboarding' && (
        <motion.div
          key="onboarding"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <OnboardingScreen />
        </motion.div>
      )}
      
      {displayState === 'auth' && (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AuthScreen />
        </motion.div>
      )}
      
      {displayState === 'dashboard' && (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Dashboard user={user} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
