'use client';

import React from 'react';
import { 
  Home, Bot, TrendingUp, BarChart3, History, Settings, 
  Zap, LogOut, User 
} from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { THEME_COLORS } from '@/constants/networks';
import { PageId } from '@/types';

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  { id: 'dashboard' as PageId, icon: Home, label: 'Dashboard' },
  { id: 'bot' as PageId, icon: Bot, label: 'Bot Control' },
  { id: 'opportunities' as PageId, icon: TrendingUp, label: 'Opportunities' },
  { id: 'analytics' as PageId, icon: BarChart3, label: 'Analytics' },
  { id: 'history' as PageId, icon: History, label: 'Trade History' },
  { id: 'settings' as PageId, icon: Settings, label: 'Settings' }
];

export function Sidebar({ className = '' }: SidebarProps) {
  const { state, actions } = useAppContext();
  const { currentPage, theme, isDark, isMobile, isSidebarOpen } = state;

  const handleNavigation = (pageId: PageId) => {
    actions.setPage(pageId);
    if (isMobile) {
      actions.toggleSidebar();
    }
  };

  const sidebarClasses = `
    ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'w-64'} 
    ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} 
    border-r transition-transform duration-300 
    ${isMobile && !isSidebarOpen ? '-translate-x-full' : ''} 
    ${className}
  `.trim();

  return (
    <div className={sidebarClasses}>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${THEME_COLORS[theme]} rounded-lg flex items-center justify-center`}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ATOM</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Arbitrage System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map(item => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                  ${isActive 
                    ? `${THEME_COLORS[theme]} text-white` 
                    : `${isDark 
                        ? 'text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }`
                  }
                `.trim()}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-8 h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded-full flex items-center justify-center`}>
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Trader</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Pro Account
              </p>
            </div>
          </div>
          
          <button 
            className={`
              w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors
              ${isDark 
                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
            `.trim()}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
