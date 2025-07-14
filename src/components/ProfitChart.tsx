import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface DailySummary {
  date: string;
  total_profit: number;
  trade_count: number;
  success_count: number;
  avg_profit: number;
}

interface ProfitChartProps {
  data: DailySummary[];
}

export const ProfitChart: React.FC<ProfitChartProps> = ({ data }) => {
  // Format data for chart
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    profit: parseFloat(item.total_profit.toFixed(4)),
    trades: item.trade_count,
    successRate: item.trade_count > 0 ? (item.success_count / item.trade_count) * 100 : 0
  }));

  const totalProfit = data.reduce((sum, item) => sum + item.total_profit, 0);
  const totalTrades = data.reduce((sum, item) => sum + item.trade_count, 0);
  const avgDailyProfit = data.length > 0 ? totalProfit / data.length : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-sm border border-white/20 rounded-lg p-3">
          <p className="text-white font-semibold">{label}</p>
          <p className="text-green-400">
            Profit: ${payload[0].value.toFixed(4)}
          </p>
          <p className="text-blue-400">
            Trades: {payload[1]?.value || 0}
          </p>
          <p className="text-purple-400">
            Success Rate: {payload[2]?.value?.toFixed(1) || 0}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Profit Trends
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-gray-300">Total Profit</p>
            <p className="text-lg font-bold text-green-400">
              ${totalProfit.toFixed(4)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-300">No profit data available</p>
            <p className="text-sm text-gray-400 mt-2">
              Start trading to see profit trends here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  ${totalProfit.toFixed(4)}
                </p>
                <p className="text-sm text-gray-300">Total Profit</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {totalTrades}
                </p>
                <p className="text-sm text-gray-300">Total Trades</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">
                  ${avgDailyProfit.toFixed(4)}
                </p>
                <p className="text-sm text-gray-300">Avg Daily</p>
              </div>
            </div>

            {/* Profit Line Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Trade Volume Bar Chart */}
            <div className="h-48">
              <h4 className="text-white font-semibold mb-2">Daily Trade Volume</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(17, 24, 39, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar 
                    dataKey="trades" 
                    fill="#3B82F6"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
