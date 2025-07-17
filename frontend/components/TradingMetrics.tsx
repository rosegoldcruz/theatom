'use client';

import React from 'react';
import { DollarSign, TrendingUp, Activity, Zap, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useArbitrageBot } from '@/hooks/useArbitrageBot';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBgColor: string;
  showBalance?: boolean;
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor, 
  iconBgColor,
  showBalance = true 
}: MetricCardProps) {
  const { state } = useAppContext();
  const { isDark } = state;

  return (
    <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {title}
            </p>
            <p className={`text-2xl font-bold ${iconColor}`}>
              {showBalance ? value : '****'}
            </p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          </div>
          <div className={`p-3 ${iconBgColor} rounded-lg`}>
            <Icon className={`w-6 h-6 ${iconColor.replace('text-', 'text-').replace('-500', '-600')}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TradingMetricsProps {
  className?: string;
}

export function TradingMetrics({ className = '' }: TradingMetricsProps) {
  const { state, actions } = useAppContext();
  const { showBalance } = state;
  const { tradingMetrics } = useArbitrageBot();

  const metrics = [
    {
      title: 'Total Profit',
      value: `$${tradingMetrics.totalProfit.toLocaleString()}`,
      subtitle: '+12.4% this month',
      icon: DollarSign,
      iconColor: 'text-green-500',
      iconBgColor: 'bg-green-100'
    },
    {
      title: "Today's Profit",
      value: `$${tradingMetrics.todayProfit.toFixed(2)}`,
      subtitle: `+${tradingMetrics.avgReturn}% avg return`,
      icon: TrendingUp,
      iconColor: 'text-blue-500',
      iconBgColor: 'bg-blue-100'
    },
    {
      title: 'Success Rate',
      value: `${tradingMetrics.successRate}%`,
      subtitle: `${tradingMetrics.totalTrades} total trades`,
      icon: Activity,
      iconColor: 'text-purple-500',
      iconBgColor: 'bg-purple-100'
    },
    {
      title: 'Active Trades',
      value: tradingMetrics.activeTrades,
      subtitle: `Flash loan volume: $${tradingMetrics.flashLoanVolume.toLocaleString()}`,
      icon: Zap,
      iconColor: 'text-orange-500',
      iconBgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Trading Metrics</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={actions.toggleBalanceVisibility}
          className="flex items-center space-x-2"
        >
          {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showBalance ? 'Hide' : 'Show'} Balance</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
            icon={metric.icon}
            iconColor={metric.iconColor}
            iconBgColor={metric.iconBgColor}
            showBalance={showBalance}
          />
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`${state.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-6">
            <h4 className="font-medium mb-4">Performance Overview</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`text-sm ${state.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Gas Spent (ETH)
                </span>
                <span className="text-sm font-medium">
                  {showBalance ? tradingMetrics.gasSpent.toFixed(4) : '****'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${state.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Average Return
                </span>
                <span className="text-sm font-medium text-green-500">
                  +{tradingMetrics.avgReturn}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${state.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Flash Loan Volume
                </span>
                <span className="text-sm font-medium">
                  {showBalance ? `$${tradingMetrics.flashLoanVolume.toLocaleString()}` : '****'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${state.isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-6">
            <h4 className="font-medium mb-4">Trade Statistics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`text-sm ${state.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Successful Trades
                </span>
                <span className="text-sm font-medium text-green-500">
                  {Math.floor(tradingMetrics.totalTrades * (tradingMetrics.successRate / 100))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${state.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Failed Trades
                </span>
                <span className="text-sm font-medium text-red-500">
                  {tradingMetrics.totalTrades - Math.floor(tradingMetrics.totalTrades * (tradingMetrics.successRate / 100))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${state.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Active Trades
                </span>
                <span className="text-sm font-medium text-blue-500">
                  {tradingMetrics.activeTrades}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
