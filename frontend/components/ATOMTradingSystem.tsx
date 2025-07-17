'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { DashboardPage } from '@/components/pages/DashboardPage';
import { BotControlPage } from '@/components/pages/BotControlPage';
import { OpportunitiesPage } from '@/components/pages/OpportunitiesPage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { TradingMetrics } from '@/components/TradingMetrics';

// Placeholder pages for Analytics and History
function AnalyticsPage() {
  const { state } = useAppContext();
  const { isDark } = state;
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Detailed performance analytics and insights
        </p>
      </div>
      <TradingMetrics />
      <div className={`mt-8 p-8 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} text-center`}>
        <h3 className="text-lg font-medium mb-2">Advanced Analytics Coming Soon</h3>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          Detailed charts, performance metrics, and trading insights will be available here.
        </p>
      </div>
    </div>
  );
}

function HistoryPage() {
  const { state } = useAppContext();
  const { isDark } = state;
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Trade History</h1>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Complete history of all executed trades
        </p>
      </div>
      <div className={`p-8 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} text-center`}>
        <h3 className="text-lg font-medium mb-2">Trade History Coming Soon</h3>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          Detailed trade history with filters, search, and export functionality will be available here.
        </p>
      </div>
    </div>
  );
}

const pages = {
  dashboard: DashboardPage,
  bot: BotControlPage,
  opportunities: OpportunitiesPage,
  analytics: AnalyticsPage,
  history: HistoryPage,
  settings: SettingsPage
};

export function ATOMTradingSystem() {
  const { state, actions } = useAppContext();
  const { currentPage, isDark, isMobile, isSidebarOpen } = state;

  const CurrentPage = pages[currentPage] || pages.dashboard;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex">
        {/* Desktop Sidebar */}
        {!isMobile && <Sidebar />}
        
        <div className="flex-1">
          <Header />
          <main className="overflow-auto">
            <CurrentPage />
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40" 
            onClick={actions.toggleSidebar}
          />
          <Sidebar className="fixed inset-y-0 left-0 z-50" />
        </>
      )}
    </div>
  );
}
