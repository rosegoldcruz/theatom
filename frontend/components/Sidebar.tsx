'use client';

import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { 
  Home, Bot, TrendingUp, BarChart3, History, Settings, 
  Zap, LogOut, User 
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = '' }: SidebarProps) {
  const { state, actions } = useAppContext();
  const { currentPage, theme, isDark } = state;

  const themes = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    pink: 'bg-pink-500'
  };

  const navigation = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'bot', icon: Bot, label: 'Bot Control' },
    { id: 'opportunities', icon: TrendingUp, label: 'Opportunities' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'history', icon: History, label: 'Trade History' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className={`w-64 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-r transition-all duration-300 ${className}`}>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${themes[theme]} rounded-lg flex items-center justify-center shadow-lg`}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ATOM</h1>
              <p className="text-sm text-gray-500">Arbitrage System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map(item => (
            <button
              key={item.id}
              onClick={() => actions.setPage(item.id as any)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                currentPage === item.id 
                  ? `${themes[theme]} text-white shadow-lg` 
                  : `${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">User</p>
              <p className="text-xs text-gray-500">Connected</p>
            </div>
          </div>
          <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}