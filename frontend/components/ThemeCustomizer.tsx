'use client';

import React from 'react';
import { Palette, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { THEME_COLORS } from '@/constants/networks';
import { ThemeColor } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface ThemeCustomizerProps {
  className?: string;
}

export function ThemeCustomizer({ className = '' }: ThemeCustomizerProps) {
  const { state, actions } = useAppContext();
  const { theme, isDark, showBalance } = state;

  const themeOptions: { name: ThemeColor; label: string; color: string }[] = [
    { name: 'blue', label: 'Blue', color: THEME_COLORS.blue },
    { name: 'green', label: 'Green', color: THEME_COLORS.green },
    { name: 'purple', label: 'Purple', color: THEME_COLORS.purple },
    { name: 'orange', label: 'Orange', color: THEME_COLORS.orange },
    { name: 'red', label: 'Red', color: THEME_COLORS.red },
    { name: 'pink', label: 'Pink', color: THEME_COLORS.pink }
  ];

  return (
    <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Palette className="w-5 h-5" />
          <span>Theme Customization</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Theme Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">Color Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map(({ name, label, color }) => (
              <button
                key={name}
                onClick={() => actions.setTheme(name)}
                className={`
                  p-3 rounded-lg border-2 transition-all hover:scale-105
                  ${theme === name 
                    ? `border-gray-400 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}` 
                    : `${isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}`
                  }
                `}
              >
                <div className={`w-full h-6 ${color} rounded mb-2`}></div>
                <div className="text-xs font-medium capitalize">{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="font-medium">Dark Mode</span>
          </div>
          <Switch
            checked={isDark}
            onCheckedChange={actions.toggleDarkMode}
          />
        </div>

        {/* Balance Visibility Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="font-medium">Show Balance</span>
          </div>
          <Switch
            checked={showBalance}
            onCheckedChange={actions.toggleBalanceVisibility}
          />
        </div>

        {/* Theme Preview */}
        <div className={`p-4 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
          <h4 className="font-medium mb-3">Preview</h4>
          <div className="space-y-3">
            {/* Sample Button */}
            <Button className={`${THEME_COLORS[theme]} text-white hover:opacity-90`}>
              Sample Button
            </Button>
            
            {/* Sample Card */}
            <div className={`p-3 rounded border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sample Metric</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {showBalance ? '$1,234.56' : '****'}
                  </p>
                </div>
                <div className={`w-8 h-8 ${THEME_COLORS[theme]} rounded-full`}></div>
              </div>
            </div>

            {/* Sample Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 ${THEME_COLORS[theme]} rounded-full`}></div>
              <span className="text-sm">Active Status</span>
            </div>
          </div>
        </div>

        {/* Reset to Defaults */}
        <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <Button
            variant="outline"
            onClick={() => {
              actions.setTheme('blue');
              if (isDark) actions.toggleDarkMode();
              if (!showBalance) actions.toggleBalanceVisibility();
            }}
            className="w-full"
          >
            Reset to Defaults
          </Button>
        </div>

        {/* Theme Information */}
        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} space-y-1`}>
          <p>• Theme settings are automatically saved</p>
          <p>• Changes apply instantly across the app</p>
          <p>• Dark mode affects all components</p>
        </div>
      </CardContent>
    </Card>
  );
}
