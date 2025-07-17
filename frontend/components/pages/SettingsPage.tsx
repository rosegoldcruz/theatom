'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { NetworkSelector } from '@/components/NetworkSelector';

export function SettingsPage() {
  const { state } = useAppContext();
  const { isDark } = state;

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Customize your trading dashboard and system preferences
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Customization */}
        <ThemeCustomizer />

        {/* Network Configuration */}
        <NetworkSelector variant="card" />
      </div>
    </div>
  );
}
