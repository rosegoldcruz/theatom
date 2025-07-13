import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, DollarSign, Zap } from 'lucide-react';

interface ArbitrageOpportunity {
  id: string;
  pair: string;
  profit: number;
  profitPercent: number;
  exchanges: [string, string];
  volume: number;
  timeLeft: number;
  risk: 'low' | 'medium' | 'high';
  gasEstimate: number;
}

const mockOpportunities: ArbitrageOpportunity[] = [
  {
    id: '1',
    pair: 'ETH/USDC',
    profit: 0.045,
    profitPercent: 2.3,
    exchanges: ['Uniswap V3', 'SushiSwap'],
    volume: 15.2,
    timeLeft: 45,
    risk: 'low',
    gasEstimate: 0.008
  },
  {
    id: '2',
    pair: 'WBTC/ETH',
    profit: 0.12,
    profitPercent: 1.8,
    exchanges: ['Curve', 'Balancer'],
    volume: 8.7,
    timeLeft: 23,
    risk: 'medium',
    gasEstimate: 0.012
  },
  {
    id: '3',
    pair: 'USDT/DAI',
    profit: 0.023,
    profitPercent: 0.9,
    exchanges: ['Aave', 'Compound'],
    volume: 45.1,
    timeLeft: 67,
    risk: 'low',
    gasEstimate: 0.006
  }
];

interface OpportunitiesFeedProps {
  onSelectOpportunity: (opportunity: ArbitrageOpportunity) => void;
}

export const OpportunitiesFeed: React.FC<OpportunitiesFeedProps> = ({ onSelectOpportunity }) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Live Opportunities
        </h3>
        <Badge variant="outline" className="animate-pulse">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Live
        </Badge>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {mockOpportunities.map((opportunity) => (
          <Card key={opportunity.id} className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{opportunity.pair}</CardTitle>
                <Badge className={getRiskColor(opportunity.risk)}>
                  {opportunity.risk} risk
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">+{opportunity.profit} ETH</span>
                  <span className="text-gray-500">({opportunity.profitPercent}%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span>{opportunity.timeLeft}s left</span>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-600">
                <div>Route: {opportunity.exchanges[0]} → {opportunity.exchanges[1]}</div>
                <div>Volume: {opportunity.volume} ETH | Gas: ~{opportunity.gasEstimate} ETH</div>
              </div>
              
              <div className="mt-3 flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => onSelectOpportunity(opportunity)}
                >
                  Analyze
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onSelectOpportunity(opportunity)}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Execute
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};