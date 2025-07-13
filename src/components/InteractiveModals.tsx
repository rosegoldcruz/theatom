import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Zap, TrendingUp, Info, AlertTriangle, Loader2 } from 'lucide-react';

interface AnalyzeModalProps {
  trigger: React.ReactNode;
}

export const AnalyzeModal = ({ trigger }: AnalyzeModalProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Opportunity Analysis
          </DialogTitle>
          <DialogDescription>
            Deep analysis of arbitrage opportunity with risk assessment
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ETH/USDC Arbitrage</CardTitle>
              <CardDescription>Uniswap V3 → SushiSwap</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Profit Potential</div>
                  <div className="text-2xl font-bold text-green-500">+2.34%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Risk Score</div>
                  <div className="text-2xl font-bold text-yellow-500">Medium</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Gas Fees</span>
                  <span className="text-sm font-medium">~$12.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Slippage Tolerance</span>
                  <span className="text-sm font-medium">0.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Execution Time</span>
                  <span className="text-sm font-medium">~15 seconds</span>
                </div>
              </div>
              
              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing market conditions...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
              
              {progress === 100 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Analysis complete! This opportunity shows strong profit potential with acceptable risk.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          <div className="flex gap-2">
            <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-1">
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
            <Button variant="outline" className="flex-1">
              <Zap className="h-4 w-4 mr-2" />
              Execute Trade
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ExecuteModalProps {
  trigger: React.ReactNode;
}

export const ExecuteModal = ({ trigger }: ExecuteModalProps) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [success, setSuccess] = useState<boolean | null>(null);

  const steps = [
    'Preparing transaction',
    'Checking liquidity',
    'Executing swap on Uniswap',
    'Executing swap on SushiSwap',
    'Confirming profit'
  ];

  const handleExecute = () => {
    setIsExecuting(true);
    setExecutionStep(0);
    setSuccess(null);
    
    const interval = setInterval(() => {
      setExecutionStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setIsExecuting(false);
          setSuccess(Math.random() > 0.3); // 70% success rate
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Execute Arbitrage
          </DialogTitle>
          <DialogDescription>
            Execute the arbitrage opportunity across multiple DEXs
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                {index < executionStep ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : index === executionStep && isExecuting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted" />
                )}
                <span className={`text-sm ${
                  index <= executionStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
          
          {success !== null && (
            <Alert className={success ? 'border-green-500' : 'border-red-500'}>
              {success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                {success 
                  ? 'Trade executed successfully! Profit: $450.23'
                  : 'Trade failed due to insufficient liquidity. No funds lost.'
                }
              </AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={handleExecute} 
            disabled={isExecuting}
            className="w-full"
            variant={success === false ? 'destructive' : 'default'}
          >
            {isExecuting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : success === true ? (
              <CheckCircle className="h-4 w-4 mr-2" />
            ) : success === false ? (
              <XCircle className="h-4 w-4 mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {isExecuting ? 'Executing...' : success === true ? 'Success!' : success === false ? 'Failed' : 'Execute Trade'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface StrategyModalProps {
  trigger: React.ReactNode;
}

export const StrategyModal = ({ trigger }: StrategyModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Strategy Tips & Documentation
          </DialogTitle>
          <DialogDescription>
            Learn about arbitrage strategies and risk management
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What is Arbitrage?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Arbitrage is the practice of buying and selling identical assets in different markets 
                to profit from price differences. Our AI bot identifies these opportunities across DEXs.
              </p>
              <div className="space-y-2">
                <Badge variant="secondary">Risk Level: Low to Medium</Badge>
                <Badge variant="outline">Profit Range: 0.1% - 5%</Badge>
                <Badge variant="outline">Execution Time: 10-30 seconds</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">MEV Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Maximum Extractable Value (MEV) protection prevents front-running and sandwich attacks 
                by using private mempools and optimized transaction ordering.
              </p>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Always enable MEV protection for larger trades to avoid being front-run by bots.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Calculation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Liquidity Risk</span>
                  <Badge variant="outline">Low</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Slippage Risk</span>
                  <Badge variant="secondary">Medium</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Gas Price Risk</span>
                  <Badge variant="destructive">High</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Export individual components for backward compatibility
export { AnalyzeModal as InteractiveModals };