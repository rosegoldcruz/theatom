import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, PauseCircle, RotateCcw, TrendingUp, AlertTriangle } from 'lucide-react';

interface TestTrade {
  id: string;
  pair: string;
  action: 'buy' | 'sell';
  amount: number;
  price: number;
  profit: number;
  timestamp: Date;
  status: 'pending' | 'executed' | 'failed';
}

interface TestModeProps {
  isTestMode: boolean;
  onToggleTestMode: (enabled: boolean) => void;
}

export const TestMode: React.FC<TestModeProps> = ({ isTestMode, onToggleTestMode }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testTrades, setTestTrades] = useState<TestTrade[]>([]);
  const [testBalance, setTestBalance] = useState(10); // Starting with 10 ETH
  const [totalProfit, setTotalProfit] = useState(0);
  const [winRate, setWinRate] = useState(0);

  const mockTrades: Omit<TestTrade, 'id' | 'timestamp' | 'status'>[] = [
    { pair: 'ETH/USDC', action: 'buy', amount: 1.5, price: 1850, profit: 0.023 },
    { pair: 'WBTC/ETH', action: 'sell', amount: 0.05, price: 16.2, profit: 0.045 },
    { pair: 'USDT/DAI', action: 'buy', amount: 1000, price: 1.001, profit: 0.012 },
    { pair: 'ETH/USDC', action: 'sell', amount: 2.0, price: 1847, profit: -0.008 },
    { pair: 'LINK/ETH', action: 'buy', amount: 100, price: 0.0041, profit: 0.034 }
  ];

  const startSimulation = () => {
    setIsRunning(true);
    
    const interval = setInterval(() => {
      if (testTrades.length >= 20) {
        setIsRunning(false);
        clearInterval(interval);
        return;
      }
      
      const randomTrade = mockTrades[Math.floor(Math.random() * mockTrades.length)];
      const newTrade: TestTrade = {
        ...randomTrade,
        id: Date.now().toString(),
        timestamp: new Date(),
        status: 'pending'
      };
      
      setTestTrades(prev => [...prev, newTrade]);
      
      // Execute trade after 1 second
      setTimeout(() => {
        setTestTrades(prev => prev.map(trade => 
          trade.id === newTrade.id 
            ? { ...trade, status: Math.random() > 0.15 ? 'executed' : 'failed' }
            : trade
        ));
        
        if (Math.random() > 0.15) {
          setTestBalance(prev => prev + newTrade.profit);
          setTotalProfit(prev => prev + newTrade.profit);
        }
        
        // Update win rate
        const executedTrades = testTrades.filter(t => t.status === 'executed');
        const winningTrades = executedTrades.filter(t => t.profit > 0);
        setWinRate(executedTrades.length > 0 ? (winningTrades.length / executedTrades.length) * 100 : 0);
      }, 1000);
    }, 2000);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setTestTrades([]);
    setTestBalance(10);
    setTotalProfit(0);
    setWinRate(0);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Test Mode
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm">Enable Test Mode</span>
              <Switch 
                checked={isTestMode} 
                onCheckedChange={onToggleTestMode}
              />
            </div>
          </div>
        </CardHeader>
        
        {isTestMode && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Test mode uses simulated data. No real funds at risk.
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {testBalance.toFixed(3)} ETH
                  </div>
                  <div className="text-sm text-gray-500">Test Balance</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(3)} ETH
                  </div>
                  <div className="text-sm text-gray-500">Total P&L</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {winRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Win Rate</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={isRunning ? () => setIsRunning(false) : startSimulation}
                  className="flex-1"
                >
                  {isRunning ? (
                    <><PauseCircle className="h-4 w-4 mr-2" />Pause Simulation</>
                  ) : (
                    <><PlayCircle className="h-4 w-4 mr-2" />Start Simulation</>
                  )}
                </Button>
                <Button variant="outline" onClick={resetSimulation}>
                  <RotateCcw className="h-4 w-4 mr-2" />Reset
                </Button>
              </div>
              
              {testTrades.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recent Test Trades</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {testTrades.slice(-5).reverse().map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant={trade.status === 'executed' ? 'default' : 
                                        trade.status === 'failed' ? 'destructive' : 'secondary'}>
                            {trade.status}
                          </Badge>
                          <span className="text-sm font-medium">{trade.pair}</span>
                          <span className="text-sm text-gray-500">{trade.action}</span>
                        </div>
                        <div className={`text-sm font-medium ${
                          trade.profit >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trade.profit >= 0 ? '+' : ''}{trade.profit.toFixed(3)} ETH
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};