'use client';

import React, { useState } from 'react';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ArbitrageOpportunity } from '@/types';

interface OpportunitiesFeedProps {
  className?: string;
  showHeader?: boolean;
  maxItems?: number;
}

export function OpportunitiesFeed({ 
  className = '', 
  showHeader = true, 
  maxItems 
}: OpportunitiesFeedProps) {
  const { state } = useAppContext();
  const { isDark } = state;
  const { opportunities, isConnected, lastUpdate } = useRealTimeData();
  const [executingIds, setExecutingIds] = useState<Set<number>>(new Set());

  const displayOpportunities = maxItems ? opportunities.slice(0, maxItems) : opportunities;

  const handleExecute = async (opportunity: ArbitrageOpportunity) => {
    setExecutingIds(prev => new Set(prev).add(opportunity.id));
    
    // Simulate execution delay
    setTimeout(() => {
      setExecutingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(opportunity.id);
        return newSet;
      });
    }, 3000);
  };

  const getStatusBadge = (status: ArbitrageOpportunity['status']) => {
    const variants = {
      executing: 'bg-blue-100 text-blue-700 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      monitoring: 'bg-gray-100 text-gray-700 border-gray-200'
    };

    return (
      <Badge 
        variant="outline" 
        className={`${variants[status]} ${isDark ? 'dark:bg-opacity-20' : ''}`}
      >
        {status}
      </Badge>
    );
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Live Opportunities</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Real-time arbitrage opportunities across DEXs
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                {isConnected ? 'Live Data' : 'Disconnected'}
              </span>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      )}

      <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden`}>
        {!showHeader && (
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Live Opportunities</CardTitle>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
          </CardHeader>
        )}
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border-b`}>
                <TableRow>
                  <TableHead className="font-medium">Trading Pair</TableHead>
                  <TableHead className="font-medium">DEX Route</TableHead>
                  <TableHead className="font-medium">Spread</TableHead>
                  <TableHead className="font-medium">Est. Profit</TableHead>
                  <TableHead className="font-medium">Gas Cost</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Last Update</TableHead>
                  <TableHead className="font-medium">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayOpportunities.map(opportunity => {
                  const isExecuting = executingIds.has(opportunity.id);
                  
                  return (
                    <TableRow 
                      key={opportunity.id} 
                      className={`${isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} border-b`}
                    >
                      <TableCell>
                        <div className="font-medium">{opportunity.pair}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{opportunity.dex1}</div>
                          <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            {opportunity.dex2}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-500 font-semibold">
                          +{opportunity.spread.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          ${opportunity.profit.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                          {opportunity.gas.toFixed(4)} ETH
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(isExecuting ? 'executing' : opportunity.status)}
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {opportunity.timestamp ? formatTimeAgo(opportunity.timestamp) : 'Just now'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleExecute(opportunity)}
                          disabled={isExecuting || opportunity.status === 'executing'}
                          className={`${
                            isExecuting || opportunity.status === 'executing'
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {isExecuting ? 'Executing...' : 'Execute'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Last Update Info */}
      <div className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center`}>
        Last updated: {new Date(lastUpdate).toLocaleTimeString()}
      </div>
    </div>
  );
}
