'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/components/LandingPage';
import { ATOMTradingSystem } from '@/components/ATOMTradingSystem';
import { AppProvider } from '@/contexts/AppContext';

export default function Home() {
  const { user, loading } = useAuth();
  const [showApp, setShowApp] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a489]"></div>
      </div>
    );
  }

  // If user is authenticated or manually entering app, show the trading system
  if (user || showApp) {
    return (
      <AppProvider>
        <ATOMTradingSystem />
      </AppProvider>
    );
  }

  // Show landing page with authentication
  return (
    <LandingPage onEnterApp={() => setShowApp(true)} />
  );
}