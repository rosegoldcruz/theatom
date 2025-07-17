'use client';

import { AppProvider } from '@/contexts/AppContext';
import { ATOMTradingSystem } from '@/components/ATOMTradingSystem';

export default function HomePage() {
  return (
    <AppProvider>
      <ATOMTradingSystem />
    </AppProvider>
  );
}


