import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Loader2, AlertTriangle, TrendingUp, Zap, RefreshCw } from 'lucide-react';

type UIState = 'loading' | 'empty' | 'error' | 'success' | 'noOpportunities' | 'testMode';

interface UIStatesManagerProps {
  currentState?: UIState;
  onStateChange?: (state: UIState) => void;
}

export const UIStatesManager = ({ currentState = 'loading', onStateChange }: UIStatesManagerProps) => {
  const [state, setState] = useState<UIState>(currentState);
  const [progress, setProgress] = useState(0);

  const handleStateChange = (newState: UIState) => {
    setState(newState);
    onStateChange?.(newState);
    
    if (newState === 'loading') {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setState('success');
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const renderLoadingState = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading Opportunities
        </CardTitle>
        <CardDescription>Scanning markets for arbitrage opportunities...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </CardContent>
    </Card>
  );

  const renderEmptyState = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          No Data Available
        </CardTitle>
        <CardDescription>Connect your wallet to start trading</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please connect your MetaMask wallet and select a supported network to view trading opportunities.
          </AlertDescription>
        </Alert>
        <Button onClick={() => handleStateChange('loading')} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      </CardContent>
    </Card>
  );

  const renderErrorState = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          Connection Error
        </CardTitle>
        <CardDescription>Failed to load market data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to connect to market data providers. Please check your network connection and try again.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={() => handleStateChange('loading')} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button onClick={() => handleStateChange('testMode')} variant="outline" className="flex-1">
            <Zap className="h-4 w-4 mr-2" />
            Test Mode
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSuccessState = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Trade Executed Successfully
        </CardTitle>
        <CardDescription>Your arbitrage trade has been completed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-green-500">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription>
            Trade executed successfully! Profit: $450.23 (2.34% return)
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Transaction Hash</div>
            <div className="text-sm font-mono">0x1234...5678</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Gas Used</div>
            <div className="text-sm font-mono">$12.50</div>
          </div>
        </div>
        <Button onClick={() => handleStateChange('loading')} className="w-full">
          <TrendingUp className="h-4 w-4 mr-2" />
          Find Next Opportunity
        </Button>
      </CardContent>
    </Card>
  );

  const renderNoOpportunitiesState = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          No Opportunities Found
        </CardTitle>
        <CardDescription>Market conditions are not favorable for arbitrage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No profitable arbitrage opportunities detected. This is normal during stable market conditions.
          </AlertDescription>
        </Alert>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Market Volatility</span>
            <Badge variant="outline">Low</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Price Differences</span>
            <Badge variant="outline">Minimal</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Gas Prices</span>
            <Badge variant="secondary">High</Badge>
          </div>
        </div>
        <Button onClick={() => handleStateChange('loading')} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Scan
        </Button>
      </CardContent>
    </Card>
  );

  const renderTestModeState = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Test Mode Active
        </CardTitle>
        <CardDescription>Simulating trades with fake data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-500">
          <Zap className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            Test mode is active. All trades are simulated and no real funds are used.
          </AlertDescription>
        </Alert>
        <div className="space-y-3">
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">ETH/USDC Opportunity</div>
                <div className="text-sm text-muted-foreground">Simulated Trade</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-500">+2.5%</div>
                <div className="text-sm text-muted-foreground">$500 profit</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleStateChange('success')} className="flex-1">
            <Zap className="h-4 w-4 mr-2" />
            Simulate Success
          </Button>
          <Button onClick={() => handleStateChange('error')} variant="outline" className="flex-1">
            <XCircle className="h-4 w-4 mr-2" />
            Simulate Failure
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCurrentState = () => {
    switch (state) {
      case 'loading':
        return renderLoadingState();
      case 'empty':
        return renderEmptyState();
      case 'error':
        return renderErrorState();
      case 'success':
        return renderSuccessState();
      case 'noOpportunities':
        return renderNoOpportunitiesState();
      case 'testMode':
        return renderTestModeState();
      default:
        return renderLoadingState();
    }
  };

  return (
    <div className="space-y-6">
      {/* State Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle>UI State Demo</CardTitle>
          <CardDescription>Click buttons to simulate different application states</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => handleStateChange('loading')} variant={state === 'loading' ? 'default' : 'outline'}>
              Loading
            </Button>
            <Button size="sm" onClick={() => handleStateChange('empty')} variant={state === 'empty' ? 'default' : 'outline'}>
              Empty
            </Button>
            <Button size="sm" onClick={() => handleStateChange('error')} variant={state === 'error' ? 'default' : 'outline'}>
              Error
            </Button>
            <Button size="sm" onClick={() => handleStateChange('success')} variant={state === 'success' ? 'default' : 'outline'}>
              Success
            </Button>
            <Button size="sm" onClick={() => handleStateChange('noOpportunities')} variant={state === 'noOpportunities' ? 'default' : 'outline'}>
              No Opportunities
            </Button>
            <Button size="sm" onClick={() => handleStateChange('testMode')} variant={state === 'testMode' ? 'default' : 'outline'}>
              Test Mode
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current State Display */}
      {renderCurrentState()}
    </div>
  );
};