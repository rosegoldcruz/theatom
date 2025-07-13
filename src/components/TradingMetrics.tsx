import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Clock, Target, Zap } from 'lucide-react';

const profitData = [
  { time: '00:00', profit: 0 },
  { time: '04:00', profit: 125 },
  { time: '08:00', profit: 340 },
  { time: '12:00', profit: 580 },
  { time: '16:00', profit: 920 },
  { time: '20:00', profit: 1247 },
];

const volumeData = [
  { time: '00:00', volume: 0 },
  { time: '04:00', volume: 15000 },
  { time: '08:00', volume: 32000 },
  { time: '12:00', volume: 48000 },
  { time: '16:00', volume: 67000 },
  { time: '20:00', volume: 89000 },
];

const TradingMetrics: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Profit Chart */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Profit Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={profitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Volume Chart */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Trading Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#8B5CF6" 
                fill="#8B5CF6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Average Profit per Trade</span>
              <span className="text-green-400 font-bold">$7.99</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Max Drawdown</span>
              <span className="text-red-400 font-bold">-$12.45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Sharpe Ratio</span>
              <span className="text-blue-400 font-bold">2.34</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Win Rate</span>
              <span className="text-purple-400 font-bold">94.2%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">Flash loan executed: ETH/USDC</span>
              <span className="text-green-400 ml-auto">+$23.45</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-slate-300">Opportunity detected: BTC/USDT</span>
              <span className="text-blue-400 ml-auto">Analyzing...</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">Trade completed: UNI/ETH</span>
              <span className="text-green-400 ml-auto">+$18.92</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-slate-300">Gas price optimization</span>
              <span className="text-yellow-400 ml-auto">Saved $2.10</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingMetrics;