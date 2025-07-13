import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Settings, TrendingUp, Activity, Zap, AlertTriangle } from 'lucide-react';
import { TradingMetrics } from './TradingMetrics';
import { OpportunitiesFeed } from './OpportunitiesFeed';
import { AIAgent } from './AIAgent';
import { TransactionVisualizer } from './TransactionVisualizer';
import { TestMode } from './TestMode';
import { NetworkStatus } from './NetworkStatus';
import { BotControls } from './BotControls';
import { generateFakeStats } from './FakeDataGenerator';
import { NETWORKS } from '@/constants/networks';

interface WorkingBotDashboardProps {
  selectedNetwork?: string;
}

export const WorkingBotDashboard: React.FC<WorkingBotDashboardProps> = ({ selectedNetwork = 'base' }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState(generateFakeStats());
  const [isTestMode, setIsTestMode] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const network = NETWORKS[selectedNetwork];

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning) {
        setStats(generateFakeStats());
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              AI Arbitrage Bot
            </h1>
            <p className={`${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Next-gen DeFi trading terminal on {network.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant={isTestMode ? 'secondary' : 'outline'}
              onClick={() => setIsTestMode(!isTestMode)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isTestMode ? 'Test Mode' : 'Live Mode'}
            </Button>
            <Button
              onClick={handleStartStop}
              className={`${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isRunning ? (
                <><Pause className="w-4 h-4 mr-2" />Stop Bot</>
              ) : (
                <><Play className="w-4 h-4 mr-2" />Start Bot</>
              )}
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Total Profit</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ${stats.totalProfit.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Win Rate</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.winRate.toFixed(1)}%
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Total Trades</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalTrades}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Status</p>
                  <Badge className={isRunning ? 'bg-green-600' : 'bg-red-600'}>
                    {isRunning ? 'Running' : 'Stopped'}
                  </Badge>
                </div>
                <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="opportunities" className="w-full">
              <TabsList className={`grid w-full grid-cols-4 ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
                <TabsTrigger value="controls">Controls</TabsTrigger>
              </TabsList>

              <TabsContent value="opportunities" className="mt-6">
                <OpportunitiesFeed isRunning={isRunning} network={selectedNetwork} />
              </TabsContent>

              <TabsContent value="metrics" className="mt-6">
                <TradingMetrics stats={stats} />
              </TabsContent>

              <TabsContent value="visualizer" className="mt-6">
                <TransactionVisualizer />
              </TabsContent>

              <TabsContent value="controls" className="mt-6">
                <BotControls isRunning={isRunning} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <NetworkStatus network={network} />
            <AIAgent />
            {isTestMode && <TestMode />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingBotDashboard;