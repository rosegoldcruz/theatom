'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/components/LandingPage';
import { ATOMTradingSystem } from '@/components/ATOMTradingSystem';
import { AppProvider } from '@/contexts/AppContext';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00a489]"></div>
      </div>
    );
  }

  // Only show trading system if user is properly authenticated
  if (user) {
    return (
      <AppProvider>
        <ATOMTradingSystem />
      </AppProvider>
    );
  }

  // Show landing page - no bypass allowed
  return (
    <LandingPage />
  );
}