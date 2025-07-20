'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { LandingPage } from './LandingPage';
import { ATOMSidebar } from './ATOMSidebar';
import { Header } from './Header';
import { DashboardPage } from './pages/DashboardPage';
import { BotControlPage } from './pages/BotControlPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { SettingsPage } from './pages/SettingsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { HistoryPage } from './pages/HistoryPage';

const pages = {
  dashboard: DashboardPage,
  bot: BotControlPage,
  opportunities: OpportunitiesPage,
  analytics: AnalyticsPage,
  history: HistoryPage,
  settings: SettingsPage
};

export function ATOMTradingSystem() {
  const [showDashboard, setShowDashboard] = useState(false);
  const { state, actions } = useAppContext();
  const { currentPage, isDark, isMobile, isSidebarOpen } = state;

  // Show landing page first
  if (!showDashboard) {
    return <LandingPage onEnterApp={() => setShowDashboard(true)} />;
  }

  // Show dashboard app
  const CurrentPage = pages[currentPage] || pages.dashboard;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex">
        {!isMobile && <ATOMSidebar />}
        
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
          <ATOMSidebar className="fixed inset-y-0 left-0 z-50" />
        </>
      )}
    </div>
  );
}