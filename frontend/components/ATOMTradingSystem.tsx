'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { LandingPage } from './LandingPage';
import { ATOMSidebar } from './ATOMSidebar';
import { Header } from './Header';
import { MainNav } from './main-nav';
import { UserNav } from './user-nav';
import { ModeToggle } from './mode-toggle';
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
  const { state, actions } = useAppContext();
  const { currentPage, isDark, isMobile, isSidebarOpen } = state;

  // Show dashboard app - user is already authenticated if this component loads
  const CurrentPage = pages[currentPage] || pages.dashboard;

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`flex-1 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex">
          {!isMobile && <ATOMSidebar />}

          <div className="flex-1">
            <Header />
            <main className="overflow-auto">
              <div className="container py-6">
                <CurrentPage />
              </div>
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
    </div>
  );
}