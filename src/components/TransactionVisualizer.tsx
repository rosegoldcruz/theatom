import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';

interface TransactionStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  details: string;
  gasUsed?: number;
  txHash?: string;
}

interface Transaction {
  id: string;
  type: 'arbitrage' | 'flash_loan';
  pair: string;
  profit: number;
  timestamp: Date;
  steps: TransactionStep[];
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'arbitrage',
    pair: 'ETH/USDC',
    profit: 0.045,
    timestamp: new Date(Date.now() - 300000),
    steps: [
      {
        id: '1',
        title: 'Flash Loan Request',
        status: 'completed',
        details: 'Borrowed 10 ETH from Aave',
        gasUsed: 45000,
        txHash: '0x1234...5678'
      },
      {
        id: '2',
        title: 'Buy on Uniswap',
        status: 'completed',
        details: 'Swapped 10 ETH → 18,450 USDC',
        gasUsed: 120000,
        txHash: '0x2345...6789'
      },
      {
        id: '3',
        title: 'Sell on SushiSwap',
        status: 'completed',
        details: 'Swapped 18,450 USDC → 10.045 ETH',
        gasUsed: 115000,
        txHash: '0x3456...7890'
      },
      {
        id: '4',
        title: 'Repay Flash Loan',
        status: 'completed',
        details: 'Repaid 10 ETH + 0.0009 ETH fee',
        gasUsed: 35000,
        txHash: '0x4567...8901'
      }
    ]
  },
  {
    id: '2',
    type: 'arbitrage',
    pair: 'WBTC/ETH',
    profit: 0.12,
    timestamp: new Date(),
    steps: [
      {
        id: '1',
        title: 'Flash Loan Request',
        status: 'completed',
        details: 'Borrowed 5 ETH from Balancer',
        gasUsed: 42000,
        txHash: '0x5678...9012'
      },
      {
        id: '2',
        title: 'Buy on Curve',
        status: 'processing',
        details: 'Swapping 5 ETH → WBTC...',
        gasUsed: 0
      },
      {
        id: '3',
        title: 'Sell on Balancer',
        status: 'pending',
        details: 'Waiting to swap WBTC → ETH'
      },
      {
        id: '4',
        title: 'Repay Flash Loan',
        status: 'pending',
        details: 'Waiting to repay loan'
      }
    ]
  }
];

export const TransactionVisualizer: React.FC = () => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(mockTransactions[0]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Transaction Flow</h3>
        <Badge variant="outline">
          {mockTransactions.length} Recent
        </Badge>
      </div>
      
      <div className="flex gap-2 mb-4">
        {mockTransactions.map((tx) => (
          <Button
            key={tx.id}
            variant={selectedTx?.id === tx.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTx(tx)}
          >
            {tx.pair} (+{tx.profit} ETH)
          </Button>
        ))}
      </div>
      
      {selectedTx && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {selectedTx.pair} Arbitrage
              </CardTitle>
              <Badge className="bg-green-100 text-green-800">
                +{selectedTx.profit} ETH
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {selectedTx.steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    {getStatusIcon(step.status)}
                    {index < selectedTx.steps.length - 1 && (
                      <div className="w-px h-8 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <Badge className={getStatusColor(step.status)}>
                        {step.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{step.details}</p>
                    
                    {step.gasUsed && (
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Gas: {step.gasUsed.toLocaleString()}</span>
                        {step.txHash && (
                          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View on Etherscan
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Total Gas Used:</span>
                <span>{selectedTx.steps.reduce((sum, step) => sum + (step.gasUsed || 0), 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Net Profit:</span>
                <span className="text-green-600">+{selectedTx.profit} ETH</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};