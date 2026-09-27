'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building2, 
  Car, 
  Wind, 
  Shield, 
  Droplets, 
  Newspaper,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react';

const onboardingSteps = [
  {
    id: 1,
    title: 'Welcome to Smart City Dashboard',
    subtitle: 'Your centralized hub for urban intelligence',
    description: 'Monitor, analyze, and manage city operations in real-time with our comprehensive dashboard.',
    icon: Building2,
    gradient: 'from-ocean-500 to-teal-500',
    features: ['Real-time monitoring', 'Data visualization', 'Smart analytics'],
  },
  {
    id: 2,
    title: 'Traffic Management',
    subtitle: 'Navigate the city smarter',
    description: 'Real-time traffic flow monitoring, congestion alerts, and intelligent route optimization.',
    icon: Car,
    gradient: 'from-blue-500 to-ocean-500',
    features: ['Live traffic updates', 'Incident detection', 'Speed monitoring'],
  },
  {
    id: 3,
    title: 'Environmental Monitoring',
    subtitle: 'Breathe better, live better',
    description: 'Track air quality, weather conditions, and environmental metrics across the city.',
    icon: Wind,
    gradient: 'from-teal-500 to-green-500',
    features: ['AQI monitoring', 'Weather data', 'Pollution alerts'],
  },
  {
    id: 4,
    title: 'Public Safety',
    subtitle: 'Keeping citizens safe',
    description: 'Monitor incidents, emergency services, and city-wide security infrastructure.',
    icon: Shield,
    gradient: 'from-red-500 to-orange-500',
    features: ['Incident tracking', 'Emergency alerts', 'CCTV network'],
  },
  {
    id: 5,
    title: 'Water Management',
    subtitle: 'Every drop counts',
    description: 'Monitor water reservoirs, consumption patterns, and detect leaks in real-time.',
    icon: Droplets,
    gradient: 'from-cyan-500 to-blue-500',
    features: ['Reservoir levels', 'Usage analytics', 'Leak detection'],
  },
  {
    id: 6,
    title: 'News & Updates',
    subtitle: 'Stay informed',
    description: 'Get the latest government news, policies, and city announcements in one place.',
    icon: Newspaper,
    gradient: 'from-purple-500 to-pink-500',
    features: ['Government news', 'Policy updates', 'Public notices'],
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useAuthStore();
  
  const step = onboardingSteps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      completeOnboarding();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-900 via-ocean-800 to-teal-900 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-teal-400/20 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * -200 - 100],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Skip button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          Skip
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-4xl"
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left side - Icon and visual */}
                <div className={`bg-gradient-to-br ${step.gradient} p-8 sm:p-12 flex flex-col items-center justify-center min-h-[300px]`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                    </div>
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 text-xl sm:text-2xl font-heading font-bold text-white text-center"
                  >
                    {step.subtitle}
                  </motion.h2>
                </div>

                {/* Right side - Content */}
                <div className="p-6 sm:p-12 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-4">
                      {step.title}
                    </h1>
                    <p className="text-ocean-200 mb-6 text-sm sm:text-base">
                      {step.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      {step.features.map((feature, index) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-teal-500/30 flex items-center justify-center">
                            <Check className="w-4 h-4 text-teal-400" />
                          </div>
                          <span className="text-white/90 text-sm sm:text-base">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {onboardingSteps.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentStep(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentStep
                                ? 'bg-teal-400 w-6'
                                : 'bg-white/30 hover:bg-white/50'
                            }`}
                          />
                        ))}
                      </div>

                      <div className="flex gap-3">
                        {currentStep > 0 && (
                          <Button
                            variant="ghost"
                            onClick={handlePrev}
                            className="text-white/70 hover:text-white hover:bg-white/10"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back
                          </Button>
                        )}
                        <Button
                          onClick={handleNext}
                          className={`bg-gradient-to-r ${step.gradient} hover:opacity-90 text-white`}
                        >
                          {isLastStep ? 'Get Started' : 'Next'}
                          {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
                          {isLastStep && <Check className="w-4 h-4 ml-1" />}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-ocean-300 text-sm">
        Smart City Dashboard • Empowering Urban Intelligence
      </div>
    </div>
  );
}
